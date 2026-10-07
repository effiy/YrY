<script setup lang="ts">
/**
 * YiPet Chat — ChatInput (Vue 3 SFC)
 * Mirrors YiVad aiChat's ChatInput: send/stop buttons, rounded container,
 * keyboard shortcuts, phase-aware placeholder.
 *
 * Refactored: input logic extracted to useChatInput.ts composable;
 * textarea extracted to ChatInputTextarea.vue;
 * action buttons extracted to ChatInputActions.vue.
 */
import { computed, onUnmounted, ref, watch } from 'vue';
import { displayKeys } from '@/shared/shortcuts';
import { useChatStore } from '../stores/chat';
import ChatToolbar from './ChatToolbar/ChatToolbar.vue';
import DraftImageList from './DraftImageList.vue';
import ChatInputTextarea from './ChatInputTextarea.vue';
import ChatInputActions from './ChatInputActions.vue';
import { useChatInput } from './useChatInput';

const store = useChatStore();
const s = store.state;

function _safeCompute<T>(fn: () => T, fallback: T) {
  return computed(() => { try { return fn(); } catch { return fallback; } });
}

// ═══════════════════════════════════════════
// Input logic composable
// ═══════════════════════════════════════════
const {
  inputValue,
  lastTemplateRef,
  mentionQuery,
  mentionVisible,
  slashVisible,
  slashMatches,
  slashActive,
  isDragOver,
  disabled,
  canSend,
  charCount,
  tokenEstimate,
  composerTone,
  placeholder,
  draftImages,
  send,
  onMentionSelect,
  onMentionClose,
  onKeyDown,
  onPaste,
  onImageChange,
  applySlash,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onCompositionStart,
  onCompositionUpdate,
  onCompositionEnd,
  onTextareaFocus,
  onTextareaBlur,
} = useChatInput();

// ═══════════════════════════════════════════
// Streaming status bar (mirrors YiVad aiChat)
// ═══════════════════════════════════════════
const streamStartTime = ref(0);
const elapsedMs = ref(0);
let elapsedTimer: ReturnType<typeof setInterval> | null = null;

watch(
  () => s.isProcessing,
  v => {
    if (v) {
      streamStartTime.value = Date.now();
      elapsedMs.value = 0;
      elapsedTimer = setInterval(() => {
        elapsedMs.value = Date.now() - streamStartTime.value;
      }, 100);
    } else {
      if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null; }
    }
  }
);
onUnmounted(() => { if (elapsedTimer) clearInterval(elapsedTimer); });

const streamingElapsed = _safeCompute(() => {
  if (!s.isProcessing) return '';
  const ms = elapsedMs.value;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}, '');

const streamingChars = _safeCompute(() => {
  if (!s.isProcessing) return '';
  const len = s.messages[s.messages.length - 1]?.content?.length ?? 0;
  if (!len) return '';
  if (len < 1000) return `${len}c`;
  return `${(len / 1000).toFixed(1)}kc`;
}, '');

const streamingSpeed = _safeCompute(() => {
  if (!s.isProcessing) return '';
  const ms = elapsedMs.value;
  if (ms < 500) return '';
  const len = s.messages[s.messages.length - 1]?.content?.length ?? 0;
  if (!len) return '';
  const cps = Math.round(len / (ms / 1000));
  if (cps < 1000) return `${cps} c/s`;
  return `${(cps / 1000).toFixed(1)}k c/s`;
}, '');

const streamingPhaseLabel = _safeCompute(() => {
  if (!s.isProcessing) return '';
  if (s.streamingPhase === 'preparing') return 'Preparing';
  if (s.streamingPhase === 'retrieving') return 'Retrieving';
  if (s.streamingPhase === 'thinking') return 'Thinking';
  if (s.streamingPhase === 'streaming') return 'Generating';
  return 'Processing';
}, '');

const searchPrefetchStatus = computed(() => {
  if (!s.webSearchEnabled) return null;
  const timing = s.searchTimingMs;
  const results = s.webSearchResults?.length ?? 0;
  const images = s.webSearchImages?.length ?? 0;
  const lastQuery = s.lastSearchQuery || '';
  if (s.isProcessing && s.streamingPhase === 'retrieving' && results === 0) {
    return { tone: 'pending', text: 'Searching web...' };
  }
  if (!lastQuery) return null;
  const timingText = timing && timing > 0 ? (timing < 1000 ? `${timing}ms` : `${(timing/1000).toFixed(1)}s`) : '';
  if (results || images) {
    const parts: string[] = [];
    if (results) parts.push(`${results} results`);
    if (images) parts.push(`${images} images`);
    return { tone: 'ok', text: `Prefetch \u00b7 ${parts.join(', ')}${timingText ? ' \u00b7 ' + timingText : ''}` };
  }
  if (timing) return { tone: 'idle', text: `Prefetch \u00b7 ${timingText} \u00b7 no hits` };
  return { tone: 'idle', text: 'Prefetch \u00b7 waiting' };
});

// ═══════════════════════════════════════════
// Action handlers (delegating to store)
// ═══════════════════════════════════════════
function onStop() {
  store.stopSending();
}

