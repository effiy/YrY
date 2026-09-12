<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="TreemapChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { TreemapChartData } from "./types";

interface Props {
  data?: TreemapChartData[];
  options?: Partial<ECOption>;
  height?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    return {
      tooltip: { formatter: "{b}: {c}" },
      series: [{
        type: "treemap" as const,
        data: props.data as unknown as Record<string, unknown>[],
        roam: false,
        label: { show: true, fontSize: 11 },
        upperLabel: { show: true, height: 28 },
        itemStyle: { borderColor: "#fff", borderWidth: 1, gapWidth: 1 },
        levels: [
          { itemStyle: { borderColor: "#555", borderWidth: 4, gapWidth: 1 }, upperLabel: { show: true } },
          { colorSaturation: [0.3, 0.6], itemStyle: { borderColorSaturation: 0.7, gapWidth: 1, borderWidth: 1 } },
        ],
      }],
      ...props.options,
    };
  }
  return (props.options as ECOption) ?? {};
});

function onClick(event: Record<string, unknown>) {
  emit("chartClick", event);
}
</script>