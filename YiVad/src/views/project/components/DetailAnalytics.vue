<template>
  <div class="da-root">
    <!-- ═══ Section 1: KPI 指标卡 ═══ -->
    <section class="da-section">
      <h3 class="da-section__title">{{ $t("project.analytics.kpiTitle") }}</h3>
      <div class="da-kpis">
        <div class="da-kpi">
          <span class="da-kpi__value">{{ totalIssues }}</span>
          <span class="da-kpi__label">{{ $t("project.analytics.kpiTotalIssues") }}</span>
          <span class="da-kpi__sub">{{ donePct }}% {{ $t("project.overview.requirements.stats.completed") }}</span>
          <div class="da-kpi__bar"><div class="da-kpi__bar-fill" :style="{ width: donePct + '%' }" /></div>
        </div>
        <div class="da-kpi">
          <span class="da-kpi__value da-kpi__value--info">{{ openIssues }}</span>
          <span class="da-kpi__label">{{ $t("project.analytics.kpiOpenIssues") }}</span>
          <span class="da-kpi__sub">{{ $t("project.stats.of") }} {{ openPct }}%</span>
          <div class="da-kpi__bar"><div class="da-kpi__bar-fill da-kpi__bar-fill--info" :style="{ width: openPct + '%' }" /></div>
        </div>
        <div class="da-kpi">
          <span class="da-kpi__value da-kpi__value--warn">{{ overdueIssues }}</span>
          <span class="da-kpi__label">{{ $t("project.analytics.kpiOverdue") }}</span>
          <span class="da-kpi__sub">{{ overduePct }}% {{ $t("project.risks.overdue") }}</span>
          <div class="da-kpi__bar"><div class="da-kpi__bar-fill da-kpi__bar-fill--warn" :style="{ width: overduePct + '%' }" /></div>
        </div>
        <div class="da-kpi">
          <span class="da-kpi__value da-kpi__value--danger">{{ unassignedIssues }}</span>
          <span class="da-kpi__label">{{ $t("project.analytics.kpiUnassigned") }}</span>
          <span class="da-kpi__sub">{{ $t("project.risks.unassigned") }}</span>
        </div>
        <div class="da-kpi">
          <span class="da-kpi__value">{{ totalBugs }}</span>
          <span class="da-kpi__label">{{ $t("project.analytics.kpiTotalBugs") }}</span>
          <span class="da-kpi__sub">{{ openBugCount }} {{ $t("project.overview.quality.openBugs") }}</span>
        </div>
        <div class="da-kpi">
          <span class="da-kpi__value">{{ totalModules }}</span>
          <span class="da-kpi__label">{{ $t("project.analytics.kpiModules") }}</span>
          <span class="da-kpi__sub">{{ modulesWithBugs }} {{ $t("project.overview.quality.withBugs") }}</span>
        </div>
      </div>
    </section>

    <!-- ═══ Section 2: Issue 分析 ═══ -->
    <section class="da-section">
      <h3 class="da-section__title">{{ $t("project.analytics.sectionIssues") }}</h3>
      <div class="da-grid da-grid--2col">
        <div class="da-card">
          <div class="da-card__head">
            <span>{{ $t("project.analytics.statusDistribution") }}</span>
            <span class="da-card__total">{{ $t("project.stats.total", { n: totalIssues }) }}</span>
          </div>
          <div class="da-card__body">
            <ECharts v-if="hasStatuses" :option="statusOption" />
            <p v-else class="da-card__empty">{{ $t("project.analytics.emptyIssues") }}</p>
          </div>
        </div>

        <div class="da-card">
          <div class="da-card__head">
            <span>{{ $t("project.analytics.largeFileWarning") }}</span>
            <span class="da-card__total">
              <el-button
                v-if="!healthReport"
                link
                size="small"
                type="primary"
                :loading="healthLoading"
                @click="analyzeHealth"
              >{{ $t("project.analytics.analyze") }}</el-button>
              <el-button
                v-else
                link
                size="small"
                :icon="Refresh"
                :loading="healthLoading"
                @click="analyzeHealth"
              />
            </span>
          </div>
          <div class="da-card__body da-card__body--scroll">
            <div v-if="healthLoading" class="da-card__center">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
            <div v-else-if="healthError" class="da-card__error">
              <span>{{ healthError }}</span>
              <el-button link size="small" type="primary" @click="analyzeHealth">{{ $t("project.analytics.retry") }}</el-button>
            </div>
            <div v-else-if="!healthReport" class="da-card__empty">
              {{ $t("project.analytics.clickToAnalyze") }}
            </div>
            <div v-else-if="largeFiles.length" class="da-file-list">
              <div
                v-for="(f, idx) in largeFiles"
                :key="f.path"
                class="da-file-row"
                :class="`da-file-row--${fileLevel(f)}`"
              >
                <span class="da-file-row__idx">{{ idx + 1 }}</span>
                <div class="da-file-row__info">
                  <span class="da-file-row__name">{{ f.path.split("/").pop() }}</span>
                  <span class="da-file-row__path" :title="f.path">{{ f.path }}</span>
                </div>
                <div class="da-file-row__meta">
                  <span>{{ f.total_lines }} {{ $t("project.health.lines") }}</span>
                  <span v-if="f.code_lines !== f.total_lines">{{ f.code_lines }} {{ $t("project.health.codeLines") }}</span>
                </div>
                <div class="da-file-row__bar">
                  <div class="da-file-row__bar-fill" :style="{ width: barPct(f) + '%' }" />
                </div>
              </div>
            </div>
            <p v-else class="da-card__empty">{{ $t("project.analytics.emptyFileData") }}</p>
          </div>
        </div>

        </div>
    </section>

    <!-- ═══ Section 3: 活跃度趋势 ═══ -->
    <section class="da-section">
      <h3 class="da-section__title">{{ $t("project.analytics.sectionActivity") }}</h3>
      <div class="da-card">
        <div class="da-card__body da-card__body--sm">
          <ECharts :option="activityOption" />
        </div>
      </div>
    </section>

    <!-- ═══ Section 4: 代码健康大盘 ═══ -->
    <CodeHealthPanel v-if="projectKey" :project-key="projectKey" />
  </div>
