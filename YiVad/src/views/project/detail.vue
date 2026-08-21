<template>
  <div class="project-detail" v-loading="loading">
    <template v-if="project">
      <div class="project-detail__head">
        <div class="project-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Projects</el-button>
          <div class="project-detail__cover" :style="coverStyle(project.cover_image)">
            <span v-if="!project.cover_image">{{ avatarChar(project.name) }}</span>
          </div>
          <div>
            <h1 class="project-detail__name">{{ project.name }}</h1>
            <div class="project-detail__meta">
              <code>{{ project.identifier }}</code>
              <el-tag :type="project.status === 'active' ? 'success' : 'info'" size="small">{{ project.status }}</el-tag>
            </div>
          </div>
        </div>
        <div class="project-detail__head-actions">
          <el-button :icon="Edit" @click="openEdit">Edit</el-button>
          <el-button :icon="CopyDocument" @click="cloneProject">Clone</el-button>
          <el-button :icon="Star" @click="saveAsTemplate">Save as Template</el-button>
          <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="project-detail__tabs">
        <el-tab-pane label="Overview" name="overview">
          <!-- Stats Cards -->
          <div class="project-detail__stats">
            <div class="project-detail__stat">
              <div class="project-detail__stat-value">{{ overviewStats.totalIssues }}</div>
              <div class="project-detail__stat-label">Total Issues</div>
            </div>
            <div class="project-detail__stat project-detail__stat--done">
              <div class="project-detail__stat-value">{{ overviewStats.doneIssues }}</div>
              <div class="project-detail__stat-label">Completed</div>
            </div>
            <div class="project-detail__stat project-detail__stat--progress">
              <div class="project-detail__stat-value">{{ overviewStats.inProgressIssues }}</div>
              <div class="project-detail__stat-label">In Progress</div>
            </div>
            <div class="project-detail__stat project-detail__stat--overdue">
              <div class="project-detail__stat-value">{{ overviewStats.overdueIssues }}</div>
              <div class="project-detail__stat-label">Overdue</div>
            </div>
            <div class="project-detail__stat project-detail__stat--cycle">
              <div class="project-detail__stat-value">{{ overviewStats.activeCycles }}</div>
              <div class="project-detail__stat-label">Active Cycles</div>
            </div>
            <div class="project-detail__stat project-detail__stat--release">
              <div class="project-detail__stat-value">{{ overviewStats.pendingReleases }}</div>
              <div class="project-detail__stat-label">Pending Releases</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="project-detail__progress">
            <div class="project-detail__progress-label">
              <span>Overall Completion</span>
              <span>{{ overviewCompletionPct }}%</span>
            </div>
            <el-progress :percentage="overviewCompletionPct" :stroke-width="10" :color="progressColor" />
          </div>

          <!-- Two-column layout -->
          <div class="project-detail__overview-grid">
            <!-- Left: Cycle Progress + Issue Distribution -->
            <div class="project-detail__overview-col">
              <div class="project-detail__card">
                <h3 class="project-detail__card-title">Active Cycles</h3>
                <div v-if="overviewCycles.length" class="project-detail__cycle-list">
                  <div v-for="c in overviewCycles" :key="c.key" class="project-detail__cycle-item" @click="router.push(`/cycle/${c.key}`)">
                    <div class="project-detail__cycle-info">
                      <span class="project-detail__cycle-name">{{ c.name }}</span>
                      <span class="project-detail__cycle-dates">{{ formatDate(c.start_date) }} — {{ formatDate(c.end_date) }}</span>
                    </div>
                    <div class="project-detail__cycle-progress">
                      <el-progress :percentage="cycleProgressPct(c)" :stroke-width="6" :show-text="true" :color="c.status === 'completed' ? '#67c23a' : '#409eff'" />
                    </div>
                  </div>
                </div>
                <span v-else class="project-detail__card-empty">No active cycles</span>
              </div>

              <div class="project-detail__card">
                <h3 class="project-detail__card-title">Issue Distribution</h3>
                <div ref="issueDistChartRef" style="width: 100%; height: 220px" />
              </div>
            </div>

            <!-- Right: Release Status + Recent Activity -->
            <div class="project-detail__overview-col">
              <div class="project-detail__card">
                <h3 class="project-detail__card-title">Upcoming Releases</h3>
                <div v-if="overviewReleases.length" class="project-detail__release-list">
                  <div v-for="r in overviewReleases" :key="r.key" class="project-detail__release-item" @click="router.push(`/release/${r.key}`)">
                    <div class="project-detail__release-info">
                      <span class="project-detail__release-version">{{ r.version }}</span>
                      <el-tag :type="r.status === 'released' ? 'success' : r.status === 'in_progress' ? 'primary' : 'info'" size="small">{{ r.status }}</el-tag>
                    </div>
                    <div class="project-detail__release-meta">
                      <span>{{ r.issue_keys?.length || 0 }} issues</span>
                      <span v-if="r.target_date">Target: {{ formatDate(r.target_date) }}</span>
                    </div>
                    <el-progress :percentage="releaseProgressPct(r)" :stroke-width="4" :show-text="false" />
                  </div>
                </div>
                <span v-else class="project-detail__card-empty">No releases planned</span>
              </div>

              <div class="project-detail__card">
                <h3 class="project-detail__card-title">Recent Activity</h3>
                <div v-if="overviewActivity.length" class="project-detail__activity">
                  <div v-for="a in overviewActivity" :key="a.id" class="project-detail__activity-item" @click="router.push(a.link)">
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

          <div class="project-detail__desc" style="margin-top: 24px">
            <h3 class="project-detail__card-title">Description</h3>
            <div v-if="project.description" class="markdown-body" v-html="renderedDesc" />
            <el-empty v-else description="No description" :image-size="60" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="Issues" name="issues">
          <IssueList :project-key="project.key" />
        </el-tab-pane>
        <el-tab-pane label="Cycles" name="cycles">
          <CycleList :project-key="project.key" />
        </el-tab-pane>
        <el-tab-pane label="Releases" name="releases">
          <ReleaseList :project-key="project.key" />
        </el-tab-pane>
        <el-tab-pane label="Pages" name="pages">
          <PageList :project-key="project.key" />
        </el-tab-pane>
        <el-tab-pane label="Members" name="members">
          <div class="project-detail__members">
            <div v-for="m in project.members" :key="m.user_id" class="project-detail__member">
              <el-avatar :size="32">{{ m.username.charAt(0) }}</el-avatar>
              <span class="project-detail__member-name">{{ m.username }}</span>
              <el-tag size="small" :type="m.role === 'owner' ? 'warning' : m.role === 'admin' ? 'primary' : 'info'">
                {{ m.role }}
              </el-tag>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- Edit Dialog -->
      <el-dialog v-model="editDialog.visible" title="Edit Project" width="560px" destroy-on-close>
        <el-form ref="editFormRef" :model="editDialog.form" :rules="rules" label-width="100px">
          <el-form-item label="Name" prop="name">
            <el-input v-model="editDialog.form.name" placeholder="Project name" maxlength="80" show-word-limit />
          </el-form-item>
          <el-form-item label="Identifier" prop="identifier">
            <el-input v-model="editDialog.form.identifier" placeholder="e.g. PLANE" maxlength="12" />
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="editDialog.form.description" type="textarea" :rows="4" placeholder="Project description (Markdown supported)" />
          </el-form-item>
          <el-form-item label="Status">
            <el-radio-group v-model="editDialog.form.status">
              <el-radio value="active">Active</el-radio>
              <el-radio value="archived">Archived</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="editDialog.submitting" @click="submitEdit">Save</el-button>
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
import { computed, onMounted, reactive, ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete, CopyDocument, Star } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import * as echarts from "echarts";
import { useProjectStore } from "@/stores/modules/project";
import { useMarkdown } from "@/hooks/useMarkdown";
import IssueList from "@/views/issue/index.vue";
import CycleList from "@/views/cycle/index.vue";
import ReleaseList from "@/views/release/index.vue";
import PageList from "@/views/page/index.vue";
import { getIssueList } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";
import { getModuleList } from "@/api/modules/moduleService";
import { createLabel } from "@/api/modules/labelService";
import { formatRelativeTime, formatDate } from "@/utils/datetime";
import type { Issue, IssueStatus } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";
import type { Release } from "@/api/modules/releaseService";

