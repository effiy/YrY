<script setup lang="ts">
/**
 * YiPet Chat — ConfirmationBanner (Vue 3 SFC)
 * Tool confirmation banner for agent mode — approve/reject pending tool calls.
 * Mirrors YiVad aiChat's confirmation banner.
 */
import { Select, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;
</script>

<template>
  <div v-if="s.pendingConfirmation" class="cb-confirmation">
    <el-icon :size="14" class="cb-confirmation-icon"><Select /></el-icon>
    <div class="cb-confirmation-body">
      <div class="cb-confirmation-text">
        Tool <code>{{ s.pendingConfirmation.toolName }}</code> requires confirmation
        — approve to let the agent run it, or reject to skip.
      </div>
      <div v-if="Object.keys(s.pendingConfirmation.toolArgs).length" class="cb-confirmation-args">
        <code>{{ JSON.stringify(s.pendingConfirmation.toolArgs) }}</code>
      </div>
      <div class="cb-confirmation-actions">
        <el-button size="small" type="success" :icon="CircleCheck" @click="store.approveConfirmation?.()">Approve</el-button>
        <el-button size="small" :icon="CircleClose" class="cb-confirmation-btn--reject" @click="store.rejectConfirmation?.()">Reject</el-button>
      </div>
      <div class="cb-confirmation-hint">
        Or reply in chat — 可以/好/yes to approve, 不要/取消/no to reject
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cb-confirmation {
  display: flex; gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.35);
  border-radius: 8px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.08);
  font-size: 12px;
  color: var(--text-primary, #f5f3ff);

  &-icon { flex-shrink: 0; margin-top: 1px; color: var(--primary-light, #818cf8); }
  &-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  &-text { line-height: 1.5; code { font-family: monospace; font-size: 11px; } }
  &-args {
    code {
      font-size: 10px; font-family: monospace;
      color: var(--text-secondary, #d4d0e8);
      background: rgba(0, 0, 0, 0.2);
      padding: 4px 6px; border-radius: 4px;
      display: block; max-height: 80px; overflow-y: auto;
      white-space: pre-wrap; word-break: break-all;
    }
  }
  &-actions { display: flex; gap: 6px; }
  &-btn--reject { color: var(--danger, #ef4444); }
  &-hint { font-size: 10px; color: var(--text-secondary, #d4d0e8); font-style: italic; }
}
</style>