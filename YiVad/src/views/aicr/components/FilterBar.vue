<script setup lang="ts" name="aicrFilterBar">
import { useAicrFilterStore } from "@/stores/modules/aicr/filters";
import { useAicrUiStore } from "@/stores/modules/aicr/ui";

const filterStore = useAicrFilterStore();
const uiStore = useAicrUiStore();
</script>

<template>
  <div class="aicr-filter-bar">
    <div class="filter-bar-header">
      <el-button size="small" text @click="uiStore.toggleFilterBar()">
        <el-icon><component :is="uiStore.filterBarCollapsed ? 'ArrowDown' : 'ArrowUp'" /></el-icon>
        <span>{{ uiStore.filterBarCollapsed ? "Expand" : "Collapse" }} Filters</span>
      </el-button>
    </div>
    <div v-show="!uiStore.filterBarCollapsed" class="filter-bar-content">
      <div v-if="filterStore.hasAnyFilter()" class="filter-pills">
        <el-tag
          v-for="tag in filterStore.selectedProjectTags"
          :key="tag"
          closable
          size="small"
          @close="filterStore.toggleProjectTag(tag)"
          >{{ tag }}</el-tag
        >
        <el-tag
          v-for="tag in filterStore.selectedSkillTags"
          :key="'sk-' + tag"
          closable
          size="small"
          type="success"
          @close="filterStore.toggleSkillTag(tag)"
          >{{ tag }}</el-tag
        >
        <el-tag
          v-for="tag in filterStore.selectedTemplateTags"
          :key="'tp-' + tag"
          closable
          size="small"
          type="warning"
          @close="filterStore.toggleTemplateTag(tag)"
          >{{ tag }}</el-tag
        >
        <el-tag
          v-for="tag in filterStore.selectedRuleTags"
          :key="'rl-' + tag"
          closable
          size="small"
          type="danger"
          @close="filterStore.toggleRuleTag(tag)"
          >{{ tag }}</el-tag
        >
        <el-tag
          v-for="tag in filterStore.selectedAgentTags"
          :key="'ag-' + tag"
          closable
          size="small"
          type="info"
          @close="filterStore.toggleAgentTag(tag)"
          >{{ tag }}</el-tag
        >
        <el-button size="small" text type="danger" @click="filterStore.clearAll()">Clear All</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aicr-filter-bar {
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}
.filter-bar-header {
  padding: 4px 16px;
  display: flex;
  align-items: center;
}
.filter-bar-content {
  padding: 0 16px 10px;
}
.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  align-items: center;
}
</style>
