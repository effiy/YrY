<script setup lang="ts" name="aiChatConversationSidebar">
import { computed } from "vue";
import { ElMessageBox } from "element-plus";
import { Plus, Delete, Operation } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import type { FileNode } from "@/stores/modules/aicr/fileTree";
import ConversationListItem from "./ConversationListItem.vue";

const store = useAiChatStore();

const elTreeData = computed(() => buildElTree(store.filteredConversationTree));

interface TreeNode {
  key: string;
  label: string;
  type: string;
  session?: any;
  children?: TreeNode[];
}

function buildElTree(nodes: FileNode[]): TreeNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map(n => ({
    key: n.key,
    label: n.name,
    type: n.type,
    session: n.session,
    children: n.children ? buildElTree(n.children) : undefined
  }));
}

const defaultExpandedKeys = computed(() => {
  const allKeys: string[] = [];
  const walk = (nodes: FileNode[]) => {
    for (const n of nodes) {
      if (n.type === "folder") allKeys.push(n.key);
      if (n.children) walk(n.children);
    }
  };
  walk(store.filteredConversationTree);
  return allKeys;
});

const selectedCount = computed(() => store.selectedKeys.size);

function isActive(key: string) {
  return store.activeConversation?.key === key;
}

function handleNodeClick(data: TreeNode) {
  if (data.type === "file") store.selectConversation(data.session?.key ?? data.key);
  else store.toggleFolder(data.key);
}

async function onNew() {
  const res = await ElMessageBox.prompt("Enter a title (optional)", "New conversation", {
    confirmButtonText: "Create",
    cancelButtonText: "Cancel",
    inputPlaceholder: "New chat"
  }).catch(() => null);
  if (!res) return;
  await store.createConversation(res.value?.trim() || "New chat");
}

async function onRename(key: string, currentTitle: string) {
  const res = await ElMessageBox.prompt("Enter a new title", "Rename conversation", {
    confirmButtonText: "Save",
    cancelButtonText: "Cancel",
    inputValue: currentTitle
  }).catch(() => null);
  if (!res) return;
  await store.renameConversation(key, res.value?.trim() || currentTitle);
}

async function onDelete(key: string, title: string) {
  const res = await ElMessageBox.confirm(`Delete conversation "${title}"?`, "Confirm delete", {
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    type: "warning"
  }).catch(() => null);
  if (!res) return;
  await store.deleteConversation(key);
}

async function onBulkDelete() {
  if (selectedCount.value === 0) return;
  const res = await ElMessageBox.confirm(
    `Delete ${selectedCount.value} selected conversation(s)?`,
    "Confirm delete",
    { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
  ).catch(() => null);
  if (!res) return;
  await store.bulkDelete();
}
</script>

<template>
  <div class="cs-sidebar">
    <div class="cs-header">
      <el-input v-model="store.searchQuery" placeholder="Search conversations..." clearable size="small" />
      <el-button type="primary" :icon="Plus" size="small" title="New conversation" aria-label="New conversation" @click="onNew" />
      <el-button
        v-if="!store.batchMode"
        size="small"
        :icon="Operation"
        title="Batch manage conversations"
        aria-label="Batch manage"
        @click="store.toggleBatchMode()"
      />
    </div>

    <div class="cs-list">
      <div v-if="store.loading && !store.conversations.length" class="cs-empty">Loading...</div>
      <div v-else-if="!elTreeData.length" class="cs-empty">
        {{ store.searchQuery ? "No matching conversations" : "No conversations" }}
      </div>
      <el-tree
        v-else
        :data="elTreeData"
        :props="{ children: 'children', label: 'label' }"
        :default-expanded-keys="defaultExpandedKeys"
        node-key="key"
        highlight-current
        :expand-on-click-node="true"
        @node-click="handleNodeClick"
        size="small"
      >
        <template #default="{ data }">
          <ConversationListItem
            v-if="data.type === 'file' && data.session"
            :conversation="data.session"
            :active="isActive(data.session.key)"
            @select="store.selectConversation"
            @rename="onRename"
            @delete="onDelete"
            @toggle-favorite="store.toggleFavorite"
          />
          <span v-else class="cs-folder">{{ data.label }}</span>
        </template>
      </el-tree>
    </div>

    <div v-if="store.batchMode" class="cs-batch-bar">
      <span class="cs-batch-count">{{ selectedCount }} selected</span>
      <el-button
        size="small"
        type="danger"
        :icon="Delete"
        :disabled="selectedCount === 0"
        @click="onBulkDelete"
      >Delete selected</el-button>
      <el-button size="small" @click="store.toggleBatchMode()">Cancel</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cs-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}
.cs-header {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.cs-batch-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
}
.cs-batch-count {
  flex: 1;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cs-list {
  flex: 1;
  padding: 4px 0;
  overflow-y: auto;
}
.cs-empty {
  padding: 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.cs-folder {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
:deep(.el-tree-node__content) {
  height: auto;
  min-height: 32px;
}
</style>
