/**
 * API request/response type definitions — single source of truth for all API shapes.
 *
 * Layer 3: consumed by service modules and callers for compile-time safety.
 */

// ── Auth ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface UserProfile {
  username: string;
  roles: string[];
  permissions: string[];
}

// ── Sessions ──────────────────────────────────────────────────────────

export interface SessionRecord {
  id: string;
  title: string;
  created_at: string;   // ISO 8601 UTC
  updated_at: string;   // ISO 8601 UTC
  favorite: boolean;
  tags: string[];
  message_count?: number;
}

export interface SessionCreateRequest {
  title?: string;
  tags?: string[];
}

export interface SessionUpdateRequest {
  title?: string;
  favorite?: boolean;
  tags?: string[];
}

export interface SessionSearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SessionListResponse {
  sessions: SessionRecord[];
  total: number;
}

// ── Chat / Prompt ─────────────────────────────────────────────────────

export interface PromptRequest {
  prompt: string;
  session_id?: string;
  model?: string;
  stream?: boolean;
  options?: Record<string, unknown>;
}

export interface PromptResponse {
  id: string;
  response: string;
  session_id: string;
  model: string;
  tokens?: { prompt: number; completion: number };
}

export interface StreamChunk {
  token?: string;
  done?: boolean;
  error?: string;
}

// ── FAQ ───────────────────────────────────────────────────────────────

export interface FAQRecord {
  id: string;
  question: string;
  answer: string;
  order: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQCreateRequest {
  question: string;
  answer: string;
  category?: string;
}

export interface FAQUpdateRequest {
  question?: string;
  answer?: string;
  category?: string;
}

export interface FAQBatchUpdateRequest {
  faqs: { id: string; order?: number }[];
}

export interface FAQReorderRequest {
  ids: string[];
}

// ── Config ────────────────────────────────────────────────────────────

export interface AppConfigRecord {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface ConfigUpdateRequest {
  updates: Record<string, unknown>;
}

// ── Database ──────────────────────────────────────────────────────────

export interface DatabaseQueryRequest {
  collection: string;
  query?: Record<string, unknown>;
  projection?: Record<string, number>;
  sort?: Record<string, number>;
  limit?: number;
  skip?: number;
}

export interface DatabaseWriteRequest {
  collection: string;
  document: Record<string, unknown>;
}

export interface DatabaseUpdateRequest {
  collection: string;
  filter: Record<string, unknown>;
  update: Record<string, unknown>;
  upsert?: boolean;
}

export interface DatabaseDeleteRequest {
  collection: string;
  filter: Record<string, unknown>;
}

export interface DatabaseBatchRequest {
  operations: {
    method: 'insert' | 'update' | 'delete';
    collection: string;
    filter?: Record<string, unknown>;
    document?: Record<string, unknown>;
    update?: Record<string, unknown>;
  }[];
}

export interface DatabaseResponse {
  ok: boolean;
  result?: unknown;
  count?: number;
}

// ── Generic Wrappers ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface ErrorResponse {
  detail: string;
  code?: string;
}
