<template>
  <ECharts height="100%" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { TrendDataPoint } from "@/types/analytics";

const props = defineProps<{ data: TrendDataPoint[] }>();

const option = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" as const },
  grid: { top: 40, right: 16, bottom: 24, left: 48 },
  xAxis: { type: "category" as const, data: props.data.map(d => d.date) },
  yAxis: { type: "value" as const, name: "%" },
  series: [{
    data: props.data.map(d => d.value),
    type: "line" as const,
    smooth: true,
    color: "#e6a23c",
    areaStyle: { color: { type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(230,162,60,0.25)" }, { offset: 1, color: "rgba(230,162,60,0.02)" }] } },
  }],
}));
</script>