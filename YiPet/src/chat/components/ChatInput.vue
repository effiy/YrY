<script setup lang="ts">
/**
 * YiPet Chat — ChatInput (Vue 3 SFC)
 * Mirrors YiVad aiChat's ChatInput: send/stop buttons, rounded container,
 * keyboard shortcuts, phase-aware placeholder.
 */
import { computed, onMounted, onBeforeUnmount, onUnmounted, ref, watch, nextTick } from 'vue';
import { CircleClose, Promotion } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { t } from '@/shared/i18n';
import { useChatStore } from '../stores/chat';
import { keyboardRegistry, displayKeys } from '@/shared/shortcuts';
import ChatToolbar from './ChatToolbar/ChatToolbar.vue';
import DraftImageList from './DraftImageList.vue';
import QuickButtons from './QuickButtons.vue';
import FileMentionDropdown from './FileMentionDropdown.vue';

const MAX_DRAFT_IMAGES = 4;

const store = useChatStore();
const s = store.state;

const disabled = computed(() => s.isProcessing);
const draftImages = computed(() => s.draftImages || []);

// ── Streaming status bar (mirrors YiVad aiChat) ──
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

const streamingElapsed = computed(() => {
  if (!s.isProcessing) return '';
  const ms = elapsedMs.value;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
});

const streamingChars = computed(() => {
  if (!s.isProcessing) return '';
  const len = s.messages.at(-1)?.content?.length ?? 0;
  if (!len) return '';
  if (len < 1000) return `${len}c`;
  return `${(len / 1000).toFixed(1)}kc`;
});

const streamingPhaseLabel = computed(() => {
  if (!s.isProcessing) return '';
  if (s.streamingPhase === 'preparing') return 'Preparing';
  if (s.streamingPhase === 'retrieving') return 'Retrieving';
  if (s.streamingPhase === 'thinking') return 'Thinking';
  if (s.streamingPhase === 'streaming') return 'Generating';
  return 'Processing';
});

// ── Phase-aware placeholder (mirrors YiVad aiChat) ──
const placeholder = computed(() => {
  if (inputValue.value.startsWith('/')) return '/compact /clear /retry /stop /new /export — type a command';
  if (s.streamingPhase === 'fetching') return 'Fetching context...';
  if (s.streamingPhase === 'preparing') return 'Preparing...';
  if (s.streamingPhase === 'retrieving') return s.knowledgeGrounded ? 'RAG · Searching knowledge base...' : 'Retrieving knowledge...';
  if (s.streamingPhase === 'thinking') return s.knowledgeGrounded && s.ragScope ? 'RAG · Thinking...' : 'AI is thinking...';
  if (s.streamingPhase === 'streaming') return s.knowledgeGrounded && s.ragScope ? 'RAG · Generating response...' : 'AI is responding...';
  if (s.webSearchEnabled && s.isProcessing) return 'Searching the web...';
  if (s.knowledgeGrounded && s.ragScope) {
    const ctxCount = (s.sessions.find(x => x.id === s.currentSessionId)?.tags ?? [])
      .filter((t: string) => t.startsWith('ctx:')).length;
    return `RAG mode · ${ctxCount} file(s) in context — Ask anything...`;
  }
  return 'Ask anything... (Enter to send, Shift+Enter for newline)';
});

const inputValue = ref('');
const isComposing = ref(false);
const compositionEndTime = ref(0);
const lastTemplateRef = ref('');
const historyIdxRef = ref(-1);
const preHistoryInputRef = ref('');

// ── Can send: user has text, images, and is not currently sending ──
const canSend = computed(() => {
  if (s.isProcessing) return false;
  return inputValue.value.trim().length > 0 || draftImages.value.length > 0;
});

const charCount = computed(() => inputValue.value.length);
const tokenEstimate = computed(() => Math.ceil(charCount.value / 4));

// @-mention detection
const mentionQuery = ref('');
const mentionVisible = ref(false);
const mentionAtIdx = ref(-1);

function updateMention() {
  const text = inputValue.value;
  const lastAt = text.lastIndexOf('@');
  if (lastAt < 0) {
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
    return;
  }
  if (lastAt > 0 && !/\s/.test(text[lastAt - 1])) {
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
    return;
  }
  const after = text.slice(lastAt + 1);
  if (after.includes(' ')) {
    mentionVisible.value = false;
    mentionQuery.value = '';
    mentionAtIdx.value = -1;
    return;
  }
  mentionVisible.value = true;
  mentionQuery.value = after;
  mentionAtIdx.value = lastAt;
}

