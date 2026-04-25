import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import {
  getProjects, getProjectBySlug, createProject,
  getModulesByProject, createModule, updateModuleStatus,
  logActivity, getActivity, getModuleVersions,
} from './db/queries';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

const requireAuth = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'ccc-admin' }));

// Projects
app.get('/projects', async (c) => {
  const result = await getProjects(c.env.CCC_ADMIN_DB);
  return c.json(result.results);
});

app.get('/projects/:slug', async (c) => {
  const project = await getProjectBySlug(c.env.CCC_ADMIN_DB, c.req.param('slug'));
  if (!project) return c.json({ error: 'Not found' }, 404);
  const modules = await getModulesByProject(c.env.CCC_ADMIN_DB, (project as any).id);
  return c.json({ ...project, modules: modules.results });
});

app.post('/projects', requireAuth, async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.slug) return c.json({ error: 'name and slug are required' }, 400);
  const project = await createProject(c.env.CCC_ADMIN_DB, body);
  await logActivity(c.env.CCC_ADMIN_DB, {
    project_id: (project as any).id,
    event_type: 'ProjectCreated',
    description: `Project '${body.name}' registered`,
    triggered_by: 'Claude Code',
  });
  return c.json(project, 201);
});

// Modules
app.get('/projects/:slug/modules', async (c) => {
  const project = await getProjectBySlug(c.env.CCC_ADMIN_DB, c.req.param('slug'));
  if (!project) return c.json({ error: 'Not found' }, 404);
  const modules = await getModulesByProject(c.env.CCC_ADMIN_DB, (project as any).id);
  return c.json(modules.results);
});

app.post('/projects/:slug/modules', requireAuth, async (c) => {
  const project = await getProjectBySlug(c.env.CCC_ADMIN_DB, c.req.param('slug'));
  if (!project) return c.json({ error: 'Project not found' }, 404);
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const module_ = await createModule(c.env.CCC_ADMIN_DB, { project_id: (project as any).id, ...body });
  await logActivity(c.env.CCC_ADMIN_DB, {
    project_id: (project as any).id,
    module_id: (module_ as any).id,
    event_type: 'ModuleCreated',
    description: `Module '${body.name}' added to ${c.req.param('slug')}`,
    triggered_by: 'Claude Code',
  });
  return c.json(module_, 201);
});

// Status update — used by project Workers via service binding
app.patch('/modules/:id/status', requireAuth, async (c) => {
  const moduleId = parseInt(c.req.param('id'));
  const body = await c.req.json();
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  await updateModuleStatus(c.env.CCC_ADMIN_DB, moduleId, body.status, body.changed_by ?? 'Manual', body.notes);
  await logActivity(c.env.CCC_ADMIN_DB, {
    module_id: moduleId,
    event_type: 'StatusChange',
    description: `Status → ${body.status}${body.notes ? ': ' + body.notes : ''}`,
    triggered_by: body.changed_by ?? 'Manual',
  });
  return c.json({ success: true });
});

// Module version history
app.get('/modules/:id/versions', async (c) => {
  const versions = await getModuleVersions(c.env.CCC_ADMIN_DB, parseInt(c.req.param('id')));
  return c.json(versions.results);
});

// Activity feed
app.get('/activity', async (c) => {
  const limit = parseInt(c.req.query('limit') ?? '50');
  const activity = await getActivity(c.env.CCC_ADMIN_DB, limit);
  return c.json(activity.results);
});

// Internal endpoint — for service binding calls from project Workers
// Accepts project_id (int) or project_slug (string) — resolves slug if needed
app.post('/internal/report', async (c) => {
  const body = await c.req.json<{
    project_id?: number; project_slug?: string; module_id?: number;
    event_type?: string; description?: string; triggered_by?: string;
  }>();

  let projectId = body.project_id;
  if (!projectId && body.project_slug) {
    const proj = await getProjectBySlug(c.env.CCC_ADMIN_DB, body.project_slug);
    projectId = (proj as { id: number } | null)?.id;
  }

  await logActivity(c.env.CCC_ADMIN_DB, {
    project_id: projectId,
    module_id: body.module_id,
    event_type: body.event_type ?? 'AgentAction',
    description: body.description,
    triggered_by: body.triggered_by ?? 'Worker',
  });
  return c.json({ success: true });
});

export default app;
