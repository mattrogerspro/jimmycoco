import test from 'node:test'
import assert from 'node:assert/strict'
import { campaignSendAt } from '../api/_lib/time.js'

test('Dubai cadence resolves to 10:00 local time', () => {
  const result = campaignSendAt('2026-07-14T12:00:00.000Z', 4, 'Asia/Dubai', 10)
  assert.equal(result.toISOString(), '2026-07-18T06:00:00.000Z')
})

test('Sydney cadence accounts for local timezone', () => {
  const result = campaignSendAt('2026-07-14T09:00:00.000Z', 3, 'Australia/Sydney', 10)
  assert.equal(result.toISOString(), '2026-07-17T00:00:00.000Z')
})
