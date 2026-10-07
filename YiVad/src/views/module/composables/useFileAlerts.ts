import { computed, onBeforeUnmount, ref, type Ref } from "vue";
import { getFileAlerts } from "@/api/modules/analyticsService";
import type { FileAlertItem, FileAlertsResponse } from "@/types/analytics";

const POLL_INTERVAL_MS = 30_000;

export function useFileAlerts(options: { projectKey?: string }) {
  const data = ref<FileAlertsResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const polling = ref(true);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const alerts = computed<FileAlertItem[]>(() => data.value?.alerts ?? []);

  const summary = computed(() => data.value?.summary ?? { critical: 0, warning: 0, info: 0, total: 0 });

  const criticalCount = computed(() => summary.value.critical);
  const warningCount = computed(() => summary.value.warning);
  const infoCount = computed(() => summary.value.info);

  const alertsByDomain = computed(() => {
    const byDomain: Record<string, FileAlertItem[]> = { knowledge: [], data: [], code: [] };
    for (const a of alerts.value) {
      const d = a.domain || "knowledge";
      if (!byDomain[d]) byDomain[d] = [];
      byDomain[d].push(a);
    }
    return byDomain;
  });

  const domainSummary = computed(() => {
    const ds: Record<string, { total: number; critical: number; warning: number; info: number }> = {};
    for (const a of alerts.value) {
      const d = a.domain || "knowledge";
      if (!ds[d]) ds[d] = { total: 0, critical: 0, warning: 0, info: 0 };
      ds[d].total++;
      ds[d][a.severity]++;
    }
    return ds;
  });

  const hasAlerts = computed(() => alerts.value.length > 0);

  async function refresh(silent = false) {
    if (!silent) loading.value = true;
    error.value = null;
    try {
      data.value = await getFileAlerts({
        project_key: options.projectKey || undefined
      });
    } catch (e) {
      if (!silent) error.value = e instanceof Error ? e.message : "Failed to load file alerts";
    } finally {
      if (!silent) loading.value = false;
    }
  }

  async function init() {
    await refresh();
    pollTimer = setInterval(() => { if (polling.value) refresh(true); }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  onBeforeUnmount(() => stopPolling());

  return {
    data,
    loading,
    error,
    alerts,
    summary,
    criticalCount,
    warningCount,
    infoCount,
    alertsByDomain,
    domainSummary,
    hasAlerts,
    polling,
    refresh,
    init,
    stopPolling
  };
}