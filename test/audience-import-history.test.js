import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { audienceImportSummary } from '../api/campaigns/audience-import-history.js'

const routeSource = readFileSync(
  new URL('../api/campaigns/audience-import-history.js', import.meta.url),
  'utf8',
)
const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('audience import history exposes only the immutable audit fields needed by the Studio', () => {
  const summary = audienceImportSummary({
    id: 'import-1',
    campaign_id: 'uk-salon-stockist',
    source_file: 'uk-salons.csv',
    operator: 'Matt Rogers',
    start_at: '2026-08-26T09:00:00.000Z',
    status: 'completed',
    total_records: '134',
    preview_eligible_records: '134',
    enrolled_contacts: '132',
    existing_enrollments: '1',
    excluded_at_commit: '1',
    created_at: '2026-08-25T09:00:00.000Z',
    completed_at: '2026-08-25T09:01:00.000Z',
    result: { sensitive: 'not exposed' },
  })

  assert.deepEqual(summary, {
    id: 'import-1',
    campaign_id: 'uk-salon-stockist',
    source_file: 'uk-salons.csv',
    operator: 'Matt Rogers',
    start_at: '2026-08-26T09:00:00.000Z',
    status: 'completed',
    total_records: 134,
    preview_eligible_records: 134,
    enrolled_contacts: 132,
    existing_enrollments: 1,
    excluded_at_commit: 1,
    created_at: '2026-08-25T09:00:00.000Z',
    completed_at: '2026-08-25T09:01:00.000Z',
  })
})

test('audience import history is super-admin protected and retrieves audited rows by the selected import', () => {
  assert.match(routeSource, /requireEmailAdmin\(request, response\)/)
  assert.match(routeSource, /from\('email_audience_imports'\)/)
  assert.match(routeSource, /from\('email_audience_import_rows'\)/)
  assert.match(routeSource, /eq\('import_id', selectedImport\.id\)/)
  assert.match(routeSource, /order\('row_number', \{ ascending: true \}\)/)
  assert.match(routeSource, /from\('email_enrollments'\)/)
  assert.match(routeSource, /live_next_send_at/)
})

test('Studio navigation exposes the imported audience audit screen with outcome filtering', () => {
  assert.match(appSource, /id: 'audience-imports', label: 'Imported audience'/)
  assert.match(appSource, /currentView === 'audience-imports' && <AudienceImportHistory \/>/)
  assert.match(appSource, /Contact decisions/)
  assert.match(appSource, /Imported \/ already enrolled/)
  assert.match(appSource, /Live next send/)
  assert.match(appSource, /Original import schedule/)
})
