<template>
  <div class="card filter">
    <h4 v-if="title" class="title sle">
      {{ title }}
    </h4>
    <div class="search">
      <el-input v-model="filterText" placeholder="Enter keyword to filter" clearable />
      <el-dropdown trigger="click">
        <el-icon size="20"><More /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="toggleTreeNodes(true)">Expand All</el-dropdown-item>
            <el-dropdown-item @click="toggleTreeNodes(false)">Collapse All</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-scrollbar :style="{ height: title ? `calc(100% - 95px)` : `calc(100% - 56px)` }">
      <el-tree
        ref="treeRef"
        default-expand-all
        :node-key="id"
        :data="multiple ? treeData : treeAllData"
        :show-checkbox="multiple"
        :check-strictly="false"
        :current-node-key="!multiple ? selected : ''"
        :highlight-current="!multiple"
        :expand-on-click-node="false"
        :check-on-click-node="multiple"
        :props="defaultProps"
        :filter-node-method="filterNode"
        :default-checked-keys="multiple ? selected : []"
        @node-click="handleNodeClick"
        @check="handleCheckChange"
      >
        <template #default="scope">
          <span class="el-tree-node__label">
            <slot :row="scope">
              {{ scope.node.label }}
            </slot>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts" name="TreeFilter">
import { ref, watch, onBeforeMount, nextTick } from "vue";
import { ElTree } from "element-plus";

// Accept parent component params and set defaults
interface TreeFilterProps {
  requestApi?: (data?: any) => Promise<any>; // API to request category data ==> optional
  data?: { [key: string]: any }[]; // Category data, if provided, API request is skipped ==> optional
  title?: string; // TreeFilter title ==> optional
  id?: string; // Selected id ==> optional, default “id”
  label?: string; // Display label ==> optional, default “label”
  multiple?: boolean; // Whether multi-select ==> optional, default false
  defaultValue?: any; // Default selected value ==> optional
}
const props = withDefaults(defineProps<TreeFilterProps>(), {
  id: "id",
  label: "label",
  multiple: false
});

const defaultProps = {
  children: "children",
  label: props.label
};

const treeRef = ref<InstanceType<typeof ElTree>>();
const treeData = ref<{ [key: string]: any }[]>([]);
const treeAllData = ref<{ [key: string]: any }[]>([]);

const selected = ref();
const setSelected = () => {
  if (props.multiple) selected.value = Array.isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue];
  else selected.value = typeof props.defaultValue === "string" ? props.defaultValue : "";
};

onBeforeMount(async () => {
  setSelected();
  if (props.requestApi) {
    const { data } = await props.requestApi!();
    treeData.value = data;
    treeAllData.value = [{ id: "", [props.label]: "All" }, ...data];
  }
});

// Use nextTick to prevent assignment not working after build (works fine in dev)
watch(
  () => props.defaultValue,
  () => nextTick(() => setSelected()),
  { deep: true, immediate: true }
);

watch(
  () => props.data,
  () => {
    if (props.data?.length) {
      treeData.value = props.data;
      treeAllData.value = [{ id: "", [props.label]: "All" }, ...props.data];
    }
  },
  { deep: true, immediate: true }
);

const filterText = ref("");
watch(filterText, val => {
  treeRef.value!.filter(val);
});

// Filter
const filterNode = (value: string, data: { [key: string]: any }, node: any) => {
  if (!value) return true;
  let parentNode = node.parent,
    labels = [node.label],
    level = 1;
  while (level < node.level) {
    labels = [...labels, parentNode.label];
    parentNode = parentNode.parent;
    level++;
  }
  return labels.some(label => label.indexOf(value) !== -1);
};

// Toggle tree node expand/collapse state
const toggleTreeNodes = (isExpand: boolean) => {
  let nodes = treeRef.value?.store.nodesMap;
  if (!nodes) return;
  for (const node in nodes) {
    if (Object.prototype.hasOwnProperty.call(nodes, node)) {
      nodes[node].expanded = isExpand;
    }
  }
};

// emit
const emit = defineEmits<{
  change: [value: any];
}>();

// Single select
const handleNodeClick = (data: { [key: string]: any }) => {
  if (props.multiple) return;
  emit("change", data[props.id]);
};

// Multi-select
const handleCheckChange = () => {
  emit("change", treeRef.value?.getCheckedKeys());
};

// Expose for parent component use
defineExpose({ treeData, treeAllData, treeRef });
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
