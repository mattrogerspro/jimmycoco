# Editorial commerce master

This alternate master translates the supplied legacy Klaviyo campaign into reusable, email-safe modules. It is a test scaffold, not a production campaign and not registered for Resend publication.

## Section order

1. `brandHeader` — approved image logo only.
2. `heroStory` — decisive editorial image, live proposition and primary CTA.
3. `productStory` — product recognition and concise narrative.
4. `usageGallery` — three supporting application images.
5. `benefitsList` — scannable factual proof.
6. `primaryAction` — repeated dominant action after product detail.
7. `methodGuide` — five-step educational chapter.
8. `editorialBridge` — visual transition from education to merchandising.
9. `productPair` — differentiated hero and supporting products.
10. `closingStory` — final proposition and decisive CTA.
11. `valueGrid` — quiet four-item brand/value summary.
12. `legalFooter` — social, preferences, unsubscribe and address.

## Why this differs from the screenshot

- Essential headlines, instructions, benefits and CTAs are live HTML text rather than baked into images.
- The 600px table layout is Outlook-safe and collapses to one column on mobile.
- The long legacy composition is split into named modules that can be reordered or omitted in structured data.
- Product and celebrity imagery uses approved repository sources without generative alteration.
- The template keeps one dominant CTA hierarchy even when the action is repeated at natural decision points.

## Build

```bash
node email/campaigns/_TEMPLATE/build-editorial-commerce-template.js
```

Edit `editorial-commerce-data.json`, never the generated `editorial-commerce-base.html`.
