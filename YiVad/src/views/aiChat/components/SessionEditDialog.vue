<script setup lang="ts" name="aiChatSessionEditDialog">
import { ref, watch, computed } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

const store = useAiChatStore();

const titleDraft = ref("");
const descDraft = ref("");
const pageTitleDraft = ref("");
const sourceUrlDraft = ref("");
const saving = ref(false);

const FROM_PREFIX = "from:";

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
    const fromTag = (s.tags ?? []).find(t => typeof t === "string" && t.startsWith(FROM_PREFIX));
    sourceUrlDraft.value = fromTag ? fromTag.slice(FROM_PREFIX.length) : "";
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
    const existing = s.tags ?? [];
    const prevFrom = existing.find(t => typeof t === "string" && t.startsWith(FROM_PREFIX));
    const nextUrl = sourceUrlDraft.value.trim();
    if (nextUrl) {
      const nextTag = `${FROM_PREFIX}${nextUrl}`;
      if (prevFrom !== nextTag) {
        const next = prevFrom ? existing.map(t => (t === prevFrom ? nextTag : t)) : [...existing, nextTag];
        await store.updateSessionMeta(s.key, { tags: next });
      }
    } else if (prevFrom) {
      await store.updateSessionMeta(s.key, { tags: existing.filter(t => t !== prevFrom) });
    }
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
      <el-form-item label="Source URL">
        <el-input
          v-model="sourceUrlDraft"
          placeholder="Optional: in-app URL of the originating page (e.g. /code-review/bugs/detail/BUG-001?mode=view)"
          clearable
        />
        <div class="se-hint">Enables the Back button on the conversation list item and the View source link in the context panel.</div>
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
.se-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}
</style>
