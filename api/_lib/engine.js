import crypto from 'node:crypto'
import { findCampaign, findTriggeredStep } from '../../shared/campaign-registry.js'
import { assertSupabase, getSupabase, oneRow } from './supabase.js'
import { campaignSendAt } from './time.js'
import { isLiveMode, sendCampaignEmail } from './resend.js'

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
    marketing_status: row.marketing_status,
    properties: row.properties || {},
  }
}

const INTERNAL_CANARY_EMAIL = /^[^@+]+\+[^@]*canary[^@]*@gmail\.com$/i

export function assertInternalCanaryContact(contact, expectedEmail) {
  const email = String(contact?.email || '').trim().toLowerCase()
  const expected = String(expectedEmail || '').trim().toLowerCase()
  const properties = contact?.properties && typeof contact.properties === 'object' ? contact.properties : {}
  const source = String(properties.source || '').trim().toLowerCase()
  const lawfulBasis = String(properties.lawful_basis || '').trim().toLowerCase()
  const decision = String(properties.eligibility_decision || '').trim().toLowerCase()
  if (!email || email !== expected) throw new Error('canary_recipient_mismatch')
  if (!INTERNAL_CANARY_EMAIL.test(email)) throw new Error('canary_recipient_not_internal_alias')
  if (source !== 'internal app-managed canary') throw new Error('canary_source_not_verified')
  if (!lawfulBasis.includes('internal test address controlled by the account owner')) throw new Error('canary_lawful_basis_not_verified')
  if (decision !== 'eligible' || contact.marketing_status !== 'eligible') throw new Error('canary_contact_not_eligible')
  return contact
}

class PreSendExitError extends Error {
  constructor(reason) {
    super(`pre_send_exit:${reason}`)
    this.reason = reason
  }
}

class CampaignPausedError extends Error {
  constructor(reason) {
    super(`campaign_paused:${reason}`)
    this.reason = reason
  }
}

function requiresMarketingEligibility(classification) {
  return classification === 'promotional' || classification === 'lifecycle'
}

function ineligibleReason(contact, classification) {
  const status = String(contact.marketing_status || 'unknown').toLowerCase()
  const properties = contact.properties && typeof contact.properties === 'object' ? contact.properties : {}
  const decision = String(properties.eligibility_decision || properties.eligibilityDecision || '').toLowerCase()
  if (status === 'ineligible' || decision === 'ineligible') return 'ineligible'
  if (status === 'unsubscribed') return 'unsubscribe'
  if (requiresMarketingEligibility(classification) && status !== 'eligible') return 'ineligible'
  return null
}

async function currentContactForSend(contact) {
  const query = getSupabase()
    .from('email_contacts')
    .select('id,email,first_name,last_name,business_name,market,timezone,marketing_status,properties')
  const result = contact.id
    ? await query.eq('id', contact.id).maybeSingle()
    : await query.eq('email', contact.email).maybeSingle()
  const row = assertSupabase(result, 'load current send contact')
  if (!row) throw new PreSendExitError('contact_not_found')
  return row
}

async function validateContactCanReceive(contact, classification) {
  const current = await currentContactForSend(contact)
  const eligibilityReason = ineligibleReason(current, classification)
  if (eligibilityReason) throw new PreSendExitError(eligibilityReason)
  const suppression = await suppressionFor(current, classification)
  if (suppression) throw new PreSendExitError(suppression.reason)
  return current
}

