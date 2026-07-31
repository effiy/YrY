<script setup lang="ts" name="KnowledgeCategoryCard">
import { computed } from "vue";

const props = defineProps<{
  category: string;
  label: string;
  desc: string;
  count: number;
  loading?: boolean;
}>();

const emit = defineEmits<{ click: [string] }>();

const safeCount = computed(() => props.count ?? 0);
</script>

<template>
  <div class="kc-card" @click="emit('click', category)">
    <div class="kc-card__head">
      <span class="kc-card__icon">{{ label.charAt(0) }}</span>
      <div class="kc-card__title">
        <div class="kc-card__name">{{ label }}</div>
        <div class="kc-card__key">/{{ category }}</div>
      </div>
      <div class="kc-card__count" :class="{ 'is-loading': loading }">
        {{ loading ? "···" : safeCount }}
      </div>
    </div>
    <div class="kc-card__desc">{{ desc }}</div>
  </div>
</template>

<style scoped lang="scss">
.kc-card {
  padding: 16px 18px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.18s ease;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
    transform: translateY(-1px);
  }
  &__head {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    border-radius: 8px;
  }
  &__title {
    flex: 1;
    min-width: 0;
  }
  &__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  &__key {
    margin-top: 2px;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  &__count {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-color-primary);
    &.is-loading {
      color: var(--el-text-color-secondary);
    }
  }
  &__desc {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
}
</style>
