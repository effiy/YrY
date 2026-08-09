---
title: SSE onDone Guard and Cross-Project Half-Streamed Output
aliases: [sse-ondone-guard, sse-half-streamed-bug, sse-termination-gotcha]
tags: [pitfall, SSE, streaming, frontend-backend-contract, guard, cross-project]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, oncall-sre]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# SSE onDone Guard and Cross-Project Half-Streamed Output

> **As an** engineer, **I want to** sse ondone guard, **so that** same mistake avoided.

> YiAi backend SSE must send a termination frame `data: {"done": true}\n\n`; the frontend must treat the stream as finished only after the termination frame, otherwise it will "half-stream" — the streaming response is truncated and the message loses its last segment. This gotcha is the basis for the SSE parser design of the [cross-project shared client](../engineering/shared-client-design.md).

## Summary

- **Half-streamed symptom**: user sees chat answer cut off halfway; network jitter / client cancel / server generator early return all can trigger it.
- **Root cause**: SSE stream end ≠ response complete; only an explicit `done: true` is the completion signal.
- **Guard**: backend generator must `yield {"data": ...}` + finally `yield {"done": True}`; frontend must end the stream only on `done: true` + mark `aborted` to distinguish user cancel from exception interruption.
- **Cross-project sharing**: YiAi backend + YiVad `aiChat` / `aicr` / `rag` + YiPet `chatController` share the same origin; the contract is guarded once by the [shared client SSE parser](../engineering/shared-client-design.md).

## Core viewpoints

- **The SSE protocol's stream end (`done: true` on the reader) is a transport-layer signal, not an application-layer signal**: HTTP chunked transfer encoding can terminate for reasons unrelated to application completion: TCP half-close, reverse proxy buffer timeout, keep-alive timeout, client cancel. Treating the transport-layer `done` as an application-layer completion signal is the root cause of every half-streamed output bug. The application-layer `data: {"done": true}` frame is the only reliable completion signal.

- **The `aborted` flag is not a UX detail -- it is a contract between the frontend and the user about intent**: When the user clicks stop, the frontend must distinguish "user chose to stop" from "the stream crashed." The `aborted` flag preserves the rendered content for user-initiated stops (because the user got what they wanted) and reports an error for exception interruptions (because the user did not). Mixing these two cases is the difference between a minor annoyance and a trust-destroying bug.

- **The backend generator's `finally` block is not for resource cleanup alone -- it is the last chance to send the `done: true` frame**: If the generator exits through any path (normal completion, exception, async cancellation) without sending `done: true`, the frontend will either hang waiting for a frame that never arrives or throw a "stream closed before done frame" error. The `done: true` yield must be present on all three exit paths: try, except, and finally.

- **nginx's `proxy_buffering on` is the default for a reason (throughput), and that reason is directly opposed to SSE's requirements (latency)**: SSE needs each chunk delivered to the client as soon as it is generated. With `proxy_buffering on`, nginx accumulates chunks until the buffer is full, then delivers them all at once. The user sees nothing for seconds, then the entire response appears. The SSE path must have `proxy_buffering off` and `proxy_read_timeout` set high enough for long-running streams.

- **Writing a separate SSE parser in each project is not code reuse -- it is bug propagation**: When YiVad, YiPet, and YiAi each write their own SSE parser, a fix in one project does not reach the others. The `done: true` guard, the `AbortError` distinction, the `finally releaseLock` -- these are not project-specific concerns. The shared client vendor is the single source of truth for SSE parsing, and every project that vendors its own copy is a bug waiting to happen.


- **`done: true` is a contract boundary, not an optimization item** — not sending it means half-streamed output; not sending it is a bug.
- **The `aborted` flag is a user-intent marker** — user clicks stop / closes page → `aborted=true`; network exception → `aborted=false`; frontend UX must distinguish.
- **SSE parser must release reader in `finally`** — `ReadableStreamDefaultReader` leaks if not released; `finally` + `releaseLock` is mandatory.
- **Guard once across projects**: the SSE format contract is written only once in the [shared client base layer](../engineering/shared-client-design.md); each project vendors a copy.

