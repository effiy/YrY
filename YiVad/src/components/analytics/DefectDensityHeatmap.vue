<template>
  <ECharts height="320" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import * as echarts from "echarts/core";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: { module: string; bugs: number }[];
}

const props = defineProps<Props>();

const maxBugs = computed(() => Math.max(...props.data.map(d => d.bugs), 1));

const option = computed<ECOption>(() => {
  const seriesData = props.data.map((d, i) => ({
    value: d.bugs,
    name: d.module,
    itemStyle: {
      color: d.bugs >= maxBugs.value * 0.75
        ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "#f56c6c" }, { offset: 1, color: "#e6a23c" }
          ])
        : d.bugs >= maxBugs.value * 0.4
        ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "#e6a23c" }, { offset: 1, color: "#409eff" }
          ])
        : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "#409eff" }, { offset: 1, color: "#67c23a" }
          ]),
      borderRadius: [0, 6, 6, 0]
    }
  }));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        return `<strong>${p.name}</strong><br/>Defects: <b>${p.value}</b>`;
      }
    },
    grid: { top: 8, right: 48, bottom: 4, left: 4 },
    xAxis: {
      type: "value",
      name: "bugs",
      nameTextStyle: { fontSize: 11, color: "var(--el-text-color-secondary)" },
      axisLabel: { fontSize: 11 },
      splitLine: { lineStyle: { color: "var(--el-border-color-lighter)", type: "dashed" } }
    },
    yAxis: {
      type: "category",
      data: props.data.map(d => d.module).reverse(),
      inverse: true,
      axisLabel: { fontSize: 12, width: 120, overflow: "truncate" },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [{
      type: "bar",
      data: seriesData.reverse(),
      barMaxWidth: 22,
      label: {
        show: true,
        position: "right",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--el-text-color-secondary)"
      },
      emphasis: {
        itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,.15)" }
      }
    }]
  };
});
</script>