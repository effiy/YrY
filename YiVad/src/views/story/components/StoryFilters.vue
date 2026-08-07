<script setup lang="ts" name="StoryFilters">
/**
 * Story Board — dimension filter bar.
 * Project selector, time range filter, and search input.
 */
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RefreshLeft } from "@element-plus/icons-vue";
import type { InputInstance } from "element-plus";
import { useStoryStore } from "@/stores/modules/story";
import { TIME_RANGE_OPTIONS } from "@/views/story/constants";

const { t } = useI18n();
const store = useStoryStore();

const searchInputRef = ref<InputInstance>();

const timeOptions = computed(() => [
  { label: t("story.all"), value: "all" as const },
  { label: t("story.thisWeek"), value: "week" as const },
  { label: t("story.thisMonth"), value: "month" as const },
  { label: t("story.thisQuarter"), value: "quarter" as const },
  { label: t("story.custom"), value: "custom" as const }
]);

const activeFilterCount = computed(() => {
  let n = 0;
  if (store.selectedProject) n++;
  if (store.timeRange !== "all") n++;
  if (store.searchQuery.trim()) n++;
  return n;
});

function resetAll() {
  store.selectedProject = "";
  store.timeRange = "all";
  store.customStart = "";
  store.customEnd = "";
  store.searchQuery = "";
  store.fetchStories();
}

function slashKeyHandler(e: KeyboardEvent) {
  if (e.key !== "/") return;
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true) return;
  const inOverlay = !!document.querySelector(".el-dialog:not(.is-hidden), .el-drawer:not(.is-hide), .el-select-dropdown:not([style*='display: none'])");
  if (inOverlay) return;
  e.preventDefault();
  searchInputRef.value?.focus?.();
}
onMounted(() => window.addEventListener("keydown", slashKeyHandler));
onBeforeUnmount(() => window.removeEventListener("keydown", slashKeyHandler));
</script>

<template>
  <div class="sf-root">
    <div class="sf-dim">
      <span class="sf-dim-lbl">{{ $t("story.project") }}</span>
      <el-select
        v-model="store.selectedProject"
        :placeholder="$t('story.all')"
        clearable
        size="small"
        class="sf-project-select"
        @change="store.selectProject(store.selectedProject || '')"
      >
        <el-option :label="$t('story.allProjects')" value="" />
        <el-option v-for="p in store.projects" :key="p" :label="`${store.projectLabel(p)} (${store.projectStoryCounts[p] || 0})`" :value="p" />
      </el-select>
    </div>
    <div class="sf-dim">
      <span class="sf-dim-lbl">{{ $t("story.time") }}</span>
      <el-select v-model="store.timeRange" size="small" class="sf-time-select" @change="(v: any) => store.setTimeRange(v)">
        <el-option v-for="o in timeOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
      <template v-if="store.timeRange === 'custom'">
        <el-date-picker
          v-model="store.customStart"
          type="date"
          :placeholder="$t('story.start')"
          size="small"
          class="sf-date-input"
          @change="store.fetchStories()"
        />
        <span class="sf-sep">-</span>
        <el-date-picker
          v-model="store.customEnd"
          type="date"
          :placeholder="$t('story.end')"
          size="small"
          class="sf-date-input"
          @change="store.fetchStories()"
        />
      </template>
    </div>
    <div class="sf-right">
      <el-input
        ref="searchInputRef"
        v-model="store.searchQuery"
        :placeholder="$t('story.search')"
        clearable
        size="small"
        class="sf-search-input"
        @change="store.fetchStories()"
      >
        <template #prefix>
          <span class="sf-search-hint"><kbd>/</kbd></span>
        </template>
      </el-input>
      <el-button
        size="small"
        :icon="RefreshLeft"
        :disabled="activeFilterCount === 0"
        @click="resetAll"
      >
        {{ $t("story.reset") }}
        <el-badge v-if="activeFilterCount > 0" :value="activeFilterCount" class="sf-reset-badge" />
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sf-root {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 14px;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  flex-wrap: wrap;
}
.sf-dim {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sf-dim-lbl {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.sf-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sf-sep {
  color: var(--el-text-color-placeholder);
}
.sf-reset-badge {
  margin-left: 4px;
  :deep(.el-badge__content) {
    transform: translateY(-6px) scale(0.85);
  }
}
.sf-project-select { width: 180px; }
.sf-time-select { width: 140px; }
.sf-date-input { width: 130px; }
.sf-search-input { width: 200px; }
.sf-search-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  background: transparent;
  kbd {
    display: inline-block;
    min-width: 14px;
    padding: 0 4px;
    font-family: "SF Mono", "Menlo", monospace;
    font-size: 11px;
    line-height: 14px;
    color: var(--el-text-color-placeholder);
  }
}
</style>
