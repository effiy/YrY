<template>
  <ECharts height="100%" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { BugStatusBreakdown } from "@/types/analytics";

interface Props {
  data: BugStatusBreakdown;
}

const props = defineProps<Props>();

const statusMeta: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "#f56c6c" },
  in_progress: { label: "In Progress", color: "#409eff" },
  resolved: { label: "Resolved", color: "#e6a23c" },
  closed: { label: "Closed", color: "#67c23a" }
};

const option = computed<ECOption>(() => {
  const items = Object.entries(props.data)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: statusMeta[k]?.label ?? k,
      value: v,
      itemStyle: { color: statusMeta[k]?.color ?? "#909399" }
    }));

  return {
    tooltip: { trigger: "item" as const, formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { color: "var(--el-text-color-regular)", fontSize: 12 } },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 3, borderColor: "var(--el-bg-color)", borderWidth: 2 },
        label: { show: true, position: "outside" as const, formatter: "{b}\n{c}" },
        emphasis: { scaleSize: 6 },
        data: items
      }
    ]
  };
});
</script>