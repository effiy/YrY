import { computed, ref, type Ref } from "vue";
import { queryDocuments } from "@/api/modules/dataService";
import type { HeaderPill } from "@/components";

export function buildDateFilter(filterDateStr: string): Record<string, any> {
  if (!filterDateStr) return {};
  const start = new Date(filterDateStr + "T00:00:00").getTime();
  const end = new Date(filterDateStr + "T23:59:59").getTime();
  return { createdAtStart: start, createdAtEnd: end };
}

export function useBugData(options: {
  projectKey?: string;
  filterDateStr: Ref<string>;
}) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const stats = ref({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, critical: 0 });

  const resolutionPct = computed(() => {
    if (!stats.value.total) return 0;
    return Math.round(((stats.value.resolved + stats.value.closed) / stats.value.total) * 100);
  });

  const headerPills = computed<HeaderPill[]>(() => [
    { value: stats.value.total, label: "Total" },
    { value: stats.value.open, label: "Open" },
    { value: stats.value.resolved, label: "Resolved" },
    { value: resolutionPct.value, suffix: "%", label: "Resolution", accent: true }
  ]);

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const baseFilter: Record<string, any> = {};
      if (options.projectKey) baseFilter.project_key = options.projectKey;
      const dateFilter = buildDateFilter(options.filterDateStr.value);
      Object.assign(baseFilter, dateFilter);

      const [totalRes, openRes, criticalRes, resolvedRes, closedRes] = await Promise.all([
        queryDocuments({ cname: "bugs", filter: { ...baseFilter }, pageSize: 0 }),
        queryDocuments({ cname: "bugs", filter: { ...baseFilter, status: "open" }, pageSize: 0 }),
        queryDocuments({ cname: "bugs", filter: { ...baseFilter, severity: "critical" }, pageSize: 0 }),
        queryDocuments({ cname: "bugs", filter: { ...baseFilter, status: "resolved" }, pageSize: 0 }),
        queryDocuments({ cname: "bugs", filter: { ...baseFilter, status: "closed" }, pageSize: 0 })
      ]);

      stats.value = {
        total: totalRes.data?.total ?? 0,
        open: openRes.data?.total ?? 0,
        in_progress: 0,
        resolved: resolvedRes.data?.total ?? 0,
        closed: closedRes.data?.total ?? 0,
        critical: criticalRes.data?.total ?? 0
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load bug stats";
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, stats, headerPills, resolutionPct, refresh, buildDateFilter };
}

export function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}