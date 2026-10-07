/**
 * useKnowledgeChatMessages — Message state, persistence, and action methods
 * for the KnowledgeChatPanel.
 */
import { computed, ref, watch, type Ref } from "vue";
import type { RagSource } from "@/api/interface/rag";
import { formatAbsolute } from "@/utils/datetime";
import { confirm } from "@/hooks/useConfirmAction";

export interface LocalMessage {
  type: "user" | "pet";
  message: string;
  timestamp: number;
  imageDataUrls?: string[];
  error?: boolean;
  aborted?: boolean;
  sources?: RagSource[];
  searchContext?: string;
}

export interface MessagesDeps {
  filePath: Ref<string>;
  ragEnabled: Ref<boolean>;
  webSearchEnabled: Ref<boolean>;
  sending: Ref<boolean>;
  draftImages: Ref<string[]>;
  input: Ref<string>;
  doWebSearch: (query: string) => Promise<string>;
  forwardToWechat: (text: string) => Promise<void>;
  renderMermaid: () => void;
  openInAiChat: (opts: { title: string; pageContent: string; tags: string[] }) => Promise<string | null>;
}

export function useKnowledgeChatMessages(deps: MessagesDeps) {
  const { filePath, ragEnabled, webSearchEnabled, sending, draftImages, input, doWebSearch, forwardToWechat, renderMermaid, openInAiChat } = deps;

  const STORAGE_PREFIX = "kchat:msgs:";
  const messages = ref<LocalMessage[]>([]);
  const streamingText = ref("");
  const abortRef = ref<{ abort: () => void } | null>(null);
  const scrollTick = ref(0);
  const copyFeedback = ref<Record<string, string>>({});

  const msgKey = computed(() => `${STORAGE_PREFIX}${filePath.value}`);

  function loadMessages() {
    try {
      const raw = localStorage.getItem(msgKey.value);
      if (raw) messages.value = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  function saveMessages() {
    try { localStorage.setItem(msgKey.value, JSON.stringify(messages.value)); } catch { /* ignore */ }
  }

  function finishSend(petIdx: number) {
    sending.value = false;
    streamingText.value = "";
    abortRef.value = null;
    saveMessages();
    const petText = messages.value[petIdx]?.message;
    if (petText) forwardToWechat(petText);
    renderMermaid();
  }

  function handleSendError(petIdx: number, err: Error) {
    sending.value = false;
    streamingText.value = "";
    abortRef.value = null;
    messages.value[petIdx] = {
      ...messages.value[petIdx],
      message: messages.value[petIdx].message || `Error: ${err.message}`,
      error: true
    };
    saveMessages();
  }

  function stopSending() {
    abortRef.value?.abort();
    if (messages.value.length) {
      const last = messages.value[messages.value.length - 1];
      if (last.type === "pet") {
        messages.value[messages.value.length - 1] = { ...last, aborted: true };
      }
    }
    sending.value = false;
    abortRef.value = null;
    saveMessages();
  }

  const hasMessages = computed(() => messages.value.length > 0);
  const isStreaming = (msg: LocalMessage, idx: number) => sending.value && idx === messages.value.length - 1 && msg.type === "pet";

  function timeLabel(ts: number) { return formatAbsolute(ts); }

  function dedupSources(sources: RagSource[]): RagSource[] {
    const seen = new Map<string, RagSource>();
    for (const s of sources) {
      const existing = seen.get(s.file_path);
      if (!existing || s.score > existing.score) seen.set(s.file_path, s);
    }
    return [...seen.values()].sort((a, b) => b.score - a.score);
  }

  async function copyMessage(msg: LocalMessage) {
    const text = msg.message ?? "";
    try {
      await navigator.clipboard.writeText(text);
      copyFeedback.value = { ...copyFeedback.value, [String(msg.timestamp)]: "Copied!" };
      setTimeout(() => {
        copyFeedback.value = { ...copyFeedback.value, [String(msg.timestamp)]: "" };
      }, 2000);
    } catch { /* ignore */ }
  }

  async function promoteToStandaloneSession(idx: number) {
    const history = messages.value
      .slice(0, idx + 1)
      .filter(m => (m.message ?? "").trim())
      .map(m => `**${m.type === "user" ? "User" : "Assistant"}:** ${m.message ?? ""}`);
    const transcript = history.length ? ["", "## Conversation so far", "", ...history].join("\n") : "";
    const fp = filePath.value;
    const pageContent = [
      `# Knowledge file chat: \`${fp}\``, "",
      `**File:** \`${fp}\``, ...(ragEnabled.value ? [`**RAG scope:** \`${fp}\``] : []), transcript
    ].join("\n");
    const tags = [`ctx:${fp}`, `file:${fp}`, "knowledge", "knowledge-chat"];
    await openInAiChat({ title: `Knowledge chat: ${fp.split("/").pop() || fp}`, pageContent, tags });
  }

  async function editMessage(idx: number) {
    const msg = messages.value[idx];
    if (!msg) return;
    let res: { value?: string } | null = null;
    try {
      res = await ElMessageBox.prompt("Enter new content", "Edit message", {
        confirmButtonText: "Save", cancelButtonText: "Cancel", inputValue: msg.message ?? ""
      });
    } catch { return; }
    const next = (res?.value ?? "").trim();
    if (!next) return;
    messages.value[idx] = { ...msg, message: next };
    saveMessages();
  }

  async function deleteMessage(idx: number) {
    const msg = messages.value[idx];
    if (!msg) return;
    const ok = await confirm("Delete this message?", "Confirm delete");
    if (!ok) return;
    messages.value.splice(idx, 1);
    saveMessages();
  }

  async function regenerateMessage(petIdx: number) {
    if (sending.value) return;
    const userIdx = petIdx - 1;
    if (userIdx < 0 || messages.value[userIdx]?.type !== "user") return;
    const userMsg = messages.value[userIdx];
    messages.value.splice(petIdx, 1);
    saveMessages();
    input.value = userMsg.message;
    if (userMsg.imageDataUrls?.length) draftImages.value = [...userMsg.imageDataUrls];
    return userMsg;
  }

  async function resendMessage(idx: number) {
    if (sending.value) return;
    const msg = messages.value[idx];
    if (!msg || msg.type !== "user") return;
    messages.value.splice(idx);
    saveMessages();
    input.value = msg.message;
    if (msg.imageDataUrls?.length) draftImages.value = [...msg.imageDataUrls];
    return msg;
  }

  async function searchWebResend(idx: number) {
    webSearchEnabled.value = true;
    return resendMessage(idx);
  }

  return {
    messages, streamingText, abortRef, scrollTick, copyFeedback, msgKey,
    loadMessages, saveMessages, finishSend, handleSendError, stopSending,
    hasMessages, isStreaming, timeLabel, dedupSources,
    copyMessage, promoteToStandaloneSession, editMessage, deleteMessage,
    regenerateMessage, resendMessage, searchWebResend
  };
}