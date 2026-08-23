import crypto from 'node:crypto'
import { findCampaign, findTriggeredStep } from '../../shared/campaign-registry.js'
import { assertSupabase, getSupabase, oneRow } from './supabase.js'
import { campaignSendAt } from './time.js'
import { getCampaignContentMetadata, isLiveMode, sendCampaignEmail } from './resend.js'

function workerId() {
  return `${process.env.VERCEL_REGION || 'local'}-${crypto.randomUUID()}`
}

function contactFromClaim(row) {
  return {
    id: row.contact_id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    business_name: row.business_name,
    market: row.market,
    timezone: row.timezone,
  }
}

async function suppressionFor(contact, classification) {
  const scopes = ['global']
  if (classification === 'promotional' || classification === 'lifecycle') scopes.push('marketing')
  const result = await getSupabase()
    .from('email_suppressions')
    .select('scope,reason')
    .eq('email', contact.email)
    .in('scope', scopes)
    .limit(1)
    .maybeSingle()
  return assertSupabase(result, 'check suppression')
}

async function recentNonTransactionalSend(contactId, gapHours) {
  const since = new Date(Date.now() - gapHours * 60 * 60 * 1000).toISOString()
  const result = await getSupabase()
    .from('email_messages')
    .select('sent_at')
    .eq('contact_id', contactId)
    .in('classification', ['promotional', 'lifecycle'])
    .gte('sent_at', since)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return assertSupabase(result, 'check frequency policy')
}

async function reserveMessage({ campaign, step, contact, enrollmentId, jobId, idempotencyKey, source }) {
  const supabase = getSupabase()
  const content = getCampaignContentMetadata(campaign, step)
  const record = {
    enrollment_id: enrollmentId || null,
    job_id: jobId || null,
    contact_id: contact.id,
    campaign_id: campaign.id,
    step_key: step.key,
    step_number: step.number,
    source,
    classification: step.classification || campaign.classification,
    idempotency_key: idempotencyKey,
    template_alias: step.templateAlias,
    template_id: campaign.deliveryMode === 'repository-html' ? null : step.templateId,
    recipient_email: contact.email,
    subject: step.subject,
    status: 'sending',
    tags: {
      campaign_id: campaign.id,
      sequence_step: step.key,
      market: campaign.market.toLowerCase(),
      delivery_mode: content.deliveryMode,
      campaign_version: campaign.version,
      content_checksum: content.checksum || null,
      content_html_path: content.htmlPath || null,
      content_text_path: content.textPath || null,
    },
  }
  const inserted = await supabase.from('email_messages').insert(record).select().maybeSingle()
  if (!inserted.error) return inserted.data
  if (inserted.error.code !== '23505') throw new Error(`reserve message: ${inserted.error.message}`)
  const existing = await supabase.from('email_messages').select('*').eq('idempotency_key', idempotencyKey).single()
  return assertSupabase(existing, 'load idempotent message')
}

async function markMessageFailed(messageId, error) {
  const safeMessage = String(error instanceof Error ? error.message : error).slice(0, 1000)
  await getSupabase().from('email_messages').update({ status: 'failed', failed_at: new Date().toISOString(), error_message: safeMessage }).eq('id', messageId)
}

async function sendClaimedMessage({ campaign, step, contact, context, enrollmentId, jobId, idempotencyKey, source }) {
  const classification = step.classification || campaign.classification
  const suppression = await suppressionFor(contact, classification)
  if (suppression) throw new Error(`contact_is_suppressed:${suppression.reason}`)

  const message = await reserveMessage({ campaign, step, contact, enrollmentId, jobId, idempotencyKey, source })
  if (message.resend_email_id || ['accepted', 'delivered', 'opened', 'clicked'].includes(message.status)) return { message, duplicate: true }

  try {
    const sent = await sendCampaignEmail({
      campaign,
      step,
      contact,
      context,
      messageId: message.id,
      idempotencyKey,
      tags: enrollmentId ? [{ name: 'enrollment_id', value: enrollmentId }] : [{ name: 'job_id', value: jobId }],
    })
    const now = new Date().toISOString()
    const updated = await getSupabase().from('email_messages').update({
      resend_email_id: sent.id,
      status: 'accepted',
      subject: sent.content?.subject || message.subject,
      sent_at: now,
      tags: { ...message.tags, content_checksum: sent.content?.checksum || null, content_html_path: sent.content?.htmlPath || null, content_text_path: sent.content?.textPath || null },
      error_message: null,
    }).eq('id', message.id).select().single()
    return { message: assertSupabase(updated, 'mark message accepted'), duplicate: false }
  } catch (error) {
    await markMessageFailed(message.id, error)
    throw error
  }
}

