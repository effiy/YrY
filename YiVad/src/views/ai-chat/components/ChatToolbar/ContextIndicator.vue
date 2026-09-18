<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { CollectionTag, Delete, Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useAiChatStore } from "@/stores/modules/aiChat";

const props = withDefaults(
  defineProps<{
    contextFiles?: string[];
    ragToggle?: boolean;
  }>(),
  { contextFiles: () => [], ragToggle: false }
);

const emit = defineEmits<{
  (e: "remove-file", path: string): void;
  (e: "open-file", path: string): void;
}>();

const store = useAiChatStore();
const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

const contextPopoverVisible = ref(false);
const contextFileCount = computed(() => (props.contextFiles ?? []).length);

const ragAutoScoped = computed(() => !!(props.ragToggle && contextFileCount.value));
const ragNoContext = computed(() => props.ragToggle && !contextFileCount.value);

function handleFileClick(path: string) {
  openKnowledgePreview(path);
  contextPopoverVisible.value = false;
}

// ── Edit context file content ──

const editingFile = ref<string | null>(null);
const editingContent = ref("");

function openEditor(path: string) {
  editingFile.value = path;
  editingContent.value = store.getContextSectionContent(path) || "";
}

async function saveEdit() {
  const path = editingFile.value;
  if (!path) return;
  await store.applyContextChange(path, editingContent.value);
  editingFile.value = null;
  ElMessage.success(`Updated: ${path}`);
}

function cancelEdit() {
  editingFile.value = null;
}
</script>

<template>
  <el-popover v-if="contextFileCount > 0" v-model:visible="contextPopoverVisible" placement="bottom" :width="420" trigger="click">
    <template #reference>
      <div class="ct-pill on" title="Current context files">
        <el-icon :size="14"><CollectionTag /></el-icon>
        <span class="ct-pill-label">Context: {{ contextFileCount }}</span>
      </div>
    </template>

    <!-- File list -->
    <div class="ct-context-list">
      <div v-for="file in contextFiles ?? []" :key="file" class="ct-context-item">
        <span class="ct-context-item-path" title="Click to preview" @click="handleFileClick(file)">{{ file }}</span>
        <el-button size="small" text :icon="Edit" title="Edit context content" @click="openEditor(file)" />
        <el-button
          size="small"
          text
          type="danger"
          :icon="Delete"
          title="Remove from context"
          @click="emit('remove-file', file)"
        />
      </div>
      <div v-if="(contextFiles ?? []).length === 0" class="ct-context-empty">No context files loaded</div>
    </div>

    <!-- Inline edit dialog -->
    <div v-if="editingFile" class="ct-edit-section">
      <div class="ct-edit-header">
        <span class="ct-edit-path">{{ editingFile }}</span>
        <span class="ct-edit-hint">Editing context content — changes persist to this session</span>
      </div>
      <el-input
        v-model="editingContent"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 12 }"
        placeholder="Enter file content for context..."
      />
      <div class="ct-edit-actions">
        <el-button size="small" @click="cancelEdit">Cancel</el-button>
        <el-button size="small" type="primary" @click="saveEdit">Save</el-button>
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.ct-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--el-border-color);
  }
  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.ct-pill-label {
  line-height: 1;
}
.ct-context-list {
  max-height: 240px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb);
    border-radius: 2px;
    &:hover { background: var(--el-border-color-darker); }
  }
}
.ct-context-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 6px 4px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;

  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
.ct-context-item-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-color-primary);
  white-space: nowrap;
  cursor: pointer;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.8;
  }
}
.ct-context-empty {
  padding: 12px 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

// ── Edit section ──
.ct-edit-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.ct-edit-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ct-edit-path {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.ct-edit-hint {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.ct-edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
