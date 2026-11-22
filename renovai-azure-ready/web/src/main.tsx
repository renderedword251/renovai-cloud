import React from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

type ClientPrincipal = {
  userDetails?: string;
};

type AuthResponse = {
  clientPrincipal?: ClientPrincipal;
};

type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'error';
type Section = 'Dashboard' | 'Projects' | 'AI Studio' | 'Estimates' | 'Exports' | 'Settings';

type LocalProject = {
  id: string;
  name: string;
  type: string;
  editedAt: string;
};

const STORAGE_KEY = 'renovai.local-projects.v1';
const sections: Section[] = ['Dashboard', 'Projects', 'AI Studio', 'Estimates', 'Exports', 'Settings'];
const quickStarts = [
  {title: 'AI Blueprint', detail: 'AI tools aren’t connected yet', icon: 'blueprint', action: 'AI Studio' as Section},
  {title: 'Remodel', detail: 'Create a local remodel draft', icon: 'remodel', action: 'Remodel' as const},
  {title: 'Estimate', detail: 'Cost estimates aren’t connected', icon: 'estimate', action: 'Estimates' as Section},
  {title: 'Import', detail: 'Project import isn’t connected', icon: 'import', action: 'Import' as const},
];

function Icon({name, size = 20}: {name: string; size?: number}) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
    projects: <><path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" /><path d="M3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" /></>,
    studio: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    estimate: <><path d="M5 3h14v18H5z" /><path d="M8 7h8M8 11h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2" /></>,
    exports: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M4 17v4h16v-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9L6.1 12l1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    blueprint: <><path d="M4 4h16v16H4z" /><path d="M8 4v5h5v5h7M4 14h4v6m4-6v6" /></>,
    remodel: <><path d="M4 20V9l8-6 8 6v11" /><path d="M9 20v-6h6v6m-7-9h.01M16 11h.01" /></>,
    import: <><path d="M12 15V3m-5 5 5-5 5 5" /><path d="M4 13v7h16v-7" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] ?? paths.home}
    </svg>
  );
}

function displayName(userDetails: string) {
  if (!userDetails) return 'Your account';
  const name = userDetails.includes('@') ? userDetails.split('@')[0].replace(/[._-]+/g, ' ') : userDetails;
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isLocalProject(value: unknown): value is LocalProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as Record<string, unknown>;
  return typeof project.id === 'string'
    && typeof project.name === 'string'
    && typeof project.type === 'string'
    && typeof project.editedAt === 'string';
}

function AuthGate({error}: {error: boolean}) {
  return (
    <main className="auth-gate">
      <a className="brand brand-dark" href="/" aria-label="RenovAI home">
        <span className="brand-mark"><Icon name="home" size={22} /></span>
        <span>Renov<span>AI</span></span>
      </a>
      <div className="auth-card">
        <span className="auth-icon"><Icon name="home" size={25} /></span>
        <h1>{error ? 'Sign-in status unavailable' : 'Your design space is private'}</h1>
        <p>{error ? 'We couldn’t verify your sign-in. Refresh the page or try signing in again.' : 'Sign in to open your RenovAI dashboard and projects.'}</p>
        <a className="button button-primary" href="/.auth/login/aad">Sign in with Microsoft <Icon name="arrow" size={17} /></a>
      </div>
      <p className="auth-footnote">RenovAI plans are conceptual and require professional review.</p>
    </main>
  );
}

function Landing({authStatus, userDetails}: {authStatus: AuthStatus; userDetails: string}) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <a className="brand" href="/" aria-label="RenovAI home">
          <span className="brand-mark"><Icon name="home" size={22} /></span>
          <span>Renov<span>AI</span></span>
        </a>
        {authStatus === 'loading' ? <span className="subtle">Checking sign-in…</span> : authStatus === 'authenticated' ? (
          <div className="landing-account"><span>{displayName(userDetails)}</span><a href="/logout">Sign out</a></div>
        ) : <a className="text-link" href="/.auth/login/aad">Sign in</a>}
      </header>
      <section className="landing-content">
        <span className="landing-spark"><Icon name="studio" size={20} /></span>
        <h1>Make room for what’s next.</h1>
        <p>Plan your next home project with a clearer picture of the spaces, ideas, and decisions ahead.</p>
        {authStatus === 'authenticated'
          ? <a className="button button-primary" href="/dashboard">Open dashboard <Icon name="arrow" size={17} /></a>
          : <a className="button button-primary" href="/.auth/login/aad">Get started <Icon name="arrow" size={17} /></a>}
      </section>
      <footer className="landing-footer">Concept plans only. Verify construction, code, structural, utility, and permit requirements with qualified local professionals.</footer>
    </main>
  );
}

