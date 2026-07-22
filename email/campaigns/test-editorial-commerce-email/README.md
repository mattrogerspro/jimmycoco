# TEST — Editorial Commerce Master Preview

> **TEST — NOT FOR SEND.** This campaign exists only to create one reviewable Resend template. It has no recipients, automation, enrolment or sending authority.

**Goal:** benchmark how closely a legacy campaign can be reconstructed from a supplied screenshot alone.
**Audience:** internal reviewers only; no real customer or business audience.
**Market:** global test fixture.
**Primary outcome:** visual fidelity against the supplied screenshot.
**Offer / hook:** no offer; all actions lead to non-operational `example.invalid` fixtures.
**Channel & ESP:** Email via Resend test template.
**Status:** `TEST — NOT FOR SEND`
**Owner:** Internal Creative Review.

## Cadence

| # | Day | Purpose | Channel | File |
|---|---:|---|---|---|
| 1 | 0 | Review the editorial-commerce master | Email | `emails/1-editorial-commerce-preview.html` |

## Entry, exclusions and stop rules

- Entry is prohibited; this is a template fixture, not an operable sequence.
- Exclude every real recipient, contact import, segment, automation and broadcast.
- Any accidental enrolment, scheduling or send attempt must be stopped immediately.
- There is no lifecycle handoff and no collision with welcome, browse, cart, post-purchase, replenishment, win-back or VIP sequences.
- The campaign is intentionally absent from `shared/campaign-registry.js` and remains disabled.

## Screenshot reconstruction assets

The supplied screenshot is cropped to its exact 1200 × 9078px email canvas, then divided into eight contiguous, semantically named modules. Stacking those modules reconstructs the original canvas without invented photography, copy, spacing or typography.

- Lossless benchmark assets: `assets/test/screenshot-reconstruction/`
- Email-optimised hosted assets: `public/email-assets/test/screenshot-reconstruction/`
- Shared renderer: `email/campaigns/_shared/screenshot-fidelity-template.js`

## Files

- `sequence.md` — review copy and plain-text equivalent.
- `email-data.json` — structured content and Resend alias.
- `studio.json` — disabled test metadata.
- `build.js` — generates the HTML through the shared editorial-commerce renderer.
- `emails/1-editorial-commerce-preview.html` — generated output; never edit directly.

## Production conversion gaps

A real campaign requires a separate campaign ID plus approval of audience, consent basis, market, offer, product facts, claims, prices, availability, links, sender, address, preference handling, asset-manifest records and current hosted derivatives.
