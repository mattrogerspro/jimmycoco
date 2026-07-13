# Mobile Collection Page

## Purpose

The mobile collection page must preserve product discovery, comparison and orientation within a much narrower viewport. It should not simply stack the desktop page or hide essential guidance behind multiple layers.

## Mobile hierarchy

1. Compact global header
2. Breadcrumb or back route where useful
3. Collection title
4. One concise category statement
5. Optional guidance link
6. Product count
7. Sticky or persistent Filter and Sort controls
8. Product grid
9. Editorial guidance module
10. Additional products
11. Category education and reassurance

## Introduction

Keep the visible introduction short. Avoid tall campaign imagery that consumes the first screen. For core categories, a shallow editorial image may sit beneath or beside the title, but the product controls and first cards should appear quickly.

## Product grid

### Two-column mode

Use when:

- primary images remain legible;
- product names fit without excessive truncation;
- result descriptor and price remain readable;
- quick-add behaviour is simple.

### One-column mode

Use when:

- product cards contain meaningful suitability guidance;
- variants require explanation;
- photography needs greater scale;
- the range is small and curated.

Do not switch arbitrarily between one and two columns within the same uninterrupted grid.

## Card content on mobile

Always show:

- product image;
- product name;
- concise outcome descriptor;
- price;
- review signal where available;
- availability;
- clear route to product or purchase.

Hide lower-priority metadata before shrinking type below comfortable reading size.

## Filter and sort controls

Use two adjacent controls above the grid:

- **Filter** with active count;
- **Sort** with current selection.

They may become sticky beneath the header while the customer browses, provided they do not consume excessive vertical space.

## Filter sheet

The mobile filter sheet should:

- open from the bottom or side with a clear title;
- use large touch targets;
- group options logically;
- show current selections;
- keep Clear All available;
- provide a fixed Apply button showing the expected result count;
- preserve focus and scroll state on close.

## Quick add

Use quick add only for products without unresolved required choices. On small cards, an icon-only bag control is permitted only with a strong accessible label and familiar visual treatment. A text action is preferable where space allows.

## Product-card tap behaviour

Avoid making every small control compete with the main card link. The product image and text area should open the product page. Separate quick-add and wishlist controls require distinct hit areas and focus states.

## Scrolling and restoration

- Returning from a product page should restore the same filters and approximate scroll position.
- Lazy-loaded images must not cause cards to jump.
- Use controlled Load More or pagination when the list is long.
- Preserve the customer’s position after adding an item to the bag.

## Sticky UI discipline

Do not stack multiple sticky layers. The header, filter bar, cookie banner and promotional bar must not reduce the usable viewport to a narrow strip. Prioritise shopping controls and allow secondary chrome to collapse.

## Editorial modules

Use full-width editorial modules between product groups. Keep them concise and touch-friendly. They should provide one useful piece of guidance, not create an interruption that feels like leaving the collection.

## Accessibility

- Touch targets should be at least 44px where practical.
- Do not truncate essential product names without an accessible full label.
- Ensure overlays can be closed with expected controls and system gestures.
- Maintain visible keyboard focus for external keyboard users.
- Announce successful quick-add and filter result updates.
- Respect browser zoom and dynamic text scaling.

## Performance

- Prioritise the first visible product images.
- Use responsive image sizes rather than downloading desktop assets.
- Reserve image dimensions to avoid layout shift.
- Defer below-the-fold editorial media.
- Keep filter interactions responsive on ordinary mobile connections.

## Failure modes

Reject mobile designs that:

- begin with a full-screen image;
- reduce product names to tiny text;
- hide price or availability;
- force all filters into horizontal scrolling chips;
- use a two-column grid with unreadable content;
- lose the customer’s place after visiting a product;
- create several stacked sticky bars;
- rely on hover behaviour.

## Success criteria

The mobile page succeeds when a customer can open the collection, understand the category, narrow the range and reach an appropriate product using one hand without losing context.