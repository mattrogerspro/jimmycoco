# US West Coast Jimmy Coco Pro Recruitment — V2

**Goal:** Start qualified professional conversations with eligible U.S. West Coast salons, spas and mobile professionals, then review the trial/application case by case.
**Market:** 🇺🇸 US West Coast.
**Channel:** Email — Resend.
**Status:** Repository HTML/text delivery implemented. Campaign disabled and not approved for sending.
**Hook:** Trial-first natural-looking colour with relevant client-aftercare retail.

## Current offer and first conversion

Eligible professional partners can request a **complimentary 100 ml professional trial sample** at `{{TRIAL_LINK}}`. Jimmy Coco confirms current sample availability for the individual business before shipping. The V2 sequence does not state fixed trade prices, state-specific availability, fulfilment timelines or an unverified commercial promise.

## Cadence

| Day | Resend alias | File | Purpose |
|---:|---|---|---|
| 0 | `jc-us-wc-prospect-01-trial-v2` | `emails/1-trial-introduction-v2.html` | Partnership introduction and eligibility-based trial route. |
| 4 | `jc-us-wc-prospect-02-result-v2` | `emails/2-result-v2.html` | Natural-looking colour in the client’s real-world environment. |
| 8 | `jc-us-wc-prospect-03-retail-v2` | `emails/3-retail-v2.html` | Treatment and useful aftercare retail as one client journey. |
| 13 | `jc-us-wc-prospect-04-partner-path-v2` | `emails/4-partner-path-v2.html` | Trial-first guidance and human review path. |
| 21 | `jc-us-wc-prospect-06-process-v2` | `emails/6-process-v2.html` | Explain review, availability and first-order process. |
| 32 | `jc-us-wc-prospect-07-choice-v2` | `emails/7-choice-v2.html` | Invite a direct human-routed conversation. |
| 45 | `jc-us-wc-prospect-05-close-v2` | `emails/5-close-v2.html` | Respectful close and permanent sequence exit. |

## Operating controls

The source of truth is `email-data.json`; run `node email/campaigns/_shared/build-all.js us-west-coast-salon-stockist` after any source change to regenerate HTML, plain text and the immutable runtime content module. `resend.json` keeps the old Resend V2 aliases and IDs for rollback history only. `studio.json`, `sequence.md` and `shared/campaign-registry.js` expose the draft sequence and live Resend-webhook statistics to the online Playbook.

Stop a contact immediately for reply, trial request/application, unsubscribe, complaint, hard bounce, existing-customer match, ineligibility or manual suppression. A positive reply exits cold outreach and passes to a human Partnerships review; it must not run alongside any onboarding path.

## Footer and sender

The V2 sender is `Sunless Partnerships <partnerships@email.jimmycoco.pro>`. The U.S. footer is **Advertisement from Jimmy Coco LA Spray-Tan Studio · Suite 313, 9301 Wilshire Blvd, Beverly Hills, CA 90210**. Every promotional message must contain the application-generated signed unsubscribe URL and one-click headers.

## Existing onboarding assets

The historical `onboarding.md` and existing onboarding HTML remain available as separate post-interest reference material. They must be reviewed and mapped to confirmed availability, trade terms and delivery events before any U.S. lifecycle automation is enabled.
