import process from 'node:process'
import { renderRuntimeTemplate } from '../email/runtime-templates.js'
import { campaignsById } from '../shared/campaign-registry.js'

const campaignIds = [
  'uk-salon-stockist',
  'us-west-coast-salon-stockist',
  'uk-reseller-lifecycle',
  'uk-pro-trial-follow-up',
  'uk-calculator-follow-up',
  'uk-pro-order-follow-up',
]

const onlyArgument = process.argv.find((argument) => argument.startsWith('--only='))
const onlyIndex = process.argv.indexOf('--only')
const onlyAlias = onlyArgument?.slice('--only='.length) || (onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null)
const tokenPattern = /\{\{\{?\s*([A-Z0-9_]+)\s*\}\}\}?/g
const forbidden = new Set(['FIRST_NAME', 'LAST_NAME', 'EMAIL', 'UNSUBSCRIBE_URL', 'RESEND_UNSUBSCRIBE_URL'])
const forbiddenCustomerLinkHosts = new Set(['jimmycoco.email', 'jimmycoco.co.uk', 'www.jimmycoco.co.uk'])

function tokensIn(value) {
  return new Set([...String(value).matchAll(tokenPattern)].map((match) => match[1]))
}

const failures = []
let validated = 0

for (const campaignId of campaignIds) {
  const campaign = campaignsById[campaignId]
  const steps = campaignId === 'uk-reseller-lifecycle'
    ? campaign.steps.filter((step) => step.enabled !== false)
    : campaign.steps
  for (const step of steps) {
    if (onlyAlias && step.templateAlias !== onlyAlias) continue
    let rendered
    try {
      rendered = renderRuntimeTemplate(step.templateAlias)
    } catch (error) {
      failures.push(`${step.templateAlias}: ${error.message}`)
      continue
    }
    const tokens = new Set([...tokensIn(rendered.subject), ...tokensIn(rendered.html)])
    const declared = new Set(step.requiredVariables || [])
    for (const token of tokens) {
      if (!declared.has(token)) failures.push(`${step.templateAlias}: undeclared token ${token}`)
      if (forbidden.has(token)) failures.push(`${step.templateAlias}: forbidden legacy token ${token}`)
    }
    for (const variable of declared) {
      if (!tokens.has(variable)) failures.push(`${step.templateAlias}: declared variable ${variable} is not used`)
    }
    if (step.templateId) failures.push(`${step.templateAlias}: templateId must be null for repository-rendered delivery`)
    const literalLinks = [...rendered.html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
    for (const [, value] of literalLinks) {
      const url = new URL(value)
      if (forbiddenCustomerLinkHosts.has(url.hostname.toLowerCase())) {
        failures.push(`${step.templateAlias}: customer link uses forbidden host ${url.hostname}`)
      }
    }
    if (!literalLinks.some(([, value]) => new URL(value).hostname === 'www.jimmycoco.pro')) {
      failures.push(`${step.templateAlias}: no literal link to www.jimmycoco.pro`)
    }
    validated += 1
  }
}

if (onlyAlias && validated === 0) failures.push(`unknown runtime template alias ${onlyAlias}`)

if (failures.length) {
  console.error(`Runtime template validation found ${failures.length} blocking issue(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Validated ${validated} repository-rendered email templates. No Resend Templates are used.`)
}
