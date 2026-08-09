import type { KnowledgeFileSummary } from "@/api/interface/yiweb";

// ── Color Maps ──

export const CATEGORY_COLORS: Record<string, string> = {
  engineer: "#5470c6", "ai-engineer": "#91cc75", "product-manager": "#fac858",
  executive: "#ee6666", "tech-lead": "#73c0de", "knowledge-curator": "#3ba272",
  "skill-author": "#fc8452", "new-hire": "#9a60b4", "oncall-sre": "#ea7ccc",
  brd: "#5ab1ef", static: "#ff99cc",
  "technical-writer": "#67c23a", "data-engineer": "#e6a23c",
  __root__: "#909399", devops: "#f56c6c",
};

export const STATUS_COLORS: Record<string, string> = {
  stable: "#67c23a", active: "#67c23a", adopted: "#67c23a", accepted: "#67c23a",
  draft: "#909399", in_progress: "#e6a23c", planning: "#909399",
  proposed: "#909399", reviewed: "#409eff",
  unknown: "#c0c4cc", planned: "#b0c4de",
};

export const LIFECYCLE_COLORS: Record<string, string> = {
  active: "#67c23a", triage: "#e6a23c", reference: "#409eff",
  archive: "#909399", inbox: "#73c0de",
};

export const REVIEW_CYCLE_COLORS: Record<string, string> = {
  weekly: "#ee6666", monthly: "#fac858", quarterly: "#5470c6",
  yearly: "#91cc75", "half-yearly": "#73c0de", "semi-annual": "#73c0de",
};

export const TYPE_COLORS: Record<string, string> = {
  journey: "#5470c6", summary: "#91cc75", dashboard: "#fac858",
  rss: "#ee6666", template: "#73c0de", "leaf-readme": "#3ba272",
  process: "#fc8452", index: "#9a60b4", pattern: "#ea7ccc",
  original: "#5ab1ef", prompt: "#ff99cc",
  design: "#b6a2de", "domain-index": "#1f78b4",
  prd: "#e31a1c", adr: "#fdbf6f", methodology: "#cab2d6",
  brd: "#ff7f00", feature: "#33a02c", "strategy-instance": "#b15928",
  unknown: "#c0c4cc",
};

export const STATUS_TAG_TYPES: Record<string, string> = {
  stable: "success", active: "success", adopted: "success", accepted: "success",
  draft: "info", in_progress: "warning", planning: "info", proposed: "info",
  reviewed: "primary", planned: "info",
};

export const LIFECYCLE_TAG_TYPES: Record<string, string> = {
  active: "success", triage: "warning", reference: "info", archive: "danger",
  inbox: "primary", unknown: "info",
};

export const REVIEW_CYCLE_TAG_TYPES: Record<string, string> = {
  weekly: "danger", monthly: "warning", quarterly: "primary",
  yearly: "success", "half-yearly": "success",
};

export const REVIEW_CYCLE_DAYS: Record<string, number> = {
  weekly: 7, monthly: 30, quarterly: 90, yearly: 365, "half-yearly": 180,
};

// ── Color Lookup Functions ──

export function catColor(name: string): string {
  return CATEGORY_COLORS[name] || "#909399";
}

export function statusColor(s: string): string {
  return STATUS_COLORS[s] || "#c0c4cc";
}

export type TagType = "success" | "warning" | "info" | "primary" | "danger";

export function statusTagType(s: string): TagType {
  return (STATUS_TAG_TYPES[s] || "info") as TagType;
}

export function lifecycleColor(l: string): string {
  return LIFECYCLE_COLORS[l] || "#c0c4cc";
}

export function lifecycleTagType(l: string): TagType {
  return (LIFECYCLE_TAG_TYPES[l] || "info") as TagType;
}

export function reviewCycleTagType(c: string): TagType {
  return (REVIEW_CYCLE_TAG_TYPES[c] || "info") as TagType;
}

// ── Formatters ──

export function formatNumber(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "--";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 10);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days < 2) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  } catch { return dateStr.slice(0, 10); }
}

export function highlightSnippet(snippet: string, query: string): string {
  if (!query) return snippet;
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return snippet.replace(new RegExp(`(${q})`, "gi"), "<b style='background:#fff3cd;color:#303133'>$1</b>");
}

// ── Health Checkers ──

export function isStaleFile(f: KnowledgeFileSummary): boolean {
  if (!f.review_cycle || !f.updated) return false;
  const days = REVIEW_CYCLE_DAYS[f.review_cycle];
  if (!days) return false;
  try {
    const d = new Date(f.updated);
    if (isNaN(d.getTime())) return false;
    return (Date.now() - d.getTime()) / 86400000 > days;
  } catch { return false; }
}

export function fileHealthLevel(f: KnowledgeFileSummary): "good" | "warn" | "poor" {
  const missing = [!f.status, !f.lifecycle || f.lifecycle === "unknown", !f.type || f.type === "unknown", !f.review_cycle].filter(Boolean).length;
  if (missing === 0 && !isStaleFile(f)) return "good";
  if (missing <= 2 && !isStaleFile(f)) return "warn";
  return "poor";
}

// ── Data Helpers ──

export function countByField(files: KnowledgeFileSummary[], field: string): { name: string; count: number }[] {
  const c = new Map<string, number>();
  for (const f of files) {
    const v = (f as any)[field] || "unknown";
    c.set(v, (c.get(v) || 0) + 1);
  }
  return Array.from(c.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export interface ClassSummary {
  statuses: { name: string; count: number }[];
  types: { name: string; count: number }[];
  lifecycles: { name: string; count: number }[];
  reviewCycles: { name: string; count: number }[];
  roles: { name: string; count: number }[];
}

export function getModuleClassSummary(files: KnowledgeFileSummary[]): ClassSummary {
  const countBy = (key: string) => {
    const m = new Map<string, number>();
    for (const f of files) {
      const v = (f as any)[key];
      if (!v || (Array.isArray(v) && v.length === 0)) continue;
      if (Array.isArray(v)) { for (const item of v) m.set(item, (m.get(item) || 0) + 1); }
      else m.set(v, (m.get(v) || 0) + 1);
    }
    return Array.from(m.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  };
  return {
    statuses: countBy("status"),
    types: countBy("type"),
    lifecycles: countBy("lifecycle"),
    reviewCycles: countBy("review_cycle"),
    roles: countBy("roles"),
  };
}

/** Returns a color for a data quality percentage: green ≥80%, orange ≥50%, red <50%. */
export function dataQualityColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}