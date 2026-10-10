<template>
  <div class="process">
    <!-- ═══ Sticky Stats Bar ═══ -->
    <div class="process__sticky-bar">
      <div class="process__sticky-top">
        <div class="process__sticky-left">
          <span class="process__sticky-icon">{{ stickyIcon }}</span>
          <div class="process__sticky-info">
            <h1 class="process__sticky-name">{{ stickyTitle }}</h1>
            <p class="process__sticky-desc">需求评审 · 技术评审 · 构建调试 · 测试报告 · 上线 — AI 从需求到上线全流程自闭环记录</p>
          </div>
        </div>
        <div class="process__sticky-right">
          <div class="process__stat-pill">
            <span class="process__stat-pill-value">{{ stats.totalLoops }}</span>
            <span class="process__stat-pill-label">Loops</span>
          </div>
          <div class="process__stat-pill">
            <span class="process__stat-pill-value">{{ stats.completed }}</span>
            <span class="process__stat-pill-label">Completed</span>
          </div>
          <div class="process__stat-pill process__stat-pill--accent">
            <span class="process__stat-pill-value">{{ stats.totalRecords }}</span>
            <span class="process__stat-pill-label">Records</span>
          </div>
        </div>
      </div>
    </div>

    <div class="process__body">
      <nav class="process__sidebar">
        <button class="process__sidebar-item" :class="{ 'is-active': statusTab === 'all' }" @click="statusTab = 'all'">
          <span class="process__sidebar-icon">🔁</span>
          <span class="process__sidebar-label">全部闭环</span>
          <span class="process__sidebar-badge">{{ stats.totalLoops }}</span>
        </button>
        <button
          class="process__sidebar-item"
          :class="{ 'is-active': statusTab === 'completed' }"
          @click="statusTab = 'completed'"
        >
          <span class="process__sidebar-icon">✅</span>
          <span class="process__sidebar-label">已完成</span>
          <span class="process__sidebar-badge">{{ stats.completed }}</span>
        </button>
        <button
          class="process__sidebar-item"
          :class="{ 'is-active': statusTab === 'in-progress' }"
          @click="statusTab = 'in-progress'"
        >
          <span class="process__sidebar-icon">⚡</span>
          <span class="process__sidebar-label">进行中</span>
          <span class="process__sidebar-badge">{{ stats.inProgress }}</span>
        </button>
        <button
          class="process__sidebar-item"
          :class="{ 'is-active': statusTab === 'not-started' }"
          @click="statusTab = 'not-started'"
        >
          <span class="process__sidebar-icon">📋</span>
          <span class="process__sidebar-label">未开始</span>
          <span class="process__sidebar-badge">{{ stats.notStarted }}</span>
        </button>
      </nav>

      <div class="process__content">
        <div class="process__section">
          <div class="process__section-head">
            <h2 class="process__section-title">🔁 Process Records</h2>
            <span class="process__result-count">{{ filteredLoopGroups.length }} loops · {{ filteredRecordCount }} records</span>
            <span class="process__toolbar-right">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button value="card">Card</el-radio-button>
                <el-radio-button value="list">List</el-radio-button>
                <el-radio-button value="table">Table</el-radio-button>
              </el-radio-group>
              <el-button size="small" @click="onExportCSV" :disabled="!filteredLoopGroups.length">
                <el-icon><Download /></el-icon> CSV
              </el-button>
              <el-button size="small" :icon="Refresh" :loading="loading" @click="loadLoopRecords">Refresh</el-button>
            </span>
          </div>

          <!-- ═══ SRE 指标 KPI 卡行 ═══ -->
          <div class="process__sre-row" v-if="sreMetrics.ready">
            <article class="process__sre-card">
              <div class="process__sre-card__label">平均 Loop 时长</div>
              <div class="process__sre-card__value">{{ sreMetrics.avgLoopDuration }}</div>
              <ECharts :option="sreMetrics.avgLoopTrend" width="auto" height="40" />
            </article>
            <article
              v-for="stage in STAGE_KEYS"
              :key="'med-' + stage"
              class="process__sre-card"
            >
              <div class="process__sre-card__label">{{ stageLabel(stage) }} P50</div>
              <div class="process__sre-card__value">
                {{ sreMetrics.stageMedians?.[stage] ?? "—" }}
              </div>
              <ECharts :option="sreMetrics.stageTrend(stage)" width="auto" height="40" />
            </article>
            <article class="process__sre-card process__sre-card--danger">
              <div class="process__sre-card__label">失败率</div>
              <div class="process__sre-card__value">{{ sreMetrics.failureRatePct }}%</div>
              <ECharts :option="sreMetrics.failureTrend" width="auto" height="40" />
            </article>
            <article class="process__sre-card process__sre-card--success">
              <div class="process__sre-card__label">闭环成功率</div>
              <div class="process__sre-card__value">{{ sreMetrics.successRatePct }}%</div>
              <ECharts :option="sreMetrics.successTrend" width="auto" height="40" />
            </article>
            <article class="process__sre-card">
              <div class="process__sre-card__label">平均返工次数</div>
              <div class="process__sre-card__value">{{ sreMetrics.avgReworks }}</div>
              <ECharts :option="sreMetrics.reworkTrend" width="auto" height="40" />
            </article>
          </div>

          <!-- ═══ Enhanced Filter bar ═══ -->
          <div class="process__filter-bar">
            <div v-if="filterLoopId" class="process__filter-banner">
              <span>Filtered: <strong>{{ filterLoopId }}</strong></span>
              <el-button size="small" text @click="clearLoopFilter">Clear</el-button>
            </div>
            <div v-if="filterGoalId" class="process__filter-banner">
              <span>Filtered goal: <strong>{{ filterGoalId }}</strong></span>
              <el-button size="small" text @click="clearGoalFilter">Clear</el-button>
            </div>
            <el-select
              v-model="filterRoles"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="👔 Role (multi)"
              size="small"
              class="process__filter"
              clearable
            >
              <el-option
                v-for="r in availableRoles"
                :key="r"
                :label="r"
                :value="r"
              />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              size="small"
              range-separator="~"
              start-placeholder="Created ≥"
              end-placeholder="Updated ≤"
              value-format="YYYY-MM-DD"
              class="process__filter process__filter--date"
              clearable
            />
            <el-select
              v-model="missingStage"
              placeholder="🔍 缺阶段筛选"
              size="small"
              class="process__filter"
              clearable
            >
              <el-option value="" label="— 无筛选 —" />
              <el-option
                v-for="stage in STAGE_KEYS"
                :key="'ms-' + stage"
                :label="`缺失: ${stageLabel(stage)}`"
                :value="stage"
              />
            </el-select>
          </div>

          <div class="process__section-body">
            <!-- ═══ Empty ═══ -->
            <div v-if="!loading && !filteredLoopGroups.length" class="process__empty">
              <span class="process__empty-icon">🔁</span>
              <p class="process__empty-title">No process records yet</p>
              <p class="process__empty-hint">
                Loop records are generated when AI completes a full lifecycle — from requirement review through launch.
                Check the OKR Dashboard for active tasks that may produce loop records.
              </p>
            </div>

            <!-- ═══ Card View ═══ -->
            <div v-else-if="viewMode === 'card'" class="process__grid">
              <el-card
                v-for="group in filteredLoopGroups"
                :key="group.loopId"
                class="process__card"
                :class="[
                  { 'is-highlighted': group.loopId === filterLoopId },
                  { 'is-clickable': hasLoopGroupFile(group) }
                ]"
                shadow="hover"
                @click="openLoopGroupCard(group)"
              >
                <template #header>
                  <div class="process__card-head">
                    <span class="process__card-loop" :title="group.loopId">{{ group.title }}</span>
                    <div class="process__card-head-actions" @click.stop>
                      <el-tooltip content="查看时间轴" placement="top" :show-after="300">
                        <el-button
                          size="small"
                          text
                          type="primary"
                          @click="toggleTimeline(group.loopId)"
                        >
                          <el-icon><Clock /></el-icon>
                          {{ expandedTimelines.has(group.loopId) ? '收起' : '时间轴' }}
                        </el-button>
                      </el-tooltip>
                      <el-tooltip content="Mermaid 流程图" placement="top" :show-after="300">
                        <el-button
                          size="small"
                          text
                          type="success"
                          @click="openMermaidDialog(group)"
                        >
                          <el-icon><Connection /></el-icon> Flow
                        </el-button>
                      </el-tooltip>
                    </div>
                    <el-tag size="small" :type="groupStatusType(group)">{{ groupStatusText(group) }}</el-tag>
                  </div>
                </template>

                <div class="process__card-summary" v-if="group.summary">
                  <span class="process__card-summary-title">{{ group.summary.title }}</span>
                </div>

                <el-progress
                  :percentage="groupProgress(group)"
                  :status="groupProgress(group) >= 100 ? 'success' : undefined"
                  :stroke-width="6"
                />

                <div class="process__stage-list">
                  <div
                    v-for="stageKey in STAGE_KEYS"
                    :key="stageKey"
                    class="process__stage"
                    :class="{ 'is-filled': !!group.stageMap?.[stageKey], 'is-missing': !group.stageMap?.[stageKey] }"
                    @click.stop="group.stageMap?.[stageKey]?.path && openRecord(group.stageMap[stageKey]!.path)"
                  >
                    <template v-if="group.stageMap?.[stageKey]">
                      <span class="process__stage-icon">{{ stageIcon(stageKey) }}</span>
                      <span class="process__stage-label">{{ stageLabel(stageKey) }}</span>
                      <span class="process__stage-title">
                        {{ group.stageMap?.[stageKey]?.title ?? "—" }}
                      </span>
                      <el-tag size="small" :type="statusType(group.stageMap?.[stageKey]?.status ?? '')">
                        {{ group.stageMap?.[stageKey]?.status ?? "—" }}
                      </el-tag>
                    </template>
                    <template v-else>
                      <span class="process__stage-icon">·</span>
                      <span class="process__stage-label process__stage-label--muted">{{ stageLabel(stageKey) }}</span>
                      <span class="process__stage-title process__stage-title--muted">—</span>
                    </template>
                  </div>
                </div>

                <!-- Event Timeline 展开区域 -->
                <div v-if="expandedTimelines.has(group.loopId)" class="process__timeline">
                  <div class="process__timeline-title">
                    <el-icon><Clock /></el-icon> Event Timeline · {{ group.records?.length ?? 0 }} 条记录
                  </div>
                  <el-timeline v-if="group.records?.length" class="process__timeline-list">
                    <el-timeline-item
                      v-for="(rec, idx) in sortRecords(group.records ?? [])"
                      :key="rec.path || idx"
                      :timestamp="formatDateTime(rec.updated)"
                      :type="statusTimelineType(rec.status)"
                      :hollow="rec.status !== 'done'"
                    >
                      <div class="process__tl-item">
                        <el-tag size="small" effect="dark" :type="statusType(rec.status)">
                          {{ stageLabel(rec.stage) }}
                        </el-tag>
                        <span class="process__tl-title">{{ rec.title }}</span>
                        <span class="process__tl-meta">
                          <span v-if="rec.role">👔 {{ rec.role }}</span>
                          <span v-if="rec.goalId">🎯 {{ rec.goalId }}</span>
                        </span>
                        <el-button
                          v-if="rec.path"
                          size="small"
                          text
                          type="primary"
                          @click.stop="openRecord(rec.path)"
                        >查看原文</el-button>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                  <el-empty v-else description="暂无记录" :image-size="60" />
                </div>

                <div class="process__card-footer">
                  <span v-if="hasGoalRole(group.goalId)" class="process__goal-link" @click.stop="goGoal(group.goalId)">
                    🎯 {{ group.goalId }} →
                  </span>
                  <span v-if="group.updated" class="process__card-date"> Updated {{ formatRelativeTime(group.updated) }} </span>
                </div>
              </el-card>
            </div>

            <!-- ═══ List View ═══ -->
            <div v-else-if="viewMode === 'list'" class="process__list">
              <div v-for="group in filteredLoopGroups" :key="group.loopId" class="process__list-row">
                <div class="process__list-main">
                  <div class="process__list-top">
                    <span class="process__list-loop" :title="group.loopId">{{ group.title }}</span>
                    <el-tag size="small" :type="groupStatusType(group)">{{ groupStatusText(group) }}</el-tag>
                    <span v-if="group.summary" class="process__list-title">{{ group.summary?.title ?? "" }}</span>
                    <span class="process__list-actions" @click.stop>
                      <el-button size="small" text type="primary" @click="toggleTimeline(group.loopId)">
                        <el-icon><Clock /></el-icon> T
                      </el-button>
                      <el-button size="small" text type="success" @click="openMermaidDialog(group)">
                        <el-icon><Connection /></el-icon> F
                      </el-button>
                    </span>
                  </div>
                  <div class="process__list-mid">
                    <el-progress
                      :percentage="groupProgress(group)"
                      :status="groupProgress(group) >= 100 ? 'success' : undefined"
                      :stroke-width="5"
                      style="width: 100px"
                    />
                  </div>
                  <div class="process__list-stages">
                    <span
                      v-for="stageKey in STAGE_KEYS"
                      :key="stageKey"
                      class="process__list-stage"
                      :class="{
                        'is-filled': !!group.stageMap?.[stageKey],
                        'is-missing': !group.stageMap?.[stageKey]
                      }"
                      :title="
                        group.stageMap?.[stageKey]
                          ? stageLabel(stageKey) + ': ' + (group.stageMap[stageKey]!.title ?? '')
                          : stageLabel(stageKey) + ': —'
                      "
                      @click="group.stageMap?.[stageKey]?.path && openRecord(group.stageMap[stageKey]!.path)"
                    >
                      <span class="process__list-stage-icon">{{ stageIcon(stageKey) }}</span>
                      <span class="process__list-stage-label">{{ stageLabel(stageKey) }}</span>
                      <el-tag v-if="group.stageMap?.[stageKey]" size="small" :type="statusType(group.stageMap[stageKey]!.status)">
                        {{ group.stageMap[stageKey]!.status }}
                      </el-tag>
                      <span v-else class="process__list-stage-empty">—</span>
                    </span>
                  </div>
                  <div
                    v-if="expandedTimelines.has(group.loopId) && group.records?.length"
                    class="process__timeline process__timeline--inline"
                  >
                    <el-timeline>
                      <el-timeline-item
                        v-for="(rec, idx) in sortRecords(group.records ?? [])"
                        :key="rec.path || idx"
                        :timestamp="formatDateTime(rec.updated)"
                        :type="statusTimelineType(rec.status)"
                      >
                        <div class="process__tl-item">
                          <el-tag size="small" effect="dark" :type="statusType(rec.status)">
                            {{ stageLabel(rec.stage) }}
                          </el-tag>
                          <strong>{{ rec.title }}</strong>
                          <el-button v-if="rec.path" size="small" text type="primary" @click.stop="openRecord(rec.path)">
                            查看原文
                          </el-button>
                        </div>
                      </el-timeline-item>
                    </el-timeline>
                  </div>
                </div>
                <div class="process__list-meta">
                  <span v-if="hasGoalRole(group.goalId)" class="process__goal-link" @click="goGoal(group.goalId)"
                    >🎯 {{ group.goalId }}</span
                  >
                  <span v-if="group.updated" class="process__list-date">{{ formatRelativeTime(group.updated) }}</span>
                  <el-button
                    v-if="group.summary?.path"
                    size="small"
                    text
                    type="primary"
                    @click="openRecord(group.summary!.path)"
                    >Open</el-button
                  >
                </div>
              </div>
            </div>

            <!-- ═══ Table View ═══ -->
            <el-table
              v-else
              :data="filteredLoopGroups"
              v-loading="loading"
              stripe
              border
              style="width: 100%"
              row-key="loopId"
              :empty-text="'No process records yet'"
              highlight-current-row
            >
              <el-table-column label="Actions" width="140" fixed="left" align="center">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="toggleTimeline((row as LoopGroup).loopId)">
                    <el-icon><Clock /></el-icon> TL
                  </el-button>
                  <el-button size="small" text type="success" @click="openMermaidDialog(row as LoopGroup)">
                    <el-icon><Connection /></el-icon> F
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column prop="loopId" label="Loop" width="130" sortable>
                <template #default="{ row }">
                  <span
                    class="process__table-loop"
                    :class="{ 'is-clickable': !!(row as LoopGroup).summary?.path }"
                    :title="(row as LoopGroup).loopId"
                    @click="(row as LoopGroup).summary?.path && openRecord((row as LoopGroup).summary!.path)"
                    >{{ (row as LoopGroup).title }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column label="Title / Goal" min-width="260" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="process__table-title-cell">
                    <span class="process__table-title">
                      {{ (row as LoopGroup).summary?.title || (row as LoopGroup).title }}
                    </span>
                    <span
                      v-if="hasGoalRole((row as LoopGroup).goalId)"
                      class="process__table-goal process__goal-link"
                      @click="goGoal((row as LoopGroup).goalId)"
                      >🎯 {{ (row as LoopGroup).goalId }}</span
                    >
                    <span v-else-if="(row as LoopGroup).goalId" class="process__table-goal">
                      {{ (row as LoopGroup).goalId }}
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Roles" width="160">
                <template #default="{ row }">
                  <div class="process__table-roles">
                    <el-tag
                      v-for="r in (row as LoopGroup).roles?.slice(0, 3) ?? []"
                      :key="r"
                      size="small"
                      type="info"
                      effect="light"
                    >
                      {{ r }}
                    </el-tag>
                    <span
                      v-if="((row as LoopGroup).roles?.length ?? 0) > 3"
                      class="process__text-muted"
                    >
                      +{{ ((row as LoopGroup).roles?.length ?? 0) - 3 }}
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Status" width="110" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :type="groupStatusType(row as LoopGroup)">
                    {{ groupStatusText(row as LoopGroup) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Stages" min-width="360">
                <template #default="{ row }">
                  <div class="process__table-stages">
                    <span
                      v-for="stageKey in STAGE_KEYS"
                      :key="stageKey"
                      class="process__table-stage"
                      :class="{
                        'is-filled': !!(row as LoopGroup).stageMap?.[stageKey],
                        'is-missing': !(row as LoopGroup).stageMap?.[stageKey]
                      }"
                      :title="
                        (row as LoopGroup).stageMap?.[stageKey]
                          ? stageLabel(stageKey) + ': ' + ((row as LoopGroup).stageMap[stageKey]!.title ?? '')
                          : stageLabel(stageKey) + ': —'
                      "
                      @click="
                        (row as LoopGroup).stageMap?.[stageKey]?.path &&
                          openRecord((row as LoopGroup).stageMap[stageKey]!.path)
                      "
                    >
                      <span class="process__table-stage-icon">{{ stageIcon(stageKey) }}</span>
                      <span class="process__table-stage-label">{{ stageLabel(stageKey) }}</span>
                      <el-tag
                        v-if="(row as LoopGroup).stageMap?.[stageKey]"
                        size="small"
                        :type="statusType((row as LoopGroup).stageMap[stageKey]!.status)"
                      >
                        {{ (row as LoopGroup).stageMap[stageKey]!.status }}
                      </el-tag>
                      <span v-else class="process__table-stage-empty">—</span>
                    </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                label="Progress"
                width="150"
                sortable
                :sort-method="(a: any, b: any) => groupProgress(a) - groupProgress(b)"
              >
                <template #default="{ row }">
                  <div class="process__progress-cell">
                    <el-progress
                      :percentage="groupProgress(row as LoopGroup)"
                      :status="groupProgress(row as LoopGroup) >= 100 ? 'success' : undefined"
                      :stroke-width="6"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Updated" width="120" sortable>
                <template #default="{ row }">
                  <el-tooltip
                    v-if="(row as LoopGroup).updated"
                    :content="formatDate((row as LoopGroup).updated)"
                    placement="top"
                    :show-after="400"
                  >
                    <span class="process__date">{{ formatRelativeTime((row as LoopGroup).updated) }}</span>
                  </el-tooltip>
                  <span v-else class="process__text-muted">—</span>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="80" fixed="right" align="center">
                <template #default="{ row }">
                  <el-popconfirm
                    title="Delete this loop and all its records?"
                    confirm-button-text="Delete"
                    cancel-button-text="Cancel"
                    @confirm="deleteLoop(row as LoopGroup)"
                  >
                    <template #reference>
                      <el-button size="small" text type="danger">Del</el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Mermaid Flow Dialog ═══ -->
    <el-dialog
      v-model="mermaidDialog.visible"
      :title="`Mermaid · ${mermaidDialog.loop?.title ?? ''}`"
      width="820px"
      destroy-on-close
    >
      <div class="process__mermaid-wrap">
        <pre class="mermaid" v-html="mermaidDialog.svgHTML" />
        <div class="process__mermaid-source" v-if="mermaidDialog.source">
          <el-collapse>
            <el-collapse-item title="查看 Mermaid 源码" name="source">
              <pre><code>{{ mermaidDialog.source }}</code></pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-dialog>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="processRecord">
import { Clock, Connection, Download, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTag, type FormRules } from "element-plus";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  watch,
  nextTick
} from "vue";
import { useRoute, useRouter } from "vue-router";
import mermaid from "mermaid";

import ECharts from "@/components/ECharts/index.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import { scanKnowledge, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import { goalRoleMap } from "@/views/knowledge/executive/okrData";
import { exportCSV } from "@/utils/export/csv";
import { DisposerBag } from "@/utils/disposer";
import {
  gateBEntityExists,
  gateCPostNavigate,
  resolveLink,
  type ResolveLinkInput
} from "@/utils/linkFactory";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";

/* ───────────────────────────────────────────
 *  0. 生命周期与资源托管（硬约束：DisposerBag）
 * ─────────────────────────────────────────── */
const bag = new DisposerBag();
onBeforeUnmount(() => {
  bag.dispose();
});

/* 初始化 mermaid（组件级唯一，带主题） */
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    flowchart: { curve: "basis", htmlLabels: true, useMaxWidth: true }
  });
} catch {
  /* ignore — mermaid 版本差异 */
}

