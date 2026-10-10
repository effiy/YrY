/**
 * AI Chat service — streaming chat, non-streaming chat, and model listing.
 *
 * Uses a **3-tier resilient transport stack** so chat always works even if
 * the YiAi RPC service layer degrades:
 *
 *   1. YiAi RPC (module_name / method_name)        →  / via dataService / callService
 *   2. YiAi OpenAI-compat  POST /v1/chat/completions  →  (native streaming JSON)
 *   3. Ollama native     POST /api/chat            →  (NDJSON streaming)
 *
 * Streaming responses use SSE or NDJSON via native fetch because Axios
 * does not support ReadableStream consumption.
 */
import { buildYiAiStreamUrl, yiAiAuthHeaders, buildYiAiUrl, YIAI_OLLAMA_URL } from "@/config/yiAi";
import { callService } from "./dataService";
import { readSSEStream } from "@/utils/sse";
import { filesize } from "filesize";
import type { ChatPayload, OllamaModel, OllamaModelListResponse } from "@/api/interface/yiAi";

const CHAT_SERVICE = "services.ai.chat_service";
/** Default timeout for streaming fetch requests (10 minutes). */
const STREAM_TIMEOUT_MS = 600_000;
/** Min time a transport is marked "down" before we try it again (sticky failover). */
const TRANSPORT_DOWN_TTL_MS = 120_000;
/** Max characters to send via the fallback transports; mirrors 24K window above. */
const FALLBACK_MAX_CONTEXT_CHARS = 24_000;

type TransportKind = "yiAiRpc" | "yiAiOpenAi" | "ollama";
const TRANSPORT_DOWN: Partial<Record<TransportKind, number>> = {};

/** Whether a given transport is considered healthy (not marked recently down). */
function transportUp(k: TransportKind): boolean {
  const downAt = TRANSPORT_DOWN[k];
  if (!downAt) return true;
  if (Date.now() - downAt < TRANSPORT_DOWN_TTL_MS) return false;
  delete TRANSPORT_DOWN[k];
  return true;
}
function markTransportDown(k: TransportKind) {
  TRANSPORT_DOWN[k] = Date.now();
}
function readTransportError(response: Response): Promise<string> {
  return new Promise(resolve => {
    let detail = response.statusText;
    const contentType = response.headers.get("content-type") || "";
    (contentType.includes("application/json") ? response.json().catch(() => null) : response.text().catch(() => null)).then(
      (body: any) => {
        if (!body) return resolve(detail);
        if (typeof body === "string") {
          resolve(body.trim() || detail);
        } else if (contentType.includes("application/json")) {
          const msg = body?.message ?? body?.error ?? body?.detail ?? body?.msg;
          const extra = body?.data ? ` (${JSON.stringify(body.data)})` : "";
          resolve(msg ? `${msg}${extra}` : JSON.stringify(body).slice(0, 800));
        } else {
          resolve(String(body).slice(0, 800));
        }
      },
      () => resolve(detail)
    );
  });
}

/**
 * Map YiVad's ChatMessage shape ({type:"user"|"pet", message}) to Ollama's
 * chat-completion shape ({role:"user"|"assistant", content}). Pet turns with
 * empty content (e.g. the streaming placeholder) are dropped so we don't
 * confuse the model with an empty assistant turn.
 *
 * Ollama's /api/chat requires messages to alternate strictly between user
 * and assistant, starting with user. We post-process the array to:
 *   1) drop leading assistant messages;
 *   2) collapse consecutive same-role messages into one (join with "\n");
 *   3) trim the final trailing assistant turn if present.
 */
