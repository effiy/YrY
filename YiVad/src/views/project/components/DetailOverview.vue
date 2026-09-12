<template>
  <div>
    <div v-if="filterDate" class="do-date-banner">
      <el-icon><Calendar /></el-icon>
      <span>{{ $t("project.detail.dateBanner.showing", { date: filterDateLabel }) }}</span>
      <el-button size="small" text type="primary" @click="clearFilterDate">{{
        $t("project.detail.dateBanner.clear")
      }}</el-button>
    </div>

    <!-- README.md -->
      <div class="do-card do-card--flush">
        <div class="do-card__head">
          <el-icon class="do-card__icon"><Document /></el-icon>
          <span>README.md</span>
          <div class="do-card__head-right">
            <el-button v-if="descContent" link size="small" type="primary" :icon="Edit" @click="openDescDialog">{{
              $t("project.overview.readme.edit")
            }}</el-button>
            <el-button v-else link size="small" type="primary" @click="openDescDialog">{{
              $t("project.overview.readme.add")
            }}</el-button>
          </div>
        </div>
        <div class="do-card__body">
          <div v-if="descContent" ref="descPreviewRef" class="do-desc-preview" :class="{ 'is-clamped': !descExpanded }" v-html="descHtml" />
          <div v-if="descContent && descOverflows" class="do-desc-mask" :class="{ 'is-hidden': descExpanded }" />
          <el-button
            v-if="descContent && descOverflows"
            link
            size="small"
            type="primary"
            class="do-desc-toggle"
            @click="descExpanded = !descExpanded"
          >
            {{ descExpanded ? $t('project.overview.readme.collapse') : $t('project.overview.readme.expand') }}
            <el-icon><component :is="descExpanded ? ArrowUp : ArrowDown" /></el-icon>
          </el-button>
          <div v-if="!descContent" class="do-empty">
            <el-icon class="do-empty__icon"><Document /></el-icon>
            <p class="do-empty__text">{{ $t("project.overview.readme.noFile") }}</p>
            <p class="do-empty__hint">{{ $t("project.overview.readme.noFileHint") }}</p>
          </div>
        </div>
      </div>

      <!-- Activity + Todo two-column row -->
      <div class="do-row">
        <!-- Activity timeline (left) -->
        <div class="do-card do-row__left">
          <div class="do-card__head-row">
            <h3 class="do-card__title">{{ $t("project.overview.activity.title") }}</h3>
            <div class="do-card__head-right">
              <span v-if="lastUpdated" class="do-activity-updated">
                {{ $t("project.overview.activity.updatedAgo", { time: updatedAgo }) }}
              </span>
              <el-button
                size="small"
                text
                :icon="Refresh"
                :loading="loading"
                @click="retry"
              />
            </div>
          </div>
          <div v-if="overviewActivity.length" class="do-timeline">
            <template v-for="(group, gIdx) in activityGroups" :key="group.label">
              <div class="do-timeline-group">
                <div class="do-timeline-group-label">{{ group.label }}</div>
                <div
                  v-for="(a, i) in group.items"
                  :key="a.id"
                  class="do-timeline-item"
                  :class="{ 'do-timeline-item--last': i === group.items.length - 1 && gIdx === activityGroups.length - 1 }"
                  @click="handleActivityClick(a)"
                >
                  <div class="do-timeline-dot" :style="{ background: activityColor(a.type) }" />
                  <div v-if="i < group.items.length - 1 || gIdx < activityGroups.length - 1" class="do-timeline-line" />
                  <div class="do-timeline-content">
                    <span class="do-timeline-action">{{ a.action }}</span>
                    <span class="do-timeline-target">{{ a.target }}</span>
                    <span class="do-timeline-time">{{ a.timeAgo }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <el-empty v-else :description="$t('project.overview.activity.empty')" :image-size="48" />
        </div>

        <!-- Todo List (right) -->
        <div class="do-card do-row__right">
          <div class="do-card__head-row">
            <h3 class="do-card__title">{{ $t("project.overview.todo.title") }}</h3>
            <span v-if="todoItems.length" class="do-todo-count">{{ todoItems.length }}</span>
          </div>

          <!-- loading -->
          <div v-if="todoLoading && !todoItems.length" class="do-todo-skeleton">
            <div v-for="n in 4" :key="n" class="do-todo-skel-item">
              <span class="do-todo-skel-bar" />
              <span class="do-todo-skel-line" />
            </div>
          </div>

          <!-- empty -->
          <div v-else-if="!todoLoading && !todoItems.length" class="do-todo-empty">
            <div class="do-todo-empty__icon">
              <el-icon><Check /></el-icon>
            </div>
            <p class="do-todo-empty__text">{{ $t("project.overview.todo.empty") }}</p>
          </div>

          <!-- items -->
          <div v-else class="do-todo-list">
            <template v-for="(group, gIdx) in todoGroups" :key="gIdx">
              <div class="do-todo-group" :class="{ 'do-todo-group--last': gIdx === todoGroups.length - 1 }">
                <div class="do-todo-group-label">
                  <span class="do-todo-group-dot" :style="{ background: groupColor(group.label) }" />
                  {{ group.label }}
                  <span class="do-todo-group-count">{{ group.items.length }}</span>
                </div>
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="do-todo-item"
                  :class="{ 'is-overdue': item.isOverdue, 'is-updating': updatingKeys.has(item.id) }"
                  @click="handleTodoClick(item)"
                >
                  <div class="do-todo-item__accent" :style="{ background: activityColor(item.type) }" />
                  <div class="do-todo-item__body">
                    <div class="do-todo-item__title">{{ item.target }}</div>
                    <div class="do-todo-item__meta">
                      <span v-if="item.priorityLabel" class="do-todo-item__prio">
                        <span class="do-todo-item__prio-dot" :style="{ background: item.priorityColor }" />
                        {{ item.priorityLabel }}
                      </span>
                      <span v-if="item.assignee" class="do-todo-item__assignee">{{ item.assignee }}</span>
                      <span v-if="item.dueDate" class="do-todo-item__due" :class="{ 'is-overdue': item.isOverdue }">{{ item.dueDate }}</span>
                      <span v-if="!item.assignee && !item.dueDate && !item.priorityLabel" class="do-todo-item__due">&mdash;</span>
                    </div>
                  </div>
                  <div class="do-todo-item__actions" @click.stop>
                    <el-tooltip :content="$t('project.overview.todo.start')" :show-after="600" placement="top">
                      <button class="do-todo-act do-todo-act--start" :disabled="updatingKeys.has(item.id)" @click="transitionTodo(item, 'start')">
                        <el-icon><VideoPlay /></el-icon>
                      </button>
                    </el-tooltip>
                    <el-tooltip :content="item.type === 'bug' ? $t('project.overview.todo.resolve') : $t('project.overview.todo.complete')" :show-after="600" placement="top">
                      <button class="do-todo-act do-todo-act--done" :disabled="updatingKeys.has(item.id)" @click="transitionTodo(item, 'complete')">
                        <el-icon><Check /></el-icon>
                      </button>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Calendar, Document, Edit, ArrowUp, ArrowDown, Refresh, VideoPlay, Check } from "@element-plus/icons-vue";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useNow } from "@/hooks/useNow";
