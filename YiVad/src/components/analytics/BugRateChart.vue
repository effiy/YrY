<template>
  <ECharts height="100%" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { TrendDataPoint } from "@/types/analytics";

import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: TrendDataPoint[];
  title?: string;
  color?: string;
  area?: boolean;
}

const props = withDefaults(defineProps<Props>(), { color: "#409eff", area: true });

const option = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" as const },
  grid: { top: 40, right: 16, bottom: 24, left: 48 },
  xAxis: { type: "category" as const, data: props.data.map(d => d.date) },
  yAxis: { type: "value" as const },
  series: [{
    data: props.data.map(d => d.value),
    type: "line" as const,
    smooth: true,
    color: props.color,
    areaStyle: props.area ? { color: { type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: props.color + "33" }, { offset: 1, color: props.color + "05" }] } } : undefined,
  }],
}));
</script>