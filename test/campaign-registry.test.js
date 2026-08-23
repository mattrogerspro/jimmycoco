import test from 'node:test'
import assert from 'node:assert/strict'
import { campaignRegistry, findStepByTemplateId } from '../shared/campaign-registry.js'
import { findRepositoryCampaignContent } from '../shared/campaign-content.generated.js'

test('campaign IDs and template IDs are unique', () => {
  const campaignIds = campaignRegistry.map((campaign) => campaign.id)
  assert.equal(new Set(campaignIds).size, campaignIds.length)
  // Steps awaiting a Resend template legitimately carry templateId: null. Uniqueness
  // applies to assigned IDs; an absent ID is not a duplicate.
  const templateIds = campaignRegistry
    .flatMap((campaign) => [...campaign.steps, ...(campaign.triggeredSteps || [])].map((step) => step.templateId))
    .filter((templateId) => templateId !== null && templateId !== undefined)
  assert.equal(new Set(templateIds).size, templateIds.length)
})

test('scheduled sequence days are strictly increasing', () => {
  for (const campaign of campaignRegistry.filter((item) => item.mode === 'sequence')) {
    const days = campaign.steps.map((step) => step.day)
    assert.deepEqual([...days].sort((a, b) => a - b), days)
    assert.equal(new Set(days).size, days.length)
  }
})

test('canonical AU and Dubai cadence is preserved', () => {
  const au = campaignRegistry.find((campaign) => campaign.id === 'au-salon-seeding')
  const dubai = campaignRegistry.find((campaign) => campaign.id === 'uae-dubai-salon-stockist')
  assert.deepEqual(au.steps.map((step) => step.day), [0, 3, 8, 13, 20])
  assert.deepEqual(dubai.steps.map((step) => step.day), [0, 4, 8, 13, 18])
})

test('manual UK trial and order follow-ups remain separately scoped and disabled', () => {
  const trial = campaignRegistry.find((campaign) => campaign.id === 'uk-pro-trial-follow-up')
  const order = campaignRegistry.find((campaign) => campaign.id === 'uk-pro-order-follow-up')

  assert.ok(trial)
  assert.ok(order)
  assert.equal(trial.enabled, false)
  assert.equal(order.enabled, false)
  assert.equal(trial.manualStart, true)
  assert.equal(order.manualStart, true)
  assert.deepEqual(trial.supersedesCampaigns, ['uk-salon-stockist'])
  assert.deepEqual(order.supersedesCampaigns, ['uk-salon-stockist'])
  assert.deepEqual(trial.steps.map((step) => step.day), [0, 5, 12, 21])
  assert.deepEqual(order.steps.map((step) => step.day), [0, 4, 11, 21])
  assert.equal(trial.steps.every((step) => typeof step.templateId === 'string' && step.templateId.length > 0), true)
  assert.equal(order.steps.every((step) => typeof step.templateId === 'string' && step.templateId.length > 0), true)
})

test('template webhook lookup returns its campaign and step', () => {
  const match = findStepByTemplateId('c3d0ff13-85cb-4670-b7cc-e303babec1c4')
  assert.equal(match.campaign.id, 'uae-dubai-salon-stockist')
  assert.equal(match.step.key, '01')
})

test('UK and US prospect campaigns use versioned repository HTML and text', () => {
  for (const campaignId of ['uk-salon-stockist', 'us-west-coast-salon-stockist']) {
    const campaign = campaignRegistry.find((item) => item.id === campaignId)
    assert.equal(campaign.deliveryMode, 'repository-html')
    for (const step of campaign.steps) {
      assert.equal(step.templateId, null)
      assert.match(step.legacyTemplateId, /^[0-9a-f-]{36}$/)
      const content = findRepositoryCampaignContent(campaign.id, step.templateAlias)
      assert.ok(content?.html)
      assert.ok(content?.text)
      assert.match(content.checksum, /^[0-9a-f]{64}$/)
    }
  }
})
