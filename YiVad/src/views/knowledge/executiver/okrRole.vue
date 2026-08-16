<template>
  <div class="okr-role">
    <div class="okr-role__header">
      <el-breadcrumb separator="/" class="okr-role__breadcrumb">
        <el-breadcrumb-item :to="{ path: '/home/index' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/executiver/okr' }">OKR Dashboard</el-breadcrumb-item>
        <el-breadcrumb-item>{{ role.name }} OKR</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="okr-role__role-nav">
        <button
          v-for="rid in ROLE_IDS"
          :key="rid"
          class="okr-role__role-nav-item"
          :class="{ 'is-active': rid === props.roleId }"
          @click="rid !== props.roleId && $router.push(`/executiver/okr/${rid}`)"
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
          <el-button text class="okr-role__back-btn" @click="$router.push('/executiver/okr')">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
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
      <el-table v-if="filteredGoals.length" :data="filteredGoals" stripe border style="width: 100%" row-key="id" :expand-row-keys="expandedGoalIds" @expand-change="onExpandChange">
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
                          <span class="okr-role__table-title okr-role__table-title--link" @click="openMetricFile(mr as MetricItem)">{{ mr.name }}</span>
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
              <div v-else class="okr-role__expand-empty">
                No related metrics for this goal.
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Goal" min-width="240" sortable>
          <template #default="{ row }">
            <div class="okr-role__table-item">
              <span class="okr-role__table-icon">{{ row.icon }}</span>
              <div>
                <span class="okr-role__table-title okr-role__table-title--link" @click="openGoalFile(row as GoalItem)">{{ row.title }}</span>
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
                <span class="okr-role__table-kr-text">{{ kr.text }}</span>
                <el-progress :percentage="kr.progress" :status="krStatus(kr.progress)" :stroke-width="4" style="width: 60px; min-width: 60px" />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Avg" width="70">
          <template #default="{ row }">
            <el-progress :percentage="krAvg(row as GoalItem)" :status="krStatus(krAvg(row as GoalItem))" :stroke-width="6" :show-text="true" />
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
        <div class="okr-role__weekly-card okr-role__weekly-card--done" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('done') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('done')">
            <span class="okr-role__weekly-card-icon">✅</span>
            <span class="okr-role__weekly-card-label">Accomplishments</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.done.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('done') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('done') }">
            <ul class="okr-role__weekly-card-list">
              <li v-for="(d, i) in weeklyData.done" :key="'d'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'done')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'done')">{{ d }}</span>
                  <el-button text size="small" type="primary" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(d)">Copy</el-button>
                </template>
              </li>
            </ul>
          </div>
        </div>
        <div class="okr-role__weekly-card okr-role__weekly-card--blockers" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('blockers') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('blockers')">
            <span class="okr-role__weekly-card-icon">🚧</span>
            <span class="okr-role__weekly-card-label">Blockers</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.blockers.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('blockers') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('blockers') }">
            <ul v-if="weeklyData.blockers.length" class="okr-role__weekly-card-list">
              <li v-for="(b, i) in weeklyData.blockers" :key="'b'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'blockers')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'blockers')">{{ b }}</span>
                  <el-button text size="small" type="danger" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(b)">Copy</el-button>
                </template>
              </li>
            </ul>
            <span v-else class="okr-role__weekly-card-none">No blockers this week.</span>
          </div>
        </div>
        <div class="okr-role__weekly-card okr-role__weekly-card--next" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('next') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('next')">
            <span class="okr-role__weekly-card-icon">📅</span>
            <span class="okr-role__weekly-card-label">Next Week</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.nextWeek.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('next') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('next') }">
            <ul class="okr-role__weekly-card-list">
              <li v-for="(n, i) in weeklyData.nextWeek" :key="'n'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'next')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'next')">{{ n }}</span>
                  <el-button text size="small" type="primary" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(n)">Copy</el-button>
                </template>
              </li>
            </ul>
          </div>
        </div>
        <div class="okr-role__weekly-card okr-role__weekly-card--decisions" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('decisions') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('decisions')">
            <span class="okr-role__weekly-card-icon">📝</span>
            <span class="okr-role__weekly-card-label">Key Decisions</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.decisions.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('decisions') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('decisions') }">
            <ul class="okr-role__weekly-card-list">
              <li v-for="(kd, i) in weeklyData.decisions" :key="'kd'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'decisions')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'decisions')">{{ kd }}</span>
                  <el-button text size="small" type="primary" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(kd)">Copy</el-button>
                </template>
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
import { useRoute } from "vue-router";
import { ArrowLeft, ArrowRight, Document } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { writeKnowledgeFile } from "@/api/modules/knowledgeService";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";
import {
  rolesData, goalsData, metricsData, goalMetricMap, getGoalMetrics,
  roleWeeklyDataMap, ROLE_IDS, goalRoleMap, metricRoleMap,
  type GoalItem, type MetricItem
} from "./okrData";

