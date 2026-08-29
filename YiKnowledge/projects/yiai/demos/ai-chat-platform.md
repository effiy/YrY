---
title: Demo project — AI Chat Platform
aliases: [demo-ai-chat, example-rag, demo-aich]
tags: [demo, ai, chat, rag, sse, knowledge-base, project-management]
category: demos/projects
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, aier, producter]
benefit: "A YrY-specific demo showing the AI chat platform with SSE streaming, RAG retrieval, knowledge base integration, and multi-role chat"
acceptance_criteria:
  - "project profile includes name, identifier, status, and description"
  - "seed issues cover AI chat, RAG, knowledge base, and multi-role support"
  - "cycles reflect the real YiAi chat service development sequence"
demo_identifier: AICH
demo_category: AI
demo_tagline: "AI chat platform with SSE streaming, RAG retrieval, and multi-role knowledge grounding."
related:
  - ../README.md
  - ../INDEX.md
  - ./demo-monorepo-rpc.md
  - ./demo-knowledge-base.md
  - ../../YiVad/src/api/modules/demoService.ts
---

# Demo Project — AI Chat Platform

> **As a** YrY engineer, **I want to** start from a realistic AI chat platform example, **so that** I can see the full AI feature flow — chat with SSE streaming, RAG retrieval, knowledge base integration, and multi-role support — before implementing a new AI feature.

## Overview

A YrY-specific demo modeling the AI chat platform powered by YiAi. Covers Ollama LLM inference with SSE streaming, llama_index RAG with hybrid retrieval, YiKnowledge as the RAG data source, and multi-role chat consumed by both YiVad (admin dashboard) and YiPet (Chrome extension). Designed for engineers adding AI features to the monorepo.

## Project profile

| Field | Value |
|---|---|
| Identifier | `AICH` |
| Name | AI Chat Platform |
| Status | active |
| Domain | AI |
| Description | AI chat platform with Ollama LLM inference, SSE streaming, llama_index RAG hybrid retrieval, YiKnowledge data source, and multi-role chat for YiVad and YiPet. |

## Members

| Username | Role |
|---|---|
| Admin | owner |
| Ruiyi | admin |

## Seed issues

| Title | Type | Status | Priority | Cycle | Release |
|---|---|---|---|---|---|
| Ollama LLM integration with chat endpoint | feature | done | urgent | Core Chat | v0.1.0 |
| SSE streaming response for chat | feature | done | urgent | Core Chat | v0.1.0 |
| Multi-role chat with system prompts | feature | done | high | Core Chat | v0.1.0 |
| llama_index RAG engine setup | feature | done | high | RAG Pipeline | v0.2.0 |
| Hybrid retrieval (vector + keyword) | feature | done | high | RAG Pipeline | v0.2.0 |
| YiKnowledge markdown tree scanner | feature | in_progress | high | RAG Pipeline | v0.2.0 |
| MongoDB vector index for embeddings | feature | in_progress | medium | RAG Pipeline | v0.2.0 |
| Knowledge watcher (apscheduler poll) | feature | todo | medium | Knowledge Sync | v0.3.0 |
| BRD agent with RAG grounding | feature | todo | high | Agents | v0.3.0 |
| Chat session persistence and history | feature | todo | medium | Polish | v0.4.0 |
| Token usage tracking and rate limiting | task | todo | medium | Polish | v0.4.0 |

## Seed cycles

| Name | Status | Start | End | Goal |
|---|---|---|---|---|
| Core Chat | completed | 2026-06-01 | 2026-06-14 | Ollama integration, SSE streaming, multi-role chat |
| RAG Pipeline | active | 2026-06-15 | 2026-07-05 | llama_index RAG, hybrid retrieval, vector index |
| Knowledge Sync | planned | 2026-07-06 | 2026-07-19 | Knowledge watcher, BRD agent, auto-sync |
| Polish | planned | 2026-07-20 | 2026-08-02 | Session persistence, token tracking, rate limiting |

## Seed releases

| Version | Name | Status | Target |
|---|---|---|---|
| v0.1.0 | Core Chat | released | 2026-06-14 |
| v0.2.0 | RAG Pipeline | in_progress | 2026-07-05 |
| v0.3.0 | Knowledge Sync & Agents | planned | 2026-07-19 |
| v0.4.0 | Polish | planned | 2026-08-02 |

## JSON seed block

