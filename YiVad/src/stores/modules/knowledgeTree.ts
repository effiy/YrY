/**
 * Knowledge tree store — YiKnowledge markdown tree state shared by aiChat
 * sidebar and AiChatBox drag-drop. Uses useKnowledgeFiles composable for
 * shared selectFile logic.
 *
 * Caching: knowledge tree data is cached in localStorage with a 5-minute TTL
 * to avoid repeated disk scans on every mount. The cache is updated in the
 * background (stale-while-revalidate).
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  scanKnowledge,
  listKnowledgeFiles,
  readKnowledgeFile,
  listKnowledgeStories,
  readKnowledgeStory
} from "@/api/modules/knowledgeService";
import { getSession, upsertSession, updateSession } from "@/api/modules/sessions";
import { useKnowledgeFiles } from "@/views/knowledge/composables/useKnowledgeFiles";
import type { KnowledgeFileEntry, KnowledgeReadResponse, KnowledgeStoryEntry, SessionDocument } from "@/api/interface/yiAi";

const CACHE_KEY = "yivad:knowledge-tree:v3";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  ts: number;
  cats: { category: string; files: KnowledgeFileEntry[] }[];
  stories: KnowledgeStoryEntry[];
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeCache(cats: { category: string; files: KnowledgeFileEntry[] }[], stories: KnowledgeStoryEntry[]) {
  try {
    const entry: CacheEntry = { ts: Date.now(), cats, stories };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

export const useKnowledgeTreeStore = defineStore("yivad-knowledge-tree", () => {
  const { currentFile, fileLoading, error: fileError, selectFile: _selectFile } = useKnowledgeFiles();

  const categories = ref<{ category: string; files: KnowledgeFileEntry[] }[]>([]);
  const stories = ref<KnowledgeStoryEntry[]>([]);
  const selectedPath = ref<string | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const expandedCategories = ref<Set<string>>(new Set());
  const searchQuery = ref("");

  const flatFiles = computed<KnowledgeFileEntry[]>(() => {
    const out: KnowledgeFileEntry[] = [];
    for (const c of categories.value) out.push(...c.files);
    return out;
  });

  const filteredCategories = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    const matchFile = (f: KnowledgeFileEntry) => {
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q) ||
        (f.meta?.title || "").toLowerCase().includes(q) ||
        (f.meta?.tags || []).some(t => String(t).toLowerCase().includes(q))
      );
    };
    return categories.value.map(c => ({ ...c, files: c.files.filter(matchFile) })).filter(c => c.files.length > 0);
  });

  function toggleCategory(cat: string) {
    const s = new Set(expandedCategories.value);
    if (s.has(cat)) s.delete(cat);
    else s.add(cat);
    expandedCategories.value = s;
  }

  function expandCategory(cat: string) {
    const s = new Set(expandedCategories.value);
    s.add(cat);
    expandedCategories.value = s;
  }

  async function loadAll() {
    // Stale-while-revalidate: return cached data immediately, refresh in background
    const cached = readCache();
    if (cached) {
      categories.value = cached.cats;
      stories.value = cached.stories;
      loading.value = false;
      // Refresh in background
      fetchFresh().catch(() => {});
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      await fetchFresh();
    } catch {
      /* fetchFresh handles errors internally */
    } finally {
      loading.value = false;
    }
  }

  async function fetchFresh() {
    error.value = null;

    // Fire all requests in parallel — main scan, RSS scan, stories
    const [mainResult, rssResult, storyResult] = await Promise.allSettled([
      scanKnowledge().catch(() => ({ categories: [] })),
      scanKnowledge("rss").catch(() => ({ categories: [] })),
      listKnowledgeStories()
        .then(r => r.stories ?? [])
        .catch(() => [] as KnowledgeStoryEntry[])
    ]);

    const mainCats = (mainResult.status === "fulfilled" ? mainResult.value : { categories: [] }).categories ?? [];
    const rssCats = (rssResult.status === "fulfilled" ? rssResult.value : { categories: [] }).categories ?? [];
    const cats = [...mainCats.map(c => ({ ...c, files: c.files })), ...rssCats.map(c => ({ ...c, files: c.files }))];
    const storyList = storyResult.status === "fulfilled" ? storyResult.value : [];

    if (cats.length) {
      categories.value = cats;
      stories.value = storyList;
      writeCache(cats, storyList);
    } else if (mainResult.status === "rejected") {
      // Only show error if the main scan failed (RSS + stories are optional)
      error.value = "Failed to load knowledge tree — server may be busy";
    }
  }

  async function fetchCategories(): Promise<{ category: string; files: KnowledgeFileEntry[] }[]> {
    // Fire main scan + RSS scan in parallel
    const [mainResult, rssResult] = await Promise.allSettled([
      scanKnowledge().catch(() => ({ categories: [] })),
      scanKnowledge("rss").catch(() => ({ categories: [] }))
    ]);

    const mainCats = (mainResult.status === "fulfilled" ? mainResult.value : { categories: [] }).categories ?? [];
    const rssCats = (rssResult.status === "fulfilled" ? rssResult.value : { categories: [] }).categories ?? [];
    const cats = [...mainCats.map(c => ({ ...c, files: c.files })), ...rssCats.map(c => ({ ...c, files: c.files }))];

    if (cats.length && cats.some(c => c.files.length > 0)) return cats;

    // Fall back to DB mirror
    try {
      const dbResult = await listKnowledgeFiles();
      if (dbResult.files?.length) {
        const grouped = new Map<string, KnowledgeFileEntry[]>();
        for (const f of dbResult.files) {
          const cat = f.category || "__root__";
          if (!grouped.has(cat)) grouped.set(cat, []);
          grouped.get(cat)!.push(f);
        }
        return [...grouped.entries()].map(([category, files]) => ({ category, files }));
      }
    } catch {
      console.warn("[knowledgeTree] DB mirror unavailable");
    }

    return [];
  }

  async function selectFile(path: string) {
    selectedPath.value = path;
    await _selectFile(path);
  }

  async function loadStoryMarkdown(project: string, storyName: string): Promise<KnowledgeReadResponse | null> {
    try {
      return await readKnowledgeStory(project, storyName);
    } catch {
      return null;
    }
  }

  async function ensureKnowledgeSession(path: string, content: string, meta?: { title?: string; tags?: string[] }) {
    if (!path) return;
    const title = meta?.title || path.split("/").pop() || path;
    const tags = (meta?.tags ?? path.split("/").slice(0, -1)).map(String);
    const now = Date.now();
    try {
      const existing = await getSession(path);
      if (existing) {
        if (content) await updateSession(path, { pageContent: content, updatedAt: now });
        return;
      }
      const fields: Partial<SessionDocument> & { key: string } = {
        key: path,
        url: `knowledge-session://${now}-${Math.random().toString(36).slice(2, 11)}`,
        title,
        pageDescription: `Knowledge: ${path}`,
        pageContent: content || undefined,
        tags,
        isFavorite: false,
        messages: [],
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        file_path: path
      };
      await upsertSession(fields);
    } catch {
      // Best-effort: the chat will still work without a session
    }
  }

  return {
    categories,
    stories,
    flatFiles,
    filteredCategories,
    selectedPath,
    currentFile,
    loading,
    fileLoading,
    error,
    expandedCategories,
    searchQuery,
    toggleCategory,
    expandCategory,
    loadAll,
    selectFile,
    loadStoryMarkdown,
    ensureKnowledgeSession
  };
});
