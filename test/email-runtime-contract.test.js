import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDirectEmailPayload, buildTemplateVariables } from '../api/_lib/resend.js'
import { buildPreferencesUrl, createPreferencesToken, unsubscribeMarketingContact, verifyPreferencesToken } from '../api/_lib/preferences.js'
import { campaignRegistry } from '../shared/campaign-registry.js'

const signingSecret = 'test-only-signing-secret-with-at-least-32-characters'
const productionCampaignIds = new Set(['uk-salon-stockist', 'us-west-coast-salon-stockist'])

function withEmailEnvironment(callback) {
  const previous = {
    EMAIL_PREFERENCES_SIGNING_SECRET: process.env.EMAIL_PREFERENCES_SIGNING_SECRET,
    EMAIL_PREFERENCES_BASE_URL: process.env.EMAIL_PREFERENCES_BASE_URL,
    EMAIL_TRIAL_LINK: process.env.EMAIL_TRIAL_LINK,
    RESEND_REPLY_TO: process.env.RESEND_REPLY_TO,
    EMAIL_AUDIT_COPY: process.env.EMAIL_AUDIT_COPY,
  }
  process.env.EMAIL_PREFERENCES_SIGNING_SECRET = signingSecret
  process.env.EMAIL_PREFERENCES_BASE_URL = 'https://jimmycoco.email/api/preferences/unsubscribe'
  process.env.EMAIL_TRIAL_LINK = 'https://www.jimmycoco.pro/#trial'
  process.env.RESEND_REPLY_TO = 'partnerships@email.jimmycoco.pro'
  delete process.env.EMAIL_AUDIT_COPY
  try {
    return callback()
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

test('signed preferences tokens are normalized, verifiable and tamper evident', () => withEmailEnvironment(() => {
  const token = createPreferencesToken(' Owner@Example.COM ')
  assert.deepEqual(verifyPreferencesToken(token), { email: 'owner@example.com', scope: 'marketing' })
  assert.throws(() => verifyPreferencesToken(`${token}x`), /invalid_preferences_token/)
  const url = new URL(buildPreferencesUrl('owner@example.com'))
  assert.equal(url.origin, 'https://jimmycoco.email')
  assert.deepEqual(verifyPreferencesToken(url.searchParams.get('token')), { email: 'owner@example.com', scope: 'marketing' })
}))

test('all 14 outreach steps render complete direct-send payloads from repository source', () => withEmailEnvironment(() => {
  const campaigns = campaignRegistry.filter((campaign) => productionCampaignIds.has(campaign.id))
  assert.equal(campaigns.flatMap((campaign) => campaign.steps).length, 14)

  for (const campaign of campaigns) {
    for (const step of campaign.steps) {
      const payload = buildDirectEmailPayload({
        campaign,
        step,
        contact: {
          email: 'owner@example.com',
          first_name: '',
          business_name: 'Example Salon',
        },
        context: { business_type: 'professional salon' },
      })
      assert.equal('template' in payload, false)
      assert.match(payload.html, /Hi there,/) 
      assert.equal(payload.replyTo, 'partnerships@email.jimmycoco.pro')
      assert.equal('bcc' in payload, false)
      assert.doesNotMatch(payload.html, /\{\{/)
      assert.doesNotMatch(payload.subject, /\{\{/)
      assert.match(payload.html, new RegExp(`outreach_campaign=${campaign.id}`))
      assert.match(payload.html, new RegExp(`outreach_step=${step.key}`))
      assert.match(payload.html, new RegExp(`outreach_market=${encodeURIComponent(campaign.market)}`))
      assert.match(payload.headers['List-Unsubscribe'], /^<https:\/\/jimmycoco\.email\/api\/preferences\/unsubscribe\?token=/)
      assert.equal(payload.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click')
    }
  }
}))

test('audit BCC is opt-in and never copied back to the primary recipient', () => withEmailEnvironment(() => {
  const campaign = campaignRegistry.find((item) => item.id === 'uk-salon-stockist')
  const step = campaign.steps[0]
  const contact = { email: 'owner@example.com', first_name: 'Alex', business_name: 'Example Salon' }
  const context = { business_type: 'professional salon' }

  process.env.EMAIL_AUDIT_COPY = 'audit@example.com, owner@example.com, audit@example.com'
  const payload = buildDirectEmailPayload({ campaign, step, contact, context })
  assert.deepEqual(payload.bcc, ['audit@example.com'])
}))

test('missing required variables and unresolved values abort before delivery', () => withEmailEnvironment(() => {
  const campaign = campaignRegistry.find((item) => item.id === 'uk-salon-stockist')
  const step = campaign.steps[0]
  const contact = { email: 'owner@example.com', first_name: 'Alex', business_name: 'Example Salon' }
  assert.throws(() => buildTemplateVariables(step, contact, {}), /missing_template_variables:BUSINESS_TYPE/)
  assert.throws(
    () => buildTemplateVariables(step, contact, { business_type: '{{UNKNOWN_VALUE}}' }),
    /unresolved_template_variable_value:BUSINESS_TYPE/,
  )
}))

test('signed one-click unsubscribe suppresses marketing and exits active enrollments', async () => {
  const calls = []
  const supabase = {
    from(table) {
      return {
        async upsert(value, options) {
          calls.push({ operation: 'upsert', table, value, options })
          return { data: null, error: null }
        },
        update(value) {
          return {
            async eq(field, match) {
              calls.push({ operation: 'update', table, value, field, match })
              return { data: null, error: null }
            },
          }
        },
      }
    },
    async rpc(name, args) {
      calls.push({ operation: 'rpc', name, args })
      return { data: 2, error: null }
    },
  }

  const exited = await unsubscribeMarketingContact(supabase, { email: 'Owner@Example.com' })
  assert.equal(exited, 2)
  assert.equal(calls[0].value.email, 'owner@example.com')
  assert.equal(calls[0].value.scope, 'marketing')
  assert.equal(calls[1].value.marketing_status, 'unsubscribed')
  assert.equal(calls[2].name, 'exit_email_enrollments')
  assert.equal(calls[2].args.p_reason, 'unsubscribe')
})
