# US West Coast Jimmy Coco Pro Recruitment — V2

**Goal:** Start qualified professional conversations with eligible U.S. West Coast salons, spas and mobile professionals, then review the trial/application case by case.
**Market:** 🇺🇸 US West Coast.
**Channel:** Repository-rendered email delivered through the Resend Send Email API.
**Status:** Seven repository-rendered V2 messages are ready for review. The campaign remains disabled and is not approved for sending.
**Hook:** Trial-first natural-looking colour with relevant client-aftercare retail.

## Current offer and first conversion

Eligible professional partners can request a **complimentary 100 ml professional trial sample** at `{{TRIAL_LINK}}`. Jimmy Coco confirms current sample availability for the individual business before shipping. The V2 sequence does not state fixed trade prices, state-specific availability, fulfilment timelines or an unverified commercial promise.

## Cadence

| Day | Resend alias | File | Purpose |
|---:|---|---|---|
| 0 | `jc-us-wc-prospect-01-trial-v2` | `emails/1-trial-introduction-v2.html` | Partnership introduction and eligibility-based trial route. |
| 3 | `jc-us-wc-prospect-02-result-v2` | `emails/2-result-v2.html` | Natural-looking colour in the client’s real-world environment. |
| 6 | `jc-us-wc-prospect-03-retail-v2` | `emails/3-retail-v2.html` | Treatment and useful aftercare retail as one client journey. |
| 10 | `jc-us-wc-prospect-04-partner-path-v2` | `emails/4-partner-path-v2.html` | Trial-first guidance and human review path. |
| 15 | `jc-us-wc-prospect-06-process-v2` | `emails/6-process-v2.html` | Explain the professional review, trial availability and first-order process. |
| 21 | `jc-us-wc-prospect-07-choice-v2` | `emails/7-choice-v2.html` | Invite a direct formula or retail conversation. |
| 28 | `jc-us-wc-prospect-05-close-v2` | `emails/5-close-v2.html` | Respectful close and permanent sequence exit. |

## Operating controls

The source of truth is `email-data.json`; run `node email/campaigns/_shared/build-all.js us-west-coast-salon-stockist` after any source change. The worker renders this repository source and sends complete HTML directly through Resend; it does not use Resend Templates. `resend.json` is retained only as an audit record of the retired template copies. `studio.json`, `sequence.md` and `shared/campaign-registry.js` expose the draft sequence to the local marketing/playbook system.

Stop a contact immediately for reply, trial request/application, unsubscribe, complaint, hard bounce, existing-customer match, ineligibility or manual suppression. A positive reply exits cold outreach and passes to a human Partnerships review; it must not run alongside any onboarding path.

## Footer and sender

The V2 sender is `Sunless Partnerships <partnerships@email.jimmycoco.pro>` with reply-to `partnerships@email.jimmycoco.pro`. That reply-to must be Resend-managed inbound mail so replies exit the playbook as `reply` before forwarding to Matthew. The U.S. footer is **Advertisement from Jimmy Coco LA Spray-Tan Studio · Suite 313, 9301 Wilshire Blvd, Beverly Hills, CA 90210**. Retain the application-signed `PREFERENCES_LINK` in every promotional message.

## Existing onboarding assets

The historical `onboarding.md` and existing onboarding HTML remain available as separate post-interest reference material. They must be reviewed and mapped to confirmed availability, trade terms and delivery events before any U.S. lifecycle automation is enabled.
