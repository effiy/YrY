<script setup lang="ts" name="StoryBoardHeader">
/**
 * Story Board — header bar with title, story count, create button, and
 * card/list view toggle.
 */
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useStoryStore } from "@/stores/modules/story";
import CardListToggle from "./CardListToggle.vue";

const { t } = useI18n();
const store = useStoryStore();

const isFiltered = computed(() => store.filteredStories.length !== store.totalStories);

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true) return;
  const inOverlay = !!document.querySelector(".el-dialog:not(.is-hidden), .el-drawer:not(.is-hide), .el-select-dropdown:not([style*='display: none'])");
  if (inOverlay) return;
  if (e.key.toLowerCase() === "n") {
    e.preventDefault();
    store.openCreateDialog();
  }
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="sbh-root">
    <div class="sbh-left">
      <h2 class="sbh-title">{{ $t("story.title") }}</h2>
      <span class="sbh-count" :class="{ 'sbh-count--filtered': isFiltered }">
        <template v-if="isFiltered">
          {{ $t("story.filteredOfTotal", { filtered: store.filteredStories.length, total: store.totalStories }) }}
        </template>
        <template v-else>
          {{ $t("story.storiesCount", { count: store.totalStories }) }}
        </template>
      </span>
    </div>
    <div class="sbh-right">
      <el-button type="primary" @click="store.openCreateDialog()">
        {{ $t("story.newStory") }} <kbd class="sbh-kbd">N</kbd>
      </el-button>
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
  font-variant-numeric: tabular-nums;
  &--filtered {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}
.sbh-kbd {
  display: inline-block;
  min-width: 14px;
  padding: 0 5px;
  margin-left: 6px;
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 3px;
  line-height: 16px;
}
.sbh-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
