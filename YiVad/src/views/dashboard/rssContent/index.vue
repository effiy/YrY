<template>
  <div class="rss-content-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">RSS Content Overview</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-total">
              <div class="stat-icon"><el-icon><Reading /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.total ?? 0 }}</div>
                <div class="stat-label">Total Articles</div>
                <div class="stat-sub">{{ avgArticlesPerSource }} avg / source</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-sources">
              <div class="stat-icon"><el-icon><Connection /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.sources.length ?? 0 }}</div>
                <div class="stat-label">RSS Sources</div>
                <div class="stat-sub">{{ topSourceName }} leads</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-categories">
              <div class="stat-icon"><el-icon><Collection /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.categories.length ?? 0 }}</div>
                <div class="stat-label">Categories</div>
                <div class="stat-sub">{{ avgArticlesPerCategory }} avg / category</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-months">
              <div class="stat-icon"><el-icon><Calendar /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.timeline.length ?? 0 }}</div>
                <div class="stat-label">Active Months</div>
                <div class="stat-sub">Latest: {{ latestMonth }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Source Distribution</div>
            <div class="chart-body">
              <ECharts :option="sourcePieOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Category Distribution</div>
            <div class="chart-body">
              <ECharts :option="categoryBarOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <div class="chart-box">
            <div class="chart-title">Articles Over Time</div>
            <div class="chart-body">
              <ECharts :option="timelineOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card recent-box">
      <div class="recent-title">Recent Articles</div>
      <el-table :data="rssData?.recent ?? []" stripe size="small" max-height="400">
        <el-table-column prop="title" label="Title" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <a :href="row.link" target="_blank" class="article-link">{{ row.title }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="source_name" label="Source" width="140" />
        <el-table-column prop="author" label="Author" width="120" />
        <el-table-column prop="category_path" label="Category" width="180" />
        <el-table-column prop="published" label="Published" width="180">
          <template #default="{ row }">
            {{ formatDate(row.published) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="rssContent">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Reading, Connection, Collection, Calendar, Refresh } from "@element-plus/icons-vue";
import { getRssStats } from "@/api/modules/dashboard";
import type { RssStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const rssData = ref<RssStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4"];

const avgArticlesPerSource = computed(() => {
  const sources = rssData.value?.sources ?? [];
  const total = rssData.value?.total ?? 0;
  if (!sources.length) return 0;
  return Math.round(total / sources.length);
});

const avgArticlesPerCategory = computed(() => {
  const cats = rssData.value?.categories ?? [];
  const total = rssData.value?.total ?? 0;
  if (!cats.length) return 0;
  return Math.round(total / cats.length);
});

const topSourceName = computed(() => {
  const sources = rssData.value?.sources ?? [];
  if (!sources.length) return "—";
  return [...sources].sort((a, b) => b.count - a.count)[0].name;
});

const latestMonth = computed(() => {
  const tl = rssData.value?.timeline ?? [];
  return tl.length ? tl[tl.length - 1].month : "—";
});

const sourcePieOption = computed<ECOption>(() => {
  const data = rssData.value?.sources ?? [];
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center", type: "scroll" },
    series: [{
      type: "pie",
      radius: ["40%", "70%"],
      center: ["55%", "50%"],
      data: data.map((d, i) => ({ value: d.count, name: d.name, itemStyle: { color: colors[i % colors.length] } })),
      label: { formatter: "{b}: {c}" },
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" } }
    }]
  };
});

const categoryBarOption = computed<ECOption>(() => {
  const data = rssData.value?.categories ?? [];
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: data.map(d => d.name).reverse(), axisLabel: { fontSize: 11 } },
    series: [{
      type: "bar",
      data: data.map(d => d.count).reverse(),
      barWidth: "60%",
      itemStyle: { color: "#6B9DFE", borderRadius: [0, 6, 6, 0] }
    }]
  };
});

const timelineOption = computed<ECOption>(() => {
  const data = rssData.value?.timeline ?? [];
  const counts = data.map(d => d.count);
  const ma = counts.map((_, i) => {
    if (i < 2) return null;
    return Math.round((counts[i - 2] + counts[i - 1] + counts[i]) / 3);
  });
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Articles", "3-Mo Trend"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "12%", containLabel: true },
    xAxis: { type: "category", data: data.map(d => d.month) },
    yAxis: { type: "value", minInterval: 1 },
    series: [{
      name: "Articles",
      type: "line",
      data: counts,
      smooth: true,
      lineStyle: { color: "#5470c6", width: 3 },
      itemStyle: { color: "#5470c6" },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(84,112,198,0.3)" }, { offset: 1, color: "rgba(84,112,198,0.05)" }] } }
    }, {
      name: "3-Mo Trend",
      type: "line",
      data: ma,
      smooth: true,
      lineStyle: { color: "#ee6666", width: 2, type: "dashed" },
      itemStyle: { color: "#ee6666" },
      symbol: "none",
    }]
  };
});

function formatDate(val: string): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    return d.toLocaleDateString();
  } catch {
    return val.slice(0, 10);
  }
}

async function fetchData() {
  try {
    loading.value = true;
    const res = await getRssStats();
    rssData.value = res.data;
    lastUpdated.value = new Date().toLocaleTimeString();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
  refreshTimer = setInterval(fetchData, 60_000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>