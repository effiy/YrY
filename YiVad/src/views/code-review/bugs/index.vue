<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getBugList"
      :init-param="initParam"
      :data-callback="dataCallback"
      :height="tableHeight"
      @search="syncSearchToUrl"
      @reset="clearSearchUrl"
    >
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('Add')">New Bug <kbd class="cr-bugs-kbd">N</kbd></el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          Batch Delete <el-badge v-if="scope.selectedList.length" :value="scope.selectedList.length" class="batch-badge" />
        </el-button>
        <span class="cr-bugs-hint">
          <kbd>/</kbd> search · <kbd>S</kbd> status · <kbd>P</kbd> priority · <kbd>T</kbd> type · <kbd>?</kbd> help
        </span>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="toDetail(scope.row)" />
        <el-button type="primary" link :icon="ChatDotRound" @click="discussInAiChat(scope.row)" />
        <el-button type="primary" link @click="viewRelatedAiChatSessions(scope.row)" title="View related AI Chat sessions">Sessions</el-button>
        <el-button type="primary" link :icon="EditPen" @click="openDrawer('Edit', scope.row)" />
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)" />
      </template>
    </ProTable>
    <BugDrawer ref="drawerRef" />

    <el-dialog
      v-model="showShortcuts"
      title="Keyboard shortcuts"
      width="420px"
      append-to-body
      class="cr-bugs-shortcuts"
    >
      <ul class="cr-bugs-shortcut-list">
        <li><kbd>N</kbd><span>Create a new bug</span></li>
        <li><kbd>/</kbd><span>Focus the search form</span></li>
        <li><kbd>S</kbd><span>Cycle status filter (open → in_progress → … → cleared)</span></li>
        <li><kbd>P</kbd><span>Cycle priority filter (P0 → P1 → P2 → P3 → cleared)</span></li>
        <li><kbd>T</kbd><span>Cycle type filter (functional → performance → … → cleared)</span></li>
        <li><kbd>Esc</kbd><span>Close this dialog</span></li>
        <li><kbd>?</kbd><span>Show this help</span></li>
      </ul>
      <template #footer>
        <el-button type="primary" @click="showShortcuts = false">Got it</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="crBugsList">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Delete, EditPen, View, CirclePlus, ChatDotRound } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useHandleData } from "@/hooks/useHandleData";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
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
import { PROJECTS, PROJECT_LABELS } from "@/config";
import { formatRelativeTime } from "@/utils/datetime";

const router = useRouter();
const route = useRoute();
const proTable = ref<ProTableInstance>();
const showShortcuts = ref(false);

const tableHeight = ref(0);
const updateTableHeight = () => {
  // viewport - header(55) - tabs(40) - table-box padding(20) - search(74) - toolbar(47) - pagination(52)
  tableHeight.value = Math.max(200, window.innerHeight - 288);
};
onMounted(() => {
  updateTableHeight();
  window.addEventListener("resize", updateTableHeight);
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateTableHeight);
  window.removeEventListener("keydown", onKeydown);
});

function focusSearch() {
  // Focus the first input in the ProTable search form
  const form = document.querySelector(".table-box .el-form");
  const input = form?.querySelector("input.el-input__inner") as HTMLInputElement | null;
  input?.focus();
  input?.select?.();
}

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName;
  const inInput = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true;
  if (inInput) return;
  // Esc closes the shortcuts dialog when open (overlays otherwise remain guarded)
  if (e.key === "Escape" && showShortcuts.value) {
    e.preventDefault();
    showShortcuts.value = false;
    return;
  }
  // skip when the edit drawer or any dialog is open
  const inOverlay = !!document.querySelector(".el-dialog:not(.is-hidden), .el-drawer:not(.is-hide), .el-select-dropdown:not([style*='display: none'])");
  if (inOverlay) return;
  if (e.key === "?") {
    e.preventDefault();
    showShortcuts.value = true;
    return;
  }
  if (e.key === "/") {
    e.preventDefault();
    focusSearch();
    return;
  }
  if (e.key.toLowerCase() === "n") {
    e.preventDefault();
    openDrawer("Add");
    return;
  }
  if (e.key.toLowerCase() === "s") {
    e.preventDefault();
    cycleStatusFilter();
    return;
  }
  if (e.key.toLowerCase() === "p") {
    e.preventDefault();
    cyclePriorityFilter();
    return;
  }
  if (e.key.toLowerCase() === "t") {
    e.preventDefault();
    cycleTypeFilter();
  }
}

