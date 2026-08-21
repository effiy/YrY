<script setup lang="ts">
/**
 * YiPet Chat — AgentPanel (Vue 3 SFC)
 * Displays agent todo list, tool calls, notes, and confirmations.
 */
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;
</script>

<template>
  <div v-if="s.agentMode && (s.agentTodos.length > 0 || s.agentToolCalls.length > 0 || s.agentNotes.length > 0)" class="agent-panel">
    <div v-if="s.agentTodos.length > 0" class="ap-section">
      <div class="ap-title">Todos</div>
      <div v-for="todo in s.agentTodos" :key="todo.id" class="ap-todo">
        <span :class="{ 'is-done': todo.status === 'completed' }">{{ todo.status === 'completed' ? '✓' : '○' }}</span>
        <span>{{ todo.content }}</span>
      </div>
    </div>
    <div v-if="s.agentToolCalls.length > 0" class="ap-section">
      <div class="ap-title">Tool Calls</div>
      <div v-for="tc in s.agentToolCalls" :key="tc.id" class="ap-toolcall">
        <span class="ap-tc-name">{{ tc.name }}</span>
        <span class="ap-tc-status" :class="`ap-tc--${tc.status}`">{{ tc.status }}</span>
      </div>
    </div>
    <div v-if="s.pendingConfirmation" class="ap-confirm">
      <span>Allow {{ s.pendingConfirmation.toolName }}?</span>
      <button @click="store.approveConfirmation?.()">Approve</button>
      <button @click="store.rejectConfirmation?.()">Reject</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.agent-panel {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
}

.ap-section { margin-bottom: 6px; }
.ap-title { font-weight: 600; margin-bottom: 4px; color: var(--text-primary, #f5f3ff); }
.ap-todo { display: flex; gap: 6px; padding: 2px 0; }
.ap-toolcall { display: flex; gap: 8px; padding: 2px 0; }
.ap-tc-name { font-family: monospace; }
.ap-tc--running { color: #f59e0b; }
.ap-tc--done { color: #22c55e; }
.ap-tc--error { color: #ef4444; }
.ap-confirm { display: flex; gap: 8px; align-items: center; padding: 4px 0; }
.ap-confirm button { padding: 2px 8px; font-size: 11px; border-radius: 4px; border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3); background: rgba(var(--primary-rgb, 99, 102, 241), 0.1); color: var(--primary-light, #818cf8); cursor: pointer; }
</style>