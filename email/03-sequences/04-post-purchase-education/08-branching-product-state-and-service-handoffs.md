# Post-Purchase Education — Branching, Product State and Service Handoffs

## Purpose

Ensure every customer receives guidance that matches the actual order, product, fulfilment state, experience level and support status.

## Branching dimensions

The sequence may branch on:

- product family and format;
- exact variant;
- face, body, contour or professional use;
- single product versus multi-product routine;
- first purchase versus repeat purchase;
- delivery state;
- declared experience or support need;
- explicit first-result feedback;
- returned, refunded or replaced items.

Do not branch on inferred sensitive characteristics or unsupported assumptions.

## Multi-product order logic

Build one ordered routine using approved product relationships:

1. preparation products or tools;
2. application product;
3. finishing or blending tool;
4. development guidance;
5. aftercare.

Suppress duplicate modules and recommendations for products already purchased. When products conflict or require separate use, explain the separation rather than forcing them into one routine.

## First-time customer path

Prioritise:

- preparation fundamentals;
- step-by-step application;
- development expectations;
- troubleshooting;
- clear support access.

## Returning-customer path

Prioritise:

- concise refresher;
- changes in product, variant or method;
- advanced but approved technique;
- aftercare and repeat-use guidance.

Do not label a customer “expert” without explicit evidence.

## Delivery branches

- **Dispatched:** preparation content may send.
- **In transit:** preparation and expectation content may send.
- **Delivered:** application sequence may begin.
- **Delayed:** pause use-oriented content and hand off to delivery service messaging.
- **Failed or lost:** suppress education and review requests.
- **Partial delivery:** educate only for the delivered fulfilment group.

## Support handoff

The following events immediately give ownership to customer service:

- adverse reaction or safety concern;
- damaged, missing or incorrect item;
- delivery failure;
- application complaint requesting help;
- refund, return or chargeback;
- explicit customer request for human support.

On handoff:

1. pause scheduled education;
2. store the current sequence position;
3. create or connect the support case;
4. prevent review and promotional sends;
5. resume only after explicit resolution logic confirms relevance.

## Replacement orders

A replacement should not automatically restart the complete sequence. Send only the guidance needed for the replaced product and current customer state.

## Refund and return logic

- Full refund or return: exit product education.
- Partial refund: remove affected items and rebuild remaining routine.
- Refund without return: do not assume continued intended use.
- Exchange: update product profile and recalculate pending messages.

## Behavioural handoffs

- New purchase: create a new post-purchase state while deduplicating shared items.
- Replenishment eligibility: begin only after education has completed and usage timing is credible.
- Browse or cart activity: may inform future messages but must not interrupt active service-oriented education with recovery pressure.
- Review submitted: suppress further review asks for that item and order.

## State persistence

Store:

- sequence instance and version;
- order and fulfilment identifiers;
- active product profiles;
- current step;
- scheduled-at and sent-at timestamps;
- pause reason;
- support-case reference;
- consent snapshot;
- experiment assignment;
- completion or exit reason.

State updates must be deterministic and auditable.