<template>
  <ECharts :option="chartOption" :height="height" @chart-click="onClick" />
</template>

<script setup lang="ts" name="PieChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { PieChartData } from "./types";

interface Props {
  data?: PieChartData[];
  options?: Partial<ECOption>;
  height?: number;
  /** "pie" | "doughnut" */
  variant?: "pie" | "doughnut";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "pie",
});

const emit = defineEmits<{ chartClick: [params: Record<string, unknown>] }>();

const chartOption = computed<ECOption>(() => {
  if (props.data) {
    const radius = props.variant === "doughnut" ? ["50%", "75%"] : ["0%", "70%"];
    return {
      tooltip: { trigger: "item" as const, formatter: "{b}: {c} ({d}%)" },
      legend: {
        orient: "vertical" as const,
        left: 0,
        top: "center",
        textStyle: { fontSize: 11 },
      },
      series: [{
        type: "pie" as const,
        radius,
        center: ["55%", "50%"],
        label: { fontSize: 11 },
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