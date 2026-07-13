# 03 — Filters and Discovery

## Purpose

Filters help visitors find believable evidence that resembles their own starting point and desired outcome. They must reduce uncertainty without implying scientific precision that the available data cannot support.

## Primary filters

Use the smallest useful set:

- Starting skin tone
- Undertone, when known
- Desired result depth
- Product format
- Product or shade
- Number of coats
- Development time

## Optional filters

Use only when enough results exist:

- Face / body
- Event-ready / everyday
- First-time user
- Application method
- Verified customer only
- Studio / customer-submitted / campaign result

## Filter order

Prioritise customer language over internal catalogue language:

1. Starting skin tone
2. Desired result
3. Product format
4. Product or shade
5. Method details

## Filter interaction

### Desktop

Use a calm horizontal filter row or compact toolbar above the grid. More detailed controls may open in a restrained panel.

### Mobile

Use one visible `Filter` control with the active count and a bottom sheet or full-screen panel. Keep `Sort` separate.

## Applied-filter state

- Show applied filters as removable text chips.
- Include `Clear all` only when at least two filters are active.
- Update the result count immediately.
- Preserve filters when moving into a result detail and returning.
- Encode filter state in the URL where technically appropriate.

## Suggested options

### Starting skin tone

- Fair
- Light
- Medium
- Tan
- Deep
- Not sure

### Desired depth

- Barely there
- Sun-kissed
- Golden
- Deep bronze

### Product format

- Mousse / soufflé
- Mist / spray
- Face product
- Gradual tan
- Professional solution
- Accessories and application tools should not appear as result-producing formats.

## Sorting

Approved sort options:

- Most relevant
- Newest
- Lightest to deepest result
- One coat first
- Most viewed, only when real analytics support it

Default to `Most relevant` when shade-match context exists; otherwise use a curated relevance order.

## No false precision

Do not filter by values that cannot be collected consistently. Avoid pseudo-scientific scales, invented undertone percentages or claims that a filtered result predicts an identical personal outcome.

## Discovery modules

Useful non-filter discovery routes include:

- Results for fair skin
- One-coat results
- Deep bronze results
- Face-tan results
- First-time customer results
- Results using your recommended shade

These should link to pre-filtered gallery states rather than separate duplicate pages unless SEO strategy requires canonical landing pages.

## Accessibility

- Every control requires a visible label.
- Native controls are preferred.
- Result-count updates should use an appropriate live region.
- Focus should remain stable after applying a filter.
- Do not move keyboard users to the top of the page on every update.

## Success criteria

A visitor should reach a useful set of relevant results in no more than two or three filter decisions.
