<template>
  <ECharts height="300" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { ThroughputData } from "@/types/analytics";

interface Props {
  data: ThroughputData[];
  rollingAvg?: boolean;
  stdDev?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rollingAvg: true,
  stdDev: false
});

const option = computed<ECOption>(() => {
  const periods = props.data.map(d => d.period);
  const counts = props.data.map(d => d.count);
  const avg = counts.length ? counts.reduce((s, v) => s + v, 0) / counts.length : 0;

  const series: any[] = [{
    name: "Throughput",
    data: counts,
    type: "bar" as const,
    color: "#409eff",
    barMaxWidth: 40,
    barGap: "30%"
  }];

  if (props.rollingAvg) {
    const ra = props.data.map(d => d.rolling_avg_4w);
    if (ra.some(v => v != null)) {
      series.push({
        name: "4-Week Rolling Avg",
        data: ra,
        type: "line" as const,
        smooth: true,
        lineStyle: { color: "#e6a23c", width: 2 },
        symbol: "circle" as const,
        symbolSize: 4,
        connectNulls: true
      });
    }
  }

  if (props.stdDev && counts.length >= 2) {
    const mean = avg;
    const std = Math.sqrt(counts.reduce((s, v) => s + (v - mean) ** 2, 0) / counts.length);
    series.push({
      name: "+1σ",
      data: counts.map(() => mean + std),
      type: "line" as const,
      lineStyle: { color: "#909399", type: "dashed" as const, width: 1, opacity: 0.5 },
      symbol: "none" as const
    });
    series.push({
      name: "-1σ",
      data: counts.map(() => Math.max(0, mean - std)),
      type: "line" as const,
      lineStyle: { color: "#909399", type: "dashed" as const, width: 1, opacity: 0.5 },
      symbol: "none" as const
    });
  }

  return {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: series.map(s => s.name),
      top: 0,
      textStyle: { fontSize: 12 }
    },
    grid: { top: 36, right: 16, bottom: 24, left: 44 },
    xAxis: { type: "category" as const, data: periods },
    yAxis: { type: "value" as const, name: "issues", minInterval: 1 },
    series
  };
});
</script>