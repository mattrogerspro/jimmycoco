# Source of Truth and Input Contract

## Purpose

Define the approved inputs required before AI can produce email copy, imagery, layouts or variants.

AI may transform source material. It may not decide what is true.

## Authoritative-source hierarchy

1. Application data for customers, consent, lifecycle state, products, prices, stock, orders, shade results and programme eligibility
2. Approved repository documentation for brand, copy, design, sequences, claims and templates
3. Approved asset library for logos, products, people, results and campaign imagery
4. Legal, policy and operational records for terms, delivery, returns, support and regulated claims
5. Human-approved campaign brief

Conflicts must be resolved before generation.

## Required production brief

Every AI task must include:

- asset or message ID;
- named owner;
- channel and template;
- lifecycle or campaign purpose;
- eligible audience;
- primary customer need;
- primary action;
- approved source files;
- required dimensions or copy length;
- market and language;
- personalisation fields and fallbacks;
- claims and approval references;
- prohibited changes;
- deadline and approval route.

## Image input contract

Supply:

- source asset paths;
- asset type: documentary, product, celebrity, customer result, logo or generative background;
- rights and approval state;
- permitted operations;
- prohibited operations;
- required crop and dimensions;
- safe area for copy;
- background requirements;
- colour and lighting references;
- export format and compression target;
- alt-text purpose.

## Copy input contract

Supply:

- sequence or campaign state;
- trigger and timing;
- approved facts and offer terms;
- products, variants, prices and stock;
- shade or routine context;
- required legal and service wording;
- primary and secondary CTA destinations;
- dynamic fields and fallback rules;
- tone and length constraints;
- suppression and conflict rules.

## Missing information

When a required source is missing, the task must:

1. stop;
2. mark the field as `[SOURCE REQUIRED]`;
3. request the specific source or approval;
4. avoid producing a plausible substitute.

## Input validation

Before generation, confirm:

- all referenced files exist;
- source versions are current;
- product and programme data match production systems;
- rights and usage approval are recorded;
- documentary assets are clearly distinguished from generative assets;
- dynamic fields have safe fallbacks;
- the requested output does not require prohibited transformation.

## Release rule

No AI output can be approved when its source inputs are incomplete, conflicting, stale or unverifiable.