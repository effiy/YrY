/**
 * TypeScript interfaces for YiAi / YiWeb data service.
 * The YiAi backend uses a generic RPC protocol: POST {API_URL}/
 * with { module_name, method_name, parameters }.
 */

// ── RPC protocol ──

/** Generic RPC payload sent to the YiAi data service */
export interface ServicePayload {
  module_name: string;
  method_name: string;
  parameters: Record<string, any>;
}

/** Unified response envelope from YiAi */
export interface YiAiEnvelope<T = any> {
  code: number;
  message: string;
  data: T;
}

// ── Database service (services.database.data_service) ──

/** Response shape from query_documents */
export interface QueryDocumentsData<T = any> {
  list: T[];
  total?: number;
}

/** Query parameters for query_documents */
export interface QueryDocumentsParams {
  cname: string;
  filter?: Record<string, any>;
  // NOTE: `tags` and `search` are silently ignored by the YiAi backend
  // (query_documents only honors `filter`). They remain in the type to avoid
  // breaking existing callers, but should not be relied on — use `filter`.
  tags?: string[];
  search?: string;
  limit?: number;
  pageNum?: number;
  pageSize?: number;
  orderBy?: string;
  orderType?: "asc" | "desc";
  fields?: string[];
  excludeFields?: string[];
}

// ── Session documents ──

/** Claude-derived tag kinds — derived from a session's file_path segments */
export type TagKind = "skills" | "templates" | "rules" | "agents";

export interface SessionDocument {
  key: string;
  url: string;
  title: string;
  pageTitle?: string;
  pageDescription: string;
  pageContent?: string;
  messages: ChatMessage[];
  tags: string[];
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
  lastAccessTime?: number;
  file_path?: string;
  filePath?: string;
}

/** Context editor draft — mirrors the working copy while the editor is open */
export interface SessionContextDraft {
  text: string;
  images: string[];
  enabled: boolean;
  /** index of the message being edited, or null for a new context */
  messageIndex: number | null;
}

/** One chunk emitted by the YiAi SSE streaming chat endpoint */
export interface ChatStreamChunk {
  message?: string;
  done?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  type: "user" | "pet" | "followup";
  message: string;
  content?: string;
  timestamp: number;
  imageDataUrls?: string[];
  error?: boolean;
  aborted?: boolean;
  /** RAG citations — set by streamRagChat/streamRagFileChat when ragEnabled. */
  sources?: import("@/api/interface/rag").RagSource[];
  /** RAG retrieval config used to produce this pet message — mode + per-call
   *  overrides. Lets the UI badge each answer with what llama_index config
   *  produced it (provenance after the user toggles settings). */
  ragMeta?: {
    chatMode?: string;
    hybrid?: boolean;
    rerank?: boolean;
    citations?: boolean;
    numQueries?: number;
    scope?: string;
    category?: string;
    tags?: string[];
  };
  /** Time-to-first-token latency in ms — measured from stream start to the
   *  arrival of the first content chunk. Proxy for retrieval + condense
   *  + synthesis latency in RAG turns (backend doesn't emit this frame
   *  yet; the store snapshots it client-side). */
  firstTokenLatencyMs?: number;
  /** Web search context injected alongside this user message. */
  searchContext?: string;
  /** Tool calls fired during this turn (Pi-inspired: per-message tool timeline).
   *  Populated by sendMessage/resendMessage from useToolRegistry events. */
  toolCalls?: Array<{
    name: string;
    label: string;
    args?: Record<string, unknown>;
    /** Result content (truncated for display). */
    content?: string;
    error?: string;
    /** Duration in milliseconds. */
    durationMs?: number;
  }>;
}

// ── Chat Entry Model (Pi-inspired rich session entries) ──

