<template>
  <div class="metrics-dashboard page" v-loading="loading">
    <!-- Header -->
    <div class="md-header">
      <div class="md-header__left">
        <h1 class="md-title">Knowledge Base Metrics</h1>
        <span class="md-subtitle" v-if="lastUpdated">
          Updated {{ formatTime(lastUpdated) }}
        </span>
      </div>
      <div class="md-header__right">
        <el-button text size="small" :icon="House" @click="router.push('/home/index')">Home</el-button>
        <el-button text size="small" :icon="Odometer" @click="router.push('/knowledge/executive/okr')">OKR</el-button>
        <el-button :icon="Refresh" size="small" @click="retry" :loading="loading">Refresh</el-button>
      </div>
    </div>

    <!-- Error State -->
    <div class="md-error" v-if="error && !loading">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
      <el-button size="small" type="primary" @click="retry">Retry</el-button>
    </div>

    <template v-if="!error || loading">
      <!-- KPI Cards Row -->
      <el-row :gutter="16" class="md-kpi-row">
        <el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="kpi-card kpi-files">
            <div class="kpi-icon"><el-icon :size="22"><Document /></el-icon></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ formatNumber(totalFiles) }}</div>
              <div class="kpi-label">Total Files</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="kpi-card kpi-categories">
            <div class="kpi-icon"><el-icon :size="22"><Folder /></el-icon></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ categoryCount }}</div>
              <div class="kpi-label">Role Categories</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="kpi-card kpi-active">
            <div class="kpi-icon"><el-icon :size="22"><Timer /></el-icon></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ activeWeekCount }}<span class="kpi-unit"> / {{ activeWeekPct }}%</span></div>
              <div class="kpi-label">Active This Week</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="kpi-card" :class="qualityClass">
            <div class="kpi-icon"><el-icon :size="22"><DataAnalysis /></el-icon></div>
            <div class="kpi-body">
              <div class="kpi-value" :style="{ color: qualityColor }">{{ dataQualityScore }}%</div>
              <div class="kpi-label">Data Quality</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="kpi-card kpi-issues">
            <div class="kpi-icon"><el-icon :size="22"><Tickets /></el-icon></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ issueStats?.total ?? 0 }}</div>
              <div class="kpi-label">
                Issues
                <span v-if="issueAttention.overdue" class="kpi-warn">{{ issueAttention.overdue }} overdue</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4" :lg="4" :xl="4">
          <div class="kpi-card kpi-bugs">
            <div class="kpi-icon"><el-icon :size="22"><Warning /></el-icon></div>
            <div class="kpi-body">
              <div class="kpi-value">{{ totalBugs }}</div>
              <div class="kpi-label">Bugs</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Charts Row -->
      <el-row :gutter="16" class="md-charts-row">
        <el-col :xs="24" :md="12" :lg="8">
          <div class="chart-card">
            <div class="chart-card__head">Role Distribution</div>
            <ECharts :option="roleChartOption" height="260" />
          </div>
        </el-col>
        <el-col :xs="24" :md="12" :lg="8">
          <div class="chart-card">
            <div class="chart-card__head">Freshness</div>
            <ECharts :option="freshnessChartOption" height="260" />
          </div>
        </el-col>
        <el-col :xs="24" :md="12" :lg="8">
          <div class="chart-card">
            <div class="chart-card__head">Issue Status</div>
            <ECharts :option="issueStatusChartOption" height="260" />
          </div>
        </el-col>
      </el-row>

      <!-- Data Quality + Gaps Row -->
      <el-row :gutter="16" class="md-quality-row">
        <el-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-card__head">
              Data Quality
              <span class="chart-card__score" :style="{ color: qualityColor }">{{ dataQualityScore }}%</span>
            </div>
            <div class="quality-bars">
              <div
                v-for="fc in fieldCompleteness"
                :key="fc.field"
                class="quality-bar-row"
              >
                <span class="quality-bar-label">{{ fc.label }}</span>
                <div class="quality-bar-track">
                  <div
                    class="quality-bar-fill"
                    :style="{ width: fc.pct + '%', background: barColor(fc.pct) }"
                  />
                </div>
                <span class="quality-bar-pct" :style="{ color: barColor(fc.pct) }">{{ fc.pct }}%</span>
                <span class="quality-bar-missing" v-if="fc.missing > 0">{{ fc.missing }} missing</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-card__head">
              Knowledge Gaps
              <el-tag size="small" type="warning" v-if="insight.gaps.value.length">{{
                insight.gaps.value.length
              }}</el-tag>
            </div>
            <div class="gaps-list" v-if="insight.gaps.value.length">
              <div
                v-for="(gap, i) in insight.gaps.value"
                :key="i"
                class="gap-item"
              >
                <span class="gap-dot" :class="gapSeverityClass(gap)" />
                <span class="gap-text">{{ gap }}</span>
              </div>
            </div>
            <div class="gaps-empty" v-else>
              <el-icon><CircleCheck /></el-icon>
              <span>No significant knowledge gaps detected</span>
            </div>
            <div class="gaps-health-summary" v-if="insight.healthSummary.value">
              {{ insight.healthSummary.value }}
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Category Breakdown Table -->
      <div class="chart-card">
        <div class="chart-card__head">Category Breakdown</div>
        <el-table :data="categoryTableData" stripe size="small" row-key="role">
          <el-table-column label="Role" min-width="160">
            <template #default="{ row }">
              <span class="cat-role-cell">
                <span class="cat-icon">{{ row.icon }}</span>
                <span class="cat-name">{{ row.label }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Files" width="100" sortable prop="count" />
          <el-table-column label="Freshness" min-width="200">
            <template #default="{ row }">
              <div class="cat-freshness">
                <div class="cat-freshness-bar">
                  <div
                    class="cat-freshness-fill"
                    :style="{ width: row.freshness + '%', background: barColor(row.freshness) }"
                  />
                </div>
                <span class="cat-freshness-pct">{{ row.freshness }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Recent (7d)" width="110">
            <template #default="{ row }">
              <span class="cat-recent" v-if="row.recentCount">{{ row.recentCount }} files</span>
              <span class="cat-recent-none" v-else>—</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Recent Activity Feed -->
      <div class="chart-card" v-if="activityFeed.length">
        <div class="chart-card__head">Recent Activity (7 days)</div>
        <div class="activity-list">
          <div
            v-for="(item, i) in activityFeed.slice(0, 12)"
            :key="i"
            class="activity-item"
          >
            <span class="activity-icon" :class="'act-' + item.type">
              {{ item.type === "file" ? "📄" : "🐛" }}
            </span>
            <span class="activity-title">{{ item.title }}</span>
            <span class="activity-meta">
              <el-tag v-if="item.severity" size="small" :type="severityType(item.severity)" effect="light">
                {{ item.severity }}
              </el-tag>
              <span v-if="item.category" class="activity-cat">{{ item.category }}</span>
            </span>
            <span class="activity-time">{{ timeAgo(item.time) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" name="knowledgeMetrics">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  Refresh,
  Document,
  Folder,
  Timer,
  DataAnalysis,
  Tickets,
  Warning,
  WarningFilled,
  CircleCheck,
  House,
  Odometer
} from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { useKnowledgeMetrics } from "./composables/useKnowledgeMetrics";
import { ROLE_COLORS } from "@/views/knowledge/executive/okrData";
import { timeAgo } from "@/utils/time";

const router = useRouter();

const {
  files,
  totalFiles,
  totalBugs,
  loading,
  error,
  lastUpdated,
  roleDistribution,
  categoryCount,
  freshnessBuckets,
  activeWeekCount,
  activeWeekPct,
  fieldCompleteness,
  dataQualityScore,
  activityFeed,
  issueStats,
  issueStatusDist,
  issueAttention,
  insight,
  retry
} = useKnowledgeMetrics();

// ── KPI card helpers ──
const qualityColor = computed(() => {
  const s = dataQualityScore.value;
  if (s >= 80) return "#67c23a";
  if (s >= 50) return "#e6a23c";
  return "#f56c6c";
});

const qualityClass = computed(() => {
  const s = dataQualityScore.value;
  if (s >= 80) return "kpi-healthy";
  if (s >= 50) return "kpi-warn";
  return "kpi-danger";
});

// ── Chart options ──
const roleChartOption = computed<ECOption>(() => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { left: 10, right: 20, top: 5, bottom: 5, containLabel: true },
  xAxis: { type: "value", show: false },
  yAxis: {
    type: "category",
    data: roleDistribution.value.map(r => r.label),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 12, color: "#909399" }
  },
  series: [
    {
      type: "bar",
      data: roleDistribution.value.map(r => ({
        value: r.count,
        itemStyle: { color: r.color, borderRadius: [0, 4, 4, 0] }
      })),
      barWidth: 14,
      label: { show: true, position: "right", fontSize: 11, color: "#606266" },
      emphasis: {
        itemStyle: { opacity: 0.85 }
      }
    }
  ]
}));

