<template>
  <div
    class="kanban-card"
    :class="{ 'kanban-card--overdue': isOverdue }"
    @click="$emit('click')"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    <div class="kanban-card__accent" :style="{ background: priorityColor }" />
    <div class="kanban-card__overdue-stripe" v-if="isOverdue"></div>

    <div class="kanban-card__inner">
      <div class="kanban-card__head">
        <div class="kanban-card__head-left">
          <code class="kanban-card__key" :title="display.key">{{ display.key }}</code>
          <el-tag :type="display.typeTagType" size="small" effect="plain" class="kanban-card__type">
            {{ display.typeLabel }}
          </el-tag>
          <span
            v-if="display.isBug"
            class="kanban-card__severity"
            :style="{ color: severityColor, background: severityBg }"
            :title="display.severityLabel"
          >
            {{ display.severityLabel }}
          </span>
        </div>
        <span
          class="kanban-card__priority"
          :style="{ color: priorityColor, background: priorityBg }"
          :title="display.priorityLabel"
        >
          {{ display.priorityLabel }}
        </span>
      </div>

      <div
        class="kanban-card__title"
        :title="display.title"
        @click.stop="$emit('title-click')"
      >
        {{ display.title }}
      </div>

      <div class="kanban-card__meta">
        <span
          v-if="display.dueDate"
          class="kanban-card__meta-item"
          :class="{ 'kanban-card__meta-item--overdue': isOverdue }"
          :title="formatDate(display.dueDate)"
        >
          <el-icon><Clock /></el-icon><span class="kanban-card__meta-text">{{ formatDate(display.dueDate) }}</span>
        </span>
        <span
          v-if="display.timeEstimate"
          class="kanban-card__meta-item kanban-card__meta-item--muted"
          :title="display.timeEstimate + 'h'"
        >
          <el-icon><Timer /></el-icon><span class="kanban-card__meta-text">{{ display.timeEstimate }}h</span>
        </span>
        <span
          v-if="display.assignee"
          class="kanban-card__meta-item"
          :title="display.assignee"
        >
          <el-icon><User /></el-icon><span class="kanban-card__meta-text">{{ display.assignee }}</span>
        </span>
        <span
          v-if="display.goalId && goalRoleMap[display.goalId]"
          class="kanban-card__meta-item kanban-card__meta-item--link"
          :title="goalLabel(display.goalId)"
          @click.stop="$emit('goal-click')"
        >
          <el-icon><Flag /></el-icon><span class="kanban-card__meta-text">{{ goalLabel(display.goalId) }}</span>
        </span>
      </div>

      <div v-if="hasChipsOrLabels" class="kanban-card__tags">
        <button
          v-if="display.projectKey && projectName"
          type="button"
          class="kanban-card__chip kanban-card__chip--project"
          :title="projectName"
          @click.stop="$emit('project-click')"
        >
          <el-icon><Folder /></el-icon><span class="kanban-card__chip-text">{{ projectName }}</span>
        </button>
        <button
          v-if="display.releaseKey"
          type="button"
          class="kanban-card__chip kanban-card__chip--release"
          :title="releaseName || display.releaseKey"
          @click.stop="$emit('release-click')"
        >
          <el-icon><Box /></el-icon><span class="kanban-card__chip-text">{{ releaseName || display.releaseKey }}</span>
        </button>
        <span
          v-for="label in display.labels"
          :key="label"
          class="kanban-card__label-chip"
          :title="label"
        >{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { User, Clock, Folder, Box, Flag, Timer } from "@element-plus/icons-vue";
import { formatDate } from "@/utils/datetime";
import {
  ISSUE_PRIORITY_MAP, ISSUE_TYPE_TAG_MAP,
  typeLabel,
  type Issue,
  type IssuePriority,
  type IssueStatus,
  type TagType
} from "@/api/modules/issueService";
import {
  BUG_PRIORITY_MAP, BUG_SEVERITY_MAP, BUG_TYPE_MAP, BUG_TYPE_TAG_MAP,
  BUG_PRIORITY_TO_ISSUE_PRIORITY, BUG_STATUS_TO_ISSUE_STATUS,
  type BugDocument, type BugPriority, type BugSeverity, type BugStatus
} from "@/api/modules/bug";
import { goalRoleMap, allGoalsMap } from "@/views/knowledge/executiver/okrData";

type KanbanItemSource = { kind: "issue"; issue: Issue } | { kind: "bug"; bug: BugDocument };

const props = defineProps<{
  item?: KanbanItemSource;
  /** @deprecated Use `item` instead. Kept for backward-compat with existing callers. */
  issue?: Issue;
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

const source = computed<KanbanItemSource>(() => {
  if (props.item) return props.item;
  if (props.issue) return { kind: "issue", issue: props.issue };
  // Highly defensive fallback
  return { kind: "issue", issue: {} as Issue };
});

const SEVERITY_COLOR: Record<BugSeverity, string> = {
  critical: "#f56c6c",
  major: "#e6a23c",
  minor: "#409eff",
  trivial: "#909399"
};
const PRIORITY_COLOR: Record<IssuePriority, string> = {
  urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc"
};

const severityColor = computed(() => {
  if (source.value.kind !== "bug") return "#909399";
  return SEVERITY_COLOR[source.value.bug.severity] || "#909399";
});

const severityBg = computed(() => hexToRgba(severityColor.value, 0.12));

const priorityBg = computed(() => hexToRgba(priorityColor.value, 0.12));

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const value = clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean;
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const priorityColor = computed(() => {
  if (source.value.kind === "bug") {
    const issuePri = BUG_PRIORITY_TO_ISSUE_PRIORITY[source.value.bug.priority as BugPriority];
    return PRIORITY_COLOR[issuePri] || "#909399";
  }
  return PRIORITY_COLOR[source.value.issue.priority] || "#909399";
});

const display = computed(() => {
  if (source.value.kind === "bug") {
    const bug = source.value.bug;
    const typeTagType: TagType = (BUG_TYPE_TAG_MAP[bug.type] || "info") as any;
    const severityLabel = BUG_SEVERITY_MAP[bug.severity as BugSeverity] || bug.severity;
    const priorityLabel = BUG_PRIORITY_MAP[bug.priority as BugPriority] || bug.priority;
    const typeLabelStr = BUG_TYPE_MAP[bug.type] || bug.type;
    const dueDate = bug.dueDate ? new Date(bug.dueDate).toISOString().slice(0, 10) : "";
    return {
      isBug: true,
      key: bug.key,
      title: bug.title,
      typeLabel: `Bug·${typeLabelStr}`,
      typeTagType,
      severityLabel,
      priorityLabel,
      dueDate,
      timeEstimate: undefined as number | undefined,
      assignee: bug.assignee,
      goalId: "" as string,
      projectKey: bug.project_key || "",
      releaseKey: "" as string,
      labels: bug.tags || []
    };
  }
  const issue = source.value.issue;
  return {
    isBug: false,
    key: issue.key,
    title: issue.title,
    typeLabel: typeLabel(issue.issue_type),
    typeTagType: ISSUE_TYPE_TAG_MAP[issue.issue_type] || "info",
    severityLabel: "" as string,
    priorityLabel: priorityLabel(issue.priority),
    dueDate: issue.due_date ? issue.due_date.slice(0, 10) : "",
    timeEstimate: issue.time_estimate,
    assignee: issue.assignee,
    goalId: issue.goal_id || "",
    projectKey: issue.project_key,
    releaseKey: issue.release_key || "",
    labels: issue.labels
  };
});

const isOverdue = computed(() => {
  if (!display.value.dueDate) return false;
  let issueStatus: IssueStatus;
  if (source.value.kind === "bug") {
    const s = source.value.bug.status as BugStatus;
    issueStatus = (BUG_STATUS_TO_ISSUE_STATUS as Record<string, IssueStatus>)[s] || "todo";
  } else {
    issueStatus = source.value.issue.status;
  }
  if (issueStatus === "done" || issueStatus === "cancelled") return false;
  const today = new Date().toISOString().slice(0, 10);
  return display.value.dueDate < today;
});

const hasChipsOrLabels = computed(() => {
  const d = display.value;
  return !!(
    (d.projectKey && props.projectName) ||
    d.releaseKey ||
    (d.labels && d.labels.length > 0)
  );
});

function priorityLabel(p: IssuePriority) { return ISSUE_PRIORITY_MAP[p] || p; }
function goalLabel(goalId: string): string { return allGoalsMap[goalId]?.title || goalId; }
</script>

<style scoped lang="scss">
.kanban-card {
  position: relative;
  background: var(--el-bg-color);
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 1px var(--el-border-color-lighter) inset;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease,
    background-color 0.2s ease;
  border: 1px solid transparent;
  min-width: 0;
  overflow: hidden;

  &:hover {
    box-shadow:
      0 6px 18px rgba(15, 23, 42, 0.10),
      0 0 0 1px var(--el-color-primary-light-5) inset;
    transform: translateY(-1px);
    background: var(--el-fill-color-blank);

    .kanban-card__accent { width: 4px; }
  }

  &:active { transform: translateY(0); }
}

.kanban-card--overdue {
  background:
    linear-gradient(180deg, rgba(245, 108, 108, 0.08) 0%, var(--el-bg-color) 40%);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 0 0 1px var(--el-color-danger-light-5) inset;

  &:hover {
    box-shadow:
      0 6px 18px rgba(245, 108, 108, 0.14),
      0 0 0 1px var(--el-color-danger-light-4) inset;
  }
}

.kanban-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  transition: width 0.2s ease, opacity 0.2s ease;
  z-index: 1;
  opacity: 0.95;
}

.kanban-card__overdue-stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 2;
  background: repeating-linear-gradient(
    -45deg,
    var(--el-color-danger),
    var(--el-color-danger) 5px,
    transparent 5px,
    transparent 10px
  );
  opacity: 0.65;
}

