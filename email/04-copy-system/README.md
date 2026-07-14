# Sunless Email Copy System

## Purpose

This folder defines the reusable copy system for every Sunless lifecycle, service and campaign email.

It translates the shared brand strategy into email-specific language rules so that subject lines, preview text, openings, body copy, calls to action, product descriptions and operational messages feel consistent regardless of sequence or author.

## Core principle

Sunless email should read like calm expert guidance from a premium beauty brand, not like a generic ecommerce automation.

The voice must be:

- confident without exaggeration;
- luxurious without becoming ornate;
- helpful without over-explaining;
- persuasive without pressure;
- specific without sounding technical for its own sake;
- personal without pretending to know more than the available data supports.

## Structure

- `00-copy-strategy-and-principles.md` — strategic role, message hierarchy and non-negotiable standards
- `01-brand-voice-for-email.md` — voice, tone, vocabulary and sentence-level guidance
- `02-subject-line-system.md` — subject-line architecture by lifecycle state
- `03-preview-text-system.md` — preview-text rules and pairings
- `04-headline-and-opening-copy.md` — headline, salutation and opening patterns
- `05-body-copy-and-message-structure.md` — body structure, pacing and message length
- `06-cta-copy-and-hierarchy.md` — primary, secondary and service CTA rules
- `07-personalisation-and-dynamic-copy.md` — safe, useful personalisation and fallbacks
- `08-lifecycle-tone-by-customer-state.md` — tone changes across the customer journey
- `09-product-shade-and-routine-language.md` — approved language for results, shades, finish and routines
- `10-promotional-claims-and-urgency-standards.md` — discount, scarcity, exclusivity and claim controls
- `11-legal-service-and-operational-copy.md` — transactional, legal and support language
- `12-copy-testing-and-qa.md` — review, testing and release standards
- `13-ai-email-copy-prompts.md` — controlled prompts for producing draft email copy

## Source-of-truth rule

This folder governs language patterns. Sequence-specific documents govern eligibility, timing, branching, suppression and operational logic.

Copy must never override:

- consent or suppression rules;
- current product, price, stock or shade data;
- service-message requirements;
- programme terms;
- approved claims;
- legal review;
- customer-support escalation rules.

## Production rule

No production email should be approved solely because it sounds on-brand.

It must also be accurate, useful, contextually appropriate, accessible and supported by current customer and product data.