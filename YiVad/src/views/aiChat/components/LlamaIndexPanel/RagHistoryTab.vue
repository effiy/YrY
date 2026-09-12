<script setup lang="ts">
/**
 * RAG History Tab — retrieval + chat ring-buffer with analytics.
 *
 * Two sub-tabs: "retrieval" (one-shot rag_query records) and "chat"
 * (streamed rag_chat turns). Analytics computed via useRagAnalytics.
 */
import { ref, computed } from "vue";
import { Search, Clock, Delete, Download, Document, DocumentCopy, ArrowRight, ArrowDown, Close, Refresh } from "@element-plus/icons-vue";
import { ragHistory, ragHistoryClear, ragChatHistory, ragChatHistoryClear } from "@/api/modules/ragService";
import RagSources from "@/components/RagSources/RagSources.vue";
import type { RagQueryRecord, RagChatTurnRecord } from "@/api/interface/rag";
import { scoreColor, latencyBucket, csvField, tokenBudget } from "./ragFormat";
import { useRagAnalytics, defaultFilter } from "./useRagAnalytics";

const props = withDefaults(
  defineProps<{ scopeFiles?: string[]; derivedScope?: string; hasScope?: boolean }>(),
  { scopeFiles: () => [], derivedScope: "", hasScope: false },
);
const emit = defineEmits<{
  (e: "switch-to-query", question: string): void;
  (e: "open-file", path: string): void;
}>();

// ── Data ──
const historyView = ref<"retrieval" | "chat">("retrieval");
const historyRecords = ref<RagQueryRecord[]>([]);
const historyLoading = ref(false);
const historyMax = ref(20);
const chatTurns = ref<RagChatTurnRecord[]>([]);
const chatTurnsLoading = ref(false);
const chatTurnsMax = ref(20);

// ── Filters ──
const historyFilterText = ref("");
const historyDateRange = ref<"24h" | "7d" | "30d" | "all">("all");
const historyScopeFilter = ref("");
const retrievalConfigFilter = ref<"" | "hybrid" | "rerank" | "citations" | "plain">("");
const chatModeFilter = ref<"" | "condense_plus_context" | "condense_question" | "context" | "simple">("");

// ── Analytics (composable) ──
const analytics = useRagAnalytics(historyRecords, chatTurns, {
  dateRange: historyDateRange,
  textFilter: historyFilterText,
  scopeFilter: historyScopeFilter,
  retrievalConfigFilter,
  chatModeFilter,
});

// ── UI state ──
const selectedHistoryId = ref<string | null>(null);
const expandedSourcesRId = ref<string | null>(null);
const copiedRecSrcId = ref<string | null>(null);
const copiedQId = ref<string | null>(null);
const retrievalCompactMode = ref(false);
const chatCompactMode = ref(false);
const expandedChatId = ref<string | null>(null);
const copiedChatSrcId = ref<string | null>(null);
const chatAnswerCopiedId = ref<string | null>(null);

// ── Comparison state ──
const compareIds = ref<string[]>([]);
function toggleCompare(id: string) {
  const i = compareIds.value.indexOf(id);
  if (i >= 0) { compareIds.value.splice(i, 1); return; }
  if (compareIds.value.length >= 2) compareIds.value.shift();
  compareIds.value.push(id);
}
function clearCompare() { compareIds.value = []; }
const compareRecords = computed(() =>
  compareIds.value.map(id => historyRecords.value.find(r => r.id === id)).filter((r): r is RagQueryRecord => !!r),
);
const compareWinnerSide = computed<"left" | "right" | null>(() => {
  const [a, b] = compareRecords.value;
  if (!a || !b) return null;
  const sa = a.top_score * 0.7 + a.avg_score * 0.3 - (a.latency_ms / 10000);
  const sb = b.top_score * 0.7 + b.avg_score * 0.3 - (b.latency_ms / 10000);
  return Math.abs(sa - sb) < 0.001 ? null : sa > sb ? "left" : "right";
});
const compareDelta = computed(() => {
  const [a, b] = compareRecords.value;
  if (!a || !b) return null;
  const ta = tokenBudget(a.sources), tb = tokenBudget(b.sources);
  return {
    latency_ms: b.latency_ms - a.latency_ms, top_score_pct: (b.top_score - a.top_score) * 100,
    avg_score_pct: (b.avg_score - a.avg_score) * 100, sources: b.result_count - a.result_count,
    top_k: b.top_k - a.top_k, tokens: (ta != null && tb != null) ? tb - ta : null,
  };
});

