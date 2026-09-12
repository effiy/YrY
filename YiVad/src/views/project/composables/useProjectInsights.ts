/**
 * Composition entry — combines data, stats, risk, and filter layers.
 * Public API is fully backward-compatible with the pre-refactor version.
 */
import type { Ref } from "vue";
import { useProjectData } from "./useProjectData";
import { useProjectStats } from "./useProjectStats";
import { useProjectRisk } from "./useProjectRisk";
import { useProjectFilter } from "./useProjectFilter";

// Re-export types and constants for callers that haven't migrated to types.ts yet.
export {
  type RiskKey,
  type HealthLevel,
  type ProjectStats,
  type FilterPill,
  type FilterState,
  RISK_META,
  RISK_ORDER,
  FILTER_LABEL_MAP,
  FILTER_DIMENSION_COLORS,
  STALE_DAYS,
  EMPTY_STATS,
  daysSince
} from "../types";

export type { Project } from "@/api/modules/projectService";

export function useProjectInsights(filterDateStr?: Ref<string>) {
  const { loading, lastUpdated, projects, issues, bugs, modules, load } = useProjectData();
  const { statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects } =
    useProjectStats(projects, issues, bugs, modules, filterDateStr);
  const { risksByKey, risksFor, healthFor: riskHealthFor, riskCounts, flaggedCount } =
    useProjectRisk(projects, issues, statsByKey, filterDateStr);
  const { activeFilter, setFilter, removeFilter, clearAllFilters, undoLastFilter,
    hasActiveFilter, canUndo, matchesFilter: filterMatchesFilter, activeFilterPills } = useProjectFilter();

  // Wrap pure functions to maintain the pre-refactor API (key-based, not value-based).
  const healthFor = (key: string) => riskHealthFor(risksFor(key));
  const matchesFilter = (p: { key: string }) =>
    filterMatchesFilter(p as Parameters<typeof filterMatchesFilter>[0], statsFor(p.key), risksFor(p.key), healthFor(p.key));

  return {
    loading,
    lastUpdated,
    projects,
    issues,
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
    matchesFilter,
    activeFilterPills,
    rollup,
    activitySeries
  };
}