function toOllamaMessages(payload: ChatPayload): Array<{ role: string; content: string }> {
  const raw = (payload.messages ?? [])
    .filter(m => m.type === "user" || m.type === "pet" || m.type === "followup")
    .filter(m => (m.message ?? "").trim().length > 0)
    .map(m => ({
      role: m.type === "user" ? "user" : "assistant",
      content: (m.message ?? "").trim()
    }));

  // System prompt (if any) is handled via the top-level `system` field, so no
  // need to inject it here.

  // (1) Drop any leading assistant turns
  while (raw.length && raw[0].role === "assistant") raw.shift();
  if (!raw.length) return [];

  // (2) Collapse consecutive same-role messages
  const collapsed: Array<{ role: string; content: string }> = [];
  for (const msg of raw) {
    const last = collapsed[collapsed.length - 1];
    if (last && last.role === msg.role) {
      last.content = `${last.content}\n${msg.content}`;
    } else {
      collapsed.push({ role: msg.role, content: msg.content });
    }
  }

  // (3) If the last message is assistant (shouldn't happen as we slice the
  // placeholder petMsg off before sending), drop it to keep Ollama happy.
  if (collapsed.length && collapsed[collapsed.length - 1].role === "assistant") {
    collapsed.pop();
  }
  return collapsed;
}

/** Normalise an array of Data URLs / base64 strings to plain base64 strings.
 *  Ollama's `images` field accepts only base64, not data: URLs. */
function normaliseImages(images: string[] | undefined): string[] | undefined {
  if (!images?.length) return undefined;
  return images
    .map(img => {
      if (!img) return "";
      const m = img.match(/^data:[^;]+;base64,(.*)$/s);
      return m ? m[1] : img;
    })
    .filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════════════════
// Tier 2 / Tier 3 — Direct LLM fallbacks
// ═══════════════════════════════════════════════════════════════════════════

type StreamImplArgs = {
  body: Record<string, any>;
  url: string;
  headers: Record<string, string>;
  signal: AbortSignal;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
  mode: "sse" | "ndjson";
  /** Transport identity for sticky failover + logs. */
  kind: TransportKind;
};

/** Run a single streaming fetch with SSE or NDJSON line framing. */
async function runStreamingFetch(args: StreamImplArgs): Promise<void> {
  const { url, headers, body, signal, onChunk, onDone, onError, mode, kind } = args;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
  if (!res.ok) {
    const detail = await readTransportError(res);
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream in response");

  if (mode === "sse") {
    await readSSEStream(reader, { onDelta: onChunk, onDone, onError });
    return;
  }

  // ── NDJSON (Ollama /api/chat) framing ──
  const decoder = new TextDecoder();
  let buf = "";
  let finished = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      const rawLine = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!rawLine) continue;
      try {
        const frame = JSON.parse(rawLine);
        if (frame?.error) {
          throw new Error(typeof frame.error === "string" ? frame.error : JSON.stringify(frame.error));
        }
        // Ollama message.content delta
        const delta = frame?.message?.content ?? frame?.choices?.[0]?.delta?.content ?? frame?.message_response ?? "";
        if (delta) onChunk(delta);
        if (frame?.done === true) {
          finished = true;
        }
      } catch (e) {
        if (e instanceof Error && /^error:|Error/.test(e.message)) throw e;
        /* skip malformed lines */
      }
    }
  }
  if (!finished) onChunk("");
  onDone();
  if (import.meta.env.DEV) console.debug(`[streamChat] transport ${kind} completed`);
}

/** Public transport status — used by the UI to render a degradation badge. */
export type ChatTransportStatus = {
  yiAiRpc: boolean;
  yiAiOpenAi: boolean;
  ollama: boolean;
  forcedFallback: boolean;
  selected: TransportKind | null;
  lastFallbacks: Array<{ kind: TransportKind; error: string; at: number }>;
};
const STATUS: ChatTransportStatus = {
  yiAiRpc: true,
  yiAiOpenAi: true,
  ollama: true,
  forcedFallback: false,
  selected: null,
  lastFallbacks: []
};
/** Subscribe-free snapshot for UI state helpers. */
export function getChatTransportStatus(): Readonly<ChatTransportStatus> {
  return Object.freeze({ ...STATUS, lastFallbacks: STATUS.lastFallbacks.slice() });
}

/**
 * Lightweight probe: try YiAi RPC with a minimal method so we can auto-skip a
 * known-broken backend before the user ever hits "Send". This handles cases
 * like a missing module import (e.g. classify_error) that makes every call 400.
 */
