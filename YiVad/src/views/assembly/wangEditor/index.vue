<template>
  <div class="card content-box">
    <span class="text">Rich Text Editor 🍓🍇🍈🍉</span>
    <WangEditor v-model:value="content" height="400px" />
    <el-button type="primary" @click="dialogVisible = true"> Content Preview </el-button>
    <el-descriptions title="Config Options 📚" :column="1" border>
      <el-descriptions-item label="value"> Two-way bound value, e.g.: v-model:value="content"> </el-descriptions-item>
      <el-descriptions-item label="toolbarConfig">
        Rich text toolbar config:
        <a href="https://www.wangeditor.com/v5/toolbar-config.html"> https://www.wangeditor.com/v5/toolbar-config.html </a>
      </el-descriptions-item>
      <el-descriptions-item label="editorConfig">
        Rich text editor area config:
        <a href="https://www.wangeditor.com/v5/editor-config.html"> https://www.wangeditor.com/v5/editor-config.html </a>
      </el-descriptions-item>
      <el-descriptions-item label="height"> Rich text height, default 500px </el-descriptions-item>
      <el-descriptions-item label="mode"> Rich text mode, default "default" ("default" | "simple") </el-descriptions-item>
      <el-descriptions-item label="hideToolBar"> Hide toolbar area, default false </el-descriptions-item>
      <el-descriptions-item label="disabled"> Disable rich text editor, default false </el-descriptions-item>
    </el-descriptions>
    <el-dialog v-model="dialogVisible" title="Rich Text Content Preview" width="1300px" top="50px">
      <div class="view" v-html="content"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="wangEditor">
import { ref } from "vue";
import WangEditor from "@/components/WangEditor/index.vue";

const content = ref("");

const dialogVisible = ref(false);
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
