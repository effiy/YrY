<template>
  <div class="proj-settings">
    <div class="proj-settings__head">
      <div class="proj-settings__head-left">
        <el-button text :icon="ArrowLeft" @click="router.push('/project')">Projects</el-button>
        <h1 class="proj-settings__title">{{ projectName }} Settings</h1>
      </div>
    </div>

    <div class="proj-settings__body">
      <div class="proj-settings__section">
        <h3>General</h3>
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
        <h3>Visibility</h3>
        <div class="proj-settings__row">
          <div class="proj-settings__row-label">
            <span>Public Project</span>
            <small>Visible to all workspace members</small>
          </div>
          <el-switch v-model="form.isPublic" />
        </div>
      </div>

      <div class="proj-settings__section">
        <h3>Danger Zone</h3>
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
        <el-button type="primary" :loading="saving" @click="saveSettings">Save Settings</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="projectSettings">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { getLabelList, createLabel, updateLabel } from "@/api/modules/labelService";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const saving = ref(false);
const projectName = ref("");
const projectKey = ref("");

const form = reactive({
  defaultAssignee: "",
  autoCloseDays: 0,
  isPublic: true
});

async function loadSettings() {
  const key = route.params.key as string;
  projectKey.value = key;
  try {
    const project = await projectStore.fetchProject(key);
    if (project) projectName.value = project.name;

    const res = await getLabelList({ pageSize: 200 });
    const settings = ((res.data?.list || []) as any[]).find(
      (l: any) => l._type === "project_settings" && l.project_key === key
    );
    if (settings) {
      form.defaultAssignee = settings.defaultAssignee || "";
      form.autoCloseDays = settings.autoCloseDays || 0;
      form.isPublic = settings.isPublic !== false;
    }
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
    ElMessage.success("Project settings saved");
  } finally { saving.value = false; }
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

onMounted(() => { loadSettings(); });
</script>

<style scoped lang="scss">
.proj-settings {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.proj-settings__head {
  margin-bottom: 24px;
}
.proj-settings__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.proj-settings__title { margin: 0; font-size: 20px; font-weight: 600; }
.proj-settings__body { max-width: 650px; }
.proj-settings__section {
  margin-bottom: 28px;
  h3 {
    margin: 0 0 14px;
    font-size: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
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
.proj-settings__actions { margin-top: 24px; }
</style>