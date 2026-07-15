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

The second line activates [.githooks/pre-push](https://github.com/mattrogerspro/jimmycoco/blob/main/.githooks/pre-push), which syncs email templates to Resend on every push and aborts the push if the sync fails. Bypass once with `SKIP_RESEND_SYNC=1 git push`.

## 3 · Environment

Copy [.env.example](https://github.com/mattrogerspro/jimmycoco/blob/main/.env.example) to `.env` and fill it. The variables, by system:

| System | Variables |
|---|---|
| Supabase | `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Resend | `RESEND_API_KEY` · `RESEND_WEBHOOK_SECRET` · `RESEND_FROM` · `RESEND_REPLY_TO` |
| Send locks & auth | `EMAIL_LIVE_MODE` (keep `false`) · `CRON_SECRET` · `AUTOMATION_API_KEY` · `EMAIL_WORKER_BATCH_SIZE` |
| Sender identity | `EMAIL_SENDER_NAME` · `EMAIL_SENDER_TITLE` · `EMAIL_SUPPORT_EMAIL` · `EMAIL_BUSINESS_ADDRESS` |
| Campaign links | `EMAIL_CALENDAR_LINK` · `EMAIL_TRIAL_LINK` · `EMAIL_TRADE_LINK` · `EMAIL_SHADE_GUIDE_LINK` · `EMAIL_ORDER_LINK` |
| Market facts | `EMAIL_UAE_DELIVERY_STATEMENT` · `EMAIL_UAE_PARTNER_TERMS` |
| Tracking | `EMAIL_OPEN_TRACKING_ENABLED` · `EMAIL_CLICK_TRACKING_ENABLED` |

Never commit `.env` — it is gitignored. Production values live in Vercel, not in files.

## 4 · Supabase

Create a project, then run the one migration in the SQL editor: [supabase/migrations/20260714150000_email_outreach.sql](https://github.com/mattrogerspro/jimmycoco/blob/main/supabase/migrations/20260714150000_email_outreach.sql). It creates the contacts, enrollments, jobs, messages, suppressions and events tables plus the stats views and worker RPCs. Copy the project URL and keys into your environment.

## 5 · Resend

Create an API key, verify your sending domain, then add a webhook endpoint pointing at `https://jimmycoco.email/api/webhooks/resend` (all delivery events). Put its signing secret in `RESEND_WEBHOOK_SECRET` — the handler at [api/webhooks/resend.js](https://github.com/mattrogerspro/jimmycoco/blob/main/api/webhooks/resend.js) rejects anything unsigned.

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
| Check Resend drift | `npm run templates:check` |
| Publish templates (approval-gated) | `npm run templates:publish` |
| Push without template sync | `SKIP_RESEND_SYNC=1 git push` |

## Running without a local copy — is it feasible?

**The runtime already is.** Sending, webhooks, stats and the Studio run entirely on Vercel + Resend + Supabase — no laptop involved. What still assumes *a* computer is authoring and generation (`build-all.js`, tests, template publish). Three ways to move that off your machine too:

1. **GitHub Codespaces** — the fastest path. Press **Code → Create codespace** on the repo and you get a browser VS Code with Node and a terminal; every command in this guide works there unchanged, including the git hooks. The repo copy lives in GitHub's cloud, not on your device.
2. **GitHub Actions** — automate the machine away: a workflow that runs `npm test` and `build-all.js --check` on every pull request, and a manually-triggered workflow (with `RESEND_API_KEY` as a repository secret) that replaces the local pre-push template sync. Small edits can then be made entirely in the GitHub web editor.
3. **Claude cloud sessions** — a Cowork task running in the cloud can clone the repo over HTTPS, run the skill, build, validate and push — the same production flow used to build the Sydney campaign, with no folder connected at all.

The honest caveat: today the pre-push hook is the only bridge between "edited on GitHub.com" and "templates synced to Resend" — until the Actions workflow from option 2 exists, a purely web-edited change to email content needs someone (or a Codespace, or Claude) to run `templates:check`/`publish`. Everything else is already serverless.
