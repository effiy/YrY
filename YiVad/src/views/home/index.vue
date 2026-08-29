<template>
  <div class="harness-overview">
    <!-- ═══ Hero + Pipeline (merged row) ═══ -->
    <section class="ho__hero">
      <div class="ho__hero-body">
        <HeroStats
          :loading="loading"
          :role-counts="roleCounts"
          :bug-count="bugCount"
          :filter-date="filterDate"
          :filter-date-label="filterDateLabel"
          :is-filter-today="isFilterToday"
          @prev="goToPrevDay"
          @next="goToNextDay"
          @today="goToFilterToday"
          @clear="clearFilterDate"
        />
      </div>
    </section>

    <div class="ho__body">
      <!-- ═══ Quick Nav ═══ -->
      <section class="ho__section">
        <div class="ho__quick-nav">
          <template v-for="group in quickNavGroups" :key="group.key">
            <div class="ho__quick-nav-group">
              <span class="ho__quick-nav-grouplabel">{{ group.label }}</span>
              <template v-for="nav in group.items" :key="nav.key || nav.path">
                <!-- Knowledge: popover with sub-pages -->
                <el-popover
                  v-if="nav.key === 'knowledge'"
                  :visible="knowledgePopoverVisible"
                  trigger="click"
                  placement="bottom-start"
                  :width="200"
                  :offset="4"
                  popper-class="ho__knowledge-popover"
                  @show="knowledgePopoverVisible = true"
                  @hide="knowledgePopoverVisible = false"
                >
                  <template #reference>
                    <div class="ho__quick-card" @click="knowledgePopoverVisible = !knowledgePopoverVisible">
                      <span class="ho__quick-icon">{{ nav.icon }}</span>
                      <span class="ho__quick-label">{{ nav.label }}</span>
                      <span v-if="nav.count !== undefined" class="ho__quick-count">{{ nav.count }}</span>
                      <el-icon class="ho__quick-arrow" :class="{ 'is-open': knowledgePopoverVisible }"><ArrowDown /></el-icon>
                    </div>
                  </template>
                  <div class="ho__knowledge-grid">
                    <div
                      v-for="sub in knowledgeSubPages"
                      :key="sub.path"
                      class="ho__knowledge-item"
                      @click="router.push(sub.path); knowledgePopoverVisible = false"
                    >
                      <span class="ho__knowledge-item-icon">{{ sub.icon }}</span>
                      <span class="ho__knowledge-item-label">{{ sub.label }}</span>
                    </div>
                  </div>
                </el-popover>
                <!-- RSS: external link icon -->
                <div v-else-if="nav.key === 'rss'" class="ho__quick-card" @click="router.push(nav.path)">
                  <span class="ho__quick-icon">{{ nav.icon }}</span>
                  <span class="ho__quick-label">{{ nav.label }}</span>
                  <el-icon class="ho__quick-external"><TopRight /></el-icon>
                </div>
                <!-- Normal -->
                <div v-else class="ho__quick-card" @click="router.push(nav.path)">
                  <span class="ho__quick-icon">{{ nav.icon }}</span>
                  <span class="ho__quick-label">{{ nav.label }}</span>
                  <span v-if="nav.count !== undefined" class="ho__quick-count">{{ nav.count }}</span>
                </div>
              </template>
            </div>
          </template>
        </div>
      </section>

      <!-- ═══ OKR Panel ═══ -->
      <section class="ho__section">
        <OkrRecommendPanel :roles="selectedRoles" :projects="selectedProjects" :filter-date="filterDate" @update:counts="onCountsUpdate" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts" name="home">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowDown, TopRight } from "@element-plus/icons-vue";
import OkrRecommendPanel from "@/components/OkrRecommend/OkrRecommendPanel.vue";
import HeroStats from "./HeroStats.vue";
import { useProjectStore } from "@/stores/modules/project";
import { queryDocuments } from "@/api/modules/dataService";
import { useDateFilter } from "@/hooks/useDateFilter";
import dayjs from "dayjs";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