.kanban-card__inner {
  position: relative;
  padding: 11px 12px 12px 15px;
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: 1;
  min-width: 0;
}

// ── Head: key + type + severity | priority ──
.kanban-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
  min-width: 0;
}

.kanban-card__head-left {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 5px;
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.kanban-card__key {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 42%;
  font-size: 10.5px;
  color: var(--el-text-color-secondary);
  font-family: "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  background: var(--el-fill-color-light);
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}

.kanban-card__type {
  flex: 0 0 auto;
  min-width: 0;
  max-width: 48%;
  :deep(.el-tag) {
    height: 20px;
    line-height: 18px;
    border-radius: 4px;
    max-width: 100%;
  }
  :deep(.el-tag__content) {
    font-size: 10px;
    line-height: 18px;
    padding: 0 7px;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.kanban-card__severity {
  flex: 0 0 auto;
  min-width: 0;
  max-width: 40%;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2px;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kanban-card__priority {
  flex: 0 0 auto;
  min-width: 0;
  max-width: 36%;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2px;
  padding: 3px 7px;
  border-radius: 4px;
  white-space: nowrap;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ── Title ──
.kanban-card__title {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
  margin: 0 0 9px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
  word-break: break-word;
  color: var(--el-text-color-primary);
  cursor: pointer;
  padding: 3px 5px;
  margin-left: -5px;
  margin-right: -5px;
  border-radius: 6px;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

// ── Meta row (date / estimate / assignee / goal) ──
.kanban-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 12px;
  margin-bottom: 8px;
  min-width: 0;
}

.kanban-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  min-width: 0;
  flex-shrink: 0;

  .el-icon {
    font-size: 11px;
    flex-shrink: 0;
    opacity: 0.85;
  }

  &-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }

  &--muted {
    color: var(--el-text-color-placeholder);
  }

  &--overdue {
    color: var(--el-color-danger);
    font-weight: 600;

    .el-icon {
      animation: wobble 2.4s ease-in-out infinite;
      transform-origin: 50% 50%;
    }
  }

  &--link {
    color: var(--el-color-primary);
    cursor: pointer;
    padding: 0 3px;
    margin: 0 -3px;
    border-radius: 4px;
    transition: background 0.14s ease;

    &:hover {
      background: var(--el-color-primary-light-9);
      text-decoration: none;
    }
  }
}

@keyframes wobble {
  0%, 90%, 100% { transform: rotate(0deg); }
  92% { transform: rotate(-10deg); }
  94% { transform: rotate(10deg); }
  96% { transform: rotate(-8deg); }
  98% { transform: rotate(8deg); }
}

// ── Tags row (project / release / labels) ──
.kanban-card__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

// ── Chips (project / release) ──
.kanban-card__chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 9px;
  border: none;
  border-radius: 999px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.6;
  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease,
    background-color 0.14s ease,
    filter 0.14s ease;
  flex-shrink: 0;
  font-weight: 500;

  .el-icon { font-size: 10px; flex-shrink: 0; }

  &-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
  }

  &:hover {
    transform: translateY(-0.5px);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    filter: brightness(1.06);
  }

  &:active {
    transform: translateY(0);
    filter: brightness(0.98);
  }

  &--project {
    color: #3b5dd4;
    background: rgba(84, 112, 198, 0.14);
    &:hover { background: rgba(84, 112, 198, 0.22); }
  }

  &--release {
    color: #4fa92e;
    background: rgba(103, 194, 58, 0.14);
    &:hover { background: rgba(103, 194, 58, 0.22); }
  }
}

// ── Label chips ──
.kanban-card__label-chip {
  font-size: 10px;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  line-height: 1.6;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 500;
  transition: background 0.14s ease, color 0.14s ease;
  cursor: default;

  &:hover {
    background: var(--el-color-primary-light-8);
  }
}
</style>
