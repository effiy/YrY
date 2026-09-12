<script setup lang="ts">
/**
 * RAG Decompose Tab — SubQuestionQueryEngine.
 *
 * Decomposes a complex question into sub-questions, retrieves sources for
 * each, and synthesizes a combined answer. Shows a flow diagram of the
 * pipeline, per-sub-Q answers with inline citations, and aggregated sources
 * deduplicated across all branches.
 */
import { ref, computed } from "vue";
import { Scissor, Search, FolderOpened, DataAnalysis, Collection, Document, ArrowRight, ArrowDown } from "@element-plus/icons-vue";
import { ragDecompose } from "@/api/modules/ragService";
import { useMarkdown } from "@/hooks/useMarkdown";
import RagSources from "@/components/RagSources/RagSources.vue";
import { injectCitations, makeCitationClickHandler } from "@/utils/citations";
import type { RagSource, RagSubQuestion } from "@/api/interface/rag";
import { scoreColor } from "./ragFormat";

const props = withDefaults(
  defineProps<{
    derivedScope?: string;
    hasScope?: boolean;
    scopeFiles?: string[];
    queryCategory?: string;
    queryTags?: string[];
  }>(),
  { derivedScope: "", hasScope: false, scopeFiles: () => [], queryCategory: "", queryTags: () => [] },
);

const emit = defineEmits<{
  (e: "open-file", path: string): void;
  (e: "switch-to-query", question: string): void;
}>();

const { render } = useMarkdown();

const dqText = ref("");
const dqTopK = ref(3);
const dqLoading = ref(false);
const dqError = ref("");
const dqResult = ref<{ original: string; synthesis: string; sub_questions: RagSubQuestion[] } | null>(null);
const dqExpanded = ref<Set<number>>(new Set());
const dqLatency = ref(0);

function toggleDqExpand(idx: number) {
  const next = new Set(dqExpanded.value);
  if (next.has(idx)) next.delete(idx); else next.add(idx);
  dqExpanded.value = next;
}

async function doDecompose() {
  const q = dqText.value.trim(); if (!q) return;
  dqLoading.value = true; dqError.value = ""; dqResult.value = null; dqExpanded.value = new Set();
  dqRagSourcesRefs.value = []; dqAggRagSourcesRef.value = null;
  const t0 = performance.now();
  try {
    const scope = props.derivedScope || undefined;
    const res = await ragDecompose({
      question: q, sub_q_top_k: dqTopK.value,
      ...(scope ? { scope } : {}),
      ...(props.queryCategory ? { category: props.queryCategory } : {}),
      ...(props.queryTags.length ? { tags: props.queryTags } : {}),
    });
    dqResult.value = { original: res.original, synthesis: res.synthesis, sub_questions: res.sub_questions ?? [] };
    if (res.error) dqError.value = res.error;
    dqLatency.value = Math.round(performance.now() - t0);
  } catch (e: unknown) { dqError.value = e instanceof Error ? e.message : "Decompose failed"; }
  finally { dqLoading.value = false; }
}

const dqRagSourcesRefs = ref<Array<InstanceType<typeof RagSources> | null>>([]);
const dqAggRagSourcesRef = ref<InstanceType<typeof RagSources> | null>(null);

/** Aggregated unique sources across all sub-questions, dedup by (file, text prefix). */
const dqAggregatedSources = computed(() => {
  if (!dqResult.value?.sub_questions?.length) return [];
  const seen = new Map<string, RagSource>();
  for (const sq of dqResult.value.sub_questions) {
    for (const s of sq.sources ?? []) {
      const key = `${s.file_path}::${(s.text || "").slice(0, 200)}`;
      if (!seen.has(key)) seen.set(key, s);
    }
  }
  return [...seen.values()].sort((a, b) => b.score - a.score);
});

/** Rendered HTML for a sub-Q's answer with [N] citation chips. */
function dqAnswerHtml(i: number): string {
  const sq = dqResult.value?.sub_questions[i];
  if (!sq) return "";
  return sq.sources.length ? injectCitations(render(sq.answer), sq.sources.length) : render(sq.answer);
}

