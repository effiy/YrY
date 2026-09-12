<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="BarChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { buildAxisChartOption, type ChartData } from "./types";

interface Props {
  data?: ChartData;
  options?: Partial<ECOption>;
  height?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    const chartData = { ...props.data };
    if (props.options) {
      return buildAxisChartOption(chartData, "bar", props.options);
    }
    const series = chartData.series.map(s => ({
      ...s,
      smooth: false,
    }));
    return buildAxisChartOption({ ...chartData, series }, "bar");
  }
  return (props.options as ECOption) ?? {};
});

function onClick(event: Record<string, unknown>) {
  emit("chartClick", event);
}
</script>