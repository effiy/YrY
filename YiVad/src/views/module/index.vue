<template>
  <div class="module-list">
    <div class="module-list__head">
      <div class="module-list__head-left">
        <h1 class="module-list__title">Modules</h1>
        <el-tag size="small" type="info">{{ store.total }} modules</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">New Module</el-button>
    </div>

    <div v-loading="store.loading" class="module-list__grid">
      <el-card
        v-for="mod in store.modules"
        :key="mod.key"
        class="module-card"
        shadow="hover"
        @click="goDetail(mod.key)"
      >
        <div class="module-card__status-bar" :style="{ background: statusColor(mod.status) }" />
        <div class="module-card__body">
          <div class="module-card__name">{{ mod.name }}</div>
          <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
          <div v-if="mod.description" class="module-card__desc">{{ mod.description }}</div>
          <div class="module-card__meta">
            <span>{{ mod.issue_keys?.length || 0 }} issues</span>
            <span v-if="mod.lead">{{ mod.lead }}</span>
          </div>
          <el-progress
            v-if="mod.issue_keys?.length"
            :percentage="mod.status === 'completed' ? 100 : mod.status === 'in_progress' ? 50 : 0"
            :stroke-width="4"
            :show-text="false"
          />
        </div>
      </el-card>
      <div v-if="!store.loading && !store.modules.length" class="module-list__empty">
        <el-empty description="No modules yet">
          <el-button type="primary" @click="openCreate">Create your first module</el-button>
        </el-empty>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Module' : 'New Module'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Module name" maxlength="100" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in MODULE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Lead">
              <el-input v-model="dialog.form.lead" placeholder="Module lead" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="!props.projectKey" label="Project">
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

<script setup lang="ts" name="moduleList">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";

const props = defineProps<{ projectKey?: string }>();
const router = useRouter();
const store = useModuleStore();
const formRef = ref<FormInstance>();

const rules: FormRules = {
  name: [{ required: true, message: "Module name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: {
    name: "", description: "", status: "planned" as ModuleStatus, lead: "",
    project_key: props.projectKey || "", issue_keys: [] as string[]
  }
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", description: "", status: "planned", lead: "", project_key: props.projectKey || "", issue_keys: [] };
  dialog.visible = true;
}

function openEdit(mod: Module) {
  dialog.isEdit = true;
  dialog.editKey = mod.key;
  dialog.form = {
    name: mod.name, description: mod.description || "", status: mod.status,
    lead: mod.lead || "", project_key: mod.project_key, issue_keys: mod.issue_keys || []
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editModule(dialog.editKey, {
        name: dialog.form.name, description: dialog.form.description,
        status: dialog.form.status, lead: dialog.form.lead
      });
      ElMessage.success("Module updated");
    } else {
      await store.addModule({
        key: `MOD-${Date.now().toString(36).toUpperCase()}`,
        project_key: dialog.form.project_key || props.projectKey || "default",
        name: dialog.form.name, description: dialog.form.description,
        status: dialog.form.status, lead: dialog.form.lead, issue_keys: []
      });
      ElMessage.success("Module created");
    }
    dialog.visible = false;
  } finally { dialog.submitting = false; }
}

function goDetail(key: string) { router.push(`/module/${key}`); }
function statusLabel(s: ModuleStatus) { return MODULE_STATUS_MAP[s] || s; }
function statusTagType(s: ModuleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", completed: "success", cancelled: "danger" };
  return m[s] || "info";
}
function statusColor(s: ModuleStatus) {
  const m: Record<string, string> = { planned: "#909399", in_progress: "#409eff", completed: "#67c23a", cancelled: "#f56c6c" };
  return m[s] || "#909399";
}

onMounted(() => { store.fetchModules({ project_key: props.projectKey }); });
</script>

<style scoped lang="scss">
.module-list {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.module-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.module-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.module-list__title { margin: 0; font-size: 20px; font-weight: 600; }
.module-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.module-card {
  cursor: pointer;
  overflow: hidden;
  :deep(.el-card__body) { padding: 0; }
  &:hover { transform: translateY(-2px); transition: transform 0.15s; }
}
.module-card__status-bar { height: 3px; }
.module-card__body { padding: 16px; }
.module-card__name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.module-card__desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.module-card__meta {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.module-list__empty { grid-column: 1 / -1; padding: 60px 0; }
</style>