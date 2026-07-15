import { useEffect, useMemo, useRef, useState } from 'react'
import {
  applyMergeData,
  campaigns,
  contentStats,
  guides,
  lifecycleSequences,
  playbookCategories,
  sampleMergeData,
} from './data/content'
import { markdownToHtml } from './lib/markdown'

const icons = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  sequence: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  arrow: '<path d="m9 18 6-6-6-6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  external: '<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  monitor: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8M12 18v4"/>',
  mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  spark: '<path d="m12 3-1.4 3.6a6 6 0 0 1-3.4 3.4L4 11.2l3.2 1.2a6 6 0 0 1 3.4 3.4L12 19l1.4-3.2a6 6 0 0 1 3.4-3.4l3.2-1.2-3.2-1.2a6 6 0 0 1-3.4-3.4Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.4 2.4 0 0 1 4.7.6c0 1.6-2.3 2-2.3 3.2"/><path d="M12 16.8h.01"/>',
}

function Icon({ name, size = 18, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  )
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'playbooks', label: 'Playbooks', icon: 'book' },
  { id: 'sequences', label: 'Sequences', icon: 'sequence' },
  { id: 'emails', label: 'Live emails', icon: 'mail' },
  { id: 'guides', label: 'Help & guides', icon: 'help' },
]

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="Sunless by Jimmy Coco">
      <span>SUNLESS</span>
      <small>BY JIMMY COCO</small>
    </div>
  )
}

function Status({ value }) {
  const kind = value.toLowerCase().replaceAll(' ', '-')
  return <span className={`status status-${kind}`}><i />{value}</span>
}

