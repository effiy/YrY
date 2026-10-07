/**
 * useMessageOps — Message-level operations for the AI chat store.
 * Handles delete, edit, and copy for individual messages.
 */
import type { Ref } from "vue";
import type { ChatMessage, SessionDocument } from "@/api/interface/yiAi";

export interface MessageOpsDeps {
  sending: Ref<boolean>;
  activeConversation: Ref<SessionDocument | null>;
  persistActive: () => Promise<boolean>;
  copyFeedback: Ref<Record<string, string>>;
}

export function useMessageOps(deps: MessageOpsDeps) {
  const { sending, activeConversation, persistActive, copyFeedback } = deps;

  async function deleteMessage(idx: number) {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;

    const nextMessages = messages.filter((_, j) => j !== i);
    activeConversation.value = { ...s, messages: nextMessages, updatedAt: Date.now() };
    const ok = await persistActive();
    if (!ok) {
      activeConversation.value = { ...s, messages, updatedAt: s.updatedAt };
    }
  }

  async function editMessage(idx: number, content: string) {
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const m = messages[i];
    if (!m) return;
    const nextMessages = [...messages];
    nextMessages[i] = { ...m, message: content };
    activeConversation.value = { ...s, messages: nextMessages, updatedAt: Date.now() };
    await persistActive();
  }

  function copyMessage(message: ChatMessage) {
    const text = message.message ?? "";
    if (!text) return;
    const key = String(message.timestamp);
    navigator.clipboard.writeText(text).then(() => {
      copyFeedback.value = { ...copyFeedback.value, [key]: "copied" };
      setTimeout(() => {
        copyFeedback.value = { ...copyFeedback.value, [key]: "" };
      }, 2000);
    });
  }

  return { deleteMessage, editMessage, copyMessage };
}