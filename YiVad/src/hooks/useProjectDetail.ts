import { computed, ref, watch, onMounted, onUnmounted, type Ref } from "vue";
import { useProjectStore } from "@/stores/modules/project";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import { getIssueList } from "@/api/modules/issueService";
import { getModuleList } from "@/api/modules/moduleService";
import { getBugList } from "@/api/modules/bug";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import type { Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import type { BugDocument } from "@/api/modules/bug";
import type { Project } from "@/api/modules/projectService";

export interface ProjectDetailData {
  project: Ref<Project | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  knowledgeFiles: Ref<KnowledgeFileEntry[]>;
  allIssues: Ref<Issue[]>;
  allModules: Ref<Module[]>;
  allBugs: Ref<BugDocument[]>;
  lastUpdated: Ref<number>;
  retry: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
}

/**
 * 项目详情页统一数据加载 composable。
 * 将原本分散在 detail.vue 和 DetailOverview.vue 中的 API 请求合并为一次 Promise.all，
 * 消除 getIssueList 的重复调用，将 getModuleList/getBugList 提升到入口层。
 */
export function useProjectDetail(projectKey: Ref<string>): ProjectDetailData {
  const store = useProjectStore();

  const loading = ref(true);
  const error = ref<string | null>(null);

  const knowledgeFiles = ref<KnowledgeFileEntry[]>([]);
  const allIssues = ref<Issue[]>([]);
  const allModules = ref<Module[]>([]);
  const allBugs = ref<BugDocument[]>([]);
  const lastUpdated = ref(0);

  const project = computed(() => store.currentProject);

  let requestSeq = 0;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  let initialLoad = true;

  async function fetchProject(silent = false): Promise<void> {
    const key = projectKey.value;
    if (!key) {
      loading.value = false;
      error.value = "项目 key 缺失";
      return;
    }

    if (!silent) loading.value = true;
    error.value = null;
    const seq = ++requestSeq;

    try {
      await store.fetchProject(key);

      if (seq !== requestSeq) return;

      const [filesRes, issueRes, moduleRes, bugRes] = await Promise.all([
        listKnowledgeFiles("projects"),
        getIssueList({ project_key: key, pageSize: 500 }),
        getModuleList({ project_key: key, pageSize: 500 }),
        getBugList({ project_key: key, pageSize: 500 }),
      ]);

      if (seq !== requestSeq) return;

      knowledgeFiles.value = (filesRes.files as KnowledgeFileEntry[]) ?? [];
      allIssues.value = (issueRes.data?.list as Issue[]) ?? [];
      allModules.value = (moduleRes.data?.list as Module[]) ?? [];
      allBugs.value = (bugRes.data?.list as BugDocument[]) ?? [];
      lastUpdated.value = Date.now();
      initialLoad = false;
    } catch (e: unknown) {
      if (seq !== requestSeq) return;
      const msg = e instanceof Error ? e.message : "加载项目失败";
      error.value = msg;
    } finally {
      if (seq === requestSeq && !silent) loading.value = false;
    }
  }

  async function retry() {
    return fetchProject(true);
  }

  function startPolling(intervalMs = 30_000) {
    stopPolling();
    pollTimer = setInterval(() => fetchProject(true), intervalMs);
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  onMounted(fetchProject);

  watch(projectKey, (newKey) => {
    if (newKey) fetchProject();
  });

  onUnmounted(stopPolling);

  return {
    project,
    loading,
    error,
    knowledgeFiles,
    allIssues,
    allModules,
    allBugs,
    lastUpdated,
    retry,
    startPolling,
    stopPolling,
  };
}