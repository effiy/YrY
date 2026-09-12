/**
 * RAG shared utility functions — score display, latency classification,
 * freshness helpers, metadata accessors, and export formatting.
 * Pure functions with no reactive state — imported by all LlamaIndexPanel sub-components.
 */

// ── Score display ──

/** Cosine score → percentage string (e.g. 0.82 → "82%"). */
export function scorePct(s: number): string {
  return `${(s * 100).toFixed(0)}%`;
}

/** Semantic colour for a cosine similarity score (green ≥0.7, amber ≥0.4, grey otherwise). */
export function scoreColor(s: number): string {
  if (s >= 0.7) return "var(--el-color-success)";
  if (s >= 0.4) return "var(--el-color-warning)";
  return "var(--el-text-color-secondary)";
}

/** CSS class tier for score-driven styling. */
export function scoreLvl(s: number): string {
  return s >= 0.7 ? "high" : s >= 0.4 ? "mid" : "low";
}

/** Score → width percentage for histogram bars (e.g. 0.82 → "82%"). */
export function scoreW(s: number): string {
  return `${Math.round(s * 100)}%`;
}

// ── Latency ──

/** Absolute latency bucket with colour and label.
 *  Thresholds: fast <300ms, ok <1.5s, slow <5s, very slow otherwise. */
export function latencyBucket(ms: number): { color: string; label: string } {
  if (ms <= 0) return { color: "var(--el-text-color-placeholder)", label: "—" };
  if (ms < 300) return { color: "var(--el-color-success)", label: "fast" };
  if (ms < 1500) return { color: "var(--el-color-primary)", label: "ok" };
  if (ms < 5000) return { color: "var(--el-color-warning)", label: "slow" };
  return { color: "var(--el-color-danger)", label: "very slow" };
}

// ── Freshness ──

/** Index-build freshness bucket from an ISO timestamp.
 *  fresh <1h, recent <24h, stale <7d, very stale otherwise. */
export function indexFreshness(iso?: string): { color: string; label: string; age: string } | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const ms = Date.now() - t;
  if (ms < 0) return { color: "var(--el-color-success)", label: "fresh", age: "just now" };
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  const age = days > 0 ? `${days}d ago` : hrs > 0 ? `${hrs}h ago` : `${mins}m ago`;
  if (ms < 3600000) return { color: "var(--el-color-success)", label: "fresh", age };
  if (ms < 86400000) return { color: "var(--el-color-primary)", label: "recent", age };
  if (ms < 7 * 86400000) return { color: "var(--el-color-warning)", label: "stale", age };
  return { color: "var(--el-color-danger)", label: "very stale", age };
}

// ── Bytes ──

/** Human-readable byte size (KB/MB/GB with 1 decimal). */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ── Text ──

/** Truncate to max chars with ellipsis. */
export function snippet(text: string, max = 140): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// ── Metadata accessors (llama_index frontmatter) ──

import type { RagSource } from "@/api/interface/rag";

/** Tags array from source metadata — normalises string-tag stored as comma/semicolon. */
export function tagsArray(meta: RagSource["metadata"] | undefined): string[] {
  if (!meta?.tags) return [];
  if (Array.isArray(meta.tags)) return meta.tags as string[];
  return String(meta.tags).split(/[,\s]+/).filter(Boolean);
}

/** Character count from source metadata (llama_index chunk_size). */
export function metaCharCount(meta: RagSource["metadata"] | undefined): number | null {
  const n = meta?.char_count;
  return typeof n === "number" ? n : null;
}

/** Token estimate from source metadata. */
export function metaTokenEstimate(meta: RagSource["metadata"] | undefined): number | null {
  const n = meta?.token_estimate;
  return typeof n === "number" ? n : null;
}

/** Source-level freshness descriptor.
 *  Reads `updated` (or `created` fallback) from frontmatter and returns
 *  age in days + a human label. `stale` flag kicks in >90 days. */
export function metaFreshness(meta: RagSource["metadata"] | undefined): { ageDays: number; label: string; stale: boolean } | null {
  const iso = meta?.updated || meta?.created;
  if (!iso) return null;
  const t = Date.parse(String(iso));
  if (Number.isNaN(t)) return null;
  const ageDays = Math.floor((Date.now() - t) / 86400000);
  let label: string;
  if (ageDays < 1) label = "today";
  else if (ageDays < 7) label = `${ageDays}d`;
  else if (ageDays < 30) label = `${Math.floor(ageDays / 7)}w`;
  else if (ageDays < 365) label = `${Math.floor(ageDays / 30)}mo`;
  else label = `${Math.floor(ageDays / 365)}y`;
  return { ageDays, label, stale: ageDays > 90 };
}

