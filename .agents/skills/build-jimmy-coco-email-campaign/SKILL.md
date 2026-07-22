---
name: build-jimmy-coco-email-campaign
description: Turn simple, plain-language requests into complete, high-quality Sunless by Jimmy Coco email campaigns that automatically follow repository strategy, brand, copy, design, asset, lifecycle, compliance and delivery rules. Use whenever anyone asks to build, create, write, plan, edit, improve, localise, render, review or release an email campaign or sequence, including outreach, onboarding, lifecycle, market-specific and explicitly labelled TEST or DEMO campaigns for learning.
---

# Build Jimmy Coco Email Campaign

Treat the repository as canonical. Let any colleague request a campaign without knowing the repository, schemas or production process. Produce the strongest compliant campaign possible; do not act as an autonomous sender.

## 1. Accept a normal request

Do not require the user to paste the canonical generator prompt, complete a long intake form, name files, select templates or understand internal tooling.

Expand a short request such as “Build a five-email salon recruitment campaign for California” into an internal brief containing the market, audience, outcome, offer, message architecture, cadence, channel, recipient basis, exclusions, handoff, facts, assets and approval gaps.

- Infer only from the user's request and current approved repository sources.
- Use repository defaults when they are genuinely applicable.
- Make expert recommendations for sequence length, cadence, narrative arc, objections, proof and CTA.
- Create original strategy and copy for the requested audience; do not merely rename or lightly rewrite a comparable campaign.
- Ask one concise, consolidated set of questions only when missing information would materially change strategy or make compliant production impossible.
- Use explicit approval tokens for non-blocking unknown commercial facts instead of interrupting production.
- Never make the employee reproduce information that can be discovered from the repository.

Unless the user narrows the scope, “build a campaign” means: create the complete repository draft, generate every branded HTML email, make it available to the Studio, run validation, add or update every campaign template in Resend after the required approval gate, and commit the validated repository changes. It does not mean enable sending, create a broadcast, enrol contacts or contact recipients.

## Staff-facing output contract

Keep all user-facing progress and final output suitable for non-technical staff. Do the detailed reasoning, repository inspection and command execution silently.

For a complete campaign build, output only one short line for each important step, using exactly this sequence:

```text
STEP 1/7 — CHECK: <plain-language result>
STEP 2/7 — PLAN: <market, audience, message count and outcome>
STEP 3/7 — BUILD: <source-copy result>
STEP 4/7 — RENDER: <number of email previews created>
STEP 5/7 — TEST: <passed, or one actionable blocker>
STEP 6/7 — RESEND: <approval needed, drafts verified, or one actionable blocker>
STEP 7/7 — SAVE: <commit completed, or one actionable blocker>
```

Rules for these lines:

- Keep each line to one sentence and normally under 140 characters.
- Use plain language; do not mention internal schemas, shell commands, tool names, token counts, diffs or files read.
- Do not stream command output, long compliance preflights, checklists, release manifests or technical diagnostics when work succeeds.
- When approval is required, make the relevant step line the single concise approval request and name the exact action/count.
- When blocked, output only the failed step line with the one action the employee must take. Put diagnostic detail in repository audit material or provide it only if the user asks.
- After STEP 7, output one final line only: `DONE — <campaign name>; <status>; <Resend state>; <commit hash>.`
- For a narrower operation, output only the applicable step lines and the final `DONE` line. Do not manufacture irrelevant steps.

Maintain the canonical Compliance Preflight, Production Report, sources, assumptions, approval tokens and QA evidence inside the campaign `README.md` or `docs/production-report.md`. Do not dump that audit material into the staff conversation unless requested.

## 2. Protect the workspace

Run `git status --short` and inspect the current branch before editing.

- Preserve all unrelated and pre-existing changes.
- Assume another agent may share the worktree. Do not overwrite files it is changing.
- Never use `git add -A`; stage only named files belonging to the task.
- Do not remove `.git/index.lock` while any Git or agent process owns it.
- Campaign-build requests carry standing authority to create one scoped local commit after all validation passes. Stage only the named campaign files and shared registration files changed for that campaign.
- Do not push, deploy, publish Resend template versions, enable campaigns, import recipients or send email without explicit authority for that action.

If concurrent work overlaps the requested files, stop and report the exact collision.

## 3. Classify the operation

Identify whether the request is to:

- create a campaign;
- edit or localise campaign source;
- change the shared renderer;
- regenerate HTML;
- expose repository content in the Studio;
- compare repository templates with Resend;
- release templates or enable sending.

