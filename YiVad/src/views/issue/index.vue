<template>
  <div class="issue-list">
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
      <template #issue_type="scope">
        <el-tag :type="typeTagType(scope.row.issue_type)" size="small" effect="plain">
          {{ typeLabel(scope.row.issue_type) }}
        </el-tag>
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
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
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
import type { Issue, IssueStatus, IssuePriority, IssueType, TagType } from "@/api/modules/issueService";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { useHandleData } from "@/hooks/useHandleData";

const props = defineProps<{ projectKey?: string }>();

const router = useRouter();
const store = useIssueStore();
const proTable = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const activeFilter = ref("");

const quickFilters = [
  { key: "my", label: "My Issues" },
  { key: "open", label: "Open" },
  { key: "high", label: "High Priority" },
  { key: "week", label: "Due This Week" },
  { key: "done", label: "Recently Done" }
];

function applyQuickFilter(key: string) {
  activeFilter.value = key === activeFilter.value ? "" : key;
  // Reload table with filter applied via fetchIssues
  proTable.value?.getTableList();
}

function clearFilter() {
  activeFilter.value = "";
  proTable.value?.getTableList();
}

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  issue_type: [{ required: true, message: "Type is required", trigger: "change" }],
  priority: [{ required: true, message: "Priority is required", trigger: "change" }],
  status: [{ required: true, message: "Status is required", trigger: "change" }]
};

const columns: ColumnProps<Issue>[] = [
  { type: "selection", width: 50 },
  { type: "index", label: "#", width: 60 },
  { prop: "title", label: "Title", minWidth: 200, search: { el: "input" } },
  { prop: "issue_type", label: "Type", width: 100 },
  { prop: "status", label: "Status", width: 110 },
  { prop: "priority", label: "Priority", width: 90 },
  { prop: "assignee", label: "Assignee", width: 100 },
  { prop: "due_date", label: "Due Date", width: 120 },
  { prop: "sequence_id", label: "ID", width: 100 },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

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
  // Apply quick filter
  const now = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  if (activeFilter.value === "my") merged.assignee = "admin";
  else if (activeFilter.value === "open") merged.status = "todo,in_progress";
  else if (activeFilter.value === "high") merged.priority = "urgent,high";
  else if (activeFilter.value === "week") { merged.due_date_start = now; merged.due_date_end = weekEnd; }
  else if (activeFilter.value === "done") { merged.status = "done"; merged.orderBy = "updated_at"; }

  const res = await getIssueList(merged);
  return { list: res.data?.list ?? [], total: res.data?.total ?? 0 };
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
</script>

<style scoped lang="scss">
.issue-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}
.issue-list__filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>