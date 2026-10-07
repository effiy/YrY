<template>
  <div class="cd-root page" v-loading="loading">
    <!-- Header -->
    <header class="cd-header">
      <div class="cd-header__left">
        <h1 class="cd-header__title">Curator Dashboard</h1>
        <p class="cd-header__desc">Knowledge governance · health monitoring · review compliance</p>
      </div>
      <div class="cd-header__right">
        <span class="cd-header__pulse" :class="{ 'is-fresh': dataAge < 10 }" />
        <span class="cd-header__age">{{ ageText }}</span>
        <span v-if="stats" class="cd-header__total">{{ stats.total }} files across {{ categories.length }} categories</span>
        <el-button :icon="Refresh" size="small" @click="load" :loading="loading">Refresh</el-button>
      </div>
    </header>

    <KnowledgeError v-if="error" :message="error" @retry="load" />

    <template v-else-if="stats">
      <!-- Stat Cards -->
      <section class="cd-stats">
        <div class="cd-stat" @click="setCategory('')">
          <span class="cd-stat__icon cd-stat__icon--blue">📄</span>
          <div class="cd-stat__body">
            <span class="cd-stat__val">{{ stats.total }}</span>
            <span class="cd-stat__lbl">Total Files</span>
          </div>
          <span class="cd-stat__sub">{{ categories.length }} categories</span>
        </div>
        <div class="cd-stat" :class="{ 'is-warn': health.stale_count > 0 }" @click="setCategory('')">
          <span class="cd-stat__icon" :class="health.stale_count ? 'cd-stat__icon--red' : 'cd-stat__icon--green'">⚠️</span>
          <div class="cd-stat__body">
            <span class="cd-stat__val">{{ health.stale_count }}</span>
            <span class="cd-stat__lbl">Stale Files</span>
          </div>
          <span class="cd-stat__sub">past review cycle</span>
        </div>
        <div class="cd-stat" :class="{ 'is-good': health.review_coverage_pct >= 60 }">
          <span class="cd-stat__icon" :class="health.review_coverage_pct >= 60 ? 'cd-stat__icon--green' : 'cd-stat__icon--amber'">🛡️</span>
          <div class="cd-stat__body">
            <span class="cd-stat__val">{{ Math.round(health.review_coverage_pct) }}%</span>
            <span class="cd-stat__lbl">Review Coverage</span>
          </div>
          <el-progress :percentage="Math.round(health.review_coverage_pct)" :stroke-width="4" :show-text="false" :color="progressColor(health.review_coverage_pct)" />
        </div>
        <div class="cd-stat" :class="{ 'is-good': qualityScore >= 70 }">
          <span class="cd-stat__icon" :class="qualityScore >= 70 ? 'cd-stat__icon--green' : qualityScore >= 40 ? 'cd-stat__icon--amber' : 'cd-stat__icon--red'">⭐</span>
          <div class="cd-stat__body">
            <span class="cd-stat__val">{{ qualityScore }}%</span>
            <span class="cd-stat__lbl">Quality Score</span>
          </div>
          <el-progress :percentage="qualityScore" :stroke-width="4" :show-text="false" :color="progressColor(qualityScore)" />
        </div>
        <div class="cd-stat">
          <span class="cd-stat__icon cd-stat__icon--purple">🧠</span>
          <div class="cd-stat__body">
            <span class="cd-stat__val">{{ health.tacit_count }}</span>
            <span class="cd-stat__lbl">Tacit Knowledge</span>
          </div>
          <span class="cd-stat__sub">needs capture</span>
        </div>
      </section>

      <!-- Two-column: Data Quality + Review Queue -->
      <section class="cd-cols">
        <div class="cd-panel">
          <div class="cd-panel__head">
            <h2 class="cd-panel__title">Data Quality</h2>
            <el-tag size="small" :type="dataQuality.complete / Math.max(dataQuality.total, 1) > 0.7 ? 'success' : 'warning'">
              {{ dataQuality.complete }} / {{ dataQuality.total }} complete
            </el-tag>
          </div>
          <div class="cd-dq">
            <div v-for="item in qualityBars" :key="item.key" class="cd-dq__row">
              <span class="cd-dq__label">{{ item.label }}</span>
              <div class="cd-dq__track">
                <div class="cd-dq__fill" :style="{ width: item.pct + '%', background: item.color }" />
              </div>
              <span class="cd-dq__val" :style="{ color: item.missing ? '#f56c6c' : '#10b981' }">{{ item.missing || '✓' }}</span>
            </div>
          </div>
        </div>

        <div class="cd-panel">
          <div class="cd-panel__head">
            <h2 class="cd-panel__title">Review Queue</h2>
            <el-tag size="small" :type="reviewQueue.length ? 'danger' : 'success'">
              {{ reviewQueue.length }} overdue
            </el-tag>
          </div>
          <div v-if="reviewQueue.length" class="cd-rq">
            <div
              v-for="item in reviewQueue.slice(0, 8)"
              :key="item.path"
              class="cd-rq__item"
              @click="openPreview(item.path)"
            >
              <div class="cd-rq__main">
                <span class="cd-rq__title">{{ item.title }}</span>
                <span class="cd-rq__path">{{ item.path }}</span>
              </div>
              <div class="cd-rq__meta">
                <el-tag size="small" type="danger">{{ item.daysOverdue }}d overdue</el-tag>
                <el-tag size="small" type="info">{{ item.review_cycle }}</el-tag>
              </div>
            </div>
          </div>
          <div v-else class="cd-empty">All files within their review cycle</div>
        </div>
      </section>

      <!-- Module Breakdown -->
      <section class="cd-panel">
        <div class="cd-panel__head">
          <h2 class="cd-panel__title">
            {{ selectedCategory ? catLabel(selectedCategory) + ' Modules' : 'Category Overview' }}
          </h2>
          <el-select v-if="!selectedCategory" v-model="selectedCategory" size="small" placeholder="Drill into category..." clearable style="width: 180px">
            <el-option v-for="c in categories" :key="c.name" :label="`${catLabel(c.name)} (${c.count})`" :value="c.name" />
          </el-select>
          <el-button v-else size="small" @click="setCategory('')">Back to all categories</el-button>
        </div>
        <!-- Category aggregates (no selection) -->
        <div v-if="!selectedCategory" class="cd-modules">
          <div
            v-for="c in categoryAggregates"
            :key="c.name"
            class="cd-module"
            @click="setCategory(c.name)"
          >
            <div class="cd-module__head">
              <span class="cd-module__name">{{ catLabel(c.name) }}</span>
              <span class="cd-module__count">{{ c.count }}</span>
            </div>
            <div class="cd-module__bars">
              <div class="cd-module__bar">
                <span class="cd-module__bar-lbl">Review</span>
                <el-progress :percentage="c.review_coverage_pct" :stroke-width="5" :show-text="false" :color="progressColor(c.review_coverage_pct)" />
                <span class="cd-module__bar-val">{{ c.review_coverage_pct }}%</span>
              </div>
              <div class="cd-module__bar">
                <span class="cd-module__bar-lbl">Stale</span>
                <span class="cd-module__bar-val" :style="{ color: c.stale_count ? '#f56c6c' : '#10b981' }">{{ c.stale_count }}</span>
              </div>
              <div class="cd-module__bar">
                <span class="cd-module__bar-lbl">Tacit</span>
                <span class="cd-module__bar-val" :style="{ color: c.tacit_count ? '#7c3aed' : '#909399' }">{{ c.tacit_count }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Module drill-down (category selected) -->
        <div v-else class="cd-modules">
          <div
            v-for="m in displayModules"
            :key="m.name"
            class="cd-module"
          >
            <div class="cd-module__head">
              <span class="cd-module__name">{{ m.name === '__root__' ? 'root' : m.name }}</span>
              <span class="cd-module__count">{{ m.count }}</span>
            </div>
            <div class="cd-module__bars">
              <div class="cd-module__bar">
                <span class="cd-module__bar-lbl">Review</span>
                <el-progress :percentage="Math.round(m.review_coverage_pct)" :stroke-width="5" :show-text="false" :color="progressColor(m.review_coverage_pct)" />
                <span class="cd-module__bar-val">{{ Math.round(m.review_coverage_pct) }}%</span>
              </div>
              <div class="cd-module__bar">
                <span class="cd-module__bar-lbl">Stale</span>
                <span class="cd-module__bar-val" :style="{ color: m.stale_count ? '#f56c6c' : '#10b981' }">{{ m.stale_count }}</span>
              </div>
              <div class="cd-module__bar">
                <span class="cd-module__bar-lbl">Tacit</span>
                <span class="cd-module__bar-val" :style="{ color: m.tacit_count ? '#7c3aed' : '#909399' }">{{ m.tacit_count }}</span>
              </div>
            </div>
            <div v-if="m.roles.length" class="cd-module__roles">
              <el-tag v-for="r in m.roles.slice(0, 3)" :key="r.name" size="small" type="info">{{ r.name }} {{ r.count }}</el-tag>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters bar -->
      <section class="cd-panel">
        <div class="cd-panel__head">
          <h2 class="cd-panel__title">All Files</h2>
          <span class="cd-panel__count">{{ filteredTableData.length }} / {{ allFiles.length }}</span>
        </div>
        <div class="cd-filters">
          <el-input v-model="searchText" size="small" placeholder="Search title, path, module..." clearable style="width: 280px" />
          <el-select v-model="filterCategory" size="small" placeholder="Category" clearable style="width: 140px">
            <el-option v-for="c in categories" :key="c.name" :label="catLabel(c.name)" :value="c.name" />
          </el-select>
          <el-select v-model="filterStatus" size="small" placeholder="Status" clearable style="width: 120px">
            <el-option v-for="s in statusDistribution" :key="s.name" :label="s.name || 'missing'" :value="s.name" />
          </el-select>
          <el-select v-model="filterLifecycle" size="small" placeholder="Lifecycle" clearable style="width: 120px">
            <el-option v-for="l in lifecycleDistribution" :key="l.name" :label="l.name || 'missing'" :value="l.name" />
          </el-select>
          <el-select v-model="filterReviewCycle" size="small" placeholder="Review cycle" clearable style="width: 140px">
            <el-option v-for="r in reviewCycleDistribution" :key="r.name" :label="r.name || 'missing'" :value="r.name" />
          </el-select>
        </div>
        <el-table :data="paginatedTableData" stripe size="small" row-key="path" max-height="520">
          <el-table-column label="Title" min-width="280" sortable prop="title">
            <template #default="{ row }">
              <div class="cd-file" @click="openPreview(row.path)">
                <span class="cd-file__icon">{{ fileIcon(row) }}</span>
                <div class="cd-file__text">
                  <span class="cd-file__title">{{ row.title || row.path.split('/').pop() }}</span>
                  <span class="cd-file__path">{{ row.path }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Category" width="110" sortable prop="category">
            <template #default="{ row }">{{ catLabel(row.category) }}</template>
          </el-table-column>
          <el-table-column label="Module" width="110" sortable prop="module">
            <template #default="{ row }">
              <span class="cd-file__mod">{{ row.module }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Status" width="100" sortable prop="status">
            <template #default="{ row }">
              <el-tag v-if="row.status" :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
              <el-tag v-else size="small" type="danger">missing</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Lifecycle" width="100" sortable prop="lifecycle">
            <template #default="{ row }">
              <el-tag v-if="row.lifecycle" :type="lifecycleTagType(row.lifecycle)" size="small">{{ row.lifecycle }}</el-tag>
              <el-tag v-else size="small" type="danger">missing</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Review" width="110" sortable prop="review_cycle">
            <template #default="{ row }">
              <el-tag v-if="row.review_cycle" :type="reviewCycleTagType(row.review_cycle)" size="small">{{ row.review_cycle }}</el-tag>
              <el-tag v-else size="small" type="danger">missing</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Size" width="80" sortable prop="size">
            <template #default="{ row }">{{ formatSize(row.size) }}</template>
          </el-table-column>
          <el-table-column label="Updated" width="110" sortable prop="updated">
            <template #default="{ row }">{{ formatTime(row.updated) }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="filteredTableData.length > pageSize"
          class="cd-pager"
          layout="prev, pager, next"
          :total="filteredTableData.length"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          small
        />
      </section>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="CuratorDashboard">
import { ref, computed, watch } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { useCuratorStats } from "./useCuratorStats";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import KnowledgeError from "@/views/knowledge/components/KnowledgeError.vue";
import type { KnowledgeFileSummary } from "@/api/interface/yiAi";
import { filesize } from "filesize";

const CAT_LABELS: Record<string, string> = {
  engineer: "Engineer", leader: "Tech Lead", product: "product",
  executive: "Executive", sre: "SRE", aier: "AI Engineer", curator: "Curator",
  projects: "Projects", rss: "RSS", skills: "Skills", static: "Static",
  websites: "Websites", __root__: "Root"
};

const {
  stats, loading, error, lastUpdated, dataAge,
  health, dataQuality, qualityScore,
  allFiles, allModules, categories,
  statusDistribution, lifecycleDistribution, reviewCycleDistribution,
  reviewQueue, load, setCategory, selectedCategory
} = useCuratorStats();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const searchText = ref("");
const filterCategory = ref("");
const filterStatus = ref("");
const filterLifecycle = ref("");
const filterReviewCycle = ref("");
const currentPage = ref(1);
const pageSize = 20;

const ageText = computed(() => {
  if (!lastUpdated.value) return "";
  const s = dataAge.value;
  if (s < 10) return "Just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
});

function catLabel(c: string) { return CAT_LABELS[c] || c; }
function progressColor(v: number) { return v >= 70 ? "#10b981" : v >= 40 ? "#e6a23c" : "#f56c6c"; }

const qualityBars = computed(() => {
  const dq = dataQuality.value;
  const total = Math.max(dq.total, 1);
  return [
    { key: "status", label: "Status", missing: dq.no_status, pct: Math.round(((total - dq.no_status) / total) * 100), color: dq.no_status ? "#e6a23c" : "#10b981" },
    { key: "type", label: "Type", missing: dq.no_type, pct: Math.round(((total - dq.no_type) / total) * 100), color: dq.no_type ? "#e6a23c" : "#10b981" },
    { key: "lifecycle", label: "Lifecycle", missing: dq.no_lifecycle, pct: Math.round(((total - dq.no_lifecycle) / total) * 100), color: dq.no_lifecycle ? "#e6a23c" : "#10b981" },
    { key: "review_cycle", label: "Review Cycle", missing: dq.no_review_cycle, pct: Math.round(((total - dq.no_review_cycle) / total) * 100), color: dq.no_review_cycle ? "#f56c6c" : "#10b981" },
    { key: "roles", label: "Roles", missing: dq.no_roles, pct: Math.round(((total - dq.no_roles) / total) * 100), color: dq.no_roles ? "#e6a23c" : "#10b981" },
    { key: "tags", label: "Tags", missing: dq.no_tags, pct: Math.round(((total - dq.no_tags) / total) * 100), color: dq.no_tags ? "#e6a23c" : "#10b981" },
    { key: "benefit", label: "Benefit", missing: dq.no_benefit, pct: Math.round(((total - dq.no_benefit) / total) * 100), color: dq.no_benefit ? "#f56c6c" : "#10b981" },
    { key: "title", label: "Title", missing: dq.no_title, pct: Math.round(((total - dq.no_title) / total) * 100), color: dq.no_title ? "#f56c6c" : "#10b981" }
  ];
});

const categoryAggregates = computed(() => {
  const map = new Map<string, { count: number; reviewCoverage: number; stale: number; tacit: number; hasReview: number }>();
  for (const m of allModules.value) {
    const cat = m.category;
    if (!map.has(cat)) map.set(cat, { count: 0, reviewCoverage: 0, stale: 0, tacit: 0, hasReview: 0 });
    const a = map.get(cat)!;
    a.count += m.count;
    a.stale += m.stale_count;
    a.tacit += m.tacit_count;
    a.hasReview += m.count * m.review_coverage_pct / 100;
  }
  return Array.from(map.entries())
    .map(([name, a]) => ({
      name, count: a.count, stale_count: a.stale, tacit_count: a.tacit,
      review_coverage_pct: a.count ? Math.round(a.hasReview / a.count) : 0
    }))
    .sort((a, b) => b.count - a.count);
});

const displayModules = computed(() => {
  if (!selectedCategory.value) return [];
  return allModules.value.filter(m => m.category === selectedCategory.value);
});

const filteredTableData = computed(() => {
  let files = allFiles.value;
  const q = searchText.value.toLowerCase();
  if (q) {
    files = files.filter(f =>
      (f.title || "").toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      f.module.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  }
  if (filterCategory.value) files = files.filter(f => f.category === filterCategory.value);
  if (filterStatus.value) files = files.filter(f => (f.status || "") === filterStatus.value);
  if (filterLifecycle.value) files = files.filter(f => (f.lifecycle || "") === filterLifecycle.value);
  if (filterReviewCycle.value) files = files.filter(f => (f.review_cycle || "") === filterReviewCycle.value);
  return files;
});

const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredTableData.value.slice(start, start + pageSize);
});

watch([searchText, filterCategory, filterStatus, filterLifecycle, filterReviewCycle], () => { currentPage.value = 1; });

function openPreview(path: string) { previewDlg.value?.open(path); }

function fileIcon(f: { type?: string; tags?: string[] }): string {
  if (f.type === "index" || f.type === "summary") return "📖";
  if (f.type === "template") return "📋";
  if (f.tags?.includes("diagram")) return "📊";
  if (f.tags?.includes("governance")) return "⚖️";
  return "📄";
}

function statusTagType(s: string) {
  if (s === "stable" || s === "active") return "success";
  if (s === "evolving") return "primary";
  if (s === "draft") return "info";
  return "danger";
}
function lifecycleTagType(l: string) {
  if (l === "stable" || l === "active") return "success";
  if (l === "evolving") return "primary";
  if (l === "draft" || l === "in-review") return "warning";
  return "danger";
}
function reviewCycleTagType(r: string) {
  if (r === "monthly") return "warning";
  if (r === "quarterly") return "primary";
  if (r === "half-yearly" || r === "yearly") return "info";
  return "info";
}

function formatSize(bytes: number) { return String(filesize(bytes)); }

function formatTime(s: string) {
  if (!s) return "";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s.slice(0, 10);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days < 2) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch { return s.slice(0, 10); }
}
</script>

<style scoped lang="scss">
.cd-root {
  padding: 20px 24px;
  min-height: 100vh;
  // background comes from global .page class
}

// ── Header ──
.cd-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.cd-header__left { min-width: 0; }
.cd-header__title {
  margin: 0 0 2px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.cd-header__desc {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.cd-header__right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}
.cd-header__pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  flex-shrink: 0;
  &.is-fresh { background: #10b981; }
}
.cd-header__age {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.cd-header__total {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

// ── Stat Cards ──
.cd-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.cd-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: 0 2px 8px rgb(0 0 0 / 6%); }
  &.is-warn { border-color: #fef0c7; }
  &.is-good { border-color: #d1f2eb; }
}
.cd-stat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  border-radius: 8px;
  &--blue { background: #e8f4fd; }
  &--green { background: #e6f9e6; }
  &--amber { background: #fef3e2; }
  &--red { background: #fef0f0; }
  &--purple { background: #f3e8ff; }
}
.cd-stat__body {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.cd-stat__val {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.cd-stat__lbl {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cd-stat__sub {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

// ── Panels ──
.cd-panel {
  margin-bottom: 16px;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.cd-panel__head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.cd-panel__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  flex: 1;
}
.cd-panel__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

// ── Two-column ──
.cd-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 4px;
}

// ── Data Quality bars ──
.cd-dq {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cd-dq__row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.cd-dq__label {
  width: 90px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.cd-dq__track {
  flex: 1;
  height: 8px;
  background: var(--el-fill-color);
  border-radius: 4px;
  overflow: hidden;
}
.cd-dq__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
.cd-dq__val {
  width: 28px;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  flex-shrink: 0;
}

// ── Review Queue ──
.cd-rq {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 360px;
  overflow-y: auto;
}
.cd-rq__item {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: 0 1px 4px rgb(0 0 0 / 6%); }
}
.cd-rq__main {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.cd-rq__title {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-rq__path {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}
.cd-rq__meta {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

// ── Module Breakdown ──
.cd-modules {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}
.cd-module {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-top: 3px solid var(--el-color-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.15s;
  &:hover { box-shadow: 0 1px 6px rgb(0 0 0 / 6%); }
}
.cd-module__head {
  display: flex;
  gap: 4px;
  align-items: baseline;
  margin-bottom: 8px;
}
.cd-module__name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
}
.cd-module__count {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-color-primary);
}
.cd-module__bars {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cd-module__bar {
  display: flex;
  gap: 6px;
  align-items: center;
}
.cd-module__bar-lbl {
  width: 42px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.cd-module__bar-val {
  width: 36px;
  font-size: 11px;
  font-weight: 600;
  text-align: right;
  flex-shrink: 0;
}
.cd-module__roles {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

// ── Filters ──
.cd-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

// ── File table ──
.cd-file {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  cursor: pointer;
}
.cd-file__icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.cd-file__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cd-file__title { font-size: 13px; font-weight: 600; line-height: 1.3; overflow-wrap: break-word; }
.cd-file__path { overflow: hidden; text-overflow: ellipsis; font-family: monospace; font-size: 11px; color: var(--el-text-color-placeholder); white-space: nowrap; }
.cd-file__mod { font-size: 12px; font-weight: 600; color: var(--el-color-primary); }

.cd-pager { display: flex; justify-content: center; margin-top: 12px; }
.cd-empty { padding: 24px; font-size: 13px; color: var(--el-text-color-secondary); text-align: center; }
</style>