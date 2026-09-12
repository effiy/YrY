<script setup lang="ts">
/**
 * YiPet Chat — MessageBubble (Vue 3 SFC)
 */
import { computed, nextTick, ref, watch } from 'vue';
import {
  CopyDocument, Refresh, Delete, Edit, Upload, Link,
  FolderOpened, Star, StarFilled, Search,
} from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import type { Message } from '../../types';
import { addCodeCopyButtons, formatTime, injectCitations, renderMarkdown, runMermaid } from '../../utils';
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
const rating = s.feedback[msg.timestamp] || null;
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
  if (score == null) return 'var(--text-secondary, #d4d0e8)';
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

const tokenEstimate = computed(() => Math.ceil((msg.content || '').length / 4));
const charCount = computed(() => (msg.content || '').length);
const wordCount = computed(() => {
  const s = (msg.content || '').trim();
  if (!s) return 0;
  return s.split(/\s+/).length;
});
const lineCount = computed(() => {
  const s = msg.content || '';
  if (!s) return 0;
  return s.split('\n').length;
});

// Phase label during streaming (mirrors YiVad aiChat)
const showTyping = computed(() => streaming.value && !hasContent.value && !msg.error);
const phaseLabel = computed<string | null>(() => {
  if (!streaming.value || isUser || !showTyping.value) return null;
  if (s.streamingPhase === 'retrieving') {
    return s.knowledgeGrounded ? 'Searching knowledge base...' : 'Retrieving from index...';
  }
  return 'Thinking...';
});

