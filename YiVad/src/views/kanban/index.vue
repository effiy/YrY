<template>
  <div class="kanban">
    <div class="kanban__head">
      <div class="kanban__head-left">
        <KanbanStats
          :total-issues="totalEntries"
          :urgent-count="urgentCount"
          :overdue-count="overdueCount"
          :done-count="doneCount"
          :completion-pct="completionPct"
          @clear-filters="clearFilters"
        />
      </div>
      <div class="kanban__head-right">
        <KanbanSearchBar
          v-model:search="search"
          :filter-date="filterDate"
          :filter-date-label="filterDateLabel"
          :is-filter-today="isFilterToday"
          @search-change="onSearchInput"
          @prev-day="goToPrevDay"
          @next-day="goToNextDay"
          @go-today="goToFilterToday"
          @clear-date="clearFilterDate"
        />
      </div>
    </div>

    <KanbanFilters
      v-if="hasQuickFilters"
      :type-filter="typeFilter"
      :priority-filter="priorityFilter"
      @toggle-type="toggleTypeFilter"
      @toggle-priority="togglePriorityFilter"
    />

    <KanbanProgressBar
      v-if="totalEntries > 0"
      :segments="progressSegments"
    />

    <div v-loading="loading" class="kanban__board">
      <KanbanColumn
        v-for="col in columns"
        :key="col.status"
        :status="col.status"
        :label="col.label"
        :color="col.color"
        :header-bg="col.headerBg"
        :count-tag-type="col.countTagType"
        :issues="col.issues"
        :overdue-count="col.overdueCount"
        @sort="(cmd) => sortColumn(col, cmd)"
        @drag-change="(evt) => onDragChange(evt, col.status)"
        @add="openCreateDialog(col.status)"
      >
        <template #card="{ element }">
          <KanbanCard
            :item="toKanbanItemSource(element)"
            :project-name="projectName(getProjectKey(element))"
            @click="goDetail(element)"
            @title-click="openPreview(element)"
            @goal-click="goGoal(getGoalId(element))"
            @project-click="goProject(getProjectKey(element))"
            @contextmenu="(e: MouseEvent) => openContextMenu(e, element)"
          />
        </template>
      </KanbanColumn>
    </div>

    <KanbanContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @quick-status="ctxQuickStatus"
      @edit-priority="ctxEditPriority"
      @delete="ctxDelete"
    />

    <CreateIssueDialog
      v-model:visible="createDialog.visible"
      :loading="createDialog.loading"
      :default-status="createDialog.defaultStatus"
      @submit="submitCreate"
    />

    <KnowledgePreviewDialog ref="descDialogRef" />
  </div>
</template>

<script setup lang="ts" name="kanbanBoard">
import { onMounted, onUnmounted, reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import { useProjectStore } from "@/stores/modules/project";
import { useBugStore } from "@/stores/modules/bug";
import {
  getIssueList, updateIssue, deleteIssue,
  ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP
} from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";
import {
  getBugList, updateBug, deleteBug,
  BUG_STATUS_TO_ISSUE_STATUS, ISSUE_STATUS_TO_BUG_STATUS,
  BUG_PRIORITY_TO_ISSUE_PRIORITY, ISSUE_PRIORITY_TO_BUG_PRIORITY,
  BUG_STATUS_MAP, BUG_PRIORITY_MAP,
  type BugDocument, type BugStatus, type BugPriority
} from "@/api/modules/bug";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { goalRoleMap } from "@/views/knowledge/executiver/okrData";
import KanbanCard from "./KanbanCard.vue";
import KanbanStats from "./KanbanStats.vue";
import KanbanColumn from "./KanbanColumn.vue";
import type { KanbanColumnItem } from "./KanbanColumn.vue";
import KanbanFilters from "./KanbanFilters.vue";
import KanbanProgressBar from "./KanbanProgressBar.vue";
import KanbanSearchBar from "./KanbanSearchBar.vue";
import KanbanContextMenu from "./KanbanContextMenu.vue";
import CreateIssueDialog from "./CreateIssueDialog.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const issueStore = useIssueStore();
const projectStore = useProjectStore();
const bugStore = useBugStore();

const loading = ref(false);

const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr } = useDateFilter(filterDate);

