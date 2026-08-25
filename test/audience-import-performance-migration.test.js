import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migration = readFileSync(
  new URL('../supabase/migrations/20260825173500_optimize_audience_import_commit.sql', import.meta.url),
  'utf8',
)

test('optimized audience import uses indexed citext lookups instead of lower(email) scans', () => {
  assert.match(migration, /reseller\.email = requested\.email::citext/)
  assert.match(migration, /application\.email = requested\.email::citext/)
  assert.match(migration, /contact\.email = requested\.email::citext/)
  assert.doesNotMatch(migration, /lower\(reseller\.email::text\)/)
  assert.doesNotMatch(migration, /lower\(application\.email::text\)/)
  assert.doesNotMatch(migration, /lower\(contact\.email::text\)/)
})

test('optimized audience import evaluates write-time eligibility and writes contacts in sets', () => {
  assert.match(migration, /jsonb_to_recordset\(p_rows\)/)
  assert.match(migration, /create temporary table audience_import_stage/)
  assert.match(migration, /with candidates as/)
  assert.match(migration, /with upserted_contacts as/)
  assert.match(migration, /with inserted_enrollments as/)
  assert.match(migration, /pg_advisory_xact_lock/)
  assert.match(migration, /idempotent_replay/)
  assert.match(migration, /on conflict \(campaign_id, contact_id\)[\s\S]+where status in \('active', 'paused', 'needs_attention'\)/)
})
