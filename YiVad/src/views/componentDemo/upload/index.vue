<template>
  <div class="card content-box">
    <span class="text">Upload Demo</span>
    <el-alert
      title="Upload components (Img and Imgs) handle image upload with preview, progress, and drag-and-drop support."
      type="warning"
      :closable="false"
    />
    <el-row :gutter="40" class="mt30">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>Single Image Upload (Img)</template>
          <UploadImg :image-url="singleImg" @update:image-url="singleImg = $event" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>Multiple Image Upload (Imgs)</template>
          <UploadImgs :file-list="multiImg" @update:file-list="multiImg = $event" />
        </el-card>
      </el-col>
    </el-row>
    <el-descriptions title="UploadImg Props" :column="1" border class="mt30">
      <el-descriptions-item label="imageUrl">string — image URL, v-model:image-url compatible</el-descriptions-item>
      <el-descriptions-item label="uploadText">string — upload button text</el-descriptions-item>
      <el-descriptions-item label="disabled">boolean — disabled state</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="UploadImgs Props" :column="1" border class="mt30">
      <el-descriptions-item label="fileList">UploadUserFile[] — file list, v-model:file-list compatible</el-descriptions-item>
      <el-descriptions-item label="limit">number — max images, default 5</el-descriptions-item>
      <el-descriptions-item label="disabled">boolean — disabled state</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoUpload">
import { ref } from "vue";
import type { UploadUserFile } from "element-plus";
import UploadImg from "@/components/Upload/Img.vue";
import UploadImgs from "@/components/Upload/Imgs.vue";

const singleImg = ref("");
const multiImg = ref<UploadUserFile[]>([]);
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>