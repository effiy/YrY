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
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
  flex-shrink: 0;
  background: var(--el-fill-color);
}

.kanban-progress-bar__segment {
  transition: width 0.4s ease;
  min-width: 0;
}
</style>
