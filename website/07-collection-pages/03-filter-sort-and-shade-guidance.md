# Filter, Sort and Shade Guidance

## Purpose

Filters should reduce uncertainty, not expose internal catalogue complexity. The system must use customer language and prioritise the attributes that genuinely change suitability or result.

## Primary filter groups

Use only groups supported by reliable product data.

### Desired result

- Subtle glow
- Medium colour
- Deep colour
- Event-ready result
- Buildable colour

### Development time

- Instant or cosmetic finish
- 1–3 hours
- 4–8 hours
- Overnight
- Gradual over several applications

### Format

- Mousse
- Lotion
- Mist
- Drops
- Serum
- Accessories

### Area

- Face
- Body
- Face and body

### Experience level

- First-time user
- Easy everyday use
- Confident or advanced application

### Skin or undertone guidance

Only include skin-tone or undertone filters where the approved product logic supports them. Avoid implying clinical precision that the products do not provide.

## Filter hierarchy

Show the most decision-relevant groups first. For core tanning collections, the preferred order is:

1. Desired result
2. Development time
3. Format
4. Area
5. Experience or suitability
6. Price
7. Availability

Do not begin with brand, SKU type or technical catalogue attributes.

## Desktop interaction

Use either:

- a restrained horizontal filter bar with expandable panels; or
- a left-side filter column when the range and number of attributes justify it.

The product grid must retain visual dominance. Filters should not consume excessive width for a small catalogue.

## Mobile interaction

Use a clearly labelled **Filter** control showing the number of active selections. Open filters in an accessible full-height sheet or dedicated overlay with:

- visible group headings;
- selection counts;
- Clear All;
- Apply button with resulting product count;
- preserved selections when closed.

Do not apply dozens of network updates while every checkbox is changed unless performance is immediate and stable.

## Active filter display

Show removable active-filter chips above the grid. Include a clear-all control when more than one filter is active.

Chips are functional system controls here, not decorative UI.

## Product count feedback

Update the result count after filters apply. Announce the update accessibly.

Example:

> 6 products match your selections.

## Sort options

Keep sorting concise:

- Recommended
- Best Selling
- Newest
- Price: Low to High
- Price: High to Low
- Customer Rated

Only include options backed by accurate data. **Recommended** must have a defined merchandising rule rather than an arbitrary database order.

## Shade guidance integration

The collection page should provide a visible route to help customers who cannot confidently self-filter.

Approved patterns:

- compact guidance bar above the grid;
- a small persistent help link near filters;
- an editorial module after the first product row;
- a collection-specific guided selector.

Suggested copy:

> Unsure which depth or formula suits you? Get a guided recommendation.

Do not make the customer complete the full shade journey merely to browse products.

## Search results

Search-result filters should adapt to the returned catalogue and include category where useful. Preserve the original search term and offer corrected spelling or related suggestions without silently replacing intent.

## No-result recovery

When filters return no products:

- explain that no exact match is available;
- show active criteria;
- offer one-click removal of the most restrictive filters;
- suggest the shade matcher or related collection;
- never leave a blank grid.

## Accessibility

- Use native or correctly implemented checkbox and radio semantics.
- Make expanded and collapsed states explicit.
- Do not rely on visual chips alone to communicate active filters.
- Return focus logically when overlays close.
- Ensure the Apply button and result count are understandable to screen readers.

## Failure modes

Reject systems that:

- present ten or more low-value filter groups;
- use internal jargon;
- hide active selections;
- reset filters when navigating back from a product page;
- require hover to operate;
- use unlabelled colour swatches;
- imply undertone matching without approved logic;
- make sorting more visually prominent than product selection.

## Success criteria

Filters succeed when customers can narrow the range meaningfully in one or two decisions and always understand why the visible products remain.