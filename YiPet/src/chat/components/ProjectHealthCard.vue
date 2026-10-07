<script setup lang="ts">
/**
 * YiPet ProjectHealthCard — compact project health summary from YiAi Dashboard.
 * Shows when user is on a YiVad project page. Data via DashboardService.getSummary().
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { DataAnalysis, Warning, Check, Clock } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';
import { getDashboard } from '../stores/services';

const POLL_INTERVAL_MS = 60_000;
const store = useChatStore();
const s = store.state;

const summary = ref<any>(null);
const loading = ref(false);
const error = ref('');
const dataAge = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let ageTimer: ReturnType<typeof setInterval> | null = null;

const isOnProjectPage = computed(() => {
  const url = s.pageInfo?.url || '';
  return url.includes('localhost:8848') && url.includes('/project/');
});

async function fetchSummary() {
  if (!isOnProjectPage.value) return;
  const dashboard = getDashboard();
  if (!dashboard) return;
  loading.value = true;
  error.value = '';
  try {
    summary.value = await dashboard.getSummary();
    dataAge.value = 0;
  } catch (e: any) {
    error.value = e?.message || 'Failed to load';
    summary.value = null;
  } finally {
    loading.value = false;
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(fetchSummary, POLL_INTERVAL_MS);
  ageTimer = setInterval(() => { dataAge.value++; }, 1000);
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (ageTimer) { clearInterval(ageTimer); ageTimer = null; }
}

function healthColor(h: string): string {
  if (h === 'healthy') return '#67c23a';
  if (h === 'warning') return '#e6a23c';
  if (h === 'critical') return '#f56c6c';
  return '#909399';
}

const ageLabel = () => dataAge.value < 60 ? `${dataAge.value}s` : `${Math.floor(dataAge.value / 60)}m`;

watch(isOnProjectPage, (v) => {
  if (v) { fetchSummary(); startPolling(); }
  else { summary.value = null; stopPolling(); }
});
onMounted(() => {
  if (isOnProjectPage.value) { fetchSummary(); startPolling(); }
});
onUnmounted(() => stopPolling());
</script>

<template>
  <div v-if="isOnProjectPage && (summary || loading)" class="phc-card">
    <div v-if="loading" class="phc-loading">Loading project health...</div>
    <template v-else-if="summary">
      <div class="phc-header">
        <el-icon :size="14"><DataAnalysis /></el-icon>
        <span class="phc-title">Project Health</span>
        <span v-if="!loading && !error" class="phc-age" :class="{ 'phc-age--stale': dataAge > 60 }">{{ ageLabel() }}</span>
        <span class="phc-uptime">{{ summary.server_uptime }}h uptime</span>
      </div>
      <div class="phc-stats">
        <div class="phc-stat">
          <span class="phc-stat-val" style="color:var(--el-color-primary)">{{ summary.open_issues }}</span>
          <span class="phc-stat-lbl">Issues</span>
        </div>
        <div class="phc-stat">
          <span class="phc-stat-val" style="color:var(--el-color-danger)">{{ summary.open_bugs }}</span>
          <span class="phc-stat-lbl">Bugs</span>
        </div>
        <div class="phc-stat">
          <span class="phc-stat-val" style="color:var(--el-color-success)">{{ summary.today_done }}</span>
          <span class="phc-stat-lbl">Done today</span>
        </div>
        <div class="phc-stat">
          <span class="phc-stat-val" style="color:var(--el-color-warning)">{{ summary.overdue }}</span>
          <span class="phc-stat-lbl">Overdue</span>
        </div>
      </div>
      <div v-if="summary.projects?.length" class="phc-projects">
        <div v-for="p in summary.projects.slice(0, 4)" :key="p.key" class="phc-project">
          <span class="phc-proj-dot" :style="{background: healthColor(p.health)}" />
          <span class="phc-proj-name">{{ p.name }}</span>
          <span class="phc-proj-issues">{{ p.open_issues }}i</span>
          <span class="phc-proj-bugs">{{ p.open_bugs }}b</span>
        </div>
      </div>
    </template>
    <div v-if="error" class="phc-error">{{ error }}</div>
  </div>
</template>

<style scoped>
.phc-card {
  margin: 8px 12px;
  padding: 10px 12px;
  background: var(--yp-surface-raised, #f5f7fa);
  border: 1px solid var(--yp-border-subtle, #e4e7ed);
  border-radius: 10px;
}
.phc-loading { font-size: 11px; color: var(--yp-text-placeholder, #c0c4cc); text-align: center; padding: 8px 0; }
.phc-header { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }
.phc-title { font-size: 11px; font-weight: 700; color: var(--yp-text-primary, #303133); text-transform: uppercase; letter-spacing: 0.3px; }
.phc-age { font-size: 10px; font-weight: 600; color: var(--el-color-success); font-variant-numeric: tabular-nums; }
.phc-age--stale { color: var(--yp-text-placeholder, #c0c4cc); }
.phc-uptime { margin-left: auto; font-size: 10px; color: var(--yp-text-placeholder, #c0c4cc); }
.phc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px; }
.phc-stat { display: flex; flex-direction: column; align-items: center; padding: 4px; border-radius: 6px; background: var(--yp-surface-base, #fff); }
.phc-stat-val { font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.2; }
.phc-stat-lbl { font-size: 9px; font-weight: 500; color: var(--yp-text-secondary, #909399); text-transform: uppercase; }
.phc-projects { display: flex; flex-direction: column; gap: 2px; }
.phc-project { display: flex; gap: 6px; align-items: center; padding: 3px 6px; border-radius: 4px; }
.phc-proj-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.phc-proj-name { flex: 1; font-size: 10px; color: var(--yp-text-primary, #303133); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.phc-proj-issues, .phc-proj-bugs { font-size: 9px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--yp-text-secondary, #909399); }
.phc-error { font-size: 10px; color: var(--el-color-danger); text-align: center; }
</style>