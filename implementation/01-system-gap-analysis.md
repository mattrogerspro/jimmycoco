# System Gap Analysis

## Purpose

Provide a repeatable method for comparing the current repository, application, assets and infrastructure against the approved Sunless Creative Director System.

## Output requirement

Every gap must become one of:

- `READY`
- `PARTIAL`
- `MISSING`
- `CONFLICTING`
- `BLOCKED`
- `NOT APPLICABLE`

Each non-ready item requires an owner, dependency, severity, acceptance criterion and implementation ticket.

## Severity model

### Critical

Blocks launch, creates legal or consent risk, can send incorrect email, exposes secrets, corrupts customer or order data, or misrepresents products or people.

### High

Breaks a primary conversion path, lifecycle flow, responsive experience, accessibility requirement, deliverability control or core visual identity.

### Medium

Reduces maintainability, consistency, measurement quality, performance or operational reliability without blocking the main experience.

### Low

Polish, documentation, non-critical optimisation or future-proofing.

## Audit domains

### Repository and architecture

Check:

- current framework, runtime and package versions;
- route structure;
- shared versus channel-specific code;
- environment configuration;
- deployment and branch strategy;
- database migration discipline;
- test coverage;
- CI checks;
- logging and monitoring;
- documentation accuracy.

### Shared brand system

Check implementation of:

- colour tokens;
- typography;
- spacing;
- radius and shadows;
- logo rules;
- photography rules;
- copy and claims rules;
- product and celebrity protections.

### Website

Compare every route and component against:

- website strategy;
- design-system documentation;
- homepage and page specifications;
- responsive requirements;
- product and conversion architecture;
- performance and accessibility requirements.

### Email

Compare against:

- lifecycle strategy;
- template system;
- sequence specifications;
- copy system;
- AI production controls;
- asset system;
- Resend integration architecture.

### Data and events

Verify availability and quality of:

- customer identity;
- consent and preference state;
- product and variant data;
- orders and fulfilment;
- carts and browse activity;
- shade-match results;
- lifecycle ownership;
- suppression records;
- message and provider events;
- attribution events.

### Assets

Check:

- all canonical files exist;
- product imagery is current;
- celebrity and customer-result rights are documented;
- email and website derivatives are traceable;
- desktop and mobile crops exist;
- filenames and manifests comply;
- expired or ambiguous assets are blocked.

### Infrastructure and integrations

Check:

- Supabase schema and policies;
- Vercel environments;
- Resend domains and credentials;
- webhook endpoints;
- analytics destinations;
- error monitoring;
- storage and CDN behaviour;
- backup and rollback readiness.

## Gap record template

```yaml
id: GAP-[DOMAIN]-[NUMBER]
domain: website | email | data | asset | infrastructure | governance
status: READY | PARTIAL | MISSING | CONFLICTING | BLOCKED
severity: critical | high | medium | low
current_state: ""
required_state: ""
evidence:
  - ""
dependencies:
  - ""
owner: ""
acceptance_criteria:
  - ""
implementation_ticket: ""
```

## Evidence standard

A claim that something is ready must be supported by at least one of:

- code path;
- test result;
- rendered screenshot;
- database migration;
- configuration record;
- asset manifest;
- verified provider status;
- signed approval record.

## Completion rule

The gap analysis is complete only when every required specification has been mapped to current evidence or an actionable implementation ticket. General observations without ownership and acceptance criteria are not sufficient.