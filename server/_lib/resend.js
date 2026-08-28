import { Resend } from 'resend'
import { renderRuntimeTemplate } from '../../email/runtime-templates.js'
import { buildCampaignTrialUrl } from '../../shared/trial-journey.js'
import { buildPreferencesUrl } from './preferences.js'

let client

export function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('resend_api_key_not_configured')
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export function isLiveMode() {
  return process.env.EMAIL_LIVE_MODE === 'true'
}

function trialLinkFor(campaign, step) {
  const baseUrl = campaign?.id === 'us-west-coast-salon-stockist'
    ? process.env.EMAIL_US_TRIAL_LINK || process.env.EMAIL_TRIAL_LINK
    : process.env.EMAIL_TRIAL_LINK
  if (!baseUrl || !campaign?.id || !step?.key) return baseUrl
  if (!['uk-salon-stockist', 'us-west-coast-salon-stockist'].includes(campaign.id)) return baseUrl
  return buildCampaignTrialUrl(baseUrl, campaign.id, step.key)
}

function variableDefaults(contact, campaign, step) {
  return {
    SENDER_NAME: process.env.EMAIL_SENDER_NAME || 'Matt',
    SENDER_TITLE: process.env.EMAIL_SENDER_TITLE || 'Partnerships, Sunless by Jimmy Coco',
    SENDER_EMAIL: process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.pro',
    SUPPORT_EMAIL: process.env.EMAIL_SUPPORT_EMAIL || process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.pro',
    BUSINESS_ADDRESS: process.env.EMAIL_BUSINESS_ADDRESS,
    CALENDAR_LINK: process.env.EMAIL_CALENDAR_LINK,
    CALCULATOR_LINK: process.env.EMAIL_CALCULATOR_LINK || 'https://www.jimmycoco.pro/tools/spray-tan-profit-calculator',
    TRIAL_LINK: trialLinkFor(campaign, step),
    TRADE_LINK: process.env.EMAIL_TRADE_LINK,
    SHADE_GUIDE_LINK: process.env.EMAIL_SHADE_GUIDE_LINK,
    ORDER_LINK: process.env.EMAIL_ORDER_LINK,
    UAE_DELIVERY_STATEMENT: process.env.EMAIL_UAE_DELIVERY_STATEMENT,
    UAE_PARTNER_TERMS: process.env.EMAIL_UAE_PARTNER_TERMS,
  }
}

const BLOCKED_LEGACY_DOMAIN = '@jimmycoco.co.uk'

function auditCopyRecipients(primaryEmail) {
  const raw = process.env.EMAIL_AUDIT_COPY || ''
  return raw.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email, index, all) => email && email !== primaryEmail.toLowerCase() && !email.endsWith(BLOCKED_LEGACY_DOMAIN) && all.indexOf(email) === index)
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function buildTemplateVariables(step, contact, context = {}, campaign = null) {
  const upperContext = Object.fromEntries(Object.entries(context).map(([key, value]) => [key.toUpperCase(), value]))
  const candidates = {
    ...variableDefaults(contact, campaign, step),
    ...upperContext,
    GREETING_NAME: upperContext.GREETING_NAME || String(contact.first_name || '').trim() || 'there',
    FIRST_NAME: upperContext.FIRST_NAME || String(contact.first_name || '').trim() || 'there',
    SALON_NAME: upperContext.SALON_NAME || contact.business_name,
    BUSINESS_NAME: upperContext.BUSINESS_NAME || contact.business_name,
  }
  if (step.requiredVariables.includes('PREFERENCES_LINK')) candidates.PREFERENCES_LINK = buildPreferencesUrl(contact.email)
  const missing = step.requiredVariables.filter((key) => candidates[key] === undefined || candidates[key] === null || candidates[key] === '')
  if (missing.length) throw new Error(`missing_template_variables:${missing.join(',')}`)
  const variables = Object.fromEntries(step.requiredVariables.map((key) => [key, String(candidates[key])]))
  for (const [key, value] of Object.entries(variables)) {
    if (/\{\{\{?\s*[\w.]+\s*\}\}\}?/.test(value)) throw new Error(`unresolved_template_variable_value:${key}`)
  }
  return variables
}

function renderTokens(value, variables, { html = false } = {}) {
  const legacyAliases = {
    unsubscribe_link: 'PREFERENCES_LINK',
    resend_unsubscribe_url: 'PREFERENCES_LINK',
  }
  return String(value).replace(/\{\{\{?\s*([\w.]+)\s*\}\}\}?/g, (token, sourceKey) => {
    const key = legacyAliases[sourceKey.toLowerCase()] || sourceKey.replaceAll('.', '_').toUpperCase()
    if (!Object.hasOwn(variables, key)) return token
    return html ? escapeHtml(variables[key]) : variables[key]
  })
}

