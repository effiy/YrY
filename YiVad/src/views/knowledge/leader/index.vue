<template>
  <div class="leader-dashboard page" v-loading="loading">
    <!-- Header -->
    <header class="leader-dashboard__header" v-sticky="{ top: 0, zIndex: 20, offsetX: [24, 24], offsetY: [20, 14] }">
      <div class="leader-dashboard__header-row">
        <div class="leader-dashboard__header-left">
          <h1 class="leader-dashboard__title">Tech Lead Dashboard</h1>
          <p class="leader-dashboard__subtitle">架构决策 · 技术选型 · 容量规划 · 风险管理 · 技术路线图</p>
        </div>
        <div class="leader-dashboard__header-right">
          <span class="leader-dashboard__refresh-badge" :class="{ refreshing: loading }">
            <el-icon :size="14"><Timer /></el-icon>
            <span v-if="secondsSinceFetch < 5">刚刚更新</span>
            <span v-else>{{ secondsSinceFetch }}s 前更新</span>
          </span>
          <el-button size="small" text :icon="Refresh" @click="retry" :loading="loading">刷新</el-button>
        </div>
      </div>
      <slot name="title">
        <RoleNav :active="'leader'" show-quick-nav quick-role="leader" sticky />
      </slot>
    </header>

    <KnowledgeError v-if="error" :message="error" @retry="retry" />

    <template v-else>
      <!-- Stat Cards -->
      <section class="leader-dashboard__stats">
        <div class="stat-card" v-for="card in statCards" :key="card.key" :style="{ '--accent': card.color }">
          <div class="stat-card__icon">{{ card.icon }}</div>
          <div class="stat-card__body">
            <span class="stat-card__value">{{ card.value }}</span>
            <span class="stat-card__label">{{ card.label }}</span>
          </div>
        </div>
      </section>

      <!-- Charts Row -->
      <section class="leader-dashboard__charts">
        <div class="chart-panel">
          <h3 class="chart-panel__title">状态分布</h3>
          <ECharts :option="statusPieOption" height="220" />
        </div>
        <div class="chart-panel">
          <h3 class="chart-panel__title">子目录文件分布</h3>
          <ECharts :option="subdirBarOption" height="220" />
        </div>
      </section>

      <!-- Risk + Activity Row -->
      <section class="leader-dashboard__panels">
        <!-- Risk Register -->
        <div class="panel panel--risk">
          <div class="panel__head">
            <h3 class="panel__title">⚠️ 风险登记册</h3>
            <el-tag size="small" type="warning">{{ stats.activeRisks }} 活跃</el-tag>
          </div>
          <div class="panel__body">
            <div v-if="risks.every(g => g.count === 0)" class="panel__empty">暂无风险记录</div>
            <div v-for="group in risks" :key="group.severity" class="risk-group" v-show="group.count > 0">
              <div class="risk-group__head">
                <span class="risk-group__dot" :style="{ background: group.color }"></span>
                <span class="risk-group__label">{{ group.label }}</span>
                <span class="risk-group__count">{{ group.count }}</span>
              </div>
              <div class="risk-group__items">
                <div v-for="file in group.files.slice(0, 5)" :key="file.path" class="risk-item" @click="openFile(file)">
                  <span class="risk-item__title">{{ file.meta?.title || file.name }}</span>
                  <el-tag v-if="file.meta?.status" :type="statusTagType(file.meta.status)" size="small">{{ file.meta.status }}</el-tag>
                </div>
                <div v-if="group.files.length > 5" class="risk-item risk-item--more">
                  ... 还有 {{ group.files.length - 5 }} 项
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="panel panel--activity">
          <div class="panel__head">
            <h3 class="panel__title">📋 最近更新</h3>
            <el-tag size="small" type="info">{{ recentActivity.length }} 项</el-tag>
          </div>
          <div class="panel__body">
            <div v-if="recentActivity.length === 0" class="panel__empty">最近 7 天无更新</div>
            <el-timeline v-else>
              <el-timeline-item
                v-for="item in recentActivity"
                :key="item.file.path"
                :timestamp="formatTimeAgo(item.updatedAt)"
                placement="top"
                :color="getSubdirColor(item.subdir)"
                size="normal"
              >
                <div class="activity-item" @click="openFile(item.file)">
                  <span class="activity-item__icon">{{ getSubdirIcon(item.subdir) }}</span>
                  <span class="activity-item__title">{{ item.title }}</span>
                  <el-tag v-if="item.isNew" size="small" type="success" effect="plain">NEW</el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </section>

      <!-- File Table -->
      <section class="leader-dashboard__files">
        <div class="panel__head">
          <h3 class="panel__title">📂 全部文件</h3>
          <div class="panel__head-actions">
            <el-input
              v-model="filterTitle"
              size="small"
              placeholder="搜索标题..."
              clearable
              style="width: 200px"
              :prefix-icon="Search"
            />
            <el-select v-model="filterSubdir" size="small" placeholder="子目录" clearable style="width: 140px">
              <el-option v-for="sd in subdirs" :key="sd" :label="`${getSubdirIcon(sd)} ${sd}`" :value="sd" />
            </el-select>
            <el-select v-model="filterStatus" size="small" placeholder="状态" clearable style="width: 120px">
              <el-option v-for="s in allStatuses" :key="s" :label="s" :value="s" />
            </el-select>
            <span class="panel__head-count">{{ filteredFiles.length }} / {{ allFiles.length }} 文件</span>
          </div>
        </div>
        <el-table
          :data="filteredFiles"
          stripe
          border
          style="width: 100%"
          row-key="path"
          empty-text="暂无文件"
          @row-click="openFile"
        >
          <el-table-column min-width="280" prop="title" label="标题">
            <template #default="{ row }">
              <div class="file-table__item">
                <span class="file-table__icon">{{ getSubdirIcon(row.subdir) }}</span>
                <div class="file-table__title-area">
                  <span class="file-table__title">{{ row.meta?.title || row.name }}</span>
                  <span class="file-table__path">{{ row.path }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="120" prop="subdir" label="子目录">
            <template #default="{ row }">
              <span class="file-table__domain" :style="{ color: getSubdirColor(row.subdir) }">{{ row.subdir }}</span>
            </template>
          </el-table-column>
          <el-table-column width="120" prop="type" label="类型">
            <template #default="{ row }">
              <el-tag v-if="row.meta?.type" :type="typeTagType(row.meta.type)" size="small">{{ row.meta.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column width="120" prop="status" label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.meta?.status" :type="statusTagType(row.meta.status)" size="small">{{ row.meta.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column width="120" prop="lifecycle" label="生命周期">
            <template #default="{ row }">
              <el-tag v-if="row.meta?.lifecycle" :type="lifecycleTagType(row.meta.lifecycle)" size="small">{{ row.meta.lifecycle }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column width="120" prop="updatedAt" label="更新">
            <template #default="{ row }">
              <span class="file-table__time">{{ row.updatedAt ? formatTimeAgo(row.updatedAt) : "—" }}</span>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="LeaderDashboard">
import { ref, computed } from "vue";
import { Refresh, Search, Timer } from "@element-plus/icons-vue";
import ECharts from "@/components/ECharts/index.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import KnowledgeError from "@/views/knowledge/components/KnowledgeError.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import { useLeaderData } from "./composables/useLeaderData";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

const {
  allFiles, loading, error, secondsSinceFetch, filesBySubdir,
  subdirCounts, stats, statusDist, risks, recentActivity,
  subdirs, formatTimeAgo, getSubdirIcon, getSubdirColor, retry
} = useLeaderData();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const filterTitle = ref("");
const filterSubdir = ref("");
const filterStatus = ref("");

const allStatuses = computed(() => {
  const s = new Set<string>();
  for (const f of allFiles.value) if (f.meta?.status) s.add(f.meta.status);
  return [...s].sort();
});

const filteredFiles = computed(() => {
  let list = allFiles.value.map(f => ({
    ...f,
    subdir: f.path.split("/")[1] || ""
  }));
  const ft = filterTitle.value.toLowerCase();
  if (ft) list = list.filter(f => (f.meta?.title || f.name).toLowerCase().includes(ft));
  if (filterSubdir.value) list = list.filter(f => f.subdir === filterSubdir.value);
  if (filterStatus.value) list = list.filter(f => f.meta?.status === filterStatus.value);
  return list;
});

const statCards = computed(() => [
  { key: "total", icon: "📊", value: stats.value.totalFiles, label: "知识文件总数", color: "#1677ff" },
  { key: "adr", icon: "📝", value: stats.value.adrCount, label: "架构决策记录", color: "#10b981" },
  { key: "risk", icon: "⚠️", value: stats.value.activeRisks, label: "活跃风险项", color: "#ef4444" },
  { key: "capacity", icon: "📈", value: stats.value.capacityItems, label: "容量规划项", color: "#f59e0b" },
  { key: "health", icon: "💚", value: stats.value.healthScore + "%", label: "知识健康度", color: "#7c3aed" }
]);

const STATUS_COLORS: Record<string, string> = {
  stable: "#10b981", active: "#10b981", evolving: "#1677ff",
  draft: "#f59e0b", deprecated: "#ef4444", archived: "#909399",
  "in-review": "#7c3aed", resolved: "#10b981", closed: "#909399",
  open: "#ef4444", in_progress: "#1677ff"
};

const statusPieOption = computed<any>(() => {
  const data = Object.entries(statusDist.value)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, itemStyle: { color: STATUS_COLORS[name] || "#909399" } }));
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    series: [{
      type: "pie", radius: ["50%", "75%"], center: ["50%", "55%"],
      label: { fontSize: 11, formatter: "{b}\n{d}%" },
      emphasis: { label: { fontSize: 14 } },
      data
    }]
  };
});

