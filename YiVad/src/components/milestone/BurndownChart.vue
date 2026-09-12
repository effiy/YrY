<template>
  <div class="burndown-chart">
    <ECharts v-if="option" :option="option" height="300" />
    <el-empty v-else description="暂无燃尽数据" />
  </div>
</template>

<script setup lang="ts" name="BurndownChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { Milestone } from "@/types/milestone";

const props = defineProps<{
  milestone: Milestone;
  dates: string[];
  remaining: number[];
}>();

const option = computed<ECOption | null>(() => {
  if (!props.dates.length) return null;

  const idealLine = props.dates.map((_, i) => {
    const total = props.remaining[0] || 1;
    return total - (total / (props.dates.length - 1)) * i;
  });

  return {
    tooltip: { trigger: "axis" as const },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: "category" as const, data: props.dates, axisLabel: { rotate: 30 } },
    yAxis: { type: "value" as const, name: "剩余工作量" },
    series: [
      { name: "理想进度", type: "line", data: idealLine, lineStyle: { type: "dashed" as const, color: "#909399" }, itemStyle: { color: "#909399" } },
      { name: "实际进度", type: "line", data: props.remaining, areaStyle: { opacity: 0.15, color: "#409eff" }, itemStyle: { color: "#409eff" } },
    ],
  } as ECOption;
});
</script>