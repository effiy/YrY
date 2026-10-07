<script setup lang="ts" name="aiChatInput">
import { ref, watch, nextTick, computed } from "vue";
import { Promotion, CircleClose, WarningFilled } from "@element-plus/icons-vue";
import { ElInput, ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAiChatShortcuts } from "@/hooks/useAiChatShortcuts";
import { usePromptHistory, pushPromptHistory } from "@/hooks/usePromptHistory";
import ChatToolbar from "./ChatToolbar/index.vue";
import DraftImageList from "./DraftImageList.vue";
import FileMentionDropdown from "./FileMentionDropdown.vue";

// ── Slash commands ────────────────────────────────────────────────────
const SLASH_COMMANDS = [
  { name: "clear", desc: "Clear current conversation", hint: "" },
  { name: "compact", desc: "Compact conversation to reduce tokens", hint: "" },
  { name: "retry", desc: "Retry the last failed message", hint: "" },
  { name: "stop", desc: "Stop current generation", hint: "" },
  { name: "new", desc: "Create a new conversation", hint: "" },
  { name: "find", desc: "Search and switch conversation", hint: "query" },
  { name: "rename", desc: "Rename current conversation", hint: "title" },
  { name: "delete", desc: "Delete current conversation", hint: "" },
  { name: "export", desc: "Export conversation as HTML", hint: "" },
  { name: "model", desc: "Show current model info", hint: "" },
  { name: "skills", desc: "List available tools and skills", hint: "" },
] as const;

const store = useAiChatStore();
const imageInput = ref<HTMLInputElement | null>(null);
const textareaRef = ref<InstanceType<typeof ElInput> | null>(null);

const { onCompositionStart, onCompositionEnd, onKeydown: baseOnKeydown, onPaste } = useAiChatShortcuts(store);

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
  if (store.sending) return "AI is responding...";
  const p = store.contextPressure;
  if (p.level === "critical") return "Context nearly full — send to compact or start new";
  if (p.level === "high") return `Context ${p.pct}% full · Shift+Enter for newline`;
  if (store.ragEnabled && store.ragActive) {
    return store.webSearchEnabled ? "RAG + Web · Ask anything..." : "RAG · Ask anything...";
  }
  if (store.webSearchEnabled) return "Web · Ask anything...";
  return "Ask anything...";
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
    updateSlashState();
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

// ── Slash command menu ──────────────────────────────────────────────
const slashVisible = ref(false);
const slashQuery = ref("");
const slashIdx = ref(0);

const filteredSlashCommands = computed(() => {
  const q = slashQuery.value.toLowerCase();
  if (!q) return SLASH_COMMANDS.slice();
  return SLASH_COMMANDS.filter(c => c.name.startsWith(q));
});

function updateSlashState() {
  if (mentionVisible.value) { slashVisible.value = false; return; }
  const text = store.input;
  const cursorPos = text.lastIndexOf("/");
  if (cursorPos < 0 || (cursorPos > 0 && !/\s/.test(text[cursorPos - 1]))) {
    slashVisible.value = false;
    slashQuery.value = "";
    return;
  }
  const after = text.slice(cursorPos + 1);
  if (after.includes(" ")) {
    slashVisible.value = false;
    slashQuery.value = "";
    return;
  }
  slashQuery.value = after;
  slashIdx.value = 0;
  slashVisible.value = true;
}

function onSlashSelect(cmd: typeof SLASH_COMMANDS[number]) {
  const text = store.input;
  const slashPos = text.lastIndexOf("/");
  if (slashPos < 0) return;
  store.input = text.slice(0, slashPos) + "/" + cmd.name + (cmd.hint ? " " : "");
  slashVisible.value = false;
  slashQuery.value = "";
}

