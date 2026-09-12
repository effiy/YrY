<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="GaugeChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { GaugeData } from "./types";

interface Props {
  data?: GaugeData;
  options?: Partial<ECOption>;
  height?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    const { value, min = 0, max = 100, label = "" } = props.data;
    return {
      tooltip: { formatter: `{b}: {c}${label ? ` ${label}` : ""}` },
      series: [{
        type: "gauge" as const,
        min,
        max,
        detail: { formatter: `{value}${label ? ` ${label}` : ""}`, fontSize: 20 },
        data: [{ value, name: label }],
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.3, "#67c23a"],
              [0.7, "#e6a23c"],
              [1, "#f56c6c"],
            ],
          },
        },
        pointer: { length: "60%", width: 6 },
        axisTick: { distance: -18, length: 8 },
        splitLine: { distance: -22, length: 14 },
        axisLabel: { distance: -30, fontSize: 10 },
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