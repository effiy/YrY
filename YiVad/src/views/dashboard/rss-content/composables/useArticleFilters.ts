import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { RssListParams } from "@/api/modules/rssService";

export function useArticleFilters(
  reloadArticles: (params?: Partial<RssListParams>) => Promise<void>,
  filterDateLabel: ComputedRef<string>,
  filterDateStr: ComputedRef<string>
) {
  const search = ref("");
  const sourceFilter = ref<string[]>([]);
  const categoryFilter = ref("");
  const tagFilter = ref("");
  const orderType = ref<"asc" | "desc">("desc");

  function applyFilters() {
    const params: Partial<RssListParams> = { orderBy: "published_parsed", orderType: orderType.value };
    if (search.value.trim()) params.search = search.value.trim();
    if (sourceFilter.value.length) params.source_name = sourceFilter.value;
    if (categoryFilter.value) params.category_path = categoryFilter.value;
    if (tagFilter.value) params.tags = [tagFilter.value];
    reloadArticles(params);
  }

  function onSourceFilterChange(v: string[]) {
    sourceFilter.value = v;
    applyFilters();
  }
  function onCategoryFilterChange(v: string) {
    categoryFilter.value = v;
    applyFilters();
  }
  function onSearchChange(v: string) {
    search.value = v;
    applyFilters();
  }

  function toggleSource(name: string) {
    const idx = sourceFilter.value.indexOf(name);
    if (idx >= 0) sourceFilter.value.splice(idx, 1);
    else sourceFilter.value.push(name);
    applyFilters();
  }

  function clearSourceFilter() {
    sourceFilter.value = [];
    applyFilters();
  }
  function onSelectAllSources(names: string[]) {
    sourceFilter.value = names;
    applyFilters();
  }
  function setCategoryFilter(name: string) {
    categoryFilter.value = name;
    applyFilters();
  }
  function setTagFilter(tag: string) {
    tagFilter.value = tag;
    applyFilters();
  }

  function clearFilter(key: string, clearDateFn: () => void) {
    if (key === "date") {
      clearDateFn();
      return;
    }
    if (key === "search") search.value = "";
    else if (key === "source") sourceFilter.value = [];
    else if (key === "category") categoryFilter.value = "";
    else if (key === "tag") tagFilter.value = "";
    applyFilters();
  }

  function clearAllFilters(clearDateFn: () => void) {
    clearDateFn();
    search.value = "";
    sourceFilter.value = [];
    categoryFilter.value = "";
    tagFilter.value = "";
    applyFilters();
  }

  function onSortChange(order: "asc" | "desc") {
    orderType.value = order;
    reloadArticles({ orderBy: "published_parsed", orderType: order });
  }

  interface ActiveFilter {
    key: string;
    label: string;
    type: "primary" | "success" | "warning" | "info" | "danger";
  }

  const activeFilters = computed<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    if (filterDateStr.value) list.push({ key: "date", label: `Date: ${filterDateLabel.value}`, type: "danger" });
    if (search.value) list.push({ key: "search", label: `Search: ${search.value}`, type: "info" });
    if (sourceFilter.value.length)
      list.push({ key: "source", label: `Sources: ${sourceFilter.value.join(", ")}`, type: "primary" });
    if (categoryFilter.value) list.push({ key: "category", label: `Category: ${categoryFilter.value}`, type: "success" });
    if (tagFilter.value) list.push({ key: "tag", label: `Tag: ${tagFilter.value}`, type: "warning" });
    return list;
  });

  return {
    search,
    sourceFilter,
    categoryFilter,
    tagFilter,
    orderType,
    activeFilters,
    onSourceFilterChange,
    onCategoryFilterChange,
    onSearchChange,
    toggleSource,
    clearSourceFilter,
    onSelectAllSources,
    setCategoryFilter,
    setTagFilter,
    clearFilter,
    clearAllFilters,
    onSortChange
  };
}
