<template>
  <ECharts height="100%" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { BugAgeDistribution } from "@/types/analytics";

interface Props {
  data: BugAgeDistribution;
}

const props = defineProps<Props>();

const ageLabels: Record<string, string> = {
  lt_1d: "< 1 day",
  "1_3d": "1–3 days",
  "3_7d": "3–7 days",
  "7_30d": "7–30 days",
  gt_30d: "> 30 days"
};

const ageColors: Record<string, string> = {
  lt_1d: "#67c23a",
  "1_3d": "#409eff",
  "3_7d": "#e6a23c",
  "7_30d": "#f56c6c",
  gt_30d: "#909399"
};

const option = computed<ECOption>(() => {
  const keys = ["lt_1d", "1_3d", "3_7d", "7_30d", "gt_30d"];
  return {
    tooltip: { trigger: "axis" as const, axisPointer: { type: "shadow" as const } },
    grid: { top: 8, right: 40, bottom: 8, left: 100 },
    xAxis: { type: "value" as const },
    yAxis: {
      type: "category" as const,
      data: keys.map(k => ageLabels[k]),
      inverse: true
    },
    series: [
      {
        type: "bar",
        data: keys.map(k => ({
          value: props.data[k] ?? 0,
          itemStyle: {
            color: ageColors[k],
            borderRadius: [0, 4, 4, 0]
          }
        })),
        barMaxWidth: 24,
        label: { show: true, position: "right" as const, fontSize: 12 }
      }
    ]
  };
});
</script>