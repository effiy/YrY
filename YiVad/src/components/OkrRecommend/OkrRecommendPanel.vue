<template>
  <div class="okr-rec">
    <div class="okr-rec__body">
      <!-- ═══ Sidebar ═══ -->
      <nav class="okr-rec__sidebar">
        <div class="okr-rec__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
            <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
        <button
          class="okr-rec__sidebar-item"
          :class="{ 'is-active': categoryFilter === 'all' }"
          @click="categoryFilter = 'all'"
        >
          <span class="okr-rec__sidebar-icon">📋</span>
          <span class="okr-rec__sidebar-label">{{ t("home.aiRecommend.filterAll") }}</span>
          <span class="okr-rec__sidebar-badge">{{ categoryCounts.all }}</span>
        </button>
        <button
          v-for="l in LIST_TYPES"
          :key="l.key"
          class="okr-rec__sidebar-item"
          :class="{ 'is-active': categoryFilter === l.key }"
          @click="categoryFilter = l.key"
        >
          <span class="okr-rec__sidebar-icon">{{ l.icon }}</span>
          <span class="okr-rec__sidebar-label">{{ t(`home.aiRecommend.lists.${l.key}`) }}</span>
          <span class="okr-rec__sidebar-badge">{{ categoryCounts[l.key] }}</span>
        </button>
      </nav>

      <!-- ═══ Content ═══ -->
      <div class="okr-rec__content">
        <div class="okr-rec__section-head">
          <h2 class="okr-rec__section-title">{{ t("home.aiRecommend.title") }}</h2>
          <div class="okr-rec__date-nav">
            <el-button size="small" :icon="ArrowLeft" text @click="goToPrevDay" />
            <span class="okr-rec__date" :class="{ 'is-all': !filterDate }">{{ filterDateLabel }}</span>
            <el-button size="small" :icon="ArrowRight" text :disabled="isFilterToday" @click="goToNextDay" />
            <el-button v-if="!isFilterToday" size="small" text type="primary" @click="goToFilterToday">今天</el-button>
            <el-button v-if="filterDate" size="small" :icon="Close" text @click="clearFilterDate" title="清除日期筛选" />
          </div>
          <span class="okr-rec__toolbar-right">
            <span class="okr-rec__result-count">{{ stats.total }} 条 · P0 {{ stats.p0 }} · 逾期 {{ stats.overdue }}</span>
          </span>
        </div>

        <div class="okr-rec__section-body">

    <!-- ═══ 表格视图：四类推荐清单合并 ═══ -->
    <el-table v-if="viewMode === 'table'" :data="filteredItems" size="small" border stripe style="width: 100%" row-key="id">
      <el-table-column :label="t('home.aiRecommend.cols.task')" prop="title" min-width="320">
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.task") }}</span>
            <el-input v-model="columnFilters.title" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <span class="okr-rec__cell-title okr-rec__cell-title--link" @click="openPreview(row as TableRow)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="240">
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.process") }}</span>
            <el-input v-model="columnFilters.process" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <div v-if="row.goalId && loopByGoalId[row.goalId]?.length" class="okr-rec__cell-process">
            <div v-for="group in loopByGoalId[row.goalId]" :key="group.loopId" class="okr-rec__process-loop">
              <span class="okr-rec__process-loop-id" @click="goToProcess(group.loopId)" :title="group.loopId">{{ group.title }}</span>
              <span class="okr-rec__process-stages">
                <span
                  v-for="sk in STAGE_KEYS"
                  :key="sk"
                  class="okr-rec__process-stage"
                  :class="{ 'is-done': group.stageMap[sk]?.status === 'done', 'is-filled': !!group.stageMap[sk] }"
                  :title="group.stageMap[sk] ? `${stageIcon(sk)} ${stageLabel(sk)} — ${group.stageMap[sk]!.title}` : stageLabel(sk)"
                  @click="group.stageMap[sk] && openRecord(group.stageMap[sk]!.path)"
                >{{ stageIcon(sk) }}</span>
              </span>
            </div>
          </div>
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.priority')" prop="priority" width="90" sortable>
        <template #default="{ row }">
          <PriorityTag :priority="row.priority" />
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.score')" prop="score" width="120" sortable>
        <template #default="{ row }">
          <div class="okr-rec__score">
            <span class="okr-rec__score-bar"><i :class="row.kind === 'action' ? 'is-success' : `is-${scoreTagType(row.score)}`" :style="{ width: `${row.kind === 'action' ? row.progress : row.score}%` }" /></span>
            <span class="okr-rec__score-num" :class="row.kind === 'action' ? 'is-success' : `is-${scoreTagType(row.score)}`">{{ row.kind === 'action' ? `${row.progress}%` : row.score }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="150">
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.role") }}</span>
            <el-input v-model="columnFilters.role" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <RoleLink :role="row.role" :role-name="row.roleName" :role-icon="row.roleIcon" to="" />
        </template>
      </el-table-column>
            <el-table-column min-width="220">
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.metric") }}</span>
            <el-input v-model="columnFilters.metric" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <div v-if="row.metric" class="okr-rec__cell-metric okr-rec__cell-metric--link" @click="openMetricPreview(row.metric)">
            <span class="okr-rec__metric-icon">{{ row.metric.icon }}</span>
            <div class="okr-rec__metric-body">
              <span class="okr-rec__metric-name">{{ row.metric.name }}</span>
              <div class="okr-rec__metric-bar-row">
                <span class="okr-rec__metric-bar"><i :style="{ width: `${Math.min(row.metric.progress, 100)}%` }" /></span>
                <span class="okr-rec__metric-progress">{{ row.metric.progress }}%</span>
              </div>
              <span class="okr-rec__metric-val">{{ row.metric.current }}{{ row.metric.unit }} → {{ row.metric.target }}{{ row.metric.unit }} <span class="okr-rec__metric-trend" :class="`is-${row.metric.trend}`">{{ trendIcon(row.metric.trend) }}</span></span>
            </div>
          </div>
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column width="150">
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.skill") }}</span>
            <el-input v-model="columnFilters.skill" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <SkillTag v-if="row.skill" :skill="row.skill" :clickable="true" @open="openSkillPreview(row.skill)" />
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column width="150">
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.agent") }}</span>
            <el-input v-model="columnFilters.agent" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <AgentTag v-if="row.agent" :agent="row.agent" :clickable="true" @open="openAgentChat(row.agent)" />
          <span v-else class="okr-rec__cell-none">—</span>
        </template>
      </el-table-column>
      <el-table-column width="110">
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.mcp") }}</span>
            <el-input v-model="columnFilters.mcp" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <McpTag :mcp="row.mcp" :clickable="true" @open="openMcp(row.mcp)" />
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.due')" prop="dueDate" width="110" sortable>
        <template #default="{ row }">
          <DueLabel :due-date="row.dueDate" />
        </template>
      </el-table-column>
      <el-table-column min-width="280" show-overflow-tooltip>
        <template #header>
          <div class="okr-rec__col-header">
            <span>{{ t("home.aiRecommend.cols.reason") }}</span>
            <el-input v-model="columnFilters.reason" size="small" placeholder="搜索" clearable @click.stop />
          </div>
        </template>
        <template #default="{ row }">
          <template v-if="row.kind === 'action'">
            <div class="okr-rec__why">
              <div class="okr-rec__why-head">
                <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
                <span v-if="row.subtaskCount" class="okr-rec__subtask">{{ row.subtaskCount }} subtasks</span>
              </div>
              <div v-if="row.reason" class="okr-rec__why-text">{{ row.reason }}</div>
            </div>
          </template>
          <div v-else class="okr-rec__why-text">{{ row.reason }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="t('home.aiRecommend.cols.action')" width="80" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row as TableRow)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- ═══ 列表视图 ═══ -->
    <div v-else-if="viewMode === 'list'" class="okr-rec__list">
      <div v-for="item in filteredItems" :key="item.id" class="okr-rec__list-item" :class="`is-priority-${item.priority.toLowerCase()}`">
        <div class="okr-rec__list-left">
          <PriorityTag :priority="item.priority" />
        </div>
        <div class="okr-rec__list-main">
          <div class="okr-rec__list-head">
            <span class="okr-rec__list-title okr-rec__cell-title--link" @click="openPreview(item)">{{ item.title }}</span>
            <CategoryTag :list-type="item.listType" />
            <span v-if="item.kind === 'action'" class="okr-rec__list-status" :class="`is-${statusTagType(item.status)}`">
              <span class="okr-rec__list-status-dot" />
              {{ item.status }}
            </span>
          </div>
          <div v-if="item.goalId && loopByGoalId[item.goalId]?.length" class="okr-rec__list-process">
            <div v-for="group in loopByGoalId[item.goalId]" :key="group.loopId" class="okr-rec__process-loop">
              <span class="okr-rec__process-loop-id" @click="goToProcess(group.loopId)" :title="group.loopId">{{ group.title }}</span>
              <span class="okr-rec__process-stages">
                <span
                  v-for="sk in STAGE_KEYS"
                  :key="sk"
                  class="okr-rec__process-stage"
                  :class="{ 'is-done': group.stageMap[sk]?.status === 'done', 'is-filled': !!group.stageMap[sk] }"
                  :title="group.stageMap[sk] ? `${stageIcon(sk)} ${stageLabel(sk)} — ${group.stageMap[sk]!.title}` : stageLabel(sk)"
                  @click="group.stageMap[sk] && openRecord(group.stageMap[sk]!.path)"
                >{{ stageIcon(sk) }}</span>
              </span>
            </div>
          </div>
          <div class="okr-rec__list-meta">
            <RoleLink :role="item.role" :role-name="item.roleName" :role-icon="item.roleIcon" to="" />
            <EffortBadge :effort="item.effort" />
            <span class="okr-rec__list-due" :class="{ 'is-overdue': isOverdue(item.dueDate) }">
              <template v-if="dueRelative(item.dueDate)">{{ dueRelative(item.dueDate) }}</template>
              <template v-else>{{ item.dueDate }}</template>
            </span>
            <span v-if="item.metric" class="okr-rec__list-metric okr-rec__cell-metric--link" @click="openMetricPreview(item.metric)">
              {{ item.metric.icon }} {{ item.metric.name }} {{ item.metric.current }}→{{ item.metric.target }}{{ item.metric.unit }} ({{ item.metric.progress }}%)
              <span class="okr-rec__metric-trend" :class="`is-${item.metric.trend}`">{{ trendIcon(item.metric.trend) }}</span>
            </span>
            <SkillTag v-if="item.skill" :skill="item.skill" :clickable="true" @open="openSkillPreview(item.skill)" />
            <AgentTag v-if="item.agent" :agent="item.agent" :clickable="true" @open="openAgentChat(item.agent)" />
            <McpTag :mcp="item.mcp" :clickable="true" @open="openMcp(item.mcp)" />
          </div>
        </div>
        <div class="okr-rec__list-right">
          <div class="okr-rec__list-score-wrap">
            <span class="okr-rec__list-score" :class="item.kind === 'action' ? 'is-success' : `is-${scoreTagType(item.score)}`">
              {{ item.kind === 'action' ? `${item.progress}%` : item.score }}
            </span>
            <span class="okr-rec__list-score-label">{{ item.kind === 'action' ? 'progress' : 'score' }}</span>
          </div>
          <div class="okr-rec__list-actions">
            <el-button link type="primary" size="small" :icon="View" @click.stop="openPreview(item)" title="预览" />
            <el-button link type="danger" size="small" :icon="Delete" @click.stop="handleDelete(item)" title="删除" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 卡片视图 ═══ -->
    <div v-else class="okr-rec__cards">
      <div v-for="item in filteredItems" :key="item.id" class="okr-rec__card" :class="`is-priority-${item.priority.toLowerCase()}`">
        <div class="okr-rec__card-head">
          <div class="okr-rec__card-head-left">
            <PriorityTag :priority="item.priority" />
            <CategoryTag :list-type="item.listType" />
            <span v-if="item.kind === 'action'" class="okr-rec__card-status" :class="`is-${statusTagType(item.status)}`">
              <span class="okr-rec__card-status-dot" />
              {{ item.status }}
            </span>
          </div>
          <div class="okr-rec__card-head-right">
            <span class="okr-rec__card-due" :class="{ 'is-overdue': isOverdue(item.dueDate) }">
              <template v-if="dueRelative(item.dueDate)">{{ dueRelative(item.dueDate) }}</template>
              <template v-else>{{ item.dueDate }}</template>
            </span>
            <span class="okr-rec__card-score" :class="item.kind === 'action' ? 'is-success' : `is-${scoreTagType(item.score)}`">
              {{ item.kind === 'action' ? `${item.progress}%` : item.score }}
            </span>
          </div>
        </div>

        <div v-if="item.goalId && loopByGoalId[item.goalId]?.length" class="okr-rec__card-process">
          <div v-for="group in loopByGoalId[item.goalId]" :key="group.loopId" class="okr-rec__process-loop">
            <span class="okr-rec__process-loop-id" @click="goToProcess(group.loopId)" :title="group.loopId">{{ group.title }}</span>
            <span class="okr-rec__process-stages">
              <span
                v-for="sk in STAGE_KEYS"
                :key="sk"
                class="okr-rec__process-stage"
                :class="{ 'is-done': group.stageMap[sk]?.status === 'done', 'is-filled': !!group.stageMap[sk] }"
                :title="group.stageMap[sk] ? `${stageIcon(sk)} ${stageLabel(sk)} — ${group.stageMap[sk]!.title}` : stageLabel(sk)"
                @click="group.stageMap[sk] && openRecord(group.stageMap[sk]!.path)"
              >{{ stageIcon(sk) }}</span>
            </span>
          </div>
        </div>

        <div class="okr-rec__card-title okr-rec__cell-title--link" @click="openPreview(item)">{{ item.title }}</div>

        <div class="okr-rec__cell-dims">
          <span class="okr-rec__dim" :class="`is-${item.roi}`"><em>{{ t("home.aiRecommend.dims.roi") }}</em><b>{{ levelLabel(item.roi) }}</b></span>
          <span class="okr-rec__dim" :class="`is-${item.difficulty}`"><em>{{ t("home.aiRecommend.dims.difficulty") }}</em><b>{{ levelLabel(item.difficulty) }}</b></span>
          <span class="okr-rec__dim" :class="`is-${item.urgency}`"><em>{{ t("home.aiRecommend.dims.urgency") }}</em><b>{{ levelLabel(item.urgency) }}</b></span>
        </div>

        <div v-if="item.metric" class="okr-rec__card-metric okr-rec__cell-metric--link" @click="openMetricPreview(item.metric)">
          <span class="okr-rec__card-metric-icon">{{ item.metric.icon }}</span>
          <div class="okr-rec__card-metric-body">
            <div class="okr-rec__card-metric-head">
              <span class="okr-rec__card-metric-name">{{ item.metric.name }}</span>
              <span class="okr-rec__card-metric-pct">{{ item.metric.progress }}%</span>
            </div>
            <div class="okr-rec__card-metric-bar"><i :style="{ width: `${Math.min(item.metric.progress, 100)}%` }" /></div>
            <span class="okr-rec__card-metric-val">{{ item.metric.current }}{{ item.metric.unit }} → {{ item.metric.target }}{{ item.metric.unit }} <span class="okr-rec__metric-trend" :class="`is-${item.metric.trend}`">{{ trendIcon(item.metric.trend) }}</span></span>
          </div>
        </div>

        <div v-if="item.kind === 'action'" class="okr-rec__card-progress">
          <el-progress :percentage="item.progress" :status="item.status === 'Done' ? 'success' : item.status === 'At Risk' ? 'exception' : ''" :stroke-width="6" :show-text="false" />
        </div>

        <div class="okr-rec__card-reason" :class="{ 'is-expanded': expandedCards.has(item.id) }" @click="toggleExpandCard(item.id)">
          {{ item.reason }}
        </div>

        <div class="okr-rec__card-orch">
          <SkillTag v-if="item.skill" :skill="item.skill" :clickable="true" @open="openSkillPreview(item.skill)" />
          <AgentTag v-if="item.agent" :agent="item.agent" :clickable="true" @open="openAgentChat(item.agent)" />
          <McpTag :mcp="item.mcp" :clickable="true" @open="openMcp(item.mcp)" />
        </div>

        <div class="okr-rec__card-foot">
          <RoleLink :role="item.role" :role-name="item.roleName" :role-icon="item.roleIcon" to="" />
          <EffortBadge :effort="item.effort" />
          <div class="okr-rec__card-actions">
            <el-button link type="primary" size="small" :icon="View" @click.stop="openPreview(item)" title="预览" />
            <el-button link type="danger" size="small" :icon="Delete" @click.stop="handleDelete(item)" title="删除" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 空状态 ═══ -->
    <el-empty v-if="!filteredItems.length" :description="t('home.aiRecommend.empty')" :image-size="48" />

    <KnowledgePreviewDialog ref="previewDlg" />
    </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts" name="OkrRecommendPanel">
import { computed, reactive, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Grid, List, Postcard, Delete, MagicStick, RefreshRight, ArrowLeft, ArrowRight, Close, View } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { scanKnowledge, writeKnowledgeFile, deleteKnowledgeFile, readKnowledgeFile } from "@/api/modules/knowledgeService";
import { chat } from "@/api/modules/chatService";
import { deleteDocument } from "@/api/modules/dataService";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import { fetchAllOkrMetadata } from "@/api/modules/okrService";
import type { OkrMetadataContext } from "./okrRecommend";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { skillLabel, mcpLabel, isOverdue } from "./format";
import PriorityTag from "./fields/PriorityTag.vue";
import CategoryTag from "./fields/CategoryTag.vue";
import RoleLink from "./fields/RoleLink.vue";
import SkillTag from "./fields/SkillTag.vue";
import AgentTag from "./fields/AgentTag.vue";
import McpTag from "./fields/McpTag.vue";
import EffortBadge from "./fields/EffortBadge.vue";
import DueLabel from "./fields/DueLabel.vue";
import {
  LIST_TYPES,
  OKR_SYSTEM_PROMPT,
  buildListPrompt,
  buildSingleItemPrompt,
  buildActionItemPrompt,
  parseRecommendation,
  parseActionItem,
  taskToMeta,
  taskFromMeta,
  actionItemFromMeta,
  exampleTaskToActionItem,
  type OkrLevel,
  type OkrListType,
  type OkrScope,
  type OkrTaskItem,
  type OkrActionItem,
  type ApiExampleTask
} from "./okrRecommend";

const { t } = useI18n();
const router = useRouter();

/** Process stages — mirrors processRecord.vue for consistent display. */
const STAGES = [
  { key: "requirement-review", icon: "📋", label: "需求评审" },
  { key: "technical-review", icon: "🧭", label: "技术评审" },
  { key: "code-review", icon: "🔍", label: "代码审查" },
  { key: "build-debug", icon: "⚡", label: "构建调试" },
  { key: "test-report", icon: "🧪", label: "测试报告" },
  { key: "deployment", icon: "📦", label: "部署" },
  { key: "launch", icon: "🚀", label: "上线记录" },
  { key: "retrospective", icon: "🔄", label: "复盘总结" }
] as const;
const STAGE_KEYS = STAGES.map(s => s.key);
const STAGE_ORDER: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

interface LoopRecord {
  path: string;
  loopId: string;
  stage: string;
  title: string;
  role: string;
  goalId: string;
  status: string;
}
interface LoopGroup {
  loopId: string;
  title: string;
  records: LoopRecord[];
  stageMap: Record<string, LoopRecord>;
  goalIds: string[];
}

/** 由父组件（home）传入的联动项目 id 集合（小写，如 "yiai"）；空数组 = 展示全部。 */
const props = defineProps<{ projects?: string[]; roles?: string[] }>();

const emit = defineEmits<{ (e: "update:counts", counts: Record<string, number>): void }>();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

/** OKR metadata fetched from MongoDB API — when available, overrides static imports. */
const metadataCtx = ref<OkrMetadataContext | undefined>(undefined);

/** API-backed role data (empty until metadata loads). */
const apiRoles = computed(() => metadataCtx.value?.rolesData ?? {});
/** Flat goal map from API data. */
const apiGoals = computed(() => {
  if (!metadataCtx.value) return {} as Record<string, any>;
  const map: Record<string, any> = {};
  for (const goals of Object.values(metadataCtx.value.goalsData)) {
    for (const g of goals) map[g.id] = g;
  }
  return map;
});

/** 选中角色 id 集合（由父组件角色导航控制）；空数组 = 展示全部角色。 */
const selectedRoles = computed(() => props.roles ?? []);

/** AI 生成范围：仅选中单一角色时限定到该角色，否则生成全角色（"all"）。 */
const roleScope = computed<OkrScope>(() => (selectedRoles.value.length === 1 ? selectedRoles.value[0] : "all"));
const roleOptions = computed(() => Object.values(apiRoles.value).map(r => ({ id: r.id, name: r.name, icon: r.icon })));

/** 批量生成进行中（禁用生成按钮）。 */
const generating = ref(false);
/** 单条重生成中的行 id（仅该行显示 loading）。 */
const regeneratingId = ref("");

type ViewMode = "table" | "list" | "card";
const viewMode = ref<ViewMode>("table");

const expandedCards = ref<Set<string>>(new Set());

function toggleExpandCard(id: string) {
  const next = new Set(expandedCards.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  expandedCards.value = next;
}

function dueRelative(dueDate: string): string {
  if (!dueDate) return "";
  const d = dayjs(dueDate);
  if (!d.isValid()) return "";
  const today = dayjs().startOf("day");
  const diff = d.diff(today, "day");
  if (diff < 0) return `逾期 ${Math.abs(diff)} 天`;
  if (diff === 0) return "今天截止";
  if (diff === 1) return "明天截止";
  if (diff <= 3) return `${diff} 天后截止`;
  return "";
}

interface ListState {
  items: OkrTaskItem[];
  source: "ai" | "fallback" | "";
  filePaths: string[];
}

const emptyState = (): ListState => ({ items: [], source: "", filePaths: [] });

const lists = reactive<Record<OkrListType, ListState>>({
  daily: emptyState(),
  weekly: emptyState(),
  risk: emptyState()
});

/** Action Item（okr-action）— 与推荐任务合并展示，只读、不参与 AI 生成。 */
const actionItems = ref<OkrActionItem[]>([]);

/** Process loop records loaded from knowledge base. */
const loopGroups = ref<LoopGroup[]>([]);

/** goalId → matching loop groups (a loop may have records with different goalIds per stage). */
const loopByGoalId = computed(() => {
  const map: Record<string, LoopGroup[]> = {};
  for (const g of loopGroups.value) {
    for (const goalId of g.goalIds) {
      if (!map[goalId]) map[goalId] = [];
      map[goalId].push(g);
    }
  }
  return map;
});

/** 统一表格行：推荐任务（listType 区分来源清单）或 Action Item（kind 区分）。 */
type TableRow = (OkrTaskItem & { kind: "task"; listType: OkrListType }) | OkrActionItem;

/** 四类推荐清单 + Action Item 合并为一张表。 */
const allRows = computed<TableRow[]>(() => {
  const tasks: TableRow[] = LIST_TYPES.flatMap(l =>
    lists[l.key].items.map(item => ({ ...item, kind: "task" as const, listType: l.key }))
  );
  return [...tasks, ...actionItems.value].sort((a, b) => b.score - a.score);
});

/** 各角色条目数量（`all` 为总数），上报给父组件的角色导航角标。 */
const roleCounts = computed<Record<string, number>>(() => {
  const roleIds = Object.keys(apiRoles.value);
  const counts: Record<string, number> = { all: allRows.value.length };
  for (const rid of roleIds) counts[rid] = allRows.value.filter(i => i.role === rid).length;
  return counts;
});

watch(roleCounts, c => emit("update:counts", { ...c }), { immediate: true });

// ── 分类筛选 + 搜索 + 日期 ──────────────────────────
const categoryFilter = ref<"all" | OkrListType>("all");
const columnFilters = reactive<Record<string, string>>({});
const filterDate = ref<Date | null>(null);

const filterDateLabel = computed(() => {
  const d = filterDate.value;
  if (!d) return "全部";
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "今天";
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return "明天";
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "昨天";
  return dayjs(d).format("M/D ddd");
});

const isFilterToday = computed(() => {
  const d = filterDate.value;
  return d ? d.toDateString() === new Date().toDateString() : false;
});

function goToPrevDay() {
  const d = filterDate.value ? new Date(filterDate.value) : new Date();
  d.setDate(d.getDate() - 1);
  filterDate.value = d;
}
function goToNextDay() {
  const d = filterDate.value ? new Date(filterDate.value) : new Date();
  d.setDate(d.getDate() + 1);
  filterDate.value = d;
}
function goToFilterToday() {
  filterDate.value = new Date();
}
function clearFilterDate() {
  filterDate.value = null;
}

/** 任务 → 项目 id（小写）：优先 goalId 关联目标的 project，回退到角色首项目。 */
function projectOfRow(row: TableRow): string {
  const goal = row.goalId ? apiGoals.value[row.goalId] : undefined;
  const p = goal?.project || apiRoles.value[row.role]?.projects?.[0] || "";
  return p.toLowerCase();
}

/** 分类按钮上的数量：按项目筛选（不按分类/日期/搜索）统计每类行数。 */
const categoryCounts = computed<Record<string, number>>(() => {
  const projs = props.projects;
  let scoped = projs?.length ? allRows.value.filter(i => projs.includes(projectOfRow(i))) : allRows.value;
  if (selectedRoles.value.length) scoped = scoped.filter(i => selectedRoles.value.includes(i.role));
  const counts: Record<string, number> = { all: scoped.length };
  for (const l of LIST_TYPES) counts[l.key] = scoped.filter(i => i.listType === l.key && !isResolvedRisk(i)).length;
  return counts;
});

const filteredItems = computed(() => {
  let result =
    categoryFilter.value === "all"
      ? allRows.value
      : allRows.value.filter(i => i.listType === categoryFilter.value);
  // 「风险与阻塞」只展示未解除的项；已 Done 的阻塞视为已解除，不再列出。
  if (categoryFilter.value === "risk") result = result.filter(i => !isResolvedRisk(i));
  const projs = props.projects;
  if (projs?.length) result = result.filter(i => projs.includes(projectOfRow(i)));
  if (selectedRoles.value.length) result = result.filter(i => selectedRoles.value.includes(i.role));
  if (filterDate.value) {
    const dateStr = dayjs(filterDate.value).format("YYYY-MM-DD");
    result = result.filter(i => i.dueDate === dateStr);
  }
  // per-column filters
  const f = (k: string) => (columnFilters[k] || "").trim().toLowerCase();
  const tf = f("title"); if (tf) result = result.filter(i => i.title.toLowerCase().includes(tf));
  const rf = f("role"); if (rf) result = result.filter(i => i.roleName.toLowerCase().includes(rf) || i.role.toLowerCase().includes(rf));
  const mf = f("metric"); if (mf) result = result.filter(i => i.metric?.name?.toLowerCase().includes(mf));
  const sf = f("skill"); if (sf) result = result.filter(i => i.skill.toLowerCase().includes(sf) || skillLabel(i.skill).toLowerCase().includes(sf));
  const af = f("agent"); if (af) result = result.filter(i => i.agent.toLowerCase().includes(af));
  const mcpf = f("mcp"); if (mcpf) result = result.filter(i => i.mcp.toLowerCase().includes(mcpf));
  const duef = f("due"); if (duef) result = result.filter(i => i.dueDate.includes(duef));
  const pf = f("process"); if (pf) result = result.filter(i => loopByGoalId.value[i.goalId]?.some(g => g.title.toLowerCase().includes(pf) || g.loopId.toLowerCase().includes(pf)));
  return result;
});

const stats = computed(() => {
  const items = filteredItems.value;
  return {
    total: items.length,
    p0: items.filter(i => i.priority === "P0").length,
    overdue: items.filter(i => isOverdue(i.dueDate)).length
  };
});

watch(filteredItems, (items) => {
  const ids = new Set(items.map(i => i.id));
  const next = new Set(expandedCards.value);
  let changed = false;
  for (const id of expandedCards.value) {
    if (!ids.has(id)) { next.delete(id); changed = true; }
  }
  if (changed) expandedCards.value = next;
});

function statusTagType(status: string): "success" | "danger" | "warning" | "info" {
  if (status === "Done") return "success";
  if (status === "At Risk") return "danger";
  if (status === "In Progress") return "warning";
  return "info";
}

/** 已解除（Done）的风险/阻塞项不再计入「风险与阻塞」清单。 */
function isResolvedRisk(row: TableRow): boolean {
  return row.listType === "risk" && row.kind === "action" && row.status === "Done";
}

function levelLabel(l: OkrLevel): string {
  return t(`home.aiRecommend.level.${l}`);
}

function scoreTagType(score: number): "danger" | "warning" | "primary" | "info" {
  return score >= 60 ? "danger" : score >= 35 ? "warning" : score >= 15 ? "primary" : "info";
}

function trendIcon(trend: string): string {
  return trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
}

function renderRowMarkdown(row: TableRow): string {
  const metric = row.metric;
  const metricLine = metric
    ? `- **指标** ${metric.icon} ${metric.name}（当前 ${metric.current}${metric.unit} → 目标 ${metric.target}${metric.unit}，进度 ${metric.progress}%）`
    : "- **指标** —";
  const statusLine = row.kind === "action" ? `| Status | ${row.status} |` : "";
  return [
    `# ${row.title}`,
    "",
    `> ${row.reason || row.title}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Role | ${row.roleName} |`,
    `| Priority | ${row.priority} |`,
    `| Score | ${row.score} |`,
    `| Effort | ${row.effort} |`,
    `| Due | ${row.dueDate || "—"} |`,
    `| Goal | ${row.goalId || "—"} |`,
    `| Skill | ${row.skill ? skillLabel(row.skill) : "—"} |`,
    `| Agent | ${row.agent || "—"} |`,
    `| MCP | ${mcpLabel(row.mcp)} |`,
    statusLine,
    "",
    metricLine
  ].filter(Boolean).join("\n");
}

function openPreview(row: TableRow) {
  if (row.filePath) {
    previewDlg.value?.open(row.filePath);
  } else {
    previewDlg.value?.openRaw({
      title: row.title,
      content: renderRowMarkdown(row)
    });
  }
}

function renderMetricMarkdown(metric: { id: string; icon: string; name: string; description: string; current: number; target: number; baseline: number; unit: string; trend: string; progress: number; category: string; framework: string }): string {
  return [
    `# ${metric.icon} ${metric.name}`,
    "",
    `> ${metric.description || metric.name}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Current | ${metric.current}${metric.unit} |`,
    `| Target | ${metric.target}${metric.unit} |`,
    `| Baseline | ${metric.baseline}${metric.unit} |`,
    `| Progress | ${metric.progress}% |`,
    `| Trend | ${metric.trend} |`,
    `| Category | ${metric.category} |`,
    `| Framework | ${metric.framework} |`,
  ].join("\n");
}

function openMetricPreview(metric: { id: string; icon: string; name: string; description: string; current: number; target: number; baseline: number; unit: string; trend: string; progress: number; category: string; framework: string }) {
  previewDlg.value?.openRaw({
    title: `${metric.icon} ${metric.name}`,
    content: renderMetricMarkdown(metric)
  });
}

function openSkillPreview(skillId: string) {
  previewDlg.value?.open(`skills/${skillId}/SKILL.md`);
}

function openAgentChat(agent: string) {
  router.push("/aiChat");
}

function openMcp(mcp: string) {
  if (mcp === "github") {
    window.open("https://github.com", "_blank", "noopener,noreferrer");
  } else if (mcp === "yiai") {
    router.push("/aiChat");
  }
}

// ── 知识库持久化 ─────────────────────────────
// 推荐任务按各自 dueDate 归档到 YiKnowledge/okr/YYYY-Qn/YYYY-MM/task-<listType>-<DD>-<NN>-<slug>.md
// （目录到「年-季度 / 年-月」，具体「日」放文件名前缀），每个任务以扁平 frontmatter 携带指标数据。

const KB_DIR = "okr";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 任务标题 → 文件名可读 slug（保留中文/英文/数字，其余分隔符归一为 `-`）。 */
function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

/** `YYYY-MM` → 归档季度目录名 `YYYY-Qn`。 */
function quarterDir(monthDir: string): string {
  return `${monthDir.slice(0, 4)}-Q${Math.ceil(Number(monthDir.slice(5, 7)) / 3)}`;
}

/** 目录用「年-季度 / 年-月」（date 取 YYYY-MM），具体「日」（DD）放进文件名前缀。 */
function taskFileName(listType: OkrListType, index: number, date: string, slug: string): string {
  const dir = date.slice(0, 7);
  const day = date.slice(8, 10);
  return `${KB_DIR}/${quarterDir(dir)}/${dir}/task-${listType}-${day}-${pad(index + 1)}-${slug}.md`;
}

/** 从文件名推导稳定 id（task-daily-15-03-<slug>.md → daily-03，日仅作归档分组不参与 id）。 */
function taskIdFromFileName(name: string): string {
  const m = name.match(/^task-(daily|weekly|risk)-\d{2}-(\d{2})(?:-.*)?\.md$/);
  return m ? `${m[1]}-${m[2]}` : name.replace(/\.md$/, "");
}

function renderTaskBody(item: OkrTaskItem): string {
  const metric = item.metric;
  const metricLine = metric
    ? `- **指标** ${metric.icon} ${metric.name}（当前 ${metric.current}${metric.unit} → 目标 ${metric.target}${metric.unit}，进度 ${metric.progress}%）`
    : "- **指标** —";
  return [
    `# ${item.title}`,
    "",
    `> ${item.reason || item.title}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| Role | ${item.roleName} |`,
    `| Priority | ${item.priority} |`,
    `| Score | ${item.score} |`,
    `| Effort | ${item.effort} |`,
    `| Due | ${item.dueDate || "—"} |`,
    `| Goal | ${item.goalId || "—"} |`,
    `| Skill | ${item.skill ? skillLabel(item.skill) : "—"} |`,
    `| Agent | ${item.agent || "—"} |`,
    `| MCP | ${mcpLabel(item.mcp)} |`,
    "",
    metricLine
  ].join("\n");
}

/** 把某一清单整体落盘：顺序编号 → 写文件 → 删除不再存在的旧文件。 */
async function persistList(listType: OkrListType) {
  const state = lists[listType];
  const today = dayjs().format("YYYY-MM-DD");
  const newPaths: string[] = [];
  let failed = false;
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    item.id = `${listType}-${pad(i + 1)}`;
    const path = taskFileName(listType, i, item.dueDate || today, slugifyTitle(item.title) || pad(i + 1));
    item.filePath = path;
    newPaths.push(path);
    const meta: Record<string, unknown> = {
      type: "okr-task",
      list: listType,
      id: item.id,
      ...taskToMeta(item, state.source === "ai" ? "ai" : "fallback")
    };
    try {
      await writeKnowledgeFile(path, renderTaskBody(item), meta);
    } catch (e) {
      console.error("persistList write failed:", path, e);
      failed = true;
    }
  }
  const stale = state.filePaths.filter(p => !newPaths.includes(p));
  for (const p of stale) {
    try {
      await deleteKnowledgeFile(p);
    } catch {
      /* ignore */
    }
  }
  state.filePaths = newPaths;
  if (failed) ElMessage.error("部分任务保存到知识库失败");
}

/** 挂载时从 YiKnowledge/okr/ 加载已落盘的任务清单（任务按 dueDate 归档到日期目录）。 */

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function buildLoopGroups(files: KnowledgeFileEntry[]): LoopGroup[] {
  const records: LoopRecord[] = [];
  const summaryTitles: Record<string, string> = {};
  for (const f of files) {
    const m = f.meta ?? {};
    if (m.type === "loop-summary") {
      const sid = str(m.loopId);
      const stitle = str(m.title);
      if (sid && stitle) summaryTitles[sid] = stitle;
      continue;
    }
    if (m.type !== "loop-record") continue;
    const stage = str(m.stage);
    if (!(stage in STAGE_ORDER)) continue;
    records.push({
      path: f.path,
      loopId: str(m.loopId) || f.path.split("/").find(seg => /^loop-/.test(seg)) || "loop",
      stage,
      title: str(m.title) || f.name.replace(/\.md$/, ""),
      role: str(m.role),
      goalId: str(m.goalId),
      status: str(m.status) || "in-progress"
    });
  }
  const byLoop = new Map<string, LoopRecord[]>();
  for (const r of records) {
    if (!byLoop.has(r.loopId)) byLoop.set(r.loopId, []);
    byLoop.get(r.loopId)!.push(r);
  }
  return [...byLoop.entries()].map(([loopId, recs]) => {
    recs.sort((a, b) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99));
    const stageMap: Record<string, LoopRecord> = {};
    const goalIds = new Set<string>();
    for (const r of recs) {
      stageMap[r.stage] = r;
      if (r.goalId) goalIds.add(r.goalId);
    }
    const title = summaryTitles[loopId] || (() => {
      const dirSlug = recs[0]?.path.split("/").find(seg => /^loop-/.test(seg)) ?? loopId;
      return dirSlug.replace(/^loop-\d+-/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    })();
    return { loopId, title, records: recs, stageMap, goalIds: [...goalIds] };
  });
}

function stageIcon(stage: string): string {
  return STAGES.find(s => s.key === stage)?.icon ?? "·";
}

function stageLabel(stage: string): string {
  return STAGES.find(s => s.key === stage)?.label ?? stage;
}

function goToProcess(loopId: string) {
  router.push({ path: "/executiver/process", query: { loop: loopId } });
}

function openRecord(path: string) {
  previewDlg.value?.open(path);
}

async function loadFromKnowledge() {
  try {
    const res = await scanKnowledge(KB_DIR);
    const files = res.categories?.flatMap(c => c.files) ?? [];
    const byList: Record<OkrListType, KnowledgeFileEntry[]> = { daily: [], weekly: [], risk: [] };
    for (const f of files.filter(f => f.meta?.type === "okr-task")) {
      const list = f.meta?.list;
      if (typeof list === "string" && list in byList) byList[list as OkrListType].push(f);
    }
    for (const l of LIST_TYPES) {
      const state = lists[l.key];
      const entries = byList[l.key].sort((a, b) => (taskIdFromFileName(a.name) < taskIdFromFileName(b.name) ? -1 : 1));
      state.items = entries
        .map(f => {
          const item = taskFromMeta(f.meta ?? {}, taskIdFromFileName(f.name), metadataCtx.value);
          if (item) item.filePath = f.path;
          return item;
        })
        .filter((x): x is OkrTaskItem => x !== null);
      state.filePaths = entries.map(f => f.path);
    }
    actionItems.value = files
      .filter(f => f.meta?.type === "okr-action")
      .map(f => {
        const row = actionItemFromMeta(f.meta ?? {}, f.name.replace(/\.md$/, ""), metadataCtx.value);
        if (row) row.filePath = f.path;
        return row;
      })
      .filter((x): x is OkrActionItem => x !== null);
    // Extract loop records
    loopGroups.value = buildLoopGroups(files);
  } catch {
    // 保持空态，等待用户手动生成
  }
}

/** 从对应清单中删除一条推荐，直接删文件并从状态中移除。 */
async function removeItem(listType: OkrListType, id: string) {
  const state = lists[listType];
  const idx = state.items.findIndex(i => i.id === id);
  if (idx === -1) return;
  const item = state.items[idx];
  if (item.filePath) {
    await deleteKnowledgeFile(item.filePath);
  }
  state.items.splice(idx, 1);
  state.filePaths = state.filePaths.filter(p => p !== item.filePath);
}

/** 删除一条 Action Item（删知识库文件 + MongoDB 记录，不参与清单重编号）。 */
async function removeActionItem(row: OkrActionItem) {
  if (row.filePath) {
    try {
      await deleteKnowledgeFile(row.filePath);
    } catch {
      ElMessage.error("Failed to delete action item");
      return;
    }
  }
  // 同时从 MongoDB 删除，防止 loadMetadata 重新加载
  try {
    await deleteDocument("okr_example_tasks", row.id);
  } catch (e) {
    console.warn("removeActionItem: MongoDB delete failed:", row.id, e);
  }
  actionItems.value = actionItems.value.filter(a => a.id !== row.id);
}

/** 表格行删除入口：任务走清单持久化，Action Item 走文件删除。 */
async function handleDelete(row: TableRow) {
  try {
    await ElMessageBox.confirm("确认删除该条目？", "删除确认", { confirmButtonText: "删除", cancelButtonText: "取消", type: "warning" });
  } catch {
    return;
  }
  if (row.kind === "action") await removeActionItem(row);
  else await removeItem(row.listType, row.id);
  ElMessage.success("删除成功");
}

// ── AI 生成 / 重生成 ─────────────────────────────
// 拼 OKR 上下文 prompt → 调用非流式 chat → 解析 JSON → 落盘知识库。
// 生成范围由头部 roleScope 决定（"all" = 全角色，否则仅该角色）。

/** 所有清单中的任务（供 AI 生成/重生成时作为历史上下文，避免重复）。 */
function historyTasks(): OkrTaskItem[] {
  return LIST_TYPES.flatMap(l => lists[l.key].items);
}

/** 为某清单生成推荐任务：buildListPrompt → chat → parseRecommendation → persistList。 */
async function generateFor(listType: OkrListType) {
  const prompt = buildListPrompt(listType, roleScope.value, 2, historyTasks(), metadataCtx.value);
  const raw = await chat({
    system: OKR_SYSTEM_PROMPT,
    messages: [{ type: "user", message: prompt, timestamp: Date.now() }]
  });
  const items = parseRecommendation(raw, roleScope.value, listType, metadataCtx.value);
  if (!items.length) {
    ElMessage.warning(t("home.aiRecommend.generateEmpty"));
    return;
  }
  const state = lists[listType];
  state.items = items;
  state.source = "ai";
  await persistList(listType);
}

/** 「生成推荐」入口：当前分类为「全部」时依次生成四类，否则只生成当前分类。 */
async function handleGenerate() {
  if (generating.value) return;
  generating.value = true;
  try {
    const target = categoryFilter.value === "all" ? LIST_TYPES.map(l => l.key) : [categoryFilter.value];
    let total = 0;
    for (const listType of target) {
      try {
        await generateFor(listType);
        total += lists[listType].items.length;
      } catch {
        ElMessage.error(t("home.aiRecommend.generateFailed"));
      }
    }
    if (total) ElMessage.success(t("home.aiRecommend.generateSuccess", { n: total }));
  } finally {
    generating.value = false;
  }
}

/** 单条任务重生成：buildSingleItemPrompt 推一条新任务，替换同 id 旧任务后落盘。 */
async function regenerateTask(row: OkrTaskItem & { listType: OkrListType }) {
  const prompt = buildSingleItemPrompt(row.listType, row.role, row.title, historyTasks(), metadataCtx.value);
  const raw = await chat({
    system: OKR_SYSTEM_PROMPT,
    messages: [{ type: "user", message: prompt, timestamp: Date.now() }]
  });
  const fresh = parseRecommendation(raw, row.role, row.listType, metadataCtx.value)[0];
  if (!fresh) {
    ElMessage.warning(t("home.aiRecommend.generateEmpty"));
    return;
  }
  const state = lists[row.listType];
  const idx = state.items.findIndex(i => i.id === row.id);
  if (idx !== -1) state.items[idx] = fresh;
  state.source = "ai";
  await persistList(row.listType);
}

/** 单条 Action Item 重生成：优化标题/优先级/目标，保留既有 deadline/owner/role 与正文。 */
async function regenerateAction(row: OkrActionItem) {
  const prompt = buildActionItemPrompt(row.role || "executiver", row.title, row.dueDate, metadataCtx.value);
  const raw = await chat({
    system: OKR_SYSTEM_PROMPT,
    messages: [{ type: "user", message: prompt, timestamp: Date.now() }]
  });
  const parsed = parseActionItem(raw);
  if (!parsed) {
    ElMessage.warning(t("home.aiRecommend.generateEmpty"));
    return;
  }
  if (row.filePath) {
    let content = `# ${parsed.title}`;
    let meta: Record<string, unknown> = { type: "okr-action" };
    try {
      const res = await readKnowledgeFile(row.filePath);
      meta = { ...res.meta, title: parsed.title, priority: parsed.priority, goal: parsed.goalId };
      content = res.content.replace(/^# .*$/m, `# ${parsed.title}`);
    } catch {
      /* 读失败则退回新标题 + 空 meta，仍尽力落盘 */
    }
    await writeKnowledgeFile(row.filePath, content, meta);
  }
  row.title = parsed.title;
  row.priority = parsed.priority;
  row.goalId = parsed.goalId;
}

/** 表格操作列「重生成」入口：按行类型分派到任务或 Action Item。 */
async function handleRegenerate(row: TableRow) {
  if (regeneratingId.value) return;
  regeneratingId.value = row.id;
  try {
    if (row.kind === "action") await regenerateAction(row);
    else await regenerateTask(row);
    ElMessage.success(t("home.aiRecommend.regenSuccess"));
  } catch {
    ElMessage.error(t("home.aiRecommend.regenFailed"));
  } finally {
    regeneratingId.value = "";
  }
}

/** Fetch OKR metadata from MongoDB API and build the context for prompt functions. */
async function loadMetadata() {
  try {
    const data = await fetchAllOkrMetadata();
    const allMetricsMap: Record<string, any> = {};
    for (const metric of data.metrics) allMetricsMap[metric.key] = metric;
    const goalMetricMap: Record<string, string[]> = {};
    for (const gm of data.goalMetrics) goalMetricMap[gm.goalId] = gm.metricIds;
    const rolesData: Record<string, any> = {};
    for (const r of data.roles) rolesData[r.id] = r;
    const goalsData: Record<string, any[]> = {};
    for (const g of data.goals) {
      const goal = { ...g, id: g.key };
      if (!goalsData[goal.role]) goalsData[goal.role] = [];
      goalsData[goal.role].push(goal);
    }
    const metricsData: Record<string, any[]> = {};
    for (const metric of data.metrics) {
      if (!metricsData[metric.role]) metricsData[metric.role] = [];
      metricsData[metric.role].push(metric);
    }
    const roleDailyDataMap: Record<string, any> = {};
    for (const d of data.daily) roleDailyDataMap[d.role] = d;
    const roleWeeklyDataMap: Record<string, any> = {};
    for (const w of data.weekly) roleWeeklyDataMap[w.role] = w;
    metadataCtx.value = {
      rolesData,
      goalsData,
      metricsData,
      allMetricsMap,
      goalMetricMap,
      roleDailyDataMap,
      roleWeeklyDataMap
    };

    // Populate action items from MongoDB example tasks
    const apiTasks = data.exampleTasks
      .map(t => exampleTaskToActionItem(t as ApiExampleTask, metadataCtx.value))
      .filter((x): x is OkrActionItem => x !== null);
    // Merge: API tasks take precedence; keep KB-loaded tasks not already present
    const existingIds = new Set(apiTasks.map(t => t.id));
    const kbOnly = actionItems.value.filter(t => !existingIds.has(t.id));
    // Preserve filePath from KB-loaded items when API items don't have one
    for (const apiTask of apiTasks) {
      if (!apiTask.filePath) {
        const kbMatch = actionItems.value.find(t => t.id === apiTask.id);
        if (kbMatch?.filePath) apiTask.filePath = kbMatch.filePath;
      }
    }
    actionItems.value = [...apiTasks, ...kbOnly];
  } catch {
    ElMessage.error("Failed to load OKR metadata from API");
  }
}

onMounted(async () => {
  await loadFromKnowledge();
  await loadMetadata();
});
</script>

<style scoped lang="scss">
.okr-rec {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// ── Section Head ──
.okr-rec__section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-wrap: wrap;
}
.okr-rec__section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.okr-rec__section-body {
  padding: 16px 20px;
}
.okr-rec__toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.okr-rec__result-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

// ── Body + Sidebar ──
.okr-rec__body { display: flex; gap: 16px; align-items: flex-start; }
.okr-rec__sidebar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 180px;
  flex-shrink: 0;
  padding: 8px 10px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  position: sticky;
  top: 12px;
  overflow: hidden;
}
.okr-rec__sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all .15s;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  &:hover { background: var(--el-fill-color-light); color: var(--el-text-color-primary); }
  &.is-active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}
