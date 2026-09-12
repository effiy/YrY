<template>
  <div class="rs-root">
    <div class="rs-head">
      <div class="rs-head__icon" />
      <div class="rs-head__text">
        <div class="rs-head__title" />
        <div class="rs-head__desc" />
      </div>
      <div class="rs-head__pills">
        <div v-for="i in 4" :key="i" class="rs-head__pill" :style="{ animationDelay: `${(i - 1) * 0.08}s` }" />
      </div>
    </div>
    <div class="rs-charts">
      <div class="rs-charts__chart" />
      <div class="rs-charts__chart" />
    </div>
    <div class="rs-body">
      <div class="rs-body__sidebar">
        <div class="rs-body__sidebar-item" v-for="i in 6" :key="i" :style="{ animationDelay: `${(i - 1) * 0.06}s` }" />
      </div>
      <div class="rs-body__main">
        <div class="rs-body__toolbar" />
        <div class="rs-body__row" v-for="i in 8" :key="i" :style="{ animationDelay: `${(i - 1) * 0.05}s` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure display component — no props/logic
</script>

<style scoped lang="scss">
.rs-root {
  padding: 24px;
  background: var(--el-bg-color-page);
}

.rs-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  border-radius: 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.rs-head__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--el-fill-color-light);
  flex-shrink: 0;
  animation: rs-pulse 1.5s ease-in-out infinite;
}

.rs-head__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rs-head__title {
  width: 160px;
  height: 22px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  animation: rs-pulse 1.5s ease-in-out infinite;
}

.rs-head__desc {
  width: 260px;
  height: 16px;
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
  animation: rs-pulse 1.5s ease-in-out infinite;
}

.rs-head__pills {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.rs-head__pill {
  width: 64px;
  height: 48px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  animation: rs-pulse 1.5s ease-in-out infinite;
}

.rs-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.rs-charts__chart {
  height: 200px;
  border-radius: 12px;
  background: var(--el-fill-color-light);
  animation: rs-pulse 1.5s ease-in-out infinite;
}

.rs-body {
  display: flex;
  gap: 24px;
}

.rs-body__sidebar {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
}

.rs-body__sidebar-item {
  height: 36px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  animation: rs-pulse 1.5s ease-in-out infinite;
}

.rs-body__main {
  flex: 1;
  padding: 20px 24px;
  border-radius: 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.rs-body__toolbar {
  height: 32px;
  margin-bottom: 18px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  animation: rs-pulse 1.5s ease-in-out infinite;
}

.rs-body__row {
  height: 40px;
  margin-bottom: 8px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
  animation: rs-pulse 1.5s ease-in-out infinite;
}

@keyframes rs-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>