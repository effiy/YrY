/**
 * YiPet Chat — Pinia store (main orchestrator).
 */
import { defineStore } from 'pinia';
import { computed, reactive, watch } from 'vue';
import type {
  ChatMessage, KnowledgeFileEntry, RagSource,
  WebImageResult, WebSearchResult, WeWorkBot,
} from '@/api/types';
import { DEFAULT_MODEL } from '../constants';
import type { ChatState, Message, SessionItem } from '../types';
import { applyThemeColors, applyThemeHex, applyElementPalette, applyElementTheme, generatePalette } from '@/shared/theme';
import { t } from '@/shared/i18n';
import { useChatWindow } from './useChatWindow';
import { injectChatService, useModelSelection } from '../composables/useModelSelection';
import { useChatUiState } from '../composables/useChatUiState';
import { useConversationCompact } from '../composables/useConversationCompact';
import { injectServices as injectSharedServices, setNotifyHandler, notify, getChat, getSessions, getWework, getSearch, getRag, getKnowledge, getTranslation, getClient } from './services';
import { useStreamingStore } from './streaming';
import { useContextFilesStore } from './contextFiles';
import { useToolEventsStore } from './toolEvents';
import type { ToolCall } from '../types';
import {
  readPageInfo, slugifyUrl,
  mapMessages, isSearchWorthy, formatSearchResults,
  deduplicateByDomain, rankByReputation, ngrams, jaccard,
  findSessionByUrl,
} from './chatUtils';
import { exportCurrentSessionMarkdown as _exportMarkdown, exportConversationHtml as _exportHtml } from './chatExport';
import { warnIfQuotaLow } from '@/shared/storage/quota';
import { readBatchKV, writeBatchKV, writeKV } from '@/shared/storage/kv';

export type { ChatState, Message, SessionItem };

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_WIDTH = 760;
const MIN_WIDTH = 480;
const MIN_HEIGHT = 400;
const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 600;
const CTX_PREFIX = 'ctx:';