/* ───────────────────────────────────────────
 *  1. 基础响应式状态
 * ─────────────────────────────────────────── */
const previewDlg = shallowRef<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const loading = ref(false);
const viewMode = ref<"card" | "list" | "table">("card");
const statusTab = ref<"all" | "completed" | "in-progress" | "not-started">("all");
const route = useRoute();
const router = useRouter();

const filterRoles = ref<string[]>([]);
const dateRange = ref<string[] | null>(null);
const missingStage = ref<string>("");

/** Loop 级时间轴展开集合 */
const expandedTimelines = reactive<Set<string>>(new Set());
function toggleTimeline(loopId: string) {
  if (expandedTimelines.has(loopId)) {
    expandedTimelines.delete(loopId);
  } else {
    expandedTimelines.add(loopId);
  }
}

const stickyIcon = "🔁";
const stickyTitle = "Process Records";

/* ───────────────────────────────────────────
 *  2. STAGES + 数据结构
 * ─────────────────────────────────────────── */
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

const STAGE_KEYS = STAGES.map((s) => s.key);
const STAGE_ORDER: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

interface LoopRecord {
  path: string;
  loopId: string;
  stage: string;
  title: string;
  role: string;
  goalId: string;
  status: string;
  updated?: string;
  created?: string;
}

