<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="kanban-ctxmenu"
      :style="{ left: x + 'px', top: y + 'px' }"
      @click.stop
    >
      <div class="kanban-ctxmenu__item" @click="$emit('quick-status', 'todo')">
        <el-icon><ArrowRight /></el-icon>{{ t("kanban.contextMenu.moveToTodo") }}
      </div>
      <div class="kanban-ctxmenu__item" @click="$emit('quick-status', 'in_progress')">
        <el-icon><ArrowRight /></el-icon>{{ t("kanban.contextMenu.moveToInProgress") }}
      </div>
      <div class="kanban-ctxmenu__item" @click="$emit('quick-status', 'in_review')">
        <el-icon><ArrowRight /></el-icon>{{ t("kanban.contextMenu.moveToInReview") }}
      </div>
      <div class="kanban-ctxmenu__item" @click="$emit('quick-status', 'done')">
        <el-icon><CircleCheck /></el-icon>{{ t("kanban.contextMenu.moveToDone") }}
      </div>
      <div class="kanban-ctxmenu__divider" />
      <div class="kanban-ctxmenu__item" @click="$emit('edit-priority', 'urgent')">
        <span class="kanban-ctxmenu__priority" style="color:#f56c6c">●</span> Urgent
      </div>
      <div class="kanban-ctxmenu__item" @click="$emit('edit-priority', 'high')">
        <span class="kanban-ctxmenu__priority" style="color:#e6a23c">●</span> High
      </div>
      <div class="kanban-ctxmenu__item" @click="$emit('edit-priority', 'medium')">
        <span class="kanban-ctxmenu__priority" style="color:#409eff">●</span> Medium
      </div>
      <div class="kanban-ctxmenu__item" @click="$emit('edit-priority', 'low')">
        <span class="kanban-ctxmenu__priority" style="color:#909399">●</span> Low
      </div>
      <div class="kanban-ctxmenu__divider" />
      <div class="kanban-ctxmenu__item kanban-ctxmenu__item--danger" @click="$emit('delete')">
        <el-icon><Delete /></el-icon>{{ t("kanban.contextMenu.deleteIssue") }}
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts" name="KanbanContextMenu">
import { useI18n } from "vue-i18n";
import { ArrowRight, CircleCheck, Delete } from "@element-plus/icons-vue";
import type { IssueStatus, IssuePriority } from "@/api/modules/issueService";

defineProps<{
  visible: boolean;
  x: number;
  y: number;
}>();

defineEmits<{
  "quick-status": [status: IssueStatus];
  "edit-priority": [priority: IssuePriority];
  delete: [];
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.kanban-ctxmenu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-width: 180px;
}

.kanban-ctxmenu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--el-text-color-primary);

  .el-icon { font-size: 14px; color: var(--el-text-color-secondary); }

  &:hover { background: var(--el-fill-color-light); }

  &--danger {
    color: var(--el-color-danger);
    .el-icon { color: var(--el-color-danger); }
    &:hover { background: var(--el-color-danger-light-9); }
  }
}

.kanban-ctxmenu__priority {
  font-size: 10px;
}

.kanban-ctxmenu__divider {
  height: 1px;
  background: var(--el-border-color-lighter);
  margin: 4px 8px;
}
</style>
