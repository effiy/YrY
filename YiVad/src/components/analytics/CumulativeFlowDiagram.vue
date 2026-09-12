<template>
  <ECharts height="360" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: { date: string; backlog: number; todo: number; in_progress: number; review: number; done: number }[];
}

const props = defineProps<Props>();

const stacks = ["Backlog", "To Do", "In Progress", "Review", "Done"];
const colors = ["#909399", "#409eff", "#e6a23c", "#9b59b6", "#67c23a"];

const option = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" as const },
  legend: { data: stacks, top: 0 },
  grid: { top: 40, right: 16, bottom: 24, left: 48 },
  xAxis: { type: "category" as const, data: props.data.map(d => d.date) },
  yAxis: { type: "value" as const },
  series: stacks.map((name, i) => ({
    name,
    type: "line" as const,
    stack: "total",
    areaStyle: {},
    color: colors[i],
    data: props.data.map(d => (d as any)[name.toLowerCase().replace(/ /g, "_")] ?? 0),
  })),
}));
</script>