# Replenishment — Model and Timing

## Purpose

Define a transparent, product-aware method for estimating when a customer may be ready to reorder.

The model must never imply knowledge of actual remaining quantity unless the customer explicitly provides it.

## Required inputs

Use only approved first-party or operational data, such as:

- product or SKU;
- quantity purchased;
- order and delivery dates;
- product size or expected number of applications;
- intended usage pattern where explicitly known;
- prior reorder intervals for the same customer;
- prior reorder intervals for the same product cohort;
- whether the product is face, body, tool, accessory or professional supply;
- active subscription or recurring-order state;
- refunds, replacements and cancellations;
- current stock and product status.

## Timing hierarchy

Calculate the estimated reminder window using this order of confidence:

1. customer’s own repeat-purchase history for the same product or need;
2. customer’s explicit usage preference or reminder request;
3. validated product-level application assumptions;
4. cohort-level historical reorder behaviour;
5. conservative product-family default.

Do not use a cohort average when a reliable customer-specific interval exists.

## Example calculation model

For implementation planning:

```text
estimated_depletion_date = delivery_date
  + adjusted_usage_interval

adjusted_usage_interval = base_product_interval
  × quantity_factor
  × customer_history_factor
  × usage_frequency_factor
  × confidence_safety_factor
```

The exact factors must be derived from approved catalogue data and measured behaviour. Values must not be invented inside templates.

## Confidence levels

### High confidence

Use when there are at least two consistent prior reorder intervals or an explicit customer-set reminder.

Behaviour:

- tighter send window;
- product-specific reorder CTA;
- copy may say “It may be time to replenish.”

### Medium confidence

Use when product-level assumptions are reliable but customer history is limited.

Behaviour:

- wider reminder window;
- softer copy;
- include a delay or adjust-reminder option.

### Low confidence

Use when only broad category assumptions exist.

Behaviour:

- delay the first reminder;
- phrase as a check-in rather than depletion prediction;
- consider a single email rather than the full sequence;
- do not use urgency.

## Product-type considerations

### Consumable tanning products

Estimate from product size, typical amount per application and likely application frequency, but treat all assumptions as ranges.

### Face products

Face-only products may have different usage intervals from body products. Do not inherit body-product timing.

### Brushes, mitts and durable tools

These are replacement or care reminders, not consumption reminders. Use wear, hygiene or maintenance guidance only when approved and accurate.

### Professional litre products

Professional-use products require separate business-use assumptions. Do not place professional customers into consumer replenishment logic.

### Bundles

Model each consumable component, then select the earliest meaningful routine interruption. Avoid sending separate reminders for every component within a short period.

## Quantity handling

Multiple units should generally extend the estimated window, but not always linearly. A customer may buy for gifting, travel, stockholding or multiple users.

Use a conservative quantity factor unless repeat behaviour supports a stronger assumption.

## Reset events

Reset the replenishment clock when:

- the same SKU is repurchased;
- an approved equivalent fulfils the same need;
- a subscription shipment is confirmed;
- a replacement shipment effectively renews supply;
- the customer explicitly delays the reminder.

## Model governance

Maintain a versioned table containing:

- product or family identifier;
- base interval range;
- minimum and maximum eligible dates;
- confidence level;
- source of the assumption;
- last review date;
- owner;
- approved fallback;
- active or retired status.

Every sequence enrolment should store the model version used.

## Calibration

Review the model using:

- actual time to repeat purchase;
- purchase timing after each reminder;
- unsubscribe and complaint rates by timing band;
- customer use of “remind me later” controls;
- differences by product, quantity and customer tenure;
- holdout-group repeat-purchase behaviour.

Optimise for incremental, well-timed repeat purchase—not the earliest possible email.