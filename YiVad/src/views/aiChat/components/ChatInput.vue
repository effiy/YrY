<script setup lang="ts" name="aiChatInput">
import { ref, watch } from "vue";
import { Promotion, CircleClose } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAiChatShortcuts } from "@/hooks/useAiChatShortcuts";
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

// ── Keyboard with mention support ──

function onKeydown(e: KeyboardEvent) {
  // If mention dropdown is open, let it handle navigation keys
  if (mentionVisible.value && mentionDropdownRef.value) {
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
      mentionDropdownRef.value.onKeydown(e);
      return;
    }
  }
  // Close mention on other navigation
  if (mentionVisible.value && e.key !== "Shift") {
    // Keep open for typing
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
      :context-files="store.activeConversation?.tags?.filter(t => typeof t === 'string' && t.startsWith('ctx:')).map(t => (t as string).slice(4)) ?? []"
      @toggle-faq="store.toggleFaq()"
      @pick-image="openImagePicker"
      @manage-tags="store.openTagManager()"
      @open-wechat="store.openWeChat()"
      @toggle-rag="store.ragEnabled = !store.ragEnabled"
      @toggle-web-search="store.webSearchEnabled = !store.webSearchEnabled"
      @stop="store.stopSending()"
      @remove-context-file="p => store.removeContextFile(p)"
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
          :placeholder="store.sending ? 'Generating...' : store.webSearching ? 'Searching web...' : 'Ask or edit context — type @ to add files, ask AI to update knowledge (Enter send, Shift+Enter newline)'"
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
