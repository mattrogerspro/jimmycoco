const COOKIE_NAME = 'jc_email_admin_session'

export const config = {
  matcher: ['/((?!api/auth/|api/cron/|api/webhooks/|api/preferences/|email-assets/|assets/|favicon.ico|robots.txt).*)'],
}

function shouldProtectHost(host) {
  return process.env.EMAIL_ADMIN_GUARD_ALL === 'true' || /(^|\.)jimmycoco\.email(?::\d+)?$/i.test(host)
}

function readCookie(header, name) {
  return String(header || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((found, cookie) => {
      if (found) return found
      const index = cookie.indexOf('=')
      if (index === -1) return ''
      return cookie.slice(0, index) === name ? decodeURIComponent(cookie.slice(index + 1)) : ''
    }, '')
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function base64UrlEncode(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function hmac(unsigned, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return base64UrlEncode(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned)))
}

async function hasValidSession(request) {
  const secret = process.env.EMAIL_ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) return false
  const [unsigned, signature, extra] = readCookie(request.headers.get('cookie'), COOKIE_NAME).split('.')
  if (!unsigned || !signature || extra) return false
  if (await hmac(unsigned, secret) !== signature) return false

  let payload
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(unsigned)))
  } catch {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return Boolean(payload?.sub && payload.role === 'super_admin' && payload.exp && payload.exp > now)
}

export default async function middleware(request) {
  const url = new URL(request.url)
  if (url.pathname === '/login') return undefined
  if (!shouldProtectHost(request.headers.get('host') || '')) return undefined
  if (await hasValidSession(request)) return undefined

  const loginUrl = new URL('/login', url)
  loginUrl.searchParams.set('next', `${url.pathname}${url.search}${url.hash}`)
  return Response.redirect(loginUrl, 302)
}
