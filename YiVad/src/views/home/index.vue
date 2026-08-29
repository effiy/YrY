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
        <QuickNav
          :counts="{
            requirementCount,
            totalIssues,
            bugCount,
            totalModules,
            chatSessionCount,
            knowledgeFileCount
          }"
        />
      </section>

      <!-- ═══ OKR Panel ═══ -->
      <section class="ho__section">
        <OkrRecommendPanel :roles="selectedRoles" :projects="selectedProjects" :filter-date="filterDate" @update:counts="onCountsUpdate" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts" name="home">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import OkrRecommendPanel from "@/components/OkrRecommend/OkrRecommendPanel.vue";
import HeroStats from "./HeroStats.vue";
import QuickNav from "./QuickNav.vue";
import { useProjectStore } from "@/stores/modules/project";
import { queryDocuments } from "@/api/modules/dataService";
import { useDateFilter } from "@/hooks/useDateFilter";
import dayjs from "dayjs";

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

// ── Responsive ───────────────────────────────
@media (max-width: 640px) {
  .ho__hero { padding: 10px 16px; }
  .ho__body { padding: 12px 16px 16px; }
}
</style>