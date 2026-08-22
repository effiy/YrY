<template>
  <div class="releases">
    <div class="releases__head">
      <div class="releases__head-left">
        <h1 class="releases__title">Releases</h1>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
      </div>
      <div class="releases__head-actions">
        <template v-if="!props.projectKey">
          <el-input
            v-model="searchText"
            class="releases__search"
            size="small"
            clearable
            placeholder="Search releases…"
            :prefix-icon="Search"
          />
          <el-select v-model="statusFilter" class="releases__status" size="small">
            <el-option label="All" value="" />
            <el-option label="Planned" value="planned" />
            <el-option label="In Progress" value="in_progress" />
            <el-option label="Released" value="released" />
          </el-select>
          <el-select v-model="sortBy" class="releases__sort" size="small">
            <el-option label="Target date" value="date" />
            <el-option label="Version" value="version" />
            <el-option label="Most issues" value="issues" />
          </el-select>
          <el-select v-model="projectFilter" placeholder="Filter by project" clearable class="releases__project" size="small" @change="loadData">
            <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </template>
        <el-button type="primary" :icon="Plus" @click="openCreate">New Release</el-button>
      </div>
    </div>

    <div v-if="!props.projectKey" class="releases__summary">
      <div class="release-summary__tile release-summary__tile--clickable" @click="clearStatus">
        <span class="release-summary__value">{{ store.total }}</span>
        <span class="release-summary__label">Releases</span>
      </div>
      <div class="release-summary__tile release-summary__tile--planned release-summary__tile--clickable" @click="setStatusFilter('planned')">
        <span class="release-summary__value">{{ plannedCount }}</span>
        <span class="release-summary__label">Planned</span>
      </div>
      <div class="release-summary__tile release-summary__tile--progress release-summary__tile--clickable" @click="setStatusFilter('in_progress')">
        <span class="release-summary__value">{{ inProgressCount }}</span>
        <span class="release-summary__label">In Progress</span>
      </div>
      <div class="release-summary__tile release-summary__tile--released release-summary__tile--clickable" @click="setStatusFilter('released')">
        <span class="release-summary__value">{{ releasedCount }}</span>
        <span class="release-summary__label">Released</span>
      </div>
      <div class="release-summary__tile release-summary__tile--issues release-summary__tile--clickable" @click="goIssues">
        <span class="release-summary__value">{{ totalIssues }}</span>
        <span class="release-summary__label">Issues</span>
      </div>
      <div class="release-summary__tile release-summary__tile--done">
        <span class="release-summary__value">{{ overallCompletion }}%</span>
        <span class="release-summary__label">Completed</span>
      </div>
    </div>

    <div v-loading="store.loading" class="releases__grid">
      <el-card
        v-for="r in displayedReleases"
        :key="r.key"
        class="release-card"
        :class="{ 'release-card--muted': r.status === 'released' }"
        shadow="hover"
        @click="goDetail(r.key)"
      >
        <div class="release-card__status-bar" :style="{ background: statusColor(r.status) }" />
        <div class="release-card__body">
          <div class="release-card__top">
            <code class="release-card__version" title="Copy version" @click.stop="copyVersion(r)">{{ r.version }}</code>
            <el-tag :type="statusTagType(r.status)" size="small">{{ statusLabel(r.status) }}</el-tag>
          </div>
          <div class="release-card__name">{{ r.name }}</div>

          <button
            v-if="!props.projectKey && r.project_key"
            type="button"
            class="release-card__project"
            title="Open project"
            @click.stop="goProject(r.project_key)"
          >
            <el-icon><Folder /></el-icon>
            <span>{{ projectName(r.project_key) }}</span>
          </button>

          <div v-if="r.notes" class="release-card__notes" v-html="notesHtml(r)" />

          <div class="release-card__meta">
            <span class="release-card__time" :class="timeHintClass(r)">{{ timeHint(r) }}</span>
          </div>

          <div v-if="issueCount(r)" class="release-card__progress">
            <div class="release-card__progress-row">
              <span>{{ doneCount(r) }} / {{ issueCount(r) }} done</span>
              <span>{{ progressPct(r) }}%</span>
            </div>
            <el-progress :percentage="progressPct(r)" :stroke-width="6" :show-text="false" :color="progressColor(r)" />
          </div>

          <div class="release-card__footer">
            <div class="release-card__footer-left">
              <span class="release-card__issues">{{ issueCount(r) }} issues</span>
              <span class="release-card__updated">Updated {{ formatRelativeTime(r.updated_at) }}</span>
            </div>
            <div class="release-card__actions">
              <el-button link size="small" type="primary" @click.stop="goDetail(r.key)">Open</el-button>
              <el-button link size="small" @click.stop="openEdit(r)">Edit</el-button>
              <el-button link size="small" type="danger" @click.stop="handleDelete(r)">Delete</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <div v-if="!store.loading && !store.releases.length" class="releases__empty">
        <el-empty description="No releases yet">
          <el-button type="primary" @click="openCreate">Create your first release</el-button>
        </el-empty>
      </div>
      <div v-else-if="!store.loading && store.releases.length && !displayedReleases.length" class="releases__empty">
        <el-empty description="No matching releases" />
      </div>
    </div>

    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Release' : 'New Release'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Version" prop="version">
          <el-input v-model="dialog.form.version" placeholder="e.g. v1.2.0" maxlength="30" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Release name" maxlength="100" />
        </el-form-item>
        <el-form-item label="Notes">
          <el-input v-model="dialog.form.notes" type="textarea" :rows="3" placeholder="Release notes (Markdown)" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in RELEASE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Target Date">
              <el-date-picker v-model="dialog.form.target_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="!projectFilter" label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="releaseManagement">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Folder } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useReleaseStore } from "@/stores/modules/release";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { useProjectStore } from "@/stores/modules/project";
