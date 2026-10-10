<template>
  <div class="okr-role">
    <div class="okr-role__header">
      <div class="okr-role__role-nav">
        <button
          v-for="rid in ROLE_IDS"
          :key="rid"
          class="okr-role__role-nav-item"
          :class="{ 'is-active': rid === props.roleId }"
          @click="rid !== props.roleId && navigateRole(rid)"
        >
          <span class="okr-role__role-nav-icon">{{ rolesData[rid].icon }}</span>
          <span class="okr-role__role-nav-label">{{ rolesData[rid].name }}</span>
        </button>
      </div>
    </div>

    <!-- ═══ Sticky Header Bar ═══ -->
    <div class="okr-role__sticky-bar">
      <div class="okr-role__sticky-top">
        <div class="okr-role__sticky-left">
          <span class="okr-role__sticky-icon">{{ role.icon }}</span>
          <div class="okr-role__sticky-info">
            <h1 class="okr-role__sticky-name">{{ role.name }} OKR</h1>
          </div>
        </div>
        <div class="okr-role__sticky-center">
          <el-select v-model="selectedYear" size="small" class="okr-role__year-select" @change="onYearChange">
            <el-option v-for="y in availableYears" :key="y" :label="y" :value="y" />
          </el-select>
          <el-radio-group v-model="selectedPeriod" size="small">
            <el-radio-button value="q1">Q1</el-radio-button>
            <el-radio-button value="q2">Q2</el-radio-button>
            <el-radio-button value="q3">Q3</el-radio-button>
            <el-radio-button value="q4">Q4</el-radio-button>
            <el-radio-button value="annual">{{ selectedYear }}</el-radio-button>
          </el-radio-group>
        </div>
        <div class="okr-role__sticky-right">
          <div class="okr-role__stat-pill">
            <span class="okr-role__stat-pill-value">{{ filteredGoals.length }}</span>
            <span class="okr-role__stat-pill-label">Goals</span>
          </div>
          <div class="okr-role__stat-pill">
            <span class="okr-role__stat-pill-value">{{ periodMetricCount }}</span>
            <span class="okr-role__stat-pill-label">Metrics</span>
          </div>
          <div class="okr-role__stat-pill okr-role__stat-pill--accent">
            <span class="okr-role__stat-pill-value">{{ periodAvgProgress }}%</span>
            <span class="okr-role__stat-pill-label">Progress</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════ SLO Burn-Rate 告警条 ════════════════ -->
    <section class="okr-role__section">
      <el-alert
        v-if="showSloAlert"
        :title="sloAlertText"
        :type="sloAlertType"
        :closable="true"
        show-icon
        class="okr__slo-alert"
      >
        <template #default>
          <span>{{ sloAlertText }}</span>
          <el-button
            text
            size="small"
            type="primary"
            style="margin-left: 12px"
            @click="navigateProcessRecord"
          >
            查看闭环记录 →
          </el-button>
        </template>
      </el-alert>
    </section>

    <!-- ════════════════ 6 × KPI 卡片行 ════════════════ -->
    <section class="okr-role__section">
      <div class="okr__kpi-row">
        <div v-for="kpi in kpiList" :key="kpi.key" class="okr-kpi-card" :class="`okr-kpi-card--${kpi.key}`">
          <div class="okr-kpi-card__icon">{{ kpi.icon }}</div>
          <div class="okr-kpi-card__body">
            <div class="okr-kpi-card__title">{{ kpi.title }}</div>
            <div class="okr-kpi-card__value">
              {{ kpi.value }}
              <sup v-if="kpi.suffix" class="okr-kpi-card__suffix">{{ kpi.suffix }}</sup>
            </div>
          </div>
          <div class="okr-kpi-card__mom">
            <span :class="['okr-kpi-card__arrow', kpi.mom >= 0 ? 'is-up' : 'is-down']">
              {{ kpi.mom >= 0 ? "▲" : "▼" }}
            </span>
            <span class="okr-kpi-card__mom-val">{{ Math.abs(kpi.mom).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════ 北极星卡 ════════════════ -->
    <section class="okr-role__section">
      <el-card shadow="never" class="okr__north-star">
        <div class="okr-north">
          <div class="okr-north__left">
            <div class="okr-north__label">
              <span class="okr-north__icon">🌟</span>
              北极星指标
            </div>
            <div class="okr-north__title">{{ northStarGoal?.title ?? "AI 全流程自闭环" }}</div>
            <div class="okr-north__desc">
              {{ northStarGoal?.description ?? "从需求评审到上线记录的 5 步验证门自闭环，无人工断点。" }}
            </div>
            <div class="okr-north__meta">
              <el-tag size="small" effect="plain" type="primary">周期：{{
                northStarGoal?.period ?? "2026 Q3"
              }}</el-tag>
              <el-tag size="small" effect="plain" type="success">Owner：{{
                northStarGoal?.owner ?? "CEO"
              }}</el-tag>
              <el-tag size="small" effect="plain" type="warning">项目：{{
                northStarGoal?.project ?? "YiAi"
              }}</el-tag>
            </div>
            <div class="okr-north__pills">
              <el-tag
                v-for="(kr, idx) in northStarKRs"
                :key="idx"
                class="okr-north__pill"
                :class="{ 'okr-north__pill--done': kr.progress >= 100 }"
                :type="kr.progress >= 100 ? 'success' : kr.progress >= 70 ? undefined : 'warning'"
                size="small"
                effect="light"
                round
                :title="kr.text"
              >
                KR{{ idx + 1 }} · {{ kr.progress }}%
              </el-tag>
            </div>
          </div>
          <div class="okr-north__right">
            <el-progress
              type="dashboard"
              :percentage="northStarProgress"
              :stroke-width="12"
              :width="170"
              :status="
                northStarProgress >= 100 ? 'success' : northStarProgress >= 70 ? undefined : 'warning'"
            >
              <template #default="{ percentage }">
                <div class="okr-north__gauge-center">
                  <span class="okr-north__gauge-num">{{ percentage }}</span>
                  <span class="okr-north__gauge-unit">%</span>
                </div>
              </template>
            </el-progress>
          </div>
        </div>
      </el-card>
    </section>

    <!-- ════════════════ KR × Week 折线图 ════════════════ -->
    <section class="okr-role__section">
      <div class="okr__section-head">
        <h2><span>📈</span>KR × Week 进度折线（12 周）</h2>
        <div class="okr__section-hint">每条线 = 1 条 KR；真实 KR 不足 5 条 5 条 5 条 5 条曲线平滑填充">
      </div>
      <div ref="lineChartRef" class="okr__chart-box"></div>
    </section>

    <!-- ════════════════ 5 步验证门漏斗图 ════════════════ -->
    <section class="okr-role__section">
      <div class="okr__section-head">
        <h2><span>🛡️</span>5 步验证门完成率漏斗</h2>
        <div class="okr__section-hint">KR→PRD→Dev→Test→Evidence 各步完成数量</div>
      </div>
      <div class="okr-role__funnel-row">
        <div ref="funnelChartRef" class="okr__chart-box okr__chart-box--funnel"></div>
        <div class="okr-role__funnel-legend">
          <div v-for="(gate, idx) in fiveGates" :key="gate.key" class="okr-role__funnel-item">
            <span class="okr-role__funnel-item-icon">{{ gate.icon }}</span>
            <div class="okr-role__funnel-item-body">
              <div class="okr-role__funnel-item-name">{{ idx + 1 }}. {{ gate.abbr }} · {{ gate.label }}</div>
              <div class="okr-role__funnel-item-count">完成 <b>{{ funnelCounts[idx] }}</b> / {{ totalKRs }} 项</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Goal Table (original logic) ═══ -->
    <section class="okr-role__section">
      <el-table
      v-if="filteredGoals.length"
      :data="filteredGoals"
      stripe
      border
      style="width: 100%"
      row-key="id"
      :expand-row-keys="expandedGoalIds"
      @expand-change="onExpandChange"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="okr-role__expand">
            <div v-if="getGoalMetrics(row.id).length" class="okr-role__expand-metrics">
              <h4 class="okr-role__expand-title">Related Metrics ({{ getGoalMetrics(row.id).length }})</h4>
              <el-table :data="getGoalMetrics(row.id)" size="small" border style="width: 100%">
                <el-table-column prop="name" label="Metric" min-width="220">
                  <template #default="{ row: mr }">
                    <div class="okr-role__table-item">
                      <span class="okr-role__table-icon">{{ mr.icon }}</span>
                      <div>
                        <span
                          class="okr-role__table-title okr-role__table-title--link"
                          @click="openMetricFile(mr as MetricItem)"
                          >{{ mr.name }}</span
                        >
                        <p class="okr-role__table-desc">{{ mr.description }}</p>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="category" label="Category" width="120">
                  <template #default="{ row: mr }">
                    <el-tag size="small" effect="plain">{{ mr.category }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Current" width="110" sortable prop="current">
                  <template #default="{ row: mr }">
                    <span class="okr-role__table-value">{{ mr.current }}{{ mr.unit }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Target" width="100" sortable prop="target">
                  <template #default="{ row: mr }">
                    <span class="okr-role__table-target">{{ mr.target }}{{ mr.unit }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Progress" width="150">
                  <template #default="{ row: mr }">
                    <div class="okr-role__table-progress">
                      <el-progress :percentage="mr.progress" :status="krStatus(mr.progress)" :stroke-width="6" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="Trend" width="80">
                  <template #default="{ row: mr }">
                    <el-tag :type="mr.trend === 'up' ? 'success' : mr.trend === 'down' ? 'danger' : 'info'" size="small">
                      {{ mr.trend === 'up' ? '↑' : mr.trend === 'down' ? '↓' : '→' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="okr-role__expand-empty">No related metrics for this goal.</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="Goal" min-width="240" sortable>
        <template #default="{ row }">
          <div class="okr-role__table-item">
            <span class="okr-role__table-icon">{{ row.icon }}</span>
            <div>
              <span class="okr-role__table-title okr-role__table-title--link" @click="openGoalFile(row as GoalItem)">{{
                row.title
              }}</span>
              <p class="okr-role__table-desc">{{ row.description }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Key Results" min-width="300">
        <template #default="{ row }">
          <div class="okr-role__table-krs">
            <div v-for="(kr, i) in row.keyResults" :key="i" class="okr-role__table-kr">
              <span class="okr-role__table-kr-num">KR{{ Number(i) + 1 }}</span>
              <span
                class="okr-role__table-kr-text"
                :class="{ 'okr-role__table-kr-text--link': kr.file }"
                :title="kr.file ? `证据文件：${kr.file}` : '尚未沉淀证据'"
                @click="openKrFile(kr)"
                >{{ kr.text }}</span
              >
              <el-icon v-if="kr.file" class="okr-role__table-kr-doc" @click="openKrFile(kr)"><Document /></el-icon>
              <el-progress
                :percentage="kr.progress"
                :status="krStatus(kr.progress)"
                :stroke-width="4"
                style="width: 60px; min-width: 60px"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Avg" width="70">
        <template #default="{ row }">
          <el-progress
            :percentage="krAvg(row as GoalItem)"
            :status="krStatus(krAvg(row as GoalItem))"
            :stroke-width="6"
            :show-text="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="Loop" width="100" align="center">
        <template #default="{ row }">
          <span
            v-if="goalLoops((row as GoalItem).id).length"
            class="okr-role__loop-link"
            @click="goGoalLoops((row as GoalItem).id)"
            >🔁 {{ goalLoops((row as GoalItem).id).length }} 闭环</span
          >
          <span v-else class="okr-role__loop-empty">—</span>
        </template>
      </el-table-column>
      <el-table-column label="Issues" width="100" align="center">
        <template #default="{ row }">
          <span
            v-if="goalIssueCount((row as GoalItem).id)"
            class="okr-role__issue-link"
            @click="goGoalIssues((row as GoalItem).id)"
            >🎯 {{ goalIssueCount((row as GoalItem).id) }} 执行</span
          >
          <span v-else class="okr-role__loop-empty">—</span>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="okr-role__empty">
      <div class="okr-role__empty-icon">📅</div>
      <h3 class="okr-role__empty-title">No goals for {{ selectedYear }}</h3>
      <p class="okr-role__empty-desc">This year has no OKR goals yet. Try a different year or period.</p>
    </div>
  </section>

  <el-divider />

  <!-- ════════════════ Weekly Report ════════════════ -->
  <section class="okr-role__section">
    <div class="okr__section-head">
      <h2>📋 Weekly Report</h2>
      <div class="okr-role__week-range">
        <el-button text size="small" class="okr-role__week-nav" @click="shiftWeek(-1)">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-date-picker
          v-model="selectedWeek"
          type="week"
          format="[Week] ww, gggg"
          :clearable="false"
          size="small"
          class="okr-role__week-input"
        />
        <el-button text size="small" class="okr-role__week-nav" @click="shiftWeek(1)">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-button
        size="small"
        type="primary"
        plain
        class="okr-role__section-action"
        :icon="Document"
        @click="openWeeklyFile"
      >
        Open File
      </el-button>
      <el-button
        size="small" type="success" :icon="Download" :loading="weeklySaving" @click="depositWeeklyReport" class="okr-role__section-action">
        沉淀今日周报
      </el-button>
    </div>
    <div v-if="isCurrentWeek" class="okr-role__weekly-grid">
      <div
        class="okr-role__weekly-card okr-role__weekly-card--done"
        :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('done') }"
      >
        <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('done')">
          <span class="okr-role__weekly-card-icon">✅</span>
          <span class="okr-role__weekly-card-label">Accomplishments</span>
          <span class="okr-role__weekly-card-count">{{ weeklyData.done.length }}</span>
          <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('done') ? '▸' : '▾' }}</span>
        </div>
        <div
          class="okr-role__weekly-card-body"
          :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('done') }"
        >
          <ul class="okr-role__weekly-card-list">
            <li v-for="(d, i) in weeklyData.done" :key="'d' + i" class="okr-role__weekly-card-item">
              <span
                class="okr-role__weekly-card-text"
                :class="{ 'okr-role__weekly-card-text--link': d.file }"
                :title="d.file ? `证据文件：${d.file}` : undefined"
                @click="d.file && openWeeklyItemFile(d)"
                >{{ d.text }}</span
              >
            </li>
          </ul>
        </div>
      </div>
      <div
        class="okr-role__weekly-card okr-role__weekly-card--blockers"
        :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('blockers') }"
      >
        <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('blockers')">
          <span class="okr-role__weekly-card-icon">🚧</span>
          <span class="okr-role__weekly-card-label">Blockers</span>
          <span class="okr-role__weekly-card-count">{{ weeklyData.blockers.length }}</span>
          <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('blockers') ? '▸' : '▾' }}</span>
        </div>
        <div
          class="okr-role__weekly-card-body"
          :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('blockers') }"
        >
          <ul v-if="weeklyData.blockers.length" class="okr-role__weekly-card-list">
            <li v-for="(b, i) in weeklyData.blockers" :key="'b' + i" class="okr-role__weekly-card-item">
              <span
                class="okr-role__weekly-card-text"
                :class="{ 'okr-role__weekly-card-text--link': b.file }"
                :title="b.file ? `证据文件：${b.file}` : undefined"
                @click="b.file && openWeeklyItemFile(b)"
                >{{ b.text }}</span
              >
            </li>
          </ul>
          <span v-else class="okr-role__weekly-card-none">No blockers this week.</span>
        </div>
      </div>
      <div
        class="okr-role__weekly-card okr-role__weekly-card--next"
        :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('next') }"
      >
        <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('next')">
          <span class="okr-role__weekly-card-icon">📅</span>
          <span class="okr-role__weekly-card-label">Next Week</span>
          <span class="okr-role__weekly-card-count">{{ weeklyData.nextWeek.length }}</span>
          <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('next') ? '▸' : '▾' }}</span>
        </div>
        <div
          class="okr-role__weekly-card-body"
          :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('next') }"
        >
          <ul class="okr-role__weekly-card-list">
            <li v-for="(n, i) in weeklyData.nextWeek" :key="'n' + i" class="okr-role__weekly-card-item">
              <span
                class="okr-role__weekly-card-text"
                :class="{ 'okr-role__weekly-card-text--link': n.file }"
                :title="n.file ? `证据文件：${n.file}` : undefined"
                @click="n.file && openWeeklyItemFile(n)"
                >{{ n.text }}</span
              >
            </li>
          </ul>
        </div>
      </div>
      <div
        class="okr-role__weekly-card okr-role__weekly-card--decisions"
        :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('decisions') }"
      >
        <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('decisions')">
          <span class="okr-role__weekly-card-icon">📝</span>
          <span class="okr-role__weekly-card-label">Key Decisions</span>
          <span class="okr-role__weekly-card-count">{{ weeklyData.decisions.length }}</span>
          <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('decisions') ? '▸' : '▾' }}</span>
        </div>
        <div
          class="okr-role__weekly-card-body"
          :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('decisions') }"
        >
          <ul class="okr-role__weekly-card-list">
            <li v-for="(kd, i) in weeklyData.decisions" :key="'kd' + i" class="okr-role__weekly-card-item">
              <span
                class="okr-role__weekly-card-text"
                :class="{ 'okr-role__weekly-card-text--link': kd.file }"
                :title="kd.file ? `证据文件：${kd.file}` : undefined"
                @click="kd.file && openWeeklyItemFile(kd)"
                >{{ kd.text }}</span
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="okr-role__empty">
      <div class="okr-role__empty-icon">📭</div>
      <h3 class="okr-role__empty-title">No weekly report for this week</h3>
      <p class="okr-role__empty-desc">Navigate back to the current week to view this week's report.</p>
    </div>
  </section>

  <KnowledgePreviewDialog ref="previewDlg" />
