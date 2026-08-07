<template>
  <div class="data-visualize-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">System Overview</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchAll" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-users">
              <div class="stat-icon"><el-icon><User /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.users ?? 0 }}</div>
                <div class="stat-label">Total Users</div>
                <div class="stat-sub" v-if="orgData">{{ orgData.users.active }} active / {{ orgData.users.inactive }} inactive</div>
                <div class="stat-delta" :class="deltaClass('users')" v-if="deltas.users !== 0">{{ deltaSign('users') }}{{ Math.abs(deltas.users) }} since last refresh</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-knowledge">
              <div class="stat-icon"><el-icon><Document /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(knowledgeData?.total ?? 0) }}</div>
                <div class="stat-label">Knowledge Files</div>
                <div class="stat-sub" v-if="knowledgeData">{{ knowledgeData.categories.length }} role categories</div>
                <div class="stat-delta" :class="deltaClass('knowledge')" v-if="deltas.knowledge !== 0">{{ deltaSign('knowledge') }}{{ Math.abs(deltas.knowledge) }} since last refresh</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-sessions">
              <div class="stat-icon"><el-icon><ChatDotRound /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.sessions ?? 0 }}</div>
                <div class="stat-label">Chat Sessions</div>
                <div class="stat-sub" v-if="aiData">{{ formatNumber(aiData.total_messages) }} messages, {{ aiData.messages_today ?? 0 }} today</div>
                <div class="stat-delta" :class="deltaClass('sessions')" v-if="deltas.sessions !== 0">{{ deltaSign('sessions') }}{{ Math.abs(deltas.sessions) }} since last refresh</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-rss">
              <div class="stat-icon"><el-icon><Reading /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.total ?? 0 }}</div>
                <div class="stat-label">RSS Articles</div>
                <div class="stat-sub" v-if="rssData">{{ rssData.sources.length }} sources, {{ rssData.categories.length }} categories</div>
                <div class="stat-delta" :class="deltaClass('rss')" v-if="deltas.rss !== 0">{{ deltaSign('rss') }}{{ Math.abs(deltas.rss) }} since last refresh</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card summary-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="summary-card" :class="healthScoreClass">
            <span class="summary-label">System Health</span>
            <span class="summary-value">{{ healthScore }}%</span>
            <span class="summary-detail">{{ healthyServices }}/{{ totalServices }} services up</span>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="summary-card" :class="serviceRateClass">
            <span class="summary-label">Service Success Rate</span>
            <span class="summary-value">{{ serviceRate }}%</span>
            <span class="summary-detail">{{ formatNumber(serviceData?.total_calls ?? 0) }} calls</span>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="summary-card" :class="ragData?.built ? 'summary-ok' : 'summary-warn'">
            <span class="summary-label">RAG Index</span>
            <span class="summary-value">{{ ragData?.built ? 'Built' : 'Not Built' }}</span>
            <span class="summary-detail">{{ formatNumber(ragData?.num_docs ?? 0) }} docs</span>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="summary-card" :class="aiData?.model_usage.length ? 'summary-ok' : 'summary-warn'">
            <span class="summary-label">AI Models</span>
            <span class="summary-value">{{ aiData?.model_usage.length ?? 0 }} models</span>
            <span class="summary-detail">Top: {{ topModel }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">System Health</div>
            <div class="chart-body">
              <ECharts :option="healthGauge" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">Content Distribution</div>
            <div class="chart-body">
              <ECharts :option="contentPieOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">AI Chat Activity (7d)</div>
            <div class="chart-body">
              <ECharts :option="weeklyActivityOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Daily Activity (Last 30 Days)</div>
            <div class="chart-body">
              <ECharts :option="dailyActivityOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">RSS Articles Over Time</div>
            <div class="chart-body">
              <ECharts :option="rssTimelineOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card recent-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="table-box">
            <div class="table-title">Recent Knowledge Updates</div>
            <el-table :data="knowledgeData?.recent?.slice(0, 5) ?? []" stripe size="small" max-height="300">
              <el-table-column prop="title" label="Title" min-width="180" show-overflow-tooltip />
              <el-table-column prop="lifecycle" label="Lifecycle" width="100">
                <template #default="{ row }">
                  <el-tag :type="lifecycleTagType(row.lifecycle)" size="small">{{ row.lifecycle || '—' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" width="90">
                <template #default="{ row }">
                  <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="updated" label="Updated" width="120">
                <template #default="{ row }">
                  {{ formatShortDate(row.updated) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="table-box">
            <div class="table-title">Recent RSS Articles</div>
            <el-table :data="rssData?.recent?.slice(0, 5) ?? []" stripe size="small" max-height="300">
              <el-table-column prop="title" label="Title" min-width="180" show-overflow-tooltip />
              <el-table-column prop="source_name" label="Source" width="100" />
              <el-table-column prop="category_path" label="Category" width="120" show-overflow-tooltip />
              <el-table-column prop="published" label="Published" width="110">
                <template #default="{ row }">
                  {{ formatShortDate(row.published) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="dataVisualize">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { User, Document, ChatDotRound, Reading, Refresh } from "@element-plus/icons-vue";
import { getDashboardHealth, getKnowledgeStats, getRssStats, getOrgStats, getAiStats, getServiceStats, getRagStats } from "@/api/modules/dashboard";
import type { DashboardHealthData, KnowledgeStatsData, RssStatsData, OrgStatsData, AiStatsData, ServiceStatsData, RagStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const healthData = ref<DashboardHealthData | null>(null);
const knowledgeData = ref<KnowledgeStatsData | null>(null);
const rssData = ref<RssStatsData | null>(null);
const orgData = ref<OrgStatsData | null>(null);
const aiData = ref<AiStatsData | null>(null);
const serviceData = ref<ServiceStatsData | null>(null);
const ragData = ref<RagStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

// Previous values for delta tracking
const prevValues = ref<Record<string, number>>({});
const deltas = ref<Record<string, number>>({});

function trackDelta(key: string, current: number) {
  const prev = prevValues.value[key];
  if (prev !== undefined) {
    deltas.value[key] = current - prev;
  }
  prevValues.value[key] = current;
}

function deltaSign(key: string): string {
  return deltas.value[key] > 0 ? "↑" : "↓";
}

function deltaClass(key: string): string {
  return deltas.value[key] > 0 ? "delta-up" : "delta-down";
}

function formatNumber(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

const totalServices = 3;
const healthyServices = computed(() => {
  if (!healthData.value) return 0;
  let n = 0;
  if (healthData.value.server.running) n++;
  if (healthData.value.mongodb.connected) n++;
  if (healthData.value.ollama.connected) n++;
  return n;
});
const healthScore = computed(() => Math.round((healthyServices.value / totalServices) * 100));
const healthScoreClass = computed(() => {
  if (healthScore.value === 100) return "summary-ok";
  if (healthScore.value >= 66) return "summary-warn";
  return "summary-err";
});
const serviceRate = computed(() => Math.round(serviceData.value?.success_rate ?? 0));
const serviceRateClass = computed(() => {
  if (serviceRate.value >= 95) return "summary-ok";
  if (serviceRate.value >= 80) return "summary-warn";
  return "summary-err";
});
const topModel = computed(() => {
  const models = aiData.value?.model_usage ?? [];
  if (!models.length) return "—";
  return [...models].sort((a, b) => b.count - a.count)[0].model;
});

const colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4"];

const healthGauge = computed<ECOption>(() => {
  const ok = [
    healthData.value?.server.running,
    healthData.value?.mongodb.connected,
    healthData.value?.ollama.connected,
  ].filter(Boolean).length;
  const score = Math.round((ok / 3) * 100);
  return {
    series: [{
      type: "gauge",
      startAngle: 210, endAngle: -30, min: 0, max: 100,
      progress: { show: true, width: 14, itemStyle: { color: score === 100 ? "#67c23a" : score >= 66 ? "#e6a23c" : "#f56c6c" } },
      axisLine: { lineStyle: { width: 14 } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      detail: { valueAnimation: true, formatter: "{value}%", fontSize: 24, offsetCenter: [0, "60%"] },
      data: [{ value: score, name: "Health Score" }],
    }],
  };
});

const contentPieOption = computed<ECOption>(() => {
  const c = healthData.value?.collections;
  if (!c) return {} as ECOption;
  const data = [
    { value: c.knowledge_files, name: "Knowledge", itemStyle: { color: "#5470c6" } },
    { value: c.rss_sources, name: "RSS", itemStyle: { color: "#91cc75" } },
    { value: c.sessions, name: "Sessions", itemStyle: { color: "#fac858" } },
    { value: c.menus, name: "Menus", itemStyle: { color: "#ee6666" } },
  ].filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center" },
    series: [{
      type: "pie", radius: ["45%", "75%"], center: ["55%", "50%"],
      data, label: { formatter: "{b}: {c}" },
    }],
  };
});

const weeklyActivityOption = computed<ECOption>(() => {
  const daily = aiData.value?.daily ?? [];
  const last7 = daily.slice(-7);
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Sessions", "Messages"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: last7.map(d => d.date.slice(5)), axisLabel: { fontSize: 10 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      { name: "Sessions", type: "bar", data: last7.map(d => d.sessions), barWidth: "40%", itemStyle: { color: "#6B9DFE", borderRadius: [4, 4, 0, 0] } },
      { name: "Messages", type: "line", data: last7.map(d => d.messages), smooth: true, lineStyle: { color: "#ee6666", width: 2 }, itemStyle: { color: "#ee6666" } },
    ],
  };
});

const dailyActivityOption = computed<ECOption>(() => {
  const daily = aiData.value?.daily ?? [];
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Sessions", "Messages"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: daily.map(d => d.date.slice(5)), axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      { name: "Sessions", type: "bar", data: daily.map(d => d.sessions), barWidth: "40%", itemStyle: { color: "#6B9DFE", borderRadius: [4, 4, 0, 0] } },
      { name: "Messages", type: "line", data: daily.map(d => d.messages), smooth: true, lineStyle: { color: "#ee6666", width: 2 }, itemStyle: { color: "#ee6666" } },
    ],
  };
});

const rssTimelineOption = computed<ECOption>(() => {
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
    xAxis: { type: "category", data: data.map(d => d.month), axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [{
      name: "Articles", type: "line", data: counts, smooth: true,
      lineStyle: { color: "#91cc75", width: 3 }, itemStyle: { color: "#91cc75" },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(145,204,117,0.3)" }, { offset: 1, color: "rgba(145,204,117,0.05)" }] } },
    }, {
      name: "3-Mo Trend", type: "line", data: ma, smooth: true,
      lineStyle: { color: "#5470c6", width: 2, type: "dashed" }, itemStyle: { color: "#5470c6" }, symbol: "none",
    }],
  };
});

function statusTagType(status: string): "success" | "warning" | "info" | "primary" | "danger" {
  const map: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { stable: "success", active: "success", draft: "info", in_progress: "warning", planning: "info", reviewed: "primary" };
  return map[status] || "info";
}

function lifecycleTagType(lifecycle: string): "success" | "warning" | "info" | "primary" | "danger" {
  const map: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { stable: "success", active: "success", deprecated: "danger", experimental: "warning", draft: "info", archived: "info" };
  return map[lifecycle] || "info";
}

function formatShortDate(val: string): string {
  if (!val) return "";
  try { return new Date(val).toLocaleDateString(); } catch { return val.slice(0, 10); }
}

async function fetchAll() {
  try {
    loading.value = true;
    const [health, knowledge, rss, org, ai, service, rag] = await Promise.all([
      getDashboardHealth(), getKnowledgeStats(), getRssStats(), getOrgStats(), getAiStats(), getServiceStats(), getRagStats(),
    ]);
    healthData.value = health.data;
    knowledgeData.value = knowledge.data;
    rssData.value = rss.data;
    orgData.value = org.data;
    aiData.value = ai.data;
    serviceData.value = service.data;
    ragData.value = rag.data;
    trackDelta("users", health.data?.collections.users ?? 0);
    trackDelta("knowledge", knowledge.data?.total ?? 0);
    trackDelta("sessions", health.data?.collections.sessions ?? 0);
    trackDelta("rss", rss.data?.total ?? 0);
    lastUpdated.value = new Date().toLocaleTimeString();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchAll();
  refreshTimer = setInterval(fetchAll, 30_000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>