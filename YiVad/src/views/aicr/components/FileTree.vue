<script setup lang="ts" name="aicrFileTree">
import { computed } from "vue";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";

defineProps<{ fullWidth?: boolean }>();

const fileTreeStore = useAicrFileTreeStore();

interface TreeNode {
  key: string;
  label: string;
  type: string;
  children?: TreeNode[];
}

function buildElTree(nodes: any[]): TreeNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map(n => ({
    key: n.key,
    label: n.name,
    type: n.type,
    children: n.children ? buildElTree(n.children) : undefined
  }));
}

const elTreeData = computed(() => buildElTree(fileTreeStore.tree));
const defaultExpandedKeys = computed(() => [...fileTreeStore.expandedFolders]);

function handleNodeClick(data: TreeNode) {
  if (data.type === "file") fileTreeStore.selectFile(data.key);
  else fileTreeStore.toggleFolder(data.key);
}
</script>

<template>
  <div class="aicr-file-tree">
    <el-input v-model="fileTreeStore.searchQuery" placeholder="Search files..." size="small" clearable class="ft-search" />
    <el-skeleton v-if="fileTreeStore.loading" :rows="3" animated />
    <el-alert v-else-if="fileTreeStore.error" :title="fileTreeStore.error" type="error" show-icon />
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
      <template #default="{ node, data }">
        <span class="ft-node">
          <el-icon class="ft-icon"><component :is="data.type === 'folder' ? 'Folder' : 'Document'" /></el-icon>
          <span class="ft-label">{{ node.label }}</span>
        </span>
      </template>
    </el-tree>
    <el-empty v-if="!fileTreeStore.loading && !fileTreeStore.error && elTreeData.length === 0" description="No files" />
  </div>
</template>

<style scoped lang="scss">
.aicr-file-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.ft-search {
  margin-bottom: 8px;
}
.ft-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  overflow: hidden;
}
.ft-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.ft-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