// Chat comparison
const chatCompareIds = ref<string[]>([]);
function toggleChatCompare(id: string) {
  const i = chatCompareIds.value.indexOf(id);
  if (i >= 0) { chatCompareIds.value.splice(i, 1); return; }
  if (chatCompareIds.value.length >= 2) chatCompareIds.value.shift();
  chatCompareIds.value.push(id);
}
function clearChatCompare() { chatCompareIds.value = []; }
const chatCompareRecords = computed(() =>
  chatCompareIds.value.map(id => chatTurns.value.find(t => t.id === id)).filter((t): t is RagChatTurnRecord => !!t),
);
const chatCompareWinnerSide = computed<"left" | "right" | null>(() => {
  const [a, b] = chatCompareRecords.value;
  if (!a || !b) return null;
  const sa = a.top_score * 0.7 + a.avg_score * 0.3 - (a.latency_ms / 10000);
  const sb = b.top_score * 0.7 + b.avg_score * 0.3 - (b.latency_ms / 10000);
  return Math.abs(sa - sb) < 0.001 ? null : sa > sb ? "left" : "right";
});
const chatCompareDelta = computed(() => {
  const [a, b] = chatCompareRecords.value;
  if (!a || !b) return null;
  const ta = tokenBudget(a.sources), tb = tokenBudget(b.sources);
  return {
    latency_ms: b.latency_ms - a.latency_ms, top_score_pct: (b.top_score - a.top_score) * 100,
    avg_score_pct: (b.avg_score - a.avg_score) * 100, sources: b.source_count - a.source_count,
    tokens: (ta != null && tb != null) ? tb - ta : null,
  };
});

// ── Data loading ──
async function loadHistory() {
  historyLoading.value = true;
  try { const res = await ragHistory(); historyRecords.value = res.records ?? []; historyMax.value = res.max ?? 20; } catch { /* */ }
  finally { historyLoading.value = false; }
}
async function clearHistory() { try { await ragHistoryClear(); historyRecords.value = []; } catch { /* */ } }
async function loadChatTurns() {
  chatTurnsLoading.value = true;
  try { const res = await ragChatHistory(); chatTurns.value = res.records ?? []; chatTurnsMax.value = res.max ?? 20; } catch { /* */ }
  finally { chatTurnsLoading.value = false; }
}
async function clearChatTurns() { try { await ragChatHistoryClear(); chatTurns.value = []; } catch { /* */ } }
function switchHistoryView(v: "retrieval" | "chat") {
  historyView.value = v;
  if (v === "chat" && !chatTurns.value.length && !chatTurnsLoading.value) void loadChatTurns();
}
function reuseHistoryQuestion(q: string) { emit("switch-to-query", q); }

