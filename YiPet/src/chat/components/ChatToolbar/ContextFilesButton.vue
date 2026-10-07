<script setup lang="ts">
/**
 * YiPet Chat — ContextFilesButton
 * Pill button showing active context file count, with a popover for
 * context file list (flat, mirrors YiVad's ContextPopover) and a
 * Browse tab for adding knowledge files. Inline editor support.
 *
 * Visual language aligned with YiVad aiChat ContextPopover:
 * - CollectionTag icon + inline "Context: N" label
 * - Custom underline tabs (not el-tabs)
 * - Close button in popover
 * - Folder child-count badges in browse tree
 * - is-in-context green highlight for added files
 */
import {
  Check, Close, CollectionTag, Delete, Document, Edit, Folder, FolderOpened,
  Loading, Plus, Search
} from '@element-plus/icons-vue';
import { useChatStore } from '../../stores/chat';
import { t } from '@/shared/i18n';
import { useContextFiles } from './useContextFiles';

const store = useChatStore();
const s = store.state;

const {
  showContextPopover,
  contextPopoverTab,
  contextFiles,
  contextFileCount,
  contextDropOver,
  onCtxDragEnter,
  onCtxDragOver,
  onCtxDragLeave,
  onCtxDrop,
  ctxEditorOpen,
  ctxEditorPath,
  ctxEditorContent,
  ctxEditorOriginal,
  ctxEditorLoading,
  ctxEditorSaving,
  openCtxEditor,
  closeCtxEditor,
  saveCtxEditor,
  cancelCtxEditor,
  knowledgeSearch,
  knowledgeExpandedFolders,
  browseItems,
  toggleKnowledgeFolder,
  addSingleToContext,
  addFolderToContext,
  onContextPopoverShow,
  handleContextFileClick,
  removeContextFile,
  fileHealthIssues,
  knowledgeLoading,
  knowledgeError,
  knowledgeLoaded,
} = useContextFiles();
</script>

