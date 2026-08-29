<template>
  <el-dialog
    v-model="visibleLocal"
    :title="t('kanban.createDialog.title')"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form :model="form" label-position="top" size="small">
      <el-form-item :label="t('kanban.createDialog.formTitle')" prop="title" required>
        <el-input v-model="form.title" :placeholder="t('kanban.createDialog.formTitlePlaceholder')" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item :label="t('kanban.createDialog.formType')" prop="issue_type">
            <el-select v-model="form.issue_type" style="width:100%">
              <el-option v-for="(label, val) in ISSUE_TYPE_MAP" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="t('kanban.createDialog.formPriority')" prop="priority">
            <el-select v-model="form.priority" style="width:100%">
              <el-option v-for="[val, label] in priorityOptions" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="t('kanban.createDialog.formStatus')" prop="status">
            <el-select v-model="form.status" style="width:100%">
              <el-option v-for="[val, label] in statusOptions" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item :label="t('kanban.createDialog.formAssignee')" prop="assignee">
            <el-input v-model="form.assignee" :placeholder="t('kanban.createDialog.formAssigneePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('kanban.createDialog.formDueDate')" prop="due_date">
            <el-date-picker
              v-model="form.due_date"
              type="date"
              :placeholder="t('kanban.createDialog.formDueDatePlaceholder')"
              style="width:100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item :label="t('kanban.createDialog.formLabels')" prop="labels">
        <el-select
          v-model="form.labels"
          multiple
          filterable
          allow-create
          default-first-option
          :placeholder="t('kanban.createDialog.formLabelsPlaceholder')"
          style="width:100%"
        />
      </el-form-item>
      <el-form-item :label="t('kanban.createDialog.formDescription')" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          :placeholder="t('kanban.createDialog.formDescriptionPlaceholder')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visibleLocal = false">{{ t("kanban.createDialog.cancel") }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ t("kanban.createDialog.submit") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="CreateIssueDialog">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ISSUE_TYPE_MAP } from "@/api/modules/issueService";
import type { IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";

interface CreateIssueForm {
  title: string;
  issue_type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  assignee: string;
  due_date: string;
  labels: string[];
  description: string;
}

const props = defineProps<{
  visible: boolean;
  loading: boolean;
  defaultStatus: IssueStatus;
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  submit: [form: CreateIssueForm];
}>();

const { t } = useI18n();

const visibleLocal = ref(props.visible);
watch(() => props.visible, (val) => { visibleLocal.value = val; });
watch(visibleLocal, (val) => emit("update:visible", val));

const priorityOptions: [IssuePriority, string][] = [
  ["urgent", "Urgent"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]
];

const statusOptions: [IssueStatus, string][] = [
  ["backlog", "Backlog"], ["todo", "Todo"], ["in_progress", "In Progress"],
  ["in_review", "In Review"], ["done", "Done"]
];

const form = ref<CreateIssueForm>({
  title: "",
  issue_type: "task",
  priority: "medium",
  status: props.defaultStatus,
  assignee: "",
  due_date: "",
  labels: [],
  description: ""
});

watch(() => props.defaultStatus, (s) => { form.value.status = s; });

function resetForm() {
  form.value = {
    title: "",
    issue_type: "task",
    priority: "medium",
    status: props.defaultStatus,
    assignee: "",
    due_date: "",
    labels: [],
    description: ""
  };
}

watch(() => props.visible, (val) => {
  if (val) resetForm();
});

function handleSubmit() {
  if (!form.value.title.trim()) return;
  emit("submit", { ...form.value });
}
</script>