watch(inputValue, updateMention);

// Sync template from QuickButtons
watch(() => s.inputTemplate, (val) => {
  if (val && val !== lastTemplateRef.value) {
    lastTemplateRef.value = val;
    inputValue.value = val;
  }
});

function slashKeyHandler(e: KeyboardEvent) {
  if (e.key !== '/') return;
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true) return;
  e.preventDefault();
  const textarea = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
  textarea?.focus();
}

onMounted(() => {
  window.addEventListener('keydown', slashKeyHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', slashKeyHandler);
});

function send() {
  const text = inputValue.value.trim();
  const imgs = draftImages.value.length > 0 ? draftImages.value : undefined;
  if (!text && !imgs) return;
  if (s.isProcessing) return;
  store.pushPromptHistory?.(inputValue.value);
  historyIdxRef.value = -1;
  store.sendMessage(text, imgs);
  inputValue.value = '';
  lastTemplateRef.value = '';
  historyIdxRef.value = -1;
  // Auto-focus after send
  nextTick(() => {
    const ta = document.querySelector('#yipet-chat-window .el-textarea__inner') as HTMLTextAreaElement | null;
    ta?.focus();
  });
}

function onMentionSelect(path: string) {
  if (mentionAtIdx.value < 0) return;
  const before = inputValue.value.slice(0, mentionAtIdx.value);
  const after = inputValue.value.slice(mentionAtIdx.value + 1 + mentionQuery.value.length);
  inputValue.value = (before + after).trim();
  store.setRagScopeFromNode(path, true);
  if (!s.knowledgeGrounded) store.toggleKnowledgeGrounded();
}

function onMentionClose() {
  if (mentionAtIdx.value >= 0) {
    const before = inputValue.value.slice(0, mentionAtIdx.value);
    const after = inputValue.value.slice(mentionAtIdx.value + 1 + mentionQuery.value.length);
    inputValue.value = (before + after).trim();
  }
}

function onKeyDown(e: KeyboardEvent) {
  // Mention dropdown handling
  if (mentionVisible.value) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onMentionClose();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      const matches = store.knowledgeFileMatches?.(mentionQuery.value, 1);
      if (matches && matches.length > 0) {
        e.preventDefault();
        onMentionSelect(matches[0].path);
        return;
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      return;
    }
  }

  // ── Keyboard shortcuts (mirrors YiVad aiChat) ──
  const mod = e.metaKey || e.ctrlKey;

  // Ctrl+K / Cmd+K: clear conversation
  if (mod && e.key === 'k' && !s.isProcessing) {
    e.preventDefault();
    store.sendMessage('/clear');
    inputValue.value = '';
    return;
  }

  // Ctrl+Shift+S / Cmd+Shift+S: toggle web search
  if (mod && e.shiftKey && e.key === 'S' && !s.isProcessing) {
    e.preventDefault();
    s.webSearchEnabled = !s.webSearchEnabled;
    ElMessage({
      message: s.webSearchEnabled ? 'Web search on' : 'Web search off',
      type: s.webSearchEnabled ? 'success' : 'info',
      duration: 1500,
      showClose: false,
    });
    return;
  }

  // Ctrl+L / Cmd+L: clear input
  if (mod && e.key === 'l' && !s.isProcessing) {
    e.preventDefault();
    inputValue.value = '';
    lastTemplateRef.value = '';
    store.clearDraftImages?.();
    return;
  }

  // Escape
  if (e.key === 'Escape') {
    e.preventDefault();
    if (s.isProcessing) { store.stopSending(); return; }
    if (inputValue.value.trim()) {
      inputValue.value = '';
      historyIdxRef.value = -1;
      return;
    }
    return;
  }

  // Enter: send
  if (e.key === 'Enter') {
    if ((e as KeyboardEvent).isComposing || isComposing.value) return;
    if (compositionEndTime.value > 0 && Date.now() - compositionEndTime.value < 100) return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (s.isProcessing) return;
    store.pushPromptHistory?.(inputValue.value);
    historyIdxRef.value = -1;
    send();
    return;
  }

  // Prompt history navigation
  if (!e.metaKey && !e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    if (e.key === 'ArrowUp' && (!inputValue.value || inputValue.value.length === 0)) {
      if (historyIdxRef.value === -1) preHistoryInputRef.value = inputValue.value;
      const rec = store.recallPromptHistory?.(-1, historyIdxRef.value);
      if (rec) {
        e.preventDefault();
        historyIdxRef.value = rec.idx;
        inputValue.value = rec.text;
      }
      return;
    }
    if (e.key === 'ArrowDown' && historyIdxRef.value !== -1) {
      const rec = store.recallPromptHistory?.(1, historyIdxRef.value);
      e.preventDefault();
      if (rec && rec.idx === -1) {
        historyIdxRef.value = -1;
        inputValue.value = preHistoryInputRef.value;
      } else if (rec) {
        historyIdxRef.value = rec.idx;
        inputValue.value = rec.text;
      }
      return;
    }
  }
}

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  const imageItems: DataTransferItem[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) imageItems.push(items[i]);
  }
  if (imageItems.length === 0) return;
  e.preventDefault();
  const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
  const toRead = imageItems.slice(0, remaining);
  let loaded = 0;
  const sources: string[] = new Array(toRead.length);
  toRead.forEach((item, i) => {
    const file = item.getAsFile();
    if (!file) {
      loaded++;
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (src) sources[i] = src;
      loaded++;
      if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean));
    };
    reader.onerror = () => {
      loaded++;
      if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean));
    };
    reader.readAsDataURL(file);
  });
}

