import { computed, ref, watch, onMounted, onUnmounted, type Ref } from "vue";
import { useProjectStore } from "@/stores/modules/project";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import { getIssueList } from "@/api/modules/issueService";
import { getModuleList } from "@/api/modules/moduleService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import type { Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import type { BugDocument } from "@/api/modules/bug";
import type { Project } from "@/api/modules/projectService";

export interface ProjectDetailData {
  project: Ref<Project | null>;
  loading: Ref<boolean>;
  headerReady: Ref<boolean>;
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

/** Simple TTL cache for knowledge files. */
let _kfCache: { files: KnowledgeFileEntry[]; ts: number } | null = null;
const KF_CACHE_TTL = 60_000;

async function getKnowledgeFiles(): Promise<KnowledgeFileEntry[]> {
  if (_kfCache && Date.now() - _kfCache.ts < KF_CACHE_TTL) {
    return _kfCache.files;
  }
  const res = await listKnowledgeFiles("projects");
  const files = (res.files as KnowledgeFileEntry[]) ?? [];
  _kfCache = { files, ts: Date.now() };
  return files;
}

/** Derive minimal bug objects from knowledge file frontmatter.
 *  Avoids the expensive getBugList → disk-scan path for the Overview tab. */
function deriveBugs(files: KnowledgeFileEntry[], projectKey: string): BugDocument[] {
  const prefix = `projects/${projectKey}/bugs/`;
  const bugs: BugDocument[] = [];
  for (const f of files) {
    if (!f.path.startsWith(prefix) || !f.path.endsWith(".md") || f.name === "README.md") continue;
    const m = (f.meta || {}) as Record<string, unknown>;
    bugs.push({
      key: (m.key as string) || f.path,
      title: (m.title as string) || f.name.replace(/\.md$/, ""),
      status: (m.status as string) || "open",
      priority: (m.priority as string) || "p3",
      severity: (m.severity as string) || "minor",
      assignee: (m.assignee as string) || "",
      reporter: (m.reporter as string) || "",
      dueDate: (m.due_date ? new Date(m.due_date as string).getTime() : null) as number | null,
      updatedAt: (m.updated ? new Date(m.updated as string).getTime() : Date.now()) as number,
      createdAt: (m.created ? new Date(m.created as string).getTime() : Date.now()) as number,
      contentPath: f.path,
      project: projectKey,
      project_key: projectKey,
      module: (m.module as string) || "",
      tags: (m.tags as string[]) || [],
      type: (m.type as string) || "bug",
      frequency: (m.frequency as string) || "once",
      environment: (m.environment as string) || "",
      affectedVersion: "",
      fixedVersion: "",
      resolvedAt: null,
      closedAt: null,
      iteration: "",
      defectUrl: ""
    } as BugDocument);
  }
  bugs.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return bugs;
}

export function useProjectDetail(projectKey: Ref<string>): ProjectDetailData {
  const store = useProjectStore();

  const loading = ref(true);
  const headerReady = ref(false);
  const error = ref<string | null>(null);

  const knowledgeFiles = ref<KnowledgeFileEntry[]>([]);
  const allIssues = ref<Issue[]>([]);
  const allModules = ref<Module[]>([]);
  const allBugs = ref<BugDocument[]>([]);
  const lastUpdated = ref(0);

  const project = computed(() => store.currentProject);

  let requestSeq = 0;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  async function fetchProject(silent = false): Promise<void> {
    const key = projectKey.value;
    if (!key) {
      loading.value = false;
      headerReady.value = false;
      error.value = "项目 key 缺失";
      return;
    }

    if (!silent) {
      loading.value = true;
      headerReady.value = false;
    }
    error.value = null;
    const seq = ++requestSeq;

    try {
      // Phase 1: Project data only — single MongoDB doc lookup, near-instant.
      await store.fetchProject(key);
      if (seq !== requestSeq) return;
      headerReady.value = true;

      // Phase 2: Supporting data — 3 parallel API calls (no disk scan).
      const results = await Promise.allSettled([
        getKnowledgeFiles(),
        getIssueList({ project_key: key, pageSize: 100 }),
        getModuleList({ project_key: key, pageSize: 50 })
      ]);

      if (seq !== requestSeq) return;

      const [filesResult, issueResult, moduleResult] = results;

      knowledgeFiles.value = filesResult.status === "fulfilled" ? (filesResult.value ?? []) : [];
      allIssues.value = issueResult.status === "fulfilled" ? ((issueResult.value.data?.list as Issue[]) ?? []) : [];
      allModules.value = moduleResult.status === "fulfilled" ? ((moduleResult.value.data?.list as Module[]) ?? []) : [];

      // Derive bugs from knowledge files — no separate API call needed.
      allBugs.value = deriveBugs(knowledgeFiles.value, key);

      lastUpdated.value = Date.now();

      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
      if (rejected.length === results.length) {
        const msg = rejected[0]?.reason instanceof Error ? rejected[0].reason.message : "加载项目失败";
        error.value = msg;
      }
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

  watch(projectKey, newKey => {
    if (newKey) fetchProject();
  });

  onUnmounted(stopPolling);

  return {
    project,
    loading,
    headerReady,
    error,
    knowledgeFiles,
    allIssues,
    allModules,
    allBugs,
    lastUpdated,
    retry,
    startPolling,
    stopPolling
  };
}
