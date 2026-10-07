<script setup lang="ts" name="BugFormDialog">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useBugStore } from "@/stores/modules/bug";
import { useIssueStore } from "@/stores/modules/issue";
import { useProjectStore } from "@/stores/modules/project";
import { getIssueFilePath } from "@/api/modules/issueService";
import { readBugContent } from "@/api/modules/bug";
import type { BugDocument, BugSeverity, BugPriority, BugStatus } from "@/api/modules/bug";

const { t } = useI18n();
const emit = defineEmits<{ (e: "saved"): void }>();

const store = useBugStore();
const issueStore = useIssueStore();
const formRef = ref<FormInstance>();

const severities: BugSeverity[] = ["critical", "major", "minor", "trivial"];
const priorities: BugPriority[] = ["p0", "p1", "p2", "p3"];
const statuses: BugStatus[] = ["open", "in_progress", "resolved", "closed", "rejected", "reopened"];
const types = ["functional", "performance", "ui", "security", "compatibility", "regression", "data", "other"];
const frequencies = ["always", "sometimes", "rarely", "once", "unable"];

const severityLabels: Record<string, string> = {
  critical: t("bug.severity.critical"), major: t("bug.severity.major"),
  minor: t("bug.severity.minor"), trivial: t("bug.severity.trivial")
};
const priorityLabels: Record<string, string> = {
  p0: t("bug.priority.urgent"), p1: t("bug.priority.high"),
  p2: t("bug.priority.medium"), p3: t("bug.priority.low")
};
const statusLabels: Record<string, string> = {
  open: t("bug.status.open"), in_progress: t("bug.status.in_progress"),
  resolved: t("bug.status.resolved"), closed: t("bug.status.closed"),
  reopened: t("bug.status.reopened")
};

const rules: FormRules = {
  title: [{ required: true, message: () => t("bug.dialog.titleRequired"), trigger: "blur" }],
  severity: [{ required: true, message: () => t("bug.dialog.severity"), trigger: "change" }],
  priority: [{ required: true, message: () => t("bug.dialog.priority"), trigger: "change" }],
  status: [{ required: true, message: () => t("bug.dialog.status"), trigger: "change" }],
  type: [{ required: true, message: () => t("bug.table.type"), trigger: "change" }],
  frequency: [{ required: true, message: () => t("bug.dialog.frequency"), trigger: "change" }]
};

const projectStore = useProjectStore();
const projects = computed(() => projectStore.projects);
function projectName(key: string): string {
  return projects.value.find((p: any) => p.key === key)?.name ?? "";
}

const selectableIssues = computed(() => {
  const pk = store.form.project_key;
  return pk ? issueStore.issues.filter(i => i.project_key === pk) : issueStore.issues;
});
function issueTitle(key: string): string {
  const i = issueStore.issues.find(x => x.key === key);
  return i ? i.title : key;
}
function goIssue(key: string) {
  const issue = issueStore.issues.find(i => i.key === key);
  if (!issue) return;
  const filePath = getIssueFilePath(issue);
  window.open(`#/knowledge/executive/processRecord?file=${encodeURIComponent(filePath)}`, "_blank");
}

async function handleSave() {
  if (!formRef.value) {
    ElMessage.warning(t("common.operationFailed"));
    return;
  }
  try {
    await formRef.value.validate();
  } catch {
    ElMessage.warning(t("bug.dialog.titleRequired"));
    return;
  }
  await store.handleSave();
  emit("saved");
}

async function openEdit(bug: BugDocument) {
  let content = null;
  try {
    if (bug.contentPath) content = await readBugContent(bug);
  } catch { /* use empty */ }
  store.openEditDialog(bug, content);
}

defineExpose({ openEdit });
</script>

