export const TRIAL_ATTRIBUTION_FIELDS = {
  campaign: 'outreach_campaign',
  email: 'outreach_step',
  market: 'outreach_market',
}

const CAMPAIGNS = {
  'uk-salon-stockist': {
    market: 'UK',
    steps: new Set(['01-trial', '02-result', '03-economics', '04-retail', '05-trial-guide', '06-onboarding', '07-close']),
  },
  'us-west-coast-salon-stockist': {
    market: 'US-West-Coast',
    steps: new Set(['01-trial', '02-result', '03-retail', '04-partner-path', '06-process', '07-choice', '05-close']),
  },
}

export const US_WEST_COAST_SERVICE_STATES = new Set(['CA', 'OR', 'WA'])

function valueFrom(input, key) {
  if (!input) return ''
  if (typeof input.get === 'function') return String(input.get(key) || '').trim()
  return String(input[key] || '').trim()
}

export function parseTrialAttribution(input) {
  const campaignId = valueFrom(input, TRIAL_ATTRIBUTION_FIELDS.campaign)
  const emailStep = valueFrom(input, TRIAL_ATTRIBUTION_FIELDS.email)
  const configured = CAMPAIGNS[campaignId]
  if (!configured || !configured.steps.has(emailStep)) return null
  return { campaignId, emailStep, market: configured.market }
}

export function buildCampaignTrialUrl(baseUrl, campaignId, emailStep) {
  const configured = CAMPAIGNS[campaignId]
  if (!configured || !configured.steps.has(emailStep)) throw new Error('invalid_trial_attribution')
  const url = new URL(baseUrl)
  url.searchParams.set(TRIAL_ATTRIBUTION_FIELDS.campaign, campaignId)
  url.searchParams.set(TRIAL_ATTRIBUTION_FIELDS.email, emailStep)
  url.searchParams.set(TRIAL_ATTRIBUTION_FIELDS.market, configured.market)
  url.hash = 'trial'
  return url.toString()
}

export function isUsTrialAttribution(attribution) {
  return attribution?.campaignId === 'us-west-coast-salon-stockist'
}

export function classifyUsTrialServiceability(state) {
  const normalized = String(state || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return { state: normalized, status: 'review_required' }
  return {
    state: normalized,
    status: US_WEST_COAST_SERVICE_STATES.has(normalized) ? 'eligible_area' : 'outside_current_area',
  }
}
