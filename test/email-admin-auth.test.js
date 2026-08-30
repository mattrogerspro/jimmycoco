import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function source(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('jimmycoco.email has a separate super-admin access table', async () => {
  const migration = await source('supabase/migrations/20260824101219_email_admin_access.sql')

  assert.match(migration, /create table if not exists public\.email_admin_profiles/)
  assert.match(migration, /references auth\.users\(id\)/)
  assert.match(migration, /check \(role = 'super_admin'\)/)
  assert.match(migration, /alter table public\.email_admin_profiles enable row level security/)
  assert.match(migration, /revoke all on table public\.email_admin_profiles from public, anon, authenticated/)
  assert.match(migration, /grant all on table public\.email_admin_profiles to service_role/)
  assert.doesNotMatch(migration, /alter table public\.article_admin_profiles/)
})

test('email admin auth uses Supabase sign-in then requires active super-admin profile', async () => {
  const auth = await source('server/_lib/email-auth.js')
  const login = await source('server/auth/login.js')
  const session = await source('server/auth/session.js')
  const logout = await source('server/auth/logout.js')

  assert.match(auth, /signInWithPassword/)
  assert.match(auth, /\.from\('email_admin_profiles'\)/)
  assert.match(auth, /profile\.role !== 'super_admin'/)
  assert.match(auth, /EMAIL_ADMIN_SESSION_SECRET/)
  assert.match(auth, /HttpOnly/)
  assert.match(auth, /SameSite=Lax/)
  assert.match(login, /createEmailAdminCookie/)
  assert.match(session, /readEmailAdminSession/)
  assert.match(logout, /clearEmailAdminCookie/)
})

test('static email studio is protected by jimmycoco.email middleware but operational hooks stay callable', async () => {
  const middleware = await source('middleware.js')

  assert.match(middleware, /jimmycoco\\\.email/)
  assert.match(middleware, /EMAIL_ADMIN_SESSION_SECRET/)
  assert.match(middleware, /role === 'super_admin'/)
  assert.match(middleware, /Response\.redirect\(loginUrl, 302\)/)
  assert.match(middleware, /api\/auth\//)
  assert.match(middleware, /api\/cron\//)
  assert.match(middleware, /api\/health/)
  assert.match(middleware, /healthz/)
  assert.match(middleware, /api\/webhooks\//)
  assert.match(middleware, /email-assets\//)
})

test('campaign studio UI requires the email-admin session and exposes logout', async () => {
  const app = await source('src/App.jsx')
  const styles = await source('src/styles.css')

  assert.match(app, /fetch\('\/api\/auth\/session'\)/)
  assert.match(app, /function EmailAdminLogin/)
  assert.match(app, /\/api\/auth\/login/)
  assert.match(app, /\/api\/auth\/logout/)
  assert.match(app, /jimmycoco\.email/)
  assert.match(app, /Super admin/)
  assert.match(app, /aria-label="Performance scope"/)
  assert.match(app, />Full campaign<\/button>/)
  assert.match(app, />Email \{message\.index\}<\/button>/)
  assert.match(styles, /\.email-auth-screen/)
  assert.match(styles, /\.performance-scope/)
  assert.match(styles, /\.email-admin-pill/)
})

test('audience importer uses the super-admin session without a second browser token', async () => {
  const app = await source('src/App.jsx')
  const importer = await source('server/campaigns/import-audience.js')

  assert.match(importer, /requireEmailAdmin\(request, response\)/)
  assert.doesNotMatch(importer, /AUDIENCE_IMPORT_API_KEY/)
  assert.doesNotMatch(app, /Audience import admin token/)
  assert.match(app, /Or paste CSV content/)
})

test('pro-site admin role contract remains unchanged', async () => {
  const articleAuth = await source('pro-site/app/lib/article-auth.server.ts')
  const articleLogin = await source('pro-site/app/routes/admin.login.tsx')

  assert.match(articleAuth, /type ArticleRole = "admin" \| "editor"/)
  assert.match(articleAuth, /allowedRoles: readonly ArticleRole\[\] = \["admin", "editor"\]/)
  assert.match(articleLogin, /!\["admin", "editor"\]\.includes\(profile\.role\)/)
  assert.doesNotMatch(articleAuth, /super_admin/)
  assert.doesNotMatch(articleLogin, /super_admin/)
})
