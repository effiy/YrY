<script setup lang="ts">
import { useChatStore } from '../stores/chat';
const store = useChatStore(); const s = store.state;
</script>
<template>
  <dialog v-if="s.ragDecomposeVisible" class="modal-overlay" open @click.self="s.ragDecomposeVisible = false">
    <div class="modal-content">
      <div class="modal-header"><span>Decompose: {{ s.ragDecomposeQuestion }}</span><button @click="s.ragDecomposeVisible = false">✕</button></div>
      <div class="modal-body"><div v-if="s.ragDecomposeLoading">Decomposing...</div><div v-else-if="s.ragDecomposeData">{{ s.ragDecomposeData.synthesis }}</div></div>
    </div>
  </dialog>
</template>
<style lang="scss" scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; border: none; }
.modal-content { background: var(--bg-elevated, #1e1a3b); border-radius: 12px; min-width: 400px; max-width: 80vw; max-height: 80vh; border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3); color: var(--text-primary, #f5f3ff); display: flex; flex-direction: column; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2); font-weight: 600; }
.modal-header button { background: none; border: none; color: var(--text-secondary, #d4d0e8); cursor: pointer; font-size: 16px; }
.modal-body { padding: 16px; font-size: 13px; }
</style>