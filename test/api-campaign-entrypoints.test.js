import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import statsHandler, {
  summariseReportableMessages,
  trackingForCampaign,
} from '../api/campaigns/stats.js'
import serverStatsHandler from '../server/campaigns/stats.js'

const publicEntrypoints = [
  'auth/login.js',
  'auth/logout.js',
  'auth/session.js',
  'campaigns/audience-import-history.js',
  'campaigns/contact-activity.js',
  'campaigns/enroll.js',
  'campaigns/exit.js',
  'campaigns/history.js',
  'campaigns/import-audience.js',
  'campaigns/kill-switch.js',
  'campaigns/stats.js',
  'campaigns/stop.js',
  'health.js',
  'lifecycle/trigger.js',
  'preferences/unsubscribe.js',
]

test('the public campaign stats URL delegates to the moved server handler', () => {
  const entrypoint = readFileSync(new URL('../api/campaigns/stats.js', import.meta.url), 'utf8')

  assert.match(entrypoint, /server\/campaigns\/stats\.js/)
  assert.equal(statsHandler, serverStatsHandler)
  assert.equal(typeof summariseReportableMessages, 'function')
  assert.equal(typeof trackingForCampaign, 'function')
})

test('every moved HTTP handler retains a thin Vercel API entrypoint', () => {
  for (const path of publicEntrypoints) {
    const source = readFileSync(new URL(`../api/${path}`, import.meta.url), 'utf8')
    assert.match(source, /server\//, `${path} must delegate to server/`)
    assert.doesNotMatch(source, /function handler/, `${path} must not duplicate handler logic`)
  }
})
