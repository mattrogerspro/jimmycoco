# AU Salon Seeding — Cold Outreach

**Goal:** seed Australian spray-tan salons in winter so they're stocked, trained and ready before summer (spring racing → Christmas/NYE → Jan–Feb peak).
**Audience:** AU spray-tan salons — owners & managers.
**Market:** 🇦🇺 AU
**Offer / hook:** both revenue lines (Sunset pro solution for the booth + take-home retail range); email-1 hook is a **free sample** + Jimmy's shade guide.
**Channel:** Email + WhatsApp (deliverability-first plain text, plus branded HTML). ESP: Resend.
**Status:** Draft
**Handoff:** positive replies move to [`../au-salon-account-flow/`](../au-salon-account-flow/).

## Cadence (combined email + WhatsApp, ~3 weeks)

| # | Day | Touch | Channel | File |
|---|-----|-------|---------|------|
| 1 | 0 | Opener + free sample | Email | `emails/1-opener.html` |
| — | 1 | Warm intro | WhatsApp | `whatsapp.md` |
| 2 | 5 | Nudge | Email | _plain text — `sequence.md`_ |
| — | 6 | Sample nudge | WhatsApp | `whatsapp.md` |
| 3 | 8 | Two revenue lines | Email | `emails/3-two-revenue-lines.html` |
| — | 9 | Two ways to earn | WhatsApp | `whatsapp.md` |
| 4 | 13 | Season readiness | Email | `emails/4-season-readiness.html` |
| — | 15 | Season urgency | WhatsApp | `whatsapp.md` |
| 5 | 20 | Last call | Email | _plain text — `sequence.md`_ |
| — | 22 | Warm sign-off | WhatsApp | `whatsapp.md` |
| + | on reply | Onboarding welcome | Email + WA | `emails/onboarding-welcome.html` · `onboarding.md` |

_Emails 2 & 5 are plain-text by design (best cold-inbox placement), so they have no file in `emails/`._

## Files
- `sequence.md` — the 5-email cold copy (subjects, preview, body) + tokens
- `whatsapp.md` — the 5-message WhatsApp track + combined cadence
- `onboarding.md` — post-reply "yes, what's next" (email + WhatsApp)
- `emails/` — branded HTML: `1-opener`, `3-two-revenue-lines`, `4-season-readiness`, `onboarding-welcome`
- `docs/` — reference (not for sending):
  - `playbook-email.html` — full email strategy playbook (season rationale, subject matrix, deliverability, KPIs)
  - `playbook-whatsapp.html` — WhatsApp companion playbook
  - `shade-guide.pdf` / `.html` — the one-page shade guide behind `{{shade_guide_link}}`

## Notes
- Product data (prices, SKUs, dev times) intentionally not hard-coded — copy stays method/benefit-led.
- Compliance: AU Spam Act 2003 (sender ID + unsubscribe/STOP); WhatsApp Business Messaging Policy for the WA track.
