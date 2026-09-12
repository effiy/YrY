<template>
  <div class="chs-root">
    <div class="chs-header">
      <div class="chs-header__title" />
      <div class="chs-header__actions" />
    </div>
    <div class="chs-section" v-for="i in 4" :key="i">
      <div class="chs-section__title" />
      <div class="chs-section__row" v-for="j in 3" :key="j" :style="{ animationDelay: `${(i * 3 + j) * 0.06}s` }">
        <div class="chs-row__label" />
        <div class="chs-row__value" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure display component — no props or logic
</script>

<style scoped lang="scss">
.chs-root {
  padding: 6px 0;
}

.chs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  margin-bottom: 8px;
}

.chs-header__title {
  width: 80px;
  height: 14px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  animation: chs-pulse 1.5s ease-in-out infinite;
}

.chs-header__actions {
  width: 40px;
  height: 14px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  animation: chs-pulse 1.5s ease-in-out infinite;
}

.chs-section {
  margin-bottom: 10px;
}

.chs-section__title {
  width: 60px;
  height: 12px;
  border-radius: 3px;
  background: var(--el-fill-color);
  margin-bottom: 6px;
  animation: chs-pulse 1.5s ease-in-out infinite;
}

.chs-section__row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
}

.chs-row__label {
  width: 56px;
  height: 11px;
  border-radius: 3px;
  background: var(--el-fill-color-lighter);
  animation: chs-pulse 1.5s ease-in-out infinite;
}

.chs-row__value {
  width: 64px;
  height: 11px;
  border-radius: 3px;
  background: var(--el-fill-color-lighter);
  animation: chs-pulse 1.5s ease-in-out infinite;
}

@keyframes chs-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>