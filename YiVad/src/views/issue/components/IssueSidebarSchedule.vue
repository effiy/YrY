<template>
  <div class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><Calendar /></el-icon>
      <span>Schedule</span>
      <button v-if="!editing" type="button" class="id-sb-edit" title="Edit schedule" @click="startEdit">
        <el-icon><Edit /></el-icon>
      </button>
    </div>
    <div class="id-sb-group__body">
      <template v-if="editing">
        <div class="id-sb-edit-row">
          <span class="id-sb-edit-row__label">Start</span>
          <el-date-picker v-model="form.start_date" size="small" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </div>
        <div class="id-sb-edit-row">
          <span class="id-sb-edit-row__label">Due</span>
          <el-date-picker v-model="form.due_date" size="small" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </div>
        <div class="id-sb-edit-row">
          <span class="id-sb-edit-row__label">Pts</span>
          <el-input-number v-model="form.estimate_points" size="small" :min="0" :step="1" style="width:100%" />
        </div>
        <div class="id-sb-edit-row">
          <span class="id-sb-edit-row__label">Time (h)</span>
          <el-input-number v-model="form.time_estimate" size="small" :min="0" :step="0.5" :precision="1" style="width:100%" />
        </div>
        <div class="id-sb-edit-actions">
          <el-button size="small" type="primary" :loading="saving" @click="save">Save</el-button>
          <el-button size="small" @click="editing = false">Cancel</el-button>
        </div>
      </template>
      <template v-else>
        <div class="id-sb-row">
          <span class="id-sb-row__label">Start Date</span>
          <span class="id-sb-row__value id-sb-row__value--muted">{{ issue.start_date || '-' }}</span>
        </div>
        <div class="id-sb-row">
          <span class="id-sb-row__label">Due Date</span>
          <span class="id-sb-row__value" :class="{ 'id-sb-row__value--overdue': isOverdue }">
            {{ issue.due_date || '-' }}
          </span>
        </div>
        <div class="id-sb-row">
          <span class="id-sb-row__label">Estimate</span>
          <span class="id-sb-row__value">
            {{ issue.estimate_points ? issue.estimate_points + ' pts' : '-' }}
          </span>
        </div>
        <div class="id-sb-row">
          <span class="id-sb-row__label">Time</span>
          <span class="id-sb-row__value">
            <template v-if="issue.time_estimate">
              <div class="id-time-bar">
                <span class="id-time-bar__text">{{ issue.time_spent || 0 }}h / {{ issue.time_estimate }}h</span>
                <el-progress
                  :percentage="timePct"
                  :stroke-width="5"
                  :show-text="false"
                  :color="timePct > 100 ? '#f56c6c' : '#409eff'"
                />
              </div>
            </template>
            <template v-else>-</template>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarSchedule">
import { computed, reactive, ref } from "vue";
import { Calendar, Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import type { Issue } from "@/api/modules/issueService";

const props = defineProps<{ issue: Issue }>();
const store = useIssueStore();

const editing = ref(false);
const saving = ref(false);
const form = reactive({ start_date: "", due_date: "", estimate_points: undefined as number | undefined, time_estimate: undefined as number | undefined });

const isOverdue = computed(() => {
  const i = props.issue;
  if (!i?.due_date || i.status === "done") return false;
  return i.due_date < new Date().toISOString().slice(0, 10);
});

const timePct = computed(() => {
  if (!props.issue?.time_estimate) return 0;
  return Math.round(((props.issue.time_spent || 0) / props.issue.time_estimate) * 100);
});

function startEdit() {
  form.start_date = props.issue.start_date || "";
  form.due_date = props.issue.due_date || "";
  form.estimate_points = props.issue.estimate_points;
  form.time_estimate = props.issue.time_estimate;
  editing.value = true;
}

async function save() {
  saving.value = true;
  try {
    await store.editIssue(props.issue.key, {
      start_date: form.start_date || undefined,
      due_date: form.due_date || undefined,
      estimate_points: form.estimate_points,
      time_estimate: form.time_estimate,
    } as any);
    ElMessage.success("Schedule updated");
    editing.value = false;
  } finally { saving.value = false; }
}
</script>