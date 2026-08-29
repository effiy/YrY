<template>
  <div class="project-detail" v-loading="loading">
    <template v-if="project">
      <div class="project-detail__head">
        <div class="project-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Projects</el-button>
          <h1 class="project-detail__name">{{ project.name }}</h1>
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
        <el-tab-pane label="Overview" name="overview">
          <div v-if="filterDate" class="project-detail__date-banner">
            <el-icon><Calendar /></el-icon>
            <span>Showing issues due on <strong>{{ filterDateLabel }}</strong></span>
            <el-button size="small" text type="primary" @click="clearFilterDate">Clear</el-button>
          </div>

          <!-- README.md — full width -->
          <div class="project-detail__card project-detail__card--flush">
            <div class="id-card__head">
              <el-icon class="id-card__icon"><Document /></el-icon>
              <span>README.md</span>
              <el-tag v-if="descMeta.type" size="small" type="info" class="id-card__meta-tag">{{ descMeta.type }}</el-tag>
              <span v-if="descMeta.updated" class="id-card__meta-date">Updated {{ descMeta.updated }}</span>
              <div class="id-card__head-right">
                <el-button v-if="descContent" link size="small" type="primary" :icon="Edit" @click="openDescDialog">Edit</el-button>
                <el-button v-else link size="small" type="primary" @click="openDescDialog">Add README.md</el-button>
              </div>
            </div>
            <div class="id-card__body">
              <div v-if="descContent" class="id-desc-preview" v-html="descHtml" />
              <div v-else class="id-empty">
                <el-icon class="id-empty__icon"><Document /></el-icon>
                <p class="id-empty__text">No README.md found</p>
                <p class="id-empty__hint">Add a README.md to the project source to see it here</p>
              </div>
            </div>
          </div>

          <!-- Two-column layout: sidebar + main -->
          <div class="project-detail__overview-layout">
            <!-- Sidebar -->
            <div class="project-detail__overview-sidebar">
              <!-- Stats -->
              <div class="project-detail__sidebar-section">
                <div class="project-detail__sidebar-section-header">
                  <span class="project-detail__sidebar-section-label">Overview</span>
                </div>
                <div class="project-detail__sidebar-stats">
                  <div class="project-detail__sidebar-stat" @click="goTab('requirements')">
                    <span class="project-detail__sidebar-stat-val">{{ overviewStats.totalRequirements }}</span>
                    <span class="project-detail__sidebar-stat-lbl">Requirements</span>
                  </div>
                  <div class="project-detail__sidebar-stat" @click="goTab('issues')">
                    <span class="project-detail__sidebar-stat-val">{{ overviewStats.totalIssues }}</span>
                    <span class="project-detail__sidebar-stat-lbl">Issues</span>
                  </div>
                  <div class="project-detail__sidebar-stat" @click="goTab('bugs')">
                    <span class="project-detail__sidebar-stat-val">{{ overviewStats.totalBugs }}</span>
                    <span class="project-detail__sidebar-stat-lbl">Bugs</span>
                  </div>
                  <div class="project-detail__sidebar-stat" @click="goTab('modules')">
                    <span class="project-detail__sidebar-stat-val">{{ overviewStats.totalModules }}</span>
                    <span class="project-detail__sidebar-stat-lbl">Modules</span>
                  </div>
                </div>
                <div class="project-detail__sidebar-progress">
                  <span class="project-detail__sidebar-progress-label">In Progress</span>
                  <span class="project-detail__sidebar-progress-val">{{ overviewStats.inProgressIssues }}</span>
                </div>
                <div class="project-detail__sidebar-progress">
                  <span class="project-detail__sidebar-progress-label">Overdue</span>
                  <span class="project-detail__sidebar-progress-val project-detail__sidebar-progress-val--danger">{{ overviewStats.overdueIssues }}</span>
                </div>
              </div>

              <!-- Project Documentation -->
              <div class="project-detail__sidebar-section">
                <div class="project-detail__sidebar-section-header">
                  <span class="project-detail__sidebar-section-label">Documentation</span>
                </div>
                <div class="project-detail__sidebar-docs">
                  <div v-for="doc in docItems" :key="doc.title" class="project-detail__sidebar-doc" @click="openDocPreview(doc)">
                    <el-icon><Document /></el-icon>
                    <span class="project-detail__sidebar-doc-title">{{ doc.title }}</span>
                    <span
                      v-if="doc.tag"
                      class="project-detail__sidebar-doc-tag"
                      :style="{ background: TAG_COLORS[doc.tag] || '#909399' }"
                    >{{ TAG_LABELS[doc.tag] || doc.tag }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main: Modules + Activity -->
            <div class="project-detail__overview-main">
              <div class="project-detail__card">
                <h3 class="project-detail__card-title">Modules</h3>
                <div v-if="overviewModules.length" class="project-detail__module-list">
                  <div
                    v-for="m in overviewModules"
                    :key="m.id"
                    class="project-detail__module-item"
                    @click="router.push(m.link)"
                  >
                    <div class="project-detail__module-accent" :style="{ background: m.color }" />
                    <div class="project-detail__module-head">
                      <code class="project-detail__module-key">{{ m.id }}</code>
                      <span class="project-detail__module-kind" :class="`project-detail__module-kind--${m.kind}`">{{ m.kindLabel }}</span>
                      <span class="project-detail__module-status" :style="{ color: m.color }">{{ m.statusLabel }}</span>
                    </div>
                    <div class="project-detail__module-name">{{ m.name }}</div>
                    <div class="project-detail__module-foot">
                      <span v-if="m.dates" class="project-detail__module-foot-item">
                        <el-icon><Clock /></el-icon>{{ m.dates }}
                      </span>
                      <span v-if="m.total > 0" class="project-detail__module-foot-item">
                        <el-progress :percentage="m.pct" :stroke-width="4" :show-text="false" :color="m.status === 'completed' || m.status === 'released' ? '#67c23a' : m.color" />
                        <span>{{ m.done }}/{{ m.total }}</span>
                      </span>
                    </div>
                    <div v-if="m.issueKeys.length" class="project-detail__module-issues">
                      <div
                        v-for="key in m.issueKeys"
                        :key="key"
                        class="project-detail__module-issue-row"
                        @click.stop="openCycleIssue(key)"
                      >
                        <span class="project-detail__module-issue-priority" :style="{ background: priorityColor(issueTitleMap.get(key)?.priority || '') }" />
                        <span class="project-detail__module-issue-key">{{ key }}</span>
                        <span class="project-detail__module-issue-title">{{ issueTitleMap.get(key)?.title || key }}</span>
                        <span v-if="issueTitleMap.get(key)?.assignee" class="project-detail__module-issue-assignee">{{ issueTitleMap.get(key)?.assignee }}</span>
                        <el-tag v-if="issueTitleMap.get(key)?.status" :type="issueTitleMap.get(key)?.status === 'done' ? 'success' : issueTitleMap.get(key)?.status === 'in_progress' ? 'primary' : 'info'" size="small">{{ issueTitleMap.get(key)?.status }}</el-tag>
                      </div>
                    </div>
                  </div>
                </div>
                <span v-else class="project-detail__card-empty">No modules</span>
              </div>

              <div class="project-detail__card">
                <h3 class="project-detail__card-title">Recent Activity</h3>
                <div v-if="overviewActivity.length" class="project-detail__activity">
                  <div v-for="a in overviewActivity" :key="a.id" class="project-detail__activity-item" @click="handleActivityClick(a)">
                    <div class="project-detail__activity-dot" :style="{ background: activityColor(a.type) }" />
                    <div class="project-detail__activity-content">
                      <span class="project-detail__activity-action">{{ a.action }}</span>
                      <span class="project-detail__activity-target">{{ a.target }}</span>
                      <span class="project-detail__activity-time">{{ a.timeAgo }}</span>
                    </div>
                  </div>
                </div>
                <span v-else class="project-detail__card-empty">No recent activity</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="requirements">
          <template #label>
            <span class="project-detail__tab-label">Requires<span class="project-detail__tab-count">{{ overviewStats.totalRequirements }}</span></span>
          </template>
          <IssueList :project-key="project.key" :filter-date="filterDate" filter-issue-type="requirement" />
        </el-tab-pane>
        <el-tab-pane name="issues">
          <template #label>
            <span class="project-detail__tab-label">Issues<span class="project-detail__tab-count">{{ overviewStats.totalIssues }}</span></span>
          </template>
          <IssueList :project-key="project.key" :filter-date="filterDate" exclude-issue-type="requirement" />
        </el-tab-pane>
        <el-tab-pane name="modules">
          <template #label>
            <span class="project-detail__tab-label">Modules<span class="project-detail__tab-count">{{ overviewStats.totalModules }}</span></span>
          </template>
          <ModuleList :project-key="project.key" :filter-date="filterDate" />
        </el-tab-pane>
        <el-tab-pane name="docs">
          <template #label>
            <span class="project-detail__tab-label">Docs<span class="project-detail__tab-count">{{ pageStore.total }}</span></span>
          </template>
          <PageList :project-key="project.key" :filter-date="filterDate" />
        </el-tab-pane>
        <el-tab-pane name="bugs">
          <template #label>
            <span class="project-detail__tab-label">Bugs<span class="project-detail__tab-count">{{ overviewStats.totalBugs }}</span></span>
          </template>
          <BugList :project-key="project.key" :filter-date="filterDate" />
        </el-tab-pane>
        <el-tab-pane name="members">
          <template #label>
            <span class="project-detail__tab-label">Members<span class="project-detail__tab-count">{{ project.members.length }}</span></span>
          </template>
          <div class="project-detail__members-head">
            <span class="project-detail__members-count">{{ project.members.length }} member{{ project.members.length === 1 ? "" : "s" }}</span>
            <el-button size="small" type="primary" :icon="Plus" @click="openAddMember">Add Member</el-button>
          </div>
          <div v-if="project.members.length" class="project-detail__members">
            <div v-for="m in project.members" :key="m.user_id" class="project-detail__member">
              <el-avatar :size="32" :src="m.avatar">{{ m.username.charAt(0).toUpperCase() }}</el-avatar>
              <div class="project-detail__member-info">
                <span class="project-detail__member-name">{{ m.username }}</span>
                <span class="project-detail__member-id">{{ m.user_id }}</span>
              </div>
              <el-tag size="small" :type="roleTagType(m.role)">{{ m.role }}</el-tag>
              <el-button
                v-if="m.role !== 'owner'"
                link
                size="small"
                type="danger"
                :icon="Close"
                title="Remove member"
                @click="removeMember(m)"
              />
            </div>
          </div>
          <el-empty v-else description="No members yet" :image-size="60" />
        </el-tab-pane>
      </el-tabs>

      
      <!-- Knowledge Preview Dialog -->
      <KnowledgePreviewDialog ref="previewDlgRef" @closed="loadDescFile" />

      <!-- Add Member Dialog -->
      <el-dialog v-model="memberDialog.visible" title="Add Member" width="420px" destroy-on-close>
        <el-form label-width="90px">
          <el-form-item label="Username">
            <el-input v-model="memberDialog.username" placeholder="Username" maxlength="40" @keyup.enter="submitAddMember" />
          </el-form-item>
          <el-form-item label="Role">
            <el-select v-model="memberDialog.role" style="width: 100%">
              <el-option label="Owner" value="owner" />
              <el-option label="Admin" value="admin" />
              <el-option label="Member" value="member" />
              <el-option label="Viewer" value="viewer" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="memberDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="memberDialog.submitting" @click="submitAddMember">Add</el-button>
        </template>
      </el-dialog>
    </template>

    <div v-else-if="!loading" class="project-detail__not-found">
      <el-result icon="error" title="Project not found" sub-title="The project you're looking for doesn't exist.">
        <template #extra>
          <el-button type="primary" @click="goBack">Back to Projects</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="projectDetail">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Calendar, Clock, Document, Edit, Plus, Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { usePageStore } from "@/stores/modules/page";
import { useMarkdown } from "@/hooks/useMarkdown";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import IssueList from "@/views/issue/index.vue";
import PageList from "@/views/page/index.vue";
import ModuleList from "@/views/module/index.vue";
import BugList from "@/views/bug/index.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { yivadDocs } from "./seed/yivad-docs";
import { yiaiDocs } from "./seed/yiai-docs";
import { yipetDocs } from "./seed/yipet-docs";
import { yiknowledgeDocs } from "./seed/yiknowledge-docs";
import { rsh5Docs } from "./seed/rs-h5-docs";
import { rsuiDocs } from "./seed/rs-ui-docs";
import type { SeedPage } from "./seed/yivad-docs";
import { readProjectFile } from "@/api/modules/fileService";
import { getIssueList } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";
import { getModuleList } from "@/api/modules/moduleService";
import { getBugList } from "@/api/modules/bug";
import type { BugDocument } from "@/api/modules/bug";
import { formatRelativeTime, formatDate } from "@/utils/datetime";
import type { Issue, IssuePriority, IssueStatus } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";
import type { Release } from "@/api/modules/releaseService";
import type { ProjectMember } from "@/api/modules/projectService";
import type { Module } from "@/api/modules/moduleService";

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const pageStore = usePageStore();
const { renderWithHtml } = useMarkdown();

const SEED_DOCS: Record<string, SeedPage[]> = {
  yivad: yivadDocs,
  yiai: yiaiDocs,
  yipet: yipetDocs,
  yiknowledge: yiknowledgeDocs,
  "rs.h5": rsh5Docs,
  "rs.ui": rsuiDocs
};

const TAG_COLORS: Record<string, string> = {
  "getting-started": "#67c23a",
  architecture: "#409eff",
  deployment: "#e6a23c",
  conventions: "#9b59b6",
  dependencies: "#f56c6c",
  "core-code": "#20c997",
  "ai-guide": "#ff6b6b"
};

const TAG_LABELS: Record<string, string> = {
  "getting-started": "入门",
  architecture: "架构",
  deployment: "部署",
  conventions: "规范",
  dependencies: "依赖",
  "core-code": "核心",
  "ai-guide": "AI 指南"
};

const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const docItems = computed(() => {
  const key = project.value?.key || "";
  const items = (SEED_DOCS[key] || yivadDocs).map(d => ({
    title: d.title,
    path: `projects/${key}/docs/${d.tag}/${d.title}.md`,
    tag: d.tag
  }));
  items.unshift({
    title: "CLAUDE.md",
    path: "CLAUDE.md",
    tag: "ai-guide"
  });
  return items;
});

async function openDocPreview(doc: { title: string; path: string }) {
  if (doc.path === "CLAUDE.md") {
    if (!project.value) return;
    try {
      const content = await readProjectFile(project.value.key, "CLAUDE.md");
      previewDlgRef.value?.openRaw({
        title: "CLAUDE.md — AI Assistant Configuration",
        content
      });
    } catch { /* ignore */ }
    return;
  }
  previewDlgRef.value?.open(doc.path);
}

function handleActivityClick(a: { id: string; type: string; filePath?: string; link: string }) {
  if (a.type === "issue" && a.filePath) {
    previewDlgRef.value?.open(a.filePath);
  } else {
    router.push(a.link);
  }
}

function openCycleIssue(key: string) {
  const issue = issueTitleMap.value.get(key);
  if (!issue) return;
  const date = (issue.created_at || "").slice(0, 10);
  const slug = issue.title.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const filePath = `projects/${issue.project_key}/issues/${date}/${issue.issue_type}/${slug}.md`;
  previewDlgRef.value?.open(filePath);
}

// ── Date filter ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

const loading = ref(true);
const project = computed(() => store.currentProject);
const activeTab = ref("overview");
const TAB_NAMES: string[] = ["overview", "requirements", "issues", "modules", "docs", "bugs", "members"];

const overviewStats = reactive({
  totalIssues: 0,
  inProgressIssues: 0,
  overdueIssues: 0,
  activeCycles: 0,
  pendingReleases: 0,
  totalCycles: 0,
  totalReleases: 0,
  totalModules: 0,
  totalRequirements: 0,
  totalBugs: 0,
  totalDocs: 0
});

const overviewCycles = ref<Cycle[]>([]);
const overviewReleases = ref<Release[]>([]);
const overviewModules = ref<Array<{ id: string; name: string; kind: string; kindLabel: string; statusLabel: string; status: string; color: string; dates: string; link: string; done: number; total: number; pct: number; issueKeys: string[] }>>([]);
const overviewActivity = ref<Array<{ id: string; type: string; action: string; target: string; timeAgo: string; updatedAt: string; link: string; filePath?: string }>>([]);
const overviewIssues = ref<Issue[]>([]);
const allIssues = ref<Issue[]>([]);

async function loadOverviewStats() {
  if (!project.value) return;
  try {
    const [issueRes, cycleRes, releaseRes, moduleRes, bugRes] = await Promise.all([
      getIssueList({ project_key: project.value.key, pageSize: 500 }),
      getCycleList({ project_key: project.value.key, pageSize: 50 }),
      getReleaseList({ project_key: project.value.key, pageSize: 50 }),
      getModuleList({ project_key: project.value.key, pageSize: 500 }),
      getBugList({ project_key: project.value.key, pageSize: 500 })
    ]);

    const all = (issueRes.data?.list as Issue[]) ?? [];
    allIssues.value = all;
    const date = filterDateStr.value;
    const issues = date ? all.filter(i => (i.due_date || "").slice(0, 10) === date) : all;
    const cycles = (cycleRes.data?.list as Cycle[]) ?? [];
    const releases = (releaseRes.data?.list as Release[]) ?? [];
    const modules = (moduleRes.data?.list as Module[]) ?? [];
    const bugs = (bugRes.data?.list as BugDocument[]) ?? [];

    overviewIssues.value = issues;
    overviewStats.totalIssues = issues.filter(i => i.issue_type !== "requirement").length;
    overviewStats.inProgressIssues = issues.filter(i => i.status === "in_progress").length;
    const now = new Date().toISOString().slice(0, 10);
    overviewStats.overdueIssues = issues.filter(i => i.due_date && i.due_date < now && i.status !== "done").length;
    overviewStats.activeCycles = cycles.filter(c => c.status === "active").length;
    overviewStats.pendingReleases = releases.filter(r => r.status !== "released").length;
    overviewStats.totalCycles = cycles.length;
    overviewStats.totalReleases = releases.length;
    overviewStats.totalModules = date ? modules.filter(m => (m.due_date || "").slice(0, 10) === date).length : modules.length;
    overviewStats.totalRequirements = issues.filter(i => i.issue_type === "requirement").length;
    overviewStats.totalBugs = date ? bugs.filter(b => {
      const d = new Date(b.createdAt).toISOString().slice(0, 10);
      return d === date;
    }).length : bugs.length;

    overviewCycles.value = cycles.filter(c => c.status === "active" || c.status === "upcoming").slice(0, 5);
    overviewReleases.value = releases.filter(r => r.status !== "released").slice(0, 5);

    // ── Merge cycles + releases into unified module list ──
    interface OverviewModule {
      id: string;
      name: string;
      kind: "cycle" | "release" | "module";
      kindLabel: string;
      statusLabel: string;
      status: string;
      color: string;
      dates: string;
      link: string;
      done: number;
      total: number;
      pct: number;
      issueKeys: string[];
    }
    const merged: OverviewModule[] = [];
    for (const c of overviewCycles.value) {
      const entry = issueProgressMap.value.get(c.key);
      merged.push({
        id: c.key, name: c.name, kind: "cycle", kindLabel: "Sprint",
        statusLabel: c.status, status: c.status, color: "#409eff",
        dates: `${formatDate(c.start_date)} — ${formatDate(c.end_date)}`,
        link: `/cycle/${c.key}`, done: entry?.done || 0, total: entry?.total || 0,
        pct: entry?.total ? Math.round((entry.done / entry.total) * 100) : 0,
        issueKeys: c.issue_keys || []
      });
    }
    for (const r of overviewReleases.value) {
      const entry = issueProgressMap.value.get(r.key);
      merged.push({
        id: r.key, name: r.version, kind: "release", kindLabel: "Milestone",
        statusLabel: r.status, status: r.status, color: "#20c997",
        dates: r.target_date ? `Target: ${formatDate(r.target_date)}` : "",
        link: `/release/${r.key}`, done: entry?.done || 0, total: entry?.total || 0,
        pct: entry?.total ? Math.round((entry.done / entry.total) * 100) : 0,
        issueKeys: r.issue_keys || []
      });
    }
    for (const mod of modules.slice(0, 5)) {
      const entry = issueProgressMap.value.get(mod.key);
      merged.push({
        id: mod.key, name: mod.name, kind: "module", kindLabel: "Epic",
        statusLabel: mod.status, status: mod.status, color: "#9b59b6",
        dates: mod.start_date ? `${formatDate(mod.start_date)} — ${formatDate(mod.due_date || "")}` : "",
        link: `/module/${mod.key}`, done: entry?.done || 0, total: entry?.total || 0,
        pct: entry?.total ? Math.round((entry.done / entry.total) * 100) : 0,
        issueKeys: mod.issue_keys || []
      });
    }
    merged.sort((a, b) => b.total - a.total);
    overviewModules.value = merged;

    // Build activity feed
    const activity: typeof overviewActivity.value = [];
    issues.slice(0, 10).forEach(i => {
      const date = (i.created_at || "").slice(0, 10);
      const slug = i.title.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      activity.push({
        id: i.key,
        type: "issue",
        action: i.status === "done" ? "Completed" : i.status === "in_progress" ? "Started" : "Created",
        target: i.title,
        timeAgo: formatRelativeTime(i.updated_at),
        updatedAt: i.updated_at,
        link: `/issue/${i.key}`,
        filePath: `projects/${i.project_key}/issues/${date}/${i.issue_type}/${slug}.md`
      });
    });
    cycles.slice(0, 5).forEach(c => {
      activity.push({
        id: c.key,
        type: "cycle",
        action: c.status === "completed" ? "Completed" : c.status === "active" ? "Started" : "Created",
        target: c.name,
        timeAgo: formatRelativeTime(c.updated_at),
        updatedAt: c.updated_at,
        link: `/cycle/${c.key}`
      });
    });
    releases.slice(0, 5).forEach(r => {
      activity.push({
        id: r.key,
        type: "release",
        action: r.status === "released" ? "Released" : r.status === "in_progress" ? "Started" : "Planned",
        target: r.version,
        timeAgo: formatRelativeTime(r.updated_at),
        updatedAt: r.updated_at,
        link: `/release/${r.key}`
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
        action: b.status === "resolved" || b.status === "closed" ? "Resolved" : b.status === "in_progress" ? "Started" : "Reported",
        target: b.title,
        timeAgo: formatRelativeTime(b.updatedAt),
        updatedAt: new Date(b.updatedAt).toISOString(),
        link: `/bug/${b.key}`
      });
    });
    activity.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    overviewActivity.value = activity.slice(0, 10);
  } catch { /* ignore */ }
}

// ── Issue title map for cycle cards ──
const issueTitleMap = computed(() => {
  const m = new Map<string, Issue>();
  for (const i of allIssues.value) m.set(i.key, i);
  return m;
});

const issueProgressMap = computed(() => {
  const m = new Map<string, { done: number; total: number }>();
  for (const i of allIssues.value) {
    for (const key of [i.cycle_key, i.release_key]) {
      if (!key) continue;
      const entry = m.get(key) || { done: 0, total: 0 };
      entry.total++;
      if (i.status === "done") entry.done++;
      m.set(key, entry);
    }
  }
  return m;
});

function activityColor(type: string) {
  const m: Record<string, string> = { issue: "#409eff", cycle: "#e6a23c", release: "#67c23a", module: "#9b59b6", bug: "#f56c6c" };
  return m[type] || "#909399";
}

function priorityColor(p: IssuePriority | string) {
  const m: Record<string, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return m[p] || "#909399";
}

// ── Description (README.md from project source) ──
const descContent = ref("");
const descMeta = ref<{ type?: string; updated?: string }>({});

async function loadDescFile() {
  if (!project.value) return;
  try {
    const content = await readProjectFile(project.value.key, "README.md");
    descContent.value = content || "";
    descMeta.value = { type: "README.md", updated: "" };
  } catch {
    descContent.value = project.value?.description || "";
    descMeta.value = {};
  }
}

const descHtml = computed(() => renderWithHtml(descContent.value || ""));

function openDescDialog() {
  previewDlgRef.value?.openRaw({
    title: "README.md",
    content: descContent.value
  });
}

function goBack() {
  router.push("/project");
}

const memberDialog = reactive({
  visible: false,
  submitting: false,
  username: "",
  role: "member" as ProjectMember["role"]
});

function openAddMember() {
  memberDialog.username = "";
  memberDialog.role = "member";
  memberDialog.visible = true;
}

async function submitAddMember() {
  const username = memberDialog.username.trim();
  if (!username || !project.value) return;
  memberDialog.submitting = true;
  try {
    const member: ProjectMember = {
      user_id: `mem-${Date.now().toString(36)}`,
      username,
      role: memberDialog.role
    };
    await store.editProject(project.value.key, { members: [...(project.value.members || []), member] });
    ElMessage.success(`Added ${username}`);
    memberDialog.visible = false;
  } finally {
    memberDialog.submitting = false;
  }
}

async function removeMember(m: ProjectMember) {
  if (!project.value) return;
  await store.editProject(project.value.key, {
    members: (project.value.members || []).filter(x => x.user_id !== m.user_id)
  });
  ElMessage.success(`Removed ${m.username}`);
}

function roleTagType(role: ProjectMember["role"]): "warning" | "primary" | "info" | "success" {
  const m: Record<ProjectMember["role"], "warning" | "primary" | "info" | "success"> = {
    owner: "warning",
    admin: "primary",
    member: "info",
    viewer: "success"
  };
  return m[role];
}

function goTab(name: string) {
  if (TAB_NAMES.includes(name)) activeTab.value = name;
}

onMounted(async () => {
  const key = route.params.key as string;
  if (key) {
    pageStore.reset();
    await store.fetchProject(key);
  }
  loading.value = false;
  const tab = route.query.tab;
  if (typeof tab === "string" && TAB_NAMES.includes(tab)) {
    activeTab.value = tab;
  }
  await Promise.all([loadOverviewStats(), loadDescFile()]);
});

watch(filterDateStr, () => {
  if (activeTab.value === "overview") loadOverviewStats();
});
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
.project-detail__name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.project-detail__head-center {
  display: flex;
  align-items: center;
}
.ho__hero-date-nav {
  margin: 0;
}
.project-detail__date-banner {
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
  strong {
    color: var(--el-text-color-primary);
  }
  .el-button {
    margin-left: auto;
  }
}
.project-detail__tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}
.project-detail__overview-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  margin-bottom: 8px;
  align-items: start;
}
.project-detail__overview-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 16px;
}
.project-detail__sidebar-section {
  & + & {
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
.project-detail__sidebar-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  border-left: 2px solid var(--el-color-primary);
  margin-bottom: 10px;
}
.project-detail__sidebar-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
}
.project-detail__sidebar-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.project-detail__sidebar-stat {
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.project-detail__sidebar-stat-val {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}
.project-detail__sidebar-stat-lbl {
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
}
.project-detail__sidebar-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 0 2px;
}
.project-detail__sidebar-progress-val {
  font-weight: 600;
  color: var(--el-text-color-primary);
  &--danger { color: var(--el-color-danger); }
}
.project-detail__sidebar-docs {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.project-detail__sidebar-doc {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
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
.project-detail__sidebar-doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-detail__sidebar-doc-tag {
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  padding: 1px 5px;
  border-radius: 999px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.project-detail__overview-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.project-detail__card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px;
  &--flush {
    padding: 0;
    overflow: hidden;
  }
}
.project-detail__card-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
}
.project-detail__card-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.project-detail__module-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.project-detail__module-item {
  position: relative;
  cursor: pointer;
  padding: 12px 12px 12px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  overflow: hidden;
  &:hover { background: var(--el-fill-color-light); }
}
.project-detail__module-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
}
.project-detail__module-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.project-detail__module-key {
  font-size: 11px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 0 5px;
  border-radius: 3px;
}
.project-detail__module-kind {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  &--cycle { color: #409eff; }
  &--release { color: #20c997; }
  &--module { color: #9b59b6; }
}
.project-detail__module-status {
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
}
.project-detail__module-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  cursor: pointer;
  &:hover { text-decoration: underline; }
}
.project-detail__module-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.project-detail__module-foot-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  :deep(.el-progress) { width: 60px; flex-shrink: 0; }
}
.project-detail__module-issues {
  padding-top: 6px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 160px;
  overflow-y: auto;
}
.project-detail__module-issue-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.12s;
  margin-left: -4px;
  margin-right: -4px;
  &:hover { background: var(--el-fill-color); }
}
.project-detail__module-issue-priority {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.project-detail__module-issue-key {
  font-size: 10px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 0 4px;
  border-radius: 2px;
  flex-shrink: 0;
}
.project-detail__module-issue-title {
  font-size: 11px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.project-detail__module-issue-assignee {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-detail__activity {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.project-detail__activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:last-child { border-bottom: none; }
  &:hover { background: var(--el-fill-color-lighter); margin: 0 -8px; padding: 8px; border-radius: 6px; }
}
.project-detail__activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.project-detail__activity-content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  align-items: center;
}
.project-detail__activity-action {
  font-weight: 600;
}
.project-detail__activity-target {
  color: var(--el-color-primary);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-detail__activity-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-left: auto;
}
// ── Card header (matches issue detail) ──
.id-card__head {
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
.id-card__icon {
  font-size: 16px;
  color: var(--el-color-primary);
}
.id-card__meta-tag {
  font-weight: 400;
}
.id-card__meta-date {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-placeholder);
}
.id-card__head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}
.id-card__body {
  padding: 16px;
}
.id-desc-preview {
  padding: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}
.id-empty {
  text-align: center;
  padding: 24px 16px;
}
.id-empty__icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}
.id-empty__text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.id-empty__hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.project-detail__members {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.project-detail__member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.project-detail__members-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.project-detail__members-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.project-detail__member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.project-detail__member-name {
  font-weight: 500;
}
.project-detail__member-id {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-detail__not-found {
  padding: 80px 0;
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
</style>

<!-- Non-scoped markdown preview styles (v-html content, matching KnowledgePreviewDialog) -->
<style lang="scss">
.id-desc-preview {
  h1, h2, h3, h4 {
    margin: 1em 0 0.5em;
  }
  h1 { font-size: 1.5em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.15em; }
  p { margin: 0.5em 0; }
  pre {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
    code { padding: 0; background: none; }
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
  th, td {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }
  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
  }
  ul, ol {
    padding-left: 22px;
    margin: 0.5em 0;
  }
  li { margin-bottom: 2px; }
  a { color: var(--el-color-primary); }
  hr {
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
    margin: 16px 0;
  }
  img { max-width: 100%; }

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
</style>