import { json } from './_lib/http.js'
import { isLiveMode } from './_lib/resend.js'
import { isSupabaseConfigured } from './_lib/supabase.js'

export default function handler(_request, response) {
  return json(response, 200, {
    ok: true,
    services: {
      supabase: isSupabaseConfigured(),
      resend: Boolean(process.env.RESEND_API_KEY),
      resend_webhook: Boolean(process.env.RESEND_WEBHOOK_SECRET),
      live_mode: isLiveMode(),
    },
  })
}