// ── Drag-and-drop images ──
const isDragOver = ref(false);
let dragCounter = 0;

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragCounter++;
  if (e.dataTransfer?.types.includes('Files')) isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) { dragCounter = 0; isDragOver.value = false; }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragCounter = 0;
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (!files?.length) return;
  const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (!imageFiles.length) return;
  const remaining = MAX_DRAFT_IMAGES - draftImages.value.length;
  const toRead = imageFiles.slice(0, remaining);
  let loaded = 0;
  const sources: string[] = new Array(toRead.length);
  toRead.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (ev) => { sources[i] = ev.target?.result as string; loaded++; if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean)); };
    reader.onerror = () => { loaded++; if (loaded === toRead.length) store.addDraftImages?.(sources.filter(Boolean)); };
    reader.readAsDataURL(file);
  });
}
</script>

<template>
  <div
    class="ci-input"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Drop overlay -->
    <div v-if="isDragOver" class="ci-drop-overlay">
      <span>Drop images here</span>
    </div>
    <ChatToolbar :has-content="!!inputValue.trim() || draftImages.length > 0" @clear-input="inputValue = ''; lastTemplateRef = ''; store.clearDraftImages?.()" />

    <!-- Streaming status bar (mirrors YiVad aiChat) -->
    <transition name="ci-status-fade">
      <div v-if="s.isProcessing" class="ci-status">
        <span class="ci-status-dot" />
        <span class="ci-status-phase">{{ streamingPhaseLabel }}</span>
        <span class="ci-status-time">{{ streamingElapsed }}</span>
        <span v-if="streamingChars" class="ci-status-chars">{{ streamingChars }}</span>
        <button class="ci-status-stop" @click="store.stopSending()">Stop</button>
      </div>
    </transition>

    <DraftImageList
      v-if="draftImages.length > 0"
      :images="draftImages"
      @remove="(idx: number) => store.removeDraftImage?.(idx)"
      @clear="store.clearDraftImages?.()"
    />

    <QuickButtons />

    <div class="ci-row">
      <div class="ci-textarea-wrap">
        <FileMentionDropdown
          :query="mentionQuery"
          :visible="mentionVisible"
          @close="onMentionClose"
          @select="onMentionSelect"
        />
        <el-input
          v-model="inputValue"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :placeholder="placeholder"
          :disabled="disabled"
          resize="none"
          :aria-label="t('chatInputAriaLabel')"
          class="ci-textarea"
          @keydown="e => onKeyDown(e as KeyboardEvent)"
          @paste="onPaste"
          @focus="keyboardRegistry.setInputFocused(true)"
          @blur="keyboardRegistry.setInputFocused(false)"
          @compositionstart="isComposing = true; compositionEndTime = 0"
          @compositionupdate="isComposing = true; compositionEndTime = 0"
          @compositionend="isComposing = false; compositionEndTime = Date.now()"
        />
      </div>

      <!-- Stop button (when streaming) -->
      <el-tooltip v-if="s.isProcessing" content="Stop generating" placement="top">
        <el-button circle size="default" type="danger" class="ci-send-btn" @click="store.stopSending()">
          <span class="ci-stop-icon" />
        </el-button>
      </el-tooltip>

      <!-- Send button -->
      <el-tooltip v-else-if="canSend" content="Send message (Enter)" placement="top">
        <el-button circle size="default" type="primary" class="ci-send-btn" :icon="Promotion" @click="send" />
      </el-tooltip>

      <!-- Clear (when only images, no text) -->
      <el-tooltip v-else-if="draftImages.length > 0" content="Clear images" placement="top">
        <el-button circle size="default" class="ci-send-btn" :icon="CircleClose" @click="store.clearDraftImages?.()" />
      </el-tooltip>
    </div>

    <!-- Character count -->
    <div v-if="charCount > 0" class="ci-char-count">
      <span>{{ charCount }} chars</span>
      <span class="ci-char-count-sep">·</span>
      <span>~{{ tokenEstimate }} tok</span>
    </div>

    <!-- Keyboard shortcut hints -->
    <div class="yipet-shortcut-hints">
      <span class="yipet-shortcut-hint"><kbd>?</kbd> shortcuts</span>
      <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+B') }}</kbd> sidebar</span>
      <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+N') }}</kbd> new</span>
      <span class="yipet-shortcut-hint"><kbd>{{ displayKeys('Ctrl+K') }}</kbd> clear</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ci-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px 12px;
  background: #141228;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
  position: relative;

  @supports (backdrop-filter: blur(1px)) {
    background: color-mix(in srgb, #141228 88%, transparent);
    border-top-color: transparent;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
}

// ── Streaming status bar ──
.ci-status {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 16px 2px;
  font-size: 12px;
  color: #d4d0e8;
}
.ci-status-dot {
  width: 7px;
  height: 7px;
  background: #818cf8;
  border-radius: 50%;
  animation: ci-status-pulse 1.2s ease-in-out infinite;
}
@keyframes ci-status-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
.ci-status-phase {
  font-weight: 600;
  color: #f5f3ff;
}
.ci-status-time {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.7;
}
.ci-status-chars {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.7;
}
.ci-status-stop {
  margin-left: auto;
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
.ci-status-fade-enter-active,
.ci-status-fade-leave-active {
  transition: all 0.2s;
}
.ci-status-fade-enter-from,
.ci-status-fade-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.ci-status-fade-enter-to,
.ci-status-fade-leave-from {
  opacity: 1;
  max-height: 30px;
}

// ── Drop overlay ──
.ci-drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 2px dashed rgba(99, 102, 241, 0.5);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #818cf8;
  pointer-events: none;
  animation: ci-drop-in 0.15s ease-out;
}

@keyframes ci-drop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ci-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 6px 14px;
  margin: 0 4px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  &:focus-within {
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.12);
    transform: translateY(-1px);
  }
}

