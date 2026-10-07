<script setup lang="ts" name="aiChatPetMessage">
import { computed, ref, onBeforeUnmount, onMounted, watch, nextTick } from "vue";
import { CopyDocument, Tools, ArrowDown, Check, Close } from "@element-plus/icons-vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useMermaidRender } from "@/hooks/useMermaidRender";
import { useSlowThreshold } from "@/hooks/useSlowThreshold";
import { useAiChatStore } from "@/stores/modules/aiChat";
import RagSources from "@/components/RagSources/RagSources.vue";
import WebSearchResults from "../WebSearchResults.vue";
import type { ChatMessage } from "@/api/interface/yiAi";
import { injectCitations, makeCitationClickHandler } from "@/utils/citations";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  streaming: boolean;
}>();

const store = useAiChatStore();
const { render } = useMarkdown();

/** Template ref on RagSources so inline citation chips can call
 *  `focusSource(idx)` to expand + flash the matching source chip. */
const ragSourcesRef = ref<InstanceType<typeof RagSources> | null>(null);

/** Template ref on the markdown container — used by mermaid rendering. */
const markdownRef = ref<HTMLElement | null>(null);

function onMarkdownClick(e: MouseEvent) {
  return makeCitationClickHandler(() => ragSourcesRef.value)(e);
}

/** Format ms latency as e.g. "1.2s" or "340ms" — for the time-to-first-token
 *  provenance badge on pet messages. */
function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const html = computed(() => render(props.message.message ?? ""));
const showTyping = computed(() => props.streaming && !props.message.message?.trim() && !props.message.error);

// ── Live elapsed time during thinking ──────────────────────────────────
const thinkingElapsed = ref(0);
let _thinkingTimer: ReturnType<typeof setInterval> | null = null;
function _tickThinking() {
  if (!store.thinkingStartTs) { thinkingElapsed.value = 0; return; }
  thinkingElapsed.value = Date.now() - store.thinkingStartTs;
}
const thinkingDots = ref(1);
let _dotTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  _thinkingTimer = setInterval(_tickThinking, 250);
  _dotTimer = setInterval(() => { thinkingDots.value = (thinkingDots.value % 3) + 1; }, 500);
});
onBeforeUnmount(() => {
  if (_thinkingTimer) { clearInterval(_thinkingTimer); _thinkingTimer = null; }
  if (_dotTimer) { clearInterval(_dotTimer); _dotTimer = null; }
});
function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}
const thinkingWarnLevel = computed<"" | "slow" | "long">(() => {
  if (!showTyping.value || !props.streaming) return "";
  const s = thinkingElapsed.value / 1000;
  if (s >= 30) return "long";
  if (s >= 10) return "slow";
  return "";
});
const thinkingWarnLabel = computed(() => {
  if (thinkingWarnLevel.value === "long") return "Taking longer than usual…";
  if (thinkingWarnLevel.value === "slow") return "Still thinking…";
  return "";
});
const thinkingLabel = computed(() => {
  if (!props.streaming || !showTyping.value) return "";
  const dots = ".".repeat(thinkingDots.value);
  if (store.streamingPhase === "preparing") return `Preparing${dots}`;
  if (store.streamingPhase === "retrieving") return `Retrieving${dots}`;
  const base = isRag.value ? "RAG · Thinking" : "Thinking";
  return `${base}${dots}`;
});

/** Phase label for the in-flight pet message — surfaces the llama_index
 *  pipeline stage (retrieving vs thinking) before the first token arrives.
 *  `retrieving` means the backend emitted a `{"data":{"phase":"retrieving"}}`
 *  SSE frame and the VectorStoreIndex / BM25 / hybrid retriever is now
 *  pulling chunks; otherwise we're in pre-retrieval "thinking" (LLM
 *  condense + system prompt setup). */
const isRag = computed(() => !!props.message.ragMeta);

const phaseLabel = computed<string | null>(() => {
  if (!props.streaming || !showTyping.value) return null;
  if (store.streamingPhase === "retrieving") return "Retrieving from index…";
  if (isRag.value) return "RAG · Thinking…";
  return "Thinking…";
});

