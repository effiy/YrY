<template>
  <div class="proj-settings">
    <div class="proj-settings__head">
      <div class="proj-settings__head-left">
        <el-button text :icon="ArrowLeft" @click="router.push('/project')">Projects</el-button>
        <div class="proj-settings__cover" :style="coverStyle(project.cover_image)">
          <span v-if="!project.cover_image">{{ avatarChar(project.name) }}</span>
        </div>
        <div>
          <h1 class="proj-settings__title">{{ project.name || projectName }} Settings</h1>
          <div class="proj-settings__meta">
            <code>{{ project.identifier || projectKey }}</code>
            <el-tag :type="project.status === 'archived' ? 'info' : 'success'" size="small">{{ project.status || 'active' }}</el-tag>
          </div>
        </div>
      </div>
      <el-button :icon="Folder" @click="router.push(`/project/${projectKey}`)">Open Project</el-button>
    </div>

    <div class="proj-settings__stats">
      <div class="proj-settings__stat" @click="router.push(`/project/${projectKey}?tab=issues`)">
        <span class="proj-settings__stat-value">{{ stats.issues }}</span>
        <span class="proj-settings__stat-label">Issues</span>
      </div>
      <div class="proj-settings__stat proj-settings__stat--cycle" @click="router.push(`/project/${projectKey}?tab=cycles`)">
        <span class="proj-settings__stat-value">{{ stats.cycles }}</span>
        <span class="proj-settings__stat-label">Cycles</span>
      </div>
      <div class="proj-settings__stat proj-settings__stat--release" @click="router.push(`/project/${projectKey}?tab=releases`)">
        <span class="proj-settings__stat-value">{{ stats.releases }}</span>
        <span class="proj-settings__stat-label">Releases</span>
      </div>
      <div class="proj-settings__stat proj-settings__stat--member" @click="router.push(`/project/${projectKey}?tab=members`)">
        <span class="proj-settings__stat-value">{{ stats.members }}</span>
        <span class="proj-settings__stat-label">Members</span>
      </div>
    </div>

    <div class="proj-settings__body">
      <div class="proj-settings__section">
        <h3><el-icon><Setting /></el-icon>General</h3>
        <div class="proj-settings__row">
          <div class="proj-settings__row-label">
            <span>Default Assignee</span>
            <small>Auto-assign new issues to this user</small>
          </div>
          <el-input v-model="form.defaultAssignee" style="width: 240px" placeholder="Username" />
        </div>
        <div class="proj-settings__row">
          <div class="proj-settings__row-label">
            <span>Auto-close Issues</span>
            <small>Auto-close issues after this many days of inactivity</small>
          </div>
          <el-input-number v-model="form.autoCloseDays" :min="0" :max="365" />
        </div>
      </div>

      <div class="proj-settings__section">
        <h3><el-icon><View /></el-icon>Visibility</h3>
        <div class="proj-settings__row">
          <div class="proj-settings__row-label">
            <span>Public Project</span>
            <small>Visible to all workspace members</small>
          </div>
          <el-switch v-model="form.isPublic" />
        </div>
      </div>

      <div class="proj-settings__section">
        <h3><el-icon><WarningFilled /></el-icon>Danger Zone</h3>
        <div class="proj-settings__row">
          <div class="proj-settings__row-label">
            <span>Archive Project</span>
            <small>Archive this project and all its issues</small>
          </div>
          <el-button type="warning" size="small" @click="archiveProject">Archive</el-button>
        </div>
        <div class="proj-settings__row">
          <div class="proj-settings__row-label">
            <span>Delete Project</span>
            <small>Permanently delete this project and all data</small>
          </div>
          <el-button type="danger" size="small" @click="deleteProject">Delete</el-button>
        </div>
      </div>

      <div class="proj-settings__actions">
        <el-button type="primary" :loading="saving" :disabled="!dirty" @click="saveSettings">Save Settings</el-button>
        <el-button v-if="dirty" @click="discard">Discard</el-button>
        <el-tag v-if="dirty" size="small" type="warning" effect="light">Unsaved changes</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="projectSettings">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Folder, Setting, View, WarningFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { getLabelList, createLabel, updateLabel } from "@/api/modules/labelService";
import { getIssueList } from "@/api/modules/issueService";
import { getCycleList } from "@/api/modules/cycleService";
import { getReleaseList } from "@/api/modules/releaseService";
import type { Issue } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";
import type { Release } from "@/api/modules/releaseService";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const saving = ref(false);
const projectName = ref("");
const projectKey = ref("");
const project = reactive({ name: "", identifier: "", status: "", cover_image: "" });

const stats = reactive({ issues: 0, cycles: 0, releases: 0, members: 0 });

const form = reactive({
  defaultAssignee: "",
  autoCloseDays: 0,
  isPublic: true
});
const original = reactive({ defaultAssignee: "", autoCloseDays: 0, isPublic: true });

