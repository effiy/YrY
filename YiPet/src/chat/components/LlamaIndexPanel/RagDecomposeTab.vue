<script setup lang="ts">
import { ref, computed } from 'vue';
import { Scissor, Search, ArrowRight, ArrowDown, DataAnalysis, Collection, Document } from '@element-plus/icons-vue';
import { getRag } from '../../stores/services';
import { marked } from 'marked';
import type { RagSource, RagSubQuestion } from '@/api/types';

const props = withDefaults(
  defineProps<{ scopeFiles?: string[]; derivedScope?: string }>(),
  { scopeFiles: () => [], derivedScope: '' }
);
const emit = defineEmits<{ (e: 'open-file', path: string): void; (e: 'switch-to-query', question: string): void }>();

const text = ref('');
const loading = ref(false);
const error = ref('');
const result = ref<{ original: string; synthesis: string; sub_questions: RagSubQuestion[] } | null>(null);
const expanded = ref<Set<number>>(new Set());
const latency = ref(0);

function toggle(idx: number) {
  const next = new Set(expanded.value);
  next.has(idx) ? next.delete(idx) : next.add(idx);
  expanded.value = next;
}

async function run() {
  const q = text.value.trim();
  if (!q) return;
  loading.value = true;
  error.value = '';
  result.value = null;
  expanded.value = new Set();
  const t0 = performance.now();
  try {
    const rag = getRag();
    const res = await rag.decompose({ question: q, scope: props.derivedScope || undefined });
    if (res.ok && res.data) {
      result.value = {
        original: res.data.original,
        synthesis: res.data.synthesis,
        sub_questions: res.data.sub_questions ?? [],
      };
      if (res.data.error) error.value = res.data.error;
    } else {
      error.value = res.error || 'Decompose failed';
    }
    latency.value = Math.round(performance.now() - t0);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

const aggSources = computed(() => {
  if (!result.value?.sub_questions?.length) return [];
  const seen = new Map<string, RagSource>();
  for (const sq of result.value.sub_questions) {
    for (const s of sq.sources ?? []) {
      const key = `${s.path}::${(s.snippet || '').slice(0, 200)}`;
      if (!seen.has(key)) seen.set(key, s);
    }
  }
  return [...seen.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
});

function subStats(i: number) {
  const sq = result.value?.sub_questions[i];
  if (!sq?.sources?.length) return null;
  const scores = sq.sources.map(s => s.score ?? 0);
  return { top: Math.max(...scores), mean: scores.reduce((a, b) => a + b, 0) / scores.length, n: scores.length };
}

function scorePct(s: number) { return (s * 100).toFixed(0) + '%'; }

function renderMd(text: string) { return marked(text) as string; }
</script>

<template>
  <div class="rc-body">
    <div class="rc-search">
      <el-input
        v-model="text" type="textarea" :rows="2" size="large" clearable
        :placeholder="scopeFiles.length ? `Decompose a question over ${scopeFiles.length} file(s)...` : 'Attach context files to enable decomposition'"
        :disabled="!scopeFiles.length" @keydown.ctrl.enter="run"
      />
      <div class="rc-search-opts">
        <el-button :icon="Scissor" :loading="loading" type="primary" :disabled="!scopeFiles.length" @click="run">
          Decompose
        </el-button>
        <code v-if="derivedScope" class="rc-scope-badge">{{ derivedScope }}</code>
      </div>
    </div>

    <div v-if="loading" class="rc-loading">Decomposing question into sub-questions...</div>

    <div v-else-if="error" class="rc-error">{{ error }}</div>

    <div v-else-if="result" class="rc-dq">
      <div class="rc-results-hd">
        <span class="rc-results-stat">{{ result.sub_questions.length }} sub-Q(s)</span>
        <span class="rc-results-stat">{{ latency }}ms</span>
        <span class="rc-results-stat">{{ aggSources.length }} unique src</span>
        <span class="rc-dq-acts">
          <el-button size="small" text @click="expanded = new Set(result.sub_questions.map((_, i) => i))">Expand all</el-button>
          <el-button size="small" text @click="expanded = new Set()">Collapse all</el-button>
        </span>
      </div>

      <!-- Synthesis -->
      <div v-if="result.synthesis" class="rc-dq-synth">
        <div class="rc-dq-synth-hd">
          <el-icon :size="13"><DataAnalysis /></el-icon><span>Synthesis</span>
        </div>
        <div class="rc-dq-synth-body" v-html="renderMd(result.synthesis)" />
      </div>

      <!-- Aggregated sources -->
      <div v-if="aggSources.length" class="rc-dq-agg">
        <div class="rc-dq-agg-hd">
          <el-icon :size="13"><Collection /></el-icon>
          <span>Aggregated sources</span>
          <span class="rc-dq-agg-n">{{ aggSources.length }} unique</span>
        </div>
        <div v-for="(s, i) in aggSources" :key="i" class="rc-result-item">
          <div class="rc-result-path" @click="emit('open-file', s.path)">{{ s.path }}
            <span v-if="s.score != null" class="rc-result-score">{{ scorePct(s.score) }}</span>
          </div>
          <div v-if="s.snippet" class="rc-result-snippet">{{ s.snippet }}</div>
        </div>
      </div>

      <!-- Sub-questions -->
      <div class="rc-dq-list">
        <div
          v-for="(sq, i) in result.sub_questions" :key="i"
          class="rc-dq-item" :class="{ 'rc-dq-item--open': expanded.has(i) }"
        >
          <div class="rc-dq-item-hd" @click="toggle(i)">
            <span class="rc-dq-rank">Q{{ i + 1 }}</span>
            <span class="rc-dq-q">{{ sq.sub_q }}</span>
            <span v-if="subStats(i)" class="rc-dq-score" :style="{ color: subStats(i)!.top >= 0.85 ? 'var(--el-color-success)' : subStats(i)!.top >= 0.7 ? 'var(--el-color-primary)' : 'var(--el-color-warning)' }">
              top {{ scorePct(subStats(i)!.top) }}
            </span>
            <span class="rc-dq-meta">{{ sq.sources.length }} src</span>
            <el-tooltip content="Run as query" placement="top">
              <el-button size="small" :icon="Search" @click.stop="emit('switch-to-query', sq.sub_q)" />
            </el-tooltip>
            <el-icon class="rc-dq-chev"><ArrowRight v-if="!expanded.has(i)" /><ArrowDown v-else /></el-icon>
          </div>
          <div v-if="expanded.has(i)" class="rc-dq-item-body">
            <div v-if="sq.answer" class="rc-dq-answer" v-html="renderMd(sq.answer)" />
            <div v-if="sq.sources.length" class="rc-dq-src-list">
              <div v-for="(s, j) in sq.sources" :key="j" class="rc-result-item">
                <div class="rc-result-path" @click="emit('open-file', s.path)">{{ s.path }}
                  <span v-if="s.score != null" class="rc-result-score">{{ scorePct(s.score) }}</span>
                </div>
                <div v-if="s.snippet" class="rc-result-snippet">{{ s.snippet }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!scopeFiles.length" class="rc-empty">
      <el-icon :size="40"><Scissor /></el-icon>
      <span>Attach context files to decompose a question</span>
      <span class="rc-empty-hint">SubQuestionQueryEngine splits complex questions into sub-questions</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rc-body { min-height: 200px; }
.rc-error { padding: 10px 14px; margin-top: 8px; font-size: 13px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 8px; }
.rc-loading { padding: 32px 0; font-size: 13px; color: var(--el-text-color-placeholder); text-align: center; }
.rc-search { display: flex; flex-direction: column; gap: 8px; }
.rc-search-opts { display: flex; gap: 12px; align-items: center; }
.rc-scope-badge { padding: 1px 8px; font-size: 11px; color: var(--el-color-primary); background: var(--el-fill-color); border-radius: 3px; }
.rc-results-hd { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 12px; }
.rc-results-stat { padding: 2px 10px; font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); background: var(--el-fill-color-lighter); border-radius: 4px; }
.rc-dq-acts { display: flex; gap: 4px; margin-left: auto; }
.rc-dq-synth { padding: 12px 14px; margin-bottom: 14px; background: var(--el-color-primary-light-9); border: 1px solid var(--el-color-primary-light-7); border-radius: 8px; }
.rc-dq-synth-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--el-color-primary); text-transform: uppercase; }
.rc-dq-synth-body { font-size: 13px; line-height: 1.7; color: var(--el-text-color-primary); }
.rc-dq-agg { padding: 10px 14px; margin-bottom: 14px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.rc-dq-agg-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; }
.rc-dq-agg-n { padding: 1px 6px; margin-left: auto; font-size: 10px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-radius: 8px; }
.rc-dq-list { display: flex; flex-direction: column; gap: 6px; }
.rc-dq-item { overflow: hidden; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; transition: border-color .15s; }
.rc-dq-item--open { background: var(--el-bg-color); border-color: var(--el-color-primary-light-5); }
.rc-dq-item-hd { display: flex; gap: 8px; align-items: center; padding: 9px 12px; cursor: pointer; user-select: none; &:hover { background: var(--el-fill-color-light); } }
.rc-dq-rank { flex-shrink: 0; padding: 1px 8px; font-family: 'SF Mono', monospace; font-size: 11px; font-weight: 700; color: #fff; background: var(--el-color-primary); border-radius: 4px; }
.rc-dq-q { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 13px; font-weight: 500; color: var(--el-text-color-primary); white-space: nowrap; }
.rc-dq-score { flex-shrink: 0; margin-left: auto; font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 600; }
.rc-dq-meta { flex-shrink: 0; font-family: 'SF Mono', monospace; font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-dq-chev { color: var(--el-text-color-secondary); transition: transform .15s; }
.rc-dq-item-body { padding: 0 12px 12px 36px; }
.rc-dq-answer { margin-bottom: 8px; font-size: 13px; line-height: 1.7; color: var(--el-text-color-primary); }
.rc-dq-src-list { display: flex; flex-direction: column; gap: 6px; }
.rc-result-item { padding: 8px 12px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 6px; margin-bottom: 6px; }
.rc-result-path { font-family: 'SF Mono', monospace; font-size: 12px; font-weight: 500; color: var(--el-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }
.rc-result-score { margin-left: 8px; padding: 1px 6px; font-size: 10px; font-weight: 600; color: var(--el-color-success); background: var(--el-color-success-light-9); border-radius: 4px; }
.rc-result-snippet { margin-top: 4px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-regular); }
.rc-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-placeholder); }
.rc-empty-hint { font-size: 12px; color: var(--el-text-color-placeholder); }
</style>