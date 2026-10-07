<template>
  <ECharts height="340" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { ControlChartPoint } from "@/types/analytics";

interface Props {
  data: ControlChartPoint[];
  p50: number;
  p80: number;
  p95: number;
}

const props = defineProps<Props>();

const option = computed<ECOption>(() => {
  const dates = props.data.map(d => d.date);
  const ctValues = props.data.map(d => d.cycle_time);
  const p95 = props.p95 || Math.max(...ctValues, 1);

  return {
    tooltip: {
      trigger: "item" as const,
      formatter: (p: any) => {
        const d = props.data[p.dataIndex];
        if (!d) return "";
        return `<strong>${d.issue_key || "—"}</strong><br/>Date: ${d.date}<br/>Cycle Time: ${d.cycle_time}d<br/>Lead Time: ${d.lead_time}d`;
      }
    },
    grid: { top: 24, right: 32, bottom: 32, left: 52 },
    xAxis: {
      type: "category" as const,
      data: dates,
      axisLabel: {
        rotate: 30,
        fontSize: 10,
        formatter: (v: string) => v.slice(5)
      },
      name: "Completion Date"
    },
    yAxis: {
      type: "value" as const,
      name: "days",
      min: 0,
      max: Math.ceil(p95 * 1.3) || undefined,
      splitLine: { lineStyle: { type: "dashed", color: "#e8e8e8" } }
    },
    series: [
      {
        name: "Cycle Time",
        type: "scatter" as const,
        data: ctValues,
        symbolSize: (val: number) => Math.max(4, Math.min(14, val * 2 + 2)),
        itemStyle: {
          color: (params: any) => {
            const v = ctValues[params.dataIndex];
            if (v > props.p95) return "#f56c6c";
            if (v > props.p80) return "#e6a23c";
            if (v > props.p50) return "#409eff";
            return "#67c23a";
          },
          opacity: 0.75
        }
      },
      {
        name: "P50",
        type: "line" as const,
        data: dates.map(() => props.p50),
        lineStyle: { color: "#67c23a", width: 1.5, type: "dashed" },
        symbol: "none" as const,
        markLine: {
          silent: true, symbol: "none",
          lineStyle: { color: "#67c23a", type: "dashed", width: 1 },
          label: { formatter: "P50 {c}d", position: "insideEndTop", fontSize: 10 },
          data: [{ yAxis: props.p50 }]
        }
      },
      {
        name: "P80",
        type: "line" as const,
        data: dates.map(() => props.p80),
        lineStyle: { color: "#e6a23c", width: 1.5, type: "dashed" },
        symbol: "none" as const,
        markLine: {
          silent: true, symbol: "none",
          lineStyle: { color: "#e6a23c", type: "dashed", width: 1 },
          label: { formatter: "P80 {c}d", position: "insideEndTop", fontSize: 10 },
          data: [{ yAxis: props.p80 }]
        }
      },
      {
        name: "P95",
        type: "line" as const,
        data: dates.map(() => props.p95),
        lineStyle: { color: "#f56c6c", width: 1.5, type: "dashed" },
        symbol: "none" as const,
        markLine: {
          silent: true, symbol: "none",
          lineStyle: { color: "#f56c6c", type: "dashed", width: 1 },
          label: { formatter: "P95 {c}d", position: "insideEndTop", fontSize: 10 },
          data: [{ yAxis: props.p95 }]
        }
      }
    ]
  };
});
</script>