/**
 * Home page data — unified stats from server-side aggregation + count queries.
 *
 * Uses getKnowledgeIssueStats() for issue stats (same endpoint as the issue
 * page analytics), countDocuments() for bugs, sessions, knowledge, and modules.
 * This guarantees that KPI cards on the home page and analytics on linked pages
 * derive from the same data source.
 */
import { reactive, ref, onMounted, onUnmounted, watch, type Ref } from "vue";
import { useRoute } from "vue-router";
import { useProjectStore } from "@/stores/modules/project";
import { countDocuments } from "@/api/modules/dataService";
import { getKnowledgeIssueStats } from "@/api/modules/knowledgeService";
import type { KnowledgeIssuesStats } from "@/api/modules/knowledgeService";
import { DONE_QUERY, NOT_DONE_QUERY, OPEN_BUGS_QUERY } from "@/utils/status";

export interface HomeStats {
  // --- Issue core (from getKnowledgeIssueStats) ---
  totalIssues: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
  backlogCount: number;
  cancelledCount: number;
  overdueCount: number;
  blockedCount: number;
  unassignedCount: number;
  issueStatusGroups: Array<{ value: string; count: number }>;

  // --- Issue time-window (from countDocuments) ---
  todayDoneCount: number;
  todayCreatedCount: number;
  yesterdayDoneCount: number;
  doneWeekCount: number;
  doneLastWeekCount: number;
  doneTodayExact: number;

  // --- Issue data-quality (from countDocuments) ---
  noPriorityCount: number;
  noDueDateCount: number;
  noTypeCount: number;
  staleCount: number;

  // --- Bug (from countDocuments) ---
  bugCount: number;
  openBugCount: number;
  criticalBugCount: number;
  majorBugCount: number;
  todayBugResolvedCount: number;
  todayBugOpenCount: number;
  bugSeverityGroups: Array<{ value: string; count: number }>;

  // --- Other collections ---
  requirementCount: number;
  totalModules: number;
  knowledgeFileCount: number;
  chatSessionCount: number;

  // --- Derived ---
  activeIssueCount: number;
  assigneeGroups: Array<{ value: string; count: number }>;
}

export interface HomeDeltas {
  activeIssueCount: number;
  openBugCount: number;
  totalIssues: number;
  bugCount: number;
  overdueCount: number;
}

const EMPTY_STATS: HomeStats = {
  totalIssues: 0, todoCount: 0, inProgressCount: 0, inReviewCount: 0,
  doneCount: 0, backlogCount: 0, cancelledCount: 0,
  overdueCount: 0, blockedCount: 0, unassignedCount: 0,
  issueStatusGroups: [],
  todayDoneCount: 0, todayCreatedCount: 0, yesterdayDoneCount: 0,
  doneWeekCount: 0, doneLastWeekCount: 0, doneTodayExact: 0,
  noPriorityCount: 0, noDueDateCount: 0, noTypeCount: 0, staleCount: 0,
  bugCount: 0, openBugCount: 0, criticalBugCount: 0, majorBugCount: 0,
  todayBugResolvedCount: 0, todayBugOpenCount: 0, bugSeverityGroups: [],
  requirementCount: 0, totalModules: 0, knowledgeFileCount: 0, chatSessionCount: 0,
  activeIssueCount: 0, assigneeGroups: [],
};

const EMPTY_DELTAS: HomeDeltas = {
  activeIssueCount: 0, openBugCount: 0, totalIssues: 0, bugCount: 0, overdueCount: 0,
};

export interface HomeData {
  stats: HomeStats;
  deltas: Ref<HomeDeltas>;
  dataAge: Ref<number>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  retry: () => Promise<void>;
  selectedProjects: Ref<string[]>;
}

const POLL_INTERVAL_MS = 30_000;
const BASELINE_INTERVAL_MS = 300_000;
const DELTA_KEYS: (keyof HomeDeltas)[] = [
  "activeIssueCount", "openBugCount", "totalIssues", "bugCount", "overdueCount",
];

function dayStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayStr(): string { return dayStr(0); }
function yesterdayStr(): string { return dayStr(-1); }
function weekAgoStr(): string { return dayStr(-7); }

function todayMs(): number {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
}

