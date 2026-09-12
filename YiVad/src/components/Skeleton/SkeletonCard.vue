<template>
  <div class="skeleton-card" aria-busy="true" aria-label="Loading card">
    <div class="skeleton-bar skeleton-card__image" />
    <div class="skeleton-card__body">
      <div class="skeleton-bar skeleton-card__title" />
      <div class="skeleton-bar skeleton-card__text" />
      <div class="skeleton-bar skeleton-card__text skeleton-card__text--short" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.skeleton-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  &__image { height: 140px; width: 100%; }
  &__body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  &__title { height: 18px; width: 75%; }
  &__text { height: 12px; width: 90%; }
  &__text--short { width: 50%; }
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