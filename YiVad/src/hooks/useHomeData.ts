import { reactive, ref, onMounted, watch, type Ref } from "vue";
import { useRoute } from "vue-router";
import { useProjectStore } from "@/stores/modules/project";
import { queryDocuments } from "@/api/modules/dataService";

export interface HomeStats {
  bugCount: number;
  requirementCount: number;
  totalIssues: number;
  totalModules: number;
  knowledgeFileCount: number;
  chatSessionCount: number;
}

export interface HomeData {
  stats: HomeStats;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  retry: () => Promise<void>;
  selectedProjects: Ref<string[]>;
}

interface StatQuery {
  key: keyof HomeStats;
  cname: string;
  extraFilter?: Record<string, unknown>;
}

export function useHomeData(): HomeData {
  const route = useRoute();
  const projectStore = useProjectStore();

  const loading = ref(true);
  const error = ref<string | null>(null);
  const selectedProjects = ref<string[]>([]);

  const stats = reactive<HomeStats>({
    bugCount: 0,
    requirementCount: 0,
    totalIssues: 0,
    totalModules: 0,
    knowledgeFileCount: 0,
    chatSessionCount: 0,
  });

  const STAT_QUERIES: StatQuery[] = [
    { key: "bugCount", cname: "bugs" },
    { key: "requirementCount", cname: "issues", extraFilter: { issue_type: "requirement" } },
    { key: "totalIssues", cname: "issues" },
    { key: "totalModules", cname: "modules" },
    { key: "knowledgeFileCount", cname: "knowledge_files" },
    { key: "chatSessionCount", cname: "sessions" },
  ];

  async function loadStats(): Promise<void> {
    const requests = STAT_QUERIES.map(({ cname, extraFilter }) =>
      queryDocuments<{ total?: number }>({
        cname,
        filter: extraFilter ?? {},
        pageSize: 1,
      }),
    );
    const results = await Promise.all(requests);
    STAT_QUERIES.forEach(({ key }, idx) => {
      stats[key] = results[idx].data?.total ?? 0;
    });
  }

  function syncProjectFromQuery(): void {
    const q = route.query.project;
    if (typeof q === "string" && q.trim()) {
      const valid = new Set(projectStore.projects.map(p => p.key));
      selectedProjects.value = q
        .split(",")
        .map(s => s.trim())
        .filter(k => valid.has(k));
    }
  }

  async function fetchAll(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await Promise.all([projectStore.fetchProjects(), loadStats()]);
      syncProjectFromQuery();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载首页数据失败";
      error.value = msg;
    } finally {
      loading.value = false;
    }
  }

  onMounted(fetchAll);

  watch(() => route.query.project, () => {
    if (projectStore.projects.length > 0) {
      syncProjectFromQuery();
    }
  });

  return {
    stats,
    loading,
    error,
    retry: fetchAll,
    selectedProjects,
  };
}