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
  tags?: string[];
  search?: string;
  limit?: number;
  pageNum?: number;
  pageSize?: number;
  orderBy?: string;
  orderType?: "asc" | "desc";
}

// ── Session documents ──

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

export interface ChatMessage {
  type: "user" | "pet";
  message: string;
  content?: string;
  timestamp: number;
  imageDataUrl?: string;
  imageDataUrls?: string[];
  error?: boolean;
  aborted?: boolean;
}

// ── FAQ documents ──

export interface FaqDocument {
  key: string;
  title: string;
  content: string;
  tags: string[];
  order?: number;
  createdAt?: number;
  updatedAt?: number;
}

// ── File operations ──

export interface WriteFilePayload {
  target_file?: string;
  path?: string;
  content: string;
  is_base64?: boolean;
}

export interface ReadFilePayload {
  path: string;
}

export interface ReadFileResponse {
  content: string;
  path: string;
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

// ── Goal documents ──

export interface GoalDocument {
  key: string;
  title: string;
  description?: string;
  status?: string;
  progress?: number;
  year?: number;
  quarter?: number;
  month?: number;
  week?: number;
  day?: number;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
}
