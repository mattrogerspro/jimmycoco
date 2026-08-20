# Repository Audit & Gap Analysis — Sunless by Jimmy Coco

_v2 — 2026-07-13. Scope: full repository (`shared/`, `website/`, `email/`, `product-images/`). Supersedes the v1 homepage-era audit._

---

## 1. Executive summary

Since v1 the repository has roughly **tripled** (29 → 87 tracked spec files, ~25k → ~66.5k words in `website/`) and its scope has grown from *homepage-only* to a **full ecommerce specification**: product pages, collection pages, cart & checkout, a dedicated shade-match system, and a complete AI-production pipeline (reference protocol, continuity, failure modes, QA, assembly, prompt templates, versioning). Real **product reference images** have now been added under `product-images/`.

**Overall health: the website pillar is near-complete and consistently high quality. The remaining risk has shifted from "missing documents" to (a) the still-empty cross-channel foundation, (b) the absent structured product catalogue, and (c) reconciliation drift between documents that now overlap.**

| Area | v1 | Now | Notes |
|---|---|---|---|
| `website/` homepage system | 🟢 | 🟢 | Unchanged, still strong |
| `website/` funnel (PDP, PLP, cart, shade-match) | — | 🟢 | 38 new specs, consistent template |
| Design system + AI production depth | 🟡 | 🟢 | Component, responsive, a11y, motion, QA, versioning all added |
| `website/05-assets/` manifest | 🔴 | 🟢 | Exists with JC-* ID scheme |
| Product imagery | 🔴 | 🟡 | Images now in repo; naming/manifest linkage pending |
| Structured product catalogue (data) | 🔴 | 🔴 | Schema exists; zero real values anywhere |
| `shared/` foundation | 🔴 | 🔴 | Still README-only — 0 of 5 sections |
| `email/` | 🔴 | 🔴 | Still README-only (acknowledged future phase) |
| Cross-document consistency | 🟡 | 🟡 | New overlap-drift issues introduced by the expansion |

---

## 2. Inventory

```
README.md · AUDIT.md · .gitignore
shared/    README.md                        ← only file (planned: 5 sections)
email/     README.md                        ← only file (planned: 7 sections)
product-images/                             ← 13 webp across 6 product folders (NEW)
website/
  00-foundation/       4 docs
  01-design-system/    10 docs  (+ component language, responsive, accessibility, motion)
  02-experience/       5 docs   (+ IA, conversion architecture, discovery, shade journey)
  03-homepage-scenes/  13 scenes
  04-ai-production/    8 docs   (+ reference protocol, continuity, failure modes, QA,
                                  assembly, prompt templates, versioning)
  05-assets/           asset manifest (JC-LOGO/PACK/JIMMY/MODEL/SKIN-*)
  06-product-pages/    README + 10 docs
  07-collection-pages/ README + 8 docs
  08-cart-and-checkout/README + 9 docs
  09-shade-match/      README + 11 docs
```

---

## 3. Resolved since v1 ✅

1. **Asset manifest** — `05-assets/00-asset-manifest.md` now defines a full ID scheme, status values, and required coverage; it is wired into the production workflow (`04-ai-production/05`, `07`), including an output naming convention (`jc-web-01-hero-desktop-v1.2.0-review.webp`).
2. **Mobile coverage** — every new section has a dedicated mobile spec; `01-design-system/07-responsive-behaviour.md` defines breakpoints.
3. **Accessibility** — dedicated `08-accessibility-standards.md` plus per-chapter sections in most files.
4. **QA / approval / versioning** — scene QA checklist, failure-modes guide, and a versioning & approval workflow now exist.
5. **Recommendation logic** — `09-shade-match/03` defines a rigorous, transparent rules-and-scoring model with confidence bands, governance, and test matrix.
6. **Product imagery** — `product-images/` adds real photography for: Malibu Beach Face Contour Kit (Dark), Malibu 1 Ltr Professional Spray, The Face Brush, Tinted Tan Soufflé Malibu Beach, Sunless Brush.
7. Verified clean: **no dangling asset IDs**, **no hex values redefined outside the colour system**, **no broken README file indexes** in the four new sections, desktop canvas (1700px/12-col) and 95%-evolution rules consistent throughout.

