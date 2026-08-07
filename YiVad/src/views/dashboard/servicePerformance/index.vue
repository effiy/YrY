<template>
  <div class="service-perf-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">Service Performance</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-calls">
              <div class="stat-icon"><el-icon><Connection /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.total_calls ?? 0 }}</div>
                <div class="stat-label">Total Calls</div>
                <div class="stat-sub">{{ data?.total_success ?? 0 }} success / {{ data?.total_failed ?? 0 }} failed</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-success">
              <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.success_rate ?? 0 }}%</div>
                <div class="stat-label">Success Rate</div>
                <el-progress :percentage="data?.success_rate ?? 0" :stroke-width="6" :color="data?.success_rate === 100 ? '#67c23a' : data?.success_rate && data?.success_rate >= 95 ? '#e6a23c' : '#f56c6c'" :show-text="false" style="margin-top: 6px" />
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-avg">
              <div class="stat-icon"><el-icon><Timer /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ fmtMs(data?.avg_duration_ms ?? 0) }}</div>
                <div class="stat-label">Avg Duration</div>
                <div class="stat-sub">{{ data?.by_service?.length ?? 0 }} services tracked</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-failed">
              <div class="stat-icon"><el-icon><CircleClose /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.total_failed ?? 0 }}</div>
                <div class="stat-label">Failed</div>
                <div class="stat-sub" :class="data?.total_failed === 0 ? 'text-ok' : 'text-err'">{{ data?.total_failed === 0 ? 'All clear' : 'Needs attention' }}</div>
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
            <div class="chart-title">Calls by Service (Success / Failed)</div>
            <div class="chart-body">
              <ECharts :option="callsBarOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Duration by Service (avg / range)</div>
            <div class="chart-body">
              <ECharts :option="durationBarOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card recent-box">
      <div class="recent-title">Recent Service Calls</div>
      <el-table :data="data?.recent ?? []" stripe size="small" max-height="500">
        <el-table-column prop="service" label="Service" min-width="160" show-overflow-tooltip />
        <el-table-column prop="method" label="Method" min-width="120" show-overflow-tooltip />
        <el-table-column label="Status" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Duration" width="100" sortable prop="duration_ms">
          <template #default="{ row }">
            <span :style="{ color: row.duration_ms > 1000 ? '#f56c6c' : row.duration_ms > 100 ? '#e6a23c' : '#67c23a' }">
              {{ fmtMs(row.duration_ms) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="input_summary" label="Input" min-width="200" show-overflow-tooltip />
        <el-table-column prop="timestamp" label="Time" width="170">
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="servicePerformance">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Connection, CircleCheck, CircleClose, Timer, Refresh } from "@element-plus/icons-vue";
import { getServiceStats } from "@/api/modules/dashboard";
import type { ServiceStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const data = ref<ServiceStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

function fmtMs(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1) + "s";
  if (ms < 1) return "<1ms";
  return ms.toFixed(0) + "ms";
}

const callsBarOption = computed<ECOption>(() => {
  const services = data.value?.by_service ?? [];
  const labels = services.map(s => s.method ? `${s.service}:${s.method}` : s.service);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { data: ["Success", "Failed"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "12%", containLabel: true },
    xAxis: { type: "value", minInterval: 1 },
    yAxis: { type: "category", data: labels.reverse(), axisLabel: { fontSize: 11 } },
    series: [
      {
        name: "Success", type: "bar", stack: "total",
        data: services.map(s => s.success).reverse(),
        barWidth: "60%", itemStyle: { color: "#67c23a", borderRadius: [0, 0, 0, 0] },
      },
      {
        name: "Failed", type: "bar", stack: "total",
        data: services.map(s => s.failed).reverse(),
        barWidth: "60%", itemStyle: { color: "#f56c6c", borderRadius: [0, 6, 6, 0] },
      },
    ],
  };
});

const durationBarOption = computed<ECOption>(() => {
  const services = data.value?.by_service ?? [];
  const labels = services.map(s => s.method ? `${s.service}:${s.method}` : s.service);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (p: any) => `${p[0].name}<br/>Avg: ${fmtMs(p[0].value)}<br/>Min: ${fmtMs(p[0].data.min)}<br/>Max: ${fmtMs(p[0].data.max)}` },
    grid: { left: "3%", right: "10%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", name: "ms" },
    yAxis: { type: "category", data: labels.reverse(), axisLabel: { fontSize: 11 } },
    series: [{
      type: "bar",
      data: services.map(s => ({ value: s.avg_duration_ms, min: s.min_duration_ms, max: s.max_duration_ms })).reverse(),
      barWidth: "60%",
      itemStyle: { color: "#ee6666", borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: "right", fontSize: 10, formatter: (p: any) => `${fmtMs(p.data.min)} ~ ${fmtMs(p.data.max)}` },
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
    const res = await getServiceStats();
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