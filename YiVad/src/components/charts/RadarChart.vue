<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="RadarChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { RadarChartData } from "./types";

interface Props {
  data?: RadarChartData;
  options?: Partial<ECOption>;
  height?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    return {
      tooltip: {},
      legend: {
        data: props.data.series.map(s => s.name),
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      radar: {
        indicator: props.data.indicators,
        center: ["50%", "48%"],
        radius: "60%",
      },
      series: props.data.series.map(s => ({
        name: s.name,
        type: "radar" as const,
        data: [{ value: s.data, name: s.name }],
        itemStyle: s.color ? { color: s.color } : undefined,
        areaStyle: { opacity: 0.15 },
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