<script setup lang="ts">
/**
 * OkrRecommendCard — card view for OKR recommendations.
 */
import { useI18n } from "vue-i18n";
import { View, Delete, RefreshRight } from "@element-plus/icons-vue";
import { scoreTagType, statusTagType, trendIcon } from "@/hooks/useOkrFormat";
import ProcessStages from "./ProcessStages.vue";
import { isOverdue } from "../format";
import PriorityTag from "../fields/PriorityTag.vue";
import CategoryTag from "../fields/CategoryTag.vue";
import RoleLink from "../fields/RoleLink.vue";
import GoalCell from "../fields/GoalCell.vue";
import SkillTag from "../fields/SkillTag.vue";
import AgentTag from "../fields/AgentTag.vue";
import McpTag from "../fields/McpTag.vue";
import EffortBadge from "../fields/EffortBadge.vue";
import type { OkrLevel, OkrListType, OkrTaskItem, OkrActionItem } from "../okrRecommend";

type TableRow = (OkrTaskItem & { kind: "task"; listType: OkrListType }) | OkrActionItem;

const { t } = useI18n();

defineProps<{
  items: TableRow[];
  loopByGoalId: Record<string, { loopId: string; title: string; stageMap: Record<string, { status: string; title: string; path: string }> }[]>;
  apiGoals: Record<string, any>;
  regeneratingId: string;
  expandedCards: Set<string>;
  dueRelative: (dueDate: string) => string;
  levelLabel: (l: OkrLevel) => string;
}>();

const emit = defineEmits<{
  openPreview: [row: TableRow];
  goToProcess: [loopId: string];
  openRecord: [path: string];
  openMetricPreview: [metric: any];
  openSkillPreview: [skill: string];
  openAgentChat: [agent: string];
  openMcp: [mcp: string];
  handleRegenerate: [row: TableRow];
  handleDelete: [row: TableRow];
  toggleExpandCard: [id: string];
}>();
</script>

