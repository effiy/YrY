<script setup lang="ts" name="aiChatInput">
import { ref, watch, nextTick, computed, onUnmounted } from "vue";
import { Promotion, CircleClose } from "@element-plus/icons-vue";
import { ElInput, ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAiChatShortcuts } from "@/hooks/useAiChatShortcuts";
import { usePromptHistory, pushPromptHistory } from "@/hooks/usePromptHistory";
import ChatToolbar from "./ChatToolbar/index.vue";
import DraftImageList from "./DraftImageList.vue";
import FileMentionDropdown from "./FileMentionDropdown.vue";

const store = useAiChatStore();
const imageInput = ref<HTMLInputElement | null>(null);
const textareaRef = ref<InstanceType<typeof ElInput> | null>(null);

const { onCompositionStart, onCompositionEnd, onKeydown: baseOnKeydown, onPaste } = useAiChatShortcuts(store);

// ── Streaming status ──
const streamStartTime = ref(0);
const elapsedMs = ref(0);
let elapsedTimer: ReturnType<typeof setInterval> | null = null;

watch(
  () => store.sending,
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
  if (!store.sending) return "";
  const ms = elapsedMs.value;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
});

const streamingChars = computed(() => {
  if (!store.sending) return "";
  const len = store.activeConversation?.messages?.at(-1)?.message?.length ?? 0;
  if (!len) return "";
  if (len < 1000) return `${len}c`;
  return `${(len / 1000).toFixed(1)}kc`;
});

const streamingSpeed = computed(() => {
  if (!store.sending) return "";
  const ms = elapsedMs.value;
  if (ms < 500) return "";
  const len = store.activeConversation?.messages?.at(-1)?.message?.length ?? 0;
  if (!len) return "";
  const cps = Math.round(len / (ms / 1000));
  if (cps < 1000) return `${cps}c/s`;
  return `${(cps / 1000).toFixed(1)}k/s`;
});

const streamingPhaseLabel = computed(() => {
  if (!store.sending) return "";
  if (store.streamingPhase === "preparing") return "Preparing";
  if (store.streamingPhase === "retrieving") return "Retrieving";
  if (store.streamingPhase === "thinking") return "Thinking";
  if (store.streamingPhase === "streaming") return "Generating";
  return "Processing";
});

// ── Auto-focus input when switching conversations ──
watch(
  () => store.activeConversation?.key,
  () => {
    nextTick(() => {
      const el = textareaRef.value?.ref as HTMLTextAreaElement | undefined;
      el?.focus();
    });
  }
);

// ── Pre-fetch web search while user types ───────────────────────────

let preFetchTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => store.input,
  (val: string) => {
    clearTimeout(preFetchTimer);
    if (!store.webSearchEnabled || store.sending) {
      // Clear stale pre-fetch results when search is toggled off
      if (!store.webSearchEnabled) store.webSearchResults = [];
      return;
    }
    const q = val.trim();
    if (!q || q.length < 4) return;
    preFetchTimer = setTimeout(() => {
      store.preFetchSearch(q);
    }, 600);
  }
);

// ── Input placeholder ──

const inputPlaceholder = computed(() => {
  if (store.sending) {
    if (store.streamingPhase === "thinking")
      return store.ragEnabled && store.ragActive ? "RAG · Searching knowledge base..." : "AI is thinking...";
    if (store.streamingPhase === "retrieving") return "Retrieving knowledge...";
    if (store.streamingPhase === "streaming")
      return store.ragEnabled && store.ragActive ? "RAG · Generating response..." : "AI is responding...";
    return "Waiting...";
  }
  if (store.input.startsWith("/")) return "/compact /clear /retry /stop — type a command";
  if (store.webSearching) return "Searching the web...";
  if (store.ragEnabled && store.ragActive) {
    const ctxCount = (store.activeConversation?.tags ?? []).filter(t => typeof t === "string" && t.startsWith("ctx:")).length;
    if (store.webSearchEnabled) {
      return ctxCount ? `RAG + Web · ${ctxCount} file(s) — Ask anything...` : "RAG + Web · Ask anything...";
    }
    return ctxCount ? `RAG mode · ${ctxCount} file(s) in context — Ask anything...` : "RAG mode · Ask anything...";
  }
  if (store.webSearchEnabled) return "Web search on — Ask anything...";
  return "Ask anything... (Enter to send, Shift+Enter for newline)";
});

// ── Can send: user has text, images, or is not currently sending ──

