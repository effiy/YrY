<template>
  <ECharts height="320" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: { module: string; bugs: number }[];
}

const props = defineProps<Props>();

const maxBugs = computed(() => Math.max(...props.data.map(d => d.bugs), 1));

const option = computed<ECOption>(() => ({
  tooltip: {},
  grid: { top: 8, right: 16, bottom: 24, left: 120 },
  xAxis: { type: "value" as const, name: "bugs" },
  yAxis: { type: "category" as const, data: props.data.map(d => d.module), inverse: true },
  series: [{
    data: props.data.map(d => d.bugs),
    type: "bar" as const,
    barMaxWidth: 20,
    itemStyle: {
      color: {
        type: "linear" as const, x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [
          { offset: 0, color: "#67c23a" },
          { offset: 0.5, color: "#e6a23c" },
          { offset: 1, color: "#f56c6c" },
        ],
      },
    },
    label: { show: true, position: "right" as const },
  }],
  visualMap: { show: false, min: 0, max: maxBugs.value, inRange: { color: ["#e8f5e9", "#ffebee"] } },
}));
</script>