import { readProjectFile } from "@/api/modules/fileService";
import { getIssueFilePath, updateIssue } from "@/api/modules/issueService";
import { useDateFilter } from "@/hooks/useDateFilter";
import { formatRelativeTime } from "@/utils/datetime";
import {
  PREVIEW_DLG_KEY,
  useProjectDetail,
  type ActivityItem,
} from "@/views/project/types";
import { activityColor } from "@/views/project/composables/useProjectStats";
import { PRIORITY_COLORS } from "@/views/project/constants";
import { ISSUE_PRIORITY_MAP } from "@/api/modules/issueService";
import { BUG_PRIORITY_MAP, updateBug } from "@/api/modules/bug";

const { t } = useI18n();

const { renderWithHtml } = useMarkdown();

const ctx = useProjectDetail();
const previewDlg = inject(PREVIEW_DLG_KEY, null);

const {
  allIssues, allBugs, allModules,
  filterDate, filterDateStr, project, clearFilterDate,
  lastUpdated, loading, retry,
  navigateTab,
} = ctx;

// ── Todo data (derived from injected allIssues/allBugs — no separate API calls) ──
const todoRequirements = computed(() =>
  allIssues.value.filter(i => i.issue_type !== "bug" && i.status === "backlog")
);
const todoBugs = computed(() =>
  allBugs.value.filter(b => b.status === "open" || b.status === "reopened")
);
const todoLoading = computed(() => loading.value);