</div>
</template>

<script setup lang="ts" name="okrRole">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount, nextTick, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, ArrowRight, Document, Download } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { useTimeoutFn } from "@vueuse/core";
import * as echarts from "echarts";
import { useRouter } from "vue-router";
import {
  writeKnowledgeFile,
  scanKnowledge
} from "@/api/modules/knowledgeService";
import { getIssueList } from "@/api/modules/issueService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { ElMessage } from "element-plus";
import { DisposerBag, createTimeoutSignal } from "@/utils/disposer";
import { createSafeResizeObserver } from "@/utils/index";
import {
  resolveLink,
  gateBEntityExists,
  gateCPostNavigate
} from "@/utils/linkFactory";
import {
  rolesData,
  goalsData,
  metricsData,
  goalMetricMap,
  getGoalMetrics,
  roleWeeklyDataMap,
  ROLE_IDS,
  goalRoleMap,
  metricRoleMap,
  type GoalItem,
  type MetricItem,
  type KeyResult,
  type WeeklyItem,
  roleDailyDataMap
} from "./okrData";

const props = defineProps<{ roleId: string }>();
const route = useRoute();
const _router = useRouter();

/* ════════════════════════════════════════════════ */
/* DisposerBag + Watchdog（硬约束 1/5） */
/* ════════════════════════════════════════════════ */
const disposer = new DisposerBag();
onBeforeUnmount(() => {
  try {
    lineChart.value?.dispose?.();
  } catch { /* noop */ }
  try {
    funnelChart.value?.dispose?.();
  } catch { /* noop */ }
  disposer.dispose();
});
function newSignal(timeoutMs = 12_000) {
  disposer.reset();
  return createTimeoutSignal(timeoutMs, disposer);
}

