<script setup lang="ts">
import { useChatStore } from '../stores/chat';
const store = useChatStore();
const s = store.state;
</script>
<template>
  <dialog v-if="s.bugReportVisible" class="modal-overlay" open @click.self="store.closeBugReport()">
    <div class="modal-content">
      <div class="modal-header"><span>Bug Report</span><button @click="store.closeBugReport()">✕</button></div>
      <div class="modal-body"><p>Bug report form — port in progress</p></div>
    </div>
  </dialog>
</template>
<style lang="scss" scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; border: none; max-width: 100vw; max-height: 100vh; }
.modal-content { background: var(--bg-elevated, #1e1a3b); border-radius: 12px; min-width: 400px; max-width: 90vw; border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3); color: var(--text-primary, #f5f3ff); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2); font-weight: 600; }
.modal-header button { background: none; border: none; color: var(--text-secondary, #d4d0e8); cursor: pointer; font-size: 16px; }
.modal-body { padding: 16px; font-size: 13px; }
</style>