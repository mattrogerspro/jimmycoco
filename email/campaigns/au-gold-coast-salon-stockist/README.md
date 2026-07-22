# Gold Coast Salon Stockist Recruitment

**Goal:** start qualified conversations with relevant Gold Coast salon and studio owners about becoming Sunless by Jimmy Coco stockists.
**Audience:** owners and managers of established tanning salons, beauty salons and studios whose current services and positioning make a professional tanning partnership relevant.
**Market:** Gold Coast, Queensland, Australia. Timezone `Australia/Brisbane`.
**Primary outcome:** a qualified reply requesting stockist information or a short partnership conversation.
**Offer / hook:** a calm, no-pressure introduction to the professional range, support model and approved stockist pathway. No sample, price, margin or territory promise is made without approval.
**Channel & ESP:** Email via Resend using the shared master template.
**Status:** `DRAFT — NOT APPROVED FOR SEND`.
**Owner:** `{{sender_name}}`, `{{sender_title}}` — assign a real owner with a monitored reply address before release.

## Strategy

The sequence moves from local relevance to professional method, client experience, partner support, commercial due diligence, a simple pathway and a respectful close. Each message has one dominant action: reply to start or continue a qualified conversation.

### Entry criteria

- A verified business contact for a relevant Gold Coast salon or studio.
- The recipient holds a commercially relevant owner, manager or buying role.
- The documented recipient source and contact basis have passed Australian legal review.
- The contact is not suppressed and is not active in another AU prospecting or account flow.

### Exclusions

- Scraped or purchased consumer addresses and unverified personal inboxes.
- Generic addresses unless their use is specifically approved for relevant B2B contact.
- Existing stockists, customers in an active account flow, ineligible businesses, and contacts with an unsubscribe, complaint, hard bounce or manual suppression.
- Any contact active in `au-salon-seeding`, `au-sydney-salon-stockist` or another prospecting sequence.

### Stop and handoff rules

Stop all future touches immediately after any reply, stockist-information request, call booking, unsubscribe, complaint, hard bounce, manual suppression or discovery of ineligibility. A positive reply moves to a real human conversation. Once the approved account milestone is reached, hand off to `../au-salon-account-flow/`; never run both sequences concurrently.

## Cadence

| # | Day | Purpose | Primary action | HTML |
|---|---:|---|---|---|
| 1 | 0 | Relevant introduction | Reply for stockist information | `emails/1-introduction.html` |
| 2 | 3 | Professional method | Reply about current service priorities | `emails/2-professional-method.html` |
| 3 | 7 | Client experience | Request the range overview | `emails/3-client-experience.html` |
| 4 | 11 | Partner support | Ask what support is available | `emails/4-partner-support.html` |
| 5 | 16 | Commercial due diligence | Request approved trade details | `emails/5-commercial-fit.html` |
| 6 | 22 | Stockist pathway | Start a stockist conversation | `emails/6-stockist-pathway.html` |
| 7 | 30 | Respectful close | Reply later if relevant | `emails/7-close-the-loop.html` |

## Lifecycle collision check

Consumer welcome, abandonment, post-purchase, replenishment, win-back and VIP flows target a different audience. If a business contact is also a consumer, service and high-intent lifecycle messages take precedence and this outreach must respect the 16-hour non-transactional contact gap. AU prospecting campaigns are mutually exclusive. The post-reply AU account flow begins only after this campaign exits.

## Asset candidate table

| Asset ID | Source | Possible role | Status | AU/email/purpose rights | Derivative/public URL | Decision |
|---|---|---|---|---|---|---|
| `celebrity-heidi-k-source` | `assets/images/celebs/heidi_k.webp` | Proof | Review required | Not approved | Missing | Do not use |
| `celebrity-k-jenna-source` | `assets/images/celebs/k_jenna.webp` | Proof | Review required | Not approved | Missing | Do not use |
| `celebrity-kim-k-source` | `assets/images/celebs/kim_k.webp` | Proof | Review required | Not approved | Missing | Do not use |
| `celebrity-kylie-k-source` | `assets/images/celebs/kylie_k.webp` | Proof | Review required | Not approved | Missing | Do not use |
| `celebrity-teyana-t-source` | `assets/images/celebs/teyana_t.webp` | Proof | Review required | Not approved | Missing | Do not use |

The campaign is deliberately text-led because no manifest asset is currently production-eligible for AU email stockist recruitment. Essential meaning remains live text.

## Approval tokens

- Identity: `{{sender_name}}`, `{{sender_title}}`, `{{sender_email}}`, `{{business_address}}`.
- Compliance: `{{unsubscribe_link}}`, recipient source and permitted contact basis.
- Personalisation: `{{first_name}}`, `{{salon_name}}`, `{{suburb}}` with verified fallbacks at send time.
- Commercial truth: `{{approved_range_summary}}`, `{{approved_partner_support}}`, `{{approved_trade_terms}}`, `{{approved_opening_requirements}}`, `{{approved_delivery_statement}}`, `{{approved_stockist_pathway}}`.
- Legal: Australian Spam Act review, sender-identification review and functioning unsubscribe verification.

## Files

- `README.md` — strategy, eligibility, cadence, handoff and approval gaps.
- `sequence.md` — complete human-readable copy and subject options.
- `email-data.json` — canonical renderer input.
- `studio.json` — Studio metadata and timeline.
- `emails/` — generated HTML; never edit by hand.

This campaign is not registered in `shared/campaign-registry.js` and remains unable to operate. Registration, Resend publication, recipient enrolment and enablement require separate explicit approval.