interface LoopSummary {
  path: string;
  loopId: string;
  title: string;
  status: string;
  roles: string[];
}

interface LoopGroup {
  loopId: string;
  title: string;
  records: LoopRecord[];
  summary: LoopSummary | null;
  roles: string[];
  stageMap: Record<string, LoopRecord>;
  updated?: string;
  created?: string;
  goalId?: string;
}

const loopGroups = ref<LoopGroup[]>([]);

/* ───────────────────────────────────────────
 *  3. Query 参数过滤
 * ─────────────────────────────────────────── */
const filterLoopId = computed(() => {
  const q = route.query.loop;
  return typeof q === "string" ? q : "";
});
const filterGoalId = computed(() => {
  const q = route.query.goal;
  return typeof q === "string" ? q : "";
});

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function recordFromFile(f: KnowledgeFileEntry): LoopRecord | null {
  const m = f.meta ?? {};
  if (m.type !== "loop-record") return null;
  return {
    path: f.path,
    loopId: str(m.loopId) || f.path.split("/").find((seg) => /^loop-/.test(seg)) || "loop",
    stage: str(m.stage),
    title: str(m.title) || f.name.replace(/\.md$/, ""),
    role: str(m.role),
    goalId: str(m.goalId),
    status: str(m.status) || "in-progress",
    updated: str(m.updated),
    created: str(m.created)
  };
}