.okr-rec__sidebar-icon { font-size: 18px; flex-shrink: 0; }
.okr-rec__sidebar-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.okr-rec__sidebar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  .okr-rec__sidebar-item.is-active & {
    background: var(--el-color-primary);
    color: #fff;
  }
}
.okr-rec__sidebar-view {
  padding: 4px 8px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

.okr-rec__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
}

.okr-rec__search { width: 220px; }
.okr-rec__col-header { display: flex; flex-direction: column; gap: 4px; align-items: stretch; }
.okr-rec__col-header span { font-size: 12px; line-height: 1.2; }
.okr-rec__col-header .el-input { width: 100%; }
.okr-rec__date-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}
.okr-rec__date {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  min-width: 80px;
  text-align: center;
}
.okr-rec__date.is-all {
  color: var(--el-color-primary);
}
.okr-rec__stats { display: flex; align-items: center; gap: 14px; }
.okr-rec__stat { font-size: 12px; color: var(--el-text-color-secondary); }
.okr-rec__stat.is-p0 { color: var(--el-color-danger); font-weight: 600; }
.okr-rec__stat.is-overdue { color: var(--el-color-warning); font-weight: 600; }

// ── Table cells ────────────────────────────────
.okr-rec__cell-title { font-size: 13px; font-weight: 600; line-height: 1.4; }
.okr-rec__cell-title--link { cursor: pointer; &:hover { color: var(--el-color-primary); } }
.okr-rec__cell-none { color: var(--el-text-color-placeholder); }
.okr-rec__subtask { margin-left: 6px; font-size: 11px; color: var(--el-text-color-secondary); }
.okr-rec__why { display: flex; flex-direction: column; gap: 4px; }
.okr-rec__why-head { display: flex; align-items: center; }
.okr-rec__why-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

