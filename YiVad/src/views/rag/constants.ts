/**
 * RAG System — shared constants, formatting utilities, and configuration.
 *
 * Eliminates duplication across dashboard, retrieval, chat, compare, and
 * history pages. All score formatting, text rendering, and category mappings
 * live here.
 */
import type { RagSource } from "@/api/interface/rag";

// ── Score formatting ────────────────────────────────────────────────────────

/** 0-1 score → 0-100 integer percentage. */
export function scorePercent(score: number | undefined | null): number {
  if (score == null || isNaN(score)) return 0;
  return Math.round(score * 100);
}

/** 0-1 score → display string e.g. "87.3%". */
export function scoreLabel(score: number | undefined | null): string {
  if (score == null || isNaN(score)) return "—";
  return (score * 100).toFixed(1) + "%";
}

/** Relevance colour: green ≥ 0.7, amber ≥ 0.4, red otherwise. */
export function scoreColor(score: number | undefined | null): string {
  if (score == null || isNaN(score)) return "#909399";
  if (score >= 0.7) return "#67c23a";
  if (score >= 0.4) return "#e6a23c";
  return "#f56c6c";
}

/** Element Plus tag type for a relevance score. */
export function scoreTagType(score: number | undefined | null): "" | "success" | "warning" | "danger" {
  if (score == null || isNaN(score)) return "";
  if (score >= 0.7) return "success";
  if (score >= 0.4) return "warning";
  return "danger";
}

/** Best score across an array of sources. */
export function bestScore(sources: RagSource[] | undefined): number {
  if (!sources?.length) return 0;
  return Math.max(...sources.map((s) => s.score ?? 0));
}

/** Average score across an array of sources. */
export function avgScore(sources: RagSource[] | undefined): number {
  if (!sources?.length) return 0;
  return sources.reduce((a, s) => a + (s.score ?? 0), 0) / sources.length;
}

// ── Text formatting ─────────────────────────────────────────────────────────

/** Truncate text to maxLen characters, appending "…" when cut. */
export function truncateText(text: string | undefined | null, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

/** Timestamp (number or ISO string) → locale string. */
export function formatTimestamp(ts: number | string | undefined | null): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

/** Render answer text with inline citation highlighting and HTML escaping. */
export function renderAnswer(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\[(\d+)\]/g, '<span class="citation">[$1]</span>')
    .replace(/\n/g, "<br>");
}

/** Strip "[Source N]" prefixes from chunk text for preview. */
export function stripSourcePrefix(text: string): string {
  return (text || "").replace(/^\[Source \d+\]\s*/gm, "");
}

// ── Category display ────────────────────────────────────────────────────────

export function categoryTagType(cat: string | undefined): string {
  if (!cat) return "";
  const top = cat.split("/")[0];
  const map: Record<string, string> = {
    methodology: "",
    tech: "success",
    work: "warning",
    projects: "primary",
    resources: "info",
    industry: "danger",
  };
  return map[top] || "";
}

// ── Knowledge-base linking ──────────────────────────────────────────────────

export function kbDetailLink(filePath: string): string {
  return `/knowledge/detail?path=${encodeURIComponent(filePath)}`;
}

// ── Example prompts (chat welcome screen) ───────────────────────────────────

export const CHAT_EXAMPLE_PROMPTS = [
  "What are the RAG design patterns for chunking?",
  "How does the YiVad ProTable component work?",
  "Explain the dual-write file persistence model",
  "What are the best practices for hybrid retrieval?",
];

// ── Index info defaults ─────────────────────────────────────────────────────

export const INDEX_INFO_DEFAULTS = {
  embed_model: "nomic-embed-text",
  llm_model: "qwen2.5",
  chunk_size: 500,
  chunk_overlap: 50,
  hybrid_retrieval: true,
  rerank_enabled: false,
  inline_citations: true,
};
