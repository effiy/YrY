<template>
  <ECharts height="280" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: Record<string, number>;
}

const props = defineProps<Props>();

const order = ["≤1d", "1–3d", "3–7d", "7–14d", "14–30d", ">30d"];
const colors = ["#67c23a", "#b3e19d", "#e6a23c", "#f0c78a", "#f56c6c", "#f89898"];

const option = computed<ECOption>(() => {
  const categories = order.filter(k => k in props.data);
  const values = categories.map(k => props.data[k] ?? 0);
  return {
    tooltip: { trigger: "axis" as const, formatter: "{b}: {c} issues" },
    grid: { top: 16, right: 16, bottom: 24, left: 48 },
    xAxis: { type: "category" as const, data: categories },
    yAxis: { type: "value" as const, name: "issues" },
    series: [{
      data: values,
      type: "bar" as const,
      barMaxWidth: 48,
      itemStyle: {
        color: (p: any) => colors[p.dataIndex] ?? "#409eff"
      },
      label: { show: true, position: "top" as const },
      markLine: {
        silent: true,
        symbol: "none",
        lineStyle: { color: "#e6a23c", type: "dashed" as const, width: 2 },
        label: { formatter: "14d threshold", position: "start", fontSize: 10, color: "#e6a23c" },
        data: [{ xAxis: "7–14d" }]
      }
    }]
  };
});
</script>