/**
 * Knowledge store — YiKnowledge markdown tree state for the aicr page.
 *
 * Mirrors the aicr/fileTree store pattern: scan + select + read, with a
 * one-shot pending-select mechanism so the story page can navigate to aicr
 * with a specific knowledge file pre-selected (parallel to the code file
 * pending-select path).
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { scanKnowledge, readKnowledgeFile, listKnowledgeStories, readKnowledgeStory } from "@/api/modules/knowledgeService";
import { getSession, upsertSession, updateSession } from "@/api/modules/sessions";
import type { KnowledgeFileEntry, KnowledgeReadResponse, KnowledgeStoryEntry, SessionDocument } from "@/api/interface/yiweb";

export const useAicrKnowledgeStore = defineStore("yivad-aicr-knowledge", () => {
  const categories = ref<{ category: string; files: KnowledgeFileEntry[] }[]>([]);
  const stories = ref<KnowledgeStoryEntry[]>([]);
  const selectedPath = ref<string | null>(null);
  const currentFile = ref<KnowledgeReadResponse | null>(null);
  const loading = ref(false);
  const fileLoading = ref(false);
  const error = ref<string | null>(null);
  const expandedCategories = ref<Set<string>>(new Set());
  const searchQuery = ref("");
  // One-shot: set by external pages (story detail "open in aicr") before
  // routing here; consumed in onMounted/onActivated.
  const pendingSelectPath = ref<string | null>(null);
  // One-shot: scope the tree to a specific story's knowledge files before
  // routing here. Cleared after applying.
  const pendingStoryFilter = ref<{ project: string; storyName: string } | null>(null);
  // When set, filters the knowledge tree to files under this directory prefix.
  // Used by BRD detail → aicr navigation to show only BRD content files.
  const brdFilterPath = ref<string | null>(null);

  const flatFiles = computed<KnowledgeFileEntry[]>(() => {
    const out: KnowledgeFileEntry[] = [];
    for (const c of categories.value) out.push(...c.files);
    return out;
  });

  const filteredCategories = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    const brdPrefix = brdFilterPath.value;
    const matchFile = (f: KnowledgeFileEntry) => {
      if (brdPrefix && !f.path.startsWith(brdPrefix)) return false;
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

  function setPendingSelectPath(path: string | null) {
    pendingSelectPath.value = path || null;
  }

  function setPendingStoryFilter(project: string, storyName: string) {
    pendingStoryFilter.value = { project, storyName };
  }

  /** Scope the knowledge tree to files under this directory prefix (e.g. "brd/brd-documents/"). */
  function setBrdFilterPath(path: string | null) {
    brdFilterPath.value = path;
  }

  function clearBrdFilterPath() {
    brdFilterPath.value = null;
  }

  function consumePendingSelectPath(): string | null {
    const p = pendingSelectPath.value;
    pendingSelectPath.value = null;
    return p;
  }

  function consumePendingStoryFilter(): { project: string; storyName: string } | null {
    const v = pendingStoryFilter.value;
    pendingStoryFilter.value = null;
    return v;
  }

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
      const [scan, storyList] = await Promise.all([scanKnowledge(), listKnowledgeStories()]);
      categories.value = scan.categories ?? [];
      stories.value = storyList.stories ?? [];
    } catch (e: any) {
      error.value = e?.message || "Failed to load knowledge tree";
      categories.value = [];
      stories.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function selectFile(path: string) {
    selectedPath.value = path;
    fileLoading.value = true;
    try {
      currentFile.value = await readKnowledgeFile(path);
    } catch (e: any) {
      error.value = e?.message || "Failed to read knowledge file";
      currentFile.value = null;
    } finally {
      fileLoading.value = false;
    }
  }

  /** Resolve a story's story.md by project + story dir name, returning content + meta. */
  async function loadStoryMarkdown(project: string, storyName: string): Promise<KnowledgeReadResponse | null> {
    try {
      return await readKnowledgeStory(project, storyName);
    } catch {
      return null;
    }
  }

  /**
   * Ensure a session document exists for the given knowledge file path so
   * that aicr's ChatPanel can pull the file content as system context.
   * Mirrors fileTree.ensureFilesInTree: existing session → patch
   * pageContent only; missing → upsert with path-derived fields. The
   * `key` is the knowledge path (e.g. "tech/ai-platform/foo-summary.md"),
   * matching how selectFile / chatStore.selectSession key sessions.
   */
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
        url: `aicr-session://${now}-${Math.random().toString(36).slice(2, 11)}`,
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
      // Best-effort: the chat will still work without a session, just no
      // pageContent context. Don't surface an error to the user.
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
    pendingSelectPath,
    pendingStoryFilter,
    brdFilterPath,
    setPendingSelectPath,
    setPendingStoryFilter,
    setBrdFilterPath,
    clearBrdFilterPath,
    consumePendingSelectPath,
    consumePendingStoryFilter,
    toggleCategory,
    expandCategory,
    loadAll,
    selectFile,
    loadStoryMarkdown,
    ensureKnowledgeSession
  };
});
