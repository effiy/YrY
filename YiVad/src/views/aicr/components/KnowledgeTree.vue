<script setup lang="ts" name="aicrKnowledgeTree">
import { computed } from "vue";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";

const store = useAicrKnowledgeStore();

interface TreeNode {
  key: string;
  label: string;
  type: "folder" | "file";
  entry?: KnowledgeFileEntry;
  children?: TreeNode[];
}

// Build a nested folder/file tree that mirrors the YiKnowledge directory
// layout. Each path segment except the last becomes a folder node; the last
// segment becomes a file node. Folders with the same path are merged so
// sibling files across categories share a common ancestor chain.
const treeData = computed<TreeNode[]>(() => {
  const filtered = store.filteredCategories;
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

  // Sort siblings by name with no folder/file grouping, matching the
  // on-disk `ls` ordering of ~/YiKnowledge exactly.
  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
    for (const n of nodes) if (n.children) sortTree(n.children);
  };
  sortTree(rootChildren);
  return rootChildren;
});

const defaultExpandedKeys = computed(() => {
  // Expand top-level category folders by default for quick orientation.
  const keys: string[] = [];
  for (const n of treeData.value) {
    if (n.type === "folder") keys.push(n.key);
  }
  return keys;
});

function isActive(path: string) {
  return store.selectedPath === path;
}

function handleNodeClick(data: TreeNode) {
  if (data.type === "file" && data.entry) {
    store.selectFile(data.entry.path);
  }
}

function fmtSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div class="aicr-k-tree">
    <div class="kt-hdr">
      <el-input
        v-model="store.searchQuery"
        placeholder="Search knowledge..."
        size="small"
        clearable
      />
      <el-button size="small" @click="store.loadAll()" :loading="store.loading">Refresh</el-button>
    </div>

    <div class="kt-list">
      <div v-if="store.loading && !treeData.length" class="kt-empty">Loading knowledge...</div>
      <div v-else-if="store.error" class="kt-empty kt-error">{{ store.error }}</div>
      <div v-else-if="!treeData.length" class="kt-empty">
        {{ store.searchQuery ? "No matching knowledge" : "No knowledge files" }}
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.aicr-k-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.kt-hdr {
  display: flex;
  gap: 8px;
  padding: 0 0 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.kt-list {
  flex: 1;
  padding: 4px 0;
  overflow-y: auto;
}
.kt-empty {
  padding: 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.kt-error {
  color: var(--el-color-danger);
}
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
