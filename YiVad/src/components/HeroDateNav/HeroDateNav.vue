<template>
  <div class="ho__hero-date-nav" :class="{ 'is-filtering': filterDate }">
    <el-button size="small" :icon="ArrowLeft" text class="hdn-arrow" @click="$emit('prev')" />
    <span class="hdn-label" :class="{ 'is-all': !filterDate }">{{ label }}</span>
    <el-button size="small" :icon="ArrowRight" text class="hdn-arrow" :disabled="isToday" @click="$emit('next')" />
    <el-button v-if="!isToday" size="small" text type="primary" class="hdn-today" @click="$emit('today')">今天</el-button>
    <el-button v-if="filterDate" size="small" :icon="Close" text class="hdn-clear" title="清除日期筛选" @click="$emit('clear')" />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Close } from "@element-plus/icons-vue";

defineProps<{
  filterDate: Date | null;
  label: string;
  isToday: boolean;
}>();

defineEmits<{
  prev: [];
  next: [];
  today: [];
  clear: [];
}>();
</script>

<style scoped lang="scss">
.ho__hero-date-nav {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: border-color 0.2s, background 0.2s;

  &.is-filtering {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

.hdn-arrow {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 7px;
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color);
  }
}

.hdn-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 28px;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
  border-radius: 7px;
  transition: all 0.2s;

  &.is-all {
    color: var(--el-color-primary);
  }

  .is-filtering & {
    color: #fff;
    background: var(--el-color-primary);
  }
}

.hdn-today {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 7px;
}

.hdn-clear {
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--el-text-color-secondary);
  border-radius: 7px;

  &:hover {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}
</style>