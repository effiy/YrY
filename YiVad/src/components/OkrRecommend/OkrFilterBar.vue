<template>
  <nav class="okr-filter-bar">
    <div class="okr-filter-bar__view">
      <el-radio-group :model-value="viewMode" size="small" @update:model-value="emit('update:viewMode', $event as ViewMode)">
        <el-radio-button value="table"
          ><el-icon><Grid /></el-icon
        ></el-radio-button>
        <el-radio-button value="list"
          ><el-icon><List /></el-icon
        ></el-radio-button>
        <el-radio-button value="card"
          ><el-icon><Postcard /></el-icon
        ></el-radio-button>
      </el-radio-group>
    </div>
    <button class="okr-filter-bar__item" :class="{ 'is-active': categoryFilter === 'all' }" @click="emit('update:categoryFilter', 'all')">
      <span class="okr-filter-bar__icon">📋</span>
      <span class="okr-filter-bar__label">{{ t("home.aiRecommend.filterAll") }}</span>
      <span class="okr-filter-bar__badge">{{ categoryCounts.all }}</span>
    </button>
    <button
      v-for="l in LIST_TYPES"
      :key="l.key"
      class="okr-filter-bar__item"
      :class="{ 'is-active': categoryFilter === l.key }"
      @click="emit('update:categoryFilter', l.key)"
    >
      <span class="okr-filter-bar__icon">{{ l.icon }}</span>
      <span class="okr-filter-bar__label">{{ t(`home.aiRecommend.lists.${l.key}`) }}</span>
      <span class="okr-filter-bar__badge">{{ categoryCounts[l.key] }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts" name="OkrFilterBar">
import { useI18n } from "vue-i18n";
import { Grid, List, Postcard } from "@element-plus/icons-vue";
import { LIST_TYPES, type OkrListType } from "./okrTypes";

const { t } = useI18n();

type ViewMode = "table" | "list" | "card";

defineProps<{
  viewMode: ViewMode;
  categoryFilter: "all" | OkrListType;
  categoryCounts: Record<string, number>;
}>();

const emit = defineEmits<{
  (e: "update:viewMode", value: ViewMode): void;
  (e: "update:categoryFilter", value: "all" | OkrListType): void;
}>();
</script>

<style scoped lang="scss">
.okr-filter-bar {
  position: sticky;
  top: 12px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  width: 180px;
  padding: 8px 10px 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.okr-filter-bar__item {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: all 0.15s;

  &:hover {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }

  &.is-active {
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}

.okr-filter-bar__icon {
  flex-shrink: 0;
  font-size: 18px;
}

.okr-filter-bar__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.okr-filter-bar__badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 10px;

  .okr-filter-bar__item.is-active & {
    color: #ffffff;
    background: var(--el-color-primary);
  }
}

.okr-filter-bar__view {
  padding: 4px 8px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }

  :deep(.el-radio-button) {
    flex: 1;
  }

  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 4px 0;
    font-size: 12px;
    text-align: center;
  }
}
</style>