## Key information

### Symptom

- User sees chat answer cut off halfway (missing last 200 chars / missing last segment).
- Network tab shows response 200, but the body is truncated.
- Browser shows no error (frontend treats "stream end" as "complete").
- Server log shows generator exiting normally (no exception).
- High-frequency triggers: network jitter / user clicks stop early / server generator early return / middleware timeout.

### Root cause

- **SSE protocol layer**: HTTP/1.1 chunked response; connection close ≠ application complete; only an application-layer contract (`data: {"done": true}`) is the completion signal.
- **Backend**: FastAPI `StreamingResponse` generator early return or exception not caught, final `done: true` not sent.
- **Frontend**: `fetch().body.getReader()` marks complete on `done` (stream end) without waiting for the `data: {"done": true}` frame.
- **Network layer**: TCP half-close / keep-alive timeout / reverse proxy buffer cutoff triggers `done` but application not finished.
- **Client cancel**: user clicks stop triggering `AbortController.abort()`; frontend mixes "user cancel" with "exception interruption", causing UX confusion.

### Impact scope

- YiAi `services/ai/chat_service.py` + `domain/rag/engine.py` (generation side)
- YiVad `aiChat` / `aicr` / `rag` views + `src/api/modules/ragService.ts` (consumer side)
- YiPet `chatController` + `services/chatService.ts` (consumer side)

### Solution

**Backend (YiAi Python)**

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
        # resource release; done frame already yielded at end of try/except
        pass
