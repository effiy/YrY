<script setup lang="ts" name="aiChatLlamaIndexPanel">
/**
 * RAG Console — per-conversation semantic search over context files.
 * Query tab: search + scored results with snippet preview.
 * Index tab: file list with index status + rebuild.
 */
import { ref, computed } from "vue";
import { Refresh, Search, DataAnalysis, Cpu, Collection, FolderOpened, Document, Files, Scissor, ArrowRight, ArrowDown, Clock, Delete, Download, InfoFilled, DocumentCopy, Close } from "@element-plus/icons-vue";
import { ragStatus, ragBuild, ragQuery, ragDecompose, ragCategories, ragHistory, ragHistoryClear, ragChatHistory, ragChatHistoryClear, type RagCategories } from "@/api/modules/ragService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import RagSources from "@/components/RagSources/RagSources.vue";
import { injectCitations, makeCitationClickHandler } from "@/utils/citations";
import type { RagStatusResponse, RagSource, RagSubQuestion, RagQueryRecord, RagChatTurnRecord } from "@/api/interface/rag";

const props = withDefaults(
  defineProps<{ scopeFiles?: string[]; scopeTitle?: string }>(),
  { scopeFiles: () => [], scopeTitle: "" }
);

const emit = defineEmits<{ (e: "close"): void }>();

// ── Tabs ──
type Tab = "query" | "index" | "decompose" | "history";
const activeTab = ref<Tab>("query");

// ── Scope ──
const hasScope = computed(() => props.scopeFiles.length > 0);
const derivedScope = computed(() => {
  if (!props.scopeFiles.length) return "";
  if (props.scopeFiles.length === 1) return props.scopeFiles[0];
  const parts = props.scopeFiles.map((p: string) => p.split("/"));
  const minLen = Math.min(...parts.map((p: string[]) => p.length));
  const c: string[] = [];
  for (let i = 0; i < minLen; i++) { if (parts.every(p => p[i] === parts[0][i])) c.push(parts[0][i]); else break; }
  return c.join("/") || "";
});

// ── Context files ──
interface ScopeFileInfo { path: string; name: string; dir: string }
const scopeFileInfos = computed<ScopeFileInfo[]>(() =>
  props.scopeFiles.map((p: string) => { const s = p.split("/"); return { path: p, name: s.pop() || p, dir: s.join("/") || "root" }; })
);
// Question-substring filter for the scope file list — useful when the user
// has attached many context files and needs to find one to preview. Matches
// against both the file name and the full path (incl. directory).
const scopeFileFilter = ref("");
const filteredScopeFileInfos = computed(() => {
  const q = scopeFileFilter.value.trim().toLowerCase();
  if (!q) return scopeFileInfos.value;
  return scopeFileInfos.value.filter(f => f.path.toLowerCase().includes(q));
});
const scopeFileGroups = computed(() => {
  const m = new Map<string, ScopeFileInfo[]>();
  for (const f of scopeFileInfos.value) { const l = m.get(f.dir) || []; l.push(f); m.set(f.dir, l); }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
});

// ── Index status ──
const status = ref<RagStatusResponse | null>(null);
const building = ref(false);

// ── Query ──
const queryText = ref("");
const queryTopK = ref(4);
const queryNumQueries = ref(1);
const queryLoading = ref(false);
const queryError = ref("");
const querySources = ref<RagSource[]>([]);
const queryLatency = ref(0);
const hasSearched = ref(false);
// Minimum cosine score to display in the results list — interactive
// visualization that lets the user tighten retrieval display in real
// time without re-running the query. Defaults to 0 (show everything).
const queryMinScore = ref(0);
const queryHideStale = ref(false);
const queryFileFilter = ref("");
const queryGroupByFile = ref(false);
const querySortBy = ref<"score" | "file" | "freshness">("score");
const filteredQuerySources = computed(() => {
  const list = querySources.value.filter(s => {
    if (s.score < queryMinScore.value) return false;
    if (queryHideStale.value) {
      const f = metaFreshness(s.metadata);
      if (f?.stale) return false;
    }
    const q = queryFileFilter.value.trim().toLowerCase();
    if (q && !(s.file_path || "").toLowerCase().includes(q)) return false;
    return true;
  });
  if (querySortBy.value === "file") {
    return [...list].sort((a, b) => (a.file_path || "").localeCompare(b.file_path || "") || (b.score - a.score));
  }
  if (querySortBy.value === "freshness") {
    return [...list].sort((a, b) => {
      const fa = metaFreshness(a.metadata)?.ageDays ?? Number.MAX_SAFE_INTEGER;
      const fb = metaFreshness(b.metadata)?.ageDays ?? Number.MAX_SAFE_INTEGER;
      return fa - fb || (b.score - a.score);
    });
  }
  return list; // score (default — backend already ranks by score)
});

// Group filtered results by file_path — when toggle is on, render chunks
// nested under their parent file header. Lets the user see which file is
// contributing how many chunks (and at what score tier) at a glance,
// instead of one flat rank-ordered list.
const groupedQuerySources = computed(() => {
  if (!queryGroupByFile.value) return null;
  const groups: Record<string, RagSource[]> = {};
  for (const s of filteredQuerySources.value) {
    const fp = s.file_path || "(unknown)";
    if (!groups[fp]) groups[fp] = [];
    groups[fp].push(s);
  }
  return Object.entries(groups)
    .map(([path, sources]) => {
      const scores = sources.map(s => s.score || 0);
      return {
        path,
        sources,
        count: sources.length,
        best: Math.max(...scores),
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      };
    })
    .sort((a, b) => b.best - a.best);
});

// Context-window budget across filtered sources — surfaces the llama_index
// concept of "how much of the LLM's context window the retrieved chunks
// consume", so the user can spot when top_k or chunk_size needs trimming.
const queryTokenBudget = computed(() => {
  let tokens = 0, chars = 0, known = 0;
  for (const s of filteredQuerySources.value) {
    if (s.metadata?.token_estimate != null) { tokens += Number(s.metadata.token_estimate) || 0; known++; }
    if (s.metadata?.char_count != null) chars += Number(s.metadata.char_count) || 0;
  }
  return { tokens, chars, known, total: filteredQuerySources.value.length };
});

// Low-relevance nudge — when the best cosine score is weak (< 0.5), surface a
// one-click suggestion so the user can recover retrieval quality without
// thinking about which knob to flip. Returns null when results are fine or
// the user has already maxed out the obvious knobs.
const lowRelevanceHint = computed<{ text: string; action: () => void } | null>(() => {
  if (!querySources.value.length) return null;
  const top = Math.max(...querySources.value.map(s => s.score || 0));
  if (top >= 0.5) return null;
  if (!queryHybrid.value && !hasScope.value && !hasMetaFilter.value) {
    return { text: "Low relevance — try hybrid (vector + BM25 fusion)", action: () => { queryHybrid.value = true; void doQuery(); } };
  }
  if (queryHybrid.value && !queryRerank.value) {
    return { text: "Still weak — enable LLMRerank postprocessor", action: () => { queryRerank.value = true; void doQuery(); } };
  }
  if (queryTopK.value < 8) {
    return { text: `Only ${queryTopK.value} chunk(s) — raise top-k`, action: () => { queryTopK.value = Math.min(20, queryTopK.value + 4); void doQuery(); } };
  }
  return null;
});

// Count of stale chunks (>90 days old) across the current query's sources
// that survive the min-score threshold — surfaces how many chunks the
// "hide stale" toggle is currently masking so the user knows whether the
// toggle is doing meaningful work.
const staleHiddenCount = computed(() => {
  if (!querySources.value.length) return 0;
  let n = 0;
  for (const s of querySources.value) {
    if (s.score < queryMinScore.value) continue;
    const f = metaFreshness(s.metadata);
    if (f?.stale) n++;
  }
  return n;
});

// Knowledge-base coverage — breaks down the indexed corpus by frontmatter
// category so the user can see which topics dominate the index and which
// are sparse (a hint to go seed more content there). Backed by
// /rag-categories, surfaced as a stacked horizontal bar.
const kbCoverage = computed(() => {
  const cats = (kbCategories.value?.categories ?? []).slice();
  const total = kbCategories.value?.total_files ?? (cats.reduce((s, c) => s + c.file_count, 0) || 1);
  const sorted = [...cats].sort((a, b) => b.file_count - a.file_count).slice(0, 8);
  const rest = cats.length > 8
    ? cats.slice(8).reduce((s, c) => s + c.file_count, 0)
    : 0;
  return {
    sorted: sorted.map(c => ({ ...c, pct: (c.file_count / total) * 100 })),
    restCount: cats.length - 8,
    restFiles: rest,
    totalFiles: total,
    catCount: cats.length,
  };
});

// Per-query retrieval overrides — initialised from backend config once
// status loads, then freely toggleable. `null` would mean "use backend
// default"; we snapshot the backend value at load time instead, so the
// chip reflects what the next query will actually do.
const queryHybrid = ref(false);
const queryRerank = ref(false);
const queryCitations = ref(false);

// ── Metadata filters (llama_index MetadataFilters) — narrow retrieval by
//    frontmatter category + tags. Populated from /rag-categories. When any
//    filter is set, hybrid is auto-disabled (BM25 doesn't support filters).
const kbCategories = ref<RagCategories | null>(null);
const queryCategory = ref<string>("");
const queryTags = ref<string[]>([]);
const queryTagsLoading = ref(false);

// ── History — in-memory ring of recent retrievals (max 20 on backend) ──
const historyRecords = ref<RagQueryRecord[]>([]);
const historyLoading = ref(false);
const historyMax = ref(20);
// Selected record id (set by clicking a scatter dot). Highlights the
// matching card below so the user can drill from aggregate → detail.
const selectedHistoryId = ref<string | null>(null);

/** Click handler for retrieval-history scatter dots — toggles the
 *  highlight state AND scrolls the matching record card into view so
 *  the user doesn't have to scan a long list to find the outlier dot. */
