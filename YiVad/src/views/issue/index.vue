<template>
  <div class="issue-list">
    <!-- Summary Strip -->
    <div v-if="!props.projectKey" class="issue-list__summary">
      <div class="issue-summary__tile issue-summary__tile--clickable" @click="setStatusFilter('')">
        <span class="issue-summary__value">{{ stats.total }}</span>
        <span class="issue-summary__label">Issues</span>
        <span class="issue-summary__sub">{{ stats.done }} done</span>
      </div>
      <div class="issue-summary__tile issue-summary__tile--todo issue-summary__tile--clickable" @click="setStatusFilter('todo')">
        <span class="issue-summary__value">{{ stats.todo }}</span>
        <span class="issue-summary__label">Todo</span>
        <span class="issue-summary__sub">{{ pctLabel(stats.todo) }}</span>
      </div>
      <div class="issue-summary__tile issue-summary__tile--progress issue-summary__tile--clickable" @click="setStatusFilter('in_progress')">
        <span class="issue-summary__value">{{ stats.in_progress }}</span>
        <span class="issue-summary__label">In Progress</span>
        <span class="issue-summary__sub">{{ pctLabel(stats.in_progress) }}</span>
      </div>
      <div class="issue-summary__tile issue-summary__tile--review issue-summary__tile--clickable" @click="setStatusFilter('in_review')">
        <span class="issue-summary__value">{{ stats.in_review }}</span>
        <span class="issue-summary__label">In Review</span>
        <span class="issue-summary__sub">{{ pctLabel(stats.in_review) }}</span>
      </div>
      <div class="issue-summary__tile issue-summary__tile--done issue-summary__tile--clickable" @click="setStatusFilter('done')">
        <span class="issue-summary__value">{{ stats.done }}</span>
        <span class="issue-summary__label">Done</span>
        <span class="issue-summary__sub">{{ pctLabel(stats.done) }}</span>
      </div>
      <div class="issue-summary__tile issue-summary__tile--backlog issue-summary__tile--clickable" @click="setStatusFilter('backlog')">
        <span class="issue-summary__value">{{ stats.backlog }}</span>
        <span class="issue-summary__label">Backlog</span>
        <span class="issue-summary__sub">{{ pctLabel(stats.backlog) }}</span>
      </div>
      <div class="issue-summary__tile issue-summary__tile--cancelled issue-summary__tile--clickable" @click="setStatusFilter('cancelled')">
        <span class="issue-summary__value">{{ stats.cancelled }}</span>
        <span class="issue-summary__label">Cancelled</span>
        <span class="issue-summary__sub">{{ pctLabel(stats.cancelled) }}</span>
      </div>
      <div class="issue-summary__tile issue-summary__tile--completion">
        <span class="issue-summary__value">{{ completionPct }}%</span>
        <span class="issue-summary__label">Completed</span>
        <span class="issue-summary__sub">{{ stats.done }} of {{ stats.total }}</span>
      </div>
    </div>

    <!-- Quick Filters -->
    <div class="issue-list__filters">
      <el-button
        v-for="f in quickFilters"
        :key="f.key"
        size="small"
        :type="activeFilter === f.key ? 'primary' : ''"
        @click="applyQuickFilter(f.key)"
      >{{ f.label }}</el-button>
      <el-button v-if="activeFilter" size="small" text @click="clearFilter">Clear</el-button>
    </div>
    <div v-if="labelFilter" class="issue-list__label-filter">
      <span class="issue-list__label-filter-text">
        Filtered by label <el-tag size="small" round>{{ labelFilter }}</el-tag>
      </span>
      <el-button size="small" text @click="clearLabelFilter">Clear</el-button>
    </div>
    <ProTable
      ref="proTable"
      title="Issues"
      :columns="columns"
      :request-api="fetchIssues"
      :pagination="true"
    >
      <template #tableHeader="scope">
        <el-button type="primary" :icon="Plus" @click="openCreate">New Issue</el-button>
        <el-dropdown
          :disabled="!scope.isSelected"
          trigger="click"
          style="margin-left: 8px"
        >
          <el-button type="warning" plain :disabled="!scope.isSelected">
            Bulk Actions<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="bulkChangeStatus(scope, 'todo')">Set Status: Todo</el-dropdown-item>
              <el-dropdown-item @click="bulkChangeStatus(scope, 'in_progress')">Set Status: In Progress</el-dropdown-item>
              <el-dropdown-item @click="bulkChangeStatus(scope, 'done')">Set Status: Done</el-dropdown-item>
              <el-dropdown-item divided @click="openBatchAssign(scope)">Assign to...</el-dropdown-item>
              <el-dropdown-item divided @click="batchDelete(scope.selectedListIds)">Delete Selected</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button :icon="Download" style="margin-left: 8px" @click="exportCSV">CSV</el-button>
        <el-button :icon="Download" style="margin-left: 4px" @click="exportJSON">JSON</el-button>
      </template>
      <template #key="scope">
        <code class="issue-list__key" title="Copy key" @click="copyKey(scope.row.key)">{{ scope.row.key }}</code>
      </template>
      <template #title="scope">
        <el-button link type="primary" class="issue-list__title" @click="goDetail(scope.row.key)">
          {{ scope.row.title }}
        </el-button>
      </template>
      <template #status="scope">
        <el-tag :type="statusTagType(scope.row.status)" size="small">
          {{ statusLabel(scope.row.status) }}
        </el-tag>
      </template>
      <template #priority="scope">
        <span :style="{ color: priorityColor(scope.row.priority) }">
          {{ priorityLabel(scope.row.priority) }}
        </span>
      </template>
      <template #estimate_points="scope">
        <span v-if="scope.row.estimate_points != null" class="issue-list__points">{{ scope.row.estimate_points }} pts</span>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #issue_type="scope">
        <el-tag :type="typeTagType(scope.row.issue_type)" size="small" effect="plain">
          {{ typeLabel(scope.row.issue_type) }}
        </el-tag>
      </template>
      <template #labels="scope">
        <div v-if="scope.row.labels?.length" class="issue-list__labels">
          <el-tag v-for="l in scope.row.labels" :key="l" size="small" round effect="plain">{{ l }}</el-tag>
        </div>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #source="scope">
        <span :class="scope.row.source ? 'issue-list__source' : 'issue-list__muted'">{{ scope.row.source ? sourceLabel(scope.row.source) : "—" }}</span>
      </template>
      <template #review_status="scope">
        <el-tag v-if="scope.row.review_status" :type="reviewTagType(scope.row.review_status)" size="small" effect="plain">{{ reviewLabel(scope.row.review_status) }}</el-tag>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #project_key="scope">
        <button v-if="scope.row.project_key" type="button" class="issue-list__link-chip" @click="goProject(scope.row.project_key)">
          {{ projectName(scope.row.project_key) }}
        </button>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #module="scope">
        <div v-if="modulesForIssue(scope.row.key).length" class="issue-list__modules">
          <button
            v-for="m in modulesForIssue(scope.row.key)"
            :key="m.key"
            type="button"
            class="issue-list__link-chip issue-list__link-chip--module"
            @click="goModule(m.key)"
          >{{ m.name }}</button>
        </div>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #cycle_key="scope">
        <button v-if="scope.row.cycle_key" type="button" class="issue-list__link-chip issue-list__link-chip--cycle" @click="goCycle(scope.row.cycle_key)">
          {{ cycleName(scope.row.cycle_key) }}
        </button>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #release_key="scope">
        <button v-if="scope.row.release_key" type="button" class="issue-list__link-chip issue-list__link-chip--release" @click="goRelease(scope.row.release_key)">
          {{ releaseVersion(scope.row.release_key) }}
        </button>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #start_date="scope">
        <span v-if="scope.row.start_date" class="issue-list__start">{{ formatDate(scope.row.start_date) }}</span>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #due_date="scope">
        <span :class="dueCell(scope.row).cls">{{ dueCell(scope.row).text }}</span>
      </template>
      <template #created_at="scope">
        <span class="issue-list__updated">{{ formatRelativeTime(scope.row.created_at) }}</span>
      </template>
      <template #updated_at="scope">
        <span class="issue-list__updated">{{ formatRelativeTime(scope.row.updated_at) }}</span>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="goDetail(scope.row.key)">View</el-button>
        <el-button type="primary" link :icon="Edit" @click="openEdit(scope.row)">Edit</el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
      </template>
    </ProTable>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? 'Edit Issue' : 'New Issue'"
      width="640px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="dialog.form.title" placeholder="Issue title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Type" prop="issue_type">
              <el-select v-model="dialog.form.issue_type" style="width: 100%">
                <el-option v-for="(label, val) in ISSUE_TYPE_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Priority" prop="priority">
              <el-select v-model="dialog.form.priority" style="width: 100%">
                <el-option v-for="(label, val) in ISSUE_PRIORITY_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status" prop="status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in ISSUE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Assignee">
              <el-input v-model="dialog.form.assignee" placeholder="Assignee name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="4" placeholder="Issue description (Markdown supported)" />
        </el-form-item>
        <el-form-item label="Acceptance">
          <el-input v-model="dialog.form.acceptance_criteria" type="textarea" :rows="2" placeholder="Acceptance criteria" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Source">
              <el-select v-model="dialog.form.source" style="width: 100%" clearable placeholder="Source">
                <el-option v-for="(label, val) in ISSUE_SOURCE_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Review">
              <el-select v-model="dialog.form.review_status" style="width: 100%" clearable placeholder="Review status">
                <el-option v-for="(label, val) in REVIEW_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
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
        <el-form-item v-if="!props.projectKey" label="Project" prop="project_key">
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

