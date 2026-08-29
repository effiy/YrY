<script setup lang="ts">
/**
 * YiPet Popup — AppFooter
 * Status hint line + version badge.
 */
defineProps<{
  hintText: string;
  version: string;
}>();
</script>

<template>
  <div class="popup-footer-row">
    <span class="popup-footer-hint">{{ hintText }}</span>
    <span class="popup-footer-version">{{ version }}</span>
  </div>
</template>

<style scoped>
.popup-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
}

.popup-footer-hint {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: var(--text-secondary, #d4d0e8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popup-footer-version {
  flex-shrink: 0;
  font-size: 10px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: var(--text-muted, rgba(212, 208, 232, 0.5));
  background: var(--bg-tertiary, #312d55);
  padding: 2px 8px;
  border-radius: 10px;
}
</style>