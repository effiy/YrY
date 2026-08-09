<script setup lang="ts">
import { Close } from "@element-plus/icons-vue";

defineProps<{
  pills: { key: string; val: string; label: string; display: string; color: string }[];
  hasActiveFilter: boolean;
}>();

const emit = defineEmits<{
  (e: "remove", key: string): void;
  (e: "clearAll"): void;
}>();
</script>

<template>
  <div class="filter-pills-bar" v-if="hasActiveFilter">
    <span class="fpb-label">Active Filters:</span>
    <TransitionGroup name="fpb-pill" tag="span" class="fpb-pills">
      <span
        v-for="p in pills"
        :key="p.key"
        class="fpb-pill"
        :style="{ borderColor: p.color, background: p.color + '15' }"
      >
        <span class="fpb-dim" :style="{ color: p.color }">{{ p.label }}</span>
        <span class="fpb-val">{{ p.display }}</span>
        <el-icon class="fpb-close" :size="12" @click.stop="emit('remove', p.key)">
          <Close />
        </el-icon>
      </span>
    </TransitionGroup>
    <el-button text size="small" type="danger" @click="emit('clearAll')">Clear all</el-button>
  </div>
</template>

<style scoped lang="scss">
.filter-pills-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 20px;
  flex-shrink: 0;
  flex-wrap: wrap;
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-color-primary-light-7);
}
.fpb-label {
  font-size: 10px;
  color: #909399;
  flex-shrink: 0;
  font-weight: 500;
}
.fpb-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.fpb-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 8px;
  border-radius: 12px;
  border: 1px solid;
  font-size: 10px;
  line-height: 20px;
  cursor: default;
  transition: all 0.15s;
  .fpb-dim {
    font-weight: 600;
    font-size: 9px;
  }
  .fpb-val {
    color: #303133;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .fpb-close {
    cursor: pointer;
    color: #909399;
    flex-shrink: 0;
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