function onSlashKeydown(e: KeyboardEvent) {
  if (!slashVisible.value) return;
  const n = filteredSlashCommands.value.length;
  if (e.key === "ArrowDown") { e.preventDefault(); slashIdx.value = (slashIdx.value + 1) % n; }
  else if (e.key === "ArrowUp") { e.preventDefault(); slashIdx.value = (slashIdx.value - 1 + n) % n; }
  else if (e.key === "Enter" && n > 0) { e.preventDefault(); onSlashSelect(filteredSlashCommands.value[slashIdx.value]); }
  else if (e.key === "Escape") { e.preventDefault(); slashVisible.value = false; }
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

// ── Keyboard with mention and slash support ──

function onKeydown(e: KeyboardEvent) {
  // If mention dropdown is open, let it handle navigation keys
  if (mentionVisible.value && mentionDropdownRef.value) {
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
      mentionDropdownRef.value.onKeydown(e);
      return;
    }
  }

  // If slash menu is open, handle navigation
  if (slashVisible.value && ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
    onSlashKeydown(e);
    return;
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
    <!-- Context overflow warning -->
    <div v-if="store.contextPressure.level === 'critical'" class="ci-context-warn">
      <el-icon :size="14"><WarningFilled /></el-icon>
      <span>Context window {{ store.contextPressure.pct }}% full. Use <kbd>/compact</kbd> to summarize or <kbd>/new</kbd> for fresh conversation.</span>
    </div>
    <ChatToolbar
      :faq-active="store.faqVisible"
      :sending="store.sending"
      :streaming-type="store.streamingType"
      :rag-toggle="store.ragEnabled"
      :web-search-toggle="store.webSearchEnabled"
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
      @stop="store.stopSending()"
      @remove-context-file="p => store.removeContextFile(p)"
      @update-selected-model="m => (store.selectedModel = m)"
    />
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
        <!-- Slash command menu -->
        <div v-if="slashVisible && filteredSlashCommands.length" class="ci-slash-menu">
          <div
            v-for="(cmd, i) in filteredSlashCommands"
            :key="cmd.name"
            class="ci-slash-item"
            :class="{ 'is-active': i === slashIdx }"
            @click="onSlashSelect(cmd)"
            @mouseenter="slashIdx = i"
          >
            <span class="ci-slash-item-name">/{{ cmd.name }}</span>
            <span v-if="cmd.hint" class="ci-slash-item-hint">{{ cmd.hint }}</span>
            <span class="ci-slash-item-desc">{{ cmd.desc }}</span>
          </div>
        </div>
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
  padding: 12px 16px 16px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}

.ci-context-warn {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-5);
  border-radius: var(--radius-sm);
  animation: slide-up 0.25s ease-out;
  kbd {
    padding: 0 4px;
    font-family: "SF Mono", Menlo, monospace;
    font-size: 10px;
    font-weight: 600;
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-7);
    border-radius: 3px;
  }
}

.ci-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 4px 6px 4px 16px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  &:focus-within {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 0 0 3px rgb(var(--el-color-primary-rgb, 64 158 255) / 10%);
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

// ── Slash command menu ──
.ci-slash-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 30;
  width: 320px;
  max-height: 280px;
  overflow-y: auto;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 10%);
  margin-bottom: 4px;
}
.ci-slash-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: background var(--transition-fast);
  &:first-child { border-radius: 7px 7px 0 0; }
  &:last-child { border-radius: 0 0 7px 7px; }
  &:only-child { border-radius: 7px; }
  &:hover,
  &.is-active {
    background: var(--el-color-primary-light-9);
  }
}
.ci-slash-item-name {
  flex-shrink: 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-color-primary);
}
.ci-slash-item-hint {
  flex-shrink: 0;
  padding: 0 5px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: 3px;
}
.ci-slash-item-desc {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.ci-send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  margin-bottom: 2px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
  &:hover {
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.94);
  }
  &:where(.el-button--primary) {
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-2));
    border: none;
    box-shadow: 0 2px 8px rgb(var(--el-color-primary-rgb, 64 158 255) / 25%);
    &:hover {
      box-shadow: 0 4px 14px rgb(var(--el-color-primary-rgb, 64 158 255) / 35%);
    }
  }
}
.ci-stop-icon {
  display: block;
  width: 12px;
  height: 12px;
  background: var(--el-color-white);
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
