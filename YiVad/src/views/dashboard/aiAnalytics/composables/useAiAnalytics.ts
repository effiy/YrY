import { ref, reactive, computed } from "vue";
import {
  getAiStats,
  getRagStats,
  getPerformance,
  getServiceStats,
} from "@/api/modules/dashboard";
import type {
  AiStatsData,
  RagStatsData,
  PerformanceData,
  ServiceStatsData,
} from "@/api/interface/yiweb";

export function useAiAnalytics() {
  const loading = ref(false);
  const aiStats = ref<AiStatsData | null>(null);
  const ragStats = ref<RagStatsData | null>(null);
  const performance = ref<PerformanceData | null>(null);
  const serviceStats = ref<ServiceStatsData | null>(null);
  const error = ref("");

  async function fetchData() {
    loading.value = true;
    error.value = "";
    try {
      const [ai, rag, perf, svc] = await Promise.all([
        getAiStats().catch(() => null),
        getRagStats().catch(() => null),
        getPerformance().catch(() => null),
        getServiceStats().catch(() => null),
      ]);
      if (ai) aiStats.value = ai.data;
      if (rag) ragStats.value = rag.data;
      if (perf) performance.value = perf.data;
      if (svc) serviceStats.value = svc.data;
    } catch (e: any) {
      error.value = e?.message || "Failed to load analytics data";
    } finally {
      loading.value = false;
    }
  }

  const totalMessages = computed(() => aiStats.value?.total_messages ?? 0);
  const totalSessions = computed(() => aiStats.value?.total_sessions ?? 0);
  const activeToday = computed(() => aiStats.value?.active_sessions_today ?? 0);
  const messagesToday = computed(() => aiStats.value?.messages_today ?? 0);
  const avgMessagesPerSession = computed(() => aiStats.value?.avg_messages_per_session ?? 0);

  const ragDocCount = computed(() => ragStats.value?.num_docs ?? 0);
  const ragBuilt = computed(() => ragStats.value?.built ?? false);
  const ragLastBuilt = computed(() => ragStats.value?.last_built_at ?? "");
  const ragPersistSize = computed(() => {
    const s = ragStats.value?.persist_dir_size ?? 0;
    return s > 1024 * 1024 ? `${(s / 1024 / 1024).toFixed(1)}MB` : s > 1024 ? `${(s / 1024).toFixed(1)}KB` : `${s}B`;
  });

  const svcTotalCalls = computed(() => serviceStats.value?.total_calls ?? 0);
  const svcSuccessRate = computed(() => serviceStats.value?.success_rate ?? 0);
  const svcAvgDuration = computed(() => serviceStats.value?.avg_duration_ms ?? 0);

  const diskUsage = computed(() => performance.value?.disk);
  const memoryUsage = computed(() => performance.value?.memory);
  const cpuUsage = computed(() => performance.value?.process?.cpu_percent ?? 0);

  return {
    loading,
    error,
    aiStats,
    ragStats,
    performance,
    serviceStats,
    fetchData,
    // computed
    totalMessages,
    totalSessions,
    activeToday,
    messagesToday,
    avgMessagesPerSession,
    ragDocCount,
    ragBuilt,
    ragLastBuilt,
    ragPersistSize,
    svcTotalCalls,
    svcSuccessRate,
    svcAvgDuration,
    diskUsage,
    memoryUsage,
    cpuUsage,
  };
}