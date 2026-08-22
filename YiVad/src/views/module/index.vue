<template>
  <div class="module-list">
    <div class="module-list__head">
      <div class="module-list__head-left">
        <h1 class="module-list__title">Modules</h1>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
      </div>
      <div class="module-list__head-actions">
        <template v-if="!props.projectKey">
          <el-input
            v-model="searchText"
            class="module-list__search"
            size="small"
            clearable
            placeholder="Search modules…"
            :prefix-icon="Search"
          />
          <el-select v-model="statusFilter" class="module-list__status" size="small">
            <el-option label="All" value="" />
            <el-option label="Planned" value="planned" />
            <el-option label="In Progress" value="in_progress" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
          <el-select v-model="sortBy" class="module-list__sort" size="small">
            <el-option label="Most issues" value="issues" />
            <el-option label="Name" value="name" />
            <el-option label="Progress" value="progress" />
          </el-select>
          <el-select v-model="projectFilter" placeholder="Filter by project" clearable class="module-list__project" size="small" @change="loadData">
            <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </template>
        <el-button type="primary" :icon="Plus" @click="openCreate">New Module</el-button>
      </div>
    </div>

    <div v-if="!props.projectKey" class="module-list__summary">
      <div
        class="module-summary__tile module-summary__tile--clickable"
        :class="{ 'module-summary__tile--active-filter': !statusFilter }"
        title="Show all modules"
        @click="setStatusFilter('')"
      >
        <span class="module-summary__value">{{ store.total }}</span>
        <span class="module-summary__label">Modules</span>
      </div>
      <div
        class="module-summary__tile module-summary__tile--planned module-summary__tile--clickable"
        :class="{ 'module-summary__tile--active-filter': statusFilter === 'planned' }"
        title="Filter planned"
        @click="setStatusFilter('planned')"
      >
        <span class="module-summary__value">{{ plannedCount }}</span>
        <span class="module-summary__label">Planned</span>
      </div>
      <div
        class="module-summary__tile module-summary__tile--progress module-summary__tile--clickable"
        :class="{ 'module-summary__tile--active-filter': statusFilter === 'in_progress' }"
        title="Filter in progress"
        @click="setStatusFilter('in_progress')"
      >
        <span class="module-summary__value">{{ inProgressCount }}</span>
        <span class="module-summary__label">In Progress</span>
      </div>
      <div
        class="module-summary__tile module-summary__tile--completed module-summary__tile--clickable"
        :class="{ 'module-summary__tile--active-filter': statusFilter === 'completed' }"
        title="Filter completed"
        @click="setStatusFilter('completed')"
      >
        <span class="module-summary__value">{{ completedCount }}</span>
        <span class="module-summary__label">Completed</span>
      </div>
      <div
        class="module-summary__tile module-summary__tile--cancelled module-summary__tile--clickable"
        :class="{ 'module-summary__tile--active-filter': statusFilter === 'cancelled' }"
        title="Filter cancelled"
        @click="setStatusFilter('cancelled')"
      >
        <span class="module-summary__value">{{ cancelledCount }}</span>
        <span class="module-summary__label">Cancelled</span>
      </div>
      <div
        class="module-summary__tile module-summary__tile--issues module-summary__tile--clickable"
        title="Open issues"
        @click="router.push('/issue')"
      >
        <span class="module-summary__value">{{ totalIssues }}</span>
        <span class="module-summary__label">Issues</span>
      </div>
    </div>

    <div v-loading="store.loading" class="module-list__grid">
      <el-card
        v-for="mod in displayedModules"
        :key="mod.key"
        class="module-card"
        shadow="hover"
        :class="{ 'module-card--muted': mod.status === 'completed' || mod.status === 'cancelled' }"
        @click="goDetail(mod.key)"
      >
        <div class="module-card__status-bar" :style="{ background: statusColor(mod.status) }" />
        <div class="module-card__body">
          <div class="module-card__top">
            <span class="module-card__name">{{ mod.name }}</span>
            <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
          </div>

          <button
            v-if="!props.projectKey && mod.project_key"
            type="button"
            class="module-card__project"
            title="Open project"
            @click.stop="goProject(mod.project_key)"
          >
            <el-icon><Folder /></el-icon>
            <span>{{ projectName(mod.project_key) }}</span>
          </button>

          <div v-if="mod.description" class="module-card__desc" v-html="descHtml(mod)" />

          <div class="module-card__meta">
            <span class="module-card__time" :class="timeHintClass(mod)">{{ timeHint(mod) }}</span>
            <span v-if="mod.lead" class="module-card__lead">{{ mod.lead }}</span>
          </div>

          <div v-if="issueCount(mod)" class="module-card__progress">
            <div class="module-card__progress-row">
              <span>{{ doneCount(mod) }} / {{ issueCount(mod) }} done</span>
              <span>{{ progressPct(mod) }}%</span>
            </div>
            <el-progress :percentage="progressPct(mod)" :stroke-width="6" :show-text="false" :color="progressColor(mod)" />
          </div>

          <div class="module-card__footer">
            <div class="module-card__footer-left">
              <span class="module-card__issues">{{ issueCount(mod) }} issues</span>
              <span class="module-card__updated">Updated {{ formatRelativeTime(mod.updated_at) }}</span>
            </div>
            <div class="module-card__actions">
              <el-button link size="small" type="primary" @click.stop="goDetail(mod.key)">Open</el-button>
              <el-button link size="small" @click.stop="openEdit(mod)">Edit</el-button>
              <el-button link size="small" type="danger" @click.stop="handleDelete(mod)">Delete</el-button>
            </div>
          </div>
        </div>
      </el-card>
      <div v-if="!store.loading && !store.modules.length" class="module-list__empty">
        <el-empty description="No modules yet">
          <el-button type="primary" @click="openCreate">Create your first module</el-button>
        </el-empty>
      </div>
      <div v-else-if="!store.loading && store.modules.length && !displayedModules.length" class="module-list__empty">
        <el-empty description="No matching modules" />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Module' : 'New Module'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Module name" maxlength="100" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" placeholder="Module description (Markdown)" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in MODULE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Lead">
              <el-input v-model="dialog.form.lead" placeholder="Module lead" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Start Date">
              <el-date-picker v-model="dialog.form.start_date" type="date" placeholder="Start date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Due Date">
              <el-date-picker v-model="dialog.form.due_date" type="date" placeholder="Due date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="!props.projectKey" label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="moduleList">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Folder } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = defineProps<{ projectKey?: string }>();
