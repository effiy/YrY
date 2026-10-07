import { computed, onBeforeUnmount, ref, type Ref } from "vue";
import { useModuleStore } from "@/stores/modules/module";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { getModuleDashboard } from "@/api/modules/analyticsService";
import type { ModuleDashboardResponse } from "@/types/analytics";
import type { HeaderPill } from "@/components";

const POLL_INTERVAL_MS = 30_000;

export function useModuleData(options: { projectKey?: string; filterDateStr: Ref<string>; isPropDate: boolean; onRefresh?: () => void }) {
  const store = useModuleStore();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const issueMap = ref<Map<string, Issue>>(new Map());
  const projects = ref<{ key: string; name: string }[]>([]);
  const dashboard = ref<ModuleDashboardResponse | null>(null);
  const dataAge = ref(0);
  const polling = ref(true);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let ageTimer: ReturnType<typeof setInterval> | null = null;

  const stats = computed(() => {
    const s = dashboard.value?.summary;
    if (!s) return { total: store.total, planned: 0, inProgress: 0, completed: 0, cancelled: 0, totalIssues: 0, totalDoneIssues: 0, overallCompletion: 0 };
    return {
      total: s.total,
      planned: s.planned,
      inProgress: s.active,
      completed: s.completed,
      cancelled: s.cancelled,
      totalIssues: s.total_issues,
      totalDoneIssues: s.total_done_issues,
      overallCompletion: s.overall_weighted_progress || s.overall_simple_progress
    };
  });

  const headerPills = computed<HeaderPill[]>(() => [
    { value: stats.value.total, label: "Total" },
    { value: stats.value.inProgress, label: "Active" },
    { value: stats.value.completed, label: "Done" },
    { value: stats.value.overallCompletion, suffix: "%", label: "Completed", accent: true }
  ]);

  const attention = computed(() => {
    const s = dashboard.value?.summary;
    if (!s) return { overdue: 0, empty: 0, stalled: 0, blocked: 0, unassigned: 0 };
    return {
      overdue: s.overdue_count,
      empty: s.empty_count,
      stalled: s.stalled_count,
      blocked: s.blocked_total,
      unassigned: s.unassigned_total
    };
  });

  const completeness = computed(() => {
    const mods = dashboard.value?.modules;
    const total = mods?.length || store.modules.length;
    if (!mods?.length) return [
      { key: "desc", label: "Description", pct: 0 },
      { key: "lead", label: "Lead", pct: 0 },
      { key: "dates", label: "Dates", pct: 0 },
      { key: "issues", label: "Issues", pct: 0 }
    ];
    return [
      { key: "desc", label: "Description", pct: Math.round(mods.filter(m => m.has_description).length / total * 100) },
      { key: "lead", label: "Lead", pct: Math.round(mods.filter(m => m.has_lead).length / total * 100) },
      { key: "dates", label: "Dates", pct: Math.round(mods.filter(m => m.has_dates).length / total * 100) },
      { key: "issues", label: "Issues", pct: Math.round(mods.filter(m => m.issue_count > 0).length / total * 100) }
    ];
  });

  function _findDashMod(key: string) {
    return dashboard.value?.modules.find(m => m.key === key);
  }

  function issueCount(mod: Module): number {
    return _findDashMod(mod.key)?.issue_count ?? mod.issue_keys?.length ?? 0;
  }

  function doneCount(mod: Module): number {
    return _findDashMod(mod.key)?.done_count ?? 0;
  }

  function progressPct(mod: Module): number {
    const dm = _findDashMod(mod.key);
    if (dm) return dm.weighted_progress || dm.simple_progress;
    if (mod.status === "completed") return 100;
    const total = mod.issue_keys?.length || 0;
    if (!total) return 0;
    return 0;
  }

  async function _syncStoreFromDashboard() {
    const mods = dashboard.value?.modules;
    if (!mods?.length) return;
    const prev = new Map(store.modules.map(m => [m.key, m]));
    store.modules = mods.map(m => {
      const old = prev.get(m.key);
      return {
        key: m.key,
        project_key: m.project_key,
        name: m.name,
        status: m.status as ModuleStatus,
        lead: m.lead,
        issue_keys: m.issue_keys ?? old?.issue_keys ?? [],
        description: old?.description ?? "",
        start_date: old?.start_date,
        due_date: old?.due_date,
        prd_task_id: old?.prd_task_id,
        yk_module_path: old?.yk_module_path,
        created_at: m.created_at,
        updated_at: m.updated_at
      };
    });
  }

  async function loadIssueData(issueKeys: string[]) {
    if (!issueKeys.length) return;
    try {
      const res = await getIssueList({ filter: { key: { $in: issueKeys } }, pageSize: issueKeys.length } as any);
      issueMap.value = new Map(((res.data?.list as Issue[]) ?? []).map(i => [i.key, i]));
    } catch {
      /* best-effort */
    }
  }

  async function loadProjects() {
    try {
      const res = await getProjectList({ pageSize: 500 });
      projects.value = ((res.data?.list as Project[]) ?? []).map(p => ({ key: p.key, name: p.name }));
    } catch {
      /* best-effort */
    }
  }

  async function refresh(silent = false) {
    if (!silent) loading.value = true;
    error.value = null;
    try {
      dashboard.value = await getModuleDashboard({ project_key: options.projectKey || undefined, date: options.filterDateStr.value || undefined });
      await _syncStoreFromDashboard();
      store.total = dashboard.value.summary.total;
      // Load issue details for card display from preserved issue_keys
      const mods = dashboard.value.modules;
      const allKeys = [...new Set(mods.flatMap(m => {
        const storeMod = store.modules.find(sm => sm.key === m.key);
        return storeMod?.issue_keys || [];
      }))];
      if (allKeys.length) await loadIssueData(allKeys);
      dataAge.value = 0;
      options.onRefresh?.();
    } catch (e) {
      if (!silent) error.value = e instanceof Error ? e.message : "Failed to load modules";
    } finally {
      if (!silent) loading.value = false;
    }
  }

  async function init() {
    // Load full module data first (issue_keys, description), then dashboard for metrics
    if (!options.projectKey) {
      await store.fetchModules({ pageSize: 500 });
      await loadProjects();
    }
    await refresh();
    // Start polling and age counter
    pollTimer = setInterval(() => { if (polling.value) refresh(true); }, POLL_INTERVAL_MS);
    ageTimer = setInterval(() => { dataAge.value++; }, 1000);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (ageTimer) { clearInterval(ageTimer); ageTimer = null; }
  }

  onBeforeUnmount(() => stopPolling());

  return {
    store,
    loading,
    error,
    issueMap,
    projects,
    dashboard,
    stats,
    headerPills,
    attention,
    completeness,
    issueCount,
    doneCount,
    progressPct,
    dataAge,
    polling,
    refresh,
    init,
    stopPolling
  };
}

export function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}