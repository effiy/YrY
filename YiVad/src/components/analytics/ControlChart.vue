<template>
  <ECharts height="380" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { ControlChartPoint } from "@/types/analytics";

interface Props {
  data: ControlChartPoint[];
  ucl: number;
  lcl: number;
  mean: number;
}

const props = defineProps<Props>();

const COLORS = {
  scatter: "#409eff",
  maLine: "#303133",
  ucl: "#f56c6c",
  lcl: "#f56c6c",
  mean: "#909399"
};

const option = computed<ECOption>(() => ({
  tooltip: {
    trigger: "item" as const,
    formatter: (p: any) => {
      const d = props.data[p.dataIndex];
      if (!d) return "";
      return `
        <strong>${d.issue_key || "—"}</strong><br/>
        Date: ${d.date}<br/>
        Cycle Time: ${d.cycle_time}d<br/>
        ${d.moving_avg_5 != null ? `5-Issue MA: ${d.moving_avg_5}d` : ""}
      `;
    }
  },
  grid: { top: 24, right: 24, bottom: 32, left: 56 },
  xAxis: {
    type: "category" as const,
    data: props.data.map(d => d.date),
    axisLabel: { rotate: 30, fontSize: 11 },
    name: "Completion Date"
  },
  yAxis: {
    type: "value" as const,
    name: "days",
    min: 0,
    max: Math.ceil(props.ucl * 1.3) || undefined
  },
  series: [
    {
      name: "Cycle Time",
      type: "scatter" as const,
      data: props.data.map(d => d.cycle_time),
      symbolSize: 8,
      itemStyle: {
        color: COLORS.scatter,
        opacity: 0.7
      }
    },
    {
      name: "5-Issue MA",
      type: "line" as const,
      data: props.data.map(d => d.moving_avg_5),
      smooth: true,
      lineStyle: { color: COLORS.maLine, width: 2 },
      symbol: "none" as const,
      connectNulls: true
    },
    {
      name: "Upper Control Limit (UCL)",
      type: "line" as const,
      data: props.data.map(() => props.ucl),
      lineStyle: { color: COLORS.ucl, type: "dashed" as const, width: 1.5 },
      symbol: "none" as const,
      markLine: {
        silent: true,
        symbol: "none",
        lineStyle: { color: COLORS.ucl, type: "dashed" as const, width: 1.5 },
        label: { formatter: "UCL {c}d", position: "end", fontSize: 11 },
        data: [{ yAxis: props.ucl }]
      }
    },
    {
      name: "Lower Control Limit (LCL)",
      type: "line" as const,
      data: props.data.map(() => props.lcl),
      lineStyle: { color: COLORS.lcl, type: "dashed" as const, width: 1.5 },
      symbol: "none" as const
    },
    {
      name: "Mean",
      type: "line" as const,
      data: props.data.map(() => props.mean),
      lineStyle: { color: COLORS.mean, type: "dotted" as const, width: 1.5 },
      symbol: "none" as const
    }
  ]
}));
</script>