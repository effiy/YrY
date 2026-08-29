<script setup lang="ts" name="aiChatInput">
import { ref, watch, nextTick } from "vue";
import { Promotion, CircleClose } from "@element-plus/icons-vue";
import { ElInput } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAiChatShortcuts } from "@/hooks/useAiChatShortcuts";
import { usePromptHistory, pushPromptHistory } from "@/hooks/usePromptHistory";
import ChatToolbar from "./ChatToolbar.vue";
import DraftImageList from "./DraftImageList.vue";
import FileMentionDropdown from "./FileMentionDropdown.vue";

const store = useAiChatStore();
const imageInput = ref<HTMLInputElement | null>(null);
const textareaRef = ref<InstanceType<typeof ElInput> | null>(null);

const { onCompositionStart, onCompositionEnd, onKeydown: baseOnKeydown, onPaste } = useAiChatShortcuts(store);

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

watch(() => store.input, () => {
  updateMentionState();
});

function onMentionSelect(path: string) {
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
  // Add as context file tag
  store.addTag("ctx:" + path);
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
    if (delta < 0) historyIdx.value = promptHistory.value.length - 1; // start at most recent
    else return; // nothing to go "next" to — stay empty
  } else {
    historyIdx.value = Math.max(-1, Math.min(promptHistory.value.length - 1, historyIdx.value + delta));
    if (historyIdx.value === -1) { store.input = ""; return; }
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
    if (store.sending) { store.stopSending(); e.preventDefault(); return; }
    if (store.input.trim()) { store.clearInput(); e.preventDefault(); return; }
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

// Cycle Q-variants through 1 → 2 → 3 → 5 → 1 (llama_index QueryFusionRetriever).
function cycleRagNumQueries() {
  const cur = store.ragNumQueries ?? 1;
  const next = cur === 1 ? 2 : cur === 2 ? 3 : cur === 3 ? 5 : 1;
  store.ragNumQueries = next;
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
      :rag-num-queries="store.ragNumQueries"
      :rag-chat-mode="store.ragChatMode"
      :rag-category="store.ragCategory"
      :rag-tags="store.ragTags"
      :context-files="store.activeConversation?.tags?.filter(t => typeof t === 'string' && t.startsWith('ctx:')).map(t => (t as string).slice(4)) ?? []"
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
      @cycle-rag-num-queries="cycleRagNumQueries"
      @select-rag-chat-mode="m => store.ragChatMode = m"
      @update-rag-category="c => store.ragCategory = c"
      @update-rag-tags="t => store.ragTags = t"
      @stop="store.stopSending()"
      @remove-context-file="p => store.removeContextFile(p)"
      @update-selected-model="m => store.selectedModel = m"
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
        <el-input
          v-model="store.input"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          :placeholder="store.input.startsWith('/') ? '/compact /clear /retry /stop /model /export /template — type a command' : store.streamingPhase === 'fetching' ? 'Fetching URL content...' : store.streamingPhase === 'retrieving' ? 'Retrieving knowledge base...' : store.streamingPhase === 'thinking' ? 'AI thinking...' : store.streamingPhase === 'streaming' ? 'AI responding...' : store.webSearching ? 'Searching web...' : store.ragEnabled && !store.ragActive ? 'RAG enabled — type @ to add knowledge files as context, or disable RAG in toolbar' : 'Ask anything, type @ to add files (Enter send, Shift+Enter newline)'"
          :disabled="store.sending"
          resize="none"
          @compositionstart="onCompositionStart"
          @compositionend="onCompositionEnd"
          @keydown="e => onKeydown(e as KeyboardEvent)"
          @paste="onPaste"
        />
      </div>
      <el-tooltip content="Clear input" placement="bottom">
        <el-button v-show="store.input.trim().length > 0 || store.draftImages.length > 0" circle size="default" :icon="CircleClose" @click="store.clearInput()" />
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ci-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 8px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}
.ci-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 0 12px;
}
.ci-textarea-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}
.ci-file-input {
  display: none;
}
:deep(.el-textarea__inner) {
  padding-right: 8px;
}
</style>
