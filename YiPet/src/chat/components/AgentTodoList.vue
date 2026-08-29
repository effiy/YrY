<script setup lang="ts">
/**
 * YiPet Chat — AgentTodoList (Vue 3 SFC)
 * Renders agent todo_write items with status icons.
 * Mirrors YiVad aiChat's todo list in agent timeline.
 */
import { CircleCheck, Select } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;

function statusLabel(status: string): string {
  if (status === 'completed') return 'Done';
  if (status === 'in_progress') return 'In progress';
  return 'Todo';
}
</script>

<template>
  <div v-if="s.agentTodos.length > 0" class="tl-todos">
    <div class="tl-todos-title">Tasks</div>
    <div
      v-for="(todo, i) in s.agentTodos"
      :key="todo.id || i"
      class="tl-todo-item"
      :class="`tl-todo-item--${todo.status}`"
    >
      <el-icon :size="12" class="tl-todo-status">
        <CircleCheck v-if="todo.status === 'completed'" />
        <Select v-else-if="todo.status === 'in_progress'" />
        <span v-else>○</span>
      </el-icon>
      <span class="tl-todo-text" :class="{ 'tl-todo-text--done': todo.status === 'completed' }">{{ todo.content }}</span>
      <span class="tl-todo-label">{{ statusLabel(todo.status) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tl-todos {
  padding: 8px 10px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
  border-radius: 8px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.06);
  font-size: 12px;
  color: var(--text-primary, #f5f3ff);

  &-title { font-weight: 600; margin-bottom: 6px; font-size: 11px; color: var(--text-secondary, #d4d0e8); }
}

.tl-todo-item {
  display: flex; align-items: center; gap: 6px;
  padding: 3px 0;

  &--completed { opacity: 0.6; }
}

.tl-todo-status { flex-shrink: 0; }
.tl-todo-text { flex: 1; line-height: 1.4; }
.tl-todo-text--done { text-decoration: line-through; }
.tl-todo-label {
  font-size: 10px; font-weight: 600; padding: 0 5px; border-radius: 4px;
  color: var(--text-secondary, #d4d0e8);
  background: rgba(255, 255, 255, 0.06);
}
</style>