function selectHistoryRecord(id: string) {
  if (selectedHistoryId.value === id) { selectedHistoryId.value = null; return; }
  selectedHistoryId.value = id;
  setTimeout(() => {
    document.getElementById(`rc-hist-rec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 30);
}

/** Toggle inline sources view for a retrieval history record. When open,
 *  renders the actual retrieved chunks (file_path + score + text snippet)
 *  beneath the card so the user can inspect what was retrieved without
 *  having to re-run the query. */
function toggleRecordSources(id: string) {
  expandedSourcesRId.value = expandedSourcesRId.value === id ? null : id;
}

/** Copy a retrieval record's full sources list as JSON — useful for pasting
 *  into analysis tools or sharing a "here's what the retriever returned"
 *  snapshot. Mirrors the JSON export pattern used elsewhere. */
async function copyRecordSources(r: RagQueryRecord) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(r.sources, null, 2));
    copiedRecSrcId.value = r.id;
    setTimeout(() => { if (copiedRecSrcId.value === r.id) copiedRecSrcId.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

/** Mirror of copyRecordSources for chat turns — lets users copy the chunks
 *  a chat engine pulled in for any given turn, parity with retrieval. */
async function copyChatTurnSources(t: RagChatTurnRecord) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(t.sources, null, 2));
    copiedChatSrcId.value = t.id;
    setTimeout(() => { if (copiedChatSrcId.value === t.id) copiedChatSrcId.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

/** Click handler for chat-scatter dots — toggles expansion AND scrolls
 *  the matching turn card into view (mirrors selectHistoryRecord). */
function selectChatTurn(id: string) {
  const willExpand = expandedChatId.value !== id;
  expandedChatId.value = willExpand ? id : null;
  if (willExpand) {
    setTimeout(() => {
      document.getElementById(`rc-hist-turn-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 30);
  }
}
// Pair of record ids selected for side-by-side comparison on the retrieval
// sub-tab. Max 2 — when a third is checked, the oldest (index 0) is dropped.
const compareIds = ref<string[]>([]);
function toggleCompare(id: string) {
  const i = compareIds.value.indexOf(id);
  if (i >= 0) {
    compareIds.value.splice(i, 1);
    return;
  }
  if (compareIds.value.length >= 2) compareIds.value.shift();
  compareIds.value.push(id);
}
function clearCompare() { compareIds.value = []; }
// The actual records corresponding to compareIds, preserving selection order
// (the first-checked sits on the left side of the comparison panel).
const compareRecords = computed(() =>
  compareIds.value
    .map(id => historyRecords.value.find(r => r.id === id))
    .filter((r): r is RagQueryRecord => !!r)
);
// Delta between the two selected records. Convention: positive latency = the
// right record is slower (worse); positive score = right is higher (better).
// Color/label is computed at render time so the component stays declarative.
const compareDelta = computed(() => {
  const [a, b] = compareRecords.value;
  if (!a || !b) return null;
  const ta = recordTokenBudget(a), tb = recordTokenBudget(b);
  return {
    latency_ms: b.latency_ms - a.latency_ms,
    top_score_pct: (b.top_score - a.top_score) * 100,
    avg_score_pct: (b.avg_score - a.avg_score) * 100,
    sources: b.result_count - a.result_count,
    top_k: b.top_k - a.top_k,
    tokens: (ta != null && tb != null) ? tb - ta : null,
  };
});

// Winner of the side-by-side compare — surfaces which side "won" by a
// composite score combining retrieval quality (top+avg) with a latency
// penalty. Renders a badge on the winning cell so the user can spot the
// better config/scope at a glance. Returns null on tie.
const compareWinnerSide = computed<"left" | "right" | null>(() => {
  const [a, b] = compareRecords.value;
  if (!a || !b) return null;
  const sa = a.top_score * 0.7 + a.avg_score * 0.3 - (a.latency_ms / 10000);
  const sb = b.top_score * 0.7 + b.avg_score * 0.3 - (b.latency_ms / 10000);
  if (Math.abs(sa - sb) < 0.001) return null;
  return sa > sb ? "left" : "right";
});

// Parallel compare-mode for the chat sub-tab. Mirrors the retrieval compare
// pattern: max 2 ids, oldest dropped on overflow. Reuses the same compareDelta
// shape but keyed on chat turns instead of retrieval records.
const chatCompareIds = ref<string[]>([]);
function toggleChatCompare(id: string) {
  const i = chatCompareIds.value.indexOf(id);
  if (i >= 0) {
    chatCompareIds.value.splice(i, 1);
    return;
  }
  if (chatCompareIds.value.length >= 2) chatCompareIds.value.shift();
  chatCompareIds.value.push(id);
}
function clearChatCompare() { chatCompareIds.value = []; }
const chatCompareRecords = computed(() =>
  chatCompareIds.value
    .map(id => chatTurns.value.find(t => t.id === id))
    .filter((t): t is RagChatTurnRecord => !!t)
);
const chatCompareDelta = computed(() => {
  const [a, b] = chatCompareRecords.value;
  if (!a || !b) return null;
  const ta = chatTurnTokenBudget(a), tb = chatTurnTokenBudget(b);
  return {
    latency_ms: b.latency_ms - a.latency_ms,
    top_score_pct: (b.top_score - a.top_score) * 100,
    avg_score_pct: (b.avg_score - a.avg_score) * 100,
    sources: b.source_count - a.source_count,
    tokens: (ta != null && tb != null) ? tb - ta : null,
  };
});

// Mirror of compareWinnerSide for chat turns — same composite formula so
// the chat compare grid also shows a winner badge on the better turn.
const chatCompareWinnerSide = computed<"left" | "right" | null>(() => {
  const [a, b] = chatCompareRecords.value;
  if (!a || !b) return null;
  const sa = a.top_score * 0.7 + a.avg_score * 0.3 - (a.latency_ms / 10000);
  const sb = b.top_score * 0.7 + b.avg_score * 0.3 - (b.latency_ms / 10000);
  if (Math.abs(sa - sb) < 0.001) return null;
  return sa > sb ? "left" : "right";
});
// Sub-tab toggle on the History tab: "retrieval" (one-shot rag-query ring)
// vs "chat" (streamed rag-chat turns). Defaults to retrieval so the existing
// UI stays the same; chat turns are a parallel surface.
const historyView = ref<"retrieval" | "chat">("retrieval");

// Chat turn ring — same shape as historyRecords but for rag-chat. Loaded
// lazily when the user first switches to the "chat" sub-tab.
const chatTurns = ref<RagChatTurnRecord[]>([]);
const chatTurnsLoading = ref(false);
const chatTurnsMax = ref(20);
// Expanded chat turn id — when set, the matching card shows the full
// streamed answer + full source list (via RagSources). Click the card
// header to toggle.
const expandedChatId = ref<string | null>(null);
const expandedSourcesRId = ref<string | null>(null);
const copiedRecSrcId = ref<string | null>(null);
const copiedChatSrcId = ref<string | null>(null);
// Question-substring filter on the History tab. Applies to whichever
// sub-tab is active (retrieval or chat). Case-insensitive.
const historyFilterText = ref("");
const chatModeFilter = ref<"" | "condense_plus_context" | "condense_question" | "context" | "simple">("");
const chatCompactMode = ref(false);
const retrievalCompactMode = ref(false);
const retrievalConfigFilter = ref<"" | "hybrid" | "rerank" | "citations" | "plain">("");
const historyDateRange = ref<"24h" | "7d" | "30d" | "all">("all");
const historyScopeFilter = ref("");

async function loadHistory() {
  historyLoading.value = true;
  try {
    const res = await ragHistory();
    historyRecords.value = res.records ?? [];
    historyMax.value = res.max ?? 20;
  } catch { /* ignore */ }
  finally { historyLoading.value = false; }
}
async function clearHistory() {
  try {
    await ragHistoryClear();
    historyRecords.value = [];
  } catch { /* ignore */ }
}
async function loadChatTurns() {
  chatTurnsLoading.value = true;
  try {
    const res = await ragChatHistory();
    chatTurns.value = res.records ?? [];
    chatTurnsMax.value = res.max ?? 20;
  } catch { /* ignore */ }
  finally { chatTurnsLoading.value = false; }
}
async function clearChatTurns() {
  try {
    await ragChatHistoryClear();
    chatTurns.value = [];
  } catch { /* ignore */ }
}
/** Switch the History sub-tab and lazy-load chat turns on first visit. */
function switchHistoryView(v: "retrieval" | "chat") {
  historyView.value = v;
  if (v === "chat" && !chatTurns.value.length && !chatTurnsLoading.value) {
    void loadChatTurns();
  }
}
/** Re-run a past query — populate the Query tab's input + scroll back so
 *  the user can re-execute with current config. */
function reuseHistoryQuestion(q: string) {
  queryText.value = q;
  activeTab.value = "query";
}

/** Copy a recorded chat turn's streamed answer to the clipboard — useful
 *  for pasting the grounded answer into docs / a bug report / Slack. */
const chatAnswerCopiedId = ref<string | null>(null);
async function copyChatAnswer(t: RagChatTurnRecord) {
  if (!t.answer) return;
  try {
    await navigator.clipboard.writeText(t.answer);
    chatAnswerCopiedId.value = t.id;
    setTimeout(() => { if (chatAnswerCopiedId.value === t.id) chatAnswerCopiedId.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

/** Copy a recorded question (retrieval or chat) to the clipboard — mirrors
 *  copyChatAnswer for parity, so the same "copy the payload" affordance is
 *  available on question chips too. */
const copiedQId = ref<string | null>(null);
async function copyQuestion(id: string, text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedQId.value = id;
    setTimeout(() => { if (copiedQId.value === id) copiedQId.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

/** Sum of token_estimate across a chat turn's sources — surfaces how much
 *  of the LLM context window this chat turn's retrieval actually consumed,
 *  so the user can spot turns that pulled too much context. */
function chatTurnTokenBudget(t: RagChatTurnRecord): number | null {
  if (!t.sources?.length) return null;
  let sum = 0, known = 0;
  for (const s of t.sources) {
    if (s.metadata?.token_estimate != null) { sum += Number(s.metadata.token_estimate) || 0; known++; }
  }
  return known ? sum : null;
}

/** Mirror of chatTurnTokenBudget for one-shot retrieval records. */
function recordTokenBudget(r: RagQueryRecord): number | null {
  if (!r.sources?.length) return null;
  let sum = 0, known = 0;
  for (const s of r.sources) {
    if (s.metadata?.token_estimate != null) { sum += Number(s.metadata.token_estimate) || 0; known++; }
  }
  return known ? sum : null;
}
/** Copy a retrieved chunk's text — useful for pasting the grounded passage
 *  into a prompt elsewhere (Slack, doc, bug report). Stops propagation so
 *  the card-level preview click doesn't fire. */
const copiedChunkIdx = ref<number | null>(null);
async function copyChunk(idx: number, text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedChunkIdx.value = idx;
    setTimeout(() => { if (copiedChunkIdx.value === idx) copiedChunkIdx.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

/** Download the current (filter-respecting) records as a JSON file. Honors
 *  the active sub-tab and the question-substring filter so the exported
 *  payload matches what the user sees. */
function exportHistoryJSON() {
  const records = historyView.value === "retrieval" ? filteredHistoryRecords.value : filteredChatTurns.value;
  if (!records.length) return;
  const payload = {
    view: historyView.value,
    exported_at: new Date().toISOString(),
    count: records.length,
    filter: historyFilterText.value || null,
    records,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rag-${historyView.value}-history-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** CSV export. Columns differ per sub-tab: retrieval records expose config
 *  + score stats; chat turns expose chat_mode + answer (truncated). Quoting
 *  follows RFC 4180 — wrap any field containing comma/quote/newline in
 *  double quotes and escape inner quotes by doubling. */
function csvField(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function exportHistoryCSV() {
  const isRetrieval = historyView.value === "retrieval";
  const records = isRetrieval ? filteredHistoryRecords.value : filteredChatTurns.value;
  if (!records.length) return;
  const header = isRetrieval
    ? ["timestamp", "question", "scope", "top_k", "result_count", "top_score", "avg_score", "latency_ms", "hybrid", "rerank", "citations", "num_queries", "category", "tags"]
    : ["timestamp", "question", "answer", "scope", "chat_mode", "source_count", "top_score", "avg_score", "latency_ms"];
  const rows = records.map(r => {
    if (isRetrieval) {
      const rr = r as RagQueryRecord;
      return [
        rr.timestamp, rr.question, rr.scope ?? "", rr.top_k, rr.result_count,
        (rr.top_score * 100).toFixed(1) + "%", (rr.avg_score * 100).toFixed(1) + "%",
        rr.latency_ms, rr.config?.hybrid ? "yes" : "no", rr.config?.rerank ? "yes" : "no",
        rr.config?.citations ? "yes" : "no", rr.config?.num_queries ?? 1,
        rr.config?.category ?? "", (rr.config?.tags ?? []).join("|"),
      ].map(csvField).join(",");
    }
    const tt = r as RagChatTurnRecord;
    return [
      tt.timestamp, tt.question, tt.answer, tt.scope ?? "", tt.chat_mode,
      tt.source_count, (tt.top_score * 100).toFixed(1) + "%",
      (tt.avg_score * 100).toFixed(1) + "%", tt.latency_ms,
    ].map(csvField).join(",");
  });
  const csv = [header.map(csvField).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rag-${historyView.value}-history-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Question-substring filter applied to whichever sub-tab is active.
// Mirrors what the user sees — when they type in the filter input, the
// list below narrows. Also feeds the count badge in the sub-tab toggle.
// Date-range filter further narrows by r.timestamp (ISO). "all" disables.
function withinDateRange(ts: string): boolean {
  const range = historyDateRange.value;
  if (range === "all") return true;
  const t = Date.parse(ts);
  if (Number.isNaN(t)) return true; // keep unparseable timestamps (don't penalize)
  const cutoff = Date.now() - (range === "24h" ? 86_400_000 : range === "7d" ? 7 * 86_400_000 : 30 * 86_400_000);
  return t >= cutoff;
}
// Distinct scope values across retrieval + chat records. Empty scope shown as
// "(full KB)" so users can pick it explicitly. Sorted by frequency desc.
const historyScopeOptions = computed(() => {
  const counts = new Map<string, number>();
  const bump = (s: string) => counts.set(s, (counts.get(s) ?? 0) + 1);
  historyRecords.value.forEach(r => bump(r.scope ?? ""));
  chatTurns.value.forEach(t => bump(t.scope ?? ""));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([scope, count]) => ({ scope, count, label: scope || "(full KB)" }));
});
const filteredHistoryRecords = computed(() => {
  const q = historyFilterText.value.trim().toLowerCase();
  const f = retrievalConfigFilter.value;
  const sf = historyScopeFilter.value;
  return historyRecords.value.filter(r => {
    if (!withinDateRange(r.timestamp)) return false;
    if (sf && (r.scope ?? "") !== sf) return false;
    if (f === "hybrid" && !r.config?.hybrid) return false;
    if (f === "rerank" && !r.config?.rerank) return false;
    if (f === "citations" && !r.config?.citations) return false;
    if (f === "plain" && (r.config?.hybrid || r.config?.rerank)) return false;
    if (!q) return true;
    return r.question.toLowerCase().includes(q);
  });
});
const filteredChatTurns = computed(() => {
  const q = historyFilterText.value.trim().toLowerCase();
  const mode = chatModeFilter.value;
  const sf = historyScopeFilter.value;
  return chatTurns.value.filter(t => {
    if (!withinDateRange(t.timestamp)) return false;
    if (sf && (t.scope ?? "") !== sf) return false;
    if (mode && t.chat_mode !== mode) return false;
    if (!q) return true;
    if (t.question.toLowerCase().includes(q)) return true;
    // Chat turns also have an answer — let users filter by answer text.
    return t.answer.toLowerCase().includes(q);
  });
});

// Chat-mode distribution over the filtered turns. Surfaces which llama_index
// chat engine is getting the most use — useful when A/B-comparing modes.
// Returns [{mode, count, pct, color}] sorted by count desc.
const chatModeBreakdown = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const counts: Record<string, number> = {};
  for (const t of turns) {
    const m = t.chat_mode || "unknown";
    counts[m] = (counts[m] || 0) + 1;
  }
  const total = turns.length;
  const palette: Record<string, string> = {
    condense_plus_context: "var(--el-color-primary)",
    condense_question: "var(--el-color-success)",
    context: "var(--el-color-warning)",
    simple: "var(--el-text-color-secondary)",
  };
  return Object.entries(counts)
    .map(([mode, count]) => ({
      mode,
      count,
      pct: Math.round((count / total) * 100),
      color: palette[mode] || "var(--el-color-info)",
    }))
    .sort((a, b) => b.count - a.count);
});

// Chat-mode latency cost — mirrors configCost but groups by llama_index
// ChatEngine mode instead of (hybrid, rerank). Surfaces which chat engine
// is the slowest so the user can pick a cheaper mode for trivial Q&A.
const chatModeLatencyCost = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  const groups: Record<string, { sum: number; n: number; latencies: number[]; scoreSum: number }> = {};
  for (const t of turns) {
    const m = t.chat_mode || "unknown";
    if (!groups[m]) groups[m] = { sum: 0, n: 0, latencies: [], scoreSum: 0 };
    const lat = t.latency_ms || 0;
    groups[m].sum += lat;
    groups[m].n += 1;
    groups[m].latencies.push(lat);
    groups[m].scoreSum += t.top_score || 0;
  }
  const pct = (sorted: number[], p: number) => {
    if (!sorted.length) return null;
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return sorted[idx];
  };
  const baseline = groups["simple"] ? groups["simple"].sum / groups["simple"].n : null;
  const baselineP50 = groups["simple"] ? pct([...groups["simple"].latencies].sort((a, b) => a - b), 50) : null;
  const entries = Object.entries(groups)
    .map(([mode, g]) => {
      const mean = Math.round(g.sum / g.n);
      const meanScore = g.scoreSum / g.n;
      const sorted = [...g.latencies].sort((a, b) => a - b);
      const p50 = pct(sorted, 50) ?? mean;
      const p90 = pct(sorted, 90) ?? mean;
      const delta = baseline != null ? mean - Math.round(baseline) : null;
      // Efficiency = mean_score / mean_latency × 1000, then ×100 for display.
      const efficiency = mean > 0 ? Math.round((meanScore / mean) * 100000) / 100 : null;
      return {
        mode, mean, p50, p90, n: g.n,
        meanScore: Math.round(meanScore * 100),
        delta,
        deltaPct: baseline != null ? Math.round(((mean - baseline) / baseline) * 100) : null,
        p50Delta: baselineP50 != null ? p50 - baselineP50 : null,
        efficiency,
        winner: false,
      };
    })
    .sort((a, b) => a.mean - b.mean);
  // Winner = highest efficiency (best score-per-ms across chat modes).
  const maxEff = entries.reduce((m, e) => Math.max(m, e.efficiency ?? 0), 0);
  for (const e of entries) e.winner = e.efficiency != null && e.efficiency === maxEff && entries.length > 1;
  return entries.length >= 2 ? { entries, baseline: baseline != null ? Math.round(baseline) : null, baselineP50 } : null;
});

// Latency trend over the filtered chat turns. Same shape as
// historyLatencySpark so the chat sub-tab can render a parallel sparkline.
const chatLatencySpark = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  const lat = [...turns].reverse().map(t => t.latency_ms || 0);
  const max = Math.max(...lat, 1);
  const min = Math.min(...lat, 0);
  const W = 120, H = 28, pad = 3;
  const range = max - min || 1;
  const pts = lat.map((v, i) => {
    const x = pad + (i / Math.max(1, lat.length - 1)) * (W - 2 * pad);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = lat.reduce((a, b) => a + b, 0) / lat.length;
  return { pts, min, max, mean: Math.round(mean), n: lat.length, W, H };
});

// Latency (x) vs top-score (y) scatter plot for chat turns. Mirrors
// historyScatter but colors by chat_mode (categorical) rather than
// hybrid/rerank (booleans) — the dominant knob axis on the chat sub-tab.
const chatScatter = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  const W = 200, H = 80, pad = 18;
  const palette: Record<string, string> = {
    condense_plus_context: "var(--el-color-primary)",
    condense_question: "var(--el-color-success)",
    context: "var(--el-color-warning)",
    simple: "var(--el-text-color-secondary)",
  };
  const pts = turns.map(t => ({
    lat: t.latency_ms || 0,
    score: t.top_score || 0,
    id: t.id,
    mode: t.chat_mode || "unknown",
  }));
  const latencies = pts.map(p => p.lat);
  const scores = pts.map(p => p.score);
  const minLat = Math.min(...latencies);
  const maxLat = Math.max(...latencies, 1);
  const meanLat = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const minScore = Math.round(Math.min(...scores) * 100);
  const meanScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  const maxScoreVal = Math.max(...scores, 0.001);
  const maxScore = Math.round(maxScoreVal * 100);
  const dots = pts.map(p => ({
    id: p.id,
    cx: pad + (p.lat / maxLat) * (W - 2 * pad),
    cy: H - pad - (p.score / maxScoreVal) * (H - 2 * pad),
    r: 3,
    mode: p.mode,
    color: palette[p.mode] || "var(--el-color-info)",
    lat: p.lat,
    score: p.score,
  }));
  return { dots, maxLat, maxScore, minLat, meanLat, minScore, meanScore, W, H, pad, n: pts.length };
});

// Latency-over-time sparkline data. Records arrive newest-first; reverse to
// chronological so the line reads left→right. SVG points fit a 120×28 viewBox.
const historyLatencySpark = computed(() => {
  const recs = historyRecords.value;
  if (!recs.length) return null;
  const lat = [...recs].reverse().map(r => r.latency_ms || 0);
  const max = Math.max(...lat, 1);
  const min = Math.min(...lat, 0);
  const W = 120, H = 28, pad = 3;
  const range = max - min || 1;
  const pts = lat.map((v, i) => {
    const x = pad + (i / Math.max(1, lat.length - 1)) * (W - 2 * pad);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = lat.reduce((a, b) => a + b, 0) / lat.length;
  return { pts, min, max, mean: Math.round(mean), n: lat.length, W, H };
});

// Top-score-over-time sparkline. Same chronological order as the latency
// sparkline so users can correlate the two trends visually.
const historyScoreSpark = computed(() => {
  const recs = historyRecords.value;
  if (!recs.length) return null;
  const scores = [...recs].reverse().map(r => r.top_score || 0);
  const max = Math.max(...scores, 1);
  const min = Math.min(...scores, 0);
  const W = 120, H = 28, pad = 3;
  const pts = scores.map((v, i) => {
    const x = pad + (i / Math.max(1, scores.length - 1)) * (W - 2 * pad);
    const y = H - pad - (v / (max || 1)) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { pts, min, max: Math.round(max * 100), mean: Math.round(mean * 100), n: scores.length, W, H };
});

// Top-score trend over the filtered chat turns. Same shape as
// historyScoreSpark so users can correlate chat latency ↔ score trends
// side-by-side with the retrieval sub-tab's parallel sparklines.
const chatScoreSpark = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  const scores = [...turns].reverse().map(t => t.top_score || 0);
  const max = Math.max(...scores, 1);
  const min = Math.min(...scores, 0);
  const W = 120, H = 28, pad = 3;
  const pts = scores.map((v, i) => {
    const x = pad + (i / Math.max(1, scores.length - 1)) * (W - 2 * pad);
    const y = H - pad - (v / (max || 1)) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {
    pts,
    min,
    max: Math.round(max * 100),
    mean: Math.round(mean * 100),
    n: scores.length,
    W, H,
  };
});

// Token-budget-over-time sparkline. Sums metadata.token_estimate across
// retrieved sources per record — surfaces whether recent queries are
// consuming more of the LLM context window. Complements latency + score
// trends: a rising token trend with flat score may mean chunks are getting
// longer without being more relevant.
const historyTokenSpark = computed(() => {
  const recs = historyRecords.value;
  if (recs.length < 2) return null;
  const sums = [...recs].reverse().map(r => recordTokenBudget(r) ?? 0);
  if (sums.every(s => s === 0)) return null;
  const max = Math.max(...sums, 1);
  const min = Math.min(...sums, 0);
  const W = 120, H = 28, pad = 3;
  const range = max - min || 1;
  const pts = sums.map((v, i) => {
    const x = pad + (i / Math.max(1, sums.length - 1)) * (W - 2 * pad);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = Math.round(sums.reduce((a, b) => a + b, 0) / sums.length);
  return { pts, min, max, mean, n: sums.length, W, H };
});

// Mirror of historyTokenSpark for chat turns — uses chatTurnTokenBudget
// so chunk-count-by-mode changes show up as budget shifts over time.
const chatTokenSpark = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  const sums = [...turns].reverse().map(t => chatTurnTokenBudget(t) ?? 0);
  if (sums.every(s => s === 0)) return null;
  const max = Math.max(...sums, 1);
  const min = Math.min(...sums, 0);
  const W = 120, H = 28, pad = 3;
  const range = max - min || 1;
  const pts = sums.map((v, i) => {
    const x = pad + (i / Math.max(1, sums.length - 1)) * (W - 2 * pad);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = Math.round(sums.reduce((a, b) => a + b, 0) / sums.length);
  return { pts, min, max, mean, n: sums.length, W, H };
});

// Avg-score trend sparkline — avg_score per record over the filtered set.
// A downward drift flags retrieval quality degrading (KB drift, stale chunks,
// filter mismatch). Uses scoreColor for the line so color encodes quality band.
const historyScoreSparkAvg = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (recs.length < 2) return null;
  const vals = [...recs].reverse().map(r => r.avg_score ?? 0);
  const max = Math.max(...vals, 0.001);
  const min = Math.min(...vals, 0);
  const W = 120, H = 28, pad = 3;
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = pad + (i / Math.max(1, vals.length - 1)) * (W - 2 * pad);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { pts, min, max, mean, n: vals.length, W, H };
});
const chatScoreSparkAvg = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  const vals = [...turns].reverse().map(t => t.avg_score ?? 0);
  const max = Math.max(...vals, 0.001);
  const min = Math.min(...vals, 0);
  const W = 120, H = 28, pad = 3;
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = pad + (i / Math.max(1, vals.length - 1)) * (W - 2 * pad);
    const y = H - pad - ((v - min) / range) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { pts, min, max, mean, n: vals.length, W, H };
});
const scoreGradeBreakdown = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  // Grade buckets mirror MessageBubble's `retrievalGrade`: A ≥0.85, B ≥0.70,
  // C ≥0.50, D <0.50. Count every source across every record.
  const buckets = { A: 0, B: 0, C: 0, D: 0 };
  for (const r of recs) {
    for (const s of r.sources) {
      const v = s.score || 0;
      if (v >= 0.85) buckets.A++;
      else if (v >= 0.7) buckets.B++;
      else if (v >= 0.5) buckets.C++;
      else buckets.D++;
    }
  }
  const total = buckets.A + buckets.B + buckets.C + buckets.D;
  if (!total) return null;
  const palette = {
    A: "var(--el-color-success)",
    B: "var(--el-color-primary)",
    C: "var(--el-color-warning)",
    D: "var(--el-color-danger)",
  };
  return {
    buckets: (["A", "B", "C", "D"] as const).map(g => ({
      grade: g,
      count: buckets[g],
      pct: Math.round((buckets[g] / total) * 100),
      color: palette[g],
    })),
    total,
  };
});

// Mirror of scoreGradeBreakdown but for chat turns — same buckets, same
// palette, reads from filteredChatTurns so it honors the question/answer
// filter the user is typing in the chat sub-tab.
const chatScoreGradeBreakdown = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const buckets = { A: 0, B: 0, C: 0, D: 0 };
  for (const t of turns) {
    for (const s of t.sources) {
      const v = s.score || 0;
      if (v >= 0.85) buckets.A++;
      else if (v >= 0.7) buckets.B++;
      else if (v >= 0.5) buckets.C++;
      else buckets.D++;
    }
  }
  const total = buckets.A + buckets.B + buckets.C + buckets.D;
  if (!total) return null;
  const palette = {
    A: "var(--el-color-success)",
    B: "var(--el-color-primary)",
    C: "var(--el-color-warning)",
    D: "var(--el-color-danger)",
  };
  return {
    buckets: (["A", "B", "C", "D"] as const).map(g => ({
      grade: g,
      count: buckets[g],
      pct: Math.round((buckets[g] / total) * 100),
      color: palette[g],
    })),
    total,
  };
});
// Top source files by retrieval frequency — surfaces "which KB files are
// actually getting hit?". Aggregates across all filtered records, returns
// the top 5 by count. Useful for spotting dead files (never retrieved) or
// over-relied files (one chunk answering everything).
const topSourceFiles = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const counts: Record<string, { count: number; best: number; paths: Set<string> }> = {};
  for (const r of recs) {
    for (const s of r.sources) {
      const fp = s.file_path || "(unknown)";
      if (!counts[fp]) counts[fp] = { count: 0, best: 0, paths: new Set() };
      counts[fp].count += 1;
      counts[fp].best = Math.max(counts[fp].best, s.score || 0);
      counts[fp].paths.add(r.id);
    }
  }
  const total = Object.values(counts).reduce((a, c) => a + c.count, 0);
  const entries = Object.entries(counts)
    .map(([path, c]) => ({
      path,
      count: c.count,
      pct: Math.round((c.count / total) * 100),
      best: Math.round(c.best * 100),
      appearances: c.paths.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  if (!entries.length) return null;
  return { entries, totalRecords: recs.length, totalSources: total };
});

// Top stale source files — files retrieved ≥1 time whose chunks have an
// `updated`/`created` frontmatter >90 days old. Sorted by (stale appearance
// count × age days) so the most-frequently-retrieved outdated files surface
// first — those are the highest-leverage refresh/archive candidates.
// Aggregates across both retrieval records and chat turns.
const topStaleFiles = computed(() => {
  const counts = new Map<string, { count: number; ageDaysMax: number; samples: Set<string> }>();
  const bump = (s: RagSource) => {
    if (!s.metadata) return;
    const f = metaFreshness(s.metadata);
    if (!f || !f.stale) return;
    const fp = s.file_path || "(unknown)";
    if (!counts.has(fp)) counts.set(fp, { count: 0, ageDaysMax: 0, samples: new Set() });
    const e = counts.get(fp)!;
    e.count += 1;
    e.ageDaysMax = Math.max(e.ageDaysMax, f.ageDays);
  };
  for (const r of historyRecords.value) for (const s of r.sources) bump(s);
  for (const t of chatTurns.value) for (const s of t.sources) bump(s);
  const entries = Array.from(counts.entries())
    .map(([path, e]) => {
      const short = path.length > 60 ? "…" + path.slice(path.length - 57) : path;
      return {
        path,
        short,
        count: e.count,
        ageDays: e.ageDaysMax,
        ageLabel: e.ageDaysMax >= 365 ? `${Math.round(e.ageDaysMax / 30)}mo` : `${e.ageDaysMax}d`,
        score: e.count * e.ageDaysMax,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return entries.length ? entries : null;
});

// Top scoring source files — files with the highest mean top_score across
// retrieval/chat records. Surfaces which files produce the highest-quality
// chunks. Requires ≥2 records touching the file to filter noise. Aggregates
// across retrieval + chat. Sorted by mean score, top 5. Complements
// topSourceFiles (most-retrieved) and topStaleFiles (need refresh).
const topScoringFiles = computed(() => {
  const groups = new Map<string, { scores: number[]; count: number }>();
  const bump = (s: RagSource) => {
    const fp = s.file_path || "(unknown)";
    if (!groups.has(fp)) groups.set(fp, { scores: [], count: 0 });
    const g = groups.get(fp)!;
    g.scores.push(s.score || 0);
    g.count += 1;
  };
  for (const r of historyRecords.value) for (const s of r.sources) bump(s);
  for (const t of chatTurns.value) for (const s of t.sources) bump(s);
  const entries = Array.from(groups.entries())
    .filter(([, g]) => g.scores.length >= 2)
    .map(([path, g]) => {
      const mean = g.scores.reduce((a, b) => a + b, 0) / g.scores.length;
      const short = path.length > 60 ? "…" + path.slice(path.length - 57) : path;
      return {
        path, short,
        meanScore: Math.round(mean * 100),
        count: g.count,
        max: Math.round(Math.max(...g.scores) * 100),
      };
    })
    .filter(e => e.meanScore > 0)
    .sort((a, b) => b.meanScore - a.meanScore)
    .slice(0, 5);
  return entries.length ? entries : null;
});

// Coverage gap — files in the attached scope(s) that have NEVER been
// retrieved across any retrieval record or chat turn. Signals dead files
// (off-topic, poorly indexed, or never asked about) — candidates for
// removal or content improvement. Shows up to 5 with shortest path first
// (less nesting = likely top-level reference docs).
const coverageGap = computed(() => {
  if (!props.scopeFiles.length) return null;
  const retrieved = new Set<string>();
  for (const r of historyRecords.value) for (const s of r.sources) retrieved.add(s.file_path);
  for (const t of chatTurns.value) for (const s of t.sources) retrieved.add(s.file_path);
  // Loose-match: a scope file is "retrieved" if any retrieved path ends with
  // the scope file's name segment (chunks may use slightly different prefix
  // paths depending on indexer config).
  const gap: Array<{ path: string; name: string }> = [];
  for (const p of props.scopeFiles) {
    const name = p.split("/").pop() || p;
    let hit = retrieved.has(p);
    if (!hit) for (const rp of retrieved) if (rp.endsWith(name) || rp.endsWith(p)) { hit = true; break; }
    if (!hit) gap.push({ path: p, name });
  }
  if (!gap.length) return null;
  gap.sort((a, b) => a.path.length - b.path.length);
  return { entries: gap.slice(0, 5), total: gap.length, scoped: props.scopeFiles.length };
});

// Best/worst question across filtered records. Surfaces what kinds of
// questions retrieve well vs poorly — useful for understanding what the
// retriever is good at. Requires at least 2 records and excludes ties.
const bestWorstQuestion = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (recs.length < 2) return null;
  let best: RagQueryRecord | null = null;
  let worst: RagQueryRecord | null = null;
  for (const r of recs) {
    if (!best || r.top_score > best.top_score) best = r;
    if (!worst || r.top_score < worst.top_score) worst = r;
  }
  if (!best || !worst || best.id === worst.id) return null;
  return {
    best: { question: best.question, topScore: Math.round(best.top_score * 100), latency: best.latency_ms },
    worst: { question: worst.question, topScore: Math.round(worst.top_score * 100), latency: worst.latency_ms },
  };
});
// Mirror of bestWorstQuestion for chat turns.
const chatBestWorstQuestion = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  let best: RagChatTurnRecord | null = null;
  let worst: RagChatTurnRecord | null = null;
  for (const t of turns) {
    if (!best || t.top_score > best.top_score) best = t;
    if (!worst || t.top_score < worst.top_score) worst = t;
  }
  if (!best || !worst || best.id === worst.id) return null;
  return {
    best: { question: best.question, topScore: Math.round(best.top_score * 100), latency: best.latency_ms },
    worst: { question: worst.question, topScore: Math.round(worst.top_score * 100), latency: worst.latency_ms },
  };
});

// Top frontmatter tags across retrieved sources — surfaces which KB tags
// dominate the retrieval results. Useful for spotting whether the user's
// queries consistently hit one knowledge cluster (e.g. all "methodology"
// tagged chunks) which may hint at content gaps elsewhere.
const topRetrievedTags = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const counts: Record<string, number> = {};
  for (const r of recs) {
    for (const s of r.sources) {
      const tags = s.metadata?.tags;
      if (!tags) continue;
      const arr = Array.isArray(tags) ? tags : String(tags).split(/[,\s]+/).filter(Boolean);
      for (const t of arr) if (t) counts[t] = (counts[t] || 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((a, c) => a + c, 0);
  const entries = Object.entries(counts)
    .map(([tag, count]) => ({ tag, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  return entries.length ? { entries, totalHits: total, uniqueTags: Object.keys(counts).length } : null;
});

// Mean top_score across the filtered retrieval records. Surfaces whether the
// current filter set is returning high-quality hits or scraping the bottom.
// Computed alongside the latency spark so the chip can render next to "shown".
const historyMeanTopScore = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const sum = recs.reduce((a, r) => a + (r.top_score || 0), 0);
  return Math.round((sum / recs.length) * 100);
});

// Mirror of historyMeanTopScore for chat turns. Reads from filteredChatTurns
// so the chip honors the same filters as the rest of the chat sub-tab.
const chatMeanTopScore = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const sum = turns.reduce((a, t) => a + (t.top_score || 0), 0);
  return Math.round((sum / turns.length) * 100);
});

// Mean latency across filtered records. Pair chip to μ top — surfaces
// whether the current filter set is fast-but-low-quality, slow-but-accurate,
// or somewhere in between. Reuses latencyBucket for color coding.
const historyMeanLatency = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const sum = recs.reduce((a, r) => a + (r.latency_ms || 0), 0);
  return Math.round(sum / recs.length);
});
const chatMeanLatency = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const sum = turns.reduce((a, t) => a + (t.latency_ms || 0), 0);
  return Math.round(sum / turns.length);
});

// Mean token budget across filtered records. Pair chip to μ top + μ latency
// so the user sees all three quality dimensions at once: how good, how fast,
// how much context window. Returns null when sources have no token_estimate
// metadata (don't show 0 — that's misleading).
const historyMeanTokens = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  let sum = 0, seen = 0;
  for (const r of recs) {
    const b = recordTokenBudget(r);
    if (b != null) { sum += b; seen += 1; }
  }
  return seen ? Math.round(sum / seen) : null;
});

// Pearson-style correlation between token budget and latency across filtered
// retrieval records — answers "do bigger contexts make queries slower?".
// Range: −1..+1. Positive = bigger ctx → slower; ~0 = no correlation;
// negative = bigger ctx → faster (unlikely, but flags caching). Surfaces as
// a chip with τ symbol. Requires ≥3 records with both signal axes.
const historyTokenLatencyCorr = computed(() => {
  const recs = filteredHistoryRecords.value;
  const pairs: Array<[number, number]> = [];
  for (const r of recs) {
    const tb = recordTokenBudget(r);
    const lat = r.latency_ms ?? 0;
    if (tb != null && tb > 0 && lat > 0) pairs.push([tb, lat]);
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const meanTb = pairs.reduce((a, p) => a + p[0], 0) / n;
  const meanLat = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0, dTb = 0, dLat = 0;
  for (const [tb, lat] of pairs) {
    num += (tb - meanTb) * (lat - meanLat);
    dTb += (tb - meanTb) ** 2;
    dLat += (lat - meanLat) ** 2;
  }
  const denom = Math.sqrt(dTb * dLat);
  if (denom === 0) return null;
  const r = num / denom;
  // Cohen's band: |r|<0.3 negligible, <0.5 weak, <0.7 moderate, else strong.
  const abs = Math.abs(r);
  const band = abs < 0.3 ? "negligible" : abs < 0.5 ? "weak" : abs < 0.7 ? "moderate" : "strong";
  return { r, band, n };
});

// Pearson correlation between top_score and latency across filtered records.
// Answers: is the latency cost of rerank/hybrid paying off in better scores?
// Positive = slower queries → better scores (rerank worth it); ~0 = latency
// is independent of score (rerank not helping, or hybrid noise); negative =
// slower queries → worse scores (pathological, likely filter mismatch).
const historyScoreLatencyCorr = computed(() => {
  const recs = filteredHistoryRecords.value;
  const pairs: Array<[number, number]> = [];
  for (const r of recs) {
    const score = r.top_score ?? 0;
    const lat = r.latency_ms ?? 0;
    if (score > 0 && lat > 0) pairs.push([score, lat]);
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const meanS = pairs.reduce((a, p) => a + p[0], 0) / n;
  const meanL = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0, dS = 0, dL = 0;
  for (const [s, l] of pairs) {
    num += (s - meanS) * (l - meanL);
    dS += (s - meanS) ** 2;
    dL += (l - meanL) ** 2;
  }
  const denom = Math.sqrt(dS * dL);
  if (denom === 0) return null;
  const r = num / denom;
  const abs = Math.abs(r);
  const band = abs < 0.3 ? "negligible" : abs < 0.5 ? "weak" : abs < 0.7 ? "moderate" : "strong";
  return { r, band, n };
});
const chatScoreLatencyCorr = computed(() => {
  const turns = filteredChatTurns.value;
  const pairs: Array<[number, number]> = [];
  for (const t of turns) {
    const score = t.top_score ?? 0;
    const lat = t.latency_ms ?? 0;
    if (score > 0 && lat > 0) pairs.push([score, lat]);
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const meanS = pairs.reduce((a, p) => a + p[0], 0) / n;
  const meanL = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0, dS = 0, dL = 0;
  for (const [s, l] of pairs) {
    num += (s - meanS) * (l - meanL);
    dS += (s - meanS) ** 2;
    dL += (l - meanL) ** 2;
  }
  const denom = Math.sqrt(dS * dL);
  if (denom === 0) return null;
  const r = num / denom;
  const abs = Math.abs(r);
  const band = abs < 0.3 ? "negligible" : abs < 0.5 ? "weak" : abs < 0.7 ? "moderate" : "strong";
  return { r, band, n };
});

// Pearson correlation between question length (chars) and top_score across
// filtered records. Answers: should the user write longer, more specific
// questions, or are short lookup-style queries just as effective?
// Positive = longer question → better retrieval (specificity pays off);
// ~0 = length agnostic; negative = longer questions confuse the retriever
// (likely too many clauses → embedding dilution).
const historyQLenScoreCorr = computed(() => {
  const recs = filteredHistoryRecords.value;
  const pairs: Array<[number, number]> = [];
  for (const r of recs) {
    const len = r.question?.length ?? 0;
    const score = r.top_score ?? 0;
    if (len > 0 && score > 0) pairs.push([len, score]);
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const meanLen = pairs.reduce((a, p) => a + p[0], 0) / n;
  const meanS = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0, dLen = 0, dS = 0;
  for (const [len, s] of pairs) {
    num += (len - meanLen) * (s - meanS);
    dLen += (len - meanLen) ** 2;
    dS += (s - meanS) ** 2;
  }
  const denom = Math.sqrt(dLen * dS);
  if (denom === 0) return null;
  const r = num / denom;
  const abs = Math.abs(r);
  const band = abs < 0.3 ? "negligible" : abs < 0.5 ? "weak" : abs < 0.7 ? "moderate" : "strong";
  return { r, band, n };
});
const chatQLenScoreCorr = computed(() => {
  const turns = filteredChatTurns.value;
  const pairs: Array<[number, number]> = [];
  for (const t of turns) {
    const len = t.question?.length ?? 0;
    const score = t.top_score ?? 0;
    if (len > 0 && score > 0) pairs.push([len, score]);
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const meanLen = pairs.reduce((a, p) => a + p[0], 0) / n;
  const meanS = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0, dLen = 0, dS = 0;
  for (const [len, s] of pairs) {
    num += (len - meanLen) * (s - meanS);
    dLen += (len - meanLen) ** 2;
    dS += (s - meanS) ** 2;
  }
  const denom = Math.sqrt(dLen * dS);
  if (denom === 0) return null;
  const r = num / denom;
  const abs = Math.abs(r);
  const band = abs < 0.3 ? "negligible" : abs < 0.5 ? "weak" : abs < 0.7 ? "moderate" : "strong";
  return { r, band, n };
});

// Mean question length across filtered retrieval records. Surfaces whether
// the user is asking short lookup-style questions or longer multi-clause
// ones — useful when correlating question length with retrieval quality.
const historyMeanQuestionChars = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const sum = recs.reduce((a, r) => a + (r.question?.length ?? 0), 0);
  return Math.round(sum / recs.length);
});

// Mean result_count (chunks returned) per query. Tells the user whether
// top_k is overshooting (returning chunks that won't fit context window)
// or undershooting (missing relevant results). Compared against the
// configured top_k to show effective utilization.
const historyMeanSourceCount = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const sum = recs.reduce((a, r) => a + (r.result_count ?? r.sources?.length ?? 0), 0);
  return Math.round(sum / recs.length);
});
const chatMeanSourceCount = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const sum = turns.reduce((a, t) => a + (t.source_count ?? t.sources?.length ?? 0), 0);
  return Math.round(sum / turns.length);
});
const chatMeanTokens = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  let sum = 0, seen = 0;
  for (const t of turns) {
    const b = chatTurnTokenBudget(t);
    if (b != null) { sum += b; seen += 1; }
  }
  return seen ? Math.round(sum / seen) : null;
});

// Mirror of historyTokenLatencyCorr for chat turns. Same Pearson formula
// and band thresholds, just on chatTurnTokenBudget / t.latency_ms. Lets
// the user compare: chat engine may amplify ctx-vs-latency correlation
// (condense_plus_context tends to fetch more chunks → longer streaming).
const chatTokenLatencyCorr = computed(() => {
  const turns = filteredChatTurns.value;
  const pairs: Array<[number, number]> = [];
  for (const t of turns) {
    const tb = chatTurnTokenBudget(t);
    const lat = t.latency_ms ?? 0;
    if (tb != null && tb > 0 && lat > 0) pairs.push([tb, lat]);
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const meanTb = pairs.reduce((a, p) => a + p[0], 0) / n;
  const meanLat = pairs.reduce((a, p) => a + p[1], 0) / n;
  let num = 0, dTb = 0, dLat = 0;
  for (const [tb, lat] of pairs) {
    num += (tb - meanTb) * (lat - meanLat);
    dTb += (tb - meanTb) ** 2;
    dLat += (lat - meanLat) ** 2;
  }
  const denom = Math.sqrt(dTb * dLat);
  if (denom === 0) return null;
  const r = num / denom;
  const abs = Math.abs(r);
  const band = abs < 0.3 ? "negligible" : abs < 0.5 ? "weak" : abs < 0.7 ? "moderate" : "strong";
  return { r, band, n };
});

// Distinct-question count across filtered records. Useful when a user is
// iterating on the same question across configs/scopes — surfaces "of N
// shown, only M unique questions". Normalized lowercase + trimmed so
// "Foo?" and "foo" collapse to the same question.
const historyDistinctQuestions = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (recs.length < 2) return null;
  const set = new Set<string>();
  for (const r of recs) set.add(r.question.trim().toLowerCase());
  return { distinct: set.size, total: recs.length };
});
const chatDistinctQuestions = computed(() => {
  const turns = filteredChatTurns.value;
  if (turns.length < 2) return null;
  const set = new Set<string>();
  for (const t of turns) set.add(t.question.trim().toLowerCase());
  return { distinct: set.size, total: turns.length };
});

// Zero-result rate: how often retrieval/chat returns no sources at all.
// A high zero-rate signals KB gaps, overly-strict metadata filters, or
// off-topic questions — distinct from low-score results (which at least
// matched something). Surfaces as "X/Y 0-res (Z%)" chip.
const historyZeroResultRate = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const zero = recs.filter(r => !r.sources || r.sources.length === 0).length;
  return { zero, total: recs.length, pct: Math.round((zero / recs.length) * 100) };
});
const chatZeroResultRate = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const zero = turns.filter(t => !t.sources || t.sources.length === 0).length;
  return { zero, total: turns.length, pct: Math.round((zero / turns.length) * 100) };
});

// Slow-query rate: count of records/turns with latency_ms >= 5000 (the
// "very slow" latency bucket). A high slow-rate flags backend perf
// degradation, oversized contexts, or rerank/hybrid overhead piling up.
const historySlowRate = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  const slow = recs.filter(r => (r.latency_ms ?? 0) >= 5000).length;
  return { slow, total: recs.length, pct: Math.round((slow / recs.length) * 100) };
});
const chatSlowRate = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const slow = turns.filter(t => (t.latency_ms ?? 0) >= 5000).length;
  return { slow, total: turns.length, pct: Math.round((slow / turns.length) * 100) };
});

// Mean answer length across filtered chat turns. Surfaces how verbose the
// chat engine answers are on average — useful when comparing chat modes
// (verbose vs terse). Humanized via 1k suffix for big answers.
const chatMeanAnswerChars = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const sum = turns.reduce((a, t) => a + (t.answer?.length ?? 0), 0);
  return Math.round(sum / turns.length);
});

// Mean question length across filtered chat turns. Mirrors the retrieval-side
// μ qchars chip so the user can compare question style across surfaces —
// chat turns often have longer multi-clause questions than one-shot retrieval.
const chatMeanQuestionChars = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const sum = turns.reduce((a, t) => a + (t.question?.length ?? 0), 0);
  return Math.round(sum / turns.length);
});

