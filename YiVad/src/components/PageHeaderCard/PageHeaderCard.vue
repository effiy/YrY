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
      background: transparent;
      border: none;
      margin: 0;
      padding: 14px 24px;
    }
  }

  &__inner {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    margin-bottom: 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    flex-wrap: wrap;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    color: #fff;
    flex-shrink: 0;
  }

  &__text {
    min-width: 0;
    flex: 1;
  }

  &__title-row {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
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
    gap: 10px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  &__pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 6px 16px;
    border-radius: 8px;
    background: var(--el-fill-color-light);
    min-width: 64px;

    &--accent {
      background: var(--el-color-danger-light-9);
    }
  }

  &__pill-val {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.1;
    font-family: DIN, sans-serif;

    .page-header-card__pill--accent & {
      color: var(--el-color-danger);
    }
  }

  &__pill-lbl {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--el-text-color-secondary);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    :deep(.ho__hero-date-nav) {
      margin: 0;
    }
  }
}
</style>
