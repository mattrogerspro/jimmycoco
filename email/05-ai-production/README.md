# Sunless Email AI Production System

This folder defines how AI may support Sunless email production without replacing approved brand, copy, design, data, legal, lifecycle or delivery controls.

## Scope

- prompt architecture;
- approved source inputs;
- image generation and image handling;
- copy-generation controls;
- scene and campaign continuity;
- product and celebrity asset protection;
- human review and approval;
- failure modes and recovery;
- versioning and auditability;
- production QA.

## Core rule

AI output is never production-ready by default.

Every output must be traceable to approved source material, reviewed by a human, validated against current product and customer data, and tested in the final email template before release.

## Non-negotiable protections

- Do not invent product, shade, price, stock, offer, review, celebrity, ingredient or performance facts.
- Do not generatively alter approved product or celebrity photography.
- Do not imply endorsement, usage or affiliation without approved evidence and rights.
- Do not fabricate scarcity, urgency, testimonials or customer history.
- Do not allow AI to decide eligibility, suppression, consent or lifecycle ownership.
- Do not send directly from an AI drafting environment.

## Files

- `00-ai-production-principles.md`
- `01-source-of-truth-and-input-contracts.md`
- `02-prompt-architecture.md`
- `03-email-image-generation-workflow.md`
- `04-product-and-celebrity-asset-protocol.md`
- `05-campaign-and-scene-continuity.md`
- `06-copy-generation-and-variation-controls.md`
- `07-ai-failure-modes-and-recovery.md`
- `08-human-review-and-approval.md`
- `09-versioning-provenance-and-audit.md`
- `10-production-qa-checklist.md`
- `11-final-ai-production-prompts.md`

## Production relationship

This system must be used with:

- `../00-strategy/`
- `../01-design-system/`
- `../02-template-system/`
- `../03-sequences/`
- `../04-copy-system/`
- `../06-assets/`
- `../07-resend-integration/`

AI accelerates controlled production. It does not become the source of truth.