// ── CSV export ──

/** RFC 4180 CSV field quoting — wrap fields containing comma, quote, or newline. */
export function csvField(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ── Sparkline / scatter helpers ──

/** Compact SVG sparkline from a number series (latency, score, or token budget).
 *  Returns polyline points + min/max/mean summary for tooltips. */
export function sparklineData(series: number[], W = 120, H = 28, pad = 3) {
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = max - min || 1;
  const pts = series.map((v, i) => {
    const x = pad + (i / Math.max(1, series.length - 1)) * (W - 2 * pad);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = Math.round(series.reduce((a, b) => a + b, 0) / series.length);
  return { pts, min, max, mean, n: series.length, W, H };
}

/** Pearson correlation coefficient between two number arrays. Null if <3 pairs or zero variance. */
export function pearsonCorr(xs: number[], ys: number[]): { r: number; band: string; n: number } | null {
  if (xs.length < 3) return null;
  const n = xs.length;
  const meanX = xs.reduce((a, v) => a + v, 0) / n;
  const meanY = ys.reduce((a, v) => a + v, 0) / n;
  let num = 0, dX = 0, dY = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    dX += (xs[i] - meanX) ** 2;
    dY += (ys[i] - meanY) ** 2;
  }
  const denom = Math.sqrt(dX * dY);
  if (denom === 0) return null;
  const r = num / denom;
  const abs = Math.abs(r);
  const band = abs < 0.3 ? "negligible" : abs < 0.5 ? "weak" : abs < 0.7 ? "moderate" : "strong";
  return { r, band, n };
}

/** Scatter-plot data for (x, y) pairs with category-colour mapping.
 *  Returns SVG-ready dot positions + axis stats. */
export function scatterData<T extends { id: string; x: number; y: number; category: string }>(
  items: T[],
  palette: Record<string, string>,
  defaultColor: string,
  W = 200, H = 80, pad = 18,
) {
  const xs = items.map(p => p.x);
  const ys = items.map(p => p.y);
  const maxX = Math.max(...xs, 1);
  const meanX = Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  const maxY = Math.max(...ys, 0.001);
  const dots = items.map(p => ({
    id: p.id,
    cx: pad + (p.x / maxX) * (W - 2 * pad),
    cy: H - pad - (p.y / maxY) * (H - 2 * pad),
    r: 3,
    category: p.category,
    color: palette[p.category] || defaultColor,
    x: p.x,
    y: p.y,
  }));
  return { dots, maxX, maxY, meanX, W, H, pad, n: items.length };
}

/** Grade-bucket breakdown for a list of scores (A≥0.85, B≥0.70, C≥0.50, D<0.50).
 *  Returns counts, percentages, and Element Plus palette colours. */
export function gradeBreakdown(scores: number[]) {
  const buckets = { A: 0, B: 0, C: 0, D: 0 };
  for (const v of scores) {
    if (v >= 0.85) buckets.A++;
    else if (v >= 0.7) buckets.B++;
    else if (v >= 0.5) buckets.C++;
    else buckets.D++;
  }
  const total = buckets.A + buckets.B + buckets.C + buckets.D;
  if (!total) return null;
  const palette: Record<string, string> = {
    A: "var(--el-color-success)",
    B: "var(--el-color-primary)",
    C: "var(--el-color-warning)",
    D: "var(--el-color-danger)",
  };
  return {
    buckets: (["A", "B", "C", "D"] as const).map(g => ({
      grade: g,
      count: buckets[g],
      pct: Math.round((buckets[g] / total) * 100),
      color: palette[g],
    })),
    total,
  };
}

/** Token budget sum from source metadata — null when no source has token_estimate. */
export function tokenBudget(sources: Array<{ metadata?: { token_estimate?: number | string | null } | null }>): number | null {
  if (!sources.length) return null;
  let sum = 0, known = 0;
  for (const s of sources) {
    const n = s.metadata?.token_estimate;
    if (n != null) { sum += Number(n) || 0; known++; }
  }
  return known ? sum : null;
}