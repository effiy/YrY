/**
 * useUiToggles — UI toggle methods for the AI chat store.
 * Handles session edit, tag manager, WeChat, LlamaIndex panel visibility.
 */
import type { Ref } from "vue";
import type { SessionDocument } from "@/api/interface/yiAi";

export interface UiTogglesDeps {
  activeConversation: Ref<SessionDocument | null>;
  sessionEditVisible: Ref<boolean>;
  tagManagerVisible: Ref<boolean>;
  weChatVisible: Ref<boolean>;
  llamaIndexVisible: Ref<boolean>;
  systemPrompt: Ref<string>;
  updateSessionMeta: (key: string, patch: Partial<SessionDocument>) => Promise<void>;
}

export function useUiToggles(deps: UiTogglesDeps) {
  const { activeConversation, sessionEditVisible, tagManagerVisible, weChatVisible, llamaIndexVisible, systemPrompt, updateSessionMeta } = deps;

  function openSessionEdit() {
    if (!activeConversation.value) return;
    sessionEditVisible.value = true;
  }

  function closeSessionEdit() {
    sessionEditVisible.value = false;
  }

  function openTagManager() {
    if (!activeConversation.value) return;
    tagManagerVisible.value = true;
  }

  function closeTagManager() {
    tagManagerVisible.value = false;
  }

  function toggleTagManager() {
    if (!activeConversation.value) return;
    tagManagerVisible.value = !tagManagerVisible.value;
  }

  function openWeChat() {
    weChatVisible.value = true;
  }

  function closeWeChat() {
    weChatVisible.value = false;
  }

  function openLlamaIndex() {
    llamaIndexVisible.value = true;
  }

  function closeLlamaIndex() {
    llamaIndexVisible.value = false;
  }

  function toggleLlamaIndex() {
    llamaIndexVisible.value = !llamaIndexVisible.value;
  }

  async function addTag(name: string) {
    const trimmed = name.trim();
    const s = activeConversation.value;
    if (!s || !trimmed) return;
    const existing = s.tags ?? [];
    if (existing.includes(trimmed)) return;
    const next = [...existing, trimmed];
    await updateSessionMeta(s.key, { tags: next });
  }

  async function removeTag(name: string) {
    const s = activeConversation.value;
    if (!s) return;
    const next = (s.tags ?? []).filter(t => t !== name);
    await updateSessionMeta(s.key, { tags: next });
  }

  function setSystemPrompt(text: string) {
    systemPrompt.value = (text || "").trim();
  }

  return {
    openSessionEdit, closeSessionEdit,
    openTagManager, closeTagManager, toggleTagManager,
    openWeChat, closeWeChat,
    openLlamaIndex, closeLlamaIndex, toggleLlamaIndex,
    addTag, removeTag,
    setSystemPrompt
  };
}