//logininjspai
import { allowMethods, isEmail, json, readJson } from '../_lib/http.js'
import { createEmailAdminCookie, publicSessionUser, signInEmailAdmin } from '../_lib/email-auth.js'

function loginError(error) {
  const message = error instanceof Error ? error.message : String(error)
  if (message === 'invalid_credentials') return { status: 400, error: 'invalid_credentials' }
  if (message === 'email_admin_access_denied') return { status: 403, error: 'email_admin_access_denied' }
  if (message.includes('email_admin_profiles')) return { status: 503, error: 'email_admin_access_migration_not_applied' }
  if (message.includes('supabase_auth_not_configured')) return { status: 503, error: 'supabase_auth_not_configured' }
  if (message.includes('email_admin_session_secret_not_configured')) return { status: 503, error: 'email_admin_session_secret_not_configured' }
  return { status: 500, error: 'email_admin_login_failed' }
}

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST'])) return

  try {
    const body = await readJson(request)
    if (!isEmail(body.email) || typeof body.password !== 'string' || !body.password) {
      return json(response, 422, { error: 'email_and_password_required' })
    }

    const user = await signInEmailAdmin(body.email, body.password)
    response.setHeader('Set-Cookie', createEmailAdminCookie(user, request))
    return json(response, 200, { user: publicSessionUser({
      sub: user.userId,
      email: user.email,
      display_name: user.displayName,
      role: user.role,
    }) })
  } catch (error) {
    const result = loginError(error)
    return json(response, result.status, { error: result.error })
  }
}
