<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getBugList"
      :init-param="initParam"
      :data-callback="dataCallback"
    >
      <template #tableHeader></template>
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="toDetail(scope.row)" />
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('Edit', scope.row)" />
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)" />
      </template>
    </ProTable>
    <BugDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="crBugsList">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { useHandleData } from "@/hooks/useHandleData";
import BugDrawer from "./components/BugDrawer.vue";
import {
  getBugList,
  createBug,
  updateBug,
  deleteBug,
  readBugContent
} from "@/api/modules/bug";
import type {
  BugDocument,
  BugSeverity,
  BugPriority,
  BugStatus,
  BugType,
  BugFrequency
} from "@/api/modules/bug";
import { PROJECTS } from "@/config";

const router = useRouter();
const proTable = ref<ProTableInstance>();

const initParam = reactive({});

const dataCallback = (data: any) => {
  return { list: data.list, total: data.total };
};

type TagType = "danger" | "warning" | "info" | "primary" | "success" | "";

const severityTag: Record<BugSeverity, TagType> = {
  critical: "danger",
  major: "warning",
  minor: "info",
  trivial: ""
};
const priorityTag: Record<BugPriority, TagType> = {
  p0: "danger",
  p1: "warning",
  p2: "info",
  p3: ""
};
const statusTag: Record<BugStatus, TagType> = {
  open: "warning",
  in_progress: "primary",
  resolved: "success",
  closed: "info",
  rejected: "danger",
  reopened: "danger"
};

const projectOptions = PROJECTS.map(p => ({ label: p, value: p }));
const severityOptions: { label: string; value: BugSeverity }[] = [
  { label: "Critical", value: "critical" },
  { label: "Major", value: "major" },
  { label: "Minor", value: "minor" },
  { label: "Trivial", value: "trivial" }
];
const priorityOptions: { label: string; value: BugPriority }[] = [
  { label: "P0", value: "p0" },
  { label: "P1", value: "p1" },
  { label: "P2", value: "p2" },
  { label: "P3", value: "p3" }
];
const statusOptions: { label: string; value: BugStatus }[] = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" },
  { label: "Reopened", value: "reopened" }
];
const typeOptions: { label: string; value: BugType }[] = [
  { label: "Functional", value: "functional" },
  { label: "Performance", value: "performance" },
  { label: "UI", value: "ui" },
  { label: "Security", value: "security" },
  { label: "Compatibility", value: "compatibility" },
  { label: "Regression", value: "regression" },
  { label: "Data", value: "data" },
  { label: "Other", value: "other" }
];

type DrawerRow = Omit<
  Partial<BugDocument>,
  "stepsToReproduce" | "dueDate" | "contentPath" | "createdAt" | "updatedAt" | "resolvedAt" | "closedAt"
> & {
  stepsToReproduce?: string;
  description?: string;
  expectedResult?: string;
  actualResult?: string;
  causeProblem?: string;
  solution?: string;
  dueDate: number | null;
};

