<template>
  <div class="project-detail">
    <!-- 状态 1: 加载失败 -->
    <DetailError v-if="error" :message="error" @retry="retry" />

    <!-- 状态 2: Header 尚未就绪，全页骨架 -->
    <template v-else-if="!headerReady">
      <div class="pd-head-skel">
        <span class="pd-head-skel__back" />
        <span class="pd-head-skel__title" />
        <span class="pd-head-skel__key" />
        <span class="pd-head-skel__nav" />
      </div>
      <div class="pd-tabs-skel">
        <span v-for="i in 6" :key="i" class="pd-tabs-skel__item" :style="{ animationDelay: `${(i - 1) * 0.06}s` }" />
      </div>
      <div class="pd-content-skel">
        <div class="pd-content-skel__row" />
        <div class="pd-content-skel__row" style="width: 72%" />
        <div class="pd-content-skel__block">
          <div class="pd-content-skel__block-head" />
          <div v-for="i in 3" :key="i" class="pd-content-skel__line" :style="{ width: `${90 - i * 12}%` }" />
        </div>
        <div class="pd-content-skel__cols">
          <div class="pd-content-skel__col">
            <div class="pd-content-skel__col-head" />
            <div v-for="i in 3" :key="i" class="pd-content-skel__line" />
          </div>
          <div class="pd-content-skel__col">
            <div class="pd-content-skel__col-head" />
            <div v-for="i in 3" :key="i" class="pd-content-skel__line" />
          </div>
        </div>
      </div>
    </template>

    <!-- 状态 3: 项目不存在 -->
    <div v-else-if="!project" class="project-detail__not-found">
      <el-result icon="error" :title="$t('project.detail.notFound')" :sub-title="$t('project.detail.notFoundSub')">
        <template #extra>
          <el-button type="primary" @click="goBack">
            {{ $t("project.detail.backToProjects") }}
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 状态 4: 正常渲染（Header+Tabs 立即展示，Content 按需加载） -->
    <template v-else>
      <div class="project-detail__head">
        <div class="project-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">
            {{ $t("project.detail.back") }}
          </el-button>
          <div class="project-detail__title-group">
            <h1 class="project-detail__name">{{ project.name }}</h1>
            <code class="project-detail__key">{{ project.key }}</code>
            <el-tag :type="project.status === 'archived' ? 'info' : 'success'" size="small" effect="plain">{{
              project.status === "archived" ? $t("project.dialog.statusArchived") : $t("project.dialog.statusActive")
            }}</el-tag>
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
        <el-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name">
          <template #label>
            <span class="project-detail__tab-label">
              <el-icon :size="14"><component :is="tab.icon" /></el-icon>
              {{ tab.label }}
              <span v-if="tab.count != null" class="project-detail__tab-count">{{ tab.count.value }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- Content 骨架或真实内容 -->
      <div v-if="loading" class="pd-content-skel">
        <div class="pd-content-skel__row" />
        <div class="pd-content-skel__row" style="width: 72%" />
        <div class="pd-content-skel__block">
          <div class="pd-content-skel__block-head" />
          <div v-for="i in 3" :key="i" class="pd-content-skel__line" :style="{ width: `${90 - i * 12}%` }" />
        </div>
        <div class="pd-content-skel__cols">
          <div class="pd-content-skel__col">
            <div class="pd-content-skel__col-head" />
            <div v-for="i in 3" :key="i" class="pd-content-skel__line" />
          </div>
          <div class="pd-content-skel__col">
            <div class="pd-content-skel__col-head" />
            <div v-for="i in 3" :key="i" class="pd-content-skel__line" />
          </div>
        </div>
      </div>
      <Transition v-else name="fade" mode="out-in">
        <component :is="currentTabComponent" :key="activeTab" v-bind="currentTabProps" />
      </Transition>
    </template>

    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="ts" name="projectDetail">
import { computed, ref, provide, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { syncKnowledge } from "@/api/modules/knowledgeService";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useDetailTabs } from "@/hooks/useDetailTabs";
import { useDateFilter } from "@/hooks/useDateFilter";
import { useTabsStore } from "@/stores/modules/tabs";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import DetailError from "./components/DetailError.vue";
import { PROJECT_DETAIL_KEY, PREVIEW_DLG_KEY, type OkrSummary } from "./types";

const route = useRoute();
const router = useRouter();

// ── 数据加载 ──
const projectKey = computed(() => (route.params.key as string) || "");
const {
  project,
  loading,
  headerReady,
  error,
  knowledgeFiles,
  allIssues,
  allModules,
  allBugs,
  lastUpdated,
  retry,
  startPolling,
  stopPolling
} = useProjectDetail(projectKey);

// Non-blocking disk→MongoDB sync on first project page visit.
let _synced = false;
onMounted(() => {
  if (!_synced) {
    _synced = true;
    syncKnowledge().catch(() => {});
  }
});

// ── 日期筛选 ──
const filterDate = ref<Date | null>(null);
const {
  label: filterDateLabel,
  isToday: isFilterToday,
  filterDateStr,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate
} = useDateFilter(filterDate);

// ── OKR summary (populated by DetailOkr, consumed by DetailOverview + Tab badge) ──
const okrSummary = ref<OkrSummary>({ totalGoals: 0, avgProgress: 0, completedCount: 0 });

// ── Tab 管理 ──
const { tabs, activeTab, currentTabComponent, currentTabProps } = useDetailTabs(
  project,
  knowledgeFiles,
  filterDate,
  allIssues,
  allModules
);

// 切换回 Overview 时立即刷新数据
watch(activeTab, tab => {
  if (tab === "overview") retry();
});

const tabStore = useTabsStore();

// ── 预览弹窗 ──
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

// ── 依赖注入（替代 props 透传） ──
provide(PROJECT_DETAIL_KEY, {
  project,
  knowledgeFiles,
  allIssues,
  allModules,
  allBugs,
  filterDate,
  filterDateStr,
  clearFilterDate: () => {
    filterDate.value = null;
  },
  navigateTab: (name: string) => {
    activeTab.value = name;
  },
  refreshData: retry,
  lastUpdated,
  loading,
  retry,
  startPolling,
  stopPolling,
  okrSummary
});
provide(PREVIEW_DLG_KEY, previewDlgRef);

// ── 动态更新 Tab 标题为项目名称 ──
watch(project, p => {
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
  height: calc(100vh - 146px);
  padding: 24px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.project-detail__head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.project-detail__head-left {
  display: flex;
  gap: 12px;
  align-items: center;
}
.project-detail__title-group {
  display: flex;
  gap: 10px;
  align-items: center;
}
.project-detail__name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.project-detail__key {
  padding: 1px 8px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
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
  gap: 6px;
  align-items: center;
}
.project-detail__tab-count {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  line-height: 18px;
  color: var(--el-text-color-secondary);
  text-align: center;
  background: var(--el-fill-color);
  border-radius: 999px;
}
.project-detail__not-found {
  padding: 80px 0;
}

// ── Progressive skeleton states ──
.pd-head-skel {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 32px;
  margin-bottom: 20px;
}
.pd-head-skel__back {
  width: 56px;
  height: 28px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-head-skel__title {
  width: 160px;
  height: 28px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-head-skel__key {
  width: 64px;
  height: 20px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-head-skel__nav {
  width: 180px;
  height: 28px;
  margin-left: auto;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-tabs-skel {
  display: flex;
  gap: 20px;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--el-border-color-lighter);
}
.pd-tabs-skel__item {
  width: 56px;
  height: 20px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-content-skel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pd-content-skel__row {
  height: 14px;
  background: var(--el-fill-color-light);
  border-radius: 7px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-content-skel__block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.pd-content-skel__block-head {
  height: 40px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-content-skel__line {
  height: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}
.pd-content-skel__cols {
  display: flex;
  gap: 20px;
}
.pd-content-skel__col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.pd-content-skel__col-head {
  width: 80px;
  height: 18px;
  margin-bottom: 4px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: pd-pulse 1.4s ease-in-out infinite;
}

@keyframes pd-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

// ── Transitions ──
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
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
