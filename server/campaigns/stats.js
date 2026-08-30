import { allowMethods, json } from '../_lib/http.js'
import { requireEmailAdmin } from '../_lib/email-auth.js'
import { assertSupabase, getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

const REPORTABLE_MESSAGE_SOURCES = ['sequence_engine', 'lifecycle_engine', 'resend_broadcast']

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error)
}

async function optionalSupabase(query, context, fallback) {
  try {
    return assertSupabase(await query, context)
  } catch (error) {
    console.error(`[campaign-stats] ${context}`, { error: errorMessage(error) })
    return fallback
  }
}

export function normaliseCampaignRow(row) {
  if (!row) return null
  return {
    ...row,
    campaign_id: row.campaign_id || row.id,
    name: row.name,
    market: row.market,
    mode: row.mode,
    enabled: Boolean(row.enabled),
    reporting: row.reporting || row.config?.reporting || null,
    config: row.config,
    updated_at: row.updated_at,
  }
}

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

export function summariseBusinessEvents(events = []) {
  return {
    replies: events.filter((event) => event.event_type === 'reply').length,
    conversions: events.filter((event) => ['sample_requested', 'trial_requested', 'call_booked', 'opening_order_placed'].includes(event.event_type)).length,
  }
}

export function trackingForCampaign(campaign, environment = process.env) {
  const reporting = campaign?.reporting || campaign?.config?.reporting || {}
  return {
    delivered: reporting.delivered !== false,
    opens: reporting.opens ?? (environment.EMAIL_OPEN_TRACKING_ENABLED === 'true'),
    clicks: reporting.clicks ?? (environment.EMAIL_CLICK_TRACKING_ENABLED === 'true'),
  }
}

async function loadReportableMessages(supabase, campaignId) {
  try {
    return assertSupabase(await supabase
      .from('email_messages')
      .select('step_key,sent_at,delivered_at,first_opened_at,first_clicked_at,bounced_at,complained_at,failed_at,created_at')
      .eq('campaign_id', campaignId)
      .in('source', REPORTABLE_MESSAGE_SOURCES), 'load reportable campaign messages') || []
  } catch (error) {
    console.error('[campaign-stats] load reportable campaign messages', { error: errorMessage(error) })
    return []
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
    const campaignControl = normaliseCampaignRow(assertSupabase(await supabase
      .from('email_campaigns')
      .select('id,name,market,mode,enabled,config,updated_at')
      .eq('id', campaignId)
      .maybeSingle(), 'load campaign control state'))
    const campaignView = normaliseCampaignRow(await optionalSupabase(
      supabase.from('email_campaign_stats').select('*').eq('campaign_id', campaignId).maybeSingle(),
      'load campaign stats',
      null,
    ))
    const stepViews = await optionalSupabase(
      supabase.from('email_step_stats').select('*').eq('campaign_id', campaignId).order('step_number'),
      'load step stats',
      null,
    )
    const fallbackSteps = stepViews === null
      ? await optionalSupabase(
        supabase
          .from('email_campaign_steps')
          .select('campaign_id,step_key,step_number,subject,template_alias')
          .eq('campaign_id', campaignId)
          .order('step_number'),
        'load campaign steps fallback',
        [],
      )
      : stepViews
    const reportableMessages = await loadReportableMessages(supabase, campaignId)
    const businessEvents = await optionalSupabase(
      supabase.from('email_business_events').select('event_type').eq('campaign_id', campaignId),
      'load campaign business event stats',
      [],
    )
    const campaignBase = campaignView || campaignControl
    const campaign = campaignBase ? {
      ...campaignBase,
      ...summariseReportableMessages(reportableMessages),
      ...summariseBusinessEvents(businessEvents),
    } : null
    const steps = (fallbackSteps || []).map((step) => ({
      ...step,
      ...summariseReportableMessages(reportableMessages.filter((message) => message.step_key === step.step_key)),
    }))
    const enrollments = await optionalSupabase(
      supabase.from('email_enrollments').select('status,exit_reason').eq('campaign_id', campaignId),
      'load campaign enrollment control stats',
      [],
    )
    const jobs = await optionalSupabase(
      supabase.from('email_jobs').select('status,last_error').eq('campaign_id', campaignId).in('status', ['pending', 'processing', 'needs_attention']),
      'load campaign job control stats',
      [],
    )
    const control = {
      enabled: campaignControl?.enabled ?? campaign?.enabled ?? false,
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
    console.error('[campaign-stats] fatal analytics query failure', { campaign_id: campaignId, error: errorMessage(error) })
    return json(response, 500, { configured: true, error: 'analytics_query_failed' })
  }
}
