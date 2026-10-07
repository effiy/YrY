<template>
  <div>
    <ECharts height="340" :option="option" />
    <div v-if="confidence === 'estimated'" class="cfd-confidence">
      <el-icon :size="14"><InfoFilled /></el-icon>
      <span>CFD status distribution is estimated from current WIP proportions</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: { date: string; backlog: number; todo: number; in_progress: number; review: number; done: number }[];
  confidence?: "exact" | "cohort" | "estimated";
}

const props = withDefaults(defineProps<Props>(), { confidence: "estimated" });

const stacks = ["Backlog", "To Do", "In Progress", "Review", "Done"];
const colors = ["#909399", "#409eff", "#e6a23c", "#9b59b6", "#67c23a"];

const option = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" as const },
  legend: { data: stacks, top: 0 },
  grid: { top: 40, right: 16, bottom: 24, left: 48 },
  xAxis: { type: "category" as const, data: props.data.map(d => d.date) },
  yAxis: { type: "value" as const },
  series: stacks.map((name, i) => ({
    name,
    type: "line" as const,
    stack: "total",
    areaStyle: {},
    color: colors[i],
    data: props.data.map(d => (d as any)[name.toLowerCase().replace(/ /g, "_")] ?? 0)
  }))
}));
</script>

<style scoped lang="scss">
.cfd-confidence {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
