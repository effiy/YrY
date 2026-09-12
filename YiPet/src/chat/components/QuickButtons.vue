<script setup lang="ts">
/**
 * YiPet Chat — QuickButtons (Vue 3 SFC)
 */
import { computed } from 'vue';
import { useChatStore } from '../stores/chat';
import { QUICK_BUTTONS, QUICK_BUTTONS_NEW } from '../constants';
import type { QuickButton } from '../constants';

const store = useChatStore();
const s = store.state;

const chip = computed(() => store.pageContextChip?.());

function onClick(b: QuickButton) {
  if (s.isProcessing) return;
  if (b.template) {
    s.inputTemplate = b.content;
    return;
  }
  store.sendMessage(b.content);
}
</script>

<template>
  <div class="qb-row">
    <span
      v-if="chip"
      class="qb-chip qb-chip--context"
      :class="{ 'is-disabled': s.isProcessing }"
      @click="!s.isProcessing && store.applyPageContextChip?.()"
    >
      {{ chip.label }}
    </span>
    <span
      v-for="b in QUICK_BUTTONS"
      :key="b.value"
      class="qb-chip qb-chip--normal"
      :class="{ 'is-disabled': s.isProcessing }"
      @click="onClick(b)"
    >
      {{ b.label }}
    </span>
    <span
      v-for="b in QUICK_BUTTONS_NEW"
      :key="b.value"
      class="qb-chip qb-chip--special"
      :class="{ 'is-disabled': s.isProcessing }"
      @click="onClick(b)"
    >
      {{ b.label }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.qb-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  padding: 4px 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.qb-chip {
  display: inline-block;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  line-height: 1.4;

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.qb-chip--context {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
  font-weight: 500;

  &:hover:not(.is-disabled) {
    background: rgba(34, 197, 94, 0.22);
    border-color: rgba(34, 197, 94, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
  }
}

.qb-chip--normal {
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  color: var(--primary-light, #818cf8);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);

  &:hover:not(.is-disabled) {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  }
}

.qb-chip--special {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
  border: 1px solid rgba(234, 179, 8, 0.3);

  &:hover:not(.is-disabled) {
    background: rgba(234, 179, 8, 0.2);
    border-color: rgba(234, 179, 8, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(234, 179, 8, 0.15);
  }
}
</style>