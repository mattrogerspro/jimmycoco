# Campaigns

Home for every **outreach & marketing campaign** — cold acquisition, stockist recruitment, partner journeys. One folder per campaign, and each campaign holds its *full* sequence: the written content **and** the ready-to-send code, side by side.

> **Why this folder exists separately from `../03-sequences/`:** `03-sequences/` is maintained by the automated lifecycle-sequence builder (welcome, browse/cart abandonment, post-purchase, replenishment…). Outreach campaigns live **here** in `campaigns/` so the two never collide on the same files.

## Campaign registry

| Campaign | Folder | Channel | Market | Status | Hook |
|---|---|---|---|---|---|
| AU salon seeding (cold outreach) | [`au-salon-seeding/`](au-salon-seeding/) | Email + WhatsApp | 🇦🇺 AU | Draft | Free sample before summer |
| AU salon account flow (post-sample) | [`au-salon-account-flow/`](au-salon-account-flow/) | Email + WhatsApp | 🇦🇺 AU | Draft | Sample → terms → first order |
| UK salon stockist recruitment | [`uk-salon-stockist/`](uk-salon-stockist/) | Email (MailerLite) | 🇬🇧 UK | Email 1 live | "Your clients already know this name" |

_Keep this table current — it's the one place to see every campaign at a glance._

## How to add a campaign

1. **Copy the scaffold:** `cp -R _TEMPLATE <market>-<audience>-<action>` (kebab-case, e.g. `us-salon-seeding`).
2. **Fill the brief:** edit `README.md` — goal, audience, offer, channel, cadence, status.
3. **Write the sequence:** edit `sequence.md` — subject, preview and copy for every touch.
4. **Add the code:** drop each email's HTML into `templates/` as `NN-slug.html`.
5. **Register it:** add a row to the table above.

## Folder convention

```
<campaign>/
  README.md      — the brief: goal, audience, offer, channel, status, cadence, file index
  sequence.md    — the full written sequence (subject, preview text, copy per touch)
  templates/     — the HTML code, one file per email  (NN-slug.html)
  assets/        — PDFs, guides, reference images       (optional)
```

This is the **baseline** — a campaign can carry more (playbooks, WhatsApp copy, a shade guide), as the AU campaigns do. The three files above are the minimum so content and code never drift apart.

## Conventions
- **Folder names:** `kebab-case`, `<market>-<audience>-<action>` (e.g. `au-salon-seeding`).
- **HTML files:** numbered by send order — `01-`, `02-` — with a short slug.
- **Merge tags / hosting:** note any ESP-specific syntax in the campaign README (MailerLite `{$unsubscribe}`, MailerLite-CDN-hosted images, Resend variables) so no one breaks them.
- **Status values:** `Draft` → `Ready` → `Live` → `Archived`.
