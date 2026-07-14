import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCampaignMessageState } from '../src/lib/campaign-message-state.js'

test('event campaign steps are triggered without becoming supplemental', () => {
  const registryCampaign = {
    mode: 'event',
    steps: [
      { trigger: 'sample_dispatched', delayDays: 4, templateAlias: 'sample-check-in' },
      { trigger: 'setup_call_completed', delayDays: 0, templateAlias: 'terms-summary' },
    ],
  }

  const state = resolveCampaignMessageState({
    campaignMode: 'event',
    index: 0,
    output: 'emails/1-sample-check-in.html',
    registryCampaign,
  })

  assert.equal(state.isTriggered, true)
  assert.equal(state.isSupplemental, false)
  assert.equal(state.registryStep.trigger, 'sample_dispatched')
})

test('triggered steps appended to a scheduled sequence remain supplemental', () => {
  const registryCampaign = {
    steps: [{ day: 0, templateAlias: 'opener' }],
    triggeredSteps: [{ trigger: 'sample_requested', delayDays: 0, templateAlias: 'welcome' }],
  }

  const state = resolveCampaignMessageState({
    campaignMode: 'sequence',
    index: 1,
    output: 'emails/welcome.html',
    registryCampaign,
  })

  assert.equal(state.isTriggered, true)
  assert.equal(state.isSupplemental, true)
  assert.equal(state.registryStep.templateAlias, 'welcome')
})

test('ordinary scheduled steps are neither triggered nor supplemental', () => {
  const state = resolveCampaignMessageState({
    campaignMode: 'sequence',
    index: 0,
    output: 'emails/opener.html',
    registryCampaign: { steps: [{ day: 0, templateAlias: 'opener' }] },
  })

  assert.equal(state.isTriggered, false)
  assert.equal(state.isSupplemental, false)
})
