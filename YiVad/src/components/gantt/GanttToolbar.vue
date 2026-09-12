<template>
  <div class="gantt-toolbar">
    <div class="gantt-toolbar__left">
      <el-button-group>
        <el-button size="small" :type="viewOptions.viewMode === 'day' ? 'primary' : ''" @click="setViewMode('day')">
          日
        </el-button>
        <el-button size="small" :type="viewOptions.viewMode === 'week' ? 'primary' : ''" @click="setViewMode('week')">
          周
        </el-button>
        <el-button size="small" :type="viewOptions.viewMode === 'month' ? 'primary' : ''" @click="setViewMode('month')">
          月
        </el-button>
      </el-button-group>
      <el-button size="small" @click="zoomIn">
        <el-icon><ZoomIn /></el-icon>
      </el-button>
      <el-button size="small" @click="zoomOut">
        <el-icon><ZoomOut /></el-icon>
      </el-button>
      <el-button size="small" @click="$emit('today')">今天</el-button>
    </div>
    <div class="gantt-toolbar__right">
      <el-checkbox :model-value="viewOptions.showCriticalPath" size="small" @change="toggleCriticalPath">
        关键路径
      </el-checkbox>
      <el-checkbox :model-value="viewOptions.showToday" size="small" @change="$emit('toggle-today')">
        今日线
      </el-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts" name="GanttToolbar">
import { ZoomIn, ZoomOut } from "@element-plus/icons-vue";
import type { GanttViewOptions } from "@/types/gantt";

defineProps<{
  viewOptions: GanttViewOptions;
  setViewMode: (mode: "day" | "week" | "month") => void;
  toggleCriticalPath: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}>();

defineEmits<{
  today: [];
  "toggle-today": [];
}>();
</script>

<style scoped lang="scss">
.gantt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}
.gantt-toolbar__left,
.gantt-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>