const dirty = computed(() =>
  form.defaultAssignee !== original.defaultAssignee ||
  form.autoCloseDays !== original.autoCloseDays ||
  form.isPublic !== original.isPublic
);

async function loadStats(key: string) {
  try {
    const [issueRes, cycleRes, releaseRes] = await Promise.all([
      getIssueList({ project_key: key, pageSize: 1000 }),
      getCycleList({ project_key: key, pageSize: 100 }),
      getReleaseList({ project_key: key, pageSize: 100 })
    ]);
    stats.issues = ((issueRes.data?.list as Issue[]) ?? []).length;
    stats.cycles = ((cycleRes.data?.list as Cycle[]) ?? []).length;
    stats.releases = ((releaseRes.data?.list as Release[]) ?? []).length;
  } catch { /* stats are best-effort */ }
}

async function loadSettings() {
  const key = route.params.key as string;
  projectKey.value = key;
  try {
    const p = await projectStore.fetchProject(key);
    if (p) {
      projectName.value = p.name;
      project.name = p.name;
      project.identifier = p.identifier;
      project.status = p.status;
      project.cover_image = p.cover_image || "";
      stats.members = p.members?.length || 0;
    }

    const res = await getLabelList({ pageSize: 200 });
    const settings = ((res.data?.list || []) as any[]).find(
      (l: any) => l._type === "project_settings" && l.project_key === key
    );
    if (settings) {
      form.defaultAssignee = settings.defaultAssignee || "";
      form.autoCloseDays = settings.autoCloseDays || 0;
      form.isPublic = settings.isPublic !== false;
    }
    original.defaultAssignee = form.defaultAssignee;
    original.autoCloseDays = form.autoCloseDays;
    original.isPublic = form.isPublic;
  } catch { /* ignore */ }
}

async function saveSettings() {
  saving.value = true;
  try {
    const data = {
      ...form, _type: "project_settings", project_key: projectKey.value,
      name: `settings_${projectKey.value}`, color: "#409eff"
    };
    const existingKey = `SET-PROJ-${projectKey.value}`;
    await updateLabel(existingKey, data as any).catch(async () => {
      await createLabel({ key: existingKey, ...data } as any);
    });
    original.defaultAssignee = form.defaultAssignee;
    original.autoCloseDays = form.autoCloseDays;
    original.isPublic = form.isPublic;
    ElMessage.success("Project settings saved");
  } finally { saving.value = false; }
}

function discard() {
  form.defaultAssignee = original.defaultAssignee;
  form.autoCloseDays = original.autoCloseDays;
  form.isPublic = original.isPublic;
}

async function archiveProject() {
  try {
    await ElMessageBox.confirm("Archive this project?", "Archive Project", { type: "warning" });
    await projectStore.editProject(projectKey.value, { status: "archived" });
    ElMessage.success("Project archived");
    router.push("/project");
  } catch { /* cancelled */ }
}

async function deleteProject() {
  try {
    await ElMessageBox.confirm("Permanently delete this project and all data?", "Delete Project", {
      confirmButtonText: "Delete", type: "error"
    });
    await projectStore.removeProject(projectKey.value);
    ElMessage.success("Project deleted");
    router.push("/project");
  } catch { /* cancelled */ }
}

function avatarChar(name: string) { return (name || "?").charAt(0).toUpperCase(); }
function coverStyle(cover?: string) {
  return cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover" } : {};
}

onMounted(() => { loadSettings(); loadStats(route.params.key as string); });
</script>

<style scoped lang="scss">
.proj-settings {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.proj-settings__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.proj-settings__head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.proj-settings__cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--el-color-primary-light-5), var(--el-color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.proj-settings__title { margin: 0 0 6px; font-size: 20px; font-weight: 600; }
.proj-settings__meta {
  display: flex;
  gap: 10px;
  align-items: center;
  code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    padding: 1px 8px;
    border-radius: 4px;
  }
}
.proj-settings__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
  max-width: 650px;
}
.proj-settings__stat {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: var(--el-box-shadow-light); }
}
.proj-settings__stat-value { font-size: 24px; font-weight: 700; line-height: 1; }
.proj-settings__stat-label { font-size: 12px; color: var(--el-text-color-secondary); }
.proj-settings__stat--cycle .proj-settings__stat-value { color: var(--el-color-warning); }
.proj-settings__stat--release .proj-settings__stat-value { color: var(--el-color-success); }
.proj-settings__stat--member .proj-settings__stat-value { color: var(--el-color-primary); }
.proj-settings__body { max-width: 650px; }
.proj-settings__section {
  margin-bottom: 28px;
  h3 {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 14px;
    font-size: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    .el-icon { color: var(--el-color-primary); }
  }
}
.proj-settings__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.proj-settings__row-label {
  display: flex;
  flex-direction: column;
  span { font-size: 14px; font-weight: 500; }
  small { font-size: 12px; color: var(--el-text-color-placeholder); margin-top: 2px; }
}
.proj-settings__actions {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