const router = useRouter();
const store = useModuleStore();
const formRef = ref<FormInstance>();
const { render: renderMarkdown } = useMarkdown();

const projectFilter = ref(props.projectKey || "");
const searchText = ref("");
const statusFilter = ref("");
const sortBy = ref<"issues" | "name" | "progress">("issues");
const projects = ref<{ key: string; name: string }[]>([]);

// ── Real progress from issue statuses (module → issue_keys link) ────────────
const issueStatusByKey = ref<Map<string, string>>(new Map());

async function loadIssueStatus() {
  try {
    const res = await getIssueList({ project_key: projectFilter.value || undefined, pageSize: 1000 });
    const list = (res.data?.list as Issue[]) ?? [];
    issueStatusByKey.value = new Map(list.map(i => [i.key, i.status]));
  } catch {
    // progress is best-effort
  }
}

async function loadProjects() {
  try {
    const res = await getProjectList({ pageSize: 500 });
    projects.value = ((res.data?.list as Project[]) ?? []).map(p => ({ key: p.key, name: p.name }));
  } catch { /* names fall back to raw keys */ }
}

function projectName(key: string) { return projects.value.find(p => p.key === key)?.name || key; }

function issueCount(mod: Module): number { return mod.issue_keys?.length || 0; }

function doneCount(mod: Module): number {
  let done = 0;
  for (const k of mod.issue_keys || []) {
    if (issueStatusByKey.value.get(k) === "done") done++;
  }
  return done;
}

function progressPct(mod: Module): number {
  if (mod.status === "completed") return 100;
  const total = issueCount(mod);
  if (!total) return 0;
  return Math.round((doneCount(mod) / total) * 100);
}

