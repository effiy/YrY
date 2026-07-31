<script setup lang="ts" name="aiChatSessionEditDialog">
import { ref, watch, computed } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

const store = useAiChatStore();

const titleDraft = ref("");
const descDraft = ref("");
const pageTitleDraft = ref("");
const saving = ref(false);

const visible = computed(() => store.sessionEditVisible);
const active = computed(() => store.activeConversation);

watch(
  visible,
  v => {
    if (!v) return;
    const s = active.value;
    if (!s) return;
    titleDraft.value = s.title || "";
    descDraft.value = s.pageDescription || "";
    pageTitleDraft.value = s.pageTitle || "";
  },
  { immediate: true }
);

async function onSave() {
  const s = active.value;
  if (!s) return;
  if (!titleDraft.value.trim()) return;
  saving.value = true;
  try {
    await store.updateSessionMeta(s.key, {
      title: titleDraft.value.trim(),
      pageDescription: descDraft.value.trim(),
      pageTitle: pageTitleDraft.value.trim()
    });
    store.closeSessionEdit();
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  store.closeSessionEdit();
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="Edit session info"
    width="520"
    :close-on-click-modal="false"
    append-to-body
    @update:model-value="v => !v && onCancel()"
  >
    <el-form label-position="top" class="se-form">
      <el-form-item label="Title">
        <el-input v-model="titleDraft" placeholder="Conversation title" maxlength="200" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="Page title">
        <el-input v-model="pageTitleDraft" placeholder="Optional: page title (used for context hint)" maxlength="200" clearable />
      </el-form-item>
      <el-form-item label="Page description">
        <el-input
          v-model="descDraft"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 8 }"
          placeholder="Optional: conversation description/summary, for list search"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onCancel">Cancel</el-button>
      <el-button type="primary" :loading="saving" :disabled="!titleDraft.trim()" @click="onSave">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.se-form {
  padding: 4px 0 8px;
}
</style>