function Dashboard({userDetails}: {userDetails: string}) {
  const [activeSection, setActiveSection] = React.useState<Section>('Dashboard');
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [projectFormOpen, setProjectFormOpen] = React.useState(false);
  const [projectName, setProjectName] = React.useState('');
  const [projectType, setProjectType] = React.useState('Home renovation');
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [projects, setProjects] = React.useState<LocalProject[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(true);
  const [storageError, setStorageError] = React.useState('');
  const [notice, setNotice] = React.useState('');

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(isLocalProject)) {
          throw new Error('Saved project data has an unexpected format.');
        }
        setProjects(parsed);
      }
    } catch {
      setStorageError('Local projects couldn’t be read from this browser. Check your browser storage settings and reload.');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const name = displayName(userDetails);
  const greetingName = userDetails ? name.split(' ')[0] : 'there';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const filteredProjects = projects.filter((project) => {
    const matchesQuery = `${project.name} ${project.type}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusFilter === 'draft';
    return matchesQuery && matchesStatus;
  });

  function openProjectForm(type = 'Home renovation') {
    setActiveSection('Projects');
    setProjectType(type);
    setProjectFormOpen(true);
    setNotice('');
  }

  function chooseAction(action: typeof quickStarts[number]['action']) {
    setMobileNavOpen(false);
    if (action === 'Remodel') {
      openProjectForm('Remodel');
      return;
    }
    if (action === 'Import') {
      setActiveSection('Projects');
      setNotice('Project import isn’t connected yet. No files have been uploaded.');
      return;
    }
    setActiveSection(action);
    setNotice('');
  }

  function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = projectName.trim();
    if (!trimmedName) return;
    const nextProjects = [
      {id: `${Date.now()}`, name: trimmedName, type: projectType, editedAt: new Date().toISOString()},
      ...projects,
    ];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
      setProjects(nextProjects);
      setProjectName('');
      setProjectFormOpen(false);
      setStorageError('');
      setNotice('Local draft created on this device. It isn’t synced to the cloud.');
    } catch {
      setStorageError('This browser couldn’t save your project. Check available storage and try again.');
    }
  }

  const sectionDetails: Record<Exclude<Section, 'Dashboard' | 'Projects'>, {description: string; icon: string}> = {
    'AI Studio': {description: 'AI blueprint and design tools aren’t connected to this deployment yet.', icon: 'studio'},
    Estimates: {description: 'Cost estimates aren’t available yet. No pricing or estimate has been generated.', icon: 'estimate'},
    Exports: {description: 'There are no export tools connected yet.', icon: 'exports'},
    Settings: {description: 'Account settings aren’t available in this dashboard yet.', icon: 'settings'},
  };

  return (
    <div className="dashboard-shell">
      {mobileNavOpen && <button className="nav-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar${mobileNavOpen ? ' sidebar-open' : ''}`}>
        <a className="brand" href="/" aria-label="RenovAI home">
          <span className="brand-mark"><Icon name="home" size={22} /></span>
          <span>Renov<span>AI</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {sections.map((section) => (
            <button key={section} className={`nav-item${activeSection === section ? ' nav-item-active' : ''}`} onClick={() => {
              setActiveSection(section);
              setMobileNavOpen(false);
              setNotice('');
            }} aria-current={activeSection === section ? 'page' : undefined}>
              <Icon name={section === 'Dashboard' ? 'dashboard' : section === 'Projects' ? 'projects' : section === 'AI Studio' ? 'studio' : section.toLowerCase()} size={19} />
              <span>{section}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note-icon"><Icon name="blueprint" size={18} /></div>
          <p>Ideas first.<br /><strong>Build with confidence.</strong></p>
          <span>Plans are conceptual and need professional review.</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><span /><span /><span /></button>
          <div className="breadcrumbs"><span>RenovAI</span><Icon name="chevron" size={15} /><strong>{activeSection}</strong></div>
          <div className="account-area">
            <span className="account-avatar" aria-hidden="true">{name.slice(0, 1)}</span>
            <span className="account-name">{name}</span>
            <a className="sign-out" href="/logout">Sign out</a>
          </div>
        </header>

        <main className="page-content">
          {activeSection === 'Dashboard' ? (
            <>
              <section className="welcome-row">
                <div>
                  <h1>{greeting}, {greetingName}.</h1>
                  <p>Your next idea starts with a little space to think.</p>
                </div>
                <div className="welcome-actions">
                  <button className="button button-secondary" onClick={() => chooseAction('AI Studio')}><Icon name="studio" size={17} /> Ask RenovAI</button>
                  <button className="button button-primary" onClick={() => openProjectForm()}><Icon name="plus" size={18} /> New project</button>
                </div>
              </section>

              <section className="quick-start-section" aria-labelledby="quick-start-title">
                <div className="section-heading">
                  <div><h2 id="quick-start-title">Quick start</h2><p>Choose a place to begin.</p></div>
                </div>
                <div className="quick-start-grid">
                  {quickStarts.map((item) => (
                    <button className="quick-start" key={item.title} onClick={() => chooseAction(item.action)}>
                      <span className={`quick-icon quick-icon-${item.icon}`}><Icon name={item.icon} size={20} /></span>
                      <span className="quick-copy"><strong>{item.title}</strong><span>{item.detail}</span></span>
                      <Icon name="arrow" size={17} />
                    </button>
                  ))}
                </div>
              </section>

              <ProjectsSection
                projects={filteredProjects}
                total={projects.length}
                loading={projectsLoading}
                query={query}
                statusFilter={statusFilter}
                onQueryChange={setQuery}
                onStatusChange={setStatusFilter}
                onCreate={() => openProjectForm()}
              />
            </>
          ) : activeSection === 'Projects' ? (
            <ProjectsSection
              projects={filteredProjects}
              total={projects.length}
              loading={projectsLoading}
              query={query}
              statusFilter={statusFilter}
              onQueryChange={setQuery}
              onStatusChange={setStatusFilter}
              onCreate={() => openProjectForm()}
              standalone
            />
          ) : (
            <section className="unavailable-panel">
              <span className="unavailable-icon"><Icon name={sectionDetails[activeSection].icon} size={24} /></span>
              <h1>{activeSection}</h1>
              <p>{sectionDetails[activeSection].description}</p>
              <span className="availability-label"><span /> Not connected yet</span>
              <button className="button button-secondary" onClick={() => setActiveSection('Dashboard')}>Back to dashboard</button>
            </section>
          )}

          {projectFormOpen && (
            <section className="project-form-panel" aria-labelledby="create-project-heading">
              <div className="form-panel-heading">
                <div><h2 id="create-project-heading">Start a project draft</h2><p>Saved in this browser only. Cloud sync isn’t connected.</p></div>
                <button className="icon-button" onClick={() => setProjectFormOpen(false)} aria-label="Close new project form"><Icon name="close" size={20} /></button>
              </div>
              <form className="project-form" onSubmit={createProject}>
                <label htmlFor="project-name">Project name</label>
                <input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g. Upstairs bathroom refresh" maxLength={70} required autoFocus />
                <label htmlFor="project-type">Project type</label>
                <select id="project-type" value={projectType} onChange={(event) => setProjectType(event.target.value)}>
                  <option>Home renovation</option><option>Remodel</option><option>New home</option>
                </select>
                <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setProjectFormOpen(false)}>Cancel</button><button type="submit" className="button button-primary"><Icon name="plus" size={17} /> Create local draft</button></div>
              </form>
            </section>
          )}

          {storageError && <p className="inline-alert" role="alert">{storageError}</p>}
          {notice && <p className="notice" role="status">{notice}</p>}
          <footer className="dashboard-footer"><span>RenovAI helps you explore possibilities—not replace professional advice.</span><a href="/logout">Sign out <Icon name="arrow" size={14} /></a></footer>
        </main>
      </div>
    </div>
  );
}

function ProjectsSection({
  projects,
  total,
  loading,
  query,
  statusFilter,
  onQueryChange,
  onStatusChange,
  onCreate,
  standalone = false,
}: {
  projects: LocalProject[];
  total: number;
  loading: boolean;
  query: string;
  statusFilter: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCreate: () => void;
  standalone?: boolean;
}) {
  return (
    <section className={`projects-section${standalone ? ' projects-standalone' : ''}`} id="projects" aria-labelledby="projects-title">
      <div className="section-heading projects-heading">
        <div><h2 id="projects-title">Your projects</h2><p>{total ? `${total} ${total === 1 ? 'local draft' : 'local drafts'} on this device` : 'Your home ideas will have a place here.'}</p></div>
        <button className="button button-tertiary" onClick={onCreate}><Icon name="plus" size={17} /> New project</button>
      </div>
      <div className="project-tools">
        <label className="search-field">
          <Icon name="search" size={18} />
          <span className="sr-only">Search projects</span>
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search projects" />
          {query && <button type="button" className="clear-search" onClick={() => onQueryChange('')} aria-label="Clear search"><Icon name="close" size={16} /></button>}
        </label>
        <label className="filter-field"><span className="sr-only">Filter projects by status</span><select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}><option value="all">All statuses</option><option value="draft">Local drafts</option></select></label>
      </div>
      {loading ? <div className="project-skeleton" role="status">Loading your local drafts…</div> : projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-preview"><span className="preview-tag">LOCAL DRAFT</span><span className="preview-home"><Icon name="home" size={35} /></span><span className="preview-line preview-line-one" /><span className="preview-line preview-line-two" /></div>
              <div className="project-card-content">
                <div className="project-title-row"><h3>{project.name}</h3><span className="status-pill">Draft</span></div>
                <p className="project-type">{project.type}</p>
                <div className="project-meta"><span>Last edited</span><time dateTime={project.editedAt}>{new Date(project.editedAt).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})}</time></div>
              </div>
            </article>
          ))}
        </div>
      ) : query ? (
        <div className="empty-state empty-search"><span className="empty-icon"><Icon name="search" size={22} /></span><h3>No projects found</h3><p>Try a different search, or clear the search field.</p><button className="text-link" onClick={() => onQueryChange('')}>Clear search</button></div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="projects" size={23} /></span>
          <h3>No projects yet</h3>
          <p>Start a local draft to keep a renovation idea organized. It will stay in this browser until cloud projects are available.</p>
          <button className="button button-primary" onClick={onCreate}><Icon name="plus" size={17} /> Create your first draft</button>
        </div>
      )}
    </section>
  );
}

