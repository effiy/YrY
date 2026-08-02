<script setup lang="ts" name="aiChatConversationSidebar">
import { computed, inject, onMounted, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useKnowledgeTreeStore } from "@/stores/modules/knowledgeTree";
import { syncKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";

const knowledgeStore = useKnowledgeTreeStore();
const openPreview = inject<(path: string) => void>("openKnowledgePreview", () => {});

// ── Sync ──

const SYNC_TIME_KEY = "yivad:knowledge:lastSyncTime";

const syncing = ref(false);
const lastSyncTime = ref<number>(0);

function loadLastSyncTime() {
  try {
    const raw = localStorage.getItem(SYNC_TIME_KEY);
    if (raw) lastSyncTime.value = Number(raw);
  } catch { /* ignore */ }
}

function saveLastSyncTime() {
  lastSyncTime.value = Date.now();
  try { localStorage.setItem(SYNC_TIME_KEY, String(lastSyncTime.value)); } catch { /* ignore */ }
}

loadLastSyncTime();

const lastSyncLabel = computed(() => {
  if (!lastSyncTime.value) return "Never synced";
  const diff = Date.now() - lastSyncTime.value;
  if (diff < 60_000) return "Just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
});

async function handleSync() {
  if (syncing.value) return;
  syncing.value = true;
  try {
    const result = await syncKnowledge();
    // Build status message
    const parts: string[] = [];
    if (result.synced > 0) parts.push(`${result.synced} synced`);
    if (result.deleted > 0) parts.push(`${result.deleted} removed`);
    if (result.rag?.status) parts.push(`RAG: ${result.rag.status}`);
    else if (result.rag?.error) parts.push(`RAG: ${result.rag.error}`);

    if (parts.length) {
      ElMessage.success(`Sync complete — ${parts.join(", ")}`);
    } else {
      ElMessage.info("Sync complete — everything up to date");
    }
    saveLastSyncTime();

    // Reload the tree; don't let a reload failure mask the sync success
    try {
      await knowledgeStore.loadAll();
    } catch (e: any) {
      ElMessage.warning(`Sync OK but tree reload failed: ${e?.message || "unknown"}`);
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Sync failed — check server connection");
  } finally {
    syncing.value = false;
  }
}

// ── Tree: directory-based knowledge tree ──

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

function onNodeClick(data: TreeNode) {
  if (data.type === "file" && data.entry) {
    openPreview(data.entry.path);
  }
}

function fmtSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Drag: initiate a new chat session by dragging knowledge files/folders ──

interface DragContextNode {
  type: "file" | "folder";
  name: string;
  path: string;
  content?: string;
  tags?: string[];
  children?: DragContextNode[];
}

/** Build a tree node from a TreeNode (preserves directory structure). */
function buildDragTree(node: TreeNode): DragContextNode | null {
  if (node.type === "file" && node.entry) {
    return {
      type: "file",
      name: node.label,
      path: node.entry.path,
      content: (node.entry.meta?.content as string) || "",
      tags: (node.entry.meta?.tags as string[]) || []
    };
  }
  if (node.type === "folder" && node.children?.length) {
    const children = node.children
      .map(c => buildDragTree(c))
      .filter(Boolean) as DragContextNode[];
    if (!children.length) return null;
    return {
      type: "folder",
      name: node.label,
      path: node.key.startsWith("folder:") ? node.key.slice(7) : node.key,
      children
    };
  }
  return null;
}

function onDragStart(e: DragEvent, data: TreeNode) {
  const tree = buildDragTree(data);
  if (!tree) {
    e.preventDefault();
    return;
  }
  // Always send as an array so drop handlers can treat uniformly
  e.dataTransfer!.effectAllowed = "link";
  e.dataTransfer!.setData("application/x-knowledge-file", JSON.stringify([tree]));
  e.dataTransfer!.setData("text/plain", tree.name);
}
</script>

<template>
  <div class="cs-sidebar">
    <div class="cs-header">
      <el-input v-model="knowledgeStore.searchQuery" placeholder="Search knowledge..." clearable size="small" />
      <el-tooltip :content="`Sync metadata from YiKnowledge directory. Last: ${lastSyncLabel}`" placement="bottom">
        <el-button size="small" :icon="Refresh" :loading="syncing" :disabled="syncing" @click="handleSync">
          Sync
        </el-button>
      </el-tooltip>
      <span class="cs-hint" title="Drag files to the chat area to start a session">Drag → Chat</span>
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
        @node-click="onNodeClick"
        size="small"
      >
        <template #default="{ data }">
          <div
            v-if="data.type === 'file'"
            class="kt-file"
            :title="data.entry!.path"
            draggable="true"
            @dragstart="e => onDragStart(e, data)"
          >
            <span class="kt-file-label">{{ data.label }}</span>
            <span v-if="data.entry!.meta?.type" class="kt-file-type">{{ data.entry!.meta.type }}</span>
            <span class="kt-file-size">{{ fmtSize(data.entry!.size) }}</span>
          </div>
          <span
            v-else
            class="kt-folder"
            draggable="true"
            @dragstart="e => onDragStart(e, data)"
          >
            <span class="kt-folder-label">{{ data.label }}</span>
            <span class="kt-folder-count">{{ data.children?.length ?? 0 }}</span>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
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
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.cs-hint {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  background: var(--el-fill-color-light);
  border-radius: 3px;
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

// ── Knowledge tree items ──

.kt-folder {
  display: flex;
  gap: 6px;
  align-items: center;
  padding-right: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  cursor: grab;
}
.kt-folder:active {
  cursor: grabbing;
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
  padding: 2px 8px 2px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: grab;
}
.kt-file:active {
  cursor: grabbing;
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
:deep(.el-tree-node__content) {
  height: auto;
  min-height: 28px;
}
</style>
