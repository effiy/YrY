<script setup lang="ts" name="aiChatConversationSidebar">
import { computed, inject, onMounted, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useKnowledgeTreeStore } from "@/stores/modules/knowledgeTree";
import { syncKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

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
  } catch {
    /* ignore */
  }
}

function saveLastSyncTime() {
  lastSyncTime.value = Date.now();
  try {
    localStorage.setItem(SYNC_TIME_KEY, String(lastSyncTime.value));
  } catch {
    /* ignore */
  }
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
    } catch (e: unknown) {
      ElMessage.warning(`Sync OK but tree reload failed: ${e instanceof Error ? e.message : "unknown"}`);
    }
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : "Sync failed — check server connection");
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

function collectAllFolderKeys(nodes: TreeNode[]): string[] {
  const keys: string[] = [];
  for (const n of nodes) {
    if (n.type === "folder") {
      keys.push(n.key);
      if (n.children) keys.push(...collectAllFolderKeys(n.children));
    }
  }
  return keys;
}

const defaultExpandedKeys = computed(() => collectAllFolderKeys(treeData.value));

onMounted(() => {
  knowledgeStore.loadAll();
});

function onNodeClick(data: TreeNode) {
  if (data.type === "file" && data.entry) {
    openPreview(data.entry.path);
  }
}

function onFileDragStart(e: DragEvent, data: TreeNode) {
  if (!e.dataTransfer || !data.entry) return;
  const entry = data.entry;
  const dragNode = {
    type: "file",
    name: entry.name,
    path: entry.path,
    tags: entry.meta?.tags ?? [],
    content: "" // content loaded on drop if needed
  };
  e.dataTransfer.setData("application/x-knowledge-file", JSON.stringify(dragNode));
  e.dataTransfer.effectAllowed = "link";
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
      <el-tooltip :content="`Sync metadata from YiKnowledge directory. Last: ${lastSyncLabel}`" placement="bottom">
        <el-button size="small" :icon="Refresh" :loading="syncing" :disabled="syncing" @click="handleSync"> Sync </el-button>
      </el-tooltip>
      <span class="cs-hint">Click file to start chat</span>
    </div>

    <el-scrollbar class="cs-list">
      <div v-if="knowledgeStore.loading && !treeData.length" class="cs-empty">Loading knowledge...</div>
      <div v-else-if="knowledgeStore.error" class="cs-empty kt-error">
        <p>{{ knowledgeStore.error }}</p>
        <el-button size="small" type="primary" @click="knowledgeStore.loadAll()">Retry</el-button>
      </div>
      <div v-else-if="!treeData.length" class="cs-empty">
        <p>{{ knowledgeStore.searchQuery ? "No matching knowledge" : "No knowledge files" }}</p>
        <el-button v-if="!knowledgeStore.searchQuery" size="small" type="primary" :loading="syncing" @click="handleSync">
          Sync now
        </el-button>
      </div>
      <el-tree
        v-else
        :key="knowledgeStore.searchQuery"
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
            :title="data.entry!.path + ' — click to start chat'"
            draggable="true"
            @dragstart="e => onFileDragStart(e, data)"
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
  gap: 6px;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.cs-hint {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  background: var(--el-fill-color-light);
  border-radius: var(--radius-xs);
}
.cs-list {
  flex: 1;
  min-height: 0;
  padding: 4px 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb);
    border-radius: 2px;
    &:hover { background: var(--el-border-color-darker); }
  }
}
.cs-empty {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 24px 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  p { margin: 0; }
}
.kt-error {
  color: var(--el-color-danger);
}

// ── Knowledge tree items ──
.kt-folder {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 8px 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  transition: color var(--transition-fast);

  &:hover { color: var(--el-color-primary); }
  &::before {
    content: "▸";
    flex-shrink: 0;
    font-size: 9px;
    color: var(--el-text-color-placeholder);
    transition: transform var(--transition-fast);
  }
}
.kt-folder-count {
  padding: 0 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: var(--radius-pill);
}
.kt-file {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 3px 8px 3px 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    transform: translateX(2px);
  }
  &:active {
    transform: translateX(0);
  }
}
.kt-file-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.kt-file-type {
  flex-shrink: 0;
  padding: 0 5px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 9px;
  font-weight: 600;
  line-height: 17px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: var(--radius-xs);
  text-transform: uppercase;
  letter-spacing: 0.2px;
}
.kt-file-size {
  flex-shrink: 0;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
:deep(.el-tree-node__content) {
  height: auto;
  min-height: 28px;
  padding-left: 4px !important;
  border-radius: var(--radius-xs);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--el-fill-color-lighter);
  }
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--el-color-primary-light-9);
}
:deep(.el-tree-node__expand-icon) {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  transition:
    color var(--transition-fast),
    transform var(--transition-fast);
  &:hover { color: var(--el-color-primary); }
}

// ── Responsive ──
@media (width <= 767px) {
  .cs-header {
    gap: 4px;
    padding: 6px;
  }
  .cs-hint { display: none; }
  .kt-file { font-size: 12px; }
  .kt-file-size { display: none; }
}
</style>
