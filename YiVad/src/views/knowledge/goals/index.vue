<template>
  <div class="goals page" v-loading="loading">
    <!-- Header -->
    <header class="goals__header">
      <div class="goals__header-left">
        <h1 class="goals__title">Goals &amp; Objectives</h1>
        <el-tag size="small" type="info" effect="plain">{{ totalGoals }} objectives · {{ roleList.length }} roles</el-tag>
        <el-tag v-if="liveLastScan" size="small" type="success" effect="plain">live</el-tag>
        <span v-if="lastUpdated" class="goals__updated">Updated {{ fmtTime(lastUpdated) }}</span>
      </div>
      <div class="goals__header-center">
        <el-select v-model="selectedYear" size="small" class="goals__year-select">
          <el-option v-for="y in availableYears" :key="y" :label="String(y)" :value="y" />
        </el-select>
        <el-radio-group v-model="selectedPeriod" size="small">
          <el-radio-button value="q1">Q1</el-radio-button>
          <el-radio-button value="q2">Q2</el-radio-button>
          <el-radio-button value="q3">Q3</el-radio-button>
          <el-radio-button value="q4">Q4</el-radio-button>
          <el-radio-button value="annual">{{ selectedYear }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="goals__header-right">
        <el-button size="small" :icon="Refresh" @click="load" :loading="loading">Refresh</el-button>
        <el-button size="small" text type="primary" :icon="Tickets" @click="go('/issue')">Issues</el-button>
        <el-button size="small" text type="primary" :icon="House" @click="go('/home/index')">Home</el-button>
        <el-button size="small" text type="primary" :icon="Aim" @click="go('/knowledge/executive/okr')">OKR Dashboard</el-button>
      </div>
    </header>

    <KnowledgeError v-if="error" :message="error" @retry="load" />

    <template v-else-if="!loading">
      <!-- Summary Stats -->
      <section class="goals__stats">
        <div class="goals__stat-card">
          <div class="goals__stat-icon" style="background:#e8f4fd;color:#1677ff">🎯</div>
          <div class="goals__stat-body">
            <span class="goals__stat-value">{{ totalGoals }}</span>
            <span class="goals__stat-label">Total Goals</span>
          </div>
        </div>
        <div class="goals__stat-card">
          <div class="goals__stat-icon" :style="avgProgress >= 75 ? 'background:#e6f9e6;color:#10b981' : avgProgress >= 40 ? 'background:#fef3e2;color:#e6a23c' : 'background:#fef0f0;color:#f56c6c'">📊</div>
          <div class="goals__stat-body">
            <span class="goals__stat-value">{{ avgProgress }}%</span>
            <span class="goals__stat-label">Avg Progress</span>
          </div>
        </div>
        <div class="goals__stat-card">
          <div class="goals__stat-icon" style="background:#e6f9e6;color:#10b981">✅</div>
          <div class="goals__stat-body">
            <span class="goals__stat-value">{{ statusCounts.done + statusCounts.active }}</span>
            <span class="goals__stat-label">On Track</span>
          </div>
        </div>
        <div class="goals__stat-card">
          <div class="goals__stat-icon" :style="statusCounts.blocked ? 'background:#fef0f0;color:#f56c6c' : 'background:#f5f5f5;color:#909399'">⚠️</div>
          <div class="goals__stat-body">
            <span class="goals__stat-value">{{ statusCounts.blocked }}</span>
            <span class="goals__stat-label">Blocked</span>
          </div>
        </div>
      </section>

      <!-- Charts -->
      <section v-if="totalGoals" class="goals__charts">
        <div class="goals-chart">
          <div class="goals-chart__title">Progress Distribution</div>
          <div class="goals-chart__body">
            <ECharts :option="progressDonutOption" height="200" />
          </div>
        </div>
        <div class="goals-chart">
          <div class="goals-chart__title">Role Progress</div>
          <div class="goals-chart__body">
            <ECharts :option="roleProgressBarOption" height="200" />
          </div>
        </div>
        <div class="goals-chart">
          <div class="goals-chart__title">Status Breakdown</div>
          <div class="goals-chart__body">
            <ECharts :option="statusDonutOption" height="200" />
          </div>
        </div>
        <div class="goals-chart">
          <div class="goals-chart__title">Goals per Role</div>
          <div class="goals-chart__body">
            <ECharts :option="goalsPerRoleBarOption" height="200" />
          </div>
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="!roleList.length" class="goals__empty">
        <el-result icon="info" title="No goals found" sub-title="No OKR data for the selected period. Try a different year or quarter." />
      </div>

      <!-- Role Sections -->
      <section v-for="role in roleList" :key="role.id" class="goals__role">
        <div class="goals__role-head" @click="go(`/knowledge/executive/okr?role=${role.id}`)">
          <span class="goals__role-icon">{{ role.icon }}</span>
          <div class="goals__role-info">
            <span class="goals__role-name">{{ role.name }}</span>
            <span class="goals__role-desc">{{ role.description }}</span>
          </div>
          <div class="goals__role-meta">
            <span class="goals__role-goal-count">{{ goalsByRole(role.id).length }} goals</span>
            <span class="goals__role-progress">{{ roleAvgProgress(role.id) }}%</span>
          </div>
          <el-icon class="goals__role-arrow"><ArrowRight /></el-icon>
        </div>

        <div v-if="!goalsByRole(role.id).length" class="goals__role-empty">
          No goals in this period.
        </div>

        <div v-else class="goals__grid">
          <el-card
            v-for="g in goalsByRole(role.id)"
            :key="g.id"
            class="goals__card"
            shadow="hover"
            @click="go(`/knowledge/executive/okr?role=${role.id}&goal=${g.id}`)"
          >
            <div class="goals__card-top">
              <span class="goals__card-icon">{{ g.icon }}</span>
              <code class="goals__card-id">{{ g.id }}</code>
              <el-tag :type="statusType(g.status)" size="small" effect="light">{{ g.status }}</el-tag>
            </div>
            <div class="goals__card-title">{{ g.title }}</div>
            <div class="goals__card-desc">{{ g.description }}</div>
            <div class="goals__card-meta">
              <span>{{ g.project }}</span>
              <span class="goals__card-meta-sep">·</span>
              <span>{{ g.owner }}</span>
            </div>
            <div class="goals__card-krs">
              <div v-for="kr in g.keyResults" :key="kr.text" class="goals__kr">
                <div class="goals__kr-head">
                  <span class="goals__kr-text">{{ kr.text }}</span>
                  <span class="goals__kr-pct" :class="{ 'is-done': kr.progress >= 100 }">{{ kr.progress }}%</span>
                  <el-icon v-if="kr.file" class="goals__kr-file" @click.stop="openEvidence(kr.file)"><Document /></el-icon>
                </div>
                <el-progress
                  :percentage="kr.progress"
                  :stroke-width="5"
                  :color="kr.progress >= 100 ? '#10b981' : '#1677ff'"
                />
              </div>
            </div>
            <div class="goals__card-footer">
              <el-progress
                :percentage="goalAvg(g)"
                :stroke-width="8"
                :color="goalAvg(g) >= 100 ? '#10b981' : goalAvg(g) >= 50 ? '#1677ff' : '#e6a23c'"
                :format="() => `${goalAvg(g)}%`"
              />
            </div>
          </el-card>
        </div>
      </section>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="knowledgeGoals">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { House, Aim, ArrowRight, Refresh, Document, Tickets } from "@element-plus/icons-vue";
import { fetchRoles, fetchGoals, fetchLiveGoals } from "@/api/modules/okrService";
import type { OkrRole, OkrGoal, LiveGoal, LiveRole } from "@/api/modules/okrService";
import {
  ROLE_IDS,
  rolesData,
  goalsData,
  goalRoleMap
} from "@/views/knowledge/executive/okrData";
import type { GoalItem } from "@/views/knowledge/executive/okrData";
import KnowledgeError from "@/views/knowledge/components/KnowledgeError.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { timeAgo } from "@/utils/time";

const router = useRouter();
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

// ── Period filter ──────────────────────────────
const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const selectedYear = ref(currentYear);
const selectedPeriod = ref<"q1" | "q2" | "q3" | "q4" | "annual">("q3");

// ── Data state ─────────────────────────────────
const loading = ref(true);
const error = ref<string | null>(null);
const apiRoles = ref<OkrRole[]>([]);
const apiGoals = ref<OkrGoal[]>([]);
const liveRoles = ref<LiveRole[]>([]);
const liveGoals = ref<LiveGoal[]>([]);
const liveLastScan = ref<string>("");
const lastUpdated = ref<number | null>(null);
let pollTimer: ReturnType<typeof setInterval> | null = null;
const POLL_MS = 60_000;

// ── Unified role type ──────────────────────────
interface UnifiedRole {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// ── Unified goal type ──────────────────────────
interface UnifiedGoal {
  id: string;
  roleId: string;
  icon: string;
  title: string;
  status: string;
  description: string;
  period: string;
  owner: string;
  project: string;
  keyResults: { text: string; progress: number; file?: string }[];
}

function isCurrentPeriod(period: string): boolean {
  const p = period.toLowerCase();
  const y = String(selectedYear.value);
  if (selectedPeriod.value === "annual") return p.includes(y);
  const q = selectedPeriod.value.toUpperCase();
  return p.includes(y) && p.includes(q);
}

function toUnifiedGoal(g: OkrGoal): UnifiedGoal {
  return {
    id: g.key,
    roleId: g.role || goalRoleMap[g.key] || "",
    icon: g.icon,
    title: g.title,
    status: g.status,
    description: g.description,
    period: g.period,
    owner: g.owner,
    project: g.project,
    keyResults: g.keyResults ?? []
  };
}

function liveGoalToUnified(g: LiveGoal): UnifiedGoal {
  return {
    id: g.key,
    roleId: g.role,
    icon: g.icon,
    title: g.title,
    status: g.status,
    description: g.description,
    period: g.period,
    owner: g.owner,
    project: g.project,
    keyResults: g.keyResults ?? []
  };
}

function staticGoalToUnified(roleId: string, g: GoalItem): UnifiedGoal {
  return {
    id: g.id,
    roleId,
    icon: g.icon,
    title: g.title,
    status: g.status,
    description: g.description,
    period: g.period,
    owner: g.owner,
    project: g.project,
    keyResults: g.keyResults ?? []
  };
}

// ── Derived data ───────────────────────────────
const roleList = computed<UnifiedRole[]>(() => {
  if (liveRoles.value.length) {
    return liveRoles.value.map(r => ({ id: r.key, name: r.name, icon: r.icon, description: r.description }));
  }
  if (apiRoles.value.length) {
    return apiRoles.value.map(r => ({ id: r.key, name: r.name, icon: r.icon, description: r.description }));
  }
  return ROLE_IDS.map(id => {
    const r = rolesData[id];
    return r ? { id: r.id, name: r.name, icon: r.icon, description: r.description } : null;
  }).filter(Boolean) as UnifiedRole[];
});

const allUnifiedGoals = computed<UnifiedGoal[]>(() => {
  if (liveGoals.value.length) {
    return liveGoals.value.map(liveGoalToUnified);
  }
  if (apiGoals.value.length) {
    return apiGoals.value.map(toUnifiedGoal);
  }
  const out: UnifiedGoal[] = [];
  for (const roleId of ROLE_IDS) {
    for (const g of goalsData[roleId] || []) {
      out.push(staticGoalToUnified(roleId, g));
    }
  }
  return out;
});

const filteredGoals = computed(() =>
  allUnifiedGoals.value.filter(g => isCurrentPeriod(g.period))
);

const totalGoals = computed(() => filteredGoals.value.length);

const avgProgress = computed(() => {
  if (!filteredGoals.value.length) return 0;
  return Math.round(filteredGoals.value.reduce((s, g) => s + goalAvg(g), 0) / filteredGoals.value.length);
});

const statusCounts = computed(() => {
  const counts: Record<string, number> = { active: 0, done: 0, blocked: 0, planned: 0 };
  for (const g of filteredGoals.value) {
    counts[g.status] = (counts[g.status] || 0) + 1;
  }
  return counts;
});

function goalsByRole(roleId: string): UnifiedGoal[] {
  return filteredGoals.value.filter(g => g.roleId === roleId);
}

function roleAvgProgress(roleId: string): number {
  const goals = goalsByRole(roleId);
  if (!goals.length) return 0;
  return Math.round(goals.reduce((s, g) => s + goalAvg(g), 0) / goals.length);
}

function goalAvg(goal: UnifiedGoal): number {
  if (!goal.keyResults.length) return 0;
  return Math.round(goal.keyResults.reduce((s, kr) => s + kr.progress, 0) / goal.keyResults.length);
}

function statusType(status: string): "primary" | "success" | "info" | "danger" {
  if (status === "active") return "primary";
  if (status === "done") return "success";
  if (status === "blocked") return "danger";
  return "info";
}

function fmtTime(ts: number): string { return timeAgo(ts); }

// ── Chart options ──────────────────────────────
const ROLE_COLOR_MAP: Record<string, string> = {
  executive: "#ee6666", product: "#fac858", leader: "#73c0de",
  engineer: "#5470c6", sre: "#ea7ccc", aier: "#91cc75", curator: "#3ba272"
};

const progressDonutOption = computed<ECOption>(() => {
  const buckets = { "0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0, "Done": 0 };
  for (const g of filteredGoals.value) {
    const pct = goalAvg(g);
    if (pct >= 100) buckets["Done"]++;
    else if (pct >= 75) buckets["75-100%"]++;
    else if (pct >= 50) buckets["50-75%"]++;
    else if (pct >= 25) buckets["25-50%"]++;
    else buckets["0-25%"]++;
  }
  const colors: Record<string, string> = { "Done": "#10b981", "75-100%": "#1677ff", "50-75%": "#e6a23c", "25-50%": "#f56c6c", "0-25%": "#dc2626" };
  const data = Object.entries(buckets).filter(([,v]) => v > 0).map(([k,v]) => ({ name: k, value: v, itemStyle: { color: colors[k] } }));
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} goals ({d}%)" },
    series: [{ type: "pie", radius: ["45%", "72%"], center: ["50%", "45%"], label: { show: false }, data }]
  };
});

const roleProgressBarOption = computed<ECOption>(() => {
  const items = roleList.value
    .map(r => ({ name: r.name, icon: r.icon, pct: roleAvgProgress(r.id) }))
    .sort((a, b) => b.pct - a.pct);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (p: any) => `${p[0].name}: ${p[0].value}%` },
    grid: { left: 4, right: 16, top: 4, bottom: 4, containLabel: true },
    xAxis: { type: "value", max: 100, axisLabel: { fontSize: 9, formatter: "{value}%" } },
    yAxis: { type: "category", data: items.map(i => i.icon + " " + i.name), axisLabel: { fontSize: 10 }, inverse: true },
    series: [{
      type: "bar",
      data: items.map((i, idx) => ({ value: i.pct, itemStyle: { color: ROLE_COLOR_MAP[roleList.value.find(r => r.name === i.name)?.id || ""] || "#909399", borderRadius: [0, 3, 3, 0] } })),
      barMaxWidth: 18,
      label: { show: true, position: "right", fontSize: 9, formatter: "{c}%" }
    }]
  };
});

