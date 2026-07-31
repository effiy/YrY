<script setup lang="ts" name="StoryFilters">
/**
 * Story Board — dimension filter bar.
 * Project selector, time range filter, and search input.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useStoryStore } from "@/stores/modules/story";
import { TIME_RANGE_OPTIONS } from "@/views/story/constants";

const { t } = useI18n();
const store = useStoryStore();

const timeOptions = computed(() => [
  { label: t("story.all"), value: "all" as const },
  { label: t("story.thisWeek"), value: "week" as const },
  { label: t("story.thisMonth"), value: "month" as const },
  { label: t("story.thisQuarter"), value: "quarter" as const },
  { label: t("story.custom"), value: "custom" as const }
]);
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
        style="width: 180px"
        @change="store.selectProject(store.selectedProject || '')"
      >
        <el-option :label="$t('story.allProjects')" value="" />
        <el-option v-for="p in store.projects" :key="p" :label="`${p} (${store.projectStoryCounts[p] || 0})`" :value="p" />
      </el-select>
    </div>
    <div class="sf-dim">
      <span class="sf-dim-lbl">{{ $t("story.time") }}</span>
      <el-select v-model="store.timeRange" size="small" style="width: 140px" @change="(v: any) => store.setTimeRange(v)">
        <el-option v-for="o in timeOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
      <template v-if="store.timeRange === 'custom'">
        <el-date-picker
          v-model="store.customStart"
          type="date"
          :placeholder="$t('story.start')"
          size="small"
          style="width: 130px"
          @change="store.fetchStories()"
        />
        <span class="sf-sep">-</span>
        <el-date-picker
          v-model="store.customEnd"
          type="date"
          :placeholder="$t('story.end')"
          size="small"
          style="width: 130px"
          @change="store.fetchStories()"
        />
      </template>
    </div>
    <div class="sf-right">
      <el-input
        v-model="store.searchQuery"
        :placeholder="$t('story.search')"
        clearable
        size="small"
        style="width: 200px"
        @change="store.fetchStories()"
      />
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
}
.sf-sep {
  color: var(--el-text-color-placeholder);
}
</style>
