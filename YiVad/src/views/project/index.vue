<template>
  <div class="project-list">
    <div class="project-list__head">
      <div class="project-list__head-left">
        <h1 class="project-list__title">Projects</h1>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
      </div>
      <div class="project-list__head-actions">
        <el-input
          v-model="searchText"
          class="project-list__search"
          size="small"
          clearable
          placeholder="Search projects…"
          :prefix-icon="Search"
        />
        <el-select v-model="sortBy" class="project-list__sort" size="small">
          <el-option label="Recently updated" value="updated" />
          <el-option label="Name A–Z" value="name" />
          <el-option label="Most issues" value="issues" />
          <el-option label="Most done" value="done" />
        </el-select>
        <el-select
          v-model="statusFilter"
          class="project-list__status"
          size="small"
          @change="(v: string) => applyStatusFilter(v)"
        >
          <el-option label="Active" value="active" />
          <el-option label="Archived" value="archived" />
          <el-option label="All" value="" />
        </el-select>
        <el-button
          :type="showStarredOnly ? 'warning' : ''"
          size="small"
          :icon="Star"
          @click="showStarredOnly = !showStarredOnly"
        >
          Starred
        </el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">New Project</el-button>
      </div>
    </div>

    <div class="project-list__summary">
      <div
        class="project-summary__tile project-summary__tile--clickable"
        :class="{ 'project-summary__tile--active-filter': !statusFilter }"
        title="Show all projects"
        @click="applyStatusFilter('')"
      >
        <span class="project-summary__value">{{ allProjects.length || store.total }}</span>
        <span class="project-summary__label">Projects</span>
        <span class="project-summary__sub">{{ activeCount }} active</span>
      </div>
      <div
        class="project-summary__tile project-summary__tile--active project-summary__tile--clickable"
        :class="{ 'project-summary__tile--active-filter': statusFilter === 'active' }"
        title="Filter active"
        @click="toggleStatusFilter('active')"
      >
        <span class="project-summary__value">{{ activeCount }}</span>
        <span class="project-summary__label">Active</span>
        <span class="project-summary__sub">{{ pctLabel(activeCount) }}</span>
      </div>
      <div
        class="project-summary__tile project-summary__tile--archived project-summary__tile--clickable"
        :class="{ 'project-summary__tile--active-filter': statusFilter === 'archived' }"
        title="Filter archived"
        @click="toggleStatusFilter('archived')"
      >
        <span class="project-summary__value">{{ archivedCount }}</span>
        <span class="project-summary__label">Archived</span>
        <span class="project-summary__sub">{{ pctLabel(archivedCount) }}</span>
      </div>
      <div
        class="project-summary__tile project-summary__tile--issues project-summary__tile--clickable"
        title="Open issues"
        @click="router.push('/issue')"
      >
        <span class="project-summary__value">{{ totalIssues }}</span>
        <span class="project-summary__label">Issues</span>
        <span class="project-summary__sub">{{ totalDone }} done</span>
      </div>
      <div
        class="project-summary__tile project-summary__tile--requirements project-summary__tile--clickable"
        title="Open requirements"
        @click="router.push('/issue')"
      >
        <span class="project-summary__value">{{ totalRequirements }}</span>
        <span class="project-summary__label">Requirements</span>
        <span class="project-summary__sub">of {{ totalIssues }} issues</span>
      </div>
      <div class="project-summary__tile project-summary__tile--progress">
        <span class="project-summary__value">{{ overallCompletion }}%</span>
        <span class="project-summary__label">Completed</span>
        <span class="project-summary__sub">{{ totalDone }} of {{ totalIssues }}</span>
      </div>
      <div
        class="project-summary__tile project-summary__tile--cycles project-summary__tile--clickable"
        title="Open cycles"
        @click="router.push('/cycle')"
      >
        <span class="project-summary__value">{{ totalActiveCycles }}</span>
        <span class="project-summary__label">Active Cycles</span>
        <span class="project-summary__sub">{{ totalActiveCycles }} of {{ totalCycles }}</span>
      </div>
    </div>

    <div v-loading="store.loading" class="project-list__grid">
      <el-card
        v-for="project in displayedProjects"
        :key="project.key"
        class="project-card"
        :class="{ 'project-card--archived': project.status === 'archived' }"
        shadow="hover"
        @click="goDetail(project.key)"
      >
        <div class="project-card__cover" :style="coverStyle(project)">
          <span v-if="!project.cover_image" class="project-card__cover-icon">{{ avatarChar(project.name) }}</span>
          <span class="project-card__cover-id">{{ project.identifier }}</span>
        </div>
        <div class="project-card__body">
          <div class="project-card__name-row">
            <span class="project-card__name" :title="project.name">{{ project.name }}</span>
            <el-button
              link
              size="small"
              :icon="Star"
              :type="starredKeys.has(project.key) ? 'warning' : 'info'"
              @click.stop="toggleStar(project.key)"
              class="project-card__star"
            />
          </div>
          <div class="project-card__meta">
            <code class="project-card__id-chip" title="Copy identifier" @click.stop="copyIdentifier(project)">{{ project.identifier }}</code>
            <el-tag :type="project.status === 'active' ? 'success' : 'info'" size="small">
              {{ project.status }}
            </el-tag>
            <span class="project-card__date">Updated {{ formatRelativeTime(project.updated_at) }}</span>
          </div>
          <div v-if="project.description" class="project-card__desc" v-html="descHtml(project)" />
          <div v-else class="project-card__desc project-card__desc--empty">No description</div>

          <div v-if="statsFor(project).issues" class="project-card__progress">
            <div class="project-card__progress-row">
              <span>{{ statsFor(project).done }} / {{ statsFor(project).issues }} done</span>
              <span>{{ completionPct(project) }}%</span>
            </div>
            <el-progress :percentage="completionPct(project)" :stroke-width="6" :show-text="false" :color="progressColor(project)" />
          </div>

          <div class="project-card__stats">
            <button type="button" class="project-card__stat" title="View issues" @click.stop="goTab(project.key, 'issues')">
              <el-icon><Tickets /></el-icon>
              <span>{{ statsFor(project).issues }}</span>
              <span class="project-card__stat-label">Issues</span>
            </button>
            <button type="button" class="project-card__stat" title="View cycles" @click.stop="goTab(project.key, 'cycles')">
              <el-icon><Calendar /></el-icon>
              <span>{{ statsFor(project).cycles }}</span>
              <span class="project-card__stat-label">Cycles</span>
            </button>
            <button type="button" class="project-card__stat" title="View releases" @click.stop="goTab(project.key, 'releases')">
              <el-icon><Promotion /></el-icon>
              <span>{{ statsFor(project).releases }}</span>
              <span class="project-card__stat-label">Releases</span>
            </button>
          </div>

          <div v-if="statsFor(project).activeCycles || statsFor(project).pendingReleases" class="project-card__live">
            <span v-if="statsFor(project).activeCycles" class="project-card__live-chip" @click.stop="goTab(project.key, 'cycles')">
              <span class="project-card__live-dot project-card__live-dot--cycle" />
              {{ statsFor(project).activeCycles }} active cycle{{ statsFor(project).activeCycles > 1 ? 's' : '' }}
            </span>
            <span v-if="statsFor(project).pendingReleases" class="project-card__live-chip" @click.stop="goTab(project.key, 'releases')">
              <span class="project-card__live-dot project-card__live-dot--release" />
              {{ statsFor(project).pendingReleases }} pending release{{ statsFor(project).pendingReleases > 1 ? 's' : '' }}
            </span>
          </div>

          <div class="project-card__footer">
            <div class="project-card__members" @click.stop="goTab(project.key, 'members')">
              <template v-if="project.members?.length">
                <el-avatar
                  v-for="m in visibleMembers(project)"
                  :key="m.user_id"
                  :size="24"
                  :src="m.avatar"
                  :title="m.username"
                >
                  {{ m.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <span v-if="extraMembers(project)" class="project-card__members-more">+{{ extraMembers(project) }}</span>
              </template>
              <span v-else class="project-card__members-empty">No members</span>
            </div>
            <div class="project-card__actions">
              <el-button link size="small" type="primary" @click.stop="goDetail(project.key)">Open</el-button>
              <el-button link size="small" @click.stop="openEdit(project)">Edit</el-button>
              <el-button
                v-if="project.status === 'active'"
                link size="small" type="warning"
                @click.stop="archiveProject(project)"
              >Archive</el-button>
              <el-button
                v-else
                link size="small" type="success"
                @click.stop="restoreProject(project)"
              >Restore</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <div v-if="!store.loading && !store.projects.length" class="project-list__empty">
        <el-empty description="No projects yet">
          <el-button type="primary" @click="openCreate">Create your first project</el-button>
        </el-empty>
      </div>
      <div v-else-if="!store.loading && store.projects.length && !displayedProjects.length" class="project-list__empty">
        <el-empty description="No matching projects" />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? 'Edit Project' : 'New Project'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Project name" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="Identifier" prop="identifier">
          <el-input v-model="dialog.form.identifier" placeholder="e.g. PLANE" maxlength="12" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" placeholder="Project description" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="dialog.form.status">
            <el-radio value="active">Active</el-radio>
            <el-radio value="archived">Archived</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="projectList">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Star, Search, Tickets, Calendar, Promotion } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { useMarkdown } from "@/hooks/useMarkdown";
import { getProjectList } from "@/api/modules/projectService";
import type { Project, ProjectMember } from "@/api/modules/projectService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import type { Cycle } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";
import type { Release } from "@/api/modules/releaseService";

const router = useRouter();
const store = useProjectStore();
const { render: renderMarkdown } = useMarkdown();
const formRef = ref<FormInstance>();
const statusFilter = ref("");
const showStarredOnly = ref(false);
const searchText = ref("");
const sortBy = ref<"updated" | "name" | "issues" | "done">("updated");

const starredKeys = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem("starred_projects") || "[]")));

