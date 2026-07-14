import auSeedingData from '../../email/campaigns/au-salon-seeding/email-data.json'
import auAccountData from '../../email/campaigns/au-salon-account-flow/email-data.json'
import ukStockistData from '../../email/campaigns/uk-salon-stockist/email-data.json'
import uaeStockistData from '../../email/campaigns/uae-dubai-salon-stockist/email-data.json'
import { campaignsById } from '../../shared/campaign-registry.js'

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

const campaignDefinitions = [
  {
    id: 'au-salon-seeding',
    name: 'AU Salon Seeding',
    shortName: 'AU Seeding',
    market: 'AU',
    flag: '🇦🇺',
    status: 'Draft',
    hook: 'Free sample before summer',
    channel: 'Email + WhatsApp',
    cadence: '20 days',
    owner: 'Partnerships',
    data: auSeedingData,
  },
  {
    id: 'au-salon-account-flow',
    name: 'AU Salon Account Flow',
    shortName: 'AU Account',
    market: 'AU',
    flag: '🇦🇺',
    status: 'Draft',
    hook: 'Sample to first order',
    channel: 'Email + WhatsApp',
    cadence: '14 days',
    owner: 'Partnerships',
    data: auAccountData,
  },
  {
    id: 'uk-salon-stockist',
    name: 'UK Stockist Recruitment',
    shortName: 'UK Stockists',
    market: 'UK',
    flag: '🇬🇧',
    status: 'Live',
    hook: 'Your clients know this name',
    channel: 'Email',
    cadence: '21 days',
    owner: 'UK Sales',
    data: ukStockistData,
  },
  {
    id: 'uae-dubai-salon-stockist',
    name: 'Dubai Stockist Recruitment',
    shortName: 'Dubai Stockists',
    market: 'UAE',
    flag: '🇦🇪',
    status: 'Draft',
    hook: 'Premium professional trial',
    channel: 'Email',
    cadence: '18 days',
    owner: 'Middle East Sales',
    data: uaeStockistData,
  },
]

const resolveCampaignHtml = (campaignId, output) => {
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

export const campaigns = campaignDefinitions.map((campaign) => ({
  ...campaign,
  messages: campaign.data.messages.map((message, index) => {
    const { html, htmlPath } = resolveCampaignHtml(campaign.id, message.output)
    const registryCampaign = campaignsById[campaign.id]
    const registryStep = registryCampaign?.steps[index]
    const isTriggered = registryCampaign?.mode === 'event' || /onboarding/i.test(message.output)
    return {
      ...message,
      id: `${campaign.id}-${index + 1}`,
      index: index + 1,
      day: registryStep?.day ?? registryStep?.delayDays ?? index * 3,
      trigger: registryStep?.trigger,
      templateAlias: registryStep?.templateAlias,
      html,
      htmlPath,
      isSupplemental: isTriggered,
      status: campaign.status === 'Live' && index === 0 ? 'Live' : 'Ready',
    }
  }),
}))

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

export const contentStats = {
  playbooks: playbookCategories.reduce((total, category) => total + category.documents.length, 0),
  lifecycleSequences: lifecycleSequences.length,
  campaigns: campaigns.length,
  renderedEmails: campaigns.reduce((total, campaign) => total + campaign.messages.filter((message) => message.html).length, 0),
}

export const sampleMergeData = {
  first_name: 'Sophie',
  salon_name: 'Maison Glow',
  city: 'London',
  sender_name: 'Matt',
  sender_title: 'Partnerships, Sunless by Jimmy Coco',
  sender_email: 'partnerships@sunlessbyjimmycoco.com',
  calendar_link: '#book-a-call',
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
