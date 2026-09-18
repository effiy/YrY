<script setup lang="ts">
/**
 * YiPet Chat — ChatHeader (Vue 3 SFC)
 * Minimal drag bar: title, streaming indicator, fullscreen, close.
 * Model selector, new chat, export moved to inline chat header in ChatWindow.
 */
import { FullScreen, Close } from '@element-plus/icons-vue';

defineProps<{
  title: string;
  isProcessing: boolean;
  streamingPhase: string;
}>();

const emit = defineEmits<{
  close: [];
  toggleFullscreen: [];
  headerMouseDown: [e: MouseEvent];
}>();
</script>

<template>
  <div
    class="yipet-chat-header"
    role="banner"
    title="Drag to move | Double-click for fullscreen"
    @mousedown="emit('headerMouseDown', $event)"
    @dblclick="emit('toggleFullscreen')"
  >
    <div class="header-left">
      <span class="header-title">{{ title }}</span>
      <span v-if="isProcessing" class="header-streaming">
        <span class="header-streaming-dot" />
        <span class="header-streaming-label">{{
          streamingPhase === 'retrieving' ? 'Retrieving...' :
          streamingPhase === 'thinking' ? 'Thinking...' :
          streamingPhase === 'streaming' ? 'Writing...' :
          'Processing...'
        }}</span>
      </span>
    </div>
    <div class="header-right">
      <el-button circle size="small" :icon="FullScreen" title="Fullscreen" @click="emit('toggleFullscreen')" />
      <el-button circle size="small" :icon="Close" class="header-btn--danger" title="Close" @click="emit('close')" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.yipet-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  cursor: move;
  user-select: none;
  background: var(--el-bg-color, #ffffff);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-streaming {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  border: 1px solid var(--el-color-primary-light-7, #c6e2ff);
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.header-streaming-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary, #409eff);
  animation: hdr-dot-pulse 1.2s ease-in-out infinite;
}

@keyframes hdr-dot-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.header-streaming-label {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 10px;
  letter-spacing: 0.2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

:deep(.el-button.is-circle) {
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-text-color: var(--el-text-color-secondary, #909399);
  --el-button-hover-bg-color: var(--el-fill-color-light, #f5f7fa);
  --el-button-hover-border-color: var(--el-border-color, #dcdfe6);
  --el-button-hover-text-color: var(--el-text-color-primary, #303133);
  width: 28px;
  height: 28px;
}

.header-btn--danger:deep(.el-button.is-circle) {
  --el-button-hover-bg-color: rgba(245, 108, 108, 0.1);
  --el-button-hover-text-color: #f56c6c;
}

@media (max-width: 480px) {
  .header-title { max-width: 100px; font-size: 12px; }
}
</style>