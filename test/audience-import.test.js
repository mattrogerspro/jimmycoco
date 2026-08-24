import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AUDIENCE_IMPORT_HEADERS,
  createAudiencePreviewToken,
  importConfirmationText,
  parseAudienceCsv,
  reconcileAudienceImport,
  validateAudienceImport,
  verifyAudiencePreviewToken,
} from '../api/_lib/audience-import.js'

const now = new Date('2026-08-24T08:00:00.000Z')
const startAt = '2026-08-25T09:00:00.000Z'

function csvRow(overrides = {}) {
  const row = {
    email: 'owner@example.com',
    first_name: 'Alex',
    business_name: 'Example Glow',
    business_type: 'Salon',
    market: 'UK',
    timezone: 'Europe/London',
    company_legal_entity_type: 'limited company',
    source: 'manual research',
    source_date: '2026-08-20',
    owner: 'Matt Rogers',
    eligibility_decision: 'eligible',
    eligibility_reason: 'Relevant established salon prospect',
    lawful_basis: 'Legitimate interests assessment JC-LIA-01',
    ...overrides,
  }
  return AUDIENCE_IMPORT_HEADERS.map((header) => {
    const value = String(row[header] ?? '')
    return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
  }).join(',')
}

function makeCsv(rows) {
  return `${AUDIENCE_IMPORT_HEADERS.join(',')}\n${rows.join('\n')}`
}

test('CSV parser handles quoted commas and escaped quotes', () => {
  const parsed = parseAudienceCsv(makeCsv([csvRow({ business_name: 'Glow, "Beauty" & Co' })]))
  assert.equal(parsed.records.length, 1)
  assert.equal(parsed.records[0].data.business_name, 'Glow, "Beauty" & Co')
})

test('validation requires an explicit zoned start and never infers eligibility from email alone', () => {
  assert.throws(() => validateAudienceImport({
    csv: makeCsv([csvRow()]),
    campaignId: 'uk-salon-stockist',
    startAt: '2026-08-25T10:00',
    now,
  }), /start_at_must_include_timezone/)

  const validation = validateAudienceImport({
    csv: makeCsv([csvRow({ eligibility_decision: '', eligibility_reason: '', lawful_basis: '' })]),
    campaignId: 'uk-salon-stockist',
    startAt,
    now,
  })
  const report = reconcileAudienceImport(validation)
  assert.equal(report.summary.final_eligible_count, 0)
  assert.equal(report.rows[0].outcome, 'invalid')
  assert.ok(report.rows[0].reasons.includes('eligibility_decision_required'))
  assert.ok(report.rows[0].reasons.includes('eligibility_reason_or_lawful_basis_required'))
})

test('dry run reports duplicates, customers, trials, suppressions, UK individuals and eligible contacts', () => {
  const csv = makeCsv([
    csvRow({ email: 'eligible@example.com', first_name: '' }),
    csvRow({ email: 'eligible@example.com' }),
    csvRow({ email: 'customer@example.com' }),
    csvRow({ email: 'trial@example.com' }),
    csvRow({ email: 'suppressed@example.com' }),
    csvRow({ email: 'sole@example.com', company_legal_entity_type: 'sole trader' }),
    csvRow({ email: 'existing@example.com' }),
    csvRow({ email: 'enrolled@example.com' }),
    csvRow({ email: 'review@example.com', eligibility_decision: 'review' }),
  ])
  const validation = validateAudienceImport({ csv, campaignId: 'uk-salon-stockist', startAt, now })
  const report = reconcileAudienceImport(validation, {
    existingContacts: new Map([
      ['existing@example.com', { marketing_status: 'unknown' }],
      ['suppressed@example.com', { marketing_status: 'unsubscribed' }],
    ]),
    existingCustomers: new Set(['customer@example.com']),
    existingTrialApplicants: new Set(['trial@example.com']),
    suppressions: new Set(['suppressed@example.com']),
    existingEnrollments: new Set(['enrolled@example.com']),
  })

  assert.deepEqual(report.summary, {
    total_records: 9,
    valid_records: 9,
    invalid_records: 0,
    duplicates: 1,
    existing_contacts: 2,
    existing_customers: 1,
    existing_trial_applicants: 1,
    suppressed_contacts: 1,
    uk_individual_subscribers: 1,
    already_enrolled: 1,
    final_eligible_count: 2,
  })
  assert.equal(report.rows[0].greeting_name, 'Salon Owner')
  assert.equal(report.rows.find((row) => row.email === 'sole@example.com').outcome, 'uk_individual_subscriber')
  assert.equal(report.rows.find((row) => row.email === 'review@example.com').outcome, 'not_marked_eligible')
})

test('US aliases normalise to the canonical US-West-Coast campaign market', () => {
  const validation = validateAudienceImport({
    csv: makeCsv([csvRow({
      email: 'us-owner@example.com',
      market: 'US',
      timezone: 'America/Los_Angeles',
      company_legal_entity_type: 'limited liability company',
    })]),
    campaignId: 'us-west-coast-salon-stockist',
    startAt,
    now,
  })
  const report = reconcileAudienceImport(validation)

  assert.equal(validation.campaign.market, 'US-West-Coast')
  assert.equal(report.rows[0].market, 'US-West-Coast')
  assert.equal(report.rows[0].outcome, 'eligible')
  assert.equal(report.summary.final_eligible_count, 1)
})

test('preview token binds the campaign, start, rows and current database result', () => {
  const validation = validateAudienceImport({
    csv: makeCsv([csvRow()]),
    campaignId: 'uk-salon-stockist',
    startAt,
    now,
  })
  const report = reconcileAudienceImport(validation)
  const token = createAudiencePreviewToken(report, 'test-secret', now)
  assert.equal(verifyAudiencePreviewToken(token, report, 'test-secret', new Date(now.getTime() + 1000)).campaign_id, 'uk-salon-stockist')
  assert.throws(() => verifyAudiencePreviewToken(token, { ...report, start_at: '2026-08-26T09:00:00.000Z' }, 'test-secret', now), /preview_out_of_date/)
  assert.throws(() => verifyAudiencePreviewToken(`${token}x`, report, 'test-secret', now), /preview_token_invalid/)
  assert.throws(() => verifyAudiencePreviewToken(token, report, 'test-secret', new Date(now.getTime() + (31 * 60 * 1000))), /preview_token_expired/)
  assert.equal(importConfirmationText(report.summary.final_eligible_count), 'IMPORT 1 CONTACTS')
})
