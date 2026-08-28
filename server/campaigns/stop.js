import crypto from 'node:crypto'
import { findCampaign } from '../../shared/campaign-registry.js'
import { allowMethods, isEmail, json, normaliseEmail, publicError, readJson, requireBearer } from '../_lib/http.js'
import { assertSupabase, getSupabase } from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST']) || !requireBearer(request, response)) return
  try {
    const body = await readJson(request)
    const campaign = findCampaign(body.campaign_id)
    if (!campaign || campaign.mode !== 'sequence' || campaign.manualStart !== true) return json(response, 404, { error: 'manual_follow_up_campaign_not_found' })
    if (!isEmail(body.email)) return json(response, 422, { error: 'valid_email_required' })

    const email = normaliseEmail(body.email)
    const reason = String(body.reason || 'manual_suppression').trim()
    if (!reason) return json(response, 422, { error: 'stop_reason_required' })
    const supabase = getSupabase()
    const contact = assertSupabase(await supabase.from('email_contacts').select('id').eq('email', email).maybeSingle(), 'load follow-up contact')
    if (!contact) return json(response, 200, { stopped: 0 })

    const stopped = assertSupabase(await supabase
      .from('email_enrollments')
      .update({ status: 'exited', exited_at: new Date().toISOString(), exit_reason: reason, next_send_at: null, locked_at: null, locked_by: null })
      .eq('campaign_id', campaign.id)
      .eq('contact_id', contact.id)
      .eq('status', 'active')
      .select('id'), 'stop manual follow-up') || []

    const eventId = body.event_id || `manual-stop-${crypto.randomUUID()}`
    if (stopped.length) {
      await supabase.from('email_business_events').upsert(stopped.map((enrollment) => ({
        external_event_id: `${eventId}/${enrollment.id}`,
        contact_id: contact.id,
        campaign_id: campaign.id,
        enrollment_id: enrollment.id,
        event_type: 'manual_follow_up_stopped',
        data: { reason, stopped_by: body.owner || null, source_type: body.source_type || null, source_id: body.source_id || null },
      })), { onConflict: 'external_event_id', ignoreDuplicates: true })
    }

    return json(response, 200, { stopped: stopped.length, campaign_id: campaign.id })
  } catch (error) {
    const result = publicError(error)
    return json(response, result.status, { error: result.error })
  }
}