const statusDonutOption = computed<ECOption>(() => {
  const labels: Record<string, string> = { active: "Active", done: "Done", blocked: "Blocked", planned: "Planned" };
  const colors: Record<string, string> = { active: "#1677ff", done: "#10b981", blocked: "#f56c6c", planned: "#909399" };
  const data = Object.entries(statusCounts.value)
    .filter(([,v]) => v > 0)
    .map(([k, v]) => ({ name: labels[k] || k, value: v, itemStyle: { color: colors[k] || "#909399" } }));
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 } },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const goalsPerRoleBarOption = computed<ECOption>(() => {
  const items = roleList.value.map(r => ({ name: r.name, icon: r.icon, count: goalsByRole(r.id).length }));
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 4, right: 8, top: 4, bottom: 4, containLabel: true },
    xAxis: { type: "category", data: items.map(i => i.icon), axisLabel: { fontSize: 12 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{
      type: "bar",
      data: items.map((i, idx) => ({ value: i.count, itemStyle: { color: ROLE_COLOR_MAP[roleList.value[idx]?.id || ""] || "#909399", borderRadius: [3, 3, 0, 0] } })),
      barMaxWidth: 24
    }]
  };
});

// ── Data loading ───────────────────────────────
async function load() {
  loading.value = true;
  error.value = null;
  try {
    // Try live data first (derived from YiKnowledge files)
    const period = selectedPeriod.value === "annual" ? "annual" : selectedPeriod.value;
    const live = await fetchLiveGoals(String(selectedYear.value), period);
    if (live.goals.length || live.roles.length) {
      liveGoals.value = live.goals;
      liveRoles.value = live.roles;
      liveLastScan.value = live.last_scan;
      lastUpdated.value = Date.now();
      loading.value = false;
      return;
    }
    // Fall back to MongoDB-seeded data
    const [roles, goals] = await Promise.all([fetchRoles(), fetchGoals()]);
    apiRoles.value = roles;
    apiGoals.value = goals;
    liveGoals.value = [];
    liveRoles.value = [];
    lastUpdated.value = Date.now();
  } catch (e: unknown) {
    // Live endpoint failed — try MongoDB fallback
    try {
      const [roles, goals] = await Promise.all([fetchRoles(), fetchGoals()]);
      apiRoles.value = roles;
      apiGoals.value = goals;
      liveGoals.value = [];
      liveRoles.value = [];
      lastUpdated.value = Date.now();
    } catch {
      error.value = e instanceof Error ? e.message : "Failed to load OKR data";
    }
  } finally {
    loading.value = false;
  }
}