/** More detailed phase description for the streaming status banner. */
const phaseDetail = computed<string | null>(() => {
  if (!props.streaming) return null;
  if (store.streamingPhase === "fetching") return "Fetching URL content…";
  if (store.streamingPhase === "retrieving") return "Searching knowledge base for relevant chunks…";
  if (store.streamingPhase === "thinking")
    return isRag.value ? "Searching knowledge base…" : "Condensing context and preparing response…";
  if (store.streamingPhase === "streaming" && sourceCount.value)
    return `Generating answer grounded in ${sourceCount.value} source${sourceCount.value > 1 ? "s" : ""}…`;
  if (store.streamingPhase === "streaming") return isRag.value ? "RAG · Generating…" : "Generating response…";
  return null;
});

const empty = computed(() => !props.message.message?.trim());
const showAbortedTag = computed(() => !!props.message.aborted && !props.message.error);

// Per-message tool calls (Pi-inspired: tool timeline).
const toolCalls = computed(() => props.message.toolCalls ?? []);
const toolsExpanded = ref(false);
// Thresholds for the "slow" / "very slow" badges on individual tool calls.
// "slow" tracks the shared threshold (SessionStatusBar ↔ MessageBubble
// share one setting via useSlowThreshold singleton); "very slow" is a fixed
// 5s escalation to danger — independent of the user's slow threshold.
const MB_VERY_SLOW_BADGE_MS = 5000;
const { slowThresholdMs } = useSlowThreshold();
function callLatencyLevel(ms: number | undefined | null): "" | "slow" | "very-slow" {
  if (ms == null) return "";
  if (ms >= MB_VERY_SLOW_BADGE_MS) return "very-slow";
  if (ms >= slowThresholdMs.value) return "slow";
  return "";
}
const copiedToolIdx = ref<number | null>(null);
const failedToolIdx = ref<number | null>(null);
// Long-error collapse — Pi-inspired: stack-trace / long errors collapsed
// by default, expanded on click. State persists to sessionStorage keyed
// by `${message.timestamp}:${idx}` so a reload / scroll-away keeps your
// investigation context. Indices alone would shift on message deletion.
const EXPANDED_ERRORS_SS_KEY = "yivad.aichat.expandedErrors";
const EXPANDED_CONTENTS_SS_KEY = "yivad.aichat.expandedContents";
function loadExpandedSet(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter(x => typeof x === "string")) : new Set();
  } catch {
    return new Set();
  }
}
function persistExpandedSet(key: string, set: Set<string>): void {
  try {
    sessionStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}
function expandKey(idx: number): string {
  return `${props.message.timestamp ?? "no-ts"}:${idx}`;
}
const expandedErrors = ref<Set<string>>(loadExpandedSet(EXPANDED_ERRORS_SS_KEY));
const ERROR_COLLAPSE_THRESHOLD = 200;
function toggleErrorExpand(idx: number): void {
  const next = new Set(expandedErrors.value);
  const k = expandKey(idx);
  if (next.has(k)) next.delete(k);
  else next.add(k);
  expandedErrors.value = next;
  persistExpandedSet(EXPANDED_ERRORS_SS_KEY, next);
}
function isErrorLong(err: string): boolean {
  return err.length > ERROR_COLLAPSE_THRESHOLD;
}
function isExpanded(idx: number): boolean {
  return expandedErrors.value.has(expandKey(idx));
}

// Long-content collapse — symmetric to long-error: tool result bodies
// over CONTENT_COLLAPSE_THRESHOLD are truncated with a `+N` expand toggle.
const expandedContents = ref<Set<string>>(loadExpandedSet(EXPANDED_CONTENTS_SS_KEY));
const CONTENT_COLLAPSE_THRESHOLD = 400;
function toggleContentExpand(idx: number): void {
  const next = new Set(expandedContents.value);
  const k = expandKey(idx);
  if (next.has(k)) next.delete(k);
  else next.add(k);
  expandedContents.value = next;
  persistExpandedSet(EXPANDED_CONTENTS_SS_KEY, next);
}
function isContentLong(s: string): boolean {
  return s.length > CONTENT_COLLAPSE_THRESHOLD;
}
function isContentExpanded(idx: number): boolean {
  return expandedContents.value.has(expandKey(idx));
}
const toolCount = computed(() => toolCalls.value.length);

/** Pet messages with sources get citation chips injected so `[1]`
 *  tokens emitted by the LLM become clickable superscripts that
 *  highlight the matching source card below. */
const sourceCount = computed(() => props.message.sources?.length ?? 0);
const citedHtml = computed(() => {
  return sourceCount.value ? injectCitations(html.value, sourceCount.value) : html.value;
});

// ── Code-block copy buttons ──────────────────────────────────────────
function attachCodeCopyButtons() {
  nextTick(() => {
    const el = markdownRef.value;
    if (!el) return;
    el.querySelectorAll("pre").forEach(pre => {
      if (pre.querySelector(".mb-code-copy")) return;
      const wrap = document.createElement("div");
      wrap.className = "mb-code-wrap";
      const btn = document.createElement("button");
      btn.className = "mb-code-copy";
      btn.title = "Copy code";
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
      btn.onclick = async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
            btn.classList.remove("copied");
          }, 2000);
        } catch { /* ignore */ }
      };
      pre.parentNode?.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      wrap.appendChild(btn);
    });
  });
}

