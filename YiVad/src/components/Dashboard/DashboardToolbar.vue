<template>
  <div class="dashboard-toolbar">
    <div class="dashboard-toolbar__left">
      <span class="dashboard-toolbar__name">{{ name }}</span>
      <el-tag v-if="lastSaved" size="small" type="info">已保存 {{ lastSaved }}</el-tag>
    </div>
    <div class="dashboard-toolbar__right">
      <el-button size="small" :icon="Plus" type="primary" @click="$emit('add-widget')">添加小部件</el-button>
      <el-tooltip content="刷新全部数据">
        <el-button size="small" :icon="Refresh" @click="$emit('refresh-all')" :loading="refreshing" />
      </el-tooltip>
      <el-tooltip content="保存布局">
        <el-button size="small" :icon="Check" @click="$emit('save')" />
      </el-tooltip>
      <el-tooltip content="全屏模式">
        <el-button size="small" :icon="FullScreen" @click="$emit('fullscreen')" />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts" name="DashboardToolbar">
import { Plus, Refresh, Check, FullScreen } from "@element-plus/icons-vue";

interface Props {
  name?: string;
  lastSaved?: string;
  refreshing?: boolean;
}

defineProps<Props>();

defineEmits<{
  "add-widget": [];
  "refresh-all": [];
  save: [];
  fullscreen: [];
}>();
</script>

<style scoped lang="scss">
.dashboard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  flex-shrink: 0;

  &__left { display: flex; align-items: center; gap: 12px; }
  &__name { font-size: 16px; font-weight: 600; }
  &__right { display: flex; align-items: center; gap: 6px; }
}
</style>