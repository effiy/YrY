<script setup lang="ts">
/**
 * MessageMetaRow — meta info row (timestamp + token count).
 * Action buttons are delegated to MessageActions.vue.
 */
import MessageActions from './MessageActions.vue';

const props = defineProps<{
  isUser: boolean;
  isProcessing: boolean;
  hasContent: boolean;
  showRetryLabel: boolean;
  copyState: string;
  timestamp: number;
  formattedTime: string;
  relativeTime: string;
  tokenEstimate: number;
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
</script>

<template>
  <div class="mb-meta-row">
    <MessageActions
      :is-user="isUser"
      :is-processing="isProcessing"
      :has-content="hasContent"
      :show-retry-label="showRetryLabel"
      :has-web-search="hasWebSearch"
      :search-grounded="searchGrounded"
      :web-search-enabled="webSearchEnabled"
      @copy="emit('copy')"
      @edit="emit('edit')"
      @regenerate="emit('regenerate')"
      @delete="emit('delete')"
      @resend="emit('resend')"
      @search-web="emit('searchWeb')"
      @deepen-search="emit('deepenSearch')"
    />

    <!-- Meta info -->
    <div class="mm-meta">
      <el-tooltip :content="formattedTime" placement="top" :show-after="500">
        <time class="mm-time" :datetime="new Date(timestamp).toISOString()">{{ relativeTime }}</time>
      </el-tooltip>
      <el-tooltip :content="`~${tokenEstimate} tokens`" placement="top" :show-after="300">
        <span class="mm-tok">~{{ tokenEstimate }}t</span>
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mb-meta-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  margin-top: 6px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.mm-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mm-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.mm-tok {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
</style>