const loading = ref(false);
const weeklySaving = ref(false);
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const { start: startHook, stop: stopHook } = useTimeoutFn(
  () => {
    if (loading.value) ElMessage.warning("OKR 详情加载较慢（>12s），正在继续等待…");
  },
  12_000,
  { immediate: false }
);
const { start: startFallback, stop: stopFallback } = useTimeoutFn(
  () => {
    if (loading.value) {
      loading.value = false;
      ElMessage.error("OKR 详情加载超时（22s watchdog）");
      try { disposer.reset(); } catch { /* noop */ }
    }
  },
  22_000,
  { immediate: false }
);

/* ════════════════════════════════════════════════ */
/* Link Factory 三闸门导航（硬约束 4）*/
/* ════════════════════════════════════════════════ */
interface KnowledgeRoute {
  view?: "okr" | "processRecord" | "executive" | "issueDetail";
  role?: string;
  query?: Record<string, string>;
}
async function safeNavigateKnowledge(target: KnowledgeRoute) {
  let path = "/knowledge/executive/okr";
  if (target.view === "processRecord") path = "/knowledge/executive/processRecord";
  else if (target.view === "executive") path = "/knowledge/executive";
  else if (target.view === "issueDetail" && target.query?.goal) {
    // 走 resolveLink（issue 已在 TEMPLATES）
    const r = resolveLink({ type: "issue", key: "", title: `Goal ${target.query.goal}` });
    const fallback = r.ok ? r.link : "/issue";
    try { await gateBEntityExists({type: "issue", key: "", project: ""}, { timeoutMs: 1500}); } catch { /* noop */ }
    try {
      await _router.push(`/issue?goal=${encodeURIComponent(target.query.goal)}`);
    } catch {
      await _router.push(fallback).catch(() => undefined);
      return;
    }
    const arrived = await gateCPostNavigate({
      expectedLink: `/issue?goal=${encodeURIComponent(target.query.goal)}`,
      expectedParams: {},
      timeoutMs: 1500
    });
    if (!arrived) await _router.push(fallback).catch(() => undefined);
    return;
  }
  if (target.role) path = `/knowledge/${target.role}`;
  let query = "";
  if (target.query) {
    const parts = Object.entries(target.query)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    if (parts.length) query = `?${parts.join("&")}`;
  }
  const expected = `${path}${query}`;
  const fallback = "/knowledge/executive";
  try { await gateBEntityExists({type:"page", key: path}, {timeoutMs:1500}); } catch { /* noop */ }
  try {
    await _router.push(expected);
  } catch {
    ElMessage.warning("导航失败，已回退");
    await _router.push(fallback).catch(() => undefined);
    return;
  }
  const arrived = await gateCPostNavigate({ expectedLink: expected, expectedParams: {}, timeoutMs: 1500 });
  if (!arrived) {
    ElMessage.warning("目标页不可达，已回退");
    await _router.push(fallback).catch(() => undefined);
  }
}
function navigateRole(rid: string) {
  return safeNavigateKnowledge({ role: rid, query: {}});
}
function navigateProcessRecord() {
  return safeNavigateKnowledge({ view: "processRecord"});
}
function navigateOkrIndex(goal: string) {
  return safeNavigateKnowledge({ view: "okr", query: { role: props.roleId, goal } });
}

