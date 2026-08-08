/**
 * Generate the article hero image set on Replicate.
 *
 *   node scripts/generate-article-images.mjs                 # dry run, prints the plan
 *   node scripts/generate-article-images.mjs --write         # generates and saves
 *   node scripts/generate-article-images.mjs --write --only tans-per-litre,journal
 *
 * Run from pro-site/. One script, one registry: every shot's prompt and
 * references live in SHOTS below. A new article adds an entry — do not write a
 * second script.
 *
 * Modelled directly on above-guide-site/scripts/generate-bundle-images.mjs,
 * which is the version of this that works. The same four traps apply, plus one
 * that is specific to putting a real product in frame:
 *
 * 1. REFERENCES GO AS DATA URLS, READ OFF DISK. Replicate's input validator
 *    fetches image_input URLs server-side, and it does not reliably reach every
 *    host. Local files posted as data URLs always work. They are also far too
 *    large to pass through an MCP tool call, which is why this has to be a
 *    script run on your machine rather than something the assistant can do
 *    conversationally.
 *
 * 2. GROUNDING IS THE WHOLE GAME. Ungrounded — or grounded on one weak
 *    reference and a prose description of the label — the model REDESIGNS the
 *    product. Observed failures on this project: a label reading "SHAMPOO &
 *    BODY WASH", a label reading "SUNKISSED GLOW", the brown band moved to
 *    cover the whole lower half of the bottle, and a spray gun rendered as a
 *    hair styling tool. Never describe the label in words. Show it, twice, and
 *    pin it hard with PIN below.
 *
 * 3. TWO REFERENCES PER SHOT, minimum — one square-on, one at an angle. A
 *    single reference gives the model too much licence on the faces it cannot
 *    see.
 *
 * 4. PNG, not JPG, and output lands in public/img/articles/.
 *
 * 5. The token lives in .env.local, which Vite loads but node does not.
 *
 * After a successful run, convert to webp and point each article's cover_url at
 * /img/articles/<slug>.webp.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

// --- token -------------------------------------------------------------------
function tokenFromEnvFiles() {
  for (const file of ['.env.local', '.env', '../.env.local', '../.env']) {
    const path = resolve(file);
    if (!existsSync(path)) continue;
    const match = readFileSync(path, 'utf8').match(/^\s*REPLICATE_API_TOKEN\s*=\s*(.+)\s*$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return '';
}
const TOKEN = process.env.REPLICATE_API_TOKEN || tokenFromEnvFiles();

const REF_DIR = resolve('scripts/article-image-refs');
const OUT_DIR = resolve('public/img/articles');

// --- the two constants that do the work --------------------------------------

/** Pinned to every prompt. This is what stops the model redesigning the bottle. */
const PIN = `CRITICAL: the bottle must match the reference images EXACTLY — the same silhouette and proportions, the same domed screw cap, the same cream-white body, the same brown label band wrapping only the MIDDLE of the bottle with plain cream plastic clearly visible both above and below it, the same label artwork, the same typography, the same wording. Do not restyle the bottle. Do not redesign, re-letter, translate or paraphrase the label. Do not add a QR code or barcode. Do not change the proportions of the band. Natural documentary photography, high detail, no watermarks.`;

/** Everything that must never appear. */
const STRIP = `**No text, lettering, numerals or signage anywhere in the frame except the product's own label. No price tags or price boards. No packaging copy on any other item. No vehicle registration plates or manufacturer badges. No charts, graphs, coins, banknotes or calculators. No people, hands or faces.**`;

/** Shared look. Keeps the set feeling like one photographer, one afternoon. */
const LOOK = `Editorial photography, warm and quietly premium. Natural directional daylight, soft falloff, gentle warm-bounced shadows, no hard flash and no studio strobe look. Palette restricted to warm neutrals — ivory, linen, warm off-white, mineral stone, pale sand, champagne, muted bronze — with charcoal for the darkest values, never pure black and never cool grey or blue. Realistic surface texture, colour-graded warm and slightly desaturated, film-like. No HDR, no digital over-sharpening, no lens flare.`;

