<script setup lang="ts">
/**
 * YiPet Chat — MessageBubble (Vue 3 SFC)
 *
 * Orchestrating component that composes sub-components for content rendering,
 * tool call display, RAG metadata, and message actions.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import type { Message } from '../../types';
import { addCodeCopyButtons, formatTime, injectCitations, renderMarkdown, runMermaid } from '../../utils';
import { formatRelativeTime } from '@/utils/datetime';
import WebSearchResults from '../WebSearchResults.vue';
import MessageContent from './MessageContent.vue';
import RagSourcesPanel from './RagSourcesPanel.vue';
import MessageMetaRow from './MessageMetaRow.vue';
import MessageEditDialog from './MessageEditDialog.vue';
import RagMetaBadge from './RagMetaBadge.vue';
import ToolCallDisplay from './ToolCallDisplay.vue';

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

// ── Message grouping: same-role consecutive messages (YiVad parity) ──
const allMsgs = computed(() => s.messages);
const sameAsPrev = computed(() => {
  if (props.index === 0) return false;
  return allMsgs.value[props.index - 1]?.type === msg.type;
});
const sameAsNext = computed(() => {
  if (props.index >= allMsgs.value.length - 1) return false;
  return allMsgs.value[props.index + 1]?.type === msg.type;
});
const images = msg.imageDataUrls ?? (msg.imageDataUrl ? [msg.imageDataUrl] : []);
const empty = computed(() => !hasContent.value && images.length === 0);
const streaming = computed(() => !!msg.streaming);
const copyState = s.copyFeedback[String(msg.timestamp)] || '';
const showRetryLabel = !!(msg.error || msg.aborted);
const searchGrounded = computed(() => !!msg.searchGrounded);
const isLastPet = computed(() => !isUser && props.index === props.totalMessages - 1);
const isRagStreaming = computed(() => false);
const visibleRagSources = computed(() => msg.sources ?? (isLastPet.value ? s.ragSources : []));
const visibleSearchResults = computed(() => {
  if (msg.searchResults?.length) return msg.searchResults;
  if (isLastPet.value && s.webSearchResults.length) return s.webSearchResults;
  return [];
});
const visibleSearchImages = computed(() => {
  if (msg.searchImages?.length) return msg.searchImages;
  if (isLastPet.value && s.webSearchImages.length) return s.webSearchImages;
  return [];
});
const visibleSearchQuery = computed(() => msg.searchQuery || (isLastPet.value ? s.lastSearchQuery : ''));
const visibleSearchTimingMs = computed(() => msg.searchTimingMs ?? (isLastPet.value ? s.searchTimingMs : 0));
const liveSourceCount = computed(() => {
  if (!isRagStreaming.value) return 0;
  return s.ragSources.length;
});

// ── RAG provenance badge (mirrors YiVad aiChat) ──
function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
const retrievalGrade = computed<{ letter: string; top: number } | null>(() => {
  const sources = visibleRagSources.value;
  if (!sources.length) return null;
  const scores = sources.map((s) => s.score ?? 0).filter(Boolean);
  if (!scores.length) return null;
  const top = Math.max(...scores);
  const letter = top >= 0.85 ? 'A' : top >= 0.70 ? 'B' : top >= 0.50 ? 'C' : 'D';
  return { letter, top };
});

function scoreBarWidth(score?: number): string {
  if (score == null) return '0%';
  return `${Math.min(100, Math.round(score * 100))}%`;
}

function scoreColor(score?: number): string {
  if (score == null) return '#d4d0e8';
  if (score >= 0.85) return '#22c55e';
  if (score >= 0.70) return '#6366f1';
  if (score >= 0.50) return '#eab308';
  return '#ef4444';
}

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

const sourceIsContextFile = (path: string): boolean => {
  const ses = s.sessions.find((x) => x.id === s.currentSessionId);
  if (!ses?.tags) return false;
  return ses.tags.some((t) => typeof t === 'string' && t.startsWith('ctx:') && t.slice(4) === path);
};
const hasRagMeta = computed(() => !isUser && (!!msg.ragMeta || retrievalGrade.value || msg.firstTokenLatencyMs != null));

// ── Markdown + citation HTML ──
const markdownHtml = computed(() => renderMarkdown(msg.content || ''));
const sourceCount = computed(() => {
  if (isUser) return 0;
  return visibleRagSources.value.length;
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

// ── Content ref for post-processing ──
const contentRef = ref<InstanceType<typeof MessageContent> | null>(null);
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
    const el = contentRef.value?.markdownRef;
    if (!el) return;
    addCodeCopyButtons(el);
    void runMermaid(el);
  },
);

function onEditSave() {
  store.editMessage?.(props.index, editValue.value);
  editOpen.value = false;
}

async function onDeleteConfirm() {
  try {
    await ElMessageBox.confirm('Delete this message?', 'Confirm delete', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });
  } catch {
    return;
  }
  store.deleteMessage?.(props.index);
}

function onCopy() {
  store.copyMessage?.(msg.content || '', msg.timestamp);
}

function onRegenerate() {
  if (showRetryLabel) store.retryLastMessage?.();
  else store.regenerateMessage?.(props.index);
}

function onResend() {
  store.resendMessage?.(props.index);
}

function onSearchWeb() {
  s.webSearchEnabled = true;
  store.resendMessage?.(props.index);
}

function onDeepenSearch() {
  s.webSearchEnabled = true;
  store.regenerateMessage?.(props.index);
}

// ── Text selection toolbar ──
const selToolbar = ref<{ x: number; y: number; text: string } | null>(null);
function onMarkdownMouseUp(_e: MouseEvent) {
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
  if (prev === 0 || delta === 0) return { arrow: '\u2192', delta: 0, sign: '\u00B1', cls: 'mb-tokens-trend--flat' };
  if (delta > 0) return { arrow: '\u2191', delta, sign: '+', cls: 'mb-tokens-trend--up' };
  return { arrow: '\u2193', delta: -delta, sign: '-', cls: 'mb-tokens-trend--down' };
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
  return `${chars} chars \u00B7 ${words} words \u00B7 ${lines} lines \u00B7 ~${toks} tokens`;
});

const WORDS_PER_MIN = 200;
const readingTimeSecs = computed(() => {
  const words = props.message.content?.trim() ? props.message.content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil((words / WORDS_PER_MIN) * 60));
});
const showReadingTime = computed(() => {
  return props.message.type === 'pet' && !props.message.streaming && readingTimeSecs.value >= 10;
});
const prevRoleSnippet = computed(() => {
  const pm = prevRoleMessage.value;
  if (!pm) return '';
  const t = (pm.content || '').trim().replace(/\s+/g, ' ');
  if (!t) return '';
  return t.length <= 80 ? t : t.slice(0, 77) + '\u2026';
});
const tokenTrendTooltip = computed(() => {
  const trend = tokenTrend.value;
  const pm = prevRoleMessage.value;
  const roleLabel = props.message.type === 'pet' ? 'assistant' : 'user';
  const lines = [charWordLineStats.value];
  if (pm) {
    const prevTok = prevRoleTokenEstimate.value;
    lines.push(
      `vs previous ${roleLabel} message: ${trend.sign}${trend.delta} tok (was ~${prevTok} tok)`,
    );
    if (prevRoleSnippet.value) lines.push(`Previous: "${prevRoleSnippet.value}"`);
    lines.push('Click to jump to previous same-role message');
  }
  return lines.join('\n');
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

const relativeTime = computed(() => {
  try {
    return formatRelativeTime(new Date(msg.timestamp).toISOString(), 'en');
  } catch { return ''; }
});

// ── Typing/thinking phase indicator ──
const showTyping = computed(() => streaming.value && !hasContent.value && !msg.error);

const thinkingElapsed = ref(0);
let _thinkingTimer: ReturnType<typeof setInterval> | null = null;
let _dotTimer: ReturnType<typeof setInterval> | null = null;

function _tickThinking() {
  if (!s.thinkingStartTs) { thinkingElapsed.value = 0; return; }
  thinkingElapsed.value = Date.now() - s.thinkingStartTs;
}

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

const thinkingWarnLevel = computed<'' | 'slow' | 'long'>(() => {
  if (!showTyping.value || !streaming.value) return '';
  const sec = thinkingElapsed.value / 1000;
  if (sec >= 30) return 'long';
  if (sec >= 10) return 'slow';
  return '';
});

const thinkingWarnLabel = computed(() => {
  if (thinkingWarnLevel.value === 'long') return 'Taking longer than usual\u2026';
  if (thinkingWarnLevel.value === 'slow') return 'Still thinking\u2026';
  return '';
});

const thinkingLabel = computed(() => {
  if (!streaming.value || isUser || !showTyping.value) return '';
  const dots = '.'.repeat(thinkingDots.value);
  if (s.streamingPhase === 'preparing') return `Preparing${dots}`;
  if (s.streamingPhase === 'retrieving') return `Retrieving${dots}`;
  return `Thinking${dots}`;
});

// ── Error/content collapse ──
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
  return !!(props.message.error && err.length > ERROR_COLLAPSE_THRESHOLD && errorCollapsed.value);
});
const errorDisplay = computed(() => {
  const err = props.message.content || '';
  if (!props.message.error) return err;
  return shouldCollapseError.value ? err.slice(0, ERROR_COLLAPSE_THRESHOLD) + '\u2026' : err;
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
  return shouldCollapseContent.value ? c.slice(0, CONTENT_COLLAPSE_THRESHOLD) + '\u2026' : c;
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
      'mb-bubble--grouped': sameAsPrev || sameAsNext,
      'mb-bubble--group-start': !sameAsPrev && sameAsNext,
      'mb-bubble--group-mid': sameAsPrev && sameAsNext,
      'mb-bubble--group-end': sameAsPrev && !sameAsNext,
    }"
    :data-chat-idx="String(index)"
    :data-msg-ts="String(msg.timestamp)"
  >
    <div class="mb-content">
      <MessageContent
        ref="contentRef"
        :content="msg.content || ''"
        :is-user="isUser"
        :streaming="streaming"
        :error="!!msg.error"
        :aborted="!!(msg.aborted && !msg.error)"
        :images="images"
        :is-empty="empty"
        :show-typing="showTyping"
        :thinking-label="thinkingLabel"
        :thinking-elapsed="thinkingElapsed"
        :thinking-warn-level="thinkingWarnLevel"
        :thinking-warn-label="thinkingWarnLabel"
        :tokens-per-sec="tokensPerSec"
        :cited-html="citedHtml"
        :error-display="errorDisplay"
        :content-display="contentDisplay"
        :should-collapse-error="shouldCollapseError"
        :should-collapse-content="shouldCollapseContent"
        :error-collapsed="errorCollapsed"
        :content-collapsed="contentCollapsed"
        :error-collapse-threshold="ERROR_COLLAPSE_THRESHOLD"
        :content-collapse-threshold="CONTENT_COLLAPSE_THRESHOLD"
        @toggle-error-collapsed="toggleErrorCollapsed"
        @toggle-content-collapsed="toggleContentCollapsed"
        @stop-sending="store.stopSending()"
        @markdown-mouse-up="onMarkdownMouseUp"
        @markdown-click="onMarkdownClick"
        @open-lightbox="openLightbox"
      />

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

      <!-- Token estimate and trend (YiVad parity) -->
      <div v-if="props.message.type === 'pet' && !props.message.streaming" class="mb-tokens">
        <span class="mb-tokens-count" :title="charWordLineStats">
          ~{{ tokenEstimate }} tok
        </span>
        <span
          v-if="prevRoleMessage"
          class="mb-tokens-trend"
          :class="tokenTrend.cls"
          :title="tokenTrendTooltip"
          @click="scrollToPrevRoleMessage"
        >
          {{ tokenTrend.arrow }} {{ tokenTrend.sign }}{{ tokenTrend.delta }}
        </span>
        <span v-if="showReadingTime" class="mb-read-time" title="Estimated reading time at 200 wpm">
          ~{{ readingTimeSecs }}s read
        </span>
      </div>

      <!-- RAG sources (per-message or last-pet fallback, mirrors YiVad RagSources) -->
      <RagSourcesPanel
        v-if="!isUser && (visibleRagSources.length || (isRagStreaming && liveSourceCount > 0))"
        :sources="visibleRagSources.length ? visibleRagSources : s.ragSources"
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
      <ToolCallDisplay
        v-if="props.message.type === 'pet' && props.message.toolCalls?.length"
        :tool-calls="props.message.toolCalls"
      />

      <div
        v-if="!isUser && (visibleSearchResults.length || visibleSearchImages.length || msg.searchGrounded)"
        class="mb-web-indicator"
      >
        <el-icon :size="12"><Search /></el-icon>
        <span>
          Web-grounded
          <template v-if="visibleSearchResults.length"> &middot; {{ visibleSearchResults.length }} sources</template>
          <template v-if="visibleSearchImages.length"> &middot; {{ visibleSearchImages.length }} images</template>
        </span>
      </div>
      <WebSearchResults
        v-if="!isUser && (visibleSearchResults.length || visibleSearchImages.length || msg.searchGrounded)"
        :results="visibleSearchResults"
        :images="visibleSearchImages"
        :query="visibleSearchQuery"
        :timing-ms="visibleSearchTimingMs"
      />
    </div>

    <!-- Meta row (hidden until hover — YiVad parity) -->
    <div class="mb-meta">
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
      :has-web-search="!!(visibleSearchResults.length || visibleSearchImages.length || msg.searchGrounded)"
      :search-grounded="searchGrounded"
      :web-search-enabled="s.webSearchEnabled"
      @copy="onCopy"
      @edit="editOpen = true"
      @regenerate="onRegenerate"
      @delete="onDeleteConfirm"
      @resend="onResend"
      @search-web="onSearchWeb"
      @deepen-search="onDeepenSearch"
    />
    </div>

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
@use "./styles/bubble.scss";
</style>
