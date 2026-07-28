---
name: build-jimmy-coco-test-email
description: Rapidly build, edit, render, publish and test-send explicitly labelled Sunless by Jimmy Coco TEST email templates without running the full production-campaign workflow. Use for template experiments, layout prototypes, screenshot reconstructions, visual iterations, isolated Resend test templates and controlled sends to named reviewers. Do not use for production campaigns, audiences, broadcasts, automations or lifecycle strategy.
---

# Build Jimmy Coco Test Email

Create reviewable email templates quickly while keeping them technically isolated from production campaigns.

## 1. Confirm test-template scope

Use this workflow only when the user explicitly asks for a `TEST`, prototype, mockup, screenshot reconstruction, template experiment or reviewer test send.

Treat a request as production work and switch to
`.claude/skills/build-jimmy-coco-email-campaign/SKILL.md` when it involves a real audience, campaign strategy, lifecycle timing, consent, commercial release, a broadcast, automation or production enablement.

Do not run the production campaign skill, canonical campaign preflight, lifecycle research or complete campaign validator for a test-only template.

## 2. Protect the workspace

Read `CLAUDE.md`, then inspect `git status --short` and the current branch.

- Preserve unrelated work.
- Do not commit, push, deploy, publish, send or change external state unless the user explicitly asks for that exact action.
- Never print secrets from `.env.local`.

## 3. Build the smallest useful fixture

Reuse an existing test folder when one exists. Otherwise create:

```text
email/campaigns/test-<slug>/
├── email-data.json
├── studio.json
├── build.js
└── emails/
```

Add a short `README.md` or `sequence.md` only when it materially helps review. Do not create production strategy, lifecycle, registry, consent or commercial documentation for a visual test.

Requirements:

- Prefix the display name and subject with `TEST — NOT FOR SEND`.
- Use a unique alias beginning `test-not-for-send-`.
- Keep `studio.json` disabled and omit the fixture from `shared/campaign-registry.js`.
- Keep structured source canonical and regenerate HTML; do not hand-maintain generated output.
- Use one template unless the user explicitly asks for several.
- Use `example.invalid` for non-operational links unless the user provides a test-safe destination.
- Use obvious fixture copy for unknown prices, claims, availability, fulfilment or legal facts. Do not delay a visual prototype for production approval tokens.

## 4. Use test-safe assets

Treat existing repository assets as approved for test-template use. Treat all existing files under any `celebs` asset folder as pre-approved for email inclusion, provided the repository AI-generation rules are followed.

Use screenshots and brand/product materials supplied by the user directly when reconstructing their owned campaign. Do not repeatedly request proof of ownership.

Keep email images:

- in a clearly named local source folder;
- in `public/email-assets/test/<slug>/` when hosted derivatives are required;
- compressed to a practical email size;
- absolute, publicly reachable and supplied with meaningful alt text in generated HTML.

Do not deploy assets. Commit or push only when explicitly requested. Before a test send, confirm every remote image URL is already reachable; otherwise report that the assets must first become publicly available.

## 5. Iterate quickly

After each requested change:

1. Edit the structured source or source assets.
2. Run only that fixture's build command.
3. Inspect the generated HTML and relevant visual output.
4. Run `git diff --check`.
5. When Resend is involved, target only the fixture alias:

```bash
node --env-file=.env.local scripts/sync-resend-templates.js \
  --only <test-template-alias>
```

`DRIFT` means only that the repository version and Resend version differ. It is the expected state after a local edit, not a validation failure in the email.

Skip these production checks unless the user asks to convert the fixture into a real campaign:

- the canonical campaign preflight;
- production commercial, consent and lifecycle gates;
- the complete campaign validator;
- `npm test`;
- the full application `npm run build`;
- the all-template Resend comparison;
- production reports and registry changes.

Never weaken HTML correctness, source/output consistency, asset reachability, test labelling or external-write approval.

## 6. Publish one test template

Publishing a test template is a Resend write. First name the exact alias and obtain fresh explicit approval. Then run:

```bash
node --env-file=.env.local scripts/sync-resend-templates.js \
  --publish --only <test-template-alias>
```

Read back only that template and confirm its alias, subject, published status and current HTML. Never scan, compare or update every Resend template as part of this workflow.

Publishing a template does not authorise a send.

## 7. Send a controlled test

Send only after the user explicitly provides or confirms:

- the exact recipient address or addresses;
- the exact test template;
- the sender identity when it is not already established in the conversation.

Use the published template ID or alias. Send one transactional test; do not create contacts, segments, broadcasts, audiences or automations. Use an idempotency key to prevent duplicate retries.

After sending, report the recipients, subject, Resend status and email ID. Do not describe a queued message as delivered.

## 8. Convert to production

Never remove TEST markers in place. When the user approves a real campaign:

1. Switch to `.claude/skills/build-jimmy-coco-email-campaign/SKILL.md`.
2. Create or migrate to a non-test campaign ID and alias.
3. Replace every fixture fact and non-operational link.
4. Run the full campaign preflight, validation and release gates.

