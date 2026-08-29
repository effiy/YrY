<template>
  <div class="cd-page" @keydown="handleKeydown">
    <!-- Skeleton -->
    <template v-if="loading">
      <div class="cd-skel">
        <div class="cd-skel-header">
          <div class="cd-skel-line cd-skel-line--short" />
          <div class="cd-skel-line cd-skel-line--long" />
          <div class="cd-skel-row">
            <div class="cd-skel-tag" /><div class="cd-skel-tag" /><div class="cd-skel-tag" />
          </div>
        </div>
        <div class="cd-skel-body">
          <div class="cd-skel-main">
            <div class="cd-skel-card" v-for="i in 3" :key="i">
              <div class="cd-skel-line cd-skel-line--med" />
              <div class="cd-skel-line cd-skel-line--long" />
              <div class="cd-skel-line cd-skel-line--long" />
            </div>
          </div>
          <div class="cd-skel-sidebar">
            <div class="cd-skel-card" v-for="i in 2" :key="i">
              <div class="cd-skel-line cd-skel-line--med" />
              <div class="cd-skel-line cd-skel-line--short" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="cycle">
      <!-- Header -->
      <div class="cd-header">
        <div class="cd-header__top">
          <div class="cd-header__left">
            <el-button text :icon="ArrowLeft" @click="goBack">Cycles</el-button>
            <EntityBreadcrumb :project-key="cycle.project_key" :current-label="cycle.name" :current-icon="Calendar" />
          </div>
          <div class="cd-header__actions">
            <el-button :icon="Link" :disabled="!cycle.project_key" @click="router.push(`/project/${cycle.project_key}`)">Project</el-button>
            <el-button :icon="Edit" @click="openEdit">Edit</el-button>
            <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
          </div>
        </div>
        <h1 class="cd-header__title">{{ cycle.name }}</h1>
        <div class="cd-header__meta">
          <code class="cd-header__key" @click="copyKey" title="Copy key">{{ cycle.key }}</code>
          <el-tag :type="statusTagType(cycle.status)" size="small">{{ statusLabel(cycle.status) }}</el-tag>
          <span class="cd-header__dates">
            <el-icon><Calendar /></el-icon>{{ formatDate(cycle.start_date) }} — {{ formatDate(cycle.end_date) }}
          </span>
          <span class="cd-header__hint" :class="timeHintClass(cycle)">{{ timeHint(cycle) }}</span>
        </div>
      </div>

      <!-- Body -->
      <div class="cd-body">
        <div class="cd-main">
          <!-- Stats -->
          <div class="cd-stats">
            <div class="cd-stat">
              <span class="cd-stat__value">{{ cycle.issue_keys?.length || 0 }}</span>
              <span class="cd-stat__label">Total</span>
            </div>
            <div class="cd-stat">
              <span class="cd-stat__value cd-stat__value--done">{{ doneCount }}</span>
              <span class="cd-stat__label">Done</span>
            </div>
            <div class="cd-stat">
              <span class="cd-stat__value cd-stat__value--active">{{ inProgressCount }}</span>
              <span class="cd-stat__label">Active</span>
            </div>
            <div class="cd-stat">
              <span class="cd-stat__value cd-stat__value--pct">{{ progressPct(cycle) }}%</span>
              <span class="cd-stat__label">Complete</span>
            </div>
            <div class="cd-stat">
              <span class="cd-stat__value" :class="daysHintClass(cycle)">{{ daysRemaining(cycle) }}</span>
              <span class="cd-stat__label">Days Left</span>
            </div>
          </div>

          <!-- Goal -->
          <div v-if="cycle.goal" class="cd-card">
            <div class="cd-card__head">
              <el-icon class="cd-card__icon"><Flag /></el-icon>
              <span>Goal</span>
            </div>
            <div class="cd-card__body">
              <p class="cd-goal">{{ cycle.goal }}</p>
            </div>
          </div>

          <!-- Burndown -->
          <div class="cd-card">
            <div class="cd-card__head">
              <el-icon class="cd-card__icon"><TrendCharts /></el-icon>
              <span>Burndown</span>
            </div>
            <div class="cd-card__body">
              <div ref="chartRef" style="width: 100%; height: 260px" />
            </div>
          </div>

          <!-- Issues -->
          <div class="cd-card">
            <div class="cd-card__head">
              <el-icon class="cd-card__icon"><Tickets /></el-icon>
              <span>Issues ({{ cycle.issue_keys?.length || 0 }})</span>
              <div class="cd-card__head-right">
                <span class="cd-card__totals-done">{{ doneCount }} done</span>
                <span class="cd-card__totals-active">{{ inProgressCount }} active</span>
                <span class="cd-card__totals-todo">{{ (cycle.issue_keys?.length || 0) - doneCount - inProgressCount }} todo</span>
              </div>
            </div>
            <div class="cd-card__body">
              <div v-if="issues.length" class="cd-issues">
                <div v-for="issue in issues" :key="issue.key" class="cd-issue" @click="openIssuePreview(issue)">
                  <div class="cd-issue__accent" :style="{ background: issueStatusColor(issue.status) }" />
                  <div class="cd-issue__head">
                    <code class="cd-issue__key">{{ issue.key }}</code>
                    <el-tag :type="issueTypeTag(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                    <span class="cd-issue__status" :style="{ color: issueStatusColor(issue.status) }">{{ issueStatusLabel(issue.status) }}</span>
                  </div>
                  <div class="cd-issue__title">{{ issue.title }}</div>
                  <div class="cd-issue__foot">
                    <span v-if="issue.assignee" class="cd-issue__foot-item">
                      <el-icon><User /></el-icon>{{ issue.assignee }}
                    </span>
                    <span v-if="issue.due_date" class="cd-issue__foot-item" :class="{ 'cd-issue__foot-item--overdue': isIssueOverdue(issue) }">
                      <el-icon><Clock /></el-icon>{{ formatDate(issue.due_date) }}
                    </span>
                    <span v-if="issue.labels?.length" class="cd-issue__labels">
                      <span v-for="l in issue.labels" :key="l" class="cd-issue__label">{{ l }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div v-else-if="cycle.issue_keys?.length" class="cd-empty">
                <el-icon class="cd-empty__icon"><Tickets /></el-icon>
                <p class="cd-empty__text">Issues not loaded</p>
              </div>
              <div v-else class="cd-empty">
                <el-icon class="cd-empty__icon"><Folder /></el-icon>
                <p class="cd-empty__text">No issues in this cycle</p>
              </div>

              <div v-if="cycle.issue_keys?.length" class="cd-transfer">
                <el-select v-model="transferTarget" placeholder="Transfer to..." size="small" style="width: 200px" clearable>
                  <el-option v-for="c in allCycles" :key="c.key" :label="c.name" :value="c.key" :disabled="c.key === cycle.key" />
                </el-select>
                <el-button size="small" :disabled="!transferTarget" @click="transferIssues">Transfer All</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="cd-sidebar">
          <div class="cd-sb-group">
            <div class="cd-sb-group__title">
              <el-icon><InfoFilled /></el-icon>
              <span>Properties</span>
            </div>
            <div class="cd-sb-group__body">
              <div class="cd-sb-row">
                <span class="cd-sb-row__label">Project</span>
                <span class="cd-sb-row__value">
                  <el-button link size="small" type="primary" @click="router.push(`/project/${cycle.project_key}`)">{{ projectName }}</el-button>
                </span>
              </div>
              <div class="cd-sb-row">
                <span class="cd-sb-row__label">Duration</span>
                <span class="cd-sb-row__value">{{ daysTotal(cycle) }} days</span>
              </div>
              <div class="cd-sb-row">
                <span class="cd-sb-row__label">Progress</span>
                <span class="cd-sb-row__value">
                  <el-progress :percentage="progressPct(cycle)" :stroke-width="6" :show-text="true" style="width:120px" />
                </span>
              </div>
              <div class="cd-sb-row">
                <span class="cd-sb-row__label">Health</span>
                <span class="cd-sb-row__value">
                  <el-tag :type="healthType(cycle)" size="small">{{ healthLabel(cycle) }}</el-tag>
                </span>
              </div>
              <div class="cd-sb-row">
                <span class="cd-sb-row__label">Created</span>
                <span class="cd-sb-row__value cd-sb-row__value--muted">{{ formatRelativeTime(cycle.created_at) }}</span>
              </div>
              <div class="cd-sb-row">
                <span class="cd-sb-row__label">Updated</span>
                <span class="cd-sb-row__value cd-sb-row__value--muted">{{ formatRelativeTime(cycle.updated_at) }}</span>
              </div>
            </div>
          </div>

          <div v-if="linkedReleases.length" class="cd-sb-group">
            <div class="cd-sb-group__title">
              <el-icon><Box /></el-icon>
              <span>Linked Releases</span>
            </div>
            <div class="cd-sb-group__body">
              <div v-for="r in linkedReleases" :key="r.key" class="cd-sb-release">
                <div class="cd-sb-release__row">
                  <el-button link size="small" type="success" @click="router.push(`/release/${r.key}`)">{{ r.version }}</el-button>
                  <el-tag size="small" :type="r.status === 'released' ? 'success' : 'info'">{{ r.status }}</el-tag>
                </div>
                <el-progress :percentage="releaseProgressPct(r)" :stroke-width="4" :show-text="false" :color="r.status === 'released' ? '#67c23a' : '#409eff'" style="margin-top:4px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Dialog -->
      <el-dialog v-model="editDialog.visible" title="Edit Cycle" width="560px" destroy-on-close>
        <el-form ref="editFormRef" :model="editDialog.form" :rules="rules" label-width="100px">
          <el-form-item label="Name" prop="name">
            <el-input v-model="editDialog.form.name" placeholder="Cycle name" maxlength="100" />
          </el-form-item>
          <el-form-item label="Goal">
            <el-input v-model="editDialog.form.goal" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Start Date" prop="start_date">
                <el-date-picker v-model="editDialog.form.start_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="End Date" prop="end_date">
                <el-date-picker v-model="editDialog.form.end_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Status">
            <el-radio-group v-model="editDialog.form.status">
              <el-radio v-for="(label, val) in CYCLE_STATUS_MAP" :key="val" :value="val">{{ label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="editDialog.submitting" @click="submitEdit">Save</el-button>
        </template>
      </el-dialog>

      <KnowledgePreviewDialog ref="descDialogRef" />
    </template>

    <div v-else-if="!loading" class="cd-not-found">
      <el-result icon="error" title="Cycle not found" sub-title="This cycle doesn't exist or was deleted.">
        <template #extra>
          <el-button type="primary" @click="goBack">Back to Cycles</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="cycleDetail">
import { computed, onMounted, reactive, ref, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete, Calendar, Link, Tickets, Flag, TrendCharts, Box, InfoFilled, User, Clock, Folder } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import * as echarts from "echarts";
import { EntityBreadcrumb } from "@/components";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useCycleStore } from "@/stores/modules/cycle";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import { getCycleList, updateCycle } from "@/api/modules/cycleService";
import { getIssueList, issueStatusLabel, issueStatusTag, typeLabel, issueTypeTag } from "@/api/modules/issueService";
import { getReleaseList } from "@/api/modules/releaseService";
import { getProjectList } from "@/api/modules/projectService";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import type { Cycle, CycleStatus } from "@/api/modules/cycleService";
import type { Issue } from "@/api/modules/issueService";
import type { Release } from "@/api/modules/releaseService";
import type { Project } from "@/api/modules/projectService";

const route = useRoute();
const router = useRouter();
const store = useCycleStore();

const loading = ref(true);
const cycle = computed(() => store.currentCycle);
const chartRef = ref<HTMLElement | null>(null);
const editFormRef = ref<FormInstance>();
const transferTarget = ref("");
const allCycles = ref<Cycle[]>([]);
const issues = ref<Issue[]>([]);
const linkedReleases = ref<Release[]>([]);
const projectName = ref("");

const doneCount = computed(() => issues.value.filter(i => i.status === "done").length);
const inProgressCount = computed(() => issues.value.filter(i => i.status === "in_progress").length);

const rules: FormRules = {
  name: [{ required: true, message: "Cycle name is required", trigger: "blur" }]
};

const editDialog = reactive({
  visible: false,
  submitting: false,
  form: { name: "", goal: "", start_date: "", end_date: "", status: "upcoming" as CycleStatus }
});

function handleKeydown(e: KeyboardEvent) {
  if (editDialog.visible) { if (e.key === "Escape") { editDialog.visible = false; return; } return; }
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.key === "e" || e.key === "E") { e.preventDefault(); openEdit(); }
}

function openEdit() {
  if (!cycle.value) return;
  editDialog.form = { name: cycle.value.name, goal: cycle.value.goal || "", start_date: cycle.value.start_date, end_date: cycle.value.end_date, status: cycle.value.status };
  editDialog.visible = true;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !cycle.value) return;
  editDialog.submitting = true;
  try {
    await store.editCycle(cycle.value.key, { name: editDialog.form.name, goal: editDialog.form.goal, start_date: editDialog.form.start_date, end_date: editDialog.form.end_date, status: editDialog.form.status });
    ElMessage.success("Cycle updated");
    editDialog.visible = false;
  } finally { editDialog.submitting = false; }
}

