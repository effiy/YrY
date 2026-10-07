<template>
  <ECharts height="280" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: Record<string, number>;
}

const props = defineProps<Props>();

const STATUS_COLORS: Record<string, string> = {
  "To Do": "#909399",
  "todo": "#909399",
  "In Progress": "#409eff",
  "in_progress": "#409eff",
  "Review": "#e6a23c",
  "review": "#e6a23c",
  "Done": "#67c23a",
  "done": "#67c23a",
  "Blocked": "#f56c6c",
  "blocked": "#f56c6c"
};

const option = computed<ECOption>(() => {
  const entries = Object.entries(props.data).filter(([, v]) => v > 0);
  if (!entries.length) {
    return {
      title: { text: "No status data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } }
    } as ECOption;
  }

  return {
    tooltip: { trigger: "item" as const, formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical" as const, right: 10, top: "center" },
    series: [
      {
        type: "pie" as const,
        radius: ["45%", "75%"],
        center: ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" } },
        data: entries.map(([name, value]) => ({
          name,
          value,
          itemStyle: { color: STATUS_COLORS[name] ?? "#409eff" }
        }))
      }
    ]
  };
});
</script>