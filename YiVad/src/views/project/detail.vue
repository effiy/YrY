<template>
  <div class="project-detail">
    <template v-if="project">
      <div class="project-detail__head">
        <div class="project-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">{{ $t("project.detail.back") }}</el-button>
          <h1 class="project-detail__name">{{ project.name }}</h1>
        </div>
        <div class="project-detail__head-center">
          <HeroDateNav :filter-date="filterDate" :label="filterDateLabel" :is-today="isFilterToday" @prev="goToPrevDay" @next="goToNextDay" @today="goToFilterToday" @clear="clearFilterDate" />
        </div>
      </div>

      <el-tabs v-model="activeTab" class="project-detail__tabs">
        <el-tab-pane :label="$t('project.detail.tabs.overview')" name="overview">
          <DetailOverview :project="project" :filter-date="filterDate" :filter-date-str="filterDateStr" :filter-date-label="filterDateLabel" :knowledge-files="knowledgeFiles" :preview-dlg-ref="previewDlgRef" :all-issues="allIssues" @navigate="activeTab = $event" @clear-date="clearFilterDate" />
        </el-tab-pane>
        <el-tab-pane name="issues">
          <template #label>
            <span class="project-detail__tab-label">{{ $t("project.detail.tabs.issues") }}</span>
          </template>
          <IssueList v-if="visitedTabs.includes('issues')" :project-key="project.key" :filter-date="filterDate" filter-issue-type="requirement" />
        </el-tab-pane>
        <el-tab-pane name="modules">
          <template #label>
            <span class="project-detail__tab-label">{{ $t("project.detail.tabs.modules") }}</span>
          </template>
          <ModuleList v-if="visitedTabs.includes('modules')" :project-key="project.key" :filter-date="filterDate" />
        </el-tab-pane>
        <el-tab-pane name="docs">
          <template #label>
            <span class="project-detail__tab-label">{{ $t("project.detail.tabs.docs") }}<span class="project-detail__tab-count">{{ docCount }}</span></span>
          </template>
          <DetailDocs v-if="visitedTabs.includes('docs')" :project="project" :knowledge-files="knowledgeFiles" :preview-dlg-ref="previewDlgRef" />
        </el-tab-pane>
        <el-tab-pane name="bugs">
          <template #label>
            <span class="project-detail__tab-label">{{ $t("project.detail.tabs.bugs") }}</span>
          </template>
          <BugList v-if="visitedTabs.includes('bugs')" :project-key="project.key" :filter-date="filterDate" />
        </el-tab-pane>
        <el-tab-pane name="members">
          <template #label>
            <span class="project-detail__tab-label">{{ $t("project.detail.tabs.members") }}<span class="project-detail__tab-count">{{ project.members.length }}</span></span>
          </template>
          <DetailMembers v-if="visitedTabs.includes('members')" :project="project" @update:members="onMembersUpdate" />
        </el-tab-pane>
      </el-tabs>

      <KnowledgePreviewDialog ref="previewDlgRef" />
    </template>

    <div v-else-if="!loading" class="project-detail__not-found">
      <el-result icon="error" :title="$t('project.detail.notFound')" :sub-title="$t('project.detail.notFoundSub')">
        <template #extra>
          <el-button type="primary" @click="goBack">{{ $t('project.detail.backToProjects') }}</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="projectDetail">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useProjectStore } from "@/stores/modules/project";
import { usePageStore } from "@/stores/modules/page";
import { useDateFilter } from "@/hooks/useDateFilter";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import DetailOverview from "./components/DetailOverview.vue";
import DetailDocs from "./components/DetailDocs.vue";
import DetailMembers from "./components/DetailMembers.vue";
import IssueList from "@/views/issue/index.vue";
import ModuleList from "@/views/module/index.vue";
import BugList from "@/views/bug/index.vue";
import { listKnowledgeFiles } from "@/api/modules/knowledgeService";
import { getIssueList } from "@/api/modules/issueService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import type { Issue } from "@/api/modules/issueService";
import type { ProjectMember } from "@/api/modules/projectService";

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const pageStore = usePageStore();

const loading = ref(true);
const project = computed(() => store.currentProject);
const knowledgeFiles = ref<KnowledgeFileEntry[]>([]);
const allIssues = ref<Issue[]>([]);
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

const activeTab = ref("overview");
const visitedTabs = ref<string[]>(["overview"]);
const TAB_NAMES = ["overview", "issues", "modules", "docs", "bugs", "members"];

function markTabVisited(tab: string) {
  if (TAB_NAMES.includes(tab) && !visitedTabs.value.includes(tab)) {
    visitedTabs.value = [...visitedTabs.value, tab];
  }
}

const docCount = computed(() => {
  const key = project.value?.key || "";
  const prefix = `projects/${key}/文档/`;
  return knowledgeFiles.value.filter(f => f.path.startsWith(prefix) && f.path.endsWith(".md")).length;
});

async function loadKnowledgeFiles() {
  try {
    const res = await listKnowledgeFiles("projects");
    knowledgeFiles.value = res.files || [];
  } catch { /* ignore */ }
}

async function loadAllIssues() {
  if (!project.value) return;
  try {
    const res = await getIssueList({ project_key: project.value.key, pageSize: 500 });
    allIssues.value = (res.data?.list as Issue[]) ?? [];
  } catch { /* ignore */ }
}

function goBack() { router.push("/project"); }

function onMembersUpdate(members: ProjectMember[]) {
  if (project.value) store.editProject(project.value.key, { members });
}

watch(activeTab, (tab) => {
  markTabVisited(tab);
});

useKeyboardShortcuts([
  { key: "Backspace", handler: () => router.push("/project") },
  { key: "1", handler: () => { activeTab.value = "overview"; } },
  { key: "2", handler: () => { activeTab.value = "issues"; } },
  { key: "3", handler: () => { activeTab.value = "modules"; } },
  { key: "4", handler: () => { activeTab.value = "docs"; } },
  { key: "5", handler: () => { activeTab.value = "bugs"; } },
  { key: "6", handler: () => { activeTab.value = "members"; } },
]);

onMounted(async () => {
  const key = route.params.key as string;
  if (!key) {
    loading.value = false;
    router.replace("/project");
    return;
  }
  pageStore.reset();
  try {
    await store.fetchProject(key);
  } catch {
    loading.value = false;
    return;
  }
  const tab = route.query.tab;
  if (typeof tab === "string" && TAB_NAMES.includes(tab)) {
    activeTab.value = tab;
    markTabVisited(tab);
  }
  await Promise.all([loadKnowledgeFiles(), loadAllIssues()]);
  loading.value = false;
});
</script>

<style scoped lang="scss">
.project-detail { padding: 24px; height: calc(100vh - 146px); overflow: auto; background: var(--el-bg-color-page); }
.project-detail__head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.project-detail__head-left { display: flex; align-items: center; gap: 12px; }
.project-detail__name { margin: 0; font-size: 20px; font-weight: 600; }
.project-detail__head-center { display: flex; align-items: center; }
.project-detail__tabs { :deep(.el-tabs__header) { margin-bottom: 20px; } }
.project-detail__tab-label { display: inline-flex; align-items: center; gap: 6px; }
.project-detail__tab-count { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--el-fill-color); color: var(--el-text-color-secondary); font-size: 11px; line-height: 18px; text-align: center; }
.project-detail__not-found { padding: 80px 0; }

:deep(.el-tab-pane) {
  animation: pd-fade-in 0.2s ease;
}

@keyframes pd-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>