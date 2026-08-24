import test from 'node:test'
import assert from 'node:assert/strict'
import { assertInternalCanaryContact } from '../api/_lib/engine.js'

function canary(overrides = {}) {
  return {
    email: '360precision+uk-canary-20260824@gmail.com',
    marketing_status: 'eligible',
    properties: {
      source: 'Internal app-managed canary',
      lawful_basis: 'Internal test address controlled by the account owner; not a prospect',
      eligibility_decision: 'eligible',
    },
    ...overrides,
  }
}

test('targeted canary worker accepts only the exact verified internal alias', () => {
  const contact = canary()
  assert.equal(assertInternalCanaryContact(contact, contact.email), contact)
  assert.throws(() => assertInternalCanaryContact(contact, 'someone@example.com'), /canary_recipient_mismatch/)
  assert.throws(() => assertInternalCanaryContact(canary({ email: 'prospect@example.com' }), 'prospect@example.com'), /canary_recipient_not_internal_alias/)
  assert.throws(() => assertInternalCanaryContact(canary({ properties: { ...contact.properties, source: 'Purchased list' } }), contact.email), /canary_source_not_verified/)
})
