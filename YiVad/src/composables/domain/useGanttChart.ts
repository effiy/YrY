import { ref, computed, type Ref } from "vue";
import type { GanttTask, GanttViewOptions } from "@/types/gantt";
import { calcCriticalPath } from "@/utils/criticalPath";

export function useGanttChart(tasks: Ref<GanttTask[]>) {
  const viewOptions = ref<GanttViewOptions>({
    viewMode: "month",
    showWeekends: true,
    showCriticalPath: false,
    showToday: true,
    groupBy: "none"
  });

  const criticalPath = computed(() => {
    if (!viewOptions.value.showCriticalPath) return new Set<string>();
    return new Set(calcCriticalPath(tasks.value).path);
  });

  const dayWidth = computed(() => {
    switch (viewOptions.value.viewMode) {
      case "day":
        return 40;
      case "week":
        return 12;
      case "month":
        return 4;
      default:
        return 4;
    }
  });

  const timeRange = ref({ start: new Date(), end: new Date() });

  function recalcTimeRange() {
    if (tasks.value.length === 0) {
      const now = new Date();
      timeRange.value = {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 3, 0)
      };
      return;
    }
    const dates = tasks.value.flatMap(t => {
      const s = new Date(t.start_date).getTime();
      const e = new Date(t.end_date).getTime();
      return [s, e];
    });
    const today = Date.now();
    const min = new Date(Math.min(...dates, today));
    const max = new Date(Math.max(...dates, today));
    timeRange.value = {
      start: new Date(min.getFullYear(), min.getMonth() - 1, 1),
      end: new Date(max.getFullYear(), max.getMonth() + 2, 0)
    };
  }

  function scrollToToday() {
    const now = new Date();
    const tasksRange = tasks.value.length > 0
      ? {
          start: new Date(Math.min(...tasks.value.map(t => new Date(t.start_date).getTime()))),
          end: new Date(Math.max(...tasks.value.map(t => new Date(t.end_date).getTime())))
        }
      : { start: now, end: now };
    const windowMs = tasksRange.end.getTime() - tasksRange.start.getTime();
    const halfWindow = Math.max(windowMs / 2, 30 * 86_400_000);
    timeRange.value = {
      start: new Date(now.getTime() - halfWindow),
      end: new Date(now.getTime() + halfWindow)
    };
  }

  function fitToScreen() {
    recalcTimeRange();
  }

  function setViewMode(mode: "day" | "week" | "month") {
    viewOptions.value.viewMode = mode;
  }

  function setGroupBy(val: "none" | "assignee" | "type") {
    viewOptions.value.groupBy = val;
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

  return {
    viewOptions,
    criticalPath,
    dayWidth,
    timeRange,
    setViewMode,
    setGroupBy,
    toggleCriticalPath,
    zoomIn,
    zoomOut,
    scrollToToday,
    fitToScreen,
    recalcTimeRange
  };
}