<template>
  <div class="mod-detail" v-loading="loading">
    <template v-if="mod">
      <div class="mod-detail__head">
        <div class="mod-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Modules</el-button>
          <div>
            <h1 class="mod-detail__name">{{ mod.name }}</h1>
            <div class="mod-detail__meta">
              <code class="mod-detail__key" title="Copy key" @click="copyKey">{{ mod.key }}</code>
              <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
              <span v-if="mod.lead" class="mod-detail__lead">{{ mod.lead }}</span>
              <span class="mod-detail__project">
                <el-icon><Folder /></el-icon>
                <el-button link size="small" @click="router.push(`/project/${mod.project_key}`)">{{ projectName }}</el-button>
              </span>
            </div>
          </div>
        </div>
        <div class="mod-detail__head-actions">
          <el-button :icon="Link" :disabled="!mod.project_key" @click="router.push(`/project/${mod.project_key}`)">Open Project</el-button>
          <el-button :icon="Edit" @click="openEdit">Edit</el-button>
          <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
        </div>
      </div>

      <div class="mod-detail__body">
        <div class="mod-detail__main">
          <div class="mod-detail__stats">
            <div class="mod-detail__stat mod-detail__stat--clickable" @click="setIssueFilter('')">
              <div class="mod-detail__stat-value">{{ issues.length }}</div>
              <div class="mod-detail__stat-label">Total Issues</div>
            </div>
            <div class="mod-detail__stat mod-detail__stat--done mod-detail__stat--clickable" @click="setIssueFilter('done')">
              <div class="mod-detail__stat-value">{{ doneCount }}</div>
              <div class="mod-detail__stat-label">Done</div>
            </div>
            <div class="mod-detail__stat mod-detail__stat--progress mod-detail__stat--clickable" @click="setIssueFilter('in_progress')">
              <div class="mod-detail__stat-value">{{ inProgressCount }}</div>
              <div class="mod-detail__stat-label">In Progress</div>
            </div>
            <div class="mod-detail__stat mod-detail__stat--pending mod-detail__stat--clickable" @click="setIssueFilter('pending')">
              <div class="mod-detail__stat-value">{{ pendingCount }}</div>
              <div class="mod-detail__stat-label">Pending</div>
            </div>
          </div>
          <el-progress :percentage="progressPct" :stroke-width="8" :color="progressColor" style="margin-bottom: 20px" />

          <div v-if="mod.description" class="mod-detail__desc">
            <h3>Description</h3>
            <div class="markdown-body" v-html="renderedDesc" />
          </div>

          <div class="mod-detail__section">
            <div class="mod-detail__section-head">
              <h3>Issues ({{ filteredIssues.length }})</h3>
              <el-tag v-if="issueFilter" size="small" closable @close="issueFilter = ''">{{ issueFilterLabel }}</el-tag>
            </div>
            <div v-if="filteredIssues.length" class="mod-detail__issue-list">
              <div v-for="issue in filteredIssues" :key="issue.key" class="mod-detail__issue" @click="router.push(`/issue/${issue.key}`)">
                <div class="mod-detail__issue-left">
                  <el-tag :type="issueTypeTag(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                  <span class="mod-detail__issue-title">{{ issue.title }}</span>
                </div>
                <div class="mod-detail__issue-right">
                  <el-tag :type="issueStatusTag(issue.status)" size="small">{{ issueStatusLabel(issue.status) }}</el-tag>
                  <span v-if="issue.assignee" class="mod-detail__issue-assignee">{{ issue.assignee }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else :description="issueFilter ? 'No matching issues' : 'No issues in this module'" :image-size="40" />
          </div>
        </div>
        <div class="mod-detail__sidebar">
          <div class="mod-detail__props">
            <div class="mod-detail__prop">
              <span class="mod-detail__prop-label">Project</span>
              <el-button link size="small" type="primary" @click="router.push(`/project/${mod.project_key}`)">{{ projectName }}</el-button>
            </div>
            <div class="mod-detail__prop">
              <span class="mod-detail__prop-label">Status</span>
              <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
            </div>
            <div class="mod-detail__prop">
              <span class="mod-detail__prop-label">Lead</span>
              <span>{{ mod.lead || '—' }}</span>
            </div>
            <div class="mod-detail__prop">
              <span class="mod-detail__prop-label">Issues</span>
              <span>{{ doneCount }} done · {{ inProgressCount }} active · {{ pendingCount }} pending</span>
            </div>
            <div class="mod-detail__prop">
              <span class="mod-detail__prop-label">Created</span>
              <span>{{ formatRelativeTime(mod.created_at) }}</span>
            </div>
            <div class="mod-detail__prop">
              <span class="mod-detail__prop-label">Updated</span>
              <span>{{ formatRelativeTime(mod.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-dialog v-model="editDialog.visible" title="Edit Module" width="560px" destroy-on-close>
        <el-form ref="editFormRef" :model="editDialog.form" :rules="rules" label-width="100px">
          <el-form-item label="Name" prop="name">
            <el-input v-model="editDialog.form.name" maxlength="100" />
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="editDialog.form.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Status">
                <el-select v-model="editDialog.form.status" style="width: 100%">
                  <el-option v-for="(label, val) in MODULE_STATUS_MAP" :key="val" :label="label" :value="val" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Lead">
                <el-input v-model="editDialog.form.lead" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="editDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="editDialog.submitting" @click="submitEdit">Save</el-button>
        </template>
      </el-dialog>
    </template>

    <div v-else-if="!loading" class="mod-detail__not-found">
      <el-result icon="error" title="Module not found">
        <template #extra><el-button type="primary" @click="goBack">Back</el-button></template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="moduleDetail">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete, Folder, Link } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { ModuleStatus } from "@/api/modules/moduleService";
import { getIssueList, issueStatusLabel, issueStatusTag, typeLabel, issueTypeTag } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { formatRelativeTime } from "@/utils/datetime";

const route = useRoute();
const router = useRouter();
const store = useModuleStore();
const { render: renderMarkdown } = useMarkdown();

const loading = ref(true);
const mod = computed(() => store.currentModule);
const issues = ref<Issue[]>([]);
const editFormRef = ref<FormInstance>();
const projectName = ref("");
const issueFilter = ref("");

const rules: FormRules = {
  name: [{ required: true, message: "Name is required", trigger: "blur" }]
};

const editDialog = reactive({
  visible: false, submitting: false,
  form: { name: "", description: "", status: "planned" as ModuleStatus, lead: "" }
});

const doneCount = computed(() => issues.value.filter(i => i.status === "done").length);
const inProgressCount = computed(() => issues.value.filter(i => i.status === "in_progress").length);
const pendingCount = computed(() => issues.value.filter(i => i.status !== "done" && i.status !== "cancelled").length);

const progressPct = computed(() => {
  if (!issues.value.length) return 0;
  if (mod.value?.status === "completed") return 100;
  return Math.round((doneCount.value / issues.value.length) * 100);
});

const progressColor = computed(() => {
  if (progressPct.value >= 100) return "#67c23a";
  if (progressPct.value >= 50) return "#409eff";
  return "#e6a23c";
});

const renderedDesc = computed(() => {
  if (!mod.value?.description) return "";
  return renderMarkdown(mod.value.description);
});

const filteredIssues = computed(() => {
  if (!issueFilter.value) return issues.value;
  if (issueFilter.value === "pending") return issues.value.filter(i => i.status !== "done" && i.status !== "cancelled");
  return issues.value.filter(i => i.status === issueFilter.value);
});

const issueFilterLabel = computed(() => {
  const m: Record<string, string> = { done: "Done", in_progress: "In Progress", pending: "Pending" };
  return m[issueFilter.value] || issueFilter.value;
});

function openEdit() {
  if (!mod.value) return;
  editDialog.form = {
    name: mod.value.name, description: mod.value.description || "",
    status: mod.value.status, lead: mod.value.lead || ""
  };
  editDialog.visible = true;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !mod.value) return;
  editDialog.submitting = true;
  try {
    await store.editModule(mod.value.key, editDialog.form);
    ElMessage.success("Module updated");
    editDialog.visible = false;
  } finally { editDialog.submitting = false; }
}

async function handleDelete() {
  if (!mod.value) return;
  try {
    await ElMessageBox.confirm(`Delete module "${mod.value.name}"?`, "Delete", { type: "error" });
    await store.removeModule(mod.value.key, mod.value.project_key);
    ElMessage.success("Module deleted");
    goBack();
  } catch { /* cancelled */ }
}

async function loadIssues() {
  if (!mod.value?.issue_keys?.length) return;
  try {
    const res = await getIssueList({ project_key: mod.value.project_key, pageSize: 500 });
    const all = (res.data?.list as Issue[]) ?? [];
    issues.value = all.filter(i => mod.value!.issue_keys!.includes(i.key));
  } catch { /* ignore */ }
}

function goBack() {
  if (mod.value?.project_key) router.push(`/project/${mod.value.project_key}`);
  else router.push("/module");
}

function setIssueFilter(status: string) {
  issueFilter.value = issueFilter.value === status ? "" : status;
}

async function copyKey() {
  if (!mod.value) return;
  try {
    await navigator.clipboard.writeText(mod.value.key);
    ElMessage.success(`Copied ${mod.value.key}`);
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

async function loadProjectName() {
  if (!mod.value?.project_key) return;
  try {
    const res = await getProjectList({ pageSize: 500 });
    const projects = (res.data?.list as Project[]) ?? [];
    projectName.value = projects.find(p => p.key === mod.value!.project_key)?.name || mod.value!.project_key;
  } catch { /* ignore */ }
}

function statusLabel(s: ModuleStatus) { return MODULE_STATUS_MAP[s] || s; }
function statusTagType(s: ModuleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<ModuleStatus, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", completed: "success", cancelled: "danger" };
  return m[s] || "info";
}
onMounted(async () => {
  const key = route.params.key as string;
  if (key) {
    await store.fetchModule(key);
    await loadIssues();
    await loadProjectName();
  }
  loading.value = false;
});
</script>

<style scoped lang="scss">
.mod-detail { padding: 24px; height: calc(100vh - 95px); overflow: auto; background: var(--el-bg-color-page); }
.mod-detail__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.mod-detail__head-left { display: flex; align-items: flex-start; gap: 16px; }
.mod-detail__name { margin: 0 0 8px; font-size: 22px; font-weight: 600; }
.mod-detail__meta { display: flex; gap: 10px; align-items: center; code { font-size: 12px; color: var(--el-text-color-secondary); background: var(--el-fill-color-light); padding: 1px 8px; border-radius: 4px; } }
.mod-detail__key { cursor: pointer; transition: color 0.15s, background 0.15s; &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); } }
.mod-detail__lead { font-size: 13px; color: var(--el-text-color-secondary); }
.mod-detail__project { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--el-text-color-secondary); }
.mod-detail__head-actions { display: flex; gap: 8px; }
.mod-detail__body { display: flex; gap: 24px; align-items: flex-start; }
.mod-detail__main { flex: 1; min-width: 0; }
.mod-detail__sidebar { width: 260px; flex-shrink: 0; position: sticky; top: 24px; }
.mod-detail__props { background: var(--el-fill-color-lighter); border-radius: 8px; padding: 16px; }
.mod-detail__prop { padding: 8px 0; font-size: 13px; & + & { border-top: 1px solid var(--el-border-color-lighter); } }
.mod-detail__prop-label { display: block; color: var(--el-text-color-secondary); font-weight: 500; margin-bottom: 4px; }
.mod-detail__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.mod-detail__stat { background: var(--el-fill-color-lighter); border-radius: 10px; padding: 20px; text-align: center; }
.mod-detail__stat--clickable { cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; &:hover { transform: translateY(-2px); box-shadow: var(--el-box-shadow-light); } }
.mod-detail__stat--done { background: var(--el-color-success-light-9); .mod-detail__stat-value { color: var(--el-color-success); } }
.mod-detail__stat--progress { background: var(--el-color-primary-light-9); .mod-detail__stat-value { color: var(--el-color-primary); } }
.mod-detail__stat--pending { background: var(--el-color-warning-light-9); .mod-detail__stat-value { color: var(--el-color-warning); } }
.mod-detail__stat-value { font-size: 28px; font-weight: 700; }
.mod-detail__stat-label { font-size: 13px; color: var(--el-text-color-secondary); margin-top: 4px; }
.mod-detail__desc { margin-bottom: 24px; h3 { margin: 0 0 8px; font-size: 15px; } }
.mod-detail__section { h3 { margin: 0 0 12px; font-size: 15px; } }
.mod-detail__section-head { display: flex; align-items: center; justify-content: space-between; h3 { margin: 0 0 12px; } }
.mod-detail__issue-list { display: flex; flex-direction: column; gap: 4px; }
.mod-detail__issue { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: var(--el-fill-color-light); } }
.mod-detail__issue-left { display: flex; align-items: center; gap: 10px; }
.mod-detail__issue-title { font-size: 14px; font-weight: 500; }
.mod-detail__issue-right { display: flex; align-items: center; gap: 10px; }
.mod-detail__issue-assignee { font-size: 12px; color: var(--el-text-color-placeholder); }
.mod-detail__not-found { padding: 80px 0; }
</style>