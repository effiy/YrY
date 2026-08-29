<template>
  <div class="kanban">
    <div class="kanban__head">
      <div class="kanban__head-left">
        <div class="kanban__head-stat" @click="clearFilters">
          <span class="kanban__head-stat-value">{{ totalIssues }}</span>
          <span class="kanban__head-stat-label">Total</span>
        </div>
        <div class="kanban__head-stat" :class="{ 'is-active': urgentCount > 0 }">
          <span class="kanban__head-stat-value is-urgent">{{ urgentCount }}</span>
          <span class="kanban__head-stat-label">Urgent</span>
        </div>
        <div class="kanban__head-stat" :class="{ 'is-active': overdueCount > 0 }">
          <span class="kanban__head-stat-value is-overdue">{{ overdueCount }}</span>
          <span class="kanban__head-stat-label">Overdue</span>
        </div>
        <div class="kanban__head-stat">
          <span class="kanban__head-stat-value is-done">{{ doneCount }}</span>
          <span class="kanban__head-stat-label">Done</span>
        </div>
        <div class="kanban__head-stat">
          <span class="kanban__head-stat-value">{{ completionPct }}%</span>
          <span class="kanban__head-stat-label">Completed</span>
        </div>
      </div>
      <div class="kanban__head-right">
        <el-input
          v-model="search"
          placeholder="Search issues..."
          size="small"
          clearable
          style="width: 200px"
          @update:model-value="onSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <HeroDateNav
          :filter-date="filterDate"
          :label="filterDateLabel"
          :is-today="isFilterToday"
          @prev="goToPrevDay"
          @next="goToNextDay"
          @today="goToFilterToday"
          @clear="clearFilterDate"
        />
      </div>
    </div>

    <div v-if="hasQuickFilters" class="kanban__filters">
      <div class="kanban__filter-row">
        <span class="kanban__filter-label">Type</span>
        <el-check-tag
          v-for="(label, val) in ISSUE_TYPE_MAP"
          :key="val"
          :checked="typeFilter.has(val)"
          size="small"
          @change="() => toggleTypeFilter(val)"
        >
          {{ label }}
        </el-check-tag>
      </div>
      <div class="kanban__filter-row">
        <span class="kanban__filter-label">Priority</span>
        <el-check-tag
          v-for="[val, label] in PRIORITY_FILTERS"
          :key="val"
          :checked="priorityFilter.has(val)"
          size="small"
          @change="() => togglePriorityFilter(val)"
        >
          {{ label }}
        </el-check-tag>
      </div>
    </div>

    <div class="kanban__stats" v-if="totalIssues > 0">
      <div
        v-for="col in columns"
        :key="col.status"
        class="kanban__stat-segment"
        :style="{ width: statPct(col) + '%', background: col.color }"
        :title="`${col.label}: ${col.issues.length}`"
      />
    </div>

    <div v-loading="loading" class="kanban__board">
      <div v-for="col in columns" :key="col.status" class="kanban__col" :class="`kanban__col--${col.status}`">
        <div class="kanban__col-head" :style="{ background: col.headerBg }">
          <div class="kanban__col-head-row">
            <span class="kanban__col-title">{{ col.label }}</span>
            <div class="kanban__col-head-actions">
              <el-tag size="small" round :type="col.countTagType">{{ col.issues.length }}</el-tag>
              <el-dropdown trigger="click" @command="(cmd: string) => sortColumn(col, cmd)">
                <el-button size="small" text style="padding: 2px 4px; margin-left: 2px;">
                  <el-icon><Sort /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="priority">By Priority</el-dropdown-item>
                    <el-dropdown-item command="due_date">By Due Date</el-dropdown-item>
                    <el-dropdown-item command="updated_at">By Recent</el-dropdown-item>
                    <el-dropdown-item command="created_at">By Created</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div v-if="col.overdueCount > 0" class="kanban__col-overdue">
            <el-icon><Clock /></el-icon> {{ col.overdueCount }} overdue
          </div>
        </div>

        <draggable
            :list="col.issues"
            :group="{ name: 'issues', pull: true, put: true }"
            item-key="key"
            class="kanban__col-body"
            ghost-class="kanban__card--ghost"
            :animation="200"
            @change="(evt: any) => onDragChange(evt, col.status)"
          >
            <template #item="{ element }">
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
          </draggable>
          <div v-if="col.issues.length === 0" class="kanban__col-empty">
            <el-icon :size="28"><Folder /></el-icon>
            <span>No issues</span>
          </div>

        <div class="kanban__col-foot">
          <el-button text @click="openCreateDialog(col.status)"><el-icon><Plus /></el-icon>Add issue</el-button>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="kanban__ctxmenu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <div class="kanban__ctxmenu-item" @click="ctxQuickStatus('todo')">
          <el-icon><ArrowRight /></el-icon> Move to Todo
        </div>
        <div class="kanban__ctxmenu-item" @click="ctxQuickStatus('in_progress')">
          <el-icon><ArrowRight /></el-icon> Move to In Progress
        </div>
        <div class="kanban__ctxmenu-item" @click="ctxQuickStatus('in_review')">
          <el-icon><ArrowRight /></el-icon> Move to In Review
        </div>
        <div class="kanban__ctxmenu-item" @click="ctxQuickStatus('done')">
          <el-icon><CircleCheck /></el-icon> Move to Done
        </div>
        <div class="kanban__ctxmenu-divider" />
        <div class="kanban__ctxmenu-item" @click="ctxEditPriority('urgent')">
          <span class="kanban__ctxmenu-priority" style="color:#f56c6c">●</span> Urgent
        </div>
        <div class="kanban__ctxmenu-item" @click="ctxEditPriority('high')">
          <span class="kanban__ctxmenu-priority" style="color:#e6a23c">●</span> High
        </div>
        <div class="kanban__ctxmenu-item" @click="ctxEditPriority('medium')">
          <span class="kanban__ctxmenu-priority" style="color:#409eff">●</span> Medium
        </div>
        <div class="kanban__ctxmenu-item" @click="ctxEditPriority('low')">
          <span class="kanban__ctxmenu-priority" style="color:#909399">●</span> Low
        </div>
        <div class="kanban__ctxmenu-divider" />
        <div class="kanban__ctxmenu-item kanban__ctxmenu-item--danger" @click="ctxDelete">
          <el-icon><Delete /></el-icon> Delete
        </div>
      </div>
    </teleport>

    <!-- Create Issue Dialog -->
    <el-dialog
      v-model="createDialog.visible"
      title="Create Issue"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="createDialog.form" label-position="top" size="small">
        <el-form-item label="Title" prop="title" required>
          <el-input v-model="createDialog.form.title" placeholder="Issue title" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="Type" prop="issue_type">
              <el-select v-model="createDialog.form.issue_type" style="width:100%">
                <el-option v-for="(label, val) in ISSUE_TYPE_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Priority" prop="priority">
              <el-select v-model="createDialog.form.priority" style="width:100%">
                <el-option v-for="(label, val) in PRIORITY_OPTIONS" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Status" prop="status">
              <el-select v-model="createDialog.form.status" style="width:100%">
                <el-option v-for="(label, val) in STATUS_OPTIONS" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="Assignee" prop="assignee">
              <el-input v-model="createDialog.form.assignee" placeholder="Assignee" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Due Date" prop="due_date">
              <el-date-picker
                v-model="createDialog.form.due_date"
                type="date"
                placeholder="Pick a date"
                style="width:100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Labels" prop="labels">
          <el-select
            v-model="createDialog.form.labels"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Add labels"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="createDialog.form.description"
            type="textarea"
            :rows="3"
            placeholder="Optional description"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="createDialog.loading" @click="submitCreate">
          Create
        </el-button>
      </template>
    </el-dialog>

    <!-- Issue Preview Dialog (same as issue detail page) -->
    <KnowledgePreviewDialog ref="descDialogRef" />
  </div>
