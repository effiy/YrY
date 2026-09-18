<template>
  <div class="kanban-progress-bar">
    <div
      v-for="segment in segments"
      :key="segment.status"
      class="kanban-progress-bar__segment"
      :style="{ width: segment.width + '%', background: segment.color }"
      :title="`${segment.label}: ${segment.count}`"
    />
  </div>
</template>

<script setup lang="ts" name="KanbanProgressBar">
import type { IssueStatus } from "@/api/modules/issueService";

interface ProgressSegment {
  status: IssueStatus;
  label: string;
  color: string;
  count: number;
  width: number;
}

defineProps<{
  segments: ProgressSegment[];
}>();
</script>

<style scoped lang="scss">
.kanban-progress-bar {
  display: flex;
  flex-shrink: 0;
  height: 4px;
  margin-bottom: 12px;
  overflow: hidden;
  background: var(--el-fill-color);
  border-radius: 2px;
}
.kanban-progress-bar__segment {
  min-width: 0;
  transition: width 0.4s ease;
}
</style>