export async function probeChatService(force = false): Promise<ChatTransportStatus> {
  // (Re-)check each transport unless we already marked it down within TTL.
  const check: TransportKind[] = [];
  if (force || transportUp("yiAiRpc")) check.push("yiAiRpc");
  if (force || transportUp("yiAiOpenAi")) check.push("yiAiOpenAi");
  if (force || transportUp("ollama")) check.push("ollama");

  await Promise.allSettled(
    check.map(async kind => {
      try {
        if (kind === "yiAiRpc") {
          const res = await callService<any>(CHAT_SERVICE, "get_model_info", {}, { timeout: 6_000 });
          const ok = res.code === 0 && (res.data?.status === "connected" || res.data?.status === "configured");
          if (!ok && !(res.data?.models?.length > 0)) throw new Error(res.message || "unhealthy");
          STATUS.yiAiRpc = true;
        } else if (kind === "yiAiOpenAi") {
          const ctl = new AbortController();
          const t = setTimeout(() => ctl.abort(), 6_000);
          const r = await fetch(buildYiAiUrl("/v1/models"), {
            signal: ctl.signal,
            headers: yiAiAuthHeaders(),
            method: "GET"
          });
          clearTimeout(t);
          STATUS.yiAiOpenAi = r.ok;
          if (!r.ok) markTransportDown(kind);
        } else {
          // Ollama
          const ctl = new AbortController();
          const t = setTimeout(() => ctl.abort(), 5_000);
          const base = (YIAI_OLLAMA_URL || "http://localhost:11434").replace(/\/+$/, "");
          const r = await fetch(`${base}/api/tags`, { signal: ctl.signal });
          clearTimeout(t);
          STATUS.ollama = r.ok;
          if (!r.ok) markTransportDown(kind);
        }
      } catch {
        if (kind === "yiAiRpc") STATUS.yiAiRpc = false;
        if (kind === "yiAiOpenAi") STATUS.yiAiOpenAi = false;
        if (kind === "ollama") STATUS.ollama = false;
        markTransportDown(kind);
      }
    })
  );

  STATUS.forcedFallback = !STATUS.yiAiRpc;
  STATUS.selected = STATUS.yiAiRpc ? "yiAiRpc" : STATUS.yiAiOpenAi ? "yiAiOpenAi" : STATUS.ollama ? "ollama" : null;
  return getChatTransportStatus();
}

/** Build a compact body shared by all fallbacks. */
function buildFallbacksMessages(
  payload: ChatPayload,
  finalMessages: Array<{ role: string; content: string }>,
  finalSystem?: string,
  finalImages?: string[]
) {
  const openAi = [...(finalSystem ? [{ role: "system" as const, content: finalSystem }] : []), ...finalMessages];
  // Trim to char budget to keep fallbacks lightweight
  let total = openAi.reduce((acc, m) => acc + (m.content?.length ?? 0), 0);
  while (total > FALLBACK_MAX_CONTEXT_CHARS && openAi.length > 2) {
    const removed = openAi.splice(1, 1)[0];
    total -= removed?.content?.length ?? 0;
  }
  const ollamaBody = {
    model: payload.model ?? "qwen3.5:4b",
    messages: finalMessages,
    stream: true,
    ...(finalSystem ? { system: finalSystem } : {}),
    ...(finalImages?.length ? { images: finalImages } : {}),
    options: { temperature: 0.3 }
  };
  const openAiBody = {
    model: payload.model ?? "qwen3.5:4b",
    messages: openAi,
    stream: true,
    ...(finalImages?.length ? { images: finalImages } : {})
  };
  return { ollamaBody, openAiBody };
}

/**
 * Stream a chat completion via SSE with transparent 3-tier failover.
 *
 * Tiers are tried in order (Rpc → OpenAI compat → Ollama); any transport that
 * returns HTTP 4xx / network error is marked "down" for 2 min and we move on.
 * The UI can render the degradation via `getChatTransportStatus()`.
 */
