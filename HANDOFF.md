# Session handoff — Sunless by Jimmy Coco

**Date:** 8 August 2026
**Purpose:** continue the content strategy work in a fresh chat with Firecrawl enabled.
**Repo:** `~/mnt/jimmycoco` (the pro site is `pro-site/`, the email playbook is `email/`)

Read this whole file before starting. The most valuable thing in it is section 4 —
research that took three parallel agents and ~340k tokens to produce. **Do not
re-run that research.** Firecrawl credits should go on new ground, not on
rediscovering what is already recorded here.

---

## 1. Where things stand

Two workstreams completed this session.

**A. SEO and AI-retrievability audit of www.jimmycoco.pro, plus 10 fixes.** All
committed (HEAD is `01cb892 Update`, working tree clean). Detail in section 3.

**B. A content strategy for a salon-owner education programme.** Delivered as an
artifact, `jimmycoco-content-strategy`, and summarised in section 5. Five
decisions are outstanding before implementation can start — section 6.

**The immediate next task** is section 7: build the `content/` repository system
and the first article pipeline folder end to end.

---

## 2. Things to know before touching anything

- **The repo has its own rules.** Read `CLAUDE.md` at the root first. Highlights:
  never `git add -A`; never publish Resend templates or send email without fresh
  explicit approval; the repository owns campaign truth, so edit structured
  source and regenerate HTML rather than hand-editing generated output.
- **The build is NOT broken — corrected 8 Aug 2026.** An earlier note here
  claimed a missing `@rolldown/binding-linux-arm64-gnu` binding and advised
  reinstalling `node_modules`. That was wrong, and following it would have
  thrown away a correct install. `pro-site/node_modules` holds
  `@rolldown/binding-darwin-arm64` — right for Matt's Mac, along with
  darwin-arm64 builds of esbuild, rollup and lightningcss. The error only
  appears when an agent runs the build through the device bridge, which
  executes as Linux aarch64 against a macOS install and therefore looks for a
  Linux binding that should not be there. `npm run build` and
  `npm run typecheck` work fine on the machine itself.
- **Verify in a browser, not by reading code.** Several problems this session were
  only visible in the rendered page — a dangling schema reference, a layout
  regression, a robots.txt that parsed differently than it read. Playwright
  against a local `react-router-serve` build is the pattern that worked.
- **Do not state unverified claims as fact.** This is a hard rule for this brand
  now, for a specific reason — see section 3, item 2, and section 5's evidence
  standard.

---

## 3. What changed on the pro site

Ten audit items, all done and committed.

| # | Change | Files |
|---|---|---|
| 1 | Removed 3 confidential commercial reports from `public/` — they were live and crawlable, containing real revenue figures. Moved to `public/_to_delete/leaked-reports/` | `public/` |
| 2 | Deleted fabricated review data: an `aggregateRating` claiming 4.9 from 1,842 reviews, a visible "4.9 out of 5 · 1,842 verified reviews" row, three invented testimonials labelled "Verified customer reviews", and two mitt star ratings | `product.tsx`, `ProductPurchase.tsx`, `ProductSections.tsx`, `HomeSections.tsx` |
| 3 | Removed `pro@jimmycoco.co.uk` from the Organization JSON-LD and the footer | `home.tsx`, `SiteChrome.tsx` |
| 4 | AI crawler policy in `robots.txt` — three groups, retrieval agents and training crawlers both allowed deliberately, all six disallows repeated per group | `public/robots.txt` |
| 5 | Entity graph: `app/lib/entity.ts` with stable `@id`s for Jimmy (Person) and the brand (Organization), 4 brand profiles in `sameAs`, 12 press citations in `subjectOf` | `entity.ts` + 3 routes |
| 6 | FAQ: 12 questions with `FAQPage` markup, single-source array | `app/lib/faq.ts` |
| 7 | Product schema completed — `sku`, `availability`, `itemCondition`, `priceValidUntil` | `product.tsx` |
| 8 | `llms.txt` at the site root | `public/llms.txt` |
| 9 | Specification table, 15 rows + 3 worked economics examples in crawlable prose | `app/lib/specs.ts` |
| 10 | Title length, `x-default` hreflang, image dimensions, `dateModified`, sitemap `lastmod` | several |

**Two structural patterns were established and should be followed.**

*Single-source generation.* `faq.ts` and `specs.ts` each generate both the visible
page content and the JSON-LD from one array. Never hand-write both — that
divergence is exactly what produced the fake ratings.

