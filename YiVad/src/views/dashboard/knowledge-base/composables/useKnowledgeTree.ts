/**
 * Knowledge base tree management — tree data, expand/collapse state, module search.
 */
import { ref, computed, type Ref } from "vue";
import type { KnowledgeStatsData } from "@/api/interface/yiAi";

export function useKnowledgeTree(knowledgeData: Ref<KnowledgeStatsData | null>) {
  const showTreeView = ref(false);
  const expandedModuleKeys = ref<string[]>([]);
  const moduleDrillSearch = ref("");
  const moduleTableRef = ref<any>(null);

  /** Hierarchical tree data: category → module → sub_module. */
  const categoryTreeData = computed(() => {
    const cats = knowledgeData.value?.categories ?? [];
    const modules = knowledgeData.value?.modules ?? [];
    return cats.map(cat => ({
      id: cat.name,
      label: `${cat.name} (${cat.count})`,
      children: modules
        .filter(m => m.category === cat.name && m.name !== "__root__")
        .sort((a, b) => b.count - a.count)
        .map(m => ({
          id: `${cat.name}/${m.name}`,
          label: `${m.name} (${m.count})`,
          children: (m.sub_modules || [])
            .filter(sm => sm.name !== "__root__")
            .sort((a, b) => b.count - a.count)
            .map(sm => ({
              id: `${cat.name}/${m.name}/${sm.name}`,
              label: `${sm.name} (${sm.count})`
            }))
        }))
    }));
  });

  return {
    showTreeView,
    expandedModuleKeys,
    moduleDrillSearch,
    moduleTableRef,
    categoryTreeData
  };
}