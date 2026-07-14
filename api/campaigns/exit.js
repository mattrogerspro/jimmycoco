import crypto from 'node:crypto'
import { findCampaign, findTriggeredStep } from '../../shared/campaign-registry.js'
import { enqueueLifecycleEvent } from '../_lib/engine.js'
import { allowMethods, isEmail, json, normaliseEmail, readJson, requireBearer } from '../_lib/http.js'
import { assertSupabase, getSupabase } from '../_lib/supabase.js'

const allowedReasons = new Set(['reply', 'sample_requested', 'trial_requested', 'call_booked', 'unsubscribe', 'complaint', 'hard_bounce', 'existing_customer', 'current_negotiation', 'manual_suppression'])

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST']) || !requireBearer(request, response)) return
  const body = await readJson(request)
  if (!isEmail(body.email)) return json(response, 422, { error: 'valid_email_required' })
  if (!allowedReasons.has(body.reason)) return json(response, 422, { error: 'unsupported_exit_reason' })
  const email = normaliseEmail(body.email)
  const externalId = body.event_id || `manual-${crypto.randomUUID()}`
  try {
    const supabase = getSupabase()
    const contact = assertSupabase(await supabase.from('email_contacts').select('*').eq('email', email).maybeSingle(), 'load exiting contact')
    const activeEnrollments = contact
      ? assertSupabase(await supabase.from('email_enrollments').select('campaign_id').eq('contact_id', contact.id).eq('status', 'active'), 'load exiting enrollments')
      : []
    const affected = assertSupabase(await supabase.rpc('exit_email_enrollments', {
      p_email: email,
      p_reason: body.reason,
      p_event_type: body.reason,
      p_external_event_id: externalId,
      p_data: body.data || {},
    }), 'exit enrollments')
    if (['unsubscribe', 'complaint', 'hard_bounce', 'manual_suppression'].includes(body.reason)) {
      const scope = ['complaint', 'hard_bounce'].includes(body.reason) ? 'global' : 'marketing'
      await supabase.from('email_suppressions').upsert({ email, scope, reason: body.reason, source: 'application_api', metadata: body.data || {} }, { onConflict: 'email,scope' })
    }
    const queued = []
    for (const enrollment of activeEnrollments || []) {
      const campaign = findCampaign(enrollment.campaign_id)
      if (!campaign || !findTriggeredStep(campaign, body.reason)) continue
      try {
        queued.push(await enqueueLifecycleEvent({
          campaignId: campaign.id,
          trigger: body.reason,
          sourceEventId: `${externalId}/${campaign.id}/${body.reason}`,
          contact,
          context: body.data || {},
        }))
      } catch {
        queued.push({ campaign: campaign.id, trigger: body.reason, error: 'follow_up_not_queued' })
      }
    }
    return json(response, 200, { exited: affected, queued, reason: body.reason, event_id: externalId })
  } catch {
    return json(response, 500, { error: 'exit_failed' })
  }
}
