<script setup lang="ts" name="aiChatPageContextEditor">
import { computed, ref, watch } from "vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useMarkdown } from "@/hooks/useMarkdown";

const store = useAiChatStore();
const { render } = useMarkdown();

const visible = computed({
  get: () => store.contextEditorVisible,
  set: v => {
    if (!v) store.closeContextEditor();
  }
});

const draft = ref("");
const mode = ref<"edit" | "split" | "preview">("split");
const saving = ref(false);

watch(visible, v => {
  if (v) {
    draft.value = store.contextEditorDraft;
    mode.value = "split";
  }
});

const previewHtml = computed(() => render(draft.value));
const canSave = computed(() => !!store.activeConversation);

function copy() {
  navigator.clipboard.writeText(draft.value);
}

function download() {
  const blob = new Blob([draft.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${store.activeConversation?.title || "context"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

async function save() {
  if (!canSave.value) {
    store.closeContextEditor();
    return;
  }
  saving.value = true;
  try {
    await store.saveContextEditorContent(draft.value);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="Page context" width="900px" top="5vh" :close-on-click-modal="false" append-to-body>
    <div class="pce-toolbar">
      <el-radio-group v-model="mode" size="small">
        <el-radio-button value="edit">Edit</el-radio-button>
        <el-radio-button value="split">Split</el-radio-button>
        <el-radio-button value="preview">Preview</el-radio-button>
      </el-radio-group>
      <div class="pce-actions">
        <el-button size="small" text @click="copy">Copy</el-button>
        <el-button size="small" text @click="download">Download</el-button>
      </div>
    </div>
    <div class="pce-body" :class="`pce-body--${mode}`">
      <el-input
        v-if="mode === 'edit' || mode === 'split'"
        v-model="draft"
        type="textarea"
        :rows="18"
        placeholder="Markdown context (when the 'Page context' toggle is on, content is sent as prefix context with each request)"
        class="pce-editor"
      />
      <div v-if="mode === 'split' || mode === 'preview'" class="pce-preview" v-html="previewHtml" />
    </div>
    <template #footer>
      <el-button @click="store.closeContextEditor()">Cancel</el-button>
      <el-button type="primary" :loading="saving" :disabled="!canSave" @click="save">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.pce-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.pce-actions {
  display: flex;
  gap: 4px;
}
.pce-body {
  display: flex;
  gap: 8px;
  min-height: 400px;
}
.pce-body--preview .pce-editor {
  display: none;
}
.pce-body--edit .pce-preview {
  display: none;
}
.pce-editor {
  flex: 1;
}
.pce-preview {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}
.pce-preview :deep(pre) {
  padding: 8px;
  overflow-x: auto;
  font-size: 12px;
  background: var(--el-fill-color);
  border-radius: 6px;
}
</style>
