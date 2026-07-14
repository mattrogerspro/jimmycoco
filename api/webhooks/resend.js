import { allowMethods, json, readRawBody } from '../_lib/http.js'
import { verifyResendWebhook } from '../_lib/resend.js'
import { processResendEvent } from '../_lib/webhook-events.js'

export const config = { api: { bodyParser: false } }

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST'])) return
  try {
    const payload = await readRawBody(request)
    const svixId = request.headers['svix-id']
    const event = verifyResendWebhook(payload, {
      id: svixId,
      timestamp: request.headers['svix-timestamp'],
      signature: request.headers['svix-signature'],
    })
    const result = await processResendEvent(event, svixId)
    return json(response, 200, { received: true, ...result })
  } catch (error) {
    const invalidSignature = /signature|webhook/i.test(String(error?.message || error))
    return json(response, invalidSignature ? 400 : 500, { error: invalidSignature ? 'invalid_webhook' : 'webhook_processing_failed' })
  }
}
