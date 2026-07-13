# Collection Page Master Architecture

## Purpose

The collection page translates broad customer intent into a confident product decision. It must help customers understand the category, recognise the differences between products and move into the correct product page with minimal uncertainty.

## Primary customer questions

- Which product is right for the result I want?
- What is the difference between these formulas?
- Which product suits my skin tone, experience level and available time?
- Can I trust the result?
- What should I buy first?

## Commercial objectives

- Increase qualified product-page visits
- Reduce choice paralysis
- Improve product-card engagement
- Increase use of shade guidance
- Support profitable merchandising without misleading customers
- Preserve product discovery on mobile
- Create a clear route to purchase for returning customers

## Approved page sequence

### 01 — Global navigation
Use the shared website navigation system. Keep the shade-match route visible.

### 02 — Collection introduction
A concise editorial introduction with category title, customer benefit and optional visual. It should explain the category in seconds, not create a campaign landing page above the products.

### 03 — Guided selection bar
Provide one high-value guidance route such as:

> Not sure where to start? Find your ideal formula and depth.

This may open the shade matcher, a concise guided selector or a collection-specific decision aid.

### 04 — Product controls
Display product count, sort control and filters. Controls should be visible but visually restrained.

### 05 — Product grid
Products are the dominant working area. Cards must communicate result, suitability, format, development time, price, reviews and availability without becoming cluttered.

### 06 — Editorial merchandising interruption
After a meaningful number of products, an optional editorial module may explain Jimmy’s method, demonstrate a result or guide the customer by concern. It must not interrupt the first product row.

### 07 — Additional product rows
Continue the product grid with stable controls and preserved filters.

### 08 — Category guidance and SEO content
Provide concise, useful education below the commercial content. Use accordions or editorial blocks where appropriate. Do not place a long SEO essay above the product grid.

### 09 — Final reassurance
Close with delivery, returns, support and shade-match reassurance before the footer.

## Above-the-fold hierarchy

Within the first desktop viewport, show:

1. Collection title
2. One-sentence category promise
3. Optional restrained category image
4. Shade or product guidance route
5. Product count and controls
6. At least the upper portion of the first product row

The page fails if the visitor must scroll through a large campaign hero before seeing products.

## Architectural silhouette

Use a calm editorial opening followed by a disciplined commercial grid. The page should feel lighter and more systematic than the homepage while retaining the same typography, palette and photographic language.

Recommended desktop structure:

- 12-column grid
- Maximum content width aligned with the wider website system
- Intro copy occupying approximately four to five columns
- Optional image occupying five to seven columns
- Product grid using three or four columns depending on card density and catalogue size
- Consistent horizontal rhythm with occasional full-width editorial modules

## Collection types

The system must support:

- Shop All
- Self Tan
- Gradual Tan
- Face
- Body
- Accessories
- Best Sellers
- New Products
- Bundles and Routines
- Search Results
- Concern-led collections
- Result-led collections

The architecture remains consistent, but the introductory message, filters and merchandising logic may change by collection.

## UX rules

- Preserve filters and sort state during product-page navigation where technically possible.
- Returning to the collection should restore scroll position.
- Product cards must link through the full clickable card area while preserving accessible nested controls.
- Do not hide all useful information behind hover.
- Do not use infinite scroll without a reliable position-restoration strategy.
- Pagination or controlled load-more behaviour is preferable for orientation and analytics.
- Clearly distinguish unavailable products from purchasable products.

## SEO and content rules

- Use one clear H1 matching the category.
- Add a concise original introduction.
- Ensure product content is server-rendered or otherwise reliably indexable.
- Provide useful category education below the grid.
- Avoid duplicate generic copy across collections.
- Use descriptive internal links to related categories and guidance.

## Accessibility

- Filters, sort and pagination must be keyboard operable.
- Product-card information cannot depend on colour alone.
- Result swatches need text labels.
- Focus order must match the visual order.
- Announce changes in product count after filtering.
- Use accessible names for quick-add and wishlist controls.
- Maintain clear contrast on badges, prices and availability states.

## Success criteria

The collection page succeeds when a first-time customer can identify two plausible products within 20 seconds, understand why they differ and enter a product page without feeling overwhelmed.