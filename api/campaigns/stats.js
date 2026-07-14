import { allowMethods, json } from '../_lib/http.js'
import { assertSupabase, getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['GET'])) return
  if (!isSupabaseConfigured()) return json(response, 503, { configured: false, error: 'analytics_not_configured' })
  const campaignId = String(request.query.campaign_id || '')
  if (!campaignId) return json(response, 400, { error: 'campaign_id_required' })
  try {
    const supabase = getSupabase()
    const campaign = assertSupabase(await supabase.from('email_campaign_stats').select('*').eq('campaign_id', campaignId).maybeSingle(), 'load campaign stats')
    const steps = assertSupabase(await supabase.from('email_step_stats').select('*').eq('campaign_id', campaignId).order('step_number'), 'load step stats')
    return json(response, 200, {
      configured: true,
      campaign: campaign || null,
      steps: steps || [],
      tracking: {
        opens: process.env.EMAIL_OPEN_TRACKING_ENABLED === 'true',
        clicks: process.env.EMAIL_CLICK_TRACKING_ENABLED === 'true',
      },
      refreshed_at: new Date().toISOString(),
    })
  } catch (error) {
    return json(response, 500, { configured: true, error: 'analytics_query_failed' })
  }
}
