<script setup lang="ts">
/**
 * YiPet Chat — MessageBubble (Vue 3 SFC)
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  CopyDocument, Refresh, Delete, Edit, Link,
  FolderOpened, Search,
} from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import type { Message } from '../../types';
import { addCodeCopyButtons, formatTime, injectCitations, renderMarkdown, runMermaid } from '../../utils';
import { formatRelativeTime } from '@/utils/datetime';
import WebSearchResults from '../WebSearchResults.vue';
import RagSourcesPanel from './RagSourcesPanel.vue';
import MessageMetaRow from './MessageMetaRow.vue';
import MessageEditDialog from './MessageEditDialog.vue';
import RagMetaBadge from './RagMetaBadge.vue';

const props = defineProps<{
  message: Message;
  index: number;
  totalMessages: number;
}>();

const store = useChatStore();
const s = store.state;
const msg = props.message;

const isUser = msg.type === 'user';
const hasContent = computed(() => !!(msg.content || '').trim());
const images = msg.imageDataUrls ?? (msg.imageDataUrl ? [msg.imageDataUrl] : []);
const empty = computed(() => !hasContent.value && images.length === 0);
const streaming = computed(() => !!msg.streaming);
const copyState = s.copyFeedback[String(msg.timestamp)] || '';
const showRetryLabel = !!(msg.error || msg.aborted);
const isLastUser = computed(() => {
  if (!isUser) return false;
  const msgs = s.messages ?? [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].type === 'user') return i === props.index;
  }
  return false;
});
const isLastPet = !isUser && props.index === props.totalMessages - 1 && s.ragSources.length > 0 && s.knowledgeGrounded;
const isRagStreaming = computed(() => !isUser && streaming.value && s.knowledgeGrounded);
const liveSourceCount = computed(() => {
  if (!isRagStreaming.value) return 0;
  return s.ragSources.length;
});

// RAG provenance badge (mirrors YiVad aiChat)
function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
const retrievalGrade = computed<{ letter: string; top: number } | null>(() => {
  const sources = msg.sources ?? (isLastPet ? s.ragSources : []);
  if (!sources.length) return null;
  const scores = sources.map((s) => s.score ?? 0).filter(Boolean);
  if (!scores.length) return null;
  const top = Math.max(...scores);
  const letter = top >= 0.85 ? 'A' : top >= 0.70 ? 'B' : top >= 0.50 ? 'C' : 'D';
  return { letter, top };
});

/** Score bar width as percentage (0-100) for visual indicator. */
function scoreBarWidth(score?: number): string {
  if (score == null) return '0%';
  return `${Math.min(100, Math.round(score * 100))}%`;
}

/** Score color based on retrieval quality. */
function scoreColor(score?: number): string {
  if (score == null) return '#d4d0e8';
  if (score >= 0.85) return '#22c55e';
  if (score >= 0.70) return '#6366f1';
  if (score >= 0.50) return '#eab308';
  return '#ef4444';
}

/** File icon based on extension. */
function fileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    md: '\u{1F4DD}', py: '\u{1F40D}', ts: '\u{1F4E6}', vue: '\u{1F3A8}',
    js: '\u{1F4C4}', json: '\u{1F4CB}', yaml: '\u{2699}', yml: '\u{2699}',
    css: '\u{1F3A8}', scss: '\u{1F3A8}', html: '\u{1F310}', txt: '\u{1F4C4}',
    svg: '\u{1F5BC}', png: '\u{1F5BC}', jpg: '\u{1F5BC}',
  };
  return icons[ext || ''] || '\u{1F4C4}';
}

/** Whether a source path matches the session's context files. */
const sourceIsContextFile = (path: string): boolean => {
  const ses = s.sessions.find((x) => x.id === s.currentSessionId);
  if (!ses?.tags) return false;
  return ses.tags.some((t) => typeof t === 'string' && t.startsWith('ctx:') && t.slice(4) === path);
};
const hasRagMeta = computed(() => !isUser && (!!msg.ragMeta || retrievalGrade.value || msg.firstTokenLatencyMs != null));

const markdownHtml = computed(() => renderMarkdown(msg.content || ''));

