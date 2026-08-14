<template>
  <div class="card content-box">
    <span class="text">TreeFilter Demo</span>
    <el-alert
      title="TreeFilter is a tree-based filter component with checkboxes. Used for hierarchical data filtering (categories, departments, etc.)."
      type="warning"
      :closable="false"
    />
    <TreeFilter
      label="Filter"
      :request-api="fetchTreeData"
      :default-value="['1-1']"
      @change="onChange"
    />
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="label">string — filter button label</el-descriptions-item>
      <el-descriptions-item label="requestApi">() => Promise — API to fetch tree data</el-descriptions-item>
      <el-descriptions-item label="defaultValue">string[] — pre-checked node keys</el-descriptions-item>
      <el-descriptions-item label="multiple">boolean — multi-select, default true</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="Events" :column="1" border class="mt30">
      <el-descriptions-item label="change">(values: string[]) — emitted when checked nodes change</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoTreeFilter">
import TreeFilter from "@/components/TreeFilter/index.vue";

const fetchTreeData = async () => {
  return [
    { id: "1", label: "Level 1", children: [
      { id: "1-1", label: "Level 1-1" },
      { id: "1-2", label: "Level 1-2" },
    ]},
    { id: "2", label: "Level 2", children: [
      { id: "2-1", label: "Level 2-1" },
    ]},
  ];
};

const onChange = (values: string[]) => {
  console.log("Checked:", values);
};
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>