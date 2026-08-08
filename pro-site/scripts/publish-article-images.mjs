/**
 * Optimise the generated article images, upload them, and attach them as covers.
 *
 *   node scripts/publish-article-images.mjs                # dry run, prints the plan
 *   node scripts/publish-article-images.mjs --write        # optimise, upload, attach
 *   node scripts/publish-article-images.mjs --write --only tans-per-litre
 *
 * Run from pro-site/, after scripts/generate-article-images.mjs has produced
 * PNGs in public/img/articles/.
 *
 * This is the jimmycoco equivalent of above-guide's optimize-images.mjs +
 * generate-responsive-images.mjs, but the last step is genuinely different.
 * above-guide serves images as static files out of public/, so "publishing" is
 * just leaving the webp on disk. Here, article covers live in SUPABASE STORAGE
 * and attach to an article through a row in article_media:
 *
 *   storage bucket 'article-media'  ->  article_media row  ->  articles.cover_media_id
 *
 * articles.server.ts reads cover_url off that join, so an image that is not
 * uploaded and attached simply does not appear, however good it looks on disk.
 *
 * The journal hero is the exception: it dresses the /articles index page rather
 * than an article, so it stays a static file in public/img/articles/ and is
 * never uploaded.
 *
 * Requires sharp:  npm i -D sharp
 *
 * Idempotent. Re-running re-optimises from the PNG if one is still there,
 * upserts the same storage path, and re-points the same cover. Safe to repeat.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const MAX_WIDTH = 2400;
const QUALITY = 82;
const BUCKET = 'article-media';
const DIR = resolve('public/img/articles');

// --- what each image is, and what it says to a screen reader -----------------
// `slug` null means it is not an article cover — it stays on disk.
const IMAGES = {
  // The five index-hero frames stay on disk and crossfade on /articles.
  // slug null = optimised to webp, never uploaded, never attached.
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
const onlyArg = process.argv[process.argv.indexOf('--only') + 1];
const ONLY = process.argv.includes('--only') ? new Set(onlyArg.split(',')) : null;

// --- step 1: optimise --------------------------------------------------------
async function optimise(name) {
  const png = join(DIR, `${name}.png`);
  const webp = join(DIR, `${name}.webp`);
  if (!existsSync(png)) return existsSync(webp) ? { webp, converted: false } : null;

  const meta = await sharp(png).metadata();
  const pipeline = sharp(png).rotate();
  if (meta.width && meta.width > MAX_WIDTH) pipeline.resize({ width: MAX_WIDTH });
  await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(webp);
  return { webp, converted: true, from: statSync(png).size, to: statSync(webp).size };
}

// --- step 2 + 3: upload, then attach ----------------------------------------
async function publish(supabase, name, entry, webp) {
  const storagePath = `articles/${name}.webp`;
  const body = readFileSync(webp);
  const meta = await sharp(body).metadata();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, body, { contentType: 'image/webp', upsert: true });
  if (uploadError) throw new Error(`upload: ${uploadError.message}`);

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

  if (!entry.slug) return { mediaId: media.id, attached: false };

  const { data: updated, error: articleError } = await supabase
    .from('articles')
    .update({ cover_media_id: media.id })
    .eq('slug', entry.slug)
    .select('slug')
    .maybeSingle();
  if (articleError) throw new Error(`articles: ${articleError.message}`);
  if (!updated) throw new Error(`no article with slug "${entry.slug}" — seed it first`);

  return { mediaId: media.id, attached: true };
}

// --- run ---------------------------------------------------------------------
const names = Object.keys(IMAGES).filter((n) => !ONLY || ONLY.has(n));

console.log(`\narticle images — ${names.length} file(s)${WRITE ? '' : '  (dry run, pass --write to publish)'}\n`);

const present = existsSync(DIR) ? new Set(readdirSync(DIR)) : new Set();
for (const name of names) {
  const has = present.has(`${name}.png`) ? 'png' : present.has(`${name}.webp`) ? 'webp' : 'MISSING';
  const dest = IMAGES[name].slug ? `-> cover of /articles/${IMAGES[name].slug}` : '-> static, index hero only';
  console.log(`  ${has.padEnd(7)} ${name.padEnd(32)} ${dest}`);
}

if (!WRITE) {
  console.log(`\nsource dir:  ${DIR}`);
  console.log(`bucket:      ${BUCKET}`);
  console.log(`supabase:    ${SUPABASE_URL ? 'url found' : 'SUPABASE_URL MISSING'} · ${SERVICE_KEY ? 'service key found' : 'SUPABASE_SERVICE_ROLE_KEY MISSING'}`);
  console.log('\nNothing has been changed. Re-run with --write.');
  process.exit(0);
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('\nSUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

console.log('');
let done = 0;
let failed = 0;
for (const name of names) {
  const entry = IMAGES[name];
  process.stdout.write(`  ${name.padEnd(32)} `);
  try {
    const optimised = await optimise(name);
    if (!optimised) {
      console.log('skipped — no png or webp on disk');
      continue;
    }
    const saved = optimised.converted
      ? `${(optimised.from / 1024 / 1024).toFixed(1)}MB png -> ${(optimised.to / 1024).toFixed(0)}KB webp`
      : 'webp already present';

    if (!entry.slug) {
      console.log(`${saved} · left on disk for the index hero`);
      done += 1;
      continue;
    }

    const result = await publish(supabase, name, entry, optimised.webp);
    console.log(`${saved} · uploaded · attached to ${entry.slug}`);
    done += 1;
  } catch (error) {
    failed += 1;
    console.log(`FAILED  ${error.message}`);
  }
}

console.log(`\n${done} done, ${failed} failed.`);
if (done) {
  console.log('Covers are live immediately — they are read from Supabase, so no redeploy is needed.');
  console.log('The index hero is a static file and DOES need a deploy to appear.');
}
