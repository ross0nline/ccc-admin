import type { D1Database } from '@cloudflare/workers-types';
import type { StatusValue } from '../types';

export async function getProjects(db: D1Database) {
  return db.prepare('SELECT * FROM projects ORDER BY id ASC').all();
}

export async function getProjectBySlug(db: D1Database, slug: string) {
  return db.prepare('SELECT * FROM projects WHERE slug = ?').bind(slug).first();
}

export async function createProject(db: D1Database, data: {
  name: string; slug: string; description?: string; github_url?: string;
}) {
  return db.prepare(
    'INSERT INTO projects (name, slug, description, github_url) VALUES (?, ?, ?, ?) RETURNING *'
  ).bind(data.name, data.slug, data.description ?? null, data.github_url ?? null).first();
}

export async function getModulesByProject(db: D1Database, projectId: number) {
  return db.prepare('SELECT * FROM modules WHERE project_id = ? ORDER BY id ASC').bind(projectId).all();
}

export async function createModule(db: D1Database, data: {
  project_id: number; name: string; description?: string; category?: string;
}) {
  return db.prepare(
    'INSERT INTO modules (project_id, name, description, category) VALUES (?, ?, ?, ?) RETURNING *'
  ).bind(data.project_id, data.name, data.description ?? null, data.category ?? null).first();
}

export async function updateModuleStatus(db: D1Database, moduleId: number, status: StatusValue, changedBy: string, notes?: string) {
  const version = new Date().toISOString().split('T')[0];
  await db.batch([
    db.prepare('UPDATE modules SET current_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(status, moduleId),
    db.prepare('INSERT INTO module_versions (module_id, version, status, notes, changed_by) VALUES (?, ?, ?, ?, ?)')
      .bind(moduleId, version, status, notes ?? null, changedBy),
  ]);
}

export async function logActivity(db: D1Database, data: {
  project_id?: number; module_id?: number; event_type: string; description?: string; triggered_by?: string;
}) {
  return db.prepare(
    'INSERT INTO activity_log (project_id, module_id, event_type, description, triggered_by) VALUES (?, ?, ?, ?, ?)'
  ).bind(data.project_id ?? null, data.module_id ?? null, data.event_type, data.description ?? null, data.triggered_by ?? null).run();
}

export async function getActivity(db: D1Database, limit = 50) {
  return db.prepare(
    'SELECT a.*, p.slug as project_slug, m.name as module_name FROM activity_log a LEFT JOIN projects p ON a.project_id = p.id LEFT JOIN modules m ON a.module_id = m.id ORDER BY a.timestamp DESC LIMIT ?'
  ).bind(limit).all();
}

export async function getModuleVersions(db: D1Database, moduleId: number) {
  return db.prepare('SELECT * FROM module_versions WHERE module_id = ? ORDER BY timestamp DESC').bind(moduleId).all();
}
