<template>
  <div class="okr-role">
    <div class="okr-role__header">
      <div class="okr-role__role-nav">
        <button
          v-for="rid in ROLE_IDS"
          :key="rid"
          class="okr-role__role-nav-item"
          :class="{ 'is-active': rid === props.roleId }"
          @click="rid !== props.roleId && $router.push(`/knowledge/executive/okr?role=${rid}`)"
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
                        {{ mr.trend === "up" ? "↑" : mr.trend === "down" ? "↓" : "→" }}
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
                  :title="kr.file ? `证据文件：${kr.file}` : undefined"
                  @click="kr.file && openKrFile(kr)"
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

    <section class="okr-role__section">
      <div class="okr-role__section-head">
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
        <el-button size="small" type="primary" plain class="okr-role__section-action" @click="openWeeklyFile">
          <el-icon><Document /></el-icon>
          <span>Open File</span>
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
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has("done") ? "▸" : "▾" }}</span>
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
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has("blockers") ? "▸" : "▾" }}</span>
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
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has("next") ? "▸" : "▾" }}</span>
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
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has("decisions") ? "▸" : "▾" }}</span>
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
import { computed, reactive, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, ArrowRight, Document } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { writeKnowledgeFile, scanKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
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
  type WeeklyItem
} from "./okrData";
import { getIssueList } from "@/api/modules/issueService";

const props = defineProps<{ roleId: string }>();
const route = useRoute();
const router = useRouter();

// ── Goal → 闭环记录（loop-record）深链 ──────────────────────────
// 扫描 okr 目录中的 loop-record 文件，按 goalId 归组出每条目标所属的闭环，
// 供目标行提供「🔁 N 闭环」链接，跳转到 /knowledge/executive/processRecord?goal=。
const loopIdsByGoal = ref<Record<string, string[]>>({});

async function loadLoopLinks() {
  try {
    const res = await scanKnowledge("okr");
    const files = res.categories?.flatMap(c => c.files) ?? [];
    const map: Record<string, string[]> = {};
    for (const f of files) {
      const m = (f as KnowledgeFileEntry).meta ?? {};
      if (m.type !== "loop-record") continue;
      const goalId = typeof m.goalId === "string" ? m.goalId : "";
      const loopId = typeof m.loopId === "string" ? m.loopId : "";
      if (!goalId || !loopId) continue;
      if (!map[goalId]) map[goalId] = [];
      if (!map[goalId].includes(loopId)) map[goalId].push(loopId);
    }
    loopIdsByGoal.value = map;
  } catch {
    loopIdsByGoal.value = {};
  }
}

function goalLoops(goalId: string): string[] {
  return loopIdsByGoal.value[goalId] || [];
}

/** 深链到该目标全部闭环记录（processRecord 按 ?goal= 过滤）。 */
function goGoalLoops(goalId: string) {
  router.push(`/knowledge/executive/processRecord?goal=${goalId}`);
}

// ── Goal → 执行 issues（PM 系统）深链 ────────────────────────────
// 反向闭环：目标行提供「🎯 N 执行」链接，跳转到 /issue?goal= 过滤的 issue 列表。
// 数据来自 MongoDB `issues` 集合（goal_id 桥接字段），由 PM 系统维护。
const issueCountByGoal = ref<Record<string, number>>({});

async function loadIssueCounts() {
  try {
    const res = await getIssueList({ pageSize: 1000 });
    const list = res.data?.list ?? [];
    const map: Record<string, number> = {};
    for (const it of list) {
      const goalId = (it as { goal_id?: string }).goal_id;
      if (goalId) map[goalId] = (map[goalId] ?? 0) + 1;
    }
    issueCountByGoal.value = map;
  } catch {
    issueCountByGoal.value = {};
  }
}

function goalIssueCount(goalId: string): number {
  return issueCountByGoal.value[goalId] ?? 0;
}

/** 深链到该目标的执行 issue 列表（issue 列表按 ?goal= 过滤）。 */
function goGoalIssues(goalId: string) {
  router.push(`/issue?goal=${goalId}`);
}

