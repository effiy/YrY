<script setup lang="ts" name="aiChatMessageBubble">
import { computed, ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { CopyDocument, RefreshRight, Delete, Edit, Promotion, Search, FolderChecked, Tools, ArrowDown, Check, Close, ChatDotRound, Clock } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useSlowThreshold } from "@/hooks/useSlowThreshold";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { detectContextChanges, hasPartialContextBlock } from "@/hooks/useContextChangeDetector";
import type { ContextChange } from "@/hooks/useContextChangeDetector";
import RagSources from "@/components/RagSources.vue";
import WebSearchResults from "./WebSearchResults.vue";
import ContextChangeCard from "./ContextChangeCard.vue";
import AgentTimeline from "./AgentTimeline.vue";
import AgentEventsPanel from "./AgentEventsPanel.vue";
import type { ChatMessage } from "@/api/interface/yiweb";
import { injectCitations, makeCitationClickHandler } from "@/utils/citations";

const props = defineProps<{
  message: ChatMessage;
  index: number;
  streaming: boolean;
}>();

const store = useAiChatStore();
const { render } = useMarkdown();
const { openInAiChat } = useAiChatBridge();

async function branchToNewSession() {
  const conv = store.activeConversation;
  if (!conv) return;
  const msgs = (conv.messages ?? []).slice(0, props.index + 1)
    .filter(m => (m.message ?? "").trim());
  if (!msgs.length) return;
  const transcript = msgs
    .map(m => `**${m.type === "user" ? "User" : m.type === "followup" ? "Follow-up (queued)" : "Assistant"}:** ${m.message ?? ""}`)
    .join("\n\n");
  const ctxTags = (conv.tags ?? []).filter(t => typeof t === "string" && t.startsWith("ctx:"));
  const tags = ["branch", ...ctxTags];
  const fromTag = (conv.tags ?? []).find(t => typeof t === "string" && t.startsWith("from:"));
  if (fromTag) tags.push(fromTag);
  await openInAiChat({
    title: `Branch of: ${conv.title || "session"}`,
    pageContent: `# Branched from "${conv.title || "session"}"\n\n## Transcript\n\n${transcript}`,
    tags
  });
}

/** Template ref on RagSources so inline citation chips can call
 *  `focusSource(idx)` to expand + flash the matching source chip. */
const ragSourcesRef = ref<InstanceType<typeof RagSources> | null>(null);

function onMarkdownClick(e: MouseEvent) {
  return makeCitationClickHandler(() => ragSourcesRef.value)(e);
}

/** Format ms latency as e.g. "1.2s" or "340ms" — for the time-to-first-token
 *  provenance badge on pet messages. */
