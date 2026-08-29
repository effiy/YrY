<template>
  <div v-if="hasActiveFilter" class="pfp-bar">
    <span class="pfp-label">Active filters</span>
    <TransitionGroup name="pfp-pill" tag="span" class="pfp-pills">
      <span
        v-for="p in pills"
        :key="p.key"
        class="pfp-pill"
        :style="{ borderColor: p.color, background: p.color + '1f' }"
        :title="`Remove the ${p.label} filter`"
      >
        <span class="pfp-dim" :style="{ color: p.color }">{{ p.label }}</span>
        <span class="pfp-val">{{ p.display }}</span>
        <el-icon class="pfp-close" :size="12" @click.stop="emit('remove', p.key)"><Close /></el-icon>
      </span>
    </TransitionGroup>
    <span class="pfp-count">{{ matchCount }} of {{ totalCount }} projects</span>
    <el-button v-if="canUndo" text size="small" @click="emit('undo')">Undo</el-button>
    <el-button text size="small" type="danger" @click="emit('clearAll')">Clear all</el-button>
  </div>
</template>

<script setup lang="ts" name="ProjectFilterPills">
import { Close } from "@element-plus/icons-vue";

defineProps<{
  pills: Array<{ key: string; val: string; label: string; display: string; color: string }>;
  hasActiveFilter: boolean;
  canUndo: boolean;
  matchCount: number;
  totalCount: number;
}>();

const emit = defineEmits<{
  (e: "remove", key: string): void;
  (e: "clearAll"): void;
  (e: "undo"): void;
}>();
</script>

<style scoped lang="scss">
.pfp-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 14px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 10px;
}
.pfp-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.pfp-pills {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.pfp-pill {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 20px;
  border: 1px solid;
  border-radius: 12px;
  transition: all 0.15s;
}
.pfp-dim {
  font-size: 10px;
  font-weight: 600;
}
.pfp-val {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.pfp-close {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  &:hover {
    color: var(--el-color-danger);
  }
}
.pfp-count {
  margin-left: auto;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}
.pfp-pill-enter-active,
.pfp-pill-leave-active {
  transition: all 0.2s ease;
}
.pfp-pill-enter-from,
.pfp-pill-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
