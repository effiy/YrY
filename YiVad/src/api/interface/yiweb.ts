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
  type: "user" | "pet";
  message: string;
  content?: string;
  timestamp: number;
  imageDataUrls?: string[];
  error?: boolean;
  aborted?: boolean;
  /** RAG citations — set by streamRagChat/streamRagFileChat when ragEnabled. */
  sources?: import("@/api/interface/rag").RagSource[];
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
  /** Primary prompt text (YiWeb aicr field) */
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
  source?: string;
  type?: string;
  [key: string]: unknown;
}

/** One markdown entry returned by /knowledge-scan. */
export interface KnowledgeFileEntry {
  /** Relative path under the knowledge base dir, e.g. "tech/ai-platform/foo.md" */
  path: string;
  /** File name (last path segment). */
  name: string;
  /** Top-level YiKnowledge category: industry / lessons / methodology / people / product / projects / resources / tech / work / __root__ */
  category: string;
  meta: KnowledgeMeta;
  size: number;
  updatedAt: number | null;
}

export interface KnowledgeScanResponse {
  categories: { category: string; files: KnowledgeFileEntry[] }[];
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

export interface KnowledgeStoriesResponse {
  stories: KnowledgeStoryEntry[];
}

