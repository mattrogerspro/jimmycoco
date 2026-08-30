import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDirectEmailPayload, buildTemplateVariables } from '../server/_lib/resend.js'
import { buildPreferencesUrl, createPreferencesToken, unsubscribeMarketingContact, verifyPreferencesToken } from '../server/_lib/preferences.js'
import { campaignRegistry } from '../shared/campaign-registry.js'

const signingSecret = 'test-only-signing-secret-with-at-least-32-characters'
const productionCampaignIds = new Set(['uk-salon-stockist', 'us-west-coast-salon-stockist'])
const manualFollowUpCampaignIds = new Set(['uk-pro-trial-follow-up', 'uk-calculator-follow-up', 'uk-pro-order-follow-up'])

function withEmailEnvironment(callback) {
  const previous = {
    EMAIL_PREFERENCES_SIGNING_SECRET: process.env.EMAIL_PREFERENCES_SIGNING_SECRET,
    EMAIL_PREFERENCES_BASE_URL: process.env.EMAIL_PREFERENCES_BASE_URL,
    EMAIL_TRIAL_LINK: process.env.EMAIL_TRIAL_LINK,
    EMAIL_US_TRIAL_LINK: process.env.EMAIL_US_TRIAL_LINK,
    EMAIL_CALCULATOR_LINK: process.env.EMAIL_CALCULATOR_LINK,
    EMAIL_TRADE_LINK: process.env.EMAIL_TRADE_LINK,
    EMAIL_ORDER_LINK: process.env.EMAIL_ORDER_LINK,
    RESEND_REPLY_TO: process.env.RESEND_REPLY_TO,
    EMAIL_AUDIT_COPY: process.env.EMAIL_AUDIT_COPY,
  }
  process.env.EMAIL_PREFERENCES_SIGNING_SECRET = signingSecret
  process.env.EMAIL_PREFERENCES_BASE_URL = 'https://jimmycoco.email/api/preferences/unsubscribe'
  process.env.EMAIL_TRIAL_LINK = 'https://www.jimmycoco.pro/#trial'
  process.env.EMAIL_US_TRIAL_LINK = 'https://www.jimmycoco.pro/#trial'
  process.env.EMAIL_CALCULATOR_LINK = 'https://www.jimmycoco.pro/tools/spray-tan-profit-calculator'
  process.env.EMAIL_TRADE_LINK = 'https://www.jimmycoco.pro/products/malibu-professional-spray-1l#complete-order'
  process.env.EMAIL_ORDER_LINK = 'https://www.jimmycoco.pro/products/malibu-professional-spray-1l#complete-order'
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

function httpLinksIn(html) {
  return [...String(html).matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)].map((match) => new URL(match[1]))
}

function assertCustomerLinksUseProSite(payload) {
  const links = httpLinksIn(payload.html)
  assert.ok(links.length > 0)
  for (const link of links) {
    if (link.hostname === 'jimmycoco.email') {
      assert.equal(link.pathname, '/api/preferences/unsubscribe')
      continue
    }
    assert.equal(link.hostname, 'www.jimmycoco.pro')
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

test('manual trial, calculator and order follow-ups render complete direct-send payloads from repository source', () => withEmailEnvironment(() => {
  const campaigns = campaignRegistry.filter((campaign) => manualFollowUpCampaignIds.has(campaign.id))
  assert.equal(campaigns.flatMap((campaign) => campaign.steps).length, 12)

  const context = {
    GREETING_NAME: 'Sophie',
    BUSINESS_NAME: 'Maison Glow',
    MONTHLY_PROFIT: '£705',
    LITRES_PER_MONTH: '1.9',
    TANS_PER_WEEK: '12',
  }

  for (const campaign of campaigns) {
    for (const step of campaign.steps) {
      const payload = buildDirectEmailPayload({
        campaign,
        step,
        contact: {
          email: 'sophie@example.com',
          first_name: 'Sophie',
          business_name: 'Maison Glow',
        },
        context,
      })
      assert.equal('template' in payload, false)
      assert.equal(payload.to[0], 'sophie@example.com')
      assert.equal(payload.replyTo, 'partnerships@email.jimmycoco.pro')
      assert.doesNotMatch(payload.html, /\{\{/)
      assert.doesNotMatch(payload.subject, /\{\{/)
      assert.match(payload.headers['List-Unsubscribe'], /^<https:\/\/jimmycoco\.email\/api\/preferences\/unsubscribe\?token=/)
      assert.equal(payload.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click')
      assertCustomerLinksUseProSite(payload)
    }
  }
}))

test('free trial submission lifecycle acknowledgements render directly from repository source', () => withEmailEnvironment(() => {
  const campaign = campaignRegistry.find((item) => item.id === 'uk-reseller-lifecycle')
  const steps = campaign.steps.filter((step) => step.enabled)
  assert.deepEqual(steps.map((step) => step.key), ['trial-request-received', 'internal-notice'])

  for (const step of steps) {
    const payload = buildDirectEmailPayload({
      campaign,
      step,
      contact: {
        email: step.key === 'internal-notice' ? 'matthew@jimmycoco.pro' : 'sophie@example.com',
        first_name: 'Sophie',
        business_name: 'Maison Glow',
      },
      context: {
        CONTACT_NAME: 'Sophie Taylor',
        CONTACT_EMAIL: 'sophie@example.com',
        SALON_NAME: 'Maison Glow',
        REQUEST_TYPE: 'Free sample request',
        BUSINESS_TYPE: 'Salon',
        SUBMISSION_SUMMARY: 'Trial request from the homepage.',
        ADMIN_LINK: 'https://www.jimmycoco.pro/admin/applications/app-123',
      },
    })
    assert.equal('template' in payload, false)
    assert.equal('headers' in payload, false)
    assert.doesNotMatch(payload.html, /\{\{/)
    assert.doesNotMatch(payload.subject, /\{\{/)
  }
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
      assertCustomerLinksUseProSite(payload)
    }
  }
}))

test('customer campaign destinations cannot be configured to the email admin or retail domains', () => withEmailEnvironment(() => {
  const campaign = campaignRegistry.find((item) => item.id === 'uk-salon-stockist')
  const step = campaign.steps[0]
  const contact = { email: 'owner@example.com', first_name: 'Alex', business_name: 'Example Salon' }
  const context = { business_type: 'professional salon' }

  process.env.EMAIL_TRIAL_LINK = 'https://jimmycoco.email/#trial'
  assert.throws(
    () => buildDirectEmailPayload({ campaign, step, contact, context }),
    /invalid_pro_site_destination:TRIAL_LINK:jimmycoco\.email/,
  )

  process.env.EMAIL_TRIAL_LINK = 'https://jimmycoco.co.uk/#trial'
  assert.throws(
    () => buildDirectEmailPayload({ campaign, step, contact, context }),
    /invalid_pro_site_destination:TRIAL_LINK:jimmycoco\.co\.uk/,
  )
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
