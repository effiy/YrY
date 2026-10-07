<template>
  <ECharts height="100%" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { InflowOutflowData } from "@/types/analytics";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: InflowOutflowData;
}

const props = defineProps<Props>();

const option = computed<ECOption>(() => {
  if (!props.data?.inflow?.length) return {};

  const netData = props.data.inflow.map((d, i) => ({
    date: d.date,
    value: d.value - (props.data.outflow[i]?.value ?? 0)
  }));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" }
    },
    legend: {
      data: ["New Bugs", "Resolved", "Net Change"],
      top: 0
    },
    grid: { top: 40, right: 16, bottom: 24, left: 48 },
    xAxis: {
      type: "category",
      data: props.data.inflow.map(d => d.date.slice(5))
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "New Bugs",
        type: "bar",
        data: props.data.inflow.map(d => d.value),
        itemStyle: { color: "#5470c6" },
        barMaxWidth: 20
      },
      {
        name: "Resolved",
        type: "bar",
        data: props.data.outflow.map(d => d.value),
        itemStyle: { color: "#91cc75" },
        barMaxWidth: 20
      },
      {
        name: "Net Change",
        type: "line",
        data: netData.map(d => d.value),
        smooth: true,
        lineStyle: { color: "#ee6666", width: 2 },
        itemStyle: { color: "#ee6666" },
        symbol: "circle",
        symbolSize: 6
      }
    ]
  };
});
</script>