<template>
  <ECharts height="280" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { InflowOutflowData } from "@/types/analytics";

interface Props {
  data: InflowOutflowData;
}

const props = defineProps<Props>();

const option = computed<ECOption>(() => {
  const dates = props.data.inflow.map(d => d.date);
  const inflow = props.data.inflow.map(d => d.value);
  const outflow = props.data.outflow.map(d => d.value);
  const netFlow: number[] = [];
  let cum = 0;
  for (let i = 0; i < dates.length; i++) {
    cum += (inflow[i] || 0) - (outflow[i] || 0);
    netFlow.push(cum);
  }

  const maxAbs = Math.max(Math.abs(Math.max(...netFlow, 0)), Math.abs(Math.min(...netFlow, 0)), 5);

  return {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: any) => {
        const idx = params[0]?.dataIndex;
        if (idx == null) return "";
        return `<strong>${dates[idx]}</strong><br/>
          Inflow: +${inflow[idx] || 0}<br/>
          Outflow: −${outflow[idx] || 0}<br/>
          Net: ${netFlow[idx] >= 0 ? '+' : ''}${netFlow[idx]}<br/>
          Cumulative: <b style="color:${netFlow[idx] > 0 ? '#f56c6c' : '#67c23a'}">${netFlow[idx] > 0 ? '+' : ''}${netFlow[idx]}</b>`;
      }
    },
    grid: { top: 32, right: 24, bottom: 24, left: 52 },
    xAxis: {
      type: "category" as const,
      data: dates,
      axisLabel: { rotate: 30, fontSize: 10, formatter: (v: string) => v.slice(5) }
    },
    yAxis: [
      {
        type: "value" as const,
        name: "per day",
        splitLine: { lineStyle: { type: "dashed", color: "#e8e8e8" } }
      },
      {
        type: "value" as const,
        name: "cumulative",
        min: -maxAbs * 1.2,
        max: maxAbs * 1.2,
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: "Inflow",
        type: "bar" as const,
        data: inflow,
        itemStyle: { color: "#f56c6c", borderRadius: [2, 2, 0, 0] },
        barWidth: "60%",
        yAxisIndex: 0
      },
      {
        name: "Outflow",
        type: "bar" as const,
        data: outflow.map(v => -v),
        itemStyle: { color: "#67c23a", borderRadius: [0, 0, 2, 2] },
        barWidth: "60%",
        yAxisIndex: 0
      },
      {
        name: "Cumulative Net",
        type: "line" as const,
        data: netFlow,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { color: "#409eff", width: 2.5 },
        symbol: "circle" as const,
        symbolSize: 4,
        areaStyle: {
          color: {
            type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64,158,255,0.15)" },
              { offset: 1, color: "rgba(64,158,255,0.02)" }
            ]
          }
        },
        markLine: {
          silent: true, symbol: "none",
          lineStyle: { color: "#909399", type: "dashed", width: 1 },
          label: { formatter: "Zero", fontSize: 10, position: "end" },
          data: [{ yAxis: 0 }]
        }
      }
    ]
  };
});
</script>