---

## 4. Open gaps

### P0-1 — `shared/` is still empty 🔴
0 of 5 planned sections exist. It remains the declared "source of truth" that `website/README.md:30` (step 1) and `04-ai-production/00:31` (required input #10) depend on. Every scene generation run technically starts with a missing input. The duplicated review stat (P1-6) is a direct symptom.

### P0-2 — No structured product catalogue 🔴
Definitive finding across all 87 files: **every product attribute is a placeholder** (`[PRICE]`, `£X`, `[product name]`) deferred to "approved product data" that resolves to no file. The shade-match logic (`09/03`) specifies the *schema* — but there are no products, shades, prices, development times, SKUs or ratings to run it against. The new `product-images/` folders finally establish real product *names*; the structured data record is the missing half. 8+ specs depend on it.

### P0-3 — Two parallel shade recommenders, unreconciled 🔴
The homepage engine (`03-homepage-scenes/03`) and the dedicated system (`09-shade-match/`) disagree on:
- **Question options** — desired result: 3 options vs 4; skin classification: homepage folds *Olive into skin tone* (03:58–63) while shade-match treats *Olive as an undertone* (09/02:43) — a direct classification conflict; experience-level options also differ.
- **Question count** — "3 questions" (homepage) vs 7 enumerated (09/02:9–75) vs "Question 3 of 6" (09/02:114) vs "five to seven" (09/00:60).
- **CTA labels** — "BUY MY MATCH" / "CHOOSE MY SHADE" (homepage) vs "ADD TO BAG" (09/10:46); "Adjust My Answers" vs "Review my answers".
- **Rationale label** — "Why Jimmy recommends it" vs "Why this matches".
- **Routing** — 09/01:9 lists the homepage engine as an *entry point*, but neither doc states whether completing the homepage engine feeds, redirects to, or replaces the full flow.

### P1-1 — Shade-guidance CTA label: ~8 variants
"Find My Match", "Check My Shade", "Check my match", "Recheck my match", "Check My Match", "Find My Formula", "Match My Shade", "Help Me Choose", "Get a guided recommendation", "Find My Shade" (06/00:92, 06/01:88, 06/03:87, 06/09:51, 07/01:76–78, 07/03:127, 07/07:25, 09/01:28…). The product master's own canonical pair is not used by its own chapters. Pick one label per context and enforce it.

### P1-2 — Purchase-panel order contradicts itself
Master: Price → Variant → Suitability (06/00:32–34). Chapter: Price → Suitability → Variant (06/01:28–30). Both eye-paths put price *after* suitability (06/01:98, 06/09:134), contradicting both panel lists. Also three different page-sequence enumerations (11 vs 16 vs 10 steps) and "Result-at-a-glance **strip**" vs "…**facts**".

### P1-3 — CTA colour: "matte black" vs "matte charcoal"
Folders 06/08/09 specify **matte-black** CTAs throughout; the homepage engine and the canonical colour system specify **matte/deep charcoal** (`#26231F`, "not pure black"). One token should win (the colour system says charcoal).

### P1-4 — Design-token drift in the new design-system docs
`07-responsive-behaviour.md` restates type sizes that diverge from canonical `04-typography-system.md`: product title 20–**28**px (canonical 20–24), hero 42–72 (canonical 64–72 desktop — the responsive doc should express this as breakpoint scaling of the canonical token, not a new range). `06-component-language.md:95` sets touch targets 48/52px vs 44px used elsewhere (06/08:80, 06/09:105, 07/06:107). Palette shorthand also drifts between prompts: "ivory, linen, champagne, **charcoal**" (08/08:7) vs "ivory, linen, **stone**, champagne" (09/10:11).

### P1-5 — Stale READMEs (new gap introduced by the expansion)
`website/README.md` still lists only sections 00–05 and describes a homepage-only workflow ("assemble approved scenes into the complete homepage") — **the four funnel sections (06–09) are invisible from the front door.** Root `README.md` likewise still frames the repo as homepage-era. The 02-experience description ("customer psychology…") still mispoints (that doc lives in 00-foundation).

### P1-6 — Review stat still hard-coded in 4 files
"4.8/5 from 1,642 verified customers" in `01-hero.md:146,209`, `02-authority-strip.md:31`, `11-final-conversion-scene.md:113`; press list in 2 files. Belongs in `shared/` as a single source.

### P1-7 — Homepage chapter numbering still off-by-one
Scene files 00–12 vs narrative 01–13 vs colour-cadence 1–12 vs psychology 1–11 (unchanged from v1).

### P1-8 — Product images ↔ manifest not linked; naming convention not applied
The manifest's packaging entries are still placeholders ("Bestseller product 01–04") while real images now exist under `product-images/` with ad-hoc names (spaces, `ChatGPT_Image_May_22…(1)`, `IMG_0399`, camelCase folders) — none follow the repo's own `jc-web-…` convention (04/07:78) or carry JC-PACK IDs; approval status is untracked. One file appears misplaced: a Klaviyo Black-Friday email banner inside `The Face Brush/`. Rename per convention, register each image against a JC-* manifest entry with status, and relocate the email asset (likely to the future `email/06-assets/`).

### P2 — Minor
- `04/07:117` references `website/05-assets/scene-records/`, which doesn't exist yet.
- Template drift: `01-*` chapter files open with `## Role` where siblings use `## Purpose`; `06/01` closes "Success test" vs "Success criteria"; `09/00` closes "Definition of success".
- Dedicated `## Accessibility` section missing from 5 chapter files (06: 01, 02, 03; 07: 01, 04).
- Copy drift: "Added to your bag" vs "Added to Bag"; "free delivery" vs "free standard delivery"; `£X` vs `£XX.XX` vs `[PRICE]`.
- Collection naming: type "Face"/"Accessories" (07/00:91–92) vs display "Face Tan"/"Application Essentials" (07/01:94,100).
- Routine naming collision: application method **Prepare→Apply→Develop→Maintain** vs cross-sell ritual **Prepare→Apply→Perfect** share two stage names, adjacent in the same prompt (06/09:87 vs 97), never disambiguated.
- "10–12 distinct chapters" target (exec summary) vs 13 defined scenes (unchanged from v1).
- The new-section specs never *link by path* to the design system / manifest they depend on — dependencies are named in prose only.

---

## 5. Prioritised actions

| # | Priority | Action |
|---|---|---|
| 1 | 🔴 P0 | Populate `shared/` (brand, claims/copy language, canonical stats, cross-channel assets) |
| 2 | 🔴 P0 | Create the structured product catalogue (names ✓ via images; add shades, prices, dev times, SKUs, claims) — single file both shade-match logic and PDP specs point to |
| 3 | 🔴 P0 | Reconcile homepage shade engine ↔ `09-shade-match/` (one question model, one option set, defined routing, shared CTA + rationale labels) |
| 4 | 🟡 P1 | Canonicalise the shade-guidance CTA label set; fix purchase-panel order + page-sequence counts |
| 5 | 🟡 P1 | Settle matte-charcoal as the CTA token; make responsive/component docs reference canonical type/touch tokens |
| 6 | 🟡 P1 | Update both READMEs to reflect sections 06–09 and the multi-template scope |
| 7 | 🟡 P1 | Register `product-images/` in the asset manifest with JC-* IDs, convention names, approval status; relocate the Klaviyo email asset |
| 8 | 🟡 P1 | Single-source the review stat + press list; fix homepage numbering off-by-one |
| 9 | 🟢 P2 | Template/copy tidy-ups; create `scene-records/`; add missing Accessibility sections; disambiguate the two Prepare/Apply rituals |

---

## 6. Bottom line

The specification has crossed from "strong homepage bible with missing foundations" to a **near-complete website design system for the entire purchase funnel** — with genuinely production-grade QA, versioning and AI-generation machinery. What now stands between this repo and an executable, company-standardisable system is not volume but **three convergence tasks**: build the shared foundation it cites, put real product data behind the abstractions, and reconcile the small set of documents that describe the same thing twice. Everything else is polish.