async function rescheduleForFrequency(row, campaign) {
  const last = await recentNonTransactionalSend(row.contact_id, campaign.minimumContactGapHours || 16)
  if (!last?.sent_at) return false
  const next = new Date(new Date(last.sent_at).getTime() + (campaign.minimumContactGapHours || 16) * 60 * 60 * 1000 + 60 * 1000)
  assertSupabase(await getSupabase().from('email_enrollments').update({ next_send_at: next.toISOString(), locked_at: null, locked_by: null }).eq('id', row.enrollment_id), 'reschedule frequency collision')
  return true
}

async function processEnrollment(row) {
  const campaign = findCampaign(row.campaign_id)
  if (!campaign || campaign.mode !== 'sequence') throw new Error('unknown_sequence_campaign')
  if (!campaign.enabled) throw new Error('campaign_disabled_in_registry')
  const step = campaign.steps[row.next_step - 1]
  if (!step) throw new Error('sequence_step_not_found')
  if (await rescheduleForFrequency(row, campaign)) return { id: row.enrollment_id, status: 'rescheduled_frequency' }

  const contact = contactFromClaim(row)
  const idempotencyKey = `${campaign.id}/${row.enrollment_id}/${step.key}/${campaign.version}`
  await sendClaimedMessage({ campaign, step, contact, context: row.context, enrollmentId: row.enrollment_id, idempotencyKey, source: 'sequence_engine' })

  const nextStep = campaign.steps[row.next_step]
  const update = nextStep
    ? {
        next_step: row.next_step + 1,
        next_send_at: campaignSendAt(row.enrolled_at, nextStep.day, contact.timezone || campaign.timezone, campaign.localSendHour).toISOString(),
        retry_count: 0,
        locked_at: null,
        locked_by: null,
      }
    : {
        status: 'completed',
        next_send_at: null,
        retry_count: 0,
        locked_at: null,
        locked_by: null,
      }
  assertSupabase(await getSupabase().from('email_enrollments').update(update).eq('id', row.enrollment_id), 'advance enrollment')
  return { id: row.enrollment_id, status: nextStep ? 'sent' : 'completed', step: step.key }
}

async function processJob(row) {
  const campaign = findCampaign(row.campaign_id)
  if (!campaign) throw new Error('unknown_event_campaign')
  if (!campaign.enabled) throw new Error('campaign_disabled_in_registry')
  const step = [...campaign.steps, ...(campaign.triggeredSteps || [])].find((candidate) => candidate.key === row.step_key)
  if (!step) throw new Error('event_step_not_found')
  const contact = contactFromClaim(row)
  const idempotencyKey = `${campaign.id}/${row.source_event_id}/${step.key}/${campaign.version}`
  await sendClaimedMessage({ campaign, step, contact, context: row.context, jobId: row.job_id, idempotencyKey, source: 'lifecycle_engine' })
  assertSupabase(await getSupabase().from('email_jobs').update({ status: 'completed', locked_at: null, locked_by: null, last_error: null }).eq('id', row.job_id), 'complete lifecycle job')
  return { id: row.job_id, status: 'completed', step: step.key }
}

