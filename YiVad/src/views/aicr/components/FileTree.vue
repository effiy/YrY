<script setup lang="ts" name="aicrFileTree">
import { computed } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrUiStore } from "@/stores/modules/aicr/ui";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import type { FileNode } from "@/stores/modules/aicr/fileTree";
import FileTreeToolbar from "./FileTreeToolbar.vue";
import FileTreeNode from "./FileTreeNode.vue";
import FileTreeCards from "./FileTreeCards.vue";

defineProps<{ fullWidth?: boolean }>();

const fileTreeStore = useAicrFileTreeStore();
const uiStore = useAicrUiStore();
const sessionStore = useAicrSessionStore();

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

const elTreeData = computed(() => buildElTree(fileTreeStore.filteredTree));
const defaultExpandedKeys = computed(() => {
  const allKeys: string[] = [];
  const walk = (nodes: FileNode[]) => {
    for (const n of nodes) {
      if (n.type === "folder") allKeys.push(n.key);
      if (n.children) walk(n.children);
    }
  };
  walk(fileTreeStore.filteredTree);
  return allKeys;
});

function isActive(key: string) {
  return fileTreeStore.selectedKey === key;
}

function handleNodeClick(data: TreeNode) {
  if (data.type === "file") fileTreeStore.selectFile(data.key);
  else fileTreeStore.toggleFolder(data.key);
}

async function newFile() {
  try {
    const path = await ElMessageBox.prompt("New file path (e.g. project/file.md)", "New File", {
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      inputPlaceholder: "project/file.md"
    });
    const p = String(path.value || "").trim();
    if (!p) return;
    // Split into parent + filename so a path like "project/file.md" actually
    // creates the file under "project/" rather than at the root (which is
    // what happened when this used split("/").pop() and discarded the prefix).
    const parts = p.split("/").filter(Boolean);
    const fileName = parts.pop()!;
    const parentPath = parts.join("/");
    await fileTreeStore.createFile(parentPath, fileName, "");
    ElMessage.success("File created");
  } catch {
    /* canceled */
  }
}

async function renameNode(data: FileNode) {
  try {
    const result = await ElMessageBox.prompt("New name", "Rename", {
      confirmButtonText: "Rename",
      cancelButtonText: "Cancel",
      inputValue: data.name
    });
    const name = String(result.value || "").trim();
    if (!name || name === data.name) return;
    await fileTreeStore.renameNode(data.key, name, data.type === "folder");
    ElMessage.success("Renamed");
  } catch {
    /* canceled */
  }
}

async function deleteNode(data: FileNode) {
  try {
    await ElMessageBox.confirm(`Delete ${data.name}? This cannot be undone.`, "Confirm Delete", {
      type: "warning",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });
    await fileTreeStore.deleteNode(data.key, data.type === "folder");
    ElMessage.success("Deleted");
  } catch {
    /* canceled */
  }
}

async function toggleFavorite(data: FileNode) {
  if (data.type !== "file") return;
  await sessionStore.toggleFavorite(data.key);
}
</script>

<template>
  <div class="aicr-file-tree">
    <template v-if="!fullWidth && uiStore.viewMode === 'tree'">
      <FileTreeToolbar @new-file="newFile" />

      <div class="ft-list">
        <div v-if="fileTreeStore.loading && !elTreeData.length" class="ft-empty">Loading...</div>
        <div v-else-if="!elTreeData.length" class="ft-empty">
          {{ fileTreeStore.searchQuery ? "No matching files" : "No files" }}
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
          <template #default="{ node, data }">
            <FileTreeNode
              v-if="data.type === 'file' && data.session"
              :data="data"
              :label="node.label"
              :active="isActive(data.key)"
              @toggle-favorite="toggleFavorite"
              @rename="renameNode"
              @delete="deleteNode"
            />
            <span v-else class="ft-folder">{{ data.label }}</span>
          </template>
        </el-tree>
      </div>
    </template>

    <FileTreeCards v-else-if="uiStore.viewMode === 'cards'" :full-width="fullWidth" @new-file="newFile" />
  </div>
</template>

<style scoped lang="scss">
.aicr-file-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.ft-list {
  flex: 1;
  padding: 4px 0;
  overflow-y: auto;
}
.ft-folder {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.ft-empty {
  padding: 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
:deep(.el-tree-node__content) {
  height: auto;
  min-height: 32px;
}
</style>
