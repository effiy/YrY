<template>
  <div class="cycle-detail" v-loading="loading">
    <template v-if="cycle">
      <div class="cycle-detail__head">
        <div class="cycle-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Cycles</el-button>
          <div>
            <h1 class="cycle-detail__name">{{ cycle.name }}</h1>
            <div class="cycle-detail__meta">
              <el-tag :type="statusTagType(cycle.status)" size="small">{{ statusLabel(cycle.status) }}</el-tag>
              <span class="cycle-detail__dates">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(cycle.start_date) }} — {{ formatDate(cycle.end_date) }}
              </span>
            </div>
          </div>
        </div>
        <div class="cycle-detail__head-actions">
          <el-button :icon="Edit" @click="openEdit">Edit</el-button>
          <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
        </div>
      </div>

      <div class="cycle-detail__body">
        <div class="cycle-detail__main">
          <div v-if="cycle.goal" class="cycle-detail__goal">
            <h3>Goal</h3>
            <p>{{ cycle.goal }}</p>
          </div>

          <!-- Burndown Chart -->
          <div class="cycle-detail__chart">
            <h3>Burndown</h3>
            <div ref="chartRef" style="width: 100%; height: 280px" />
          </div>

          <div class="cycle-detail__section">
            <h3>Issues ({{ cycle.issue_keys?.length || 0 }})</h3>
            <div v-if="issues.length" class="cycle-detail__issue-list">
              <div v-for="issue in issues" :key="issue.key" class="cycle-detail__issue" @click="router.push(`/issue/${issue.key}`)">
                <div class="cycle-detail__issue-left">
                  <el-tag :type="issueTypeTag(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                  <span class="cycle-detail__issue-title">{{ issue.title }}</span>
                </div>
                <div class="cycle-detail__issue-right">
                  <el-tag :type="issueStatusTag(issue.status)" size="small">{{ issueStatusLabel(issue.status) }}</el-tag>
                  <span v-if="issue.assignee" class="cycle-detail__issue-assignee">{{ issue.assignee }}</span>
                </div>
              </div>
            </div>
            <div v-else class="cycle-detail__transfer">
              <el-select v-model="transferTarget" placeholder="Transfer to cycle..." size="small" style="width: 220px" clearable>
                <el-option v-for="c in allCycles" :key="c.key" :label="c.name" :value="c.key" :disabled="c.key === cycle.key" />
              </el-select>
              <el-button size="small" :disabled="!transferTarget" @click="transferIssues">Transfer All</el-button>
            </div>
            <el-empty v-if="!cycle.issue_keys?.length && !issues.length" description="No issues in this cycle" :image-size="60" />
          </div>
        </div>
        <div class="cycle-detail__sidebar">
          <div class="cycle-detail__props">
            <div class="cycle-detail__prop">
              <span class="cycle-detail__prop-label">Project</span>
              <span>{{ cycle.project_key }}</span>
            </div>
            <div class="cycle-detail__prop">
              <span class="cycle-detail__prop-label">Duration</span>
              <span>{{ daysRemaining(cycle) }} days</span>
            </div>
            <div class="cycle-detail__prop">
              <span class="cycle-detail__prop-label">Progress</span>
              <el-progress :percentage="progressPct(cycle)" :stroke-width="6" :show-text="true" />
            </div>
            <div class="cycle-detail__prop">
              <span class="cycle-detail__prop-label">Health</span>
              <el-tag :type="healthType(cycle)">{{ healthLabel(cycle) }}</el-tag>
            </div>
            <div class="cycle-detail__prop">
              <span class="cycle-detail__prop-label">Velocity</span>
              <span>{{ cycle.issue_keys?.length || 0 }} issues / {{ daysRemaining(cycle) }}d remaining</span>
            </div>
          </div>
          <div v-if="linkedReleases.length" class="cycle-detail__props" style="margin-top: 12px">
            <div class="cycle-detail__prop">
              <span class="cycle-detail__prop-label">Linked Releases</span>
            </div>
            <div v-for="r in linkedReleases" :key="r.key" class="cycle-detail__prop">
              <el-button link size="small" type="success" @click="router.push(`/release/${r.key}`)">
                {{ r.version }}
              </el-button>
              <el-tag size="small" :type="r.status === 'released' ? 'success' : 'info'">{{ r.status }}</el-tag>
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
                <el-date-picker v-model="editDialog.form.start_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="End Date" prop="end_date">
                <el-date-picker v-model="editDialog.form.end_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
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
    </template>

    <div v-else-if="!loading" class="cycle-detail__not-found">
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
import { ArrowLeft, Edit, Delete, Calendar } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import * as echarts from "echarts";
import { useCycleStore } from "@/stores/modules/cycle";
import { formatDate } from "@/utils/datetime";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import { getCycleList, updateCycle } from "@/api/modules/cycleService";
import { getIssueList, issueStatusLabel, issueStatusTag, typeLabel, issueTypeTag } from "@/api/modules/issueService";
import { getReleaseList } from "@/api/modules/releaseService";
import type { Cycle, CycleStatus } from "@/api/modules/cycleService";
import type { Issue } from "@/api/modules/issueService";
import type { Release } from "@/api/modules/releaseService";

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

