<template>
  <EmptyState title="No data matching filters" description="Try adjusting your filter conditions." :action-text="'Reset filters'" @action="$emit('reset')">
    <template #illustration>
      <el-icon :size="64" color="var(--el-text-color-disabled)"><Filter /></el-icon>
    </template>
  </EmptyState>
</template>

<script setup lang="ts">
import { Filter } from "@element-plus/icons-vue";
import EmptyState from "./EmptyState.vue";

defineEmits<{ reset: [] }>();
</script>