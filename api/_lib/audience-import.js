import crypto from 'node:crypto'
import { isEmail, normaliseEmail } from './http.js'

export const AUDIENCE_IMPORT_CAMPAIGNS = Object.freeze({
  'uk-salon-stockist': { market: 'UK', timezone: 'Europe/London' },
  'us-west-coast-salon-stockist': { market: 'US', timezone: 'America/Los_Angeles' },
})

export const AUDIENCE_IMPORT_MAX_ROWS = 5000
export const AUDIENCE_IMPORT_MAX_BYTES = 2_500_000

export const AUDIENCE_IMPORT_HEADERS = Object.freeze([
  'email',
  'first_name',
  'business_name',
  'business_type',
  'market',
  'timezone',
  'company_legal_entity_type',
  'source',
  'source_date',
  'owner',
  'eligibility_decision',
  'eligibility_reason',
  'lawful_basis',
])

const requiredHeaders = AUDIENCE_IMPORT_HEADERS.filter((header) => !['first_name', 'eligibility_reason', 'lawful_basis'].includes(header))
const individualSubscriberTypes = new Set(['individual', 'sole_trader', 'unincorporated_partnership'])
const eligibilityDecisions = new Set(['eligible', 'ineligible', 'review'])
const legalEntityAliases = new Map([
  ['limited company', 'limited_company'],
  ['limited_company', 'limited_company'],
  ['ltd', 'limited_company'],
  ['public limited company', 'public_company'],
  ['public_limited_company', 'public_company'],
  ['plc', 'public_company'],
  ['limited liability partnership', 'limited_liability_partnership'],
  ['limited_liability_partnership', 'limited_liability_partnership'],
  ['llp', 'limited_liability_partnership'],
  ['corporation', 'corporation'],
  ['corp', 'corporation'],
  ['c corporation', 'corporation'],
  ['c_corporation', 'corporation'],
  ['s corporation', 'corporation'],
  ['s_corporation', 'corporation'],
  ['professional corporation', 'corporation'],
  ['professional_corporation', 'corporation'],
  ['limited liability company', 'limited_liability_company'],
  ['limited_liability_company', 'limited_liability_company'],
  ['llc', 'limited_liability_company'],
  ['public company', 'public_company'],
  ['public_company', 'public_company'],
  ['sole trader', 'sole_trader'],
  ['sole_trader', 'sole_trader'],
  ['sole proprietor', 'sole_trader'],
  ['sole_proprietor', 'sole_trader'],
  ['individual', 'individual'],
  ['unincorporated partnership', 'unincorporated_partnership'],
  ['unincorporated_partnership', 'unincorporated_partnership'],
  ['charity', 'charity'],
  ['nonprofit', 'nonprofit'],
  ['non-profit', 'nonprofit'],
  ['non_profit', 'nonprofit'],
  ['other', 'other'],
  ['unknown', 'unknown'],
])

const normaliseHeader = (value) => String(value || '')
  .replace(/^\ufeff/, '')
  .trim()
  .toLowerCase()
  .replace(/[\s-]+/g, '_')

const normaliseText = (value) => String(value || '').trim()

const normaliseMarket = (value) => {
  const market = normaliseText(value).toUpperCase().replaceAll('.', '')
  if (['UK', 'UNITED KINGDOM', 'GB', 'GREAT BRITAIN'].includes(market)) return 'UK'
  if (['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA'].includes(market)) return 'US'
  return market
}

