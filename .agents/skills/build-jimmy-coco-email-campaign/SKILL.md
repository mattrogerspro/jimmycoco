---
name: build-jimmy-coco-email-campaign
description: Turn simple, plain-language requests into complete, high-quality Sunless by Jimmy Coco email campaigns that automatically follow repository strategy, brand, copy, design, asset, lifecycle, compliance and delivery rules. Use whenever anyone asks to build, create, write, plan, edit, improve, localise, render, review or release an email campaign or sequence, including outreach, onboarding, lifecycle and market-specific campaigns.
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

Use [references/repository-map.md](references/repository-map.md) to select the required sources. Read [references/release-gates.md](references/release-gates.md) whenever the request touches Resend, Vercel, Supabase, recipients or production state.

## 4. Complete the mandatory preflight

Read `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` completely before creating or changing campaign content. Follow its repository-preflight routing; do not claim to have read files that were not opened.

Perform the canonical prompt's preflight automatically. Surface its concise **Compliance Preflight** as a progress update, not as a questionnaire or a request for the user to paste system instructions. If its status is `READY TO PRODUCE`, continue without waiting for another confirmation. Resolve or tokenise unknown product, price, fulfilment, asset, legal, consent and commercial facts. Stop only when a required source is missing or contradictory.

For an existing campaign, read its complete source folder. For a new campaign, read the closest comparable campaign and the relevant lifecycle material under `email/03-sequences/`.

## 5. Maintain canonical campaign source

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

## 6. Generate; do not hand-maintain HTML

- Edit `email-data.json` and `sequence.md` for campaign-specific changes.
- Edit `email/campaigns/_shared/master-template.js` only for an approved global rendering change.
- Register a new master-rendered campaign with the shared builder when necessary.
- Run `node email/campaigns/_shared/build-all.js` after source or renderer changes.
- Review every generated diff. Never treat `emails/*.html` as the primary editable source.

The Studio discovers campaign folders with `email-data.json` and `studio.json` automatically. Do not add hard-coded UI imports.

## 7. Validate before reporting completion

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

## 8. Add every campaign template to Resend

Resend template creation is a required stage of a complete campaign build, not an optional handoff. Perform it only after source, rendering and validation gates pass.

1. Prepare a release manifest listing every message alias, subject, generated HTML path and required variable.
2. Run `npm run templates:check` with `RESEND_API_KEY` loaded when available. When the repository-root `.env.local` exists, load it without printing its contents (`set -a; source .env.local; set +a`) before running the template command. Use Resend MCP read operations as the authenticated fallback for inspection.
3. Immediately before the first Resend write, show the exact templates and action, then obtain fresh explicit human approval. One approval may cover the complete named campaign batch.
4. After approval, create missing Resend templates as drafts and update existing drafts so alias, subject, HTML and variables match the repository.
5. Record template identifiers in the repository source used by the release/runtime tooling when identifiers are returned. Regenerate or revalidate if metadata changes.
6. Read every created or updated template back from Resend and compare alias, subject, variables, status and content with the repository.

Do not silently omit Resend because credentials or MCP access are unavailable. Report the campaign as `BLOCKED` until the required connection or approval is available. Creating or updating a draft does not authorise publishing it, enabling automation or sending it.

## 9. Handle external systems safely

Use Resend MCP read operations to list or inspect templates and compare aliases, subjects, status and content. Use approved writes for the named campaign batch after the gate above. Keep MCP/API secrets out of files and output.

Require fresh explicit approval immediately before any consequential write, including:

- creating, updating or publishing a Resend template;
- creating or enabling a Resend automation;
- importing contacts or sending a broadcast;
- changing Supabase production data or schema;
- changing Vercel production configuration or deploying;
- enabling a campaign or `EMAIL_LIVE_MODE`.

Never use an ordinary Git push as implicit authority to publish Resend content. Prefer the explicit `npm run templates:publish` release action after all gates pass.

## 10. Commit validated campaign changes

After the campaign and Resend draft verification pass:

1. Run `git status --short`, inspect the task diff and identify the exact files owned by the campaign build.
2. Stage only those paths with explicit `git add <path>...`; never use `git add -A` or `git add .`.
3. Create one commit using `Build <campaign-id> email campaign` unless the user supplies a message.
4. If a Git hook would publish templates implicitly, set `SKIP_RESEND_SYNC=1` for the commit because the explicit Resend stage already owns remote writes.
5. Verify the commit contents and leave unrelated modifications unstaged.

Do not push the commit unless the user explicitly asks. If validation or Resend draft verification fails, do not commit a falsely complete campaign; report the blocker and leave the scoped changes available for correction.

## 11. Report truthfully

Return the canonical prompt's **Production Report** with changed paths, sources actually read, campaign summary, renderer confirmation, outstanding approval tokens, gate results, Resend template IDs/statuses, and the local Git commit hash. If Resend or commit completion is blocked, state that prominently and use the corresponding non-complete status.

Do not say `READY TO SEND` without named human approval of the current recipients, copy, facts, assets and rendered output.