// Stale-source warning for chat history. Counts turns whose retrieved
// sources include at least one chunk >90 days old (per frontmatter
// updated/created). Surfaces KB freshness issues at a glance — if many
// turns lean on stale chunks, the user should rebuild the index.
const chatStaleTurnCount = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  let n = 0;
  for (const t of turns) {
    const hasStale = t.sources.some(s => metaFreshness(s.metadata)?.stale);
    if (hasStale) n += 1;
  }
  return { stale: n, total: turns.length, pct: Math.round((n / turns.length) * 100) };
});

// Mirror of chatStaleTurnCount for retrieval records — same freshness
// signal but for one-shot RAG queries. Same threshold (>90 days).
const retrievalStaleRecordCount = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (!recs.length) return null;
  let n = 0;
  for (const r of recs) {
    const hasStale = r.sources.some(s => metaFreshness(s.metadata)?.stale);
    if (hasStale) n += 1;
  }
  return { stale: n, total: recs.length, pct: Math.round((n / recs.length) * 100) };
});

// KB content freshness — the most recent `updated` (or `created`) timestamp
// across all retrieved sources in history. Distinct from index_last_built:
// index freshness is "when was the vector index last rebuilt", KB content
// freshness is "when did anyone last edit a markdown file the retriever
// pulls from". Useful for spotting stale content even when the index is
// freshly rebuilt. Returns null when no source has a parseable timestamp.
const kbContentFreshness = computed(() => {
  let newest: number | null = null;
  for (const r of historyRecords.value) {
    for (const s of r.sources) {
      const iso = s.metadata?.updated || s.metadata?.created;
      if (!iso) continue;
      const t = Date.parse(String(iso));
      if (!Number.isNaN(t) && (newest == null || t > newest)) newest = t;
    }
  }
  if (newest == null) return null;
  return indexFreshness(new Date(newest).toISOString());
});

