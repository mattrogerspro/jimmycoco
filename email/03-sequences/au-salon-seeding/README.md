# AU Salon Seeding — Cold Outreach Campaign

_Channel: email + WhatsApp · Audience: Australian spray-tan salons · Built July 2026_

A cold-outreach campaign to seed Australian spray-tan salons in winter so they're stocked, trained and ready before the summer season (spring racing → Christmas/NYE → Jan–Feb peak).

## The offer
- **Both revenue lines:** the *Sunset* professional solution for the booth **and** a curated take-home retail range for the shelf.
- **Email-1 hook:** a free sample of the Sunset solution + Jimmy's shade guide.
- **Posture:** premium, authority-led — never discount-led.

## Contents

| File | What it is |
|---|---|
| `playbook-email.html` | Full email strategy playbook — season rationale, cadence, subject matrix, deliverability, KPIs, copy-ready bodies. |
| `playbook-whatsapp.html` | WhatsApp companion playbook — combined cadence, chat-bubble messages, compliance. |
| `email-sequence.md` | Copy-ready 5-email cold sequence (plain text) + tokens. |
| `whatsapp-sequence.md` | Copy-ready 5-message WhatsApp track + combined cadence. |
| `onboarding.md` | "Yes — here's what's next" welcome (email + WhatsApp) for salons who bite. |
| `shade-guide.pdf` | One-page Shade & Undertone Guide — the asset behind `{{shade_guide_link}}`. |
| `shade-guide.html` | Editable source for the shade guide (A4, print to PDF). |
| `templates/` | Branded, email-safe HTML templates (see below). |

### `templates/`
- `email-01-intro.html` — opener (branded variant)
- `email-03-two-revenue-lines.html` — the commercial case
- `email-04-season-readiness.html` — season urgency
- `email-onboarding-welcome.html` — welcome / next steps

## Cadence (combined, ~3 weeks)

```
Day 0  Email 1  Opener + free sample
Day 1  WA 1     Warm intro + sample offer
Day 5  Email 2  Nudge
Day 6  WA 2     "Want me to post that sample?"
Day 8  Email 3  Two revenue lines  (branded HTML)
Day 9  WA 3     Two ways to earn + call / voice note
Day 13 Email 4  Season readiness    (branded HTML)
Day 15 WA 4     Season urgency
Day 20 Email 5  Last call
Day 22 WA 5     Warm sign-off + shade guide
```
**Stop both tracks the instant a salon replies on either channel**, then move to `onboarding.md`.

## Sending via Resend

Emails are sent/received through **Resend** (a Resend MCP will be connected to this project).

- **Authenticate the sending domain** in Resend — SPF, DKIM and DMARC — before any send.
- **Use a dedicated subdomain for cold** (e.g. `outreach.` or `mail.`) and warm it over 2–3 weeks, so cold volume never risks the primary domain's reputation.
- **Branded templates** in `templates/` are plain HTML — send them via Resend's API directly, or port to React Email.
- **Plain-text cold** (Emails 1, 2, 5) — send as `text` and keep the CTA reply-based; these land best without HTML.
- **Onboarding, sample confirmations and trade comms** are natural transactional sends for Resend.
- Include a working unsubscribe + physical address on every send (**AU Spam Act 2003**); for WhatsApp follow the WhatsApp Business Messaging Policy (see the WhatsApp playbook).

## Personalisation tokens
`{{first_name}}` · `{{salon_name}}` · `{{city}}` · `{{sender_name}}` · `{{sender_first}}` · `{{sender_title}}` · `{{calendar_link}}` · `{{shade_guide_link}}` · `{{business_address}}` · `{{unsubscribe_link}}`

## Notes & open items
- Product data (SKUs, prices, dev times) is intentionally not hard-coded here — the repo's structured catalogue is still pending (see `AUDIT.md`). Copy stays method- and benefit-led.
- The shade guide is method-led and safe to share as a lead magnet; swap `{{contact}}` in the footer for a real contact.
- Next: a full post-sample account flow (sample-received check-in, post-call trade-terms summary, first-order confirmation) sits beyond this cold sequence.