const canSend = computed(() => {
  if (store.sending) return false;
  return store.input.trim().length > 0 || store.draftImages.length > 0;
});

// ── @file mention ──

const mentionQuery = ref("");
const mentionVisible = ref(false);
const mentionDropdownRef = ref<InstanceType<typeof FileMentionDropdown> | null>(null);

/** Track the last @ position in the input to detect mention triggers. */
function updateMentionState() {
  const text = store.input;
  const cursorPos = text.lastIndexOf("@");
  if (cursorPos < 0) {
    mentionVisible.value = false;
    mentionQuery.value = "";
    return;
  }
  // Only trigger @ at start or preceded by whitespace
  if (cursorPos > 0 && !/\s/.test(text[cursorPos - 1])) {
    mentionVisible.value = false;
    mentionQuery.value = "";
    return;
  }
  const after = text.slice(cursorPos + 1);
  // Don't trigger if there's a space after @
  if (after.includes(" ")) {
    mentionVisible.value = false;
    mentionQuery.value = "";
    return;
  }
  mentionQuery.value = after;
  mentionVisible.value = true;
}

watch(
  () => store.input,
  () => {
    updateMentionState();
  }
);

async function onMentionSelect(path: string) {
  // Replace the @query with the file path
  const text = store.input;
  const atIdx = text.lastIndexOf("@");
  if (atIdx < 0) return;
  const afterAt = text.slice(atIdx + 1);
  const spaceIdx = afterAt.search(/\s/);
  const endIdx = spaceIdx >= 0 ? atIdx + 1 + spaceIdx : text.length;
  const before = text.slice(0, atIdx);
  const after = text.slice(endIdx);
  store.input = (before + after).trim();
  // Load file content and add to context
  try {
    const { readKnowledgeFile } = await import("@/api/modules/knowledgeService");
    const result = await readKnowledgeFile(path);
    const content = (result as any)?.content || "";
    if (content) {
      await store.applyContextChange(path, content);
    } else {
      store.addTag("ctx:" + path);
    }
  } catch {
    store.addTag("ctx:" + path);
  }
  mentionVisible.value = false;
  mentionQuery.value = "";
}

function onMentionClose() {
  mentionVisible.value = false;
  mentionQuery.value = "";
}

// ── Prompt history (Pi-inspired: shell-style ArrowUp/ArrowDown recall) ──
// State + persistence live in usePromptHistory (singleton shared with
// ChatToolbar's history sub-panel). Navigation index stays local to input.
const { promptHistory } = usePromptHistory();
const historyIdx = ref<number>(-1); // -1 = not navigating, otherwise index into promptHistory (0 = most recent)
function caretPos(): number {
  const el = textareaRef.value?.ref as HTMLTextAreaElement | undefined;
  return el?.selectionStart ?? store.input.length;
}
function recallPrompt(delta: number): void {
  if (!promptHistory.value.length) return;
  if (historyIdx.value === -1) {
    if (delta < 0)
      historyIdx.value = promptHistory.value.length - 1; // start at most recent
    else return; // nothing to go "next" to — stay empty
  } else {
    historyIdx.value = Math.max(-1, Math.min(promptHistory.value.length - 1, historyIdx.value + delta));
    if (historyIdx.value === -1) {
      store.input = "";
      return;
    }
  }
  store.input = promptHistory.value[historyIdx.value];
  // Move caret to end so subsequent ArrowDown feels natural.
  nextTick(() => {
    const el = textareaRef.value?.ref as HTMLTextAreaElement | undefined;
    el?.setSelectionRange(store.input.length, store.input.length);
  });
}

// ── Keyboard with mention support ──

