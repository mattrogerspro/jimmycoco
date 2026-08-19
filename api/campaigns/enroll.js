import { findCampaign } from '../../shared/campaign-registry.js'
import { allowMethods, isEmail, json, normaliseEmail, publicError, readJson, requireBearer } from '../_lib/http.js'
import { assertSupabase, getSupabase, oneRow } from '../_lib/supabase.js'
import { syncResendContact } from '../_lib/resend.js'

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST']) || !requireBearer(request, response)) return
  try {
    const body = await readJson(request)
    const campaign = findCampaign(body.campaign_id)
    if (!campaign || campaign.mode !== 'sequence') return json(response, 404, { error: 'sequence_campaign_not_found' })
    if (!campaign.enabled) return json(response, 409, { error: 'campaign_disabled_in_registry' })
    if (!isEmail(body.email)) return json(response, 422, { error: 'valid_email_required' })
    const email = normaliseEmail(body.email)
    const supabase = getSupabase()
    const databaseCampaign = assertSupabase(await supabase.from('email_campaigns').select('enabled').eq('id', campaign.id).maybeSingle(), 'check database campaign gate')
    if (!databaseCampaign?.enabled) return json(response, 409, { error: 'campaign_disabled_in_database' })
    const enrollment = oneRow(assertSupabase(await supabase.rpc('enroll_email_contact', {
      p_campaign_id: campaign.id,
      p_email: email,
      p_first_name: body.first_name || null,
      p_last_name: body.last_name || null,
      p_business_name: body.business_name || null,
      p_market: body.market || campaign.market,
      p_timezone: body.timezone || campaign.timezone,
      p_owner: body.owner || null,
      p_context: body.context || {},
      p_next_send_at: body.start_at || new Date().toISOString(),
    }), 'enroll contact'))
    const contact = assertSupabase(await supabase.from('email_contacts').select('*').eq('id', enrollment.contact_id).single(), 'load enrolled contact')
    try {
      const resendContact = await syncResendContact(contact)
      if (resendContact?.id) await supabase.from('email_contacts').update({ resend_contact_id: resendContact.id }).eq('id', contact.id)
    } catch (error) {
      await supabase.from('email_enrollments').update({ status: 'needs_attention', exit_reason: 'resend_contact_sync_failed' }).eq('id', enrollment.id)
      throw error
    }
    const externalEventId = body.event_id || `manual-enrollment-${campaign.id}-${enrollment.id}`
    await supabase.from('email_business_events').upsert({
      external_event_id: externalEventId,
      contact_id: contact.id,
      campaign_id: campaign.id,
      enrollment_id: enrollment.id,
      event_type: campaign.manualStart ? 'manual_follow_up_started' : 'campaign_enrolled',
      data: { owner: body.owner || null, context: body.context || {}, source_type: body.source_type || null, source_id: body.source_id || null },
    }, { onConflict: 'external_event_id', ignoreDuplicates: true })
    if (campaign.supersedesCampaigns?.length) {
      const exited = assertSupabase(await supabase
        .from('email_enrollments')
        .update({ status: 'exited', exited_at: new Date().toISOString(), exit_reason: 'converted_to_manual_follow_up', next_send_at: null, locked_at: null, locked_by: null })
        .eq('contact_id', contact.id)
        .in('campaign_id', campaign.supersedesCampaigns)
        .eq('status', 'active')
        .select('id,campaign_id'), 'exit superseded campaigns') || []
      if (exited.length) {
        await supabase.from('email_business_events').upsert(exited.map((previous) => ({
          external_event_id: `${externalEventId}/supersede/${previous.id}`,
          contact_id: contact.id,
          campaign_id: previous.campaign_id,
          enrollment_id: previous.id,
          event_type: 'converted_to_manual_follow_up',
          data: { replacement_campaign_id: campaign.id, replacement_enrollment_id: enrollment.id },
        })), { onConflict: 'external_event_id', ignoreDuplicates: true })
      }
    }
    return json(response, 201, { enrollment_id: enrollment.id, campaign_id: campaign.id, status: enrollment.status, next_send_at: enrollment.next_send_at })
  } catch (error) {
    const result = publicError(error)
    return json(response, result.status, { error: result.error })
  }
}
