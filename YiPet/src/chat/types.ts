/**
 * YiPet Chat — Shared type definitions.
 */

import type {
  ChatMessage,
  KnowledgeFileEntry,
  RagSource,
  RagStatusResponse,
  WebImageResult,
  WebSearchResult,
  WeWorkBot,
} from '@/api/types';

// ── Tool Call (Pi-inspired per-message tool timeline) ────────────────────

export interface ToolCall {
  name: string;
  label: string;
  args?: Record<string, unknown>;
  content?: string;
  error?: string;
  durationMs?: number;
}

/** Transient tool event fired during pre-stream execution — later coalesced into
 *  Message.toolCalls on the pet message. */
export interface ToolEvent {
  name: string;
  phase: "start" | "end";
  label: string;
  args?: Record<string, unknown>;
  content?: string;
  error?: string;
  durationMs?: number;
  timestamp: number;
}

// ── Context Changes (ctx: tag sections + undo history) ────────────────────────

export interface ContextChangeEntry {
  path: string;
  previousContent: string;
  previousPageContent: string;
  previousTags: string[];
  timestamp: number;
}

// ── Conversation Compaction ──────────────────────────────────────────────

export interface CompactionEntry {
  sessionKey: string;
  timestamp: number;
  before: number;
  after: number;
  saved: number;
}

// ── Conversation Tree (nested branch visualisation) ───────────────────────────

export interface ConversationTreeNode {
  key: string;
  timestamp: number;
  label: string;
  type: "user" | "pet" | "branch-root";
  parentKey: string | null;
  children: ConversationTreeNode[];
  collapsed?: boolean;
}

// ── Page Info ─────────────────────────────────────────────────────────────

export interface PageInfo {
  title: string;
  url: string;
  iconUrl: string;
}

// ── Message ─────────────────────────────────────────────────────────────

export interface Message {
  type: 'user' | 'pet';
  content: string;
  timestamp: number;
  streaming?: boolean;
  error?: boolean;
  /** Set when the user aborted streaming or the request errored. */
  aborted?: boolean;
  /** Base64 data URL for image messages (legacy single-image field) */
  imageDataUrl?: string;
  /** Multi-image support — list of base64 data URLs. */
  imageDataUrls?: string[];
  /** RAG provenance — surfaced as a provenance badge below the markdown. */
  ragMeta?: RagMeta;
  /** RAG sources for this message (from grounded chat). */
  sources?: RagSource[];
  /** Time-to-first-token latency in ms (for latency badge). */
  firstTokenLatencyMs?: number;
  /** Whether this message used web search grounding. */
  searchGrounded?: boolean;
  /** Web search results for this turn — displayed alongside the message. */
  searchResults?: WebSearchResult[];
  /** Web search image results — parallel-fetched by backend, displayed as thumbnails. */
  searchImages?: WebImageResult[];
  /** Refined web query actually executed for this turn. */
  searchQuery?: string;
  /** Web search elapsed time for this turn. */
  searchTimingMs?: number;
  /** Tool calls fired during this turn (Pi-inspired: per-message tool timeline). */
  toolCalls?: ToolCall[];
  /** RAG retrieval grade A/B/C/D — from backend's retrieval scoring. */
  retrievalGrade?: 'A' | 'B' | 'C' | 'D';
  /** RAG summary (top source title + file count) for quick glance. */
  ragContentSummary?: string;
}

/** RAG provenance metadata surfaced per pet message. */
export interface RagMeta {
  chatMode?: string;
  hybrid?: boolean;
  rerank?: boolean;
  citations?: boolean;
  numQueries?: number;
  category?: string;
  tags?: string[];
  scope?: string;
}

// ── Session ─────────────────────────────────────────────────────────────

export interface SessionItem {
  id: string;
  title: string;
  url: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  messages?: ChatMessage[];
  isFavorite?: boolean;
  tags?: string[];
  pageContent?: string;
  pageTitle?: string;
  pageDescription?: string;
  filePath?: string;
}

// ── Window State ────────────────────────────────────────────────────────

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isFullscreen: boolean;
}

// ── Chat State ──────────────────────────────────────────────────────────

