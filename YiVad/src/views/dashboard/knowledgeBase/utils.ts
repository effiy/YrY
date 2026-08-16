import type { KnowledgeFileSummary } from "@/api/interface/yiweb";

// ── Constants ──

/** Label used when a metadata field is truly absent (null/undefined/empty). Distinct from the literal "unknown" string. */
export const MISSING_LABEL = "__missing__";

/** Check if a field value represents genuinely missing data (not the "unknown" string). */
export function isMissingField(val: any): boolean {
  return val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0);
}

/** Check if a file path represents a markdown file (has frontmatter-capable metadata). */
export function isMarkdownFile(path: string): boolean {
  return path?.toLowerCase().endsWith(".md") ?? false;
}

/** Modules excluded from data quality checks (e.g. auto-generated skill files). */
const QUALITY_EXCLUDED_MODULES = new Set(["aier/skills"]);

/** Check if a file is excluded from data quality checks based on its category/module. */
export function isExcludedFromQuality(f: { category?: string; module?: string; path?: string }): boolean {
  const modKey = `${f.category || ""}/${f.module || ""}`;
  if (QUALITY_EXCLUDED_MODULES.has(modKey)) return true;
  // Also check if the path starts with an excluded prefix
  if (f.path) {
    for (const excluded of QUALITY_EXCLUDED_MODULES) {
      if (f.path.startsWith(excluded + "/")) return true;
    }
  }
  return false;
}

/** Check if a field value is the literal "unknown" string (explicitly set, not missing). */
export function isUnknownField(val: any): boolean {
  return typeof val === "string" && val === "unknown";
}

/** Normalize a metadata value: return "__missing__" for truly absent, "unknown" for literal unknown, or the value itself. */
export function normalizeMetaValue(val: any): string {
  if (isMissingField(val)) return MISSING_LABEL;
  if (isUnknownField(val)) return "unknown";
  return String(val);
}

// ── Color Maps ──

export const CATEGORY_COLORS: Record<string, string> = {
  producter: "#fac858", leader: "#73c0de", engineer: "#5470c6",
  srer: "#ea7ccc", executiver: "#ee6666", aier: "#91cc75",
  curator: "#3ba272",
  brd: "#5ab1ef", static: "#ff99cc", __root__: "#909399",
};

export const STATUS_COLORS: Record<string, string> = {
  stable: "#67c23a", active: "#67c23a", adopted: "#67c23a", accepted: "#67c23a",
  draft: "#909399", in_progress: "#e6a23c", planning: "#909399",
  proposed: "#909399", reviewed: "#409eff",
  unknown: "#c0c4cc", planned: "#b0c4de",
  [MISSING_LABEL]: "#f56c6c",
};

export const LIFECYCLE_COLORS: Record<string, string> = {
  active: "#67c23a", triage: "#e6a23c", reference: "#409eff",
  archive: "#909399", inbox: "#73c0de",
  unknown: "#c0c4cc",
  [MISSING_LABEL]: "#f56c6c",
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
  [MISSING_LABEL]: "#f56c6c",
};

export const STATUS_TAG_TYPES: Record<string, string> = {
  stable: "success", active: "success", adopted: "success", accepted: "success",
  draft: "info", in_progress: "warning", planning: "info", proposed: "info",
  reviewed: "primary", planned: "info",
  unknown: "info",
  [MISSING_LABEL]: "danger",
};

export const LIFECYCLE_TAG_TYPES: Record<string, string> = {
  active: "success", triage: "warning", reference: "info", archive: "danger",
  inbox: "primary", unknown: "info",
  [MISSING_LABEL]: "danger",
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
  const missing = [
    isMissingField(f.status),
    isMissingField(f.lifecycle) || isUnknownField(f.lifecycle),
    isMissingField(f.type) || isUnknownField(f.type),
    isMissingField(f.review_cycle),
  ].filter(Boolean).length;
  if (missing === 0 && !isStaleFile(f)) return "good";
  if (missing <= 2 && !isStaleFile(f)) return "warn";
  return "poor";
}

/** Returns a short label describing what's wrong with a file's metadata. */
export function fileHealthIssues(f: KnowledgeFileSummary): string[] {
  const issues: string[] = [];
  if (isMissingField(f.status)) issues.push("Missing status");
  else if (isUnknownField(f.status)) issues.push("Status: unknown");
  if (isMissingField(f.lifecycle)) issues.push("Missing lifecycle");
  else if (isUnknownField(f.lifecycle)) issues.push("Lifecycle: unknown");
  if (isMissingField(f.type)) issues.push("Missing type");
  else if (isUnknownField(f.type)) issues.push("Type: unknown");
  if (isMissingField(f.review_cycle)) issues.push("Missing review cycle");
  if (isMissingField(f.roles)) issues.push("Missing roles");
  if (isMissingField(f.tags)) issues.push("Missing tags");
  if (isMissingField(f.benefit)) issues.push("Missing benefit");
  if (isStaleFile(f)) issues.push("Stale");
  return issues;
}

// ── Data Helpers ──

