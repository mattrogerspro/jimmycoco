# Empty, Loading and No-Results States

## Purpose

Collection states must preserve confidence when content is loading, unavailable or absent. They should help the customer recover without making the experience feel broken or generic.

## Loading state

Use stable skeletons that preserve the final layout:

- collection title and controls remain visible;
- product-card image, title and metadata areas use fixed placeholders;
- grid dimensions should not jump when content arrives;
- avoid full-page spinners where the surrounding interface can render immediately;
- announce significant loading changes accessibly without repeated interruption.

## Initial-load behaviour

Prioritise the first product row and visible collection controls. Defer below-the-fold editorial imagery where appropriate. Product images must reserve their aspect ratio to prevent layout shift.

## Filter-update state

When filters are applied:

- retain the current grid or show subtle card-level loading placeholders;
- do not blank the entire page unnecessarily;
- disable duplicate submissions while the update is running;
- preserve active filters and scroll context;
- show the updated product count when complete.

## No results after filtering

Use a clear recovery panel in the grid area.

Recommended structure:

**Headline:** No exact matches yet

**Explanation:** None of the current products match every selected filter.

**Recovery actions:**

- remove the most restrictive selection;
- clear all filters;
- open shade guidance;
- browse the closest related collection.

Show active filters so the customer understands the cause.

## Empty collection

A temporarily empty collection should not render a blank template.

Include:

- clear, honest explanation;
- related available products or categories;
- restock or launch notification only when operationally supported;
- contact or shade-guidance route where helpful.

Do not fabricate scarcity or imply imminent availability without evidence.

## Search with no results

Show the original query and provide:

- spelling suggestions;
- related categories;
- likely product formats;
- best sellers;
- customer-support route.

Suggested copy:

> We couldn’t find a match for “bronzing water”. Try face mist, tanning drops or browse all face products.

## Error state

When products cannot load:

- distinguish a system error from a genuine empty collection;
- provide a Retry action;
- preserve filters and search terms;
- offer navigation to Shop All or Best Sellers;
- log the technical failure for monitoring.

Suggested copy:

> We couldn’t load these products just now. Your selections are still saved.

## Sold-out-heavy collection

When most products are unavailable:

- show available products first where appropriate;
- label unavailable products clearly;
- offer close alternatives;
- allow restock notification only with valid consent handling;
- avoid a first screen dominated by disabled cards.

## Accessibility

- Use appropriate live-region announcements for result count and errors.
- Move focus only when necessary; do not unexpectedly reset it to the top.
- Ensure Retry, Clear Filters and alternative links are keyboard accessible.
- Skeletons should not be announced as meaningful content.
- Error text must not rely on colour alone.

## Visual language

States should use the same warm neutral palette, refined typography, fine rules and restrained icon language as the rest of the site. Avoid cartoon illustrations, playful error mascots or oversized warning graphics.

## Failure modes

Reject states that:

- show an endless spinner;
- remove all navigation;
- blame the customer for selecting filters;
- provide no recovery action;
- reset all selections after an error;
- use fake product results to fill space;
- make an error state look like a luxury campaign.

## Success criteria

A customer encountering no results or a temporary failure should always understand what happened, retain their context and have at least one obvious next step.