<template>
  <div class="ds-root">
    <!-- Header -->
    <div class="ds-head">
      <div class="ds-head__back" />
      <div class="ds-head__title" />
      <div class="ds-head__key" />
      <div class="ds-head__nav" />
    </div>

    <!-- Tabs -->
    <div class="ds-tabs">
      <div v-for="i in 6" :key="i" class="ds-tabs__item" :style="{ animationDelay: `${(i - 1) * 0.08}s` }" />
    </div>

    <!-- Summary bar -->
    <div class="ds-summary">
      <div v-for="i in 4" :key="i" class="ds-summary__item" :style="{ animationDelay: `${(i - 1) * 0.1}s` }" />
    </div>

    <!-- README placeholder -->
    <div class="ds-readme">
      <div class="ds-readme__head" />
      <div class="ds-readme__body">
        <div
          v-for="i in 4"
          :key="i"
          class="ds-readme__line"
          :style="{ width: `${90 - i * 15}%`, animationDelay: `${i * 0.12}s` }"
        />
      </div>
    </div>

    <!-- Two-column row -->
    <div class="ds-row">
      <div class="ds-col">
        <div class="ds-col__title" />
        <div v-for="i in 4" :key="i" class="ds-col__item" :style="{ animationDelay: `${(i - 1) * 0.1}s` }" />
      </div>
      <div class="ds-col">
        <div class="ds-col__title" />
        <div v-for="i in 4" :key="i" class="ds-col__item" :style="{ animationDelay: `${(i - 1) * 0.1}s` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure display component — no props/logic
</script>

<style scoped lang="scss">
.ds-root {
  padding: 24px;
}

// ── Header ──
.ds-head {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}
.ds-head__back {
  width: 56px;
  height: 28px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}
.ds-head__title {
  width: 160px;
  height: 28px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}
.ds-head__key {
  width: 64px;
  height: 20px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}
.ds-head__nav {
  width: 180px;
  height: 28px;
  margin-left: auto;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}

// ── Tabs ──
.ds-tabs {
  display: flex;
  gap: 20px;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--el-border-color-lighter);
}
.ds-tabs__item {
  width: 56px;
  height: 20px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}

// ── Summary bar ──
.ds-summary {
  display: flex;
  gap: 1px;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 10px;
}
.ds-summary__item {
  flex: 1;
  height: 64px;
  background: var(--el-fill-color-light);
  animation: ds-pulse 1.5s ease-in-out infinite;
}

// ── README ──
.ds-readme {
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.ds-readme__head {
  height: 40px;
  background: var(--el-fill-color-light);
  animation: ds-pulse 1.5s ease-in-out infinite;
}
.ds-readme__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}
.ds-readme__line {
  height: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}

// ── Two-column ──
.ds-row {
  display: flex;
  gap: 20px;
}
.ds-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.ds-col__title {
  width: 80px;
  height: 18px;
  margin-bottom: 4px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}
.ds-col__item {
  height: 14px;
  background: var(--el-fill-color-light);
  border-radius: 7px;
  animation: ds-pulse 1.5s ease-in-out infinite;
}

@keyframes ds-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