</template>

<script setup lang="ts" name="kanbanBoard">
import { onMounted, onUnmounted, reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Clock, Folder, Sort, ArrowRight, CircleCheck, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import draggable from "vuedraggable";
import { useIssueStore } from "@/stores/modules/issue";
import { useProjectStore } from "@/stores/modules/project";
import { getReleaseList } from "@/api/modules/releaseService";
import type { Release } from "@/api/modules/releaseService";
import {
  getIssueList, updateIssue, deleteIssue,
  ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP
} from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { goalRoleMap } from "@/views/knowledge/executiver/okrData";
import KanbanCard from "./KanbanCard.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { useDateFilter } from "@/hooks/useDateFilter";

const router = useRouter();
const issueStore = useIssueStore();
const projectStore = useProjectStore();

const loading = ref(false);

// ── Date filter ──
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

const PRIORITY_FILTERS: [IssuePriority, string][] = [
  ["urgent", "Urgent"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]
];

const hasQuickFilters = computed(() => typeFilter.value.size > 0 || priorityFilter.value.size > 0);

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadBoard(), 250);
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

function statPct(col: Column): number {
  if (totalIssues.value === 0) return 0;
  return Math.round((col.issues.length / totalIssues.value) * 100) || 0;
}

// Create dialog
const createDialog = reactive({
  visible: false,
  loading: false,
  defaultStatus: "backlog" as IssueStatus,
  form: {
    title: "",
    issue_type: "task" as IssueType,
    priority: "medium" as IssuePriority,
    status: "backlog" as IssueStatus,
    assignee: "",
    due_date: "",
    labels: [] as string[],
    description: ""
  }
});

// Preview dialog (KnowledgePreviewDialog — same as issue detail page)
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

const PRIORITY_OPTIONS: [IssuePriority, string][] = [
  ["urgent", "Urgent"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]
];

