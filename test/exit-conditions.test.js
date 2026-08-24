import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migration = readFileSync(
  new URL('../supabase/migrations/20260824092015_wire_email_exit_conditions.sql', import.meta.url),
  'utf8',
)

const engine = readFileSync(new URL('../api/_lib/engine.js', import.meta.url), 'utf8')
const webhookEvents = readFileSync(new URL('../api/_lib/webhook-events.js', import.meta.url), 'utf8')
const killSwitchApi = readFileSync(new URL('../api/campaigns/kill-switch.js', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('exit-condition migration wires site events to outreach exits', () => {
  assert.match(migration, /marketing_status in \('unknown', 'eligible', 'unsubscribed', 'ineligible'\)/)
  assert.match(migration, /create or replace function public\.exit_email_contact_outreach/)
  assert.match(migration, /reseller_applications_exit_email_outreach/)
  assert.match(migration, /'trial_requested'/)
  assert.match(migration, /reseller_orders_exit_email_outreach/)
  assert.match(migration, /'opening_order_placed'/)
  assert.match(migration, /resellers_exit_email_outreach/)
  assert.match(migration, /'existing_customer'/)
  assert.match(migration, /email_suppressions_exit_email_outreach/)
  assert.match(migration, /email_contacts_exit_email_outreach/)
  assert.match(migration, /'ineligible'/)
  assert.match(migration, /status in \('active', 'paused', 'needs_attention'\)/)
  assert.match(migration, /grant execute on function public\.exit_email_contact_outreach[\s\S]+to service_role/)
})

test('worker rechecks suppression and eligibility before reserving a send', () => {
  assert.match(engine, /async function validateContactCanReceive/)
  assert.match(engine, /currentContactForSend/)
  assert.match(engine, /suppressionFor\(current, classification\)/)
  assert.match(engine, /marketing_status[\s\S]+ineligible/)
  assert.match(engine, /pre_send_exit:/)
  assert.match(engine, /exit_email_enrollments/)
  assert.match(engine, /cancel lifecycle job before send/)
})

test('worker rechecks campaign kill switches before reserving a send', () => {
  assert.match(engine, /async function validateCampaignCanSend/)
  assert.match(engine, /EMAIL_LIVE_MODE|email_live_mode_disabled/)
  assert.match(engine, /check campaign kill switch/)
  assert.match(engine, /campaign_disabled_in_database/)
  assert.match(engine, /pauseEnrollmentForCampaignSwitch/)
  assert.match(engine, /status: 'paused'/)
  assert.match(engine, /releaseJobForCampaignSwitch/)
  assert.match(engine, /campaign_paused:/)
})

test('admin kill switch endpoint and UI are bearer-protected and campaign-scoped', () => {
  assert.match(killSwitchApi, /requireBearer/)
  assert.match(killSwitchApi, /email_campaigns/)
  assert.match(killSwitchApi, /enabled: body\.enabled/)
  assert.match(killSwitchApi, /kill_switch/)
  assert.match(killSwitchApi, /email_enrollments/)
  assert.match(app, /function CampaignKillSwitch/)
  assert.match(app, /Kill campaign now/)
  assert.match(app, /Re-enable database gate/)
  assert.match(app, /\/api\/campaigns\/kill-switch/)
})

test('resend webhook can process inbound replies without unsafe template fallback', () => {
  assert.doesNotMatch(webhookEvents, /step\.templateId/)
  assert.match(webhookEvents, /function emailFrom/)
  assert.match(webhookEvents, /event\.type === 'email\.received'/)
  assert.match(webhookEvents, /p_reason: 'reply'/)
  assert.match(webhookEvents, /emailFrom\(event\.data\?\.to\)/)
})