// ── Metric（任务自身指标）────────────────────
.okr-rec__cell-metric { display: flex; align-items: center; gap: 6px; }
.okr-rec__cell-metric--link { cursor: pointer; &:hover { opacity: 0.8; } }
.okr-rec__metric-icon { font-size: 14px; }
.okr-rec__metric-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.okr-rec__metric-name { font-size: 12px; font-weight: 600; line-height: 1.3; }
.okr-rec__metric-bar-row { display: flex; align-items: center; gap: 4px; }
.okr-rec__metric-bar { flex: 1; height: 4px; background: var(--el-fill-color-light); border-radius: 2px; overflow: hidden; }
.okr-rec__metric-bar i { display: block; height: 100%; background: var(--el-color-primary); border-radius: 2px; transition: width 0.3s; }
.okr-rec__metric-progress { font-size: 11px; font-weight: 600; color: var(--el-color-primary); font-variant-numeric: tabular-nums; }
.okr-rec__metric-val { font-size: 11px; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; }
.okr-rec__metric-trend { font-weight: 700; }
.okr-rec__metric-trend.is-up { color: var(--el-color-success); }
.okr-rec__metric-trend.is-down { color: var(--el-color-danger); }
.okr-rec__metric-trend.is-stable { color: var(--el-text-color-secondary); }
.okr-rec__list-metric { font-size: 12px; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; }
.okr-rec__card-metric { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-text-color-secondary); }
.okr-rec__card-metric-name { font-weight: 600; }
.okr-rec__card-metric-bar { width: 60px; height: 4px; background: var(--el-fill-color-light); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
.okr-rec__card-metric-bar i { display: block; height: 100%; background: var(--el-color-primary); border-radius: 2px; transition: width 0.3s; }
.okr-rec__card-metric-val { font-variant-numeric: tabular-nums; }

// ── Dimensions（ROI / 难度 / 紧迫 合并列）───────
.okr-rec__cell-dims { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.okr-rec__dim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}
.okr-rec__dim em { font-style: normal; opacity: 0.7; }
.okr-rec__dim b { font-weight: 700; }
.okr-rec__dim.is-high { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
.okr-rec__dim.is-medium { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
.okr-rec__dim.is-low { color: var(--el-color-info); background: var(--el-color-info-light-9); }

// ── Process records ──────────────────────────
.okr-rec__cell-process { display: flex; flex-direction: column; gap: 6px; }
.okr-rec__list-process { margin-bottom: 2px; }
.okr-rec__list-process .okr-rec__process-loop { flex-direction: column; align-items: flex-start; gap: 6px; }
.okr-rec__list-process .okr-rec__process-loop-id { font-size: 10px; padding: 1px 5px; max-width: 120px; }
.okr-rec__card-process { margin-bottom: 6px; }
.okr-rec__card-process .okr-rec__process-loop { flex-direction: column; align-items: flex-start; gap: 6px; }
.okr-rec__process-loop { display: flex; flex-direction: column; gap: 4px; }
.okr-rec__process-loop-id {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1.4;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:hover { background: var(--el-color-primary-light-7); }
}
.okr-rec__process-stages { display: flex; gap: 4px; flex-wrap: wrap; }
.okr-rec__process-stage {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  border-radius: 4px;
  background: var(--el-fill-color);
  opacity: 0.35;
  cursor: default;
  transition: opacity 0.15s, background 0.15s;
  &.is-filled { opacity: 0.7; cursor: pointer; }
  &.is-done { opacity: 1; background: var(--el-color-success-light-9); cursor: pointer; }
  &.is-filled:hover { opacity: 1; background: var(--el-fill-color-light); }
  &.is-done:hover { opacity: 1; background: var(--el-color-success-light-8); }
}

// ── Score（进度条 + 数值）───────────────────────
.okr-rec__score { display: flex; align-items: center; gap: 6px; }
.okr-rec__score-bar {
  display: inline-block;
  width: 56px;
  height: 6px;
  border-radius: 3px;
  background: var(--el-fill-color);
  overflow: hidden;
  flex-shrink: 0;
}
.okr-rec__score-bar i { display: block; height: 100%; border-radius: 3px; transition: width 0.3s; }
.okr-rec__score-bar i.is-danger { background: var(--el-color-danger); }
.okr-rec__score-bar i.is-warning { background: var(--el-color-warning); }
.okr-rec__score-bar i.is-primary { background: var(--el-color-primary); }
.okr-rec__score-bar i.is-info { background: var(--el-color-info); }
.okr-rec__score-bar i.is-success { background: var(--el-color-success); }
.okr-rec__score-num,
.okr-rec__list-score,
.okr-rec__card-score {
  font-weight: 700;
  font-family: monospace;
  &.is-danger { color: var(--el-color-danger); }
  &.is-warning { color: var(--el-color-warning); }
  &.is-primary { color: var(--el-color-primary); }
  &.is-info { color: var(--el-color-info); }
  &.is-success { color: var(--el-color-success); }
}
.okr-rec__score-num { font-size: 12px; }
.okr-rec__list-score { font-size: 16px; }
.okr-rec__card-score { font-size: 18px; }

// ── List view ───────────────────────────────────
.okr-rec__list { display: flex; flex-direction: column; gap: 6px; }
.okr-rec__list-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 4px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow 0.2s, border-color 0.2s, border-left-color 0.2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    .okr-rec__list-actions { opacity: 1; }
  }
  &.is-priority-p0 { border-left-color: var(--el-color-danger); }
  &.is-priority-p1 { border-left-color: var(--el-color-warning); }
  &.is-priority-p2 { border-left-color: var(--el-color-primary); }
  &.is-priority-p3 { border-left-color: var(--el-color-info); }
}
.okr-rec__list-left {
  flex-shrink: 0;
  padding-top: 1px;
}
.okr-rec__list-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.okr-rec__list-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.okr-rec__list-title { font-size: 14px; font-weight: 600; line-height: 1.4; }
.okr-rec__list-status {
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
.okr-rec__list-status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  .is-success & { background: var(--el-color-success); }
  .is-danger & { background: var(--el-color-danger); }
  .is-warning & { background: var(--el-color-warning); }
  .is-info & { background: var(--el-color-info); }
}
.okr-rec__list-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.okr-rec__list-due { font-size: 12px; white-space: nowrap; &.is-overdue { color: var(--el-color-danger); font-weight: 700; } }
.okr-rec__list-metric { font-size: 12px; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; }
.okr-rec__list-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding-top: 1px;
}
.okr-rec__list-score-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.okr-rec__list-score { font-size: 20px; font-weight: 800; font-family: monospace; }
.okr-rec__list-score-label { font-size: 10px; color: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: 0.5px; }
.okr-rec__list-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

