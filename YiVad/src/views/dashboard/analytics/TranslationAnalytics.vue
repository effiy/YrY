<template>
  <div class="translation-analytics page">
    <header class="console-header">
      <div class="console-header__title">
        <h1>Translation Analytics</h1>
        <p class="text-muted">Translation volume, provider health & language distribution</p>
      </div>
      <div class="console-header__controls">
        <el-select v-model="hours" size="small" style="width:140px" @change="fetchAll">
          <el-option :value="24" label="Last 24h" />
          <el-option :value="72" label="Last 3 days" />
          <el-option :value="168" label="Last 7 days" />
          <el-option :value="720" label="Last 30 days" />
        </el-select>
        <el-button :icon="Refresh" size="small" @click="fetchAll" :loading="loading">Refresh</el-button>
        <el-button :type="polling ? 'primary' : 'default'" size="small" plain @click="togglePolling">
          {{ polling ? 'Live' : 'Auto' }}
        </el-button>
        <span v-if="lastFetched" class="ta-freshness" :class="{ 'is-stale': now - lastFetched > 60000 }">
          {{ formatRelativeTime(lastFetched, now) }}
        </span>
        <el-button size="small" @click="exportCsv" :disabled="!providerData.length">CSV</el-button>
      </div>
    </header>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb16" />

    <!-- KPI Strip -->
    <el-row :gutter="12" class="mb16">
      <el-col :xs="12" :sm="6" :md="4" v-for="kpi in kpis" :key="kpi.label">
        <div class="kpi-card">
          <div class="kpi-card__label">{{ kpi.label }}</div>
          <div class="kpi-card__value">{{ kpi.value }}</div>
          <div class="kpi-card__sub">{{ kpi.sub }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-row :gutter="12">
      <el-col :xs="24" :lg="12" class="mb16">
        <div class="chart-panel">
          <div class="chart-panel__title">Language Distribution</div>
          <div ref="langChartRef" class="chart-panel__body" />
        </div>
      </el-col>
      <el-col :xs="24" :lg="12" class="mb16">
        <div class="chart-panel">
          <div class="chart-panel__title">Provider Health</div>
          <div ref="healthChartRef" class="chart-panel__body" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="12">
      <el-col :span="24" class="mb16">
        <div class="chart-panel">
          <div class="chart-panel__title">Hourly Trend (7 days)</div>
          <div ref="trendChartRef" class="chart-panel__body chart-panel__body--tall" />
        </div>
      </el-col>
    </el-row>

    <!-- Provider Table -->
    <el-row :gutter="12">
      <el-col :span="24">
        <div class="chart-panel">
          <div class="chart-panel__title">Provider Breakdown (30 days)</div>
          <el-table :data="providerData" size="small" v-loading="loading" empty-text="No data yet">
            <el-table-column prop="provider" label="Provider" />
            <el-table-column prop="count" label="Calls" sortable width="120" />
            <el-table-column prop="success" label="Success" sortable width="120">
              <template #default="{ row }">
                <span :style="{ color: row.count ? row.success / row.count > 0.9 ? '#67c23a' : '#e6a23c' : '#909399' }">
                  {{ row.success }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="Success Rate" width="140">
              <template #default="{ row }">
                <el-progress
                  :percentage="Math.round((row.success / (row.count || 1)) * 100)"
                  :color="row.success / (row.count || 1) > 0.9 ? '#67c23a' : '#e6a23c'"
                  :stroke-width="8"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <!-- Provider Recommendations -->
    <el-row v-if="recommend?.providers.length" :gutter="12" style="margin-top:12px">
      <el-col :span="24">
        <div class="chart-panel">
          <div class="chart-panel__title">
            Smart Provider Ranking
            <span class="chart-panel__sub">Real-time health-based recommendation for auto→zh</span>
          </div>
          <div class="rec-cards">
            <div
              v-for="(p, i) in recommend.providers"
              :key="p.name"
              class="rec-card"
              :class="'rec-card--' + p.status"
            >
              <span class="rec-card__rank">#{{ i + 1 }}</span>
              <span class="rec-card__name">{{ p.name }}</span>
              <el-tag
                :type="p.status === 'healthy' ? 'success' : p.status === 'degraded' ? 'warning' : 'danger'"
                size="small"
              >{{ p.status }}</el-tag>
              <span class="rec-card__rate">{{ (p.success_rate * 100).toFixed(1) }}%</span>
              <span class="rec-card__calls">{{ p.total }} calls</span>
              <span v-if="i === 0" class="rec-card__best">
                <el-icon><StarFilled /></el-icon> Best
              </span>
            </div>
          </div>
          <div class="rec-summary">
            <el-tag type="success" size="small">{{ recommend.healthy_count }} healthy</el-tag>
            <el-tag type="warning" size="small" v-if="recommend.degraded_count">{{ recommend.degraded_count }} degraded</el-tag>
            <el-tag type="danger" size="small" v-if="recommend.down_count">{{ recommend.down_count }} down</el-tag>
            </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { Refresh, StarFilled } from "@element-plus/icons-vue";
import { useNow } from "@/hooks/useNow";
import { formatRelativeTime } from "@/utils/datetime";
import {
  getTranslationAnalytics,
  getProviderHealth,
  getHourlyTrend,
  getProviderBreakdown,
  getProviderRecommend,
  type ProviderHealth,
  type HourlyTrendItem,
  type ProviderBreakdownItem,
  type ProviderRecommendation,
} from "@/api/modules/translationService";
import * as echarts from "echarts";

const loading = ref(false);
const error = ref("");
const hours = ref(24);
const lastFetched = ref(0);
const now = useNow(30_000);

const langChartRef = ref<HTMLElement>();
const healthChartRef = ref<HTMLElement>();
const trendChartRef = ref<HTMLElement>();

let langChart: echarts.ECharts | null = null;
let healthChart: echarts.ECharts | null = null;
let trendChart: echarts.ECharts | null = null;

const kpis = ref([
  { label: "Total Translations", value: "—", sub: "" },
  { label: "Memory Entries", value: "—", sub: "cached" },
  { label: "Good Feedback", value: "—", sub: "👍" },
  { label: "Healthy Providers", value: "—", sub: "" },
  { label: "Active Lang Pairs", value: "—", sub: "" },
]);

const providerData = ref<ProviderBreakdownItem[]>([]);
const recommend = ref<ProviderRecommendation | null>(null);

function initCharts() {
  if (langChartRef.value) langChart = echarts.init(langChartRef.value);
  if (healthChartRef.value) healthChart = echarts.init(healthChartRef.value);
  if (trendChartRef.value) trendChart = echarts.init(trendChartRef.value);
}

function resizeCharts() {
  langChart?.resize();
  healthChart?.resize();
  trendChart?.resize();
}

async function fetchAll() {
  loading.value = true;
  error.value = "";
  try {
    const days = Math.max(1, Math.round(hours.value / 24));
    const [analytics, health, trend, breakdown, rec] = await Promise.all([
      getTranslationAnalytics(days).then((r) => r.data),
      getProviderHealth(hours.value).then((r) => r.data),
      getHourlyTrend(7).then((r) => r.data),
      getProviderBreakdown(30).then((r) => r.data),
      getProviderRecommend("auto", "zh").then(r => r.data),
    ]);

    kpis.value[0].value = String(analytics.total_translations);
    kpis.value[0].sub = `${days}d`;

    if (health) {
      kpis.value[1].value = String(health.memory_entries);
      const fb = health.feedback || { good: 0, bad: 0 };
      kpis.value[2].value = String(fb.good);
      const provs = health.providers || {};
      const healthy = Object.values(provs).filter((p: any) => p.status === "healthy").length;
      kpis.value[3].value = `${healthy}/${Object.keys(provs).length}`;
    }

    // Language distribution
    const langs = analytics.by_target_language || [];
    kpis.value[4].value = String(langs.length);
    if (langs.length && langChart) {
      langChart.setOption({
        tooltip: { trigger: "item" },
        series: [{
          type: "pie",
          radius: ["40%", "70%"],
          data: langs.map((l: any) => ({ name: l.language, value: l.count })),
          label: { formatter: "{b}\n{d}%" },
        }],
      });
    }

    // Provider health
    if (health?.providers && healthChart) {
      const provEntries = Object.entries(health.providers);
      healthChart.setOption({
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: provEntries.map(([k]) => k),
          axisLabel: { rotate: 30 },
        },
        yAxis: { type: "value", max: 100 },
        series: [{
          type: "bar",
          data: provEntries.map(([, v]: any) => Math.round(v.success_rate * 100)),
          itemStyle: {
            color: (p: any) => p.value > 90 ? "#67c23a" : p.value > 70 ? "#e6a23c" : "#f56c6c",
          },
          label: { show: true, formatter: "{c}%" },
        }],
        grid: { left: 50, right: 20, top: 10, bottom: 50 },
      });
    }

    // Hourly trend
    if (trend?.length && trendChart) {
      trendChart.setOption({
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: trend.map((t: any) => t.hour.slice(5)),
          axisLabel: { rotate: 45, fontSize: 10 },
        },
        yAxis: { type: "value" },
        series: [{
          type: "line",
          data: trend.map((t: any) => t.count),
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { width: 2 },
        }],
        grid: { left: 50, right: 20, top: 10, bottom: 60 },
        dataZoom: [{ type: "slider", start: 0, end: 100 }],
      });
    }

    providerData.value = breakdown || [];
    recommend.value = rec;
    lastFetched.value = Date.now();
  } catch (e: any) {
    error.value = e?.message || "Failed to load analytics";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  initCharts();
  fetchAll();
  window.addEventListener("resize", resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeCharts);
  if (pollTimer) clearInterval(pollTimer);
  langChart?.dispose();
  healthChart?.dispose();
  trendChart?.dispose();
});

