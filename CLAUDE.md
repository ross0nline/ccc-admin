# CCC Admin — Claude Code Project Instructions

## Role & Mission

CCC Admin is **Project #0** — the global meta-system that tracks every Claude + Cursor + Cloudflare project, its modules, tech stack, features, sub-agents, and activity. It is infrastructure, not a portfolio piece. Every other CCC project registers itself here and reports status changes via Cloudflare Service Bindings.

## Architecture

- **Compute:** Cloudflare Worker (TypeScript) — REST API for all CRUD operations
- **Database:** Cloudflare D1 (`ccc-admin-db`) — 8-table relational schema
- **Frontend:** Cloudflare Pages — Admin dashboard (the single URL for portfolio overview)
- **Integration:** Service Bindings — other project Workers call this Worker directly (zero-latency, no HTTP)
- **CI/CD:** GitHub Actions → Wrangler deploy

## Database Binding

```toml
binding = "CCC_ADMIN_DB"
database_name = "ccc-admin-db"
database_id = "61af6184-6fec-4946-b9f7-dbd2bfdfcefb"
```

## Schema Tables

| Table | Purpose |
|---|---|
| `projects` | All CCC projects |
| `tech_stack` | Normalized tech inventory |
| `project_tech_stack` | Many-to-many: projects ↔ tech |
| `modules` | Functional modules per project |
| `module_versions` | Full status history with timestamps |
| `features` | Individual features per module |
| `sub_agents` | AI sub-agents per project/module |
| `connections` | Service integrations per project |
| `activity_log` | Cross-project event timeline |

## Status Lifecycle

`Uninitiated` → `Pending` → `Implemented` → `Updated` → `Deprecated`

## Working Conventions

- Do not begin implementation unless explicitly instructed.
- Schema migrations go in `db/migrations/` as numbered SQL files.
- All status changes must write to both the parent table and `module_versions`.
- Every action taken by any Worker must log to `activity_log`.
- The `changed_by` field should always identify the actor: `'Claude Code'`, `'Cursor'`, `'Cron'`, or `'Manual'`.
