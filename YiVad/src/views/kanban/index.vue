<template>
  <div class="kanban">
    <div class="kanban__head">
      <div class="kanban__head-left">
        <h1 class="kanban__title">Kanban Board</h1>
        <el-tag size="small" type="info">{{ totalIssues }} issues</el-tag>
      </div>
      <div class="kanban__head-right">
        <el-select v-model="swimlaneBy" size="small" style="width: 130px" @change="loadBoard">
          <el-option label="No Swimlanes" value="" />
          <el-option label="By Assignee" value="assignee" />
          <el-option label="By Priority" value="priority" />
          <el-option label="By Type" value="issue_type" />
        </el-select>
        <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 200px" @change="loadBoard">
          <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
        </el-select>
        <el-button :icon="Refresh" @click="loadBoard">Refresh</el-button>
      </div>
    </div>

    <div v-loading="loading" class="kanban__board">
      <div v-for="col in columns" :key="col.status" class="kanban__col">
        <div class="kanban__col-head" :style="{ borderTopColor: col.color }">
          <span class="kanban__col-title">{{ col.label }}</span>
          <el-tag size="small" round>{{ col.issues.length }}</el-tag>
        </div>

        <draggable
          :list="col.issues"
          :group="{ name: 'issues', pull: true, put: true }"
          item-key="key"
          class="kanban__col-body"
          ghost-class="kanban__card--ghost"
          @change="(evt: any) => onDragChange(evt, col.status)"
        >
          <template #item="{ element }">
            <div class="kanban__card" @click="goDetail(element.key)">
              <div class="kanban__card-top">
                <code>{{ element.key }}</code>
                <el-tag :type="typeTagType(element.issue_type)" size="small" effect="plain">
                  {{ typeLabel(element.issue_type) }}
                </el-tag>
              </div>
              <div class="kanban__card-title">{{ element.title }}</div>
              <div class="kanban__card-meta">
                <span :style="{ color: priorityColor(element.priority) }" class="kanban__card-priority">
                  {{ priorityLabel(element.priority) }}
                </span>
                <span v-if="element.assignee" class="kanban__card-assignee">
                  <el-icon><User /></el-icon> {{ element.assignee }}
                </span>
              </div>
              <div v-if="element.due_date" class="kanban__card-due">
                <el-icon><Clock /></el-icon>
                {{ formatDate(element.due_date) }}
              </div>
            </div>
          </template>
        </draggable>

        <div class="kanban__col-foot">
          <el-button text :icon="Plus" @click="openCreate(col.status)">Add issue</el-button>
        </div>
      </div>
    </div>

    <!-- Quick Create Dialog -->
    <el-dialog v-model="dialog.visible" title="New Issue" width="560px" destroy-on-close>
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
        <el-form-item label="Assignee">
          <el-input v-model="dialog.form.assignee" placeholder="Assignee name" />
        </el-form-item>
        <el-form-item v-if="!projectFilter" label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="kanbanBoard">
import { onMounted, reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Plus, Refresh, User, Clock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import draggable from "vuedraggable";
import { useIssueStore } from "@/stores/modules/issue";
import { formatDate } from "@/utils/datetime";
import { useProjectStore } from "@/stores/modules/project";
import {
  getIssueList, updateIssue,
  ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP,
  ISSUE_TYPE_TAG_MAP,
  typeLabel
} from "@/api/modules/issueService";
import type { Issue, IssueStatus, IssuePriority, IssueType, TagType } from "@/api/modules/issueService";

const router = useRouter();
const issueStore = useIssueStore();
const projectStore = useProjectStore();

const loading = ref(false);
const projectFilter = ref("");
const swimlaneBy = ref("");

const swimlaneValues = computed(() => {
  if (!swimlaneBy.value) return [""];
  const vals = new Set<string>();
  columns.forEach(col => col.issues.forEach(i => {
    const v = (i as any)[swimlaneBy.value] || "None";
    vals.add(v);
  }));
  return Array.from(vals).sort();
});

function swimlaneLabel(val: string): string {
  if (!val || val === "None") return "No " + (swimlaneBy.value || "group");
  return val;
}
const formRef = ref<FormInstance>();

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }]
};

const projects = ref<{ key: string; name: string }[]>([]);

