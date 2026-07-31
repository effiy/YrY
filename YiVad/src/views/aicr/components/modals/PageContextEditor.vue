<script setup lang="ts" name="aicrPageContextEditor">
import { computed, ref, watch } from "vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import { useMarkdown } from "@/hooks/useMarkdown";

const modalStore = useAicrModalStore();
const chatStore = useAicrChatStore();
const sessionStore = useAicrSessionStore();
const { render } = useMarkdown();

const visible = computed({
  get: () => modalStore.contextEditorVisible,
  set: v => {
    if (!v) modalStore.closeContextEditor();
  }
});

const draft = ref("");
const mode = ref<"edit" | "split" | "preview">("split");

watch(visible, v => {
  if (v) {
    draft.value = modalStore.contextEditorDraft;
    mode.value = "split";
  }
});

const previewHtml = computed(() => render(draft.value));

async function aiOptimize() {
  modalStore.contextEditorBusy = true;
  try {
    draft.value = await chatStore.askOnce(
      `Optimize the following Markdown document for clear structure and concise expression, preserving the original meaning:\n\n${draft.value}`
    );
  } finally {
    modalStore.contextEditorBusy = false;
  }
}

async function aiTranslate(target: "zh" | "en") {
  modalStore.contextEditorBusy = true;
  try {
    const prompt =
      target === "zh"
        ? `Translate the following Markdown to Chinese, preserving code blocks and URLs:\n\n${draft.value}`
        : `Translate the following Markdown to English, preserving code blocks and URLs:\n\n${draft.value}`;
    draft.value = await chatStore.askOnce(prompt);
  } finally {
    modalStore.contextEditorBusy = false;
  }
}

function copy() {
  navigator.clipboard.writeText(draft.value);
}

async function save() {
  if (!chatStore.activeSession) {
    modalStore.closeContextEditor();
    return;
  }
  await sessionStore.updateSession(chatStore.activeSession.key, { pageContent: draft.value });
  // Reflect in active session immediately.
  chatStore.activeSession.pageContent = draft.value;
  modalStore.closeContextEditor();
}

function download() {
  const blob = new Blob([draft.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${chatStore.activeSession?.title || "context"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <el-dialog v-model="visible" title="Page Context" width="900px" top="5vh" :close-on-click-modal="false">
    <div class="pce-toolbar">
      <el-radio-group v-model="mode" size="small">
        <el-radio-button value="edit">Edit</el-radio-button>
        <el-radio-button value="split">Split</el-radio-button>
        <el-radio-button value="preview">Preview</el-radio-button>
      </el-radio-group>
      <div class="pce-actions">
        <el-button size="small" :loading="modalStore.contextEditorBusy" @click="aiOptimize">AI Optimize</el-button>
        <el-button size="small" :loading="modalStore.contextEditorBusy" @click="aiTranslate('zh')">→ZH</el-button>
        <el-button size="small" :loading="modalStore.contextEditorBusy" @click="aiTranslate('en')">→EN</el-button>
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
        placeholder="Markdown context"
        class="pce-editor"
      />
      <div v-if="mode === 'split' || mode === 'preview'" class="pce-preview" v-html="previewHtml" />
    </div>
    <template #footer>
      <el-button @click="modalStore.closeContextEditor()">Close</el-button>
      <el-button type="primary" @click="save">Save</el-button>
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