const selectedPeriod = ref("q3");
const selectedYear = ref(String(dayjs().year()));
const availableYears = computed(() => {
  const y = dayjs().year();
  return [y - 2, y - 1, y, y + 1].map(String);
});
function onYearChange() {
  selectedPeriod.value = "annual";
}

// ── Goal row expansion (goal detail is inline, not a separate route) ──────────
const expandedGoalIds = ref<string[]>([]);
function onExpandChange(_row: GoalItem, expandedRows: GoalItem[] | boolean) {
  if (Array.isArray(expandedRows)) expandedGoalIds.value = expandedRows.map(r => r.id);
}

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

// ── Goal / Metric → 知识库文件（okr 目录）→ 文件预览弹框 ──
/** 标题 → 文件名可读 slug（与 okr.vue / OkrRecommendPanel.vue 的 slugifyTitle 保持一致）。 */
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
  const role = metricRoleMap[m.id];
  let goalId = "";
  for (const [gId, mIds] of Object.entries(goalMetricMap)) {
    if (mIds.includes(m.id)) {
      goalId = gId;
      break;
    }
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
  try {
    await writeKnowledgeFile(path, renderGoalBody(g), goalMeta(g));
  } catch {
    /* 后端不可用则直接尝试读取已存在的文件 */
  }
  previewDlg.value?.open(path);
}
async function openMetricFile(m: MetricItem) {
  const path = metricFilePath(m);
  try {
    await writeKnowledgeFile(path, renderMetricBody(m), metricMeta(m));
  } catch {
    /* 后端不可用则直接尝试读取已存在的文件 */
  }
  previewDlg.value?.open(path);
}
/** KR → 证据文件（loop 记录 / 任务记录 / 模板 / 角色文档）→ 文件预览弹框。 */
function openKrFile(kr: KeyResult) {
  if (!kr.file) return;
  previewDlg.value?.open(kr.file);
}

/** 当前选中的周（默认本周一）。 */
const selectedWeek = ref(dayjs().startOf("week").add(1, "day").toDate());
function shiftWeek(delta: number) {
  selectedWeek.value = dayjs(selectedWeek.value).add(delta, "week").toDate();
}
/** 周报区间（周一 → 周五），随 selectedWeek 变化。 */
const weekRangeLabel = computed(() => {
  const mon = dayjs(selectedWeek.value).startOf("week").add(1, "day");
  const fri = mon.add(4, "day");
  return `${mon.format("YYYY-MM-DD")} → ${fri.format("YYYY-MM-DD")}`;
});
/** 是否当前周：仅当前周有周报数据，其余周展示空态。 */
const isCurrentWeek = computed(() => {
  const thisMonday = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
  const selMonday = dayjs(selectedWeek.value).startOf("week").add(1, "day").format("YYYY-MM-DD");
  return thisMonday === selMonday;
});

const role = computed(() => rolesData[props.roleId] || rolesData.executive);
const allGoals = computed(() => goalsData[props.roleId] || []);

const weeklyData = computed(() => roleWeeklyDataMap[props.roleId] || roleWeeklyDataMap.executive);

// ── Weekly Report: collapse ─────────────
const collapsedWeeklySections = reactive<Set<string>>(new Set());
function toggleWeeklySection(key: string) {
  if (collapsedWeeklySections.has(key)) collapsedWeeklySections.delete(key);
  else collapsedWeeklySections.add(key);
}
/** 周报条目 → 证据文件（loop 记录 / 任务记录 / 模板 / 角色文档）→ 文件预览弹框。 */
function openWeeklyItemFile(item: WeeklyItem) {
  if (!item.file) return;
  previewDlg.value?.open(item.file);
}
// ── Weekly Report → 知识库文件（okr 目录）→ 文件预览弹框 ──
/** `YYYY-MM` → 归档季度目录名 `YYYY-Qn`。 */
function quarterDir(monthDir: string): string {
  return `${monthDir.slice(0, 4)}-Q${Math.ceil(Number(monthDir.slice(5, 7)) / 3)}`;
}
function weeklyFilePath(): string {
  const monday = dayjs(selectedWeek.value).startOf("week").add(1, "day").format("YYYY-MM-DD");
  const monthDir = monday.slice(0, 7);
  return `okr/${quarterDir(monthDir)}/${monthDir}/weekly/${props.roleId}-${monday}.md`;
}