// ── Per-project aggregate stats (issues / cycles / releases) ──────────────
interface ProjectStats {
  issues: number;
  done: number;
  requirements: number;
  cycles: number;
  activeCycles: number;
  releases: number;
  pendingReleases: number;
}

const EMPTY_STATS: ProjectStats = { issues: 0, done: 0, requirements: 0, cycles: 0, activeCycles: 0, releases: 0, pendingReleases: 0 };
const statsByKey = ref<Map<string, ProjectStats>>(new Map());
const allProjects = ref<Project[]>([]);

async function loadStats() {
  try {
    const [issueRes, cycleRes, releaseRes, projectRes] = await Promise.all([
      getIssueList({ pageSize: 1000 }),
      getCycleList({ pageSize: 300 }),
      getReleaseList({ pageSize: 300 }),
      getProjectList({ pageSize: 500 })
    ]);
    allProjects.value = (projectRes.data?.list as Project[]) ?? [];
    const issues = (issueRes.data?.list as Issue[]) ?? [];
    const cycles = (cycleRes.data?.list as Cycle[]) ?? [];
    const releases = (releaseRes.data?.list as Release[]) ?? [];
    const map = new Map<string, ProjectStats>();
    const ensure = (key: string): ProjectStats => {
      let s = map.get(key);
      if (!s) {
        s = { ...EMPTY_STATS };
        map.set(key, s);
      }
      return s;
    };
    for (const i of issues) {
      const s = ensure(i.project_key);
      s.issues++;
      if (i.status === "done") s.done++;
      if (i.issue_type === "requirement") s.requirements++;
    }
    for (const c of cycles) {
      const s = ensure(c.project_key);
      s.cycles++;
      if (c.status === "active") s.activeCycles++;
    }
    for (const r of releases) {
      const s = ensure(r.project_key);
      s.releases++;
      if (r.status !== "released") s.pendingReleases++;
    }
    statsByKey.value = map;
  } catch {
    // stats are best-effort — the list still renders without them
  }
}

