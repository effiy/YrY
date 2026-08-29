<template>
  <div class="custom-statuses">
    <div class="custom-statuses__head">
      <div class="custom-statuses__head-left">
        <h1 class="custom-statuses__title">Custom Statuses</h1>
        <el-tag size="small" type="info">{{ statuses.length }} statuses</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">Add Status</el-button>
    </div>

    <div v-loading="loading" class="custom-statuses__body">
      <div class="custom-statuses__list">
        <div v-for="(s, idx) in statuses" :key="s.key" class="status-card">
          <div class="status-card__color" :style="{ background: s.color }" />
          <div class="status-card__name">{{ s.name }}</div>
          <el-tag :color="s.color" effect="dark" size="small">{{ s.name }}</el-tag>
          <div class="status-card__actions">
            <el-button link size="small" :icon="Top" :disabled="idx === 0" @click="moveUp(idx)" />
            <el-button link size="small" :icon="Bottom" :disabled="idx === statuses.length - 1" @click="moveDown(idx)" />
            <el-button link size="small" :icon="Edit" @click="openEdit(s)" />
            <el-button link size="small" :icon="Delete" @click="handleDelete(s)" />
          </div>
        </div>
      </div>
      <el-empty v-if="!statuses.length" description="No custom statuses. The default statuses are used." :image-size="60" />
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Status' : 'Add Status'" width="440px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Status name" maxlength="20" />
        </el-form-item>
        <el-form-item label="Color">
          <div class="custom-statuses__color-pick">
            <el-color-picker v-model="dialog.form.color" />
            <el-input v-model="dialog.form.color" size="small" style="width: 120px" />
          </div>
        </el-form-item>
        <el-form-item label="Preview">
          <el-tag :color="dialog.form.color" effect="dark" size="large">{{ dialog.form.name || "Status" }}</el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="customStatuses">
import { onMounted, reactive, ref } from "vue";
import { Plus, Edit, Delete, Top, Bottom } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getLabelList, createLabel, updateLabel, deleteLabel } from "@/api/modules/labelService";

interface Status {
  key: string;
  name: string;
  color: string;
  order: number;
}

const loading = ref(false);
const statuses = ref<Status[]>([]);
const formRef = ref<FormInstance>();

const rules: FormRules = {
  name: [{ required: true, message: "Status name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: { name: "", color: "#409eff" }
});

async function loadData() {
  loading.value = true;
  try {
    const res = await getLabelList({ pageSize: 200 });
    statuses.value = ((res.data?.list || []) as any[])
      .filter((l: any) => l._type === "custom_status")
      .map((l: any) => ({
        key: l.key, name: l.name, color: l.color || "#409eff", order: l.order || 0
      }))
      .sort((a, b) => a.order - b.order);
  } finally { loading.value = false; }
}

function openCreate() {
  dialog.isEdit = false; dialog.editKey = "";
  dialog.form = { name: "", color: "#409eff" };
  dialog.visible = true;
}

function openEdit(s: Status) {
  dialog.isEdit = true; dialog.editKey = s.key;
  dialog.form = { name: s.name, color: s.color };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const data = {
      name: dialog.form.name, color: dialog.form.color, _type: "custom_status",
      order: dialog.isEdit ? statuses.value.find(s => s.key === dialog.editKey)?.order : statuses.value.length
    };
    if (dialog.isEdit) {
      await updateLabel(dialog.editKey, data as any);
      ElMessage.success("Status updated");
    } else {
      await createLabel({ key: `CST-${Date.now().toString(36).toUpperCase()}`, ...data } as any);
      ElMessage.success("Status added");
    }
    dialog.visible = false;
    await loadData();
  } finally { dialog.submitting = false; }
}

async function handleDelete(s: Status) {
  try {
    await ElMessageBox.confirm(`Delete status "${s.name}"?`, "Delete", { type: "error" });
    await deleteLabel(s.key);
    ElMessage.success("Status deleted");
    await loadData();
  } catch { /* cancelled */ }
}

async function moveUp(idx: number) {
  if (idx === 0) return;
  const a = statuses.value[idx];
  const b = statuses.value[idx - 1];
  await updateLabel(a.key, { order: idx - 1 } as any);
  await updateLabel(b.key, { order: idx } as any);
  await loadData();
}

async function moveDown(idx: number) {
  if (idx === statuses.value.length - 1) return;
  const a = statuses.value[idx];
  const b = statuses.value[idx + 1];
  await updateLabel(a.key, { order: idx + 1 } as any);
  await updateLabel(b.key, { order: idx } as any);
  await loadData();
}

onMounted(() => { loadData(); });
</script>

<style scoped lang="scss">
.custom-statuses {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.custom-statuses__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.custom-statuses__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.custom-statuses__title { margin: 0; font-size: 20px; font-weight: 600; }
.custom-statuses__list {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.status-card__color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
}
.status-card__name { flex: 1; font-size: 14px; font-weight: 500; }
.status-card__actions { display: flex; gap: 2px; }
.custom-statuses__color-pick {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>