async function silentRefresh() {
  try {
    const period = selectedPeriod.value === "annual" ? "annual" : selectedPeriod.value;
    const live = await fetchLiveGoals(String(selectedYear.value), period);
    if (live.goals.length || live.roles.length) {
      liveGoals.value = live.goals;
      liveRoles.value = live.roles;
      liveLastScan.value = live.last_scan;
      lastUpdated.value = Date.now();
      return;
    }
    const [roles, goals] = await Promise.all([fetchRoles(), fetchGoals()]);
    apiRoles.value = roles;
    apiGoals.value = goals;
    liveGoals.value = [];
    liveRoles.value = [];
    lastUpdated.value = Date.now();
  } catch {
    // silent — keep stale data on poll failure
  }
}

function go(path: string) {
  router.push(path);
}

function openEvidence(filePath: string) {
  previewDlg.value?.open(filePath);
}

onMounted(() => {
  load();
  pollTimer = setInterval(silentRefresh, POLL_MS);
});

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
});

watch([selectedYear, selectedPeriod], () => {
  load();
});
</script>

<style scoped lang="scss">
.goals {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 24px;
  overflow: auto;
  // background comes from global .page class
}

// ── Header ─────────────────────────────────────
.goals__header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.goals__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.goals__title {
    font-size: 22px;
    font-weight: 700;
    white-space: nowrap;
  }
  .goals__updated {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    font-variant-numeric: tabular-nums;
  }
