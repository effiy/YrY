<script setup lang="ts" name="aiChatTodoPanel">
import type { TodoItem } from "@/api/modules/agentService";

defineProps<{ todos: TodoItem[] }>();

function statusLabel(s: TodoItem["status"]): string {
  if (s === "completed") return "完成";
  if (s === "in_progress") return "进行中";
  return "待办";
}
</script>

<template>
  <div v-if="todos.length" class="tp-panel">
    <div class="tp-header">📋 任务清单</div>
    <div v-for="t in todos" :key="t.id" class="tp-item" :class="t.status">
      <span class="tp-mark">{{ t.status === "completed" ? "✓" : t.status === "in_progress" ? "▶" : "○" }}</span>
      <span class="tp-content">{{ t.content }}</span>
      <span class="tp-status">{{ statusLabel(t.status) }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tp-panel {
  margin-bottom: 8px;
  padding: 8px 12px;
  font-size: 12px;
  background: var(--el-color-info-light-9);
  border: 1px solid var(--el-color-info-light-7);
  border-radius: 6px;
}

.tp-header {
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tp-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  line-height: 1.6;
}

.tp-mark {
  width: 14px;
  text-align: center;
  color: var(--el-color-info);
}

.tp-item.in_progress .tp-mark {
  color: var(--el-color-primary);
}

.tp-item.completed .tp-mark {
  color: var(--el-color-success);
}

.tp-content {
  flex: 1;
  color: var(--el-text-color-regular);
}

.tp-item.completed .tp-content {
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
}

.tp-status {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
</style>