const subdirBarOption = computed<any>(() => {
  const keys = subdirs as readonly string[];
  const data = keys.map(k => subdirCounts.value[k] || 0);
  const colors = keys.map(k => getSubdirColor(k));
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 40, right: 20, top: 10, bottom: 30 },
    xAxis: { type: "category", data: keys.map(k => getSubdirIcon(k) + " " + k), axisLabel: { fontSize: 11 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [{
      type: "bar", data: data.map((v, i) => ({ value: v, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
      barWidth: "55%"
    }]
  };
});

function openFile(file: KnowledgeFileEntry) {
  previewDlg.value?.open(file.path);
}

function typeTagType(t: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (t === "summary" || t === "index") return "info";
  if (t === "template") return "warning";
  if (t === "framework") return "primary";
  if (t === "adr") return "success";
  return "info";
}

function statusTagType(s: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (s === "stable" || s === "active") return "success";
  if (s === "evolving") return "primary";
  if (s === "draft" || s === "in-review") return "warning";
  if (s === "deprecated" || s === "archived") return "danger";
  if (s === "open") return "danger";
  if (s === "in_progress") return "primary";
  if (s === "resolved" || s === "closed") return "success";
  return "info";
}

function lifecycleTagType(l: string): "success" | "warning" | "info" | "primary" | "danger" {
  if (l === "stable") return "success";
  if (l === "active" || l === "evolving") return "primary";
  if (l === "draft" || l === "in-review") return "warning";
  if (l === "deprecated" || l === "archived") return "danger";
  return "info";
}
</script>

<style scoped lang="scss">
.leader-dashboard {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
}

// ── Header ──
.leader-dashboard__header {
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  &.is-stuck {
    background: color-mix(in srgb, var(--el-bg-color-page) 82%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--el-border-color-lighter) 70%, transparent);
    box-shadow: 0 6px 20px -12px rgb(0 0 0 / 10%);
    backdrop-filter: saturate(180%) blur(14px);
  }
}
.leader-dashboard__header-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}
.leader-dashboard__header-left {
  flex: 1;
}
.leader-dashboard__title {
  margin: 0 0 2px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}
.leader-dashboard__subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.leader-dashboard__header-right {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
.leader-dashboard__refresh-badge {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 12px;
  transition: color 0.3s;
  &.refreshing {
    color: var(--el-color-primary);
  }
}

// ── Stat Cards ──
.leader-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
.stat-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 18px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  &:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow: 0 6px 20px -8px color-mix(in srgb, var(--accent) 25%, transparent);
  }
}
.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  font-size: 24px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-radius: 12px;
}
.stat-card__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.stat-card__value {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  color: var(--accent);
}
.stat-card__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// ── Charts Row ──
.leader-dashboard__charts {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 12px;
}
.chart-panel {
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  &__title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
  }
}

