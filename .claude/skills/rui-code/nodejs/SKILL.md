---
name: rui-code-nodejs
description: >
  Curated Node.js best-practices navigator — pulls 100+ vetted
  practices from goldbergyoni/nodebestpractices, indexes them locally
  by category and tag, and recommends the right practice (with the
  canonical "Read More" link) for a given architecture, error-handling,
  code-style, testing, production, security, performance, or Docker
  question. Trigger when the user wants to: pick a Node.js project
  structure (components, layering, framework choice, TypeScript), fix
  async error handling (custom Error class, operational vs programmer
  errors, central handler, graceful shutdown), enforce code style
  (ESLint, `const` vs `let`, `===`, async/await), design a testing
  strategy (component testing, AAA pattern, coverage, e2e, mocking
  external HTTP), ship to production (monitoring, smart logging,
  reverse proxy, `NODE_ENV=production`, zero-downtime deploys, LTS,
  `npm ci`), secure an app (helmet, bcrypt, JWT blocklist, rate
  limiting, non-root user, `node:` protocol), avoid blocking the
  event loop, or containerize with Docker (multi-stage builds,
  .dockerignore, image scanning). Trigger words: "node best
  practices", "nodejs best practices", "nodebestpractices",
  "goldbergyoni", "node project structure", "nestjs vs express",
  "node async error handling", "graceful shutdown node", "eslint
  node", "node testing", "component testing node", "node
  production", "smart logging node", "cluster module", "pm2
  forever systemd", "NODE_ENV production", "npm ci", "node
  security", "helmet", "bcrypt node", "jwt blocklist", "rate-limit
  brute force", "non-root user node", "node: protocol", "block
  event loop", "node docker", "multi-stage docker node",
  ".dockerignore node", "dockerfile lint hadolint".

  Do NOT trigger for: general JavaScript / TypeScript language
  questions, framework-specific tutorials (Nest / Express / Fastify
  / Koa), server-side concepts that are not Node-specific (REST,
  GraphQL, WebSockets in general), or any task unrelated to the
  curated Node.js best-practices list above.
lifecycle: default-pipeline
user_invocable: true
---

# rui-code-nodejs — Curated Node.js Best-Practices Navigator

> Find the right Node.js best practice — fast. Pulls from
> [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices),
> 108 practices across 8 categories and 15 topic buckets, and answers
> with the exact practice number, title, and canonical "Read More" link.

## What this skill does

1. **Maps a Node.js question** to a practice in the registered
   `nodebestpractices` source (8 categories: Project Architecture, Error
   Handling, Code Style, Testing & Quality, Going To Production,
   Security, Draft: Performance Best Practices, Docker).
2. **Recommends a practice** with the practice number (e.g. `2.4`),
   exact title, category, and the upstream "Read More" link.
3. **Surfaces 2026-edition updates** — practices tagged `#new` or
   `#updated` are bucketed under "New & Updated".
4. **Cites every recommendation** by exact title + URL +
   `[src:nodebestpractices]`.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses a local snapshot.
- Does NOT teach Node.js from scratch — point at the official Node.js
  docs for conceptual questions.
- Does NOT cover non-Node runtimes (Deno, Bun, browsers).
- Does NOT cover framework tutorials (Nest, Express, Fastify, Koa).
  Practice 1.5 names the four recommended frameworks but doesn't teach any.
- Does NOT auto-generate code or scaffold projects — recommend the
  practice, then point at the upstream "Read More" page.

## Workflow

1. **Read** `references/sources.json` and `references/index.md`.
2. **Match** the user's intent to a category:
   - "project structure / folder layout / config" → `Project Architecture`
   - "async error handling / Error class / graceful shutdown / mature logger" → `Error Handling`
   - "ESLint / naming / `const` vs `let` / arrow functions" → `Code Style`
   - "testing / mock external HTTP / AAA pattern" → `Testing & Quality`
   - "production / zero-downtime / `NODE_ENV` / `npm ci` / log to stdout" → `Going To Production`
   - "security / SQL injection / JWT blocklist / helmet / bcrypt / sandbox" → `Security`
   - "event loop / Lodash" → `Draft: Performance Best Practices`
   - "Docker / multi-stage build / `node` not `npm start` / .dockerignore" → `Docker`
3. **Filter** to 1-3 high-signal picks. For "what's new in 2026"
   questions, favour the `New & Updated` bucket.
4. **Cite** every recommendation with the exact practice number (e.g.
   `2.4`), title, full URL, and `[src:nodebestpractices]` tag.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.
- [references/sources.json](./references/sources.json) — registered sources.
- [references/README-nodebestpractices.md](./references/README-nodebestpractices.md) — verbatim upstream README.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Grep `references/README-nodebestpractices.md` directly. |
| Practice not in any registered source | State the gap, suggest the closest related practice (e.g. "no 'event-loop monitoring' practice — see 7.1 'Don't block the event loop'"). |
| User asks about Node 22 / Node 24 specific features | Out of scope; point the user at the official Node.js release notes. |
| User asks about a framework tutorial (Nest, Express, Fastify, Koa) | Out of scope; defer to each framework's docs. |
| User asks about a non-Node runtime (Deno, Bun, browsers) | Out of scope; defer to general Claude. |
| User wants me to actually scaffold a Node project | Recommend the relevant Project-Architecture practices (1.1, 1.2, 1.3, 1.4), then hand off. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