async function handleDelete() {
  if (!cycle.value) return;
  try {
    await ElMessageBox.confirm(`Delete cycle "${cycle.value.name}"?`, "Delete Cycle", { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error" });
    await store.removeCycle(cycle.value.key, cycle.value.project_key);
    ElMessage.success("Cycle deleted");
    router.push("/cycle");
  } catch { /* cancelled */ }
}

function goBack() { router.push(cycle.value?.project_key ? `/project/${cycle.value.project_key}` : "/cycle"); }

function renderChart() {
  if (!chartRef.value || !cycle.value) return;
  const chart = echarts.init(chartRef.value);
  const start = new Date(cycle.value.start_date);
  const end = new Date(cycle.value.end_date);
  const total = cycle.value.issue_keys?.length || 0;
  if (!total) return;
  const dates: string[] = [];
  const ideal: number[] = [];
  const actual: number[] = [];
  const current = new Date(start);
  const doneIssues = issues.value.filter(i => i.status === "done");
  const completionDates: Record<string, number> = {};
  doneIssues.forEach(i => { const d = i.updated_at?.slice(0, 10) || ""; completionDates[d] = (completionDates[d] || 0) + 1; });
  let remaining = total;
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    dates.push(current.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }));
    const pct = Math.max(0, (end.getTime() - current.getTime()) / (end.getTime() - start.getTime()));
    ideal.push(Math.round(total * pct));
    remaining = Math.max(0, remaining - (completionDates[dateStr] || 0));
    actual.push(remaining);
    current.setDate(current.getDate() + 1);
  }
  chart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["Ideal", "Actual"], bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: "category", data: dates, axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: { type: "value", name: "Remaining", minInterval: 1 },
    series: [
      { name: "Ideal", type: "line", data: ideal, smooth: true, lineStyle: { type: "dashed", color: "#909399" }, itemStyle: { color: "#909399" } },
      { name: "Actual", type: "line", data: actual, smooth: true, areaStyle: { opacity: 0.15 }, lineStyle: { color: "#409eff" }, itemStyle: { color: "#409eff" } }
    ]
  });
  watch(() => cycle.value, () => { chart.dispose(); }, { once: true });
}

