# Sunless by Jimmy Coco — Creative Director System

This repository is the source of truth for the Sunless by Jimmy Coco brand across website, email and future digital channels.

## Repository structure

- [`shared/`](shared/) — universal brand DNA, visual language, copy language, approved assets and cross-channel production standards
- [`website/`](website/) — website strategy, design system, homepage narrative, scene specifications and website image-generation workflow
- [`email/`](email/) — email strategy, modular template system, lifecycle sequences, copy system and email image-generation workflow

## Architecture rule

Use `shared/` for any rule that must remain consistent across multiple channels. Use `website/` and `email/` for channel-specific layout, interaction, conversion architecture, templates and production instructions.

Channel documentation should reference canonical shared documents rather than creating conflicting duplicates.

## Current status

The website Creative Director Bible is under active development and has been moved into [`website/`](website/). The email workspace has been established for the next phase.

## Production principle

Generate and approve individual creative scenes or modules using the relevant channel documentation plus the shared brand system. Do not ask an image model to invent an entire long-form experience in one pass.