// ── Date filter (shared with OkrRecommendPanel) ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

const selectedRoles = ref<string[]>([]);
const roleCounts = ref<Record<string, number>>({});
const selectedProjects = ref<string[]>([]);
const bugCount = ref(0);
const totalIssues = ref(0);
const totalModules = ref(0);
const requirementCount = ref(0);
const knowledgeFileCount = ref(0);
const chatSessionCount = ref(0);
const loading = ref(false);

async function loadCounts() {
  try {
    loading.value = true;
    const dateFilter = filterDateStr.value ? { updated_at: { $gte: filterDateStr.value, $lt: dayjs(filterDateStr.value).add(1, "day").format("YYYY-MM-DD") } } : {};
    const [bugsRes, issuesRes, allIssuesRes, modulesRes, knowledgeRes, sessionsRes] = await Promise.all([
      queryDocuments<any>({ cname: "bugs", filter: dateFilter, pageSize: 1 }),
      queryDocuments<any>({ cname: "issues", filter: { ...dateFilter, issue_type: "requirement" }, pageSize: 1 }),
      queryDocuments<any>({ cname: "issues", filter: dateFilter, pageSize: 1 }),
      queryDocuments<any>({ cname: "modules", filter: dateFilter, pageSize: 1 }),
      queryDocuments<any>({ cname: "knowledge_files", filter: {}, pageSize: 1 }),
      queryDocuments<any>({ cname: "sessions", filter: {}, pageSize: 1 }),
    ]);
    bugCount.value = bugsRes.data?.total ?? 0;
    totalIssues.value = allIssuesRes.data?.total ?? 0;
    totalModules.value = modulesRes.data?.total ?? 0;
    requirementCount.value = issuesRes.data?.total ?? 0;
    knowledgeFileCount.value = knowledgeRes.data?.total ?? 0;
    chatSessionCount.value = sessionsRes.data?.total ?? 0;
  } catch {
    // keep defaults
  } finally {
    loading.value = false;
  }
}

const knowledgePopoverVisible = ref(false);

const knowledgeSubPages = [
  { icon: "🤖", label: "AI", path: "/aier" },
  { icon: "📚", label: "Curator", path: "/curator" },
  { icon: "⚙️", label: "Engineer", path: "/engineer" },
  { icon: "🏆", label: "Executive", path: "/executiver" },
  { icon: "⭐", label: "Tech Lead", path: "/leader" },
  { icon: "📦", label: "Producter", path: "/producter" },
  { icon: "🔄", label: "Pipeline", path: "/pipeline" },
  { icon: "🛠️", label: "Skills", path: "/skills" },
  { icon: "🛡️", label: "SRE", path: "/srer" },
];

const quickNavGroups = computed(() => [
  {
    key: "plan",
    label: locale.value === "zh" ? "P · 规划" : "P · Plan",
    items: [
      { icon: "📌", label: t("home.quickNavItems.kanban.label"), path: "/kanban" },
      { icon: "🗺️", label: t("home.quickNavItems.roadmap.label"), path: "/roadmap", count: requirementCount.value },
      { icon: "🛠️", label: "Skills", path: "/skills" },
    ]
  },
  {
    key: "build",
    label: locale.value === "zh" ? "D · 执行" : "D · Do",
    items: [
      { icon: "📁", label: t("home.quickNavItems.project.label"), path: "/project", count: projectStore.projects.length },
      { icon: "🎯", label: t("home.quickNavItems.issue.label"), path: "/issue", count: totalIssues.value },
      { icon: "📡", label: "RSS", key: "rss", path: "/dashboard/rssContent" },
    ]
  },
  {
    key: "quality",
    label: locale.value === "zh" ? "C · 检查" : "C · Check",
    items: [
      { icon: "🐛", label: t("home.quickNavItems.bug.label"), path: "/bug", count: bugCount.value },
      { icon: "🧩", label: t("home.quickNavItems.module.label"), path: "/module", count: totalModules.value },
      { icon: "🔍", label: t("home.quickNavItems.search.label"), path: "/search" },
    ]
  },
  {
    key: "intelligence",
    label: locale.value === "zh" ? "A · 改进" : "A · Act",
    items: [
      { icon: "🤖", label: t("home.quickNavItems.aiChat.label"), path: "/aiChat", count: chatSessionCount.value },
      { icon: "📚", label: t("home.quickNavItems.knowledge.label"), key: "knowledge", path: "/knowledge", count: knowledgeFileCount.value },
      { icon: "📊", label: t("home.quickNavItems.analytics.label"), path: "/analytics" },
    ]
  },
]);

