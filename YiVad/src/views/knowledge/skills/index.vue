<template>
  <div class="skills">
    <!-- Header Card -->
    <div class="skills__header">
      <div class="skills__header-icon">
        <el-icon><MagicStick /></el-icon>
      </div>
      <div class="skills__header-text">
        <h2 class="skills__header-title">Claude Code Skills</h2>
        <p class="skills__header-desc">Reusable capabilities that accelerate development across the full stack</p>
      </div>
      <div class="skills__header-pills">
        <div class="skills__header-pill">
          <span class="skills__header-pill-val">{{ skills.length }}</span>
          <span class="skills__header-pill-lbl">Skills</span>
        </div>
        <div class="skills__header-pill">
          <span class="skills__header-pill-val">{{ activeCount }}</span>
          <span class="skills__header-pill-lbl">Active</span>
        </div>
        <div class="skills__header-pill">
          <span class="skills__header-pill-val">{{ invocableCount }}</span>
          <span class="skills__header-pill-lbl">Invocable</span>
        </div>
        <div class="skills__header-pill skills__header-pill--accent">
          <span class="skills__header-pill-val">{{ completionPct }}%</span>
          <span class="skills__header-pill-lbl">Complete</span>
        </div>
      </div>
      <div class="skills__header-right">
        <el-input
          v-model="searchText"
          placeholder="Search skills..."
          :prefix-icon="Search"
          clearable
          size="small"
          class="skills__header-search"
        />
      </div>
    </div>

    <!-- Analytics Charts -->
    <div class="skills__charts">
      <div class="skills-chart" :class="{ 'skills-chart--active': activeCategory }">
        <div class="skills-chart__title">
          Categories
          <span v-if="activeCategory" class="skills-chart__badge">filtered</span>
        </div>
        <div class="skills-chart__body">
          <ECharts :option="categoryDonutOption" height="200" @chart-click="onCategoryChartClick" />
        </div>
      </div>
      <div class="skills-chart" :class="{ 'skills-chart--active': activeLifecycle }">
        <div class="skills-chart__title">
          Lifecycle
          <span v-if="activeLifecycle" class="skills-chart__badge">filtered</span>
        </div>
        <div class="skills-chart__body">
          <ECharts :option="lifecycleBarOption" height="200" @chart-click="onLifecycleChartClick" />
        </div>
      </div>
      <div class="skills-chart">
        <div class="skills-chart__title">Invocable vs Internal</div>
        <div class="skills-chart__body">
          <ECharts :option="invocableDonutOption" height="200" />
        </div>
      </div>
      <div class="skills-chart">
        <div class="skills-chart__title">Files per Skill</div>
        <div class="skills-chart__body">
          <ECharts :option="filesBarOption" height="200" />
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <div v-if="recentlyViewed.length" class="skills__recent">
      <span class="skills__recent-label">Recently viewed</span>
      <button
        v-for="r in recentlyViewed"
        :key="r.id"
        type="button"
        class="skills__recent-chip"
        :title="r.title"
        @click="openSkill(r)"
      >
        <span class="skills__recent-dot" :style="{ background: lifecycleColor(r.lifecycle) }" />
        <span class="skills__recent-name">/{{ r.name }}</span>
        <span class="skills__recent-title">{{ r.title }}</span>
      </button>
      <button type="button" class="skills__recent-clear" @click="recentlyViewed = []">✕</button>
    </div>

    <!-- Active Filter Pills -->
    <div v-if="activePills.length" class="skills__pills">
      <span class="skills__pills-label">Filters</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="p.clear()">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
    </div>

    <div class="skills__body">
      <!-- Sidebar -->
      <div class="skills__sidebar">
        <div class="skills__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="card"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
            <el-radio-button value="table"><el-icon><Tickets /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
        <div class="skills__sidebar-section">
          <div class="skills__sidebar-section-header">
            <span class="skills__sidebar-section-label">Overview</span>
            <span class="skills__sidebar-section-hint">{{ filteredSkills.length }} skills</span>
          </div>
          <div class="skills__sidebar-section-body">
            <div class="skills__sidebar-card" @click="clearAllFilters()">
              <div class="skills__sidebar-card-icon" style="background:linear-gradient(135deg,#7c3aed,#6d28d9)"><el-icon><MagicStick /></el-icon></div>
              <div class="skills__sidebar-card-info">
                <span class="skills__sidebar-card-value">{{ skills.length }}</span>
                <span class="skills__sidebar-card-label">Total</span>
              </div>
            </div>
            <div class="skills__sidebar-card" @click="toggleLifecycle('active')">
              <div class="skills__sidebar-card-icon" style="background:linear-gradient(135deg,#5ab1ef,#3a90d0)"><el-icon><Loading /></el-icon></div>
              <div class="skills__sidebar-card-info">
                <span class="skills__sidebar-card-value">{{ activeCount }}</span>
                <span class="skills__sidebar-card-label">Active</span>
              </div>
            </div>
            <div class="skills__sidebar-card" @click="applyInvocableFilter()">
              <div class="skills__sidebar-card-icon" style="background:linear-gradient(135deg,#91cc75,#7ab85e)"><el-icon><CircleCheckFilled /></el-icon></div>
              <div class="skills__sidebar-card-info">
                <span class="skills__sidebar-card-value">{{ invocableCount }}</span>
                <span class="skills__sidebar-card-label">Invocable</span>
              </div>
            </div>
            <div class="skills__sidebar-card">
              <div class="skills__sidebar-card-icon" style="background:linear-gradient(135deg,#e6a23c,#d49520)"><el-icon><Collection /></el-icon></div>
              <div class="skills__sidebar-card-info">
                <span class="skills__sidebar-card-value">{{ totalFiles }}</span>
                <span class="skills__sidebar-card-label">Files</span>
              </div>
            </div>
          </div>
          <div class="skills__sidebar-progress">
            <span class="skills__sidebar-progress-label">Active ratio</span>
            <el-progress :percentage="activeRatio" :stroke-width="6" :show-text="true" />
          </div>
        </div>
        <div class="skills__sidebar-section" style="margin-top:12px">
          <div class="skills__sidebar-section-header" style="border-left-color: var(--el-color-danger);">
            <span class="skills__sidebar-section-label">Needs Attention</span>
          </div>
          <div class="skills__sidebar-section-body">
            <div class="skills__sidebar-card skills__sidebar-card--attention skills__sidebar-card--nodesc" @click="applyAttentionFilter('nodesc')">
              <el-icon class="skills__sidebar-card-accent-icon"><WarningFilled /></el-icon>
              <span class="skills__sidebar-card-accent-value">{{ attention.noDescription }}</span>
              <span class="skills__sidebar-card-accent-label">No Description</span>
            </div>
            <div class="skills__sidebar-card skills__sidebar-card--attention skills__sidebar-card--deprecated" @click="applyAttentionFilter('deprecated')">
              <el-icon class="skills__sidebar-card-accent-icon"><CircleCloseFilled /></el-icon>
              <span class="skills__sidebar-card-accent-value">{{ attention.deprecated }}</span>
              <span class="skills__sidebar-card-accent-label">Deprecated</span>
            </div>
            <div class="skills__sidebar-card skills__sidebar-card--attention skills__sidebar-card--nofiles" @click="applyAttentionFilter('nofiles')">
              <el-icon class="skills__sidebar-card-accent-icon"><DocumentDelete /></el-icon>
              <span class="skills__sidebar-card-accent-value">{{ attention.noFiles }}</span>
              <span class="skills__sidebar-card-accent-label">No Files</span>
            </div>
          </div>
        </div>
        <div class="skills__sidebar-section" style="margin-top:12px">
          <div class="skills__sidebar-section-header" style="border-left-color: #7c3aed;">
            <span class="skills__sidebar-section-label">Categories</span>
          </div>
          <div class="skills__sidebar-section-body">
            <div v-for="cat in categories" :key="cat.id">
              <div
                class="skills__sidebar-cat"
                :class="{ 'skills__sidebar-cat--active': activeCategory === cat.id }"
                @click="toggleCategory(cat.id)"
              >
                <span class="skills__sidebar-cat-icon">{{ cat.icon }}</span>
                <span class="skills__sidebar-cat-label">{{ cat.label }}</span>
                <span class="skills__sidebar-cat-count">{{ skillsInCat(cat.id).length }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="skills__sidebar-section" style="margin-top:12px">
          <div class="skills__sidebar-section-header" style="border-left-color: var(--el-color-success);">
            <span class="skills__sidebar-section-label">Data Quality</span>
            <span class="skills__sidebar-section-hint">{{ skills.length }} skills</span>
          </div>
          <div class="skills__sidebar-section-body">
            <div v-for="c in completeness" :key="c.key" class="skills__sidebar-quality">
              <div class="skills__sidebar-quality-head">
                <span class="skills__sidebar-quality-label">{{ c.label }}</span>
                <span class="skills__sidebar-quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
              </div>
              <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
            </div>
          </div>
        </div>
        <div class="skills__sidebar-section" style="margin-top:12px">
          <div class="skills__sidebar-section-header" style="border-left-color: var(--el-color-warning);">
            <span class="skills__sidebar-section-label">Lifecycle</span>
          </div>
          <div class="skills__sidebar-section-body">
            <div v-for="lc in lifecycles" :key="lc.key">
              <div
                class="skills__sidebar-cat"
                :class="{ 'skills__sidebar-cat--active': activeLifecycle === lc.key }"
                @click="toggleLifecycle(lc.key)"
              >
                <span class="skills__sidebar-cat-dot" :style="{ background: lc.color }" />
                <span class="skills__sidebar-cat-label">{{ lc.label }}</span>
                <span class="skills__sidebar-cat-count">{{ lc.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="skills__main">

        <!-- Table View -->
        <template v-if="viewMode === 'table'">
          <el-table :data="paginatedSkills" stripe size="small" @row-click="openSkill">
            <el-table-column label="Skill" min-width="200">
              <template #default="{ row }">
                <div class="skills__table-item">
                  <span class="skills__table-icon">{{ row.icon || "📄" }}</span>
                  <div class="skills__table-title-area">
                    <span class="skills__table-title">{{ row.title }}</span>
                    <span class="skills__table-handle">/{{ row.name }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Category" width="120">
              <template #default="{ row }">
                <el-tag :type="categoryTagType(row.category)" size="small" effect="plain">{{ categoryLabel(row.category) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Files" width="80">
              <template #default="{ row }">
                <span class="skills__table-num">{{ skillFiles[row.id]?.length || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Invocable" width="100">
              <template #default="{ row }">
                <span v-if="row.user_invocable" class="skills__card-tag skills__card-tag--invocable">yes</span>
                <span v-else class="skills__table-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="Description" min-width="280">
              <template #default="{ row }">
                <span class="skills__table-desc">{{ row.description }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <el-pagination
          v-if="viewMode === 'table' && paginatedTotal > cardPageSize"
          class="skills__pager"
          layout="prev, pager, next"
          :page-size="cardPageSize"
          :total="paginatedTotal"
          :current-page="cardPage"
          @current-change="onCardPage"
        />

        <!-- Card View -->
        <template v-if="viewMode === 'card'">
          <div class="skills-card-grid">
            <div
              v-for="skill in paginatedSkills"
              :key="skill.id"
              class="skills-card-item"
              @click="openSkill(skill)"
            >
              <div class="skills-card-item__head">
                <span class="skills-card-item__icon">{{ skill.icon || "📄" }}</span>
                <span class="skills-card-item__dot" :style="{ background: lifecycleColor(skill.lifecycle) }" />
                <code class="skills-card-item__key">/{{ skill.name }}</code>
                <div class="skills-card-item__head-right">
                  <el-tag :type="categoryTagType(skill.category)" size="small" effect="plain">{{ categoryLabel(skill.category) }}</el-tag>
                  <span v-if="skill.user_invocable" class="skills__card-tag skills__card-tag--invocable">invocable</span>
                </div>
              </div>
              <h3 class="skills-card-item__title">{{ skill.title }}</h3>
              <p v-if="skill.description" class="skills-card-item__desc">{{ skill.description }}</p>
              <div class="skills-card-item__meta">
                <el-tag :type="lifecycleTagType(skill.lifecycle)" size="small">{{ skill.lifecycle }}</el-tag>
                <span class="skills-card-item__files">
                  <el-icon><Collection /></el-icon> {{ skillFiles[skill.id]?.length || 0 }} files
                </span>
              </div>
              <div v-if="skillFiles[skill.id]?.length" class="skills-card-item__file-list">
                <div
                  v-for="f in skillFiles[skill.id].slice(0, 4)"
                  :key="f.path"
                  class="skills-card-item__file-row"
                  @click.stop="openFile(f.path)"
                >
                  <span class="skills-card-item__file-accent" :style="{ background: fileAccentColor(f) }" />
                  <span class="skills-card-item__file-icon">{{ fileIcon(f) }}</span>
                  <span class="skills-card-item__file-name">{{ f.name }}</span>
                  <span class="skills-card-item__file-type">{{ fileTypeLabel(f) }}</span>
                </div>
                <div v-if="skillFiles[skill.id].length > 4" class="skills-card-item__file-more">
                  +{{ skillFiles[skill.id].length - 4 }} more files
                </div>
              </div>
            </div>
          </div>
        </template>
        <el-pagination
          v-if="viewMode === 'card' && paginatedTotal > cardPageSize"
          class="skills__pager"
          layout="prev, pager, next"
          :page-size="cardPageSize"
          :total="paginatedTotal"
          :current-page="cardPage"
          @current-change="onCardPage"
        />

        <!-- List View -->
        <template v-else-if="viewMode === 'list'">
          <div class="skills-list-view">
            <div
              v-for="skill in paginatedSkills"
              :key="skill.id"
              class="skills-list-view__row"
              @click="openSkill(skill)"
            >
              <span class="skills-list-view__dot" :style="{ background: lifecycleColor(skill.lifecycle) }" />
              <code class="skills-list-view__key">/{{ skill.name }}</code>
              <span class="skills-list-view__title">{{ skill.title }}</span>
              <el-tag :type="categoryTagType(skill.category)" size="small" effect="plain">{{ categoryLabel(skill.category) }}</el-tag>
              <el-tag :type="lifecycleTagType(skill.lifecycle)" size="small">{{ skill.lifecycle }}</el-tag>
              <span v-if="skill.user_invocable" class="skills__card-tag skills__card-tag--invocable">invocable</span>
              <span class="skills-list-view__files">{{ skillFiles[skill.id]?.length || 0 }} files</span>
            </div>
          </div>
        </template>
        <el-pagination
          v-if="viewMode === 'list' && paginatedTotal > cardPageSize"
          class="skills__pager"
          layout="prev, pager, next"
          :page-size="cardPageSize"
          :total="paginatedTotal"
          :current-page="cardPage"
          @current-change="onCardPage"
        />

        <div v-if="!loading && filteredSkills.length === 0" class="skills__empty">
          <el-empty description="No skills match your search" />
        </div>
      </div>
    </div>

    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="ts" name="skillsHub">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { MagicStick, Loading, CircleCheckFilled, Collection, Search, Grid, List, Tickets, WarningFilled, CircleCloseFilled, DocumentDelete } from "@element-plus/icons-vue";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { categories } from "./constants";
import type { SkillDef } from "./constants";

const router = useRouter();
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const searchText = ref("");
const activeCategory = ref("");
const activeLifecycle = ref("");
const invocableOnly = ref(false);
const showNoFiles = ref(false);
const loading = ref(true);
const viewMode = ref<"card" | "list" | "table">("card");
const cardPage = ref(1);
const cardPageSize = 20;

// ── Display mapping: skill dir name → { icon, display category } ──
const SKILL_DISPLAY: Record<string, { icon: string; category: string }> = {
  "vue": { icon: "🟢", category: "frontend" },
  "vite": { icon: "⚡", category: "frontend" },
  "h5": { icon: "📱", category: "frontend" },
  "ui-ux": { icon: "🎨", category: "frontend" },
  "chrome": { icon: "🧩", category: "frontend" },
  "tauri": { icon: "🦀", category: "frontend" },
  "fastapi": { icon: "🐍", category: "backend" },
  "nodejs": { icon: "💚", category: "backend" },
  "nginx": { icon: "🌐", category: "backend" },
  "public-api": { icon: "🔌", category: "backend" },
  "git": { icon: "📦", category: "platform" },
  "github": { icon: "🐙", category: "platform" },
  "npm": { icon: "📦", category: "platform" },
  "lighthouse": { icon: "🔦", category: "platform" },
  "tmux": { icon: "🖥️", category: "platform" },
  "agile-defect": { icon: "🐛", category: "platform" },
  "git-worktree": { icon: "🌿", category: "platform" },
  "skill-creator": { icon: "🛠️", category: "ai" },
  "rui-init": { icon: "🚀", category: "ai" },
  "import": { icon: "📥", category: "ai" },
  "gen-brd": { icon: "📋", category: "ai" },
  "mermaid": { icon: "📊", category: "ai" },
  "research": { icon: "🔍", category: "ai" },
  "code-review": { icon: "✅", category: "ai" },
  "brainstorm": { icon: "💡", category: "ai" },
  "diagnose": { icon: "🔬", category: "ai" },
  "domain-modeling": { icon: "🧠", category: "ai" },
  "execute-plan": { icon: "🎯", category: "ai" },
  "handoff": { icon: "🤝", category: "ai" },
  "prototype": { icon: "🖼️", category: "ai" },
  "subagent-dev": { icon: "🤖", category: "ai" },
  "tdd": { icon: "🧪", category: "ai" },
  "wayfinder": { icon: "🧭", category: "ai" },
  "write-plan": { icon: "📝", category: "ai" },
  "market-research": { icon: "🔍", category: "business" },
  "code-quality-research": { icon: "✅", category: "business" },
  "business-strategy": { icon: "📈", category: "business" },
};

// ── Dynamic skills from directory ──
const skills = ref<SkillDef[]>([]);
const skillFiles = ref<Record<string, KnowledgeFileEntry[]>>({});

const activeCount = computed(() => skills.value.filter(s => s.lifecycle === "active").length);
const invocableCount = computed(() => skills.value.filter(s => s.user_invocable).length);
const totalFiles = computed(() => skills.value.reduce((sum, s) => sum + s.files, 0));
const activeRatio = computed(() => (skills.value.length ? Math.round((activeCount.value / skills.value.length) * 100) : 0));
const completionPct = computed(() => {
  const withFiles = skills.value.filter(s => skillFiles.value[s.id]?.length).length;
  return skills.value.length ? Math.round((withFiles / skills.value.length) * 100) : 0;
});

// ── Recently viewed ──
const recentlyViewed = ref<SkillDef[]>([]);
function trackRecent(skill: SkillDef) {
  recentlyViewed.value = [skill, ...recentlyViewed.value.filter(r => r.id !== skill.id)].slice(0, 8);
}

// ── Analytics charts ──
const CATEGORY_COLORS: Record<string, string> = {
  frontend: "#409eff",
  backend: "#10b981",
  platform: "#7c3aed",
  ai: "#f59e0b",
  business: "#ef4444"
};

const categoryDist = computed(() => {
  const m: Record<string, number> = {};
  for (const s of skills.value) {
    if (!skillFiles.value[s.id]?.length) continue;
    m[s.category] = (m[s.category] ?? 0) + 1;
  }
  return m;
});

const categoryDonutOption = computed<ECOption>(() => {
  const data = categories
    .map(c => ({ name: c.label, value: categoryDist.value[c.id] ?? 0, itemStyle: { color: CATEGORY_COLORS[c.id] || "#909399" } }))
    .filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 } },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const lifecycleDist = computed(() => {
  const m: Record<string, number> = {};
  for (const s of skills.value) {
    if (!skillFiles.value[s.id]?.length) continue;
    m[s.lifecycle] = (m[s.lifecycle] ?? 0) + 1;
  }
  return m;
});

const LIFECYCLE_COLORS: Record<string, string> = { active: "#1677ff", draft: "#f59e0b", deprecated: "#f56c6c" };

const lifecycleBarOption = computed<ECOption>(() => {
  const order = ["active", "draft", "deprecated"];
  const cats = order.filter(k => lifecycleDist.value[k] != null);
  const values = cats.map(k => lifecycleDist.value[k] ?? 0);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: cats.map(c => c.charAt(0).toUpperCase() + c.slice(1)), axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color: "#e6a23c", borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
  };
});

const invocableDonutOption = computed<ECOption>(() => {
  const invocable = skills.value.filter(s => s.user_invocable && skillFiles.value[s.id]?.length).length;
  const internal = skills.value.filter(s => !s.user_invocable && skillFiles.value[s.id]?.length).length;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 } },
    series: [{
      type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false },
      data: [
        { name: "User-invocable", value: invocable, itemStyle: { color: "#10b981" } },
        { name: "Internal", value: internal, itemStyle: { color: "#909399" } }
      ]
    }]
  };
});

const filesBarOption = computed<ECOption>(() => {
  const top = [...skills.value]
    .filter(s => skillFiles.value[s.id]?.length)
    .sort((a, b) => b.files - a.files)
    .slice(0, 10);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: top.map(s => s.name), axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: top.map(s => s.files), itemStyle: { color: "#7c3aed", borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
  };
});

function onCategoryChartClick(e: { name?: string }) {
  const name = e?.name;
  if (!name) return;
  const cat = categories.find(c => c.label === name);
  if (cat) toggleCategory(cat.id);
}

function onLifecycleChartClick(e: { name?: string }) {
  const name = e?.name;
  if (!name) return;
  toggleLifecycle(name.toLowerCase());
}

// ── Data quality ──
const completeness = computed(() => {
  const total = skills.value.length;
  const fields = [
    { key: "description", label: "Description", filled: skills.value.filter(s => s.description).length },
    { key: "lifecycle", label: "Lifecycle", filled: skills.value.filter(s => s.lifecycle).length },
    { key: "category", label: "Category", filled: skills.value.filter(s => s.category).length },
    { key: "files", label: "Has Files", filled: skills.value.filter(s => skillFiles.value[s.id]?.length).length },
    { key: "invocable", label: "Invocable", filled: skills.value.filter(s => s.user_invocable).length }
  ];
  return fields.map(f => ({ ...f, pct: total ? Math.round((f.filled / total) * 100) : 0, missing: total - f.filled }));
});

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

// ── Needs Attention ──
const attention = computed(() => ({
  noDescription: skills.value.filter(s => !s.description).length,
  deprecated: skills.value.filter(s => s.lifecycle === "deprecated").length,
  noFiles: skills.value.filter(s => !skillFiles.value[s.id]?.length).length
}));

function applyAttentionFilter(type: "nodesc" | "deprecated" | "nofiles") {
  clearAllFilters();
  if (type === "nodesc") {
    searchText.value = "";
  } else if (type === "deprecated") {
    activeLifecycle.value = "deprecated";
  } else if (type === "nofiles") {
    showNoFiles.value = !showNoFiles.value;
  }
}

const lifecycles = computed(() => {
  const map: Record<string, number> = {};
  for (const s of skills.value) {
    map[s.lifecycle] = (map[s.lifecycle] ?? 0) + 1;
  }
  const colors: Record<string, string> = { active: "#1677ff", draft: "#f59e0b", deprecated: "#f56c6c" };
  return Object.entries(map).map(([key, count]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    count,
    color: colors[key] || "#909399"
  }));
});

const filteredSkills = computed(() => {
  let list = showNoFiles.value ? skills.value : skills.value.filter(s => skillFiles.value[s.id]?.length);
  if (activeCategory.value) {
    list = list.filter(s => s.category === activeCategory.value);
  }
  if (activeLifecycle.value) {
    list = list.filter(s => s.lifecycle === activeLifecycle.value);
  }
  if (invocableOnly.value) {
    list = list.filter(s => s.user_invocable);
  }
  if (searchText.value) {
    const q = searchText.value.toLowerCase();
    list = list.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }
  return list;
});

function categoryLabel(catId: string): string {
  return categories.find(c => c.id === catId)?.label || catId;
}

// ── Paginated skills for card/list views ──
const paginatedSkills = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize;
  return filteredSkills.value.slice(start, start + cardPageSize);
});
const paginatedTotal = computed(() => filteredSkills.value.length);

function onCardPage(p: number) {
  cardPage.value = p;
}

function skillsInCat(catId: string): SkillDef[] {
  return skills.value.filter(s => s.category === catId && skillFiles.value[s.id]?.length);
}

const activePills = computed(() => {
  const pills: Array<{ id: string; label: string; clear: () => void }> = [];
  if (activeCategory.value) {
    const cat = categories.find(c => c.id === activeCategory.value);
    pills.push({
      id: "cat",
      label: `Category: ${cat?.label || activeCategory.value}`,
      clear: () => { activeCategory.value = ""; }
    });
  }
  if (activeLifecycle.value) {
    pills.push({
      id: "lc",
      label: `Lifecycle: ${activeLifecycle.value}`,
      clear: () => { activeLifecycle.value = ""; }
    });
  }
  if (invocableOnly.value) {
    pills.push({
      id: "inv",
      label: "Invocable only",
      clear: () => { invocableOnly.value = false; }
    });
  }
  if (showNoFiles.value) {
    pills.push({
      id: "nofiles",
      label: "Showing empty skills",
      clear: () => { showNoFiles.value = false; }
    });
  }
  if (searchText.value) {
    pills.push({
      id: "search",
      label: `Search: ${searchText.value}`,
      clear: () => { searchText.value = ""; }
    });
  }
  return pills;
});

function applyInvocableFilter() {
  invocableOnly.value = !invocableOnly.value;
  activeCategory.value = "";
  activeLifecycle.value = "";
}

function toggleCategory(catId: string) {
  activeCategory.value = activeCategory.value === catId ? "" : catId;
  activeLifecycle.value = "";
  invocableOnly.value = false;
}

function toggleLifecycle(lc: string) {
  activeLifecycle.value = activeLifecycle.value === lc ? "" : lc;
  activeCategory.value = "";
  invocableOnly.value = false;
}

function clearAllFilters() {
  searchText.value = "";
  activeCategory.value = "";
  activeLifecycle.value = "";
  invocableOnly.value = false;
  showNoFiles.value = false;
}

function lifecycleClass(lc: string) {
  return `skills__card-tag--${lc}`;
}

function lifecycleColor(lc: string): string {
  const colors: Record<string, string> = { active: "#1677ff", draft: "#f59e0b", deprecated: "#f56c6c" };
  return colors[lc] || "#909399";
}

function lifecycleTagType(lc: string): "success" | "warning" | "danger" | "info" {
  if (lc === "active") return "success";
  if (lc === "draft") return "warning";
  if (lc === "deprecated") return "danger";
  return "info";
}

function categoryTagType(catId: string): "primary" | "success" | "warning" | "danger" | "info" {
  const map: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
    frontend: "primary",
    backend: "success",
    platform: "primary",
    ai: "warning",
    business: "danger"
  };
  return map[catId] || "info";
}

