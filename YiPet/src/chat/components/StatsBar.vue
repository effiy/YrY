<script setup lang="ts">
/**
 * YiPet StatsBar — compact personal activity summary with data freshness.
 * Mirrors YiVad Home stat cards + DataFreshnessBar: sessions, knowledge, bugs, today, sync age.
 */
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Collection, Document, Warning, Clock, Refresh } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';
import { getDashboard } from '../stores/services';

const store = useChatStore();
const s = store.state;

interface StatItem { key: string; label: string; value: number; icon: any; color: string; }

const stats = computed<StatItem[]>(() => {
  const knowledgeCount = s.knowledgeTree?.reduce((sum, cat) => sum + (cat.files?.length || 0), 0) || 0;
  const today = new Date().toDateString();
  const todaySessions = s.sessions.filter((ses: any) => {
    const ts = ses.updatedAt || ses.createdAt;
    return ts && new Date(ts).toDateString() === today;
  }).length;
  return [
    { key: 'sessions', label: 'Sessions', value: s.sessions.length, icon: Collection, color: '#5470c6' },
    { key: 'knowledge', label: 'Knowledge', value: knowledgeCount, icon: Document, color: '#91cc75' },
    { key: 'bugs', label: 'Bugs', value: (s as any).recentBugs?.length || 0, icon: Warning, color: '#ee6666' },
    { key: 'today', label: 'Today', value: todaySessions, icon: Clock, color: '#fac858' },
  ].filter(st => st.value > 0);
});

const ageSeconds = computed(() => s.lastSyncTime ? Math.floor((Date.now() - s.lastSyncTime) / 1000) : -1);
const ageLabel = computed(() => {
  if (ageSeconds.value < 0) return '';
  if (ageSeconds.value < 5) return 'just now';
  if (ageSeconds.value < 60) return `${ageSeconds.value}s ago`;
  const m = Math.floor(ageSeconds.value / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
});
const isFresh = computed(() => ageSeconds.value >= 0 && ageSeconds.value < 60);

const serverOnline = ref<boolean | null>(null);
const serverUptime = ref(0);

async function checkServer() {
  try {
    const dashboard = getDashboard();
    if (!dashboard) return;
    const snap = await dashboard.getLiveSnapshot();
    serverOnline.value = true;
    serverUptime.value = snap.server_uptime || 0;
  } catch {
    serverOnline.value = false;
  }
}

function refresh() { store.mount?.(); }

onMounted(() => { checkServer(); });

let _timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  _timer = setInterval(() => { checkServer(); }, 60000);
});
onUnmounted(() => {
  if (_timer) { clearInterval(_timer); _timer = null; }
});
</script>

<template>
  <div v-if="stats.length" class="stats-bar">
    <div v-for="st in stats" :key="st.key" class="stats-bar__item">
      <span class="stats-bar__icon" :style="{ color: st.color }">
        <el-icon :size="14"><component :is="st.icon" /></el-icon>
      </span>
      <span class="stats-bar__value">{{ st.value }}</span>
      <span class="stats-bar__label">{{ st.label }}</span>
    </div>
    <div v-if="ageLabel" class="stats-bar__freshness" :class="{ 'is-fresh': isFresh }" title="Data synced via YiAi">
      <span class="stats-bar__pulse" :class="{ 'is-live': isFresh }" />
      <span class="stats-bar__age">{{ ageLabel }}</span>
      <el-button :icon="Refresh" size="small" text @click="refresh" title="Refresh data" />
    </div>
    <div v-if="serverOnline !== null" class="stats-bar__server" :title="serverOnline ? `YiAi up · ${serverUptime}h uptime` : 'YiAi unreachable'">
      <span class="stats-bar__server-dot" :class="{ 'is-online': serverOnline }" />
    </div>
  </div>
</template>

<style scoped>
.stats-bar { display: flex; gap: 6px; align-items: center; padding: 8px 12px; margin: 0 12px 8px; background: var(--yp-surface-raised, #f5f7fa); border-radius: 10px; border: 1px solid var(--yp-border-subtle, #e4e7ed); }
.stats-bar__item { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: var(--yp-surface-base, #fff); flex: 1; min-width: 0; justify-content: center; }
.stats-bar__icon { display: flex; flex-shrink: 0; }
.stats-bar__value { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--yp-text-primary, #303133); }
.stats-bar__label { font-size: 10px; font-weight: 500; color: var(--yp-text-secondary, #909399); text-transform: uppercase; letter-spacing: 0.3px; }
.stats-bar__freshness { display: flex; gap: 4px; align-items: center; flex-shrink: 0; padding: 4px 8px; border-radius: 6px; background: var(--yp-surface-base, #fff); border-left: 1px solid var(--yp-border-subtle, #e4e7ed); }
.stats-bar__pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--el-text-color-placeholder); transition: all 0.3s; }
.stats-bar__pulse.is-live { background: var(--el-color-success); animation: sb-pulse 2s ease-in-out infinite; }
@keyframes sb-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(103,194,58,0.4); } 50% { box-shadow: 0 0 0 5px rgba(103,194,58,0); } }
.stats-bar__age { font-size: 10px; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--yp-text-placeholder, #c0c4cc); white-space: nowrap; min-width: 44px; text-align: right; }
.stats-bar__server { display: flex; align-items: center; flex-shrink: 0; padding: 0 4px; }
.stats-bar__server-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--el-color-danger); }
.stats-bar__server-dot.is-online { background: var(--el-color-success); box-shadow: 0 0 4px rgba(103,194,58,0.5); }
</style>