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

const projectTypes = ['New Home', 'Remodel', 'Addition', 'Interior'] as const;
const projectStatuses = ['Concept', 'Draft', 'Planning'] as const;
type ProjectStatus = typeof projectStatuses[number];
type ProjectType = typeof projectTypes[number];

type Project = {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  area?: number;
  createdAt: string;
  updatedAt: string;
};

const sections: Section[] = ['Dashboard', 'Projects', 'AI Studio', 'Estimates', 'Exports', 'Settings'];
const quickStarts = [
  {title: 'Blueprint', detail: 'AI generation not connected', icon: 'blueprint', action: 'AI Studio' as Section},
  {title: 'Remodel', detail: 'Create a local remodel draft', icon: 'remodel', action: 'Remodel' as const},
  {title: 'Estimate', detail: 'Cost estimates not connected', icon: 'estimate', action: 'Estimates' as Section},
  {title: 'Import', detail: 'Plan imports not connected', icon: 'import', action: 'Import' as const},
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

function isProjectType(value: unknown): value is ProjectType {
  return typeof value === 'string' && projectTypes.some((projectType) => projectType === value);
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && projectStatuses.some((projectStatus) => projectStatus === value);
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const project = value as Record<string, unknown>;
  return typeof project.id === 'string'
    && typeof project.name === 'string'
    && isProjectType(project.type)
    && isProjectStatus(project.status)
    && typeof project.createdAt === 'string'
    && Number.isFinite(Date.parse(project.createdAt))
    && typeof project.updatedAt === 'string'
    && Number.isFinite(Date.parse(project.updatedAt))
    && (project.area === undefined || (typeof project.area === 'number' && Number.isFinite(project.area) && project.area > 0));
}

function isProjectsResponse(value: unknown): value is {projects: Project[]} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const projects = (value as Record<string, unknown>).projects;
  return Array.isArray(projects) && projects.every(isProject);
}

function getApiError(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const error = (value as Record<string, unknown>).error;
  return typeof error === 'string' ? error : null;
}