function App() {
  const [authStatus, setAuthStatus] = React.useState<AuthStatus>('loading');
  const [userDetails, setUserDetails] = React.useState('');

  React.useEffect(() => {
    let active = true;
    fetch('/.auth/me', {cache: 'no-store'})
      .then((response) => {
        if (!response.ok) throw new Error(`Authentication check failed with status ${response.status}`);
        return response.json() as Promise<AuthResponse>;
      })
      .then(({clientPrincipal}) => {
        if (!active) return;
        if (clientPrincipal) {
          setUserDetails(clientPrincipal.userDetails ?? '');
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('anonymous');
        }
      })
      .catch(() => {
        if (active) setAuthStatus('error');
      });
    return () => { active = false; };
  }, []);

  if (window.location.pathname === '/dashboard' || window.location.pathname.startsWith('/dashboard/')) {
    if (authStatus === 'loading') {
      return <main className="auth-gate"><div className="loading-mark"><Icon name="home" size={25} /></div><p role="status">Checking your sign-in…</p></main>;
    }
    return authStatus === 'authenticated' ? <Dashboard userDetails={userDetails} /> : <AuthGate error={authStatus === 'error'} />;
  }
  return <Landing authStatus={authStatus} userDetails={userDetails} />;
}

createRoot(document.getElementById('root')!).render(<App/>);
