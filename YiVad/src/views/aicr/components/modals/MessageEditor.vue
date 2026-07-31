<script setup lang="ts" name="aicrMessageEditor">
import { computed, ref, watch } from "vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useMarkdown } from "@/hooks/useMarkdown";

const modalStore = useAicrModalStore();
const chatStore = useAicrChatStore();
const { render } = useMarkdown();

const visible = computed({
  get: () => modalStore.messageEditorVisible,
  set: v => {
    if (!v) modalStore.closeMessageEdit();
  }
});

const draft = ref("");
const mode = ref<"edit" | "preview">("edit");

watch(visible, v => {
  if (v) {
    draft.value = modalStore.messageEditorDraft;
    mode.value = "edit";
  }
});

const previewHtml = computed(() => render(draft.value));

function save() {
  if (modalStore.messageEditorIndex >= 0) {
    chatStore.editMessage(modalStore.messageEditorIndex, draft.value);
  }
  modalStore.closeMessageEdit();
}
</script>

<template>
  <el-dialog v-model="visible" title="Edit Message" width="640px" :close-on-click-modal="false">
    <div class="me-modes">
      <el-radio-group v-model="mode" size="small">
        <el-radio-button value="edit">Edit</el-radio-button>
        <el-radio-button value="preview">Preview</el-radio-button>
      </el-radio-group>
    </div>
    <el-input v-if="mode === 'edit'" v-model="draft" type="textarea" :rows="10" placeholder="Message content" />
    <div v-else class="me-preview" v-html="previewHtml" />
    <template #footer>
      <el-button @click="modalStore.closeMessageEdit()">Cancel</el-button>
      <el-button type="primary" @click="save">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.me-modes {
  margin-bottom: 8px;
}
.me-preview {
  min-height: 200px;
  padding: 8px;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}
</style>
