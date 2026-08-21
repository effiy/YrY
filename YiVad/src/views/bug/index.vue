<template>
  <div class="bug-list">
    <div class="bug-list__filters">
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
      title="Bugs"
      :columns="columns"
      :request-api="fetchBugs"
      :pagination="true"
    >
      <template #tableHeader="scope">
        <el-button type="primary" :icon="Plus" @click="store.openCreateDialog()">New Bug</el-button>
        <el-button
          :disabled="!scope.isSelected"
          type="danger"
          plain
          :icon="Delete"
          @click="batchDelete(scope.selectedListIds)"
        >Delete Selected</el-button>
      </template>

      <template #severity="scope">
        <el-tag :type="severityTagType(scope.row.severity)" size="small">
          {{ scope.row.severity }}
        </el-tag>
      </template>

      <template #priority="scope">
        <el-tag :type="priorityTagType(scope.row.priority)" size="small">
          {{ scope.row.priority }}
        </el-tag>
      </template>

      <template #status="scope">
        <el-tag :type="statusTagType(scope.row.status)" size="small">
          {{ scope.row.status }}
        </el-tag>
      </template>

      <template #type="scope">
        <el-tag type="info" size="small" effect="plain">
          {{ scope.row.type }}
        </el-tag>
      </template>

      <template #updatedAt="scope">
        {{ formatDate(scope.row.updatedAt) }}
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="goDetail(scope.row.key)">View</el-button>
        <el-button type="primary" link :icon="Edit" @click="openEdit(scope.row)">Edit</el-button>
        <el-button type="danger" link :icon="Delete" @click="store.handleDelete(scope.row).then(() => proTable?.getTableList())">Delete</el-button>
      </template>
    </ProTable>

    <!-- Create/Edit Dialog (managed by store) -->
    <el-dialog
      v-model="store.dialogVisible"
      :title="store.isEdit ? 'Edit Bug' : 'New Bug'"
      width="700px"
      destroy-on-close
      @closed="store.resetForm()"
    >
      <el-form ref="formRef" :model="store.form" :rules="rules" label-width="110px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="store.form.title" placeholder="Bug title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Severity" prop="severity">
              <el-select v-model="store.form.severity" style="width: 100%">
                <el-option v-for="v in severities" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Priority" prop="priority">
              <el-select v-model="store.form.priority" style="width: 100%">
                <el-option v-for="v in priorities" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Status" prop="status">
              <el-select v-model="store.form.status" style="width: 100%">
                <el-option v-for="v in statuses" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Type" prop="type">
              <el-select v-model="store.form.type" style="width: 100%">
                <el-option v-for="v in types" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Frequency" prop="frequency">
              <el-select v-model="store.form.frequency" style="width: 100%">
                <el-option v-for="v in frequencies" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Environment">
              <el-input v-model="store.form.environment" placeholder="e.g. production" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Project">
              <el-input v-model="store.form.project" placeholder="Project name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Module">
              <el-input v-model="store.form.module" placeholder="Module name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Assignee">
              <el-input v-model="store.form.assignee" placeholder="Assignee" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Reporter">
              <el-input v-model="store.form.reporter" placeholder="Reporter" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Affected Version">
              <el-input v-model="store.form.affectedVersion" placeholder="e.g. 1.0.0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fixed Version">
              <el-input v-model="store.form.fixedVersion" placeholder="e.g. 1.0.1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description">
          <el-input v-model="store.form.description" type="textarea" :rows="3" placeholder="Bug description" />
        </el-form-item>
        <el-form-item label="Steps to Reproduce">
          <el-input v-model="store.form.stepsToReproduce" type="textarea" :rows="3" placeholder="One step per line" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Expected Result">
              <el-input v-model="store.form.expectedResult" type="textarea" :rows="2" placeholder="What should happen" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Actual Result">
              <el-input v-model="store.form.actualResult" type="textarea" :rows="2" placeholder="What actually happened" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Root Cause">
              <el-input v-model="store.form.causeProblem" type="textarea" :rows="2" placeholder="Technical root cause" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Solution">
              <el-input v-model="store.form.solution" type="textarea" :rows="2" placeholder="How it was fixed" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="store.dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="store.saving" @click="handleSave">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="bugList">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Delete, View, Edit } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useBugStore } from "@/stores/modules/bug";
import { getBugList, readBugContent } from "@/api/modules/bug";
import type { BugDocument, BugSeverity, BugPriority, BugStatus, BugType, BugFrequency } from "@/api/modules/bug";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";

const router = useRouter();
const store = useBugStore();
const proTable = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const activeFilter = ref("");