<template>
  <!-- Context files pill + popover (mirrors YiVad ContextPopover) -->
  <el-popover
    v-model:visible="showContextPopover"
    popper-class="ct-tb-popper"
    placement="bottom"
    :width="420"
    trigger="click"
    @show="onContextPopoverShow"
  >
    <template #reference>
      <div
        class="ct-pill"
        :class="{ on: contextFileCount > 0 }"
        :title="contextFileCount
          ? `${contextFileCount} context file${contextFileCount !== 1 ? 's' : ''}`
          : t('chatActiveContext')"
      >
        <el-icon :size="14"><CollectionTag /></el-icon>
        <span class="ct-pill-label">Context{{ contextFileCount > 0 ? `: ${contextFileCount}` : '' }}</span>
      </div>
    </template>

    <!-- Close button (mirrors YiVad ContextPopover) -->
    <div class="ct-pop-close" @click="showContextPopover = false">
      <el-icon :size="16"><Close /></el-icon>
    </div>

    <!-- Custom tabs (mirrors YiVad ContextPopover) -->
    <div class="ct-pop-tabs">
      <div
        class="ct-pop-tab"
        :class="{ active: contextPopoverTab === 'context' }"
        @click="contextPopoverTab = 'context'"
      >
        Context{{ contextFileCount > 0 ? ` (${contextFileCount})` : '' }}
      </div>
      <div
        class="ct-pop-tab"
        :class="{ active: contextPopoverTab === 'browse' }"
        @click="contextPopoverTab = 'browse'"
      >
        Browse
        <span
          v-if="fileHealthIssues.total > 0"
          class="kb-alert-badge"
          :class="{ 'kb-alert-badge--critical': fileHealthIssues.stale.length > 0 }"
        >{{ fileHealthIssues.total }}</span>
      </div>
    </div>

    <!-- Context tab: flat file list + DnD zone (mirrors YiVad) -->
    <div v-if="contextPopoverTab === 'context'" class="ct-pop-panel">
      <template v-if="contextFileCount > 0">
        <div class="ct-context-list">
          <div v-for="file in contextFiles" :key="file" class="ct-context-item">
            <span
              class="ct-context-item-path"
              title="Click to preview"
              @click="handleContextFileClick(file)"
            >{{ file }}</span>
            <el-button
              size="small" text :icon="Edit"
              title="Edit context content"
              @click.stop="openCtxEditor(file)"
            />
            <el-button
              size="small" text type="danger" :icon="Delete"
              title="Remove from context"
              @click.stop="removeContextFile(file)"
            />
          </div>
        </div>

        <!-- Inline editor -->
        <div v-if="ctxEditorOpen" class="ct-edit-section">
          <div class="ct-edit-header">
            <span class="ct-edit-path">{{ ctxEditorPath }}</span>
            <span class="ct-edit-hint">Editing context content for this session</span>
          </div>
          <el-input
            v-model="ctxEditorContent"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 12 }"
            placeholder="Enter file content..."
          />
          <div class="ct-edit-actions">
            <el-button size="small" @click="cancelCtxEditor">Cancel</el-button>
            <el-button size="small" type="primary" :loading="ctxEditorSaving" @click="saveCtxEditor">Save</el-button>
          </div>
        </div>

        <!-- DnD drop zone (bottom) -->
        <div
          class="ct-context-drop"
          :class="{ 'is-over': contextDropOver }"
          @dragover="onCtxDragOver"
          @dragenter="onCtxDragEnter"
          @dragleave="onCtxDragLeave"
          @drop="onCtxDrop"
        >
          <template v-if="contextDropOver">
            <span class="ct-context-drop-icon">📄</span>
            <span>Release to add</span>
          </template>
          <template v-else>
            <span class="ct-context-drop-hint">Drag files from Browse tab or type <code>@</code> in chat</span>
          </template>
        </div>
      </template>

      <!-- Empty state (mirrors YiVad) -->
      <div v-else class="ct-context-empty-state">
        <div class="ct-context-empty-icon">📄</div>
        <div class="ct-context-empty-title">No context files</div>
        <div class="ct-context-empty-desc">
          Browse knowledge files in the <b>Browse</b> tab and click to add them as context.
        </div>
      </div>
    </div>

    <!-- Browse tab: knowledge tree browser -->
    <div v-else class="ct-pop-panel">
      <div class="ct-browse-search">
        <el-input
          v-model="knowledgeSearch"
          size="small"
          clearable
          :prefix-icon="Search"
          placeholder="Filter knowledge files..."
        />
      </div>

      <!-- Loading -->
      <div v-if="knowledgeLoading" class="ct-browse-status">
        <el-icon :size="16" class="ct-spin"><Loading /></el-icon>
        <span>Loading knowledge files...</span>
      </div>

      <!-- Error -->
      <div v-else-if="knowledgeError" class="ct-browse-status ct-browse-status--err">
        <span>{{ knowledgeError }}</span>
        <el-button size="small" text type="primary" @click="store.loadKnowledgeTree()">Retry</el-button>
      </div>

      <!-- Empty -->
      <div v-else-if="!browseItems.length" class="ct-browse-empty">
        <template v-if="knowledgeSearch">No files match "{{ knowledgeSearch }}"</template>
        <template v-else>No knowledge files available. Sync from YiKnowledge to populate.</template>
      </div>

      <!-- Tree (mirrors YiVad ContextPopover browse tree) -->
      <div v-else class="ct-browse-tree">
        <template v-for="item in browseItems" :key="item.node.key">
          <!-- Folder -->
          <div
            v-if="item.node.type === 'folder'"
            class="ct-browse-folder"
            :style="{ paddingLeft: item.depth * 16 + 8 + 'px' }"
          >
            <span class="ct-browse-folder-toggle" @click="toggleKnowledgeFolder(item.node.key)">
              <el-icon :size="14">
                <FolderOpened v-if="knowledgeExpandedFolders.has(item.node.key)" />
                <Folder v-else />
              </el-icon>
              <span class="ct-browse-folder-label">{{ item.node.name }}</span>
              <span class="ct-browse-folder-count">{{ item.node.children?.length ?? 0 }}</span>
            </span>
            <el-button
              size="small" text :icon="Plus"
              title="Add all files in folder to context"
              @click.stop="addFolderToContext(item.node)"
            />
          </div>

          <!-- File -->
          <div
            v-else
            class="ct-browse-file"
            :class="{ 'is-in-context': contextFiles?.includes(item.node.path) }"
            :style="{ paddingLeft: item.depth * 16 + 8 + 'px' }"
          >
            <el-icon :size="13"><Document /></el-icon>
            <div class="ct-browse-file-info">
              <span
                class="ct-browse-file-label"
                :title="`Preview: ${item.node.path}`"
                @click="handleContextFileClick(item.node.path)"
              >{{ item.node.name }}</span>
              <span class="ct-browse-file-path">{{ item.node.path }}</span>
            </div>
            <el-button
              v-if="contextFiles?.includes(item.node.path)"
              size="small" text type="success" :icon="Check"
              title="Already in context" disabled
            />
            <el-button
              v-else
              size="small" text :icon="Plus"
              title="Add to context"
              @click.stop="addSingleToContext(item.node.path)"
            />
          </div>
        </template>
      </div>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
