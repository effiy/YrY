<template>
  <div class="sre-page" v-loading="loading">
    <header class="sre-page__header">
      <div class="sre-page__header-row">
        <RoleNav :active="'sre'" show-quick-nav quick-role="sre" sticky />
      </div>
      <div v-if="lastUpdated" class="sre-page__meta">
        <span class="sre-page__updated">
          {{ $t("knowledge.sre.lastUpdated") }}: {{ timeAgo }}
        </span>
        <span v-if="freshnessSeconds !== null" class="sre-page__freshness" :class="freshnessClass">
          {{ freshnessLabel }}
        </span>
      </div>
    </header>

    <KnowledgeError v-if="error && !quality" :message="error" @retry="refresh" />

    <template v-else>
      <SreKpiCards :quality="quality" />

      <SreCharts :quality="quality" />

      <el-divider />

      <SreKnowledgeSection
        v-if="knowledgeFiles.length"
        :files="knowledgeFiles"
        @open="openFile"
      />
      <div v-else-if="!loading" class="sre-page__no-knowledge">
        {{ $t("knowledge.common.noData") }}
      </div>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="SrePage">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import KnowledgeError from "@/views/knowledge/components/KnowledgeError.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import SreKpiCards from "./components/SreKpiCards.vue";
import SreCharts from "./components/SreCharts.vue";
import SreKnowledgeSection from "./components/SreKnowledgeSection.vue";
import { useSreDashboard } from "./composables/useSreDashboard";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

const { t } = useI18n();
const {
  loading,
  error,
  quality,
  knowledgeFiles,
  lastUpdated,
  freshnessSeconds,
  refresh
} = useSreDashboard();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const timeAgo = computed(() => {
  if (!lastUpdated.value) return "";
  const diff = Math.floor((Date.now() - lastUpdated.value.getTime()) / 1000);
  if (diff < 60) return t("knowledge.sre.justNow");
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
});

const freshnessClass = computed(() => {
  if (freshnessSeconds.value === null) return "";
  if (freshnessSeconds.value < 300) return "sre-page__freshness--live";
  if (freshnessSeconds.value < 3600) return "sre-page__freshness--recent";
  return "sre-page__freshness--stale";
});

const freshnessLabel = computed(() => {
  if (freshnessSeconds.value === null) return "";
  if (freshnessSeconds.value < 60) return t("knowledge.sre.live");
  if (freshnessSeconds.value < 300) return t("knowledge.sre.recent");
  if (freshnessSeconds.value < 3600) return t("knowledge.sre.active");
  return t("knowledge.sre.stale");
});

function openFile(file: KnowledgeFileEntry) {
  previewDlg.value?.open(file.path);
}
</script>

<style scoped lang="scss">
.sre-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  background: var(--el-bg-color-page);
}

.sre-page__header {
  margin-bottom: 16px;
}

.sre-page__header-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.sre-page__meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}

.sre-page__updated {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.sre-page__freshness {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &--live {
    color: #22c55e;
    background: #f0fdf4;
    &::before { background: #22c55e; animation: pulse 1.5s ease-in-out infinite; }
  }

  &--recent {
    color: #3b82f6;
    background: #eff6ff;
    &::before { background: #3b82f6; }
  }

  &--active {
    color: #f59e0b;
    background: #fffbeb;
    &::before { background: #f59e0b; }
  }

  &--stale {
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    &::before { background: var(--el-text-color-placeholder); }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.sre-page__no-knowledge {
  padding: 32px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>