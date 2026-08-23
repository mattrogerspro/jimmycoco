import { Resend } from 'resend'
import { findRepositoryCampaignContent } from '../../shared/campaign-content.generated.js'
import { createUnsubscribeUrl } from './unsubscribe.js'

let client

export function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('resend_api_key_not_configured')
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export function isLiveMode() {
  return process.env.EMAIL_LIVE_MODE === 'true'
}

function variableDefaults() {
  const supportEmail = process.env.EMAIL_SUPPORT_EMAIL || process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.pro'
  return {
    SENDER_NAME: process.env.EMAIL_SENDER_NAME || 'Matt',
    SENDER_TITLE: process.env.EMAIL_SENDER_TITLE || 'Partnerships, Sunless by Jimmy Coco',
    SENDER_EMAIL: process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.pro',
    SUPPORT_EMAIL: supportEmail,
    PREFERENCES_LINK: process.env.EMAIL_PREFERENCES_LINK || `mailto:${supportEmail}?subject=Remove%20my%20trade%20details`,
    BUSINESS_ADDRESS: process.env.EMAIL_BUSINESS_ADDRESS,
    CALENDAR_LINK: process.env.EMAIL_CALENDAR_LINK,
    TRIAL_LINK: process.env.EMAIL_TRIAL_LINK,
    TRADE_LINK: process.env.EMAIL_TRADE_LINK,
    SHADE_GUIDE_LINK: process.env.EMAIL_SHADE_GUIDE_LINK,
    ORDER_LINK: process.env.EMAIL_ORDER_LINK,
    UAE_DELIVERY_STATEMENT: process.env.EMAIL_UAE_DELIVERY_STATEMENT,
    UAE_PARTNER_TERMS: process.env.EMAIL_UAE_PARTNER_TERMS,
  }
}

const REQUIRED_PRO_AUDIT_RECIPIENT = 'matthew@jimmycoco.pro'
const BLOCKED_LEGACY_DOMAIN = '@jimmycoco.co.uk'

function auditCopyRecipients(primaryEmail) {
  const raw = process.env.EMAIL_AUDIT_COPY || ''
  return [REQUIRED_PRO_AUDIT_RECIPIENT, ...raw.split(',')]
    .map((email) => email.trim().toLowerCase())
    .filter((email, index, all) => email && email !== primaryEmail.toLowerCase() && !email.endsWith(BLOCKED_LEGACY_DOMAIN) && all.indexOf(email) === index)
}

function escapeTemplateValue(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function buildTemplateVariables(step, contact, context = {}, messageId = null) {
  const upperContext = Object.fromEntries(Object.entries(context).map(([key, value]) => [key.toUpperCase(), value]))
  const unsubscribeUrl = messageId ? createUnsubscribeUrl(messageId) : undefined
  const candidates = {
    ...variableDefaults(),
    ...upperContext,
    FIRST_NAME: contact.first_name || upperContext.FIRST_NAME || 'there',
    LAST_NAME: contact.last_name || upperContext.LAST_NAME || '',
    EMAIL: contact.email,
    SALON_NAME: upperContext.SALON_NAME || contact.business_name,
    BUSINESS_NAME: upperContext.BUSINESS_NAME || contact.business_name,
    BUSINESS_TYPE: upperContext.BUSINESS_TYPE || 'professional tanning business',
    RESEND_UNSUBSCRIBE_URL: unsubscribeUrl,
  }
  const missing = step.requiredVariables.filter((key) => candidates[key] === undefined || candidates[key] === null || candidates[key] === '')
  if (missing.length) throw new Error(`missing_template_variables:${missing.join(',')}`)
  if (messageId) return candidates
  return Object.fromEntries(step.requiredVariables.map((key) => [key, escapeTemplateValue(candidates[key])]))
}

function renderTokens(value, variables, escape = false) {
  return String(value || '').replace(/\{\{\{?\s*([A-Za-z0-9_.]+)\s*\}\}\}?/g, (_match, key) => {
    const resolved = variables[key.toUpperCase()]
    if (resolved === undefined || resolved === null) throw new Error(`missing_render_variable:${key.toUpperCase()}`)
    const clean = String(resolved).replace(/[\r\n]+/g, ' ')
    return escape ? escapeTemplateValue(clean) : clean
  })
}

function providerTagValue(value) {
  return String(value).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256)
}

export function prepareCampaignEmail({ campaign, step, contact, context = {}, messageId, tags = [] }) {
  const variables = buildTemplateVariables(step, contact, context, campaign.deliveryMode === 'repository-html' ? messageId : null)
  const base = {
    from: process.env.RESEND_FROM || 'Sunless Partnerships <partnerships@email.jimmycoco.pro>',
    to: [contact.email],
    bcc: auditCopyRecipients(contact.email),
    replyTo: process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.pro',
    tags: [
      { name: 'campaign_id', value: providerTagValue(campaign.id) },
      { name: 'sequence_step', value: providerTagValue(step.key) },
      { name: 'market', value: providerTagValue(campaign.market.toLowerCase()) },
      ...tags,
    ],
  }

  if (campaign.deliveryMode !== 'repository-html') {
    return { payload: { ...base, template: { id: step.templateId || step.templateAlias, variables } }, content: { deliveryMode: 'resend-template', checksum: null, subject: step.subject } }
  }

  const content = findRepositoryCampaignContent(campaign.id, step.templateAlias)
  if (!content) throw new Error(`repository_campaign_content_not_found:${campaign.id}/${step.templateAlias}`)
  const unsubscribeUrl = variables.RESEND_UNSUBSCRIBE_URL
  return {
    payload: {
      ...base,
      subject: renderTokens(content.subject, variables),
      html: renderTokens(content.html, variables, true),
      text: renderTokens(content.text, variables),
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [...base.tags, { name: 'content_hash', value: content.checksum }],
    },
    content: { deliveryMode: 'repository-html', checksum: content.checksum, htmlPath: content.htmlPath, textPath: content.textPath, subject: renderTokens(content.subject, variables) },
  }
}

export function getCampaignContentMetadata(campaign, step) {
  if (campaign.deliveryMode !== 'repository-html') return { deliveryMode: 'resend-template' }
  const content = findRepositoryCampaignContent(campaign.id, step.templateAlias)
  if (!content) throw new Error(`repository_campaign_content_not_found:${campaign.id}/${step.templateAlias}`)
  return { deliveryMode: 'repository-html', checksum: content.checksum, htmlPath: content.htmlPath, textPath: content.textPath }
}

export async function sendCampaignEmail({ campaign, step, contact, context, messageId, idempotencyKey, tags = [] }) {
  if (!isLiveMode()) throw new Error('email_live_mode_disabled')
  const resend = getResend()
  const { payload, content } = prepareCampaignEmail({ campaign, step, contact, context, messageId, tags })
  const result = await resend.emails.send(payload, { idempotencyKey })
  if (result.error) throw new Error(`resend_send_failed:${result.error.message}`)
  return { ...result.data, content }
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
