---
title: Interactive Demo Playground — Try It Now
aliases: [demo-playground, interactive-demo, try-it, playground]
tags: [demos, interactive, playground, api, quickstart]
category: demos
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, producter]
benefit: "Engineers and producters can try every demo and pattern directly — copy-paste the commands and see them work against a running YiAi"
acceptance_criteria:
  - "every demo has a runnable curl/fetch command"
  - "every prompt template has a try-it section"
  - "all commands are verified against localhost:10086"
related:
  - ./INDEX.md
  - ./README.md
  - ./projects/
  - ../aier/methodology/prompts/
---

# Interactive Demo Playground

> **Prerequisite:** YiAi running on `http://localhost:10086`. Start with `cd YiAi && python main.py`.

## 1. RPC Envelope — Test It Now

The universal protocol. Every YiVad/YiPet call goes through this.

```bash
# Test the RPC envelope — query all sessions
curl -s http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {
      "cname": "sessions",
      "pageSize": 3
    }
  }' | python3 -m json.tool
```

**Expected:** `{"code": 0, "message": "ok", "data": {"list": [...], "total": N}}`

```bash
# Test the WRONG way — using "query" instead of "filter"
curl -s http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {
      "cname": "sessions",
      "query": {"status": "active"}
    }
  }' | python3 -m json.tool
```

**Expected:** Returns ALL sessions (the `query` parameter is silently ignored — this is the bug that the parameter name contract prevents).

## 2. SSE Streaming — Test It Now

```bash
# Stream an AI chat response (requires Ollama running)
curl -N http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "module_name": "services.ai.chat_service",
    "method_name": "chat",
    "parameters": {
      "model": "qwen3.5",
      "messages": [{"role": "user", "content": "用一句话介绍 YrY 项目"}],
      "stream": true
    }
  }'
```

**Expected:** SSE stream with `data: {"data": {"message": "..."}}` chunks, ending with `data: {"done": true}`.

## 3. RAG Query — Test It Now

```bash
# Query the knowledge base (requires knowledge watcher to have scanned YiKnowledge)
curl -s http://localhost:10086/rag-query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "如何实现跨项目的 RPC 调用？",
    "scope": "engineer/build/"
  }' | python3 -m json.tool
```

**Expected:** `{"answer": "...", "sources": [{"path": "engineer/build/implement-cross-project-rpc-call.md", "score": 0.95}]}`

## 4. Knowledge Scan — Test It Now

```bash
# Scan the knowledge tree
curl -s http://localhost:10086/knowledge-scan | python3 -m json.tool | head -50
```

## 5. Instantiate a Demo Project — Test It Now

```bash
# Create the "Monorepo RPC Integration" demo as a real project
curl -s http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "create_document",
    "parameters": {
      "cname": "projects",
      "data": {
        "name": "Monorepo RPC Integration",
        "identifier": "MRPC-TEST",
        "status": "active",
        "description": "Interactive demo — created from YiKnowledge playground",
        "members": [{"username": "Admin", "role": "owner"}]
      }
    }
  }' | python3 -m json.tool
```

## 6. Test a Prompt Template — Try It Now

```bash
# Test the code review prompt against the YiAi chat
curl -N http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "module_name": "services.ai.chat_service",
    "method_name": "chat",
    "parameters": {
      "model": "qwen3-coder",
      "messages": [{
        "role": "system",
        "content": "You are a senior code reviewer. Review code for security, performance, readability, and correctness. Be specific and actionable."
      }, {
        "role": "user",
        "content": "Review this Python code:\n```python\ndef get_user(user_id):\n    query = f\"SELECT * FROM users WHERE id = {user_id}\"\n    return db.execute(query)\n```"
      }],
      "stream": true
    }
  }'
```

**Expected:** The AI should flag the SQL injection vulnerability in the f-string query.

## 7. Parameter Name Contract — Interactive Test

```bash
# Test: filter works, query is silently ignored
echo "=== Using filter (correct) ==="
curl -s http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {"cname": "sessions", "filter": {"status": "active"}, "pageSize": 2}
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Total: {d[\"data\"][\"total\"]}')"

echo "=== Using query (WRONG — silently ignored) ==="
curl -s http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {"cname": "sessions", "query": {"status": "active"}, "pageSize": 2}
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Total: {d[\"data\"][\"total\"]} (no filter applied)')"
```

## 8. Health Check

```bash
# Quick health check — is YiAi running?
curl -s http://localhost:10086/health | python3 -m json.tool
```

## Interactive Learning Path

Start here and work through in order:

1. **Health check** → verify YiAi is running
2. **RPC envelope** → understand the universal protocol
3. **Parameter name contract** → see the filter/query bug live
4. **SSE streaming** → watch AI responses stream in real-time
5. **RAG query** → see knowledge-grounded answers
6. **Demo instantiation** → create a real project from a demo
7. **Prompt testing** → test a prompt template against the AI

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Reading demos without running them | Static reading doesn't build muscle memory | Run every command in this playground at least once |
| Testing only the happy path | Never see error handling or edge cases | Test the "wrong way" examples too — they teach the most |
| Not checking YiAi is running | Commands fail silently; you think the API is broken | Always start with the health check |