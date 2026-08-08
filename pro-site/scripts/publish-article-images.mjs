/**
 * Optimise the generated article images, build a responsive ladder, upload, and
 * attach them as covers.
 *
 *   node scripts/publish-article-images.mjs                # dry run, prints the plan
 *   node scripts/publish-article-images.mjs --write        # do it
 *   node scripts/publish-article-images.mjs --write --only tans-per-litre
 *   node scripts/publish-article-images.mjs --write --force  # re-encode everything
 *
 * Run from pro-site/, after scripts/generate-article-images.mjs has produced
 * PNGs in public/img/articles/.
 *
 * This is above-guide's optimize-images.mjs + generate-responsive-images.mjs
 * folded into one, because here the two halves cannot be separated: article
 * covers live in SUPABASE STORAGE, so every variant has to be uploaded, not just
 * written to disk.
 *
 *   public/img/articles/<name>.png            master, from the generator
 *     -> <name>.webp                          optimised master
 *     -> <name>-480.webp … <name>-2560.webp   the ladder
 *
 *   hero frames (slug: null)  stay on disk and are served from public/
 *   article covers            master + ladder uploaded to the article-media
 *                             bucket, then articles.cover_media_id is pointed
 *                             at the master's article_media row
 *
 * THE MANIFEST IS NOT OPTIONAL. app/data/responsive-images.json records which
 * widths actually exist for each image, and app/lib/responsive-image.ts reads it
 * to build srcset. above-guide learned this the hard way twice:
 *
 *   1. Advertising a fixed set of widths meant any image narrower than the
 *      largest advertised a URL that 404s. The browser picks exactly that
 *      candidate on a wide viewport, the <img> errors, and the picture vanishes.
 *   2. Leaving the master out of the srcset capped the largest candidate below
 *      the master's true width, so with sizes="100vw" every desktop and retina
 *      screen upscaled a smaller file. Heroes looked soft and it had nothing to
 *      do with the quality setting.
 *
 * Both fixes are carried over: real widths only, and the master offered as the
 * largest candidate at its true width.
 *
 * Requires sharp:  pnpm add -D sharp
 *
 * Idempotent. A variant whose master has not changed is skipped; --force
 * re-encodes the lot, for a quality change.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const MAX_WIDTH = 2560;
const MASTER_QUALITY = 80;
const BUCKET = 'article-media';
const DIR = resolve('public/img/articles');
const MANIFEST = resolve('app/data/responsive-images.json');

/* Roughly 1.3x apart — close enough that the browser never stretches a candidate
   far, without producing so many files that the repo balloons. */
const WIDTHS = [480, 768, 1200, 1600, 2048, 2560];

/* Large variants are only ever chosen by high-DPR screens, where one image pixel
   covers a quarter of a CSS pixel and artefacts are far harder to see. Dropping
   quality at the top of the ladder saves real weight for no visible loss. */
const qualityFor = (width) => (width >= 2048 ? 60 : width >= 1600 ? 66 : 72);

/* Derived from WIDTHS so it can never drift: a width added above but missing
   here would make the walk treat a generated file as a master and produce
   foo-1600-480.webp on the next run. */
const GENERATED_SUFFIX = new RegExp(`-(${WIDTHS.join('|')})$`);