const freshnessChartOption = computed<ECOption>(() => ({
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} files ({d}%)"
  },
  legend: { bottom: 0, textStyle: { fontSize: 11 } },
  series: [
    {
      type: "pie",
      radius: ["55%", "80%"],
      center: ["50%", "45%"],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: "var(--el-bg-color-page)", borderWidth: 3 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: "bold" }
      },
      data: freshnessBuckets.value
        .filter(b => b.count > 0)
        .map(b => ({
          name: b.label,
          value: b.count,
          itemStyle: { color: b.color }
        }))
    }
  ]
}));

const issueStatusChartOption = computed<ECOption>(() => {
  const dist = issueStatusDist.value;
  const data = Object.entries(dist)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.replace(/_/g, " "), value: v }));

  const colors: Record<string, string> = {
    todo: "#909399",
    in_progress: "#409eff",
    in_review: "#e6a23c",
    done: "#67c23a",
    backlog: "#c0c4cc",
    cancelled: "#f56c6c"
  };

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)"
    },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [
      {
        type: "pie",
        radius: ["55%", "80%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: "var(--el-bg-color-page)", borderWidth: 3 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: "bold" }
        },
        data: data.map(d => ({
          ...d,
          itemStyle: { color: colors[d.name.replace(/ /g, "_")] || "#909399" }
        }))
      }
    ]
  };
});