// ── Panels Row ──
.leader-dashboard__panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  &__head {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    &-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;
    }
    &-count {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
    }
  }
  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
  &__body {
    padding: 12px 16px;
    max-height: 380px;
    overflow-y: auto;
  }
  &__empty {
    padding: 32px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}

// ── Risk Groups ──
.risk-group {
  margin-bottom: 12px;
  &:last-child { margin-bottom: 0; }
  &__head {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }
  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  &__label {
    font-size: 13px;
    font-weight: 600;
  }
  &__count {
    font-size: 12px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    padding: 1px 8px;
    border-radius: 10px;
  }
  &__items {
    padding-left: 4px;
  }
}
.risk-item {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
  &:hover {
    background: var(--el-fill-color-light);
  }
  &--more {
    cursor: default;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    &:hover { background: transparent; }
  }
  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── Activity ──
.activity-item {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  padding: 2px 0;
  &:hover .activity-item__title {
    color: var(--el-color-primary);
  }
  &__icon {
    flex-shrink: 0;
    font-size: 14px;
  }
  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    transition: color 0.15s;
  }
}

// ── File Table ──
.leader-dashboard__files {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  .panel__head {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}
.file-table__item {
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
}
.file-table__icon {
  flex-shrink: 0;
  font-size: 18px;
}
.file-table__title-area {
  min-width: 0;
}
.file-table__title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-table__path {
  display: block;
  font-size: 11px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-table__domain {
  font-size: 12px;
  font-weight: 600;
}
.file-table__time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

// ── Timeline tweaks ──
:deep(.el-timeline) {
  padding-left: 4px;
}
:deep(.el-timeline-item__timestamp) {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
</style>