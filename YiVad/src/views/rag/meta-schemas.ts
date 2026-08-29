/**
 * RAG System — declarative table column and display config definitions.
 *
 * Follows the same meta-schema pattern as BRD/code-review: each table/view
 * gets a column definition array consumed by the page components, with
 * render hints for score bars, tags, and custom formatting.
 */

// ── Shared score threshold config ───────────────────────────────────────────

export const SCORE_THRESHOLDS = {
  high: 0.7,
  medium: 0.4,
} as const;

export const SCORE_COLORS = {
  high: "#67c23a",
  medium: "#e6a23c",
  low: "#f56c6c",
  muted: "#909399",
} as const;

// ── Index info fields (dashboard cards) ─────────────────────────────────────

export interface IndexInfoField {
  key: string;
  label: string;
  /** Display type hint. */
  format?: "tag" | "text" | "boolean-tag";
  /** For "tag" format, provide value→{label,type} mapping. */
  tagMap?: Record<string, { label: string; type: string }>;
}

export const INDEX_INFO_FIELDS: IndexInfoField[] = [
  {
    key: "embed_model",
    label: "Embedding Model",
    format: "tag",
    tagMap: { "nomic-embed-text": { label: "nomic-embed-text", type: "info" } },
  },
  {
    key: "llm_model",
    label: "Chat LLM",
    format: "tag",
    tagMap: { "qwen2.5": { label: "qwen2.5", type: "info" } },
  },
  { key: "chunk_size", label: "Chunk Size" },
  { key: "chunk_overlap", label: "Overlap" },
  {
    key: "hybrid_retrieval",
    label: "Hybrid Retrieval",
    format: "boolean-tag",
    tagMap: {
      true: { label: "Vector + BM25", type: "success" },
      false: { label: "Vector only", type: "info" },
    },
  },
  {
    key: "rerank_enabled",
    label: "Cross-Encoder Rerank",
    format: "boolean-tag",
    tagMap: {
      true: { label: "Enabled", type: "success" },
      false: { label: "Disabled", type: "info" },
    },
  },
  {
    key: "inline_citations",
    label: "Inline Citations",
    format: "boolean-tag",
    tagMap: {
      true: { label: "[Source N]", type: "success" },
      false: { label: "Off", type: "info" },
    },
  },
];

// ── Retrieval results table ─────────────────────────────────────────────────

export interface RetrievalColumn {
  prop: string;
  label: string;
  width?: number;
  minWidth?: number;
  align?: string;
  sortable?: boolean | string;
  fixed?: string | boolean;
  /** Render type: "index" | "score" | "file" | "tag-category" | "tag-type" | "text" | "preview" | "number" | "action". */
  render?: string;
}

export const RETRIEVAL_COLUMNS: RetrievalColumn[] = [
  { prop: "#", label: "#", width: 50, align: "center", render: "index" },
  { prop: "score", label: "Relevance", width: 140, align: "center", sortable: "score", render: "score" },
  { prop: "file_path", label: "Document", minWidth: 200, sortable: true, render: "file" },
  { prop: "metadata.category", label: "Category", width: 130, align: "center", render: "tag-category" },
  { prop: "metadata.type", label: "Type", width: 90, align: "center", render: "tag-type" },
  { prop: "text", label: "Chunk Preview", minWidth: 280, render: "preview" },
  { prop: "metadata.char_count", label: "Chars", width: 70, align: "center", sortable: "metadata.char_count", render: "number" },
  { prop: "actions", label: "Actions", width: 100, align: "center", fixed: "right", render: "action" },
];

// ── History table ───────────────────────────────────────────────────────────

export const HISTORY_COLUMNS: RetrievalColumn[] = [
  { prop: "timestamp", label: "Time", width: 170, align: "center", sortable: "timestamp", render: "text" },
  { prop: "question", label: "Question", minWidth: 220, sortable: true, render: "text" },
  { prop: "scope", label: "Scope", width: 150, align: "center", render: "tag-category" },
  { prop: "topK", label: "Top-K", width: 70, align: "center", sortable: "topK", render: "number" },
  { prop: "resultCount", label: "Results", width: 80, align: "center", sortable: "resultCount", render: "number" },
  { prop: "topScore", label: "Top Score", width: 110, align: "center", sortable: "topScore", render: "score" },
  { prop: "avgScore", label: "Avg Score", width: 120, align: "center", render: "text" },
  { prop: "actions", label: "Actions", width: 140, align: "center", fixed: "right", render: "action" },
];

// ── Dashboard stat cards ────────────────────────────────────────────────────

export interface DashboardStat {
  key: string;
  label: string;
  /** "number" | "score" | "text" */
  format: "number" | "score" | "text";
}

export const HISTORY_STATS: DashboardStat[] = [
  { key: "totalQueries", label: "Total Queries", format: "number" },
  { key: "uniqueScopes", label: "Unique Scopes", format: "number" },
  { key: "avgBestScore", label: "Avg Best Score", format: "score" },
  { key: "totalSources", label: "Total Sources Retrieved", format: "number" },
];