export function streamChat(
  payload: ChatPayload,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): { abort: () => void } {
  const controller = new AbortController();
  let timedOut = false;
  let timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, STREAM_TIMEOUT_MS);
  let finalised = false;
  let currentAbortedInternally = false;

  const messages = toOllamaMessages(payload);
  const finalMessages = messages.length ? messages : [{ role: "user" as const, content: "Please proceed." }];
  const finalImages = normaliseImages(payload.images);
  const finalSystem = (payload.system ?? "").trim() || undefined;
  const { ollamaBody, openAiBody } = buildFallbacksMessages(payload, finalMessages, finalSystem, finalImages);

  if (import.meta.env.DEV) {
    console.debug("[streamChat] request", {
      model: ollamaBody.model,
      messages: finalMessages.map(m => `${m.role}:${(m.content || "").slice(0, 60)}`),
      hasSystem: !!finalSystem,
      imagesCount: finalImages?.length ?? 0,
      transportStatus: getChatTransportStatus()
    });
  }

  function _finishError(err: Error) {
    if (finalised) return;
    finalised = true;
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      if (timedOut) {
        onError(
          new Error(
            `Request timed out after ${STREAM_TIMEOUT_MS / 1000}s. The AI model may be processing a large request — try with shorter text or retry.`
          )
        );
      } else {
        onDone();
      }
    } else {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
  function _finishOk() {
    if (finalised) return;
    finalised = true;
    clearTimeout(timeoutId);
    onDone();
  }

  const rpcBody: Record<string, any> = {
    module_name: CHAT_SERVICE,
    method_name: "chat",
    parameters: {
      model: payload.model ?? "qwen3.5:4b",
      messages: finalMessages,
      stream: true,
      ...(finalSystem ? { system: finalSystem } : {}),
      ...(finalImages?.length ? { images: finalImages } : {})
    }
  };
  const ollamaBase = (YIAI_OLLAMA_URL || "http://localhost:11434").replace(/\/+$/, "");
  const tiers: Array<{ kind: TransportKind; run: () => Promise<void> }> = [
    {
      kind: "yiAiRpc",
      run: () =>
        runStreamingFetch({
          url: buildYiAiStreamUrl("/"),
          headers: yiAiAuthHeaders(),
          body: rpcBody,
          signal: controller.signal,
          onChunk,
          onDone: _finishOk,
          onError: e => {
            throw e;
          },
          mode: "sse",
          kind: "yiAiRpc"
        })
    },
    {
      kind: "yiAiOpenAi",
      run: () =>
        runStreamingFetch({
          url: buildYiAiUrl("/v1/chat/completions"),
          headers: yiAiAuthHeaders(),
          body: openAiBody,
          signal: controller.signal,
          onChunk,
          onDone: _finishOk,
          onError: e => {
            throw e;
          },
          mode: "sse",
          kind: "yiAiOpenAi"
        })
    },
    {
      kind: "ollama",
      run: () =>
        runStreamingFetch({
          url: `${ollamaBase}/api/chat`,
          headers: { "Content-Type": "application/json" },
          body: ollamaBody,
          signal: controller.signal,
          onChunk,
          onDone: _finishOk,
          onError: e => {
            throw e;
          },
          mode: "ndjson",
          kind: "ollama"
        })
    }
  ];

  (async () => {
    let lastErr: Error | null = null;
    for (const tier of tiers) {
      if (controller.signal.aborted) break;
      if (!transportUp(tier.kind)) {
        if (import.meta.env.DEV) console.debug(`[streamChat] skip ${tier.kind} (marked down)`);
        continue;
      }
      STATUS.selected = tier.kind;
      try {
        await tier.run();
        return; // success
      } catch (err) {
        if (controller.signal.aborted && !currentAbortedInternally) {
          throw err; // propagate user/timeout abort
        }
        lastErr = err instanceof Error ? err : new Error(String(err));
        markTransportDown(tier.kind);
        STATUS.lastFallbacks.unshift({ kind: tier.kind, error: lastErr.message, at: Date.now() });
        STATUS.lastFallbacks = STATUS.lastFallbacks.slice(0, 5);
        if (import.meta.env.DEV) console.warn(`[streamChat] ${tier.kind} failed: ${lastErr.message}`);
      }
    }
    // All tiers failed — surface the last error with a hint about transports.
    const hints = tiers.map(t => `${t.kind}:${transportUp(t.kind) ? "up" : "down"}`).join(" ");
    const msg = lastErr ? `${lastErr.message} · transports(${hints})` : `All transports offline (${hints})`;
    _finishError(new Error(msg));
  })().catch(err => {
    if (controller.signal.aborted) {
      _finishError(new Error("Aborted"));
      return;
    }
    _finishError(err instanceof Error ? err : new Error(String(err)));
  });

  return {
    abort: () => {
      currentAbortedInternally = true;
      clearTimeout(timeoutId);
      controller.abort();
    }
  };
}