// --- what each image is ------------------------------------------------------
// slug null = not an article cover; stays on disk, served from public/.
const IMAGES = {
  'journal-hero-1': { slug: null, alt: '' },
  'journal-hero-2': { slug: null, alt: '' },
  'journal-hero-3': { slug: null, alt: '' },
  'journal-hero-4': { slug: null, alt: '' },
  'journal-hero-5': { slug: null, alt: '' },
  'what-a-spray-tan-costs': {
    slug: 'what-a-spray-tan-costs',
    alt: 'An empty salon spray tanning room between clients, late afternoon light across the floor, the tent open and unoccupied.',
  },
  'tans-per-litre': {
    slug: 'tans-per-litre',
    alt: 'A litre of Sunless by Jimmy Coco professional solution beside a receding line of filled spray gun cups.',
  },
  'what-to-charge-for-a-spray-tan': {
    slug: 'what-to-charge-for-a-spray-tan',
    alt: 'A blank price card in a brass holder on a salon counter, a pen beside it, a litre of professional solution behind.',
  },
  'mobile-spray-tan-profit': {
    slug: 'mobile-spray-tan-profit',
    alt: 'The open boot of a car at dusk packed with mobile spray tanning kit — tent bag, gun case, towels and a litre of solution.',
  },
  'retail-attach-maths': {
    slug: 'retail-attach-maths',
    alt: 'A sparse salon retail shelf with one clear gap where a product has been sold.',
  },
};

// --- env ---------------------------------------------------------------------
function envFromFiles() {
  const out = {};
  for (const file of ['.env.local', '.env', '../.env.local', '../.env']) {
    const path = resolve(file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !out[match[1]]) out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}
const ENV = { ...envFromFiles(), ...process.env };
const SUPABASE_URL = ENV.SUPABASE_URL;
const SERVICE_KEY = ENV.SUPABASE_SERVICE_ROLE_KEY;

const WRITE = process.argv.includes('--write');
const FORCE = process.argv.includes('--force');
const onlyArg = process.argv[process.argv.indexOf('--only') + 1];
const ONLY = process.argv.includes('--only') ? new Set(onlyArg.split(',')) : null;

const isCurrent = (source, output) => {
  if (FORCE || !existsSync(output)) return false;
  try {
    return statSync(output).mtimeMs >= statSync(source).mtimeMs;
  } catch {
    return false;
  }
};

// --- step 1: master ----------------------------------------------------------
async function master(name) {
  const png = join(DIR, `${name}.png`);
  const webp = join(DIR, `${name}.webp`);
  if (!existsSync(png)) {
    if (!existsSync(webp)) return null;
    const meta = await sharp(webp).metadata();
    return { path: webp, width: meta.width, converted: false };
  }
  if (!isCurrent(png, webp)) {
    const meta = await sharp(png).metadata();
    const pipeline = sharp(png).rotate();
    if (meta.width && meta.width > MAX_WIDTH) pipeline.resize({ width: MAX_WIDTH });
    await pipeline.webp({ quality: MASTER_QUALITY, effort: 6 }).toFile(webp);
  }
  const meta = await sharp(webp).metadata();
  return { path: webp, width: meta.width, converted: true, from: statSync(png).size, to: statSync(webp).size };
}

// --- step 2: the ladder ------------------------------------------------------
/** Never upscales, so widths at or above the master are skipped. The manifest
 *  records only what was actually produced. */
async function ladder(name, sourcePath, sourceWidth) {
  const made = [];
  for (const width of WIDTHS) {
    if (!sourceWidth || width >= sourceWidth) continue;
    const output = join(DIR, `${name}-${width}.webp`);
    if (!isCurrent(sourcePath, output)) {
      await sharp(sourcePath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: qualityFor(width), effort: 5, smartSubsample: true })
        .toFile(output);
    }
    made.push(width);
  }
  return made;
}

// --- step 3: upload + attach -------------------------------------------------
async function upload(supabase, storagePath, filePath, contentType = 'image/webp') {
  const body = readFileSync(filePath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, body, { contentType, upsert: true });
  if (error) throw new Error(`upload ${storagePath}: ${error.message}`);
  return body.length;
}

