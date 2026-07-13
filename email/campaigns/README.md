# Campaigns

Home for every **outreach & marketing campaign** — cold acquisition, stockist recruitment, partner journeys. One folder per campaign, each holding its *full* sequence: written content **and** sendable code, side by side.

> **Separate from `../03-sequences/`:** that folder is maintained by the automated lifecycle-sequence builder (welcome, abandonment, post-purchase, replenishment…). Outreach campaigns live **here** so the two never collide on the same files.

## Campaign registry

| Campaign | Folder | Channel | Market | Status | Hook |
|---|---|---|---|---|---|
| AU salon seeding (cold outreach) | [`au-salon-seeding/`](au-salon-seeding/) | Email + WhatsApp | 🇦🇺 AU | Draft | Free sample before summer |
| AU salon account flow (post-sample) | [`au-salon-account-flow/`](au-salon-account-flow/) | Email + WhatsApp | 🇦🇺 AU | Draft | Sample → terms → first order |
| UK salon stockist recruitment | [`uk-salon-stockist/`](uk-salon-stockist/) | Email (MailerLite) | 🇬🇧 UK | Email 1 live | "Your clients already know this name" |

_Keep this table current — it's the one place to see every campaign at a glance._

## Every campaign folder has the same shape

```
<campaign>/
  README.md      — the brief: goal, audience, offer, channel, status, cadence, file index
  sequence.md    — email copy: subject, preview text and body for every email
  whatsapp.md    — WhatsApp copy         (only if the campaign uses WhatsApp)
  onboarding.md  — post-reply copy       (only if used)
  emails/        — the sendable HTML, one file per email:  N-slug.html
  docs/          — playbooks, guides, PDFs — reference material, NOT for sending  (optional)
```

The split that keeps it un-confusing: **`emails/` = things you send. `docs/` = things you read.** `sequence.md` is always the written copy; the HTML in `emails/` is the coded version of that same copy.

## How to add a campaign

1. **Copy the scaffold:** `cp -R _TEMPLATE <market>-<audience>-<action>` (kebab-case, e.g. `us-salon-seeding`).
2. **Fill the brief** in `README.md` and **write the copy** in `sequence.md`.
3. **Add the code:** drop each email's HTML into `emails/` as `N-slug.html`.
4. **Register it:** add a row to the table above.

## Conventions
- **Folder names:** `kebab-case`, `<market>-<audience>-<action>`.
- **Email files:** numbered by send order — `1-`, `2-` — with a short slug. If an email is **plain-text only** (no HTML), it has no file in `emails/` — its copy still lives in `sequence.md`, and the README's cadence table notes it.
- **Merge tags / hosting:** note ESP-specific syntax in the campaign README (MailerLite `{$unsubscribe}`, MailerLite-CDN images, Resend variables) so no one breaks them.
- **Status values:** `Draft` → `Ready` → `Live` → `Archived`.
