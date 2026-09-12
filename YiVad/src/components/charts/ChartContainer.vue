<template>
  <div class="chart-container" :style="containerStyle" ref="containerRef">
    <div class="chart-container__header" v-if="title || showToolbar">
      <span class="chart-container__title" v-if="title">{{ title }}</span>
      <ChartToolbar
        v-if="showToolbar"
        :exportable="exportable"
        :fullscreenable="fullscreenable"
        :refreshable="refreshable"
        :is-fullscreen="isFullscreen"
        @export="$emit('export')"
        @fullscreen="toggleFullscreen"
        @refresh="$emit('refresh')"
      />
    </div>

    <div class="chart-container__body" ref="bodyRef">
      <!-- Loading -->
      <div class="chart-container__state" v-if="loading">
        <div class="chart-container__skeleton">
          <div class="skeleton-bar skeleton-bar--1" />
          <div class="skeleton-bar skeleton-bar--2" />
          <div class="skeleton-bar skeleton-bar--3" />
          <div class="skeleton-bar skeleton-bar--4" />
          <div class="skeleton-bar skeleton-bar--5" />
        </div>
      </div>

      <!-- Error -->
      <div class="chart-container__state" v-else-if="error">
        <div class="chart-container__error">
          <el-icon :size="32"><WarningFilled /></el-icon>
          <p>{{ error }}</p>
          <el-button size="small" @click="$emit('retry')">重试</el-button>
        </div>
      </div>

      <!-- Empty -->
      <div class="chart-container__state" v-else-if="empty">
        <div class="chart-container__empty">
          <el-icon :size="32"><FolderOpened /></el-icon>
          <p>{{ emptyText }}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="chart-container__content" v-else :style="{ height: contentHeight }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ChartContainer">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { WarningFilled, FolderOpened } from "@element-plus/icons-vue";
import ChartToolbar from "./ChartToolbar.vue";

interface Props {
  title?: string;
  height?: string | number;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  showToolbar?: boolean;
  exportable?: boolean;
  fullscreenable?: boolean;
  refreshable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: "暂无数据",
  showToolbar: true,
  exportable: true,
  fullscreenable: true,
  refreshable: true,
});

defineEmits<{
  export: [];
  refresh: [];
  retry: [];
}>();

const containerRef = ref<HTMLElement>();
const bodyRef = ref<HTMLElement>();
const isFullscreen = ref(false);

const containerStyle = computed(() => {
  if (!props.height) return {};
  const h = typeof props.height === "number" ? `${props.height}px` : props.height;
  return { height: h };
});

const contentHeight = computed(() => "100%");

function toggleFullscreen() {
  if (!containerRef.value) return;
  if (!isFullscreen.value) {
    containerRef.value.requestFullscreen?.();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen?.();
    isFullscreen.value = false;
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  document.addEventListener("fullscreenchange", onFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
});
</script>

<style scoped lang="scss">
.chart-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  min-height: 200px;

  &:fullscreen {
    padding: 24px;
    background: var(--el-bg-color);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__body {
    flex: 1;
    min-height: 0;
    position: relative;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 160px;
  }

  &__skeleton {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 8px;
    padding: 0 16px 16px;

    .skeleton-bar {
      height: 12px;
      background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
      border-radius: 4px;
    }
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  }

  &__error, &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-secondary);

    p { margin: 0; font-size: 13px; }
  }

  &__error .el-icon { color: var(--el-color-danger); }
  &__empty .el-icon { color: var(--el-text-color-placeholder); }

  &__content {
    width: 100%;
    min-height: 160px;
  }
}

.skeleton-bar--1 { width: 40%; }
.skeleton-bar--2 { width: 65%; }
.skeleton-bar--3 { width: 50%; }
.skeleton-bar--4 { width: 75%; }
.skeleton-bar--5 { width: 55%; }
</style>