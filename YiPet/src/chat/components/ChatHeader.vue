<script setup lang="ts">
/**
 * YiPet Chat — ChatHeader (Vue 3 SFC)
 * Uses Element Plus icons matching YiVad aiChat's header style.
 */
import { Operation, FullScreen, Close } from '@element-plus/icons-vue';

defineProps<{
  title: string;
  role: string;
  roleImageUrl: string;
}>();

defineEmits<{
  close: [];
  toggleSidebar: [];
  toggleFullscreen: [];
  headerMouseDown: [e: MouseEvent];
}>();
</script>

<template>
  <div
    class="yipet-chat-header"
    role="banner"
    title="Drag to move | Double-click for fullscreen"
    @mousedown="$emit('headerMouseDown', $event)"
    @dblclick="$emit('toggleFullscreen')"
  >
    <div class="header-left">
      <el-button
        circle
        size="small"
        :icon="Operation"
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        @click="$emit('toggleSidebar')"
      />
      <img
        v-if="roleImageUrl"
        class="header-avatar"
        :src="roleImageUrl"
        :alt="role"
        :title="role"
      />
      <span class="header-title">{{ title }}</span>
    </div>
    <div class="header-buttons">
      <el-button
        circle
        size="small"
        :icon="FullScreen"
        title="Fullscreen"
        aria-label="Fullscreen"
        @click="$emit('toggleFullscreen')"
      />
      <el-button
        circle
        size="small"
        :icon="Close"
        class="header-btn--danger"
        title="Close"
        aria-label="Close chat window"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.yipet-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  cursor: move;
  user-select: none;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-rgb, 99, 102, 241), 0.22) 0%,
    var(--bg-secondary, rgba(30, 26, 59, 0.9)) 60%
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  color: var(--text-primary, #f5f3ff);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.header-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: contain;
  flex: none;
  border: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.5);
  box-shadow: 0 0 10px rgba(var(--primary-rgb, 99, 102, 241), 0.4);
}

.header-title {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

// Header button overrides — transparent bg, dark theme
:deep(.el-button.is-circle) {
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-text-color: var(--text-secondary, #d4d0e8);
  --el-button-hover-bg-color: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  --el-button-hover-border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
  --el-button-hover-text-color: var(--text-primary, #f5f3ff);
  width: 28px;
  height: 28px;
  transition: all 0.15s;
}

.header-btn--danger:deep(.el-button.is-circle) {
  --el-button-hover-bg-color: rgba(255, 77, 79, 0.15);
  --el-button-hover-border-color: rgba(255, 77, 79, 0.35);
  --el-button-hover-text-color: #ff4d4f;
}
</style>