/**
 * RSS store — reactive state container for seeds, scheduler, and parsed items.
 *
 * Items are fetched via ProTable's requestApi (getRssList); this store holds
 * seeds and scheduler status shared across the RSS page and its sub-components.
 *
 * UI feedback (ElMessage, i18n) lives in the page component, not here.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getRssList,
  getSeedList,
  createSeed,
  updateSeed,
  deleteSeed,
  parseFeed,
  parseAllEnabledFeeds,
  startRssScheduler,
  stopRssScheduler,
  setRssSchedulerConfig,
  getRssSchedulerStatus
} from "@/api/modules/rssService";
import type {
  RssItemDocument,
  RssSeedDocument,
  RssParseResult,
  RssSchedulerStatus
} from "@/api/modules/rssService";

export const useRssStore = defineStore("yivad-rss", () => {
  // ── Seeds ──
  const seeds = ref<RssSeedDocument[]>([]);
  const seedsLoading = ref(false);

  // ── Scheduler ──
  const schedulerStatus = ref<RssSchedulerStatus | null>(null);
  const schedulerLoading = ref(false);
  const parsing = ref(false);

  // ── Seed counts (items per source) ──
  const seedCounts = ref<Record<string, number>>({});

  // ── Derived ──
  const sourceOptions = computed(() => {
    const set = new Set<string>();
    for (const s of seeds.value) if (s.name) set.add(s.name);
    return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  const categoryOptions = computed(() => {
    const set = new Set<string>();
    for (const s of seeds.value) if (s.category) set.add(s.category);
    return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
  });

  // ── Seeds ──

  async function fetchSeeds() {
    seedsLoading.value = true;
    try {
      const res = await getSeedList({ pageSize: 200 });
      seeds.value = res.data?.list ?? [];
      // Derive seed counts from a lightweight items query
      try {
        const itemsRes = await getRssList({ pageSize: 200 });
        const counts: Record<string, number> = {};
        for (const it of itemsRes.data?.list ?? []) {
          const s = it.source_name;
          if (!s) continue;
          counts[s] = (counts[s] ?? 0) + 1;
        }
        seedCounts.value = counts;
      } catch {
        seedCounts.value = {};
      }
    } catch {
      seeds.value = [];
      seedCounts.value = {};
    } finally {
      seedsLoading.value = false;
    }
  }

  async function addSeed(input: Partial<RssSeedDocument> & { parseImmediately?: boolean }) {
    if (!input.url) throw new Error("URL is required");
    const key = `seed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await createSeed({
      key,
      url: input.url,
      name: input.name?.trim() || input.url,
      enabled: input.enabled ?? true,
      category: input.category?.trim() || undefined,
      tags: input.tags ?? [],
      interval: input.interval
    });
    await fetchSeeds();
    return key;
  }

  async function editSeed(key: string, patch: Partial<RssSeedDocument>) {
    await updateSeed(key, patch);
    await fetchSeeds();
  }

  async function removeSeed(key: string) {
    await deleteSeed(key);
    await fetchSeeds();
  }

  async function toggleSeedEnabled(seed: RssSeedDocument) {
    if (!seed.key) return;
    const next = !(seed.enabled ?? true);
    await updateSeed(seed.key, { enabled: next });
    await fetchSeeds();
  }

  // ── Scheduler ──

  async function fetchSchedulerStatus() {
    try {
      const res = await getRssSchedulerStatus();
      if (res.code === 0) schedulerStatus.value = res.data;
    } catch { /* silent */ }
  }

  async function fetchSchedulerStatusManual() {
    schedulerLoading.value = true;
    await fetchSchedulerStatus();
    schedulerLoading.value = false;
  }

  async function startScheduler() {
    await startRssScheduler();
    await fetchSchedulerStatus();
  }

  async function stopScheduler() {
    await stopRssScheduler();
    await fetchSchedulerStatus();
  }

  async function updateSchedulerConfig(config: Record<string, any>) {
    await setRssSchedulerConfig(config);
    await fetchSchedulerStatus();
  }

  // ── Parse ──

  async function parseOne(url: string, name?: string): Promise<RssParseResult> {
    parsing.value = true;
    try {
      const res = await parseFeed(url, name);
      return res.data || ({} as RssParseResult);
    } finally {
      parsing.value = false;
    }
  }

  async function parseAll(): Promise<RssParseResult> {
    parsing.value = true;
    try {
      const res = await parseAllEnabledFeeds();
      return res.data || ({} as RssParseResult);
    } finally {
      parsing.value = false;
    }
  }

  return {
    seeds,
    seedsLoading,
    schedulerStatus,
    schedulerLoading,
    parsing,
    seedCounts,
    sourceOptions,
    categoryOptions,
    fetchSeeds,
    addSeed,
    editSeed,
    removeSeed,
    toggleSeedEnabled,
    fetchSchedulerStatus,
    fetchSchedulerStatusManual,
    startScheduler,
    stopScheduler,
    updateSchedulerConfig,
    parseOne,
    parseAll
  };
});