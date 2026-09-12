<script setup lang="ts">
/**
 * Upload progress bar component with cancel support.
 */
defineProps<{
  percentage: number;
  status?: "uploading" | "success" | "error";
  fileName?: string;
}>();

defineEmits<{
  (e: "cancel"): void;
}>();
</script>

<template>
  <div class="upload-progress">
    <div class="upload-progress__header">
      <span class="upload-progress__name">{{ fileName || '上传中...' }}</span>
      <span class="upload-progress__percent">{{ percentage }}%</span>
    </div>
    <el-progress
      :percentage="percentage"
      :status="status === 'error' ? 'exception' : status === 'success' ? 'success' : undefined"
      :stroke-width="6"
    />
    <el-button v-if="status === 'uploading'" text size="small" type="danger" @click="$emit('cancel')">
      取消
    </el-button>
  </div>
</template>

<style scoped lang="scss">
.upload-progress {
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__percent {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
    margin-left: 8px;
  }
}
</style>