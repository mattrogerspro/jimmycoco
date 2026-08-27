import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { evaluatePassword } from "../pro-site/app/lib/password-policy.ts";

const articleAuthPath = new URL("../pro-site/app/lib/article-auth.server.ts", import.meta.url);
const migrationPath = new URL("../supabase/migrations/20260827203000_admin_access_requests.sql", import.meta.url);
const registrationRoutePath = new URL("../pro-site/app/routes/admin.register.tsx", import.meta.url);
const reviewRoutePath = new URL("../pro-site/app/routes/admin.access-requests.tsx", import.meta.url);
const notificationPath = new URL("../pro-site/app/lib/admin-access-notification.server.ts", import.meta.url);

test("the PRO registration page reuses the shared strong-password policy", () => {
  assert.equal(
    evaluatePassword("CorrectHorseBatteryStaple1!", { email: "member@example.com" }).isStrong,
    true,
  );
  assert.equal(evaluatePassword("Short1!a", { email: "member@example.com" }).isStrong, false);
  assert.equal(
    evaluatePassword("Example2026!Example", { email: "example@example.com" }).isStrong,
    false,
  );
});

test("admin redirects stay local and never return to an authentication page", async () => {
  const articleAuth = await readFile(articleAuthPath, "utf8");

  assert.match(articleAuth, /const isLocal = destination\.origin === "https:\/\/admin\.invalid"/);
  assert.match(articleAuth, /const isAdmin = destination\.pathname\.startsWith\("\/admin\/"\)/);
  assert.match(articleAuth, /const isAuthRoute = \["\/admin\/login", "\/admin\/logout"\]\.includes/);
  assert.match(articleAuth, /return isLocal && isAdmin && !isAuthRoute \? path : "\/admin\/articles"/);
});

test("the access-request migration makes requests service-only and validates manual approval", async () => {
  const migration = await readFile(migrationPath, "utf8");

  assert.match(migration, /alter table public\.admin_access_requests enable row level security;/);
  assert.match(migration, /revoke all on table public\.admin_access_requests from public, anon, authenticated;/);
  assert.match(migration, /grant all on table public\.admin_access_requests to service_role;/);
  assert.match(migration, /and reviewer\.is_active = true\s+and reviewer\.role = 'admin'/);
  assert.match(migration, /if v_email_confirmed_at is null then\s+raise exception 'The requester must verify their email address before approval\.'/);
  assert.match(migration, /if p_assigned_role not in \('admin', 'editor'\) then/);
  assert.match(migration, /revoke all on function public\.review_admin_access_request\(uuid, uuid, text, text, text\) from public, anon, authenticated;/);
  assert.match(migration, /grant execute on function public\.review_admin_access_request\(uuid, uuid, text, text, text\) to service_role;/);
});

test("registration records a pending request without creating an administrator profile", async () => {
  const registrationRoute = await readFile(registrationRoutePath, "utf8");

  assert.match(registrationRoute, /emailRedirectTo: absoluteUrl\("\/admin\/register"\)/);
  assert.match(registrationRoute, /record_admin_access_request/);
  assert.doesNotMatch(registrationRoute, /article_admin_profiles/);
  assert.doesNotMatch(registrationRoute, /name="assigned_role"/);
  assert.doesNotMatch(registrationRoute, /useSearchParams/);
});

test("only the protected review page can invoke a bounded approval decision", async () => {
  const reviewRoute = await readFile(reviewRoutePath, "utf8");

  assert.match(reviewRoute, /await requireArticleStaff\(request\)/);
  assert.match(reviewRoute, /context\.staff\.role !== "admin"/);
  assert.match(reviewRoute, /!\["admin", "editor"\]\.includes\(assignedRole\)/);
  assert.match(reviewRoute, /review_admin_access_request/);
  assert.match(reviewRoute, /isSameOriginPost\(request\)/);
});

test("internal registration notification uses a dedicated transactional path", async () => {
  const notifier = await readFile(notificationPath, "utf8");

  assert.match(notifier, /const INTERNAL_ACCESS_REVIEWER = "matthew@jimmycoco\.pro"/);
  assert.match(notifier, /type", value: "admin_access_request"/);
  assert.doesNotMatch(notifier, /emitResellerEvent/);
  assert.doesNotMatch(notifier, /campaign/);
});