const columns = reactive<Array<{ status: IssueStatus; label: string; color: string; issues: Issue[] }>>([
  { status: "backlog", label: "Backlog", color: "#909399", issues: [] },
  { status: "todo", label: "Todo", color: "#409eff", issues: [] },
  { status: "in_progress", label: "In Progress", color: "#e6a23c", issues: [] },
  { status: "in_review", label: "In Review", color: "#9b59b6", issues: [] },
  { status: "done", label: "Done", color: "#67c23a", issues: [] }
]);

const totalIssues = ref(0);

const dialog = reactive({
  visible: false,
  submitting: false,
  form: {
    title: "",
    issue_type: "task" as IssueType,
    priority: "medium" as IssuePriority,
    assignee: "",
    project_key: ""
  }
});

async function loadBoard() {
  loading.value = true;
  try {
    const params: any = { pageSize: 200 };
    if (projectFilter.value) params.project_key = projectFilter.value;
    const res = await getIssueList(params);
    const allIssues = (res.data?.list as Issue[]) ?? [];
    totalIssues.value = allIssues.length;

    for (const col of columns) {
      col.issues = allIssues.filter(i => i.status === col.status);
    }
  } finally {
    loading.value = false;
  }
}

async function onDragChange(evt: { added?: { element: Issue } }, newStatus: IssueStatus) {
  if (!evt.added) return;
  const issue = evt.added.element;
  try {
    await updateIssue(issue.key, { status: newStatus });
    ElMessage.success(`"${issue.title}" moved to ${ISSUE_STATUS_MAP[newStatus]}`);
  } catch {
    // revert on failure
    loadBoard();
  }
}

function openCreate(status: IssueStatus) {
  dialog.form = {
    title: "",
    issue_type: "task",
    priority: "medium",
    assignee: "",
    project_key: projectFilter.value || ""
  };
  dialog.visible = true;
  // store the target status
  (dialog as any)._targetStatus = status;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const targetStatus = (dialog as any)._targetStatus as IssueStatus || "todo";
    const key = `ISS-${Date.now().toString(36).toUpperCase()}`;
    await issueStore.addIssue({
      key,
      project_key: dialog.form.project_key || projectFilter.value || "default",
      sequence_id: Date.now(),
      title: dialog.form.title,
      status: targetStatus,
      priority: dialog.form.priority,
      issue_type: dialog.form.issue_type,
      assignee: dialog.form.assignee,
      labels: [],
      start_date: "",
      due_date: ""
    });
    ElMessage.success("Issue created");
    dialog.visible = false;
    loadBoard();
  } finally {
    dialog.submitting = false;
  }
}

function goDetail(key: string) {
  router.push(`/issue/${key}`);
}

function priorityLabel(p: IssuePriority) { return ISSUE_PRIORITY_MAP[p] || p; }
function typeTagType(t: IssueType): TagType { return ISSUE_TYPE_TAG_MAP[t] || "info"; }
function priorityColor(p: IssuePriority) {
  const m: Record<IssuePriority, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return m[p] || "#909399";
}
onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  loadBoard();
});
</script>

<style scoped lang="scss">
.kanban {
  padding: 24px;
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
  margin-bottom: 20px;
  flex-shrink: 0;
}
.kanban__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.kanban__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.kanban__head-right {
  display: flex;
  gap: 10px;
}
.kanban__board {
  display: flex;
  gap: 16px;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 8px;
}
.kanban__col {
  flex: 1;
  min-width: 260px;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.kanban__col-head {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 3px solid;
  background: var(--el-bg-color);
  flex-shrink: 0;
}
.kanban__col-title {
  font-weight: 600;
  font-size: 14px;
}
.kanban__col-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kanban__card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
.kanban__card--ghost {
  opacity: 0.4;
  background: var(--el-color-primary-light-8);
}
.kanban__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  code {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}
.kanban__card-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.kanban__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.kanban__card-priority {
  font-weight: 500;
}
.kanban__card-assignee {
  display: flex;
  align-items: center;
  gap: 3px;
  color: var(--el-text-color-secondary);
}
.kanban__card-due {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.kanban__card-swimlane {
  margin-top: 4px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.kanban__col-foot {
  padding: 10px;
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color-lighter);
  :deep(.el-button) {
    width: 100%;
  }
}
</style>