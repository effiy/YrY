<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRag } from '../../stores/services';
import type { RagHistoryRecord } from '@/api/types';

const emit = defineEmits<{ (e: 'open-file', path: string): void }>();

const loading = ref(false);
const records = ref<RagHistoryRecord[]>([]);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const rag = getRag();
    const res = await rag.history({ limit: 50 });
    if (res.ok && res.data) {
      records.value = (res.data as { records: RagHistoryRecord[] }).records || [];
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
defineExpose({ load });
</script>

<template>
  <div class="rc-panel">
    <div v-if="loading" class="rc-loading">Loading history...</div>
    <div v-else-if="error" class="rc-error">{{ error }}</div>
    <div v-else-if="!records.length" class="rc-empty-state">No query history yet.</div>
    <div v-else class="rc-history-list">
      <div v-for="(rec, i) in records" :key="i" class="rc-history-item">
        <div class="rc-history-q">{{ rec.question }}</div>
        <div class="rc-history-meta">
          <span>{{ rec.sources?.length ?? 0 }} sources</span>
          <span v-if="rec.grade" class="rc-history-grade">· {{ rec.grade }}</span>
          <span v-if="rec.timestamp">· {{ new Date(rec.timestamp).toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rc-panel { min-height: 200px; max-height: 50vh; overflow-y: auto; }
.rc-error { padding: 10px 14px; margin-bottom: 12px; font-size: 12px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 8px; }
.rc-loading { padding: 32px 0; font-size: 13px; color: var(--el-text-color-placeholder); text-align: center; }
.rc-empty-state { padding: 32px 0; font-size: 13px; color: var(--el-text-color-placeholder); text-align: center; }
.rc-history-item { padding: 10px 12px; margin-bottom: 6px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.rc-history-q { font-size: 13px; font-weight: 500; color: var(--el-text-color-primary); }
.rc-history-meta { margin-top: 4px; font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-history-grade { font-weight: 600; color: var(--el-color-warning); }
</style>