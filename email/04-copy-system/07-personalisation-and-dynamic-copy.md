# Personalisation and Dynamic Copy

## Purpose

Define how Sunless uses customer data to make email more relevant without becoming intrusive, brittle or falsely intimate.

## Principle

Personalisation must improve clarity, confidence or usefulness. It must never exist merely to demonstrate that data has been collected.

## Approved personalisation layers

### Identity

Use first name only when:

- the field is verified;
- formatting is natural;
- a neutral fallback exists;
- repetition is avoided.

Do not force the name into every subject line, heading and paragraph.

### Behaviour

Approved behavioural context includes:

- viewed product or category;
- completed shade-match result;
- basket contents;
- previous purchase;
- predicted replenishment window;
- VIP tier or recognised milestone;
- support or service state when operationally relevant.

Behavioural language should describe the useful context, not expose surveillance.

Prefer:

- `Your recommended match is still here.`
- `A reminder about the routine you viewed.`

Avoid:

- `We saw you looking at this three times.`
- `You left without buying.`

## Dynamic content hierarchy

Use dynamic data in this order:

1. Correct service or lifecycle state
2. Correct product, variant and shade
3. Correct market, currency and availability
4. Useful guidance based on customer context
5. Optional identity personalisation

Never allow a name token to receive more QA attention than product or order accuracy.

## Required fallbacks

Every dynamic field must have an approved fallback.

Examples:

| Field | Preferred value | Fallback |
|---|---|---|
| First name | `Matt` | no salutation or `Hello` |
| Product name | validated title | category-level wording |
| Shade result | validated result | `your recommended shade` |
| Delivery date | confirmed date | `when your order is dispatched` |
| Stock | live verified state | omit availability claim |
| VIP tier | current verified tier | `your VIP membership` |

A fallback must produce complete natural copy. Never expose blank spaces, braces, `undefined`, internal IDs or technical field names.

## Confidence-aware language

Where recommendation confidence varies, copy must reflect the underlying certainty.

High confidence:

- `Your closest match is…`
- `Based on your answers, we recommend…`

Moderate confidence:

- `Your best starting point is…`
- `This is the strongest match from your answers.`

Low or incomplete confidence:

- `A good place to begin is…`
- `Review these two options or retake your match.`

Never present an inferred result as clinically or mathematically exact.

## Product and shade rules

Before rendering personalised product copy, validate:

- canonical product name;
- correct variant and shade;
- current price and currency;
- stock state;
- customer market;
- approved image;
- destination URL;
- claims and usage instructions.

Do not substitute a nearby shade silently. Explain any alternative recommendation.

## Purchase-history language

Previous purchase data may support replenishment, routine guidance and compatibility suggestions.

Use:

- `Ready when you are for your next application.`
- `Pairs with the brush from your last order.`

Avoid language that assumes depletion, dissatisfaction or a fixed usage rate unless verified.

## VIP personalisation

Tier and benefit language must be generated from the current programme state, not historical email data.

Never communicate:

- a tier before qualification is final;
- a benefit that cannot be honoured;
- a transition before the review date;
- exclusivity that is not operationally true.

## Privacy boundaries

Do not personalise from sensitive, inferred or unnecessary attributes. Do not mention internal scores, segmentation labels, predicted value or risk states.

Customer-facing copy must never reveal terms such as:

- `high-value customer`;
- `churn risk`;
- `discount responder`;
- `low engagement`;
- `probability score`.

## Frequency of personalisation

One or two meaningful personalised details are usually sufficient. Too many details can make an email feel assembled rather than considered.

## QA checklist

Confirm:

- every variable has a fallback;
- data is current at send time;
- copy remains grammatical for all variants;
- no internal data labels are exposed;
- recommendation certainty is represented honestly;
- product, price, stock and links agree;
- personalisation adds usefulness;
- the plain-text version contains equivalent meaning.