function onKeydown(e: KeyboardEvent) {
  // If mention dropdown is open, let it handle navigation keys
  if (mentionVisible.value && mentionDropdownRef.value) {
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
      mentionDropdownRef.value.onKeydown(e);
      return;
    }
  }

  // ── Keyboard shortcuts (Pi-inspired: setKeybinding) ──────────────
  const mod = e.metaKey || e.ctrlKey;

  // Escape: stop sending
  if (e.key === "Escape" && !mentionVisible.value) {
    if (store.sending) {
      store.stopSending();
      e.preventDefault();
      return;
    }
    if (store.input.trim()) {
      store.clearInput();
      e.preventDefault();
      return;
    }
  }

  // Ctrl+K / Cmd+K: clear conversation
  if (mod && e.key === "k" && !store.sending) {
    e.preventDefault();
    if (store.activeConversation) {
      store.input = "/clear";
      store.sendMessage("/clear");
      store.input = "";
    }
    return;
  }

  // Ctrl+Shift+S / Cmd+Shift+S: toggle web search
  if (mod && e.shiftKey && e.key === "S" && !store.sending) {
    e.preventDefault();
    store.webSearchEnabled = !store.webSearchEnabled;
    ElMessage({
      message: store.webSearchEnabled ? "Web search on" : "Web search off",
      type: store.webSearchEnabled ? "success" : "info",
      duration: 1500,
      showClose: false
    });
    return;
  }

  // Ctrl+Shift+R / Cmd+Shift+R: toggle RAG
  if (mod && e.shiftKey && e.key === "R" && !store.sending) {
    e.preventDefault();
    store.ragEnabled = !store.ragEnabled;
    ElMessage({
      message: store.ragEnabled ? "RAG on" : "RAG off",
      type: store.ragEnabled ? "success" : "info",
      duration: 1500,
      showClose: false
    });
    return;
  }

  // Ctrl+L / Cmd+L: clear input
  if (mod && e.key === "l" && !store.sending) {
    e.preventDefault();
    store.clearInput();
    return;
  }

  // ── Prompt history navigation (Pi: shell-style recall) ──
  // ArrowUp at caret 0 OR empty input → recall previous prompt.
  // ArrowDown at caret end → recall next prompt (or empty when past most recent).
  if (!mod && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    const atStart = caretPos() === 0;
    const atEnd = caretPos() === store.input.length;
    if (e.key === "ArrowUp" && (atStart || !store.input)) {
      e.preventDefault();
      recallPrompt(-1);
      return;
    }
    if (e.key === "ArrowDown" && atEnd && historyIdx.value !== -1) {
      e.preventDefault();
      recallPrompt(1);
      return;
    }
  }

  // Push to history on Enter send (before baseOnKeydown consumes the event).
  // baseOnKeydown gates on compositionEndTime; we push optimistically and
  // dedupe on the next send so a no-op Enter doesn't pollute history.
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing && store.input.trim()) {
    pushPromptHistory(store.input);
    historyIdx.value = -1; // reset navigation
  }

  baseOnKeydown(e);
}

function openImagePicker() {
  imageInput.value?.click();
}

async function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  if (files.length) await store.addDraftImageFiles(files);
  if (input) input.value = "";
}
</script>

