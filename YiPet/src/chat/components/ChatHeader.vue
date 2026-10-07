<script setup lang="ts">
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
    <div class="header-inner">
      <div class="header-left">
        <div class="header-brand-dot" />
        <span class="header-title">{{ title }}</span>
      </div>
      <div class="header-right">
        <el-button circle size="small" :icon="FullScreen" class="hdr-ctrl-btn" title="Fullscreen" @click="emit('toggleFullscreen')" />
        <el-button circle size="small" :icon="Close" class="hdr-ctrl-btn hdr-close-btn" title="Close" @click="emit('close')" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.yipet-chat-header {
  position: relative;
  display: block;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px;
  min-height: 36px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.header-brand-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-7), 0 0 8px var(--el-color-primary-light-5);
}

.header-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.hdr-ctrl-btn:deep(.el-button.is-circle) {
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-text-color: var(--el-text-color-placeholder);
  --el-button-hover-bg-color: var(--el-fill-color-light);
  --el-button-hover-border-color: var(--el-border-color-light);
  --el-button-hover-text-color: var(--el-text-color-regular);
  width: 28px;
  height: 28px;
  transition: all 0.15s ease;
}

.hdr-close-btn:deep(.el-button.is-circle) {
  --el-button-hover-bg-color: var(--el-color-danger-light-9);
  --el-button-hover-border-color: var(--el-color-danger-light-7);
  --el-button-hover-text-color: var(--el-color-danger);
}

@media (max-width: 480px) {
  .header-inner { padding: 4px 10px; min-height: 32px; }
  .header-title { max-width: 100px; font-size: 11px; }
  .hdr-ctrl-btn:deep(.el-button.is-circle) { width: 26px; height: 26px; }
}
</style>