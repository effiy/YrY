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
  /** MongoDB query filter. */
  query?: Record<string, unknown>;
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
  key?: string;
  /** Alternative: file_path query (for sessions collection). */
  file_path?: string;
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
}

export interface ChatMessage {
  type: 'user' | 'pet';
  content?: string;
  message?: string;
  timestamp?: number;
  imageDataUrl?: string;
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
