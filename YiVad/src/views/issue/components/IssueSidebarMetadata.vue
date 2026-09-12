<template>
  <div class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><InfoFilled /></el-icon>
      <span>Metadata</span>
    </div>
    <div class="id-sb-group__body">
      <div class="id-sb-row">
        <span class="id-sb-row__label">Source</span>
        <span class="id-sb-row__value">{{ issue.source ? ISSUE_SOURCE_MAP[issue.source] : '-' }}</span>
      </div>
      <div class="id-sb-row">
        <span class="id-sb-row__label">Review</span>
        <span class="id-sb-row__value">{{ issue.review_status ? REVIEW_STATUS_MAP[issue.review_status] : '-' }}</span>
      </div>
      <div class="id-sb-row">
        <span class="id-sb-row__label">Created</span>
        <span class="id-sb-row__value id-sb-row__value--muted">{{ formatRelativeTime(issue.created_at) }}</span>
      </div>
      <div class="id-sb-row">
        <span class="id-sb-row__label">Updated</span>
        <span class="id-sb-row__value id-sb-row__value--muted">{{ formatRelativeTime(issue.updated_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarMetadata">
import { InfoFilled } from "@element-plus/icons-vue";
import type { Issue } from "@/api/modules/issueService";
import { ISSUE_SOURCE_MAP, REVIEW_STATUS_MAP } from "@/api/modules/issueService";
import { formatRelativeTime } from "@/utils/datetime";

defineProps<{ issue: Issue }>();
</script>