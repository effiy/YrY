/**
 * AI Chat service — streaming chat, non-streaming chat, and model listing.
 *
 * Streaming responses use SSE (Server-Sent Events) via native fetch because
 * Axios does not support ReadableStream consumption.
 */
import { buildYiAiUrl, YIAI_OLLAMA_URL } from "@/config/yiweb";
import { callService } from "./dataService";
import type { ChatPayload, OllamaModel, OllamaModelListResponse } from "@/api/interface/yiweb";

const CHAT_SERVICE = "services.ai.chat_service";

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
      messages: payload.messages,
      stream: true,
      system: payload.system,
      temperature: payload.temperature
    }
  };

  const url = buildYiAiUrl("/");

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": localStorage.getItem("YiWeb.apiToken.v1") ?? ""
    },
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
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed?.choices?.[0]?.delta?.content ?? parsed?.message?.content ?? "";
              if (content) onChunk(content);
            } catch {
              // If it's plain text (not JSON), emit directly
              if (data && data !== "[DONE]") onChunk(data);
            }
          }
        }
      }
      // Process remaining buffer
      if (buffer.trim()) {
        const data = buffer.trim();
        if (data.startsWith("data: ")) {
          const content = data.slice(6);
          if (content !== "[DONE]") onChunk(content);
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
    messages: payload.messages,
    stream: false,
    system: payload.system,
    temperature: payload.temperature
  });

  if (res.code !== 0) {
    throw new Error(res.message || "Chat request failed");
  }

  // Response shapes vary; try common patterns
  const data = res.data;
  return (
    data?.choices?.[0]?.message?.content ?? data?.message?.content ?? data?.content ?? data?.response ?? JSON.stringify(data)
  );
}

/**
 * Fetch the list of available Ollama models from the backend.
 */
export async function fetchModelList(): Promise<OllamaModel[]> {
  const url = `${YIAI_OLLAMA_URL}/api/tags`;

  try {
    const resp = await fetch(url, {
      headers: {
        "X-Token": localStorage.getItem("YiWeb.apiToken.v1") ?? ""
      }
    });
    if (!resp.ok) throw new Error(`Ollama returned ${resp.status}`);
    const json = await resp.json();
    return (json?.models ?? []).map((m: any) => ({
      name: m.name ?? m.model ?? "",
      model: m.model ?? m.name ?? "",
      size: m.size ?? 0,
      sizeFormatted: m.sizeFormatted ?? formatBytes(m.size ?? 0),
      modifiedAt: m.modified_at ?? m.modifiedAt ?? "",
      modified_at: m.modified_at ?? m.modifiedAt ?? "",
      details: m.details ?? {}
    }));
  } catch {
    // Fallback: try via the YiAi API
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
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + units[i];
}
