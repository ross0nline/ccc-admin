# 002 — Framework Choice: Hono over Vanilla Workers

**Date:** 2026-04-25  
**Status:** Decided

---

## The Decision

Use Hono as the HTTP router for the CCC Admin Worker instead of vanilla Cloudflare Workers fetch handler.

## The Options Considered

**Option A: Vanilla Workers fetch handler**
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/projects' && request.method === 'GET') { ... }
    if (url.pathname === '/projects' && request.method === 'POST') { ... }
    // grows into a deeply nested if/switch tree
  }
};
```
- Pro: Zero dependencies, smallest bundle
- Con: Manual routing becomes unmaintainable past 5-6 routes. Middleware (CORS, auth) must be composed manually.

**Option B: Hono**
```typescript
const app = new Hono<{ Bindings: Env }>();
app.use('*', cors());
app.get('/projects', async (c) => { ... });
app.post('/projects', requireAuth, async (c) => { ... });
export default app;
```
- Pro: Clean routing, composable middleware, TypeScript-native, built for edge runtimes, ~14KB gzip
- Con: External dependency (but it's the most trusted Workers framework)

**Option C: Elysia**
- Fast, TypeScript-first, but less mature ecosystem. Better for Bun; Hono has stronger Cloudflare Workers alignment.

**Option D: itty-router**
- Extremely lightweight. Good for simple APIs. CCC Admin's complexity warrants Hono's middleware story.

## Why Hono Won

1. **Built for Cloudflare Workers specifically** — no Node.js polyfills, no compatibility shims
2. **The auth middleware pattern is clean** — `requireAuth` as a composable handler reads exactly like what it is
3. **Bundle size is negligible** — 22KB gzip for the entire deployed Worker including Hono
4. **TypeScript generics for `Bindings`** — `Hono<{ Bindings: Env }>` gives full type safety on `c.env.CCC_ADMIN_DB` without any casting
5. **Established pattern** — Cloudflare's own examples use Hono; hiring managers who review the code will recognize it immediately

## The Signal to a Reviewer

Choosing Hono says: "I know the ecosystem. I didn't reach for Express (wrong runtime), I didn't reinvent routing (wrong tradeoff), I picked the right tool for the target platform." That's a signal worth sending in a portfolio codebase.