.ci-row .ci-textarea-wrap { position: relative; flex: 1; min-width: 0; }

.ci-row :deep(.el-textarea__inner) {
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: transparent;
  border: none;
  box-shadow: none;
  color: #f5f3ff;
  &::placeholder { color: #d4d0e8; }
  &:focus { box-shadow: none; }
}

.ci-file-input { display: none; }

.ci-send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  margin-bottom: 4px;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: scale(1.08); }
  &:active { transform: scale(0.95); }
  &:where(.el-button--primary) {
    background: linear-gradient(135deg, #818cf8, var(--el-color-primary-light-3, #79bbff));
    border: none;
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
    &:hover { box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4); }
  }
}

.ci-stop-icon {
  display: block;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 2px;
  animation: ci-stop-pulse 2s ease-in-out infinite;
}
.ci-send-btn:where(.el-button--danger) { animation: ci-stop-glow 2s ease-in-out infinite; }

@keyframes ci-stop-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.yipet-chat-input-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.yipet-shortcut-hints {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
}

// ── Character count ──
.ci-char-count {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 0 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: #d4d0e8;
  opacity: 0.6;
}

.ci-char-count-sep {
  opacity: 0.4;
}

.yipet-shortcut-hint {
  font-size: 10px;
  color: #d4d0e8;
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;

  kbd {
    display: inline-block;
    min-width: 14px;
    padding: 0 3px;
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 9px;
    color: inherit;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 2px;
    text-align: center;
    line-height: 1.5;
  }
}

// ── Responsive ──
@media (max-width: 480px) {
  .ci-input {
    padding: 6px 8px 10px;
  }
  .ci-row {
    padding: 2px 8px;
    margin: 0;
    border-radius: 10px;
  }
  .ci-row :deep(.el-textarea__inner) {
    padding: 6px 0;
    font-size: 13px;
  }
  .ci-send-btn {
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
  }
}
</style>