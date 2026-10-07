<template>
  <div v-if="pills.length" class="fp-bar">
    <span class="fp-label">{{ $t("common.filters") }}</span>
    <TransitionGroup name="fp-pill" tag="span" class="fp-pills">
      <span
        v-for="p in pills"
        :key="p.id ?? p.key"
        class="fp-pill"
        :class="{ 'fp-pill--has-val': !!(p as any).display }"
        :style="(p as any).color ? { borderColor: (p as any).color, background: (p as any).color + '15' } : {}"
        @click="(p as any).clear?.()"
      >
        <span v-if="(p as any).color" class="fp-dim" :style="{ color: (p as any).color }">{{ p.label }}</span>
        <span v-if="(p as any).display" class="fp-val">{{ (p as any).display }}</span>
        <span v-else class="fp-text">{{ p.label }}</span>
        <el-icon class="fp-close" :size="12" @click.stop="(p as any).clear?.()"><Close /></el-icon>
      </span>
    </TransitionGroup>
    <el-button v-if="canUndo" text size="small" @click="emit('undo')">Undo</el-button>
    <el-button text size="small" type="danger" @click="emit('clearAll')">Clear all</el-button>
  </div>
</template>

<script setup lang="ts">
import { Close } from "@element-plus/icons-vue";

defineProps<{
  /** Simple pills: { id, label, clear }. Rich pills: { key, val, label, display, color, clear } */
  pills: Array<{ id?: string; key?: string; label: string; display?: string; color?: string; clear?: () => void }>;
  canUndo?: boolean;
}>();

const emit = defineEmits<{
  (e: "clearAll"): void;
  (e: "undo"): void;
  (e: "remove", key: string): void;
}>();
</script>

<style scoped lang="scss">
.fp-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 14px;
  margin-bottom: 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.fp-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.fp-pills {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.fp-pill {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 20px;
  cursor: pointer;
  border: 1px solid;
  border-color: var(--el-border-color);
  border-radius: 12px;
  transition: all 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    .fp-close { opacity: 1; }
  }
}
.fp-dim {
  font-size: 10px;
  font-weight: 600;
}
.fp-val {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.fp-text {
  color: var(--el-text-color-secondary);
}
.fp-close {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  opacity: 0.6;
  &:hover {
    color: var(--el-color-danger);
    opacity: 1;
  }
}
.fp-pill-enter-active,
.fp-pill-leave-active {
  transition: all 0.2s ease;
}
.fp-pill-enter-from,
.fp-pill-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>