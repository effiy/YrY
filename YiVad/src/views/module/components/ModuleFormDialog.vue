<script setup lang="ts" name="ModuleFormDialog">
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";

const { t } = useI18n();
const emit = defineEmits<{ (e: "saved"): void }>();

const store = useModuleStore();
const formRef = ref<FormInstance>();

const props = withDefaults(defineProps<{ projectKey?: string }>(), { projectKey: "" });

const rules: FormRules = {
  name: [{ required: true, message: () => t("module.dialog.nameRequired"), trigger: "blur" }]
};

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    name: "",
    description: "",
    status: "planned" as ModuleStatus,
    lead: "",
    project_key: props.projectKey || "",
    issue_keys: [] as string[],
    start_date: "",
    due_date: ""
  }
});

function openCreate(projectKey?: string) {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = {
    name: "",
    description: "",
    status: "planned" as ModuleStatus,
    lead: "",
    project_key: projectKey || props.projectKey || "",
    issue_keys: [],
    start_date: "",
    due_date: ""
  };
  dialog.visible = true;
}

function openEdit(mod: Module) {
  dialog.isEdit = true;
  dialog.editKey = mod.key;
  dialog.form = {
    name: mod.name,
    description: mod.description || "",
    status: mod.status,
    lead: mod.lead || "",
    project_key: mod.project_key,
    issue_keys: mod.issue_keys || [],
    start_date: mod.start_date || "",
    due_date: mod.due_date || ""
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
        name: dialog.form.name,
        description: dialog.form.description,
        status: dialog.form.status,
        lead: dialog.form.lead,
        start_date: dialog.form.start_date,
        due_date: dialog.form.due_date
      });
      ElMessage.success(t("module.dialog.updateSuccess"));
    } else {
      await store.addModule({
        key: `MOD-${Date.now().toString(36).toUpperCase()}`,
        project_key: dialog.form.project_key || props.projectKey || "default",
        name: dialog.form.name,
        description: dialog.form.description,
        status: dialog.form.status,
        lead: dialog.form.lead,
        issue_keys: [],
        start_date: dialog.form.start_date,
        due_date: dialog.form.due_date
      });
      ElMessage.success(t("module.dialog.createSuccess"));
    }
    dialog.visible = false;
    emit("saved");
  } catch {
    ElMessage.error(t("module.error.saveFailed"));
  } finally {
    dialog.submitting = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>

<template>
  <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? $t('module.dialog.editTitle') : $t('module.dialog.createTitle')" width="560px" destroy-on-close>
    <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px" @keyup.enter="submit">
      <el-form-item :label="$t('module.dialog.name')" prop="name">
        <el-input v-model="dialog.form.name" :placeholder="$t('module.dialog.namePlaceholder')" maxlength="100" />
      </el-form-item>
      <el-form-item :label="$t('module.dialog.description')">
        <el-input v-model="dialog.form.description" type="textarea" :rows="3" :placeholder="$t('module.dialog.descriptionPlaceholder')" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('module.dialog.status')">
            <el-select v-model="dialog.form.status" style="width: 100%">
              <el-option v-for="(label, val) in MODULE_STATUS_MAP" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('module.dialog.lead')">
            <el-input v-model="dialog.form.lead" :placeholder="$t('module.dialog.leadPlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="Start Date">
            <el-date-picker v-model="dialog.form.start_date" type="date" placeholder="Start date" style="width: 100%" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Due Date">
            <el-date-picker v-model="dialog.form.due_date" type="date" placeholder="Due date" style="width: 100%" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item :label="$t('module.dialog.project')">
        <el-input v-model="dialog.form.project_key" placeholder="Project key" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialog.visible = false">{{ $t("module.dialog.cancel") }}</el-button>
      <el-button type="primary" :loading="dialog.submitting" @click="submit">{{ $t("module.dialog.save") }}</el-button>
    </template>
  </el-dialog>
</template>