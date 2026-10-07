<template>
  <div class="ho-root page">
    <HomeSkeleton v-if="loading" />
    <template v-else-if="error">
      <div class="ho-header">
        <div class="ho-header__left">
          <span class="ho-header__icon"><el-icon :size="18"><DataBoard /></el-icon></span>
          <div><h1 class="ho-header__title">{{ t("home.title") }}</h1><p class="ho-header__desc">{{ t("home.heroDesc") }}</p></div>
        </div>
      </div>
      <div class="ho__error">
        <el-result icon="error" :title="t('home.error.loadFailed')" :sub-title="error">
          <template #extra><el-button type="primary" @click="retryAll">{{ t("home.error.retry") }}</el-button></template>
        </el-result>
      </div>
    </template>
    <template v-else>
      <!-- Header -->
      <div class="ho-head">
        <div class="ho-head__left">
          <span class="ho-head__icon"><el-icon :size="18"><DataBoard /></el-icon></span>
          <div>
            <h1 class="ho-head__title">{{ t("home.title") }}</h1>
            <p class="ho-head__desc">{{ t("home.heroDesc") }}</p>
          </div>
        </div>
        <div class="ho-head__right">
          <span v-if="live.data.value" class="ho-head__live"><span class="ho-head__dot" />YiAi {{ live.data.value.server_uptime }}h</span>
          <span class="ho-head__stat">Chats <b>{{ stats.chatSessionCount }}</b></span>
          <span class="ho-head__stat">Docs <b>{{ stats.knowledgeFileCount }}</b></span>
          <span v-if="daily.yesterdayActivityCount.value" class="ho-head__stat">Y-day <b>{{ daily.yesterdayActivityCount.value }}</b> done</span>
          <span class="ho-head__date">{{ todayLabel }}</span>
          <el-button :icon="Refresh" link size="small" @click="retryAll" />
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="ho-metrics">
        <!-- Issues -->
        <el-tooltip content="Click to view all issues" placement="top" :show-after="500">
          <div class="ho-metric" @click="router.push('/issue')">
            <div class="ho-metric__row">
              <span class="ho-metric__label">Issues</span>
              <span v-if="deltas.totalIssues !== 0" class="ho-metric__delta" :class="deltas.totalIssues > 0 ? 'is-up' : 'is-down'">
                <el-icon :size="10"><component :is="deltas.totalIssues > 0 ? Top : Bottom" /></el-icon>{{ Math.abs(deltas.totalIssues) }}
              </span>
            </div>
            <span class="ho-metric__value">{{ animTotal }}</span>
            <div class="ho-metric__bars">
              <el-tooltip v-for="s in statusSegments" :key="s.key" :content="`${s.label}: ${s.count}`" :show-after="300">
                <span class="ho-metric__bar" :style="{ flex: s.count || 0.1, background: s.color }" @click.stop="router.push(s.link)" />
              </el-tooltip>
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx" @click.stop="router.push('/issue?status=todo,in_progress,in_review')">{{ stats.activeIssueCount }} active</span>
              <span class="ho-metric__ctx" :style="{ color: rateColor(completionRate) }">{{ completionRate }}% resolved</span>
              <span class="ho-metric__ctx" @click.stop="router.push('/issue?status=in_review')" v-if="stats.inReviewCount">{{ stats.inReviewCount }} in review</span>
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx" @click.stop="router.push('/issue?issue_type=requirement')">{{ stats.requirementCount }} req</span>
              <span class="ho-metric__ctx" @click.stop="router.push('/issue?issue_type=task')">{{ stats.totalIssues - stats.requirementCount }} tasks</span>
              <span class="ho-metric__ctx" @click.stop="router.push('/module')">{{ stats.totalModules }} mod</span>
              <template v-if="dataQualityIssues">
                <span v-if="stats.noPriorityCount" class="ho-metric__ctx is-warn" @click.stop="router.push('/issue?status=todo,in_progress,in_review&noPriority=true')">−{{ stats.noPriorityCount }} pri</span>
                <span v-if="stats.noDueDateCount" class="ho-metric__ctx is-warn" @click.stop="router.push('/issue?status=todo,in_progress,in_review&noDueDate=true')">−{{ stats.noDueDateCount }} due</span>
              </template>
            </div>
          </div>
        </el-tooltip>

        <!-- Quality -->
        <el-tooltip content="Click to view all bugs" placement="top" :show-after="500">
          <div class="ho-metric" @click="router.push('/bug?status=open')" :class="{ 'is-danger': stats.criticalBugCount > 0 }">
            <div class="ho-metric__row">
              <span class="ho-metric__label">Quality</span>
              <span v-if="deltas.openBugCount !== 0" class="ho-metric__delta" :class="deltas.openBugCount > 0 ? 'is-up' : 'is-down'">
                <el-icon :size="10"><component :is="deltas.openBugCount > 0 ? Top : Bottom" /></el-icon>{{ Math.abs(deltas.openBugCount) }}
              </span>
            </div>
            <span class="ho-metric__value" :style="{ color: stats.openBugCount > 0 ? 'var(--el-color-danger)' : 'var(--el-color-success)' }">{{ animBugs }}</span>
            <div v-if="stats.bugSeverityGroups.length" class="ho-metric__bars">
              <el-tooltip v-for="g in stats.bugSeverityGroups.slice(0, 5)" :key="g.value" :content="`${sevLabel(g.value)}: ${g.count}`" :show-after="300">
                <span class="ho-metric__bar" :style="{ flex: g.count || 0.1, background: sevColor(g.value) }" @click.stop="router.push('/bug?severity=' + g.value)" />
              </el-tooltip>
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx" :class="{ 'is-danger': stats.criticalBugCount > 0 }" @click.stop="router.push('/bug?severity=critical')">Critical {{ stats.criticalBugCount }}</span>
              <span class="ho-metric__ctx" @click.stop="router.push('/bug?severity=major')">Major {{ stats.majorBugCount }}</span>
              <span class="ho-metric__ctx">{{ bugRatio }}% of issues</span>
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span v-if="stats.todayBugResolvedCount" class="ho-metric__ctx is-green">+{{ stats.todayBugResolvedCount }} fixed</span>
              <span v-if="stats.todayBugOpenCount" class="ho-metric__ctx is-red">+{{ stats.todayBugOpenCount }} new</span>
              <span v-if="stats.todayBugResolvedCount || stats.todayBugOpenCount" class="ho-metric__ctx" :class="fixRate >= 70 ? 'is-green' : fixRate >= 40 ? '' : 'is-red'">{{ fixRate }}% fix rate</span>
              <span v-if="!stats.openBugCount && !stats.todayBugOpenCount" class="ho-metric__ctx is-green">All clear</span>
            </div>
          </div>
        </el-tooltip>

        <!-- Throughput -->
        <el-tooltip content="Weekly delivery throughput" placement="top" :show-after="500">
          <div class="ho-metric" @click="router.push('/issue?quickFilter=done&days=7')">
            <div class="ho-metric__row">
              <span class="ho-metric__label">Throughput</span>
              <span v-if="velocityDelta !== 0" class="ho-metric__delta" :class="velocityDelta > 0 ? 'is-up' : 'is-down'">
                <el-icon :size="10"><component :is="velocityDelta > 0 ? Top : Bottom" /></el-icon>{{ Math.abs(velocityDelta) }}%
              </span>
            </div>
            <span class="ho-metric__value" style="color:#10b981">{{ stats.doneWeekCount }}</span>
            <div class="ho-metric__bars">
              <span class="ho-metric__bar" :style="{ flex: weekProgress || 1, background: weekProgress >= 80 ? '#10b981' : weekProgress >= 50 ? '#e6a23c' : '#f56c6c' }" />
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx">{{ velocityPerDay }}/day</span>
              <span class="ho-metric__ctx">vs {{ stats.doneLastWeekCount }} last</span>
              <span class="ho-metric__ctx" :style="{ color: weekProgress >= 80 ? '#10b981' : weekProgress >= 50 ? '#e6a23c' : '#f56c6c' }">{{ weekProgress }}% of {{ weeklyGoal }}</span>
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx">Today +{{ stats.todayDoneCount }} done</span>
              <span class="ho-metric__ctx" :class="todayPace === 'on pace' ? 'is-green' : 'is-warn'">{{ todayPace }}</span>
              <span class="ho-metric__ctx">+{{ stats.todayCreatedCount }} created</span>
              <span class="ho-metric__ctx">Y-day {{ stats.yesterdayDoneCount }}</span>
            </div>
          </div>
        </el-tooltip>

        <!-- Attention -->
        <div class="ho-metric ho-metric--attn" :class="{ 'is-warn': healthWarnings > 0 }">
          <div class="ho-metric__row">
            <span class="ho-metric__label">Attention</span>
            <span v-if="healthWarnings > 0" class="ho-metric__delta is-up">{{ healthWarnings }} items</span>
            <span v-else class="ho-metric__delta is-down">Clear</span>
          </div>
          <div class="ho-attn">
            <div class="ho-attn__item" :class="{ 'is-warn': stats.overdueCount > 0 }" @click.stop="router.push('/issue?overdue=true')">
              <span class="ho-attn__n" :style="{ color: stats.overdueCount > 0 ? 'var(--el-color-warning)' : 'var(--el-text-color-secondary)' }">{{ stats.overdueCount || 0 }}</span>
              <span class="ho-attn__l">Overdue</span>
            </div>
            <div class="ho-attn__item" :class="{ 'is-danger': stats.blockedCount > 0 }" @click.stop="router.push('/issue?status=todo,in_progress,in_review&blocked=true')">
              <span class="ho-attn__n" :style="{ color: stats.blockedCount > 0 ? 'var(--el-color-danger)' : 'var(--el-text-color-secondary)' }">{{ stats.blockedCount || 0 }}</span>
              <span class="ho-attn__l">Blocked</span>
            </div>
            <div class="ho-attn__item" :class="{ 'is-warn': stats.unassignedCount > 0 }" @click.stop="router.push('/issue?status=todo,in_progress,in_review&assignee=none')">
              <span class="ho-attn__n" :style="{ color: stats.unassignedCount > 0 ? 'var(--el-text-color-secondary)' : 'var(--el-text-color-placeholder)' }">{{ stats.unassignedCount || 0 }}</span>
              <span class="ho-attn__l">Unassigned</span>
            </div>
            <div class="ho-attn__item" :class="{ 'is-warn': stats.staleCount > 0 }" @click.stop="router.push('/issue?stale=14')">
              <span class="ho-attn__n" :style="{ color: stats.staleCount > 0 ? 'var(--el-text-color-secondary)' : 'var(--el-text-color-placeholder)' }">{{ stats.staleCount || 0 }}</span>
              <span class="ho-attn__l">Stale</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body: Daily Focus + Activity | Sidebar -->
      <div class="ho__body">
        <div class="ho__main">
          <!-- Today's Focus -->
          <section class="ho-card">
            <div class="ho-card__head ho-card__head--focus">
              <span class="ho-card__title">{{ t("home.today.title") }}</span>
              <span class="ho-card__sub">{{ todayLabel }}</span>
              <span v-if="daily.loading.value" class="ho-card__badge"><el-icon class="is-loading"><Loading /></el-icon></span>
            </div>

            <div v-if="daily.loading.value && !focusHasItems" class="ho-card__loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>

            <div v-else-if="!focusHasItems" class="ho-card__empty">
              <span class="ho-focus__empty-icon"><el-icon :size="20"><CircleCheck /></el-icon></span>
              <span>{{ t("home.today.allClear") }}</span>
            </div>

            <div v-else class="ho-focus">
              <div v-if="daily.overdue.value.length" class="ho-focus__group">
                <div class="ho-focus__head">
                  <span class="ho-focus__dot is-overdue" />
                  <span class="ho-focus__label">{{ t("home.today.overdue") }}</span>
                  <span class="ho-focus__count">{{ daily.overdue.value.length }}</span>
                </div>
                <div v-for="item in sortByPriority(daily.overdue.value).slice(0, 5)" :key="item.key" class="ho-focus__item is-overdue" @click="previewIssue(item)">
                  <span class="ho-focus__pri" :style="{ background: priorityColor(item.priority) }">{{ priorityLabel(item.priority) }}</span>
                  <span class="ho-focus__key">{{ item.key }}</span>
                  <span v-if="item.project_key" class="ho-focus__proj">{{ item.project_key }}</span>
                  <span class="ho-focus__title">{{ truncate(item.title, 58) }}</span>
                  <span class="ho-focus__spacer" />
                  <span v-if="item.assignee" class="ho-focus__who">{{ item.assignee }}</span>
                  <span class="ho-focus__meta is-overdue">{{ daysOverdue(item.due_date) }}d</span>
                </div>
              </div>

              <div v-if="daily.todayDue.value.length" class="ho-focus__group">
                <div class="ho-focus__head">
                  <span class="ho-focus__dot is-due" />
                  <span class="ho-focus__label">{{ t("home.today.dueToday") }}</span>
                  <span class="ho-focus__count">{{ daily.todayDue.value.length }}</span>
                </div>
                <div v-for="item in sortByPriority(daily.todayDue.value).slice(0, 6)" :key="item.key" class="ho-focus__item is-due" @click="previewIssue(item)">
                  <span class="ho-focus__pri" :style="{ background: priorityColor(item.priority) }">{{ priorityLabel(item.priority) }}</span>
                  <span class="ho-focus__key">{{ item.key }}</span>
                  <span v-if="item.project_key" class="ho-focus__proj">{{ item.project_key }}</span>
                  <span class="ho-focus__title">{{ truncate(item.title, 58) }}</span>
                  <span class="ho-focus__spacer" />
                  <span v-if="item.assignee" class="ho-focus__who">{{ item.assignee }}</span>
                  <span v-if="item.story_points" class="ho-focus__meta">{{ item.story_points }}pt</span>
                </div>
              </div>

              <div v-if="daily.todayInProgress.value.length" class="ho-focus__group">
                <div class="ho-focus__head">
                  <span class="ho-focus__dot is-wip" />
                  <span class="ho-focus__label">{{ t("home.today.inProgress") }}</span>
                  <span class="ho-focus__count">{{ daily.todayInProgress.value.length }}</span>
                  <span v-if="daily.blocked.value.length" class="ho-focus__extra">{{ t("home.today.blockedHint", { n: daily.blocked.value.length }) }}</span>
                </div>
                <div v-for="item in sortByPriority(daily.todayInProgress.value).slice(0, 6)" :key="item.key" class="ho-focus__item is-wip" @click="previewIssue(item)">
                  <span class="ho-focus__pri" :style="{ background: priorityColor(item.priority) }">{{ priorityLabel(item.priority) }}</span>
                  <span class="ho-focus__key">{{ item.key }}</span>
                  <span v-if="item.project_key" class="ho-focus__proj">{{ item.project_key }}</span>
                  <span class="ho-focus__title">{{ truncate(item.title, 58) }}</span>
                  <span class="ho-focus__spacer" />
                  <span v-if="item.assignee" class="ho-focus__who">{{ item.assignee }}</span>
                  <span class="ho-focus__meta">{{ timeAgo(item.updated_at) }}</span>
                </div>
              </div>

              <div v-if="daily.pendingReview.value.length" class="ho-focus__group">
                <div class="ho-focus__head">
                  <span class="ho-focus__dot is-review" />
                  <span class="ho-focus__label">{{ t("home.tomorrow.pendingReview") }}</span>
                  <span class="ho-focus__count">{{ daily.pendingReview.value.length }}</span>
                </div>
                <div v-for="item in daily.pendingReview.value.slice(0, 5)" :key="item.key" class="ho-focus__item is-review" @click="previewIssue(item)">
                  <span class="ho-focus__pri" :style="{ background: priorityColor(item.priority) }">{{ priorityLabel(item.priority) }}</span>
                  <span class="ho-focus__key">{{ item.key }}</span>
                  <span v-if="item.project_key" class="ho-focus__proj">{{ item.project_key }}</span>
                  <span class="ho-focus__title">{{ truncate(item.title, 58) }}</span>
                  <span class="ho-focus__spacer" />
                  <span v-if="item.assignee" class="ho-focus__who">{{ item.assignee }}</span>
                  <span class="ho-focus__meta">{{ timeAgo(item.updated_at) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Activity -->
          <section class="ho-card">
            <div class="ho-card__head ho-card__head--activity">
              <span class="ho-card__title">{{ t("home.stats.recentActivity") }}</span>
              <el-button link size="small" @click="knowledge.retry()"><el-icon><Refresh /></el-icon></el-button>
            </div>
            <div v-if="knowledge.loading.value" class="ho-card__loading"><el-icon class="is-loading"><Loading /></el-icon></div>
            <div v-else class="ho-activity">
              <div v-if="!activityItems.length" class="ho-card__empty">{{ t("home.activity.empty") }}</div>
              <template v-for="group in activityGroups" :key="group.label">
                <div class="ho-activity__head">{{ group.label }}</div>
                <div v-for="item in group.items" :key="(item.type) + '-' + item.updatedAt + '-' + (item.path || item.title)" class="ho-activity__item" @click="item.type === 'file' ? openFilePreview(item.path!) : router.push('/bug')">
                  <span class="ho-activity__icon">
                    <el-icon v-if="item.type === 'file'"><Document /></el-icon>
                    <el-icon v-else><Warning /></el-icon>
                  </span>
                  <span v-if="item.type === 'bug' && item.severity" class="ho-activity__sev" :class="'is-' + item.severity">{{ item.severity }}</span>
                  <span v-else-if="item.type === 'file'" class="ho-activity__cat" :class="'is-' + (item.category || 'other')">{{ catLabel(item.category) }}</span>
                  <span class="ho-activity__verb">{{ item.type === 'file' ? (item.isNew ? 'created' : 'updated') : 'reported' }}</span>
                  <span class="ho-activity__title">{{ item.title }}</span>
                  <el-tooltip :content="new Date(item.updatedAt).toLocaleString()" placement="top" :show-after="400">
                    <span class="ho-activity__time">{{ timeAgo(item.updatedAt) }}</span>
                  </el-tooltip>
                </div>
              </template>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="ho__side">
          <div v-if="knowledge.available.value" class="ho-sb">
            <div class="ho-sb__head">Knowledge Health</div>
            <div class="ho-kh">
              <span class="ho-kh__pct" :style="{ color: knowledge.avgFreshness.value >= 60 ? '#10b981' : knowledge.avgFreshness.value >= 30 ? '#e6a23c' : '#f56c6c' }">{{ knowledge.avgFreshness.value }}%</span>
              <span class="ho-kh__label">fresh · {{ knowledge.totalFiles.value }} files</span>
            </div>
            <div v-if="knowledge.categoryInfo.value.length" class="ho-kh__cats">
              <div v-for="c in knowledge.categoryInfo.value.slice(0, 6)" :key="c.category" class="ho-kh__cat" @click="router.push('/knowledge/' + c.category.toLowerCase())">
                <span class="ho-kh__cat-name">{{ c.category }}</span>
                <span class="ho-kh__cat-bar"><span class="ho-kh__cat-fill" :style="{ width: c.freshness + '%', background: c.freshness >= 60 ? '#10b981' : c.freshness >= 30 ? '#e6a23c' : '#f56c6c' }" /></span>
                <span class="ho-kh__cat-n">{{ c.count }}</span>
              </div>
            </div>
          </div>

          <div v-if="stats.assigneeGroups.length" class="ho-sb">
            <div class="ho-sb__head">{{ t("home.stats.workload") }}</div>
            <div class="ho-wl">
              <div v-for="g in stats.assigneeGroups" :key="g.value" class="ho-wl__row">
                <span class="ho-wl__name">{{ g.value || "—" }}</span>
                <span class="ho-wl__bar"><span class="ho-wl__fill" :class="{ 'is-over': g.count > 5 }" :style="{ width: Math.min(100, (g.count / 6) * 100) + '%' }" /></span>
                <span class="ho-wl__n">{{ g.count }}</span>
              </div>
            </div>
          </div>

          <div v-if="knowledge.gaps.value.length" class="ho-sb">
            <div class="ho-sb__head">Knowledge Gaps</div>
            <div class="ho-kg">
              <div v-for="(g, i) in knowledge.gaps.value.slice(0, 4)" :key="i" class="ho-kg__item">{{ g }}</div>
            </div>
            <div class="ho-kg__more" @click="router.push('/knowledge')">View knowledge base →</div>
          </div>
        </aside>
      </div>

      <div class="ho__nav"><QuickNav :counts="quickNavCounts" /></div>
      <KnowledgePreviewDialog ref="previewDlg" />
      <div class="ho__spacer" />
    </template>
  </div>
</template>

<script setup lang="ts" name="home">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { DataBoard, Refresh, Loading, Top, Bottom, Document, Warning, ArrowDown, ArrowRight, CircleCheck } from "@element-plus/icons-vue";
import HomeSkeleton from "./components/HomeSkeleton.vue";
import QuickNav from "./components/QuickNav.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useHomeData } from "@/hooks/useHomeData";
import { useDailyInsight } from "@/hooks/useDailyInsight";
import { useKnowledgeInsight } from "@/hooks/useKnowledgeInsight";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { getIssue, type Issue } from "@/api/modules/issueService";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";

const { t } = useI18n();
const router = useRouter();
const { stats, deltas, loading, error, retry } = useHomeData();
const daily = useDailyInsight();
const knowledge = useKnowledgeInsight();
const live = useLiveMetrics();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
function openFilePreview(path: string) { previewDlg.value?.open(path); }

const PRIORITY_COLORS: Record<string, string> = { p0: "#f56c6c", p1: "#e6a23c", p2: "#409eff", p3: "#909399", p4: "#c0c4cc" };
function priorityColor(p: string): string { return PRIORITY_COLORS[p] || "#c0c4cc"; }
function priorityLabel(p: string): string { return (p || "").toUpperCase(); }

const animTotal = useAnimatedNumber(computed(() => stats.totalIssues));
const animBugs = useAnimatedNumber(computed(() => stats.openBugCount));

const STATUS_COLORS: Record<string, string> = {
  todo: "#909399", in_progress: "#5ab1ef", in_review: "#e6a23c",
  done: "#67c23a", backlog: "#9a60b4", cancelled: "#ee6666"
};
const STATUS_LINKS: Record<string, string> = {
  todo: "/issue?status=todo", in_progress: "/issue?status=in_progress",
  in_review: "/issue?status=in_review", done: "/issue?status=done", backlog: "/issue?status=backlog"
};
const statusSegments = computed(() => [
  { key: "todo", label: "Todo", count: stats.todoCount, color: STATUS_COLORS.todo, link: STATUS_LINKS.todo },
  { key: "in_progress", label: "WIP", count: stats.inProgressCount, color: STATUS_COLORS.in_progress, link: STATUS_LINKS.in_progress },
  { key: "in_review", label: "Review", count: stats.inReviewCount, color: STATUS_COLORS.in_review, link: STATUS_LINKS.in_review },
  { key: "done", label: "Done", count: stats.doneCount, color: STATUS_COLORS.done, link: STATUS_LINKS.done },
  { key: "backlog", label: "Backlog", count: stats.backlogCount, color: STATUS_COLORS.backlog, link: STATUS_LINKS.backlog },
].filter(s => s.count > 0));

const completionRate = computed(() => {
  const base = stats.totalIssues - stats.cancelledCount - stats.backlogCount;
  return base ? Math.round((stats.doneCount / base) * 100) : 0;
});
const bugRatio = computed(() => stats.totalIssues ? Math.round((stats.openBugCount / stats.totalIssues) * 100) : 0);
const velocityDelta = computed(() => {
  if (!stats.doneLastWeekCount) return stats.doneWeekCount > 0 ? 100 : 0;
  return Math.round(((stats.doneWeekCount - stats.doneLastWeekCount) / stats.doneLastWeekCount) * 100);
});
const velocityPerDay = computed(() => (stats.doneWeekCount / 5).toFixed(1));
const healthWarnings = computed(() => (stats.overdueCount || 0) + (stats.blockedCount || 0) + (stats.staleCount || 0) + (stats.unassignedCount || 0));
const dataQualityIssues = computed(() => stats.noPriorityCount + stats.noDueDateCount + stats.noTypeCount);
const fixRate = computed(() => {
  const t = stats.todayBugResolvedCount + stats.todayBugOpenCount;
  return t ? Math.round((stats.todayBugResolvedCount / t) * 100) : 0;
});
const weeklyGoal = 25;
const weekProgress = computed(() => Math.min(100, Math.round((stats.doneWeekCount / weeklyGoal) * 100)));
const todayPace = computed(() => {
  const expected = stats.todayDoneCount; // already have this
  const target = 5; // 25/wk / 5 days
  if (expected >= target) return "on pace";
  if (expected >= target * 0.5) return "behind";
  return "slow";
});

function rateColor(v: number): string { return v >= 80 ? "#67c23a" : v >= 50 ? "#e6a23c" : "#f56c6c"; }

const CAT_LABEL: Record<string, string> = { engineer: "Eng", executive: "Exec", leader: "Lead", aier: "AI", product: "Prod", sre: "SRE", curator: "Cur" };
function catLabel(cat?: string): string { return CAT_LABEL[cat || ""] || cat || ""; }

const activityItems = computed(() => knowledge.activityItems.value);
const activityGroups = computed(() => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const yesterdayMs = todayMs - 86400000;
  const groups: { label: string; items: typeof activityItems.value }[] = [
    { label: t("home.activity.today"), items: [] },
    { label: t("home.activity.yesterday"), items: [] },
    { label: t("home.activity.thisWeek"), items: [] }
  ];
  for (const item of activityItems.value) {
    const ts = new Date(item.updatedAt).getTime();
    if (ts >= todayMs) groups[0].items.push(item);
    else if (ts >= yesterdayMs) groups[1].items.push(item);
    else groups[2].items.push(item);
  }
  return groups.filter(g => g.items.length > 0);
});

const todayLabel = computed(() => {
  const d = new Date();
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] + " " + (d.getMonth()+1) + "/" + d.getDate();
});
function timeAgo(ts: string | number): string {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "now"; if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function retryAll() { retry(); daily.retry(); knowledge.retry(); }

const SEV_LABELS: Record<string, string> = { critical: "Critical", urgent: "Urgent", major: "Major", high: "High", medium: "Medium", minor: "Minor", low: "Low", trivial: "Trivial" };
function sevLabel(v: string): string { return SEV_LABELS[v] || v; }
function sevColor(v: string): string {
  const m: Record<string, string> = { critical: "#f56c6c", urgent: "#f56c6c", major: "#e6a23c", high: "#e6a23c", medium: "#409eff", minor: "#909399", low: "#909399", trivial: "#c0c4cc" };
  return m[v] || "#c0c4cc";
}

const quickNavCounts = computed(() => ({
  requirementCount: stats.requirementCount, totalIssues: stats.totalIssues,
  bugCount: stats.bugCount, totalModules: stats.totalModules,
  chatSessionCount: stats.chatSessionCount, knowledgeFileCount: stats.knowledgeFileCount
}));

// ── Today's Focus ──

const focusHasItems = computed(() =>
  daily.overdue.value.length > 0 || daily.todayDue.value.length > 0 ||
  daily.todayInProgress.value.length > 0 || daily.pendingReview.value.length > 0
);

const PRIORITY_ORDER: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3, p4: 4, urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
function sortByPriority(items: Issue[]): Issue[] {
  return [...items].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99));
}

