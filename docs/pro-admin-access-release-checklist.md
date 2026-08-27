# Jimmy Coco PRO Admin Access Registration — Release Checklist

## Status

The Option A workflow is **implemented locally and validated**, but it is **not committed, deployed, migrated, or configured in production**. No real email has been sent and no administrator account has been created or activated.

## Security state machine

| Stage | Result | Access to `/admin/*` |
|---|---|---|
| Registration submitted | Supabase creates an Auth user and a private `admin_access_requests` record is created. Matthew is notified through the dedicated transactional notification path. | Denied |
| Email awaiting confirmation | Supabase sends its own confirmation email. | Denied |
| Email confirmed | The request appears as **Confirmed** in the protected staff screen. | Denied |
| Active Administrator approves as `editor` or `admin` | A single server-side database transaction verifies the email, upserts an active `article_admin_profiles` row, and records the reviewer/decision. | Granted for the assigned role |
| Active Administrator declines | The request is permanently marked **Declined** with an optional internal note. | Denied |

> **Verification is not authorisation.** A confirmed email has no PRO admin permissions until an active Administrator explicitly approves the request and chooses the role.

## Production prerequisites

| System | Required configuration | Notes |
|---|---|---|
| Supabase database | Apply `supabase/migrations/20260827203000_admin_access_requests.sql` in the Supabase SQL Editor. | The migration creates the private request table and two service-only, security-definer approval RPCs. It must be applied before the new code is deployed. |
| Supabase Auth | Keep **Confirm email** enabled. | This causes the applicant verification email/link to be issued by Supabase Auth rather than by the application. |
| Supabase Auth URL Configuration | Set Site URL to `https://www.jimmycoco.pro`; allow the exact additional redirect URL `https://www.jimmycoco.pro/admin/register`. | The route sends a fixed `emailRedirectTo` value. Per Supabase guidance, use an exact production redirect URL rather than a broad wildcard.[^supabase-redirects] |
| Supabase confirmation email template | Ensure the “Confirm signup” template uses `{{ .ConfirmationURL }}`. If the template manually builds its URL with `{{ .RedirectTo }}`, preserve the supplied redirect parameter. | Do not enable link tracking on this operational verification message, as rewritten links can invalidate confirmation behaviour.[^supabase-templates] |
| PRO Vercel environment | Confirm `SUPABASE_URL`, a Supabase publishable key, `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`), and `RESEND_API_KEY` are present in the PRO project. `RESEND_FROM` and `RESEND_REPLY_TO` are optional overrides. | The service credential is required only on the server to record/review requests; it is never sent to the browser. Resend is used only to notify `matthew@jimmycoco.pro`. |

[^supabase-redirects]: [Supabase, “Redirect URLs”](https://supabase.com/docs/guides/auth/redirect-urls).
[^supabase-templates]: [Supabase, “Email Templates”](https://supabase.com/docs/guides/auth/auth-email-templates).

## Included implementation

| Area | Files |
|---|---|
| Public registration | `pro-site/app/routes/admin.register.tsx`, `pro-site/app/routes/admin.login.tsx`, `pro-site/app/routes.ts` |
| Protected review and navigation | `pro-site/app/routes/admin.access-requests.tsx`, `pro-site/app/routes/admin.layout.tsx`, `pro-site/app/styles/admin.css` |
| Internal transactional notice | `pro-site/app/lib/admin-access-notification.server.ts` |
| Private database model and atomic approval | `supabase/migrations/20260827203000_admin_access_requests.sql` |
| Automated safeguards | `test/admin-access-registration.test.ts` |

## Validation completed locally

| Command | Outcome |
|---|---|
| `pnpm --dir pro-site typecheck` | Passed |
| `pnpm --dir pro-site build` | Passed |
| Focused registration safeguard test | Passed: 6 of 6 tests |
| Full repository test suite: `npm test` | Passed: 80 of 80 tests |
| `git diff --check` | Passed: no whitespace errors |

## Manual acceptance test after approved release

1. Visit `https://www.jimmycoco.pro/admin/register` and submit a unique work email with a strong password.
2. Confirm the applicant receives the Supabase confirmation email and that Matthew receives exactly one transactional notification.
3. Confirm the applicant cannot sign in to `/admin/*` before approval, both before and after email confirmation.
4. Sign in as an active PRO Administrator and open **Access requests**. Confirm the request shows as pending, then confirmed after email verification.
5. Confirm the disabled Approve control cannot be used before email confirmation.
6. Select **Editor**, approve, and confirm the applicant can sign in but does not see the Access requests navigation item.
7. Repeat with a second account assigned **Admin**, confirming it gains access to the Access requests screen.
8. Submit and decline a third request, confirming that account remains locked out.

## Explicit approval required next

Before any of the following, provide fresh approval: applying the SQL migration, changing Supabase Auth URL/template settings, committing/pushing the worktree, deploying to Vercel, or conducting a controlled real email/registration test.