function openSkill(skill: SkillDef) {
  trackRecent(skill);
  router.push(`/skills/${skill.id}`);
}

function openFile(path: string) {
  previewDlgRef.value?.open(path);
}

function fileIcon(f: KnowledgeFileEntry): string {
  const n = f.name.toLowerCase();
  if (n === "skill.md") return "⭐";
  if (n.endsWith(".md")) return "📄";
  if (n.endsWith(".mjs") || n.endsWith(".js")) return "📜";
  if (n.endsWith(".json")) return "📋";
  if (n.endsWith(".ts")) return "🔷";
  return "📁";
}

function fileTypeLabel(f: KnowledgeFileEntry): string {
  const path = f.path.toLowerCase();
  if (path.includes("/agents/")) return "Agent";
  if (path.includes("/commands/")) return "Cmd";
  if (path.includes("/rules/")) return "Rule";
  if (path.includes("/references/")) return "Ref";
  if (path.includes("/steps/")) return "Step";
  if (path.includes("/templates/")) return "Tpl";
  if (path.includes("/lib/")) return "Lib";
  if (f.name.toLowerCase() === "skill.md") return "Skill";
  return "";
}

function fileAccentColor(f: KnowledgeFileEntry): string {
  const n = f.name.toLowerCase();
  if (n === "skill.md") return "#f59e0b";
  if (n.endsWith(".md")) return "#409eff";
  if (n.endsWith(".mjs") || n.endsWith(".js") || n.endsWith(".ts")) return "#7c3aed";
  if (n.endsWith(".json")) return "#10b981";
  return "#909399";
}

