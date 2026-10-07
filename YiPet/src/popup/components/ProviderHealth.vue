<script setup lang="ts">
/**
 * YiPet Popup — Translation Provider Health Widget
 * Shows real-time translation engine health from YiAi via the four-layer API client.
 * Cross-project data consistency with YiVad TranslationAnalytics.
 */
import { ref, onMounted, onUnmounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { getApiServices } from '../services/api';

interface ProviderInfo {
  total: number; success: number; failed: number;
  success_rate: number; status: 'healthy' | 'degraded' | 'down';
  total_chars: number;
}
interface ProviderHealthData {
  period_hours: number;
  providers: Record<string, ProviderInfo>;
  memory_entries: number;
  feedback: { good: number; bad: number };
}

const POLL_INTERVAL_MS = 60_000;
const health = ref<ProviderHealthData | null>(null);
const loading = ref(false);
const error = ref('');
const dataAge = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let ageTimer: ReturnType<typeof setInterval> | null = null;

async function fetchHealth() {
  loading.value = true; error.value = '';
  try {
    const svc = getApiServices();
    if (!svc) throw new Error('API not initialized');
    health.value = await svc.translation.getProviderHealth(24) as ProviderHealthData;
    dataAge.value = 0;
  } catch (e: any) {
    error.value = e?.message || 'YiAi unavailable';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchHealth();
  pollTimer = setInterval(fetchHealth, POLL_INTERVAL_MS);
  ageTimer = setInterval(() => { dataAge.value++; }, 1000);
});
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (ageTimer) clearInterval(ageTimer);
});

const providers = () => {
  if (!health.value?.providers) return [];
  return Object.entries(health.value.providers)
    .map(([name, info]) => ({ name, ...info }))
    .sort((a, b) => b.success_rate - a.success_rate);
};

function statusColor(s: string): string {
  return s === 'healthy' ? '#67c23a' : s === 'degraded' ? '#e6a23c' : '#f56c6c';
}

const ageLabel = () => dataAge.value < 60 ? `${dataAge.value}s` : `${Math.floor(dataAge.value / 60)}m`;
</script>

<template>
  <el-card v-if="health || loading" class="popup-card ph-card" shadow="never">
    <template #header>
      <div class="popup-card-header">
        <span>Translation Providers</span>
        <span
          v-if="!loading && !error"
          class="ph-age"
          :class="{ 'ph-age--stale': dataAge > 60 }"
        >{{ ageLabel() }}</span>
        <el-button :icon="Refresh" size="small" text :loading="loading" @click="fetchHealth" />
      </div>
    </template>

    <div v-if="error" class="ph-error">{{ error }}</div>

    <template v-else-if="health">
      <div class="ph-summary">
        <span class="ph-summary__item">
          {{ Object.values(health.providers).filter((p: ProviderInfo) => p.status === 'healthy').length }} healthy
        </span>
        <span class="ph-summary__item ph-summary__item--mem">
          {{ health.memory_entries }} cached
        </span>
        <span v-if="health.feedback" class="ph-summary__item ph-summary__item--fb">
          {{ health.feedback.good }}/{{ health.feedback.good + health.feedback.bad }} 👍
        </span>
      </div>

      <div class="ph-list">
        <div
          v-for="p in providers().slice(0, 5)"
          :key="p.name"
          class="ph-provider"
        >
          <span class="ph-provider__dot" :style="{ background: statusColor(p.status) }" />
          <span class="ph-provider__name">{{ p.name }}</span>
          <span class="ph-provider__rate">{{ (p.success_rate * 100).toFixed(0) }}%</span>
          <span class="ph-provider__calls">{{ p.total }}</span>
        </div>
      </div>
      <div v-if="providers().length > 5" class="ph-more">
        +{{ providers().length - 5 }} more
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.ph-card { margin-top: 12px; }
.ph-age {
  font-size: 10px; font-weight: 600; font-variant-numeric: tabular-nums;
  color: var(--el-color-success); margin-left: auto; margin-right: 4px;
}
.ph-age--stale { color: var(--yp-text-secondary, #e9e5f5); }
.ph-error { font-size: 12px; color: var(--el-color-danger); padding: 8px 0; }
.ph-summary { display: flex; gap: 10px; margin-bottom: 10px; font-size: 10px; font-weight: 600; }
.ph-summary__item { color: var(--el-color-success); }
.ph-summary__item--mem { color: var(--el-color-primary); }
.ph-summary__item--fb { color: var(--yp-text-secondary, #e9e5f5); }
.ph-list { display: flex; flex-direction: column; gap: 2px; }
.ph-provider {
  display: flex; gap: 6px; align-items: center; padding: 3px 6px;
  font-size: 11px; border-radius: 4px;
  background: var(--yp-surface-base, #13111a);
}
.ph-provider__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.ph-provider__name {
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--yp-text-primary, #f5f3ff);
}
.ph-provider__rate {
  font-weight: 700; font-variant-numeric: tabular-nums;
  color: var(--yp-text-primary, #f5f3ff); min-width: 32px; text-align: right;
}
.ph-provider__calls {
  font-size: 10px; font-variant-numeric: tabular-nums;
  color: var(--yp-text-secondary, #e9e5f5); min-width: 28px; text-align: right;
}
.ph-more { font-size: 10px; color: var(--yp-text-secondary, #e9e5f5); padding: 4px 6px 0; }
</style>