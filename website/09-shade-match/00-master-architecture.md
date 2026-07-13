# 00 — Shade-Match Master Architecture

## Purpose

The Shade Match is the central guided-selling system for Sunless. It converts customer uncertainty into a clear, defensible recommendation and connects the homepage, collection pages, product pages, cart and future email journeys.

It should feel like a short professional consultation with Jimmy Coco’s judgement embedded into the experience.

## Customer problem

Self-tan customers commonly hesitate because they do not know:

- which depth will suit them;
- whether a formula will look orange;
- whether to choose instant, gradual or longer-development colour;
- how much control they will have;
- whether the product suits face, body or both;
- how many coats they need;
- and which preparation or finishing products are genuinely necessary.

The system must resolve these questions without overwhelming the customer.

## Core journey

1. **Invitation** — explain the benefit and expected effort.
2. **Context** — establish desired result and current experience.
3. **Skin and undertone guidance** — use understandable visual choices.
4. **Lifestyle and timing** — identify development-time and maintenance needs.
5. **Preference and concern resolution** — account for control, fragrance, transfer, dryness and fading concerns only where supported by product data.
6. **Calculation state** — brief, credible processing transition.
7. **Primary recommendation** — one product and one selected variant.
8. **Explanation** — show why it fits the answers.
9. **Result preview** — describe expected depth, coats, development time and finish.
10. **Purchase** — visible Add to Bag and product-page route.
11. **Alternative** — one clearly differentiated fallback.
12. **Routine** — restrained Prepare, Apply and Perfect recommendations.

## Commercial hierarchy

### Primary conversion

Add the recommended product and selected variant to bag.

### Secondary conversion

Open the full product page while preserving the recommendation context.

### Tertiary actions

- compare the primary and alternative;
- adjust one or more answers;
- view matching real results;
- save or email the result after it has been shown;
- add a relevant routine product.

No tertiary action may compete visually with the main recommendation purchase action.

## Experience principles

- Keep the journey to approximately five to seven meaningful questions.
- Ask only questions that materially change a recommendation or explanation.
- Use one question per screen or one tightly related question group.
- Offer an honest “Not sure” answer where appropriate.
- Never penalise uncertainty with a dead end.
- Show progress without implying false mathematical precision.
- Allow back navigation without losing later answers unnecessarily.
- Do not require an account, email address or phone number to reveal results.

## Page and modal strategy

The preferred implementation is a dedicated route or full-screen overlay with a stable URL and browser history support. A small modal is inappropriate because the consultation needs space, visual guidance, accessibility and resumability.

Recommended routes:

- `/shade-match`
- `/shade-match/results`

The results URL may use an opaque session identifier, but must not expose sensitive or unnecessarily detailed answer data in the URL.

## State model

- Not started
- In progress
- Answer changed
- Incomplete but resumable
- Calculating
- Results ready
- Low-confidence result
- Product unavailable
- Returning session
- Expired session
- Error with recovery

## Data continuity

The recommendation context should persist through:

- result page;
- recommended product page;
- mini-cart and full cart;
- checkout where useful but unobtrusive;
- account or saved-result features;
- optional post-result email capture.

Use a concise label such as **“Your shade match”** rather than repeatedly showing the full answer set.

## Trust and claims

The system must distinguish between:

- customer preference;
- recommendation logic;
- verified product attributes;
- and illustrative result guidance.

Do not claim biometric skin analysis, medical assessment, guaranteed colour outcome or laboratory precision unless such capabilities and evidence genuinely exist.

## Analytics requirements

Track at minimum:

- entry source;
- quiz started;
- question viewed;
- answer selected or changed;
- uncertain answer used;
- step abandoned;
- result generated;
- recommendation confidence band;
- result product viewed;
- result added to bag;
- alternative selected;
- routine item added;
- result saved or emailed;
- purchase completed.

Analytics must not expose unnecessarily sensitive answer values in public event names or URLs.

## Definition of success

The experience succeeds when customers can complete it quickly, understand the result immediately, believe the reasoning, purchase without reselecting their variant and return later without starting again.