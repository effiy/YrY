/**
 * Stats aggregation layer — pure computation over project/issue/bug data.
 * No side effects, no API calls.
 */
import { computed, type ComputedRef, type Ref } from "vue";
import type { Project } from "@/api/modules/projectService";
import type { Issue } from "@/api/modules/issueService";
import type { BugDocument } from "@/api/modules/bug";
import type { Module } from "@/api/modules/moduleService";
import { ACTIVITY_DAYS, CLOSED_STATUSES, EMPTY_STATS, isoDay, type ProjectStats } from "../types";
import { PRIORITY_COLORS } from "../constants";
import type { TopProjectRow } from "../charts";

export interface RollupResult {
  issues: number;
  done: number;
  open: number;
  overdue: number;
  activeCycles: number;
  cycles: number;
  totalBugs: number;
  statuses: Record<string, number>;
  openPriorities: Record<string, number>;
  types: Record<string, number>;
}

export interface UseProjectStatsReturn {
  statsByKey: ComputedRef<Map<string, ProjectStats>>;
  statsFor: (key: string) => ProjectStats;
  completionPct: (key: string) => number;
  rollup: (list: Project[]) => RollupResult;
  activitySeries: (list: Project[]) => { date: string; count: number }[];
  topProjects: (list: Project[], limit?: number) => TopProjectRow[];
}

export function useProjectStats(
  projects: Ref<Project[]>,
  issues: Ref<Issue[]>,
  bugs: Ref<BugDocument[]>,
  modules: Ref<Module[]>,
  filterDateStr?: Ref<string>
): UseProjectStatsReturn {
  /** Issues filtered by the selected date — when set, only issues due on that date. */
  const dateFilteredIssues = computed(() => {
    const raw = issues.value;
    const date = filterDateStr?.value;
    if (!date || !raw.length) return raw;
    return raw.filter(i => (i.due_date || "").slice(0, 10) === date);
  });

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
      const closed = CLOSED_STATUSES.has(i.status);
      s.issues++;
      s.statuses[i.status] = (s.statuses[i.status] ?? 0) + 1;
      s.types[i.issue_type] = (s.types[i.issue_type] ?? 0) + 1;
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

    for (const b of bugs.value) {
      if (!b.project_key) continue;
      const s = ensure(b.project_key);
      s.totalBugs++;
    }

    for (const m of modules.value) {
      if (!m.project_key) continue;
      const s = ensure(m.project_key);
      s.totalModules++;
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

  function rollup(list: Project[]): RollupResult {
    const acc = {
      issues: 0,
      done: 0,
      open: 0,
      overdue: 0,
      activeCycles: 0,
      cycles: 0,
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
      acc.overdue += s.overdue;
      acc.activeCycles += s.activeCycles;
      acc.cycles += s.cycles;
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

  function topProjects(list: Project[], limit = 8): TopProjectRow[] {
    return list
      .map(p => {
        const s = statsFor(p.key);
        return { key: p.key, name: p.name, open: s.open, done: s.done };
      })
      .filter(r => r.open + r.done > 0)
      .sort((a, b) => b.open + b.done - (a.open + a.done))
      .slice(0, limit);
  }

  return { statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects };
}

/** Map entity type to a display color for activity dots. */
export function activityColor(type: string): string {
  const m: Record<string, string> = { issue: "#409eff", module: "#9b59b6", bug: "#f56c6c" };
  return m[type] || "#909399";
}

/** Map issue priority to a display color — delegates to the unified palette. */
export function priorityColor(priority: string): string {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "#909399";
}
