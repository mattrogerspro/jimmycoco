# UK Jimmy Coco Pro Recruitment — V2

**Goal:** Convert eligible UK professional salons and spas into qualified Jimmy Coco Pro trial applicants, then hand them to the trade lifecycle.
**Audience:** UK corporate salons/spas; mobile professionals only where soft opt-in or consent is documented.
**Market:** 🇬🇧 UK
**Channel:** Email — Resend.
**Status:** V2 templates created in Resend as drafts. Not approved for sending.
**Hook:** Trial-first premium spray-tan service with useful client-care retail.

## Current offer and first conversion

Eligible UK professional partners can request a **complimentary 100 ml professional trial sample, shipped free**. The primary CTA in every V2 email is `{{TRIAL_LINK}}`; reply is the secondary path. Do not substitute a legacy `.co.uk` landing page or “Order Now” CTA into the cold sequence.

## Cadence

| Day | Resend alias | File | Purpose |
|---:|---|---|---|
| 0 | `jc-uk-prospect-01-trial-v2` | `emails/1-trial-introduction-v2.html` | Premium named-service introduction and trial. |
| 3 | `jc-uk-prospect-02-result-v2` | `emails/2-result-v2.html` | Natural-looking result and professional method. |
| 7 | `jc-uk-prospect-03-economics-v2` | `emails/3-economics-v2.html` | £60 litre / approximately 28-treatment context. |
| 12 | `jc-uk-prospect-04-retail-v2` | `emails/4-retail-v2.html` | Client-care retail attachment. |
| 18 | `jc-uk-prospect-05-close-v2` | `emails/5-close-v2.html` | Respectful final note and stop. |

## Operating controls

The source of truth is `email-data.json`; run `node email/campaigns/_shared/build-all.js uk-salon-stockist` after any source change. `resend.json` stores the actual Resend V2 template aliases and IDs. `studio.json`, `sequence.md` and `shared/campaign-registry.js` expose the draft sequence to the local marketing/playbook system.

The global exit conditions are reply, trial request/application, unsubscribe, complaint, hard bounce, existing-customer match, ineligibility and manual suppression. Do not make the sequence live until the eligible contact segment, source/permission fields and seed-test review are complete.

## Footer and sender

The V2 sender is `Sunless Partnerships <partnerships@email.jimmycoco.pro>`. The UK footer is **JIMMY COCO (UK) LIMITED · 22 St. James's Walk, London, England, EC1R 0AP**. Resend’s unsubscribe variable must remain enabled in every published promotional message.
