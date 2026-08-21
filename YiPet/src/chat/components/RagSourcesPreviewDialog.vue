<script setup lang="ts">
import { useChatStore } from '../stores/chat';
const s = useChatStore().state;
</script>
<template>
  <dialog v-if="s.ragPreviewVisible" class="modal-overlay" open @click.self="s.ragPreviewVisible = false">
    <div class="modal-content">
      <div class="modal-header"><span>Sources: {{ s.ragPreviewQuestion }}</span><button @click="s.ragPreviewVisible = false">✕</button></div>
      <div class="modal-body">
        <div v-if="s.ragPreviewLoading">Loading...</div>
        <div v-for="src in s.ragPreviewSources" :key="src.path" class="source-item">
          <span class="src-path">{{ src.path }}</span>
          <span v-if="src.score" class="src-score">{{ src.score.toFixed(3) }}</span>
        </div>
      </div>
    </div>
  </dialog>
</template>
<style lang="scss" scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 2147483647; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; border: none; }
.modal-content { background: var(--bg-elevated, #1e1a3b); border-radius: 12px; min-width: 400px; max-width: 80vw; border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3); color: var(--text-primary, #f5f3ff); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2); font-weight: 600; }
.modal-header button { background: none; border: none; color: var(--text-secondary, #d4d0e8); cursor: pointer; font-size: 16px; }
.modal-body { padding: 16px; font-size: 13px; }
.source-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.1); gap: 8px; }
.src-path { font-family: monospace; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.src-score { font-size: 11px; color: var(--text-secondary, #d4d0e8); }
</style>