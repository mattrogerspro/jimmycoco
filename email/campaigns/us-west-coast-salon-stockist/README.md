# US West Coast Salon Stockist Recruitment — TEST

**Status:** `DRAFT — NOT APPROVED FOR SEND` — test campaign created to verify Creative Director System conformance. Not approved for live sending, list building, or contact sourcing.

**Goal:** Start qualified professional conversations with West Coast spray-tan salons — a reply, a booked call, or a professional-trial request — then move positive respondents into a trial-first onboarding stage.

**Audience:** Independent spray-tan salon owners, premium tanning studio owners, mobile tanning professionals, beauty-studio founders, salon managers responsible for tanning, and multi-location tanning operators across the US West Coast (CA, OR, WA). Businesses should show premium positioning, strong visual presentation, professional spray-tan services, and a clientele that values natural-looking, expert-led color.

**Market:** 🇺🇸 US — West Coast (CA / OR / WA). Priority areas: Los Angeles, Beverly Hills, West Hollywood, Orange County, San Diego, San Francisco, Marin County, Sacramento, Portland, Seattle, Bellevue.

**Offer / hook:** *Give West Coast clients the natural-looking, camera-ready color associated with Jimmy Coco’s professional shade method.* Trial-first, conversation-led — no discounting, no pressure.

**Channel & ESP:** Email. Resend, using the shared master template. WhatsApp/SMS are noted only as a possible future extension and are **not** produced here (repository consent/channel rules would have to support them first).

**Owner:** {{sender_name}} / {{sender_title}} — *[SOURCE REQUIRED: assign a real, monitored human owner before any review-to-send step].*

## Stages

1. **Outreach (cold):** 5 emails over ~18–21 days. Purpose: introduce the brand and start a qualified conversation.
2. **Onboarding (post-interest):** 5 emails triggered only by a positive reply / booked call / trial request → trial → consultation → approved trade terms → first order.

## Cadence — outreach

| # | Day | Email | File | Primary CTA |
|---|-----|-------|------|-------------|
| 1 | 0 | Professional introduction | `emails/1-professional-introduction.html` | Request trial info / reply |
| 2 | 4 | Color in West Coast light | `emails/2-west-coast-light.html` | Request shade guide |
| 3 | 9 | Two revenue lines | `emails/3-treatment-and-retail.html` | Book a partnership call |
| 4 | 14 | Partner pathway & support | `emails/4-partner-pathway.html` | Discuss the pathway |
| 5 | 19 | Respectful close | `emails/5-close-the-loop.html` | Reply later / keep shade guide |

## Cadence — onboarding (triggered, not scheduled)

| # | Trigger | Email | File | Type |
|---|---------|-------|------|------|
| O1 | Qualified positive reply / trial request / booked call | Interest confirmed | `emails/onboarding-1-interest-confirmed.html` | Lifecycle |
| O2 | Trial approved **and dispatch confirmed** | Trial dispatched | `emails/onboarding-2-trial-dispatched.html` | **Transactional** |
| O3 | Confirmed delivery + waiting period | Post-trial check-in | `emails/onboarding-3-post-trial-check-in.html` | Lifecycle |
| O4 | Human commercial conversation done + approved terms exist | Approved trade summary | `emails/onboarding-4-trade-summary.html` | Commercial (all tokens) |
| O5 | Valid order placed | First order confirmation | `emails/onboarding-5-first-order-confirmation.html` | **Transactional** |

## Handoff & stop conditions

- A cold recipient **exits the outreach sequence immediately** on: reply, booked call, trial request, unsubscribe, complaint, hard bounce, becoming ineligible, or manual suppression.
- A positive response **transfers the contact to onboarding**; the two stages must never run concurrently for the same contact.
- O2 and O5 are **transactional** and must be kept separate from marketing sends; do not insert promotional modules into them.
- O2 must not be generated/sent unless dispatch is confirmed. O4 must not be sent until an approved trade record exists. O5 only on a valid order.

## Files

- `README.md` — this brief.
- `sequence.md` — the 5 outreach emails: subjects, preview, plain-text body, tokens, exit.
- `onboarding.md` — the 5 onboarding emails: triggers, plain-text, tokens, stop-send rules.
- `email-data.json` — the single content source rendered by `../_shared/master-template.js`.
- `studio.json` — Studio display metadata, scheduled days and triggered-message classification.
- `resend.json` — draft Resend template aliases; publishing remains an explicit release action.
- `emails/` — generated HTML (do not hand-edit; edit `email-data.json` and rebuild).

## Build

Registered in `../_shared/build-all.js`. Rebuild from the repo root:

```bash
node email/campaigns/_shared/build-all.js us-west-coast-salon-stockist
```

Run `node email/campaigns/_shared/build-all.js --check` to validate every registered master-template campaign without rewriting generated files.

## Unresolved approval tokens (must be approved before any send)

Commercial/fulfilment: `{{us_trade_price}}`, `{{opening_order}}`, `{{reorder_minimum}}`, `{{shipping_terms}}`, `{{lead_time}}`, `{{approved_product_range}}`, `{{us_fulfilment_statement}}`, `{{training_support}}`, `{{order_link}}`.
Transactional: `{{order_number}}`, `{{order_summary}}`, `{{order_total}}`, `{{dispatch_date}}`, `{{tracking_link}}`, `{{support_email}}`, `{{training_link}}`, `{{reorder_link}}`.
Identity/links: `{{sender_name}}`, `{{sender_title}}`, `{{sender_email}}`, `{{calendar_link}}`, `{{trial_link}}`, `{{trade_link}}`, `{{shade_guide_link}}`, `{{business_address}}`, `{{unsubscribe_link}}`.
Personalisation: `{{first_name}}`, `{{business_name}}`, `{{business_type}}`, `{{city}}`, `{{state}}`.

No commercial fact (price, terms, delivery, availability, range) is stated in copy — all are tokens with stop-send rules. See `sequence.md` / `onboarding.md` token tables.

## Exclusions

Generic personal inboxes without a lawful outreach basis; scraped consumer addresses; non-tanning beauty businesses; existing customers/active partners; suppressed/unsubscribed/complained/hard-bounced contacts; roles not commercially relevant.

## Compliance notes (test — requires human legal sign-off)

- **US CAN-SPAM:** accurate sender identity, valid physical postal address (`{{business_address}}`), and a working opt-out (`{{unsubscribe_link}}`) that is honored promptly. No deceptive subject/header lines.
- **California (CCPA/CPRA) and OR/WA privacy:** confirm lawful basis, data provenance, and any notice/opt-out obligations for business-contact data.
- **Recipient basis:** business-to-business outreach only; confirm the permitted basis and data source before any send. Do not source, import, or build a list in this test.
- **Suppression:** the application owns eligibility (consent, complaint, bounce, unsubscribe, manual). Provider (Resend) suppression is an input, not the sole source. Suppress before every send.
- This document does not constitute legal approval.
