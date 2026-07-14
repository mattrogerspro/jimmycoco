# UAE / Dubai Salon Stockist Recruitment

**Goal:** recruit premium Dubai and UAE salons, hotel spas, beauty destinations and professional tanning artists as Sunless by Jimmy Coco stockists and professional partners.

**Audience:** owners, spa directors, salon managers, commercial directors and lead tanning professionals in Dubai first, then the wider UAE.

**Market:** 🇦🇪 UAE — primary focus Dubai

**Offer / hook:** a professional trial pathway built around Jimmy Coco’s shade method, premium professional colour and a curated treatment-plus-retail partnership.

**Channel:** Email. Resend-ready tokens and unsubscribe route.

**Status:** Draft — commercial, fulfilment and market permissions must be approved before release.

## Cadence

| # | Day | Touch | File |
|---|---:|---|---|
| 1 | 0 | Dubai introduction and professional trial | `emails/1-dubai-introduction.html` |
| 2 | 4 | Colour in Dubai daylight, photography and evening light | `emails/2-colour-in-dubai-light.html` |
| 3 | 8 | Professional service plus curated retail | `emails/3-service-and-retail.html` |
| 4 | 13 | Partner support, training and launch pathway | `emails/4-partner-support.html` |
| 5 | 18 | Respectful close-the-loop message | `emails/5-close-the-loop.html` |

Stop the sequence immediately after a reply, trial request, booked call, unsubscribe, complaint, hard bounce, invalid contact or manual suppression.

## Files

- `sequence.md` — complete five-email copy, subject variants, preview text, tokens and branching rules.
- `email-data.json` — structured content used by the shared master renderer.
- `emails/` — generated sendable HTML for all five messages.

## Master-template relationship

This campaign uses:

- `../_shared/master-template.js`
- `../_shared/build-all.js`

Changes to the shared master can be propagated to every branded AU, UK and UAE campaign email by running:

```bash
node email/campaigns/_shared/build-all.js
```

Do not make permanent layout changes directly inside generated HTML. Update the shared master for global changes or `email-data.json` for Dubai-specific content.

## Tokens requiring approved values

- `{{trial_link}}`
- `{{trade_link}}`
- `{{calendar_link}}`
- `{{shade_guide_link}}`
- `{{uae_delivery_statement}}`
- `{{uae_partner_terms}}`
- `{{business_address}}`
- `{{unsubscribe_link}}`

No pricing, availability, delivery timing, exclusivity, minimum order, import position, registration status or partner terms are hard-coded or inferred.