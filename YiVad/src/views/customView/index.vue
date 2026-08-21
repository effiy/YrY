<template>
  <div class="custom-views">
    <div class="custom-views__head">
      <div class="custom-views__head-left">
        <h1 class="custom-views__title">Custom Views</h1>
        <el-tag size="small" type="info">{{ views.length }} views</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">New View</el-button>
    </div>

    <div v-loading="loading" class="custom-views__body">
      <div v-if="views.length" class="custom-views__grid">
        <el-card
          v-for="v in views"
          :key="v.key"
          class="view-card"
          shadow="hover"
        >
          <div class="view-card__body">
            <div class="view-card__name">{{ v.name }}</div>
            <div v-if="v.description" class="view-card__desc">{{ v.description }}</div>
            <div class="view-card__filters">
              <el-tag v-if="v.filter_status" size="small" effect="plain">Status: {{ v.filter_status }}</el-tag>
              <el-tag v-if="v.filter_priority" size="small" effect="plain">Priority: {{ v.filter_priority }}</el-tag>
              <el-tag v-if="v.filter_assignee" size="small" effect="plain">Assignee: {{ v.filter_assignee }}</el-tag>
              <el-tag v-if="v.filter_type" size="small" effect="plain">Type: {{ v.filter_type }}</el-tag>
              <el-tag v-if="v.group_by" size="small" type="primary" effect="dark">Grouped: {{ v.group_by }}</el-tag>
            </div>
          </div>
          <div class="view-card__actions">
            <el-button type="primary" size="small" @click="applyView(v)">Apply</el-button>
            <el-button :icon="Edit" size="small" @click="openEdit(v)" />
            <el-button :icon="Delete" size="small" @click="handleDelete(v)" />
          </div>
        </el-card>
      </div>
      <el-empty v-else description="No custom views. Save a filter combination to create one." :image-size="60">
        <el-button type="primary" @click="openCreate">Create your first view</el-button>
      </el-empty>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit View' : 'New View'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="View name" maxlength="60" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" placeholder="Optional description" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="dialog.form.filter_status" clearable style="width: 100%">
                <el-option v-for="(l, v) in ISSUE_STATUS_MAP" :key="v" :label="l" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Priority">
              <el-select v-model="dialog.form.filter_priority" clearable style="width: 100%">
                <el-option v-for="(l, v) in ISSUE_PRIORITY_MAP" :key="v" :label="l" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Type">
              <el-select v-model="dialog.form.filter_type" clearable style="width: 100%">
                <el-option v-for="(l, v) in ISSUE_TYPE_MAP" :key="v" :label="l" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Project">
              <el-input v-model="dialog.form.filter_project" placeholder="Project key" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Group by">
          <el-select v-model="dialog.form.group_by" clearable style="width: 100%">
            <el-option label="None" value="" />
            <el-option label="Status" value="status" />
            <el-option label="Priority" value="priority" />
            <el-option label="Assignee" value="assignee" />
            <el-option label="Type" value="issue_type" />
          </el-select>
        </el-form-item>
        <el-form-item label="Assignee">
          <el-input v-model="dialog.form.filter_assignee" placeholder="Assignee name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="customViews">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getLabelList, createLabel, updateLabel, deleteLabel } from "@/api/modules/labelService";
import { ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP } from "@/api/modules/issueService";

const router = useRouter();

interface CustomView {
  key: string;
  name: string;
  description?: string;
  filter_status?: string;
  filter_priority?: string;
  filter_type?: string;
  filter_assignee?: string;
  filter_project?: string;
  group_by?: string;
}

const loading = ref(false);
const views = ref<CustomView[]>([]);
const formRef = ref<FormInstance>();

const rules: FormRules = {
  name: [{ required: true, message: "View name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: {
    name: "", description: "", filter_status: "", filter_priority: "",
    filter_type: "", filter_assignee: "", filter_project: "", group_by: ""
  }
});

async function loadViews() {
  loading.value = true;
  try {
    const res = await getLabelList({ pageSize: 200 });
    views.value = ((res.data?.list || []) as any[])
      .filter((l: any) => l._type === "custom_view")
      .map((l: any) => ({
        key: l.key, name: l.name, description: l.description,
        filter_status: l.filter_status, filter_priority: l.filter_priority,
        filter_type: l.filter_type, filter_assignee: l.filter_assignee,
        filter_project: l.filter_project, group_by: l.group_by
      }));
  } finally { loading.value = false; }
}

function openCreate() {
  dialog.isEdit = false; dialog.editKey = "";
  dialog.form = { name: "", description: "", filter_status: "", filter_priority: "", filter_type: "", filter_assignee: "", filter_project: "", group_by: "" };
  dialog.visible = true;
}

function openEdit(v: CustomView) {
  dialog.isEdit = true; dialog.editKey = v.key;
  dialog.form = {
    name: v.name, description: v.description || "",
    filter_status: v.filter_status || "", filter_priority: v.filter_priority || "",
    filter_type: v.filter_type || "", filter_assignee: v.filter_assignee || "",
    filter_project: v.filter_project || "", group_by: v.group_by || ""
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const data = {
      name: dialog.form.name, description: dialog.form.description,
      color: "#409eff", _type: "custom_view",
      filter_status: dialog.form.filter_status, filter_priority: dialog.form.filter_priority,
      filter_type: dialog.form.filter_type, filter_assignee: dialog.form.filter_assignee,
      filter_project: dialog.form.filter_project, group_by: dialog.form.group_by
    };
    if (dialog.isEdit) {
      await updateLabel(dialog.editKey, data as any);
      ElMessage.success("View updated");
    } else {
      await createLabel({ key: `VIEW-${Date.now().toString(36).toUpperCase()}`, ...data } as any);
      ElMessage.success("View created");
    }
    dialog.visible = false;
    await loadViews();
  } finally { dialog.submitting = false; }
}

async function handleDelete(v: CustomView) {
  try {
    await ElMessageBox.confirm(`Delete view "${v.name}"?`, "Delete View", { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error" });
    await deleteLabel(v.key);
    ElMessage.success("View deleted");
    await loadViews();
  } catch { /* cancelled */ }
}

function applyView(v: CustomView) {
  const params = new URLSearchParams();
  if (v.filter_status) params.set("status", v.filter_status);
  if (v.filter_priority) params.set("priority", v.filter_priority);
  if (v.filter_type) params.set("issue_type", v.filter_type);
  if (v.filter_assignee) params.set("assignee", v.filter_assignee);
  if (v.filter_project) params.set("project_key", v.filter_project);
  router.push(`/issue?${params.toString()}`);
}

onMounted(() => { loadViews(); });
</script>

<style scoped lang="scss">
.custom-views {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.custom-views__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.custom-views__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.custom-views__title { margin: 0; font-size: 20px; font-weight: 600; }
.custom-views__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}
.view-card {
  :deep(.el-card__body) {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }
}
.view-card__body { flex: 1; }
.view-card__name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.view-card__desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.view-card__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.view-card__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>