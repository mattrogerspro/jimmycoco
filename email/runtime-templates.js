import masterTemplate from './campaigns/_shared/master-template.js'
import auAccount from './campaigns/au-salon-account-flow/email-data.json' with { type: 'json' }
import auGoldCoast from './campaigns/au-gold-coast-salon-stockist/email-data.json' with { type: 'json' }
import auOutreachTest from './campaigns/au-new-salon-outreach-test/email-data.json' with { type: 'json' }
import auSeeding from './campaigns/au-salon-seeding/email-data.json' with { type: 'json' }
import auSydney from './campaigns/au-sydney-salon-stockist/email-data.json' with { type: 'json' }
import uaeDubai from './campaigns/uae-dubai-salon-stockist/email-data.json' with { type: 'json' }
import ukOrderFollowUp from './campaigns/uk-pro-order-follow-up/email-data.json' with { type: 'json' }
import ukTrialFollowUp from './campaigns/uk-pro-trial-follow-up/email-data.json' with { type: 'json' }
import ukReseller from './campaigns/uk-reseller-lifecycle/email-data.json' with { type: 'json' }
import ukSalonOnboarding from './campaigns/uk-salon-onboarding/email-data.json' with { type: 'json' }
import ukStockist from './campaigns/uk-salon-stockist/email-data.json' with { type: 'json' }
import usWestCoast from './campaigns/us-west-coast-salon-stockist/email-data.json' with { type: 'json' }
import { campaignsById } from '../shared/campaign-registry.js'

const { renderEmail } = masterTemplate

const campaignManifests = [
  { id: 'au-salon-account-flow', manifest: auAccount },
  { id: 'au-gold-coast-salon-stockist', manifest: auGoldCoast },
  { id: 'au-new-salon-outreach-test', manifest: auOutreachTest },
  { id: 'au-salon-seeding', manifest: auSeeding },
  { id: 'au-sydney-salon-stockist', manifest: auSydney },
  { id: 'uae-dubai-salon-stockist', manifest: uaeDubai },
  { id: 'uk-pro-order-follow-up', manifest: ukOrderFollowUp },
  { id: 'uk-pro-trial-follow-up', manifest: ukTrialFollowUp },
  { id: 'uk-reseller-lifecycle', manifest: ukReseller },
  { id: 'uk-salon-onboarding', manifest: ukSalonOnboarding },
  { id: 'uk-salon-stockist', manifest: ukStockist },
  { id: 'us-west-coast-salon-stockist', manifest: usWestCoast },
]

const templatesByAlias = new Map()

for (const { id, manifest } of campaignManifests) {
  const registered = campaignsById[id]
  const registeredSteps = registered ? [...registered.steps, ...(registered.triggeredSteps || [])] : []
  for (const [index, message] of (manifest.messages || []).entries()) {
    const alias = message.alias || registeredSteps[index]?.templateAlias
    if (!alias) continue
    if (templatesByAlias.has(alias)) throw new Error(`duplicate_runtime_template_alias:${alias}`)
    templatesByAlias.set(alias, { campaign: manifest, message })
  }
}

export function getRuntimeTemplate(alias) {
  return templatesByAlias.get(alias) || null
}

export function renderRuntimeTemplate(alias) {
  const template = getRuntimeTemplate(alias)
  if (!template) throw new Error(`runtime_template_not_found:${alias}`)
  const data = { ...template.campaign.defaults, ...template.message }
  return {
    subject: template.message.title,
    html: renderEmail(data),
  }
}

export function runtimeTemplateAliases() {
  return [...templatesByAlias.keys()]
}
