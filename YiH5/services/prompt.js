/**
 * Prompt 相关 API
 */

import { config } from "../config.js?v=2";
import { fetchWithAuth } from "./client.js";

const EXECUTE_API_URL = `${String(config.apiBase || "").replace(/\/+$/, "")}/`;

const buildChatServiceBody = (systemPrompt, userPrompt, modelId, stream, images) => {
  const parameters = {
    system: String(systemPrompt || "").trim(),
    user: String(userPrompt || "").trim(),
    model: modelId || "deepseek-r1:32b",
  };
  if (stream) parameters.stream = true;
  if (Array.isArray(images) && images.length > 0) parameters.images = images;
  return {
    module_name: "services.ai.chat_service",
    method_name: "chat",
    parameters,
  };
};

const stripThink = (raw) => {
  let s = String(raw || "");
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
  s = s.replace(/```think[\s\S]*?```/gi, "");
  return s.trim();
};

const pickTextFromResponse = (obj) => {
  const asText = (v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string") return v;
    if (Array.isArray(v)) {
      const joined = v
        .map((x) => {
          if (typeof x === "string") return x;
          if (x && typeof x === "object") {
            if (typeof x.content === "string") return x.content;
            if (typeof x.data === "string") return x.data;
          }
          return "";
        })
        .join("");
      return joined;
    }
    if (v && typeof v === "object") {
      if (typeof v.content === "string") return v.content;
      if (typeof v.data === "string") return v.data;
      if (v.message && typeof v.message === "object" && typeof v.message.content === "string") return v.message.content;
    }
    return undefined;
  };

  if (!obj || typeof obj !== "object") return undefined;
  const candidates = [
    obj.data && typeof obj.data === "object" ? obj.data.message : undefined,
    obj.data && typeof obj.data === "object" ? obj.data.content : undefined,
    obj.data && typeof obj.data === "object" ? obj.data.response : undefined,
    obj.data,
    obj.content,
    obj.message && typeof obj.message === "object" ? obj.message.content : undefined,
    obj.message,
    obj.response,
    obj.text,
    obj.delta && typeof obj.delta === "object" ? obj.delta.content : undefined,
    Array.isArray(obj.choices)
      ? obj.choices.map((c) => c?.message?.content || c?.delta?.content || "").join("")
      : undefined,
  ];
  for (const c of candidates) {
    const text = asText(c);
    if (typeof text === "string" && text !== "") return text;
  }
  return undefined;
};

export const streamPrompt = async (
  systemPrompt,
  userPrompt,
  modelId,
  conversationId,
  token,
  signal,
  onChunk
) => {
  const response = await fetchWithAuth(
    EXECUTE_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream,application/json",
      },
      body: JSON.stringify(buildChatServiceBody(systemPrompt, userPrompt, modelId, true)),
      signal,
    },
    token
  );

  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("text/event-stream")) {
    const text = await response.text();
    let content = text;
    try {
      const obj = JSON.parse(text);
      const picked = pickTextFromResponse(obj);
      if (picked !== undefined) content = picked;
    } catch {
      // ignore
    }
    const finalText = stripThink(content);
    if (typeof onChunk === "function") onChunk(finalText, finalText);
    return finalText;
  }

  const reader = response.body?.getReader?.();
  if (!reader) {
    const text = await response.text();
    const finalText = stripThink(text);
    if (typeof onChunk === "function") onChunk(finalText, finalText);
    return finalText;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

  const flushEvent = (evt) => {
    const lines = String(evt || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const dataStr = line.slice(5).trim();
      if (!dataStr || dataStr === "[DONE]") continue;
      let chunkText = "";
      try {
        const chunk = JSON.parse(dataStr);
        if (chunk && chunk.done === true) return true;
        const picked = pickTextFromResponse(chunk);
        if (picked !== undefined) chunkText = String(picked);
        else chunkText = dataStr;
      } catch {
        chunkText = dataStr;
      }
      if (chunkText) {
        accumulated += chunkText;
        if (typeof onChunk === "function") onChunk(chunkText, accumulated);
      }
    }
    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const evt of events) {
      const shouldStop = flushEvent(evt);
      if (shouldStop) {
        try {
          await reader.cancel();
        } catch {
          // ignore
        }
        buffer = "";
        break;
      }
    }
  }

  if (buffer.trim()) {
    flushEvent(buffer);
  }

  return stripThink(accumulated);
};

/**
 * 调用 Prompt 接口
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @param {string} modelId 
 * @param {string} conversationId 
 * @param {string} [token] 
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>}
 */
export const callPrompt = async (systemPrompt, userPrompt, modelId, conversationId, token, signal) => {
  const response = await fetchWithAuth(
    EXECUTE_API_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildChatServiceBody(systemPrompt, userPrompt, modelId, false)),
      signal,
    },
    token
  );

  const text = await response.text();
  if (!text) return "";

  // 尝试解析 JSON
  try {
    const obj = JSON.parse(text);
    const content = pickTextFromResponse(obj);
    if (content) return stripThink(content);
  } catch {
    // ignore
  }

  // SSE 兼容
  if (text.includes("data:")) {
    const lines = text.split("\n");
    let accumulated = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const dataStr = trimmed.slice(5).trim();
      if (!dataStr || dataStr === "[DONE]") continue;
      try {
        const chunk = JSON.parse(dataStr);
        if (chunk.done === true) break;
        const picked = pickTextFromResponse(chunk);
        if (picked !== undefined) accumulated += String(picked);
      } catch {
        accumulated += dataStr;
      }
    }
    return stripThink(accumulated);
  }

  return stripThink(text);
};