function summaryFromFile(f: KnowledgeFileEntry): LoopSummary | null {
  const m = f.meta ?? {};
  if (m.type !== "loop-summary") return null;
  return {
    path: f.path,
    loopId: str(m.loopId),
    title: str(m.title),
    status: str(m.status) || "in-progress",
    roles: Array.isArray(m.roles) ? m.roles.filter((r: unknown) => typeof r === "string") : []
  };
}

/* ───────────────────────────────────────────
 *  4. loadLoopRecords + 12s Hook Watchdog + 22s UI Fallback
 * ─────────────────────────────────────────── */
async function loadLoopRecords() {
  loading.value = true;
  const bagLocal = new DisposerBag();
  const abortCtrl = new AbortController();
  bagLocal.addAbort(abortCtrl);

  /* 12s Hook Watchdog — 内部超时 */
  let hookTimedOut = false;
  const watchDogTimer = window.setTimeout(() => {
    hookTimedOut = true;
    try {
      abortCtrl.abort(new DOMException("Hook watchdog: 12s timeout", "AbortError"));
    } catch {
      /* noop */
    }
  }, 12_000);
  bagLocal.addTimer(watchDogTimer);

  /* 22s UI Fallback — 无论 hook 还是网络，都保证 loading 终止 */
  const fallbackTimer = window.setTimeout(() => {
    loading.value = false;
    ElMessage.warning("Process records 加载超时 (22s)，已回退到空结果");
  }, 22_000);
  bagLocal.addTimer(fallbackTimer);

  try {
    // @ts-ignore: AbortSignal.any 在较新浏览器可用
    const signal: AbortSignal = (AbortSignal as any).any
      ? (AbortSignal as any).any([abortCtrl.signal])
      : abortCtrl.signal;

    const res = await scanKnowledge("okr", { timeoutMs: 12_000, signal });
    if (hookTimedOut) {
      /* 已被 watchdog 触发的，不再继续更新 UI 状态 */
      return;
    }
    const files = res?.categories?.flatMap((c) => c.files) ?? [];

    const summaries = files.map(summaryFromFile).filter((s): s is LoopSummary => s !== null);
    const summaryByLoop = new Map<string, LoopSummary>();
    for (const s of summaries) summaryByLoop.set(s.loopId, s);

    const records = files
      .map(recordFromFile)
      .filter((r): r is LoopRecord => r !== null && r.stage in STAGE_ORDER);

    const byLoop = new Map<string, LoopRecord[]>();
    for (const r of records) {
      if (!byLoop.has(r.loopId)) byLoop.set(r.loopId, []);
      byLoop.get(r.loopId)!.push(r);
    }

    const allLoopIds = new Set([...byLoop.keys(), ...summaryByLoop.keys()]);

    loopGroups.value = [...allLoopIds]
      .map((loopId) => {
        const recs = (byLoop.get(loopId) || []).sort((a, b) => {
          const oa = STAGE_ORDER[a.stage] ?? 99;
          const ob = STAGE_ORDER[b.stage] ?? 99;
          if (oa !== ob) return oa - ob;
          return (a.created || a.updated || "").localeCompare(b.created || b.updated || "");
        });
        const summary = summaryByLoop.get(loopId) || null;
        const stageMap: Record<string, LoopRecord> = {};
        for (const r of recs) {
          // 同一 stage 多条记录 → 取最新的做 stageMap
          const existing = stageMap[r.stage];
          if (!existing || (r.updated || "") > (existing.updated || "")) {
            stageMap[r.stage] = r;
          }
        }

        const roleSet = new Set<string>();
        for (const r of recs) if (r.role) roleSet.add(r.role);
        if (summary) for (const r of summary.roles) roleSet.add(r);

        const latestUpdated = recs
          .map((r) => r.updated)
          .filter(Boolean)
          .sort()
          .reverse()[0];
        const earliestCreated = recs
          .map((r) => r.created || r.updated)
          .filter(Boolean)
          .sort()[0];

        const goalId =
          recs.find((r) => r.goalId)?.goalId ||
          summary?.path?.split("/").find((seg) => seg.startsWith("goal-")) ||
          undefined;

        const dirSlug = recs[0]?.path.split("/").find((seg) => /^loop-/.test(seg)) ?? loopId;
        const slug = dirSlug.replace(/^loop-\d+-/, "").replace(/-/g, " ");
        const title = slug.charAt(0).toUpperCase() + slug.slice(1);

        return {
          loopId,
          title,
          records: recs,
          summary,
          roles: [...roleSet],
          stageMap,
          updated: latestUpdated,
          created: earliestCreated,
          goalId
        };
      })
      .sort((a, b) => {
        // 按 updated 倒序，没日期放后面
        const au = a.updated || a.created || "";
        const bu = b.updated || b.created || "";
        const cmp = bu.localeCompare(au);
        return cmp !== 0 ? cmp : a.loopId.localeCompare(b.loopId);
      });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    if (msg.includes("AbortError") || hookTimedOut) {
      ElMessage.warning("Process records 加载被 12s Watchdog 截断，已显示已有缓存数据");
    } else {
      loopGroups.value = [];
    }
  } finally {
    window.clearTimeout(fallbackTimer);
    bagLocal.reset();
    loading.value = false;
  }
}