function goToPrevDay() {
  const d = filterDate.value ? new Date(filterDate.value) : new Date();
  d.setDate(d.getDate() - 1);
  filterDate.value = d;
  loadBoard();
}
function goToNextDay() {
  const d = filterDate.value ? new Date(filterDate.value) : new Date();
  d.setDate(d.getDate() + 1);
  filterDate.value = d;
  loadBoard();
}
function goToFilterToday() {
  filterDate.value = new Date();
  loadBoard();
}
function clearFilterDate() {
  filterDate.value = null;
  loadBoard();
}

const search = ref("");
const typeFilter = ref(new Set<IssueType>());
const priorityFilter = ref(new Set<IssuePriority>());

const hasQuickFilters = computed(() => typeFilter.value.size > 0 || priorityFilter.value.size > 0);

function onSearchInput() {
  loadBoard();
}

function toggleTypeFilter(val: IssueType) {
  if (typeFilter.value.has(val)) typeFilter.value.delete(val);
  else typeFilter.value.add(val);
  typeFilter.value = new Set(typeFilter.value);
  loadBoard();
}

function togglePriorityFilter(val: IssuePriority) {
  if (priorityFilter.value.has(val)) priorityFilter.value.delete(val);
  else priorityFilter.value.add(val);
  priorityFilter.value = new Set(priorityFilter.value);
  loadBoard();
}

const totalEntries = computed(() => columns.reduce((sum, col) => sum + col.issues.length, 0));
const urgentCount = computed(() => columns.reduce((sum, col) => sum + col.issues.filter(i => isUrgent(i)).length, 0));
const overdueCount = computed(() => columns.reduce((sum, col) => sum + col.overdueCount, 0));
const doneCount = computed(() => columns.find(c => c.status === "done")?.issues.length ?? 0);
const completionPct = computed(() => totalEntries.value ? Math.round((doneCount.value / totalEntries.value) * 100) : 0);

function clearFilters() {
  search.value = "";
  typeFilter.value = new Set();
  priorityFilter.value = new Set();
  filterDate.value = null;
  loadBoard();
}

interface Column {
  status: IssueStatus;
  label: string;
  color: string;
  headerBg: string;
  countTagType: "info" | "primary" | "warning" | "success" | "danger";
  issues: KanbanColumnItem[];
  overdueCount: number;
}

const columns = reactive<Column[]>([
  { status: "backlog", label: "Backlog", color: "#909399", headerBg: "var(--kanban-bg-backlog, linear-gradient(180deg, #f0f2f5 0%, #e4e7ed 100%))", countTagType: "info", issues: [], overdueCount: 0 },
  { status: "todo", label: "Todo", color: "#409eff", headerBg: "var(--kanban-bg-todo, linear-gradient(180deg, #ecf5ff 0%, #d9ecff 100%))", countTagType: "primary", issues: [], overdueCount: 0 },
  { status: "in_progress", label: "In Progress", color: "#e6a23c", headerBg: "var(--kanban-bg-progress, linear-gradient(180deg, #fdf6ec 0%, #faecd8 100%))", countTagType: "warning", issues: [], overdueCount: 0 },
  { status: "in_review", label: "In Review", color: "#9b59b6", headerBg: "var(--kanban-bg-review, linear-gradient(180deg, #f5f0ff 0%, #ede0ff 100%))", countTagType: "warning", issues: [], overdueCount: 0 },
  { status: "done", label: "Done", color: "#67c23a", headerBg: "var(--kanban-bg-done, linear-gradient(180deg, #f0f9eb 0%, #e1f3d8 100%))", countTagType: "success", issues: [], overdueCount: 0 }
]);

const progressSegments = computed(() =>
  columns.map(col => ({
    status: col.status,
    label: col.label,
    color: col.color,
    count: col.issues.length,
    width: totalEntries.value === 0 ? 0 : (Math.round((col.issues.length / totalEntries.value) * 100) || 0)
  }))
);

const createDialog = reactive({
  visible: false,
  loading: false,
  defaultStatus: "backlog" as IssueStatus
});

