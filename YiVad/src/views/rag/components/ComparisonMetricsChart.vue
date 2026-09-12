<template>
  <div class="comparison-metrics" v-if="hasData">
    <div class="cm-header">
      <span class="cm-title">Comparison Visualization</span>
    </div>
    <el-row :gutter="12">
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="cm-chart-card">
          <div class="cm-chart-title">Response Length</div>
          <ECharts :option="lengthOption" height="160" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="cm-chart-card">
          <div class="cm-chart-title">Source Scores</div>
          <ECharts :option="sourceScoreOption" height="160" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="cm-chart-card">
          <div class="cm-chart-title">Quality Indicators</div>
          <ECharts :option="qualityOption" height="160" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="ComparisonMetricsChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface RagSource {
  score: number;
  file_path: string;
}

const props = defineProps<{
  ragLength: number;
  plainLength: number;
  ragSources: RagSource[];
  ragError: string;
  plainError: string;
}>();

const hasData = computed(() => props.ragLength > 0 || props.plainLength > 0);

const lengthOption = computed<ECOption>(() => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { left: "3%", right: "4%", top: "5%", bottom: "3%", containLabel: true },
  xAxis: { type: "category", data: ["RAG", "Baseline"], axisLabel: { fontSize: 10 } },
  yAxis: { type: "value", name: "Chars", axisLabel: { fontSize: 9 } },
  series: [{
    type: "bar", barWidth: "50%",
    data: [
      { value: props.ragLength, itemStyle: { color: "#91cc75", borderRadius: [4, 4, 0, 0] } },
      { value: props.plainLength, itemStyle: { color: "#fac858", borderRadius: [4, 4, 0, 0] } },
    ],
    label: { show: true, position: "top", fontSize: 10 },
  }],
}));

const sourceScoreOption = computed<ECOption>(() => {
  const scores = props.ragSources.map(s => ({
    name: s.file_path.split("/").pop()?.replace(/\.md$/, "").slice(0, 15) || "?",
    score: s.score,
  }));
  if (!scores.length) return {};
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "5%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", max: 1, axisLabel: { fontSize: 9 } },
    yAxis: { type: "category", data: scores.map(s => s.name).reverse(), axisLabel: { fontSize: 9 } },
    series: [{
      type: "bar", barWidth: "55%",
      data: scores.map(s => ({
        value: s.score,
        itemStyle: {
          color: s.score > 0.8 ? "#91cc75" : s.score > 0.6 ? "#fac858" : "#ee6666",
          borderRadius: [0, 4, 4, 0],
        },
      })).reverse(),
      label: { show: true, position: "right", fontSize: 9, formatter: (p: any) => p.value.toFixed(2) },
    }],
  };
});

const qualityOption = computed<ECOption>(() => ({
  tooltip: {},
  legend: { bottom: 0, textStyle: { fontSize: 10 } },
  radar: {
    indicator: [
      { name: "Grounded", max: 100 },
      { name: "Sourced", max: 100 },
      { name: "Complete", max: 100 },
      { name: "Concise", max: 100 },
      { name: "Error-Free", max: 100 },
    ],
    center: ["50%", "45%"],
    radius: "60%",
  },
  series: [{
    type: "radar",
    data: [
      {
        name: "RAG",
        value: [
          props.ragSources.length > 0 ? 85 : 40,
          Math.min(100, props.ragSources.length * 25),
          props.ragLength > 100 ? 80 : 50,
          70,
          props.ragError ? 50 : 100,
        ],
        areaStyle: { opacity: 0.2 },
        lineStyle: { color: "#91cc75" },
        itemStyle: { color: "#91cc75" },
      },
      {
        name: "Baseline",
        value: [30, 0, props.plainLength > 100 ? 75 : 50, 65, props.plainError ? 50 : 100],
        areaStyle: { opacity: 0.15 },
        lineStyle: { color: "#fac858" },
        itemStyle: { color: "#fac858" },
      },
    ],
  }],
}));
</script>

<style scoped lang="scss">
.comparison-metrics {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.cm-header {
  margin-bottom: 8px;
}
.cm-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.cm-chart-card {
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 8px;
}
.cm-chart-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}
</style>