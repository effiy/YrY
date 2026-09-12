<template>
  <span class="effort-badge" :class="`is-${effort}`">{{ effort }}</span>
</template>

<script setup lang="ts" name="EffortBadge">
import type { OkrTaskItem } from "../okrRecommend";

defineProps<{ effort: OkrTaskItem["effort"] }>();
</script>

<style scoped lang="scss">
.effort-badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  &.is-S { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &.is-M { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &.is-L { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
}
</style>
