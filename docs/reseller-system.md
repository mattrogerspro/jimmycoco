# Reseller system — setup and operation

Trade applications, approval, a stockist portal and order requests, wired to the
existing Supabase project and the Resend campaign engine.

## What was added

**Database** — `supabase/migrations/20260807120000_reseller_accounts.sql`

| Table | Purpose |
| --- | --- |
| `reseller_applications` | Public trade applications from the pro-site forms |
| `resellers` | Approved accounts: account code, pricing tier, discount, status |
| `reseller_products` | Trade catalogue (seeded with the litre, mitt, soufflé and kit) |
| `reseller_orders` | Order requests, totals recalculated by trigger |
| `reseller_order_items` | Order lines, priced at approval-time trade price |

Functions: `public.submit_reseller_application(...)` (security definer, callable by
anonymous visitors, with a three-per-hour-per-email flood guard),
`public.claim_reseller_account()` (binds a signed-in auth user to their approved
row), plus `private.is_reseller_staff()` and `private.current_reseller_id()` used
by the RLS policies.

**Pro-site routes**

- `/portal/login`, `/portal/register`, `/portal/logout`
- `/portal` — account, trade pricing, recent orders
- `/portal/order` — quantity-based order request
- `/admin/resellers` — pending applications with approve / hold / decline, approved
  accounts, and the order queue

**Server modules** — `app/lib/resellers.server.ts`, `reseller-auth.server.ts`,
`reseller-events.server.ts`, `application-action.server.ts`.

**Campaign registry** — `uk-reseller-lifecycle` in `shared/campaign-registry.js`
with four triggered steps. It ships `enabled: false` with `templateId: null`, so
nothing can send until templates are built and the campaign is explicitly released.

## Environment variables

Already required by the pro-site:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

New, for the lifecycle emails (optional — without them events are logged and skipped):

- `AUTOMATION_API_BASE_URL` — origin serving `/api/lifecycle/trigger`
- `AUTOMATION_API_KEY` — must match the automation project's `AUTOMATION_API_KEY`
- `RESELLER_NOTICE_EMAIL` — internal notification address, defaults to `pro@jimmycoco.co.uk`

## Sending domain

Outbound mail sends from `email.jimmycoco.pro` (Resend, eu-west-1). The address is
env-driven — `RESEND_FROM`, `RESEND_REPLY_TO` and `EMAIL_SUPPORT_EMAIL` — with
`partnerships@email.jimmycoco.pro` only as a code fallback. The domain must be added
and verified in Resend, and its SPF/DKIM/DMARC records published in DNS, before
`EMAIL_LIVE_MODE` is switched on.

## Deploying

```bash
supabase db push                 # applies the reseller migration
cd pro-site
npm run typecheck && npm run build
```

Supabase Auth must allow email/password sign-up (Authentication → Providers → Email).
Leaving "Confirm email" on is recommended: the register page handles the
confirm-then-sign-in path.

## Day-to-day flow

1. A salon submits the trade form on the home or product page. It lands in
   `reseller_applications` with status `pending`.
2. Two lifecycle events fire: `reseller_application_received` (to the applicant) and
   `reseller_application_internal_notice` (to `RESELLER_NOTICE_EMAIL`).
3. Staff review at `/admin/resellers`. **Approve** creates the `resellers` row with a
   generated account code and fires `reseller_approved`. **Decline** fires
   `reseller_declined`. **Hold** changes status only and sends nothing.
4. The approved contact sets a password at `/portal/register` using the email address
   on the account, which binds their auth user to the account.
5. In the portal they see their trade pricing and can submit order requests. Orders
   appear in the admin order queue. Nothing is charged — you confirm and invoice.

## Before the emails can actually send

The plumbing is complete but deliberately inert. To go live you need to, in order:

1. Build the four Resend templates and record their ids in the registry steps.
2. Set `enabled: true` on `uk-reseller-lifecycle` in `shared/campaign-registry.js`.
3. Enable the matching row in `email_campaigns`.
4. Set `EMAIL_LIVE_MODE`.

Each of those is a separate, explicit release decision.

## Security model

- Anonymous visitors hold no table privileges. They reach the applications table only
  through the definer function, which validates and rate-limits.
- A reseller can read their own `resellers` row, their own orders and order lines, and
  the active catalogue. They cannot see applications or any other reseller.
- Staff (an active `article_admin_profiles` row) can read and manage everything.
- Order totals are recalculated server-side by trigger, so a tampered form cannot
  change what an order is worth.
- `/portal/` is disallowed in `robots.txt` and every portal response sends
  `private, no-store` plus `noindex`.

Verified against PostgreSQL 16 with the RLS policies enabled: anonymous read blocked,
cross-tenant reads return zero rows, account claiming rejects non-matching emails, and
the order total trigger produces the correct subtotal.
