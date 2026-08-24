import { campaignsById } from '../../shared/campaign-registry.js'
import { resolveCampaignMessageState, sortCampaignMessages } from '../lib/campaign-message-state.js'

const campaignDataFiles = import.meta.glob('../../email/campaigns/*/email-data.json', {
  import: 'default',
  eager: true,
})

const campaignStudioFiles = import.meta.glob('../../email/campaigns/*/studio.json', {
  import: 'default',
  eager: true,
})

const markdownFiles = import.meta.glob('../../email/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const htmlFiles = import.meta.glob('../../email/campaigns/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const categoryMap = {
  '00-strategy': ['Strategy', 'North-star rules for audiences, journeys, frequency, and measurement.'],
  '01-design-system': ['Design system', 'The visual and interaction language shared by every email.'],
  '02-template-system': ['Template system', 'Component contracts, rendering rules, and delivery workflow.'],
  '04-copy-system': ['Copy system', 'Voice, subject lines, body structure, CTAs, and lifecycle tone.'],
  '05-ai-production': ['AI production', 'Controlled workflows for copy, imagery, QA, and approvals.'],
  '06-assets': ['Asset library', 'Naming, rights, formats, crops, and production controls.'],
  '07-resend-integration': ['Delivery & data', 'Sending architecture, events, webhooks, consent, and observability.'],
}

const toTitle = (value) => value
  .replace(/\.md$/, '')
  .replace(/^\d+-/, '')
  .replaceAll('-', ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase())

const firstParagraph = (markdown) => {
  const lines = markdown.split('\n')
  let foundHeading = false
  const paragraph = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      if (paragraph.length) break
      continue
    }
    if (line.startsWith('#')) {
      foundHeading = true
      continue
    }
    if (!foundHeading || line.startsWith('>') || line.startsWith('-') || line.startsWith('|')) continue
    paragraph.push(line)
  }
  return paragraph.join(' ').replaceAll('**', '').replaceAll('`', '').slice(0, 180)
}

