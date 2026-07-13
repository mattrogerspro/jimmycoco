# 03 — Recommendation Logic and Data Model

## Purpose

The logic layer must turn a small set of customer preferences into a recommendation that is clear, reproducible, explainable and maintainable by the ecommerce team.

## Product data requirements

Each product or variant should expose structured attributes for:

- application area;
- format;
- colour depth range;
- undertone suitability where genuinely relevant;
- development time;
- buildability;
- recommended experience level;
- number-of-coats guidance;
- finish and result description;
- stock and availability;
- exclusions or cautions;
- compatible preparation, application and finishing products;
- approved concern-resolution claims;
- priority or merchandising weight;
- and evidence status.

Recommendations must not be derived from marketing copy alone.

## Logic model

Use a transparent rules-and-scoring model rather than an opaque AI claim.

### Hard constraints

First remove products that are incompatible with:

- application area;
- required development style;
- explicit product exclusions;
- unavailable variants;
- or any critical suitability rule.

### Weighted fit

Score remaining products against:

- desired result;
- natural skin depth;
- undertone where applicable;
- desired control;
- experience level;
- timing preference;
- and primary concern.

Weights must be documented and reviewed whenever the catalogue changes.

### Merchandising tie-breakers

Commercial priority may break a genuine tie only after suitability. Never promote a higher-margin or overstocked product that is materially less suitable.

## Confidence bands

Use internal confidence bands such as:

- High confidence — strong fit across critical answers
- Moderate confidence — good fit with one uncertain or neutral answer
- Low confidence — limited data, conflicting preferences or no exact product fit

Do not display fake percentages such as “97% match” unless mathematically and empirically justified. Customer-facing language should be plain:

- **Your best match**
- **A strong match based on your answers**
- **We recommend starting here**

## Primary and alternative result

Return:

- one primary product;
- one selected variant or depth;
- one application recommendation;
- one concise reason set;
- one alternative that differs on a meaningful dimension, such as greater control or faster development.

Do not return several near-identical products and force the customer to decide again.

## Result explanation object

The result payload should support:

- product and variant ID;
- result title;
- concise rationale;
- expected visible depth;
- recommended coats;
- development time;
- application area;
- concern-specific guidance;
- alternative rationale;
- routine IDs;
- matching result-gallery filters;
- confidence band;
- and logic version.

## Versioning

Every result must record the recommendation-logic version. If product data or rules change, returning users may be shown a refreshed recommendation with a clear note rather than silently replacing their saved result.

Suggested version format:

`shade-match-logic-v1.0.0`

## Stock and availability

If the ideal product is unavailable:

1. Explain that the best match is temporarily unavailable.
2. Offer a genuinely suitable alternative.
3. Allow restock notification after showing the recommendation.
4. Never quietly substitute a materially different product.

## Low-confidence handling

When confidence is low:

- explain what created uncertainty;
- invite the customer to review one decisive answer;
- provide the safest controllable starting option where appropriate;
- or direct them to customer support without blocking access to the result.

## Governance

Recommendation rules require review by:

- product owner or formulator;
- ecommerce merchandising;
- customer-service insight;
- legal or claims review where necessary;
- UX owner.

## Testing

Maintain a scenario matrix covering:

- every skin-depth range;
- every desired-result range;
- first-time and experienced users;
- face-only and body-only journeys;
- uncertain answers;
- contradictory answers;
- unavailable products;
- and catalogue changes.

## Success criteria

Two customers with the same answers receive the same recommendation under the same logic version, and the ecommerce team can explain exactly why.