# Sunless by Jimmy Coco — Creative Director System

This repository is the source of truth for the Sunless by Jimmy Coco brand across website, email and future digital channels.

## Repository structure

- [`shared/`](shared/) — universal brand DNA, visual language, copy language, approved assets and cross-channel production standards
- [`website/`](website/) — website strategy, design system, homepage narrative, scene specifications and website image-production workflow
- [`email/`](email/) — email strategy, modular templates, lifecycle sequences, copy, AI production, assets and Resend integration
- [`implementation/`](implementation/) — delivery roadmap, gap analysis, build plans, data and event foundations, migration, QA and launch controls

## Architecture rule

Use `shared/` for any rule that must remain consistent across multiple channels. Use `website/` and `email/` for channel-specific layout, interaction, conversion architecture, templates and production instructions.

Use `implementation/` to convert those approved systems into ordered engineering, content, asset, data, testing and launch work.

Channel documentation should reference canonical shared documents rather than creating conflicting duplicates.

## Current status

The website and email Creative Director Systems are structurally complete. The repository has entered the implementation-planning phase, beginning with repository-wide gap analysis, dependency mapping and staged delivery preparation.

Documentation does not by itself establish that the product is implemented or production-ready. Readiness must be demonstrated through code, data, assets, configuration, tests, rendered output and approval evidence.

## Outreach runtime

The campaign studio now includes a guarded Resend + Supabase + Vercel outreach runtime. Campaign definitions live in [`shared/campaign-registry.js`](shared/campaign-registry.js), the database migration lives in [`supabase/migrations/`](supabase/migrations/), and operating instructions live in [`email/07-resend-integration/14-live-outreach-operations.md`](email/07-resend-integration/14-live-outreach-operations.md).

All campaigns ship disabled. Connecting providers or applying the database migration cannot send email by itself.

## Production principle

Generate and approve individual creative scenes, modules, templates and releases using the relevant channel documentation plus the shared brand system. Do not ask an image model or implementation agent to invent an entire long-form experience in one uncontrolled pass.

Build and release in dependency order, preserve approved product and person assets, keep business state inside the application, and use staged rollout with measurable acceptance criteria and rollback.