const doneCount = computed(() => issues.value.filter(i => i.status === "done").length);
const inProgressCount = computed(() => issues.value.filter(i => i.status === "in_progress").length);

const rules: FormRules = {
  name: [{ required: true, message: "Cycle name is required", trigger: "blur" }]
};

const editDialog = reactive({
  visible: false,
  submitting: false,
  form: {
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "upcoming" as CycleStatus
  }
});

function openEdit() {
  if (!cycle.value) return;
  editDialog.form = {
    name: cycle.value.name,
    goal: cycle.value.goal || "",
    start_date: cycle.value.start_date,
    end_date: cycle.value.end_date,
    status: cycle.value.status
  };
  editDialog.visible = true;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !cycle.value) return;
  editDialog.submitting = true;
  try {
    await store.editCycle(cycle.value.key, {
      name: editDialog.form.name,
      goal: editDialog.form.goal,
      start_date: editDialog.form.start_date,
      end_date: editDialog.form.end_date,
      status: editDialog.form.status
    });
    ElMessage.success("Cycle updated");
    editDialog.visible = false;
  } finally {
    editDialog.submitting = false;
  }
}

async function handleDelete() {
  if (!cycle.value) return;
  try {
    await ElMessageBox.confirm(`Delete cycle "${cycle.value.name}"?`, "Delete Cycle", {
      confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error"
    });
    await store.removeCycle(cycle.value.key, cycle.value.project_key);
    ElMessage.success("Cycle deleted");
    router.push("/cycle");
  } catch { /* cancelled */ }
}

function goBack() {
  router.push(cycle.value?.project_key ? `/project/${cycle.value.project_key}` : "/cycle");
}

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

  // Build actual burndown from issue completion dates
  const doneIssues = issues.value.filter(i => i.status === "done");
  const completionDates: Record<string, number> = {};
  doneIssues.forEach(i => {
    const d = i.updated_at?.slice(0, 10) || "";
    completionDates[d] = (completionDates[d] || 0) + 1;
  });

  let remaining = total;
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    dates.push(current.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }));
    const pct = Math.max(0, (end.getTime() - current.getTime()) / (end.getTime() - start.getTime()));
    ideal.push(Math.round(total * pct));
    // Actual: remaining = total - completed so far
    const doneToday = completionDates[dateStr] || 0;
    remaining = Math.max(0, remaining - doneToday);
    actual.push(remaining);
    current.setDate(current.getDate() + 1);
  }

  chart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["Ideal", "Actual"], bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: "category", data: dates, axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: { type: "value", name: "Remaining Issues", minInterval: 1 },
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

async function loadAllCycles() {
  try {
    const res = await getCycleList({ pageSize: 100 });
    allCycles.value = (res.data?.list as Cycle[]) ?? [];
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

  await Promise.all([
    updateCycle(sourceKey, { issue_keys: [] }),
    updateCycle(targetKey, { issue_keys: targetIssues })
  ]);

  ElMessage.success(`${sourceIssues.length} issues transferred to "${targetCycle.name}"`);
  transferTarget.value = "";
  await store.fetchCycle(sourceKey);
  await loadAllCycles();
}
onMounted(async () => {
  const key = route.params.key as string;
  if (key) {
    await store.fetchCycle(key);
    await loadIssues();
  }
  loading.value = false;
  await nextTick();
  renderChart();
  await loadAllCycles();
  await loadLinkedReleases();
});
</script>

<style scoped lang="scss">
.cycle-detail {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.cycle-detail__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.cycle-detail__head-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.cycle-detail__name {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}
.cycle-detail__meta {
  display: flex;
  gap: 12px;
  align-items: center;
}
.cycle-detail__dates {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}
.cycle-detail__head-actions {
  display: flex;
  gap: 8px;
}
.cycle-detail__body {
  display: flex;
  gap: 24px;
}
.cycle-detail__main {
  flex: 1;
  min-width: 0;
}
.cycle-detail__goal {
  margin-bottom: 24px;
  h3 { margin: 0 0 8px; font-size: 15px; }
  p { margin: 0; font-size: 14px; color: var(--el-text-color-secondary); }
}
.cycle-detail__chart {
  margin-bottom: 24px;
  h3 { margin: 0 0 12px; font-size: 15px; }
}
.cycle-detail__section {
  h3 { margin: 0 0 12px; font-size: 15px; }
}
.cycle-detail__sidebar {
  width: 260px;
  flex-shrink: 0;
}
.cycle-detail__props {
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  padding: 16px;
}
.cycle-detail__prop {
  padding: 8px 0;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.cycle-detail__prop-label {
  display: block;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  margin-bottom: 4px;
}
.cycle-detail__not-found {
  padding: 80px 0;
}
</style>