// ── Card view ───────────────────────────────────
.okr-rec__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.okr-rec__card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-top: 4px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  overflow: hidden;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    .okr-rec__card-actions { opacity: 1; }
  }
  &.is-priority-p0 { border-top-color: var(--el-color-danger); }
  &.is-priority-p1 { border-top-color: var(--el-color-warning); }
  &.is-priority-p2 { border-top-color: var(--el-color-primary); }
  &.is-priority-p3 { border-top-color: var(--el-color-info); }
}
.okr-rec__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 16px 0;
}
.okr-rec__card-head-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.okr-rec__card-head-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.okr-rec__card-due {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  &.is-overdue { color: var(--el-color-danger); font-weight: 700; }
}
.okr-rec__card-status {
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
.okr-rec__card-status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  .is-success & { background: var(--el-color-success); }
  .is-danger & { background: var(--el-color-danger); }
  .is-warning & { background: var(--el-color-warning); }
  .is-info & { background: var(--el-color-info); }
}
.okr-rec__card-score { font-size: 24px; font-weight: 800; font-family: monospace; line-height: 1; }
.okr-rec__card-process { padding: 0 16px; }
.okr-rec__card-title { font-size: 14px; font-weight: 700; line-height: 1.4; padding: 0 16px; }
.okr-rec__card .okr-rec__cell-dims { padding: 0 16px; }
.okr-rec__card-metric {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 16px;
  margin: 0 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.okr-rec__card-metric-icon { font-size: 16px; flex-shrink: 0; padding-top: 1px; }
.okr-rec__card-metric-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.okr-rec__card-metric-head { display: flex; align-items: center; justify-content: space-between; }
.okr-rec__card-metric-name { font-weight: 600; color: var(--el-text-color-primary); }
.okr-rec__card-metric-pct { font-size: 11px; font-weight: 700; color: var(--el-color-primary); font-variant-numeric: tabular-nums; }
.okr-rec__card-metric-bar { height: 5px; background: var(--el-fill-color); border-radius: 3px; overflow: hidden; }
.okr-rec__card-metric-bar i { display: block; height: 100%; background: var(--el-color-primary); border-radius: 3px; transition: width 0.4s ease; }
.okr-rec__card-metric-val { font-size: 11px; font-variant-numeric: tabular-nums; }
.okr-rec__card-progress { padding: 0 16px; }
.okr-rec__card-orch { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 0 16px; }
.okr-rec__card-reason {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  padding: 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: var(--el-text-color-primary); }
  &.is-expanded {
    -webkit-line-clamp: unset;
    display: block;
  }
}
.okr-rec__card-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 10px 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}
.okr-rec__card-actions {
  display: flex;
  gap: 2px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s;
}
.okr-rec__card-due { margin-left: auto; }
</style>
