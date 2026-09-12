<script setup lang="ts">
import type { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import { computed } from "vue";

const props = defineProps<{
  data: { status: string; lifecycle: string; count: number }[];
}>();

const emit = defineEmits<{
  (e: "cellClick", status: string, lifecycle: string): void;
}>();

const heatmapOption = computed<ECOption>(() => {
  const statuses = [...new Set(props.data.map(d => d.status))];
  const lifecycles = [...new Set(props.data.map(d => d.lifecycle))];
  const maxCount = Math.max(...props.data.map(d => d.count), 1);
  return {
    tooltip: {
      position: "top",
      formatter: (p: any) =>
        `<b>${p.data[0]} × ${p.data[1]}</b><br/>${p.data[2]} files`,
    },
    grid: { left: "14%", right: "5%", top: "5%", bottom: "12%" },
    xAxis: {
      type: "category",
      data: statuses,
      axisLabel: { fontSize: 10, rotate: 25 },
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: lifecycles,
      axisLabel: { fontSize: 10 },
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxCount,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: { color: ["#f0f5ff", "#91cc75", "#fac858", "#ee6666"] },
      textStyle: { fontSize: 9 },
    },
    series: [
      {
        type: "heatmap",
        data: props.data.map(d => [d.status, d.lifecycle, d.count]),
        label: { show: true, fontSize: 9 },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0,0,0,0.3)",
            borderColor: "#333",
            borderWidth: 1,
          },
        },
      },
    ],
  };
});

function onChartClick(event: any) {
  const name = event?.name || event?.data?.name;
  const data = event?.data;
  if (data && Array.isArray(data) && data.length >= 2) {
    emit("cellClick", String(data[0]), String(data[1]));
  }
}
</script>

<template>
  <div class="chart-box">
    <div class="chart-title">
      Status × Lifecycle
      <span class="chart-title-hint">(click cell to filter)</span>
    </div>
    <div class="chart-body">
      <ECharts :option="heatmapOption" height="220" @chart-click="onChartClick" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart-box {
  box-sizing: border-box;
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  .chart-title {
    padding: 3px 10px;
    font-size: 11px;
    font-weight: bold;
    border-bottom: 1px solid var(--el-border-color);
    flex-shrink: 0;
  }
  .chart-title-hint {
    font-size: 10px;
    color: #909399;
    font-weight: normal;
  }
  .chart-body {
    flex: 1;
    min-height: 0;
    width: 100%;
  }
}
</style>
