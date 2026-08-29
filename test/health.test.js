import assert from 'node:assert/strict'
import test from 'node:test'
import healthHandler from '../server/health.js'

function responseDouble() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    status(value) {
      this.statusCode = value
      return this
    },
    setHeader(name, value) {
      this.headers[name] = value
    },
    send(value) {
      this.body = value
      return this
    },
  }
}

test('health endpoint retains JSON for machines and provides an HTML monitoring view', () => {
  const jsonResponse = responseDouble()
  healthHandler({ query: {} }, jsonResponse)
  assert.equal(jsonResponse.statusCode, 200)
  assert.match(jsonResponse.headers['Content-Type'], /application\/json/)
  assert.equal(JSON.parse(jsonResponse.body).ok, true)

  const htmlResponse = responseDouble()
  healthHandler({ query: { format: 'html' } }, htmlResponse)
  assert.equal(htmlResponse.statusCode, 200)
  assert.match(htmlResponse.headers['Content-Type'], /text\/html/)
  assert.match(htmlResponse.body, /Jimmy Coco Email Health/)
  assert.match(htmlResponse.body, /"live_mode"/)
  assert.match(htmlResponse.body, /"preferences"/)
  assert.match(htmlResponse.body, /"audit_copy_enabled"/)
})
