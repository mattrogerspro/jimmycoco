import { requireEmailAdmin } from '../_lib/email-auth.js'
import { allowMethods, json } from '../_lib/http.js'
import { assertSupabase, getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

const IMPORT_COLUMNS = [
  'id',
  'campaign_id',
  'source_file',
  'operator',
  'start_at',
  'status',
  'total_records',
  'preview_eligible_records',
  'enrolled_contacts',
  'existing_enrollments',
  'excluded_at_commit',
  'result',
  'created_at',
  'completed_at',
].join(',')

const IMPORT_ROW_COLUMNS = [
  'import_id',
  'row_number',
  'email',
  'outcome',
  'reasons',
  'contact_id',
  'enrollment_id',
  'payload',
  'created_at',
].join(',')

const safeCampaignId = (value) => String(value || '').trim().slice(0, 120)
const safeImportId = (value) => String(value || '').trim().slice(0, 120)

export function audienceImportSummary(record) {
  if (!record) return null
  return {
    id: record.id,
    campaign_id: record.campaign_id,
    source_file: record.source_file,
    operator: record.operator,
    start_at: record.start_at,
    status: record.status,
    total_records: Number(record.total_records || 0),
    preview_eligible_records: Number(record.preview_eligible_records || 0),
    enrolled_contacts: Number(record.enrolled_contacts || 0),
    existing_enrollments: Number(record.existing_enrollments || 0),
    excluded_at_commit: Number(record.excluded_at_commit || 0),
    created_at: record.created_at,
    completed_at: record.completed_at,
  }
}

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['GET']) || !requireEmailAdmin(request, response)) return
  if (!isSupabaseConfigured()) return json(response, 503, { configured: false, error: 'audience_import_history_not_configured' })

  const campaignId = safeCampaignId(request.query.campaign_id)
  const requestedImportId = safeImportId(request.query.import_id)

  try {
    const supabase = getSupabase()
    let importsQuery = supabase
      .from('email_audience_imports')
      .select(IMPORT_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(50)
    if (campaignId) importsQuery = importsQuery.eq('campaign_id', campaignId)

    const imports = assertSupabase(await importsQuery, 'load audience import history') || []
    let selectedImport = requestedImportId ? imports.find((record) => record.id === requestedImportId) || null : imports[0] || null

    if (requestedImportId && !selectedImport) {
      const selectedQuery = assertSupabase(await supabase
        .from('email_audience_imports')
        .select(IMPORT_COLUMNS)
        .eq('id', requestedImportId)
        .maybeSingle(), 'load selected audience import')
      if (selectedQuery && (!campaignId || selectedQuery.campaign_id === campaignId)) selectedImport = selectedQuery
    }

    const rows = selectedImport
      ? assertSupabase(await supabase
        .from('email_audience_import_rows')
        .select(IMPORT_ROW_COLUMNS)
        .eq('import_id', selectedImport.id)
        .order('row_number', { ascending: true })
        .limit(5000), 'load audience import rows') || []
      : []

    return json(response, 200, {
      configured: true,
      imports: imports.map(audienceImportSummary),
      selected_import: audienceImportSummary(selectedImport),
      rows,
      refreshed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Audience import history failed', { error: error instanceof Error ? error.message : String(error) })
    return json(response, 500, { configured: true, error: 'audience_import_history_query_failed' })
  }
}

export { IMPORT_COLUMNS, IMPORT_ROW_COLUMNS }
