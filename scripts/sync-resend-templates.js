import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Resend } from 'resend'
import { campaignRegistry } from '../shared/campaign-registry.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publish = process.argv.includes('--publish')
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
  for (const campaign of campaignRegistry) {
    const campaignDir = path.join(root, 'email', 'campaigns', campaign.id)
    const data = JSON.parse(await fs.readFile(path.join(campaignDir, 'email-data.json'), 'utf8'))
    const steps = [...campaign.steps, ...(campaign.triggeredSteps || [])]
    if (data.messages.length !== steps.length) failures.push(`${campaign.id}: registry has ${steps.length} steps but email-data has ${data.messages.length} messages`)
    for (const [index, step] of steps.entries()) {
      const message = data.messages[index]
      if (!message) continue
      const sourcePath = path.join(campaignDir, message.output.replace(/^\.\//, ''))
      let html
      try { html = await fs.readFile(sourcePath, 'utf8') } catch { failures.push(`${step.templateAlias}: missing ${path.relative(root, sourcePath)}`); continue }
      if (/storage\.mlcdn\.com/i.test(html)) failures.push(`${step.templateAlias}: legacy MailerLite assets must be migrated before publishing`)
      const renderedHtml = toResendVariables(html)
      const variablesInHtml = new Set([...renderedHtml.matchAll(/\{\{\{([A-Z0-9_]+)\}\}\}/g)].map((match) => match[1]))
      const declared = new Set(step.requiredVariables)
      for (const variable of variablesInHtml) {
        if (!reserved.has(variable) && !declared.has(variable)) failures.push(`${step.templateAlias}: undeclared variable ${variable}`)
      }
      for (const variable of declared) {
        if (!variablesInHtml.has(variable)) failures.push(`${step.templateAlias}: declared variable ${variable} is not present in HTML`)
      }
      templates.push({
        id: step.templateId,
        alias: step.templateAlias,
        subject: toResendVariables(message.title || step.subject),
        html: renderedHtml,
        variables: step.requiredVariables.filter((key) => !reserved.has(key)).map((key) => ({ key, type: 'string' })),
        sourcePath: path.relative(root, sourcePath),
      })
    }
  }
  return { templates, failures }
}

async function main() {
  const { templates, failures } = await localTemplates()
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
    if (remote.error) throw new Error(`${template.alias}: ${remote.error.message}`)
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
    const updated = await resend.templates.update(template.id, {
      alias: template.alias,
      subject: template.subject,
      html: template.html,
      variables: template.variables,
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
