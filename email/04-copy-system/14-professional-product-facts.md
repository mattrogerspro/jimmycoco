# Professional Product Facts

## Purpose

This chapter is the single source of truth for the professional product's figures. Every number below is approved; nothing here is an estimate. Copy, articles, playbooks and tools reference this chapter rather than restating its figures.

## The rule

**Do not repeat a product figure anywhere without taking it from this chapter.**

A figure restated in a campaign, an article, a template or a slide becomes a second source, and second sources drift. When the yield figure moved from "25–30" to "approximately 28" in August 2026, it had already been written independently into a campaign manifest, two generated emails, a build script, a sequence document, a website article and a content brief — six places, each of which had to be found and corrected by hand.

If a figure is missing from this chapter, add it here first, then reference it.

Companion chapters: `09-product-shade-and-routine-language.md` governs *how* the product is described; `10-promotional-claims-and-urgency-standards.md` governs what may be claimed. This chapter governs *what is true*.

## Professional solution — approved figures

| Fact | Approved figure |
|---|---|
| Format | 1 litre professional spray tan solution, salon size |
| List price | **£60** per litre |
| Active tanning agent | **10% DHA** |
| Coverage | **Approximately 28 full-body tans per litre** |
| Development time | 6 to 8 hours |
| Equipment | Standard professional HVLP spray systems |
| Returns | 14 days, 100% money-back guarantee |

Confirmed by the owner, 8 August 2026. Mirrored in code at `pro-site/app/lib/specs.ts` as `LITRE_PRICE_GBP` and `TANS_PER_LITRE`, which drive the product page, the specification table and the profit calculator.

### Derived figures

Arithmetic from the approved figures above. Safe to quote, but derive them rather than memorise them, so they follow the source if it changes.

| Derived | Working | Value |
|---|---|---|
| Solution per full-body tan | 1,000ml ÷ 28 | **≈ 36ml** |
| Solution cost per tan | £60 ÷ 28 | **£2.14** |
| Share of a £30 treatment | £2.14 ÷ £30 | **7.1%** |
| Litres per month at 12 tans a week | (12 × 52 ÷ 12) ÷ 28 | **1.9** |

### What must not be said

- **No numeric range for yield.** "25–30" and "24–32" have both circulated; neither was substantiated. The approved figure is approximately 28. Where a range feels necessary, say instead that a salon's own number will sit either side of 28 and tell them how to measure it.
- **No yield-by-equipment figures.** No published study exists.
- **No PSI, CFM or air-change figures.** No published standard exists. See `content/03-research/claims-register.md`.
- **No claim that higher DHA gives a darker result.** Genuinely disputed.

### Where 10% DHA helps us

At 10% DHA the professional solution sits at the EU limit for leave-on self-tan and comfortably inside the UK figure of 14%. Professional rapid solutions sold elsewhere in the industry at 18% exceed both. That is a factual advantage and may be stated as a fact about our own product — but do not characterise a competitor's compliance position.

## Retail range — approved prices

| Product | Price |
|---|---|
| A-List Glow Kit | **£59** |
| Tinted Tan Soufflé | **£18** |
| Application mitt | **£15** |

Corrected 8 August 2026; the professional website previously showed £79, "from £28" and £15. Typical UK professional retail margin at RRP is 40–60%. **Our own trade terms are not published** in copy, articles or tools — they are confirmed on the setup call.

## Open — do not state as fact until resolved

Three product questions are unsettled. Until each is closed, copy should use the brand name rather than the disputed detail.

**Product name.** `pro-site/app/lib/specs.ts` and the live product URL say *Malibu Professional Spray Tan Solution 1L*. The brand notes and the IE onboarding campaign say *Sunset 1 Ltr Professional Spray*. `website/11-content-hub/` describes three separate litres — Laguna (Light/Medium), Malibu (Medium/Dark) and Sunset (Dark/Extra Dark). At least one of these is wrong.

**Shade depths.** `specs.ts` lists Light, Medium, Medium/Dark and Dark. The IE campaign describes the professional litre as Dark / Extra Dark.

**Recommended dose.** `specs.ts` says "under 35ml per full-body session". Approximately 28 tans per litre implies about 36ml. The two are close but not identical, and the 35ml figure should not be quoted as an instruction until it is reconciled with the yield figure.

## QA checklist

- Every product figure in the copy traces to this chapter.
- No yield range is stated.
- No figure from the "open" section is asserted.
- Retail prices are £59 / £18 / £15.
- Trade terms are not quoted.
- Derived figures are recalculated from the approved figures, not copied from an older asset.
