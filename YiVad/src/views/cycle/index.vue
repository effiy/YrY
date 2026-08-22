<template>
  <div class="cycle-list">
    <div class="cycle-list__head">
      <div class="cycle-list__head-left">
        <h1 class="cycle-list__title">Cycles</h1>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
      </div>
      <div class="cycle-list__head-actions">
        <template v-if="!props.projectKey">
          <el-input
            v-model="searchText"
            class="cycle-list__search"
            size="small"
            clearable
            placeholder="Search cycles…"
            :prefix-icon="Search"
          />
          <el-select v-model="statusFilter" class="cycle-list__status" size="small">
            <el-option label="All" value="" />
            <el-option label="Upcoming" value="upcoming" />
            <el-option label="Active" value="active" />
            <el-option label="Completed" value="completed" />
          </el-select>
          <el-select v-model="sortBy" class="cycle-list__sort" size="small">
            <el-option label="End date" value="end" />
            <el-option label="Name A–Z" value="name" />
            <el-option label="Most issues" value="issues" />
          </el-select>
        </template>
        <el-button type="primary" :icon="Plus" @click="openCreate">New Cycle</el-button>
      </div>
    </div>

    <div v-if="!props.projectKey" class="cycle-list__summary">
      <div
        class="cycle-summary__tile cycle-summary__tile--clickable"
        :class="{ 'cycle-summary__tile--active-filter': !statusFilter }"
        title="Show all cycles"
        @click="setStatusFilter('')"
      >
        <span class="cycle-summary__value">{{ store.total }}</span>
        <span class="cycle-summary__label">Cycles</span>
      </div>
      <div
        class="cycle-summary__tile cycle-summary__tile--upcoming cycle-summary__tile--clickable"
        :class="{ 'cycle-summary__tile--active-filter': statusFilter === 'upcoming' }"
        title="Filter upcoming"
        @click="setStatusFilter('upcoming')"
      >
        <span class="cycle-summary__value">{{ upcomingCount }}</span>
        <span class="cycle-summary__label">Upcoming</span>
      </div>
      <div
        class="cycle-summary__tile cycle-summary__tile--active cycle-summary__tile--clickable"
        :class="{ 'cycle-summary__tile--active-filter': statusFilter === 'active' }"
        title="Filter active"
        @click="setStatusFilter('active')"
      >
        <span class="cycle-summary__value">{{ activeCount }}</span>
        <span class="cycle-summary__label">Active</span>
      </div>
      <div
        class="cycle-summary__tile cycle-summary__tile--completed cycle-summary__tile--clickable"
        :class="{ 'cycle-summary__tile--active-filter': statusFilter === 'completed' }"
        title="Filter completed"
        @click="setStatusFilter('completed')"
      >
        <span class="cycle-summary__value">{{ completedCount }}</span>
        <span class="cycle-summary__label">Completed</span>
      </div>
      <div class="cycle-summary__tile cycle-summary__tile--issues">
        <span class="cycle-summary__value">{{ totalIssues }}</span>
        <span class="cycle-summary__label">Issues</span>
      </div>
      <div class="cycle-summary__tile cycle-summary__tile--progress">
        <span class="cycle-summary__value">{{ overallCompletion }}%</span>
        <span class="cycle-summary__label">Completed</span>
      </div>
    </div>

    <div v-loading="store.loading" class="cycle-list__grid">
      <el-card
        v-for="cycle in displayedCycles"
        :key="cycle.key"
        class="cycle-card"
        shadow="hover"
        :class="{ 'cycle-card--active': cycle.status === 'active', 'cycle-card--completed': cycle.status === 'completed' }"
        @click="goDetail(cycle.key)"
      >
        <div class="cycle-card__status-bar" :style="{ background: statusColor(cycle.status) }" />
        <div class="cycle-card__body">
          <div class="cycle-card__name-row">
            <span class="cycle-card__name" :title="cycle.name">{{ cycle.name }}</span>
            <el-tag :type="statusTagType(cycle.status)" size="small">{{ statusLabel(cycle.status) }}</el-tag>
          </div>

          <button
            v-if="!props.projectKey && cycle.project_key"
            type="button"
            class="cycle-card__project"
            title="Open project"
            @click.stop="goProject(cycle.project_key)"
          >
            <el-icon><Folder /></el-icon>
            <span>{{ projectName(cycle.project_key) }}</span>
          </button>

          <div v-if="cycle.goal" class="cycle-card__goal">{{ cycle.goal }}</div>

          <div class="cycle-card__dates">
            <el-icon><Calendar /></el-icon>
            <span>{{ formatDate(cycle.start_date) }} — {{ formatDate(cycle.end_date) }}</span>
            <span class="cycle-card__time-hint" :class="timeHintClass(cycle)">{{ timeHint(cycle) }}</span>
          </div>

          <div v-if="issueCount(cycle)" class="cycle-card__progress">
            <div class="cycle-card__progress-row">
              <span>{{ doneCount(cycle) }} / {{ issueCount(cycle) }} done</span>
              <span>{{ progressPct(cycle) }}%</span>
            </div>
            <el-progress :percentage="progressPct(cycle)" :stroke-width="6" :show-text="false" :color="progressColor(cycle)" />
          </div>

          <div class="cycle-card__footer">
            <div class="cycle-card__footer-left">
              <span class="cycle-card__issues">{{ issueCount(cycle) }} issues</span>
              <span class="cycle-card__updated">Updated {{ formatRelativeTime(cycle.updated_at) }}</span>
            </div>
            <div class="cycle-card__actions">
              <el-button link size="small" type="primary" @click.stop="goDetail(cycle.key)">Open</el-button>
              <el-button link size="small" @click.stop="openEdit(cycle)">Edit</el-button>
              <el-button link size="small" type="success" @click.stop="openPlanning(cycle)">Plan</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <div v-if="!store.loading && !store.cycles.length" class="cycle-list__empty">
        <el-empty description="No cycles yet">
          <el-button type="primary" @click="openCreate">Create your first cycle</el-button>
        </el-empty>
      </div>
      <div v-else-if="!store.loading && store.cycles.length && !displayedCycles.length" class="cycle-list__empty">
        <el-empty description="No matching cycles" />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? 'Edit Cycle' : 'New Cycle'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="e.g. Sprint 1" maxlength="100" />
        </el-form-item>
        <el-form-item label="Goal">
          <el-input v-model="dialog.form.goal" type="textarea" :rows="2" placeholder="Cycle goal" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Start Date" prop="start_date">
              <el-date-picker v-model="dialog.form.start_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="End Date" prop="end_date">
              <el-date-picker v-model="dialog.form.end_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Status">
          <el-radio-group v-model="dialog.form.status">
            <el-radio v-for="(label, val) in CYCLE_STATUS_MAP" :key="val" :value="val">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!props.projectKey" label="Project" prop="project_key">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>

    <IssuePlanningPanel v-model="planningVisible" :cycle="planningCycle" @closed="store.fetchCycles({ project_key: props.projectKey })" />
  </div>