const isTimezone = (value) => {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

const isIsoDate = (value, now = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false
  return parsed.getTime() <= now.getTime()
}

export function parseAudienceCsv(csv) {
  if (typeof csv !== 'string' || !csv.trim()) throw new Error('csv_required')
  if (Buffer.byteLength(csv, 'utf8') > AUDIENCE_IMPORT_MAX_BYTES) throw new Error('csv_too_large')

  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
      continue
    }

    if (character === '"') {
      if (field.length) throw new Error('csv_invalid_quote')
      quoted = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (quoted) throw new Error('csv_unclosed_quote')
  row.push(field.replace(/\r$/, ''))
  rows.push(row)

  while (rows.length && rows.at(-1).every((value) => !normaliseText(value))) rows.pop()
  if (rows.length < 2) throw new Error('csv_has_no_records')

  const headers = rows[0].map(normaliseHeader)
  const duplicates = headers.filter((header, index) => header && headers.indexOf(header) !== index)
  if (duplicates.length) throw new Error(`csv_duplicate_headers:${[...new Set(duplicates)].join(',')}`)
  const missing = requiredHeaders.filter((header) => !headers.includes(header))
  if (!headers.includes('eligibility_reason') && !headers.includes('lawful_basis')) missing.push('eligibility_reason_or_lawful_basis')
  if (missing.length) throw new Error(`csv_missing_headers:${missing.join(',')}`)

  const records = rows.slice(1).filter((values) => values.some((value) => normaliseText(value))).map((values, index) => {
    const data = {}
    headers.forEach((header, column) => {
      if (header) data[header] = values[column] ?? ''
    })
    return { row_number: index + 2, data, extra_columns: Math.max(0, values.length - headers.length) }
  })

  if (records.length > AUDIENCE_IMPORT_MAX_ROWS) throw new Error('csv_too_many_records')
  return { headers, records }
}

function validateRecord(record, campaign, now) {
  const data = record.data
  const email = normaliseEmail(data.email)
  const market = normaliseMarket(data.market)
  const legalEntityInput = normaliseText(data.company_legal_entity_type).toLowerCase()
  const companyLegalEntityType = legalEntityAliases.get(legalEntityInput) || legalEntityInput.replace(/[\s-]+/g, '_')
  const eligibilityDecision = normaliseText(data.eligibility_decision).toLowerCase()
  const eligibilityReason = normaliseText(data.eligibility_reason)
  const lawfulBasis = normaliseText(data.lawful_basis)
  const firstName = normaliseText(data.first_name)
  const fieldErrors = []

  if (!isEmail(email)) fieldErrors.push('valid_email_required')
  for (const field of ['business_name', 'business_type', 'market', 'timezone', 'company_legal_entity_type', 'source', 'source_date', 'owner', 'eligibility_decision']) {
    if (!normaliseText(data[field])) fieldErrors.push(`${field}_required`)
  }
  if (record.extra_columns) fieldErrors.push('unexpected_extra_columns')
  if (!eligibilityDecisions.has(eligibilityDecision)) fieldErrors.push('eligibility_decision_must_be_eligible_ineligible_or_review')
  if (!eligibilityReason && !lawfulBasis) fieldErrors.push('eligibility_reason_or_lawful_basis_required')
  if (!legalEntityAliases.has(legalEntityInput) || ['unknown', 'other'].includes(companyLegalEntityType)) fieldErrors.push('specific_company_legal_entity_type_required')
  if (data.timezone && !isTimezone(normaliseText(data.timezone))) fieldErrors.push('valid_iana_timezone_required')
  if (data.source_date && !isIsoDate(normaliseText(data.source_date), now)) fieldErrors.push('source_date_must_be_valid_and_not_in_future')

  return {
    row_number: record.row_number,
    email,
    first_name: firstName || null,
    greeting_name: firstName || 'Salon Owner',
    business_name: normaliseText(data.business_name),
    business_type: normaliseText(data.business_type),
    market,
    timezone: normaliseText(data.timezone),
    company_legal_entity_type: companyLegalEntityType,
    source: normaliseText(data.source),
    source_date: normaliseText(data.source_date),
    owner: normaliseText(data.owner),
    eligibility_decision: eligibilityDecision,
    eligibility_reason: eligibilityReason || null,
    lawful_basis: lawfulBasis || null,
    campaign_market: campaign.market,
    field_errors: fieldErrors,
  }
}

export function validateAudienceImport({ csv, campaignId, startAt, now = new Date() }) {
  const campaign = AUDIENCE_IMPORT_CAMPAIGNS[campaignId]
  if (!campaign) throw new Error('audience_import_campaign_required')
  const normalisedStartAt = normaliseImportStart(startAt, now)
  const parsed = parseAudienceCsv(csv)
  const rows = parsed.records.map((record) => validateRecord(record, campaign, now))
  return { campaign, campaign_id: campaignId, start_at: normalisedStartAt, headers: parsed.headers, rows }
}

export function normaliseImportStart(value, now = new Date()) {
  const raw = normaliseText(value)
  if (!raw || !/(?:z|[+-]\d{2}:\d{2})$/i.test(raw)) throw new Error('start_at_must_include_timezone')
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) throw new Error('valid_start_at_required')
  if (parsed.getTime() < now.getTime() + (5 * 60 * 1000)) throw new Error('start_at_must_be_at_least_five_minutes_in_future')
  return parsed.toISOString()
}

const emptyState = () => ({
  existingContacts: new Map(),
  existingCustomers: new Set(),
  existingTrialApplicants: new Set(),
  suppressions: new Set(),
  existingEnrollments: new Set(),
})

