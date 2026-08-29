<template>
  <div class="md-page" @keydown="handleKeydown">
    <!-- Skeleton -->
    <template v-if="loading">
      <div class="md-skel">
        <div class="md-skel-header">
          <div class="md-skel-line md-skel-line--short" />
          <div class="md-skel-line md-skel-line--long" />
          <div class="md-skel-row">
            <div class="md-skel-tag" /><div class="md-skel-tag" /><div class="md-skel-tag" />
          </div>
        </div>
        <div class="md-skel-body">
          <div class="md-skel-main">
            <div class="md-skel-card" v-for="i in 3" :key="i">
              <div class="md-skel-line md-skel-line--med" />
              <div class="md-skel-line md-skel-line--long" />
              <div class="md-skel-line md-skel-line--long" />
              <div class="md-skel-line md-skel-line--med" />
            </div>
          </div>
          <div class="md-skel-sidebar">
            <div class="md-skel-card" v-for="i in 3" :key="i">
              <div class="md-skel-line md-skel-line--med" />
              <div class="md-skel-line md-skel-line--short" />
              <div class="md-skel-line md-skel-line--short" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="mod">
      <!-- Header -->
      <div class="md-header">
        <div class="md-header__top">
          <h1 class="md-header__title">{{ mod.name }}</h1>
          <div class="md-header__actions">
            <el-tooltip :content="focusMode ? 'Show sidebar' : 'Focus mode'" placement="bottom">
              <el-button size="small" :icon="focusMode ? Rank : FullScreen" @click="focusMode = !focusMode" />
            </el-tooltip>
            <el-select
              :model-value="mod.status"
              placeholder="Status"
              size="small"
              @change="changeStatus"
              style="width: 130px"
            >
              <el-option
                v-for="(label, val) in MODULE_STATUS_MAP"
                :key="val"
                :label="label"
                :value="val"
              />
            </el-select>
            <el-dropdown trigger="click">
              <el-button :icon="MoreFilled" size="small" />
              <template #dropdown>
                <el-dropdown-item :icon="Edit" @click="openEdit">Edit</el-dropdown-item>
                <el-dropdown-item :icon="CopyDocument" @click="cloneModule">Clone</el-dropdown-item>
                <el-dropdown-item :icon="Delete" divided @click="handleDelete">Delete</el-dropdown-item>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="md-body">
        <div class="md-main">
          <READMECard
            :content="descContent"
            :html="descHtml"
            empty-hint="Add a description to help others understand this module"
            @edit="openDescDialog"
          />

          <!-- Issues -->
          <div class="md-card">
            <div class="md-card__head">
              <el-icon class="md-card__icon"><Tickets /></el-icon>
              <span>Issues ({{ issues.length }})</span>
            </div>
            <div class="md-card__body">
              <div v-if="issues.length" class="md-issues">
                <div v-for="issue in issues" :key="issue.key" class="md-issue">
                  <div class="md-issue__accent" :style="{ background: issueStatusColor(issue.status) }" />
                  <div class="md-issue__head">
                    <code class="md-issue__key" @click.stop="router.push(`/issue/${issue.key}`)">{{ issue.key }}</code>
                    <el-tag :type="issueTypeTag(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                    <span class="md-issue__status" :style="{ color: issueStatusColor(issue.status) }">{{ issueStatusLabel(issue.status) }}</span>
                  </div>
                  <div class="md-issue__title" @click="openIssuePreview(issue)">{{ issue.title }}</div>
                  <div class="md-issue__foot">
                    <span v-if="issue.assignee" class="md-issue__foot-item">
                      <el-icon><User /></el-icon>{{ issue.assignee }}
                    </span>
                    <span v-if="issue.due_date" class="md-issue__foot-item" :class="{ 'md-issue__foot-item--overdue': isIssueOverdue(issue) }">
                      <el-icon><Clock /></el-icon>{{ formatDate(issue.due_date) }}
                    </span>
                    <span v-if="issue.labels?.length" class="md-issue__labels">
                      <span v-for="l in issue.labels" :key="l" class="md-issue__label">{{ l }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="md-empty">
                <el-icon class="md-empty__icon"><Folder /></el-icon>
                <p class="md-empty__text">No issues in this module</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="md-sidebar" :class="{ 'md-sidebar--hidden': focusMode }">
          <!-- People -->
          <div class="md-sb-group">
            <div class="md-sb-group__title">
              <el-icon><User /></el-icon>
              <span>People</span>
              <button v-if="!editingLead" type="button" class="md-sb-edit" title="Edit lead" @click="startEditLead">
                <el-icon><Edit /></el-icon>
              </button>
            </div>
            <div class="md-sb-group__body">
              <template v-if="editingLead">
                <div class="md-sb-edit-row">
                  <el-input v-model="leadEdit" size="small" placeholder="Lead" @keyup.enter="saveLead" />
                  <el-button size="small" type="primary" :loading="savingLead" @click="saveLead">Save</el-button>
                  <el-button size="small" @click="editingLead = false">Cancel</el-button>
                </div>
              </template>
              <div v-else class="md-sb-row">
                <span class="md-sb-row__label">Lead</span>
                <span class="md-sb-row__value" :class="{ 'md-sb-row__value--empty': !mod.lead }">
                  {{ mod.lead || 'Unassigned' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div class="md-sb-group">
            <div class="md-sb-group__title">
              <el-icon><Calendar /></el-icon>
              <span>Schedule</span>
              <button v-if="!editingSchedule" type="button" class="md-sb-edit" title="Edit schedule" @click="startEditSchedule">
                <el-icon><Edit /></el-icon>
              </button>
            </div>
            <div class="md-sb-group__body">
              <template v-if="editingSchedule">
                <div class="md-sb-edit-row">
                  <span class="md-sb-edit-row__label">Start</span>
                  <el-date-picker v-model="scheduleEdit.start_date" size="small" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </div>
                <div class="md-sb-edit-row">
                  <span class="md-sb-edit-row__label">Due</span>
                  <el-date-picker v-model="scheduleEdit.due_date" size="small" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                </div>
                <div class="md-sb-edit-actions">
                  <el-button size="small" type="primary" :loading="savingSchedule" @click="saveSchedule">Save</el-button>
                  <el-button size="small" @click="editingSchedule = false">Cancel</el-button>
                </div>
              </template>
              <template v-else>
                <div class="md-sb-row">
                  <span class="md-sb-row__label">Start Date</span>
                  <span class="md-sb-row__value md-sb-row__value--muted">{{ mod.start_date ? formatDate(mod.start_date) : '-' }}</span>
                </div>
                <div class="md-sb-row">
                  <span class="md-sb-row__label">Due Date</span>
                  <span class="md-sb-row__value" :class="{ 'md-sb-row__value--overdue': isOverdue }">
                    {{ mod.due_date ? formatDate(mod.due_date) : '-' }}
                  </span>
                </div>
              </template>
            </div>
          </div>

          <!-- Links -->
          <div class="md-sb-group">
            <div class="md-sb-group__title">
              <el-icon><Connection /></el-icon>
              <span>Links</span>
            </div>
            <div class="md-sb-group__body">
              <div class="md-sb-row">
                <span class="md-sb-row__label">Project</span>
                <span class="md-sb-row__value">
                  <el-button link size="small" type="primary" @click="router.push(`/project/${mod.project_key}`)">{{ projectName }}</el-button>
                </span>
              </div>
              <div v-if="linkedCycles.length" class="md-sb-dep">
                <span class="md-sb-dep__label">Cycle</span>
                <div class="md-sb-dep__tags">
                  <el-tag
                    v-for="c in linkedCycles"
                    :key="c.key"
                    size="small"
                    type="warning"
                    @click="router.push(`/cycle/${c.key}`)"
                  >{{ c.name }}</el-tag>
                </div>
              </div>
              <div v-if="linkedReleases.length" class="md-sb-dep">
                <span class="md-sb-dep__label">Release</span>
                <div class="md-sb-dep__tags">
                  <el-tag
                    v-for="r in linkedReleases"
                    :key="r.key"
                    size="small"
                    type="success"
                    @click="router.push(`/release/${r.key}`)"
                  >{{ r.version }}</el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="md-sb-group">
            <div class="md-sb-group__title">
              <el-icon><InfoFilled /></el-icon>
              <span>Metadata</span>
            </div>
            <div class="md-sb-group__body">
              <div class="md-sb-row">
                <span class="md-sb-row__label">Status</span>
                <span class="md-sb-row__value">
                  <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
                </span>
              </div>
              <div class="md-sb-row">
                <span class="md-sb-row__label">Progress</span>
                <span class="md-sb-row__value">
                  <el-progress :percentage="progressPct" :stroke-width="6" :show-text="true" style="width:100px" :color="progressColor" />
                </span>
              </div>
              <div class="md-sb-row">
                <span class="md-sb-row__label">Breakdown</span>
                <span class="md-sb-row__value md-sb-row__value--muted">{{ doneCount }} done · {{ inProgressCount }} active · {{ pendingCount }} pending</span>
              </div>
              <div class="md-sb-row">
                <span class="md-sb-row__label">Created</span>
                <span class="md-sb-row__value md-sb-row__value--muted">{{ formatRelativeTime(mod.created_at) }}</span>
              </div>
              <div class="md-sb-row">
                <span class="md-sb-row__label">Updated</span>
                <span class="md-sb-row__value md-sb-row__value--muted">{{ formatRelativeTime(mod.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Bar -->
      <div class="md-sticky-bar" :class="{ 'md-sticky-bar--visible': showStickyBar }">
        <div class="md-sticky-bar__inner">
          <div class="md-sticky-bar__left">
            <code class="md-sticky-bar__key">{{ mod.key }}</code>
            <span class="md-sticky-bar__title">{{ mod.name }}</span>
            <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
          </div>
          <div class="md-sticky-bar__actions">
            <el-button size="small" :icon="Edit" @click="openEdit">Edit</el-button>
            <el-select
              :model-value="mod.status"
              size="small"
              @change="changeStatus"
              style="width: 130px"
            >
              <el-option v-for="(label, val) in MODULE_STATUS_MAP" :key="val" :label="label" :value="val" />
            </el-select>
            <el-button size="small" :icon="Upload" circle @click="scrollToTop" />
          </div>
        </div>
      </div>

      <!-- Edit Dialog -->
      <el-dialog v-model="editDialog.visible" title="Edit Module" width="560px" destroy-on-close>
        <el-form ref="editFormRef" :model="editDialog.form" :rules="rules" label-width="100px">
          <div class="md-edit-section">
            <div class="md-edit-section__title">Basic</div>
            <el-form-item label="Name" prop="name">
              <el-input v-model="editDialog.form.name" maxlength="100" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Status">
                  <el-select v-model="editDialog.form.status" style="width:100%">
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
          </div>
          <div class="md-edit-section">
            <div class="md-edit-section__title">Content</div>
            <el-form-item label="Description">
              <el-input v-model="editDialog.form.description" type="textarea" :rows="4" placeholder="Markdown supported" />
            </el-form-item>
          </div>
          <div class="md-edit-section">
            <div class="md-edit-section__title">Schedule</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Start Date">
                  <el-date-picker v-model="editDialog.form.start_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Due Date">
                  <el-date-picker v-model="editDialog.form.due_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <template #footer>
          <el-button @click="editDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="editDialog.submitting" @click="submitEdit">Save</el-button>
        </template>
      </el-dialog>

      <KnowledgePreviewDialog ref="descDialogRef" />
    </template>

    <div v-else-if="!loading" class="md-not-found">
      <el-result icon="error" title="Module not found">
        <template #extra><el-button type="primary" @click="goBack">Back</el-button></template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="moduleDetail">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Edit, Delete, Folder, Tickets, InfoFilled, Connection, Calendar, User, Clock, FullScreen, Rank, Upload, MoreFilled, CopyDocument } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { READMECard } from "@/components";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { ModuleStatus } from "@/api/modules/moduleService";
import { getIssueList, issueStatusLabel, typeLabel, issueTypeTag } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { getCycleList } from "@/api/modules/cycleService";
import type { Cycle } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";
import type { Release } from "@/api/modules/releaseService";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { formatDate, formatRelativeTime } from "@/utils/datetime";

const route = useRoute();
const router = useRouter();
const store = useModuleStore();
const { render: renderMarkdown } = useMarkdown();

const loading = ref(true);
const mod = computed(() => store.currentModule);
const issues = ref<Issue[]>([]);
const editFormRef = ref<FormInstance>();
const projectName = ref("");
const linkedCycles = ref<Cycle[]>([]);
const linkedReleases = ref<Release[]>([]);

const rules: FormRules = {
  name: [{ required: true, message: "Name is required", trigger: "blur" }]
};

const editDialog = reactive({
  visible: false, submitting: false,
  form: { name: "", description: "", status: "planned" as ModuleStatus, lead: "", start_date: "", due_date: "" }
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

const isOverdue = computed(() => {
  if (!mod.value?.due_date || mod.value.status === "completed") return false;
  return mod.value.due_date < new Date().toISOString().slice(0, 10);
});

// ── Keyboard Shortcuts ──────────────────────────────────────────────
function handleKeydown(e: KeyboardEvent) {
  if (editDialog.visible) {
    if (e.key === "Escape") { editDialog.visible = false; return; }
    return;
  }
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.key === "e" || e.key === "E") { e.preventDefault(); openEdit(); }
}

// ── Sticky Bar ──────────────────────────────────────────────────────
const showStickyBar = ref(false);
function onScroll() {
  showStickyBar.value = window.scrollY > 300;
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Focus Mode ──────────────────────────────────────────────────────
const focusMode = ref(false);

// ── Inline Edit: Lead ───────────────────────────────────────────────
const editingLead = ref(false);
const savingLead = ref(false);
const leadEdit = ref("");

function startEditLead() {
  leadEdit.value = mod.value?.lead || "";
  editingLead.value = true;
}
async function saveLead() {
  if (!mod.value) return;
  savingLead.value = true;
  try {
    await store.editModule(mod.value.key, { lead: leadEdit.value || undefined } as any);
    ElMessage.success("Lead updated");
    editingLead.value = false;
  } finally { savingLead.value = false; }
}

// ── Inline Edit: Schedule ───────────────────────────────────────────
const editingSchedule = ref(false);
const savingSchedule = ref(false);
const scheduleEdit = reactive({ start_date: "", due_date: "" });

function startEditSchedule() {
  if (!mod.value) return;
  scheduleEdit.start_date = mod.value.start_date || "";
  scheduleEdit.due_date = mod.value.due_date || "";
  editingSchedule.value = true;
}
async function saveSchedule() {
  if (!mod.value) return;
  savingSchedule.value = true;
  try {
    await store.editModule(mod.value.key, {
      start_date: scheduleEdit.start_date || undefined,
      due_date: scheduleEdit.due_date || undefined,
    } as any);
    ElMessage.success("Schedule updated");
    editingSchedule.value = false;
  } finally { savingSchedule.value = false; }
}

async function changeStatus(newStatus: string) {
  if (!mod.value) return;
  await store.editModule(mod.value.key, { status: newStatus as ModuleStatus });
  ElMessage.success(`Status changed to ${MODULE_STATUS_MAP[newStatus as ModuleStatus]}`);
}

// ── Description (file-based) ─────────────────────────────────────────
const descContent = ref("");
const descFilePath = computed(() => {
  if (!mod.value) return "";
  const slug = mod.value.name.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `modules/${slug}.md`;
});
const descDialogRef = ref<{ openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void } | null>(null);

const descHtml = computed(() => renderMarkdown(descContent.value || ""));

function loadDescFile() {
  descContent.value = mod.value?.description || "";
}

function openDescDialog() {
  descDialogRef.value?.openFile({
    path: descFilePath.value,
    title: mod.value?.name || "",
    content: descContent.value,
    onSave: async (content: string) => {
      await writeKnowledgeFile(descFilePath.value, content, {
        title: mod.value?.name || "",
        type: "module-description",
        status: mod.value?.status || "",
        project: mod.value?.project_key || "",
      });
      descContent.value = content;
    }
  });
}

function issueStatusColor(status: string): string {
  const m: Record<string, string> = { done: "#67c23a", in_progress: "#409eff", in_review: "#e6a23c", todo: "#909399", backlog: "#c0c4cc" };
  return m[status] || "#909399";
}

function isIssueOverdue(issue: Issue): boolean {
  if (!issue.due_date || issue.status === "done" || issue.status === "cancelled") return false;
  return issue.due_date < new Date().toISOString().slice(0, 10);
}

async function openIssuePreview(issue: Issue) {
  const date = (issue.created_at || "").slice(0, 10);
  const type = issue.issue_type || "task";
  const slug = issue.title.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const filePath = `issues/${date}/${type}/${slug}.md`;
  let content = issue.description || "";
  try { const res = await readKnowledgeFile(filePath); content = res.content || content; } catch { /* fallback */ }
  descDialogRef.value?.openFile({
    path: filePath, title: issue.title, content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, { title: issue.title, type: "issue-description", status: issue.status, created: date });
    }
  });
}

function openEdit() {
  if (!mod.value) return;
  editDialog.form = {
    name: mod.value.name,
    description: mod.value.description || "",
    status: mod.value.status,
    lead: mod.value.lead || "",
    start_date: mod.value.start_date || "",
    due_date: mod.value.due_date || "",
  };
  editDialog.visible = true;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !mod.value) return;
  editDialog.submitting = true;
  try {
    await store.editModule(mod.value.key, {
      name: editDialog.form.name,
      description: editDialog.form.description,
      status: editDialog.form.status,
      lead: editDialog.form.lead,
      start_date: editDialog.form.start_date || undefined,
      due_date: editDialog.form.due_date || undefined,
    } as any);
    ElMessage.success("Module updated");
    editDialog.visible = false;
  } finally {
    editDialog.submitting = false;
  }
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

async function cloneModule() {
  if (!mod.value) return;
  const newKey = `MOD-${Date.now().toString(36).toUpperCase()}`;
  await store.addModule({
    key: newKey,
    project_key: mod.value.project_key,
    name: `[Clone] ${mod.value.name}`,
    description: mod.value.description,
    status: "planned",
    lead: mod.value.lead,
    issue_keys: [],
    start_date: mod.value.start_date,
    due_date: mod.value.due_date,
  } as any);
  ElMessage.success("Module cloned");
  router.push(`/module/${newKey}`);
}

async function loadIssues() {
  if (!mod.value?.issue_keys?.length) return;
  try {
    const res = await getIssueList({ project_key: mod.value.project_key, pageSize: 500 });
    const all = (res.data?.list as Issue[]) ?? [];
    issues.value = all.filter(i => mod.value!.issue_keys!.includes(i.key));
  } catch { /* ignore */ }
}

async function loadLinkedCyclesReleases() {
  if (!mod.value?.project_key) return;
  const issueKeys = new Set(mod.value.issue_keys ?? []);
  if (!issueKeys.size) return;
  try {
    const [cycleRes, releaseRes] = await Promise.all([
      getCycleList({ project_key: mod.value.project_key, pageSize: 200 }),
      getReleaseList({ project_key: mod.value.project_key, pageSize: 200 })
    ]);
    linkedCycles.value = ((cycleRes.data?.list as Cycle[]) ?? []).filter(c => (c.issue_keys || []).some(k => issueKeys.has(k)));
    linkedReleases.value = ((releaseRes.data?.list as Release[]) ?? []).filter(r => (r.issue_keys || []).some(k => issueKeys.has(k)));
  } catch { /* ignore */ }
}

function goBack() {
  if (mod.value?.project_key) router.push(`/project/${mod.value.project_key}`);
  else router.push("/module");
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
    await Promise.all([loadIssues(), loadProjectName(), loadLinkedCyclesReleases(), loadDescFile()]);
  }
  loading.value = false;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped lang="scss">
.md-page {
  padding: 24px;
  min-height: calc(100vh - 95px);
  background: var(--el-bg-color-page);
  outline: none;
}

// ── Skeleton ──
.md-skel { animation: md-fade-in 0.3s ease; }
.md-skel-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.md-skel-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: md-shimmer 1.5s infinite;
  margin-bottom: 10px;
  &--short { width: 30%; }
  &--med { width: 55%; }
  &--long { width: 80%; }
}
.md-skel-tag {
  display: inline-block;
  width: 60px;
  height: 22px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-fill-color-light) 25%, var(--el-fill-color) 50%, var(--el-fill-color-light) 75%);
  background-size: 200% 100%;
  animation: md-shimmer 1.5s infinite;
  margin-right: 8px;
}
.md-skel-row { display: flex; gap: 8px; }
.md-skel-body { display: flex; gap: 20px; }
.md-skel-main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.md-skel-sidebar { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
.md-skel-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; padding: 16px; }
@keyframes md-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes md-fade-in { from { opacity: 0; } to { opacity: 1; } }

// ── Header ──
.md-header {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  border-left: 4px solid #9b59b6;
}
.md-header__top { display: flex; justify-content: space-between; align-items: center; }
.md-header__actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
.md-header__title { margin: 0; font-size: 22px; font-weight: 700; line-height: 1.3; }

// ── Body ──
.md-body { display: flex; gap: 20px; align-items: flex-start; }
.md-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }

// ── Cards ──
.md-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.md-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.md-card__icon { font-size: 16px; color: var(--el-color-primary); }
.md-card__head-right { margin-left: auto; display: flex; align-items: center; }
.md-card__body { padding: 16px; }

// ── Empty States ──
.md-empty {
  text-align: center;
  padding: 24px 16px;
  &__icon { font-size: 28px; color: var(--el-text-color-placeholder); margin-bottom: 8px; }
  &__text { margin: 0; font-size: 13px; font-weight: 500; color: var(--el-text-color-secondary); }
  &__hint { margin: 4px 0 0; font-size: 12px; color: var(--el-text-color-placeholder); }
}

// ── Issues ──
.md-issues { display: flex; flex-direction: column; gap: 6px; }
.md-issue {
  position: relative;
  padding: 10px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: box-shadow 0.15s, transform 0.12s;
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
}
.md-issue__accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 6px 0 0 6px;
}
.md-issue__head { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
.md-issue__key {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
  background: var(--el-fill-color);
  padding: 1px 5px;
  border-radius: 3px;
  cursor: pointer;
  transition: color 0.12s;
  &:hover { color: var(--el-color-primary); }
}
.md-issue__status {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.md-issue__title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--el-text-color-primary);
  cursor: pointer;
  &:hover { color: var(--el-color-primary); }
}
.md-issue__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.md-issue__foot-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  .el-icon { font-size: 11px; }
  &--overdue { color: var(--el-color-danger); font-weight: 600; }
}
.md-issue__labels { display: flex; gap: 4px; margin-left: auto; }
.md-issue__label {
  font-size: 10px;
  padding: 0 5px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  line-height: 1.7;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Sidebar ──
.md-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.md-sb-group {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.md-sb-group__title {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  .el-icon { font-size: 13px; }
}
.md-sb-edit {
  margin-left: auto;
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.12s;
  &:hover { background: var(--el-fill-color); color: var(--el-color-primary); }
}
.md-sb-edit-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.md-sb-edit-row__label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  width: 42px;
}
.md-sb-edit-actions {
  display: flex;
  gap: 6px;
  padding-top: 8px;
}
.md-sb-group__body { padding: 8px 14px; }
.md-sb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.md-sb-row__label { color: var(--el-text-color-secondary); font-weight: 500; flex-shrink: 0; }
.md-sb-row__value {
  text-align: right;
  &--muted { font-size: 12px; color: var(--el-text-color-placeholder); }
  &--overdue { color: var(--el-color-danger); font-weight: 600; }
  &--empty { color: var(--el-text-color-placeholder); font-style: italic; }
}
.md-sb-dep { margin-bottom: 8px; &:last-child { margin-bottom: 0; } }
.md-sb-dep__label {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  display: block;
  margin-bottom: 4px;
}
.md-sb-dep__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  .el-tag { cursor: pointer; }
}

