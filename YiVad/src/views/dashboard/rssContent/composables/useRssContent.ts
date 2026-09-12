import { ref, computed, watch, type Ref, type ComputedRef } from "vue";
import { getRssStats } from "@/api/modules/dashboard";
import { getRssList, type RssItemDocument, type RssListParams } from "@/api/modules/rssService";
import { useDateFilter } from "@/hooks/useDateFilter";
import type { RssStatsData } from "@/api/interface/yiAi";

export interface RssContentData {
  stats: Ref<RssStatsData | null>;
  statsLoading: Ref<boolean>;
  statsError: Ref<string | null>;
  articles: Ref<RssItemDocument[]>;
  articlesTotal: Ref<number>;
  articlesLoading: Ref<boolean>;
  articlesError: Ref<string | null>;
  /** Combined loading: true when either stats or articles are loading */
  loading: ComputedRef<boolean>;
  /** Combined error: first non-null error from stats or articles */
  error: ComputedRef<string | null>;
  /** Date filter state */
  filterDate: Ref<Date | null>;
  filterDateLabel: ComputedRef<string>;
  isFilterToday: ComputedRef<boolean>;
  filterDateStr: ComputedRef<string>;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  goToFilterToday: () => void;
  clearFilterDate: () => void;
  /** Retry: reload both stats and articles */
  retry: () => Promise<void>;
  /** Reload articles only (after filter change) */
  reloadArticles: (params?: Partial<RssListParams>) => Promise<void>;
}

export function useRssContent(): RssContentData {
  // ── Stats state ──
  const stats = ref<RssStatsData | null>(null);
  const statsLoading = ref(true);
  const statsError = ref<string | null>(null);

  // ── Articles state ──
  const articles = ref<RssItemDocument[]>([]);
  const articlesTotal = ref(0);
  const articlesLoading = ref(false);
  const articlesError = ref<string | null>(null);

  // ── Date filter ──
  const filterDate = ref<Date | null>(null);
  const { label, isToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } =
    useDateFilter(filterDate);

  // ── Derived ──
  const loading = computed(() => statsLoading.value || articlesLoading.value);
  const error = computed(() => statsError.value || articlesError.value);

  function currentDateRange(): { start?: number; end?: number } {
    if (filterDateStr.value) {
      const d = new Date(filterDateStr.value);
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      d.setHours(23, 59, 59, 999);
      return { start, end: d.getTime() };
    }
    return {};
  }

  async function fetchStats() {
    statsLoading.value = true;
    statsError.value = null;
    try {
      const { start, end } = currentDateRange();
      const res = await getRssStats({ start, end });
      stats.value = res.data;
    } catch (e: unknown) {
      statsError.value = e instanceof Error ? e.message : "Failed to load RSS stats";
    } finally {
      statsLoading.value = false;
    }
  }

  async function fetchArticles(params: Partial<RssListParams> = {}) {
    articlesLoading.value = true;
    articlesError.value = null;
    try {
      const queryParams: RssListParams = {
        pageNum: 1,
        pageSize: 600,
        orderBy: "published_parsed",
        orderType: "desc",
        ...params,
      };
      const range = currentDateRange();
      if (range.start !== undefined) queryParams.publishedStart = range.start;
      if (range.end !== undefined) queryParams.publishedEnd = range.end;

      const res = await getRssList(queryParams);
      articles.value = (res.data?.list as RssItemDocument[]) ?? [];
      articlesTotal.value = res.data?.total ?? 0;
    } catch (e: unknown) {
      articlesError.value = e instanceof Error ? e.message : "Failed to load articles";
      articles.value = [];
      articlesTotal.value = 0;
    } finally {
      articlesLoading.value = false;
    }
  }

  async function retry() {
    await Promise.all([fetchStats(), fetchArticles()]);
  }

  async function reloadArticles(params?: Partial<RssListParams>) {
    await fetchArticles(params);
  }

  // Reload on date filter change
  watch(filterDateStr, () => {
    Promise.all([fetchStats(), fetchArticles()]);
  });

  return {
    stats,
    statsLoading,
    statsError,
    articles,
    articlesTotal,
    articlesLoading,
    articlesError,
    loading,
    error,
    filterDate,
    filterDateLabel: label,
    isFilterToday: isToday,
    filterDateStr,
    goToPrevDay,
    goToNextDay,
    goToFilterToday,
    clearFilterDate,
    retry,
    reloadArticles,
  };
}