<template>
  <div class="skills page">
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
    <RecentlyViewed
      :items="recentViewedItems"
      label="Recently viewed"
      @click="id => openSkill(recentlyViewed.find(r => r.id === id)!)"
      @clear="recentlyViewed = []"
    />

    <!-- Active Filter Pills -->
    <FilterPills :pills="activePills" @clear-all="clearAllFilters" />

    <div class="skills__body">
      <!-- Sidebar -->
      <div class="skills__sidebar">
        <div class="skills__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="card"
              ><el-icon><Grid /></el-icon
            ></el-radio-button>
            <el-radio-button value="list"
              ><el-icon><List /></el-icon
            ></el-radio-button>
            <el-radio-button value="table"
              ><el-icon><Tickets /></el-icon
            ></el-radio-button>
          </el-radio-group>
        </div>
        <div class="skills__sidebar-section">
          <div class="skills__sidebar-section-header">
            <span class="skills__sidebar-section-label">Overview</span>
            <span class="skills__sidebar-section-hint">{{ filteredSkills.length }} skills</span>
          </div>
          <div class="skills__sidebar-section-body">
            <div class="skills__sidebar-card" @click="clearAllFilters()">
              <div class="skills__sidebar-card-icon" style="background: linear-gradient(135deg, #7c3aed, #6d28d9)">
                <el-icon><MagicStick /></el-icon>
              </div>
              <div class="skills__sidebar-card-info">
                <span class="skills__sidebar-card-value">{{ skills.length }}</span>
                <span class="skills__sidebar-card-label">Total</span>
              </div>
            </div>
            <div class="skills__sidebar-card" @click="toggleLifecycle('active')">
              <div class="skills__sidebar-card-icon" style="background: linear-gradient(135deg, #5ab1ef, #3a90d0)">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="skills__sidebar-card-info">
                <span class="skills__sidebar-card-value">{{ activeCount }}</span>
                <span class="skills__sidebar-card-label">Active</span>
              </div>
            </div>
            <div class="skills__sidebar-card" @click="applyInvocableFilter()">
              <div class="skills__sidebar-card-icon" style="background: linear-gradient(135deg, #91cc75, #7ab85e)">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
              <div class="skills__sidebar-card-info">
                <span class="skills__sidebar-card-value">{{ invocableCount }}</span>
                <span class="skills__sidebar-card-label">Invocable</span>
              </div>
            </div>
            <div class="skills__sidebar-card">
              <div class="skills__sidebar-card-icon" style="background: linear-gradient(135deg, #e6a23c, #d49520)">
                <el-icon><Collection /></el-icon>
              </div>
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
        <div class="skills__sidebar-section" style="margin-top: 12px">
          <div class="skills__sidebar-section-header" style="border-left-color: var(--el-color-danger)">
            <span class="skills__sidebar-section-label">Needs Attention</span>
          </div>
          <div class="skills__sidebar-section-body">
            <div
              class="skills__sidebar-card skills__sidebar-card--attention skills__sidebar-card--nodesc"
              @click="applyAttentionFilter('nodesc')"
            >
              <el-icon class="skills__sidebar-card-accent-icon"><WarningFilled /></el-icon>
              <span class="skills__sidebar-card-accent-value">{{ attention.noDescription }}</span>
              <span class="skills__sidebar-card-accent-label">No Description</span>
            </div>
            <div
              class="skills__sidebar-card skills__sidebar-card--attention skills__sidebar-card--deprecated"
              @click="applyAttentionFilter('deprecated')"
            >
              <el-icon class="skills__sidebar-card-accent-icon"><CircleCloseFilled /></el-icon>
              <span class="skills__sidebar-card-accent-value">{{ attention.deprecated }}</span>
              <span class="skills__sidebar-card-accent-label">Deprecated</span>
            </div>
            <div
              class="skills__sidebar-card skills__sidebar-card--attention skills__sidebar-card--nofiles"
              @click="applyAttentionFilter('nofiles')"
            >
              <el-icon class="skills__sidebar-card-accent-icon"><DocumentDelete /></el-icon>
              <span class="skills__sidebar-card-accent-value">{{ attention.noFiles }}</span>
              <span class="skills__sidebar-card-accent-label">No Files</span>
            </div>
          </div>
        </div>
        <div class="skills__sidebar-section" style="margin-top: 12px">
          <div class="skills__sidebar-section-header" style="border-left-color: #7c3aed">
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
        <div class="skills__sidebar-section" style="margin-top: 12px">
          <div class="skills__sidebar-section-header" style="border-left-color: var(--el-color-success)">
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
        <div class="skills__sidebar-section" style="margin-top: 12px">
          <div class="skills__sidebar-section-header" style="border-left-color: var(--el-color-warning)">
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
                <el-tag :type="categoryTagType(row.category)" size="small" effect="plain">{{
                  categoryLabel(row.category)
                }}</el-tag>
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
          v-if="paginatedTotal > cardPageSize"
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
            <div v-for="skill in paginatedSkills" :key="skill.id" class="skills-card-item" @click="openSkill(skill)">
              <div class="skills-card-item__head">
                <span class="skills-card-item__icon">{{ skill.icon || "📄" }}</span>
                <span class="skills-card-item__dot" :style="{ background: lifecycleColor(skill.lifecycle) }" />
                <code class="skills-card-item__key">/{{ skill.name }}</code>
                <div class="skills-card-item__head-right">
                  <el-tag :type="categoryTagType(skill.category)" size="small" effect="plain">{{
                    categoryLabel(skill.category)
                  }}</el-tag>
                  <span v-if="skill.user_invocable" class="skills__card-tag skills__card-tag--invocable">invocable</span>
                  <el-button
                    v-if="skillFiles[skill.id]?.length"
                    link
                    size="small"
                    :icon="Edit"
                    title="Edit skill file"
                    @click.stop="openFile(skillFiles[skill.id][0].path)"
                  />
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
                  <span class="skills-card-item__file-accent" :style="{ background: fileTypeInfo(f).accent }" />
                  <span class="skills-card-item__file-icon">{{ fileTypeInfo(f).icon }}</span>
                  <span class="skills-card-item__file-name">{{ f.name }}</span>
                  <span class="skills-card-item__file-type">{{ fileTypeInfo(f).label }}</span>
                </div>
                <div v-if="skillFiles[skill.id].length > 4" class="skills-card-item__file-more">
                  +{{ skillFiles[skill.id].length - 4 }} more files
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- List View -->
        <template v-else-if="viewMode === 'list'">
          <div class="skills-list-view">
            <div v-for="skill in paginatedSkills" :key="skill.id" class="skills-list-view__row" @click="openSkill(skill)">
              <span class="skills-list-view__dot" :style="{ background: lifecycleColor(skill.lifecycle) }" />
              <code class="skills-list-view__key">/{{ skill.name }}</code>
              <span class="skills-list-view__title">{{ skill.title }}</span>
              <el-tag :type="categoryTagType(skill.category)" size="small" effect="plain">{{
                categoryLabel(skill.category)
              }}</el-tag>
              <el-tag :type="lifecycleTagType(skill.lifecycle)" size="small">{{ skill.lifecycle }}</el-tag>
              <span v-if="skill.user_invocable" class="skills__card-tag skills__card-tag--invocable">invocable</span>
              <span class="skills-list-view__files">{{ skillFiles[skill.id]?.length || 0 }} files</span>
            </div>
          </div>
        </template>

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
import {
  MagicStick,
  Loading,
  CircleCheckFilled,
  Collection,
  Search,
  Grid,
  List,
  Tickets,
  WarningFilled,
  CircleCloseFilled,
  DocumentDelete,
  Edit
} from "@element-plus/icons-vue";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import RecentlyViewed from "@/components/RecentlyViewed/RecentlyViewed.vue";
import FilterPills from "@/components/FilterPills/FilterPills.vue";
import { categories, skills as staticSkills } from "./constants";
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

