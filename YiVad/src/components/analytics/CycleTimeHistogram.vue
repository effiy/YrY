<template>
  <ECharts height="280" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: Record<string, number>;
  mean?: number;
  median?: number;
}

const props = defineProps<Props>();

const order = ["≤1d", "1–3d", "1–7d", "7–14d", ">14d"];
const colors = ["#67c23a", "#409eff", "#e6a23c", "#f56c6c", "#909399"];

const option = computed<ECOption>(() => {
  const categories = order.filter(k => k in props.data);
  const values = categories.map(k => props.data[k] ?? 0);
  const markLines: any[] = [];
  if (props.mean != null && props.mean > 0) {
    const meanLabel = `${props.mean.toFixed(1)}d`;
    markLines.push({
      name: "Mean",
      type: "line" as const,
      markLine: {
        silent: true,
        symbol: "none",
        lineStyle: { color: "#409eff", type: "dashed" as const, width: 1.5 },
        label: { formatter: `Mean ${meanLabel}`, position: "insideEndTop" as const, fontSize: 10 },
        data: [{ xAxis: meanLabel }]
      }
    } as any);
  }
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
      ...markLines[0] ? { markLine: markLines[0].markLine } : {}
    }]
  };
});
</script>