function statusLabel(s: CycleStatus) { return CYCLE_STATUS_MAP[s] || s; }
function statusTagType(s: CycleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<CycleStatus, "success" | "warning" | "info" | "primary" | "danger"> = { upcoming: "info", active: "primary", completed: "success" };
  return m[s] || "info";
}
function progressPct(c: Cycle) {
  if (!c.issue_keys?.length) return 0;
  if (c.status === "completed") return 100;
  if (!issues.value.length) return 0;
  return Math.round((doneCount.value / issues.value.length) * 100);
}
function releaseProgressPct(r: Release) {
  if (!r.issue_keys?.length) return 0;
  if (r.status === "released") return 100;
  const cycleKeys = new Set(cycle.value?.issue_keys ?? []);
  const overlap = r.issue_keys.filter(k => cycleKeys.has(k));
  if (!overlap.length) return 0;
  const done = overlap.filter(k => issues.value.find(i => i.key === k)?.status === "done");
  return Math.round((done.length / overlap.length) * 100);
}
function healthLabel(c: Cycle): string {
  if (c.status === "completed") return "Done";
  if (c.status === "upcoming") return "Planned";
  const days = daysRemaining(c);
  if (days <= 0) return "Off-Track";
  if (days <= 3) return "At-Risk";
  return "On-Track";
}
function healthType(c: Cycle): "success" | "warning" | "info" | "primary" | "danger" {
  const h = healthLabel(c);
  if (h === "On-Track") return "success";
  if (h === "At-Risk") return "warning";
  if (h === "Off-Track") return "danger";
  return "info";
}
function daysRemaining(c: Cycle) {
  if (c.status === "completed") return 0;
  const ms = new Date(c.end_date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}
function daysTotal(c: Cycle) {
  const ms = new Date(c.end_date).getTime() - new Date(c.start_date).getTime();
  return Math.ceil(ms / 86400000);
}
function daysHintClass(c: Cycle): string {
  if (c.status === "completed") return "cd-stat__value--done";
  const d = daysRemaining(c);
  if (d <= 0) return "cd-stat__value--danger";
  if (d <= 3) return "cd-stat__value--warn";
  return "";
}

function timeHint(c: Cycle): string {
  if (c.status === "completed") return "Completed";
  if (c.status === "upcoming") return `Starts ${formatDate(c.start_date)}`;
  const d = daysRemaining(c);
  return d > 0 ? `${d}d left` : "Ended";
}
function timeHintClass(c: Cycle): string {
  if (c.status === "completed") return "cd-header__hint--done";
  if (c.status === "upcoming") return "cd-header__hint--upcoming";
  const d = daysRemaining(c);
  if (d <= 0) return "cd-header__hint--ended";
  if (d <= 3) return "cd-header__hint--soon";
  return "cd-header__hint--ok";
}

function issueStatusColor(status: string): string {
  const m: Record<string, string> = { done: "#67c23a", in_progress: "#409eff", in_review: "#e6a23c", todo: "#909399", backlog: "#c0c4cc" };
  return m[status] || "#909399";
}

function isIssueOverdue(issue: Issue): boolean {
  if (!issue.due_date || issue.status === "done" || issue.status === "cancelled") return false;
  return issue.due_date < new Date().toISOString().slice(0, 10);
}

async function copyKey() {
  if (!cycle.value) return;
  try { await navigator.clipboard.writeText(cycle.value.key); ElMessage.success(`Copied ${cycle.value.key}`); }
  catch { ElMessage.warning("Clipboard unavailable"); }
}

// ── Issue preview ──
const descDialogRef = ref<{ openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void } | null>(null);
async function openIssuePreview(issue: Issue) {
  const date = (issue.created_at || "").slice(0, 10);
  const type = issue.issue_type || "task";
  const slug = issue.title.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const filePath = `issues/${date}/${type}/${slug}.md`;
  let content = issue.description || "";
  try { const res = await readKnowledgeFile(filePath); content = res.content || content; } catch { /* fallback */ }
  descDialogRef.value?.openFile({
    path: filePath, title: issue.title, content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, { title: issue.title, type: "issue-description", status: issue.status, created: date });
    }
  });
}

