# 02 — Email 01: Your Personal Match

## Send timing

15–30 minutes after completion, subject to consent, suppression and frequency policy.

## Job to be done

Return the customer to the exact recommendation they just created while their intent is still fresh.

## Core message

> Your match is ready — here is the product and shade selected from the preferences you gave us.

## Primary CTA

**VIEW MY MATCH**

Destination: the persistent shade-match results page with the recommended product and variant preselected.

## Secondary action

A quiet text link: **Change my answers**.

## Required content hierarchy

1. Personalised but non-invasive salutation where available.
2. Clear result headline.
3. Accurate product image from the approved source asset.
4. Product name, selected variant, format and current price.
5. Two or three concise reasons derived only from explicit questionnaire answers.
6. Primary CTA.
7. Small reassurance: result can be reviewed or changed.

## Suggested subject lines

- Your Sunless match is ready
- We found your best starting point
- Your personalised tanning result

## Preview text

Your recommended product, shade and next step are waiting.

## Example rationale pattern

> You asked for a [desired depth] result, preferred a [format] formula and selected [development preference]. Based on those answers, we recommend [product + variant] as your best starting point.

When an answer is uncertain, use:

> You were unsure about [attribute], so we selected the more controllable starting option and made it easy to adjust.

## Design direction

Use the master email shell. The result should dominate the first screen:

- warm ivory or clean white background;
- one large approved product image;
- concise editorial serif headline;
- product facts in live text;
- one matte-black button;
- no unrelated product grid.

## Dynamic data

Required:

- `recommended_product_name`
- `recommended_variant_name`
- `recommended_product_image_url`
- `current_price`
- `result_url`
- `recommendation_reasons[]`

Fallback behaviour:

- missing image: use approved category-safe product fallback;
- stale price: suppress price rather than showing an unverified value;
- unavailable result URL: do not send;
- unavailable recommended variant: substitute only through approved recommendation mapping and state that the recommendation was updated.

## Exclusions

Do not include:

- discount countdowns;
- fake scarcity;
- unrelated best sellers;
- celebrity claims not directly approved;
- invented skin tone or undertone descriptions;
- more than one dominant CTA.

## Plain-text version

Must include product, variant, concise rationale, result URL, answer-change URL and preference/unsubscribe links.