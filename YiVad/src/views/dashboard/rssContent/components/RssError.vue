<template>
  <div class="re-root">
    <el-result icon="error" title="Failed to load RSS content" :sub-title="message">
      <template #extra>
        <el-button type="primary" @click="$emit('retry')">Retry</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>();
defineEmits<{ retry: [] }>();
</script>

<style scoped lang="scss">
.re-root {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 24px;
}
</style>