<script setup lang="tsx" name="issueList">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Delete, View, Edit, ArrowDown, Download } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import {
  getIssueList,
  ISSUE_STATUS_MAP,
  ISSUE_PRIORITY_MAP,
  ISSUE_TYPE_MAP,
  ISSUE_SOURCE_MAP,
  REVIEW_STATUS_MAP,
  ISSUE_STATUS_TAG_MAP,
  ISSUE_TYPE_TAG_MAP,
  typeLabel
} from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType, TagType, IssueSource, ReviewStatus } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { getCycleList } from "@/api/modules/cycleService";
import type { Cycle } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";
import type { Release } from "@/api/modules/releaseService";
import { getModuleList } from "@/api/modules/moduleService";
import type { Module } from "@/api/modules/moduleService";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { useHandleData } from "@/hooks/useHandleData";

const props = defineProps<{ projectKey?: string }>();

const router = useRouter();
const route = useRoute();
const store = useIssueStore();
const proTable = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const activeFilter = ref("");
const labelFilter = ref("");

// ── Summary stats (standalone overview) ─────────────────────────────────────
const stats = reactive({ total: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, backlog: 0, cancelled: 0 });
const completionPct = computed(() => (stats.total ? Math.round((stats.done / stats.total) * 100) : 0));
function pctLabel(count: number): string {
  if (!stats.total) return "";
  return `${Math.round((count / stats.total) * 100)}% of all`;
}

