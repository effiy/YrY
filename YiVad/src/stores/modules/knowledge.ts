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
  { key: "industry", label: "Industry", desc: "竞争对手、市场趋势、行业报告、使用案例" },
  { key: "lessons", label: "Lessons", desc: "经验教训：成功、失败、踩坑" },
  { key: "methodology", label: "Methodology", desc: "AI 专项、PM 框架、思维方法" },
  { key: "people", label: "People", desc: "团队、干系人、专家" },
  { key: "product", label: "Product", desc: "产品策略、PRD、UX、指标" },
  { key: "resources", label: "Resources", desc: "prompts、模板、阅读清单" },
  { key: "tech", label: "Tech", desc: "AI 基础、AI 平台、数据、基础设施" },
  { key: "work", label: "Work", desc: "流程、协作、会议、工具" }
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