*Build-time content date.* `vite.config.ts` resolves `__CONTENT_UPDATED__` from
`git log -1 --format=%cs -- app/routes app/components app/styles`, falling back to
the build date. `CONTENT_UPDATED` in `app/lib/site.ts` reads it. Nothing to
remember to bump.

**Also fixed:** pre-existing horizontal overflow across the site. The home page
was scrolling sideways at every width (804px wide on a 390px phone, 1386 at 1280)
— verified against a byte-identical reconstruction of the original CSS. Now clean
at 360px and up on all three pages. One known remainder: 320px on the home page,
3px over, from the trial form button. Not worth chasing.

**Still outstanding from the audit:** publishing articles (audit item 9) — which
is what the content strategy is for. `/articles` is live, indexed and empty, which
actively teaches Google the section is thin.

### The sitemap, since it came up

`app/routes/sitemap.ts`, registered in `app/routes.ts` as
`route("sitemap.xml", "routes/sitemap.ts")`. It is a **resource route, not a
file** — a loader with no component that queries Supabase and returns XML on
every request. Deliberately excluded from the `prerender` list in
`react-router.config.ts`, so a newly published article appears within the hour
(`s-maxage=3600`) without a redeploy. Hard limit of 1,000 articles before silent
truncation — irrelevant now, relevant if the education hub gets large.

---

## 4. Research already done — do not repeat

Three parallel research programmes. Full findings are in the conversation this
document came from; what follows is everything load-bearing.

### 4a. The competitive finding (this is the whole strategy)

**The UK category is empty.** Across ~50 searches on operational spray tan
questions a UK salon owner would ask:

- **SalonGeek** — a forum whose relevant threads run 2008–2018 — holds a
  **top-three position on roughly half of all operational queries**: tans per
  litre (4 of top 6), compressor choice (5 of top 8), COSHH, solution shelf life,
  patch test policy, bridal pricing, mobile profitability. It ranks because
  nothing else exists.
- Where it does not rank, **US brands do** — Sjolie, Norvell, ArtesianTan,
  SprayTanClass — in dollars, under US regulation.
- **Sienna X** is the only UK brand attempting professional content (~170–190
  posts) and most of it is consumer tan-tips relabelled for therapists. Its
  flagship pricing article, `sienna-x.co.uk/how-much-should-i-charge-for-a-spray-tan/`,
  is dated **October 2017**, ~450 words, one number, ends by asking you to phone.
- **Trade bodies are absent.** BABTAC's most recent indexed asset on the subject
  is a 2016 PDF. NHBF has nothing spray-tan-specific.
- **Templates are owned by Etsy**, not by any brand. No free, GDPR-aware,
  UK-compliant forms library exists anywhere.
- **The only calculators that exist are in dollars** — Sjolie's Glow & Grow
  (`sjoliespraytan.com/glow-and-grow/`) and `costpertan.com`. No sterling
  equivalent for anything.

**Formats that demonstrably win:** free ungated calculators; downloadable
templates; long-form pillars with real numbers (the one UK page with actual £
figures, `beautyschool.co.uk`, ranks #1 for several queries — that is the proof of
concept); comparison tables. **What does not win:** short brand-tied listicles
(Sienna X's format), gated content (MineTan's registration wall is invisible to
search and AI).

**White space ranked by gap × value:** UK unit economics in £ · UK licensing and
compliance · insurance explained · templates and forms · seasonality (the UK
tanning year — zero content anywhere) · retail attach · no-shows for tanning
specifically · inclusivity and darker skin tones · neutral training buyer's guide.

### 4b. UK market data — the citable numbers

All sourced. Use these; they are what make the content credible.

**Market and structure**
- 51,821 UK hairdressing & beauty businesses (IBISWorld, 2025). Conflicting counts
  exist — 49,635 / ~50,240 / 51,821 — state the basis when quoting.
- 80%+ employ fewer than 5 staff; 95% fewer than 10; **64% turn over under £99k**.
- **61% of the sector is self-employed**, up from 58% in 2024 (Booksy 2026).
  ~40% of self-employed beauty pros work home-based or mobile (BBCo/BABTAC 2021).
- 86% of beauty businesses are female-owned (Value of Beauty 2026).
- UK self-tan retail market £582.2m, forecast £746.3m by 2027. **UK self-tanning
  sales +43% Apr 2025–Apr 2026** (Circana).

