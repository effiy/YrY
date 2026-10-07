<template>
  <div class="task-page page">
    <PageHeaderCard
      :icon="Clock"
      icon-bg="linear-gradient(135deg, #e6a23c, #d97706)"
      :title="$t('system.timingTask.title')"
      :description="$t('system.timingTask.description')"
    />
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="fetchTasks"
      :tool-button="['refresh', 'search']"
      row-key="key"
    >
      <template #tableHeader="{ isSelected, selectedListIds }">
        <el-button type="primary" :icon="Plus" @click="openCreate">Create Task</el-button>
        <el-button v-if="isSelected" type="danger" :icon="Delete" @click="batchDelete(selectedListIds)">Batch Delete</el-button>
      </template>
      <template #cron_expression="{ row }">
        <code class="task-page__cron">{{ row.cron_expression }}</code>
      </template>
      <template #enabled="{ row }">
        <el-switch :model-value="row.enabled" size="small" @change="toggleEnabled(row)" />
      </template>
      <template #last_run="{ row }">
        <span v-if="row.last_run" class="task-page__time">{{ formatDateTime(row.last_run) }}</span>
        <span v-else class="task-page__muted">Never</span>
      </template>
      <template #next_run="{ row }">
        <span v-if="row.next_run" class="task-page__time">{{ formatDateTime(row.next_run) }}</span>
        <span v-else class="task-page__muted">—</span>
      </template>
      <template #operation="{ row }">
        <el-button link type="success" size="small" :icon="VideoPlay" @click="handleTrigger(row)">Run</el-button>
        <el-button link type="primary" size="small" :icon="Edit" @click="openEdit(row)">Edit</el-button>
        <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">Delete</el-button>
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Task' : 'Create Task'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" @keyup.enter="submit">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="Task name" maxlength="60" autofocus />
        </el-form-item>
        <el-form-item label="Cron Expression" prop="cron_expression">
          <el-input v-model="form.cron_expression" placeholder="e.g. */5 * * * *" maxlength="30">
            <template #append>
              <el-select v-model="cronPreset" placeholder="Quick" style="width: 130px" @change="onCronPreset" size="small">
                <el-option label="Every min" value="* * * * *" />
                <el-option label="Every 5 min" value="*/5 * * * *" />
                <el-option label="Every 15 min" value="*/15 * * * *" />
                <el-option label="Every hour" value="0 * * * *" />
                <el-option label="Daily 2am" value="0 2 * * *" />
                <el-option label="Weekly Mon" value="0 9 * * 1" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Module">
              <el-input v-model="form.module_name" placeholder="services.xxx.xxx" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Method">
              <el-input v-model="form.method_name" placeholder="method_name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="What this task does" maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item label="Enabled">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="timingTask">
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Delete, Edit, VideoPlay, Clock } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { nanoid } from "nanoid";
import ProTable from "@/components/ProTable/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getTaskList, createTask, updateTask, deleteTask, triggerTask } from "@/api/modules/timingTaskService";
import type { ScheduledTask } from "@/api/modules/timingTaskService";
import { confirm } from "@/hooks/useConfirmAction";
import { formatAbsolute as formatDateTime } from "@/utils/datetime";

const { t } = useI18n();
const proTableRef = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const dialogVisible = ref(false);
const isEdit = ref(false);
const editingKey = ref("");
const submitting = ref(false);
const cronPreset = ref("");

function emptyForm() {
  return {
    name: "",
    cron_expression: "",
    module_name: "",
    method_name: "",
    enabled: true,
    description: ""
  };
}

const form = reactive(emptyForm());

const rules: FormRules = {
  name: [{ required: true, message: "Task name is required", trigger: "blur" }],
  cron_expression: [{ required: true, message: "Cron expression is required", trigger: "blur" }]
};

function onCronPreset(val: string) {
  if (val) form.cron_expression = val;
  cronPreset.value = "";
}

async function fetchTasks(params: any) {
  const { pageNum, pageSize, search } = params || {};
  return await getTaskList({ pageNum, pageSize, search }) as any;
}

function openCreate() {
  isEdit.value = false;
  editingKey.value = "";
  Object.assign(form, emptyForm());
  dialogVisible.value = true;
}

function openEdit(row: ScheduledTask) {
  isEdit.value = true;
  editingKey.value = row.key;
  form.name = row.name;
  form.cron_expression = row.cron_expression;
  form.module_name = row.module_name || "";
  form.method_name = row.method_name || "";
  form.enabled = row.enabled;
  form.description = row.description || "";
  dialogVisible.value = true;
}

async function submit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateTask(editingKey.value, { ...form });
      ElMessage.success("Task updated");
    } else {
      const key = `task_${nanoid(10)}`;
      await createTask({ ...form, key });
      ElMessage.success("Task created");
    }
    dialogVisible.value = false;
    proTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Operation failed");
  } finally {
    submitting.value = false;
  }
}

async function toggleEnabled(row: ScheduledTask) {
  try {
    await updateTask(row.key, { enabled: !row.enabled });
    proTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Toggle failed");
  }
}

async function handleTrigger(row: ScheduledTask) {
  try {
    await triggerTask(row.key);
    ElMessage.success(`Task "${row.name}" triggered`);
    proTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Trigger failed");
  }
}

async function handleDelete(row: ScheduledTask) {
  const ok = await confirm(`Delete task "${row.name}"?`, "Delete Task");
  if (!ok) return;
  try {
    await deleteTask(row.key);
    ElMessage.success("Task deleted");
    proTableRef.value?.getTableList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Delete failed");
  }
}

async function batchDelete(ids: (string | number)[]) {
  if (!ids.length) return;
  const ok = await confirm(`Delete ${ids.length} task(s)?`, "Batch Delete");
  if (!ok) return;
  for (const id of ids) {
    try { await deleteTask(String(id)); } catch { /* continue */ }
  }
  ElMessage.success(`Deleted ${ids.length} task(s)`);
  proTableRef.value?.getTableList();
}

const columns: ColumnProps<ScheduledTask>[] = [
  { type: "selection", width: 50 },
  { prop: "name", label: "Name", minWidth: 160, search: { el: "input" } },
  { prop: "cron_expression", label: "Cron", width: 140 },
  { prop: "module_name", label: "Module", width: 200 },
  { prop: "method_name", label: "Method", width: 140 },
  { prop: "enabled", label: "Enabled", width: 80 },
  { prop: "last_run", label: "Last Run", width: 160 },
  { prop: "next_run", label: "Next Run", width: 160 },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

onMounted(() => proTableRef.value?.getTableList());
</script>

<style scoped lang="scss">
.task-page { min-height: 100%; }
.task-page__cron {
  padding: 2px 6px;
  font-size: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
.task-page__time { font-size: 12px; color: var(--el-text-color-regular); }
.task-page__muted { font-size: 12px; color: var(--el-text-color-placeholder); }
</style>