.goals__header-center {
  display: flex;
  align-items: center;
  gap: 10px;
}
.goals__year-select {
  width: 90px;
}
.goals__header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

// ── Summary Stats ──────────────────────────────
.goals__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.goals__stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}
.goals__stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  flex-shrink: 0;
}
.goals__stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.goals__stat-value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}
.goals__stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

// ── Charts ─────────────────────────────────────
.goals__charts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.goals-chart {
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  padding: 14px 16px 10px;
}
.goals-chart__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.goals-chart__body {
  min-height: 0;
}

// ── Empty ──────────────────────────────────────
.goals__empty {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

// ── Role Sections ──────────────────────────────
.goals__role {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.goals__role-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary-light-3);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
    .goals__role-name {
      color: var(--el-color-primary);
    }
  }
}
.goals__role-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.goals__role-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.goals__role-name {
  font-size: 15px;
  font-weight: 700;
  transition: color 0.15s;
}
.goals__role-desc {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.goals__role-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}
.goals__role-goal-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.goals__role-progress {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--el-color-primary);
}
.goals__role-arrow {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}
.goals__role-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

// ── Goal Cards Grid ────────────────────────────
.goals__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
}

// ── Goal Card ──────────────────────────────────
.goals__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  &:hover {
    border-color: var(--el-color-primary-light-3);
  }
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
}
.goals__card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.goals__card-icon {
  font-size: 16px;
}
.goals__card-id {
  font-family: "SF Mono", ui-monospace, monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  padding: 1px 5px;
  border-radius: 3px;
}
.goals__card-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}
.goals__card-desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goals__card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.goals__card-meta-sep {
  color: var(--el-text-color-placeholder);
}
.goals__card-krs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.goals__kr-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.goals__kr-text {
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-regular);
  flex: 1;
}
.goals__kr-pct {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  &.is-done {
    color: #10b981;
  }
}
.goals__kr-file {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  transition: color 0.15s;
  &:hover {
    color: var(--el-color-primary);
  }
}
.goals__card-footer {
  padding-top: 8px;
  margin-top: auto;
  border-top: 1px solid var(--el-border-color-lighter);
}

// ── Responsive ─────────────────────────────────
@media (max-width: 900px) {
  .goals__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .goals__grid {
    grid-template-columns: 1fr;
  }
}
</style>