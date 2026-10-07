<template>
  <ECharts height="360" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: { label: string; p50: number; p80: number; p95: number }[];
  showLegend?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showLegend: true });

const option = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" as const },
  legend: props.showLegend ? { data: ["P50", "P80", "P95"], top: 0 } : undefined,
  grid: { top: props.showLegend ? 40 : 16, right: 16, bottom: 24, left: 48 },
  xAxis: { type: "category" as const, data: props.data.map(d => d.label) },
  yAxis: { type: "value" as const, name: "days" },
  series: [
    { name: "P50", data: props.data.map(d => d.p50), type: "line" as const, smooth: true, color: "#409eff" },
    { name: "P80", data: props.data.map(d => d.p80), type: "line" as const, smooth: true, color: "#e6a23c" },
    { name: "P95", data: props.data.map(d => d.p95), type: "line" as const, smooth: true, color: "#f56c6c" }
  ]
}));
</script>