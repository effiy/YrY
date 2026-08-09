---
title: SSE Streaming + onDone Guard Pattern
aliases: [sse-streaming-pattern, sse-ondone-guard-pattern, streaming-response-pattern]
tags: [pattern, engineeringPattern, SSE, streaming, onDone, long-generation, UX]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Real-time server-to-client data streams are reliable and prevent stale data from overwriting active state"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ./rpc-envelope.md
 - ../lessons/gotchas/sse-ondone-guard.md
 - ../processes/shared-client-design.md
 - ../projects/yiai/dev-standards.md
 - ../projects/yivad/dev-standards.md
 - ../projects/yipet/dev-standards.md
---

# SSE Streaming + onDone Guard Pattern

> **As an** engineer, **I want to** sse streaming, **so that** pattern applied consistently. 

> Long generation (chat / RAG / agent) uses SSE streaming + `done: true` terminator-frame guard + abort differentiation + reader release; do not let users wait 30s without feedback; do not send half-finished output. 

## Summary

- **Pattern**: backend generator `yield data: {"data": {"message": "..."}}\n\n` + final `yield data: {"done": true}\n\n`; frontend `getReader()` + parse `data: ` prefix + on `done: true` then return + `finally releaseLock` + differentiate `AbortError` (user cancel) vs `YiAiError` (exception interrupt) 
- **Cross-project application surface**: YiAi backend (FastAPI StreamingResponse) + YiVad frontend (fetch + ReadableStream) + YiPet frontend (same as YiVad) 
- **Landing**: [sse-ondone-guard gotcha](../lessons/gotcha-sse-ondone-guard.md) + [cross-project shared client SSE parser](../engineering/shared-client-design.md) + [YiAi dev spec §SSE guard contract](../projects/yiai/dev-standards.md)
- **Alternative solution**: WebSocket (not applicable for the Yi family, see §not-applicable) 

## Core viewpoints

**The `done: true` frame is not a nice-to-have -- it is the only contract the frontend can trust.** Without an explicit termination frame, the frontend has no way to distinguish "stream complete" from "network dropped" from "backend crashed mid-generation." Any heuristic based on timeout or buffer emptiness will eventually produce false positives. The `done` frame is the single bit that makes the difference between a reliable stream and a guessing game.

**SSE is not "simpler WebSocket" -- it is a fundamentally different contract.** SSE is unidirectional server-to-client over HTTP, which means it inherits HTTP's connection reuse, proxy compatibility, and authentication model for free. WebSocket upgrades to a different protocol and loses all of that. Choosing SSE is choosing to stay within the HTTP ecosystem; choosing WebSocket is choosing to leave it. The decision should be about protocol alignment, not perceived complexity.

**The reader lock is a resource leak time bomb, not a memory optimization.** A `ReadableStreamDefaultReader` that is not released holds a lock on the underlying stream. In long-lived SPAs, unreleased readers accumulate silently until the browser tab crashes. The `finally` block is not defensive programming -- it is the only correct implementation.

**Every SSE stream is a partial-failure generator by design.** Network jitter, proxy timeouts, backend OOM, and user cancellation all manifest as a stream that stops mid-flight. The contract must treat partial delivery as the normal case, not the exception. This means the frontend must render partial content, mark it as incomplete, and offer retry -- not just show a spinner until the stream ends.

## Key info

- **SSE protocol mechanics**: SSE uses `Content-Type: text/event-stream` over HTTP. Each message is framed as `data: <payload>\n\n`. The `event:` field types messages (defaults to `message` event), `id:` sets `Last-Event-ID` for reconnection, and `retry:` sets reconnection delay in ms. Unlike WebSocket (which upgrades to a different protocol), SSE stays within HTTP/1.1, inheriting proxy compatibility, authentication cookies, and HTTP/2 multiplexing for free.
- **Browser connection limits**: HTTP/1.1 browsers limit to 6 concurrent connections per domain. Each SSE stream consumes one connection. Opening 10 SSE streams from a single page means 4 will be queued. HTTP/2 removes this limit (multiplexes streams over one connection), but nginx `proxy_http_version` must be set to 1.1 for SSE because HTTP/2 does not support chunked transfer encoding, and `proxy_buffering off` is required in both cases.
- **`ReadableStream` vs `EventSource`**: `EventSource` (built-in browser API) handles reconnection, `Last-Event-ID`, and `readyState` automatically but only supports GET requests with no custom headers. `fetch` + `ReadableStream` (manual) supports POST bodies, custom headers, and `AbortController`, but the developer must implement reconnection, event parsing, and reader cleanup. The Yi family uses manual because POST-based RPC requires custom bodies and `AbortController` for user cancellation.
- **`AbortError` semantics**: `fetch` throws `AbortError` (DOMException, name = 'AbortError') when `AbortController.abort()` is called. This is distinct from `TypeError` (network failure) and `YiAiError` (backend error frame). The frontend must catch `AbortError` specifically and treat it as user-initiated cancellation (preserve rendered content, no error toast), while all other errors are exception interrupts (toast error, mark aborted).
- **nginx buffering gotcha**: `proxy_buffering on` (nginx default) buffers the entire response before forwarding to the client. For SSE, this means all chunks accumulate until the connection closes, then arrive at once -- defeating the purpose of streaming. `proxy_buffering off` sends each chunk immediately. `proxy_read_timeout` must also be extended (default 60s) to cover long-generation sessions; 1h is a safe default for LLM chat.