// Queries-per-scope popularity. Counts how many retrieval records + chat
// turns queried each distinct scope substring. Surfaces "which KB slices
// do I actually use?" — complements the Coverage bar (which shows what's
// IN the KB) with user-behavior data (which slices the retriever hits).
// Returns null when fewer than 2 distinct scopes appear.
const scopePopularity = computed(() => {
  const counts = new Map<string, { count: number; recLat: number[]; topScore: number[] }>();
  const bump = (scope: string, lat: number, top: number) => {
    const k = scope || "(full KB)";
    if (!counts.has(k)) counts.set(k, { count: 0, recLat: [], topScore: [] });
    const e = counts.get(k)!;
    e.count += 1;
    e.recLat.push(lat);
    e.topScore.push(top);
  };
  for (const r of historyRecords.value) bump(r.scope ?? "", r.latency_ms || 0, r.top_score || 0);
  for (const t of chatTurns.value) bump(t.scope ?? "", t.latency_ms || 0, t.top_score || 0);
  if (counts.size < 2) return null;
  const total = Array.from(counts.values()).reduce((a, c) => a + c.count, 0);
  const entries = Array.from(counts.entries())
    .map(([scope, e]) => ({
      scope,
      count: e.count,
      pct: Math.round((e.count / total) * 100),
      meanLat: Math.round(e.recLat.reduce((a, b) => a + b, 0) / e.recLat.length),
      meanTop: Math.round((e.topScore.reduce((a, b) => a + b, 0) / e.topScore.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  return { entries, total, unique: counts.size };
});

// Top 3 most-repeated questions across retrieval + chat history. Surfaces
// questions the user keeps coming back to — usually A/B config-tuning cycles
// or recurring lookup patterns. Avg top_score per question shows whether the
// repeated attempts are converging on a satisfying answer (high avg) or still
// struggling (low avg = KB gap). Normalized lowercase + trimmed so "Foo?" and
// "foo" collapse to the same question.
const topRepeatedQuestions = computed(() => {
  const counts = new Map<string, { count: number; topScore: number[]; lat: number[]; sample: string }>();
  const bump = (q: string, top: number, lat: number) => {
    if (!q) return;
    const k = q.trim().toLowerCase();
    if (!k) return;
    if (!counts.has(k)) counts.set(k, { count: 0, topScore: [], lat: [], sample: q.trim() });
    const e = counts.get(k)!;
    e.count += 1;
    e.topScore.push(top);
    e.lat.push(lat);
  };
  for (const r of historyRecords.value) bump(r.question ?? "", r.top_score || 0, r.latency_ms || 0);
  for (const t of chatTurns.value) bump(t.question ?? "", t.top_score || 0, t.latency_ms || 0);
  const entries = Array.from(counts.entries())
    .filter(([, e]) => e.count >= 2)
    .map(([k, e]) => ({
      key: k,
      sample: e.sample.length > 60 ? e.sample.slice(0, 57) + "…" : e.sample,
      count: e.count,
      meanTop: Math.round((e.topScore.reduce((a, b) => a + b, 0) / e.topScore.length) * 100),
      meanLat: Math.round(e.lat.reduce((a, b) => a + b, 0) / e.lat.length),
    }))
    .sort((a, b) => b.count - a.count || b.meanTop - a.meanTop)
    .slice(0, 3);
  return entries.length ? entries : null;
});
// Mirror of topSourceFiles but for chat turns — surfaces which KB files
// the chat engine pulls from most. Reads from filteredChatTurns so the
// honors the question/answer filter.
const chatTopSourceFiles = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const counts: Record<string, { count: number; best: number; paths: Set<string> }> = {};
  for (const t of turns) {
    for (const s of t.sources) {
      const fp = s.file_path || "(unknown)";
      if (!counts[fp]) counts[fp] = { count: 0, best: 0, paths: new Set() };
      counts[fp].count += 1;
      counts[fp].best = Math.max(counts[fp].best, s.score || 0);
      counts[fp].paths.add(t.id);
    }
  }
  const total = Object.values(counts).reduce((a, c) => a + c.count, 0);
  const entries = Object.entries(counts)
    .map(([path, c]) => ({
      path,
      count: c.count,
      pct: Math.round((c.count / total) * 100),
      best: Math.round(c.best * 100),
      appearances: c.paths.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  if (!entries.length) return null;
  return { entries, totalTurns: turns.length, totalSources: total };
});

// Mirror of topRetrievedTags for chat turns — surfaces which frontmatter
// tags the chat engine consistently pulls from. Reads from filteredChatTurns.
const chatTopRetrievedTags = computed(() => {
  const turns = filteredChatTurns.value;
  if (!turns.length) return null;
  const counts: Record<string, number> = {};
  for (const t of turns) {
    for (const s of t.sources) {
      const tags = s.metadata?.tags;
      if (!tags) continue;
      const arr = Array.isArray(tags) ? tags : String(tags).split(/[,\s]+/).filter(Boolean);
      for (const tag of arr) if (tag) counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((a, c) => a + c, 0);
  const entries = Object.entries(counts)
    .map(([tag, count]) => ({ tag, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  return entries.length ? { entries, totalHits: total, uniqueTags: Object.keys(counts).length } : null;
});

// Config cost breakdown — mean latency per (hybrid, rerank) combination,
// relative to the plain-vector baseline. Surfaces the latency cost of each
// llama_index postprocessor (hybrid fusion + LLM rerank) so the user can
// decide whether the quality bump is worth the latency bump.
const configCost = computed(() => {
  const recs = filteredHistoryRecords.value;
  if (recs.length < 2) return null;
  const groups: Record<string, { sum: number; n: number; latencies: number[]; scoreSum: number }> = {};
  for (const r of recs) {
    const h = !!r.config?.hybrid, re = !!r.config?.rerank;
    const key = `${h ? "H" : "-"}${re ? "R" : "-"}`;
    if (!groups[key]) groups[key] = { sum: 0, n: 0, latencies: [], scoreSum: 0 };
    const lat = r.latency_ms || 0;
    groups[key].sum += lat;
    groups[key].n += 1;
    groups[key].latencies.push(lat);
    groups[key].scoreSum += r.top_score || 0;
  }
  const pct = (sorted: number[], p: number) => {
    if (!sorted.length) return null;
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return sorted[idx];
  };
  const baseline = groups["--"] ? groups["--"].sum / groups["--"].n : null;
  const baselineP50 = groups["--"] ? pct([...groups["--"].latencies].sort((a, b) => a - b), 50) : null;
  const order = ["--", "H-", "-R", "HR"];
  const entries = order
    .filter(k => groups[k])
    .map(k => {
      const mean = Math.round(groups[k].sum / groups[k].n);
      const meanScore = groups[k].scoreSum / groups[k].n;
      const sorted = [...groups[k].latencies].sort((a, b) => a - b);
      const p50 = pct(sorted, 50) ?? mean;
      const p90 = pct(sorted, 90) ?? mean;
      const label = k === "--" ? "plain" : k === "H-" ? "hybrid" : k === "-R" ? "rerank" : "hybrid+rerank";
      const delta = baseline != null ? mean - Math.round(baseline) : null;
      // Efficiency = mean_score / mean_latency × 1000. Higher = better quality per ms.
      const efficiency = mean > 0 ? Math.round((meanScore / mean) * 100000) / 100 : null;
      return {
        key: k, label, mean, p50, p90, n: groups[k].n,
        meanScore: Math.round(meanScore * 100),
        delta,
        deltaPct: baseline != null ? Math.round(((mean - baseline) / baseline) * 100) : null,
        p50Delta: baselineP50 != null ? p50 - baselineP50 : null,
        efficiency,
        winner: false,
      };
    });
  // Winner = highest efficiency (best score-per-ms). Mark with `winner: true`.
  const maxEff = entries.reduce((m, e) => Math.max(m, e.efficiency ?? 0), 0);
  for (const e of entries) e.winner = e.efficiency != null && e.efficiency === maxEff && entries.length > 1;
  return entries.length >= 2 ? { entries, baseline: baseline != null ? Math.round(baseline) : null, baselineP50 } : null;
});
const historyScatter = computed(() => {
  const recs = historyRecords.value;
  if (recs.length < 2) return null;
  const W = 200, H = 80, pad = 18;
  const pts = recs.map(r => ({ lat: r.latency_ms || 0, score: r.top_score || 0, id: r.id, hybrid: r.config?.hybrid, rerank: r.config?.rerank }));
  const latencies = pts.map(p => p.lat);
  const scores = pts.map(p => p.score);
  const minLat = Math.min(...latencies);
  const maxLat = Math.max(...latencies, 1);
  const meanLat = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const minScore = Math.round(Math.min(...scores) * 100);
  const meanScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  const maxScoreVal = Math.max(...scores, 0.001);
  const maxScore = Math.round(maxScoreVal * 100);
  const dots = pts.map(p => ({
    id: p.id,
    cx: pad + (p.lat / maxLat) * (W - 2 * pad),
    cy: H - pad - (p.score / maxScoreVal) * (H - 2 * pad),
    r: 3,
    hybrid: !!p.hybrid,
    rerank: !!p.rerank,
    lat: p.lat,
    score: p.score,
  }));
  return { dots, maxLat, maxScore, minLat, meanLat, minScore, meanScore, W, H, pad, n: pts.length };
});

async function loadCategories() {
  if (kbCategories.value) return;
  queryTagsLoading.value = true;
  try {
    kbCategories.value = await ragCategories();
  } catch { /* ignore */ }
  finally { queryTagsLoading.value = false; }
}
const categoryOptions = computed(() => (kbCategories.value?.categories ?? []).map(c => c.name));
const tagOptions = computed(() => Object.entries(kbCategories.value?.tags ?? {})
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({ name, count })));
/** True when any metadata filter is active — disables hybrid + Q-variants. */
const hasMetaFilter = computed(() => !!queryCategory.value || queryTags.value.length > 0);

// `true` after status.config has been applied to the toggles, so we don't
// clobber the user's toggle when a stale loadStatus resolves.
let overridesSeeded = false;
async function loadStatus() {
  try {
    status.value = await ragStatus();
    if (!overridesSeeded && status.value?.config) {
      queryHybrid.value = !!status.value.config.hybrid_retrieval;
      queryRerank.value = !!status.value.config.rerank_enabled;
      queryCitations.value = !!status.value.config.inline_citations;
      overridesSeeded = true;
    }
  } catch { /* */ }
}
async function doRebuild() { building.value = true; try { await ragBuild(); await loadStatus(); } finally { building.value = false; } }
const configCopied = ref(false);
async function copyConfigJSON() {
  const cfg = status.value?.config;
  if (!cfg) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(cfg, null, 2));
    configCopied.value = true;
    setTimeout(() => (configCopied.value = false), 1800);
  } catch { /* clipboard unavailable */ }
}

async function doQuery() {
  const q = queryText.value.trim(); if (!q) return;
  queryLoading.value = true; queryError.value = ""; querySources.value = [];
  const t0 = performance.now();
  try {
    const scope = derivedScope.value || undefined;
    // Metadata filters disable hybrid (BM25 doesn't support them) — mirror
    // backend _build_retriever gating. Effective hybrid = user toggle AND
    // no metadata filter active.
    const effectiveHybrid = queryHybrid.value && !hasMetaFilter.value;
    const effectiveNumQueries = effectiveHybrid && !hasScope.value ? queryNumQueries.value : 1;
    const res = await ragQuery({
      question: q,
      top_k: queryTopK.value,
      hybrid: effectiveHybrid,
      rerank: queryRerank.value,
      citations: queryCitations.value,
      num_queries: effectiveNumQueries,
      ...(scope ? { scope } : {}),
      ...(queryCategory.value ? { category: queryCategory.value } : {}),
      ...(queryTags.value.length ? { tags: queryTags.value } : {})
    });
    querySources.value = res.sources ?? [];
    queryLatency.value = Math.round(performance.now() - t0);
  } catch (e: any) { queryError.value = e?.message || "Query failed"; }
  finally { queryLoading.value = false; hasSearched.value = true; void loadHistory(); }
}

function scorePct(s: number): string { return `${(s * 100).toFixed(0)}%`; }
function scoreColor(s: number): string {
  if (s >= 0.7) return "var(--el-color-success)";
  if (s >= 0.4) return "var(--el-color-warning)";
  return "var(--el-text-color-secondary)";
}
function scoreLvl(s: number): string { return s >= 0.7 ? "high" : s >= 0.4 ? "mid" : "low"; }
function scoreW(s: number): string { return `${Math.round(s * 100)}%`; }
/** Latency bucket + color for the Query results header. Absolute thresholds
 *  so it works without history loaded; relative comparison is layered into
 *  the tooltip when history data is available. */
function latencyBucket(ms: number): { color: string; label: string } {
  if (ms <= 0) return { color: "var(--el-text-color-placeholder)", label: "—" };
  if (ms < 300) return { color: "var(--el-color-success)", label: "fast" };
  if (ms < 1500) return { color: "var(--el-color-primary)", label: "ok" };
  if (ms < 5000) return { color: "var(--el-color-warning)", label: "slow" };
  return { color: "var(--el-color-danger)", label: "very slow" };
}
/** Index freshness bucket — converts last_built_at (ISO) into a label +
 *  color so users see at a glance whether the index might be stale.
 *  Thresholds: fresh <1h, recent <24h, stale <7d, very stale otherwise. */
function indexFreshness(iso?: string): { color: string; label: string; age: string } | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const ms = Date.now() - t;
  if (ms < 0) return { color: "var(--el-color-success)", label: "fresh", age: "just now" };
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  const age = days > 0 ? `${days}d ago` : hrs > 0 ? `${hrs}h ago` : `${mins}m ago`;
  if (ms < 3600000) return { color: "var(--el-color-success)", label: "fresh", age };
  if (ms < 86400000) return { color: "var(--el-color-primary)", label: "recent", age };
  if (ms < 7 * 86400000) return { color: "var(--el-color-warning)", label: "stale", age };
  return { color: "var(--el-color-danger)", label: "very stale", age };
}
/** Human-readable bytes — KB/MB/GB with 1 decimal. Used for persist_dir_size. */
function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function snippet(text: string, max = 140): string { return text.length > max ? text.slice(0, max) + "…" : text; }

function tagsArray(meta: RagSource["metadata"] | undefined): string[] {
  if (!meta?.tags) return [];
  if (Array.isArray(meta.tags)) return meta.tags as string[];
  return String(meta.tags).split(/[,\s]+/).filter(Boolean);
}
function metaCharCount(meta: RagSource["metadata"] | undefined): number | null {
  const n = meta?.char_count;
  return typeof n === "number" ? n : null;
}
function metaTokenEstimate(meta: RagSource["metadata"] | undefined): number | null {
  const n = meta?.token_estimate;
  return typeof n === "number" ? n : null;
}

// Source freshness helper — parses `updated` (or `created` fallback) from
// frontmatter and returns an age descriptor. Used to flag stale chunks in
// the result cards so the user knows the retrieved content may be outdated.
function metaFreshness(meta: RagSource["metadata"] | undefined): { ageDays: number; label: string; stale: boolean } | null {
  const iso = meta?.updated || meta?.created;
  if (!iso) return null;
  const t = Date.parse(String(iso));
  if (Number.isNaN(t)) return null;
  const ageDays = Math.floor((Date.now() - t) / 86400000);
  let label: string;
  if (ageDays < 1) label = "today";
  else if (ageDays < 7) label = `${ageDays}d`;
  else if (ageDays < 30) label = `${Math.floor(ageDays / 7)}w`;
  else if (ageDays < 365) label = `${Math.floor(ageDays / 30)}mo`;
  else label = `${Math.floor(ageDays / 365)}y`;
  return { ageDays, label, stale: ageDays > 90 };
}

// ── Decompose (SubQuestionQueryEngine) ──
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
  dqRagSourcesRefs.value = [];
  dqAggRagSourcesRef.value = null;
  const t0 = performance.now();
  try {
    const scope = derivedScope.value || undefined;
    const res = await ragDecompose({
      question: q,
      sub_q_top_k: dqTopK.value,
      ...(scope ? { scope } : {}),
      ...(queryCategory.value ? { category: queryCategory.value } : {}),
      ...(queryTags.value.length ? { tags: queryTags.value } : {})
    });
    dqResult.value = { original: res.original, synthesis: res.synthesis, sub_questions: res.sub_questions ?? [] };
    if (res.error) dqError.value = res.error;
    dqLatency.value = Math.round(performance.now() - t0);
  } catch (e: any) { dqError.value = e?.message || "Decompose failed"; }
  finally { dqLoading.value = false; }
}

// Per-sub-question RagSources refs so inline citation chips in each
// sub-answer can focus the matching source chip in the same sub-Q's list.
const dqRagSourcesRefs = ref<Array<InstanceType<typeof RagSources> | null>>([]);
const dqAggRagSourcesRef = ref<InstanceType<typeof RagSources> | null>(null);

/** Aggregated unique sources across all sub-questions — dedup by
 *  (file_path, text-prefix) so chunks retrieved by multiple sub-Qs show
 *  once, sorted by best score. Surfaces what SubQuestionQueryEngine
 *  retrieved overall, separate from per-sub-Q breakdown. */
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

/** Rendered HTML for a sub-question's answer with `[N]` tokens turned into
 *  clickable citation chips. Uses the sub-Q's own sources for the mapping
 *  so `[1]` in the answer points at the 1st source of that sub-Q. */
function dqAnswerHtml(i: number): string {
  const sq = dqResult.value?.sub_questions[i];
  if (!sq) return "";
  return sq.sources.length ? injectCitations(render(sq.answer), sq.sources.length) : render(sq.answer);
}

/** Per-sub-Q score stats — surfaces top + mean relevance score so the
 *  user can tell which sub-questions were well-grounded vs speculative.
 *  Mirrors the RagSources summary stat but at the sub-Q level. */
function dqSubQStats(i: number): { top: number; mean: number; n: number } | null {
  const sq = dqResult.value?.sub_questions[i];
  if (!sq || !sq.sources.length) return null;
  const scores = sq.sources.map(s => s.score);
  const top = Math.max(...scores);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { top, mean, n: scores.length };
}

// Index of the sub-Q with the highest top_score. Renders a "best" badge on
// the matching sub-Q so the user can spot which branch the
// SubQuestionQueryEngine retrieved the strongest chunks for. Ties → first
// match wins. Returns null when fewer than 2 sub-Qs have sources.
const dqBestIdx = computed<number | null>(() => {
  const subs = dqResult.value?.sub_questions ?? [];
  if (subs.length < 2) return null;
  let bestI: number | null = null;
  let bestTop = -1;
  for (let i = 0; i < subs.length; i++) {
    const st = dqSubQStats(i);
    if (st && st.top > bestTop) { bestTop = st.top; bestI = i; }
  }
  return bestI != null && bestTop >= 0 ? bestI : null;
});

// Index of the sub-Q with the lowest top_score — mirrors dqBestIdx so the
// user can also see the weakest branch (a hint to rephrase the sub-question
// or seed more content for that topic). Only counts sub-Qs that returned
// sources; sub-Qs with no sources are excluded from the worst candidate.
const dqWorstIdx = computed<number | null>(() => {
  const subs = dqResult.value?.sub_questions ?? [];
  if (subs.length < 2) return null;
  let worstI: number | null = null;
  let worstTop = 2; // >1 guard so first source-bearing sub-Q sets the floor
  for (let i = 0; i < subs.length; i++) {
    const st = dqSubQStats(i);
    if (st && st.top < worstTop) { worstTop = st.top; worstI = i; }
  }
  // Don't show "worst" if it's the same as best (single source-bearing sub-Q).
  return worstI != null && worstI !== dqBestIdx.value ? worstI : null;
});

// Aggregate stats across all decompose sub-Qs — surfaces total sources
// retrieved and the best cosine score anywhere, so the user can spot when
// SubQuestionQueryEngine hit weak chunks in any branch.
const dqAggregate = computed(() => {
  const subs = dqResult.value?.sub_questions ?? [];
  if (!subs.length) return null;
  let totalSrc = 0, bestTop = 0, withSrc = 0, scoreSum = 0, scoreSeen = 0;
  for (let i = 0; i < subs.length; i++) {
    const st = dqSubQStats(i);
    if (st) {
      totalSrc += st.n;
      bestTop = Math.max(bestTop, st.top);
      scoreSum += st.top;
      scoreSeen += 1;
      withSrc++;
    }
  }
  const meanTop = scoreSeen ? Math.round((scoreSum / scoreSeen) * 100) : null;
  // Mean sources per sub-Q (only counts sub-Qs that returned sources).
  const meanSrc = withSrc ? Math.round((totalSrc / withSrc) * 10) / 10 : null;
  return { totalSrc, bestTop: Math.round(bestTop * 100), meanTop, meanSrc, withSrc, total: subs.length };
});

/** Expand + scroll to a sub-Q in the list — called from the flow diagram
 *  nodes (top of decompose result) so the user can jump to a branch. */
function jumpToSubQ(i: number) {
  dqExpanded.value = new Set(dqExpanded.value).add(i);
  setTimeout(() => {
    document.getElementById(`rc-dq-item-${i}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 50);
}

/** Bulk-expand / bulk-collapse all decompose sub-Qs. Useful when the
 *  SubQuestionQueryEngine returned several branches and the user wants
 *  to scan all answers + sources at once, or focus on just the flow. */
function expandAllDq() {
  const n = dqResult.value?.sub_questions?.length ?? 0;
  dqExpanded.value = new Set(Array.from({ length: n }, (_, i) => i));
}
function collapseAllDq() {
  dqExpanded.value = new Set();
}

/** Copy a sub-question's synthesized answer — mirrors copyChatAnswer so
 *  the same "grab the grounded passage" affordance exists per decompose
 *  branch. Stops propagation so the row click doesn't toggle. */
const copiedDqIdx = ref<number | null>(null);
async function copyDqAnswer(i: number, text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedDqIdx.value = i;
    setTimeout(() => { if (copiedDqIdx.value === i) copiedDqIdx.value = null; }, 1800);
  } catch { /* clipboard unavailable */ }
}

/** Copy the final synthesis answer — the SubQuestionQueryEngine's combined
 *  output across all sub-Qs. Mirrors the per-branch copyDqAnswer for the
 *  top-level synthesis block. */
const copiedSynth = ref(false);
async function copySynthesis(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedSynth.value = true;
    setTimeout(() => (copiedSynth.value = false), 1800);
  } catch { /* clipboard unavailable */ }
}

/** Drill a sub-question into the Query tab — pre-fills queryText, switches
 *  tab, and auto-runs the retrieval so the user can inspect this sub-Q's
 *  chunks with full metadata filters / knobs. Bridges SubQuestionQueryEngine
 *  output → vector retrieval drill-down. */
function runSubQAsQuery(i: number) {
  const sq = dqResult.value?.sub_questions?.[i];
  if (!sq?.sub_q) return;
  queryText.value = sq.sub_q;
  activeTab.value = "query";
  void doQuery();
}

/** Click delegation for a sub-Q's answer container — routes `.cite-chip`
 *  clicks to the matching RagSources.focusSource on that sub-Q's ref. */
function onDqAnswerClick(i: number, e: MouseEvent): void {
  makeCitationClickHandler(() => dqRagSourcesRefs.value[i])(e);
}

// ── File preview ──
const { render } = useMarkdown();
const fp = ref({ visible: false, title: "", loading: false, html: "" });
async function preview(path: string) {
  fp.value = { visible: true, title: path.split("/").pop() || path, loading: true, html: "" };
  try { const r = await readKnowledgeFile(path); fp.value.html = render(r.content || ""); }
  catch { fp.value.html = "<p style='color:var(--el-color-danger)'>Failed to load.</p>"; }
  finally { fp.value.loading = false; }
}

loadStatus();
loadCategories();
// Pre-load history so the Query tab's latency badge can compare against
// the recent mean without waiting for the user to open the History tab.
void loadHistory();
</script>

<template>
  <el-dialog
    :model-value="true"
    :title="scopeTitle ? `RAG — ${scopeTitle}` : 'RAG Console'"
    width="920px" top="2vh"
    append-to-body :close-on-click-modal="false"
    @close="emit('close')"
  >
    <!-- Context bar -->
    <div class="rc-ctx" :class="{ 'rc-ctx--on': hasScope }">
      <div class="rc-ctx-top">
        <span class="rc-ctx-icon">📚</span>
        <span class="rc-ctx-n">{{ scopeFiles.length }} context file(s)</span>
        <code v-if="hasScope" class="rc-ctx-scope">{{ derivedScope || 'mixed' }}</code>
        <span v-else class="rc-ctx-empty-tag">No context files attached</span>
      </div>
      <div v-if="hasScope" class="rc-ctx-list">
        <template v-for="[dir, files] in scopeFileGroups" :key="dir">
          <span class="rc-ctx-dir">{{ dir }}/</span>
          <span
            v-for="f in files" :key="f.path"
            class="rc-ctx-file" @click="preview(f.path)"
            :title="f.path"
          >{{ f.name }}</span>
        </template>
      </div>
    </div>

    <!-- Tabs -->
    <div class="rc-tabs">
      <button class="rc-tab" :class="{ on: activeTab === 'query' }" @click="activeTab = 'query'">
        <el-icon><Search /></el-icon> Query
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'decompose' }" @click="activeTab = 'decompose'">
        <el-icon><Scissor /></el-icon> Decompose
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'index' }" @click="activeTab = 'index'">
        <el-icon><Files /></el-icon> Index
      </button>
      <button
        class="rc-tab"
        :class="{ on: activeTab === 'history' }"
        @click="activeTab = 'history'; if (!historyRecords.length && !historyLoading) loadHistory()"
      >
        <el-icon><Clock /></el-icon> History
        <span v-if="historyRecords.length" class="rc-tab-count">{{ historyRecords.length }}</span>
      </button>
    </div>

    <!-- ═══ Query ═══ -->
    <div v-if="activeTab === 'query'" class="rc-body">
      <div class="rc-search">
        <el-input
          v-model="queryText" size="large" clearable
          :placeholder="hasScope ? `Search within ${scopeFiles.length} context file(s)…` : 'No context files to search'"
          :disabled="!hasScope"
          @keydown.enter="doQuery"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
          <template #append>
            <el-button :icon="Search" :loading="queryLoading" type="primary" :disabled="!hasScope" @click="doQuery">Search</el-button>
          </template>
        </el-input>
        <div class="rc-search-opts">
          <label><span>Top-K</span><el-input-number v-model="queryTopK" :min="1" :max="20" size="small" controls-position="right" style="width:76px" /></label>
          <label :title="queryHybrid && !hasScope && !hasMetaFilter ? 'Number of LLM-generated query variants for reciprocal-rank fusion' : 'Only honored when hybrid is on and no metadata filter'">
            <span>Q-variants</span>
            <el-input-number v-model="queryNumQueries" :min="1" :max="5" size="small" controls-position="right" style="width:68px" :disabled="!queryHybrid || hasScope || hasMetaFilter" />
          </label>
          <span class="rc-toggles">
            <button class="rc-toggle" :class="{ on: queryHybrid }" :disabled="!!hasScope || hasMetaFilter" :title="(hasScope ? 'Hybrid disabled — BM25 cannot filter by scope; ' : hasMetaFilter ? 'Hybrid disabled — BM25 cannot filter by metadata; ' : '') + 'Vector + BM25 reciprocal-rank fusion'" @click="queryHybrid = !queryHybrid">hybrid</button>
            <button class="rc-toggle" :class="{ on: queryRerank }" title="LLMRerank postprocessor (extra LLM call)" @click="queryRerank = !queryRerank">rerank</button>
            <button class="rc-toggle" :class="{ on: queryCitations }" title="Prepend [Source N] to each chunk" @click="queryCitations = !queryCitations">citations</button>
          </span>
          <span v-if="hasScope" class="rc-scope-badge"><el-icon><FolderOpened /></el-icon><code>{{ derivedScope || 'all' }}</code></span>
        </div>
        <!-- Metadata filters — llama_index MetadataFilters on frontmatter -->
        <div class="rc-meta-filters">
          <label class="rc-meta-field">
            <span class="rc-meta-label">category</span>
            <el-select
              v-model="queryCategory"
              size="small"
              clearable
              filterable
              placeholder="All categories"
              style="width:170px"
              :loading="queryTagsLoading"
            >
              <el-option
                v-for="cat in categoryOptions"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
          </label>
          <label class="rc-meta-field">
            <span class="rc-meta-label">tags</span>
            <el-select
              v-model="queryTags"
              size="small"
              clearable
              filterable
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="All tags"
              style="width:240px"
              :loading="queryTagsLoading"
            >
              <el-option
                v-for="t in tagOptions"
                :key="t.name"
                :label="`#${t.name} (${t.count})`"
                :value="t.name"
              />
            </el-select>
          </label>
          <span v-if="hasMetaFilter" class="rc-meta-warn" :title="'Metadata filters disable hybrid retrieval (BM25 does not support them)'">hybrid off</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="queryLoading" class="rc-loading">
        <div class="rc-loading-dots"><span /><span /><span /></div>
        <span>Searching…</span>
      </div>

      <div v-else-if="queryError" class="rc-err">{{ queryError }}</div>

      <!-- Results -->
      <div v-else-if="querySources.length" class="rc-results">
        <div class="rc-results-hd">
          <span class="rc-results-stat">
            {{ filteredQuerySources.length }}/{{ querySources.length }} result(s)
            <span v-if="filteredQuerySources.length < querySources.length" class="rc-results-filtered">· filtered</span>
            <span v-if="queryHideStale && staleHiddenCount" class="rc-results-filtered" :title="`${staleHiddenCount} chunk(s) >90 days old hidden`">· {{ staleHiddenCount }} stale</span>
          </span>
          <span
            class="rc-results-stat rc-results-latency"
            :style="{ color: latencyBucket(queryLatency).color, borderColor: latencyBucket(queryLatency).color }"
            :title="historyLatencySpark && historyLatencySpark.mean
              ? `${latencyBucket(queryLatency).label} — ${queryLatency}ms · recent mean ${historyLatencySpark.mean}ms (${queryLatency > historyLatencySpark.mean ? '+' : ''}${Math.round((queryLatency - historyLatencySpark.mean) / historyLatencySpark.mean * 100)}%)`
              : `${latencyBucket(queryLatency).label} — ${queryLatency}ms`"
          >
            {{ latencyBucket(queryLatency).label }} · {{ queryLatency }}ms
          </span>
          <!-- Context budget — sums token_estimate across filtered sources.
               Helps the user see when retrieved chunks are eating too much of
               the LLM context window (typical qwen2.5 context ≈ 32k tokens). -->
          <span
            v-if="queryTokenBudget.total"
            class="rc-results-stat rc-results-tokens"
            :title="`Sum of token_estimate across ${queryTokenBudget.known}/${queryTokenBudget.total} filtered source(s) — ~${queryTokenBudget.chars.toLocaleString()} chars`"
          >
            ~{{ queryTokenBudget.tokens.toLocaleString() }}t context
          </span>
          <!-- Score threshold slider — interactive retrieval tightening.
               Lets the user hide weak matches (< threshold) without re-running
               the query; useful when top-k returns long-tail noise. -->
          <div class="rc-thresh" :title="`Hide chunks below ${(queryMinScore * 100).toFixed(0)}% cosine similarity`">
            <span class="rc-thresh-lbl">min</span>
            <el-slider
              v-model="queryMinScore"
              :min="0"
              :max="1"
              :step="0.05"
              :show-tooltip="false"
              style="width:120px;"
            />
            <span class="rc-thresh-val" :style="{color: scoreColor(queryMinScore || 0)}">{{ (queryMinScore * 100).toFixed(0) }}%</span>
          </div>
          <!-- Hide stale chunks — drops any source whose `updated` (or
               `created`) frontmatter date is older than 90 days. Useful when
               the KB has stale docs the retriever still ranks highly. -->
          <label class="rc-thresh-toggle" :title="`Hide chunks last updated >90 days ago (parsed from frontmatter)`">
            <input type="checkbox" v-model="queryHideStale" />
            <span>hide stale</span>
          </label>
          <!-- File-path substring filter — narrows results by file name
               without re-running the query. Useful when top-k pulls from
               several files and the user wants to focus on one. -->
          <el-input
            v-model="queryFileFilter"
            size="small"
            clearable
            placeholder="Filter by file…"
            :prefix-icon="Search"
            class="rc-thresh-file-filter"
          />
          <label class="rc-thresh-toggle" :title="`Group chunks under their parent file (sorted by best score)`">
            <input type="checkbox" v-model="queryGroupByFile" />
            <span>group by file</span>
          </label>
          <!-- Sort dropdown — re-orders the post-filter results client-side
               so the user can scan by alphabetical file name or by
               freshness (most recently updated first) without re-running
               the query. Defaults to score (backend's natural rank). -->
          <el-select v-model="querySortBy" size="small" class="rc-thresh-sort">
            <el-option label="sort: score" value="score" />
            <el-option label="sort: file" value="file" />
            <el-option label="sort: freshness" value="freshness" />
          </el-select>
        </div>

        <!-- Low-relevance nudge — when the best score is weak (< 0.5),
             surface a one-click recovery suggestion. The action flips the
             indicated knob and re-runs the query. -->
        <div v-if="lowRelevanceHint" class="rc-results-nudge">
          <el-icon><InfoFilled /></el-icon>
          <span class="rc-nudge-text">{{ lowRelevanceHint.text }}</span>
          <el-button size="small" type="primary" @click="lowRelevanceHint.action">Apply</el-button>
        </div>

        <!-- Group-by-file view — chunks nested under their parent file
             header, sorted by best score within the file. Lets the user
             see at a glance which files are contributing most chunks. -->
        <template v-if="groupedQuerySources">
          <div
            v-for="(g, gi) in groupedQuerySources" :key="g.path"
            class="rc-card-group"
          >
            <div class="rc-card-group-hd" @click="preview(g.path)" :title="`${g.path} — ${g.count} chunk(s) · best ${(g.best * 100).toFixed(0)}% · mean ${(g.avg * 100).toFixed(0)}%`">
              <el-icon :size="13"><Document /></el-icon>
              <span class="rc-card-group-path">{{ g.path }}</span>
              <span class="rc-card-group-meta">{{ g.count }} chunk(s)</span>
              <span class="rc-card-group-score" :style="{ color: scoreColor(g.best) }">best {{ (g.best * 100).toFixed(0) }}%</span>
            </div>
            <div
              v-for="(src, idx) in g.sources" :key="`${gi}-${idx}`"
              class="rc-card" :class="[`rc-card--${scoreLvl(src.score)}`]"
              @click="preview(src.file_path)"
            >
              <div class="rc-card-hd">
                <span class="rc-card-rank">#{{ idx + 1 }}</span>
                <div class="rc-card-meter"><div class="rc-card-meter-fill" :class="`rc-card-meter-fill--${scoreLvl(src.score)}`" :style="{width:scoreW(src.score)}" /></div>
                <span class="rc-card-pct" :class="`rc-card-pct--${scoreLvl(src.score)}`">{{ scorePct(src.score) }}</span>
                <el-tooltip :content="copiedChunkIdx === idx ? 'Copied!' : 'Copy chunk text'" placement="top">
                  <el-button size="small" text :icon="DocumentCopy" class="rc-card-copy" @click.stop="copyChunk(idx, src.text)" />
                </el-tooltip>
              </div>
              <div class="rc-card-body">
                <p class="rc-card-snip">{{ snippet(src.text, 160) }}</p>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(src, idx) in filteredQuerySources" :key="idx"
            class="rc-card" :class="[`rc-card--${scoreLvl(src.score)}`]"
            @click="preview(src.file_path)"
          >
            <div class="rc-card-hd">
              <span class="rc-card-rank">#{{ idx + 1 }}</span>
              <span class="rc-card-path"><el-icon :size="13"><Document /></el-icon>{{ src.file_path }}</span>
              <div class="rc-card-meter"><div class="rc-card-meter-fill" :class="`rc-card-meter-fill--${scoreLvl(src.score)}`" :style="{width:scoreW(src.score)}" /></div>
              <span class="rc-card-pct" :class="`rc-card-pct--${scoreLvl(src.score)}`">{{ scorePct(src.score) }}</span>
              <el-tooltip :content="copiedChunkIdx === idx ? 'Copied!' : 'Copy chunk text'" placement="top">
                <el-button size="small" text :icon="DocumentCopy" class="rc-card-copy" @click.stop="copyChunk(idx, src.text)" />
              </el-tooltip>
            </div>
            <div class="rc-card-body">
              <!-- Metadata badges — surfaces llama_index's parsed frontmatter -->
              <div v-if="src.metadata" class="rc-card-meta">
                <span v-if="src.metadata.category" class="rc-meta-tag rc-meta-tag--cat">{{ src.metadata.category }}</span>
                <span v-if="src.metadata.type" class="rc-meta-tag">{{ src.metadata.type }}</span>
                <span v-if="src.metadata.status" class="rc-meta-tag">{{ src.metadata.status }}</span>
                <span
                  v-for="t in tagsArray(src.metadata).slice(0, 3)"
                  :key="t"
                  class="rc-meta-tag rc-meta-tag--tag"
                >#{{ t }}</span>
                <span v-if="metaCharCount(src.metadata) != null" class="rc-meta-stat" :title="'Chunk character count'">{{ metaCharCount(src.metadata) }}c</span>
                <span v-if="metaTokenEstimate(src.metadata) != null" class="rc-meta-stat" :title="'Estimated token count'">~{{ metaTokenEstimate(src.metadata) }}t</span>
                <span
                  v-if="metaFreshness(src.metadata)"
                  class="rc-meta-stat rc-meta-freshness"
                  :class="{ 'rc-meta-freshness--stale': metaFreshness(src.metadata)!.stale }"
                  :title="`Source last updated ${metaFreshness(src.metadata)!.ageDays} day(s) ago — content may be outdated`"
                >
                  <el-icon :size="11"><Clock /></el-icon>{{ metaFreshness(src.metadata)!.label }}
                </span>
              </div>
              <p class="rc-card-snip">{{ snippet(src.text, 160) }}</p>
            </div>
          </div>
        </template>
      </div>

      <div v-else-if="hasSearched && !queryError" class="rc-empty">
        <el-icon :size="40"><Search /></el-icon>
        <span>No matching results in context files</span>
      </div>
      <div v-else-if="!hasScope" class="rc-empty">
        <el-icon :size="40"><Collection /></el-icon>
        <span>Add context files to enable RAG search</span>
        <span class="rc-empty-hint">Drag files from the left sidebar or use Edit context</span>
      </div>
    </div>

    <!-- ═══ Decompose (SubQuestionQueryEngine) ═══ -->
    <div v-if="activeTab === 'decompose'" class="rc-body">
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
          <span v-if="dqAggregate" class="rc-results-stat" :title="`${dqAggregate.totalSrc} source(s) across ${dqAggregate.withSrc}/${dqAggregate.total} sub-Q(s)`">{{ dqAggregate.totalSrc }} src</span>
          <span
            v-if="dqAggregate && dqAggregate.meanSrc != null"
            class="rc-results-stat"
            :title="`Mean sources per sub-Q (across ${dqAggregate.withSrc} sub-Q(s) with sources) — higher means more chunks per branch`"
          >μ {{ dqAggregate.meanSrc }} src/q</span>
          <span
            v-if="dqAggregate && dqAggregate.bestTop > 0"
            class="rc-results-stat"
            :style="{ color: scoreColor(dqAggregate.bestTop / 100) }"
            :title="`Best cosine score across all sub-Qs`"
          >top {{ dqAggregate.bestTop }}%</span>
          <span
            v-if="dqAggregate && dqAggregate.meanTop != null"
            class="rc-results-stat"
            :style="{ color: scoreColor(dqAggregate.meanTop / 100) }"
            :title="`Mean top score across ${dqAggregate.withSrc} sub-Q(s) with sources — higher = sub-Qs are landing relevant chunks`"
          >μ {{ dqAggregate.meanTop }}%</span>
          <span class="rc-dq-acts">
            <el-button size="small" text @click="expandAllDq()">Expand all</el-button>
            <el-button size="small" text @click="collapseAllDq()">Collapse all</el-button>
          </span>
        </div>

        <!-- Flow diagram — llama_index SubQuestionQueryEngine pipeline:
             original → LLM splits into N sub-Qs → each retrieves → synthesize.
             Each sub-Q node is clickable to expand + scroll to it in the list. -->
        <div class="rc-dq-flow">
          <div class="rc-dq-flow-node rc-dq-flow-node--root" :title="dqResult.original">
            <span class="rc-dq-flow-label">Question</span>
            <span class="rc-dq-flow-text">{{ dqResult.original }}</span>
          </div>
          <div class="rc-dq-flow-arrow" title="LLM splits into sub-questions">⤵</div>
          <div class="rc-dq-flow-branches">
            <button
              v-for="(sq, i) in dqResult.sub_questions"
              :key="i"
              class="rc-dq-flow-node rc-dq-flow-node--sub"
              :class="{ 'rc-dq-flow-node--open': dqExpanded.has(i) }"
              :title="`Q${i + 1}: ${dqSubQStats(i) ? 'top ' + (dqSubQStats(i)!.top * 100).toFixed(0) + '%' : 'no sources'}`"
              @click="jumpToSubQ(i)"
            >
              <span class="rc-dq-flow-label">Q{{ i + 1 }}</span>
              <span class="rc-dq-flow-text">{{ sq.sub_q }}</span>
              <span v-if="dqSubQStats(i)" class="rc-dq-flow-stat" :style="{ color: scoreColor(dqSubQStats(i)!.top) }">
                top {{ (dqSubQStats(i)!.top * 100).toFixed(0) }}%
              </span>
            </button>
          </div>
          <div class="rc-dq-flow-arrow" title="Synthesize combined answer">⤴</div>
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

        <!-- Aggregated sources — unique chunks across all sub-Qs -->
        <div v-if="dqAggregatedSources.length" class="rc-dq-agg">
          <div class="rc-dq-agg-hd">
            <el-icon :size="13"><Collection /></el-icon>
            <span>Aggregated sources</span>
            <span class="rc-dq-agg-n">{{ dqAggregatedSources.length }} unique</span>
          </div>
          <RagSources
            ref="dqAggRagSourcesRef"
            :sources="dqAggregatedSources"
          />
        </div>

        <div class="rc-dq-list">
          <div v-for="(sq, i) in dqResult.sub_questions" :id="`rc-dq-item-${i}`" :key="i" class="rc-dq-item" :class="{ 'rc-dq-item--open': dqExpanded.has(i) }">
            <div class="rc-dq-item-hd" @click="toggleDqExpand(i)">
              <span class="rc-dq-rank">Q{{ i + 1 }}</span>
              <span v-if="dqBestIdx === i" class="rc-dq-best" :title="`Best top_score across sub-Qs — SubQuestionQueryEngine retrieved the strongest chunks for this branch`">best</span>
              <span v-else-if="dqWorstIdx === i" class="rc-dq-worst" :title="`Weakest top_score across sub-Qs — consider rephrasing this sub-question or seeding more KB content for this topic`">worst</span>
              <span class="rc-dq-q">{{ sq.sub_q }}</span>
              <span v-if="dqSubQStats(i)" class="rc-dq-score" :style="{ color: scoreColor(dqSubQStats(i)!.top) }" :title="`Top ${(dqSubQStats(i)!.top * 100).toFixed(0)}% · mean ${(dqSubQStats(i)!.mean * 100).toFixed(0)}%`">
                top {{ (dqSubQStats(i)!.top * 100).toFixed(0) }}%
              </span>
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
              <div
                v-if="sq.answer"
                class="rc-dq-answer"
                @click="onDqAnswerClick(i, $event)"
                v-html="dqAnswerHtml(i)"
              />
              <RagSources
                v-if="sq.sources.length"
                :ref="(el: any) => (dqRagSourcesRefs[i] = el)"
                :sources="sq.sources"
              />
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

    <!-- ═══ Index ═══ -->
    <div v-if="activeTab === 'index'" class="rc-body">
      <div class="rc-ix-bar">
        <div class="rc-ix-stat">
          <span class="rc-ix-n">{{ scopeFiles.length }}</span>
          <span class="rc-ix-lbl">files in scope</span>
        </div>
        <div class="rc-ix-stat">
          <span class="rc-ix-n">{{ scopeFileGroups.length }}</span>
          <span class="rc-ix-lbl">directories</span>
        </div>
        <div class="rc-ix-stat">
          <span class="rc-ix-n" :style="{color: status?.built ? 'var(--el-color-success)':'var(--el-color-warning)'}">{{ status?.built ? 'Ready' : 'N/A' }}</span>
          <span class="rc-ix-lbl">index status</span>
        </div>
        <div v-if="indexFreshness(status?.last_built_at)" class="rc-ix-stat" :title="`Last built ${status?.last_built_at}`">
          <span
            class="rc-ix-n rc-ix-freshness"
            :style="{ color: indexFreshness(status?.last_built_at)!.color, borderColor: indexFreshness(status?.last_built_at)!.color }"
          >{{ indexFreshness(status?.last_built_at)!.label }} · {{ indexFreshness(status?.last_built_at)!.age }}</span>
          <span class="rc-ix-lbl">freshness</span>
        </div>
        <div v-if="kbContentFreshness" class="rc-ix-stat" :title="`Most recent content edit (max updated/created across retrieved sources)`">
          <span
            class="rc-ix-n rc-ix-freshness"
            :style="{ color: kbContentFreshness.color, borderColor: kbContentFreshness.color }"
          >{{ kbContentFreshness.label }} · {{ kbContentFreshness.age }}</span>
          <span class="rc-ix-lbl">content age</span>
        </div>
        <div v-if="status?.persist_dir_size" class="rc-ix-stat" :title="`Persist dir: ${status?.persist_dir || '(unknown)'}`">
          <span class="rc-ix-n">{{ formatBytes(status.persist_dir_size) }}</span>
          <span class="rc-ix-lbl">index size</span>
        </div>
        <div class="rc-ix-acts">
          <el-tooltip content="Copy current llama_index config as JSON" placement="top">
            <el-button size="small" :icon="Document" :disabled="!status?.config" @click="copyConfigJSON">{{ configCopied ? 'Copied!' : 'Copy config' }}</el-button>
          </el-tooltip>
          <el-button size="small" :icon="Refresh" @click="loadStatus" />
          <el-button size="small" type="primary" :icon="Cpu" :loading="building" @click="doRebuild">{{ building ? 'Building…' : 'Rebuild' }}</el-button>
        </div>
      </div>

      <!-- Pipeline diagram — visualizes the llama_index retrieval flow
           end-to-end so the user understands which stage each config knob
           actually affects. Each node is wired to the corresponding config
           field, and the arrows trace the live data path: user query →
           embed → vector store → (hybrid + BM25 fusion) → retriever →
           (rerank) → synthesis LLM → streamed answer. -->
      <div v-if="status?.config" class="rc-pipeline">
        <div class="rc-pipe-node" :title="`Embedding model: ${status.config.embed_model || '(default)'}`">
          <span class="rc-pipe-stage">1 · Embed</span>
          <code class="rc-pipe-cfg">{{ status.config.embed_model || '—' }}</code>
        </div>
        <span class="rc-pipe-arrow" title="embed query + chunks">→</span>
        <div class="rc-pipe-node" :title="`Chunk size: ${status.config.chunk_size} tokens (overlap ${status.config.chunk_overlap})`">
          <span class="rc-pipe-stage">2 · Vector Store</span>
          <code class="rc-pipe-cfg">{{ status.num_docs || 0 }} chunks</code>
        </div>
        <span class="rc-pipe-arrow" :title="status.config.hybrid_retrieval ? 'vector + BM25 reciprocal-rank fusion' : 'vector similarity only'">{{ status.config.hybrid_retrieval ? '⤵ hybrid' : '→' }}</span>
        <div class="rc-pipe-node" :class="{'on': status.config.hybrid_retrieval}" :title="`top_k: ${status.config.top_k} · hybrid: ${status.config.hybrid_retrieval ? 'on' : 'off'}`">
          <span class="rc-pipe-stage">3 · Retriever</span>
          <code class="rc-pipe-cfg">top_k={{ status.config.top_k }}</code>
        </div>
        <span class="rc-pipe-arrow" :title="status.config.rerank_enabled ? 'LLMRerank postprocessor trims top-k' : 'no rerank'">{{ status.config.rerank_enabled ? '⤵ rerank' : '→' }}</span>
        <div class="rc-pipe-node" :class="{'on': status.config.rerank_enabled}" :title="`Rerank: ${status.config.rerank_enabled ? 'on (LLMRerank)' : 'off'}`">
          <span class="rc-pipe-stage">4 · Postprocess</span>
          <code class="rc-pipe-cfg">{{ status.config.rerank_enabled ? 'LLMRerank' : 'passthrough' }}</code>
        </div>
        <span class="rc-pipe-arrow" title="condense + context">→</span>
        <div class="rc-pipe-node" :title="`Chat LLM: ${status.config.llm_model || '(default)'}`">
          <span class="rc-pipe-stage">5 · Synthesize</span>
          <code class="rc-pipe-cfg">{{ status.config.llm_model || '—' }}</code>
        </div>
      </div>

      <!-- Config card — surfaces backend llama_index settings so the user
           can see what retrieval capabilities are active without touching
           config.yaml. -->
      <div v-if="status?.config" class="rc-cfg">
        <div class="rc-cfg-hd"><el-icon :size="14"><DataAnalysis /></el-icon><span>llama_index config</span></div>
        <div class="rc-cfg-grid">
          <div class="rc-cfg-cell"><span class="rc-cfg-k">embed</span><code>{{ status.config.embed_model || '—' }}</code></div>
          <div class="rc-cfg-cell"><span class="rc-cfg-k">llm</span><code>{{ status.config.llm_model || '—' }}</code></div>
          <div class="rc-cfg-cell"><span class="rc-cfg-k">chunk</span><code>{{ status.config.chunk_size }}/{{ status.config.chunk_overlap }}</code></div>
          <div class="rc-cfg-cell"><span class="rc-cfg-k">top-k</span><code>{{ status.config.top_k }}</code></div>
          <div class="rc-cfg-cell" :class="{'on': status.config.hybrid_retrieval}">
            <span class="rc-cfg-k">hybrid</span>
            <span class="rc-cfg-v">{{ status.config.hybrid_retrieval ? 'on' : 'off' }}</span>
          </div>
          <div class="rc-cfg-cell" :class="{'on': status.config.rerank_enabled}">
            <span class="rc-cfg-k">rerank</span>
            <span class="rc-cfg-v">{{ status.config.rerank_enabled ? 'on' : 'off' }}</span>
          </div>
          <div class="rc-cfg-cell" :class="{'on': status.config.inline_citations}">
            <span class="rc-cfg-k">citations</span>
            <span class="rc-cfg-v">{{ status.config.inline_citations ? 'on' : 'off' }}</span>
          </div>
          <div class="rc-cfg-cell" :class="{'on': status.config.auto_rebuild}">
            <span class="rc-cfg-k">auto-build</span>
            <span class="rc-cfg-v">{{ status.config.auto_rebuild ? 'on' : 'off' }}</span>
          </div>
        </div>
        <div v-if="status.num_docs" class="rc-cfg-foot">
          <span class="rc-cfg-docs">{{ status.num_docs }} chunks indexed</span>
          <span v-if="status.last_built_at" class="rc-cfg-built">built {{ status.last_built_at }}</span>
        </div>
      </div>

      <!-- KB coverage — stacked horizontal bar of frontmatter categories,
           sized by file count. Lets the user spot which topics dominate the
           indexed corpus vs. which are sparse (a hint to seed more content). -->
      <div v-if="kbCoverage.catCount" class="rc-ix-cov">
        <div class="rc-ix-cov-hd">
          <span class="rc-ix-cov-title">Coverage</span>
          <span class="rc-ix-cov-sub">{{ kbCoverage.totalFiles }} files · {{ kbCoverage.catCount }} categories</span>
        </div>
        <div class="rc-ix-cov-bar">
          <div
            v-for="c in kbCoverage.sorted"
            :key="c.name"
            class="rc-ix-cov-seg"
            :style="{ width: `${Math.max(c.pct, 1)}%` }"
            :title="`${c.name}: ${c.file_count} file(s) · ${c.pct.toFixed(1)}%`"
          >
            <span class="rc-ix-cov-seg-lbl" v-if="c.pct > 8">{{ c.name }}</span>
          </div>
          <div
            v-if="kbCoverage.restFiles"
            class="rc-ix-cov-seg rc-ix-cov-seg--rest"
            :style="{ width: `${Math.max((kbCoverage.restFiles / kbCoverage.totalFiles) * 100, 1)}%` }"
            :title="`${kbCoverage.restCount} more categories · ${kbCoverage.restFiles} files`"
          />
        </div>
        <div class="rc-ix-cov-legend">
          <span v-for="c in kbCoverage.sorted" :key="c.name" class="rc-ix-cov-leg">
            <span class="rc-ix-cov-leg-dot" />{{ c.name }}<span class="rc-ix-cov-leg-n">{{ c.file_count }}</span>
          </span>
          <span v-if="kbCoverage.restFiles" class="rc-ix-cov-leg rc-ix-cov-leg--rest">
            +{{ kbCoverage.restCount }}<span class="rc-ix-cov-leg-n">{{ kbCoverage.restFiles }}</span>
          </span>
        </div>
      </div>

      <!-- Scope popularity — which KB slices the user actually queries most
           often, regardless of how many files each contains. Surfaces
           underused scopes (good candidates for removal) and hot scopes
           (good candidates for ensuring freshness). -->
      <div v-if="scopePopularity" class="rc-ix-cov rc-ix-scope-pop">
        <div class="rc-ix-cov-hd">
          <span class="rc-ix-cov-title">Scope popularity</span>
          <span class="rc-ix-cov-sub">{{ scopePopularity.total }} quer{{ scopePopularity.total === 1 ? 'y' : 'ies' }} · {{ scopePopularity.unique }} scope{{ scopePopularity.unique === 1 ? '' : 's' }}</span>
        </div>
        <div class="rc-ix-scope-pop-list">
          <div
            v-for="s in scopePopularity.entries"
            :key="s.scope"
            class="rc-hist-topfiles-row"
            :title="`${s.scope} — ${s.count} quer${s.count === 1 ? 'y' : 'ies'} (${s.pct}%) · μ ${s.meanLat}ms · μ ${s.meanTop}% top`"
          >
            <span class="rc-hist-topfiles-name">{{ s.scope }}</span>
            <div class="rc-hist-mode-bar-track">
              <div class="rc-hist-mode-bar" :style="{ width: `${s.pct}%`, background: 'var(--el-color-info)' }" />
            </div>
            <div class="rc-hist-mode-bar-track" :title="`Score bar — width ∝ μ ${s.meanTop}% top_score`">
              <div class="rc-hist-mode-bar" :style="{ width: `${s.meanTop}%`, background: scoreColor(s.meanTop / 100) }" />
            </div>
            <span class="rc-hist-mode-count">{{ s.count }} · {{ s.pct }}%</span>
            <span class="rc-hist-topfiles-best" :style="{ color: scoreColor(s.meanTop / 100) }" :title="`Mean top score across ${s.count} quer${s.count === 1 ? 'y' : 'ies'} for this scope`">μ {{ s.meanTop }}%</span>
          </div>
        </div>
      </div>

      <!-- Top repeated questions — surfaces which questions the user keeps
           coming back to (A/B tuning cycles or recurring lookups). Avg top
           score per question shows whether the iterations are converging on
           a satisfying answer or still struggling. -->
      <div v-if="topRepeatedQuestions" class="rc-ix-cov rc-ix-scope-pop">
        <div class="rc-ix-cov-hd">
          <span class="rc-ix-cov-title">Repeated questions</span>
          <span class="rc-ix-cov-sub">{{ topRepeatedQuestions.length }} question{{ topRepeatedQuestions.length === 1 ? '' : 's' }} asked ≥2 times</span>
        </div>
        <div class="rc-ix-scope-pop-list">
          <div
            v-for="q in topRepeatedQuestions"
            :key="q.key"
            class="rc-hist-topfiles-row"
            :title="`${q.sample} — asked ${q.count} times · μ ${q.meanTop}% top score · μ ${q.meanLat}ms\nLow avg score on a repeated question = KB gap worth filling.`"
          >
            <span class="rc-hist-topfiles-name">{{ q.sample }}</span>
            <div class="rc-hist-mode-bar-track">
              <div class="rc-hist-mode-bar" :style="{ width: `${Math.min(100, q.count * 20)}%`, background: 'var(--el-color-warning)' }" />
            </div>
            <span class="rc-hist-mode-count">{{ q.count }}×</span>
            <span class="rc-hist-topfiles-best" :style="{ color: scoreColor(q.meanTop / 100) }" :title="`Mean top score across ${q.count} attempt(s)`">μ {{ q.meanTop }}%</span>
          </div>
        </div>
      </div>

      <!-- Top scoring files — files with the highest mean top_score across
           retrieval/chat. Surfaces which files produce the highest-quality
           chunks. Complements the Stale-files card below. -->
      <div v-if="topScoringFiles" class="rc-ix-cov rc-ix-scope-pop">
        <div class="rc-ix-cov-hd">
          <span class="rc-ix-cov-title">Top scoring files</span>
          <span class="rc-ix-cov-sub">{{ topScoringFiles.length }} file{{ topScoringFiles.length === 1 ? '' : 's' }} with μ score ≥2 hits</span>
        </div>
        <div class="rc-ix-scope-pop-list">
          <div
            v-for="f in topScoringFiles"
            :key="f.path"
            class="rc-hist-topfiles-row"
            :title="`${f.path} — ${f.count} hit(s) · μ ${f.meanScore}% mean top_score · max ${f.max}%\nHigh-quality chunks — anchor reference for related queries.`"
          >
            <span class="rc-hist-topfiles-name">{{ f.short }}</span>
            <div class="rc-hist-mode-bar-track">
              <div class="rc-hist-mode-bar" :style="{ width: `${f.meanScore}%`, background: scoreColor(f.meanScore / 100) }" />
            </div>
            <span class="rc-hist-mode-count">{{ f.count }}×</span>
            <span class="rc-hist-topfiles-best" :style="{ color: scoreColor(f.meanScore / 100) }" :title="`Max score: ${f.max}%`">μ {{ f.meanScore }}%</span>
          </div>
        </div>
      </div>

      <!-- Top stale files — files retrieved ≥1 time whose chunks are >90
           days old. Sorted by appearance × age so the most-retrieved outdated
           files surface first — those are the highest-leverage refresh or
           archive candidates. -->
      <div v-if="topStaleFiles" class="rc-ix-cov rc-ix-scope-pop">
        <div class="rc-ix-cov-hd">
          <span class="rc-ix-cov-title">Stale files</span>
          <span class="rc-ix-cov-sub">{{ topStaleFiles.length }} file{{ topStaleFiles.length === 1 ? '' : 's' }} retrieved with chunks &gt;90d old</span>
        </div>
        <div class="rc-ix-scope-pop-list">
          <div
            v-for="f in topStaleFiles"
            :key="f.path"
            class="rc-hist-topfiles-row"
            :title="`${f.path} — retrieved ${f.count}× with stale chunks · max age ${f.ageDays} day(s)\nRefresh content or move to archive/ if obsolete.`"
          >
            <span class="rc-hist-topfiles-name">{{ f.short }}</span>
            <div class="rc-hist-mode-bar-track">
              <div class="rc-hist-mode-bar" :style="{ width: `${Math.min(100, f.ageDays / 3)}%`, background: 'var(--el-color-danger)' }" />
            </div>
            <span class="rc-hist-mode-count">{{ f.count }}× · {{ f.ageLabel }}</span>
            <span class="rc-hist-topfiles-best" style="color: var(--el-color-danger)" :title="`Oldest chunk: ${f.ageDays} day(s) old`">{{ f.ageLabel }} old</span>
          </div>
        </div>
      </div>

      <!-- Coverage gap — files attached to this scope that have never been
           retrieved. Signals dead/off-topic files the user should remove, or
           files that need better content to surface in future queries. -->
      <div v-if="coverageGap" class="rc-ix-cov rc-ix-scope-pop">
        <div class="rc-ix-cov-hd">
          <span class="rc-ix-cov-title">Coverage gap</span>
          <span class="rc-ix-cov-sub">{{ coverageGap.total }}/{{ coverageGap.scoped }} file{{ coverageGap.scoped === 1 ? '' : 's' }} never retrieved — candidates for removal or content improvement</span>
        </div>
        <div class="rc-ix-scope-pop-list">
          <div
            v-for="f in coverageGap.entries"
            :key="f.path"
            class="rc-hist-topfiles-row"
            :title="`${f.path}\nNever pulled in any retrieval query or chat turn. Remove if off-topic, or enrich content.`"
          >
            <span class="rc-hist-topfiles-name" style="color: var(--el-text-color-secondary)">{{ f.path.length > 70 ? '…' + f.path.slice(f.path.length - 67) : f.path }}</span>
            <div class="rc-hist-mode-bar-track">
              <div class="rc-hist-mode-bar" style="width: 0%; background: var(--el-color-info)" />
            </div>
            <span class="rc-hist-mode-count" style="color: var(--el-text-color-placeholder)">0×</span>
            <span class="rc-hist-topfiles-best" style="color: var(--el-color-info)" title="Never retrieved">never pulled</span>
          </div>
          <div v-if="coverageGap.total > 5" class="rc-hist-mode-count" style="text-align: right; padding-right: 8px">
            + {{ coverageGap.total - 5 }} more
          </div>
        </div>
      </div>

      <div v-if="hasScope" class="rc-ix-list">
        <div v-if="scopeFileInfos.length > 6" class="rc-ix-list-filter">
          <el-input
            v-model="scopeFileFilter"
            size="small"
            clearable
            placeholder="Filter scope files…"
            :prefix-icon="Search"
          />
          <span class="rc-ix-list-count">{{ filteredScopeFileInfos.length }}/{{ scopeFileInfos.length }}</span>
        </div>
        <div v-for="f in filteredScopeFileInfos" :key="f.path" class="rc-ix-file" @click="preview(f.path)">
          <span class="rc-ix-file-icon">📄</span>
          <div class="rc-ix-file-info">
            <span class="rc-ix-file-name">{{ f.name }}</span>
            <span class="rc-ix-file-path">{{ f.dir }}/</span>
          </div>
          <el-tag size="small" type="success" effect="light">indexed</el-tag>
        </div>
      </div>
      <div v-else class="rc-empty">
        <el-icon :size="40"><Files /></el-icon>
        <span>No context files attached</span>
      </div>
    </div>

    <!-- History tab — in-memory ring of recent retrievals.
         Surfaces what was asked, what was retrieved (top/avg score),
         and round-trip latency. Click to re-populate the Query tab's
         input. Records are pushed by rag_query on the backend. -->
    <div v-if="activeTab === 'history'" class="rc-body">
      <div class="rc-hd-row">
        <div class="rc-hist-subtabs">
          <button
            class="rc-hist-subtab"
            :class="{ active: historyView === 'retrieval' }"
            @click="switchHistoryView('retrieval')"
          >Retrieval <span v-if="historyRecords.length" class="rc-tab-count">{{ historyRecords.length }}</span></button>
          <button
            class="rc-hist-subtab"
            :class="{ active: historyView === 'chat' }"
            @click="switchHistoryView('chat')"
          >Chat <span v-if="chatTurns.length" class="rc-tab-count">{{ chatTurns.length }}</span></button>
        </div>
        <div class="rc-hd-actions">
          <template v-if="historyView === 'retrieval'">
            <el-button size="small" :icon="Download" :disabled="!filteredHistoryRecords.length" @click="exportHistoryJSON">JSON</el-button>
            <el-button size="small" :icon="Download" :disabled="!filteredHistoryRecords.length" @click="exportHistoryCSV">CSV</el-button>
            <el-button size="small" :icon="Refresh" :loading="historyLoading" @click="loadHistory">Refresh</el-button>
            <el-button size="small" :icon="Delete" :disabled="!historyRecords.length" @click="clearHistory">Clear</el-button>
          </template>
          <template v-else>
            <el-button size="small" :icon="Download" :disabled="!filteredChatTurns.length" @click="exportHistoryJSON">JSON</el-button>
            <el-button size="small" :icon="Download" :disabled="!filteredChatTurns.length" @click="exportHistoryCSV">CSV</el-button>
            <el-button size="small" :icon="Refresh" :loading="chatTurnsLoading" @click="loadChatTurns">Refresh</el-button>
            <el-button size="small" :icon="Delete" :disabled="!chatTurns.length" @click="clearChatTurns">Clear</el-button>
          </template>
        </div>
      </div>
      <template v-if="historyView === 'retrieval'">
        <div v-if="compareRecords.length" class="rc-cmp">
          <div class="rc-cmp-hd">
            <span class="rc-hist-spark-label">side-by-side comparison ({{ compareRecords.length }}/2)</span>
            <el-button size="small" text :icon="Delete" @click="clearCompare">Clear</el-button>
          </div>
          <div class="rc-cmp-grid" :class="{ 'is-pair': compareRecords.length === 2 }">
            <div v-for="(r, idx) in compareRecords" :key="r.id" class="rc-cmp-cell" :class="{ 'is-winner': compareWinnerSide === (idx === 0 ? 'left' : 'right') }">
              <div class="rc-cmp-cell-hd">
                <span v-if="compareWinnerSide === (idx === 0 ? 'left' : 'right')" class="rc-cmp-winner" :title="`Higher composite (0.7×top + 0.3×avg − latency/10k)`">✓ winner</span>
                <span class="rc-hist-time">{{ r.timestamp.replace('T', ' ') }}</span>
                <span class="rc-cmp-cell-q" :title="r.question">{{ r.question }}</span>
              </div>
              <div class="rc-cmp-cell-stats">
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">latency</span>
                  <span class="rc-cmp-v">{{ r.latency_ms }}ms</span>
                </div>
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">top score</span>
                  <span class="rc-cmp-v" :style="{ color: scoreColor(r.top_score) }">{{ (r.top_score * 100).toFixed(0) }}%</span>
                </div>
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">mean</span>
                  <span class="rc-cmp-v" :style="{ color: scoreColor(r.avg_score) }">{{ (r.avg_score * 100).toFixed(0) }}%</span>
                </div>
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">sources</span>
                  <span class="rc-cmp-v">{{ r.result_count }}</span>
                </div>
                <div v-if="recordTokenBudget(r) != null" class="rc-cmp-stat">
                  <span class="rc-cmp-k">tokens</span>
                  <span class="rc-cmp-v rc-cmp-v--tokens" :title="`Sum of token_estimate across ${r.result_count} source(s)`">~{{ recordTokenBudget(r)!.toLocaleString() }}</span>
                </div>
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">top-k</span>
                  <span class="rc-cmp-v">{{ r.top_k }}</span>
                </div>
                <div v-if="r.scope" class="rc-cmp-stat">
                  <span class="rc-cmp-k">scope</span>
                  <span class="rc-cmp-v" :title="r.scope">{{ r.scope }}</span>
                </div>
              </div>
              <div v-if="r.config" class="rc-cmp-cfg">
                <span class="rc-hist-cfg-chip" :class="{ on: r.config.hybrid }">hybrid</span>
                <span class="rc-hist-cfg-chip" :class="{ on: r.config.rerank }">rerank</span>
                <span class="rc-hist-cfg-chip" :class="{ on: r.config.citations }">citations</span>
                <span v-if="r.config.num_queries > 1" class="rc-hist-cfg-chip">Q×{{ r.config.num_queries }}</span>
                <span v-if="r.config.category" class="rc-hist-cfg-chip rc-hist-cfg-chip--filter">cat:{{ r.config.category }}</span>
                <span
                  v-for="tag in r.config.tags"
                  :key="tag"
                  class="rc-hist-cfg-chip rc-hist-cfg-chip--filter"
                >#{{ tag }}</span>
              </div>
            </div>
            <div v-if="compareRecords.length === 1" class="rc-cmp-cell rc-cmp-cell--empty">
              <span>Pick another record to compare</span>
            </div>
          </div>
          <div v-if="compareDelta" class="rc-cmp-delta">
            <span class="rc-hist-spark-label">Δ right − left</span>
            <div class="rc-cmp-delta-row">
              <span
                class="rc-cmp-delta-chip"
                :class="compareDelta.latency_ms > 0 ? 'is-worse' : (compareDelta.latency_ms < 0 ? 'is-better' : 'is-same')"
                :title="`Right is ${compareDelta.latency_ms > 0 ? 'slower' : (compareDelta.latency_ms < 0 ? 'faster' : 'same')} by ${Math.abs(compareDelta.latency_ms)}ms`"
              >latency {{ compareDelta.latency_ms > 0 ? '+' : '' }}{{ compareDelta.latency_ms }}ms</span>
              <span
                class="rc-cmp-delta-chip"
                :class="compareDelta.top_score_pct > 0 ? 'is-better' : (compareDelta.top_score_pct < 0 ? 'is-worse' : 'is-same')"
                :title="`Right is ${compareDelta.top_score_pct > 0 ? 'higher' : (compareDelta.top_score_pct < 0 ? 'lower' : 'same')} by ${Math.abs(compareDelta.top_score_pct).toFixed(0)}%`"
              >top score {{ compareDelta.top_score_pct > 0 ? '+' : '' }}{{ compareDelta.top_score_pct.toFixed(0) }}%</span>
              <span
                class="rc-cmp-delta-chip"
                :class="compareDelta.avg_score_pct > 0 ? 'is-better' : (compareDelta.avg_score_pct < 0 ? 'is-worse' : 'is-same')"
                :title="`Right is ${compareDelta.avg_score_pct > 0 ? 'higher' : (compareDelta.avg_score_pct < 0 ? 'lower' : 'same')} by ${Math.abs(compareDelta.avg_score_pct).toFixed(0)}%`"
              >mean {{ compareDelta.avg_score_pct > 0 ? '+' : '' }}{{ compareDelta.avg_score_pct.toFixed(0) }}%</span>
              <span
                class="rc-cmp-delta-chip"
                :class="compareDelta.sources > 0 ? 'is-better' : (compareDelta.sources < 0 ? 'is-worse' : 'is-same')"
                :title="`Right returns ${compareDelta.sources > 0 ? 'more' : (compareDelta.sources < 0 ? 'fewer' : 'same')} sources by ${Math.abs(compareDelta.sources)}`"
              >sources {{ compareDelta.sources > 0 ? '+' : '' }}{{ compareDelta.sources }}</span>
              <span
                v-if="compareDelta.tokens != null"
                class="rc-cmp-delta-chip"
                :class="compareDelta.tokens > 0 ? 'is-worse' : (compareDelta.tokens < 0 ? 'is-better' : 'is-same')"
                :title="`Right consumes ${compareDelta.tokens > 0 ? 'more' : (compareDelta.tokens < 0 ? 'less' : 'same')} context by ${Math.abs(compareDelta.tokens!)} tokens`"
              >tokens {{ compareDelta.tokens > 0 ? '+' : '' }}{{ compareDelta.tokens }}</span>
              <span
v-if="compareDelta.top_k !== 0"
                class="rc-cmp-delta-chip is-same"
                :title="`Top-k differs by ${compareDelta.top_k}`"
              >top-k {{ compareDelta.top_k > 0 ? '+' : '' }}{{ compareDelta.top_k }}</span>
            </div>
          </div>
        </div>
        <div class="rc-hist-filter-row">
          <span v-if="historyRecords.length" class="rc-results-stat">{{ filteredHistoryRecords.length }}/{{ historyRecords.length }} shown · max {{ historyMax }}</span>
          <span
            v-if="historyMeanTopScore != null"
            class="rc-results-stat rc-results-score"
            :style="{ color: scoreColor(historyMeanTopScore / 100) }"
            :title="`Mean top_score across ${filteredHistoryRecords.length} filtered record(s) — higher = better retrieval quality`"
          >μ top {{ historyMeanTopScore }}%</span>
          <span
            v-if="historyMeanLatency != null"
            class="rc-results-stat"
            :style="{ color: latencyBucket(historyMeanLatency).color, borderColor: latencyBucket(historyMeanLatency).color }"
            :title="`Mean latency across ${filteredHistoryRecords.length} filtered record(s) — ${latencyBucket(historyMeanLatency).label}`"
          >μ {{ historyMeanLatency }}ms</span>
          <span
            v-if="retrievalStaleRecordCount && retrievalStaleRecordCount.stale > 0"
            class="rc-results-stat rc-results-stale"
            :title="`${retrievalStaleRecordCount.stale}/${retrievalStaleRecordCount.total} record(s) (${retrievalStaleRecordCount.pct}%) pulled in at least one source >90 days old — consider rebuilding the index`"
          >⚠ {{ retrievalStaleRecordCount.stale }}/{{ retrievalStaleRecordCount.total }} stale</span>
          <span
            v-if="historyMeanTokens != null"
            class="rc-results-stat rc-results-tokens"
            :title="`Mean Σ metadata.token_estimate across ${filteredHistoryRecords.length} filtered record(s) — lower = cheaper context`"
          >μ {{ historyMeanTokens }} tok</span>
          <span
            v-if="historyTokenLatencyCorr"
            class="rc-results-stat"
            :title="`Pearson r between token budget and latency across ${historyTokenLatencyCorr.n} record(s) — ${historyTokenLatencyCorr.band} correlation. Positive = bigger ctx → slower; ~0 = no correlation; negative = bigger ctx → faster (caching).`"
            :style="{ color: historyTokenLatencyCorr.r > 0.5 ? 'var(--el-color-danger)' : historyTokenLatencyCorr.r > 0.2 ? 'var(--el-color-warning)' : 'var(--el-color-success)' }"
          >τ {{ historyTokenLatencyCorr.r > 0 ? '+' : '' }}{{ historyTokenLatencyCorr.r.toFixed(2) }}</span>
          <span
            v-if="historyScoreLatencyCorr"
            class="rc-results-stat"
            :title="`Pearson r between top_score and latency across ${historyScoreLatencyCorr.n} record(s) — ${historyScoreLatencyCorr.band} correlation. Positive = slower → better scores (rerank/hybrid worth it); ~0 = latency independent of score; negative = slower → worse scores (filter mismatch).`"
            :style="{ color: historyScoreLatencyCorr.r < -0.2 ? 'var(--el-color-danger)' : historyScoreLatencyCorr.r > 0.3 ? 'var(--el-color-success)' : 'var(--el-color-info)' }"
          >σ {{ historyScoreLatencyCorr.r > 0 ? '+' : '' }}{{ historyScoreLatencyCorr.r.toFixed(2) }}</span>
          <span
            v-if="historyQLenScoreCorr"
            class="rc-results-stat"
            :title="`Pearson r between question length (chars) and top_score across ${historyQLenScoreCorr.n} record(s) — ${historyQLenScoreCorr.band} correlation. Positive = longer questions → better scores (specificity pays off); ~0 = length agnostic; negative = longer questions confuse retriever (embedding dilution).`"
            :style="{ color: historyQLenScoreCorr.r < -0.2 ? 'var(--el-color-danger)' : historyQLenScoreCorr.r > 0.3 ? 'var(--el-color-success)' : 'var(--el-color-info)' }"
          >λ {{ historyQLenScoreCorr.r > 0 ? '+' : '' }}{{ historyQLenScoreCorr.r.toFixed(2) }}</span>
          <span
            v-if="historyMeanQuestionChars != null"
            class="rc-results-stat"
            :title="`Mean question length across ${filteredHistoryRecords.length} filtered record(s) — higher = longer/multi-clause questions`"
          >μ {{ historyMeanQuestionChars }} qchars</span>
          <span
            v-if="historyMeanSourceCount != null"
            class="rc-results-stat"
            :title="`Mean chunks returned per query across ${filteredHistoryRecords.length} filtered record(s) — compare against top_k setting to gauge retrieval utilization`"
          >μ {{ historyMeanSourceCount }} src/q</span>
          <span
            v-if="historyDistinctQuestions && historyDistinctQuestions.distinct < historyDistinctQuestions.total"
            class="rc-results-stat"
            :title="`${historyDistinctQuestions.distinct} unique question(s) across ${historyDistinctQuestions.total} record(s) — repeated questions indicate A/B-style config/scope comparison`"
          >{{ historyDistinctQuestions.distinct }} unique q</span>
          <span
            v-if="historyZeroResultRate && historyZeroResultRate.zero > 0"
            class="rc-results-stat rc-results-stale"
            :title="`${historyZeroResultRate.zero}/${historyZeroResultRate.total} record(s) (${historyZeroResultRate.pct}%) returned 0 sources — signals KB gaps, overly-strict filters, or off-topic questions`"
          >∅ {{ historyZeroResultRate.zero }}/{{ historyZeroResultRate.total }} 0-res</span>
          <span
            v-if="historySlowRate && historySlowRate.slow > 0"
            class="rc-results-stat rc-results-stale"
            :title="`${historySlowRate.slow}/${historySlowRate.total} record(s) (${historySlowRate.pct}%) ≥5000ms — flags backend perf degradation, oversized contexts, or rerank/hybrid overhead piling up`"
          >⏱ {{ historySlowRate.slow }}/{{ historySlowRate.total }} slow</span>
          <el-select
            v-model="historyDateRange"
            size="small"
            placeholder="All time"
            class="rc-hist-range-filter"
          >
            <el-option label="last 24h" value="24h" />
            <el-option label="last 7d" value="7d" />
            <el-option label="last 30d" value="30d" />
            <el-option label="all time" value="all" />
          </el-select>
          <el-select
            v-if="historyScopeOptions.length > 1"
            v-model="historyScopeFilter"
            size="small"
            clearable
            placeholder="All scopes"
            class="rc-hist-scope-filter"
          >
            <el-option
              v-for="o in historyScopeOptions"
              :key="o.scope"
              :label="`${o.label} (${o.count})`"
              :value="o.scope"
            />
          </el-select>
          <el-input
            v-model="historyFilterText"
            size="small"
            clearable
            placeholder="Filter by question…"
            :prefix-icon="Search"
            class="rc-hist-filter"
          />
          <el-select
            v-model="retrievalConfigFilter"
            size="small"
            clearable
            placeholder="All configs"
            class="rc-hist-mode-filter"
          >
            <el-option label="hybrid on" value="hybrid" />
            <el-option label="rerank on" value="rerank" />
            <el-option label="citations on" value="citations" />
            <el-option label="plain (no hybrid/rerank)" value="plain" />
          </el-select>
          <label class="rc-thresh-toggle" :title="`Hide config chips + mini histogram — scan questions/stats faster`">
            <input type="checkbox" v-model="retrievalCompactMode" />
            <span>compact</span>
          </label>
          <el-button
            v-if="historyFilterText || retrievalConfigFilter || historyDateRange !== 'all' || historyScopeFilter"
            size="small"
            text
            :icon="Close"
            class="rc-hist-filter-reset"
            @click="historyFilterText = ''; retrievalConfigFilter = ''; historyDateRange = 'all'; historyScopeFilter = ''"
          >Reset</el-button>
        </div>
        <div v-if="historyLoading && !historyRecords.length" class="rc-empty">
          <el-icon :size="40"><Clock /></el-icon>
          <span>Loading…</span>
        </div>
        <div v-else-if="!historyRecords.length" class="rc-empty">
          <el-icon :size="40"><Clock /></el-icon>
          <span>No retrieval history yet — run a query in the Query tab.</span>
        </div>
        <div v-else-if="!filteredHistoryRecords.length" class="rc-empty">
          <el-icon :size="40"><Clock /></el-icon>
          <span>No records match "{{ historyFilterText }}".</span>
        </div>
        <div v-else class="rc-hist-list">
        <div v-if="scoreGradeBreakdown" class="rc-hist-grades" :title="`Source quality distribution — ${scoreGradeBreakdown.total} sources across ${filteredHistoryRecords.length} record${filteredHistoryRecords.length === 1 ? '' : 's'}`">
          <span class="rc-hist-spark-label">source grades</span>
          <div class="rc-hist-grades-track">
            <div
              v-for="g in scoreGradeBreakdown.buckets"
              :key="g.grade"
              class="rc-hist-grades-seg"
              :style="{ width: `${g.pct}%`, background: g.color }"
              :title="`${g.grade} (${g.count} source${g.count === 1 ? '' : 's'}, ${g.pct}%) — ${g.grade === 'A' ? '≥0.85' : g.grade === 'B' ? '0.70–0.85' : g.grade === 'C' ? '0.50–0.70' : '<0.50'}`"
            >
              <span v-if="g.pct >= 12" class="rc-hist-grades-seg-lbl">{{ g.grade }} · {{ g.count }}</span>
            </div>
          </div>
          <span class="rc-hist-grades-total">{{ scoreGradeBreakdown.total }} src</span>
        </div>
        <div v-if="bestWorstQuestion" class="rc-hist-bwq">
          <div class="rc-hist-bwq-row" :title="`Best-score question — ${bestWorstQuestion.best.topScore}% top · ${bestWorstQuestion.best.latency}ms`">
            <span class="rc-hist-bwq-lbl" :style="{ color: scoreColor(bestWorstQuestion.best.topScore / 100) }">best</span>
            <span class="rc-hist-bwq-q" @click="reuseHistoryQuestion(bestWorstQuestion.best.question)" :title="`Click to re-run — ${bestWorstQuestion.best.topScore}% · ${bestWorstQuestion.best.latency}ms`">{{ bestWorstQuestion.best.question }}</span>
            <span class="rc-hist-bwq-score" :style="{ color: scoreColor(bestWorstQuestion.best.topScore / 100) }">{{ bestWorstQuestion.best.topScore }}%</span>
          </div>
          <div class="rc-hist-bwq-row" :title="`Worst-score question — ${bestWorstQuestion.worst.topScore}% top · ${bestWorstQuestion.worst.latency}ms`">
            <span class="rc-hist-bwq-lbl" :style="{ color: scoreColor(bestWorstQuestion.worst.topScore / 100) }">worst</span>
            <span class="rc-hist-bwq-q" @click="reuseHistoryQuestion(bestWorstQuestion.worst.question)" :title="`Click to re-run — ${bestWorstQuestion.worst.topScore}% · ${bestWorstQuestion.worst.latency}ms`">{{ bestWorstQuestion.worst.question }}</span>
            <span class="rc-hist-bwq-score" :style="{ color: scoreColor(bestWorstQuestion.worst.topScore / 100) }">{{ bestWorstQuestion.worst.topScore }}%</span>
          </div>
        </div>
        <div v-if="topSourceFiles" class="rc-hist-topfiles" :title="`Top retrieved files — ${topSourceFiles.totalSources} source hits across ${topSourceFiles.totalRecords} record${topSourceFiles.totalRecords === 1 ? '' : 's'}`">
          <span class="rc-hist-spark-label">top source files</span>
          <div class="rc-hist-topfiles-list">
            <div
              v-for="f in topSourceFiles.entries"
              :key="f.path"
              class="rc-hist-topfiles-row"
              :title="`${f.path} — ${f.count} hit${f.count === 1 ? '' : 's'} (${f.pct}%) across ${f.appearances} record${f.appearances === 1 ? '' : 's'} · best score ${f.best}%`"
            >
              <span class="rc-hist-topfiles-name">{{ f.path.split("/").pop() }}</span>
              <span class="rc-hist-topfiles-path">{{ f.path }}</span>
              <div class="rc-hist-mode-bar-track">
                <div class="rc-hist-mode-bar" :style="{ width: `${f.pct}%`, background: 'var(--el-color-primary)' }" />
              </div>
              <div class="rc-hist-mode-bar-track" :title="`Best-score bar — width ∝ ${f.best}%`">
                <div class="rc-hist-mode-bar" :style="{ width: `${f.best}%`, background: scoreColor(f.best / 100) }" />
              </div>
              <span class="rc-hist-mode-count">{{ f.count }} · {{ f.pct }}%</span>
              <span class="rc-hist-topfiles-best" :style="{ color: scoreColor(f.best / 100) }" :title="`Best score ever seen for this file`">best {{ f.best }}%</span>
            </div>
          </div>
        </div>
        <div v-if="topRetrievedTags" class="rc-hist-topfiles rc-hist-toptags" :title="`Top frontmatter tags across retrieved sources — ${topRetrievedTags.totalHits} tag hits · ${topRetrievedTags.uniqueTags} unique`">
          <span class="rc-hist-spark-label">top tags</span>
          <div class="rc-hist-topfiles-list">
            <div
              v-for="t in topRetrievedTags.entries"
              :key="t.tag"
              class="rc-hist-topfiles-row"
              :title="`#${t.tag} — ${t.count} hit(s) across sources (${t.pct}%)`"
            >
              <span class="rc-hist-toptag-name">#{{ t.tag }}</span>
              <div class="rc-hist-mode-bar-track">
                <div class="rc-hist-mode-bar" :style="{ width: `${t.pct}%`, background: 'var(--el-color-success)' }" />
              </div>
              <span class="rc-hist-topfiles-pct">{{ t.count }} · {{ t.pct }}%</span>
            </div>
          </div>
        </div>
        <div v-if="configCost" class="rc-hist-cost" :title="`Mean latency per retrieval config — baseline: ${configCost.baseline ?? '—'}ms (plain vector)`">
          <span class="rc-hist-spark-label">config cost</span>
          <div class="rc-hist-cost-row">
            <span
              v-for="e in configCost.entries"
              :key="e.key"
              class="rc-hist-cost-chip"
              :class="{ 'is-winner': e.winner }"
              :title="`${e.label} — ${e.mean}ms avg · ${e.meanScore}% mean top_score${e.efficiency != null ? ` · ${e.efficiency} score-per-1ms (×100)` : ''} over ${e.n} query${e.n === 1 ? '' : 's'}${e.delta != null ? ` · ${e.delta >= 0 ? '+' : ''}${e.delta}ms (${e.deltaPct! >= 0 ? '+' : ''}${e.deltaPct}%) vs plain` : ''}${e.winner ? ` — best quality-per-ms` : ''}`"
            >
              <span v-if="e.winner" class="rc-hist-cost-chip-winner" :title="`Best quality-per-ms across configs`">✓</span>
              <span class="rc-hist-cost-chip-lbl">{{ e.label }}</span>
              <span class="rc-hist-cost-chip-val">{{ e.mean }}ms</span>
              <span
                v-if="e.meanScore != null"
                class="rc-hist-cost-chip-score"
                :style="{ color: scoreColor(e.meanScore / 100) }"
              >{{ e.meanScore }}%</span>
              <span
                v-if="e.p50 != null"
                class="rc-hist-cost-chip-pct"
                :title="`p50 ${e.p50}ms · p90 ${e.p90}ms${e.p50Delta != null ? ` · p50 ${e.p50Delta >= 0 ? '+' : ''}${e.p50Delta}ms vs plain` : ''}`"
              >p50 {{ e.p50 }} · p90 {{ e.p90 }}</span>
              <span
                v-if="e.delta != null"
                class="rc-hist-cost-chip-delta"
                :style="{ color: e.delta > 0 ? 'var(--el-color-danger)' : e.delta < 0 ? 'var(--el-color-success)' : 'var(--el-text-color-placeholder)' }"
              >{{ e.delta >= 0 ? '+' : '' }}{{ e.delta }}ms</span>
            </span>
          </div>
        </div>
        <!-- Config score-distribution bar chart — visualizes mean top_score
             per retrieval config combination (hybrid/rerank on/off). Bar
             width ∝ meanScore, color = quality band. Winner highlighted. -->
        <div v-if="configCost && configCost.entries.length >= 2" class="rc-hist-mode-bars" :title="`Mean top_score per retrieval config — bar width ∝ score, color = quality band`">
          <span class="rc-hist-spark-label">config score</span>
          <div class="rc-hist-mode-bars-list">
            <div
              v-for="e in configCost.entries"
              :key="e.key"
              class="rc-hist-mode-bars-row"
              :title="`${e.label} — ${e.meanScore}% mean top_score across ${e.n} query${e.n === 1 ? '' : 's'}${e.winner ? ' — best quality-per-ms' : ''}`"
            >
              <span class="rc-hist-mode-bars-lbl">{{ e.label }}</span>
              <div class="rc-hist-mode-bar-track">
                <div
                  class="rc-hist-mode-bar"
                  :class="{ 'is-winner': e.winner }"
                  :style="{ width: `${Math.max(4, e.meanScore)}%`, background: scoreColor(e.meanScore / 100) }"
                />
              </div>
              <span
                class="rc-hist-mode-bars-val"
                :style="{ color: scoreColor(e.meanScore / 100) }"
              >{{ e.meanScore }}%</span>
            </div>
          </div>
        </div>
        <div v-if="historyLatencySpark || historyScatter" class="rc-hist-viz">
          <div v-if="historyLatencySpark" class="rc-hist-spark" :title="`Latency trend (ms) — min ${historyLatencySpark.min} · mean ${historyLatencySpark.mean} · max ${historyLatencySpark.max} across ${historyLatencySpark.n} queries`">
            <svg :viewBox="`0 0 ${historyLatencySpark.W} ${historyLatencySpark.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="historyLatencySpark.pts" fill="none" stroke="var(--el-color-primary)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">latency trend</span>
            <span class="rc-hist-spark-stat">min {{ historyLatencySpark.min }}ms</span>
            <span class="rc-hist-spark-stat">mean {{ historyLatencySpark.mean }}ms</span>
            <span class="rc-hist-spark-stat">max {{ historyLatencySpark.max }}ms</span>
          </div>
          <div v-if="historyScoreSpark" class="rc-hist-spark" :title="`Top-score trend — min ${historyScoreSpark.min === 0 ? 0 : Math.round(historyScoreSpark.min * 100)}% · mean ${historyScoreSpark.mean}% · max ${historyScoreSpark.max}% across ${historyScoreSpark.n} queries`">
            <svg :viewBox="`0 0 ${historyScoreSpark.W} ${historyScoreSpark.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="historyScoreSpark.pts" fill="none" stroke="var(--el-color-success)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">score trend</span>
            <span class="rc-hist-spark-stat">mean {{ historyScoreSpark.mean }}%</span>
            <span class="rc-hist-spark-stat">max {{ historyScoreSpark.max }}%</span>
          </div>
          <div v-if="historyScoreSparkAvg" class="rc-hist-spark" :title="`Avg-score trend — mean ${Math.round(historyScoreSparkAvg.mean * 100)}% · min ${historyScoreSparkAvg.min === 0 ? 0 : Math.round(historyScoreSparkAvg.min * 100)}% · max ${Math.round(historyScoreSparkAvg.max * 100)}% across ${historyScoreSparkAvg.n} queries · downward drift flags KB drift / stale chunks / filter mismatch`">
            <svg :viewBox="`0 0 ${historyScoreSparkAvg.W} ${historyScoreSparkAvg.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="historyScoreSparkAvg.pts" fill="none" stroke="var(--el-color-warning)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">avg-score trend</span>
            <span class="rc-hist-spark-stat">μ {{ Math.round(historyScoreSparkAvg.mean * 100) }}%</span>
          </div>
          <div v-if="historyTokenSpark" class="rc-hist-spark" :title="`Token-budget trend — Σ metadata.token_estimate across retrieved sources per query · min ${historyTokenSpark.min} · mean ${historyTokenSpark.mean} · max ${historyTokenSpark.max} across ${historyTokenSpark.n} queries`">
            <svg :viewBox="`0 0 ${historyTokenSpark.W} ${historyTokenSpark.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="historyTokenSpark.pts" fill="none" stroke="var(--el-color-info)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">tokens trend</span>
            <span class="rc-hist-spark-stat">μ {{ historyTokenSpark.mean }}</span>
            <span class="rc-hist-spark-stat">max {{ historyTokenSpark.max }}</span>
          </div>
          <div v-if="historyScatter" class="rc-hist-scatter" :title="`Latency vs top-score — ${historyScatter.n} queries. Dots colored by retrieval mode.`">
            <div class="rc-hist-scatter-title">
              <span class="rc-hist-spark-label">latency × score</span>
              <span class="rc-hist-scatter-stats" :title="`latency: min ${historyScatter.minLat}ms · mean ${historyScatter.meanLat}ms · max ${historyScatter.maxLat}ms\nscore: min ${historyScatter.minScore}% · mean ${historyScatter.meanScore}% · max ${historyScatter.maxScore}% across ${historyScatter.n} queries`">
                <span>min {{ historyScatter.minLat }}</span>
                <span>μ {{ historyScatter.meanLat }}</span>
                <span>max {{ historyScatter.maxLat }}</span>
                <span class="rc-hist-scatter-stats-sep">·</span>
                <span :style="{ color: scoreColor(historyScatter.minScore / 100) }">{{ historyScatter.minScore }}%</span>
                <span :style="{ color: scoreColor(historyScatter.meanScore / 100) }">μ {{ historyScatter.meanScore }}%</span>
                <span :style="{ color: scoreColor(historyScatter.maxScore / 100) }">{{ historyScatter.maxScore }}%</span>
              </span>
              <span class="rc-hist-scatter-legend">
                <span class="rc-hist-scatter-legend-item"><i class="dot dot--plain" /> vector</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot dot--hybrid" /> hybrid</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot dot--rerank" /> +rerank</span>
              </span>
            </div>
            <svg :viewBox="`0 0 ${historyScatter.W} ${historyScatter.H}`" preserveAspectRatio="xMidYMid meet" class="rc-hist-scatter-svg" aria-hidden="true">
              <line :x1="historyScatter.pad" :y1="historyScatter.H - historyScatter.pad" :x2="historyScatter.W - historyScatter.pad" :y2="historyScatter.H - historyScatter.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <line :x1="historyScatter.pad" :y1="historyScatter.pad" :x2="historyScatter.pad" :y2="historyScatter.H - historyScatter.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <circle
                v-for="d in historyScatter.dots"
                :key="d.id"
                :cx="d.cx"
                :cy="d.cy"
                :r="d.r"
                :class="['rc-hist-scatter-dot', { 'is-hybrid': d.hybrid, 'is-rerank': d.rerank, 'is-active': selectedHistoryId === d.id }]"
                @click="selectHistoryRecord(d.id)"
              >
                <title>{{ d.lat }}ms · {{ Math.round(d.score * 100) }}%{{ d.hybrid ? ' · hybrid' : '' }}{{ d.rerank ? ' · rerank' : '' }} — click to highlight + scroll</title>
              </circle>
            </svg>
            <span class="rc-hist-scatter-axis">x: latency (ms) · y: top score (%)</span>
          </div>
        </div>
        <div
          v-for="r in filteredHistoryRecords"
          :key="r.id"
          :id="`rc-hist-rec-${r.id}`"
          class="rc-hist-item"
          :class="{ 'is-selected': selectedHistoryId === r.id, 'is-comparing': compareIds.includes(r.id) }"
        >
          <div class="rc-hist-hd">
            <el-checkbox
              :model-value="compareIds.includes(r.id)"
              size="small"
              :disabled="!compareIds.includes(r.id) && compareIds.length >= 2"
              :title="compareIds.includes(r.id) ? 'Remove from comparison' : (compareIds.length >= 2 ? 'Clear a comparison slot first' : 'Add to side-by-side comparison')"
              @change="toggleCompare(r.id)"
              class="rc-hist-compare-cb"
            />
            <span class="rc-hist-time" :title="r.timestamp">{{ r.timestamp.replace('T', ' ') }}</span>
            <span class="rc-hist-q" :title="r.question">{{ r.question }}</span>
            <span v-if="r.scope" class="rc-hist-scope" :title="`Scope: ${r.scope}`">{{ r.scope }}</span>
            <span
              class="rc-hist-stat rc-hist-stat--latency"
              :style="{ color: latencyBucket(r.latency_ms).color, borderColor: latencyBucket(r.latency_ms).color }"
              :title="historyLatencySpark && historyLatencySpark.mean
                ? `${latencyBucket(r.latency_ms).label} — ${r.latency_ms}ms · recent mean ${historyLatencySpark.mean}ms (${r.latency_ms > historyLatencySpark.mean ? '+' : ''}${Math.round((r.latency_ms - historyLatencySpark.mean) / historyLatencySpark.mean * 100)}%)`
                : `${latencyBucket(r.latency_ms).label} — ${r.latency_ms}ms`"
            >{{ latencyBucket(r.latency_ms).label }} · {{ r.latency_ms }}ms</span>
            <span class="rc-hist-stat" :title="`Top-k requested: ${r.top_k}`">k={{ r.top_k }}</span>
            <span class="rc-hist-stat" :title="`Sources returned: ${r.result_count}`">{{ r.result_count }} src</span>
            <span class="rc-hist-stat" :style="{ color: scoreColor(r.top_score) }" :title="`Top ${(r.top_score * 100).toFixed(0)}% · mean ${(r.avg_score * 100).toFixed(0)}%`">
              top {{ (r.top_score * 100).toFixed(0) }}%
            </span>
            <el-button size="small" text @click="reuseHistoryQuestion(r.question)">Re-run</el-button>
            <el-button
              size="small"
              text
              :icon="expandedSourcesRId === r.id ? ArrowDown : ArrowRight"
              :title="expandedSourcesRId === r.id ? 'Hide retrieved chunks' : 'Inspect retrieved chunks inline'"
              @click="toggleRecordSources(r.id)"
            >{{ expandedSourcesRId === r.id ? 'Hide' : 'Sources' }}</el-button>
            <el-tooltip :content="copiedQId === r.id ? 'Copied!' : 'Copy question'" placement="top">
              <el-button size="small" text :icon="Document" @click="copyQuestion(r.id, r.question)" />
            </el-tooltip>
          </div>
          <!-- Config chips — show which retrieval knobs were active. Lets
               the user compare latency/score across configs at a glance. -->
          <div v-if="r.config && !retrievalCompactMode" class="rc-hist-cfg">
            <span class="rc-hist-cfg-chip" :class="{ on: r.config.hybrid }">hybrid</span>
            <span class="rc-hist-cfg-chip" :class="{ on: r.config.rerank }">rerank</span>
            <span class="rc-hist-cfg-chip" :class="{ on: r.config.citations }">citations</span>
            <span v-if="r.config.num_queries > 1" class="rc-hist-cfg-chip" :title="`QueryFusionRetriever LLM query-variant count: ${r.config.num_queries}`">Q×{{ r.config.num_queries }}</span>
            <span v-if="r.config.category" class="rc-hist-cfg-chip rc-hist-cfg-chip--filter" :title="`MetadataFilter category='${r.config.category}'`">cat:{{ r.config.category }}</span>
            <span
              v-for="t in r.config.tags"
              :key="t"
              class="rc-hist-cfg-chip rc-hist-cfg-chip--filter"
              :title="`MetadataFilter tags includes '${t}'`"
            >#{{ t }}</span>
          </div>
          <!-- Mini score histogram — same shape as RagSources header -->
          <div v-if="r.sources.length && !retrievalCompactMode" class="rc-hist-hist" aria-hidden="true">
            <span
              v-for="(s, i) in r.sources"
              :key="i"
              class="rc-hist-hist-bar"
              :style="{ height: `${Math.max(4, Math.min(100, s.score * 100))}%`, background: scoreColor(s.score) }"
              :title="`${r.sources[i].file_path} · ${(s.score * 100).toFixed(0)}%`"
            />
          </div>
          <div v-if="expandedSourcesRId === r.id" class="rc-hist-recsrc">
            <div class="rc-hist-recsrc-toolbar">
              <span class="rc-hist-recsrc-summary">{{ r.sources.length }} chunk{{ r.sources.length === 1 ? '' : 's' }} · Σ {{ (r.sources.reduce((a, s) => a + (s.metadata?.token_estimate ?? 0), 0)).toLocaleString() }} tok</span>
              <el-tooltip :content="copiedRecSrcId === r.id ? 'Copied!' : 'Copy all chunks as JSON'" placement="top">
                <el-button size="small" text :icon="DocumentCopy" @click="copyRecordSources(r)" />
              </el-tooltip>
            </div>
            <div
              v-for="(s, i) in r.sources"
              :key="i"
              class="rc-hist-recsrc-item"
            >
              <div class="rc-hist-recsrc-hd">
                <span class="rc-hist-recsrc-idx" :style="{ color: scoreColor(s.score) }">#{{ i + 1 }}</span>
                <span class="rc-hist-recsrc-score" :style="{ color: scoreColor(s.score) }" :title="`Cosine similarity`">{{ (s.score * 100).toFixed(0) }}%</span>
                <span class="rc-hist-recsrc-path" :title="s.file_path" @click="preview(s.file_path)">
                  <el-icon :size="12"><Document /></el-icon>{{ s.file_path }}
                </span>
                <span
                  v-if="s.metadata?.token_estimate != null"
                  class="rc-hist-recsrc-tokens"
                  :title="`Token estimate (chars/4) — context window consumption`"
                >{{ (s.metadata.token_estimate as number).toLocaleString() }} tok</span>
              </div>
              <pre class="rc-hist-recsrc-text">{{ s.text.length > 600 ? s.text.slice(0, 600) + '…' : s.text }}</pre>
            </div>
          </div>
        </div>
        <div v-if="!filteredHistoryRecords.length" class="rc-hist-empty">
          <span>No records match the current filter.</span>
          <el-button size="small" text :icon="Close" @click="historyFilterText = ''; retrievalConfigFilter = ''; historyDateRange = 'all'; historyScopeFilter = ''">Clear filter</el-button>
        </div>
      </div>
      </template>
      <template v-else>
        <div v-if="chatCompareRecords.length" class="rc-cmp">
          <div class="rc-cmp-hd">
            <span class="rc-hist-spark-label">side-by-side comparison ({{ chatCompareRecords.length }}/2)</span>
            <el-button size="small" text :icon="Delete" @click="clearChatCompare">Clear</el-button>
          </div>
          <div class="rc-cmp-grid" :class="{ 'is-pair': chatCompareRecords.length === 2 }">
            <div v-for="(t, idx) in chatCompareRecords" :key="t.id" class="rc-cmp-cell" :class="{ 'is-winner': chatCompareWinnerSide === (idx === 0 ? 'left' : 'right') }">
              <div class="rc-cmp-cell-hd">
                <span v-if="chatCompareWinnerSide === (idx === 0 ? 'left' : 'right')" class="rc-cmp-winner" :title="`Higher composite (0.7×top + 0.3×avg − latency/10k)`">✓ winner</span>
                <span class="rc-hist-time">{{ t.timestamp.replace('T', ' ') }}</span>
                <span class="rc-cmp-cell-q" :title="t.question">{{ t.question }}</span>
                <span class="rc-hist-cfg-chip" :title="`chat engine mode`">{{ t.chat_mode }}</span>
              </div>
              <div class="rc-cmp-cell-stats">
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">latency</span>
                  <span class="rc-cmp-v">{{ t.latency_ms }}ms</span>
                </div>
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">top score</span>
                  <span class="rc-cmp-v" :style="{ color: scoreColor(t.top_score) }">{{ (t.top_score * 100).toFixed(0) }}%</span>
                </div>
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">mean</span>
                  <span class="rc-cmp-v" :style="{ color: scoreColor(t.avg_score) }">{{ (t.avg_score * 100).toFixed(0) }}%</span>
                </div>
                <div class="rc-cmp-stat">
                  <span class="rc-cmp-k">sources</span>
                  <span class="rc-cmp-v">{{ t.source_count }}</span>
                </div>
                <div v-if="chatTurnTokenBudget(t) != null" class="rc-cmp-stat">
                  <span class="rc-cmp-k">tokens</span>
                  <span class="rc-cmp-v rc-cmp-v--tokens" :title="`Sum of token_estimate across ${t.source_count} source(s)`">~{{ chatTurnTokenBudget(t)!.toLocaleString() }}</span>
                </div>
                <div v-if="t.scope" class="rc-cmp-stat">
                  <span class="rc-cmp-k">scope</span>
                  <span class="rc-cmp-v" :title="t.scope">{{ t.scope }}</span>
                </div>
              </div>
              <div v-if="t.config" class="rc-cmp-cfg">
                <span class="rc-hist-cfg-chip" :class="{ on: t.config.hybrid }">hybrid</span>
                <span class="rc-hist-cfg-chip" :class="{ on: t.config.rerank }">rerank</span>
                <span class="rc-hist-cfg-chip" :class="{ on: t.config.citations }">citations</span>
                <span v-if="t.config.num_queries > 1" class="rc-hist-cfg-chip">Q×{{ t.config.num_queries }}</span>
                <span v-if="t.config.category" class="rc-hist-cfg-chip rc-hist-cfg-chip--filter">cat:{{ t.config.category }}</span>
                <span
                  v-for="tag in t.config.tags"
                  :key="tag"
                  class="rc-hist-cfg-chip rc-hist-cfg-chip--filter"
                >#{{ tag }}</span>
              </div>
            </div>
            <div v-if="chatCompareRecords.length === 1" class="rc-cmp-cell rc-cmp-cell--empty">
              <span>Pick another turn to compare</span>
            </div>
          </div>
          <div v-if="chatCompareDelta" class="rc-cmp-delta">
            <span class="rc-hist-spark-label">Δ right − left</span>
            <div class="rc-cmp-delta-row">
              <span
                class="rc-cmp-delta-chip"
                :class="chatCompareDelta.latency_ms > 0 ? 'is-worse' : (chatCompareDelta.latency_ms < 0 ? 'is-better' : 'is-same')"
                :title="`Right is ${chatCompareDelta.latency_ms > 0 ? 'slower' : (chatCompareDelta.latency_ms < 0 ? 'faster' : 'same')} by ${Math.abs(chatCompareDelta.latency_ms)}ms`"
              >latency {{ chatCompareDelta.latency_ms > 0 ? '+' : '' }}{{ chatCompareDelta.latency_ms }}ms</span>
              <span
                class="rc-cmp-delta-chip"
                :class="chatCompareDelta.top_score_pct > 0 ? 'is-better' : (chatCompareDelta.top_score_pct < 0 ? 'is-worse' : 'is-same')"
                :title="`Right is ${chatCompareDelta.top_score_pct > 0 ? 'higher' : (chatCompareDelta.top_score_pct < 0 ? 'lower' : 'same')} by ${Math.abs(chatCompareDelta.top_score_pct).toFixed(0)}%`"
              >top score {{ chatCompareDelta.top_score_pct > 0 ? '+' : '' }}{{ chatCompareDelta.top_score_pct.toFixed(0) }}%</span>
              <span
                class="rc-cmp-delta-chip"
                :class="chatCompareDelta.avg_score_pct > 0 ? 'is-better' : (chatCompareDelta.avg_score_pct < 0 ? 'is-worse' : 'is-same')"
                :title="`Right is ${chatCompareDelta.avg_score_pct > 0 ? 'higher' : (chatCompareDelta.avg_score_pct < 0 ? 'lower' : 'same')} by ${Math.abs(chatCompareDelta.avg_score_pct).toFixed(0)}%`"
              >mean {{ chatCompareDelta.avg_score_pct > 0 ? '+' : '' }}{{ chatCompareDelta.avg_score_pct.toFixed(0) }}%</span>
              <span
                class="rc-cmp-delta-chip"
                :class="chatCompareDelta.sources > 0 ? 'is-better' : (chatCompareDelta.sources < 0 ? 'is-worse' : 'is-same')"
                :title="`Right returns ${chatCompareDelta.sources > 0 ? 'more' : (chatCompareDelta.sources < 0 ? 'fewer' : 'same')} sources by ${Math.abs(chatCompareDelta.sources)}`"
              >sources {{ chatCompareDelta.sources > 0 ? '+' : '' }}{{ chatCompareDelta.sources }}</span>
              <span
                v-if="chatCompareDelta.tokens != null"
                class="rc-cmp-delta-chip"
                :class="chatCompareDelta.tokens > 0 ? 'is-worse' : (chatCompareDelta.tokens < 0 ? 'is-better' : 'is-same')"
                :title="`Right consumes ${chatCompareDelta.tokens > 0 ? 'more' : (chatCompareDelta.tokens < 0 ? 'less' : 'same')} context by ${Math.abs(chatCompareDelta.tokens!)} tokens`"
              >tokens {{ chatCompareDelta.tokens > 0 ? '+' : '' }}{{ chatCompareDelta.tokens }}</span>
            </div>
          </div>
        </div>
        <div class="rc-hist-filter-row">
          <span v-if="chatTurns.length" class="rc-results-stat">{{ filteredChatTurns.length }}/{{ chatTurns.length }} shown · max {{ chatTurnsMax }}</span>
          <span
            v-if="chatMeanTopScore != null"
            class="rc-results-stat rc-results-score"
            :style="{ color: scoreColor(chatMeanTopScore / 100) }"
            :title="`Mean top_score across ${filteredChatTurns.length} filtered turn(s) — higher = better retrieval quality`"
          >μ top {{ chatMeanTopScore }}%</span>
          <span
            v-if="chatMeanLatency != null"
            class="rc-results-stat"
            :style="{ color: latencyBucket(chatMeanLatency).color, borderColor: latencyBucket(chatMeanLatency).color }"
            :title="`Mean latency across ${filteredChatTurns.length} filtered turn(s) — ${latencyBucket(chatMeanLatency).label}`"
          >μ {{ chatMeanLatency }}ms</span>
          <span
            v-if="chatStaleTurnCount && chatStaleTurnCount.stale > 0"
            class="rc-results-stat rc-results-stale"
            :title="`${chatStaleTurnCount.stale}/${chatStaleTurnCount.total} turn(s) (${chatStaleTurnCount.pct}%) pulled in at least one source >90 days old — consider rebuilding the index`"
          >⚠ {{ chatStaleTurnCount.stale }}/{{ chatStaleTurnCount.total }} stale</span>
          <span
            v-if="chatMeanTokens != null"
            class="rc-results-stat rc-results-tokens"
            :title="`Mean Σ metadata.token_estimate across ${filteredChatTurns.length} filtered turn(s) — lower = cheaper context`"
          >μ {{ chatMeanTokens }} tok</span>
          <span
            v-if="chatTokenLatencyCorr"
            class="rc-results-stat"
            :title="`Pearson r between token budget and latency across ${chatTokenLatencyCorr.n} turn(s) — ${chatTokenLatencyCorr.band} correlation. Positive = bigger ctx → slower; ~0 = no correlation; negative = bigger ctx → faster (caching).`"
            :style="{ color: chatTokenLatencyCorr.r > 0.5 ? 'var(--el-color-danger)' : chatTokenLatencyCorr.r > 0.2 ? 'var(--el-color-warning)' : 'var(--el-color-success)' }"
          >τ {{ chatTokenLatencyCorr.r > 0 ? '+' : '' }}{{ chatTokenLatencyCorr.r.toFixed(2) }}</span>
          <span
            v-if="chatScoreLatencyCorr"
            class="rc-results-stat"
            :title="`Pearson r between top_score and latency across ${chatScoreLatencyCorr.n} turn(s) — ${chatScoreLatencyCorr.band} correlation. Positive = slower → better scores (condense context worth it); ~0 = latency independent of score; negative = slower → worse scores (filter mismatch).`"
            :style="{ color: chatScoreLatencyCorr.r < -0.2 ? 'var(--el-color-danger)' : chatScoreLatencyCorr.r > 0.3 ? 'var(--el-color-success)' : 'var(--el-color-info)' }"
          >σ {{ chatScoreLatencyCorr.r > 0 ? '+' : '' }}{{ chatScoreLatencyCorr.r.toFixed(2) }}</span>
          <span
            v-if="chatQLenScoreCorr"
            class="rc-results-stat"
            :title="`Pearson r between question length (chars) and top_score across ${chatQLenScoreCorr.n} turn(s) — ${chatQLenScoreCorr.band} correlation. Positive = longer questions → better scores; ~0 = length agnostic; negative = longer questions confuse retriever (embedding dilution).`"
            :style="{ color: chatQLenScoreCorr.r < -0.2 ? 'var(--el-color-danger)' : chatQLenScoreCorr.r > 0.3 ? 'var(--el-color-success)' : 'var(--el-color-info)' }"
          >λ {{ chatQLenScoreCorr.r > 0 ? '+' : '' }}{{ chatQLenScoreCorr.r.toFixed(2) }}</span>
          <span
            v-if="chatMeanAnswerChars != null"
            class="rc-results-stat"
            :title="`Mean assistant answer length across ${filteredChatTurns.length} filtered turn(s) — higher = more verbose responses`"
          >μ {{ chatMeanAnswerChars >= 1000 ? (chatMeanAnswerChars / 1000).toFixed(1) + 'k' : chatMeanAnswerChars }} chars</span>
          <span
            v-if="chatMeanQuestionChars != null"
            class="rc-results-stat"
            :title="`Mean question length across ${filteredChatTurns.length} filtered turn(s) — higher = longer/multi-clause questions`"
          >μ {{ chatMeanQuestionChars >= 1000 ? (chatMeanQuestionChars / 1000).toFixed(1) + 'k' : chatMeanQuestionChars }} qchars</span>
          <span
            v-if="chatMeanSourceCount != null"
            class="rc-results-stat"
            :title="`Mean chunks returned per turn across ${filteredChatTurns.length} filtered turn(s) — chat engines may fetch more chunks than top_k via condense context`"
          >μ {{ chatMeanSourceCount }} src/t</span>
          <span
            v-if="chatDistinctQuestions && chatDistinctQuestions.distinct < chatDistinctQuestions.total"
            class="rc-results-stat"
            :title="`${chatDistinctQuestions.distinct} unique question(s) across ${chatDistinctQuestions.total} turn(s) — repeated questions indicate A/B-style mode comparison`"
          >{{ chatDistinctQuestions.distinct }} unique q</span>
          <span
            v-if="chatZeroResultRate && chatZeroResultRate.zero > 0"
            class="rc-results-stat rc-results-stale"
            :title="`${chatZeroResultRate.zero}/${chatZeroResultRate.total} turn(s) (${chatZeroResultRate.pct}%) returned 0 sources — signals KB gaps, overly-strict filters, or off-topic questions`"
          >∅ {{ chatZeroResultRate.zero }}/{{ chatZeroResultRate.total }} 0-res</span>
          <span
            v-if="chatSlowRate && chatSlowRate.slow > 0"
            class="rc-results-stat rc-results-stale"
            :title="`${chatSlowRate.slow}/${chatSlowRate.total} turn(s) (${chatSlowRate.pct}%) ≥5000ms — flags backend perf degradation, oversized contexts, or rerank/hybrid overhead piling up`"
          >⏱ {{ chatSlowRate.slow }}/{{ chatSlowRate.total }} slow</span>
          <el-input
            v-model="historyFilterText"
            size="small"
            clearable
            placeholder="Filter by question or answer…"
            :prefix-icon="Search"
            class="rc-hist-filter"
          />
          <el-select
            v-model="chatModeFilter"
            size="small"
            clearable
            placeholder="All modes"
            class="rc-hist-mode-filter"
          >
            <el-option label="condense_plus_context" value="condense_plus_context" />
            <el-option label="condense_question" value="condense_question" />
            <el-option label="context" value="context" />
            <el-option label="simple" value="simple" />
          </el-select>
          <label class="rc-thresh-toggle" :title="`Hide answer previews — scan questions/stats faster`">
            <input type="checkbox" v-model="chatCompactMode" />
            <span>compact</span>
          </label>
          <el-button
            v-if="historyFilterText || chatModeFilter || historyDateRange !== 'all' || historyScopeFilter"
            size="small"
            text
            :icon="Close"
            class="rc-hist-filter-reset"
            @click="historyFilterText = ''; chatModeFilter = ''; historyDateRange = 'all'; historyScopeFilter = ''"
          >Reset</el-button>
        </div>
        <div v-if="chatTurnsLoading && !chatTurns.length" class="rc-empty">
          <el-icon :size="40"><Clock /></el-icon>
          <span>Loading…</span>
        </div>
        <div v-else-if="!chatTurns.length" class="rc-empty">
          <el-icon :size="40"><Clock /></el-icon>
          <span>No chat history yet — send a message in the RAG chat to record a turn.</span>
        </div>
        <div v-else-if="!filteredChatTurns.length" class="rc-empty">
          <el-icon :size="40"><Clock /></el-icon>
          <span>No turns match "{{ historyFilterText }}".</span>
        </div>
        <template v-else>
          <div v-if="chatScoreGradeBreakdown" class="rc-hist-grades" :title="`Source quality distribution — ${chatScoreGradeBreakdown.total} sources across ${filteredChatTurns.length} turn${filteredChatTurns.length === 1 ? '' : 's'}`">
            <span class="rc-hist-spark-label">source grades</span>
            <div class="rc-hist-grades-track">
              <div
                v-for="g in chatScoreGradeBreakdown.buckets"
                :key="g.grade"
                class="rc-hist-grades-seg"
                :style="{ width: `${g.pct}%`, background: g.color }"
                :title="`${g.grade} (${g.count} source${g.count === 1 ? '' : 's'}, ${g.pct}%) — ${g.grade === 'A' ? '≥0.85' : g.grade === 'B' ? '0.70–0.85' : g.grade === 'C' ? '0.50–0.70' : '<0.50'}`"
              >
                <span v-if="g.pct >= 12" class="rc-hist-grades-seg-lbl">{{ g.grade }} · {{ g.count }}</span>
              </div>
            </div>
            <span class="rc-hist-grades-total">{{ chatScoreGradeBreakdown.total }} src</span>
          </div>
          <div v-if="chatBestWorstQuestion" class="rc-hist-bwq">
            <div class="rc-hist-bwq-row" :title="`Best-score question — ${chatBestWorstQuestion.best.topScore}% top · ${chatBestWorstQuestion.best.latency}ms`">
              <span class="rc-hist-bwq-lbl" :style="{ color: scoreColor(chatBestWorstQuestion.best.topScore / 100) }">best</span>
              <span class="rc-hist-bwq-q" @click="reuseHistoryQuestion(chatBestWorstQuestion.best.question)" :title="`Click to re-run — ${chatBestWorstQuestion.best.topScore}% · ${chatBestWorstQuestion.best.latency}ms`">{{ chatBestWorstQuestion.best.question }}</span>
              <span class="rc-hist-bwq-score" :style="{ color: scoreColor(chatBestWorstQuestion.best.topScore / 100) }">{{ chatBestWorstQuestion.best.topScore }}%</span>
            </div>
            <div class="rc-hist-bwq-row" :title="`Worst-score question — ${chatBestWorstQuestion.worst.topScore}% top · ${chatBestWorstQuestion.worst.latency}ms`">
              <span class="rc-hist-bwq-lbl" :style="{ color: scoreColor(chatBestWorstQuestion.worst.topScore / 100) }">worst</span>
              <span class="rc-hist-bwq-q" @click="reuseHistoryQuestion(chatBestWorstQuestion.worst.question)" :title="`Click to re-run — ${chatBestWorstQuestion.worst.topScore}% · ${chatBestWorstQuestion.worst.latency}ms`">{{ chatBestWorstQuestion.worst.question }}</span>
              <span class="rc-hist-bwq-score" :style="{ color: scoreColor(chatBestWorstQuestion.worst.topScore / 100) }">{{ chatBestWorstQuestion.worst.topScore }}%</span>
            </div>
          </div>
          <div v-if="chatTopSourceFiles" class="rc-hist-topfiles" :title="`Top retrieved files — ${chatTopSourceFiles.totalSources} source hits across ${chatTopSourceFiles.totalTurns} turn${chatTopSourceFiles.totalTurns === 1 ? '' : 's'}`">
            <span class="rc-hist-spark-label">top source files</span>
            <div class="rc-hist-topfiles-list">
              <div
                v-for="f in chatTopSourceFiles.entries"
                :key="f.path"
                class="rc-hist-topfiles-row"
                :title="`${f.path} — ${f.count} hit${f.count === 1 ? '' : 's'} (${f.pct}%) across ${f.appearances} turn${f.appearances === 1 ? '' : 's'} · best score ${f.best}%`"
              >
                <span class="rc-hist-topfiles-name">{{ f.path.split("/").pop() }}</span>
                <span class="rc-hist-topfiles-path">{{ f.path }}</span>
                <div class="rc-hist-mode-bar-track">
                  <div class="rc-hist-mode-bar" :style="{ width: `${f.pct}%`, background: 'var(--el-color-primary)' }" />
                </div>
                <div class="rc-hist-mode-bar-track" :title="`Best-score bar — width ∝ ${f.best}%`">
                  <div class="rc-hist-mode-bar" :style="{ width: `${f.best}%`, background: scoreColor(f.best / 100) }" />
                </div>
                <span class="rc-hist-mode-count">{{ f.count }} · {{ f.pct }}%</span>
                <span class="rc-hist-topfiles-best" :style="{ color: scoreColor(f.best / 100) }" :title="`Best score ever seen for this file`">best {{ f.best }}%</span>
              </div>
            </div>
          </div>
          <div v-if="chatTopRetrievedTags" class="rc-hist-topfiles rc-hist-toptags" :title="`Top frontmatter tags across chat sources — ${chatTopRetrievedTags.totalHits} tag hits · ${chatTopRetrievedTags.uniqueTags} unique`">
            <span class="rc-hist-spark-label">top tags</span>
            <div class="rc-hist-topfiles-list">
              <div
                v-for="t in chatTopRetrievedTags.entries"
                :key="t.tag"
                class="rc-hist-topfiles-row"
                :title="`#${t.tag} — ${t.count} hit(s) across chat sources (${t.pct}%)`"
              >
                <span class="rc-hist-toptag-name">#{{ t.tag }}</span>
                <div class="rc-hist-mode-bar-track">
                  <div class="rc-hist-mode-bar" :style="{ width: `${t.pct}%`, background: 'var(--el-color-success)' }" />
                </div>
                <span class="rc-hist-topfiles-pct">{{ t.count }} · {{ t.pct }}%</span>
              </div>
            </div>
          </div>
          <div v-if="chatModeBreakdown && chatModeBreakdown.length > 1" class="rc-hist-chat-modes">
            <span class="rc-hist-spark-label">chat engine mode</span>
            <div class="rc-hist-modes-bars">
              <div
                v-for="m in chatModeBreakdown"
                :key="m.mode"
                class="rc-hist-mode-row"
                :title="`${m.mode} — ${m.count} turn${m.count === 1 ? '' : 's'} (${m.pct}%)`"
              >
                <span class="rc-hist-mode-name">{{ m.mode }}</span>
                <div class="rc-hist-mode-bar-track">
                  <div class="rc-hist-mode-bar" :style="{ width: `${m.pct}%`, background: m.color }" />
                </div>
                <span class="rc-hist-mode-count">{{ m.count }} · {{ m.pct }}%</span>
              </div>
            </div>
          </div>
          <div v-if="chatModeLatencyCost" class="rc-hist-cost" :title="`Mean latency per chat engine mode — baseline: ${chatModeLatencyCost.baseline ?? '—'}ms (simple)`">
            <span class="rc-hist-spark-label">mode cost</span>
            <div class="rc-hist-cost-row">
              <span
                v-for="e in chatModeLatencyCost.entries"
                :key="e.mode"
                class="rc-hist-cost-chip"
                :class="{ 'is-winner': e.winner }"
                :title="`${e.mode} — ${e.mean}ms avg · ${e.meanScore}% mean top_score${e.efficiency != null ? ` · ${e.efficiency} score-per-1ms (×100)` : ''} over ${e.n} turn${e.n === 1 ? '' : 's'}${e.delta != null ? ` · ${e.delta >= 0 ? '+' : ''}${e.delta}ms (${e.deltaPct! >= 0 ? '+' : ''}${e.deltaPct}%) vs simple` : ''}${e.winner ? ` — best quality-per-ms` : ''}`"
              >
                <span v-if="e.winner" class="rc-hist-cost-chip-winner" :title="`Best quality-per-ms across chat modes`">✓</span>
                <span class="rc-hist-cost-chip-lbl">{{ e.mode }}</span>
                <span class="rc-hist-cost-chip-val">{{ e.mean }}ms</span>
                <span
                  v-if="e.meanScore != null"
                  class="rc-hist-cost-chip-score"
                  :style="{ color: scoreColor(e.meanScore / 100) }"
                >{{ e.meanScore }}%</span>
                <span
                  v-if="e.p50 != null"
                  class="rc-hist-cost-chip-pct"
                  :title="`p50 ${e.p50}ms · p90 ${e.p90}ms${e.p50Delta != null ? ` · p50 ${e.p50Delta >= 0 ? '+' : ''}${e.p50Delta}ms vs simple` : ''}`"
                >p50 {{ e.p50 }} · p90 {{ e.p90 }}</span>
                <span
                  v-if="e.delta != null"
                  class="rc-hist-cost-chip-delta"
                  :style="{ color: e.delta > 0 ? 'var(--el-color-danger)' : e.delta < 0 ? 'var(--el-color-success)' : 'var(--el-text-color-placeholder)' }"
                >{{ e.delta >= 0 ? '+' : '' }}{{ e.delta }}ms</span>
              </span>
            </div>
          </div>
          <!-- Mode score-distribution bar chart — visualizes mean top_score
               per chat engine mode so the user can see at a glance which mode
               produces the highest-quality retrieval. Bar width ∝ meanScore,
               color from scoreColor. Winner highlighted with green border. -->
          <div v-if="chatModeLatencyCost && chatModeLatencyCost.entries.length >= 2" class="rc-hist-mode-bars" :title="`Mean top_score per chat engine mode — bar width ∝ score, color = quality band`">
            <span class="rc-hist-spark-label">mode score</span>
            <div class="rc-hist-mode-bars-list">
              <div
                v-for="e in chatModeLatencyCost.entries"
                :key="e.mode"
                class="rc-hist-mode-bars-row"
                :title="`${e.mode} — ${e.meanScore}% mean top_score across ${e.n} turn${e.n === 1 ? '' : 's'}${e.winner ? ' — best quality-per-ms' : ''}`"
              >
                <span class="rc-hist-mode-bars-lbl">{{ e.mode }}</span>
                <div class="rc-hist-mode-bar-track">
                  <div
                    class="rc-hist-mode-bar"
                    :class="{ 'is-winner': e.winner }"
                    :style="{ width: `${Math.max(4, e.meanScore)}%`, background: scoreColor(e.meanScore / 100) }"
                  />
                </div>
                <span
                  class="rc-hist-mode-bars-val"
                  :style="{ color: scoreColor(e.meanScore / 100) }"
                >{{ e.meanScore }}%</span>
              </div>
            </div>
          </div>
          <div v-if="chatLatencySpark" class="rc-hist-spark" :title="`Chat latency trend (ms) — min ${chatLatencySpark.min} · mean ${chatLatencySpark.mean} · max ${chatLatencySpark.max} across ${chatLatencySpark.n} turns`">
            <svg :viewBox="`0 0 ${chatLatencySpark.W} ${chatLatencySpark.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="chatLatencySpark.pts" fill="none" stroke="var(--el-color-primary)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">chat latency</span>
            <span class="rc-hist-spark-stat">min {{ chatLatencySpark.min }}ms</span>
            <span class="rc-hist-spark-stat">mean {{ chatLatencySpark.mean }}ms</span>
            <span class="rc-hist-spark-stat">max {{ chatLatencySpark.max }}ms</span>
          </div>
          <div v-if="chatScoreSpark" class="rc-hist-spark" :title="`Chat top-score trend — min ${chatScoreSpark.min === 0 ? 0 : Math.round(chatScoreSpark.min * 100)}% · mean ${chatScoreSpark.mean}% · max ${chatScoreSpark.max}% across ${chatScoreSpark.n} turns`">
            <svg :viewBox="`0 0 ${chatScoreSpark.W} ${chatScoreSpark.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="chatScoreSpark.pts" fill="none" stroke="var(--el-color-success)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">chat score</span>
            <span class="rc-hist-spark-stat">mean {{ chatScoreSpark.mean }}%</span>
            <span class="rc-hist-spark-stat">max {{ chatScoreSpark.max }}%</span>
          </div>
          <div v-if="chatScoreSparkAvg" class="rc-hist-spark" :title="`Chat avg-score trend — mean ${Math.round(chatScoreSparkAvg.mean * 100)}% · min ${chatScoreSparkAvg.min === 0 ? 0 : Math.round(chatScoreSparkAvg.min * 100)}% · max ${Math.round(chatScoreSparkAvg.max * 100)}% across ${chatScoreSparkAvg.n} turns · downward drift flags KB drift / stale chunks / filter mismatch`">
            <svg :viewBox="`0 0 ${chatScoreSparkAvg.W} ${chatScoreSparkAvg.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="chatScoreSparkAvg.pts" fill="none" stroke="var(--el-color-warning)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">chat avg-score</span>
            <span class="rc-hist-spark-stat">μ {{ Math.round(chatScoreSparkAvg.mean * 100) }}%</span>
          </div>
          <div v-if="chatTokenSpark" class="rc-hist-spark" :title="`Chat token-budget trend — Σ metadata.token_estimate across sources per turn · min ${chatTokenSpark.min} · mean ${chatTokenSpark.mean} · max ${chatTokenSpark.max} across ${chatTokenSpark.n} turns`">
            <svg :viewBox="`0 0 ${chatTokenSpark.W} ${chatTokenSpark.H}`" preserveAspectRatio="none" class="rc-hist-spark-svg" aria-hidden="true">
              <polyline :points="chatTokenSpark.pts" fill="none" stroke="var(--el-color-info)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="rc-hist-spark-label">tokens trend</span>
            <span class="rc-hist-spark-stat">μ {{ chatTokenSpark.mean }}</span>
            <span class="rc-hist-spark-stat">max {{ chatTokenSpark.max }}</span>
          </div>
          <div v-if="chatScatter" class="rc-hist-scatter" :title="`Chat latency vs top-score — ${chatScatter.n} turns. Dots colored by chat engine mode.`">
            <div class="rc-hist-scatter-title">
              <span class="rc-hist-spark-label">chat latency × score</span>
              <span class="rc-hist-scatter-stats" :title="`latency: min ${chatScatter.minLat}ms · mean ${chatScatter.meanLat}ms · max ${chatScatter.maxLat}ms\nscore: min ${chatScatter.minScore}% · mean ${chatScatter.meanScore}% · max ${chatScatter.maxScore}% across ${chatScatter.n} turns`">
                <span>min {{ chatScatter.minLat }}</span>
                <span>μ {{ chatScatter.meanLat }}</span>
                <span>max {{ chatScatter.maxLat }}</span>
                <span class="rc-hist-scatter-stats-sep">·</span>
                <span :style="{ color: scoreColor(chatScatter.minScore / 100) }">{{ chatScatter.minScore }}%</span>
                <span :style="{ color: scoreColor(chatScatter.meanScore / 100) }">μ {{ chatScatter.meanScore }}%</span>
                <span :style="{ color: scoreColor(chatScatter.maxScore / 100) }">{{ chatScatter.maxScore }}%</span>
              </span>
              <span class="rc-hist-scatter-legend">
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-color-primary)' }" /> condense+ctx</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-color-success)' }" /> condense_q</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-color-warning)' }" /> context</span>
                <span class="rc-hist-scatter-legend-item"><i class="dot" :style="{ background: 'var(--el-text-color-secondary)' }" /> simple</span>
              </span>
            </div>
            <svg :viewBox="`0 0 ${chatScatter.W} ${chatScatter.H}`" preserveAspectRatio="xMidYMid meet" class="rc-hist-scatter-svg" aria-hidden="true">
              <line :x1="chatScatter.pad" :y1="chatScatter.H - chatScatter.pad" :x2="chatScatter.W - chatScatter.pad" :y2="chatScatter.H - chatScatter.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <line :x1="chatScatter.pad" :y1="chatScatter.pad" :x2="chatScatter.pad" :y2="chatScatter.H - chatScatter.pad" stroke="var(--el-border-color)" stroke-width="0.5" />
              <circle
                v-for="d in chatScatter.dots"
                :key="d.id"
                :cx="d.cx"
                :cy="d.cy"
                :r="d.r"
                :style="{ fill: d.color }"
                class="rc-hist-scatter-dot"
                @click="selectChatTurn(d.id)"
              >
                <title>{{ d.lat }}ms · {{ Math.round(d.score * 100) }}% · {{ d.mode }} — click to expand + scroll</title>
              </circle>
            </svg>
            <span class="rc-hist-scatter-axis">x: latency (ms) · y: top score (%)</span>
          </div>
          <div class="rc-hist-list">
          <div
            v-for="t in filteredChatTurns"
            :key="t.id"
            :id="`rc-hist-turn-${t.id}`"
            class="rc-hist-item rc-hist-item--chat"
            :class="{ 'is-expanded': expandedChatId === t.id, 'is-comparing': chatCompareIds.includes(t.id) }"
          >
            <div class="rc-hist-hd">
              <el-checkbox
                :model-value="chatCompareIds.includes(t.id)"
                size="small"
                :disabled="!chatCompareIds.includes(t.id) && chatCompareIds.length >= 2"
                :title="chatCompareIds.includes(t.id) ? 'Remove from comparison' : (chatCompareIds.length >= 2 ? 'Clear a comparison slot first' : 'Add to side-by-side comparison')"
                @change="toggleChatCompare(t.id)"
                class="rc-hist-compare-cb"
              />
              <span class="rc-hist-time" :title="t.timestamp">{{ t.timestamp.replace('T', ' ') }}</span>
              <span class="rc-hist-q" :title="t.question">{{ t.question }}</span>
              <span v-if="t.scope" class="rc-hist-scope" :title="`Scope: ${t.scope}`">{{ t.scope }}</span>
              <span class="rc-hist-stat" :title="`llama_index chat engine mode`">{{ t.chat_mode }}</span>
              <span
                class="rc-hist-stat rc-hist-stat--latency"
                :style="{ color: latencyBucket(t.latency_ms).color, borderColor: latencyBucket(t.latency_ms).color }"
                :title="chatLatencySpark && chatLatencySpark.mean
                  ? `${latencyBucket(t.latency_ms).label} — ${t.latency_ms}ms (stream → last token) · recent mean ${chatLatencySpark.mean}ms (${t.latency_ms > chatLatencySpark.mean ? '+' : ''}${Math.round((t.latency_ms - chatLatencySpark.mean) / chatLatencySpark.mean * 100)}%)`
                  : `${latencyBucket(t.latency_ms).label} — ${t.latency_ms}ms (stream → last token)`"
              >{{ latencyBucket(t.latency_ms).label }} · {{ t.latency_ms }}ms</span>
              <span class="rc-hist-stat" :title="`Sources returned: ${t.source_count}`">{{ t.source_count }} src</span>
              <span
                v-if="chatTurnTokenBudget(t) != null"
                class="rc-hist-stat rc-hist-stat--tokens"
                :title="`Sum of token_estimate across ${t.source_count} source(s) — context consumed by this chat turn`"
              >~{{ chatTurnTokenBudget(t)!.toLocaleString() }}t</span>
              <span class="rc-hist-stat" :style="{ color: scoreColor(t.top_score) }" :title="`Top ${(t.top_score * 100).toFixed(0)}% · mean ${(t.avg_score * 100).toFixed(0)}%`">
                top {{ (t.top_score * 100).toFixed(0) }}%
              </span>
              <el-button size="small" text @click="expandedChatId = expandedChatId === t.id ? null : t.id">
                {{ expandedChatId === t.id ? 'Collapse' : 'Expand' }}
              </el-button>
              <el-button size="small" text @click="reuseHistoryQuestion(t.question)">Re-run</el-button>
              <el-tooltip :content="copiedQId === t.id ? 'Copied!' : 'Copy question'" placement="top">
                <el-button size="small" text :icon="Document" @click="copyQuestion(t.id, t.question)" />
              </el-tooltip>
              <el-tooltip :content="chatAnswerCopiedId === t.id ? 'Copied!' : 'Copy assistant answer'" placement="top">
                <el-button size="small" text :icon="Document" @click="copyChatAnswer(t)" />
              </el-tooltip>
              <el-tooltip :content="copiedChatSrcId === t.id ? 'Copied!' : 'Copy sources as JSON'" placement="top">
                <el-button size="small" text :icon="DocumentCopy" :disabled="!t.sources.length" @click="copyChatTurnSources(t)" />
              </el-tooltip>
            </div>
            <div v-if="expandedChatId === t.id" class="rc-hist-chat-answer rc-hist-chat-answer--full">{{ t.answer }}</div>
            <div v-else-if="!chatCompactMode" class="rc-hist-chat-answer" :title="t.answer">{{ t.answer.length > 280 ? t.answer.slice(0, 280) + '…' : t.answer }}</div>
            <div v-if="t.config" class="rc-hist-cfg">
              <span class="rc-hist-cfg-chip" :class="{ on: t.config.hybrid }">hybrid</span>
              <span class="rc-hist-cfg-chip" :class="{ on: t.config.rerank }">rerank</span>
              <span class="rc-hist-cfg-chip" :class="{ on: t.config.citations }">citations</span>
              <span v-if="t.config.num_queries > 1" class="rc-hist-cfg-chip" :title="`QueryFusionRetriever LLM query-variant count: ${t.config.num_queries}`">Q×{{ t.config.num_queries }}</span>
              <span v-if="t.config.category" class="rc-hist-cfg-chip rc-hist-cfg-chip--filter" :title="`MetadataFilter category='${t.config.category}'`">cat:{{ t.config.category }}</span>
              <span
                v-for="tag in t.config.tags"
                :key="tag"
                class="rc-hist-cfg-chip rc-hist-cfg-chip--filter"
                :title="`MetadataFilter tags includes '${tag}'`"
              >#{{ tag }}</span>
            </div>
            <RagSources v-if="expandedChatId === t.id && t.sources.length" :sources="t.sources" />
            <div v-else-if="t.sources.length" class="rc-hist-hist" aria-hidden="true">
              <span
                v-for="(s, i) in t.sources"
                :key="i"
                class="rc-hist-hist-bar"
                :style="{ height: `${Math.max(4, Math.min(100, s.score * 100))}%`, background: scoreColor(s.score) }"
                :title="`${t.sources[i].file_path} · ${(s.score * 100).toFixed(0)}%`"
              />
            </div>
          </div>
        </div>
        <div v-if="!filteredChatTurns.length" class="rc-hist-empty">
          <span>No chat turns match the current filter.</span>
          <el-button size="small" text :icon="Close" @click="historyFilterText = ''; chatModeFilter = ''; historyDateRange = 'all'; historyScopeFilter = ''">Clear filter</el-button>
        </div>
        </template>
      </template>
    </div>

    <!-- Preview -->
    <el-dialog v-model="fp.visible" :title="fp.title" width="800px" top="5vh" append-to-body :close-on-click-modal="true">
      <div v-if="fp.loading" class="rc-fp-loading">Loading…</div>
      <div v-else class="rc-fp-body" v-html="fp.html" />
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
// ── Context bar ──
.rc-ctx { margin-bottom: 14px; padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); transition: background .2s; }
.rc-ctx--on { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-7); }
.rc-ctx-top { display: flex; gap: 8px; align-items: center; }
.rc-ctx-icon { font-size: 16px; }
.rc-ctx-n { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.rc-ctx-scope { font-size: 11px; padding: 1px 8px; background: var(--el-color-primary-light-7); color: var(--el-color-primary); border-radius: 3px; font-family: "SF Mono",Menlo,monospace; }
.rc-ctx-empty-tag { font-size: 12px; color: var(--el-text-color-placeholder); }
.rc-ctx-list { margin-top: 10px; display: flex; gap: 4px 8px; flex-wrap: wrap; align-items: baseline; }
.rc-ctx-dir { font-size: 11px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-secondary); }
.rc-ctx-file { font-size: 12px; padding: 2px 8px; background: var(--el-color-primary-light-8); color: var(--el-color-primary); border-radius: 4px; cursor: pointer; font-weight: 500; transition: background .1s; &:hover { background: var(--el-color-primary-light-6); color: #fff; } }

// ── Tabs ──
.rc-tabs { display: flex; gap: 0; margin-bottom: 18px; border-bottom: 2px solid var(--el-border-color-lighter); }
.rc-tab { display: inline-flex; gap: 6px; align-items: center; padding: 8px 22px; font-size: 13px; font-weight: 500; color: var(--el-text-color-secondary); cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .15s,border-color .15s; }
.rc-tab-count {
  font-size: 10px; font-weight: 700;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  padding: 0 5px; min-width: 14px; height: 14px; line-height: 14px;
  text-align: center; border-radius: 7px;
  background: var(--el-fill-color);
  color: var(--el-text-color-placeholder);
}
.rc-tab.on .rc-tab-count { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.rc-tab:hover { color: var(--el-text-color-primary); }
.rc-tab.on { color: var(--el-color-primary); border-bottom-color: var(--el-color-primary); }
.rc-body { min-height: 260px; }
.rc-err { padding: 10px 14px; margin-top: 8px; font-size: 13px; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border-radius: 8px; }

// ── Search ──
.rc-search { display: flex; flex-direction: column; gap: 8px; }
.rc-search-opts { display: flex; gap: 16px; align-items: center; label { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--el-text-color-secondary); } }
.rc-scope-badge { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; color: var(--el-color-primary); code { font-size: 11px; padding: 1px 8px; background: var(--el-fill-color); border-radius: 3px; } }

// ── Metadata filters row (llama_index MetadataFilters) ──
.rc-meta-filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; padding-top: 4px; }
.rc-meta-field { display: inline-flex; gap: 6px; align-items: center; }
.rc-meta-label { font-size: 10px; font-family: "SF Mono", Menlo, monospace; text-transform: uppercase; letter-spacing: .4px; color: var(--el-text-color-placeholder); }
.rc-meta-warn { font-size: 10px; font-family: "SF Mono", Menlo, monospace; color: var(--el-color-warning); background: var(--el-color-warning-light-9); padding: 1px 6px; border-radius: 8px; }

// ── Per-query toggles ──
.rc-toggles { display: inline-flex; gap: 4px; align-items: center; }
.rc-toggle {
  padding: 2px 10px; font-size: 11px; font-weight: 600; line-height: 1.5;
  font-family: "SF Mono",Menlo,monospace;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px; cursor: pointer; user-select: none;
  transition: background .12s, color .12s, border-color .12s;
  &:hover:not(:disabled) { background: var(--el-fill-color-light); }
  &.on { color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-7); }
  &:disabled { opacity: .5; cursor: not-allowed; }
}

// ── Loading ──
.rc-loading { display: flex; flex-direction: column; gap: 10px; align-items: center; padding: 48px 0; font-size: 13px; color: var(--el-text-color-placeholder); }
.rc-loading-dots { display: flex; gap: 6px; span { width: 8px; height: 8px; border-radius: 50%; background: var(--el-color-primary-light-5); animation: rc-bounce 1.2s ease-in-out infinite; &:nth-child(2) { animation-delay: .2s; } &:nth-child(3) { animation-delay: .4s; } } }
@keyframes rc-bounce { 0%,80%,100% { transform: scale(.6); opacity: .4; } 40% { transform: scale(1); opacity: 1; } }

// ── Results ──
.rc-results { margin-top: 14px; }
.rc-results-hd { display: flex; gap: 12px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; }
.rc-results-stat { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); padding: 2px 10px; background: var(--el-fill-color-lighter); border-radius: 4px; }
.rc-results-tokens { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.rc-results-score { background: var(--el-fill-color-lighter); }
.rc-results-stale { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
.rc-results-nudge { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 8px 12px; background: var(--el-color-warning-light-9); border: 1px solid var(--el-color-warning-light-7); border-radius: 6px; color: var(--el-text-color-regular); font-size: 12px; }
.rc-results-nudge .el-icon { color: var(--el-color-warning); }
.rc-nudge-text { flex: 1; }
.rc-results-latency { border: 1px solid currentColor; font-variant-numeric: tabular-nums; }

// ── History tab ──
.rc-hd-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.rc-hd-actions { display: flex; gap: 6px; margin-left: auto; }
.rc-hist-subtabs { display: flex; gap: 0; border: 1px solid var(--el-border-color-lighter); border-radius: 6px; overflow: hidden; }
.rc-hist-subtab {
  appearance: none; border: none; background: transparent;
  padding: 4px 10px; font-size: 12px; color: var(--el-text-color-secondary);
  cursor: pointer; display: inline-flex; gap: 6px; align-items: center;
  border-right: 1px solid var(--el-border-color-lighter);
  transition: background .1s, color .1s;
  &:last-child { border-right: none; }
  &:hover { background: var(--el-fill-color-light); color: var(--el-text-color-primary); }
  &.active { background: var(--el-color-primary-light-9); color: var(--el-color-primary); font-weight: 600; }
}
.rc-hist-filter-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
.rc-hist-filter { max-width: 280px; margin-left: auto; }
.rc-hist-mode-filter { width: 180px; }
.rc-hist-range-filter { width: 130px; }
.rc-hist-scope-filter { width: 220px; }
.rc-hist-filter-reset { margin-left: auto; }
.rc-hist-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center; padding: 24px 12px; color: var(--el-text-color-placeholder); font-size: 12px; }

.rc-hist-compare-cb { margin-right: 4px; flex: 0 0 auto; }
.rc-hist-item.is-comparing {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.rc-cmp {
  margin-bottom: 10px;
  padding: 10px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
}
.rc-cmp-hd { display: flex; gap: 8px; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.rc-cmp-grid { display: grid; grid-template-columns: 1fr; gap: 6px; }
.rc-cmp-grid.is-pair { grid-template-columns: 1fr 1fr; }
.rc-cmp-cell {
  padding: 8px 10px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.rc-cmp-cell.is-winner { border-color: var(--el-color-success); background: var(--el-color-success-light-9); }
.rc-cmp-winner { font-size: 10px; font-weight: 700; color: var(--el-color-success); padding: 1px 6px; border: 1px solid var(--el-color-success-light-7); border-radius: 4px; flex-shrink: 0; align-self: center; }
.rc-cmp-cell--empty {
  display: flex; align-items: center; justify-content: center;
  color: var(--el-text-color-placeholder); font-size: 12px;
  border: 1px dashed var(--el-border-color);
  background: transparent;
}
.rc-cmp-cell-hd { display: flex; gap: 8px; align-items: baseline; margin-bottom: 6px; }
.rc-cmp-cell-q { font-size: 12px; font-weight: 500; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.rc-cmp-cell-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 8px; margin-bottom: 4px; }
.rc-cmp-stat { display: flex; flex-direction: column; gap: 1px; }
.rc-cmp-k { font-size: 10px; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .03em; }
.rc-cmp-v { font-size: 12px; font-family: "SF Mono", Menlo, monospace; color: var(--el-text-color-primary); font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; }
.rc-cmp-v--tokens { color: var(--el-color-primary); }
.rc-cmp-cfg { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }

.rc-cmp-delta { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--el-border-color); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.rc-cmp-delta-row { display: flex; gap: 6px; flex-wrap: wrap; }
.rc-cmp-delta-chip {
  font-size: 11px; font-family: "SF Mono", Menlo, monospace;
  padding: 2px 8px; border-radius: 4px;
  background: var(--el-fill-color-lighter); color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color-lighter);
  font-variant-numeric: tabular-nums;
  &.is-better { background: var(--el-color-success-light-9); color: var(--el-color-success); border-color: var(--el-color-success-light-7); }
  &.is-worse { background: var(--el-color-danger-light-9); color: var(--el-color-danger); border-color: var(--el-color-danger-light-7); }
  &.is-same { background: var(--el-fill-color-lighter); color: var(--el-text-color-placeholder); }
}
.rc-hist-chat-modes {
  padding: 8px 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex; gap: 12px; align-items: center;
}
.rc-hist-modes-bars { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.rc-hist-mode-row { display: flex; gap: 8px; align-items: center; font-size: 11px; }
.rc-hist-mode-name {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px; color: var(--el-text-color-secondary);
  min-width: 150px;
}
.rc-hist-mode-bar-track { flex: 1; height: 6px; background: var(--el-fill-color-dark); border-radius: 3px; overflow: hidden; }
.rc-hist-mode-bar { height: 100%; border-radius: 3px; transition: width .2s; }
.rc-hist-mode-count { font-size: 10px; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; min-width: 60px; text-align: right; }
.rc-hist-topfiles-best { font-size: 10px; font-weight: 600; font-variant-numeric: tabular-nums; font-family: "SF Mono",Menlo,monospace; min-width: 56px; text-align: right; }
.rc-hist-mode-bars { margin-top: 6px; padding: 6px 8px; border: 1px solid var(--el-border-color-light); border-radius: 4px; background: var(--el-fill-color-light); }
.rc-hist-mode-bars-list { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
.rc-hist-mode-bars-row { display: flex; align-items: center; gap: 8px; }
.rc-hist-mode-bars-lbl { font-size: 11px; min-width: 150px; color: var(--el-text-color-regular); font-family: "SF Mono",Menlo,monospace; }
.rc-hist-mode-bars-val { font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; font-family: "SF Mono",Menlo,monospace; min-width: 38px; text-align: right; }
.rc-hist-mode-bars .rc-hist-mode-bar.is-winner { box-shadow: 0 0 0 1.5px var(--el-color-success) inset; }
.rc-hist-chat-answer {
  margin: 4px 0 6px;
  padding: 6px 10px;
  background: var(--el-fill-color);
  border-left: 2px solid var(--el-color-primary-light-5);
  border-radius: 0 4px 4px 0;
  font-size: 12px; line-height: 1.5;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  max-height: 100px; overflow: hidden;
}
.rc-hist-chat-answer--full { max-height: none; overflow: visible; }
.rc-hist-item--chat.is-expanded {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
.rc-hist-list { display: flex; flex-direction: column; gap: 6px; }
.rc-hist-spark {
  display: flex; gap: 8px; align-items: center;
  padding: 6px 10px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 6px;
  margin-bottom: 4px;
}
.rc-hist-spark-svg { width: 120px; height: 28px; flex: 0 0 120px; display: block; }
.rc-hist-spark-label { font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .04em; }
.rc-hist-spark-stat { font-size: 11px; font-family: "SF Mono", Menlo, monospace; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; }

.rc-hist-viz { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }

.rc-hist-grades {
  display: flex; gap: 10px; align-items: center;
  padding: 6px 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  margin-bottom: 8px;
}
.rc-hist-grades-track {
  flex: 1;
  display: flex;
  height: 22px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
}
.rc-hist-grades-seg {
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 10px; font-weight: 600;
  font-family: "SF Mono", Menlo, monospace;
  transition: width .2s;
  min-width: 0;
  &:hover { filter: brightness(1.08); }
}
.rc-hist-grades-seg-lbl { white-space: nowrap; padding: 0 4px; }
.rc-hist-grades-total {
  font-size: 11px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 50px; text-align: right;
}
.rc-hist-bwq { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; padding: 6px 10px; background: var(--el-fill-color-lighter); border-radius: 6px; }
.rc-hist-bwq-row { display: flex; gap: 8px; align-items: center; font-size: 12px; }
.rc-hist-bwq-lbl { font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: .4px; min-width: 36px; }
.rc-hist-bwq-q { flex: 1; color: var(--el-color-primary); cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-hist-bwq-q:hover { text-decoration: underline; }
.rc-hist-bwq-score { font-weight: 700; font-family: "SF Mono",Menlo,monospace; font-size: 11px; }

.rc-hist-topfiles {
  padding: 6px 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex; gap: 12px; align-items: center;
}
.rc-hist-cost {
  padding: 6px 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
}
.rc-hist-cost-row { flex: 1; display: flex; gap: 6px; flex-wrap: wrap; }
.rc-hist-cost-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 4px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 11px;
}
.rc-hist-cost-chip.is-winner { border-color: var(--el-color-success); background: var(--el-color-success-light-9); }
.rc-hist-cost-chip-winner { color: var(--el-color-success); font-weight: 700; }
.rc-hist-cost-chip-lbl { color: var(--el-text-color-secondary); }
.rc-hist-cost-chip-val { font-weight: 700; color: var(--el-text-color-primary); font-family: "SF Mono",Menlo,monospace; }
.rc-hist-cost-chip-score { font-size: 10px; font-weight: 600; font-family: "SF Mono",Menlo,monospace; }
.rc-hist-cost-chip-pct { font-size: 10px; color: var(--el-text-color-secondary); font-family: "SF Mono",Menlo,monospace; }
.rc-hist-cost-chip-delta { font-size: 10px; font-weight: 600; }
.rc-hist-topfiles-list { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.rc-hist-topfiles-row { display: flex; gap: 8px; align-items: center; font-size: 11px; }
.rc-hist-topfiles-name {
  font-size: 11px; font-weight: 600; color: var(--el-text-color-primary);
  min-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rc-hist-toptag-name {
  font-size: 11px; font-weight: 600; color: var(--el-color-success);
  min-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: "SF Mono", Menlo, monospace;
}
.rc-hist-topfiles-pct {
  font-size: 10px; color: var(--el-text-color-secondary); font-family: "SF Mono",Menlo,monospace; min-width: 56px; text-align: right;
}
.rc-hist-topfiles-path {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px; color: var(--el-text-color-placeholder);
  min-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rc-hist-scatter {
  padding: 8px 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.rc-hist-scatter-title { display: flex; gap: 8px; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.rc-hist-scatter-stats { display: inline-flex; gap: 8px; font-size: 10px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-secondary); }
.rc-hist-scatter-stats-sep { color: var(--el-text-color-placeholder); margin: 0 2px; }
.rc-hist-scatter-legend { display: flex; gap: 10px; }
.rc-hist-scatter-legend-item { font-size: 10px; color: var(--el-text-color-secondary); display: inline-flex; gap: 4px; align-items: center; }
.rc-hist-scatter-legend-item .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.rc-hist-scatter-legend-item .dot--plain { background: var(--el-text-color-placeholder); }
.rc-hist-scatter-legend-item .dot--hybrid { background: var(--el-color-primary); }
.rc-hist-scatter-legend-item .dot--rerank { background: var(--el-color-success); }
.rc-hist-scatter-svg { width: 100%; height: 80px; display: block; }
.rc-hist-scatter-axis { display: block; margin-top: 2px; font-size: 10px; color: var(--el-text-color-placeholder); text-align: center; }
.rc-hist-scatter-dot { fill: var(--el-text-color-placeholder); transition: r .1s, fill .1s; cursor: pointer; &:hover { r: 5; } }
.rc-hist-scatter-dot.is-hybrid { fill: var(--el-color-primary); }
.rc-hist-scatter-dot.is-rerank { fill: var(--el-color-success); }
.rc-hist-scatter-dot.is-hybrid.is-rerank { fill: var(--el-color-success); stroke: var(--el-color-primary); stroke-width: 1; }
.rc-hist-scatter-dot.is-active { r: 6; stroke: var(--el-color-danger); stroke-width: 1.5; }
.rc-hist-item.is-selected {
  border-color: var(--el-color-danger-light-5);
  box-shadow: 0 0 0 2px var(--el-color-danger-light-7);
  background: var(--el-color-danger-light-9);
}
.rc-hist-item {
  padding: 8px 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.rc-hist-hd {
  display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
  font-size: 11px;
}
.rc-hist-time {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px; color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
.rc-hist-q {
  flex: 1; min-width: 200px;
  font-size: 12px; color: var(--el-text-color-primary); font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rc-hist-scope {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px; color: var(--el-color-primary);
  padding: 1px 5px; background: var(--el-color-primary-light-9); border-radius: 4px;
  max-width: 160px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rc-hist-stat {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px; color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}
.rc-hist-stat--latency { border: 1px solid currentColor; padding: 1px 5px; border-radius: 3px; }
.rc-hist-stat--tokens { color: var(--el-color-primary); background: var(--el-color-primary-light-9); padding: 1px 5px; border-radius: 3px; }
.rc-hist-hist {
  display: flex; gap: 1px; align-items: flex-end;
  height: 12px; margin-top: 4px;
}
.rc-hist-hist-bar {
  display: inline-block; width: 4px; min-height: 2px;
  border-radius: 1px;
}
.rc-hist-recsrc { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; padding: 8px 10px; background: var(--el-fill-color-lighter); border-radius: 6px; }
.rc-hist-recsrc-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.rc-hist-recsrc-summary { font-family: "SF Mono",Menlo,monospace; }
.rc-hist-recsrc-item { background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 4px; padding: 6px 8px; }
.rc-hist-recsrc-hd { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; font-size: 11px; }
.rc-hist-recsrc-idx { font-weight: 700; font-family: "SF Mono",Menlo,monospace; min-width: 24px; }
.rc-hist-recsrc-score { font-weight: 700; font-family: "SF Mono",Menlo,monospace; min-width: 38px; }
.rc-hist-recsrc-path { color: var(--el-color-primary); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; font-family: "SF Mono",Menlo,monospace; font-size: 10px; }
.rc-hist-recsrc-tokens { font-size: 10px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-placeholder); white-space: nowrap; }
.rc-hist-recsrc-text { margin: 0; font-family: "SF Mono",Menlo,monospace; font-size: 11px; line-height: 1.5; color: var(--el-text-color-regular); white-space: pre-wrap; word-break: break-word; max-height: 200px; overflow: auto; }
.rc-hist-cfg {
  display: flex; gap: 4px; flex-wrap: wrap;
  margin-top: 4px;
}
.rc-hist-cfg-chip {
  font-size: 9px; font-weight: 700;
  font-family: "SF Mono", Menlo, monospace; letter-spacing: .3px;
  padding: 1px 6px; border-radius: 7px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  text-transform: uppercase;
  &.on { color: var(--el-color-success); background: var(--el-color-success-light-9); }
}
.rc-hist-cfg-chip--filter { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
.rc-results-filtered { color: var(--el-color-warning); font-weight: 700; }
// ── Score threshold slider ──
.rc-thresh {
  display: inline-flex; gap: 8px; align-items: center;
  padding: 2px 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  font-size: 11px;
}
.rc-thresh-lbl {
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", Menlo, monospace;
}
.rc-thresh-val {
  font-size: 11px; font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums; font-weight: 700;
  min-width: 30px; text-align: right;
}
.rc-thresh-toggle { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--el-text-color-secondary); cursor: pointer; user-select: none; }
.rc-thresh-toggle input { margin: 0; }
.rc-thresh-file-filter { width: 140px; }
.rc-thresh-sort { width: 132px; }

// ── Result cards ──
.rc-card { background: var(--el-fill-color-lighter); border-left: 3px solid var(--el-border-color); border-radius: 0 8px 8px 0; margin-bottom: 8px; cursor: pointer; overflow: hidden; transition: background .12s, box-shadow .12s; &:hover { background: var(--el-fill-color-light); box-shadow: 0 1px 6px rgba(0,0,0,.06); } }
.rc-card--high { border-left-color: var(--el-color-success); }
.rc-card--mid { border-left-color: var(--el-color-warning); }
.rc-card--low { border-left-color: var(--el-color-info); }
.rc-card-hd { display: flex; gap: 8px; align-items: center; padding: 10px 14px 0; }
.rc-card-rank { width: 26px; flex-shrink: 0; font-size: 12px; font-weight: 700; color: var(--el-color-primary); }
.rc-card-path { flex: 1; min-width: 0; display: flex; gap: 5px; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-regular); }
.rc-card-meter { width: 72px; height: 5px; flex-shrink: 0; background: var(--el-fill-color); border-radius: 3px; overflow: hidden; }
.rc-card-meter-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.rc-card-meter-fill--high { background: var(--el-color-success); }
.rc-card-meter-fill--mid { background: var(--el-color-warning); }
.rc-card-meter-fill--low { background: var(--el-color-info); }
.rc-card-pct { width: 38px; flex-shrink: 0; text-align: right; font-size: 12px; font-weight: 700; font-family: "SF Mono",Menlo,monospace; }
.rc-card-pct--high { color: var(--el-color-success); }
.rc-card-pct--mid { color: var(--el-color-warning); }
.rc-card-pct--low { color: var(--el-text-color-secondary); }
.rc-card-copy { margin-left: 4px; flex-shrink: 0; padding: 2px; height: auto; }
.rc-card-group { margin-bottom: 10px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; overflow: hidden; }
.rc-card-group-hd { display: flex; gap: 8px; align-items: center; padding: 8px 12px; background: var(--el-fill-color-light); cursor: pointer; &:hover { background: var(--el-fill-color); } }
.rc-card-group-path { flex: 1; min-width: 0; font-size: 12px; font-weight: 600; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-card-group-meta { font-size: 11px; color: var(--el-text-color-secondary); }
.rc-card-group-score { font-size: 11px; font-weight: 700; font-family: "SF Mono",Menlo,monospace; }
.rc-card-group .rc-card { border-radius: 0; border-left: 0; border-right: 0; border-top: 1px solid var(--el-border-color-lighter); border-bottom: 0; margin: 0; }
.rc-card-body { padding: 6px 14px 10px 48px; }
.rc-card-snip { margin: 0; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

// ── Metadata badges in Query cards — surfaces llama_index frontmatter ──
.rc-card-meta {
  display: flex; flex-wrap: wrap; gap: 3px;
  margin-bottom: 4px;
}
.rc-meta-tag {
  display: inline-flex; align-items: center;
  height: 15px; padding: 0 5px;
  font-size: 9px; font-weight: 600; line-height: 1;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 7px;
}
.rc-meta-tag--cat { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.rc-meta-tag--tag { color: var(--el-color-success); background: var(--el-color-success-light-9); }
.rc-meta-stat {
  display: inline-flex; align-items: center; gap: 2px;
  height: 15px; padding: 0 4px;
  font-size: 9px; font-weight: 600; line-height: 1;
  font-family: "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.rc-meta-freshness { color: var(--el-text-color-secondary); }
.rc-meta-freshness--stale { color: var(--el-color-warning); background: var(--el-color-warning-light-9); border-radius: 2px; }

// ── Empty ──
.rc-empty { display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 44px 0; font-size: 13px; color: var(--el-text-color-placeholder); }
.rc-empty-hint { font-size: 11px; margin-top: -4px; }

// ── Decompose ──
.rc-dq { margin-top: 14px; }
// ── llama_index retrieval pipeline diagram ──
.rc-pipeline {
  display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
  padding: 10px 12px; margin-bottom: 14px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.rc-pipe-node {
  display: flex; flex-direction: column; gap: 2px;
  padding: 6px 8px; min-width: 70px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  &.on { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }
}
.rc-pipe-stage {
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", Menlo, monospace;
}
.rc-pipe-cfg {
  font-size: 11px; font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px;
}
.rc-pipe-arrow {
  font-size: 14px; color: var(--el-text-color-placeholder);
  font-family: "SF Mono", Menlo, monospace; line-height: 1;
}
// ── SubQuestionQueryEngine flow diagram ──
.rc-dq-flow {
  display: flex; flex-direction: column; gap: 6px;
  padding: 10px 12px; margin-bottom: 14px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.rc-dq-flow-node {
  display: flex; flex-direction: column; gap: 2px;
  padding: 6px 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  cursor: default;
  min-width: 0;
}
.rc-dq-flow-node--sub {
  cursor: pointer;
  border-color: var(--el-border-color);
  transition: border-color .12s, background .12s;
  &:hover { background: var(--el-fill-color-light); }
  &.rc-dq-flow-node--open { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }
}
.rc-dq-flow-node--root { border-left: 3px solid var(--el-color-primary); }
.rc-dq-flow-node--synth { border-left: 3px solid var(--el-color-success); }
.rc-dq-flow-label {
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", Menlo, monospace;
}
.rc-dq-flow-text {
  font-size: 12px; color: var(--el-text-color-primary);
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  line-height: 1.4;
}
.rc-dq-flow-stat {
  font-size: 10px; font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums; font-weight: 600;
}
.rc-dq-flow-arrow {
  text-align: center; font-size: 14px; color: var(--el-text-color-placeholder);
  line-height: 1;
}
.rc-dq-flow-branches {
  display: flex; flex-direction: column; gap: 4px;
}
.rc-dq-score {
  font-size: 10px; font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums; font-weight: 600;
  margin-left: auto; flex-shrink: 0;
}
.rc-dq-synth { margin-bottom: 14px; padding: 12px 14px; background: var(--el-color-primary-light-9); border: 1px solid var(--el-color-primary-light-7); border-radius: 8px; }
.rc-dq-synth-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--el-color-primary); text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-synth-copy { margin-left: auto; color: var(--el-color-primary); }
.rc-dq-synth-body { font-size: 13px; line-height: 1.7; color: var(--el-text-color-primary); :deep(p) { margin: .3em 0; } :deep(code) { font-family: "SF Mono",Menlo,monospace; } }

// ── Aggregated sources — unique chunks across all sub-Qs ──
.rc-dq-agg { margin-bottom: 14px; padding: 10px 14px 6px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.rc-dq-agg-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-agg-n { margin-left: auto; font-size: 10px; font-family: "SF Mono", Menlo, monospace; color: var(--el-color-primary); padding: 1px 6px; background: var(--el-color-primary-light-9); border-radius: 8px; }
.rc-dq-list { display: flex; flex-direction: column; gap: 6px; }
.rc-dq-item { background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; overflow: hidden; transition: border-color .15s, background .15s; }
.rc-dq-item--open { border-color: var(--el-color-primary-light-5); background: var(--el-bg-color); }
.rc-dq-item-hd { display: flex; gap: 8px; align-items: center; padding: 9px 12px; cursor: pointer; user-select: none; &:hover { background: var(--el-fill-color-light); } }
.rc-dq-rank { flex-shrink: 0; padding: 1px 8px; font-size: 11px; font-weight: 700; color: #fff; background: var(--el-color-primary); border-radius: 4px; font-family: "SF Mono",Menlo,monospace; }
.rc-dq-best { flex-shrink: 0; padding: 1px 8px; font-size: 10px; font-weight: 700; color: var(--el-color-success); background: var(--el-color-success-light-9); border: 1px solid var(--el-color-success-light-7); border-radius: 4px; text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-worst { flex-shrink: 0; padding: 1px 8px; font-size: 10px; font-weight: 700; color: var(--el-color-danger); background: var(--el-color-danger-light-9); border: 1px solid var(--el-color-danger-light-7); border-radius: 4px; text-transform: uppercase; letter-spacing: .4px; }
.rc-dq-q { flex: 1; min-width: 0; font-size: 13px; font-weight: 500; color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-dq-run { flex-shrink: 0; }
.rc-dq-acts { margin-left: auto; display: flex; gap: 4px; }
.rc-dq-meta { flex-shrink: 0; font-size: 11px; color: var(--el-text-color-placeholder); font-family: "SF Mono",Menlo,monospace; }
.rc-dq-chev { color: var(--el-text-color-secondary); transition: transform .15s; }
.rc-dq-item-body { padding: 0 12px 12px 36px; }
.rc-dq-answer { font-size: 13px; line-height: 1.7; color: var(--el-text-color-primary); margin-bottom: 8px; :deep(p) { margin: .3em 0; } :deep(code) { font-family: "SF Mono",Menlo,monospace; } }
.rc-dq-sources { display: flex; flex-wrap: wrap; gap: 4px; padding-top: 6px; border-top: 1px dashed var(--el-border-color-lighter); }
.rc-dq-src { display: inline-flex; gap: 4px; align-items: center; padding: 2px 8px; font-size: 11px; background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter); border-radius: 4px; cursor: pointer; transition: background .1s; &:hover { background: var(--el-color-primary-light-8); } }
.rc-dq-src-idx { color: var(--el-color-primary); font-weight: 700; }
.rc-dq-src-path { font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-regular); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
.rc-dq-src-score { font-weight: 700; font-family: "SF Mono",Menlo,monospace; font-size: 10px; }

// ── Index ──
.rc-ix-bar { display: flex; gap: 20px; align-items: center; margin-bottom: 16px; padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; }
.rc-ix-stat { display: flex; flex-direction: column; gap: 2px; }
.rc-ix-n { font-size: 20px; font-weight: 700; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-primary); }
.rc-ix-freshness { font-size: 13px; padding: 1px 8px; border: 1px solid currentColor; border-radius: 4px; align-self: flex-start; }
.rc-ix-lbl { font-size: 10px; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .5px; }
.rc-ix-acts { margin-left: auto; display: flex; gap: 6px; }
.rc-ix-cov { margin-bottom: 16px; padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; }
.rc-ix-cov-hd { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.rc-ix-cov-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); }
.rc-ix-cov-sub { font-size: 11px; color: var(--el-text-color-placeholder); }
.rc-ix-cov-bar { display: flex; height: 18px; border-radius: 4px; overflow: hidden; background: var(--el-fill-color); }
.rc-ix-cov-seg { display: flex; align-items: center; justify-content: center; overflow: hidden; border-right: 1px solid var(--el-bg-color); color: #fff; font-size: 9px; font-weight: 600; white-space: nowrap; background: var(--el-color-primary); &:nth-child(2n) { background: var(--el-color-success); } &:nth-child(3n) { background: var(--el-color-warning); } &:nth-child(4n) { background: var(--el-color-danger); } &:nth-child(5n) { background: var(--el-color-info); } &:last-child { border-right: 0; } }
.rc-ix-cov-seg--rest { background: var(--el-fill-color-dark) !important; color: var(--el-text-color-placeholder); }
.rc-ix-cov-seg-lbl { padding: 0 4px; }
.rc-ix-cov-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.rc-ix-scope-pop { margin-top: 12px; }
.rc-ix-scope-pop-list { display: flex; flex-direction: column; gap: 3px; }
.rc-ix-cov-leg { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; color: var(--el-text-color-secondary); }
.rc-ix-cov-leg-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; background: var(--el-color-primary); }
.rc-ix-cov-leg--rest { color: var(--el-text-color-placeholder); font-style: italic; }
.rc-ix-cov-leg-n { margin-left: 2px; font-weight: 700; color: var(--el-text-color-primary); }
.rc-ix-list { display: flex; flex-direction: column; gap: 4px; }
.rc-ix-list-filter { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
.rc-ix-list-count { font-size: 11px; color: var(--el-text-color-placeholder); font-family: "SF Mono",Menlo,monospace; flex-shrink: 0; }
.rc-ix-file { display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: var(--el-fill-color-lighter); border-radius: 6px; cursor: pointer; transition: background .1s; &:hover { background: var(--el-fill-color-light); } }
.rc-ix-file-icon { font-size: 16px; }
.rc-ix-file-info { flex: 1; min-width: 0; }
.rc-ix-file-name { font-size: 13px; font-weight: 500; display: block; }
.rc-ix-file-path { font-size: 11px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-placeholder); }

// ── Config card ──
.rc-cfg { margin-bottom: 16px; padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); }
.rc-cfg-hd { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .4px; }
.rc-cfg-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px 10px; }
.rc-cfg-cell { display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; background: var(--el-bg-color); border-radius: 6px; border: 1px solid var(--el-border-color-lighter); }
.rc-cfg-k { font-size: 10px; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .3px; }
.rc-cfg-cell code { font-size: 11px; font-family: "SF Mono",Menlo,monospace; color: var(--el-text-color-primary); word-break: break-all; }
.rc-cfg-v { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); font-family: "SF Mono",Menlo,monospace; }
.rc-cfg-cell.on .rc-cfg-v { color: var(--el-color-success); }
.rc-cfg-cell.on { border-color: var(--el-color-success-light-7); background: var(--el-color-success-light-9); }
.rc-cfg-foot { display: flex; gap: 12px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--el-border-color-lighter); font-size: 11px; color: var(--el-text-color-secondary); }
.rc-cfg-docs { font-weight: 600; color: var(--el-text-color-primary); }
.rc-cfg-built { font-family: "SF Mono",Menlo,monospace; }

// ── Preview ──
.rc-fp-loading { display: flex; justify-content: center; padding: 48px 0; font-size: 14px; color: var(--el-text-color-secondary); }
.rc-fp-body { max-height: 70vh; overflow-y: auto; padding: 0 4px; font-size: 14px; line-height: 1.7; color: var(--el-text-color-primary);
  :deep(h1),:deep(h2),:deep(h3) { margin: 1em 0 .5em; } :deep(h1) { font-size: 1.5em; } :deep(h2) { font-size: 1.3em; }
  :deep(p) { margin: .5em 0; } :deep(pre) { padding: 12px; overflow-x: auto; font-size: 13px; background: var(--el-fill-color); border-radius: 6px; }
  :deep(code) { font-family: "SF Mono",Menlo,monospace; font-size: .9em; }
}
</style>
