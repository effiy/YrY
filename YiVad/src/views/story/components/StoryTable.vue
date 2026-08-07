<script setup lang="tsx" name="storyTable">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Delete, EditPen } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { PROJECT_LABELS } from "@/config";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import type { StoryDocument } from "@/api/modules/story";
import StoryStatusBadge from "./StoryStatusBadge.vue";

const { t } = useI18n();

const props = defineProps<{
  stories: StoryDocument[];
}>();

const emit = defineEmits<{
  (e: "rowClick", story: StoryDocument): void;
  (e: "edit", story: StoryDocument): void;
  (e: "delete", story: StoryDocument): void;
}>();

const proTableRef = ref<ProTableInstance>();

const priorityColors: Record<string, string> = {
  p0: "danger",
  p1: "warning",
  p2: "info",
  p3: "info"
};

const scheduleStatusColors: Record<string, string> = {
  planned: "",
  on_track: "success",
  at_risk: "warning",
  delayed: "danger",
  completed: "info"
};

function fmtDate(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtRelative(ts: number | null): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min > 1 ? "s" : ""} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day > 1 ? "s" : ""} ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} month${month > 1 ? "s" : ""} ago`;
  return `${Math.floor(month / 12)} year(s) ago`;
}

function scenarioCount(story: StoryDocument): number {
  return story.scenarios?.length ?? 0;
}

function scenarioDone(story: StoryDocument): number {
  return story.scenarios?.filter(sc => sc.status === "operations").length ?? 0;
}

function isOverdue(dueDate: number | null): boolean {
  if (!dueDate) return false;
  return dueDate < Date.now();
}

function milestoneDone(story: StoryDocument): number {
  return story.milestones?.filter(m => m.status === "done").length ?? 0;
}

function milestoneTotal(story: StoryDocument): number {
  return story.milestones?.length ?? 0;
}

function milestoneProgress(story: StoryDocument): number {
  const total = milestoneTotal(story);
  if (!total) return 0;
  return Math.round((milestoneDone(story) / total) * 100);
}

const scheduleLabels: Record<string, string> = {
  planned: "planned",
  on_track: "onTrack",
  at_risk: "atRisk",
  delayed: "delayed",
  completed: "completed"
};

function scheduleLabel(status: string): string {
  const k = scheduleLabels[status];
  return k ? t(`story.${k}`) : status;
}

const statusOrder = ["planning", "design", "develop", "testing", "operations", "archived"] as const;

const statusSummary = computed(() => {
  const counts: Record<string, number> = {};
  for (const s of props.stories) {
    const key = s.status || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return statusOrder.filter(st => counts[st]).map(st => ({ status: st, count: counts[st] }));
});

const tableHeight = ref(0);
const updateTableHeight = () => {
  // header(55) + tabs(40) + sb-root padding(24) + board header(46) + filters(66) + toolbar(47) + footer(40) = 318
  tableHeight.value = Math.max(200, window.innerHeight - 318);
};
onMounted(() => {
  updateTableHeight();
  window.addEventListener("resize", updateTableHeight);
});
onBeforeUnmount(() => window.removeEventListener("resize", updateTableHeight));

const columns = reactive<ColumnProps<StoryDocument>[]>([
  {
    prop: "name",
    label: t("story.name"),
    minWidth: 180,
    render: scope => <span class="st-name-link">{scope.row.name}</span>
  },
  {
    prop: "sprint",
    label: t("story.sprint"),
    width: 100,
    render: scope => <span>{scope.row.sprint || "—"}</span>
  },
  {
    prop: "project",
    label: t("story.project"),
    width: 90,
    render: scope => (scope.row.project ? <el-tag size="small" type="info">{PROJECT_LABELS[scope.row.project] ?? scope.row.project}</el-tag> : <span class="st-empty">—</span>)
  },
  {
    prop: "status",
    label: t("story.status"),
    width: 110,
    render: scope => <StoryStatusBadge status={scope.row.status} />
  },
  {
    prop: "scheduleStatus",
    label: t("story.schedule"),
    width: 110,
    render: scope =>
      scope.row.scheduleStatus ? (
        <el-tag type={(scheduleStatusColors[scope.row.scheduleStatus] as any) || undefined} size="small">
          {scheduleLabel(scope.row.scheduleStatus)}
        </el-tag>
      ) : (
        <span class="st-empty">—</span>
      )
  },
  {
    prop: "priority",
    label: t("story.priority"),
    width: 90,
    render: scope =>
      scope.row.priority ? (
        <el-tag type={(priorityColors[scope.row.priority] as any) || undefined} size="small">
          {scope.row.priority.toUpperCase()}
        </el-tag>
      ) : (
        <span class="st-empty">—</span>
      )
  },
  {
    prop: "scenarios",
    label: t("story.scenarios"),
    width: 90,
    align: "center",
    render: scope => <span>{scenarioDone(scope.row)}/{scenarioCount(scope.row)}</span>
  },
  {
    prop: "objectives",
    label: t("brd.objectives"),
    width: 90,
    align: "center",
    render: scope => <span>{scope.row.objectives?.length || 0}</span>
  },
  {
    prop: "milestones",
    label: t("story.milestoneProgress"),
    width: 120,
    align: "center",
    render: scope => {
      const total = milestoneTotal(scope.row);
      if (!total) return <span class="st-empty">—</span>;
      const progress = milestoneProgress(scope.row);
      return (
        <div class="milestone-col">
          <el-progress
            percentage={progress}
            stroke-width={6}
            show-text={false}
            color={progress === 100 ? "#67c23a" : "#409eff"}
          />
          <span class="milestone-text">
            {milestoneDone(scope.row)}/{total}
          </span>
        </div>
      );
    }
  },
  {
    prop: "businessRules",
    label: t("brd.rules"),
    width: 90,
    align: "center",
    render: scope => <span>{scope.row.businessRules?.length || 0}</span>
  },
  {
    prop: "dueDate",
    label: t("story.dueDate"),
    width: 100,
    render: scope =>
      scope.row.dueDate ? (
        <span class={{ "st-due-date": true, "st-due-date--overdue": isOverdue(scope.row.dueDate) }}>
          {fmtDate(scope.row.dueDate)}
        </span>
      ) : (
        <span class="st-empty">—</span>
      )
  },
  {
    prop: "assignee",
    label: t("story.assignee"),
    width: 90,
    render: scope => <span>{scope.row.assignee || "—"}</span>
  },
  {
    prop: "description",
    label: t("story.description"),
    minWidth: 140,
    showOverflowTooltip: true,
    render: scope => <span>{scope.row.description}</span>
  },
  {
    prop: "updatedAt",
    label: t("story.updated"),
    width: 110,
    render: scope => (
      <el-tooltip content={fmtRelative(scope.row.updatedAt)} placement="top" disabled={!scope.row.updatedAt}>
        <span>{fmtDate(scope.row.updatedAt)}</span>
      </el-tooltip>
    )
  },
  {
    prop: "operation",
    label: t("story.actions"),
    width: 140,
    fixed: "right",
    render: scope => (
      <div>
        <el-button
          size="small"
          text
          type="primary"
          icon={EditPen}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            emit("edit", scope.row);
          }}
        >
          {t("story.edit")}
        </el-button>
        <el-button
          size="small"
          text
          type="danger"
          icon={Delete}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            emit("delete", scope.row);
          }}
        >
          {t("story.del")}
        </el-button>
      </div>
    )
  }
]);

function onRowClick(row: StoryDocument) {
  emit("rowClick", row);
}
</script>

<template>
  <div class="st-root">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :data="stories"
      :pagination="false"
      :height="tableHeight"
      row-key="key"
      :border="true"
      :tool-button="false"
      @row-click="onRowClick"
    />
    <div v-if="statusSummary.length" class="st-footer">
      <span class="st-footer-label">{{ $t("story.storiesCount", { count: stories.length }) }}</span>
      <span v-for="s in statusSummary" :key="s.status" class="st-footer-badge">
        <StoryStatusBadge :status="s.status" />
        <span class="st-footer-count">{{ s.count }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.st-root {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 263px);
  min-height: 0;
  overflow: hidden;
}

.st-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  font-size: 13px;
  flex-wrap: wrap;
}

.st-footer-label {
  color: var(--el-text-color-secondary);
  margin-right: 6px;
}

.st-footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.st-footer-count {
  font-weight: 600;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.milestone-col {
  display: flex;
  align-items: center;
  gap: 6px;

  :deep(.el-progress) {
    flex: 1;
    min-width: 40px;
  }
}

.milestone-text {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.st-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.st-due-date {
  font-variant-numeric: tabular-nums;
  &--overdue {
    color: var(--el-color-danger);
    font-weight: 600;
  }
}

.st-name-link {
  font-weight: 600;
  color: var(--el-color-primary);
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
