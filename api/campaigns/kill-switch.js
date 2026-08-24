import { findCampaign } from '../../shared/campaign-registry.js'
import { allowMethods, json, publicError, readJson, requireBearer } from '../_lib/http.js'
import { assertSupabase, getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

async function campaignControlState(supabase, campaignId) {
  const campaign = assertSupabase(await supabase
    .from('email_campaigns')
    .select('id,name,enabled,updated_at')
    .eq('id', campaignId)
    .maybeSingle(), 'load campaign control state')
  const enrollments = assertSupabase(await supabase
    .from('email_enrollments')
    .select('status')
    .eq('campaign_id', campaignId), 'load campaign enrollment state') || []
  const jobs = assertSupabase(await supabase
    .from('email_jobs')
    .select('status,last_error')
    .eq('campaign_id', campaignId)
    .in('status', ['pending', 'processing', 'needs_attention']), 'load campaign job state') || []

  return {
    campaign,
    enrollments: enrollments.reduce((counts, row) => {
      counts[row.status] = (counts[row.status] || 0) + 1
      return counts
    }, {}),
    pending_jobs: jobs.filter((row) => row.status === 'pending').length,
    paused_jobs: jobs.filter((row) => String(row.last_error || '').startsWith('campaign_paused:')).length,
  }
}

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST']) || !requireBearer(request, response)) return
  if (!isSupabaseConfigured()) return json(response, 503, { error: 'supabase_not_configured' })

  try {
    const body = await readJson(request)
    const campaign = findCampaign(body.campaign_id)
    if (!campaign) return json(response, 404, { error: 'campaign_not_found' })
    if (typeof body.enabled !== 'boolean') return json(response, 422, { error: 'enabled_boolean_required' })

    const supabase = getSupabase()
    const existing = assertSupabase(await supabase
      .from('email_campaigns')
      .select('id,enabled,config')
      .eq('id', campaign.id)
      .maybeSingle(), 'load campaign kill switch')
    if (!existing) return json(response, 404, { error: 'database_campaign_not_found' })

    const currentConfig = existing.config && typeof existing.config === 'object' ? existing.config : {}
    const nextConfig = {
      ...currentConfig,
      kill_switch: {
        enabled: !body.enabled,
        changed_at: new Date().toISOString(),
        changed_by: body.operator || null,
        reason: body.reason || null,
      },
    }
    assertSupabase(await supabase
      .from('email_campaigns')
      .update({ enabled: body.enabled, config: nextConfig, updated_at: new Date().toISOString() })
      .eq('id', campaign.id), 'update campaign kill switch')

    const state = await campaignControlState(supabase, campaign.id)
    return json(response, 200, { ok: true, ...state })
  } catch (error) {
    const result = publicError(error)
    return json(response, result.status, { error: result.error })
  }
}
