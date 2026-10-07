<script setup lang="ts">
import { Close } from "@element-plus/icons-vue";

defineProps<{
  pills: { key: string; val: string; label: string; display: string; color: string }[];
  hasActiveFilter: boolean;
  canUndo?: boolean;
}>();

const emit = defineEmits<{
  (e: "remove", key: string): void;
  (e: "clearAll"): void;
  (e: "undo"): void;
}>();
</script>

<template>
  <div class="filter-pills-bar" v-if="hasActiveFilter">
    <span class="fpb-label">Active Filters:</span>
    <TransitionGroup name="fpb-pill" tag="span" class="fpb-pills">
      <span v-for="p in pills" :key="p.key" class="fpb-pill" :style="{ borderColor: p.color, background: p.color + '15' }">
        <span class="fpb-dim" :style="{ color: p.color }">{{ p.label }}</span>
        <span class="fpb-val">{{ p.display }}</span>
        <el-icon class="fpb-close" :size="12" @click.stop="emit('remove', p.key)">
          <Close />
        </el-icon>
      </span>
    </TransitionGroup>
    <el-button text size="small" @click="emit('undo')" v-if="canUndo" title="Undo last filter">Undo</el-button>
    <el-button text size="small" type="danger" @click="emit('clearAll')">Clear all</el-button>
  </div>
</template>

<style scoped lang="scss">
.filter-pills-bar {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 20px;
  margin: 0 20px 16px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
}
.fpb-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #86909c;
}
.fpb-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.fpb-pill {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 22px;
  cursor: default;
  border: 1px solid;
  border-radius: 12px;
  transition: all 0.15s;
  .fpb-dim {
    font-size: 11px;
    font-weight: 600;
  }
  .fpb-val {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #1d2129;
    white-space: nowrap;
  }
  .fpb-close {
    flex-shrink: 0;
    color: #86909c;
    cursor: pointer;
    &:hover { color: #f56c6c; }
  }
}
.fpb-pill-enter-active,
.fpb-pill-leave-active {
  transition: all 0.2s ease;
}
.fpb-pill-enter-from,
.fpb-pill-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
