<script setup lang="ts">
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { getRag } from '../../stores/services';
import type { RagSource, RagQueryResponse } from '@/api/types';

const props = withDefaults(
  defineProps<{ scopeFiles?: string[]; derivedScope?: string }>(),
  { scopeFiles: () => [], derivedScope: '' }
);
const emit = defineEmits<{ (e: 'open-file', path: string): void }>();

const question = ref('');
const loading = ref(false);
const sources = ref<RagSource[]>([]);
const error = ref('');

async function runQuery() {
  const q = question.value.trim();
  if (!q) return;
  loading.value = true;
  error.value = '';
  sources.value = [];
  try {
    const rag = getRag();
    const res = await rag.query({ question: q, scope: props.derivedScope || undefined });
    if (res.ok && res.data) {
      sources.value = (res.data as RagQueryResponse).sources || [];
    } else {
      error.value = res.error || 'Query failed';
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

function setQuestion(q: string) {
  question.value = q;
  runQuery();
}

defineExpose({ setQuestion });
</script>

<template>
  <div class="rc-panel">
    <div class="rc-query-input">
      <el-input
        v-model="question"
        placeholder="Search knowledge base..."
        :disabled="loading"
        @keydown.enter="runQuery"
      >
        <template #append>
          <el-button :loading="loading" :icon="Search" @click="runQuery">Search</el-button>
        </template>
      </el-input>
    </div>

    <div v-if="error" class="rc-error">{{ error }}</div>

    <div v-if="sources.length" class="rc-results">
      <div class="rc-results-head">{{ sources.length }} source(s) for "{{ question }}"</div>
      <div v-for="(src, i) in sources" :key="i" class="rc-result-item">
        <div class="rc-result-path" @click="emit('open-file', src.path)" :title="src.path">
          {{ src.path }}
          <span v-if="src.score != null" class="rc-result-score">{{ (src.score * 100).toFixed(0) }}%</span>
        </div>
        <div v-if="src.snippet" class="rc-result-snippet">{{ src.snippet }}</div>
      </div>
    </div>

    <div v-else-if="!loading && question && !error" class="rc-empty-state">No results found.</div>
  </div>
</template>

<style scoped lang="scss">
.rc-panel { min-height: 200px; max-height: 50vh; overflow-y: auto; }
.rc-query-input { margin-bottom: 16px; }
.rc-error { padding: 10px 14px; margin-bottom: 12px; font-size: 12px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 8px; }
.rc-results-head { margin-bottom: 12px; font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); }
.rc-result-item { padding: 10px 12px; margin-bottom: 8px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.rc-result-path { font-family: 'SF Mono', monospace; font-size: 12px; font-weight: 500; color: var(--el-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }
.rc-result-score { margin-left: 8px; padding: 1px 6px; font-size: 10px; font-weight: 600; color: var(--el-color-success); background: var(--el-color-success-light-9); border-radius: 4px; }
.rc-result-snippet { margin-top: 6px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-regular); }
.rc-empty-state { padding: 32px 0; font-size: 13px; color: var(--el-text-color-placeholder); text-align: center; }
</style>