function openCreateDialog(status: IssueStatus) {
  createDialog.defaultStatus = status;
  createDialog.visible = true;
}

interface CreateIssueForm {
  title: string;
  issue_type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  assignee: string;
  due_date: string;
  labels: string[];
  description: string;
}

async function submitCreate(form: CreateIssueForm) {
  if (!form.title.trim()) return;
  createDialog.loading = true;
  try {
    const key = `ISS-${Date.now().toString(36).toUpperCase()}`;
    await issueStore.addIssue({
      key,
      project_key: "default",
      sequence_id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      issue_type: form.issue_type,
      assignee: form.assignee.trim() || "",
      labels: form.labels,
      start_date: "",
      due_date: form.due_date
    });
    ElMessage.success(t("kanban.createDialog.createSuccess"));
    createDialog.visible = false;
    loadBoard();
  } finally {
    createDialog.loading = false;
  }
}

// ── Type guards and accessors for KanbanColumnItem (Issue | BugDocument) ──
function isBug(item: KanbanColumnItem): item is BugDocument {
  return typeof (item as any).issue_type === "undefined" && typeof (item as any).severity !== "undefined";
}

function isIssue(item: KanbanColumnItem): item is Issue {
  return !isBug(item);
}

function getProjectKey(item: KanbanColumnItem): string {
  return isBug(item) ? (item.project_key || "") : item.project_key;
}
function getGoalId(item: KanbanColumnItem): string {
  return isBug(item) ? "" : (item.goal_id || "");
}
function getUpdatedAt(item: KanbanColumnItem): string {
  if (isBug(item)) {
    return item.updatedAt ? new Date(item.updatedAt).toISOString() : "";
  }
  return item.updated_at || "";
}
function getCreatedAt(item: KanbanColumnItem): string {
  if (isBug(item)) {
    return item.createdAt ? new Date(item.createdAt).toISOString() : "";
  }
  return item.created_at || "";
}
function getDueDate(item: KanbanColumnItem): string {
  if (isBug(item)) {
    return item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : "";
  }
  return item.due_date ? item.due_date.slice(0, 10) : "";
}
function getPriority(item: KanbanColumnItem): IssuePriority {
  if (isBug(item)) {
    return BUG_PRIORITY_TO_ISSUE_PRIORITY[(item.priority || "p2") as BugPriority];
  }
  return item.priority;
}
function isUrgent(item: KanbanColumnItem): boolean {
  return getPriority(item) === "urgent";
}

function toKanbanItemSource(element: KanbanColumnItem) {
  return isBug(element)
    ? { kind: "bug" as const, bug: element }
    : { kind: "issue" as const, issue: element };
}

function mapBugToColumnStatus(bug: BugDocument): IssueStatus {
  return BUG_STATUS_TO_ISSUE_STATUS[(bug.status || "open") as BugStatus] || "todo";
}

// ── Preview ──
const descDialogRef = ref<{ openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void } | null>(null);

async function openPreview(item: KanbanColumnItem) {
  if (isBug(item)) {
    const filePath = item.contentPath || "";
    let content = "";
    try {
      if (filePath) {
        const res = await readKnowledgeFile(filePath);
        content = res.content || "";
      }
    } catch { /* use empty */ }
    descDialogRef.value?.openFile({
      path: filePath,
      title: item.title,
      content,
      onSave: async (newContent: string) => {
        if (filePath) {
          await writeKnowledgeFile(filePath, newContent, {
            title: item.title,
            type: "bug",
            status: item.status,
            project: item.project_key,
            severity: item.severity,
            priority: item.priority
          });
        }
      }
    });
    return;
  }
  const date = (item.created_at || "").slice(0, 10);
  const type = item.issue_type || "task";
  const slug = item.title.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const filePath = `issues/${date}/${type}/${slug}.md`;
  let content = item.description || "";
  try {
    const res = await readKnowledgeFile(filePath);
    content = res.content || content;
  } catch { /* use issue.description as fallback */ }
  descDialogRef.value?.openFile({
    path: filePath,
    title: item.title,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, {
        title: item.title,
        type: "issue-description",
        status: item.status,
        project: item.project_key,
        created: date
      });
    }
  });
}

