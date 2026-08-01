<script setup lang="ts" name="aiChatInput">
import { ref } from "vue";
import { Promotion } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAiChatShortcuts } from "@/hooks/useAiChatShortcuts";
import ChatToolbar from "./ChatToolbar.vue";
import DraftImageList from "./DraftImageList.vue";

const store = useAiChatStore();
const imageInput = ref<HTMLInputElement | null>(null);


const { onCompositionStart, onCompositionEnd, onKeydown, onPaste } = useAiChatShortcuts(store);

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
      :can-clear="store.input.trim().length > 0 || store.draftImages.length > 0"
      @toggle-faq="store.toggleFaq()"
      @pick-image="openImagePicker"
      @manage-tags="store.openTagManager()"
      @open-wechat="store.openWeChat()"
      @clear-input="store.clearInput()"
      @toggle-rag="store.ragEnabled = !store.ragEnabled"
      @stop="store.stopSending()"
    />
    <input ref="imageInput" type="file" accept="image/*" multiple class="ci-file-input" @change="onImageChange" />
    <DraftImageList :images="store.draftImages" @remove="store.removeDraftImage" @clear="store.clearDraftImages" />
    <div class="ci-row">
      <el-input
        v-model="store.input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 6 }"
        :placeholder="store.sending ? 'Generating...' : 'Your question (Enter to send, Shift+Enter for newline)'"
        :disabled="store.sending"
        resize="none"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @keydown="e => onKeydown(e as KeyboardEvent)"
        @paste="onPaste"
      />
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
.ci-file-input {
  display: none;
}
:deep(.el-textarea__inner) {
  padding-right: 8px;
}
</style>
