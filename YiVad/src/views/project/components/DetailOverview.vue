<template>
  <div>
    <div v-if="filterDate" class="do-date-banner">
      <el-icon><Calendar /></el-icon>
      <span>{{ $t("project.detail.dateBanner.showing", { date: filterDateLabel }) }}</span>
      <el-button size="small" text type="primary" @click="$emit('clearDate')">{{
        $t("project.detail.dateBanner.clear")
      }}</el-button>
    </div>

    <!-- Skeleton -->
    <template v-if="loading && !dataLoaded">
      <div class="do-skeleton">
        <div class="do-skeleton__readme" />
        <div class="do-skeleton__stats">
          <div v-for="i in 4" :key="i" class="do-skeleton__stat" :style="{ animationDelay: `${(i - 1) * 0.1}s` }" />
        </div>
      </div>
    </template>

    <!-- Error -->
    <el-result v-else-if="error" icon="error" :title="$t('project.error.loadOverview')" :sub-title="error">
      <template #extra>
        <el-button type="primary" @click="loadData">{{ $t("project.error.tryAgain") }}</el-button>
      </template>
    </el-result>

    <!-- Content -->
    <template v-else>
      <!-- README.md -->
      <div class="do-card do-card--flush">
        <div class="do-card__head">
          <el-icon class="do-card__icon"><Document /></el-icon>
          <span>README.md</span>
          <div class="do-card__head-right">
            <el-button v-if="descContent" link size="small" type="primary" :icon="Edit" @click="openDescDialog">{{
              $t("project.overview.readme.edit")
            }}</el-button>
            <el-button v-else link size="small" type="primary" @click="openDescDialog">{{
              $t("project.overview.readme.add")
            }}</el-button>
          </div>
        </div>
        <div class="do-card__body">
          <div v-if="descContent" ref="descPreviewRef" class="do-desc-preview" :class="{ 'is-clamped': !descExpanded }" v-html="descHtml" />
          <div v-if="descContent && descOverflows" class="do-desc-mask" :class="{ 'is-hidden': descExpanded }" />
          <el-button
            v-if="descContent && descOverflows"
            link
            size="small"
            type="primary"
            class="do-desc-toggle"
            @click="descExpanded = !descExpanded"
          >
            {{ descExpanded ? $t('project.overview.readme.collapse') : $t('project.overview.readme.expand') }}
            <el-icon><component :is="descExpanded ? ArrowUp : ArrowDown" /></el-icon>
          </el-button>
          <div v-else class="do-empty">
            <el-icon class="do-empty__icon"><Document /></el-icon>
            <p class="do-empty__text">{{ $t("project.overview.readme.noFile") }}</p>
            <p class="do-empty__hint">{{ $t("project.overview.readme.noFileHint") }}</p>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="do-layout">
        <div class="do-sidebar">
          <div class="do-sidebar__section">
            <div class="do-sidebar__section-header">
              <span class="do-sidebar__section-label">{{ $t("project.overview.sidebar.overview") }}</span>
            </div>
            <div class="do-sidebar__stats">
              <div class="do-sidebar__stat" @click="$emit('navigate', 'issues')">
                <span class="do-sidebar__stat-val">{{ overviewStats.totalIssues }}</span>
                <span class="do-sidebar__stat-lbl">{{ $t("project.overview.sidebar.issues") }}</span>
              </div>
              <div class="do-sidebar__stat" @click="$emit('navigate', 'bugs')">
                <span class="do-sidebar__stat-val">{{ overviewStats.totalBugs }}</span>
                <span class="do-sidebar__stat-lbl">{{ $t("project.overview.sidebar.bugs") }}</span>
              </div>
              <div class="do-sidebar__stat" @click="$emit('navigate', 'modules')">
                <span class="do-sidebar__stat-val">{{ overviewStats.totalModules }}</span>
                <span class="do-sidebar__stat-lbl">{{ $t("project.overview.sidebar.modules") }}</span>
              </div>
            </div>
            <div class="do-sidebar__progress">
              <span class="do-sidebar__progress-label">{{ $t("project.overview.sidebar.inProgress") }}</span>
              <span class="do-sidebar__progress-val">{{ overviewStats.inProgressIssues }}</span>
            </div>
            <div class="do-sidebar__progress">
              <span class="do-sidebar__progress-label">{{ $t("project.overview.sidebar.overdue") }}</span>
              <span class="do-sidebar__progress-val do-sidebar__progress-val--danger">{{ overviewStats.overdueIssues }}</span>
            </div>
          </div>

          <div class="do-sidebar__section">
            <div class="do-sidebar__section-header">
              <span class="do-sidebar__section-label">{{ $t("project.overview.sidebar.documentation") }}</span>
            </div>
            <div class="do-sidebar__docs">
              <div v-for="doc in docItems" :key="doc.title" class="do-sidebar__doc" @click="openDocPreview(doc)">
                <el-icon><Document /></el-icon>
                <span class="do-sidebar__doc-title">{{ doc.title }}</span>
                <span v-if="doc.tag" class="do-sidebar__doc-tag" :style="{ background: TAG_COLORS[doc.tag] || '#909399' }">{{
                  TAG_LABELS[doc.tag] || doc.tag
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="do-main">
          <div class="do-card">
            <h3 class="do-card__title">{{ $t("project.overview.modules.title") }}</h3>
            <div v-if="overviewModules.length" class="do-module-list">
              <div v-for="m in overviewModules" :key="m.id" class="do-module-item" @click="router.push(m.link)">
                <div class="do-module-accent" :style="{ background: m.color }" />
                <div class="do-module-head">
                  <code class="do-module-key">{{ m.id }}</code>
                  <span class="do-module-kind">{{ m.kindLabel }}</span>
                  <span class="do-module-status" :style="{ color: m.color }">{{ m.statusLabel }}</span>
                </div>
                <div class="do-module-name">{{ m.name }}</div>
                <div class="do-module-foot">
                  <span v-if="m.dates" class="do-module-foot-item">
                    <el-icon><Clock /></el-icon>{{ m.dates }}
                  </span>
                  <span v-if="m.total > 0" class="do-module-foot-item">
                    <el-progress
                      :percentage="m.pct"
                      :stroke-width="4"
                      :show-text="false"
                      :color="m.status === 'completed' ? '#67c23a' : m.color"
                    />
                    <span>{{ m.done }}/{{ m.total }}</span>
                  </span>
                </div>
                <div v-if="m.issueKeys.length" class="do-module-issues">
                  <div v-for="key in m.issueKeys" :key="key" class="do-module-issue-row" @click.stop="openIssueInline(key)">
                    <span
                      class="do-module-issue-priority"
                      :style="{ background: priorityColor(issueTitleMap.get(key)?.priority || '') }"
                    />
                    <span class="do-module-issue-key">{{ key }}</span>
                    <span class="do-module-issue-title">{{ issueTitleMap.get(key)?.title || key }}</span>
                    <span v-if="issueTitleMap.get(key)?.assignee" class="do-module-issue-assignee">{{
                      issueTitleMap.get(key)?.assignee
                    }}</span>
                    <el-tag
                      v-if="issueTitleMap.get(key)?.status"
                      :type="
                        issueTitleMap.get(key)?.status === 'done'
                          ? 'success'
                          : issueTitleMap.get(key)?.status === 'in_progress'
                            ? 'primary'
                            : 'info'
                      "
                      size="small"
                      >{{ issueTitleMap.get(key)?.status }}</el-tag
                    >
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else :description="$t('project.overview.modules.empty')" :image-size="48" />
          </div>

          <div class="do-card">
            <h3 class="do-card__title">{{ $t("project.overview.activity.title") }}</h3>
            <div v-if="overviewActivity.length" class="do-timeline">
              <template v-for="(group, gIdx) in activityGroups" :key="group.label">
                <div class="do-timeline-group">
                  <div class="do-timeline-group-label">{{ group.label }}</div>
                  <div
                    v-for="(a, i) in group.items"
                    :key="a.id"
                    class="do-timeline-item"
                    :class="{ 'do-timeline-item--last': i === group.items.length - 1 && gIdx === activityGroups.length - 1 }"
                    @click="handleActivityClick(a)"
                  >
                    <div class="do-timeline-dot" :style="{ background: activityColor(a.type) }" />
                    <div v-if="i < group.items.length - 1 || gIdx < activityGroups.length - 1" class="do-timeline-line" />
                    <div class="do-timeline-content">
                      <span class="do-timeline-action">{{ a.action }}</span>
                      <span class="do-timeline-target">{{ a.target }}</span>
                      <span class="do-timeline-time">{{ a.timeAgo }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <el-empty v-else :description="$t('project.overview.activity.empty')" :image-size="48" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { Calendar, Clock, Document, Edit, ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { readProjectFile } from "@/api/modules/fileService";
import { getIssueList } from "@/api/modules/issueService";
import { getModuleList } from "@/api/modules/moduleService";
import { getBugList } from "@/api/modules/bug";
import type { BugDocument } from "@/api/modules/bug";
import type { Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import type { Project } from "@/api/modules/projectService";
import { formatRelativeTime, formatDate } from "@/utils/datetime";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import {
  TAG_COLORS,
  TAG_LABELS,
  type OverviewStats,
  type ModuleSummary,
  type ActivityItem,
  type DocItem
} from "@/views/project/types";
import { STATUS_COLORS } from "@/views/project/constants";
import { activityColor, priorityColor } from "@/views/project/composables/useProjectStats";

const props = defineProps<{
  project: Project;
  filterDate: Date | null;
  filterDateStr: string;
  filterDateLabel: string;
  knowledgeFiles: KnowledgeFileEntry[];
  previewDlgRef: any;
  allIssues: Issue[];
}>();

const emit = defineEmits<{
  navigate: [tab: string];
  clearDate: [];
}>();

const router = useRouter();
const { renderWithHtml } = useMarkdown();

const loading = ref(false);
const error = ref<string | null>(null);
const dataLoaded = ref(false);

const overviewStats = reactive<OverviewStats>({
  totalIssues: 0,
  inProgressIssues: 0,
  overdueIssues: 0,
  totalModules: 0,
  totalBugs: 0,
  totalDocs: 0
});

const overviewModules = ref<ModuleSummary[]>([]);
const overviewActivity = ref<ActivityItem[]>([]);
const overviewIssues = ref<Issue[]>([]);

// ── README ──
const descContent = ref("");
const descExpanded = ref(false);
const descOverflows = ref(false);
const descHtml = computed(() => renderWithHtml(descContent.value || ""));
const descPreviewRef = ref<HTMLElement | null>(null);

function checkDescOverflow() {
  const el = descPreviewRef.value;
  if (!el) return;
  descOverflows.value = el.scrollHeight > el.clientHeight + 2;
}

watch(descHtml, () => nextTick(checkDescOverflow));

async function loadDescFile() {
  if (!props.project) return;
  try {
    const content = await readProjectFile(props.project.key, "README.md");
    descContent.value = content || "";
  } catch {
    descContent.value = props.project?.description || "";
  }
}

function openDescDialog() {
  props.previewDlgRef?.openRaw({ title: "README.md", content: descContent.value });
}

// ── Doc items (sidebar) ──
const docItems = computed<DocItem[]>(() => {
  const key = props.project?.key || "";
  const prefix = `projects/${key}/文档/`;
  const items = props.knowledgeFiles
    .filter(f => f.path.startsWith(prefix) && f.path.endsWith(".md"))
    .map(f => {
      const rel = f.path.slice(prefix.length);
      const tag = rel.split("/")[0] || "";
      return { title: (f.meta?.title as string) || f.name.replace(/\.md$/, ""), path: f.path, tag };
    });
  items.unshift({ title: "CLAUDE.md", path: "CLAUDE.md", tag: "ai-guide" });
  return items;
});

async function openDocPreview(doc: DocItem) {
  if (doc.path === "CLAUDE.md") {
    if (!props.project) return;
    try {
      const content = await readProjectFile(props.project.key, "CLAUDE.md");
      props.previewDlgRef?.openRaw({ title: "CLAUDE.md", content });
    } catch {
      /* ignore */
    }
    return;
  }
  props.previewDlgRef?.open(doc.path);
}

// ── Issue title map ──
const issueTitleMap = computed(() => {
  const m = new Map<string, Issue>();
  for (const i of props.allIssues) m.set(i.key, i);
  return m;
});

const issueProgressMap = computed(() => {
  return new Map<string, { done: number; total: number }>();
});

async function loadWithTimeout<T>(promise: Promise<T>, ms = 10_000): Promise<T> {
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms));
  return Promise.race([promise, timeout]);
}

async function loadData() {
  if (dataLoaded.value) return;
  loading.value = true;
  error.value = null;
  try {
    await loadWithTimeout(Promise.all([loadOverviewStats(), loadDescFile()]));
    dataLoaded.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load overview data";
  } finally {
    loading.value = false;
  }
}

async function loadOverviewStats() {
  if (!props.project) return;
  try {
    const [issueRes, moduleRes, bugRes] = await Promise.all([
      getIssueList({ project_key: props.project.key, pageSize: 500 }),
      getModuleList({ project_key: props.project.key, pageSize: 500 }),
      getBugList({ project_key: props.project.key, pageSize: 500 })
    ]);

    const all = (issueRes.data?.list as Issue[]) ?? [];
    const date = props.filterDateStr;
    const issues = date ? all.filter(i => (i.due_date || "").slice(0, 10) === date) : all;
    const modules = (moduleRes.data?.list as Module[]) ?? [];
    const bugs = (bugRes.data?.list as BugDocument[]) ?? [];

    overviewIssues.value = issues;
    overviewStats.totalIssues = issues.length;
    overviewStats.inProgressIssues = issues.filter(i => i.status === "in_progress").length;
    const now = new Date().toISOString().slice(0, 10);
    overviewStats.overdueIssues = issues.filter(i => i.due_date && i.due_date < now && i.status !== "done").length;
    overviewStats.totalModules = date ? modules.filter(m => (m.due_date || "").slice(0, 10) === date).length : modules.length;
    overviewStats.totalBugs = date
      ? bugs.filter(b => {
          const d = new Date(b.createdAt).toISOString().slice(0, 10);
          return d === date;
        }).length
      : bugs.length;

    const merged: ModuleSummary[] = [];
    for (const mod of modules.slice(0, 5)) {
      const entry = issueProgressMap.value.get(mod.key);
      merged.push({
        id: mod.key,
        name: mod.name,
        kind: "module",
        kindLabel: "Epic",
        statusLabel: mod.status,
        status: mod.status,
        color: STATUS_COLORS[mod.status as keyof typeof STATUS_COLORS] || "#9b59b6",
        dates: mod.start_date ? `${formatDate(mod.start_date)} — ${formatDate(mod.due_date || "")}` : "",
        link: `/module/${mod.key}`,
        done: entry?.done || 0,
        total: entry?.total || 0,
        pct: entry?.total ? Math.round((entry.done / entry.total) * 100) : 0,
        issueKeys: mod.issue_keys || []
      });
    }
    merged.sort((a, b) => b.total - a.total);
    overviewModules.value = merged;

    const activity: ActivityItem[] = [];
    issues.slice(0, 10).forEach(i => {
      const d = (i.created_at || "").slice(0, 10);
      const slug = i.title
        .toLowerCase()
        .replace(/[→+(),]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      activity.push({
        id: i.key,
        type: "issue",
        action: i.status === "done" ? "Completed" : i.status === "in_progress" ? "Started" : "Created",
        target: i.title,
        timeAgo: formatRelativeTime(i.updated_at),
        updatedAt: i.updated_at,
        link: `/issue/${i.key}`,
        filePath: `projects/${i.project_key}/issues/${d}/${i.issue_type}/${slug}.md`
      });
    });
    modules.slice(0, 5).forEach(m => {
      activity.push({
        id: m.key,
        type: "module",
        action: m.status === "completed" ? "Completed" : m.status === "in_progress" ? "Started" : "Planned",
        target: m.name,
        timeAgo: formatRelativeTime(m.updated_at),
        updatedAt: m.updated_at,
        link: `/module/${m.key}`
      });
    });
    bugs.slice(0, 5).forEach(b => {
      activity.push({
        id: b.key,
        type: "bug",
        action:
          b.status === "resolved" || b.status === "closed" ? "Resolved" : b.status === "in_progress" ? "Started" : "Reported",
        target: b.title,
        timeAgo: formatRelativeTime(b.updatedAt),
        updatedAt: new Date(b.updatedAt).toISOString(),
        link: `/bug/${b.key}`
      });
    });
    activity.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    overviewActivity.value = activity.slice(0, 10);
  } catch {
    /* ignore */
  }
}

function handleActivityClick(a: ActivityItem) {
  if (a.type === "issue" && a.filePath) {
    props.previewDlgRef?.open(a.filePath);
  } else {
    router.push(a.link);
  }
}

const activityGroups = computed(() => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  const groups: { label: string; items: ActivityItem[] }[] = [];
  for (const item of overviewActivity.value) {
    const day = (item.updatedAt || "").slice(0, 10);
    let label: string;
    if (day === today) label = "Today";
    else if (day === yesterday) label = "Yesterday";
    else label = day || "Unknown";

    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
});

function openIssueInline(key: string) {
  const issue = issueTitleMap.value.get(key);
  if (!issue) return;
  const date = (issue.created_at || "").slice(0, 10);
  const slug = issue.title
    .toLowerCase()
    .replace(/[→+(),]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filePath = `projects/${issue.project_key}/issues/${date}/${issue.issue_type}/${slug}.md`;
  props.previewDlgRef?.open(filePath);
}

onMounted(() => loadData());

watch(
  () => props.filterDateStr,
  () => {
    dataLoaded.value = false;
    loadData();
  }
);
</script>

<style scoped lang="scss">
.do-date-banner {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  margin-bottom: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 9px;
  .el-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--el-color-warning);
  }
  .el-button {
    margin-left: auto;
  }
}
.do-layout {
  display: grid;
  grid-template-columns: minmax(240px, 30%) 1fr;
  gap: 20px;
  margin-bottom: 8px;
  align-items: start;
}
.do-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 16px;
}
.do-sidebar__section {
  & + & {
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
.do-sidebar__section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  border-left: 2px solid var(--el-color-primary);
  margin-bottom: 10px;
}
.do-sidebar__section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
}
.do-sidebar__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.do-sidebar__stat {
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.do-sidebar__stat-val {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}
.do-sidebar__stat-lbl {
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
}
.do-sidebar__progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 0 2px;
}
.do-sidebar__progress-val {
  font-weight: 600;
  color: var(--el-text-color-primary);
  &--danger {
    color: var(--el-color-danger);
  }
}
.do-sidebar__docs {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.do-sidebar__doc {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
  .el-icon {
    font-size: 13px;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }
}
.do-sidebar__doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.do-sidebar__doc-tag {
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  padding: 1px 5px;
  border-radius: 999px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.do-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.do-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px;
  &--flush {
    padding: 0;
    overflow: hidden;
  }
}
.do-card__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
}
.do-card__empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.do-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.do-card__icon {
  font-size: 16px;
  color: var(--el-color-primary);
}
.do-card__head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}
.do-card__body {
  padding: 16px;
}
.do-desc-preview {
  padding: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  position: relative;

  &.is-clamped {
    max-height: 400px;
    overflow: hidden;
  }
}

.do-desc-mask {
  position: relative;
  height: 40px;
  margin-top: -40px;
  background: linear-gradient(transparent, var(--el-bg-color));
  pointer-events: none;
  border-radius: 0 0 6px 6px;

  &.is-hidden {
    display: none;
  }
}

.do-desc-toggle {
  display: block;
  margin: 6px auto 0;
  font-size: 12px;
}
.do-empty {
  text-align: center;
  padding: 24px 16px;
}
.do-empty__icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}
.do-empty__text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.do-empty__hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.do-module-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.do-module-item {
  position: relative;
  cursor: pointer;
  padding: 12px 12px 12px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
  &:hover {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    .do-module-accent { width: 4px; opacity: 1; }
  }
}
.do-module-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  opacity: 0.7;
  transition:
    width 0.15s,
    opacity 0.15s;
}
.do-module-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.do-module-key {
  font-size: 11px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 0 5px;
  border-radius: 3px;
}
.do-module-kind {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9b59b6;
}
.do-module-status {
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
}
.do-module-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.do-module-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.do-module-foot-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  :deep(.el-progress) {
    width: 60px;
    flex-shrink: 0;
  }
}
.do-module-issues {
  padding-top: 6px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 160px;
  overflow-y: auto;
}
.do-module-issue-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.12s;
  margin-left: -4px;
  margin-right: -4px;
  &:hover {
    background: var(--el-fill-color);
  }
}
.do-module-issue-priority {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.do-module-issue-key {
  font-size: 10px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 0 4px;
  border-radius: 2px;
  flex-shrink: 0;
}
.do-module-issue-title {
  font-size: 11px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.do-module-issue-assignee {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.do-timeline {
  display: flex;
  flex-direction: column;
}

.do-timeline-group {
  display: flex;
  flex-direction: column;
}

.do-timeline-group-label {
  padding: 4px 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.do-timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 0 0 16px 20px;
  cursor: pointer;

  &:hover {
    .do-timeline-target { color: var(--el-color-primary); }
  }

  &--last { padding-bottom: 0; }
}

.do-timeline-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
  transition: transform 0.15s;

  .do-timeline-item:hover & {
    transform: scale(1.4);
  }
}

.do-timeline-line {
  position: absolute;
  left: 4px;
  top: 18px;
  bottom: 0;
  width: 2px;
  background: var(--el-border-color-light);
}

.do-timeline-content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  transition: background 0.15s;

  .do-timeline-item:hover & {
    background: var(--el-fill-color-lighter);
  }
}

.do-timeline-action {
  font-weight: 600;
}

.do-timeline-target {
  color: var(--el-color-primary);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}

.do-timeline-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-left: auto;
}

