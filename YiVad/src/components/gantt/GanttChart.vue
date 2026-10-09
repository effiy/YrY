<template>
  <div class="gantt-chart">
    <GanttToolbar
      :view-options="viewOptions"
      :set-view-mode="setViewMode"
      :set-group-by="setGroupBy"
      :toggle-critical-path="toggleCriticalPath"
      :zoom-in="zoomIn"
      :zoom-out="zoomOut"
      @today="scrollToToday"
      @toggle-today="viewOptions.showToday = !viewOptions.showToday"
      @refresh="$emit('refresh')"
      @fit="fitToScreen"
      @export-png="exportPng"
    />
    <GanttLegend />
    <div class="gantt-chart__container" :style="{ height: containerHeight + 'px' }">
      <ECharts
        v-if="option"
        ref="echartsRef"
        :option="option"
        :height="containerHeight"
        @chart-click="onChartClick"
      />
      <div v-else class="gantt-chart__empty">
        <el-empty description="暂无任务数据，请为 Issue 设置开始/结束日期" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="GanttChart">
import { ref, computed, type Ref } from "vue";
import type { ECElementEvent } from "echarts/core";
import type { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import GanttToolbar from "./GanttToolbar.vue";
import GanttLegend from "./GanttLegend.vue";
import { useGanttChart } from "@/composables/domain/useGanttChart";
import type { GanttTask } from "@/types/gantt";

const props = defineProps<{
  tasks: GanttTask[];
  projectKey: string;
}>();

const emit = defineEmits<{
  refresh: [];
  navigate: [taskId: string];
}>();

const echartsRef = ref<InstanceType<typeof ECharts>>();

const tasksRef = computed(() => props.tasks) as unknown as Ref<GanttTask[]>;

const {
  viewOptions,
  criticalPath,
  timeRange,
  setViewMode,
  setGroupBy,
  toggleCriticalPath,
  zoomIn,
  zoomOut,
  scrollToToday,
  fitToScreen,
  recalcTimeRange,
} = useGanttChart(tasksRef);

const containerHeight = computed(() => Math.max(300, props.tasks.length * 36 + 80));

const STATUS_COLORS: Record<string, string> = {
  todo: "#909399",
  open: "#909399",
  backlog: "#909399",
  in_progress: "#409eff",
  review: "#e6a23c",
  in_review: "#e6a23c",
  done: "#67c23a",
  cancelled: "#c0c4cc",
};

const STATUS_NAMES: Record<string, string> = {
  todo: "未开始",
  open: "未开始",
  backlog: "待排期",
  in_progress: "进行中",
  review: "评审中",
  in_review: "评审中",
  done: "已完成",
  cancelled: "已取消",
};

const DURATION_MS = 86_400_000;

interface TaskLayout {
  task: GanttTask;
  startMs: number;
  endMs: number;
  catIdx: number;
  color: string;
  isCritical: boolean;
}

function buildLayout(tasks: GanttTask[]): TaskLayout[] {
  const critical = criticalPath.value;
  return tasks.map((t, i) => ({
    task: t,
    startMs: new Date(t.start_date).getTime(),
    endMs: new Date(t.end_date).getTime(),
    catIdx: i,
    color: t.overdue ? "#f56c6c" : STATUS_COLORS[t.status] || "#409eff",
    isCritical: critical.has(t.id),
  }));
}

const option = computed<ECOption | null>(() => {
  const tasks = props.tasks;
  if (!tasks.length) return null;

  recalcTimeRange();

  const categories = tasks.map(t => t.title);
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const layout = buildLayout(tasks);
  const layoutMap = new Map(layout.map(l => [l.task.id, l]));

  const startTime = timeRange.value.start.getTime();
  const endTime = timeRange.value.end.getTime();
  const today = Date.now();

  // Build dependency data
  const depLines: { fromIdx: number; fromEnd: number; toIdx: number; toStart: number }[] = [];
  for (const l of layout) {
    for (const depId of l.task.dependencies) {
      const from = layoutMap.get(depId);
      if (!from) continue;
      depLines.push({
        fromIdx: from.catIdx,
        fromEnd: from.endMs,
        toIdx: l.catIdx,
        toStart: l.startMs,
      });
    }
  }

  return {
    tooltip: {
      trigger: "item" as const,
      formatter: (params: any) => {
        const d = params.data;
        if (!d || d._depLine) return "";
        const l = layoutMap.get(d.taskId);
        if (!l) return "";
        const t = l.task;
        const dur = Math.max(1, Math.round((l.endMs - l.startMs) / DURATION_MS));
        const statusLabel = STATUS_NAMES[t.status] || t.status;
        const overdueTag = t.overdue ? ' <span style="color:#f56c6c">⚠ 已逾期</span>' : "";
        const assignee = t.assignee ? `<br/>负责人：${t.assignee}` : "";
        const deps = t.dependencies.length
          ? `<br/>依赖：${t.dependencies.map(d => taskMap.get(d)?.title || d).join("、")}`
          : "";
        return (
          `<b>${t.title}</b>${overdueTag}` +
          `<br/>${new Date(l.startMs).toLocaleDateString("zh-CN")} ~ ${new Date(l.endMs).toLocaleDateString("zh-CN")}` +
          `<br/>工期：${dur} 天 | 状态：${statusLabel} | 进度：${(t.progress * 100).toFixed(0)}%` +
          `${assignee}${deps}`
        );
      },
    },
    grid: { left: 200, right: 60, top: 20, bottom: 30 },
    xAxis: {
      type: "time" as const,
      min: startTime,
      max: endTime,
      axisLabel: {
        formatter: (val: number) => {
          const d = new Date(val);
          if (viewOptions.value.viewMode === "month") return `${d.getMonth() + 1}月`;
          return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
        },
      },
      splitLine: { show: true, lineStyle: { type: "dashed", color: "#eee" } },
    },
    yAxis: {
      type: "category" as const,
      data: categories,
      inverse: true,
      axisLabel: { width: 180, overflow: "truncate" },
    },
    series: [
      // Dependency lines
      {
        type: "custom" as const,
        z: 1,
        silent: true,
        data: depLines.map(d => ({
          _depLine: true,
          value: [d.fromIdx, d.fromEnd, d.toIdx, d.toStart],
        })),
        renderItem: (_params: any, api: any) => {
          const fromCoord = api.coord([api.value(1), api.value(0)]);
          const toCoord = api.coord([api.value(3), api.value(2)]);
          if (!fromCoord || !toCoord) return null;

          const midX = (fromCoord[0] + toCoord[0]) / 2;
          const arrowSize = 5;

          return {
            type: "group",
            children: [
              {
                type: "polyline",
                shape: {
                  points: [
                    [fromCoord[0], fromCoord[1]],
                    [midX, fromCoord[1]],
                    [midX, toCoord[1]],
                    [toCoord[0] - arrowSize, toCoord[1]],
                  ],
                },
                style: { stroke: "#999", lineWidth: 1, lineDash: [4, 3] },
              },
              {
                type: "polygon",
                shape: {
                  points: [
                    [toCoord[0], toCoord[1]],
                    [toCoord[0] - arrowSize, toCoord[1] - 3],
                    [toCoord[0] - arrowSize, toCoord[1] + 3],
                  ],
                },
                style: { fill: "#999" },
              },
            ],
          };
        },
      },
      // Task bars
      {
        type: "custom" as const,
        z: 2,
        renderItem: (_params: any, api: any) => {
          const catIdx = api.value(0);
          const start = api.coord([api.value(1), catIdx]);
          const end = api.coord([api.value(2), catIdx]);
          if (!start || !end) return null;

          const barHeight = api.size([0, 1])[1] * 0.6;
          const y = start[1] - barHeight / 2;
          const isMilestone = api.value(6);
          const isOverdue = api.value(7);
          const color = api.value(4) || "#409eff";
          const progress = api.value(5) || 0;
          const isCritical = api.value(3);

          if (isMilestone) {
            const sz = 8;
            return {
              type: "group",
              children: [
                {
                  type: "polygon",
                  shape: {
                    points: [
                      [start[0], start[1] - sz],
                      [start[0] + sz, start[1]],
                      [start[0], start[1] + sz],
                      [start[0] - sz, start[1]],
                    ],
                  },
                  style: { fill: isCritical ? "#f56c6c" : "#333" },
                },
              ],
            };
          }

          const barWidth = Math.max(end[0] - start[0], 2);

          const children: any[] = [
            // Background bar
            {
              type: "rect",
              shape: { x: start[0], y, width: barWidth, height: barHeight },
              style: { fill: color, opacity: 0.25 },
            },
            // Progress bar
            {
              type: "rect",
              shape: { x: start[0], y, width: Math.max(barWidth * progress, 0), height: barHeight },
              style: { fill: color },
            },
          ];

          // Overdue stripe overlay
          if (isOverdue) {
            children.push({
              type: "rect",
              shape: { x: start[0], y, width: barWidth, height: barHeight },
              style: {
                fill: "transparent",
                stroke: "#f56c6c",
                lineWidth: 2,
              },
            });
          }

          // Critical path indicator
          if (isCritical) {
            children.push({
              type: "rect",
              shape: { x: start[0], y: y - 1, width: barWidth, height: 2 },
              style: { fill: "#f56c6c" },
            });
            children.push({
              type: "rect",
              shape: { x: start[0], y: y + barHeight - 1, width: barWidth, height: 2 },
              style: { fill: "#f56c6c" },
            });
          }

          return { type: "group", children };
        },
        encode: { x: [1, 2], y: 0 },
        data: layout.map(l => ({
          name: l.task.title,
          value: [
            l.catIdx,
            l.startMs,
            l.endMs,
            l.isCritical,
            l.color,
            l.task.progress,
            l.task.isMilestone,
            l.task.overdue,
          ],
          taskId: l.task.id,
          progress: l.task.progress,
        })),
        // Today mark line on this series
        markLine: viewOptions.value.showToday
          ? {
              silent: true,
              symbol: "none",
              lineStyle: { color: "#e6a23c", type: "solid", width: 1.5 },
              label: {
                formatter: "今天",
                position: "insideEndTop",
                color: "#e6a23c",
                fontSize: 11,
              },
              data: [{ xAxis: today }],
            }
          : undefined,
      },
    ],
  } as ECOption;
});

function onChartClick(event: ECElementEvent) {
  const data = (event as any).data;
  if (data && data.taskId) {
    const task = props.tasks.find(t => t.id === data.taskId);
    if (task) {
      emit("navigate", task.id);
    }
  }
}

function exportPng() {
  const instance = echartsRef.value?.getInstance();
  if (!instance) return;
  const url = instance.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" });
  const a = document.createElement("a");
  a.href = url;
  a.download = `gantt-${props.projectKey}.png`;
  a.click();
}
</script>

<style scoped lang="scss">
.gantt-chart {
  width: 100%;
}
.gantt-chart__container {
  min-height: 300px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}
.gantt-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}
</style>