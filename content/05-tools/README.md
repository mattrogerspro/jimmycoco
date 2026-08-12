# Tools

Free, ungated calculators and template packs. Per
[decision 3](../00-strategy/decisions.md#3-tools-and-templates-ungated-all-of-them),
no email walls on any of it.

## Why these come before the articles

Three reasons, and they compound:

1. **They're the only ones.** Every spray tan calculator that exists is in
   dollars — Sjolie's Glow & Grow and costpertan.com. There is no sterling
   equivalent for anything. No free, GDPR-aware, UK-compliant forms library
   exists anywhere; the templates market is owned by Etsy sellers.
2. **They're what gets linked to.** A calculator is a thing another site
   recommends and an assistant points at. An article is a thing they quote. We
   want both, but the calculator earns links an article won't.
3. **They give every article somewhere to send the reader.** Per the
   [CTA policy](../01-editorial-system/cta-policy.md), the CTA is the next
   useful thing — and after a costing article, the next useful thing is a
   calculator.

Gating any of this would make it invisible to search and to AI retrieval, which
is the entire reason to build it.

## Build order

| # | Tool | Spec | Status |
|---|---|---|---|
| 1 | Cost and profit calculator | [`cost-and-profit-calculator.md`](cost-and-profit-calculator.md) | Partial — exists inside the home page, needs extracting and correcting |
| 2 | Tans-per-litre yield tool | [`tans-per-litre-tool.md`](tans-per-litre-tool.md) | Not started |
| 3 | Consultation & consent template pack | [`consultation-consent-pack.md`](consultation-consent-pack.md) | Not started |

## Where tools live — open question

Assumed throughout these specs: **`/tools/<slug>`**, one hand-built React Router
route each, prerendered.

The article store has no concept of a tool page, so each is a bespoke route with
its own meta, its own schema and its own styles. That's fine for three tools and
poor for ten. Confirm the approach before building the second one — see
[`../00-strategy/decisions.md`](../00-strategy/decisions.md#open-questions--not-yet-decided).

If tools stay bespoke, each needs, at minimum:

- Its own `/tools/<slug>` route with proper `meta`, canonical and hreflang
- A registration in `app/routes.ts`
- **Inclusion in the sitemap.** `app/routes/sitemap.ts` is a resource route
  querying Supabase for articles; static tool URLs need adding explicitly or
  they won't appear.
- `SoftwareApplication` or `WebApplication` schema, and a `HowTo` or `FAQPage`
  block where the tool has explanatory content
- **Crawlable prose on the page.** A calculator whose content is entirely inside
  React state is invisible to a crawler and to an assistant. Every tool page
  carries the worked example and the method in server-rendered text underneath
  the interactive part. This is the single most important rule on this page.

## Rules for every tool

1. **Ungated.** No email, no registration, no "unlock the full results".
2. **Sterling.** Every figure.
3. **Assumptions visible and editable.** If a number is baked in, it's stated on
   the page and — wherever practical — it's an input.
4. **The tool and its article must agree.** A calculator that produces a
   different number from the article that links to it destroys the credibility
   of both. This is currently broken — see spec 1.
5. **Analytics.** `app/lib/analytics.ts` already has the pattern:
   `trackOnce` on first interaction, debounced `track` on adjustment, debounced
   `track` on settled result. Reuse it.
6. **Real prices.** £60 litre · £59 kit · £18 soufflé · £15 mitt, per
   [decision 5](../00-strategy/decisions.md#5-retail-pricing-the-lower-prices-are-correct).
7. **No trade terms.** Our specific margins are confirmed on the setup call, not
   published in a tool.