**The pressure — why they are receptive**
- **20% operating at a loss** (NHBF, March 2026, n=423); ~75% on razor-thin margins.
- Average salon profit margin **8.2%**.
- Employer NIC secondary threshold cut to £5,000, frozen to 2031. National Living
  Wage £12.71 from April 2026. **Hair & beauty has the highest minimum-wage
  coverage of any occupation group, 43.3%.**
- Business rates overhauled April 2026; **salons excluded from the 15% discount
  given to pubs and music venues**.
- 72.6% expected to raise prices within 3 months (Feb 2026).
- VAT threshold £90,000 — ~26,000 businesses restrain growth to stay under it.

**The three numbers the strategy is built on**
- **29% of new salon clients ever rebook** — 71% never return (Phorest 2025, n=716).
- **Tanning has the highest no-show rate of any treatment category, 3.14%**,
  peaking June–August (Treatwell 2025). UK no-shows cost £1.6bn/yr, £39 per miss.
  Pre-payment halves them; only 17% of salons use it.
- **Retail is 4% of UK salon revenue against a 15–25% benchmark** (SalonIQ 2026),
  and **70% of clients who don't buy retail say they would like to** (Phorest).

**Pricing benchmarks**
- Spray tan £20–£40 nationally; London £25–£40; Manchester £20–£25.
- Regional pricing 10–20% below London; rural 15–25% below urban.
- Typical UK professional retail margin at RRP 40–60%.
- Tanning salon turnover £40–90k (small) to £180–350k (large); net margin 10–25%.

**Do not use:** any claim that X% of UK salons offer spray tanning (no such figure
exists); 2015 Mintel penetration data as current; Whito's "£1,000/month average
client spend" (implausible, contradicted by ~£40/visit × 5 visits/yr).

### 4c. Technical brief — and the claims register

This matters as much as the facts. The industry states a great deal as fact that
is not established. **Recorded so nobody writes it into an article.**

**Do not publish without further verification:**
- "DHA resistance" as a physiological phenomenon — no evidence it exists
- Hormonal effects (pregnancy, PCOS, HRT) on DHA development — no peer-reviewed
  evidence; every claim traces to salon blogs
- A "15% FDA limit" — **does not exist**; 21 CFR 73.2150 contains no numeric cap
- Erythrulose "makes tans last longer" — sources contradict each other
- Green/grey cast on olive skin as a verified mechanism — asserted everywhere,
  verified nowhere (green *underarms* from aluminium deodorant IS verified)
- Any specific PSI/CFM figure for spray tan equipment — no published standard
- Any ventilation ACH/CFM standard, or implying a legal requirement exists
- Shaving/waxing interval as an evidenced figure
- Benzoyl peroxide's effect on a DHA tan
- Acetone as a gun cleaner (one source says this; it will destroy Teflon seals)

