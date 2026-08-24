import crypto from 'node:crypto'
import { isEmail, normaliseEmail } from './http.js'
import { assertSupabase } from './supabase.js'

const TOKEN_VERSION = 1
const DEFAULT_BASE_URL = 'https://jimmycoco.email/api/preferences/unsubscribe'

function signingSecret() {
  const secret = process.env.EMAIL_PREFERENCES_SIGNING_SECRET
  if (!secret || secret.length < 32) throw new Error('email_preferences_signing_secret_not_configured')
  return secret
}

function signatureFor(encodedPayload) {
  return crypto.createHmac('sha256', signingSecret()).update(encodedPayload).digest('base64url')
}

export function createPreferencesToken(email) {
  const normalised = normaliseEmail(email)
  if (!isEmail(normalised)) throw new Error('valid_email_required')
  const payload = Buffer.from(JSON.stringify({ v: TOKEN_VERSION, email: normalised, scope: 'marketing' })).toString('base64url')
  return `${payload}.${signatureFor(payload)}`
}

export function verifyPreferencesToken(token) {
  const [encodedPayload, suppliedSignature, ...extra] = String(token || '').split('.')
  if (!encodedPayload || !suppliedSignature || extra.length) throw new Error('invalid_preferences_token')
  const expectedSignature = signatureFor(encodedPayload)
  const supplied = Buffer.from(suppliedSignature)
  const expected = Buffer.from(expectedSignature)
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) throw new Error('invalid_preferences_token')

  let payload
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
  } catch {
    throw new Error('invalid_preferences_token')
  }
  if (payload.v !== TOKEN_VERSION || payload.scope !== 'marketing' || !isEmail(payload.email)) throw new Error('invalid_preferences_token')
  return { email: normaliseEmail(payload.email), scope: payload.scope }
}

export function buildPreferencesUrl(email) {
  const baseUrl = process.env.EMAIL_PREFERENCES_BASE_URL || DEFAULT_BASE_URL
  let url
  try {
    url = new URL(baseUrl)
  } catch {
    throw new Error('invalid_email_preferences_base_url')
  }
  if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') throw new Error('email_preferences_base_url_must_use_https')
  url.searchParams.set('token', createPreferencesToken(email))
  return url.toString()
}

export async function unsubscribeMarketingContact(supabase, { email, source = 'signed_preferences_link' }) {
  const normalised = normaliseEmail(email)
  const suppression = await supabase.from('email_suppressions').upsert({
    email: normalised,
    scope: 'marketing',
    reason: 'unsubscribe',
    source,
    metadata: { contract: 'application_signed_preferences_v1' },
  }, { onConflict: 'email,scope' })
  assertSupabase(suppression, 'store signed preference suppression')

  const contactUpdate = await supabase.from('email_contacts').update({ marketing_status: 'unsubscribed' }).eq('email', normalised)
  assertSupabase(contactUpdate, 'mark contact unsubscribed')

  const externalId = `signed-preferences/${crypto.createHash('sha256').update(normalised).digest('hex')}`
  const exited = await supabase.rpc('exit_email_enrollments', {
    p_email: normalised,
    p_reason: 'unsubscribe',
    p_event_type: 'unsubscribe',
    p_external_event_id: externalId,
    p_data: { source },
  })
  return assertSupabase(exited, 'exit signed preference enrollments') || 0
}
