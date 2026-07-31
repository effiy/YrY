<script setup lang="ts" name="aicrChatInput">
import { ref, computed } from "vue";
import { ElImageViewer } from "element-plus";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrUiStore } from "@/stores/modules/aicr/ui";
import { useAicrShortcuts } from "@/hooks/useAicrShortcuts";
import ChatToolbar from "./ChatToolbar.vue";
import DraftImageList from "./DraftImageList.vue";

const chatStore = useAicrChatStore();
const modalStore = useAicrModalStore();
const uiStore = useAicrUiStore();
const imageInput = ref<HTMLInputElement | null>(null);
const previewSrc = ref<string | null>(null);

const { onCompositionStart, onCompositionEnd, onKeydown, onPaste } = useAicrShortcuts(chatStore);

const canClear = computed(() => chatStore.input.trim().length > 0 || chatStore.draftImages.length > 0);

function openImagePicker() {
  imageInput.value?.click();
}

async function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  for (const f of files) {
    if (!f.type.startsWith("image/")) continue;
    try {
      const url = await chatStore.uploadImage(f);
      chatStore.addDraftImage(url);
    } catch (err: any) {
      console.error("image upload failed:", err?.message);
    }
  }
  if (input) input.value = "";
}
</script>

<template>
  <div class="ci-input">
    <ChatToolbar
      :faq-active="modalStore.faqVisible"
      :sending="chatStore.sending"
      :streaming-type="chatStore.streamingType"
      :can-edit-session="!!chatStore.activeSession"
      :context-enabled="chatStore.contextEnabled"
      :rag-enabled="chatStore.ragEnabled"
      :can-clear="canClear"
      :has-active-session="!!chatStore.activeSession"
      @toggle-faq="modalStore.toggleFaq()"
      @pick-image="openImagePicker"
      @edit-session="
        modalStore.openSessionEdit(
          chatStore.activeSession!.key,
          chatStore.activeSession!.title || '',
          chatStore.activeSession!.url || '',
          chatStore.activeSession!.pageDescription || ''
        )
      "
      @edit-context="modalStore.openContextEditor(chatStore.activeSession?.pageContent || '')"
      @manage-tags="modalStore.toggleTagManager()"
      @open-wechat="modalStore.toggleWeChat()"
      @toggle-settings="modalStore.toggleSettings()"
      @clear-input="chatStore.clearInput()"
      @toggle-context="chatStore.contextEnabled = !chatStore.contextEnabled"
      @toggle-rag="chatStore.ragEnabled = !chatStore.ragEnabled"
      @toggle-collapse="uiStore.toggleCenter()"
      @stop="chatStore.abortSend()"
    />
    <input ref="imageInput" type="file" accept="image/*" multiple class="ci-file-input" @change="onImageChange" />
    <DraftImageList
      :images="chatStore.draftImages"
      @remove="chatStore.removeDraftImage"
      @clear="chatStore.clearDraftImages()"
      @preview="src => (previewSrc = src)"
    />
    <div class="ci-row">
      <el-input
        v-model="chatStore.input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 6 }"
        :placeholder="chatStore.sending ? 'Generating...' : 'Your question (Enter to send, Shift+Enter for newline)'"
        :disabled="chatStore.sending"
        resize="none"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @keydown="(e: Event | KeyboardEvent) => onKeydown(e as KeyboardEvent)"
        @paste="onPaste"
      />
    </div>
    <ElImageViewer v-if="previewSrc" :url-list="[previewSrc]" @close="previewSrc = null" />
  </div>
</template>

<style scoped lang="scss">
.ci-input {
  display: flex;
  flex-shrink: 0;
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