function progressColor(mod: Module): string {
  const pct = progressPct(mod);
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
}

function timeHint(mod: Module): string {
  if (mod.status === "completed") return "Completed";
  if (mod.status === "cancelled") return "Cancelled";
  if (mod.status === "in_progress") {
    if (!mod.due_date) return "In progress";
    const ms = new Date(mod.due_date).getTime() - Date.now();
    if (ms < 0) return "Overdue";
    return `${Math.ceil(ms / 86400000)}d to due`;
  }
  return mod.due_date ? `Due ${formatDate(mod.due_date)}` : "Planned";
}

function timeHintClass(mod: Module): string {
  if (mod.status === "completed") return "module-card__time--done";
  if (mod.status === "cancelled") return "module-card__time--cancelled";
  if (mod.status === "in_progress") {
    if (!mod.due_date) return "module-card__time--active";
    const ms = new Date(mod.due_date).getTime() - Date.now();
    if (ms < 0) return "module-card__time--overdue";
    return "module-card__time--ok";
  }
  return "module-card__time--upcoming";
}

function setStatusFilter(status: string) {
  statusFilter.value = statusFilter.value === status ? "" : status;
}

// Pre-render markdown descriptions once per list change.
const descHtmlMap = computed(() => {
  const map = new Map<string, string>();
  for (const mod of store.modules) {
    if (mod.description) map.set(mod.key, renderMarkdown(mod.description));
  }
  return map;
});

function descHtml(mod: Module): string { return descHtmlMap.value.get(mod.key) || ""; }

const displayedModules = computed(() => {
  let list = store.modules;
  const q = searchText.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        projectName(m.project_key).toLowerCase().includes(q)
    );
  }
  if (statusFilter.value) list = list.filter(m => m.status === statusFilter.value);
  const sorted = [...list];
  if (sortBy.value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === "progress") {
    sorted.sort((a, b) => progressPct(b) - progressPct(a));
  } else {
    sorted.sort((a, b) => issueCount(b) - issueCount(a));
  }
  return sorted;
});

const plannedCount = computed(() => store.modules.filter(m => m.status === "planned").length);
const inProgressCount = computed(() => store.modules.filter(m => m.status === "in_progress").length);
const completedCount = computed(() => store.modules.filter(m => m.status === "completed").length);
const cancelledCount = computed(() => store.modules.filter(m => m.status === "cancelled").length);
const totalIssues = computed(() => store.modules.reduce((s, m) => s + issueCount(m), 0));
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || !!statusFilter.value;
  return isFiltered ? `${displayedModules.value.length} of ${store.total} modules` : `${store.total} modules`;
});

const rules: FormRules = {
  name: [{ required: true, message: "Module name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: {
    name: "", description: "", status: "planned" as ModuleStatus, lead: "",
    project_key: props.projectKey || "", issue_keys: [] as string[],
    start_date: "", due_date: ""
  }
});

async function loadData() {
  await store.fetchModules({ project_key: projectFilter.value || undefined });
  await loadIssueStatus();
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", description: "", status: "planned" as ModuleStatus, lead: "", project_key: projectFilter.value || "", issue_keys: [], start_date: "", due_date: "" };
  dialog.visible = true;
}

function openEdit(mod: Module) {
  dialog.isEdit = true;
  dialog.editKey = mod.key;
  dialog.form = {
    name: mod.name, description: mod.description || "", status: mod.status,
    lead: mod.lead || "", project_key: mod.project_key, issue_keys: mod.issue_keys || [],
    start_date: mod.start_date || "", due_date: mod.due_date || ""
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editModule(dialog.editKey, {
        name: dialog.form.name, description: dialog.form.description,
        status: dialog.form.status, lead: dialog.form.lead,
        start_date: dialog.form.start_date, due_date: dialog.form.due_date
      });
      ElMessage.success("Module updated");
    } else {
      await store.addModule({
        key: `MOD-${Date.now().toString(36).toUpperCase()}`,
        project_key: dialog.form.project_key || projectFilter.value || "default",
        name: dialog.form.name, description: dialog.form.description,
        status: dialog.form.status, lead: dialog.form.lead, issue_keys: [],
        start_date: dialog.form.start_date, due_date: dialog.form.due_date
      });
      ElMessage.success("Module created");
    }
    dialog.visible = false;
  } finally { dialog.submitting = false; }
}

