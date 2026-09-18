<script setup lang="ts" name="aiChatQuickButtons">
import { useAiChatStore } from "@/stores/modules/aiChat";
import { QUICK_BUTTONS, QUICK_BUTTONS_NEW } from "../constants";
import type { QuickButton } from "../constants";

const store = useAiChatStore();

const btnIcons: Record<string, string> = {
  roadmap_review: "🗺",
  adr_review: "📋",
  dora_metrics: "📊",
  tech_debt: "🛠",
  tech_selection: "🔍",
  org_diagnose: "🏢",
  postmortem: "🚨",
  capacity_cost: "💰"
};

function onClick(b: QuickButton) {
  if (store.sending) return;
  if (b.template) {
    store.input = b.content;
    return;
  }
  store.sendMessage(b.content);
}
</script>

<template>
  <div v-if="store.messages.length === 0" class="qb-row">
    <button
      v-for="b in QUICK_BUTTONS"
      :key="b.value"
      class="qb-chip"
      :disabled="store.sending"
      :title="b.content"
      @click="onClick(b)"
    >
      <span class="qb-chip-icon">{{ btnIcons[b.value] || "💡" }}</span>
      <span class="qb-chip-label">{{ b.label }}</span>
    </button>
    <button
      v-for="b in QUICK_BUTTONS_NEW"
      :key="b.value"
      class="qb-chip qb-chip--special"
      :disabled="store.sending"
      :title="b.content"
      @click="onClick(b)"
    >
      <span class="qb-chip-icon">{{ btnIcons[b.value] || "✨" }}</span>
      <span class="qb-chip-label">{{ b.label }}</span>
      <span class="qb-chip-badge">template</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.qb-row {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--space-sm);
  padding: 12px 16px;
  overflow: auto hidden;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    height: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb);
    border-radius: 2px;
    &:hover {
      background: var(--el-border-color-darker);
    }
  }
  &::-webkit-scrollbar-track {
    background: transparent;
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
  color: var(--el-text-color-primary);
  cursor: pointer;
  user-select: none;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-pill);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
  &:hover:not(:disabled) {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px var(--el-color-primary-light-7);
    transform: translateY(-1px) scale(1.03);
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
.qb-chip--special {
  color: var(--el-color-warning-dark-2);
  background: linear-gradient(135deg, var(--el-color-warning-light-9), var(--el-color-warning-light-8));
  border-color: var(--el-color-warning-light-5);
  border-style: solid;
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
  color: var(--el-color-warning);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: var(--el-color-warning-light-7);
  border-radius: 8px;
}
</style>
