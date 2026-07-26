/**
 * AICR Chat store — active session, SSE streaming, message management.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getSession, upsertSession } from "@/api/modules/sessions";
import { streamChat } from "@/api/modules/chatService";
import type { ChatMessage } from "@/api/interface/yiweb";
type _SD = import("@/api/interface/yiweb").SessionDocument;

export const useAicrChatStore = defineStore("yivad-aicr-chat", () => {
  const activeSession = ref<_SD | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const input = ref("");
  const draftImages = ref<string[]>([]);
  const sending = ref(false);
  const abortController = ref<AbortController | null>(null);
  const streamingTargetTimestamp = ref<number | null>(null);
  const streamingType = ref("");
  const copyFeedback = ref<Record<string, string>>({});
  const contextEnabled = ref(true);

  const chatMessages = computed(() => (session: _SD | null): ChatMessage[] => {
    return session?.messages ?? [];
  });

  function isStreaming(msg: ChatMessage, idx: number): boolean {
    if (!sending.value) return false;
    const msgs = activeSession.value?.messages ?? [];
    return idx === msgs.length - 1 && msg.type === "pet";
  }

  async function selectSession(key: string) {
    loading.value = true;
    error.value = null;
    try {
      activeSession.value = await getSession(key);
    } catch (e: any) {
      error.value = e?.message || "Failed to load session";
    } finally {
      loading.value = false;
    }
  }

  function clearSession() {
    activeSession.value = null;
  }

  async function sendMessage(text?: string) {
    const content = text ?? input.value;
    if (!content.trim() && draftImages.value.length === 0) return;
    if (!activeSession.value) return;

    const session = { ...activeSession.value };
    const messages = [...(session.messages ?? [])];
    const userMsg: ChatMessage = {
      type: "user",
      message: content,
      timestamp: Date.now(),
      imageDataUrls: draftImages.value.length > 0 ? [...draftImages.value] : undefined
    };
    messages.push(userMsg);
    session.messages = messages;
    activeSession.value = session;
    input.value = "";
    draftImages.value = [];

    sending.value = true;
    streamingTargetTimestamp.value = Date.now();

    // Build message history for AI
    const aiMessages = messages.map(m => ({
      type: m.type,
      message: m.message,
      timestamp: m.timestamp
    }));

    const petMsg: ChatMessage = {
      type: "pet",
      message: "",
      timestamp: Date.now()
    };

    let streamedContent = "";

    const { abort } = streamChat(
      { messages: aiMessages, model: "qwen3.5" },
      chunk => {
        streamedContent += chunk;
        petMsg.message = streamedContent;
        // Update the last message in the session
        const msgs = [...(activeSession.value?.messages ?? [])];
        if (msgs.length > 0) {
          msgs[msgs.length - 1] = { ...petMsg };
        } else {
          msgs.push({ ...petMsg });
        }
        if (activeSession.value) {
          activeSession.value = { ...activeSession.value, messages: msgs };
        }
      },
      () => {
        // Done — save back
        sending.value = false;
        streamingTargetTimestamp.value = null;
        if (activeSession.value && streamedContent) {
          upsertSession({
            key: activeSession.value.key,
            messages: activeSession.value.messages
          }).catch(() => {
            /* ignore */
          });
        }
      },
      err => {
        sending.value = false;
        streamingTargetTimestamp.value = null;
        petMsg.error = true;
        petMsg.message = streamedContent || `Error: ${err.message}`;
        const msgs = [...(activeSession.value?.messages ?? [])];
        if (msgs.length > 0) msgs[msgs.length - 1] = petMsg;
        else msgs.push(petMsg);
        if (activeSession.value) {
          activeSession.value = { ...activeSession.value, messages: msgs };
        }
      }
    );

    abortController.value = { abort } as any;
  }

  function abortSend() {
    abortController.value?.abort();
    sending.value = false;
  }

  function deleteMessage(idx: number) {
    if (!activeSession.value) return;
    const msgs = [...activeSession.value.messages];
    msgs.splice(idx, 1);
    activeSession.value = { ...activeSession.value, messages: msgs };
    upsertSession({ key: activeSession.value.key, messages: msgs }).catch(() => {
      /* ignore */
    });
  }

  function moveMessageUp(idx: number) {
    if (!activeSession.value || idx <= 0) return;
    const msgs = [...activeSession.value.messages];
    [msgs[idx - 1], msgs[idx]] = [msgs[idx], msgs[idx - 1]];
    activeSession.value = { ...activeSession.value, messages: msgs };
  }

  function moveMessageDown(idx: number) {
    if (!activeSession.value || idx >= activeSession.value.messages.length - 1) return;
    const msgs = [...activeSession.value.messages];
    [msgs[idx], msgs[idx + 1]] = [msgs[idx + 1], msgs[idx]];
    activeSession.value = { ...activeSession.value, messages: msgs };
  }

  return {
    activeSession,
    loading,
    error,
    input,
    draftImages,
    sending,
    streamingTargetTimestamp,
    streamingType,
    copyFeedback,
    contextEnabled,
    chatMessages,
    isStreaming,
    selectSession,
    clearSession,
    sendMessage,
    abortSend,
    deleteMessage,
    moveMessageUp,
    moveMessageDown
  };
});
