<template>
  <ECharts height="280" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { TrendDataPoint } from "@/types/analytics";

interface Props {
  issueData: TrendDataPoint[];
  bugData: TrendDataPoint[];
}

const props = defineProps<Props>();

const option = computed<ECOption>(() => {
  const hasIssue = props.issueData.length > 0;
  const hasBug = props.bugData.length > 0;

  if (!hasIssue && !hasBug) {
    return {
      title: { text: "No trend data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } }
    } as ECOption;
  }

  return {
    tooltip: { trigger: "axis" as const },
    legend: { data: ["Issues", "Bugs"], bottom: 0 },
    grid: { top: 8, right: 16, bottom: 32, left: 48 },
    xAxis: {
      type: "category" as const,
      data: (hasIssue ? props.issueData : props.bugData).map(d => d.date)
    },
    yAxis: { type: "value" as const },
    series: [
      {
        name: "Issues",
        type: "line" as const,
        smooth: true,
        data: props.issueData.map(d => d.value),
        color: "#409eff",
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64,158,255,0.2)" },
              { offset: 1, color: "rgba(64,158,255,0.02)" }
            ]
          }
        }
      },
      {
        name: "Bugs",
        type: "line" as const,
        smooth: true,
        data: props.bugData.map(d => d.value),
        color: "#f56c6c",
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245,108,108,0.2)" },
              { offset: 1, color: "rgba(245,108,108,0.02)" }
            ]
          }
        }
      }
    ]
  };
});
</script>