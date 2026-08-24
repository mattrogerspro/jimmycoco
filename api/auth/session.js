import { allowMethods, json } from '../_lib/http.js'
import { publicSessionUser, readEmailAdminSession } from '../_lib/email-auth.js'

export default function handler(request, response) {
  if (!allowMethods(request, response, ['GET'])) return
  const session = readEmailAdminSession(request)
  if (!session) return json(response, 401, { authenticated: false })
  return json(response, 200, { authenticated: true, user: publicSessionUser(session) })
}
