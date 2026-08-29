/**
 * Aggregation + cross-filter engine behind the project dashboard.
 *
 * Projects, issues, cycles and releases are loaded once in full and every
 * number on the page is derived client-side from those four lists. That keeps
 * the KPI tiles, the charts and the card grid describing the *same* set —
 * previously the tiles counted all projects while the grid rendered only the
 * first page.
 */
import { computed, ref, type Ref } from "vue";
import { getProjectList, type Project } from "@/api/modules/projectService";
import { getIssueList, type Issue, type IssuePriority, type IssueStatus, type IssueType } from "@/api/modules/issueService";
import { getCycleList, type Cycle } from "@/api/modules/cycleService";
import { getReleaseList, type Release } from "@/api/modules/releaseService";
import { getBugList, type BugDocument } from "@/api/modules/bug";

/** A project untouched for this long is flagged stale. */
export const STALE_DAYS = 14;
/** Trailing window for the activity sparkline. */
const ACTIVITY_DAYS = 30;
/** Undo depth for the filter stack. */
const MAX_HISTORY = 20;

export type RiskKey = "overdue" | "stale" | "unassigned" | "no_cycle" | "no_members" | "no_description";
export type HealthLevel = "good" | "warn" | "poor";

export const RISK_META: Record<RiskKey, { label: string; hint: string; color: string }> = {
  overdue: { label: "Overdue work", hint: "Has open issues past their due date", color: "#ee6666" },
  stale: { label: "Stale", hint: `No activity in ${STALE_DAYS}+ days`, color: "#e6a23c" },
  unassigned: { label: "Unassigned", hint: "Has open issues with nobody on them", color: "#fc8452" },
  no_cycle: { label: "No active cycle", hint: "Has open issues but no cycle in flight", color: "#9a60b4" },
  no_members: { label: "No members", hint: "Nobody is on the project", color: "#5470c6" },
  no_description: { label: "No description", hint: "Project has no description", color: "#909399" }
};

/** Order matters — this is the render order of the attention strip. */
export const RISK_ORDER: RiskKey[] = ["overdue", "stale", "unassigned", "no_cycle", "no_members", "no_description"];

export const FILTER_LABEL_MAP: Record<string, string> = {
  status: "Status",
  issueStatus: "Issue status",
  priority: "Priority",
  issueType: "Issue type",
  risk: "Risk",
  health: "Health",
  flagged: "Flagged",
  project: "Project"
};

export const FILTER_DIMENSION_COLORS: Record<string, string> = {
  status: "#5470c6",
  issueStatus: "#73c0de",
  priority: "#fc8452",
  issueType: "#9a60b4",
  risk: "#ee6666",
  health: "#91cc75",
  flagged: "#e6a23c",
  project: "#3ba272"
};

export interface ProjectStats {
  issues: number;
  done: number;
  open: number;
  requirements: number;
  overdue: number;
  unassigned: number;
  cycles: number;
  activeCycles: number;
  releases: number;
  pendingReleases: number;
  /** Total bugs across all statuses. */
  totalBugs: number;
  /** Latest touch across the project record and all of its issues. */
  lastActivity: string;
  statuses: Record<string, number>;
  /** Priorities of OPEN issues only — closed work is not actionable. */
  openPriorities: Record<string, number>;
  types: Record<string, number>;
}

export const EMPTY_STATS: ProjectStats = {
  issues: 0,
  done: 0,
  open: 0,
  requirements: 0,
  overdue: 0,
  unassigned: 0,
  cycles: 0,
  activeCycles: 0,
  releases: 0,
  pendingReleases: 0,
  totalBugs: 0,
  lastActivity: "",
  statuses: {},
  openPriorities: {},
  types: {}
};

const CLOSED: ReadonlySet<string> = new Set<IssueStatus>(["done", "cancelled"]);

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysSince(iso: string | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then) / 86_400_000);
}

