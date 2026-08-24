import { allowMethods, json } from '../_lib/http.js'
import { assertSupabase, getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

export function trackingForCampaign(campaign, environment = process.env) {
  const reporting = campaign?.reporting || {}
  return {
    delivered: reporting.delivered !== false,
    opens: reporting.opens ?? (environment.EMAIL_OPEN_TRACKING_ENABLED === 'true'),
    clicks: reporting.clicks ?? (environment.EMAIL_CLICK_TRACKING_ENABLED === 'true'),
  }
}

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['GET'])) return
  if (!isSupabaseConfigured()) return json(response, 503, { configured: false, error: 'analytics_not_configured' })
  const campaignId = String(request.query.campaign_id || '')
  if (!campaignId) return json(response, 400, { error: 'campaign_id_required' })
  try {
    const supabase = getSupabase()
    const campaign = assertSupabase(await supabase.from('email_campaign_stats').select('*').eq('campaign_id', campaignId).maybeSingle(), 'load campaign stats')
    const steps = assertSupabase(await supabase.from('email_step_stats').select('*').eq('campaign_id', campaignId).order('step_number'), 'load step stats')
    const enrollments = assertSupabase(await supabase.from('email_enrollments').select('status,exit_reason').eq('campaign_id', campaignId), 'load campaign enrollment control stats') || []
    const jobs = assertSupabase(await supabase.from('email_jobs').select('status,last_error').eq('campaign_id', campaignId).in('status', ['pending', 'processing', 'needs_attention']), 'load campaign job control stats') || []
    const control = {
      enabled: campaign?.enabled ?? false,
      enrollment_statuses: enrollments.reduce((counts, row) => {
        counts[row.status] = (counts[row.status] || 0) + 1
        return counts
      }, {}),
      paused_by_kill_switch: enrollments.filter((row) => row.status === 'paused' && /campaign_disabled|email_live_mode|campaign_paused/.test(String(row.exit_reason || ''))).length,
      pending_jobs: jobs.filter((row) => row.status === 'pending').length,
      jobs_paused_by_kill_switch: jobs.filter((row) => String(row.last_error || '').startsWith('campaign_paused:')).length,
    }
    return json(response, 200, {
      configured: true,
      campaign: campaign || null,
      steps: steps || [],
      control,
      tracking: trackingForCampaign(campaign),
      refreshed_at: new Date().toISOString(),
    })
  } catch (error) {
    return json(response, 500, { configured: true, error: 'analytics_query_failed' })
  }
}