/** Per-sub-Q score stats (top, mean, count). */
function dqSubQStats(i: number): { top: number; mean: number; n: number } | null {
  const sq = dqResult.value?.sub_questions[i];
  if (!sq || !sq.sources.length) return null;
  const scores = sq.sources.map(s => s.score);
  return { top: Math.max(...scores), mean: scores.reduce((a, b) => a + b, 0) / scores.length, n: scores.length };
}

const dqBestIdx = computed<number | null>(() => {
  const subs = dqResult.value?.sub_questions ?? [];
  if (subs.length < 2) return null;
  let bestI: number | null = null, bestTop = -1;
  for (let i = 0; i < subs.length; i++) {
    const st = dqSubQStats(i);
    if (st && st.top > bestTop) { bestTop = st.top; bestI = i; }
  }
  return bestI != null && bestTop >= 0 ? bestI : null;
});

const dqWorstIdx = computed<number | null>(() => {
  const subs = dqResult.value?.sub_questions ?? [];
  if (subs.length < 2) return null;
  let worstI: number | null = null, worstTop = 2;
  for (let i = 0; i < subs.length; i++) {
    const st = dqSubQStats(i);
    if (st && st.top < worstTop) { worstTop = st.top; worstI = i; }
  }
  return worstI != null && worstI !== dqBestIdx.value ? worstI : null;
});

const dqAggregate = computed(() => {
  const subs = dqResult.value?.sub_questions ?? [];
  if (!subs.length) return null;
  let totalSrc = 0, bestTop = 0, withSrc = 0, scoreSum = 0, scoreSeen = 0;
  for (let i = 0; i < subs.length; i++) {
    const st = dqSubQStats(i);
    if (st) { totalSrc += st.n; bestTop = Math.max(bestTop, st.top); scoreSum += st.top; scoreSeen += 1; withSrc++; }
  }
  const meanTop = scoreSeen ? Math.round((scoreSum / scoreSeen) * 100) : null;
  const meanSrc = withSrc ? Math.round((totalSrc / withSrc) * 10) / 10 : null;
  return { totalSrc, bestTop: Math.round(bestTop * 100), meanTop, meanSrc, withSrc, total: subs.length };
});

