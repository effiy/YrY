---
title: YiAi Functional Modules
tags: [yiai, modules, inventory, backend]
category: engineer/learn/projects/yiai
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Inventory of YiAi domain modules, services, and route handlers"
related:
  - ./README.md
  - ./architecture.md
  - ./dev-standards.md
---

# YiAi Functional Modules

> Full module inventory in [README.md](./README.md) and [CLAUDE.md](../../../../YiAi/CLAUDE.md). Quick reference below.

## Domain modules (10)

| Module | Responsibility |
|--------|---------------|
| `domain/ai/` | Chat, agent loop, data tools, tool registry |
| `domain/auth/` | JWT + bcrypt helpers |
| `domain/execution/` | Generic module executor |
| `domain/files/` | File CRUD, OSS upload, dual-write persistence |
| `domain/knowledge/` | Markdown scanner, watcher, writer |
| `domain/rag/` | RAG engine, indexer, hybrid retrieval |
| `domain/rss/` | RSS feed parsing, scheduler |
| `domain/state/` | State-record CRUD |
| `domain/wework/` | WeCom message sending |

## Services (7)

| Service | Wraps |
|---------|-------|
| `services/ai/chat_service.py` | Chat + agent loop |
| `services/database/data_service.py` | CRUD via RPC envelope |
| `services/execution/executor.py` | Module execution |
| `services/knowledge/knowledge_service.py` | Knowledge scan/read/write |
| `services/rag/rag_service.py` | RAG query/chat |
| `services/rss/` | RSS feed + scheduler |
| `services/storage/oss_client.py` | OSS object storage |

## Routes (13)

Registered in `src/app.py`: root RPC handler, agent chat/confirm/steer, read-file, write-file, upload-image-to-oss, knowledge/*, rag/*, RSS endpoints, auth endpoints, static files.