<script setup lang="ts" name="aiChatQuickButtons">
import { useAiChatStore } from "@/stores/modules/aiChat";
import { QUICK_BUTTONS, QUICK_BUTTONS_NEW } from "../constants";
import type { QuickButton } from "../constants";

const store = useAiChatStore();

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
  <div class="qb-row">
    <el-tag
      v-for="b in QUICK_BUTTONS"
      :key="b.value"
      class="qb-chip"
      :class="{ 'is-disabled': store.sending }"
      type="primary"
      @click="onClick(b)"
    >
      {{ b.label }}
    </el-tag>
    <el-tag
      v-for="b in QUICK_BUTTONS_NEW"
      :key="b.value"
      class="qb-chip qb-chip--special"
      :class="{ 'is-disabled': store.sending }"
      type="warning"
      @click="onClick(b)"
    >
      {{ b.label }}
    </el-tag>
  </div>
</template>

<style scoped lang="scss">
.qb-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  padding: 6px 12px;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
}

.qb-chip {
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;

  &:hover {
    opacity: 0.85;
  }
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>