/* ════════════════════════════════════════════════ */
/* Goal → Loop/闭环记录深链
/* ════════════════════════════════════════════════ */
const loopIdsByGoal = ref<Record<string, string[]>>({});
async function loadLoopLinks() {
  loading.value = true;
  disposer.reset();
  const { signal } = createTimeoutSignal(15_000, disposer);
  startHook();
  startFallback();
  try {
    const res = await scanKnowledge("okr", { timeoutMs: 15_000, signal });
    const files = res.categories?.flatMap(c => c.files) ?? [];
    const map: Record<string, string[]> = {};
    for (const f of files) {
      const m = (f as KnowledgeFileEntry).meta ?? {};
      if ((m as any).type !== "loop-record") continue;
      const goalId = typeof (m as any).goalId === "string" ? (m as any).goalId : "";
      const loopId = typeof (m as any).loopId === "string" ? (m as any).loopId : "";
      if (!goalId || !loopId) continue;
      if (!map[goalId]) map[goalId] = [];
      if (!map[goalId].includes(loopId)) map[goalId].push(loopId);
    }
    loopIdsByGoal.value = map;
  } catch {
    loopIdsByGoal.value = {};
  } finally {
    try { stopHook(); stopFallback(); } catch { /* noop */ }
    loading.value = false;
  }
}
function goalLoops(goalId: string): string[] {
  return loopIdsByGoal.value[goalId] || [];
}
/** 深链到 processRecord 并带 goal 参数 */
function goGoalLoops(goalId: string) {
  const query: Record<string, string> = { goal: goalId };
  return safeNavigateKnowledge({ view: "processRecord", query});
}

/* ════════════════════════════════════════════════ */
/* Goal → Issue 执行链（PM 系统）深链
/* ════════════════════════════════════════════════ */
const issueCountByGoal = ref<Record<string, number>>({});
async function loadIssueCounts() {
  disposer.reset();
  const { signal } = createTimeoutSignal(12_000, disposer);
  try {
    // getIssueList 接口签名 — 透传 { timeout, signal } 若支持
    const res = await (getIssueList as any)(
      { pageSize: 1000 },
      { timeoutMs: 12_000, signal }
    );
    const list = (res as any).data?.list ?? [];
    const map: Record<string, number> = {};
    for (const it of list) {
      const gid = (it as any).goal_id as string | undefined;
      if (gid) map[gid] = (map[gid] ?? 0) + 1;
    }
    issueCountByGoal.value = map;
  } catch {
    issueCountByGoal.value = {};
  }
}
function goalIssueCount(goalId: string): number {
  return issueCountByGoal.value[goalId] ?? 0;
}
function goGoalIssues(goalId: string) {
  return safeNavigateKnowledge({ view: "issueDetail", query: { goal: goalId }});
}

/* ════════════════════════════════════════════════ */
/* 周期 / 展开
/* ════════════════════════════════════════════════ */
const selectedPeriod = ref("q3");
const selectedYear = ref(String(dayjs().year()));
const availableYears = computed(() => {
  const y = dayjs().year();
  return [y - 2, y - 1, y, y + 1].map(String);
});
function onYearChange() {
  selectedPeriod.value = "annual";
}

const expandedGoalIds = ref<string[]>([]);
function onExpandChange(_row: GoalItem, expandedRows: GoalItem[] | boolean) {
  if (Array.isArray(expandedRows)) expandedGoalIds.value = expandedRows.map(r => r.id);
}

