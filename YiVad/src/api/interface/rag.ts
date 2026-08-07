/**
 * RAG (llama_index) types — request/response shapes for the YiAi rag routes.
 *
 * Organised by domain:
 *   - Source & chunk shapes     → what the retriever returns
 *   - Query / response shapes   → one-shot retrieval
 *   - Chat shapes               → streaming RAG chat
 *   - Index management          → status, build, document info
 *   - History & analytics       → query history, metrics
 *   - Stream handlers           → SSE callbacks
 */

// ─── Source & chunk shapes ────────────────────────────────────────────

/** A single retrieved chunk with relevance metadata. */
export interface RagSource {
  /** Relative path to the source markdown file in YiKnowledge. */
  file_path: string;
  /** Cosine similarity score (0–1). Higher = more relevant. */
  score: number;
  /** Retrieved chunk text (may include [Source N] prefix when citations are enabled). */
  text: string;
  /** Frontmatter-derived metadata (category, tags, source, type, status, …). */
  metadata?: RagSourceMetadata;
}

/** Known frontmatter keys extracted by the llama_index indexer. */
export interface RagSourceMetadata {
  category?: string;
  tags?: string | string[];
  type?: string;
  status?: string;
  source?: string;
  title?: string;
  created?: string;
  updated?: string;
  /** Character count of the chunk text. */
  char_count?: number;
  /** Token count estimate (≈ chars / 4). */
  token_estimate?: number;
  [key: string]: unknown;
}

// ─── Query / response shapes ──────────────────────────────────────────

export interface RagQueryRequest {
  question: string;
  /** Number of chunks to retrieve (default 4). */
  top_k?: number;
  /** Substring filter on file_path metadata (e.g. "engineer/projects/yivad"). */
  scope?: string;
  /** Per-call override of settings.rag_hybrid_retrieval_enabled. */
  hybrid?: boolean;
  /** Per-call override of settings.rag_rerank_enabled. */
  rerank?: boolean;
  /** Per-call override of settings.rag_inline_citations_enabled. */
  citations?: boolean;
  /** QueryFusionRetriever LLM query-variant count (1 = no expansion). */
  num_queries?: number;
  /** MetadataFilter on frontmatter 'category' (TEXT_MATCH). Disables hybrid. */
  category?: string;
  /** MetadataFilter on frontmatter 'tags' (TEXT_MATCH each, AND-combined). */
  tags?: string[];
}

export interface RagQueryResponse {
  sources: RagSource[];
}

// ─── Chat shapes ──────────────────────────────────────────────────────

export interface RagChatPayload {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  scope?: string;
  /** Per-call override of settings.rag_top_k. */
  top_k?: number;
  /** Per-call override of settings.rag_hybrid_retrieval_enabled. */
  hybrid?: boolean;
  /** Per-call override of settings.rag_rerank_enabled. */
  rerank?: boolean;
  /** Per-call override of settings.rag_inline_citations_enabled. */
  citations?: boolean;
  /** Per-call override of QueryFusionRetriever LLM query-variant count. */
  num_queries?: number;
  /** Per-call override of the llama_index chat engine mode. */
  chat_mode?: "condense_plus_context" | "condense_question" | "context" | "simple";
  /** MetadataFilter on frontmatter 'category' (TEXT_MATCH). Disables hybrid. */
  category?: string;
  /** MetadataFilter on frontmatter 'tags' (TEXT_MATCH each, AND-combined). Disables hybrid. */
  tags?: string[];
}

export interface RagFileChatPayload {
  target_file: string;
  question: string;
}

// ─── Index management ─────────────────────────────────────────────────

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

/** Extended index information surfaced on the dashboard. */
export interface RagIndexInfo extends RagStatusResponse {
  /** Embedding model name (e.g. nomic-embed-text). */
  embed_model?: string;
  /** LLM model used for chat (e.g. qwen2.5). */
  llm_model?: string;
  /** Chunk size in tokens. */
  chunk_size?: number;
  /** Chunk overlap in tokens. */
  chunk_overlap?: number;
  /** Whether hybrid retrieval (vector + BM25) is enabled. */
  hybrid_retrieval?: boolean;
  /** Whether cross-encoder rerank is enabled. */
  rerank_enabled?: boolean;
  /** Whether inline [Source N] citations are enabled. */
  inline_citations?: boolean;
  /** Size of the persist directory on disk (bytes). */
  persist_dir_size?: number;
}

