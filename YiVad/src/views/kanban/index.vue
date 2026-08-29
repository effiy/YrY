<template>
  <div class="kanban">
    <div class="kanban__head">
      <div class="kanban__head-left">
        <KanbanStats
          :total-issues="totalIssues"
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
      v-if="totalIssues > 0"
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
            :issue="element"
            :project-name="projectName(element.project_key)"
            :release-name="releaseName(element.release_key)"
            @click="goDetail(element.key)"
            @title-click="openPreview(element)"
            @goal-click="goGoal(element.goal_id)"
            @project-click="goProject(element.project_key)"
            @release-click="goRelease(element.release_key)"
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
import { getReleaseList } from "@/api/modules/releaseService";
import type { Release } from "@/api/modules/releaseService";
import {
  getIssueList, updateIssue, deleteIssue,
  ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP
} from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { goalRoleMap } from "@/views/knowledge/executiver/okrData";
import KanbanCard from "./KanbanCard.vue";
import KanbanStats from "./KanbanStats.vue";
import KanbanColumn from "./KanbanColumn.vue";
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

const totalIssues = ref(0);
const urgentCount = computed(() => columns.reduce((sum, col) => sum + col.issues.filter(i => i.priority === "urgent").length, 0));
const overdueCount = computed(() => columns.reduce((sum, col) => sum + col.overdueCount, 0));
const doneCount = computed(() => columns.find(c => c.status === "done")?.issues.length ?? 0);
const completionPct = computed(() => totalIssues.value ? Math.round((doneCount.value / totalIssues.value) * 100) : 0);

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
  issues: Issue[];
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
    width: totalIssues.value === 0 ? 0 : (Math.round((col.issues.length / totalIssues.value) * 100) || 0)
  }))
);

const createDialog = reactive({
  visible: false,
  loading: false,
  defaultStatus: "backlog" as IssueStatus
});

const descDialogRef = ref<{ openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void } | null>(null);
async function openPreview(issue: Issue) {
  const date = (issue.created_at || "").slice(0, 10);
  const type = issue.issue_type || "task";
  const slug = issue.title.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const filePath = `issues/${date}/${type}/${slug}.md`;
  let content = issue.description || "";
  try {
    const res = await readKnowledgeFile(filePath);
    content = res.content || content;
  } catch { /* use issue.description as fallback */ }
  descDialogRef.value?.openFile({
    path: filePath,
    title: issue.title,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, {
        title: issue.title,
        type: "issue-description",
        status: issue.status,
        project: issue.project_key,
        created: date
      });
    }
  });
}

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

const contextMenu = reactive({ visible: false, x: 0, y: 0, issue: null as Issue | null });
function openContextMenu(e: MouseEvent, issue: Issue) {
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 180);
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 260);
  contextMenu.issue = issue;
  contextMenu.visible = true;
}
function closeContextMenu() {
  contextMenu.visible = false;
  contextMenu.issue = null;
}
onUnmounted(() => document.removeEventListener("click", closeContextMenu));

async function ctxQuickStatus(status: IssueStatus) {
  const issue = contextMenu.issue;
  closeContextMenu();
  if (issue) await quickChangeStatus(issue, status);
}
async function ctxEditPriority(priority: IssuePriority) {
  const issue = contextMenu.issue;
  closeContextMenu();
  if (issue) {
    try {
      await updateIssue(issue.key, { priority });
      ElMessage.success(t("kanban.message.priorityChanged", { name: issue.title, priority: ISSUE_PRIORITY_MAP[priority] }));
      loadBoard();
    } catch { loadBoard(); }
  }
}
async function ctxDelete() {
  const issue = contextMenu.issue;
  closeContextMenu();
  if (!issue) return;
  try {
    await ElMessageBox.confirm(
      t("kanban.createDialog.deleteConfirm.title", { name: issue.title }),
      t("kanban.createDialog.deleteConfirm.okText"),
      { type: "warning" }
    );
    await deleteIssue(issue.key);
    ElMessage.success(t("kanban.createDialog.deleteConfirm.success"));
    loadBoard();
  } catch { /* cancelled */ }
}

async function quickChangeStatus(issue: Issue, newStatus: IssueStatus) {
  try {
    await updateIssue(issue.key, { status: newStatus });
    ElMessage.success(t("kanban.message.statusChanged", { name: issue.title, status: ISSUE_STATUS_MAP[newStatus] }));
    loadBoard();
  } catch { loadBoard(); }
}

async function loadBoard() {
  loading.value = true;
  try {
    const params: any = { pageSize: 200 };
    if (search.value) params.search = search.value;
    if (filterDateStr.value) {
      params.updated_at_start = filterDateStr.value;
      params.updated_at_end = filterDateStr.value;
    }
    const res = await getIssueList(params);
    let allIssues = (res.data?.list as Issue[]) ?? [];

    if (typeFilter.value.size > 0) {
      allIssues = allIssues.filter(i => typeFilter.value.has(i.issue_type));
    }
    if (priorityFilter.value.size > 0) {
      allIssues = allIssues.filter(i => priorityFilter.value.has(i.priority));
    }

    totalIssues.value = allIssues.length;

    for (const col of columns) {
      col.issues = allIssues.filter(i => i.status === col.status);
      col.overdueCount = col.issues.filter(i => isOverdue(i)).length;
    }
  } finally {
    loading.value = false;
  }
}

const PRIORITY_ORDER: Record<IssuePriority, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

function sortColumn(col: Column, cmd: string) {
  if (cmd === "priority") {
    col.issues.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  } else if (cmd === "due_date") {
    col.issues.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  } else if (cmd === "updated_at") {
    col.issues.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  } else if (cmd === "created_at") {
    col.issues.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

async function onDragChange(evt: { added?: { element: Issue } }, newStatus: IssueStatus) {
  if (!evt.added) return;
  const issue = evt.added.element;
  try {
    await updateIssue(issue.key, { status: newStatus });
    ElMessage.success(t("kanban.message.movedTo", { name: issue.title, status: ISSUE_STATUS_MAP[newStatus] }));
  } catch {
    loadBoard();
  }
}

function goDetail(key: string) { router.push(`/issue/${key}`); }
function goGoal(goalId: string) {
  const role = goalRoleMap[goalId];
  if (role) router.push(`/executiver/okr/${role}?goal=${goalId}`);
}

const projectNameByKey = ref<Map<string, string>>(new Map());
const releaseNameByKey = ref<Map<string, string>>(new Map());
function projectName(key: string) { return projectNameByKey.value.get(key) || key; }
function releaseName(key: string) { return releaseNameByKey.value.get(key) || key; }
function goProject(key: string) { if (key) router.push(`/project/${key}`); }
function goRelease(key: string) { if (key) router.push(`/release/${key}`); }

async function loadNames() {
  try {
    projectNameByKey.value = new Map(projectStore.projects.map(p => [p.key, p.name]));
    const relRes = await getReleaseList({ pageSize: 200 });
    releaseNameByKey.value = new Map(((relRes.data?.list as Release[]) ?? []).map(r => [r.key, r.version]));
  } catch { /* best-effort */ }
}

function isOverdue(issue: Issue): boolean {
  if (!issue.due_date || issue.status === "done" || issue.status === "cancelled") return false;
  const today = new Date().toISOString().slice(0, 10);
  return issue.due_date.slice(0, 10) < today;
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
}

.kanban__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  gap: 16px;
}

.kanban__head-left {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.kanban__head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.kanban__board {
  display: flex;
  gap: 14px;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 8px;
  align-items: stretch;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
    &:hover { background: var(--el-border-color-dark); }
  }
}
</style>
