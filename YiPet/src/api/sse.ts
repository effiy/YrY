/**
 * Shared SSE (Server-Sent Events) token extraction utilities.
 *
 * YiAi emits text deltas in several nested shapes depending on the model
 * and endpoint version. This module provides a single canonical extraction
 * function consumed by both ChatService and RagService.
 */

/**
 * Try to coerce an unknown value into a plain string.
 *
 * Handles three shapes the backend may emit:
 *   1. Plain string — returned as-is.
 *   2. Array of strings or {content} objects — joined.
 *   3. Object with a string `.message` or `.content` property.
 */
function asText(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'string') return v;

  if (Array.isArray(v)) {
    const joined = v
      .map((x) => {
        if (typeof x === 'string') return x;
        if (x && typeof x === 'object') {
          const rec = x as Record<string, unknown>;
          if (typeof rec.message === 'string') return rec.message;
          if (typeof rec.content === 'string') return rec.content;
        }
        return '';
      })
      .join('');
    return joined || undefined;
  }

  if (typeof v === 'object') {
    const rec = v as Record<string, unknown>;
    if (typeof rec.message === 'string') return rec.message;
    if (typeof rec.content === 'string') return rec.content;
  }

  return undefined;
}

/**
 * Pick streaming text content from a YiAi SSE chunk.
 *
 * YiAi wraps deltas in a {@code {data: {message: "..."}}} envelope, but
 * some model versions emit {@code {message: "..."}} directly, and the RAG
 * endpoint may nest the delta inside {@code result} or the raw data
 * payload. This function tries every known path in priority order.
 */
export function pickTextFromResponse(obj: unknown): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const o = obj as Record<string, unknown>;
  const data = o.data as Record<string, unknown> | undefined;
  const result = o.result as Record<string, unknown> | undefined;

  const candidates: unknown[] = [
    // YiAi standard: {data: {message/content/response: "..."}}
    data?.message,
    data?.content,
    data?.response,
    // Raw data payload when data itself is the text
    o.data,
    // YiAi execution-module: {result: {message/content: "..."}}
    result?.message,
    result?.content,
    // Top-level fallbacks (some backends emit flat shapes)
    o.message,
    o.content,
    o.response,
    o.text,
  ];

  for (const c of candidates) {
    const text = asText(c);
    if (typeof text === 'string' && text !== '') return text;
  }
  return undefined;
}