Also classify the campaign mode:

- **STANDARD** — the default for every campaign unless the user explicitly says `TEST`, `DEMO` or `SANDBOX`.
- **TEST** — a learning-only campaign that demonstrates what the system can create without requiring production commercial, recipient or legal approvals.

Use [references/repository-map.md](references/repository-map.md) to select the required sources. Read [references/release-gates.md](references/release-gates.md) whenever the request touches Resend, Vercel, Supabase, recipients or production state.

## 4. Use TEST mode for safe learning

Activate TEST mode only when the user's request explicitly labels the campaign `TEST`, `DEMO` or `SANDBOX`. Do not infer it merely because a user is exploring ideas.

TEST mode keeps the technical production workflow while replacing production approvals with safe fixtures:

- Use a campaign ID ending in `-test` and display `TEST — NOT FOR SEND` prominently in its README, Studio metadata, subjects, previews and Resend template names/aliases.
- Use obviously fictional recipients, businesses, offers, prices, terms and links when examples help demonstrate capability. Prefix fictional commercial copy with `TEST ONLY` or use `example.invalid` destinations so it cannot be mistaken for approved truth.
- Allow representative fixture values instead of waiting for approved commercial, fulfilment, recipient-source or legal facts. Record every fixture in a dedicated **Test fixtures** section in the campaign README.
- Generate the full strategy, sequence, structured data, branded HTML and Studio preview. Run the same JSON, renderer, accessibility, template, test and build validation as STANDARD mode.
- Add the templates to Resend as clearly labelled drafts after the normal fresh approval for the named batch. Never publish them, use a production alias, or overwrite a non-test template.
- Commit the scoped TEST campaign automatically after validation and Resend draft verification.

TEST mode must still enforce these hard boundaries:

- Never import, select or contact real recipients.
- Never send email, create a broadcast, enable an automation or enable a runtime campaign.
- Never set `EMAIL_LIVE_MODE=true`, create production data, deploy or modify a production sender/domain.
- Never use unapproved or rights-restricted real customer, celebrity, product or proof assets. Use no imagery or an explicitly approved test-safe asset.
- Never present fictional facts as approved, real or production-ready.
- Never register the campaign as enabled in `shared/campaign-registry.js`.

Mark TEST-mode legal, consent, commercial and delivery release gates `NOT APPLICABLE — TEST FIXTURE; NO RECIPIENTS OR SEND`. Keep repository integrity, rendering, accessibility, secret, Resend-draft isolation and Git-scope gates mandatory. To convert a TEST campaign to production, create a non-test campaign ID, remove every fixture and TEST marker, rerun the complete STANDARD preflight and obtain all current approvals.

## 5. Complete the mandatory preflight

Read `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` completely before creating or changing campaign content. Follow its repository-preflight routing; do not claim to have read files that were not opened.

Perform the canonical prompt's preflight automatically. Represent its result only in the `STEP 1/7 — CHECK` line and store the full Compliance Preflight in repository audit material. If its status is `READY TO PRODUCE`, continue without waiting for another confirmation. Resolve or tokenise unknown product, price, fulfilment, asset, legal, consent and commercial facts. Stop only when a required source is missing or contradictory.

For an existing campaign, read its complete source folder. For a new campaign, read the closest comparable campaign and the relevant lifecycle material under `email/03-sequences/`.

## 6. Maintain canonical campaign source

For a new campaign, create or complete:

```text
email/campaigns/<market>-<audience>-<action>/
├── README.md
├── sequence.md
├── email-data.json
├── studio.json
└── emails/
```

Add `whatsapp.md`, `onboarding.md`, `docs/` or `resend.json` only when the campaign genuinely needs them.

- Keep strategy, cadence, eligibility, exclusions, stop rules, handoff and approval gaps in `README.md`.
- Keep complete human-readable message copy in `sequence.md`.
- Keep renderer input in `email-data.json`; maintain semantic equivalence with `sequence.md`.
- Keep Studio display metadata and one timeline day per message in `studio.json`.
- Register operational timing, template IDs, variables and exit events in `shared/campaign-registry.js` only when the application will operate the campaign. Add it disabled by default.
- Keep template release metadata in `resend.json` only when the repository release tooling requires it.

Use `output`/`title` for newly generated master-template campaigns. Treat existing `file`/`subject` records as supported legacy input, not the preferred new schema.

## 7. Generate; do not hand-maintain HTML

