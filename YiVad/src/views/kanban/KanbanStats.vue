<template>
  <div class="kanban-stats">
    <div class="kanban-stats__item" @click="$emit('clear-filters')">
      <span class="kanban-stats__value">{{ totalIssues }}</span>
      <span class="kanban-stats__label">{{ t("kanban.stats.total") }}</span>
    </div>
    <div class="kanban-stats__item" :class="{ 'is-active': urgentCount > 0 }">
      <span class="kanban-stats__value is-urgent">{{ urgentCount }}</span>
      <span class="kanban-stats__label">{{ t("kanban.stats.urgent") }}</span>
    </div>
    <div class="kanban-stats__item" :class="{ 'is-active': overdueCount > 0 }">
      <span class="kanban-stats__value is-overdue">{{ overdueCount }}</span>
      <span class="kanban-stats__label">{{ t("kanban.stats.overdue") }}</span>
    </div>
    <div class="kanban-stats__item">
      <span class="kanban-stats__value is-done">{{ doneCount }}</span>
      <span class="kanban-stats__label">{{ t("kanban.stats.done") }}</span>
    </div>
    <div class="kanban-stats__item">
      <span class="kanban-stats__value">{{ completionPct }}%</span>
      <span class="kanban-stats__label">{{ t("kanban.stats.completed") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="KanbanStats">
import { useI18n } from "vue-i18n";

defineProps<{
  totalIssues: number;
  urgentCount: number;
  overdueCount: number;
  doneCount: number;
  completionPct: number;
}>();

defineEmits<{
  "clear-filters": [];
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.kanban-stats {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.kanban-stats__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background: var(--el-border-color-lighter);
  }

  &:hover {
    background: var(--el-fill-color-light);
  }

  &:first-child {
    cursor: pointer;

    &:hover .kanban-stats__value {
      color: var(--el-color-primary);
    }
  }
}

.kanban-stats__value {
  font-size: 16px;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;

  &.is-urgent {
    color: var(--el-color-danger);
  }

  &.is-overdue {
    color: var(--el-color-warning);
  }

  &.is-done {
    color: var(--el-color-success);
  }
}

.kanban-stats__label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>
