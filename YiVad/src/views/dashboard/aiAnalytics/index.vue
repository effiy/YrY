<template>
  <div class="ai-analytics-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">AI Chat Analytics</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-sessions">
              <div class="stat-icon"><el-icon><ChatDotRound /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.total_sessions ?? 0 }}</div>
                <div class="stat-label">Total Sessions</div>
                <div class="stat-sub">{{ data?.active_sessions_today ?? 0 }} active today</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-messages">
              <div class="stat-icon"><el-icon><ChatLineSquare /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(data?.total_messages ?? 0) }}</div>
                <div class="stat-label">Total Messages</div>
                <div class="stat-sub">{{ formatNumber(data?.messages_today ?? 0) }} today</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-avg">
              <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.avg_messages_per_session ?? 0 }}</div>
                <div class="stat-label">Avg Msg/Session</div>
                <div class="stat-sub">{{ data?.model_usage?.length ?? 0 }} models used</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-today">
              <div class="stat-icon"><el-icon><Clock /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.messages_today ?? 0 }}</div>
                <div class="stat-label">Messages Today</div>
                <div class="stat-sub">from {{ data?.active_sessions_today ?? 0 }} sessions</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <div class="chart-box">
            <div class="chart-title">Daily Activity (Last 30 Days)</div>
            <div class="chart-body">
              <ECharts :option="dailyOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">Model Usage</div>
            <div class="chart-body">
              <ECharts :option="modelOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="table-box">
            <div class="table-title">Model Usage Breakdown</div>
            <el-table :data="data?.model_usage ?? []" stripe size="small" max-height="350">
              <el-table-column prop="model" label="Model" min-width="160" show-overflow-tooltip />
              <el-table-column prop="count" label="Calls" width="100" sortable />
              <el-table-column label="Share" width="120">
                <template #default="{ row }">
                  <el-progress :percentage="modelPercent(row.count)" :stroke-width="6" :show-text="true" :text-inside="false" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="table-box">
            <div class="table-title">Weekly Summary</div>
            <div class="weekly-summary">
              <div class="weekly-row" v-for="d in weeklySummary" :key="d.date">
                <span class="weekly-date">{{ d.date }}</span>
                <span class="weekly-sessions">{{ d.sessions }} sessions</span>
                <span class="weekly-msgs">{{ d.messages }} msgs</span>
                <el-progress :percentage="d.msgPercent" :stroke-width="4" :show-text="false" :color="'#6B9DFE'" style="width: 80px" />
              </div>
              <div v-if="!weeklySummary.length" class="weekly-empty">No data</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card recent-box">
      <div class="recent-title">Recent Sessions</div>
      <el-table :data="data?.recent ?? []" stripe size="small" max-height="400">
        <el-table-column prop="title" label="Title" min-width="300" show-overflow-tooltip />
        <el-table-column prop="message_count" label="Messages" width="100" sortable />
        <el-table-column prop="key" label="Session Key" width="200" show-overflow-tooltip />
        <el-table-column prop="updated" label="Updated" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="aiAnalytics">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ChatDotRound, ChatLineSquare, TrendCharts, Clock, Refresh } from "@element-plus/icons-vue";
import { getAiStats } from "@/api/modules/dashboard";
import type { AiStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const data = ref<AiStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

function formatNumber(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function modelPercent(count: number): number {
  const total = data.value?.model_usage?.reduce((s, m) => s + m.count, 0) ?? 1;
  return Math.round((count / total) * 100);
}

const weeklySummary = computed(() => {
  const daily = data.value?.daily ?? [];
  const last7 = daily.slice(-7);
  const maxMsgs = Math.max(...last7.map(d => d.messages), 1);
  return last7.map(d => ({
    date: d.date.slice(5),
    sessions: d.sessions,
    messages: d.messages,
    msgPercent: Math.round((d.messages / maxMsgs) * 100),
  }));
});

const dailyOption = computed<ECOption>(() => {
  const daily = data.value?.daily ?? [];
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Sessions", "Messages"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: daily.map(d => d.date.slice(5)), axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "Sessions",
        type: "bar",
        data: daily.map(d => d.sessions),
        barWidth: "40%",
        itemStyle: { color: "#6B9DFE", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Messages",
        type: "line",
        data: daily.map(d => d.messages),
        smooth: true,
        lineStyle: { color: "#ee6666", width: 2 },
        itemStyle: { color: "#ee6666" },
      },
    ],
  };
});

const modelOption = computed<ECOption>(() => {
  const models = data.value?.model_usage ?? [];
  if (models.length === 0) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center", type: "scroll" },
    series: [{
      type: "pie",
      radius: ["45%", "75%"],
      center: ["55%", "50%"],
      data: models.map((m, i) => ({
        value: m.count,
        name: m.model,
        itemStyle: { color: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"][i % 10] },
      })),
      label: { formatter: "{b}" },
    }],
  };
});

function formatDate(val: string): string {
  if (!val) return "—";
  try {
    const d = new Date(val);
    return d.toLocaleString();
  } catch {
    return val.slice(0, 16);
  }
}

async function fetchData() {
  try {
    loading.value = true;
    const res = await getAiStats();
    data.value = res.data;
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