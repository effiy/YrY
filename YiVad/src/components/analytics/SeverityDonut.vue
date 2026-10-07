<template>
  <ECharts height="100%" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { SeverityDistribution } from "@/types/analytics";

interface Props {
  data: SeverityDistribution;
}

const props = defineProps<Props>();

const severityMeta: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#f56c6c" },
  major: { label: "Major", color: "#e6a23c" },
  minor: { label: "Minor", color: "#409eff" },
  trivial: { label: "Trivial", color: "#909399" }
};

const option = computed<ECOption>(() => {
  const items = Object.entries(props.data)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: severityMeta[k]?.label ?? k,
      value: v,
      itemStyle: { color: severityMeta[k]?.color ?? "#909399" }
    }));

  if (items.length === 0) {
    items.push({ name: "No data", value: 1, itemStyle: { color: "#e0e0e0" } });
  }

  return {
    tooltip: { trigger: "item" as const, formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { color: "var(--el-text-color-regular)", fontSize: 12 } },
    series: [
      {
        type: "pie",
        radius: ["50%", "75%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: "var(--el-bg-color)", borderWidth: 3 },
        label: { show: true, position: "outside" as const, formatter: "{b}\n{c}" },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: "bold" },
          scaleSize: 8
        },
        data: items
      }
    ]
  };
});
</script>