/**
 * Non-streaming chat completion.
 * Sends messages to the AI and returns the full response.
 * Uses a 120s timeout — AI inference can be slow for large payloads.
 */
export async function chat(payload: ChatPayload): Promise<string> {
  const messages = toOllamaMessages(payload);
  const finalMessages = messages.length ? messages : [{ role: "user" as const, content: "Please proceed." }];
  const finalImages = normaliseImages(payload.images);
  const finalSystem = (payload.system ?? "").trim() || undefined;

  // Mirror streamChat tiers (non-streaming). Order: RPC → OpenAI compat JSON → Ollama JSON
  const tiers: Array<{ kind: TransportKind; run: () => Promise<string> }> = [
    {
      kind: "yiAiRpc",
      run: async () => {
        const res = await callService<any>(
          CHAT_SERVICE,
          "chat",
          {
            model: payload.model ?? "qwen3.5:4b",
            messages: finalMessages,
            stream: false,
            ...(finalSystem ? { system: finalSystem } : {}),
            ...(finalImages?.length ? { images: finalImages } : {})
          },
          { timeout: 120_000 }
        );
        if (res.code !== 0) throw new Error(res.message || "Chat request failed");
        const d = res.data;
        return d?.message ?? d?.choices?.[0]?.message?.content ?? d?.content ?? d?.response ?? JSON.stringify(d);
      }
    },
    {
      kind: "yiAiOpenAi",
      run: async () => {
        const { openAiBody } = buildFallbacksMessages(payload, finalMessages, finalSystem, finalImages);
        const r = await fetch(buildYiAiUrl("/v1/chat/completions"), {
          method: "POST",
          headers: yiAiAuthHeaders(),
          body: JSON.stringify({ ...openAiBody, stream: false })
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${await readTransportError(r)}`);
        const data = await r.json();
        return (
          data?.choices?.[0]?.message?.content ??
          data?.choices?.[0]?.text ??
          data?.message?.content ??
          data?.content ??
          JSON.stringify(data)
        );
      }
    },
    {
      kind: "ollama",
      run: async () => {
        const { ollamaBody } = buildFallbacksMessages(payload, finalMessages, finalSystem, finalImages);
        const base = (YIAI_OLLAMA_URL || "http://localhost:11434").replace(/\/+$/, "");
        const r = await fetch(`${base}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...ollamaBody, stream: false })
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${await readTransportError(r)}`);
        const data = await r.json();
        return data?.message?.content ?? data?.response ?? JSON.stringify(data);
      }
    }
  ];

  let lastErr: Error | null = null;
  for (const tier of tiers) {
    if (!transportUp(tier.kind)) continue;
    try {
      return await tier.run();
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      markTransportDown(tier.kind);
    }
  }
  throw lastErr ?? new Error("No working chat transport available");
}

/**
 * Fetch the list of available Ollama models via the YiAi backend (port 10086),
 * which proxies Ollama's /api/tags and avoids browser CORS.
 */
export async function fetchModelList(): Promise<OllamaModel[]> {
  const res = await callService<OllamaModelListResponse>(CHAT_SERVICE, "list_ollama_models", {});
  if (res.code === 0 && res.data?.models) {
    return res.data.models.map((m: any) => ({
      name: m.name ?? m.model ?? "",
      model: m.model ?? m.name ?? "",
      size: m.size ?? 0,
      sizeFormatted: m.sizeFormatted ?? String(filesize(m.size ?? 0)),
      modifiedAt: m.modified_at ?? m.modifiedAt ?? "",
      modified_at: m.modified_at ?? m.modifiedAt ?? "",
      details: m.details ?? {}
    }));
  }
  throw new Error("Failed to fetch model list");
}
