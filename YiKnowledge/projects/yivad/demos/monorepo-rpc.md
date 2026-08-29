---
title: Demo project — Monorepo RPC Integration
aliases: [demo-monorepo, example-rpc, demo-mrpc]
tags: [demo, monorepo, rpc, api, cross-project, project-management]
category: demos/projects
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "A YrY-specific demo showing the cross-project RPC integration pattern between YiVad/YiPet and YiAi, with parameter name contracts and SSE streaming"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues cover RPC envelope, parameter contracts, SSE streaming, and error handling"
  - "cycles reflect the real YrY cross-project integration sequence"
demo_identifier: MRPC
demo_category: API
demo_tagline: "Cross-project RPC integration: unifying YiVad, YiPet, and YiAi through the RPC envelope."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-ai-chat-platform.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — Monorepo RPC Integration

> **As a** YrY engineer, **I want to** start from a realistic cross-project RPC integration example, **so that** I can see the full pattern — RPC envelope, parameter name contracts, SSE streaming, and error handling — before implementing a new API call.

## Overview

A YrY-specific demo modeling the cross-project RPC integration between the frontend apps (YiVad, YiPet) and the backend (YiAi). Covers the universal RPC envelope, critical parameter name contracts (`filter` not `query`, `target_file` not `path`), SSE streaming for AI chat, and RAG query patterns. Designed for engineers who need to add a new API call across the monorepo.

## Project profile

| Field | Value |
|---|---|
| Identifier | `MRPC` |
| Name | Monorepo RPC Integration |
| Status | active |
| Domain | API |
| Description | Cross-project RPC integration: unifying YiVad, YiPet, and YiAi through the universal RPC envelope with parameter name contracts, SSE streaming, and error handling. |

## Members

| Username | Role |
|---|---|
| Admin | owner |
| Ruiyi | admin |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| Define RPC envelope contract | requirement | done | urgent | RPC Foundation | v0.1.0 |
| Implement data_service.query_documents with filter param | feature | done | high | RPC Foundation | v0.1.0 |
| Add SSE streaming for chat_service.chat | feature | done | high | Streaming & Real-time | v0.2.0 |
| Fix parameter name: query → filter in frontend | bug | done | urgent | RPC Foundation | v0.1.0 |
| Fix parameter name: path → target_file in file endpoints | bug | done | urgent | RPC Foundation | v0.1.0 |
| Add RAG query endpoint with hybrid retrieval | feature | in_progress | high | RAG Integration | v0.3.0 |
| Implement knowledge watcher for YiKnowledge sync | feature | in_progress | medium | RAG Integration | v0.3.0 |
| Add cross-project error code standardization | task | todo | medium | Polish & Docs | v0.4.0 |
| Write integration tests for all RPC calls | task | todo | high | Polish & Docs | v0.4.0 |
| Document parameter name contracts in CLAUDE.md | task | todo | medium | Polish & Docs | v0.4.0 |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| RPC Foundation | completed | 2026-07-01 | 2026-07-14 | RPC envelope, data service, parameter name fixes |
| Streaming & Real-time | completed | 2026-07-15 | 2026-07-28 | SSE streaming for AI chat, real-time updates |
| RAG Integration | active | 2026-07-29 | 2026-08-11 | RAG query endpoint, knowledge watcher, hybrid retrieval |
| Polish & Docs | planned | 2026-08-12 | 2026-08-25 | Error standardization, integration tests, contract docs |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.1.0 | RPC Foundation | released | 2026-07-14 |
| v0.2.0 | Streaming & Real-time | released | 2026-07-28 |
| v0.3.0 | RAG Integration | in_progress | 2026-08-11 |
| v0.4.0 | Polish & Docs | planned | 2026-08-25 |

## JSON seed block

