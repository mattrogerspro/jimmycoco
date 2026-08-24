import {
  audienceImportRowsForDatabase,
  createAudiencePreviewToken,
  importConfirmationText,
  previewDigest,
  reconcileAudienceImport,
  validateAudienceImport,
  verifyAudiencePreviewToken,
} from '../_lib/audience-import.js'
import { requireEmailAdmin } from '../_lib/email-auth.js'
import { allowMethods, json, readJson } from '../_lib/http.js'
import { assertSupabase, getSupabase, oneRow } from '../_lib/supabase.js'

const signingSecret = () => process.env.AUDIENCE_IMPORT_SIGNING_SECRET

const safeFileName = (value) => String(value || 'audience.csv').trim().slice(0, 240) || 'audience.csv'

const reportRowsForResponse = (rows) => rows.map((row) => ({
  row_number: row.row_number,
  email: row.email,
  business_name: row.business_name,
  market: row.market,
  outcome: row.outcome,
  reasons: row.reasons,
  existing_contact: row.existing_contact,
}))

async function loadDatabaseState(supabase, campaignId, emails) {
  if (!emails.length) return {}
  const data = assertSupabase(await supabase.rpc('preview_email_audience_state', {
    p_campaign_id: campaignId,
    p_emails: emails,
  }), 'load audience eligibility state') || []

  return {
    existingContacts: new Map(data.filter((row) => row.existing_contact).map((row) => [row.email, { marketing_status: row.marketing_status }])),
    existingCustomers: new Set(data.filter((row) => row.existing_customer).map((row) => row.email)),
    existingTrialApplicants: new Set(data.filter((row) => row.existing_trial_applicant).map((row) => row.email)),
    suppressions: new Set(data.filter((row) => row.suppressed).map((row) => row.email)),
    existingEnrollments: new Set(data.filter((row) => row.already_enrolled).map((row) => row.email)),
  }
}

async function buildReport(body, supabase) {
  const validation = validateAudienceImport({
    csv: body.csv,
    campaignId: body.campaign_id,
    startAt: body.start_at,
  })
  const emails = [...new Set(validation.rows.map((row) => row.email).filter(Boolean))]
  const databaseState = await loadDatabaseState(supabase, validation.campaign_id, emails)
  return reconcileAudienceImport(validation, databaseState)
}

function importerError(error) {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('audience_import_signing_secret_not_configured')) return { status: 503, error: 'audience_import_signing_secret_not_configured' }
  if (message.includes('load audience eligibility state') && message.includes('preview_email_audience_state')) return { status: 503, error: 'audience_import_migration_not_applied' }
  if (message.includes('commit audience import') && message.includes('commit_email_audience_import')) return { status: 503, error: 'audience_import_migration_not_applied' }
  if (message.startsWith('csv_') || message.includes('_required') || message.startsWith('start_at_') || message === 'valid_start_at_required') {
    return { status: 422, error: message }
  }
  if (['preview_token_invalid', 'preview_token_expired', 'preview_out_of_date'].includes(message)) return { status: 409, error: message }
  return { status: 500, error: 'internal_error' }
}

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST']) || !requireEmailAdmin(request, response)) return

  try {
    const body = await readJson(request)
    if (!['preview', 'commit'].includes(body.action)) return json(response, 422, { error: 'action_must_be_preview_or_commit' })

    const supabase = getSupabase()
    const report = await buildReport(body, supabase)
    const confirmation = importConfirmationText(report.summary.final_eligible_count)

    if (body.action === 'preview') {
      return json(response, 200, {
        mode: 'dry_run',
        campaign_id: report.campaign_id,
        campaign_market: report.campaign.market,
        campaign_timezone: report.campaign.timezone,
        start_at: report.start_at,
        summary: report.summary,
        rows: reportRowsForResponse(report.rows),
        confirmation_text: confirmation,
        preview_token: createAudiencePreviewToken(report, signingSecret()),
      })
    }

    if (body.confirmed !== true) return json(response, 422, { error: 'final_confirmation_required' })
    if (String(body.confirmation || '').trim() !== confirmation) return json(response, 422, { error: 'confirmation_text_does_not_match', expected: confirmation })
    const operator = String(body.operator || '').trim()
    if (!operator) return json(response, 422, { error: 'operator_required' })
    if (!report.summary.final_eligible_count) return json(response, 409, { error: 'no_eligible_contacts' })

    verifyAudiencePreviewToken(body.preview_token, report, signingSecret())
    const digest = previewDigest(report)
    const result = oneRow(assertSupabase(await supabase.rpc('commit_email_audience_import', {
      p_campaign_id: report.campaign_id,
      p_start_at: report.start_at,
      p_rows: audienceImportRowsForDatabase(report),
      p_import_key: digest,
      p_preview_digest: digest,
      p_source_file: safeFileName(body.file_name),
      p_operator: operator,
    }), 'commit audience import'))

    return json(response, 201, {
      mode: 'committed',
      campaign_id: report.campaign_id,
      start_at: report.start_at,
      import: result,
    })
  } catch (error) {
    const result = importerError(error)
    return json(response, result.status, { error: result.error })
  }
}

export { buildReport, loadDatabaseState }