:deep(.do-desc-preview) {
  h1,
  h2,
  h3,
  h4 {
    margin: 1em 0 0.5em;
  }
  h1 {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.3em;
  }
  h3 {
    font-size: 1.15em;
  }
  p {
    margin: 0.5em 0;
  }
  pre {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
    code {
      padding: 0;
      background: none;
    }
  }
  code {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  blockquote {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  table {
    border-collapse: collapse;
  }
  th,
  td {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }
  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
  }
  ul,
  ol {
    padding-left: 22px;
    margin: 0.5em 0;
  }
  li {
    margin-bottom: 2px;
  }
  a {
    color: var(--el-color-primary);
  }
  hr {
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
    margin: 16px 0;
  }
  img {
    max-width: 100%;
  }
  pre.mermaid {
    all: unset;
    display: block;
    overflow-x: auto;
    margin: 12px 0;
    svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  }
}

.do-skeleton {
  &__readme {
    height: 200px;
    border-radius: 10px;
    background: var(--el-fill-color-light);
    animation: do-skeleton-pulse 1.5s ease-in-out infinite;
    margin-bottom: 16px;
  }
  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  &__stat {
    height: 80px;
    border-radius: 10px;
    background: var(--el-fill-color-light);
    animation: do-skeleton-pulse 1.5s ease-in-out infinite;
  }
}

@keyframes do-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