/**
 * Discriminated union of entry types in a chat session.
 * Inspired by Pi's SessionEntry model: each entry carries a `type` and
 * type-specific payload fields, enabling tool calls, file operations,
 * and model changes to be first-class parts of the conversation history.
 *
 * Backward compat: old `ChatMessage` objects are normalized to `ChatEntry`
 * on load — `{type:"user"|"pet", message}` → `{entryType:"message", role, message}`.
 */
export type ChatEntryType =
  | "message"
  | "tool_call"
  | "tool_result"
  | "context_edit"
  | "model_change";

export interface ChatEntry {
  /** Entry discriminator */
  entryType: ChatEntryType;
  timestamp: number;

  // ── message entries ──
  /** "user" | "assistant" — who sent this message */
  role?: "user" | "assistant";
  /** Message text (markdown) */
  message?: string;
  /** Data URLs for vision-language models */
  imageDataUrls?: string[];
  /** RAG citation sources */
  sources?: import("@/api/interface/rag").RagSource[];
  /** Web search context attached to this user message */
  searchContext?: string;

  // ── tool_call / tool_result entries ──
  /** Name of the tool being called */
  toolName?: string;
  /** Arguments passed to the tool (JSON-serializable) */
  toolArgs?: Record<string, unknown>;
  /** Result content from the tool execution */
  toolResult?: string;
  /** Structured metadata from tool execution */
  toolDetails?: Record<string, unknown>;

  // ── context_edit entries ──
  /** File path that was edited */
  filePath?: string;
  /** Previous content (for undo) */
  previousContent?: string;

  // ── model_change entries ──
  /** New model ID after switching */
  modelId?: string;

  // ── status flags ──
  /** True if this entry represents an error state */
  error?: boolean;
  /** True if generation was aborted mid-stream */
  aborted?: boolean;
}

/**
 * Normalize a legacy ChatMessage or a ChatEntry into a ChatEntry.
 * Ensures backward compatibility when loading old sessions.
 */
export function normalizeEntry(raw: ChatMessage | ChatEntry | Record<string, unknown>): ChatEntry {
  // Already a ChatEntry?
  if (raw && typeof raw === "object" && "entryType" in raw) {
    return raw as ChatEntry;
  }
  // Legacy ChatMessage → ChatEntry
  const msg = raw as ChatMessage;
  return {
    entryType: "message",
    timestamp: msg.timestamp ?? 0,
    role: msg.type === "user" ? "user" : "assistant",
    message: msg.message ?? (msg as { content?: string }).content ?? "",
    imageDataUrls: msg.imageDataUrls,
    sources: msg.sources,
    searchContext: msg.searchContext,
    error: msg.error,
    aborted: msg.aborted,
  };
}

/** Convert ChatEntry[] from legacy ChatMessage[] */
export function normalizeEntries(raw: (ChatMessage | ChatEntry)[]): ChatEntry[] {
  return raw.map(normalizeEntry);
}

// ── Project zip upload (client-side parse + per-file write) ──

export interface ProjectZipUploadEntry {
  path: string;
  /** JSZip file object — opaque to the data layer */
  file: unknown;
  isImage: boolean;
}

// ── FAQ documents ──

export interface FaqDocument {
  key: string;
  title: string;
  /** Primary prompt text */
  prompt: string;
  tags: string[];
  order?: number;
  updatedTime?: number;
  createdAt?: number;
  updatedAt?: number;
}

// ── File operations ──

export interface WriteFilePayload {
  target_file: string;
  content: string;
  is_base64?: boolean;
}

export interface ReadFilePayload {
  target_file: string;
}

export interface ReadFileResponse {
  content: string;
  target_file: string;
  size?: number;
}

// ── OSS upload ──

export interface OssUploadPayload {
  data_url: string;
  filename?: string;
  directory?: string;
}

export interface OssUploadResponse {
  url: string;
}

// ── Ollama models ──

export interface OllamaModel {
  name: string;
  model?: string;
  size: number;
  sizeFormatted?: string;
  modifiedAt?: string;
  modified_at?: string;
  details: Record<string, any>;
}