export function reconcileAudienceImport(validation, databaseState = emptyState()) {
  const state = { ...emptyState(), ...databaseState }
  const seen = new Set()
  const rows = validation.rows.map((row) => {
    const reasons = [...row.field_errors]
    let outcome = reasons.length ? 'invalid' : null
    const isDuplicate = Boolean(row.email && seen.has(row.email))
    if (row.email) seen.add(row.email)

    const existingContact = state.existingContacts.get(row.email) || null
    const isCustomer = state.existingCustomers.has(row.email)
    const isTrialApplicant = state.existingTrialApplicants.has(row.email)
    const isSuppressed = state.suppressions.has(row.email) || existingContact?.marketing_status === 'unsubscribed'
    const isUkIndividual = row.market === 'UK' && individualSubscriberTypes.has(row.company_legal_entity_type)
    const isExistingEnrollment = state.existingEnrollments.has(row.email)

    if (!outcome && isDuplicate) outcome = 'duplicate'
    if (!outcome && isCustomer) outcome = 'existing_customer'
    if (!outcome && isTrialApplicant) outcome = 'existing_trial_applicant'
    if (!outcome && isSuppressed) outcome = 'suppressed'
    if (!outcome && isUkIndividual) outcome = 'uk_individual_subscriber'
    if (!outcome && row.market !== validation.campaign.market) outcome = 'market_mismatch'
    if (!outcome && row.eligibility_decision !== 'eligible') outcome = 'not_marked_eligible'
    if (!outcome && isExistingEnrollment) outcome = 'already_enrolled'
    if (!outcome) outcome = 'eligible'

    if (outcome !== 'eligible' && !reasons.length) reasons.push(outcome)
    return {
      ...row,
      outcome,
      reasons,
      existing_contact: Boolean(existingContact),
      existing_customer: isCustomer,
      existing_trial_applicant: isTrialApplicant,
      suppressed: isSuppressed,
      uk_individual_subscriber: isUkIndividual,
      already_enrolled: isExistingEnrollment,
    }
  })

  const count = (predicate) => rows.filter(predicate).length
  const summary = {
    total_records: rows.length,
    valid_records: count((row) => row.outcome !== 'invalid'),
    invalid_records: count((row) => row.outcome === 'invalid'),
    duplicates: count((row) => row.outcome === 'duplicate'),
    existing_contacts: count((row) => row.existing_contact),
    existing_customers: count((row) => row.existing_customer),
    existing_trial_applicants: count((row) => row.existing_trial_applicant),
    suppressed_contacts: count((row) => row.suppressed),
    uk_individual_subscribers: count((row) => row.uk_individual_subscriber),
    already_enrolled: count((row) => row.already_enrolled),
    final_eligible_count: count((row) => row.outcome === 'eligible'),
  }

  return { ...validation, rows, summary }
}

export function previewDigest(report) {
  const material = {
    campaign_id: report.campaign_id,
    start_at: report.start_at,
    summary: report.summary,
    rows: report.rows.map((row) => ({
      row_number: row.row_number,
      email: row.email,
      outcome: row.outcome,
      reasons: row.reasons,
      first_name: row.first_name,
      greeting_name: row.greeting_name,
      business_name: row.business_name,
      business_type: row.business_type,
      market: row.market,
      timezone: row.timezone,
      company_legal_entity_type: row.company_legal_entity_type,
      source: row.source,
      source_date: row.source_date,
      owner: row.owner,
      eligibility_decision: row.eligibility_decision,
      eligibility_reason: row.eligibility_reason,
      lawful_basis: row.lawful_basis,
    })),
  }
  return crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex')
}

export function createAudiencePreviewToken(report, secret, now = new Date()) {
  if (!secret) throw new Error('audience_import_signing_secret_not_configured')
  const payload = Buffer.from(JSON.stringify({
    version: 1,
    campaign_id: report.campaign_id,
    start_at: report.start_at,
    digest: previewDigest(report),
    expires_at: now.getTime() + (30 * 60 * 1000),
  })).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyAudiencePreviewToken(token, report, secret, now = new Date()) {
  if (!secret) throw new Error('audience_import_signing_secret_not_configured')
  const [payload, suppliedSignature, extra] = String(token || '').split('.')
  if (!payload || !suppliedSignature || extra) throw new Error('preview_token_invalid')
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  const supplied = Buffer.from(suppliedSignature)
  const expected = Buffer.from(expectedSignature)
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) throw new Error('preview_token_invalid')

  let decoded
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    throw new Error('preview_token_invalid')
  }
  if (decoded.version !== 1 || decoded.expires_at < now.getTime()) throw new Error('preview_token_expired')
  if (decoded.campaign_id !== report.campaign_id || decoded.start_at !== report.start_at || decoded.digest !== previewDigest(report)) {
    throw new Error('preview_out_of_date')
  }
  return decoded
}

export function importConfirmationText(eligibleCount) {
  return `IMPORT ${Number(eligibleCount || 0)} CONTACTS`
}

export function audienceImportRowsForDatabase(report) {
  return report.rows.map((row) => ({
    row_number: row.row_number,
    email: row.email || null,
    outcome: row.outcome,
    reasons: row.reasons,
    first_name: row.first_name,
    greeting_name: row.greeting_name,
    business_name: row.business_name,
    business_type: row.business_type,
    market: row.market,
    timezone: row.timezone,
    company_legal_entity_type: row.company_legal_entity_type,
    source: row.source,
    source_date: row.source_date,
    owner: row.owner,
    eligibility_decision: row.eligibility_decision,
    eligibility_reason: row.eligibility_reason,
    lawful_basis: row.lawful_basis,
  }))
}