/* ───────────────────────────────────────────
 *  5. 过滤计算：statusTab + role + date + missingStage + query
 * ─────────────────────────────────────────── */
const availableRoles = computed<string[]>(() => {
  const s = new Set<string>();
  for (const g of loopGroups.value) for (const r of g.roles ?? []) s.add(r);
  for (const g of loopGroups.value)
    for (const rec of g.records ?? []) if (rec.role) s.add(rec.role);
  return [...s].sort();
});

const filteredLoopGroups = computed<LoopGroup[]>(() => {
  let groups = loopGroups.value;
  if (filterLoopId.value) groups = groups.filter((g) => g.loopId === filterLoopId.value);
  if (filterGoalId.value) groups = groups.filter((g) => g.goalId === filterGoalId.value);

  if (statusTab.value === "completed") {
    groups = groups.filter((g) => {
      return (
        (g.records ?? []).length === STAGE_KEYS.length &&
        (g.records ?? []).every((r) => r.status === "done")
      );
    });
  } else if (statusTab.value === "in-progress") {
    groups = groups.filter((g) => {
      const done = (g.records ?? []).filter((r) => r.status === "done").length;
      return done > 0 && !(done === (g.records ?? []).length && (g.records ?? []).length === STAGE_KEYS.length);
    });
  } else if (statusTab.value === "not-started") {
    groups = groups.filter((g) => (g.records ?? []).every((r) => r.status !== "done"));
  }

  if (filterRoles.value?.length) {
    groups = groups.filter((g) => {
      const roleSet = new Set<string>(g.roles ?? []);
      for (const r of g.records ?? []) if (r.role) roleSet.add(r.role);
      return filterRoles.value.some((r) => roleSet.has(r));
    });
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [from, to] = dateRange.value;
    const fromT = new Date(from + "T00:00:00").getTime();
    const toT = new Date(to + "T23:59:59").getTime();
    groups = groups.filter((g) => {
      const ct = g.created ? new Date(g.created).getTime() : NaN;
      const ut = g.updated ? new Date(g.updated).getTime() : NaN;
      if (Number.isFinite(ct) && ct >= fromT && ct <= toT) return true;
      if (Number.isFinite(ut) && ut >= fromT && ut <= toT) return true;
      return false;
    });
  }

  if (missingStage.value) {
    groups = groups.filter((g) => !g.stageMap?.[missingStage.value]);
  }

  return groups;
});

const filteredRecordCount = computed(
  () => filteredLoopGroups.value.reduce((n, g) => n + (g.records?.length ?? 0), 0)
);

/* ───────────────────────────────────────────
 *  6. 基础 stats
 * ─────────────────────────────────────────── */
const stats = computed(() => {
  const groups = loopGroups.value;
  const totalRecords = groups.reduce((n, g) => n + (g.records?.length ?? 0), 0);
  const completed = groups.filter((g) => {
    const stages = g.records ?? [];
    return stages.length === STAGE_KEYS.length && stages.every((r) => r.status === "done");
  }).length;
  const inProgress = groups.filter((g) => {
    const done = (g.records ?? []).filter((r) => r.status === "done").length;
    return done > 0 && !(done === (g.records ?? []).length && (g.records ?? []).length === STAGE_KEYS.length);
  }).length;
  const notStarted = groups.filter((g) => (g.records ?? []).every((r) => r.status !== "done")).length;
  return { totalLoops: groups.length, completed, inProgress, notStarted, totalRecords };
});

/* ───────────────────────────────────────────
 *  7. SRE 指标 + ECharts mini bar
 * ─────────────────────────────────────────── */
function parseDateMs(raw?: string): number {
  if (!raw) return NaN;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : NaN;
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 60 * 60 * 1000) return `${Math.round(ms / 60000)} 分钟`;
  if (ms < 24 * 60 * 60 * 1000) return `${Math.round(ms / 3600000)} 小时`;
  return `${Math.round(ms / 86400000)} 天`;
}

/** 颜色阶：绿/黄/红 */
function tierColor(v: number, goodLow: boolean): string {
  // 归一化 0-1
  if (goodLow) v = Math.max(0, Math.min(1, 1 - v));
  else v = Math.max(0, Math.min(1, v));
  if (v >= 0.75) return "#67c23a";
  if (v >= 0.4) return "#e6a23c";
  return "#f56c6c";
}

/** 生成 mini 柱状 ECharts option（过去 N 条） */
function miniBarOption(values: number[], color = "#409eff"): any {
  return {
    grid: { top: 2, left: 2, right: 2, bottom: 2, containLabel: false },
    xAxis: { type: "category", show: false, data: values.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: (v: any) => Math.min(0, v.min) },
    tooltip: { trigger: "axis", formatter: (p: any) => `${Math.round(p?.[0]?.value ?? 0)}` },
    series: [
      {
        type: "bar",
        barWidth: "60%",
        data: values.map((v) => ({ value: v, itemStyle: { color } }))
      }
    ]
  };
}