<template>
  <div class="ci-input">
    <ChatToolbar
      :faq-active="store.faqVisible"
      :sending="store.sending"
      :streaming-type="store.streamingType"
      :rag-toggle="store.ragEnabled"
      :rag-available="store.ragActive"
      :web-search-toggle="store.webSearchEnabled"
      :rag-hybrid="store.ragHybrid"
      :rag-rerank="store.ragRerank"
      :rag-citations="store.ragCitations"
      :rag-hyde="store.ragHyde"
      :rag-scope="store.ragScope"
      :rag-num-queries="store.ragNumQueries"
      :rag-chat-mode="store.ragChatMode"
      :context-files="
        store.activeConversation?.tags
          ?.filter(t => typeof t === 'string' && t.startsWith('ctx:'))
          .map(t => (t as string).slice(4)) ?? []
      "
      :selected-model="store.selectedModel"
      :available-models="store.availableModels"
      @toggle-faq="store.toggleFaq()"
      @pick-image="openImagePicker"
      @manage-tags="store.openTagManager()"
      @open-wechat="store.openWeChat()"
      @toggle-rag="store.ragEnabled = !store.ragEnabled"
      @toggle-web-search="store.webSearchEnabled = !store.webSearchEnabled"
      @toggle-rag-hybrid="store.ragHybrid = !store.ragHybrid"
      @toggle-rag-rerank="store.ragRerank = !store.ragRerank"
      @toggle-rag-citations="store.ragCitations = !store.ragCitations"
      @toggle-rag-hyde="store.ragHyde = !store.ragHyde"
      @update-rag-scope="store.ragScope = $event"
      @update-rag-num-queries="store.ragNumQueries = $event"
      @update-rag-chat-mode="store.ragChatMode = $event"
      @stop="store.stopSending()"
      @remove-context-file="p => store.removeContextFile(p)"
      @update-selected-model="m => (store.selectedModel = m)"
    />
    <!-- Streaming status bar -->
    <transition name="ci-status-fade">
      <div v-if="store.sending" class="ci-status">
        <span class="ci-status-dot" />
        <span class="ci-status-phase">{{ streamingPhaseLabel }}</span>
        <span class="ci-status-time">{{ streamingElapsed }}</span>
        <span v-if="streamingChars" class="ci-status-chars">{{ streamingChars }}</span>
        <button class="ci-status-stop" @click="store.stopSending()">Stop</button>
      </div>
    </transition>
    <input ref="imageInput" type="file" accept="image/*" multiple class="ci-file-input" @change="onImageChange" />
    <DraftImageList :images="store.draftImages" @remove="store.removeDraftImage" @clear="store.clearDraftImages" />
    <div class="ci-row">
      <div class="ci-textarea-wrap">
        <FileMentionDropdown
          ref="mentionDropdownRef"
          :visible="mentionVisible"
          :query="mentionQuery"
          @select="onMentionSelect"
          @close="onMentionClose"
        />
        <el-input
          v-model="store.input"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :placeholder="inputPlaceholder"
          :disabled="store.sending"
          resize="none"
          class="ci-textarea"
          @compositionstart="onCompositionStart"
          @compositionend="onCompositionEnd"
          @keydown="e => onKeydown(e as KeyboardEvent)"
          @paste="onPaste"
        />
      </div>
      <!-- Stop button (when streaming) -->
      <el-tooltip v-if="store.sending" content="Stop generating" placement="top">
        <el-button circle size="default" type="danger" class="ci-send-btn" @click="store.stopSending()">
          <span class="ci-stop-icon" />
        </el-button>
      </el-tooltip>
      <!-- Send button -->
      <el-tooltip v-else-if="canSend" content="Send message (Enter)" placement="top">
        <el-button circle size="default" type="primary" class="ci-send-btn" :icon="Promotion" @click="store.sendMessage()" />
      </el-tooltip>
      <!-- Clear (when only images, no text) -->
      <el-tooltip v-else-if="store.draftImages.length > 0" content="Clear images" placement="top">
        <el-button circle size="default" class="ci-send-btn" :icon="CircleClose" @click="store.clearDraftImages()" />
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ci-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--space-sm) 12px 12px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);

  @supports (backdrop-filter: blur(1px)) {
    background: color-mix(in srgb, var(--el-bg-color) 88%, transparent);
    border-top-color: transparent;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
}

// Streaming status bar
.ci-status {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 16px 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ci-status-dot {
  width: 7px;
  height: 7px;
  background: var(--el-color-primary);
  border-radius: 50%;
  animation: ci-status-pulse 1.2s ease-in-out infinite;
}
@keyframes ci-status-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
.ci-status-phase {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ci-status-time {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.ci-status-stop {
  margin-left: auto;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-danger);
  cursor: pointer;
  background: none;
  border: 1px solid var(--el-color-danger-light-5);
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);

  &:hover {
    color: #fff;
    background: var(--el-color-danger);
    border-color: var(--el-color-danger);
  }
}
.ci-status-fade-enter-active,
.ci-status-fade-leave-active {
  transition: all var(--transition-fast);
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
.ci-row {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-end;
  padding: 6px 14px;
  margin: 0 4px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
  &:focus-within {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 0 0 3px rgb(var(--el-color-primary-rgb, 64 158 255) / 12%);
    transform: translateY(-1px);
  }
}
.ci-row .ci-textarea-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}
.ci-row :deep(.el-textarea__inner) {
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: transparent;
  border: none;
  box-shadow: none;
  &:focus {
    box-shadow: none;
  }
}
.ci-file-input {
  display: none;
}
.ci-send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  margin-bottom: 4px;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
  &:hover {
    transform: scale(1.08);
  }
  &:active {
    transform: scale(0.95);
  }
  &:where(.el-button--primary) {
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
    border: none;
    box-shadow: 0 2px 6px rgb(var(--el-color-primary-rgb, 64 158 255) / 30%);
    &:hover {
      box-shadow: 0 4px 12px rgb(var(--el-color-primary-rgb, 64 158 255) / 40%);
    }
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
.ci-send-btn:where(.el-button--danger) {
  animation: ci-stop-glow 2s ease-in-out infinite;
}

@keyframes ci-stop-pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

@keyframes ci-stop-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgb(var(--el-color-danger-rgb, 245 108 108) / 40%);
  }
  50% {
    box-shadow: 0 0 0 6px rgb(var(--el-color-danger-rgb, 245 108 108) / 0%);
  }
}

// ── Responsive ──
@media (width <= 767px) {
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