function onClearImages() {
  store.clearDraftImages?.();
}

function onPickImage() {
  const el = document.querySelector('.ci-file-input') as HTMLInputElement | null;
  el?.click();
}

function onPreviewImage(src: string) {
  window.open(src, '_blank', 'noopener,noreferrer');
}

// ═══════════════════════════════════════════
// Runtime marker
// ═══════════════════════════════════════════
if (typeof window !== 'undefined') {
  try {
    (window as any).__yipet_ci_ok = true;
  } catch {
    // Best-effort runtime marker for manual debugging.
  }
}
</script>

<template>
  <div
    class="ci-input"
    :class="composerTone"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Drop overlay -->
    <div v-if="isDragOver" class="ci-drop-overlay">
      <span>Drop images here</span>
    </div>
    <ChatToolbar
      :faq-active="s.faqVisible"
      :sending="s.isProcessing"
      :streaming-type="s.streamingType"
      :rag-toggle="s.ragEnabled"
      :web-search-toggle="s.webSearchEnabled"
      :context-files="[]"
      @toggle-faq="store.toggleFaq?.()"
      @pick-image="onPickImage"
      @open-wechat="store.openWeChatSettings?.()"
      @toggle-rag="store.toggleRag?.()"
      @toggle-web-search="s.webSearchEnabled = !s.webSearchEnabled"
      @stop="store.stopSending()"
    />

    <!-- Streaming / prefetch status bar (mirrors YiVad aiChat) -->
    <transition name="ci-status-fade">
      <div
        v-if="s.isProcessing || searchPrefetchStatus"
        class="ci-status"
      >
        <span v-if="s.isProcessing" class="ci-status-dot" />
        <template v-if="s.isProcessing">
          <span class="ci-status-phase">{{ streamingPhaseLabel }}</span>
          <span class="ci-status-time">{{ streamingElapsed }}</span>
          <span v-if="streamingChars" class="ci-status-chars">{{ streamingChars }}</span>
          <span v-if="streamingSpeed" class="ci-status-speed">{{ streamingSpeed }}</span>
        </template>
        <template v-else>
          <span class="ci-status-dot ci-status-dot--muted" />
          <span class="ci-status-phase">Idle</span>
        </template>
        <span v-if="searchPrefetchStatus" class="ci-status-hint" :class="`tone-${searchPrefetchStatus.tone}`">{{ searchPrefetchStatus.text }}</span>
        <button v-if="s.isProcessing" class="ci-status-stop" @click="onStop">Stop</button>
      </div>
    </transition>

    <!-- Hidden image picker (parity with YiVad aiChat) -->
    <input
      type="file"
      accept="image/*"
      multiple
      class="ci-file-input"
      @change="onImageChange"
    />

    <DraftImageList
      v-if="draftImages.length > 0"
      :images="draftImages"
      @remove="(idx: number) => store.removeDraftImage?.(idx)"
      @clear="store.clearDraftImages?.()"
      @preview="onPreviewImage"
    />

    <div class="ci-row">
      <ChatInputTextarea
        v-model="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :mention-query="mentionQuery"
        :mention-visible="mentionVisible"
        :slash-visible="slashVisible"
        :slash-matches="slashMatches"
        :slash-active="slashActive"
        @mention-select="onMentionSelect"
        @mention-close="onMentionClose"
        @apply-slash="applySlash"
        @keydown="onKeyDown"
        @paste="onPaste"
        @compositionstart="onCompositionStart"
        @compositionupdate="onCompositionUpdate"
        @compositionend="onCompositionEnd"
        @focus="onTextareaFocus"
        @blur="onTextareaBlur"
      />
      <ChatInputActions
        :is-processing="s.isProcessing"
        :can-send="canSend"
        :draft-images-length="draftImages.length"
        @send="send"
        @stop="onStop"
        @clear-images="onClearImages"
      />
    </div>

    <!-- Character count -->
    <div class="ci-footer">
      <div class="ci-footer-left">
        <div v-if="charCount > 0" class="ci-char-count">
          <span>{{ charCount }} chars</span>
          <span class="ci-char-count-sep">&middot;</span>
          <span>~{{ tokenEstimate }} tok</span>
        </div>
        <div v-if="store.state._lastTranslation" class="ci-translation-feedback">
          <span class="ci-feedback-label">Rate translation:</span>
          <el-button size="small" text @click="store.submitTranslationFeedback('good')" title="Good translation">👍</el-button>
          <el-button size="small" text @click="store.submitTranslationFeedback('bad')" title="Bad translation">👎</el-button>
        </div>
      </div>
      <div class="ci-footer-right">
        <div class="yipet-shortcut-hints">
          <span class="yipet-shortcut-hint"><kbd>?</kbd> shortcuts</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+B') }}</kbd> sidebar</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+N') }}</kbd> new</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+Shift+S') }}</kbd> web</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+Shift+R') }}</kbd> rag</span>
          <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+K') }}</kbd> clear</span>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
@use "./ChatInput_styles/input.scss";
</style>
