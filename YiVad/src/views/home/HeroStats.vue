<template>
  <div class="ho__hero-body">
    <div class="ho__hero-stats" :class="{ 'is-loading': loading }">
      <div class="ho__hero-stat" @click="router.push('/issue')">
        <span class="ho__hero-stat-value">{{ roleCounts.all ?? 0 }}</span>
        <span class="ho__hero-stat-label">{{ t("home.stats.tasks") }}</span>
      </div>
      <div class="ho__hero-stat" @click="router.push('/issue?priority=urgent')">
        <span class="ho__hero-stat-value is-p0">{{ roleCounts.p0 ?? 0 }}</span>
        <span class="ho__hero-stat-label">{{ t("home.stats.p0") }}</span>
      </div>
      <div class="ho__hero-stat" @click="router.push('/bug')">
        <span class="ho__hero-stat-value">{{ bugCount }}</span>
        <span class="ho__hero-stat-label">{{ t("home.stats.bugs") }}</span>
      </div>
    </div>
    <div class="ho__hero-text">
      <HeroDateNav
        :filter-date="filterDate"
        :label="filterDateLabel"
        :is-today="isFilterToday"
        @prev="$emit('prev')"
        @next="$emit('next')"
        @today="$emit('today')"
        @clear="$emit('clear')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";

defineProps<{
  loading: boolean;
  roleCounts: Record<string, number>;
  bugCount: number;
  filterDate: Date | null;
  filterDateLabel: string;
  isFilterToday: boolean;
}>();

defineEmits<{
  prev: [];
  next: [];
  today: [];
  clear: [];
}>();

const { t } = useI18n();
const router = useRouter();
</script>

<style scoped lang="scss">
.ho__hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ho__hero-stats {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.ho__hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background: var(--el-border-color-lighter);
  }

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.ho__hero-stat-value {
  font-size: 16px;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
  transition: opacity 0.3s;

  .is-loading & { opacity: 0.4; }

  &.is-p0 { color: var(--el-color-danger); }
}

.ho__hero-stat-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.ho__hero-text {
  flex-shrink: 0;
  padding-left: 12px;
  border-left: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 1024px) {
  .ho__hero-body { flex-wrap: wrap; }
  .ho__hero-text { border-left: none; padding-left: 0; }
}

@media (max-width: 640px) {
  .ho__hero-body { flex-direction: column; gap: 8px; }
  .ho__hero-text { border-left: none; padding-left: 0; }
}
</style>
