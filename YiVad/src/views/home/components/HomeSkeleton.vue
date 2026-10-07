<template>
  <div class="hs-root">
    <!-- Header skeleton -->
    <div class="hs-head">
      <div class="hs-head__icon" />
      <div class="hs-head__text">
        <div class="hs-head__title" />
        <div class="hs-head__desc" />
      </div>
      <div class="hs-head__pills">
        <div v-for="i in 4" :key="i" class="hs-head__pill" />
      </div>
    </div>

    <!-- KPI cards -->
    <div class="hs-metrics">
      <div v-for="i in 4" :key="i" class="hs-metric">
        <div class="hs-metric__head" />
        <div class="hs-metric__value" />
        <div class="hs-metric__bar" />
        <div class="hs-metric__row" />
        <div class="hs-metric__row" :style="{ width: '70%' }" />
      </div>
    </div>

    <!-- Body -->
    <div class="hs-body">
      <div class="hs-body__main">
        <!-- Daily Focus -->
        <div class="hs-body__card">
          <div class="hs-body__card-head" />
          <div class="hs-body__tabs">
            <div v-for="i in 4" :key="i" class="hs-body__tab" />
          </div>
          <div v-for="j in 6" :key="j" class="hs-body__row2l" />
        </div>
        <!-- Activity -->
        <div class="hs-body__card">
          <div class="hs-body__card-head" />
          <div v-for="j in 5" :key="j" class="hs-body__row" />
        </div>
      </div>
      <!-- Sidebar -->
      <div class="hs-body__sidebar">
        <div v-for="i in 3" :key="i" class="hs-body__sb-card" :style="{ animationDelay: `${(i - 1) * 0.08}s` }">
          <div class="hs-body__sb-head" />
          <div v-for="j in 3" :key="j" class="hs-body__sb-row" />
        </div>
      </div>
    </div>

    <!-- QuickNav -->
    <div class="hs-nav">
      <div v-for="i in 4" :key="i" class="hs-nav__group">
        <div class="hs-nav__label" />
        <div v-for="j in 3" :key="j" class="hs-nav__card" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.hs-root { padding: 20px 24px 80px; }

// Header
.hs-head { display: flex; gap: 16px; align-items: center; padding: 14px 20px; margin-bottom: 14px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 14px; }
.hs-head__icon { flex-shrink: 0; width: 40px; height: 40px; background: var(--el-fill-color-light); border-radius: 10px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-head__text { display: flex; flex: 1; flex-direction: column; gap: 6px; }
.hs-head__title { width: 140px; height: 18px; background: var(--el-fill-color-light); border-radius: 4px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-head__desc { width: 240px; height: 13px; background: var(--el-fill-color-light); border-radius: 4px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-head__pills { display: flex; flex-shrink: 0; gap: 8px; }
.hs-head__pill { width: 56px; height: 22px; background: var(--el-fill-color-light); border-radius: 8px; animation: hs-pulse 1.5s ease-in-out infinite; }

// KPI cards
.hs-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
.hs-metric { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 12px; min-height: 110px; }
.hs-metric__head { width: 60px; height: 10px; background: var(--el-fill-color-light); border-radius: 2px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-metric__value { width: 48px; height: 28px; background: var(--el-fill-color-light); border-radius: 4px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-metric__bar { height: 5px; background: var(--el-fill-color-light); border-radius: 3px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-metric__row { height: 12px; background: var(--el-fill-color-light); border-radius: 2px; animation: hs-pulse 1.5s ease-in-out infinite; }

// Body
.hs-body { display: grid; grid-template-columns: 1fr 268px; gap: 14px; align-items: start; }
.hs-body__main { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.hs-body__card { padding: 18px 22px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 14px; }
.hs-body__card-head { width: 100px; height: 14px; margin-bottom: 12px; background: var(--el-fill-color-light); border-radius: 4px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-body__tabs { display: flex; gap: 4px; margin-bottom: 12px; }
.hs-body__tab { flex: 1; height: 26px; background: var(--el-fill-color-light); border-radius: 5px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-body__row2l { height: 44px; margin-bottom: 2px; background: var(--el-fill-color-light); border-radius: 8px; animation: hs-pulse 1.5s ease-in-out infinite; &:nth-child(odd) { width: 95%; } }
.hs-body__row { height: 36px; margin-bottom: 2px; background: var(--el-fill-color-light); border-radius: 8px; animation: hs-pulse 1.5s ease-in-out infinite; &:nth-child(odd) { width: 95%; } }

// Sidebar
.hs-body__sidebar { display: flex; flex-direction: column; gap: 10px; position: sticky; top: 16px; }
.hs-body__sb-card { padding: 13px 15px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 12px; }
.hs-body__sb-head { width: 60px; height: 10px; margin-bottom: 12px; background: var(--el-fill-color-light); border-radius: 2px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-body__sb-row { height: 28px; margin-bottom: 4px; background: var(--el-fill-color-light); border-radius: 6px; animation: hs-pulse 1.5s ease-in-out infinite; &:nth-child(even) { width: 80%; } }

// QuickNav
.hs-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--el-border-color-lighter); }
.hs-nav__group { display: flex; flex-direction: column; gap: 4px; }
.hs-nav__label { width: 48px; height: 10px; background: var(--el-fill-color-light); border-radius: 2px; animation: hs-pulse 1.5s ease-in-out infinite; }
.hs-nav__card { height: 32px; background: var(--el-fill-color-light); border-radius: 6px; animation: hs-pulse 1.5s ease-in-out infinite; }

@keyframes hs-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>