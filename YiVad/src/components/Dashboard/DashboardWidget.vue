<template>
  <div
    class="dashboard-widget"
    :class="{ 'is-dragging': isDragging, 'is-resizing': isResizing }"
    :style="gridStyle"
    :draggable="props.draggable"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="widget-header">
      <div class="widget-drag-handle" v-if="draggable">
        <el-icon :size="14"><Rank /></el-icon>
      </div>
      <span class="widget-title">{{ widget?.title ?? title }}</span>
      <div class="widget-actions">
        <el-tooltip content="配置" v-if="showSettings">
          <el-button size="small" text :icon="Setting" @click="$emit('settings')" />
        </el-tooltip>
        <el-tooltip content="删除">
          <el-button size="small" text :icon="Close" @click="$emit('remove')" />
        </el-tooltip>
      </div>
    </div>

    <div class="widget-body">
      <slot :widget="widget" />
    </div>

    <div class="widget-resize-handle" v-if="resizable" @mousedown="onResizeStart" />
  </div>
</template>

<script setup lang="ts" name="DashboardWidget">
import { ref, computed } from "vue";
import { Setting, Close, Rank } from "@element-plus/icons-vue";
import type { WidgetConfig } from "@/stores/dashboard";

interface WidgetLayout {
  x: number;
  y: number;
  cols: number;
  rows: number;
}

interface Props {
  widget?: WidgetConfig;
  title?: string;
  layout: WidgetLayout;
  draggable?: boolean;
  resizable?: boolean;
  showSettings?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  draggable: true,
  resizable: true,
  showSettings: true,
});

const emit = defineEmits<{
  settings: [];
  remove: [];
  resize: [layout: WidgetLayout];
  move: [layout: WidgetLayout];
}>();

const isDragging = ref(false);
const isResizing = ref(false);

const gridStyle = computed(() => ({
  gridColumn: `${props.layout.x + 1} / span ${props.layout.cols}`,
  gridRow: `${props.layout.y + 1} / span ${props.layout.rows}`,
}));

function onDragStart(e: DragEvent) {
  isDragging.value = true;
  e.dataTransfer!.effectAllowed = "move";
  e.dataTransfer!.setData("text/plain", props.widget?.id ?? "");
}

function onDragEnd() {
  isDragging.value = false;
}

function onResizeStart(e: MouseEvent) {
  e.preventDefault();
  isResizing.value = true;
  const startX = e.clientX;
  const startY = e.clientY;
  const startCols = props.layout.cols;
  const startRows = props.layout.rows;

  const onMouseMove = (ev: MouseEvent) => {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    const newCols = Math.max(1, Math.min(12, startCols + Math.round(dx / 80)));
    const newRows = Math.max(1, Math.min(6, startRows + Math.round(dy / 80)));
    emit("resize", { ...props.layout, cols: newCols, rows: newRows });
  };

  const onMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}
</script>

<style scoped lang="scss">
.dashboard-widget {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s;
  position: relative;

  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
  &.is-dragging { opacity: 0.5; }
  &.is-resizing { user-select: none; }

  .widget-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: grab;
    flex-shrink: 0;

    &:active { cursor: grabbing; }
  }

  .widget-drag-handle {
    color: var(--el-text-color-placeholder);
    margin-right: 6px;
    display: flex;
    align-items: center;
  }

  .widget-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-actions { display: flex; gap: 1px; }

  .widget-body {
    flex: 1;
    min-height: 0;
    padding: 12px;
    overflow: auto;
  }

  .widget-resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 14px;
    height: 14px;
    cursor: nwse-resize;
    background: linear-gradient(135deg, transparent 50%, var(--el-border-color) 50%);
  }
}
</style>