const props = defineProps<{ roleId: string }>();
const route = useRoute();

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
  return `okr/2026-Q3/goals/${goalRoleMap[g.id]}/${g.id}-${slugifyTitle(g.title)}.md`;
}
function metricFilePath(m: MetricItem): string {
  return `okr/2026-Q3/metrics/${metricRoleMap[m.id]}/${m.id}-${slugifyTitle(m.name)}.md`;
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
  return { type: "okr-goal", id: g.id, title: g.title, status: g.status, period: g.period, owner: g.owner, project: g.project, progress: krAvg(g) };
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
  return { type: "okr-metric", id: m.id, name: m.name, category: m.category, framework: m.framework, trend: m.trend, progress: m.progress };
}

async function openGoalFile(g: GoalItem) {
  const path = goalFilePath(g);
  try { await writeKnowledgeFile(path, renderGoalBody(g), goalMeta(g)); } catch { /* 后端不可用则直接尝试读取已存在的文件 */ }
  previewDlg.value?.open(path);
}
async function openMetricFile(m: MetricItem) {
  const path = metricFilePath(m);
  try { await writeKnowledgeFile(path, renderMetricBody(m), metricMeta(m)); } catch { /* 后端不可用则直接尝试读取已存在的文件 */ }
  previewDlg.value?.open(path);
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

const role = computed(() => rolesData[props.roleId] || rolesData.executiver);
const allGoals = computed(() => goalsData[props.roleId] || []);

const weeklyData = computed(() => roleWeeklyDataMap[props.roleId] || roleWeeklyDataMap.executiver);

// ── Weekly Report: collapse + copy ─────────────
const collapsedWeeklySections = reactive<Set<string>>(new Set());
function toggleWeeklySection(key: string) {
  if (collapsedWeeklySections.has(key)) collapsedWeeklySections.delete(key);
  else collapsedWeeklySections.add(key);
}
async function copyWeeklyItem(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success("Copied to clipboard");
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
  lines.push(...w.done.map(d => `- ${d}`));
  lines.push("", "## 🚧 Blockers", "");
  if (w.blockers.length) lines.push(...w.blockers.map(b => `- ${b}`));
  else lines.push("- None");
  lines.push("", "## 📅 Next Week", "");
  lines.push(...w.nextWeek.map(n => `- ${n}`));
  lines.push("", "## 📝 Key Decisions", "");
  lines.push(...w.decisions.map(d => `- ${d}`));
  return lines.join("\n");
}

async function openWeeklyFile() {
  const w = weeklyData.value;
  const path = weeklyFilePath();
  try {
    await writeKnowledgeFile(path, renderWeeklyBody(), { type: "okr-weekly", role: props.roleId, week: weekRangeLabel.value, status: w.status });
  } catch { /* 后端不可用则直接尝试读取已存在的文件 */ }
  previewDlg.value?.open(path);
}

// ── Inline Editing ──────────────────────────────
const editingTarget = ref<{ section: string; card?: string; index: number } | null>(null);
const editingText = ref("");
function startEdit(section: string, index: number, card?: string) {
  editingTarget.value = { section, card, index };
  if (section === "weekly" && card) {
    const w = weeklyData.value;
    const arr = card === "done" ? w.done : card === "blockers" ? w.blockers : card === "next" ? w.nextWeek : w.decisions;
    editingText.value = arr[index];
  }
}
function saveEdit() {
  if (!editingTarget.value) return;
  const { card, index } = editingTarget.value;
  if (card) {
    const w = weeklyData.value;
    const arr = card === "done" ? w.done : card === "blockers" ? w.blockers : card === "next" ? w.nextWeek : w.decisions;
    arr[index] = editingText.value;
  }
  editingTarget.value = null;
  ElMessage.success("Saved");
}
function cancelEdit() {
  editingTarget.value = null;
}
function isEditing(section: string, index: number, card?: string): boolean {
  const t = editingTarget.value;
  return !!t && t.section === section && t.index === index && t.card === card;
}

watch(() => props.roleId, () => {
  selectedPeriod.value = "q3";
  selectedYear.value = String(dayjs().year());
  expandedGoalIds.value = [];
  const container = document.querySelector(".okr-role");
  if (container) container.scrollTop = 0;
  applyGoalFromQuery();
});

onMounted(applyGoalFromQuery);

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
  return allGoals.value.filter(g =>
    g.period.includes(selectedYear.value) && goalMatchesPeriod(g.period, selectedPeriod.value)
  );
});

