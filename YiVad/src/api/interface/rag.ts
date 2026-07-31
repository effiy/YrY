/**
 * RAG (llama_index) types — request/response shapes for the YiAi rag routes.
 */
export interface RagSource {
  file_path: string;
  score: number;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface RagQueryResponse {
  sources: RagSource[];
}

export interface RagStatusResponse {
  built: boolean;
  num_docs: number;
  last_built_at?: string;
  persist_dir?: string;
  error?: string;
}

export interface RagBuildResponse extends RagStatusResponse {}

export interface RagChatPayload {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  scope?: string;
}

export interface RagFileChatPayload {
  target_file: string;
  question: string;
}

export interface RagStreamHandlers {
  onChunk: (text: string) => void;
  onSources: (sources: RagSource[]) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}
