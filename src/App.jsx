import { useEffect, useMemo, useState } from 'react'
import {
  applyMergeData,
  campaigns,
  contentStats,
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

function Sidebar({ currentView, setCurrentView, open, onClose }) {
  return (
    <>
      {open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-head">
          <BrandMark />
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

function Topbar({ title, query, setQuery, onMenu }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Icon name="menu" /></button>
      <div className="topbar-title"><span>Sunless Studio</span><Icon name="arrow" size={14} /><strong>{title}</strong></div>
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
  const liveCampaign = campaigns.find((campaign) => campaign.status === 'Live')
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

function SequenceTimeline({ campaign }) {
  const sequenceMessages = campaign.messages.filter((message) => !message.isSupplemental)
  return (
    <div className="sequence-timeline">
      {sequenceMessages.map((message, index) => (
        <div className="timeline-item" key={message.id}>
          <div className="timeline-rail"><span className={message.status === 'Live' ? 'live' : ''}>{index + 1}</span>{index < sequenceMessages.length - 1 && <i />}</div>
          <article>
            <div className="timeline-meta"><span>Day {message.day}</span><Status value={message.status} /></div>
            <h3>{message.title}</h3>
            <p>{message.preview}</p>
            <div className="timeline-footer"><span>{message.html ? 'Branded HTML' : 'Plain text'}</span><span>{message.headline || 'Sequence message'}</span></div>
          </article>
        </div>
      ))}
    </div>
  )
}

function Sequences({ selectedCampaignId, onSelectCampaign, onOpenEmail }) {
  const [mode, setMode] = useState('campaigns')
  const campaign = campaigns.find((item) => item.id === selectedCampaignId) || campaigns[0]
  const campaignMessageCount = campaign.messages.filter((message) => !message.isSupplemental).length
  const [lifecycleId, setLifecycleId] = useState(lifecycleSequences[0]?.id)
  const lifecycle = lifecycleSequences.find((item) => item.id === lifecycleId) || lifecycleSequences[0]

  return (
    <div className="page sequences-page">
      <div className="page-intro page-intro-row">
        <div><p className="eyebrow">Journey control</p><h1>Sequences</h1><p>See the whole customer journey before a single message leaves the building.</p></div>
        <div className="segmented"><button className={mode === 'campaigns' ? 'active' : ''} onClick={() => setMode('campaigns')}>Campaigns</button><button className={mode === 'lifecycle' ? 'active' : ''} onClick={() => setMode('lifecycle')}>Lifecycle blueprints</button></div>
      </div>
      {mode === 'campaigns' ? (
        <div className="sequence-layout">
          <aside className="sequence-list panel">
            <div className="sequence-list-head"><span>Campaign sequences</span><b>{campaigns.length}</b></div>
            {campaigns.map((item) => (
              <button key={item.id} className={item.id === campaign.id ? 'active' : ''} onClick={() => onSelectCampaign(item.id)}>
                <span className="flag-tile small">{item.flag}</span><div><strong>{item.name}</strong><small>{item.messages.filter((message) => !message.isSupplemental).length} messages · {item.cadence}</small></div><Status value={item.status} />
              </button>
            ))}
          </aside>
          <section className="sequence-detail panel">
            <div className="sequence-hero">
              <div><div className="sequence-kicker"><span>{campaign.market}</span><span>{campaign.channel}</span><Status value={campaign.status} /></div><h2>{campaign.name}</h2><p>{campaign.hook}. Owned by {campaign.owner}, running across {campaign.cadence}.</p></div>
              <button className="primary-button" onClick={() => onOpenEmail(campaign.id)}><Icon name="mail" />Preview emails</button>
            </div>
            <div className="sequence-summary"><div><strong>{campaignMessageCount}</strong><span>Messages</span></div><div><strong>{campaign.cadence}</strong><span>Total window</span></div><div><strong>Reply</strong><span>Primary goal</span></div></div>
            <SequenceTimeline campaign={campaign} />
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

function EmailStudio({ selectedCampaignId, onSelectCampaign }) {
  const campaign = campaigns.find((item) => item.id === selectedCampaignId) || campaigns.find((item) => item.status === 'Live') || campaigns[0]
  const availableMessages = campaign.messages.filter((message) => message.html)
  const [selectedMessageId, setSelectedMessageId] = useState(availableMessages[0]?.id)
  const [viewport, setViewport] = useState('desktop')
  const [personalised, setPersonalised] = useState(true)
  const message = availableMessages.find((item) => item.id === selectedMessageId) || availableMessages[0]

  useEffect(() => { setSelectedMessageId(availableMessages[0]?.id) }, [campaign.id])
  const previewHtml = personalised ? applyMergeData(message?.html, sampleMergeData) : message?.html

  return (
    <div className="email-studio">
      <div className="email-toolbar">
        <div className="campaign-select-wrap">
          <label>Campaign</label>
          <select value={campaign.id} onChange={(event) => onSelectCampaign(event.target.value)}>
            {campaigns.map((item) => <option key={item.id} value={item.id}>{item.flag} {item.name}</option>)}
          </select>
          <Icon name="chevron" size={15} />
        </div>
        <div className="email-toolbar-title"><span>{message ? `Email ${message.index}` : 'No HTML'}</span><strong>{message?.title || 'No rendered emails in this campaign'}</strong></div>
        <div className="toolbar-actions">
          <div className="viewport-switch"><button className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')} aria-label="Desktop preview"><Icon name="monitor" /></button><button className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')} aria-label="Mobile preview"><Icon name="mobile" /></button></div>
          <button className={`personalise-toggle ${personalised ? 'active' : ''}`} onClick={() => setPersonalised((value) => !value)}><Icon name="spark" />Sample data<span><i /></span></button>
        </div>
      </div>
      <div className="email-workspace">
        <aside className="email-list">
          <div className="email-list-heading"><p className="eyebrow">Rendered emails</p><span>{availableMessages.length}</span></div>
          {availableMessages.map((item) => (
            <button key={item.id} className={item.id === message?.id ? 'active' : ''} onClick={() => setSelectedMessageId(item.id)}>
              <span className="email-index">{String(item.index).padStart(2, '0')}</span>
              <div><strong>{item.title}</strong><small>Day {item.day} · HTML</small></div>
              {item.status === 'Live' && <i className="live-pulse" />}
            </button>
          ))}
          {!availableMessages.length && <div className="empty-list">This campaign has no rendered HTML emails yet.</div>}
          <div className="email-list-note"><Icon name="check" /><p><strong>Read directly from source</strong><span>Rebuild campaign HTML and refresh to see the latest version.</span></p></div>
        </aside>
        <main className="preview-area">
          {message ? (
            <>
              <div className="inbox-header">
                <div><small>Subject</small><strong>{personalised ? applyMergeData(message.title) : message.title}</strong></div>
                <div><small>Preview text</small><span>{personalised ? applyMergeData(message.preview) : message.preview}</span></div>
              </div>
              <div className={`device-frame ${viewport}`}>
                <div className="browser-chrome"><span /><span /><span /><b>{viewport === 'desktop' ? 'Email preview · 680px' : 'Mobile preview · 390px'}</b></div>
                <iframe title={`Preview of ${message.title}`} srcDoc={previewHtml} sandbox="allow-popups" />
              </div>
            </>
          ) : <div className="empty-preview"><Icon name="mail" size={34} /><h2>No HTML preview yet</h2><p>Choose a campaign with a rendered email, or add one to its emails folder.</p></div>}
        </main>
        {message && <aside className="email-inspector">
          <p className="eyebrow">Message details</p>
          <div className="inspector-status"><Status value={message.status} /><span>Day {message.day}</span></div>
          <dl><div><dt>Headline</dt><dd>{message.headline}</dd></div><div><dt>Eyebrow</dt><dd>{message.eyebrow}</dd></div><div><dt>Format</dt><dd>Branded HTML</dd></div><div><dt>Output</dt><dd>{message.output.split('/').pop()}</dd></div></dl>
          <hr />
          <p className="eyebrow">Sample recipient</p>
          <dl className="recipient-data"><div><dt>Name</dt><dd>{sampleMergeData.first_name}</dd></div><div><dt>Salon</dt><dd>{sampleMergeData.salon_name}</dd></div><div><dt>City</dt><dd>{sampleMergeData.city}</dd></div></dl>
        </aside>}
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    if (view !== 'playbooks') setQuery('')
  }
  const openEmail = (campaignId) => { setSelectedCampaignId(campaignId); navigate('emails') }

  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} setCurrentView={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        {currentView !== 'emails' && <Topbar title={title} query={query} setQuery={setQuery} onMenu={() => setSidebarOpen(true)} />}
        {currentView === 'overview' && <Overview onNavigate={navigate} onOpenCampaign={setSelectedCampaignId} />}
        {currentView === 'playbooks' && <Playbooks query={query} />}
        {currentView === 'sequences' && <Sequences selectedCampaignId={selectedCampaignId} onSelectCampaign={setSelectedCampaignId} onOpenEmail={openEmail} />}
        {currentView === 'emails' && <EmailStudio selectedCampaignId={selectedCampaignId} onSelectCampaign={setSelectedCampaignId} />}
      </div>
    </div>
  )
}