// ── Category breakdown table ──
const categoryTableData = computed(() => {
  const now = Date.now();
  const monthAgo = now - 30 * 86400000;
  const weekAgo = now - 7 * 86400000;

  return roleDistribution.value.map(r => {
    const catFiles = files.value.filter(f => f.category === r.role);
    const freshCount = catFiles.filter(f => f.updatedAt && f.updatedAt > monthAgo).length;
    const recentCount = catFiles.filter(f => f.updatedAt && f.updatedAt > weekAgo).length;
    return {
      ...r,
      freshness: catFiles.length ? Math.round((freshCount / catFiles.length) * 100) : 0,
      recentCount
    };
  });
});

// ── Helpers ──
function barColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

function severityType(s: string): "danger" | "warning" | "info" {
  if (s === "critical" || s === "major") return "danger";
  if (s === "minor") return "warning";
  return "info";
}

function gapSeverityClass(gap: string): string {
  if (gap.includes("鲜活度") || gap.includes("freshness")) return "gap-warn";
  if (gap.includes("过时") || gap.includes("stale")) return "gap-danger";
  if (gap.includes("覆盖不") || gap.includes("sparse")) return "gap-info";
  return "gap-warn";
}

function formatNumber(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
</script>

<style scoped lang="scss">
.metrics-dashboard {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 24px;
  overflow: auto;
  // background comes from global .page class
}

// Header
.md-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.md-header__left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.md-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.md-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

// Error
.md-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 8px;
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  font-size: 14px;
}

// KPI Cards
.md-kpi-row {
  flex-shrink: 0;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: default;
  margin-bottom: 16px;
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.kpi-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  color: #fff;
}
.kpi-files .kpi-icon { background: linear-gradient(135deg, #5470c6, #7c93e0); }
.kpi-categories .kpi-icon { background: linear-gradient(135deg, #3ba272, #5cc98e); }
.kpi-active .kpi-icon { background: linear-gradient(135deg, #fac858, #fcdb7e); }
.kpi-issues .kpi-icon { background: linear-gradient(135deg, #ee6666, #f28e8e); }
.kpi-bugs .kpi-icon { background: linear-gradient(135deg, #fc8452, #fda47e); }
.kpi-healthy .kpi-icon { background: linear-gradient(135deg, #67c23a, #85d35a); }
.kpi-warn .kpi-icon { background: linear-gradient(135deg, #e6a23c, #eebb5c); }
.kpi-danger .kpi-icon { background: linear-gradient(135deg, #f56c6c, #f78e8e); }

.kpi-body { min-width: 0; }
.kpi-value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}
.kpi-unit {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.kpi-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.kpi-warn {
  font-size: 11px;
  color: #e6a23c;
  font-weight: 600;
}

// Chart cards
.chart-card {
  border-radius: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  padding: 16px 20px;
  margin-bottom: 16px;
}
.chart-card__head {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-card__score {
  font-size: 13px;
  font-weight: 700;
  margin-left: auto;
}

// Quality bars
.quality-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.quality-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.quality-bar-label {
  width: 90px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
}
.quality-bar-track {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}
.quality-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.quality-bar-pct {
  width: 34px;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.quality-bar-missing {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  width: 70px;
  text-align: right;
}

// Gaps
.gaps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow: auto;
}
.gap-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.4;
}
.gap-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  &.gap-warn { background: #e6a23c; }
  &.gap-danger { background: #f56c6c; }
  &.gap-info { background: #409eff; }
}
.gap-text {
  color: var(--el-text-color-regular);
}
.gaps-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.gaps-health-summary {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

// Category table
.cat-role-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cat-icon { font-size: 16px; }
.cat-name {
  font-size: 13px;
  font-weight: 500;
}
.cat-freshness {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cat-freshness-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}
.cat-freshness-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.cat-freshness-pct {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
  width: 32px;
  text-align: right;
}
.cat-recent {
  font-size: 12px;
  color: "#67c23a";
}
.cat-recent-none {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

// Activity
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 360px;
  overflow: auto;
}
.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  transition: background 0.15s;
  &:hover {
    background: var(--el-fill-color-light);
  }
}
.activity-icon {
  flex-shrink: 0;
  font-size: 14px;
}
.activity-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
}
.activity-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.activity-cat {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.activity-time {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
  width: 60px;
  text-align: right;
}
</style>