</template>

<script setup lang="ts" name="DetailAnalytics">
import { computed, watch } from "vue";
import { Refresh, Loading } from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import CodeHealthPanel from "./CodeHealthPanel.vue";
import { useCodeHealth } from "@/hooks/useCodeHealth";
import { useProjectDetail, CLOSED_STATUSES, ACTIVITY_DAYS, isoDay } from "@/views/project/types";
import {
  buildStatusBar,
  buildTypeBar,
  buildActivityArea,
} from "@/views/project/charts";

const ctx = useProjectDetail();
const { allIssues, allBugs, allModules, project } = ctx;

const projectKey = computed(() => project.value?.key || "");

// ══════════════════════════════════════════════
// Code health
// ══════════════════════════════════════════════
const projectKeyRef = computed(() => projectKey.value);
const { report: healthReport, loading: healthLoading, error: healthError, analyze: analyzeHealth } = useCodeHealth(projectKeyRef);

watch(projectKey, (key) => {
  if (key) analyzeHealth();
}, { immediate: true });

const LARGE_FILE_LIMIT = 10;

const largeFiles = computed(() => {
  if (!healthReport.value?.scale?.top_files) return [];
  return healthReport.value.scale.top_files.slice(0, LARGE_FILE_LIMIT);
});

const maxFileLines = computed(() => {
  if (!largeFiles.value.length) return 1;
  return Math.max(...largeFiles.value.map(f => f.total_lines));
});

function fileLevel(f: { total_lines: number }): string {
  if (f.total_lines > 600) return "danger";
  if (f.total_lines > 300) return "warn";
  return "good";
}

function barPct(f: { total_lines: number }): number {
  return Math.round((f.total_lines / maxFileLines.value) * 100);
}

// ══════════════════════════════════════════════
// Issue stats
// ══════════════════════════════════════════════
const statuses = computed(() => {
  const acc: Record<string, number> = {};
  for (const i of allIssues.value) acc[i.status] = (acc[i.status] ?? 0) + 1;
  return acc;
});

const types = computed(() => {
  const acc: Record<string, number> = {};
  for (const i of allIssues.value) acc[i.issue_type] = (acc[i.issue_type] ?? 0) + 1;
  return acc;
});

const activity = computed(() => {
  const buckets = new Map<string, number>();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (ACTIVITY_DAYS - 1));
  for (let i = 0; i < ACTIVITY_DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(isoDay(d), 0);
  }
  for (const i of allIssues.value) {
    const day = (i.updated_at || "").slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
});