**Genuine industry disagreements — present as disagreements, don't pick a side:**
- Violet base suits cool skin (goGLOW) vs warm skin (Sjolie) — directly opposite
- Higher DHA = darker vs faster
- Patch test 24h vs 48h (training standard says 48)
- Pregnancy: unsafe (Tommy's) vs no data (MotherToBaby) vs 16-week rule (UK training)
- Application sequence — no standard exists

**The strong, under-used sources — build the Craft pillar on these:**
- ACS Omega kinetics paper (PMC9753197) — Maillard mechanism, pH, temperature.
  Temperature is the single most influential variable on browning intensity.
- **UK SAG-CS 2024 opinion** — the only regulator modelling of spray booth
  exposure, with actual margins of safety by booth type. UK limits: leave-on
  self-tan 14%, rinse-off 22.5%. EU limit 10%. Strongest safety asset available.
- Draelos — colour depth is proportional to stratum corneum thickness. This
  single fact explains dark knees, light faces, and why exfoliation matters.
- Jung et al. — DHA-treated skin generates >180% more free radicals under UV.
  A DHA tan gives roughly SPF 3–4 and is not sun protection.
- 21 CFR 73.2150 — the actual FDA position.

**Commercially important flag:** professional rapid solutions sold at 18% DHA
exceed every published regulator figure for leave-on self-tan (UK 14%, EU 10%).
Unresolved. Verify before publishing anything about compliance.

---

## 5. The content strategy

Full document is the artifact **`jimmycoco-content-strategy`** (also delivered as
`content-strategy.html`). Summary:

**Positioning.** Become the business authority for UK spray tanning — the source
a salon owner reaches for when deciding what to charge, whether they need a
licence, how to stop no-shows. Not the brand with the best tan tips; the brand
that knows the numbers.

**Five pillars:** 1. The Economics of Tanning · 2. Compliance and Legitimacy ·
3. The Craft · 4. Filling the Diary · 5. Building the Business.

**Four readers:** owner-operator · mobile/home therapist · employed therapist ·
multi-site operator.

**First assets, in order:** the £ cost-and-profit calculator; tans-per-litre yield
tool; the consultation & consent template pack; then the pillar articles — what a
tan costs to deliver, do you need a licence, what to charge in 2026, insurance
explained, tans per litre, patch testing, the UK spray tan year, why tans go
orange, no-shows, COSHH and ventilation.

**The evidence standard is the moat.** Every factual claim carries a source; the
article schema already supports a `citations` array. Where the profession
disagrees, present the disagreement. Where evidence doesn't exist, say so. Every
competitor writes folklore confidently — being the one source that separates known
from assumed is what makes us citable, by salon owners and by assistants.

**Integration.** One research effort produces three assets: article (pro site) →
campaign (`email/campaigns/`) → tool. `article-data.json` maps directly onto the
fields the articles table already has (slug, seo_title, meta_description, og,
noindex, faq_items, citations, author, categories, tags). A monthly *Salon
Business Brief* to the trade list becomes the recurring reason to email people who
have not yet bought — which the programme currently lacks.

---

## 6. Decisions outstanding — get these answered first

1. **Trade only, or consumer too?** The plan is entirely trade-facing on the
   reasoning that jimmycoco.co.uk owns the consumer relationship.
2. **How hard on compliance?** Licensing, insurance and COSHH are the biggest
   open goals and the areas where being wrong has consequences. Local authority
   special treatments licensing genuinely varies by council.
3. **Calculators on the pro site, ungated?** Recommended yes — gated tools are
   invisible to search and AI.
4. **Who is the author?** Articles attributed to Jimmy resolve to the entity
   graph. Business/compliance content may sit better under a brand byline.
5. **Stale retail RRPs.** The pro site quotes A-List Glow Kit at £79 (actually
   £59), Soufflé "from £28" (actually £18), mitt £15 (sells at £12.50). Decide
   whether those are permanent or promotional, then fix
   `HomeSections.tsx` and `ProductSections.tsx`.

---

## 7. The next task

Build the `content/` root system and one pipeline folder end to end.

```
content/
├── 00-strategy/          the strategy doc, pillars, audience, positioning
├── 01-editorial-system/  voice for education, evidence standard,
│                         structure patterns, titling, CTA policy
├── 02-pillars/           one file per pillar: scope, cluster map,
│                         internal linking, commercial routes
├── 03-research/          the briefs above, source library, claims register
├── 04-pipeline/          per-article folders — the production unit
├── 05-tools/             calculator and template specifications
├── 06-distribution/      article → email → social mapping
└── 07-measurement/       what we track, what good looks like
```

Production unit, mirroring `email/campaigns/`:

```
04-pipeline/what-a-spray-tan-costs/
├── brief.md          audience, query intent, commercial route, claims to make
├── research.md       sources verified for THIS piece
├── article.md        the copy
├── article-data.json title, slug, meta, FAQ items, citations, cover, tags
└── derivatives.md    the email, the social cuts, the tool it links to
```

Start with `what-a-spray-tan-costs` — biggest gap, clearest commercial route,
and the numbers already exist (£60 litre, ~28 tans, £2.14/tan).

**Where Firecrawl earns its place:** populating `03-research/` — crawling
competitor hubs into clean markdown, mapping Sienna X's full post list to find
every topic they cover badly, and pulling the regulator PDFs (SAG-CS, HSE RR721,
BABTAC 2016) that WebFetch could not parse. Not for redoing section 4.

---

## 8. Opening prompt for the new chat

> Continuing work on the Sunless by Jimmy Coco repo at `~/mnt/jimmycoco`. Read
> `HANDOFF.md` in the repo root first — it has the full state, the research
> already done, and the next task. Do not re-run the research in section 4.
> Read `CLAUDE.md` for repo rules before editing anything. Start with the
> decisions in section 6, then build the `content/` system described in
> section 7.