const route = useRoute();
const router = useRouter();
const store = useProjectStore();
const { render: renderMarkdown } = useMarkdown();

const loading = ref(true);
const project = computed(() => store.currentProject);
const activeTab = ref("overview");
const editFormRef = ref<FormInstance>();

const overviewStats = reactive({
  totalIssues: 0,
  doneIssues: 0,
  inProgressIssues: 0,
  overdueIssues: 0,
  activeCycles: 0,
  pendingReleases: 0
});

const overviewCycles = ref<Cycle[]>([]);
const overviewReleases = ref<Release[]>([]);
const overviewActivity = ref<Array<{ id: string; type: string; action: string; target: string; timeAgo: string; updatedAt: string; link: string }>>([]);
const overviewIssues = ref<Issue[]>([]);
const issueDistChartRef = ref<HTMLElement | null>(null);

const overviewCompletionPct = computed(() => {
  if (!overviewStats.totalIssues) return 0;
  return Math.round((overviewStats.doneIssues / overviewStats.totalIssues) * 100);
});

const progressColor = computed(() => {
  if (overviewCompletionPct.value >= 100) return "#67c23a";
  if (overviewCompletionPct.value >= 50) return "#409eff";
  return "#e6a23c";
});

async function loadOverviewStats() {
  if (!project.value) return;
  try {
    const [issueRes, cycleRes, releaseRes] = await Promise.all([
      getIssueList({ project_key: project.value.key, pageSize: 500 }),
      getCycleList({ project_key: project.value.key, pageSize: 50 }),
      getReleaseList({ project_key: project.value.key, pageSize: 50 })
    ]);

    const issues = (issueRes.data?.list as Issue[]) ?? [];
    const cycles = (cycleRes.data?.list as Cycle[]) ?? [];
    const releases = (releaseRes.data?.list as Release[]) ?? [];

    overviewIssues.value = issues;
    overviewStats.totalIssues = issues.length;
    overviewStats.doneIssues = issues.filter(i => i.status === "done").length;
    overviewStats.inProgressIssues = issues.filter(i => i.status === "in_progress").length;
    const now = new Date().toISOString().slice(0, 10);
    overviewStats.overdueIssues = issues.filter(i => i.due_date && i.due_date < now && i.status !== "done").length;
    overviewStats.activeCycles = cycles.filter(c => c.status === "active").length;
    overviewStats.pendingReleases = releases.filter(r => r.status !== "released").length;

    overviewCycles.value = cycles.filter(c => c.status === "active" || c.status === "upcoming").slice(0, 5);
    overviewReleases.value = releases.filter(r => r.status !== "released").slice(0, 5);

    // Build activity feed
    const activity: typeof overviewActivity.value = [];
    issues.slice(0, 10).forEach(i => {
      activity.push({
        id: i.key,
        type: "issue",
        action: i.status === "done" ? "Completed" : i.status === "in_progress" ? "Started" : "Created",
        target: i.title,
        timeAgo: formatRelativeTime(i.updated_at),
        updatedAt: i.updated_at,
        link: `/issue/${i.key}`
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
    activity.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    overviewActivity.value = activity.slice(0, 10);

    await nextTick();
    renderIssueDistChart();
  } catch { /* ignore */ }
}

const issueProgressMap = computed(() => {
  const m = new Map<string, { done: number; total: number }>();
  for (const i of overviewIssues.value) {
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

function cycleProgressPct(c: Cycle) {
  if (!c.issue_keys?.length) return 0;
  if (c.status === "completed") return 100;
  const entry = issueProgressMap.value.get(c.key);
  if (!entry || !entry.total) return 0;
  return Math.round((entry.done / entry.total) * 100);
}

function releaseProgressPct(r: Release) {
  if (!r.issue_keys?.length) return 0;
  if (r.status === "released") return 100;
  const entry = issueProgressMap.value.get(r.key);
  if (!entry || !entry.total) return 0;
  return Math.round((entry.done / entry.total) * 100);
}

function activityColor(type: string) {
  const m: Record<string, string> = { issue: "#409eff", cycle: "#e6a23c", release: "#67c23a" };
  return m[type] || "#909399";
}

function renderIssueDistChart() {
  if (!issueDistChartRef.value || !overviewIssues.value.length) return;
  const chart = echarts.init(issueDistChartRef.value);
  const statusCounts: Record<IssueStatus, number> = { done: 0, in_progress: 0, in_review: 0, todo: 0, backlog: 0, cancelled: 0 };
  overviewIssues.value.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });
  chart.setOption({
    tooltip: { trigger: "item" },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: "pie",
      radius: ["45%", "75%"],
      center: ["50%", "45%"],
      data: [
        { name: "Done", value: statusCounts.done, itemStyle: { color: "#67c23a" } },
        { name: "In Progress", value: statusCounts.in_progress, itemStyle: { color: "#409eff" } },
        { name: "In Review", value: statusCounts.in_review, itemStyle: { color: "#e6a23c" } },
        { name: "Todo", value: statusCounts.todo, itemStyle: { color: "#909399" } },
        { name: "Backlog", value: statusCounts.backlog, itemStyle: { color: "#c0c4cc" } },
        { name: "Cancelled", value: statusCounts.cancelled, itemStyle: { color: "#f56c6c" } }
      ].filter(d => d.value > 0),
      label: { show: false },
      emphasis: { label: { show: true } }
    }]
  });
}

const rules: FormRules = {
  name: [{ required: true, message: "Project name is required", trigger: "blur" }],
  identifier: [{ required: true, message: "Identifier is required", trigger: "blur" }]
};

const renderedDesc = computed(() => {
  if (!project.value?.description) return "";
  return renderMarkdown(project.value.description);
});

const editDialog = reactive({
  visible: false,
  submitting: false,
  form: { name: "", identifier: "", description: "", status: "active" as "active" | "archived" }
});

function openEdit() {
  if (!project.value) return;
  editDialog.form = {
    name: project.value.name,
    identifier: project.value.identifier,
    description: project.value.description || "",
    status: project.value.status
  };
  editDialog.visible = true;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !project.value) return;
  editDialog.submitting = true;
  try {
    await store.editProject(project.value.key, {
      name: editDialog.form.name,
      identifier: editDialog.form.identifier,
      description: editDialog.form.description,
      status: editDialog.form.status
    });
    ElMessage.success("Project updated");
    editDialog.visible = false;
  } finally {
    editDialog.submitting = false;
  }
}

async function handleDelete() {
  if (!project.value) return;
  try {
    await ElMessageBox.confirm(
      `Delete project "${project.value.name}"? This action cannot be undone.`,
      "Delete Project",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error" }
    );
    await store.removeProject(project.value.key);
    ElMessage.success("Project deleted");
    router.push("/project");
  } catch {
    // user cancelled
  }
}

async function cloneProject() {
  if (!project.value) return;
  try {
    await ElMessageBox.confirm(
      `Clone project "${project.value.name}"? This creates a new project with the same settings.`,
      "Clone Project",
      { confirmButtonText: "Clone", cancelButtonText: "Cancel" }
    );
    const newKey = `proj-${Date.now().toString(36)}`;
    await store.addProject({
      key: newKey,
      name: `[Clone] ${project.value.name}`,
      identifier: project.value.identifier + "-clone",
      description: project.value.description,
      status: "active",
      members: [...(project.value.members || [])],
      cover_image: project.value.cover_image
    });
    ElMessage.success("Project cloned");
    router.push(`/project/${newKey}`);
  } catch { /* cancelled */ }
}

async function saveAsTemplate() {
  if (!project.value) return;
  try {
    await createLabel({
      key: `PTMPL-${Date.now().toString(36).toUpperCase()}`,
      name: project.value.name,
      description: project.value.description,
      color: "#67c23a",
      _type: "project_template",
      identifier: project.value.identifier,
      status: project.value.status
    } as any);
    ElMessage.success("Project saved as template");
  } catch { /* ignore */ }
}

function goBack() {
  router.push("/project");
}

function avatarChar(name: string) {
  return name.charAt(0).toUpperCase();
}

function coverStyle(cover?: string) {
  return cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover" } : {};
}

onMounted(async () => {
  const key = route.params.key as string;
  if (key) {
    await store.fetchProject(key);
  }
  loading.value = false;
  await loadOverviewStats();
});
</script>

<style scoped lang="scss">
.project-detail {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.project-detail__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.project-detail__head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.project-detail__cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--el-color-primary-light-5), var(--el-color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.project-detail__name {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 600;
}
.project-detail__meta {
  display: flex;
  gap: 10px;
  align-items: center;
  code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    padding: 1px 8px;
    border-radius: 4px;
  }
}
.project-detail__head-actions {
  display: flex;
  gap: 8px;
}
.project-detail__tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}
.project-detail__stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.project-detail__stat {
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  &--done { background: var(--el-color-success-light-9); }
  &--progress { background: var(--el-color-primary-light-9); }
  &--overdue { background: var(--el-color-danger-light-9); }
  &--cycle { background: var(--el-color-warning-light-9); }
  &--release { background: var(--el-color-info-light-9); }
}
.project-detail__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-color-primary);
  .project-detail__stat--done & { color: var(--el-color-success); }
  .project-detail__stat--progress & { color: var(--el-color-primary); }
  .project-detail__stat--overdue & { color: var(--el-color-danger); }
  .project-detail__stat--cycle & { color: var(--el-color-warning); }
  .project-detail__stat--release & { color: var(--el-color-info); }
}
.project-detail__stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
.project-detail__progress {
  margin-bottom: 24px;
}
.project-detail__progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.project-detail__overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 8px;
}
.project-detail__overview-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.project-detail__card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px;
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
.project-detail__cycle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.project-detail__cycle-item {
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  &:hover { background: var(--el-fill-color-light); }
}
.project-detail__cycle-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.project-detail__cycle-name {
  font-size: 14px;
  font-weight: 500;
}
.project-detail__cycle-dates {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.project-detail__cycle-progress {
  width: 100%;
}
.project-detail__release-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.project-detail__release-item {
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  &:hover { background: var(--el-fill-color-light); }
}
.project-detail__release-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.project-detail__release-version {
  font-size: 14px;
  font-weight: 600;
  font-family: monospace;
}
.project-detail__release-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 6px;
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
.project-detail__desc {
  min-height: 200px;
  :deep(.markdown-body) {
    max-width: 800px;
  }
}
.project-detail__placeholder {
  padding: 60px 0;
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
.project-detail__member-name {
  flex: 1;
  font-weight: 500;
}
.project-detail__not-found {
  padding: 80px 0;
}
</style>