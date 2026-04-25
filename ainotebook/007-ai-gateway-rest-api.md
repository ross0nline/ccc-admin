# 007 — AI Gateway: REST API over MCP Tool

**Date:** 2026-04-25  
**Status:** Decided

---

## The Decision

Create the Cloudflare AI Gateway (`acis-gateway`) via direct REST API call rather than waiting for a dedicated MCP tool.

## The Situation

The Cloudflare MCP server provides tools for Workers, D1, R2, KV, Pages — but not AI Gateway management. When we needed to create the gateway, the options were:

1. Ask the user to create it manually in the dashboard
2. Wait for a future MCP tool
3. Call the Cloudflare REST API directly with the token already in scope

## Why Option 3

The Cloudflare API token was already authenticated and available. The AI Gateway REST endpoint is documented and stable. Using it directly required one `curl` call and returned the confirmation needed to proceed.

This is the principle: **don't create manual steps for the user when you have the credentials and the API is accessible.** Autonomy means using what's available, not waiting for a perfect tool.

## What the First Attempt Taught

The first `curl` call failed:
```json
{"errors":[{"code":7001,"message":"Required","path":["body","id"]}, ...]}
```

The Cloudflare API required fields that weren't in the minimal payload: `id`, `collect_logs`, `cache_ttl`, `cache_invalidate_on_update`, `rate_limiting_interval`, `rate_limiting_limit`, `rate_limiting_technique`.

This is a good example of why reading the error response carefully matters more than reading the docs. The error listed every missing field explicitly — the fix was to fill them all in.

## The Gateway Configuration Chosen

```json
{
  "id": "acis-gateway",
  "collect_logs": true,
  "cache_ttl": 0,
  "cache_invalidate_on_update": false,
  "rate_limiting_interval": 0,
  "rate_limiting_limit": 0,
  "rate_limiting_technique": "fixed"
}
```

- **`collect_logs: true`** — this is the critical one. All Claude API calls from ACIS Workers will be logged in the gateway, enabling the "Agent Logs" panel on the Executive Hub dashboard
- **No rate limiting** — appropriate for development; revisit before production
- **No caching** — regulatory data should always be fresh; cache TTL of 0 is correct here

## The Gateway URL

```
https://gateway.ai.cloudflare.com/v1/384fc5d6758abeb5f11df18f963eac5d/acis-gateway/anthropic
```

All ACIS Workers must route Claude API calls through this URL. The benefit: every inference request is logged, observable, and visible on the Cloudflare dashboard — which feeds the "Agent Logs" panel that makes the Executive Hub demo compelling.