const sreMetrics = computed(() => {
  const groups = [...loopGroups.value].sort((a, b) => {
    const at = parseDateMs(a.updated || a.created);
    const bt = parseDateMs(b.updated || b.created);
    return at - bt;
  });
  const total = groups.length;

  /* 平均 loop 时长（last stage - earliest created） */
  let totalLoopMs = 0;
  let loopWithDuration = 0;
  const loopDurations: number[] = [];
  for (const g of groups) {
    const earliest = (g.records ?? []).reduce(
      (m, r) => Math.min(m, parseDateMs(r.created || r.updated) || Infinity),
      Infinity as number
    );
    const latest = (g.records ?? []).reduce(
      (m, r) => Math.max(m, parseDateMs(r.updated || r.created) || -Infinity),
      -Infinity as number
    );
    if (Number.isFinite(earliest) && Number.isFinite(latest) && latest > earliest) {
      const d = latest - earliest;
      totalLoopMs += d;
      loopWithDuration += 1;
      loopDurations.push(d);
    } else {
      loopDurations.push(0);
    }
  }
  const avgMs = loopWithDuration ? totalLoopMs / loopWithDuration : 0;

  /* 各阶段 P50：按 stage order 求进入前阶段的耗时差的中位数 */
  const stageMedians: Record<string, string> = {};
  const stageRawMs: Record<string, number[]> = {};
  for (const stageKey of STAGE_KEYS) stageRawMs[stageKey] = [];

  for (const g of groups) {
    const recs = sortRecords(g.records ?? []);
    for (let i = 0; i < recs.length; i++) {
      const rec = recs[i];
      const t = parseDateMs(rec.created || rec.updated);
      if (!Number.isFinite(t)) continue;
      // 求 prev 阶段时间戳或 loop 最早
      let prev = Infinity;
      for (let j = 0; j < i; j++) {
        const pt = parseDateMs(recs[j].created || recs[j].updated);
        if (Number.isFinite(pt)) prev = Math.min(prev, pt);
      }
      if (!Number.isFinite(prev)) {
        prev = (g.records ?? []).reduce(
          (m, r) => Math.min(m, parseDateMs(r.created || r.updated) || Infinity),
          Infinity as number
        );
      }
      if (Number.isFinite(prev) && t >= prev) stageRawMs[rec.stage]?.push(t - prev);
    }
  }
  for (const stageKey of STAGE_KEYS) {
    const arr = (stageRawMs[stageKey] ?? []).sort((a, b) => a - b);
    if (!arr.length) {
      stageMedians[stageKey] = "—";
    } else {
      const mid = Math.floor(arr.length / 2);
      const med = arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
      stageMedians[stageKey] = formatDuration(med);
    }
  }

  /* 失败率：含 failed / reopen 的 loop 占比 */
  const failedCount = groups.filter((g) =>
    (g.records ?? []).some((r) => /failed|reopen|rejected/i.test(r.status || ""))
  ).length;
  const failureRatePct = total ? Math.round((failedCount / total) * 1000) / 10 : 0;

  /* 成功率：走到 retrospective 且 done */
  const successCount = groups.filter((g) => {
    const ret = g.stageMap?.["retrospective"];
    return ret?.status === "done" && (g.records ?? []).every((r) => r.status !== "failed");
  }).length;
  const successRatePct = total ? Math.round((successCount / total) * 1000) / 10 : 0;

  /* 返工：同一 loop 同一 stage 的重复记录数之和 / loops */
  let totalReworks = 0;
  const reworksPerLoop: number[] = [];
  for (const g of groups) {
    const perStageCount: Record<string, number> = {};
    for (const r of g.records ?? []) perStageCount[r.stage] = (perStageCount[r.stage] || 0) + 1;
    let loopReworks = 0;
    for (const k of Object.keys(perStageCount)) {
      loopReworks += Math.max(0, perStageCount[k] - 1);
    }
    totalReworks += loopReworks;
    reworksPerLoop.push(loopReworks);
  }
  const avgReworks = total ? (Math.round((totalReworks / total) * 100) / 100).toFixed(2) : "0.00";

  /* 过去 5 loops 的趋势（不够就全部） */
  const tail = groups.slice(-5);
  const avgLoopTrendVals = tail.map((g) => {
    const earliest = (g.records ?? []).reduce(
      (m, r) => Math.min(m, parseDateMs(r.created || r.updated) || Infinity),
      Infinity as number
    );
    const latest = (g.records ?? []).reduce(
      (m, r) => Math.max(m, parseDateMs(r.updated || r.created) || -Infinity),
      -Infinity as number
    );
    if (!Number.isFinite(earliest) || !Number.isFinite(latest)) return 0;
    return Math.round((latest - earliest) / 86400000);
  });
  while (avgLoopTrendVals.length < 5) avgLoopTrendVals.unshift(0);

  const stageTrend = (stageKey: string) => {
    const vals = tail.map((g) => {
      const recs = sortRecords(g.records ?? []);
      const idx = recs.findIndex((r) => r.stage === stageKey);
      if (idx < 0) return 0;
      const cur = parseDateMs(recs[idx].created || recs[idx].updated);
      let prev = Infinity;
      for (let j = 0; j < idx; j++) {
        const pt = parseDateMs(recs[j].created || recs[j].updated);
        if (Number.isFinite(pt)) prev = Math.min(prev, pt);
      }
      if (!Number.isFinite(prev) || !Number.isFinite(cur) || cur < prev) return 0;
      return Math.round((cur - prev) / 3600000);
    });
    while (vals.length < 5) vals.unshift(0);
    return miniBarOption(vals, "#409eff");
  };

  const failureTrendVals = tail.map((g) =>
    (g.records ?? []).some((r) => /failed|reopen|rejected/i.test(r.status || "")) ? 1 : 0
  );
  while (failureTrendVals.length < 5) failureTrendVals.unshift(0);

  const successTrendVals = tail.map((g) =>
    g.stageMap?.["retrospective"]?.status === "done" ? 1 : 0
  );
  while (successTrendVals.length < 5) successTrendVals.unshift(0);

  const reworkTrendVals = tail.map((g) => {
    const c: Record<string, number> = {};
    for (const r of g.records ?? []) c[r.stage] = (c[r.stage] || 0) + 1;
    return Object.keys(c).reduce((sum, k) => sum + Math.max(0, c[k] - 1), 0);
  });
  while (reworkTrendVals.length < 5) reworkTrendVals.unshift(0);

  return {
    ready: total > 0,
    avgLoopDuration: formatDuration(avgMs),
    avgLoopTrend: miniBarOption(avgLoopTrendVals, tierColor(avgMs / (14 * 86400000), true)),
    stageMedians,
    stageTrend,
    failureRatePct,
    failureTrend: miniBarOption(failureTrendVals, "#f56c6c"),
    successRatePct,
    successTrend: miniBarOption(successTrendVals, "#67c23a"),
    avgReworks,
    reworkTrend: miniBarOption(reworkTrendVals, "#e6a23c")
  };
});

