import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Resend } from 'resend'
import { campaignsById } from '../shared/campaign-registry.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publish = process.argv.includes('--publish')
const onlyArgument = process.argv.find((argument) => argument.startsWith('--only='))
const onlyIndex = process.argv.indexOf('--only')
const onlyAlias = onlyArgument?.slice('--only='.length) || (onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null)
const reserved = new Set(['FIRST_NAME', 'LAST_NAME', 'EMAIL', 'RESEND_UNSUBSCRIBE_URL'])
const aliases = {
  first_name: 'FIRST_NAME',
  last_name: 'LAST_NAME',
  email: 'EMAIL',
  unsubscribe_link: 'RESEND_UNSUBSCRIBE_URL',
  resend_unsubscribe_url: 'RESEND_UNSUBSCRIBE_URL',
}

function toResendVariables(value) {
  return value.replace(/\{\{\{?\s*([\w.]+)\s*\}\}\}?/g, (_match, key) => {
    const variable = aliases[key.toLowerCase()] || key.replaceAll('.', '_').toUpperCase()
    return `{{{${variable}}}}`
  })
}

function normaliseHtml(value) {
  return value.replace(/\r\n/g, '\n').trim()
}

async function localTemplates() {
  const templates = []
  const failures = []
  const campaignsDir = path.join(root, 'email', 'campaigns')
  const campaignDirectories = (await fs.readdir(campaignsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name)
    .sort()

  for (const campaignId of campaignDirectories) {
    const campaignDir = path.join(campaignsDir, campaignId)
    let data
    try {
      data = JSON.parse(await fs.readFile(path.join(campaignDir, 'email-data.json'), 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') continue
      failures.push(`${campaignId}: invalid email-data.json (${error.message})`)
      continue
    }

    if (data.esp && data.esp.toLowerCase() !== 'resend') continue

    const campaign = campaignsById[campaignId]
    const registeredSteps = campaign ? [...campaign.steps, ...(campaign.triggeredSteps || [])] : []
    const steps = campaign
      ? registeredSteps
      : data.messages.map((message, index) => ({
          key: String(index + 1).padStart(2, '0'),
          templateAlias: message.alias,
          templateId: message.templateId || message.alias,
          subject: message.subject || message.title,
          requiredVariables: message.requiredVariables,
        }))

    if (campaign && data.messages.length !== steps.length) failures.push(`${campaignId}: registry has ${steps.length} steps but email-data has ${data.messages.length} messages`)
    for (const [index, step] of steps.entries()) {
      const message = data.messages[index]
      if (!message) continue
      const output = message.output || message.file
      const alias = step.templateAlias || message.alias
      if (!output) { failures.push(`${campaignId} message ${index + 1}: missing output or file`); continue }
      if (!alias) { failures.push(`${campaignId} message ${index + 1}: missing template alias`); continue }
      const sourcePath = path.join(campaignDir, output.replace(/^\.\//, ''))
      let html
      try { html = await fs.readFile(sourcePath, 'utf8') } catch { failures.push(`${alias}: missing ${path.relative(root, sourcePath)}`); continue }
      if (/storage\.mlcdn\.com/i.test(html)) failures.push(`${alias}: legacy MailerLite assets must be migrated before publishing`)
      const renderedHtml = toResendVariables(html)
      const variablesInHtml = new Set([...renderedHtml.matchAll(/\{\{\{([A-Z0-9_]+)\}\}\}/g)].map((match) => match[1]))
      const requiredVariables = step.requiredVariables || [...variablesInHtml].filter((variable) => !reserved.has(variable))
      const declared = new Set(requiredVariables)
      for (const variable of variablesInHtml) {
        if (!reserved.has(variable) && !declared.has(variable)) failures.push(`${alias}: undeclared variable ${variable}`)
      }
      for (const variable of declared) {
        if (!variablesInHtml.has(variable)) failures.push(`${alias}: declared variable ${variable} is not present in HTML`)
      }
      templates.push({
        id: step.templateId || message.templateId || alias,
        name: message.name || `Repository template — ${alias}`,
        alias,
        subject: toResendVariables(message.title || message.subject || step.subject),
        html: renderedHtml,
        variables: requiredVariables.filter((key) => !reserved.has(key)).map((key) => ({ key, type: 'string' })),
        sourcePath: path.relative(root, sourcePath),
      })
    }
  }
  return { templates, failures }
}

async function main() {
  const { templates: discoveredTemplates, failures } = await localTemplates()
  const templates = onlyAlias
    ? discoveredTemplates.filter((template) => template.alias === onlyAlias)
    : discoveredTemplates
  if (onlyAlias && templates.length === 0) {
    throw new Error(`Unknown local template alias: ${onlyAlias}`)
  }
  if (failures.length) {
    console.error(`Local validation found ${failures.length} blocking issue(s):`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
    if (publish) {
      console.error('Publish aborted. Resolve every local validation issue first.')
      return
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.log(`Validated ${templates.length} local templates. Remote drift check skipped because RESEND_API_KEY is not set.`)
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  let drift = 0
  for (const template of templates) {
    const remote = await resend.templates.get(template.id)
    if (remote.error) {
      const missing = remote.error.statusCode === 404 || /not found/i.test(remote.error.message || '')
      if (!missing) throw new Error(`${template.alias}: ${remote.error.message}`)
      drift += 1
      if (!publish) {
        console.log(`MISSING ${template.alias} ← ${template.sourcePath}`)
        continue
      }
      const created = await resend.templates.create({
        name: template.name,
        alias: template.alias,
        subject: template.subject,
        html: template.html,
        variables: template.variables,
      })
      if (created.error) throw new Error(`${template.alias}: create failed: ${created.error.message}`)
      const published = await resend.templates.publish(created.data.id)
      if (published.error) throw new Error(`${template.alias}: publish failed: ${published.error.message}`)
      console.log(`CREATE  ${template.alias}`)
      continue
    }
    const changed = normaliseHtml(remote.data.html || '') !== normaliseHtml(template.html)
      || remote.data.subject !== template.subject
      || remote.data.alias !== template.alias
    if (!changed) {
      console.log(`OK      ${template.alias}`)
      continue
    }
    drift += 1
    if (!publish) {
      console.log(`DRIFT   ${template.alias} ← ${template.sourcePath}`)
      continue
    }
    const remoteVariables = (remote.data.variables || [])
      .filter((variable) => !reserved.has(variable.key))
      .map((variable) => ({ key: variable.key, type: variable.type || 'string' }))
    const migrationVariables = [...new Map(
      [...remoteVariables, ...template.variables].map((variable) => [variable.key, variable]),
    ).values()]
    const updated = await resend.templates.update(template.id, {
      alias: template.alias,
      subject: template.subject,
      html: template.html,
      variables: migrationVariables,
    })
    if (updated.error) throw new Error(`${template.alias}: ${updated.error.message}`)
    const published = await resend.templates.publish(template.id)
    if (published.error) throw new Error(`${template.alias}: publish failed: ${published.error.message}`)
    console.log(`PUBLISH ${template.alias}`)
  }

  if (drift && !publish) {
    console.error(`${drift} template(s) differ from the repository. Review and run npm run templates:publish to promote approved source.`)
    process.exitCode = 1
  } else {
    console.log(`${publish ? 'Published' : 'Verified'} ${templates.length} templates.`)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
