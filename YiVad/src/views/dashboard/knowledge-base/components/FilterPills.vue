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
  padding: 6px 20px;
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-color-primary-light-7);
}
.fpb-label {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 500;
  color: #909399;
}
.fpb-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.fpb-pill {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 1px 8px;
  font-size: 10px;
  line-height: 20px;
  cursor: default;
  border: 1px solid;
  border-radius: 12px;
  transition: all 0.15s;
  .fpb-dim {
    font-size: 9px;
    font-weight: 600;
  }
  .fpb-val {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #303133;
    white-space: nowrap;
  }
  .fpb-close {
    flex-shrink: 0;
    color: #909399;
    cursor: pointer;
    &:hover {
      color: #f56c6c;
    }
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