- Edit `email-data.json` and `sequence.md` for campaign-specific changes.
- Edit `email/campaigns/_shared/master-template.js` only for an approved global rendering change.
- Register a new master-rendered campaign with the shared builder when necessary.
- Run `node email/campaigns/_shared/build-all.js` after source or renderer changes.
- Review every generated diff. Never treat `emails/*.html` as the primary editable source.

The Studio discovers campaign folders with `email-data.json` and `studio.json` automatically. Do not add hard-coded UI imports.

## 8. Validate before reporting completion

Run the skill validator for each changed campaign:

```bash
node .agents/skills/build-jimmy-coco-email-campaign/scripts/validate-campaign.mjs <campaign-id>
```

Then run:

```bash
npm test
npm run build
```

For Resend-related work, also run `npm run templates:check`. Treat any failure as a release blocker; do not weaken or bypass validation merely to obtain a green result.

Review the final diff for unrelated files, secrets, temporary output, broken links, unsupported claims, generated/source disagreement and unintended campaign activation.

## 9. Add every campaign template to Resend

Resend template creation is a required stage of a complete campaign build, not an optional handoff. Perform it only after source, rendering and validation gates pass.

1. Prepare a release manifest listing every message alias, subject, generated HTML path and required variable.
2. Always use the repository tooling as the primary Resend interface: run `npm run templates:check` with `RESEND_API_KEY` loaded when available. When the repository-root `.env.local` exists, load it without printing its contents (`set -a; source .env.local; set +a`) before running the template command. Use Resend MCP only as an optional read-only fallback when the local tooling cannot perform an authenticated inspection; do not substitute MCP writes for the repository release command.
3. Review the complete drift set reported by `npm run templates:check`. Immediately before the first Resend write, show every template that the repository command will affect and state that `npm run templates:publish` updates and publishes those templates; then obtain fresh explicit human approval for that exact set.
4. After approval, run `npm run templates:publish`. Do not use it if the reported drift includes templates outside the approved set; resolve or isolate the drift first. If a required template does not yet exist and the repository command cannot create it, report the missing-template blocker instead of switching to an ad hoc MCP/API write.
5. Record template identifiers in the repository source used by the release/runtime tooling when identifiers are returned. Regenerate or revalidate if metadata changes.
6. Read every created or updated template back from Resend and compare alias, subject, variables, status and content with the repository.

Do not silently omit Resend because credentials or MCP access are unavailable. Report the campaign as `BLOCKED` until the required connection or approval is available. Creating or updating a draft does not authorise publishing it, enabling automation or sending it.

## 10. Handle external systems safely

Use `npm run templates:check` for Resend inspection and `npm run templates:publish` for approved template writes. Resend MCP is an optional read-only fallback when authenticated local inspection is unavailable; it is not the normal write path. Keep MCP/API secrets out of files and output.

Require fresh explicit approval immediately before any consequential write, including:

- creating, updating or publishing a Resend template;
- creating or enabling a Resend automation;
- importing contacts or sending a broadcast;
- changing Supabase production data or schema;
- changing Vercel production configuration or deploying;
- enabling a campaign or `EMAIL_LIVE_MODE`.

Never use an ordinary Git push as implicit authority to publish Resend content. Prefer the explicit `npm run templates:publish` release action after all gates pass.

## 11. Commit validated campaign changes

After the campaign and Resend draft verification pass:

1. Run `git status --short`, inspect the task diff and identify the exact files owned by the campaign build.
2. Stage only those paths with explicit `git add <path>...`; never use `git add -A` or `git add .`.
3. Create one commit using `Build <campaign-id> email campaign` unless the user supplies a message.
4. If a Git hook would publish templates implicitly, set `SKIP_RESEND_SYNC=1` for the commit because the explicit Resend stage already owns remote writes.
5. Verify the commit contents and leave unrelated modifications unstaged.

Do not push the commit unless the user explicitly asks. If validation or Resend draft verification fails, do not commit a falsely complete campaign; report the blocker and leave the scoped changes available for correction.

## 12. Report truthfully

Write the canonical prompt's complete **Production Report** into campaign audit material with changed paths, sources actually read, campaign summary, renderer confirmation, outstanding approval tokens, gate results, Resend template IDs/statuses, and the local Git commit hash. In conversation, return only the applicable step lines and final `DONE` line from the staff-facing output contract. If Resend or commit completion is blocked, use that step line for the single actionable blocker and omit `DONE` until the requested workflow is genuinely complete.

Do not say `READY TO SEND` without named human approval of the current recipients, copy, facts, assets and rendered output.