const STATUS_OPTIONS: [IssueStatus, string][] = [
  ["backlog", "Backlog"], ["todo", "Todo"], ["in_progress", "In Progress"], ["in_review", "In Review"], ["done", "Done"]
];

function openCreateDialog(status: IssueStatus) {
  createDialog.defaultStatus = status;
  createDialog.form = {
    title: "",
    issue_type: "task",
    priority: "medium",
    status,
    assignee: "",
    due_date: "",
    labels: [],
    description: ""
  };
  createDialog.visible = true;
}

async function submitCreate() {
  if (!createDialog.form.title.trim()) return;
  createDialog.loading = true;
  try {
    const key = `ISS-${Date.now().toString(36).toUpperCase()}`;
    await issueStore.addIssue({
      key,
      project_key: "default",
      sequence_id: Date.now(),
      title: createDialog.form.title.trim(),
      description: createDialog.form.description.trim() || undefined,
      status: createDialog.form.status,
      priority: createDialog.form.priority,
      issue_type: createDialog.form.issue_type,
      assignee: createDialog.form.assignee.trim() || "",
      labels: createDialog.form.labels,
      start_date: "",
      due_date: createDialog.form.due_date
    });
    ElMessage.success("Issue created");
    createDialog.visible = false;
    loadBoard();
  } finally {
    createDialog.loading = false;
  }
}

// Context menu
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
      ElMessage.success(`"${issue.title}" priority → ${ISSUE_PRIORITY_MAP[priority]}`);
      loadBoard();
    } catch { loadBoard(); }
  }
}
async function ctxDelete() {
  const issue = contextMenu.issue;
  closeContextMenu();
  if (!issue) return;
  try {
    await ElMessageBox.confirm(`Delete "${issue.title}"?`, "Confirm", { type: "warning" });
    await deleteIssue(issue.key);
    ElMessage.success("Deleted");
    loadBoard();
  } catch { /* cancelled */ }
}

async function quickChangeStatus(issue: Issue, newStatus: IssueStatus) {
  try {
    await updateIssue(issue.key, { status: newStatus });
    ElMessage.success(`"${issue.title}" → ${ISSUE_STATUS_MAP[newStatus]}`);
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
    ElMessage.success(`"${issue.title}" moved to ${ISSUE_STATUS_MAP[newStatus]}`);
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
  height: calc(100vh - 95px);
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

.kanban__head-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background: var(--el-border-color-lighter);
  }

  &:hover { background: var(--el-fill-color-light); }

  &:first-child {
    cursor: pointer;
    &:hover .kanban__head-stat-value { color: var(--el-color-primary); }
  }
}

.kanban__head-stat-value {
  font-size: 16px;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;

  &.is-urgent { color: var(--el-color-danger); }
  &.is-overdue { color: var(--el-color-warning); }
  &.is-done { color: var(--el-color-success); }
}

.kanban__head-stat-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.kanban__head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.kanban__filters {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.kanban__filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.kanban__filter-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 48px;
}

.kanban__stats {
  display: flex;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
  flex-shrink: 0;
  background: var(--el-fill-color);
}

.kanban__stat-segment {
  transition: width 0.4s ease;
  min-width: 0;
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

.kanban__col {
  flex: 1;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  max-height: 100%;
  border: 1px solid var(--el-border-color-lighter);
}

.kanban__col-head {
  padding: 10px 14px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.kanban__col-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanban__col-head-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.kanban__col-title {
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-primary);
}

.kanban__col-overdue {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 5px;
  font-size: 11px;
  color: var(--el-color-danger);
  .el-icon { font-size: 12px; }
}

.kanban__col-body {
  flex: 1;
  padding: 8px 10px;
  overflow-y: auto;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 2px;
  }
}

.kanban__col-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  padding: 24px;
  min-height: 80px;
}

.kanban__card--ghost {
  opacity: 0.35;
  background: var(--el-color-primary-light-8);
  border: 2px dashed var(--el-color-primary);
}

.kanban__col-foot {
  padding: 8px 10px;
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color-lighter);
  :deep(.el-button) {
    width: 100%;
    justify-content: flex-start;
    color: var(--el-text-color-secondary);
    &:hover { color: var(--el-color-primary); }
  }
}


// Context menu
.kanban__ctxmenu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-width: 180px;
}

.kanban__ctxmenu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--el-text-color-primary);

  .el-icon { font-size: 14px; color: var(--el-text-color-secondary); }

  &:hover { background: var(--el-fill-color-light); }

  &--danger {
    color: var(--el-color-danger);
    .el-icon { color: var(--el-color-danger); }
    &:hover { background: var(--el-color-danger-light-9); }
  }
}

.kanban__ctxmenu-priority {
  font-size: 10px;
}

.kanban__ctxmenu-divider {
  height: 1px;
  background: var(--el-border-color-lighter);
  margin: 4px 8px;
}
</style>