<template>
  <div class="kanban-filters">
    <div class="kanban-filters__row">
      <span class="kanban-filters__label">{{ t("kanban.filters.typeLabel") }}</span>
      <el-check-tag
        v-for="(label, val) in issueTypeMap"
        :key="val"
        :checked="typeFilter.has(val as IssueType)"
        size="small"
        @change="() => $emit('toggle-type', val as IssueType)"
      >
        {{ label }}
      </el-check-tag>
    </div>
    <div class="kanban-filters__row">
      <span class="kanban-filters__label">{{ t("kanban.filters.priorityLabel") }}</span>
      <el-check-tag
        v-for="[val, label] in priorityFilters"
        :key="val"
        :checked="priorityFilter.has(val)"
        size="small"
        @change="() => $emit('toggle-priority', val)"
      >
        {{ label }}
      </el-check-tag>
    </div>
  </div>
</template>

<script setup lang="ts" name="KanbanFilters">
import { useI18n } from "vue-i18n";
import { ISSUE_TYPE_MAP } from "@/api/modules/issueService";
import type { IssuePriority, IssueType } from "@/api/modules/issueService";

defineProps<{
  typeFilter: Set<IssueType>;
  priorityFilter: Set<IssuePriority>;
}>();

defineEmits<{
  "toggle-type": [val: IssueType];
  "toggle-priority": [val: IssuePriority];
}>();

const { t } = useI18n();
const issueTypeMap = ISSUE_TYPE_MAP;

const priorityFilters: [IssuePriority, string][] = [
  ["urgent", "Urgent"],
  ["high", "High"],
  ["medium", "Medium"],
  ["low", "Low"]
];
</script>

<style scoped lang="scss">
.kanban-filters {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.kanban-filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.kanban-filters__label {
  min-width: 48px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