const { label: filterDateLabel } = useDateFilter(filterDate);
const now = useNow(30_000);

const updatedAgo = computed(() => formatRelativeTime(lastUpdated.value, now.value));

// ── README ──
const descContent = ref("");
const descExpanded = ref(false);
const descOverflows = ref(false);
const descHtml = computed(() => renderWithHtml(descContent.value || ""));
const descPreviewRef = ref<HTMLElement | null>(null);

function stripFrontmatter(md: string): string {
  const trimmed = md.trimStart();
  if (trimmed.startsWith("---")) {
    const end = trimmed.indexOf("\n---", 3);
    if (end !== -1) return trimmed.slice(end + 4).trimStart();
  }
  return md;
}

function checkDescOverflow() {
  const el = descPreviewRef.value;
  if (!el) return;
  descOverflows.value = el.scrollHeight > el.clientHeight + 2;
}

watch(descHtml, () => nextTick(checkDescOverflow));

async function loadDescFile() {
  if (!project.value) return;
  try {
    const content = await readProjectFile(project.value.key, `YiKnowledge/projects/${project.value.key}/README.md`);
    descContent.value = stripFrontmatter(content || "");
  } catch {
    descContent.value = project.value?.description || "";
  }
  descExpanded.value = false;
}

function openDescDialog() {
  previewDlg?.value?.openRaw({ title: "README.md", content: descContent.value, path: `projects/${project.value?.key}/README.md` });
}

onMounted(() => {
  loadDescFile();
});

// KeepAlive 场景：项目切换时重新加载 README.md
watch(() => project.value?.key, () => {
  loadDescFile();
});

// 轮询刷新时同步更新 README
watch(lastUpdated, () => {
  loadDescFile();
});

// ── Activity timeline ──
const overviewActivity = computed<ActivityItem[]>(() => {
  const date = filterDateStr.value;

  const reqIssues = date
    ? allIssues.value.filter(i => i.issue_type === "requirement" && (i.updated_at || "").slice(0, 10) === date)
    : allIssues.value.filter(i => i.issue_type === "requirement");
  const bugs = date
    ? allBugs.value.filter(b => new Date(b.updatedAt).toISOString().slice(0, 10) === date)
    : allBugs.value;
  const modules = date
    ? allModules.value.filter(m => (m.updated_at || "").slice(0, 10) === date)
    : allModules.value;

  const activity: ActivityItem[] = [];

  reqIssues.slice(0, 20).forEach(i => {
    activity.push({
      id: i.key,
      type: "requirement",
      action: i.status === "done" ? t("project.overview.activity.completed") : i.status === "in_progress" ? t("project.overview.activity.started") : t("project.overview.activity.created"),
      target: i.title,
      timeAgo: formatRelativeTime(i.updated_at, now.value),
      updatedAt: i.updated_at,
      filePath: getIssueFilePath(i),
    });
  });

  bugs.slice(0, 10).forEach(b => {
    activity.push({
      id: b.key,
      type: "bug",
      action: b.status === "resolved" || b.status === "closed" ? t("project.overview.activity.resolved") : b.status === "in_progress" ? t("project.overview.activity.started") : t("project.overview.activity.reported"),
      target: b.title,
      timeAgo: formatRelativeTime(b.updatedAt, now.value),
      updatedAt: new Date(b.updatedAt).toISOString(),
      filePath: b.contentPath || "",
    });
  });

  modules.slice(0, 10).forEach(m => {
    activity.push({
      id: m.key,
      type: "module",
      action: m.created_at === m.updated_at ? t("project.overview.activity.moduleCreated") : t("project.overview.activity.moduleUpdated"),
      target: m.name,
      timeAgo: formatRelativeTime(m.updated_at, now.value),
      updatedAt: m.updated_at,
      link: `/project/${m.project_key}?tab=devs`,
    });
  });

  activity.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return activity.slice(0, 20);
});

