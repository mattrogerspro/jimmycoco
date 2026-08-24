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

## Runtime email release

- `npm test` and `npm run build` pass.
- Campaign validator passes.
- `npm run templates:check` passes for all 14 UK/U.S. repository-rendered messages.
- The direct-send payload contains complete subject and HTML, no Resend Template reference and no unresolved token.
- The signed preferences link and one-click unsubscribe path are verified.

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
- The pre-push hook must remain read-only and must never publish Resend templates.
- Confirm the pushed commit is an ancestor of `origin/main` before claiming deployment readiness.

If a gate is not applicable, mark it `NOT APPLICABLE` with a reason. Never silently skip a required gate.
