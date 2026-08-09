/**
 * AI Analytics dashboard composable — reactive state, computeds, and actions.
 * Extracted from the page component so index.vue stays an orchestrator.
 */
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { getAiStats } from "@/api/modules/dashboard";
import type { AiStatsData } from "@/api/interface/yiweb";
import type { ECOption } from "@/components/ECharts/config";
import {
  buildDailyActivity, buildModelDonut, buildModelBar,
  buildSessionsTrend, buildMessagesTrend, buildWeeklyHeatmap,
  CHART_PALETTE,
} from "../charts";

export function useAiAnalytics() {
  // ── Core State ──
  const data = ref<AiStatsData | null>(null);
  const loading = ref(true);
  const lastUpdated = ref("");
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  // ── Filter State ──
  const modelFilter = ref("");
  const activeStatCard = ref("");

  // ── Computed: Derived metrics ──

  const dailyAvgSessions = computed(() => {
    const daily = data.value?.daily ?? [];
    if (!daily.length) return 0;
    return Math.round(daily.reduce((s, d) => s + d.sessions, 0) / daily.length);
  });

  const dailyAvgMessages = computed(() => {
    const daily = data.value?.daily ?? [];
    if (!daily.length) return 0;
    return Math.round(daily.reduce((s, d) => s + d.messages, 0) / daily.length);
  });

  const totalModelCalls = computed(() =>
    data.value?.model_usage?.reduce((s, m) => s + m.count, 0) ?? 0,
  );

  function modelPercent(count: number): number {
    const total = totalModelCalls.value || 1;
    return Math.round((count / total) * 100);
  }

  // ── Computed: Weekly summary (last 7 days) ──

  const weeklySummary = computed(() => {
    const daily = data.value?.daily ?? [];
    const last7 = daily.slice(-7);
    const maxMsgs = Math.max(...last7.map(d => d.messages), 1);
    return last7.map(d => ({
      date: d.date.slice(5),
      fullDate: d.date,
      sessions: d.sessions,
      messages: d.messages,
      msgPercent: Math.round((d.messages / maxMsgs) * 100),
      sessionPercent: Math.round((d.sessions / Math.max(...last7.map(x => x.sessions), 1)) * 100),
    }));
  });

  // ── Computed: Filtered recent sessions ──

  const filteredRecent = computed(() => {
    const recent = data.value?.recent ?? [];
    if (!modelFilter.value) return recent;
    // If model filter is active, we keep all recent sessions
    // (the backend doesn't provide per-session model info, so filtering is limited)
    return recent;
  });

  // ── Computed: Chart options ──

  const dailyActivityOption = computed<ECOption>(() =>
    buildDailyActivity(data.value?.daily ?? []),
  );

  const modelDonutOption = computed<ECOption>(() =>
    buildModelDonut(data.value?.model_usage ?? []),
  );

  const modelBarOption = computed<ECOption>(() =>
    buildModelBar(data.value?.model_usage ?? []),
  );

  const sessionsTrendOption = computed<ECOption>(() =>
    buildSessionsTrend(data.value?.daily ?? []),
  );

  const messagesTrendOption = computed<ECOption>(() =>
    buildMessagesTrend(data.value?.daily ?? []),
  );

  const weeklyHeatmapOption = computed<ECOption>(() =>
    buildWeeklyHeatmap(data.value?.daily ?? []),
  );

  // ── Chart click handlers ──

  function handleModelClick(params: any) {
    if (!params?.name) return;
    if (modelFilter.value === params.name) {
      modelFilter.value = "";
    } else {
      modelFilter.value = params.name;
    }
  }

  function handleDailyClick(params: any) {
    // Click on a daily bar/point — could filter to that day's data
    // Currently the recent sessions don't have date granularity, so just highlight
    if (params?.name) {
      activeStatCard.value = params.name;
      setTimeout(() => { activeStatCard.value = ""; }, 2000);
    }
  }

  function clearModelFilter() {
    modelFilter.value = "";
  }

  function pulseCard(name: string) {
    activeStatCard.value = name;
    setTimeout(() => { activeStatCard.value = ""; }, 600);
  }

  // ── Helpers ──

  function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  }

  function formatDate(val: string): string {
    if (!val) return "—";
    try {
      const d = new Date(val);
      return d.toLocaleString();
    } catch {
      return val.slice(0, 16);
    }
  }

  function formatRelativeTime(val: string): string {
    if (!val) return "—";
    try {
      const d = new Date(val);
      const now = Date.now();
      const diff = now - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString();
    } catch {
      return val.slice(0, 10);
    }
  }

  function modelColor(model: string): string {
    const models = data.value?.model_usage ?? [];
    const idx = models.findIndex(m => m.model === model);
    return idx >= 0 ? CHART_PALETTE[idx % CHART_PALETTE.length] : "#909399";
  }

  // ── Data fetching ──

  async function fetchData() {
    try {
      loading.value = true;
      const res = await getAiStats();
      data.value = res.data;
      lastUpdated.value = new Date().toLocaleTimeString();
    } finally {
      loading.value = false;
    }
  }

  // ── Lifecycle ──

  onMounted(() => {
    fetchData();
    refreshTimer = setInterval(fetchData, 60_000);
  });

  onBeforeUnmount(() => {
    if (refreshTimer) clearInterval(refreshTimer);
  });

  return {
    // State
    data,
    loading,
    lastUpdated,
    modelFilter,
    activeStatCard,
    // Computed
    dailyAvgSessions,
    dailyAvgMessages,
    totalModelCalls,
    weeklySummary,
    filteredRecent,
    // Charts
    dailyActivityOption,
    modelDonutOption,
    modelBarOption,
    sessionsTrendOption,
    messagesTrendOption,
    weeklyHeatmapOption,
    // Actions
    modelPercent,
    handleModelClick,
    handleDailyClick,
    clearModelFilter,
    pulseCard,
    fetchData,
    // Helpers
    formatNumber,
    formatDate,
    formatRelativeTime,
    modelColor,
  };
}