export interface RagBuildResponse extends RagStatusResponse {}

// ─── History & analytics ──────────────────────────────────────────────

/** A single retrieval query record (in-memory, max 20). */
export interface RagQueryRecord {
  /** Unique id (timestamp-based). */
  id: string;
  /** The user's question. */
  question: string;
  /** Scope filter applied (empty = full KB). */
  scope: string;
  /** Number of chunks requested. */
  top_k: number;
  /** Actual number of sources returned. */
  result_count: number;
  /** Best relevance score among results. */
  top_score: number;
  /** Average relevance score. */
  avg_score: number;
  /** Sources returned by the retriever. */
  sources: RagSource[];
  /** ISO-8601 timestamp of the query. */
  timestamp: string;
  /** Round-trip latency in milliseconds. */
  latency_ms: number;
  /** Retrieval config used for this query — surfaces which knobs
   *  produced the recorded scores/latency so the user can compare
   *  across configs in the History tab. */
  config?: {
    hybrid: boolean;
    rerank: boolean;
    citations: boolean;
    num_queries: number;
    category: string;
    tags: string[];
  };
}

/** A turn in the RAG chat conversation. */
export interface RagChatTurn {
  role: "user" | "assistant";
  content: string;
  sources?: RagSource[];
  /** ISO-8601 timestamp. */
  timestamp: string;
}

/** A recorded RAG chat turn (in-memory, max 20 on the backend ring buffer).
 *  Mirrors RagQueryRecord but for chat: includes the streamed answer text,
 *  the chat engine mode used, and the retrieval config that produced it. */
export interface RagChatTurnRecord {
  /** Unique id (timestamp-based). */
  id: string;
  /** The user's question (last user message). */
  question: string;
  /** Full streamed assistant answer. */
  answer: string;
  /** Scope filter applied (empty = full KB). */
  scope: string;
  /** llama_index chat engine mode used for this turn. */
  chat_mode: "condense_plus_context" | "condense_question" | "context" | "simple";
  /** Round-trip latency in milliseconds (stream_chat start → last token). */
  latency_ms: number;
  /** Number of sources returned by the chat engine. */
  source_count: number;
  /** Best relevance score among sources. */
  top_score: number;
  /** Average relevance score. */
  avg_score: number;
  /** Sources returned by the chat engine. */
  sources: RagSource[];
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Retrieval config used — mirrors RagQueryRecord.config. */
  config?: {
    hybrid: boolean;
    rerank: boolean;
    citations: boolean;
    num_queries: number;
    category: string;
    tags: string[];
  };
}

/** Lightweight summary of a chat session for history listing. */
export interface RagChatSessionSummary {
  id: string;
  /** First user question (used as session title). */
  title: string;
  /** Number of turns. */
  turns: number;
  /** Timestamps. */
  created_at: string;
  updated_at: string;
}

// ─── Sub-question decomposition ──────────────────────────────────────

/** A single sub-question produced by SubQuestionQueryEngine. */
export interface RagSubQuestion {
  /** The sub-question text the engine generated. */
  sub_q: string;
  /** The synthesized answer for this sub-question. */
  answer: string;
  /** Sources retrieved for this sub-question. */
  sources: RagSource[];
}

/** Response shape of POST /rag-decompose. */
export interface RagDecomposeResponse {
  /** The original user question. */
  original: string;
  /** Final synthesized answer combining all sub-answers. */
  synthesis: string;
  /** Each sub-question with its own answer + sources. */
  sub_questions: RagSubQuestion[];
  /** Set when the backend caught an error mid-decomposition. */
  error?: string;
}

// ─── Stream handlers ──────────────────────────────────────────────────

export interface RagStreamHandlers {
  onChunk: (text: string) => void;
  onSources: (sources: RagSource[]) => void;
  /** Backend emits `{"data":{"phase":"retrieving"}}` before retrieval
   *  starts so the UI can refine "thinking" into "retrieving". */
  onPhase?: (phase: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}
