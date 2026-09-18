import { reactive, ref, onMounted, onUnmounted, watch, type Ref } from "vue";
import { useRoute } from "vue-router";
import { useProjectStore } from "@/stores/modules/project";
import { countDocuments } from "@/api/modules/dataService";

export interface HomeStats {
  bugCount: number;
  requirementCount: number;
  totalIssues: number;
  totalModules: number;
  knowledgeFileCount: number;
  chatSessionCount: number;
  activeIssueCount: number;
  openBugCount: number;
  issueStatusGroups: Array<{ value: string; count: number }>;
  bugStatusGroups: Array<{ value: string; count: number }>;
  assigneeGroups: Array<{ value: string; count: number }>;
}

export interface HomeData {
  stats: HomeStats;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  lastUpdated: Ref<number>;
  retry: () => Promise<void>;
  selectedProjects: Ref<string[]>;
}

interface CountQuery {
  key: keyof HomeStats;
  cname: string;
  filter?: Record<string, unknown>;
}

const POLL_INTERVAL_MS = 60_000;

export function useHomeData(): HomeData {
  const route = useRoute();
  const projectStore = useProjectStore();

  const loading = ref(true);
  const error = ref<string | null>(null);
  const lastUpdated = ref(0);
  const selectedProjects = ref<string[]>([]);

  const stats = reactive<HomeStats>({
    bugCount: 0,
    requirementCount: 0,
    totalIssues: 0,
    totalModules: 0,
    knowledgeFileCount: 0,
    chatSessionCount: 0,
    activeIssueCount: 0,
    openBugCount: 0,
    issueStatusGroups: [],
    bugStatusGroups: [],
    assigneeGroups: []
  });

  const COUNT_QUERIES: CountQuery[] = [
    { key: "bugCount", cname: "bugs" },
    { key: "requirementCount", cname: "issues", filter: { issue_type: "requirement" } },
    { key: "totalIssues", cname: "issues" },
    { key: "totalModules", cname: "modules" },
    { key: "knowledgeFileCount", cname: "knowledge_files" },
    { key: "chatSessionCount", cname: "sessions" },
    { key: "activeIssueCount", cname: "issues", filter: { status: { $nin: ["done", "cancelled"] } } },
    { key: "openBugCount", cname: "bugs", filter: { status: { $in: ["open", "reopened"] } } }
  ];

  async function loadCounts(): Promise<void> {
    const results = await Promise.allSettled(COUNT_QUERIES.map(({ cname, filter }) => countDocuments(cname, filter)));
    COUNT_QUERIES.forEach(({ key }, idx) => {
      const r = results[idx];
      if (r.status === "fulfilled") {
        (stats as Record<string, unknown>)[key] = r.value.data?.count ?? 0;
      }
    });
  }

  async function loadStatusBreakdowns(): Promise<void> {
    try {
      const issueRes = await countDocuments("issues", undefined, "status");
      stats.issueStatusGroups = issueRes.data?.groups ?? [];
    } catch {
      // non-critical — leave groups empty
    }
    try {
      const bugRes = await countDocuments("bugs", undefined, "status");
      stats.bugStatusGroups = bugRes.data?.groups ?? [];
    } catch {
      // non-critical
    }
    try {
      const assigneeRes = await countDocuments("issues", { status: { $nin: ["done", "cancelled"] } }, "assignee");
      stats.assigneeGroups = (assigneeRes.data?.groups ?? [])
        .filter(g => g.value != null && g.value !== "")
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } catch {
      // non-critical
    }
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

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  async function fetchAll(silent = false): Promise<void> {
    if (!silent) {
      loading.value = true;
      error.value = null;
    }

    try {
      await Promise.all([projectStore.fetchProjects(), loadCounts(), loadStatusBreakdowns()]);
      syncProjectFromQuery();
      lastUpdated.value = Date.now();
    } catch (e: unknown) {
      if (!silent) {
        const msg = e instanceof Error ? e.message : "加载首页数据失败";
        error.value = msg;
      }
    } finally {
      if (!silent) loading.value = false;
    }
  }

  onMounted(() => {
    fetchAll();
    pollTimer = setInterval(() => fetchAll(true), POLL_INTERVAL_MS);
  });

  onUnmounted(() => {
    if (pollTimer !== null) clearInterval(pollTimer);
  });

  watch(
    () => route.query.project,
    () => {
      if (projectStore.projects.length > 0) {
        syncProjectFromQuery();
      }
    }
  );

  return { stats, loading, error, lastUpdated, retry: () => fetchAll(), selectedProjects };
}