export interface OllamaModelListResponse {
  success: boolean;
  models: OllamaModel[];
}

// ── Chat ──

export interface ChatPayload {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  system?: string;
  temperature?: number;
  images?: string[];
}

// ── AI Coding History documents ──

export interface AiCodingHistoryDocument {
  key: string;
  storyKey: string;
  scenarioKey: string;
  scenarioName: string;
  prompt: string;
  generatedAt: number;
  type?: "ai_coding" | "analysis_files";
  createdAt: number;
  updatedAt: number;
}

// ── Menu documents (system menus) ──

export interface MenuDocument {
  key: string;
  path: string;
  name: string;
  component?: string;
  redirect?: string;
  parentId?: string | null;
  sort?: number;
  icon?: string;
  title: string;
  isLink?: string;
  isHide?: boolean;
  isFull?: boolean;
  isAffix?: boolean;
  isKeepAlive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// ── Department documents ──

export interface DepartmentDocument {
  key: string;
  id: string;
  name: string;
  parentId?: string | null;
  children?: DepartmentDocument[];
  createdAt?: number;
  updatedAt?: number;
}

// ── Role documents ──

export interface RoleDocument {
  key: string;
  id: string;
  name: string;
  code?: string;
  description?: string;
  permissions?: string[];
  parentId?: string | null;
  children?: RoleDocument[];
  createdAt?: number;
  updatedAt?: number;
}

// ── Dictionary documents ──

export interface DictDocument {
  key: string;
  dictName: string;
  label: string;
  value: string | number;
  sort?: number;
  status?: number;
  createdAt?: number;
  updatedAt?: number;
}

// ── Scheduler status (read-only system snapshot) ──

export interface SchedulerStatusDocument {
  status: string;
  interval?: number;
  sourceCount?: number;
  nextRun?: string;
  lastRun?: string;
  logLevel?: string;
  database?: string;
  server?: string;
  uptime?: string;
  rssScheduler?: string;
}

// ── Knowledge base (~/YiKnowledge markdown tree) ──

/** Parsed YAML frontmatter from a knowledge markdown file. */
export interface KnowledgeMeta {
  title?: string;
  tags?: string[];
  category?: string;
  created?: string;
  updated?: string;
  source?: string;
  type?: string;
  status?: string;
  aliases?: string[];
  roles?: string[];
  /** Lifecycle stage — active / draft / deprecated / archived. */
  lifecycle?: string;
  /** Review cadence — quarterly / half-yearly / yearly. */
  review_cycle?: string;
  /** Tacit knowledge — boolean flag (true = hard to write down) or a string statement capturing the tacit essence. */
  tacit?: boolean | string;
  benefit?: string;
  acceptance_criteria?: string[];
  /** Relative paths to related knowledge entries. */
  related?: string[];
  [key: string]: unknown;
}

/** One markdown entry returned by /knowledge-scan. */
export interface KnowledgeFileEntry {
  /** Relative path under the knowledge base dir, e.g. "ai-engineer/methodology/foo.md" */
  path: string;
  /** File name (last path segment). */
  name: string;
  /** Top-level YiKnowledge category: one of the 20 role directories (engineer / ai-engineer / ...) or `brd` / `static` / `__root__`. */
  category: string;
  meta: KnowledgeMeta;
  size: number;
  updatedAt: number | null;
}

export interface KnowledgeScanResponse {
  categories: { category: string; files: KnowledgeFileEntry[] }[];
}

export interface KnowledgeFilesResponse {
  files: KnowledgeFileEntry[];
  total: number;
}

export interface KnowledgeReadResponse {
  path: string;
  name: string;
  category: string;
  meta: KnowledgeMeta;
  content: string;
}

/** One story.md entry returned by /knowledge-stories. */
export interface KnowledgeStoryEntry {
  path: string;
  name: string;
  category: string;
  meta: KnowledgeMeta;
  size: number;
  updatedAt: number | null;
  /** Project name (YiAi / YiPet / YiVad / …) */
  project: string;
  /** Semantic story directory name (e.g. "ai-chat-function"). */
  storyName: string;
}

/** File tree node used by aiChat and knowledge tree sidebar views. */
export interface FileNode {
  key: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  session?: SessionDocument;
  size?: number;
  updatedAt?: number;
}

export interface KnowledgeStoriesResponse {
  stories: KnowledgeStoryEntry[];
}

// ── Dashboard health ──

export interface DashboardServerStatus {
  running: boolean;
  version: string;
  uptime_seconds: number;
}

export interface DashboardMongoStatus {
  connected: boolean;
  database: string;
}

export interface DashboardSchedulerStatus {
  enabled: boolean;
  type: string;
  interval: number | null;
  cron: Record<string, any> | null;
}

export interface DashboardWatcherStatus {
  running: boolean;
}

export interface DashboardOllamaStatus {
  connected: boolean;
  model_count: number;
  url: string;
}

export interface DashboardObserverStatus {
  throttle_enabled: boolean;
  sampler_enabled: boolean;
  sandbox_enabled: boolean;
  guard_enabled: boolean;
}

export interface DashboardCollectionCounts {
  menus: number;
  users: number;
  roles: number;
  departments: number;
  sessions: number;
  knowledge_files: number;
  rss_sources: number;
}

export interface DashboardHealthData {
  server: DashboardServerStatus;
  mongodb: DashboardMongoStatus;
  scheduler: DashboardSchedulerStatus;
  knowledge_watcher: DashboardWatcherStatus;
  ollama: DashboardOllamaStatus;
  observer: DashboardObserverStatus;
  collections: DashboardCollectionCounts;
}

// ── Dashboard RSS stats ──

export interface RssSourceStats {
  name: string;
  count: number;
}

export interface RssCategoryStats {
  name: string;
  count: number;
}

export interface RssTimelineItem {
  month: string;
  count: number;
}

export interface RssRecentArticle {
  title: string;
  source_name: string;
  author: string;
  published: string;
  category_path: string;
  link: string;
}

export interface RssStatsData {
  total: number;
  sources: RssSourceStats[];
  categories: RssCategoryStats[];
  timeline: RssTimelineItem[];
  recent: RssRecentArticle[];
}

// ── Dashboard knowledge stats ──

export interface KnowledgeCategoryStats {
  name: string;
  count: number;
}

export interface KnowledgeStatusStats {
  name: string;
  count: number;
}

export interface KnowledgeLifecycleStats {
  name: string;
  count: number;
}

export interface KnowledgeTypeStats {
  name: string;
  count: number;
}

export interface KnowledgeReviewCycleStats {
  name: string;
  count: number;
}

export interface KnowledgeHealthSummary {
  tacit_count: number;
  stale_count: number;
  no_review_cycle_count: number;
  review_coverage_pct: number;
}

export interface KnowledgeFileSummary {
  path: string;
  title: string;
  category: string;
  module: string;
  sub_module: string;
  size: number;
  status: string;
  lifecycle: string;
  type: string;
  review_cycle: string;
  updated: string;
  tacit: boolean;
  roles: string[];
  tags: string[];
  benefit: string;
  related_count: number;
  related: string[];
}

export interface KnowledgeRecentFile {
  title: string;
  path: string;
  status: string;
  lifecycle: string;
  review_cycle: string;
  updated: string;
}

export interface KnowledgeModuleStats {
  category: string;
  name: string;
  count: number;
  statuses: KnowledgeStatusStats[];
  types: KnowledgeTypeStats[];
  lifecycles: KnowledgeLifecycleStats[];
  roles: KnowledgeRoleStats[];
  stale_count: number;
  tacit_count: number;
  review_coverage_pct: number;
  sub_modules: KnowledgeSubModuleStats[];
}

export interface KnowledgeSubModuleStats {
  name: string;
  count: number;
  statuses: KnowledgeStatusStats[];
  types: KnowledgeTypeStats[];
  lifecycles: KnowledgeLifecycleStats[];
  stale_count: number;
  tacit_count: number;
  review_coverage_pct: number;
}

export interface KnowledgeRoleStats {
  name: string;
  count: number;
}

export interface KnowledgeStatsData {
  total: number;
  categories: KnowledgeCategoryStats[];
  statuses: KnowledgeStatusStats[];
  lifecycles: KnowledgeLifecycleStats[];
  types: KnowledgeTypeStats[];
  review_cycles: KnowledgeReviewCycleStats[];
  roles: KnowledgeRoleStats[];
  health: KnowledgeHealthSummary;
  files: KnowledgeFileSummary[];
  recent: KnowledgeRecentFile[];
  modules: KnowledgeModuleStats[];
}

// ── Dashboard RSS source health ──

export interface RssSourceInfo {
  name: string;
  url: string;
  enabled: boolean;
  article_count: number;
  last_fetch: string;
}

export interface RssSourceHealthData {
  total_sources: number;
  enabled_count: number;
  disabled_count: number;
  total_articles: number;
  sources: RssSourceInfo[];
}

// ── Dashboard organization ──

export interface OrgDepartmentInfo {
  name: string;
  id: string;
  user_count: number;
}

export interface OrgRoleInfo {
  name: string;
  id: string;
  parent: string;
}

export interface OrgUserStats {
  total: number;
  active: number;
  inactive: number;
  by_department: OrgDepartmentInfo[];
  by_gender: Record<string, number>;
}

export interface OrgStatsData {
  users: OrgUserStats;
  roles: OrgRoleInfo[];
  departments: OrgDepartmentInfo[];
}

// ── Dashboard AI chat stats ──

export interface AiModelUsage {
  model: string;
  count: number;
}

export interface AiDailyStats {
  date: string;
  sessions: number;
  messages: number;
}

export interface AiRecentSession {
  title: string;
  key: string;
  message_count: number;
  updated: string;
}

export interface AiStatsData {
  total_sessions: number;
  total_messages: number;
  avg_messages_per_session: number;
  active_sessions_today: number;
  messages_today: number;
  model_usage: AiModelUsage[];
  daily: AiDailyStats[];
  recent: AiRecentSession[];
}

// ── Dashboard service performance stats ──

export interface ServiceCallStats {
  service: string;
  method: string;
  calls: number;
  success: number;
  failed: number;
  avg_duration_ms: number;
  max_duration_ms: number;
  min_duration_ms: number;
}

export interface RecentServiceCall {
  service: string;
  method: string;
  status: string;
  duration_ms: number;
  input_summary: string;
  timestamp: string;
}

export interface ServiceStatsData {
  total_calls: number;
  success_rate: number;
  avg_duration_ms: number;
  total_success: number;
  total_failed: number;
  by_service: ServiceCallStats[];
  recent: RecentServiceCall[];
}

// ── Dashboard RAG stats ──

export interface RagConfigInfo {
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

export interface RagQueryHistory {
  id: string;
  question: string;
  scope: string;
  result_count: number;
  top_score: number;
  latency_ms: number;
  timestamp: string;
}

export interface RagStatsData {
  built: boolean;
  num_docs: number;
  last_built_at: string;
  persist_dir: string;
  persist_dir_size: number;
  config: RagConfigInfo;
  recent_queries: RagQueryHistory[];
}

// ── Dashboard performance ──

export interface DiskUsage {
  path: string;
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent: number;
}

export interface MemoryInfo {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent: number;
}

export interface ProcessInfo {
  pid: number;
  memory_mb: number;
  cpu_percent: number;
  threads: number;
}

export interface PerformanceData {
  disk: DiskUsage;
  memory: MemoryInfo;
  process: ProcessInfo;
}

