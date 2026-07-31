<script setup lang="ts" name="StoryBoardHeader">
/**
 * Story Board — header bar with title, story count, create button, and
 * card/list view toggle.
 */
import { useI18n } from "vue-i18n";
import { useStoryStore } from "@/stores/modules/story";
import CardListToggle from "./CardListToggle.vue";

const { t } = useI18n();
const store = useStoryStore();
</script>

<template>
  <div class="sbh-root">
    <div class="sbh-left">
      <h2 class="sbh-title">{{ $t("story.title") }}</h2>
      <span class="sbh-count">{{ $t("story.storiesCount", { count: store.totalStories }) }}</span>
    </div>
    <div class="sbh-right">
      <el-button type="primary" @click="store.openCreateDialog()">{{ $t("story.newStory") }}</el-button>
      <CardListToggle v-model="store.viewMode" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sbh-root {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}
.sbh-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.sbh-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sbh-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.sbh-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