```

Key points:
- `done: true` must be sent on all three paths: try / except / finally (including exception path).
- The exception frame wraps `error` in the `data` field; the frontend dispatches by field name.
- Generator early return is a bug; a `done` frame must be added at the generator exit.

**Frontend (shared client base layer)**

```typescript
export async function* sseStream<T>(...): AsyncIterable<T> {
  const res = await fetch(...);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let aborted = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (!aborted) throw new YiAiError(599, 'Stream closed before done frame');
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const json = JSON.parse(line.slice(6));
        if (json.done === true) return;
        if (json.data?.error) throw new YiAiError(500, json.data.error);
        yield json.data as T;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Caller distinguishes user cancel vs exception interruption
const controller = new AbortController();
stopBtn.onclick = () => { controller.abort(); };
try {
  for await (const chunk of sseStream(..., { signal: controller.signal })) {
    // render chunk
  }
} catch (e) {
  if (e.name === 'AbortError') {
    // user cancel — UX does not report error, preserve rendered content
  } else {
    // exception interruption — toast error + mark aborted
  }
}
```

Key points:
- Return only on the `done` frame (`json.done === true`); throw on early stream `done`.
- `error` field throws `YiAiError`; caller dispatches.
- `finally` releases reader.
- Caller distinguishes `AbortError` (user cancel) from `YiAiError` (exception interruption).

### Similar pitfalls

- Under HTTP/2 stream multiplexing, a single stream is reset but the connection stays alive → frontend misjudges as complete.
- Reverse proxy (nginx) `proxy_buffering on` buffers SSE → client does not receive streaming chunks, receives everything at once.
- Client `keepalive` timeout switches connection → stream "complete" but application did not send `done`.
- After TCP half-close (FIN), the client can still receive data buffered → misjudged as complete.

## Action recommendations

1. Backend SSE generator must send the `done: true` frame on all three paths: try / except / finally (landed in YiAi).
2. Frontend SSE parser must wait for the `done: true` frame before returning; throw `YiAiError` on early stream end (guarded in the [shared client base layer](../engineering/shared-client-design.md)).
3. `AbortController` distinguishes user cancel from exception interruption; UX does not mix.
4. CI integration tests must include SSE streaming assertions ([ADR pytest #4](../../tech-lead/decisions/yiai--pytest-introduction.md) + [ADR Vitest #6](../../tech-lead/decisions/yivad--vitest-introduction.md)).
5. Reverse proxy (nginx) config `proxy_buffering off` + `proxy_read_timeout 1h` dedicated for SSE.
6. Monitoring alert: SSE stream exception termination rate (completions without `done` frame) > 0.5% triggers alert.
7. Cross-project shared SSE parser unit tests ([shared client design §action recommendations #5](../engineering/shared-client-design.md)): 8 cases (done frame normal / done frame missing / interruption / multi-data merge / heartbeat empty line / error field / abort / network jitter).



- **Backend generator early return** — `done` frame lost, frontend half-streamed; must send `done` on all three exit paths.
- **Frontend does not distinguish abort from error** — user clicks stop also reports error, UX confusion; `AbortError` caught separately.
- **Not releasing reader** — `ReadableStreamDefaultReader` leak; `finally releaseLock` mandatory.
- **nginx `proxy_buffering on`** — SSE receives everything at once, experience broken; SSE path must be off.
- **`done` frame uses non-standard format** — such as `event: done` / `data: [DONE]`; unify on `data: {"done": true}`.
- **Each project writes its own SSE parser** — half-streamed bug recurs; contract guarded once by the [shared client base](../engineering/shared-client-design.md).

## Anti-patterns

- **Adding a new streaming endpoint without copy-pasting the full `try/except/finally` pattern from an existing one.** Each new SSE endpoint is a new opportunity to forget the `done: true` frame on one of the three exit paths. The generator pattern is boilerplate by necessity, not by accident. Create a shared decorator or context manager that wraps any generator and guarantees the `done: true` frame on all exit paths, so new endpoints inherit the guard by construction.
- **Testing SSE streaming with only the happy path where the full response arrives in a single chunk.** Network jitter, proxy buffer flushes, and TCP segmentation all cause the stream to be delivered in unpredictable chunk sizes. A test that only validates the assembled output passes even when the parser incorrectly treats a partial chunk as the end of stream. Every SSE parser test must include at least one case where the `done: true` frame arrives in a separate `read()` call from the last data chunk.
- **Using `EventSource` (the browser API) instead of `fetch` + `ReadableStream` for authenticated SSE.** `EventSource` does not support custom headers, making it impossible to attach an `X-Token` for authentication. The only workaround is to put the token in the query string, which leaks it into server logs, proxy logs, and browser history. Always use `fetch` with `ReadableStream` for authenticated SSE streams, and reserve `EventSource` for public, unauthenticated event feeds.
- **Setting `proxy_read_timeout` to a value shorter than the maximum expected LLM generation time.** If the reverse proxy closes the connection after 60 seconds but the LLM sometimes takes 90 seconds to generate a full response, every long generation will be truncated. The timeout must be set to the worst-case generation duration plus a buffer, not the average. A truncated stream without a `done: true` frame is indistinguishable from a crash to the frontend parser.
- **Deploying the shared client SSE parser as a copy-pasted file rather than a versioned package.** When the parser is vendored by copying the source file into each project, the version that each project runs diverges over time. A fix applied to the YiVad copy does not reach YiPet unless someone remembers to manually sync. The shared client must be published as a versioned package with a changelog, and each project must declare a minimum version constraint.

## Related

- Same class: [./README.md](./) — gotchas leaf entry
- Same class: [./macos-fsevents-silent-drop.md](gotcha-macos-fsevents-silent-drop.md) — silent failure class pitfall
- Contract source: [YiAi dev standards](../projects/yivad/dev-standards.md) §SSE guard contract
- Consumer side: [YiVad dev standards](../projects/yivad/dev-standards.md) §SSE onDone guard / [YiPet dev standards](../projects/yivad/dev-standards.md) §MV3 dual world
- Design basis: [cross-project shared client design](../engineering/shared-client-design.md) §base layer API
- Test infrastructure: [ADR pytest #4](../../tech-lead/decisions/yiai--pytest-introduction.md) + [ADR Vitest #6](../../tech-lead/decisions/yivad--vitest-introduction.md)
- Upstream: [journeys/i-want-to-check-engineering-gotchas](../process/check-engineering-gotchas.md) — scenario entry
