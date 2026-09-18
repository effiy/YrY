<template>
  <div class="ho-root">
    <HomeSkeleton v-if="loading" />
    <template v-else-if="error">
      <PageHeaderCard :icon="DataBoard" :icon-bg="HEADER_ICON_BG" :title="t('home.title')" :description="t('home.heroDesc')" />
      <div class="ho__error">
        <el-result icon="error" :title="t('home.error.loadFailed')" :sub-title="error">
          <template #extra><el-button type="primary" @click="retryAll">{{ t("home.error.retry") }}</el-button></template>
        </el-result>
      </div>
    </template>
    <template v-else>
      <PageHeaderCard
        :icon="DataBoard" :icon-bg="HEADER_ICON_BG" :title="t('home.title')" :description="t('home.heroDesc')" :pills="headerPills"
      >
        <template #right>
          <div class="ho__refresh-bar">
            <span class="ho__refresh-dot" :class="{ 'is-pulse': refreshing }" />
            <span class="ho__refresh-time">{{ lastUpdatedText }}</span>
            <el-button :icon="Refresh" link size="small" @click="retryAll">{{ t("home.stats.refresh") }}</el-button>
          </div>
        </template>
      </PageHeaderCard>

      <div v-if="selectedProjects.length" class="ho__project-chips">
        <el-icon :size="12"><Folder /></el-icon>
        <span v-for="key in selectedProjects" :key="key" class="ho__project-chip" @click="router.push('/project/' + key)">{{ key }}</span>
      </div>

      <div class="ho__body">
        <div class="ho__main">
          <!-- Section 1: Focus + Stats -->
          <section class="ho-card">
            <div class="ho-card__top">
              <div class="ho-card__head ho-card__head--focus">
                <span class="ho-card__title">{{ t("home.today.title") }}</span>
              </div>
              <div class="ho-card__tabs">
                <button v-for="tab in focusTabs" :key="tab.key" class="ho-tab" :class="{ 'is-active': focusFilter === tab.key }" @click="focusFilter = tab.key">
                  {{ tab.label }}<span v-if="tab.count" class="ho-tab__count">{{ tab.count }}</span>
                </button>
              </div>
            </div>

            <!-- Mini stats strip -->
            <div class="ho-stats-strip">
              <div class="ho-stats-item ho-stats-item--active" @click="router.push('/issue')">
                <span class="ho-stats__num">{{ activeCount }}</span><span class="ho-stats__label">{{ t("home.stats.activeIssues") }}</span>
              </div>
              <div class="ho-stats-item" @click="router.push('/issue')">
                <span class="ho-stats__num">{{ todoCount }}</span><span class="ho-stats__label">{{ t("home.stats.todo") }}</span>
              </div>
              <div class="ho-stats-item ho-stats-item--warn" @click="router.push('/issue')">
                <span class="ho-stats__num ho-stats__num--warn">{{ backlogCount }}</span><span class="ho-stats__label">{{ t("home.stats.backlog") }}</span>
                <span class="ho-stats__pct">{{ pct(backlogCount) }}%</span>
              </div>
              <div class="ho-stats-item ho-stats-item--ok" @click="router.push('/issue')">
                <span class="ho-stats__num ho-stats__num--ok">{{ doneIssueCount }}</span><span class="ho-stats__label">{{ t("home.stats.done") }}</span>
              </div>
              <div class="ho-stats-bar">
                <el-progress :percentage="completionRate" :stroke-width="8" :show-text="false" :color="progressColor" />
                <span class="ho-stats-bar__text">{{ t("home.stats.completionRate", { n: completionRate }) }}</span>
              </div>
            </div>

            <div v-if="daily.loading.value" class="ho-card__loading"><el-icon class="is-loading"><Loading /></el-icon></div>
            <div v-else-if="!filteredFocus.length" class="ho-card__empty">{{ focusEmptyText }}</div>
            <div v-else class="ho-focus-list">
              <div
                v-for="item in filteredFocus" :key="item.key"
                class="ho-focus-item" :class="{ 'is-overdue': isOverdue(item) }"
                @click="router.push('/issue/' + item.key)"
              >
                <span class="ho-focus__pri" :class="'ho-focus__pri--' + (item.priority || 'none')" />
                <code class="ho-focus__key">{{ item.key }}</code>
                <span class="ho-focus__title">{{ item.title }}</span>
                <el-tag :type="item.status === 'in_progress' ? 'primary' : item.status === 'in_review' ? 'warning' : 'info'" size="small" effect="plain">
                  {{ statusTag(item.status) }}
                </el-tag>
                <span v-if="item.assignee" class="ho-focus__who">{{ item.assignee }}</span>
                <span v-if="item.due_date" class="ho-focus__due" :class="{ 'is-overdue': isOverdue(item), 'is-today': item.due_date === todayLocal }">{{ formatDue(item.due_date) }}</span>
              </div>
            </div>
          </section>

          <!-- Section 2: Knowledge Pulse -->
          <KnowledgePulse
            :bugs="knowledge.recentBugs.value" :bug-severity="knowledge.bugSeverity.value"
            :files="knowledge.recentFiles.value" :category-counts="knowledge.categoryCounts.value"
            :total-files="knowledge.totalFiles.value" :gaps="knowledge.gaps.value"
            :health-summary="knowledge.healthSummary.value"
            :loading="knowledge.loading.value" :available="knowledge.available.value"
          />

          <!-- Section 3: Recent Activity -->
          <section class="ho-card">
            <div class="ho-card__head ho-card__head--activity">
              <span class="ho-card__title">{{ recentActivityTitle }}</span>
              <el-button link size="small" @click="daily.retry()"><el-icon><Refresh /></el-icon></el-button>
            </div>
            <div v-if="daily.loading.value" class="ho-card__loading"><el-icon class="is-loading"><Loading /></el-icon></div>
            <div v-else class="ho-activity-list">
              <div v-if="!recentItems.length" class="ho-card__empty">{{ t("home.activity.empty") }}</div>
              <div v-for="item in recentItems" :key="item.key" class="ho-activity-item" @click="router.push('/' + item.type + '/' + item.key)">
                <el-icon class="ho-activity__type" :style="{ color: statusColor(item.status) }"><component :is="activityIcon(item)" /></el-icon>
                <span class="ho-activity__title">{{ item.title }}</span>
                <span class="ho-activity__time">{{ item.time }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="ho__sidebar">
          <div class="ho-sb-card">
            <div class="ho-sb-card__head">{{ todayLabel }}</div>
            <div class="ho-sb-grid">
              <div class="ho-sb-stat" @click="router.push('/issue')">
                <span class="ho-sb-stat__num" style="color:var(--el-color-primary)">{{ activeCount }}</span>
                <span class="ho-sb-stat__text">{{ t("home.stats.activeIssues") }}</span>
              </div>
              <div class="ho-sb-stat" @click="router.push('/bug')">
                <span class="ho-sb-stat__num" style="color:var(--el-color-danger)">{{ stats.openBugCount }}</span>
                <span class="ho-sb-stat__text">{{ t("home.stats.openBugs") }}</span>
              </div>
              <div class="ho-sb-stat" @click="router.push('/knowledge/curator')">
                <span class="ho-sb-stat__num" style="color:#7c3aed">{{ knowledge.totalFiles.value }}</span>
                <span class="ho-sb-stat__text">{{ t("home.stats.knowledgeFiles") }}</span>
              </div>
              <div class="ho-sb-stat" @click="router.push('/ai-chat')">
                <span class="ho-sb-stat__num" style="color:#10b981">{{ stats.chatSessionCount }}</span>
                <span class="ho-sb-stat__text">{{ t("home.stats.chatSessions") }}</span>
              </div>
            </div>
            <div v-if="overdueWarnCount || blockedCount" class="ho-sb-alerts">
              <span v-if="overdueWarnCount" class="ho-sb-alert ho-sb-alert--warn" @click="focusFilter='overdue'">{{ t("home.stats.overdueCount", { n: overdueWarnCount }) }}</span>
              <span v-if="blockedCount" class="ho-sb-alert ho-sb-alert--danger" @click="router.push('/issue')">{{ t("home.stats.blockedCount", { n: blockedCount }) }}</span>
            </div>
          </div>

          <div class="ho-sb-card">
            <div class="ho-sb-card__head">{{ t("home.suggested.title") }}</div>
            <div class="ho-suggest">
              <div v-if="backlogCount > 20" class="ho-suggest__item ho-suggest__item--warn" @click="router.push('/issue')">
                <el-icon><WarningFilled /></el-icon><span>{{ t("home.suggested.backlogTriage", { n: backlogCount }) }}</span>
              </div>
              <div v-if="blockedCount" class="ho-suggest__item ho-suggest__item--danger" @click="router.push('/issue')">
                <el-icon><Remove /></el-icon><span>{{ t("home.suggested.blockedItems", { n: blockedCount }) }}</span>
              </div>
              <div v-if="daily.pendingReview.value.length" class="ho-suggest__item ho-suggest__item--info" @click="router.push('/issue')">
                <el-icon><View /></el-icon><span>{{ t("home.suggested.awaitingReview", { n: daily.pendingReview.value.length }) }}</span>
              </div>
              <div v-if="knowledge.gaps.value.length" class="ho-suggest__item" @click="router.push('/knowledge/curator')">
                <el-icon><Collection /></el-icon><span>{{ t("home.suggested.reviewGaps") }}</span>
              </div>
              <div class="ho-suggest__item" @click="router.push('/issue')">
                <el-icon><CirclePlus /></el-icon><span>{{ t("home.suggested.createFromTemplate") }}</span>
              </div>
            </div>
          </div>

          <div class="ho__qa-list">
            <div class="ho__qa-card" @click="router.push('/issue')">
              <div class="ho__qa-icon ho__qa-icon--issue"><el-icon :size="15"><Plus /></el-icon></div>
              <span class="ho__qa-label">{{ t("home.quickCreate.issue") }}</span>
            </div>
            <div class="ho__qa-card" @click="router.push('/bug')">
              <div class="ho__qa-icon ho__qa-icon--bug"><el-icon :size="15"><Plus /></el-icon></div>
              <span class="ho__qa-label">{{ t("home.quickCreate.bug") }}</span>
            </div>
          </div>

          <div v-if="stats.assigneeGroups.length" class="ho-sb-card">
            <div class="ho-sb-card__head">{{ t("home.stats.workload") }}</div>
            <div class="ho-wl-list">
              <div v-for="g in stats.assigneeGroups" :key="g.value" class="ho-wl-row">
                <span class="ho-wl-name">{{ g.value || "—" }}</span>
                <span class="ho-wl-bar"><span class="ho-wl-fill" :class="{ 'is-over': wlOverloaded(g.count) }" :style="{ width: wlWidth(g.count) }" /></span>
                <span class="ho-wl-count">{{ g.count }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div class="ho__bottom-nav"><QuickNav :counts="stats" /></div>
    </template>
  </div>
</template>

<script setup lang="ts" name="home">
import { computed, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { DataBoard, Refresh, Plus, Loading, WarningFilled, CirclePlus, View, Collection, Remove, CircleCheck, Folder, Clock } from "@element-plus/icons-vue";
import { PageHeaderCard, type HeaderPill } from "@/components";
import HomeSkeleton from "./components/HomeSkeleton.vue";
import QuickNav from "./components/QuickNav.vue";
import KnowledgePulse from "./components/KnowledgePulse.vue";
import { useHomeData } from "@/hooks/useHomeData";
import { useDailyInsight } from "@/hooks/useDailyInsight";
import { useKnowledgeInsight } from "@/hooks/useKnowledgeInsight";
import { useNow } from "@/hooks/useNow";
import { type Issue, type IssueStatus } from "@/api/modules/issueService";

const { t } = useI18n();
const router = useRouter();
const HEADER_ICON_BG = "linear-gradient(135deg,var(--el-color-primary),#6366f1)";

const { stats, loading, error, lastUpdated, retry, selectedProjects } = useHomeData();
const daily = useDailyInsight();
const knowledge = useKnowledgeInsight();
const now = useNow(30_000);
const refreshing = ref(false);

watch(() => [stats.activeIssueCount, daily.todayInProgress.value.length], () => {
  refreshing.value = true; setTimeout(() => { refreshing.value = false; }, 500);
});

const doneIssueCount = computed(() => stats.issueStatusGroups.find(g => g.value === "done")?.count ?? 0);
const cancelledCount = computed(() => stats.issueStatusGroups.find(g => g.value === "cancelled")?.count ?? 0);
const todoCount = computed(() => stats.issueStatusGroups.find(g => g.value === "todo")?.count ?? 0);
const backlogCount = computed(() => stats.issueStatusGroups.find(g => g.value === "backlog")?.count ?? 0);
const activeCount = computed(() => stats.activeIssueCount);
const overdueWarnCount = computed(() => daily.overdue.value.length);
const blockedCount = computed(() => daily.blocked.value.length);
const completionTotal = computed(() => stats.totalIssues - cancelledCount.value);
const completionRate = computed(() => completionTotal.value ? Math.round((doneIssueCount.value / completionTotal.value) * 100) : 0);
const progressColor = computed(() => completionRate.value >= 80 ? "#67c23a" : completionRate.value >= 50 ? "#e6a23c" : "#f56c6c");
const remainingTotal = computed(() => activeCount.value + todoCount.value + backlogCount.value);
const pct = (n: number) => remainingTotal.value ? Math.round((n / remainingTotal.value) * 100) : 0;

const headerPills = computed<HeaderPill[]>(() => [
  { value: activeCount.value, label: t("home.stats.activeIssues"), accentColor: "var(--el-color-primary-light-9)", accentValueColor: "var(--el-color-primary)" },
  { value: stats.openBugCount, label: t("home.stats.openBugs"), accent: true },
  { value: knowledge.totalFiles.value, label: t("home.stats.knowledgeFiles"), accentColor: "#f0f5ff", accentValueColor: "#7c3aed" }
]);

// Focus
const focusFilter = ref<"all"|"in_progress"|"todo"|"overdue">("all");
const focusTabs = computed(() => [
  { key: "all" as const, label: t("home.focusTabs.all"), count: allFocusItems.value.length },
  { key: "in_progress" as const, label: t("home.focusTabs.wip"), count: daily.todayInProgress.value.length },
  { key: "todo" as const, label: t("home.focusTabs.todo"), count: todoCount.value },
  { key: "overdue" as const, label: t("home.focusTabs.overdue"), count: daily.overdue.value.length }
]);
const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const allFocusItems = computed(() => {
  const seen = new Set<string>(); const merged: Issue[] = [];
  for (const list of [daily.overdue.value, daily.todayDue.value, daily.todayInProgress.value])
    for (const item of list) { if (!seen.has(item.key)) { seen.add(item.key); merged.push(item); } }
  merged.sort((a, b) => {
    const aOver = isOverdue(a) ? 0 : 1;
    const bOver = isOverdue(b) ? 0 : 1;
    if (aOver !== bOver) return aOver - bOver;
    return (priorityOrder[a.priority || "low"] ?? 3) - (priorityOrder[b.priority || "low"] ?? 3);
  });
  return merged;
});
const filteredFocus = computed(() => {
  switch (focusFilter.value) {
    case "in_progress": return daily.todayInProgress.value;
    case "todo": return allFocusItems.value.filter(i => i.status === "todo");
    case "overdue": return daily.overdue.value;
    default: return allFocusItems.value;
  }
});
const focusEmptyText = computed(() => {
  return t("home.focusTabs.empty." + focusFilter.value);
});

const recentActivityTitle = computed(() => {
  if (daily.yesterdayDone.value.length || daily.yesterdayResolvedBugs.value.length) return t("home.yesterday.title");
  return t("home.stats.recentActivity");
});

// Activity
const recentItems = computed(() => {
  const out: Array<{ key:string; title:string; type:string; status:string; time:string }> = [];
  for (const i of daily.yesterdayDone.value.slice(0, 4)) out.push({ key:i.key, title:i.title, type:"issue", status:"done", time:timeAgo(i.updated_at) });
  for (const b of daily.yesterdayResolvedBugs.value.slice(0, 3)) out.push({ key:b.key, title:b.title, type:"bug", status:"resolved", time:timeAgo(b.updatedAt) });
  if (!out.length) for (const i of daily.todayInProgress.value.slice(0, 5)) out.push({ key:i.key, title:i.title, type:"issue", status:i.status, time:timeAgo(i.updated_at) });
  return out.slice(0, 7);
});

const todayLocal = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
function isOverdue(item: Issue): boolean { return !!(item.due_date && item.due_date < todayLocal && item.status !== 'done' && item.status !== 'cancelled'); }
function statusTag(s: IssueStatus): string { const m: Record<string,string> = { in_progress:"WIP", in_review:"Review", todo:"Todo", backlog:"Backlog", done:"Done", cancelled:"X" }; return m[s]||s; }
function statusColor(s: string): string { const m: Record<string,string> = { backlog:"#9a60b4", todo:"#909399", in_progress:"#5ab1ef", in_review:"#e6a23c", done:"#91cc75", cancelled:"#ee6666", resolved:"#91cc75" }; return m[s]||"#909399"; }
function activityIcon(item: { type: string; status: string }) {
  if (item.type === "bug") return WarningFilled;
  if (item.status === "done" || item.status === "resolved") return CircleCheck;
  if (item.status === "in_review") return View;
  return Clock;
}
const todayLabel = computed(() => { const d=new Date(); const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; return `${days[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}`; });
const lastUpdatedText = computed(() => { if(!lastUpdated.value)return""; const diff=Math.floor((now.value-lastUpdated.value)/1000); if(diff<60)return t("home.stats.justNow"); if(diff<3600)return`${Math.floor(diff/60)}m ${t("home.stats.ago")}`; return new Date(lastUpdated.value).toLocaleTimeString(); });
function timeAgo(ts: string | number): string { const diff=Date.now()-new Date(ts).getTime(); const m=Math.floor(diff/60000); if(m<1)return"now"; if(m<60)return`${m}m`; const h=Math.floor(m/60); if(h<24)return`${h}h`; return`${Math.floor(h/24)}d`; }
const WL_BASELINE = 5;
function wlWidth(n: number): string { return Math.min(100, (n / WL_BASELINE) * 100) + "%"; }
function wlOverloaded(n: number): boolean { return n > WL_BASELINE; }
function formatDue(dateStr: string): string {
  if (dateStr === todayLocal) return t("home.due.today");
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
  if (dateStr === tomorrow) return t("home.due.tomorrow");
  const [y, m, day] = dateStr.split("-");
  return `${Number(m)}/${Number(day)}`;
}
function retryAll() { retry(); daily.retry(); knowledge.retry(); }
</script>

<style scoped lang="scss">
.ho-root { box-sizing: border-box; min-height: 100%; padding: var(--page-gutter); background: var(--el-bg-color-page); }
.ho__error { display: flex; align-items: center; justify-content: center; min-height: 400px; }
.ho__project-chips { display: flex; gap: 6px; align-items: center; margin-top: 8px; padding: 4px 0; color: var(--el-text-color-secondary); }
.ho__project-chip { display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 500; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-radius: 4px; cursor: pointer; transition: background 0.12s; &:hover { background: var(--el-color-primary-light-8); } }
.ho__body { display: grid; grid-template-columns: 1fr 280px; gap: 14px; align-items: start; margin-top: var(--space-md); }
.ho__main { min-width: 0; display: flex; flex-direction: column; gap: 14px; }

// Card
.ho-card { padding: 20px 24px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 16px; transition: border-color 0.2s ease; &:hover { border-color: var(--el-border-color-light); } }
.ho-card__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.ho-card__head { display: flex; gap: 10px; align-items: baseline; padding-left: 14px; margin-bottom: 12px; border-left: 3px solid var(--el-border-color); }
.ho-card__head--focus { border-left-color: var(--el-color-warning); }
.ho-card__head--activity { border-left-color: var(--el-color-primary); }
.ho-card__title { font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); }
.ho-card__loading { display: flex; justify-content: center; padding: 28px 0; color: var(--el-text-color-secondary); }
.ho-card__empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 28px 0; font-size: 13px; color: var(--el-text-color-placeholder); }

// Tabs
.ho-card__tabs { display: flex; gap: 2px; background: var(--el-fill-color); border-radius: 8px; padding: 3px; }
.ho-tab { display: inline-flex; gap: 5px; align-items: center; padding: 4px 12px; font-size: 11px; font-weight: 500; color: var(--el-text-color-secondary); background: transparent; border: none; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; &.is-active { background: var(--el-bg-color); color: var(--el-text-color-primary); font-weight: 600; box-shadow: 0 1px 3px rgb(0 0 0 / 10%); } &:hover:not(.is-active) { color: var(--el-text-color-primary); } }
.ho-tab__count { font-size: 10px; font-weight: 700; color: var(--el-text-color-placeholder); min-width: 18px; height: 18px; line-height: 18px; text-align: center; background: var(--el-fill-color-light); border-radius: 9px; .is-active & { background: var(--el-color-primary-light-9); color: var(--el-color-primary); } }

// Stats strip
.ho-stats-strip { display: flex; gap: 12px; align-items: center; padding: 12px 16px; margin-bottom: 12px; background: var(--el-fill-color-lighter); border-radius: 10px; }
.ho-stats-item { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: background 0.12s; &:hover { background: var(--el-bg-color); } }
.ho-stats__num { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; color: var(--el-text-color-primary); &--warn { color: var(--el-color-warning); } &--ok { color: var(--el-color-success); } }
.ho-stats__label { font-size: 9px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
.ho-stats__pct { font-size: 10px; font-weight: 600; color: var(--el-color-warning); margin-top: -1px; }
.ho-stats-bar { flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 4px; }
.ho-stats-bar__text { font-size: 10px; color: var(--el-text-color-placeholder); text-align: center; }

// Focus list
.ho-focus-list { display: flex; flex-direction: column; }
.ho-focus-item { display: flex; gap: 10px; align-items: center; padding: 9px 10px; cursor: pointer; border-radius: 8px; transition: background 0.12s ease; & + & { border-top: 1px solid var(--el-border-color-lighter); } &:hover { background: var(--el-fill-color-light); } &.is-overdue { background: var(--el-color-danger-light-9); border-radius: 8px; & + & { border-top-color: transparent; } } }
.ho-focus__pri { flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; &--urgent { background: var(--el-color-danger); box-shadow: 0 0 0 2px var(--el-color-danger-light-5); } &--high { background: var(--el-color-warning); box-shadow: 0 0 0 2px var(--el-color-warning-light-5); } &--medium { background: var(--el-color-primary); } &--low, &--none { background: var(--el-border-color); } }
.ho-focus__key { flex-shrink: 0; font-size: 10px; font-family: "SF Mono", monospace; color: var(--el-text-color-placeholder); background: var(--el-fill-color-lighter); padding: 2px 6px; border-radius: 4px; }
.ho-focus__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 13px; font-weight: 500; color: var(--el-text-color-primary); white-space: nowrap; }
.ho-focus__who { flex-shrink: 0; font-size: 11px; color: var(--el-text-color-secondary); max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ho-focus__due { flex-shrink: 0; font-size: 10px; font-weight: 600; color: var(--el-text-color-placeholder); font-variant-numeric: tabular-nums; min-width: 42px; text-align: right; &.is-overdue { color: var(--el-color-danger); } &.is-today { color: var(--el-color-warning); } }

// Activity
.ho-activity-list { display: flex; flex-direction: column; }
.ho-activity-item { display: flex; gap: 10px; align-items: center; padding: 8px 10px; cursor: pointer; border-radius: 8px; transition: background 0.12s ease; & + & { border-top: 1px solid var(--el-border-color-lighter); } &:hover { background: var(--el-fill-color-light); } }
.ho-activity__type { flex-shrink: 0; font-size: 14px; }
.ho-activity__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-size: 12px; font-weight: 500; color: var(--el-text-color-primary); white-space: nowrap; }
.ho-activity__time { flex-shrink: 0; font-size: 11px; font-variant-numeric: tabular-nums; color: var(--el-text-color-placeholder); }

// Sidebar
.ho__sidebar { display: flex; flex-direction: column; gap: 10px; position: sticky; top: 16px; }
.ho-sb-card { padding: 16px 18px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 14px; }
.ho-sb-card__head { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.ho-sb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ho-sb-stat { display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; padding: 6px 4px; border-radius: 8px; transition: all 0.12s ease; &:hover { background: var(--el-fill-color-light); } }
.ho-sb-stat__num { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; }
.ho-sb-stat__text { font-size: 10px; font-weight: 500; color: var(--el-text-color-secondary); }

.ho-sb-alerts { display: flex; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--el-border-color-lighter); }
.ho-sb-alert { display: inline-flex; gap: 3px; align-items: center; padding: 3px 8px; font-size: 10px; font-weight: 600; border-radius: 4px; cursor: pointer; white-space: nowrap; &--warn { color: var(--el-color-warning); background: var(--el-color-warning-light-9); &:hover { background: var(--el-color-warning-light-8); } } &--danger { color: var(--el-color-danger); background: var(--el-color-danger-light-9); &:hover { background: var(--el-color-danger-light-8); } } }

.ho-suggest { display: flex; flex-direction: column; gap: 2px; }
.ho-suggest__item { display: flex; gap: 8px; align-items: center; padding: 8px 10px; cursor: pointer; border-radius: 8px; font-size: 12px; color: var(--el-text-color-primary); transition: all 0.12s ease; .el-icon { font-size: 14px; flex-shrink: 0; color: var(--el-text-color-secondary); } &:hover { background: var(--el-fill-color-light); } &--warn { .el-icon { color: var(--el-color-warning); } span { font-weight: 600; color: var(--el-color-warning); } } &--info { .el-icon { color: var(--el-color-primary); } } &--danger { .el-icon { color: var(--el-color-danger); } span { font-weight: 600; color: var(--el-color-danger); } } }

.ho__qa-list { display: flex; flex-direction: column; gap: 6px; }
.ho__qa-card { display: flex; gap: 10px; align-items: center; padding: 10px 14px; cursor: pointer; background: var(--el-bg-color); border: 1px dashed var(--el-border-color); border-radius: 10px; transition: all 0.2s ease; &:hover { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); border-style: solid; } }
.ho__qa-icon { display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 30px; height: 30px; color: #fff; border-radius: 8px; &--issue { background: var(--el-color-primary); } &--bug { background: var(--el-color-danger); } }
.ho__qa-label { font-size: 12px; font-weight: 500; color: var(--el-text-color-primary); }

.ho-wl-list { display: flex; flex-direction: column; gap: 6px; }
.ho-wl-row { display: flex; gap: 8px; align-items: center; }
.ho-wl-name { width: 44px; overflow: hidden; text-overflow: ellipsis; font-size: 11px; font-weight: 500; color: var(--el-text-color-regular); white-space: nowrap; }
.ho-wl-bar { flex: 1; height: 6px; overflow: hidden; background: var(--el-fill-color-light); border-radius: 3px; }
.ho-wl-fill { display: block; height: 100%; background: linear-gradient(90deg, var(--el-color-primary-light-5), var(--el-color-primary)); border-radius: 3px; transition: width 0.5s ease; &.is-over { background: linear-gradient(90deg, var(--el-color-danger-light-5), var(--el-color-danger)); } }
.ho-wl-count { width: 20px; font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--el-text-color-secondary); text-align: right; }

.ho__refresh-bar { display: flex; flex-shrink: 0; gap: 8px; align-items: center; }
.ho__refresh-dot { width: 7px; height: 7px; background: var(--el-color-success); border-radius: 50%; transition: all 0.3s ease; &.is-pulse { background: var(--el-color-primary); animation: ho-pulse 0.6s ease-out; } }
@keyframes ho-pulse { 0% { box-shadow: 0 0 0 0 var(--el-color-primary-light-5); } 100% { box-shadow: 0 0 0 8px transparent; } }
.ho__refresh-time { font-size: 12px; color: var(--el-text-color-placeholder); white-space: nowrap; font-variant-numeric: tabular-nums; }
.ho__bottom-nav { margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--el-border-color-lighter); }
</style>