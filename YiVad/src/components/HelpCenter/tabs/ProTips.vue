<template>
  <ul class="protips">
    <li v-for="(t, i) in tips" :key="i">
      <el-icon color="#e6a23c"><Star /></el-icon>
      <span>{{ t }}</span>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { Star } from "@element-plus/icons-vue";
defineProps<{ tips: readonly string[] }>();
</script>
<style lang="scss" scoped>
.protips {
  list-style: none; padding: 8px 12px; margin: 12px 0 0;
  background: var(--el-color-warning-light-9);
  border: 1px dashed var(--el-color-warning-light-5);
  border-radius: 8px;
  li { display: flex; align-items: flex-start; gap: 8px; padding: 3px 0;
    color: var(--el-text-color-primary); font-size: 12.5px; line-height: 1.6;
  }
}
</style>
