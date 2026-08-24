import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { json, normaliseEmail } from './http.js'
import { assertSupabase, getSupabase } from './supabase.js'

export const EMAIL_ADMIN_COOKIE = 'jc_email_admin_session'
export const EMAIL_ADMIN_MAX_AGE_SECONDS = 60 * 60 * 12

function publicSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) throw new Error('supabase_auth_not_configured')
  return { url, publishableKey }
}

function sessionSecret() {
  const secret = process.env.EMAIL_ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error('email_admin_session_secret_not_configured')
  return secret
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function sign(unsigned) {
  return crypto.createHmac('sha256', sessionSecret()).update(unsigned).digest('base64url')
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function cookieSecureFlag(request) {
  const host = String(request.headers.host || '')
  const proto = String(request.headers['x-forwarded-proto'] || '')
  return proto === 'https' || !/^localhost(?::\d+)?$/.test(host)
}

function serializeCookie(name, value, request, maxAge = EMAIL_ADMIN_MAX_AGE_SECONDS) {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]
  if (cookieSecureFlag(request)) parts.push('Secure')
  return parts.join('; ')
}

function readCookie(request, name) {
  const header = String(request.headers.cookie || '')
  const cookies = header.split(';').map((part) => part.trim()).filter(Boolean)
  for (const cookie of cookies) {
    const index = cookie.indexOf('=')
    if (index === -1) continue
    if (cookie.slice(0, index) === name) return decodeURIComponent(cookie.slice(index + 1))
  }
  return ''
}

export function createEmailAdminCookie(user, request) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: user.userId,
    email: user.email,
    display_name: user.displayName,
    role: 'super_admin',
    iat: now,
    exp: now + EMAIL_ADMIN_MAX_AGE_SECONDS,
  }
  const unsigned = base64UrlJson(payload)
  return serializeCookie(EMAIL_ADMIN_COOKIE, `${unsigned}.${sign(unsigned)}`, request)
}

export function clearEmailAdminCookie(request) {
  return serializeCookie(EMAIL_ADMIN_COOKIE, '', request, 0)
}

export function verifyEmailAdminCookieValue(value) {
  const [unsigned, signature, extra] = String(value || '').split('.')
  if (!unsigned || !signature || extra) return null
  if (!safeEqual(sign(unsigned), signature)) return null
  let payload
  try {
    payload = JSON.parse(Buffer.from(unsigned, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  const now = Math.floor(Date.now() / 1000)
  if (!payload || payload.role !== 'super_admin' || !payload.sub || !payload.exp || payload.exp <= now) return null
  return payload
}

export function readEmailAdminSession(request) {
  try {
    return verifyEmailAdminCookieValue(readCookie(request, EMAIL_ADMIN_COOKIE))
  } catch {
    return null
  }
}

export function requireEmailAdmin(request, response) {
  const session = readEmailAdminSession(request)
  if (!session) {
    json(response, 401, { error: 'email_admin_session_required' })
    return null
  }
  return session
}

export async function signInEmailAdmin(email, password) {
  const { url, publishableKey } = publicSupabaseConfig()
  const authClient = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
    email: normaliseEmail(email),
    password,
  })

  if (authError || !authData.user) throw new Error('invalid_credentials')

  const supabase = getSupabase()
  const profile = assertSupabase(await supabase
    .from('email_admin_profiles')
    .select('display_name,role,is_active')
    .eq('user_id', authData.user.id)
    .maybeSingle(), 'load email admin profile')

  if (!profile || !profile.is_active || profile.role !== 'super_admin') {
    throw new Error('email_admin_access_denied')
  }

  return {
    userId: authData.user.id,
    email: authData.user.email || normaliseEmail(email),
    displayName: profile.display_name,
    role: 'super_admin',
  }
}

export function publicSessionUser(session) {
  return {
    id: session.sub,
    email: session.email,
    display_name: session.display_name,
    role: session.role,
  }
}