watch(citedHtml, () => attachCodeCopyButtons());
onMounted(() => attachCodeCopyButtons());

/** Render mermaid diagrams in the markdown container after HTML updates.
 *  The composable watches citedHtml with flush:"post" + immediate:true,
 *  skips when no mermaid blocks exist, and cleans up on unmount. */
const { dispose: disposeMermaid } = useMermaidRender({
  html: citedHtml,
  containerRef: markdownRef
});
onBeforeUnmount(() => disposeMermaid());

/** Retrieval-quality grade based on the top score across retrieved chunks.
 *  Letter grade lets the user judge retrieval confidence at a glance,
 *  complementing the latency / chat-mode chips. Grades map:
 *    A ≥ 0.85 (excellent — strong cosine match)
 *    B ≥ 0.70 (good — clearly relevant)
 *    C ≥ 0.50 (fair — partial overlap)
 *    D <  0.50 (weak — likely off-target retrieval)
 *  Returns null when no sources (e.g. simple chat mode, no retrieval). */
const retrievalGrade = computed<{ letter: string; top: number } | null>(() => {
  if (!props.message.sources?.length) return null;
  const scores = props.message.sources.map(s => s.score);
  const top = Math.max(...scores);
  const letter = top >= 0.85 ? "A" : top >= 0.7 ? "B" : top >= 0.5 ? "C" : "D";
  return { letter, top };
});

/** Search badge tooltip — shows the search query and timing when available. */
const searchBadgeTitle = computed(() => {
  if (!store.lastSearchQuery) return "This response used real-time web search";
  const timing = store.searchTimingMs ? " · " + store.searchTimingMs + "ms" : "";
  return 'Search: "' + store.lastSearchQuery + '"' + timing;
});

/** Content summary of retrieved RAG sources — shows the title/metadata
 *  of the top source and the total count so users can quickly gauge what
 *  content was retrieved without expanding every chip. */
const ragContentSummary = computed(() => {
  if (!props.message.sources?.length) return null;
  const top = props.message.sources[0];
  // Title: prefer metadata.title, fall back to file name stripped of .md and numeric prefix
  const rawTitle = top.metadata?.title || (top as any).title || "";
  const fileName = top.file_path?.split("/").pop()?.replace(/\.md$/, "") || "";
  const title = rawTitle || fileName.replace(/^\d+-/, "") || "";
  const count = props.message.sources.length;
  const files = new Set(props.message.sources.map(s => s.file_path)).size;
  const preview = (top.text || "").replace(/\n+/g, " ").trim().slice(0, 120);
  // Functional context: metadata category/type, plus role from file_path
  const category = top.metadata?.category || (top as any).category || "";
  const type = top.metadata?.type || (top as any).type || "";
  const role = top.file_path?.split("/")[0] || "";
  const funcDesc = [category, type, role ? `role:${role}` : ""].filter(Boolean).join(" · ");
  return { title, count, files, preview, funcDesc };
});

async function copyToolCallContent(content: string, idx: number): Promise<void> {
  try {
    await navigator.clipboard.writeText(content);
    failedToolIdx.value = null;
    copiedToolIdx.value = idx;
    setTimeout(() => {
      if (copiedToolIdx.value === idx) copiedToolIdx.value = null;
    }, 1500);
  } catch {
    copiedToolIdx.value = null;
    failedToolIdx.value = idx;
    setTimeout(() => {
      if (failedToolIdx.value === idx) failedToolIdx.value = null;
    }, 1500);
  }
}
</script>

