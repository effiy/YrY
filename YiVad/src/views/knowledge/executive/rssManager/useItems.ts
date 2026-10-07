import { ref, computed, type Ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  getRssList,
  deleteRssItem as deleteRssItemApi,
  type RssItemDocument,
  type RssListParams
} from "@/api/modules/rssService";
import { loadJson, saveJson } from "@/utils/storage";
import { useFormatting } from "./useFormatting";

const RECENT_ARTICLES_KEY = "rss.recentArticles";
const MAX_RECENT_ARTICLES = 8;

/**
 * Items composable — owns all article CRUD, filtering, pagination state.
 * Needs external `seeds` ref (from useFeeds) for category/seed option computation.
 */
export function useItems(selectedRoles: Ref<string[]>, seeds: Ref<any[]>) {
  const { t, localeTag, subCategory, roleFromCategory, errorMessage, trimSummary, formatDate, formatRelativeTime } =
    useFormatting();

  // ── Items state ──
  const items = ref<RssItemDocument[]>([]);
  const itemsLoading = ref(false);
  const itemSearch = ref("");
  const itemCategoryFilter = ref("");
  const itemSourceFilter = ref("");
  const itemDateRange = ref<[string, string] | null>(null);
  const timePreset = ref<"all" | "today" | "week" | "month" | "">("all");
  const itemSortKey = ref("published_parsed");
  const itemPage = ref(1);
  const itemPageSize = 20;
  const totalItems = ref(0);
  const selectedItems = ref<RssItemDocument[]>([]);
  const exportingItems = ref(false);

  // ── Sub-category options ──
  const categoryOptions = computed(() => {
    const roleSet = selectedRoles.value.length ? new Set(selectedRoles.value) : null;
    const seen = new Set<string>();
    const opts: { label: string; value: string; icon: string }[] = [];
    for (const s of seeds.value) {
      const cat = s.category || "";
      if (!cat || !cat.includes("/")) continue;
      const rid = roleFromCategory(cat);
      if (roleSet && !roleSet.has(rid)) continue;
      if (seen.has(cat)) continue;
      seen.add(cat);
      const sub = cat.slice(rid.length + 1);
      opts.push({ label: sub, value: cat, icon: "\uD83D\uDCC1" });
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  });

  const filteredItems = computed(() => {
    if (selectedRoles.value.length <= 1) return items.value;
    return items.value.filter(i => selectedRoles.value.includes(roleFromCategory(i.category_path)));
  });

  const hasActiveFilters = computed(
    () => !!(itemSearch.value || itemCategoryFilter.value || itemSourceFilter.value || itemDateRange.value)
  );

  // ── Selection ──
  function onSelectionChange(rows: RssItemDocument[]) {
    selectedItems.value = rows;
  }

  // ── Debounced filter change ──
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  function onItemFilterChange() {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      itemPage.value = 1;
      loadItems();
    }, 300);
  }

  function clearFilters() {
    itemSearch.value = "";
    itemCategoryFilter.value = "";
    itemSourceFilter.value = "";
    itemDateRange.value = null;
    timePreset.value = "all";
    itemSortKey.value = "published_parsed";
    itemPage.value = 1;
    loadItems();
  }

  function fmtDate(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function setTimePreset(preset: string | number | boolean | undefined) {
    const p = String(preset ?? "");
    if (p === "all") {
      itemDateRange.value = null;
    } else {
      const end = new Date();
      const start = new Date();
      if (p === "today") start.setDate(end.getDate());
      else if (p === "week") start.setDate(end.getDate() - 7);
      else start.setDate(end.getDate() - 30);
      itemDateRange.value = [fmtDate(start), fmtDate(end)];
    }
    itemPage.value = 1;
    loadItems();
  }

  function buildItemParams(pageNum: number, pageSize: number): RssListParams {
    const params: RssListParams = { pageNum, pageSize };
    if (itemSearch.value) params.search = itemSearch.value;
    if (itemCategoryFilter.value) {
      params.categoryPrefix = itemCategoryFilter.value;
    } else if (selectedRoles.value.length === 1) {
      params.categoryPrefix = selectedRoles.value[0];
    }
    if (itemSourceFilter.value) params.source_name = itemSourceFilter.value;
    if (itemDateRange.value?.length === 2) {
      params.publishedStart = new Date(itemDateRange.value[0]).getTime();
      params.publishedEnd = new Date(itemDateRange.value[1] + "T23:59:59").getTime();
    }
    const sk = itemSortKey.value;
    if (sk === "published_parsed-asc") {
      params.orderBy = "published_parsed";
      params.orderType = "asc";
    } else if (sk === "published_parsed") {
      params.orderBy = "published_parsed";
      params.orderType = "desc";
    } else {
      params.orderBy = sk;
      params.orderType = "asc";
    }
    return params;
  }

  async function loadItems() {
    itemsLoading.value = true;
    selectedItems.value = [];
    try {
      const res = await getRssList(buildItemParams(itemPage.value, itemPageSize));
      items.value = res.data?.list ?? [];
      totalItems.value = res.data?.total ?? 0;
    } catch {
      items.value = [];
      totalItems.value = 0;
    } finally {
      itemsLoading.value = false;
    }
  }

  async function exportItems() {
    exportingItems.value = true;
    try {
      const res = await getRssList(buildItemParams(1, 10000));
      const list = res.data?.list ?? [];
      if (!list.length) {
        ElMessage.info(t("rss.manager.items.export.noData"));
        return;
      }
      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const headers = ["title", "link", "source_name", "author", "category_path", "published", "summary"];
      const rows = list.map(i => headers.map(h => esc(i[h as keyof RssItemDocument])).join(","));
      const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rss-articles-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success(t("rss.manager.items.export.ok", { n: list.length }));
    } catch (e) {
      ElMessage.error(errorMessage(e) || t("rss.manager.items.export.fail"));
    } finally {
      exportingItems.value = false;
    }
  }

  // ── Recent articles ──
  const recentArticles = ref<RssItemDocument[]>(loadJson<RssItemDocument[]>(RECENT_ARTICLES_KEY, []));

  function addRecentArticle(row: RssItemDocument) {
    const id = row.key ?? row.link;
    recentArticles.value = [row, ...recentArticles.value.filter(a => (a.key ?? a.link) !== id)].slice(0, MAX_RECENT_ARTICLES);
    saveJson(RECENT_ARTICLES_KEY, recentArticles.value);
  }

  function clearRecentArticles() {
    recentArticles.value = [];
    saveJson(RECENT_ARTICLES_KEY, []);
  }

  // ── Row click ──
  function onArticleRowClick(row: RssItemDocument) {
    if (row.link) window.open(row.link, "_blank", "noopener,noreferrer");
    addRecentArticle(row);
  }

  // ── Delete ──
  async function removeItem(row: RssItemDocument) {
    if (!row.key) return;
    try {
      await deleteRssItemApi(row.key);
      ElMessage.success(t("rss.manager.items.delete.ok"));
      await loadItems();
      return true; // signal parent to reload todayCount
    } catch (e) {
      ElMessage.error(errorMessage(e) || t("rss.manager.items.delete.fail"));
      return false;
    }
  }

  async function removeBriefingItem(row: RssItemDocument) {
    if (!row.key) return;
    try {
      await deleteRssItemApi(row.key);
      ElMessage.success(t("rss.manager.items.delete.ok"));
      return true;
    } catch (e) {
      ElMessage.error(errorMessage(e) || t("rss.manager.items.delete.fail"));
      return false;
    }
  }

  async function batchDelete() {
    if (selectedItems.value.length === 0) return;
    try {
      await ElMessageBox.confirm(
        t("rss.manager.items.batch.confirm", { n: selectedItems.value.length }),
        t("rss.manager.items.batch.title"),
        {
          confirmButtonText: t("rss.manager.items.batch.deleteBtn"),
          cancelButtonText: t("rss.manager.common.cancel"),
          type: "warning"
        }
      );
    } catch {
      return;
    }
    let deleted = 0;
    for (const item of selectedItems.value) {
      if (!item.key) continue;
      try {
        await deleteRssItemApi(item.key);
        deleted++;
      } catch {
        /* skip */
      }
    }
    ElMessage.success(t("rss.manager.items.batch.ok", { n: deleted }));
    await loadItems();
    return true;
  }

  return {
    // items state
    items,
    itemsLoading,
    itemSearch,
    itemCategoryFilter,
    itemSourceFilter,
    itemDateRange,
    timePreset,
    itemSortKey,
    itemPage,
    itemPageSize,
    totalItems,
    selectedItems,
    exportingItems,
    // computed
    categoryOptions,
    filteredItems,
    hasActiveFilters,
    // methods
    onSelectionChange,
    onItemFilterChange,
    clearFilters,
    setTimePreset,
    buildItemParams,
    loadItems,
    exportItems,
    // recent
    recentArticles,
    addRecentArticle,
    clearRecentArticles,
    onArticleRowClick,
    // delete
    removeItem,
    removeBriefingItem,
    batchDelete,
    // formatting re-exports
    formatDate,
    formatRelativeTime,
    trimSummary,
    subCategory
  };
}