<template>
  <div class="rss-charts">
    <div class="issue-chart" :class="{ 'issue-chart--active': sourceFilter.length }">
      <div class="issue-chart__title">
        Sources
        <span v-if="sourceFilter.length" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="sourcePieOption" height="200" @chart-click="onSourceChartClick" />
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': categoryFilter }">
      <div class="issue-chart__title">
        Categories
        <span v-if="categoryFilter" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="categoryBarOption" height="200" @chart-click="onCategoryChartClick" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="RssCharts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import type { ECElementEvent } from "echarts/core";
import type { RssStatsData } from "@/api/interface/yiAi";
import { useSourceColor } from "../composables/useSourceColor";
import { toRef } from "vue";

const props = defineProps<{
  stats: RssStatsData | null;
  categoryFilter: string;
  sourceFilter: string[];
}>();

const emit = defineEmits<{
  (e: "toggle-source", name: string): void;
  (e: "update:categoryFilter", name: string): void;
}>();

const sources = computed(() => props.stats?.sources ?? []);
const { sourceColor } = useSourceColor(toRef(sources));

const sourcePieOption = computed<ECOption>(() => {
  const data = sources.value;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center", type: "scroll" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["55%", "50%"],
        data: data.map((d) => ({
          value: d.count,
          name: d.name,
          itemStyle: { color: sourceColor(d.name) },
        })),
        label: { formatter: "{b}: {c}" },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" } },
      },
    ],
  };
});

const categoryBarOption = computed<ECOption>(() => {
  const data = props.stats?.categories ?? [];
  const active = props.categoryFilter;
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: data.map((d) => d.name).reverse(), axisLabel: { fontSize: 9 } },
    series: [
      {
        type: "bar",
        data: data
          .map((d) => ({
            value: d.count,
            itemStyle: { color: d.name === active ? "#ee6666" : "#6B9DFE", borderRadius: [0, 6, 6, 0] },
          }))
          .reverse(),
        barWidth: "60%",
      },
    ],
  };
});

function onSourceChartClick(e: ECElementEvent) {
  const name = e.name as string;
  if (name) emit("toggle-source", name);
}

function onCategoryChartClick(e: ECElementEvent) {
  const name = e.name as string;
  if (!name) return;
  emit("update:categoryFilter", props.categoryFilter === name ? "" : name);
}
</script>

<style scoped lang="scss">
.rss-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.issue-chart {
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-light) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.1);
  }
}

.issue-chart--active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-5), 0 8px 20px -6px rgba(84, 112, 198, 0.25);
}

.issue-chart__title {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.issue-chart__badge {
  padding: 0 6px;
  font-size: 9px;
  font-weight: 600;
  line-height: 16px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  text-transform: none;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 var(--el-color-primary-light-5); }
  50% { box-shadow: 0 0 0 4px transparent; }
}

.issue-chart__body {
  flex: 1;
  min-height: 0;
  padding: 10px;
}
</style>