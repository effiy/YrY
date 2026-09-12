<template>
  <div class="demo-layout">
    <div class="demo-sidebar">
      <h3>列表组件演示</h3>
      <el-menu :default-active="active" @select="onSelect">
        <el-menu-item index="virtual-scroll">虚拟滚动</el-menu-item>
        <el-menu-item index="columns">列管理</el-menu-item>
        <el-menu-item index="batch">批量操作</el-menu-item>
        <el-menu-item index="export">导出系统</el-menu-item>
        <el-menu-item index="inline-edit">行内编辑</el-menu-item>
        <el-menu-item index="views">视图切换</el-menu-item>
        <el-menu-item index="conditional-format">条件格式</el-menu-item>
        <el-menu-item index="tree-table">树形表格</el-menu-item>
        <el-menu-item index="pivot">数据透视表</el-menu-item>
        <el-menu-item index="full">完整集成</el-menu-item>
      </el-menu>
    </div>
    <div class="demo-main">
      <div class="demo-header">
        <h2>{{ title }}</h2>
        <p class="demo-desc">{{ description }}</p>
      </div>
      <div class="demo-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ active: string; title: string; description: string }>();
const emit = defineEmits<{ select: [index: string] }>();
const onSelect = (index: string) => emit("select", index);
</script>

<style scoped>
.demo-layout {
  display: flex;
  height: 100%;
  background: var(--el-bg-color-page);
}
.demo-sidebar {
  width: 220px;
  border-right: 1px solid var(--el-border-color-light);
  padding: 16px 0;
  background: var(--el-bg-color);
  overflow-y: auto;
}
.demo-sidebar h3 {
  padding: 0 16px 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.demo-main {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
.demo-header {
  margin-bottom: 20px;
}
.demo-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
}
.demo-desc {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.demo-content {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
}
</style>