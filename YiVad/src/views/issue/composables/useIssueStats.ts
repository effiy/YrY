import { computed, reactive, ref, onUnmounted, watch, type Ref } from "vue";
import {
  getIssueList,
  type Issue,
  type IssueStatus
} from "@/api/modules/issueService";
import { getKnowledgeIssueStats } from "@/api/modules/knowledgeService";
import type { KnowledgeIssuesStats } from "@/api/modules/knowledgeService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { getModuleList } from "@/api/modules/moduleService";
import type { Module } from "@/api/modules/moduleService";
import type { HeaderPill } from "@/components";

const STATUS_COLOR: Record<IssueStatus, string> = {
  backlog: "#9a60b4",
  todo: "#909399",
  in_progress: "#5ab1ef",
  in_review: "#e6a23c",
  done: "#91cc75",
  cancelled: "#ee6666"
};

const ISSUE_STATUS_ORDER: IssueStatus[] = ["todo", "in_progress", "in_review", "done", "backlog", "cancelled"];

export function useIssueStats(
  props: {
    projectKey?: string;
    filterIssueType?: string;
    excludeIssueType?: string;
    filterDate?: Date | null;
  },
  opts: {
    filterDateStr: Ref<string>;
    filters?: { status: string; priority: string; issue_type: string; assignee: string };
  }
) {
  const allIssues = ref<Issue[]>([]);
  const cardIssuesAll = ref<Issue[]>([]);
  const RECENTLY_VIEWED_KEY = "yivad_issue_recently_viewed";

  function loadRecentlyViewed(): Issue[] {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return raw ? (JSON.parse(raw) as Issue[]) : [];
    } catch {
      return [];
    }
  }

  function saveRecentlyViewed(items: Issue[]) {
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items.slice(0, 8)));
    } catch { /* quota exceeded or private browsing */ }
  }

  const recentlyViewed = ref<Issue[]>(loadRecentlyViewed());
  const projectNameByKey = ref<Map<string, string>>(new Map());
  const modulesByIssueKey = ref<Map<string, Module[]>>(new Map());

  // ── Real-time polling state ──
  const POLL_INTERVAL_MS = 30_000; // 30s auto-refresh (was 60s)
  const loading = ref(true);
  const lastRefreshed = ref<Date | null>(null);
  const dataAge = ref(0);
  const error = ref<string | null>(null);
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let ageTimer: ReturnType<typeof setInterval> | null = null;

  async function loadNames() {
    try {
      const [projRes, modRes] = await Promise.all([getProjectList({ pageSize: 500 }), getModuleList({ pageSize: 500 })]);
      projectNameByKey.value = new Map((projRes.data?.list as Project[]).map(p => [p.key, p.name]));
      const byIssue = new Map<string, Module[]>();
      for (const m of modRes.data?.list as Module[]) {
        for (const ik of m.issue_keys ?? []) {
          const arr = byIssue.get(ik) ?? [];
          arr.push(m);
          byIssue.set(ik, arr);
        }
      }
      modulesByIssueKey.value = byIssue;
    } catch {
      // names are best-effort — fall back to raw keys
    }
  }

  const modulesForIssue = (issueKey: string): Module[] => modulesByIssueKey.value.get(issueKey) ?? [];
  const projectName = (key: string) => projectNameByKey.value.get(key) || key;

  const stats = reactive({
    total: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    backlog: 0,
    cancelled: 0
  });

  const openCount = computed(() => stats.todo + stats.in_progress + stats.in_review);

  const completionPct = computed(() => (stats.total ? Math.round((stats.done / stats.total) * 100) : 0));

  const headerPills = computed<HeaderPill[]>(() => [
    { value: stats.total, label: "Total" },
    { value: openCount.value, label: "Open" },
    { value: stats.done, label: "Done" },
    {
      value: completionPct.value,
      suffix: "%",
      label: "Completed",
      accent: true,
      accentColor: "var(--el-color-primary-light-9)",
      accentValueColor: "var(--el-color-primary)"
    }
  ]);

  // ── Server-computed distributions ──
  const statusDist = ref<Record<string, number>>({});
  const priorityDist = ref<Record<string, number>>({});
  const typeDist = ref<Record<string, number>>({});
  const assigneeDist = ref<Record<string, number>>({});
  const createdByDay = ref<Record<string, number>>({});

  const completeness = ref<Array<{ key: string; label: string; filled: number; pct: number; missing: number }>>([]);

  const attention = ref<{ overdue: number; unassigned: number; blocked: number }>({
    overdue: 0,
    unassigned: 0,
    blocked: 0
  });

  function _applyStatsFromServer(s: KnowledgeIssuesStats) {
    Object.assign(stats, { total: s.stats.total });
    // Apply status counts individually to keep reactivity
    stats.total = s.stats.total;
    stats.todo = s.stats.todo;
    stats.in_progress = s.stats.in_progress;
    stats.in_review = s.stats.in_review;
    stats.done = s.stats.done;
    stats.backlog = s.stats.backlog;
    stats.cancelled = s.stats.cancelled;

    statusDist.value = s.statusDist;
    priorityDist.value = s.priorityDist;
    typeDist.value = s.typeDist;
    assigneeDist.value = s.assigneeDist;
    createdByDay.value = s.createdByDay;
    completeness.value = s.completeness;
    attention.value = s.attention;
  }

  function trackRecent(issue: Issue) {
    recentlyViewed.value = [issue, ...recentlyViewed.value.filter(r => r.key !== issue.key)].slice(0, 8);
    saveRecentlyViewed(recentlyViewed.value);
  }

  async function loadStats(silent = false) {
    if (!silent) {
      loading.value = true;
      error.value = null;
    }
    try {
      const statsParams: Record<string, string | undefined> = {
        project: props.projectKey || undefined,
        issue_type: props.filterIssueType || undefined,
      };
      if (opts.filters?.status) statsParams.status = opts.filters.status;
      if (opts.filters?.priority) statsParams.priority = opts.filters.priority;
      if (opts.filterDateStr.value) {
        statsParams.search = undefined; // date filter not applicable to stats
      }

      // Fetch server-computed stats and full list in parallel
      const listParams: any = {
        project_key: props.projectKey || undefined,
        pageSize: 500
      };
      if (props.filterIssueType) listParams.issue_type = props.filterIssueType;
      if (props.excludeIssueType) listParams.exclude_issue_type = props.excludeIssueType;
      // Apply active filters so card/allIssues data matches the filter context
      if (opts.filters?.status) listParams.status = opts.filters.status;
      if (opts.filters?.priority) listParams.priority = opts.filters.priority;
      if (opts.filters?.issue_type && !props.filterIssueType) listParams.issue_type = opts.filters.issue_type;
      if (opts.filters?.assignee) listParams.assignee = opts.filters.assignee;
      if (opts.filterDateStr.value) {
        if (props.filterDate !== undefined) {
          listParams.due_date = opts.filterDateStr.value;
        } else {
          listParams.updated_at_start = opts.filterDateStr.value;
          listParams.updated_at_end = opts.filterDateStr.value;
        }
      }

      const [statsData, listRes] = await Promise.all([
        getKnowledgeIssueStats(statsParams),
        getIssueList(listParams)
      ]);

      _applyStatsFromServer(statsData);

      const list = (listRes.data?.list as Issue[]) ?? [];
      allIssues.value = list;
      cardIssuesAll.value = list;

      await loadNames();
      lastRefreshed.value = new Date();
      dataAge.value = 0;
    } catch (e: unknown) {
      if (!silent) error.value = e instanceof Error ? e.message : "Failed to load issue stats";
    } finally {
      if (!silent) loading.value = false;
    }
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => loadStats(true), POLL_INTERVAL_MS);
    ageTimer = setInterval(() => { dataAge.value++; }, 1000);
  }

  function stopPolling() {
    if (pollTimer !== null) { clearInterval(pollTimer); pollTimer = null; }
    if (ageTimer !== null) { clearInterval(ageTimer); ageTimer = null; }
  }

  async function refresh() {
    await loadStats();
  }

  onUnmounted(() => stopPolling());

  // Re-fetch stats when filters change so charts reflect the filtered subset
  if (opts.filters) {
    watch(
      () => ({
        status: opts.filters!.status,
        priority: opts.filters!.priority,
        issue_type: opts.filters!.issue_type,
        assignee: opts.filters!.assignee
      }),
      () => loadStats(true)
    );
  }

  return {
    allIssues,
    cardIssuesAll,
    stats,
    openCount,
    completionPct,
    headerPills,
    recentlyViewed,
    trackRecent,
    statusDist,
    priorityDist,
    typeDist,
    assigneeDist,
    createdByDay,
    loadStats,
    completeness,
    attention,
    modulesByIssueKey,
    modulesForIssue,
    projectName,
    STATUS_COLOR,
    ISSUE_STATUS_ORDER,
    // real-time polling
    loading,
    lastRefreshed,
    dataAge,
    error,
    startPolling,
    stopPolling,
    refresh
  };
}

export {
  STATUS_COLOR,
  ISSUE_STATUS_ORDER
};