// ══════════════════════════════════════════════
// KPI summaries
// ══════════════════════════════════════════════
const totalIssues = computed(() => allIssues.value.length);
const openIssues = computed(() => allIssues.value.filter(i => !CLOSED_STATUSES.has(i.status)).length);
const overdueIssues = computed(() => {
  const today = isoDay(new Date());
  return allIssues.value.filter(i => !CLOSED_STATUSES.has(i.status) && i.due_date && i.due_date.slice(0, 10) < today).length;
});
const unassignedIssues = computed(() => allIssues.value.filter(i => !CLOSED_STATUSES.has(i.status) && !i.assignee).length);
const totalBugs = computed(() => allBugs.value.length);
const openBugCount = computed(() => allBugs.value.filter(b => b.status === "open" || b.status === "reopened").length);
const totalModules = computed(() => allModules.value.length);
const modulesWithBugs = computed(() => {
  const bugModules = new Set(allBugs.value.map(b => (b.module || "").trim().toLowerCase()).filter(Boolean));
  return allModules.value.filter(m => bugModules.has(m.name.toLowerCase())).length;
});
const donePct = computed(() => {
  const t = totalIssues.value;
  const d = allIssues.value.filter(i => i.status === "done").length;
  return t ? Math.round((d / t) * 100) : 0;
});
const openPct = computed(() => totalIssues.value ? Math.round((openIssues.value / totalIssues.value) * 100) : 0);
const overduePct = computed(() => openIssues.value ? Math.round((overdueIssues.value / openIssues.value) * 100) : 0);

// ══════════════════════════════════════════════
// Charts
// ══════════════════════════════════════════════
const hasStatuses = computed(() => Object.values(statuses.value).some(v => v > 0));
const hasTypes = computed(() => Object.values(types.value).some(v => v > 0));

const statusOption = computed(() => buildStatusBar(statuses.value));
const typeOption = computed(() => buildTypeBar(types.value));
const activityOption = computed(() => buildActivityArea(activity.value));
</script>

<style scoped lang="scss">
.da-root {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── Section ──
.da-section {
  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }
}

// ── Grid ──
.da-grid {
  display: grid;
  gap: 12px;
  &--2col {
    grid-template-columns: repeat(2, 1fr);
  }
}

// ── KPI cards ──
.da-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.da-kpi {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  gap: 2px;
}

.da-kpi__value {
  font-size: 28px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  &--info { color: var(--el-color-primary); }
  &--warn { color: var(--el-color-warning); }
  &--danger { color: var(--el-color-danger); }
}

.da-kpi__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.da-kpi__sub {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

.da-kpi__bar {
  margin-top: 8px;
  height: 4px;
  background: var(--el-fill-color);
  border-radius: 2px;
  overflow: hidden;
}

.da-kpi__bar-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--el-color-success);
  transition: width 0.4s ease;
  &--info { background: var(--el-color-primary); }
  &--warn { background: var(--el-color-warning); }
}

// ── Card ──
.da-card {
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}

.da-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.da-card__total {
  margin-left: auto;
  font-weight: 400;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}

.da-card__body {
  height: 220px;
  &--sm { height: 140px; }
  &--scroll {
    height: 220px;
    overflow-y: auto;
  }
}

.da-card__center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 20px;
  color: var(--el-text-color-placeholder);
}

.da-card__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.da-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

// ── File list ──
.da-file-list {
  padding: 4px 8px;
}

.da-file-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 5px 6px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  &:last-child { border-bottom: none; }
}

.da-file-row__idx {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  min-width: 16px;
  font-variant-numeric: tabular-nums;
}

.da-file-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.da-file-row__name {
  font-size: 11px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-regular);
}

.da-file-row__path {
  font-size: 9px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: "SF Mono", Menlo, monospace;
}

.da-file-row__meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}

.da-file-row__bar {
  width: 100%;
  height: 3px;
  background: var(--el-fill-color);
  border-radius: 2px;
  overflow: hidden;
}

.da-file-row__bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.da-file-row--good .da-file-row__bar-fill { background: var(--el-color-success); }
.da-file-row--warn .da-file-row__bar-fill { background: var(--el-color-warning); }
.da-file-row--warn .da-file-row__name { color: var(--el-color-warning); }
.da-file-row--danger .da-file-row__bar-fill { background: var(--el-color-danger); }
.da-file-row--danger .da-file-row__name { color: var(--el-color-danger); }
</style>