/**
 * Cross-filter awareness composable — label mapping, dimension detection, and
 * display formatting for the knowledge base dashboard's multi-dimensional filter system.
 */
import { computed, type Ref } from "vue";
import { FILTER_LABEL_MAP, FILTER_DIMENSION_COLORS, filterKeyToDimension } from "../utils";

export function useCrossFilter(activeFilter: Ref<Record<string, string>>) {
  /** Set of chart dimension names that are currently filtered. */
  const filteredDimensions = computed(() => {
    const dims = new Set<string>();
    for (const key of Object.keys(activeFilter.value)) {
      const dim = filterKeyToDimension(key);
      if (dim) dims.add(dim);
    }
    return dims;
  });

  /** Is a given chart dimension actively filtered? */
  function isDimensionFiltered(dimension: string): boolean {
    return filteredDimensions.value.has(dimension);
  }

  /** Human-readable label for a filter key. */
  function formatFilterLabel(key: string): string {
    return FILTER_LABEL_MAP[key] || key;
  }

  /** Human-readable value for a filter key:value pair. */
  function filterDisplayValue(key: string, val: string): string {
    if (val === "__missing__") return "Missing";
    if (val === "__root__") return "Root";
    if (val === "unknown") return "Unknown";
    return val;
  }

  /** Color for a filter pill based on dimension type. */
  function filterPillColor(key: string): string {
    return FILTER_DIMENSION_COLORS[key] || "#909399";
  }

  /** Active filter entries as pills for rendering. */
  const activeFilterPills = computed(() =>
    Object.entries(activeFilter.value).map(([key, val]) => ({
      key,
      val,
      label: formatFilterLabel(key),
      display: filterDisplayValue(key, val),
      color: filterPillColor(key),
    }))
  );

  /** Breadcrumb segments for hierarchical navigation. */
  const filterBreadcrumb = computed(() => {
    const segments: { label: string; action: "clear" | "backToCategory" | "removeModule" | "removeSubModule" | ""; key?: string }[] = [
      { label: "All Files", action: "clear" },
    ];
    const f = activeFilter.value;
    if (f.category) segments.push({ label: f.category, action: "backToCategory" });
    if (f.module) segments.push({ label: f.module === "__root__" ? "root" : f.module, action: "removeModule", key: "module" });
    if (f.sub_module)
      segments.push({ label: f.sub_module === "__root__" ? "root" : f.sub_module, action: "removeSubModule", key: "sub_module" });
    return segments;
  });

  return {
    filteredDimensions,
    isDimensionFiltered,
    formatFilterLabel,
    filterDisplayValue,
    filterPillColor,
    activeFilterPills,
    filterBreadcrumb,
  };
}
