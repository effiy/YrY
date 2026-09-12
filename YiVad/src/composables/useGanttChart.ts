import { ref, computed, type Ref } from "vue";
import type { GanttTask, GanttViewOptions } from "@/types/gantt";
import { calcCriticalPath } from "@/utils/criticalPath";

export function useGanttChart(tasks: Ref<GanttTask[]>) {
  const viewOptions = ref<GanttViewOptions>({
    viewMode: "month",
    showWeekends: true,
    showCriticalPath: false,
    showToday: true,
  });

  const criticalPath = computed(() => {
    if (!viewOptions.value.showCriticalPath) return new Set<string>();
    return new Set(calcCriticalPath(tasks.value).path);
  });

  const dayWidth = computed(() => {
    switch (viewOptions.value.viewMode) {
      case "day": return 40;
      case "week": return 12;
      case "month": return 4;
      default: return 4;
    }
  });

  const timeRange = computed(() => {
    if (tasks.value.length === 0) {
      const now = new Date();
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 2, 0) };
    }
    const dates = tasks.value.flatMap((t) => [new Date(t.start_date).getTime(), new Date(t.end_date).getTime()]);
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    return {
      start: new Date(min.getFullYear(), min.getMonth() - 1, 1),
      end: new Date(max.getFullYear(), max.getMonth() + 2, 0),
    };
  });

  function setViewMode(mode: "day" | "week" | "month") {
    viewOptions.value.viewMode = mode;
  }

  function toggleCriticalPath() {
    viewOptions.value.showCriticalPath = !viewOptions.value.showCriticalPath;
  }

  function zoomIn() {
    const modes: Array<"day" | "week" | "month"> = ["day", "week", "month"];
    const idx = modes.indexOf(viewOptions.value.viewMode);
    if (idx > 0) viewOptions.value.viewMode = modes[idx - 1];
  }

  function zoomOut() {
    const modes: Array<"day" | "week" | "month"> = ["day", "week", "month"];
    const idx = modes.indexOf(viewOptions.value.viewMode);
    if (idx < modes.length - 1) viewOptions.value.viewMode = modes[idx + 1];
  }

  return { viewOptions, criticalPath, dayWidth, timeRange, setViewMode, toggleCriticalPath, zoomIn, zoomOut };
}