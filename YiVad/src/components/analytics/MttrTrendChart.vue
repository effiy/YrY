<template>
  <ECharts height="100%" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { TrendDataPoint } from "@/types/analytics";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: TrendDataPoint[];
  targetHours?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  targetHours: 24,
  color: "#fac858"
});

const option = computed<ECOption>(() => ({
  tooltip: {
    trigger: "axis",
    valueFormatter: (v: unknown) => `${v}h`
  },
  grid: { top: 40, right: 16, bottom: 24, left: 48 },
  xAxis: {
    type: "category",
    data: props.data.map(d => d.date.slice(5))
  },
  yAxis: {
    type: "value",
    name: "hours",
    axisLabel: { formatter: "{value}h" }
  },
  series: [
    {
      data: props.data.map(d => d.value),
      type: "line",
      smooth: true,
      color: props.color,
      symbol: "circle",
      symbolSize: 6,
      areaStyle: {
        color: {
          type: "linear",
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: props.color + "33" },
            { offset: 1, color: props.color + "05" }
          ]
        }
      },
      markLine: {
        silent: true,
        symbol: "none",
        lineStyle: { type: "dashed", color: "#ee6666", width: 1.5 },
        label: { formatter: `SLA: ${props.targetHours}h` },
        data: [{ yAxis: props.targetHours }]
      }
    }
  ]
}));
</script>