async function handleFailure(kind, row, error) {
  const retries = (row.retry_count || 0) + 1
  const nextStatus = retries >= 3 ? 'needs_attention' : kind === 'job' ? 'pending' : 'active'
  const table = kind === 'job' ? 'email_jobs' : 'email_enrollments'
  const idField = kind === 'job' ? 'job_id' : 'enrollment_id'
  const update = {
    status: nextStatus,
    retry_count: retries,
    locked_at: null,
    locked_by: null,
  }
  if (kind === 'job') {
    update.run_at = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    update.last_error = String(error instanceof Error ? error.message : error).slice(0, 1000)
  } else {
    update.next_send_at = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }
  await getSupabase().from(table).update(update).eq('id', row[idField])
  return { id: row[idField], status: nextStatus, error: String(error instanceof Error ? error.message : error) }
}

export async function processDueWork(limit = 25) {
  if (!isLiveMode()) return { live: false, processed: [], message: 'EMAIL_LIVE_MODE is disabled' }
  const worker = workerId()
  const supabase = getSupabase()
  const enrollmentRows = assertSupabase(await supabase.rpc('claim_due_email_enrollments', { p_limit: limit, p_worker: worker }), 'claim enrollments') || []
  const jobRows = assertSupabase(await supabase.rpc('claim_due_email_jobs', { p_limit: limit, p_worker: worker }), 'claim jobs') || []
  const processed = []
  for (const row of enrollmentRows) {
    try { processed.push(await processEnrollment(row)) } catch (error) { processed.push(await handleFailure('enrollment', row, error)) }
  }
  for (const row of jobRows) {
    try { processed.push(await processJob(row)) } catch (error) { processed.push(await handleFailure('job', row, error)) }
  }
  return { live: true, worker, claimed: enrollmentRows.length + jobRows.length, processed }
}

export async function enqueueLifecycleEvent({ campaignId, trigger, sourceEventId, contact, context = {} }) {
  const campaign = findCampaign(campaignId)
  if (!campaign) throw new Error('campaign_not_found')
  const step = findTriggeredStep(campaign, trigger)
  if (!step) throw new Error('trigger_not_found')
  if (!campaign.enabled) throw new Error('campaign_disabled_in_registry')

  const supabase = getSupabase()
  const databaseCampaign = assertSupabase(await supabase.from('email_campaigns').select('enabled').eq('id', campaign.id).maybeSingle(), 'check database campaign gate')
  if (!databaseCampaign?.enabled) throw new Error('campaign_disabled_in_database')
  const contactRow = oneRow(assertSupabase(await supabase.rpc('upsert_email_contact', {
    p_email: contact.email,
    p_first_name: contact.first_name || null,
    p_last_name: contact.last_name || null,
    p_business_name: contact.business_name || null,
    p_market: contact.market || campaign.market,
    p_timezone: contact.timezone || campaign.timezone,
    p_marketing_status: contact.marketing_status || 'unknown',
    p_properties: contact.properties || {},
  }), 'upsert lifecycle contact'))

  const classification = step.classification || campaign.classification
  const suppression = await suppressionFor(contactRow, classification)
  if (suppression) throw new Error(`contact_is_suppressed:${suppression.reason}`)

  const runAt = campaignSendAt(new Date(), step.delayDays || 0, contactRow.timezone || campaign.timezone, campaign.localSendHour)
  const job = assertSupabase(await supabase.from('email_jobs').upsert({
    campaign_id: campaign.id,
    step_key: step.key,
    contact_id: contactRow.id,
    source_event_id: sourceEventId,
    run_at: runAt.toISOString(),
    context,
  }, { onConflict: 'campaign_id,step_key,source_event_id', ignoreDuplicates: true }).select().maybeSingle(), 'enqueue lifecycle job')

  await supabase.from('email_business_events').upsert({
    external_event_id: sourceEventId,
    contact_id: contactRow.id,
    campaign_id: campaign.id,
    event_type: trigger,
    data: context,
  }, { onConflict: 'external_event_id', ignoreDuplicates: true })

  return { campaign: campaign.id, step: step.key, run_at: runAt.toISOString(), job }
}
