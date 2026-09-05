/**
 * Filter management layer — pure state management for cross-dimension filtering.
 * No dependency on data sources, stats, or risk detection.
 */
import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { Project } from "@/api/modules/projectService";
import {
  FILTER_DIMENSION_COLORS,
  FILTER_LABEL_MAP,
  MAX_HISTORY,
  RISK_META,
  type FilterPill,
  type FilterState,
  type HealthLevel,
  type ProjectStats,
  type RiskKey
} from "../types";

export interface UseProjectFilterReturn {
  activeFilter: Ref<FilterState>;
  setFilter: (key: string, val: string) => void;
  removeFilter: (key: string) => void;
  clearAllFilters: () => void;
  undoLastFilter: () => void;
  hasActiveFilter: ComputedRef<boolean>;
  canUndo: ComputedRef<boolean>;
  /** Pure — receives pre-computed stats/risks/health, does not call other composables. */
  matchesFilter: (project: Project, stats: ProjectStats, risks: RiskKey[], health: HealthLevel) => boolean;
  activeFilterPills: ComputedRef<FilterPill[]>;
}

export function useProjectFilter(): UseProjectFilterReturn {
  const activeFilter = ref<FilterState>({});
  const filterHistory = ref<FilterState[]>([]);

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

  function matchesFilter(
    project: Project,
    stats: ProjectStats,
    risks: RiskKey[],
    health: HealthLevel
  ): boolean {
    const f = activeFilter.value;
    if (f.status && project.status !== f.status) return false;
    if (f.project && project.key !== f.project) return false;
    if (f.issueStatus && !(stats.statuses[f.issueStatus] > 0)) return false;
    if (f.priority && !(stats.openPriorities[f.priority] > 0)) return false;
    if (f.issueType && !(stats.types[f.issueType] > 0)) return false;
    if (f.risk && !risks.includes(f.risk as RiskKey)) return false;
    if (f.health && health !== f.health) return false;
    if (f.flagged && !risks.length) return false;
    return true;
  }

  const activeFilterPills = computed<FilterPill[]>(() =>
    Object.entries(activeFilter.value).map(([key, val]) => ({
      key,
      val,
      label: FILTER_LABEL_MAP[key] || key,
      display: key === "risk" ? RISK_META[val as RiskKey]?.label || val : key === "flagged" ? "Any risk" : val,
      color: FILTER_DIMENSION_COLORS[key] || "#909399"
    }))
  );

  return { activeFilter, setFilter, removeFilter, clearAllFilters, undoLastFilter, hasActiveFilter, canUndo, matchesFilter, activeFilterPills };
}