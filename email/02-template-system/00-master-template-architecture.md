# Master Email Template Architecture

## Purpose

Define one production-ready shell for all Sunless emails sent through Resend.

## Required anatomy

1. Preheader text
2. Brand header
3. Primary message region
4. Supporting modules
5. Primary CTA
6. Optional secondary proof or education
7. Legal and preference footer

## Width and structure

- Desktop content width: 600–640px
- Single-column mobile-first architecture
- Table-safe layout where required for client resilience
- Generous outer padding
- No essential information embedded only inside images

## Header rules

The header should be quiet and compact. It may contain the Sunless logo and, where useful, one secondary navigation link. It must not resemble the full website navigation.

## Message hierarchy

Each email must contain one dominant purpose. The first screen should communicate:

- why the recipient is receiving the message;
- the most important value or information;
- one obvious next action.

## Module cadence

Recommended structure:

- concise hero or editorial opening;
- one primary product, result, lesson or status module;
- supporting proof or guidance;
- one dominant CTA;
- restrained footer.

Avoid stacking several equally prominent product grids, promotions or calls to action.

## Template families

### Editorial
Founder notes, method education, skin and application guidance.

### Product
Single-product focus, routine building, launches and restocks.

### Guided selling
Shade-match continuation, recommendation reminders and suitability education.

### Lifecycle
Welcome, browse abandonment, cart abandonment, post-purchase, replenishment and win-back.

### Transactional
Order, shipping, delivery, account and support communications.

## Dynamic content contract

Every template must explicitly define:

- required recipient fields;
- optional personalisation fields;
- product or order data;
- fallback copy;
- CTA destination;
- suppression conditions;
- tracking category;
- plain-text equivalent.

## Resend compatibility

The application owns content, segmentation and business rules. Resend owns delivery transport and delivery events. Template source, approved copy and reusable modules remain version-controlled in this repository.

## Non-negotiables

- No fake urgency.
- No email gate before promised value.
- No celebrity or customer image alteration.
- No product packaging recreation when approved source imagery exists.
- No message sent without a plain-text fallback and unsubscribe or preference handling where legally required.
