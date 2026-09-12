<template>
  <div class="chart-toolbar">
    <el-tooltip content="导出图片" v-if="exportable">
      <el-button size="small" text :icon="Download" @click="$emit('export')" />
    </el-tooltip>
    <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" v-if="fullscreenable">
      <el-button size="small" text @click="$emit('fullscreen')">
        <el-icon :size="14"><FullScreen v-if="!isFullscreen" /><CopyDocument v-else /></el-icon>
      </el-button>
    </el-tooltip>
    <el-tooltip content="刷新数据" v-if="refreshable">
      <el-button size="small" text :icon="Refresh" @click="$emit('refresh')" />
    </el-tooltip>
  </div>
</template>

<script setup lang="ts" name="ChartToolbar">
import { Download, Refresh, FullScreen, CopyDocument } from "@element-plus/icons-vue";

defineProps<{
  exportable?: boolean;
  fullscreenable?: boolean;
  refreshable?: boolean;
  isFullscreen?: boolean;
}>();

defineEmits<{
  export: [];
  fullscreen: [];
  refresh: [];
}>();
</script>

<style scoped lang="scss">
.chart-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>