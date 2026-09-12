import { computed, ref, type Component, type ComputedRef, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  Odometer, TrendCharts, Document, Grid, Warning, Folder, Aim, Checked,
} from "@element-plus/icons-vue";
import DetailOverview from "@/views/project/components/DetailOverview.vue";
import DetailWorkflows from "@/views/project/components/DetailWorkflows.vue";
import DetailAnalytics from "@/views/project/components/DetailAnalytics.vue";
import DetailDevs from "@/views/project/components/DetailDevs.vue";
import DetailBugs from "@/views/project/components/DetailBugs.vue";
import DetailOkr from "@/views/project/components/DetailOkr.vue";
import DetailRequirements from "@/views/project/components/DetailRequirements.vue";
import DetailTests from "@/views/project/components/DetailTests.vue";
import type { Project } from "@/api/modules/projectService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import type { Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import type { OkrSummary } from "@/views/project/types";
import { countProjectWorkflows } from "@/views/project/constants";

export interface TabConfig {
  name: string;
  label: string;
  icon: Component;
  component: Component;
  count?: ComputedRef<number>;
}

export function useDetailTabs(
  project: Ref<Project | null>,
  knowledgeFiles: Ref<KnowledgeFileEntry[]>,
  filterDate: Ref<Date | null>,
  allIssues: Ref<Issue[]>,
  allModules: Ref<Module[]>,
  okrSummary?: Ref<OkrSummary>,
) {
  const { t } = useI18n();
  const activeTab = ref("overview");

  const projectKey = computed(() => project.value?.key || "");

  const workflowCount = computed(() => {
    const key = project.value?.key || "";
    if (!key) return 0;
    return countProjectWorkflows(knowledgeFiles.value, key);
  });

  const devCount = computed(() => {
    const key = project.value?.key || "";
    if (!key) return 0;
    const prefix = `projects/${key}/devs/`;
    return knowledgeFiles.value.filter(f => f.path.endsWith(".md") && f.name !== "README.md" && f.path.startsWith(prefix)).length;
  });

  const bugCount = computed(() => {
    const key = project.value?.key || "";
    if (!key) return 0;
    const prefix = `projects/${key}/bugs/`;
    return knowledgeFiles.value.filter(f => f.path.endsWith(".md") && f.name !== "README.md" && f.path.startsWith(prefix)).length;
  });

  const okrCount = computed(() => okrSummary?.value?.totalGoals ?? 0);

  const prdCount = computed(() => {
    const key = project.value?.key || "";
    if (!key) return 0;
    const prefix = `projects/${key}/prds/`;
    return knowledgeFiles.value.filter(f => f.path.endsWith(".md") && f.name !== "README.md" && f.path.startsWith(prefix)).length;
  });

  const testCount = computed(() => {
    const key = project.value?.key || "";
    if (!key) return 0;
    const prefix = `projects/${key}/tests/`;
    return knowledgeFiles.value.filter(f => f.path.endsWith(".md") && f.name !== "README.md" && f.path.startsWith(prefix)).length;
  });

  const tabs = computed<TabConfig[]>(() => [
    { name: "overview", label: t("project.detail.tabs.overview"), icon: Odometer, component: DetailOverview },
    { name: "okr", label: t("project.detail.tabs.okr"), icon: Aim, component: DetailOkr, count: okrCount },
    { name: "prds", label: t("project.detail.tabs.prds"), icon: Document, component: DetailRequirements, count: prdCount },
    { name: "devs", label: t("project.detail.tabs.devs"), icon: Grid, component: DetailDevs, count: devCount },
    { name: "tests", label: t("project.detail.tabs.test"), icon: Checked, component: DetailTests, count: testCount },
    { name: "bugs", label: t("project.detail.tabs.bugs"), icon: Warning, component: DetailBugs, count: bugCount },
    { name: "workflows", label: t("project.detail.tabs.workflows"), icon: Folder, component: DetailWorkflows, count: workflowCount },
    { name: "analytics", label: t("project.detail.tabs.analytics"), icon: TrendCharts, component: DetailAnalytics },
  ]);

  const currentTabComponent = computed(
    () => tabs.value.find((t) => t.name === activeTab.value)?.component,
  );

  /** Props to pass to the current tab's dynamic component */
  const currentTabProps = computed<Record<string, unknown>>(() => {
    const base = { projectKey: projectKey.value, filterDate: filterDate.value, knowledgeFiles: knowledgeFiles.value };
    return base;
  });

  return { tabs, activeTab, currentTabComponent, currentTabProps };
}