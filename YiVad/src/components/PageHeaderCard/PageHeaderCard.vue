<template>
  <div class="page-header-card" :class="{ 'page-header-card--sticky': sticky }">
    <div class="page-header-card__inner">
      <div v-if="icon" class="page-header-card__icon" :style="{ background: iconBg }">
        <el-icon :size="iconSize"><component :is="icon" /></el-icon>
      </div>
      <div class="page-header-card__text">
        <div class="page-header-card__title-row">
          <h2 class="page-header-card__title">{{ title }}</h2>
          <slot name="title-tags" />
        </div>
        <p v-if="description" class="page-header-card__desc">{{ description }}</p>
      </div>
      <div v-if="pills && pills.length" class="page-header-card__pills">
        <div
          v-for="(p, i) in pills"
          :key="i"
          class="page-header-card__pill"
          :class="{ 'page-header-card__pill--accent': p.accent }"
          :style="p.accentColor ? { background: p.accentColor } : {}"
        >
          <span class="page-header-card__pill-val" :style="p.accentValueColor ? { color: p.accentValueColor } : {}">
            {{ p.value }}<span v-if="p.suffix">{{ p.suffix }}</span>
          </span>
          <span class="page-header-card__pill-lbl">{{ p.label }}</span>
        </div>
      </div>
      <slot name="pills" />
      <div v-if="showDateNav" class="page-header-card__right">
        <HeroDateNav
          :filter-date="filterDate"
          :label="filterDateLabel"
          :is-today="isFilterToday"
          @prev="emit('prev')"
          @next="emit('next')"
          @today="emit('today')"
          @clear="emit('clear')"
        />
      </div>
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";

export interface HeaderPill {
  value: string | number;
  label: string;
  suffix?: string;
  accent?: boolean;
  accentColor?: string;
  accentValueColor?: string;
}

interface Props {
  icon?: Component;
  iconSize?: number;
  iconBg?: string;
  title: string;
  description?: string;
  pills?: HeaderPill[];
  sticky?: boolean;
  showDateNav?: boolean;
  filterDate?: Date | null;
  filterDateLabel?: string;
  isFilterToday?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 22,
  iconBg: "linear-gradient(135deg, #f56c6c, #dc2626)",
  pills: () => [],
  sticky: false,
  showDateNav: false,
  filterDate: null,
  filterDateLabel: "",
  isFilterToday: false
});

const emit = defineEmits<{
  prev: [];
  next: [];
  today: [];
  clear: [];
}>();
</script>

<style scoped lang="scss">
.page-header-card {
  &--sticky {
    position: sticky;
    top: 0;
    z-index: 10;
    margin: 0 -24px 14px;
    background: linear-gradient(
      180deg,
      var(--el-bg-color-page) 60%,
      color-mix(in srgb, var(--el-bg-color-page) 92%, transparent) 100%
    );
    border-bottom: 1px solid var(--el-border-color-lighter);
    backdrop-filter: blur(12px);
    .page-header-card__inner {
      padding: 14px 24px;
      margin: 0;
      background: transparent;
      border: none;
    }
  }
  &__inner {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
  }
  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: #ffffff;
    border-radius: 10px;
  }
  &__text {
    flex: 1;
    min-width: 0;
  }
  &__title-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
  }
  &__desc {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  &__pills {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__pill {
    display: flex;
    flex-direction: column;
    gap: 1px;
    align-items: center;
    min-width: 64px;
    padding: 6px 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    &--accent {
      background: var(--el-color-danger-light-9);
    }
  }
  &__pill-val {
    font-family: DIN, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.1;
    .page-header-card__pill--accent & {
      color: var(--el-color-danger);
    }
  }
  &__pill-lbl {
    font-size: 10px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  &__right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    :deep(.ho__hero-date-nav) {
      margin: 0;
    }
  }
}
</style>
