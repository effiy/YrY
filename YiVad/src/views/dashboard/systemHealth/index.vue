<template>
  <div class="system-health-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">System Health</span>
        <div class="top-actions">
          <span class="health-score-badge" :class="healthScoreClass">{{ healthScore }}% Healthy</span>
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="status-card" :class="healthData?.server.running ? 'status-ok' : 'status-fail'">
              <div class="status-header">
                <span class="status-dot" :class="healthData?.server.running ? 'dot-green' : 'dot-red'" />
                <span class="status-name">Server</span>
                <el-tag :type="healthData?.server.running ? 'success' : 'danger'" size="small" class="status-tag">{{ healthData?.server.running ? 'Running' : 'Stopped' }}</el-tag>
              </div>
              <div class="status-body">
                <div class="status-row"><span class="status-label">Version</span><span class="status-value">{{ healthData?.server.version || '—' }}</span></div>
                <div class="status-row"><span class="status-label">Uptime</span><span class="status-value">{{ formattedUptime }}</span></div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="status-card" :class="healthData?.mongodb.connected ? 'status-ok' : 'status-fail'">
              <div class="status-header">
                <span class="status-dot" :class="healthData?.mongodb.connected ? 'dot-green' : 'dot-red'" />
                <span class="status-name">MongoDB</span>
                <el-tag :type="healthData?.mongodb.connected ? 'success' : 'danger'" size="small" class="status-tag">{{ healthData?.mongodb.connected ? 'Connected' : 'Down' }}</el-tag>
              </div>
              <div class="status-body">
                <div class="status-row"><span class="status-label">Database</span><span class="status-value">{{ healthData?.mongodb.database || '—' }}</span></div>
                <div class="status-row"><span class="status-label">Collections</span><span class="status-value">{{ collectionCount }}</span></div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="status-card" :class="healthData?.ollama.connected ? 'status-ok' : 'status-fail'">
              <div class="status-header">
                <span class="status-dot" :class="healthData?.ollama.connected ? 'dot-green' : 'dot-red'" />
                <span class="status-name">Ollama</span>
                <el-tag :type="healthData?.ollama.connected ? 'success' : 'danger'" size="small" class="status-tag">{{ healthData?.ollama.connected ? 'Connected' : 'Down' }}</el-tag>
              </div>
              <div class="status-body">
                <div class="status-row"><span class="status-label">Models</span><span class="status-value">{{ healthData?.ollama.model_count ?? 0 }}</span></div>
                <div class="status-row"><span class="status-label">URL</span><span class="status-value" :title="healthData?.ollama.url">{{ healthData?.ollama.url || '—' }}</span></div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="status-card" :class="healthData?.scheduler.enabled ? 'status-ok' : 'status-warn'">
              <div class="status-header">
                <span class="status-dot" :class="healthData?.scheduler.enabled ? 'dot-green' : 'dot-yellow'" />
                <span class="status-name">RSS Scheduler</span>
                <el-tag :type="healthData?.scheduler.enabled ? 'success' : 'warning'" size="small" class="status-tag">{{ healthData?.scheduler.enabled ? 'Running' : 'Stopped' }}</el-tag>
              </div>
              <div class="status-body">
                <div class="status-row"><span class="status-label">Type</span><span class="status-value">{{ healthData?.scheduler.type || '—' }}</span></div>
                <div class="status-row" v-if="healthData?.scheduler.interval"><span class="status-label">Interval</span><span class="status-value">{{ healthData?.scheduler.interval }}s</span></div>
                <div class="status-row" v-if="healthData?.scheduler.cron"><span class="status-label">Cron</span><span class="status-value">{{ formatCron(healthData.scheduler.cron) }}</span></div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="status-card" :class="healthData?.knowledge_watcher.running ? 'status-ok' : 'status-warn'">
              <div class="status-header">
                <span class="status-dot" :class="healthData?.knowledge_watcher.running ? 'dot-green' : 'dot-yellow'" />
                <span class="status-name">Knowledge Watcher</span>
                <el-tag :type="healthData?.knowledge_watcher.running ? 'success' : 'warning'" size="small" class="status-tag">{{ healthData?.knowledge_watcher.running ? 'Running' : 'Stopped' }}</el-tag>
              </div>
              <div class="status-body">
                <div class="status-row"><span class="status-label">Status</span><span class="status-value">{{ healthData?.knowledge_watcher.running ? 'Monitoring files' : 'Paused' }}</span></div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="status-card status-summary">
              <div class="status-header">
                <span class="status-name">Health Summary</span>
              </div>
              <div class="status-body">
                <div class="status-row"><span class="status-label">Services Up</span><span class="status-value health-count-ok">{{ healthyCount }} / {{ totalChecks }}</span></div>
                <div class="status-row"><span class="status-label">Services Down</span><span class="status-value" :class="failedCount > 0 ? 'health-count-err' : ''">{{ failedCount }}</span></div>
                <div class="status-row"><span class="status-label">Observers Enabled</span><span class="status-value">{{ observerEnabledCount }} / 4</span></div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="card bottom-box">
      <div class="bottom-title">Observer Middleware</div>
      <div class="bottom-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="observer-card" :class="healthData?.observer.throttle_enabled ? 'observer-on' : 'observer-off'">
              <div class="observer-name">Throttle</div>
              <div class="observer-status">{{ healthData?.observer.throttle_enabled ? 'Enabled' : 'Disabled' }}</div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="observer-card" :class="healthData?.observer.sampler_enabled ? 'observer-on' : 'observer-off'">
              <div class="observer-name">Sampler</div>
              <div class="observer-status">{{ healthData?.observer.sampler_enabled ? 'Enabled' : 'Disabled' }}</div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="observer-card" :class="healthData?.observer.sandbox_enabled ? 'observer-on' : 'observer-off'">
              <div class="observer-name">Sandbox</div>
              <div class="observer-status">{{ healthData?.observer.sandbox_enabled ? 'Enabled' : 'Disabled' }}</div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="observer-card" :class="healthData?.observer.guard_enabled ? 'observer-on' : 'observer-off'">
              <div class="observer-name">Reentrancy Guard</div>
              <div class="observer-status">{{ healthData?.observer.guard_enabled ? 'Enabled' : 'Disabled' }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="systemHealth">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { getDashboardHealth } from "@/api/modules/dashboard";
import type { DashboardHealthData } from "@/api/interface/yiweb";

const healthData = ref<DashboardHealthData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const totalChecks = 5; // Server, MongoDB, Ollama, Scheduler, Watcher
const healthyCount = computed(() => {
  if (!healthData.value) return 0;
  let count = 0;
  if (healthData.value.server.running) count++;
  if (healthData.value.mongodb.connected) count++;
  if (healthData.value.ollama.connected) count++;
  if (healthData.value.scheduler.enabled) count++;
  if (healthData.value.knowledge_watcher.running) count++;
  return count;
});

const failedCount = computed(() => totalChecks - healthyCount.value);

const healthScore = computed(() => Math.round((healthyCount.value / totalChecks) * 100));

const healthScoreClass = computed(() => {
  if (healthScore.value === 100) return "score-ok";
  if (healthScore.value >= 60) return "score-warn";
  return "score-err";
});

const collectionCount = computed(() => {
  if (!healthData.value?.collections) return 0;
  const c = healthData.value.collections;
  return Object.values(c).filter(v => v > 0).length;
});

const observerEnabledCount = computed(() => {
  if (!healthData.value?.observer) return 0;
  const o = healthData.value.observer;
  return [o.throttle_enabled, o.sampler_enabled, o.sandbox_enabled, o.guard_enabled].filter(Boolean).length;
});

const formattedUptime = computed(() => {
  if (!healthData.value) return "";
  const s = healthData.value.server.uptime_seconds;
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
});

function formatCron(cron: Record<string, any>): string {
  const parts = [];
  for (const [k, v] of Object.entries(cron)) {
    if (v !== null && v !== undefined) parts.push(`${k}=${v}`);
  }
  return parts.join(" ") || "—";
}

async function fetchData() {
  try {
    loading.value = true;
    const res = await getDashboardHealth();
    healthData.value = res.data;
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