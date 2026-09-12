import { ref } from "vue";
import { fuzzySearch } from "@/utils/fuzzySearch";
import type { SearchResult } from "@/components/CommandPalette/types";

const HISTORY_KEY = "yivad_search_history";
const MAX_HISTORY = 20;

export function useSearchHistory() {
  const recentSearches = ref<string[]>(loadHistory());

  function loadHistory(): string[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function addToHistory(query: string) {
    if (!query.trim()) return;
    const filtered = recentSearches.value.filter((s) => s !== query);
    filtered.unshift(query);
    if (filtered.length > MAX_HISTORY) filtered.pop();
    recentSearches.value = filtered;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  }

  function clearHistory() {
    recentSearches.value = [];
    localStorage.removeItem(HISTORY_KEY);
  }

  return { recentSearches, addToHistory, clearHistory };
}

export function useCommandSearch() {
  const results = ref<SearchResult[]>([]);
  const isSearching = ref(false);

  async function search(query: string): Promise<void> {
    if (!query.trim()) {
      results.value = [];
      return;
    }

    isSearching.value = true;
    try {
      const index = await getSearchIndex();
      results.value = fuzzySearch(index, query, {
        keys: [
          { name: "title", weight: 1 },
          { name: "description", weight: 2 },
        ],
        threshold: 0.6,
      }).map((r) => r.item);
    } catch {
      results.value = [];
    } finally {
      isSearching.value = false;
    }
  }

  return { search, results, isSearching };
}

let cachedIndex: SearchResult[] | null = null;

async function getSearchIndex(): Promise<SearchResult[]> {
  if (cachedIndex) return cachedIndex;
  try {
    const { buildSearchIndex } = await import("@/services/searchIndex");
    cachedIndex = await buildSearchIndex();
    return cachedIndex ?? [];
  } catch {
    return [];
  }
}