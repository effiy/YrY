<template>
  <div class="kanban-col" :class="`kanban-col--${status}`">
    <div class="kanban-col__head" :style="{ background: headerBg }">
      <div class="kanban-col__head-row">
        <span class="kanban-col__title">{{ label }}</span>
        <div class="kanban-col__head-actions">
          <el-tag size="small" round :type="countTagType">{{ issues.length }}</el-tag>
          <el-dropdown trigger="click" @command="(cmd: string) => $emit('sort', cmd)">
            <el-button size="small" text style="padding: 2px 4px; margin-left: 2px">
              <el-icon><Sort /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="priority">{{ t("kanban.column.sort.priority") }}</el-dropdown-item>
                <el-dropdown-item command="due_date">{{ t("kanban.column.sort.dueDate") }}</el-dropdown-item>
                <el-dropdown-item command="updated_at">{{ t("kanban.column.sort.recent") }}</el-dropdown-item>
                <el-dropdown-item command="created_at">{{ t("kanban.column.sort.created") }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div v-if="overdueCount > 0" class="kanban-col__overdue">
        <el-icon><Clock /></el-icon> {{ overdueCount }}{{ t("kanban.column.overdueSuffix") }}
      </div>
    </div>

    <draggable
      :list="issues"
      :group="{ name: 'issues', pull: true, put: true }"
      item-key="key"
      class="kanban-col__body"
      ghost-class="kanban-col__card--ghost"
      :animation="200"
      @change="(evt: any) => $emit('drag-change', evt)"
    >
      <template #item="{ element }">
        <slot name="card" :element="element"></slot>
      </template>
    </draggable>
    <div v-if="issues.length === 0" class="kanban-col__empty">
      <el-icon :size="28"><Folder /></el-icon>
      <span>{{ t("kanban.column.noIssues") }}</span>
    </div>

    <div class="kanban-col__foot">
      <el-button text @click="$emit('add')">
        <el-icon><Plus /></el-icon>{{ t("kanban.column.addIssue") }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="KanbanColumn">
import { useI18n } from "vue-i18n";
import { Sort, Clock, Folder, Plus } from "@element-plus/icons-vue";
import draggable from "vuedraggable";
import type { Issue, IssueStatus } from "@/api/modules/issueService";
import type { BugDocument } from "@/api/modules/bug";

export type KanbanColumnItem = Issue | BugDocument;

defineProps<{
  status: IssueStatus;
  label: string;
  color: string;
  headerBg: string;
  countTagType: "info" | "primary" | "warning" | "success" | "danger";
  issues: KanbanColumnItem[];
  overdueCount: number;
}>();

defineEmits<{
  sort: [cmd: string];
  "drag-change": [evt: any];
  add: [];
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.kanban-col {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  width: 290px;
  min-width: 290px;
  min-height: 260px;
  max-height: none;
  overflow: hidden;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
}
.kanban-col__head {
  position: sticky;
  top: 0;
  z-index: 1;
  flex-shrink: 0;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.kanban-col__head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.kanban-col__head-actions {
  display: flex;
  gap: 2px;
  align-items: center;
}
.kanban-col__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.kanban-col__overdue {
  display: flex;
  gap: 3px;
  align-items: center;
  margin-top: 5px;
  font-size: 11px;
  color: var(--el-color-danger);
  .el-icon {
    font-size: 12px;
  }
}
.kanban-col__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 50px;
  padding: 10px;
  overflow-y: visible;
}
.kanban-col__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 28px 24px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.kanban-col__card--ghost {
  background: var(--el-color-primary-light-8);
  border: 2px dashed var(--el-color-primary);
  opacity: 0.35;
}
.kanban-col__foot {
  position: sticky;
  bottom: 0;
  flex-shrink: 0;
  padding: 8px 10px;
  background: inherit;
  border-top: 1px solid var(--el-border-color-lighter);
  :deep(.el-button) {
    justify-content: flex-start;
    width: 100%;
    color: var(--el-text-color-secondary);
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
