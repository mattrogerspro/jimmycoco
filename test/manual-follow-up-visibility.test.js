import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const studioCatalogue = readFileSync(new URL('../src/data/content.js', import.meta.url), 'utf8')
const studioApp = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

const manualCampaignIds = [
  'uk-pro-trial-follow-up',
  'uk-calculator-follow-up',
  'uk-pro-order-follow-up',
]

test('manual Trial, Calculator and Order follow-ups are visible in Sequences without becoming active campaigns', () => {
  for (const campaignId of manualCampaignIds) {
    assert.match(studioCatalogue, new RegExp(`'${campaignId}'`))
  }

  assert.match(studioCatalogue, /export const manualDisabledCampaigns = campaigns\.filter\(\(campaign\) => campaign\.manualDisabled\)/)
  assert.match(studioApp, /\[\.\.\.activeCampaigns, \.\.\.manualDisabledCampaigns\]/)
  assert.match(studioCatalogue, /status: manualDisabled \? 'Manual — Disabled'/)
})

test('manual follow-up inspection never exposes a Studio gate control or live-performance panel', () => {
  assert.match(studioApp, /!campaign\.manualDisabled && <CampaignKillSwitch/)
  assert.match(studioApp, /This sequence is available for review only\. It cannot enrol a contact, re-enable its database gate, or send an email from Email Studio\./)
  assert.match(studioApp, /message && !campaign\.manualDisabled && <CampaignKillSwitch/)
})