function rowToDrawer(
  row: Partial<BugDocument>,
  content?: {
    description?: string;
    stepsToReproduce?: string[];
    expectedResult?: string;
    actualResult?: string;
    causeProblem?: string;
    solution?: string;
  }
): DrawerRow {
  return {
    key: row.key || `bug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: row.title ?? "",
    project: row.project ?? "",
    module: row.module ?? "",
    iteration: row.iteration ?? "",
    defectUrl: row.defectUrl ?? "",
    severity: row.severity ?? "minor",
    priority: row.priority ?? "p2",
    status: row.status ?? "open",
    type: row.type ?? "functional",
    assignee: row.assignee ?? "",
    reporter: row.reporter ?? "",
    environment: row.environment ?? "",
    affectedVersion: row.affectedVersion ?? "",
    fixedVersion: row.fixedVersion ?? "",
    frequency: (row.frequency ?? "sometimes") as BugFrequency,
    tags: [...(row.tags ?? [])],
    dueDate: row.dueDate ?? null,
    description: content?.description ?? "",
    stepsToReproduce: content?.stepsToReproduce ? content.stepsToReproduce.join("\n") : "",
    expectedResult: content?.expectedResult ?? "",
    actualResult: content?.actualResult ?? "",
    causeProblem: content?.causeProblem ?? "",
    solution: content?.solution ?? ""
  };
}

function payloadFromDrawer(params: any) {
  const {
    key,
    stepsToReproduce,
    dueDate,
    description,
    expectedResult,
    actualResult,
    causeProblem,
    solution,
    ...meta
  } = params;
  const steps = String(stepsToReproduce ?? "")
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);
  return {
    meta: { ...meta, key, dueDate: dueDate ? Number(dueDate) : null },
    content: { description, stepsToReproduce: steps, expectedResult, actualResult, causeProblem, solution }
  };
}

const columns = reactive<ColumnProps<BugDocument>[]>([
  { type: "selection", fixed: "left", width: 70 },
  {
    prop: "title",
    label: "Title",
    search: { el: "input", tooltip: "Search title or module" },
    minWidth: 520,
    render: scope => (
      <el-button type="primary" link onClick={() => toDetail(scope.row)}>
        {scope.row.title}
      </el-button>
    )
  },
  {
    prop: "project",
    label: "Project",
    enum: projectOptions,
    search: { el: "select" },
    width: 120
  },
  {
    prop: "module",
    label: "Module",
    search: { el: "input" },
    width: 180
  },
  {
    prop: "severity",
    label: "Severity",
    enum: severityOptions,
    search: { el: "select" },
    render: scope => <el-tag type={severityTag[scope.row.severity] || undefined}>{scope.row.severity}</el-tag>
  },
  {
    prop: "priority",
    label: "Priority",
    enum: priorityOptions,
    search: { el: "select" },
    render: scope => <el-tag type={priorityTag[scope.row.priority] || undefined}>{scope.row.priority}</el-tag>
  },
  {
    prop: "status",
    label: "Status",
    enum: statusOptions,
    search: { el: "select" },
    width: 120,
    render: scope => <el-tag type={statusTag[scope.row.status] || undefined}>{scope.row.status}</el-tag>
  },
  {
    prop: "type",
    label: "Type",
    enum: typeOptions,
    width: 120,
    search: { el: "select" }
  },
  {
    prop: "assignee",
    label: "Assignee",
    search: { el: "input" },
    width: 120
  },
  { prop: "reporter", label: "Reporter", width: 110 },
  { prop: "affectedVersion", label: "Affected Ver.", width: 130 },
  { prop: "updatedAt", label: "Updated At", width: 180 },
  { prop: "operation", label: "Actions", fixed: "right", width: 180 }
]);

const toDetail = (row: BugDocument) => {
  router.push(`/code-review/bugs/detail/${row.key}`);
};

const handleDelete = async (row: BugDocument) => {
  await useHandleData(deleteBug, row.key, `Delete bug "${row.title}"`);
  proTable.value?.getTableList();
};

const drawerRef = ref<InstanceType<typeof BugDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<BugDocument> = {}) => {
  const isEdit = title === "Edit";
  let content:
    | {
        description?: string;
        stepsToReproduce?: string[];
        expectedResult?: string;
        actualResult?: string;
        causeProblem?: string;
        solution?: string;
      }
    | undefined;
  if (isEdit && row.contentPath) {
    try {
      const c = await readBugContent(row.contentPath);
      content = {
        description: c.description,
        stepsToReproduce: c.stepsToReproduce,
        expectedResult: c.expectedResult,
        actualResult: c.actualResult,
        causeProblem: c.causeProblem,
        solution: c.solution
      };
    } catch {
      /* metadata-only edit — content fields stay blank */
    }
  }
  drawerRef.value?.acceptParams({
    title,
    isView: false,
    row: rowToDrawer(row, content),
    api: isEdit
      ? (params: any) => {
          const { meta, content } = payloadFromDrawer(params);
          return updateBug(params.key, meta, content);
        }
      : (params: any) => {
          const { meta, content } = payloadFromDrawer(params);
          return createBug(meta as any, content);
        },
    getTableList: () => proTable.value?.getTableList()
  });
};
</script>