const polling = ref(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;

function togglePolling() {
  polling.value = !polling.value;
  if (polling.value) {
    pollTimer = setInterval(fetchAll, 30000);
  } else {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }
}

function exportCsv() {
  if (!providerData.value.length) return;
  const header = "Provider,Calls,Success,Success Rate";
  const rows = providerData.value.map(
    (p) => `${p.provider},${p.count},${p.success},${((p.success / (p.count || 1)) * 100).toFixed(1)}%`,
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `translation-providers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style lang="scss" scoped>
.chart-panel__sub { font-size: 11px; font-weight: 400; color: var(--el-text-color-secondary); margin-left: 8px; }

.rec-cards { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.rec-card {
  display: flex; gap: 8px; align-items: center;
  padding: 10px 14px; background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter); border-radius: 8px;
  min-width: 200px; transition: border-color 0.15s;
  &:hover { border-color: var(--el-color-primary-light-5); }
  &--healthy { border-left: 3px solid var(--el-color-success); }
  &--degraded { border-left: 3px solid var(--el-color-warning); }
  &--down { border-left: 3px solid var(--el-color-danger); opacity: 0.7; }
}
.rec-card__rank { font-size: 12px; font-weight: 700; color: var(--el-text-color-secondary); min-width: 20px; }
.rec-card__name { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); min-width: 80px; }
.rec-card__rate { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--el-color-success); }
.rec-card__calls { font-size: 11px; color: var(--el-text-color-placeholder); }
.rec-card__best { display: flex; gap: 2px; align-items: center; font-size: 11px; font-weight: 600; color: var(--el-color-warning); margin-left: auto; }

.rec-summary { display: flex; gap: 6px; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--el-border-color-lighter); }
.rec-summary__hint { font-size: 11px; color: var(--el-text-color-placeholder); margin-left: auto; }
.translation-analytics {
  padding: 16px;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  &__title {
    h1 { margin: 0 0 4px; font-size: 20px; }
    .text-muted { color: #909399; font-size: 13px; margin: 0; }
  }

  &__controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.kpi-card {
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  text-align: center;

  &__label { font-size: 12px; color: #909399; margin-bottom: 4px; }
  &__value { font-size: 24px; font-weight: 700; color: var(--el-text-color-primary); }
  &__sub { font-size: 11px; color: #c0c4cc; }
}

.chart-panel {
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;

  &__title { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
  &__body { height: 300px; &--tall { height: 350px; } }
}

.mb16 { margin-bottom: 16px; }

.ta-freshness {
  font-size: 10px; font-weight: 600; color: var(--el-color-success);
  white-space: nowrap; font-variant-numeric: tabular-nums;
  &.is-stale { color: var(--el-text-color-placeholder); }
}
</style>