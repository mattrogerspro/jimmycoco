import { allowMethods, json } from '../_lib/http.js'
import { requireEmailAdmin } from '../_lib/email-auth.js'
import { assertSupabase, getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

const REPORTABLE_MESSAGE_SOURCES = ['sequence_engine', 'lifecycle_engine', 'resend_broadcast']

export function summariseReportableMessages(messages = []) {
  const count = (field) => messages.filter((message) => Boolean(message[field])).length
  const activity = messages
    .map((message) => message.sent_at || message.created_at)
    .filter(Boolean)
    .sort()
    .at(-1) || null
  return {
    sent: count('sent_at'),
    delivered: count('delivered_at'),
    opened: count('first_opened_at'),
    clicked: count('first_clicked_at'),
    bounced: count('bounced_at'),
    complained: count('complained_at'),
    failed: count('failed_at'),
    last_activity_at: activity,
  }
}

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
  if (!requireEmailAdmin(request, response)) return
  if (!isSupabaseConfigured()) return json(response, 503, { configured: false, error: 'analytics_not_configured' })
  const campaignId = String(request.query.campaign_id || '')
  if (!campaignId) return json(response, 400, { error: 'campaign_id_required' })
  try {
    const supabase = getSupabase()
    const campaignView = assertSupabase(await supabase.from('email_campaign_stats').select('*').eq('campaign_id', campaignId).maybeSingle(), 'load campaign stats')
    const stepViews = assertSupabase(await supabase.from('email_step_stats').select('*').eq('campaign_id', campaignId).order('step_number'), 'load step stats')
    const reportableMessages = assertSupabase(await supabase
      .from('email_messages')
      .select('step_key,sent_at,delivered_at,first_opened_at,first_clicked_at,bounced_at,complained_at,failed_at,created_at')
      .eq('campaign_id', campaignId)
      .in('source', REPORTABLE_MESSAGE_SOURCES), 'load reportable campaign messages') || []
    const campaign = campaignView ? { ...campaignView, ...summariseReportableMessages(reportableMessages) } : null
    const steps = (stepViews || []).map((step) => ({
      ...step,
      ...summariseReportableMessages(reportableMessages.filter((message) => message.step_key === step.step_key)),
    }))
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
