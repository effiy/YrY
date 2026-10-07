/**
 * Knowledge metrics composable — fetches real-time data from YiAi backend
 * and computes derived metrics for the knowledge metrics dashboard.
 */
import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from "vue";
import { listKnowledgeFiles, listKnowledgeBugs, getKnowledgeIssueStats } from "@/api/modules/knowledgeService";
import { useKnowledgeInsight } from "@/hooks/useKnowledgeInsight";
import type { KnowledgeFileEntry, KnowledgeBugEntry } from "@/api/interface/yiAi";
import { ROLE_COLORS, ROLE_IDS, rolesData } from "@/views/knowledge/executive/okrData";

const POLL_MS = 60_000;
const WEEK_MS = 7 * 86400000;
const MONTH_MS = 30 * 86400000;
const QUARTER_MS = 90 * 86400000;

export interface RoleDistribution {
  role: string;
  label: string;
  icon: string;
  count: number;
  color: string;
}

export interface FreshnessBucket {
  label: string;
  range: string;
  count: number;
  pct: number;
  color: string;
}

export interface FieldCompleteness {
  field: string;
  label: string;
  complete: number;
  missing: number;
  pct: number;
}

export interface ActivityItem {
  type: "file" | "bug";
  title: string;
  path?: string;
  category?: string;
  severity?: string;
  time: number;
}

export interface KnowledgeMetrics {
  // Raw data
  files: Ref<KnowledgeFileEntry[]>;
  totalFiles: Ref<number>;
  bugs: Ref<KnowledgeBugEntry[]>;
  totalBugs: Ref<number>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  lastUpdated: Ref<number | null>;

  // Computed
  roleDistribution: ComputedRef<RoleDistribution[]>;
  categoryCount: ComputedRef<number>;
  freshnessBuckets: ComputedRef<FreshnessBucket[]>;
  activeWeekCount: ComputedRef<number>;
  activeWeekPct: ComputedRef<number>;
  fieldCompleteness: ComputedRef<FieldCompleteness[]>;
  dataQualityScore: ComputedRef<number>;
  activityFeed: ComputedRef<ActivityItem[]>;

  // Issue stats (from server aggregation)
  issueStats: Ref<{
    total: number;
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
    backlog: number;
    cancelled: number;
  } | null>;
  issueStatusDist: Ref<Record<string, number>>;
  issuePriorityDist: Ref<Record<string, number>>;
  issueAttention: Ref<{ overdue: number; unassigned: number; blocked: number }>;

  // From useKnowledgeInsight
  insight: ReturnType<typeof useKnowledgeInsight>;

  // Actions
  retry: () => Promise<void>;
}