</template>

<script setup lang="ts" name="cycleList">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Calendar, Search, Folder } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useCycleStore } from "@/stores/modules/cycle";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import type { Cycle, CycleStatus } from "@/api/modules/cycleService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { formatRelativeTime } from "@/utils/datetime";
import IssuePlanningPanel from "./components/IssuePlanningPanel.vue";

const props = defineProps<{ projectKey?: string }>();

const router = useRouter();
const store = useCycleStore();
const formRef = ref<FormInstance>();

const planningVisible = ref(false);
const planningCycle = ref<Cycle | null>(null);
const searchText = ref("");
const statusFilter = ref("");
const sortBy = ref<"end" | "name" | "issues">("end");

// ── Per-cycle issue stats (real progress from issue status) ────────────────
const statsByKey = ref<Map<string, { issues: number; done: number }>>(new Map());
const projectNameByKey = ref<Map<string, string>>(new Map());

async function loadStats() {
  try {
    const res = await getIssueList({ project_key: props.projectKey || undefined, pageSize: 1000 });
    const issues = (res.data?.list as Issue[]) ?? [];
    const map = new Map<string, { issues: number; done: number }>();
    for (const i of issues) {
      if (!i.cycle_key) continue;
      let s = map.get(i.cycle_key);
      if (!s) {
        s = { issues: 0, done: 0 };
        map.set(i.cycle_key, s);
      }
      s.issues++;
      if (i.status === "done") s.done++;
    }
    statsByKey.value = map;
  } catch {
    // stats are best-effort — the list still renders without them
  }
}

