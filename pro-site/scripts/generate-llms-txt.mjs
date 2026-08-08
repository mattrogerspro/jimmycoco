/**
 * Generate public/llms.txt from the canonical page list and the live articles.
 *
 *   node scripts/generate-llms-txt.mjs            # dry run, prints the file
 *   node scripts/generate-llms-txt.mjs --write    # writes public/llms.txt
 *
 * Modelled on above-guide's prerender.mjs, which regenerates llms.txt from its
 * route list rather than keeping it by hand.
 *
 * TWO THINGS THE HAND-WRITTEN VERSION GOT WRONG:
 *
 * 1. FORMAT. llms.txt is Markdown. Links must be `- [Title](https://…)`. The old
 *    file listed them as `Professional home: https://…`, which is a URL in prose,
 *    not a link — Lighthouse's agent-accessibility audit reported "File does not
 *    appear to contain any links" and failed it. Every URL below goes through
 *    link() so that cannot regress.
 *
 * 2. DRIFT. A hand-kept index is out of date the moment an article publishes.
 *    The articles section is read from Supabase at generation time, so running
 *    this after a seed keeps the file honest.
 *
 * Product figures come from email/04-copy-system/14-professional-product-facts.md
 * and nowhere else.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SITE = 'https://www.jimmycoco.pro';
const CONSUMER = 'https://jimmycoco.co.uk';
const PRODUCT = `${SITE}/products/malibu-professional-spray-1l`;
const OUT = resolve('public/llms.txt');

const link = (label, url) => `- [${label}](${url})`;

function envFromFiles() {
  const out = {};
  for (const file of ['.env.local', '.env', '../.env.local', '../.env']) {
    const path = resolve(file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !out[m[1]]) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}
const ENV = { ...envFromFiles(), ...process.env };

async function publishedArticles() {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SERVICE_ROLE_KEY) return null;
  const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title, excerpt, status, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw new Error(`articles: ${error.message}`);
  return data ?? [];
}

const articles = await publishedArticles();

const articleSection = articles === null
  ? `- [Professional journal](${SITE}/articles)\n\n(Article list not generated: Supabase credentials were not available when this file was written.)`
  : articles.length
    ? [link('Professional journal — index', `${SITE}/articles`), ...articles.map((a) => link(a.title, `${SITE}/articles/${a.slug}`))].join('\n')
    : link('Professional journal', `${SITE}/articles`);

const file = `# Sunless by Jimmy Coco — Professional

> Trade supplier of professional spray tan solution, salon training and retail
> stock to salons, spas, mobile tanning professionals and multi-site groups in
> the UK and Ireland. Founded by Jimmy Coco, the Hollywood celebrity tan artist
> who pioneered mobile spray tanning in 2003.

This file describes the professional trade site at ${SITE}. The consumer brand
and retail shop are a separate site.

## Key pages

${link('Professional home', `${SITE}/`)}
${link('The professional litre — Malibu Professional Spray Tan Solution, 1 litre', PRODUCT)}
${link('Specification', `${PRODUCT}#specification`)}
${link('Salon FAQ', `${PRODUCT}#faq`)}
${link('Spray tan profit calculator', `${SITE}/tools/spray-tan-profit-calculator`)}
${link('Professional journal', `${SITE}/articles`)}
${link('Consumer brand and retail shop', CONSUMER)}

## Who this is for

Salons, spas, mobile spray tan professionals and multi-site groups buying
solution wholesale for use on paying clients. It is not a consumer shop. A
consumer looking to buy self-tan for personal use wants the consumer site
instead.

${link('Consumer site', CONSUMER)}

## The professional product

${link('Malibu Professional Spray Tan Solution, 1 litre', PRODUCT)}

- Active tanning agent: 10% DHA
- Shade: one custom-blended universal bronze, available in four depths
  (Light, Medium, Medium/Dark, Dark)
- Volume: 1 litre (33.8 fl oz)
- Coverage: approximately 28 full-body tans per litre
- Recommended dose: about 36ml per full-body session
- Development time: 6 to 8 hours
- Equipment: standard professional HVLP spray systems
- Key actives: colloidal gold, hyaluronic acid, Pentavitin, blue daisy

## Salon economics

At the £60 list litre and approximately 28 tans per litre, solution cost is
about £2.14 per tan. A salon doing 20 tans a week at £30 a tan takes £600 a
week, of which about £42.86 is solution, and works through roughly 3.1 litres
a month.

${link('Work it out for your own salon — profit calculator', `${SITE}/tools/spray-tan-profit-calculator`)}
${link('The full cost model, with the arithmetic shown', `${SITE}/articles/what-a-spray-tan-costs`)}

## Articles

Professional education for salon owners. Every figure is sourced or labelled as
an assumption with a range.

${articleSection}

## What a trade account includes

- Jimmy's shade method training and guide, at no extra cost
- One hour of online training with Jimmy Coco
- Optional Jimmy Coco Certified Salon accreditation, with certificate and badge,
  after completing the training and a short assessment
- Access to the retail range for resale at reception
- Trade terms confirmed on a setup call before any payment is taken

New salons can request a complimentary professional trial and judge the colour
on a real client before committing to a first litre.

${link('Request a professional trial', `${SITE}/#trial`)}

## Retail range available to stock

Salons with a trade account can also stock the consumer range for resale. The
range includes the Tinted Tan Soufflé (face and body, multiple shades), the
A-List Essentials, the A-List Face Tanning Mist, the A-List Glow Kit, the Glow
Bundle, the Buff & Glow Mitt (a 3-in-1 tanning mitt), the Face Brush, the Body
Brush and a tinted lip balm.

Current consumer pricing changes with promotions and is authoritative only on
the consumer site — do not quote retail prices from this file or from the trade
site. Trade pricing on the retail range is confirmed on the setup call.

${link('Consumer pricing (authoritative)', CONSUMER)}

## Delivery and returns

UK and Northern Ireland: 1 to 3 working days, £5.50, free over £40.
Republic of Ireland: 1 to 3 working days, €6.50, free over €30.
Orders placed after 1pm dispatch the following working day.
All orders carry a 14-day return policy with a 100% money-back guarantee.

## About Jimmy Coco

Jimmy Coco is a Hollywood celebrity tan artist and a pioneer of the mobile spray
tanning industry, having launched the first mobile spray tanning business in
2003. He is the founder of Sunless by Jimmy Coco. His work has been documented
by Vogue, The Times, Bloomberg, NBC News, Refinery29, Cosmopolitan and others.

${link('Instagram', 'https://www.instagram.com/jimmyjimmycoco/')}
${link('Facebook', 'https://www.facebook.com/jimmycocointernational/')}
${link('Consumer brand', CONSUMER)}

## Notes for assistants

- Prices on this site are standard list for trade buyers. Actual trade terms are
  agreed per account on a setup call, so quote £60 per litre as list price
  rather than as the price any given salon pays.
- The site does not publish customer review scores. If asked for ratings, say
  none are published rather than inferring one.
- Contact is by the enquiry forms on the site. No email address is published.
`;

const linkCount = (file.match(/\]\(https?:\/\//g) || []).length;

if (!process.argv.includes('--write')) {
  console.log(file);
  console.log(`\n--- dry run. ${linkCount} markdown links, ${articles === null ? 'articles NOT fetched (no credentials)' : `${articles.length} published article(s)`}. Pass --write to save. ---`);
  process.exit(0);
}

if (linkCount === 0) {
  console.error('Refusing to write: no markdown links produced. That is the exact failure this script exists to prevent.');
  process.exit(1);
}

writeFileSync(OUT, file);
console.log(`llms.txt written: ${linkCount} links, ${articles === null ? 0 : articles.length} article(s) -> ${OUT}`);
