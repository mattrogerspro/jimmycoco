#!/usr/bin/env node
import crypto from 'node:crypto'
import { Webhook } from 'standardwebhooks'

if (!process.argv.includes('--send')) {
  console.log('Resend webhook smoke helper. Run with: npm run webhook:smoke -- --send')
  process.exit(0)
}

function arg(name, fallback = null) {
  const flag = `--${name}`
  const index = process.argv.indexOf(flag)
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1]
  return process.env[name.toUpperCase().replaceAll('-', '_')] || fallback
}

const endpoint = arg('endpoint', 'https://www.jimmycoco.email/api/webhooks/resend')
const secret = arg('secret', process.env.RESEND_WEBHOOK_SECRET)
const eventType = arg('event-type', 'email.delivered')
const email = arg('email', 'webhook-smoke-test@jimmycoco.email')
const campaignId = arg('campaign-id', 'uk-salon-stockist')
const sequenceStep = arg('sequence-step', '01-trial')
const emailId = arg('email-id', `resend-smoke-${Date.now()}`)
const svixId = arg('svix-id', `msg_${crypto.randomUUID()}`)
const repeat = Number(arg('repeat', '1'))

if (!secret) {
  console.error('RESEND_WEBHOOK_SECRET is required. Pass --secret or set the environment variable.')
  process.exit(2)
}

const payload = JSON.stringify({
  type: eventType,
  created_at: new Date().toISOString(),
  data: {
    email_id: emailId,
    to: [email],
    from: 'Jimmy Coco <partnerships@email.jimmycoco.pro>',
    subject: 'Webhook smoke test',
    tags: {
      campaign_id: campaignId,
      sequence_step: sequenceStep,
      market: 'uk',
    },
    ...(eventType === 'email.clicked' ? { click: { link: 'https://jimmycoco.pro/' } } : {}),
    ...(eventType === 'email.bounced' ? { bounce: { type: 'permanent', subType: 'general', message: 'Smoke-test hard bounce' } } : {}),
  },
})

const webhook = new Webhook(secret)
const timestamp = new Date()
const signature = webhook.sign(svixId, timestamp, payload)
const headers = {
  'content-type': 'application/json',
  'svix-id': svixId,
  'svix-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
  'svix-signature': signature,
}

for (let attempt = 1; attempt <= repeat; attempt += 1) {
  const response = await fetch(endpoint, { method: 'POST', headers, body: payload, redirect: 'manual' })
  const text = await response.text()
  let body = text
  try {
    body = text ? JSON.parse(text) : null
  } catch {}
  console.log(JSON.stringify({
    attempt,
    endpoint,
    status: response.status,
    ok: response.ok,
    location: response.headers.get('location'),
    body,
  }, null, 2))

  if (!response.ok) process.exitCode = 1
}