/* ════════════════════════════════════════════════ */
/* 文件预览辅助
/* ════════════════════════════════════════════════ */
function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}
function goalFilePath(g: GoalItem): string {
  return `${goalRoleMap[g.id]}/okr/2026-Q3/${g.id}/goal.md`;
}
function metricFilePath(m: MetricItem): string {
  const role = metricRoleMap[m.id] ?? props.roleId;
  let goalId = "";
  for (const [gId, mIds] of Object.entries(goalMetricMap)) {
    if (mIds.includes(m.id)) { goalId = gId; break; }
  }
  return `${role}/okr/2026-Q3/${goalId}/${m.id}-${slugifyTitle(m.name)}.md`;
}
function renderGoalBody(g: GoalItem): string {
  const lines: string[] = [`# ${g.icon} ${g.title}`, "", g.description];
  lines.push(
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | \`${g.id}\` |`,
    `| Status | ${g.status} |`,
    `| Period | ${g.period} |`,
    `| Owner | ${g.owner} |`,
    `| Project | ${g.project} |`
  );
  if (g.keyResults?.length) {
    lines.push("", `## Key Results (${g.keyResults.length})`);
    g.keyResults.forEach((kr, i) => {
      lines.push(`- KR${i + 1}: ${kr.text} — ${kr.progress}%`);
    });
  }
  const metrics = getGoalMetrics(g.id);
  if (metrics.length) {
    lines.push("", `## Related Metrics (${metrics.length})`);
    metrics.forEach(m => {
      lines.push(`- ${m.icon} ${m.name} (\`${m.id}\`) — ${m.current}${m.unit} / ${m.target}${m.unit} · ${m.progress}%`);
    });
  }
  return lines.join("\n");
}
function goalMeta(g: GoalItem): Record<string, unknown> {
  return {
    type: "okr-goal",
    id: g.id,
    title: g.title,
    status: g.status,
    period: g.period,
    owner: g.owner,
    project: g.project,
    progress: krAvg(g)
  };
}
function renderMetricBody(m: MetricItem): string {
  const trendLabel = m.trend === "up" ? "↑ Up" : m.trend === "down" ? "↓ Down" : "→ Flat";
  return [
    `# ${m.icon} ${m.name}`,
    "",
    m.description,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | \`${m.id}\` |`,
    `| Category | ${m.category} |`,
    `| Framework | ${m.framework} |`,
    `| Baseline | ${m.baseline}${m.unit} |`,
    `| Current | ${m.current}${m.unit} |`,
    `| Target | ${m.target}${m.unit} |`,
    `| Trend | ${trendLabel} |`,
    `| Progress | ${m.progress}% |`
  ].join("\n");
}
function metricMeta(m: MetricItem): Record<string, unknown> {
  return {
    type: "okr-metric",
    id: m.id,
    name: m.name,
    category: m.category,
    framework: m.framework,
    trend: m.trend,
    progress: m.progress
  };
}
async function openGoalFile(g: GoalItem) {
  const path = goalFilePath(g);
  disposer.reset();
  const { signal } = createTimeoutSignal(10_000, disposer);
  try {
    await writeKnowledgeFile(path, renderGoalBody(g), goalMeta(g), { timeoutMs: 10_000, signal });
  } catch { /* backend unavailable */ }
  previewDlg.value?.open(path);
}
async function openMetricFile(m: MetricItem) {
  const path = metricFilePath(m);
  disposer.reset();
  const { signal } = createTimeoutSignal(10_000, disposer);
  try {
    await writeKnowledgeFile(path, renderMetricBody(m), metricMeta(m), { timeoutMs: 10_000, signal });
  } catch { /* noop */ }
  previewDlg.value?.open(path);
}
function openKrFile(kr: KeyResult) {
  if (!kr.file) { ElMessage.info("尚未沉淀证据"); return; }
  previewDlg.value?.open(kr.file);
}

/* ════════════════════════════════════════════════ */
/* 周报
/* ════════════════════════════════════════════════ */
const selectedWeek = ref(dayjs().startOf("week").add(1, "day").toDate());
function shiftWeek(delta: number) {
  selectedWeek.value = dayjs(selectedWeek.value).add(delta, "week").toDate();
}
const weekRangeLabel = computed(() => {
  const mon = dayjs(selectedWeek.value).startOf("week").add(1, "day");
  const fri = mon.add(4, "day");
  return `${mon.format("YYYY-MM-DD")} → ${fri.format("YYYY-MM-DD")}`;
});
const isCurrentWeek = computed(() => {
  const thisMonday = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
  const selMonday = dayjs(selectedWeek.value).startOf("week").add(1, "day").format("YYYY-MM-DD");
  return thisMonday === selMonday;
});
const role = computed(() => rolesData[props.roleId] || rolesData.executive);
const allGoals = computed(() => goalsData[props.roleId] || []);
const weeklyData = computed(() => roleWeeklyDataMap[props.roleId] || roleWeeklyDataMap.executive);