// ── Context Menu ──
const contextMenu = reactive({ visible: false, x: 0, y: 0, item: null as KanbanColumnItem | null });
function openContextMenu(e: MouseEvent, item: KanbanColumnItem) {
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 180);
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 260);
  contextMenu.item = item;
  contextMenu.visible = true;
}
function closeContextMenu() {
  contextMenu.visible = false;
  contextMenu.item = null;
}
onUnmounted(() => document.removeEventListener("click", closeContextMenu));

async function ctxQuickStatus(status: IssueStatus) {
  const item = contextMenu.item;
  closeContextMenu();
  if (item) await quickChangeStatus(item, status);
}
async function ctxEditPriority(priority: IssuePriority) {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  try {
    if (isBug(item)) {
      const bugPri = ISSUE_PRIORITY_TO_BUG_PRIORITY[priority];
      await updateBug(item.key, { priority: bugPri });
      ElMessage.success(`Bug priority changed: ${item.title} → ${BUG_PRIORITY_MAP[bugPri]}`);
    } else {
      await updateIssue(item.key, { priority });
      ElMessage.success(t("kanban.message.priorityChanged", { name: item.title, priority: ISSUE_PRIORITY_MAP[priority] }));
    }
    loadBoard();
  } catch { loadBoard(); }
}
async function ctxDelete() {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  try {
    await ElMessageBox.confirm(
      isBug(item)
        ? `Delete bug "${item.title}"?`
        : t("kanban.createDialog.deleteConfirm.title", { name: item.title }),
      t("kanban.createDialog.deleteConfirm.okText"),
      { type: "warning" }
    );
  } catch {
    return;
  }
  try {
    if (isBug(item)) {
      await deleteBug(item.key);
    } else {
      await deleteIssue(item.key);
    }
    ElMessage.success(t("kanban.createDialog.deleteConfirm.success"));
  } catch (e: any) {
    ElMessage.error(e?.message || "Delete failed");
  } finally {
    loadBoard();
  }
}

async function quickChangeStatus(item: KanbanColumnItem, newStatus: IssueStatus) {
  try {
    if (isBug(item)) {
      const bugStatus = ISSUE_STATUS_TO_BUG_STATUS[newStatus];
      if (!bugStatus) return;
      await updateBug(item.key, { status: bugStatus });
      ElMessage.success(`Bug status changed: ${item.title} → ${BUG_STATUS_MAP[bugStatus]}`);
    } else {
      await updateIssue(item.key, { status: newStatus });
      ElMessage.success(t("kanban.message.statusChanged", { name: item.title, status: ISSUE_STATUS_MAP[newStatus] }));
    }
    loadBoard();
  } catch { loadBoard(); }
}

// ── Load board (Issues + Bugs) ──
async function loadBoard() {
  loading.value = true;
  try {
    const issueParams: any = { pageSize: 200 };
    const bugParams: any = { pageSize: 500 };
    if (search.value) {
      issueParams.search = search.value;
      bugParams.search = search.value;
    }
    if (filterDateStr.value) {
      issueParams.updated_at_start = filterDateStr.value;
      issueParams.updated_at_end = filterDateStr.value;
      const start = new Date(filterDateStr.value + "T00:00:00").getTime();
      const end = new Date(filterDateStr.value + "T23:59:59").getTime();
      bugParams.createdAtStart = start;
      bugParams.createdAtEnd = end;
    }

    const [issueRes, bugRes] = await Promise.all([
      getIssueList(issueParams).catch(() => ({ data: { list: [] as Issue[] } })),
      getBugList(bugParams).catch(() => ({ data: { list: [] as BugDocument[] } }))
    ]);
    let issues = (issueRes.data?.list as Issue[]) ?? [];
    let bugs = (bugRes.data?.list as BugDocument[]) ?? [];

    if (typeFilter.value.size > 0) {
      issues = issues.filter(i => typeFilter.value.has(i.issue_type));
      // Bugs don't have the exact IssueType enum — if "bug" type filter is on, keep them; otherwise drop
      if (!typeFilter.value.has("bug" as IssueType)) {
        bugs = [];
      }
    }
    if (priorityFilter.value.size > 0) {
      issues = issues.filter(i => priorityFilter.value.has(i.priority));
      bugs = bugs.filter(b => {
        const mapped = BUG_PRIORITY_TO_ISSUE_PRIORITY[(b.priority || "p2") as BugPriority];
        return priorityFilter.value.has(mapped);
      });
    }

    const all: KanbanColumnItem[] = [...issues, ...bugs];

    for (const col of columns) {
      col.issues = all.filter(i => getColumnStatus(i) === col.status);
      col.overdueCount = col.issues.filter(i => isOverdue(i)).length;
    }
  } finally {
    loading.value = false;
  }
}

