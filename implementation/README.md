# Sunless Implementation System

This folder converts the Sunless by Jimmy Coco Creative Director System into an executable delivery plan across website, email, data, assets, Resend, analytics, testing and launch.

## Purpose

The implementation section exists to prevent the strategy, design and lifecycle documentation from becoming a disconnected specification library.

It defines:

- what must be built;
- in what order;
- with which dependencies;
- against which acceptance criteria;
- using which source-of-truth documents;
- with which release gates;
- and with which evidence of completion.

## Core rule

Implementation must preserve the approved brand, product, customer, asset, lifecycle and operational truth already defined in `shared/`, `website/` and `email/`.

The implementation layer may translate requirements into code, tasks, schemas, tests and release plans. It may not silently redefine approved strategy or creative direction.

## Documents

- `00-master-delivery-roadmap.md` — programme phases, dependencies, sequencing and release gates
- `01-system-gap-analysis.md` — current-state audit against the complete specification
- `02-website-build-plan.md` — website architecture, page priorities and implementation acceptance criteria
- `03-email-build-plan.md` — template, sequence, orchestration and lifecycle implementation plan
- `04-data-model-and-event-map.md` — canonical entities, events, ownership and data contracts
- `05-asset-migration-and-preparation.md` — product, celebrity, proof and campaign asset migration
- `06-template-and-component-build-order.md` — shared component sequence and dependency graph
- `07-resend-implementation-plan.md` — provider adapter, domains, webhooks, suppression and operations
- `08-analytics-and-measurement-plan.md` — event instrumentation, dashboards, attribution and experiment readiness
- `09-testing-and-qa-plan.md` — technical, visual, accessibility, data and lifecycle QA
- `10-launch-and-rollout-plan.md` — staged deployment, migration, rollback and operational readiness
- `11-production-readiness-checklist.md` — final end-to-end launch gate

## Working model

Every implementation work item should identify:

- source specification;
- user or operational outcome;
- owner;
- dependencies;
- implementation notes;
- acceptance criteria;
- evidence required;
- release phase;
- status.

## Status values

Use:

- `NOT_STARTED`
- `DISCOVERY`
- `READY`
- `IN_PROGRESS`
- `BLOCKED`
- `IN_REVIEW`
- `APPROVED`
- `RELEASED`
- `DEPRECATED`

## Evidence standard

A task is not complete because code exists.

Completion evidence may include:

- merged implementation;
- production-equivalent screenshots;
- schema migration records;
- automated test results;
- accessibility evidence;
- email-client renders;
- webhook test records;
- analytics event validation;
- asset manifest approval;
- release sign-off.

## Relationship to the repository

Use this folder with:

- `../shared/` for cross-channel brand and source-of-truth rules;
- `../website/` for website strategy, design, UX, pages and AI-production specifications;
- `../email/` for lifecycle, template, copy, asset and Resend requirements;
- `../assets/` for approved source imagery and production inputs.

The implementation system is the delivery bridge between the approved specification and the released customer experience.