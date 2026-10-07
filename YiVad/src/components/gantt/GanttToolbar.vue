<template>
  <div class="gantt-toolbar">
    <div class="gantt-toolbar__left">
      <el-button-group>
        <el-button size="small" :type="viewOptions.viewMode === 'day' ? 'primary' : ''" @click="setViewMode('day')"> 日 </el-button>
        <el-button size="small" :type="viewOptions.viewMode === 'week' ? 'primary' : ''" @click="setViewMode('week')"> 周 </el-button>
        <el-button size="small" :type="viewOptions.viewMode === 'month' ? 'primary' : ''" @click="setViewMode('month')"> 月 </el-button>
      </el-button-group>
      <el-button size="small" @click="zoomIn"><el-icon><ZoomIn /></el-icon></el-button>
      <el-button size="small" @click="zoomOut"><el-icon><ZoomOut /></el-icon></el-button>
      <el-button size="small" @click="$emit('today')">今天</el-button>
      <el-divider direction="vertical" />
      <el-select :model-value="viewOptions.groupBy" size="small" style="width:100px" @change="setGroupBy">
        <el-option label="不分组" value="none" />
        <el-option label="按负责人" value="assignee" />
        <el-option label="按类型" value="type" />
      </el-select>
    </div>
    <div class="gantt-toolbar__right">
      <el-checkbox :model-value="viewOptions.showCriticalPath" size="small" @change="toggleCriticalPath"> 关键路径 </el-checkbox>
      <el-checkbox :model-value="viewOptions.showToday" size="small" @change="$emit('toggle-today')"> 今日线 </el-checkbox>
      <el-divider direction="vertical" />
      <el-button size="small" :icon="Refresh" @click="$emit('refresh')" />
      <el-button size="small" @click="$emit('fit')">适应屏幕</el-button>
      <el-button size="small" @click="$emit('export-png')">导出</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="GanttToolbar">
import { ZoomIn, ZoomOut, Refresh } from "@element-plus/icons-vue";
import type { GanttViewOptions } from "@/types/gantt";

defineProps<{
  viewOptions: GanttViewOptions;
  setViewMode: (mode: "day" | "week" | "month") => void;
  setGroupBy: (val: "none" | "assignee" | "type") => void;
  toggleCriticalPath: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}>();

defineEmits<{
  today: [];
  "toggle-today": [];
  refresh: [];
  fit: [];
  "export-png": [];
}>();
</script>

<style scoped lang="scss">
.gantt-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  margin-bottom: 8px;
}
.gantt-toolbar__left,
.gantt-toolbar__right {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>