// ── Load skills from YiKnowledge/skills/ directory ──
async function loadSkills() {
  loading.value = true;
  try {
    const res = await scanKnowledge("skills");
    const cats = res.categories ?? [];

    // Group files by skill subdirectory (first path segment after "skills/")
    const groupMap: Record<string, KnowledgeFileEntry[]> = {};
    for (const cat of cats) {
      for (const f of cat.files ?? []) {
        const parts = f.path.split("/");
        // path is e.g. "skills/agile-defect/SKILL.md" → dir = "agile-defect"
        const dir = parts.length >= 2 ? parts[1] : cat.category;
        (groupMap[dir] ||= []).push(f);
      }
    }

    const filesMap: Record<string, KnowledgeFileEntry[]> = {};
    const skillsList: SkillDef[] = [];

    for (const [skillId, files] of Object.entries(groupMap)) {
      // Skip non-skill entries (README.md etc.)
      if (skillId === "README.md") continue;

      filesMap[skillId] = files;

      const skillMd = files.find(f => f.name.toLowerCase() === "skill.md");
      const meta = (skillMd?.meta ?? {}) as Record<string, unknown>;
      const display = SKILL_DISPLAY[skillId] ?? { icon: "📄", category: "ai" };

      skillsList.push({
        id: skillId,
        name: (meta.name as string) || skillId,
        title: (meta.title as string) || skillId,
        icon: display.icon,
        description: (meta.description as string) || "",
        files: files.length,
        lifecycle: (meta.lifecycle as string) || "active",
        user_invocable: meta.user_invocable === true || meta.user_invocable === "true",
        status: (meta.status as string) || "stable",
        category: display.category,
      });
    }

    skillsList.sort((a, b) => a.title.localeCompare(b.title));
    skillFiles.value = filesMap;
    skills.value = skillsList;
  } finally {
    loading.value = false;
  }
}

