import { useEffect, useState } from 'react'
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Eye,
  EyeOff,
  FolderKanban,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/index.php').replace(/\/+$/, '')
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'services', label: 'Services', icon: Building2 },
  { id: 'enquiries', label: 'Enquiries', icon: ClipboardList },
]
const categories = ['Residential', 'Commercial', 'Renovation', 'Planning']
const projectStatuses = ['Planned', 'In progress', 'Completed']
const enquiryStatuses = ['New', 'In progress', 'Closed']

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}/${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(result.error || `Request failed (${response.status}).`)
    error.status = response.status
    throw error
  }
  return result.data
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function initials(name = 'Admin') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function statusClass(status = '') {
  const normalized = status.toLowerCase().replace(/\s+/g, '-')
  if (normalized === 'new') return 'status-new'
  if (normalized === 'in-progress') return 'status-progress'
  if (normalized === 'closed') return 'status-closed'
  if (normalized === 'completed') return 'status-completed'
  return 'status-planned'
}

function Admin() {
  const [session, setSession] = useState(null)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [view, setView] = useState('overview')
  const [dashboard, setDashboard] = useState(null)
  const [projects, setProjects] = useState([])
  const [services, setServices] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [editor, setEditor] = useState(null)
  const [detail, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (message, kind = 'success') => setToast({ message, kind, key: Date.now() })

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const loadWorkspace = async () => {
    setLoading(true)
    try {
      const [overview, projectRows, serviceRows, enquiryRows] = await Promise.all([
        apiRequest('dashboard'),
        apiRequest('projects'),
        apiRequest('services'),
        apiRequest('enquiries'),
      ])
      setDashboard(overview)
      setProjects(projectRows)
      setServices(serviceRows)
      setEnquiries(enquiryRows)
    } catch (error) {
      if (error.status === 401) {
        setSession(null)
        setLoginError('Your session has expired. Please sign in again.')
      } else {
        notify(error.message || 'Unable to load the admin workspace.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) loadWorkspace()
  }, [session])

  const submitLogin = async (event) => {
    event.preventDefault()
    setLoginBusy(true)
    setLoginError('')
    try {
      const data = await apiRequest('login', {
        method: 'POST',
        body: JSON.stringify(login),
      })
      setSession(data)
      setView('overview')
      setLogin({ email: '', password: '' })
    } catch (error) {
      setLoginError(error.message || 'Unable to sign in. Check your details and try again.')
    } finally {
      setLoginBusy(false)
    }
  }

  const signOut = async () => {
    try {
      await apiRequest('logout', { method: 'POST' })
    } catch {
      // Clear the local admin view even if the session endpoint is unavailable.
    }
    setSession(null)
    setDashboard(null)
    setProfileOpen(false)
    setLoginError('')
    setLogin({ email: '', password: '' })
  }

  const navigate = (nextView) => {
    setView(nextView)
    setSearch('')
    setStatusFilter('All statuses')
    setMobileSidebarOpen(false)
  }

  const saveRecord = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())
    const { type, record } = editor
    setSaving(true)
    try {
      const path = `${type}${record ? `/${record.id}` : ''}`
      await apiRequest(path, {
        method: record ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      })
      setEditor(null)
      notify(`${type === 'projects' ? 'Project' : 'Service'} ${record ? 'updated' : 'created'}.`)
      await loadWorkspace()
    } catch (error) {
      notify(error.message || 'Unable to save changes.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteRecord = async (type, record) => {
    const label = type === 'enquiries' ? 'this enquiry' : `“${record.title}”`
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
    try {
      await apiRequest(`${type}/${record.id}`, { method: 'DELETE' })
      if (detail?.id === record.id) setDetail(null)
      notify(`${type === 'enquiries' ? 'Enquiry' : type === 'projects' ? 'Project' : 'Service'} deleted.`)
      await loadWorkspace()
    } catch (error) {
      notify(error.message || 'Unable to delete this record.', 'error')
    }
  }

  const updateEnquiry = async (record, nextStatus) => {
    try {
      await apiRequest(`enquiries/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      })
      setDetail(current => current?.id === record.id ? { ...current, status: nextStatus } : current)
      notify('Enquiry status updated.')
      await loadWorkspace()
    } catch (error) {
      notify(error.message || 'Unable to update this enquiry.', 'error')
    }
  }

  const filteredProjects = projects.filter(project => {
    const term = search.trim().toLowerCase()
    return !term || [project.title, project.category, project.location, project.status].some(value => String(value || '').toLowerCase().includes(term))
  })
  const filteredServices = services.filter(service => {
    const term = search.trim().toLowerCase()
    return !term || [service.title, service.description].some(value => String(value || '').toLowerCase().includes(term))
  })
  const filteredEnquiries = enquiries.filter(enquiry => {
    const term = search.trim().toLowerCase()
    const matchesText = !term || [enquiry.name, enquiry.email, enquiry.phone, enquiry.subject, enquiry.message].some(value => String(value || '').toLowerCase().includes(term))
    return matchesText && (statusFilter === 'All statuses' || enquiry.status === statusFilter)
  })

  if (!session) {
    return (
      <main className="admin-login-screen">
        <section className="login-photograph" aria-label="Architectural photograph">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85" alt="Sunlit contemporary architecture with a sculpted courtyard" />
          <div className="login-photo-shade" />
          <a className="login-brand" href="/" aria-label="Srinidhi Constructions home"><span className="login-brand-mark">SC</span><span>Srinidhi <em>Constructions</em></span></a>
          <div className="login-photo-caption"><span>THE STUDIO</span><p>Spaces shaped by<br />purpose and place.</p></div>
          <div className="blueprint-grid" aria-hidden="true" />
        </section>
        <section className="login-panel">
          <a href="/" className="login-back-link"><ArrowLeft size={15} /> Public website</a>
          <div className="login-form-wrap">
            <div className="login-monogram">SC</div>
            <p className="admin-kicker">STUDIO ADMINISTRATION</p>
            <h1>Welcome Back</h1>
            <p className="login-subtitle">Sign in to manage your workspace.</p>
            <form className="admin-login-form" onSubmit={submitLogin}>
              <label htmlFor="admin-email">Email address</label>
              <div className="login-input-wrap"><Mail size={17} aria-hidden="true" /><input id="admin-email" name="email" type="email" autoComplete="username" required value={login.email} onChange={event => setLogin({ ...login, email: event.target.value })} placeholder="name@company.com" /></div>
              <label htmlFor="admin-password">Password</label>
              <div className="login-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })} placeholder="Enter your password" /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
              {loginError && <p className="login-error" role="alert">{loginError}</p>}
              <button className="login-submit" type="submit" disabled={loginBusy}>{loginBusy ? <><span className="button-spinner" /> Signing in</> : <>Sign in to workspace <ArrowUpRight size={16} /></>}</button>
            </form>
            <p className="login-security-note"><span /> Protected studio access</p>
          </div>
          <p className="login-copyright">© 2026 Srinidhi Constructions</p>
        </section>
      </main>
    )
  }

  const pageTitle = navigation.find(item => item.id === view)?.label || 'Overview'
  const pageSubtitle = {
    overview: 'A clear view of your studio activity and latest enquiries.',
    projects: 'Manage the work that brings your studio to life.',
    services: 'Keep your studio services clear and up to date.',
    enquiries: 'Follow every conversation from first note to resolution.',
  }[view]

  return (
    <main className={`admin-app${sidebarCollapsed ? ' sidebar-collapsed' : ''}${mobileSidebarOpen ? ' mobile-sidebar-open' : ''}`}>
      {mobileSidebarOpen && <button className="admin-drawer-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)} />}
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" title="Srinidhi Constructions"><span className="admin-brand-mark">SC</span><span className="admin-brand-copy"><strong>Srinidhi</strong><em>Constructions</em></span></a>
        <div className="sidebar-workspace"><span className="workspace-dot" /><span>Studio workspace</span></div>
        <span className="sidebar-label">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Admin sections">
          {navigation.map(item => {
            const Icon = item.icon
            return <button className={view === item.id ? 'active' : ''} type="button" key={item.id} onClick={() => navigate(item.id)} title={sidebarCollapsed ? item.label : undefined} aria-current={view === item.id ? 'page' : undefined}><Icon size={18} strokeWidth={1.7} /><span>{item.label}</span>{item.id === 'enquiries' && dashboard?.new_enquiries > 0 && <b>{dashboard.new_enquiries}</b>}</button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <a className="sidebar-public-link" href="/" title={sidebarCollapsed ? 'View public website' : undefined}><ArrowUpRight size={17} /><span>View public website</span></a>
          <button className="sidebar-logout" type="button" onClick={signOut} title={sidebarCollapsed ? 'Sign out' : undefined}><LogOut size={17} /><span>Sign out</span></button>
          <button className="sidebar-collapse" type="button" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}><ChevronLeft size={16} /><span>Collapse sidebar</span></button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left"><button className="mobile-menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileSidebarOpen(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div></div>
          <div className="admin-topbar-actions"><a className="topbar-help" href="mailto:hello@srinidhiconstructions.in" aria-label="Contact studio support" title="Contact studio support"><CircleHelp size={17} /></a><span className="topbar-divider" /><div className="profile-area"><button className="profile-trigger" type="button" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}><span className="profile-avatar">{initials(session.name)}</span><span className="profile-name"><strong>{session.name}</strong><small>Administrator</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="profile-menu"><span>{session.email || 'Signed-in administrator'}</span><button type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></div>}</div></div>
        </header>

        <div className="admin-page-content">
          <div className="admin-page-heading"><div><p className="admin-date-label">{new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p><h1>{view === 'overview' ? `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${session.name.split(' ')[0]}` : pageTitle}<span>{view === 'overview' ? '.' : ''}</span></h1><p>{pageSubtitle}</p></div>{['projects', 'services'].includes(view) && <button className="admin-primary-button" type="button" onClick={() => setEditor({ type: view, record: null })}><Plus size={17} /> Add {view === 'projects' ? 'project' : 'service'}</button>}</div>

          {loading && !dashboard ? <WorkspaceSkeleton /> : view === 'overview' ? (
            <Overview dashboard={dashboard} enquiries={enquiries} loading={loading} onNavigate={navigate} onView={setDetail} onStatus={updateEnquiry} />
          ) : view === 'projects' ? (
            <ProjectsView rows={filteredProjects} loading={loading} search={search} setSearch={setSearch} onEdit={record => setEditor({ type: 'projects', record })} onView={setDetail} onDelete={record => deleteRecord('projects', record)} />
          ) : view === 'services' ? (
            <ServicesView rows={filteredServices} loading={loading} search={search} setSearch={setSearch} onEdit={record => setEditor({ type: 'services', record })} onDelete={record => deleteRecord('services', record)} />
          ) : (
            <EnquiriesView rows={filteredEnquiries} loading={loading} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onView={setDetail} onStatus={updateEnquiry} onDelete={record => deleteRecord('enquiries', record)} />
          )}
        </div>
      </section>

      {editor && <RecordEditor editor={editor} saving={saving} onClose={() => setEditor(null)} onSave={saveRecord} />}
      {detail && (detail.recordType === 'project' ? <ProjectDetail project={detail} onClose={() => setDetail(null)} /> : <EnquiryDetail enquiry={detail} onClose={() => setDetail(null)} onStatus={updateEnquiry} />)}
      {toast && <div className={`admin-toast ${toast.kind}`} role="status" key={toast.key}><span className="toast-icon">{toast.kind === 'success' ? <Check size={16} /> : <X size={16} />}</span>{toast.message}<button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={15} /></button></div>}
    </main>
  )
}

function WorkspaceSkeleton() {
  return <div className="workspace-skeleton" aria-label="Loading workspace" aria-busy="true"><div className="skeleton-metrics">{[1, 2, 3, 4].map(item => <span key={item} />)}</div><div className="skeleton-table" /></div>
}

function Overview({ dashboard, enquiries, loading, onNavigate, onView, onStatus }) {
  const stats = [
    { label: 'Total projects', value: dashboard?.projects ?? 0, icon: FolderKanban, tone: 'forest' },
    { label: 'Total services', value: dashboard?.services ?? 0, icon: Building2, tone: 'sage' },
    { label: 'New enquiries', value: dashboard?.new_enquiries ?? 0, icon: ClipboardList, tone: 'amber' },
    { label: 'Total enquiries', value: dashboard?.total_enquiries ?? 0, icon: Users, tone: 'slate' },
  ]
  const recent = (dashboard?.recent_enquiries || []).slice(0, 5)
  return <>
    <section className="metric-grid" aria-label="Workspace statistics" aria-busy={loading}>
      {stats.map(stat => { const Icon = stat.icon; return <article className="metric-card" key={stat.label}><span className={`metric-icon ${stat.tone}`}><Icon size={18} strokeWidth={1.7} /></span><span className="metric-label">{stat.label}</span><strong>{stat.value}</strong><span className="metric-caption">Current database total</span></article> })}
    </section>
    <div className="overview-grid">
      <section className="admin-panel recent-panel"><div className="panel-heading"><div><p className="panel-kicker">INBOX</p><h2>Recent enquiries</h2></div><button className="quiet-link" type="button" onClick={() => onNavigate('enquiries')}>View all <ArrowUpRight size={14} /></button></div>
        {recent.length ? <div className="recent-list">{recent.map(item => <div className="recent-row" key={item.id}><button className="recent-contact" type="button" onClick={() => onView(item)}><span className="contact-avatar">{initials(item.name)}</span><span><strong>{item.name}</strong><small>{item.subject || item.email}</small></span></button><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span><span className="recent-date">{formatDate(item.created_at)}</span><button className="icon-action" type="button" title="View enquiry" onClick={() => onView(item)}><ArrowUpRight size={16} /></button></div>)}</div> : <EmptyState icon={ClipboardList} title="No enquiries yet" text="New customer enquiries will appear here." />}
      </section>
      <section className="admin-panel quick-panel"><div className="panel-heading"><div><p className="panel-kicker">SHORTCUTS</p><h2>Quick actions</h2></div></div><div className="quick-actions"><button type="button" onClick={() => onNavigate('projects')}><span className="quick-icon"><FolderKanban size={18} /></span><span><strong>Manage projects</strong><small>Review your portfolio</small></span><ChevronRight size={16} /></button><button type="button" onClick={() => onNavigate('services')}><span className="quick-icon"><Building2 size={18} /></span><span><strong>Manage services</strong><small>Review studio offerings</small></span><ChevronRight size={16} /></button><button type="button" onClick={() => onNavigate('enquiries')}><span className="quick-icon"><ClipboardList size={18} /></span><span><strong>Open enquiries</strong><small>{enquiries.filter(item => item.status === 'New').length} waiting for attention</small></span><ChevronRight size={16} /></button></div><div className="workspace-note"><span className="workspace-dot" /><p>Workspace data is connected to your live database.</p></div></section>
    </div>
  </>
}

function ViewToolbar({ search, setSearch, children, placeholder }) {
  return <div className="list-toolbar"><label className="list-search"><Search size={17} /><input aria-label={placeholder || 'Search records'} value={search} onChange={event => setSearch(event.target.value)} placeholder={placeholder || 'Search records'} /></label><div className="toolbar-actions">{children}</div></div>
}

function ProjectsView({ rows, loading, search, setSearch, onEdit, onView, onDelete }) {
  return <section className="admin-panel data-panel"><ViewToolbar search={search} setSearch={setSearch} placeholder="Search projects" /><div className="table-scroll"><table className="admin-data-table"><thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Location</th><th>Created</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
    {rows.map(project => <tr key={project.id}><td><div className="record-name"><span className="record-thumb">{project.cover_image ? <img src={project.cover_image} alt="" /> : <FolderKanban size={18} />}</span><span><strong>{project.title}</strong><small>/{project.slug}</small></span></div></td><td>{project.category}</td><td><span className={`status-pill ${statusClass(project.status)}`}>{project.status}</span></td><td>{project.location}</td><td>{formatDate(project.created_at)}</td><td><RowActions onView={() => onView({ ...project, recordType: 'project' })} onEdit={() => onEdit(project)} onDelete={() => onDelete(project)} /></td></tr>)}
  </tbody></table>{loading && <div className="table-loading"><span className="button-spinner" /> Refreshing projects...</div>}{!loading && rows.length === 0 && <EmptyState icon={FolderKanban} title="No projects found" text="Add a project or adjust your search." />}</div><TableFooter count={rows.length} label="projects" /></section>
}

function ServicesView({ rows, loading, search, setSearch, onEdit, onDelete }) {
  return <section className="admin-panel data-panel"><ViewToolbar search={search} setSearch={setSearch} placeholder="Search services" /><div className="table-scroll"><table className="admin-data-table"><thead><tr><th>Service</th><th>Description</th><th>Display order</th><th>Added</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
    {rows.map(service => <tr key={service.id}><td><div className="record-name"><span className="service-record-icon"><Building2 size={18} /></span><strong>{service.title}</strong></div></td><td className="description-cell">{service.description}</td><td><span className="order-number">{String(service.sort_order || 0).padStart(2, '0')}</span></td><td>{formatDate(service.created_at)}</td><td><RowActions onEdit={() => onEdit(service)} onDelete={() => onDelete(service)} /></td></tr>)}
  </tbody></table>{loading && <div className="table-loading"><span className="button-spinner" /> Refreshing services...</div>}{!loading && rows.length === 0 && <EmptyState icon={Building2} title="No services found" text="Add a service or adjust your search." />}</div><TableFooter count={rows.length} label="services" /></section>
}

function EnquiriesView({ rows, loading, search, setSearch, statusFilter, setStatusFilter, onView, onStatus, onDelete }) {
  return <section className="admin-panel data-panel"><ViewToolbar search={search} setSearch={setSearch} placeholder="Search name, email, phone..."><label className="status-filter"><ArrowDownUp size={15} /><select aria-label="Filter by status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>All statuses</option>{enquiryStatuses.map(status => <option key={status}>{status}</option>)}</select></label></ViewToolbar><div className="table-scroll"><table className="admin-data-table enquiry-table"><thead><tr><th>Customer</th><th>Contact</th><th>Subject</th><th>Received</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
    {rows.map(item => <tr key={item.id}><td><button className="customer-cell" type="button" onClick={() => onView(item)}><span className="contact-avatar">{initials(item.name)}</span><span><strong>{item.name}</strong><small>{item.email}</small></span></button></td><td>{item.phone || '—'}</td><td className="subject-cell">{item.subject || item.message}</td><td>{formatDate(item.created_at)}</td><td><label className="status-select-wrap"><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span><select aria-label={`Change ${item.name} enquiry status`} value={item.status} onChange={event => onStatus(item, event.target.value)}>{enquiryStatuses.map(status => <option key={status}>{status}</option>)}</select></label></td><td><RowActions onView={() => onView(item)} onDelete={() => onDelete(item)} /></td></tr>)}
  </tbody></table>{loading && <div className="table-loading"><span className="button-spinner" /> Refreshing enquiries...</div>}{!loading && rows.length === 0 && <EmptyState icon={ClipboardList} title="No enquiries found" text="Try another search or status filter." />}</div><TableFooter count={rows.length} label="enquiries" /></section>
}

function RowActions({ onView, onEdit, onDelete }) {
  return <div className="row-actions">{onView && <button type="button" title="View details" aria-label="View details" onClick={onView}><Eye size={16} /></button>}{onEdit && <button type="button" title="Edit record" aria-label="Edit record" onClick={onEdit}><Pencil size={15} /></button>}{onDelete && <button type="button" className="danger-action" title="Delete record" aria-label="Delete record" onClick={onDelete}><Trash2 size={16} /></button>}</div>
}

function TableFooter({ count, label }) {
  return <div className="table-footer"><span>Showing <strong>{count}</strong> {label}</span><span className="pagination-static">All records <ChevronDown size={14} /></span></div>
}

function EmptyState({ icon: Icon, title, text }) {
  return <div className="admin-empty-state"><span><Icon size={21} /></span><strong>{title}</strong><p>{text}</p></div>
}

function RecordEditor({ editor, saving, onClose, onSave }) {
  const isProject = editor.type === 'projects'
  const record = editor.record || {}
  const [title, setTitle] = useState(record.title || '')
  const [slug, setSlug] = useState(record.slug || '')
  const [slugTouched, setSlugTouched] = useState(Boolean(record.slug))
  const generatedSlug = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="admin-modal record-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title"><header className="modal-header"><div><p className="panel-kicker">{editor.record ? 'EDIT RECORD' : 'NEW RECORD'}</p><h2 id="editor-title">{editor.record ? 'Update' : 'Add'} {isProject ? 'project' : 'service'}</h2></div><button className="modal-close" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></header><form className="record-form" onSubmit={onSave}>
    <label>{isProject ? 'Project name' : 'Service name'}<input name="title" value={title} onChange={event => { setTitle(event.target.value); if (!slugTouched) setSlug(generatedSlug(event.target.value)) }} maxLength={isProject ? 160 : 160} required autoFocus /></label>
    {isProject ? <><label>Project slug<input name="slug" value={slug} onChange={event => { setSlugTouched(true); setSlug(generatedSlug(event.target.value)) }} maxLength="180" required /><small>Used in the project URL.</small></label><label>Description<textarea name="description" defaultValue={record.description || ''} rows="4" required /></label><div className="form-two-col"><label>Category<select name="category" defaultValue={record.category || categories[0]}>{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>Status<select name="status" defaultValue={record.status || projectStatuses[0]}>{projectStatuses.map(status => <option key={status}>{status}</option>)}</select></label></div><label>Location<input name="location" defaultValue={record.location || ''} maxLength="160" required /></label><label>Cover image URL<input name="cover_image" type="url" defaultValue={record.cover_image || ''} maxLength="500" placeholder="https://..." /></label></> : <><label>Description<textarea name="description" defaultValue={record.description || ''} rows="5" required /></label><label>Display order<input name="sort_order" type="number" min="0" max="65535" defaultValue={record.sort_order ?? ''} placeholder="Leave blank to add at the end" /></label></>}
    <footer className="modal-actions"><button className="admin-secondary-button" type="button" onClick={onClose}>Cancel</button><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? <><span className="button-spinner" /> Saving...</> : <><Check size={16} /> {editor.record ? 'Save changes' : `Create ${isProject ? 'project' : 'service'}`}</>}</button></footer>
  </form></section></div>
}

function EnquiryDetail({ enquiry, onClose, onStatus }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="admin-modal enquiry-detail-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title"><header className="modal-header"><div><p className="panel-kicker">CUSTOMER ENQUIRY · {formatDate(enquiry.created_at)}</p><h2 id="enquiry-title">{enquiry.name}</h2></div><button className="modal-close" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></header><div className="enquiry-detail-meta"><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>{enquiry.phone && <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>}{enquiry.subject && <span>{enquiry.subject}</span>}</div><div className="enquiry-message"><span>MESSAGE</span><p>{enquiry.message}</p></div><label className="detail-status">Enquiry status<select value={enquiry.status} onChange={event => onStatus(enquiry, event.target.value)}>{enquiryStatuses.map(status => <option key={status}>{status}</option>)}</select></label></section></div>
}

function ProjectDetail({ project, onClose }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="admin-modal project-detail-modal" role="dialog" aria-modal="true" aria-labelledby="project-detail-title"><header className="modal-header"><div><p className="panel-kicker">PROJECT · {project.category}</p><h2 id="project-detail-title">{project.title}</h2></div><button className="modal-close" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></header>{project.cover_image && <img className="project-detail-image" src={project.cover_image} alt={`${project.title} project`} />}<div className="project-detail-content"><span className={`status-pill ${statusClass(project.status)}`}>{project.status}</span><p>{project.description}</p><dl><div><dt>Location</dt><dd>{project.location}</dd></div><div><dt>Created</dt><dd>{formatDate(project.created_at)}</dd></div><div><dt>Project slug</dt><dd>{project.slug}</dd></div></dl></div></section></div>
}

export default Admin