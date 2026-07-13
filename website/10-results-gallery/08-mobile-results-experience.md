# 08 — Mobile Results Experience

## Purpose

Mobile must preserve image credibility, filter usefulness and direct product pathways without compressing the gallery into tiny comparison thumbnails.

## Mobile landing order

1. Compact navigation
2. Editorial heading and short explanation
3. `Filter` and `Sort` controls
4. Active-filter summary
5. Featured or most relevant result
6. One-column results list
7. Load-more control
8. Shade-match CTA
9. Disclosure and footer

## Image presentation

### Gallery cards

Use one result per row. Before-and-after imagery should remain large enough to inspect without zooming.

Preferred approaches:

- side-by-side when both images remain legible;
- stacked Before then After for narrower screens;
- no carousel that hides one half of the comparison by default.

### Detail page

Open with the image comparison before the commercial product module. The result is the reason the visitor arrived.

## Sticky controls

A compact sticky toolbar may contain:

- Filter
- Sort
- current result count

It must not obscure the image or consume excessive vertical space.

On the result-detail page, a bottom purchase bar may appear only after the visitor has reached the product section. It should show:

- product name or short identifier;
- price;
- selected shade;
- Add to Bag.

Do not show the purchase bar before the visitor understands the result.

## Filter panel

Use a full-height modal or bottom sheet with:

- clear section labels;
- native accessible controls;
- visible applied count;
- `Show [number] results` primary action;
- `Clear all` secondary action;
- preserved selections when reopened.

## Metadata priority

Visible on card:

- starting tone;
- achieved depth;
- product and shade;
- coats and time.

Move secondary provenance and application detail to the result page.

## Touch behaviour

- minimum 44px interactive targets;
- no hover-only content;
- no precision-dependent comparison controls;
- slider handles, when used, must be large and keyboard operable;
- swipe gestures may supplement but never replace visible controls.

## Performance

- load first visible images eagerly and later results lazily;
- use responsive image sizes;
- preserve image aspect ratio to avoid layout shift;
- do not preload every gallery image;
- provide low-weight placeholders that do not distort skin colour;
- avoid autoplay video in the results list.

## Returning behaviour

When returning from a result detail:

- restore filter state;
- restore scroll position where practical;
- keep previously loaded results available;
- do not reset the visitor to the top of the unfiltered gallery.

## Accessibility

- announce result-count changes;
- trap and restore focus correctly in filter panels;
- give Before and After images distinct alt text;
- preserve static comparison when JavaScript is unavailable;
- do not place essential labels over visually complex skin imagery.

## Success criteria

The mobile experience succeeds when visitors can inspect a transformation, understand how it was achieved and reach the relevant product with one-handed, interruption-free navigation.