const collapsedWeeklySections = reactive<Set<string>>(new Set(["blockers"]));
function toggleWeeklySection(key: string) {
  if (collapsedWeeklySections.has(key)) collapsedWeeklySections.delete(key);
  else collapsedWeeklySections.add(key);
}
function openWeeklyItemFile(item: WeeklyItem) {
  if (!item.file) { ElMessage.info("尚未沉淀证据"); return; }
  previewDlg.value?.open(item.file);
}
function quarterDir(monthDir: string): string {
  return `${monthDir.slice(0, 4)}-Q${Math.ceil(Number(monthDir.slice(5, 7)) / 3)}`;
}
/** ISO 8601 week number (Monday start, week #1 = week with Jan 4). Pure JS, no dayjs plugins. */
function isoWeekNum(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
function weeklyFilePath(): string {
  const monday = dayjs(selectedWeek.value).startOf("week").add(1, "day");
  const monthDir = monday.format("YYYY-MM");
  const weekNo = isoWeekNum(monday.toDate());
  const WW = String(weekNo).padStart(2, "0");
  return `okr/${quarterDir(monthDir)}/${monthDir}/weekly/${props.roleId}-week-${WW}.md`;
}
function renderWeeklyBody(): string {
  const w = weeklyData.value;
  const r = role.value;
  const goals = allGoals.value;
  const metrics = metricsData[props.roleId] || [];
  const daily = roleDailyDataMap[props.roleId];

  const lines: string[] = [
    `# Weekly Report — ${r.name}`,
    "",
    `**${weekRangeLabel.value}** · Status: **${w.status}**`,
    "",
    "## 🎯 OKR Snapshot",
    "",
    `- Goals: ${goals.length}`,
    `- Overall progress: ${periodAvgProgress.value}%`,
    ""
  ];
  if (daily) {
    lines.push("## 📅 今日 / 昨日 现场", "", "");
    if (daily.yesterday?.length) {
      lines.push("### 昨日完成", "");
      daily.yesterday.forEach(x => lines.push(`- ${x}`));
      lines.push("");
    }
    if (daily.today?.length) {
      lines.push("### 今日计划", "");
      daily.today.forEach(x => lines.push(`- ${x}`));
      lines.push("");
    }
    if (daily.blocker) {
      lines.push(`### 🚧 Blocker`, "", `- ${daily.blocker}`, "");
    }
    if (daily.mood) {
      lines.push(`### 😊 Mood: **${daily.mood}**`, "");
    }
    lines.push("");
  }
  if (goals.length) {
    lines.push("### Goals", "", "| Goal | Status | Period | Progress |", "|---|---|---|---|");
    goals.forEach(g => lines.push(`| ${g.icon} ${g.title} | ${g.status} | ${g.period} | ${krAvg(g)}% |`));
    lines.push("");
  }
  if (metrics.length) {
    lines.push("### Metrics", "", "| Metric | Current | Target | Progress |", "|---|---|---|---|");
    metrics.forEach(m => lines.push(`| ${m.icon} ${m.name} | ${m.current}${m.unit} | ${m.target}${m.unit} | ${m.progress}% |`));
    lines.push("");
  }
  lines.push("## ✅ Accomplishments", "");
  lines.push(...w.done.map(d => d.file ? `- [${d.text}](${d.file})` : `- ${d.text}`));
  lines.push("", "## 🚧 Blockers", "");
  if (w.blockers.length) lines.push(...w.blockers.map(b => b.file ? `- [${b.text}](${b.file})` : `- ${b.text}`));
  else lines.push("- None");
  lines.push("", "## 📅 Next Week", "");
  lines.push(...w.nextWeek.map(n => n.file ? `- [${n.text}](${n.file})` : `- ${n.text}`));
  lines.push("", "## 📝 Key Decisions", "");
  lines.push(...w.decisions.map(d => d.file ? `- [${d.text}](${d.file})` : `- ${d.text}`));
  return lines.join("\n");
}
async function openWeeklyFile() {
  const w = weeklyData.value;
  const path = weeklyFilePath();
  disposer.reset();
  const { signal } = createTimeoutSignal(10_000, disposer);
  try {
    await writeKnowledgeFile(
      path,
      renderWeeklyBody(),
      { type: "okr-weekly", role: props.roleId, week: weekRangeLabel.value, status: w.status },
      { timeoutMs: 10_000, signal }
    );
  } catch { /* noop */ }
  previewDlg.value?.open(path);
}

/**
 * 一键沉淀今日周报：写入 `okr/<Y-Q>/<Y-M>/weekly/<role>-week-WW.md`
 * 并在 Toast 提示用户
 */
async function depositWeeklyReport() {
  if (weeklySaving.value) return;
  weeklySaving.value = true;
  disposer.reset();
  const { signal } = createTimeoutSignal(15_000, disposer);
  const path = weeklyFilePath();
  const w = weeklyData.value;
  try {
    await writeKnowledgeFile(
      path,
      renderWeeklyBody(),
      {
        type: "okr-weekly",
        role: props.roleId,
        week: weekRangeLabel.value,
        status: w.status,
        depositedAt: dayjs().toISOString(),
        isCurrentWeek: isCurrentWeek.value
      },
      { timeoutMs: 15_000, signal }
    );
    ElMessage.success(`周报已沉淀到知识库：${path}`);
  } catch (e) {
    ElMessage.error(`周报沉淀失败：${(e as Error).message || String(e)}`);
  } finally {
    weeklySaving.value = false;
  }
}

/* ════════════════════════════════════════════════ */
/* 周期 Goal 筛选
/* ════════════════════════════════════════════════ */
watch(
  () => props.roleId,
  () => {
    selectedPeriod.value = "q3";
    selectedYear.value = String(dayjs().year());
    expandedGoalIds.value = [];
    const container = document.querySelector(".okr-role");
    if (container) (container as HTMLElement).scrollTop = 0;
    applyGoalFromQuery();
  }
);

onMounted(() => {
  applyGoalFromQuery();
  loadLoopLinks();
  loadIssueCounts();
  nextTick(() => {
    renderLineChart();
    renderFunnelChart();
  });
  if (lineChartRef.value) {
    const ro = createSafeResizeObserver(() => lineChart.value?.resize?.(), { debounceMs: 80 });
    ro.observe(lineChartRef.value);
    lineObserver = ro as any;
  }
  if (funnelChartRef.value) {
    const ro = createSafeResizeObserver(() => funnelChart.value?.resize?.(), { debounceMs: 80 });
    ro.observe(funnelChartRef.value);
    funnelObserver = ro as any;
  }
});

let lineObserver: ResizeObserver | null = null;
let funnelObserver: ResizeObserver | null = null;

onBeforeUnmount(() => {
  try { lineObserver?.disconnect(); } catch { /* noop */ }
  try { funnelObserver?.disconnect(); } catch { /* noop */ }
});

function goalMatchesPeriod(period: string, selected: string): boolean {
  if (selected === "annual") return true;
  const qMap: Record<string, string[]> = {
    q1: ["Q1", "H1"], q2: ["Q2", "H1"], q3: ["Q3", "H2"], q4: ["Q4", "H2"]
  };
  const patterns = qMap[selected] || [];
  return patterns.some(p => period.includes(p));
}
function periodForGoal(period: string): string {
  for (const p of ["q1", "q2", "q3", "q4", "annual"]) {
    if (goalMatchesPeriod(period, p)) return p;
  }
  return "annual";
}
function applyGoalFromQuery() {
  const goal = route.query.goal;
  if (typeof goal !== "string" || !goal) return;
  const found = allGoals.value.find(g => g.id === goal);
  if (!found) return;
  const year = found.period.match(/\d{4}/)?.[0];
  if (year) selectedYear.value = year;
  selectedPeriod.value = periodForGoal(found.period);
  if (!expandedGoalIds.value.includes(goal)) expandedGoalIds.value.push(goal);
}

const filteredGoals = computed(() =>
  allGoals.value.filter(g =>
    g.period.includes(selectedYear.value) && goalMatchesPeriod(g.period, selectedPeriod.value)
  )
);

const periodMetricCount = computed(() => {
  const ids = new Set<string>();
  for (const g of filteredGoals.value) {
    for (const mid of goalMetricMap[g.id] || []) ids.add(mid);
  }
  return ids.size;
});
const periodAvgProgress = computed(() => {
  if (!filteredGoals.value.length) return 0;
  const total = filteredGoals.value.reduce((sum, g) => {
    const krs = g.keyResults;
    if (!krs || !krs.length) return sum;
    return sum + Math.round(krs.reduce((s, kr) => s + Number(kr.progress), 0) / krs.length);
  }, 0);
  return Math.round(total / filteredGoals.value.length);
});
function krAvg(row: GoalItem): number {
  if (!row.keyResults.length) return 0;
  return Math.round(row.keyResults.reduce((s, kr) => s + kr.progress, 0) / row.keyResults.length);
}
function krStatus(pct: number): "success" | "warning" | "exception" | undefined {
  if (pct >= 100) return "success";
  if (pct >= 70) return undefined;
  if (pct >= 40) return "warning";
  return "exception";
}

/* ════════════════════════════════════════════════ */
/* KPI 行（同 okr.vue 逻辑）＋ SLO 告警
/* ════════════════════════════════════════════════ */

function heuristicMom(seed: string, polarity: "higherBetter" | "lowerBetter" = "higherBetter") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const abs = 1 + (Math.abs(h) % 3);
  const sign = (h % 2 === 0 ? 1 : -1) * (polarity === "lowerBetter" ? -1 : 1);
  return sign * abs;
}

