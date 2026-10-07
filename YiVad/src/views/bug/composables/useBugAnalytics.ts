import { computed, onUnmounted, ref, watch, type Ref, type ComputedRef } from "vue";
import { getBugQualityMetrics } from "@/api/modules/analyticsService";
import type { QualityMetrics } from "@/types/analytics";
import type { HeaderPill } from "@/components";

export function buildDateFilter(filterDateStr: string): Record<string, any> {
  if (!filterDateStr) return {};
  const start = new Date(filterDateStr + "T00:00:00").getTime();
  const end = new Date(filterDateStr + "T23:59:59").getTime();
  return { createdAtStart: start, createdAtEnd: end };
}

export interface BugAnalyticsOptions {
  projectKey?: string;
  filterDateStr: Ref<string>;
}

export function useBugAnalytics(options: BugAnalyticsOptions) {
  const metrics = ref<QualityMetrics | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const refreshInterval = ref(0);

  let _timer: ReturnType<typeof setInterval> | null = null;

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const params: { project_key?: string; dateRange?: { start: string; end: string } } = {};
      if (options.projectKey) params.project_key = options.projectKey;
      const dateStr = options.filterDateStr.value;
      if (dateStr) {
        params.dateRange = { start: dateStr, end: dateStr };
      }
      metrics.value = await getBugQualityMetrics(params);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load bug analytics";
    } finally {
      loading.value = false;
    }
  }

  function startAutoRefresh(intervalSec?: number) {
    stopAutoRefresh();
    const sec = intervalSec ?? refreshInterval.value;
    refreshInterval.value = sec;
    if (sec > 0) {
      _timer = setInterval(refresh, sec * 1000);
    }
  }

  function stopAutoRefresh() {
    if (_timer) { clearInterval(_timer); _timer = null; }
  }

  onUnmounted(stopAutoRefresh);

  // ── Header pills ──
  const headerPills = computed<HeaderPill[]>(() => {
    const m = metrics.value;
    if (!m) return [];
    const resolved = (m.status_breakdown?.resolved ?? 0) + (m.status_breakdown?.closed ?? 0);
    const resolutionPct = m.bug_count ? Math.round((resolved / m.bug_count) * 100) : 0;
    return [
      { value: m.bug_count, label: "Total" },
      { value: (m.status_breakdown?.open ?? 0) + (m.status_breakdown?.in_progress ?? 0), label: "Open" },
      { value: resolved, label: "Resolved" },
      { value: resolutionPct, suffix: "%", label: "Resolution", accent: true }
    ];
  });

  // ── Sidebar stats ──
  const sidebarStats = computed(() => {
    const m = metrics.value;
    const sb = m?.status_breakdown;
    return {
      total: m?.bug_count ?? 0,
      open: (sb?.open ?? 0) + (sb?.in_progress ?? 0),
      resolved: (sb?.resolved ?? 0) + (sb?.closed ?? 0),
      critical: m?.critical_open ?? 0
    };
  });

  const resolutionPct = computed(() => {
    const s = sidebarStats.value;
    return s.total ? Math.round((s.resolved / s.total) * 100) : 0;
  });

  // ── Attention section ──
  const attention = computed(() => {
    const m = metrics.value;
    return {
      critical: m?.critical_open ?? 0,
      unassigned: m?.unassigned_open ?? 0,
      stale: m?.stale_open ?? 0
    };
  });

  // ── Data quality ──
  const completeness = computed(() => {
    const c = metrics.value?.completeness;
    if (!c) return [];
    return [
      { key: "desc", label: "Description", pct: c.description_pct },
      { key: "assignee", label: "Assignee", pct: c.assignee_pct },
      { key: "env", label: "Environment", pct: c.environment_pct },
      { key: "fixed", label: "Fixed Version", pct: c.fixedVersion_pct }
    ];
  });

  // ── Freshness ──
  const freshnessLevel = computed(() => {
    const s = metrics.value?.freshness_seconds;
    if (s == null) return "unknown";
    if (s < 300) return "live";
    if (s < 3600) return "recent";
    return "stale";
  });

  const freshnessLabel = computed(() => {
    const s = metrics.value?.freshness_seconds;
    if (s == null) return "No data";
    if (s < 60) return "Live — updated just now";
    if (s < 300) return `Live — ${Math.round(s / 60)}m ago`;
    if (s < 3600) return `Recent — ${Math.round(s / 60)}m ago`;
    return `Stale — ${Math.round(s / 3600)}h ago`;
  });

  // Auto-fetch on mount and when filterDateStr changes
  watch(() => options.filterDateStr.value, refresh, { immediate: true });

  return {
    metrics,
    loading,
    error,
    refresh,
    refreshInterval,
    startAutoRefresh,
    stopAutoRefresh,
    headerPills,
    sidebarStats,
    attention,
    completeness,
    resolutionPct,
    freshnessLevel,
    freshnessLabel,
    buildDateFilter
  };
}