// Live markdown during streaming — handles incomplete code blocks gracefully
const streamingHtml = computed(() => {
  const text = msg.content || '';
  if (!text) return '';
  // Close unclosed fenced code blocks to prevent broken rendering
  const openFences = (text.match(/```/g) || []).length;
  const safe = openFences % 2 === 1 ? text + '\n```' : text;
  return renderMarkdown(safe);
});

// Citation-injected HTML — transforms [N] markers into clickable superscripts
const sourceCount = computed(() => {
  if (isUser) return 0;
  const sources = msg.sources ?? (isLastPet ? s.ragSources : []);
  return sources.length;
});
const citedHtml = computed(() => {
  const base = markdownHtml.value;
  return sourceCount.value ? injectCitations(base, sourceCount.value) : base;
});

function onMarkdownClick(e: MouseEvent) {
  const chip = (e.target as HTMLElement).closest<HTMLElement>('.cite-chip');
  if (!chip) return;
  const idx = parseInt(chip.dataset.citeIdx ?? '0', 10) - 1;
  if (idx < 0) return;
  focusSource(idx);
}

const markdownRef = ref<HTMLElement | null>(null);
const editOpen = ref(false);
const editValue = ref('');

// ── Source expansion (mirrors YiVad RagSources) ──
const expandedSourceIdx = ref<number | null>(null);
const flashSourceIdx = ref<number | null>(null);
const sourceRefs = ref<Array<HTMLElement | null>>([]);

function toggleSourceExpand(idx: number) {
  expandedSourceIdx.value = expandedSourceIdx.value === idx ? null : idx;
}

function focusSource(idx: number) {
  const sources = msg.sources?.length ? msg.sources : s.ragSources;
  if (idx < 0 || idx >= sources.length) return;
  expandedSourceIdx.value = idx;
  flashSourceIdx.value = idx;
  nextTick(() => {
    sourceRefs.value[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  setTimeout(() => {
    if (flashSourceIdx.value === idx) flashSourceIdx.value = null;
  }, 1600);
}

watch(editOpen, (val) => {
  if (val) editValue.value = msg.content || '';
});

// Post-process markdown after streaming settles
watch(
  () => [msg.content, streaming.value] as const,
  async ([, isStreaming]) => {
    if (isStreaming) return;
    await nextTick();
    const el = markdownRef.value;
    if (!el) return;
    addCodeCopyButtons(el);
    void runMermaid(el);
  },
);

function onEditSave() {
  store.editMessage?.(props.index, editValue.value);
  editOpen.value = false;
}

function onDeleteConfirm() {
  if (confirm('Delete this message?')) {
    store.deleteMessage?.(props.index);
  }
}

function onCopy() {
  store.copyMessage?.(msg.content || '', msg.timestamp);
}

function onCopyRaw() {
  const text = msg.content || '';
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    store.state.copyFeedback[String(msg.timestamp)] = 'copied';
    setTimeout(() => { delete store.state.copyFeedback[String(msg.timestamp)]; }, 1500);
  });
}

// ── Text selection toolbar ──
const selToolbar = ref<{ x: number; y: number; text: string } | null>(null);
function onMarkdownMouseUp(e: MouseEvent) {
  const sel = window.getSelection();
  if (!sel || !sel.toString().trim()) { selToolbar.value = null; return; }
  const text = sel.toString().trim();
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  selToolbar.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 8,
    text,
  };
}

function selCopy() {
  if (!selToolbar.value) return;
  navigator.clipboard.writeText(selToolbar.value.text);
  selToolbar.value = null;
}

function selAction(prefix: string) {
  if (!selToolbar.value) return;
  store.state.inputTemplate = `${prefix}: ${selToolbar.value.text}`;
  selToolbar.value = null;
}

// Close toolbar when clicking outside
function onDocClick() { selToolbar.value = null; }

// ── Completion flash ──
const justCompleted = ref(false);
watch(() => msg.streaming, (was) => {
  if (was === false) return;
  justCompleted.value = true;
  setTimeout(() => { justCompleted.value = false; }, 1500);
});

const CHARS_PER_TOKEN = 4;
const tokenEstimate = computed(() => {
  const content = props.message.content || '';
  return Math.max(1, Math.ceil(content.length / CHARS_PER_TOKEN));
});

const messagesAll = computed(() => s.messages);
const prevRoleMessage = computed(() => {
  const all = messagesAll.value;
  if (!all?.length) return null;
  const idx = all.findIndex(m => m.timestamp === props.message.timestamp);
  if (idx <= 0) return null;
  for (let j = idx - 1; j >= 0; j--) {
    if (all[j] && all[j].type === props.message.type) return all[j];
  }
  return null;
});
const prevRoleTokenEstimate = computed(() => {
  const pm = prevRoleMessage.value;
  if (!pm) return 0;
  return Math.max(0, Math.ceil((pm.content || '').length / CHARS_PER_TOKEN));
});
const tokenTrend = computed(() => {
  const prev = prevRoleTokenEstimate.value;
  const cur = tokenEstimate.value;
  const delta = cur - prev;
  if (prev === 0 || delta === 0) return { arrow: '→', delta: 0, sign: '±', cls: 'mb-tokens-trend--flat' };
  if (delta > 0) return { arrow: '↑', delta, sign: '+', cls: 'mb-tokens-trend--up' };
  return { arrow: '↓', delta: -delta, sign: '-', cls: 'mb-tokens-trend--down' };
});
function scrollToPrevRoleMessage() {
  const pm = prevRoleMessage.value;
  if (!pm) return;
  const el = document.querySelector<HTMLElement>(`[data-msg-ts="${pm.timestamp}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('mb-bubble--flash');
  setTimeout(() => el.classList.remove('mb-bubble--flash'), 1200);
}

const charWordLineStats = computed(() => {
  const content = props.message.content || '';
  const chars = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content ? content.split('\n').length : 0;
  const toks = tokenEstimate.value;
  return `${chars} chars · ${words} words · ${lines} lines · ~${toks} tokens`;
});

function gradePct(g: string | undefined): number {
  switch ((g || '').toUpperCase()) {
    case 'A': return 92;
    case 'B': return 74;
    case 'C': return 52;
    case 'D': return 28;
    default: return 0;
  }
}
function gradeRing(g: string | undefined) {
  const pct = gradePct(g);
  const R = 8; const C = 2 * Math.PI * R;
  return { R, C, off: C - (pct / 100) * C, pct };
}
function toolProgressPct(ms: number | undefined): number {
  if (ms == null) return 0;
  const v = Math.min(100, Math.round((ms / 10000) * 100));
  return Math.max(2, v);
}
function toolSpeedClass(ms: number | undefined): string {
  if (ms == null) return 'is-idle';
  if (ms > 5000) return 'is-slow';
  if (ms > 2000) return 'is-mid';
  return 'is-fast';
}
function toolSpeedLabel(ms: number | undefined): string {
  if (ms == null) return 'pending';
  if (ms > 5000) return 'slow';
  if (ms > 2000) return 'mid';
  if (ms < 300)  return 'fast';
  return 'ok';
}

function formatDuration(ms: number): string {
  if (!ms || ms < 1) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
function stringifyTruncated(obj: Record<string, unknown>, max = 80): string {
  try {
    const s = JSON.stringify(obj);
    return s.length > max ? s.slice(0, max) + '…' : s;
  } catch {
    return String(obj).slice(0, max);
  }
}

const relativeTime = computed(() => {
  try {
    return formatRelativeTime(new Date(msg.timestamp).toISOString(), 'en');
  } catch { return ''; }
});

// Phase label during streaming (mirrors YiVad aiChat)
const showTyping = computed(() => streaming.value && !hasContent.value && !msg.error);

/** Live elapsed time during "thinking" — updated every 250ms while streaming. */
const thinkingElapsed = ref(0);
let _thinkingTimer: ReturnType<typeof setInterval> | null = null;
let _dotTimer: ReturnType<typeof setInterval> | null = null;

function _tickThinking() {
  if (!s.thinkingStartTs) { thinkingElapsed.value = 0; return; }
  thinkingElapsed.value = Date.now() - s.thinkingStartTs;
}

/** Thinking phase text — cycles through dots for a live-progress feel. */
const thinkingDots = ref(1);

onMounted(() => {
  _thinkingTimer = setInterval(_tickThinking, 250);
  _dotTimer = setInterval(() => { thinkingDots.value = (thinkingDots.value % 3) + 1; }, 500);
  document.addEventListener('click', onDocClick);
});
onBeforeUnmount(() => {
  if (_thinkingTimer) { clearInterval(_thinkingTimer); _thinkingTimer = null; }
  if (_dotTimer) { clearInterval(_dotTimer); _dotTimer = null; }
  document.removeEventListener('click', onDocClick);
});

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}

const thinkingWarnLevel = computed<'' | 'slow' | 'long'>(() => {
  if (!showTyping.value || !streaming.value) return '';
  const sec = thinkingElapsed.value / 1000;
  if (sec >= 30) return 'long';
  if (sec >= 10) return 'slow';
  return '';
});

const thinkingWarnLabel = computed(() => {
  if (thinkingWarnLevel.value === 'long') return 'Taking longer than usual…';
  if (thinkingWarnLevel.value === 'slow') return 'Still thinking…';
  return '';
});

const thinkingLabel = computed(() => {
  if (!streaming.value || isUser || !showTyping.value) return '';
  const dots = '.'.repeat(thinkingDots.value);
  if (s.streamingPhase === 'preparing') return `Preparing${dots}`;
  if (s.streamingPhase === 'retrieving') return `Retrieving${dots}`;
  return `Thinking${dots}`;
});

const ERROR_COLLAPSE_THRESHOLD = 200;
const CONTENT_COLLAPSE_THRESHOLD = 400;

const errorCollapsedKey = computed(() => props.message.timestamp
  ? `yipet:err:${props.message.timestamp}` : '');
const errorCollapsed = ref(true);
function toggleErrorCollapsed() {
  errorCollapsed.value = !errorCollapsed.value;
  try {
    if (errorCollapsedKey.value) sessionStorage.setItem(errorCollapsedKey.value, errorCollapsed.value ? '1' : '0');
  } catch { /* ignore */ }
}
try {
  if (errorCollapsedKey.value) {
    const v = sessionStorage.getItem(errorCollapsedKey.value);
    if (v === '0') errorCollapsed.value = false;
  }
} catch { /* ignore */ }

const shouldCollapseError = computed(() => {
  const err = props.message.content || '';
  return props.message.error && err.length > ERROR_COLLAPSE_THRESHOLD && errorCollapsed.value;
});
const errorDisplay = computed(() => {
  const err = props.message.content || '';
  if (!props.message.error) return err;
  return shouldCollapseError.value ? err.slice(0, ERROR_COLLAPSE_THRESHOLD) + '…' : err;
});

const contentCollapsedKey = computed(() => props.message.timestamp
  ? `yipet:content:${props.message.timestamp}` : '');
const contentCollapsed = ref(true);
function toggleContentCollapsed() {
  contentCollapsed.value = !contentCollapsed.value;
  try {
    if (contentCollapsedKey.value) sessionStorage.setItem(contentCollapsedKey.value, contentCollapsed.value ? '1' : '0');
  } catch { /* ignore */ }
}
try {
  if (contentCollapsedKey.value) {
    const v = sessionStorage.getItem(contentCollapsedKey.value);
    if (v === '0') contentCollapsed.value = false;
  }
} catch { /* ignore */ }

const shouldCollapseContent = computed(() => {
  const c = props.message.content || '';
  return props.message.type === 'pet' && !props.message.streaming && !props.message.error && c.length > CONTENT_COLLAPSE_THRESHOLD && contentCollapsed.value;
});
const contentDisplay = computed(() => {
  const c = props.message.content || '';
  if (props.message.type !== 'pet' || props.message.streaming || props.message.error) return c;
  return shouldCollapseContent.value ? c.slice(0, CONTENT_COLLAPSE_THRESHOLD) + '…' : c;
});

// ── Image lightbox ──
const lightboxSrc = ref('');
function openLightbox(src: string) { lightboxSrc.value = src; }
function closeLightbox() { lightboxSrc.value = ''; }

// ── Speed indicator (tok/s) ──
const streamStart = ref(0);
const streamCharCount = ref(0);
watch(() => msg.streaming, (s) => {
  if (s) { streamStart.value = Date.now(); streamCharCount.value = 0; }
});
watch(() => msg.content, (c) => {
  if (streaming.value) streamCharCount.value = (c || '').length;
});
const tokensPerSec = computed(() => {
  if (!streaming.value || !streamStart.value) return null;
  const elapsed = (Date.now() - streamStart.value) / 1000;
  if (elapsed < 0.5) return null;
  const chars = streamCharCount.value || (msg.content || '').length;
  return Math.round((chars / 4) / elapsed);
});

</script>

<template>
  <div
    class="mb-bubble"
    :class="{
      'mb-bubble--user': isUser,
      'mb-bubble--pet': !isUser,
      'mb-bubble--streaming': streaming,
      'mb-bubble--error': msg.error,
      'mb-bubble--aborted': msg.aborted && !msg.error,
      'mb-bubble--completed': justCompleted,
    }"
    :data-chat-idx="String(index)"
    :data-msg-ts="String(msg.timestamp)"
  >
    <!-- Avatar for pet messages -->
    <div class="mb-content">
      <!-- Images -->
      <div v-if="images.length > 0" class="mb-images">
        <img
          v-for="(src, i) in images"
          :key="`img-${i}-${src.slice(0, 12)}`"
          :src="src"
          :alt="`Attachment ${i + 1}`"
          class="mb-image"
          @click="openLightbox(src)"
        />
      </div>

      <!-- Empty -->
      <div v-if="empty && !streaming" class="mb-empty" />

      <!-- Typing indicator (mirrors YiVad PetMessage) -->
      <div
        v-else-if="showTyping"
        class="mb-typing"
        :class="{ 'mb-typing--slow': thinkingWarnLevel === 'slow', 'mb-typing--long': thinkingWarnLevel === 'long' }"
        role="status"
        aria-label="Generating"
      >
        <div class="mb-typing-inner">
          <span class="mb-typing-pulse"><span /><span /><span /></span>
          <span class="mb-typing-phase">{{ thinkingLabel }}</span>
          <span v-if="thinkingElapsed > 500" class="mb-typing-elapsed">{{ formatElapsed(thinkingElapsed) }}</span>
        </div>
        <div v-if="thinkingWarnLabel" class="mb-typing-warn">{{ thinkingWarnLabel }}</div>
        <button class="mb-typing-stop" title="Stop generating" @click="store.stopSending()">
          <span class="mb-typing-stop-icon" />
          Stop
        </button>
      </div>

      <!-- Markdown content with streaming enhancements -->
      <div v-else class="mb-markdown-wrap" :class="{ 'is-streaming': streaming }">
        <div v-if="streaming && !isUser" class="mb-live-indicator">
          <span class="mb-live-dot" />
          <span class="mb-live-label">typing</span>
        </div>
        <div
          ref="markdownRef"
          class="mb-markdown markdown-content"
          :class="{ 'mb-markdown--streaming': streaming }"
          v-html="isUser ? renderMarkdown(msg.content || '') : (streaming ? streamingHtml : (msg.error ? renderMarkdown(errorDisplay) : (shouldCollapseContent ? renderMarkdown(contentDisplay) : citedHtml)))"
          @mouseup="!isUser && onMarkdownMouseUp"
          @click="onMarkdownClick"
        />
        <span v-if="streaming" class="mb-caret" aria-hidden="true" />
        <span v-if="tokensPerSec && streaming" class="mb-speed">{{ tokensPerSec }} tok/s</span>
        <div v-if="streaming && !isUser" class="mb-stream-fade" />
        <button
          v-if="msg.error && shouldCollapseError"
          class="mb-collapse-btn"
          @click="toggleErrorCollapsed"
        >
          Expand error ({{ (msg.content || '').length }} chars)
        </button>
        <button
          v-if="msg.error && !shouldCollapseError && (msg.content || '').length > ERROR_COLLAPSE_THRESHOLD"
          class="mb-collapse-btn"
          @click="toggleErrorCollapsed"
        >
          Collapse
        </button>
        <button
          v-if="!isUser && !streaming && !msg.error && shouldCollapseContent"
          class="mb-collapse-btn"
          @click="toggleContentCollapsed"
        >
          Read more ({{ (msg.content || '').length }} chars)
        </button>
        <button
          v-if="!isUser && !streaming && !msg.error && !shouldCollapseContent && (msg.content || '').length > CONTENT_COLLAPSE_THRESHOLD"
          class="mb-collapse-btn"
          @click="toggleContentCollapsed"
        >
          Collapse
        </button>
      </div>

      <!-- Error/aborted tags -->
      <div v-if="msg.error" class="mb-tag mb-tag--error">Generation failed</div>
      <div v-if="msg.aborted && !msg.error" class="mb-tag mb-tag--aborted">Stopped</div>

      <!-- RAG provenance badge (mirrors YiVad aiChat) -->
      <RagMetaBadge
        v-if="hasRagMeta"
        :rag-meta="msg.ragMeta ?? null"
        :retrieval-grade="retrievalGrade"
        :first-token-latency-ms="msg.firstTokenLatencyMs"
        :format-latency="formatLatency"
      />
      <span v-if="msg.retrievalGrade" class="mb-ret-grade-wrap" :title="`Retrieval grade ${msg.retrievalGrade}`">
        <svg viewBox="0 0 20 20" class="mb-ret-ring">
          <circle cx="10" cy="10" r="8" class="mb-ret-ring-bg" />
          <circle cx="10" cy="10" :r="gradeRing(msg.retrievalGrade).R"
            class="mb-ret-ring-fg" :class="`grade-${msg.retrievalGrade}`"
            stroke-dasharray="100 100" :stroke-dashoffset="gradeRing(msg.retrievalGrade).off" />
        </svg>
        <span class="mb-ret-grade-letter">{{ msg.retrievalGrade }}</span>
        <span v-if="msg.ragContentSummary" class="mb-ret-sum" :title="msg.ragContentSummary">{{ msg.ragContentSummary }}</span>
      </span>

      <!-- Token estimate and trend -->
      <div v-if="props.message.type === 'pet' && !props.message.streaming" class="mb-tokens">
        <span class="mb-tokens-count" :title="charWordLineStats">
          ~{{ tokenEstimate }} tok
        </span>
        <span
          v-if="prevRoleMessage"
          class="mb-tokens-trend"
          :class="tokenTrend.cls"
          :title="`${tokenTrend.sign}${tokenTrend.delta} vs previous ${props.message.type} message · click to jump`"
          @click="scrollToPrevRoleMessage"
        >
          {{ tokenTrend.arrow }} {{ tokenTrend.sign }}{{ tokenTrend.delta }}
        </span>
      </div>

      <!-- RAG sources (per-message or last-pet fallback, mirrors YiVad RagSources) -->
      <RagSourcesPanel
        v-if="!isUser && (msg.sources?.length || (isLastPet && s.ragSources.length) || (isRagStreaming && liveSourceCount > 0))"
        :sources="msg.sources?.length ? msg.sources : s.ragSources"
        :expanded-idx="expandedSourceIdx"
        :flash-idx="flashSourceIdx"
        :file-icon="fileIcon"
        :score-color="scoreColor"
        :score-bar-width="scoreBarWidth"
        :source-is-context-file="sourceIsContextFile"
        @toggle-expand="toggleSourceExpand"
        @source-ref="(i, el) => { if (el) sourceRefs[i] = el; }"
      />

      <!-- Tool calls timeline (Pi-inspired) -->
      <div v-if="props.message.type === 'pet' && props.message.toolCalls?.length" class="mb-tool-timeline">
        <div class="mb-tool-timeline-label">Tools</div>
        <div class="mb-tool-calls">
          <div
            v-for="(tc, i) in props.message.toolCalls"
            :key="`${tc.name}-${i}`"
            class="mb-tool-call"
          >
            <div class="mb-tool-call-header">
              <span class="mb-tool-call-name">{{ tc.label }}</span>
              <span v-if="tc.durationMs" class="mb-tool-call-duration">
                {{ formatDuration(tc.durationMs) }}
              </span>
              <span
                v-if="tc.durationMs && tc.durationMs > 2000"
                class="mb-tool-call-slow"
                :class="{ 'mb-tool-call-slow--very': tc.durationMs > 5000 }"
              >
                {{ tc.durationMs > 5000 ? 'very slow' : 'slow' }}
              </span>
              <span v-if="tc.error" class="mb-tool-call-error">err</span>
            </div>
            <div v-if="tc.durationMs != null" class="mb-tool-prog">
              <div class="mb-tool-prog-bar" :class="toolSpeedClass(tc.durationMs)" :style="`width:${toolProgressPct(tc.durationMs)}%`" />
              <span class="mb-tool-prog-label">{{ toolSpeedLabel(tc.durationMs) }}</span>
            </div>
            <div v-if="tc.args" class="mb-tool-call-args">
              {{ stringifyTruncated(tc.args, 80) }}
            </div>
            <div v-if="tc.content" class="mb-tool-call-content">
              <details>
                <summary>Result ({{ tc.content.length }} chars)</summary>
                <pre>{{ tc.content.slice(0, 1200) }}{{ tc.content.length > 1200 ? '…' : '' }}</pre>
              </details>
            </div>
            <div v-if="tc.error" class="mb-tool-call-errstack">
              <details>
                <summary>Error</summary>
                <pre>{{ tc.error }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Web search results (mirrors YiVad aiChat) -->
      <!-- Web search indicator (mirrors YiVad aiChat) -->
      <div v-if="isUser && s.webSearchEnabled && s.webSearchResults.length > 0" class="mb-web-indicator">
        <el-icon :size="12"><Search /></el-icon>
        <span>Web search results used</span>
      </div>
      <WebSearchResults v-if="isUser && isLastUser && s.webSearchResults.length > 0" :results="s.webSearchResults" />
    </div>

    <!-- Meta row -->
    <MessageMetaRow
      :is-user="isUser"
      :is-processing="s.isProcessing"
      :has-content="hasContent"
      :show-retry-label="showRetryLabel"
      :copy-state="copyState"
      :timestamp="msg.timestamp"
      :formatted-time="formatTime(msg.timestamp)"
      :relative-time="relativeTime"
      :token-estimate="tokenEstimate"
      :has-web-search="!!(s.webSearchResults?.length || msg.searchGrounded)"
      @copy="onCopy"
      @edit="editOpen = true"
      @regenerate="store.regenerateMessage?.(index)"
      @delete="onDeleteConfirm"
      @resend="store.resendMessage?.(index)"
      @search-web="s.webSearchEnabled = true; store.resendMessage?.(index)"
      @deepen-search="s.webSearchEnabled = true; store.regenerateMessage?.(index)"
      @save-to-knowledge="store.openSaveToKnowledge?.(msg.timestamp)"
      @open-in-yi-vad="store.openMessageInYiVad?.(msg.timestamp)"
    />

    <!-- Edit modal -->
    <MessageEditDialog
      v-model="editValue"
      :open="editOpen"
      @close="editOpen = false"
      @save="onEditSave"
    />

    <!-- Image lightbox -->
    <Teleport to="body">
      <div v-if="lightboxSrc" class="mb-lightbox" @click="closeLightbox">
        <img :src="lightboxSrc" class="mb-lightbox-img" @click.stop />
        <button class="mb-lightbox-close" @click="closeLightbox">&times;</button>
      </div>
    </Teleport>
  </div>

  <!-- Text selection toolbar -->
  <Teleport to="body">
    <div
      v-if="selToolbar"
      class="mb-sel-toolbar"
      :style="{ left: selToolbar.x + 'px', top: selToolbar.y + 'px' }"
      @click.stop
    >
      <button class="mb-sel-btn" @click="selCopy">Copy</button>
      <button class="mb-sel-btn" @click="selAction('Search web for')">Search</button>
      <button class="mb-sel-btn" @click="selAction('Explain')">Explain</button>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.mb-bubble {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  padding: 10px 14px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 6px;
  animation: mb-slide-in 0.25s ease-out;
}

.mb-bubble--user {
  align-self: flex-end;
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-radius: 6px 6px 2px 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.mb-bubble--pet {
  align-self: flex-start;
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 6px 6px 6px 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.mb-bubble--error {
  border: 1px solid var(--el-color-danger, #f56c6c);
}


// ── Completion animation ──
.mb-bubble--completed {
  animation: mb-complete-flash 1.5s ease-out;
}

@keyframes mb-complete-flash {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); border-color: rgba(34, 197, 94, 0.5); }
  30% { box-shadow: 0 0 16px 2px rgba(34, 197, 94, 0.25); border-color: rgba(34, 197, 94, 0.6); }
  100% { box-shadow: 0 0 0 0 transparent; border-color: inherit; }
}

.mb-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.mb-images { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.mb-image { max-width: 100%; border-radius: 6px; cursor: pointer; transition: transform 0.15s; &:hover { transform: scale(1.02); } }
.mb-empty { min-height: 14px; }

.mb-typing {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  padding: 10px 14px;
  color: #d4d0e8;
  background: rgba(30, 26, 59, 0.85);
  border-radius: 12px 12px 12px 4px;
  transition: background 0.3s, border-color 0.3s;
}
.mb-typing--slow {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
}
.mb-typing--long {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
}
.mb-typing-inner {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.mb-typing-elapsed {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.7;
}
.mb-typing-warn {
  font-size: 11px;
  font-weight: 500;
  color: #eab308;
}
.mb-typing--long .mb-typing-warn {
  color: #ff4d4f;
}
.mb-typing-stop {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #ff4d4f;
  cursor: pointer;
  background: none;
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover {
    color: #fff;
    background: #ff4d4f;
    border-color: #ff4d4f;
  }
}
.mb-typing-stop-icon {
  display: block;
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 1px;
}
.mb-typing-phase {
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
  letter-spacing: 0.3px;
  color: #818cf8;
}
.mb-typing-pulse {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}
.mb-typing-pulse span {
  width: 7px;
  height: 7px;
  background: #818cf8;
  border-radius: 50%;
  animation: mb-pulse 1.4s ease-in-out infinite;
}
.mb-typing-pulse span:nth-child(2) { animation-delay: 0.2s; }
.mb-typing-pulse span:nth-child(3) { animation-delay: 0.4s; }

@keyframes mb-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.mb-tag {
  align-self: flex-start; display: inline-block; font-size: 11px;
  padding: 1px 6px; border-radius: 4px; margin-top: 4px;
}
.mb-tag--error {
  background: rgba(255, 77, 79, 0.15); color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.4);
}
.mb-tag--aborted {
  background: rgba(0, 0, 0, 0.06); color: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.mb-token-chip--in { color: #0ea5e9; background: rgba(14, 165, 233, 0.1); }
.mb-token-chip--out { color: #16a34a; background: rgba(34, 197, 94, 0.1); }

// ── Hover-reveal message actions ──
:deep(.mb-meta) {
  display: flex; justify-content: space-between; align-items: center;
  gap: 4px; margin-top: 4px; flex-wrap: wrap;
}

:deep(.mb-actions) {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.mb-bubble:hover :deep(.mb-actions),
.mb-bubble--streaming :deep(.mb-actions),
.mb-bubble--error :deep(.mb-actions),
.mb-bubble--aborted :deep(.mb-actions) {
  opacity: 1;
}

.mb-rag-meta-grade {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  font-size: 11px; font-weight: 800;
  font-family: 'SF Mono', 'Menlo', monospace;
  border-radius: 50%;
  color: #13122a;
}
.mb-rag-meta-grade--A { background: #22c55e; }
.mb-rag-meta-grade--B { background: #6366f1; }
.mb-rag-meta-grade--C { background: #eab308; color: #f5f3ff; }
.mb-rag-meta-grade--D { background: #ef4444; }
.mb-rag-meta-scope {
  font-size: 9px; padding: 1px 5px;
  color: #d4d0e8;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
}

/* Bare RAG meta fallback (mirrors YiVad) */
.mb-rag-meta--bare {
  opacity: 0.65;
}

/* RAG sources (mirrors YiVad RagSources) */
.mb-sources {
  margin-top: 8px; padding: 8px 10px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px; background: rgba(0, 0, 0, 0.18);
  font-size: 11px; color: #d4d0e8;
}
.mb-sources__title {
  display: flex; align-items: center; gap: 6px; font-weight: 600;
  margin-bottom: 6px; color: #818cf8;
  font-size: 11px;
}
.mb-sources__count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 16px; padding: 0 5px;
  font-size: 10px; font-weight: 700; line-height: 1;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 8px;
}
.mb-sources__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.mb-sources__item {
  border-radius: 4px;
  transition: background 0.15s;
  &:hover { background: rgba(99, 102, 241, 0.06); }
}
.mb-sources__head {
  display: flex; align-items: center; gap: 6px;
  padding: 3px 4px;
  cursor: pointer;
  user-select: none;
}
.mb-sources__idx {
  flex-shrink: 0;
  width: 16px; height: 16px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 4px;
}
.mb-sources__icon {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1;
}
.mb-sources__path {
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1 1 auto;
  font-size: 11px;
}
.mb-sources__ctx-badge {
  flex-shrink: 0;
  display: inline-flex; align-items: center;
  height: 14px; padding: 0 4px;
  font-size: 8px; font-weight: 700; line-height: 1;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 3px;
  text-transform: uppercase;
}
.mb-sources__score-bar {
  flex-shrink: 0;
  width: 32px; height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.mb-sources__score-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.mb-sources__score { font-variant-numeric: tabular-nums; opacity: 0.7; flex: 0 0 auto; font-size: 10px; font-weight: 600; }
.mb-sources__toggle { font-size: 10px; opacity: 0.5; flex-shrink: 0; }
.mb-sources__snippet {
  padding: 6px 8px 6px 28px;
  font-size: 11px; line-height: 1.5;
  color: #f5f3ff;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 0 0 4px 4px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow-y: auto;
}
.mb-sources__snippet-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #d4d0e8;
  margin-bottom: 4px;
}

/* Flash highlight when citation chip navigates to a source */
@keyframes mb-source-flash {
  0% { background: rgba(99, 102, 241, 0.25); }
  100% { background: transparent; }
}
.mb-sources__item--flash {
  animation: mb-source-flash 2s ease-out;
  border-radius: 4px;
}

/* Markdown + caret */
.mb-markdown-wrap {
  position: relative;
  transition: padding 0.15s;
  &.is-streaming {
    padding-bottom: 2px;
    border-left: 2px solid rgba(99, 102, 241, 0.45);
    padding-left: 10px;
    animation: mb-stream-glow 2s ease-in-out infinite;
  }
}

/* Live typing indicator badge */
.mb-live-indicator {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 2px 10px;
  margin-bottom: 6px;
  font-size: 11px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  animation: mb-live-fade-in 0.3s ease-out;
}
.mb-live-dot {
  width: 6px;
  height: 6px;
  background: #818cf8;
  border-radius: 50%;
  animation: mb-live-pulse 1s ease-in-out infinite;
}
.mb-live-label {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 10px;
  font-weight: 600;
  color: #818cf8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes mb-live-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes mb-live-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* Bottom gradient fade */
.mb-stream-fade {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 24px;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(30, 26, 59, 0.85) 80%);
  border-radius: 0 0 12px 12px;
  animation: mb-fade-pulse 2s ease-in-out infinite;
}
@keyframes mb-fade-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

@keyframes mb-stream-glow {
  0%, 100% { border-left-color: rgba(99, 102, 241, 0.45); }
  50% { border-left-color: #818cf8; }
}

.mb-markdown {
  animation: mb-fade-in 0.2s ease-out;

  &--streaming {
    animation: none;
  }
}

/* Plain-text streaming content — no markdown parsing, instant rendering */

@keyframes mb-fade-in {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.mb-caret {
  display: inline-block; width: 8px; height: 1.35em; margin-left: 1px;
  background: #818cf8;
  vertical-align: text-bottom;
  border-radius: 1px;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
  animation: mb-caret-blink 0.7s step-end infinite;
}

@keyframes mb-caret-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.mb-speed {
  margin-left: 6px;
  font-size: 10px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.5;
}

// ── Code block line numbers ──
:deep(pre) {
  counter-reset: mb-line;
  code {
    counter-increment: mb-line;
    &::before {
      content: none;
    }
  }
  // Each line gets a ::before with the line number
  .line {
    display: block;
    &::before {
      counter-increment: mb-line;
      content: counter(mb-line);
      display: inline-block;
      width: 2em;
      margin-right: 1em;
      text-align: right;
      color: rgba(255, 255, 255, 0.2);
      font-size: 0.85em;
      user-select: none;
    }
  }
}

/* ── Markdown Content Typography ───────── */

.mb-markdown {
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 1.2em 0 0.5em;
    line-height: 1.3;
    font-weight: 600;
    &:first-child { margin-top: 0; }
  }
  :deep(h1) { font-size: 1.4em; border-bottom: 1px solid rgba(99, 102, 241, 0.25); padding-bottom: 0.3em; }
  :deep(h2) { font-size: 1.25em; }
  :deep(h3) { font-size: 1.1em; }
  :deep(h4) { font-size: 1em; color: #d4d0e8; }

  :deep(p) { margin: 0.6em 0; line-height: 1.65; }
  :deep(p:first-child) { margin-top: 0; }
  :deep(p:last-child) { margin-bottom: 0; }

  :deep(a) {
    color: #818cf8;
    text-decoration: none;
    border-bottom: 1px solid rgba(99, 102, 241, 0.3);
    transition: border-color 0.15s;
    &:hover { border-color: #818cf8; }
  }

  :deep(.cite-chip) {
    display: inline-flex;
    align-items: center;
    margin: 0 1px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.4;
    color: #818cf8;
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    vertical-align: super;
    transition: background 0.12s, transform 0.12s;
    &:hover {
      background: rgba(99, 102, 241, 0.25);
      color: #fff;
      transform: translateY(-1px);
    }
  }

  :deep(strong) { font-weight: 600; color: #f5f3ff; }
  :deep(em) { font-style: italic; }

  :deep(ul), :deep(ol) {
    margin: 0.4em 0;
    padding-left: 1.5em;
    line-height: 1.65;
  }
  :deep(li) { margin: 0.2em 0; }
  :deep(ul) { list-style: disc; }
  :deep(ul ul) { list-style: circle; }
  :deep(ul ul ul) { list-style: square; }
  :deep(ol) { list-style: decimal; }

  :deep(blockquote) {
    margin: 0.6em 0;
    padding: 6px 14px;
    border-left: 3px solid #818cf8;
    background: rgba(99, 102, 241, 0.06);
    border-radius: 0 4px 4px 0;
    color: #d4d0e8;
    p { margin: 0.3em 0; }
  }

  :deep(code) {
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.88em;
    background: rgba(99, 102, 241, 0.1);
    padding: 1px 5px;
    border-radius: 4px;
    color: #e2e8f0;
  }

  :deep(pre) {
    position: relative;
    margin: 0.8em 0;
    padding: 14px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.55;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 8px;

    code {
      background: none;
      padding: 0;
      font-size: inherit;
      color: inherit;
      border-radius: 0;
    }
  }

  :deep(.code-block-wrapper) {
    margin: 0.8em 0;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 8px;
    overflow: hidden;

    pre {
      margin: 0;
      border: none;
      border-radius: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }

  :deep(.code-block-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  }

  :deep(.code-block-lang) {
    font-size: 10px;
    font-weight: 700;
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #818cf8;
  }

  :deep(table) {
    width: 100%;
    margin: 0.8em 0;
    border-collapse: collapse;
    font-size: 0.92em;
    overflow: hidden;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 8px;
  }

  :deep(th), :deep(td) {
    padding: 8px 12px;
    border: 1px solid rgba(99, 102, 241, 0.15);
    text-align: left;
  }

  :deep(th) {
    background: rgba(99, 102, 241, 0.12);
    font-weight: 600;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: #818cf8;
  }

  :deep(tr:nth-child(even) td) {
    background: rgba(255, 255, 255, 0.02);
  }

  :deep(tr:hover td) {
    background: rgba(99, 102, 241, 0.06);
  }

  // ── Task list checkboxes ──
  :deep(input[type="checkbox"]) {
    margin-right: 6px;
    accent-color: #6366f1;
    width: 14px;
    height: 14px;
    cursor: default;
    vertical-align: middle;
  }

  :deep(li:has(input[type="checkbox"]:checked)) {
    text-decoration: line-through;
    opacity: 0.6;
  }

  :deep(hr) {
    margin: 1em 0;
    border: none;
    border-top: 1px solid rgba(99, 102, 241, 0.2);
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 0.4em 0;
  }

  :deep(input[type="checkbox"]) {
    margin-right: 6px;
    accent-color: #6366f1;
  }

  :deep(pre.mermaid) {
    all: unset;
    display: block;
    overflow-x: auto;
    margin: 12px 0;
    svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
  }
}

/* Code copy button */
:deep(.mb-code-copy) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-family: inherit;
  color: #d4d0e8;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.3);
    color: #f5f3ff;
  }
}

:deep(pre:hover .mb-code-copy) {
  opacity: 1;
}

/* Edit dialog */
.mb-edit-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.mb-edit-btn {
  padding: 6px 16px; border-radius: 6px; border: none; font-size: 13px; cursor: pointer;
  &--cancel { background: rgba(255, 255, 255, 0.1); color: #d4d0e8; }
  &--save { background: #6366f1; color: #fff; }
}

/* ── Web search indicator ── */

.mb-web-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 11px;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 10px;
}

.mb-web-icon { font-size: 11px; }

/* ── Image lightbox ── */
.mb-lightbox {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  animation: mb-lightbox-in 0.2s ease-out;
}

@keyframes mb-lightbox-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mb-lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  cursor: default;
}

.mb-lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.2); }
}

/* ── Selection toolbar ── */
.mb-sel-toolbar {
  position: fixed;
  z-index: 2147483647;
  display: flex;
  gap: 2px;
  padding: 4px;
  background: rgba(30, 26, 59, 0.98);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translate(-50%, -100%);
  animation: mb-sel-in 0.15s ease-out;
}

@keyframes mb-sel-in {
  from { opacity: 0; transform: translate(-50%, calc(-100% + 8px)); }
  to { opacity: 1; transform: translate(-50%, -100%); }
}

.mb-sel-btn {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #f5f3ff;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
  &:hover {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
    color: #818cf8;
  }
}

.mb-collapse-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 6px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: rgba(99, 102, 241, 0.18);
    border-color: rgba(99, 102, 241, 0.4);
  }
}

.mb-tokens {
  display: flex;
  gap: 6px;
  align-items: center;
  padding-top: 4px;
  font-size: 10px;
  font-family: 'SF Mono', Menlo, monospace;
  font-variant-numeric: tabular-nums;
  color: #9ca3af;
}
.mb-tokens-trend {
  cursor: pointer;
  padding: 0 4px;
  border-radius: 3px;
  transition: background .15s;
  user-select: none;
}
.mb-tokens-trend:hover { background: rgba(99,102,241,.15); }
.mb-tokens-trend--flat { color: #9ca3af; }
.mb-tokens-trend--up { color: #f87171; }
.mb-tokens-trend--down { color: #34d399; }

.mb-bubble--flash {
  animation: mb-flash 1.2s ease-out;
}
@keyframes mb-flash {
  0% { box-shadow: 0 0 0 3px rgba(99,102,241,.6); background: rgba(99,102,241,.12); }
  100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); background: transparent; }
}

.mb-tool-timeline { margin-top: 8px; }
.mb-tool-timeline-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #818cf8;
  margin-bottom: 4px;
}
.mb-tool-calls { display: flex; flex-direction: column; gap: 4px; }
.mb-tool-call {
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 6px;
  padding: 6px 8px;
  background: rgba(99,102,241,.05);
}
.mb-tool-call-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.mb-tool-call-name {
  font-weight: 600;
  color: #c7d2fe;
}
.mb-tool-call-duration {
  font-family: 'SF Mono', monospace;
  font-size: 10px;
  color: #94a3b8;
}
.mb-tool-call-slow {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(251,191,36,.15);
  color: #fbbf24;
  font-weight: 600;
}
.mb-tool-call-slow--very {
  background: rgba(239,68,68,.15);
  color: #ef4444;
}
.mb-tool-call-error {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(239,68,68,.15);
  color: #ef4444;
  font-weight: 600;
}
.mb-tool-call-args {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 3px;
  font-family: 'SF Mono', monospace;
}
.mb-tool-call-content { margin-top: 4px; }
.mb-tool-call-content summary { cursor: pointer; font-size: 10px; color: #94a3b8; }
.mb-tool-call-content pre {
  font-size: 10px;
  padding: 4px 6px;
  background: rgba(0,0,0,.3);
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 3px;
  color: #d1d5db;
}
.mb-tool-call-errstack { margin-top: 4px; }
.mb-tool-call-errstack summary { cursor: pointer; font-size: 10px; color: #fca5a5; }
.mb-tool-call-errstack pre {
  font-size: 10px;
  padding: 4px 6px;
  background: rgba(239,68,68,.08);
  color: #fecaca;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 3px;
}

.mb-ret-grade-wrap {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 2px 8px 2px 4px; border-radius: 999px;
  background: rgba(var(--primary-rgb,99,102,241),.06);
  border: 1px solid rgba(var(--primary-rgb,99,102,241),.18);
}
.mb-ret-ring { width: 20px; height: 20px; transform: rotate(-90deg); }
.mb-ret-ring-bg { fill: none; stroke: rgba(99,102,241,.15); stroke-width: 2; }
.mb-ret-ring-fg {
  fill: none; stroke-width: 2.5; stroke-linecap: round;
  transition: stroke-dashoffset .4s ease;
  &.grade-A { stroke: #22c55e; }
  &.grade-B { stroke: #3b82f6; }
  &.grade-C { stroke: #eab308; }
  &.grade-D { stroke: #ef4444; }
}
.mb-ret-grade-letter {
  font-family: 'SF Mono', monospace; font-size: 11px; font-weight: 800;
  width: 14px; color: #f5f3ff;
}
.mb-ret-sum {
  font-size: 11px; color: #d4d0e8; opacity: .85;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.mb-tool-prog {
  margin-top: 4px; display: flex; align-items: center; gap: 8px;
  position: relative;
  height: 14px;
}
.mb-tool-prog::before {
  content: ''; position: absolute; left: 0; right: 0; top: 3px;
  height: 4px; border-radius: 2px; background: rgba(99,102,241,.12);
}
.mb-tool-prog-bar {
  position: relative;
  top: 0;
  height: 4px;
  border-radius: 2px;
  transition: width .35s ease, background .2s;
  z-index: 1;
  &.is-fast { background: linear-gradient(90deg,#22c55e,#86efac); }
  &.is-mid  { background: linear-gradient(90deg,#eab308,#fde047); }
  &.is-slow { background: linear-gradient(90deg,#ef4444,#fca5a5); }
  &.is-idle { background: rgba(99,102,241,.25); }
}
.mb-tool-prog-label {
  flex-shrink: 0; margin-left: auto;
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
}
.mb-tool-prog:has(.is-fast) .mb-tool-prog-label { color: #22c55e; }
.mb-tool-prog:has(.is-mid)  .mb-tool-prog-label { color: #eab308; }
.mb-tool-prog:has(.is-slow) .mb-tool-prog-label { color: #ef4444; }
.mb-tool-prog:has(.is-idle) .mb-tool-prog-label { color: #818cf8; opacity: .7; }
</style>