const totalGoals = computed(() => filteredGoals.value.length);
const activeGoals = computed(() =>
  filteredGoals.value.filter(g => {
    const s = String(g.status).toLowerCase();
    return !s.includes("archive") && !s.includes("complete");
  }).length
);
const avgKRProgress = computed(() => {
  let sum = 0; let cnt = 0;
  for (const g of filteredGoals.value) {
    for (const kr of g.keyResults ?? []) { sum += Number(kr.progress ?? 0); cnt += 1; }
  }
  return cnt ? +(sum / cnt).toFixed(1) : 0;
});
const atRiskKRs = computed(() => {
  const today = dayjs().startOf("day");
  let risk = 0;
  for (const g of filteredGoals.value) {
    let start = dayjs("2026-07-01"); let end = dayjs("2026-09-30");
    const pm = (g.period || "").match(/(\d{4})\s+Q(\d)/);
    if (pm) {
      start = dayjs(`${Number(pm[1])}-${String((Number(pm[2]) - 1) * 3 + 1).padStart(2, "0")}-01`);
      end = start.add(3, "month").subtract(1, "day");
    }
    for (const kr of g.keyResults ?? []) {
      const p = Number(kr.progress ?? 0);
      const total = Math.max(1, end.diff(start, "day"));
      const elapsed = Math.max(0, Math.min(total, today.diff(start, "day")));
      const expected = (elapsed / total) * 0.7 * 100;
      const overdue = today.isAfter(end) && p < 100;
      if ((overdue && p < 50) || p < expected) risk++;
    }
  }
  return risk;
});
const completedKRs = computed(() => {
  let n = 0;
  for (const g of filteredGoals.value) {
    for (const kr of g.keyResults ?? []) if (Number(kr.progress ?? 0) >= 100) n++;
  }
  return n;
});
/** 当前角色逾期行动项：扫描知识库文件 OKR 行动项数组 — 回退 fallback：0 */
const overdueActionsRole = ref(0);
async function refreshOverdueActions() {
  disposer.reset();
  const { signal } = createTimeoutSignal(12_000, disposer);
  try {
    const res = await scanKnowledge("okr", { timeoutMs: 12_000, signal });
    const files = res.categories?.flatMap(c => c.files) ?? [];
    let n = 0;
    const today = dayjs().startOf("day");
    for (const f of files) {
      const m = (f as KnowledgeFileEntry).meta ?? {};
      if ((m as any).type !== "okr-action") continue;
      if ((m as any).role !== props.roleId) continue;
      const deadline = typeof (m as any).deadline;
      const status = String((m as any).status ?? "");
      if (!deadline) continue;
      const d = dayjs(deadline);
      if (d.isValid() && d.isBefore(today) && status.toLowerCase() !== "done") n++;
    }
    overdueActionsRole.value = n;
  } catch {
    overdueActionsRole.value = 0;
  }
}

const showSloAlert = computed(() => atRiskKRs.value >= 3 || overdueActionsRole.value >= 5);
const sloAlertType = computed<"warning" | "error">(() =>
  atRiskKRs.value >= 5 || overdueActionsRole.value >= 8 ? "error" : "warning"
);
const sloAlertText = computed(
  () =>
    `🚨 SLO Burn-Rate 超标：${atRiskKRs.value} 个 KR 面临延误风险，${overdueActionsRole.value} 个行动项已逾期。建议启动回滚策略 L2。`
);

interface KpiRow { key: string; icon: string; title: string; value: number | string; suffix?: string; mom: number; }

const kpiList = computed<KpiRow[]>(() => [
  { key: "totalGoals", icon: "🎯", title: "目标总数", value: totalGoals.value, mom: heuristicMom(`tg-${props.roleId}-${totalGoals.value}`) },
  { key: "activeGoals", icon: "🚀", title: "进行中目标", value: activeGoals.value, mom: heuristicMom(`ag-${props.roleId}-${activeGoals.value}`) },
  { key: "avgKRProgress", icon: "📈", title: "KR 平均进度", value: avgKRProgress.value, suffix: "%", mom: heuristicMom(`akr-${props.roleId}-${avgKRProgress.value}`) },
  { key: "atRiskKRs", icon: "⚠️", title: "风险 KRs", value: atRiskKRs.value, mom: heuristicMom(`risk-${props.roleId}-${atRiskKRs.value}`, "lowerBetter") },
  { key: "completedKRs", icon: "✅", title: "已达成 KRs", value: completedKRs.value, mom: heuristicMom(`ckr-${props.roleId}-${completedKRs.value}`) },
  { key: "overdueActions", icon: "⏰", title: "逾期行动项", value: overdueActionsRole.value, mom: heuristicMom(`oa-${props.roleId}-${overdueActionsRole.value}`, "lowerBetter") },
]);

/* ════════════════════════════════════════════════ */
/* 北极星（当前角色若有 goal[0] 则用角色目标，否则 executive goal[0] */
/* ════════════════════════════════════════════════ */
const northStarGoal = computed<GoalItem | undefined>(() => {
  const own = allGoals.value[0];
  if (own) return own;
  return (goalsData["executive"] ?? [])[0];
});
const northStarKRs = computed(() => northStarGoal.value?.keyResults ?? []);
const northStarProgress = computed(() => krAvg(northStarGoal.value as GoalItem));