async function validateCampaignCanSend(campaign) {
  if (!isLiveMode()) throw new CampaignPausedError('email_live_mode_disabled')
  const result = await getSupabase()
    .from('email_campaigns')
    .select('id,enabled')
    .eq('id', campaign.id)
    .maybeSingle()
  const databaseCampaign = assertSupabase(result, 'check campaign kill switch')
  if (!databaseCampaign?.enabled) throw new CampaignPausedError('campaign_disabled_in_database')
  return databaseCampaign
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
    template_id: step.templateId || null,
    recipient_email: contact.email,
    subject: step.subject,
    status: 'sending',
    tags: { campaign_id: campaign.id, sequence_step: step.key, market: campaign.market.toLowerCase() },
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
  await validateCampaignCanSend(campaign)
  const currentContact = await validateContactCanReceive(contact, classification)

  const message = await reserveMessage({ campaign, step, contact: currentContact, enrollmentId, jobId, idempotencyKey, source })
  if (message.resend_email_id || ['accepted', 'delivered', 'opened', 'clicked'].includes(message.status)) return { message, duplicate: true }

  try {
    const sent = await sendCampaignEmail({
      campaign,
      step,
      contact: currentContact,
      context,
      idempotencyKey,
      tags: enrollmentId ? [{ name: 'enrollment_id', value: enrollmentId }] : [{ name: 'job_id', value: jobId }],
    })
    const now = new Date().toISOString()
    const updated = await getSupabase().from('email_messages').update({
      resend_email_id: sent.id,
      status: 'accepted',
      sent_at: now,
      error_message: null,
    }).eq('id', message.id).select().single()
    return { message: assertSupabase(updated, 'mark message accepted'), duplicate: false }
  } catch (error) {
    await markMessageFailed(message.id, error)
    throw error
  }
}

function isPreSendExit(error) {
  return error instanceof PreSendExitError || /^pre_send_exit:/.test(String(error?.message || error))
}

function isCampaignPaused(error) {
  return error instanceof CampaignPausedError || /^campaign_paused:/.test(String(error?.message || error))
}

function campaignPausedReason(error) {
  return error.reason || String(error.message || error).replace(/^campaign_paused:/, '') || 'campaign_paused'
}

async function exitEnrollmentBeforeSend(row, contact, step, error) {
  const reason = error.reason || String(error.message).replace(/^pre_send_exit:/, '') || 'pre_send_exit'
  const externalEventId = `pre-send/${row.enrollment_id}/${step.key}/${reason}`
  const exited = assertSupabase(await getSupabase().rpc('exit_email_enrollments', {
    p_email: contact.email,
    p_reason: reason,
    p_event_type: reason,
    p_external_event_id: externalEventId,
    p_data: { source: 'sequence_worker_pre_send', campaign_id: row.campaign_id, step_key: step.key },
  }), 'exit enrollment before send')
  return { id: row.enrollment_id, status: 'exited_pre_send', reason, exited }
}

async function cancelJobBeforeSend(row, step, error) {
  const reason = error.reason || String(error.message).replace(/^pre_send_exit:/, '') || 'pre_send_exit'
  assertSupabase(await getSupabase().from('email_jobs').update({
    status: 'cancelled',
    locked_at: null,
    locked_by: null,
    last_error: `pre_send_exit:${reason}`,
  }).eq('id', row.job_id), 'cancel lifecycle job before send')
  return { id: row.job_id, status: 'cancelled_pre_send', step: step.key, reason }
}

async function pauseEnrollmentForCampaignSwitch(row, step, error) {
  const reason = campaignPausedReason(error)
  assertSupabase(await getSupabase().from('email_enrollments').update({
    status: 'paused',
    locked_at: null,
    locked_by: null,
    exit_reason: reason,
  }).eq('id', row.enrollment_id), 'pause enrollment for campaign switch')
  return { id: row.enrollment_id, status: 'paused_campaign_switch', step: step.key, reason }
}

