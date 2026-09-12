<template>
  <div class="dashboard-grid" ref="gridRef">
    <div
      v-for="widget in widgets"
      :key="widget.id"
      class="dashboard-grid__cell"
      :style="cellStyle(widget.layout)"
      @dragover.prevent="onDragOver($event, widget.id)"
      @drop="onDrop($event, widget.id)"
    >
      <DashboardWidget
        :widget="widget"
        :layout="widget.layout"
        :draggable="editable"
        :resizable="editable"
        :show-settings="editable"
        @remove="$emit('remove-widget', widget.id)"
        @settings="$emit('settings-widget', widget.id)"
        @resize="(layout) => $emit('resize-widget', widget.id, layout)"
      >
        <component
          v-if="widget.component"
          :is="widget.component"
          v-bind="widget.props ?? {}"
          @chartClick="(p: unknown) => $emit('widget-event', widget.id, 'chartClick', p)"
        />
        <div v-else class="dashboard-grid__placeholder">
          <el-icon :size="24"><WarningFilled /></el-icon>
          <span>未知小部件: {{ widget.widgetType }}</span>
        </div>
      </DashboardWidget>
    </div>

    <div class="dashboard-grid__empty" v-if="widgets.length === 0">
      <el-icon :size="40"><GridIcon /></el-icon>
      <p>仪表盘为空</p>
      <el-button type="primary" @click="$emit('add-widget')">添加小部件</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="DashboardGrid">
import { ref } from "vue";
import { WarningFilled, Grid as GridIcon } from "@element-plus/icons-vue";
import DashboardWidget from "./DashboardWidget.vue";
import type { WidgetConfig, WidgetLayout } from "@/stores/dashboard";

interface Props {
  widgets: WidgetConfig[];
  editable?: boolean;
}

withDefaults(defineProps<Props>(), {
  editable: true,
});

const emit = defineEmits<{
  "remove-widget": [id: string];
  "settings-widget": [id: string];
  "resize-widget": [id: string, layout: WidgetLayout];
  "move-widget": [id: string, layout: WidgetLayout];
  "add-widget": [];
  "widget-event": [id: string, event: string, payload: unknown];
}>();

const gridRef = ref<HTMLElement>();

function cellStyle(layout: WidgetLayout) {
  return {
    gridColumn: `${layout.x + 1} / span ${layout.cols}`,
    gridRow: `${layout.y + 1} / span ${layout.rows}`,
  };
}

function onDragOver(e: DragEvent, _targetId: string) {
  e.dataTransfer!.dropEffect = "move";
}

function onDrop(e: DragEvent, targetId: string) {
  const sourceId = e.dataTransfer!.getData("text/plain");
  if (sourceId && sourceId !== targetId) {
    emit("move-widget", sourceId, { x: 0, y: 0, cols: 1, rows: 1 });
  }
}
</script>

<style scoped lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 12px;
  min-height: 300px;
  padding: 4px;

  &__cell {
    min-height: 160px;
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    color: var(--el-text-color-placeholder);
    font-size: 13px;
  }

  &__empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 12px;
    color: var(--el-text-color-secondary);

    p { margin: 0; font-size: 14px; }
  }
}
</style>