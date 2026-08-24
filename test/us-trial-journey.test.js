import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildCampaignTrialUrl,
  classifyUsTrialServiceability,
  isUsTrialAttribution,
  parseTrialAttribution,
} from '../shared/trial-journey.js'

const actionSource = readFileSync(new URL('../pro-site/app/lib/application-action.server.ts', import.meta.url), 'utf8')
const formSource = readFileSync(new URL('../pro-site/app/components/home/HomeSections.tsx', import.meta.url), 'utf8')
const exitMigration = readFileSync(new URL('../supabase/migrations/20260824092015_wire_email_exit_conditions.sql', import.meta.url), 'utf8')

test('US outreach CTA carries validated campaign, email and market attribution', () => {
  const url = new URL(buildCampaignTrialUrl(
    'https://www.jimmycoco.pro/#trial',
    'us-west-coast-salon-stockist',
    '03-retail',
  ))
  assert.equal(url.hash, '#trial')
  assert.equal(url.searchParams.get('outreach_campaign'), 'us-west-coast-salon-stockist')
  assert.equal(url.searchParams.get('outreach_step'), '03-retail')
  assert.equal(url.searchParams.get('outreach_market'), 'US-West-Coast')

  url.searchParams.set('outreach_market', 'UK')
  const attribution = parseTrialAttribution(url.searchParams)
  assert.equal(attribution.market, 'US-West-Coast')
  assert.equal(isUsTrialAttribution(attribution), true)
})

test('US serviceability is explicit and never implies nationwide fulfilment', () => {
  assert.deepEqual(classifyUsTrialServiceability('ca'), { state: 'CA', status: 'eligible_area' })
  assert.deepEqual(classifyUsTrialServiceability('OR'), { state: 'OR', status: 'eligible_area' })
  assert.deepEqual(classifyUsTrialServiceability('NY'), { state: 'NY', status: 'outside_current_area' })
  assert.deepEqual(classifyUsTrialServiceability(''), { state: '', status: 'review_required' })
})

test('trial submission records attribution and US fulfilment decision', () => {
  assert.match(actionSource, /market = isUsJourney \? "US-West-Coast" : "UK"/)
  assert.match(actionSource, /origin_campaign: attribution\?\.campaignId/)
  assert.match(actionSource, /origin_email: attribution\?\.emailStep/)
  assert.match(actionSource, /serviceability_status: usServiceability\?\.status/)
  assert.match(formSource, /REQUEST U\.S\. PROFESSIONAL TRIAL REVIEW/)
  assert.match(formSource, /U\.S\. fulfilment confirmed individually/)
  assert.match(formSource, /outside our current California, Oregon and Washington trial area/)
})

test('successful trial application exits outreach and preserves its source in the audit event', () => {
  assert.match(exitMigration, /reseller_applications_exit_email_outreach/)
  assert.match(exitMigration, /'trial_requested'/)
  assert.match(exitMigration, /'origin_campaign', new\.metadata ->> 'origin_campaign'/)
  assert.match(exitMigration, /'origin_email', new\.metadata ->> 'origin_email'/)
  assert.match(exitMigration, /perform public\.exit_email_contact_outreach/)
})
