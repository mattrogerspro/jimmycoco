import { allowMethods } from '../_lib/http.js'
import { assertSupabase, getSupabase } from '../_lib/supabase.js'
import { verifyUnsubscribeToken } from '../_lib/unsubscribe.js'

function page(response, status, title, copy) {
  response.statusCode = status
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  return response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#eae2d8;color:#3b3630;font-family:Arial,Helvetica,sans-serif"><main style="max-width:560px;margin:64px auto;padding:40px;background:#fbf8f3"><h1 style="font-size:28px">${title}</h1><p style="font-size:16px;line-height:1.6">${copy}</p></main></body></html>`)
}

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['GET', 'POST'])) return
  const messageId = String(request.query.message || '')
  const token = String(request.query.token || '')
  try {
    if (!verifyUnsubscribeToken(messageId, token)) return page(response, 400, 'Link not recognised', 'This unsubscribe link is invalid or incomplete. Please reply to the email and ask us to remove your details.')
    const supabase = getSupabase()
    const message = assertSupabase(await supabase.from('email_messages').select('id,recipient_email,campaign_id').eq('id', messageId).maybeSingle(), 'load unsubscribe message')
    if (!message?.recipient_email) return page(response, 404, 'Message not found', 'We could not locate this email. Please reply and ask us to remove your details.')

    assertSupabase(await supabase.from('email_suppressions').upsert({
      email: message.recipient_email,
      scope: 'marketing',
      reason: 'unsubscribe',
      source: 'one_click_unsubscribe',
      metadata: { message_id: message.id, campaign_id: message.campaign_id },
    }, { onConflict: 'email,scope' }), 'store unsubscribe')
    assertSupabase(await supabase.from('email_contacts').update({ marketing_status: 'unsubscribed' }).eq('email', message.recipient_email), 'update contact unsubscribe state')
    assertSupabase(await supabase.rpc('exit_email_enrollments', {
      p_email: message.recipient_email,
      p_reason: 'unsubscribe',
      p_event_type: 'unsubscribe',
      p_external_event_id: `one-click-unsubscribe/${message.id}`,
      p_data: { message_id: message.id, campaign_id: message.campaign_id, method: request.method },
    }), 'exit active enrollments')

    return page(response, 200, 'You are unsubscribed', 'Your address has been removed from future Jimmy Coco marketing emails. This does not prevent essential service messages about an order or request you make.')
  } catch {
    return page(response, 500, 'We could not complete that request', 'Please reply to the email and ask us to remove your details. We will handle it manually.')
  }
}