export function assertNoUnresolvedTokens(value, field = 'email') {
  const unresolved = [...String(value).matchAll(/\{\{\{?\s*([\w.]+)\s*\}\}\}?/g)].map((match) => match[1])
  if (unresolved.length) throw new Error(`unresolved_template_tokens:${field}:${[...new Set(unresolved)].join(',')}`)
}

export function buildDirectEmailPayload({ campaign, step, contact, context, tags = [] }) {
  const variables = buildTemplateVariables(step, contact, context, campaign)
  const classification = step.classification || campaign.classification
  const marketing = classification === 'promotional' || classification === 'lifecycle'
  const preferencesLink = marketing ? variables.PREFERENCES_LINK || buildPreferencesUrl(contact.email) : null
  const renderVariables = preferencesLink ? { ...variables, PREFERENCES_LINK: preferencesLink } : variables
  const source = renderRuntimeTemplate(step.templateAlias)
  const subject = renderTokens(source.subject, renderVariables)
  const html = renderTokens(source.html, renderVariables, { html: true })
  assertNoUnresolvedTokens(subject, 'subject')
  assertNoUnresolvedTokens(html, 'html')
  const auditRecipients = auditCopyRecipients(contact.email)
  const payload = {
    from: process.env.RESEND_FROM || 'Sunless Partnerships <partnerships@email.jimmycoco.pro>',
    to: [contact.email],
    ...(auditRecipients.length ? { bcc: auditRecipients } : {}),
    replyTo: process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.pro',
    subject,
    html,
    tags: [
      { name: 'campaign_id', value: campaign.id },
      { name: 'sequence_step', value: step.key },
      { name: 'market', value: campaign.market.toLowerCase() },
      ...tags,
    ],
  }
  if (preferencesLink) {
    payload.headers = {
      'List-Unsubscribe': `<${preferencesLink}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    }
  }
  return payload
}

function buildLegacyTemplatePayload({ campaign, step, contact, context, tags = [] }) {
  const variables = Object.fromEntries(
    Object.entries(buildTemplateVariables(step, contact, context, campaign)).map(([key, value]) => [key, escapeHtml(value)]),
  )
  const auditRecipients = auditCopyRecipients(contact.email)
  return {
    from: process.env.RESEND_FROM || 'Sunless Partnerships <partnerships@email.jimmycoco.pro>',
    to: [contact.email],
    ...(auditRecipients.length ? { bcc: auditRecipients } : {}),
    replyTo: process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.pro',
    template: { id: step.templateId, variables },
    tags: [
      { name: 'campaign_id', value: campaign.id },
      { name: 'sequence_step', value: step.key },
      { name: 'market', value: campaign.market.toLowerCase() },
      ...tags,
    ],
  }
}

export async function sendCampaignEmail({ campaign, step, contact, context, idempotencyKey, tags = [] }) {
  if (!isLiveMode()) throw new Error('email_live_mode_disabled')
  const resend = getResend()
  const payload = step.templateId
    ? buildLegacyTemplatePayload({ campaign, step, contact, context, tags })
    : buildDirectEmailPayload({ campaign, step, contact, context, tags })
  const result = await resend.emails.send(payload, { idempotencyKey })
  if (result.error) throw new Error(`resend_send_failed:${result.error.message}`)
  return result.data
}

export async function syncResendContact(contact) {
  const resend = getResend()
  const existing = await resend.contacts.get({ email: contact.email })
  const payload = {
    email: contact.email,
    firstName: contact.first_name || undefined,
    lastName: contact.last_name || undefined,
    unsubscribed: contact.marketing_status === 'unsubscribed',
  }
  if (existing.data?.id) {
    const updated = await resend.contacts.update(payload)
    if (updated.error) throw new Error(`resend_contact_update_failed:${updated.error.message}`)
    return updated.data
  }
  const created = await resend.contacts.create(payload)
  if (created.error) throw new Error(`resend_contact_create_failed:${created.error.message}`)
  return created.data
}

export function verifyResendWebhook(payload, headers) {
  if (!process.env.RESEND_WEBHOOK_SECRET) throw new Error('resend_webhook_secret_not_configured')
  return getResend().webhooks.verify({ payload, headers, webhookSecret: process.env.RESEND_WEBHOOK_SECRET })
}
