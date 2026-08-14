<template>
  <div class="card content-box">
    <span class="text">SelectFilter Demo</span>
    <el-alert
      title="SelectFilter is a multi-select dropdown filter component. It provides search + select all + clear all functionality."
      type="warning"
      :closable="false"
    />
    <SelectFilter :options="options" :default-value="['1']" @change="onChange" />
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="options">SelectFilterOption[] — { value, label }[]</el-descriptions-item>
      <el-descriptions-item label="defaultValue">string[] — pre-selected values</el-descriptions-item>
      <el-descriptions-item label="multiple">boolean — multi-select, default true</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="Events" :column="1" border class="mt30">
      <el-descriptions-item label="change">(values: string[]) — emitted when selection changes</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoSelectFilter">
import SelectFilter from "@/components/SelectFilter/index.vue";

const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
];

const onChange = (values: string[]) => {
  console.log("Selected:", values);
};
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>