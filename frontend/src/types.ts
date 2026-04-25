export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  github_url: string | null;
  pages_url: string | null;
  worker_name: string | null;
  created_at: string;
  updated_at: string;
  modules?: Module[];
}

export interface Module {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  category: string | null;
  current_status: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleVersion {
  id: number;
  module_id: number;
  version: string;
  status: string;
  notes: string | null;
  changed_by: string | null;
  timestamp: string;
}

export interface ActivityEvent {
  id: number;
  project_id: number | null;
  module_id: number | null;
  event_type: string;
  description: string | null;
  triggered_by: string | null;
  timestamp: string;
  project_slug: string | null;
  module_name: string | null;
}
