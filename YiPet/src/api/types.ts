/**
 * API request/response type definitions — single source of truth for all API shapes.
 *
 * Layer 3: consumed by service modules and callers for compile-time safety.
 * All types match YiAi's actual request/response schemas.
 */

// ── Execution module (JSON-RPC) ────────────────────────────────────────

/** Request body for YiAi's / execution module endpoint. */
export interface RpcRequest {
  module_name: string;
  method_name: string;
  parameters: Record<string, unknown>;
}

// ── Auth ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  username: string;
}

// ── Chat / Prompt (via execution module: services.ai.chat_service) ────

export interface ChatParams {
  /** User prompt text (single-turn, legacy). */
  user?: string;
  /** Conversation messages (multi-turn, preferred). Each msg has {role, content}. */
  messages?: Array<{ role: string; content: string }>;
  /** System prompt (optional). */
  system?: string;
  /** Model name (optional). */
  model?: string;
  /** Enable SSE streaming. */
  stream?: boolean;
  /** Conversation/session ID. */
  conversation_id?: string;
  /** Base64-encoded images or HTTP URLs. */
  images?: string[];
}

export interface ChatResponse {
  success: boolean;
  model?: string;
  message?: string;
  error?: string;
}

// ── CRUD params (via execution module: services.database.data_service) ─

export interface QueryParams {
  /** Collection name (cname for short). */
  cname: string;
  /** MongoDB query filter (merged into the backend's query_params). */
  filter?: Record<string, unknown>;
  /** Sort specification. */
  sort?: Record<string, number>;
  /** Page number (1-indexed). */
  pageNum?: number;
  /** Page size. */
  pageSize?: number;
  /** Fields to include/exclude. */
  projection?: Record<string, number>;
}

export interface CreateParams {
  cname: string;
  data: Record<string, unknown>;
}

export interface UpdateParams {
  cname: string;
  /** Document key (for sessions collection). */
  key: string;
  data: Record<string, unknown>;
}

export interface DeleteParams {
  cname: string;
  key: string;
}

/** YiAi query_documents response wrapper. */
export interface QueryResult<T = unknown> {
  list?: T[];
  documents?: T[];
  result?: T[];
  total?: number;
  pageNum?: number;
  pageSize?: number;
  totalPages?: number;
}

/** YiAi create_document / update_document / delete_document response. */
export interface MutationResult {
  key?: string;
  query?: Record<string, unknown>;
  updated?: boolean;
  deleted?: boolean;
}

// ── Session record (sessions collection) ───────────────────────────────

export interface SessionData {
  title?: string;
  url?: string;
  messages?: ChatMessage[];
  pageContent?: string;
  pageDescription?: string;
  isFavorite?: boolean;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  lastAccessTime?: number;
  messageCount?: number;
}

export interface SessionRecord {
  key: string;
  id?: string;
  title?: string;
  url?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageContent?: string;
  messages?: ChatMessage[];
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  lastAccessTime?: number;
  isFavorite?: boolean;
  messageCount?: number;
  filePath?: string;
  file_path?: string;
  /** Nested data field — some MongoDB docs store session info inside a `data` wrapper. */
  data?: SessionData;
}

export interface ChatMessage {
  type: 'user' | 'pet';
  content?: string;
  message?: string;
  timestamp?: number;
  imageDataUrl?: string;
  imageDataUrls?: string[];
  error?: boolean;
  aborted?: boolean;
  /** RAG sources — from grounded chat responses (YiVad compatible). */
  sources?: RagSource[];
  /** RAG metadata — retrieval config used for this message. */
  ragMeta?: Record<string, unknown>;
  /** Time-to-first-token latency in ms. */
  firstTokenLatencyMs?: number;
  /** Web search context injected alongside the message. */
  searchContext?: string;
  /** Web search results for this turn. */
  searchResults?: WebSearchResult[];
  /** Web search image results. */
  searchImages?: WebImageResult[];
  /** True when this message used web search grounding. */
  searchGrounded?: boolean;
  /** Refined web query for this turn. */
  searchQuery?: string;
  /** Web search elapsed time. */
  searchTimingMs?: number;
  /** Tool calls fired during this turn. */
  toolCalls?: Array<{
    name: string;
    label: string;
    args?: Record<string, unknown>;
    content?: string;
    error?: string;
    durationMs?: number;
  }>;
  /** RAG retrieval grade A/B/C/D. */
  retrievalGrade?: 'A' | 'B' | 'C' | 'D';
  /** RAG summary text. */
  ragContentSummary?: string;
}

// ── Files ─────────────────────────────────────────────────────────────

export interface FileReadRequest {
  target_file: string;
}

export interface FileWriteRequest {
  target_file: string;
  content: string;
  is_base64?: boolean;
}

export interface FileDeleteRequest {
  target_file: string;
}

export interface FolderDeleteRequest {
  target_dir: string;
}

