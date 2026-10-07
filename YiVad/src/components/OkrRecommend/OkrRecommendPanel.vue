<template>
  <div class="okr-rec">
    <div class="okr-rec__body">
      <!-- ═══ Sidebar ═══ -->
      <OkrFilterBar
        :view-mode="viewMode"
        :category-filter="categoryFilter"
        :category-counts="categoryCounts"
        @update:view-mode="viewMode = $event"
        @update:category-filter="categoryFilter = $event"
      />

      <!-- ═══ Content ═══ -->
      <div class="okr-rec__content">
        <div class="okr-rec__section-body">
          <!-- ═══ 表格视图：四类推荐清单合并 ═══ -->
          <OkrRecommendTable
            v-if="viewMode === 'table'"
            :items="filteredItems"
            :column-filters="columnFilters"
            :api-goals="apiGoals"
            :project-of-row="projectOfRow"
            :project-label="projectLabel"
            @open-preview="openPreview"
            @open-record="openRecord"
            @open-metric-preview="openMetricPreview"
            @open-skill-preview="openSkillPreview"
            @open-agent-chat="openAgentChat"
            @open-mcp="openMcp"
            @handle-delete="handleDelete"
            @go-to-project="goToProject"
          />

          <!-- ═══ 列表视图 ═══ -->
          <OkrRecommendList
            v-else-if="viewMode === 'list'"
            :items="filteredItems"
            :loop-by-goal-id="loopByGoalId"
            :api-goals="apiGoals"
            :regenerating-id="regeneratingId"
            :due-relative="dueRelative"
            @open-preview="openPreview"
            @go-to-process="goToProcess"
            @open-record="openRecord"
            @open-metric-preview="openMetricPreview"
            @open-skill-preview="openSkillPreview"
            @open-agent-chat="openAgentChat"
            @open-mcp="openMcp"
            @handle-regenerate="handleRegenerate"
            @handle-delete="handleDelete"
          />

          <!-- ═══ 卡片视图 ═══ -->
          <OkrRecommendCard
            v-else
            :items="filteredItems"
            :loop-by-goal-id="loopByGoalId"
            :api-goals="apiGoals"
            :regenerating-id="regeneratingId"
            :expanded-cards="expandedCards"
            :due-relative="dueRelative"
            :level-label="levelLabel"
            @open-preview="openPreview"
            @go-to-process="goToProcess"
            @open-record="openRecord"
            @open-metric-preview="openMetricPreview"
            @open-skill-preview="openSkillPreview"
            @open-agent-chat="openAgentChat"
            @open-mcp="openMcp"
            @handle-regenerate="handleRegenerate"
            @handle-delete="handleDelete"
            @toggle-expand-card="toggleExpandCard"
          />

          <!-- ═══ 空状态 ═══ -->
          <el-empty v-if="!filteredItems.length" :description="$t('home.aiRecommend.empty')" :image-size="48" />

          <KnowledgePreviewDialog ref="previewDlg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="OkrRecommendPanel">
import OkrFilterBar from "./OkrFilterBar.vue";
import OkrRecommendTable from "./components/OkrRecommendTable.vue";
import OkrRecommendCard from "./components/OkrRecommendCard.vue";
import OkrRecommendList from "./components/OkrRecommendList.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useOkrPanel } from "./useOkrPanel";

const props = defineProps<{ projects?: string[]; roles?: string[]; filterDate?: Date | null }>();

const emit = defineEmits<{ (e: "update:counts", counts: Record<string, number>): void }>();

const {
  viewMode,
  categoryFilter,
  columnFilters,
  expandedCards,
  generating,
  regeneratingId,
  actionItems,
  loopGroups,
  previewDlg,
  lists,
  apiRoles,
  apiGoals,
  selectedRoles,
  roleScope,
  roleOptions,
  allRows,
  roleCounts,
  filteredItems,
  categoryCounts,
  stats,
  loopByGoalId,
  filterDate,
  isFilterToday,
  projectOfRow,
  toggleExpandCard,
  dueRelative,
  statusTagType,
  isResolvedRisk,
  levelLabel,
  scoreTagType,
  trendIcon,
  openPreview,
  openMetricPreview,
  openSkillPreview,
  openAgentChat,
  openMcp,
  stageIcon,
  stageLabel,
  goToProcess,
  projectLabel,
  goToProject,
  openRecord,
  handleDelete,
  handleGenerate,
  handleRegenerate,
  loadMetadata,
  STAGES,
  STAGE_KEYS,
  STAGE_ORDER,
  LIST_TYPES
} = useOkrPanel(props, emit);
</script>


<style scoped lang="scss">
@use "../../styles/OkrRecommendPanel.scss";
</style>
