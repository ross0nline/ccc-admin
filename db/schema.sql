-- CCC Admin Database Schema
-- Global meta-system tracking all Claude + Cursor + Cloudflare projects

-- The universe of CCC projects
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Uninitiated',
    github_url TEXT,
    pages_url TEXT,
    worker_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tech stack items (normalized lookup table)
CREATE TABLE IF NOT EXISTS tech_stack (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    version TEXT,
    docs_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many: which projects use which tech
CREATE TABLE IF NOT EXISTS project_tech_stack (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tech_id INTEGER NOT NULL REFERENCES tech_stack(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tech_id)
);

-- Modules within a project
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    current_status TEXT DEFAULT 'Uninitiated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Full version history of every module (the audit trail)
CREATE TABLE IF NOT EXISTS module_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual features within a module
CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Uninitiated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sub-agents defined per module
CREATE TABLE IF NOT EXISTS sub_agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    purpose TEXT,
    system_prompt TEXT,
    trigger_type TEXT,
    status TEXT DEFAULT 'Uninitiated',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service connections per project (no secret values stored)
CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    connection_type TEXT,
    status TEXT DEFAULT 'Uninitiated',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cross-project activity log
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    triggered_by TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: CCC Admin registers itself as Project #0
INSERT OR IGNORE INTO projects (id, name, slug, description, status, github_url)
VALUES (1, 'CCC Admin', 'ccc-admin', 'Global meta-system tracking all CCC projects, modules, tech stack, and activity', 'Active', 'https://github.com/ross0nline/ccc-admin');

-- Seed: ACIS registered as Project #1
INSERT OR IGNORE INTO projects (id, name, slug, description, status, github_url)
VALUES (2, 'ACIS', 'acis', 'Autonomous Compliance Intelligence System — HIPAA, RxDC, Gag Clause compliance operations center', 'Uninitiated', 'https://github.com/ross0nline/acis');

-- Seed: Core tech stack
INSERT OR IGNORE INTO tech_stack (id, name, category, version) VALUES
(1, 'Cloudflare Workers', 'Compute', '4.85.0'),
(2, 'Cloudflare D1', 'Database', NULL),
(3, 'Cloudflare R2', 'Storage', NULL),
(4, 'Cloudflare Pages', 'Frontend', NULL),
(5, 'Cloudflare AI Gateway', 'AI', NULL),
(6, 'TypeScript', 'Language', '5.x'),
(7, 'Claude API', 'AI', 'claude-sonnet-4-6'),
(8, 'Resend', 'Email', NULL),
(9, 'GitHub Actions', 'DevOps', NULL),
(10, 'Wrangler', 'DevOps', '4.85.0');