export function countByField(files: KnowledgeFileSummary[], field: string): { name: string; count: number }[] {
  const c = new Map<string, number>();
  for (const f of files) {
    const raw = (f as any)[field];
    const v = normalizeMetaValue(raw);
    c.set(v, (c.get(v) || 0) + 1);
  }
  return Array.from(c.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

/** Count by field but return two separate series: known values + missing count. */
export function countByFieldWithMissing(
  files: KnowledgeFileSummary[],
  field: string,
): { items: { name: string; count: number }[]; missing: number } {
  const items = countByField(files, field);
  const missingIdx = items.findIndex(d => d.name === MISSING_LABEL);
  let missing = 0;
  if (missingIdx >= 0) {
    missing = items[missingIdx].count;
    items.splice(missingIdx, 1);
  }
  return { items, missing };
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

/** Returns a display label for a metadata value, distinguishing missing from unknown. */
export function metaDisplayValue(val: string | undefined | null, field: string): { label: string; isMissing: boolean; isUnknown: boolean } {
  if (isMissingField(val)) return { label: "Missing", isMissing: true, isUnknown: false };
  if (isUnknownField(val)) return { label: "Unknown", isMissing: false, isUnknown: true };
  return { label: String(val || ""), isMissing: false, isUnknown: false };
}

/** Aggregate unknown + missing counts for data quality dashboards. */
export function aggregateMissingStats(files: KnowledgeFileSummary[]): {
  no_status: number; no_type: number; no_lifecycle: number;
  no_review_cycle: number; no_roles: number; no_tags: number; no_benefit: number;
  unknown_status: number; unknown_type: number; unknown_lifecycle: number;
  stale_count: number;
} {
  let no_status = 0, no_type = 0, no_lifecycle = 0;
  let no_review_cycle = 0, no_roles = 0, no_tags = 0, no_benefit = 0;
  let unknown_status = 0, unknown_type = 0, unknown_lifecycle = 0;
  let stale_count = 0;
  for (const f of files) {
    if (isMissingField(f.status)) no_status++;
    else if (isUnknownField(f.status)) unknown_status++;
    if (isMissingField(f.type)) no_type++;
    else if (isUnknownField(f.type)) unknown_type++;
    if (isMissingField(f.lifecycle)) no_lifecycle++;
    else if (isUnknownField(f.lifecycle)) unknown_lifecycle++;
    if (isMissingField(f.review_cycle)) no_review_cycle++;
    if (isMissingField(f.roles)) no_roles++;
    if (isMissingField(f.tags)) no_tags++;
    if (isMissingField(f.benefit)) no_benefit++;
    if (isStaleFile(f)) stale_count++;
  }
  return { no_status, no_type, no_lifecycle, no_review_cycle, no_roles, no_tags, no_benefit, unknown_status, unknown_type, unknown_lifecycle, stale_count };
}

// ── Filter Labels ──

export const FILTER_LABEL_MAP: Record<string, string> = {
  category: "Category",
  status: "Status",
  type: "Type",
  lifecycle: "Lifecycle",
  review_cycle: "Review Cycle",
  module: "Module",
  sub_module: "Sub-module",
  role: "Role",
  tag: "Tag",
  benefit: "Benefit",
  tacit: "Tacit",
  stale: "Stale",
  size_min: "Min Size",
  size_max: "Max Size",
  age_min_days: "Min Age",
  age_max_days: "Max Age",
};

export const FILTER_DIMENSION_COLORS: Record<string, string> = {
  category: "#5470c6",
  status: "#67c23a",
  type: "#fac858",
  lifecycle: "#409eff",
  review_cycle: "#ee6666",
  module: "#5ab1ef",
  sub_module: "#73c0de",
  role: "#fc8452",
  tag: "#5470c6",
  benefit: "#67c23a",
  tacit: "#9a60b4",
  stale: "#e6a23c",
  size_min: "#909399",
  size_max: "#909399",
  age_min_days: "#909399",
  age_max_days: "#909399",
  [MISSING_LABEL]: "#f56c6c",
};

// ── Stale Risk & Health Scoring ──

/** Compute days until a file's review is due. Negative = overdue, null = can't determine. */
export function daysUntilDue(f: KnowledgeFileSummary): number | null {
  if (!f.review_cycle || !f.updated) return null;
  const cycleDays = REVIEW_CYCLE_DAYS[f.review_cycle];
  if (!cycleDays) return null;
  try {
    const updated = new Date(f.updated).getTime();
    if (isNaN(updated)) return null;
    const daysSince = (Date.now() - updated) / 86400000;
    return cycleDays - daysSince;
  } catch {
    return null;
  }
}

/** Composite module health score 0–100: coverage (40%) + freshness (40%) + base (20%). */
export function moduleHealthScore(m: {
  review_coverage_pct: number;
  stale_count: number;
  count: number;
}): number {
  const staleRatio = m.count > 0 ? m.stale_count / m.count : 0;
  return Math.round(m.review_coverage_pct * 0.4 + (1 - staleRatio) * 100 * 0.4 + 20);
}

/** Map filter keys to chart dimension names for highlighting. */
export function filterKeyToDimension(key: string): string | null {
  const keyDimMap: Record<string, string> = {
    category: "category",
    status: "status",
    type: "type",
    lifecycle: "lifecycle",
    review_cycle: "review_cycle",
  };
  if (key in keyDimMap) return keyDimMap[key];
  if (key === "role") return "roles";
  if (key === "tag") return "tags";
  if (key === "size_min" || key === "size_max") return "size";
  if (key === "age_min_days" || key === "age_max_days") return "age";
  if (key === "module" || key === "sub_module") return "module";
  return null;
}

/** Count co-occurring pairs of items across files (e.g. tags, roles).
 *  Returns top N pairs sorted by co-occurrence count. */
export function topPairs<T extends { [k: string]: any }>(
  items: T[],
  field: string,
  topN: number = 10
): { item1: string; item2: string; count: number }[] {
  const pairCounts = new Map<string, number>();
  for (const item of items) {
    const values: string[] = (item as any)[field] ?? [];
    if (!Array.isArray(values) || values.length < 2) continue;
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const [a, b] = values[i] < values[j] ? [values[i], values[j]] : [values[j], values[i]];
        const key = `${a}|||${b}`;
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }
  return Array.from(pairCounts.entries())
    .map(([key, count]) => {
      const [item1, item2] = key.split("|||");
      return { item1, item2, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}