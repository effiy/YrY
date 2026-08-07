<template>
  <div class="ai-usage-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">AI Chat Usage</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-sessions">
              <div class="stat-icon"><el-icon><ChatDotSquare /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.total_sessions ?? 0 }}</div>
                <div class="stat-label">Total Sessions</div>
                <div class="stat-sub">{{ dailyAvgSessions }} avg / day</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-messages">
              <div class="stat-icon"><el-icon><ChatLineSquare /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.total_messages ?? 0 }}</div>
                <div class="stat-label">Total Messages</div>
                <div class="stat-sub">{{ dailyAvgMessages }} avg / day</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-avg">
              <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.avg_messages_per_session ?? 0 }}</div>
                <div class="stat-label">Avg Msg / Session</div>
                <div class="stat-sub">{{ data?.messages_today ?? 0 }} messages today</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-today">
              <div class="stat-icon"><el-icon><Clock /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.active_sessions_today ?? 0 }}</div>
                <div class="stat-label">Active Today</div>
                <div class="stat-sub">{{ data?.model_usage?.length ?? 0 }} models used</div>
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
            <div class="chart-title">Daily Activity (30d)</div>
            <div class="chart-body">
              <ECharts :option="dailyActivityOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Model Usage</div>
            <div class="chart-body">
              <ECharts :option="modelUsageOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="table-box">
            <div class="table-title">Recent Sessions</div>
            <el-table :data="data?.recent ?? []" stripe size="small" max-height="400">
              <el-table-column prop="title" label="Title" min-width="200" show-overflow-tooltip />
              <el-table-column prop="key" label="Key" width="120" show-overflow-tooltip />
              <el-table-column prop="message_count" label="Messages" width="100" sortable />
              <el-table-column prop="updated" label="Last Updated" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.updated) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="aiUsage">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ChatDotSquare, ChatLineSquare, TrendCharts, Clock, Refresh } from "@element-plus/icons-vue";
import { getAiStats } from "@/api/modules/dashboard";
import type { AiStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const data = ref<AiStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const dailyAvgSessions = computed(() => {
  const daily = data.value?.daily ?? [];
  if (!daily.length) return 0;
  return Math.round(daily.reduce((s, d) => s + d.sessions, 0) / daily.length);
});

const dailyAvgMessages = computed(() => {
  const daily = data.value?.daily ?? [];
  if (!daily.length) return 0;
  return Math.round(daily.reduce((s, d) => s + d.messages, 0) / daily.length);
});

const dailyActivityOption = computed<ECOption>(() => {
  const daily = data.value?.daily ?? [];
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Sessions", "Messages"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "15%", containLabel: true },
    xAxis: { type: "category", data: daily.map(d => d.date.slice(5)), axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "Sessions",
        type: "bar",
        data: daily.map(d => d.sessions),
        barWidth: "40%",
        itemStyle: { color: "#5470c6", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Messages",
        type: "line",
        data: daily.map(d => d.messages),
        smooth: true,
        itemStyle: { color: "#ee6666" },
      },
    ],
  };
});

const modelUsageOption = computed<ECOption>(() => {
  const models = data.value?.model_usage ?? [];
  if (models.length === 0) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center" },
    series: [{
      type: "pie",
      radius: ["50%", "75%"],
      center: ["55%", "50%"],
      data: models.map((m, i) => ({
        value: m.count,
        name: m.model,
        itemStyle: { color: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#fc8452", "#9a60b4", "#3ba272"][i % 8] },
      })),
      label: { formatter: "{b}: {c}" },
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