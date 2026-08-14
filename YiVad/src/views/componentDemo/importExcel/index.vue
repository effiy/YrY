<template>
  <div class="card content-box">
    <span class="text">ImportExcel Demo</span>
    <el-alert
      title="ImportExcel provides a dialog-based Excel batch import workflow with template download, file validation, and upload progress."
      type="warning"
      :closable="false"
    />
    <el-button type="primary" :icon="Upload" @click="batchAdd"> Batch Import </el-button>
    <ImportExcel ref="importRef" />
    <el-descriptions title="Props (via ref.acceptParams)" :column="1" border class="mt30">
      <el-descriptions-item label="title">string — component title and success message</el-descriptions-item>
      <el-descriptions-item label="fileSize">number — max file size in MB, default 5</el-descriptions-item>
      <el-descriptions-item label="fileType">string[] — allowed MIME types</el-descriptions-item>
      <el-descriptions-item label="tempApi">() => Promise — API for downloading the template</el-descriptions-item>
      <el-descriptions-item label="importApi">(params) => Promise — API for uploading data</el-descriptions-item>
      <el-descriptions-item label="getTableList">() => void — callback to refresh table after success</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoImportExcel">
import { ref } from "vue";
import { Upload } from "@element-plus/icons-vue";
import ImportExcel from "@/components/ImportExcel/index.vue";

const importRef = ref();
const batchAdd = () => {
  importRef.value.acceptParams({
    title: "Data",
    tempApi: async () => ({}),
    importApi: async () => ({}),
  });
};
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>