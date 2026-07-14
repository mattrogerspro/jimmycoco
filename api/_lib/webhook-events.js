import { findCampaign, findStepByTemplateId } from '../../shared/campaign-registry.js'
import { assertSupabase, getSupabase, oneRow } from './supabase.js'

const eventStatus = {
  'email.scheduled': 'scheduled',
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.delivery_delayed': 'delayed',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.failed': 'failed',
  'email.suppressed': 'suppressed',
}

const statusRank = {
  queued: 0, sending: 1, scheduled: 2, accepted: 3, sent: 4, delayed: 5,
  delivered: 6, opened: 7, clicked: 8,
  failed: 20, bounced: 21, suppressed: 22, complained: 23,
}

function safePayload(event) {
  const data = event.data || {}
  return {
    type: event.type,
    email_id: data.email_id || null,
    broadcast_id: data.broadcast_id || null,
    template_id: data.template_id || null,
    subject: data.subject || null,
    from: data.from || null,
    to: Array.isArray(data.to) ? data.to : [],
    tags: data.tags || {},
    bounce: data.bounce ? { type: data.bounce.type, subType: data.bounce.subType, message: data.bounce.message } : null,
    click: data.click ? { link: data.click.link } : null,
    message_id: data.message_id || null,
  }
}

async function ensureContact(email, market) {
  if (!email) return null
  return oneRow(assertSupabase(await getSupabase().rpc('upsert_email_contact', {
    p_email: email,
    p_market: market || null,
    p_marketing_status: 'unknown',
    p_properties: {},
  }), 'upsert webhook contact'))
}

async function ensureMessage(event) {
  const supabase = getSupabase()
  const data = event.data || {}
  if (!data.email_id) return null
  const existing = await supabase.from('email_messages').select('*').eq('resend_email_id', data.email_id).maybeSingle()
  if (existing.error) throw new Error(`find webhook message: ${existing.error.message}`)
  if (existing.data) return existing.data

  const tags = data.tags || {}
  const byTemplate = data.template_id ? findStepByTemplateId(data.template_id) : null
  const campaign = findCampaign(tags.campaign_id) || byTemplate?.campaign
  const step = campaign
    ? [...campaign.steps, ...(campaign.triggeredSteps || [])].find((candidate) => candidate.key === tags.sequence_step) || byTemplate?.step
    : null
  if (!campaign || !step) return null

  const recipient = Array.isArray(data.to) ? data.to[0] : data.to
  const contact = await ensureContact(recipient, campaign.market)
  const source = data.broadcast_id ? 'resend_broadcast' : 'resend_external'
  const inserted = await supabase.from('email_messages').upsert({
    contact_id: contact?.id || null,
    campaign_id: campaign.id,
    step_key: step.key,
    step_number: step.number,
    source,
    classification: step.classification || campaign.classification,
    idempotency_key: `resend-external/${data.email_id}`,
    template_alias: step.templateAlias,
    template_id: data.template_id || step.templateId,
    recipient_email: recipient,
    subject: data.subject || step.subject,
    status: eventStatus[event.type] || 'sent',
    resend_email_id: data.email_id,
    resend_broadcast_id: data.broadcast_id || null,
    tags,
    sent_at: event.type === 'email.sent' ? event.created_at : data.created_at || event.created_at,
  }, { onConflict: 'resend_email_id' }).select().single()
  return assertSupabase(inserted, 'create external webhook message')
}

async function applyMessageEvent(message, event) {
  if (!message) return
  const eventTime = event.created_at || new Date().toISOString()
  const incoming = eventStatus[event.type]
  const update = {}
  const timeField = {
    'email.sent': 'sent_at',
    'email.delivered': 'delivered_at',
    'email.opened': 'first_opened_at',
    'email.clicked': 'first_clicked_at',
    'email.bounced': 'bounced_at',
    'email.complained': 'complained_at',
    'email.failed': 'failed_at',
    'email.suppressed': 'suppressed_at',
  }[event.type]
  if (timeField && !message[timeField]) update[timeField] = eventTime
  if (incoming && (statusRank[incoming] || 0) >= (statusRank[message.status] || 0)) update.status = incoming
  if (Object.keys(update).length) assertSupabase(await getSupabase().from('email_messages').update(update).eq('id', message.id), 'apply message event')
}

async function suppressAndExit(email, reason, scope, svixId, data) {
  if (!email) return
  const supabase = getSupabase()
  await ensureContact(email)
  assertSupabase(await supabase.from('email_suppressions').upsert({
    email,
    scope,
    reason,
    source: 'resend_webhook',
    metadata: data || {},
  }, { onConflict: 'email,scope' }), 'store suppression')
  if (scope === 'marketing') await supabase.from('email_contacts').update({ marketing_status: 'unsubscribed' }).eq('email', email)
  await supabase.rpc('exit_email_enrollments', {
    p_email: email,
    p_reason: reason,
    p_event_type: reason,
    p_external_event_id: svixId,
    p_data: data || {},
  })
}

async function recordInboundReply(event, svixId) {
  const email = event.data?.from
  if (!email) return
  await ensureContact(email)
  await getSupabase().rpc('exit_email_enrollments', {
    p_email: email,
    p_reason: 'reply',
    p_event_type: 'reply',
    p_external_event_id: svixId,
    p_data: { received_email_id: event.data.email_id, subject: event.data.subject },
  })
}

export async function processResendEvent(event, svixId) {
  const supabase = getSupabase()
  const message = await ensureMessage(event)
  const inserted = await supabase.from('email_events').insert({
    svix_id: svixId,
    event_type: event.type,
    resend_email_id: event.data?.email_id || null,
    message_id: message?.id || null,
    occurred_at: event.created_at || new Date().toISOString(),
    payload: safePayload(event),
  })
  if (inserted.error?.code === '23505') return { duplicate: true }
  if (inserted.error) throw new Error(`store webhook event: ${inserted.error.message}`)

  await applyMessageEvent(message, event)
  const recipient = Array.isArray(event.data?.to) ? event.data.to[0] : event.data?.to
  if (event.type === 'email.bounced') await suppressAndExit(recipient, 'hard_bounce', 'global', svixId, safePayload(event))
  if (event.type === 'email.complained') await suppressAndExit(recipient, 'complaint', 'global', svixId, safePayload(event))
  if (event.type === 'email.suppressed') await suppressAndExit(recipient, 'provider_suppression', 'global', svixId, safePayload(event))
  if (event.type === 'email.received') await recordInboundReply(event, svixId)
  if (event.type === 'contact.updated' && event.data?.unsubscribed) {
    await suppressAndExit(event.data.email, 'unsubscribe', 'marketing', svixId, safePayload(event))
  }
  return { duplicate: false, matched: Boolean(message) }
}