async function loadProjects() {
  if (props.projectKey) return;
  try {
    const res = await getProjectList({ pageSize: 500 });
    const projects = (res.data?.list as Project[]) ?? [];
    const map = new Map<string, string>();
    for (const p of projects) map.set(p.key, p.name);
    projectNameByKey.value = map;
  } catch {
    // project names are best-effort
  }
}

function issueCount(cycle: Cycle): number {
  const s = statsByKey.value.get(cycle.key);
  return s?.issues ?? (cycle.issue_keys?.length || 0);
}

function doneCount(cycle: Cycle): number {
  return statsByKey.value.get(cycle.key)?.done ?? 0;
}

function progressPct(cycle: Cycle): number {
  if (cycle.status === "completed") return 100;
  const total = issueCount(cycle);
  if (!total) return 0;
  return Math.round((doneCount(cycle) / total) * 100);
}

function progressColor(cycle: Cycle): string {
  const pct = progressPct(cycle);
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
}

function projectName(key: string): string {
  return projectNameByKey.value.get(key) || key;
}

function daysLeft(cycle: Cycle): number {
  if (cycle.status === "completed") return 0;
  const ms = new Date(cycle.end_date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function timeHint(cycle: Cycle): string {
  if (cycle.status === "completed") return "Completed";
  if (cycle.status === "upcoming") return `Starts ${formatDate(cycle.start_date)}`;
  const d = daysLeft(cycle);
  return d > 0 ? `${d}d left` : "Ended";
}

function timeHintClass(cycle: Cycle): string {
  if (cycle.status === "completed") return "cycle-card__time-hint--done";
  if (cycle.status === "upcoming") return "cycle-card__time-hint--upcoming";
  const d = daysLeft(cycle);
  if (d <= 0) return "cycle-card__time-hint--ended";
  if (d <= 3) return "cycle-card__time-hint--soon";
  return "cycle-card__time-hint--ok";
}

function setStatusFilter(status: string) {
  statusFilter.value = statusFilter.value === status ? "" : status;
}

const displayedCycles = computed(() => {
  let list = store.cycles;
  const q = searchText.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.goal || "").toLowerCase().includes(q) ||
        projectName(c.project_key).toLowerCase().includes(q)
    );
  }
  if (statusFilter.value) list = list.filter(c => c.status === statusFilter.value);
  const sorted = [...list];
  if (sortBy.value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === "issues") {
    sorted.sort((a, b) => issueCount(b) - issueCount(a));
  } else {
    sorted.sort((a, b) => (b.end_date || "").localeCompare(a.end_date || ""));
  }
  return sorted;
});

const upcomingCount = computed(() => store.cycles.filter(c => c.status === "upcoming").length);
const activeCount = computed(() => store.cycles.filter(c => c.status === "active").length);
const completedCount = computed(() => store.cycles.filter(c => c.status === "completed").length);
const totalIssues = computed(() => store.cycles.reduce((s, c) => s + issueCount(c), 0));
const totalDone = computed(() => store.cycles.reduce((s, c) => s + doneCount(c), 0));
const overallCompletion = computed(() => (totalIssues.value ? Math.round((totalDone.value / totalIssues.value) * 100) : 0));
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || !!statusFilter.value;
  return isFiltered ? `${displayedCycles.value.length} of ${store.total} cycles` : `${store.total} cycles`;
});

const rules: FormRules = {
  name: [{ required: true, message: "Cycle name is required", trigger: "blur" }],
  start_date: [{ required: true, message: "Start date is required", trigger: "change" }],
  end_date: [{ required: true, message: "End date is required", trigger: "change" }]
};

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "upcoming" as CycleStatus,
    project_key: props.projectKey || "",
    issue_keys: [] as string[]
  }
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = {
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "upcoming",
    project_key: props.projectKey || "",
    issue_keys: []
  };
  dialog.visible = true;
}

