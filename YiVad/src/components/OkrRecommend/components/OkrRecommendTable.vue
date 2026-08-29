<script setup lang="ts">
/**
 * OkrRecommendTable — table view for OKR recommendations.
 */
import { useI18n } from "vue-i18n";
import { Delete } from "@element-plus/icons-vue";
import { scoreTagType, statusTagType, trendIcon } from "@/hooks/useOkrFormat";
import PriorityTag from "../fields/PriorityTag.vue";
import CategoryTag from "../fields/CategoryTag.vue";
import RoleLink from "../fields/RoleLink.vue";
import GoalCell from "../fields/GoalCell.vue";
import SkillTag from "../fields/SkillTag.vue";
import AgentTag from "../fields/AgentTag.vue";
import McpTag from "../fields/McpTag.vue";
import DueLabel from "../fields/DueLabel.vue";
import EffortBadge from "../fields/EffortBadge.vue";
import type { OkrListType, OkrTaskItem, OkrActionItem } from "../okrRecommend";

type TableRow = (OkrTaskItem & { kind: "task"; listType: OkrListType }) | OkrActionItem;

const { t } = useI18n();

defineProps<{
  items: TableRow[];
  columnFilters: Record<string, string>;
  apiGoals: Record<string, any>;
  projectOfRow: (row: TableRow) => string;
  projectLabel: (project: string) => string;
}>();

const emit = defineEmits<{
  openPreview: [row: TableRow];
  openRecord: [path: string];
  openMetricPreview: [metric: any];
  openSkillPreview: [skill: string];
  openAgentChat: [agent: string];
  openMcp: [mcp: string];
  handleDelete: [row: TableRow];
  goToProject: [project: string];
}>();
</script>

<template>
  <el-table :data="items" size="small" style="width: 100%" row-key="id" highlight-current-row>
    <el-table-column min-width="280">
      <template #header>
        <div class="okr-col-head">
          <span>{{ t("home.aiRecommend.cols.task") }}</span>
          <el-input v-model="columnFilters.title" size="small" placeholder="筛选" clearable />
        </div>
      </template>
      <template #default="{ row }">
        <div class="okr-cell-task">
          <span class="okr-cell-title" @click="emit('openPreview', row as TableRow)">{{ row.title }}</span>
          <div class="okr-cell-sub">
            <DueLabel :due-date="row.dueDate" />
            <EffortBadge :effort="row.effort" />
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column width="110">
      <template #header>
        <div class="okr-col-head">
          <span>{{ t("home.aiRecommend.cols.role") }}</span>
          <el-input v-model="columnFilters.role" size="small" placeholder="筛选" clearable />
        </div>
      </template>
      <template #default="{ row }">
        <RoleLink :role="row.role" :role-name="row.roleName" :role-icon="row.roleIcon" to="" />
      </template>
    </el-table-column>
    <el-table-column width="220">
      <template #header>
        <div class="okr-col-head">
          <span>{{ t("home.aiRecommend.cols.goal") }}</span>
          <el-input v-model="columnFilters.goal" size="small" placeholder="筛选" clearable />
        </div>
      </template>
      <template #default="{ row }">
        <GoalCell v-if="row.goalId" :role="row.role" :goal-id="row.goalId" :goal="apiGoals[row.goalId]" />
        <span v-else class="okr-cell-none">—</span>
      </template>
    </el-table-column>
    <el-table-column width="240">
      <template #header>
        <div class="okr-col-head">
          <span>{{ t("home.aiRecommend.cols.reason") }}</span>
          <el-input v-model="columnFilters.reason" size="small" placeholder="筛选" clearable />
        </div>
      </template>
      <template #default="{ row }">
        <template v-if="row.kind === 'action'">
          <div class="okr-cell-reason">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
            <span v-if="row.reason" class="okr-cell-reason-text">{{ row.reason }}</span>
          </div>
        </template>
        <span v-else class="okr-cell-reason-text">{{ row.reason }}</span>
      </template>
    </el-table-column>
    <el-table-column :label="t('home.aiRecommend.cols.action')" width="80" fixed="right" align="center">
      <template #default="{ row }">
        <el-button link type="danger" size="small" :icon="Delete" @click="emit('handleDelete', row as TableRow)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
.okr-col-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  span { font-size: 12px; line-height: 1.3; }
  .el-input { width: 100%; }
}

.okr-cell-task {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.okr-cell-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  &:hover { color: var(--el-color-primary); }
}
.okr-cell-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.okr-cell-score {
  display: flex;
  align-items: center;
  gap: 6px;
  .el-progress { flex: 1; min-width: 40px; }
}
.okr-cell-score-val {
  font-size: 13px;
  font-weight: 700;
  font-family: monospace;
  flex-shrink: 0;
  &.is-danger { color: var(--el-color-danger); }
  &.is-warning { color: var(--el-color-warning); }
  &.is-primary { color: var(--el-color-primary); }
  &.is-info { color: var(--el-color-info); }
  &.is-success { color: var(--el-color-success); }
}

.okr-cell-reason {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.okr-cell-reason-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.okr-cell-none {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>