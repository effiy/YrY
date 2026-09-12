<template>
  <div class="tree-table">
    <el-table :data="flattenedData" row-key="__key" :tree-props="{ children: '__children', hasChildren: '__hasChildren' }" v-bind="$attrs">
      <el-table-column
        v-for="col in columns"
        :key="col.key"
        :prop="col.key"
        :label="col.label"
        :width="col.width"
      >
        <template #default="{ row }">
          <slot :name="col.key" :row="row">
            {{ row[col.key] ?? "" }}
          </slot>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface TreeNode {
  [key: string]: any;
  children?: TreeNode[];
}

const props = defineProps<{
  data: TreeNode[];
  columns: { key: string; label: string; width?: number }[];
  childrenKey?: string;
  lazyLoad?: boolean;
}>();

const childrenKey = props.childrenKey ?? "children";

interface FlattenedNode extends Record<string, any> {
  __key: string;
  __children?: FlattenedNode[];
  __hasChildren: boolean;
}

function flatten(nodes: TreeNode[], level = 0): FlattenedNode[] {
  return nodes.flatMap((node) => {
    const row: FlattenedNode = { ...node, __key: node.key ?? node.id ?? Math.random().toString(36).slice(2), __hasChildren: false };
    const kids = node[childrenKey] as TreeNode[] | undefined;
    delete (row as any)[childrenKey];
    if (kids && kids.length > 0) {
      row.__children = flatten(kids, level + 1);
      row.__hasChildren = true;
    }
    return [row];
  });
}

const flattenedData = computed(() => flatten(props.data));
</script>