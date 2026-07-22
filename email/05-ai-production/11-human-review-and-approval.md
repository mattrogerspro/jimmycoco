# Human Review and Approval

## Purpose

Define the mandatory human decisions required before any AI-assisted email copy, image, layout or production asset can be released.

AI can prepare evidence and flag risks. It cannot approve itself.

## Required roles

Every production item must identify:

- brief owner;
- copy owner;
- visual or design owner;
- data owner where dynamic content is used;
- legal or claims reviewer where required;
- production implementer;
- final approver.

One person may hold more than one role, but ownership must remain explicit.

## Approval stages

1. Brief approval
2. Source and rights approval
3. Concept approval
4. Copy and claim approval
5. Asset-faithfulness approval
6. Template and responsive approval
7. Data and lifecycle approval
8. Final production approval

Skipping an earlier stage does not transfer responsibility to the final approver.

## Brief approval

Confirm:

- the message is necessary;
- the customer state and trigger are valid;
- the proposition is clear;
- required source material exists;
- protected assets are identified;
- the AI task is appropriate;
- success and guardrail measures are defined.

## Source and rights approval

Confirm:

- product and customer data come from approved systems;
- imagery rights and permitted usage are documented;
- celebrity or partner use is specifically approved, except that every image under `assets/images/celebs/` carries standing approval for all email campaigns and needs no repeat campaign approval;
- claims have traceable evidence;
- policy and legal wording are current;
- missing information is resolved rather than guessed.

## Concept approval

Review:

- customer relevance;
- brand consistency;
- composition and hierarchy;
- relationship to recent sends;
- suitability for desktop and mobile;
- risk of misleading implication;
- whether generation should continue or a non-generative method is safer.

## Copy approval

Confirm:

- subject and preview represent the message;
- one clear proposition controls the email;
- facts, prices, dates, products and terms are correct;
- claims remain within approved evidence;
- personalisation has safe fallbacks;
- CTA describes the actual destination;
- legal, service and plain-text content is complete.

Use `../04-copy-system/12-copy-testing-and-qa.md` as the release standard.

## Protected-asset approval

Standing source approval does not approve AI alteration. Images under `assets/images/celebs/` may be included without another creative or rights review only when the current protected-asset and AI-generation rules are followed.

Compare the final output directly against every protected source asset.

Verify no unapproved change to:

- face or body;
- skin tone or texture;
- product colour or geometry;
- packaging or label typography;
- logo shape or colour;
- documentary customer result;
- background context that changes the meaning of the original image.

Pixel-level fidelity is required where the brief specifies unchanged insertion.

## Template approval

Review the final email in its production template with representative data.

Check:

- responsive stacking;
- desktop and mobile crops;
- image blocking;
- dark mode;
- Gmail, Apple Mail and Outlook behaviour;
- accessibility and reading order;
- link destinations;
- fallback data states;
- plain-text parity;
- load and file-size performance.

## Lifecycle and data approval

Confirm:

- audience eligibility is application-controlled;
- consent and suppression checks run correctly;
- lifecycle precedence is respected;
- stale data cannot produce a misleading message;
- prices, stock and variants are current at the required point;
- retries and duplicate events cannot cause duplicate sends;
- production payload uses the approved version.

## Approval outcomes

Use only:

- `APPROVED`
- `APPROVED WITH RECORDED EXCEPTION`
- `CHANGES REQUIRED`
- `BLOCKED`

An exception record must state:

- exact deviation;
- reason;
- customer and operational risk;
- mitigating control;
- owner;
- expiry or review date.

## Reapproval triggers

Reapproval is required when:

- copy changes materially;
- a product, price, stock state or offer changes;
- an image is recropped or recompressed in a way that affects presentation;
- a protected source asset changes;
- the template changes;
- a prompt major version changes;
- a new market or language is added;
- legal, claims or policy wording changes;
- the model or generation method materially changes the output.

## Release blockers

Do not release when:

- no accountable approver is recorded;
- source rights are uncertain;
- protected assets cannot be compared with originals;
- dynamic fallbacks are untested;
- claims remain unsupported;
- lifecycle or consent logic is unresolved;
- the production render differs from the approved render;
- the AI output contains unexplained alterations;
- a reviewer is being asked to approve from a thumbnail or isolated asset only.

Human approval is a documented decision based on evidence, not a casual visual preference or an AI-generated confidence score.
