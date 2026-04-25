-- 002 — Seed ACIS reality into CCC Admin
-- Run: wrangler d1 execute ccc-admin-db --remote --file db/002-seed-acis-reality.sql
-- ACIS project_id = 2 (confirmed in live DB)

-- ── Update ACIS project to reflect live state ──────────────────────────────
UPDATE projects
SET status     = 'Active',
    pages_url  = 'https://acis.rossonlineservices.com',
    github_url = 'https://github.com/ross0nline/compliance-portfolio',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'acis';

-- ── Modules ────────────────────────────────────────────────────────────────
INSERT INTO modules (project_id, name, description, category, current_status) VALUES
(2, 'Regulatory Pulse',      '5-source federal regulatory scraper — Federal Register, Regulations.gov, Firecrawl. Claude scores every document.',             'Backend', 'Implemented'),
(2, 'Attestation Vault',     'Client plan RxDC and Gag Clause compliance tracking. Full CRUD + status lifecycle. 8 client records.',                          'Backend', 'Implemented'),
(2, 'Vendor Risk',           'Third-party vendor security assessor. Real TLS + 6-header scoring (0–100). Claude HIPAA risk summary.',                         'Backend', 'Implemented'),
(2, 'Incident Response',     'NIST 800-61 incident management. AI-generated playbooks on creation. Full status lifecycle.',                                   'Backend', 'Implemented'),
(2, 'Executive Hub',         'Cloudflare Pages dashboard. Four compliance panels: Live Pulse, Attestation, Vendor Risk, Incidents.',                          'Frontend', 'Implemented'),
(2, 'Operations Tab',        'Admin control plane in Executive Hub. Manual triggers, Last Heartbeat view, Agent Logs panel.',                                 'Frontend', 'Implemented'),
(2, 'Scraper Agent',         'Daily 08:00 UTC cron. Two Claude calls per run: scoreWithClaude (per doc) + parseNewsroomMarkdown (Firecrawl sources).',        'Agent', 'Implemented'),
(2, 'NIST Playbook Agent',   'Generates structured NIST SP 800-61 Rev 2 playbook on incident creation. claude-sonnet-4-6. Synchronous, awaited in POST.',    'Agent', 'Implemented'),
(2, 'Vendor Scanner Agent',  'HEAD-fetch vendor URL, inspect 6 security headers, pass to claude-opus-4-7 for HIPAA Business Associate risk assessment.',      'Agent', 'Implemented'),
(2, 'Heartbeat Agent',       'Daily self-audit: 13-query D1 batch, claude-opus-4-7 Green/Yellow/Red report, persists to agent_memory, POSTs to CCC Admin.', 'Agent', 'Implemented');