// --- references --------------------------------------------------------------
// Real photographs of the actual product, on disk. Both were checked by eye
// against the bottle before being trusted.
// BOTH must be the PROFESSIONAL litre — cream bottle, BROWN band round the
// middle. A black-labelled bottle exists in the asset library and is a
// DIFFERENT product; grounding on it produced black-labelled renders and cost a
// full round of generations. Check any new reference by eye before adding it.
const REFERENCES = {
  'pro-litre-front': 'ref-pro-litre-front.jpg',   // square-on, label fully readable
  'pro-litre-second': 'ref-pro-litre-second.jpg', // same bottle, rotated, full height
};

const PRO_REFS = ['pro-litre-front', 'pro-litre-second'];

// --- the registry ------------------------------------------------------------
// Composition and light only. The references carry the product.
const SHOTS = [
  {
    id: 'journal',
    file: 'journal-hero',
    refs: PRO_REFS,
    aspect: '16:9',
    prompt: `A professional spray tanning room in a UK salon, mid-afternoon, photographed from the doorway. A stainless treatment trolley in the foreground carries the bottle from the reference images and a spray gun resting in its cradle, hose coiled loosely. An open pop-up tanning tent stands behind, ivory fabric catching low window light. Folded cream towels on a stool. Pale wood floor, warm off-white walls, long raking shadows. Composition weighted left, warm empty space to the right for a masthead. ${LOOK} Full-frame 35mm at f/2.8, eye level. ${PIN} ${STRIP}`,
  },
  {
    id: 'what-a-spray-tan-costs',
    file: 'what-a-spray-tan-costs',
    refs: PRO_REFS,
    aspect: '16:9',
    prompt: `An empty professional spray tanning room between clients, late afternoon, nobody in it. An open pop-up tanning tent stands to one side, unoccupied. A stainless trolley holds the bottle from the reference images and a spray gun in its cradle. A single folded towel waits on a stool. Long low sun rakes across a pale wood floor from a window out of frame, and the room is completely still. The emptiness is the subject — a room costing money with nobody in it. Composition weighted left, warm shadow to the right for a headline. ${LOOK} Full-frame 35mm at f/2.8, eye level, camera set back so the room reads small. ${PIN} ${STRIP}`,
  },
  {
    id: 'tans-per-litre',
    file: 'tans-per-litre',
    refs: PRO_REFS,
    aspect: '16:9',
    prompt: `The bottle from the reference images standing on a pale travertine counter, with a neat receding line of small clear plastic spray-gun solution cups running away from it into shallow focus, each holding a shallow measure of amber tanning solution. The repeating line of identical cups makes the bottle's yield visible — one litre divided into treatments. Window backlight makes the solution in the cups glow warm amber. Clean and almost diagrammatic, but still warm. Bottle weighted left, cups receding right. ${LOOK} Full-frame 85mm at f/2.8, low angle just above counter height. The cups are plain, unmarked laboratory-style measuring cups with no printed scale, numerals or graduations. ${PIN} ${STRIP}`,
  },
  {
    id: 'what-to-charge-for-a-spray-tan',
    file: 'what-to-charge-for-a-spray-tan',
    refs: PRO_REFS,
    aspect: '16:9',
    prompt: `A salon reception counter in warm afternoon light. Sharp in the foreground stands a small price card in a slim brushed-brass card holder — thick warm-white cotton stock with a deckled edge, and it is completely blank, no writing or printing of any kind on it. An uncapped fountain pen lies beside it as though just set down. Behind, softly out of focus, the bottle from the reference images stands on the counter. The blank card is the subject: a decision not yet made. Card weighted right, clean empty counter to the left for a headline. ${LOOK} Full-frame 85mm at f/2.5, close and low so the card dominates and the bottle falls away behind it. The card must remain entirely blank. ${PIN} ${STRIP}`,
  },
  {
    id: 'mobile-spray-tan-profit',
    file: 'mobile-spray-tan-profit',
    refs: PRO_REFS,
    aspect: '16:9',
    prompt: `The open boot of a small estate car on a quiet British residential street at dusk, tailgate raised, packed for a mobile spray tanning job. Inside, neatly stowed: a long padded black nylon carry bag for a folding tanning tent, a hard plastic equipment case for the spray gun, a stack of folded cream towels, a collapsible step stool, and the bottle from the reference images wedged upright with its label facing camera. The boot lamp throws a warm pool over the kit against the cooling blue of the street behind. Beyond the car, out of focus, terraced houses and one lit front window. Damp tarmac holds a faint reflection. Kit weighted right, darker street left for a headline. ${LOOK} The only cool tone permitted is the dusk beyond the car; the boot interior stays warm. Full-frame 35mm at f/2.5, standing height looking down into the boot. ${PIN} ${STRIP}`,
  },
  {
    id: 'retail-attach-maths',
    file: 'retail-attach-maths',
    refs: PRO_REFS,
    aspect: '16:9',
    prompt: `A narrow salon retail shelf on a warm off-white wall, styled sparsely. The bottle from the reference images stands at the left end. Along the rest of the shelf, three plain unbranded cream cosmetic containers — a frosted glass jar, a matte tube and a small ribbed tub — evenly spaced, none of them carrying any printing at all. There is one clear GAP in the line where a container has obviously been taken, with a faint clean ring left in the dust on the pale timber. A sprig of dried eucalyptus at the far end. Warm late-afternoon window light rakes from the left and picks out the ring in the dust. Below the shelf the wall falls into warm shadow. The gap is the subject — a sale that has just happened. Do not fill the gap. Products weighted left, gap and clean shelf to the right for a headline. ${LOOK} Full-frame 85mm at f/2.8, straight on, slightly below shelf height. ${PIN} ${STRIP}`,
  },
];

