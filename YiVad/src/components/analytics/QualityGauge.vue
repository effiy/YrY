<template>
  <div class="quality-gauge">
    <ECharts height="100%" :option="option" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  score: number;
  prevScore?: number;
}

const props = defineProps<Props>();

const option = computed<ECOption>(() => {
  const bandColor =
    props.score >= 80 ? "#67c23a" : props.score >= 60 ? "#e6a23c" : "#f56c6c";

  const detailFormatter =
    props.prevScore != null
      ? `{value}\n{delta|vs prev: ${props.prevScore}}`
      : "{value}";

  return {
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        center: ["50%", "56%"],
        radius: "92%",
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          show: true,
          lineStyle: {
            width: 20,
            color: [
              [0.3, "#f56c6c"],
              [0.6, "#e6a23c"],
              [0.8, "#409eff"],
              [1, "#67c23a"]
            ]
          }
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "65%",
          width: 7,
          offsetCenter: [0, "-8%"],
          itemStyle: { color: bandColor }
        },
        axisTick: {
          length: 10,
          distance: -20,
          lineStyle: { color: "auto", width: 2 }
        },
        splitLine: {
          length: 26,
          distance: -22,
          lineStyle: { color: "auto", width: 4 }
        },
        axisLabel: {
          distance: 28,
          color: "var(--el-text-color-secondary)",
          fontSize: 11
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 22,
          itemStyle: { borderWidth: 3, borderColor: bandColor }
        },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 48,
          fontWeight: "bold",
          offsetCenter: [0, "54%"],
          formatter: detailFormatter,
          color: bandColor,
          rich: {
            delta: {
              fontSize: 13,
              fontWeight: "normal",
              color: "var(--el-text-color-secondary)",
              padding: [8, 0, 0, 0]
            }
          }
        },
        data: [{ value: props.score, name: "Quality Score" }]
      }
    ]
  };
});
</script>

<style scoped lang="scss">
.quality-gauge {
  flex: 1;
  min-height: 0;
}
</style>