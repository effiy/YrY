<template>
  <div class="score-dist-chart" v-if="hasData">
    <div class="sdc-header">
      <span class="sdc-title">Score Distribution</span>
      <span class="sdc-summary">{{ sourceCount }} sources, avg {{ avgScore.toFixed(3) }}</span>
    </div>
    <ECharts :option="option" height="180" />
  </div>
</template>

<script setup lang="ts" name="ScoreDistributionChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface RagSource {
  score: number;
  file_path: string;
  metadata?: { category?: string; type?: string };
}

const props = defineProps<{
  sources: RagSource[];
}>();

const hasData = computed(() => props.sources.length > 0);
const sourceCount = computed(() => props.sources.length);
const avgScore = computed(() => {
  if (!props.sources.length) return 0;
  return props.sources.reduce((s, r) => s + r.score, 0) / props.sources.length;
});

const option = computed<ECOption>(() => {
  const scores = props.sources.map(s => s.score).sort((a, b) => b - a);
  const buckets = [0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
  const labels = ["0.5-0.6", "0.6-0.7", "0.7-0.75", "0.75-0.8", "0.8-0.85", "0.85-0.9", "0.9-0.95", "0.95-1.0"];
  const colors = ["#ee6666", "#fac858", "#fc8452", "#73c0de", "#91cc75", "#5470c6", "#3ba272", "#9a60b4"];
  const counts = labels.map(() => 0);
  for (const s of scores) {
    for (let i = 0; i < buckets.length; i++) {
      if (s < buckets[i]) { counts[i]++; break; }
    }
  }
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", top: "5%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: "value", name: "Chunks", axisLabel: { fontSize: 9 }, minInterval: 1 },
    series: [{
      type: "bar", barWidth: "60%",
      data: counts.map((c, i) => ({ value: c, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
      label: { show: true, position: "top", fontSize: 10, formatter: (p: any) => p.value > 0 ? p.value : "" },
    }],
  };
});
</script>

<style scoped lang="scss">
.score-dist-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.sdc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.sdc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sdc-summary {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
</style>