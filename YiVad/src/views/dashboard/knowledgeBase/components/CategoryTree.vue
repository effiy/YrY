<script setup lang="ts">
import { catColor } from "../utils";

defineProps<{
  data: {
    id: string;
    label: string;
    children?: { id: string; label: string; children?: { id: string; label: string }[] }[];
  }[];
  activeCategory: string;
}>();

const emit = defineEmits<{
  (e: "selectNode", category: string, module?: string, sub_module?: string): void;
}>();

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

function onNodeClick(data: TreeNode) {
  const parts = data.id.split("/");
  if (parts.length === 1) {
    emit("selectNode", parts[0]);
  } else if (parts.length === 2) {
    emit("selectNode", parts[0], parts[1]);
  } else if (parts.length >= 3) {
    emit("selectNode", parts[0], parts[1], parts[2]);
  }
}

function getLevel(id: string): number {
  return id.split("/").length;
}

function getCategory(id: string): string {
  return id.split("/")[0];
}
</script>

<template>
  <div class="category-tree">
    <el-tree
      :data="data"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :props="{ children: 'children', label: 'label' }"
      @node-click="onNodeClick"
    >
      <template #default="{ node, data: nodeData }">
        <span class="ct-node" :class="'ct-level-' + getLevel(nodeData.id)">
          <span
            v-if="getLevel(nodeData.id) === 1"
            class="ct-dot"
            :style="{ background: catColor(getCategory(nodeData.id)) }"
          ></span>
          <span v-else class="ct-indent-icon">
            <span v-if="getLevel(nodeData.id) === 2" class="ct-icon ct-icon-module">M</span>
            <span v-else class="ct-icon ct-icon-sub">S</span>
          </span>
          <span class="ct-label">{{ nodeData.label }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<style scoped lang="scss">
.category-tree {
  :deep(.el-tree-node__content) {
    height: 28px;
    padding: 0 6px;
    border-radius: 4px;
    transition: background 0.12s;
    &:hover { background: var(--el-color-primary-light-9); }
  }
  :deep(.el-tree-node__expand-icon) {
    font-size: 10px;
    color: #909399;
  }
}

.ct-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #303133;
}

.ct-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ct-indent-icon {
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.ct-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 700;
  color: #fff;
  &-module { background: #5ab1ef; }
  &-sub { background: #c0c4cc; }
}

.ct-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ct-level-1 .ct-label {
  font-weight: 600;
  font-size: 13px;
}
</style>
