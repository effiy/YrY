/**
 * Deterministic tests for shared SSE stream reader (utils/sse.ts).
 *
 * Uses a minimal mock ReadableStreamDefaultReader to simulate SSE chunks
 * without actual network requests.
 */
import { describe, it, expect, vi } from "vitest";
import { readSSEStream, extractDelta } from "@/utils/sse";

/** Create a mock reader that yields pre-defined Uint8Array chunks then signals done. */
function mockReader(chunks: string[]): ReadableStreamDefaultReader<Uint8Array> {
  const encoder = new TextEncoder();
  const encoded = chunks.map(c => encoder.encode(c));
  let i = 0;
  return {
    read: vi.fn(async () => {
      if (i < encoded.length) {
        return { done: false, value: encoded[i++] };
      }
      return { done: true, value: undefined as any };
    }),
    cancel: vi.fn(),
    releaseLock: vi.fn(),
    closed: Promise.resolve(undefined),
  } as unknown as ReadableStreamDefaultReader<Uint8Array>;
}

function makeHandlers() {
  return {
    onDelta: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
    onSources: vi.fn(),
    onPhase: vi.fn(),
  };
}

// ── extractDelta ────────────────────────────────────────────────────────

describe("extractDelta", () => {
  it("extracts YiAi-style data.message", () => {
    expect(extractDelta({ data: { message: "hello" } })).toBe("hello");
  });

  it("falls back to message.content", () => {
    expect(extractDelta({ message: { content: "world" } })).toBe("world");
  });

  it("falls back to OpenAI choices[0].delta.content", () => {
    expect(extractDelta({ choices: [{ delta: { content: "hi" } }] })).toBe("hi");
  });

  it("falls back to top-level content", () => {
    expect(extractDelta({ content: "plain" })).toBe("plain");
  });

  it("returns empty for non-object", () => {
    expect(extractDelta(null)).toBe("");
    expect(extractDelta("string")).toBe("");
    expect(extractDelta(undefined)).toBe("");
  });

  it("returns empty for empty object", () => {
    expect(extractDelta({})).toBe("");
  });
});

// ── readSSEStream: basic frames ─────────────────────────────────────────

