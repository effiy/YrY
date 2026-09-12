<template>
  <div class="project-detail">
    <!-- 状态 1: 加载中 -->
    <DetailSkeleton v-if="loading" />

    <!-- 状态 2: 加载失败 -->
    <DetailError
      v-else-if="error"
      :message="error"
      @retry="retry"
    />

    <!-- 状态 3: 项目不存在 -->
    <div v-else-if="!project" class="project-detail__not-found">
      <el-result
        icon="error"
        :title="$t('project.detail.notFound')"
        :sub-title="$t('project.detail.notFoundSub')"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">
            {{ $t('project.detail.backToProjects') }}
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 状态 4: 正常渲染 -->
    <template v-else>
      <div class="project-detail__head">
        <div class="project-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">
            {{ $t("project.detail.back") }}
          </el-button>
          <div class="project-detail__title-group">
            <h1 class="project-detail__name">{{ project.name }}</h1>
            <code class="project-detail__key">{{ project.key }}</code>
            <el-tag
              :type="project.status === 'archived' ? 'info' : 'success'"
              size="small"
              effect="plain"
            >{{ project.status === 'archived' ? $t('project.dialog.statusArchived') : $t('project.dialog.statusActive') }}</el-tag>
          </div>
        </div>
        <div class="project-detail__head-center">
          <HeroDateNav
            :filter-date="filterDate"
            :label="filterDateLabel"
            :is-today="isFilterToday"
            @prev="goToPrevDay"
            @next="goToNextDay"
            @today="goToFilterToday"
            @clear="clearFilterDate"
          />
        </div>
      </div>

      <el-tabs v-model="activeTab" class="project-detail__tabs">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :name="tab.name"
        >
          <template #label>
            <span class="project-detail__tab-label">
              <el-icon :size="14"><component :is="tab.icon" /></el-icon>
              {{ tab.label }}
              <span
                v-if="tab.count != null"
                class="project-detail__tab-count"
              >{{ tab.count.value }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <Transition name="fade" mode="out-in">
        <component :is="currentTabComponent" :key="activeTab" v-bind="currentTabProps" />
      </Transition>
    </template>

    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="ts" name="projectDetail">
import { computed, ref, provide, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useDetailTabs } from "@/hooks/useDetailTabs";
import { useDateFilter } from "@/hooks/useDateFilter";
import { useTabsStore } from "@/stores/modules/tabs";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import DetailSkeleton from "./components/DetailSkeleton.vue";
import DetailError from "./components/DetailError.vue";
import { PROJECT_DETAIL_KEY, PREVIEW_DLG_KEY, type OkrSummary } from "./types";
import { useProjectOkrs } from "./composables/useProjectOkrs";

const route = useRoute();
const router = useRouter();

// ── 数据加载 ──
const projectKey = computed(() => (route.params.key as string) || "");
const {
  project, loading, error,
  knowledgeFiles, allIssues, allModules, allBugs,
  lastUpdated, retry, startPolling, stopPolling,
} = useProjectDetail(projectKey);

// ── 日期筛选 ──
const filterDate = ref<Date | null>(null);
const {
  label: filterDateLabel,
  isToday: isFilterToday,
  filterDateStr,
  goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate,
} = useDateFilter(filterDate);

// ── OKR summary (populated by DetailOkr, consumed by DetailOverview + Tab badge) ──
const okrSummary = ref<OkrSummary>({ totalGoals: 0, avgProgress: 0, completedCount: 0 });

// Eagerly fetch OKR data so summary shows correct counts without needing to visit OKR tab first
const { totalGoals, avgProgress, completedCount, fetch: fetchOkrs } = useProjectOkrs();
watch([totalGoals, avgProgress, completedCount], () => {
  okrSummary.value = { totalGoals: totalGoals.value, avgProgress: avgProgress.value, completedCount: completedCount.value };
});
watch(projectKey, (key) => {
  if (key) fetchOkrs(key);
}, { immediate: true });

// Also refresh OKR data alongside main data polling (every 30s)
watch(lastUpdated, () => {
  const key = projectKey.value;
  if (key) fetchOkrs(key);
});

// ── Tab 管理 ──
const { tabs, activeTab, currentTabComponent, currentTabProps } = useDetailTabs(project, knowledgeFiles, filterDate, allIssues, allModules, okrSummary);

// 切换回 Overview 时立即刷新数据，确保 Todo 列表与其他 Tab 的数据一致
watch(activeTab, (tab) => {
  if (tab === "overview") retry();
});

const tabStore = useTabsStore();

// ── 预览弹窗 ──
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

// ── 依赖注入（替代 props 透传） ──
provide(PROJECT_DETAIL_KEY, {
  project,
  knowledgeFiles, allIssues, allModules, allBugs,
  filterDate, filterDateStr,
  clearFilterDate: () => { filterDate.value = null; },
  navigateTab: (name: string) => { activeTab.value = name; },
  refreshData: retry,
  lastUpdated, loading, retry, startPolling, stopPolling,
  okrSummary,
});
provide(PREVIEW_DLG_KEY, previewDlgRef);

// ── 动态更新 Tab 标题为项目名称 ──
watch(project, (p) => {
  if (p?.name) tabStore.setTabsTitle(p.name);
});

// ── 恢复 URL 中的 Tab 状态 ──
const initialTab = route.query.tab;
if (typeof initialTab === "string") {
  activeTab.value = initialTab;
}

function goBack() {
  router.push("/project");
}
</script>

<style scoped lang="scss">
.project-detail {
  padding: 24px;
  height: calc(100vh - 146px);
  overflow: auto;
  background: var(--el-bg-color-page);
}

.project-detail__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.project-detail__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-detail__title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-detail__name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.project-detail__key {
  padding: 1px 8px;
  font-size: 11px;
  font-family: "SF Mono", Menlo, monospace;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.project-detail__head-center {
  display: flex;
  align-items: center;
}

.project-detail__tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.project-detail__tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.project-detail__tab-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-size: 11px;
  line-height: 18px;
  text-align: center;
}

.project-detail__not-found {
  padding: 80px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>