const STATUS_CYCLE: BugStatus[] = ["open", "in_progress", "resolved", "closed", "rejected", "reopened"];
const PRIORITY_CYCLE: BugPriority[] = ["p0", "p1", "p2", "p3"];
const TYPE_CYCLE: BugType[] = ["functional", "performance", "ui", "security", "compatibility", "regression", "data", "other"];

function cycleEnumFilter<T extends string>(field: string, values: T[]): void {
  const sp = proTable.value?.searchParam;
  if (!sp) return;
  const label = field.charAt(0).toUpperCase() + field.slice(1);
  const current = sp[field] as T | undefined;
  const idx = current ? values.indexOf(current) : -1;
  const next = idx < 0 || idx >= values.length - 1
    ? undefined
    : values[idx + 1];
  if (next === undefined) {
    delete sp[field];
    ElMessage.info({ message: `${label} filter cleared`, duration: 1500 });
  } else {
    sp[field] = next;
    ElMessage.info({ message: `${label}: ${next}`, duration: 1500 });
  }
  proTable.value?.search();
}

function cycleStatusFilter(): void {
  cycleEnumFilter<BugStatus>("status", STATUS_CYCLE);
}

function cyclePriorityFilter(): void {
  cycleEnumFilter<BugPriority>("priority", PRIORITY_CYCLE);
}

function cycleTypeFilter(): void {
  cycleEnumFilter<BugType>("type", TYPE_CYCLE);
}

const initParam = reactive({
  ...(typeof route.query.project === "string" && route.query.project ? { project: route.query.project } : {}),
  ...(typeof route.query.module === "string" && route.query.module ? { module: route.query.module } : {})
});

const dataCallback = (data: any) => {
  return { list: data.list, total: data.total };
};

// URL ↔ search state sync — shareable filtered URLs, refresh restores filters.
const URL_KEYS = ["title", "project", "module", "status", "priority", "severity", "type", "assignee"] as const;
function syncSearchToUrl() {
  const sp = proTable.value?.searchParam ?? {};
  const next: Record<string, string> = {};
  for (const k of URL_KEYS) {
    const v = sp[k];
    if (typeof v === "string" && v) next[k] = v;
  }
  const cur = route.query;
  const curPicked: Record<string, string> = {};
  for (const k of URL_KEYS) {
    const v = cur[k];
    if (typeof v === "string" && v) curPicked[k] = v;
  }
  if (JSON.stringify(curPicked) !== JSON.stringify(next)) {
    router.replace({ query: next });
  }
}
function clearSearchUrl() {
  if (Object.keys(route.query).length) router.replace({ query: {} });
}

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

const projectOptions = (() => {
  const opts: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  for (const p of PROJECTS) {
    const label = PROJECT_LABELS[p] ?? p;
    if (!seen.has(p)) { opts.push({ label, value: p }); seen.add(p); }
    // Also support legacy capitalized values for existing data
    if (label !== p && !seen.has(label)) { opts.push({ label, value: label }); seen.add(label); }
  }
  return opts;
})();
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
  { type: "selection", fixed: "left", width: 48 },
  {
    prop: "title",
    label: "Title",
    search: { el: "input", tooltip: "Search title or module" },
    minWidth: 200,
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
    width: 90
  },
  {
    prop: "module",
    label: "Module",
    search: { el: "input" },
    width: 120
  },
  {
    prop: "severity",
    label: "Severity",
    enum: severityOptions,
    search: { el: "select" },
    width: 90,
    render: scope => <el-tag type={severityTag[scope.row.severity] || undefined}>{scope.row.severity}</el-tag>
  },
  {
    prop: "priority",
    label: "Priority",
    enum: priorityOptions,
    search: { el: "select" },
    width: 80,
    render: scope => <el-tag type={priorityTag[scope.row.priority] || undefined}>{scope.row.priority}</el-tag>
  },
  {
    prop: "status",
    label: "Status",
    enum: statusOptions,
    search: { el: "select" },
    width: 100,
    render: scope => <el-tag type={statusTag[scope.row.status] || undefined}>{scope.row.status}</el-tag>
  },
  {
    prop: "type",
    label: "Type",
    enum: typeOptions,
    width: 100,
    search: { el: "select" }
  },
  {
    prop: "assignee",
    label: "Assignee",
    search: { el: "input" },
    width: 90
  },
  { prop: "reporter", label: "Reporter", width: 90 },
  { prop: "affectedVersion", label: "Affected Ver.", width: 100 },
  {
    prop: "updatedAt",
    label: "Updated",
    width: 140,
    render: scope => {
      const ts = scope.row.updatedAt;
      if (!ts) return <span class="cr-bugs-empty">—</span>;
      const abs = new Date(ts).toLocaleString();
      const iso = new Date(ts).toISOString();
      const onCopy = (e: MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(iso).then(
          () => ElMessage.success({ message: "Timestamp copied", duration: 1200 }),
          () => ElMessage.warning("Copy failed")
        );
      };
      return (
        <el-tooltip content={`${abs} · click to copy ISO`} placement="top" show-after={300}>
          <span class="cr-bugs-relative cr-bugs-copyable" onClick={onCopy}>{formatRelativeTime(ts)}</span>
        </el-tooltip>
      );
    }
  },
  { prop: "operation", label: "Actions", fixed: "right", width: 120 }
]);

