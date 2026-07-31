<script setup lang="ts" name="aicrSessionEditDialog">
import { computed, ref, watch } from "vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";

const modalStore = useAicrModalStore();
const sessionStore = useAicrSessionStore();
const chatStore = useAicrChatStore();

const visible = computed({
  get: () => modalStore.sessionEditVisible,
  set: v => {
    if (!v) modalStore.closeSessionEdit();
  }
});

const title = ref("");
const url = ref("");
const description = ref("");

watch(visible, v => {
  if (v) {
    title.value = modalStore.sessionEditTitle;
    url.value = modalStore.sessionEditUrl;
    description.value = modalStore.sessionEditDescription;
  }
});

async function generateDescription() {
  if (!modalStore.sessionEditKey || !title.value) return;
  modalStore.sessionEditGenerating = true;
  try {
    description.value = await sessionStore.generateDescription(modalStore.sessionEditKey, title.value, url.value);
  } finally {
    modalStore.sessionEditGenerating = false;
  }
}

async function save() {
  if (!modalStore.sessionEditKey) return;
  await sessionStore.updateSession(modalStore.sessionEditKey, {
    title: title.value,
    url: url.value,
    pageDescription: description.value
  });
  // Reflect in the chat store's active session immediately, otherwise the
  // welcome card (title/url/description) stays stale until a reload.
  if (chatStore.activeSession?.key === modalStore.sessionEditKey) {
    chatStore.activeSession = {
      ...chatStore.activeSession,
      title: title.value,
      url: url.value,
      pageDescription: description.value
    };
  }
  modalStore.closeSessionEdit();
}
</script>

<template>
  <el-dialog v-model="visible" title="Edit Session" width="560px" :close-on-click-modal="false">
    <el-form label-position="top">
      <el-form-item label="Title">
        <el-input v-model="title" placeholder="Session title" />
      </el-form-item>
      <el-form-item label="URL">
        <el-input v-model="url" placeholder="Page URL" />
      </el-form-item>
      <el-form-item label="Description">
        <div style="display: flex; gap: 8px; align-items: flex-start; width: 100%">
          <el-input v-model="description" type="textarea" :rows="3" placeholder="Page description" style="flex: 1" />
          <el-button :loading="modalStore.sessionEditGenerating" :disabled="!title" @click="generateDescription"
            >AI Gen</el-button
          >
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="modalStore.closeSessionEdit()">Cancel</el-button>
      <el-button type="primary" :disabled="!title" @click="save">Save</el-button>
    </template>
  </el-dialog>
</template>
