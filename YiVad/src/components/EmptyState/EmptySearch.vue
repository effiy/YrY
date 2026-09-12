<template>
  <EmptyState title="No results found" :description="`No matches for '${keyword}'. Try a different keyword.`" :action-text="'Clear search'" @action="$emit('clear')">
    <template #illustration>
      <el-icon :size="64" color="var(--el-text-color-disabled)"><Search /></el-icon>
    </template>
  </EmptyState>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import EmptyState from "./EmptyState.vue";

defineProps<{ keyword?: string }>();
defineEmits<{ clear: [] }>();
</script>