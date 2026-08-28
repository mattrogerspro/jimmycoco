import { allowMethods, json } from '../_lib/http.js'
import { clearEmailAdminCookie } from '../_lib/email-auth.js'

export default function handler(request, response) {
  if (!allowMethods(request, response, ['POST'])) return
  response.setHeader('Set-Cookie', clearEmailAdminCookie(request))
  return json(response, 200, { ok: true })
}
