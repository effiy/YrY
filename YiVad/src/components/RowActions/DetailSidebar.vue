<template>
  <Transition name="slide-right">
    <div v-if="visible" class="detail-sidebar" :style="{ width: panelWidth + 'px' }">
      <div class="detail-sidebar__header">
        <span class="detail-sidebar__title">Details</span>
        <div class="detail-sidebar__nav">
          <el-button :disabled="!hasPrev" size="small" text :icon="ArrowUp" @click="$emit('prev')" />
          <el-button :disabled="!hasNext" size="small" text :icon="ArrowDown" @click="$emit('next')" />
        </div>
        <el-button size="small" text :icon="Close" @click="$emit('close')" />
      </div>
      <div class="detail-sidebar__resize-handle" @mousedown="startResize" />
      <div class="detail-sidebar__body">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Close, ArrowUp, ArrowDown } from "@element-plus/icons-vue";

defineProps<{ visible: boolean; hasPrev?: boolean; hasNext?: boolean }>();
defineEmits<{ close: []; prev: []; next: [] }>();

const panelWidth = ref(480);

const startResize = (e: MouseEvent) => {
  const startX = e.clientX;
  const startWidth = panelWidth.value;
  const onMove = (ev: MouseEvent) => {
    const w = startWidth - (ev.clientX - startX);
    panelWidth.value = Math.max(320, Math.min(800, w));
  };
  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
};
</script>

<style scoped lang="scss">
.detail-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
  box-shadow: -4px 0 16px rgb(0 0 0 / 8%);
  &__header {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  &__title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
  }
  &__nav {
    display: flex;
    align-items: center;
  }
  &__resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    cursor: col-resize;
    &:hover {
      background: var(--el-color-primary);
      opacity: 0.3;
    }
  }
  &__body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
