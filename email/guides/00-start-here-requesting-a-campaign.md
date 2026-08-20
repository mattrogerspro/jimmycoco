# Start here — requesting a campaign

Anyone at Sunless can request an email campaign in plain English. You do not need to know the repository, the schemas, the templates or the file names — the production system handles all of that. This guide shows you how to ask, what happens next, and what you get back.

## How to ask

Describe what you want the way you would brief a colleague:

> Build a five-email salon recruitment campaign for California.

> Localise the UK onboarding sequence for Ireland.

> Add two follow-up emails to the UK stockist campaign for salons that didn't reply.

## What to include if you know it

The more of these you can state, the fewer questions come back:

| Detail | Example |
|---|---|
| Market | Greater Sydney, Australia |
| Audience | Premium spray-tan salon owners |
| Primary outcome | Trial-kit requests |
| Offer or hook | complimentary trial of the Malibu solution |
| Cadence or length | 5 emails over 3 weeks |
| Channel | Email, or Email + WhatsApp |

If you skip any of these, the system either uses an approved repository default, asks you one consolidated set of questions, or marks the gap with an approval token.

## What you never need to do

- Fill in a form or paste a system prompt.
- Choose templates, name files or edit HTML.
- Invent prices, terms or delivery promises — **unknown facts are never guessed.** They become explicit tokens like `{{approved_price}}` for a human to fill in later.

## What happens next

Your request is expanded into a brief, checked against the playbooks (a compliance preflight), and produced as a complete campaign: strategy README, full copy, structured data, and branded HTML rendered through the shared master template. It is validated and handed back to you with a Production Report.

## What you get back

A campaign folder in the repository, visible in this Studio, in one of exactly four statuses:

1. `DRAFT — NOT APPROVED FOR SEND`
2. `READY FOR HUMAN REVIEW`
3. `CHANGES REQUIRED`
4. `BLOCKED`

None of these send email. **Nothing sends without a named human approving the copy, facts, assets, recipients and rendered output** — and even then the send path is double-locked (see the gates guide).
