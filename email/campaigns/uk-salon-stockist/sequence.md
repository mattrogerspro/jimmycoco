# UK Jimmy Coco Pro Recruitment — 28-Day Sequence

**Status:** Source updated for human review and template release. The Resend automation remains disabled.
**Audience:** Eligible UK corporate salons, aesthetics clinics and mobile spray-tan professionals where soft opt-in or consent is documented.
**Primary outcome:** A qualified complimentary 100 ml professional trial request. A professional order enquiry is a secondary path for businesses already ready to review the 1-litre route.
**Reply owner:** Matthew at Jimmy Coco Pro. `TRIAL`, `SAMPLE`, `NUMBERS`, `RETAIL` and `ORDER` are human-handled reply signals.

> **Stop rule:** Stop future cold outreach immediately on a reply, trial request/application, unsubscribe, complaint, hard bounce, existing-customer match or manual suppression. Until a verified order-exit event is connected to the outreach runtime, a known trade-order contact must be manually suppressed immediately.

| Day | Template | Subject | Purpose | Primary CTA | Secondary route |
|---:|---|---|---|---|---|
| 0 | `jc-uk-prospect-01-trial-v2` | Complimentary Jimmy Coco professional trial for `{{BUSINESS_NAME}}` | Outcome-led introduction and real-client trial. | Request free 100 ml trial | `TRIAL` |
| 3 | `jc-uk-prospect-02-result-v2` | The formula details clients notice after their tan | Formula, 10% DHA, application and professional workflow. | Request free 100 ml trial | `SAMPLE` |
| 6 | `jc-uk-prospect-03-economics-v2` | The salon maths behind a premium tan (£2.14 per treatment) | Qualified solution-cost context plus trade-order route. | Request free 100 ml trial | `NUMBERS` / professional order page |
| 10 | `jc-uk-prospect-04-retail-v2` | The second revenue moment after the treatment | Client-care aftercare edit. | Request free 100 ml trial | `RETAIL` |
| 15 | `jc-uk-prospect-06-process-v2` | What to look for when you test Jimmy Coco Pro | Real-client trial guide and one-litre minimum. | Request free 100 ml trial | `TRIAL` |
| 21 | `jc-uk-prospect-07-choice-v2` | How to introduce Jimmy Coco Pro to your treatment menu | Professional order route and individual next-step conversation. | View professional ordering options | Request trial / `TRIAL` |
| 28 | `jc-uk-prospect-05-close-v2` | Shall I close your file for now, `{{FIRST_NAME}}`? | Respectful final choice then stop. | Request free 100 ml trial | `TRIAL`, `NUMBERS` or `ORDER` |

## Commercial boundaries

The current UK Malibu Professional Spray 1-litre bottle is listed at **£60** and is designed for approximately **28 full-body tans**, giving an approximate **£2.14 solution cost per tan**. This is solution only, before labour, disposables, card fees, premises and VAT. It is not a profit promise and does not prescribe a treatment price.

Eligible UK professionals may request a complimentary 100 ml professional trial sample, shipped free. If the formula is right for the business, the ongoing trade minimum is one 1-litre Malibu Professional Spray bottle. Retail is client care: Buff & Glow Mitt for maintenance, Self Tan Soufflé for a controlled top-up, and A-List Glow Kit for a complete routine or giftable option. Trade pricing, retail contribution, service-support materials and any wider partnership route are confirmed with the individual business.

## Sender, footer and routing

Use sender `Matthew at Jimmy Coco Pro <partnerships@email.jimmycoco.pro>` and reply-to `matthew@jimmycoco.pro`. The promotional footer is **JIMMY COCO (UK) LIMITED · 22 St. James's Walk, London, England, EC1R 0AP**, with the live Resend unsubscribe link. Each event payload must include `FIRST_NAME`, `BUSINESS_NAME` and, for Email 1, `BUSINESS_TYPE`; use `there`, `your studio` and `professional tanning business` where source data is incomplete.

## Technical hand-off

The professional trial CTA must resolve to `https://www.jimmycoco.pro/#trial`. The verified professional order route is `https://www.jimmycoco.pro/products/malibu-professional-spray-1l#complete-order`; no `/#starter-pack` anchor is used. The campaign must be exited through the outreach runtime on a reply or trial request/application. Until a verified order-exit event is connected to the outreach runtime, a known trade-order contact must be manually suppressed immediately. Replies containing `TRIAL`, `SAMPLE`, `NUMBERS`, `RETAIL` or `ORDER` require same-day human follow-up by Matthew.
