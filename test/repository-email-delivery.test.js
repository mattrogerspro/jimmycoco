import test from 'node:test'
import assert from 'node:assert/strict'
import { campaignRegistry } from '../shared/campaign-registry.js'
import { prepareCampaignEmail } from '../api/_lib/resend.js'
import { createUnsubscribeUrl, verifyUnsubscribeToken } from '../api/_lib/unsubscribe.js'

const originalEnv = { ...process.env }

test.afterEach(() => {
  process.env = { ...originalEnv }
})

test('repository campaign delivery sends raw HTML and text with tracking metadata and one-click unsubscribe', () => {
  process.env.EMAIL_UNSUBSCRIBE_SECRET = 'test-only-secret-that-is-long-enough'
  process.env.EMAIL_PUBLIC_BASE_URL = 'https://www.jimmycoco.email'
  process.env.EMAIL_TRIAL_LINK = 'https://www.jimmycoco.pro/#trial'
  const campaign = campaignRegistry.find((item) => item.id === 'uk-salon-stockist')
  const step = campaign.steps[0]
  const result = prepareCampaignEmail({
    campaign,
    step,
    contact: { email: 'owner@example.com', first_name: 'Sophie', business_name: 'A & B <Studio>' },
    context: { BUSINESS_TYPE: 'salon' },
    messageId: '11111111-1111-4111-8111-111111111111',
  })

  assert.equal('template' in result.payload, false)
  assert.match(result.payload.html, /A &amp; B &lt;Studio&gt;/)
  assert.match(result.payload.text, /A & B <Studio>/)
  assert.doesNotMatch(result.payload.html, /\{\{[A-Z_]+\}\}/)
  assert.doesNotMatch(result.payload.text, /\{\{[A-Z_]+\}\}/)
  assert.match(result.payload.headers['List-Unsubscribe'], /^<https:\/\/www\.jimmycoco\.email\/api\/email\/unsubscribe\?/) 
  assert.equal(result.payload.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click')
  assert.equal(result.content.deliveryMode, 'repository-html')
  assert.match(result.content.checksum, /^[0-9a-f]{64}$/)
})

test('unsubscribe tokens are signed without putting the recipient address in the URL', () => {
  process.env.EMAIL_UNSUBSCRIBE_SECRET = 'test-only-secret-that-is-long-enough'
  process.env.EMAIL_PUBLIC_BASE_URL = 'https://www.jimmycoco.email'
  const messageId = '11111111-1111-4111-8111-111111111111'
  const url = new URL(createUnsubscribeUrl(messageId))
  assert.equal(url.searchParams.get('message'), messageId)
  assert.equal(url.searchParams.has('email'), false)
  assert.equal(verifyUnsubscribeToken(messageId, url.searchParams.get('token')), true)
  assert.equal(verifyUnsubscribeToken(messageId, 'tampered'), false)
})
