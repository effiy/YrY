<script setup lang="ts">
/**
 * MessageActions — icon-only action buttons with tooltips (mirrors YiVad aiChat).
 * Extracted from MessageMetaRow.vue.
 */
import { ref } from 'vue';
import {
  CopyDocument, RefreshRight, Delete, Edit, Promotion, Search, Check,
} from '@element-plus/icons-vue';

const props = defineProps<{
  isUser: boolean;
  isProcessing: boolean;
  hasContent: boolean;
  showRetryLabel: boolean;
  hasWebSearch: boolean;
  searchGrounded: boolean;
  webSearchEnabled: boolean;
}>();

const emit = defineEmits<{
  copy: [];
  edit: [];
  regenerate: [];
  delete: [];
  resend: [];
  searchWeb: [];
  deepenSearch: [];
}>();

const copied = ref(false);

function onCopy() {
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
  emit('copy');
}
</script>

<template>
  <!-- Pet message actions -->
  <div v-if="!isUser" class="ma-actions">
    <el-tooltip :content="copied ? 'Copied' : 'Copy'" placement="top" :show-after="400">
      <el-button size="small" text :icon="copied ? Check : CopyDocument" class="ma-btn" :class="{ 'is-copied': copied }" @click="onCopy" />
    </el-tooltip>
    <el-tooltip content="Edit" placement="top" :show-after="400">
      <el-button size="small" text :icon="Edit" class="ma-btn" :disabled="isProcessing" @click="emit('edit')" />
    </el-tooltip>
    <el-tooltip :content="showRetryLabel ? 'Retry' : 'Regenerate'" placement="top" :show-after="400">
      <el-button size="small" text :icon="RefreshRight" class="ma-btn" :disabled="isProcessing" @click="emit('regenerate')" />
    </el-tooltip>
    <el-tooltip v-if="!hasWebSearch && !searchGrounded" content="Deepen search — regenerate with web search" placement="top" :show-after="400">
      <el-button size="small" text :icon="Search" class="ma-btn" :disabled="isProcessing" @click="emit('deepenSearch')" />
    </el-tooltip>
    <el-tooltip content="Delete" placement="top" :show-after="400">
      <el-button size="small" text :icon="Delete" class="ma-btn" :disabled="isProcessing" @click="emit('delete')" />
    </el-tooltip>
  </div>

  <!-- User message actions -->
  <div v-else class="ma-actions">
    <el-tooltip content="Edit" placement="top" :show-after="400">
      <el-button size="small" text :icon="Edit" class="ma-btn" :disabled="isProcessing" @click="emit('edit')" />
    </el-tooltip>
    <el-tooltip content="Resend" placement="top" :show-after="400">
      <el-button size="small" text :icon="Promotion" class="ma-btn" :disabled="isProcessing" @click="emit('resend')" />
    </el-tooltip>
    <el-tooltip v-if="!hasWebSearch" :content="webSearchEnabled ? 'Search: on' : 'Search web'" placement="top" :show-after="400">
      <el-button
        size="small"
        text
        :icon="Search"
        class="ma-btn"
        :class="{ 'is-on': webSearchEnabled }"
        :disabled="isProcessing"
        @click="emit('searchWeb')"
      />
    </el-tooltip>
    <el-tooltip content="Delete" placement="top" :show-after="400">
      <el-button size="small" text :icon="Delete" class="ma-btn" :disabled="isProcessing" @click="emit('delete')" />
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.ma-actions {
  display: flex;
  gap: 2px;
  align-items: center;
}

.ma-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--el-text-color-placeholder);
  border-radius: 4px;
  transition: all 0.12s;

  &:hover:not(:disabled) {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &:disabled {
    opacity: 0.35;
  }
  &.is-on {
    color: var(--el-color-primary);
  }
  &.is-copied {
    color: var(--el-color-success) !important;
  }
}
</style>