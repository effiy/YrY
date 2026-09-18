<script setup lang="ts">
defineProps<{
  message?: string;
}>();

defineEmits<{
  (e: "retry"): void;
}>();
</script>

<template>
  <div class="chat-error">
    <el-result icon="error" :title="message || 'Failed to load'">
      <template #extra>
        <el-button type="primary" @click="$emit('retry')">Retry</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped lang="scss">
.chat-error {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--el-bg-color-page);

  :deep(.el-result__icon) {
    margin-bottom: 12px;
  }
  :deep(.el-result__title) {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}
</style>
