---
title: nodejs
name: nodejs
description: >
  Node.js best practices — error handling, security, performance, project
  structure, and production patterns. Invoke when the user is writing Node.js
  server code, debugging production issues, reviewing Node.js code for security
  or performance, configuring a Node.js project, or designing API services.
  Trigger words: "Node.js", "Node", "Express", "Fastify", "Koa", "middleware",
  "event loop", "stream", "Buffer", "child_process", "cluster", "worker_threads",
  "process.env", "require", "module", "CommonJS", "ESM", "package.json",
  "npm script", "error handling Node", "async hook", "EventEmitter",
  "unhandledRejection", "uncaughtException".
  Do NOT trigger for: browser JavaScript, frontend frameworks (Vue, React),
  Deno, Bun, or general JavaScript questions without Node.js specifics.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/nodejs
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - nodejs
  - backend
  - javascript
chip: backend
---
# Node.js

Production-grade Node.js patterns and best practices.

## Core Concepts

- **Error Handling** — centralized error objects, async error propagation
- **Security** — helmet, rate limiting, input validation, secret management
- **Performance** — clustering, streaming, connection pooling, caching
- **Project Structure** — layered architecture, dependency injection, config
- **Production Readiness** — graceful shutdown, health checks, logging, metrics

## Key Rules

1. Always handle rejected promises — `unhandledRejection` crashes the process
2. Use a process manager (PM2, systemd) in production, never `node index.js`
3. Validate all external input at the boundary
4. Stream large data — don't buffer entire payloads in memory
5. Separate config from code — use environment variables, not hardcoded values