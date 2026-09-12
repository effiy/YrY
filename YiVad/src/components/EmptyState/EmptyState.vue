<template>
  <div class="empty-state" role="status">
    <div class="empty-state__illustration">
      <slot name="illustration">
        <el-icon :size="64" color="var(--el-text-color-disabled)"><FolderOpened /></el-icon>
      </slot>
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.action || actionText" class="empty-state__action">
      <slot name="action">
        <el-button v-if="actionText" type="primary" @click="$emit('action')">{{ actionText }}</el-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderOpened } from "@element-plus/icons-vue";

defineProps<{ title?: string; description?: string; actionText?: string }>();
defineEmits<{ action: [] }>();
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  &__illustration { margin-bottom: 16px; opacity: 0.6; }
  &__title { font-size: 16px; font-weight: 500; margin: 0 0 8px; color: var(--el-text-color-regular); }
  &__description { font-size: 13px; color: var(--el-text-color-secondary); margin: 0 0 16px; max-width: 320px; }
}
</style>