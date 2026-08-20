# Sydney Salon Stockist Recruitment — Cold Outreach

**Goal:** recruit independent Greater Sydney spray-tan salons and studios as stockists of the Sunless by Jimmy Coco *Malibu* professional line, opening with a complimentary trial.
**Audience:** owners and managers of premium Sydney salons, spray-tan studios and mobile tanning professionals — businesses with premium positioning and clients who value natural, expert-led colour.
**Market:** 🇦🇺 AU — Greater Sydney (Eastern Suburbs, Inner West, Northern Beaches, North Shore, CBD, Sutherland Shire). Timezone `Australia/Sydney`.
**Offer / hook:** *A Sydney glow, without the Sydney sun* — a sun-safe, believable professional tan that holds up under harsh UV and summer humidity. Email 1 offers a **complimentary trial** of the Malibu solution + Jimmy's shade guide.
**Primary outcome:** a professional **trial / sample-kit request** (reply-led). Secondary: a booked 15-minute partnership call.
**Channel & ESP:** Email (Resend, shared master template) + a WhatsApp companion track. Emails 1, 2 and 5 are best sent plain-text; 3 and 4 can use the branded HTML.
**Status:** `DRAFT — NOT APPROVED FOR SEND`
**Owner:** {{sender_name}} / {{sender_title}} — *[SOURCE REQUIRED: assign a real, monitored human owner before any review-to-send step].*

## Positioning vs existing AU campaigns (lifecycle-collision check)

- `../au-salon-seeding/` — national AU cold seeding. **This Sydney campaign must run mutually exclusive with it:** suppress any salon already contacted by au-salon-seeding so no salon receives both. This campaign is Sydney-metro-targeted with a distinct sun-safety / humidity angle rather than the national red-carpet framing.
- `../au-salon-account-flow/` — post-sample partner flow. **Handoff:** a positive reply / trial request exits this sequence and transfers the contact there (bridge copy: `../au-salon-seeding/onboarding.md`). The two never run concurrently for one contact.
- `../../03-sequences/` — D2C consumer lifecycle (welcome, cart, replenishment, VIP). Different audience (end consumers, not salons); no collision.

## Cadence (~3 weeks)

| # | Day | Touch | Channel | File |
|---|-----|-------|---------|------|
| 1 | 0 | Opener + complimentary trial | Email | `emails/1-opener.html` |
| — | 1 | Warm intro | WhatsApp | `whatsapp.md` |
| 2 | 3 | Believable colour / humidity | Email | `emails/2-believable-colour.html` |
| — | 6 | Trial nudge | WhatsApp | `whatsapp.md` |
| 3 | 8 | Two revenue lines | Email | `emails/3-two-revenue-lines.html` |
| — | 9 | Two ways to earn | WhatsApp | `whatsapp.md` |
| 4 | 13 | Season readiness | Email | `emails/4-season-readiness.html` |
| — | 15 | Season urgency | WhatsApp | `whatsapp.md` |
| 5 | 20 | Last call | Email | `emails/5-last-call.html` |
| — | 22 | Warm sign-off | WhatsApp | `whatsapp.md` |
| + | on reply | Onboarding handoff | Email + WA | `../au-salon-account-flow/` (via `../au-salon-seeding/onboarding.md`) |

Stop **both** tracks the instant a salon replies on either channel, and move to a real conversation.

## Files
- `README.md` — this brief.
- `sequence.md` — the 5 cold emails (subjects, preview, plain-text body) + tokens.
- `email-data.json` — the single content source rendered by `../_shared/master-template.js`.
- `studio.json` — Studio display metadata and send-day timeline.
- `whatsapp.md` — the 5 WhatsApp messages + compliance notes.
- `emails/` — generated HTML (do not hand-edit; edit `email-data.json` and rebuild).

## Exit / stop conditions

Exit immediately on: reply, trial/sample requested, call booked, unsubscribe, complaint, hard bounce, existing customer/active partner, discovery that the recipient is ineligible, or manual suppression.

## Exclusions

Generic personal inboxes without a lawful outreach basis; scraped consumer addresses; non-tanning businesses; existing customers/active partners; suppressed / unsubscribed / complained / hard-bounced contacts; roles not commercially relevant; any salon currently in `../au-salon-seeding/`.

## Unresolved approval tokens (must be approved before any send)

- **Offer:** confirm the complimentary trial is approved for AU and what it contains — `{{trial_kit_contents}}`.
- **Identity / links:** `{{sender_name}}`, `{{sender_title}}`, `{{sender_email}}`, `{{calendar_link}}`, `{{shade_guide_link}}`, `{{business_address}}`, `{{unsubscribe_link}}`.
- **Personalisation:** `{{first_name}}`, `{{salon_name}}`, `{{city}}`.
- **Trade terms** are intentionally **not stated** in the cold copy — they are handled on the call and in `../au-salon-account-flow/`, and remain tokens (`{{wholesale_margin}}`, `{{min_opening_order}}`, `{{lead_time}}`, …).

No commercial fact (price, terms, delivery, availability, product range) is stated in the copy — all are deferred or tokenised.

## Compliance notes (requires human sign-off — not legal advice)

- **AU Spam Act 2003:** accurate sender identification, a functional unsubscribe in every send, and contact only business roles for whom the message is genuinely relevant. Business-to-business basis only; confirm the permitted basis and data source before any send. Do not source, import or build a list as part of producing this draft.
- **WhatsApp:** one-to-one only for cold contacts; no broadcast lists or bulk cold messaging (breaches WhatsApp Business Policy). Business-initiated API messages must use a pre-approved Marketing template with an opt-out line. See `whatsapp.md`.
- **Registry / send:** not registered in `shared/campaign-registry.js`, and no Resend templates are published yet. Register the campaign disabled with real published template IDs, and publish via `npm run templates:publish`, only after human approval.
