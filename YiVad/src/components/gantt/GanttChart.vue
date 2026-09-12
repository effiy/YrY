<template>
  <div class="gantt-chart">
    <GanttToolbar
      :view-options="viewOptions"
      :set-view-mode="setViewMode"
      :toggle-critical-path="toggleCriticalPath"
      :zoom-in="zoomIn"
      :zoom-out="zoomOut"
      @today="scrollToToday"
    />
    <div ref="containerRef" class="gantt-chart__container">
      <ECharts v-if="option" :option="option" height="auto" @chart-click="onChartClick" />
      <div v-else class="gantt-chart__empty">
        <el-empty description="暂无任务数据，请为 Issue 设置开始/结束日期" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="GanttChart">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { ECElementEvent } from "echarts/core";
import type { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import GanttToolbar from "./GanttToolbar.vue";
import { useGanttChart } from "@/composables/useGanttChart";
import { useGanttDrag } from "@/composables/useGanttDrag";
import { updateDocument } from "@/api/modules/dataService";
import type { GanttTask } from "@/types/gantt";

const props = defineProps<{
  tasks: GanttTask[];
  projectKey: string;
}>();

const containerRef = ref<HTMLDivElement>();

const { viewOptions, criticalPath, dayWidth, timeRange, setViewMode, toggleCriticalPath, zoomIn, zoomOut } =
  useGanttChart(computed(() => props.tasks));

async function onTaskUpdate(taskId: string, start: string, end: string) {
  await updateDocument("issues", taskId, { start_date: start, end_date: end, updated_at: new Date().toISOString() });
}

const { isDragging, onDragStart, onDragMove, onDragEnd } = useGanttDrag(
  computed(() => props.tasks),
  dayWidth,
  onTaskUpdate,
);

const STATUS_COLORS: Record<string, string> = {
  open: "#909399",
  in_progress: "#409eff",
  review: "#e6a23c",
  done: "#67c23a",
  cancelled: "#c0c4cc",
};

const option = computed<ECOption | null>(() => {
  const tasks = props.tasks;
  if (!tasks.length) return null;

  const startTime = timeRange.value.start.getTime();
  const endTime = timeRange.value.end.getTime();
  const categories = tasks.map((t) => t.title);

  return {
    tooltip: {
      formatter: (params: any) => {
        const d = params.data;
        if (!d) return "";
        return `<b>${d.name}</b><br/>${d.value[1]} ~ ${d.value[2]}<br/>进度: ${(d.progress * 100).toFixed(0)}%`;
      },
    },
    grid: { left: 200, right: 40, top: 20, bottom: 20 },
    xAxis: {
      type: "time" as const,
      min: startTime,
      max: endTime,
      axisLabel: { formatter: (val: number) => new Date(val).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) },
    },
    yAxis: { type: "category" as const, data: categories, inverse: true, axisLabel: { width: 180, overflow: "truncate" } },
    series: [
      {
        type: "custom" as const,
        renderItem: (_params: any, api: any) => {
          const catIdx = api.value(0);
          const start = api.coord([api.value(1), catIdx]);
          const end = api.coord([api.value(2), catIdx]);
          const height = api.size([0, 1])[1] * 0.6;
          const y = start[1] - height / 2;

          const isCritical = api.value(3);
          const color = isCritical ? "#f56c6c" : api.value(4) || "#409eff";
          const progress = api.value(5) || 0;

          const rect = {
            type: "group",
            children: [
              { type: "rect", shape: { x: start[0], y, width: Math.max(end[0] - start[0], 2), height }, style: { fill: color, opacity: 0.3 } },
              { type: "rect", shape: { x: start[0], y, width: Math.max((end[0] - start[0]) * progress, 0), height }, style: { fill: color } },
            ],
          };
          return rect;
        },
        encode: { x: [1, 2], y: 0 },
        data: tasks.map((t) => ({
          name: t.title,
          value: [
            categories.indexOf(t.title),
            new Date(t.start_date).getTime(),
            new Date(t.end_date).getTime(),
            criticalPath.value.has(t.id),
            STATUS_COLORS[t.status] || "#409eff",
            t.progress || 0,
          ],
          taskId: t.id,
          progress: t.progress,
        })),
      },
    ],
  } as ECOption;
});

function onChartClick(event: ECElementEvent) {
  // Handle task bar click — navigate to issue detail or show info
}

function scrollToToday() {
  // Reset time range to center on today
}

// Drag handling via pointer events
function onPointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement;
  const taskBar = target.closest("[data-task-id]");
  if (taskBar) {
    const taskId = taskBar.getAttribute("data-task-id")!;
    const edge = taskBar.getAttribute("data-edge") as "left" | "right" | "move" | null;
    if (edge) onDragStart(taskId, edge, e.clientX);
  }
}

function onPointerMove(e: PointerEvent) {
  if (isDragging.value) onDragMove(e.clientX);
}

function onPointerUp() {
  if (isDragging.value) onDragEnd();
}

onMounted(() => {
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
});
</script>

<style scoped lang="scss">
.gantt-chart {
  width: 100%;
}
.gantt-chart__container {
  height: 500px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
}
.gantt-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>