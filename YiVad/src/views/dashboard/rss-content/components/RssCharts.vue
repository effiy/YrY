<template>
  <div class="rss-charts">
    <div class="issue-chart" :class="{ 'issue-chart--active': sourceFilter.length }">
      <div class="issue-chart__title">
        Sources
        <span v-if="sourceFilter.length" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <template v-if="sources.length">
          <ECharts :option="sourcePieOption" height="200" @chart-click="onSourceChartClick" />
        </template>
        <div v-else class="issue-chart__empty">No source data</div>
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': categoryFilter }">
      <div class="issue-chart__title">
        Categories
        <span v-if="categoryFilter" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <template v-if="categories.length">
          <ECharts :option="categoryBarOption" height="200" @chart-click="onCategoryChartClick" />
        </template>
        <div v-else class="issue-chart__empty">No category data</div>
      </div>
    </div>
    <div class="issue-chart">
      <div class="issue-chart__title">Timeline</div>
      <div class="issue-chart__body">
        <template v-if="timeline.length">
          <ECharts :option="timelineOption" height="200" />
        </template>
        <div v-else class="issue-chart__empty">No timeline data</div>
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
const categories = computed(() => props.stats?.categories ?? []);
const timeline = computed(() => props.stats?.timeline ?? []);
const { sourceColor } = useSourceColor(sources);

const sourcePieOption = computed<ECOption>(() => ({
  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
  legend: { orient: "vertical", left: "left", top: "center", type: "scroll", textStyle: { fontSize: 11 } },
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      center: ["55%", "50%"],
      data: sources.value.map(d => ({
        value: d.count,
        name: d.name,
        itemStyle: { color: sourceColor(d.name), borderRadius: 4 }
      })),
      label: { formatter: "{b}: {c}", fontSize: 10 },
      emphasis: {
        label: { fontSize: 14, fontWeight: "bold" },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" }
      }
    }
  ]
}));

const categoryBarOption = computed(() => {
  const data = categories.value;
  const active = props.categoryFilter;
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", bottom: "3%", top: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 10 } },
    yAxis: {
      type: "category",
      data: data.map(d => d.name).reverse(),
      axisLabel: { fontSize: 11, width: 120, overflow: "truncate" }
    },
    series: [
      {
        type: "bar",
        data: data
          .map(d => ({
            value: d.count,
            itemStyle: {
              color:
                d.name === active
                  ? ({
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 1,
                      y2: 0,
                      colorStops: [
                        { offset: 0, color: "#ee6666" },
                        { offset: 1, color: "#fac858" }
                      ]
                    } as any)
                  : ({
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 1,
                      y2: 0,
                      colorStops: [
                        { offset: 0, color: "#5470c6" },
                        { offset: 1, color: "#73c0de" }
                      ]
                    } as any),
              borderRadius: [0, 6, 6, 0]
            }
          }))
          .reverse(),
        barWidth: "60%"
      }
    ]
  } as ECOption;
});

const timelineOption = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: "3%", right: "4%", bottom: "3%", top: "8%", containLabel: true },
  xAxis: {
    type: "category",
    data: timeline.value.map(d => d.month),
    axisLabel: { fontSize: 10, rotate: 30 },
    boundaryGap: false
  },
  yAxis: { type: "value", axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: "dashed" } } },
  series: [
    {
      type: "line",
      data: timeline.value.map(d => d.count),
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: { width: 2, color: "#5470c6" },
      itemStyle: { color: "#5470c6" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(84,112,198,0.25)" },
            { offset: 1, color: "rgba(84,112,198,0.02)" }
          ]
        }
      }
    }
  ]
}));

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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-light) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  &:hover {
    box-shadow: 0 8px 24px -8px rgb(0 0 0 / 10%);
    transform: translateY(-2px);
  }
}
.issue-chart--active {
  border-color: var(--el-color-primary);
  box-shadow:
    0 0 0 2px var(--el-color-primary-light-5),
    0 8px 20px -6px rgb(84 112 198 / 25%);
}
.issue-chart__title {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.issue-chart__badge {
  padding: 0 6px;
  font-size: 9px;
  font-weight: 600;
  line-height: 16px;
  color: var(--el-color-primary);
  text-transform: none;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 var(--el-color-primary-light-5);
  }
  50% {
    box-shadow: 0 0 0 4px transparent;
  }
}
.issue-chart__body {
  flex: 1;
  min-height: 0;
  padding: 10px;
}
.issue-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
