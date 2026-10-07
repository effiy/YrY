import { ref, computed, onMounted, onUnmounted } from "vue";
import { getKnowledgeStats } from "@/api/modules/dashboard";
import type {
  KnowledgeStatsData,
  KnowledgeFileSummary,
  KnowledgeModuleStats
} from "@/api/interface/yiAi";

const POLL_MS = 60_000;
const REVIEW_CYCLE_DAYS: Record<string, number> = {
  weekly: 7, monthly: 30, quarterly: 90, "half-yearly": 180, yearly: 365
};

export interface ReviewQueueItem {
  path: string;
  title: string;
  category: string;
  module: string;
  review_cycle: string;
  updated: string;
  daysOverdue: number;
  status: string;
  lifecycle: string;
}

export function useCuratorStats() {
  const stats = ref<KnowledgeStatsData | null>(null);
  const loading = ref(false);
  const error = ref("");
  const lastUpdated = ref<number>(0);
  const selectedCategory = ref("");

  const health = computed(() => stats.value?.health ?? { tacit_count: 0, stale_count: 0, no_review_cycle_count: 0, review_coverage_pct: 0 });
  const dataQuality = computed(() => stats.value?.data_quality ?? { total: 0, no_status: 0, no_type: 0, no_lifecycle: 0, no_review_cycle: 0, no_roles: 0, no_tags: 0, no_benefit: 0, no_title: 0, complete: 0 });

  const allFiles = computed<KnowledgeFileSummary[]>(() => {
    if (!stats.value) return [];
    return stats.value.files;
  });

  const filteredFiles = computed(() => {
    if (!selectedCategory.value) return allFiles.value;
    return allFiles.value.filter(f => f.category === selectedCategory.value);
  });

  const allModules = computed<KnowledgeModuleStats[]>(() => {
    if (!stats.value) return [];
    return stats.value.modules;
  });

  const categories = computed(() => {
    if (!stats.value) return [];
    return stats.value.categories;
  });

  const statusDistribution = computed(() => stats.value?.statuses ?? []);
  const lifecycleDistribution = computed(() => stats.value?.lifecycles ?? []);
  const typeDistribution = computed(() => stats.value?.types ?? []);
  const reviewCycleDistribution = computed(() => stats.value?.review_cycles ?? []);
  const roleDistribution = computed(() => stats.value?.roles ?? []);

  const recentFiles = computed(() => stats.value?.recent ?? []);

  const reviewQueue = computed<ReviewQueueItem[]>(() => {
    const now = Date.now();
    return allFiles.value
      .filter(f => {
        if (!f.review_cycle || !f.updated) return false;
        const maxDays = REVIEW_CYCLE_DAYS[f.review_cycle];
        if (!maxDays) return false;
        try {
          const d = new Date(f.updated);
          if (isNaN(d.getTime())) return false;
          return (now - d.getTime()) / 86400000 > maxDays;
        } catch { return false; }
      })
      .map(f => {
        const maxDays = REVIEW_CYCLE_DAYS[f.review_cycle] || 90;
        const updated = new Date(f.updated).getTime();
        const daysOverdue = Math.floor((now - updated) / 86400000) - maxDays;
        return {
          path: f.path,
          title: f.title || f.path.split("/").pop() || "",
          category: f.category,
          module: f.module,
          review_cycle: f.review_cycle,
          updated: f.updated,
          daysOverdue,
          status: f.status,
          lifecycle: f.lifecycle
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 15);
  });

  const qualityScore = computed(() => {
    const dq = dataQuality.value;
    if (!dq.total) return 0;
    const fields = 8; // status, type, lifecycle, review_cycle, roles, tags, benefit, title
    const missing = dq.no_status + dq.no_type + dq.no_lifecycle + dq.no_review_cycle + dq.no_roles + dq.no_tags + dq.no_benefit + dq.no_title;
    return Math.round(((dq.total * fields - missing) / (dq.total * fields)) * 100);
  });

  const dataAge = computed(() => {
    if (!lastUpdated.value) return Infinity;
    return Math.floor((Date.now() - lastUpdated.value) / 1000);
  });

  let timer: ReturnType<typeof setInterval> | null = null;

  async function load() {
    loading.value = true;
    error.value = "";
    try {
      const res = await getKnowledgeStats();
      stats.value = res.data;
      lastUpdated.value = Date.now();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load knowledge stats";
    } finally {
      loading.value = false;
    }
  }

  function setCategory(cat: string) {
    selectedCategory.value = cat;
  }

  onMounted(() => {
    load();
    timer = setInterval(load, POLL_MS);
  });

  onUnmounted(() => {
    if (timer !== null) clearInterval(timer);
  });

  return {
    stats, loading, error, lastUpdated, selectedCategory, dataAge,
    health, dataQuality, qualityScore,
    allFiles, filteredFiles,
    allModules, categories,
    statusDistribution, lifecycleDistribution, typeDistribution,
    reviewCycleDistribution, roleDistribution,
    recentFiles, reviewQueue,
    load, setCategory
  };
}