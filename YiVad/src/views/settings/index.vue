<template>
  <div class="settings">
    <h1 class="settings__title">Workspace Settings</h1>

    <div class="settings__sections">
      <!-- General -->
      <div class="settings__section">
        <h3>General</h3>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Workspace Name</span>
            <small>Displayed in the header and notifications</small>
          </div>
          <el-input v-model="form.workspaceName" style="width: 300px" />
        </div>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Default Project</span>
            <small>New issues will be created in this project by default</small>
          </div>
          <el-select v-model="form.defaultProject" style="width: 300px" clearable>
            <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </div>
      </div>

      <!-- Issues -->
      <div class="settings__section">
        <h3>Issues</h3>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Default Issue Type</span>
            <small>Pre-selected when creating new issues</small>
          </div>
          <el-select v-model="form.defaultIssueType" style="width: 200px">
            <el-option v-for="(l, v) in ISSUE_TYPE_MAP" :key="v" :label="l" :value="v" />
          </el-select>
        </div>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Default Priority</span>
          </div>
          <el-select v-model="form.defaultPriority" style="width: 200px">
            <el-option v-for="(l, v) in ISSUE_PRIORITY_MAP" :key="v" :label="l" :value="v" />
          </el-select>
        </div>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Auto-assign Issues</span>
            <small>Assign new issues to the creator</small>
          </div>
          <el-switch v-model="form.autoAssign" />
        </div>
      </div>

      <!-- Notifications -->
      <div class="settings__section">
        <h3>Notifications</h3>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Email Notifications</span>
            <small>Receive email when assigned or mentioned</small>
          </div>
          <el-switch v-model="form.emailNotifications" />
        </div>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>In-app Notifications</span>
            <small>Show notification bell for updates</small>
          </div>
          <el-switch v-model="form.inAppNotifications" />
        </div>
      </div>

      <!-- Display -->
      <div class="settings__section">
        <h3>Display</h3>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Language</span>
          </div>
          <el-select v-model="form.language" style="width: 200px">
            <el-option label="English" value="en" />
            <el-option label="简体中文" value="zh-CN" />
          </el-select>
        </div>
        <div class="settings__row">
          <div class="settings__row-label">
            <span>Date Format</span>
          </div>
          <el-select v-model="form.dateFormat" style="width: 200px">
            <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
            <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
            <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
          </el-select>
        </div>
      </div>

      <div class="settings__actions">
        <el-button type="primary" :loading="saving" @click="saveSettings">Save Settings</el-button>
        <el-button @click="resetSettings">Reset</el-button>
      </div>

      <div v-if="saved" class="settings__success">
        <el-tag type="success">Settings saved successfully</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="workspaceSettings">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { getLabelList, createLabel, updateLabel } from "@/api/modules/labelService";
import { ISSUE_TYPE_MAP, ISSUE_PRIORITY_MAP } from "@/api/modules/issueService";

const projectStore = useProjectStore();

const saving = ref(false);
const saved = ref(false);
const projects = ref<{ key: string; name: string }[]>([]);

const form = reactive({
  workspaceName: "YiVad",
  defaultProject: "",
  defaultIssueType: "task",
  defaultPriority: "medium",
  autoAssign: false,
  emailNotifications: true,
  inAppNotifications: true,
  language: "zh-CN",
  dateFormat: "YYYY-MM-DD"
});

const defaults = { ...form };

async function loadSettings() {
  try {
    const res = await getLabelList({ pageSize: 200 });
    const settings = ((res.data?.list || []) as any[]).find((l: any) => l._type === "workspace_settings");
    if (settings) {
      Object.keys(form).forEach(k => {
        if (settings[k] !== undefined) (form as any)[k] = settings[k];
      });
    }
    projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  } catch { /* ignore */ }
}

async function saveSettings() {
  saving.value = true;
  try {
    const data = { ...form, _type: "workspace_settings", name: "workspace_settings", color: "#409eff" };
    await updateLabel("SET-WORKSPACE", data as any).catch(async () => {
      await createLabel({ key: "SET-WORKSPACE", ...data } as any);
    });
    saved.value = true;
    ElMessage.success("Settings saved");
    setTimeout(() => { saved.value = false; }, 3000);
  } finally { saving.value = false; }
}

function resetSettings() {
  Object.assign(form, defaults);
  ElMessage.info("Settings reset to defaults");
}

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  await loadSettings();
});
</script>

<style scoped lang="scss">
.settings {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.settings__title { margin: 0 0 24px; font-size: 20px; font-weight: 600; }
.settings__sections { max-width: 700px; }
.settings__section {
  margin-bottom: 28px;
  h3 {
    margin: 0 0 16px;
    font-size: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}
.settings__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.settings__row-label {
  display: flex;
  flex-direction: column;
  span { font-size: 14px; font-weight: 500; }
  small { font-size: 12px; color: var(--el-text-color-placeholder); margin-top: 2px; }
}
.settings__actions {
  margin-top: 24px;
  display: flex;
  gap: 10px;
}
.settings__success { margin-top: 12px; }
</style>