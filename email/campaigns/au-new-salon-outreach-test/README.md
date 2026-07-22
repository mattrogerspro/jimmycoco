# TEST — Australia-wide New Salon Outreach

> **TEST — NOT FOR SEND.** This campaign uses fictional recipients, links, commercial details and product imagery. It must never be enrolled, enabled, published as a production template or sent to a real address.

**Goal:** demonstrate an Australia-wide salon-acquisition campaign whose single outcome is a qualified reply or fictional evaluation-kit request.
**Audience:** fictional owners and managers of independent Australian salons that offer or are evaluating professional tanning services.
**Market:** Australia (`AU`), with recipient-local business-hour scheduling if ever rebuilt as a production campaign.
**Offer / hook:** `TEST ONLY` — a fictional evaluation brief and unbranded sample bottle for assessing a potential professional tanning partnership. No real sample, product, trade term or fulfilment promise exists.
**Channel & ESP:** Email via Resend test templates only.
**Status:** `TEST — NOT FOR SEND`
**Owner:** TEST Partnerships Team (`test-partnerships@example.invalid`, not monitored).
**Primary measurement:** fictional qualified replies / evaluation-brief requests. Opens are diagnostic only.

## Cadence

| # | Day | Purpose | Channel | File |
|---|---:|---|---|---|
| 1 | 0 | Practical introduction and fictional evaluation offer | Email | `emails/1-practical-introduction.html` |
| 2 | 4 | A useful salon trial checklist | Email | `emails/2-trial-checklist.html` |
| 3 | 9 | What a considered partnership review should cover | Email | `emails/3-partnership-review.html` |
| 4 | 16 | Respectful close-the-loop message | Email | `emails/4-close-the-loop.html` |

## Entry, exclusions and stop rules

- **Entry:** local fictional fixture records only. No contact import, list building or real recipient selection is permitted.
- **Exclude:** every real person or business; consumer addresses; existing salons or partners; suppressed, unsubscribed, complained or hard-bounced contacts; anyone active in another AU salon campaign.
- **Stop immediately on:** any reply, unsubscribe, complaint, hard bounce, fictional evaluation request, manual suppression, or discovery that the record is not an obvious test fixture.
- **Handoff:** a fictional positive reply exits the sequence and points only to the non-functional TEST partnership outline. It does not enter `au-salon-account-flow`.

## Lifecycle and campaign collision control

- Mutually exclusive with `au-salon-seeding`, `au-sydney-salon-stockist`, `au-gold-coast-salon-stockist` and any future AU professional-acquisition campaign.
- Consumer welcome, shade-match, browse, cart, post-purchase, replenishment, win-back and VIP journeys serve a different audience, but remain higher priority if a production contact could ever match both systems.
- This campaign is not registered in `shared/campaign-registry.js` and must remain disabled.

## Image plan and asset candidates

| Candidate | Intended role | Approval / rights state | Decision |
|---|---|---|---|
| `assets/images/product-images/Sunset 1 Ltr professional Spray/DED1L.webp` | Real professional-product header | Not present in the approved email asset manifest; AU email rights, current product facts, derivative and public URL are unverified | Blocked; not used |
| `assets/images/product-images/Sunset 1 Ltr professional Spray/sunless-images.webp` | Real professional-product packshot | Not present in the approved email asset manifest; AU email rights, current packaging, derivative and public URL are unverified | Blocked; not used |
| Five celebrity source records in `email/06-assets/asset-manifest.json` | Not relevant to this product-led message | `REVIEW_REQUIRED`; no email/AU/purpose rights, derivative, public URL or approved alt text | Rejected |
| `test-au-new-salon-outreach-header-v1` | Email 1 header product photo | AI-generated fictional, unbranded TEST fixture; restricted to this campaign; no person, real packaging, product fact or claim | Selected for TEST only |

Image 1 uses the fictional product still to make the demonstration tangible. Emails 2–4 are deliberately text-led so the sequence remains useful, restrained and deliverability-conscious. Essential meaning never depends on the image.

## Test fixtures

- **Recipients:** fictitious local-only salon records such as `Golden Hour Studio`; no real addresses.
- **Offer:** `TEST ONLY` fictional evaluation brief and fictional unbranded sample bottle; nothing will be supplied.
- **Product:** the image is a generic AI-generated amber pump bottle, not a Sunless by Jimmy Coco product or representation of current packaging.
- **CTA destinations:** `test-partnerships@example.invalid` and `https://example.invalid/...`; both are intentionally non-operational.
- **Sender:** TEST Partnerships Team; the mailbox is intentionally non-operational.
- **Business address:** `100 Example Street, Melbourne VIC 3000, Australia` is fictional.
- **Commercial, legal, consent and delivery gates:** `NOT APPLICABLE — TEST FIXTURE; NO RECIPIENTS OR SEND`.
- **Asset generation:** built-in image generation on 22 July 2026 using a product-mockup prompt that prohibited real branding, packaging, claims, people and proof.

## Production-conversion approval gaps

A production version requires a new non-test campaign ID and current approval for: recipient source and contact basis; AU legal review; sender identity and monitored reply address; real product facts and availability; offer and sample contents; trade terms; fulfilment; live links; business address; unsubscribe route; approved real product asset, rights and hosted derivatives; Resend template release; and explicit campaign enablement.

## Files

- `README.md` — strategy, fixtures, exclusions, asset decision and approval gaps.
- `sequence.md` — complete human-readable copy and plain-text equivalents.
- `email-data.json` — shared-renderer input.
- `studio.json` — TEST-labelled Studio metadata and timeline.
- `emails/` — generated HTML; never edit by hand.

## Release state

- Repository source and generated previews may be reviewed locally.
- The hosted image URL is reserved for the repository deployment path and is not authority to deploy it.
- Four TEST-labelled Resend templates exist as drafts only. They were created with explicit approval on 22 July 2026, verified against the repository source, and have never been published.
- No commit, push, deployment, contact import, enrolment, broadcast, automation or send is authorised by this TEST brief.
