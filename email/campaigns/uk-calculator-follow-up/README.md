# UK Calculator PDF Follow-Up

This is a four-email, repository-rendered promotional follow-up for an eligible UK professional who requested the spray-tan profit-plan PDF.

It is deliberately manual-start. Requesting the PDF stores a professional enquiry and sends the requested report, but does not automatically classify the contact as marketing-eligible. A staff member must review the record in the Pro admin before enrolling this campaign.

The campaign uses Resend only for transport. Subjects and HTML are rendered from `email-data.json`; no Resend Template ID is used.

## Entry and exits

- Entry: a UK application with `source=pro-site-calculator-report`, after staff eligibility review.
- First touch: one day after enrolment, so it does not duplicate the requested PDF email.
- Exit: reply, trial request, order, unsubscribe, complaint, hard bounce, existing-customer decision, current negotiation or manual stop.
- Starting it exits an active generic `uk-salon-stockist` prospecting enrolment for the same contact.

## Files

- `sequence.md` — human-readable cadence, decisions and copy intent.
- `email-data.json` — canonical runtime template source.
- `studio.json` — Live Email discovery metadata.
- `emails/` — generated previews; rebuild with `npm run templates:build -- uk-calculator-follow-up`.
