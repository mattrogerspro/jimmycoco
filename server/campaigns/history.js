import { findCampaign } from '../../shared/campaign-registry.js'
import { allowMethods, isEmail, json, normaliseEmail, publicError, readJson, requireBearer } from '../_lib/http.js'
import { assertSupabase, getSupabase } from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST']) || !requireBearer(request, response)) return
  try {
    const body = await readJson(request)
    if (!isEmail(body.email)) return json(response, 422, { error: 'valid_email_required' })

    const requested = Array.isArray(body.campaign_ids) ? body.campaign_ids : []
    const campaignIds = requested.filter((id) => findCampaign(id)?.manualStart === true)
    if (!campaignIds.length) return json(response, 422, { error: 'manual_follow_up_campaign_ids_required' })

    const supabase = getSupabase()
    const email = normaliseEmail(body.email)
    const contact = assertSupabase(await supabase.from('email_contacts').select('id,email,marketing_status').eq('email', email).maybeSingle(), 'load follow-up contact')
    if (!contact) return json(response, 200, { contact: null, enrollments: [], messages: [], events: [] })

    const enrollments = assertSupabase(await supabase
      .from('email_enrollments')
      .select('id,campaign_id,status,next_step,enrolled_at,sequence_started_at,next_send_at,exited_at,exit_reason,owner,context,created_at,updated_at')
      .eq('contact_id', contact.id)
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false }), 'load follow-up enrollments') || []
    const enrollmentIds = enrollments.map((row) => row.id)
    const messages = enrollmentIds.length
      ? assertSupabase(await supabase
        .from('email_messages')
        .select('id,enrollment_id,campaign_id,step_key,step_number,status,subject,queued_at,sent_at,delivered_at,first_opened_at,first_clicked_at,failed_at,suppressed_at,error_message')
        .in('enrollment_id', enrollmentIds)
        .order('created_at', { ascending: true }), 'load follow-up messages') || []
      : []
    const events = enrollmentIds.length
      ? assertSupabase(await supabase
        .from('email_business_events')
        .select('id,enrollment_id,campaign_id,event_type,occurred_at,data')
        .in('enrollment_id', enrollmentIds)
        .order('occurred_at', { ascending: false }), 'load follow-up events') || []
      : []

    return json(response, 200, { contact, enrollments, messages, events })
  } catch (error) {
    const result = publicError(error)
    return json(response, result.status, { error: result.error })
  }
}
