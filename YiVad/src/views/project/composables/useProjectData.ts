/**
 * Data loading layer — fetches projects, issues, bugs, and modules in full.
 * Also loads server-computed dashboard analytics for the list page.
 * Supports optional auto-polling for real-time data.
 */
import { computed, onBeforeUnmount, ref, type ComputedRef, type Ref } from "vue";
import { getProjectList, type Project } from "@/api/modules/projectService";
import { getIssueList, normalizeIssue, type Issue } from "@/api/modules/issueService";
import { getBugList, type BugDocument } from "@/api/modules/bug";
import { getModuleList, type Module } from "@/api/modules/moduleService";
import { getProjectDashboard } from "@/api/modules/analyticsService";
import { getKnowledgeProjectsStats, type KnowledgeProjectsStats } from "@/api/modules/knowledgeService";
import type { DashboardResponse, ProjectBasicStats } from "@/types/analytics";

export interface UseProjectDataReturn {
  loading: Ref<boolean>;
  lastUpdated: Ref<string>;
  projects: Ref<Project[]>;
  issues: Ref<Issue[]>;
  bugs: Ref<BugDocument[]>;
  modules: Ref<Module[]>;
  knowledgeStats: Ref<KnowledgeProjectsStats | null>;
  dashboard: Ref<DashboardResponse | null>;
  /** Server-computed per-project stats (full dataset, 30d window). */
  serverStatsByKey: ComputedRef<Map<string, ProjectBasicStats>>;
  /** When the server last computed the dashboard (ISO timestamp). */
  dashboardGeneratedAt: ComputedRef<string | null>;
  load: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
}

const POLL_INTERVAL_KEY = "project.pollIntervalMs";

export function useProjectData(): UseProjectDataReturn {
  const loading = ref(false);
  const lastUpdated = ref("");
  const projects = ref<Project[]>([]);
  const issues = ref<Issue[]>([]);
  const bugs = ref<BugDocument[]>([]);
  const modules = ref<Module[]>([]);
  const knowledgeStats = ref<KnowledgeProjectsStats | null>(null);
  const dashboard = ref<DashboardResponse | null>(null);

  /** Server-computed per-project stats keyed by project_key. */
  const serverStatsByKey = computed(() => {
    const map = new Map<string, ProjectBasicStats>();
    for (const s of dashboard.value?.basic.by_project ?? []) {
      if (s.project_key) map.set(s.project_key, s);
    }
    return map;
  });

  /** When the server last computed the dashboard. */
  const dashboardGeneratedAt = computed(() => dashboard.value?.generated_at ?? null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  async function load() {
    loading.value = true;
    try {
      const results = await Promise.allSettled([
        getProjectList({ pageSize: 500 }),
        getIssueList({ pageSize: 500 }),
        getBugList({ pageSize: 5000 }),
        getModuleList({ pageSize: 5000 }),
        getProjectDashboard(),
        getKnowledgeProjectsStats(),
      ]);
      const [projectR, issueR, bugR, moduleR, dashboardR, knowledgeR] = results;

      projects.value = projectR.status === "fulfilled" ? ((projectR.value.data?.list as Project[]) ?? []) : projects.value;
      issues.value = issueR.status === "fulfilled" ? ((issueR.value.data?.list ?? []) as unknown as Record<string, unknown>[]).map(normalizeIssue) : issues.value;
      bugs.value = bugR.status === "fulfilled" ? ((bugR.value.data?.list as BugDocument[]) ?? []) : bugs.value;
      modules.value = moduleR.status === "fulfilled" ? ((moduleR.value.data?.list as Module[]) ?? []) : modules.value;
      dashboard.value = dashboardR.status === "fulfilled" ? dashboardR.value : dashboard.value;
      knowledgeStats.value = knowledgeR.status === "fulfilled" ? knowledgeR.value : knowledgeStats.value;
      lastUpdated.value = new Date().toLocaleTimeString();
    } finally {
      loading.value = false;
    }
  }

  async function silentRefresh() {
    try {
      const [projectRes, issueRes, bugRes, moduleRes, dashboardData, knowledgeData] = await Promise.all([
        getProjectList({ pageSize: 500 }),
        getIssueList({ pageSize: 500 }),
        getBugList({ pageSize: 5000 }),
        getModuleList({ pageSize: 5000 }),
        getProjectDashboard().catch(() => null),
        getKnowledgeProjectsStats().catch(() => null),
      ]);
      projects.value = (projectRes.data?.list as Project[]) ?? [];
      issues.value = ((issueRes.data?.list ?? []) as unknown as Record<string, unknown>[]).map(normalizeIssue);
      bugs.value = (bugRes.data?.list as BugDocument[]) ?? [];
      modules.value = (moduleRes.data?.list as Module[]) ?? [];
      if (dashboardData) dashboard.value = dashboardData;
      if (knowledgeData) knowledgeStats.value = knowledgeData;
      lastUpdated.value = new Date().toLocaleTimeString();
    } catch {
      // Silent refresh failures are intentionally ignored — the stale data stays visible.
    }
  }

  function startPolling(intervalMs?: number) {
    stopPolling();
    const ms = intervalMs ?? (Number(localStorage.getItem(POLL_INTERVAL_KEY)) || 60_000);
    if (ms <= 0) return;
    pollTimer = setInterval(silentRefresh, ms);
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  onBeforeUnmount(stopPolling);

  return { loading, lastUpdated, projects, issues, bugs, modules, knowledgeStats, dashboard, serverStatsByKey, dashboardGeneratedAt, load, startPolling, stopPolling };
}
