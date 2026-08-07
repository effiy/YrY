<template>
  <div class="performance-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">System Performance</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-cpu" :class="cpuLevel">
              <div class="stat-icon"><el-icon><Cpu /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.process.cpu_percent ?? 0 }}%</div>
                <div class="stat-label">CPU Usage</div>
                <div class="stat-sub">{{ data?.process.threads ?? 0 }} threads</div>
                <div class="stat-delta" :class="deltaClass('cpu')" v-if="deltas.cpu !== 0">{{ deltaSign('cpu') }}{{ Math.abs(deltas.cpu).toFixed(1) }}% since last</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-memory" :class="memoryLevel">
              <div class="stat-icon"><el-icon><MagicStick /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.process.memory_mb ?? 0 }} MB</div>
                <div class="stat-label">Process Memory</div>
                <div class="stat-sub">System: {{ data?.memory.used_gb ?? 0 }}/{{ data?.memory.total_gb ?? 0 }} GB</div>
                <div class="stat-delta" :class="deltaClass('mem')" v-if="deltas.mem !== 0">{{ deltaSign('mem') }}{{ Math.abs(deltas.mem).toFixed(1) }} MB since last</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-disk">
              <div class="stat-icon"><el-icon><Coin /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.disk.percent ?? 0 }}%</div>
                <div class="stat-label">Disk Usage</div>
                <div class="stat-sub">{{ data?.disk.free_gb ?? 0 }} GB free of {{ data?.disk.total_gb ?? 0 }} GB</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-uptime">
              <div class="stat-icon"><el-icon><Timer /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ data?.process.pid ?? 0 }}</div>
                <div class="stat-label">Process ID</div>
                <div class="stat-sub">{{ data?.process.threads ?? 0 }} threads, {{ data?.process.memory_mb ?? 0 }} MB</div>
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
            <div class="chart-title">Resource Usage Overview</div>
            <div class="chart-body">
              <ECharts :option="resourceGauge" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="resource-box">
            <div class="resource-title">Resource Details</div>
            <div class="resource-body">
              <div class="resource-section">
                <div class="resource-section-title">Disk</div>
                <div class="resource-item"><span class="resource-label">Path</span><span class="resource-value" :title="data?.disk.path">{{ data?.disk.path || '—' }}</span></div>
                <div class="resource-item"><span class="resource-label">Total / Used / Free</span><span class="resource-value">{{ data?.disk.total_gb ?? 0 }} / {{ data?.disk.used_gb ?? 0 }} / {{ data?.disk.free_gb ?? 0 }} GB</span></div>
                <el-progress :percentage="data?.disk.percent ?? 0" :stroke-width="12" :color="diskColor" />
              </div>
              <div class="resource-section">
                <div class="resource-section-title">Memory</div>
                <div class="resource-item"><span class="resource-label">Total / Used / Available</span><span class="resource-value">{{ data?.memory.total_gb ?? 0 }} / {{ data?.memory.used_gb ?? 0 }} / {{ data?.memory.free_gb ?? 0 }} GB</span></div>
                <el-progress :percentage="data?.memory.percent ?? 0" :stroke-width="12" :color="memoryColor" />
              </div>
              <div class="resource-section">
                <div class="resource-section-title">Process</div>
                <div class="resource-item"><span class="resource-label">CPU / Memory / Threads</span><span class="resource-value">{{ data?.process.cpu_percent ?? 0 }}% / {{ data?.process.memory_mb ?? 0 }} MB / {{ data?.process.threads ?? 0 }}</span></div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="performance">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Cpu, MagicStick, Coin, Timer, Refresh } from "@element-plus/icons-vue";
import { getPerformance } from "@/api/modules/dashboard";
import type { PerformanceData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const data = ref<PerformanceData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const prevValues = ref<Record<string, number>>({});
const deltas = ref<Record<string, number>>({});

function trackDelta(key: string, current: number) {
  const prev = prevValues.value[key];
  if (prev !== undefined) deltas.value[key] = current - prev;
  prevValues.value[key] = current;
}

function deltaSign(key: string): string { return deltas.value[key] > 0 ? "↑" : "↓"; }
function deltaClass(key: string): string { return deltas.value[key] > 0 ? "delta-up" : "delta-down"; }

const cpuLevel = computed(() => {
  const p = data.value?.process.cpu_percent ?? 0;
  if (p > 80) return "stat-critical";
  if (p > 50) return "stat-warn";
  return "stat-ok";
});

const memoryLevel = computed(() => {
  const p = data.value?.memory.percent ?? 0;
  if (p > 90) return "stat-critical";
  if (p > 70) return "stat-warn";
  return "stat-ok";
});

const diskColor = computed(() => {
  const p = data.value?.disk.percent ?? 0;
  if (p > 90) return "#f56c6c";
  if (p > 70) return "#e6a23c";
  return "#67c23a";
});

const memoryColor = computed(() => {
  const p = data.value?.memory.percent ?? 0;
  if (p > 90) return "#f56c6c";
  if (p > 70) return "#e6a23c";
  return "#67c23a";
});

const cpuColor = computed(() => {
  const p = data.value?.process.cpu_percent ?? 0;
  if (p > 80) return "#f56c6c";
  if (p > 50) return "#e6a23c";
  return "#67c23a";
});

const resourceGauge = computed<ECOption>(() => ({
  series: [
    {
      type: "gauge", startAngle: 210, endAngle: -30, min: 0, max: 100,
      center: ["17%", "55%"], radius: "75%",
      title: { show: true, offsetCenter: [0, "85%"], fontSize: 12, color: "#606266" },
      progress: { show: true, width: 10, itemStyle: { color: cpuColor.value } },
      axisLine: { lineStyle: { width: 10 } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      detail: { valueAnimation: true, formatter: "{value}%", fontSize: 18, offsetCenter: [0, "55%"] },
      data: [{ value: data.value?.process.cpu_percent ?? 0, name: "CPU" }],
    },
    {
      type: "gauge", startAngle: 210, endAngle: -30, min: 0, max: 100,
      center: ["50%", "55%"], radius: "75%",
      title: { show: true, offsetCenter: [0, "85%"], fontSize: 12, color: "#606266" },
      progress: { show: true, width: 10, itemStyle: { color: diskColor.value } },
      axisLine: { lineStyle: { width: 10 } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      detail: { valueAnimation: true, formatter: "{value}%", fontSize: 18, offsetCenter: [0, "55%"] },
      data: [{ value: data.value?.disk.percent ?? 0, name: "Disk" }],
    },
    {
      type: "gauge", startAngle: 210, endAngle: -30, min: 0, max: 100,
      center: ["83%", "55%"], radius: "75%",
      title: { show: true, offsetCenter: [0, "85%"], fontSize: 12, color: "#606266" },
      progress: { show: true, width: 10, itemStyle: { color: memoryColor.value } },
      axisLine: { lineStyle: { width: 10 } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      detail: { valueAnimation: true, formatter: "{value}%", fontSize: 18, offsetCenter: [0, "55%"] },
      data: [{ value: data.value?.memory.percent ?? 0, name: "Memory" }],
    },
  ],
}));

async function fetchData() {
  try {
    loading.value = true;
    const res = await getPerformance();
    data.value = res.data;
    trackDelta("cpu", res.data?.process.cpu_percent ?? 0);
    trackDelta("mem", res.data?.process.memory_mb ?? 0);
    lastUpdated.value = new Date().toLocaleTimeString();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
  refreshTimer = setInterval(fetchData, 30_000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>