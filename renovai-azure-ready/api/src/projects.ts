import {app, HttpRequest} from '@azure/functions';
import {randomUUID} from 'node:crypto';

type ClientPrincipal = {
  userId: string;
};

type ProjectStatus = 'Concept' | 'Draft' | 'Planning';

type ProjectType = 'New Home' | 'Remodel' | 'Addition' | 'Interior';

type Project = {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  area?: number;
  createdAt: string;
  updatedAt: string;
};

type StoredProject = Project & {
  ownerId: string;
};

const projectTypes: readonly ProjectType[] = ['New Home', 'Remodel', 'Addition', 'Interior'];
const projects = new Map<string, StoredProject>();

function isProjectType(value: unknown): value is ProjectType {
  return typeof value === 'string' && projectTypes.some((projectType) => projectType === value);
}

function getPrincipal(request: HttpRequest): ClientPrincipal | null {
  const encoded = request.headers.get('x-ms-client-principal');
  if (!encoded) return null;

  try {
    const principal: unknown = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    if (!principal || typeof principal !== 'object' || Array.isArray(principal)) return null;
    const record = principal as Record<string, unknown>;
    const userId = record.userId;
    const userRoles = record.userRoles;
    if (typeof userId !== 'string' || !userId || !Array.isArray(userRoles) || !userRoles.includes('authenticated')) {
      return null;
    }
    return {userId};
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toProjectResponse({ownerId: _ownerId, ...project}: StoredProject): Project {
  return project;
}

function unauthorized() {
  return {status: 401, jsonBody: {error: 'Authentication required'}};
}

app.http('projects-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async (request) => {
    const principal = getPrincipal(request);
    if (!principal) return unauthorized();

    try {
      const results = [...projects.values()]
        .filter((project) => project.ownerId === principal.userId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .map(toProjectResponse);

      return {status: 200, jsonBody: {projects: results}};
    } catch (error) {
      console.error('Unable to load projects', error);
      return {status: 500, jsonBody: {error: 'Unable to load projects'}};
    }
  },
});

app.http('projects-create', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async (request) => {
    const principal = getPrincipal(request);
    if (!principal) return unauthorized();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return {status: 400, jsonBody: {error: 'Request body must be valid JSON'}};
    }

    if (!isRecord(body)) {
      return {status: 400, jsonBody: {error: 'Request body must be a JSON object'}};
    }

    if (typeof body.name !== 'string' || !body.name.trim()) {
      return {status: 400, jsonBody: {error: 'Project name is required'}};
    }

    const name = body.name.trim();
    if (name.length > 100) {
      return {status: 400, jsonBody: {error: 'Project name must be 100 characters or fewer'}};
    }

    const type: unknown = body.type === undefined ? 'New Home' : body.type;
    if (!isProjectType(type)) {
      return {status: 400, jsonBody: {error: 'Project type must be New Home, Remodel, Addition, or Interior'}};
    }

    try {
      const now = new Date().toISOString();
      const project: StoredProject = {
        id: randomUUID(),
        ownerId: principal.userId,
        name,
        type,
        status: 'Concept',
        createdAt: now,
        updatedAt: now,
      };

      projects.set(project.id, project);
      return {status: 201, jsonBody: toProjectResponse(project)};
    } catch (error) {
      console.error('Unable to create project', error);
      return {status: 500, jsonBody: {error: 'Unable to create project'}};
    }
  },
});