// --- plumbing ----------------------------------------------------------------
const WRITE = process.argv.includes('--write');
const onlyArg = process.argv[process.argv.indexOf('--only') + 1];
const ONLY = process.argv.includes('--only') ? new Set(onlyArg.split(',')) : null;

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const dataUrl = (key) => {
  const filename = REFERENCES[key];
  if (!filename) throw new Error(`unknown reference: ${key}`);
  const path = join(REF_DIR, filename);
  if (!existsSync(path)) throw new Error(`missing reference file: ${path}`);
  const mime = MIME[extname(filename).toLowerCase()];
  if (!mime) throw new Error(`unsupported reference type: ${filename}`);
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`;
};

async function generate(shot) {
  const res = await fetch('https://api.replicate.com/v1/models/google/nano-banana-pro/predictions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify({
      input: {
        prompt: shot.prompt,
        image_input: shot.refs.map(dataUrl),
        aspect_ratio: shot.aspect,
        resolution: '2K',
        output_format: 'png',
        safety_filter_level: 'block_only_high',
      },
    }),
  });

  let prediction = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(prediction)}`);

  while (['starting', 'processing'].includes(prediction.status)) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(prediction.urls.get, { headers: { Authorization: `Bearer ${TOKEN}` } });
    prediction = await poll.json();
  }
  if (prediction.status !== 'succeeded') throw new Error(`${prediction.status}: ${prediction.error || 'no output'}`);

  const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  const image = await fetch(output);
  mkdirSync(OUT_DIR, { recursive: true });
  const target = join(OUT_DIR, `${shot.file}.png`);
  writeFileSync(target, Buffer.from(await image.arrayBuffer()));
  return target;
}

// --- run ---------------------------------------------------------------------
const queue = SHOTS.filter((s) => !ONLY || ONLY.has(s.id));

console.log(`\narticle images — ${queue.length} shot(s)${WRITE ? '' : '  (dry run, pass --write to generate)'}\n`);
for (const shot of queue) {
  console.log(`  ${shot.id.padEnd(32)} -> ${shot.file}.png   refs: ${shot.refs.join(', ')}`);
}

if (!WRITE) {
  console.log(`\nreferences dir: ${REF_DIR}`);
  for (const [key, file] of Object.entries(REFERENCES)) {
    console.log(`  ${existsSync(join(REF_DIR, file)) ? 'ok     ' : 'MISSING'} ${key} -> ${file}`);
  }
  console.log(`\noutput dir:     ${OUT_DIR}`);
  console.log(`token:          ${TOKEN ? 'found' : 'NOT FOUND — set REPLICATE_API_TOKEN in .env.local'}`);
  process.exit(0);
}

if (!TOKEN) {
  console.error('No REPLICATE_API_TOKEN. Set it in .env.local or the environment.');
  process.exit(1);
}

console.log('');
let failed = 0;
for (const shot of queue) {
  process.stdout.write(`  ${shot.id.padEnd(32)} `);
  try {
    const target = await generate(shot);
    console.log(`ok  -> ${target}`);
  } catch (error) {
    failed += 1;
    console.log(`FAILED  ${error.message}`);
  }
}

console.log(`\n${queue.length - failed}/${queue.length} generated into ${OUT_DIR}`);
console.log('Check every label by eye before using any of them. The model still gets it wrong sometimes.');
