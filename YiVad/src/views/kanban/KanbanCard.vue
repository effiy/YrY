<template>
  <div
    class="kanban-card"
    :class="{ 'kanban-card--overdue': isOverdue }"
    @click="$emit('click')"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    <div class="kanban-card__accent" :style="{ background: priorityColor }" />

    <!-- Row 1: key + type + priority -->
    <div class="kanban-card__head">
      <code class="kanban-card__key">{{ issue.key }}</code>
      <el-tag :type="typeTagType" size="small" effect="plain">
        {{ typeLabel(issue.issue_type) }}
      </el-tag>
      <span class="kanban-card__priority" :style="{ color: priorityColor }">
        {{ priorityLabel(issue.priority) }}
      </span>
    </div>

    <!-- Row 2: title -->
    <div class="kanban-card__title" @click.stop="$emit('title-click')">{{ issue.title }}</div>

    <!-- Row 3: compact footer (items + chips + labels) -->
    <div class="kanban-card__foot">
      <span v-if="issue.due_date" class="kanban-card__foot-item" :class="{ 'kanban-card__foot-item--overdue': isOverdue }">
        <el-icon><Clock /></el-icon>{{ formatDate(issue.due_date) }}
      </span>
      <span v-if="issue.time_estimate" class="kanban-card__foot-item kanban-card__foot-item--muted">
        {{ issue.time_estimate }}h
      </span>
      <span v-if="issue.assignee" class="kanban-card__foot-item">
        <el-icon><User /></el-icon>{{ issue.assignee }}
      </span>
      <span v-if="issue.goal_id && goalRoleMap[issue.goal_id]" class="kanban-card__foot-item kanban-card__foot-item--link" @click.stop="$emit('goal-click')">
        <el-icon><Flag /></el-icon>{{ goalLabel(issue.goal_id) }}
      </span>
      <button v-if="issue.project_key && projectName" type="button" class="kanban-card__chip kanban-card__chip--project" @click.stop="$emit('project-click')">
        <el-icon><Folder /></el-icon>{{ projectName }}
      </button>
      <button v-if="issue.release_key" type="button" class="kanban-card__chip kanban-card__chip--release" @click.stop="$emit('release-click')">
        <el-icon><Box /></el-icon>{{ releaseName || issue.release_key }}
      </button>
      <span v-for="label in issue.labels" :key="label" class="kanban-card__label-chip">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { User, Clock, Folder, Box, Flag } from "@element-plus/icons-vue";
import { formatDate } from "@/utils/datetime";
import {
  ISSUE_PRIORITY_MAP, ISSUE_TYPE_TAG_MAP,
  typeLabel
} from "@/api/modules/issueService";
import type { Issue, IssuePriority, TagType } from "@/api/modules/issueService";
import { goalRoleMap, allGoalsMap } from "@/views/knowledge/executiver/okrData";

const props = defineProps<{
  issue: Issue;
  projectName?: string;
  releaseName?: string;
}>();

defineEmits<{
  (e: "click"): void;
  (e: "title-click"): void;
  (e: "goal-click"): void;
  (e: "project-click"): void;
  (e: "release-click"): void;
  (e: "contextmenu", event: MouseEvent): void;
}>();

const priorityColor = computed(() => {
  const m: Record<IssuePriority, string> = {
    urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc"
  };
  return m[props.issue.priority] || "#909399";
});

const typeTagType = computed<TagType>(() => ISSUE_TYPE_TAG_MAP[props.issue.issue_type] || "info");

const isOverdue = computed(() => {
  const i = props.issue;
  if (!i.due_date || i.status === "done" || i.status === "cancelled") return false;
  const today = new Date().toISOString().slice(0, 10);
  return i.due_date.slice(0, 10) < today;
});

function priorityLabel(p: IssuePriority) { return ISSUE_PRIORITY_MAP[p] || p; }
function goalLabel(goalId: string): string { return allGoalsMap[goalId]?.title || goalId; }
</script>

<style scoped lang="scss">
.kanban-card {
  position: relative;
  background: var(--el-bg-color);
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.12s;
  border: 1px solid var(--el-border-color-lighter);

  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.09);
    border-color: var(--el-border-color);
    transform: translateY(-1px);
  }

  &:active { transform: translateY(0); }
}

.kanban-card--overdue {
  border-color: var(--el-color-danger-light-4);
  box-shadow: 0 0 0 1px var(--el-color-danger-light-6);
}

.kanban-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 6px 0 0 6px;
}

// ── Row 1: Head ──
.kanban-card__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.kanban-card__key {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
  background: var(--el-fill-color-light);
  padding: 1px 5px;
  border-radius: 3px;
}

.kanban-card__priority {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

// ── Row 2: Title ──
.kanban-card__title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--el-text-color-primary);
  cursor: pointer;
  padding: 1px 4px;
  margin-left: -4px;
  margin-right: -4px;
  border-radius: 3px;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

// ── Row 3: Compact footer (items + chips + labels) ──
.kanban-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.kanban-card__foot-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;

  .el-icon { font-size: 11px; flex-shrink: 0; }

  &--muted { color: var(--el-text-color-placeholder); }

  &--overdue {
    color: var(--el-color-danger);
    font-weight: 600;
  }

  &--link {
    color: var(--el-color-primary);
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }
}

// ── Chips ──
.kanban-card__chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border: none;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.6;

  .el-icon { font-size: 10px; }

  &--project {
    color: #5470c6;
    background: #5470c618;
    &:hover { background: #5470c630; }
  }

  &--release {
    color: #67c23a;
    background: #67c23a18;
    &:hover { background: #67c23a30; }
  }
}

// ── Label chips (in footer) ──
.kanban-card__label-chip {
  font-size: 10px;
  padding: 0 5px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  line-height: 1.7;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>