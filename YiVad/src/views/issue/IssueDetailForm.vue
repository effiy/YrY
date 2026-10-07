<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <div class="id-edit-section">
      <div class="id-edit-section__title">{{ $t("issue.dialog.editSection.basic") }}</div>
      <el-form-item :label="$t('issue.dialog.title')" prop="title">
        <el-input
          v-model="form.title"
          :placeholder="$t('issue.dialog.titlePlaceholder')"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item :label="$t('issue.dialog.type')" prop="issue_type">
            <el-select v-model="form.issue_type" style="width: 100%">
              <el-option v-for="(label, val) in ISSUE_TYPE_MAP" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('issue.dialog.priority')" prop="priority">
            <el-select v-model="form.priority" style="width: 100%">
              <el-option v-for="(label, val) in ISSUE_PRIORITY_MAP" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('issue.dialog.status')" prop="status">
            <el-select v-model="form.status" style="width: 100%">
              <el-option v-for="(label, val) in ISSUE_STATUS_MAP" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
    <div class="id-edit-section">
      <div class="id-edit-section__title">{{ $t("issue.dialog.editSection.content") }}</div>
      <el-form-item :label="$t('issue.dialog.description')">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          :placeholder="$t('issue.dialog.descriptionPlaceholder')"
        />
      </el-form-item>
    </div>
    <div class="id-edit-section">
      <div class="id-edit-section__title">{{ $t("issue.dialog.editSection.assignment") }}</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.assignee')">
            <el-input v-model="form.assignee" :placeholder="$t('issue.dialog.assigneePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.labels')">
            <el-select
              v-model="form.labels"
              multiple
              filterable
              allow-create
              default-first-option
              :placeholder="$t('issue.dialog.addLabels')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
    <div class="id-edit-section">
      <div class="id-edit-section__title">{{ $t("issue.dialog.editSection.schedule") }}</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.startDate')">
            <el-date-picker
              v-model="form.start_date"
              type="date"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.dueDate')">
            <el-date-picker v-model="form.due_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.estimatePts')">
            <el-input-number v-model="form.estimate_points" :min="0" :step="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.timeEstimate')">
            <el-input-number
              v-model="form.time_estimate"
              :min="0"
              :step="0.5"
              :precision="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.source')">
            <el-select
              v-model="form.source"
              style="width: 100%"
              clearable
              :placeholder="$t('issue.dialog.sourcePlaceholder')"
            >
              <el-option v-for="(label, val) in ISSUE_SOURCE_MAP" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('issue.dialog.review')">
            <el-select
              v-model="form.review_status"
              style="width: 100%"
              clearable
              :placeholder="$t('issue.dialog.reviewPlaceholder')"
            >
              <el-option v-for="(label, val) in REVIEW_STATUS_MAP" :key="val" :label="label" :value="val" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script setup lang="ts" name="IssueDetailForm">
import { ref } from "vue";
import type { FormRules, FormInstance } from "element-plus";
import type { IssueStatus, IssuePriority, IssueType, IssueSource, ReviewStatus } from "@/api/modules/issueService";
import {
  ISSUE_STATUS_MAP,
  ISSUE_PRIORITY_MAP,
  ISSUE_TYPE_MAP,
  ISSUE_SOURCE_MAP,
  REVIEW_STATUS_MAP,
} from "@/api/modules/issueService";

defineProps<{
  form: {
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    issue_type: IssueType;
    assignee: string;
    labels: string[];
    start_date: string;
    due_date: string;
    source: IssueSource | "";
    review_status: ReviewStatus | "";
    estimate_points?: number;
    time_estimate?: number;
  };
  rules: FormRules;
}>();

const formRef = ref<FormInstance>();

async function validate() {
  return formRef.value?.validate();
}

defineExpose({ formRef, validate });
</script>