## Problem

Pain points of not using this pattern (quantified) : 

- **Half-finished output**: user sees chat answer cut off mid-way; network jitter / user cancel / backend generator early return all trigger; high-frequency occurrence
- **30s wait without feedback**: long-generation without streaming = user waits 30s seeing no feedback = experience collapse = user abort
- **User cancel vs exception interrupt confused**: user clicks stop and network exception both report error = UX chaos
- **Reader leak**: `ReadableStreamDefaultReader` not released = memory leak = long-session crash
- **nginx buffer**: `proxy_buffering on` = SSE one-shot buffered = experience crash

## Pattern

### Backend (FastAPI / Python) 

```python
async def chat_stream_generator(...) -> AsyncGenerator[str, None]:
 try:
 async for chunk in llm.astream(prompt):
 yield f"data: {json.dumps({'data': {'message': chunk}})}\n\n"
 yield "data: {\"done\": true}\n\n"
 except Exception as e:
 yield f"data: {json.dumps({'data': {'error': str(e)}})}\n\n"
 yield "data: {\"done\": true}\n\n"
 finally:
 pass # resource release; done frame already yielded at try/except end
```

Key points: 
- `done: true` must be emitted in all three paths: try / except / finally (including exception path) 
- exception frame uses `data` field to wrap `error`; frontend differentiates by field name
- generator early return is a bug; must add `done` frame at exit

### Frontend (shared client base layer) 

```typescript
export async function* sseStream<T>(...): AsyncIterable<T> {
 const res = await fetch(...);
 if (!res.ok ||!res.body) throw new YiAiError(res.status, `HTTP ${res.status}`);
 const reader = res.body.getReader();
 const decoder = new TextDecoder();
 let buffer = '';
 try {
 while (true) {
 const { done, value } = await reader.read();
 if (done) {
 // stream ended early = half-finished output = exception
 throw new YiAiError(599, 'Stream closed before done frame');
 }
 buffer += decoder.decode(value, { stream: true });
 const lines = buffer.split('\n\n');
 buffer = lines.pop()?? '';
 for (const line of lines) {
 if (!line.startsWith('data: ')) continue;
 const json = JSON.parse(line.slice(6));
 if (json.done === true) return; // only return on explicit done
 if (json.data?.error) throw new YiAiError(500, json.data.error);
 yield json.data as T;
 }
 }
 } finally {
 reader.releaseLock(); // must release
 }
}
```

### Caller differentiates user cancel vs exception interrupt

```typescript
const controller = new AbortController();
stopBtn.onclick = () => controller.abort();

try {
 for await (const chunk of sseStream(..., { signal: controller.signal })) {
 render(chunk);
 }
} catch (e) {
 if (e.name === 'AbortError') {
 // user cancel — UX does not report error, keep already-rendered content
 } else {
 // exception interrupt — toast error + mark aborted
 toast(e.message);
 }
}
```

### nginx config

```nginx
location /chat-stream {
 proxy_pass http://backend;
 proxy_buffering off; # SSE must be off
 proxy_read_timeout 1h; # SSE long connection
 proxy_http_version 1.1; # chunked transfer
}
```

## Apply / Not apply

### Apply

- Long generation (chat / RAG / agent / code generation) > 10s
- Incremental rendering can lift UX scenarios
- One-way push (backend -> frontend) 
- HTTP/1.1 chunked suffices

### Not apply

- Two-way communication (multi-client real-time sync / collaborative editing) -> use WebSocket
- Ultra-low-latency (< 100ms) real-time push -> use WebSocket
- Binary stream (audio/video) -> use dedicated protocol
- Short generation (< 2s) -> direct HTTP 200 + JSON
- User offline push -> use push notification

## Landing checklist