export interface FileRenameRequest {
  old_path: string;
  new_path: string;
}

export interface FolderRenameRequest {
  old_dir: string;
  new_dir: string;
}

export interface ImageUploadRequest {
  data_url: string;
  filename?: string;
  directory?: string;
}

// ── State Store ────────────────────────────────────────────────────────

export interface StateRecord {
  key?: string;
  record_type: string;
  title?: string;
  payload?: Record<string, unknown>;
  tags?: string[];
  created_time?: string;
  updated_time?: string;
}

export interface StateQueryParams {
  record_type?: string;
  tags?: string[];
  title_contains?: string;
  created_after?: string;
  created_before?: string;
  page_num?: number;
  page_size?: number;
}

// ── WeCom Bot Webhook ───────────────────────────────────────────

/** A user-configured WeCom bot. Stored locally (chrome.storage) per browser. */
export interface WeWorkBot {
  /** Stable ID for list keys. */
  id: string;
  /** Display name shown in UI and per-message action buttons. */
  name: string;
  /** Full WeCom webhook URL (https://qyapi.weixin.qq.com/...). */
  webhook: string;
  /** Disabled bots are skipped for both manual and auto-forward. */
  enabled: boolean;
  /** When true, pet responses are auto-posted to this bot after streaming. */
  autoForward: boolean;
}

/** Request body for POST /wework/send-message. */
export interface WeWorkSendMessageParams {
  webhook_url: string;
  content: string;
}

/** Response from POST /wework/send-message. */
export interface WeWorkSendMessageResult {
  message?: string;
}

// ── RAG (shared types - kept for chat message sources) ─────────────────

export interface RagSource {
  path: string;
  score?: number;
  snippet?: string;
  metadata?: Record<string, unknown>;
}

export interface RagIndexConfig {
  embed_model: string;
  llm_model: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  hybrid_retrieval: boolean;
  rerank_enabled: boolean;
  inline_citations: boolean;
  auto_rebuild: boolean;
  knowledge_base_dir: string;
}

export interface RagStatusResponse {
  built: boolean;
  num_docs: number;
  last_built_at?: string;
  persist_dir?: string;
  persist_dir_size?: number;
  config?: RagIndexConfig;
  error?: string;
}

export interface RagQueryResponse {
  sources: RagSource[];
  question: string;
}

export interface RagSubQuestion {
  sub_q: string;
  answer: string;
  sources: RagSource[];
}

export interface RagDecomposeResponse {
  original: string;
  synthesis: string;
  sub_questions: RagSubQuestion[];
  error?: string;
}

export interface RagHistoryRecord {
  question: string;
  sources: RagSource[];
  grade?: string;
  timestamp: string;
}

export interface RagChatTurnRecord {
  messages: Array<{ role: string; content: string }>;
  sources: RagSource[];
  grade?: string;
  timestamp: string;
}

export interface RagAnalyticsResponse {
  scopePopularity?: Array<{ scope: string; count: number }>;
  topRepeatedQuestions?: Array<{ question: string; count: number }>;
  topStaleFiles?: Array<{ path: string; last_used: string }>;
  topScoringFiles?: Array<{ path: string; avg_score: number }>;
  coverageGap?: Array<{ scope: string; missing_files: string[] }>;
}

export interface RagChatPayload {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  scope?: string;
  category?: string;
  stream?: boolean;
  hybrid?: boolean;
  rerank?: boolean;
  citations?: boolean;
  hyde_enabled?: boolean;
  fast?: boolean;
  chat_mode?: string;
  num_queries?: number;
  file_paths?: string[];
}

export interface RagFileChatPayload {
  target_file: string;
  messages: Array<{ role: string; content: string }>;
  model?: string;
  stream?: boolean;
}

// ── Search (web search + page fetch) ───────────────────────────────────

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  quality?: number;
  date?: string;
}

export interface WebImageResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  images?: WebImageResult[];
  query?: string;
  error?: string;
}

export interface WebFetchResponse {
  text: string;
  url: string;
  error?: string;
}

// ── Agent (Pi-inspired multi-turn tool-calling loop) ─────────────────────

export type TodoItemStatus = 'pending' | 'in_progress' | 'completed';

/** A single todo item. */
export interface TodoItem {
  id: string;
  content: string;
  status: TodoItemStatus;
}

// ── Knowledge (YiKnowledge markdown tree) ──────────────────────────────

export interface KnowledgeFileEntry {
  name: string;
  path: string;
  meta?: Record<string, unknown>;
  updated?: string;
}

export interface KnowledgeScanResponse {
  categories: Array<{
    category: string;
    files: KnowledgeFileEntry[];
  }>;
}

export interface KnowledgeReadResponse {
  path: string;
  name: string;
  content: string;
  meta?: Record<string, unknown>;
}

export interface KnowledgeWriteResponse {
  path: string;
  name: string;
}