<script setup lang="ts" name="aicrFilterBar">
import { useAicrFilterStore } from "@/stores/modules/aicr/filters";

const filterStore = useAicrFilterStore();
</script>

<template>
  <div v-if="filterStore.hasAnyFilter()" class="aicr-tags">
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
</template>

<style scoped lang="scss">
.aicr-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 0 16px 8px;
  flex-shrink: 0;
}
</style>
