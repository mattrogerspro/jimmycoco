# Campaign, Lifecycle and Template Assets

## Purpose

Define how reusable and campaign-specific email assets are assigned to lifecycle states, modules and production templates.

## Asset ownership model

Every asset should have one primary owner:

- campaign;
- lifecycle sequence;
- reusable template;
- brand/editorial library;
- service or transactional communication.

An asset may be eligible for multiple uses, but one team or system must own its maintenance and replacement.

## Campaign assets

Campaign assets are created for a defined launch, promotion, season or editorial idea.

Required metadata:

- campaign ID;
- campaign objective;
- start and end date;
- eligible markets;
- offer dependency;
- product dependency;
- rights window;
- module roles;
- desktop and mobile exports;
- replacement or expiry behaviour.

Campaign assets should not silently become evergreen.

## Lifecycle assets

Lifecycle imagery should support the customer’s state rather than repeat generic campaign art.

### Welcome

Use brand introduction, method, authority and first-step guidance.

### Shade match

Use recommendation, shade, format and application imagery that matches structured result data.

### Browse abandonment

Use the exact browsed product or a safe category fallback. Do not fabricate customer preference.

### Cart abandonment

Use current cart product and variant assets. If unavailable, use an approved neutral basket or product fallback rather than a mismatched item.

### Post-purchase

Use purchased product, application guidance and support imagery. Avoid promotional dominance during unresolved service states.

### Replenishment

Use the verified previously purchased product or an approved routine reminder. Do not imply depletion without model support.

### Win-back

Use relevant brand, routine or prior-product imagery without creating surveillance-like specificity.

### VIP

Use programme service, benefit and access imagery. Do not overuse status decoration or imply benefits that cannot be honoured.

## Template assets

Reusable template assets include:

- logo and wordmark exports;
- separators;
- icons;
- background textures;
- utility illustrations;
- social icons;
- footer marks;
- dark-mode alternatives;
- missing-image fallbacks.

These assets require versioning because a change can affect many messages.

## Module mapping

Each asset must identify compatible modules, for example:

- full-width hero;
- split hero;
- product card;
- two-column editorial;
- proof block;
- routine row;
- banner;
- footer;
- mobile-only module.

Do not force an image into a module with an incompatible crop or focal point.

## Dynamic asset selection

Dynamic selection may use only approved application data such as:

- product ID;
- variant ID;
- lifecycle state;
- market;
- language;
- campaign ID;
- shade-match result;
- customer programme tier.

The application should return an approved asset ID, not construct a speculative filename.

## Fallback hierarchy

Recommended order:

1. exact approved product or variant asset;
2. approved product-family asset;
3. approved category or routine asset;
4. approved brand/editorial fallback;
5. omit the image when the module remains complete without it.

Never use a visually similar but incorrect product as a fallback.

## Reuse controls

Before reusing an asset, confirm:

- rights remain valid;
- product packaging is current;
- message context is compatible;
- the image has not been overused recently;
- crop works in the new module;
- adjacent copy does not create a new unsupported claim;
- market and language are valid.

## Embedded text

Avoid placing essential copy inside images. When embedded text is approved:

- create market and language-specific versions;
- preserve a text equivalent in HTML;
- verify mobile readability;
- review dark mode;
- version the asset when wording changes;
- ensure offer dates and terms remain accurate.

## Release blockers

Do not use an asset when:

- campaign or rights dates have expired;
- lifecycle context conflicts with the image;
- product mapping is stale;
- module crop is incompatible;
- embedded offer copy is outdated;
- fallback would misrepresent the customer’s product or state;
- a reusable template asset has been superseded.