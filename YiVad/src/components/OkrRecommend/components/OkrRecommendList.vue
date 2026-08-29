<script setup lang="ts">
/**
 * OkrRecommendList — list view for OKR recommendations.
 */
import { useI18n } from "vue-i18n";
import { RefreshRight, Delete, Clock } from "@element-plus/icons-vue";
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
import DueLabel from "../fields/DueLabel.vue";
import type { OkrListType, OkrTaskItem, OkrActionItem } from "../okrRecommend";

type TableRow = (OkrTaskItem & { kind: "task"; listType: OkrListType }) | OkrActionItem;

const { t } = useI18n();

defineProps<{
  items: TableRow[];
  loopByGoalId: Record<string, { loopId: string; title: string; stageMap: Record<string, { status: string; title: string; path: string }> }[]>;
  apiGoals: Record<string, any>;
  regeneratingId: string;
  dueRelative: (dueDate: string) => string;
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
}>();
</script>

<template>
  <div class="okr-list">
    <div v-for="item in items" :key="item.id" class="okr-list__item" :class="`is-priority-${item.priority.toLowerCase()}`" @click="emit('openPreview', item)">
      <div class="okr-list__left">
        <PriorityTag :priority="item.priority" />
        <CategoryTag v-if="item.kind === 'task'" :list-type="item.listType" />
        <el-tag v-else size="small" type="warning" effect="plain">Action</el-tag>
      </div>

      <div class="okr-list__body">
        <div class="okr-list__head">
          <span class="okr-list__title">{{ item.title }}</span>
          <span v-if="item.kind === 'action'" class="okr-list__status" :class="`is-${statusTagType(item.status)}`">
            <span class="okr-list__status-dot" />{{ item.status }}
          </span>
        </div>

        <div class="okr-list__meta">
          <RoleLink :role="item.role" :role-name="item.roleName" :role-icon="item.roleIcon" to="" />
          <GoalCell v-if="item.goalId" :role="item.role" :goal-id="item.goalId" :goal="apiGoals[item.goalId]" compact />
          <EffortBadge :effort="item.effort" />
          <span class="okr-list__due" :class="{ 'is-overdue': isOverdue(item.dueDate) }">
            <el-icon><Clock /></el-icon>
            <template v-if="dueRelative(item.dueDate)">{{ dueRelative(item.dueDate) }}</template>
            <template v-else>{{ item.dueDate || '—' }}</template>
          </span>
        </div>

        <div v-if="item.goalId && loopByGoalId[item.goalId]?.length" class="okr-list__process">
          <ProcessStages
            :groups="loopByGoalId[item.goalId]"
            @go-to-process="emit('goToProcess', $event)"
            @open-record="emit('openRecord', $event)"
          />
        </div>

        <div v-if="item.metric" class="okr-list__metric" @click.stop="emit('openMetricPreview', item.metric)">
          <span class="okr-list__metric-icon">{{ item.metric.icon }}</span>
          <span class="okr-list__metric-bar"><i :style="{ width: `${Math.min(item.metric.progress, 100)}%` }" /></span>
          <span class="okr-list__metric-val">{{ item.metric.current }}{{ item.metric.unit }} → {{ item.metric.target }}{{ item.metric.unit }}</span>
          <span class="okr-list__metric-pct">{{ item.metric.progress }}%</span>
        </div>

        <div class="okr-list__tags">
          <SkillTag v-if="item.skill" :skill="item.skill" :clickable="true" @open="emit('openSkillPreview', item.skill)" />
          <AgentTag v-if="item.agent" :agent="item.agent" :clickable="true" @open="emit('openAgentChat', item.agent)" />
          <McpTag :mcp="item.mcp" :clickable="true" @open="emit('openMcp', item.mcp)" />
        </div>
      </div>

      <div class="okr-list__right">
        <span class="okr-list__score" :class="item.kind === 'action' ? 'is-success' : `is-${scoreTagType(item.score)}`">
          {{ item.kind === 'action' ? `${item.progress}%` : item.score }}
        </span>
        <div class="okr-list__actions">
          <el-button link type="primary" size="small" :loading="regeneratingId === item.id" :icon="RefreshRight" @click.stop="emit('handleRegenerate', item)" />
          <el-button link type="danger" size="small" :icon="Delete" @click.stop="emit('handleDelete', item)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.okr-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.okr-list__item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 4px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, border-left-color 0.15s, background 0.15s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    background: var(--el-fill-color-lighter);
    .okr-list__actions { opacity: 1; }
  }
  &.is-priority-p0 { border-left-color: var(--el-color-danger); }
  &.is-priority-p1 { border-left-color: var(--el-color-warning); }
  &.is-priority-p2 { border-left-color: var(--el-color-primary); }
  &.is-priority-p3 { border-left-color: var(--el-color-info); }
}

.okr-list__left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 1px;
}

.okr-list__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.okr-list__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.okr-list__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  &:hover { color: var(--el-color-primary); }
}

.okr-list__status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 10px;
  &.is-success { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &.is-danger { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
  &.is-warning { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &.is-info { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}

.okr-list__status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  .is-success & { background: var(--el-color-success); }
  .is-danger & { background: var(--el-color-danger); }
  .is-warning & { background: var(--el-color-warning); }
  .is-info & { background: var(--el-color-info); }
}

.okr-list__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.okr-list__due {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  white-space: nowrap;
  margin-left: auto;
  &.is-overdue { color: var(--el-color-danger); font-weight: 700; }
}

.okr-list__process {
  font-size: 12px;
}

.okr-list__metric {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  &:hover { background: var(--el-fill-color-light); }
}

.okr-list__metric-icon { font-size: 14px; flex-shrink: 0; }

.okr-list__metric-bar {
  width: 60px;
  height: 4px;
  background: var(--el-fill-color);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
  i { display: block; height: 100%; background: var(--el-color-primary); border-radius: 2px; transition: width 0.3s; }
}

.okr-list__metric-val {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.okr-list__metric-pct {
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.okr-list__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.okr-list__right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 1px;
}

.okr-list__score {
  font-size: 22px;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  &.is-danger { color: var(--el-color-danger); }
  &.is-warning { color: var(--el-color-warning); }
  &.is-primary { color: var(--el-color-primary); }
  &.is-info { color: var(--el-color-info); }
  &.is-success { color: var(--el-color-success); }
}

.okr-list__actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}
</style>