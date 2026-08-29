import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contactListItem, contactMessageSummary, safeContactId } from '../server/campaigns/contact-activity.js'

const routeSource = readFileSync(
  new URL('../server/campaigns/contact-activity.js', import.meta.url),
  'utf8',
)
const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('contact activity summarises delivered, opened and clicked messages without inferring activity', () => {
  const summary = contactMessageSummary([
    {
      queued_at: '2026-08-26T09:30:00.000Z',
      sent_at: '2026-08-26T09:31:00.000Z',
      delivered_at: '2026-08-26T09:31:05.000Z',
      first_opened_at: '2026-08-26T09:35:00.000Z',
      first_clicked_at: '2026-08-26T09:36:00.000Z',
    },
    {
      queued_at: '2026-08-27T09:30:00.000Z',
      sent_at: '2026-08-27T09:31:00.000Z',
      bounced_at: '2026-08-27T09:31:05.000Z',
    },
  ])

  assert.deepEqual(summary, {
    total: 2,
    sent: 2,
    delivered: 1,
    opened: 1,
    clicked: 1,
    bounced: 1,
    complained: 0,
    failed: 0,
    suppressed: 0,
    last_activity_at: '2026-08-27T09:31:00.000Z',
  })
})

test('contact activity exposes the live active enrolment rather than an older exited enrolment', () => {
  const contact = {
    id: '0c62d70a-fd95-46f3-9ad7-5b5754b96dc5',
    email: 'owner@example-salon.co.uk',
    business_name: 'Example Salon',
    market: 'UK',
    marketing_status: 'eligible',
    updated_at: '2026-08-26T09:00:00.000Z',
  }
  const listItem = contactListItem(contact, [
    { status: 'exited', next_step: 2, exit_reason: 'reply', updated_at: '2026-08-26T10:00:00.000Z' },
    { status: 'active', next_step: 1, next_send_at: '2026-08-27T09:30:00.000Z', updated_at: '2026-08-26T11:00:00.000Z' },
  ])

  assert.equal(listItem.enrollment_status, 'active')
  assert.equal(listItem.next_step, 1)
  assert.equal(listItem.next_send_at, '2026-08-27T09:30:00.000Z')
  assert.equal(listItem.exit_reason, null)
})

test('contact activity accepts only valid UUID contact identifiers', () => {
  assert.equal(safeContactId('0c62d70a-fd95-46f3-9ad7-5b5754b96dc5'), '0c62d70a-fd95-46f3-9ad7-5b5754b96dc5')
  assert.equal(safeContactId('not-a-contact-id'), '')
  assert.equal(safeContactId(''), '')
})

test('contact activity is super-admin protected and the Studio exposes a read-only contact reporting page', () => {
  assert.match(routeSource, /requireEmailAdmin\(request, response\)/)
  assert.match(routeSource, /from\('email_enrollments'\)/)
  assert.match(routeSource, /from\('email_messages'\)/)
  assert.match(routeSource, /from\('email_events'\)/)
  assert.match(routeSource, /from\('email_business_events'\)/)
  assert.match(routeSource, /from\('email_suppressions'\)/)
  assert.match(appSource, /id: 'contact-activity', label: 'Contact activity'/)
  assert.match(appSource, /currentView === 'contact-activity' && <ContactActivity \/>/)
  assert.doesNotMatch(appSource, /Review every contact with a sequence record/)
  assert.match(appSource, /showSearch=\{currentView !== 'contact-activity'\}/)
  assert.match(appSource, /showAdminPill=\{currentView !== 'contact-activity'\}/)
  assert.match(appSource, /compact=\{currentView === 'contact-activity'\}/)
  assert.match(appSource, /Email delivery history/)
  assert.match(appSource, /Contact events/)
})