const toDetail = (row: BugDocument) => {
  router.push(`/code-review/bugs/detail/${row.key}`);
};

const { openInAiChat, linkToAiChatByTag } = useAiChatBridge();

async function discussInAiChat(row: BugDocument) {
  const pageContent = [
    `# ${row.title || row.key}`,
    "",
    `**Project:** ${(PROJECT_LABELS[row.project] ?? row.project) || "-"}`,
    `**Severity:** ${row.severity || "-"}`,
    `**Priority:** ${row.priority || "-"}`,
    `**Status:** ${row.status || "-"}`,
    `**Module:** ${row.module || "-"}`,
    "",
    "## Description",
    "",
    row.description || "_(no description)_"
  ].join("\n");
  await openInAiChat({
    title: `Bug: ${row.title || row.key}`,
    pageContent,
    tags: [`ctx:code-review/bugs/${row.key}`, "code-review", "bug", `bug:${row.key}`],
    sourceUrl: `/code-review/bugs/detail/${row.key}?mode=view`
  });
}

function viewRelatedAiChatSessions(row: BugDocument) {
  if (!row?.key) return;
  router.push(linkToAiChatByTag(`bug:${row.key}`));
}

const handleDelete = async (row: BugDocument) => {
  const ok = await useHandleData(deleteBug, row.key, `Delete bug "${row.title}"`);
  if (ok) proTable.value?.getTableList();
};

const batchDelete = async (ids: string[]) => {
  if (!ids.length) return;
  try {
    await ElMessageBox.confirm(
      `Delete ${ids.length} selected bug${ids.length > 1 ? "s" : ""}? This cannot be undone.`,
      "Batch Delete",
      { type: "warning", confirmButtonText: "Delete", cancelButtonText: "Cancel" }
    );
  } catch { return; }
  const results = await Promise.allSettled(ids.map(id => deleteBug(id)));
  const done = results.filter(r => r.status === "fulfilled").length;
  const failed = results.length - done;
  if (failed === 0) {
    ElMessage.success(`Deleted ${done} bug${done > 1 ? "s" : ""}`);
  } else {
    ElMessage.warning(`Deleted ${done}, ${failed} failed`);
  }
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

<style scoped lang="scss">
.table-box {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 95px);
  padding: 10px 12px;
  overflow: hidden;
}

.batch-badge {
  margin-left: 6px;
  :deep(.el-badge__content) {
    transform: translateY(-2px) scale(0.9);
  }
}

.cr-bugs-kbd {
  display: inline-block;
  min-width: 14px;
  padding: 0 5px;
  margin-left: 6px;
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 3px;
  line-height: 16px;
}

.cr-bugs-hint {
  margin-left: auto;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  kbd {
    display: inline-block;
    min-width: 14px;
    padding: 0 5px;
    font-family: "SF Mono", "Menlo", monospace;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 3px;
    line-height: 16px;
  }
}

.cr-bugs-relative {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
  cursor: default;
}

.cr-bugs-copyable {
  cursor: pointer;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:hover {
    color: var(--el-color-primary);
    border-bottom-color: var(--el-color-primary-light-5);
  }
}

.cr-bugs-empty {
  color: var(--el-text-color-placeholder);
}

.cr-bugs-shortcut-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    border-bottom: 1px dashed var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }
    span { font-size: 14px; color: var(--el-text-color-regular); }
  }
  kbd {
    display: inline-block;
    min-width: 28px;
    padding: 2px 8px;
    font-family: "SF Mono", "Menlo", monospace;
    font-size: 12px;
    text-align: center;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    box-shadow: 0 1px 0 var(--el-border-color-light);
  }
}
</style>
