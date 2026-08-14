<template>
  <div class="card content-box">
    <span class="text">WangEditor Demo</span>
    <el-alert
      title="WangEditor is a rich text editor component based on @wangeditor/editor. Supports text formatting, images, tables, code blocks, and more."
      type="warning"
      :closable="false"
    />
    <WangEditor :value="content" @update:value="content = $event" class="mt30" />
    <el-card shadow="hover" class="mt30">
      <template #header>Preview Output</template>
      <div v-html="content" />
    </el-card>
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="value">string — HTML content, use v-model:value</el-descriptions-item>
      <el-descriptions-item label="disabled">boolean — disabled/readonly state</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoWangEditor">
import { ref } from "vue";
import WangEditor from "@/components/WangEditor/index.vue";

const content = ref("<p>Hello <strong>World</strong>!</p>");
</script>

<style scoped lang="scss">
.mt30 { margin-top: 30px; }
</style>