function truncate(s: string, n: number): string { return s.length > n ? s.slice(0, n) + "…" : s; }

function daysOverdue(due: string | undefined): number {
  if (!due) return 0;
  const d = new Date(due); d.setHours(0,0,0,0);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

async function previewIssue(item: Issue) {
  let issue = item;
  if (!item.description) {
    try {
      const res = await getIssue(item.key);
      issue = (res.data as any)?.list?.[0] || item;
    } catch { /* use item as-is */ }
  }
  const meta: string[] = [];
  if (issue.status) meta.push(`| **Status** | ${issue.status} |`);
  if (issue.priority) meta.push(`| **Priority** | ${issue.priority} |`);
  if (issue.assignee) meta.push(`| **Assignee** | ${issue.assignee} |`);
  if (issue.due_date) meta.push(`| **Due** | ${issue.due_date} |`);
  if (issue.project_key) meta.push(`| **Project** | ${issue.project_key} |`);
  if (issue.story_points) meta.push(`| **Points** | ${issue.story_points} |`);
  const content = [
    `# ${issue.key}: ${issue.title}`,
    '',
    '| | |',
    '|---|----|',
    ...meta,
    '',
    '---',
    '',
    issue.description || '*No description*'
  ].join('\n');
  previewDlg.value?.openRaw({
    title: `${issue.key}: ${issue.title}`,
    content,
    path: `issue:${issue.key}`,
  });
}
</script>

<style scoped lang="scss">
.ho-root { box-sizing: border-box; min-height: 100%; padding: 20px 24px 80px; background: var(--el-bg-color-page); }
.ho__error { display: flex; align-items: center; justify-content: center; min-height: 400px; }

// ── Header ──
.ho-head { display: flex; gap: 16px; align-items: center; padding: 14px 20px; margin-bottom: 14px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 14px; }
.ho-head__left { display: flex; gap: 14px; align-items: center; flex: 1; min-width: 0; }
.ho-head__icon { display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 40px; height: 40px; color: #fff; background: linear-gradient(135deg, var(--el-color-primary), #6366f1); border-radius: 10px; }
.ho-head__title { margin: 0; font-size: 15px; font-weight: 700; color: var(--el-text-color-primary); line-height: 1.3; }
.ho-head__desc { margin: 2px 0 0; font-size: 11px; color: var(--el-text-color-secondary); }
.ho-head__right { display: flex; flex-shrink: 0; gap: 10px; align-items: center; }
.ho-head__live { display: inline-flex; gap: 4px; align-items: center; padding: 2px 8px; font-size: 10px; font-weight: 600; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border: 1px solid var(--el-color-primary-light-5); border-radius: 10px; }
.ho-head__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--el-color-primary); }
.ho-head__stat { font-size: 11px; color: var(--el-text-color-secondary); white-space: nowrap; b { font-weight: 700; color: var(--el-text-color-primary); } }
.ho-head__date { font-size: 11px; font-weight: 600; color: var(--el-text-color-placeholder); }

