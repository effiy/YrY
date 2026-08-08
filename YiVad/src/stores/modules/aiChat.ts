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
import { useContextChangePrompt } from "@/hooks/useContextChangePrompt";
import { useContextChanges } from "@/hooks/useContextChanges";
import { registerAiChatTools } from "@/hooks/useAiChatTools";
import { useSlashCommands } from "@/hooks/useSlashCommands";
import { getSessions, getSession, upsertSession, deleteSession } from "@/api/modules/sessions";
import { streamChat } from "@/api/modules/chatService";
import { streamAgentChat } from "@/api/modules/agentService";
import type { AgentStreamEvent } from "@/api/modules/agentService";
import { streamRagChat } from "@/api/modules/ragService";
import { queryDocuments } from "@/api/modules/dataService";
import { loadRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import { extractUrls, compactConversation } from "@/api/modules/searchService";
import type { WebSearchResult } from "@/api/modules/searchService";
import type { SessionDocument, ChatMessage, FaqDocument } from "@/api/interface/yiweb";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";
import type { AiChatFeedbackRating, AiChatStreamingType, AgentTurnSummary, ToolCallEntry } from "@/views/aiChat/types";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";

import { loadBool, saveBool, loadNum, saveNum, loadStr, saveStr, loadJson, saveJson } from "@/utils/storage";
import { newKey, readFileAsDataUrl, normalizeSession } from "@/utils/chatNormalizers";

const STORAGE_ACTIVE_KEY = "aiChat.activeKey";
const STORAGE_RAG_KEY = "aiChat.ragEnabled";
const STORAGE_WEB_KEY = "aiChat.webSearchEnabled";
const STORAGE_RAG_HYBRID_KEY = "aiChat.ragHybrid";
const STORAGE_RAG_RERANK_KEY = "aiChat.ragRerank";
const STORAGE_RAG_CITATIONS_KEY = "aiChat.ragCitations";
const STORAGE_RAG_NUM_QUERIES_KEY = "aiChat.ragNumQueries";
const STORAGE_RAG_CHAT_MODE_KEY = "aiChat.ragChatMode";
const STORAGE_RAG_CATEGORY_KEY = "aiChat.ragCategory";
const STORAGE_RAG_TAGS_KEY = "aiChat.ragTags";
const STORAGE_AGENT_KEY = "aiChat.agentMode";
const STORAGE_AGENT_MAX_TURNS_KEY = "aiChat.agentMaxTurns";
const STORAGE_AGENT_SYSTEM_PROMPT_KEY = "aiChat.agentSystemPrompt";
const STORAGE_AGENT_MODEL_ROTATION_KEY = "aiChat.agentModelRotation";
const STORAGE_SELECTED_MODEL_KEY = "aiChat.selectedModel";
const STORAGE_TEMPLATES_KEY = "aiChat.promptTemplates";
const MAX_DRAFT_IMAGES = 4;
const SCROLL_THROTTLE_MS = 120;

export const useAiChatStore = defineStore("yivad-aiChat", () => {
  const conversations = ref<SessionDocument[]>([]);
  const activeConversation = ref<SessionDocument | null>(null);
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

  // ── Streaming phase (Pi-inspired: turn_start/message_start/message_end) ──
  // Tracks the current phase of the AI interaction for richer UI feedback.
  type StreamingPhase = "idle" | "fetching" | "thinking" | "retrieving" | "streaming" | "done";
  const streamingPhase = ref<StreamingPhase>("idle");

  // ── Agent mode (Pi-inspired: agent loop with tool calling) ──────────
  // When enabled, chat uses the agent loop (/agent/chat) instead of direct
  // chat. The agent can call tools (web_search, web_fetch, rag_search, etc.)
  // in a multi-turn reasoning loop with full observability.
  const agentMode = ref(loadBool(STORAGE_AGENT_KEY, false));
  // Per-turn summaries for the current streaming message — cleared on each
  // new send, populated by agent events.
  const agentTurnSummaries = ref<AgentTurnSummary[]>([]);
  // Marks the session as "interrupted by max_turns" for the next send. That
  // send then uses resume-by-session (pi persistent loop): it sends only the
  // user's continuation with `resume: true`, and the server restores the
  // persisted tool trajectory so the model continues instead of redoing
  // completed writes (observed: a resumed run re-created a menu db_create had
  // already made when history was text-only).
  const lastAgentInterrupt = ref<null | { sessionKey: string }>(null);
  // Raw agent events for the current turn (for detailed inspection).
  const agentEvents = ref<AgentStreamEvent[]>([]);
  // Max turns for the agent loop (user-configurable).
  const agentMaxTurns = ref(loadNum(STORAGE_AGENT_MAX_TURNS_KEY, 10));
  // Custom system prompt for the agent (user-configurable, persisted).
  const agentSystemPrompt = ref(loadStr(STORAGE_AGENT_SYSTEM_PROMPT_KEY, ""));
  // Model rotation list for prepareNextTurn (Pi: switch models between turns).
  const agentModelRotation = ref<string[]>(loadJson(STORAGE_AGENT_MODEL_ROTATION_KEY, []));
  // Selected model for chat/agent calls (Pi: model selection). Persisted.
  const selectedModel = ref(loadStr(STORAGE_SELECTED_MODEL_KEY, DEFAULT_MODEL));
  // Available models fetched from YiAi (Pi: model list from server).
  const availableModels = ref<string[]>([]);
  const modelsLoading = ref(false);
  // Current token usage from agent events (turn_tokens + total_tokens).
  const agentUsage = ref<{ turnTokens: number; totalTokens: number; turns: number } | null>(null);
  // Last compaction event (surfaced in the UI as a transient notification).
  const agentCompaction = ref<{ beforeCount: number; afterCount: number; savedTokens: number; timestamp: number } | null>(null);
  // Pending tool confirmation (Pi-inspired: tool requires user approval).
  // Surfaced as a banner in MessageList with Approve/Reject. confirmationId
  // maps to the backend tool-call id for POST /agent/confirm.
  const pendingConfirmation = ref<{ toolName: string; toolArgs: Record<string, any>; confirmationId: string; timestamp: number } | null>(null);
  const scrollTick = ref(0);
  const copyFeedback = ref<Record<string, string>>({});
  const feedback = ref<Record<number, AiChatFeedbackRating>>({});
  const draftImages = ref<string[]>([]);
  const faqs = ref<FaqDocument[]>([]);
  const faqVisible = ref(false);
  const faqSearch = ref("");
  const faqLoading = ref(false);
  const faqApplyMode = ref<"append" | "insert">("append");
  let faqLoaded = false;
  const sessionEditVisible = ref(false);
  const contextEditorVisible = ref(false);
  const contextEditorDraft = ref("");
  /** When true, ContextFilesPanel shows "new session" form instead of active session context. */
  const contextPanelNewMode = ref(false);
  const tagManagerVisible = ref(false);
  // RAG toggle — user-controlled. Persisted to localStorage.
  const ragEnabled = ref(loadBool(STORAGE_RAG_KEY, true));

  // Per-call RAG retrieval overrides — mirror yaml defaults (hybrid on,
  // rerank off, citations on). User-controlled, persisted.
  const ragHybrid = ref(loadBool(STORAGE_RAG_HYBRID_KEY, true));
  const ragRerank = ref(loadBool(STORAGE_RAG_RERANK_KEY, false));
  const ragCitations = ref(loadBool(STORAGE_RAG_CITATIONS_KEY, true));
  // QueryFusionRetriever LLM query-variant count (1 = no expansion). Only
  // honored when hybrid is on and no scope is active. Persisted per user.
  const ragNumQueries = ref(loadNum(STORAGE_RAG_NUM_QUERIES_KEY, 1));
  // llama_index chat engine mode — per-call selection of:
  //   condense_plus_context (default) | condense_question | context | simple
  // Lets the user A/B compare chat engines from the toolbar. Persisted.
  const ragChatMode = ref<"condense_plus_context" | "condense_question" | "context" | "simple">(
    loadStr(STORAGE_RAG_CHAT_MODE_KEY, "condense_plus_context") as any
  );
  // Metadata filters on frontmatter — narrow RAG retrieval to a specific
  // category (TEXT_MATCH) and/or set of tags (TEXT_MATCH each, AND-combined).
  // Like scope, metadata filters disable hybrid (BM25 doesn't support them).
  // Empty category / empty tags = no filter (retriever uses default behavior).
  const ragCategory = ref<string>(loadStr(STORAGE_RAG_CATEGORY_KEY, ""));
  const ragTags = ref<string[]>(loadJson<string[]>(STORAGE_RAG_TAGS_KEY, []));

  // Web search toggle — user-controlled. Persisted to localStorage.
  const webSearchEnabled = ref(loadBool(STORAGE_WEB_KEY, false));

  // Results from the most recent web search (displayed in the message bubble).
  const webSearchResults = ref<WebSearchResult[]>([]);

  // True while web search API call is in-flight.
  const webSearching = ref(false);

  // ── Tool Registry (Pi-inspired pluggable tools) ──
  const { tools: _tools, toolEvents, activeTools, allTools, registerTool, setToolEnabled, executeTool, getToolsForSystemPrompt } = useToolRegistry();

  const { searchQuery, expandedFolders, toggleFolder, conversationTree, filteredConversationTree, isStreaming } =
    useConversationTree({ conversations, sending, streamingTargetTimestamp });

  const { contextChangeSystemPrompt } = useContextChangePrompt(activeConversation);

  // True when the active conversation has ctx:-tagged files (can use RAG).
  const ragActive = computed(() => {
    const tags = activeConversation.value?.tags ?? [];
    return tags.some(t => typeof t === "string" && t.startsWith("ctx:"));
  });

  // Auto-sync tool enabled states with store toggles (Pi pattern: tools are
  // reactive to session state, not separate manual toggles).
  watch([ragEnabled, ragActive, webSearchEnabled], () => {
    setToolEnabled("web_search", webSearchEnabled.value);
    setToolEnabled("web_fetch", webSearchEnabled.value);
    setToolEnabled("rag_search", ragEnabled.value && ragActive.value);
    setToolEnabled("context_edit", ragActive.value);
    // Persist preferences (Pi: settingsManager pattern)
    saveBool(STORAGE_RAG_KEY, ragEnabled.value);
    saveBool(STORAGE_WEB_KEY, webSearchEnabled.value);
  }, { immediate: true });

  // Persist per-call retrieval overrides — these don't gate tool registry
  // state, they just flow into the streamRagChat payload.
  watch([ragHybrid, ragRerank, ragCitations, ragNumQueries, ragChatMode, ragCategory, ragTags], () => {
    saveBool(STORAGE_RAG_HYBRID_KEY, ragHybrid.value);
    saveBool(STORAGE_RAG_RERANK_KEY, ragRerank.value);
    saveBool(STORAGE_RAG_CITATIONS_KEY, ragCitations.value);
    saveNum(STORAGE_RAG_NUM_QUERIES_KEY, ragNumQueries.value);
    saveStr(STORAGE_RAG_CHAT_MODE_KEY, ragChatMode.value);
    saveStr(STORAGE_RAG_CATEGORY_KEY, ragCategory.value);
    saveJson(STORAGE_RAG_TAGS_KEY, ragTags.value);
  });

  // Backward-compat aliases
  const knowledgeMode = computed(() => ragEnabled.value && ragActive.value);
  const contextSwitchEnabled = computed(() => ragEnabled.value);
  // Transient per-message system prompt — set by callers (e.g. story's
  // file-preview chat passes the file content as context) and consumed by
  // runStream on the next send. Not persisted: file content changes between
  // previews, so storing it on the session would go stale.
  const systemPrompt = ref("");
  const weChatVisible = ref(false);
  const llamaIndexVisible = ref(false);
  const batchMode = ref(false);
  const selectedKeys = ref<Set<string>>(new Set());

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
    } catch (e: any) {
      error.value = e?.message || "Failed to load conversations";
    } finally {
      loading.value = false;
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
    } catch (e: any) {
      error.value = e?.message || "Failed to toggle favorite";
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

  function clearSelection() {
    selectedKeys.value = new Set();
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
    } catch (e: any) {
      error.value = e?.message || "Failed to load conversation";
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
    } catch (e: any) {
      error.value = e?.message || "Failed to create conversation";
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
    } catch (e: any) {
      error.value = e?.message || "Failed to rename conversation";
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
    const patch = { ...target, ...meta, updatedAt: Date.now() };
    try {
      await upsertSession(patch);
      conversations.value = conversations.value.map(c => (c.key === key ? patch : c));
      if (activeConversation.value?.key === key) {
        activeConversation.value = patch;
      }
    } catch (e: any) {
      error.value = e?.message || "Failed to update session";
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
      const role = m.type === "user" ? "**User**" : "**AI**";
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
      const role = m.type === "user" ? "User" : "AI";
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
      parts.push(`<div class="msg msg--${m.type === "user" ? "user" : "ai"}">`);
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

  const { contextChangeHistory, applyContextChange, deleteContextSection,
          undoLastContextChange, addContextFile, removeContextFile,
          getContextSectionContent } =
    useContextChanges({ activeConversation, updateSessionMeta });

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

  async function saveContextToKnowledge(
    path: string,
    content: string,
    metadata?: Record<string, unknown>
  ) {
    const { writeKnowledgeFile } = await import("@/api/modules/knowledgeService");
    const result = await writeKnowledgeFile(path, content, metadata);
    return result;
  }

  registerAiChatTools({
    registerTool,
    webSearchResults,
    applyContextChange,
    addContextFile,
    removeContextFile,
    saveContextToKnowledge,
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

  // RAG is auto — no user toggle. setContextSwitchEnabled kept for backward compat as no-op.
  function setContextSwitchEnabled(_v: boolean) { /* no-op: RAG auto-detected from conversation ctx: files */ }

  // ── Agent mode toggle ─────────────────────────────────────────────
  function toggleAgentMode() {
    agentMode.value = !agentMode.value;
    saveBool(STORAGE_AGENT_KEY, agentMode.value);
  }

  // ── Tool confirmation (Pi-inspired: approve/reject destructive tools) ──
  /** Approve the pending tool call — the agent loop proceeds to execute it. */
  async function approvePendingConfirmation() {
    const conf = pendingConfirmation.value;
    if (!conf) return;
    pendingConfirmation.value = null;
    if (!conf.confirmationId || !activeConversation.value?.key) return;
    const { confirmAgentTool } = await import("@/api/modules/agentService");
    await confirmAgentTool(activeConversation.value.key, conf.confirmationId, true);
  }

  /** Reject the pending tool call — the agent loop skips it with a notice. */
  async function rejectPendingConfirmation() {
    const conf = pendingConfirmation.value;
    if (!conf) return;
    pendingConfirmation.value = null;
    if (!conf.confirmationId || !activeConversation.value?.key) return;
    const { confirmAgentTool } = await import("@/api/modules/agentService");
    await confirmAgentTool(activeConversation.value.key, conf.confirmationId, false);
  }

  /** Fetch available models from YiAi server. */
  async function fetchModels() {
    if (modelsLoading.value) return;
    modelsLoading.value = true;
    try {
      const { buildYiAiUrl } = await import("@/config/yiweb");
      const res = await fetch(buildYiAiUrl("/models"));
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.models) {
          availableModels.value = data.data.models.map((m: any) => m.name || m.model || m);
        } else if (data?.models) {
          availableModels.value = data.models.map((m: any) => m.name || m.model || m);
        }
      }
    } catch {
      // Keep current list; models are best-effort
    } finally {
      modelsLoading.value = false;
    }
  }

  // Persist agent max turns
  watch(agentMaxTurns, (v) => saveNum(STORAGE_AGENT_MAX_TURNS_KEY, v));
  // Persist agent system prompt
  watch(agentSystemPrompt, (v) => saveStr(STORAGE_AGENT_SYSTEM_PROMPT_KEY, v));
  watch(agentModelRotation, (v) => saveJson(STORAGE_AGENT_MODEL_ROTATION_KEY, v), { deep: true });
  watch(selectedModel, (v) => saveStr(STORAGE_SELECTED_MODEL_KEY, v));

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
    } catch (e: any) {
      error.value = e?.message || "Failed to delete conversation";
    }
  }

  function setActiveMessages(updater: (msgs: ChatMessage[]) => ChatMessage[]) {
    if (!activeConversation.value) return;
    const next = updater(activeConversation.value.messages ?? []);
    activeConversation.value = { ...activeConversation.value, messages: next };
  }

  // Chain persisting calls so a fire-and-forget persist (e.g. from onDone) can't
  // race with a later explicit persist (e.g. from deleteMessage). Each call waits
  // for the previous one to finish, then snapshots the *latest* messages before
  // sending its own request.
  let _persistChain: Promise<void> = Promise.resolve();

  async function persistActive() {
    if (!activeConversation.value) return;
    const prev = _persistChain;
    let resolve: () => void;
    _persistChain = new Promise(r => {
      resolve = r;
    });
    try {
      await prev;
      if (!activeConversation.value) return;
      const msgs = activeConversation.value.messages;
      const key = activeConversation.value.key;
      const now = Date.now();
      await upsertSession({ key, messages: msgs, updatedAt: now });
      conversations.value = conversations.value.map(c =>
        c.key === key ? { ...c, updatedAt: now, messages: msgs } : c
      );
    } catch (e: any) {
      console.error("[aiChat] persistActive failed:", e?.message ?? e);
      ElMessage.error("Failed to save messages");
    } finally {
      resolve!();
    }
  }

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
          durationMs: e.durationMs,
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
        content: "(running)",
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

    // ── Agent steering (Pi-inspired: steer a running agent) ────────────
    if (content.startsWith("/steer") && sending.value && agentMode.value) {
      const steerMsg = content.slice(7).trim();
      if (steerMsg && activeConversation.value) {
        const { steerAgent } = await import("@/api/modules/agentService");
        const ok = await steerAgent(activeConversation.value.key, steerMsg);
        if (ok) {
          ElMessage.success(`Steering: "${steerMsg.slice(0, 40)}${steerMsg.length > 40 ? "..." : ""}"`);
        } else {
          ElMessage.warning("Steering failed — agent may not be running");
        }
        input.value = "";
      }
      return;
    }

    // ── Agent follow-up (Pi-inspired: queue message after agent stops) ──
    if (content.startsWith("/followup") && sending.value && agentMode.value) {
      const followUpMsg = content.slice(10).trim();
      if (followUpMsg && activeConversation.value) {
        const { followUpAgent } = await import("@/api/modules/agentService");
        const ok = await followUpAgent(activeConversation.value.key, followUpMsg);
        if (ok) {
          ElMessage.success(`Follow-up queued: "${followUpMsg.slice(0, 40)}${followUpMsg.length > 40 ? "..." : ""}"`);
        } else {
          ElMessage.warning("Follow-up failed — agent may not be running");
        }
        input.value = "";
      }
      return;
    }

    if (!content && !hasImages && !sending.value) return;

    // ── Agent auto-steer (Pi: Agent.steer) ───────────────────────────
    // While the agent loop is running, a plain message redirects the loop — it
    // is NOT a new request. The old guard silently dropped it, so a user
    // correcting a mid-task run ("actually use X instead") lost the message.
    // Steer it into the running agent and reflect it as a chat bubble. Slash
    // commands still pass through to the drop guard unchanged.
    if (sending.value && agentMode.value && content && !hasImages && !content.startsWith("/")) {
      const convKey = activeConversation.value?.key;
      input.value = "";
      if (convKey) {
        setActiveMessages(msgs => [...msgs, {
          type: "user",
          message: content,
          timestamp: Date.now(),
        }]);
        const { steerAgent } = await import("@/api/modules/agentService");
        const ok = await steerAgent(convKey, content);
        if (ok) {
          ElMessage.success("已转向运行中的 agent");
        } else {
          ElMessage.warning("转向失败 — agent 可能已停止");
        }
      }
      return;
    }

    if (sending.value) return;

    // ── Check for slash commands ────────────────────────────────────
    if (content.startsWith("/") && !hasImages) {
      const handled = await handleCommand(content);
      if (handled) { input.value = ""; return; }
    }
    if (!activeConversation.value) {
      await createConversation();
    }
    if (!activeConversation.value) return;

    // Store the query for potential web search
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

    // Pi-inspired: snapshot toolEvents length so we can attach the calls
    // fired during this turn to the pet message (per-message tool timeline).
    const toolEventsStartIdx = toolEvents.value.length;

    // ── Tool execution (Pi-inspired pipeline) ──────────────────────────
    // Pre-stream tools (e.g. web_fetch for URLs in message) run first
    // and their output is injected into the initial AI stream context.
    // Background tools (e.g. web_search) run in parallel and arrive as
    // a follow-up message when they produce additional context.
    let initialSearchContext = "";

    // Create a fresh AbortController for this send's tool executions.
    // Aborted on user Stop to cancel in-flight web fetches/searches.
    const toolSignal = new AbortController();
    toolAbortController.value = toolSignal;

    if (webSearchEnabled.value && userQuery) {
      // Tool states are auto-synced by watcher — no manual setToolEnabled needed
      const urls = extractUrls(userQuery);

      // ── Execute pre-stream tools ──────────────────────────────────
      if (urls.length > 0) {
        streamingPhase.value = "fetching";
        webSearching.value = true;
        for (const url of urls) {
          const result = await executeTool("web_fetch", { url }, toolSignal.signal);
          if (result?.content) {
            initialSearchContext = initialSearchContext
              ? `${initialSearchContext}\n\n${result.content}`
              : result.content;
          }
        }
        webSearching.value = false;

        if (initialSearchContext) {
          setActiveMessages(msgs => {
            const idx = msgs.findIndex(m => m.timestamp === now);
            if (idx < 0) return msgs;
            const next = [...msgs];
            next[idx] = { ...next[idx], searchContext: initialSearchContext };
            return next;
          });
        }
      }

      // ── Execute background tools (fire-and-forget) ─────────────────
      let pendingSearchContext = "";
      Promise.resolve(
        executeTool("web_search", { query: userQuery, maxResults: 6 }, toolSignal.signal).then(result => {
          webSearching.value = false;
          if (result?.content) {
            // Also fetch top search result URLs via web_fetch
            const resultUrls = extractUrls(result.content);
            if (resultUrls.length > 0) {
              return Promise.all(
                resultUrls.slice(0, 3).map(u =>
                  executeTool("web_fetch", { url: u }, toolSignal.signal).then(r => r?.content ?? "")
                )
              ).then(extraParts => {
                const allParts = [...extraParts.filter(Boolean), result.content];
                pendingSearchContext = allParts.join("\n\n");
              });
            }
            pendingSearchContext = result.content;
          }
        }).catch(() => {
          webSearching.value = false;
          webSearchResults.value = [];
        })
      ).finally(async () => {
        await streamPromise;
        if (!pendingSearchContext) return;
        await persistActive();
        const s = activeConversation.value;
        if (!s) return;
        // Inject as tool_result entry then stream follow-up
        const followUpPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() + 1 };
        const msgs = s.messages ?? [];
        const prev = msgs.length;
        setActiveMessages(m => [...m, followUpPet]);
        await runStream(prev, followUpPet.timestamp, "send", pendingSearchContext);
      });
    } else {
      webSearchResults.value = [];
      // Tool states auto-synced by watcher
    }

    // Start streaming (with initialSearchContext if URLs were in the message)
    const streamPromise = runStream(prevLen, petMsg.timestamp, "send", initialSearchContext);

    await streamPromise;

    // ── Attach per-message tool calls (Pi-inspired: tool timeline) ──
    attachTurnToolCalls(petMsg.timestamp, toolEventsStartIdx);

    // ── Auto-detect KB save intent (Pi-inspired post-processing) ─────────
    // When the user asks to save content to the knowledge base but the AI
    // didn't use a knowledge:save block, auto-wrap the response so the user
    // can save it with one click via the ContextChangeCard.
    const kbIntent = detectKBIntent(userQuery);
    if (kbIntent) {
      const petIdx = activeConversation.value?.messages?.findIndex(
        m => m.timestamp === petMsg.timestamp
      ) ?? -1;
      if (petIdx >= 0) {
        const petMsg2 = activeConversation.value!.messages![petIdx];
        const petText = petMsg2.message ?? "";
        // Only auto-wrap if the AI didn't already use knowledge:save
        if (petText && !/```knowledge:save/.test(petText)) {
          const wrapped = autoWrapKnowledgeBlock(petText, kbIntent.path);
          setActiveMessages(msgs => {
            const next = [...msgs];
            next[petIdx] = { ...next[petIdx], message: wrapped };
            return next;
          });
          await persistActive();
        }
      }
    }
  }

  // ── KB intent detection ───────────────────────────────────────────────

  /** Patterns that indicate the user wants to save content to the knowledge base. */
  const KB_INTENT_RE = /(save(?:s|d)?\s+(?:to|into|in)\s+(?:the\s+)?(?:knowledge|kb|yiknowledge|knowledge\s*base)|(?:put|place|store|write|save)\s+(?:it\s+)?(?:in(?:to)?|to)?\s*(?:the\s+)?(?:knowledge|kb|yiknowledge|knowledge\s*base)|(?:generate|create)\s+.*?(?:and\s+)?(?:save|put|place|store|write)\s+(?:it\s+)?(?:in(?:to)?|to)?\s*(?:the\s+)?(?:knowledge|kb|yiknowledge|knowledge\s*base))/i;

  function detectKBIntent(userMessage: string): { path: string } | null {
    if (!userMessage || !KB_INTENT_RE.test(userMessage)) return null;
    // Extract a suggested path from the user message
    const path = suggestKBPath(userMessage);
    return { path };
  }

  /** Suggest a KB file path from the user's message content. */
  function suggestKBPath(userMessage: string): string {
    const text = userMessage.trim();
    // Try to extract a descriptive name
    const reportMatch = text.match(/(\w+(?:[\w-]+)*)\s*(?:report|analysis|document|note|guide|manual|doc)/i);
    if (reportMatch) {
      const name = reportMatch[1].replace(/\s+/g, "-").toLowerCase();
      return `reports/${name}.md`;
    }
    // Default: use date-based path
    const date = new Date().toISOString().slice(0, 10);
    return `notes/ai-generated-${date}.md`;
  }

  /** Wrap AI-generated content in a knowledge:save block. */
  function autoWrapKnowledgeBlock(content: string, path: string): string {
    const cleaned = content.trim();
    return `\`\`\`knowledge:save ${path}\n${cleaned}\n\`\`\``;
  }

  /**
   * Shared streaming helper. Sends `aiMessages` (filtered, up to and including
   * the user message at `upToIdxInclusive`) to the chat service and writes
   * streamed chunks into the pet message identified by `petTimestamp`.
   * Mirrors YiWeb `sessionChatContextChatMethods.streaming.js`.
   */
  async function runStream(upToIdxInclusive: number, petTimestamp: number, type: AiChatStreamingType, searchContext = "") {
    if (!activeConversation.value) return;
    const session = activeConversation.value;
    const slice = (session.messages ?? []).slice(0, upToIdxInclusive + 1);
    const aiMessages = slice
      .filter(m => m.type === "user" || (m.type === "pet" && !!m.message))
      .map(m => ({ type: m.type, message: m.message, timestamp: m.timestamp }));

    const useRag = ragEnabled.value && ragActive.value;
    const contextText = useRag ? (session.pageContent || "").trim() : "";
    if (contextText) {
      aiMessages.unshift({
        type: "user",
        message: contextText,
        timestamp: (petTimestamp || Date.now()) - 2
      });
    }

    // Web search context: prepend as system-level context (injected as a user
    // message so the LLM sees it as factual context, not instructions).
    if (searchContext) {
      aiMessages.unshift({
        type: "user",
        message: searchContext,
        timestamp: (petTimestamp || Date.now()) - 3
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

    const onPhase = (phase: string) => {
      // Only honour phase frames while still pre-stream. Once the first
      // chunk arrives, onChunk flips to "streaming" and phase frames are
      // no-op (the backend still emits them but they'd be misleading).
      if (streamingPhase.value !== "thinking" && streamingPhase.value !== "retrieving") return;
      if (phase === "retrieving") streamingPhase.value = "retrieving";
    };
    const onChunk = (chunk: string) => {
      if (streamingPhase.value === "thinking" || streamingPhase.value === "retrieving") streamingPhase.value = "streaming";
      // Snapshot time-to-first-token on the first chunk — proxy for
      // retrieval + condense + synthesis latency in RAG turns. Client-side
      // measurement avoids a backend emit frame + clock-skew issues.
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
      streamed += chunk;
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
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      streamingPhase.value = "idle";
      abortController.value = null;
      persistActive();
      const idx = activeConversation.value?.messages?.findIndex(m => m.timestamp === petTimestamp) ?? -1;
      const petMsg = idx >= 0 ? activeConversation.value?.messages?.[idx] : null;
      if (petMsg && !petMsg.aborted && !petMsg.error && streamed.trim()) {
        forwardReplyToWeCom(streamed);
      }

      // ── Compaction check (Pi-inspired) ────────────────────────────
      maybeCompact();
    };
    const onError = (err: Error) => {
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      streamingPhase.value = "idle";
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
    };

    let abort: () => void;
    if (agentMode.value) {
      // ── Agent mode (Pi-inspired agent loop) ──────────────────────────
      const agentMessages = aiMessages
        .filter(m => (m.message ?? "").trim().length > 0)
        .map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.message }));

      // Pi parity — resume by session after max_turns: when the previous run in
      // this session was cut short, send only the user's continuation with
      // `resume: true`. The server restores the persisted tool trajectory
      // (incl. tool_result messages), so the model sees the real completed
      // calls and continues — a text-only re-send makes it guess state from
      // narration and redo completed writes (observed on the menu lifecycle).
      const resumeRun = lastAgentInterrupt.value?.sessionKey === (activeConversation.value?.key ?? "");
      let resumeMessages = agentMessages;
      if (resumeRun) {
        // Only the user's continuation travels in the request — the server
        // restores the persisted trajectory for this session.
        const lastUser = [...aiMessages].reverse().find(m => m.type === "user");
        resumeMessages = lastUser ? [{ role: "user", content: lastUser.message ?? "" }] : agentMessages;
        lastAgentInterrupt.value = null; // one-shot
      }

      // Clear per-turn state for this new send
      agentTurnSummaries.value = [];
      agentEvents.value = [];
      agentUsage.value = null;
      agentCompaction.value = null;
      pendingConfirmation.value = null;

      let currentTurnIdx = 0;
      let turnStartStreamLen = 0; // track streamed length at turn_start for thinkingText capture

      abort = streamAgentChat(
        {
          messages: resumeMessages,
          ...(resumeRun ? { resume: true } : {}),
          model: selectedModel.value,
          // In agent mode the backend appends its own <tool_call> tool prompt;
          // the frontend registry block ("tools run automatically, you do NOT
          // call them directly") would contradict the agent loop, so omit it.
          system_prompt: [agentSystemPrompt.value, systemPrompt.value, contextChangeSystemPrompt.value]
            .map(s => s.trim())
            .filter(Boolean)
            .join("\n\n"),
          max_turns: agentMaxTurns.value,
          ...(agentModelRotation.value.length > 1 ? { model_rotation: agentModelRotation.value } : {}),
          ...(images.length ? { images } : {}),
          session_id: activeConversation.value?.key ?? "",
        },
        {
          onDelta: (text: string) => {
            if (streamingPhase.value === "thinking" || streamingPhase.value === "retrieving") {
              streamingPhase.value = "streaming";
            }
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
            streamed += text;
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
          },
          onEvent: (event: AgentStreamEvent) => {
            agentEvents.value = [...agentEvents.value, event];

            switch (event.type) {
              case "agent_start":
                streamingPhase.value = "thinking";
                break;
              case "turn_start":
                currentTurnIdx = event.turn_index ?? currentTurnIdx + 1;
                turnStartStreamLen = streamed.length;
                // Append a thinking separator for turns after the first.
                if (currentTurnIdx > 1) {
                  streamed += "\n\n---\n\n";
                  setActiveMessages(msgs => {
                    const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
                    if (idx < 0) return msgs;
                    const next = [...msgs];
                    next[idx] = { ...next[idx], message: streamed };
                    return next;
                  });
                }
                agentTurnSummaries.value = [
                  ...agentTurnSummaries.value,
                  {
                    turnIndex: currentTurnIdx,
                    toolCalls: [],
                    startTime: event.timestamp,
                  },
                ];
                break;
              case "thinking":
                if (event.phase === "retrieving") {
                  streamingPhase.value = "retrieving";
                }
                break;
              case "turn_end": {
                // Update the current turn summary with tool results and thinking text
                const summaries = [...agentTurnSummaries.value];
                const last = summaries[summaries.length - 1];
                if (last) {
                  last.endTime = event.timestamp;
                  last.stopReason = event.stop_reason;
                  // Capture thinking text: content streamed between turn_start and turn_end
                  const thinkingText = streamed.slice(turnStartStreamLen).trim();
                  if (thinkingText) {
                    last.thinkingText = thinkingText;
                  }
                  if (event.tool_results) {
                    last.toolCalls = event.tool_results.map((tr: any) => ({
                      name: tr.name,
                      label: tr.name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                      content: tr.content,
                      error: tr.error,
                      durationMs: tr.duration_ms,
                    }));
                  }
                  agentTurnSummaries.value = summaries;
                }
                // Track token usage from turn_end
                if (event.usage) {
                  agentUsage.value = {
                    turnTokens: (event.usage.turn_tokens as number) ?? 0,
                    totalTokens: (event.usage.total_tokens as number) ?? agentUsage.value?.totalTokens ?? 0,
                    turns: currentTurnIdx,
                  };
                }
                // Attach tool calls to the pet message
                const lastSummary = summaries[summaries.length - 1];
                if (lastSummary && lastSummary.toolCalls.length) {
                  setActiveMessages(msgs => {
                    const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
                    if (idx < 0) return msgs;
                    const next = [...msgs];
                    const existing = next[idx].toolCalls ?? [];
                    next[idx] = {
                      ...next[idx],
                      toolCalls: [...existing, ...lastSummary.toolCalls],
                    };
                    return next;
                  });
                }
                break;
              }
              case "agent_end":
                streamingPhase.value = "done";
                // Pi parity: the loop now reports max_turns_reached when it ran
                // out of turns mid-task (previously hardcoded "completed"). Tell
                // the user the task may be unfinished so they can reply 继续 and
                // the loop resumes from the accumulated history.
                if (event.stop_reason === "max_turns_reached") {
                  const notice = "\n\n> ⚠️ 已达到最大轮次，任务可能未完成。回复「继续」可接着完成。\n\n";
                  streamed += notice;
                  setActiveMessages(msgs => {
                    const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
                    if (idx < 0) return msgs;
                    const next = [...msgs];
                    next[idx] = { ...next[idx], message: streamed };
                    return next;
                  });
                  // Mark the session interrupted so the next send resumes by
                  // session: the server restores the persisted tool trajectory.
                  lastAgentInterrupt.value = {
                    sessionKey: activeConversation.value?.key ?? "",
                  };
                }
                if (event.usage) {
                  agentUsage.value = {
                    turnTokens: 0,
                    totalTokens: (event.usage.total_tokens as number) ?? agentUsage.value?.totalTokens ?? 0,
                    turns: (event.usage.turns as number) ?? currentTurnIdx,
                  };
                }
                break;
              case "compaction":
                agentCompaction.value = {
                  beforeCount: event.before_count ?? 0,
                  afterCount: event.after_count ?? 0,
                  savedTokens: event.saved_tokens ?? 0,
                  timestamp: event.timestamp,
                };
                break;
              case "confirmation_required":
                // Tool requires user confirmation — the agent loop is paused.
                // MessageList renders Approve/Reject which call
                // approvePendingConfirmation / rejectPendingConfirmation.
                pendingConfirmation.value = {
                  toolName: (event.tool_name as string) || "unknown",
                  toolArgs: (event.tool_args as Record<string, any>) || {},
                  confirmationId: (event.confirmation_id as string) || "",
                  timestamp: event.timestamp,
                };
                break;
              case "model_switch": {
                // Pi-inspired escalation: the active model stalled (narrated
                // tool calls without executing them) so the loop handed off to
                // a stronger model. Surface the handoff so the stall — and the
                // recovery — isn't invisible in the main chat panel (parity
                // with KnowledgeChatPanel's model_switch handling).
                const m = (event.message ?? {}) as { from?: string; to?: string };
                if (m.from && m.to) {
                  const notice = `\n\n> ⚙️ 模型自动切换：${m.from} → ${m.to}\n\n`;
                  streamed += notice;
                  setActiveMessages(msgs => {
                    const idx = msgs.findIndex(x => x.timestamp === petTimestamp);
                    if (idx < 0) return msgs;
                    const next = [...msgs];
                    next[idx] = { ...next[idx], message: streamed, error: false, aborted: false };
                    return next;
                  });
                }
                break;
              }
              case "tool_execution_start": {
                // Pi: live tool lifecycle — show a "(running)" entry immediately so
                // the timeline reflects the tool while it executes (AgentTimeline
                // renders a Loading spinner for content === "(running)").
                const summaries = [...agentTurnSummaries.value];
                const last = summaries[summaries.length - 1];
                if (last && event.tool?.name) {
                  last.toolCalls = [
                    ...last.toolCalls,
                    {
                      name: event.tool.name,
                      label: event.tool.label || event.tool.name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                      content: "(running)",
                    },
                  ];
                  agentTurnSummaries.value = summaries;
                }
                break;
              }
              case "tool_execution_end": {
                // Pi: mark the running tool finished with its final content/error.
                const summaries = [...agentTurnSummaries.value];
                const last = summaries[summaries.length - 1];
                if (last && event.tool?.name) {
                  const call = last.toolCalls.find((tc: any) => tc.name === event.tool!.name);
                  if (call) {
                    if (event.tool.content) call.content = event.tool.content;
                    else if (call.content === "(running)") call.content = "";
                    call.error = event.tool.error;
                    call.durationMs = event.tool.duration_ms;
                  }
                  agentTurnSummaries.value = summaries;
                }
                break;
              }
              case "tool_execution_update": {
                // Pi: partial progress during long-running tool execution.
                // Update the current turn's tool call with the partial result.
                if (event.tool_call_id && event.partial_result) {
                  const summaries = [...agentTurnSummaries.value];
                  const last = summaries[summaries.length - 1];
                  if (last) {
                    const partialContent = typeof event.partial_result.content === "string"
                      ? event.partial_result.content
                      : JSON.stringify(event.partial_result);
                    // Find the matching tool call in the current turn
                    const matchingCall = last.toolCalls.find(
                      tc => tc.name === (event.tool as any)?.name
                    );
                    if (matchingCall) {
                      matchingCall.content = `[partial] ${partialContent}`;
                    }
                    agentTurnSummaries.value = summaries;
                  }
                }
                break;
              }
              case "error":
                onError(new Error(event.error ?? "Agent error"));
                break;
            }
          },
          onDone,
          onError,
        }
      ).abort;
    } else if (ragEnabled.value && ragActive.value) {
      // RAG mode — scope to the conversation's ctx:-tagged files.
      const ctxPaths = (session.tags ?? [])
        .filter(t => typeof t === "string" && t.startsWith("ctx:"))
        .map(t => (t as string).slice(4));
      let scope: string | undefined;
      if (ctxPaths.length === 1) {
        scope = ctxPaths[0];
      } else if (ctxPaths.length > 1) {
        // Find common directory prefix across all ctx paths
        const parts = ctxPaths.map(p => p.split("/"));
        const minLen = Math.min(...parts.map(p => p.length));
        const common: string[] = [];
        for (let i = 0; i < minLen; i++) {
          if (parts.every(p => p[i] === parts[0][i])) common.push(parts[0][i]);
          else break;
        }
        scope = common.join("/") || undefined;
      }

      const ragMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
      // Inject context-editing instructions as a system message so the AI knows
      // it can propose context file changes (BUG 1 fix — was only sent in non-RAG mode).
      if (contextChangeSystemPrompt.value) {
        ragMessages.push({ role: "system", content: contextChangeSystemPrompt.value });
      }
      ragMessages.push(
        ...aiMessages
          .filter(m => (m.message ?? "").trim().length > 0)
          .map(m => ({ role: m.type === "user" ? ("user" as const) : ("assistant" as const), content: m.message }))
      );
      const handlers: RagStreamHandlers = { onChunk, onSources, onPhase, onDone, onError };
      // num_queries only honored when hybrid on + no scope (matches backend
      // QueryFusionRetriever gating in domain/rag/engine.py).
      const numQueries = ragHybrid.value && !scope ? ragNumQueries.value : undefined;
      // Snapshot the RAG config used for this turn — badged on the pet
      // message as provenance so the user can tell which llama_index engine
      // mode + overrides produced each answer.
      const ragMeta = {
        chatMode: ragChatMode.value,
        hybrid: ragHybrid.value,
        rerank: ragRerank.value,
        citations: ragCitations.value,
        numQueries: numQueries ?? ragNumQueries.value,
        scope,
        category: ragCategory.value || undefined,
        tags: ragTags.value.length ? [...ragTags.value] : undefined
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
          scope,
          hybrid: ragHybrid.value,
          rerank: ragRerank.value,
          citations: ragCitations.value,
          ...(numQueries != null ? { num_queries: numQueries } : {}),
          chat_mode: ragChatMode.value,
          ...(ragCategory.value ? { category: ragCategory.value } : {}),
          ...(ragTags.value.length ? { tags: [...ragTags.value] } : {})
        },
        handlers
      ).abort;
    } else {
      // Build combined system prompt: caller-provided systemPrompt (e.g. file preview)
      // + context-editing instructions when the session has context files.
      // + tool descriptions (Pi-inspired: tell the LLM what tools are available).
      // + web search pending note when search is running in background.
      const toolPrompt = getToolsForSystemPrompt();
      const webSearchPendingNote = (webSearchEnabled.value && !searchContext)
        ? "Note: A web search has been initiated for the user's query. Results are being fetched and will be provided to you in a follow-up message. In your current response, briefly acknowledge the query and indicate that you're checking the latest information from the web."
        : "";
      const sysParts = [systemPrompt.value, contextChangeSystemPrompt.value, toolPrompt, webSearchPendingNote]
        .map(s => s.trim())
        .filter(Boolean);
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
  }

  function stopSending() {
    const targetTs = streamingTargetTimestamp.value;
    abortController.value?.abort();
    toolAbortController.value?.abort();
    sending.value = false;
    streamingPhase.value = "idle";
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
    await runStream(userIdx, petTimestamp, "regenerate");
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

    // ── Tool execution (Pi-inspired, same as sendMessage) ──────────────
    const toolSignal = new AbortController();
    toolAbortController.value = toolSignal;
    let initialSearchContext = "";
    // Snapshot for per-message tool timeline (mirrors sendMessage).
    const toolEventsStartIdx = toolEvents.value.length;

    if (webSearchEnabled.value && text) {
      const urls = extractUrls(text);

      if (urls.length > 0) {
        streamingPhase.value = "fetching";
        webSearching.value = true;
        for (const url of urls) {
          const result = await executeTool("web_fetch", { url }, toolSignal.signal);
          if (result?.content) {
            initialSearchContext = initialSearchContext
              ? `${initialSearchContext}\n\n${result.content}`
              : result.content;
          }
        }
        webSearching.value = false;

        if (initialSearchContext) {
          setActiveMessages(msgs => {
            const idx = msgs.findIndex(m => m.timestamp === userTimestamp);
            if (idx < 0) return msgs;
            const next = [...msgs];
            next[idx] = { ...next[idx], searchContext: initialSearchContext };
            return next;
          });
        }
      }

      let pendingSearchContext = "";
      Promise.resolve(
        executeTool("web_search", { query: text, maxResults: 6 }, toolSignal.signal).then(result => {
          webSearching.value = false;
          if (result?.content) pendingSearchContext = result.content;
        }).catch(() => {
          webSearching.value = false;
          webSearchResults.value = [];
        })
      ).finally(async () => {
        await streamPromise;
        if (!pendingSearchContext) return;
        await persistActive();
        const sess = activeConversation.value;
        if (!sess) return;
        const followUpPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() + 1 };
        const msgs = sess.messages ?? [];
        const prev = msgs.length;
        setActiveMessages(m => [...m, followUpPet]);
        await runStream(prev, followUpPet.timestamp, "send", pendingSearchContext);
      });
    } else {
      webSearchResults.value = [];
      // Tool states auto-synced by watcher
    }

    const streamPromise = runStream(i, insertedPet.timestamp, "resend", initialSearchContext);
    await streamPromise;

    // ── Attach per-message tool calls (Pi-inspired: tool timeline) ──
    attachTurnToolCalls(insertedPet.timestamp, toolEventsStartIdx);

    // ── Auto-detect KB save intent for resend ──────────────────────────
    const kbIntent2 = detectKBIntent(text);
    if (kbIntent2) {
      const petIdx2 = activeConversation.value?.messages?.findIndex(
        m => m.timestamp === insertedPet.timestamp
      ) ?? -1;
      if (petIdx2 >= 0) {
        const petMsg2 = activeConversation.value!.messages![petIdx2];
        const petText2 = petMsg2.message ?? "";
        if (petText2 && !/```knowledge:save/.test(petText2)) {
          const wrapped = autoWrapKnowledgeBlock(petText2, kbIntent2.path);
          setActiveMessages(msgs => {
            const next = [...msgs];
            next[petIdx2] = { ...next[petIdx2], message: wrapped };
            return next;
          });
          await persistActive();
        }
      }
    }
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
    await persistActive();
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

  function submitFeedback(timestamp: number, rating: AiChatFeedbackRating) {
    const current = feedback.value[timestamp];
    feedback.value = { ...feedback.value, [timestamp]: current === rating ? null : rating };
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
      const res = await queryDocuments<FaqDocument>({ cname: "faqs", limit: 100000 });
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
    const level = pct > 90 ? "critical" as const : pct > 70 ? "high" as const : pct > 40 ? "mid" as const : "low" as const;
    return { level, estimatedTokens, pct };
  });

  // Compaction history (Pi-inspired: surface silent background state to the UI).
  // Last 5 compaction events for the active session.
  interface CompactionEntry {
    sessionKey: string;
    timestamp: number;
    before: number;
    after: number;
    saved: number;
  }
  const compactionLog = ref<CompactionEntry[]>([]);
  const MAX_COMPACTION_LOG = 5;
  const lastCompaction = computed<CompactionEntry | null>(() => {
    if (!compactionLog.value.length) return null;
    return compactionLog.value[compactionLog.value.length - 1];
  });

  async function maybeCompact() {
    const s = activeConversation.value;
    if (!s?.messages?.length) return;

    const totalChars = s.messages.reduce(
      (sum, m) => sum + (m.message?.length ?? 0), 0
    );
    const estimatedTokens = Math.ceil(totalChars / CHARS_PER_TOKEN);
    if (estimatedTokens < COMPACTION_THRESHOLD_TOKENS) return;

    console.warn(
      `[aiChat] Compacting session ${s.key}: ~${estimatedTokens} tokens ` +
      `across ${s.messages.length} messages → backend /compact`
    );

    try {
      // Delegate to YiAi's /compact endpoint (Pi-inspired backend compaction)
      const msgs = s.messages.map(m => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.message ?? "",
      }));
      const result = await compactConversation(msgs, 4);

      if (result.error) {
        console.warn("[aiChat] Backend compaction returned error:", result.error);
        return;
      }

      // Convert compacted messages back to ChatMessage format
      const compacted: ChatMessage[] = result.messages.map(m => ({
        type: m.role === "user" ? "user" : "pet",
        message: m.content,
        timestamp: Date.now(),
      }));

      setActiveMessages(() => compacted);
      await persistActive();
      const entry: CompactionEntry = {
        sessionKey: s.key,
        timestamp: Date.now(),
        before: result.original_count,
        after: result.compacted_count,
        saved: Math.max(0, result.original_count - result.compacted_count),
      };
      compactionLog.value = [...compactionLog.value.slice(-(MAX_COMPACTION_LOG - 1)), entry];
      console.log(
        `[aiChat] Compaction complete: ${result.original_count} → ${result.compacted_count} messages`
      );
    } catch (e) {
      console.warn("[aiChat] Compaction failed:", e);
    }
  }

  // ── Prompt templates (Pi-inspired: $1, $2 argument substitution) ──────
  interface PromptTemplate { name: string; content: string }
  const promptTemplates = ref<PromptTemplate[]>(loadJson(STORAGE_TEMPLATES_KEY, []));

  function saveTemplates() {
    saveJson(STORAGE_TEMPLATES_KEY, promptTemplates.value);
  }

  function addTemplate(name: string, content: string): boolean {
    if (promptTemplates.value.some(t => t.name === name)) return false;
    promptTemplates.value = [...promptTemplates.value, { name, content }];
    saveTemplates();
    return true;
  }

  function removeTemplate(name: string): boolean {
    const idx = promptTemplates.value.findIndex(t => t.name === name);
    if (idx < 0) return false;
    promptTemplates.value = promptTemplates.value.filter(t => t.name !== name);
    saveTemplates();
    return true;
  }

  function applyTemplate(name: string, args: string[]): string | null {
    const t = promptTemplates.value.find(t => t.name === name);
    if (!t) return null;
    let result = t.content;
    args.forEach((arg, i) => {
      result = result.replace(new RegExp(`\\$${i + 1}`, "g"), arg);
    });
    return result;
  }

  const { handleCommand } = useSlashCommands({
    activeConversation, sending, input, allTools, setActiveMessages, persistActive,
    createConversation, executeTool, maybeCompact, stopSending, retryLastMessage, renameConversation, exportConversation, exportConversationHtml, conversations, selectConversation, promptTemplates, addTemplate, removeTemplate, applyTemplate,
  });

  // Live agent turn progress for the UI: how many turns the agent has used
  // against its max_turns budget. Complements the backend budget awareness —
  // the model knows its budget, the user sees it in real time, so they can
  // reply 继续 (when nearLimit) or steer instead of waiting on an agent that
  // is about to hit the wall.
  const agentTurnProgress = computed(() => {
    const summaries = agentTurnSummaries.value;
    const current = summaries.length ? summaries[summaries.length - 1].turnIndex : 0;
    const max = agentMaxTurns.value;
    const active = ["thinking", "streaming", "retrieving"].includes(streamingPhase.value);
    return {
      current,
      max,
      active,
      nearLimit: active && max > 0 && current >= max - 2,
    };
  });

  return {
    agentTurnProgress,
    conversations,
    activeConversation,
    loading,
    error,
    input,
    sending,
    streamingTargetTimestamp,
    streamingType,
    streamingPhase,
    scrollTick,
    copyFeedback,
    feedback,
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
    knowledgeMode,
    contextSwitchEnabled,
    ragEnabled,
    ragActive,
    ragHybrid,
    ragRerank,
    ragCitations,
    ragNumQueries,
    ragChatMode,
    ragCategory,
    ragTags,
    webSearchEnabled,
    webSearchResults,
    webSearching,
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
    deleteContextSection,
    getContextSectionContent,
    contextChangeHistory,
    undoLastContextChange,
    addContextFile,
    removeContextFile,
    contextChangeSystemPrompt,
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
    setContextSwitchEnabled,
    setSystemPrompt,
    systemPrompt,
    deleteConversation,
    sendMessage,
    stopSending,
    regenerateMessage,
    retryLastMessage,
    resendMessage,
    deleteMessage,
    editMessage,
    copyMessage,
    submitFeedback,
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
    // Agent mode (Pi-inspired agent loop)
    agentMode,
    toggleAgentMode,
    agentTurnSummaries,
    agentEvents,
    agentMaxTurns,
    agentModelRotation,
    agentUsage,
    agentCompaction,
    pendingConfirmation,
    approvePendingConfirmation,
    rejectPendingConfirmation,
    agentSystemPrompt,
    selectedModel,
    availableModels,
    modelsLoading,
    fetchModels,
    // Prompt templates
    promptTemplates,
    addTemplate,
    removeTemplate,
    applyTemplate,
  };
});
