<template>
  <div class="rs-root">
    <!-- Header card -->
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

    <!-- Charts -->
    <div class="rs-charts">
      <div v-for="i in 2" :key="i" class="rs-charts__chart" :style="{ animationDelay: `${(i - 1) * 0.06}s` }" />
    </div>

    <!-- Article panel -->
    <div class="rs-body">
      <div class="rs-body__sidebar">
        <div class="rs-body__sidebar-header" />
        <div class="rs-body__sidebar-search" />
        <div class="rs-body__sidebar-item" v-for="i in 5" :key="i" :style="{ animationDelay: `${(i - 1) * 0.05}s` }" />
      </div>
      <div class="rs-body__main">
        <div class="rs-body__header">
          <div class="rs-body__header-title" />
          <div class="rs-body__header-tools">
            <div class="rs-body__header-search" />
            <div class="rs-body__header-select" />
            <div class="rs-body__header-select" />
          </div>
        </div>
        <div class="rs-body__summary" />
        <div class="rs-body__row" v-for="i in 8" :key="i" :style="{ animationDelay: `${(i - 1) * 0.04}s` }" />
        <div class="rs-body__footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure display component — no props/logic
</script>

<style scoped lang="scss">
.rs-root {
  padding: 20px 24px 24px;
  background: var(--el-bg-color-page);
}

// ── Header card ──
.rs-head {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
}
.rs-head__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--el-fill-color-light), var(--el-fill-color));
  border-radius: 12px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}
.rs-head__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}
.rs-head__title {
  width: 160px;
  height: 22px;
  background: linear-gradient(90deg, var(--el-fill-color-light), var(--el-fill-color));
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}
.rs-head__desc {
  width: 260px;
  height: 16px;
  background: linear-gradient(90deg, var(--el-fill-color-lighter), var(--el-fill-color-light));
  border-radius: 4px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}
.rs-head__pills {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}
.rs-head__pill {
  width: 64px;
  height: 48px;
  background: linear-gradient(180deg, var(--el-fill-color-light), var(--el-fill-color));
  border-radius: 8px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}

// ── Charts ──
.rs-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.rs-charts__chart {
  height: 248px;
  background: linear-gradient(180deg, var(--el-bg-color), var(--el-fill-color-lighter));
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}

// ── Body ──
.rs-body {
  display: flex;
  gap: 24px;
}

// ── Sidebar ──
.rs-body__sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  width: 240px;
  padding: 12px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
}
.rs-body__sidebar-header {
  height: 28px;
  margin-bottom: 2px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}
.rs-body__sidebar-search {
  height: 28px;
  margin-bottom: 6px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite 0.1s;
}
.rs-body__sidebar-item {
  height: 36px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}

// ── Main ──
.rs-body__main {
  flex: 1;
  padding: 20px 24px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
}
.rs-body__header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.rs-body__header-title {
  width: 120px;
  height: 24px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}
.rs-body__header-tools {
  display: flex;
  flex: 1;
  gap: 10px;
  justify-content: flex-end;
}
.rs-body__header-search {
  width: 220px;
  height: 32px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite 0.1s;
}
.rs-body__header-select {
  width: 160px;
  height: 32px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite 0.15s;
}
.rs-body__summary {
  height: 32px;
  margin-bottom: 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}
.rs-body__row {
  height: 40px;
  margin-bottom: 6px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite;
}
.rs-body__footer {
  height: 32px;
  margin-top: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  animation: rs-pulse 1.5s ease-in-out infinite 0.2s;
}

@keyframes rs-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
</style>
