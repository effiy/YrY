<template>
  <div class="skeleton-list" aria-busy="true" aria-label="Loading list">
    <div v-for="i in items" :key="i" class="skeleton-list__item">
      <div class="skeleton-bar skeleton-list__avatar" />
      <div class="skeleton-list__body">
        <div class="skeleton-bar skeleton-list__title" />
        <div class="skeleton-bar skeleton-list__subtitle" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ items?: number }>(), { items: 6 });
</script>

<style scoped lang="scss">
.skeleton-list {
  &__item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }
  }
  &__avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
  &__body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  &__title { height: 16px; width: 60%; }
  &__subtitle { height: 12px; width: 40%; }
}
.skeleton-bar {
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