async function loadAllCycles() {
  try { const res = await getCycleList({ pageSize: 100 }); allCycles.value = (res.data?.list as Cycle[]) ?? []; } catch { /* ignore */ }
}

async function loadProjectName() {
  if (!cycle.value?.project_key) return;
  try {
    const res = await getProjectList({ pageSize: 500 });
    const projects = (res.data?.list as Project[]) ?? [];
    projectName.value = projects.find(p => p.key === cycle.value!.project_key)?.name || cycle.value!.project_key;
  } catch { /* ignore */ }
}

async function loadLinkedReleases() {
  if (!cycle.value?.project_key) return;
  try {
    const res = await getReleaseList({ project_key: cycle.value.project_key, pageSize: 100 });
    const all = (res.data?.list as Release[]) ?? [];
    linkedReleases.value = all.filter(r => r.issue_keys?.some(k => cycle.value!.issue_keys?.includes(k)));
  } catch { /* ignore */ }
}

async function loadIssues() {
  if (!cycle.value?.issue_keys?.length) return;
  try {
    const res = await getIssueList({ project_key: cycle.value.project_key, pageSize: 500 });
    const all = (res.data?.list as Issue[]) ?? [];
    issues.value = all.filter(i => cycle.value!.issue_keys!.includes(i.key));
  } catch { /* ignore */ }
}

