<template>
  <div class="harness-overview">
    <PageHeaderCard
      :icon="DataBoard"
      :icon-bg="HEADER_ICON_BG"
      :title="t('home.title')"
      :description="t('home.heroDesc')"
      :show-date-nav="true"
      :filter-date="filterDate"
      :filter-date-label="filterDateLabel"
      :is-filter-today="isFilterToday"
      @prev="goToPrevDay"
      @next="goToNextDay"
      @today="goToFilterToday"
      @clear="clearFilterDate"
    >
      <template #pills>
        <div class="phc__pills">
          <div
            class="phc__pill"
            :class="{ 'is-loading': loading }"
            @click="router.push('/issue')"
          >
            <span class="phc__pill-val">{{ roleCounts.all ?? 0 }}</span>
            <span class="phc__pill-lbl">{{ t('home.stats.tasks') }}</span>
          </div>
          <div
            class="phc__pill phc__pill--accent"
            :class="{ 'is-loading': loading }"
            @click="router.push('/issue?priority=urgent')"
          >
            <span class="phc__pill-val">{{ roleCounts.p0 ?? 0 }}</span>
            <span class="phc__pill-lbl">{{ t('home.stats.p0') }}</span>
          </div>
          <div
            class="phc__pill"
            :class="{ 'is-loading': loading }"
            @click="router.push('/bug')"
          >
            <span class="phc__pill-val">{{ stats.bugCount }}</span>
            <span class="phc__pill-lbl">{{ t('home.stats.bugs') }}</span>
          </div>
        </div>
      </template>
    </PageHeaderCard>

    <div class="ho__body">
      <section class="ho__section">
        <QuickNav :counts="stats" />
      </section>

      <section class="ho__section">
        <OkrRecommendPanel :roles="selectedRoles" :projects="selectedProjects" :filter-date="filterDate" @update:counts="onCountsUpdate" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts" name="home">
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { DataBoard } from "@element-plus/icons-vue";
import OkrRecommendPanel from "@/components/OkrRecommend/OkrRecommendPanel.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import QuickNav from "./QuickNav.vue";
import { useProjectStore } from "@/stores/modules/project";
import { queryDocuments } from "@/api/modules/dataService";
import { useDateFilter } from "@/hooks/useDateFilter";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const COLLECTION_PAGE_SIZE = 1 as const;
const HEADER_ICON_BG = "linear-gradient(135deg,var(--el-color-primary),#6366f1)";

interface StatCollectionItem {
  key: "bugCount" | "requirementCount" | "totalIssues" | "totalModules" | "knowledgeFileCount" | "chatSessionCount";
  cname: string;
  extraFilter?: Record<string, any>;
  ignoreDate?: boolean;
}

const STAT_COLLECTIONS: StatCollectionItem[] = [
  { key: "bugCount", cname: "bugs" },
  { key: "requirementCount", cname: "issues", extraFilter: { issue_type: "requirement" } },
  { key: "totalIssues", cname: "issues" },
  { key: "totalModules", cname: "modules" },
  { key: "knowledgeFileCount", cname: "knowledge_files", ignoreDate: true },
  { key: "chatSessionCount", cname: "sessions", ignoreDate: true },
];

type StatKey = StatCollectionItem["key"];

const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, dateRange, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

const selectedRoles = ref<string[]>([]);
const roleCounts = ref<Record<string, number>>({});
const selectedProjects = ref<string[]>([]);
const loading = ref(false);

const stats = reactive<Record<StatKey, number>>({
  bugCount: 0,
  requirementCount: 0,
  totalIssues: 0,
  totalModules: 0,
  knowledgeFileCount: 0,
  chatSessionCount: 0,
});

async function loadCounts() {
  try {
    loading.value = true;
    const sharedDateRange = dateRange.value;
    const requests = STAT_COLLECTIONS.map(({ cname, extraFilter, ignoreDate }) => {
      const filter = ignoreDate
        ? { ...(extraFilter ?? {}) }
        : { ...sharedDateRange, ...(extraFilter ?? {}) };
      return queryDocuments<any>({ cname, filter, pageSize: COLLECTION_PAGE_SIZE });
    });
    const results = await Promise.all(requests);
    STAT_COLLECTIONS.forEach(({ key }, idx) => {
      stats[key] = results[idx].data?.total ?? 0;
    });
  } catch {
    // keep defaults
  } finally {
    loading.value = false;
  }
}

function onCountsUpdate(counts: Record<string, number>) {
  roleCounts.value = counts;
}

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
  padding: var(--page-gutter);
  background: var(--el-bg-color-page);
}

.ho__body {
  margin-top: var(--space-md);
}

.ho__section {
  margin-bottom: var(--space-md);

  &:last-child {
    margin-bottom: 0;
  }
}

.phc__pills {
  display: flex;
  align-items: stretch;
  gap: var(--space-sm);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.phc__pill {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 72px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--el-fill-color-light);
  cursor: pointer;
  user-select: none;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    transform: translateY(-1px);
    background: var(--el-fill-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  }

  &--accent {
    background: var(--el-color-danger-light-9);

    &:hover {
      background: var(--el-color-danger-light-8);
    }

    .phc__pill-val {
      color: var(--el-color-danger);
    }
  }

  &.is-loading {
    pointer-events: none;

    .phc__pill-val {
      visibility: hidden;
      position: relative;
      min-width: 2.5em;

      &::after {
        content: "";
        visibility: visible;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 0.9em;
        max-width: 48px;
        transform: translate(-50%, -50%);
        border-radius: var(--radius-xs);
        background: linear-gradient(
          90deg,
          var(--el-fill-color-light) 0%,
          var(--el-fill-color) 50%,
          var(--el-fill-color-light) 100%
        );
        background-size: 200% 100%;
        animation: phc-skeleton-shine 1.2s ease-in-out infinite;
      }
    }

    .phc__pill-lbl {
      opacity: 0.55;
    }
  }
}

.phc__pill-val {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  font-family: DIN, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--el-text-color-primary);
  text-align: center;
}

.phc__pill-lbl {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
  text-align: center;
  white-space: nowrap;
}

@keyframes phc-skeleton-shine {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 640px) {
  .harness-overview {
    padding: var(--page-gutter-narrow);
  }
  .ho__body {
    margin-top: var(--space-sm);
  }
  .ho__section {
    margin-bottom: var(--space-sm);
  }
  .phc__pills {
    width: 100%;
  }
  .phc__pill {
    flex: 1 1 0;
    min-width: 0;
    padding: var(--space-sm);
  }
}
</style>