export function useHomeData(): HomeData {
  const route = useRoute();
  const projectStore = useProjectStore();

  const loading = ref(true);
  const error = ref<string | null>(null);
  const selectedProjects = ref<string[]>([]);

  const stats = reactive<HomeStats>({ ...EMPTY_STATS });
  const deltas = ref<HomeDeltas>({ ...EMPTY_DELTAS });
  const dataAge = ref(0);

  let baseline: HomeStats = { ...EMPTY_STATS };
  let baselineTimer: ReturnType<typeof setInterval> | null = null;
  let ageTimer: ReturnType<typeof setInterval> | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function updateDeltas(): void {
    const d: Record<string, number> = {};
    for (const k of DELTA_KEYS) d[k] = (stats[k] as number) - (baseline[k] as number);
    deltas.value = d as unknown as HomeDeltas;
  }
  function saveBaseline(): void { baseline = { ...stats }; }

  /** Apply server-aggregated issue attention data (overdue/blocked/unassigned).
   *  Per-status counts come from countDocuments for exact MongoDB filter parity
   *  with getIssueList — guarantees home card numbers match linked page tables. */
  function applyIssueStats(s: KnowledgeIssuesStats): void {
    stats.totalIssues = s.stats.total;
    stats.overdueCount = s.attention.overdue;
    stats.blockedCount = s.attention.blocked;
    stats.unassignedCount = s.attention.unassigned;
  }

  /** Load totals for non-issue collections + bug counts. */
  async function loadCounts(): Promise<void> {
    const queries: Array<{ key: keyof HomeStats; cname: string; filter?: Record<string, unknown> }> = [
      // Per-status counts — exact MongoDB filters matching getIssueList
      { key: "todoCount", cname: "issues", filter: { status: "todo" } },
      { key: "inProgressCount", cname: "issues", filter: { status: "in_progress" } },
      { key: "inReviewCount", cname: "issues", filter: { status: "in_review" } },
      { key: "doneCount", cname: "issues", filter: { status: "done" } },
      { key: "backlogCount", cname: "issues", filter: { status: "backlog" } },
      { key: "cancelledCount", cname: "issues", filter: { status: "cancelled" } },
      // Bug counts
      { key: "bugCount", cname: "bugs" },
      { key: "openBugCount", cname: "bugs", filter: { status: { $in: OPEN_BUGS_QUERY } } },
      { key: "requirementCount", cname: "issues", filter: { issue_type: "requirement" } },
      { key: "totalModules", cname: "modules" },
      { key: "knowledgeFileCount", cname: "knowledge_files" },
      { key: "chatSessionCount", cname: "sessions" },
    ];

    const results = await Promise.allSettled(
      queries.map(({ cname, filter }) => countDocuments(cname, filter))
    );
    queries.forEach(({ key }, idx) => {
      const r = results[idx];
      if (r.status === "fulfilled") (stats as Record<string, unknown>)[key] = r.value.data?.count ?? 0;
    });
  }

  /** Load time-window stats via countDocuments. */
  async function loadTimeWindowStats(): Promise<void> {
    const today = todayStr();
    const yesterday = yesterdayStr();
    const weekAgo = weekAgoStr();
    const twoWeeksAgo = dayStr(-14);
    const tMs = todayMs();

    const queries: Array<{ key: keyof HomeStats; cname: string; filter: Record<string, unknown> }> = [
      { key: "todayDoneCount", cname: "issues", filter: { status: { $in: DONE_QUERY }, updated_at: { $gte: today } } },
      { key: "todayCreatedCount", cname: "issues", filter: { createdTime: { $gte: today } } },
      { key: "yesterdayDoneCount", cname: "issues", filter: { status: { $in: DONE_QUERY }, updated_at: { $gte: yesterday, $lt: today } } },
      { key: "doneWeekCount", cname: "issues", filter: { status: { $in: DONE_QUERY }, updated_at: { $gte: weekAgo } } },
      { key: "doneLastWeekCount", cname: "issues", filter: { status: { $in: DONE_QUERY }, updated_at: { $gte: twoWeeksAgo, $lt: weekAgo } } },
      { key: "doneTodayExact", cname: "issues", filter: { status: { $in: DONE_QUERY }, updated_at: { $gte: today } } },
      { key: "todayBugResolvedCount", cname: "bugs", filter: { status: { $in: ["resolved", "closed"] }, updatedAt: { $gte: tMs } } },
      { key: "todayBugOpenCount", cname: "bugs", filter: { createdTime: { $gte: today } } },
      { key: "noPriorityCount", cname: "issues", filter: { status: { $nin: NOT_DONE_QUERY }, priority: { $in: [null, "", "none"] } } },
      { key: "noDueDateCount", cname: "issues", filter: { status: { $nin: NOT_DONE_QUERY }, $or: [{ due_date: { $exists: false } }, { due_date: null }, { due_date: "" }] } },
      { key: "noTypeCount", cname: "issues", filter: { status: { $nin: NOT_DONE_QUERY }, $or: [{ issue_type: { $exists: false } }, { issue_type: null }, { issue_type: "" }] } },
      { key: "staleCount", cname: "issues", filter: { status: { $nin: NOT_DONE_QUERY }, updated_at: { $lt: twoWeeksAgo } } },
      { key: "criticalBugCount", cname: "bugs", filter: { status: { $in: OPEN_BUGS_QUERY }, severity: { $in: ["critical", "urgent", "Critical", "Urgent"] } } },
      { key: "majorBugCount", cname: "bugs", filter: { status: { $in: OPEN_BUGS_QUERY }, severity: { $in: ["major", "high", "Major", "High"] } } },
    ];

    const results = await Promise.allSettled(
      queries.map(({ cname, filter }) => countDocuments(cname, filter))
    );
    queries.forEach(({ key }, idx) => {
      const r = results[idx];
      if (r.status === "fulfilled") (stats as Record<string, unknown>)[key] = r.value.data?.count ?? 0;
    });
  }

  /** Load breakdowns: bug severity + assignee workload. */
  async function loadBreakdowns(): Promise<void> {
    try {
      const bugSevRes = await countDocuments("bugs", { status: { $in: OPEN_BUGS_QUERY } }, "severity");
      stats.bugSeverityGroups = (bugSevRes.data?.groups ?? [])
        .map(g => ({ value: (g.value || "unknown").toLowerCase(), count: g.count }))
        .sort((a, b) => b.count - a.count);
    } catch { /* non-critical */ }

    try {
      const assigneeRes = await countDocuments(
        "issues", { status: { $nin: NOT_DONE_QUERY } }, "assignee"
      );
      stats.assigneeGroups = (assigneeRes.data?.groups ?? [])
        .filter(g => g.value != null && g.value !== "")
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    } catch { /* non-critical */ }
  }

  function syncProjectFromQuery(): void {
    const q = route.query.project;
    if (typeof q === "string" && q.trim()) {
      const valid = new Set(projectStore.projects.map(p => p.key));
      selectedProjects.value = q.split(",").map(s => s.trim()).filter(k => valid.has(k));
    }
  }

  async function fetchAll(silent = false): Promise<void> {
    if (!silent) { loading.value = true; error.value = null; }
    try {
      // Load each data source independently so one failure doesn't block others.
      const [issueStats] = await Promise.allSettled([
        getKnowledgeIssueStats({}),
      ]);

      if (issueStats.status === "fulfilled") {
        applyIssueStats(issueStats.value);
      }

      // These are best-effort — non-critical if they fail.
      await Promise.allSettled([
        projectStore.fetchProjects(),
        loadCounts(),
        loadTimeWindowStats(),
        loadBreakdowns(),
      ]);

      syncProjectFromQuery();

      // Derive activeIssueCount from per-status countDocuments (same filter
      // parity as getIssueList — guarantees home card numbers match linked pages).
      stats.activeIssueCount = stats.todoCount + stats.inProgressCount + stats.inReviewCount;
      stats.issueStatusGroups = [
        { value: "todo", count: stats.todoCount },
        { value: "in_progress", count: stats.inProgressCount },
        { value: "in_review", count: stats.inReviewCount },
        { value: "done", count: stats.doneCount },
        { value: "backlog", count: stats.backlogCount },
        { value: "cancelled", count: stats.cancelledCount },
      ].filter(g => g.count > 0);

      updateDeltas();
      dataAge.value = 0;
    } catch (e: unknown) {
      if (!silent) error.value = e instanceof Error ? e.message : "Failed to load home data";
    } finally {
      if (!silent) loading.value = false;
    }
  }

  onMounted(() => {
    fetchAll();
    pollTimer = setInterval(() => fetchAll(true), POLL_INTERVAL_MS);
    ageTimer = setInterval(() => { dataAge.value++; }, 1000);
    saveBaseline();
    baselineTimer = setInterval(() => { saveBaseline(); updateDeltas(); }, BASELINE_INTERVAL_MS);
  });

  onUnmounted(() => {
    if (pollTimer !== null) clearInterval(pollTimer);
    if (ageTimer !== null) clearInterval(ageTimer);
    if (baselineTimer !== null) clearInterval(baselineTimer);
  });

  watch(() => route.query.project, () => {
    if (projectStore.projects.length > 0) syncProjectFromQuery();
  });

  return { stats, deltas, dataAge, loading, error, retry: () => fetchAll(), selectedProjects };
}