export const playbookCategories = Object.entries(categoryMap).map(([slug, [name, description]]) => {
  const documents = Object.entries(markdownFiles)
    .filter(([path]) => path.includes(`/email/${slug}/`) && !path.endsWith('/README.md'))
    .map(([path, content]) => {
      const filename = path.split('/').pop()
      const heading = content.match(/^#\s+(.+)$/m)?.[1]?.replace(/^\d+\s*[—-]\s*/, '')
      return {
        id: path,
        title: heading || toTitle(filename),
        filename,
        content,
        excerpt: firstParagraph(content),
        category: name,
      }
    })
    .sort((a, b) => a.filename.localeCompare(b.filename))

  return { slug, name, description, documents }
})

const marketFlags = { AU: '🇦🇺', UK: '🇬🇧', UAE: '🇦🇪' }

// The V2 UK and US West Coast journeys are the only current recruitment sequences.
// All other campaign folders remain available as archived research and reference material.
const currentCampaignIds = new Set([
  'uk-salon-stockist',
  'us-west-coast-salon-stockist',
])

const campaignDefinitions = Object.entries(campaignDataFiles)
  .map(([dataPath, data]) => {
    const id = dataPath.split('/').at(-2)
    const studio = campaignStudioFiles[`../../email/campaigns/${id}/studio.json`] || {}
    const registry = campaignsById[id]
    const days = studio.days || registry?.steps?.map((step) => step.day ?? step.delayDays ?? 0) || []
    const lastDay = days.length ? Math.max(...days) : Math.max(0, (data.messages?.length - 1) * 3)
    const market = studio.market || data.market || registry?.market || id.split('-')[0].toUpperCase()

    return {
      id,
      name: studio.name || registry?.name || toTitle(id),
      shortName: studio.shortName || studio.name || registry?.name || toTitle(id),
      market,
      flag: studio.flag || marketFlags[market] || '✉️',
      status: (Boolean(studio.archived) || !currentCampaignIds.has(id)) ? 'Archived' : (studio.status || 'Draft'),
      hook: studio.hook || 'Email campaign',
      channel: studio.channel || 'Email',
      cadence: studio.cadence || `${lastDay} days`,
      owner: studio.owner || 'Marketing',
      mode: studio.mode || registry?.mode || 'sequence',
      days,
      supplementalOutputs: studio.supplementalOutputs || [],
      order: studio.order ?? 999,
      archived: Boolean(studio.archived) || !currentCampaignIds.has(id),
      data,
    }
  })
  .filter((campaign) => Array.isArray(campaign.data.messages))
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

const resolveCampaignHtml = (campaignId, output) => {
  if (!output) return { html: null, htmlPath: null }
  const normalisedOutput = output.replace(/^\.\//, '').replace(/^\//, '')
  const candidates = normalisedOutput.startsWith('emails/')
    ? [normalisedOutput]
    : [`emails/${normalisedOutput}`, normalisedOutput]

  for (const candidate of candidates) {
    const htmlPath = `../../email/campaigns/${campaignId}/${candidate}`
    if (htmlFiles[htmlPath]) return { html: htmlFiles[htmlPath], htmlPath }
  }

  return {
    html: null,
    htmlPath: `../../email/campaigns/${campaignId}/${candidates[0]}`,
  }
}

export const campaigns = campaignDefinitions.map((campaign) => {
  const messages = campaign.data.messages.map((message, index) => {
    const output = message.output || message.file
    const title = message.title || message.subject || `Email ${index + 1}`
    const { html, htmlPath } = resolveCampaignHtml(campaign.id, output)
    const registryCampaign = campaignsById[campaign.id]
    const { registryStep, isSupplemental, isTriggered } = resolveCampaignMessageState({
      campaignMode: campaign.mode,
      index,
      messageAlias: message.alias,
      output,
      supplementalOutputs: campaign.supplementalOutputs,
      registryCampaign,
    })
    const sourceIndex = index + 1
    const stepIndex = registryStep?.number ?? sourceIndex

    return {
      ...message,
      output,
      title,
      headline: message.headline || title,
      eyebrow: message.eyebrow || campaign.name,
      id: `${campaign.id}-${sourceIndex}`,
      index: stepIndex,
      sourceIndex,
      day: registryStep?.day ?? registryStep?.delayDays ?? campaign.days[index] ?? index * 3,
      trigger: registryStep?.trigger,
      templateAlias: registryStep?.templateAlias || message.alias,
      html,
      htmlPath,
      isTriggered,
      isSupplemental,
      status: campaign.archived ? 'Archived' : (campaign.status === 'Live' && index === 0 ? 'Live' : 'Ready'),
    }
  })

  return {
    ...campaign,
    messages: sortCampaignMessages(campaign.mode, messages),
  }
})

const lifecycleFolders = Object.entries(markdownFiles)
  .filter(([path]) => /\/email\/03-sequences\/[^/]+\/README\.md$/.test(path))

export const lifecycleSequences = lifecycleFolders.map(([readmePath, content]) => {
  const folder = readmePath.split('/').at(-2)
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.replace(/^Sunless\s+/, '') || toTitle(folder)
  const description = firstParagraph(content)
  const allDocuments = Object.entries(markdownFiles)
    .filter(([path]) => path.includes(`/email/03-sequences/${folder}/`) && !path.endsWith('/README.md'))
    .map(([path, doc]) => ({
      id: path,
      title: doc.match(/^#\s+(.+)$/m)?.[1]?.replace(/^\d+\s*[—-]\s*/, '') || toTitle(path.split('/').pop()),
      content: doc,
      filename: path.split('/').pop(),
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename))

  const emailCount = allDocuments.filter((doc) => /email-\d+/i.test(doc.filename)).length
  return {
    id: folder,
    title,
    description,
    documents: allDocuments,
    emailCount,
    status: 'Blueprint',
  }
}).sort((a, b) => a.id.localeCompare(b.id))

export const activeCampaigns = campaigns.filter((campaign) => !campaign.archived)
export const archivedCampaigns = campaigns.filter((campaign) => campaign.archived)

export const contentStats = {
  playbooks: playbookCategories.reduce((total, category) => total + category.documents.length, 0),
  lifecycleSequences: lifecycleSequences.length,
  campaigns: activeCampaigns.length,
  archivedCampaigns: archivedCampaigns.length,
  renderedEmails: activeCampaigns.reduce((total, campaign) => total + campaign.messages.filter((message) => message.html).length, 0),
}

export const sampleMergeData = {
  first_name: 'Sophie',
  greeting_name: 'Sophie',
  salon_name: 'Maison Glow',
  city: 'London',
  sender_name: 'Matt',
  sender_title: 'Partnerships, Sunless by Jimmy Coco',
  sender_email: 'partnerships@sunlessbyjimmycoco.com',
  calendar_link: '#book-a-call',
  calculator_link: 'https://www.jimmycoco.pro/tools/spray-tan-profit-calculator',
  monthly_profit: '£705',
  litres_per_month: '1.9',
  tans_per_week: '12',
  order_link: 'https://www.jimmycoco.pro/products/malibu-professional-spray-1l',
  trial_link: '#professional-trial',
  trade_link: '#uae-trade',
  shade_guide_link: '#shade-guide',
  uae_delivery_statement: 'UAE delivery options are confirmed during the partner setup.',
  uae_partner_terms: 'Trade terms are tailored to the approved professional range.',
  business_address: 'Sunless by Jimmy Coco · London',
  unsubscribe_link: '#unsubscribe',
}

export function applyMergeData(html, data = sampleMergeData) {
  if (!html) return ''
  const aliases = {
    business_name: 'salon_name',
    resend_unsubscribe_url: 'unsubscribe_link',
  }

  return html.replace(/\{\{\{?\s*([\w.]+)\s*\}\}\}?/g, (match, key) => {
    const normalisedKey = key.toLowerCase()
    return data[normalisedKey] ?? data[aliases[normalisedKey]] ?? match
  })
}

const guideFiles = import.meta.glob('../../email/guides/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const guides = Object.entries(guideFiles)
  .filter(([path]) => !path.endsWith('/README.md'))
  .map(([path, content]) => {
    const filename = path.split('/').pop()
    const heading = content.match(/^#\s+(.+)$/m)?.[1]
    return {
      id: path,
      type: 'markdown',
      title: heading || toTitle(filename),
      filename,
      content,
      excerpt: firstParagraph(content),
    }
  })
  .sort((a, b) => a.filename.localeCompare(b.filename))