-- ── Module version history (one entry per module, current state) ───────────
INSERT INTO module_versions (module_id, version, status, changed_by, notes) VALUES
((SELECT id FROM modules WHERE name = 'Regulatory Pulse'     AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', '64 events, 5 sources, dedup by URL, daily cron'),
((SELECT id FROM modules WHERE name = 'Attestation Vault'    AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', '8 clients, RxDC + Gag Clause tracking'),
((SELECT id FROM modules WHERE name = 'Vendor Risk'          AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', '6 vendors, real TLS/headers scanner live'),
((SELECT id FROM modules WHERE name = 'Incident Response'    AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', '7 incidents, NIST 800-61 playbook on every creation'),
((SELECT id FROM modules WHERE name = 'Executive Hub'        AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', 'acis.rossonlineservices.com — 4 panels live'),
((SELECT id FROM modules WHERE name = 'Operations Tab'       AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', 'Run Scraper/Heartbeat/Scan All, heartbeat status cards, Agent Logs table'),
((SELECT id FROM modules WHERE name = 'Scraper Agent'        AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', 'claude-sonnet-4-6 — upgrade deferred, appropriate for high-volume scoring'),
((SELECT id FROM modules WHERE name = 'NIST Playbook Agent'  AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', 'claude-sonnet-4-6 — upgrade to opus-4-7 planned (see features)'),
((SELECT id FROM modules WHERE name = 'Vendor Scanner Agent' AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', 'claude-opus-4-7 — on-demand, admin-gated'),
((SELECT id FROM modules WHERE name = 'Heartbeat Agent'      AND project_id = 2), '2026-04-25', 'Implemented', 'Claude Code', 'claude-opus-4-7 — daily cron after scraper, reports to CCC Admin via Service Binding');

-- ── Sub-agents ─────────────────────────────────────────────────────────────
INSERT INTO sub_agents (project_id, module_id, name, purpose, trigger_type, status) VALUES
(2, (SELECT id FROM modules WHERE name = 'Scraper Agent'        AND project_id = 2), 'Regulatory Risk Scorer',    'Score each regulatory document: risk_level, impacted_field, summary, remediation_step, deadline', 'Cron',   'Implemented'),
(2, (SELECT id FROM modules WHERE name = 'Scraper Agent'        AND project_id = 2), 'Newsroom Markdown Parser',  'Extract structured articles from Firecrawl raw markdown (CMS Newsroom, HHS Press Room)',             'Cron',   'Implemented'),
(2, (SELECT id FROM modules WHERE name = 'NIST Playbook Agent'  AND project_id = 2), 'Playbook Generator',        'NIST SP 800-61 Rev 2 + HIPAA breach JSON playbook — severity, phases, CFR citations, escalation',  'Event',  'Implemented'),
(2, (SELECT id FROM modules WHERE name = 'Vendor Scanner Agent' AND project_id = 2), 'Vendor Security Assessor',  'TLS + 6-header scan, HIPAA Business Associate risk summary and overall_status classification',       'Manual', 'Implemented'),
(2, (SELECT id FROM modules WHERE name = 'Heartbeat Agent'      AND project_id = 2), 'System Health Auditor',     '13-query D1 batch across all 4 modules — Green/Yellow/Red per module + system-level action items',   'Cron',   'Implemented');

-- ── Features — planned/upcoming work (from brainstorm Tier 1-3) ───────────
INSERT INTO features (module_id, name, description, priority, status) VALUES
-- Operations Tab
((SELECT id FROM modules WHERE name = 'Operations Tab'       AND project_id = 2), 'CF_API_TOKEN Secret Setup',          'Add CF_API_TOKEN Wrangler secret to unlock Agent Logs real-time streaming from AI Gateway', 'High',   'Pending'),
-- NIST Playbook Agent
((SELECT id FROM modules WHERE name = 'NIST Playbook Agent'  AND project_id = 2), 'Upgrade to claude-opus-4-7',         'Replace claude-sonnet-4-6 — improves HIPAA regulatory accuracy and CFR citation specificity', 'Medium', 'Pending'),
-- Vendor Scanner Agent
((SELECT id FROM modules WHERE name = 'Vendor Scanner Agent' AND project_id = 2), 'Wire into Daily Cron',               'Call scanVendor() for stale vendors (>30 days) in scheduled handler after scraper + heartbeat', 'Low',    'Pending'),
-- Attestation Vault
((SELECT id FROM modules WHERE name = 'Attestation Vault'    AND project_id = 2), 'Email Reminders via Resend',         '30-day deadline cron: query overdue clients, send templated reminder emails via Resend API',    'High',   'Uninitiated'),
((SELECT id FROM modules WHERE name = 'Attestation Vault'    AND project_id = 2), 'R2 Document Vault PDF Upload',       'Upload attestation PDFs (RxDC confirmations, Gag Clause letters) per client to acis-vault R2',  'Medium', 'Uninitiated'),
-- Incident Response
((SELECT id FROM modules WHERE name = 'Incident Response'    AND project_id = 2), 'Escalation Notifications',           'When heartbeat detects stale_open_7d > 0: email compliance admin + CCC Admin activity event',   'Medium', 'Uninitiated'),
-- Executive Hub / Regulatory Pulse
((SELECT id FROM modules WHERE name = 'Executive Hub'        AND project_id = 2), 'GitHub PR Automation',               'Heartbeat detects high-risk regulatory event → opens GitHub PR updating policy doc via GitHub MCP', 'High',  'Uninitiated'),
((SELECT id FROM modules WHERE name = 'Regulatory Pulse'     AND project_id = 2), 'Regulatory Deadline Tracker',        'Parse deadline from remediation_steps into dedicated column; surface calendar view in hub',        'Medium', 'Uninitiated');

-- ── Tech stack ─────────────────────────────────────────────────────────────
INSERT INTO tech_stack (name, category, version) VALUES
('Cloudflare Workers',   'Compute',   '4.85.0'),
('Cloudflare D1',        'Database',  'v3-prod'),
('Cloudflare Pages',     'Frontend',  'v2'),
('Cloudflare R2',        'Storage',   NULL),
('Cloudflare AI Gateway','AI',        NULL),
('Hono',                 'Compute',   '4.x'),
('Anthropic SDK',        'AI',        '@anthropic-ai/sdk'),
('claude-opus-4-7',      'AI',        'claude-opus-4-7'),
('claude-sonnet-4-6',    'AI',        'claude-sonnet-4-6'),
('TypeScript',           'Language',  '5.x'),
('React',                'Frontend',  '19.x'),
('Vite',                 'Frontend',  '8.x'),
('Tailwind CSS',         'Frontend',  'v4'),
('Firecrawl',            'Scraping',  'v1'),
('Wrangler',             'DevOps',    '4.85.0'),
('GitHub Actions',       'DevOps',    NULL);

INSERT INTO project_tech_stack (project_id, tech_id)
SELECT 2, id FROM tech_stack;

-- ── Connections ────────────────────────────────────────────────────────────
INSERT INTO connections (project_id, service_name, connection_type, status, notes) VALUES
(2, 'Anthropic API',        'Wrangler Secret',   'Active',  'Routed via Cloudflare AI Gateway acis-gateway'),
(2, 'Cloudflare AI Gateway','Environment Var',   'Active',  'acis-gateway — collect_logs: true, no caching'),
(2, 'Regulations.gov API',  'Wrangler Secret',   'Active',  'REGULATIONS_GOV_API_KEY — CMS/HHS/EBSA/OCR feeds'),
(2, 'Firecrawl API',        'Wrangler Secret',   'Active',  'FIRECRAWL_API_KEY — bypasses CMS/HHS bot protection'),
(2, 'CCC Admin',            'Service Binding',   'Active',  'CCC_ADMIN Fetcher — heartbeat reports via Pattern A'),
(2, 'CF AI Gateway Logs',   'Wrangler Secret',   'Pending', 'CF_API_TOKEN needed — unlocks GET /api/logs endpoint');

-- ── Activity log — historical milestones ───────────────────────────────────
INSERT INTO activity_log (project_id, event_type, description, triggered_by) VALUES
(2, 'ProjectActivated', 'ACIS project activated — all 4 compliance modules live', 'Claude Code'),
(2, 'Deployment',       'Regulatory Pulse: 5-source scraper + Claude scoring deployed', 'Claude Code'),
(2, 'Deployment',       'Attestation Vault: full CRUD + RxDC/Gag Clause tracking deployed', 'Claude Code'),
(2, 'Deployment',       'Vendor Risk: real TLS/headers scanner (claude-opus-4-7) deployed', 'Claude Code'),
(2, 'Deployment',       'Incident Response: NIST 800-61 playbook agent deployed', 'Claude Code'),
(2, 'Deployment',       'Heartbeat Agent: daily self-audit + CCC Admin reporting deployed', 'Claude Code'),
(2, 'Deployment',       'Operations Tab: manual triggers + heartbeat view + Agent Logs deployed', 'Claude Code');
