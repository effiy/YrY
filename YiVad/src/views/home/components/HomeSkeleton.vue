<template>
  <div class="hs-root">
    <div class="hs-head">
      <div class="hs-head__icon" />
      <div class="hs-head__text">
        <div class="hs-head__title" />
        <div class="hs-head__desc" />
      </div>
      <div class="hs-head__pills">
        <div v-for="i in 3" :key="i" class="hs-head__pill" />
      </div>
    </div>

    <div class="hs-nav">
      <div v-for="i in 4" :key="i" class="hs-nav__group">
        <div class="hs-nav__label" />
        <div v-for="j in 3" :key="j" class="hs-nav__card" :style="{ animationDelay: `${(j - 1) * 0.08}s` }" />
      </div>
    </div>

    <div class="hs-body">
      <div class="hs-body__sidebar">
        <div v-for="i in 4" :key="i" class="hs-body__sidebar-item" :style="{ animationDelay: `${(i - 1) * 0.06}s` }" />
      </div>
      <div class="hs-body__content">
        <div v-for="i in 5" :key="i" class="hs-body__row" :style="{ animationDelay: `${(i - 1) * 0.08}s` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.hs-root {
  padding: 24px;
}

.hs-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.hs-head__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.hs-head__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hs-head__title {
  width: 120px;
  height: 20px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
}

.hs-head__desc {
  width: 200px;
  height: 14px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
}

.hs-head__pills {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.hs-head__pill {
  width: 64px;
  height: 48px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
}

.hs-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.hs-nav__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hs-nav__label {
  width: 48px;
  height: 10px;
  border-radius: 2px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
}

.hs-nav__card {
  height: 32px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
}

.hs-body {
  display: flex;
  gap: 16px;
}

.hs-body__sidebar {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  flex-shrink: 0;
}

.hs-body__sidebar-item {
  height: 40px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
}

.hs-body__content {
  flex: 1;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hs-body__row {
  height: 40px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  animation: hs-pulse 1.5s ease-in-out infinite;
}

@keyframes hs-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>