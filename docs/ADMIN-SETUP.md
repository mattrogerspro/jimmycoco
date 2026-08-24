# Admin setup — standing the system up from GitHub

> **Audience: the administrator only.** This is the full technical stand-up (accounts, keys, database, hosting). Team members never need any of this — they use the plain-language guide in the Studio instead (email/guides/06-install-guide.md). This file lives outside email/ deliberately so it is not published to the Studio.

Everything in this guide starts from the repository at [github.com/mattrogerspro/jimmycoco](https://github.com/mattrogerspro/jimmycoco). You can read every file linked below directly on GitHub — and if you only have browser access, the final section shows how to run the whole system without ever cloning to your own machine.

## What you need

| Piece | Purpose | Account needed |
|---|---|---|
| GitHub repo access | The source of truth | ✓ you have this |
| Node.js 22+ and npm | Build, test and generate emails | — |
| Vercel | Hosts the Studio + API + send worker | vercel.com |
| Resend | Email transport and templates | resend.com |
| Supabase | Operational database and stats | supabase.com |
| Claude (Cowork or Code) | Campaign production via the skill | claude.ai |

## 1 · Get the code

Local clone: `git clone https://github.com/mattrogerspro/jimmycoco.git` — or press the **Code → Codespaces** button on GitHub to get a full cloud workspace in the browser (see the last section).

Key files to know before anything else: [README.md](https://github.com/mattrogerspro/jimmycoco/blob/main/README.md) · [CLAUDE.md](https://github.com/mattrogerspro/jimmycoco/blob/main/CLAUDE.md) (agent rules) · [package.json](https://github.com/mattrogerspro/jimmycoco/blob/main/package.json) (scripts).

## 2 · Install and wire the hooks

```
npm install
git config core.hooksPath .githooks
```

The second line activates [.githooks/pre-push](https://github.com/mattrogerspro/jimmycoco/blob/main/.githooks/pre-push), which runs the read-only repository email contract validation and aborts the push if validation fails. It never writes to Resend.

## 3 · Environment

Copy [.env.example](https://github.com/mattrogerspro/jimmycoco/blob/main/.env.example) to `.env` and fill it. The variables, by system:

| System | Variables |
|---|---|
| Supabase | `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Resend | `RESEND_API_KEY` · `RESEND_WEBHOOK_SECRET` · `RESEND_FROM` · `RESEND_REPLY_TO` |
| Send locks & auth | `EMAIL_LIVE_MODE` (keep `false`) · `CRON_SECRET` · `AUTOMATION_API_KEY` · `AUDIENCE_IMPORT_API_KEY` · `AUDIENCE_IMPORT_SIGNING_SECRET` · `EMAIL_WORKER_BATCH_SIZE` |
| Sender identity | `EMAIL_SENDER_NAME` · `EMAIL_SENDER_TITLE` · `EMAIL_SUPPORT_EMAIL` · `EMAIL_BUSINESS_ADDRESS` |
| Campaign links | `EMAIL_CALENDAR_LINK` · `EMAIL_TRIAL_LINK` · `EMAIL_TRADE_LINK` · `EMAIL_SHADE_GUIDE_LINK` · `EMAIL_ORDER_LINK` |
| Market facts | `EMAIL_UAE_DELIVERY_STATEMENT` · `EMAIL_UAE_PARTNER_TERMS` |
| Tracking | `EMAIL_OPEN_TRACKING_ENABLED` · `EMAIL_CLICK_TRACKING_ENABLED` |

Never commit `.env` — it is gitignored. Production values live in Vercel, not in files.

## 4 · Supabase

Create a project and apply the committed migrations in timestamp order with `npx supabase db push` (or review and run them in the SQL editor). They create the contacts, enrolments, jobs, messages, suppressions, reporting views and protected worker/import RPCs. Copy the project URL and server-only service-role key into your environment.

### Audience importer

The Studio route `#audience-import` is the protected admin importer. Set a dedicated `AUDIENCE_IMPORT_API_KEY`; do not reuse or expose the Supabase service-role key. `AUDIENCE_IMPORT_SIGNING_SECRET` signs 30-minute previews so a changed file, campaign, start time or database eligibility result must be previewed again before commit.

The importer requires the CSV columns `email`, `first_name`, `business_name`, `business_type`, `market`, `timezone`, `company_legal_entity_type`, `source`, `source_date`, `owner`, `eligibility_decision`, `eligibility_reason` and `lawful_basis`. `first_name` may be blank (the runtime uses `Salon Owner`), and either the eligibility reason or lawful-basis record may be blank, but not both. A row is never made eligible from its email address alone.

Preview is read-only. Commit requires an exact confirmation phrase, repeats the customer, trial, suppression and active-enrolment checks inside one database transaction, and stores an audit record. It enrols only eligible rows and does not send email or import a Resend segment.

## 5 · Resend

Create an API key, verify your sending domain, then add a webhook endpoint pointing at `https://jimmycoco.email/api/webhooks/resend` (all delivery events). Put its signing secret in `RESEND_WEBHOOK_SECRET` — the handler at [api/webhooks/resend.js](https://github.com/mattrogerspro/jimmycoco/blob/main/api/webhooks/resend.js) rejects anything unsigned.

Use one reply identity everywhere: `RESEND_REPLY_TO=partnerships@email.jimmycoco.pro`. That address must be configured as a Resend-managed receiving address. Inbound `email.received` webhooks stop active outreach in the playbook as `reply`; the same Resend inbound route should forward the human-visible copy to `matthew@jimmycoco.pro` for same-day handling. Do not set campaign templates or automation settings to reply directly to Matthew unless the mailbox itself is integrated with the playbook, because direct mailbox replies will not produce the Resend webhook exit.

## 6 · Vercel

Import the GitHub repo as a Vite project. [vercel.json](https://github.com/mattrogerspro/jimmycoco/blob/main/vercel.json) already declares the SPA rewrite, function limits and the 15-minute send-worker cron — no dashboard cron setup needed. Add every environment variable from step 3 to the project (with `EMAIL_LIVE_MODE=false`). From then on **every push to main deploys automatically**.

## 7 · Verify the installation

```
npm test                                      # 12 tests
node email/campaigns/_shared/build-all.js --check   # validates every campaign
npm run build                                 # Studio builds
npm run templates:check                       # repo vs Resend drift (read-only)
```

All four green means the system is healthy. The runtime equivalents: `https://jimmycoco.email/api/health` and the Studio itself.

## 8 · The Claude skill

Campaign production runs through the **build-jimmy-coco-email-campaign** skill, which treats the repo as canonical and never sends. Install it in Claude (Cowork: Settings → Capabilities → Skills), and note [.mcp.json](https://github.com/mattrogerspro/jimmycoco/blob/main/.mcp.json) declares the Resend, Supabase and Vercel MCP connectors for diagnostics. The canonical production rules it follows: [EMAIL-CAMPAIGN-GENERATOR-PROMPT.md](https://github.com/mattrogerspro/jimmycoco/blob/main/email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md).

## 9 · Day-to-day commands

| Task | Command |
|---|---|
| Run the Studio locally | `npm run dev` |
| Regenerate campaign HTML | `node email/campaigns/_shared/build-all.js <campaign-id>` |
| Validate everything | `npm test` + `build-all.js --check` |
| Validate runtime email contracts | `npm run templates:check` |
| Push repository changes | `git push` (the hook validates locally and never writes to Resend) |

## Running without a local copy — is it feasible?

**The runtime already is.** Sending, webhooks, stats and the Studio run entirely on Vercel + Resend + Supabase — no laptop involved. What still assumes *a* computer is authoring and generation (`build-all.js` and tests). Three ways to move that off your machine too:

1. **GitHub Codespaces** — the fastest path. Press **Code → Create codespace** on the repo and you get a browser VS Code with Node and a terminal; every command in this guide works there unchanged, including the git hooks. The repo copy lives in GitHub's cloud, not on your device.
2. **GitHub Actions** — automate the machine away: a workflow that runs `npm test`, `npm run templates:check` and `build-all.js --check` on every pull request. Small edits can then be made entirely in the GitHub web editor.
3. **Claude cloud sessions** — a Cowork task running in the cloud can clone the repo over HTTPS, run the skill, build, validate and push — the same production flow used to build the Sydney campaign, with no folder connected at all.

The honest caveat: until the Actions workflow from option 2 exists, a purely web-edited change needs someone (or a Codespace, or Claude) to run the local build and validation commands before deployment. The UK/U.S. launch worker renders from the deployed repository source, so no Resend Template synchronization is required.