```json
{
  "project": {
    "name": "Monorepo RPC Integration",
    "identifier": "MRPC",
    "status": "active",
    "description": "Cross-project RPC integration: unifying YiVad, YiPet, and YiAi through the universal RPC envelope with parameter name contracts, SSE streaming, and error handling."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" },
    { "user_id": "ruiyi", "username": "Ruiyi", "role": "admin" }
  ],
  "issues": [
    { "title": "Define RPC envelope contract", "issue_type": "requirement", "status": "done", "priority": "urgent", "cycle": 0, "release": 0 },
    { "title": "Implement data_service.query_documents with filter param", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "Add SSE streaming for chat_service.chat", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 1, "release": 1 },
    { "title": "Fix parameter name: query → filter in frontend", "issue_type": "bug", "status": "done", "priority": "urgent", "cycle": 0, "release": 0 },
    { "title": "Fix parameter name: path → target_file in file endpoints", "issue_type": "bug", "status": "done", "priority": "urgent", "cycle": 0, "release": 0 },
    { "title": "Add RAG query endpoint with hybrid retrieval", "issue_type": "feature", "status": "in_progress", "priority": "high", "cycle": 2, "release": 2 },
    { "title": "Implement knowledge watcher for YiKnowledge sync", "issue_type": "feature", "status": "in_progress", "priority": "medium", "cycle": 2, "release": 2 },
    { "title": "Add cross-project error code standardization", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 3, "release": 3 },
    { "title": "Write integration tests for all RPC calls", "issue_type": "task", "status": "todo", "priority": "high", "cycle": 3, "release": 3 },
    { "title": "Document parameter name contracts in CLAUDE.md", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 3, "release": 3 }
  ],
  "cycles": [
    { "name": "RPC Foundation", "status": "completed", "start_date": "2026-07-01", "end_date": "2026-07-14", "goal": "RPC envelope, data service, parameter name fixes" },
    { "name": "Streaming & Real-time", "status": "completed", "start_date": "2026-07-15", "end_date": "2026-07-28", "goal": "SSE streaming for AI chat, real-time updates" },
    { "name": "RAG Integration", "status": "active", "start_date": "2026-07-29", "end_date": "2026-08-11", "goal": "RAG query endpoint, knowledge watcher, hybrid retrieval" },
    { "name": "Polish & Docs", "status": "planned", "start_date": "2026-08-12", "end_date": "2026-08-25", "goal": "Error standardization, integration tests, contract docs" }
  ],
  "releases": [
    { "version": "v0.1.0", "name": "RPC Foundation", "status": "released", "target_date": "2026-07-14" },
    { "version": "v0.2.0", "name": "Streaming & Real-time", "status": "released", "target_date": "2026-07-28" },
    { "version": "v0.3.0", "name": "RAG Integration", "status": "in_progress", "target_date": "2026-08-11" },
    { "version": "v0.4.0", "name": "Polish & Docs", "status": "planned", "target_date": "2026-08-25" }
  ]
}
```

## Key Patterns Illustrated

This demo illustrates three YrY-specific patterns:

### 1. RPC Envelope (universal protocol)

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

### 2. Parameter Name Contracts

| Correct | Wrong | Context |
|---------|-------|---------|
| `filter` | `query` | `data_service.query_documents` |
| `target_file` | `path` | `/read-file`, `/write-file` |

### 3. SSE Streaming

YiVad and YiPet both consume YiAi's SSE streaming for AI chat via `services.ai.chat_service.chat`.

## Related

- [Demo system overview](../README.md)
- [AI Chat Platform demo](./demo-ai-chat-platform.md)
- [Interactive playground](../playground.md) — try it now
- YiVad consumer: `YiVad/src/api/modules/demoService.ts`
- Cross-project contracts: `CLAUDE.md` → Cross-Project Relationships

## Try It Now

```bash
# Test the RPC envelope directly (requires YiAi on localhost:10086)
curl -s http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {"cname": "sessions", "pageSize": 3}
  }' | python3 -m json.tool

# See the filter/query bug live
curl -s http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {"cname": "sessions", "query": {"status": "active"}, "pageSize": 2}
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'query silently ignored — returned {d[\"data\"][\"total\"]} docs (no filter)')"
```