# AI Failure Modes and Recovery

## Purpose

Define common AI-production failures, their severity and the correct recovery path.

## Critical failures

### Protected asset alteration

Symptoms:

- changed face, body, skin tone or expression;
- modified product packaging or colour;
- regenerated label or logo;
- altered customer result.

Action:

- reject immediately;
- return to original source;
- separate protected asset from generative workflow;
- rebuild through deterministic compositing;
- record the failure.

### Invented fact or claim

Symptoms:

- unsupported statistic;
- invented review or quotation;
- guessed price, stock, date, shade or delivery time;
- implied celebrity endorsement.

Action:

- block release;
- remove the invented content;
- obtain an authoritative source;
- rerun with a stricter input contract.

### Lifecycle or consent overreach

Symptoms:

- model selects audience or eligibility;
- generated content ignores suppression;
- service and promotional content are confused.

Action:

- stop automation;
- return decision ownership to application logic;
- audit affected records and templates.

## High-severity failures

### Generic AI aesthetic

Symptoms include glossy HDR lighting, random gold objects, impossible shadows, excessive blur, distorted geometry and template-like luxury styling.

Recovery:

- simplify the prompt;
- use exact material, lighting and composition references;
- generate fewer elements;
- preserve more authentic source photography.

### Product inaccuracy

Recovery:

- use exact product cut-outs;
- generate environment only;
- verify colour and proportions against the source.

### Responsive crop failure

Recovery:

- art-direct a dedicated mobile crop;
- reposition copy-safe space;
- avoid relying on automatic centre cropping.

### Dynamic-copy grammar failure

Recovery:

- separate complete sentence variants;
- define field-level fallbacks;
- test missing and malformed data.

## Medium-severity failures

- repetitive subject-line patterns;
- excessive email length;
- competing CTAs;
- vague luxury language;
- duplicate alt text;
- decorative modules overwhelming the main action;
- inconsistent image mood across a sequence.

Correct these before approval.

## Recovery hierarchy

1. Restore approved truth
2. Restore protected assets
3. Restore customer-state accuracy
4. Restore message purpose
5. Restore responsive usability
6. Restore brand quality
7. Optimise performance only after the above are stable

## Incident record

For critical or recurring failures, record:

- task and prompt version;
- model or tool;
- source inputs;
- failure description;
- severity;
- affected outputs;
- containment action;
- corrected workflow;
- owner;
- prevention rule.

## Stop conditions

Stop using a prompt or model for a task when it repeatedly:

- alters protected assets;
- invents facts despite constraints;
- fails required output structure;
- exposes private information;
- cannot produce reliable responsive assets;
- creates materially inconsistent brand output.

A failed generation should never be repaired by hiding the defect with further uncontrolled generation.