<template>
  <div class="okr-cards">
    <div v-for="item in items" :key="item.id" class="okr-card" :class="`is-priority-${item.priority.toLowerCase()}`" @click="emit('openPreview', item)">
      <div class="okr-card__head">
        <div class="okr-card__head-left">
          <PriorityTag :priority="item.priority" />
          <CategoryTag v-if="item.kind === 'task'" :list-type="item.listType" />
          <el-tag v-else size="small" type="warning" effect="plain">Action</el-tag>
        </div>
        <div class="okr-card__head-right">
          <span class="okr-card__due" :class="{ 'is-overdue': isOverdue(item.dueDate) }">
            <template v-if="dueRelative(item.dueDate)">{{ dueRelative(item.dueDate) }}</template>
            <template v-else>{{ item.dueDate || '—' }}</template>
          </span>
          <span class="okr-card__score" :class="item.kind === 'action' ? 'is-success' : `is-${scoreTagType(item.score)}`">
            {{ item.kind === 'action' ? `${item.progress}%` : item.score }}
          </span>
        </div>
      </div>

      <div class="okr-card__title">{{ item.title }}</div>

      <div v-if="item.goalId && loopByGoalId[item.goalId]?.length" class="okr-card__process">
        <ProcessStages
          :groups="loopByGoalId[item.goalId]"
          @go-to-process="emit('goToProcess', $event)"
          @open-record="emit('openRecord', $event)"
        />
      </div>

      <div v-if="item.metric" class="okr-card__metric" @click.stop="emit('openMetricPreview', item.metric)">
        <span class="okr-card__metric-icon">{{ item.metric.icon }}</span>
        <div class="okr-card__metric-body">
          <div class="okr-card__metric-head">
            <span class="okr-card__metric-name">{{ item.metric.name }}</span>
            <span class="okr-card__metric-pct">{{ item.metric.progress }}%</span>
          </div>
          <div class="okr-card__metric-bar"><i :style="{ width: `${Math.min(item.metric.progress, 100)}%` }" /></div>
          <span class="okr-card__metric-val">{{ item.metric.current }}{{ item.metric.unit }} → {{ item.metric.target }}{{ item.metric.unit }}</span>
        </div>
      </div>

      <div v-if="item.kind === 'action' && item.status !== 'Done'" class="okr-card__progress">
        <el-progress :percentage="item.progress" :status="item.status === 'At Risk' ? 'exception' : ''" :stroke-width="6" :show-text="false" />
      </div>

      <div class="okr-card__dims">
        <span class="okr-card__dim" :class="`is-${item.roi}`"><em>ROI</em><b>{{ levelLabel(item.roi) }}</b></span>
        <span class="okr-card__dim" :class="`is-${item.difficulty}`"><em>难度</em><b>{{ levelLabel(item.difficulty) }}</b></span>
        <span class="okr-card__dim" :class="`is-${item.urgency}`"><em>紧迫</em><b>{{ levelLabel(item.urgency) }}</b></span>
      </div>

      <div v-if="item.reason" class="okr-card__reason" :class="{ 'is-expanded': expandedCards.has(item.id) }" @click.stop="emit('toggleExpandCard', item.id)">
        {{ item.reason }}
      </div>

      <div class="okr-card__foot">
        <div class="okr-card__foot-left">
          <RoleLink :role="item.role" :role-name="item.roleName" :role-icon="item.roleIcon" to="" />
          <GoalCell v-if="item.goalId" :role="item.role" :goal-id="item.goalId" :goal="apiGoals[item.goalId]" compact />
          <EffortBadge :effort="item.effort" />
        </div>
        <div class="okr-card__foot-right">
          <SkillTag v-if="item.skill" :skill="item.skill" :clickable="true" @open="emit('openSkillPreview', item.skill)" />
          <AgentTag v-if="item.agent" :agent="item.agent" :clickable="true" @open="emit('openAgentChat', item.agent)" />
          <McpTag :mcp="item.mcp" :clickable="true" @open="emit('openMcp', item.mcp)" />
        </div>
      </div>

      <div class="okr-card__actions">
        <el-button size="small" :icon="View" @click.stop="emit('openPreview', item)">预览</el-button>
        <el-button size="small" :loading="regeneratingId === item.id" :icon="RefreshRight" @click.stop="emit('handleRegenerate', item)">重生成</el-button>
        <el-button size="small" type="danger" :icon="Delete" @click.stop="emit('handleDelete', item)" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.okr-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.okr-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-top: 4px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
  position: relative;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    .okr-card__actions { opacity: 1; }
  }
  &.is-priority-p0 { border-top-color: var(--el-color-danger); }
  &.is-priority-p1 { border-top-color: var(--el-color-warning); }
  &.is-priority-p2 { border-top-color: var(--el-color-primary); }
  &.is-priority-p3 { border-top-color: var(--el-color-info); }
}

.okr-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.okr-card__head-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.okr-card__head-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.okr-card__due {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  &.is-overdue { color: var(--el-color-danger); font-weight: 700; }
}

.okr-card__score {
  font-size: 24px;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  &.is-danger { color: var(--el-color-danger); }
  &.is-warning { color: var(--el-color-warning); }
  &.is-primary { color: var(--el-color-primary); }
  &.is-info { color: var(--el-color-info); }
  &.is-success { color: var(--el-color-success); }
}

.okr-card__title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  &:hover { color: var(--el-color-primary); }
}

.okr-card__process {
  font-size: 12px;
}

.okr-card__metric {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: var(--el-fill-color-light); }
}

.okr-card__metric-icon { font-size: 16px; flex-shrink: 0; padding-top: 1px; }

.okr-card__metric-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.okr-card__metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.okr-card__metric-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.okr-card__metric-pct {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-color-primary);
  font-variant-numeric: tabular-nums;
}

.okr-card__metric-bar {
  height: 5px;
  background: var(--el-fill-color);
  border-radius: 3px;
  overflow: hidden;
  i { display: block; height: 100%; background: var(--el-color-primary); border-radius: 3px; transition: width 0.4s ease; }
}

.okr-card__metric-val {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

.okr-card__progress {
  padding: 0;
}

.okr-card__dims {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.okr-card__dim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
  em { font-style: normal; opacity: 0.7; }
  b { font-weight: 700; }
  &.is-high { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
  &.is-medium { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &.is-low { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}

.okr-card__reason {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  &.is-expanded {
    -webkit-line-clamp: unset;
    display: block;
  }
  &:hover { color: var(--el-text-color-primary); }
}

.okr-card__foot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.okr-card__foot-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.okr-card__foot-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.okr-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  position: absolute;
  top: 10px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.15s;
  background: var(--el-bg-color);
  padding: 4px 6px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>