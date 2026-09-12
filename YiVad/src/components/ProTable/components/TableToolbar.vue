<template>
  <div class="table-toolbar">
    <div class="table-toolbar__left">
      <slot name="left" />
    </div>
    <div class="table-toolbar__right">
      <slot name="right">
        <el-button :icon="RefreshRight" circle size="small" title="Refresh" @click="$emit('refresh')" />
        <el-button :icon="Download" circle size="small" title="Export" @click="$emit('export')" />
        <el-button :icon="Setting" circle size="small" title="Column settings" @click="$emit('columnSettings')" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshRight, Download, Setting } from "@element-plus/icons-vue";

defineEmits<{
  refresh: [];
  export: [];
  columnSettings: [];
}>();
</script>

<style scoped lang="scss">
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  &__left, &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>