import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { campaignSendAt, sequenceStepSendAt } from '../server/_lib/time.js'

const anchorMigration = readFileSync(
  new URL('../supabase/migrations/20260829192500_anchor_email_sequences_to_first_send.sql', import.meta.url),
  'utf8',
)

test('sequence follow-ups are never scheduled before the full day offset from actual first send', () => {
  const firstSentAt = '2026-08-27T12:00:00.000Z'
  const legacyLocalSchedule = campaignSendAt(firstSentAt, 3, 'Europe/London', 10)
  const anchoredSchedule = sequenceStepSendAt(firstSentAt, 3, 'Europe/London', 10)

  assert.equal(legacyLocalSchedule.toISOString(), '2026-08-30T09:00:00.000Z')
  assert.equal(anchoredSchedule.toISOString(), '2026-08-30T12:00:00.000Z')
  assert.ok(anchoredSchedule.getTime() >= new Date(firstSentAt).getTime() + 3 * 24 * 60 * 60 * 1000)
})

test('sequence follow-ups keep the preferred local send hour when it does not compress timing', () => {
  const firstSentAt = '2026-08-27T09:00:00.000Z'
  const anchoredSchedule = sequenceStepSendAt(firstSentAt, 3, 'Europe/London', 10)

  assert.equal(anchoredSchedule.toISOString(), '2026-08-30T09:00:00.000Z')
})

test('sequence worker uses actual send anchor rather than enrollment time', () => {
  const source = readFileSync(new URL('../server/_lib/engine.js', import.meta.url), 'utf8')

  assert.match(source, /sequence_started_at/)
  assert.match(source, /sequenceStepSendAt\(sequenceStartedAt, nextStep\.day/)
  assert.doesNotMatch(source, /campaignSendAt\(row\.enrolled_at,\s*nextStep\.day/)
})

test('sequence anchor migration backfills first-send anchors and prioritises new cohorts', () => {
  assert.match(anchorMigration, /add column if not exists sequence_started_at timestamptz/)
  assert.match(anchorMigration, /min\(sent_at\) filter \(where step_number = 1 and sent_at is not null\)/)
  assert.match(anchorMigration, /sequence_started_at \+ \(step\.day_offset \* interval '1 day'\)/)
  assert.match(anchorMigration, /case when e\.next_step = 1 then 0 else 1 end/)
})
