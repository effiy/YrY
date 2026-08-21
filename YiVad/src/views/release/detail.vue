<template>
  <div class="rel-detail" v-loading="loading">
    <template v-if="release">
      <div class="rel-detail__head">
        <div class="rel-detail__head-left">
          <el-button text :icon="ArrowLeft" @click="goBack">Releases</el-button>
          <div>
            <div class="rel-detail__title-row">
              <h1 class="rel-detail__version">{{ release.version }}</h1>
              <el-tag :type="statusTagType(release.status)" size="small">{{ statusLabel(release.status) }}</el-tag>
            </div>
            <div class="rel-detail__meta">
              <code>{{ release.key }}</code>
              <span class="rel-detail__name">{{ release.name }}</span>
              <span class="rel-detail__project">
                <el-icon><Folder /></el-icon>
                <el-button link size="small" @click="router.push(`/project/${release.project_key}`)">{{ release.project_key }}</el-button>
              </span>
            </div>
          </div>
        </div>
        <div class="rel-detail__head-actions">
          <el-button v-if="release.status === 'planned'" type="primary" :icon="VideoPlay" @click="startRelease">Start</el-button>
          <el-button v-if="release.status === 'in_progress'" type="success" :icon="CircleCheck" @click="completeRelease">Complete</el-button>
          <el-button :icon="Edit" @click="openEdit">Edit</el-button>
          <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
        </div>
      </div>

      <div class="rel-detail__body">
        <div class="rel-detail__main">
          <div class="rel-detail__stats">
            <div class="rel-detail__stat">
              <div class="rel-detail__stat-value">{{ issues.length }}</div>
              <div class="rel-detail__stat-label">Issues</div>
            </div>
            <div class="rel-detail__stat rel-detail__stat--done">
              <div class="rel-detail__stat-value">{{ doneCount }}</div>
              <div class="rel-detail__stat-label">Done</div>
            </div>
            <div class="rel-detail__stat rel-detail__stat--progress">
              <div class="rel-detail__stat-value">{{ inProgressCount }}</div>
              <div class="rel-detail__stat-label">In Progress</div>
            </div>
            <div class="rel-detail__stat rel-detail__stat--pending">
              <div class="rel-detail__stat-value">{{ pendingCount }}</div>
              <div class="rel-detail__stat-label">Pending</div>
            </div>
            <div class="rel-detail__stat rel-detail__stat--cycles">
              <div class="rel-detail__stat-value">{{ linkedCycles.length }}</div>
              <div class="rel-detail__stat-label">Cycles</div>
            </div>
            <div class="rel-detail__stat rel-detail__stat--reqs">
              <div class="rel-detail__stat-value">{{ reqCount }}</div>
              <div class="rel-detail__stat-label">Requirements</div>
            </div>
          </div>
          <el-progress :percentage="progressPct" :stroke-width="8" :color="progressColor" style="margin-bottom: 20px" />

          <!-- Deployment Status -->
          <div class="rel-detail__deploy">
            <h3>Deployment</h3>
            <div class="rel-detail__deploy-steps">
              <div class="rel-detail__deploy-step" v-for="(step, i) in deploySteps" :key="step.label" :class="{ 'rel-detail__deploy-step--active': i <= activeDeployStep, 'rel-detail__deploy-step--done': i < activeDeployStep }">
                <div class="rel-detail__deploy-dot" :style="{ background: i <= activeDeployStep ? '#409eff' : '#c0c4cc' }" />
                <div class="rel-detail__deploy-info">
                  <span class="rel-detail__deploy-label">{{ step.label }}</span>
                  <span v-if="i === activeDeployStep && release.status === 'in_progress'" class="rel-detail__deploy-status">In progress...</span>
                  <span v-else-if="i < activeDeployStep" class="rel-detail__deploy-status">Done</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cycle Breakdown -->
          <div v-if="linkedCycles.length" class="rel-detail__deploy" style="margin-bottom: 24px">
            <h3>Contributing Cycles</h3>
            <div class="rel-detail__cycle-list">
              <div v-for="c in linkedCycles" :key="c.key" class="rel-detail__cycle-item" @click="router.push(`/cycle/${c.key}`)">
                <div class="rel-detail__cycle-info">
                  <span class="rel-detail__cycle-name">{{ c.name }}</span>
                  <el-tag :type="c.status === 'completed' ? 'success' : c.status === 'active' ? 'primary' : 'info'" size="small">{{ c.status }}</el-tag>
                </div>
                <div class="rel-detail__cycle-meta">
                  <span>{{ releaseCycleIssueCount(c) }} issues in this release</span>
                  <span>{{ formatDate(c.start_date) }} — {{ formatDate(c.end_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="release.notes" class="rel-detail__notes">
            <h3>Release Notes</h3>
            <div class="markdown-body" v-html="renderedNotes" />
          </div>

          <div class="rel-detail__section">
            <h3>Issues ({{ issues.length }})</h3>
            <div v-if="issues.length" class="rel-detail__issue-list">
              <div v-for="issue in issues" :key="issue.key" class="rel-detail__issue" @click="router.push(`/issue/${issue.key}`)">
                <div class="rel-detail__issue-left">
                  <el-tag :type="issueTypeTag(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                  <span class="rel-detail__issue-title">{{ issue.title }}</span>
                </div>
                <div class="rel-detail__issue-right">
                  <el-tag :type="issueStatusTag(issue.status)" size="small">{{ issueStatusLabel(issue.status) }}</el-tag>
                  <span v-if="issue.assignee" class="rel-detail__issue-assignee">{{ issue.assignee }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="No issues in this release" :image-size="40" />
          </div>

          <div class="rel-detail__dates">
            <div v-if="release.target_date" class="rel-detail__date">
              <span class="rel-detail__date-label">Target Date</span>
              <span>{{ formatDate(release.target_date) }}</span>
            </div>
            <div v-if="release.release_date" class="rel-detail__date">
              <span class="rel-detail__date-label">Released</span>
              <span>{{ formatDate(release.release_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-dialog v-model="editDialog.visible" title="Edit Release" width="560px" destroy-on-close>
        <el-form ref="editFormRef" :model="editDialog.form" :rules="rules" label-width="100px">
          <el-form-item label="Version" prop="version">
            <el-input v-model="editDialog.form.version" maxlength="30" />
          </el-form-item>
          <el-form-item label="Name" prop="name">
            <el-input v-model="editDialog.form.name" maxlength="100" />
          </el-form-item>
          <el-form-item label="Notes">
            <el-input v-model="editDialog.form.notes" type="textarea" :rows="3" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Status">
                <el-select v-model="editDialog.form.status" style="width: 100%">
                  <el-option v-for="(label, val) in RELEASE_STATUS_MAP" :key="val" :label="label" :value="val" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Target Date">
                <el-date-picker v-model="editDialog.form.target_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
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

    <div v-else-if="!loading" class="rel-detail__not-found">
      <el-result icon="error" title="Release not found">
        <template #extra><el-button type="primary" @click="goBack">Back</el-button></template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts" name="releaseDetail">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Edit, Delete, Folder, VideoPlay, CircleCheck } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useReleaseStore } from "@/stores/modules/release";
import { RELEASE_STATUS_MAP } from "@/api/modules/releaseService";
import type { ReleaseStatus } from "@/api/modules/releaseService";
import { getIssueList, issueStatusLabel, issueStatusTag, typeLabel, issueTypeTag } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import type { Cycle } from "@/api/modules/cycleService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { formatDate } from "@/utils/datetime";

const route = useRoute();
const router = useRouter();
const store = useReleaseStore();
const { render: renderMarkdown } = useMarkdown();

const loading = ref(true);
const release = computed(() => store.currentRelease);
const issues = ref<Issue[]>([]);
const editFormRef = ref<FormInstance>();
const linkedCycles = ref<Cycle[]>([]);

const rules: FormRules = {
  version: [{ required: true, message: "Version is required", trigger: "blur" }],
  name: [{ required: true, message: "Name is required", trigger: "blur" }]
};

const editDialog = reactive({
  visible: false, submitting: false,
  form: { version: "", name: "", notes: "", status: "planned" as ReleaseStatus, target_date: "" }
});

const deploySteps = [
  { label: "Development" },
  { label: "Code Review" },
  { label: "QA Testing" },
  { label: "Staging" },
  { label: "Production" }
];

const activeDeployStep = computed(() => {
  if (release.value?.status === "released") return 4;
  if (release.value?.status === "in_progress") return 2;
  return 0;
});

const doneCount = computed(() => issues.value.filter(i => i.status === "done").length);
const inProgressCount = computed(() => issues.value.filter(i => i.status === "in_progress").length);
const pendingCount = computed(() => issues.value.filter(i => i.status !== "done" && i.status !== "cancelled").length);
const reqCount = computed(() => issues.value.filter(i => i.issue_type === "requirement").length);

const progressPct = computed(() => {
  if (!issues.value.length) return 0;
  if (release.value?.status === "released") return 100;
  return Math.round((doneCount.value / issues.value.length) * 100);
});

const progressColor = computed(() => {
  if (progressPct.value >= 100) return "#67c23a";
  if (progressPct.value >= 50) return "#409eff";
  return "#e6a23c";
});

const renderedNotes = computed(() => {
  if (!release.value?.notes) return "";
  return renderMarkdown(release.value.notes);
});

function openEdit() {
  if (!release.value) return;
  editDialog.form = {
    version: release.value.version, name: release.value.name,
    notes: release.value.notes || "", status: release.value.status,
    target_date: release.value.target_date || ""
  };
  editDialog.visible = true;
}

async function submitEdit() {
  const valid = await editFormRef.value?.validate().catch(() => false);
  if (!valid || !release.value) return;
  editDialog.submitting = true;
  try {
    await store.editRelease(release.value.key, editDialog.form);
    ElMessage.success("Release updated");
    editDialog.visible = false;
  } finally { editDialog.submitting = false; }
}

async function handleDelete() {
  if (!release.value) return;
  try {
    await ElMessageBox.confirm(`Delete release "${release.value.version}"?`, "Delete", { type: "error" });
    await store.removeRelease(release.value.key, release.value.project_key);
    ElMessage.success("Release deleted");
    goBack();
  } catch { /* cancelled */ }
}

async function startRelease() {
  if (!release.value) return;
  await store.editRelease(release.value.key, { status: "in_progress" });
  ElMessage.success("Release started");
}

async function completeRelease() {
  if (!release.value) return;
  await store.editRelease(release.value.key, {
    status: "released",
    release_date: new Date().toISOString().slice(0, 10)
  });
  ElMessage.success("Release completed!");
}

async function loadIssues() {
  if (!release.value?.issue_keys?.length) return;
  try {
    const res = await getIssueList({ project_key: release.value.project_key, pageSize: 500 });
    const all = (res.data?.list as Issue[]) ?? [];
    issues.value = all.filter(i => release.value!.issue_keys!.includes(i.key));
  } catch { /* ignore */ }
}

async function loadLinkedCycles() {
  if (!release.value?.project_key) return;
  try {
    const res = await getCycleList({ project_key: release.value.project_key, pageSize: 100 });
    const all = (res.data?.list as Cycle[]) ?? [];
    linkedCycles.value = all.filter(c => c.issue_keys?.some(k => release.value!.issue_keys?.includes(k)));
  } catch { /* ignore */ }
}

function releaseCycleIssueCount(c: Cycle) {
  return (c.issue_keys || []).filter(k => release.value?.issue_keys?.includes(k)).length;
}

function goBack() {
  if (release.value?.project_key) router.push(`/project/${release.value.project_key}`);
  else router.push("/release");
}

function statusLabel(s: ReleaseStatus) { return RELEASE_STATUS_MAP[s] || s; }
function statusTagType(s: ReleaseStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<ReleaseStatus, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", released: "success" };
  return m[s] || "info";
}
onMounted(async () => {
  const key = route.params.key as string;
  if (key) {
    await store.fetchRelease(key);
    await loadIssues();
    await loadLinkedCycles();
  }
  loading.value = false;
});
</script>

<style scoped lang="scss">
.rel-detail { padding: 24px; height: calc(100vh - 95px); overflow: auto; background: var(--el-bg-color-page); }
.rel-detail__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.rel-detail__head-left { display: flex; align-items: flex-start; gap: 16px; }
.rel-detail__title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.rel-detail__version { margin: 0; font-size: 22px; font-weight: 700; font-family: monospace; }
.rel-detail__meta { display: flex; gap: 10px; align-items: center; code { font-size: 12px; color: var(--el-text-color-secondary); background: var(--el-fill-color-light); padding: 1px 8px; border-radius: 4px; } }
.rel-detail__name { font-size: 14px; color: var(--el-text-color-secondary); }
.rel-detail__project { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--el-text-color-secondary); }
.rel-detail__head-actions { display: flex; gap: 8px; }
.rel-detail__body { max-width: 900px; }
.rel-detail__stats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 20px; }
.rel-detail__stat { background: var(--el-fill-color-lighter); border-radius: 10px; padding: 20px; text-align: center; }
.rel-detail__stat--done { background: var(--el-color-success-light-9); .rel-detail__stat-value { color: var(--el-color-success); } }
.rel-detail__stat--progress { background: var(--el-color-primary-light-9); .rel-detail__stat-value { color: var(--el-color-primary); } }
.rel-detail__stat--pending { background: var(--el-color-warning-light-9); .rel-detail__stat-value { color: var(--el-color-warning); } }
.rel-detail__stat--cycles { background: var(--el-color-primary-light-9); .rel-detail__stat-value { color: var(--el-color-primary); } }
.rel-detail__stat--reqs { background: var(--el-color-info-light-9); .rel-detail__stat-value { color: var(--el-color-info); } }
.rel-detail__stat-value { font-size: 28px; font-weight: 700; }
.rel-detail__stat-label { font-size: 13px; color: var(--el-text-color-secondary); margin-top: 4px; }
.rel-detail__deploy { margin-bottom: 24px; h3 { margin: 0 0 12px; font-size: 15px; } }
.rel-detail__deploy-steps { display: flex; flex-direction: column; gap: 0; padding-left: 8px; }
.rel-detail__deploy-step { display: flex; align-items: flex-start; gap: 12px; padding: 8px 0; }
.rel-detail__deploy-dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; transition: background 0.3s; }
.rel-detail__deploy-info { display: flex; flex-direction: column; }
.rel-detail__deploy-label { font-size: 14px; font-weight: 500; }
.rel-detail__deploy-status { font-size: 12px; color: var(--el-text-color-placeholder); }
.rel-detail__deploy-step--done { .rel-detail__deploy-label { color: var(--el-color-success); } }
.rel-detail__notes { margin-bottom: 24px; h3 { margin: 0 0 8px; font-size: 15px; } }
.rel-detail__section { h3 { margin: 0 0 12px; font-size: 15px; } }
.rel-detail__issue-list { display: flex; flex-direction: column; gap: 4px; }
.rel-detail__issue { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: var(--el-fill-color-light); } }
.rel-detail__issue-left { display: flex; align-items: center; gap: 10px; }
.rel-detail__issue-title { font-size: 14px; font-weight: 500; }
.rel-detail__issue-right { display: flex; align-items: center; gap: 10px; }
.rel-detail__issue-assignee { font-size: 12px; color: var(--el-text-color-placeholder); }
.rel-detail__dates { display: flex; gap: 24px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--el-border-color-lighter); }
.rel-detail__date { display: flex; flex-direction: column; gap: 4px; }
.rel-detail__date-label { font-size: 12px; color: var(--el-text-color-placeholder); }
.rel-detail__not-found { padding: 80px 0; }
.rel-detail__cycle-list { display: flex; flex-direction: column; gap: 8px; }
.rel-detail__cycle-item {
  padding: 10px 12px; border-radius: 8px; cursor: pointer;
  background: var(--el-fill-color-lighter);
  &:hover { background: var(--el-fill-color-light); }
}
.rel-detail__cycle-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.rel-detail__cycle-name { font-size: 14px; font-weight: 500; }
.rel-detail__cycle-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--el-text-color-placeholder); }
</style>