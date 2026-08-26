import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migration = readFileSync(
  new URL('../supabase/migrations/20260825173500_optimize_audience_import_commit.sql', import.meta.url),
  'utf8',
)

test('optimized audience import uses portable functional indexes for lowercase email lookups', () => {
  assert.match(migration, /email_contacts_email_lower/)
  assert.match(migration, /resellers_email_lower/)
  assert.match(migration, /reseller_applications_email_lower_trial/)
  assert.match(migration, /email_suppressions_email_lower_scope/)
  assert.match(migration, /lower\(reseller\.email::text\) = requested\.email/)
  assert.match(migration, /lower\(application\.email::text\) = requested\.email/)
  assert.match(migration, /lower\(contact\.email::text\) = requested\.email/)
  assert.doesNotMatch(migration, /::citext/)
})

test('optimized audience import evaluates write-time eligibility and writes contacts in sets', () => {
  assert.match(migration, /jsonb_to_recordset\(p_rows\)/)
  assert.match(migration, /create temporary table audience_import_stage/)
  assert.match(migration, /with candidates as/)
  assert.match(migration, /with upserted_contacts as/)
  assert.match(migration, /with inserted_enrollments as/)
  assert.match(migration, /stage\.source_date !~ '\^\[0-9\]\{4\}-\[0-9\]\{2\}-\[0-9\]\{2\}\$'/)
  assert.doesNotMatch(migration, /\\\\d\{4\}/)
  assert.match(migration, /pg_advisory_xact_lock/)
  assert.match(migration, /idempotent_replay/)
  assert.match(migration, /on conflict \(campaign_id, contact_id\)[\s\S]+where status in \('active', 'paused', 'needs_attention'\)/)
})