describe("readSSEStream", () => {
  it("calls onDelta for each SSE data frame", async () => {
    const reader = mockReader([
      'data: {"data": {"message": "hello"}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("hello");
    expect(h.onDone).toHaveBeenCalledOnce();
    expect(h.onError).not.toHaveBeenCalled();
  });

  it("handles multiple frames in one chunk", async () => {
    const reader = mockReader([
      'data: {"data": {"message": "a"}}\ndata: {"data": {"message": "b"}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledTimes(2);
    expect(h.onDelta).toHaveBeenNthCalledWith(1, "a");
    expect(h.onDelta).toHaveBeenNthCalledWith(2, "b");
  });

  it("handles split chunks (partial frame across reads)", async () => {
    const reader = mockReader([
      'data: {"data": {"mes',
      'sage": "hello"}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("hello");
    expect(h.onDone).toHaveBeenCalledOnce();
  });

  it("triggers onDone when stream ends naturally", async () => {
    const reader = mockReader([
      'data: {"data": {"message": "x"}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDone).toHaveBeenCalledOnce();
    expect(h.onError).not.toHaveBeenCalled();
  });

  // ── [DONE] handling ──────────────────────────────────────────────────

  it("handles [DONE] sentinel", async () => {
    const reader = mockReader(["data: [DONE]\n\n"]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDone).toHaveBeenCalledOnce();
    expect(h.onDelta).not.toHaveBeenCalled();
  });

  // ── done: true ────────────────────────────────────────────────────────

  it("handles {done: true} frame", async () => {
    const reader = mockReader(['data: {"done": true}\n\n']);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDone).toHaveBeenCalledOnce();
    expect(h.onDelta).not.toHaveBeenCalled();
  });

  // ── Error frames ──────────────────────────────────────────────────────

  it("calls onError for error frames", async () => {
    const reader = mockReader(['data: {"error": "bad request"}\n\n']);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onError).toHaveBeenCalledWith(expect.objectContaining({ message: "bad request" }));
    expect(h.onDone).not.toHaveBeenCalled();
  });

  // ── Sources frames (RAG) ──────────────────────────────────────────────

  it("calls onSources for source frames", async () => {
    const reader = mockReader([
      'data: {"data": {"sources": [{"file_path": "a.md"}]}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onSources).toHaveBeenCalledWith([{ file_path: "a.md" }]);
    expect(h.onDelta).not.toHaveBeenCalled();
  });

  it("only fires onSources once even with multiple source frames", async () => {
    const reader = mockReader([
      'data: {"data": {"sources": [{"file_path": "a.md"}]}}\n' +
      'data: {"data": {"sources": [{"file_path": "b.md"}]}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onSources).toHaveBeenCalledOnce();
  });

  // ── Phase frames (RAG) ────────────────────────────────────────────────

  it("calls onPhase for phase frames", async () => {
    const reader = mockReader([
      'data: {"data": {"phase": "retrieving"}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onPhase).toHaveBeenCalledWith("retrieving");
  });

  // ── Plain text fallback ───────────────────────────────────────────────

  it("emits plain text data when JSON parse fails", async () => {
    const reader = mockReader(["data: just plain text\n\n"]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("just plain text");
  });

  it("ignores non-data lines", async () => {
    const reader = mockReader([
      ": heartbeat\n" +
      'data: {"data": {"message": "ok"}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("ok");
    expect(h.onDelta).toHaveBeenCalledTimes(1);
  });

  // ── Tail buffer flush ─────────────────────────────────────────────────

  it("flushes trailing buffer after stream ends", async () => {
    const reader = mockReader([
      'data: {"data": {"message": "final"}}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("final");
    expect(h.onDone).toHaveBeenCalledOnce();
  });

  it("flushes partial trailing data in buffer", async () => {
    // Chunk ends with incomplete data line (no \n\n)
    const reader = mockReader([
      'data: {"data": {"message": "trailing"}}',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("trailing");
    expect(h.onDone).toHaveBeenCalledOnce();
  });

  // ── Empty stream ──────────────────────────────────────────────────────

  it("handles empty stream gracefully", async () => {
    const reader = mockReader([]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDone).toHaveBeenCalledOnce();
    expect(h.onDelta).not.toHaveBeenCalled();
    expect(h.onError).not.toHaveBeenCalled();
  });

  // ── onDone called exactly once ────────────────────────────────────────

  it("calls onDone exactly once even with multiple done signals", async () => {
    const reader = mockReader([
      'data: {"done": true}\n\n',
    ]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDone).toHaveBeenCalledOnce();
  });

  // ── Optional callbacks not required ────────────────────────────────────

  it("works without optional onSources and onPhase", async () => {
    const reader = mockReader([
      'data: {"data": {"sources": [{"file_path": "x.md"}]}}\n' +
      'data: {"data": {"phase": "thinking"}}\n' +
      'data: {"data": {"message": "ok"}}\n\n',
    ]);
    const h = { onDelta: vi.fn(), onDone: vi.fn(), onError: vi.fn() };
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("ok");
    expect(h.onDone).toHaveBeenCalledOnce();
  });

  // ── Tail buffer with JSON error ────────────────────────────────────────

  it("handles tail buffer with parse error as plain text", async () => {
    const reader = mockReader(["data: not json"]);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onDelta).toHaveBeenCalledWith("not json");
    expect(h.onDone).toHaveBeenCalledOnce();
  });

  // ── Tail buffer with error frame ───────────────────────────────────────

  it("handles tail buffer with error frame", async () => {
    const reader = mockReader(['data: {"error": "fail"}']);
    const h = makeHandlers();
    await readSSEStream(reader, h);
    expect(h.onError).toHaveBeenCalledWith(expect.objectContaining({ message: "fail" }));
    expect(h.onDone).not.toHaveBeenCalled();
  });
});