function detectProject(url: string): string {
  if (!url) return '';
  if (url.includes('localhost:8848') || url.includes('yivad')) return 'YiVad';
  if (url.includes('localhost:10086') || url.includes('yiai')) return 'YiAi';
  if (url.includes('yipet://')) return 'YiPet';
  if (url.includes('github.com')) return 'GitHub';
  return '';
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useChatStore = defineStore('chat', () => {
  // ── Sub-stores ────────────────────────────────────────────────────────
  const streamingStore = useStreamingStore();
  const ctxFilesStore = useContextFilesStore();
  const toolEventsStore = useToolEventsStore();

  // ── Composables ───────────────────────────────────────────────────────
  const { selectedModel: _selModel, availableModels: _availModels, modelsLoading, fetchModels: _fetchModels } = useModelSelection();
  const uiState = useChatUiState();

  // ── Drag/resize state (non-reactive) ──────────────────────────────────
  const _dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  const _resizeStart = { x: 0, y: 0, wx: 0, wy: 0, w: 0, h: 0, dir: '' };
  const _sidebarResizeStart = { x: 0, startWidth: 0 };

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;

  // ── Session promise (module-level) ────────────────────────────────────
  let _loadSessionsPromise: Promise<void> | null = null;
  let _persistChain: Promise<void> = Promise.resolve();

  // ── Main reactive state ───────────────────────────────────────────────
  const state = reactive<ChatState>({
    visible: false,
    title: 'Chat with me',
    viewState: 'empty',
    pageInfo: { title: '', url: '', iconUrl: '' },
    messages: [],
    isProcessing: false,
    sessions: [],
    currentSessionId: null,
    searchInputValue: '',
    searchQuery: '',
    sessionProjectFilter: '',
    sessionLoading: false,
    sessionError: '',
    sessionsLoaded: false,
    lastSyncTime: 0,
    sidebarCollapsed: true,
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
    batchMode: false,
    selectedSessionIds: [],
    draftImages: [],
    ragSources: [],
    ragEnabled: false,
    ragScope: '',
    ragScopeIsFile: false,
    ragStatus: null,
    ragStatusLoading: false,
    ragFast: false,
    ragHybrid: true,
    ragRerank: true,
    ragCitations: true,
    ragHyde: false,
    ragNumQueries: 0,
    ragChatMode: "condense_plus_context",
    knowledgeTree: [] as Array<{ category: string; files: KnowledgeFileEntry[] }>,
    knowledgeLoading: false,
    knowledgeError: '',
    knowledgePreviewVisible: false,
    knowledgePreviewPath: '',
    knowledgePreviewData: null,
    knowledgePreviewLoading: false,
    llamaIndexVisible: false,
    webSearchEnabled: false,
    webSearchImages: [],
    webSearching: false,
    searchTimingMs: 0,
    lastSearchQuery: '',
    selectedModel: DEFAULT_MODEL,
    availableModels: [],
    sessionSummaryVisible: false,
    sessionSummaryLoading: false,
    sessionSummaryText: '',
    sessionSummaryError: '',
    weChatRobots: [],
    weChatRobotsDraft: [],
    weChatSettingsVisible: false,
    colorIndex: 0,
    customColor: '',
    systemPrompt: '',
    roleName: 'Teacher',
    roleImageUrl: '',
    streamingTargetTimestamp: null,
    streamingType: '',
    streamingPhase: '',
    thinkingStartTs: null,
    webSearchResults: [],
    toolEvents: [],
    contextEditorVisible: false,
    contextEditorDraft: '',
    contextPanelNewMode: false,
    selectedKeys: new Set<string>(),
    contextChangeHistory: [],
    compactionLog: [],
    scrollTick: 0,
    copyFeedback: {},
    faqVisible: false,
    faqSearch: '',
    faqApplyMode: 'append',
    faqs: [],
    faqLoading: false,
    sessionEditVisible: false,
    tagManagerVisible: false,
    inputTemplate: '',
    inputText: '',
    promptHistory: [],
    promptTemplates: [],
    promptHistoryVisible: false,
    ws: {
      x: Math.max(0, vw - DEFAULT_WIDTH),
      y: 0,
      width: DEFAULT_WIDTH,
      height: vh,
      isFullscreen: false,
    },
    isDragging: false,
    isResizing: false,
  });

  // ── Bidirectional sync: sub-stores ↔ main state ──────────────────────

  // Streaming store → main state
  watch(() => streamingStore.isProcessing, v => { state.isProcessing = v; }, { flush: 'post' });
  watch(() => streamingStore.streamingTargetTimestamp, v => { state.streamingTargetTimestamp = v; }, { flush: 'post' });
  watch(() => streamingStore.streamingType, v => { state.streamingType = v; }, { flush: 'post' });
  watch(() => streamingStore.streamingPhase, v => { state.streamingPhase = v; }, { flush: 'post' });
  watch(() => streamingStore.thinkingStartTs, v => { state.thinkingStartTs = v; }, { flush: 'post' });
  watch(() => streamingStore.webSearchResults, v => { state.webSearchResults = [...v]; }, { flush: 'post' });
  watch(() => streamingStore.webSearchImages, v => { state.webSearchImages = [...v]; }, { flush: 'post' });
  watch(() => streamingStore.webSearching, v => { state.webSearching = v; }, { flush: 'post' });
  watch(() => streamingStore.searchTimingMs, v => { state.searchTimingMs = v; }, { flush: 'post' });
  watch(() => streamingStore.lastSearchQuery, v => { state.lastSearchQuery = v; }, { flush: 'post' });

  // Tool events → main state
  watch(() => toolEventsStore.toolEvents, v => { state.toolEvents = [...v]; }, { flush: 'post' });

  // Context files → main state
  watch(() => ctxFilesStore.contextChangeHistory, v => { state.contextChangeHistory = [...v]; }, { flush: 'post' });
  watch(() => ctxFilesStore.contextEditorVisible, v => { state.contextEditorVisible = v; }, { flush: 'post' });
  watch(() => ctxFilesStore.contextEditorDraft, v => { state.contextEditorDraft = v; }, { flush: 'post' });
  watch(() => ctxFilesStore.contextPanelNewMode, v => { state.contextPanelNewMode = v; }, { flush: 'post' });

  // Bind context files store to active conversation
  ctxFilesStore.bind(
    () => state.sessions.find((s) => s.id === state.currentSessionId) || null,
    async (key, meta) => updateSessionMeta(key, meta),
    async (path: string) => {
      try {
        const knowledge = getKnowledge();
        const res = await knowledge.read(path);
        if (res.ok && res.data) return { content: res.data.content };
        return null;
      } catch { return null; }
    },
  );

  // ── Model composable syncs ────────────────────────────────────────────

  watch(_selModel, v => { if (state.selectedModel !== v) state.selectedModel = v; }, { immediate: true, flush: 'post' });
  watch(() => state.selectedModel, v => { if (_selModel.value !== v) _selModel.value = v; }, { flush: 'post' });
  watch(_availModels, v => { if (state.availableModels !== v) state.availableModels = v; }, { immediate: true, flush: 'post' });

  // UI state syncs to main state
  watch(uiState.faqVisible, v => { if (state.faqVisible !== v) state.faqVisible = v; }, { immediate: true, flush: 'post' });
  watch(() => state.faqVisible, v => { if (uiState.faqVisible.value !== v) uiState.faqVisible.value = v; }, { flush: 'post' });
  watch(uiState.faqSearch, v => { if (state.faqSearch !== v) state.faqSearch = v; }, { immediate: true, flush: 'post' });
  watch(() => state.faqSearch, v => { if (uiState.faqSearch.value !== v) uiState.faqSearch.value = v; }, { flush: 'post' });
  watch(uiState.faqApplyMode, v => { if (state.faqApplyMode !== v) state.faqApplyMode = v; }, { immediate: true, flush: 'post' });
  watch(() => state.faqApplyMode, v => { if (uiState.faqApplyMode.value !== v) uiState.faqApplyMode.value = v; }, { flush: 'post' });
  watch(uiState.sessionEditVisible, v => { if (state.sessionEditVisible !== v) state.sessionEditVisible = v; }, { immediate: true, flush: 'post' });
  watch(() => state.sessionEditVisible, v => { if (uiState.sessionEditVisible.value !== v) uiState.sessionEditVisible.value = v; }, { flush: 'post' });
  watch(uiState.tagManagerVisible, v => { if (state.tagManagerVisible !== v) state.tagManagerVisible = v; }, { immediate: true, flush: 'post' });
  watch(() => state.tagManagerVisible, v => { if (uiState.tagManagerVisible.value !== v) uiState.tagManagerVisible.value = v; }, { flush: 'post' });
  watch(uiState.contextEditorVisible, v => { if (state.contextEditorVisible !== v) state.contextEditorVisible = v; }, { immediate: true, flush: 'post' });
  watch(() => state.contextEditorVisible, v => { if (uiState.contextEditorVisible.value !== v) uiState.contextEditorVisible.value = v; }, { flush: 'post' });
  watch(uiState.contextEditorDraft, v => { if (state.contextEditorDraft !== v) state.contextEditorDraft = v; }, { immediate: true, flush: 'post' });
  watch(() => state.contextEditorDraft, v => { if (uiState.contextEditorDraft.value !== v) uiState.contextEditorDraft.value = v; }, { flush: 'post' });
  watch(uiState.contextPanelNewMode, v => { if (state.contextPanelNewMode !== v) state.contextPanelNewMode = v; }, { immediate: true, flush: 'post' });
  watch(() => state.contextPanelNewMode, v => { if (uiState.contextPanelNewMode.value !== v) uiState.contextPanelNewMode.value = v; }, { flush: 'post' });
  watch(uiState.batchMode, v => { if (state.batchMode !== v) state.batchMode = v; }, { immediate: true, flush: 'post' });
  watch(() => state.batchMode, v => { if (uiState.batchMode.value !== v) uiState.batchMode.value = v; }, { flush: 'post' });
  watch(uiState.llamaIndexVisible, v => { if (state.llamaIndexVisible !== v) state.llamaIndexVisible = v; }, { immediate: true, flush: 'post' });
  watch(() => state.llamaIndexVisible, v => { if (uiState.llamaIndexVisible.value !== v) uiState.llamaIndexVisible.value = v; }, { flush: 'post' });

  // ── Computed ──────────────────────────────────────────────────────────

  const activeConversation = computed(() => state.sessions.find((s) => s.id === state.currentSessionId) || null);

  function setActiveMessages(next: Message[]): void {
    state.messages = next;
  }

  const compact = useConversationCompact({
    activeConversation: activeConversation as any,
    setActiveMessages,
    persistActive: async () => { await persistActive(); },
    rpcCall: async <T>(module: string, method: string, params?: Record<string, unknown>) => {
      const client = getClient();
      if (!client) return { ok: false, data: null as T, error: 'API client unavailable' };
      return client.rpc<T>(module, method, params);
    },
  });
  watch(compact.compactionLog, v => { state.compactionLog = [...v]; }, { immediate: true, flush: 'post' });

  // ── Tool attachment helper ────────────────────────────────────────────

  function attachTurnToolCalls(petTimestamp: number, startIdx: number): void {
    const events = state.toolEvents.slice(startIdx);
    const byNameStart = new Map<string, any>();
    const calls: ToolCall[] = [];
    for (const ev of events) {
      if (ev.phase === 'start') {
        byNameStart.set(ev.name, ev);
        continue;
      }
      const st = byNameStart.get(ev.name);
      if (!st) continue;
      calls.push({
        name: ev.name, label: ev.label, args: st.args,
        content: ev.content, error: ev.error, durationMs: ev.durationMs,
      });
      byNameStart.delete(ev.name);
    }
    if (!calls.length) return;
    const idx = state.messages.findIndex((m) => m.timestamp === petTimestamp);
    if (idx < 0) return;
    state.messages[idx] = { ...state.messages[idx], toolCalls: calls };
  }

  // ── Service injection ─────────────────────────────────────────────────

  function injectServices(services: {
    client: any; chat: any; sessions: any; wework: any; search: any; rag: any; knowledge: any; translation: any; dashboard: any;
  }) {
    injectSharedServices(services);
    injectChatService(services.chat);

    // Register web search tool
    const search = getSearch();

    toolEventsStore.registerTool({
      name: 'web_search',
      label: 'Web Search',
      description: 'Queries the public web for real-time information',
      promptSnippet: 'answers include internet results',
      promptGuidelines: [
        'If web results are present, cite them with numbered references or direct links.',
        'For time-sensitive questions, prefer recent or authoritative domains and say when results are sparse.',
      ],
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          maxResults: { type: 'integer', description: 'Max results (default 6)' },
        },
        required: ['query'],
      },
      preStream: true,
      enabled: state.webSearchEnabled,
      async execute(args, signal) {
        const q = String((args as any).query || '').trim();
        if (!q) return { content: '' };
        if (!isSearchWorthy(q)) {
          streamingStore.lastSearchQuery = q;
          streamingStore.searchTimingMs = 0;
          streamingStore.webSearchResults = [];
          streamingStore.webSearchImages = [];
          return { content: '' };
        }
        streamingStore.webSearching = true;
        streamingStore.lastSearchQuery = q;
        const startedAt = Date.now();
        try {
          const res = await search.webSearch(
            { query: q, max_results: Number((args as any).maxResults ?? (args as any).topK ?? 6) },
            signal,
          );
          streamingStore.searchTimingMs = Date.now() - startedAt;
          if (!res.ok || !res.data) {
            streamingStore.webSearchResults = [];
            streamingStore.webSearchImages = [];
            return { content: '', error: res.error || 'Web search failed' };
          }
          const rawItems = Array.isArray(res.data.results) ? res.data.results : [];
          const ranked = rankByReputation(deduplicateByDomain(rawItems));
          const images = Array.isArray(res.data.images) ? res.data.images : [];
          streamingStore.lastSearchQuery = res.data.query || q;
          streamingStore.webSearchResults = ranked;
          streamingStore.webSearchImages = images;
          return {
            content: formatSearchResults(ranked),
            details: { items: ranked, images, query: streamingStore.lastSearchQuery, timingMs: streamingStore.searchTimingMs },
          };
        } catch (err) {
          streamingStore.searchTimingMs = Date.now() - startedAt;
          streamingStore.webSearchResults = [];
          streamingStore.webSearchImages = [];
          return { content: '', error: err instanceof Error ? err.message : String(err) };
        } finally {
          streamingStore.webSearching = false;
        }
      },
    });

    watch(
      () => state.webSearchEnabled,
      (ws) => { toolEventsStore.setToolEnabled('web_search', !!ws); },
      { immediate: true }
    );
  }

  // ── Persistence helpers ───────────────────────────────────────────────
  //
  // NOTE: These helpers write to BOTH `window.localStorage` (legacy fallback
  // for in-chat contexts) AND `chrome.storage.local` via the unified KV
  // wrapper. No more hand-written try/catch + capability detection here.

  const _persistTimers = new Map<string, ReturnType<typeof setTimeout>>();
  function _persistSetting(key: string, value: unknown, immediate = false) {
    if (typeof window === 'undefined') return;
    clearTimeout(_persistTimers.get(key)!);
    const storageKey = `yipet:${key}`;
    const run = () => {
      _persistTimers.delete(key);
      try {
        window.localStorage?.setItem(
          storageKey,
          typeof value === 'string' ? value : JSON.stringify(value),
        );
      } catch { /* localStorage blocked — best effort */ }
      // writeKV swallows context errors — no outer try/catch needed
      void writeKV<unknown>(storageKey, value);
    };
    if (immediate) run();
    else _persistTimers.set(key, setTimeout(run, 400));
  }

  function _persistWindowState() {
    _persistSetting('chatWindowState', { ...state.ws });
  }

  /** Keys loaded in a single batch round-trip during `_loadPersistedState`. */
  const PERSISTED_KEYS = [
    'yipet:sidebarWidth', 'yipet:sidebarCollapsed', 'weChatRobots', 'yipet:promptHistory',
    'yipet:promptTemplates',
    'yipet:chatWindowState', 'yipet:chatColorIndex', 'yipet:chatCustomColor',
    'yipet:ragEnabled', 'yipet:ragScope', 'yipet:ragScopeIsFile', 'yipet:ragFast',
    'yipet:ragHybrid', 'yipet:ragRerank', 'yipet:ragCitations', 'yipet:ragHyde',
    'yipet:ragNumQueries', 'yipet:ragChatMode',
  ] as const;

  type PersistedKeysMap = Record<typeof PERSISTED_KEYS[number], unknown>;

  async function _loadPersistedState() {
    // readBatchKV handles unavailability gracefully (empty object on failure)
    const result = await readBatchKV<PersistedKeysMap>([...PERSISTED_KEYS]);

    if (typeof result['yipet:sidebarWidth'] === 'number') state.sidebarWidth = result['yipet:sidebarWidth'];
    if (typeof result['yipet:sidebarCollapsed'] === 'boolean') state.sidebarCollapsed = result['yipet:sidebarCollapsed'];
    if (Array.isArray(result.weChatRobots)) state.weChatRobots = result.weChatRobots as WeWorkBot[];
    if (Array.isArray(result['yipet:promptHistory'])) {
      state.promptHistory = (result['yipet:promptHistory'] as string[]).filter((s): s is string => typeof s === 'string').slice(-100);
    }
    if (Array.isArray(result['yipet:promptTemplates'])) {
      state.promptTemplates = (result['yipet:promptTemplates'] as Array<{ name: string; content: string }>)
        .filter(t => t && typeof t.name === 'string' && typeof t.content === 'string');
    }
    if (result['yipet:chatWindowState'] && typeof result['yipet:chatWindowState'] === 'object') {
      const ws = result['yipet:chatWindowState'] as Record<string, unknown>;
      if (typeof ws.x === 'number') state.ws.x = ws.x;
      if (typeof ws.y === 'number') state.ws.y = ws.y;
      if (typeof ws.width === 'number') state.ws.width = ws.width;
      if (typeof ws.height === 'number') state.ws.height = ws.height;
      if (typeof ws.isFullscreen === 'boolean') state.ws.isFullscreen = ws.isFullscreen;
    }
    if (typeof result['yipet:chatColorIndex'] === 'number' || typeof result['yipet:chatCustomColor'] === 'string') {
      setColorIndex(
        typeof result['yipet:chatColorIndex'] === 'number' ? result['yipet:chatColorIndex'] : state.colorIndex,
        typeof result['yipet:chatCustomColor'] === 'string' ? result['yipet:chatCustomColor'] : state.customColor,
      );
    }
    if (typeof result['yipet:ragEnabled'] === 'boolean') state.ragEnabled = result['yipet:ragEnabled'];
    if (typeof result['yipet:ragScope'] === 'string') state.ragScope = result['yipet:ragScope'];
    if (typeof result['yipet:ragScopeIsFile'] === 'boolean') state.ragScopeIsFile = result['yipet:ragScopeIsFile'];
    if (typeof result['yipet:ragFast'] === 'boolean') state.ragFast = result['yipet:ragFast'];
    if (typeof result['yipet:ragHybrid'] === 'boolean') state.ragHybrid = result['yipet:ragHybrid'];
    if (typeof result['yipet:ragRerank'] === 'boolean') state.ragRerank = result['yipet:ragRerank'];
    if (typeof result['yipet:ragCitations'] === 'boolean') state.ragCitations = result['yipet:ragCitations'];
    if (typeof result['yipet:ragHyde'] === 'boolean') state.ragHyde = result['yipet:ragHyde'];
    if (typeof result['yipet:ragNumQueries'] === 'number') state.ragNumQueries = result['yipet:ragNumQueries'];
    if (typeof result['yipet:ragChatMode'] === 'string') state.ragChatMode = result['yipet:ragChatMode'];
  }

  // ── Session management ───────────────────────────────────────────────

  function _resortSessions() {
    state.sessions.sort((a, b) => {
      if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  async function _loadSessions() {
    if (_loadSessionsPromise) return _loadSessionsPromise;
    _loadSessionsPromise = (async () => {
      state.sessionLoading = true;
      state.sessionError = '';
      try {
        const sessions = getSessions();
        const res = await sessions.list();
        if (res.ok && res.data) {
          const list = res.data;
          state.sessions = list.map((d) => {
            const rawMsgs = d.messages ?? d.data?.messages;
            const msgs = Array.isArray(rawMsgs) ? rawMsgs : [];
            return {
              id: d.key || d.id || '',
              title: d.title || 'Untitled',
              url: d.url || '',
              createdAt: d.createdAt || Date.now(),
              updatedAt: d.updatedAt || Date.now(),
              messageCount: msgs.length || d.messageCount || 0,
              messages: msgs.length ? msgs : undefined,
              isFavorite: !!d.isFavorite,
              tags: d.tags || [],
              pageContent: d.pageContent || '',
              pageTitle: (d as any).pageTitle || '',
              pageDescription: d.pageDescription || '',
              filePath: (d as any).filePath || (d as any).file_path || '',
            };
          });
          _resortSessions();
          state.sessionsLoaded = true;
          state.lastSyncTime = Date.now();
          if (state.sessions.length > 0 && !state.currentSessionId) {
            const pageUrl = state.pageInfo.url;
            let target = findSessionByUrl(state.sessions, pageUrl);
            if (!target) {
              let savedKey: string | null = null;
              try { savedKey = window.localStorage?.getItem('yipet:activeSessionKey') ?? null; } catch { /* ignore */ }
              target = savedKey ? state.sessions.find((s) => s.id === savedKey) : undefined;
            }
            if (!target) {
              target = state.sessions.find((s) => (s.messageCount || 0) > 0) || state.sessions[0];
            }
            await selectSession(target!.id);
          }
        } else {
          state.sessionError = `Failed to load sessions: ${res.error || 'unknown error'}`;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        state.sessionError = `Failed to load sessions: ${msg}`;
      }
      finally { state.sessionLoading = false; _loadSessionsPromise = null; }
    })();
    return _loadSessionsPromise;
  }

  async function _findOrCreateSession() {
    const url = state.pageInfo.url;
    const existing = state.sessions.find((s) => s.url === url);
    if (existing) {
      state.currentSessionId = existing.id;
      state.title = existing.title;
      if (existing.messages?.length) {
        state.messages = mapMessages(existing.messages);
      } else {
        await _loadSessionMessages(existing.id);
      }
      state.viewState = state.messages.length > 0 ? 'messages' : 'empty';
      return;
    }
    await createSession();
  }

  function _extractMessages(rdata: Record<string, any>): Message[] {
    for (const src of [
      rdata.messages,
      rdata.data?.messages,
      rdata.data?.data?.messages,
      rdata.document?.messages,
      rdata.result?.messages,
    ]) {
      if (Array.isArray(src) && src.length > 0) {
        return mapMessages(
          src.map((m: any) =>
            m && typeof m === 'object'
              ? { ...m, message: m.message ?? m.content ?? '' }
              : m,
          ),
        );
      }
    }
    for (const src of [
      rdata.messages,
      rdata.data?.messages,
      rdata.data?.data?.messages,
    ]) {
      if (Array.isArray(src)) return [];
    }
    return [];
  }

  async function _loadSessionMessages(id: string) {
    try {
      const sessions = getSessions();
      const record = await sessions.get(id);
      const rdata = record.data;
      if (!rdata) {
        state.viewState = 'error';
        return;
      }

      state.messages = _extractMessages(rdata as Record<string, any>);
      state.viewState = state.messages.length > 0 ? 'messages' : 'empty';

      const session = state.sessions.find((s) => s.id === id);
      if (session) {
        if ((rdata as any).tags !== undefined) session.tags = (rdata as any).tags;
        if ((rdata as any).pageContent !== undefined) session.pageContent = (rdata as any).pageContent;
        if ((rdata as any).isFavorite !== undefined) session.isFavorite = (rdata as any).isFavorite;
        session.messageCount = state.messages.length;
        if ((rdata as any).pageTitle !== undefined) session.pageTitle = (rdata as any).pageTitle;
        if ((rdata as any).pageDescription !== undefined) session.pageDescription = (rdata as any).pageDescription;
        if ((rdata as any).title !== undefined) session.title = (rdata as any).title;
        if ((rdata as any).url !== undefined) session.url = (rdata as any).url;
      }

      ctxFilesStore.loadContextText().catch(() => {});
    } catch (e) {
      state.viewState = 'error';
    }
  }

  async function selectSession(id: string) {
    if (state.isProcessing) stopSending();
    const existing = state.sessions.find((s) => s.id === id);
    if (!existing) return;

    state.currentSessionId = id;
    state.title = existing.title;
    state.viewState = 'loading';

    if (existing.messages?.length) {
      state.messages = mapMessages(
        existing.messages.map((m: any) =>
          m && typeof m === 'object'
            ? { ...m, message: m.message ?? m.content ?? '' }
            : m,
        ),
      );
      state.viewState = state.messages.length > 0 ? 'messages' : 'empty';
      _loadSessionMessages(id).catch(() => {});
    } else {
      state.messages = [];
      try {
        await _loadSessionMessages(id);
      } catch (_) {}
    }

    ctxFilesStore.loadContextText().catch(() => {});
    try { window.localStorage?.setItem('yipet:activeSessionKey', id); } catch { /* ignore */ }
  }

  async function createSession() {
    if (state.isProcessing) stopSending();
    const url = state.pageInfo.url;
    const title = state.pageInfo.title || 'New Chat';
    const existing = state.sessions.find((s) => s.url === url);
    if (existing) {
      state.currentSessionId = existing.id;
      state.title = existing.title;
      if (existing.messages?.length) {
        state.messages = mapMessages(existing.messages);
      } else {
        await _loadSessionMessages(existing.id);
      }
      state.viewState = state.messages.length > 0 ? 'messages' : 'empty';
      return;
    }
    try {
      const sessions = getSessions();
      const project = detectProject(url);
      const tags = [`source:YiPet`, `from:${url}`];
      if (project) tags.push(`project:${project}`);
      const res = await sessions.create({
        title, url,
        tags,
        pageContent: '',
      });
      if (res.ok && res.data?.key) {
        const id = res.data.key as string;
        state.currentSessionId = id;
        state.title = title;
        state.messages = [];
        state.viewState = 'empty';
        await _loadSessions();
      }
    } catch { /* ignore */ }
  }

  async function deleteSession(id: string) {
    const sessions = getSessions();
    const res = await sessions.delete(id);
    if (res?.ok) {
      const idx = state.sessions.findIndex((s) => s.id === id);
      if (idx >= 0) state.sessions.splice(idx, 1);
      if (state.currentSessionId === id) {
        state.currentSessionId = null;
        state.messages = [];
        state.viewState = 'empty';
        try { window.localStorage?.removeItem('yipet:activeSessionKey'); } catch { /* ignore */ }
      }
    }
  }

  async function toggleFavorite(id: string) {
    const session = state.sessions.find((s) => s.id === id);
    if (!session) return;
    session.isFavorite = !session.isFavorite;
    const sessions = getSessions();
    await sessions.update(id, { isFavorite: session.isFavorite } as unknown as Record<string, unknown>);
    _resortSessions();
  }

  async function renameSession(id: string, title: string) {
    const session = state.sessions.find((s) => s.id === id);
    if (!session) return;
    const trimmed = title.trim();
    if (!trimmed || trimmed === session.title) return;
    const prev = session.title;
    session.title = trimmed;
    if (state.currentSessionId === id) state.title = trimmed;
    try {
      const sessions = getSessions();
      await sessions.update(id, { title: trimmed } as unknown as Record<string, unknown>);
    } catch {
      session.title = prev;
      if (state.currentSessionId === id) state.title = prev;
    }
  }

  async function updateSessionMeta(
    id: string,
    meta: { title?: string; pageContent?: string; tags?: string[] },
  ) {
    const cur = state.sessions.find((x) => x.id === id);
    if (!cur) return;
    try {
      const sessions = getSessions();
      await sessions.update(id, meta as unknown as Record<string, unknown>);
      if (meta.title !== undefined) {
        cur.title = meta.title;
        if (state.currentSessionId === id) state.title = meta.title;
      }
      if (meta.pageContent !== undefined) cur.pageContent = meta.pageContent;
      if (meta.tags !== undefined) cur.tags = meta.tags;
    } catch { /* ignore */ }
  }

  // ── Window management ─────────────────────────────────────────────────

  const _windowActions = useChatWindow(
    state as any, vw, vh,
    _dragStart, _resizeStart, _sidebarResizeStart,
    () => { _loadSessions(); },
    _persistWindowState,
    _persistSetting,
  );

  // ── Streaming orchestration ───────────────────────────────────────────

  function stopSending() {
    streamingStore.stopSending();
    state.isProcessing = false;
  }

  async function sendMessage(text: string, images?: string[]) {
    const imageList = images || state.draftImages || [];
    if (!text.trim() && imageList.length === 0) return;
    const content = text.trim();
    if (content) pushPromptHistory(text);

    if (content.startsWith('/clear')) {
      state.messages = [];
      state.viewState = 'empty';
      state.draftImages = [];
      persistActive();
      notify(t('chatCleared'));
      return;
    }
    if (content.startsWith('/stop')) {
      stopSending();
      return;
    }
    if (content.startsWith('/retry')) {
      await retryLastMessage();
      return;
    }
    if (content.startsWith('/export')) {
      exportCurrentSessionMarkdown();
      return;
    }
    if (content.startsWith('/new')) {
      await createEmptySession();
      notify('New chat created');
      return;
    }
    if (content.startsWith('/compact')) {
      const before = state.messages.reduce((sum, m) => sum + Math.ceil((m.content || '').length / 4), 0);
      await compact.maybeCompact(state.messages);
      const after = state.messages.reduce((sum, m) => sum + Math.ceil((m.content || '').length / 4), 0);
      const saved = before - after;
      notify(`Compacted: ~${before} → ~${after} tokens (saved ${saved > 0 ? saved : 0})`);
      return;
    }
    if (content.startsWith('/stats')) {
      const knowledgeCount = state.knowledgeTree?.reduce((sum, cat) => sum + (cat.files?.length || 0), 0) || 0;
      const totalMsgs = state.sessions.reduce((sum, ses) => sum + (ses.messageCount || 0), 0);
      const today = new Date().toDateString();
      const todaySessions = state.sessions.filter((ses: any) => {
        const ts = ses.updatedAt || ses.createdAt;
        return ts && new Date(ts).toDateString() === today;
      }).length;
      const favCount = state.sessions.filter(s => s.isFavorite).length;
      const statsMsg: Message = {
        type: 'pet',
        content: [
          '## Personal Stats',
          '',
          `| Metric | Value |`,
          `|--------|-------|`,
          `| Sessions | ${state.sessions.length} (${todaySessions} today) |`,
          `| Favorites | ${favCount} |`,
          `| Total Messages | ${totalMsgs} |`,
          `| Knowledge Files | ${knowledgeCount} |`,
          `| Recent Bugs | ${(state as any).recentBugs?.length || 0} |`,
          `| RAG Enabled | ${state.ragEnabled ? 'Yes' : 'No'} |`,
          `| Model | ${state.selectedModel} |`,
          '',
          `Data synced via YiAi.`,
        ].join('\n'),
        timestamp: Date.now(),
      };
      state.messages.push(statsMsg);
      persistActive();
      return;
    }
    if (content.startsWith('/sessions')) {
      const recent = [...state.sessions].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 10);
      const rows = recent.map((s, i) => {
        const project = (s.tags || []).find((t: string) => t.startsWith('project:'))?.slice(8) || '';
        const age = s.updatedAt ? Math.floor((Date.now() - s.updatedAt) / 86400000) : null;
        const ageStr = age === 0 ? 'today' : age === 1 ? '1d ago' : age ? `${age}d ago` : '';
        const active = s.id === state.currentSessionId ? ' **active**' : '';
        return `| ${i + 1} | ${(s.title || 'Untitled').slice(0, 40)} | ${s.messageCount || 0} msg | ${project || '-'} | ${ageStr}${active} |`;
      });
      const sessionsMsg: Message = {
        type: 'pet',
        content: [
          '## Recent Sessions',
          '',
          '| # | Title | Msgs | Project | Age |',
          '|---|-------|------|---------|-----|',
          ...rows,
          '',
          `Total: ${state.sessions.length} sessions.`,
        ].join('\n'),
        timestamp: Date.now(),
      };
      state.messages.push(sessionsMsg);
      persistActive();
      return;
    }
    if (content.startsWith('/search ')) {
      const searchQuery = content.slice(8).trim();
      if (!searchQuery) { notify('Usage: /search <query>', 'info'); return; }
      const knowledge = getKnowledge();
      if (!knowledge) { notify('Knowledge service unavailable', 'error'); return; }
      try {
        const res = await knowledge.search(searchQuery);
        if (!res.ok || !res.data?.results?.length) {
          const noResultsMsg: Message = { type: 'pet', content: `No results for "${searchQuery}"`, timestamp: Date.now() };
          state.messages.push(noResultsMsg); persistActive(); return;
        }
        const rows = res.data.results.slice(0, 8).map((r, i) =>
          `| ${i + 1} | [${r.title || r.path.split('/').pop()}](${r.path}) | ${(r.snippet || '').slice(0, 80)} |`
        );
        const searchMsg: Message = {
          type: 'pet',
          content: [
            `## Knowledge Search: "${searchQuery}"`,
            '',
            `| # | File | Snippet |`,
            '|---|------|---------|',
            ...rows,
            '',
            `${res.data.results.length} results total.`,
          ].join('\n'),
          timestamp: Date.now(),
        };
        state.messages.push(searchMsg); persistActive();
      } catch { notify('Search failed', 'error'); }
      return;
    }
    if (content.startsWith('/help') || content.startsWith('/hotkeys')) {
      const helpMsg: Message = {
        type: 'pet',
        content: [
          '## Slash Commands',
          '',
          '| Command | Description |',
          '|---------|-------------|',
          '| `/clear` | Clear all messages |',
          '| `/retry` | Retry last failed message |',
          '| `/stop` | Stop current stream |',
          '| `/compact` | Compress conversation history |',
          '| `/new` | Start new conversation |',
          '| `/export` | Export as markdown |',
          '| `/stats` | Show personal usage stats |',
          '| `/sessions` | List recent sessions |',
          '| `/search <q>` | Search YiKnowledge |',
          '| `/name <title>` | Rename current conversation |',
          '| `/copy` | Copy last AI message |',
          '| `/session` | Show session info |',
          '| `/help` | Show this help |',
          '',
          '## Keyboard Shortcuts',
          '',
          '| Shortcut | Action |',
          '|----------|--------|',
          '| `Enter` | Send message |',
          '| `Shift+Enter` | Newline |',
          '| `Escape` | Stop / Clear input |',
          '| `Ctrl+K` | Clear conversation |',
          '| `ArrowUp` (start) | Recall previous prompt |',
          '| `ArrowDown` (end) | Recall next prompt |',
        ].join('\n'),
        timestamp: Date.now(),
      };
      state.messages.push(helpMsg);
      persistActive();
      return;
    }
    if (content.startsWith('/name ')) {
      const newTitle = content.slice(6).trim();
      if (newTitle && state.currentSessionId) {
        renameSession(state.currentSessionId, newTitle);
        notify(`Renamed to "${newTitle}"`);
      } else {
        notify('Usage: /name <new title>');
      }
      return;
    }
    if (content.startsWith('/copy')) {
      const lastAi = [...state.messages].reverse().find(m => m.type === 'pet' && m.content);
      if (lastAi?.content) {
        navigator.clipboard.writeText(lastAi.content).then(
          () => notify('Copied last AI message'),
          () => notify('Copy failed'),
        );
      } else {
        notify('No AI message to copy');
      }
      return;
    }
    if (content.startsWith('/session')) {
      const ses = state.sessions.find(s => s.id === state.currentSessionId);
      const info: Message = {
        type: 'pet',
        content: [
          '## Session Info',
          '',
          `| Key | Value |`,
          `|-----|-------|`,
          `| Title | ${ses?.title || state.title || '—'} |`,
          `| Session ID | \`${state.currentSessionId || '—'}\` |`,
          `| Messages | ${state.messages.length} (${state.messages.filter(m => m.type === 'user').length} user, ${state.messages.filter(m => m.type === 'pet').length} AI) |`,
          `| Context Files | ${(ses?.tags ?? []).filter((t: string) => t.startsWith('ctx:')).length} |`,
          `| Tags | ${(ses?.tags ?? []).filter((t: string) => !t.startsWith('ctx:')).join(', ') || '—'} |`,
          `| Web Search | ${state.webSearchEnabled ? 'on' : 'off'} |`,
          `| Model | ${state.selectedModel || '—'} |`,
        ].join('\n'),
        timestamp: Date.now(),
      };
      state.messages.push(info);
      persistActive();
      return;
    }

    if (state.isProcessing) return;
    if (!state.currentSessionId) {
      await _loadSessions();
      await _findOrCreateSession();
      if (!state.currentSessionId) return;
    }

    const now = Date.now();
    const userMsg: Message = { type: 'user', content: text, timestamp: now };
    if (imageList.length > 0) {
      userMsg.imageDataUrl = imageList[0];
      userMsg.imageDataUrls = imageList;
    }
    const petMsg: Message = { type: 'pet', content: '', timestamp: now + 1, streaming: true };
    state.messages.push(userMsg, petMsg);
    state.viewState = 'messages';
    state.isProcessing = true;
    state.draftImages = [];
    const userIdx = state.messages.length - 2;

    await _runStream(userIdx, petMsg.timestamp, 'send');
  }

  async function _runStream(userIdx: number, petTimestamp: number, type: 'send' | 'regenerate' | 'resend') {
    const toolEventsStartIdx = state.toolEvents.length;
    const slice = state.messages.slice(0, userIdx + 1);
    const lastUserMsg = slice[slice.length - 1];
    const images = lastUserMsg?.imageDataUrls ?? (lastUserMsg?.imageDataUrl ? [lastUserMsg.imageDataUrl] : []);
    let userContent = lastUserMsg?.content || '';

    const contextText = await ctxFilesStore.loadContextText();
    if (contextText && userContent) {
      const ref = contextText
        .split('\n\n---\n\n')
        .filter(Boolean)
        .map(s => s.replace(/^## /, '').trim())
        .join('\n\n');
      userContent = `${userContent}\n\n---\nReference files:\n\n${ref}`;
    }

    const sig = streamingStore.resetForNewStream(type, petTimestamp, state.ragEnabled);
    state.ragSources = [];
    let streamed = '';
    let lastScrollAt = 0;
    let phaseFlipped = false;
    const streamStart = Date.now();
    let firstTokenAt = 0;
    let turnSearchResults: WebSearchResult[] = [];
    let turnSearchImages: any[] = [];
    let turnSearchQuery = '';
    let turnSearchTimingMs = 0;
    const SCROLL_THROTTLE_MS = 80;

    const findPetIdx = () => state.messages.findIndex((m) => m.timestamp === petTimestamp);

    const onToken = (token: string) => {
      streamed += token;
      if (!phaseFlipped) { phaseFlipped = true; streamingStore.streamingPhase = 'streaming'; firstTokenAt = Date.now(); }
      const idx = findPetIdx();
      if (idx >= 0) {
        state.messages[idx].content = streamed;
        state.messages[idx].error = false;
        state.messages[idx].aborted = false;
      }
      const now2 = Date.now();
      if (now2 - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now2;
        state.scrollTick++;
      }
    };

    const useRag = state.ragEnabled;
    let ragMetaFromStream: Record<string, unknown> | null = null;

    try {
      const argsMap = new Map<string, Record<string, unknown>>();
      argsMap.set('web_search', { query: userContent });
      const preStreamCtx = await toolEventsStore.executePreStreamTools(argsMap, sig);
      turnSearchResults = [...streamingStore.webSearchResults];
      turnSearchImages = [...streamingStore.webSearchImages];
      turnSearchQuery = streamingStore.lastSearchQuery;
      turnSearchTimingMs = streamingStore.searchTimingMs;

      const chat = useRag ? null : getChat();
      const rag = useRag ? getRag() : null;
      const history: Array<{ role: string; content: string }> = [];
      if (state.systemPrompt) {
        history.push({ role: 'system', content: state.systemPrompt });
      }
      for (let i = 0; i <= userIdx; i++) {
        const m = slice[i];
        let text = (m.content || '').trim();
        if (!text && i !== userIdx) continue;
        if (i === userIdx) {
          if (preStreamCtx) {
            text = `${text}\n\n---\n\n${preStreamCtx}`.trim();
          }
          if (contextText) {
            const ref = contextText
              .split('\n\n---\n\n')
              .filter(Boolean)
              .map(s => s.replace(/^## /, '').trim())
              .join('\n\n');
            text = `${text}\n\n---\nReference files:\n\n${ref}`;
          }
        }
        history.push({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: text,
        });
      }

      if (useRag && rag) {
        // RAG-grounded chat
        const onSources = (sources: RagSource[]) => {
          state.ragSources = sources;
        };
        const onMeta = (meta: Record<string, unknown>) => {
          ragMetaFromStream = meta;
        };
        if (state.ragScopeIsFile && state.ragScope) {
          await rag.streamFileChat(
            {
              target_file: state.ragScope,
              messages: history,
              model: state.selectedModel || DEFAULT_MODEL,
            },
            onToken,
            streamingStore.getAbortController()?.signal,
          );
        } else {
          await rag.streamChat(
            {
              messages: history,
              model: state.selectedModel || DEFAULT_MODEL,
              scope: state.ragScope || undefined,
              fast: state.ragFast || undefined,
              hybrid: state.ragHybrid,
              rerank: state.ragRerank,
              citations: state.ragCitations,
              hyde_enabled: state.ragHyde,
              num_queries: state.ragNumQueries || undefined,
              chat_mode: state.ragChatMode as 'condense' | 'condense_plus_context' | 'context' | 'simple',
            },
            onToken,
            onSources,
            onMeta,
            streamingStore.getAbortController()?.signal,
          );
        }
      } else {
        await chat!.streamWithCallback(
          {
            messages: history,
            model: state.selectedModel || DEFAULT_MODEL,
            images: images.length > 0 ? images : undefined,
          },
          onToken,
          streamingStore.getAbortController()?.signal,
        );
      }
    } catch (e) {
      const idx = findPetIdx();
      if (idx >= 0) {
        const isAbort = (e as Error)?.name === 'AbortError';
        state.messages[idx].error = !isAbort;
        state.messages[idx].aborted = isAbort;
      }
    } finally {
      streamingStore.finishStream();
      state.isProcessing = false;
      const idx = findPetIdx();
      if (idx >= 0) {
        state.messages[idx].streaming = false;
        attachTurnToolCalls(petTimestamp, toolEventsStartIdx);
        if (turnSearchResults.length || turnSearchImages.length || turnSearchQuery) {
          state.messages[idx].searchGrounded = true;
          state.messages[idx].searchResults = turnSearchResults;
          state.messages[idx].searchImages = turnSearchImages;
          state.messages[idx].searchQuery = turnSearchQuery;
          state.messages[idx].searchTimingMs = turnSearchTimingMs;
        }
        // RAG metadata — attach retrieval grade, meta, and sources to the pet message
        if (useRag && state.ragSources.length > 0) {
          const topScore = Math.max(...state.ragSources.map(s => s.score ?? 0));
          const grade = topScore >= 0.85 ? 'A' : topScore >= 0.7 ? 'B' : topScore >= 0.5 ? 'C' : 'D';
          const topSource = state.ragSources[0];
          const topFile = topSource?.path?.split('/').pop() || 'unknown';
          state.messages[idx].retrievalGrade = grade;
          state.messages[idx].ragContentSummary = topFile + (state.ragSources.length > 1 ? ` +${state.ragSources.length - 1}` : '');
          state.messages[idx].sources = [...state.ragSources];
          state.messages[idx].ragMeta = {
            scope: state.ragScope || undefined,
            ...(ragMetaFromStream ?? {}),
          };
        }
        if (firstTokenAt > 0) {
          state.messages[idx].firstTokenLatencyMs = firstTokenAt - streamStart;
        }
        const target = state.sessions.find((s) => s.id === state.currentSessionId);
        if (target) target.messageCount = state.messages.length;
      }
      await persistActive();
      await compact.maybeCompact(state.messages);
      setTimeout(() => scrollToBottom(), 50);
    }
  }

  // ── Persist active ───────────────────────────────────────────────────

  async function persistActive(): Promise<boolean> {
    const prev = _persistChain;
    let resolveNext: () => void;
    _persistChain = new Promise<void>(r => { resolveNext = r; });
    let ok = false;
    try {
      await Promise.race([prev, new Promise<void>(r => setTimeout(r, 15_000))]);
      if (!state.currentSessionId) return false;
      const msgs: Record<string, unknown>[] = state.messages.map((m) => ({
        type: m.type === 'user' ? 'user' : 'pet',
        message: m.content,
        timestamp: m.timestamp,
        ...(m.imageDataUrl ? { imageDataUrl: m.imageDataUrl } : {}),
        ...(m.imageDataUrls?.length ? { imageDataUrls: m.imageDataUrls } : {}),
        ...(m.toolCalls?.length ? { toolCalls: m.toolCalls } : {}),
        ...(m.searchResults?.length ? { searchResults: m.searchResults } : {}),
        ...(m.searchImages?.length ? { searchImages: m.searchImages } : {}),
        ...(m.searchGrounded ? { searchGrounded: true } : {}),
        ...(m.searchQuery ? { searchQuery: m.searchQuery } : {}),
        ...(m.searchTimingMs != null ? { searchTimingMs: m.searchTimingMs } : {}),
        ...(m.retrievalGrade ? { retrievalGrade: m.retrievalGrade } : {}),
        ...(m.ragContentSummary ? { ragContentSummary: m.ragContentSummary } : {}),
        ...(m.ragMeta ? { ragMeta: m.ragMeta } : {}),
        ...(m.sources?.length ? { sources: m.sources } : {}),
        ...(m.firstTokenLatencyMs != null ? { firstTokenLatencyMs: m.firstTokenLatencyMs } : {}),
      }));
      const target = state.sessions.find((s) => s.id === state.currentSessionId);
      if (target) target.messageCount = state.messages.length;
      const sessions = getSessions();
      const res = await sessions.update(state.currentSessionId, { messages: msgs } as unknown as Record<string, unknown>);
      ok = !!(res && res.ok);
      if (ok) warnIfQuotaLow(pct => notify(`Storage ${pct}% full — consider archiving old sessions`, 'warning'));
    } catch { /* ignore */
    } finally { resolveNext!(); }
    return ok;
  }

  function scrollToBottom() { state.scrollTick++; }

  // ── Prompt history ───────────────────────────────────────────────────

  function pushPromptHistory(text: string) {
    const s = text.trim();
    if (!s || s.startsWith('/')) return;
    const arr = state.promptHistory;
    const tgrams = ngrams(s, 3);
    for (let i = arr.length - 1, ct = 0; i >= 0 && ct < 20; i--, ct++) {
      const h = arr[i];
      if (h === s) { arr.splice(i, 1); continue; }
      const hgrams = ngrams(h, 3);
      if (jaccard(tgrams, hgrams) >= 0.75) { arr.splice(i, 1); }
    }
    arr.push(s);
    if (arr.length > 120) arr.splice(0, arr.length - 120);
    _persistSetting('promptHistory', arr);
  }

  function recallPromptHistory(delta: number, currentIdx: number) {
    const hist = state.promptHistory;
    if (hist.length === 0) return null;
    const next = currentIdx + delta;
    if (next < 0) return { idx: 0, text: hist[0] };
    if (next >= hist.length) return { idx: -1, text: '' };
    return { idx: next, text: hist[next] };
  }

  function removePromptHistoryAt(idx: number) {
    if (idx >= 0 && idx < state.promptHistory.length) {
      state.promptHistory.splice(idx, 1);
      _persistSetting('promptHistory', state.promptHistory);
    }
  }

  function invokePromptHistory(idx: number) {
    if (idx >= 0 && idx < state.promptHistory.length) {
      state.inputTemplate = state.promptHistory[idx];
    }
  }

  function clearPromptHistory() {
    state.promptHistory = [];
    _persistSetting('promptHistory', []);
  }

  // ── Prompt templates (custom, user-created) ──────────────────────────

  function addPromptTemplate(name: string, content: string): boolean {
    if (state.promptTemplates.some(t => t.name === name)) return false;
    state.promptTemplates = [...state.promptTemplates, { name, content }];
    _persistSetting('promptTemplates', state.promptTemplates);
    return true;
  }

  function removePromptTemplate(name: string): boolean {
    const before = state.promptTemplates.length;
    state.promptTemplates = state.promptTemplates.filter(t => t.name !== name);
    if (state.promptTemplates.length === before) return false;
    _persistSetting('promptTemplates', state.promptTemplates);
    return true;
  }

  // ── Knowledge tree ────────────────────────────────────────────────────

  async function loadKnowledgeTree(category?: string) {
    if (state.knowledgeLoading) return;
    state.knowledgeLoading = true;
    state.knowledgeError = '';
    try {
      const knowledge = getKnowledge();
      const res = await knowledge.scan(category);
      if (res.ok && res.data?.categories) {
        state.knowledgeTree = res.data.categories;
      } else {
        state.knowledgeError = res.error || 'Failed to load knowledge tree';
      }
    } catch (e) {
      state.knowledgeError = e instanceof Error ? e.message : String(e);
    } finally {
      state.knowledgeLoading = false;
    }
  }

  /** Read a single knowledge file's content (eager load for context). */
  async function readKnowledgeFileContent(path: string): Promise<string | null> {
    try {
      const knowledge = getKnowledge();
      const res = await knowledge.read(path);
      return res.ok && res.data?.content ? res.data.content : null;
    } catch { return null; }
  }

  /** Open the knowledge file preview dialog for a given path. */
  async function openKnowledgePreview(path: string) {
    if (!path || state.knowledgePreviewLoading) return;
    state.knowledgePreviewVisible = true;
    state.knowledgePreviewPath = path;
    state.knowledgePreviewData = null;
    state.knowledgePreviewLoading = true;
    try {
      const knowledge = getKnowledge();
      const res = await knowledge.read(path);
      if (res.ok && res.data) {
        state.knowledgePreviewData = res.data;
      }
    } catch { /* keep dialog open with error state */ }
    finally {
      state.knowledgePreviewLoading = false;
    }
  }

  /** Navigate to a linked/internal file within the preview dialog. */
  async function navigateKnowledgePreview(path: string) {
    if (!path || path === state.knowledgePreviewPath || state.knowledgePreviewLoading) return;
    state.knowledgePreviewPath = path;
    state.knowledgePreviewData = null;
    state.knowledgePreviewLoading = true;
    try {
      const knowledge = getKnowledge();
      const res = await knowledge.read(path);
      if (res.ok && res.data) {
        state.knowledgePreviewData = res.data;
      }
    } catch { /* keep dialog open */ }
    finally {
      state.knowledgePreviewLoading = false;
    }
  }

  function closeKnowledgePreview() {
    state.knowledgePreviewVisible = false;
    state.knowledgePreviewPath = '';
    state.knowledgePreviewData = null;
    state.knowledgePreviewLoading = false;
  }

  /** Save edited content back to the knowledge file. */
  async function saveKnowledgePreview(content: string): Promise<boolean> {
    if (!state.knowledgePreviewPath) return false;
    try {
      const knowledge = getKnowledge();
      const res = await knowledge.write(state.knowledgePreviewPath, content, state.knowledgePreviewData?.meta as Record<string, unknown> | undefined);
      if (res.ok && res.data) {
        state.knowledgePreviewData = res.data as unknown as typeof state.knowledgePreviewData;
        notify('Saved', 'success');
        return true;
      }
      notify(res.error || 'Failed to save', 'error');
      return false;
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Failed to save', 'error');
      return false;
    }
  }

  // ── Color/Role ──────────────────────────────────────────────────────

  function setColorIndex(idx: number, customColor = state.customColor) {
    const cc = String(customColor || '').trim();
    if (!Number.isFinite(idx)) return;
    if (idx === state.colorIndex && cc === state.customColor) {
      const root = document.getElementById('yipet-chat-root');
      if (root) _applyThemeToRoot(root, idx, cc);
      return;
    }
    state.colorIndex = idx;
    state.customColor = cc;
    _persistSetting('chatColorIndex', idx);
    _persistSetting('chatCustomColor', cc);
    const root = document.getElementById('yipet-chat-root');
    if (root) _applyThemeToRoot(root, idx, cc);
  }

  function _applyThemeToRoot(root: HTMLElement, idx: number, customColor: string): void {
    const hexOk = !!(customColor && applyThemeHex(root, customColor));
    if (!hexOk) applyThemeColors(root, idx);

    if (hexOk) {
      const palette = generatePalette(customColor);
      if (palette) {
        applyElementPalette(root, palette, 'dark');
        applyElementPalette(document.body, palette, 'dark');
      }
    } else {
      applyElementTheme(root, idx);
      applyElementTheme(document.body, idx);
    }

    if (hexOk) {
      applyThemeHex(document.body, customColor);
    } else {
      applyThemeColors(document.body, idx);
    }
  }

  function setRole(name: string, imageUrl: string) {
    state.roleName = name;
    state.roleImageUrl = imageUrl;
  }

  function setSystemPrompt(prompt: string) {
    state.systemPrompt = prompt;
  }

  // ── Model ──────────────────────────────────────────────────────────

  async function fetchModels() {
    try {
      const chat = getChat();
      const models = await chat.listModels();
      if (models.length) {
        state.availableModels = models;
        if (!state.selectedModel || !models.includes(state.selectedModel)) {
          state.selectedModel = models[0];
        }
      }
    } catch { /* ignore */ }
  }

  async function createEmptySession() {
    if (state.isProcessing) stopSending();
    const title = 'New chat';
    try {
      const sessions = getSessions();
      const pageUrl = state.pageInfo?.url || '';
      const project = detectProject(pageUrl);
      const tags = ['source:YiPet'];
      if (project) tags.push(`project:${project}`);
      const res = await sessions.create({
        title,
        url: `yipet://new/${Date.now()}`,
        tags,
        pageContent: '',
      });
      if (res.ok && res.data?.key) {
        const id = res.data.key as string;
        await _loadSessions();
        state.currentSessionId = id;
        state.title = title;
        state.messages = [];
        state.viewState = 'empty';
      }
    } catch { /* ignore */ }
  }

  // ── Draft images ───────────────────────────────────────────────────

  function addDraftImages(sources: string[]) {
    const remaining = 4 - state.draftImages.length;
    state.draftImages.push(...sources.slice(0, remaining));
  }

  function clearDraftImages() { state.draftImages = []; }
  function removeDraftImage(idx: number) { state.draftImages.splice(idx, 1); }

  // ── Message actions ────────────────────────────────────────────────

  function editMessage(idx: number, text: string) {
    if (idx < 0 || idx >= state.messages.length) return;
    state.messages[idx] = { ...state.messages[idx], content: text };
    persistActive();
    notify(t('chatMsgUpdated'));
  }

  function deleteMessage(idx: number) {
    if (idx < 0 || idx >= state.messages.length) return;
    state.messages.splice(idx, 1);
    const target = state.sessions.find((s) => s.id === state.currentSessionId);
    if (target) target.messageCount = state.messages.length;
    persistActive();
    notify(t('chatMsgDeleted'));
  }

  function copyMessage(text: string, ts: number) {
    const key = String(ts);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        state.copyFeedback[key] = 'copied';
        setTimeout(() => { delete state.copyFeedback[key]; }, 1500);
      })
      .catch(() => {});
  }

  async function regenerateMessage(idx: number) {
    if (state.isProcessing) return;
    const msgs = state.messages;
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= msgs.length) return;
    const pet = msgs[i];
    if (!pet || pet.type !== 'pet') return;

    let userIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (msgs[j] && msgs[j].type !== 'pet') { userIdx = j; break; }
    }
    if (userIdx < 0) return;
    const userMsg = msgs[userIdx];
    const text = String(userMsg.content ?? '').trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    msgs[i] = { ...pet, content: '', error: false, aborted: false, streaming: true };
    state.viewState = 'messages';
    state.isProcessing = true;
    state.scrollTick++;
    await _runStream(userIdx, pet.timestamp, 'regenerate');
  }

  async function resendMessage(idx: number) {
    if (state.isProcessing) return;
    const msgs = state.messages;
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= msgs.length) return;
    const userMsg = msgs[i];
    if (!userMsg || userMsg.type === 'pet') return;
    const text = String(userMsg.content ?? '').trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const petMsg: Message = { type: 'pet', content: '', timestamp: now + 1, streaming: true };
    msgs.push(petMsg);
    state.viewState = 'messages';
    state.isProcessing = true;
    state.scrollTick++;
    await _runStream(i, petMsg.timestamp, 'resend');
  }

  async function retryLastMessage() {
    if (state.isProcessing) return;
    const msgs = state.messages;
    if (msgs.length === 0) return;
    let petIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i] && msgs[i].type === 'pet') { petIdx = i; break; }
    }
    if (petIdx < 0) return;
    const pet = msgs[petIdx];
    if (!pet || (!pet.error && !pet.aborted)) return;
    await regenerateMessage(petIdx);
  }

  // ── Export ─────────────────────────────────────────────────────────

  function exportCurrentSessionMarkdown() {
    const ses = state.sessions.find((x) => x.id === state.currentSessionId);
    _exportMarkdown(state.messages, ses?.title || 'Untitled', state.pageInfo?.url || '', (msg) => notify(msg));
  }

  function exportConversationHtml() {
    const ses = state.sessions.find((x) => x.id === state.currentSessionId);
    _exportHtml(state.messages, ses?.title || 'Chat', state.pageInfo?.url || '', (msg) => notify(msg));
  }

  // ── Bridge to YiVad ────────────────────────────────────────────────

  async function openMessageInYiVad(ts: number) {
    const idx = state.messages.findIndex((m) => m.timestamp === ts);
    if (idx < 0) return;
    const msg = state.messages[idx];
    const content = (msg.content || '').trim();
    if (!content) return;
    const title = `YiPet -> ${content.slice(0, 60)}`;
    const seedMessages: { type: string; message: string }[] = [];
    if (msg.type === 'pet') {
      for (let j = idx - 1; j >= 0; j--) {
        if (state.messages[j].type === 'user') {
          seedMessages.push({ type: 'user', message: state.messages[j].content || '' });
          break;
        }
      }
      seedMessages.push({ type: 'user', message: `Continue from this assistant response:\n\n${content}` });
    } else {
      seedMessages.push({ type: 'user', message: content });
    }
    try {
      const sessions = getSessions();
      const res = await sessions.create({
        title,
        url: `yipet://bridge/${Date.now()}`,
        tags: ['source:YiPet', 'via:per-message-bridge'],
        pageContent: seedMessages.map((m) => `## ${m.type === 'user' ? 'User' : 'Pet'}\n\n${m.message}`).join('\n\n---\n\n'),
      });
      if (res.ok && res.data?.key) {
        await sessions.update(res.data.key as string, { messages: seedMessages } as unknown as Record<string, unknown>);
        window.open(`http://localhost:8848/#/aiChat?session=${res.data.key}`, '_blank', 'noopener,noreferrer');
        notify(t('chatOpenedInYiVad'));
      }
    } catch { /* ignore */ }
  }

  // ── Modals & UI toggles ────────────────────────────────────────────

  function toggleFaq() { state.faqVisible = !state.faqVisible; }
  function toggleSidebar() { state.sidebarCollapsed = !state.sidebarCollapsed; _persistSetting('sidebarCollapsed', state.sidebarCollapsed); }
  function setSearchInput(v: string) { state.searchInputValue = v; }
  function setSearchQuery(q: string) { state.searchQuery = q; }
  function toggleBatchMode() { state.batchMode = !state.batchMode; if (!state.batchMode) state.selectedSessionIds = []; }
  function openFaqManager() { state.faqVisible = true; }
  function editSessionInfo() { state.sessionEditVisible = true; }
  function openTagManager() { state.tagManagerVisible = true; }
  function openWeChatSettings() { state.weChatSettingsVisible = true; }
  function setInputText(text: string) { state.inputTemplate = text; (window as any).__yipetInputText = text; window.dispatchEvent(new CustomEvent('yipet:set-input', { detail: { text, mode: 'replace' } })); }
  function appendInputText(text: string) { const next = (state.inputTemplate || '') + (text || ''); state.inputTemplate = next; (window as any).__yipetInputText = next; window.dispatchEvent(new CustomEvent('yipet:set-input', { detail: { text, mode: 'append' } })); }
  async function loadFaqs(_force = false): Promise<void> {
    try { state.faqLoading = true; state.faqs = []; } catch { state.faqs = []; }
    finally { state.faqLoading = false; }
  }

  async function bulkDeleteSessions() {
    const ids = state.selectedSessionIds;
    if (!ids.length) return;
    for (const id of ids) {
      try { await getSessions().delete(id); } catch { /* continue */ }
    }
    if (ids.includes(state.currentSessionId || '')) {
      state.currentSessionId = null;
      state.messages = [];
      state.viewState = 'empty';
    }
    await _loadSessions();
    state.selectedSessionIds = [];
    state.batchMode = false;
    notify(`Deleted ${ids.length} sessions`);
  }

  // ── Context pressure ────────────────────────────────────────────────

  const contextPressure = computed(() => {
    const msgs = state.messages;
    if (!msgs?.length) return { level: 'low' as const, estimatedTokens: 0, pct: 0 };
    const totalChars = msgs.reduce((sum, m) => sum + (m.content?.length ?? 0), 0);
    const estimatedTokens = Math.ceil(totalChars / 4);
    const ctxWindow = 8192;
    const pct = Math.round((estimatedTokens / ctxWindow) * 100);
    const level = pct > 90 ? ('critical' as const) : pct > 70 ? ('high' as const) : pct > 40 ? ('mid' as const) : ('low' as const);
    return { level, estimatedTokens, pct };
  });

  // ── Mount ──────────────────────────────────────────────────────────

  const STALE_THRESHOLD_MS = 60_000;
  const CHROME_THROTTLE_THRESHOLD = 4.5 * 60 * 1000;
  let _lastVisibleTime = Date.now();
  let _hiddenTimer: ReturnType<typeof setTimeout> | null = null;
  let _visibilityHandler: (() => void) | null = null;

  function _onTabHidden(): void {
    _lastVisibleTime = Date.now();
    _hiddenTimer = setTimeout(() => {
      if (state.isProcessing && document.hidden) {
        streamingStore.stopSending();
      }
    }, CHROME_THROTTLE_THRESHOLD);
  }

  async function _onTabVisible(): Promise<void> {
    if (_hiddenTimer) { clearTimeout(_hiddenTimer); _hiddenTimer = null; }
    const hiddenDuration = Date.now() - _lastVisibleTime;
    if (hiddenDuration < STALE_THRESHOLD_MS) return;
    await _recoverFromBackground(hiddenDuration);
  }

  async function _recoverFromBackground(hiddenDuration: number): Promise<void> {
    if (state.isProcessing) {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg?.type === 'pet' && lastMsg.streaming) {
        lastMsg.streaming = false;
        lastMsg.error = true;
        lastMsg.aborted = true;
        if (!lastMsg.content.includes('Response interrupted')) {
          lastMsg.content += '\n\n> Response interrupted - tab was hidden for ' +
            Math.round(hiddenDuration / 1000) + 's.';
        }
      }
      streamingStore.finishStream();
      state.isProcessing = false;
    }
    await _loadSessions();
    state.scrollTick++;
  }

  function _onVisibilityChange(): void {
    if (document.hidden) { _onTabHidden(); } else { _onTabVisible(); }
  }

  async function mount() {
    state.pageInfo = readPageInfo();
    await _loadPersistedState();
    await _loadSessions();
    _visibilityHandler = _onVisibilityChange;
    document.addEventListener('visibilitychange', _visibilityHandler);
  }

  // ── URL-aware open ──────────────────────────────────────────────────

  function _tryMatchUrlSession() {
    state.pageInfo = readPageInfo();
    const url = state.pageInfo.url;
    if (!url) return;
    const match = findSessionByUrl(state.sessions, url);
    if (match && match.id !== state.currentSessionId) {
      selectSession(match.id);
    }
  }

  function open() {
    _windowActions.open();
    _tryMatchUrlSession();
  }

  // ── RAG ──────────────────────────────────────────────────────────────

  function toggleRag() {
    const wasEnabled = state.ragEnabled;
    state.ragEnabled = !state.ragEnabled;
    writeKV('yipet:ragEnabled', state.ragEnabled);
    if (state.ragEnabled) {
      if (!state.ragStatus) {
        loadRagStatus();
      } else if (!state.ragStatus.built || state.ragStatus.num_docs === 0) {
        notify('RAG index not built — enable and ask, or build index from YiAi first', 'warning');
      }
    }
  }

  async function loadRagStatus() {
    state.ragStatusLoading = true;
    try {
      const rag = getRag();
      const s = await rag.status();
      state.ragStatus = s;
    } catch {
      state.ragStatus = { built: false, num_docs: 0, error: 'Failed to load' };
    } finally {
      state.ragStatusLoading = false;
    }
  }

  function setRagScope(path: string, isFile: boolean) {
    state.ragScope = path;
    state.ragScopeIsFile = isFile;
    writeBatchKV({ 'yipet:ragScope': path, 'yipet:ragScopeIsFile': isFile });
  }

  function clearRagScope() {
    state.ragScope = '';
    state.ragScopeIsFile = false;
    writeBatchKV({ 'yipet:ragScope': '', 'yipet:ragScopeIsFile': false });
  }

  function openLlamaIndex() {
    state.llamaIndexVisible = true;
  }

  function closeLlamaIndex() {
    state.llamaIndexVisible = false;
  }

  async function translateSelection(fromLang?: string, toLang?: string) {
    const sel = window.getSelection()?.toString()?.trim();
    if (!sel || sel.length < 2) {
      notify('Select text on the page first, then click translate', 'info');
      return;
    }
    const translation = getTranslation();
    if (!translation) { notify('Translation service unavailable', 'error'); return; }
    try {
      const targetLang = toLang || (state as any).translateTargetLang || 'zh';
      const results = await translation.translate({
        text: sel,
        from_lang: fromLang || 'auto',
        to_lang: targetLang,
        providers: ['openai', 'ollama'],
      });
      const parts: string[] = [];
      let bestProvider = '';
      for (const r of results) {
        if (r.text && !r.error) {
          const label = r.cached ? `${r.provider} (cached)` : r.provider;
          parts.push(`[${label}] ${r.text}`);
          if (!bestProvider) bestProvider = r.provider;
        }
      }
      const output = parts.length
        ? parts.join('\n')
        : (results?.[0]?.text || '');
      if (!output) { notify('Translation returned empty', 'warning'); return; }
      state.inputTemplate = `[Translate ${sel.slice(0, 40)}${sel.length > 40 ? '...' : ''}]\n${output}`;
      // Store for feedback
      state._lastTranslation = { source: sel, target: output, provider: bestProvider, fromLang: fromLang || 'auto', toLang: targetLang };
      if (!state.visible) state.visible = true;
      notify(`Translated via ${results.filter(r => r.text).length} provider(s)`, 'success');
    } catch (e: any) {
      notify(e?.message || 'Translation failed', 'error');
    }
  }

  async function submitTranslationFeedback(rating: 'good' | 'bad') {
    const last = state._lastTranslation;
    if (!last) return;
    try {
      const translation = getTranslation();
      if (translation) {
        await translation.feedback({
          source: last.source, target: last.target, rating,
          provider: last.provider, from_lang: last.fromLang, to_lang: last.toLang,
        });
        notify(`Feedback (${rating}) recorded`, 'success');
      }
    } catch { /* best-effort */ }
    state._lastTranslation = null;
  }

  function clearTranslationFeedback() {
    state._lastTranslation = null;
  }

  function toggleRagFast() {
    state.ragFast = !state.ragFast;
    writeKV('yipet:ragFast', state.ragFast);
  }

  function toggleRagHybrid() {
    state.ragHybrid = !state.ragHybrid;
    writeKV('yipet:ragHybrid', state.ragHybrid);
  }

  function toggleRagRerank() {
    state.ragRerank = !state.ragRerank;
    writeKV('yipet:ragRerank', state.ragRerank);
  }

  function toggleRagCitations() {
    state.ragCitations = !state.ragCitations;
    writeKV('yipet:ragCitations', state.ragCitations);
  }

  function toggleRagHyde() {
    state.ragHyde = !state.ragHyde;
    writeKV('yipet:ragHyde', state.ragHyde);
  }

  function setRagNumQueries(n: number) {
    state.ragNumQueries = n;
    writeKV('yipet:ragNumQueries', n);
  }

  function setRagChatMode(mode: string) {
    state.ragChatMode = mode;
    writeKV('yipet:ragChatMode', mode);
  }

  function resetRagSettings() {
    state.ragChatMode = 'condense_plus_context';
    state.ragFast = false;
    state.ragNumQueries = 0;
    state.ragHybrid = true;
    state.ragRerank = true;
    state.ragHyde = false;
    state.ragCitations = true;
    writeBatchKV({
      'yipet:ragChatMode': 'condense_plus_context',
      'yipet:ragFast': false,
      'yipet:ragNumQueries': 0,
      'yipet:ragHybrid': true,
      'yipet:ragRerank': true,
      'yipet:ragHyde': false,
      'yipet:ragCitations': true,
    });
  }

  // ── Return: full backward-compatible API ────────────────────────────

  return {
    state,
    // Service injection
    injectServices, setNotifyHandler,
    // Window
    ..._windowActions,
    open,
    // Sessions
    selectSession, createSession, deleteSession,
    toggleFavorite, renameSession,
    // Messages
    sendMessage, stopSending, scrollToBottom,
    pushPromptHistory,
    // Color/Role
    setColorIndex, setRole, setSystemPrompt,
    fetchModels, createEmptySession,
    // Modals
    toggleFaq, toggleSidebar,
    setSearchInput, setSearchQuery, toggleBatchMode,
    // Mount
    mount,
    // Prompt history
    recallPromptHistory, removePromptHistoryAt, invokePromptHistory, clearPromptHistory,
    addPromptTemplate, removePromptTemplate,
    // Draft images
    addDraftImages, clearDraftImages, removeDraftImage,
    // Message operations
    editMessage, deleteMessage, copyMessage,
    regenerateMessage, resendMessage, retryLastMessage, exportCurrentSessionMarkdown, exportConversationHtml,
    openMessageInYiVad,
    openFaqManager, editSessionInfo, openTagManager, openWeChatSettings,
    setInputText, appendInputText, loadFaqs,
    updateSessionMeta,
    bulkDeleteSessions,
    contextPressure,
    // Tool registry (delegated to toolEventsStore)
    registerTool: toolEventsStore.registerTool,
    setToolEnabled: toolEventsStore.setToolEnabled,
    getTool: toolEventsStore.getTool,
    allTools: toolEventsStore.allTools,
    activeTools: toolEventsStore.activeTools,
    toolEventsStream: toolEventsStore.toolEvents,
    emitToolEvent: toolEventsStore.emitToolEvent,
    executeTool: toolEventsStore.executeTool,
    getToolsForSystemPrompt: toolEventsStore.getToolsForSystemPrompt,
    // Context files (delegated to ctxFilesStore)
    contextChangeHistory: ctxFilesStore.contextChangeHistory,
    applyContextChange: ctxFilesStore.applyContextChange,
    undoLastContextChange: ctxFilesStore.undoLastContextChange,
    addContextFile: ctxFilesStore.addContextFile,
    removeContextFile: ctxFilesStore.removeContextFile,
    getContextSectionContent: ctxFilesStore.getContextSectionContent,
    deleteContextSection: ctxFilesStore.deleteContextSection,
    // Compaction
    compactionLog: compact.compactionLog,
    maybeCompact: compact.maybeCompact,
    modelsLoading,
    // Context files
    loadContextText: ctxFilesStore.loadContextText,
    loadKnowledgeTree,
    readKnowledgeFileContent,
    openKnowledgePreview,
    navigateKnowledgePreview,
    saveKnowledgePreview,
    closeKnowledgePreview,
    // RAG
    toggleRag, toggleRagFast, loadRagStatus, setRagScope, clearRagScope,
    toggleRagHybrid, toggleRagRerank, toggleRagCitations, toggleRagHyde,
    setRagNumQueries, setRagChatMode, resetRagSettings,
    openLlamaIndex, closeLlamaIndex,
    translateSelection, submitTranslationFeedback, clearTranslationFeedback,
  };
});