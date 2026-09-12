<template>
  <div class="skeleton-table" aria-busy="true" aria-label="Loading table">
    <div class="skeleton-table__header">
      <div v-for="i in columns" :key="'h' + i" class="skeleton-table__cell skeleton-bar" :style="{ width: randomWidth(i) }" />
    </div>
    <div v-for="r in rows" :key="'r' + r" class="skeleton-table__row">
      <div v-for="i in columns" :key="'c' + i" class="skeleton-table__cell skeleton-bar" :style="{ width: randomWidth(r * 10 + i) }" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rows?: number; columns?: number }>(), { rows: 8, columns: 5 });
const randomWidth = (seed: number) => `${60 + ((seed * 17) % 40)}%`;
</script>

<style scoped lang="scss">
.skeleton-table {
  width: 100%;
  &__header, &__row {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
  }
  &__header {
    background: var(--el-fill-color);
    border-radius: 4px 4px 0 0;
    margin-bottom: 2px;
  }
  &__row {
    border-bottom: 1px solid var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }
  }
  &__cell { flex: 1; }
}
.skeleton-bar {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color) 25%, var(--el-fill-color-light) 50%, var(--el-fill-color) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>