/** Expand + scroll to a sub-Q from the flow diagram. */
function jumpToSubQ(i: number) {
  dqExpanded.value = new Set(dqExpanded.value).add(i);
  setTimeout(() => {
    document.getElementById(`rc-dq-item-${i}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 50);
}

function expandAllDq() {
  const n = dqResult.value?.sub_questions?.length ?? 0;
  dqExpanded.value = new Set(Array.from({ length: n }, (_, i) => i));
}
function collapseAllDq() { dqExpanded.value = new Set(); }

const copiedDqIdx = ref<number | null>(null);
async function copyDqAnswer(i: number, text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedDqIdx.value = i;
    setTimeout(() => { if (copiedDqIdx.value === i) copiedDqIdx.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

const copiedSynth = ref(false);
async function copySynthesis(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedSynth.value = true;
    setTimeout(() => (copiedSynth.value = false), 1800);
  } catch { /* clipboard unavailable */ }
}

/** Drill a sub-Q into the Query tab. */
function runSubQAsQuery(i: number) {
  const sq = dqResult.value?.sub_questions?.[i];
  if (!sq?.sub_q) return;
  emit("switch-to-query", sq.sub_q);
}

/** Click delegation for citation chips in sub-Q answers. */
function onDqAnswerClick(i: number, e: MouseEvent): void {
  makeCitationClickHandler(() => dqRagSourcesRefs.value[i])(e);
}
</script>

<template>
  <div class="rc-body">
    <div class="rc-search">
      <el-input
        v-model="dqText" size="large" clearable type="textarea" :rows="2"
        :placeholder="hasScope ? `Decompose a question over ${scopeFiles.length} context file(s)…` : 'Add context files to enable decomposition'"
        :disabled="!hasScope"
        @keydown.ctrl.enter="doDecompose"
      />
      <div class="rc-search-opts">
        <label><span>Sub-Q top-K</span><el-input-number v-model="dqTopK" :min="1" :max="10" size="small" controls-position="right" style="width:84px" /></label>
        <el-button :icon="Scissor" :loading="dqLoading" type="primary" :disabled="!hasScope" @click="doDecompose">Decompose</el-button>
        <span v-if="hasScope" class="rc-scope-badge"><el-icon><FolderOpened /></el-icon><code>{{ derivedScope || 'all' }}</code></span>
      </div>
    </div>

    <div v-if="dqLoading" class="rc-loading">
      <div class="rc-loading-dots"><span /><span /><span /></div>
      <span>Decomposing question into sub-questions…</span>
    </div>

    <div v-else-if="dqError" class="rc-err">{{ dqError }}</div>

    <div v-else-if="dqResult" class="rc-dq">
      <div class="rc-results-hd">
        <span class="rc-results-stat">{{ dqResult.sub_questions.length }} sub-Q(s)</span>
        <span class="rc-results-stat">{{ dqLatency }}ms</span>
        <span v-if="dqAggregate" class="rc-results-stat">{{ dqAggregate.totalSrc }} src</span>
        <span v-if="dqAggregate && dqAggregate.meanSrc != null" class="rc-results-stat">μ {{ dqAggregate.meanSrc }} src/q</span>
        <span v-if="dqAggregate && dqAggregate.bestTop > 0" class="rc-results-stat" :style="{ color: scoreColor(dqAggregate.bestTop / 100) }">top {{ dqAggregate.bestTop }}%</span>
        <span v-if="dqAggregate && dqAggregate.meanTop != null" class="rc-results-stat" :style="{ color: scoreColor(dqAggregate.meanTop / 100) }">μ {{ dqAggregate.meanTop }}%</span>
        <span class="rc-dq-acts">
          <el-button size="small" text @click="expandAllDq()">Expand all</el-button>
          <el-button size="small" text @click="collapseAllDq()">Collapse all</el-button>
        </span>
      </div>

      <!-- Flow diagram -->
      <div class="rc-dq-flow">
        <div class="rc-dq-flow-node rc-dq-flow-node--root" :title="dqResult.original">
          <span class="rc-dq-flow-label">Question</span>
          <span class="rc-dq-flow-text">{{ dqResult.original }}</span>
        </div>
        <div class="rc-dq-flow-arrow">⤵</div>
        <div class="rc-dq-flow-branches">
          <button v-for="(sq, i) in dqResult.sub_questions" :key="i" class="rc-dq-flow-node rc-dq-flow-node--sub" :class="{ 'rc-dq-flow-node--open': dqExpanded.has(i) }" @click="jumpToSubQ(i)">
            <span class="rc-dq-flow-label">Q{{ i + 1 }}</span>
            <span class="rc-dq-flow-text">{{ sq.sub_q }}</span>
            <span v-if="dqSubQStats(i)" class="rc-dq-flow-stat" :style="{ color: scoreColor(dqSubQStats(i)!.top) }">top {{ (dqSubQStats(i)!.top * 100).toFixed(0) }}%</span>
          </button>
        </div>
        <div class="rc-dq-flow-arrow">⤴</div>
        <div v-if="dqResult.synthesis" class="rc-dq-flow-node rc-dq-flow-node--synth">
          <span class="rc-dq-flow-label">Synthesis</span>
          <span class="rc-dq-flow-text">combined answer</span>
        </div>
      </div>

      <div v-if="dqResult.synthesis" class="rc-dq-synth">
        <div class="rc-dq-synth-hd">
          <el-icon :size="13"><DataAnalysis /></el-icon><span>Synthesis</span>
          <el-tooltip :content="copiedSynth ? 'Copied!' : 'Copy synthesized answer'" placement="top">
            <el-button size="small" text :icon="Document" class="rc-dq-synth-copy" @click="copySynthesis(dqResult.synthesis)" />
          </el-tooltip>
        </div>
        <div class="rc-dq-synth-body" v-html="render(dqResult.synthesis)" />
      </div>

      <!-- Aggregated sources -->
      <div v-if="dqAggregatedSources.length" class="rc-dq-agg">
        <div class="rc-dq-agg-hd"><el-icon :size="13"><Collection /></el-icon><span>Aggregated sources</span><span class="rc-dq-agg-n">{{ dqAggregatedSources.length }} unique</span></div>
        <RagSources ref="dqAggRagSourcesRef" :sources="dqAggregatedSources" />
      </div>

      <div class="rc-dq-list">
        <div v-for="(sq, i) in dqResult.sub_questions" :id="`rc-dq-item-${i}`" :key="i" class="rc-dq-item" :class="{ 'rc-dq-item--open': dqExpanded.has(i) }">
          <div class="rc-dq-item-hd" @click="toggleDqExpand(i)">
            <span class="rc-dq-rank">Q{{ i + 1 }}</span>
            <span v-if="dqBestIdx === i" class="rc-dq-best">best</span>
            <span v-else-if="dqWorstIdx === i" class="rc-dq-worst">worst</span>
            <span class="rc-dq-q">{{ sq.sub_q }}</span>
            <span v-if="dqSubQStats(i)" class="rc-dq-score" :style="{ color: scoreColor(dqSubQStats(i)!.top) }">top {{ (dqSubQStats(i)!.top * 100).toFixed(0) }}%</span>
            <span class="rc-dq-meta">{{ sq.sources.length }} src</span>
            <el-tooltip content="Run this sub-question as a retrieval query" placement="top">
              <el-button size="small" :icon="Search" class="rc-dq-run" @click.stop="runSubQAsQuery(i)" />
            </el-tooltip>
            <el-tooltip :content="copiedDqIdx === i ? 'Copied!' : 'Copy sub-question answer'" placement="top">
              <el-button size="small" :icon="Document" class="rc-dq-run" :disabled="!sq.answer" @click.stop="copyDqAnswer(i, sq.answer)" />
            </el-tooltip>
            <el-icon class="rc-dq-chev"><ArrowRight v-if="!dqExpanded.has(i)" /><ArrowDown v-else /></el-icon>
          </div>
          <div v-if="dqExpanded.has(i)" class="rc-dq-item-body">
            <div v-if="sq.answer" class="rc-dq-answer" @click="onDqAnswerClick(i, $event)" v-html="dqAnswerHtml(i)" />
            <RagSources v-if="sq.sources.length" :ref="(el: any) => (dqRagSourcesRefs[i] = el)" :sources="sq.sources" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!hasScope" class="rc-empty">
      <el-icon :size="40"><Scissor /></el-icon>
      <span>Attach context files to decompose a question</span>
      <span class="rc-empty-hint">SubQuestionQueryEngine splits a complex question into sub-questions</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rc-body { min-height: 260px; }
.rc-err { padding: 10px 14px; margin-top: 8px; font-size: 13px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 8px; }
.rc-search { display: flex; flex-direction: column; gap: 8px; }
.rc-search-opts { display: flex; gap: 16px; align-items: center;
  label { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--el-text-color-secondary); }
}
.rc-scope-badge { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; color: var(--el-color-primary);
  code { font-size: 11px; padding: 1px 8px; background: var(--el-fill-color); border-radius: 3px; }
}
.rc-loading { display: flex; flex-direction: column; gap: 10px; align-items: center; padding: 48px 0; font-size: 13px; color: var(--el-text-color-placeholder); }
.rc-loading-dots { display: flex; gap: 6px;
  span { width: 8px; height: 8px; border-radius: 50%; background: var(--el-color-primary-light-5); animation: rc-bounce 1.2s ease-in-out infinite;
    &:nth-child(2) { animation-delay: .2s; }
    &:nth-child(3) { animation-delay: .4s; }
  }
}
@keyframes rc-bounce { 0%,80%,100% { transform: scale(.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }
.rc-results-hd { display: flex; gap: 12px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
.rc-results-stat { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); padding: 2px 10px; background: var(--el-fill-color-lighter); border-radius: 4px; }
.rc-dq-acts { margin-left: auto; display: flex; gap: 4px; }

// Flow diagram
.rc-dq-flow { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; margin-bottom: 14px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.rc-dq-flow-node { display: flex; flex-direction: column; gap: 2px; padding: 6px 10px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 6px; cursor: default; min-width: 0; }
.rc-dq-flow-node--sub { cursor: pointer; border-color: var(--el-border-color); transition: border-color .12s, background .12s;
  &:hover { background: var(--el-fill-color-light); }
  &.rc-dq-flow-node--open { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }
}
.rc-dq-flow-node--root { border-left: 3px solid var(--el-color-primary); }
.rc-dq-flow-node--synth { border-left: 3px solid var(--el-color-success); }
.rc-dq-flow-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: var(--el-text-color-placeholder); font-family: "SF Mono", Menlo, monospace; }
.rc-dq-flow-text { font-size: 12px; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; }
.rc-dq-flow-stat { font-size: 10px; font-family: "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums; font-weight: 600; }
.rc-dq-flow-arrow { text-align: center; font-size: 14px; color: var(--el-text-color-placeholder); line-height: 1; }
.rc-dq-flow-branches { display: flex; flex-direction: column; gap: 4px; }

// Synthesis
.rc-dq-synth { margin-bottom: 14px; padding: 12px 14px; background: var(--el-color-primary-light-9); border: 1px solid var(--el-color-primary-light-7); border-radius: 8px; }
.rc-dq-synth-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--el-color-primary); text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-synth-copy { margin-left: auto; color: var(--el-color-primary); }
.rc-dq-synth-body { font-size: 13px; line-height: 1.7; color: var(--el-text-color-primary);
  :deep(p) { margin: .3em 0; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; }
}

// Aggregated sources
.rc-dq-agg { margin-bottom: 14px; padding: 10px 14px 6px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.rc-dq-agg-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-agg-n { margin-left: auto; font-size: 10px; font-family: "SF Mono", Menlo, monospace; color: var(--el-color-primary); padding: 1px 6px; background: var(--el-color-primary-light-9); border-radius: 8px; }

// Sub-Q list
.rc-dq-list { display: flex; flex-direction: column; gap: 6px; }
.rc-dq-item { background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; overflow: hidden; transition: border-color .15s, background .15s; }
.rc-dq-item--open { border-color: var(--el-color-primary-light-5); background: var(--el-bg-color); }
.rc-dq-item-hd { display: flex; gap: 8px; align-items: center; padding: 9px 12px; cursor: pointer; user-select: none;
  &:hover { background: var(--el-fill-color-light); }
}
.rc-dq-rank { flex-shrink: 0; padding: 1px 8px; font-size: 11px; font-weight: 700; color: #fff; background: var(--el-color-primary); border-radius: 4px; font-family: "SF Mono",Menlo,monospace; }
.rc-dq-best { flex-shrink: 0; padding: 1px 8px; font-size: 10px; font-weight: 700; color: var(--el-color-success); background: var(--el-color-success-light-9); border: 1px solid var(--el-color-success-light-7); border-radius: 4px; text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-worst { flex-shrink: 0; padding: 1px 8px; font-size: 10px; font-weight: 700; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border: 1px solid var(--el-color-danger-light-7); border-radius: 4px; text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-q { flex: 1; min-width: 0; font-size: 13px; font-weight: 500; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-dq-run { flex-shrink: 0; }
.rc-dq-meta { flex-shrink: 0; font-size: 11px; color: var(--el-text-color-placeholder); font-family: "SF Mono",Menlo,monospace; }
.rc-dq-chev { color: var(--el-text-color-secondary); transition: transform .15s; }
.rc-dq-item-body { padding: 0 12px 12px 36px; }
.rc-dq-answer { font-size: 13px; line-height: 1.7; color: var(--el-text-color-primary); margin-bottom: 8px;
  :deep(p) { margin: .3em 0; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; }
}
.rc-dq-score { font-size: 10px; font-family: "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums; font-weight: 600; margin-left: auto; flex-shrink: 0; }
.rc-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 48px 0; color: var(--el-text-color-placeholder); font-size: 14px; }
.rc-empty-hint { font-size: 12px; color: var(--el-text-color-placeholder); }
</style>