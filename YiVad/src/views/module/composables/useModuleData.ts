import { computed, ref, type Ref } from "vue";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import type { HeaderPill } from "@/components";

export function useModuleData(options: {
  projectKey?: string;
  filterDateStr: Ref<string>;
  isPropDate: boolean;
}) {
  const store = useModuleStore();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const issueMap = ref<Map<string, Issue>>(new Map());
  const projects = ref<{ key: string; name: string }[]>([]);

  const stats = computed(() => {
    const planned = store.modules.filter(m => m.status === "planned").length;
    const inProgress = store.modules.filter(m => m.status === "in_progress").length;
    const completed = store.modules.filter(m => m.status === "completed").length;
    const cancelled = store.modules.filter(m => m.status === "cancelled").length;
    const totalIssues = store.modules.reduce((s, m) => s + (m.issue_keys?.length || 0), 0);
    let totalDoneIssues = 0;
    for (const m of store.modules) {
      for (const k of m.issue_keys || []) {
        if (issueMap.value.get(k)?.status === "done") totalDoneIssues++;
      }
    }
    const overallCompletion = totalIssues ? Math.round((totalDoneIssues / totalIssues) * 100) : 0;
    return {
      total: store.total,
      planned,
      inProgress,
      completed,
      cancelled,
      totalIssues,
      totalDoneIssues,
      overallCompletion
    };
  });

  const headerPills = computed<HeaderPill[]>(() => [
    { value: stats.value.total, label: "Total" },
    { value: stats.value.inProgress, label: "Active" },
    { value: stats.value.completed, label: "Done" },
    { value: stats.value.overallCompletion, suffix: "%", label: "Completed", accent: true }
  ]);

  const attention = computed(() => {
    const now = Date.now();
    const overdue = store.modules.filter(
      m => m.status === "in_progress" && m.due_date && new Date(m.due_date).getTime() < now
    ).length;
    const empty = store.modules.filter(
      m => !(m.issue_keys?.length) && m.status !== "completed" && m.status !== "cancelled"
    ).length;
    const stalled = store.modules.filter(
      m => m.status === "in_progress" && (m.issue_keys?.length || 0) > 0 && progressPct(m) === 0
    ).length;
    return { overdue, empty, stalled };
  });

  const completeness = computed(() => {
    const total = store.modules.length;
    const fields = [
      { key: "desc", label: "Description", filled: store.modules.filter(m => m.description).length },
      { key: "lead", label: "Lead", filled: store.modules.filter(m => m.lead).length },
      { key: "issues", label: "Issues", filled: store.modules.filter(m => (m.issue_keys?.length || 0) > 0).length }
    ];
    return fields.map(f => ({ ...f, pct: total ? Math.round((f.filled / total) * 100) : 0 }));
  });

  function issueCount(mod: Module): number { return mod.issue_keys?.length || 0; }

  function doneCount(mod: Module): number {
    let done = 0;
    for (const k of mod.issue_keys || []) { if (issueMap.value.get(k)?.status === "done") done++; }
    return done;
  }

  function progressPct(mod: Module): number {
    if (mod.status === "completed") return 100;
    const total = issueCount(mod);
    if (!total) return 0;
    return Math.round((doneCount(mod) / total) * 100);
  }

  async function loadIssueData(issueKeys: string[]) {
    if (!issueKeys.length) return;
    try {
      const res = await getIssueList({ filter: { key: { $in: issueKeys } }, pageSize: issueKeys.length } as any);
      issueMap.value = new Map(((res.data?.list as Issue[]) ?? []).map(i => [i.key, i]));
    } catch { /* best-effort */ }
  }

  async function loadProjects() {
    try {
      const res = await getProjectList({ pageSize: 500 });
      projects.value = ((res.data?.list as Project[]) ?? []).map(p => ({ key: p.key, name: p.name }));
    } catch { /* best-effort */ }
  }

  function buildDateFilter(dateStr: string): Record<string, any> {
    if (!dateStr) return {};
    if (options.isPropDate) return { due_date: dateStr };
    return { updated_at_start: dateStr, updated_at_end: dateStr };
  }

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const dateFilter = buildDateFilter(options.filterDateStr.value);
      await store.fetchModules({ project_key: options.projectKey || undefined, ...dateFilter });
      const issueKeys = [...new Set(store.modules.flatMap(m => m.issue_keys || []))];
      if (issueKeys.length) await loadIssueData(issueKeys);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load modules";
    } finally {
      loading.value = false;
    }
  }

  async function init() {
    await refresh();
    if (!options.projectKey) await loadProjects();
  }

  return {
    store,
    loading,
    error,
    issueMap,
    projects,
    stats,
    headerPills,
    attention,
    completeness,
    issueCount,
    doneCount,
    progressPct,
    refresh,
    init
  };
}

export function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}