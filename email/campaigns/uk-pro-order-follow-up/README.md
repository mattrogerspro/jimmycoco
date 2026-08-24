# UK Pro Order Follow-Up

**Goal:** Support an eligible UK professional after a website order enquiry or confirmed/invoiced order with first-service guidance, a considered retail conversation and an appropriate next-order discussion.

**Audience:** UK professional order enquirers and UK professional customers. The sequence is manually started by Matthew from a qualifying order application or order record; it never starts automatically from an operational status change.

**Market:** UK.  
**Channel:** Promotional email through the application-managed Resend delivery service.  
**Status:** Repository-rendered draft — disabled locally and in the database pending review and release approval.  
**Owner:** Matthew at Jimmy Coco Pro.

## Entry, exclusions and exit

For a website order enquiry, the staff member confirms that `source=pro-site-order`. For an actual order, the staff member starts the sequence only from a confirmed, invoiced or shipped UK order. Starting it exits any active `uk-salon-stockist` prospect enrollment for that contact. It has no effect on the operational order receipt, invoice, payment or shipment emails.

Do not start for cancelled orders, non-UK contacts, suppressed/unsubscribed contacts or contacts with any active manual follow-up campaign. Stop future messages on reply, unsubscribe, complaint, hard bounce, current negotiation, existing-customer decision or manual stop. `RESULT`, `RETAIL` and `ORDER` are human-routed to Matthew.

## Cadence

| Day | Email | Purpose | Primary action |
|---:|---|---|---|
| 0 | A considered first professional service | Position first-use support without duplicating transactional order information. | Reply with the intended first-service date or question. |
| 4 | Preparing the client experience | Help with the practical service conversation. | Reply `RESULT`. |
| 11 | The conversation after the mirror | Introduce retail as client care, not an automatic upsell. | Reply `RETAIL`. |
| 21 | Your next professional step | Offer a first-service review or next-order conversation and close respectfully. | Reply or view the professional order route. |

## Commercial and operational boundaries

No message may state that an order is accepted, paid, dispatched or delivered, or repeat invoice/payment/shipment content. The sequence does not quote unpublished trade terms or retail contribution. The current professional solution figures may be used only with their existing qualifiers.

## Files

- `sequence.md` — human-readable copy and stop logic.
- `email-data.json` — canonical generated-email input.
- `studio.json` — Campaign Studio metadata.
- `resend.json` — deprecated historical release manifest; runtime sends repository-rendered HTML directly.
- `emails/` — generated HTML; never hand-edit.