const severities: BugSeverity[] = ["critical", "major", "minor", "trivial"];
const priorities: BugPriority[] = ["p0", "p1", "p2", "p3"];
const statuses: BugStatus[] = ["open", "in_progress", "resolved", "closed", "rejected", "reopened"];
const types: BugType[] = ["functional", "performance", "ui", "security", "compatibility", "regression", "data", "other"];
const frequencies: BugFrequency[] = ["always", "sometimes", "rarely", "once", "unable"];

const quickFilters = [
  { key: "open", label: "Open" },
  { key: "critical", label: "Critical" },
  { key: "p0p1", label: "P0/P1" },
  { key: "mine", label: "My Bugs" },
  { key: "recent", label: "Recent" }
];

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  severity: [{ required: true, message: "Severity is required", trigger: "change" }],
  priority: [{ required: true, message: "Priority is required", trigger: "change" }],
  status: [{ required: true, message: "Status is required", trigger: "change" }],
  type: [{ required: true, message: "Type is required", trigger: "change" }],
  frequency: [{ required: true, message: "Frequency is required", trigger: "change" }]
};

const columns: ColumnProps<BugDocument>[] = [
  { type: "selection", width: 50 },
  { type: "index", label: "#", width: 60 },
  { prop: "title", label: "Title", minWidth: 200, search: { el: "input" } },
  { prop: "severity", label: "Severity", width: 100 },
  { prop: "priority", label: "Priority", width: 90 },
  { prop: "status", label: "Status", width: 110 },
  { prop: "type", label: "Type", width: 110 },
  { prop: "project", label: "Project", width: 120, search: { el: "input" } },
  { prop: "module", label: "Module", width: 120, search: { el: "input" } },
  { prop: "assignee", label: "Assignee", width: 100 },
  { prop: "updatedAt", label: "Updated", width: 160 },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

function applyQuickFilter(key: string) {
  activeFilter.value = key === activeFilter.value ? "" : key;
  proTable.value?.getTableList();
}

function clearFilter() {
  activeFilter.value = "";
  proTable.value?.getTableList();
}

async function fetchBugs(params: any) {
  const { pageNum, pageSize, ...filters } = params;
  const merged: any = { pageNum, pageSize };

  // Apply search filters from ProTable
  if (filters.title) merged.title = filters.title;
  if (filters.project) merged.project = filters.project;
  if (filters.module) merged.module = filters.module;

  // Apply quick filter
  if (activeFilter.value === "open") merged.status = "open";
  else if (activeFilter.value === "critical") merged.severity = "critical";
  else if (activeFilter.value === "mine") merged.assignee = "admin";

  const res = await getBugList(merged);
  return { list: res.data?.list ?? [], total: res.data?.total ?? 0 };
}

async function openEdit(bug: BugDocument) {
  let content = null;
  try {
    if (bug.contentPath) content = await readBugContent(bug.contentPath);
  } catch { /* use empty content */ }
  store.openEditDialog(bug, content);
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  await store.handleSave();
  proTable.value?.getTableList();
}

function batchDelete(ids: string[]) {
  if (!ids.length) return;
  ElMessageBox.confirm(`Delete ${ids.length} selected bugs?`, "Batch Delete", { type: "warning" })
    .then(async () => {
      for (const id of ids) {
        await store.handleDelete({ key: id } as BugDocument);
      }
      ElMessage.success(`Deleted ${ids.length} bugs`);
      proTable.value?.getTableList();
    })
    .catch(() => {});
}

function goDetail(key: string) {
  router.push(`/bug/${key}`);
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("zh-CN");
}

function severityTagType(s: BugSeverity): "danger" | "warning" | "info" {
  const map: Record<BugSeverity, "danger" | "warning" | "info"> = { critical: "danger", major: "warning", minor: "info", trivial: "info" };
  return map[s];
}

function priorityTagType(p: BugPriority): "danger" | "warning" | "info" {
  const map: Record<BugPriority, "danger" | "warning" | "info"> = { p0: "danger", p1: "warning", p2: "info", p3: "info" };
  return map[p];
}

function statusTagType(s: BugStatus): "primary" | "warning" | "success" | "info" | "danger" {
  const map: Record<BugStatus, "primary" | "warning" | "success" | "info" | "danger"> = {
    open: "primary", in_progress: "warning", resolved: "success",
    closed: "info", rejected: "danger", reopened: "warning"
  };
  return map[s] || "info";
}
</script>

<style scoped lang="scss">
.bug-list {
  &__filters {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
}
</style>