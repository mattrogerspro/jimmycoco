# UK Jimmy Coco Pro Recruitment — 28-Day Sequence

**Goal:** Convert eligible UK professional tanning salons, aesthetics clinics and mobile spray artists into a qualified Jimmy Coco Pro trial request or a professional 1-litre order enquiry.
**Audience:** UK corporate salons and spas; mobile professionals only where soft opt-in or consent is documented.
**Market:** 🇬🇧 UK  
**Channel:** Promotional email through Resend.  
**Status:** Repository HTML/text delivery implemented. Campaign remains disabled pending review and release gates.
**Owner:** Matthew at Jimmy Coco Pro.

## Hook and conversion route

The sequence leads with a complimentary 100 ml professional trial sample, shipped free for eligible UK professionals. It then moves through formula, service economics, client-care aftercare, a trial checklist, practical onboarding and a final decision. The primary CTA is `{{TRIAL_LINK}}`; the verified professional trade-order route is `https://www.jimmycoco.pro/products/malibu-professional-spray-1l#complete-order`.

## Cadence

| Day | File | Role |
|---:|---|---|
| 0 | `emails/1-trial-introduction-v2.html` | Hook and complimentary trial |
| 3 | `emails/2-result-v2.html` | Formula and workflow |
| 6 | `emails/3-economics-v2.html` | Salon maths and trade-order option |
| 10 | `emails/4-retail-v2.html` | Retail and client aftercare |
| 15 | `emails/5-trial-guide-v2.html` | Real-client trial guide and low one-litre minimum |
| 21 | `emails/6-onboarding-v2.html` | Professional order route and rollout conversation |
| 28 | `emails/7-close-v2.html` | Respectful close and three clear options |

## Operating controls

The source of truth is `email-data.json`; regenerate HTML, plain text and the immutable runtime content module with `node email/campaigns/_shared/build-all.js uk-salon-stockist` after any source change. `resend.json` retains legacy provider-template IDs for rollback history only. `studio.json`, `sequence.md` and `shared/campaign-registry.js` expose the sequence and its live Resend-webhook statistics in the online Playbook.

Exit a prospect on any reply, trial request/application, unsubscribe, complaint, hard bounce, existing-customer match or manual suppression. Until the order system emits a verified outreach-exit event, manually suppress any known trade-order contact immediately. Do not make the sequence live until the eligible contact segment, permission fields, reply handling and form/order suppression path are tested.

## Sender and compliance

Use `Matthew at Jimmy Coco Pro <partnerships@email.jimmycoco.pro>` with reply-to `matthew@jimmycoco.pro`. The footer must retain **JIMMY COCO (UK) LIMITED · 22 St. James's Walk, London, England, EC1R 0AP** and the application-generated signed unsubscribe URL.
