import { json } from './_lib/http.js'
import { assertProSiteDestination, isLiveMode } from './_lib/resend.js'
import { isSupabaseConfigured } from './_lib/supabase.js'

export function healthStatus() {
  const isValidProLink = (value, fallback) => {
    try {
      assertProSiteDestination(value || fallback)
      return true
    } catch {
      return false
    }
  }
  return {
    ok: true,
    services: {
      supabase: isSupabaseConfigured(),
      resend: Boolean(process.env.RESEND_API_KEY),
      resend_webhook: Boolean(process.env.RESEND_WEBHOOK_SECRET),
      audience_import: Boolean(process.env.AUDIENCE_IMPORT_SIGNING_SECRET),
      preferences: Boolean(process.env.EMAIL_PREFERENCES_SIGNING_SECRET && process.env.EMAIL_PREFERENCES_BASE_URL),
      uk_trial_link: isValidProLink(process.env.EMAIL_TRIAL_LINK, 'https://www.jimmycoco.pro/#trial'),
      us_trial_link: isValidProLink(process.env.EMAIL_US_TRIAL_LINK || process.env.EMAIL_TRIAL_LINK, 'https://www.jimmycoco.pro/#trial'),
      calculator_link: isValidProLink(process.env.EMAIL_CALCULATOR_LINK, 'https://www.jimmycoco.pro/tools/spray-tan-profit-calculator'),
      order_link: isValidProLink(process.env.EMAIL_ORDER_LINK, 'https://www.jimmycoco.pro/products/malibu-professional-spray-1l#complete-order'),
      trade_link: isValidProLink(process.env.EMAIL_TRADE_LINK, 'https://www.jimmycoco.pro/products/malibu-professional-spray-1l#complete-order'),
      reply_to: Boolean(process.env.RESEND_REPLY_TO),
      audit_copy_enabled: Boolean(String(process.env.EMAIL_AUDIT_COPY || '').trim()),
      live_mode: isLiveMode(),
    },
  }
}

export default function handler(request, response) {
  const status = healthStatus()
  if (request.query?.format === 'html') {
    response.status(200)
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    return response.send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Jimmy Coco Email Health</title></head><body><main><h1>Jimmy Coco Email Health</h1><pre>${JSON.stringify(status, null, 2)}</pre></main></body></html>`)
  }
  return json(response, 200, status)
}