async function readResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
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
  const projectDialogRef = React.useRef<HTMLDialogElement>(null);
  const [projectName, setProjectName] = React.useState('');
  const [projectType, setProjectType] = React.useState<ProjectType>(projectTypes[0]);
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(true);
  const [projectsError, setProjectsError] = React.useState('');
  const [creatingProject, setCreatingProject] = React.useState(false);
  const [projectFormError, setProjectFormError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [projectNotice, setProjectNotice] = React.useState('');
  const [aiPrompt, setAiPrompt] = React.useState('');

  React.useEffect(() => {
    const dialog = projectDialogRef.current;
    if (!dialog) return;
    if (projectFormOpen && !dialog.open) dialog.showModal();
    if (!projectFormOpen && dialog.open) dialog.close();
  }, [projectFormOpen]);

  const loadProjects = React.useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError('');
    try {
      const response = await fetch('/api/projects', {cache: 'no-store'});
      const result = await readResponseJson(response);
      if (!response.ok) {
        throw new Error(getApiError(result) ?? `Projects API returned ${response.status}`);
      }
      if (!isProjectsResponse(result)) {
        throw new Error('Projects API returned an unexpected response.');
      }
      setProjects(result.projects);
    } catch (error) {
      setProjectsError(error instanceof Error ? error.message : 'Unable to load projects.');
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const name = displayName(userDetails);
  const greetingName = userDetails ? name.split(' ')[0] : 'there';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const filteredProjects = projects.filter((project) => {
    const matchesQuery = `${project.name} ${project.type}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter;
    return matchesQuery && matchesStatus;
  });

  function openProjectForm(type: ProjectType = projectTypes[0]) {
    setActiveSection('Projects');
    setProjectType(type);
    setProjectNotice('');
    setProjectFormError('');
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
    if (!trimmedName || creatingProject) return;
    setCreatingProject(true);
    setProjectFormError('');
    setProjectsError('');

    void (async () => {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({name: trimmedName, type: projectType}),
        });
        const result = await readResponseJson(response);
        if (!response.ok) {
          throw new Error(getApiError(result) ?? `Projects API returned ${response.status}`);
        }
        if (!isProject(result)) {
          throw new Error('Projects API returned an unexpected project.');
        }
        setProjects((current) => [result, ...current]);
        setQuery('');
        setStatusFilter('all');
        setProjectName('');
        setProjectType(projectTypes[0]);
        setProjectFormOpen(false);
        setNotice('Project created. Project storage is temporary while the API uses in-memory persistence.');
      } catch (error) {
        setProjectFormError(error instanceof Error ? error.message : 'Unable to create project.');
      } finally {
        setCreatingProject(false);
      }
    })();
  }

  const sectionDetails: Record<Exclude<Section, 'Dashboard' | 'Projects' | 'AI Studio'>, {description: string; icon: string}> = {
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
                  <span className="welcome-label">{greeting}</span>
                  <h1>Welcome back, {greetingName}.</h1>
                  <p>What would you like to design?</p>
                </div>
                <div className="welcome-actions">
                  <button className="button button-ai" onClick={() => chooseAction('AI Studio')}><Icon name="studio" size={17} /> Ask RenovAI</button>
                  <button className="button button-primary" onClick={() => openProjectForm()}><Icon name="plus" size={18} /> New project</button>
                </div>
              </section>

              <ProjectsSection
                projects={filteredProjects}
                total={projects.length}
                loading={projectsLoading}
                error={projectsError}
                query={query}
                statusFilter={statusFilter}
                onQueryChange={setQuery}
                onStatusChange={setStatusFilter}
                onCreate={() => openProjectForm()}
                onRetry={loadProjects}
              />

              <section className="quick-start-section" aria-labelledby="quick-start-title">
                <div className="section-heading">
                  <div><h2 id="quick-start-title">Quick start</h2><p>Choose a starting point for your design.</p></div>
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
            </>
          ) : activeSection === 'Projects' ? (
            <ProjectsSection
              projects={filteredProjects}
              total={projects.length}
              loading={projectsLoading}
              error={projectsError}
              query={query}
              statusFilter={statusFilter}
              onQueryChange={setQuery}
              onStatusChange={setStatusFilter}
              onCreate={() => openProjectForm()}
              onRetry={loadProjects}
              standalone
            />
          ) : activeSection === 'AI Studio' ? (
            <section className="ai-studio-panel">
              <div className="ai-studio-heading">
                <span className="ai-studio-icon"><Icon name="studio" size={23} /></span>
                <div><h1>Ask RenovAI</h1><p>Shape the idea before you start a project.</p></div>
              </div>
              <div className="ai-prompt-card">
                <label htmlFor="ai-prompt">What are you planning?</label>
                <textarea id="ai-prompt" value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder={'“Redesign my first floor with an open kitchen,\nmudroom and larger primary suite.”'} rows={4} />
                <div className="ai-prompt-actions">
                  <p id="ai-generation-status">AI generation isn’t connected yet. Your prompt stays in this browser and won’t be sent.</p>
                  <button className="button button-ai" disabled aria-describedby="ai-generation-status"><Icon name="studio" size={17} /> Generate Concept</button>
                </div>
              </div>
            </section>
          ) : (
            <section className="unavailable-panel">
              <span className="unavailable-icon"><Icon name={sectionDetails[activeSection].icon} size={24} /></span>
              <h1>{activeSection}</h1>
              <p>{sectionDetails[activeSection].description}</p>
              <span className="availability-label"><span /> Not connected yet</span>
              <button className="button button-secondary" onClick={() => setActiveSection('Dashboard')}>Back to dashboard</button>
            </section>
          )}

          <dialog ref={projectDialogRef} className="project-dialog" aria-labelledby="create-project-heading" onClose={() => setProjectFormOpen(false)} onCancel={() => setProjectFormOpen(false)} onClick={(event) => {
            if (event.target === event.currentTarget) setProjectFormOpen(false);
          }}>
            <div className="dialog-heading">
              <div><h2 id="create-project-heading">New RenovAI Project</h2><p>What are you planning?</p></div>
              <button className="icon-button" onClick={() => setProjectFormOpen(false)} aria-label="Close new project form"><Icon name="close" size={20} /></button>
            </div>
            <div className="project-type-grid" role="group" aria-label="Project type">
              {projectTypes.map((type) => (
                <button type="button" key={type} className={`project-type-option${projectType === type ? ' project-type-selected' : ''}`} aria-pressed={projectType === type} onClick={() => setProjectType(type)}>{type}</button>
              ))}
            </div>
            <button type="button" className="import-plan-button" onClick={() => setProjectNotice('Plan import isn’t connected yet. No files have been selected or uploaded.')}>
              <Icon name="import" size={18} /> Import Existing Plan
            </button>
            {projectNotice && <p className="dialog-notice" role="status">{projectNotice}</p>}
            <form className="project-form" onSubmit={createProject}>
              <label htmlFor="project-name">Project name</label>
              <input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Kitchen Renovation" maxLength={100} required autoFocus />
              <p className="api-storage-note">Projects are stored in memory for now and may disappear when the API restarts.</p>
              {projectFormError && <p className="inline-alert" role="alert">{projectFormError}</p>}
              <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setProjectFormOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={creatingProject || !projectName.trim()}><Icon name="plus" size={17} /> {creatingProject ? 'Creating…' : 'Create Project'}</button></div>
            </form>
          </dialog>

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
  error,
  query,
  statusFilter,
  onQueryChange,
  onStatusChange,
  onCreate,
  onRetry,
  standalone = false,
}: {
  projects: Project[];
  total: number;
  loading: boolean;
  error: string;
  query: string;
  statusFilter: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCreate: () => void;
  onRetry: () => void;
  standalone?: boolean;
}) {
  return (
    <section className={`projects-section${standalone ? ' projects-standalone' : ''}`} id="projects" aria-labelledby="projects-title">
      <div className="section-heading projects-heading">
        <div><h2 id="projects-title">{standalone ? 'Your projects' : 'Recent projects'}</h2><p>{total ? `${total} ${total === 1 ? 'project' : 'projects'}` : 'Your home ideas will have a place here.'}</p></div>
        <button className="button button-tertiary" onClick={onCreate}><Icon name="plus" size={17} /> New project</button>
      </div>
      <div className="project-tools">
        <label className="search-field">
          <Icon name="search" size={18} />
          <span className="sr-only">Search projects</span>
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search projects" />
          {query && <button type="button" className="clear-search" onClick={() => onQueryChange('')} aria-label="Clear search"><Icon name="close" size={16} /></button>}
        </label>
        <label className="filter-field"><span className="sr-only">Filter projects by status</span><select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}><option value="all">All statuses</option>{projectStatuses.map((status) => <option value={status.toLowerCase()} key={status}>{status}</option>)}</select></label>
      </div>
      <p className="persistence-note">Projects are temporarily stored in API memory and may disappear when a Functions worker restarts.</p>
      {loading ? <div className="project-skeleton" role="status">Loading your projects…</div> : error ? (
        <div className="project-error" role="alert">
          <div><strong>Projects couldn’t be loaded</strong><p>{error}</p></div>
          <button className="button button-secondary" onClick={onRetry}>Try again</button>
        </div>
      ) : projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-preview"><span className="preview-tag">NO BLUEPRINT YET</span><span className="preview-home"><Icon name="home" size={35} /></span><span className="preview-line preview-line-one" /><span className="preview-line preview-line-two" /></div>
              <div className="project-card-content">
                <div className="project-title-row"><h3>{project.name}</h3><span className={`status-pill status-${project.status.toLowerCase()}`}>{project.status}</span></div>
                <p className="project-type">{project.type}</p>
                <dl className="project-details">
                  <div className="project-detail"><dt>Est. area</dt><dd>{project.area ? `${project.area.toLocaleString()} sq ft` : 'Not estimated'}</dd></div>
                  <div className="project-detail"><dt>Est. budget</dt><dd>Not estimated</dd></div>
                  <div className="project-detail"><dt>Collaborators</dt><dd>Not available</dd></div>
                </dl>
                <div className="project-meta"><span>Last modified</span><time dateTime={project.updatedAt}>{new Date(project.updatedAt).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})}</time></div>
              </div>
            </article>
          ))}
        </div>
      ) : query ? (
        <div className="empty-state empty-search"><span className="empty-icon"><Icon name="search" size={22} /></span><h3>No projects found</h3><p>Try a different search, or clear the search field.</p><button className="text-link" onClick={() => onQueryChange('')}>Clear search</button></div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="projects" size={23} /></span>
          <h3>Your first design starts here</h3>
          <p>Create a new home, remodeling project, addition, or interior project.</p>
          <button className="button button-primary" onClick={onCreate}><Icon name="plus" size={17} /> New Project</button>
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
