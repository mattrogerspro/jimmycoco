# UK Jimmy Coco Pro Recruitment — V2 Sequence

**Status:** Draft in Resend. Not approved for sending.
**Audience:** Eligible UK corporate salons and spas, plus mobile professionals only where soft opt-in or consent is documented.
**Goal:** Secure an eligible professional trial/application, then hand the prospect to the trade lifecycle.
**Primary CTA:** `{{TRIAL_LINK}}` — Request your complimentary professional trial.

> **Exit rule:** Stop immediately on reply, trial request/application, unsubscribe, complaint, hard bounce, existing-customer match, ineligibility or manual suppression. Positive intent passes to the trade lifecycle; it does not continue through cold outreach.

| Day | Resend alias | Subject | Job |
|---:|---|---|---|
| 0 | `jc-uk-prospect-01-trial-v2` | The tan your clients ask for — now in your treatment room | Introduce the premium named service and complimentary 100 ml trial. |
| 3 | `jc-uk-prospect-02-result-v2` | The details clients notice after their tan | Explain result quality and repeatable professional method. |
| 7 | `jc-uk-prospect-03-economics-v2` | The salon maths behind a premium tan | Frame the £60 litre, approximate 28 treatments and £2.14 solution-cost context without promising margin. |
| 12 | `jc-uk-prospect-04-retail-v2` | The easiest retail conversation happens after the tan | Make retail a useful client-care recommendation, including for mobile professionals. |
| 18 | `jc-uk-prospect-05-close-v2` | Shall I close this for now? | Close respectfully and stop the sequence. |

## Required send-time fields

| Field | Required use |
|---|---|
| `FIRST_NAME` | Greeting. |
| `BUSINESS_NAME` | Personal relevance. |
| `BUSINESS_TYPE` | Salon, spa, mobile professional or group wording. |
| `TRIAL_LINK` | Current approved Jimmy Coco Pro trial endpoint. |
| `SENDER_NAME` / `SENDER_TITLE` | Identified human Partnerships reply path. |
| `RESEND_UNSUBSCRIBE_URL` | Resend unsubscribe insertion. |

## Approved commercial constants

> **Professional trial:** Eligible UK professional partners can request a complimentary 100 ml professional trial sample, shipped free.

> **Current product economics:** A £60 UK professional litre is designed for approximately 28 full-body tans, or roughly £2.14 solution cost per tan before labour, disposables, card fees, premises and tax. This does not set a salon’s retail price or profit.

> **UK footer:** JIMMY COCO (UK) LIMITED · 22 St. James's Walk, London, England, EC1R 0AP.

## Retail attachment playbook

The email sequence introduces retail as practical aftercare, not a hard sell. The partner-facing recommendation is simple: use the Buff & Glow Mitt for maintenance, Self Tan Soufflé for between-appointment top-ups, and the A-List Glow Kit as a premium routine or gifting option. Ask one client-care question, offer one relevant product, and offer a second only when the client’s need clearly supports it.

## Resend implementation

The direct Resend templates are V2 drafts only. Before publishing or enabling an automation, use the controlled audience properties `market`, `outreach_eligible`, `permission_status`, `data_source`, `trial_status` and `trade_status`. Do not load UK mobile/sole-trader records without documented soft opt-in or consent.
