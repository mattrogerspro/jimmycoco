import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCampaignMessageState, sortCampaignMessages } from '../src/lib/campaign-message-state.js'

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

test('scheduled campaign messages follow registry step order rather than source-file order', () => {
  const messages = [
    { index: 1, sourceIndex: 1, day: 0, isSupplemental: false },
    { index: 2, sourceIndex: 2, day: 3, isSupplemental: false },
    { index: 3, sourceIndex: 3, day: 6, isSupplemental: false },
    { index: 4, sourceIndex: 4, day: 10, isSupplemental: false },
    { index: 7, sourceIndex: 5, day: 28, isSupplemental: false },
    { index: 5, sourceIndex: 6, day: 15, isSupplemental: false },
    { index: 6, sourceIndex: 7, day: 21, isSupplemental: false },
  ]

  const sorted = sortCampaignMessages('sequence', messages)

  assert.deepEqual(sorted.map((message) => message.index), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(sorted.map((message) => message.day), [0, 3, 6, 10, 15, 21, 28])
})

test('supplemental messages remain after scheduled messages in source order', () => {
  const messages = [
    { index: 1, sourceIndex: 1, isSupplemental: false },
    { index: 1, sourceIndex: 2, isSupplemental: true },
    { index: 2, sourceIndex: 3, isSupplemental: false },
    { index: 2, sourceIndex: 4, isSupplemental: true },
  ]

  const sorted = sortCampaignMessages('sequence', messages)

  assert.deepEqual(sorted.map((message) => message.sourceIndex), [1, 3, 2, 4])
})
