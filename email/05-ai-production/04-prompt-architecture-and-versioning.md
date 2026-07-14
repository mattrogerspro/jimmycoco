# Prompt Architecture and Versioning

## Purpose

Create a repeatable prompt system for AI-assisted email production.

## Prompt layers

Every production prompt should contain:

1. Stable system rules
2. Channel and brand rules
3. Task-specific brief
4. Approved source data
5. Protected-asset instructions
6. Output contract
7. Negative constraints
8. QA checklist

## Prompt ID

Use:

`EMAIL-AI-[TYPE]-[PURPOSE]-v[MAJOR.MINOR]`

Examples:

- `EMAIL-AI-IMAGE-HERO-v1.0`
- `EMAIL-AI-COPY-SHADE-RESULT-v2.1`
- `EMAIL-AI-QA-PROTECTED-ASSET-v1.0`

## Version rules

Increment major version when:

- output structure changes;
- brand or compliance rules change;
- protected-asset handling changes;
- model behaviour requires a new strategy.

Increment minor version when:

- wording is clarified;
- examples are added;
- output labels improve;
- non-breaking constraints are strengthened.

## Required metadata

Store:

- prompt ID and version;
- author;
- creation date;
- approved model or tool;
- intended task;
- source dependencies;
- known failure modes;
- reviewer;
- approval status;
- superseded version.

## Prompt construction rules

- state exact immutable elements first;
- distinguish source facts from creative direction;
- use measurable dimensions and aspect ratios;
- identify the email module and responsive crop;
- specify what the model must not generate;
- demand `[SOURCE REQUIRED]` for missing facts;
- require structured output where automation will parse results;
- avoid vague instructions such as “make it premium” without visual or verbal definition.

## Reproducibility

Record model, version, seed where supported, generation settings, source assets and final prompt text. A production asset without this record is not reproducible and cannot be treated as a controlled master.

## Prompt testing

Before approval, test prompts against:

- normal inputs;
- missing inputs;
- conflicting inputs;
- long product names;
- unavailable products;
- multiple markets;
- protected people and product assets;
- mobile crop constraints;
- attempts to induce unsupported claims.

## Deprecation

Deprecated prompts must remain archived but clearly marked. Production tooling must not silently fall back to a deprecated version.