# Jimmy Coco repository instructions

## Work safely

- Inspect `git status --short`, the current branch and relevant diffs before editing.
- This worktree may be shared with another agent. Preserve unrelated changes and stop if concurrent work overlaps the requested files.
- Never use `git add -A`. Stage only named, reviewed task files.
- Do not remove `.git/index.lock` while any Git or agent process owns it. Never force-push or use destructive Git recovery without explicit approval.
- Treat file-edit requests as authority to edit and validate, not to publish templates, send email, import contacts, enable campaigns, change production data or deploy externally.

## Email campaign work

- Use the project skill at `.claude/skills/build-jimmy-coco-email-campaign/SKILL.md` whenever creating, editing, localising, rendering, reviewing or releasing an email campaign.
- Read `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` completely before changing campaign content.
- The repository owns campaign truth. Edit structured source and regenerate HTML; do not hand-maintain generated campaign HTML.
- Keep campaign `README.md`, `sequence.md`, `email-data.json`, `studio.json`, generated `emails/` and any operational registry entry consistent.
- Keep new and changed campaigns disabled until production enablement is explicitly approved.
- Never invent pricing, trade terms, fulfilment, availability, legal basis, consent, claims, endorsements or asset rights. Use approval tokens or stop.

## Release boundaries

- `npm run templates:check` is diagnostic. `npm run templates:publish` requires explicit human approval after review.
- Never treat an ordinary Git push as authority to publish Resend templates. Use `SKIP_RESEND_SYNC=1` for a Git-only push when the configured hook would otherwise mutate Resend.
- Never send to recipients, create broadcasts, import contacts, enable automations or turn on `EMAIL_LIVE_MODE` without fresh explicit approval.
- Run campaign validation, `npm test` and `npm run build` before reporting campaign work complete. Report blockers rather than weakening validation.

## Technical interface

- Use sans-serif typography for the Studio UI and technical content.
- Customer-facing email typography and design must come from the approved shared email renderer; do not invent a parallel design system.
