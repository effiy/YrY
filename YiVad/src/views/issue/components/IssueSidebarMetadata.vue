<template>
  <div class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><InfoFilled /></el-icon>
      <span>Metadata</span>
    </div>
    <div class="id-sb-group__body">
      <div class="id-sb-row">
        <span class="id-sb-row__label">Source</span>
        <span class="id-sb-row__value">{{ issue.source ? ISSUE_SOURCE_MAP[issue.source] : "-" }}</span>
      </div>
      <div class="id-sb-row">
        <span class="id-sb-row__label">Review</span>
        <span class="id-sb-row__value">{{ issue.review_status ? REVIEW_STATUS_MAP[issue.review_status] : "-" }}</span>
      </div>
      <div class="id-sb-row">
        <span class="id-sb-row__label">Created</span>
        <span class="id-sb-row__value id-sb-row__value--muted">{{ formatRelativeTime(issue.created_at) }}</span>
      </div>
      <div class="id-sb-row">
        <span class="id-sb-row__label">Updated</span>
        <span class="id-sb-row__value id-sb-row__value--muted">{{ formatRelativeTime(issue.updated_at) }}</span>
      </div>
      <div class="id-sb-row">
        <span class="id-sb-row__label">{{ issue.status === "done" || issue.status === "cancelled" ? "Duration" : "Age" }}</span>
        <span class="id-sb-row__value id-sb-row__value--muted" :class="{ 'id-sb-row__value--warn': !isResolved && ageDays > 14 }">
          {{ ageDisplay }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarMetadata">
import { InfoFilled } from "@element-plus/icons-vue";
import { computed } from "vue";
import type { Issue } from "@/api/modules/issueService";
import { ISSUE_SOURCE_MAP, REVIEW_STATUS_MAP } from "@/api/modules/issueService";
import { formatRelativeTime } from "@/utils/datetime";

const props = defineProps<{ issue: Issue }>();

const isResolved = computed(() => props.issue.status === "done" || props.issue.status === "cancelled");

const ageMs = computed(() => {
  if (!props.issue.created_at) return 0;
  const start = new Date(props.issue.created_at).getTime();
  const end = isResolved.value ? new Date(props.issue.updated_at || props.issue.created_at).getTime() : Date.now();
  return end - start;
});
const ageDays = computed(() => Math.floor(ageMs.value / 86400000));
const ageHours = computed(() => Math.floor(ageMs.value / 3600000));
const ageDisplay = computed(() => {
  if (ageDays.value > 0) return `${ageDays.value}d`;
  if (ageHours.value > 0) return `${ageHours.value}h`;
  return "< 1h";
});
</script>
