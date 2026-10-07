import type { RagSource } from "@/api/interface/rag";
import type { WebSearchResult, WebImageResult } from "@/api/modules/searchService";

/** Claude-derived tag kinds — derived from a session's file_path segments */
export type TagKind = "skills" | "templates" | "rules" | "agents";

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
  timestamp: number;
  imageDataUrls?: string[];
  error?: boolean;
  aborted?: boolean;
  /** RAG citations — set by streamRagChat/streamRagFileChat when ragEnabled. */
  sources?: RagSource[];
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
    filePaths?: string[];
    hyde?: boolean;
    webSearch?: boolean;
  };
  /** Time-to-first-token latency in ms — measured from stream start to the
   *  arrival of the first content chunk. Proxy for retrieval + condense
   *  + synthesis latency in RAG turns (backend doesn't emit this frame
   *  yet; the store snapshots it client-side). */
  firstTokenLatencyMs?: number;
  /** Web search context injected alongside this user message. */
  searchContext?: string;
  /** Web search results for this specific turn — displayed alongside the message. */
  searchResults?: WebSearchResult[];
  /** Web search image results — parallel-fetched by backend, displayed as thumbnails. */
  searchImages?: WebImageResult[];
  /** True when this message's response used web search grounding. */
  searchGrounded?: boolean;
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

export interface ChatPayload {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  system?: string;
  temperature?: number;
  images?: string[];
}

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