function statsFor(project: Project): ProjectStats {
  return statsByKey.value.get(project.key) ?? EMPTY_STATS;
}

function completionPct(project: Project): number {
  const s = statsFor(project);
  if (!s.issues) return 0;
  return Math.round((s.done / s.issues) * 100);
}

function progressColor(project: Project): string {
  const pct = completionPct(project);
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
}

// Pre-render markdown descriptions once per project list change (not per hover).
const descHtmlMap = computed(() => {
  const map = new Map<string, string>();
  for (const p of store.projects) {
    if (p.description) map.set(p.key, renderMarkdown(p.description));
  }
  return map;
});

function descHtml(project: Project): string {
  return descHtmlMap.value.get(project.key) || "";
}

// ── Cover gradient (deterministic per project) ────────────────────────────
const COVER_GRADIENTS: Array<[string, string]> = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#30cfd0", "#330867"],
  ["#a8edea", "#fed6e3"],
  ["#ff9a9e", "#fecfef"]
];

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function coverStyle(project: Project) {
  if (project.cover_image) {
    return { backgroundImage: `url(${project.cover_image})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  const [from, to] = COVER_GRADIENTS[hashKey(project.key) % COVER_GRADIENTS.length];
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
}

function toggleStar(projectKey: string) {
  if (starredKeys.value.has(projectKey)) {
    starredKeys.value.delete(projectKey);
  } else {
    starredKeys.value.add(projectKey);
  }
  localStorage.setItem("starred_projects", JSON.stringify([...starredKeys.value]));
}

const displayedProjects = computed(() => {
  let list = store.projects;
  if (showStarredOnly.value) list = list.filter(p => starredKeys.value.has(p.key));
  const q = searchText.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.identifier.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.members || []).some(m => m.username.toLowerCase().includes(q))
    );
  }
  const sorted = [...list];
  if (sortBy.value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === "issues") {
    sorted.sort((a, b) => (statsByKey.value.get(b.key)?.issues ?? 0) - (statsByKey.value.get(a.key)?.issues ?? 0));
  } else if (sortBy.value === "done") {
    sorted.sort((a, b) => completionPct(b) - completionPct(a));
  } else {
    sorted.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
  }
  return sorted;
});

const activeCount = computed(() => allProjects.value.filter(p => p.status === "active").length);
const archivedCount = computed(() => allProjects.value.filter(p => p.status === "archived").length);
const totalIssues = computed(() => [...statsByKey.value.values()].reduce((s, v) => s + v.issues, 0));
const totalRequirements = computed(() => [...statsByKey.value.values()].reduce((s, v) => s + v.requirements, 0));
const totalDone = computed(() => [...statsByKey.value.values()].reduce((s, v) => s + v.done, 0));
const overallCompletion = computed(() => (totalIssues.value ? Math.round((totalDone.value / totalIssues.value) * 100) : 0));
const totalActiveCycles = computed(() => [...statsByKey.value.values()].reduce((s, v) => s + v.activeCycles, 0));
const totalCycles = computed(() => [...statsByKey.value.values()].reduce((s, v) => s + v.cycles, 0));
function pctLabel(count: number): string {
  const total = allProjects.value.length || store.total;
  if (!total) return "";
  return `${Math.round((count / total) * 100)}% of all`;
}
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || showStarredOnly.value;
  return isFiltered ? `${displayedProjects.value.length} of ${store.total} projects` : `${store.total} projects`;
});

watch(
  () => store.projects,
  projects => {
    const keys = new Set(projects.map(p => p.key));
    let changed = false;
    for (const k of starredKeys.value) {
      if (!keys.has(k)) {
        starredKeys.value.delete(k);
        changed = true;
      }
    }
    if (changed) localStorage.setItem("starred_projects", JSON.stringify([...starredKeys.value]));
  }
);

const rules: FormRules = {
  name: [{ required: true, message: "Project name is required", trigger: "blur" }],
  identifier: [
    { required: true, message: "Identifier is required", trigger: "blur" },
    { pattern: /^[A-Z][A-Z0-9_]{0,11}$/, message: "Uppercase letters, digits, underscores only", trigger: "blur" }
  ]
};

interface ProjectForm {
  name: string;
  identifier: string;
  description: string;
  status: "active" | "archived";
  members: ProjectMember[];
  cover_image: string;
}

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    name: "",
    identifier: "",
    description: "",
    status: "active" as const,
    members: [] as ProjectMember[],
    cover_image: ""
  } as ProjectForm
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", identifier: "", description: "", status: "active", members: [] as ProjectMember[], cover_image: "" };
  dialog.visible = true;
}

function openEdit(project: Project) {
  dialog.isEdit = true;
  dialog.editKey = project.key;
  dialog.form = {
    name: project.name,
    identifier: project.identifier,
    description: project.description || "",
    status: project.status,
    members: project.members || [],
    cover_image: project.cover_image || ""
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editProject(dialog.editKey, {
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status
      });
      ElMessage.success("Project updated");
    } else {
      const key = dialog.form.identifier.toLowerCase() + "-" + Date.now().toString(36);
      await store.addProject({
        key,
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status,
        members: [{ user_id: "admin", username: "Admin", role: "owner" }],
        cover_image: dialog.form.cover_image
      });
      ElMessage.success("Project created");
    }
    dialog.visible = false;
  } finally {
    dialog.submitting = false;
  }
}

function goDetail(key: string) {
  router.push(`/project/${key}`);
}

function goTab(key: string, tab: "overview" | "issues" | "cycles" | "releases" | "pages" | "members") {
  router.push({ path: `/project/${key}`, query: { tab } });
}

function avatarChar(name: string) {
  return name.charAt(0).toUpperCase();
}

function visibleMembers(project: Project): ProjectMember[] {
  return (project.members || []).slice(0, 5);
}

function extraMembers(project: Project): number {
  return Math.max(0, (project.members?.length || 0) - 5);
}

async function archiveProject(project: Project) {
  await store.editProject(project.key, { status: "archived" });
  ElMessage.success(`"${project.name}" archived`);
}

async function restoreProject(project: Project) {
  await store.editProject(project.key, { status: "active" });
  ElMessage.success(`"${project.name}" restored`);
}

function applyStatusFilter(v: string) {
  statusFilter.value = v;
  store.fetchProjects({ status: v || undefined });
}

function toggleStatusFilter(v: string) {
  applyStatusFilter(statusFilter.value === v ? "" : v);
}

async function copyIdentifier(project: Project) {
  try {
    await navigator.clipboard.writeText(project.identifier);
    ElMessage.success(`Copied ${project.identifier}`);
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

onMounted(() => {
  store.fetchProjects();
  loadStats();
});
</script>

<style scoped lang="scss">
.project-list {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.project-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.project-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.project-list__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.project-list__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.project-list__search {
  width: 220px;
}
.project-list__sort {
  width: 150px;
}
.project-list__status {
  width: 130px;
}
.project-list__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.project-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.project-summary__tile--clickable {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
    border-color: var(--el-color-primary-light-5);
  }
}
.project-summary__tile--active-filter {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
}
.project-summary__value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.project-summary__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.project-summary__sub {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.project-summary__tile--active .project-summary__value { color: var(--el-color-success); }
.project-summary__tile--archived .project-summary__value { color: var(--el-text-color-placeholder); }
.project-summary__tile--issues .project-summary__value { color: var(--el-color-primary); }
.project-summary__tile--progress .project-summary__value { color: var(--el-color-warning); }
.project-summary__tile--cycles .project-summary__value { color: var(--el-color-info); }
.project-summary__tile--requirements .project-summary__value { color: #7c3aed; }
.project-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.project-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
  :deep(.el-card__body) {
    padding: 0;
  }
}
.project-card--archived {
  .project-card__cover {
    filter: grayscale(0.7) brightness(0.85);
  }
  .project-card__name {
    color: var(--el-text-color-secondary);
  }
}
.project-card__cover {
  position: relative;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.project-card__cover-icon {
  font-size: 44px;
  font-weight: 700;
  color: #fff;
  opacity: 0.9;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.project-card__cover-id {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.85);
}
.project-card__body {
  padding: 16px;
}
.project-card__name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.project-card__name {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-card__star {
  opacity: 0.4;
  flex-shrink: 0;
  &:hover { opacity: 1; }
}
.project-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    padding: 1px 6px;
    border-radius: 3px;
  }
}
.project-card__id-chip {
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.project-card__date {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.project-card__desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
  line-height: 1.55;
  word-break: break-word;
  &--empty {
    color: var(--el-text-color-placeholder);
    font-style: italic;
  }
  :deep(p) { margin: 0 0 8px; }
  :deep(p:last-child) { margin-bottom: 0; }
  :deep(strong) {
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
  :deep(em) { font-style: italic; }
  :deep(code) {
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-danger);
    background: var(--el-fill-color-light);
    padding: 1px 5px;
    border-radius: 3px;
  }
  :deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
  :deep(ul),
  :deep(ol) {
    margin: 0 0 8px;
    padding-left: 18px;
  }
  :deep(li) { margin: 2px 0; }
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  :deep(blockquote) {
    margin: 0 0 8px;
    padding-left: 10px;
    border-left: 3px solid var(--el-border-color);
    color: var(--el-text-color-placeholder);
  }
  :deep(pre) {
    margin: 0 0 8px;
    padding: 8px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
    overflow: auto;
    font-size: 12px;
  }
}
.project-card__progress {
  margin-bottom: 12px;
}
.project-card__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.project-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.project-card__stat {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
  .el-icon { font-size: 14px; }
}
.project-card__stat-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-card__live {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.project-card__live-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-radius: 999px;
  padding: 3px 10px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.project-card__live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  &--cycle { background: var(--el-color-warning); }
  &--release { background: var(--el-color-success); }
}
.project-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.project-card__members {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  :deep(.el-avatar) {
    border: 2px solid var(--el-bg-color);
    background: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    font-size: 12px;
    &:not(:first-child) { margin-left: -10px; }
  }
}
.project-card__members-more {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 2px;
}
.project-card__members-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.project-card__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.project-list__empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>
