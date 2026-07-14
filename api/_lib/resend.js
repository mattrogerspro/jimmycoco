import { Resend } from 'resend'

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
  return {
    SENDER_NAME: process.env.EMAIL_SENDER_NAME || 'Matt',
    SENDER_TITLE: process.env.EMAIL_SENDER_TITLE || 'Partnerships, Sunless by Jimmy Coco',
    SENDER_EMAIL: process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.email',
    SUPPORT_EMAIL: process.env.EMAIL_SUPPORT_EMAIL || process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.email',
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

export function buildTemplateVariables(step, contact, context = {}) {
  const upperContext = Object.fromEntries(Object.entries(context).map(([key, value]) => [key.toUpperCase(), value]))
  const candidates = {
    ...variableDefaults(),
    ...upperContext,
    SALON_NAME: upperContext.SALON_NAME || contact.business_name,
    BUSINESS_NAME: upperContext.BUSINESS_NAME || contact.business_name,
  }
  const missing = step.requiredVariables.filter((key) => candidates[key] === undefined || candidates[key] === null || candidates[key] === '')
  if (missing.length) throw new Error(`missing_template_variables:${missing.join(',')}`)
  return Object.fromEntries(step.requiredVariables.map((key) => [key, candidates[key]]))
}

export async function sendTemplateEmail({ campaign, step, contact, context, idempotencyKey, tags = [] }) {
  if (!isLiveMode()) throw new Error('email_live_mode_disabled')
  const resend = getResend()
  const variables = buildTemplateVariables(step, contact, context)
  const payload = {
    from: process.env.RESEND_FROM || 'Sunless Partnerships <partnerships@email.jimmycoco.email>',
    to: [contact.email],
    replyTo: process.env.RESEND_REPLY_TO || 'partnerships@email.jimmycoco.email',
    template: { id: step.templateAlias, variables },
    tags: [
      { name: 'campaign_id', value: campaign.id },
      { name: 'sequence_step', value: step.key },
      { name: 'market', value: campaign.market.toLowerCase() },
      ...tags,
    ],
  }
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
