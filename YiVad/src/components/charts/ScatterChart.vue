<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="ScatterChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { ScatterChartData } from "./types";

interface Props {
  data?: ScatterChartData[];
  options?: Partial<ECOption>;
  height?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    return {
      tooltip: { trigger: "item" as const },
      legend: {
        data: props.data.map(s => s.name),
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: { left: "3%", right: "4%", bottom: "12%", containLabel: true },
      xAxis: { type: "value" as const, axisLabel: { fontSize: 11 } },
      yAxis: { type: "value" as const, axisLabel: { fontSize: 11 } },
      series: props.data.map(s => ({
        name: s.name,
        type: "scatter" as const,
        data: s.data,
        itemStyle: s.color ? { color: s.color } : undefined,
      })),
      ...props.options,
    };
  }
  return (props.options as ECOption) ?? {};
});

function onClick(event: Record<string, unknown>) {
  emit("chartClick", event);
}
</script>