function handleActivityClick(a: ActivityItem) {
  if (a.filePath) {
    previewDlg?.value?.open(a.filePath);
    return;
  }
}

// ── Todo list ──
interface TodoItem {
  id: string;
  type: string;
  target: string;
  filePath: string;
  priorityLabel: string;
  priorityColor: string;
  priorityRank: number;
  assignee: string;
  dueDate: string;
  isOverdue: boolean;
}

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0, p0: 0,
  high: 1, p1: 1,
  medium: 2, p2: 2,
  low: 3, p3: 3,
  none: 4,
};

function formatDueDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

function bugPriorityColor(p: string): string {
  const map: Record<string, string> = { p0: "urgent", p1: "high", p2: "medium", p3: "low" };
  return PRIORITY_COLORS[map[p] as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.none;
}

function isOverdue(iso: string | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d < new Date();
}

const todoItems = computed<TodoItem[]>(() => {
  const items: TodoItem[] = [];

  todoRequirements.value.forEach(i => {
    items.push({
      id: i.key,
      type: "requirement",
      target: i.title,
      filePath: getIssueFilePath(i),
      priorityLabel: ISSUE_PRIORITY_MAP[i.priority] || i.priority,
      priorityColor: PRIORITY_COLORS[i.priority as keyof typeof PRIORITY_COLORS] || "#909399",
      priorityRank: PRIORITY_RANK[i.priority] ?? 4,
      assignee: i.assignee || "",
      dueDate: formatDueDate(i.due_date),
      isOverdue: isOverdue(i.due_date),
    });
  });

  todoBugs.value.forEach(b => {
    items.push({
      id: b.key,
      type: "bug",
      target: b.title,
      filePath: b.contentPath || "",
      priorityLabel: BUG_PRIORITY_MAP[b.priority] || b.priority,
      priorityColor: bugPriorityColor(b.priority),
      priorityRank: PRIORITY_RANK[b.priority] ?? 4,
      assignee: b.assignee || "",
      dueDate: b.dueDate ? formatDueDate(new Date(b.dueDate).toISOString()) : "",
      isOverdue: b.dueDate ? isOverdue(new Date(b.dueDate).toISOString()) : false,
    });
  });

  items.sort((a, b) => {
    if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return a.dueDate.localeCompare(b.dueDate);
  });
  return items;
});

const todoGroups = computed(() => {
  const groups: { label: string; items: TodoItem[] }[] = [];
  const typeLabels: Record<string, string> = {
    requirement: t("project.overview.todo.requirement"),
    bug: t("project.overview.todo.bug"),
  };

  for (const item of todoItems.value) {
    const label = typeLabels[item.type] || item.type;
    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
});

function handleTodoClick(a: TodoItem) {
  if (a.filePath) {
    previewDlg?.value?.open(a.filePath);
  }
}

function groupColor(label: string): string {
  const m: Record<string, string> = {
    [t("project.overview.todo.requirement")]: activityColor("requirement"),
    [t("project.overview.todo.bug")]: activityColor("bug"),
  };
  return m[label] || "#909399";
}

const updatingKeys = ref(new Set<string>());

async function transitionTodo(item: TodoItem, action: "start" | "complete") {
  if (updatingKeys.value.has(item.id)) return;
  updatingKeys.value = new Set([...updatingKeys.value, item.id]);

  try {
    if (item.type === "bug") {
      const newStatus = action === "start" ? "in_progress" : "resolved";
      await updateBug(item.id, { status: newStatus } as any);
    } else {
      const newStatus = action === "start" ? "in_progress" : "done";
      await updateIssue(item.id, { status: newStatus });
    }
    await retry();
  } catch {
    // item stays in list on failure
  } finally {
    const next = new Set(updatingKeys.value);
    next.delete(item.id);
    updatingKeys.value = next;
  }
}

const activityGroups = computed(() => {
  const todayStart = new Date(now.value);
  todayStart.setHours(0, 0, 0, 0);
  const today = todayStart.toISOString().slice(0, 10);
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const yesterday = yesterdayStart.toISOString().slice(0, 10);

  const groups: { label: string; items: ActivityItem[] }[] = [];
  for (const item of overviewActivity.value) {
    const day = (item.updatedAt || "").slice(0, 10);
    let label: string;
    if (day === today) label = t("project.overview.activity.today");
    else if (day === yesterday) label = t("project.overview.activity.yesterday");
    else label = day || t("project.overview.activity.unknownDate");

    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
});

</script>

<style scoped lang="scss">
.do-date-banner {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  margin-bottom: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 9px;
  .el-icon {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--el-color-warning);
  }
  .el-button {
    margin-left: auto;
  }
}
.do-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  &--flush {
    padding: 0;
    overflow: hidden;
  }
}
.do-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.do-card__head-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.do-card__head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.do-activity-updated {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}
.do-card__empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.do-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.do-card__icon {
  font-size: 16px;
  color: var(--el-color-primary);
}
.do-card__head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
}
.do-card__body {
  padding: 16px;
}
.do-desc-preview {
  padding: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  position: relative;

  &.is-clamped {
    max-height: 600px;
    overflow: hidden;
  }
}