import { RELEASE_STATUS_MAP } from "@/api/modules/releaseService";
import type { ReleaseStatus, Release } from "@/api/modules/releaseService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { useMarkdown } from "@/hooks/useMarkdown";

const props = defineProps<{ projectKey?: string }>();

const store = useReleaseStore();
const projectStore = useProjectStore();
const router = useRouter();
const { render: renderMarkdown } = useMarkdown();

const projectFilter = ref(props.projectKey || "");
const formRef = ref<FormInstance>();
const projects = ref<{ key: string; name: string }[]>([]);
const searchText = ref("");
const statusFilter = ref("");
const sortBy = ref<"date" | "version" | "issues">("date");

// ── Per-release issue stats (real progress from issue status) ──────────────
const statsByKey = ref<Map<string, { issues: number; done: number }>>(new Map());

async function loadStats() {
  try {
    const res = await getIssueList({ project_key: projectFilter.value || undefined, pageSize: 1000 });
    const issues = (res.data?.list as Issue[]) ?? [];
    const map = new Map<string, { issues: number; done: number }>();
    for (const i of issues) {
      if (!i.release_key) continue;
      let s = map.get(i.release_key);
      if (!s) {
        s = { issues: 0, done: 0 };
        map.set(i.release_key, s);
      }
      s.issues++;
      if (i.status === "done") s.done++;
    }
    statsByKey.value = map;
  } catch {
    // stats are best-effort — the list still renders without them
  }
}

function issueCount(r: Release): number {
  const s = statsByKey.value.get(r.key);
  return s?.issues ?? (r.issue_keys?.length || 0);
}

function doneCount(r: Release): number {
  return statsByKey.value.get(r.key)?.done ?? 0;
}

function progressPct(r: Release): number {
  if (r.status === "released") return 100;
  const total = issueCount(r);
  if (!total) return 0;
  return Math.round((doneCount(r) / total) * 100);
}

function progressColor(r: Release): string {
  const pct = progressPct(r);
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
}

function projectName(key: string): string {
  return projects.value.find(p => p.key === key)?.name || key;
}

function timeHint(r: Release): string {
  if (r.status === "released") return r.release_date ? `Released ${formatDate(r.release_date)}` : "Released";
  if (r.status === "in_progress") {
    if (!r.target_date) return "In progress";
    const ms = new Date(r.target_date).getTime() - Date.now();
    if (ms < 0) return "Overdue";
    return `${Math.ceil(ms / 86400000)}d to target`;
  }
  return r.target_date ? `Target ${formatDate(r.target_date)}` : "Planned";
}