export interface ChatState {
  visible: boolean;
  title: string;
  viewState: 'loading' | 'error' | 'empty' | 'messages';
  pageInfo: PageInfo;
  messages: Message[];
  isProcessing: boolean;
  sessions: SessionItem[];
  currentSessionId: string | null;
  /** Immediate input value for responsive UI (before debounce) */
  searchInputValue: string;
  /** Debounced query used for actual filtering */
  searchQuery: string;
  /** When non-empty, `filteredSessions` only includes sessions whose URL
   *  resolves to this project (via detectProjectFromUrl). Values: 'YiAi' /
   *  'YiVad' / 'YiKnowledge' / 'YiPet' / 'unknown'. Empty string = all. */
  sessionProjectFilter: string;
  sessionLoading: boolean;
  /** Error message from the last session list load, if any. */
  sessionError: string;
  /** True once sessions have been loaded at least once (even if empty). */
  sessionsLoaded: boolean;
  /** Timestamp of last successful session sync (Date.now()) */
  lastSyncTime: number;
  /** Last translation result for quality feedback */
  _lastTranslation?: { source: string; target: string; provider: string; fromLang: string; toLang: string } | null;
  sidebarCollapsed: boolean;
  /** Sidebar width in pixels (default 320) */
  sidebarWidth: number;
  /** Batch mode for multi-select session operations */
  batchMode: boolean;
  /** Session IDs selected in batch mode */
  selectedSessionIds: string[];
  /** Draft images (base64 data URLs) waiting to be sent */
  draftImages: string[];
  /** Sources returned by the most recent grounded turn. Cleared on next send. */
  ragSources: RagSource[];
  /** RAG toggle — when enabled, chat uses RAG-grounded streaming. */
  ragEnabled: boolean;
  /** RAG scope — file or directory path to limit retrieval. */
  ragScope: string;
  /** Whether the RAG scope points to a single file (vs directory). */
  ragScopeIsFile: boolean;
  /** RAG index status from backend. */
  ragStatus: RagStatusResponse | null;
  /** True while RAG status is being fetched. */
  ragStatusLoading: boolean;
  /** Fast mode — skip retrieval for direct answer. */
  ragFast: boolean;
  /** Hybrid retrieval — combine BM25 keyword + vector semantic search. */
  ragHybrid: boolean;
  /** Rerank — re-rank retrieved chunks with LLM cross-encoder. */
  ragRerank: boolean;
  /** Inline citations — prefix chunks with [Source N] in LLM prompt. */
  ragCitations: boolean;
  /** HyDE — generate hypothetical answer first to improve retrieval. */
  ragHyde: boolean;
  /** Number of query variants for QueryFusionRetriever (0 = default/1). */
  ragNumQueries: number;
  /** llama_index chat engine mode (condense, condense_plus_context, context, simple). */
  ragChatMode: string;
  /** Knowledge tree data from YiKnowledge scan. Categories each contain a flat file list. */
  knowledgeTree: Array<{ category: string; files: KnowledgeFileEntry[] }>;
  knowledgeLoading: boolean;
  knowledgeError: string;
  /** Knowledge file preview dialog. */
  knowledgePreviewVisible: boolean;
  knowledgePreviewPath: string;
  knowledgePreviewData: import('@/api/types').KnowledgeReadResponse | null;
  knowledgePreviewLoading: boolean;
  /** LlamaIndex RAG console dialog visibility. */
  llamaIndexVisible: boolean;
  /** Web search toggle — when enabled, appends web results to the LLM context. */
  webSearchEnabled: boolean;
  /** Web search image results (latest turn). */
  webSearchImages: WebImageResult[];
  /** True while web search is in flight. */
  webSearching: boolean;
  /** Elapsed ms for the most recent web search. */
  searchTimingMs: number;
  /** Refined query that was actually searched. */
  lastSearchQuery: string;
  /** Currently selected model (e.g. "qwen3.5", "qwen3-coder"). */
  selectedModel: string;
  /** Available model list from the backend. */
  availableModels: string[];
  /** Session summary modal visibility + content. */
  sessionSummaryVisible: boolean;
  sessionSummaryLoading: boolean;
  sessionSummaryText: string;
  sessionSummaryError: string;
  /** WeCom bot list (persisted to chrome.storage.local). */
  weChatRobots: WeWorkBot[];
  /** Draft copy edited in the settings modal; committed on save. */
  weChatRobotsDraft: WeWorkBot[];
  /** Whether the WeCom bot settings modal is open. */
  weChatSettingsVisible: boolean;
  /** Active color palette index — follows popup color changes via yipet:colorChanged. */
  colorIndex: number;
  /** Optional custom hex color from the popup theme picker. */
  customColor: string;
  /** Role system prompt sent as `system` field in chat requests. Updated via yipet:roleChanged. */
  systemPrompt: string;
  /** Canonical role name (e.g. "Teacher"), drives the header avatar. Updated via yipet:roleChanged. */
  roleName: string;
  /** Resolved URL of the active role's icon, for the header avatar. Empty = fallback emoji. */
  roleImageUrl: string;
  /** Timestamp of the pet message currently being streamed. */
  streamingTargetTimestamp: number | null;
  /** Current streaming action type — controls RequestStatusButton label. */
  streamingType: '' | 'send' | 'regenerate' | 'resend';
  streamingPhase: '' | 'fetching' | 'preparing' | 'thinking' | 'retrieving' | 'streaming';
  /** Timestamp (Date.now()) when the current stream entered "thinking" phase.
   *  Reset to null when streaming ends. Pet message uses this for elapsed display. */
  thinkingStartTs: number | null;
  /** Web search results surfaced on user messages. */
  webSearchResults: WebSearchResult[];
  /** Transient tool events fired during pre-stream execution; later coalesced
   *  into the pet message's `toolCalls` array. */
  toolEvents: ToolEvent[];
  /** Context editor (ctx: file sections) popover visibility. */
  contextEditorVisible: boolean;
  /** Draft text for the context editor — modified before `undo`/`apply`. */
  contextEditorDraft: string;
  /** Context panel browse vs edit mode switch: true = adding new sections. */
  contextPanelNewMode: boolean;
  /** General purpose Set of selected keys (tree browse, batch multi-select). */
  selectedKeys: Set<string>;
  /** Context change undo history (most recent first). */
  contextChangeHistory: ContextChangeEntry[];
  /** Long-conversation compaction log — most recent last. */
  compactionLog: CompactionEntry[];
  /** Monotonic counter bumped during streaming to trigger auto-scroll. */
  scrollTick: number;
  /** Per-timestamp copy feedback state — '' or 'copied'. */
  copyFeedback: Record<string, string>;
  /** Whether the FAQ modal is open. */
  faqVisible: boolean;
  /** FAQ search query. */
  faqSearch: string;
  /** FAQ apply mode — append to input vs insert at cursor. */
  faqApplyMode: 'append' | 'insert';
  /** Whether the session-edit modal is open. */
  sessionEditVisible: boolean;
  /** Whether the tag-manager modal is open. */
  tagManagerVisible: boolean;
  /** Last template content pushed to the input bar (QuickButtons template mode). */
  inputTemplate: string;
  /** Primary chat input text — directly bound to v-model via toRef in useChatInput.
   *  Mirror of YiVad's `store.input`. Set directly from TemplatePicker / QuickButtons. */
  inputText: string;
  /** Persisted prompt history (most recent last). Mirror of YiVad's
   *  `usePromptHistory` — capped at 100, dedupes consecutive duplicates. */
  promptHistory: string[];
  /** Custom prompt templates created by the user. Persisted to chrome.storage.local.
   *  Mirror of YiVad's `usePromptTemplates`. */
  promptTemplates: Array<{ name: string; content: string }>;
  /** Whether the prompt-history popover is open (toolbar button). */
  promptHistoryVisible: boolean;
  /** FAQ documents fetched from backend for the current role/project. Empty
   *  until first loadFaq() call. */
  faqs: Array<{ id?: string; title?: string; prompt?: string; tags?: string[] }>;
  /** True while the FAQ list is being (re)loaded. */
  faqLoading: boolean;
  ws: WindowState;
  isDragging: boolean;
  isResizing: boolean;
}