.do-desc-mask {
  position: relative;
  height: 40px;
  margin-top: -40px;
  background: linear-gradient(transparent, var(--el-bg-color));
  pointer-events: none;
  border-radius: 0 0 6px 6px;

  &.is-hidden {
    display: none;
  }
}

.do-desc-toggle {
  display: block;
  margin: 6px auto 0;
  font-size: 12px;
}

.do-empty {
  text-align: center;
  padding: 24px 16px;
}
.do-empty__icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}
.do-empty__text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.do-empty__hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.do-timeline {
  display: flex;
  flex-direction: column;
}

.do-timeline-group {
  display: flex;
  flex-direction: column;
}

.do-timeline-group-label {
  padding: 4px 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.do-timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 0 0 16px 20px;
  cursor: pointer;

  &:hover {
    .do-timeline-target { color: var(--el-color-primary); }
  }

  &--last { padding-bottom: 0; }
}

.do-timeline-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
  transition: transform 0.15s;

  .do-timeline-item:hover & {
    transform: scale(1.4);
  }
}

.do-timeline-line {
  position: absolute;
  left: 4px;
  top: 18px;
  bottom: 0;
  width: 2px;
  background: var(--el-border-color-light);
}

.do-timeline-content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  transition: background 0.15s;

  .do-timeline-item:hover & {
    background: var(--el-fill-color-lighter);
  }
}

.do-timeline-action {
  font-weight: 600;
}

.do-timeline-target {
  color: var(--el-color-primary);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}

.do-timeline-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-left: auto;
}

// ── Two-column row ──
.do-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.do-row__left {
  flex: 1;
  min-width: 0;
}

