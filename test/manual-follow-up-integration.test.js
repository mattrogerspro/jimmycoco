import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { campaignRegistry } from '../shared/campaign-registry.js'

const root = new URL('../', import.meta.url)

async function source(path) {
  return readFile(new URL(path, root), 'utf8')
}

function campaign(id) {
  const result = campaignRegistry.find((item) => item.id === id)
  assert.ok(result, `expected ${id} to exist`)
  return result
}

test('manual Trial, Calculator and Order Follow-Up campaigns have a repository-rendered disabled release contract', () => {
  const trial = campaign('uk-pro-trial-follow-up')
  const calculator = campaign('uk-calculator-follow-up')
  const order = campaign('uk-pro-order-follow-up')

  for (const item of [trial, calculator, order]) {
    assert.equal(item.mode, 'sequence')
    assert.equal(item.manualStart, true)
    assert.equal(item.enabled, false)
    assert.deepEqual(item.supersedesCampaigns, ['uk-salon-stockist'])
    assert.equal(item.steps.length, 4)
    assert.equal(item.steps.every((step) => step.templateId === null), true)
    assert.equal(item.steps.every((step) => step.requiredVariables.includes('PREFERENCES_LINK')), true)
  }

  assert.deepEqual(trial.steps.map((step) => step.day), [0, 5, 12, 21])
  assert.deepEqual(calculator.steps.map((step) => step.day), [1, 4, 9, 16])
  assert.deepEqual(order.steps.map((step) => step.day), [0, 4, 11, 21])
})

test('server-only manual trigger bridge submits distinct Trial and Order enrollment payloads with bearer authentication', async () => {
  const bridge = await import('../pro-site/app/lib/manual-follow-ups.server.ts')
  const originalFetch = globalThis.fetch
  const originalBaseUrl = process.env.AUTOMATION_API_BASE_URL
  const originalKey = process.env.AUTOMATION_API_KEY
  const requests = []

  process.env.AUTOMATION_API_BASE_URL = 'https://campaigns.staging.example'
  process.env.AUTOMATION_API_KEY = 'manual-follow-up-test-key'
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init })
    return new Response(JSON.stringify({ enrollment_id: 'test-enrollment', status: 'active', next_send_at: '2026-08-20T09:00:00.000Z' }), { status: 201 })
  }

  try {
    await bridge.startManualFollowUp({
      campaignId: 'uk-pro-trial-follow-up',
      sourceType: 'application',
      sourceId: 'trial-application-123',
      owner: 'staff-456',
      contact: { email: 'matthew@jimmycoco.pro', firstName: 'Matthew', businessName: 'Jimmy Coco Test Salon', market: 'UK' },
      context: { APPLICATION_ID: 'trial-application-123', BUSINESS_TYPE: 'salon' },
    })
    await bridge.startManualFollowUp({
      campaignId: 'uk-pro-order-follow-up',
      sourceType: 'order',
      sourceId: 'order-789',
      owner: 'staff-456',
      contact: { email: 'matthew@jimmycoco.pro', firstName: 'Matthew', businessName: 'Jimmy Coco Test Salon', market: 'UK' },
      context: { ORDER_ID: 'order-789', ORDER_STATUS: 'confirmed' },
    })

    assert.equal(requests.length, 2)
    for (const request of requests) {
      assert.equal(request.url, 'https://campaigns.staging.example/api/campaigns/enroll')
      assert.equal(request.init.method, 'POST')
      assert.equal(request.init.headers.Authorization, 'Bearer manual-follow-up-test-key')
    }

    const trial = JSON.parse(requests[0].init.body)
    const order = JSON.parse(requests[1].init.body)
    assert.deepEqual(
      { campaign: trial.campaign_id, event: trial.event_id, source: trial.source_type, id: trial.source_id, market: trial.market },
      { campaign: 'uk-pro-trial-follow-up', event: 'manual-follow-up/uk-pro-trial-follow-up/application/trial-application-123', source: 'application', id: 'trial-application-123', market: 'UK' },
    )
    assert.deepEqual(
      { campaign: order.campaign_id, event: order.event_id, source: order.source_type, id: order.source_id, market: order.market },
      { campaign: 'uk-pro-order-follow-up', event: 'manual-follow-up/uk-pro-order-follow-up/order/order-789', source: 'order', id: 'order-789', market: 'UK' },
    )
    assert.equal(trial.context.GREETING_NAME, 'Matthew')
    assert.equal(order.context.ORDER_STATUS, 'confirmed')
  } finally {
    globalThis.fetch = originalFetch
    if (originalBaseUrl === undefined) delete process.env.AUTOMATION_API_BASE_URL
    else process.env.AUTOMATION_API_BASE_URL = originalBaseUrl
    if (originalKey === undefined) delete process.env.AUTOMATION_API_KEY
    else process.env.AUTOMATION_API_KEY = originalKey
  }
})

