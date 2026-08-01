<script setup lang="ts" name="aiChatConversationSidebar">
import { computed, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { Plus, Delete, Operation } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";

const store = useAiChatStore();
const knowledgeStore = useAicrKnowledgeStore();

// ── Tree: directory-based, mirrors aicr KnowledgeTree ──

interface TreeNode {
  key: string;
  label: string;
  type: "folder" | "file";
  entry?: KnowledgeFileEntry;
  children?: TreeNode[];
}

const treeData = computed<TreeNode[]>(() => {
  const filtered = knowledgeStore.filteredCategories;
  const rootChildren: TreeNode[] = [];
  const folderMap = new Map<string, TreeNode>();

  for (const cat of filtered) {
    for (const f of cat.files) {
      const parts = f.path.split("/").filter(Boolean);
      if (parts.length === 0) continue;

      let siblings = rootChildren;
      let prefix = "";
      for (let i = 0; i < parts.length; i++) {
        const segment = parts[i];
        prefix = prefix ? `${prefix}/${segment}` : segment;
        const isLeaf = i === parts.length - 1;
        if (isLeaf) {
          siblings.push({
            key: f.path,
            label: f.name,
            type: "file",
            entry: f
          });
        } else {
          let folder = folderMap.get(prefix);
          if (!folder) {
            folder = {
              key: `folder:${prefix}`,
              label: segment,
              type: "folder",
              children: []
            };
            folderMap.set(prefix, folder);
            siblings.push(folder);
          }
          siblings = folder.children!;
        }
      }
    }
  }

  // Sort siblings by name — same as KnowledgeTree's on-disk ordering
  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
    for (const n of nodes) if (n.children) sortTree(n.children);
  };
  sortTree(rootChildren);
  return rootChildren;
});

const defaultExpandedKeys = computed(() => {
  const keys: string[] = [];
  for (const n of treeData.value) {
    if (n.type === "folder") keys.push(n.key);
  }
  return keys;
});

onMounted(() => {
  knowledgeStore.loadAll();
});

// ── Node click: ensure session → select for chat ──

async function handleNodeClick(data: TreeNode) {
  if (data.type === "file" && data.entry) {
    const path = data.entry.path;
    const content = data.entry.meta?.content as string || "";
    const title = (data.entry.meta?.title as string) || data.entry.name;
    const tags = (data.entry.meta?.tags as string[]) || [];

    // Ensure a session document exists so chat context is wired up
    await knowledgeStore.ensureKnowledgeSession(path, content, { title, tags });
    // Select the session for chatting (mirrors aicr's watcher: knowledgePath → chatSession)
    await store.selectConversation(path);
  }
}

function isActive(path: string) {
  return store.activeConversation?.key === path;
}

// ── Conversation operations ──

const selectedCount = computed(() => store.selectedKeys.size);

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

function fmtSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div class="cs-sidebar">
    <div class="cs-header">
      <el-input v-model="knowledgeStore.searchQuery" placeholder="Search knowledge..." clearable size="small" />
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

    <el-scrollbar class="cs-list">
      <div v-if="knowledgeStore.loading && !treeData.length" class="cs-empty">Loading knowledge...</div>
      <div v-else-if="knowledgeStore.error" class="cs-empty kt-error">{{ knowledgeStore.error }}</div>
      <div v-else-if="!treeData.length" class="cs-empty">
        {{ knowledgeStore.searchQuery ? "No matching knowledge" : "No knowledge files" }}
      </div>
      <el-tree
        v-else
        :data="treeData"
        :props="{ children: 'children', label: 'label' }"
        :default-expanded-keys="defaultExpandedKeys"
        node-key="key"
        highlight-current
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
        size="small"
      >
        <template #default="{ data }">
          <div
            v-if="data.type === 'file'"
            class="kt-file"
            :class="{ active: isActive(data.entry!.path) }"
            :title="data.entry!.path"
          >
            <span class="kt-file-label">{{ data.label }}</span>
            <span v-if="data.entry!.meta?.type" class="kt-file-type">{{ data.entry!.meta.type }}</span>
            <span class="kt-file-size">{{ fmtSize(data.entry!.size) }}</span>
          </div>
          <span v-else class="kt-folder">
            <span class="kt-folder-label">{{ data.label }}</span>
            <span class="kt-folder-count">{{ data.children?.length ?? 0 }}</span>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>

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
  height: calc(100vh - 95px);
  overflow: auto;
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
  min-height: 0;
  padding: 4px 0;
}
.cs-empty {
  padding: 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.kt-error {
  color: var(--el-color-danger);
}

// ── Knowledge tree items (mirrors aicr KnowledgeTree) ──

.kt-folder {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.kt-folder-count {
  padding: 0 6px;
  font-size: 11px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 8px;
}
.kt-file {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 2px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
}
.kt-file-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kt-file-type {
  padding: 1px 6px;
  font-size: 10px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
}
.kt-file-size {
  flex-shrink: 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.kt-file.active {
  font-weight: 600;
  color: var(--el-color-primary);
}

:deep(.el-tree-node__content) {
  height: auto;
  min-height: 28px;
}
</style>
