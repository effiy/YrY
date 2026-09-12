<script setup lang="ts">
import { useChatStore } from '../stores/chat';
const s = useChatStore().state;
</script>
<template>
  <dialog v-if="s.sessionSummaryVisible" class="modal-overlay" open @click.self="s.sessionSummaryVisible = false">
    <div class="modal-content"><div class="modal-header"><span>Session Summary</span><button @click="s.sessionSummaryVisible = false">✕</button></div><div class="modal-body"><div v-if="s.sessionSummaryLoading">Summarizing...</div><div v-else>{{ s.sessionSummaryText }}</div></div></div>
  </dialog>
</template>
<style lang="scss" scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; border: none; }
.modal-content { background: var(--bg-elevated, #1e1a3b); border-radius: 12px; min-width: 400px; max-width: 80vw; border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3); color: var(--text-primary, #f5f3ff); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2); font-weight: 600; }
.modal-header button { background: none; border: none; color: var(--text-secondary, #d4d0e8); cursor: pointer; font-size: 16px; }
.modal-body { padding: 16px; font-size: 13px; white-space: pre-wrap; }
</style>