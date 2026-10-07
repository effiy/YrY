/**
 * Shared SSE (Server-Sent Events) utilities for YiAi streaming endpoints.
 */

import { createParser } from "eventsource-parser";

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
 * Read a streaming SSE response body — backed by eventsource-parser for
 * robust buffer management, line splitting, and multi-byte character
 * handling. Shared between chatService.streamChat and ragService.runStream.
 */
export async function readSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: SSEStreamHandlers,
): Promise<void> {
  const decoder = new TextDecoder();
  let sourcesSent = false;
  let done = false;

  function _done() {
    if (done) return;
    done = true;
    handlers.onDone();
  }

  const parser = createParser({
    onEvent(event) {
      if (done) return;
      const data = event.data;
      if (!data || data === "[DONE]") {
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

        const sources = _extractSources(parsed);
        if (sources && !sourcesSent) {
          sourcesSent = true;
          handlers.onSources?.(sources);
          return;
        }
        const phase = _extractPhase(parsed);
        if (phase && handlers.onPhase) {
          handlers.onPhase(phase);
          return;
        }

        const content = extractDelta(parsed);
        if (content) handlers.onDelta(content);
      } catch {
        if (data && data !== "[DONE]") handlers.onDelta(data);
      }
    },
  });

  while (true) {
    const { done: streamDone, value } = await reader.read();
    if (streamDone) break;
    parser.feed(decoder.decode(value, { stream: true }));
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