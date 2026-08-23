import crypto from 'node:crypto'

const tokenVersion = 'v1'

function unsubscribeSecret() {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET
  if (!secret) throw new Error('email_unsubscribe_secret_not_configured')
  return secret
}

function signature(messageId) {
  return crypto
    .createHmac('sha256', unsubscribeSecret())
    .update(`email-unsubscribe:${tokenVersion}:${messageId}`)
    .digest('base64url')
}

export function createUnsubscribeUrl(messageId) {
  if (!messageId) throw new Error('unsubscribe_message_id_required')
  const base = String(process.env.EMAIL_PUBLIC_BASE_URL || process.env.AUTOMATION_API_BASE_URL || 'https://www.jimmycoco.email').replace(/\/$/, '')
  const url = new URL('/api/email/unsubscribe', base)
  url.searchParams.set('message', messageId)
  url.searchParams.set('token', signature(messageId))
  return url.toString()
}

export function verifyUnsubscribeToken(messageId, token) {
  if (!messageId || !token) return false
  const expected = Buffer.from(signature(messageId))
  const supplied = Buffer.from(String(token))
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied)
}
