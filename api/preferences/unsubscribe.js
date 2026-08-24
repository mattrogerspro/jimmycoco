import { getSupabase } from '../_lib/supabase.js'
import { unsubscribeMarketingContact, verifyPreferencesToken } from '../_lib/preferences.js'

function html(response, status, title, message) {
  response.status(status)
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  return response.send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#eae2d8;color:#24211e;font-family:Arial,sans-serif}.card{box-sizing:border-box;max-width:620px;margin:10vh auto;padding:44px;background:#fbf8f3;border-radius:6px}h1{font-family:Georgia,serif;font-weight:400}p{font-size:17px;line-height:1.6}</style></head><body><main class="card"><h1>${title}</h1><p>${message}</p></main></body></html>`)
}

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST')
    return html(response, 405, 'Method not allowed', 'This preferences link only accepts a direct visit or one-click unsubscribe request.')
  }

  try {
    const { email } = verifyPreferencesToken(request.query?.token)
    await unsubscribeMarketingContact(getSupabase(), { email })
    return html(response, 200, 'You have been unsubscribed', 'We have stopped marketing email to this address. No further action is required.')
  } catch (error) {
    const invalid = error instanceof Error && error.message === 'invalid_preferences_token'
    return html(
      response,
      invalid ? 400 : 500,
      invalid ? 'This preferences link is invalid' : 'We could not update your preferences',
      invalid
        ? 'Please use the complete link from the email or contact partnerships@email.jimmycoco.pro.'
        : 'Please contact partnerships@email.jimmycoco.pro and we will remove you manually.',
    )
  }
}
