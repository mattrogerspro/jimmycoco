import { useEffect, useMemo, useRef, useState } from 'react'
import {
  activeCampaigns,
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
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  spark: '<path d="m12 3-1.4 3.6a6 6 0 0 1-3.4 3.4L4 11.2l3.2 1.2a6 6 0 0 1 3.4 3.4L12 19l1.4-3.2a6 6 0 0 1 3.4-3.4l3.2-1.2-3.2-1.2a6 6 0 0 1-3.4-3.4Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
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
  { id: 'klaviyo', label: 'Klaviyo previews', icon: 'monitor' },
  { id: 'guides', label: 'Help & guides', icon: 'help' },
  { id: 'audience-import', label: 'Audience importer', icon: 'upload', admin: true },
]

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="Sunless by Jimmy Coco">
      <span>SUNLESS</span>
      <small>BY JIMMY COCO</small>
    </div>
  )
}

function initialsFor(value) {
  return String(value || 'Email admin')
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'EA'
}

function Status({ value }) {
  const kind = value.toLowerCase().replaceAll(' ', '-')
  return <span className={`status status-${kind}`} title={value}><i /><span>{value}</span></span>
}

function Sidebar({ currentView, setCurrentView, open, onClose, onCollapse, user, onLogout }) {
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
          {navItems.filter((item) => !item.admin).map((item) => (
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
          <p className="nav-label nav-label-admin">Admin</p>
          {navItems.filter((item) => item.admin).map((item) => (
            <button
              key={item.id}
              className={currentView === item.id ? 'active' : ''}
              onClick={() => { setCurrentView(item.id); onClose() }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
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
            <span className="avatar">{initialsFor(user?.display_name || user?.email)}</span>
            <div><strong>{user?.display_name || user?.email || 'Email admin'}</strong><span>Super admin</span></div>
            <button className="profile-logout" type="button" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </aside>
    </>
  )
}

function Topbar({ title, query, setQuery, onMenu, user, onLogout, showBreadcrumb = true, compact = false }) {
  return (
    <header className={`topbar ${compact ? 'topbar-compact' : ''}`}>
      <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Icon name="menu" /></button>
      {showBreadcrumb && <div className="topbar-title"><span>Sunless Studio</span><Icon name="arrow" size={14} /><strong>{title}</strong></div>}
      <label className="search-field">
        <Icon name="search" size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the workspace" />
        <kbd>⌘ K</kbd>
      </label>
      <button className="email-admin-pill" type="button" onClick={onLogout} title="Sign out">
        <span className="avatar top-avatar">{initialsFor(user?.display_name || user?.email)}</span>
        <span>Super admin</span>
      </button>
    </header>
  )
}

function authErrorMessage(error) {
  if (error === 'invalid_credentials') return 'That email address or password was not accepted.'
  if (error === 'email_admin_access_denied') return 'This account is not enabled as a jimmycoco.email super admin.'
  if (error === 'email_admin_access_migration_not_applied') return 'The email admin access migration has not been applied yet.'
  if (error === 'email_admin_session_secret_not_configured') return 'EMAIL_ADMIN_SESSION_SECRET is not configured.'
  if (error === 'supabase_auth_not_configured') return 'Supabase Auth environment variables are not configured for this app.'
  return 'Sign-in is temporarily unavailable.'
}

function EmailAdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'login_failed')
      onLogin(data.user)
    } catch (err) {
      setError(authErrorMessage(err instanceof Error ? err.message : 'login_failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="email-auth-screen">
      <section className="email-auth-card">
        <BrandMark />
        <p className="eyebrow">Private campaign operations</p>
        <h1>Sign in to jimmycoco.email</h1>
        <p>The email playbook, live sequence controls and audience importer are restricted to super admins.</p>
        {error && <p className="email-auth-error" role="alert">{error}</p>}
        <form className="email-auth-form" onSubmit={submit}>
          <label>
            <span>Email address</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" inputMode="email" required autoFocus />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}<Icon name="arrow" size={15} /></button>
        </form>
        <small>Uses the same staff identity source as the pro admin, with separate access for the email domain.</small>
      </section>
    </main>
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

function CopyLink({ parts }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const hash = parts.filter((part) => part !== null && part !== undefined && part !== '').map((part) => encodeURIComponent(String(part))).join('/')
    const url = `${window.location.origin}${window.location.pathname}#${hash}`
    const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(() => window.prompt('Copy this link', url))
    else window.prompt('Copy this link', url)
  }
  return (
    <button className="text-button" onClick={copy} title="Copy a shareable link to this exact page" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
      <Icon name="link" size={13} /> {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}

function Overview({ routeTo }) {
  const liveCampaign = activeCampaigns.find((campaign) => campaign.status === 'Live') || activeCampaigns[0] || campaigns[0]
  const recentDocs = [playbookCategories[0]?.documents[0], playbookCategories[3]?.documents[1], playbookCategories[2]?.documents[0]].filter(Boolean)
  const categorySlugOf = (doc) => doc.id.split('/email/')[1]?.split('/')[0]

  return (
    <div className="page overview-page">
      <section className="welcome-band">
        <div>
          <p className="eyebrow">Tuesday, 14 July</p>
          <h1>Everything in motion,<br /><em>all in one place.</em></h1>
          <p>Review the system, follow every sequence, and see exactly what your customers receive.</p>
        </div>
        <button className="primary-button" onClick={() => routeTo(['emails'])}><Icon name="mail" />View live emails</button>
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
            <button className="text-button" onClick={() => routeTo(['emails', liveCampaign.id])}>Open campaign <Icon name="arrow" size={15} /></button>
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
            <button className="round-arrow" onClick={() => routeTo(['emails', liveCampaign.id, liveCampaign.messages[0]?.index])} aria-label="Open email"><Icon name="arrow" /></button>
          </div>
        </section>

        <section className="panel source-panel">
          <div className="section-heading"><div><p className="eyebrow">Source of truth</p><h2>Recently updated</h2></div><button className="text-button" onClick={() => routeTo(['playbooks'])}>All playbooks <Icon name="arrow" size={15} /></button></div>
          <div className="recent-list">
            {recentDocs.map((doc, index) => (
              <button key={doc.id} onClick={() => routeTo(['playbooks', categorySlugOf(doc), doc.filename])}>
                <span className="doc-glyph">0{index + 1}</span>
                <div><strong>{doc.title}</strong><span>{doc.category}</span></div>
                <Icon name="arrow" size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="panel campaign-table-panel">
        <div className="section-heading"><div><p className="eyebrow">Campaign registry</p><h2>All markets</h2></div><button className="secondary-button" onClick={() => routeTo(['sequences'])}>View sequences</button></div>
        <div className="campaign-table">
          <div className="campaign-table-head"><span>Campaign</span><span>Channel</span><span>Cadence</span><span>Status</span><span /></div>
          {activeCampaigns.map((campaign) => (
            <button className="campaign-table-row" key={campaign.id} onClick={() => routeTo(['sequences', campaign.id])}>
              <span className="campaign-name"><i>{campaign.flag}</i><span><strong>{campaign.name}</strong><small>{campaign.hook}</small></span></span>
              <span>{campaign.channel}</span><span>{campaign.cadence}</span><span><Status value={campaign.status} /></span><span><Icon name="arrow" size={16} /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function Playbooks({ query, category, doc, routeTo }) {
  const currentCategory = playbookCategories.find((item) => item.slug === category) || playbookCategories[0]
  const filteredDocs = useMemo(() => {
    if (!query.trim()) return currentCategory.documents
    const needle = query.toLowerCase()
    return currentCategory.documents.filter((item) => `${item.title} ${item.excerpt} ${item.content}`.toLowerCase().includes(needle))
  }, [currentCategory, query])
  const selected = filteredDocs.find((item) => item.filename === doc) || filteredDocs[0]

  return (
    <div className="page playbook-page">
      <div className="page-intro"><p className="eyebrow">The operating system</p><h1>Playbooks</h1><p>Every approved principle, workflow, and production standard—kept close to the work it governs.</p></div>
      <div className="category-tabs" role="tablist">
        {playbookCategories.map((item) => <button key={item.slug} className={item.slug === currentCategory.slug ? 'active' : ''} onClick={() => routeTo(['playbooks', item.slug])}>{item.name}<span>{item.documents.length}</span></button>)}
      </div>
      <div className="library-layout">
        <aside className="document-list panel">
          <div className="document-list-head"><p className="eyebrow">{currentCategory.name}</p><span>{filteredDocs.length} chapters</span></div>
          <p className="category-description">{currentCategory.description}</p>
          <div className="document-buttons">
            {filteredDocs.map((item, index) => (
              <button key={item.id} className={item.id === selected?.id ? 'active' : ''} onClick={() => routeTo(['playbooks', currentCategory.slug, item.filename])}>
                <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.title}</strong><small>{item.excerpt}</small></div><Icon name="arrow" size={15} />
              </button>
            ))}
            {!filteredDocs.length && <div className="empty-list">No chapters match “{query}”.</div>}
          </div>
        </aside>
        <article className="document-viewer panel">
          {selected ? <>
            <div className="document-meta"><span>{selected.category}</span><span>Source file · {selected.filename}</span><CopyLink parts={['playbooks', currentCategory.slug, selected.filename]} /></div>
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

function CampaignKillSwitch({ campaign, analytics, onChanged, placement = 'panel' }) {
  const [apiToken, setApiToken] = useState('')
  const [operator, setOperator] = useState('')
  const [reason, setReason] = useState('Emergency stop from campaign admin')
  const [pendingEnabled, setPendingEnabled] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const control = analytics.control || {}
  const enabled = Boolean(control.enabled ?? analytics.campaign?.enabled)
  const paused = Number(control.paused_by_kill_switch || control.enrollment_statuses?.paused || 0)
  const pendingJobs = Number(control.pending_jobs || 0)
  const jobsPaused = Number(control.jobs_paused_by_kill_switch || 0)

  const openAction = (nextEnabled) => {
    setPendingEnabled(nextEnabled)
    setError('')
    setNotice('')
    setReason(nextEnabled ? 'Re-enable after launch checks passed' : 'Emergency stop from campaign admin')
  }

  const updateSwitch = async (nextEnabled) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (!apiToken.trim()) throw new Error('Enter the admin bearer token.')
      const response = await fetch('/api/campaigns/kill-switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken.trim()}`,
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          enabled: nextEnabled,
          operator: operator.trim() || null,
          reason: reason.trim() || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'kill_switch_update_failed')
      onChanged?.(data)
      setNotice(nextEnabled ? 'Database campaign gate re-enabled.' : 'Campaign kill switch is now active.')
      setPendingEnabled(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'kill_switch_update_failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={`campaign-kill-switch ${enabled ? '' : 'is-killed'} ${pendingEnabled !== null ? 'is-open' : ''} ${placement === 'toolbar' ? 'is-toolbar' : ''}`} aria-label="Campaign kill switch">
      <div className="kill-switch-summary">
        <div className="kill-switch-state">
          <span><Icon name="power" size={15} />Campaign database gate</span>
          <strong>{enabled ? 'Enabled' : 'Killed'}</strong>
        </div>
        <div className="kill-switch-counts" aria-label="Campaign queue state">
          <span><b>{paused}</b> paused enrolments</span>
          <span><b>{pendingJobs}</b> pending jobs</span>
          <span><b>{jobsPaused}</b> held jobs</span>
        </div>
        <button className={enabled ? 'danger-button' : 'secondary-button'} disabled={busy} onClick={() => openAction(!enabled)}>
          <Icon name="power" size={15} />{enabled ? 'Kill campaign now' : 'Re-enable database gate'}
        </button>
      </div>
      {pendingEnabled !== null && (
        <div className="kill-switch-confirm">
          <div className="kill-switch-confirm-copy">
            <strong>{pendingEnabled ? 'Re-enable this campaign' : 'Kill this campaign immediately'}</strong>
            <span>Enter the Automation API bearer token. Operator and reason are written to the campaign audit config.</span>
          </div>
          <div className="kill-switch-fields">
            <label><span>Automation API bearer token</span><input type="password" value={apiToken} onChange={(event) => setApiToken(event.target.value)} placeholder="Paste AUTOMATION_API_KEY" /></label>
            <label><span>Operator</span><input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="Your name" /></label>
            <label><span>Reason</span><input value={reason} onChange={(event) => setReason(event.target.value)} /></label>
          </div>
          <div className="kill-switch-actions">
            <button className="secondary-button" disabled={busy} onClick={() => { setPendingEnabled(null); setError('') }}>Cancel</button>
            <button className={pendingEnabled ? 'secondary-button' : 'danger-button'} disabled={busy} onClick={() => updateSwitch(pendingEnabled)}>
              <Icon name="power" size={15} />{pendingEnabled ? 'Confirm re-enable' : 'Confirm kill switch'}
            </button>
          </div>
          {error && <span className="kill-switch-error">{error}</span>}
        </div>
      )}
      {notice && <span className="kill-switch-notice">{notice}</span>}
    </section>
  )
}

function Sequences({ params, routeTo, onOpenEmail }) {
  const isLifecycle = params[0] === 'lifecycle'
  const [marketFilter, setMarketFilter] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const visibleCampaigns = useMemo(
    () => showArchived ? campaigns : activeCampaigns,
    [showArchived],
  )
  const marketOptions = useMemo(() => {
    const options = new Map()
    visibleCampaigns.forEach((item) => {
      if (!options.has(item.market)) options.set(item.market, { market: item.market, flag: item.flag })
    })
    return [...options.values()]
  }, [visibleCampaigns])
  const filteredCampaigns = useMemo(
    () => marketFilter === 'all' ? visibleCampaigns : visibleCampaigns.filter((item) => item.market === marketFilter),
    [marketFilter, visibleCampaigns],
  )
  const campaign = campaigns.find((item) => item.id === params[0]) || filteredCampaigns[0] || visibleCampaigns[0] || campaigns[0]
  const lifecycle = lifecycleSequences.find((item) => item.id === params[1]) || lifecycleSequences[0]
  const [analytics, setAnalytics] = useState({ loading: true, configured: null, campaign: null, steps: [], control: null, tracking: null })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/campaigns/stats?campaign_id=${encodeURIComponent(campaign.id)}`)
        const data = await response.json()
        if (!cancelled) setAnalytics({ loading: false, configured: Boolean(data.configured), campaign: data.campaign, steps: data.steps || [], control: data.control || null, tracking: data.tracking })
      } catch {
        if (!cancelled) setAnalytics({ loading: false, configured: false, campaign: null, steps: [], control: null, tracking: null })
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
          {!isLifecycle && (
            <label className="country-filter">
              <span>Country</span>
              <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)} aria-label="Filter campaign sequences by country">
                <option value="all">All countries</option>
                {marketOptions.map((option) => <option key={option.market} value={option.market}>{option.flag} {option.market === 'US-West-Coast' ? 'US' : option.market}</option>)}
              </select>
              <Icon name="chevron" size={15} />
            </label>
          )}
          {!isLifecycle && <button className="secondary-button" onClick={() => setShowArchived((current) => !current)}>{showArchived ? 'Hide archived' : `View archived (${contentStats.archivedCampaigns})`}</button>}
          <div className="segmented"><button className={!isLifecycle ? 'active' : ''} onClick={() => routeTo(['sequences', campaign.id])}>Campaigns</button><button className={isLifecycle ? 'active' : ''} onClick={() => routeTo(['sequences', 'lifecycle', lifecycle.id])}>Lifecycle blueprints</button></div>
        </div>
      </div>
      {!isLifecycle ? (
        <div className="sequence-layout">
          <aside className="sequence-list panel">
            <div className="sequence-list-head"><span>Campaign sequences</span><b>{filteredCampaigns.length}</b></div>
            {filteredCampaigns.map((item) => (
              <button key={item.id} className={`sequence-list-item${item.id === campaign.id ? ' active' : ''}`} onClick={() => routeTo(['sequences', item.id])}>
                <span className="flag-tile small">{item.flag}</span>
                <div className="sequence-list-copy"><strong title={item.name}>{item.name}</strong><small title={item.hook}>{item.hook}</small></div>
                <span className="sequence-list-status"><Status value={item.status} /></span>
              </button>
            ))}
          </aside>
          <section className="sequence-detail panel">
            <div className="sequence-hero">
              <div className="sequence-hero-copy">
                <div className="sequence-kicker"><span className="sequence-market-flag">{campaign.flag}</span><span>{campaign.market}</span><i /> <span>{campaign.channel}</span><Status value={campaign.status} /></div>
                <h2>{campaign.name}</h2>
                <p>{campaign.hook}</p>
                <div className="sequence-ownership"><span><b>Owner</b>{campaign.owner}</span><CopyLink parts={['sequences', campaign.id]} /></div>
              </div>
            </div>
            <CampaignKillSwitch campaign={campaign} analytics={analytics} onChanged={(data) => setAnalytics((current) => ({
              ...current,
              campaign: current.campaign ? { ...current.campaign, enabled: data.campaign?.enabled } : current.campaign,
              control: {
                ...(current.control || {}),
                enabled: data.campaign?.enabled,
                enrollment_statuses: data.enrollments || {},
                pending_jobs: data.pending_jobs || 0,
                jobs_paused_by_kill_switch: data.paused_jobs || 0,
              },
            }))} />
            <SequenceTimeline campaign={campaign} analytics={analytics} onOpenEmail={onOpenEmail} />
          </section>
        </div>
      ) : (
        <div className="sequence-layout">
          <aside className="sequence-list lifecycle-list panel">
            <div className="sequence-list-head"><span>Lifecycle systems</span><b>{lifecycleSequences.length}</b></div>
            {lifecycleSequences.map((item) => <button key={item.id} className={item.id === lifecycle.id ? 'active' : ''} onClick={() => routeTo(['sequences', 'lifecycle', item.id])}><span className="sequence-number">{item.id.slice(0, 2)}</span><div><strong>{item.title}</strong><small>{item.emailCount} emails · Blueprint</small></div></button>)}
          </aside>
          <section className="sequence-detail panel lifecycle-detail">
            <div className="sequence-hero"><div><div className="sequence-kicker"><Status value="Blueprint" /><span>{lifecycle.emailCount} emails</span><CopyLink parts={['sequences', 'lifecycle', lifecycle.id]} /></div><h2>{lifecycle.title}</h2><p>{lifecycle.description}</p></div></div>
            <div className="blueprint-grid">
              {lifecycle.documents.map((item, index) => <article key={item.id}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3><small>{item.filename}</small></div><Icon name="check" /></article>)}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function EmailStudio({ campaignId, emailNumber, routeTo }) {
  const campaign = campaigns.find((item) => item.id === campaignId) || campaigns.find((item) => item.status === 'Live') || campaigns[0]
  const availableMessages = useMemo(() => campaign.messages.filter((message) => message.html), [campaign])
  const sequenceMessages = useMemo(() => availableMessages.filter((item) => !item.isSupplemental), [availableMessages])
  const [viewport, setViewport] = useState('desktop')
  const [personalised, setPersonalised] = useState(true)
  const [analytics, setAnalytics] = useState({ loading: true, configured: null, campaign: null, steps: [], control: null, tracking: null })
  const studioRef = useRef(null)
  const previewFrameRef = useRef(null)
  const message = availableMessages.find((item) => item.index === emailNumber) || availableMessages[0]
  const sequenceDuration = sequenceMessages.at(-1)?.day ?? 0

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
        routeTo(['emails', campaign.id, requestedMessage.index], { replace: true })
        return
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const direction = event.key === 'ArrowRight' ? 1 : -1
      const currentIndex = sequenceMessages.findIndex((item) => item.id === message?.id)
      const nextIndex = currentIndex === -1
        ? (direction === 1 ? 0 : sequenceMessages.length - 1)
        : (currentIndex + direction + sequenceMessages.length) % sequenceMessages.length
      routeTo(['emails', campaign.id, sequenceMessages[nextIndex].index], { replace: true })
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
  }, [message, sequenceMessages, campaign.id])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/campaigns/stats?campaign_id=${encodeURIComponent(campaign.id)}`)
        const data = await response.json()
        if (!cancelled) setAnalytics({ loading: false, configured: Boolean(data.configured), campaign: data.campaign, steps: data.steps || [], control: data.control || null, tracking: data.tracking })
      } catch {
        if (!cancelled) setAnalytics({ loading: false, configured: false, campaign: null, steps: [], control: null, tracking: null })
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
          <select value={campaign.id} onChange={(event) => routeTo(['emails', event.target.value])}>
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
          {message && <CampaignKillSwitch campaign={campaign} analytics={analytics} placement="toolbar" onChanged={(data) => setAnalytics((current) => ({
            ...current,
            campaign: current.campaign ? { ...current.campaign, enabled: data.campaign?.enabled } : current.campaign,
            control: {
              ...(current.control || {}),
              enabled: data.campaign?.enabled,
              enrollment_statuses: data.enrollments || {},
              pending_jobs: data.pending_jobs || 0,
              jobs_paused_by_kill_switch: data.paused_jobs || 0,
            },
          }))} />}
          <CopyLink parts={['emails', campaign.id, message?.index]} />
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
                        onClick={() => routeTo(['emails', campaign.id, item.index])}
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
                    onClick={() => routeTo(['emails', campaign.id, item.index])}
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
          <dl><div><dt>Subject</dt><dd>{personalised ? applyMergeData(message.title, sampleMergeData) : message.title}</dd></div><div><dt>Preview text</dt><dd>{personalised ? applyMergeData(message.preview, sampleMergeData) : message.preview}</dd></div><div><dt>Headline</dt><dd>{message.headline}</dd></div><div><dt>Eyebrow</dt><dd>{message.eyebrow}</dd></div><div><dt>Format</dt><dd>Branded HTML</dd></div><div><dt>Output</dt><dd>{message.output.split('/').pop()}</dd></div></dl>
          <div className="email-list-note inspector-source-note"><Icon name="check" /><p><strong>Read directly from source</strong><span>Rebuild campaign HTML and refresh to see the latest version.</span></p></div>
          <hr />
          <p className="eyebrow">Sample recipient</p>
          <dl className="recipient-data"><div><dt>Name</dt><dd>{sampleMergeData.first_name}</dd></div><div><dt>Salon</dt><dd>{sampleMergeData.salon_name}</dd></div><div><dt>City</dt><dd>{sampleMergeData.city}</dd></div></dl>
        </aside>}
      </div>
    </div>
  )
}

const guideSlug = (item) => (item.type === 'report' ? item.id : item.filename.replace(/\.md$/, ''))

function Guides({ query, slug, routeTo }) {
  const allGuides = useMemo(() => ([
    ...guides,
    {
      id: 'report-how-a-campaign-is-built',
      type: 'report',
      title: 'How a campaign is built & structured',
      excerpt: 'The branded walkthrough — folder anatomy, the production pipeline, cadence and renderer charts, and real Studio screenshots.',
      filename: 'how-a-campaign-is-built.html',
      src: '/guides/how-a-campaign-is-built.html',
      content: 'campaign built structure folder anatomy pipeline cadence master template renderer registry screenshots report branded',
    },
    {
      id: 'report-subject-line-system',
      type: 'report',
      title: 'Subject lines: flow, guardrails & gates',
      excerpt: 'The branded end-to-end report — how subjects are produced, constrained and approved.',
      filename: 'subject-line-system-report.html',
      src: '/guides/subject-line-system-report.html',
      content: 'subject line preview report flow guardrails gates requirements branded reference',
    },
    {
      id: 'report-the-production-system',
      type: 'report',
      title: 'The production system: how everything connects',
      excerpt: 'The systems overview — Claude, the skill, the repo, Vercel, Resend and Supabase: system map, flows, permissions and locks.',
      filename: 'the-production-system.html',
      src: '/guides/the-production-system.html',
      content: 'systems overview architecture claude skill github repository vercel resend supabase mcp webhooks cron worker locks diagram',
    },
  ]), [])
  const filtered = useMemo(() => {
    if (!query.trim()) return allGuides
    const needle = query.toLowerCase()
    return allGuides.filter((doc) => `${doc.title} ${doc.excerpt} ${doc.content}`.toLowerCase().includes(needle))
  }, [allGuides, query])
  const selected = allGuides.find((doc) => guideSlug(doc) === slug) || filtered[0]
  const [reportZoom, setReportZoom] = useState(1)
  const reportFrameRef = useRef(null)
  const reportShellRef = useRef(null)

  const fitReport = () => {
    const frame = reportFrameRef.current
    const doc = frame?.contentWindow?.document?.documentElement
    if (!frame || !doc || document.fullscreenElement) return
    frame.style.height = `${doc.scrollHeight + 2}px`
  }
  const applyReportZoom = () => {
    const body = reportFrameRef.current?.contentWindow?.document?.body
    if (body) body.style.zoom = reportZoom
  }
  const adjustReportZoom = (delta) => {
    setReportZoom((zoom) => Math.min(3, Math.max(0.5, Math.round((zoom + delta) * 100) / 100)))
  }
  const resetReportZoom = () => setReportZoom(document.fullscreenElement === reportShellRef.current ? 2 : 1)
  const openFullscreen = () => {
    const shell = reportShellRef.current
    if (shell?.requestFullscreen) shell.requestFullscreen()
    else if (shell?.webkitRequestFullscreen) shell.webkitRequestFullscreen()
  }
  const handleReportLoad = () => {
    applyReportZoom()
    fitReport()
  }
  useEffect(() => {
    if (selected?.type !== 'report') return undefined
    applyReportZoom()
    const timer = window.setTimeout(fitReport, 80)
    return () => window.clearTimeout(timer)
  }, [reportZoom, selected])
  useEffect(() => {
    if (selected?.type !== 'report') return undefined
    const timer = window.setTimeout(fitReport, 400)
    window.addEventListener('resize', fitReport)
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', fitReport) }
  }, [selected])
  useEffect(() => {
    const handleFullscreenChange = () => {
      const shell = reportShellRef.current
      const frame = reportFrameRef.current
      if (!shell || !frame) return
      if (document.fullscreenElement === shell) {
        frame.style.flex = '1 1 auto'
        frame.style.height = 'auto'
        setReportZoom(2)
      } else {
        frame.style.flex = ''
        setReportZoom(1)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="page playbook-page">
      <div className="page-intro"><p className="eyebrow">Learn the system</p><h1>Help &amp; guides</h1><p>How to request, generate and release Sunless campaigns — written for every employee. No tooling or repository knowledge required.</p></div>
      <div className="library-layout">
        <aside className="document-list panel">
          <div className="document-list-head"><p className="eyebrow">Guides</p><span>{filtered.length} guides</span></div>
          <p className="category-description">Read in order the first time — start with requesting a campaign. The branded reports sit at the end as the shareable references. The playbooks remain the canonical rules.</p>
          <div className="document-buttons">
            {filtered.map((doc, index) => (
              <button key={doc.id} className={doc.id === selected?.id ? 'active' : ''} onClick={() => routeTo(['guides', guideSlug(doc)])}>
                <span>{String(index + 1).padStart(2, '0')}</span><div><strong>{doc.title}</strong><small>{doc.excerpt}</small></div><Icon name="arrow" size={15} />
              </button>
            ))}
            {!filtered.length && <div className="empty-list">No guides match “{query}”.</div>}
          </div>
        </aside>
        <article className="document-viewer panel">
          {selected ? (selected.type === 'report' ? (
            <>
              <div className="document-meta"><span>Branded report</span><span>Source file · public/guides/{selected.filename}</span><CopyLink parts={['guides', guideSlug(selected)]} /></div>
              <div ref={reportShellRef} style={{ display: 'flex', flexDirection: 'column', background: '#EAE2D8', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', padding: '10px 12px', background: '#FBF8F3', borderBottom: '1px solid rgba(36, 33, 30, 0.1)' }}>
                  <button className="secondary-button" onClick={openFullscreen}><Icon name="monitor" size={15} /> Full screen</button>
                  <a className="secondary-button" style={{ textDecoration: 'none' }} href={selected.src} target="_blank" rel="noreferrer"><Icon name="external" size={15} /> Open in new tab</a>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 'auto' }} aria-label="Report zoom controls">
                    <button className="icon-button" onClick={() => adjustReportZoom(-0.25)} disabled={reportZoom <= 0.5} aria-label="Zoom out" style={{ fontSize: '17px', lineHeight: 1 }}>−</button>
                    <button className="secondary-button" onClick={resetReportZoom} aria-label="Reset zoom" title="Reset zoom" style={{ minWidth: '64px', justifyContent: 'center' }}>{Math.round(reportZoom * 100)}%</button>
                    <button className="icon-button" onClick={() => adjustReportZoom(0.25)} disabled={reportZoom >= 3} aria-label="Zoom in" style={{ fontSize: '17px', lineHeight: 1 }}>+</button>
                  </div>
                </div>
                <iframe
                  ref={reportFrameRef}
                  title={selected.title}
                  src={selected.src}
                  onLoad={handleReportLoad}
                  style={{ width: '100%', height: '1400px', border: 0, background: '#EAE2D8', display: 'block' }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="document-meta"><span>Help &amp; guides</span><span>Source file · {selected.filename}</span><CopyLink parts={['guides', guideSlug(selected)]} /></div>
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(selected.content) }} />
            </>
          )) : <div className="empty-state"><Icon name="search" size={28} /><h3>No guide selected</h3><p>Try a broader search.</p></div>}
        </article>
      </div>
    </div>
  )
}

const klaviyoPreviews = [
  {
    id: 'golden-hour-retail',
    title: 'Glow Like It’s Golden Hour',
    description: 'Malibu-inspired retail newsletter with responsive desktop and mobile imagery.',
    status: 'Draft preview',
    previewUrl: '/email-assets/retail-website/index.html',
    explicitUrl: '/email-assets/retail-website/index.html',
    source: 'existing-campaigns/new-website-images/email.html',
    image: '/email-assets/retail-website/hero-0001-mobile.jpg',
  },
]

function KlaviyoPreviews() {
  const [viewport, setViewport] = useState('desktop')

  return (
    <div className="page klaviyo-page">
      <div className="page-intro-row">
        <div>
          <p className="eyebrow">External campaign previews</p>
          <h1>Klaviyo campaigns</h1>
          <p>Standalone campaign HTML hosted under <code>/email-assets/</code>. These previews are separate from the Resend campaign registry and sending engine.</p>
        </div>
      </div>

      <div className="klaviyo-preview-grid">
        {klaviyoPreviews.map((campaign) => (
          <article className="panel klaviyo-preview-card" key={campaign.id}>
            <div className="klaviyo-preview-summary">
              <img src={campaign.image} alt="" />
              <div>
                <p className="eyebrow">{campaign.status}</p>
                <h2>{campaign.title}</h2>
                <p>{campaign.description}</p>
                <dl>
                  <div><dt>Public preview</dt><dd>{campaign.explicitUrl}</dd></div>
                  <div><dt>Source</dt><dd>{campaign.source}</dd></div>
                </dl>
                <div className="klaviyo-preview-actions">
                  <a className="primary-button" href={campaign.previewUrl} target="_blank" rel="noreferrer"><Icon name="external" size={16} /> Open preview</a>
                  <a className="secondary-button" href={campaign.explicitUrl} target="_blank" rel="noreferrer"><Icon name="link" size={16} /> Direct HTML</a>
                </div>
              </div>
            </div>
            <div className="klaviyo-preview-toolbar">
              <span>Preview size</span>
              <div className="viewport-switch" role="group" aria-label="Klaviyo preview size">
                <button className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')} aria-label="Desktop preview" title="Desktop preview"><Icon name="monitor" /></button>
                <button className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')} aria-label="Mobile preview" title="Mobile preview"><Icon name="mobile" /></button>
              </div>
            </div>
            <div className={`klaviyo-frame-shell ${viewport}`}>
              <div className="browser-chrome"><span /><span /><span /><b>{viewport === 'desktop' ? 'Desktop · 600px email' : 'Mobile · 390px'} · {campaign.explicitUrl}</b></div>
              <iframe title={`Preview of ${campaign.title}`} src={campaign.previewUrl} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

const audienceImportCampaigns = [
  { id: 'uk-salon-stockist', label: 'UK Jimmy Coco Pro Recruitment', market: 'UK', timezone: 'Europe/London' },
  { id: 'us-west-coast-salon-stockist', label: 'US West Coast Jimmy Coco Pro Recruitment', market: 'US', timezone: 'America/Los_Angeles' },
]

const audienceCsvHeaders = [
  'email',
  'first_name',
  'business_name',
  'business_type',
  'market',
  'timezone',
  'company_legal_entity_type',
  'source',
  'source_date',
  'owner',
  'eligibility_decision',
  'eligibility_reason',
  'lawful_basis',
]

const tomorrowUtcInput = () => {
  const value = new Date()
  value.setUTCDate(value.getUTCDate() + 1)
  value.setUTCHours(10, 0, 0, 0)
  return value.toISOString().slice(0, 16)
}

const humaniseImportValue = (value) => String(value || '')
  .replaceAll('_', ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase())

function AudienceImporter() {
  const [campaignId, setCampaignId] = useState(audienceImportCampaigns[0].id)
  const [startUtc, setStartUtc] = useState(tomorrowUtcInput)
  const [apiToken, setApiToken] = useState('')
  const [operator, setOperator] = useState('')
  const [csv, setCsv] = useState('')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState(null)
  const [confirmation, setConfirmation] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [commitResult, setCommitResult] = useState(null)
  const campaign = audienceImportCampaigns.find((item) => item.id === campaignId) || audienceImportCampaigns[0]

  const startAt = useMemo(() => {
    if (!startUtc) return ''
    const value = new Date(`${startUtc}:00.000Z`)
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  }, [startUtc])

  const campaignLocalStart = useMemo(() => {
    if (!startAt) return 'Choose a valid UTC date and time'
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: campaign.timezone,
    }).format(new Date(startAt))
  }, [campaign.timezone, startAt])

  const invalidatePreview = () => {
    setPreview(null)
    setCommitResult(null)
    setConfirmation('')
    setConfirmed(false)
    setError('')
  }

  const selectFile = async (event) => {
    const file = event.target.files?.[0]
    invalidatePreview()
    if (!file) {
      setCsv('')
      setFileName('')
      return
    }
    setCsv(await file.text())
    setFileName(file.name)
  }

  const downloadTemplate = () => {
    const today = new Date().toISOString().slice(0, 10)
    const sample = [
      'owner@example-salon.com',
      'Alex',
      'Example Glow Salon',
      'Salon',
      campaign.market,
      campaign.timezone,
      campaign.market === 'UK' ? 'limited_company' : 'limited_liability_company',
      'Manual prospect research',
      today,
      'Matt Rogers',
      'review',
      'Replace with the documented human eligibility decision',
      'Replace with the approved lawful-basis record',
    ]
    const blob = new Blob([`${audienceCsvHeaders.join(',')}\n${sample.join(',')}\n`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${campaign.market.toLowerCase()}-audience-import-template.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const callImporter = async (action) => {
    setLoading(true)
    setError('')
    try {
      if (!apiToken.trim()) throw new Error('Enter the audience import admin token.')
      if (!csv) throw new Error('Choose a CSV file first.')
      if (!startAt) throw new Error('Choose a valid UTC start time.')
      const response = await fetch('/api/campaigns/import-audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken.trim()}`,
        },
        body: JSON.stringify({
          action,
          campaign_id: campaignId,
          start_at: startAt,
          csv,
          file_name: fileName,
          operator,
          preview_token: preview?.preview_token,
          confirmation,
          confirmed,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || `Importer request failed (${response.status})`)
      if (action === 'preview') {
        setPreview(data)
        setConfirmation('')
        setConfirmed(false)
        setCommitResult(null)
      } else {
        setCommitResult(data.import)
      }
    } catch (requestError) {
      setError(humaniseImportValue(requestError instanceof Error ? requestError.message : requestError))
    } finally {
      setLoading(false)
    }
  }

  const metrics = preview ? [
    ['Total records', preview.summary.total_records],
    ['Valid records', preview.summary.valid_records],
    ['Invalid records', preview.summary.invalid_records],
    ['Duplicates', preview.summary.duplicates],
    ['Existing contacts', preview.summary.existing_contacts],
    ['Existing customers', preview.summary.existing_customers],
    ['Trial applicants', preview.summary.existing_trial_applicants],
    ['Suppressed', preview.summary.suppressed_contacts],
    ['UK individuals', preview.summary.uk_individual_subscribers],
    ['Already enrolled', preview.summary.already_enrolled],
    ['Final eligible', preview.summary.final_eligible_count],
  ] : []

  return (
    <div className="page audience-import-page">
      <div className="page-intro audience-import-intro">
        <p className="eyebrow">Admin · Audience control</p>
        <h1>Import outreach contacts</h1>
        <p>Validate and reconcile a CSV against customers, trial applicants, suppressions and active enrolments before anything is written. A preview never imports or sends email.</p>
      </div>

      <div className="audience-import-layout">
        <section className="panel audience-import-form">
          <div className="import-section-heading">
            <div><span>01</span><div><strong>Define the import</strong><small>Campaign and timing are mandatory.</small></div></div>
            <span className="import-safe-badge">Preview first</span>
          </div>

          <div className="import-fields">
            <label className="import-field import-field-wide">
              <span>Campaign sequence</span>
              <select value={campaignId} onChange={(event) => { setCampaignId(event.target.value); invalidatePreview() }}>
                {audienceImportCampaigns.map((item) => <option key={item.id} value={item.id}>{item.market} · {item.label}</option>)}
              </select>
              <small>Only the current UK and US production outreach campaigns are permitted.</small>
            </label>
            <label className="import-field">
              <span>First-send time (UTC)</span>
              <input type="datetime-local" value={startUtc} onChange={(event) => { setStartUtc(event.target.value); invalidatePreview() }} />
              <small>{campaign.timezone}: {campaignLocalStart}</small>
            </label>
            <label className="import-field">
              <span>Operator confirming import</span>
              <input value={operator} onChange={(event) => { setOperator(event.target.value); invalidatePreview() }} placeholder="Your full name" autoComplete="name" />
              <small>Stored in the immutable import audit.</small>
            </label>
            <label className="import-field import-field-wide">
              <span>Audience import admin token</span>
              <input type="password" value={apiToken} onChange={(event) => setApiToken(event.target.value)} placeholder="Required for preview and commit" autoComplete="off" />
              <small>Held only in this page’s memory; it is not placed in the URL or browser storage.</small>
            </label>
          </div>

          <div className="import-upload-block">
            <div>
              <span className="import-upload-icon"><Icon name="upload" size={22} /></span>
              <div><strong>{fileName || 'Choose the contacts CSV'}</strong><small>{fileName ? `${new Blob([csv]).size.toLocaleString()} bytes loaded` : 'CSV only · maximum 5,000 records'}</small></div>
            </div>
            <div className="import-upload-actions">
              <button type="button" className="secondary-button" onClick={downloadTemplate}>Download CSV template</button>
              <label className="primary-button import-file-button">Choose CSV<input type="file" accept=".csv,text/csv" onChange={selectFile} /></label>
            </div>
          </div>

          <div className="import-contract-note">
            <Icon name="check" />
            <p><strong>No inferred permission.</strong> Every row needs an explicit eligibility decision plus a reason or lawful-basis record. Submitting an email address alone can never make it eligible.</p>
          </div>

          {error && <div className="import-message import-message-error" role="alert">{error}</div>}
          <button type="button" className="primary-button import-preview-button" onClick={() => callImporter('preview')} disabled={loading || !csv}>
            {loading ? 'Checking audience…' : 'Run dry-run preview'} <Icon name="arrow" />
          </button>
        </section>

        <aside className="panel import-readiness-card">
          <p className="eyebrow">Required CSV fields</p>
          <h2>One accountable record per contact</h2>
          <ul>
            <li>Email and first name (or the Salon Owner fallback)</li>
            <li>Business name, type, market and IANA timezone</li>
            <li>Company or legal-entity type</li>
            <li>Source, source date and owner</li>
            <li>Eligibility decision and supporting record</li>
          </ul>
          <div><strong>Import does not send</strong><span>Contacts are staged with the explicit first-send time. Campaign and live-mode gates remain separate.</span></div>
        </aside>
      </div>

      {preview && <section className="panel import-preview-results">
        <div className="import-preview-head">
          <div><p className="eyebrow">02 · Dry-run result</p><h2>{preview.summary.final_eligible_count} contacts can be enrolled</h2><p>{preview.campaign_market} campaign · first send {new Date(preview.start_at).toLocaleString('en-GB', { timeZone: preview.campaign_timezone, dateStyle: 'medium', timeStyle: 'short' })} ({preview.campaign_timezone})</p></div>
          <span className="import-safe-badge">Nothing written</span>
        </div>
        <div className="import-metrics">
          {metrics.map(([label, value]) => <div key={label} className={label === 'Final eligible' ? 'eligible' : ''}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
        <div className="import-row-table-wrap">
          <table className="import-row-table">
            <thead><tr><th>Row</th><th>Contact</th><th>Business</th><th>Market</th><th>Decision</th><th>Reason</th></tr></thead>
            <tbody>
              {preview.rows.map((row) => <tr key={row.row_number}>
                <td>{row.row_number}</td>
                <td>{row.email || '—'}{row.existing_contact && <small>Existing contact</small>}</td>
                <td>{row.business_name || '—'}</td>
                <td>{row.market || '—'}</td>
                <td><span className={`import-outcome import-outcome-${row.outcome}`}>{humaniseImportValue(row.outcome)}</span></td>
                <td>{row.reasons.length ? row.reasons.map(humaniseImportValue).join(' · ') : 'Passed all checks'}</td>
              </tr>)}
            </tbody>
          </table>
        </div>

        <div className="import-confirm-panel">
          <div><p className="eyebrow">03 · Final confirmation</p><h3>Commit this exact preview</h3><p>Database state is checked again at commit. If anything changed, the import stops and requires a fresh preview.</p></div>
          <label className="import-field">
            <span>Type <code>{preview.confirmation_text}</code></span>
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
          </label>
          <label className="import-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I confirm the audience, campaign and first-send time are correct.</span></label>
          <button type="button" className="primary-button import-commit-button" onClick={() => callImporter('commit')} disabled={loading || commitResult || !confirmed || confirmation !== preview.confirmation_text || !operator.trim()}>
            {commitResult ? 'Import committed' : loading ? 'Rechecking and importing…' : `Import ${preview.summary.final_eligible_count} eligible contacts`}
          </button>
          {commitResult && <div className="import-message import-message-success" role="status">
            Import complete: {commitResult.enrolled_contacts} new enrolments, {commitResult.existing_enrollments} already enrolled, {commitResult.excluded_at_commit} excluded by the final database check. No email was sent.
          </div>}
        </div>
      </section>}
    </div>
  )
}

const parseRoute = () => {
  const segments = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map((part) => {
    try { return decodeURIComponent(part) } catch { return part }
  })
  const view = navItems.some((item) => item.id === segments[0]) ? segments[0] : 'overview'
  return { view, params: segments.slice(1) }
}

export default function App() {
  const [authState, setAuthState] = useState({ status: 'loading', user: null })
  const [route, setRoute] = useState(parseRoute)
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem('sunless-sidebar-collapsed') === 'true')
  const currentView = route.view
  const title = navItems.find((item) => item.id === currentView)?.label || 'Overview'

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session')
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (cancelled) return
        if (response.ok && data.authenticated) {
          setAuthState({ status: 'authenticated', user: data.user })
          if (window.location.pathname === '/login') {
            const next = new URLSearchParams(window.location.search).get('next') || '/'
            window.history.replaceState(null, '', next)
          }
        } else {
          setAuthState({ status: 'anonymous', user: null })
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState({ status: 'anonymous', user: null })
      })
    return () => { cancelled = true }
  }, [])

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
    const handleHashChange = () => setRoute(parseRoute())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const routeTo = (parts, { replace = false } = {}) => {
    const clean = (parts || []).filter((part) => part !== null && part !== undefined && part !== '').map((part) => encodeURIComponent(String(part)))
    const hash = `#${clean.join('/')}`
    if (window.location.hash !== hash) {
      if (replace) window.history.replaceState(null, '', hash)
      else window.location.hash = hash
    }
    setRoute(parseRoute())
    const view = clean.length ? decodeURIComponent(clean[0]) : 'overview'
    if (view === 'emails') {
      setSidebarCollapsed(true)
      setSidebarOpen(false)
      window.localStorage.setItem('sunless-sidebar-collapsed', 'true')
    }
    if (view !== 'playbooks' && view !== 'guides') setQuery('')
  }
  const navigate = (view) => routeTo([view])
  const openEmail = (campaignId, emailId = null) => {
    const campaign = campaigns.find((item) => item.id === campaignId)
    const message = campaign?.messages.find((item) => item.id === emailId)
    routeTo(['emails', campaignId, message?.index])
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
  const completeLogin = (user) => {
    setAuthState({ status: 'authenticated', user })
    const next = new URLSearchParams(window.location.search).get('next')
    if (window.location.pathname === '/login' && next) window.history.replaceState(null, '', next)
  }
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setAuthState({ status: 'anonymous', user: null })
    window.history.replaceState(null, '', '/login')
  }

  if (authState.status === 'loading') {
    return (
      <main className="email-auth-screen">
        <section className="email-auth-card is-loading">
          <BrandMark />
          <p className="eyebrow">Private campaign operations</p>
          <h1>Checking access…</h1>
        </section>
      </main>
    )
  }

  if (!authState.user) return <EmailAdminLogin onLogin={completeLogin} />

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} ${currentView === 'emails' ? 'emails-view' : ''} ${currentView === 'sequences' ? 'sequences-view' : ''}`}>
      <Sidebar currentView={currentView} setCurrentView={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCollapse={collapseSidebar} user={authState.user} onLogout={logout} />
      <button className="nav-reopen" onClick={openSidebar} aria-label="Open workspace navigation"><Icon name="menu" /></button>
      <div className="app-main">
        {currentView !== 'emails' && currentView !== 'sequences' && <Topbar title={title} query={query} setQuery={setQuery} onMenu={openSidebar} user={authState.user} onLogout={logout} />}
        {currentView === 'overview' && <Overview routeTo={routeTo} />}
        {currentView === 'playbooks' && <Playbooks query={query} category={route.params[0]} doc={route.params[1]} routeTo={routeTo} />}
        {currentView === 'sequences' && <Sequences params={route.params} routeTo={routeTo} onOpenEmail={openEmail} />}
        {currentView === 'emails' && <EmailStudio campaignId={route.params[0]} emailNumber={Number(route.params[1]) || null} routeTo={routeTo} />}
        {currentView === 'klaviyo' && <KlaviyoPreviews />}
        {currentView === 'guides' && <Guides query={query} slug={route.params[0]} routeTo={routeTo} />}
        {currentView === 'audience-import' && <AudienceImporter />}
      </div>
    </div>
  )
}
