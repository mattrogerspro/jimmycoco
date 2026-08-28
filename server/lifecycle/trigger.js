import { allowMethods, isEmail, json, normaliseEmail, publicError, readJson, requireBearer } from '../_lib/http.js'
import { enqueueLifecycleEvent } from '../_lib/engine.js'

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['POST']) || !requireBearer(request, response)) return
  try {
    const body = await readJson(request)
    if (!body.event_id) return json(response, 422, { error: 'event_id_required' })
    if (!isEmail(body.contact?.email)) return json(response, 422, { error: 'valid_contact_email_required' })
    const result = await enqueueLifecycleEvent({
      campaignId: body.campaign_id,
      trigger: body.trigger,
      sourceEventId: body.event_id,
      contact: { ...body.contact, email: normaliseEmail(body.contact.email) },
      context: body.context || {},
    })
    return json(response, 202, result)
  } catch (error) {
    const result = publicError(error)
    const status = /not_found/.test(error.message) ? 404 : /disabled/.test(error.message) ? 409 : result.status
    return json(response, status, { error: status === result.status ? result.error : error.message })
  }
}