// ── Server-side agent capabilities ──
onMounted(() => {
  loadSkills();
});

watch([activeCategory, activeLifecycle, invocableOnly, showNoFiles, searchText], () => {
  cardPage.value = 1;
});
</script>

<style scoped lang="scss">
.skills {
  padding: 24px;
  background: var(--el-bg-color-page);
  overflow-x: hidden;
}

// ── Header Card ──
.skills__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.skills__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  flex-shrink: 0;
}
.skills__header-text {
  min-width: 0;
  flex: 1;
}
.skills__header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}
.skills__header-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.skills__header-pills {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.skills__header-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  min-width: 64px;
  &--accent {
    background: var(--el-color-primary-light-9);
  }
}
.skills__header-pill-val {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.skills__header-pill--accent .skills__header-pill-val {
  color: var(--el-color-primary);
}
.skills__header-pill-lbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
}
.skills__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.skills__header-search {
  width: 200px;
}

// ── Filter Pills ──
.skills__pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.skills__pills-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

// ── Body / Main / Sidebar ──
.skills__body {
  display: flex;
  gap: 24px;
}
.skills__main {
  flex: 1;
  min-width: 0;
}
.skills__sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

// ── Sidebar View Toggle ──
.skills__sidebar-view {
  padding: 4px 4px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

// ── Sidebar Section ──
.skills__sidebar-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.skills__sidebar-section-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
  padding-left: 10px;
}
.skills__sidebar-section-label {
  flex: 1;
}
.skills__sidebar-section-hint {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
}
.skills__sidebar-section-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