function renderWeeklyBody(): string {
  const w = weeklyData.value;
  const r = role.value;
  const goals = allGoals.value;
  const metrics = metricsData[props.roleId] || [];

  const lines: string[] = [
    `# Weekly Report — ${r.name}`,
    "",
    `**${weekRangeLabel.value}** · Status: **${w.status}**`,
    "",
    "## 🎯 OKR Snapshot",
    "",
    `- Goals: ${goals.length}`,
    `- Overall progress: ${periodAvgProgress.value}%`
  ];

  if (goals.length) {
    lines.push("", "### Goals", "", "| Goal | Status | Period | Progress |", "|---|---|---|---|");
    goals.forEach(g => lines.push(`| ${g.icon} ${g.title} | ${g.status} | ${g.period} | ${krAvg(g)}% |`));
  }
  if (metrics.length) {
    lines.push("", "### Metrics", "", "| Metric | Current | Target | Progress |", "|---|---|---|---|");
    metrics.forEach(m => lines.push(`| ${m.icon} ${m.name} | ${m.current}${m.unit} | ${m.target}${m.unit} | ${m.progress}% |`));
  }

  lines.push("", "## ✅ Accomplishments", "");
  lines.push(...w.done.map(d => `- ${d.text}`));
  lines.push("", "## 🚧 Blockers", "");
  if (w.blockers.length) lines.push(...w.blockers.map(b => `- ${b.text}`));
  else lines.push("- None");
  lines.push("", "## 📅 Next Week", "");
  lines.push(...w.nextWeek.map(n => `- ${n.text}`));
  lines.push("", "## 📝 Key Decisions", "");
  lines.push(...w.decisions.map(d => `- ${d.text}`));
  return lines.join("\n");
}

async function openWeeklyFile() {
  const w = weeklyData.value;
  const path = weeklyFilePath();
  try {
    await writeKnowledgeFile(path, renderWeeklyBody(), {
      type: "okr-weekly",
      role: props.roleId,
      week: weekRangeLabel.value,
      status: w.status
    });
  } catch {
    /* 后端不可用则直接尝试读取已存在的文件 */
  }
  previewDlg.value?.open(path);
}

watch(
  () => props.roleId,
  () => {
    selectedPeriod.value = "q3";
    selectedYear.value = String(dayjs().year());
    expandedGoalIds.value = [];
    const container = document.querySelector(".okr-role");
    if (container) container.scrollTop = 0;
    applyGoalFromQuery();
  }
);

onMounted(() => {
  applyGoalFromQuery();
  loadLoopLinks();
  loadIssueCounts();
});

function goalMatchesPeriod(period: string, selected: string): boolean {
  if (selected === "annual") return true;
  const qMap: Record<string, string[]> = {
    q1: ["Q1", "H1"],
    q2: ["Q2", "H1"],
    q3: ["Q3", "H2"],
    q4: ["Q4", "H2"]
  };
  const patterns = qMap[selected] || [];
  return patterns.some(p => period.includes(p));
}

/** 由目标 period 反推应选中的 period 分组（供 ?goal= 深链自动定位用）。 */
function periodForGoal(period: string): string {
  for (const p of ["q1", "q2", "q3", "q4", "annual"]) {
    if (goalMatchesPeriod(period, p)) return p;
  }
  return "annual";
}

/** 读路由 ?goal= 参数：切换到该目标所在分组并自动展开该行。 */
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

const filteredGoals = computed(() => {
  return allGoals.value.filter(g => g.period.includes(selectedYear.value) && goalMatchesPeriod(g.period, selectedPeriod.value));
});

const periodMetricCount = computed(() => {
  const metricIds = new Set<string>();
  for (const g of filteredGoals.value) {
    for (const mid of goalMetricMap[g.id] || []) {
      metricIds.add(mid);
    }
  }
  return metricIds.size;
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
</script>


<style scoped lang="scss">
@use "./styles/okrRole.scss";
</style>
