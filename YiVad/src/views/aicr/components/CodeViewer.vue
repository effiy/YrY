<script setup lang="ts" name="aicrCodeViewer">
import { computed, ref, watch, nextTick } from "vue";
import screenfull from "screenfull";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import { writeFile } from "@/api/modules/fileService";

const fileTreeStore = useAicrFileTreeStore();
const knowledgeStore = useAicrKnowledgeStore();

// Two trees can populate the viewer: the session-based FileTree (story /
// scenario Code Review flow) and the YiKnowledge KnowledgeTree. Track which
// one was clicked last so the viewer follows the user's actual selection
// instead of always preferring whichever store happens to have a non-null
// selectedKey.
const lastSource = ref<"file" | "knowledge">("file");
watch(
  () => fileTreeStore.selectedKey,
  k => {
    if (k) lastSource.value = "file";
  }
);
watch(
  () => knowledgeStore.selectedPath,
  p => {
    if (p) lastSource.value = "knowledge";
  }
);

const selectedPath = computed<string | null>(() =>
  lastSource.value === "file" ? fileTreeStore.selectedKey : knowledgeStore.selectedPath
);
const currentContent = computed<string>(() =>
  lastSource.value === "file"
    ? fileTreeStore.currentFileContent ?? ""
    : knowledgeStore.currentFile?.content ?? ""
);
const fileLoading = computed<boolean>(() =>
  lastSource.value === "file" ? fileTreeStore.fileLoading : knowledgeStore.fileLoading
);

const selectedFileName = computed(() => {
  const path = selectedPath.value;
  if (!path) return null;
  return path.split("/").pop() || path;
});

const isImage = computed(() => {
  const path = selectedPath.value;
  if (!path) return false;
  return /\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i.test(path);
});

const contentLines = computed(() => {
  const c = currentContent.value;
  return c ? c.split("\n") : [];
});

// Edit mode
const editMode = ref(false);
const editDraft = ref("");
const editDirty = ref(false);
const saving = ref(false);

function enterEdit() {
  editDraft.value = currentContent.value;
  editDirty.value = false;
  editMode.value = true;
}

function cancelEdit() {
  editMode.value = false;
  editDraft.value = "";
  editDirty.value = false;
}

async function saveEdit() {
  if (!selectedPath.value) return;
  saving.value = true;
  try {
    await writeFile(selectedPath.value, editDraft.value);
    if (knowledgeStore.currentFile) knowledgeStore.currentFile.content = editDraft.value;
    if (lastSource.value === "file") fileTreeStore.currentFileContent = editDraft.value;
    editMode.value = false;
    editDirty.value = false;
  } finally {
    saving.value = false;
  }
}

// Fullscreen
const containerRef = ref<HTMLDivElement | null>(null);
function toggleFullscreen() {
  if (!containerRef.value) return;
  if (screenfull.isEnabled) screenfull.toggle(containerRef.value);
}

// URL params: line highlight (?startLine=&endLine=)
const highlightStart = ref<number | null>(null);
const highlightEnd = ref<number | null>(null);

function setHighlight(start: number | null, end: number | null) {
  highlightStart.value = start;
  highlightEnd.value = end;
  if (start !== null) {
    nextTick(() => {
      const el = document.querySelector(`.cv-line[data-line="${start}"]`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }
}

function isHighlighted(lineNum: number): boolean {
  if (highlightStart.value === null) return false;
  const end = highlightEnd.value ?? highlightStart.value;
  return lineNum >= highlightStart.value! && lineNum <= end;
}

watch(
  () => selectedPath.value,
  () => {
    editMode.value = false;
    highlightStart.value = null;
    highlightEnd.value = null;
  }
);

defineExpose({ setHighlight, selectedKey: () => selectedPath.value });
</script>

<template>
  <div ref="containerRef" class="aicr-code-viewer">
    <div v-if="!selectedPath" class="cv-empty">
      <el-empty description="Select a file from the tree" />
    </div>
    <div v-else-if="fileLoading" class="cv-loading">
      <el-skeleton :rows="8" animated />
    </div>
    <div v-else class="cv-content">
      <div class="cv-header">
        <span class="cv-file-name">{{ selectedFileName }}</span>
        <span class="cv-file-path">{{ selectedPath }}</span>
        <div class="cv-header-actions">
          <el-button v-if="!editMode" size="small" @click="toggleFullscreen" title="Fullscreen">
            <el-icon><FullScreen /></el-icon>
          </el-button>
          <el-button v-if="!editMode" size="small" type="primary" @click="enterEdit">Edit</el-button>
          <template v-else>
            <el-button size="small" :disabled="saving" @click="cancelEdit">Cancel</el-button>
            <el-button size="small" type="primary" :loading="saving" :disabled="!editDirty" @click="saveEdit">Save</el-button>
          </template>
        </div>
      </div>
      <div v-if="editMode" class="cv-edit-unsaved" :class="{ 'is-dirty': editDirty }">
        ● {{ editDirty ? "Unsaved changes" : "No changes" }}
      </div>

      <!-- Image preview -->
      <div v-if="isImage && !editMode" class="cv-image-wrap">
        <el-image
          :src="currentContent"
          fit="contain"
          :preview-src-list="[currentContent]"
          hide-on-click-modal
          class="cv-image"
        />
      </div>

      <!-- Edit mode -->
      <div v-else-if="editMode" class="cv-edit">
        <el-input
          v-model="editDraft"
          type="textarea"
          :autosize="{ minRows: 20 }"
          @input="editDirty = editDraft !== currentContent"
          placeholder="File content"
        />
      </div>

      <!-- View mode -->
      <div v-else class="cv-code">
        <pre><code><span
          v-for="(line, idx) in contentLines"
          :key="idx"
          class="cv-line"
          :data-line="idx + 1"
          :class="{ 'cv-line--hl': isHighlighted(idx + 1) }"
        ><span class="cv-line-num">{{ idx + 1 }}</span>{{ line }}</span></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aicr-code-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.cv-empty,
.cv-loading {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.cv-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}
.cv-header {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.cv-file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.cv-file-path {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.cv-header-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.cv-edit-unsaved {
  flex-shrink: 0;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-lighter);
}
.cv-edit-unsaved.is-dirty {
  color: var(--el-color-warning);
}
.cv-edit {
  flex: 1;
  padding: 8px;
  overflow: hidden;
}
.cv-edit :deep(.el-textarea__inner) {
  height: 100% !important;
  font-family: "SF Mono", Menlo, Monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
}
.cv-image-wrap {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 12px;
  overflow: auto;
  background: var(--el-fill-color-lighter);
}
.cv-image {
  max-width: 100%;
  max-height: 100%;
}
.cv-code {
  flex: 1;
  overflow: auto;
  background: var(--el-fill-color-lighter);
}
.cv-code pre {
  min-height: 100%;
  padding: 12px;
  margin: 0;
  font-family: "SF Mono", Menlo, Monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
}
.cv-code code {
  color: var(--el-text-color-primary);
}
.cv-line {
  display: block;
}
.cv-line:hover {
  background: var(--el-fill-color-light);
}
.cv-line--hl {
  padding-left: 6px;
  margin-left: -9px;
  background: var(--el-color-warning-light-9);
  border-left: 3px solid var(--el-color-warning);
}
.cv-line-num {
  display: inline-block;
  width: 40px;
  margin-right: 16px;
  color: var(--el-text-color-placeholder);
  text-align: right;
  user-select: none;
}
</style>
