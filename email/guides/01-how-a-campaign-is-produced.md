# How a campaign is produced

Every campaign follows the same pipeline, whether it starts from a one-line request or a detailed brief. Knowing the shape helps you understand what you're reviewing and why nothing is hand-made.

## The pipeline

1. **Brief** — your plain-language request is expanded into market, audience, outcome, offer, cadence, exclusions and handoff.
2. **Preflight** — the producer reads the governing playbooks and the closest comparable campaign, and checks the new campaign cannot collide with lifecycle automation in `email/03-sequences/`. Production proceeds only on `READY TO PRODUCE`.
3. **Source files** — the campaign folder is created with a fixed shape (below).
4. **Generation** — branded HTML is rendered by the shared master template. Nobody hand-codes an email.
5. **Validation** — the build validator, the test suite and (for Resend work) the template drift check must all pass.
6. **Review** — you get a Production Report listing what changed, what was read, what still needs approval, and the QA gate results.

## The campaign folder

```
email/campaigns/<market>-<audience>-<action>/
  README.md        strategy, cadence, exclusions, stop rules, approval gaps
  sequence.md      human-readable copy: subjects, previews, full bodies
  email-data.json  the single content source the renderer consumes
  studio.json      what this Studio displays, one timeline day per message
  emails/          generated HTML — build output, never edited by hand
```

## The one rule that protects everything

**Generated HTML is never the editable source.** To change an email, change `email-data.json` and `sequence.md`, then rebuild:

```
node email/campaigns/_shared/build-all.js <campaign-id>
```

A global look-and-feel change belongs in `master-template.js` (approval required) — one change there updates every campaign consistently on the next build.

## Where the rules live

| Area | Source |
|---|---|
| Strategy and audiences | `email/00-strategy/` |
| Design and templates | `email/01-design-system/` and `email/02-template-system/` |
| Copy, subjects, CTAs | `email/04-copy-system/` |
| AI production controls | `email/05-ai-production/` |
| Assets and rights | `email/06-assets/` |
| Sending and data | `email/07-resend-integration/` |
| The canonical process | `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` |