export function useProjectInsights(filterDateStr?: Ref<string>) {
  const loading = ref(false);
  const lastUpdated = ref("");

  const projects = ref<Project[]>([]);
  const issues = ref<Issue[]>([]);
  const cycles = ref<Cycle[]>([]);
  const releases = ref<Release[]>([]);
  const bugs = ref<BugDocument[]>([]);

  /** Issues filtered by the selected date — when set, only issues due on that date. */
  const dateFilteredIssues = computed(() => {
    const raw = issues.value;
    const date = filterDateStr?.value;
    if (!date || !raw.length) return raw;
    return raw.filter(i => (i.due_date || "").slice(0, 10) === date);
  });

  const activeFilter = ref<Record<string, string>>({});
  const filterHistory = ref<Array<Record<string, string>>>([]);

  async function load() {
    loading.value = true;
    try {
      const [projectRes, issueRes, cycleRes, releaseRes, bugRes] = await Promise.all([
        getProjectList({ pageSize: 500 }),
        getIssueList({ pageSize: 2000 }),
        getCycleList({ pageSize: 500 }),
        getReleaseList({ pageSize: 500 }),
        getBugList({ pageSize: 2000 })
      ]);
      projects.value = (projectRes.data?.list as Project[]) ?? [];
      issues.value = (issueRes.data?.list as Issue[]) ?? [];
      cycles.value = (cycleRes.data?.list as Cycle[]) ?? [];
      releases.value = (releaseRes.data?.list as Release[]) ?? [];
      bugs.value = (bugRes.data?.list as BugDocument[]) ?? [];
      lastUpdated.value = new Date().toLocaleTimeString();
    } finally {
      loading.value = false;
    }
  }

  // ── Per-project aggregation ─────────────────────────────────────────────
  const statsByKey = computed(() => {
    const refDate = filterDateStr?.value || isoDay(new Date());
    const map = new Map<string, ProjectStats>();
    const ensure = (key: string): ProjectStats => {
      let s = map.get(key);
      if (!s) {
        s = { ...EMPTY_STATS, statuses: {}, openPriorities: {}, types: {} };
        map.set(key, s);
      }
      return s;
    };

    for (const p of projects.value) ensure(p.key).lastActivity = p.updated_at || "";

    for (const i of dateFilteredIssues.value) {
      const s = ensure(i.project_key);
      const closed = CLOSED.has(i.status);
      s.issues++;
      s.statuses[i.status] = (s.statuses[i.status] ?? 0) + 1;
      s.types[i.issue_type] = (s.types[i.issue_type] ?? 0) + 1;
      if (i.issue_type === "requirement") s.requirements++;
      if (i.status === "done") s.done++;
      if (!closed) {
        s.open++;
        const prio = i.priority || "none";
        s.openPriorities[prio] = (s.openPriorities[prio] ?? 0) + 1;
        if (i.due_date && i.due_date.slice(0, 10) < refDate) s.overdue++;
        if (!i.assignee) s.unassigned++;
      }
      if (i.updated_at > s.lastActivity) s.lastActivity = i.updated_at;
    }

    for (const c of cycles.value) {
      const s = ensure(c.project_key);
      s.cycles++;
      if (c.status === "active") s.activeCycles++;
    }

    for (const r of releases.value) {
      const s = ensure(r.project_key);
      s.releases++;
      if (r.status !== "released") s.pendingReleases++;
    }

    for (const b of bugs.value) {
      if (!b.project_key) continue;
      const s = ensure(b.project_key);
      s.totalBugs++;
    }

    return map;
  });

  function statsFor(key: string): ProjectStats {
    return statsByKey.value.get(key) ?? EMPTY_STATS;
  }

  function completionPct(key: string): number {
    const s = statsFor(key);
    return s.issues ? Math.round((s.done / s.issues) * 100) : 0;
  }

  // ── Risk detection ──────────────────────────────────────────────────────
  const risksByKey = computed(() => {
    const map = new Map<string, RiskKey[]>();
    for (const p of projects.value) {
      const s = statsFor(p.key);
      const risks: RiskKey[] = [];
      // Archived projects are dormant on purpose — only data-shape gaps apply.
      const dormant = p.status === "archived";
      if (s.overdue > 0) risks.push("overdue");
      if (!dormant && daysSince(s.lastActivity) >= STALE_DAYS) risks.push("stale");
      if (s.unassigned > 0) risks.push("unassigned");
      if (!dormant && s.open > 0 && s.activeCycles === 0) risks.push("no_cycle");
      if (!(p.members || []).length) risks.push("no_members");
      if (!(p.description || "").trim()) risks.push("no_description");
      map.set(p.key, risks);
    }
    return map;
  });

  function risksFor(key: string): RiskKey[] {
    return risksByKey.value.get(key) ?? [];
  }

  function healthFor(key: string): HealthLevel {
    const risks = risksFor(key);
    if (risks.includes("overdue") || risks.length >= 3) return "poor";
    if (risks.length > 0) return "warn";
    return "good";
  }

  /** How many projects carry each risk — drives the attention strip counts. */
  const riskCounts = computed(() => {
    const counts = {} as Record<RiskKey, number>;
    for (const k of RISK_ORDER) counts[k] = 0;
    for (const risks of risksByKey.value.values()) {
      for (const r of risks) counts[r]++;
    }
    return counts;
  });

  // ── Cross-filter ────────────────────────────────────────────────────────
  function setFilter(key: string, val: string) {
    filterHistory.value.push({ ...activeFilter.value });
    if (filterHistory.value.length > MAX_HISTORY) filterHistory.value.shift();
    const next = { ...activeFilter.value };
    // Clicking the value that is already applied toggles it back off.
    if (next[key] === val) delete next[key];
    else next[key] = val;
    activeFilter.value = next;
  }

  function removeFilter(key: string) {
    filterHistory.value.push({ ...activeFilter.value });
    const next = { ...activeFilter.value };
    delete next[key];
    activeFilter.value = next;
  }

  function clearAllFilters() {
    if (!Object.keys(activeFilter.value).length) return;
    filterHistory.value.push({ ...activeFilter.value });
    activeFilter.value = {};
  }

  function undoLastFilter() {
    const prev = filterHistory.value.pop();
    if (prev) activeFilter.value = prev;
  }

  const hasActiveFilter = computed(() => Object.keys(activeFilter.value).length > 0);
  const canUndo = computed(() => filterHistory.value.length > 0);

  function isDimensionFiltered(dimension: string): boolean {
    return dimension in activeFilter.value;
  }

  function matchesFilter(p: Project): boolean {
    const f = activeFilter.value;
    const s = statsFor(p.key);
    if (f.status && p.status !== f.status) return false;
    if (f.project && p.key !== f.project) return false;
    if (f.issueStatus && !(s.statuses[f.issueStatus] > 0)) return false;
    if (f.priority && !(s.openPriorities[f.priority] > 0)) return false;
    if (f.issueType && !(s.types[f.issueType] > 0)) return false;
    if (f.risk && !risksFor(p.key).includes(f.risk as RiskKey)) return false;
    if (f.health && healthFor(p.key) !== f.health) return false;
    if (f.flagged && !risksFor(p.key).length) return false;
    return true;
  }

  /** Projects carrying at least one risk — the headline "at risk" number. */
  const flaggedCount = computed(() => {
    let n = 0;
    for (const risks of risksByKey.value.values()) if (risks.length) n++;
    return n;
  });

  const activeFilterPills = computed(() =>
    Object.entries(activeFilter.value).map(([key, val]) => ({
      key,
      val,
      label: FILTER_LABEL_MAP[key] || key,
      display: key === "risk" ? RISK_META[val as RiskKey]?.label || val : key === "flagged" ? "Any risk" : val,
      color: FILTER_DIMENSION_COLORS[key] || "#909399"
    }))
  );

  // ── Roll-ups over an arbitrary project subset (the visible one) ──────────
  function rollup(list: Project[]) {
    const acc = {
      issues: 0,
      done: 0,
      open: 0,
      requirements: 0,
      overdue: 0,
      activeCycles: 0,
      cycles: 0,
      pendingReleases: 0,
      totalBugs: 0,
      statuses: {} as Record<string, number>,
      openPriorities: {} as Record<string, number>,
      types: {} as Record<string, number>
    };
    for (const p of list) {
      const s = statsFor(p.key);
      acc.issues += s.issues;
      acc.done += s.done;
      acc.open += s.open;
      acc.requirements += s.requirements;
      acc.overdue += s.overdue;
      acc.activeCycles += s.activeCycles;
      acc.cycles += s.cycles;
      acc.pendingReleases += s.pendingReleases;
      acc.totalBugs += s.totalBugs;
      for (const [k, v] of Object.entries(s.statuses)) acc.statuses[k] = (acc.statuses[k] ?? 0) + v;
      for (const [k, v] of Object.entries(s.openPriorities)) acc.openPriorities[k] = (acc.openPriorities[k] ?? 0) + v;
      for (const [k, v] of Object.entries(s.types)) acc.types[k] = (acc.types[k] ?? 0) + v;
    }
    return acc;
  }

  /** Issue-touch counts per day for the trailing window, zero-filled. */
  function activitySeries(list: Project[]) {
    const keys = new Set(list.map(p => p.key));
    const buckets = new Map<string, number>();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (ACTIVITY_DAYS - 1));
    for (let i = 0; i < ACTIVITY_DAYS; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets.set(isoDay(d), 0);
    }
    for (const i of dateFilteredIssues.value) {
      if (!keys.has(i.project_key)) continue;
      const day = (i.updated_at || "").slice(0, 10);
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([date, count]) => ({ date, count }));
  }

  return {
    loading,
    lastUpdated,
    projects,
    issues,
    cycles,
    releases,
    bugs,
    load,
    statsByKey,
    statsFor,
    completionPct,
    risksByKey,
    risksFor,
    healthFor,
    riskCounts,
    flaggedCount,
    activeFilter,
    setFilter,
    removeFilter,
    clearAllFilters,
    undoLastFilter,
    hasActiveFilter,
    canUndo,
    isDimensionFiltered,
    matchesFilter,
    activeFilterPills,
    rollup,
    activitySeries
  };
}

export type { Project };