// Token trend arrow (mirrors YiVad aiChat)
const prevRoleMessage = computed<{ tokens: number; snippet: string; idx: number } | null>(() => {
  const msgs = s.messages ?? [];
  const myIdx = props.index;
  if (myIdx < 1) return null;
  for (let j = myIdx - 1; j >= 0; j--) {
    if (msgs[j].type === msg.type) {
      const text = msgs[j].content || '';
      const snippet = text.length > 80 ? text.slice(0, 79) + '...' : text;
      return { tokens: Math.ceil(text.length / 4), snippet: snippet.replace(/\s+/g, ' '), idx: j };
    }
  }
  return null;
});
const prevRoleTokenEstimate = computed(() => prevRoleMessage.value?.tokens ?? null);
const tokenTrend = computed<{ arrow: string; delta: number; sign: string; cls: string } | null>(() => {
  const prev = prevRoleTokenEstimate.value;
  if (prev == null) return null;
  const delta = tokenEstimate.value - prev;
  if (delta === 0) return { arrow: '\u2192', delta: 0, sign: '\u00b1', cls: 'mb-tokens-trend--flat' };
  if (delta > 0) return { arrow: '\u2191', delta, sign: '+', cls: 'mb-tokens-trend--up' };
  return { arrow: '\u2193', delta: -delta, sign: '-', cls: 'mb-tokens-trend--down' };
});
function scrollToPrevRoleMessage(): void {
  const idx = prevRoleMessage.value?.idx;
  if (idx == null) return;
  const el = document.querySelector<HTMLElement>(`[data-chat-idx="${String(idx)}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('mb-bubble--flash');
  window.setTimeout(() => el.classList.remove('mb-bubble--flash'), 2000);
}

// ── Long error / content collapse (mirrors YiVad aiChat) ──

const ERROR_COLLAPSE_THRESHOLD = 200;
const CONTENT_COLLAPSE_THRESHOLD = 400;
const EXPANDED_ERRORS_KEY = 'yipet.chat.expandedErrors';
const EXPANDED_CONTENTS_KEY = 'yipet.chat.expandedContents';

function loadExpandedSet(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((x: unknown) => typeof x === 'string')) : new Set();
  } catch { return new Set(); }
}
function persistExpandedSet(key: string, set: Set<string>): void {
  try { sessionStorage.setItem(key, JSON.stringify([...set])); } catch { /* ignore */ }
}
function expandKey(idx: number): string {
  return `${msg.timestamp ?? 'no-ts'}:${idx}`;
}
const expandedErrors = ref<Set<string>>(loadExpandedSet(EXPANDED_ERRORS_KEY));
const expandedContents = ref<Set<string>>(loadExpandedSet(EXPANDED_CONTENTS_KEY));
function toggleErrorExpand(idx: number): void {
  const next = new Set(expandedErrors.value);
  const k = expandKey(idx);
  if (next.has(k)) next.delete(k);
  else next.add(k);
  expandedErrors.value = next;
  persistExpandedSet(EXPANDED_ERRORS_KEY, next);
}
function isErrorLong(err: string): boolean { return err.length > ERROR_COLLAPSE_THRESHOLD; }
function isErrorExpanded(idx: number): boolean { return expandedErrors.value.has(expandKey(idx)); }
function toggleContentExpand(idx: number): void {
  const next = new Set(expandedContents.value);
  const k = expandKey(idx);
  if (next.has(k)) next.delete(k);
  else next.add(k);
  expandedContents.value = next;
  persistExpandedSet(EXPANDED_CONTENTS_KEY, next);
}
function isContentLong(s: string): boolean { return s.length > CONTENT_COLLAPSE_THRESHOLD; }
function isContentExpanded(idx: number): boolean { return expandedContents.value.has(expandKey(idx)); }

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
    }"
    :data-chat-idx="String(index)"
  >
    <div class="mb-content">
      <!-- Images -->
      <div v-if="images.length > 0" class="mb-images">
        <img
          v-for="(src, i) in images"
          :key="`img-${i}-${src.slice(0, 12)}`"
          :src="src"
          :alt="`Attachment ${i + 1}`"
          class="mb-image"
        />
      </div>

      <!-- Empty -->
      <div v-if="empty && !streaming" class="mb-empty" />

      <!-- Typing indicator with phase label -->
      <div v-else-if="showTyping" class="mb-typing" role="status" aria-label="Generating">
        <span v-if="phaseLabel" class="mb-typing-phase">{{ phaseLabel }}</span>
        <span class="mb-typing-dots">
          <span /><span /><span />
        </span>
      </div>

      <!-- Markdown content -->
      <div v-else class="mb-markdown-wrap">
        <!-- Streaming: plain text for smooth incremental rendering -->
        <pre
          v-if="streaming"
          class="mb-markdown-streaming"
          v-text="msg.content"
        />
        <!-- Complete: full markdown rendering with citations -->
        <div
          v-else
          ref="markdownRef"
          class="mb-markdown markdown-content"
          v-html="isUser ? markdownHtml : citedHtml"
          @click="onMarkdownClick"
        />
        <span v-if="streaming" class="mb-caret" aria-hidden="true" />
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
      :rating="rating"
      :timestamp="msg.timestamp"
      :formatted-time="formatTime(msg.timestamp)"
      :char-count="charCount"
      :word-count="wordCount"
      :line-count="lineCount"
      :token-estimate="tokenEstimate"
      :prev-role-token-estimate="prevRoleTokenEstimate"
      :token-trend="tokenTrend"
      :prev-role-message="prevRoleMessage"
      @copy="onCopy"
      @edit="editOpen = true"
      @regenerate="store.regenerateMessage?.(index)"
      @delete="onDeleteConfirm"
      @like="store.submitFeedback?.(msg.timestamp, 'like')"
      @dislike="store.submitFeedback?.(msg.timestamp, 'dislike')"
      @save-to-knowledge="store.openSaveToKnowledge?.(msg.timestamp)"
      @open-in-yi-vad="store.openMessageInYiVad?.(msg.timestamp)"
      @resend="store.resendMessage?.(index)"
      @search-web="s.webSearchEnabled = true; store.resendMessage?.(index)"
    />

    <!-- Edit modal -->
    <MessageEditDialog
      v-model="editValue"
      :open="editOpen"
      @close="editOpen = false"
      @save="onEditSave"
    />
  </div>
</template>

<style lang="scss" scoped>
.mb-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  border-radius: 12px;
  border: 1px solid var(--border-secondary, rgba(167, 139, 250, 0.18));
  background: var(--bg-elevated, rgba(30, 26, 59, 0.85));
  color: var(--text-primary, #f5f3ff);
  padding: 10px 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  animation: mb-enter 0.25s ease-out;
}

@keyframes mb-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.mb-bubble--user {
  align-self: flex-end;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.18);
  border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.4);
  border-radius: 12px 12px 4px 12px;
}

.mb-bubble--pet {
  align-self: flex-start;
  border-radius: 12px 12px 12px 4px;
}
.mb-bubble--streaming {
  border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
  box-shadow: 0 0 12px rgba(var(--primary-rgb, 99, 102, 241), 0.08);
}
.mb-bubble--error { border-color: #ff4d4f; }
.mb-bubble--aborted { border-style: dashed; opacity: 0.85; }

.mb-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.mb-images { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.mb-image { max-width: 100%; border-radius: 6px; }
.mb-empty { min-height: 14px; }

.mb-typing {
  display: inline-flex; align-items: center; gap: 8px;
  font-style: italic; color: var(--text-secondary, #d4d0e8);
  min-height: 20px;
}

.mb-typing-phase {
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
  letter-spacing: 0.3px;
  color: var(--primary-light, #818cf8);
  animation: mb-phase-pulse 1.5s ease-in-out infinite;
}

.mb-typing-dots {
  display: inline-flex; gap: 3px; align-items: center;
}
.mb-typing-dots span {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--primary-light, #818cf8);
  animation: mb-dot-bounce 1.4s ease-in-out infinite;
}
.mb-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.mb-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes mb-phase-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes mb-dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
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

.mb-meta {
  display: flex; justify-content: space-between; align-items: center;
  gap: 4px; margin-top: 4px; opacity: 0.75; flex-wrap: wrap;
}

.mb-actions {
  display: flex; align-items: center; gap: 2px; flex-wrap: wrap;

  // Element Plus action button overrides — dark theme
  :deep(.el-button) {
    --el-button-text-color: var(--text-secondary, #d4d0e8);
    --el-button-hover-text-color: var(--text-primary, #f5f3ff);
    --el-button-hover-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    padding: 2px 4px;
    font-size: 11px;
    height: 22px;
    border-radius: 4px;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

.mb-time { font-size: 11px; opacity: 0.7; }

.mb-token-chip {
  font-size: 10px; font-weight: 600; padding: 0 5px; border-radius: 8px;
  line-height: 1.5; font-variant-numeric: tabular-nums; opacity: 0.7;
}
.mb-token-chip--in { color: #0ea5e9; background: rgba(14, 165, 233, 0.1); }
.mb-token-chip--out { color: #16a34a; background: rgba(34, 197, 94, 0.1); }

.mb-tokens-trend {
  margin-left: 2px;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
  cursor: pointer;
  &:hover { opacity: 1; }
}
.mb-tokens-trend--up { color: var(--danger, #ef4444); }
.mb-tokens-trend--down { color: var(--success, #22c55e); }
.mb-tokens-trend--flat { color: var(--text-secondary, #d4d0e8); }

.mb-trend-tip {
  font-size: 11px;
  line-height: 1.5;
  max-width: 260px;
}
.mb-trend-tip-snip {
  margin-top: 4px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mb-trend-tip-note {
  margin-top: 2px;
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
}

/* Flash highlight when navigating to a baseline message */
@keyframes mb-bubble-flash {
  0% { box-shadow: 0 0 0 0 var(--primary, #6366f1); background: rgba(var(--primary-rgb, 99, 102, 241), 0.15); }
  30% { box-shadow: 0 0 0 6px rgba(var(--primary-rgb, 99, 102, 241), 0.5); background: rgba(var(--primary-rgb, 99, 102, 241), 0.15); }
  100% { box-shadow: 0 0 0 0 transparent; background: transparent; }
}
.mb-bubble--flash {
  animation: mb-bubble-flash 2s ease-out;
  border-radius: 8px;
  will-change: box-shadow, background;
}

/* RAG provenance badge (mirrors YiVad aiChat) */
.mb-rag-meta {
  display: flex; flex-wrap: wrap; gap: 3px;
  margin-top: 6px;
}
.mb-rag-meta-mode {
  display: inline-flex; align-items: center;
  height: 16px; padding: 0 6px;
  font-size: 9px; font-weight: 700; line-height: 1;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: var(--primary-light, #818cf8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  border-radius: 8px;
}
.mb-rag-meta-chip {
  display: inline-flex; align-items: center;
  height: 16px; padding: 0 5px;
  font-size: 9px; font-weight: 600; line-height: 1;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}
.mb-rag-meta-chip--on {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}
.mb-rag-meta-chip--filter {
  color: #eab308;
  background: rgba(234, 179, 8, 0.1);
}
.mb-rag-meta-chip--latency {
  color: var(--text-secondary, #d4d0e8);
  background: rgba(255, 255, 255, 0.04);
  font-family: 'SF Mono', 'Menlo', monospace;
  font-variant-numeric: tabular-nums;
}
.mb-rag-meta-grade {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  font-size: 11px; font-weight: 800;
  font-family: 'SF Mono', 'Menlo', monospace;
  border-radius: 50%;
  color: var(--bg-primary, #13122a);
}
.mb-rag-meta-grade--A { background: #22c55e; }
.mb-rag-meta-grade--B { background: var(--primary, #6366f1); }
.mb-rag-meta-grade--C { background: #eab308; color: var(--text-primary, #f5f3ff); }
.mb-rag-meta-grade--D { background: #ef4444; }
.mb-rag-meta-scope {
  font-size: 9px; padding: 1px 5px;
  color: var(--text-secondary, #d4d0e8);
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
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-radius: 8px; background: rgba(0, 0, 0, 0.18);
  font-size: 11px; color: var(--text-secondary, #d4d0e8);
}
.mb-sources__title {
  display: flex; align-items: center; gap: 6px; font-weight: 600;
  margin-bottom: 6px; color: var(--primary-light, #818cf8);
  font-size: 11px;
}
.mb-sources__count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 16px; padding: 0 5px;
  font-size: 10px; font-weight: 700; line-height: 1;
  color: var(--primary-light, #818cf8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  border-radius: 8px;
}
.mb-sources__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.mb-sources__item {
  border-radius: 4px;
  transition: background 0.15s;
  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.06); }
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
  color: var(--primary-light, #818cf8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
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
  color: var(--text-primary, #f5f3ff);
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
  color: var(--text-secondary, #d4d0e8);
  margin-bottom: 4px;
}

/* Flash highlight when citation chip navigates to a source */
@keyframes mb-source-flash {
  0% { background: rgba(var(--primary-rgb, 99, 102, 241), 0.25); }
  100% { background: transparent; }
}
.mb-sources__item--flash {
  animation: mb-source-flash 2s ease-out;
  border-radius: 4px;
}

/* Markdown + caret */
.mb-markdown-wrap { position: relative; }

.mb-markdown {
  animation: mb-fade-in 0.2s ease-out;
}

/* Plain-text streaming content — no markdown parsing, instant rendering */
.mb-markdown-streaming {
  margin: 0;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  color: inherit;
  background: transparent;
  border: none;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: visible;
}

@keyframes mb-fade-in {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.mb-caret {
  display: inline-block; width: 2px; height: 1.1em; margin-left: 1px;
  background: var(--primary-light, #818cf8);
  vertical-align: text-bottom;
  border-radius: 1px;
  animation: mb-caret-blink 1s steps(2, start) infinite;
}

@keyframes mb-caret-blink { to { visibility: hidden; } }

/* ── Markdown Content Typography ───────── */

.mb-markdown {
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 1.2em 0 0.5em;
    line-height: 1.3;
    font-weight: 600;
    &:first-child { margin-top: 0; }
  }
  :deep(h1) { font-size: 1.4em; border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25); padding-bottom: 0.3em; }
  :deep(h2) { font-size: 1.25em; }
  :deep(h3) { font-size: 1.1em; }
  :deep(h4) { font-size: 1em; color: var(--text-secondary, #d4d0e8); }

  :deep(p) { margin: 0.6em 0; line-height: 1.65; }
  :deep(p:first-child) { margin-top: 0; }
  :deep(p:last-child) { margin-bottom: 0; }

  :deep(a) {
    color: var(--primary-light, #818cf8);
    text-decoration: none;
    border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
    transition: border-color 0.15s;
    &:hover { border-color: var(--primary-light, #818cf8); }
  }

  :deep(.cite-chip) {
    display: inline-flex;
    align-items: center;
    margin: 0 1px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.4;
    color: var(--primary-light, #818cf8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    vertical-align: super;
    transition: background 0.12s, transform 0.12s;
    &:hover {
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.25);
      color: #fff;
      transform: translateY(-1px);
    }
  }

  :deep(strong) { font-weight: 600; color: var(--text-primary, #f5f3ff); }
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
    border-left: 3px solid var(--primary-light, #818cf8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.06);
    border-radius: 0 4px 4px 0;
    color: var(--text-secondary, #d4d0e8);
    p { margin: 0.3em 0; }
  }

  :deep(code) {
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    font-size: 0.88em;
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
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
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 8px;

    code {
      background: none;
      padding: 0;
      font-size: inherit;
      color: inherit;
      border-radius: 0;
    }
  }

  :deep(table) {
    width: 100%;
    margin: 0.8em 0;
    border-collapse: collapse;
    font-size: 0.92em;
    overflow-x: auto;
    display: block;
  }

  :deep(th), :deep(td) {
    padding: 8px 12px;
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    text-align: left;
  }

  :deep(th) {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    font-weight: 600;
    color: var(--text-primary, #f5f3ff);
  }

  :deep(tr:nth-child(even) td) {
    background: rgba(255, 255, 255, 0.02);
  }

  :deep(hr) {
    margin: 1em 0;
    border: none;
    border-top: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 0.4em 0;
  }

  :deep(input[type="checkbox"]) {
    margin-right: 6px;
    accent-color: var(--primary, #6366f1);
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
  color: var(--text-secondary, #d4d0e8);
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.3);
    color: var(--text-primary, #f5f3ff);
  }
}

:deep(pre:hover .mb-code-copy) {
  opacity: 1;
}

/* Edit dialog */
.mb-edit-dialog {
  position: fixed; inset: 0; z-index: 2147483647;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center; justify-content: center; border: none;
}

.mb-edit-dialog-content {
  background: var(--bg-elevated, #1e1a3b); border-radius: 12px;
  padding: 20px; min-width: 360px; max-width: 90vw;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  color: var(--text-primary, #f5f3ff);

  h3 { margin: 0 0 12px; font-size: 15px; }
}

.mb-edit-textarea {
  width: 100%; resize: vertical; padding: 8px; border-radius: 6px;
  background: var(--input-bg, #181730); color: var(--text-primary, #f5f3ff);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  font-size: 13px; font-family: inherit;
}

.mb-edit-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }

.mb-edit-btn {
  padding: 6px 16px; border-radius: 6px; border: none; font-size: 13px; cursor: pointer;
  &--cancel { background: rgba(255, 255, 255, 0.1); color: var(--text-secondary, #d4d0e8); }
  &--save { background: var(--primary, #6366f1); color: #fff; }
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
</style>