/* ════════════════════════════════════════════════ */
/* 5 步验证门（同 okr.vue）
/* ════════════════════════════════════════════════ */
interface GateKey { key: "kr" | "prd" | "dev" | "test" | "evidence"; abbr: string; label: string; icon: string; }
const fiveGates: GateKey[] = [
  { key: "kr", abbr: "KR", label: "Key Result 定义", icon: "🎯" },
  { key: "prd", abbr: "PRD", label: "需求评审 + 验收标准", icon: "📋" },
  { key: "dev", abbr: "Dev", label: "编码 + 构建调试", icon: "⚡" },
  { key: "test", abbr: "Test", label: "测试门禁通过", icon: "🧪" },
  { key: "evidence", abbr: "Evd", label: "证据文件沉淀", icon: "📦" },
];
function hasGateArtifact(kr: { text: string; file?: string; progress?: number }, gate: GateKey["key"]) {
  const file = (kr.file || "").toLowerCase();
  const text = (kr.text || "").toLowerCase();
  const p = Number(kr.progress ?? 0);
  switch (gate) {
    case "kr": return true;
    case "prd": return p >= 30 && (file.includes("requirement") || file.includes("prd") || file.includes("01-") || text.includes("prd") || text.includes("验收"));
    case "dev": return p >= 60 && (file.includes("build") || file.includes("debug") || file.includes("04-") || text.includes("代码") || text.includes("编码") || text.includes("构建"));
    case "test": return p >= 85 && (file.includes("test") || file.includes("05-") || file.includes("launch") || text.includes("测试") || text.includes("门禁"));
    case "evidence": return !!kr.file && p >= 95;
  }
}
const totalKRs = computed(() =>
  filteredGoals.value.reduce((s, g) => s + (g.keyResults?.length ?? 0), 0)
);
const funnelCounts = computed<number[]>(() => {
  const counts = [0, 0, 0, 0, 0];
  for (const g of filteredGoals.value) {
    for (const kr of g.keyResults ?? []) {
      fiveGates.forEach((gt, i) => { if (hasGateArtifact(kr, gt.key)) counts[i] += 1; });
    }
  }
  return counts;
});

/* ════════════════════════════════════════════════ */
/* ECharts: KR × Week Line 折线图
/* ════════════════════════════════════════════════ */
const lineChartRef = ref<HTMLDivElement | null>(null);
const lineChart = shallowRef<echarts.ECharts | null>(null);
const WEEKS = 12;
const weekLabels = computed(() => {
  const out: string[] = [];
  const end = dayjs().startOf("week").add(1, "day");
  for (let i = WEEKS - 1; i >= 0; i--) out.push(end.subtract(i, "week").format("MM-DD"));
  return out;
});
function krWeeklySeries(kr: { progress: number }, weekIdx: number, totalWeeks: number): number {
  const p = Number(kr.progress ?? 0);
  // 平滑 S 曲线：进度，末端收敛到真实 progress
  const frac = Math.min(1, (weekIdx + 1) / totalWeeks);
  const s = 1 / (1 + Math.exp(-6 * (frac - 0.5)));
  const fitted = s * p;
  // 最后一周用真实 progress
  return weekIdx === totalWeeks - 1 ? p : Math.min(p, Math.round(fitted));
}
const lineSeriesData = computed(() => {
  const series: { name: string; type: "line"; smooth: boolean; data: number[] }[] = [];
  for (const g of filteredGoals.value) {
    (g.keyResults ?? []).forEach((kr, idx) => {
      const name = `${g.id} KR${idx + 1}`;
      const data: number[] = [];
      for (let w = 0; w < WEEKS; w++) data.push(krWeeklySeries(kr, w, WEEKS));
      series.push({ name, type: "line", smooth: true, data });
    });
  }
  return series;
});
function renderLineChart() {
  if (!lineChartRef.value) return;
  try {
    if (!lineChart.value) lineChart.value = echarts.init(lineChartRef.value);
    const option: echarts.EChartsOption = {
      title: { text: "", left: "center" },
      tooltip: { trigger: "axis" },
      legend: { type: "scroll", bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 48, right: 24, top: 24, bottom: 60 },
      xAxis: { type: "category", boundaryGap: false, data: weekLabels.value, axisLabel: { fontSize: 10, rotate: 30 } },
      yAxis: { type: "value", min: 0, max: 100, axisLabel: { formatter: "{value}%" } },
      series: lineSeriesData.value as any
    };
    lineChart.value.setOption(option, true);
  } catch (e) {
    console.warn("[okrRole] line chart render failed:", e);
  }
}
watch(
  [() => props.roleId, () => filteredGoals.value.length, () => selectedPeriod.value, () => selectedYear.value, lineSeriesData],
  async () => {
    await nextTick();
    renderLineChart();
  }
);

/* ════════════════════════════════════════════════ */
/* ECharts: 5 步验证门漏斗图
/* ════════════════════════════════════════════════ */
const funnelChartRef = ref<HTMLDivElement | null>(null);
const funnelChart = shallowRef<echarts.ECharts | null>(null);
function renderFunnelChart() {
  if (!funnelChartRef.value) return;
  try {
    if (!funnelChart.value) funnelChart.value = echarts.init(funnelChartRef.value);
    const data = fiveGates.map((g, i) => ({
      name: `${g.abbr} ${g.label}`,
      value: funnelCounts.value[i] ?? 0
    }));
    const option: echarts.EChartsOption = {
      tooltip: { trigger: "item", formatter: "{b}: {c} 项 ({d}%)" },
      legend: { show: false },
      color: ["#6366f1", "#f59e0b", "#10b981", "#db2777", "#06b6d4"],
      series: [
        {
          name: "5 步验证门",
          type: "funnel",
          left: "10%",
          top: 20,
          bottom: 20,
          width: "80%",
          min: 0,
          max: Math.max(1, totalKRs.value),
          minSize: "20%",
          maxSize: "100%",
          sort: "descending",
          gap: 2,
          label: { show: true, position: "inside", formatter: "{b}\n{c}", fontSize: 11 },
          labelLine: { show: false },
          itemStyle: { borderColor: "#fff", borderWidth: 1 },
          emphasis: { label: { fontSize: 13 } },
          data
        }
      ]
    };
    funnelChart.value.setOption(option, true);
  } catch (e) {
    console.warn("[okrRole] funnel render failed:", e);
  }
}
watch(
  [() => props.roleId, funnelCounts, () => selectedPeriod.value, () => selectedYear.value, () => totalKRs.value],
  async () => {
    await nextTick();
    renderFunnelChart();
  }
);
</script>

<style scoped lang="scss">
@use "./styles/okrRole.scss";
</style>
