<script setup lang="ts">
/**
 * YiPet Popup — Dashboard Summary Card
 * Shows at-a-glance project health from YiAi /dashboard/summary via the four-layer API client.
 * Cross-project data consistency with YiVad Home dashboard and Project Detail pages.
 */
import { ref, onMounted, onUnmounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { getApiServices } from '../services/api';
import type { DashboardSummary as DsData, ProjectSummary } from '@/api/services/dashboard';

const YIVAD_URL = 'http://localhost:8848';
const POLL_INTERVAL_MS = 60_000;
const summary = ref<DsData | null>(null);
const loading = ref(false);
const error = ref('');
const dataAge = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let ageTimer: ReturnType<typeof setInterval> | null = null;

async function fetchSummary() {
  loading.value = true; error.value = '';
  try {
    const svc = getApiServices();
    if (!svc) throw new Error('API not initialized');
    summary.value = await svc.dashboard.getSummary();
    dataAge.value = 0;
  } catch (e: any) {
    error.value = e?.message || 'YiAi unavailable';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchSummary();
  pollTimer = setInterval(fetchSummary, POLL_INTERVAL_MS);
  ageTimer = setInterval(() => { dataAge.value++; }, 1000);
});
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (ageTimer) clearInterval(ageTimer);
});

function openProject(key: string) {
  window.open(`${YIVAD_URL}/#/project/${key}`, '_blank', 'noopener,noreferrer');
}

function openYiVad() {
  window.open(`${YIVAD_URL}/#/home`, '_blank', 'noopener,noreferrer');
}

const ageLabel = () => dataAge.value < 60 ? `${dataAge.value}s` : `${Math.floor(dataAge.value / 60)}m`;
</script>

<template>
  <el-card v-if="summary || loading" class="popup-card ds-card" shadow="never">
    <template #header>
      <div class="popup-card-header">
        <span>Project Health</span>
        <span
          v-if="!loading && !error"
          class="ds-age"
          :class="{ 'ds-age--stale': dataAge > 60 }"
        >{{ ageLabel() }}</span>
        <el-button :icon="Refresh" size="small" text :loading="loading" @click="fetchSummary" />
      </div>
    </template>

    <div v-if="error" class="ds-error">{{ error }}</div>

    <template v-else-if="summary">
      <!-- Primary stats: 3x2 grid -->
      <div class="ds-grid">
        <div class="ds-stat" :class="{ 'ds-stat--warn': summary.overdue > 0 }">
          <span class="ds-stat__num">{{ summary.open_issues }}</span>
          <span class="ds-stat__label">Open Issues</span>
        </div>
        <div class="ds-stat" :class="{ 'ds-stat--warn': summary.open_bugs > 0 }">
          <span class="ds-stat__num">{{ summary.open_bugs }}</span>
          <span class="ds-stat__label">Open Bugs</span>
        </div>
        <div class="ds-stat ds-stat--good">
          <span class="ds-stat__num">{{ summary.today_done }}</span>
          <span class="ds-stat__label">Done Today</span>
        </div>
        <div class="ds-stat" :class="{ 'ds-stat--warn': summary.overdue > 0 }">
          <span class="ds-stat__num">{{ summary.overdue }}</span>
          <span class="ds-stat__label">Overdue</span>
        </div>
        <div class="ds-stat">
          <span class="ds-stat__num">{{ summary.chat_sessions }}</span>
          <span class="ds-stat__label">Chat Sessions</span>
        </div>
        <div class="ds-stat">
          <span class="ds-stat__num">{{ summary.knowledge_files }}</span>
          <span class="ds-stat__label">Knowledge Files</span>
        </div>
      </div>

      <!-- Project list with health dots + clickable links -->
      <div v-if="summary.projects?.length" class="ds-projects">
        <div class="ds-projects__label">{{ summary.active_projects }} active projects</div>
        <div
          v-for="p in summary.projects.slice(0, 5)"
          :key="p.key"
          class="ds-project"
          :class="'ds-project--' + p.health"
          @click="openProject(p.key)"
        >
          <span class="ds-project__dot" />
          <span class="ds-project__name">{{ p.name }}</span>
          <span class="ds-project__count">{{ p.open_issues }} issues · {{ p.open_bugs }} bugs</span>
        </div>
        <div v-if="summary.projects.length > 5" class="ds-more">
          +{{ summary.projects.length - 5 }} more projects
        </div>
      </div>

      <!-- Footer: link to full YiVad dashboard -->
      <div class="ds-footer">
        <el-button text size="small" @click="openYiVad">
          Open YiVad Dashboard →
        </el-button>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.ds-card { margin-top: 12px; }
.ds-age {
  font-size: 10px; font-weight: 600; font-variant-numeric: tabular-nums;
  color: var(--el-color-success); margin-left: auto; margin-right: 4px;
}
.ds-age--stale { color: var(--yp-text-secondary, #e9e5f5); }
.ds-error { font-size: 12px; color: var(--el-color-danger); padding: 8px 0; }
.ds-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.ds-stat { display: flex; flex-direction: column; align-items: center; padding: 8px 4px; border-radius: 8px; background: var(--yp-surface-base, #13111a); }
.ds-stat--warn .ds-stat__num { color: var(--el-color-warning); }
.ds-stat--good .ds-stat__num { color: var(--el-color-success); }
.ds-stat__num { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--yp-text-primary, #f5f3ff); }
.ds-stat__label { font-size: 9px; font-weight: 500; color: var(--yp-text-secondary, #e9e5f5); margin-top: 2px; text-align: center; }
.ds-projects { margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--yp-border-subtle, rgba(196, 181, 253, 0.2)); }
.ds-projects__label { font-size: 10px; font-weight: 600; color: var(--yp-text-secondary, #e9e5f5); margin-bottom: 6px; }
.ds-project {
  display: flex; gap: 6px; align-items: center; padding: 4px 6px; font-size: 11px;
  border-radius: 4px; cursor: pointer; transition: background 0.15s;
}
.ds-project:hover { background: var(--yp-surface-raised, #262333); }
.ds-project__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.ds-project--healthy .ds-project__dot { background: var(--el-color-success); }
.ds-project--warning .ds-project__dot { background: var(--el-color-warning); }
.ds-project--critical .ds-project__dot { background: var(--el-color-danger); }
.ds-project--unknown .ds-project__dot { background: var(--yp-text-secondary, #e9e5f5); }
.ds-project__name {
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--yp-text-primary, #f5f3ff);
}
.ds-project__count {
  font-size: 10px; font-variant-numeric: tabular-nums;
  color: var(--yp-text-secondary, #e9e5f5); white-space: nowrap;
}
.ds-more { font-size: 10px; color: var(--yp-text-secondary, #e9e5f5); padding: 4px 6px 0; }
.ds-footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--yp-border-subtle, rgba(196, 181, 253, 0.2)); text-align: center; }
</style>