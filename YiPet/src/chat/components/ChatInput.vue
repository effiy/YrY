<script setup lang="ts">
/**
 * YiPet Chat — ChatInput (Vue 3 SFC)
 */
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { CircleClose } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';
import ChatToolbar from './ChatToolbar/ChatToolbar.vue';
import DraftImageList from './DraftImageList.vue';
import QuickButtons from './QuickButtons.vue';
import FileMentionDropdown from './FileMentionDropdown.vue';

const MAX_DRAFT_IMAGES = 4;

const store = useChatStore();
const s = store.state;

const disabled = computed(() => s.isProcessing && !s.agentMode);
const draftImages = computed(() => s.draftImages || []);

// Phase-aware placeholder (mirrors YiVad aiChat)
const placeholder = computed(() => {
  if (inputValue.value.startsWith('/')) return '/compact /clear /retry /stop /model /steer /followup /export /template — type a command';
  if (s.agentMode && s.isProcessing) return 'Agent is running — type to redirect it, or /followup <msg> to queue after it finishes';
  if (s.streamingPhase === 'fetching') return 'Fetching URL content...';
  if (s.streamingPhase === 'retrieving') return 'Retrieving knowledge base...';
  if (s.streamingPhase === 'thinking') return 'AI thinking...';
  if (s.streamingPhase === 'streaming') return 'AI responding...';
  if (s.webSearchEnabled && s.isProcessing) return 'Searching web...';
  return 'Ask anything, type @ to add files (Enter send, Shift+Enter newline)';
});

const inputValue = ref('');
const isComposing = ref(false);
const compositionEndTime = ref(0);
const lastTemplateRef = ref('');
const historyIdxRef = ref(-1);
const preHistoryInputRef = ref('');

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

const hasContent = computed(() => !!inputValue.value.trim() || draftImages.value.length > 0);

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
  store.sendMessage(text, imgs);
  inputValue.value = '';
  lastTemplateRef.value = '';
  historyIdxRef.value = -1;
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

  if (e.key === 'Escape') {
    e.preventDefault();
    if (s.isProcessing) { store.stopSending(); return; }
    inputValue.value = '';
    historyIdxRef.value = -1;
    return;
  }

  // Ctrl+K / Cmd+K: clear conversation
  if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !s.isProcessing) {
    e.preventDefault();
    store.sendMessage('/clear');
    inputValue.value = '';
    return;
  }

  // Ctrl+L / Cmd+L: clear input
  if ((e.metaKey || e.ctrlKey) && e.key === 'l' && !s.isProcessing) {
    e.preventDefault();
    inputValue.value = '';
    return;
  }

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
</script>

<template>
  <div class="yipet-chat-input-container">
    <ChatToolbar :has-content="hasContent" @clear-input="inputValue = ''; lastTemplateRef = ''; store.clearDraftImages?.()" />

    <DraftImageList
      v-if="draftImages.length > 0"
      :images="draftImages"
      @remove="(idx: number) => store.removeDraftImage?.(idx)"
      @clear="store.clearDraftImages?.()"
    />

    <QuickButtons />

    <div class="yipet-chat-input-row">
      <div class="yipet-chat-textarea-wrap">
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
          aria-label="Conversation input"
          @keydown="onKeyDown"
          @paste="onPaste"
          @compositionstart="isComposing = true; compositionEndTime = 0"
          @compositionupdate="isComposing = true; compositionEndTime = 0"
          @compositionend="isComposing = false; compositionEndTime = Date.now()"
        />
      </div>
      <el-tooltip content="Clear input" placement="bottom">
        <el-button
          v-show="hasContent"
          circle
          size="default"
          :icon="CircleClose"
          @click="inputValue = ''; lastTemplateRef = ''; store.clearDraftImages?.()"
        />
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.yipet-chat-input-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.yipet-chat-input-row {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  position: relative;
}

.yipet-chat-textarea-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

// el-input textarea dark theme
:deep(.el-textarea__inner) {
  background: var(--input-bg, #181730);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  color: var(--text-primary, #f5f3ff);
  font-size: 13px;
  font-family: inherit;
  line-height: 1.5;
  border-radius: 8px;
  padding: 8px 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder { color: var(--placeholder-color, rgba(212, 208, 232, 0.5)); }
  &:focus {
    border-color: var(--primary-light, #818cf8);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  }
}

.send-btn {
  align-self: flex-end;
  flex-shrink: 0;
  --el-button-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  --el-button-border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
  --el-button-text-color: var(--primary-light, #818cf8);
  --el-button-hover-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  --el-button-hover-border-color: var(--primary-light, #818cf8);
  --el-button-hover-text-color: #fff;
  transition: all 0.15s;

  &:disabled {
    --el-button-bg-color: transparent;
    --el-button-border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
    --el-button-text-color: var(--text-secondary, #d4d0e8);
    opacity: 0.4;
  }
}

.yipet-chat-input-meta {
  position: absolute;
  right: 8px;
  bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-hint {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  kbd {
    display: inline-block;
    min-width: 16px;
    padding: 1px 5px;
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 11px;
    color: var(--text-secondary, #d4d0e8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
    border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 3px;
  }
}

.chat-actions {
  display: flex;
  gap: 8px;
}

</style>
