<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="HeatmapChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { HeatmapData } from "./types";

interface Props {
  data?: HeatmapData;
  options?: Partial<ECOption>;
  height?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    return {
      tooltip: { position: "top" as const },
      grid: { left: "15%", right: "5%", top: "3%", bottom: "15%" },
      xAxis: { type: "category" as const, data: props.data.xAxis, splitArea: { show: true }, axisLabel: { fontSize: 10, rotate: 45 } },
      yAxis: { type: "category" as const, data: props.data.yAxis, splitArea: { show: true }, axisLabel: { fontSize: 10 } },
      visualMap: {
        min: props.data.min ?? 0,
        max: props.data.max ?? 100,
        calculable: true,
        orient: "horizontal" as const,
        left: "center",
        bottom: 0,
      },
      series: [{
        type: "heatmap" as const,
        data: props.data.data,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" } },
      }],
      ...props.options,
    };
  }
  return (props.options as ECOption) ?? {};
});

function onClick(event: Record<string, unknown>) {
  emit("chartClick", event);
}
</script>