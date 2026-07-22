# Campaign release gates

Apply only the gates relevant to the requested stage. File creation does not imply production authority.

## Source complete

- Required campaign files exist and agree.
- Unknown facts are tokenised or marked `[SOURCE REQUIRED]`.
- HTML is generated from structured source.
- Studio discovery metadata is complete.
- Campaign remains disabled unless enablement was explicitly approved.

## Human review

- Copy, facts, claims, assets, recipient basis and market compliance have named owners.
- Lifecycle collisions, exclusions, stop rules and response handoff are reviewed.
- Mobile, blocked-image, Outlook, accessibility and plain-text behaviour are reviewed.

## Template release

- `npm test` and `npm run build` pass.
- Campaign validator passes.
- `npm run templates:check` passes with remote comparison when credentials are available.
- Repository and Resend alias, subject, variables and HTML differences are understood.
- The complete drift set is reviewed, and a human explicitly approves `npm run templates:publish` for that exact set. Do not use MCP writes as an equivalent release path.

## Sending enablement

- Sending domain and monitored identities are verified.
- Supabase migration, webhook verification and event ingestion are proven.
- Consent, classification, suppression, idempotency and frequency gates are active.
- `shared/campaign-registry.js`, the Supabase campaign row and `EMAIL_LIVE_MODE` are deliberately enabled.
- A small internal-address test succeeds before any qualified external cohort.

## Git and deployment

- Stage named task files only.
- Never include another agent's changes in a commit without review and user direction.
- Do not force-push.
- Do not let a pre-push hook publish Resend templates implicitly; use `SKIP_RESEND_SYNC=1` for a Git-only push when appropriate.
- Confirm the pushed commit is an ancestor of `origin/main` before claiming deployment readiness.

If a gate is not applicable, mark it `NOT APPLICABLE` with a reason. Never silently skip a required gate.
