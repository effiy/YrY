<script setup lang="ts">
/**
 * YiPet Chat — QuickButtons (Vue 3 SFC)
 * Mirrors YiVad ai-chat-box QuickButtons: horizontal chip row of curated
 * prompts, with template variants carrying a "template" badge. Sits as a
 * sibling of ci-input so it appears as an independent action band.
 */
import { computed } from 'vue';
import { useChatStore } from '../stores/chat';
import { QUICK_BUTTONS, QUICK_BUTTONS_NEW } from '../constants';
import type { QuickButton } from '../constants';

const store = useChatStore();
const s = store.state;

const chipIcons: Record<string, string> = {
  roadmap_review: '🗺',
  adr_review: '📋',
  dora_metrics: '📊',
  tech_debt: '🛠',
  tech_selection: '🔍',
  org_diagnose: '🏢',
  postmortem: '🚨',
  capacity_cost: '💰'
};

// Page-context chip (e.g. inject current page URL into the prompt).
const contextChip = computed(() => {
  try {
    const fn = (store as any).pageContextChip;
    return typeof fn === 'function' ? fn() : null;
  } catch {
    return null;
  }
});

function onClick(b: QuickButton) {
  try {
    if (s.isProcessing) return;
    if (b?.template) {
      s.inputTemplate = b.content || '';
      return;
    }
    store.sendMessage?.(b.content || '');
  } catch { /* swallow: chip is decorative */ }
}

function onContextChip() {
  if (s.isProcessing) return;
  try { store.applyPageContextChip?.(); } catch { /* noop */ }
}
</script>

<template>
  <!-- qb-row: sibling of ci-input, mirrors YiVad ai-chat-box QuickButtons -->
  <div
    v-if="s.messages.length === 0"
    class="qb-row"
    role="toolbar"
    aria-label="Quick action prompts"
  >
    <button
      v-if="contextChip"
      type="button"
      class="qb-chip qb-chip--context"
      :disabled="s.isProcessing"
      :title="contextChip.prompt"
      @click="onContextChip"
    >
      <span class="qb-chip-icon">🌐</span>
      <span class="qb-chip-label">{{ contextChip.label }}</span>
    </button>
    <button
      v-for="b in QUICK_BUTTONS"
      :key="b.value"
      type="button"
      class="qb-chip qb-chip--normal"
      :disabled="s.isProcessing"
      :title="b.content"
      @click="onClick(b)"
    >
      <span class="qb-chip-icon">{{ chipIcons[b.value] || '💡' }}</span>
      <span class="qb-chip-label">{{ b.label }}</span>
    </button>
    <button
      v-for="b in QUICK_BUTTONS_NEW"
      :key="b.value"
      type="button"
      class="qb-chip qb-chip--special"
      :disabled="s.isProcessing"
      :title="b.content"
      @click="onClick(b)"
    >
      <span class="qb-chip-icon">{{ chipIcons[b.value] || '✨' }}</span>
      <span class="qb-chip-label">{{ b.label }}</span>
      <span class="qb-chip-badge">template</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.qb-row {
  display: flex;
  flex-shrink: 0;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 8px 14px;
  background: #141228;
  border-top: 1px solid rgba(99, 102, 241, 0.18);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
}

.qb-chip {
  display: inline-flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: #f5f3ff;
  cursor: pointer;
  user-select: none;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 999px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s,
    background 0.15s;

  &:hover:not(:disabled) {
    border-color: rgba(99, 102, 241, 0.55);
    background: rgba(99, 102, 241, 0.22);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.18);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.97);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.qb-chip-icon {
  font-size: 14px;
  line-height: 1;
}

.qb-chip-label {
  white-space: nowrap;
}

.qb-chip-badge {
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  color: #fde68a;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: rgba(234, 179, 8, 0.18);
  border-radius: 8px;
}

// ── Variants ──
.qb-chip--context {
  color: #86efac;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.4);

  &:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.22);
    border-color: rgba(34, 197, 94, 0.6);
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.18);
  }
}

.qb-chip--special {
  color: #fde68a;
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.42);

  &:hover:not(:disabled) {
    background: rgba(234, 179, 8, 0.22);
    border-color: rgba(234, 179, 8, 0.62);
    box-shadow: 0 2px 8px rgba(234, 179, 8, 0.18);
  }
}

// ── Responsive ──
@media (max-width: 480px) {
  .qb-row {
    padding: 6px 10px;
    gap: 6px;
    min-height: 40px;
  }
  .qb-chip {
    padding: 5px 10px;
    font-size: 12px;
  }
}
</style>
