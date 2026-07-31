<template>
  <div class="card content-box">
    <span class="text">Batch Import Data 🍓🍇🍈🍉</span>
    <el-button type="primary" :icon="Upload" @click="batchAdd"> Batch Import </el-button>
    <ImportExcel ref="importRef" />
    <el-descriptions title="Config Options (via ref) 📚" :column="1" border>
      <el-descriptions-item label="title"> Component title && post-upload success message </el-descriptions-item>
      <el-descriptions-item label="fileSize"> Max upload file size, default 5MB </el-descriptions-item>
      <el-descriptions-item label="fileType">
        Allowed file types, defaults to ["application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
      </el-descriptions-item>
      <el-descriptions-item label="tempApi"> API for downloading the template </el-descriptions-item>
      <el-descriptions-item label="importApi"> API for uploading data </el-descriptions-item>
      <el-descriptions-item label="getTableList"> API for refreshing the table data after upload success </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="batchImport">
import { ref } from "vue";
import { exportUserInfo, BatchAddUser } from "@/api/modules/user";
import { Upload } from "@element-plus/icons-vue";
import ImportExcel from "@/components/ImportExcel/index.vue";

const importRef = ref();
const batchAdd = () => {
  let params = {
    title: "Data",
    tempApi: exportUserInfo,
    importApi: BatchAddUser
  };
  importRef.value.acceptParams(params);
};
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