async function transferIssues() {
  if (!cycle.value || !transferTarget.value) return;
  const sourceKey = cycle.value.key;
  const targetKey = transferTarget.value;
  const sourceCycle = allCycles.value.find(c => c.key === sourceKey);
  const targetCycle = allCycles.value.find(c => c.key === targetKey);
  if (!sourceCycle || !targetCycle) return;
  const sourceIssues = sourceCycle.issue_keys || [];
  const targetIssues = [...new Set([...(targetCycle.issue_keys || []), ...sourceIssues])];
  await Promise.all([updateCycle(sourceKey, { issue_keys: [] }), updateCycle(targetKey, { issue_keys: targetIssues })]);
  ElMessage.success(`${sourceIssues.length} issues transferred to "${targetCycle.name}"`);
  transferTarget.value = "";
  await store.fetchCycle(sourceKey);
  await loadAllCycles();
}

onMounted(async () => {
  const key = route.params.key as string;
  if (key) { await store.fetchCycle(key); await loadIssues(); }
  loading.value = false;
  await nextTick();
  renderChart();
  await Promise.all([loadAllCycles(), loadLinkedReleases(), loadProjectName()]);
});
</script>

<style scoped lang="scss">
.cd-page {
  padding: 24px;
  min-height: calc(100vh - 95px);
  background: var(--el-bg-color-page);
  outline: none;
}

