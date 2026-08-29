import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { summariseReportableMessages, trackingForCampaign } from '../server/campaigns/stats.js'

const routedHandlers = [
  'auth/login',
  'auth/logout',
  'auth/session',
  'campaigns/audience-import-history',
  'campaigns/contact-activity',
  'campaigns/enroll',
  'campaigns/exit',
  'campaigns/history',
  'campaigns/import-audience',
  'campaigns/kill-switch',
  'campaigns/stats',
  'campaigns/stop',
  'health',
  'healthz',
  'lifecycle/trigger',
  'preferences/unsubscribe',
]

const dedicatedEntrypoints = [
  'api/cron/process-sequences.js',
  'api/index.js',
  'api/webhooks/resend.js',
]

function jsFilesUnder(directory) {
  const files = []
  for (const entry of readdirSync(directory)) {
    const path = `${directory}/${entry}`
    if (statSync(path).isDirectory()) files.push(...jsFilesUnder(path))
    else if (path.endsWith('.js')) files.push(path)
  }
  return files
}

test('campaign stats helpers remain exported from the shared server handler', () => {
  assert.equal(typeof summariseReportableMessages, 'function')
  assert.equal(typeof trackingForCampaign, 'function')
})

test('normal HTTP handlers are routed through the single Vercel API dispatcher', () => {
  const dispatcher = readFileSync(new URL('../api/index.js', import.meta.url), 'utf8')
  const vercelConfig = readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')

  for (const route of routedHandlers) {
    assert.match(dispatcher, new RegExp(`"${route}"`), `${route} must be listed in api/index.js`)
  }
  assert.match(vercelConfig, /"source": "\/api\/:path\*"/)
  assert.match(vercelConfig, /"destination": "\/api\/index"/)
})

test('lifecycle trigger immediately processes the due job it creates', () => {
  const trigger = readFileSync(new URL('../server/lifecycle/trigger.js', import.meta.url), 'utf8')
  assert.match(trigger, /enqueueLifecycleEvent, processLifecycleJobById/)
  assert.match(trigger, /processLifecycleJobById\(result\.job\?\.id\)/)
  assert.match(trigger, /delivery/)
})

test('deployment stays under Vercel Hobby serverless function limit', () => {
  const files = jsFilesUnder(new URL('../api', import.meta.url).pathname)
    .map((path) => path.slice(new URL('..', import.meta.url).pathname.length))
    .sort()

  assert.deepEqual(files, dedicatedEntrypoints)
  assert.ok(files.length <= 12, `expected no more than 12 serverless functions, found ${files.length}`)
})
