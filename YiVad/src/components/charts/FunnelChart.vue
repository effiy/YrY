<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="FunnelChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { FunnelChartData } from "./types";

interface Props {
  data?: FunnelChartData[];
  options?: Partial<ECOption>;
  height?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    return {
      tooltip: { trigger: "item" as const, formatter: "{b}: {c}" },
      legend: {
        data: props.data.map(d => d.name),
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      series: [{
        type: "funnel" as const,
        left: "10%",
        top: 10,
        bottom: 50,
        width: "80%",
        min: 0,
        max: Math.max(...props.data.map(d => d.value)),
        sort: "descending" as const,
        gap: 2,
        label: { show: true, position: "inside" as const, fontSize: 11 },
        itemStyle: { borderColor: "#fff", borderWidth: 1 },
        emphasis: { label: { fontSize: 14 } },
        data: props.data.map(d => ({
          name: d.name,
          value: d.value,
          itemStyle: d.color ? { color: d.color } : undefined,
        })),
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