// ── Sidebar Card (stat item) ──
.skills__sidebar-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--el-bg-color);
  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}
.skills__sidebar-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
}
.skills__sidebar-card-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}
.skills__sidebar-card-value {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.skills__sidebar-card-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

// ── Sidebar Filter Items (Categories / Lifecycle) ──
.skills__sidebar-cat {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-radius: 6px;
  padding: 6px 8px;
  transition: background 0.15s;
  &:hover { background: var(--el-fill-color); }
  &--active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}
.skills__sidebar-cat-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.skills__sidebar-cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skills__sidebar-cat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex: 1;
}
.skills__sidebar-cat--active .skills__sidebar-cat-label {
  color: var(--el-color-primary);
  font-weight: 600;
}
.skills__sidebar-cat-count {
  font-size: 12px;
  font-weight: 600;
  font-family: DIN, sans-serif;
  color: var(--el-text-color-placeholder);
}

// ── Pagination ──
.skills__pager {
  margin-top: 16px;
  justify-content: center;
}

// ── Card Grid (new style matching issue page) ──
.skills-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 10px;
}
.skills-card-item {
  padding: 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
}
.skills-card-item__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.skills-card-item__icon {
  font-size: 16px;
  flex-shrink: 0;
}
.skills-card-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skills-card-item__key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.skills-card-item__head-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.skills-card-item__title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.skills-card-item__desc {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.skills-card-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.skills-card-item__files {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  .el-icon { font-size: 13px; }
}
.skills-card-item__file-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 6px;
}
.skills-card-item__file-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.12s;
  &:hover { background: var(--el-fill-color-lighter); }
}
.skills-card-item__file-accent {
  width: 3px;
  height: 14px;
  border-radius: 2px;
  flex-shrink: 0;
}
.skills-card-item__file-icon {
  font-size: 12px;
  flex-shrink: 0;
}
.skills-card-item__file-name {
  font-size: 12px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
.skills-card-item__file-type {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
}
.skills-card-item__file-more {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  padding: 2px 6px;
  text-align: center;
}

// ── List View (new style matching issue page) ──
.skills-list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.skills-list-view__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.skills-list-view__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skills-list-view__key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.skills-list-view__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.skills-list-view__files {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

// ── Card meta tags ──
.skills__card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.skills__card-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  &--invocable {
    background: #e6f9f2;
    color: #10b981;
  }
  &--active {
    background: #e6f0ff;
    color: #1677ff;
  }
  &--draft {
    background: #fff7e6;
    color: #f59e0b;
  }
  &--deprecated {
    background: #fef0f0;
    color: #f56c6c;
  }
  &--confirm {
    background: #fff7e6;
    color: #f59e0b;
  }
  &--auto {
    background: #e6f9f2;
    color: #10b981;
  }
  &--skill {
    background: #f4f4f5;
    color: var(--el-text-color-secondary);
  }
}

// ── Table view ──
.skills__table-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}
.skills__table-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}
.skills__table-title-area {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.skills__table-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.3;
  word-break: break-word;
}
.skills__table-handle {
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--el-color-primary);
}
.skills__table-num {
  font-size: 14px;
  font-weight: 700;
  font-family: DIN, sans-serif;
  color: var(--el-text-color-primary);
}
.skills__table-muted {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.skills__table-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ── Analytics Charts ──
.skills__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.skills-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.skills-chart--active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}
.skills-chart__title {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.skills-chart__badge {
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
  text-transform: none;
}
.skills-chart__body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

// ── Recently Viewed ──
.skills__recent {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
}
.skills__recent-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 2px;
}
.skills__recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  }
}
.skills__recent-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skills__recent-name {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-color-primary);
}
.skills__recent-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.skills__recent-clear {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 4px;
  &:hover { color: var(--el-color-danger); }
}

