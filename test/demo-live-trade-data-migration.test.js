import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migration = readFileSync(
  new URL('../supabase/migrations/20260826130000_demo_live_trade_data.sql', import.meta.url),
  'utf8',
)
const demoSeeder = readFileSync(
  new URL('../pro-site/scripts/seed-demo.mjs', import.meta.url),
  'utf8',
)
const triggerFixMigration = readFileSync(
  new URL('../supabase/migrations/20260829131350_fix_trade_data_mode_trigger_table_branches.sql', import.meta.url),
  'utf8',
)
const resellersServer = readFileSync(
  new URL('../pro-site/app/lib/resellers.server.ts', import.meta.url),
  'utf8',
)
const invoicesServer = readFileSync(
  new URL('../pro-site/app/lib/invoices.server.ts', import.meta.url),
  'utf8',
)
const dataModeAdminRoute = readFileSync(
  new URL('../pro-site/app/routes/admin.data-mode.tsx', import.meta.url),
  'utf8',
)

const parentTables = [
  'reseller_applications',
  'resellers',
  'reseller_orders',
  'invoices',
]

test('demo/live migration classifies every existing parent trade record as demo', () => {
  for (const table of parentTables) {
    assert.match(migration, new RegExp(`alter table public\\.${table} add column if not exists data_mode text`))
    assert.match(migration, new RegExp(`update public\\.${table} set data_mode = 'demo'`))
    assert.match(migration, new RegExp(`alter table public\\.${table} alter column data_mode set not null`))
  }
})

test('new standalone trade records default to live while related records inherit their parent mode', () => {
  assert.match(migration, /create_new_records_as_demo boolean not null default false/)
  assert.match(migration, /values \(true, false\)/)
  assert.match(triggerFixMigration, /new\.data_mode := case when coalesce\(create_as_demo, false\) then 'demo' else 'live' end/)
  assert.match(triggerFixMigration, /if tg_table_name = 'resellers' then[\s\S]*if new\.application_id is not null then/)
  assert.doesNotMatch(triggerFixMigration, /tg_table_name = 'resellers' and new\.application_id is not null/)
  assert.match(triggerFixMigration, /elsif tg_table_name = 'reseller_orders' then/)
  assert.match(triggerFixMigration, /elsif tg_table_name = 'invoices' then/)
  assert.match(triggerFixMigration, /new\.data_mode := inherited_mode/)
})

test('the controlled demo seeder explicitly preserves Demo classification', () => {
  assert.match(demoSeeder, /reseller_applications[\s\S]*data_mode: "demo"/)
  assert.match(demoSeeder, /const resellerRows[\s\S]*data_mode: "demo"/)
  assert.match(demoSeeder, /const orderRows[\s\S]*data_mode: "demo"/)
  assert.match(demoSeeder, /const invoiceRows[\s\S]*data_mode: "demo"/)
})

test('the future-record mode switch is staff-only and does not grant public access', () => {
  assert.match(migration, /alter table public\.trade_data_settings enable row level security/)
  assert.match(migration, /revoke all on table public\.trade_data_settings from public, anon, authenticated/)
  assert.match(migration, /create policy trade_data_settings_staff_read/)
  assert.match(migration, /create policy trade_data_settings_staff_update/)
  assert.doesNotMatch(migration, /grant .* on table public\.trade_data_settings to anon/)
})

test('admin trade reads hide demo records unless demo mode is switched on', () => {
  assert.match(resellersServer, /export type TradeDataVisibility = \{ showDemoData\?: boolean \}/)
  assert.match(resellersServer, /if \(visibility\?\.showDemoData\) return builder/)
  assert.match(resellersServer, /\.eq\("data_mode", "live"\)/)
  assert.match(invoicesServer, /applyTradeDataVisibility\(supabase\.from\("invoices"\)\.select\(LIST_COLUMNS\), visibility\)/)
  assert.match(dataModeAdminRoute, /admin pages show Live records only/)
  assert.match(dataModeAdminRoute, /include Demo records/)
})
