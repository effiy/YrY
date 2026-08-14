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
  /** User prompt text. */
  user: string;
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

export interface SessionRecord {
  key: string;
  url?: string;
  title?: string;
  pageDescription?: string;
  pageContent?: string;
  messages?: ChatMessage[];
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  lastAccessTime?: number;
  isFavorite?: boolean;
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

// ── Knowledge base (YiKnowledge markdown tree) ─────────────────────────

/** A node in the scanned knowledge tree (file or folder). */
export interface KnowledgeTreeNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  children?: KnowledgeTreeNode[];
  size?: number;
  updated_at?: string;
}

export interface KnowledgeScanResponse {
  tree: KnowledgeTreeNode[];
  total_files: number;
  category?: string;
}

/** Parsed YAML frontmatter from a knowledge markdown file. */
export interface KnowledgeFrontmatter {
  [key: string]: unknown;
}

export interface KnowledgeReadResponse {
  path: string;
  content: string;
  frontmatter?: KnowledgeFrontmatter;
  category?: string;
}

export interface KnowledgeStory {
  project: string;
  name: string;
  path: string;
  title?: string;
}

export interface KnowledgeStoriesResponse {
  stories: KnowledgeStory[];
  total: number;
}

export interface KnowledgeSyncResponse {
  synced: number;
  deleted: number;
  rag?: { status?: string; error?: string; [key: string]: unknown };
}

export interface KnowledgeWriteResponse {
  path: string;
}

// ── RAG (llama_index over YiKnowledge) ─────────────────────────────────

export interface RagSource {
  path: string;
  score?: number;
  snippet?: string;
  metadata?: Record<string, unknown>;
}

export interface RagQueryResponse {
  sources: RagSource[];
  question?: string;
}

export interface RagStatusResponse {
  built: boolean;
  num_docs?: number;
  last_built_at?: string;
  [key: string]: unknown;
}

export interface RagBuildResponse {
  started: boolean;
  status?: string;
  [key: string]: unknown;
}

export interface RagCategory {
  name: string;
  file_count: number;
}

export interface RagCategoriesResponse {
  categories: RagCategory[];
  tags: Record<string, number>;
  total_files: number;
}

export interface RagChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RagChatPayload {
  messages: RagChatMessage[];
  scope?: string;
  top_k?: number;
  hybrid?: boolean;
  rerank?: boolean;
  citations?: boolean;
  num_queries?: number;
  chat_mode?: string;
  category?: string;
  tags?: string[];
}

export interface RagFileChatPayload {
  target_file: string;
  question: string;
}

export interface RagFileQueryResponse {
  sources: RagSource[];
  answer?: string;
}

/** A sub-question + its synthesized answer + sources (from rag.decompose). */
export interface RagSubQuestion {
  sub_q: string;
  answer: string;
  sources: RagSource[];
}

/** Response shape of POST /rag-decompose — SubQuestionQueryEngine output. */
export interface RagDecomposeResponse {
  original: string;
  synthesis: string;
  sub_questions: RagSubQuestion[];
  error?: string;
}

// ── Bug tracking (YiVad /bug page backend) ────────────────────────────

export type BugSeverity = 'critical' | 'major' | 'minor' | 'trivial';
export type BugPriority = 'p0' | 'p1' | 'p2' | 'p3';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected' | 'reopened';
export type BugType =
  | 'functional'
  | 'performance'
  | 'ui'
  | 'security'
  | 'compatibility'
  | 'regression'
  | 'data'
  | 'other';
export type BugFrequency = 'always' | 'sometimes' | 'rarely' | 'once' | 'unable';

/** Bug metadata — persisted in MongoDB `bugs` collection. Long-form fields
 *  live in the markdown body at `contentPath`. Mirrors YiVad's BugDocument. */
export interface BugDocument {
  key: string;
  title: string;
  project: string;
  module: string;
  iteration?: string;
  defectUrl?: string;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  type: BugType;
  frequency: BugFrequency;
  assignee: string;
  reporter: string;
  environment: string;
  affectedVersion: string;
  fixedVersion: string;
  tags: string[];
  dueDate: number | null;
  contentPath: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt: number | null;
  closedAt: number | null;
}

/** Bug long-form body — persisted as markdown, parsed back by section. */
export interface BugContent {
  description: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  causeProblem?: string;
  solution?: string;
}

// ── Agent (Pi-inspired multi-turn tool-calling loop) ─────────────────────

export type TodoItemStatus = 'pending' | 'in_progress' | 'completed';

/** A single todo item surfaced by the agent's `todo_write` capability. */
export interface TodoItem {
  id: string;
  content: string;
  status: TodoItemStatus;
}

/** Message role/content pair sent to `/agent/chat`. */
export interface AgentChatMessage {
  role: string;
  content: string;
}

/** Request body for `/agent/chat`. Mirrors YiAi's `AgentChatRequest`. */
export interface AgentChatPayload {
  messages: AgentChatMessage[];
  model?: string;
  system_prompt?: string;
  max_turns?: number;
  images?: string[];
  session_id?: string;
  model_rotation?: string[];
  model_fallback?: string[];
  resume?: boolean;
}

/** A structured event yielded by the agent SSE stream. */
export interface AgentStreamEvent {
  type: string;
  timestamp?: number;
  turn_index?: number;
  message?:
    | { role: string; content: string }
    | { from: string; to: string }
    | { todos: TodoItem[] };
  delta?: string;
  phase?: string;
  tool?: { name: string; label?: string; content?: string; error?: string };
  tool_results?: Array<{
    name: string;
    content?: string;
    error?: string;
    duration_ms?: number;
  }>;
  tool_name?: string;
  tool_args?: Record<string, unknown>;
  tool_call_id?: string;
  partial_result?: Record<string, unknown>;
  is_error?: boolean;
  confirmation_id?: string;
  question_id?: string;
  question?: string;
  options?: string[];
  error?: string;
  stop_reason?: string;
  before_count?: number;
  after_count?: number;
  saved_tokens?: number;
  usage?: Record<string, unknown>;
}

/** A server-side agent tool descriptor (from `/agent/tools`). */
export interface AgentToolDescriptor {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requires_confirmation: boolean;
  group: string;
}

/** A skill in the YiKnowledge skill suite (from `/agent/tools`). */
export interface AgentSkill {
  name: string;
  description: string;
  tags: string[];
  chip: string;
  category: string;
}

/** Response body for `/agent/tools`. */
export interface AgentToolsResponse {
  tools: AgentToolDescriptor[];
  skills: AgentSkill[];
}