<template>
  <el-dialog
    v-model="store.dialogVisible"
    :title="store.isEdit ? $t('bug.dialog.editTitle') : $t('bug.dialog.createTitle')"
    width="700px"
    destroy-on-close
    @closed="store.resetForm()"
  >
    <el-form ref="formRef" :model="store.form" :rules="rules" label-width="110px" @keyup.enter="handleSave">
      <el-form-item :label="$t('bug.dialog.title')" prop="title">
        <el-input v-model="store.form.title" :placeholder="$t('bug.dialog.titlePlaceholder')" maxlength="200" show-word-limit autofocus />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.severity')" prop="severity">
            <el-select v-model="store.form.severity" style="width: 100%">
              <el-option v-for="v in severities" :key="v" :label="severityLabels[v]" :value="v" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.priority')" prop="priority">
            <el-select v-model="store.form.priority" style="width: 100%">
              <el-option v-for="v in priorities" :key="v" :label="priorityLabels[v]" :value="v" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.status')" prop="status">
            <el-select v-model="store.form.status" style="width: 100%">
              <el-option v-for="v in statuses" :key="v" :label="statusLabels[v]" :value="v" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="Type" prop="type">
            <el-select v-model="store.form.type" style="width: 100%">
              <el-option v-for="v in types" :key="v" :label="v" :value="v" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.frequency')" prop="frequency">
            <el-select v-model="store.form.frequency" style="width: 100%">
              <el-option v-for="v in frequencies" :key="v" :label="v" :value="v" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.project')">
            <el-select v-model="store.form.project_key" style="width: 100%" filterable>
              <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('bug.dialog.module')">
            <el-input v-model="store.form.module" :placeholder="$t('bug.dialog.modulePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Iteration">
            <el-input v-model="store.form.iteration" placeholder="Iteration" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.assignee')">
            <el-input v-model="store.form.assignee" :placeholder="$t('bug.dialog.assigneePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.reporter')">
            <el-input v-model="store.form.reporter" :placeholder="$t('bug.dialog.reporterPlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('bug.dialog.tags')">
            <el-input :model-value="(store.form.tags as string[]).join(', ')" :placeholder="$t('bug.dialog.tagsPlaceholder')" @update:model-value="(v: string) => (store.form.tags = (v || '').split(',').map(t => t.trim()).filter(Boolean))" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('bug.dialog.environment')">
            <el-input v-model="store.form.environment" :placeholder="$t('bug.dialog.environmentPlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="$t('bug.dialog.affectedVersion')">
            <el-input v-model="store.form.affectedVersion" :placeholder="$t('bug.dialog.affectedVersionPlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item :label="$t('bug.dialog.fixedVersion')">
            <el-input v-model="store.form.fixedVersion" :placeholder="$t('bug.dialog.fixedVersionPlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Due Date">
        <el-date-picker v-model="store.form.dueDate" type="date" :placeholder="$t('bug.dialog.dueDate')" style="width: 100%" />
      </el-form-item>
      <el-form-item label="Issue">
        <el-select v-model="store.form.issue_key" style="width: 100%" filterable clearable :placeholder="$t('bug.detail.relatedItems.issues')">
          <el-option v-for="i in selectableIssues" :key="i.key" :label="`${i.key} — ${i.title}`" :value="i.key">
            <span style="float: left">{{ i.key }}</span>
            <span style="float: right; color: var(--el-text-color-secondary); font-size: 12px">{{ i.title }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('bug.detail.overview.key')">
        <el-input v-model="store.form.defectUrl" placeholder="Link to defect tracking" />
      </el-form-item>
      <el-form-item :label="$t('bug.dialog.description')">
        <el-input v-model="store.form.description" type="textarea" :rows="3" :placeholder="$t('bug.dialog.descriptionPlaceholder')" />
      </el-form-item>
      <el-form-item :label="$t('bug.dialog.stepsToReproduce')">
        <el-input v-model="store.form.stepsToReproduce" type="textarea" :rows="3" :placeholder="$t('bug.dialog.stepsPlaceholder')" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('bug.dialog.expectedResult')">
            <el-input v-model="store.form.expectedResult" type="textarea" :rows="2" :placeholder="$t('bug.dialog.expectedResultPlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('bug.dialog.actualResult')">
            <el-input v-model="store.form.actualResult" type="textarea" :rows="2" :placeholder="$t('bug.dialog.actualResultPlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Cause">
        <el-input v-model="store.form.causeProblem" type="textarea" :rows="2" placeholder="Root cause analysis" />
      </el-form-item>
      <el-form-item label="Solution">
        <el-input v-model="store.form.solution" type="textarea" :rows="2" placeholder="Fix / solution" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="store.dialogVisible = false">{{ $t("bug.dialog.cancel") }}</el-button>
      <el-button type="primary" @click="handleSave">{{ $t("bug.dialog.save") }}</el-button>
    </template>
  </el-dialog>
</template>