/** File importance weighting for type distribution */
function fileTypeWeight(entry: KnowledgeFileEntry): number {
  const p = entry.path;
  if (/projects\/[^/]+\/(specs|architecture|workflows)\//.test(p)) return 3;
  if (/curator\/governance\//.test(p)) return 3;
  if (/\/patterns\//.test(p) || /\/requirements\//.test(p)) return 2;
  return 1;
}

export function useKnowledgeMetrics(): KnowledgeMetrics {
  const files = ref<KnowledgeFileEntry[]>([]);
  const totalFiles = ref(0);
  const bugs = ref<KnowledgeBugEntry[]>([]);
  const totalBugs = ref(0);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const lastUpdated = ref<number | null>(null);

  const issueStats = ref<{
    total: number;
    todo: number;
    in_progress: number;
    in_review: number;
    done: number;
    backlog: number;
    cancelled: number;
  } | null>(null);
  const issueStatusDist = ref<Record<string, number>>({});
  const issuePriorityDist = ref<Record<string, number>>({});
  const issueAttention = ref<{ overdue: number; unassigned: number; blocked: number }>({
    overdue: 0,
    unassigned: 0,
    blocked: 0
  });

  const insight = useKnowledgeInsight();

  async function fetchAll() {
    loading.value = true;
    error.value = null;

    try {
      const [filesRes, bugsRes, statsRes] = await Promise.allSettled([
        listKnowledgeFiles(),
        listKnowledgeBugs(),
        getKnowledgeIssueStats({})
      ]);

      if (filesRes.status === "fulfilled") {
        files.value = filesRes.value.files ?? [];
        totalFiles.value = filesRes.value.total ?? files.value.length;
      } else {
        error.value = "Failed to load knowledge files";
      }

      if (bugsRes.status === "fulfilled" && bugsRes.value) {
        bugs.value = bugsRes.value.bugs ?? [];
        totalBugs.value = bugsRes.value.total ?? bugs.value.length;
      }

      if (statsRes.status === "fulfilled" && statsRes.value) {
        const st = statsRes.value.stats;
        issueStats.value = st;
        issueStatusDist.value = statsRes.value.statusDist ?? {};
        issuePriorityDist.value = statsRes.value.priorityDist ?? {};
        issueAttention.value = statsRes.value.attention ?? { overdue: 0, unassigned: 0, blocked: 0 };
      }

      lastUpdated.value = Date.now();
    } catch {
      error.value = "Unexpected error loading metrics";
    } finally {
      loading.value = false;
    }
  }

  // ── Role distribution (files per role category) ──
  const roleDistribution = computed<RoleDistribution[]>(() => {
    const counts: Record<string, number> = {};
    for (const f of files.value) {
      const cat = f.category || "__root__";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }

    return ROLE_IDS.map(id => {
      const role = rolesData[id];
      return {
        role: id,
        label: role?.name ?? id,
        icon: role?.icon ?? "",
        count: counts[id] ?? 0,
        color: ROLE_COLORS[id] ?? "#909399"
      };
    })
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);
  });

  const categoryCount = computed(() => roleDistribution.value.length);

  // ── Freshness buckets ──
  const freshnessBuckets = computed<FreshnessBucket[]>(() => {
    const now = Date.now();
    let week = 0;
    let month = 0;
    let quarter = 0;
    let older = 0;

    for (const f of files.value) {
      const t = f.updatedAt ?? 0;
      if (!t || t <= 0) {
        older++;
        continue;
      }
      const age = now - t;
      if (age <= WEEK_MS) week++;
      else if (age <= MONTH_MS) month++;
      else if (age <= QUARTER_MS) quarter++;
      else older++;
    }

    const total = files.value.length || 1;
    return [
      { label: "≤ 7 days", range: "0-7d", count: week, pct: Math.round((week / total) * 100), color: "#67c23a" },
      { label: "8-30 days", range: "8-30d", count: month, pct: Math.round((month / total) * 100), color: "#409eff" },
      { label: "31-90 days", range: "31-90d", count: quarter, pct: Math.round((quarter / total) * 100), color: "#e6a23c" },
      { label: "> 90 days", range: ">90d", count: older, pct: Math.round((older / total) * 100), color: "#f56c6c" }
    ];
  });

  const activeWeekCount = computed(() => freshnessBuckets.value[0]?.count ?? 0);
  const activeWeekPct = computed(() => freshnessBuckets.value[0]?.pct ?? 0);

  // ── Field completeness ──
  const fieldCompleteness = computed<FieldCompleteness[]>(() => {
    const fields = [
      { field: "status", label: "Status" },
      { field: "type", label: "Type" },
      { field: "lifecycle", label: "Lifecycle" },
      { field: "review_cycle", label: "Review Cycle" },
      { field: "roles", label: "Roles" },
      { field: "tags", label: "Tags" }
    ];

    return fields.map(({ field, label }) => {
      const missing = files.value.filter(f => {
        const val = (f.meta as any)?.[field];
        if (field === "roles" || field === "tags") return !val || val.length === 0;
        return !val;
      }).length;
      const complete = files.value.length - missing;
      return {
        field,
        label,
        complete,
        missing,
        pct: files.value.length ? Math.round((complete / files.value.length) * 100) : 0
      };
    });
  });

  const dataQualityScore = computed(() => {
    const weights: Record<string, number> = {
      status: 25, type: 20, lifecycle: 20, review_cycle: 15, roles: 10, tags: 10
    };
    let score = 0;
    for (const fc of fieldCompleteness.value) {
      score += (fc.pct / 100) * (weights[fc.field] ?? 10);
    }
    return Math.round(score);
  });

  // ── Activity feed ──
  const activityFeed = computed<ActivityItem[]>(() => {
    const now = Date.now();
    const weekAgo = now - WEEK_MS;

    const fileActs: ActivityItem[] = files.value
      .filter(f => f.updatedAt && f.updatedAt > weekAgo)
      .map(f => ({
        type: "file" as const,
        title: f.meta?.title || f.name,
        path: f.path,
        category: f.category,
        time: f.updatedAt!
      }));

    const bugActs: ActivityItem[] = bugs.value
      .filter(b => b.updatedAt && b.updatedAt > weekAgo)
      .map(b => ({
        type: "bug" as const,
        title: b.title || b.key,
        severity: b.severity,
        time: b.updatedAt!
      }));

    return [...fileActs, ...bugActs]
      .sort((a, b) => b.time - a.time)
      .slice(0, 20);
  });

  let timer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    fetchAll();
    timer = setInterval(fetchAll, POLL_MS);
  });

  onUnmounted(() => {
    if (timer !== null) clearInterval(timer);
  });

  return {
    files,
    totalFiles,
    bugs,
    totalBugs,
    loading,
    error,
    lastUpdated,
    roleDistribution,
    categoryCount,
    freshnessBuckets,
    activeWeekCount,
    activeWeekPct,
    fieldCompleteness,
    dataQualityScore,
    activityFeed,
    issueStats,
    issueStatusDist,
    issuePriorityDist,
    issueAttention,
    insight,
    retry: fetchAll
  };
}