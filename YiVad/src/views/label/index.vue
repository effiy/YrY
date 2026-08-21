<template>
  <div class="label-mgmt">
    <div class="label-mgmt__head">
      <div class="label-mgmt__head-left">
        <h1 class="label-mgmt__title">Labels</h1>
        <el-tag size="small" type="info">{{ labels.length }} labels</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">New Label</el-button>
    </div>

    <div v-loading="loading" class="label-mgmt__body">
      <div v-if="labels.length" class="label-mgmt__grid">
        <div v-for="label in labels" :key="label.key" class="label-card">
          <div class="label-card__swatch" :style="{ background: label.color }" />
          <div class="label-card__info">
            <span class="label-card__name">{{ label.name }}</span>
            <span v-if="label.description" class="label-card__desc">{{ label.description }}</span>
          </div>
          <div class="label-card__actions">
            <el-button link :icon="Edit" size="small" @click="openEdit(label)" />
            <el-button link :icon="Delete" size="small" @click="handleDelete(label)" />
          </div>
        </div>
      </div>
      <el-empty v-else description="No labels yet" :image-size="60">
        <el-button type="primary" @click="openCreate">Create your first label</el-button>
      </el-empty>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Label' : 'New Label'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Label name" maxlength="30" />
        </el-form-item>
        <el-form-item label="Color" prop="color">
          <div class="label-mgmt__color-pick">
            <el-color-picker v-model="dialog.form.color" show-alpha />
            <el-input v-model="dialog.form.color" placeholder="#hex" size="small" style="width: 120px" />
          </div>
          <div class="label-mgmt__presets">
            <span
              v-for="c in presetColors"
              :key="c"
              class="label-mgmt__preset"
              :class="{ 'label-mgmt__preset--active': dialog.form.color === c }"
              :style="{ background: c }"
              @click="dialog.form.color = c"
            />
          </div>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" placeholder="Optional description" maxlength="100" />
        </el-form-item>
        <el-form-item label="Preview">
          <el-tag :color="dialog.form.color" effect="dark" size="large" round>
            {{ dialog.form.name || 'Label' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="labelManagement">
import { onMounted, reactive, ref } from "vue";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getLabelList, createLabel, updateLabel, deleteLabel } from "@/api/modules/labelService";
import type { Label } from "@/api/modules/labelService";

const loading = ref(false);
const labels = ref<Label[]>([]);
const formRef = ref<FormInstance>();

const rules: FormRules = {
  name: [{ required: true, message: "Label name is required", trigger: "blur" }],
  color: [{ required: true, message: "Color is required", trigger: "blur" }]
};

const presetColors = [
  "#ff6b6b", "#f06595", "#cc5de8", "#845ef7", "#5c7cfa",
  "#339af0", "#22b8cf", "#20c997", "#51cf66", "#94d82d",
  "#fcc419", "#ff922b", "#ff6b35", "#adb5bd", "#495057"
];

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: { name: "", color: "#5c7cfa", description: "" }
});

async function loadLabels() {
  loading.value = true;
  try {
    const res = await getLabelList();
    labels.value = (res.data?.list as Label[]) ?? [];
  } finally { loading.value = false; }
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", color: "#5c7cfa", description: "" };
  dialog.visible = true;
}

function openEdit(label: Label) {
  dialog.isEdit = true;
  dialog.editKey = label.key;
  dialog.form = { name: label.name, color: label.color, description: label.description || "" };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await updateLabel(dialog.editKey, { name: dialog.form.name, color: dialog.form.color, description: dialog.form.description });
      ElMessage.success("Label updated");
    } else {
      await createLabel({ key: `LBL-${Date.now().toString(36).toUpperCase()}`, name: dialog.form.name, color: dialog.form.color, description: dialog.form.description });
      ElMessage.success("Label created");
    }
    dialog.visible = false;
    await loadLabels();
  } finally { dialog.submitting = false; }
}

async function handleDelete(label: Label) {
  try {
    await ElMessageBox.confirm(`Delete label "${label.name}"?`, "Delete Label", {
      confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error"
    });
    await deleteLabel(label.key);
    ElMessage.success("Label deleted");
    await loadLabels();
  } catch { /* cancelled */ }
}

onMounted(() => { loadLabels(); });
</script>

<style scoped lang="scss">
.label-mgmt {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.label-mgmt__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.label-mgmt__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.label-mgmt__title { margin: 0; font-size: 20px; font-weight: 600; }
.label-mgmt__body {
  max-width: 600px;
}
.label-mgmt__grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.label-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  &:hover { border-color: var(--el-color-primary-light-5); }
}
.label-card__swatch {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
}
.label-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.label-card__name {
  font-weight: 600;
  font-size: 14px;
}
.label-card__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.label-card__actions {
  display: flex;
  gap: 4px;
}
.label-mgmt__color-pick {
  display: flex;
  gap: 10px;
  align-items: center;
}
.label-mgmt__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.label-mgmt__preset {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  &--active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px #fff inset;
  }
}
</style>