// ── Quick actions ──
function toggleRecordSources(id: string) { expandedSourcesRId.value = expandedSourcesRId.value === id ? null : id; }
function selectHistoryRecord(id: string) {
  if (selectedHistoryId.value === id) { selectedHistoryId.value = null; return; }
  selectedHistoryId.value = id;
  setTimeout(() => { document.getElementById(`rc-hist-rec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 30);
}
function selectChatTurn(id: string) {
  const willExpand = expandedChatId.value !== id;
  expandedChatId.value = willExpand ? id : null;
  if (willExpand) setTimeout(() => { document.getElementById(`rc-hist-turn-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 30);
}
async function copyRecordSources(r: RagQueryRecord) {
  try { await navigator.clipboard.writeText(JSON.stringify(r.sources, null, 2)); copiedRecSrcId.value = r.id; setTimeout(() => { if (copiedRecSrcId.value === r.id) copiedRecSrcId.value = null; }, 1800); } catch { /* */ }
}
async function copyQuestion(id: string, text: string) {
  if (!text) return;
  try { await navigator.clipboard.writeText(text); copiedQId.value = id; setTimeout(() => { if (copiedQId.value === id) copiedQId.value = null; }, 1800); } catch { /* */ }
}
async function copyChatAnswer(t: RagChatTurnRecord) {
  if (!t.answer) return;
  try { await navigator.clipboard.writeText(t.answer); chatAnswerCopiedId.value = t.id; setTimeout(() => { if (chatAnswerCopiedId.value === t.id) chatAnswerCopiedId.value = null; }, 1800); } catch { /* */ }
}
async function copyChatTurnSources(t: RagChatTurnRecord) {
  try { await navigator.clipboard.writeText(JSON.stringify(t.sources, null, 2)); copiedChatSrcId.value = t.id; setTimeout(() => { if (copiedChatSrcId.value === t.id) copiedChatSrcId.value = null; }, 1800); } catch { /* */ }
}

// ── Export ──
function exportHistoryJSON() {
  const records = historyView.value === "retrieval" ? analytics.filteredHistoryRecords.value : analytics.filteredChatTurns.value;
  if (!records.length) return;
  const blob = new Blob([JSON.stringify({ view: historyView.value, exported_at: new Date().toISOString(), count: records.length, filter: historyFilterText.value || null, records }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `rag-${historyView.value}-history-${Date.now()}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function exportHistoryCSV() {
  const isRetrieval = historyView.value === "retrieval";
  const records = isRetrieval ? analytics.filteredHistoryRecords.value : analytics.filteredChatTurns.value;
  if (!records.length) return;
  const header = isRetrieval
    ? ["timestamp", "question", "scope", "top_k", "result_count", "top_score", "avg_score", "latency_ms", "hybrid", "rerank", "citations", "num_queries", "category", "tags"]
    : ["timestamp", "question", "answer", "scope", "chat_mode", "source_count", "top_score", "avg_score", "latency_ms"];
  const rows = records.map(r => {
    if (isRetrieval) {
      const rr = r as RagQueryRecord;
      return [rr.timestamp, rr.question, rr.scope ?? "", rr.top_k, rr.result_count, (rr.top_score * 100).toFixed(1) + "%", (rr.avg_score * 100).toFixed(1) + "%", rr.latency_ms, rr.config?.hybrid ? "yes" : "no", rr.config?.rerank ? "yes" : "no", rr.config?.citations ? "yes" : "no", rr.config?.num_queries ?? 1, rr.config?.category ?? "", (rr.config?.tags ?? []).join("|")].map(csvField).join(",");
    }
    const tt = r as RagChatTurnRecord;
    return [tt.timestamp, tt.question, tt.answer, tt.scope ?? "", tt.chat_mode, tt.source_count, (tt.top_score * 100).toFixed(1) + "%", (tt.avg_score * 100).toFixed(1) + "%", tt.latency_ms].map(csvField).join(",");
  });
  const csv = [header.map(csvField).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `rag-${historyView.value}-history-${Date.now()}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// Expose data for the Index tab's analytics cards.
defineExpose({ historyRecords, chatTurns });

void loadHistory();
</script>

<template>
  <div class="rc-body">
    <!-- Sub-tab toggle -->
    <div class="rc-hd-row">
      <div class="rc-hist-subtabs">
        <button class="rc-hist-subtab" :class="{ active: historyView === 'retrieval' }" @click="switchHistoryView('retrieval')">Retrieval <span v-if="historyRecords.length" class="rc-tab-count">{{ historyRecords.length }}</span></button>
        <button class="rc-hist-subtab" :class="{ active: historyView === 'chat' }" @click="switchHistoryView('chat')">Chat <span v-if="chatTurns.length" class="rc-tab-count">{{ chatTurns.length }}</span></button>
      </div>
      <div class="rc-hd-actions">
        <template v-if="historyView === 'retrieval'">
          <el-button size="small" :icon="Download" :disabled="!analytics.filteredHistoryRecords.value.length" @click="exportHistoryJSON">JSON</el-button>
          <el-button size="small" :icon="Download" :disabled="!analytics.filteredHistoryRecords.value.length" @click="exportHistoryCSV">CSV</el-button>
          <el-button size="small" :icon="Refresh" :loading="historyLoading" @click="loadHistory">Refresh</el-button>
          <el-button size="small" :icon="Delete" :disabled="!historyRecords.length" @click="clearHistory">Clear</el-button>
        </template>
        <template v-else>
          <el-button size="small" :icon="Download" :disabled="!analytics.filteredChatTurns.value.length" @click="exportHistoryJSON">JSON</el-button>
          <el-button size="small" :icon="Download" :disabled="!analytics.filteredChatTurns.value.length" @click="exportHistoryCSV">CSV</el-button>
          <el-button size="small" :icon="Refresh" :loading="chatTurnsLoading" @click="loadChatTurns">Refresh</el-button>
          <el-button size="small" :icon="Delete" :disabled="!chatTurns.length" @click="clearChatTurns">Clear</el-button>
        </template>
      </div>
    </div>

    <!-- ═══ Retrieval sub-tab ═══ -->
    <template v-if="historyView === 'retrieval'">
      <!-- Comparison panel -->
      <div v-if="compareRecords.length" class="rc-cmp">
        <div class="rc-cmp-hd"><span class="rc-hist-spark-label">side-by-side ({{ compareRecords.length }}/2)</span><el-button size="small" text :icon="Delete" @click="clearCompare">Clear</el-button></div>
        <div class="rc-cmp-grid" :class="{ 'is-pair': compareRecords.length === 2 }">
          <div v-for="(r, idx) in compareRecords" :key="r.id" class="rc-cmp-cell" :class="{ 'is-winner': compareWinnerSide === (idx === 0 ? 'left' : 'right') }">
            <div class="rc-cmp-cell-hd">
              <span v-if="compareWinnerSide === (idx === 0 ? 'left' : 'right')" class="rc-cmp-winner">✓ winner</span>
              <span class="rc-hist-time">{{ r.timestamp.replace('T', ' ') }}</span>
              <span class="rc-cmp-cell-q" :title="r.question">{{ r.question }}</span>
            </div>
            <div class="rc-cmp-cell-stats">
              <div class="rc-cmp-stat"><span class="rc-cmp-k">latency</span><span class="rc-cmp-v">{{ r.latency_ms }}ms</span></div>
              <div class="rc-cmp-stat"><span class="rc-cmp-k">top</span><span class="rc-cmp-v" :style="{ color: scoreColor(r.top_score) }">{{ (r.top_score * 100).toFixed(0) }}%</span></div>
              <div class="rc-cmp-stat"><span class="rc-cmp-k">mean</span><span class="rc-cmp-v" :style="{ color: scoreColor(r.avg_score) }">{{ (r.avg_score * 100).toFixed(0) }}%</span></div>
              <div class="rc-cmp-stat"><span class="rc-cmp-k">src</span><span class="rc-cmp-v">{{ r.result_count }}</span></div>
              <div v-if="tokenBudget(r.sources)" class="rc-cmp-stat"><span class="rc-cmp-k">tok</span><span class="rc-cmp-v">~{{ tokenBudget(r.sources)!.toLocaleString() }}</span></div>
              <div class="rc-cmp-stat"><span class="rc-cmp-k">top-k</span><span class="rc-cmp-v">{{ r.top_k }}</span></div>
            </div>
            <div v-if="r.config" class="rc-cmp-cfg">
              <span class="rc-hist-cfg-chip" :class="{ on: r.config.hybrid }">hybrid</span>
              <span class="rc-hist-cfg-chip" :class="{ on: r.config.rerank }">rerank</span>
              <span class="rc-hist-cfg-chip" :class="{ on: r.config.citations }">citations</span>
              <span v-if="r.config.num_queries > 1" class="rc-hist-cfg-chip">Q×{{ r.config.num_queries }}</span>
            </div>
          </div>
          <div v-if="compareRecords.length === 1" class="rc-cmp-cell rc-cmp-cell--empty"><span>Pick another record to compare</span></div>
        </div>
        <div v-if="compareDelta" class="rc-cmp-delta">
          <span class="rc-hist-spark-label">Δ right − left</span>
          <div class="rc-cmp-delta-row">
            <span class="rc-cmp-delta-chip" :class="compareDelta.latency_ms > 0 ? 'is-worse' : compareDelta.latency_ms < 0 ? 'is-better' : 'is-same'">latency {{ compareDelta.latency_ms > 0 ? '+' : '' }}{{ compareDelta.latency_ms }}ms</span>
            <span class="rc-cmp-delta-chip" :class="compareDelta.top_score_pct > 0 ? 'is-better' : compareDelta.top_score_pct < 0 ? 'is-worse' : 'is-same'">top {{ compareDelta.top_score_pct > 0 ? '+' : '' }}{{ compareDelta.top_score_pct.toFixed(0) }}%</span>
            <span class="rc-cmp-delta-chip" :class="compareDelta.avg_score_pct > 0 ? 'is-better' : compareDelta.avg_score_pct < 0 ? 'is-worse' : 'is-same'">mean {{ compareDelta.avg_score_pct > 0 ? '+' : '' }}{{ compareDelta.avg_score_pct.toFixed(0) }}%</span>
            <span class="rc-cmp-delta-chip" :class="compareDelta.sources > 0 ? 'is-better' : compareDelta.sources < 0 ? 'is-worse' : 'is-same'">src {{ compareDelta.sources > 0 ? '+' : '' }}{{ compareDelta.sources }}</span>
          </div>
        </div>
      </div>

      <!-- Filter row -->
      <div class="rc-hist-filter-row">
        <span v-if="historyRecords.length" class="rc-results-stat">{{ analytics.filteredHistoryRecords.value.length }}/{{ historyRecords.length }} shown · max {{ historyMax }}</span>
        <span v-if="analytics.meanTopScoreRetrieval.value != null" class="rc-results-stat rc-results-score" :style="{ color: scoreColor(analytics.meanTopScoreRetrieval.value / 100) }">μ top {{ analytics.meanTopScoreRetrieval.value }}%</span>
        <span v-if="analytics.meanLatencyRetrieval.value != null" class="rc-results-stat" :style="{ color: latencyBucket(analytics.meanLatencyRetrieval.value).color }">μ {{ analytics.meanLatencyRetrieval.value }}ms</span>
        <span v-if="analytics.staleRateRetrieval.value?.stale" class="rc-results-stat rc-results-stale">⚠ {{ analytics.staleRateRetrieval.value.stale }}/{{ analytics.staleRateRetrieval.value.total }} stale</span>
        <el-select v-model="historyDateRange" size="small" class="rc-hist-range-filter">
          <el-option label="24h" value="24h" /><el-option label="7d" value="7d" /><el-option label="30d" value="30d" /><el-option label="all" value="all" />
        </el-select>
        <el-input v-model="historyFilterText" size="small" clearable placeholder="Filter by question…" :prefix-icon="Search" class="rc-hist-filter" />
        <el-select v-model="retrievalConfigFilter" size="small" clearable placeholder="All configs" class="rc-hist-mode-filter">
          <el-option label="hybrid" value="hybrid" /><el-option label="rerank" value="rerank" /><el-option label="citations" value="citations" /><el-option label="plain" value="plain" />
        </el-select>
        <label class="rc-thresh-toggle"><input type="checkbox" v-model="retrievalCompactMode" /><span>compact</span></label>
      </div>

      <div v-if="historyLoading && !historyRecords.length" class="rc-empty"><el-icon :size="40"><Clock /></el-icon><span>Loading…</span></div>
      <div v-else-if="!historyRecords.length" class="rc-empty"><el-icon :size="40"><Clock /></el-icon><span>No retrieval history yet.</span></div>

      <div v-else class="rc-hist-list">
        <!-- Grade breakdown -->
        <div v-if="analytics.gradeBreakdownRetrieval.value" class="rc-hist-grades">
          <span class="rc-hist-spark-label">source grades</span>
          <div class="rc-hist-grades-track">
            <div v-for="g in analytics.gradeBreakdownRetrieval.value.buckets" :key="g.grade" class="rc-hist-grades-seg" :style="{ width: `${g.pct}%`, background: g.color }"><span v-if="g.pct >= 12" class="rc-hist-grades-seg-lbl">{{ g.grade }} · {{ g.count }}</span></div>
          </div>
          <span class="rc-hist-grades-total">{{ analytics.gradeBreakdownRetrieval.value.total }} src</span>
        </div>

        <!-- Best/worst -->
        <div v-if="analytics.bestWorstQuestionRetrieval.value" class="rc-hist-bwq">
          <div class="rc-hist-bwq-row"><span class="rc-hist-bwq-lbl" :style="{ color: scoreColor(analytics.bestWorstQuestionRetrieval.value.best.topScore / 100) }">best</span><span class="rc-hist-bwq-q" @click="reuseHistoryQuestion(analytics.bestWorstQuestionRetrieval.value.best.question)">{{ analytics.bestWorstQuestionRetrieval.value.best.question }}</span><span class="rc-hist-bwq-score" :style="{ color: scoreColor(analytics.bestWorstQuestionRetrieval.value.best.topScore / 100) }">{{ analytics.bestWorstQuestionRetrieval.value.best.topScore }}%</span></div>
          <div class="rc-hist-bwq-row"><span class="rc-hist-bwq-lbl" :style="{ color: scoreColor(analytics.bestWorstQuestionRetrieval.value.worst.topScore / 100) }">worst</span><span class="rc-hist-bwq-q" @click="reuseHistoryQuestion(analytics.bestWorstQuestionRetrieval.value.worst.question)">{{ analytics.bestWorstQuestionRetrieval.value.worst.question }}</span><span class="rc-hist-bwq-score" :style="{ color: scoreColor(analytics.bestWorstQuestionRetrieval.value.worst.topScore / 100) }">{{ analytics.bestWorstQuestionRetrieval.value.worst.topScore }}%</span></div>
        </div>

        <!-- Config cost -->
        <div v-if="analytics.configCost.value" class="rc-hist-cost">
          <span class="rc-hist-spark-label">config cost</span>
          <div class="rc-hist-cost-row">
            <span v-for="e in analytics.configCost.value.entries" :key="e.key" class="rc-hist-cost-chip" :class="{ 'is-winner': e.winner }">
              <span v-if="e.winner" class="rc-hist-cost-chip-winner">✓</span>
              <span class="rc-hist-cost-chip-lbl">{{ e.label }}</span>
              <span class="rc-hist-cost-chip-val">{{ e.mean }}ms</span>
              <span class="rc-hist-cost-chip-score" :style="{ color: scoreColor(e.meanScore / 100) }">{{ e.meanScore }}%</span>
              <span v-if="e.delta != null" class="rc-hist-cost-chip-delta" :style="{ color: e.delta > 0 ? 'var(--el-color-danger)' : 'var(--el-color-success)' }">{{ e.delta >= 0 ? '+' : '' }}{{ e.delta }}ms</span>
            </span>
          </div>
        </div>

        <!-- Sparklines + scatter -->
        <div v-if="analytics.latencySparkRetrieval.value || analytics.scatterRetrieval.value" class="rc-hist-viz">
          <div v-if="analytics.latencySparkRetrieval.value" class="rc-hist-spark">
            <svg :viewBox="`0 0 ${analytics.latencySparkRetrieval.value.W} ${analytics.latencySparkRetrieval.value.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="analytics.latencySparkRetrieval.value.pts" fill="none" stroke="var(--el-color-primary)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">latency trend</span>
            <span class="rc-hist-spark-stat">μ {{ analytics.latencySparkRetrieval.value.mean }}ms</span>
          </div>
          <div v-if="analytics.scoreSparkRetrieval.value" class="rc-hist-spark">
            <svg :viewBox="`0 0 ${analytics.scoreSparkRetrieval.value.W} ${analytics.scoreSparkRetrieval.value.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="analytics.scoreSparkRetrieval.value.pts" fill="none" stroke="var(--el-color-success)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">score trend</span>
            <span class="rc-hist-spark-stat">μ {{ analytics.scoreSparkRetrieval.value.mean }}%</span>
          </div>
          <div v-if="analytics.scatterRetrieval.value" class="rc-hist-scatter">
            <div class="rc-hist-scatter-title">
              <span class="rc-hist-spark-label">latency × score</span>
              <span class="rc-hist-scatter-legend">
                <span class="rc-hist-scatter-legend-item"><i class="dot dot--plain" /> vector</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot dot--hybrid" /> hybrid</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot dot--rerank" /> +rerank</span>
              </span>
            </div>
            <svg :viewBox="`0 0 ${analytics.scatterRetrieval.value.W} ${analytics.scatterRetrieval.value.H}`" preserveAspectRatio="xMidYMid meet" class="rc-hist-scatter-svg" aria-hidden="true">
              <line :x1="analytics.scatterRetrieval.value.pad" :y1="analytics.scatterRetrieval.value.H - analytics.scatterRetrieval.value.pad" :x2="analytics.scatterRetrieval.value.W - analytics.scatterRetrieval.value.pad" :y2="analytics.scatterRetrieval.value.H - analytics.scatterRetrieval.value.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <line :x1="analytics.scatterRetrieval.value.pad" :y1="analytics.scatterRetrieval.value.pad" :x2="analytics.scatterRetrieval.value.pad" :y2="analytics.scatterRetrieval.value.H - analytics.scatterRetrieval.value.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <circle v-for="d in analytics.scatterRetrieval.value.dots" :key="d.id" :cx="d.cx" :cy="d.cy" :r="d.r" :class="['rc-hist-scatter-dot', { 'is-hybrid': d.hybrid, 'is-rerank': d.rerank, 'is-active': selectedHistoryId === d.id }]" @click="selectHistoryRecord(d.id)">
                <title>{{ d.lat }}ms · {{ Math.round(d.score * 100) }}%{{ d.hybrid ? ' · hybrid' : '' }}{{ d.rerank ? ' · rerank' : '' }}</title>
              </circle>
            </svg>
          </div>
        </div>

        <!-- Record cards -->
        <div v-for="r in analytics.filteredHistoryRecords.value" :key="r.id" :id="`rc-hist-rec-${r.id}`" class="rc-hist-item" :class="{ 'is-selected': selectedHistoryId === r.id, 'is-comparing': compareIds.includes(r.id) }">
          <div class="rc-hist-hd">
            <el-checkbox :model-value="compareIds.includes(r.id)" size="small" :disabled="!compareIds.includes(r.id) && compareIds.length >= 2" @change="toggleCompare(r.id)" class="rc-hist-compare-cb" />
            <span class="rc-hist-time" :title="r.timestamp">{{ r.timestamp.replace('T', ' ') }}</span>
            <span class="rc-hist-q" :title="r.question">{{ r.question }}</span>
            <span v-if="r.scope" class="rc-hist-scope">{{ r.scope }}</span>
            <span class="rc-hist-stat rc-hist-stat--latency" :style="{ color: latencyBucket(r.latency_ms).color }">{{ latencyBucket(r.latency_ms).label }} · {{ r.latency_ms }}ms</span>
            <span class="rc-hist-stat">k={{ r.top_k }}</span>
            <span class="rc-hist-stat">{{ r.result_count }} src</span>
            <span class="rc-hist-stat" :style="{ color: scoreColor(r.top_score) }">top {{ (r.top_score * 100).toFixed(0) }}%</span>
            <el-button size="small" text @click="reuseHistoryQuestion(r.question)">Re-run</el-button>
            <el-button size="small" text :icon="expandedSourcesRId === r.id ? ArrowDown : ArrowRight" @click="toggleRecordSources(r.id)">{{ expandedSourcesRId === r.id ? 'Hide' : 'Sources' }}</el-button>
            <el-tooltip :content="copiedQId === r.id ? 'Copied!' : 'Copy question'" placement="top"><el-button size="small" text :icon="Document" @click="copyQuestion(r.id, r.question)" /></el-tooltip>
          </div>
          <div v-if="r.config && !retrievalCompactMode" class="rc-hist-cfg">
            <span class="rc-hist-cfg-chip" :class="{ on: r.config.hybrid }">hybrid</span>
            <span class="rc-hist-cfg-chip" :class="{ on: r.config.rerank }">rerank</span>
            <span class="rc-hist-cfg-chip" :class="{ on: r.config.citations }">citations</span>
            <span v-if="r.config.num_queries > 1" class="rc-hist-cfg-chip">Q×{{ r.config.num_queries }}</span>
          </div>
          <div v-if="r.sources.length && !retrievalCompactMode" class="rc-hist-hist" aria-hidden="true">
            <span v-for="(s, i) in r.sources" :key="i" class="rc-hist-hist-bar" :style="{ height: `${Math.max(4, Math.min(100, s.score * 100))}%`, background: scoreColor(s.score) }" />
          </div>
          <div v-if="expandedSourcesRId === r.id" class="rc-hist-recsrc">
            <div class="rc-hist-recsrc-toolbar">
              <span class="rc-hist-recsrc-summary">{{ r.sources.length }} chunks · Σ {{ (r.sources.reduce((a, s) => a + (s.metadata?.token_estimate ?? 0), 0)).toLocaleString() }} tok</span>
              <el-tooltip :content="copiedRecSrcId === r.id ? 'Copied!' : 'Copy chunks as JSON'" placement="top"><el-button size="small" text :icon="DocumentCopy" @click="copyRecordSources(r)" /></el-tooltip>
            </div>
            <div v-for="(s, i) in r.sources" :key="i" class="rc-hist-recsrc-item">
              <div class="rc-hist-recsrc-hd">
                <span class="rc-hist-recsrc-idx" :style="{ color: scoreColor(s.score) }">#{{ i + 1 }}</span>
                <span class="rc-hist-recsrc-score" :style="{ color: scoreColor(s.score) }">{{ (s.score * 100).toFixed(0) }}%</span>
                <span class="rc-hist-recsrc-path" :title="s.file_path" @click="emit('open-file', s.file_path)"><el-icon :size="12"><Document /></el-icon>{{ s.file_path }}</span>
              </div>
              <pre class="rc-hist-recsrc-text">{{ s.text.length > 600 ? s.text.slice(0, 600) + '…' : s.text }}</pre>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══ Chat sub-tab ═══ -->
    <template v-else>
      <!-- Chat filter row -->
      <div class="rc-hist-filter-row">
        <span v-if="chatTurns.length" class="rc-results-stat">{{ analytics.filteredChatTurns.value.length }}/{{ chatTurns.length }} shown · max {{ chatTurnsMax }}</span>
        <span v-if="analytics.meanTopScoreChat.value != null" class="rc-results-stat rc-results-score" :style="{ color: scoreColor(analytics.meanTopScoreChat.value / 100) }">μ top {{ analytics.meanTopScoreChat.value }}%</span>
        <span v-if="analytics.meanLatencyChat.value != null" class="rc-results-stat" :style="{ color: latencyBucket(analytics.meanLatencyChat.value).color }">μ {{ analytics.meanLatencyChat.value }}ms</span>
        <span v-if="analytics.staleRateChat.value?.stale" class="rc-results-stat rc-results-stale">⚠ {{ analytics.staleRateChat.value.stale }}/{{ analytics.staleRateChat.value.total }} stale</span>
        <el-input v-model="historyFilterText" size="small" clearable placeholder="Filter by question or answer…" :prefix-icon="Search" class="rc-hist-filter" />
        <el-select v-model="chatModeFilter" size="small" clearable placeholder="All modes" class="rc-hist-mode-filter">
          <el-option label="condense_plus_context" value="condense_plus_context" />
          <el-option label="condense_question" value="condense_question" />
          <el-option label="context" value="context" />
          <el-option label="simple" value="simple" />
        </el-select>
        <label class="rc-thresh-toggle"><input type="checkbox" v-model="chatCompactMode" /><span>compact</span></label>
      </div>

      <div v-if="chatTurnsLoading && !chatTurns.length" class="rc-empty"><el-icon :size="40"><Clock /></el-icon><span>Loading…</span></div>
      <div v-else-if="!chatTurns.length" class="rc-empty"><el-icon :size="40"><Clock /></el-icon><span>No chat history yet.</span></div>

      <template v-else>
        <!-- Chat mode breakdown -->
        <div v-if="analytics.chatModeBreakdown.value?.length" class="rc-hist-chat-modes">
          <span class="rc-hist-spark-label">chat engine mode</span>
          <div class="rc-hist-modes-bars">
            <div v-for="m in analytics.chatModeBreakdown.value" :key="m.mode" class="rc-hist-mode-row">
              <span class="rc-hist-mode-name">{{ m.mode }}</span>
              <div class="rc-hist-mode-bar-track"><div class="rc-hist-mode-bar" :style="{ width: `${m.pct}%`, background: m.color }" /></div>
              <span class="rc-hist-mode-count">{{ m.count }} · {{ m.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Chat sparklines -->
        <div v-if="analytics.latencySparkChat.value || analytics.scatterChat.value" class="rc-hist-viz">
          <div v-if="analytics.latencySparkChat.value" class="rc-hist-spark">
            <svg :viewBox="`0 0 ${analytics.latencySparkChat.value.W} ${analytics.latencySparkChat.value.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="analytics.latencySparkChat.value.pts" fill="none" stroke="var(--el-color-primary)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">latency trend</span>
            <span class="rc-hist-spark-stat">μ {{ analytics.latencySparkChat.value.mean }}ms</span>
          </div>
          <div v-if="analytics.scatterChat.value" class="rc-hist-scatter">
            <div class="rc-hist-scatter-title">
              <span class="rc-hist-spark-label">latency × score</span>
              <span class="rc-hist-scatter-legend">
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-color-primary)' }" /> condense+ctx</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-color-success)' }" /> condense_q</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-color-warning)' }" /> context</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-text-color-secondary)' }" /> simple</span>
              </span>
            </div>
            <svg :viewBox="`0 0 ${analytics.scatterChat.value.W} ${analytics.scatterChat.value.H}`" preserveAspectRatio="xMidYMid meet" class="rc-hist-scatter-svg" aria-hidden="true">
              <line :x1="analytics.scatterChat.value.pad" :y1="analytics.scatterChat.value.H - analytics.scatterChat.value.pad" :x2="analytics.scatterChat.value.W - analytics.scatterChat.value.pad" :y2="analytics.scatterChat.value.H - analytics.scatterChat.value.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <line :x1="analytics.scatterChat.value.pad" :y1="analytics.scatterChat.value.pad" :x2="analytics.scatterChat.value.pad" :y2="analytics.scatterChat.value.H - analytics.scatterChat.value.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <circle v-for="d in analytics.scatterChat.value.dots" :key="d.id" :cx="d.cx" :cy="d.cy" :r="d.r" :style="{ fill: d.color }" class="rc-hist-scatter-dot" @click="selectChatTurn(d.id)">
                <title>{{ d.lat }}ms · {{ Math.round(d.score * 100) }}% · {{ d.mode }}</title>
              </circle>
            </svg>
          </div>
        </div>

        <!-- Chat turn cards -->
        <div class="rc-hist-list">
          <div v-for="t in analytics.filteredChatTurns.value" :key="t.id" :id="`rc-hist-turn-${t.id}`" class="rc-hist-item rc-hist-item--chat" :class="{ 'is-expanded': expandedChatId === t.id, 'is-comparing': chatCompareIds.includes(t.id) }">
            <div class="rc-hist-hd">
              <el-checkbox :model-value="chatCompareIds.includes(t.id)" size="small" :disabled="!chatCompareIds.includes(t.id) && chatCompareIds.length >= 2" @change="toggleChatCompare(t.id)" class="rc-hist-compare-cb" />
              <span class="rc-hist-time" :title="t.timestamp">{{ t.timestamp.replace('T', ' ') }}</span>
              <span class="rc-hist-q" :title="t.question">{{ t.question }}</span>
              <span class="rc-hist-stat">{{ t.chat_mode }}</span>
              <span class="rc-hist-stat rc-hist-stat--latency" :style="{ color: latencyBucket(t.latency_ms).color }">{{ latencyBucket(t.latency_ms).label }} · {{ t.latency_ms }}ms</span>
              <span class="rc-hist-stat">{{ t.source_count }} src</span>
              <span class="rc-hist-stat" :style="{ color: scoreColor(t.top_score) }">top {{ (t.top_score * 100).toFixed(0) }}%</span>
              <el-button size="small" text @click="expandedChatId = expandedChatId === t.id ? null : t.id">{{ expandedChatId === t.id ? 'Collapse' : 'Expand' }}</el-button>
              <el-button size="small" text @click="reuseHistoryQuestion(t.question)">Re-run</el-button>
              <el-tooltip :content="chatAnswerCopiedId === t.id ? 'Copied!' : 'Copy answer'" placement="top"><el-button size="small" text :icon="Document" @click="copyChatAnswer(t)" /></el-tooltip>
            </div>
            <div v-if="expandedChatId === t.id" class="rc-hist-chat-answer rc-hist-chat-answer--full">{{ t.answer }}</div>
            <div v-else-if="!chatCompactMode" class="rc-hist-chat-answer" :title="t.answer">{{ t.answer.length > 280 ? t.answer.slice(0, 280) + '…' : t.answer }}</div>
            <div v-if="t.config" class="rc-hist-cfg">
              <span class="rc-hist-cfg-chip" :class="{ on: t.config.hybrid }">hybrid</span>
              <span class="rc-hist-cfg-chip" :class="{ on: t.config.rerank }">rerank</span>
              <span class="rc-hist-cfg-chip" :class="{ on: t.config.citations }">citations</span>
            </div>
            <RagSources v-if="expandedChatId === t.id && t.sources.length" :sources="t.sources" />
            <div v-else-if="t.sources.length" class="rc-hist-hist" aria-hidden="true">
              <span v-for="(s, i) in t.sources" :key="i" class="rc-hist-hist-bar" :style="{ height: `${Math.max(4, Math.min(100, s.score * 100))}%`, background: scoreColor(s.score) }" />
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>