function timeHintClass(r: Release): string {
  if (r.status === "released") return "release-card__time--released";
  if (r.status === "planned") return "release-card__time--planned";
  // in_progress
  if (!r.target_date) return "release-card__time--progress";
  const ms = new Date(r.target_date).getTime() - Date.now();
  if (ms < 0) return "release-card__time--overdue";
  if (ms <= 3 * 86400000) return "release-card__time--soon";
  return "release-card__time--progress";
}

async function copyVersion(r: Release) {
  try {
    await navigator.clipboard.writeText(r.version);
    ElMessage.success(`Copied ${r.version}`);
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

// Pre-render markdown notes once per release list change (not per hover).
const notesHtmlMap = computed(() => {
  const map = new Map<string, string>();
  for (const r of store.releases) {
    if (r.notes) map.set(r.key, renderMarkdown(r.notes));
  }
  return map;
});

function notesHtml(r: Release): string {
  return notesHtmlMap.value.get(r.key) || "";
}

const displayedReleases = computed(() => {
  let list = store.releases;
  const q = searchText.value.trim().toLowerCase();
  if (q) {
    list = list.filter(r => r.version.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || projectName(r.project_key).toLowerCase().includes(q));
  }
  if (statusFilter.value) list = list.filter(r => r.status === statusFilter.value);
  const sorted = [...list];
  if (sortBy.value === "version") {
    sorted.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
  } else if (sortBy.value === "issues") {
    sorted.sort((a, b) => issueCount(b) - issueCount(a));
  } else {
    sorted.sort((a, b) => (b.target_date || b.release_date || "").localeCompare(a.target_date || a.release_date || ""));
  }
  return sorted;
});

const plannedCount = computed(() => store.releases.filter(r => r.status === "planned").length);
const inProgressCount = computed(() => store.releases.filter(r => r.status === "in_progress").length);
const releasedCount = computed(() => store.releases.filter(r => r.status === "released").length);
const totalIssues = computed(() => store.releases.reduce((s, r) => s + issueCount(r), 0));
const totalDone = computed(() => store.releases.reduce((s, r) => s + doneCount(r), 0));
const overallCompletion = computed(() => (totalIssues.value ? Math.round((totalDone.value / totalIssues.value) * 100) : 0));
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || !!statusFilter.value;
  return isFiltered ? `${displayedReleases.value.length} of ${store.total} releases` : `${store.total} releases`;
});

const rules: FormRules = {
  version: [{ required: true, message: "Version is required", trigger: "blur" }],
  name: [{ required: true, message: "Name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: {
    version: "", name: "", notes: "", status: "planned" as ReleaseStatus,
    target_date: "", project_key: "", issue_keys: [] as string[]
  }
});

async function loadData() {
  await store.fetchReleases({ project_key: projectFilter.value || undefined, pageSize: 100 });
  await loadStats();
}

function openCreate() {
  dialog.isEdit = false; dialog.editKey = "";
  dialog.form = { version: "", name: "", notes: "", status: "planned" as ReleaseStatus, target_date: "", project_key: projectFilter.value || "", issue_keys: [] };
  dialog.visible = true;
}

function openEdit(r: Release) {
  dialog.isEdit = true; dialog.editKey = r.key;
  dialog.form = { version: r.version, name: r.name, notes: r.notes || "", status: r.status, target_date: r.target_date || "", project_key: r.project_key, issue_keys: r.issue_keys || [] };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const data = {
      version: dialog.form.version, name: dialog.form.name,
      notes: dialog.form.notes, status: dialog.form.status,
      target_date: dialog.form.target_date,
      project_key: dialog.form.project_key || projectFilter.value || "",
      issue_keys: dialog.form.issue_keys
    };
    if (dialog.isEdit) {
      await store.editRelease(dialog.editKey, data);
      ElMessage.success("Release updated");
    } else {
      const key = `REL-${Date.now().toString(36).toUpperCase()}`;
      await store.addRelease({ key, ...data });
      ElMessage.success("Release created");
    }
    dialog.visible = false;
  } finally { dialog.submitting = false; }
}