function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// A queued agent follow-up (/followup) renders on the user side but with its
// own tag — it is the user's deferred instruction, not an executed turn.
const isUser = computed(() => props.message.type === "user" || props.message.type === "followup");
const isFollowUp = computed(() => props.message.type === "followup");
const html = computed(() => render(props.message.message ?? ""));
const time = computed(() => (props.message.timestamp ? dayjs(props.message.timestamp).format("MM/DD HH:mm:ss") : ""));
// Pi-inspired per-message token estimate. Coarse ~4 chars/token heuristic
// mirroring SessionStatusBar's CHARS_PER_TOKEN. Useful for cost awareness.
const tokenEstimate = computed(() => Math.ceil((props.message.message?.length ?? 0) / 4));
// Pi-inspired: trend arrow comparing this message's token estimate to the
// previous message of the same role. Surfaces "is the AI outputting longer
// or shorter replies over time?" / "are my prompts getting wordier?".
const prevRoleMessage = computed<{ tokens: number; snippet: string; ts: number | null } | null>(() => {
  const msgs = store.activeConversation?.messages ?? [];
  const myTs = props.message.timestamp;
  let myIdx = -1;
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].timestamp === myTs) { myIdx = i; break; }
  }
  if (myIdx < 1) return null;
  for (let j = myIdx - 1; j >= 0; j--) {
    if (msgs[j].type === props.message.type) {
      const text = msgs[j].message ?? "";
      const snippet = text.length > 80 ? text.slice(0, 79) + "…" : text;
      return {
        tokens: Math.ceil(text.length / 4),
        snippet: snippet.replace(/\s+/g, " "),
        ts: msgs[j].timestamp ?? null
      };
    }
  }
  return null;
});
const prevRoleTokenEstimate = computed(() => prevRoleMessage.value?.tokens ?? null);
// Pi-inspired: click trend arrow → scroll to the comparison baseline message
// and flash it. Uses data-msg-ts on each MessageBubble root for O(1) lookup.
function scrollToPrevRoleMessage(): void {
  const ts = prevRoleMessage.value?.ts;
  if (ts == null) return;
  const el = document.querySelector<HTMLElement>(`[data-msg-ts="${ts}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("mb-bubble--flash");
  // Remove after 2s. Clear on a timeout so multiple clicks restack cleanly.
  window.setTimeout(() => el.classList.remove("mb-bubble--flash"), 2000);
}
const tokenTrend = computed<{ arrow: string; delta: number; sign: string; cls: string } | null>(() => {
  const prev = prevRoleTokenEstimate.value;
  if (prev == null) return null;
  const delta = tokenEstimate.value - prev;
  if (delta === 0) return { arrow: "→", delta: 0, sign: "±", cls: "mb-tokens-trend--flat" };
  if (delta > 0) return { arrow: "↑", delta, sign: "+", cls: "mb-tokens-trend--up" };
  return { arrow: "↓", delta: -delta, sign: "-", cls: "mb-tokens-trend--down" };
});
// Char / word / line breakdown for the token-chip tooltip. Words split on
// whitespace; CJK strings (no spaces) report char count as a fallback.
const charCount = computed(() => props.message.message?.length ?? 0);
const wordCount = computed(() => {
  const s = props.message.message ?? "";
  const trimmed = s.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
});
const lineCount = computed(() => {
  const s = props.message.message ?? "";
  if (!s) return 0;
  return s.split("\n").length;
});
const copyLabel = computed(() => store.copyFeedback[String(props.message.timestamp)] || "Copy");
const showTyping = computed(() => props.streaming && !props.message.message?.trim() && !props.message.error);
/** Phase label for the in-flight pet message — surfaces the llama_index
 *  pipeline stage (retrieving vs thinking) before the first token arrives.
 *  `retrieving` means the backend emitted a `{"data":{"phase":"retrieving"}}`
 *  SSE frame and the VectorStoreIndex / BM25 / hybrid retriever is now
 *  pulling chunks; otherwise we're in pre-retrieval "thinking" (LLM
 *  condense + system prompt setup). */
const phaseLabel = computed<string | null>(() => {
  if (!props.streaming || isUser.value || !showTyping.value) return null;
  return store.streamingPhase === "retrieving" ? "Retrieving from index…" : "Thinking…";
});
const empty = computed(() => !props.message.message?.trim());
const showAbortedTag = computed(() => !!props.message.aborted && !props.message.error);
const showRetryLabel = computed(() => !!(props.message.error || props.message.aborted));
const hasWebSearch = computed(() => !!props.message.searchContext && isUser.value);
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
  } catch { return new Set(); }
}
function persistExpandedSet(key: string, set: Set<string>): void {
  try { sessionStorage.setItem(key, JSON.stringify([...set])); } catch { /* ignore */ }
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
function isErrorLong(err: string): boolean { return err.length > ERROR_COLLAPSE_THRESHOLD; }
function isExpanded(idx: number): boolean { return expandedErrors.value.has(expandKey(idx)); }

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
function isContentLong(s: string): boolean { return s.length > CONTENT_COLLAPSE_THRESHOLD; }
function isContentExpanded(idx: number): boolean { return expandedContents.value.has(expandKey(idx)); }
const toolCount = computed(() => toolCalls.value.length);

// ── Context change proposals ──

/** Detected context change proposals in this pet message. Only meaningful for pet messages. */
const contextChanges = computed<ContextChange[]>(() => {
  if (isUser.value || props.streaming) return [];
  return detectContextChanges(props.message.message ?? "");
});

const hasContextChanges = computed(() => contextChanges.value.length > 0);

/** During streaming, detect if the AI has started a context: block but not finished it. */
const showProposingChanges = computed(() => {
  if (!props.streaming || isUser.value || !props.message.message) return false;
  return hasPartialContextBlock(props.message.message ?? "");
});

/**
 * Markdown text with context: and knowledge: blocks stripped so they don't
 * render as raw code blocks alongside the ContextChangeCard.
 * Uses the same fence-aware approach as the detector: find opening ```context:
 * or ```knowledge: and match to the NEXT ``` at line start.
 */
function stripContextBlocks(text: string): string {
  const OPEN_RE = /```(?:context|knowledge):[^\n]*\n/g;
  let result = "";
  let lastEnd = 0;
  let match: RegExpExecArray | null;
  OPEN_RE.lastIndex = 0;

  while ((match = OPEN_RE.exec(text)) !== null) {
    result += text.slice(lastEnd, match.index);
    // Find matching closing ``` at line start
    const afterOpen = text.slice(match.index + match[0].length);
    const closeMatch = /^```\s*$/gm.exec(afterOpen);
    if (closeMatch) {
      const closeIdx = match.index + match[0].length + closeMatch.index + closeMatch[0].length;
      lastEnd = closeIdx;
      OPEN_RE.lastIndex = closeIdx;
    } else {
      // No closing fence found — keep from opening onward
      lastEnd = match.index;
      break;
    }
  }
  result += text.slice(lastEnd);
  return result.trim();
}

const cleanMessageText = computed(() => {
  const text = props.message.message ?? "";
  if (hasContextChanges.value) {
    return stripContextBlocks(text);
  }
  return text;
});
const cleanHtml = computed(() => render(cleanMessageText.value));

/** Pet messages with sources get citation chips injected so `[1]`
 *  tokens emitted by the LLM become clickable superscripts that
 *  highlight the matching source card below. */
const sourceCount = computed(() => props.message.sources?.length ?? 0);
const citedHtml = computed(() => {
  const base = hasContextChanges.value ? cleanHtml.value : html.value;
  return sourceCount.value ? injectCitations(base, sourceCount.value) : base;
});

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
  const letter = top >= 0.85 ? "A" : top >= 0.70 ? "B" : top >= 0.50 ? "C" : "D";
  return { letter, top };
});

/** Track applied/rejected state per change path */
const changeStates = ref<Record<string, "applied" | "rejected" | "error">>({});

async function onApplyChange(path: string, content: string) {
  try {
    const change = contextChanges.value.find(c => c.path === path);
    if (change?.action === "addTag") {
      await store.addContextFile(path);
    } else if (change?.action === "removeTag") {
      await store.removeContextFile(path);
    } else if (change?.action === "saveToKB") {
      await store.saveContextToKnowledge(path, content);
    } else {
      await store.applyContextChange(path, content);
    }
    changeStates.value = { ...changeStates.value, [path]: "applied" };
  } catch {
    changeStates.value = { ...changeStates.value, [path]: "error" };
    throw new Error("Failed to apply");
  }
}

function onRejectChange(path: string) {
  changeStates.value = { ...changeStates.value, [path]: "rejected" };
}

function onUndoChange(path?: string) {
  store.undoLastContextChange(path);
}

async function onSaveToKB(path: string, content: string) {
  await store.saveContextToKnowledge(path, content);
  await store.applyContextChange(path, content);
}

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

async function saveToolCallToKB(content: string): Promise<void> {
  if (!content.trim()) return;
  try {
    const res = await ElMessageBox.prompt(
      "Enter the file path under YiKnowledge (e.g. notes/tool-output.md):",
      "Save tool result to Knowledge Base",
      {
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        inputValue: `notes/tool-result-${Date.now()}.md`,
        inputPlaceholder: "notes/tool-result.md",
      }
    );
    const path = (res?.value ?? "").trim();
    if (!path) return;
    await store.saveContextToKnowledge(path, content);
    ElMessage.success(`Saved "${path}" to knowledge base`);
  } catch {
    // user cancelled
  }
}

async function handleManualSaveToKB() {
  const text = props.message.message ?? "";
  if (!text.trim()) return;
  try {
    const res = await ElMessageBox.prompt(
      "Enter the file path under YiKnowledge (e.g. reports/my-report.md):",
      "Save to Knowledge Base",
      {
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        inputValue: `notes/ai-response-${Date.now()}.md`,
        inputPlaceholder: "reports/my-report.md"
      }
    );
    const path = (res?.value ?? "").trim();
    if (!path) return;
    await onSaveToKB(path, text);
    ElMessage.success(`Saved "${path}" to knowledge base`);
  } catch {
    // user cancelled
  }
}

async function applyAllChanges() {
  for (const change of contextChanges.value) {
    try {
      await onApplyChange(change.path, change.content);
    } catch {
      // continue to next change on error
    }
  }
}

function rejectAllChanges() {
  for (const change of contextChanges.value) {
    onRejectChange(change.path);
  }
}

async function onRegenerate() {
  if (showRetryLabel.value) await store.retryLastMessage();
  else await store.regenerateMessage(props.index);
}

async function onDelete() {
  try {
    await ElMessageBox.confirm("Delete this message?", "Confirm delete", {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning"
    });
  } catch {
    return;
  }
  await store.deleteMessage(props.index);
}

async function onEdit() {
  let res: { value?: string } | null = null;
  try {
    res = await ElMessageBox.prompt("Enter new content", "Edit message", {
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValue: props.message.message ?? ""
    });
  } catch {
    return;
  }
  const next = (res?.value ?? "").trim();
  if (!next) return;
  await store.editMessage(props.index, next);
}
</script>

<template>
  <div
    class="mb-bubble"
    :class="{ 'mb-bubble--user': isUser, 'mb-bubble--pet': !isUser, 'mb-bubble--error': props.message.error }"
    :data-msg-ts="String(props.message.timestamp ?? '')"
  >
    <div class="mb-content">
      <div v-if="props.message.imageDataUrls?.length" class="mb-images">
        <img v-for="(src, i) in props.message.imageDataUrls" :key="i" :src="src" class="mb-img" alt="" />
      </div>
      <!-- Queued agent follow-up tag — user deferred this for after the loop stops -->
      <div v-if="isFollowUp" class="mb-followup-tag">
        <el-icon :size="12"><Clock /></el-icon>
        <span>Follow-up queued — runs when the agent finishes</span>
      </div>
      <!-- Context change proposals (pet messages only) -->
      <TransitionGroup v-if="hasContextChanges && !showTyping" name="ccc-list" tag="div" class="mb-changes">
        <!-- Batch actions when 2+ proposals -->
        <div v-if="contextChanges.length > 1" key="batch-bar" class="mb-batch-bar">
          <el-button size="small" type="primary" @click="applyAllChanges">
            Apply all ({{ contextChanges.length }})
          </el-button>
          <el-button size="small" text @click="rejectAllChanges">
            Reject all
          </el-button>
        </div>
        <ContextChangeCard
          v-for="change in contextChanges"
          :key="change.path"
          :change="change"
          :on-apply="onApplyChange"
          :on-reject="onRejectChange"
          :on-undo="onUndoChange"
          :on-save-to-k-b="onSaveToKB"
        />
      </TransitionGroup>
      <!-- Streaming: show indicator when AI is proposing a context change -->
      <div v-if="showProposingChanges" class="mb-proposing">
        <span class="mb-proposing-dot" />
        <span>Proposing context changes...</span>
      </div>
      <div v-if="empty && !showTyping" class="mb-empty" />
      <div v-else-if="showTyping" class="mb-typing">
        <span v-if="phaseLabel" class="mb-typing-phase">{{ phaseLabel }}</span>
        <span class="mb-typing-dots">...</span>
      </div>
      <div v-else class="mb-markdown" @click="onMarkdownClick" v-html="citedHtml" />
      <!-- Web search indicator for user messages that triggered a search -->
      <div v-if="hasWebSearch" class="mb-web-indicator">
        <el-icon :size="12"><Search /></el-icon>
        <span>Web search results used</span>
      </div>
      <WebSearchResults v-if="hasWebSearch" :results="store.webSearchResults" />
      <div v-if="props.message.error" class="mb-error-tag">Generation failed</div>
      <div v-else-if="showAbortedTag" class="mb-aborted-tag">Stopped</div>
      <!-- RAG provenance badge — surfaces the llama_index config that produced this answer -->
      <div v-if="props.message.ragMeta" class="mb-rag-meta">
        <span
          v-if="retrievalGrade"
          class="mb-rag-meta-grade"
          :class="`mb-rag-meta-grade--${retrievalGrade.letter}`"
          :title="`Retrieval grade ${retrievalGrade.letter} — top cosine score ${(retrievalGrade.top * 100).toFixed(0)}% (A≥85, B≥70, C≥50, D<50)`"
        >{{ retrievalGrade.letter }}</span>
        <span class="mb-rag-meta-mode" :title="`llama_index ChatEngine: ${props.message.ragMeta.chatMode}`">{{ props.message.ragMeta.chatMode }}</span>
        <span v-if="props.message.ragMeta.hybrid" class="mb-rag-meta-chip mb-rag-meta-chip--on">hybrid</span>
        <span v-if="props.message.ragMeta.rerank" class="mb-rag-meta-chip mb-rag-meta-chip--on">rerank</span>
        <span v-if="props.message.ragMeta.citations" class="mb-rag-meta-chip mb-rag-meta-chip--on">citations</span>
        <span v-if="props.message.ragMeta.numQueries && props.message.ragMeta.numQueries > 1" class="mb-rag-meta-chip">Q×{{ props.message.ragMeta.numQueries }}</span>
        <span v-if="props.message.ragMeta.category" class="mb-rag-meta-chip mb-rag-meta-chip--filter" :title="`MetadataFilter: category='${props.message.ragMeta.category}' (TEXT_MATCH)`">cat:{{ props.message.ragMeta.category }}</span>
        <span
          v-for="t in (props.message.ragMeta.tags ?? [])"
          :key="t"
          class="mb-rag-meta-chip mb-rag-meta-chip--filter"
          :title="`MetadataFilter: tags includes '${t}' (TEXT_MATCH, AND-combined)`"
        >#{{ t }}</span>
        <code v-if="props.message.ragMeta.scope" class="mb-rag-meta-scope">{{ props.message.ragMeta.scope }}</code>
        <span
          v-if="props.message.firstTokenLatencyMs != null"
          class="mb-rag-meta-chip mb-rag-meta-chip--latency"
          :title="`Time-to-first-token: ${props.message.firstTokenLatencyMs}ms (retrieval + condense + synthesis before the first content chunk)`"
        >{{ formatLatency(props.message.firstTokenLatencyMs) }}</span>
      </div>
      <div
        v-else-if="!isUser && (props.message.firstTokenLatencyMs != null || retrievalGrade)"
        class="mb-rag-meta mb-rag-meta--bare"
        :title="`${retrievalGrade ? 'Retrieval grade ' + retrievalGrade.letter + ' · top ' + (retrievalGrade.top * 100).toFixed(0) + '%' : ''}${props.message.firstTokenLatencyMs != null ? ' · TTFT ' + props.message.firstTokenLatencyMs + 'ms' : ''}`"
      >
        <span
          v-if="retrievalGrade"
          class="mb-rag-meta-grade"
          :class="`mb-rag-meta-grade--${retrievalGrade.letter}`"
        >{{ retrievalGrade.letter }}</span>
        <span v-if="props.message.firstTokenLatencyMs != null" class="mb-rag-meta-chip mb-rag-meta-chip--latency">{{ formatLatency(props.message.firstTokenLatencyMs) }}</span>
      </div>
      <RagSources
        v-if="!isUser && props.message.sources?.length"
        ref="ragSourcesRef"
        :sources="props.message.sources"
      />
      <!-- Per-message tool calls (Pi-inspired: tool timeline) -->
      <!-- Agent mode: per-turn timelines with thinking/reasoning separation -->
      <template v-if="toolCount && !isUser && store.agentMode && store.agentTurnSummaries.length">
        <!-- Live turn budget (Pi: the user sees how close the agent is to
             max_turns, so they can reply 继续 or steer before the wall). -->
        <div
          v-if="store.agentTurnProgress.active && store.agentTurnProgress.max > 0"
          class="mb-agent-progress"
          :class="{ 'mb-agent-progress--near': store.agentTurnProgress.nearLimit }"
          :title="store.agentTurnProgress.nearLimit ? '即将达到最大轮次，任务可能未完成时可回复「继续」接着完成' : ''"
        >
          <span class="mb-agent-progress-label">
            Agent 运行中 · 第 {{ store.agentTurnProgress.current }} / {{ store.agentTurnProgress.max }} 轮
          </span>
          <el-progress
            :percentage="Math.min(100, Math.round((store.agentTurnProgress.current / store.agentTurnProgress.max) * 100))"
            :stroke-width="4"
            :show-text="false"
            :color="store.agentTurnProgress.nearLimit ? 'var(--el-color-warning)' : 'var(--el-color-primary)'"
          />
        </div>
        <div class="mb-agent-turns">
          <AgentTimeline
            v-for="(turn, ti) in store.agentTurnSummaries"
            :key="ti"
            :tool-calls="turn.toolCalls"
            :phase="(store.streamingPhase as any)"
            :turn-index="turn.turnIndex"
            :usage="ti === store.agentTurnSummaries.length - 1 ? store.agentUsage : null"
            :thinking-text="turn.thinkingText"
            :compact="false"
            @toggle-detail="() => toolsExpanded = true"
          />
        </div>
        <AgentEventsPanel
          v-if="store.agentEvents.length"
          :events="store.agentEvents"
          :turn-summaries="store.agentTurnSummaries"
        />
      </template>
      <!-- Non-agent mode: single timeline -->
      <AgentTimeline
        v-else-if="toolCount && !isUser"
        :tool-calls="toolCalls"
        :phase="(store.streamingPhase as any)"
        :usage="store.agentUsage"
        :compact="false"
        @toggle-detail="() => toolsExpanded = true"
      />
      <div v-if="toolCount && isUser" class="mb-tools">
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
                  'mb-tool-call-ms--very-slow': callLatencyLevel(call.durationMs) === 'very-slow',
                }"
                :title="callLatencyLevel(call.durationMs) ? `Slow call — ≥${callLatencyLevel(call.durationMs) === 'very-slow' ? MB_VERY_SLOW_BADGE_MS : slowThresholdMs}ms` : ''"
              >{{ call.durationMs }}ms</span>
              <span
                v-if="callLatencyLevel(call.durationMs) === 'slow'"
                class="mb-tool-call-tag mb-tool-call-tag--slow"
                title="Slow call (≥1s) — consider optimizing or caching"
              >slow</span>
              <span
                v-else-if="callLatencyLevel(call.durationMs) === 'very-slow'"
                class="mb-tool-call-tag mb-tool-call-tag--very-slow"
                title="Very slow call (≥5s) — investigate before relying on this tool in critical paths"
              >very slow</span>
              <span v-if="call.error" class="mb-tool-call-state mb-tool-call-state--err">failed</span>
            </div>
            <div v-if="call.args && Object.keys(call.args).length" class="mb-tool-call-args">
              <span class="mb-tool-call-args-label">args:</span>
              <code>{{ JSON.stringify(call.args) }}</code>
            </div>
            <div v-if="call.error" class="mb-tool-call-error">
              <span class="mb-tool-call-error-text">{{ isExpanded(i) || !isErrorLong(call.error) ? call.error : call.error.slice(0, ERROR_COLLAPSE_THRESHOLD) + '…' }}</span>
              <el-button
                v-if="isErrorLong(call.error)"
                size="small"
                text
                class="mb-tool-call-error-toggle"
                :title="isExpanded(i) ? 'Collapse error' : `Expand full error (${call.error.length} chars)`"
                @click="toggleErrorExpand(i)"
              >{{ isExpanded(i) ? '−' : `+${call.error.length - ERROR_COLLAPSE_THRESHOLD}` }}</el-button>
              <el-button
                size="small"
                text
                :icon="copiedToolIdx === i ? Check : (failedToolIdx === i ? Close : CopyDocument)"
                :type="copiedToolIdx === i ? 'success' : (failedToolIdx === i ? 'danger' : '')"
                class="mb-tool-call-copy mb-tool-call-copy--err"
                :title="copiedToolIdx === i ? 'Copied' : (failedToolIdx === i ? 'Copy failed' : 'Copy error')"
                @click="copyToolCallContent(call.error!, i)"
              >{{ copiedToolIdx === i ? 'Copied' : (failedToolIdx === i ? 'Failed' : 'Copy') }}</el-button>
              <el-button
                size="small"
                text
                :icon="FolderChecked"
                class="mb-tool-call-save mb-tool-call-save--err"
                title="Save error to the knowledge base"
                @click="saveToolCallToKB(call.error!)"
              >Save to KB</el-button>
            </div>
            <div v-else-if="call.content" class="mb-tool-call-content">
              <pre>{{ isContentExpanded(i) || !isContentLong(call.content) ? call.content : call.content.slice(0, CONTENT_COLLAPSE_THRESHOLD) + '…' }}</pre>
              <el-button
                v-if="isContentLong(call.content)"
                size="small"
                text
                class="mb-tool-call-content-toggle"
                :title="isContentExpanded(i) ? 'Collapse content' : `Expand full content (${call.content.length} chars)`"
                @click="toggleContentExpand(i)"
              >{{ isContentExpanded(i) ? '−' : `+${call.content.length - CONTENT_COLLAPSE_THRESHOLD}` }}</el-button>
              <el-button
                size="small"
                text
                :icon="copiedToolIdx === i ? Check : (failedToolIdx === i ? Close : CopyDocument)"
                :type="copiedToolIdx === i ? 'success' : (failedToolIdx === i ? 'danger' : '')"
                class="mb-tool-call-copy"
                :title="copiedToolIdx === i ? 'Copied' : (failedToolIdx === i ? 'Copy failed' : 'Copy result')"
                @click="copyToolCallContent(call.content!, i)"
              >{{ copiedToolIdx === i ? 'Copied' : (failedToolIdx === i ? 'Failed' : 'Copy') }}</el-button>
              <el-button
                size="small"
                text
                :icon="FolderChecked"
                class="mb-tool-call-save"
                title="Save this tool result to the knowledge base"
                @click="saveToolCallToKB(call.content!)"
              >Save to KB</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-meta">
      <div v-if="!isUser" class="mb-actions">
        <el-button size="small" text :icon="CopyDocument" @click="store.copyMessage(props.message)">{{ copyLabel }}</el-button>
        <el-button size="small" text :icon="Edit" :disabled="store.sending" @click="onEdit">Edit</el-button>
        <el-button
          v-if="!hasContextChanges && props.message.message?.trim()"
          size="small"
          text
          type="success"
          :icon="FolderChecked"
          :disabled="store.sending"
          title="Save this response to the knowledge base"
          @click="handleManualSaveToKB"
        >Save to KB</el-button>
        <el-button size="small" text :icon="RefreshRight" :disabled="store.sending" @click="onRegenerate">{{
          showRetryLabel ? "Retry" : "Regenerate"
        }}</el-button>
        <el-button
          size="small"
          text
          :icon="ChatDotRound"
          :disabled="store.sending"
          title="Branch this conversation into a new session seeded with the transcript up to here"
          @click="branchToNewSession"
        >Branch</el-button>
        <el-button size="small" text :icon="Delete" :disabled="store.sending" @click="onDelete">Delete</el-button>
      </div>
      <div v-else class="mb-actions">
        <el-button size="small" text :icon="Edit" :disabled="store.sending" @click="onEdit">Edit</el-button>
        <el-button size="small" text :icon="Promotion" :disabled="store.sending" @click="store.resendMessage(props.index)"
          >Resend</el-button
        >
        <el-button
          v-if="!hasWebSearch"
          size="small" text :icon="Search" :disabled="store.sending"
          :type="store.webSearchEnabled ? 'primary' : ''"
          @click="store.webSearchEnabled = true; store.resendMessage(props.index)"
        >Search Web</el-button>
        <el-button size="small" text :icon="Delete" :disabled="store.sending" @click="onDelete">Delete</el-button>
      </div>
      <time class="mb-time">{{ time }}</time>
      <el-tooltip
        :content="`${charCount} chars · ${wordCount} words · ${lineCount} line(s) · ~${tokenEstimate} tokens (chars/4 estimate)`"
        placement="top"
        :show-after="300"
      >
        <span class="mb-tokens" :class="isUser ? 'mb-tokens--user' : 'mb-tokens--pet'">
          ~{{ tokenEstimate }} tok
          <el-tooltip v-if="tokenTrend" placement="top" :show-after="200">
            <template #content>
              <div class="mb-trend-tip">
                <div><b>Previous {{ isUser ? "user" : "pet" }} message:</b> ~{{ prevRoleTokenEstimate }} tok (Δ {{ tokenTrend.sign }}{{ tokenTrend.delta }})</div>
                <div v-if="prevRoleMessage" class="mb-trend-tip-snip">"{{ prevRoleMessage.snippet }}"</div>
                <div class="mb-trend-tip-note">{{ tokenTrend.cls === "mb-tokens-trend--up" ? "Longer than previous" : tokenTrend.cls === "mb-tokens-trend--down" ? "Shorter than previous" : "Same length as previous" }}</div>
              </div>
            </template>
            <span class="mb-tokens-trend" :class="tokenTrend.cls" @click="scrollToPrevRoleMessage">{{ tokenTrend.arrow }}{{ tokenTrend.delta > 0 ? tokenTrend.delta : '' }}</span>
          </el-tooltip>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mb-bubble {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 12px;
}
.mb-bubble--user {
  align-self: flex-end;
  background: var(--el-color-primary-light-9);
  border-radius: 12px 12px 4px;
}
.mb-bubble--pet {
  align-self: flex-start;
  background: var(--el-fill-color-light);
  border-radius: 12px 12px 12px 4px;
}
.mb-bubble--error {
  border: 1px solid var(--el-color-danger);
}
.mb-content {
  overflow-wrap: anywhere;
}
.mb-markdown :deep(p) {
  margin: 0 0 4px;
}
.mb-markdown :deep(.cite-chip) {
  display: inline-flex;
  align-items: center;
  margin: 0 1px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  vertical-align: super;
  transition: background .12s, transform .12s;
  &:hover {
    background: var(--el-color-primary-light-7);
    color: #fff;
    transform: translateY(-1px);
  }
}
.mb-markdown :deep(pre) {
  padding: 8px;
  overflow-x: auto;
  font-size: 12px;
  background: var(--el-fill-color);
  border-radius: 6px;
}
.mb-markdown :deep(code) {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
}
.mb-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.mb-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}
.mb-typing {
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
  font-style: italic;
  color: var(--el-text-color-secondary);
  animation: mb-blink 1s infinite;
}
.mb-typing-phase {
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  font-family: "SF Mono", Menlo, monospace;
  letter-spacing: 0.3px;
  color: var(--el-color-primary);
}
.mb-typing-dots { animation: mb-blink 1s infinite; }

@keyframes mb-blink {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
.mb-empty {
  min-height: 1px;
}
.mb-error-tag {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-danger);
}
.mb-aborted-tag {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
// ── Queued follow-up tag (agent /followup) — user-side, deferred intent ──
.mb-followup-tag {
  display: inline-flex; align-items: center; gap: 4px;
  margin: 2px 0 6px;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
  border: 1px solid var(--el-color-info-light-7);
  border-radius: 999px;
}
// ── RAG provenance badge — surfaces the llama_index config per answer ──
.mb-rag-meta {
  display: flex; flex-wrap: wrap; gap: 3px;
  margin-top: 6px;
}
.mb-rag-meta-mode {
  display: inline-flex; align-items: center;
  height: 16px; padding: 0 6px;
  font-size: 9px; font-weight: 700; line-height: 1;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
}
.mb-rag-meta-chip {
  display: inline-flex; align-items: center;
  height: 16px; padding: 0 5px;
  font-size: 9px; font-weight: 600; line-height: 1;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: 8px;
}
.mb-rag-meta-chip--on {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.mb-rag-meta-chip--filter {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}
.mb-rag-meta-chip--latency {
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
}
.mb-rag-meta--bare { margin-top: 4px; }
// ── Retrieval-quality grade badge (A/B/C/D) ──
.mb-rag-meta-grade {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  font-size: 11px; font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  border-radius: 50%;
  color: var(--el-bg-color);
}
.mb-rag-meta-grade--A { background: var(--el-color-success); }
.mb-rag-meta-grade--B { background: var(--el-color-primary); }
.mb-rag-meta-grade--C { background: var(--el-color-warning); color: var(--el-text-color-primary); }
.mb-rag-meta-grade--D { background: var(--el-color-danger); }
.mb-rag-meta-scope {
  font-size: 9px; padding: 1px 5px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 4px;
}
.mb-web-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-radius: 10px;
}

// ── Per-message tool-call cards (Pi-inspired: tool timeline) ──
.mb-tools {
  margin-top: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}
.mb-tools-head {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}
.mb-tools-head:hover { background: var(--el-fill-color); }
.mb-tools-label { font-weight: 600; }
.mb-tools-caret { transition: transform 0.15s; margin-left: auto; }
.mb-tools-caret.is-open { transform: rotate(180deg); }
.mb-tools-list { border-top: 1px solid var(--el-border-color-lighter); padding: 4px 0; }
.mb-tool-call { padding: 6px 10px; border-bottom: 1px solid var(--el-border-color-lighter); }
.mb-tool-call:last-child { border-bottom: none; }
.mb-tool-call--err { background: var(--el-color-danger-light-9); }
.mb-tool-call-head { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; font-size: 11px; }
.mb-tool-call-name { font-weight: 600; color: var(--el-text-color-primary); }
.mb-tool-call-tag { font-family: "SF Mono", Menlo, monospace; color: var(--el-text-color-secondary); }
.mb-tool-call-ms { color: var(--el-text-color-placeholder); font-variant-numeric: tabular-nums; }
.mb-tool-call-ms--slow { color: var(--el-color-warning); font-weight: 600; }
.mb-tool-call-ms--very-slow { color: var(--el-color-danger); font-weight: 700; }
.mb-tool-call-tag--slow {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  padding: 0 4px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.mb-tool-call-tag--very-slow {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger-dark-2);
  padding: 0 4px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.mb-tool-call-state--err { color: var(--el-color-danger); font-weight: 600; }
.mb-tool-call-args { font-size: 11px; color: var(--el-text-color-regular); word-break: break-all; }
.mb-tool-call-args-label { color: var(--el-text-color-placeholder); margin-right: 4px; }
.mb-tool-call-args code { font-family: "SF Mono", Menlo, monospace; }
.mb-tool-call-content { margin-top: 4px; position: relative; }
.mb-tool-call-content pre {
  margin: 0;
  padding: 6px 8px;
  font-size: 11px;
  font-family: "SF Mono", Menlo, monospace;
  background: var(--el-fill-color-darker);
  border-radius: 4px;
  max-height: 120px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--el-text-color-regular);
}
.mb-tool-call-copy {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}
.mb-tool-call-content-toggle {
  position: absolute;
  top: 4px;
  right: 140px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  opacity: 0;
  transition: opacity 0.15s;
  &:hover { color: var(--el-color-primary); }
}
.mb-tool-call-content:hover .mb-tool-call-content-toggle,
.mb-tool-call-content:hover .mb-tool-call-copy { opacity: 1; }
.mb-tool-call-save {
  position: absolute;
  top: 4px;
  right: 64px;
  opacity: 0;
  transition: opacity 0.15s;
}
.mb-tool-call-content:hover .mb-tool-call-save { opacity: 1; }
.mb-tool-call-error { font-size: 11px; color: var(--el-color-danger); margin-top: 4px; position: relative; padding-right: 140px; }
.mb-tool-call-error-text { word-break: break-word; white-space: pre-wrap; }
.mb-tool-call-error-toggle {
  position: absolute;
  top: 0;
  right: 140px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  opacity: 0;
  transition: opacity 0.15s;
  &:hover { color: var(--el-color-danger); }
}
.mb-tool-call-error:hover .mb-tool-call-error-toggle { opacity: 1; }
.mb-tool-call-copy--err {
  position: absolute;
  top: 0;
  right: 64px;
  opacity: 0;
  transition: opacity 0.15s;
}
.mb-tool-call-save--err {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.mb-tool-call-error:hover .mb-tool-call-copy--err,
.mb-tool-call-error:hover .mb-tool-call-save--err { opacity: 1; }
.mb-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.mb-actions {
  display: flex;
  gap: 2px;
}
.mb-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.mb-tokens {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}
.mb-tokens--user {
  color: var(--el-color-info);
}
.mb-tokens--pet {
  color: var(--el-color-success);
}
.mb-tokens-trend {
  margin-left: 2px;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
  cursor: pointer;
  &:hover { opacity: 1; }
}
.mb-tokens-trend--up { color: var(--el-color-danger); }
.mb-tokens-trend--down { color: var(--el-color-success); }
.mb-tokens-trend--flat { color: var(--el-text-color-placeholder); }

// Flash highlight when navigating to a baseline message via trend click.
@keyframes mb-bubble-flash {
  0% { box-shadow: 0 0 0 0 var(--el-color-primary); background: var(--el-color-primary-light-9); }
  50% { box-shadow: 0 0 0 4px var(--el-color-primary-light-7); background: var(--el-color-primary-light-9); }
  100% { box-shadow: 0 0 0 0 transparent; background: transparent; }
}
.mb-bubble--flash {
  animation: mb-bubble-flash 2s ease-out;
  border-radius: 8px;
}

.mb-trend-tip {
  font-size: 12px;
  line-height: 1.5;
  max-width: 320px;
}
.mb-trend-tip b { font-weight: 600; }
.mb-trend-tip-snip {
  margin: 4px 0;
  padding: 3px 6px;
  background: var(--el-fill-color-light);
  border-radius: 3px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-regular);
  white-space: normal;
}
.mb-trend-tip-note {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}
.mb-changes {
  margin-bottom: 4px;
}
.mb-batch-bar {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0 8px;
}
/* TransitionGroup for context cards */
.ccc-list-enter-active,
.ccc-list-leave-active {
  transition: all 0.25s ease;
}
.ccc-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.ccc-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.mb-proposing {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--el-color-primary);
  border: 1px dashed var(--el-color-primary-light-5);
  border-radius: 6px;
}
.mb-proposing-dot {
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border-radius: 50%;
  animation: mb-blink 1s infinite;
}

// ── Agent multi-turn wrapper (Pi-inspired: per-turn timeline separation) ──
.mb-agent-turns {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.mb-agent-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 4px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-light);

  :deep(.el-progress) {
    flex: 1;
  }

  &--near {
    border-color: var(--el-color-warning-light-7);
    background: var(--el-color-warning-light-9);
  }
}

.mb-agent-progress-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;

  .mb-agent-progress--near & {
    color: var(--el-color-warning);
  }
}
</style>
