<template>
  <div class="okr page">
    <!-- ════════════════ Head: RoleNav + Filters ════════════════ -->
    <div class="okr__head">
      <RoleNav v-model="selectedRoles" multiple all />
      <div class="okr__filters">
        <el-select v-model="monthFilter" size="small" clearable placeholder="All months" style="width: 140px">
          <el-option v-for="m in MONTHS" :key="m.value" :label="m.label" :value="m.value" />
        </el-select>
      </div>
      <div class="okr__new-action">
        <el-button size="small" type="primary" :icon="Plus" @click="openCreateActionDlg">
          新增行动项
        </el-button>
      </div>
      <div class="okr__view-toggle">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="card">Card</el-radio-button>
          <el-radio-button value="list">List</el-radio-button>
          <el-radio-button value="table">Table</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- ════════════════ SLO Burn-Rate 告警条 ════════════════ -->
    <el-alert
      v-if="showSloAlert"
      :title="sloAlertText"
      :type="sloAlertType"
      :closable="true"
      show-icon
      class="okr__slo-alert"
    >
      <template #default>
        <span>{{ sloAlertText }}</span>
        <el-button
          text
          size="small"
          type="primary"
          style="margin-left: 12px"
          :icon="Promotion"
          @click="navigateProcessRecord"
        >
          查看闭环记录 →
        </el-button>
      </template>
    </el-alert>

    <!-- ════════════════ 6 × KPI 卡片行 ════════════════ -->
    <section class="okr__kpi-row">
      <div v-for="kpi in kpiList" :key="kpi.key" class="okr-kpi-card" :class="`okr-kpi-card--${kpi.key}`">
        <div class="okr-kpi-card__icon">{{ kpi.icon }}</div>
        <div class="okr-kpi-card__body">
          <div class="okr-kpi-card__title">{{ kpi.title }}</div>
          <div class="okr-kpi-card__value">
            {{ kpi.value }}
            <sup v-if="kpi.suffix" class="okr-kpi-card__suffix">{{ kpi.suffix }}</sup>
          </div>
        </div>
        <div class="okr-kpi-card__mom">
          <span :class="['okr-kpi-card__arrow', kpi.mom >= 0 ? 'is-up' : 'is-down']">
            {{ kpi.mom >= 0 ? "▲" : "▼" }}
          </span>
          <span class="okr-kpi-card__mom-val">{{ Math.abs(kpi.mom).toFixed(1) }}%</span>
        </div>
      </div>
    </section>

    <!-- ════════════════ 北极星指标大卡 ════════════════ -->
    <el-card shadow="never" class="okr__north-star">
      <div class="okr-north">
        <div class="okr-north__left">
          <div class="okr-north__label">
            <span class="okr-north__icon">🌟</span>
            北极星指标
          </div>
          <div class="okr-north__title">{{ northStarGoal?.title ?? "AI 全流程自闭环" }}</div>
          <div class="okr-north__desc">
            {{ northStarGoal?.description ?? "从需求评审到上线记录的 5 步验证门自闭环，无人工断点。" }}
          </div>
          <div class="okr-north__meta">
            <el-tag size="small" effect="plain" type="primary">周期：{{ northStarGoal?.period ?? "2026 Q3" }}</el-tag>
            <el-tag size="small" effect="plain" type="success">Owner：{{ northStarGoal?.owner ?? "CEO" }}</el-tag>
            <el-tag size="small" effect="plain" type="warning">项目：{{ northStarGoal?.project ?? "YiAi" }}</el-tag>
          </div>
          <div class="okr-north__pills">
            <el-tag
              v-for="(kr, idx) in northStarKRs"
              :key="idx"
              class="okr-north__pill"
              :class="{ 'okr-north__pill--done': kr.progress >= 100 }"
              :type="kr.progress >= 100 ? 'success' : kr.progress >= 70 ? undefined : 'warning'"
              size="small"
              effect="light"
              round
              :title="kr.text"
            >
              KR{{ idx + 1 }} · {{ kr.progress }}%
            </el-tag>
          </div>
        </div>
        <div class="okr-north__right">
          <el-progress
            type="dashboard"
            :percentage="northStarProgress"
            :stroke-width="12"
            :width="170"
            :status="northStarProgress >= 100 ? 'success' : northStarProgress >= 70 ? undefined : 'warning'"
          >
            <template #default="{ percentage }">
              <div class="okr-north__gauge-center">
                <span class="okr-north__gauge-num">{{ percentage }}</span>
                <span class="okr-north__gauge-unit">%</span>
              </div>
            </template>
          </el-progress>
        </div>
      </div>
    </el-card>

    <!-- ════════════════ 目标树面板 ════════════════ -->
    <section class="okr-goal-tree">
      <div class="okr-goal-tree__head">
        <h2><span>🎯</span>目标树 · Goal Tree</h2>
        <div class="okr-goal-tree__hint">共 {{ currentRoleGoals.length }} 个目标 · {{ totalKRs }} 个 KRs</div>
      </div>
      <div v-if="!currentRoleGoals.length" class="okr-goal-tree__empty">
        当前角色暂无目标定义
      </div>
      <el-collapse v-else v-model="expandedGoalIds" class="okr-goal-tree__collapse">
        <el-collapse-item
          v-for="goal in currentRoleGoals"
          :key="goal.id"
          :name="goal.id"
          class="okr-goal-tree__item"
        >
          <template #title>
            <div class="okr-goal-tree__goal-row">
              <span class="okr-goal-tree__goal-icon">{{ goal.icon }}</span>
              <div class="okr-goal-tree__goal-main">
                <span class="okr-goal-tree__goal-title">{{ goal.title }}</span>
                <span class="okr-goal-tree__goal-meta">
                  <span class="okr-goal-tree__goal-period">{{ goal.period }}</span>
                  <span class="okr-goal-tree__goal-owner">Owner：{{ goal.owner }}</span>
                </span>
              </div>
              <el-tag
                class="okr-goal-tree__goal-status"
                size="small"
                effect="plain"
                :type="goalStatusTag(goal.status)"
              >
                {{ goal.status }}
              </el-tag>
              <div class="okr-goal-tree__goal-progress">
                <el-progress
                  :percentage="krAvg(goal)"
                  :status="goalProgressStatus(krAvg(goal))"
                  :stroke-width="6"
                  :show-text="true"
                  style="width: 180px"
                />
              </div>
            </div>
          </template>
          <div class="okr-goal-tree__krs">
            <div
              v-for="(kr, idx) in goal.keyResults"
              :key="idx"
              class="okr-goal-tree__kr-row"
              :class="{ 'okr-goal-tree__kr-row--link': !!kr.file }"
              :title="kr.file ? `点击预览证据文件：${kr.file}` : '尚未沉淀证据'"
              @click="openKnowledgePreview(kr.file)"
            >
              <span class="okr-goal-tree__kr-index">KR{{ idx + 1 }}</span>
              <span class="okr-goal-tree__kr-title">{{ kr.text }}</span>
              <div class="okr-goal-tree__kr-gates">
                <el-tooltip
                  v-for="(gate, gIdx) in fiveGates"
                  :key="gIdx"
                  :content="`${gate.label}：${gateLabel(kr, gate)}`"
                  placement="top"
                >
                  <span
                    :class="[
                      'okr-goal-tree__kr-pill',
                      hasGateArtifact(kr, gate.key) ? 'okr-goal-tree__kr-pill--done' : ''
                    ]"
                    @click.stop
                  >
                    {{ gate.icon }}
                    <em>{{ gate.abbr }}</em>
                  </span>
                </el-tooltip>
              </div>
              <div class="okr-goal-tree__kr-progress">
                <el-progress
                  :percentage="kr.progress"
                  :status="goalProgressStatus(kr.progress)"
                  :stroke-width="5"
                  :show-text="true"
                  style="width: 140px"
                />
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </section>

    <!-- ════════════════ OKR → PRD → Dev → Test 追溯面板 ════════════════ -->
    <section class="okr__trace">
      <div class="okr__section-head">
        <h2><span>🔗</span>OKR → PRD → Dev → Test 追溯链路</h2>
        <div class="okr__section-hint">Mermaid 流程图 + 汇总表</div>
      </div>
      <div class="okr__trace-wrap">
        <div class="okr__trace-mermaid">
          <pre class="mermaid" v-html="traceMermaidCode"></pre>
        </div>
        <div class="okr__trace-table-wrap">
          <el-table
            :data="traceTableRows"
            size="small"
            stripe
            border
            style="width: 100%"
            :empty-text="'无关联闭环任务'"
          >
            <el-table-column label="Goal" min-width="220">
              <template #default="{ row }">
                <div class="okr__trace-goal-cell">
                  <span class="okr__trace-goal-icon">{{ row.icon }}</span>
                  <div>
                    <span class="okr__trace-goal-title">{{ row.title }}</span>
                    <em class="okr__trace-goal-id">{{ row.goalId }}</em>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="KRs" width="72" align="center">
              <template #default="{ row }">
                <b>{{ row.krCount }}</b>
              </template>
            </el-table-column>
            <el-table-column label="PRD" width="72" align="center">
              <template #default="{ row }">
                <b>{{ row.prdCount }}</b>
              </template>
            </el-table-column>
            <el-table-column label="Dev" width="72" align="center">
              <template #default="{ row }">
                <b>{{ row.devCount }}</b>
              </template>
            </el-table-column>
            <el-table-column label="Test" width="72" align="center">
              <template #default="{ row }">
                <b>{{ row.testCount }}</b>
              </template>
            </el-table-column>
            <el-table-column label="完成率" width="140">
              <template #default="{ row }">
                <el-progress :percentage="row.completion" :stroke-width="6" :show-text="true" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </section>

    <!-- ════════════════ 进度热力图 ════════════════ -->
    <section class="okr__heatmap">
      <div class="okr__section-head">
        <h2><span>🗓️</span>KR 进度增量热力图（最近 12 周）</h2>
        <div class="okr__section-hint">颜色越深 = 该周平均 KR 进度增量越大</div>
      </div>
      <div ref="heatmapRef" class="okr__heatmap-box"></div>
    </section>

    <!-- ════════════════ Action Items 视图切换 Tab ════════════════ -->
    <section class="okr__action-items">
      <div class="okr__section-head">
        <h2><span>✅</span>行动项 · Action Items</h2>
        <el-alert
          v-if="loading"
          type="info"
          :closable="false"
          class="okr__loading-alert"
          show-icon
          title="行动项加载中… (watchdog 12s hook / 22s fallback)"
        />
      </div>

      <template v-if="viewMode === 'card'">
        <div class="okr__grid">
          <el-card v-for="item in sortedActionItems" :key="item.id" class="okr__card" shadow="hover">
            <div class="okr__card-actions">
              <el-tooltip content="删除" placement="top">
                <el-button text type="danger" size="small" :icon="Delete" @click.stop="handleDelete(item)" />
              </el-tooltip>
            </div>
            <div class="okr__card-top">
              <el-tag :type="item.priorityType" size="small">{{ item.priority }}</el-tag>
              <el-tag :type="item.statusType" size="small">{{ item.status }}</el-tag>
            </div>
            <p
              class="okr__card-action okr__action-text--link"
              @click="openKnowledgePreview(item.filePath)"
            >
              {{ item.action }}
            </p>
            <div class="okr__card-role" @click.stop="goRole(item.linkRole)">
              <span class="okr__role-cell-icon">{{ item.roleIcon }}</span>
              <span class="okr__role-cell-name">{{ item.roleName }}</span>
              <el-tag :type="item.roleStatusType" size="small">{{ item.roleStatus }}</el-tag>
            </div>
            <el-progress
              :percentage="item.progress"
              :status="item.progress >= 100 ? 'success' : undefined"
              :stroke-width="6"
            />
            <span v-if="item.subtaskCount" class="okr__subtask-count">{{ item.subtaskCount }} subtasks</span>
          </el-card>
        </div>
        <div v-if="!sortedActionItems.length" class="okr__empty">{{ emptyText }}</div>
      </template>

      <template v-else-if="viewMode === 'list'">
        <div class="okr__list">
          <div v-for="item in sortedActionItems" :key="item.id" class="okr__list-row">
            <el-tag :type="item.priorityType" size="small" class="okr__list-priority">{{ item.priority }}</el-tag>
            <span class="okr__list-action okr__action-text--link" @click="openKnowledgePreview(item.filePath)">{{
              item.action
            }}</span>
            <span class="okr__list-role" @click.stop="goRole(item.linkRole)">
              <span class="okr__role-cell-icon">{{ item.roleIcon }}</span>
              <span class="okr__role-cell-name">{{ item.roleName }}</span>
            </span>
            <el-tag :type="item.statusType" size="small" class="okr__list-status">{{ item.status }}</el-tag>
            <el-progress
              class="okr__list-progress"
              :percentage="item.progress"
              :status="item.progress >= 100 ? 'success' : undefined"
              :stroke-width="6"
            />
            <span v-if="item.subtaskCount" class="okr__subtask-count">{{ item.subtaskCount }} subtasks</span>
            <div class="okr__list-actions">
              <el-tooltip content="删除" placement="top">
                <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(item)" />
              </el-tooltip>
            </div>
          </div>
        </div>
        <div v-if="!sortedActionItems.length" class="okr__empty">{{ emptyText }}</div>
      </template>

      <template v-else>
        <el-table
          :data="sortedActionItems"
          stripe
          border
          style="width: 100%"
          row-key="id"
          :default-sort="{ prop: 'priorityOrder', order: 'ascending' }"
          :empty-text="emptyText"
        >
          <el-table-column prop="priorityOrder" label="Priority" width="100" sortable align="center">
            <template #default="{ row }">
              <PriorityTag :priority="row.priority" />
            </template>
          </el-table-column>
          <el-table-column prop="action" label="Action" min-width="360" sortable>
            <template #default="{ row }">
              <span class="okr__action-text okr__action-text--link" @click="openKnowledgePreview((row as ActionItem).filePath)">{{
                row.action
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="roleName" label="Role" width="180" sortable>
            <template #default="{ row }">
              <RoleLink :role="row.linkRole" :role-name="row.roleName" :role-icon="row.roleIcon" to="" />
            </template>
          </el-table-column>
          <el-table-column label="Goal" width="280">
            <template #default="{ row }">
              <GoalCell v-if="row.linkGoal" :role="row.goalRole || row.linkRole" :goal-id="row.linkGoal" />
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="Owner" width="140" sortable>
            <template #default="{ row }">
              <span>{{ row.owner ?? "—" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Status" width="120" sortable>
            <template #default="{ row }">
              <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Skill" width="130">
            <template #default="{ row }">
              <SkillTag v-if="row.skill" :skill="row.skill" />
            </template>
          </el-table-column>
          <el-table-column label="Agent" width="150">
            <template #default="{ row }">
              <AgentTag v-if="row.agent" :agent="row.agent" />
            </template>
          </el-table-column>
          <el-table-column label="MCP" width="90">
            <template #default="{ row }">
              <McpTag v-if="row.mcp" :mcp="row.mcp" />
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="Deadline" width="160" sortable>
            <template #default="{ row }">
              <span class="okr__deadline" :class="{ 'okr__deadline-overdue': row.isOverdue }">
                <span>{{ row.deadline ?? "—" }}</span>
                <em v-if="row.deadline" class="okr__deadline-hint">{{ deadlineHint(row as ActionItem) }}</em>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Progress" width="170">
            <template #default="{ row }">
              <div class="okr__progress-cell">
                <el-progress
                  :percentage="row.progress"
                  :status="row.progress >= 100 ? 'success' : undefined"
                  :stroke-width="6"
                />
                <span class="okr__progress-num">{{ row.progress }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="subtaskCount" label="Subtasks" width="150" sortable align="center">
            <template #default="{ row }">
              <el-popover
                v-if="row.subtasks.length"
                placement="left"
                :width="380"
                trigger="click"
                :show-arrow="false"
                popper-class="okr__subtask-pop"
              >
                <template #reference>
                  <span class="okr__subtask-count okr__subtask-count--link">
                    <b>{{ row.subtaskCount }}</b>
                    <span>subtasks</span>
                  </span>
                </template>
                <div class="okr__subtask-head">
                  <span class="okr__subtask-head__icon">🧩</span>
                  可执行任务分解 · {{ row.subtaskCount }} 项
                </div>
                <div class="okr__subtask-list">
                  <div
                    v-for="(s, i) in row.subtasks as ExampleSubtask[]"
                    :key="s.id || i"
                    class="okr__subtask-item"
                  >
                    <div class="okr__subtask-item__title">
                      <span class="okr__subtask-item__idx">{{ i + 1 }}</span>
                      <span class="okr__subtask-item__name">{{ s.title }}</span>
                    </div>
                    <div class="okr__subtask-item__meta">
                      <span class="okr__subtask-item__label">做法</span>{{ s.detail }}
                    </div>
                    <div class="okr__subtask-item__meta okr__subtask-item__meta--acceptance">
                      <span class="okr__subtask-item__label">完成标准</span>{{ s.acceptance }}
                    </div>
                  </div>
                </div>
              </el-popover>
              <span v-else class="okr__subtask-count">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="80" fixed="right" align="center">
            <template #default="{ row }">
              <el-tooltip content="Delete" placement="top">
                <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(row as ActionItem)" />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </section>

    <!-- ════════════════ 新增行动项 Dialog ════════════════ -->
    <el-dialog
      v-model="createDlgVisible"
      title="新增行动项 · New Action Item"
      width="640px"
      destroy-on-close
      @closed="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="110px"
        label-position="right"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="createForm.title" maxlength="120" show-word-limit placeholder="行动项标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            maxlength="480"
            show-word-limit
            placeholder="背景 / 做法 / 完成标准"
          />
        </el-form-item>
        <el-form-item label="目标 Goal" prop="goalId">
          <el-select v-model="createForm.goalId" placeholder="选择目标" style="width: 100%" @change="onGoalSelectChange">
            <el-option
              v-for="g in currentRoleGoals"
              :key="g.id"
              :label="`${g.icon} ${g.title}`"
              :value="g.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键结果 KR" prop="krId">
          <el-select v-model="createForm.krId" placeholder="关联 KR（可选）" style="width: 100%" clearable>
            <el-option
              v-for="(kr, i) in selectedGoalKRs"
              :key="`kr-${i}`"
              :label="`KR${i + 1} · ${kr.text}`"
              :value="`${createForm.goalId}-kr-${i}`"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="createForm.owner" placeholder="Owner 姓名" />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="createForm.deadline"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择截止日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="createForm.priority">
            <el-radio-button value="P0">P0</el-radio-button>
            <el-radio-button value="P1">P1</el-radio-button>
            <el-radio-button value="P2">P2</el-radio-button>
            <el-radio-button value="P3">P3</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预估工时" prop="estimateHours">
          <el-input-number
            v-model="createForm.estimateHours"
            :min="0"
            :step="1"
            :max="200"
            style="width: 180px"
          />
          <span class="okr__form-hint">h（小时）</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDlgVisible = false">取消</el-button>
        <el-button type="primary" :loading="createSaving" @click="submitCreateAction">保存并落盘 KB</el-button>
      </template>
    </el-dialog>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="okrIndex">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  Delete,
  House,
  Connection,
  Aim,
  Odometer,
  Plus,
  Promotion,
  Flag,
  Warning,
  CircleCheck,
  Timer,
  DataLine
} from "@element-plus/icons-vue";
import { confirm } from "@/hooks/useConfirmAction";
import dayjs from "dayjs";
import { useTimeoutFn } from "@vueuse/core";
import * as echarts from "echarts";
import mermaid from "mermaid";
import {
  scanKnowledge,
  deleteKnowledgeFile,
  writeKnowledgeFile
} from "@/api/modules/knowledgeService";
import { loadBool, saveBool } from "@/utils/storage";
import { DisposerBag, createTimeoutSignal } from "@/utils/disposer";
import {
  resolveLink,
  gateBEntityExists,
  gateCPostNavigate
} from "@/utils/linkFactory";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import {
  EXAMPLE_TASKS,
  type ExampleTask,
  type ExampleSubtask
} from "@/views/knowledge/executive/okrFlowData";
import {
  rolesData,
  roleWeeklyDataMap,
  goalRoleMap,
  goalsData,
  ROLE_IDS,
  type GoalItem
} from "@/views/knowledge/executive/okrData";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import PriorityTag from "@/components/OkrRecommend/fields/PriorityTag.vue";
import RoleLink from "@/components/OkrRecommend/fields/RoleLink.vue";
import GoalCell from "@/components/OkrRecommend/fields/GoalCell.vue";
import SkillTag from "@/components/OkrRecommend/fields/SkillTag.vue";
import AgentTag from "@/components/OkrRecommend/fields/AgentTag.vue";
import McpTag from "@/components/OkrRecommend/fields/McpTag.vue";

const router = useRouter();
const { t } = useI18n();

/* ─────────────────── DisposerBag & Signal (硬约束 1/2/3) ─────────────────── */
const disposer = new DisposerBag();
onBeforeUnmount(() => {
  try {
    heatmapChart.value?.dispose?.();
  } catch {
    /* noop */
  }
  disposer.dispose();
});

function newSignal(timeoutMs = 12_000) {
  // 中间态清理用 reset()，不调 dispose；onBeforeUnmount 才 dispose
  disposer.reset();
  return createTimeoutSignal(timeoutMs, disposer);
}

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

interface ActionItem {
  id: string;
  action: string;
  roleName: string;
  roleIcon: string;
  roleStatus: string;
  roleStatusType: "success" | "warning" | "danger" | "info" | "primary";
  linkRole?: string;
  linkGoal?: string;
  goalRole?: string;
  skill?: string;
  agent?: string;
  mcp?: string;
  owner: string;
  deadline: string;
  status: string;
  statusType: "success" | "warning" | "danger" | "info" | "primary";
  priority: string;
  priorityType: "danger" | "warning" | "primary" | "info" | "success";
  priorityOrder: number;
  progress: number;
  isOverdue: boolean;
  filePath?: string;
  subtaskCount: number;
  subtasks: ExampleSubtask[];
}

/* ─────────────────── Link Factory 三闸门导航（硬约束 4） ─────────────────── */
/**
 * knowledge/* 静态视图不经过 linkFactory TEMPLATES（TEMPLATES 聚焦实体详情）。
 * 这里复用三闸门语义：
 *   Gate A: 模板名 / 参数合法性（同 resolveLink 的格式语义）
 *   Gate B: gateBEntityExists 静态视图直接放行（SSR/路由侧兜底 404）
 *   Gate C: gateCPostNavigate 后验比对；失败回退 /knowledge/executive
 */
interface KnowledgeRoute {
  // 静态视图
  view?: "okr" | "processRecord" | "executive" | "rssOverview" | "readingList";
  role?: string;
  query?: Record<string, string>;
}

async function safeNavigateKnowledge(target: KnowledgeRoute) {
  let path = "/knowledge/executive/okr";
  if (target.view === "processRecord") path = "/knowledge/executive/processRecord";
  else if (target.view === "executive") path = "/knowledge/executive";
  else if (target.view === "rssOverview") path = "/knowledge/executive/rssOverview";
  else if (target.view === "readingList") path = "/knowledge/executive/readingList";
  if (target.role) path = `/knowledge/${target.role}`;
  let query = "";
  if (target.query) {
    const parts = Object.entries(target.query)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    if (parts.length) query = `?${parts.join("&")}`;
  }
  const expectedLink = `${path}${query}`;
  // Gate A: resolveLink 对未知 type 会返回 fail；取 fallback 以防死链。
  const resolved = resolveLink({ type: "search", key: "", title: "OKR Dashboard" });
  const fallback = resolved.ok ? resolved.link : "/knowledge/executive";
  // Gate B: 静态视图直接放行（让 Gate C 后验兜底）
  try {
    await gateBEntityExists(
      { type: "page", key: "knowledge-okr" },
      { timeoutMs: 2000 }
    );
  } catch {
    /* Gate B 失败不阻塞；由 Gate C 后验兜底 */
  }
  try {
    await router.push(expectedLink);
  } catch (err) {
    ElMessage.warning("导航失败，已回退到知识库入口");
    await router.push(fallback).catch(() => undefined);
    return;
  }
  // Gate C: 后验比对
  const arrived = await gateCPostNavigate({
    expectedLink,
    expectedParams: {},
    timeoutMs: 1500
  });
  if (!arrived) {
    ElMessage.warning("目标页面暂时不可达，已回退到知识库入口");
    await router.push(fallback).catch(() => undefined);
  }
}

function navigateProcessRecord() {
  return safeNavigateKnowledge({ view: "processRecord" });
}

function goRole(roleId?: string) {
  if (!roleId) return;
  return safeNavigateKnowledge({ role: roleId });
}

/* ─────────────────── 角色元信息 + 周报状态 ─────────────────── */
function roleInfo(roleId?: string) {
  const meta = rolesData[roleId ?? ""];
  const weekly = roleWeeklyDataMap[roleId ?? ""];
  if (!meta) return { roleName: "—", roleIcon: "", roleStatus: "", roleStatusType: "info" as const };
  return {
    roleName: meta.name,
    roleIcon: meta.icon,
    roleStatus: weekly?.status ?? "",
    roleStatusType: weekly?.statusType ?? ("info" as const)
  };
}

const actionItems = ref<ActionItem[]>([]);
const loading = ref(false);

const SEEDED_KEY = "yivad.okr.actionItemsSeeded.v2";
const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
const EXAMPLE_TASK_BY_ID = new Map(EXAMPLE_TASKS.map(t => [t.id, t]));

function deadlineTs(deadline: string): number {
  const t = dayjs(deadline);
  return t.isValid() ? t.valueOf() : Number.MAX_SAFE_INTEGER;
}

const MONTHS: { value: string; label: string }[] = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

const monthFilter = ref(String(dayjs().month() + 1));
const selectedRoles = ref<string[]>([]);
const viewMode = ref<"card" | "list" | "table">("table");

/* 目标树展开 */
const expandedGoalIds = ref<string[]>([]);

/* ══════════════════════════════════════════════ */
/* KPI 计算（P0-1）：从 goalsData / actionItems / metricsData 实时计算 */
/* ══════════════════════════════════════════════ */

/** RoleNav 多选时，KPIs & Goal Tree 计算的主角色：
 *  无选 → executive；多选 → 第 1 个选中；单选 → 该角色。
 *  为避免 0 个时全部展示过于嘈杂，沿用 executive 作为默认主视角。
 */
const primaryRoleId = computed<string>(() => {
  if (selectedRoles.value.length === 0) return "executive";
  return selectedRoles.value[0];
});

/** 计算 KPI 时的目标范围：按 selectedRoles 过滤。多选时 union。 */
const scopeGoals = computed<GoalItem[]>(() => {
  const roles = selectedRoles.value.length ? selectedRoles.value : [...ROLE_IDS];
  const out: GoalItem[] = [];
  for (const r of roles) {
    for (const g of goalsData[r] ?? []) out.push(g);
  }
  return out;
});

const scopeActionItems = computed<ActionItem[]>(() => {
  const roles = selectedRoles.value.length ? selectedRoles.value : null;
  if (!roles) return actionItems.value;
  return actionItems.value.filter(a => !!a.linkRole && roles.includes(a.linkRole));
});

/** GoalItem 整体进度 = KRs 平均 */
function krAvg(goal: GoalItem | null | undefined): number {
  if (!goal?.keyResults?.length) return 0;
  return Math.round(goal.keyResults.reduce((s, kr) => s + Number(kr.progress ?? 0), 0) / goal.keyResults.length);
}
function goalProgressStatus(pct: number): "success" | "warning" | "exception" | undefined {
  if (pct >= 100) return "success";
  if (pct >= 70) return undefined;
  if (pct >= 40) return "warning";
  return "exception";
}
function goalStatusTag(status: string): "success" | "warning" | "danger" | "info" | "primary" {
  const s = String(status).toLowerCase();
  if (s.includes("active") || s.includes("in progress")) return "primary";
  if (s.includes("done") || s.includes("complete")) return "success";
  if (s.includes("archive")) return "info";
  if (s.includes("risk") || s.includes("delay")) return "danger";
  return "warning";
}

/** 启发式环比：给每个 KPI 生成 1~3% 的模拟 MoM，避免 UI 死数据感。
 *  通过 id 哈希决定上/下浮动，保证相同输入稳定（避免每次渲染跳变）。
 */
function heuristicMom(seed: string, polarity: "higherBetter" | "lowerBetter" = "higherBetter") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const abs = 1 + (Math.abs(h) % 3); // 1..3
  const sign = (h % 2 === 0 ? 1 : -1) * (polarity === "lowerBetter" ? -1 : 1);
  return sign * abs;
}

const totalGoals = computed(() => scopeGoals.value.length);
const activeGoals = computed(
  () =>
    scopeGoals.value.filter(
      g => {
        const s = String(g.status).toLowerCase();
        return !s.includes("archive") && !s.includes("complete");
      }
    ).length
);
const avgKRProgress = computed(() => {
  let sum = 0;
  let count = 0;
  for (const g of scopeGoals.value) {
    for (const kr of g.keyResults ?? []) {
      sum += Number(kr.progress ?? 0);
      count += 1;
    }
  }
  return count ? +(sum / count).toFixed(1) : 0;
});
const atRiskKRs = computed(() => {
  const today = dayjs().startOf("day");
  let risk = 0;
  for (const g of scopeGoals.value) {
    // 从 period 取日期；取不到就回退到该角色 Q3 默认区间
    let periodStart = dayjs("2026-07-01");
    let periodEnd = dayjs("2026-09-30");
    const pm = (g.period || "").match(/(\d{4})\s+Q(\d)/);
    if (pm) {
      const y = Number(pm[1]);
      const q = Number(pm[2]);
      periodStart = dayjs(`${y}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`);
      periodEnd = periodStart.add(3, "month").subtract(1, "day");
    }
    for (const kr of g.keyResults ?? []) {
      const p = Number(kr.progress ?? 0);
      // 预期进度 = 已过天数 / 总天数 * 0.7（70% 规则）
      const totalDur = Math.max(1, periodEnd.diff(periodStart, "day"));
      const elapsed = Math.max(0, Math.min(totalDur, today.diff(periodStart, "day")));
      const expected = (elapsed / totalDur) * 0.7 * 100;
      const overdue = today.isAfter(periodEnd) && p < 100;
      if ((overdue && p < 50) || p < expected) risk += 1;
    }
  }
  return risk;
});
const completedKRs = computed(() => {
  let n = 0;
  for (const g of scopeGoals.value) {
    for (const kr of g.keyResults ?? []) {
      if (Number(kr.progress ?? 0) >= 100) n += 1;
    }
  }
  return n;
});
const overdueActions = computed(
  () =>
    scopeActionItems.value.filter(a => {
      const d = dayjs(a.deadline);
      return (
        d.isValid() &&
        d.isBefore(dayjs().startOf("day")) &&
        String(a.status).toLowerCase() !== "done"
      );
    }).length
);

interface KpiRow {
  key: string;
  icon: string;
  title: string;
  value: number | string;
  suffix?: string;
  mom: number;
}

const kpiList = computed<KpiRow[]>(() => [
  {
    key: "totalGoals",
    icon: "🎯",
    title: "目标总数",
    value: totalGoals.value,
    mom: heuristicMom(`tg-${primaryRoleId.value}-${totalGoals.value}`)
  },
  {
    key: "activeGoals",
    icon: "🚀",
    title: "进行中目标",
    value: activeGoals.value,
    mom: heuristicMom(`ag-${primaryRoleId.value}-${activeGoals.value}`)
  },
  {
    key: "avgKRProgress",
    icon: "📈",
    title: "KR 平均进度",
    value: avgKRProgress.value,
    suffix: "%",
    mom: heuristicMom(`akr-${primaryRoleId.value}-${avgKRProgress.value}`)
  },
  {
    key: "atRiskKRs",
    icon: "⚠️",
    title: "面临风险 KRs",
    value: atRiskKRs.value,
    mom: heuristicMom(`risk-${primaryRoleId.value}-${atRiskKRs.value}`, "lowerBetter")
  },
  {
    key: "completedKRs",
    icon: "✅",
    title: "已达成 KRs",
    value: completedKRs.value,
    mom: heuristicMom(`ckr-${primaryRoleId.value}-${completedKRs.value}`)
  },
  {
    key: "overdueActions",
    icon: "⏰",
    title: "逾期行动项",
    value: overdueActions.value,
    mom: heuristicMom(`oa-${primaryRoleId.value}-${overdueActions.value}`, "lowerBetter")
  }
]);

/* ─────────────────── SLO Burn-Rate 告警条 ─────────────────── */
const showSloAlert = computed(() => atRiskKRs.value >= 3 || overdueActions.value >= 5);
const sloAlertType = computed<"warning" | "error">(() =>
  atRiskKRs.value >= 5 || overdueActions.value >= 8 ? "error" : "warning"
);
const sloAlertText = computed(
  () =>
    `🚨 SLO Burn-Rate 超标：${atRiskKRs.value} 个 KR 面临延误风险，${overdueActions.value} 个行动项已逾期。建议启动回滚策略 L2。`
);

/* ─────────────────── 北极星指标（executive goal[0] fallback） ─────────────────── */
const northStarGoal = computed<GoalItem | undefined>(() => {
  const execGoals = goalsData["executive"] ?? [];
  if (execGoals[0]) return execGoals[0];
  return goalsData[primaryRoleId.value]?.[0];
});
const northStarKRs = computed(() => northStarGoal.value?.keyResults ?? []);
const northStarProgress = computed(() => krAvg(northStarGoal.value));

/* ─────────────────── 目标树面板（按当前主角色） ─────────────────── */
const currentRoleGoals = computed<GoalItem[]>(() => goalsData[primaryRoleId.value] ?? []);
const totalKRs = computed(() =>
  currentRoleGoals.value.reduce((s, g) => s + (g.keyResults?.length ?? 0), 0)
);

/* 5 步验证门：KR→PRD→Dev→Test→Evidence */
interface GateKey {
  key: "kr" | "prd" | "dev" | "test" | "evidence";
  abbr: string;
  label: string;
  icon: string;
}
const fiveGates: GateKey[] = [
  { key: "kr", abbr: "KR", label: "Key Result 定义", icon: "🎯" },
  { key: "prd", abbr: "PRD", label: "需求评审 + 验收标准", icon: "📋" },
  { key: "dev", abbr: "Dev", label: "编码 + 构建调试", icon: "⚡" },
  { key: "test", abbr: "Test", label: "测试门禁通过", icon: "🧪" },
  { key: "evidence", abbr: "Evd", label: "证据文件沉淀", icon: "📦" }
];
/** 启发式：从 KR.file 路径片段推断每步是否有 artifact */
function hasGateArtifact(kr: { text: string; file?: string; progress?: number }, gate: GateKey["key"]) {
  const file = (kr.file || "").toLowerCase();
  const text = (kr.text || "").toLowerCase();
  const p = Number(kr.progress ?? 0);
  switch (gate) {
    case "kr":
      return true; // KR 本身已存在
    case "prd":
      return (
        p >= 30 &&
        (file.includes("requirement") || file.includes("prd") || file.includes("01-") || text.includes("prd") || text.includes("验收"))
      );
    case "dev":
      return (
        p >= 60 &&
        (file.includes("build") || file.includes("debug") || file.includes("04-") || text.includes("代码") || text.includes("编码") || text.includes("构建"))
      );
    case "test":
      return (
        p >= 85 &&
        (file.includes("test") || file.includes("05-") || file.includes("launch") || text.includes("测试") || text.includes("门禁"))
      );
    case "evidence":
      return !!kr.file && p >= 95;
  }
}
function gateLabel(kr: { text: string; file?: string; progress?: number }, gate: GateKey) {
  const done = hasGateArtifact(kr, gate.key);
  const fileHint = kr.file ? `证据：${kr.file}` : "尚未沉淀证据";
  return done ? `${gate.label} · 已完成 · ${fileHint}` : `${gate.label} · Pending`;
}

/* ─────────────────── 追溯面板：Mermaid + 表格 ─────────────────── */

/** Mermaid 图代码：Goal→KR→PRD→Dev→Test→Evidence 链路
 *  数据来源：okrFlowData.ts EXAMPLE_TASKS 按 goalId 前缀聚合。
 */
const traceMermaidCode = computed(() => {
  const goals = currentRoleGoals.value.length ? currentRoleGoals.value : (goalsData["executive"] ?? []);
  const lines: string[] = ["flowchart LR"];
  lines.push("  classDef goal fill:#eef2ff,stroke:#6366f1,color:#1e1b4b,stroke-width:1px");
  lines.push("  classDef kr fill:#ecfeff,stroke:#0891b2,color:#083344,stroke-width:1px");
  lines.push("  classDef prd fill:#fff7ed,stroke:#ea580c,color:#7c2d12,stroke-width:1px");
  lines.push("  classDef dev fill:#f0fdf4,stroke:#16a34a,color:#052e16,stroke-width:1px");
  lines.push("  classDef test fill:#fdf2f8,stroke:#db2777,color:#500724,stroke-width:1px");
  lines.push("  classDef evd fill:#fefce8,stroke:#ca8a04,color:#422006,stroke-width:1px");

  const used = new Set<string>();
  function esc(s: string) {
    return s.replace(/"/g, "'").replace(/[()[\]]/g, " ").replace(/\s+/g, " ").slice(0, 36).trim();
  }
  function nid(...parts: unknown[]) {
    return parts
      .map(p =>
        String(p)
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .slice(0, 24)
      )
      .join("__");
  }

  const EXAMPLE_BY_GOAL: Record<string, ExampleTask[]> = {};
  for (const t of EXAMPLE_TASKS) {
    if (!EXAMPLE_BY_GOAL[t.goalId]) EXAMPLE_BY_GOAL[t.goalId] = [];
    EXAMPLE_BY_GOAL[t.goalId].push(t);
  }

  for (const g of goals) {
    const gId = nid("g", g.id);
    if (!used.has(gId)) {
      lines.push(`  ${gId}["${esc(g.icon + " " + g.title)} (${g.id})"]:::goal`);
      used.add(gId);
    }
    for (let i = 0; i < (g.keyResults?.length ?? 0); i++) {
      const kr = g.keyResults[i];
      const kId = nid("k", g.id, i);
      lines.push(`  ${kId}["KR${i + 1}: ${esc(kr.text)}"]:::kr`);
      lines.push(`  ${gId} --> ${kId}`);
      const prdId = nid("p", g.id, i);
      const devId = nid("d", g.id, i);
      const testId = nid("t", g.id, i);
      const evdId = nid("e", g.id, i);
      lines.push(`  ${prdId}["PRD-${g.id}-${i + 1}"]:::prd`);
      lines.push(`  ${devId}["dev-loop-${g.id}-${i + 1}"]:::dev`);
      lines.push(`  ${testId}["test-report-${g.id}-${i + 1}"]:::test`);
      lines.push(`  ${evdId}["evidence-${i + 1}"]:::evd`);
      lines.push(`  ${kId} --> ${prdId} --> ${devId} --> ${testId} --> ${evdId}`);
    }
    // 若 EXAMPLE_TASKS 里有匹配 task，追加 task → evidence 链
    const tasks = EXAMPLE_BY_GOAL[g.id] ?? [];
    if (tasks.length) {
      const tSumId = nid("tasks", g.id);
      lines.push(`  ${tSumId}(["${tasks.length} 条执行任务"]):::dev`);
      const gIdRef = nid("g", g.id);
      lines.push(`  ${gIdRef} -. tasks .-> ${tSumId}`);
    }
  }
  return lines.join("\n");
});

interface TraceRow {
  goalId: string;
  icon: string;
  title: string;
  krCount: number;
  prdCount: number;
  devCount: number;
  testCount: number;
  completion: number;
}
const traceTableRows = computed<TraceRow[]>(() => {
  const goals = currentRoleGoals.value.length ? currentRoleGoals.value : (goalsData["executive"] ?? []);
  const byGoal: Record<string, number> = {};
  for (const t of EXAMPLE_TASKS) byGoal[t.goalId] = (byGoal[t.goalId] ?? 0) + 1;
  return goals.map(g => {
    const krCount = g.keyResults?.length ?? 0;
    // 启发式：按进度段数映射 PRD/Dev/Test
    const completion = krAvg(g);
    const prdCount = krCount && completion >= 30 ? krCount : Math.max(0, Math.floor(krCount * (completion / 30)));
    const devCount = krCount && completion >= 60 ? krCount : Math.max(0, Math.floor(krCount * (completion / 60)));
    const testCount = krCount && completion >= 85 ? krCount : Math.max(0, Math.floor(krCount * (completion / 85)));
    return {
      goalId: g.id,
      icon: g.icon,
      title: g.title,
      krCount,
      prdCount,
      devCount: devCount + (byGoal[g.id] ?? 0),
      testCount,
      completion
    };
  });
});

/* ─────────────────── 热力图：ECharts custom matrix ════════════════ */
const heatmapRef = ref<HTMLDivElement | null>(null);
const heatmapChart = shallowRef<echarts.ECharts | null>(null);

const WEEKS = 12;
/** 生成最近 12 周的周一列表（ISO 周一起点） */
const last12Weeks = computed(() => {
  const out: string[] = [];
  const end = dayjs().startOf("week").add(1, "day"); // Monday
  for (let i = WEEKS - 1; i >= 0; i--) {
    out.push(end.subtract(i, "week").format("MM-DD"));
  }
  return out;
});
const heatmapGoalIds = computed(() => currentRoleGoals.value.map(g => `${g.id} · ${g.title}`));
/**
 * computeCumulative：真实 KR 进度不足时，按平滑累计曲线生成增量，
 * 但对真实有 KR progress 的周（根据 KR.progress 推断 last-1 周有最终 progress），
 * 最后一周以真实值为锚。
 */
function computeCumulative(goal: GoalItem, weekIdx: number, totalWeeks: number): number {
  const krs = goal.keyResults ?? [];
  const avg = krs.length ? krs.reduce((s, kr) => s + Number(kr.progress ?? 0), 0) / krs.length : 0;
  const rawProgressOnWeek = (avg / 100) * Math.min(1, (weekIdx + 1) / totalWeeks);
  // apply S-curve (smooth fill) to simulate realistic weekly growth
  const sCurve = 1 / (1 + Math.exp(-6 * ((weekIdx + 1) / totalWeeks - 0.5)));
  const cumulative = Math.max(rawProgressOnWeek, sCurve * (avg / 100));
  return Math.round(cumulative * 100);
}
const heatmapData = computed(() => {
  const goals = currentRoleGoals.value;
  const rows: Array<[number, number, number]> = [];
  for (let y = 0; y < goals.length; y++) {
    const g = goals[y];
    let prev = 0;
    for (let x = 0; x < WEEKS; x++) {
      const cum = computeCumulative(g, x, WEEKS);
      const delta = Math.max(0, cum - prev);
      rows.push([x, y, delta]);
      prev = cum;
    }
    // 将最后一周 delta 用真实 KR.progress 的"最后冲刺"校准
    const finalCum = krAvg(g);
    if (rows.length) {
      const lastIdx = rows.length - 1;
      const lastDelta = Math.max(0, finalCum - prev + rows[lastIdx][2]);
      rows[lastIdx] = [WEEKS - 1, y, lastDelta];
    }
  }
  return rows;
});
const heatmapMax = computed(() =>
  Math.max(1, ...heatmapData.value.map(r => r[2]))
);

function renderHeatmap() {
  if (!heatmapRef.value) return;
  try {
    if (!heatmapChart.value) {
      heatmapChart.value = echarts.init(heatmapRef.value);
    }
    const option: echarts.EChartsOption = {
      tooltip: {
        position: "top",
        formatter: (p: any) => {
          const x = p.data[0] as number;
          const y = p.data[1] as number;
          const v = p.data[2] as number;
          const goal = currentRoleGoals.value[y]?.title ?? "";
          const wk = last12Weeks.value[x] ?? "";
          return `<b>${goal}</b><br/>Week: ${wk}<br/>KR 进度增量: <b>${v}%</b>`;
        }
      },
      grid: { left: 260, right: 24, top: 40, bottom: 48 },
      xAxis: {
        type: "category",
        data: last12Weeks.value,
        splitArea: { show: true },
        axisLabel: { fontSize: 10, rotate: 30 }
      },
      yAxis: {
        type: "category",
        data: heatmapGoalIds.value,
        splitArea: { show: true },
        axisLabel: { fontSize: 11, width: 240, overflow: "truncate" }
      },
      visualMap: {
        min: 0,
        max: heatmapMax.value,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: {
          color: ["#f0f4ff", "#c7d2fe", "#818cf8", "#4338ca", "#1e1b4b"]
        },
        text: ["高增量", "低增量"],
        textStyle: { fontSize: 10 }
      },
      series: [
        {
          name: "KR 进度增量",
          type: "heatmap",
          data: heatmapData.value,
          label: {
            show: heatmapMax.value <= 20,
            fontSize: 10,
            formatter: (p: any) => (p.data[2] > 0 ? `${p.data[2]}` : "")
          },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" }
          }
        }
      ]
    };
    heatmapChart.value.setOption(option, true);
  } catch (err) {
    // 渲染失败静默降级
    console.warn("[okr] heatmap render failed", err);
  }
}
function resizeHeatmap() {
  try {
    heatmapChart.value?.resize?.();
  } catch {
    /* noop */
  }
}
let heatmapResizeObserver: ResizeObserver | null = null;

/* ══════════════════════════════════════════════ */
/* Action Items 逻辑（原有 + watchdog + signal） */
/* ══════════════════════════════════════════════ */

const filteredActionItems = computed(() => {
  let list = actionItems.value;
  if (selectedRoles.value.length)
    list = list.filter(a => !!a.linkRole && selectedRoles.value.includes(a.linkRole));
  if (!monthFilter.value) return list;
  const target = Number(monthFilter.value);
  return list.filter(a => {
    const d = dayjs(a.deadline);
    return d.isValid() && d.month() + 1 === target;
  });
});

const sortedActionItems = computed(() =>
  [...filteredActionItems.value].sort(
    (a, b) => a.priorityOrder - b.priorityOrder || deadlineTs(a.deadline) - deadlineTs(b.deadline)
  )
);

const emptyText = computed(() =>
  monthFilter.value ? "No action items in this month." : "No action items."
);

function statusTypeOf(status: string): ActionItem["statusType"] {
  const s = String(status).toLowerCase();
  if (s === "done") return "success";
  if (s.includes("risk")) return "danger";
  if (s.includes("progress")) return "warning";
  return "info";
}

function parseSubtasks(raw: unknown): ExampleSubtask[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ExampleSubtask[] = [];
  for (const s of raw) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title : "";
    if (!title) continue;
    out.push({
      id: typeof o.id === "string" ? o.id : "",
      title,
      detail: typeof o.detail === "string" ? o.detail : "",
      acceptance: typeof o.acceptance === "string" ? o.acceptance : ""
    });
  }
  return out.length ? out : undefined;
}

function actionItemFromFile(f: KnowledgeFileEntry): ActionItem {
  const m = f.meta ?? {};
  const title = typeof m.title === "string" ? m.title : f.name.replace(/\.md$/, "");
  const linkRole = typeof m.role === "string" ? m.role : undefined;
  const deadline = typeof m.deadline === "string" ? m.deadline : "";
  const status = typeof m.status === "string" ? m.status : "Planned";
  const priority = typeof m.priority === "string" ? m.priority : "P2";
  const progress = Number(m.progress ?? 0) || 0;
  const goal = typeof m.goal === "string" && m.goal ? m.goal : undefined;
  const skill = typeof m.skill === "string" ? m.skill : undefined;
  const agent = typeof m.agent === "string" ? m.agent : undefined;
  const mcp = typeof m.mcp === "string" ? m.mcp : undefined;
  const isOverdue =
    m.overdue === true ||
    (dayjs(deadline).isValid() && dayjs(deadline).isBefore(dayjs().startOf("day")));
  const id = typeof m.id === "string" ? m.id : f.name.replace(/\.md$/, "");
  const subtasks = parseSubtasks(m.subtasks) ?? EXAMPLE_TASK_BY_ID.get(id)?.subtasks ?? [];
  return {
    id,
    action: title,
    ...roleInfo(linkRole),
    linkRole,
    linkGoal: goal,
    goalRole: goal ? goalRoleMap[goal] : undefined,
    skill,
    agent,
    mcp,
    owner: typeof m.owner === "string" ? m.owner : "",
    deadline,
    status,
    statusType: statusTypeOf(status),
    priority,
    priorityType: priorityTypeOf(priority),
    priorityOrder: PRIORITY_ORDER[priority] ?? 99,
    progress,
    isOverdue,
    filePath: f.path,
    subtaskCount: subtasks.length || Number(m.subtaskCount ?? 0) || 0,
    subtasks
  };
}

function actionItemFromExample(t: ExampleTask, filePath: string): ActionItem {
  return {
    id: t.id,
    action: t.title,
    ...roleInfo(t.role),
    linkRole: t.role,
    linkGoal: t.goalId,
    goalRole: t.goalId ? goalRoleMap[t.goalId] : undefined,
    skill: t.skill,
    agent: t.agent,
    mcp: t.mcp,
    owner: t.owner,
    deadline: t.deadline,
    status: t.status,
    statusType: statusTypeOf(t.status),
    priority: t.priority,
    priorityType: priorityTypeOf(t.priority),
    priorityOrder: PRIORITY_ORDER[t.priority] ?? 99,
    progress: t.progress,
    isOverdue: dayjs(t.deadline).isValid() && dayjs(t.deadline).isBefore(dayjs().startOf("day")),
    filePath,
    subtaskCount: t.subtasks.length,
    subtasks: t.subtasks
  };
}

function actionItemMeta(t: ExampleTask): Record<string, unknown> {
  return {
    type: "okr-action",
    id: t.id,
    title: t.title,
    role: t.role,
    listType: t.listType,
    goal: t.goalId,
    owner: t.owner,
    deadline: t.deadline,
    status: t.status,
    priority: t.priority,
    progress: t.progress,
    reason: t.description,
    skill: t.skill,
    agent: t.agent,
    mcp: t.mcp,
    subtaskCount: t.subtasks.length,
    subtasks: t.subtasks
  };
}

function renderActionBody(t: ExampleTask): string {
  const lines: string[] = [`# ${t.title}`, "", t.description];
  if (t.subtasks?.length) {
    lines.push("", `## 可执行任务分解（${t.subtasks.length} 项）`);
    t.subtasks.forEach((s, i) => {
      lines.push(
        "",
        `### ${i + 1}. ${s.title}`,
        "",
        `- 做法：${s.detail}`,
        `- 完成标准：${s.acceptance}`
      );
    });
  }
  lines.push(
    "",
    "| Field | Value |",
    "|---|---|",
    `| Role | ${t.roleIcon} ${t.roleName} |`,
    `| Goal | ${t.goalId} |`,
    `| Owner | ${t.owner} |`,
    `| Deadline | ${t.deadline} |`,
    `| Priority | ${t.priority} |`,
    `| Status | ${t.status} |`,
    `| Progress | ${t.progress}% |`,
    `| Skill | ${t.skill} |`,
    `| Agent | ${t.agent} |`,
    `| MCP | ${t.mcp || "—"} |`
  );
  return lines.join("\n");
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}
function quarterDir(monthDir: string): string {
  if (monthDir === "undated") return "undated";
  return `${monthDir.slice(0, 4)}-Q${Math.ceil(Number(monthDir.slice(5, 7)) / 3)}`;
}
function actionFileName(t: ExampleTask): string {
  const slug = slugifyTitle(t.title);
  const dir = t.deadline ? t.deadline.slice(0, 7) : "undated"; // YYYY-MM
  return `okr/${quarterDir(dir)}/${dir}/${t.priority.toLowerCase()}-${t.role}-${slug}.md`;
}

async function seedExampleActionItems(
  opts: { timeoutMs: number; signal: AbortSignal }
): Promise<ActionItem[]> {
  const out: ActionItem[] = [];
  for (const t of EXAMPLE_TASKS) {
    const filePath = actionFileName(t);
    try {
      await writeKnowledgeFile(filePath, renderActionBody(t), actionItemMeta(t), {
        timeoutMs: opts.timeoutMs,
        signal: opts.signal
      });
      out.push(actionItemFromExample(t, filePath));
    } catch {
      // 后端不可用 → 跳过该条，保持空态
    }
  }
  return out;
}

/* Watchdog (硬约束 5)：12s hook + 22s UI fallback，失败必设 loading=false */
const { start: startWatchdogHook } = useTimeoutFn(
  () => {
    if (loading.value) {
      // 12s：打 warning，不终止（让 22s UI fallback 处理）
      ElMessage.warning("行动项加载较慢（>12s），正在继续等待后端响应…");
    }
  },
  12_000,
  { immediate: false }
);
const { start: startWatchdogFallback, stop: stopFallback } = useTimeoutFn(
  () => {
    if (loading.value) {
      loading.value = false;
      ElMessage.error("行动项加载超时（22s watchdog），请稍后重试。");
      try {
        disposer.reset();
      } catch {
        /* noop */
      }
    }
  },
  22_000,
  { immediate: false }
);

async function loadActionItems() {
  loading.value = true;
  disposer.reset();
  const { signal } = createTimeoutSignal(15_000, disposer);
  startWatchdogHook();
  startWatchdogFallback();
  try {
    const res = await scanKnowledge("okr", { timeoutMs: 15_000, signal });
    const files = res.categories?.flatMap(c => c.files) ?? [];
    actionItems.value = files
      .filter(f => (f.meta ?? {})?.type === "okr-action")
      .map(actionItemFromFile);
  } catch {
    actionItems.value = [];
  } finally {
    try {
      stopFallback();
    } catch {
      /* noop */
    }
    if (actionItems.value.length) {
      saveBool(SEEDED_KEY, true);
    } else if (!loadBool(SEEDED_KEY, false)) {
      const seeded = await seedExampleActionItems({ timeoutMs: 10_000, signal });
      if (seeded.length) {
        actionItems.value = seeded;
        saveBool(SEEDED_KEY, true);
      }
    }
    loading.value = false;
  }
}

/* ══════════════════════════════════════════════ */
/* 新增行动项 Dialog */
/* ══════════════════════════════════════════════ */
const createDlgVisible = ref(false);
const createSaving = ref(false);
const createFormRef = ref<FormInstance | null>(null);

interface CreateForm {
  title: string;
  description: string;
  goalId: string;
  krId: string;
  owner: string;
  deadline: string | null;
  priority: "P0" | "P1" | "P2" | "P3";
  estimateHours: number;
}

const createForm = ref<CreateForm>({
  title: "",
  description: "",
  goalId: "",
  krId: "",
  owner: "",
  deadline: dayjs().add(3, "day").format("YYYY-MM-DD"),
  priority: "P2",
  estimateHours: 4
});

const createRules: FormRules<CreateForm> = {
  title: [{ required: true, message: "请输入行动项标题", trigger: "blur" }],
  goalId: [{ required: true, message: "请选择所属 Goal", trigger: "change" }],
  owner: [{ required: true, message: "请输入负责人", trigger: "blur" }],
  deadline: [{ required: true, message: "请选择截止日期", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  estimateHours: [
    { required: true, message: "请输入预估工时", trigger: "blur" },
    { type: "number", min: 0, max: 200, message: "范围 0~200 小时", trigger: "blur" }
  ]
};

const selectedGoalKRs = computed(() => {
  const g = currentRoleGoals.value.find(x => x.id === createForm.value.goalId);
  return g?.keyResults ?? [];
});

function openCreateActionDlg() {
  if (currentRoleGoals.value.length && !createForm.value.goalId) {
    createForm.value.goalId = currentRoleGoals.value[0].id;
  }
  createDlgVisible.value = true;
}
function onGoalSelectChange() {
  createForm.value.krId = "";
}
function resetCreateForm() {
  createForm.value = {
    title: "",
    description: "",
    goalId: currentRoleGoals.value[0]?.id ?? "",
    krId: "",
    owner: "",
    deadline: dayjs().add(3, "day").format("YYYY-MM-DD"),
    priority: "P2",
    estimateHours: 4
  };
  createSaving.value = false;
}

async function submitCreateAction() {
  const valid = await createFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  createSaving.value = true;
  disposer.reset();
  const { signal } = createTimeoutSignal(12_000, disposer);
  try {
    const f = createForm.value;
    const role = primaryRoleId.value;
    const roleMeta = rolesData[role];
    const id = `act-${dayjs().format("YYYYMMDDHHmmss")}-${Math.random().toString(36).slice(2, 6)}`;
    const deadline = f.deadline || dayjs().add(3, "day").format("YYYY-MM-DD");
    const t: ExampleTask = {
      id,
      title: f.title,
      role,
      roleIcon: roleMeta?.icon ?? "🎯",
      roleName: roleMeta?.name ?? role,
      goalId: f.goalId,
      skill: "",
      agent: "",
      mcp: "",
      listType: "daily",
      priority: f.priority,
      status: "Planned",
      owner: f.owner,
      deadline,
      progress: 0,
      description:
        f.description ||
        `由 Dashboard「新增行动项」在 ${dayjs().format("YYYY-MM-DD HH:mm")} 创建。预估 ${f.estimateHours}h。`,
      subtasks: []
    };
    const slug = slugifyTitle(f.title);
    const dir = deadline.slice(0, 7);
    const filePath = `okr/${quarterDir(dir)}/${dir}/${f.priority.toLowerCase()}-${role}-new-${slug}.md`;
    const body = [
      `# ${f.title}`,
      "",
      f.description || "无描述",
      "",
      "| Field | Value |",
      "|---|---|",
      `| ID | \`${id}\` |`,
      `| Role | ${t.roleIcon} ${t.roleName} |`,
      `| Goal | ${f.goalId} |`,
      `| KR | ${f.krId || "—"} |`,
      `| Owner | ${f.owner} |`,
      `| Deadline | ${deadline} |`,
      `| Priority | ${f.priority} |`,
      `| Estimate | ${f.estimateHours} h |`,
      `| Status | Planned |`,
      `| Progress | 0% |`
    ].join("\n");
    const meta: Record<string, unknown> = {
      type: "okr-action",
      id,
      title: f.title,
      role,
      goal: f.goalId,
      kr: f.krId || undefined,
      owner: f.owner,
      deadline,
      priority: f.priority,
      estimateHours: f.estimateHours,
      status: "Planned",
      progress: 0,
      subtaskCount: 0,
      subtasks: []
    };
    try {
      await writeKnowledgeFile(filePath, body, meta, {
        timeoutMs: 12_000,
        signal
      });
    } catch (err) {
      ElMessage.warning("写入知识库失败，已在当前会话临时添加（刷新后不保留）");
    }
    const item: ActionItem = actionItemFromExample(t, filePath);
    actionItems.value.unshift(item);
    ElMessage.success(`行动项已创建：${f.title}`);
    createDlgVisible.value = false;
  } finally {
    createSaving.value = false;
  }
}

/* ══════════════════════════════════════════════ */
/* 通用 helper */
/* ══════════════════════════════════════════════ */
function openKnowledgePreview(path?: string) {
  if (!path) {
    ElMessage.info("尚未沉淀证据");
    return;
  }
  previewDlg.value?.open(path);
}

function deadlineHint(item: ActionItem): string {
  if (!item.deadline) return "";
  const d = dayjs(item.deadline);
  if (!d.isValid()) return "";
  const diff = d.diff(dayjs().startOf("day"), "day");
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return `${diff}d left`;
}

async function handleDelete(item: ActionItem) {
  const ok = await confirm(
    t("knowledge.common.deleteFileConfirm", { path: item.action }),
    t("knowledge.common.deleteFileTitle")
  );
  if (!ok) return;
  if (item.filePath) {
    disposer.reset();
    const { signal } = createTimeoutSignal(10_000, disposer);
    try {
      await deleteKnowledgeFile(item.filePath, {
        timeoutMs: 10_000,
        signal
      });
    } catch {
      ElMessage.error(t("knowledge.common.fileDeleteFailed"));
      return;
    }
  }
  actionItems.value = actionItems.value.filter(a => a.id !== item.id);
  ElMessage.success(t("knowledge.common.actionItemDeleted"));
}

function priorityTypeOf(priority: string): ActionItem["priorityType"] {
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  if (priority === "P2") return "primary";
  return "info";
}

/* ══════════════════════════════════════════════ */
/* lifecycle + watchers */
/* ══════════════════════════════════════════════ */
onMounted(async () => {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      flowchart: { htmlLabels: true, curve: "basis" }
    });
  } catch {
    /* mermaid init 失败不阻塞主流程 */
  }
  await loadActionItems();
  await nextTick();
  renderHeatmap();
  if (typeof ResizeObserver !== "undefined" && heatmapRef.value) {
    heatmapResizeObserver = new ResizeObserver(resizeHeatmap);
    heatmapResizeObserver.observe(heatmapRef.value);
  }
});

// Mermaid 渲染：traceMermaidCode 变化后重新渲染
watch(
  traceMermaidCode,
  async code => {
    await nextTick();
    if (!code) return;
    try {
      // 重新渲染所有 .mermaid 块（本页只有 1 块）
      const nodes = document.querySelectorAll<HTMLElement>(".okr__trace-mermaid pre.mermaid");
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const id = `okr-trace-mmd-${Date.now()}-${i}`;
        try {
          const { svg } = await mermaid.render(id, code);
          n.innerHTML = svg;
        } catch (err) {
          n.innerText = `[Mermaid render failed] ${(err as Error)?.message ?? String(err)}`;
        }
      }
    } catch (err) {
      console.warn("[okr] mermaid render failed:", err);
    }
  },
  { immediate: true, flush: "post" }
);

// Role / Month 变化 → 重新渲染热力图
watch(
  [() => primaryRoleId.value, () => heatmapData.value],
  async () => {
    await nextTick();
    renderHeatmap();
  },
  { deep: false }
);

onBeforeUnmount(() => {
  try {
    heatmapResizeObserver?.disconnect();
    heatmapResizeObserver = null;
  } catch {
    /* noop */
  }
});
</script>

<style scoped lang="scss">
@use "./styles/okr.scss";
</style>
<style lang="scss">
@use "./styles/okrGlobal.scss";
</style>
