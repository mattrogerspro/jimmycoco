import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migration = readFileSync(
  new URL('../supabase/migrations/20260824084444_safe_audience_import.sql', import.meta.url),
  'utf8',
)

test('audience import migration is audited, RLS protected and service-role only', () => {
  assert.match(migration, /create table if not exists public\.email_audience_imports/)
  assert.match(migration, /create table if not exists public\.email_audience_import_rows/)
  assert.match(migration, /alter table public\.email_audience_imports enable row level security/)
  assert.match(migration, /alter table public\.email_audience_import_rows enable row level security/)
  assert.match(migration, /revoke all on function public\.preview_email_audience_state\(text, text\[\]\) from public, anon, authenticated/)
  assert.match(migration, /revoke all on function public\.commit_email_audience_import\(text, timestamptz, jsonb, text, text, text, text\) from public, anon, authenticated/)
  assert.match(migration, /grant execute on function public\.commit_email_audience_import[\s\S]+to service_role/)
})

test('commit function applies write-time eligibility and idempotency gates', () => {
  assert.match(migration, /eligibility_decision/)
  assert.match(migration, /eligibility_reason/)
  assert.match(migration, /lawful_basis/)
  assert.match(migration, /uk_individual_subscriber_at_commit/)
  assert.match(migration, /existing_customer_at_commit/)
  assert.match(migration, /existing_trial_applicant_at_commit/)
  assert.match(migration, /suppressed_at_commit/)
  assert.match(migration, /pg_advisory_xact_lock/)
  assert.match(migration, /on conflict \(campaign_id, contact_id\)[\s\S]+where status in \('active', 'paused', 'needs_attention'\)/)
  assert.match(migration, /idempotent_replay/)
  assert.doesNotMatch(migration, /enroll_email_contact\s*\(/)
})
