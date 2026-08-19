# UK Pro Trial Follow-Up

**Goal:** Help an eligible UK professional evaluate the complimentary trial in a real-client context and choose the right next conversation: result review, service maths or an opening order.

**Audience:** UK professional trial applicants only. The sequence is started manually by Matthew from the relevant application record; it never starts because a trial form was submitted.

**Market:** UK.  
**Channel:** Promotional email through the application-managed Resend delivery service.  
**Status:** Draft — disabled locally and in the database pending review, template publication and release approval.  
**Owner:** Matthew at Jimmy Coco Pro.

## Entry, exclusions and exit

The staff member must confirm that the application is a UK free-trial request, the applicant is eligible for promotional follow-up and the timing is appropriate. Starting this sequence exits any active `uk-salon-stockist` prospect enrollment for the same contact. It does not alter any transactional receipt, approval or shipment email.

Do not start for a declined application, an applicant who did not request a trial, a suppressed/unsubscribed contact or a contact with an active manual follow-up campaign. Stop future messages on any reply, unsubscribe, complaint, hard bounce, existing-customer decision, current negotiation or staff stop. `RESULT`, `NUMBERS`, `RETAIL` and `ORDER` are human-routed to Matthew, never auto-replied.

## Cadence

| Day | Email | Purpose | Primary action |
|---:|---|---|---|
| 0 | A real-client test, at your pace | Set a calm evaluation frame without restating the trial offer. | Reply with the intended test date or a question. |
| 5 | What to notice in the result | Provide an impartial result-review framework. | Reply `RESULT`. |
| 12 | The service maths after a good test | Give qualified UK solution-cost context and a human route to service maths. | Reply `NUMBERS`. |
| 21 | The next step is yours | Close respectfully with result, numbers and order options. | Reply or view the professional order route. |

## Commercial and operational boundaries

The sequence may state only approved UK professional figures: the 1-litre professional solution is £60, provides approximately 28 full-body tans and therefore has an approximate solution cost of £2.14 per tan. These figures exclude labour, disposables, card fees, premises and VAT; they are not a profit promise or a prescribed service price. Trade terms and retail contribution remain individual conversations.

No message may state that a sample has shipped, an application has been approved, an order has been accepted or an invoice has been issued. Those are separate transactional events.

## Files

- `sequence.md` — human-readable copy and stop logic.
- `email-data.json` — canonical generated-email input.
- `studio.json` — Campaign Studio metadata.
- `resend.json` — unpublished template-release manifest.
- `emails/` — generated HTML; never hand-edit.
