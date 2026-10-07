/**
 * AI Chat store — conversation list, active session, SSE streaming via
 * `streamChat`, message persistence through the YiWeb sessions API.
 *
 * Refactored: conversation CRUD, streaming, context files, and tool events
 * are extracted into focused composables under `./aiChat/`. The main store
 * composes them and provides the orchestration layer (sendMessage,
 * resendMessage, etc.), maintaining full backward compatibility.
 */
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { useToolRegistry } from "@/hooks/useToolRegistry";
import { useConversationTree } from "@/hooks/useConversationTree";
import { registerAiChatTools } from "@/hooks/useAiChatTools";
import { useSlashCommands } from "@/hooks/useSlashCommands";
import { useRagSettings } from "@/views/ai-chat/composables/useRagSettings";
import { useChatUiState } from "@/views/ai-chat/composables/useChatUiState";
import { useToolExecution } from "@/views/ai-chat/composables/useToolExecution";
import { useConversationCompact } from "@/views/ai-chat/composables/useConversationCompact";
import { usePromptTemplates } from "@/views/ai-chat/composables/usePromptTemplates";
import { useModelSelection } from "@/views/ai-chat/composables/useModelSelection";
import { updateSession } from "@/api/modules/sessions";
import { loadRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import { getStorageQuota } from "@/utils/storage";
import type { WebSearchResult, WebImageResult } from "@/api/modules/searchService";
import type { SessionDocument, ChatMessage, FaqDocument } from "@/api/interface/yiAi";
import type { AiChatStreamingType } from "@/views/ai-chat/types";

// ── Extracted composables ──
import { useConversations } from "./aiChat/useConversations";
import { useStreaming } from "./aiChat/useStreaming";
import { useContextFiles } from "./aiChat/useContextFiles";
import { useToolEvents } from "./aiChat/useToolEvents";
import { useOrchestration } from "./aiChat/useOrchestration";
import { useInput } from "./aiChat/useInput";
import { useUiToggles } from "./aiChat/useUiToggles";
import { useFaq } from "./aiChat/useFaq";
import { useMessageOps } from "./aiChat/useMessageOps";

export const useAiChatStore = defineStore("yivad-aiChat", () => {
  // ═══════════════════════════════════════════════════════════════
  // Phase 1 — Shared state refs (owned by main store)
  // ═══════════════════════════════════════════════════════════════

  const knowledgeSidebarVisible = ref(false);
  const activeConversation = ref<SessionDocument | null>(null);
  const input = ref("");
  const copyFeedback = ref<Record<string, string>>({});
  const draftImages = ref<string[]>([]);
  const faqs = ref<FaqDocument[]>([]);
  const faqLoading = ref(false);
  const systemPrompt = ref("");

  // Streaming state (shared between orchestrator and useStreaming)
  const sending = ref(false);
  const abortController = ref<{ abort: () => void } | null>(null);
  const toolAbortController = ref<AbortController | null>(null);
  const streamingTargetTimestamp = ref<number | null>(null);
  const streamingType = ref<AiChatStreamingType>("");
  const thinkingStartTs = ref<number | null>(null);
  type StreamingPhase = "idle" | "fetching" | "preparing" | "thinking" | "retrieving" | "streaming" | "done";
  const streamingPhase = ref<StreamingPhase>("idle");
  const scrollTick = ref(0);

  // RAG settings (from composable)
  const { ragEnabled, ragHybrid, ragRerank, ragCitations, ragHyde, ragFast, ragScope, ragNumQueries, ragChatMode } = useRagSettings();

  /** Effective RAG scope: explicit user setting takes priority; falls back to common prefix of context files. */
  const effectiveRagScope = computed(() => {
    if (ragScope.value) return ragScope.value;
    const tags = activeConversation.value?.tags ?? [];
    const ctxPaths = tags
      .filter(t => typeof t === "string" && t.startsWith("ctx:"))
      .map(t => (t as string).slice(4));
    if (!ctxPaths.length) return "";
    if (ctxPaths.length === 1) return ctxPaths[0];
    const parts = ctxPaths.map(p => p.split("/"));
    const minLen = Math.min(...parts.map(p => p.length));
    const common: string[] = [];
    for (let i = 0; i < minLen; i++) {
      if (parts.every(p => p[i] === parts[0][i])) common.push(parts[0][i]);
      else break;
    }
    return common.join("/");
  });

  // UI state — extract only the fields not owned by sub-modules.
  const {
    faqVisible,
    faqSearch,
    faqApplyMode,
    weChatVisible,
    tagManagerVisible,
    llamaIndexVisible,
    sessionEditVisible
  } = useChatUiState();

  // Model selection (from composable)
  const { selectedModel, availableModels, modelsLoading, fetchModels } = useModelSelection();

  // Prompt templates (from composable)
  const { promptTemplates, addTemplate, removeTemplate, applyTemplate } = usePromptTemplates();

  // Web search state
  const webSearchEnabled = ref(false);
  const webSearchResults = ref<WebSearchResult[]>([]);
  const webSearchImages = ref<WebImageResult[]>([]);
  const webSearching = ref(false);
  const searchTimingMs = ref(0);
  const lastSearchQuery = ref("");

  // RAG response feedback — source count from last completed response
  const lastRagSourceCount = ref(0);
  const lastRagTopScore = ref(0);

  // Tool registry (Pi-inspired)
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

  // ═══════════════════════════════════════════════════════════════
  // Phase 2 — Core primitives
  // ═══════════════════════════════════════════════════════════════

  const messages = computed<ChatMessage[]>(() => activeConversation.value?.messages ?? []);

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
    if (import.meta.env.DEV) console.log(`[setActiveMessages] msgs ${beforeLen}→${next.length}, pet msg len ${beforePetMsg}→${afterPetMsg}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Phase 3 — Conversation management
  // ═══════════════════════════════════════════════════════════════
  // Delegate pattern: stopSending is defined in Phase 4 but
  // selectConversation needs it. The delegate object is captured
  // by reference, so the real impl is available at runtime.

  const _stopDelegate = { fn: () => {} };

  const conv = useConversations({
    activeConversation,
    sending,
    stopSending: () => _stopDelegate.fn()
  });

  // ═══════════════════════════════════════════════════════════════
  // Phase 4 — Persist + Stop (needs conv.conversations)
  // ═══════════════════════════════════════════════════════════════

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
      await Promise.race([prev, new Promise<void>(r => setTimeout(r, 15_000))]);
      if (!activeConversation.value) return false;
      const msgs = activeConversation.value.messages;
      const key = activeConversation.value.key;
      const now = Date.now();
      await updateSession(key, { messages: msgs, updatedAt: now });
      conv.conversations.value = conv.conversations.value.map(c =>
        c.key === key ? { ...c, updatedAt: now, messages: msgs } : c
      );

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

  // Wire up delegate so selectConversation can abort streams
  _stopDelegate.fn = stopSending;

  // ═══════════════════════════════════════════════════════════════
  // Phase 5 — Context files (needs updateSessionMeta from conv)
  // ═══════════════════════════════════════════════════════════════

  const ctx = useContextFiles({
    activeConversation,
    updateSessionMeta: conv.updateSessionMeta,
    ragEnabled
  });

  // ═══════════════════════════════════════════════════════════════
  // Phase 6 — Streaming (needs everything from Phase 1–5)
  // ═══════════════════════════════════════════════════════════════

  // Forward refs needed by useStreaming's maybeCompact callback
  let _maybeCompactWrapper: () => Promise<void> = async () => {};
  let _forwardReplyToWeCom: (c: string) => Promise<void> = async () => {};

  const stream = useStreaming({
    activeConversation,
    sending,
    abortController,
    streamingTargetTimestamp,
    streamingType,
    thinkingStartTs,
    streamingPhase,
    scrollTick,
    setActiveMessages,
    persistActive,
    ragEnabled,
    ragActive: computed(() => ragEnabled.value),
    ragHybrid,
    ragRerank,
    ragCitations,
    ragHyde,
    ragFast,
    ragScope: effectiveRagScope,
    ragNumQueries,
    ragChatMode,
    lastRagSourceCount,
    lastRagTopScore,
    webSearchEnabled,
    webSearchResults,
    webSearchImages,
    searchTimingMs,
    selectedModel,
    systemPrompt,
    getToolsForSystemPrompt,
    maybeCompact: async () => {
      await _maybeCompactWrapper();
    },
    loadContextText: ctx.loadContextText,
    forwardReplyToWeCom: async (content: string) => {
      await _forwardReplyToWeCom(content);
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // Phase 7 — Tool events
  // ═══════════════════════════════════════════════════════════════

  const toolEv = useToolEvents({
    toolEvents,
    setActiveMessages,
    persistActive
  });

  // ═══════════════════════════════════════════════════════════════
  // Phase 8 — RAG computed refs + tool auto-enable
  // ═══════════════════════════════════════════════════════════════

  const ragActive = computed(() => ragEnabled.value);

  const ragScoped = computed(() => {
    if (!ragEnabled.value) return false;
    const tags = activeConversation.value?.tags ?? [];
    return tags.some(t => typeof t === "string" && t.startsWith("ctx:"));
  });

  // ── Token usage tracking (SSE passthrough + local estimation) ──
  const tokenUsage = ref<{
    systemPrompt: number;
    userMessages: number;
    assistantMessages: number;
    toolCalls: number;
    responseReserve: number;
    total: number;
    modelWindow: number;
  } | null>(null);

  function updateTokenUsage(usage: Partial<typeof tokenUsage.value> | null) {
    if (usage) {
      tokenUsage.value = {
        systemPrompt: usage.systemPrompt ?? 0,
        userMessages: usage.userMessages ?? 0,
        assistantMessages: usage.assistantMessages ?? 0,
        toolCalls: usage.toolCalls ?? 0,
        responseReserve: usage.responseReserve ?? 1024,
        total: usage.total ?? 0,
        modelWindow: usage.modelWindow ?? 8192
      };
    } else {
      const msgs = activeConversation.value?.messages ?? [];
      const sysLen = systemPrompt.value.length;
      let userLen = 0;
      let asstLen = 0;
      for (const m of msgs) {
        if (m.type === "user") userLen += (m.message ?? "").length;
        else if (m.type === "pet") asstLen += (m.message ?? "").length;
      }
      const CHARS_PER_TOKEN = 4;
      const MODEL_WINDOW = 8192;
      tokenUsage.value = {
        systemPrompt: Math.ceil(sysLen / CHARS_PER_TOKEN),
        userMessages: Math.ceil(userLen / CHARS_PER_TOKEN),
        assistantMessages: Math.ceil(asstLen / CHARS_PER_TOKEN),
        toolCalls: 0,
        responseReserve: 1024,
        total: Math.ceil((sysLen + userLen + asstLen) / CHARS_PER_TOKEN),
        modelWindow: MODEL_WINDOW
      };
    }
  }

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

  // Auto-update token usage estimate when messages or system prompt change
  watch(
    [() => activeConversation.value?.messages, systemPrompt],
    () => updateTokenUsage(null),
    { deep: false }
  );

  // ═══════════════════════════════════════════════════════════════
  // Phase 9 — Other hooks & composables
  // ═══════════════════════════════════════════════════════════════

  const { searchQuery, expandedFolders, toggleFolder, conversationTree, filteredConversationTree, isStreaming } =
    useConversationTree({ conversations: conv.conversations, sending, streamingTargetTimestamp });

  registerAiChatTools({
    registerTool,
    webSearchResults,
    webSearchImages
  });

  // Tool execution (depends on runStream from stream)
  const { executePreStreamTools, preFetchSearch } = useToolExecution({
    webSearchEnabled,
    webSearchResults,
    webSearching,
    streamingPhase,
    executeTool,
    setActiveMessages,
    activeConversation,
    persistActive,
    runStream: stream.runStream
  });

  // Conversation compact (Pi-inspired)
  const { compactionLog, lastCompaction, maybeCompact } = useConversationCompact({
    activeConversation,
    setActiveMessages,
    persistActive
  });

  // Wire up the forward refs now that maybeCompact is available
  _maybeCompactWrapper = maybeCompact;

  // Context overflow detection
  const CHARS_PER_TOKEN = 4;
  const CONTEXT_WINDOW = 8192;
  const contextPressure = computed(() => {
    const tu = tokenUsage.value;
    if (tu) {
      const pct = Math.round((tu.total / tu.modelWindow) * 100);
      const level =
        pct > 90 ? ("critical" as const) : pct > 70 ? ("high" as const) : pct > 40 ? ("mid" as const) : ("low" as const);
      return { level, estimatedTokens: tu.total, pct };
    }
    // Fallback: character-count estimation
    const s = activeConversation.value;
    if (!s?.messages?.length) return { level: "low" as const, estimatedTokens: 0, pct: 0 };
    const totalChars = s.messages.reduce((sum, m) => sum + (m.message?.length ?? 0), 0);
    const estimatedTokens = Math.ceil(totalChars / CHARS_PER_TOKEN);
    const pct = Math.round((estimatedTokens / CONTEXT_WINDOW) * 100);
    const level =
      pct > 90 ? ("critical" as const) : pct > 70 ? ("high" as const) : pct > 40 ? ("mid" as const) : ("low" as const);
    return { level, estimatedTokens, pct };
  });

  // Slash commands
  const { handleCommand } = useSlashCommands({
    activeConversation,
    sending,
    input,
    allTools,
    setActiveMessages,
    persistActive,
    createConversation: conv.createConversation,
    executeTool,
    maybeCompact,
    stopSending,
    retryLastMessage: async () => {
      await orch.retryLastMessage();
    },
    renameConversation: conv.renameConversation,
    exportConversation: conv.exportConversation,
    exportConversationHtml: conv.exportConversationHtml,
    conversations: conv.conversations,
    selectConversation: conv.selectConversation,
    promptTemplates,
    addTemplate,
    removeTemplate,
    applyTemplate
  });

  // ═══════════════════════════════════════════════════════════════
  // Phase 10 — WeChat forward helper
  // ═══════════════════════════════════════════════════════════════

  _forwardReplyToWeCom = async function forwardReplyToWeCom(content: string) {
    const text = content.trim();
    if (!text) return;
    const targets = loadRobots().filter(r => r && r.enabled && r.autoForward && r.webhook);
    if (!targets.length) return;
    await Promise.all(targets.map(r => sendWeChatMessage(r.webhook, text).catch(() => {})));
  };

  // ═══════════════════════════════════════════════════════════════
  // Phase 11 — Orchestration (extracted to useOrchestration)
  // ═══════════════════════════════════════════════════════════════

  const orch = useOrchestration({
    sending,
    draftImages,
    webSearchResults,
    webSearchImages,
    searchTimingMs,
    lastSearchQuery,
    activeConversation: activeConversation as any,
    input,
    setActiveMessages,
    toolEvents,
    toolAbortController,
    scrollTick,
    executePreStreamTools,
    runStream: stream.runStream,
    injectLateSearch: stream._injectLateSearch,
    attachTurnToolCalls: toolEv.attachTurnToolCalls,
    attachSearchResults: stream._attachSearchResults,
    loadContextText: ctx.loadContextText,
    handleCommand,
    createConversation: conv.createConversation,
    persistActive
  });

  const msgOps = useMessageOps({ sending, activeConversation, persistActive, copyFeedback });

  // ═══════════════════════════════════════════════════════════════
  // Phase 12 — Input & draft (extracted to useInput)
  // ═══════════════════════════════════════════════════════════════

  const inp = useInput({ input, draftImages });

  // ═══════════════════════════════════════════════════════════════
  // Phase 13 — FAQ (extracted to useFaq)
  // ═══════════════════════════════════════════════════════════════

  const faqMod = useFaq({ faqs, faqLoading, faqVisible, faqApplyMode, input });

  // ═══════════════════════════════════════════════════════════════
  // Phase 14 — UI toggles (extracted to useUiToggles)
  // ═══════════════════════════════════════════════════════════════

  const ui = useUiToggles({ activeConversation, sessionEditVisible, tagManagerVisible, weChatVisible, llamaIndexVisible, systemPrompt, updateSessionMeta: conv.updateSessionMeta });

  // ═══════════════════════════════════════════════════════════════
  // Phase 15 — Return (backward-compatible surface)
  // ═══════════════════════════════════════════════════════════════

  return {
    // ── Shared state ──
    knowledgeSidebarVisible,
    messages,
    input,
    sending,
    streamingTargetTimestamp,
    streamingType,
    streamingPhase,
    thinkingStartTs,
    scrollTick,
    copyFeedback,
    draftImages,
    webSearchEnabled,
    webSearchResults,
    webSearchImages,
    webSearching,
    searchTimingMs,
    lastSearchQuery,
    systemPrompt,
    error: conv.error,

    // ── Conversations (from useConversations) ──
    conversations: conv.conversations,
    activeConversation,
    loading: conv.loading,
    conversationsLoaded: conv.conversationsLoaded,
    batchMode: conv.batchMode,
    selectedKeys: conv.selectedKeys,
    loadConversations: conv.loadConversations,
    selectConversation: conv.selectConversation,
    createConversation: conv.createConversation,
    renameConversation: conv.renameConversation,
    updateSessionMeta: conv.updateSessionMeta,
    toggleFavorite: conv.toggleFavorite,
    toggleBatchMode: conv.toggleBatchMode,
    toggleSelection: conv.toggleSelection,
    selectAll: conv.selectAll,
    clearSelection: conv.clearSelection,
    bulkDelete: conv.bulkDelete,
    clearAllConversations: conv.clearAllConversations,
    exportConversation: conv.exportConversation,
    exportConversationHtml: conv.exportConversationHtml,
    deleteConversation: conv.deleteConversation,

    // ── Context files (from useContextFiles) ──
    contextEditorVisible: ctx.contextEditorVisible,
    contextEditorDraft: ctx.contextEditorDraft,
    contextPanelNewMode: ctx.contextPanelNewMode,
    contextChangeHistory: ctx.contextChangeHistory,
    applyContextChange: ctx.applyContextChange,
    undoLastContextChange: ctx.undoLastContextChange,
    addContextFile: ctx.addContextFile,
    removeContextFile: ctx.removeContextFile,
    getContextSectionContent: ctx.getContextSectionContent,
    openContextEditor: ctx.openContextEditor,
    closeContextEditor: ctx.closeContextEditor,
    saveContextEditorContent: ctx.saveContextEditorContent,
    enterNewContextMode: ctx.enterNewContextMode,
    exitNewContextMode: ctx.exitNewContextMode,
    saveContextToKnowledge: ctx.saveContextToKnowledge,

    // ── UI toggles ──
    sessionEditVisible,
    tagManagerVisible,
    weChatVisible,
    llamaIndexVisible,
    openSessionEdit: ui.openSessionEdit,
    closeSessionEdit: ui.closeSessionEdit,
    openTagManager: ui.openTagManager,
    closeTagManager: ui.closeTagManager,
    toggleTagManager: ui.toggleTagManager,
    openWeChat: ui.openWeChat,
    closeWeChat: ui.closeWeChat,
    openLlamaIndex: ui.openLlamaIndex,
    closeLlamaIndex: ui.closeLlamaIndex,
    toggleLlamaIndex: ui.toggleLlamaIndex,
    addTag: ui.addTag,
    removeTag: ui.removeTag,

    // ── RAG ──
    ragEnabled,
    ragActive,
    ragScoped,
    effectiveRagScope,
    ragHybrid,
    ragRerank,
    ragCitations,
    ragHyde,
    ragFast,
    ragScope,
    ragNumQueries,
    ragChatMode,
    lastRagSourceCount,
    lastRagTopScore,

    // ── Orchestration ──
    setSystemPrompt: ui.setSystemPrompt,
    sendMessage: orch.sendMessage,
    stopSending,
    regenerateMessage: orch.regenerateMessage,
    retryLastMessage: orch.retryLastMessage,
    deepenSearch: orch.deepenSearch,
    preFetchSearch,
    resendMessage: orch.resendMessage,
    deleteMessage: msgOps.deleteMessage,
    editMessage: msgOps.editMessage,
    copyMessage: msgOps.copyMessage,
    persistActive,

    // ── Input & draft ──
    clearInput: inp.clearInput,
    addDraftImageFiles: inp.addDraftImageFiles,
    removeDraftImage: inp.removeDraftImage,
    clearDraftImages: inp.clearDraftImages,

    // ── FAQ ──
    faqs,
    faqVisible,
    faqSearch,
    faqLoading,
    faqApplyMode,
    loadFaqs: faqMod.loadFaqs,
    openFaq: faqMod.openFaq,
    closeFaq: faqMod.closeFaq,
    toggleFaq: faqMod.toggleFaq,
    applyFaq: faqMod.applyFaq,

    // ── Context overflow ──
    contextPressure,

    // ── Compaction ──
    maybeCompact,
    compactionLog,
    lastCompaction,

    // ── Conversation tree ──
    searchQuery,
    expandedFolders,
    conversationTree,
    filteredConversationTree,
    toggleFolder,
    isStreaming,

    // ── Tool registry ──
    toolEvents,
    activeTools,
    allTools,
    registerTool,
    setToolEnabled,
    getToolsForSystemPrompt,

    // ── Model ──
    selectedModel,
    availableModels,
    modelsLoading,
    fetchModels,

    // ── Prompt templates ──
    promptTemplates,
    addTemplate,
    removeTemplate,
    applyTemplate,

    // ── Token usage ──
    tokenUsage,
    updateTokenUsage
  };
});