// ── KPI Cards ──
.ho-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }

.ho-metric {
  display: flex; flex-direction: column; gap: 2px;
  padding: 14px 16px; background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter); border-radius: 12px;
  cursor: pointer; transition: all 0.15s ease;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgb(0 0 0 / 5%); }
  &.is-warn { border-left: 3px solid var(--el-color-warning); }
  &.is-danger { border-left: 3px solid var(--el-color-danger); }
}
.ho-metric__row { display: flex; gap: 6px; align-items: baseline; &--sub { margin-top: auto; } }
.ho-metric__label { flex: 1; font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
.ho-metric__value { font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.15; color: var(--el-text-color-primary); }
.ho-metric__delta { display: inline-flex; gap: 2px; align-items: center; font-size: 10px; font-weight: 600; &.is-up { color: var(--el-color-danger); } &.is-down { color: var(--el-color-success); } }
.ho-metric__ctx { font-size: 10px; color: var(--el-text-color-placeholder); cursor: pointer; white-space: nowrap; &:hover { text-decoration: underline; } &.is-warn { color: var(--el-color-warning); font-weight: 600; } &.is-danger { color: var(--el-color-danger); font-weight: 600; } &.is-green { color: #10b981; } &.is-red { color: var(--el-color-danger); } }
.ho-metric__bars { display: flex; gap: 1px; height: 5px; margin-top: 2px; overflow: hidden; border-radius: 3px; background: var(--el-fill-color); }
.ho-metric__bar { display: block; height: 100%; min-width: 2px; cursor: pointer; transition: opacity 0.12s; &:hover { opacity: 0.75; } }

// Attention
.ho-metric--attn { cursor: default; }
.ho-attn { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; flex: 1; }
.ho-attn__item { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; cursor: pointer; border-radius: 8px; background: var(--el-fill-color-light); transition: all 0.12s; &:hover { background: var(--el-fill-color); } &.is-warn { background: var(--el-color-warning-light-9); .ho-attn__n { color: var(--el-color-warning); } } &.is-danger { background: var(--el-color-danger-light-9); .ho-attn__n { color: var(--el-color-danger); } } }
.ho-attn__n { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; color: var(--el-text-color-primary); }
.ho-attn__l { font-size: 9px; font-weight: 500; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.3px; margin-top: 1px; }
.ho-attn__clear { display: flex; align-items: center; justify-content: center; flex: 1; font-size: 12px; font-weight: 600; color: #10b981; }

// ── Body ──
.ho__body { display: grid; grid-template-columns: 1fr 268px; gap: 14px; align-items: start; }
.ho__main { min-width: 0; display: flex; flex-direction: column; gap: 14px; }

.ho-card { padding: 18px 22px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 14px; }
.ho-card__head { display: flex; gap: 8px; align-items: baseline; padding-left: 12px; margin-bottom: 10px; border-left: 3px solid var(--el-border-color); }
.ho-card__head--focus { border-left-color: #6366f1; }
.ho-card__head--activity { border-left-color: var(--el-color-primary); }
.ho-card__title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.ho-card__sub { margin-left: auto; font-size: 10px; color: var(--el-text-color-placeholder); }
.ho-card__badge { margin-left: 4px; font-size: 11px; color: var(--el-text-color-placeholder); }
.ho-card__loading { display: flex; justify-content: center; padding: 24px 0; color: var(--el-text-color-secondary); }
.ho-card__empty { display: flex; align-items: center; justify-content: center; padding: 24px 0; font-size: 12px; color: var(--el-text-color-placeholder); }

// ── Today's Focus ──
.ho-focus {
  display: flex; flex-direction: column; gap: 2px;

  .ho-focus__empty-icon { color: #10b981; margin-right: 6px; }

  .ho-focus__group { display: flex; flex-direction: column; padding: 4px 0; }

  .ho-focus__head { display: flex; gap: 6px; align-items: center; padding: 6px 10px; }
  .ho-focus__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    &.is-overdue { background: #ef4444; } &.is-due { background: #f59e0b; } &.is-wip { background: #3b82f6; } &.is-review { background: #8b5cf6; }
  }
  .ho-focus__label { font-size: 11px; font-weight: 700; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.3px; }
  .ho-focus__count { font-size: 10px; font-weight: 700; color: var(--el-text-color-placeholder); background: var(--el-fill-color); padding: 1px 6px; border-radius: 8px; min-width: 18px; text-align: center; }
  .ho-focus__extra { margin-left: 2px; font-size: 10px; font-weight: 600; color: #ea580c; }

  .ho-focus__item {
    display: flex; gap: 7px; align-items: center;
    padding: 6px 10px; cursor: pointer; border-radius: 6px;
    border-left: 2px solid transparent; margin-left: 4px;
    transition: all 0.12s ease;
    &:hover { background: var(--el-fill-color-light); border-left-color: var(--el-color-primary-light-3); }

    &.is-overdue { border-left-color: #fecaca; &:hover { border-left-color: #ef4444; background: #fef2f2; } }
    &.is-due     { border-left-color: #fde68a; &:hover { border-left-color: #f59e0b; background: #fffbeb; } }
    &.is-wip     { border-left-color: #bfdbfe; &:hover { border-left-color: #3b82f6; background: #eff6ff; } }
    &.is-review  { border-left-color: #ddd6fe; &:hover { border-left-color: #8b5cf6; background: #f5f3ff; } }
  }
  .ho-focus__pri { flex-shrink: 0; width: 22px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; border-radius: 4px; }
  .ho-focus__key { flex-shrink: 0; font-size: 10px; font-weight: 600; color: var(--el-text-color-placeholder); font-family: ui-monospace, monospace; min-width: 44px; }
  .ho-focus__proj { flex-shrink: 0; padding: 0 5px; height: 16px; display: flex; align-items: center; font-size: 9px; font-weight: 600; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-radius: 4px; max-width: 54px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ho-focus__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 12px; font-weight: 500; color: var(--el-text-color-primary); white-space: nowrap; }
  .ho-focus__spacer { flex: 1; min-width: 0; }
  .ho-focus__who { flex-shrink: 0; font-size: 10px; color: var(--el-text-color-placeholder); max-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ho-focus__meta { flex-shrink: 0; font-size: 10px; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--el-text-color-placeholder); &.is-overdue { color: #ef4444; font-weight: 700; } }
}
// Activity
.ho-activity { display: flex; flex-direction: column; }
.ho-activity__head { padding: 7px 8px 2px; font-size: 9px; font-weight: 700; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.5px; &:first-child { padding-top: 0; } }
.ho-activity__item { display: flex; gap: 7px; align-items: center; padding: 6px 8px; cursor: pointer; border-radius: 6px; transition: all 0.1s; & + & { border-top: 1px solid var(--el-border-color-lighter); } &:hover { background: var(--el-fill-color-light); } }
.ho-activity__icon { flex-shrink: 0; font-size: 12px; color: var(--el-text-color-secondary); display: flex; }
.ho-activity__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 11px; font-weight: 500; color: var(--el-text-color-primary); white-space: nowrap; }
.ho-activity__verb { flex-shrink: 0; font-size: 9px; color: var(--el-text-color-placeholder); }
.ho-activity__cat { flex-shrink: 0; font-size: 8px; font-weight: 600; padding: 1px 4px; border-radius: 3px; text-transform: uppercase; background: var(--el-fill-color); color: var(--el-text-color-secondary); }
.ho-activity__cat.is-engineer { color: #0891b2; background: #ecfeff; } .ho-activity__cat.is-executive, .ho-activity__cat.is-leader { color: #7c3aed; background: #f3f0ff; } .ho-activity__cat.is-aier { color: #059669; background: #ecfdf5; } .ho-activity__cat.is-product { color: #d97706; background: #fffbeb; } .ho-activity__cat.is-sre { color: #dc2626; background: #fef2f2; } .ho-activity__cat.is-curator { color: #4f46e5; background: #eef2ff; }
.ho-activity__sev { flex-shrink: 0; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px; text-transform: uppercase; } .ho-activity__sev.is-critical, .ho-activity__sev.is-urgent { color: #fff; background: var(--el-color-danger); } .ho-activity__sev.is-major, .ho-activity__sev.is-high { color: #fff; background: var(--el-color-warning); } .ho-activity__sev.is-medium { color: #fff; background: var(--el-color-primary); } .ho-activity__sev.is-minor, .ho-activity__sev.is-low, .ho-activity__sev.is-trivial { color: var(--el-text-color-secondary); background: var(--el-fill-color); }
.ho-activity__time { flex-shrink: 0; font-size: 10px; font-variant-numeric: tabular-nums; color: var(--el-text-color-placeholder); cursor: default; }

// ── Sidebar ──
.ho__side { display: flex; flex-direction: column; gap: 10px; position: sticky; top: 16px; }
.ho-sb { padding: 13px 15px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 12px; }
.ho-sb__head { font-size: 10px; font-weight: 700; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }

// Knowledge health
.ho-kh { display: flex; gap: 6px; align-items: baseline; margin-bottom: 8px; }
.ho-kh__pct { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; }
.ho-kh__label { font-size: 10px; color: var(--el-text-color-placeholder); }
.ho-kh__cats { display: flex; flex-direction: column; gap: 3px; }
.ho-kh__cat { display: flex; gap: 6px; align-items: center; cursor: pointer; padding: 1px 0; border-radius: 3px; transition: background 0.1s; &:hover { background: var(--el-fill-color-light); } }
.ho-kh__cat-name { width: 52px; font-size: 10px; font-weight: 500; color: var(--el-text-color-regular); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ho-kh__cat-bar { flex: 1; height: 4px; overflow: hidden; background: var(--el-fill-color); border-radius: 2px; }
.ho-kh__cat-fill { display: block; height: 100%; border-radius: 2px; transition: width 0.5s ease; }
.ho-kh__cat-n { width: 16px; font-size: 10px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--el-text-color-secondary); text-align: right; }

// Workload
.ho-wl { display: flex; flex-direction: column; gap: 4px; }
.ho-wl__row { display: flex; gap: 6px; align-items: center; }
.ho-wl__name { width: 48px; overflow: hidden; text-overflow: ellipsis; font-size: 10px; font-weight: 500; color: var(--el-text-color-regular); white-space: nowrap; }
.ho-wl__bar { flex: 1; height: 5px; overflow: hidden; background: var(--el-fill-color-light); border-radius: 3px; }
.ho-wl__fill { display: block; height: 100%; background: var(--el-color-primary); border-radius: 3px; transition: width 0.5s ease; &.is-over { background: var(--el-color-danger); } }
.ho-wl__n { width: 16px; font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--el-text-color-secondary); text-align: right; }

// Knowledge gaps
.ho-kg { display: flex; flex-direction: column; gap: 3px; }
.ho-kg__item { font-size: 10px; color: var(--el-text-color-secondary); padding: 3px 4px; line-height: 1.35; border-radius: 3px; background: var(--el-fill-color-light); }
.ho-kg__more { margin-top: 6px; font-size: 10px; font-weight: 500; color: var(--el-color-primary); cursor: pointer; text-align: right; &:hover { text-decoration: underline; } }

.ho__nav { margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--el-border-color-lighter); }
.ho__spacer { height: 60px; }

@media (max-width: 1200px) {
  .ho-metrics { grid-template-columns: repeat(2, 1fr); }
  .ho__body { grid-template-columns: 1fr; }
  .ho__side { position: static; display: grid; grid-template-columns: repeat(2, 1fr); }
}
</style>