# 09 — Empty, Loading and Error States

## Purpose

Non-ideal states must preserve trust and momentum. The gallery should never appear broken, dishonest or commercially desperate when data is unavailable.

## Loading state

Use stable skeletons that preserve the final card dimensions.

Loading placeholders should:

- match image and metadata geometry;
- avoid animated shimmer over large areas;
- prevent layout shift;
- retain filter controls;
- announce loading status accessibly;
- time out into a clear error state rather than remaining indefinite.

Do not use blurred skin-tone placeholders that could be mistaken for actual results.

## No results after filtering

### Heading

> No exact results match those filters yet.

### Supporting copy

> Try removing one filter, explore the closest available results, or complete the shade match for a personalised recommendation.

### Actions

- **Remove the most restrictive filter**
- Clear all filters
- Match My Shade

Show a small number of clearly labelled nearest matches only when the logic is transparent.

Example:

> Closest available: same starting tone, different development time.

Do not quietly ignore the visitor’s filters.

## Empty gallery

During initial launch, when too few results exist, use a curated proof page rather than a visually sparse pseudo-gallery.

Include:

- available verified transformations;
- a clear explanation that more results are being added;
- shade-match and product routes;
- an invitation to submit a result only when a real moderation and consent workflow exists.

Do not fabricate filler results.

## Network or service error

### Heading

> We couldn’t load the results gallery.

### Supporting copy

> Your filters have been saved. Please try again, or continue to shade matching and product discovery.

### Actions

- **Try Again**
- Match My Shade
- Shop Best Sellers

Preserve applied filters and scroll context after recovery.

## Image failure

When one image fails:

- show a neutral placeholder with `Image unavailable`;
- retain the factual metadata;
- do not present an incomplete before-and-after comparison as usable evidence;
- remove the card from featured placements until resolved.

## Missing metadata

If a result lacks product, coat or timing data:

- label the missing detail honestly;
- downgrade or remove verification status as appropriate;
- do not infer the missing value;
- exclude the result from filters based on unknown attributes.

## Unavailable linked product

Retain the historical evidence and state:

> The product used for this result is currently unavailable.

Offer an approved alternative separately and explain the relationship.

## Removed result

If consent is withdrawn or evidence becomes invalid:

- remove the image and personal information promptly;
- return a neutral not-found state;
- avoid exposing cached personal content;
- update internal links and search indexes;
- preserve only the minimum audit record required internally.

## Moderation pending

Customer submissions should never publish automatically. Pending results must remain outside the public gallery until rights, metadata and image integrity checks are complete.

## Success criteria

Every state must tell the visitor what happened, preserve valid context and provide one proportionate next action without inventing proof or forcing a purchase route.