async function loadStats() {
  try {
    const res = await getIssueList({ project_key: props.projectKey || undefined, pageSize: 1000 });
    const list = (res.data?.list as Issue[]) ?? [];
    const s = { total: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, backlog: 0, cancelled: 0 };
    for (const i of list) {
      s.total++;
      if (i.status === "todo") s.todo++;
      else if (i.status === "in_progress") s.in_progress++;
      else if (i.status === "in_review") s.in_review++;
      else if (i.status === "done") s.done++;
      else if (i.status === "backlog") s.backlog++;
      else if (i.status === "cancelled") s.cancelled++;
    }
    Object.assign(stats, s);
  } catch {
    // stats are best-effort — the table still renders without them
  }
}

// ── Cross-entity name maps (project / cycle / release chips) ────────────────
const projectNameByKey = ref<Map<string, string>>(new Map());
const cycleNameByKey = ref<Map<string, string>>(new Map());
const releaseVersionByKey = ref<Map<string, string>>(new Map());
const modulesByIssueKey = ref<Map<string, Module[]>>(new Map());

async function loadNames() {
  try {
    const [projRes, cycleRes, relRes, modRes] = await Promise.all([
      getProjectList({ pageSize: 500 }),
      getCycleList({ pageSize: 500 }),
      getReleaseList({ pageSize: 500 }),
      getModuleList({ pageSize: 500 })
    ]);
    projectNameByKey.value = new Map((projRes.data?.list as Project[]).map(p => [p.key, p.name]));
    cycleNameByKey.value = new Map((cycleRes.data?.list as Cycle[]).map(c => [c.key, c.name]));
    releaseVersionByKey.value = new Map((relRes.data?.list as Release[]).map(r => [r.key, r.version]));
    // Reverse-map module.issue_keys → issue, so the list can show which
    // module(s) each issue belongs to (module membership lives on the module,
    // not the issue).
    const byIssue = new Map<string, Module[]>();
    for (const m of modRes.data?.list as Module[]) {
      for (const ik of m.issue_keys ?? []) {
        const arr = byIssue.get(ik) ?? [];
        arr.push(m);
        byIssue.set(ik, arr);
      }
    }
    modulesByIssueKey.value = byIssue;
  } catch {
    // names are best-effort — fall back to raw keys
  }
}