async function attach(supabase, name, entry, masterPath, masterWidth) {
  const storagePath = `articles/${name}.webp`;
  const body = readFileSync(masterPath);
  const meta = await sharp(body).metadata();

  await upload(supabase, storagePath, masterPath);

  const { data: media, error: mediaError } = await supabase
    .from('article_media')
    .upsert(
      {
        bucket_id: BUCKET,
        storage_path: storagePath,
        alt_text: entry.alt,
        title: name,
        mime_type: 'image/webp',
        size_bytes: body.length,
        width: meta.width ?? null,
        height: meta.height ?? null,
        is_public: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'storage_path' },
    )
    .select('id')
    .single();
  if (mediaError) throw new Error(`article_media: ${mediaError.message}`);

  const { data: updated, error: articleError } = await supabase
    .from('articles')
    .update({ cover_media_id: media.id })
    .eq('slug', entry.slug)
    .select('slug')
    .maybeSingle();
  if (articleError) throw new Error(`articles: ${articleError.message}`);
  if (!updated) throw new Error(`no article with slug "${entry.slug}" — seed it first`);

  return storagePath;
}

// --- run ---------------------------------------------------------------------
const names = Object.keys(IMAGES).filter((n) => !ONLY || ONLY.has(n));
const present = existsSync(DIR) ? new Set(readdirSync(DIR)) : new Set();

console.log(`\narticle images — ${names.length} file(s)${WRITE ? '' : '  (dry run, pass --write to publish)'}\n`);
for (const name of names) {
  const has = present.has(`${name}.png`) ? 'png' : present.has(`${name}.webp`) ? 'webp' : 'MISSING';
  const dest = IMAGES[name].slug ? `-> cover of /articles/${IMAGES[name].slug}` : '-> static, index hero';
  console.log(`  ${has.padEnd(7)} ${name.padEnd(32)} ${dest}`);
}

if (!WRITE) {
  console.log(`\nladder:      ${WIDTHS.join(', ')} (never upscaled)`);
  console.log(`manifest:    ${MANIFEST}`);
  console.log(`bucket:      ${BUCKET}`);
  console.log(`supabase:    ${SUPABASE_URL ? 'url found' : 'SUPABASE_URL MISSING'} · ${SERVICE_KEY ? 'service key found' : 'SERVICE KEY MISSING'}`);
  console.log('\nNothing changed. Re-run with --write.');
  process.exit(0);
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('\nSUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

/* The manifest is rebuilt from every image on every run, not just the ones in
   --only. Scoping it would blank the srcset for everything else. */
const manifest = {};
let done = 0;
let failed = 0;

console.log('');
for (const name of Object.keys(IMAGES)) {
  const entry = IMAGES[name];
  const selected = !ONLY || ONLY.has(name);
  if (selected) process.stdout.write(`  ${name.padEnd(32)} `);

  try {
    const m = await master(name);
    if (!m) {
      if (selected) console.log('skipped — no png or webp on disk');
      continue;
    }

    const widths = await ladder(name, m.path, m.width);

    if (entry.slug) {
      const storagePath = selected ? await attach(supabase, name, entry, m.path, m.width) : `articles/${name}.webp`;
      if (selected) {
        for (const width of widths) {
          await upload(supabase, `articles/${name}-${width}.webp`, join(DIR, `${name}-${width}.webp`));
        }
      }
      manifest[`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`] = { w: widths, s: m.width };
    } else {
      manifest[`/img/articles/${name}.webp`] = { w: widths, s: m.width };
    }

    if (selected) {
      const saved = m.converted && m.from ? `${(m.from / 1024 / 1024).toFixed(1)}MB -> ${(m.to / 1024).toFixed(0)}KB` : 'master current';
      const where = entry.slug ? `uploaded + attached to ${entry.slug}` : 'on disk for the index hero';
      console.log(`${saved} · ${widths.length} variants · ${where}`);
      done += 1;
    }
  } catch (error) {
    if (selected) { failed += 1; console.log(`FAILED  ${error.message}`); }
  }
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n${done} done, ${failed} failed.`);
console.log(`Manifest written: ${Object.keys(manifest).length} image(s) -> ${MANIFEST}`);
console.log('Covers are live immediately (read from Supabase). The index hero frames and the');
console.log('manifest are build inputs, so those need a deploy.');
