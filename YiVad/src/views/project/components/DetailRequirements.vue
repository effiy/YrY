<template>
  <div>
    <!-- ═══ Requirements Summary Bar ═══ -->
    <div class="dr-summary">
      <div class="dr-summary__item">
        <span class="dr-summary__value">{{ summary.total }}</span>
        <span class="dr-summary__label">{{ $t("project.requirements.stats.total") }}</span>
      </div>
      <div class="dr-summary__item">
        <span class="dr-summary__value" style="color: #e6a23c">{{ summary.inProgress }}</span>
        <span class="dr-summary__label">{{ $t("project.requirements.stats.inProgress") }}</span>
      </div>
      <div class="dr-summary__item">
        <span class="dr-summary__value" style="color: #67c23a">{{ summary.done }}</span>
        <span class="dr-summary__label">{{ $t("project.requirements.stats.done") }}</span>
      </div>
    </div>

    <IssueList :project-key="projectKey" :filter-date="filterDate" filter-issue-type="requirement" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import IssueList from "@/views/issue/index.vue";
import { useRequirements } from "@/views/project/composables/useRequirements";

const props = defineProps<{
  projectKey: string;
  filterDate?: Date | null;
  knowledgeFiles?: KnowledgeFileEntry[];
}>();

const { items: reqItems, deriveFrom } = useRequirements();

function refresh() {
  deriveFrom(props.knowledgeFiles || [], props.projectKey);
}

watch(() => [props.knowledgeFiles, props.projectKey], refresh, { immediate: true });

const summary = computed(() => {
  const items = reqItems.value;
  const total = items.length;
  const inProgress = items.filter(i => i.status === "in_progress").length;
  const done = items.filter(i => i.status === "done").length;
  return { total, inProgress, done };
});
</script>

<style scoped lang="scss">
.dr-summary {
  display: flex;
  gap: 1px;
  margin-bottom: 16px;
  background: var(--el-border-color-lighter);
  border-radius: 10px;
}

.dr-summary__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 10px;
  background: var(--el-bg-color);
}

.dr-summary__value {
  font-size: 20px;
  font-weight: 800;
  font-family: "SF Mono", Menlo, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--el-text-color-primary);
}

.dr-summary__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
</style>