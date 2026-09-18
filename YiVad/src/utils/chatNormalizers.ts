import type { SessionDocument } from "@/api/interface/yiAi";

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

export function normalizeSession(s: SessionDocument | null): SessionDocument | null {
  if (!s) return s;
  const messages = (s.messages ?? []).map(m => (m ? { ...m, message: m.message ?? "" } : m));
  return messages === s.messages ? s : { ...s, messages };
}
