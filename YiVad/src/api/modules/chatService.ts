/**
 * AI Chat service — streaming chat, non-streaming chat, and model listing.
 *
 * Streaming responses use SSE (Server-Sent Events) via native fetch because
 * Axios does not support ReadableStream consumption.
 *
 * YiAi contract (services.ai.chat_service.chat):
 *   parameters: { model, messages: [{role, content}], stream, system?, images? }
 *   SSE chunk:  data: {"data": {"message": "..."}}\n\n
 *   SSE end:    data: {"done": true}\n\n
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";
import { callService } from "./dataService";
import type { ChatPayload, OllamaModel, OllamaModelListResponse } from "@/api/interface/yiweb";

const CHAT_SERVICE = "services.ai.chat_service";

/**
 * Map YiVad's ChatMessage shape ({type:"user"|"pet", message}) to Ollama's
 * chat-completion shape ({role:"user"|"assistant", content}). Pet turns with
 * empty content (e.g. the streaming placeholder) are dropped so we don't
 * confuse the model with an empty assistant turn.
 */
function toOllamaMessages(payload: ChatPayload): Array<{ role: string; content: string }> {
  return (payload.messages ?? [])
    .filter(m => m.type === "user" || m.type === "pet")
    .filter(m => (m.message ?? "").trim().length > 0)
    .map(m => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.message
    }));
}

/**
 * Extract a text delta from a YiAi SSE payload. YiAi emits
 * `{"data": {"message": "..."}}`; we also tolerate OpenAI-style shapes
 * (`choices[0].delta.content`, `message.content`) for portability.
 */
function extractDelta(parsed: any): string {
  if (!parsed || typeof parsed !== "object") return "";
  return parsed?.data?.message ?? parsed?.message?.content ?? parsed?.choices?.[0]?.delta?.content ?? parsed?.content ?? "";
}

/**
 * Stream a chat completion via SSE.
 * Returns an abort function and yields text chunks via the onChunk callback.
 */
export function streamChat(
  payload: ChatPayload,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): { abort: () => void } {
  const controller = new AbortController();

  const body: Record<string, any> = {
    module_name: CHAT_SERVICE,
    method_name: "chat",
    parameters: {
      model: payload.model ?? "qwen3.5",
      messages: toOllamaMessages(payload),
      stream: true,
      ...(payload.system ? { system: payload.system } : {}),
      ...(payload.images?.length ? { images: payload.images } : {})
    }
  };

  const url = buildYiAiUrl("/");

  fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body),
    signal: controller.signal
  })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream in response");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed?.error) {
              onError(new Error(String(parsed.error)));
              return;
            }
            if (parsed?.done === true) {
              onDone();
              return;
            }
            const content = extractDelta(parsed);
            if (content) onChunk(content);
          } catch {
            // Plain text fallback — emit if non-empty
            if (data && data !== "[DONE]") onChunk(data);
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
              onError(new Error(String(parsed.error)));
              return;
            }
            if (parsed?.done !== true) {
              const content = extractDelta(parsed);
              if (content) onChunk(content);
            }
          } catch {
            onChunk(data);
          }
        }
      }
      onDone();
    })
    .catch(err => {
      if (err.name === "AbortError") {
        onDone();
      } else {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    });

  return {
    abort: () => controller.abort()
  };
}

/**
 * Non-streaming chat completion.
 * Sends messages to the AI and returns the full response.
 */
export async function chat(payload: ChatPayload): Promise<string> {
  const res = await callService<any>(CHAT_SERVICE, "chat", {
    model: payload.model ?? "qwen3.5",
    messages: toOllamaMessages(payload),
    stream: false,
    ...(payload.system ? { system: payload.system } : {}),
    ...(payload.images?.length ? { images: payload.images } : {})
  });

  if (res.code !== 0) {
    throw new Error(res.message || "Chat request failed");
  }

  const data = res.data;
  return data?.message ?? data?.choices?.[0]?.message?.content ?? data?.content ?? data?.response ?? JSON.stringify(data);
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
      sizeFormatted: m.sizeFormatted ?? formatBytes(m.size ?? 0),
      modifiedAt: m.modified_at ?? m.modifiedAt ?? "",
      modified_at: m.modified_at ?? m.modifiedAt ?? "",
      details: m.details ?? {}
    }));
  }
  throw new Error("Failed to fetch model list");
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[i];
}