// Display mapping built from static skill registry (source of truth)
const skillDisplayMap = new Map(staticSkills.map(s => [s.id, { icon: s.icon, category: s.category }]));

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
const recentViewedItems = computed(() =>
  recentlyViewed.value.map(r => ({ key: r.id, title: r.title, color: lifecycleColor(r.lifecycle) }))
);
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
    grkey: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
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
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        center: ["50%", "42%"],
        label: { show: false },
        data: [
          { name: "User-invocable", value: invocable, itemStyle: { color: "#10b981" } },
          { name: "Internal", value: internal, itemStyle: { color: "#909399" } }
        ]
      }
    ]
  };
});

const filesBarOption = computed<ECOption>(() => {
  const top = [...skills.value]
    .filter(s => skillFiles.value[s.id]?.length)
    .sort((a, b) => b.files - a.files)
    .slice(0, 10);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grkey: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: top.map(s => s.name), axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [
      { type: "bar", data: top.map(s => s.files), itemStyle: { color: "#7c3aed", borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }
    ]
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
  if (type === "deprecated") {
    activeLifecycle.value = "deprecated";
  } else if (type === "nofiles") {
    showNoFiles.value = true;
  }
  // "nodesc" keeps all filters cleared — skills without descriptions show naturally
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
      s => s.title.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
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
  const pills: Array<{ key: string; label: string; clear: () => void }> = [];
  if (activeCategory.value) {
    const cat = categories.find(c => c.id === activeCategory.value);
    pills.push({
      key: "cat",
      label: `Category: ${cat?.label || activeCategory.value}`,
      clear: () => {
        activeCategory.value = "";
      }
    });
  }
  if (activeLifecycle.value) {
    pills.push({
      key: "lc",
      label: `Lifecycle: ${activeLifecycle.value}`,
      clear: () => {
        activeLifecycle.value = "";
      }
    });
  }
  if (invocableOnly.value) {
    pills.push({
      key: "inv",
      label: "Invocable only",
      clear: () => {
        invocableOnly.value = false;
      }
    });
  }
  if (showNoFiles.value) {
    pills.push({
      key: "nofiles",
      label: "Showing empty skills",
      clear: () => {
        showNoFiles.value = false;
      }
    });
  }
  if (searchText.value) {
    pills.push({
      key: "search",
      label: `Search: ${searchText.value}`,
      clear: () => {
        searchText.value = "";
      }
    });
  }
  return pills;
});

function applyInvocableFilter() {
  invocableOnly.value = !invocableOnly.value;
  activeCategory.value = "";
  activeLifecycle.value = "";
  cardPage.value = 1;
}

function toggleCategory(catId: string) {
  activeCategory.value = activeCategory.value === catId ? "" : catId;
  activeLifecycle.value = "";
  invocableOnly.value = false;
  cardPage.value = 1;
}

function toggleLifecycle(lc: string) {
  activeLifecycle.value = activeLifecycle.value === lc ? "" : lc;
  activeCategory.value = "";
  invocableOnly.value = false;
  cardPage.value = 1;
}

function clearAllFilters() {
  searchText.value = "";
  activeCategory.value = "";
  activeLifecycle.value = "";
  invocableOnly.value = false;
  showNoFiles.value = false;
  cardPage.value = 1;
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
  router.push(`/knowledge/skills/${skill.id}`);
}

function openFile(path: string) {
  previewDlgRef.value?.open(path);
}

const FILE_TYPE_INFO: Record<string, { icon: string; accent: string; label: string }> = {
  "skill.md": { icon: "⭐", accent: "#f59e0b", label: "Skill" },
  ".md": { icon: "📄", accent: "#409eff", label: "" },
  ".mjs": { icon: "📜", accent: "#7c3aed", label: "" },
  ".js": { icon: "📜", accent: "#7c3aed", label: "" },
  ".ts": { icon: "🔷", accent: "#7c3aed", label: "" },
  ".json": { icon: "📋", accent: "#10b981", label: "" }
};

function fileTypeInfo(f: KnowledgeFileEntry) {
  const n = f.name.toLowerCase();
  if (FILE_TYPE_INFO[n]) return FILE_TYPE_INFO[n];
  for (const [ext, info] of Object.entries(FILE_TYPE_INFO)) {
    if (ext.startsWith(".") && n.endsWith(ext)) return info;
  }
  return { icon: "📁", accent: "#909399", label: fileRoleLabel(f) };
}

function fileRoleLabel(f: KnowledgeFileEntry): string {
  const path = f.path.toLowerCase();
  if (path.includes("/agents/")) return "Agent";
  if (path.includes("/commands/")) return "Cmd";
  if (path.includes("/rules/")) return "Rule";
  if (path.includes("/references/")) return "Ref";
  if (path.includes("/steps/")) return "Step";
  if (path.includes("/templates/")) return "Tpl";
  if (path.includes("/lib/")) return "Lib";
  return "";
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
      const display = skillDisplayMap.get(skillId) ?? { icon: "📄", category: "ai" };

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
        category: display.category
      });
    }

    skillsList.sort((a, b) => a.title.localeCompare(b.title));
    skillFiles.value = filesMap;
    skills.value = skillsList;
  } finally {
    loading.value = false;
  }
}

onMounted(loadSkills);

watch(searchText, () => {
  cardPage.value = 1;
});
</script>


<style scoped lang="scss">
@use "./styles/skills.scss";
</style>
