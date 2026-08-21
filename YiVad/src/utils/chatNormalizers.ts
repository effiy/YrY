import type { ChatMessage, SessionDocument } from "@/api/interface/yiweb";
import { normalizeEntries } from "@/api/interface/yiweb";

export function newKey(): string {
  return `aichat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").trim());
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

// Legacy sessions stored messages under `content`; normalize to `message` on load.
export function normalizeMessage(m: ChatMessage): ChatMessage {
  if (!m) return m;
  const message = m.message ?? m.content ?? "";
  return message === m.message ? m : { ...m, message };
}

export function normalizeSession(s: SessionDocument | null): SessionDocument | null {
  if (!s) return s;
  // Step 1: normalize legacy {content} → {message}
  const messages = (s.messages ?? []).map(normalizeMessage);
  // Step 2: normalize to ChatEntry format (backward compat with Pi-inspired entry types)
  // This is non-destructive: old ChatMessage objects are wrapped as entryType:"message"
  const entries = normalizeEntries(messages);
  // Store normalized entries as both messages (for backward compat) and entries (for new code)
  const result = messages === s.messages ? s : { ...s, messages };
  (result as any)._entries = entries;
  return result;
}