function modulesForIssue(issueKey: string): Module[] {
  return modulesByIssueKey.value.get(issueKey) ?? [];
}

function projectName(key: string) { return projectNameByKey.value.get(key) || key; }
function cycleName(key: string) { return cycleNameByKey.value.get(key) || key; }
function releaseVersion(key: string) { return releaseVersionByKey.value.get(key) || key; }

function goProject(key: string) { if (key) router.push(`/project/${key}`); }
function goCycle(key: string) { if (key) router.push(`/cycle/${key}`); }
function goRelease(key: string) { if (key) router.push(`/release/${key}`); }
function goModule(key: string) { if (key) router.push(`/module/${key}`); }

function dueCell(row: Issue): { text: string; cls: string } {
  if (!row.due_date) return { text: "—", cls: "issue-list__muted" };
  if (row.status !== "done") {
    const ms = new Date(row.due_date).getTime() - Date.now();
    if (ms < 0) return { text: `${formatDate(row.due_date)} · Overdue`, cls: "issue-list__due--overdue" };
    const days = Math.ceil(ms / 86400000);
    if (days <= 3) return { text: `${formatDate(row.due_date)} · ${days}d`, cls: "issue-list__due--soon" };
  }
  return { text: formatDate(row.due_date), cls: "" };
}

const quickFilters = [
  { key: "my", label: "My Issues" },
  { key: "open", label: "Open" },
  { key: "high", label: "High Priority" },
  { key: "week", label: "Due This Week" },
  { key: "done", label: "Recently Done" }
];

function applyQuickFilter(key: string) {
  activeFilter.value = key === activeFilter.value ? "" : key;
  proTable.value?.getTableList();
}

function clearFilter() {
  activeFilter.value = "";
  proTable.value?.getTableList();
}

function clearLabelFilter() {
  labelFilter.value = "";
  proTable.value?.getTableList();
}

function setStatusFilter(status: string) {
  activeFilter.value = activeFilter.value === status ? "" : status;
  proTable.value?.getTableList();
}

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  issue_type: [{ required: true, message: "Type is required", trigger: "change" }],
  priority: [{ required: true, message: "Priority is required", trigger: "change" }],
  status: [{ required: true, message: "Status is required", trigger: "change" }]
};

const columns = computed<ColumnProps<Issue>[]>(() => {
  const cols: ColumnProps<Issue>[] = [
    { type: "selection", width: 50 },
    { prop: "key", label: "Key", width: 100 },
    { prop: "title", label: "Title", minWidth: 220, search: { el: "input" } },
    { prop: "issue_type", label: "Type", width: 105 },
    { prop: "priority", label: "Priority", width: 92 },
    { prop: "estimate_points", label: "Points", width: 80 },
    { prop: "status", label: "Status", width: 110 },
    { prop: "labels", label: "Labels", width: 150 },
    { prop: "source", label: "Source", width: 105 },
    { prop: "review_status", label: "Review", width: 105 },
    { prop: "module", label: "Module", width: 120 },
    { prop: "cycle_key", label: "Cycle", width: 120 },
    { prop: "release_key", label: "Release", width: 120 },
    { prop: "assignee", label: "Assignee", width: 100 },
    { prop: "start_date", label: "Start", width: 110 },
    { prop: "due_date", label: "Due", width: 135 },
    { prop: "created_at", label: "Created", width: 120 },
    { prop: "updated_at", label: "Updated", width: 120 },
    { prop: "operation", label: "Actions", width: 190, fixed: "right" }
  ];
  if (!props.projectKey) {
    cols.splice(10, 0, { prop: "project_key", label: "Project", width: 130 });
  }
  return cols;
});

interface IssueForm {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  issue_type: IssueType;
  assignee: string;
  start_date: string;
  due_date: string;
  project_key: string;
  source: string;
  review_status: string;
  acceptance_criteria: string;
}

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    title: "",
    description: "",
    status: "todo" as IssueStatus,
    priority: "medium" as IssuePriority,
    issue_type: "task" as IssueType,
    assignee: "",
    start_date: "",
    due_date: "",
    project_key: props.projectKey || "",
    source: "",
    review_status: "",
    acceptance_criteria: ""
  } as IssueForm
});