async function releaseJobForCampaignSwitch(row, step, error) {
  const reason = campaignPausedReason(error)
  assertSupabase(await getSupabase().from('email_jobs').update({
    status: 'pending',
    locked_at: null,
    locked_by: null,
    last_error: `campaign_paused:${reason}`,
  }).eq('id', row.job_id), 'release lifecycle job for campaign switch')
  return { id: row.job_id, status: 'released_campaign_switch', step: step.key, reason }
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
  const contact = contactFromClaim(row)
  try {
    await validateCampaignCanSend(campaign)
  } catch (error) {
    if (isCampaignPaused(error)) return pauseEnrollmentForCampaignSwitch(row, step, error)
    throw error
  }
  try {
    await validateContactCanReceive(contact, step.classification || campaign.classification)
  } catch (error) {
    if (isPreSendExit(error)) return exitEnrollmentBeforeSend(row, contact, step, error)
    throw error
  }
  if (await rescheduleForFrequency(row, campaign)) return { id: row.enrollment_id, status: 'rescheduled_frequency' }

  const idempotencyKey = `${campaign.id}/${row.enrollment_id}/${step.key}/${campaign.version}`
  try {
    await sendClaimedMessage({ campaign, step, contact, context: row.context, enrollmentId: row.enrollment_id, idempotencyKey, source: 'sequence_engine' })
  } catch (error) {
    if (isCampaignPaused(error)) return pauseEnrollmentForCampaignSwitch(row, step, error)
    if (isPreSendExit(error)) return exitEnrollmentBeforeSend(row, contact, step, error)
    throw error
  }

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
  try {
    await validateCampaignCanSend(campaign)
  } catch (error) {
    if (isCampaignPaused(error)) return releaseJobForCampaignSwitch(row, step, error)
    throw error
  }
  const contact = contactFromClaim(row)
  const idempotencyKey = `${campaign.id}/${row.source_event_id}/${step.key}/${campaign.version}`
  try {
    await sendClaimedMessage({ campaign, step, contact, context: row.context, jobId: row.job_id, idempotencyKey, source: 'lifecycle_engine' })
  } catch (error) {
    if (isCampaignPaused(error)) return releaseJobForCampaignSwitch(row, step, error)
    if (isPreSendExit(error)) return cancelJobBeforeSend(row, step, error)
    throw error
  }
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

export async function processCanaryEnrollment({ enrollmentId, expectedEmail, expectedCampaignId }) {
  if (process.env.EMAIL_CANARY_MODE !== 'true') throw new Error('email_canary_mode_disabled')
  if (!isLiveMode()) throw new Error('email_live_mode_disabled')
  const supabase = getSupabase()
  const enrollment = assertSupabase(await supabase
    .from('email_enrollments')
    .select('*')
    .eq('id', enrollmentId)
    .maybeSingle(), 'load canary enrollment')
  if (!enrollment) throw new Error('canary_enrollment_not_found')
  if (enrollment.campaign_id !== expectedCampaignId) throw new Error('canary_campaign_mismatch')
  if (enrollment.status !== 'active' || enrollment.next_step !== 1) throw new Error('canary_enrollment_not_at_first_step')
  if (!enrollment.next_send_at || new Date(enrollment.next_send_at).getTime() > Date.now()) throw new Error('canary_enrollment_not_due')
  if (enrollment.locked_at && new Date(enrollment.locked_at).getTime() > Date.now() - (10 * 60 * 1000)) throw new Error('canary_enrollment_locked')

  const contact = assertSupabase(await supabase
    .from('email_contacts')
    .select('id,email,first_name,last_name,business_name,market,timezone,marketing_status,properties')
    .eq('id', enrollment.contact_id)
    .maybeSingle(), 'load canary contact')
  assertInternalCanaryContact(contact, expectedEmail)

  let lockQuery = supabase.from('email_enrollments').update({
    locked_at: new Date().toISOString(),
    locked_by: `canary-${workerId()}`,
  }).eq('id', enrollment.id).eq('status', 'active')
  lockQuery = enrollment.locked_at ? lockQuery.eq('locked_at', enrollment.locked_at) : lockQuery.is('locked_at', null)
  const locked = assertSupabase(await lockQuery.select().maybeSingle(), 'lock canary enrollment')
  if (!locked) throw new Error('canary_enrollment_lock_failed')

  const row = {
    ...locked,
    enrollment_id: locked.id,
    contact_id: contact.id,
    email: contact.email,
    first_name: contact.first_name,
    last_name: contact.last_name,
    business_name: contact.business_name,
    market: contact.market,
    timezone: contact.timezone,
    marketing_status: contact.marketing_status,
    properties: contact.properties,
  }
  try {
    return await processEnrollment(row)
  } catch (error) {
    return handleFailure('enrollment', row, error)
  }
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
