---
title: rag_chat_stream / rag_file_chat_stream swallowed init failures, client saw
  silent done frame instead of error
key: bug_2026_07_30_rag_chat_silent_init_failure
tags:
- rag
- sse
- error-handling
- llama-index
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: domain/rag/engine
assignee: claude
reporter: claude
environment: dev (localhost:10086)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
In `src/domain/rag/engine.py`, `rag_chat_stream` and `rag_file_chat_stream` ran index / retriever / LLM / chat-engine construction directly inside the async generator body, before the `asyncio.create_task(asyncio.to_thread(_worker))` line that kicks off the queue worker. Any of those calls can raise — `get_kb_index()` raises `FileNotFoundError` when `~/YiKnowledge` is missing, `_llm()` / `index.as_retriever()` raise when Ollama is unreachable, `CondensePlusContextChatEngine.from_defaults(...)` raises on bad config. When that happened, the exception propagated out of the generator before the first `yield`. The route layer's `_stream_async` wrapper has a `finally: yield _format_sse({"done": True})` clause, so the client received a `{"done": true}` SSE frame and the connection closed without any `{"error": ...}` frame. On the YiVad `RAG Playground` UI, the assistant turn was left with `streaming: true` flipped to `false` and an empty content bubble — the user had no signal that anything was wrong.

## Steps to Reproduce
1. Stop Ollama (or rename `~/YiKnowledge`) so `get_kb_index()` / `_llm()` will raise.
2. Open `http://localhost:8848/#/rag` in YiVad.
3. Type a question and press Send.
4. The assistant bubble stays empty; `store.chatSending` flips back to false; no error is surfaced.

## Expected Result
The client receives an `{"error": "RAG chat init failed: ..."}` SSE frame before the terminal `{"done": true}` frame. The store's `onError` handler populates the assistant bubble with `Error: ...` so the user sees the root cause.

## Actual Result
Client received only `{"done": true}`; the assistant bubble was silently empty; no error surfaced in the UI or in server logs beyond a single unhandled exception traceback.

## Cause
`rag_chat_stream` / `rag_file_chat_stream` ran their setup phase (index load, retriever, LLM, chat-engine construction) inline in the async generator body with no try/except. On init failure the exception escaped the generator before the first `yield`. `_stream_async` (in `routes/rag.py` and `routes/execution.py`) only emits `{"done": True}` from its `finally` — it does not convert a propagating exception into an error frame. The frontend's `runStream` checks `parsed?.error` before `parsed?.done`, so with no error frame the user saw a silent empty turn. The queue-worker `_worker` function did have its own try/except that emitted `{"error": ...}`, but that only covered errors raised *during* streaming (after the worker started) — init errors happened before the worker existed.

## Solution
Wrapped the setup phase of `rag_chat_stream` and `rag_file_chat_stream` in try/except. On init failure the generator now yields `{"error": f"RAG chat init failed: {e}"}` (or `RAG file chat init failed`) and returns immediately. The existing `_stream_async` finally clause still emits the trailing `{"done": true}`. The frontend's `runStream` already checks `parsed?.error` first, so `onError` runs and the assistant bubble shows `Error: ...`. The worker's own try/except (for mid-stream errors) is left unchanged — it continues to cover failures during token streaming.