function Sidebar({ currentView, setCurrentView, open, onClose, onCollapse }) {
  return (
    <>
      {open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head">
          <BrandMark />
          <button className="icon-button sidebar-collapse" onClick={onCollapse} aria-label="Collapse workspace navigation"><Icon name="close" /></button>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation"><Icon name="close" /></button>
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={currentView === item.id ? 'active' : ''}
              onClick={() => { setCurrentView(item.id); onClose() }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'emails' && <b>1</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="environment-card">
            <span className="env-dot" />
            <div>
              <strong>Local workspace</strong>
              <span>Source files connected</span>
            </div>
          </div>
          <div className="profile-row">
            <span className="avatar">MR</span>
            <div><strong>Matt Rogers</strong><span>Administrator</span></div>
            <Icon name="dots" />
          </div>
        </div>
      </aside>
    </>
  )
}

function Topbar({ title, query, setQuery, onMenu, showBreadcrumb = true, compact = false }) {
  return (
    <header className={`topbar ${compact ? 'topbar-compact' : ''}`}>
      <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Icon name="menu" /></button>
      {showBreadcrumb && <div className="topbar-title"><span>Sunless Studio</span><Icon name="arrow" size={14} /><strong>{title}</strong></div>}
      <label className="search-field">
        <Icon name="search" size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the workspace" />
        <kbd>⌘ K</kbd>
      </label>
      <button className="avatar top-avatar" aria-label="Account">MR</button>
    </header>
  )
}

function MetricCard({ value, label, note, accent }) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${accent}`}><Icon name={accent === 'green' ? 'send' : accent === 'bronze' ? 'book' : 'sequence'} /></span>
      <div><strong>{value}</strong><span>{label}</span><small>{note}</small></div>
    </article>
  )
}

function Overview({ onNavigate, onOpenCampaign }) {
  const liveCampaign = campaigns.find((campaign) => campaign.status === 'Live') || campaigns[0]
  const recentDocs = [playbookCategories[0]?.documents[0], playbookCategories[3]?.documents[1], playbookCategories[2]?.documents[0]].filter(Boolean)

  return (
    <div className="page overview-page">
      <section className="welcome-band">
        <div>
          <p className="eyebrow">Tuesday, 14 July</p>
          <h1>Everything in motion,<br /><em>all in one place.</em></h1>
          <p>Review the system, follow every sequence, and see exactly what your customers receive.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('emails')}><Icon name="mail" />View live emails</button>
      </section>

      <section className="metrics-grid" aria-label="Workspace overview">
        <MetricCard value={contentStats.playbooks} label="Playbook chapters" note="Across 7 collections" accent="bronze" />
        <MetricCard value={contentStats.lifecycleSequences} label="Lifecycle sequences" note="Blueprints ready to build" accent="stone" />
        <MetricCard value={contentStats.renderedEmails} label="Rendered emails" note="Live previews available" accent="green" />
      </section>

      <div className="overview-columns">
        <section className="panel active-campaign-panel">
          <div className="section-heading">
            <div><p className="eyebrow">Currently live</p><h2>{liveCampaign.name}</h2></div>
            <button className="text-button" onClick={() => { onOpenCampaign(liveCampaign.id); onNavigate('emails') }}>Open campaign <Icon name="arrow" size={15} /></button>
          </div>
          <div className="campaign-highlight">
            <div className="campaign-highlight-top">
              <span className="flag-tile">{liveCampaign.flag}</span>
              <div><span>{liveCampaign.channel} · {liveCampaign.market}</span><strong>{liveCampaign.hook}</strong></div>
              <Status value="Live" />
            </div>
            <div className="progress-track"><i style={{ width: '24%' }} /></div>
            <div className="campaign-progress-meta"><span><strong>1</strong> of {liveCampaign.messages.length || 5} emails active</span><span>Day 1 of {liveCampaign.cadence}</span></div>
          </div>
          <div className="next-send">
            <span className="send-icon"><Icon name="send" /></span>
            <div><small>Latest live email</small><strong>{liveCampaign.messages[0]?.title}</strong><span>Branded HTML · Ready to inspect</span></div>
            <button className="round-arrow" onClick={() => { onOpenCampaign(liveCampaign.id); onNavigate('emails') }} aria-label="Open email"><Icon name="arrow" /></button>
          </div>
        </section>

        <section className="panel source-panel">
          <div className="section-heading"><div><p className="eyebrow">Source of truth</p><h2>Recently updated</h2></div><button className="text-button" onClick={() => onNavigate('playbooks')}>All playbooks <Icon name="arrow" size={15} /></button></div>
          <div className="recent-list">
            {recentDocs.map((doc, index) => (
              <button key={doc.id} onClick={() => onNavigate('playbooks')}>
                <span className="doc-glyph">0{index + 1}</span>
                <div><strong>{doc.title}</strong><span>{doc.category}</span></div>
                <Icon name="arrow" size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="panel campaign-table-panel">
        <div className="section-heading"><div><p className="eyebrow">Campaign registry</p><h2>All markets</h2></div><button className="secondary-button" onClick={() => onNavigate('sequences')}>View sequences</button></div>
        <div className="campaign-table">
          <div className="campaign-table-head"><span>Campaign</span><span>Channel</span><span>Cadence</span><span>Status</span><span /></div>
          {campaigns.map((campaign) => (
            <button className="campaign-table-row" key={campaign.id} onClick={() => { onOpenCampaign(campaign.id); onNavigate('sequences') }}>
              <span className="campaign-name"><i>{campaign.flag}</i><span><strong>{campaign.name}</strong><small>{campaign.hook}</small></span></span>
              <span>{campaign.channel}</span><span>{campaign.cadence}</span><span><Status value={campaign.status} /></span><span><Icon name="arrow" size={16} /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function Playbooks({ query }) {
  const [categorySlug, setCategorySlug] = useState(playbookCategories[0]?.slug)
  const currentCategory = playbookCategories.find((category) => category.slug === categorySlug) || playbookCategories[0]
  const filteredDocs = useMemo(() => {
    if (!query.trim()) return currentCategory.documents
    const needle = query.toLowerCase()
    return currentCategory.documents.filter((doc) => `${doc.title} ${doc.excerpt} ${doc.content}`.toLowerCase().includes(needle))
  }, [currentCategory, query])
  const [selectedId, setSelectedId] = useState(currentCategory.documents[0]?.id)
  const selected = filteredDocs.find((doc) => doc.id === selectedId) || filteredDocs[0]

  useEffect(() => { setSelectedId(currentCategory.documents[0]?.id) }, [categorySlug, currentCategory])

  return (
    <div className="page playbook-page">
      <div className="page-intro"><p className="eyebrow">The operating system</p><h1>Playbooks</h1><p>Every approved principle, workflow, and production standard—kept close to the work it governs.</p></div>
      <div className="category-tabs" role="tablist">
        {playbookCategories.map((category) => <button key={category.slug} className={category.slug === categorySlug ? 'active' : ''} onClick={() => setCategorySlug(category.slug)}>{category.name}<span>{category.documents.length}</span></button>)}
      </div>
      <div className="library-layout">
        <aside className="document-list panel">
          <div className="document-list-head"><p className="eyebrow">{currentCategory.name}</p><span>{filteredDocs.length} chapters</span></div>
          <p className="category-description">{currentCategory.description}</p>
          <div className="document-buttons">
            {filteredDocs.map((doc, index) => (
              <button key={doc.id} className={doc.id === selected?.id ? 'active' : ''} onClick={() => setSelectedId(doc.id)}>
                <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{doc.title}</strong><small>{doc.excerpt}</small></div><Icon name="arrow" size={15} />
              </button>
            ))}
            {!filteredDocs.length && <div className="empty-list">No chapters match “{query}”.</div>}
          </div>
        </aside>
        <article className="document-viewer panel">
          {selected ? <>
            <div className="document-meta"><span>{selected.category}</span><span>Source file · {selected.filename}</span></div>
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(selected.content) }} />
          </> : <div className="empty-state"><Icon name="search" size={28} /><h3>No document selected</h3><p>Try a broader search.</p></div>}
        </article>
      </div>
    </div>
  )
}

const formatTrigger = (trigger) => trigger
  ? trigger.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  : ''

const getDisplayDay = (day) => Number(day) + 1

const getMessageTimingLabel = (message) => {
  if (!message.isTriggered) return `Day ${getDisplayDay(message.day)}`
  const trigger = formatTrigger(message.trigger) || 'Trigger-based'
  const delay = Number(message.day) > 0 ? `+${message.day} days` : 'Immediate'
  return `${trigger} · ${delay}`
}

function SequenceTimeline({ campaign, analytics, onOpenEmail }) {
  const sequenceMessages = campaign.messages.filter((message) => !message.isSupplemental)
  const getWaitLabel = (message, nextMessage) => {
    if (message.isTriggered || nextMessage.isTriggered) return 'Next event'
    const waitDays = Number(nextMessage.day) - Number(message.day)
    return waitDays === 1 ? 'Wait 1 day' : `Wait ${waitDays} days`
  }
  const rate = (value, total, enabled = true) => {
    if (!enabled) return 'Off'
    return Number(total) ? `${Math.round((Number(value || 0) / Number(total)) * 100)}%` : '—'
  }
  const campaignStats = analytics.campaign || {}

  return (
    <div className="sequence-timeline">
      <section className="sequence-performance" aria-label="Live campaign performance">
        <div className="sequence-performance-label">
          <span><i />Live performance</span>
          <small>{analytics.loading ? 'Refreshing…' : analytics.configured ? 'Refreshes every 15 seconds' : 'Supabase connection required'}</small>
        </div>
        <div className="sequence-performance-metrics">
          <div><span>Sent</span><strong>{campaignStats.sent || 0}</strong></div>
          <div><span>Delivered</span><strong>{rate(campaignStats.delivered, campaignStats.sent)}</strong></div>
          <div><span>Opened</span><strong>{rate(campaignStats.opened, campaignStats.delivered, analytics.tracking?.opens)}</strong></div>
          <div><span>Clicked</span><strong>{rate(campaignStats.clicked, campaignStats.delivered, analytics.tracking?.clicks)}</strong></div>
          <div><span>Responses</span><strong>{Number(campaignStats.replies || 0) + Number(campaignStats.conversions || 0)}</strong></div>
        </div>
      </section>

      <section className="email-sequence-board" aria-label={`${campaign.name} emails`}>
        <div className="email-sequence-board-head">
          <span>Email</span><span>Subject and preview</span><span>Live email performance</span><span />
        </div>
        {sequenceMessages.map((message, index) => {
          const nextMessage = sequenceMessages[index + 1]
          const stats = analytics.steps.find((step) => Number(step.step_number) === message.index) || {}
          return (
            <div className="email-board-segment" key={message.id}>
              <button className="email-board-row" onClick={() => onOpenEmail(campaign.id, message.id)} aria-label={`Open email ${index + 1}: ${message.title}`}>
                <div className="email-board-position">
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                  <span>{message.isTriggered ? 'Triggered' : `Day ${getDisplayDay(message.day)}`}</span>
                </div>
                <div className="email-board-copy">
                  <div><span className={`email-plan-status ${message.status.toLowerCase()}`}><i />{message.status}</span></div>
                  <strong>{message.title}</strong>
                  <small>{message.preview}</small>
                </div>
                <div className="email-board-stats">
                  <span><b>{stats.sent || 0}</b>Sent</span>
                  <span><b>{rate(stats.delivered, stats.sent)}</b>Delivered</span>
                  <span><b>{rate(stats.opened, stats.delivered, analytics.tracking?.opens)}</b>Opened</span>
                  <span><b>{rate(stats.clicked, stats.delivered, analytics.tracking?.clicks)}</b>Clicked</span>
                </div>
                <Icon name="arrow" size={18} />
              </button>
              {nextMessage && <div className="email-wait-marker"><i /><span>{getWaitLabel(message, nextMessage)}</span></div>}
            </div>
          )
        })}
      </section>
    </div>
  )
}

function Sequences({ selectedCampaignId, onSelectCampaign, onOpenEmail }) {
  const [mode, setMode] = useState('campaigns')
  const [marketFilter, setMarketFilter] = useState('all')
  const marketOptions = useMemo(() => {
    const options = new Map()
    campaigns.forEach((item) => {
      if (!options.has(item.market)) options.set(item.market, { market: item.market, flag: item.flag })
    })
    return [...options.values()]
  }, [])
  const filteredCampaigns = useMemo(
    () => marketFilter === 'all' ? campaigns : campaigns.filter((item) => item.market === marketFilter),
    [marketFilter],
  )
  const campaign = filteredCampaigns.find((item) => item.id === selectedCampaignId) || filteredCampaigns[0] || campaigns[0]
  const [lifecycleId, setLifecycleId] = useState(lifecycleSequences[0]?.id)
  const lifecycle = lifecycleSequences.find((item) => item.id === lifecycleId) || lifecycleSequences[0]
  const [analytics, setAnalytics] = useState({ loading: true, configured: null, campaign: null, steps: [], tracking: null })

  useEffect(() => {
    if (mode === 'campaigns' && campaign.id !== selectedCampaignId) onSelectCampaign(campaign.id)
  }, [campaign.id, mode, onSelectCampaign, selectedCampaignId])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/campaigns/stats?campaign_id=${encodeURIComponent(campaign.id)}`)
        const data = await response.json()
        if (!cancelled) setAnalytics({ loading: false, configured: Boolean(data.configured), campaign: data.campaign, steps: data.steps || [], tracking: data.tracking })
      } catch {
        if (!cancelled) setAnalytics({ loading: false, configured: false, campaign: null, steps: [], tracking: null })
      }
    }
    setAnalytics((current) => ({ ...current, loading: true }))
    load()
    const interval = window.setInterval(load, 15000)
    return () => { cancelled = true; window.clearInterval(interval) }
  }, [campaign.id])

  return (
    <div className="page sequences-page">
      <div className="sequence-page-header">
        <div className="sequence-page-heading"><p className="eyebrow">Journey control</p><h1>Sequences</h1></div>
        <div className="sequence-page-actions">
          {mode === 'campaigns' && (
            <label className="country-filter">
              <span>Country</span>
              <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)} aria-label="Filter campaign sequences by country">
                <option value="all">All countries</option>
                {marketOptions.map((option) => <option key={option.market} value={option.market}>{option.flag} {option.market === 'US-West-Coast' ? 'US' : option.market}</option>)}
              </select>
              <Icon name="chevron" size={15} />
            </label>
          )}
          <div className="segmented"><button className={mode === 'campaigns' ? 'active' : ''} onClick={() => setMode('campaigns')}>Campaigns</button><button className={mode === 'lifecycle' ? 'active' : ''} onClick={() => setMode('lifecycle')}>Lifecycle blueprints</button></div>
        </div>
      </div>
      {mode === 'campaigns' ? (
        <div className="sequence-layout">
          <aside className="sequence-list panel">
            <div className="sequence-list-head"><span>Campaign sequences</span><b>{filteredCampaigns.length}</b></div>
            {filteredCampaigns.map((item) => (
              <button key={item.id} className={item.id === campaign.id ? 'active' : ''} onClick={() => onSelectCampaign(item.id)}>
                <span className="flag-tile small">{item.flag}</span><div><strong>{item.name}</strong><small>{item.hook}</small></div><Status value={item.status} />
              </button>
            ))}
          </aside>
          <section className="sequence-detail panel">
            <div className="sequence-hero">
              <div className="sequence-hero-copy">
                <div className="sequence-kicker"><span className="sequence-market-flag">{campaign.flag}</span><span>{campaign.market}</span><i /> <span>{campaign.channel}</span><Status value={campaign.status} /></div>
                <h2>{campaign.name}</h2>
                <p>{campaign.hook}</p>
                <div className="sequence-ownership"><span><b>Owner</b>{campaign.owner}</span></div>
              </div>
            </div>
            <SequenceTimeline campaign={campaign} analytics={analytics} onOpenEmail={onOpenEmail} />
          </section>
        </div>
      ) : (
        <div className="sequence-layout">
          <aside className="sequence-list lifecycle-list panel">
            <div className="sequence-list-head"><span>Lifecycle systems</span><b>{lifecycleSequences.length}</b></div>
            {lifecycleSequences.map((item) => <button key={item.id} className={item.id === lifecycle.id ? 'active' : ''} onClick={() => setLifecycleId(item.id)}><span className="sequence-number">{item.id.slice(0, 2)}</span><div><strong>{item.title}</strong><small>{item.emailCount} emails · Blueprint</small></div></button>)}
          </aside>
          <section className="sequence-detail panel lifecycle-detail">
            <div className="sequence-hero"><div><div className="sequence-kicker"><Status value="Blueprint" /><span>{lifecycle.emailCount} emails</span></div><h2>{lifecycle.title}</h2><p>{lifecycle.description}</p></div></div>
            <div className="blueprint-grid">
              {lifecycle.documents.map((doc, index) => <article key={doc.id}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{doc.title}</h3><small>{doc.filename}</small></div><Icon name="check" /></article>)}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function EmailStudio({ selectedCampaignId, selectedEmailId, onSelectCampaign }) {
  const campaign = campaigns.find((item) => item.id === selectedCampaignId) || campaigns.find((item) => item.status === 'Live') || campaigns[0]
  const availableMessages = useMemo(() => campaign.messages.filter((message) => message.html), [campaign])
  const sequenceMessages = useMemo(() => availableMessages.filter((item) => !item.isSupplemental), [availableMessages])
  const [selectedMessageId, setSelectedMessageId] = useState(
    availableMessages.some((item) => item.id === selectedEmailId) ? selectedEmailId : availableMessages[0]?.id,
  )
  const [viewport, setViewport] = useState('desktop')
  const [personalised, setPersonalised] = useState(true)
  const [analytics, setAnalytics] = useState({ loading: true, configured: null, campaign: null, steps: [] })
  const studioRef = useRef(null)
  const previewFrameRef = useRef(null)
  const message = availableMessages.find((item) => item.id === selectedMessageId) || availableMessages[0]
  const sequenceDuration = sequenceMessages.at(-1)?.day ?? 0

  useEffect(() => {
    setSelectedMessageId(availableMessages.some((item) => item.id === selectedEmailId) ? selectedEmailId : availableMessages[0]?.id)
  }, [availableMessages, campaign.id, selectedEmailId])
  useEffect(() => {
    const handleSequenceKeydown = (event) => {
      if (
        event.defaultPrevented
        || event.isComposing
        || event.metaKey
        || event.ctrlKey
        || event.altKey
        || event.shiftKey
        || !sequenceMessages.length
      ) return

      const digitMatch = event.code?.match(/^(?:Digit|Numpad)([1-9])$/)
      if (digitMatch) {
        const requestedMessage = sequenceMessages[Number(digitMatch[1]) - 1]
        if (!requestedMessage) return
        event.preventDefault()
        setSelectedMessageId(requestedMessage.id)
        return
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const direction = event.key === 'ArrowRight' ? 1 : -1
      const currentIndex = sequenceMessages.findIndex((item) => item.id === selectedMessageId)
      const nextIndex = currentIndex === -1
        ? (direction === 1 ? 0 : sequenceMessages.length - 1)
        : (currentIndex + direction + sequenceMessages.length) % sequenceMessages.length
      setSelectedMessageId(sequenceMessages[nextIndex].id)
    }
    const frame = previewFrameRef.current
    const attachToPreview = () => frame?.contentWindow?.addEventListener('keydown', handleSequenceKeydown)

    window.addEventListener('keydown', handleSequenceKeydown)
    frame?.addEventListener('load', attachToPreview)
    attachToPreview()
    return () => {
      window.removeEventListener('keydown', handleSequenceKeydown)
      frame?.removeEventListener('load', attachToPreview)
      frame?.contentWindow?.removeEventListener('keydown', handleSequenceKeydown)
    }
  }, [selectedMessageId, sequenceMessages])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/campaigns/stats?campaign_id=${encodeURIComponent(campaign.id)}`)
        const data = await response.json()
        if (!cancelled) setAnalytics({ loading: false, configured: Boolean(data.configured), campaign: data.campaign, steps: data.steps || [], tracking: data.tracking })
      } catch {
        if (!cancelled) setAnalytics({ loading: false, configured: false, campaign: null, steps: [] })
      }
    }
    load()
    const interval = window.setInterval(load, 15000)
    return () => { cancelled = true; window.clearInterval(interval) }
  }, [campaign.id])
  useEffect(() => {
    const studio = studioRef.current
    if (!studio) return undefined
    const scrollEmailPreview = (event) => {
      const frameWindow = previewFrameRef.current?.contentWindow
      if (!frameWindow) return
      const multiplier = event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? window.innerHeight : 1
      event.preventDefault()
      frameWindow.scrollBy(event.deltaX * multiplier, event.deltaY * multiplier)
    }
    studio.addEventListener('wheel', scrollEmailPreview, { passive: false })
    return () => studio.removeEventListener('wheel', scrollEmailPreview)
  }, [])
  const previewHtml = personalised ? applyMergeData(message?.html, sampleMergeData) : message?.html
  const campaignStats = analytics.campaign || {}
  const selectedStepStats = analytics.steps.find((step) => Number(step.step_number) === message?.index)
  const rate = (value, total) => Number(total) ? `${Math.round((Number(value || 0) / Number(total)) * 100)}%` : '—'

  return (
    <div className="email-studio" ref={studioRef}>
      <div className="email-toolbar">
        <div className="campaign-select-wrap">
          <label>Campaign</label>
          <select value={campaign.id} onChange={(event) => onSelectCampaign(event.target.value)}>
            {campaigns.map((item) => <option key={item.id} value={item.id}>{item.flag} {item.name}</option>)}
          </select>
          <Icon name="chevron" size={15} />
        </div>
        <div className="email-toolbar-title"><span>{message ? (
          message.isSupplemental
            ? 'Supplemental triggered email'
            : message.isTriggered
              ? `Triggered email ${String(message.index).padStart(2, '0')} of ${String(sequenceMessages.length).padStart(2, '0')} · ${formatTrigger(message.trigger) || 'Event based'}`
              : `Sequence email ${String(message.index).padStart(2, '0')} of ${String(sequenceMessages.length).padStart(2, '0')} · Day ${getDisplayDay(message.day)}`
        ) : 'No HTML'}</span><strong>{message?.title || 'No rendered emails in this campaign'}</strong></div>
        <div className="toolbar-actions">
          <div className="viewport-switch"><button className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')} aria-label="Desktop preview"><Icon name="monitor" /></button><button className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')} aria-label="Mobile preview"><Icon name="mobile" /></button></div>
          <button className={`personalise-toggle ${personalised ? 'active' : ''}`} onClick={() => setPersonalised((value) => !value)}><Icon name="spark" />Sample data<span><i /></span></button>
        </div>
      </div>
      <div className="email-workspace">
        <aside className="email-list">
          <div className="email-list-heading"><p className="eyebrow">Rendered emails</p><span>{availableMessages.length}</span></div>
          {!!sequenceMessages.length && (
            <div className="email-flow-summary">
              <div className="email-flow-meta"><strong>{campaign.mode === 'event' ? 'Event flow' : 'Sequence'}</strong><span>{campaign.mode === 'event' ? `${sequenceMessages.length} triggered emails` : `${sequenceMessages.length} emails · ${sequenceDuration} days`}</span></div>
              <div className="email-flow-track" aria-label={`${campaign.name} ${campaign.mode === 'event' ? 'triggered event flow' : 'send-day flow'}`}>
                {sequenceMessages.map((item, index) => {
                  const nextMessage = sequenceMessages[index + 1]
                  return (
                    <div className="email-flow-segment" key={item.id}>
                      <button
                        className={item.id === message?.id ? 'active' : ''}
                        onClick={() => setSelectedMessageId(item.id)}
                        aria-label={item.isTriggered ? `Open triggered email ${item.index}: ${formatTrigger(item.trigger) || 'event based'}` : `Open sequence email ${item.index}, sent on day ${getDisplayDay(item.day)}`}
                        aria-pressed={item.id === message?.id}
                        aria-keyshortcuts={index < 9 ? String(index + 1) : undefined}
                      >
                        <b>{String(item.index).padStart(2, '0')}</b>
                        <span>{item.isTriggered ? (Number(item.day) > 0 ? `+${item.day}d` : 'Now') : `D${getDisplayDay(item.day)}`}</span>
                      </button>
                      {nextMessage && <i />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div className="email-sequence">
            {availableMessages.map((item) => (
                <div className="email-sequence-step" key={item.id}>
                  <button
                    className={item.id === message?.id ? 'active' : ''}
                    onClick={() => setSelectedMessageId(item.id)}
                    aria-pressed={item.id === message?.id}
                  >
                    <span className="email-index">{item.isSupplemental ? '+' : String(item.index).padStart(2, '0')}</span>
                    <div className="email-step-copy">
                      <span className={`email-send-day ${item.isTriggered ? 'triggered' : ''}`}>{item.isTriggered ? 'Trigger-based' : `Day ${getDisplayDay(item.day)}`}</span>
                      <strong>{personalised ? applyMergeData(item.title, sampleMergeData) : item.title}</strong>
                    </div>
                    {item.status === 'Live' && <i className="live-pulse" />}
                  </button>
                </div>
            ))}
          </div>
          {!availableMessages.length && <div className="empty-list">This campaign has no rendered HTML emails yet.</div>}
          <div className="email-list-note"><Icon name="check" /><p><strong>Read directly from source</strong><span>Rebuild campaign HTML and refresh to see the latest version.</span></p></div>
        </aside>
        <main className="preview-area">
          {message ? (
            <>
              <section className="performance-strip" aria-label="Live campaign performance">
                <div className="performance-heading">
                  <span><i />Live performance</span>
                  <small>{analytics.loading ? 'Refreshing…' : analytics.configured ? `${campaign.name} · refreshes every 15 seconds` : 'Supabase connection required'}</small>
                </div>
                {analytics.configured ? (
                  <div className="performance-metrics">
                    <div><strong>{campaignStats.sent || 0}</strong><span>Sent</span></div>
                    <div><strong>{rate(campaignStats.delivered, campaignStats.sent)}</strong><span>Delivered</span></div>
                    <div><strong>{analytics.tracking?.opens ? rate(campaignStats.opened, campaignStats.delivered) : 'Off'}</strong><span>Opened</span></div>
                    <div><strong>{analytics.tracking?.clicks ? rate(campaignStats.clicked, campaignStats.delivered) : 'Off'}</strong><span>Clicked</span></div>
                    <div><strong>{Number(campaignStats.replies || 0) + Number(campaignStats.conversions || 0)}</strong><span>Responses</span></div>
                    <div className="step-performance"><strong>{selectedStepStats?.sent || 0}</strong><span>Email {message.index} sent</span></div>
                  </div>
                ) : (
                  <p className="performance-empty">The dashboard is ready. Apply the Supabase migration and connect the Vercel environment to begin collecting verified Resend events.</p>
                )}
              </section>
              <div className="inbox-header">
                <div><small>Subject</small><strong>{personalised ? applyMergeData(message.title) : message.title}</strong></div>
                <div><small>Preview text</small><span>{personalised ? applyMergeData(message.preview) : message.preview}</span></div>
              </div>
              <div className={`device-frame ${viewport}`}>
                <div className="browser-chrome"><span /><span /><span /><b>{viewport === 'desktop' ? 'Email preview · 680px' : 'Mobile preview · 390px'}</b></div>
                <iframe ref={previewFrameRef} title={`Preview of ${message.title}`} srcDoc={previewHtml} sandbox="allow-popups allow-same-origin" />
              </div>
            </>
          ) : <div className="empty-preview"><Icon name="mail" size={34} /><h2>No HTML preview yet</h2><p>Choose a campaign with a rendered email, or add one to its emails folder.</p></div>}
        </main>
        {message && <aside className="email-inspector">
          <p className="eyebrow">Message details</p>
          <div className="inspector-status"><Status value={message.status} /><span>{
            message.isSupplemental
              ? 'Trigger-based supplemental'
              : message.isTriggered
                ? `Triggered email ${String(message.index).padStart(2, '0')} of ${String(sequenceMessages.length).padStart(2, '0')}`
                : `Email ${String(message.index).padStart(2, '0')} of ${String(sequenceMessages.length).padStart(2, '0')} · Day ${getDisplayDay(message.day)}`
          }</span></div>
          <dl><div><dt>Headline</dt><dd>{message.headline}</dd></div><div><dt>Eyebrow</dt><dd>{message.eyebrow}</dd></div><div><dt>Format</dt><dd>Branded HTML</dd></div><div><dt>Output</dt><dd>{message.output.split('/').pop()}</dd></div></dl>
          <hr />
          <p className="eyebrow">Sample recipient</p>
          <dl className="recipient-data"><div><dt>Name</dt><dd>{sampleMergeData.first_name}</dd></div><div><dt>Salon</dt><dd>{sampleMergeData.salon_name}</dd></div><div><dt>City</dt><dd>{sampleMergeData.city}</dd></div></dl>
        </aside>}
      </div>
    </div>
  )
}

function Guides({ query }) {
  const allGuides = useMemo(() => ([
    ...guides,
    {
      id: 'report-subject-line-system',
      type: 'report',
      title: 'Subject lines: flow, guardrails & gates',
      excerpt: 'The branded end-to-end report — how subjects are produced, constrained and approved.',
      filename: 'subject-line-system-report.html',
      src: '/guides/subject-line-system-report.html',
      content: 'subject line preview report flow guardrails gates requirements branded reference',
    },
  ]), [])
  const filtered = useMemo(() => {
    if (!query.trim()) return allGuides
    const needle = query.toLowerCase()
    return allGuides.filter((doc) => `${doc.title} ${doc.excerpt} ${doc.content}`.toLowerCase().includes(needle))
  }, [allGuides, query])
  const [selectedId, setSelectedId] = useState(allGuides[0]?.id)
  const selected = filtered.find((doc) => doc.id === selectedId) || filtered[0]

  return (
    <div className="page playbook-page">
      <div className="page-intro"><p className="eyebrow">Learn the system</p><h1>Help &amp; guides</h1><p>How to request, generate and release Sunless campaigns — written for every employee. No tooling or repository knowledge required.</p></div>
      <div className="library-layout">
        <aside className="document-list panel">
          <div className="document-list-head"><p className="eyebrow">Guides</p><span>{filtered.length} guides</span></div>
          <p className="category-description">Read in order the first time — start with requesting a campaign. The branded subject-line report sits at the end as the shareable reference. The playbooks remain the canonical rules.</p>
          <div className="document-buttons">
            {filtered.map((doc, index) => (
              <button key={doc.id} className={doc.id === selected?.id ? 'active' : ''} onClick={() => setSelectedId(doc.id)}>
                <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{doc.title}</strong><small>{doc.excerpt}</small></div><Icon name="arrow" size={15} />
              </button>
            ))}
            {!filtered.length && <div className="empty-list">No guides match “{query}”.</div>}
          </div>
        </aside>
        <article className="document-viewer panel">
          {selected ? (selected.type === 'report' ? (
            <>
              <div className="document-meta"><span>Branded report</span><span>Source file · public/guides/{selected.filename}</span></div>
              <iframe title={selected.title} src={selected.src} style={{ width: '100%', minHeight: '78vh', border: '1px solid rgba(36, 33, 30, 0.12)', borderRadius: '12px', background: '#EAE2D8' }} />
            </>
          ) : (
            <>
              <div className="document-meta"><span>Help &amp; guides</span><span>Source file · {selected.filename}</span></div>
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(selected.content) }} />
            </>
          )) : <div className="empty-state"><Icon name="search" size={28} /><h3>No guide selected</h3><p>Try a broader search.</p></div>}
        </article>
      </div>
    </div>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const hashView = window.location.hash.replace('#', '')
    return navItems.some((item) => item.id === hashView) ? hashView : 'overview'
  })
  const [query, setQuery] = useState('')
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns.find((item) => item.status === 'Live')?.id || campaigns[0]?.id)
  const [selectedEmailId, setSelectedEmailId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem('sunless-sidebar-collapsed') === 'true')
  const title = navItems.find((item) => item.id === currentView)?.label || 'Overview'

  useEffect(() => {
    const handleKeydown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector('.search-field input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hashView = window.location.hash.replace('#', '')
      if (navItems.some((item) => item.id === hashView)) setCurrentView(hashView)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (view) => {
    window.location.hash = view
    setCurrentView(view)
    if (view === 'emails') {
      setSidebarCollapsed(true)
      setSidebarOpen(false)
      window.localStorage.setItem('sunless-sidebar-collapsed', 'true')
    }
    if (view !== 'playbooks' && view !== 'guides') setQuery('')
  }
  const openEmail = (campaignId, emailId = null) => {
    setSelectedCampaignId(campaignId)
    setSelectedEmailId(emailId)
    navigate('emails')
  }
  const collapseSidebar = () => {
    setSidebarCollapsed(true)
    setSidebarOpen(false)
    window.localStorage.setItem('sunless-sidebar-collapsed', 'true')
  }
  const openSidebar = () => {
    setSidebarCollapsed(false)
    setSidebarOpen(true)
    window.localStorage.setItem('sunless-sidebar-collapsed', 'false')
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} ${currentView === 'emails' ? 'emails-view' : ''} ${currentView === 'sequences' ? 'sequences-view' : ''}`}>
      <Sidebar currentView={currentView} setCurrentView={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCollapse={collapseSidebar} />
      <button className="nav-reopen" onClick={openSidebar} aria-label="Open workspace navigation"><Icon name="menu" /></button>
      <div className="app-main">
        {currentView !== 'emails' && currentView !== 'sequences' && <Topbar title={title} query={query} setQuery={setQuery} onMenu={openSidebar} />}
        {currentView === 'overview' && <Overview onNavigate={navigate} onOpenCampaign={setSelectedCampaignId} />}
        {currentView === 'playbooks' && <Playbooks query={query} />}
        {currentView === 'guides' && <Guides query={query} />}
        {currentView === 'sequences' && <Sequences selectedCampaignId={selectedCampaignId} onSelectCampaign={setSelectedCampaignId} onOpenEmail={openEmail} />}
        {currentView === 'emails' && <EmailStudio selectedCampaignId={selectedCampaignId} selectedEmailId={selectedEmailId} onSelectCampaign={setSelectedCampaignId} />}
      </div>
    </div>
  )
}
