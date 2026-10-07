/**
 * Knowledge base search composable — content search, suggestions, and search mode.
 */
import { ref, computed, type Ref } from "vue";
import { searchKnowledge } from "@/api/modules/dashboard";
import type { KnowledgeStatsData, KnowledgeFileSummary } from "@/api/interface/yiAi";

export function useKnowledgeSearch(
  knowledgeData: Ref<KnowledgeStatsData | null>,
  activeFilter: Ref<Record<string, string>>
) {
  const searchText = ref("");
  const searchMode = ref<"title" | "content">("title");
  const contentSearchResults = ref<{ path: string; title: string; snippet: string; size: number }[]>([]);
  const contentSearchLoading = ref(false);
  const showSearchSuggestions = ref(false);
  const browseAllFiles = ref(false);

  /** Enrich server-side content search results with client-side file metadata. */
  const enrichedSearchResults = computed(() => {
    const fileMap = new Map<string, KnowledgeFileSummary>();
    for (const f of knowledgeData.value?.files ?? []) fileMap.set(f.path, f);
    return contentSearchResults.value.map(r => {
      const file = fileMap.get(r.path);
      return {
        ...r,
        category: file?.category,
        module: file?.module,
        sub_module: file?.sub_module,
        status: file?.status,
        lifecycle: file?.lifecycle,
        type: file?.type
      };
    });
  });

  /** Title-based search suggestions (local, debounced by typing). */
  const searchSuggestions = computed(() => {
    if (!searchText.value || searchText.value.length < 2 || searchMode.value !== "title") return [];
    const q = searchText.value.toLowerCase();
    return (knowledgeData.value?.files ?? [])
      .filter(f => f.title.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
      .slice(0, 8);
  });

  /** Full-text content search via server-side RAG index. */
  async function doContentSearch() {
    if (!searchText.value || searchText.value.length < 2) {
      contentSearchResults.value = [];
      return;
    }
    contentSearchLoading.value = true;
    try {
      const res = await searchKnowledge(searchText.value, activeFilter.value.category, 50);
      contentSearchResults.value = res.data.results;
      browseAllFiles.value = false;
    } finally {
      contentSearchLoading.value = false;
    }
  }

  let contentSearchTimer: ReturnType<typeof setTimeout> | null = null;

  /** Debounced search input handler for content search mode. */
  function onSearchInput() {
    if (searchMode.value === "content") {
      if (contentSearchTimer) clearTimeout(contentSearchTimer);
      contentSearchTimer = setTimeout(() => doContentSearch(), 300);
    }
  }

  return {
    searchText,
    searchMode,
    contentSearchResults,
    contentSearchLoading,
    showSearchSuggestions,
    browseAllFiles,
    enrichedSearchResults,
    searchSuggestions,
    doContentSearch,
    onSearchInput
  };
}