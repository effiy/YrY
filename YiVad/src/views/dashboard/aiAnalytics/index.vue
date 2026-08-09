<template>
  <div class="ai-analytics-box" v-loading="loading">
    <!-- Row 1: Overview Header + Stat Cards -->
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">AI Chat Analytics</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <!-- Row A: Volume metrics -->
      <el-row :gutter="12">
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-sessions" :class="{ 'stat-pulse': activeStatCard === 'sessions' }" @click="pulseCard('sessions')">
            <div class="stat-icon"><el-icon><ChatDotRound /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(data?.total_sessions ?? 0) }}</div>
              <div class="stat-label">Total Sessions</div>
              <div class="stat-sub">{{ dailyAvgSessions }} avg / day</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-messages" :class="{ 'stat-pulse': activeStatCard === 'messages' }" @click="pulseCard('messages')">
            <div class="stat-icon"><el-icon><ChatLineSquare /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(data?.total_messages ?? 0) }}</div>
              <div class="stat-label">Total Messages</div>
              <div class="stat-sub">{{ dailyAvgMessages }} avg / day</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-avg" :class="{ 'stat-pulse': activeStatCard === 'avg' }" @click="pulseCard('avg')">
            <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data?.avg_messages_per_session ?? 0 }}</div>
              <div class="stat-label">Avg Msg / Session</div>
              <div class="stat-sub">{{ data?.model_usage?.length ?? 0 }} models used</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-today" :class="{ 'stat-pulse': activeStatCard === 'today' }" @click="pulseCard('today')">
            <div class="stat-icon"><el-icon><Clock /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(data?.messages_today ?? 0) }}</div>
              <div class="stat-label">Messages Today</div>
              <div class="stat-sub">{{ data?.active_sessions_today ?? 0 }} active sessions</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <!-- Row B: Activity metrics -->
      <el-row :gutter="12">
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-active" :class="{ 'stat-pulse': activeStatCard === 'active' }" @click="pulseCard('active')">
            <div class="stat-icon"><el-icon><UserFilled /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data?.active_sessions_today ?? 0 }}</div>
              <div class="stat-label">Active Today</div>
              <div class="stat-sub">sessions with messages</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-models" :class="{ 'stat-pulse': activeStatCard === 'models' }" @click="pulseCard('models')">
            <div class="stat-icon"><el-icon><Cpu /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ data?.model_usage?.length ?? 0 }}</div>
              <div class="stat-label">Model Types</div>
              <div class="stat-sub">{{ totalModelCalls }} total calls</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-trend" :class="{ 'stat-pulse': activeStatCard === 'trend' }" @click="pulseCard('trend')">
            <div class="stat-icon"><el-icon><DataLine /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ weeklySummary.length }}</div>
              <div class="stat-label">Active Days</div>
              <div class="stat-sub">in last 7 days</div>
            </div>
          </div>
        </el-col>
        <el-col class="mb12" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="stat-card stat-top-model" :class="{ 'stat-pulse': activeStatCard === 'topModel' }" @click="pulseCard('topModel')">
            <div class="stat-icon"><el-icon><Medal /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value" style="font-size:13px;line-height:1.3;">{{ topModelName }}</div>
              <div class="stat-label">Top Model</div>
              <div class="stat-sub">{{ topModelShare }}% of calls</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Model filter pills -->
    <div class="filter-bar" v-if="modelFilter">
      <span class="filter-label">Filtered by model:</span>
      <el-tag
        closable
        type="warning"
        size="small"
        @close="clearModelFilter"
        :color="modelColor(modelFilter)"
      >
        {{ modelFilter }}
      </el-tag>
    </div>

    <!-- Row 2: Main Charts — Daily Activity + Model Donut -->
    <div class="card charts-box">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <div class="chart-panel">
            <div class="chart-header">
              <span class="chart-title">Daily Activity (Last 30 Days)</span>
              <span class="chart-hint">click a day to highlight</span>
            </div>
            <div class="chart-body">
              <ECharts :option="dailyActivityOption" @chart-click="handleDailyClick" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-panel">
            <div class="chart-header">
              <span class="chart-title">Model Distribution</span>
              <span class="chart-hint">click to filter</span>
            </div>
            <div class="chart-body">
              <ECharts :option="modelDonutOption" @chart-click="handleModelClick" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Row 3: Trend Charts + Tables -->
    <div class="card charts-box">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-panel">
            <div class="chart-header">
              <span class="chart-title">Sessions Trend</span>
            </div>
            <div class="chart-body chart-body-sm">
              <ECharts :option="sessionsTrendOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-panel">
            <div class="chart-header">
              <span class="chart-title">Messages Trend</span>
            </div>
            <div class="chart-body chart-body-sm">
              <ECharts :option="messagesTrendOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Row 4: Model Breakdown + Weekly Summary -->
    <div class="card charts-box">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-panel">
            <div class="chart-header">
              <span class="chart-title">Model Usage Breakdown</span>
              <span class="chart-hint">click bar to filter</span>
            </div>
            <div class="chart-body chart-body-md">
              <ECharts :option="modelBarOption" @chart-click="handleModelClick" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="table-panel">
            <div class="chart-header">
              <span class="chart-title">Weekly Summary</span>
            </div>
            <div class="weekly-list">
              <div class="weekly-row" v-for="d in weeklySummary" :key="d.date">
                <span class="weekly-date">{{ d.date }}</span>
                <span class="weekly-sessions">{{ d.sessions }} sessions</span>
                <el-progress :percentage="d.sessionPercent" :stroke-width="4" :show-text="false" color="#6B9DFE" style="width: 60px; flex-shrink: 0;" />
                <span class="weekly-msgs">{{ d.messages }} msgs</span>
                <el-progress :percentage="d.msgPercent" :stroke-width="4" :show-text="false" color="#91cc75" style="width: 60px; flex-shrink: 0;" />
              </div>
              <div v-if="!weeklySummary.length" class="weekly-empty">No data available</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Row 5: Model Usage Table -->
    <div class="card charts-box" v-if="(data?.model_usage?.length ?? 0) > 0">
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="table-panel">
            <div class="chart-header">
              <span class="chart-title">Model Details</span>
            </div>
            <el-table :data="data?.model_usage ?? []" stripe size="small" max-height="320">
              <el-table-column label="Model" min-width="200">
                <template #default="{ row }">
                  <div class="model-cell">
                    <span class="model-dot" :style="{ background: modelColor(row.model) }"></span>
                    <span>{{ row.model }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="count" label="Calls" width="120" sortable align="center" />
              <el-table-column label="Share" width="180">
                <template #default="{ row }">
                  <div class="share-cell">
                    <el-progress :percentage="modelPercent(row.count)" :stroke-width="8" :show-text="false" :color="modelColor(row.model)" style="flex:1" />
                    <span class="share-text">{{ modelPercent(row.count) }}%</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Row 6: Recent Sessions -->
    <div class="card recent-box">
      <div class="chart-header">
        <span class="chart-title">Recent Sessions</span>
        <span class="chart-hint">{{ data?.recent?.length ?? 0 }} records</span>
      </div>
      <el-table :data="filteredRecent" stripe size="small" max-height="400" empty-text="No recent sessions">
        <el-table-column prop="title" label="Title" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="session-title">{{ row.title || "Untitled" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="message_count" label="Messages" width="100" sortable align="center" />
        <el-table-column prop="key" label="Session Key" width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <code class="session-key">{{ row.key }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="updated" label="Updated" width="160">
          <template #default="{ row }">
            <span class="session-time">{{ formatRelativeTime(row.updated) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="aiAnalytics">
import { computed } from "vue";
import { ChatDotRound, ChatLineSquare, TrendCharts, Clock, Refresh, UserFilled, Cpu, DataLine, Medal } from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import { useAiAnalytics } from "./composables/useAiAnalytics";

const {
  data, loading, lastUpdated, modelFilter, activeStatCard,
  dailyAvgSessions, dailyAvgMessages, totalModelCalls,
  weeklySummary, filteredRecent,
  dailyActivityOption, modelDonutOption, modelBarOption,
  sessionsTrendOption, messagesTrendOption,
  modelPercent, handleModelClick, handleDailyClick,
  clearModelFilter, pulseCard, fetchData,
  formatNumber, formatRelativeTime, modelColor,
} = useAiAnalytics();

const topModelName = computed(() => {
  const models = data.value?.model_usage ?? [];
  if (!models.length) return "—";
  return [...models].sort((a, b) => b.count - a.count)[0].model;
});

const topModelShare = computed(() => {
  const models = data.value?.model_usage ?? [];
  if (!models.length) return 0;
  const top = [...models].sort((a, b) => b.count - a.count)[0];
  return modelPercent(top.count);
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
