<script setup lang="ts" name="ContextPopover">
import { inject, computed } from "vue";
import { Search, Plus, Check, Close, Delete, Edit, Document, Folder, FolderOpened } from "@element-plus/icons-vue";
import { useContextFiles } from "./useContextFiles";

const props = defineProps<{
  contextFiles: string[];
}>();

const emit = defineEmits<{
  (e: "remove-context-file", path: string): void;
}>();

const openKnowledgePreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

const {
  contextPopoverVisible,
  contextFileCount,
  toggleContextPopover,
  handleFileClick,
  contextDropOver,
  onContextDragOver,
  onContextDragEnter,
  onContextDragLeave,
  onContextDrop,
  editingContextFile,
  editingContent,
  openContextEditor,
  saveContextEdit,
  cancelContextEdit,
  contextPopoverTab,
  knowledgeSearch,
  knowledgeTree,
  knowledgeStore,
  knowledgeExpandedFolders,
  browseDisplayItems,
  toggleKnowledgeFolder,
  onKnowledgeFileClick,
  addFolderToContext,
  onContextPopoverShow
} = useContextFiles(
  computed(() => props.contextFiles),
  (e, path) => emit(e, path),
  openKnowledgePreview
);
</script>

<template>
  <el-popover :visible="contextPopoverVisible" placement="bottom" :width="520" @show="onContextPopoverShow">
    <template #reference>
      <div class="ct-pill" :class="{ on: contextFileCount > 0 }" title="Manage context files" @click="toggleContextPopover">
        <el-icon :size="14"><CollectionTag /></el-icon>
        <span class="ct-pill-label">Context{{ contextFileCount > 0 ? `: ${contextFileCount}` : "" }}</span>
      </div>
    </template>
    <!-- Close button -->
    <div class="ct-pop-close" @click="contextPopoverVisible = false">
      <el-icon :size="16"><Close /></el-icon>
    </div>
    <!-- Tabs -->
    <div class="ct-pop-tabs">
      <div class="ct-pop-tab" :class="{ active: contextPopoverTab === 'context' }" @click="contextPopoverTab = 'context'">
        Context{{ contextFileCount > 0 ? ` (${contextFileCount})` : "" }}
      </div>
      <div class="ct-pop-tab" :class="{ active: contextPopoverTab === 'browse' }" @click="contextPopoverTab = 'browse'">
        Browse
      </div>
    </div>

    <!-- Context tab -->
    <div v-if="contextPopoverTab === 'context'" class="ct-pop-panel">
      <template v-if="contextFileCount > 0">
        <div class="ct-context-list">
          <div v-for="file in contextFiles" :key="file" class="ct-context-item">
            <span class="ct-context-item-path" title="Click to preview" @click="handleFileClick(file)">{{ file }}</span>
            <el-button size="small" text :icon="Edit" title="Edit context content" @click="openContextEditor(file)" />
            <el-button size="small" text type="danger" :icon="Delete" title="Remove from context" @click="emit('remove-context-file', file)" />
          </div>
        </div>
        <div v-if="editingContextFile" class="ct-edit-section">
          <div class="ct-edit-header">
            <span class="ct-edit-path">{{ editingContextFile }}</span>
            <span class="ct-edit-hint">Editing context content for this session</span>
          </div>
          <el-input v-model="editingContent" type="textarea" :autosize="{ minRows: 4, maxRows: 12 }" placeholder="Enter file content..." />
          <div class="ct-edit-actions">
            <el-button size="small" @click="cancelContextEdit">Cancel</el-button>
            <el-button size="small" type="primary" @click="saveContextEdit">Save</el-button>
          </div>
        </div>
        <div class="ct-context-drop" :class="{ 'is-over': contextDropOver }" @dragover="onContextDragOver" @dragenter="onContextDragEnter" @dragleave="onContextDragLeave" @drop="onContextDrop">
          <template v-if="contextDropOver">
            <span class="ct-context-drop-icon">📄</span>
            <span>Release to add</span>
          </template>
          <template v-else>
            <span class="ct-context-drop-hint">Drag files from Browse tab or type <code>@</code> in chat</span>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="ct-context-empty-state">
          <div class="ct-context-empty-icon">📄</div>
          <div class="ct-context-empty-title">No context files</div>
          <div class="ct-context-empty-desc">
            Browse knowledge files in the <b>Browse</b> tab and click to add them as context.
          </div>
        </div>
      </template>
    </div>

    <!-- Browse tab -->
    <div v-else class="ct-pop-panel">
      <div class="ct-browse-search">
        <el-input v-model="knowledgeSearch" placeholder="Filter knowledge files..." size="small" clearable :prefix-icon="Search" />
      </div>
      <el-scrollbar max-height="320px">
        <div v-if="knowledgeStore.loading && !knowledgeTree.length" class="ct-browse-loading">
          Loading knowledge files...
        </div>
        <div v-else-if="!knowledgeTree.length" class="ct-browse-empty">
          <template v-if="knowledgeSearch">No files match "{{ knowledgeSearch }}"</template>
          <template v-else>No knowledge files available. Sync from YiKnowledge to populate.</template>
        </div>
        <div v-else class="ct-browse-tree">
          <template v-for="item in browseDisplayItems" :key="item.node.key">
            <!-- Folder -->
            <div v-if="item.node.type === 'folder'" class="ct-browse-folder" :style="{ paddingLeft: item.depth * 16 + 8 + 'px' }">
              <span class="ct-browse-folder-toggle" @click="toggleKnowledgeFolder(item.node.key)">
                <el-icon :size="14">
                  <FolderOpened v-if="knowledgeExpandedFolders.has(item.node.key)" />
                  <Folder v-else />
                </el-icon>
                <span class="ct-browse-folder-label">{{ item.node.label }}</span>
                <span class="ct-browse-folder-count">{{ item.node.children?.length ?? 0 }}</span>
              </span>
              <el-button size="small" type="primary" :icon="Plus" title="Add all files in folder to context" @click.stop="addFolderToContext(item.node)" />
            </div>
            <!-- File -->
            <div v-else class="ct-browse-file" :class="{ 'is-in-context': contextFiles?.includes(item.node.path) }" :style="{ paddingLeft: item.depth * 16 + 8 + 'px' }">
              <el-icon :size="13"><Document /></el-icon>
              <div class="ct-browse-file-info">
                <span class="ct-browse-file-label" :title="`Preview: ${item.node.path}`" @click="openKnowledgePreview(item.node.path)">{{ item.node.label }}</span>
                <span class="ct-browse-file-path">{{ item.node.path }}</span>
              </div>
              <el-button v-if="contextFiles?.includes(item.node.path)" size="small" text type="success" :icon="Check" title="Already in context" disabled />
              <el-button v-else size="small" type="primary" :icon="Plus" title="Add to context" @click.stop="onKnowledgeFileClick(item.node)" />
            </div>
          </template>
        </div>
      </el-scrollbar>
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
}
.ct-context-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
}
.ct-context-item + .ct-context-item {
  border-top: 1px solid var(--el-border-color-lighter);
}
.ct-context-item-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-color-primary);
  white-space: nowrap;
  cursor: pointer;
}
.ct-context-item-path:hover {
  text-decoration: underline;
}
.ct-context-empty-state {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 16px 8px;
  text-align: center;
}
.ct-context-empty-icon {
  font-size: 32px;
}
.ct-context-empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.ct-context-empty-desc {
  max-width: 320px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
.ct-context-drop {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  border: 2px dashed var(--el-border-color);
  border-radius: 6px;
  transition: border-color 0.15s, background 0.15s;
  &.is-over {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}
.ct-context-drop-icon {
  font-size: 20px;
}
.ct-context-drop-hint code {
  padding: 1px 4px;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-fill-color);
  border-radius: 3px;
}
.ct-pop-close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}
.ct-pop-tabs {
  position: relative;
  display: flex;
  gap: 0;
  padding-right: 28px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ct-pop-tab {
  flex: 1;
  padding: 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-align: center;
  cursor: pointer;
  user-select: none;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
  &:hover {
    color: var(--el-text-color-primary);
  }
  &.active {
    color: var(--el-color-primary);
    border-bottom-color: var(--el-color-primary);
  }
}
.ct-pop-panel {
  min-height: 120px;
}
.ct-browse-search {
  margin-bottom: 6px;
}
.ct-browse-loading,
.ct-browse-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.ct-browse-tree {
  padding: 2px 0;
}
.ct-browse-folder {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  font-size: 13px;
  user-select: none;
  border-radius: 4px;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.ct-browse-folder-toggle {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  min-width: 0;
  font-weight: 600;
  color: var(--el-text-color-primary);
  cursor: pointer;
}
.ct-browse-folder-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ct-browse-folder-count {
  flex-shrink: 0;
  padding: 0 6px;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 8px;
}
.ct-browse-file {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 8px 4px 24px;
  border-radius: 4px;
  transition: background var(--transition-instant);
  &:hover {
    background: var(--el-fill-color-light);
  }
  &.is-in-context {
    background: var(--el-color-success-light-9);
  }
}
.ct-browse-file-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.ct-browse-file-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
    text-decoration: underline;
  }
}
.ct-browse-file-path {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}
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