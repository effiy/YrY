/**
 * Knowledge tree store — YiKnowledge markdown tree state shared by aiChat
 * sidebar and AiChatBox drag-drop. Uses useKnowledgeFiles composable for
 * shared selectFile logic.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { scanKnowledge, listKnowledgeFiles, readKnowledgeFile, listKnowledgeStories, readKnowledgeStory } from "@/api/modules/knowledgeService";
import { getSession, upsertSession, updateSession } from "@/api/modules/sessions";
import { useKnowledgeFiles } from "@/views/knowledge/composables/useKnowledgeFiles";
import type { KnowledgeFileEntry, KnowledgeReadResponse, KnowledgeStoryEntry, SessionDocument } from "@/api/interface/yiAi";

export const useKnowledgeTreeStore = defineStore("yivad-knowledge-tree", () => {
  const { currentFile, fileLoading, error, selectFile: _selectFile } = useKnowledgeFiles();

  const categories = ref<{ category: string; files: KnowledgeFileEntry[] }[]>([]);
  const stories = ref<KnowledgeStoryEntry[]>([]);
  const selectedPath = ref<string | null>(null);
  const loading = ref(true);
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
    return categories.value
      .map(c => ({ ...c, files: c.files.filter(matchFile) }))
      .filter(c => c.files.length > 0);
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
    loading.value = true;
    error.value = null;
    try {
      let cats: { category: string; files: KnowledgeFileEntry[] }[] = [];
      try {
        const dbResult = await listKnowledgeFiles();
        if (dbResult.files?.length) {
          const grouped = new Map<string, KnowledgeFileEntry[]>();
          for (const f of dbResult.files) {
            if (f.meta?.type === "rss") continue;
            const cat = f.category || "__root__";
            if (!grouped.has(cat)) grouped.set(cat, []);
            grouped.get(cat)!.push(f);
          }
          cats = [...grouped.entries()].map(([category, files]) => ({ category, files }));
        }
      } catch {
        console.warn("[knowledgeTree] DB mirror unavailable, falling back to disk scan");
        // DB mirror unavailable — fall through to disk scan
      }

      if (!cats.length) {
        const scan = await scanKnowledge();
        cats = (scan.categories ?? []).map(c => ({ ...c, files: c.files.filter(f => f.meta?.type !== "rss") }));
      }

      const storyList = await listKnowledgeStories().catch(() => ({ stories: [] as KnowledgeStoryEntry[] }));
      categories.value = cats;
      stories.value = storyList.stories ?? [];
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load knowledge tree";
      categories.value = [];
      stories.value = [];
    } finally {
      loading.value = false;
    }
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