/* ───────────────────────────────────────────
 *  8. 工具函数：状态映射、格式化、排序
 * ─────────────────────────────────────────── */
function groupProgress(group: LoopGroup): number {
  const done = (group.records ?? []).filter((r) => r.status === "done").length;
  return STAGE_KEYS.length ? Math.round((done / STAGE_KEYS.length) * 100) : 0;
}
function stageIcon(stage: string): string {
  return STAGES.find((s) => s.key === stage)?.icon ?? "·";
}
function stageLabel(stage: string): string {
  return STAGES.find((s) => s.key === stage)?.label ?? stage;
}
function statusType(status: string): "success" | "warning" | "info" | "danger" {
  if (status === "done") return "success";
  if (status === "in-progress") return "warning";
  if (/failed|rejected|reopen/i.test(status || "")) return "danger";
  return "info";
}
function statusTimelineType(status: string): "primary" | "success" | "warning" | "danger" | "info" {
  if (status === "done") return "success";
  if (status === "in-progress") return "warning";
  if (/failed|rejected|reopen/i.test(status || "")) return "danger";
  return "info";
}
function groupStatusText(group: LoopGroup): string {
  const done = (group.records ?? []).filter((r) => r.status === "done").length;
  if (done === (group.records ?? []).length && (group.records ?? []).length === STAGE_KEYS.length)
    return "Completed";
  return `${done}/${(group.records ?? []).length} done`;
}
function groupStatusType(group: LoopGroup): "success" | "warning" | "info" {
  const done = (group.records ?? []).filter((r) => r.status === "done").length;
  if (done === (group.records ?? []).length && (group.records ?? []).length === STAGE_KEYS.length)
    return "success";
  if (done > 0) return "warning";
  return "info";
}
function sortRecords(records: LoopRecord[]): LoopRecord[] {
  return [...records].sort((a, b) => {
    const at = parseDateMs(a.created || a.updated);
    const bt = parseDateMs(b.created || b.updated);
    if (Number.isFinite(at) && Number.isFinite(bt)) return at - bt;
    return (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99);
  });
}
function formatDate(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  } catch {
    return raw.slice(0, 10);
  }
}
function formatDateTime(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 16);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
      2,
      "0"
    )}`;
  } catch {
    return raw.slice(0, 16);
  }
}
function formatRelativeTime(raw?: string): string {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw.slice(0, 10);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.round(diff / 86400000)}d ago`;
    return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  } catch {
    return raw.slice(0, 10);
  }
}

/* ───────────────────────────────────────────
 *  9. 打开记录 + LoopGroup 点击 + Delete
 * ─────────────────────────────────────────── */
function openRecord(path: string) {
  previewDlg.value?.open(path);
}
function hasLoopGroupFile(group: LoopGroup): boolean {
  if (group.summary?.path) return true;
  for (const k of STAGE_KEYS) if (group.stageMap?.[k]?.path) return true;
  return false;
}
function openLoopGroupCard(group: LoopGroup) {
  if (group.summary?.path) {
    openRecord(group.summary.path);
    return;
  }
  for (const k of STAGE_KEYS) {
    const p = group.stageMap?.[k]?.path;
    if (p) {
      openRecord(p);
      return;
    }
  }
}

/* ───────────────────────────────────────────
 *  10. 三闸门：loop 过滤清除、goal 跳转
 * ─────────────────────────────────────────── */
async function clearLoopFilter() {
  await navigateWithThreeGates({
    type: "page",
    key: "knowledge/executive/processRecord",
    title: "Process Records",
    extra: { mode: "clear-loop-filter" }
  });
}
async function clearGoalFilter() {
  const query = { ...route.query };
  delete query.goal;
  await navigateWithThreeGates({
    type: "page",
    key: "knowledge/executive/processRecord",
    title: "Process Records",
    extra: { ...query, mode: "clear-goal-filter" }
  }, query as Record<string, unknown>);
}
function hasGoalRole(goalId?: string): boolean {
  return !!goalId && !!goalRoleMap?.[goalId as any];
}
async function goGoal(goalId?: string) {
  if (!goalId) return;
  const role = goalRoleMap?.[goalId as any] as string | undefined;
  const params: Record<string, string> = {};
  if (role) params.role = role;
  params.goal = goalId;
  await navigateWithThreeGates({
    type: "page",
    key: "knowledge/executive/okr",
    title: `OKR · ${goalId}`,
    extra: params
  }, params);
}

/**
 * 统一三闸门：resolveLink → gateBEntityExists → router.push → gateCPostNavigate
 * queryParams 为附加到路由的 query，不传则仅靠 linkFactory
 */
async function navigateWithThreeGates(
  entity: ResolveLinkInput,
  queryParams?: Record<string, unknown>
) {
  const resolved = resolveLink(entity);
  let targetLink = resolved.ok ? resolved.link : resolved.fallback;
  // 把 queryParams 合并到 fallback / link 末尾
  if (queryParams && Object.keys(queryParams).length) {
    const sep = targetLink.includes("?") ? "&" : "?";
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(queryParams)) {
      if (v === undefined || v === null || v === "") continue;
      qs.append(k, String(v));
    }
    const qss = qs.toString();
    if (qss) targetLink = `${targetLink}${sep}${qss}`;
  }
  if (!resolved.ok) {
    ElMessage.warning(resolved.message || "无法解析跳转目标，已跳回默认视图");
  }
  try {
    await gateBEntityExists(entity, { timeoutMs: 1500 }).catch(() => true);
  } catch {
    /* ignore */
  }
  try {
    await router.push(targetLink);
    nextTick(() =>
      gateCPostNavigate({
        expectedLink: targetLink,
        expectedParams: resolved.ok ? resolved.params : {},
        expectedTitleKeyword: entity.title || "",
        timeoutMs: 2000
      })
    );
  } catch (e) {
    ElMessage.warning(e instanceof Error ? e.message : "导航失败");
  }
}

async function deleteLoop(group: LoopGroup) {
  const paths = (group.records ?? []).map((r) => r.path);
  if (group.summary?.path) paths.push(group.summary.path);
  try {
    await Promise.all(paths.map((p) => deleteKnowledgeFile(p)));
    ElMessage.success("Loop 删除成功");
  } catch (e) {
    ElMessage.warning(e instanceof Error ? e.message : "删除失败");
  }
  await loadLoopRecords();
}

/* ───────────────────────────────────────────
 *  11. Mermaid: 流程图渲染 + Dialog
 * ─────────────────────────────────────────── */
interface MermaidDialogState {
  visible: boolean;
  loop: LoopGroup | null;
  source: string;
  svgHTML: string;
}
const mermaidDialog = reactive<MermaidDialogState>({
  visible: false,
  loop: null,
  source: "",
  svgHTML: ""
});