<template>
  <div v-if="empty && !showTyping" class="mb-empty" />
  <div v-else-if="showTyping" class="mb-typing" :class="{ 'mb-typing--slow': thinkingWarnLevel === 'slow', 'mb-typing--long': thinkingWarnLevel === 'long' }">
    <div class="mb-typing-inner">
      <span class="mb-typing-pulse"><span /><span /><span /></span>
      <span class="mb-typing-phase">{{ thinkingLabel }}</span>
      <span v-if="thinkingElapsed > 500" class="mb-typing-elapsed">{{ formatElapsed(thinkingElapsed) }}</span>
    </div>
    <div v-if="thinkingWarnLabel" class="mb-typing-warn">{{ thinkingWarnLabel }}</div>
    <div v-if="phaseDetail" class="mb-typing-detail">{{ phaseDetail }}</div>
    <button class="mb-typing-stop" title="Stop generating" @click="store.stopSending()">
      <span class="mb-typing-stop-icon" />
      Stop
    </button>
  </div>
  <div v-else ref="markdownRef" class="mb-markdown" :class="{ 'is-streaming': props.streaming }" @click="onMarkdownClick">
    <div v-html="citedHtml" />
    <span v-if="props.streaming" class="mb-stream-cursor" />
  </div>
  <div v-if="props.message.error" class="mb-error-tag">Generation failed</div>
  <div v-else-if="showAbortedTag" class="mb-aborted-tag">Stopped</div>
  <!-- RAG provenance badge — surfaces the llama_index config that produced this answer -->
  <div v-if="props.message.ragMeta" class="mb-rag-meta">
    <span
      v-if="retrievalGrade"
      class="mb-rag-meta-grade"
      :class="`mb-rag-meta-grade--${retrievalGrade.letter}`"
      :title="`Retrieval grade ${retrievalGrade.letter} — top cosine score ${(retrievalGrade.top * 100).toFixed(0)}% (A≥85, B≥70, C≥50, D<50)`"
      >{{ retrievalGrade.letter }}</span
    >
    <span class="mb-rag-meta-mode" :title="`llama_index ChatEngine: ${props.message.ragMeta.chatMode}`">{{
      (props.message.ragMeta.chatMode || "").replace(/_/g, " ")
    }}</span>
    <span
      v-if="props.message.ragMeta.hybrid"
      class="mb-rag-meta-chip mb-rag-meta-chip--on"
      title="Hybrid retrieval: vector + BM25"
      >hybrid</span
    >
    <span
      v-if="props.message.ragMeta.rerank"
      class="mb-rag-meta-chip mb-rag-meta-chip--on"
      title="Cross-encoder reranking enabled"
      >rerank</span
    >
    <span v-if="props.message.ragMeta.citations" class="mb-rag-meta-chip mb-rag-meta-chip--on" title="Inline citations enabled"
      >cite</span
    >
    <span
      v-if="props.message.ragMeta.numQueries && props.message.ragMeta.numQueries > 1"
      class="mb-rag-meta-chip"
      title="QueryFusionRetriever with {{ props.message.ragMeta.numQueries }} variants"
      >Q×{{ props.message.ragMeta.numQueries }}</span
    >
    <span
      v-if="props.message.ragMeta.category"
      class="mb-rag-meta-chip mb-rag-meta-chip--filter"
      :title="`MetadataFilter: category='${props.message.ragMeta.category}' (TEXT_MATCH)`"
      >cat:{{ props.message.ragMeta.category }}</span
    >
    <span
      v-for="t in props.message.ragMeta.tags ?? []"
      :key="t"
      class="mb-rag-meta-chip mb-rag-meta-chip--filter"
      :title="`MetadataFilter: tags includes '${t}' (TEXT_MATCH, AND-combined)`"
      >#{{ t }}</span
    >
    <code v-if="props.message.ragMeta.scope" class="mb-rag-meta-scope" :title="`Scope: ${props.message.ragMeta.scope}`">{{
      props.message.ragMeta.scope.split("/").slice(-2).join("/")
    }}</code>
    <span
      v-if="props.message.ragMeta.filePaths?.length"
      class="mb-rag-meta-chip mb-rag-meta-chip--filter"
      :title="`Scoped to ${props.message.ragMeta.filePaths.length} context file(s): ${props.message.ragMeta.filePaths.join(', ')}`"
      >ctx:{{ props.message.ragMeta.filePaths.length }} files</span
    >
    <span
      v-if="props.message.firstTokenLatencyMs != null"
      class="mb-rag-meta-chip mb-rag-meta-chip--latency"
      :title="`Time-to-first-token: ${props.message.firstTokenLatencyMs}ms (retrieval + condense + synthesis)`"
      >{{ formatLatency(props.message.firstTokenLatencyMs) }}</span
    >
  </div>
  <div
    v-else-if="props.message.firstTokenLatencyMs != null || retrievalGrade"
    class="mb-rag-meta mb-rag-meta--bare"
    :title="`${retrievalGrade ? 'Retrieval grade ' + retrievalGrade.letter + ' · top ' + (retrievalGrade.top * 100).toFixed(0) + '%' : ''}${props.message.firstTokenLatencyMs != null ? ' · TTFT ' + props.message.firstTokenLatencyMs + 'ms' : ''}`"
  >
    <span v-if="retrievalGrade" class="mb-rag-meta-grade" :class="`mb-rag-meta-grade--${retrievalGrade.letter}`">{{
      retrievalGrade.letter
    }}</span>
    <span v-if="props.message.firstTokenLatencyMs != null" class="mb-rag-meta-chip mb-rag-meta-chip--latency">{{
      formatLatency(props.message.firstTokenLatencyMs)
    }}</span>
  </div>
  <div v-if="props.message.sources?.length && props.message.searchResults?.length" class="mb-source-section-label">
    Knowledge Base
  </div>
  <RagSources v-if="props.message.sources?.length" ref="ragSourcesRef" :sources="props.message.sources" />
  <div v-if="props.message.sources?.length && props.message.searchResults?.length" class="mb-source-section-label mb-source-section-label--web">
    Web Search
  </div>
  <WebSearchResults v-if="props.message.searchResults != null" :results="props.message.searchResults" :images="props.message.searchImages" />
  <div
    v-if="props.message.searchGrounded && !props.message.searchResults?.length"
    class="mb-search-badge"
    :title="searchBadgeTitle"
  >
    Web-grounded
    <span v-if="store.searchTimingMs" class="mb-search-badge-ms">{{ store.searchTimingMs }}ms</span>
  </div>
  <!-- RAG content summary — brief description of what was retrieved -->
  <div v-if="ragContentSummary" class="mb-rag-summary">
    <span v-if="retrievalGrade" class="mb-rag-summary-grade" :class="`mb-rag-summary-grade--${retrievalGrade.letter}`">{{
      retrievalGrade.letter
    }}</span>
    <span class="mb-rag-summary-text">
      检索到 <strong>{{ ragContentSummary.files }}</strong> 个文件中的 <strong>{{ ragContentSummary.count }}</strong> 个片段
      <template v-if="ragContentSummary.title"
        >，最佳匹配：<em>{{ ragContentSummary.title }}</em></template
      >
      <template v-if="ragContentSummary.funcDesc"
        ><span class="mb-rag-summary-func">{{ ragContentSummary.funcDesc }}</span></template
      >
    </span>
    <span v-if="ragContentSummary.preview" class="mb-rag-summary-preview">{{ ragContentSummary.preview }}</span>
  </div>
  <!-- Per-message tool calls (Pi-inspired: tool timeline) -->
  <div v-if="toolCount" class="mb-tools">
    <div class="mb-tools-head" @click="toolsExpanded = !toolsExpanded">
      <el-icon :size="12"><Tools /></el-icon>
      <span class="mb-tools-label">Tools used · {{ toolCount }}</span>
      <el-icon :size="10" class="mb-tools-caret" :class="{ 'is-open': toolsExpanded }"><ArrowDown /></el-icon>
    </div>
    <div v-if="toolsExpanded" class="mb-tools-list">
      <div v-for="(call, i) in toolCalls" :key="i" class="mb-tool-call" :class="{ 'mb-tool-call--err': !!call.error }">
        <div class="mb-tool-call-head">
          <span class="mb-tool-call-name">{{ call.label }}</span>
          <span class="mb-tool-call-tag">{{ call.name }}</span>
          <span
            v-if="call.durationMs != null"
            class="mb-tool-call-ms"
            :class="{
              'mb-tool-call-ms--slow': callLatencyLevel(call.durationMs) === 'slow',
              'mb-tool-call-ms--very-slow': callLatencyLevel(call.durationMs) === 'very-slow'
            }"
            :title="
              callLatencyLevel(call.durationMs)
                ? `Slow call — ≥${callLatencyLevel(call.durationMs) === 'very-slow' ? MB_VERY_SLOW_BADGE_MS : slowThresholdMs}ms`
                : ''
            "
            >{{ call.durationMs }}ms</span
          >
          <span
            v-if="callLatencyLevel(call.durationMs) === 'slow'"
            class="mb-tool-call-tag mb-tool-call-tag--slow"
            title="Slow call (≥1s) — consider optimizing or caching"
            >slow</span
          >
          <span
            v-else-if="callLatencyLevel(call.durationMs) === 'very-slow'"
            class="mb-tool-call-tag mb-tool-call-tag--very-slow"
            title="Very slow call (≥5s) — investigate before relying on this tool in critical paths"
            >very slow</span
          >
          <span v-if="call.error" class="mb-tool-call-state mb-tool-call-state--err">failed</span>
        </div>
        <div v-if="call.args && Object.keys(call.args).length" class="mb-tool-call-args">
          <span class="mb-tool-call-args-label">args:</span>
          <code>{{ JSON.stringify(call.args) }}</code>
        </div>
        <div v-if="call.error" class="mb-tool-call-error">
          <span class="mb-tool-call-error-text">{{
            isExpanded(i) || !isErrorLong(call.error) ? call.error : call.error.slice(0, ERROR_COLLAPSE_THRESHOLD) + "…"
          }}</span>
          <el-button
            v-if="isErrorLong(call.error)"
            size="small"
            text
            class="mb-tool-call-error-toggle"
            :title="isExpanded(i) ? 'Collapse error' : `Expand full error (${call.error.length} chars)`"
            @click="toggleErrorExpand(i)"
            >{{ isExpanded(i) ? "−" : `+${call.error.length - ERROR_COLLAPSE_THRESHOLD}` }}</el-button
          >
          <el-button
            size="small"
            text
            :icon="copiedToolIdx === i ? Check : failedToolIdx === i ? Close : CopyDocument"
            :type="copiedToolIdx === i ? 'success' : failedToolIdx === i ? 'danger' : ''"
            class="mb-tool-call-copy mb-tool-call-copy--err"
            :title="copiedToolIdx === i ? 'Copied' : failedToolIdx === i ? 'Copy failed' : 'Copy error'"
            @click="copyToolCallContent(call.error!, i)"
            >{{ copiedToolIdx === i ? "Copied" : failedToolIdx === i ? "Failed" : "Copy" }}</el-button
          >
        </div>
        <div v-else-if="call.content" class="mb-tool-call-content">
          <pre>{{
            isContentExpanded(i) || !isContentLong(call.content)
              ? call.content
              : call.content.slice(0, CONTENT_COLLAPSE_THRESHOLD) + "…"
          }}</pre>
          <el-button
            v-if="isContentLong(call.content)"
            size="small"
            text
            class="mb-tool-call-content-toggle"
            :title="isContentExpanded(i) ? 'Collapse content' : `Expand full content (${call.content.length} chars)`"
            @click="toggleContentExpand(i)"
            >{{ isContentExpanded(i) ? "−" : `+${call.content.length - CONTENT_COLLAPSE_THRESHOLD}` }}</el-button
          >
          <el-button
            size="small"
            text
            :icon="copiedToolIdx === i ? Check : failedToolIdx === i ? Close : CopyDocument"
            :type="copiedToolIdx === i ? 'success' : failedToolIdx === i ? 'danger' : ''"
            class="mb-tool-call-copy"
            :title="copiedToolIdx === i ? 'Copied' : failedToolIdx === i ? 'Copy failed' : 'Copy result'"
            @click="copyToolCallContent(call.content!, i)"
            >{{ copiedToolIdx === i ? "Copied" : failedToolIdx === i ? "Failed" : "Copy" }}</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
@use "../../../../styles/PetMessage.scss";
</style>