const periodMetricCount = computed(() => {
  const metricIds = new Set<string>();
  for (const g of filteredGoals.value) {
    for (const mid of (goalMetricMap[g.id] || [])) {
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
.okr-role {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; overflow: auto;
  background: var(--el-bg-color-page);
}
.okr-role__header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 24px 10px;
  background: var(--el-bg-color-page);
}
.okr-role__breadcrumb { flex-shrink: 0; }

// ── Sticky Header Bar ──────────────────────────
.okr-role__sticky-bar {
  position: sticky; top: 40px; z-index: 9;
  margin: 0 24px; padding: 10px 20px 12px;
  background: var(--el-bg-color); border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  backdrop-filter: blur(8px);
}
.okr-role__sticky-top {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.okr-role__sticky-left { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.okr-role__back-btn { padding: 4px 8px; }
.okr-role__sticky-icon { font-size: 24px; }
.okr-role__sticky-info { display: flex; flex-direction: column; gap: 0; }
.okr-role__sticky-name { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.2; }
.okr-role__sticky-center { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.okr-role__year-select { width: 96px; }
.okr-role__sticky-right { display: flex; gap: 6px; flex-shrink: 0; }

.okr-role__role-nav {
  display: flex; flex-wrap: wrap; gap: 6px;
  justify-content: flex-end;
}
.okr-role__role-nav-item {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 16px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color); cursor: pointer; font-size: 12px;
  color: var(--el-text-color-regular);
  transition: all .15s;
  &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); }
  &.is-active { background: var(--el-color-primary); border-color: var(--el-color-primary); color: #fff; }
}
.okr-role__role-nav-icon { font-size: 13px; }

.okr-role__stat-pill {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 16px; border-radius: 8px; background: var(--el-fill-color-light);
  min-width: 64px;
}
.okr-role__stat-pill--accent { background: var(--el-color-primary-light-9); }
.okr-role__stat-pill-value { font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); line-height: 1.1; }
.okr-role__stat-pill--accent .okr-role__stat-pill-value { color: var(--el-color-primary); }
.okr-role__stat-pill-label { font-size: 10px; color: var(--el-text-color-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }

// ── Sections ───────────────────────────────────
.okr-role__section {
  padding: 0 24px; margin-bottom: 8px;
  &:first-of-type { margin-top: 12px; }
  h2 { margin: 0; font-size: 16px; font-weight: 700; }
}
.okr-role__section-head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
  h2 { margin: 0; }
}
.okr-role__section-count { font-size: 12px; color: var(--el-text-color-secondary); font-weight: 600; }
.okr-role__section-desc { margin: 0 0 14px; font-size: 12px; color: var(--el-text-color-secondary); max-width: 800px; line-height: 1.5; }
.okr-role__week-range { display: flex; align-items: center; gap: 2px; }
.okr-role__week-nav { padding: 2px; }
.okr-role__week-input { width: 150px; }
.okr-role__section-action { margin-left: auto; }
.okr-role__copy-btn { margin-left: auto; flex-shrink: 0; font-size: 12px; }

// ── Empty State ───────────────────────────────
.okr-role__empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 48px 24px; text-align: center;
}
.okr-role__empty-icon { font-size: 40px; opacity: .6; }
.okr-role__empty-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--el-text-color-secondary); }
.okr-role__empty-desc { margin: 0; font-size: 13px; color: var(--el-text-color-placeholder); max-width: 400px; line-height: 1.5; }