let mermaidSeq = 0;
function buildMermaidSource(loop: LoopGroup): string {
  const nodeDefs = STAGES.map((s, i) => {
    const id = `N${i}`;
    const rec = loop.stageMap?.[s.key];
    const status = rec?.status ?? "";
    let cls = "missing";
    if (rec) cls = status === "done" ? "done" : status ? "pending" : "missing";
    return { id, label: s.label, cls, title: rec?.title ?? "" };
  });
  const lines = ["flowchart LR"];
  lines.push("  classDef done fill:#67c23a,color:#fff,stroke:#4caf50,font-weight:bold");
  lines.push("  classDef pending fill:#e6a23c,color:#fff,stroke:#d89c2f");
  lines.push("  classDef missing fill:#f56c6c,color:#fff,stroke:#e05c5c,stroke-dasharray: 5 5");
  nodeDefs.forEach((n, i) => {
    const titleLine = n.title ? `| "${n.title.replace(/["\n]/g, " ")}" |` : "";
    lines.push(`  ${n.id}["${n.label}${titleLine}"]`);
    lines.push(`  class ${n.id} ${n.cls}`);
  });
  for (let i = 0; i < nodeDefs.length - 1; i++) {
    lines.push(`  ${nodeDefs[i].id} --> ${nodeDefs[i + 1].id}`);
  }
  return lines.join("\n");
}

async function openMermaidDialog(loop: LoopGroup) {
  mermaidDialog.loop = loop;
  mermaidDialog.source = buildMermaidSource(loop);
  mermaidDialog.svgHTML = "";
  mermaidDialog.visible = true;
  const id = `process-mermaid-${++mermaidSeq}`;
  await nextTick();
  try {
    // @ts-ignore
    const { svg } = await mermaid.render(id, mermaidDialog.source);
    mermaidDialog.svgHTML = svg;
  } catch (e: any) {
    const err = e instanceof Error ? e.message : String(e);
    mermaidDialog.svgHTML = `<pre style="color:#f56c6c">Mermaid 渲染失败: ${err}\n\n源码:\n${mermaidDialog.source}</pre>`;
    pushReliabilityEvent({
      projectKey: "executive",
      phase: "P2-knowledge",
      status: "degraded",
      durationMs: 0,
      retryCount: 0,
      tags: { op: "process_mermaid_fail", loopId: loop.loopId, err }
    });
  }
}

/* ───────────────────────────────────────────
 *  12. CSV 导出
 * ─────────────────────────────────────────── */
function onExportCSV() {
  const rows: Record<string, unknown>[] = [];
  for (const g of filteredLoopGroups.value) {
    for (const r of g.records ?? []) {
      rows.push({
        "Loop ID": g.loopId,
        "Goal ID": g.goalId ?? "",
        Stage: stageLabel(r.stage),
        Title: r.title,
        Owner: r.role ?? "",
        "Created At": formatDateTime(r.created),
        "Updated At": formatDateTime(r.updated),
        Status: r.status,
        "File Path": r.path
      });
    }
  }
  const columns = [
    { key: "Loop ID", label: "Loop ID" },
    { key: "Goal ID", label: "Goal ID" },
    { key: "Stage", label: "Stage" },
    { key: "Title", label: "Title" },
    { key: "Owner", label: "Owner" },
    { key: "Created At", label: "Created At" },
    { key: "Updated At", label: "Updated At" },
    { key: "Status", label: "Status" },
    { key: "File Path", label: "File Path" }
  ];
  try {
    exportCSV(rows, columns, `process-records-${new Date().toISOString().slice(0, 10)}.csv`);
    ElMessage.success(`已导出 ${rows.length} 条 Process Record`);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "CSV 导出失败");
  }
}

/* ───────────────────────────────────────────
 *  13. 生命周期
 * ─────────────────────────────────────────── */
onMounted(loadLoopRecords);

/* 当 query 参数变化时重新计算（响应式自动同步） */
watch(
  () => [route.query.loop, route.query.goal],
  () => {
    /* no-op — 计算属性会自动响应；这里仅为 traceability */
  }
);
type _FormRulesRef = FormRules;
</script>


<style scoped lang="scss">
@use "./styles/processRecord.scss";

.process__card.is-clickable {
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  &:hover {
    transform: translateY(-2px);
  }
}

/* 本页增强：SRE row + Filter bar + Timeline + Mermaid */
.process__sre-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin: 8px 0 12px;
}
.process__sre-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--el-bg-color-page, #f5f7fa);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__value {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    font-variant-numeric: tabular-nums;
  }
  &--danger &__value {
    color: var(--el-color-danger, #f56c6c);
  }
  &--success &__value {
    color: var(--el-color-success, #67c23a);
  }
}

.process__filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 8px 0 12px;
}
.process__filter {
  width: 220px;
  &--date {
    width: 340px;
  }
}

.process__card-head-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.process__timeline {
  margin: 12px 0;
  padding: 10px 12px;
  background: var(--el-bg-color, #fff);
  border-radius: 8px;
  border: 1px dashed var(--el-border-color-light, #f0f0f0);
  &-title {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
    color: var(--el-text-color-primary, #303133);
  }
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }
  &--inline {
    margin: 6px 0;
  }
}
.process__tl-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.process__tl-title {
  font-weight: 500;
}
.process__tl-meta {
  color: var(--el-text-color-secondary, #909399);
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.process__table-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.process__list-actions {
  display: inline-flex;
  gap: 4px;
  margin-left: 8px;
}

.process__text-muted {
  color: var(--el-text-color-placeholder, #c0c4cc);
}

.process__mermaid-wrap {
  min-height: 200px;
  padding: 8px;
  .mermaid {
    overflow-x: auto;
    text-align: center;
  }
  pre {
    margin: 0;
    background: transparent;
  }
}

.process__r-summary {
  &-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
}

.rl-form-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  margin-top: 4px;
}

/* 全局搜索框 placeholder 兼容：readingList 页面 rl-shortcut 样式也在此声明，防止跨页面闪烁 */
.rl-shortcut-legend {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.18s ease;
  &.is-collapsed .rl-shortcut-legend__chips {
    display: none;
  }
  &__toggle {
    border: 1px solid var(--el-border-color, #dcdfe6);
    background: #fff;
    padding: 4px 10px;
    border-radius: 16px;
    cursor: pointer;
    font-size: 12px;
    color: var(--el-text-color-primary, #303133);
    &:hover {
      border-color: var(--el-color-primary, #409eff);
      color: var(--el-color-primary, #409eff);
    }
  }
  &__chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    flex: 1;
  }
}
.rl-shortcut-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--el-bg-color-page, #f5f7fa);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  font-size: 12px;
  small {
    margin-left: 4px;
    color: var(--el-text-color-secondary, #909399);
  }
  kbd {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    padding: 1px 4px;
    border: 1px solid var(--el-border-color, #dcdfe6);
    border-radius: 3px;
    background: #fff;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
  }
  &--muted {
    opacity: 0.65;
    font-style: italic;
  }
}
</style>
