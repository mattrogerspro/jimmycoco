import crypto from 'node:crypto'

export function json(response, status, body) {
  response.status(status)
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  return response.send(JSON.stringify(body))
}

export function allowMethods(request, response, methods) {
  if (methods.includes(request.method)) return true
  response.setHeader('Allow', methods.join(', '))
  json(response, 405, { error: 'method_not_allowed' })
  return false
}

export function requireBearer(request, response, expected = process.env.AUTOMATION_API_KEY) {
  if (!expected) {
    json(response, 503, { error: 'automation_api_key_not_configured' })
    return false
  }
  const supplied = request.headers.authorization || ''
  const expectedHeader = `Bearer ${expected}`
  const suppliedBuffer = Buffer.from(supplied)
  const expectedBuffer = Buffer.from(expectedHeader)
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    json(response, 401, { error: 'unauthorized' })
    return false
  }
  return true
}

export async function readJson(request) {
  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) return request.body
  const raw = await readRawBody(request)
  if (!raw) return {}
  return JSON.parse(raw)
}

export async function readRawBody(request) {
  if (typeof request.body === 'string') return request.body
  if (Buffer.isBuffer(request.body)) return request.body.toString('utf8')
  const chunks = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

export function normaliseEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normaliseEmail(value))
}

export function publicError(error) {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('contact_is_suppressed')) return { status: 409, error: 'contact_is_suppressed' }
  if (message.includes('missing_template_variables')) return { status: 422, error: message }
  if (message.includes('unresolved_template_')) return { status: 422, error: message }
  return { status: 500, error: 'internal_error' }
}
