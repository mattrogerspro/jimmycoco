import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dailySendCapDeferralAt, dailySendCapFor } from '../api/_lib/engine.js'
import { campaignRegistry } from '../shared/campaign-registry.js'

const engineSource = readFileSync(new URL('../api/_lib/engine.js', import.meta.url), 'utf8')

test('approved UK stockist sequence has a fixed 100-per-day delivery cap', () => {
  const ukCampaign = campaignRegistry.find((campaign) => campaign.id === 'uk-salon-stockist')
  const usCampaign = campaignRegistry.find((campaign) => campaign.id === 'us-west-coast-salon-stockist')

  assert.equal(dailySendCapFor(ukCampaign), 100)
  assert.equal(dailySendCapFor(usCampaign), null)
  assert.equal(dailySendCapFor({ dailySendCap: 0 }), null)
  assert.equal(dailySendCapFor({ dailySendCap: 'invalid' }), null)
})

test('daily-cap deferral waits a full 24 hours plus a one-minute safety margin', () => {
  const now = new Date('2026-08-26T10:15:00.000Z')
  assert.equal(dailySendCapDeferralAt(now), '2026-08-27T10:16:00.000Z')
})

test('daily cap is checked before a UK claimed enrolment is reserved with the provider', () => {
  assert.match(engineSource, /from\('email_messages'\)[\s\S]+\.gte\('sent_at', since\)[\s\S]+\.limit\(cap\)/)
  assert.match(engineSource, /deferEnrollmentForDailySendCap\(row, campaign\)/)
  assert.match(engineSource, /status: 'deferred_daily_send_cap'/)
  assert.match(engineSource, /next_send_at: nextSendAt/)
})