async function handleDelete(r: Release) {
  try {
    await ElMessageBox.confirm(`Delete release "${r.version}"?`, "Delete", { type: "error" });
    await store.removeRelease(r.key, projectFilter.value || undefined);
    ElMessage.success("Release deleted");
    await loadStats();
  } catch { /* cancelled */ }
}

function statusLabel(s: ReleaseStatus) { return RELEASE_STATUS_MAP[s] || s; }
function statusColor(s: ReleaseStatus) { const m: Record<ReleaseStatus, string> = { planned: "#909399", in_progress: "#409eff", released: "#67c23a" }; return m[s] || "#909399"; }
function statusTagType(s: ReleaseStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<ReleaseStatus, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", released: "success" };
  return m[s] || "info";
}
function goDetail(key: string) { router.push(`/release/${key}`); }
function goProject(key: string) { if (key) router.push(`/project/${key}`); }
function goIssues() { router.push("/issue"); }
function setStatusFilter(status: string) {
  statusFilter.value = statusFilter.value === status ? "" : status;
}
function clearStatus() { statusFilter.value = ""; }

onMounted(async () => {
  const jobs: Promise<unknown>[] = [
    store.fetchReleases({ project_key: projectFilter.value || undefined, pageSize: 100 })
  ];
  if (!props.projectKey) {
    jobs.push(
      projectStore.fetchProjects({ pageSize: 100 }).then(() => {
        projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
      })
    );
  }
  await Promise.all(jobs);
  await loadStats();
});
</script>

<style scoped lang="scss">
.releases {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.releases__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.releases__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.releases__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.releases__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.releases__search { width: 200px; }
.releases__status { width: 130px; }
.releases__sort { width: 140px; }
.releases__project { width: 190px; }
.releases__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.release-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.release-summary__tile--clickable {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
    transform: translateY(-2px);
  }
}
.release-summary__value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.release-summary__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.release-summary__tile--planned .release-summary__value { color: var(--el-color-info); }
.release-summary__tile--progress .release-summary__value { color: var(--el-color-primary); }
.release-summary__tile--released .release-summary__value { color: var(--el-color-success); }
.release-summary__tile--issues .release-summary__value { color: var(--el-color-primary); }
.release-summary__tile--done .release-summary__value { color: var(--el-color-warning); }
.releases__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.release-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  :deep(.el-card__body) { padding: 0; }
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}
.release-card--muted {
  opacity: 0.82;
}
.release-card__status-bar {
  height: 3px;
}
.release-card__body {
  padding: 16px;
}
.release-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.release-card__version {
  font-size: 15px;
  font-weight: 700;
  font-family: monospace;
  cursor: pointer;
  transition: color 0.15s;
  &:hover {
    color: var(--el-color-primary);
  }
}
.release-card__name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.release-card__project {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: color 0.15s, background 0.15s;
  .el-icon { font-size: 13px; }
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.release-card__notes {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 10px;
  line-height: 1.55;
  word-break: break-word;
  :deep(p) { margin: 0 0 6px; }
  :deep(p:last-child) { margin-bottom: 0; }
  :deep(strong) { color: var(--el-text-color-primary); font-weight: 600; }
  :deep(code) {
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-danger);
    background: var(--el-fill-color-light);
    padding: 1px 5px;
    border-radius: 3px;
  }
  :deep(ul), :deep(ol) { margin: 0 0 6px; padding-left: 18px; }
  :deep(li) { margin: 2px 0; }
}
.release-card__meta {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.release-card__time {
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  padding: 1px 8px;
  &--released {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }
  &--planned {
    color: var(--el-color-info);
    background: var(--el-color-info-light-9);
  }
  &--progress {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &--soon {
    color: #fff;
    background: var(--el-color-warning);
  }
  &--overdue {
    color: #fff;
    background: var(--el-color-danger);
  }
}
.release-card__progress {
  margin-bottom: 12px;
}
.release-card__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.release-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.release-card__issues {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.release-card__footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.release-card__updated {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.release-card__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.releases__empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>
