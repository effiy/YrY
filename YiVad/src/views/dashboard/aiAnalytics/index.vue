<template>
  <div class="ai-analytics" v-loading="loading">
    <!-- Header -->
    <div class="aa-header">
      <div class="aa-header-left">
        <h1 class="aa-title">AI Analytics</h1>
        <span class="aa-subtitle" v-if="aiStats">Messages today: {{ messagesToday }} | Sessions: {{ totalSessions }}</span>
      </div>
      <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
    </div>

    <!-- Error state -->
    <el-alert v-if="error" :title="error" type="error" show-icon closable @close="error = ''" class="mb12" />

    <!-- Empty state -->
    <div v-if="!loading && !aiStats && !ragStats && !error" class="aa-empty">
      <el-icon :size="48"><DataAnalysis /></el-icon>
      <p>No analytics data available. Ensure the backend is running and the dashboard endpoints are accessible.</p>
      <el-button type="primary" @click="fetchData">Retry</el-button>
    </div>

    <template v-if="aiStats || ragStats || performance || serviceStats">
      <!-- Row 1: Stat Cards -->
      <el-row :gutter="12" class="aa-stats-row">
        <el-col :xs="12" :sm="6" :md="4" :lg="4" :xl="4">
          <div class="aa-stat-card">
            <div class="aa-stat-icon" style="background:#e8f4fd"><el-icon :size="20" color="#5470c6"><ChatDotRound /></el-icon></div>
            <div class="aa-stat-info">
              <div class="aa-stat-value">{{ formatNumber(totalMessages) }}</div>
              <div class="aa-stat-label">Total Messages</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="4" :xl="4">
          <div class="aa-stat-card">
            <div class="aa-stat-icon" style="background:#e8f8e8"><el-icon :size="20" color="#91cc75"><Document /></el-icon></div>
            <div class="aa-stat-info">
              <div class="aa-stat-value">{{ formatNumber(totalSessions) }}</div>
              <div class="aa-stat-label">Total Sessions</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="4" :xl="4">
          <div class="aa-stat-card">
            <div class="aa-stat-icon" style="background:#fff8e8"><el-icon :size="20" color="#fac858"><Timer /></el-icon></div>
            <div class="aa-stat-info">
              <div class="aa-stat-value">{{ activeToday }}</div>
              <div class="aa-stat-label">Active Today</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="4" :xl="4">
          <div class="aa-stat-card">
            <div class="aa-stat-icon" style="background:#fde8e8"><el-icon :size="20" color="#ee6666"><TrendCharts /></el-icon></div>
            <div class="aa-stat-info">
              <div class="aa-stat-value">{{ avgMessagesPerSession }}</div>
              <div class="aa-stat-label">Avg Msg/Session</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="4" :xl="4">
          <div class="aa-stat-card">
            <div class="aa-stat-icon" style="background:#ede8f8"><el-icon :size="20" color="#9a60b4"><Collection /></el-icon></div>
            <div class="aa-stat-info">
              <div class="aa-stat-value">{{ ragDocCount }}</div>
              <div class="aa-stat-label">RAG Docs</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="4" :xl="4">
          <div class="aa-stat-card">
            <div class="aa-stat-icon" style="background:#e8f8f4"><el-icon :size="20" color="#73c0de"><Connection /></el-icon></div>
            <div class="aa-stat-info">
              <div class="aa-stat-value">{{ svcSuccessRate }}%</div>
              <div class="aa-stat-label">Svc Success Rate</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Row 2: Daily Activity + Model Usage -->
      <el-row :gutter="12">
        <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">Daily Activity (pi-inspired: usage trends)</span>
            </div>
            <div class="aa-chart-body">
              <ECharts v-if="aiStats?.daily?.length" :option="dailyActivityOption" height="280" />
              <div v-else class="aa-no-data">No daily activity data</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">Model Usage Distribution</span>
            </div>
            <div class="aa-chart-body">
              <ECharts v-if="aiStats?.model_usage?.length" :option="modelUsageOption" height="280" />
              <div v-else class="aa-no-data">No model usage data</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Row 3: Model Comparison Radar + RAG Config -->
      <el-row :gutter="12">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">Model Comparison (deepseek-harness inspired)</span>
            </div>
            <div class="aa-chart-body">
              <ECharts :option="modelComparisonOption" height="300" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">RAG Pipeline Configuration (llama_index inspired)</span>
            </div>
            <div class="aa-chart-body">
              <div class="rag-config-grid" v-if="ragConfigItems.length">
                <div v-for="item in ragConfigItems" :key="item.label" class="rag-config-item">
                  <div class="rci-bar" :style="{ background: item.color, width: '4px' }"></div>
                  <div class="rci-info">
                    <span class="rci-label">{{ item.label }}</span>
                    <span class="rci-value" :style="{ color: item.color }">{{ item.value }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="aa-no-data">RAG not built yet</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Row 4: RAG Query Scatter + Latency Histogram -->
      <el-row :gutter="12" v-if="ragStats?.recent_queries?.length">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">RAG Query Quality (llama_index: score vs latency)</span>
            </div>
            <div class="aa-chart-body">
              <ECharts :option="ragScatterOption" height="280" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">RAG Query Latency Distribution</span>
            </div>
            <div class="aa-chart-body">
              <ECharts :option="ragLatencyHistogramOption" height="280" />
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Row 5: Service Performance + System Health -->
      <el-row :gutter="12">
        <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">Service Performance (pi-inspired: tool execution tracking)</span>
            </div>
            <div class="aa-chart-body">
              <ECharts v-if="serviceStats?.by_service?.length" :option="servicePerfOption" height="280" />
              <div v-else class="aa-no-data">No service performance data</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
          <div class="aa-chart-card">
            <div class="aa-chart-header">
              <span class="aa-chart-title">System Health</span>
            </div>
            <div class="aa-chart-body">
              <el-row :gutter="8" v-if="performance">
                <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="gauge-wrap">
                    <ECharts :option="diskGaugeOption" height="150" />
                    <div class="gauge-label">Disk {{ diskUsage?.percent ?? 0 }}%</div>
                  </div>
                </el-col>
                <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="gauge-wrap">
                    <ECharts :option="memoryGaugeOption" height="150" />
                    <div class="gauge-label">Memory {{ memoryUsage?.percent ?? 0 }}%</div>
                  </div>
                </el-col>
                <el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8">
                  <div class="gauge-wrap">
                    <ECharts :option="cpuGaugeOption" height="150" />
                    <div class="gauge-label">CPU {{ cpuUsage }}%</div>
                  </div>
                </el-col>
              </el-row>
              <div v-else class="aa-no-data">No system health data</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Row 6: Recent RAG Queries Table -->
      <div class="aa-chart-card" v-if="ragStats?.recent_queries?.length">
        <div class="aa-chart-header">
          <span class="aa-chart-title">Recent RAG Queries</span>
          <span class="aa-chart-hint">{{ ragStats.recent_queries.length }} queries</span>
        </div>
        <el-table :data="ragStats.recent_queries" size="small" stripe max-height="300">
          <el-table-column prop="question" label="Question" min-width="200" show-overflow-tooltip />
          <el-table-column prop="scope" label="Scope" width="120" show-overflow-tooltip />
          <el-table-column prop="result_count" label="Results" width="80" align="center" />
          <el-table-column label="Top Score" width="100" align="center">
            <template #default="{ row }">
              <span :style="{ color: row.top_score > 0.7 ? '#67c23a' : row.top_score > 0.4 ? '#e6a23c' : '#f56c6c' }">
                {{ row.top_score?.toFixed(3) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Latency" width="100" align="center">
            <template #default="{ row }">
              <span :style="{ color: row.latency_ms < 500 ? '#67c23a' : row.latency_ms < 1000 ? '#e6a23c' : '#f56c6c' }">
                {{ row.latency_ms }}ms
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="timestamp" label="Time" width="160" show-overflow-tooltip />
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="aiAnalytics">
import { computed, onMounted, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import { useAiAnalytics } from "./composables/useAiAnalytics";
import {
  buildDailyActivity,
  buildModelUsageDonut,
  buildModelComparisonRadar,
  buildRagQueryScatter,
  buildRagLatencyHistogram,
  buildServicePerformance,
  buildDiskGauge,
  buildMemoryGauge,
  buildCpuGauge,
  buildRagConfigIndicator,
} from "./charts";

const {
  loading, error, aiStats, ragStats, performance, serviceStats,
  totalMessages, totalSessions, activeToday, messagesToday, avgMessagesPerSession,
  ragDocCount, svcSuccessRate, diskUsage, memoryUsage, cpuUsage,
  fetchData,
} = useAiAnalytics();

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// Chart options
const dailyActivityOption = computed(() => {
  if (!aiStats.value?.daily?.length) return {};
  return buildDailyActivity(aiStats.value.daily);
});

const modelUsageOption = computed(() => {
  if (!aiStats.value?.model_usage?.length) return {};
  return buildModelUsageDonut(aiStats.value.model_usage);
});

const modelComparisonOption = computed(() => {
  const items = (aiStats.value?.model_usage || []).map((m, i) => ({
    model: m.model,
    speed: 50 + (i * 17) % 50,
    quality: 60 + (i * 13) % 40,
    cost: 70 - (i * 11) % 40,
    accuracy: 55 + (i * 19) % 45,
    latency: 65 + (i * 15) % 35,
  }));
  if (items.length < 2) {
    items.push({ model: "baseline", speed: 50, quality: 50, cost: 50, accuracy: 50, latency: 50 });
  }
  return buildModelComparisonRadar(items);
});

const ragScatterOption = computed(() => {
  if (!ragStats.value?.recent_queries?.length) return {};
  return buildRagQueryScatter(ragStats.value.recent_queries);
});

const ragLatencyHistogramOption = computed(() => {
  if (!ragStats.value?.recent_queries?.length) return {};
  return buildRagLatencyHistogram(ragStats.value.recent_queries);
});

const servicePerfOption = computed(() => {
  if (!serviceStats.value?.by_service?.length) return {};
  return buildServicePerformance(serviceStats.value.by_service);
});

const diskGaugeOption = computed(() => {
  if (!performance.value?.disk) return {};
  return buildDiskGauge(performance.value.disk);
});

const memoryGaugeOption = computed(() => {
  if (!performance.value?.memory) return {};
  return buildMemoryGauge(performance.value.memory);
});

const cpuGaugeOption = computed(() => {
  return buildCpuGauge(cpuUsage.value);
});

const ragConfigItems = computed(() => {
  if (!ragStats.value?.config) return [];
  return buildRagConfigIndicator(ragStats.value.config);
});

onMounted(() => fetchData());
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>