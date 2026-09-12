/**
 * Knowledge store — page-level state for the public-facing Knowledge Hub
 * and per-category list/detail pages. Uses useKnowledgeFiles composable for
 * shared selectFile logic, keeping per-category caching here.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useKnowledgeFiles, fetchCategoryFiles } from "@/views/knowledge/composables/useKnowledgeFiles";
import type { KnowledgeFileEntry, KnowledgeReadResponse } from "@/api/interface/yiAi";

export const KNOWLEDGE_CATEGORIES = [
  { key: "producter", label: "Product Manager", desc: "Requirements — frameworks, discovery, delivery, strategy, PRDs" },
  { key: "leader", label: "Tech Lead", desc: "Decisions — ADRs, architecture, capacity, risk, roadmap" },
  { key: "engineer", label: "Engineer", desc: "Design + Build — architecture, quality, security, data, lessons" },
  { key: "srer", label: "Oncall SRE", desc: "Ship + Operate — incident response, observability, release" },
  { key: "executiver", label: "Executiver", desc: "Business strategy — industry intelligence, roadmap, reading list" },
  { key: "aier", label: "AI Engineer", desc: "AI enablement — foundations, methodology, platform, ML" },
  { key: "curator", label: "Knowledge Curator", desc: "Knowledge governance — diagrams, templates, archive" }
] as const;

export type KnowledgeCategoryKey = (typeof KNOWLEDGE_CATEGORIES)[number]["key"];

function isValidCategory(cat: string): cat is KnowledgeCategoryKey {
  return KNOWLEDGE_CATEGORIES.some(c => c.key === cat);
}

export const useKnowledgeStore = defineStore("yivad-knowledge", () => {
  const { currentFile, fileLoading, error, selectFile: _selectFile } = useKnowledgeFiles();

  const categoryFiles = ref<Record<string, KnowledgeFileEntry[]>>({});
  const loadingCategory = ref<Set<string>>(new Set());
  const detailPath = ref<string | null>(null);

  const totalFiles = computed(() =>
    KNOWLEDGE_CATEGORIES.reduce((sum, c) => sum + (categoryFiles.value[c.key]?.length ?? 0), 0)
  );

  const recentFiles = computed<KnowledgeFileEntry[]>(() => {
    const all: KnowledgeFileEntry[] = [];
    for (const c of KNOWLEDGE_CATEGORIES) {
      const list = categoryFiles.value[c.key];
      if (list) all.push(...list);
    }
    return all
      .filter(f => f.updatedAt != null)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      .slice(0, 10);
  });

  function filesOf(cat: string): KnowledgeFileEntry[] {
    return categoryFiles.value[cat] ?? [];
  }

  async function loadCategory(cat: string, force = false) {
    if (!isValidCategory(cat)) return;
    if (!force && categoryFiles.value[cat]) return;
    if (loadingCategory.value.has(cat)) return;
    const s = new Set(loadingCategory.value);
    s.add(cat);
    loadingCategory.value = s;
    error.value = null;
    try {
      const files = await fetchCategoryFiles(cat);
      categoryFiles.value = { ...categoryFiles.value, [cat]: files };
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : `Failed to load category ${cat}`;
    } finally {
      const s2 = new Set(loadingCategory.value);
      s2.delete(cat);
      loadingCategory.value = s2;
    }
  }

  async function loadAllCategories(force = false) {
    await Promise.all(KNOWLEDGE_CATEGORIES.map(c => loadCategory(c.key, force)));
  }

  function isCategoryLoading(cat: string): boolean {
    return loadingCategory.value.has(cat);
  }

  async function selectFile(path: string) {
    detailPath.value = path;
    await _selectFile(path);
  }

  function reset() {
    categoryFiles.value = {};
    detailPath.value = null;
    error.value = null;
  }

  return {
    categoryFiles,
    loadingCategory,
    currentDetail: currentFile,
    detailPath,
    fileLoading,
    error,
    totalFiles,
    recentFiles,
    filesOf,
    loadCategory,
    loadAllCategories,
    isCategoryLoading,
    selectFile,
    reset
  };
});