const BASE = import.meta.env.PROD
  ? 'https://ccc-admin.rossonlineservices.workers.dev'
  : '/api';

export async function fetchProjects() {
  const res = await fetch(`${BASE}/projects`);
  return res.json();
}

export async function fetchProject(slug: string) {
  const res = await fetch(`${BASE}/projects/${slug}`);
  return res.json();
}

export async function fetchActivity(limit = 50) {
  const res = await fetch(`${BASE}/activity?limit=${limit}`);
  return res.json();
}

export async function fetchModuleVersions(moduleId: number) {
  const res = await fetch(`${BASE}/modules/${moduleId}/versions`);
  return res.json();
}