async function fetchIssues(params: any) {
  const { pageNum, pageSize, ...filters } = params;
  const merged: any = { pageNum, pageSize, project_key: props.projectKey, ...filters };
  if (labelFilter.value) merged.labels = labelFilter.value;
  // Apply quick filter
  const now = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  if (activeFilter.value === "my") merged.assignee = "admin";
  else if (activeFilter.value === "open") merged.status = "todo,in_progress";
  else if (activeFilter.value === "high") merged.priority = "urgent,high";
  else if (activeFilter.value === "week") { merged.due_date_start = now; merged.due_date_end = weekEnd; }
  else if (activeFilter.value === "done") { merged.status = "done"; merged.orderBy = "updated_at"; }
  else if (activeFilter.value === "todo") merged.status = "todo";
  else if (activeFilter.value === "in_progress") merged.status = "in_progress";
  else if (activeFilter.value === "in_review") merged.status = "in_review";
  else if (activeFilter.value === "backlog") merged.status = "backlog";
  else if (activeFilter.value === "cancelled") merged.status = "cancelled";

  const res = await getIssueList(merged);
  const list = res.data?.list ?? [];
  const total = res.data?.total ?? 0;
  // Keep the store in sync so CSV/JSON export have data to export.
  store.issues = list;
  store.total = total;
  return res;
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    issue_type: "task",
    assignee: "",
    start_date: "",
    due_date: "",
    project_key: props.projectKey || "",
    source: "",
    review_status: "",
    acceptance_criteria: ""
  };
  dialog.visible = true;
}

function openEdit(issue: Issue) {
  dialog.isEdit = true;
  dialog.editKey = issue.key;
  dialog.form = {
    title: issue.title,
    description: issue.description || "",
    status: issue.status,
    priority: issue.priority,
    issue_type: issue.issue_type,
    assignee: issue.assignee || "",
    start_date: issue.start_date || "",
    due_date: issue.due_date || "",
    project_key: issue.project_key,
    source: issue.source || "",
    review_status: issue.review_status || "",
    acceptance_criteria: issue.acceptance_criteria || ""
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editIssue(dialog.editKey, {
        title: dialog.form.title,
        description: dialog.form.description,
        status: dialog.form.status,
        priority: dialog.form.priority,
        issue_type: dialog.form.issue_type,
        assignee: dialog.form.assignee,
        start_date: dialog.form.start_date,
        due_date: dialog.form.due_date,
        source: (dialog.form.source || undefined) as any,
        review_status: (dialog.form.review_status || undefined) as any,
        acceptance_criteria: dialog.form.acceptance_criteria || undefined
      });
      ElMessage.success("Issue updated");
    } else {
      const key = `ISS-${Date.now().toString(36).toUpperCase()}`;
      await store.addIssue({
        key,
        project_key: dialog.form.project_key || props.projectKey || "",
        sequence_id: Date.now(),
        title: dialog.form.title,
        description: dialog.form.description,
        status: dialog.form.status,
        priority: dialog.form.priority,
        issue_type: dialog.form.issue_type,
        assignee: dialog.form.assignee,
        labels: [],
        start_date: dialog.form.start_date,
        due_date: dialog.form.due_date,
        source: (dialog.form.source || undefined) as any,
        review_status: (dialog.form.review_status || undefined) as any,
        acceptance_criteria: dialog.form.acceptance_criteria || undefined
      });
      ElMessage.success("Issue created");
    }
    dialog.visible = false;
    proTable.value?.getTableList();
  } finally {
    dialog.submitting = false;
  }
}

function handleDelete(row: Issue) {
  useHandleData(store.removeIssue, { key: row.key, project_key: props.projectKey }, `Delete issue "${row.title}"`).then(() => {
    proTable.value?.getTableList();
  });
}

function batchDelete(ids: (string | number)[]) {
  ElMessageBox.confirm(`Delete ${ids.length} selected issues?`, "Bulk Delete", {
    confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error"
  }).then(async () => {
    for (const id of ids) {
      try { await store.removeIssue(String(id)); } catch { /* continue */ }
    }
    ElMessage.success(`${ids.length} issues deleted`);
    proTable.value?.getTableList();
  }).catch(() => {});
}

async function bulkChangeStatus(scope: any, status: string) {
  const ids = scope.selectedListIds || [];
  if (!ids.length) return;
  for (const id of ids) {
    try { await store.editIssue(String(id), { status: status as IssueStatus }); } catch { /* continue */ }
  }
  ElMessage.success(`${ids.length} issues → ${ISSUE_STATUS_MAP[status as IssueStatus]}`);
  proTable.value?.getTableList();
}