```json
{
  "project": {
    "name": "AI Chat Platform",
    "identifier": "AICH",
    "status": "active",
    "description": "AI chat platform with Ollama LLM inference, SSE streaming, llama_index RAG hybrid retrieval, YiKnowledge data source, and multi-role chat for YiVad and YiPet."
  },
  "members": [
    { "user_id": "admin", "username": "Admin", "role": "owner" },
    { "user_id": "ruiyi", "username": "Ruiyi", "role": "admin" }
  ],
  "issues": [
    { "title": "Ollama LLM integration with chat endpoint", "issue_type": "feature", "status": "done", "priority": "urgent", "cycle": 0, "release": 0 },
    { "title": "SSE streaming response for chat", "issue_type": "feature", "status": "done", "priority": "urgent", "cycle": 0, "release": 0 },
    { "title": "Multi-role chat with system prompts", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 0, "release": 0 },
    { "title": "llama_index RAG engine setup", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 1, "release": 1 },
    { "title": "Hybrid retrieval (vector + keyword)", "issue_type": "feature", "status": "done", "priority": "high", "cycle": 1, "release": 1 },
    { "title": "YiKnowledge markdown tree scanner", "issue_type": "feature", "status": "in_progress", "priority": "high", "cycle": 1, "release": 1 },
    { "title": "MongoDB vector index for embeddings", "issue_type": "feature", "status": "in_progress", "priority": "medium", "cycle": 1, "release": 1 },
    { "title": "Knowledge watcher (apscheduler poll)", "issue_type": "feature", "status": "todo", "priority": "medium", "cycle": 2, "release": 2 },
    { "title": "BRD agent with RAG grounding", "issue_type": "feature", "status": "todo", "priority": "high", "cycle": 2, "release": 2 },
    { "title": "Chat session persistence and history", "issue_type": "feature", "status": "todo", "priority": "medium", "cycle": 3, "release": 3 },
    { "title": "Token usage tracking and rate limiting", "issue_type": "task", "status": "todo", "priority": "medium", "cycle": 3, "release": 3 }
  ],
  "cycles": [
    { "name": "Core Chat", "status": "completed", "start_date": "2026-06-01", "end_date": "2026-06-14", "goal": "Ollama integration, SSE streaming, multi-role chat" },
    { "name": "RAG Pipeline", "status": "active", "start_date": "2026-06-15", "end_date": "2026-07-05", "goal": "llama_index RAG, hybrid retrieval, vector index" },
    { "name": "Knowledge Sync", "status": "planned", "start_date": "2026-07-06", "end_date": "2026-07-19", "goal": "Knowledge watcher, BRD agent, auto-sync" },
    { "name": "Polish", "status": "planned", "start_date": "2026-07-20", "end_date": "2026-08-02", "goal": "Session persistence, token tracking, rate limiting" }
  ],
  "releases": [
    { "version": "v0.1.0", "name": "Core Chat", "status": "released", "target_date": "2026-06-14" },
    { "version": "v0.2.0", "name": "RAG Pipeline", "status": "in_progress", "target_date": "2026-07-05" },
    { "version": "v0.3.0", "name": "Knowledge Sync & Agents", "status": "planned", "target_date": "2026-07-19" },
    { "version": "v0.4.0", "name": "Polish", "status": "planned", "target_date": "2026-08-02" }
  ]
}
```

## Key Patterns Illustrated

### 1. AI Chat Architecture (YiAi)

```
YiVad (SPA) ──SSE──→ YiAi chat_service.chat ──→ Ollama (LLM)
YiPet (Ext) ──SSE──→                          ──→ llama_index (RAG)
                                                ──→ MongoDB (vector index)
                                                ──→ YiKnowledge (markdown tree)
```

### 2. RAG Pipeline

1. YiKnowledge markdown files → knowledge watcher (apscheduler poll every 5s)
2. Files parsed → MongoDB collections + vector embeddings
3. Query → hybrid retrieval (vector similarity + keyword match)
4. Retrieved chunks → injected into LLM context window

### 3. Multi-role Chat

Both YiVad and YiPet consume the same `chat_service.chat` endpoint with different role configurations, system prompts, and knowledge grounding.

## Related

- [Demo system overview](../README.md)
- [Monorepo RPC Integration demo](./demo-monorepo-rpc.md)
- [Knowledge Base demo](./demo-knowledge-base.md)
- [Interactive playground](../playground.md) — try it now
- YiAi chat service: `YiAi/src/domain/rag/engine.py`
- YiVad chat store: `YiVad/src/stores/modules/aiChat.ts`
- YiPet chat store: `YiPet/src/chat/stores/chat.ts`

## Try It Now

```bash
# Stream an AI chat response (requires YiAi + Ollama running)
curl -N http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "module_name": "services.ai.chat_service",
    "method_name": "chat",
    "parameters": {
      "model": "qwen3.5",
      "messages": [{"role": "user", "content": "介绍一下 YrY 项目的三个应用"}],
      "stream": true
    }
  }'

# Query the RAG engine with knowledge grounding
curl -s http://localhost:10086/rag-query \
  -H "Content-Type: application/json" \
  -d '{"question": "如何实现 SSE 流式传输？", "scope": "engineer/build/"}' \
  | python3 -m json.tool
```