function getColumnStatus(item: KanbanColumnItem): IssueStatus {
  return isBug(item) ? mapBugToColumnStatus(item) : item.status;
}

const PRIORITY_ORDER: Record<IssuePriority, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

function sortColumn(col: Column, cmd: string) {
  if (cmd === "priority") {
    col.issues.sort((a, b) => PRIORITY_ORDER[getPriority(a)] - PRIORITY_ORDER[getPriority(b)]);
  } else if (cmd === "due_date") {
    col.issues.sort((a, b) => {
      const da = getDueDate(a);
      const db = getDueDate(b);
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });
  } else if (cmd === "updated_at") {
    col.issues.sort((a, b) => getUpdatedAt(b).localeCompare(getUpdatedAt(a)));
  } else if (cmd === "created_at") {
    col.issues.sort((a, b) => getCreatedAt(b).localeCompare(getCreatedAt(a)));
  }
}

async function onDragChange(evt: { added?: { element: KanbanColumnItem } }, newStatus: IssueStatus) {
  if (!evt.added) return;
  const item = evt.added.element;
  try {
    if (isBug(item)) {
      const bugStatus = ISSUE_STATUS_TO_BUG_STATUS[newStatus];
      if (!bugStatus) { loadBoard(); return; }
      await updateBug(item.key, { status: bugStatus });
      ElMessage.success(`Bug moved: ${item.title} → ${BUG_STATUS_MAP[bugStatus]}`);
    } else {
      await updateIssue(item.key, { status: newStatus });
      ElMessage.success(t("kanban.message.movedTo", { name: item.title, status: ISSUE_STATUS_MAP[newStatus] }));
    }
  } catch {
    loadBoard();
  }
}

function goDetail(item: KanbanColumnItem) {
  if (isBug(item)) {
    router.push(`/bug/${item.key}`);
    return;
  }
  router.push(`/issue/${item.key}`);
}
function goGoal(goalId: string) {
  const role = goalRoleMap[goalId];
  if (role) router.push(`/executiver/okr/${role}?goal=${goalId}`);
}

const projectNameByKey = ref<Map<string, string>>(new Map());
function projectName(key: string) { return projectNameByKey.value.get(key) || key; }
function goProject(key: string) { if (key) router.push(`/project/${key}`); }

async function loadNames() {
  try {
    projectNameByKey.value = new Map(projectStore.projects.map(p => [p.key, p.name]));
  } catch { /* best-effort */ }
}

function isOverdue(item: KanbanColumnItem): boolean {
  const due = getDueDate(item);
  if (!due) return false;
  const colStatus = getColumnStatus(item);
  if (colStatus === "done" || colStatus === "cancelled") return false;
  const today = new Date().toISOString().slice(0, 10);
  return due < today;
}

onMounted(async () => {
  document.addEventListener("click", closeContextMenu);
  await loadNames();
  loadBoard();
});
</script>

<style scoped lang="scss">
.kanban {
  padding: 20px 24px;
  height: calc(100vh - 136px);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
  overflow: hidden;
  min-height: 0;
}

.kanban__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  gap: 16px;
  min-width: 0;
}

.kanban__head-left {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  min-width: 0;
}

.kanban__head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;
}

.kanban__board {
  display: flex;
  gap: 14px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 12px 12px 4px;
  align-items: flex-start;
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 4px;
    transition: background 0.2s ease;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--el-border-color-dark);
  }
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}
</style>
