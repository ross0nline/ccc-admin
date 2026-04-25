# 004 — Auth Strategy: ADMIN_TOKEN

**Date:** 2026-04-25  
**Status:** Decided (revisit before ACIS public launch)

---

## The Decision

Static Bearer token (`ADMIN_TOKEN`) stored as a Wrangler encrypted secret, checked on all write endpoints. Read endpoints are public.

## Why This Approach

**What we're protecting:** Write operations — creating projects, updating module status, posting to the activity log. These are administrative actions that should only come from trusted sources (Claude Code, project Workers via service bindings, or the user directly).

**What we're not protecting:** Read operations — listing projects, viewing modules, reading the activity feed. These are portfolio-visible data that a hiring manager or reviewer should be able to access without friction.

**Why not JWT:** JWTs are correct for user-authenticated systems with multiple principals and session expiry requirements. CCC Admin has one principal (the admin) and no user accounts. JWT adds key rotation complexity, library dependencies, and verification logic for no additional security benefit in this context.

**Why not Cloudflare Access:** Access is the right tool when protecting a dashboard behind SSO (e.g., Google Workspace login). The CCC Admin read dashboard is intentionally public. Access would add friction for the wrong surface.

**Why not API key per project Worker:** Service bindings bypass the network entirely — they're in-process calls. The `ADMIN_TOKEN` check on `/internal/report` is belt-and-suspenders; service-bound Workers can't be called from outside the account anyway.

## Token Storage

```
Wrangler secret → Cloudflare encrypted KV (per-Worker)
├── Never in code
├── Never in .env files committed to git  
├── In .dev.vars (gitignored) for local development
└── Rotatable via: wrangler secret put ADMIN_TOKEN
```

## What to Revisit

Before the ACIS Executive Hub goes live at `acis.rossonlineservices.com`, the CCC Admin write endpoints should be hardened further:
- IP allowlisting via Cloudflare WAF rules (only allow writes from Cloudflare's own IP ranges, since all callers will be Workers)
- Or migrate write endpoints to service-binding-only access with no public HTTP exposure

For the portfolio phase, the current approach is appropriate.