// ── OKR counts — also update stat cards with role breakdown ──
function onCountsUpdate(counts: Record<string, number>) {
  roleCounts.value = counts;
}

// ── Query sync ───────────────────────────────────
function syncProjectFromQuery() {
  const q = route.query.project;
  if (typeof q === "string" && q.trim()) {
    const valid = new Set(projectStore.projects.map(p => p.key));
    selectedProjects.value = q.split(",").map(s => s.trim()).filter(k => valid.has(k));
  }
}

onMounted(async () => {
  await projectStore.fetchProjects();
  syncProjectFromQuery();
  loadCounts();
});

watch(() => route.query.project, () => syncProjectFromQuery());
watch(filterDateStr, () => {
  loadCounts();
});
</script>

<style scoped lang="scss">
.harness-overview {
  box-sizing: border-box;
  min-height: 100%;
  background: var(--el-bg-color-page);
}

// ── Hero ─────────────────────────────────────
.ho__hero {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 8px 24px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    var(--el-bg-color-page) 50%,
    var(--el-fill-color-light) 100%
  );
  border-bottom: 1px solid var(--el-border-color-lighter);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50px;
    right: -30px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: var(--el-color-primary-light-7);
    opacity: 0.15;
    pointer-events: none;
  }
  &::after {
    content: "";
    position: absolute;
    bottom: -30px;
    left: 8%;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--el-color-primary-light-8);
    opacity: 0.12;
    pointer-events: none;
  }
}

// ── Body ─────────────────────────────────────
.ho__body {
  padding: 16px 24px 20px;
}

.ho__section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

// ── Quick Nav ────────────────────────────────
.ho__quick-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.ho__quick-nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ho__quick-nav-grouplabel {
  font-size: 9px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px;
  border-left: 2px solid transparent;

  .ho__quick-nav-group:nth-child(1) & { border-left-color: #7c3aed; }
  .ho__quick-nav-group:nth-child(2) & { border-left-color: #409eff; }
  .ho__quick-nav-group:nth-child(3) & { border-left-color: #e6a23c; }
  .ho__quick-nav-group:nth-child(4) & { border-left-color: #67c23a; }
}

.ho__quick-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}

.ho__quick-icon {
  font-size: 15px;
  flex-shrink: 0;
  line-height: 1;
}

.ho__quick-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ho__quick-count {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
  text-align: center;
}

.ho__quick-arrow {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  transition: transform 0.2s;
  flex-shrink: 0;

  &.is-open { transform: rotate(180deg); }
}

.ho__quick-external {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  transition: color 0.15s;

  .ho__quick-card:hover & { color: var(--el-color-primary); }
}

// ── Knowledge popover ────────────────────────
.ho__knowledge-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 4px;
}

.ho__knowledge-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: var(--el-fill-color-light); }
}

.ho__knowledge-item-icon {
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1;
}

.ho__knowledge-item-label {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

// ── Responsive ───────────────────────────────
@media (max-width: 900px) {
  .ho__quick-nav { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .ho__hero { padding: 10px 16px; }
  .ho__body { padding: 12px 16px 16px; }
  .ho__quick-nav { grid-template-columns: 1fr; }
}
</style>

<style lang="scss">
.ho__knowledge-popover {
  padding: 4px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}
</style>