// ── Skeleton ──
.cd-skel { animation: cd-fade-in 0.3s ease; }
.cd-skel-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.cd-skel-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: cd-shimmer 1.5s infinite;
  margin-bottom: 10px;
  &--short { width: 30%; }
  &--med { width: 55%; }
  &--long { width: 80%; }
}
.cd-skel-tag {
  display: inline-block;
  width: 60px;
  height: 22px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: cd-shimmer 1.5s infinite;
  margin-right: 8px;
}
.cd-skel-row { display: flex; gap: 8px; }
.cd-skel-body { display: flex; gap: 20px; }
.cd-skel-main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.cd-skel-sidebar { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
.cd-skel-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; padding: 16px; }
@keyframes cd-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes cd-fade-in { from { opacity: 0; } to { opacity: 1; } }

// ── Header ──
.cd-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  border-left: 4px solid var(--el-color-primary);
}
.cd-header__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.cd-header__left { display: flex; align-items: center; gap: 12px; }
.cd-header__actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
.cd-header__title { margin: 0 0 10px; font-size: 22px; font-weight: 700; line-height: 1.3; }
.cd-header__meta { display: flex; gap: 12px; align-items: center; }
.cd-header__key {
  cursor: pointer;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
  background: var(--el-fill-color-light);
  transition: color 0.15s, background 0.15s;
  &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}
