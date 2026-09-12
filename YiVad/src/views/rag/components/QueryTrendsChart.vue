<template>
  <div class="query-trends-chart" v-if="hasData">
    <div class="qtc-header">
      <span class="qtc-title">Query Analytics</span>
      <span class="qtc-summary">{{ totalQueries }} queries</span>
    </div>
    <el-row :gutter="12">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <div class="qtc-sub">
          <div class="qtc-sub-title">Activity Over Time</div>
          <ECharts :option="trendOption" height="200" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <div class="qtc-sub">
          <div class="qtc-sub-title">Score Distribution</div>
          <ECharts :option="scoreDistOption" height="200" />
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="12" v-if="history.length > 1">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <div class="qtc-sub">
          <div class="qtc-sub-title">Scope Distribution</div>
          <ECharts :option="scopePieOption" height="220" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="QueryTrendsChart">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface HistoryEntry {
  question: string;
  timestamp: string;
  scope?: string;
  topK: number;
  resultCount: number;
  results?: { score: number }[];
  topScore?: number;
}

const props = defineProps<{
  history: HistoryEntry[];
}>();

const hasData = computed(() => props.history.length > 0);
const totalQueries = computed(() => props.history.length);

const trendOption = computed<ECOption>(() => {
  // Group by date
  const dateMap = new Map<string, { count: number; totalResults: number; totalScore: number }>();
  for (const h of props.history) {
    const date = h.timestamp?.slice(0, 10) || "unknown";
    const entry = dateMap.get(date) || { count: 0, totalResults: 0, totalScore: 0 };
    entry.count++;
    entry.totalResults += h.resultCount || 0;
    entry.totalScore += h.topScore || 0;
    dateMap.set(date, entry);
  }
  const sorted = [...dateMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const dates = sorted.map(([d]) => d.slice(5)); // MM-DD
  const counts = sorted.map(([, v]) => v.count);
  const avgScores = sorted.map(([, v]) => v.count ? +(v.totalScore / v.count).toFixed(3) : 0);

  return {
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    legend: { data: ["Queries", "Avg Score"], top: 0, textStyle: { fontSize: 10 } },
    grid: { left: "3%", right: "4%", top: "15%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: dates, axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: [
      { type: "value", name: "Queries", axisLabel: { fontSize: 9 }, minInterval: 1 },
      { type: "value", name: "Score", min: 0, max: 1, axisLabel: { fontSize: 9 } },
    ],
    series: [
      { name: "Queries", type: "bar", barWidth: "50%", itemStyle: { color: "#5470c6", borderRadius: [4, 4, 0, 0] }, data: counts },
      { name: "Avg Score", type: "line", yAxisIndex: 1, smooth: true, itemStyle: { color: "#ee6666" }, data: avgScores },
    ],
  };
});

// Score distribution histogram
const scoreDistOption = computed<ECOption>(() => {
  const buckets = [0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
  const labels = ["0.5-0.6", "0.6-0.7", "0.7-0.75", "0.75-0.8", "0.8-0.85", "0.85-0.9", "0.9-0.95", "0.95-1.0"];
  const colors = ["#ee6666", "#fac858", "#fc8452", "#73c0de", "#91cc75", "#5470c6", "#3ba272", "#9a60b4"];
  const counts = labels.map(() => 0);
  for (const h of props.history) {
    const s = h.topScore ?? 0;
    for (let i = 0; i < buckets.length; i++) {
      if (s < buckets[i]) { counts[i]++; break; }
    }
  }
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", top: "5%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: "value", name: "Queries", axisLabel: { fontSize: 9 }, minInterval: 1 },
    series: [{
      type: "bar", barWidth: "60%",
      data: counts.map((c, i) => ({ value: c, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
      label: { show: true, position: "top", fontSize: 10, formatter: (p: any) => p.value > 0 ? p.value : "" },
    }],
  };
});

// Scope distribution
const scopePieOption = computed<ECOption>(() => {
  const scopeMap = new Map<string, number>();
  for (const h of props.history) {
    const scope = h.scope || "Full KB";
    scopeMap.set(scope, (scopeMap.get(scope) || 0) + 1);
  }
  const items = [...scopeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], i) => ({
      name: name.length > 25 ? name.slice(0, 25) + "..." : name,
      value,
      itemStyle: { color: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#fc8452", "#9a60b4", "#ea7ccc"][i] },
    }));
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: 0, top: "center", itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 10 } },
    series: [{
      type: "pie", radius: ["45%", "70%"], center: ["55%", "50%"],
      label: { fontSize: 10, formatter: "{d}%" },
      emphasis: { label: { fontSize: 14, fontWeight: "bold" } },
      data: items,
    }],
  };
});
</script>

<style scoped lang="scss">
.query-trends-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}
.qtc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.qtc-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.qtc-summary {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.qtc-sub {
  margin-bottom: 8px;
}
.qtc-sub-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}
</style>