<script setup lang="ts">
/**
 * MessageMetaRow — icon-only action buttons with tooltips (mirrors YiVad aiChat).
 */
import {
  CopyDocument, RefreshRight, Delete, Edit, Promotion, Search,
  FolderOpened, Link,
} from '@element-plus/icons-vue';
import { t } from '@/shared/i18n';

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
}>();

const emit = defineEmits<{
  copy: [];
  edit: [];
  regenerate: [];
  delete: [];
  resend: [];
  searchWeb: [];
  deepenSearch: [];
  saveToKnowledge: [];
  openInYiVad: [];
}>();
</script>

<template>
  <div class="mm-row">
    <!-- Pet message actions -->
    <div v-if="!isUser" class="mm-actions">
      <el-tooltip content="Copy" placement="top" :show-after="400">
        <el-button size="small" text :icon="CopyDocument" class="mm-btn" @click="emit('copy')" />
      </el-tooltip>
      <el-tooltip content="Edit" placement="top" :show-after="400">
        <el-button size="small" text :icon="Edit" class="mm-btn" :disabled="isProcessing" @click="emit('edit')" />
      </el-tooltip>
      <el-tooltip :content="showRetryLabel ? 'Retry' : 'Regenerate'" placement="top" :show-after="400">
        <el-button size="small" text :icon="RefreshRight" class="mm-btn" :disabled="isProcessing" @click="emit('regenerate')" />
      </el-tooltip>
      <el-tooltip v-if="!hasWebSearch" content="Deepen search — regenerate with web search" placement="top" :show-after="400">
        <el-button size="small" text :icon="Search" class="mm-btn" :disabled="isProcessing" @click="emit('deepenSearch')" />
      </el-tooltip>
      <el-tooltip content="Save to YiKnowledge" placement="top" :show-after="400">
        <el-button size="small" text :icon="FolderOpened" class="mm-btn" :disabled="isProcessing || !hasContent" @click="emit('saveToKnowledge')" />
      </el-tooltip>
      <el-tooltip content="Open in YiVad" placement="top" :show-after="400">
        <el-button size="small" text :icon="Link" class="mm-btn" :disabled="isProcessing || !hasContent" @click="emit('openInYiVad')" />
      </el-tooltip>
      <el-tooltip content="Delete" placement="top" :show-after="400">
        <el-button size="small" text :icon="Delete" class="mm-btn mm-btn--danger" :disabled="isProcessing" @click="emit('delete')" />
      </el-tooltip>
    </div>

    <!-- User message actions -->
    <div v-else class="mm-actions">
      <el-tooltip content="Edit" placement="top" :show-after="400">
        <el-button size="small" text :icon="Edit" class="mm-btn" :disabled="isProcessing" @click="emit('edit')" />
      </el-tooltip>
      <el-tooltip content="Resend" placement="top" :show-after="400">
        <el-button size="small" text :icon="Promotion" class="mm-btn" :disabled="isProcessing" @click="emit('resend')" />
      </el-tooltip>
      <el-tooltip content="Search web" placement="top" :show-after="400">
        <el-button size="small" text :icon="Search" class="mm-btn" :disabled="isProcessing" @click="emit('searchWeb')" />
      </el-tooltip>
      <el-tooltip content="Delete" placement="top" :show-after="400">
        <el-button size="small" text :icon="Delete" class="mm-btn mm-btn--danger" :disabled="isProcessing" @click="emit('delete')" />
      </el-tooltip>
    </div>

    <!-- Meta info -->
    <div class="mm-meta">
      <el-tooltip :content="formattedTime" placement="top" :show-after="500">
        <time class="mm-time" :datetime="new Date(timestamp).toISOString()">{{ relativeTime }}</time>
      </el-tooltip>
      <el-tooltip :content="`~${tokenEstimate} tokens (chars/4 estimate)`" placement="top" :show-after="300">
        <span class="mm-tok">~{{ tokenEstimate }}t</span>
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  min-height: 24px;
}

.mm-actions {
  display: flex;
  gap: 0;
  align-items: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

// Show on hover, always show during streaming/error
.mb-bubble:hover .mm-actions,
.mb-bubble--streaming .mm-actions,
.mb-bubble--error .mm-actions,
.mb-bubble--aborted .mm-actions {
  opacity: 1;
}

.mm-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--text-secondary, #d4d0e8);
  border-radius: 4px;
  transition: all 0.12s;

  &:hover:not(:disabled) {
    color: var(--primary-light, #818cf8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
  }
  &:disabled {
    opacity: 0.35;
  }
  &--danger:hover:not(:disabled) {
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.1);
  }
}

.mm-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.mm-time {
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  opacity: 0.6;
}

.mm-tok {
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary, #d4d0e8);
  opacity: 0.5;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  padding: 1px 5px;
  border-radius: 8px;
}
</style>