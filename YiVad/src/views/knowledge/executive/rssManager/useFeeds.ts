import { ref, reactive, computed, watch, type Ref } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  getSeedList,
  createSeed,
  updateSeed,
  deleteSeed,
  getRssList,
  parseFeed,
  parseAllEnabledFeeds,
  type RssSeedDocument
} from "@/api/modules/rssService";
import { RssItemDocument } from "@/api/modules/rssService";
import { loadBool, saveBool } from "@/utils/storage";
import { nanoid } from "nanoid";
import { EXAMPLE_SEEDS } from "@/views/knowledge/executive/data/rssSeedData";
import { useFormatting } from "./useFormatting";

const SEEDS_SEEDED_KEY = "yivad.rss.seedsSeeded";

/**
 * Feeds composable — owns all seed/feed CRUD state and methods.
 * Accepts selectedRoles for filtering.
 */
export function useFeeds(selectedRoles: Ref<string[]>) {
  const { t, errorMessage, formatTime, formatTimeAgo, formatInterval, subCategory, roleFromCategory } = useFormatting();

  // ── Seeds state ──
  const seeds = ref<RssSeedDocument[]>([]);
  const seedsLoading = ref(false);
  const seedSearch = ref("");
  const parsingSeed = ref("");
  const seedToggling = ref("");
  const parseTimes = reactive<Record<string, number>>({});
  const seedIntervals = reactive<Record<string, number>>({});
  const seedArticleCounts = reactive<Record<string, number>>({});
  const parseAllLoading = ref(false);

  // ── Computed ──
  const feedsCount = computed(() => {
    if (!selectedRoles.value.length) return seeds.value.length;
    return seeds.value.filter(s => selectedRoles.value.includes(roleFromCategory(s.category))).length;
  });

  const filteredSeeds = computed(() => {
    let list = seeds.value;
    if (seedSearch.value) {
      const q = seedSearch.value.toLowerCase();
      list = list.filter(s => (s.name || "").toLowerCase().includes(q) || (s.url || "").toLowerCase().includes(q));
    }
    if (selectedRoles.value.length) {
      list = list.filter(s => selectedRoles.value.includes(roleFromCategory(s.category)));
    }
    return list;
  });

  const seedOptions = computed(() => {
    const roleSet = selectedRoles.value.length ? new Set(selectedRoles.value) : null;
    return seeds.value
      .filter(s => s.name && (!roleSet || roleSet.has(roleFromCategory(s.category))))
      .map(s => ({ label: s.name!, value: s.name! }));
  });

  // ── Seed dialog ──
  const seedDialogVisible = ref(false);
  const editingSeed = ref<RssSeedDocument | null>(null);
  const seedSaving = ref(false);
  const seedForm = reactive<{ url: string; name: string; category: string; interval: number; enabled: boolean }>({
    url: "",
    name: "",
    category: "",
    interval: 0,
    enabled: true
  });

  function openSeedDialog(row?: RssSeedDocument) {
    editingSeed.value = row || null;
    if (row) {
      seedForm.url = row.url || "";
      seedForm.name = row.name || "";
      seedForm.category = row.category || "";
      seedForm.interval = seedIntervals[row.url] || 0;
      seedForm.enabled = row.enabled !== false;
    } else {
      seedForm.url = "";
      seedForm.name = "";
      seedForm.category = "";
      seedForm.interval = 0;
      seedForm.enabled = true;
    }
    seedDialogVisible.value = true;
  }

  async function saveSeed() {
    if (!seedForm.url.trim()) {
      ElMessage.warning(t("rss.manager.seeds.save.urlRequired"));
      return;
    }
    seedSaving.value = true;
    try {
      const patch: Partial<RssSeedDocument> & { url: string } = {
        url: seedForm.url.trim(),
        name: seedForm.name.trim(),
        category: seedForm.category.trim() || undefined,
        enabled: seedForm.enabled
      };
      if (seedForm.interval > 0) patch.interval = seedForm.interval;
      else patch.interval = undefined;

      if (editingSeed.value?.key) {
        await updateSeed(editingSeed.value.key, patch);
        ElMessage.success(t("rss.manager.seeds.save.updateOk"));
      } else {
        const key = `seed_${Date.now()}_${nanoid(8)}`;
        await createSeed({ key, ...patch });
        ElMessage.success(t("rss.manager.seeds.save.addOk"));
      }
      seedDialogVisible.value = false;
      await loadSeeds();
      loadSeedArticleCounts();
    } catch (e) {
      ElMessage.error(errorMessage(e) || t("rss.manager.seeds.save.fail"));
    } finally {
      seedSaving.value = false;
    }
  }

  async function removeSeed(row: RssSeedDocument) {
    if (!row.key) return;
    try {
      await deleteSeed(row.key);
      ElMessage.success(t("rss.manager.seeds.remove.ok"));
      await loadSeeds();
      loadSeedArticleCounts();
    } catch (e) {
      ElMessage.error(errorMessage(e) || t("rss.manager.seeds.remove.fail"));
    }
  }

  async function toggleSeed(row: RssSeedDocument) {
    if (!row.key) return;
    seedToggling.value = row.key;
    try {
      const next = row.enabled === false;
      await updateSeed(row.key, { enabled: next });
      row.enabled = next;
      ElMessage.success(next ? t("rss.manager.seeds.toggle.enabled") : t("rss.manager.seeds.toggle.disabled"));
    } catch (e) {
      ElMessage.error(errorMessage(e) || t("rss.manager.seeds.toggle.fail"));
    } finally {
      seedToggling.value = "";
    }
  }

  async function parseOneFeed(row: RssSeedDocument) {
    parsingSeed.value = row.url;
    try {
      const res = await parseFeed(row.url, row.name);
      const d = res.data;
      parseTimes[row.url] = Date.now();
      ElMessage.success(t("rss.manager.seeds.parseOne.ok", { saved: d.saved_count || 0, updated: d.updated_count || 0 }));
      return true; // signal parent to reload items/today
    } catch (e) {
      const msg = errorMessage(e) || t("rss.manager.seeds.parseOne.fail");
      ElMessage.error(msg);
      return false;
    } finally {
      parsingSeed.value = "";
    }
  }

  async function parseAllFeeds() {
    parseAllLoading.value = true;
    try {
      const res = await parseAllEnabledFeeds();
      const d = res.data;
      ElMessage.success(t("rss.manager.seeds.parseAll.ok", { total: d.total_sources, ok: d.success_count, fail: d.failed_count }));
      const now = Date.now();
      for (const s of seeds.value) {
        if (s.enabled !== false) parseTimes[s.url] = now;
      }
      return true;
    } catch (e) {
      const msg = errorMessage(e) || t("rss.manager.seeds.parseAll.fail");
      ElMessage.error(msg);
      return false;
    } finally {
      parseAllLoading.value = false;
    }
  }

  // ── Seed example seeding ──
  async function seedExampleSeeds(): Promise<RssSeedDocument[]> {
    const out: RssSeedDocument[] = [];
    for (const s of EXAMPLE_SEEDS) {
      try {
        await createSeed({ key: s.key, url: s.url, name: s.name, category: s.category, enabled: s.enabled });
        out.push(s);
      } catch {
        /* skip duplicates */
      }
    }
    return out;
  }

  async function ensureExampleSeeds(existing: RssSeedDocument[]): Promise<RssSeedDocument[]> {
    const existingKeys = new Set(existing.map(s => s.key).filter(Boolean));
    const missing = EXAMPLE_SEEDS.filter(s => !existingKeys.has(s.key));
    if (!missing.length) return [];
    const added: RssSeedDocument[] = [];
    for (const s of missing) {
      try {
        await createSeed({ key: s.key, url: s.url, name: s.name, category: s.category, enabled: s.enabled });
        added.push(s);
      } catch {
        /* skip */
      }
    }
    return added;
  }

  async function loadSeeds() {
    seedsLoading.value = true;
    try {
      const res = await getSeedList();
      const list = res.data?.list ?? [];
      if (list.length) {
        seeds.value = list;
        saveBool(SEEDS_SEEDED_KEY, true);
        const added = await ensureExampleSeeds(list);
        if (added.length) {
          seeds.value = [...list, ...added];
          ElMessage.success(t("rss.manager.seeds.added", { n: added.length }));
        }
      } else if (!loadBool(SEEDS_SEEDED_KEY, false)) {
        const seeded = await seedExampleSeeds();
        seeds.value = seeded;
        if (seeded.length) saveBool(SEEDS_SEEDED_KEY, true);
      } else {
        seeds.value = [];
      }
      for (const s of seeds.value) {
        if (s.interval) seedIntervals[s.url] = s.interval;
      }
    } catch {
      seeds.value = [];
    } finally {
      seedsLoading.value = false;
    }
  }

  function loadSeedArticleCounts() {
    for (const s of seeds.value) {
      getRssList({ source_url: s.url, pageSize: 1 })
        .then(res => {
          seedArticleCounts[s.url] = res.data?.total ?? 0;
        })
        .catch(() => {
          seedArticleCounts[s.url] = 0;
        });
    }
  }

  // ── Quick parse ──
  const quickParseVisible = ref(false);
  const quickParseLoading = ref(false);
  const quickParseForm = reactive({ url: "", name: "" });

  async function doQuickParse() {
    if (!quickParseForm.url.trim()) {
      ElMessage.warning(t("rss.manager.seeds.quickParse.urlRequired"));
      return false;
    }
    quickParseLoading.value = true;
    try {
      const res = await parseFeed(quickParseForm.url.trim(), quickParseForm.name.trim() || undefined);
      const d = res.data;
      ElMessage.success(t("rss.manager.seeds.quickParse.ok", { saved: d.saved_count || 0, updated: d.updated_count || 0 }));
      quickParseVisible.value = false;
      quickParseForm.url = "";
      quickParseForm.name = "";
      return true;
    } catch (e) {
      ElMessage.error(errorMessage(e) || t("rss.manager.seeds.quickParse.fail"));
      return false;
    } finally {
      quickParseLoading.value = false;
    }
  }

  // ── Category groups for seed dialog ──
  const categoryGroups = computed(() => [
    {
      label: t("rss.manager.categories.groups.executive"),
      options: [
        { label: t("rss.manager.categories.options.executive.industry"), value: "executive/industry" },
        { label: t("rss.manager.categories.options.executive.strategy"), value: "executive/strategy" },
        { label: t("rss.manager.categories.options.executive.roadmap"), value: "executive/roadmap" },
        { label: t("rss.manager.categories.options.executive.readingList"), value: "executive/reading-list" }
      ]
    },
    {
      label: t("rss.manager.categories.groups.aier"),
      options: [
        { label: t("rss.manager.categories.options.aier.methodology"), value: "aier/methodology" },
        { label: t("rss.manager.categories.options.aier.foundations"), value: "aier/foundations" }
      ]
    },
    {
      label: t("rss.manager.categories.groups.engineer"),
      options: [
        { label: t("rss.manager.categories.options.engineer.ship"), value: "engineer/ship" },
        { label: t("rss.manager.categories.options.engineer.learnLessons"), value: "engineer/learn/lessons" },
        { label: t("rss.manager.categories.options.engineer.learnWins"), value: "engineer/learn/lessons/wins" },
        { label: t("rss.manager.categories.options.engineer.learnFailures"), value: "engineer/learn/lessons/failures" }
      ]
    },
    {
      label: t("rss.manager.categories.groups.sre"),
      options: [{ label: t("rss.manager.categories.options.sre.release"), value: "sre/release" }]
    },
    {
      label: t("rss.manager.categories.groups.product"),
      options: [{ label: t("rss.manager.categories.options.product.frameworks"), value: "product/frameworks" }]
    },
    {
      label: t("rss.manager.categories.groups.curator"),
      options: [{ label: t("rss.manager.categories.options.curator.templates"), value: "curator/templates" }]
    },
    {
      label: t("rss.manager.categories.groups.leader"),
      options: [
        { label: t("rss.manager.categories.options.leader.leadership"), value: "leader/leadership" },
        { label: t("rss.manager.categories.options.leader.architecture"), value: "leader/architecture" }
      ]
    }
  ]);

  return {
    // state
    seeds,
    seedsLoading,
    seedSearch,
    parsingSeed,
    seedToggling,
    parseTimes,
    seedIntervals,
    seedArticleCounts,
    parseAllLoading,
    // computed
    feedsCount,
    filteredSeeds,
    seedOptions,
    // seed dialog
    seedDialogVisible,
    editingSeed,
    seedSaving,
    seedForm,
    openSeedDialog,
    saveSeed,
    removeSeed,
    toggleSeed,
    // parse
    parseOneFeed,
    parseAllFeeds,
    // load
    loadSeeds,
    loadSeedArticleCounts,
    // quick parse
    quickParseVisible,
    quickParseLoading,
    quickParseForm,
    doQuickParse,
    // category groups
    categoryGroups,
    // formatting (re-exported for template use)
    formatTime,
    formatTimeAgo,
    formatInterval,
    subCategory
  };
}