// ── Table ──────────────────────────────────────
.okr-role__table-item { display: flex; align-items: flex-start; gap: 8px; }
.okr-role__table-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.okr-role__table-title { font-weight: 600; font-size: 13px; display: block; }
.okr-role__table-title--link { cursor: pointer; color: var(--el-color-primary); transition: color .15s; &:hover { color: var(--el-color-primary-light-3); text-decoration: underline; } }
.okr-role__table-desc { margin: 2px 0 0; font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.okr-role__table-krs { display: flex; flex-direction: column; gap: 5px; padding: 2px 0; }
.okr-role__table-kr { display: flex; align-items: center; gap: 6px; font-size: 11px; }
.okr-role__table-kr-num { font-weight: 700; font-family: monospace; color: var(--el-color-primary); white-space: nowrap; font-size: 10px; min-width: 28px; }
.okr-role__table-kr-text { flex: 1; color: var(--el-text-color-regular); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.okr-role__table-value { font-weight: 700; font-size: 14px; color: var(--el-color-primary); }
.okr-role__table-target { font-weight: 600; font-size: 13px; color: var(--el-color-success); }
.okr-role__table-progress { display: flex; align-items: center; gap: 8px; }

:deep(.el-table__body tr) { transition: background-color .15s ease; }
:deep(.el-table__body tr:hover > td) { background-color: var(--el-color-primary-light-9) !important; }

.okr-role__expand {
  padding: 16px 24px; background: var(--el-fill-color-lighter);
  animation: okr-expand-in .2s ease;
}
@keyframes okr-expand-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.okr-role__expand-title { margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary); }
.okr-role__expand-empty { font-size: 13px; color: var(--el-text-color-placeholder); font-style: italic; padding: 8px 0; }

.okr-role__inline-input { flex: 1; }

// ── Weekly Report Cards ────────────────────────
.okr-role__weekly-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.okr-role__weekly-card {
  border-radius: 10px; overflow: hidden;
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  transition: box-shadow .2s, border-color .2s;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.06); }
}
.okr-role__weekly-card-head {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .3px;
  cursor: pointer; user-select: none; transition: opacity .15s;
  &:hover { opacity: .85; }
}
.okr-role__weekly-card--done .okr-role__weekly-card-head { background: var(--el-color-success-light-9); color: var(--el-color-success); }
.okr-role__weekly-card--blockers .okr-role__weekly-card-head { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
.okr-role__weekly-card--next .okr-role__weekly-card-head { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.okr-role__weekly-card--decisions .okr-role__weekly-card-head { background: #f3e8ff; color: #7c3aed; }
.okr-role__weekly-card-icon { font-size: 15px; }
.okr-role__weekly-card-count { font-size: 11px; padding: 0 6px; border-radius: 8px; margin-left: auto; background: rgba(255,255,255,.35); line-height: 1.6; }
.okr-role__weekly-card-toggle { font-size: 12px; opacity: .7; margin-left: 2px; }
.okr-role__weekly-card-list { margin: 0; padding: 10px 14px 12px 30px; display: flex; flex-direction: column; gap: 5px; }
.okr-role__weekly-card-body {
  overflow: hidden; max-height: 600px;
  transition: max-height .3s ease, padding .3s ease;
}
.okr-role__weekly-card-body--collapsed { max-height: 0; padding: 0; }
.okr-role__weekly-card-item {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
  font-size: 13px; line-height: 1.5; color: var(--el-text-color-regular);
  padding: 2px 0; border-radius: 4px; transition: background .15s;
  &:hover { background: var(--el-fill-color-light); }
  .okr-role__weekly-card-copy { opacity: 0; transition: opacity .15s; flex-shrink: 0; font-size: 11px; }
  &:hover .okr-role__weekly-card-copy { opacity: 1; }
}
.okr-role__weekly-card-none { display: block; padding: 10px 14px 12px; font-size: 12px; color: var(--el-text-color-placeholder); font-style: italic; }
.okr-role__weekly-card--collapsed .okr-role__weekly-card-head { opacity: .7; }

// ── Divider ────────────────────────────────────
.okr-role__section + .el-divider { margin: 0 24px; width: auto; }
</style>