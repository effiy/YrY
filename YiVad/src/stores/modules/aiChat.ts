/**
 * AI Chat store — conversation list, active session, SSE streaming via
 * `streamChat`, message persistence through the YiWeb sessions API.
 *
 * Mirrors the code review chat store shape, extended with a
 * conversation sidebar and per-message feedback.
 */
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { useToolRegistry } from "@/hooks/useToolRegistry";
import { useConversationTree } from "@/hooks/useConversationTree";
import { useContextChanges } from "@/hooks/useContextChanges";
import { registerAiChatTools } from "@/hooks/useAiChatTools";
import { useSlashCommands } from "@/hooks/useSlashCommands";
import { useRagSettings } from "@/views/ai-chat/composables/useRagSettings";
import { useChatUiState } from "@/views/ai-chat/composables/useChatUiState";
import { useToolExecution } from "@/views/ai-chat/composables/useToolExecution";
import { useConversationCompact } from "@/views/ai-chat/composables/useConversationCompact";
import { usePromptTemplates } from "@/views/ai-chat/composables/usePromptTemplates";
import { useModelSelection } from "@/views/ai-chat/composables/useModelSelection";
import { getSessions, getSession, upsertSession, updateSession, deleteSession } from "@/api/modules/sessions";
import { streamChat } from "@/api/modules/chatService";
import { streamRagChat } from "@/api/modules/ragService";
import { queryDocuments } from "@/api/modules/dataService";
import { loadRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import { getStorageQuota } from "@/utils/storage";
import type { WebSearchResult, WebImageResult } from "@/api/modules/searchService";
import type { SessionDocument, ChatMessage, FaqDocument } from "@/api/interface/yiAi";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";
import type { AiChatStreamingType } from "@/views/ai-chat/types";
import { DEFAULT_MODEL } from "@/views/ai-chat/constants";

import { loadBool, saveBool } from "@/utils/storage";
import { newKey, readFileAsDataUrl, normalizeSession } from "@/utils/chatNormalizers";

const STORAGE_ACTIVE_KEY = "aiChat.activeKey";
const STORAGE_WEB_KEY = "aiChat.webSearchEnabled";
const MAX_DRAFT_IMAGES = 4;
const SCROLL_THROTTLE_MS = 80;

export const useAiChatStore = defineStore("yivad-aiChat", () => {
  const conversations = ref<SessionDocument[]>([]);
  const activeConversation = ref<SessionDocument | null>(null);
  const knowledgeSidebarVisible = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const input = ref("");
  const sending = ref(false);
  const abortController = ref<{ abort: () => void } | null>(null);
  // Separate abort controller for tool execution (web fetch, web search).
  // Aborted when user clicks Stop, independent of the SSE stream abort.
  const toolAbortController = ref<AbortController | null>(null);
  const streamingTargetTimestamp = ref<number | null>(null);
  const streamingType = ref<AiChatStreamingType>("");
  /** Timestamp (Date.now()) when the current stream entered "thinking" phase.
   *  Reset to null when streaming ends. PetMessage uses this to show elapsed time. */
  const thinkingStartTs = ref<number | null>(null);

  // ── Streaming phase (Pi-inspired: turn_start/message_start/message_end) ──
  // Tracks the current phase of the AI interaction for richer UI feedback.
  type StreamingPhase = "idle" | "fetching" | "preparing" | "thinking" | "retrieving" | "streaming" | "done";
  const streamingPhase = ref<StreamingPhase>("idle");

  const scrollTick = ref(0);
  const copyFeedback = ref<Record<string, string>>({});
  const draftImages = ref<string[]>([]);
  const faqs = ref<FaqDocument[]>([]);
  const faqLoading = ref(false);
  let faqLoaded = false;
  const conversationsLoaded = ref(false);

  // RAG toggle — user-controlled. Persisted to localStorage via useRagSettings.
  const { ragEnabled, ragHybrid, ragRerank, ragCitations, ragHyde, ragScope, ragNumQueries, ragChatMode } = useRagSettings();

  // UI state — extracted to useChatUiState composable.
  const {
    faqVisible,
    faqSearch,
    faqApplyMode,
    weChatVisible,
    tagManagerVisible,
    llamaIndexVisible,
    sessionEditVisible,
    contextEditorVisible,
    contextEditorDraft,
    contextPanelNewMode,
    batchMode,
    selectedKeys,
    clearSelection
  } = useChatUiState();

  // Model selection — extracted to useModelSelection composable.
  const { selectedModel, availableModels, modelsLoading, fetchModels } = useModelSelection();

  // Prompt templates — extracted to usePromptTemplates composable.
  const { promptTemplates, addTemplate, removeTemplate, applyTemplate } = usePromptTemplates();

  // Web search toggle — defaults off every session.
  const webSearchEnabled = ref(false);

  // Results from the most recent web search (displayed in the message bubble).
  const webSearchResults = ref<WebSearchResult[]>([]);

  // Image results from the most recent web search.
  const webSearchImages = ref<WebImageResult[]>([]);

  // True while web search API call is in-flight.
  const webSearching = ref(false);

  // Search timing for the most recent web search (ms).
  const searchTimingMs = ref(0);

  // The refined query that was actually searched (for display in results header).
  const lastSearchQuery = ref("");

  // ── Tool Registry (Pi-inspired pluggable tools) ──
  const {
    tools: _tools,
    toolEvents,
    activeTools,
    allTools,
    registerTool,
    setToolEnabled,
    executeTool,
    getToolsForSystemPrompt
  } = useToolRegistry();

  const { searchQuery, expandedFolders, toggleFolder, conversationTree, filteredConversationTree, isStreaming } =
    useConversationTree({ conversations, sending, streamingTargetTimestamp });

  // True when RAG is enabled by the user — no longer requires ctx: tags.
  // RAG toggle alone is sufficient to activate knowledge-base-grounded chat.
  const ragActive = computed(() => ragEnabled.value);

  // Auto-sync tool enabled states with store toggles (Pi pattern: tools are
  // reactive to session state, not separate manual toggles).
  watch(
    [ragEnabled, ragActive, webSearchEnabled],
    () => {
      setToolEnabled("web_search", webSearchEnabled.value);
      setToolEnabled("web_fetch", webSearchEnabled.value);
      setToolEnabled("rag_search", ragEnabled.value && ragActive.value);
      setToolEnabled("context_edit", ragActive.value);
    },
    { immediate: true }
  );

  // Transient per-message system prompt — set by callers (e.g. story's
  // file-preview chat passes the file content as context) and consumed by
  // runStream on the next send. Not persisted: file content changes between
  // previews, so storing it on the session would go stale.
  const systemPrompt = ref("");

  const messages = computed<ChatMessage[]>(() => activeConversation.value?.messages ?? []);

  function rememberActive(key: string) {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, key);
    } catch {
      /* ignore */
    }
  }

  function forgetActive() {
    try {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }

  async function loadConversations() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      const list = (await getSessions()).map(normalizeSession).filter(Boolean) as SessionDocument[];
      conversations.value = list.sort((a, b) => {
        if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
        return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
      });
      if (!activeConversation.value && list.length) {
        let savedKey: string | null = null;
        try {
          savedKey = localStorage.getItem(STORAGE_ACTIVE_KEY);
        } catch {
          /* ignore */
        }
        const target = (savedKey && list.find(c => c.key === savedKey)) || list[0];
        await selectConversation(target.key);
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load conversations";
    } finally {
      loading.value = false;
      conversationsLoaded.value = true;
    }
  }

  function sortConversations() {
    conversations.value = [...conversations.value].sort((a, b) => {
      if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    });
  }

  async function toggleFavorite(key: string) {
    const target = conversations.value.find(c => c.key === key);
    if (!target) return;
    const next = !target.isFavorite;
    try {
      await upsertSession({ key, isFavorite: next, updatedAt: Date.now() });
      target.isFavorite = next;
      sortConversations();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to toggle favorite";
    }
  }

  function toggleBatchMode() {
    batchMode.value = !batchMode.value;
    if (!batchMode.value) selectedKeys.value = new Set();
  }

  function toggleSelection(key: string) {
    const s = new Set(selectedKeys.value);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    selectedKeys.value = s;
  }

  function selectAll(keys: string[]) {
    selectedKeys.value = new Set(keys);
  }

  async function bulkDelete() {
    const keys = [...selectedKeys.value];
    if (!keys.length) return;
    await Promise.all(keys.map(k => deleteSession(k).catch(() => {})));
    const keySet = new Set(keys);
    conversations.value = conversations.value.filter(c => !keySet.has(c.key));
    if (activeConversation.value && keySet.has(activeConversation.value.key)) {
      activeConversation.value = null;
      forgetActive();
      if (conversations.value.length) {
        await selectConversation(conversations.value[0].key);
      }
    }
    selectedKeys.value = new Set();
    batchMode.value = false;
  }

  async function clearAllConversations() {
    const keys = conversations.value.map(c => c.key);
    if (!keys.length) return;
    await Promise.all(keys.map(k => deleteSession(k).catch(() => {})));
    conversations.value = [];
    activeConversation.value = null;
    forgetActive();
    selectedKeys.value = new Set();
    batchMode.value = false;
  }

  async function selectConversation(key: string) {
    if (activeConversation.value?.key === key) return;
    // Abort any in-flight stream before switching — otherwise the old stream
    // keeps running, and its onDone handler persists the wrong session while
    // the old pet message is abandoned as empty text. Mirrors the SSE abort fix.
    if (sending.value) stopSending();
    loading.value = true;
    error.value = null;
    try {
      const session = normalizeSession(await getSession(key));
      activeConversation.value = session;
      rememberActive(key);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load conversation";
    } finally {
      loading.value = false;
    }
  }

  async function createConversation(title?: string, pageContent?: string, tags?: string[]) {
    const key = newKey();
    const now = Date.now();
    const session: SessionDocument = {
      key,
      url: "",
      title: title || "New chat",
      pageTitle: "",
      pageDescription: "",
      pageContent: pageContent || "",
      messages: [],
      tags: tags || [],
      createdAt: now,
      updatedAt: now
    };
    try {
      await upsertSession(session);
      conversations.value = [session, ...conversations.value];
      activeConversation.value = session;
      rememberActive(key);
      input.value = "";
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to create conversation";
    }
    return key;
  }

  async function renameConversation(key: string, title: string) {
    const target = conversations.value.find(c => c.key === key);
    if (!target) return;
    const patch = { ...target, title, updatedAt: Date.now() };
    try {
      await upsertSession(patch);
      conversations.value = conversations.value.map(c => (c.key === key ? patch : c));
      if (activeConversation.value?.key === key) {
        activeConversation.value = patch;
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to rename conversation";
    }
  }

  /** Patch editable meta fields onto a session. */
  async function updateSessionMeta(
    key: string,
    meta: {
      title?: string;
      pageDescription?: string;
      pageTitle?: string;
      pageContent?: string;
      tags?: string[];
    }
  ) {
    const target = conversations.value.find(c => c.key === key);
    if (!target) return;
    const updatedAt = Date.now();
    try {
      await updateSession(key, { ...meta, updatedAt });
      const isActive = activeConversation.value?.key === key;
      // Use live messages from activeConversation (if active) — conversations.value
      // lags behind during streaming and would roll back streamed content.
      const liveMessages = isActive ? activeConversation.value!.messages : target.messages;
      const patch = { ...target, ...meta, messages: liveMessages, updatedAt };
      conversations.value = conversations.value.map(c => (c.key === key ? patch : c));
      if (isActive) activeConversation.value = patch;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to update session";
    }
  }

  /** Export the active conversation as markdown and trigger a download. */
  function exportConversation() {
    const s = activeConversation.value;
    if (!s) return;
    const lines: string[] = [];
    lines.push(`# ${s.title || "Chat"}`);
    lines.push("");
    lines.push(`> Exported: ${new Date().toISOString()}`);
    if (s.pageContent) {
      lines.push("");
      lines.push("## Context");
      lines.push("");
      lines.push(s.pageContent);
    }
    lines.push("");
    lines.push("## Conversation");
    lines.push("");
    for (const m of s.messages ?? []) {
      const role = m.type === "user" ? "**User**" : m.type === "followup" ? "**Follow-up (queued)**" : "**AI**";
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
      lines.push(`### ${role} ${time ? `(${time})` : ""}`);
      lines.push("");
      lines.push(m.message || "_(empty)_");
      lines.push("");
      if (m.toolCalls?.length) {
        for (const tc of m.toolCalls) {
          lines.push(`<details>`);
          lines.push(`<summary>Tool: \`${tc.name}\`</summary>`);
          lines.push("");
          if (tc.content) {
            lines.push("```");
            lines.push(tc.content);
            lines.push("```");
          }
          lines.push("");
          lines.push(`</details>`);
          lines.push("");
        }
      }
    }
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(s.title || "chat").replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportConversationHtml() {
    const s = activeConversation.value;
    if (!s) return;
    const title = s.title || "Chat";
    const exported = new Date().toISOString();
    const parts: string[] = [];
    parts.push(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
  h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
  .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
  .msg { margin: 1.5rem 0; padding: 1rem; border-radius: 8px; }
  .msg--user { background: #f3f4f6; }
  .msg--ai { background: #eff6ff; border-left: 3px solid #3b82f6; }
  .msg__role { font-weight: 600; font-size: 0.8rem; text-transform: uppercase; color: #6b7280; margin-bottom: 0.5rem; }
  .msg__time { font-weight: 400; color: #9ca3af; }
  .msg__content { white-space: pre-wrap; }
  .msg__content img { max-width: 100%; }
  details { margin-top: 0.75rem; }
  summary { cursor: pointer; color: #3b82f6; font-size: 0.875rem; }
  pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8125rem; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.875em; }
  @media (prefers-color-scheme: dark) {
    body { background: #111827; color: #f9fafb; }
    .msg--user { background: #1f2937; }
    .msg--ai { background: #1e3a5f; border-left-color: #60a5fa; }
    .meta, .msg__role { color: #9ca3af; }
    h1 { border-bottom-color: #374151; }
  }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p class="meta">Exported: ${exported}</p>`);

    if (s.pageContent) {
      parts.push(`<h2>Context</h2>`);
      parts.push(`<pre>${escapeHtml(s.pageContent)}</pre>`);
    }

    parts.push(`<h2>Conversation</h2>`);
    for (const m of s.messages ?? []) {
      const role = m.type === "user" ? "User" : m.type === "followup" ? "Follow-up (queued)" : "AI";
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
      parts.push(`<div class="msg msg--${m.type === "user" || m.type === "followup" ? "user" : "ai"}">`);
      parts.push(`<div class="msg__role">${role} <span class="msg__time">${time}</span></div>`);
      parts.push(`<div class="msg__content">${escapeHtml(m.message || "(empty)")}</div>`);
      if (m.toolCalls?.length) {
        for (const tc of m.toolCalls) {
          parts.push(`<details>`);
          parts.push(`<summary>Tool: <code>${escapeHtml(tc.name)}</code></summary>`);
          if (tc.content) {
            parts.push(`<pre>${escapeHtml(tc.content)}</pre>`);
          }
          parts.push(`</details>`);
        }
      }
      parts.push(`</div>`);
    }

    parts.push(`</body>\n</html>`);
    const html = parts.join("\n");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(s.title || "chat").replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(text: string): string {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return text.replace(/[&<>"']/g, c => map[c] || c);
  }

  const {
    contextChangeHistory,
    applyContextChange,
    undoLastContextChange,
    addContextFile,
    removeContextFile,
    getContextSectionContent
  } = useContextChanges({ activeConversation, updateSessionMeta });

  function openSessionEdit() {
    if (!activeConversation.value) return;
    sessionEditVisible.value = true;
  }

  function closeSessionEdit() {
    sessionEditVisible.value = false;
  }

  function openContextEditor() {
    if (!activeConversation.value) return;
    contextEditorDraft.value = activeConversation.value.pageContent || "";
    contextEditorVisible.value = true;
  }

  function enterNewContextMode() {
    contextPanelNewMode.value = true;
  }
  function exitNewContextMode() {
    contextPanelNewMode.value = false;
  }

  function closeContextEditor() {
    contextEditorVisible.value = false;
  }

  async function saveContextEditorContent(text: string) {
    const s = activeConversation.value;
    if (!s) {
      closeContextEditor();
      return;
    }
    await updateSessionMeta(s.key, { pageContent: text });
    closeContextEditor();
  }

  async function saveContextToKnowledge(path?: string, content?: string, metadata?: Record<string, unknown>) {
    if (!path || !content) return;
    const { writeKnowledgeFile } = await import("@/api/modules/knowledgeService");
    const result = await writeKnowledgeFile(path, content, metadata);
    return result;
  }

  registerAiChatTools({
    registerTool,
    webSearchResults,
    webSearchImages
  });

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

  /** Forward AI reply text to every enabled+autoForward WeCom robot. */
  async function forwardReplyToWeCom(content: string) {
    const text = content.trim();
    if (!text) return;
    const targets = loadRobots().filter(r => r && r.enabled && r.autoForward && r.webhook);
    if (!targets.length) return;
    await Promise.all(targets.map(r => sendWeChatMessage(r.webhook, text).catch(() => {})));
  }

  async function deleteConversation(key: string) {
    try {
      await deleteSession(key);
      conversations.value = conversations.value.filter(c => c.key !== key);
      if (activeConversation.value?.key === key) {
        activeConversation.value = null;
        forgetActive();
        if (conversations.value.length) {
          await selectConversation(conversations.value[0].key);
        }
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to delete conversation";
    }
  }

  function setActiveMessages(updater: (msgs: ChatMessage[]) => ChatMessage[]) {
    if (!activeConversation.value) {
      console.warn("[setActiveMessages] EARLY RETURN — activeConversation is null!");
      return;
    }
    const beforeLen = activeConversation.value.messages?.length ?? 0;
    const beforePetMsg =
      activeConversation.value.messages?.find(m => m.timestamp === streamingTargetTimestamp.value)?.message?.length ?? 0;
    const next = updater(activeConversation.value.messages ?? []);
    activeConversation.value = { ...activeConversation.value, messages: next };
    const afterPetMsg = next.find(m => m.timestamp === streamingTargetTimestamp.value)?.message?.length ?? 0;
    console.log(`[setActiveMessages] msgs ${beforeLen}→${next.length}, pet msg len ${beforePetMsg}→${afterPetMsg}`);
  }

  // Chain persisting calls so a fire-and-forget persist (e.g. from onDone) can't
  // race with a later explicit persist (e.g. from deleteMessage). Each call waits
  // for the previous one to finish, then snapshots the *latest* messages before
  // sending its own request.
  let _persistChain: Promise<void> = Promise.resolve();

  async function persistActive(): Promise<boolean> {
    if (!activeConversation.value) return false;
    const prev = _persistChain;
    let resolve: () => void;
    _persistChain = new Promise(r => {
      resolve = r;
    });
    try {
      const waitStart = Date.now();
      // Guard against a stalled chain — resolve after 15s regardless
      await Promise.race([prev, new Promise<void>(r => setTimeout(r, 15_000))]);
      const waitMs = Date.now() - waitStart;
      if (!activeConversation.value) return false;
      const msgs = activeConversation.value.messages;
      const key = activeConversation.value.key;
      const now = Date.now();
      await updateSession(key, { messages: msgs, updatedAt: now });
      conversations.value = conversations.value.map(c => (c.key === key ? { ...c, updatedAt: now, messages: msgs } : c));

      // ── Storage quota monitor (TD-04 early warning) ─────────────────
      // Check localStorage usage every 10th persist to avoid overhead.
      // When approaching the 5MB limit, log a warning so the team can
      // trigger the IndexedDB migration before users experience errors.
      if (Math.random() < 0.1) {
        const q = getStorageQuota();
        if (q.level === "critical") {
          console.warn(
            `[aiChat] localStorage at ${(q.usageRatio * 100).toFixed(1)}% — ` +
              `IndexedDB migration (TD-04) should be triggered. ` +
              `${(q.usedBytes / 1024).toFixed(1)}KB / ${(q.estimatedLimit / 1024).toFixed(0)}KB`
          );
        }
      }
    } catch (e: unknown) {
      console.error("[aiChat] persistActive failed:", e instanceof Error ? e.message : String(e));
      ElMessage.error("Failed to save messages");
      return false;
    } finally {
      resolve!();
    }
    return true;
  }

  // ── Shared helpers (used by sendMessage + resendMessage) ──────────────

  /**
   * Load context file contents for the active session. Returns empty string
   * if no ctx: tags or cached pageContent already available.
   * Extracted from runStream so it can run in parallel with web search.
   */
  async function loadContextText(): Promise<string> {
    const session = activeConversation.value;
    if (!session) return "";
    let contextText = (session.pageContent || "").trim();
    if (contextText) return contextText;
    const ctxTags = (session.tags ?? []).filter((t: string) => t.startsWith("ctx:"));
    if (!ctxTags.length) return "";
    const { readKnowledgeFile } = await import("@/api/modules/knowledgeService");
    const results = await Promise.allSettled(ctxTags.map(t => readKnowledgeFile(t.slice(4)).catch(() => null)));
    const sections: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value) {
        const content = (r.value as any)?.content || "";
        if (content) sections.push(`## ${ctxTags[i].slice(4)}\n\n${content}`);
      }
    });
    if (sections.length) {
      contextText = sections.join("\n\n---\n\n");
      updateSessionMeta(session.key, { pageContent: contextText });
    }
    return contextText;
  }

  /**
   * Inject late-arriving search results as a follow-up exchange after the
   * initial stream completes, so the LLM can ground its answer in real data.
   * `insertAt` is the index where followupMsg will land (= current msg count).
   */
  async function _injectLateSearch(
    pendingSearch: Promise<{ context: string; results: WebSearchResult[]; timingMs: number } | null>,
    insertAt: number,
    streamType: AiChatStreamingType
  ): Promise<void> {
    const late = await pendingSearch;
    if (!late?.context || !late.results.length) return;
    searchTimingMs.value = late.timingMs;

    // In RAG mode: attach results to the existing response rather than
    // triggering a redundant follow-up exchange. The RAG engine already
    // generated a knowledge-base-grounded answer; appending search results
    // lets the user review them and ask a follow-up if desired.
    if (ragEnabled.value && ragActive.value) {
      setActiveMessages(msgs => {
        const lastPet = [...msgs].reverse().find(m => m.type === "pet");
        if (!lastPet) return msgs;
        const idx = msgs.indexOf(lastPet);
        const next = [...msgs];
        next[idx] = {
          ...next[idx],
          searchResults: [...late.results],
          ...(webSearchImages.value.length ? { searchImages: [...webSearchImages.value] } : {}),
          searchGrounded: true
        };
        return next;
      });
      return;
    }

    const now = Date.now();
    const um: ChatMessage = { type: "user", message: late.context, timestamp: now };
    const pm: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    setActiveMessages(msgs => [...msgs, um, pm]);
    setActiveMessages(msgs => {
      const idx = msgs.findIndex(m => m.timestamp === pm.timestamp);
      if (idx < 0) return msgs;
      const next = [...msgs];
      next[idx] = {
        ...next[idx],
        searchResults: [...late.results],
        ...(webSearchImages.value.length ? { searchImages: [...webSearchImages.value] } : {})
      };
      return next;
    });
    const contextText = await loadContextText();
    await runStream(insertAt, pm.timestamp, streamType, "", contextText);
  }

  /** Attach web search results to a specific pet message for per-turn display. */
  function _attachSearchResults(petTimestamp: number): void {
    if (!lastSearchQuery.value && !webSearchResults.value.length) return;
    setActiveMessages(msgs => {
      const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
      if (idx < 0) return msgs;
      const next = [...msgs];
      next[idx] = {
        ...next[idx],
        searchResults: [...webSearchResults.value],
        ...(webSearchImages.value.length ? { searchImages: [...webSearchImages.value] } : {})
      };
      return next;
    });
  }

  // ── end shared helpers ─────────────────────────────────────────────────
  const { compactionLog, lastCompaction, maybeCompact } = useConversationCompact({
    activeConversation,
    setActiveMessages,
    persistActive
  });

  // ── Tool execution (extracted to composable) ──
  const { executePreStreamTools, preFetchSearch } = useToolExecution({
    webSearchEnabled,
    webSearchResults,
    webSearching,
    streamingPhase,
    executeTool,
    setActiveMessages,
    activeConversation,
    persistActive,
    runStream
  });

  /**
   * Attach the tool calls fired during a turn to the pet message for that
   * turn (Pi-inspired: per-message tool timeline). Pairs `start` and `end`
   * events from toolEvents[startIdx:] by tool name, in order of appearance.
   */
  function attachTurnToolCalls(petTimestamp: number, startIdx: number): void {
    const slice = (toolEvents.value ?? []).slice(startIdx);
    // Pair start/end by name; in-flight tools (start, no end) appear as running.
    const starts = new Map<string, (typeof slice)[number]>();
    const calls: NonNullable<ChatMessage["toolCalls"]>[number][] = [];
    for (const e of slice) {
      if (e.phase === "start") {
        starts.set(e.name, e);
      } else {
        const s = starts.get(e.name);
        if (!s) continue;
        calls.push({
          name: s.name,
          label: s.label,
          args: s.args,
          content: e.content,
          error: e.error,
          durationMs: e.durationMs
        });
        starts.delete(e.name);
      }
    }
    // In-flight tools (start without end) — show as running.
    for (const s of starts.values()) {
      calls.push({
        name: s.name,
        label: s.label,
        args: s.args,
        content: "(running)"
      });
    }
    if (!calls.length) return;
    setActiveMessages(msgs => {
      const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
      if (idx < 0) return msgs;
      const next = [...msgs];
      next[idx] = { ...next[idx], toolCalls: calls };
      return next;
    });
    // Best-effort persist — don't block the UI on save.
    void persistActive();
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input.value).trim();
    const hasImages = draftImages.value.length > 0;

    if (!content && !hasImages && !sending.value) return;

    // Clear previous search results — each turn gets fresh results
    webSearchResults.value = [];
    webSearchImages.value = [];
    searchTimingMs.value = 0;
    lastSearchQuery.value = "";

    if (sending.value) return;

    // ── Check for slash commands ────────────────────────────────────
    if (content.startsWith("/") && !hasImages) {
      const handled = await handleCommand(content);
      if (handled) {
        input.value = "";
        return;
      }
    }
    if (!activeConversation.value) {
      await createConversation();
    }
    if (!activeConversation.value) return;

    const userQuery = content;

    const now = Date.now();
    const images = [...draftImages.value];
    const userMsg: ChatMessage = {
      type: "user",
      message: content,
      timestamp: now,
      ...(images.length ? { imageDataUrls: images } : {})
    };
    const petMsg: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    const prevLen = activeConversation.value.messages?.length ?? 0;
    setActiveMessages(msgs => [...msgs, userMsg, petMsg]);
    input.value = "";
    draftImages.value = [];

    const toolEventsStartIdx = toolEvents.value.length;

    // ── Tool execution + context loading (awaited — search context must
    // be ready before streaming so the LLM can ground its answer) ─────
    const toolSignal = new AbortController();
    toolAbortController.value = toolSignal;

    const [toolResult, contextText] = await Promise.all([
      executePreStreamTools(userQuery, toolSignal.signal, now),
      loadContextText()
    ]);
    const { initialContext, searchQuery, timingMs, pendingSearch } = toolResult;

    if (searchQuery) lastSearchQuery.value = searchQuery;
    if (timingMs > 0) searchTimingMs.value = timingMs;

    // Start streaming with search context when available (deadline: 500ms)
    await runStream(prevLen, petMsg.timestamp, "send", initialContext, contextText);

    // Post-stream search injection — late-arriving results trigger a
    // follow-up exchange so the LLM can ground its answer in real data.
    await _injectLateSearch(pendingSearch, prevLen + 2, "send");

    // ── Attach per-message tool calls (Pi-inspired: tool timeline) ──
    attachTurnToolCalls(petMsg.timestamp, toolEventsStartIdx);

    _attachSearchResults(petMsg.timestamp);
  }

  /**
   * Shared streaming helper. Sends `aiMessages` (filtered, up to and including
   * the user message at `upToIdxInclusive`) to the chat service and writes
   * streamed chunks into the pet message identified by `petTimestamp`.
   * Mirrors YiWeb `sessionChatContextChatMethods.streaming.js`.
   */
  async function runStream(upToIdxInclusive: number, petTimestamp: number, type: AiChatStreamingType, searchContext = "", contextText = "") {
    if (!activeConversation.value) return;
    const session = activeConversation.value;
    const slice = (session.messages ?? []).slice(0, upToIdxInclusive + 1);
    let aiMessages = slice
      .filter(m => m.type === "user" || (m.type === "pet" && !!m.message))
      .map(m => ({ type: m.type, message: m.message, timestamp: m.timestamp }));

    // ── Context trimming — keep only recent messages within ~6K tokens ──
    // Long conversations bloat the prompt, slow inference, and dilute accuracy.
    // Walk backwards from the last message, keep messages until we hit the limit.
    const MAX_CONTEXT_CHARS = 24_000; // ~6K tokens at 4 chars/token
    let totalChars = 0;
    const trimmed: typeof aiMessages = [];
    for (let i = aiMessages.length - 1; i >= 0; i--) {
      const msgChars = (aiMessages[i].message?.length ?? 0) + (searchContext.length || 0);
      if (totalChars + msgChars > MAX_CONTEXT_CHARS && trimmed.length >= 2) break;
      totalChars += msgChars;
      trimmed.unshift(aiMessages[i]);
    }
    aiMessages = trimmed;

    // Inject context text into the last user message
    if (contextText && aiMessages.length > 0) {
      const last = aiMessages[aiMessages.length - 1];
      if (last.type === "user") {
        const ref = contextText
          .split("\n\n---\n\n")
          .filter(Boolean)
          .map(s => s.replace(/^## /, "").trim())
          .join("\n\n");
        last.message = `${last.message}\n\n---\nReference files:\n\n${ref}`;
      }
    }

    // Mark pet message as search-grounded when search context is present
    if (searchContext) {
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], searchGrounded: true };
        return next;
      });
    }

    const lastUserMsg = [...slice].reverse().find(m => m.type === "user");
    const images = lastUserMsg?.imageDataUrls ?? [];

    let streamed = "";
    let lastScrollAt = 0;
    let firstTokenAt = 0;
    const streamStartAt = Date.now();
    sending.value = true;
    streamingTargetTimestamp.value = petTimestamp;
    streamingType.value = type;
    streamingPhase.value = "thinking";
    thinkingStartTs.value = Date.now();

    // Promise that resolves when the stream finishes (onDone/onError).
    // `sendMessage` awaits this so subsequent steps (attachTurnToolCalls,
    // persistActive) run AFTER the full reply is in the pet message — not
    // immediately after runStream's synchronous body completes.
    let resolveStream!: () => void;
    const streamFinished = new Promise<void>(resolve => {
      resolveStream = resolve;
    });

    const onPhase = (phase: string) => {
      // Only honour phase frames while still pre-stream. Once the first
      // chunk arrives, onChunk flips to "streaming" and phase frames are
      // no-op (the backend still emits them but they'd be misleading).
      if (streamingPhase.value !== "thinking" && streamingPhase.value !== "retrieving" && streamingPhase.value !== "preparing") return;
      if (phase === "retrieving") streamingPhase.value = "retrieving";
      else if (phase === "preparing") streamingPhase.value = "preparing";
    };
    const onChunk = (chunk: string) => {
      if (streamingPhase.value === "thinking" || streamingPhase.value === "retrieving" || streamingPhase.value === "preparing") streamingPhase.value = "streaming";
      // Direct per-token update — no batching for maximum streaming visibility.
      // The async httpx backend streams at native speed; Vue reactivity + markdown
      // render cache keep this smooth even at 50+ tokens/s.
      streamed += chunk;
      if (!firstTokenAt) {
        firstTokenAt = Date.now();
        const latencyMs = firstTokenAt - streamStartAt;
        setActiveMessages(msgs => {
          const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
          if (idx < 0) return msgs;
          const next = [...msgs];
          next[idx] = { ...next[idx], firstTokenLatencyMs: latencyMs };
          return next;
        });
      }
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], message: streamed, error: false, aborted: false };
        return next;
      });
      const now = Date.now();
      if (now - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now;
        scrollTick.value++;
      }
    };
    const onSources = (sources: RagSource[]) => {
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], sources };
        return next;
      });
    };
    const onDone = () => {
      console.log("[aiChat onDone] called. streamed len:", streamed.length, "petTs:", petTimestamp);
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      streamingPhase.value = "idle";
      thinkingStartTs.value = null;
      abortController.value = null;
      persistActive();
      const idx = activeConversation.value?.messages?.findIndex(m => m.timestamp === petTimestamp) ?? -1;
      const petMsg = idx >= 0 ? activeConversation.value?.messages?.[idx] : null;
      if (petMsg && !petMsg.aborted && !petMsg.error && streamed.trim()) {
        forwardReplyToWeCom(streamed);
      }

      // ── Compaction check (Pi-inspired) ────────────────────────────
      maybeCompact();
      resolveStream();
    };
    const onError = (err: Error) => {
      console.warn("[aiChat onError] called. err:", err.message, "streamed len:", streamed.length, "petTs:", petTimestamp);
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      streamingPhase.value = "idle";
      thinkingStartTs.value = null;
      abortController.value = null;
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = {
          ...next[idx],
          error: true,
          message: streamed || `Error: ${err.message}`
        };
        return next;
      });
      persistActive();
      resolveStream();
    };

    let abort: () => void;
    if (ragEnabled.value && ragActive.value) {
      // RAG mode — search knowledge base with optional web search context.
      // When web search is also enabled and results are available, inject them
      // as a system message so the LLM can cross-reference knowledge base
      // sources with real-time web data.
      const ragMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
      if (searchContext && webSearchEnabled.value) {
        ragMessages.push({
          role: "system",
          content:
            searchContext +
            "\n\n---\n" +
            "Cite KB excerpts as [N], web sources as [title](url). " +
            "Distinguish sources: 'KB [1] shows...' vs 'Web [title](url) reports...'. " +
            "If KB and web conflict, prefer more recent information."
        });
      }
      ragMessages.push(
        ...aiMessages
          .filter(m => (m.message ?? "").trim().length > 0)
          .map(m => ({ role: m.type === "user" ? ("user" as const) : ("assistant" as const), content: m.message }))
      );
      const handlers: RagStreamHandlers = { onChunk, onSources, onPhase, onDone, onError };
      const ragMeta = {
        chatMode: ragChatMode.value as "condense" | "condense_plus_context" | "context" | "simple",
        hybrid: ragHybrid.value,
        rerank: ragRerank.value,
        citations: ragCitations.value,
        hyde: ragHyde.value,
        ...(searchContext && webSearchEnabled.value ? { webSearch: true } : {})
      };
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], ragMeta };
        return next;
      });
      abort = streamRagChat(
        {
          messages: ragMessages,
          hybrid: ragHybrid.value,
          rerank: ragRerank.value,
          citations: ragCitations.value,
          hyde_enabled: ragHyde.value,
          chat_mode: ragChatMode.value as "condense" | "condense_plus_context" | "context" | "simple",
          ...(ragScope.value ? { scope: ragScope.value } : {}),
          ...(ragNumQueries.value > 0 ? { num_queries: ragNumQueries.value } : {})
        },
        handlers
      ).abort;
    } else {
      // Build combined system prompt: caller-provided systemPrompt (e.g. file preview)
      // + context-editing instructions when the session has context files.
      // + tool descriptions (Pi-inspired: tell the LLM what tools are available).
      // + web search results injected as SYSTEM context (authoritative, not conversation).
      const defaultSystem =
        "You are a professional AI assistant. Be concise, accurate, and helpful. " +
        "Use markdown for structure. Prefer facts over speculation. " +
        "When uncertain, acknowledge the limits of your knowledge.";
      const toolPrompt = getToolsForSystemPrompt();
      const searchSystemNote =
        webSearchEnabled.value && searchContext
          ? [
              "## Authoritative Context (Web Search Results)",
              "The following is real-time information from web search. " +
                "You MUST base your response on these facts. " +
                "Do NOT say you lack real-time access — the data is provided below.",
              "",
              searchContext,
              "",
              "Citation rules:",
              "- Cite sources as numbered links: `[1](url)`, `[2](url)`.",
              "- Place citations directly after each claim they support.",
              "- If the search results fully answer the question, respond based on them.",
              "- Only if results are truly insufficient, explain what's missing."
            ].join("\n")
          : "";
      const sysParts = [systemPrompt.value || defaultSystem, toolPrompt, searchSystemNote]
        .map(s => s.trim()).filter(Boolean);
      const system = sysParts.length ? sysParts.join("\n\n") : undefined;
      const result = streamChat(
        {
          messages: aiMessages,
          model: selectedModel.value,
          images,
          ...(system ? { system } : {})
        },
        onChunk,
        onDone,
        onError
      );
      abort = result.abort;
    }

    abortController.value = { abort };
    await streamFinished;
  }

  function stopSending() {
    const targetTs = streamingTargetTimestamp.value;
    abortController.value?.abort();
    toolAbortController.value?.abort();
    sending.value = false;
    streamingPhase.value = "idle";
    thinkingStartTs.value = null;
    streamingTargetTimestamp.value = null;
    streamingType.value = "";
    abortController.value = null;
    if (targetTs !== null) {
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === targetTs);
        if (idx < 0) return msgs;
        const next = [...msgs];
        const cur = next[idx];
        const trimmed = String(cur.message || "").trim();
        next[idx] = {
          ...cur,
          aborted: true,
          error: false,
          message: trimmed || "Stopped"
        };
        return next;
      });
    }
    persistActive();
  }

  /**
   * Regenerate a pet reply. Resets the pet message at `idx` and re-streams
   * from the preceding user message. Mirrors `regenerateSessionChatMessageAt`.
   */
  async function regenerateMessage(idx: number) {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const pet = messages[i];
    if (!pet || pet.type !== "pet") return;

    let userIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (messages[j] && messages[j].type !== "pet") {
        userIdx = j;
        break;
      }
    }
    if (userIdx < 0) return;
    const userMsg = messages[userIdx];
    const text = String(userMsg.message ?? "").trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const petTimestamp = typeof pet.timestamp === "number" ? pet.timestamp : now;
    const resetMessages = [...messages];
    resetMessages[i] = {
      ...pet,
      type: "pet",
      timestamp: petTimestamp,
      message: "",
      error: false,
      aborted: false
    };
    activeConversation.value = { ...s, messages: resetMessages, updatedAt: now };
    scrollTick.value++;
    const contextText = await loadContextText();
    await runStream(userIdx, petTimestamp, "regenerate", "", contextText);
  }

  /**
   * Retry the last failed/aborted pet reply. Mirrors `retryLastSessionChatMessage`.
   */
  async function retryLastMessage() {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    if (messages.length === 0) return;

    let petIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].type === "pet") {
        petIdx = i;
        break;
      }
    }
    if (petIdx < 0) return;
    const pet = messages[petIdx];
    if (!pet || (!pet.error && !pet.aborted)) return;

    await regenerateMessage(petIdx);
  }

  /** Deepen the current search: force web search on and re-run the last user message. */
  async function deepenSearch() {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    // Find last user message
    let userIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].type === "user") {
        userIdx = i;
        break;
      }
    }
    if (userIdx < 0) return;
    webSearchEnabled.value = true;
    await resendMessage(userIdx);
  }

  /**
   * Resend a user message: insert a fresh pet placeholder right after it,
   * then stream. Mirrors `resendSessionChatMessageAt`.
   */
  async function resendMessage(idx: number) {
    if (sending.value) return;
    const s = activeConversation.value;
    if (!s) return;
    const messages = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const userMsg = messages[i];
    if (!userMsg || userMsg.type === "pet") return;
    const text = String(userMsg.message ?? "").trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const insertedPet: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    const nextMessages = [...messages];
    nextMessages.splice(i + 1, 0, insertedPet);
    const userTimestamp = typeof userMsg.timestamp === "number" ? userMsg.timestamp : now;
    activeConversation.value = { ...s, messages: nextMessages, updatedAt: now };
    scrollTick.value++;

    // ── Tool execution + context loading (awaited) ─────
    const toolSignal = new AbortController();
    toolAbortController.value = toolSignal;
    const toolEventsStartIdx = toolEvents.value.length;

    const [toolResult, contextText] = await Promise.all([
      executePreStreamTools(text, toolSignal.signal, userTimestamp),
      loadContextText()
    ]);
    const { initialContext, searchQuery, timingMs, pendingSearch } = toolResult;

    if (searchQuery) lastSearchQuery.value = searchQuery;
    if (timingMs > 0) searchTimingMs.value = timingMs;

    await runStream(i, insertedPet.timestamp, "resend", initialContext, contextText);

    // Post-stream search injection
    await _injectLateSearch(pendingSearch, activeConversation.value?.messages?.length ?? 0, "resend");

    // ── Attach per-message tool calls (Pi-inspired: tool timeline) ──
    attachTurnToolCalls(insertedPet.timestamp, toolEventsStartIdx);

    _attachSearchResults(insertedPet.timestamp);
  }

  /** Delete a single message from the active conversation. */
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
      // Roll back the UI change on failure
      activeConversation.value = { ...s, messages, updatedAt: s.updatedAt };
    }
  }

  /** Inline-edit a user message's text. */
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

  function clearInput() {
    input.value = "";
    draftImages.value = [];
  }

  async function addDraftImageFiles(files: File[]) {
    const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
    if (remaining <= 0) {
      ElMessage.warning(`Up to ${MAX_DRAFT_IMAGES} images supported`);
      return;
    }
    const picked = files.slice(0, remaining);
    if (picked.length < files.length) {
      ElMessage.warning(`Up to ${MAX_DRAFT_IMAGES} images supported`);
    }
    try {
      const urls = await Promise.all(picked.map(readFileAsDataUrl));
      draftImages.value = [...draftImages.value, ...urls.filter(u => u.startsWith("data:image/"))];
    } catch (e) {
      ElMessage.error("Failed to read image");
    }
  }

  function removeDraftImage(idx: number) {
    const list = [...draftImages.value];
    if (idx < 0 || idx >= list.length) return;
    list.splice(idx, 1);
    draftImages.value = list;
  }

  function clearDraftImages() {
    draftImages.value = [];
  }

  async function loadFaqs(force = false) {
    if (faqLoaded && !force) return;
    faqLoading.value = true;
    try {
      const res = await queryDocuments<FaqDocument>({ cname: "faqs", pageSize: 100000 });
      if (res.code !== 0) throw new Error(res.message || "Failed to load FAQs");
      const list = res.data?.list ?? [];
      list.sort((a, b) => (a.order ?? a.createdAt ?? 0) - (b.order ?? b.createdAt ?? 0));
      faqs.value = list;
      faqLoaded = true;
    } catch {
      /* ignore */
    } finally {
      faqLoading.value = false;
    }
  }

  function openFaq() {
    faqVisible.value = true;
    if (!faqLoaded) loadFaqs();
  }

  function closeFaq() {
    faqVisible.value = false;
  }

  function toggleFaq() {
    if (faqVisible.value) closeFaq();
    else openFaq();
  }

  function applyFaq(item: FaqDocument, mode: "insert" | "append" = faqApplyMode.value) {
    const title = (item.title || "").trim();
    const prompt = (item.prompt || "").trim();
    const text = title && prompt ? `${title}\n\n${prompt}` : prompt || title;
    if (!text) return;
    const current = input.value;
    input.value = mode === "append" && current ? `${current}\n\n${text}` : text;
    closeFaq();
  }

  // ── Compaction trigger ────────────────────────────────────────────
  // Pi-inspired: when the conversation nears the context window limit,
  // summarize older messages so the model can continue coherently.
  const COMPACTION_THRESHOLD_TOKENS = 6554; // 80% of 8192
  const CHARS_PER_TOKEN = 4;

  // ── Context overflow detection (Pi: isContextOverflow) ──────────────
  // Warns when the conversation is approaching the context window limit.
  const CONTEXT_WINDOW = 8192;
  const contextPressure = computed(() => {
    const s = activeConversation.value;
    if (!s?.messages?.length) return { level: "low" as const, estimatedTokens: 0, pct: 0 };
    const totalChars = s.messages.reduce((sum, m) => sum + (m.message?.length ?? 0), 0);
    const estimatedTokens = Math.ceil(totalChars / CHARS_PER_TOKEN);
    const pct = Math.round((estimatedTokens / CONTEXT_WINDOW) * 100);
    const level =
      pct > 90 ? ("critical" as const) : pct > 70 ? ("high" as const) : pct > 40 ? ("mid" as const) : ("low" as const);
    return { level, estimatedTokens, pct };
  });

  // Compaction and prompt templates extracted to composables.
  // useConversationCompact is initialized below after persistActive is defined.
  // usePromptTemplates is already initialized above.

  const { handleCommand } = useSlashCommands({
    activeConversation,
    sending,
    input,
    allTools,
    setActiveMessages,
    persistActive,
    createConversation,
    executeTool,
    maybeCompact,
    stopSending,
    retryLastMessage,
    renameConversation,
    exportConversation,
    exportConversationHtml,
    conversations,
    selectConversation,
    promptTemplates,
    addTemplate,
    removeTemplate,
    applyTemplate
  });

  return {
    knowledgeSidebarVisible,
    conversations,
    activeConversation,
    loading,
    conversationsLoaded,
    error,
    input,
    sending,
    streamingTargetTimestamp,
    streamingType,
    streamingPhase,
    thinkingStartTs,
    scrollTick,
    copyFeedback,
    draftImages,
    faqs,
    faqVisible,
    faqSearch,
    faqLoading,
    faqApplyMode,
    sessionEditVisible,
    contextEditorVisible,
    contextEditorDraft,
    tagManagerVisible,
    contextPanelNewMode,
    ragEnabled,
    ragActive,
    ragHybrid,
    ragRerank,
    ragCitations,
    ragHyde,
    ragScope,
    ragNumQueries,
    ragChatMode,
    webSearchEnabled,
    webSearchResults,
    webSearchImages,
    webSearching,
    searchTimingMs,
    lastSearchQuery,
    weChatVisible,
    batchMode,
    selectedKeys,
    messages,
    searchQuery,
    expandedFolders,
    conversationTree,
    filteredConversationTree,
    toggleFolder,
    isStreaming,
    loadConversations,
    selectConversation,
    createConversation,
    renameConversation,
    updateSessionMeta,
    toggleFavorite,
    toggleBatchMode,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete,
    clearAllConversations,
    openSessionEdit,
    closeSessionEdit,
    openContextEditor,
    closeContextEditor,
    saveContextEditorContent,
    applyContextChange,
    getContextSectionContent,
    contextChangeHistory,
    undoLastContextChange,
    addContextFile,
    removeContextFile,
    enterNewContextMode,
    exitNewContextMode,
    toggleTagManager,
    openTagManager,
    closeTagManager,
    openWeChat,
    closeWeChat,
    llamaIndexVisible,
    openLlamaIndex,
    closeLlamaIndex,
    toggleLlamaIndex,
    addTag,
    removeTag,
    setSystemPrompt,
    systemPrompt,
    deleteConversation,
    sendMessage,
    stopSending,
    regenerateMessage,
    retryLastMessage,
    deepenSearch,
    preFetchSearch,
    resendMessage,
    deleteMessage,
    editMessage,
    copyMessage,
    clearInput,
    addDraftImageFiles,
    removeDraftImage,
    clearDraftImages,
    loadFaqs,
    openFaq,
    closeFaq,
    toggleFaq,
    applyFaq,
    persistActive,
    maybeCompact,
    compactionLog,
    lastCompaction,
    saveContextToKnowledge,
    exportConversation,
    exportConversationHtml,
    // Context overflow detection
    contextPressure,
    // Tool registry (Pi-inspired)
    toolEvents,
    activeTools,
    allTools,
    registerTool,
    setToolEnabled,
    getToolsForSystemPrompt,
    selectedModel,
    availableModels,
    modelsLoading,
    fetchModels,
    // Prompt templates
    promptTemplates,
    addTemplate,
    removeTemplate,
    applyTemplate
  };
});
