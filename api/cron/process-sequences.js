import { allowMethods, json } from '../_lib/http.js'
import { processDueWork } from '../_lib/engine.js'

export default async function handler(request, response) {
  if (!allowMethods(request, response, ['GET', 'POST'])) return
  if (!process.env.CRON_SECRET || request.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return json(response, 401, { error: 'unauthorized' })
  }
  try {
    const result = await processDueWork(Number(process.env.EMAIL_WORKER_BATCH_SIZE || 25))
    return json(response, 200, result)
  } catch (error) {
    return json(response, 500, { error: 'worker_failed', detail: process.env.NODE_ENV === 'development' ? error.message : undefined })
  }
}
