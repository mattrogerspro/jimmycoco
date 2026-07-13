# Email 05 — Personal Recommendation

## Send timing

Approximately seven days after enrolment.

## Job of the email

Convert accumulated trust and guidance into one clear purchase recommendation.

## Primary message

> Based on what we know, this is the most suitable place to start.

## Primary CTA

- Saved recommendation: **SHOP MY RECOMMENDATION**
- No saved recommendation: **GET MY RECOMMENDATION**

## Recommendation hierarchy

### Known shade-match result
Show one primary product with the selected variant, concise reason, expected result, application format and current availability.

### Strong declared preference without completed match
Show one contextual starting point only when the rule is approved and explain the limitation. Otherwise route back to shade matching.

### Insufficient data
Do not fabricate personalisation. Use a guided CTA and clearly say that a few answers are needed.

## Suggested subject-line directions

- Your Sunless recommendation is ready
- A more confident place to start
- The product we’d recommend for your result
- Ready when you are: your saved match

## Content architecture

1. Recommendation label.
2. Accurate product image from the approved asset library.
3. Product name, variant and result description.
4. “Why this fits” explanation using two or three known factors.
5. Price and availability where accurate.
6. One dominant CTA.
7. Concise application reassurance.
8. Optional alternative link, visually quiet.
9. Footer and preferences.

## Why-this-fits framework

Explain using customer-provided or behaviourally safe factors such as:

- desired colour depth;
- preferred application format;
- development-time preference;
- face versus body use;
- desire for gradual or event-ready control.

Do not infer ethnicity, medical condition or sensitive physical characteristics.

## Product-data requirements

At render time, validate:

- canonical product ID;
- product and variant name;
- approved product image;
- current price and currency;
- stock and purchasability;
- destination URL;
- approved suitability copy;
- approved routine metadata.

If any critical field is missing, fall back to the shade-match CTA rather than send a broken recommendation.

## Visual direction

- One premium product focus.
- Large, accurate source image with no generative packaging changes.
- Editorial space around the purchase module.
- Clear price, variant and CTA.
- No crowded carousel or four-product grid.

## Offer handling

A valid welcome incentive may appear as supporting information if approved, but the recommendation must remain understandable and valuable without it. Terms and expiry must be accurate and accessible.

## Failure modes

Reject the email if it:

- calls a generic bestseller “personally selected”;
- shows an out-of-stock or incorrect variant;
- uses a generated approximation of the packaging;
- presents several equal recommendations;
- hides price or key conditions;
- uses false scarcity;
- links to a generic collection when a specific saved recommendation exists.

## Success criteria

- The recommendation is specific and explainable.
- One purchase path dominates.
- Product, variant, price and stock are current at send time.
- The subscriber can return to their saved result.
- The email exits or changes if purchase occurs before send.