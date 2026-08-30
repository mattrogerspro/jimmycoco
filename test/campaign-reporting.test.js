import test from 'node:test'
import assert from 'node:assert/strict'
import { normaliseCampaignRow, summariseReportableMessages, trackingForCampaign } from '../server/campaigns/stats.js'

test('campaign reporting summarises only the reportable rows supplied by the API', () => {
  const summary = summariseReportableMessages([
    {
      sent_at: '2026-08-24T16:00:00.000Z',
      delivered_at: '2026-08-24T16:00:01.000Z',
      first_opened_at: null,
      first_clicked_at: null,
      bounced_at: null,
      complained_at: null,
      failed_at: null,
      created_at: '2026-08-24T15:59:59.000Z',
    },
  ])

  assert.deepEqual(summary, {
    sent: 1,
    delivered: 1,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
    failed: 0,
    last_activity_at: '2026-08-24T16:00:00.000Z',
  })
})

test('campaign tracking reads reporting flags from direct campaign config fallback', () => {
  assert.deepEqual(
    trackingForCampaign(
      { config: { reporting: { delivered: true, opens: true, clicks: true } } },
      { EMAIL_OPEN_TRACKING_ENABLED: 'false', EMAIL_CLICK_TRACKING_ENABLED: 'false' },
    ),
    { delivered: true, opens: true, clicks: true },
  )
})

test('campaign reporting preserves view-only response and enrollment totals', () => {
  assert.deepEqual(
    normaliseCampaignRow({
      campaign_id: 'uk-salon-stockist',
      name: 'UK campaign',
      replies: 4,
      conversions: 2,
      active_enrollments: 25,
    }),
    {
      campaign_id: 'uk-salon-stockist',
      name: 'UK campaign',
      market: undefined,
      mode: undefined,
      enabled: false,
      reporting: null,
      config: undefined,
      updated_at: undefined,
      replies: 4,
      conversions: 2,
      active_enrollments: 25,
    },
  )
})
