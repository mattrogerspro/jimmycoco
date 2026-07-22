# Email Component and Data Contracts

## Purpose

Define reusable modules that can be composed into campaigns, sequences and transactional emails without redesigning each message.

## Core modules

### Brand header
Required fields:
- logo asset: `assets/email/logo.webp`
- production URL: `https://jimmycoco.email/email-assets/logo.webp`
- logo alt text: `Sunless by Jimmy Coco`
- home URL

The shared master supplies these approved defaults globally. Campaign data may not replace them with an older or generated logo. Any future logo replacement must be approved as a shared-template change and propagated by rebuilding every campaign.

### Editorial hero
Required fields:
- eyebrow or context label
- headline
- concise supporting copy
- optional source image
- primary CTA label and URL

### Product spotlight
Required fields:
- approved product image
- product name
- result statement
- suitability statement
- price or commercial status when appropriate
- CTA label and URL

Optional fields:
- shade or variant
- review rating
- stock status
- routine position

### Recommendation module
Required fields:
- recommended product
- reason for recommendation
- selected variant
- expected result
- CTA destination

Fallback behaviour:
- never expose undefined personalisation tokens;
- use a neutral bestseller route when recommendation data is unavailable;
- do not claim a personalised match if no valid result exists.

### Results proof module
Required fields:
- approved unchanged customer image
- product used
- number of coats or application context where verified
- disclosure or verification note
- destination URL

### Jimmy expert note
Required fields:
- concise expert guidance
- approved Jimmy source image if used
- contextual signature or attribution

### Routine builder
Required fields:
- stage labels such as Prepare, Apply and Perfect
- one product per stage
- concise reason for inclusion
- one primary routine CTA

### Review module
Required fields:
- verified review text
- reviewer display name or approved anonymised form
- rating if available
- product context

### Order summary
Required fields:
- order reference
- items
- quantities
- prices
- totals
- shipping destination summary
- support route

## Data ownership

The commerce or customer-data layer is the source of truth for customer, product, order, consent and segmentation data. Resend should receive only the fields required to render and deliver the message.

## Content safety

- Escape dynamic content before rendering.
- Validate URLs against approved domains.
- Never expose internal IDs, secrets or raw webhook payloads to recipients.
- Use deterministic fallbacks for every optional field.
- Keep transactional and marketing consent rules separate.

## Image integrity

Approved product, customer, celebrity and founder images must be inserted as source assets. They must not be passed through a generative image process, face alteration, beauty retouching, colour remapping or synthetic cropping workflow.
