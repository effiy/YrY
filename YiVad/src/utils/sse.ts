/**
 * Shared SSE (Server-Sent Events) utilities for YiAi streaming endpoints.
 */

/**
 * Extract a text delta from a YiAi SSE payload. YiAi emits
 * `{"data": {"message": "..."}}`; we also tolerate OpenAI-style shapes
 * (`choices[0].delta.content`, `message.content`) for portability.
 */
export function extractDelta(parsed: any): string {
  if (!parsed || typeof parsed !== "object") return "";
  return parsed?.data?.message ?? parsed?.message?.content ?? parsed?.choices?.[0]?.delta?.content ?? parsed?.content ?? "";
}

/** Callbacks for the SSE stream reader. */
export interface SSEStreamHandlers {
  /** Called for each text delta chunk. */
  onDelta: (text: string) => void;
  /** Called when the stream completes normally. */
  onDone: () => void;
  /** Called on stream or parse errors. */
  onError: (err: Error) => void;
  /** Optional — called when source documents are received (RAG only). */
  onSources?: (sources: any[]) => void;
  /** Optional — called when a processing phase frame is received (RAG only). */
  onPhase?: (phase: string) => void;
}

/**
 * Read a streaming SSE response body — decode, split lines, parse JSON frames,
 * and dispatch typed callbacks. Shared between `chatService.streamChat` and
 * `ragService.runStream` (eliminates ~70 lines of duplicated buffer/parse logic).
 */
export async function readSSEStream(reader: ReadableStreamDefaultReader<Uint8Array>, handlers: SSEStreamHandlers): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";
  let sourcesSent = false;
  let done = false;

  function _done() {
    if (done) return;
    done = true;
    handlers.onDone();
  }

  while (true) {
    const { done: streamDone, value } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") {
        _done();
        return;
      }

      try {
        const parsed = JSON.parse(data);
        if (parsed?.error) {
          handlers.onError(new Error(String(parsed.error)));
          return;
        }
        if (parsed?.done === true) {
          _done();
          return;
        }

        // Extract optional sources/phase before delta
        const sources = _extractSources(parsed);
        if (sources && !sourcesSent) {
          sourcesSent = true;
          handlers.onSources?.(sources);
          continue;
        }
        const phase = _extractPhase(parsed);
        if (phase && handlers.onPhase) {
          handlers.onPhase(phase);
          continue;
        }

        const content = extractDelta(parsed);
        if (content) handlers.onDelta(content);
      } catch {
        if (data && data !== "[DONE]") handlers.onDelta(data);
      }
    }
  }

  // Flush trailing buffer
  const tail = buffer.trim();
  if (tail.startsWith("data: ")) {
    const data = tail.slice(6);
    if (data && data !== "[DONE]") {
      try {
        const parsed = JSON.parse(data);
        if (parsed?.error) {
          handlers.onError(new Error(String(parsed.error)));
          return;
        }
        if (parsed?.done !== true) {
          const sources = _extractSources(parsed);
          if (sources && !sourcesSent) handlers.onSources?.(sources);
          const phase = _extractPhase(parsed);
          if (phase && handlers.onPhase) handlers.onPhase(phase);
          const content = extractDelta(parsed);
          if (content) handlers.onDelta(content);
        }
      } catch {
        handlers.onDelta(data);
      }
    }
  }
  _done();
}

function _extractSources(parsed: unknown): any[] | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as any;
  const sources = obj?.data?.sources ?? obj?.sources;
  return Array.isArray(sources) && sources.length ? sources : null;
}

function _extractPhase(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as any;
  const phase = obj?.data?.phase ?? obj?.phase;
  return typeof phase === "string" ? phase : null;
}
