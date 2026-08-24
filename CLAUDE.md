# Jimmy Coco repository instructions

## Work safely

- Inspect `git status --short`, the current branch and relevant diffs before editing.
- This worktree may be shared with another agent. Preserve unrelated changes and stop if concurrent work overlaps the requested files.
- Never use `git add -A`. Stage only named, reviewed task files.
- Do not remove `.git/index.lock` while any Git or agent process owns it. Never force-push or use destructive Git recovery without explicit approval.
- Treat file-edit requests as authority to edit and validate, not to publish templates, send email, import contacts, enable campaigns, change production data or deploy externally.

## Email campaign work

- Use `.agents/skills/build-jimmy-coco-test-email/SKILL.md` for explicitly labelled TEST templates, prototypes, mockups, screenshot reconstructions, isolated Resend test templates and controlled reviewer test sends. Its reduced workflow applies only while the work remains a disabled, clearly labelled test fixture.
- Automatically use `.claude/skills/build-jimmy-coco-email-campaign/SKILL.md` whenever anyone asks to build, create, write, plan, edit, improve, localise, render, review or release a production email campaign or sequence.
- Do not ask employees to paste the canonical prompt, understand repository schemas or complete a long intake form. Convert their request into the internal brief, discover approved repository context, and ask only genuinely blocking business questions.
- Unless narrowed by the user, “build a campaign” means create the complete repository draft, generate its HTML, expose it in the Studio and validate it. It does not authorise Resend publication or sending.
- Read `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` completely before changing campaign content.
- The repository owns campaign truth. Edit structured source and regenerate HTML; do not hand-maintain generated campaign HTML.
- Keep campaign `README.md`, `sequence.md`, `email-data.json`, `studio.json`, generated `emails/` and any operational registry entry consistent.
- Keep new and changed campaigns disabled until production enablement is explicitly approved.
- Never invent pricing, trade terms, fulfilment, availability, legal basis, consent, claims, endorsements or asset rights. Use approval tokens or stop.

## Release boundaries

- `npm run templates:check` validates the application-owned runtime contract for the UK and U.S. launch emails. There is no Resend Template publishing command for these campaigns.
- The pre-push hook is read-only and must never mutate Resend.
- Never send to recipients, create broadcasts, import contacts, enable automations or turn on `EMAIL_LIVE_MODE` without fresh explicit approval.
- Run campaign validation, `npm test` and `npm run build` before reporting campaign work complete. Report blockers rather than weakening validation.

## Technical interface

- Use sans-serif typography for the Studio UI and technical content.
- Customer-facing email typography and design must come from the approved shared email renderer; do not invent a parallel design system.