.cd-header__dates { font-size: 13px; color: var(--el-text-color-secondary); display: flex; align-items: center; gap: 4px; }
.cd-header__hint {
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  padding: 1px 8px;
  &--ok { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &--soon { color: #fff; background: var(--el-color-warning); }
  &--ended { color: #fff; background: var(--el-color-danger); }
  &--done { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &--upcoming { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}

// ── Body ──
.cd-body { display: flex; gap: 20px; align-items: flex-start; }
.cd-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }

// ── Stats ──
.cd-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.cd-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 10px 12px;
  position: relative;
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background: var(--el-border-color-lighter);
  }
  &:first-child { cursor: pointer; &:hover .cd-stat__value { color: var(--el-color-primary); } }
}
.cd-stat__value {
  font-size: 16px;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
  &--done { color: var(--el-color-success); }
  &--active { color: var(--el-color-primary); }
  &--pct { color: var(--el-color-warning); }
  &--danger { color: var(--el-color-danger); }
  &--warn { color: var(--el-color-warning); }
}
.cd-stat__label { font-size: 10px; color: var(--el-text-color-secondary); white-space: nowrap; }

// ── Cards ──
.cd-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.cd-card__head {
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
.cd-card__icon { font-size: 16px; color: var(--el-color-primary); }
.cd-card__head-right { margin-left: auto; display: flex; gap: 12px; font-size: 12px; font-weight: 400; }
.cd-card__totals-done { color: var(--el-color-success); }
.cd-card__totals-active { color: var(--el-color-primary); }
.cd-card__totals-todo { color: var(--el-text-color-secondary); }
.cd-card__body { padding: 16px; }
.cd-goal { margin: 0; font-size: 14px; color: var(--el-text-color-secondary); line-height: 1.6; }

// ── Issues ──
.cd-issues { display: flex; flex-direction: column; gap: 6px; }
.cd-issue {
  position: relative;
  padding: 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.12s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.cd-issue__accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 6px 0 0 6px;
}
.cd-issue__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}
.cd-issue__key {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
  background: var(--el-fill-color);
  padding: 1px 5px;
  border-radius: 3px;
}
.cd-issue__status {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.cd-issue__title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--el-text-color-primary);
}
.cd-issue__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.cd-issue__foot-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  .el-icon { font-size: 11px; }
  &--overdue { color: var(--el-color-danger); font-weight: 600; }
}
.cd-issue__labels { display: flex; gap: 4px; margin-left: auto; }
.cd-issue__label {
  font-size: 10px;
  padding: 0 5px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  line-height: 1.7;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cd-empty {
  text-align: center;
  padding: 24px 16px;
  &__icon { font-size: 28px; color: var(--el-text-color-placeholder); margin-bottom: 8px; }
  &__text { margin: 0; font-size: 13px; color: var(--el-text-color-secondary); }
}
.cd-transfer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

// ── Sidebar ──
.cd-sidebar {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cd-sb-group {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.cd-sb-group__title {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  .el-icon { font-size: 13px; }
}
.cd-sb-group__body { padding: 8px 14px; }
.cd-sb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.cd-sb-row__label { color: var(--el-text-color-secondary); font-weight: 500; flex-shrink: 0; }
.cd-sb-row__value { text-align: right; &--muted { font-size: 12px; color: var(--el-text-color-placeholder); } }
.cd-sb-release { margin-bottom: 10px; &:last-child { margin-bottom: 0; } }
.cd-sb-release__row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }

.cd-not-found { padding: 80px 0; }
</style>