async function handleDelete(mod: Module) {
  try {
    await ElMessageBox.confirm(`Delete module "${mod.name}"?`, "Delete", { type: "error" });
    await store.removeModule(mod.key, projectFilter.value || undefined);
    ElMessage.success("Module deleted");
  } catch { /* cancelled */ }
}

function goDetail(key: string) { router.push(`/module/${key}`); }
function goProject(key: string) { if (key) router.push(`/project/${key}`); }
function statusLabel(s: ModuleStatus) { return MODULE_STATUS_MAP[s] || s; }
function statusTagType(s: ModuleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", completed: "success", cancelled: "danger" };
  return m[s] || "info";
}
function statusColor(s: ModuleStatus) {
  const m: Record<string, string> = { planned: "#909399", in_progress: "#409eff", completed: "#67c23a", cancelled: "#f56c6c" };
  return m[s] || "#909399";
}

onMounted(async () => {
  await loadData();
  if (!props.projectKey) await loadProjects();
});
</script>

<style scoped lang="scss">
.module-list {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.module-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.module-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.module-list__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.module-list__title { margin: 0; font-size: 20px; font-weight: 600; }
.module-list__search { width: 190px; }
.module-list__status { width: 130px; }
.module-list__sort { width: 130px; }
.module-list__project { width: 190px; }
.module-list__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.module-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.module-summary__tile--clickable {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
    border-color: var(--el-color-primary-light-5);
  }
}
.module-summary__tile--active-filter {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
}
.module-summary__value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.module-summary__label { font-size: 12px; color: var(--el-text-color-secondary); }
.module-summary__tile--planned .module-summary__value { color: var(--el-color-info); }
.module-summary__tile--progress .module-summary__value { color: var(--el-color-primary); }
.module-summary__tile--completed .module-summary__value { color: var(--el-color-success); }
.module-summary__tile--cancelled .module-summary__value { color: var(--el-color-danger); }
.module-summary__tile--issues .module-summary__value { color: var(--el-color-primary); }
.module-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.module-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  :deep(.el-card__body) { padding: 0; }
  &:hover { transform: translateY(-4px); box-shadow: var(--el-box-shadow-light); }
}
.module-card--muted { opacity: 0.82; }
.module-card__status-bar { height: 3px; }
.module-card__body { padding: 16px; }
.module-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.module-card__name { font-size: 16px; font-weight: 600; }
.module-card__project {
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
  &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}
.module-card__desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 10px;
  line-height: 1.55;
  word-break: break-word;
  :deep(p) { margin: 0 0 6px; }
  :deep(p:last-child) { margin-bottom: 0; }
  :deep(strong) { color: var(--el-text-color-primary); font-weight: 600; }
  :deep(code) {
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-danger);
    background: var(--el-fill-color-light);
    padding: 1px 5px;
    border-radius: 3px;
  }
  :deep(ul), :deep(ol) { margin: 0 0 6px; padding-left: 18px; }
  :deep(li) { margin: 2px 0; }
}
.module-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.module-card__time {
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  padding: 1px 8px;
  &--ok {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
  }
  &--overdue {
    color: #fff;
    background: var(--el-color-danger);
  }
  &--done {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }
  &--cancelled {
    color: var(--el-color-info);
    background: var(--el-color-info-light-9);
  }
  &--active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &--upcoming {
    color: var(--el-color-info);
    background: var(--el-color-info-light-9);
  }
}
.module-card__lead {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.module-card__progress { margin-bottom: 12px; }
.module-card__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.module-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.module-card__issues { font-size: 12px; color: var(--el-text-color-placeholder); }
.module-card__footer-left { display: flex; flex-direction: column; gap: 2px; }
.module-card__updated { font-size: 11px; color: var(--el-text-color-placeholder); }
.module-card__actions { display: flex; align-items: center; gap: 2px; }
.module-list__empty { grid-column: 1 / -1; padding: 60px 0; }
</style>
