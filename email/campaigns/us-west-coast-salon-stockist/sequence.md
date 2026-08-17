# US West Coast Jimmy Coco Pro Recruitment — V2 Sequence

**Status:** Draft in Resend. Not approved for sending.
**Audience:** Eligible professional salons, spas and mobile professionals in the approved U.S. West Coast service area.
**Goal:** Secure an eligible professional trial/application, then route the prospect to an individual trade review.
**Primary CTA:** `{{TRIAL_LINK}}` — Request professional trial information.

> **Exit rule:** Stop immediately on reply, trial request/application, unsubscribe, complaint, hard bounce, existing-customer match, ineligibility or manual suppression. Positive intent exits cold outreach and becomes a human Partnerships review.

| Day | Resend alias | Subject | Job |
|---:|---|---|---|
| 0 | `jc-us-wc-prospect-01-trial-v2` | A premium spray-tan partnership for `{{BUSINESS_NAME}}` | Introduce the partnership and eligibility-based 100 ml trial route. |
| 4 | `jc-us-wc-prospect-02-result-v2` | Color clients trust in daylight | Explain natural-looking colour through the client’s real-world experience. |
| 8 | `jc-us-wc-prospect-03-retail-v2` | One client relationship, two useful revenue moments | Present treatment and aftercare as one coherent client journey. |
| 13 | `jc-us-wc-prospect-04-partner-path-v2` | A trial-first way to begin | Explain training, guidance and case-by-case availability confirmation. |
| 19 | `jc-us-wc-prospect-05-close-v2` | Shall I close this for now? | Close respectfully and stop the sequence. |

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

> **Professional trial:** Eligible U.S. professional partners can request a complimentary 100 ml professional trial sample. Jimmy Coco confirms current sample availability for the individual business before shipping.

> **US footer:** Advertisement from Jimmy Coco LA Spray-Tan Studio · Suite 313, 9301 Wilshire Blvd, Beverly Hills, CA 90210.

> **No unsupported commercial promise:** The sequence does not quote fixed US trade prices, delivery timings, state-specific shipping availability or stock position. These are confirmed after the professional request is reviewed.

## Retail attachment playbook

The V2 commercial story makes retail helpful rather than high-pressure. A professional partner can recommend the Buff & Glow Mitt for maintenance, Self Tan Soufflé for a between-appointment top-up, and the A-List Glow Kit for a premium routine or gift. The practical rule is one client-care question, one relevant recommendation, and a second only where the client’s stated need supports it.

## Resend implementation

The V2 templates are drafts only. Before any launch, use controlled audience properties for market, business type, eligibility, data source, trial status and trade status. Confirm sample eligibility case by case before accepting or fulfilling a U.S. trial request.