function openBatchAssign(scope: any) {
  ElMessageBox.prompt("Enter assignee name", "Batch Assign", {
    confirmButtonText: "Assign",
    inputPlaceholder: "Assignee name"
  }).then(async ({ value }) => {
    if (!value) return;
    const ids = scope.selectedListIds || [];
    for (const id of ids) {
      try { await store.editIssue(String(id), { assignee: value }); } catch { /* continue */ }
    }
    ElMessage.success(`${ids.length} issues assigned to "${value}"`);
    proTable.value?.getTableList();
  }).catch(() => {});
}

function exportCSV() {
  const rows = store.issues;
  if (!rows.length) return ElMessage.warning("No data to export");
  const headers = ["Title", "Type", "Status", "Priority", "Assignee", "Due Date", "Project"];
  const csvRows = [headers.join(",")];
  rows.forEach(r => {
    csvRows.push([r.title, r.issue_type, r.status, r.priority, r.assignee || "", r.due_date || "", r.project_key]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  });
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "issues-export.csv"; a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("CSV exported");
}

function exportJSON() {
  const rows = store.issues;
  if (!rows.length) return ElMessage.warning("No data to export");
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "issues-export.json"; a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("JSON exported");
}

function goDetail(key: string) {
  router.push(`/issue/${key}`);
}

async function copyKey(key: string) {
  try {
    await navigator.clipboard.writeText(key);
    ElMessage.success(`Copied ${key}`);
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

function statusLabel(status: IssueStatus) { return ISSUE_STATUS_MAP[status] || status; }
function priorityLabel(p: IssuePriority) { return ISSUE_PRIORITY_MAP[p] || p; }

function statusTagType(status: IssueStatus): TagType {
  return ISSUE_STATUS_TAG_MAP[status] || "info";
}
function priorityColor(p: IssuePriority) {
  const map: Record<IssuePriority, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return map[p] || "#909399";
}
function typeTagType(t: IssueType): TagType { return ISSUE_TYPE_TAG_MAP[t] || "info"; }
function sourceLabel(s: IssueSource) { return ISSUE_SOURCE_MAP[s] || s; }
function reviewLabel(s: ReviewStatus) { return REVIEW_STATUS_MAP[s] || s; }
function reviewTagType(s: ReviewStatus): TagType {
  const m: Record<ReviewStatus, TagType> = { pending: "info", approved: "success", rejected: "danger", in_review: "warning" };
  return m[s] || "info";
}

onMounted(async () => {
  const initialLabel = route.query.label;
  if (typeof initialLabel === "string" && initialLabel) labelFilter.value = initialLabel;
  if (!props.projectKey) {
    await Promise.all([loadStats(), loadNames()]);
  }
});
</script>

<style scoped lang="scss">
.issue-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}
.issue-list__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.issue-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.issue-summary__tile--clickable {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
    transform: translateY(-2px);
  }
}
.issue-summary__value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.issue-summary__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-summary__sub {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.issue-summary__tile--todo .issue-summary__value { color: var(--el-color-info); }
.issue-summary__tile--progress .issue-summary__value { color: var(--el-color-primary); }
.issue-summary__tile--review .issue-summary__value { color: var(--el-color-warning); }
.issue-summary__tile--done .issue-summary__value { color: var(--el-color-success); }
.issue-summary__tile--backlog .issue-summary__value { color: #8b5cf6; }
.issue-summary__tile--cancelled .issue-summary__value { color: var(--el-color-danger); }
.issue-summary__tile--completion .issue-summary__value { color: var(--el-color-danger); }
.issue-list__filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.issue-list__label-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 6px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list__title {
  font-weight: 500;
  justify-content: flex-start;
  padding: 0;
  white-space: normal;
}
.issue-list__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.issue-list__muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
.issue-list__source {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list__key {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.issue-list__updated {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.issue-list__points {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 999px;
}
.issue-list__start {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.issue-list__link-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &--cycle:hover { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &--release:hover { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &--module:hover { color: #9b59b6; background: #f3e8fb; }
}
.issue-list__modules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.issue-list__due--overdue {
  color: var(--el-color-danger);
  font-weight: 600;
  font-size: 12px;
}
.issue-list__due--soon {
  color: var(--el-color-warning);
  font-weight: 500;
  font-size: 12px;
}
</style>