function openEdit(cycle: Cycle) {
  dialog.isEdit = true;
  dialog.editKey = cycle.key;
  dialog.form = {
    name: cycle.name,
    goal: cycle.goal || "",
    start_date: cycle.start_date,
    end_date: cycle.end_date,
    status: cycle.status,
    project_key: cycle.project_key,
    issue_keys: cycle.issue_keys || []
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editCycle(dialog.editKey, {
        name: dialog.form.name,
        goal: dialog.form.goal,
        start_date: dialog.form.start_date,
        end_date: dialog.form.end_date,
        status: dialog.form.status
      });
      ElMessage.success("Cycle updated");
    } else {
      const key = `CYC-${Date.now().toString(36).toUpperCase()}`;
      await store.addCycle({
        key,
        project_key: dialog.form.project_key || props.projectKey || "",
        name: dialog.form.name,
        goal: dialog.form.goal,
        start_date: dialog.form.start_date,
        end_date: dialog.form.end_date,
        status: dialog.form.status,
        issue_keys: []
      });
      ElMessage.success("Cycle created");
    }
    dialog.visible = false;
  } finally {
    dialog.submitting = false;
  }
}

function openPlanning(cycle: Cycle) {
  planningCycle.value = cycle;
  planningVisible.value = true;
}

function goDetail(key: string) {
  router.push(`/cycle/${key}`);
}

function goProject(key: string) {
  if (key) router.push(`/project/${key}`);
}

function statusLabel(s: CycleStatus) { return CYCLE_STATUS_MAP[s] || s; }
function statusTagType(s: CycleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<CycleStatus, "success" | "warning" | "info" | "primary" | "danger"> = { upcoming: "info", active: "primary", completed: "success" };
  return m[s] || "info";
}
function statusColor(s: CycleStatus) {
  const m: Record<CycleStatus, string> = { upcoming: "#909399", active: "#409eff", completed: "#67c23a" };
  return m[s] || "#909399";
}
function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

onMounted(() => {
  store.fetchCycles({ project_key: props.projectKey });
  loadStats();
  loadProjects();
});
</script>

<style scoped lang="scss">
.cycle-list {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.cycle-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.cycle-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cycle-list__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.cycle-list__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.cycle-list__search {
  width: 220px;
}
.cycle-list__status {
  width: 130px;
}
.cycle-list__sort {
  width: 140px;
}
.cycle-list__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.cycle-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cycle-summary__tile--clickable {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
    border-color: var(--el-color-primary-light-5);
  }
}
.cycle-summary__tile--active-filter {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
}
.cycle-summary__value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.cycle-summary__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cycle-summary__tile--upcoming .cycle-summary__value { color: var(--el-color-info); }
.cycle-summary__tile--active .cycle-summary__value { color: var(--el-color-primary); }
.cycle-summary__tile--completed .cycle-summary__value { color: var(--el-color-success); }
.cycle-summary__tile--issues .cycle-summary__value { color: var(--el-color-primary); }
.cycle-summary__tile--progress .cycle-summary__value { color: var(--el-color-warning); }
.cycle-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.cycle-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  :deep(.el-card__body) { padding: 0; }
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}
.cycle-card--active {
  border-color: var(--el-color-primary);
}
.cycle-card--completed {
  opacity: 0.82;
}
.cycle-card__status-bar {
  height: 3px;
}
.cycle-card__body {
  padding: 16px;
}
.cycle-card__name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cycle-card__name {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cycle-card__project {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: color 0.15s, background 0.15s;
  .el-icon { font-size: 13px; }
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.cycle-card__goal {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 10px;
  white-space: pre-wrap;
  word-break: break-word;
}
.cycle-card__dates {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.cycle-card__time-hint {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  padding: 1px 8px;
  &--ok {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
  }
  &--soon {
    color: #fff;
    background: var(--el-color-warning);
  }
  &--ended {
    color: #fff;
    background: var(--el-color-danger);
  }
  &--done {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }
  &--upcoming {
    color: var(--el-color-info);
    background: var(--el-color-info-light-9);
  }
}
.cycle-card__progress {
  margin-bottom: 12px;
}
.cycle-card__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.cycle-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.cycle-card__issues {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.cycle-card__footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cycle-card__updated {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cycle-card__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.cycle-list__empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>