.do-row__right {
  flex: 1;
  min-width: 0;
}

// ── Todo list ──
.do-todo-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.do-todo-skeleton {
  padding: 4px 0;
}

.do-todo-skel-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
}

.do-todo-skel-bar {
  width: 2px;
  height: 28px;
  border-radius: 1px;
  background: var(--el-fill-color);
  flex-shrink: 0;
}

.do-todo-skel-line {
  flex: 1;
  height: 10px;
  border-radius: 5px;
  background: var(--el-fill-color);
  animation: do-todo-pulse 1.5s ease-in-out infinite;
}

@keyframes do-todo-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.do-todo-empty {
  text-align: center;
  padding: 32px 16px 24px;
}

.do-todo-empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
  margin-bottom: 10px;
  font-size: 18px;
}

.do-todo-empty__text {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.do-todo-list {
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
}

.do-todo-group {
  padding: 0 0 10px;

  & + & {
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &--last { padding-bottom: 0; }
}

.do-todo-group-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  padding: 0 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.2px;
}

.do-todo-group-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.do-todo-group-count {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
}

.do-todo-item {
  position: relative;
  display: flex;
  align-items: stretch;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;

  & + & { margin-top: 1px; }

  &:hover {
    background: var(--el-fill-color-lighter);

    .do-todo-item__accent { width: 3px; }
    .do-todo-item__title   { color: var(--el-color-primary); }
    .do-todo-item__actions { opacity: 1; transform: translateX(0); }
  }

  &.is-overdue .do-todo-item__accent {
    background: #f56c6c !important;
  }

  &.is-updating {
    opacity: 0.4;
    pointer-events: none;
  }
}

.do-todo-item__accent {
  width: 2px;
  flex-shrink: 0;
  border-radius: 0 2px 2px 0;
  margin: 5px 0;
  opacity: 0.55;
  transition: width 0.15s ease, opacity 0.15s;

  .do-todo-item:hover &,
  .do-todo-item.is-overdue & { opacity: 1; }
}

.do-todo-item__body {
  flex: 1;
  min-width: 0;
  padding: 8px 10px 8px 10px;
}

.do-todo-item__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}

.do-todo-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
}

.do-todo-item__prio {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--el-text-color-placeholder);
  font-weight: 500;
}

.do-todo-item__prio-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.do-todo-item__assignee {
  color: var(--el-text-color-placeholder);
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before { content: "· "; }
}

.do-todo-item__due {
  color: var(--el-text-color-placeholder);

  &::before { content: "· "; }

  &.is-overdue {
    color: #f56c6c;
    font-weight: 600;
  }
}

.do-todo-item__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 6px 0 0;
  opacity: 0;
  transform: translateX(3px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;
}

.do-todo-act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 5px;
  background: none;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;

  .el-icon { font-size: 14px; }

  &:disabled { opacity: 0.35; pointer-events: none; }

  &--start:hover { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
  &--done:hover  { background: var(--el-color-success-light-9);  color: var(--el-color-success); }
}

:deep(.do-desc-preview) {
  h1,
  h2,
  h3,
  h4 {
    margin: 1em 0 0.5em;
  }
  h1 {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.3em;
  }
  h3 {
    font-size: 1.15em;
  }
  p {
    margin: 0.5em 0;
  }
  pre {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
    code {
      padding: 0;
      background: none;
    }
  }
  code {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  blockquote {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  table {
    border-collapse: collapse;
  }
  th,
  td {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }
  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
  }
  ul,
  ol {
    padding-left: 22px;
    margin: 0.5em 0;
  }
  li {
    margin-bottom: 2px;
  }
  a {
    color: var(--el-color-primary);
  }
  hr {
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
    margin: 16px 0;
  }
  img {
    max-width: 100%;
  }
  pre.mermaid {
    all: unset;
    display: block;
    overflow-x: auto;
    margin: 12px 0;
    svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  }
}

</style>