// ── Sidebar Quality ──
.skills__sidebar-quality {
  padding: 4px 0;
  & + & { padding-top: 8px; }
}
.skills__sidebar-quality-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}
.skills__sidebar-quality-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.skills__sidebar-quality-pct {
  font-size: 11px;
  font-weight: 600;
  font-family: DIN, sans-serif;
}

// ── Sidebar Progress ──
.skills__sidebar-progress {
  padding: 0 12px 12px;
}
.skills__sidebar-progress-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

// ── Sidebar Attention Cards ──
.skills__sidebar-card--attention {
  border-left: 2px solid transparent;
  &:hover {
    border-left-color: var(--el-color-primary);
  }
}
.skills__sidebar-card--nodesc {
  .skills__sidebar-card-accent-icon,
  .skills__sidebar-card-accent-value { color: var(--el-color-warning); }
}
.skills__sidebar-card--deprecated {
  .skills__sidebar-card-accent-icon,
  .skills__sidebar-card-accent-value { color: var(--el-color-danger); }
}
.skills__sidebar-card--nofiles {
  .skills__sidebar-card-accent-icon,
  .skills__sidebar-card-accent-value { color: var(--el-color-info); }
}
.skills__sidebar-card-accent-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.skills__sidebar-card-accent-value {
  font-size: 16px;
  font-weight: 700;
  font-family: DIN, sans-serif;
  min-width: 20px;
}
.skills__sidebar-card-accent-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  flex: 1;
}

.skills__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}
</style>