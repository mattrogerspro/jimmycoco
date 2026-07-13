# Post-Purchase Education — Entry Trigger, Order State and Suppression

## Entry trigger

Create one sequence state when a valid paid order is accepted by the commerce system. The order, not the Resend delivery event, is the source of truth.

Required entry data:

- contact and order identifiers;
- purchased product and variant identifiers;
- quantities;
- order time, currency and locale;
- fulfilment and expected-delivery state;
- marketing-consent state;
- first-order or returning-customer status;
- approved instruction profile for each purchased item.

## Eligibility

A customer may enter when:

- the order is paid or otherwise approved for fulfilment;
- at least one eligible physical product exists;
- an approved education path exists for the purchased item;
- the destination address is deliverable;
- the applicable consent basis has been recorded.

Transactional receipts do not enrol a customer in marketing. Each educational message must be correctly classified and sent under the appropriate permission model.

## Order grouping

Use one sequence per order unless multiple orders are intentionally consolidated by an approved rule. Multi-item orders should produce one coherent routine rather than separate competing sequences.

When products have different delivery dates, application methods or professional-use status, branch by fulfilment group and suppress irrelevant modules.

## Pre-send checks

Before every send confirm:

- order has not been cancelled, fully refunded or returned;
- relevant item remains in the order;
- current fulfilment and delivery state;
- no unresolved delivery or support issue;
- instruction content matches the exact product and variant;
- timing remains appropriate;
- consent and suppression status;
- no duplicate idempotency key exists.

## Immediate suppression

Suppress promotional and review-oriented messages when:

- consent is withdrawn;
- the address hard-bounces or reports spam;
- the order is cancelled or fully refunded;
- the relevant product is returned;
- fraud or payment review prevents fulfilment;
- the customer is deceased or the account is otherwise legally suppressed.

## Service-state pause

Pause educational sends when:

- delivery is delayed, lost or failed;
- a damaged, incorrect or missing-item report exists;
- an adverse reaction or safety concern is reported;
- a refund, return or chargeback is open;
- customer support requests a pause.

Service communication takes ownership until resolution. Never send a review request or cheerful application prompt during an unresolved problem.

## Partial fulfilment

For partial shipments:

- educate only for items confirmed delivered or reasonably expected;
- do not imply the whole order has arrived;
- recalculate routine guidance when a required companion item is missing;
- avoid duplicate sequence starts for each shipment.

## Guest and account orders

Guest customers may enter only when the permission and identity rules are satisfied. Account creation is not required. Account status must not be presented as consent.

## Product exclusions

Exclude or route separately:

- professional-only products purchased by verified trade customers;
- digital items or gift cards;
- discontinued items without maintained instructions;
- products under active recall or safety review;
- replacement orders where repeating the complete education flow would be inappropriate.

## Re-entry

A later order may create a new sequence when the product or use case is materially different. Repeat purchases of the same item should use an abbreviated returning-customer path and avoid repeating beginner guidance without reason.