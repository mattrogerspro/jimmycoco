#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const campaignId = process.argv[2]

if (!campaignId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(campaignId)) {
  console.error('Usage: validate-campaign.mjs <campaign-id>')
  process.exit(2)
}

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const campaignDir = path.join(root, 'email', 'campaigns', campaignId)
const errors = []
const warnings = []

async function readJson(filename) {
  try {
    return JSON.parse(await fs.readFile(path.join(campaignDir, filename), 'utf8'))
  } catch (error) {
    errors.push(`${filename}: ${error.code === 'ENOENT' ? 'missing' : `invalid JSON (${error.message})`}`)
    return null
  }
}

for (const filename of ['README.md', 'sequence.md']) {
  try {
    const source = await fs.readFile(path.join(campaignDir, filename), 'utf8')
    if (!source.trim()) errors.push(`${filename}: empty`)
  } catch {
    errors.push(`${filename}: missing`)
  }
}

const data = await readJson('email-data.json')
const studio = await readJson('studio.json')
const messages = Array.isArray(data?.messages) ? data.messages : []

if (data && !Array.isArray(data.messages)) errors.push('email-data.json: messages must be an array')
if (data && messages.length === 0) errors.push('email-data.json: at least one message is required')
if (studio && !studio.name) errors.push('studio.json: name is required')
if (studio && !Array.isArray(studio.days)) errors.push('studio.json: days must be an array')
if (studio?.days?.length !== messages.length) errors.push(`studio.json: expected ${messages.length} day values, found ${studio?.days?.length ?? 0}`)

const outputs = new Set()
const aliases = new Set()
const supplemental = new Set(studio?.supplementalOutputs || [])
const sequenceDays = []

for (const [index, message] of messages.entries()) {
  const label = `message ${index + 1}`
  const output = message.output || message.file
  const title = message.title || message.subject

  if (!output) errors.push(`${label}: output or file is required`)
  if (!title) errors.push(`${label}: title or subject is required`)
  if (!message.preview) errors.push(`${label}: preview is required`)
  if (output && outputs.has(output)) errors.push(`${label}: duplicate output ${output}`)
  if (output) outputs.add(output)
  if (message.alias && aliases.has(message.alias)) errors.push(`${label}: duplicate alias ${message.alias}`)
  if (message.alias) aliases.add(message.alias)

  if (output) {
    const normalised = output.replace(/^\.\//, '')
    const htmlPath = path.resolve(campaignDir, normalised.includes('/') ? normalised : path.join('emails', normalised))
    if (!htmlPath.startsWith(`${campaignDir}${path.sep}`)) {
      errors.push(`${label}: output escapes the campaign directory`)
    } else {
      try {
        const html = await fs.readFile(htmlPath, 'utf8')
        if (!/<!doctype html/i.test(html)) errors.push(`${label}: generated HTML is missing a doctype`)
        if (/storage\.mlcdn\.com/i.test(html)) errors.push(`${label}: generated HTML contains legacy MailerLite assets`)
      } catch {
        errors.push(`${label}: generated HTML is missing at ${path.relative(root, htmlPath)}`)
      }
    }
  }

  if (studio?.mode === 'sequence' && !supplemental.has(output)) sequenceDays.push(studio.days[index])
}

if (sequenceDays.some((day) => !Number.isFinite(day) || day < 0)) errors.push('studio.json: sequence days must be non-negative numbers')
for (let index = 1; index < sequenceDays.length; index += 1) {
  if (sequenceDays[index] <= sequenceDays[index - 1]) errors.push('studio.json: sequence days must be strictly increasing')
}

try {
  const registryUrl = pathToFileURL(path.join(root, 'shared', 'campaign-registry.js')).href
  const { campaignsById } = await import(registryUrl)
  const registry = campaignsById[campaignId]
  if (!registry) {
    warnings.push('campaign is not in shared/campaign-registry.js; acceptable for a draft that will not be operated')
  } else {
    const steps = [...registry.steps, ...(registry.triggeredSteps || [])]
    if (steps.length !== messages.length) errors.push(`registry: expected ${messages.length} steps, found ${steps.length}`)
    if (registry.enabled) warnings.push('registry campaign is enabled; confirm production enablement was explicitly approved')
  }
} catch (error) {
  errors.push(`registry could not be loaded (${error.message})`)
}

for (const warning of warnings) console.warn(`WARN  ${warning}`)
for (const error of errors) console.error(`ERROR ${error}`)

if (errors.length) {
  console.error(`\n${campaignId}: validation failed with ${errors.length} error(s).`)
  process.exit(1)
}

console.log(`\n${campaignId}: valid (${messages.length} message${messages.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}).`)
