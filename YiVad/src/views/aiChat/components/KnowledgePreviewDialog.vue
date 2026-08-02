<script setup lang="ts" name="aiChatKnowledgePreviewDialog">
import { ref, computed, watch } from "vue";
import { ChatDotRound } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useResizable } from "@/hooks/useResizable";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import KnowledgeChatPanel from "./KnowledgeChatPanel.vue";

const { render } = useMarkdown();

const visible = ref(false);
const title = ref("");
const loading = ref(false);
const saving = ref(false);
const currentPath = ref("");

/** Saved content from the server — shown in "preview" mode. */
const rawContent = ref("");

/** Working draft — shown in the editor (edit/split modes). */
const editContent = ref("");

const mode = ref<"preview" | "edit" | "split">("preview");

/** Chat panel toggle — when on, the body splits left (preview/edit) + right (chat). */
const showChat = ref(false);

/** System prompt fed to the embedded chat — the knowledge file content. */
const chatSystemPrompt = computed(() => {
  if (!showChat.value || !rawContent.value) return "";
  return `You are analyzing the following knowledge file: ${currentPath.value}\n\n---\n${rawContent.value}\n---\n\nAnswer questions about this file.`;
});

const previewHtml = computed(() => render(editContent.value));
const savedPreviewHtml = computed(() => render(rawContent.value));

// ── Chat panel width (draggable) ──

const {
  width: chatWidth,
  isResizing: isChatResizing,
  startResize: startChatResize
} = useResizable(480, 320, 900, "aiChat.knowledgeChatW", true);

function open(path: string) {
  visible.value = true;
  currentPath.value = path;
  title.value = path.split("/").pop() || path;
  mode.value = "preview";
  showChat.value = false;
  loading.value = true;
  rawContent.value = "";
  editContent.value = "";
  readKnowledgeFile(path)
    .then(res => {
      rawContent.value = res.content || "";
    })
    .catch(() => {
      rawContent.value = "*Failed to load content.*";
    })
    .finally(() => {
      loading.value = false;
    });
}

function close() {
  visible.value = false;
  mode.value = "preview";
  showChat.value = false;
}

// Seed the editor from saved content when switching away from preview
watch(mode, (_new, old) => {
  if (old === "preview" && _new !== "preview") {
    editContent.value = rawContent.value;
  }
});

async function save() {
  if (saving.value || !currentPath.value) return;
  saving.value = true;
  try {
    await writeKnowledgeFile(currentPath.value, editContent.value);
    rawContent.value = editContent.value;
    mode.value = "preview";
    ElMessage.success("Saved");
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to save");
  } finally {
    saving.value = false;
  }
}

function cancelEdit() {
  mode.value = "preview";
}

function toggleChat() {
  showChat.value = !showChat.value;
  // In chat mode, force preview so the LLM sees the saved content
  if (showChat.value && mode.value !== "preview") {
    mode.value = "preview";
  }
}

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="91vw"
    top="4vh"
    :close-on-click-modal="true"
    append-to-body
    @close="close"
  >
    <!-- Toolbar: mode switch + actions -->
    <div class="kpd-toolbar">
      <el-radio-group v-model="mode" size="small" :disabled="showChat">
        <el-radio-button value="edit">Edit</el-radio-button>
        <el-radio-button value="split">Split</el-radio-button>
        <el-radio-button value="preview">Preview</el-radio-button>
      </el-radio-group>
      <div class="kpd-actions">
        <el-button
          v-if="mode === 'edit' || mode === 'split'"
          size="small"
          text
          @click="cancelEdit"
        >Cancel</el-button>
        <el-button
          v-if="mode === 'edit' || mode === 'split'"
          type="primary"
          size="small"
          :loading="saving"
          @click="save"
        >Save</el-button>
        <el-button
          :type="showChat ? 'primary' : 'default'"
          :icon="ChatDotRound"
          size="small"
          text
          :title="showChat ? 'Hide chat' : 'Chat about this file'"
          @click="toggleChat"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="kpd-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
      <span>Loading...</span>
    </div>

    <!-- Body -->
    <template v-else>
      <!-- Chat mode: left panel (preview) + resizer + chat panel -->
      <div v-if="showChat" class="kpd-body kpd-body--chat" :class="{ 'is-resizing': isChatResizing }">
        <div class="kpd-left">
          <div class="kpd-preview" v-html="savedPreviewHtml" />
        </div>
        <div
          class="kpd-resizer"
          :class="{ 'is-active': isChatResizing }"
          @pointerdown="startChatResize"
        />
        <div class="kpd-right" :style="{ width: chatWidth + 'px' }">
          <KnowledgeChatPanel
            :file-path="currentPath"
            :system-prompt="chatSystemPrompt"
            :rag-scope="currentPath"
          />
        </div>
      </div>

      <!-- Standard mode: no chat panel -->
      <div v-else class="kpd-body" :class="`kpd-body--${mode}`">
        <!-- Editor pane (edit + split modes) -->
        <el-input
          v-if="mode === 'edit' || mode === 'split'"
          v-model="editContent"
          type="textarea"
          class="kpd-editor"
          placeholder="Markdown content"
        />
        <!-- Preview pane (split + preview modes) -->
        <div
          v-if="mode === 'split' || mode === 'preview'"
          class="kpd-preview"
          v-html="mode === 'preview' ? savedPreviewHtml : previewHtml"
        />
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.kpd-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.kpd-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.kpd-loading {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.kpd-body {
  display: flex;
  gap: 8px;
  height: calc(100vh - 140px - 8vh);
  min-height: 0;

  // Hide editor in preview-only mode
  &--preview .kpd-editor {
    display: none;
  }
  // Hide preview in edit-only mode
  &--edit .kpd-preview {
    display: none;
  }
}

// ── Chat layout ──

.kpd-body--chat {
  gap: 0;

  &.is-resizing {
    user-select: none;
  }
}

.kpd-left {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kpd-right {
  flex-shrink: 0;
  overflow: hidden;
}

.kpd-resizer {
  width: 4px;
  flex-shrink: 0;
  cursor: col-resize;
  background: var(--el-border-color-lighter);
  transition: background 0.15s;

  &:hover,
  &.is-active {
    background: var(--el-color-primary-light-7);
  }
}

.kpd-editor {
  flex: 1;
  min-height: 0;

  :deep(.el-textarea__inner) {
    height: 100% !important;
    resize: none;
  }
}

.kpd-preview {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 1em 0 0.5em;
  }
  :deep(h1) { font-size: 1.5em; }
  :deep(h2) { font-size: 1.3em; }
  :deep(h3) { font-size: 1.15em; }
  :deep(p) { margin: 0.5em 0; }
  :deep(pre) {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
  }
  :deep(code) {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  :deep(table) {
    border-collapse: collapse;
  }
  :deep(th), :deep(td) {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }
}
</style>
