/**
 * Knowledge store — page-level state for the public-facing Knowledge Hub
 * and per-category list/detail pages. Independent from the aicr knowledge
 * store: this one caches per-category file lists so the Hub ↔ List ↔
 * Detail round trips don't trigger repeated backend scans.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { scanKnowledge, readKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry, KnowledgeReadResponse } from "@/api/interface/yiweb";

export const KNOWLEDGE_CATEGORIES = [
  { key: "industry", label: "Industry", desc: "Competitors, market trends, industry reports, use cases" },
  { key: "lessons", label: "Lessons", desc: "Lessons learned: successes, failures, pitfalls" },
  { key: "methodology", label: "Methodology", desc: "AI specializations, PM frameworks, thinking methods" },
  { key: "people", label: "People", desc: "Team, stakeholders, experts" },
  { key: "product", label: "Product", desc: "Product strategy, PRD, UX, metrics" },
  { key: "resources", label: "Resources", desc: "Prompts, templates, reading lists" },
  { key: "tech", label: "Tech", desc: "AI foundations, AI platforms, data, infrastructure" },
  { key: "work", label: "Work", desc: "Processes, collaboration, meetings, tools" }
] as const;

export type KnowledgeCategoryKey = (typeof KNOWLEDGE_CATEGORIES)[number]["key"];

function isValidCategory(cat: string): cat is KnowledgeCategoryKey {
  return KNOWLEDGE_CATEGORIES.some(c => c.key === cat);
}

export const useKnowledgeStore = defineStore("yivad-knowledge", () => {
  const categoryFiles = ref<Record<string, KnowledgeFileEntry[]>>({});
  const loadingCategory = ref<Set<string>>(new Set());
  const currentDetail = ref<KnowledgeReadResponse | null>(null);
  const detailPath = ref<string | null>(null);
  const fileLoading = ref(false);
  const error = ref<string | null>(null);

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
      const res = await scanKnowledge(cat);
      categoryFiles.value = { ...categoryFiles.value, [cat]: res.categories?.[0]?.files ?? [] };
    } catch (e: any) {
      error.value = e?.message || `Failed to load category ${cat}`;
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
    fileLoading.value = true;
    error.value = null;
    try {
      currentDetail.value = await readKnowledgeFile(path);
    } catch (e: any) {
      error.value = e?.message || "Failed to read knowledge file";
      currentDetail.value = null;
    } finally {
      fileLoading.value = false;
    }
  }

  function reset() {
    categoryFiles.value = {};
    currentDetail.value = null;
    detailPath.value = null;
    error.value = null;
  }

  return {
    categoryFiles,
    loadingCategory,
    currentDetail,
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
