/**
 * AICR Chat store — active session, SSE streaming, message management.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getSession, upsertSession } from "@/api/modules/sessions";
import { streamChat, chat } from "@/api/modules/chatService";
import { streamRagChat, streamRagFileChat } from "@/api/modules/ragService";
import { uploadImageToOss } from "@/api/modules/fileService";
import { useAicrWeChatStore } from "@/stores/modules/aicr/weChat";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import type { ChatMessage, SessionDocument } from "@/api/interface/yiweb";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";

type SD = SessionDocument;

export const useAicrChatStore = defineStore("yivad-aicr-chat", () => {
  const activeSession = ref<SD | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const input = ref("");
  const draftImages = ref<string[]>([]);
  const sending = ref(false);
  const abortController = ref<AbortController | null>(null);
  const streamingTargetTimestamp = ref<number | null>(null);
  const streamingType = ref<"" | "send" | "regenerate" | "resend">("");
  const copyFeedback = ref<Record<string, string>>({});
  const feedback = ref<Record<number, "like" | "dislike" | null>>({});
  const scrollTick = ref(0);
  const contextEnabled = ref(true);
  const model = ref("qwen3.5");
  const systemPrompt = ref("You are a professional, concise, and reliable AI assistant.");
  const ragEnabled = ref(false);

  const messages = computed(() => activeSession.value?.messages ?? []);

  const SCROLL_THROTTLE_MS = 120;

  function isStreaming(msg: ChatMessage, _idx: number): boolean {
    if (!sending.value) return false;
    const targetTs = streamingTargetTimestamp.value;
    if (typeof targetTs !== "number") return false;
    return msg.timestamp === targetTs && msg.type === "pet";
  }

  async function selectSession(key: string) {
    // Abort any in-flight stream before switching — otherwise chunks would
    // write the old session's pet reply into the new session's message list
    // at the captured petIdx, corrupting it.
    if (sending.value) abortSend();
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

  /** Internal: stream a pet reply onto the active session, given the messages that should form the AI history. */
  function streamPetReply(history: ChatMessage[], petMsg: ChatMessage, type: "send" | "regenerate" | "resend") {
    sending.value = true;
    streamingType.value = type;
    streamingTargetTimestamp.value = petMsg.timestamp;

    // Identity for the in-flight pet message — robust against array mutations
    // (delete/move/edit) during streaming. Matches aiChat runStream pattern.
    const petTimestamp = petMsg.timestamp;

    let streamed = "";
    let lastScrollAt = 0;
    const systemParts: string[] = [];
    if (contextEnabled.value && systemPrompt.value) systemParts.push(systemPrompt.value);
    if (contextEnabled.value && activeSession.value?.pageContent) systemParts.push(String(activeSession.value.pageContent));

    function flushToStore() {
      if (!activeSession.value) return;
      const msgs = [...(activeSession.value.messages ?? [])];
      const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
      if (idx < 0) return;
      msgs[idx] = { ...petMsg };
      activeSession.value = { ...activeSession.value, messages: msgs };
      const now = Date.now();
      if (now - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now;
        scrollTick.value++;
      }
    }

    const onChunk = (chunk: string) => {
      streamed += chunk;
      petMsg.message = streamed;
      flushToStore();
    };

    const onSources = (sources: RagSource[]) => {
      petMsg.sources = sources;
      flushToStore();
    };

    const onDone = () => {
      sending.value = false;
      streamingType.value = "";
      streamingTargetTimestamp.value = null;
      abortController.value = null;
      if (activeSession.value) {
        upsertSession({ key: activeSession.value.key, messages: activeSession.value.messages }).catch(() => {});
        const pet = [...(activeSession.value.messages ?? [])].find(m => m.timestamp === petTimestamp);
        if (pet && !pet.aborted && !pet.error && streamed.trim()) {
          autoForwardToRobots(streamed);
        }
      }
    };

    const onError = (err: Error) => {
      sending.value = false;
      streamingType.value = "";
      streamingTargetTimestamp.value = null;
      abortController.value = null;
      petMsg.error = true;
      petMsg.message = streamed || `Error: ${err.message}`;
      if (!activeSession.value) return;
      const msgs = [...(activeSession.value.messages ?? [])];
      const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
      if (idx < 0) return;
      msgs[idx] = petMsg;
      activeSession.value = { ...activeSession.value, messages: msgs };
    };

    let abort: () => void;
    if (ragEnabled.value) {
      const fileTree = useAicrFileTreeStore();
      const filePath = fileTree.selectedKey || "";
      const handlers: RagStreamHandlers = { onChunk, onSources, onDone, onError };
      if (filePath) {
        // Single-file RAG — question is the last user message in history.
        const lastUser = [...history].reverse().find(m => m.type === "user");
        const question = (lastUser?.message ?? "").trim() || "Summarize this file.";
        abort = streamRagFileChat({ target_file: filePath, question }, handlers).abort;
      } else {
        // Full YiKnowledge RAG — scope to the active session's project
        // subtree when its file_path lives under projects/{name}/, so
        // answers lean on that project's story.md / scene.md / README.md
        // rather than the entire 151-doc knowledge base.
        const sessionPath = activeSession.value?.file_path || activeSession.value?.filePath || "";
        const projectMatch = sessionPath.match(/^projects\/([^/]+)\//);
        const scope = projectMatch ? `projects/${projectMatch[1]}/` : undefined;
        const ragMessages = history
          .filter(m => (m.message ?? "").trim().length > 0)
          .map(m => ({ role: m.type === "user" ? ("user" as const) : ("assistant" as const), content: m.message }));
        abort = streamRagChat({ messages: ragMessages, ...(scope ? { scope } : {}) }, handlers).abort;
      }
    } else {
      const result = streamChat(
        {
          model: model.value,
          messages: history,
          system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined
        },
        onChunk,
        onDone,
        onError
      );
      abort = result.abort;
    }
    abortController.value = { abort } as any;
  }

  async function sendMessage(text?: string) {
    // Guard against concurrent streams — the main Send button is disabled
    // while sending, but FaqManager's "Send First" button (and any other
    // caller that bypasses the input UI) is not. Without this guard, a
    // second streamPetReply would race the first: both write to
    // activeSession.messages, the second's abortController overwrites the
    // first (so the first can no longer be aborted), and onDone fires twice
    // with cross-contaminated petTimestamp lookups. Mirrors aiChat.ts
    // sendMessage line 483.
    if (sending.value) return;
    const content = text ?? input.value;
    if (!content.trim() && draftImages.value.length === 0) return;
    if (!activeSession.value) return;

    // Capture once and offset the pet timestamp by +1ms. If both messages get
    // Date.now() inside the same millisecond, their timestamps collide and
    // streamPetReply's onChunk findIndex(m => m.timestamp === petTimestamp)
    // would match the user message first, overwriting it with pet content.
    // Mirrors aiChat.ts sendMessage.
    const now = Date.now();
    const session = { ...activeSession.value };
    const msgs = [...(session.messages ?? [])];
    const userMsg: ChatMessage = {
      type: "user",
      message: content,
      timestamp: now,
      imageDataUrls: draftImages.value.length > 0 ? [...draftImages.value] : undefined
    };
    msgs.push(userMsg);
    session.messages = msgs;
    activeSession.value = session;
    input.value = "";
    draftImages.value = [];

    const petMsg: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    session.messages = [...msgs, petMsg];
    activeSession.value = { ...session };

    streamPetReply(msgs, petMsg, "send");
  }

  /** Re-run the user message at idx: drop everything from idx onward, re-send the user prompt with its images. */
  function resendMessageAt(idx: number) {
    if (!activeSession.value || sending.value) return;
    const msgs = [...activeSession.value.messages];
    const userMsg = msgs[idx];
    if (!userMsg || userMsg.type !== "user") return;
    const history = msgs.slice(0, idx);
    const newPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() };
    activeSession.value = { ...activeSession.value, messages: [...history, userMsg, newPet] };
    streamPetReply([...history, userMsg], newPet, "resend");
  }

  /** Regenerate the pet reply at idx: keep everything before idx, re-stream from the last user message before idx. */
  function regenerateMessageAt(idx: number) {
    if (!activeSession.value || sending.value) return;
    const msgs = [...activeSession.value.messages];
    const pet = msgs[idx];
    if (!pet || pet.type !== "pet") return;
    // Find the last user message before idx.
    let userIdx = idx - 1;
    while (userIdx >= 0 && msgs[userIdx].type !== "user") userIdx--;
    if (userIdx < 0) return;
    const userMsg = msgs[userIdx];
    const history = msgs.slice(0, userIdx + 1);
    const newPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() };
    activeSession.value = { ...activeSession.value, messages: [...history, newPet] };
    scrollTick.value++;
    streamPetReply(history, newPet, "regenerate");
  }

  /** Retry the last failed/aborted pet reply — mirrors aiChat.ts retryLastMessage. */
  function retryLastMessage() {
    if (!activeSession.value || sending.value) return;
    const msgs = [...(activeSession.value.messages ?? [])];
    if (msgs.length === 0) return;
    let petIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].type === "pet") {
        petIdx = i;
        break;
      }
    }
    if (petIdx < 0) return;
    const pet = msgs[petIdx];
    if (!pet || (!pet.error && !pet.aborted)) return;
    regenerateMessageAt(petIdx);
  }

  function copyMessage(message: ChatMessage) {
    const text = message.message ?? "";
    if (!text) return;
    const key = String(message.timestamp);
    navigator.clipboard.writeText(text).then(() => {
      copyFeedback.value = { ...copyFeedback.value, [key]: "Copied" };
      setTimeout(() => {
        copyFeedback.value = { ...copyFeedback.value, [key]: "" };
      }, 2000);
    });
  }

  function submitFeedback(timestamp: number, rating: "like" | "dislike") {
    const current = feedback.value[timestamp];
    feedback.value = { ...feedback.value, [timestamp]: current === rating ? null : rating };
  }

  function clearInput() {
    input.value = "";
    draftImages.value = [];
  }

  /** Persist the active session to the backend. Mirrors aiChat.ts persistActive. */
  async function persistActive() {
    if (!activeSession.value) return;
    try {
      await upsertSession({
        key: activeSession.value.key,
        messages: activeSession.value.messages,
        updatedAt: Date.now()
      });
    } catch {
      /* ignore */
    }
  }

  function editMessage(idx: number, newContent: string) {
    if (!activeSession.value) return;
    const msgs = [...activeSession.value.messages];
    if (!msgs[idx]) return;
    msgs[idx] = { ...msgs[idx], message: newContent };
    activeSession.value = { ...activeSession.value, messages: msgs };
    upsertSession({ key: activeSession.value.key, messages: msgs }).catch(() => {});
  }

  function deleteMessage(idx: number) {
    if (!activeSession.value) return;
    const msgs = [...activeSession.value.messages];
    msgs.splice(idx, 1);
    activeSession.value = { ...activeSession.value, messages: msgs };
    upsertSession({ key: activeSession.value.key, messages: msgs }).catch(() => {});
  }

  function abortSend() {
    // Capture the in-flight pet's timestamp before clearing it — we need it
    // to reliably find the pet message below. If the user deleted or moved
    // messages during streaming, the pet might no longer be the last message,
    // so `msgs[length-1]` would mark the wrong one (or skip if not a pet).
    // Mirrors aiChat.ts stopSending.
    const targetTs = streamingTargetTimestamp.value;
    abortController.value?.abort();
    sending.value = false;
    streamingType.value = "";
    streamingTargetTimestamp.value = null;
    abortController.value = null;
    if (targetTs !== null && activeSession.value) {
      const msgs = [...(activeSession.value.messages ?? [])];
      const idx = msgs.findIndex(m => m.timestamp === targetTs);
      if (idx >= 0) {
        const cur = msgs[idx];
        const trimmed = String(cur.message || "").trim();
        msgs[idx] = { ...cur, aborted: true, error: false, message: trimmed || "Stopped" };
        activeSession.value = { ...activeSession.value, messages: msgs };
        upsertSession({ key: activeSession.value.key, messages: msgs }).catch(() => {});
      }
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const dataUrl = await fileToDataUrl(file);
    return uploadImageToOss(dataUrl, "aicr/images");
  }

  function addDraftImage(dataUrl: string) {
    if (draftImages.value.length >= 4) return;
    draftImages.value = [...draftImages.value, dataUrl];
  }

  function removeDraftImage(idx: number) {
    draftImages.value = draftImages.value.filter((_, i) => i !== idx);
  }

  function clearDraftImages() {
    draftImages.value = [];
  }

  async function sendToWeChatRobot(robotIdx: number, msgIdx: number) {
    const weChatStore = useAicrWeChatStore();
    const msg = messages.value[msgIdx];
    if (!msg) return;
    await weChatStore.sendMessage(robotIdx, msg.message);
  }

  /** Non-streaming AI call for context-optimize / translate / etc. Returns the model's reply text. */
  async function askOnce(userPrompt: string): Promise<string> {
    return chat({
      model: model.value,
      messages: [{ type: "user", message: userPrompt, timestamp: Date.now() }],
      stream: false,
      system: systemPrompt.value
    });
  }

  /** Fire-and-forget: send a completed pet reply to every robot with autoForward=true. */
  function autoForwardToRobots(content: string) {
    if (!content) return;
    try {
      const weChatStore = useAicrWeChatStore();
      for (const r of weChatStore.robots) {
        if (r.enabled && r.autoForward) {
          weChatStore.sendMessage(weChatStore.robots.indexOf(r), content).catch(() => {});
        }
      }
    } catch {
      /* store not initialized yet — ignore */
    }
  }

  const welcomeCard = computed(() => {
    const s = activeSession.value;
    if (!s) return null;
    return {
      url: s.url || "",
      title: s.title || s.pageTitle || "",
      description: s.pageDescription || "",
      tags: Array.isArray(s.tags) ? s.tags.filter(t => t && t.trim()) : [],
      messageCount: (s.messages ?? []).length,
      userMessageCount: (s.messages ?? []).filter(m => m.type === "user").length,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    };
  });

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
    feedback,
    scrollTick,
    contextEnabled,
    model,
    systemPrompt,
    ragEnabled,
    messages,
    welcomeCard,
    isStreaming,
    selectSession,
    sendMessage,
    resendMessageAt,
    regenerateMessageAt,
    retryLastMessage,
    editMessage,
    deleteMessage,
    abortSend,
    uploadImage,
    addDraftImage,
    removeDraftImage,
    clearDraftImages,
    clearInput,
    copyMessage,
    submitFeedback,
    persistActive,
    sendToWeChatRobot,
    askOnce
  };
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