.md-not-found { padding: 80px 0; }

// ── Focus Mode ──
.md-sidebar--hidden { display: none; }

// ── Sticky Bottom Bar ──
.md-sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  padding: 10px 24px;
  transform: translateY(100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  &--visible { transform: translateY(0); }
}
.md-sticky-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}
.md-sticky-bar__left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.md-sticky-bar__key {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
.md-sticky-bar__title {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.md-sticky-bar__actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

// ── Edit Dialog Sections ──
.md-edit-section {
  margin-bottom: 8px;
}
.md-edit-section__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 0 0 8px 100px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 12px;
}

// ── Print Styles ──
@media print {
  .md-page {
    padding: 0;
    height: auto;
    overflow: visible;
    background: #fff;
  }
  .md-header__actions { display: none; }
  .md-sidebar { display: none; }
  .md-sticky-bar { display: none; }
  .md-header {
    border: none;
    border-left: none;
    padding: 0 0 16px;
    margin-bottom: 16px;
    border-bottom: 2px solid #000;
    border-radius: 0;
  }
  .md-header__title { font-size: 18px; }
  .md-card {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid #eee;
    break-inside: avoid;
    margin-bottom: 12px;
  }
  .md-card__head { background: transparent; border-bottom: 1px solid #eee; }
  .md-card__body { padding: 12px 0; }
  .md-body { display: block; }
  .md-main { max-width: 100%; }
}
</style>