test('manual stop uses the same protected bridge and leaves no future-step scheduling decision to the UI', async () => {
  const bridge = await import('../pro-site/app/lib/manual-follow-ups.server.ts')
  const originalFetch = globalThis.fetch
  const originalBaseUrl = process.env.AUTOMATION_API_BASE_URL
  const originalKey = process.env.AUTOMATION_API_KEY
  let request

  process.env.AUTOMATION_API_BASE_URL = 'https://campaigns.staging.example'
  process.env.AUTOMATION_API_KEY = 'manual-follow-up-test-key'
  globalThis.fetch = async (url, init) => {
    request = { url: String(url), init }
    return new Response(JSON.stringify({ stopped: 1 }), { status: 200 })
  }

  try {
    const result = await bridge.stopManualFollowUp({
      campaignId: 'uk-pro-trial-follow-up',
      sourceType: 'application',
      sourceId: 'trial-application-123',
      owner: 'staff-456',
      email: 'matthew@jimmycoco.pro',
      reason: 'manual_suppression',
    })
    const body = JSON.parse(request.init.body)
    assert.equal(result.stopped, 1)
    assert.equal(request.url, 'https://campaigns.staging.example/api/campaigns/stop')
    assert.equal(request.init.headers.Authorization, 'Bearer manual-follow-up-test-key')
    assert.deepEqual(
      { campaign: body.campaign_id, event: body.event_id, source: body.source_type, id: body.source_id, reason: body.reason },
      { campaign: 'uk-pro-trial-follow-up', event: 'manual-follow-up-stop/uk-pro-trial-follow-up/application/trial-application-123', source: 'application', id: 'trial-application-123', reason: 'manual_suppression' },
    )
  } finally {
    globalThis.fetch = originalFetch
    if (originalBaseUrl === undefined) delete process.env.AUTOMATION_API_BASE_URL
    else process.env.AUTOMATION_API_BASE_URL = originalBaseUrl
    if (originalKey === undefined) delete process.env.AUTOMATION_API_KEY
    else process.env.AUTOMATION_API_KEY = originalKey
  }
})

test('Pro-admin application and order detail views mount the protected manual follow-up controls and campaign service enforces both release gates', async () => {
  const [applicationRoute, orderRoute, panel, enrollmentEndpoint, stopEndpoint] = await Promise.all([
    source('pro-site/app/routes/admin.application-detail.tsx'),
    source('pro-site/app/routes/admin.order-detail.tsx'),
    source('pro-site/app/components/admin/ManualFollowUpPanel.tsx'),
    source('server/campaigns/enroll.js'),
    source('server/campaigns/stop.js'),
  ])

  assert.match(applicationRoute, /<ManualFollowUpPanel[\s\S]*campaignId="uk-pro-trial-follow-up"/)
  assert.match(applicationRoute, /<ManualFollowUpPanel[\s\S]*campaignId="uk-calculator-follow-up"/)
  assert.match(applicationRoute, /application\.source === "pro-site-calculator-report"/)
  assert.match(applicationRoute, /startUKTrialFollowUpManually/)
  assert.match(orderRoute, /<ManualFollowUpPanel[\s\S]*campaignId="uk-pro-order-follow-up"/)
  assert.match(panel, /name="intent" value="start-follow-up"/)
  assert.match(panel, /name="intent" value="stop-follow-up"/)
  assert.match(enrollmentEndpoint, /campaign_disabled_in_registry/)
  assert.match(enrollmentEndpoint, /campaign_disabled_in_database/)
  assert.match(enrollmentEndpoint, /manual_follow_up_started/)
  assert.match(stopEndpoint, /status: 'exited'/)
  assert.match(stopEndpoint, /manual_follow_up_stopped/)
})