| no. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Backend: generator try/except/finally three paths emit `done: true` | backend SSE endpoints | one-shot |
| 2 | Backend: exception frame uses `data: {"data": {"error": "..."}}` format | backend | follow #1 |
| 3 | Frontend: base layer `sseStream<T>` async generator + `done` frame guard | frontend shared | one-shot |
| 4 | Frontend: base layer `finally reader.releaseLock()` must be filled | frontend shared | follow #3 |
| 5 | Frontend: caller `AbortController` differentiates user cancel vs exception interrupt | frontend caller | follow #3 |
| 6 | nginx: `proxy_buffering off` + `proxy_read_timeout 1h` | reverse proxy | one-shot |
| 7 | CI: integration tests include SSE streaming assertions ([ADR pytest #4](../../tech-lead/decisions/yiai--pytest-introduction.md) + [ADR Vitest #6](../../tech-lead/decisions/yivad--vitest-introduction.md))  | CI | follow #3 |
| 8 | Monitoring: SSE exception termination rate (complete without `done` frame) > 0.5% alert | Monitoring | one-shot |

## Action recommendations

1. **Always emit the `done: true` frame on all three generator exit paths (try, except, finally).** The `done` frame is the only contract the frontend can trust to distinguish stream completion from network drop or backend crash. A missing `done` frame on any exit path results in half-streamed output to the user.

2. **Implement `AbortController` differentiation on the frontend to distinguish user cancel from exception interruption.** When the user clicks stop, preserve rendered content and do not report an error. When the stream crashes, report the error and mark the message as aborted. Mixing these two cases turns a minor UX annoyance into a trust-destroying bug.

3. **Always release the `ReadableStreamDefaultReader` in a `finally` block.** An unreleased reader holds a lock on the underlying stream and accumulates silently in long-lived SPAs until the browser tab crashes. The `finally` block is not defensive programming -- it is the only correct implementation.

4. **Configure nginx with `proxy_buffering off` and `proxy_read_timeout 1h` for all SSE endpoints.** With `proxy_buffering on` (the nginx default), chunks accumulate until the buffer is full and are delivered all at once, defeating the purpose of streaming. The SSE path must bypass buffering entirely.

5. **Consolidate SSE streams into a single connection with event typing rather than opening one connection per UI component.** Browsers limit connections to 6 per domain for HTTP/1.1. Opening 10 SSE connections from a single page hits this limit and wastes server resources. Use a shared connection manager or event-type field to multiplex streams.

## Anti-patterns

**Using SSE for request-response.** If the client sends a request and expects exactly one response, use HTTP 200 + JSON. SSE is for continuous streams of events. Adding SSE framing to a single response adds latency, complexity, and a new class of bugs with no benefit.

**Ignoring the EventSource API for simple cases.** If you only need server-to-client text events and don't need custom headers or POST bodies, the browser's built-in `EventSource` API handles reconnection, event parsing, and `readyState` for free. Hand-rolling `fetch` + `ReadableStream` for simple cases is reinventing a well-tested wheel.

**No reconnection strategy.** An SSE connection that drops and never reconnects is a broken feature. The client must implement exponential backoff reconnection, resume from the last received event ID, and surface reconnection state to the user.

**Streaming without progress indication.** A stream that shows nothing for 30 seconds and then renders all content at once is, from the user's perspective, indistinguishable from a non-streaming request. The UI must render partial content as it arrives.

**One SSE connection per UI component.** Opening 10 SSE connections from a single page hits browser connection limits (6 per domain for HTTP/1.1) and wastes server resources. Consolidate streams into a single connection with event typing or use a shared connection manager.


- **Backend generator early return**: `done` frame lost = frontend half-finished output; must emit `done` at all three exit paths. 
- **Frontend does not differentiate abort and error**: user clicks stop and gets error report = UX chaos; `AbortError` separately caught. 
- **Not releasing reader**: `ReadableStreamDefaultReader` leak = long-session crash; `finally releaseLock` must be filled. 
- **nginx `proxy_buffering on`**: SSE one-shot buffered = experience crash; SSE path must be off. 
- **`done` frame uses non-standard format**: like `event: done` / `data: [DONE]` etc; unified `data: {"done": true}`. 
- **Cross-project each writing own SSE parser**: half-finished output bug reappears; contract relies on [shared client base](../engineering/shared-client-design.md) one-shot guarantee. 
- **SSE without source**: RAG answer cannot be traced = user does not know where it came from; must carry source path in same frame (see [inline-citation-rag-pattern](../engineering/inline-citation-rag.md)) . 

## Related

- Landing: [sse-ondone-guard gotcha](../lessons/gotcha-sse-ondone-guard.md) — cross-project half-finished output case study
- Landing: [cross-project shared client design §base layer API](../engineering/shared-client-design.md) — SSE parser one-shot guarantee
- Landing: [YiAi dev spec §SSE guard contract](../projects/yiai/dev-standards.md) + [YiVad §SSE onDone guard](../projects/yivad/dev-standards.md)
- Companion: [rpc-envelope-pattern](./rpc-envelope.md) — same-envelope non-streaming extension
- Companion: [inline-citation-rag-pattern](../engineering/inline-citation-rag.md) — SSE same-frame carries source
- Upstream: [./README.md](./) — engineering-patterns leaf entry
