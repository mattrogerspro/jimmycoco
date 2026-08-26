import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { campaignRegistry } from '../shared/campaign-registry.js'
import { trackingForCampaign } from '../api/campaigns/stats.js'

const migration = readFileSync(
  new URL('../supabase/migrations/20260824072033_production_uk_us_outreach_campaigns.sql', import.meta.url),
  'utf8',
)

const productionCampaignIds = [
  'uk-salon-stockist',
  'us-west-coast-salon-stockist',
]

function migrationSteps(campaignId) {
  const rowPattern = /\(\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*null,\s*'([^']+)',\s*(null|'([^']+)')/g
  return [...migration.matchAll(rowPattern)]
    .filter((match) => match[1] === campaignId)
    .map((match) => ({
      key: match[2],
      number: Number(match[3]),
      day: Number(match[4]),
      templateAlias: match[5],
      templateId: match[7] || null,
    }))
}

test('production outreach migration retains disabled database defaults while the approved UK registry gate is open', () => {
  for (const campaignId of productionCampaignIds) {
    const campaign = campaignRegistry.find((item) => item.id === campaignId)
    assert.ok(campaign)
    assert.equal(campaign.enabled, campaignId === 'uk-salon-stockist')
    assert.deepEqual(migrationSteps(campaignId), campaign.steps.map((step) => ({
      key: step.key,
      number: step.number,
      day: step.day,
      templateAlias: step.templateAlias,
      templateId: step.templateId,
    })))
  }

  assert.match(migration, /enabled = false/)
  assert.match(migration, /security_invoker = true/)
  assert.match(migration, /"reporting":\{"delivered":true,"opens":true,"clicks":true\}/)
  assert.doesNotMatch(migration, /\('uk-salon-stockist',\s*'pilot'/)
})

test('campaign reporting flags override disabled environment fallbacks', () => {
  assert.deepEqual(trackingForCampaign({
    reporting: { delivered: true, opens: true, clicks: true },
  }, {
    EMAIL_OPEN_TRACKING_ENABLED: 'false',
    EMAIL_CLICK_TRACKING_ENABLED: 'false',
  }), {
    delivered: true,
    opens: true,
    clicks: true,
  })
})
