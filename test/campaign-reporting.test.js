import test from 'node:test'
import assert from 'node:assert/strict'
import { summariseReportableMessages } from '../server/campaigns/stats.js'

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