// ── Pill button (matches YiVad ContextIndicator .ct-pill) ──
// Must be defined here because parent ChatToolbar's scoped toolbar.scss
// does not penetrate into child component internals.
.ct-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  letter-spacing: 0.01em;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 50%);
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;

  &:hover {
    color: var(--el-text-color-regular);
    border-color: var(--el-border-color);
    background: var(--el-fill-color-light);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 60%),
      0 2px 6px rgb(0 0 0 / 6%);
    transform: translateY(-0.5px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 2px rgb(0 0 0 / 6%);
  }

  &.on {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 40%),
      0 0 0 1px var(--el-color-primary-light-5);

    &:hover {
      background: var(--el-color-primary-light-8);
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 40%),
        0 0 0 1px var(--el-color-primary-light-5),
        0 2px 8px var(--el-color-primary-light-5);
    }
  }
}
.ct-pill-label {
  line-height: 1;
  font-weight: 500;
}

// ── Close button (mirrors YiVad ContextPopover) ──
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

// ── Custom popover tabs (mirrors YiVad ContextPopover) ──
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
  transition: all 0.15s;
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

// ── Flat context file list ──
.ct-context-list {
  max-height: 240px;
  overflow-y: auto;
}
.ct-context-item {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 12px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.ct-context-item-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-color-primary);
  white-space: nowrap;
  cursor: pointer;
  &:hover { text-decoration: underline; }
}

// ── Empty state (mirrors YiVad) ──
.ct-context-empty-state {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 16px 8px;
  text-align: center;
}
.ct-context-empty-icon { font-size: 32px; }
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

// ── DnD drop zone (mirrors YiVad) ──
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
.ct-context-drop-icon { font-size: 20px; }
.ct-context-drop-hint code {
  padding: 1px 4px;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-fill-color);
  border-radius: 3px;
}

// ── Inline edit section (mirrors YiVad) ──
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
  font-family: 'SF Mono', Menlo, monospace;
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

// ── Browse tree ──
.ct-browse-search { margin-bottom: 6px; }
.ct-browse-tree { padding: 2px 0; }
.ct-browse-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  &--err { color: var(--el-color-danger); flex-direction: column; gap: 4px; }
}
.ct-browse-empty {
  padding: 24px 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

.ct-spin {
  animation: ct-spin 1s linear infinite;
}

@keyframes ct-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// ── Browse folder (mirrors YiVad) ──
.ct-browse-folder {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  font-size: 13px;
  user-select: none;
  border-radius: 4px;
  &:hover { background: var(--el-fill-color-light); }
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

// ── Browse file (mirrors YiVad) ──
.ct-browse-file {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 8px 4px 24px;
  border-radius: 4px;
  transition: background 0.1s;
  &:hover { background: var(--el-fill-color-light); }
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
  &:hover { color: var(--el-color-primary); text-decoration: underline; }
}
.ct-browse-file-path {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

// ── Knowledge health badge ──
.kb-alert-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  margin-left: 4px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  background: rgba(230,162,60,.15);
  color: #e6a23c;
  vertical-align: middle;
  &--critical {
    background: rgba(245,108,108,.15);
    color: #f56c6c;
  }
}
</style>