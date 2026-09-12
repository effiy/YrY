<template>
  <ECharts height="280" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { ThroughputData } from "@/types/analytics";

const props = defineProps<{ data: ThroughputData[] }>();

const option = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" as const },
  grid: { top: 16, right: 16, bottom: 24, left: 40 },
  xAxis: { type: "category" as const, data: props.data.map(d => d.period) },
  yAxis: { type: "value" as const, name: "issues" },
  series: [{
    data: props.data.map(d => d.count),
    type: "bar" as const,
    color: "#409eff",
    barMaxWidth: 40,
  }],
}));
</script>