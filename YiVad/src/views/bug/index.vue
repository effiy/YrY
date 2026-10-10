<template>
  <div class="bug-page">
    <!-- ============================================================ -->
    <!--  HEADER + SRE SLO 可观测性面板                                -->
    <!-- ============================================================ -->
    <div class="bug-header">
      <div class="bug-header__left">
        <h2 class="bug-header__title">Bugs</h2>
        <span class="bug-header__count">{{ allBugs.length }}</span>
        <!-- SLO Window toggle · 5档 → 写 ?window= query (AC-U1) -->
        <div class="bug-window-toggle" role="group" aria-label="SLO sliding window">
          <el-radio-group
            v-model="windowKey"
            size="small"
            :text-color="'#fff'"
            :fill="'#4f46e5'"
          >
            <el-radio-button
              v-for="w in SLO_WINDOWS"
              :key="w.key"
              :value="w.key"
              :label="w.key"
            >
              <el-tooltip :content="windowTooltip(w.key)" placement="bottom" :show-after="300">
                <span>{{ w.label }}</span>
              </el-tooltip>
            </el-radio-button>
          </el-radio-group>
          <el-tag
            v-if="winMs !== null"
            class="bug-window-toggle__hint"
            effect="plain"
            size="small"
          >
            {{ sloResult.windowSize }} / {{ allBugs.length }} in window
          </el-tag>
          <el-tag
            v-else
            class="bug-window-toggle__hint"
            effect="plain"
            size="small"
            type="info"
          >
            All {{ allBugs.length }}
          </el-tag>
        </div>
        <!-- SLO Light 状态灯带 · 四个灯都可点击下钻到对应筛选 (AC-U1) -->
        <div class="bug-slo-strip" role="img" aria-label="SRE SLO status lights">
          <button
            class="bug-slo-strip__light"
            type="button"
            :disabled="sloMttr.status === 'na'"
            :aria-label="`MTTR p95 ${sloMttr.value}h. Click to filter by bugs exceeding MTTR target.`"
            @click="goDrillSloMttr"
          >
            <SloLight :status="sloMttr.status" :label="`MTTR p95 ${sloMttr.value}h`" :target="`< ${MTTR_TARGET_HOURS}h`" />
          </button>
          <button
            class="bug-slo-strip__light"
            type="button"
            :disabled="sloCriticalSla.status === 'na'"
            :aria-label="`Critical SLA ${sloCriticalSla.value}%. Click to filter breached critical bugs.`"
            @click="goDrillSloCriticalSla"
          >
            <SloLight :status="sloCriticalSla.status" :label="`Critical SLA ${sloCriticalSla.value}%`" :target="`≥ ${CRITICAL_SLA_TARGET_PCT}%`" />
          </button>
          <button
            class="bug-slo-strip__light"
            type="button"
            :disabled="sloReopenRate.status === 'na'"
            :aria-label="`Reopen rate ${sloReopenRate.value}%. Click to filter reopened bugs.`"
            @click="goOkrReopened"
          >
            <SloLight :status="sloReopenRate.status" :label="`Reopen ${sloReopenRate.value}%`" :target="`≤ ${REOPEN_RATE_TARGET_PCT}%`" />
          </button>
          <button
            class="bug-slo-strip__light"
            type="button"
            :disabled="sloResolveRate.status === 'na'"
            :aria-label="`Resolve rate ${sloResolveRate.value}%. Click to filter unresolved.`"
            @click="goDrillSloUnresolved"
          >
            <SloLight :status="sloResolveRate.status" :label="`Resolve ${sloResolveRate.value}%`" :target="`≥ 80%`" />
          </button>
        </div>
      </div>
      <div class="bug-header__right">
        <!-- Data freshness · 点击立即刷新 → 按钮 + age + Live badge (AC-R5 / AC-R6) -->
        <div class="bug-header__freshness" :class="{ 'is-stale': dataAge > 120 }">
          <LiveBadge
            :sse-connected="sseConnected"
            :sse-error="sseError"
            :last-data-at="lastRefreshed ? lastRefreshed.getTime() : null"
            :poll-seconds="60"
            :retry-attempts="0"
            :now="now"
            :show-refresh="false"
            @refresh="refresh"
          />
          <el-tooltip :content="freshnessAriaLabel" placement="bottom" :show-after="300">
            <button
              class="bug-header__refresh"
              type="button"
              :aria-label="freshnessAriaLabel"
              @click="refresh"
            >
              <el-icon :class="{ 'is-spin': loading }"><Refresh /></el-icon>
              <span class="bug-header__refresh-age">{{ ageLabel }}</span>
            </button>
          </el-tooltip>
        </div>
        <div class="bug-header__date-nav">
          <el-button size="small" :icon="ArrowLeft" @click="goToPrevDay" />
          <el-popover placement="bottom" :width="180" trigger="click">
            <template #reference>
              <span class="bug-header__date-label" :class="{ 'bug-header__date-label--muted': !filterDateStr }">
                {{ filterDateStr ? filterDateLabel : "All dates" }}
              </span>
            </template>
            <el-date-picker
              v-model="filterDate"
              type="date"
              placeholder="Pick a day"
              size="small"
              style="width: 100%"
              @change="onFilterDateChange"
            />
            <div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end">
              <el-button size="small" link @click="goToFilterToday">Today</el-button>
              <el-button v-if="filterDateStr" size="small" link type="danger" @click="clearFilterDate">Clear</el-button>
            </div>
          </el-popover>
          <el-button size="small" :icon="ArrowRight" @click="goToNextDay" />
        </div>
        <el-tooltip :content="`Shortcuts: ⌘N New  ·  ⌘K Search  ·  ⌥1-3 Views  ·  ⌘D Analytics`" placement="bottom" :show-after="400">
          <el-button size="small" :icon="MagicStick" plain @click="showShortcutCheat = true" />
        </el-tooltip>
      </div>
    </div>

    <!-- ============================================================ -->
    <!--  Quick Stats — 点击应用筛选                                    -->
    <!-- ============================================================ -->
    <div class="bug-stats">
      <div
        v-for="stat in quickStats"
        :key="stat.key"
        class="bug-stat"
        :class="[`bug-stat--${stat.level}`, { 'is-active': isStatActive(stat) }]"
        @click="applyStatFilter(stat)"
      >
        <span class="bug-stat__icon">
          <el-icon v-if="stat.key === 'critical'"><WarningFilled /></el-icon>
          <el-icon v-else-if="stat.key === 'open'"><CircleCloseFilled /></el-icon>
          <el-icon v-else-if="stat.key === 'in_progress'"><Loading /></el-icon>
          <el-icon v-else-if="stat.key === 'resolved'"><CircleCheckFilled /></el-icon>
          <el-icon v-else-if="stat.key === 'stale'"><Timer /></el-icon>
          <el-icon v-else><TrendCharts /></el-icon>
        </span>
        <div class="bug-stat__body">
          <span class="bug-stat__value">{{ stat.value }}</span>
          <span class="bug-stat__label">{{ stat.label }}</span>
          <el-progress
            v-if="stat.key === 'rate'"
            :percentage="resolvePct"
            :stroke-width="4"
            :show-text="false"
            :color="resolvePct >= 80 ? '#67c23a' : resolvePct >= 50 ? '#e6a23c' : '#f56c6c'"
            style="margin-top:4px;width:100%"
          />
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!--  VIEW SWITCHER + ACTION BAR                                   -->
    <!-- ============================================================ -->
    <div class="bug-action-bar">
      <div class="bug-filters">
        <el-input
          ref="searchInputRef"
          v-model="searchText"
          placeholder="Search title / module… (⌘K)"
          :prefix-icon="Search"
          clearable
          size="small"
          class="bug-filters__search"
        />
        <el-select v-model="filterStatus" placeholder="Status" multiple collapse-tags clearable size="small" class="bug-filters__select">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-model="filterSeverity" placeholder="Severity" multiple collapse-tags clearable size="small" class="bug-filters__select">
          <el-option v-for="s in severityOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-model="filterAssignee" placeholder="Assignee" clearable filterable size="small" class="bug-filters__select">
          <el-option v-for="a in assigneeOptions" :key="a" :label="a" :value="a" />
        </el-select>
        <el-select v-model="filterRisk" placeholder="Risk" clearable size="small" class="bug-filters__select">
          <el-option label="Critical (≥12)" value="critical" />
          <el-option label="High (8–11)" value="high" />
          <el-option label="Medium (4–7)" value="medium" />
          <el-option label="Low (≤3)" value="low" />
          <el-option label="SLA Breached" value="sla" />
        </el-select>
        <template v-if="!projectKey">
          <el-select v-model="filterProject" placeholder="Project" clearable size="small" class="bug-filters__select">
            <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </template>
      </div>
      <div class="bug-toolbar-actions">
        <el-radio-group v-model="activeView" size="small" class="bug-view-switcher">
          <el-radio-button value="table">
            <el-icon><List /></el-icon><span class="bug-view-switcher__label">List</span>
          </el-radio-button>
          <el-radio-button value="board">
            <el-icon><Grid /></el-icon><span class="bug-view-switcher__label">Board</span>
          </el-radio-button>
          <el-radio-button value="matrix">
            <el-icon><TrendCharts /></el-icon><span class="bug-view-switcher__label">Matrix</span>
          </el-radio-button>
        </el-radio-group>
        <el-button type="primary" size="small" :icon="Plus" @click="store.openCreateDialog(projectKey ? projectName(projectKey) : '', projectKey)">
          New Bug <span class="bug-kbd">⌘N</span>
        </el-button>
        <el-dropdown v-if="selection.length" trigger="click" @command="handleBatchCommand">
          <el-button size="small" plain>Batch ({{ selection.length }})</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="status">Change Status</el-dropdown-item>
              <el-dropdown-item command="assign">Assign</el-dropdown-item>
              <el-dropdown-item command="priority">Set Priority</el-dropdown-item>
              <el-dropdown-item command="delete" divided>Delete</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button size="small" :icon="Download" plain @click="exportCSV" />
      </div>
    </div>

    <!-- ============================================================ -->
    <!--  Active Filter Chips                                          -->
    <!-- ============================================================ -->
    <div v-if="activeFilterChips.length" class="bug-filter-chips">
      <TransitionGroup name="chip">
        <el-tag v-for="chip in activeFilterChips" :key="chip.key" closable size="small" effect="plain" :type="chip.type || 'info'" @close="removeFilterChip(chip)">
          {{ chip.label }}
        </el-tag>
      </TransitionGroup>
      <el-button link size="small" type="primary" @click="clearAllFilters">Clear All</el-button>
    </div>

    <!-- ============================================================ -->
    <!--  VIEW 1: TABLE                                                -->
    <!-- ============================================================ -->
    <div v-show="activeView === 'table'" class="bug-table-wrap">
      <ProTable ref="proTable" title="" :columns="columns" :request-api="fetchBugs" :pagination="true" row-key="key" @selection-change="onSelectionChange">
        <template #key="scope">
          <div class="bug-key-wrap">
            <code class="bug-key">{{ scope.row.key }}</code>
            <RiskBadge :score="riskOf(scope.row)" />
          </div>
        </template>
        <template #title="scope">
          <div class="bug-title-cell" :class="{ 'is-sla-breached': isSlaBreached(scope.row) }">
            <el-button link type="primary" class="bug-title-cell__text" @click="openTitlePreview(scope.row)">
              {{ scope.row.title }}
            </el-button>
            <Transition name="fade">
              <SlaBreachTag v-if="isSlaBreached(scope.row)" :hours="ageHoursOf(scope.row)" :severity="scope.row.severity" />
            </Transition>
            <el-tag
              v-if="reopenCountOf(scope.row) > 0"
              class="bug-title-cell__reopen"
              :type="reopenTagType(reopenCountOf(scope.row))"
              effect="light"
              size="small"
              round
              :aria-label="`Bug reopened ${reopenCountOf(scope.row)} times`"
            >
              Reopen ×{{ reopenCountOf(scope.row) }}
            </el-tag>
          </div>
        </template>
        <template #severity="scope">
          <el-tag :type="severityTagType(scope.row.severity)" size="small" effect="dark">{{ scope.row.severity }}</el-tag>
        </template>
        <template #priority="scope">
          <el-tag :type="priorityTagType(scope.row.priority)" size="small">{{ scope.row.priority }}</el-tag>
        </template>
        <template #status="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="small" effect="dark">{{ scope.row.status }}</el-tag>
        </template>
        <template #type="scope">
          <el-tag size="small" effect="plain" :type="typeTagColor(scope.row.type)">{{ scope.row.type }}</el-tag>
        </template>
        <template #module="scope">
          <span v-if="scope.row.module" class="bug-module">{{ scope.row.module }}</span>
          <span v-else class="bug-na">—</span>
        </template>
        <template #project="scope">
          <el-button v-if="scope.row.project_key" link type="primary" size="small" @click="goProject(scope.row.project_key)">
            {{ projectName(scope.row.project_key) || scope.row.project || scope.row.project_key }}
          </el-button>
          <span v-else>{{ scope.row.project || '—' }}</span>
        </template>
        <template #assignee="scope">
          <span v-if="scope.row.assignee" class="bug-assignee">{{ scope.row.assignee }}</span>
          <span v-else class="bug-na bug-na--warning">unassigned</span>
        </template>
        <template #reporter="scope">
          <span v-if="scope.row.reporter" class="bug-reporter">{{ scope.row.reporter }}</span>
          <span v-else class="bug-na">—</span>
        </template>
        <template #createdAt="scope">
          <div class="bug-age-cell">
            <span>{{ formatAbsolute(scope.row.createdAt) }}</span>
            <span class="bug-age-cell__age">{{ ageLabelOf(scope.row) }}</span>
          </div>
        </template>
        <template #updatedAt="scope">
          {{ formatAbsolute(scope.row.updatedAt) }}
        </template>
        <template #operation="scope">
          <div class="bug-actions">
            <el-tooltip content="Change Status" placement="top" :show-after="500">
              <el-dropdown trigger="click" @command="(cmd: string) => quickChangeStatus(scope.row, cmd)">
                <el-button size="small" :icon="CircleCheck" class="bug-action-btn" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="s in quickStatuses(scope.row.status)" :key="s.value" :command="s.value">{{ s.label }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-tooltip>
            <el-tooltip content="View Detail" placement="top" :show-after="500">
              <el-button size="small" :icon="View" class="bug-action-btn" @click="goDetail(scope.row.key)" />
            </el-tooltip>
            <el-tooltip content="Edit" placement="top" :show-after="500">
              <el-button size="small" :icon="Edit" class="bug-action-btn" @click="openEdit(scope.row)" />
            </el-tooltip>
            <el-popconfirm
              :title="`Delete bug 「${scope.row.title}」?`"
              confirm-button-text="Delete"
              cancel-button-text="Cancel"
              confirm-button-type="danger"
              @confirm="handleDeleteRow(scope.row)"
            >
              <template #reference>
                <el-button size="small" type="danger" :icon="Delete" class="bug-action-btn" :loading="deletingKeys.has(scope.row.key)" />
              </template>
            </el-popconfirm>
          </div>
        </template>
      </ProTable>
    </div>

    <!-- ============================================================ -->
    <!--  VIEW 2: KANBAN BOARD                                         -->
    <!-- ============================================================ -->
    <div v-show="activeView === 'board'" class="bug-board-wrap">
      <BugBoard :bugs="boardBugs" @status-change="quickChangeStatusByKey" @click-bug="goDetail" />
    </div>

    <!-- ============================================================ -->
    <!--  VIEW 3: RISK MATRIX (Severity × Priority) + 老化分布         -->
    <!-- ============================================================ -->
    <div v-show="activeView === 'matrix'" class="bug-matrix-wrap">
      <div class="bug-matrix-grid">
        <!-- Risk Matrix -->
        <div class="bug-matrix-card">
          <div class="bug-matrix-card__head">
            <h3 class="bug-matrix-card__title">Risk Matrix · Severity × Priority</h3>
            <span class="bug-matrix-card__hint">Cell = count, background intensity = aggregate risk</span>
          </div>
          <div class="bug-risk-matrix">
            <div class="bug-risk-matrix__corner"></div>
            <div v-for="s in SEVERITY_ORDER" :key="s" class="bug-risk-matrix__col-head">
              <el-tag :type="severityTagType(s)" size="small" effect="dark">{{ s }}</el-tag>
            </div>
            <template v-for="p in PRIORITY_ORDER" :key="p">
              <div class="bug-risk-matrix__row-head">
                <el-tag :type="priorityTagType(p)" size="small">{{ p }}</el-tag>
              </div>
              <el-tooltip
                v-for="s in SEVERITY_ORDER"
                :key="`${p}-${s}-tip`"
                :content="matrixCellTooltip(p, s)"
                placement="top"
                :show-after="250"
                :disabled="riskMatrix[p][s] === 0"
              >
                <button
                  class="bug-risk-matrix__cell"
                  :style="riskCellStyle(p, s)"
                  :aria-label="`Risk matrix cell: priority ${p} severity ${s}, count ${riskMatrix[p][s]}. Click to filter.`"
                  :disabled="riskMatrix[p][s] === 0"
                  @click="applyMatrixFilter(p, s)"
                >
                  <span class="bug-risk-matrix__count">{{ riskMatrix[p][s] }}</span>
                  <span class="bug-risk-matrix__risk">risk {{ riskScore(p, s) }}</span>
                </button>
              </el-tooltip>
            </template>
          </div>
          <div class="bug-matrix-legend">
            <div><i class="bug-dot" style="background:rgba(245,108,108,0.85)"></i> Critical ≥ 12</div>
            <div><i class="bug-dot" style="background:rgba(230,162,60,0.75)"></i> High 8–11</div>
            <div><i class="bug-dot" style="background:rgba(64,158,255,0.55)"></i> Medium 4–7</div>
            <div><i class="bug-dot" style="background:rgba(144,147,153,0.3)"></i> Low ≤ 3</div>
          </div>
        </div>
        <!-- Age Heatmap -->
        <div class="bug-matrix-card">
          <div class="bug-matrix-card__head">
            <h3 class="bug-matrix-card__title">Bug Age Heatmap · Open only</h3>
            <span class="bug-matrix-card__hint">Aged bugs = silent risk. SLA breach = pulsate.</span>
          </div>
          <div class="bug-age-heatmap">
            <div class="bug-age-heatmap__corner"></div>
            <div v-for="bucket in AGE_BUCKETS" :key="bucket.key" class="bug-age-heatmap__col-head">
              <span>{{ bucket.label }}</span>
            </div>
            <template v-for="s in SEVERITY_ORDER" :key="s">
              <div class="bug-age-heatmap__row-head">
                <el-tag :type="severityTagType(s)" size="small" effect="dark">{{ s }}</el-tag>
              </div>
              <button
                v-for="bucket in AGE_BUCKETS"
                :key="`${s}-${bucket.key}`"
                class="bug-age-heatmap__cell"
                :class="{ 'is-sla-breached': isAgeBucketSlaBreached(s, bucket) }"
                :style="ageCellStyle(ageMatrix[s][bucket.key], s, bucket)"
                @click="applyAgeFilter(s, bucket)"
              >
                <span class="bug-age-heatmap__count">{{ ageMatrix[s][bucket.key] }}</span>
              </button>
            </template>
          </div>
          <div class="bug-matrix-legend">
            <div>Cell color: darker = more bugs · <span class="bug-breach-pill">pulsate</span> = SLA breached</div>
          </div>
        </div>
      </div>
      <!-- OKR Impact summary → every cell is a drill-down button (FR-E1) -->
      <div class="bug-okr-impact">
        <h3 class="bug-okr-impact__title">
          <el-icon><Flag /></el-icon> OKR Impact Tracker
        </h3>
        <div class="bug-okr-impact__row">
          <button
            class="bug-okr-impact__cell"
            type="button"
            :aria-label="`Open Critical + P0: ${okrImpact.openCriticalP0}. Click to filter.`"
            :disabled="okrImpact.openCriticalP0 === 0"
            @click="goOkrOpenCriticalP0"
          >
            <span class="bug-okr-impact__label">Open Critical + P0</span>
            <span class="bug-okr-impact__value">{{ okrImpact.openCriticalP0 }}</span>
            <span class="bug-okr-impact__hint">KR blocker candidates · Click to drill</span>
          </button>
          <button
            class="bug-okr-impact__cell"
            type="button"
            :aria-label="`Resolved this week: ${okrImpact.resolvedThisWeek}. Click to filter.`"
            :disabled="okrImpact.resolvedThisWeek === 0"
            @click="goOkrResolvedThisWeek"
          >
            <span class="bug-okr-impact__label">Resolved this week</span>
            <span class="bug-okr-impact__value bug-okr-impact__value--good">{{ okrImpact.resolvedThisWeek }}</span>
            <span class="bug-okr-impact__hint">Velocity signal · Click to drill</span>
          </button>
          <button
            class="bug-okr-impact__cell"
            type="button"
            :aria-label="`Reopened this cycle: ${okrImpact.reopened}. Click to filter.`"
            :disabled="okrImpact.reopened === 0"
            @click="goOkrReopened"
          >
            <span class="bug-okr-impact__label">Reopened this cycle</span>
            <span class="bug-okr-impact__value" :class="sloReopenRate.status === 'fail' ? 'bug-okr-impact__value--bad' : ''">{{ okrImpact.reopened }}</span>
            <span class="bug-okr-impact__hint">Fix quality signal · Click to drill</span>
          </button>
          <button
            class="bug-okr-impact__cell"
            type="button"
            :aria-label="`Unassigned open bugs: ${okrImpact.unassignedOpen}. Click to filter.`"
            :disabled="okrImpact.unassignedOpen === 0"
            @click="goOkrUnassignedOpen"
          >
            <span class="bug-okr-impact__label">Unassigned open</span>
            <span class="bug-okr-impact__value" :class="okrImpact.unassignedOpen > 0 ? 'bug-okr-impact__value--bad' : ''">{{ okrImpact.unassignedOpen }}</span>
            <span class="bug-okr-impact__hint">Owner gap · Click to drill</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!--  Dialogs / Overlays                                           -->
    <!-- ============================================================ -->
    <KnowledgePreviewDialog ref="titlePreviewRef" />
    <BugFormDialog ref="dialogRef" @saved="onSaved" />

    <!-- Shortcut cheat sheet -->
    <el-dialog v-model="showShortcutCheat" title="Bug Console · Shortcuts" width="460px" append-to-body>
      <ul class="bug-cheat-list">
        <li><kbd>⌘</kbd><kbd>N</kbd><span>Create new bug</span></li>
        <li><kbd>⌘</kbd><kbd>K</kbd><span>Focus search input</span></li>
        <li><kbd>⌘</kbd><kbd>D</kbd><span>Collapse / expand Analytics</span></li>
        <li><kbd>⌥</kbd><kbd>1</kbd><span>Switch to List view</span></li>
        <li><kbd>⌥</kbd><kbd>2</kbd><span>Switch to Board view</span></li>
        <li><kbd>⌥</kbd><kbd>3</kbd><span>Switch to Matrix view</span></li>
        <li><kbd>⌘</kbd><kbd>Enter</kbd><span>(In dialog) Save</span></li>
      </ul>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="bugList">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Plus, Delete, View, Edit, Refresh,
  ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
  Download, Search, CircleCheck,
  WarningFilled, CircleCloseFilled, Loading,
  CircleCheckFilled, TrendCharts,
  MagicStick, Grid, List, Timer, Flag
} from "@element-plus/icons-vue";
import { useTimestamp } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";

import { useBugStore } from "@/stores/modules/bug";
import { useProjectStore } from "@/stores/modules/project";
import { getBugList, readBugContent, updateBug } from "@/api/modules/bug";
import type { BugDocument, BugPriority, BugSeverity } from "@/api/modules/bug";
import type { SeverityDistribution, BugStatusBreakdown, BugAgeDistribution, InflowOutflowData, TrendDataPoint } from "@/types/analytics";
import { ProTable } from "@/components";
import type { ColumnProps, ProTableInstance } from "@/components";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import BugInflowOutflowChart from "@/components/analytics/BugInflowOutflowChart.vue";
import MttrTrendChart from "@/components/analytics/MttrTrendChart.vue";
import ControlChart from "@/components/analytics/ControlChart.vue";
import SeverityDonut from "@/components/analytics/SeverityDonut.vue";
import BugAgeChart from "@/components/analytics/BugAgeChart.vue";
import StatusBreakdown from "@/components/analytics/StatusBreakdown.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import BugFormDialog from "./components/BugFormDialog.vue";
import BugBoard from "./components/BugBoard.vue";
import SloLight from "./components/SloLight.vue";
import RiskBadge from "./components/RiskBadge.vue";
import SlaBreachTag from "./components/SlaBreachTag.vue";
import LiveBadge from "./components/LiveBadge.vue";
import { severityTagType, priorityTagType, statusTagType } from "@/hooks/useTagHelpers";
import { formatAbsolute } from "@/utils/datetime";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { DisposerBag } from "@/utils/disposer";
import { linkBug, linkProject, linkBugList } from "@/utils/linkFactory";
import {
  calcSloMetrics, calcControlLimits, calcBugPerf, calcPercentile,
  parseSloWindow, sloWindowMs, SLO_WINDOWS, SLO_WINDOW_DEFAULT,
  calcBugReopenCount, calcBugWindowAnchor,
  type SloWindowKey,
} from "@/utils/reliability/sloMetrics";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";
import { useDataFreshness } from "@/hooks/useDataFreshness";
import { BUG_SLA_HOURS } from "@/stores/modules/bug";

// ──────────────────────────────────────────────────────────────────
//  SRE SLO 常量（工业级可观测性红线）
// ──────────────────────────────────────────────────────────────────
const MTTR_TARGET_HOURS = 24;
const CRITICAL_SLA_TARGET_PCT = 95;     // % of critical bugs resolved within 24h
const REOPEN_RATE_TARGET_PCT = 5;      // ≤ 5% reopen = healthy
const SEVERITY_ORDER: BugSeverity[] = ["critical", "major", "minor", "trivial"];
const PRIORITY_ORDER: BugPriority[] = ["p0", "p1", "p2", "p3"];
const SEVERITY_WEIGHT: Record<BugSeverity, number> = { critical: 4, major: 3, minor: 2, trivial: 1 };
const PRIORITY_WEIGHT: Record<BugPriority, number> = { p0: 4, p1: 3, p2: 2, p3: 1 };
// Critical open bug SLA hours by severity — reuse shared store const so
// list + detail agree on the exact thresholds (prevents drift between two
// Record literals).
const SLA_HOURS: Record<BugSeverity, number> = BUG_SLA_HOURS;
// Age buckets
const AGE_BUCKETS = [
  { key: "lt_1d",   label: "< 1d",   maxH: 24   },
  { key: "1_3d",    label: "1–3d",   maxH: 72   },
  { key: "3_7d",    label: "3–7d",   maxH: 168  },
  { key: "7_30d",   label: "7–30d",  maxH: 720  },
  { key: "gt_30d",  label: "> 30d",  maxH: Infinity }
] as const;
type AgeBucketKey = typeof AGE_BUCKETS[number]["key"];

// ──────────────────────────────────────────────────────────────────
//  Bootstrap
// ──────────────────────────────────────────────────────────────────
const router = useRouter();
const route = useRoute();
const props = defineProps<{ projectKey?: string; filterDate?: Date | null }>();
const store = useBugStore();
const projectStore = useProjectStore();
const proTable = ref<ProTableInstance>();
const searchInputRef = ref<InstanceType<typeof import("element-plus")["ElInput"]> | null>(null);
const dialogRef = ref<InstanceType<typeof BugFormDialog> | null>(null);
// 🧭 Unified data source — bugStore.bugs becomes the single source of truth for
// list+detail so the detail fallback never races against a stale local ref.
const allBugs = computed<BugDocument[]>(() => store.bugs || []);
const loading = computed<boolean>(() => store.loading);
const deletingKeys = ref(new Set<string>());
const analyticsOpen = ref(false);
const selection = ref<any[]>([]);
const activeView = ref<"table" | "board" | "matrix">("table");
const showShortcutCheat = ref(false);
const filterRisk = ref("");
// ── SLO Window (24h / 7d / 30d / 90d / All) + URL persistence ──
const windowKey = ref<SloWindowKey>(parseSloWindow(route.query.window));
const winMs = computed<number | null>(() => sloWindowMs(windowKey.value));
watch(windowKey, (v) => {
  const q: Record<string, any> = { ...(route.query || {}), window: v };
  for (const k of Object.keys(q)) if (q[k] === undefined || q[k] === null || q[k] === "") delete q[k];
  router.replace(linkBugList(q));
}, { flush: "post" });

// ── Realtime ticks + freshness + SSE ──
const now = useTimestamp({ interval: 60_000 });
const { data: liveData, connected: sseConnected, error: sseError } = useLiveMetrics();
const { dataAge, lastRefreshed, markFresh, ageLabel } = useDataFreshness();
// When SSE open_bugs/total_bugs drift from our current allBugs snapshot by > 3,
// that's a strong signal the dataset changed — trigger a proactive full refresh
// so our MTTR/SLA numbers stay live, not stale.
watch(
  () => [liveData.value?.open_bugs ?? null, liveData.value?.total_bugs ?? null] as const,
  ([open, total]) => {
    if (open === null || total === null) return;
    const curOpen = allBugs.value.filter(b => ["open","in_progress","reopened"].includes(b.status)).length;
    const curTotal = allBugs.value.length;
    if (Math.abs(open - curOpen) >= 3 || Math.abs(total - curTotal) >= 3) {
      void refresh();
    }
  },
);
// 60s polling fallback (runs regardless of SSE)
const pollTimer = window.setInterval(() => {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  void refresh().catch(() => {});
}, 60_000);
function onVisibility() {
  if (document.visibilityState === "visible") {
    void refresh().catch(() => {});
  }
}
if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);
onBeforeUnmount(() => {
  window.clearInterval(pollTimer);
  if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
});
const bag = new DisposerBag();

// ── Date filter ──
const _filterDate = ref<Date | null>(null);
const filterDate = computed({
  get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
  set: v => { _filterDate.value = v; }
});
const {
  label: filterDateLabel,
  filterDateStr,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate
} = useDateFilter(filterDate);
function onFilterDateChange() { /* trigger watch via filterDateStr */ }

// ── Filter state ──
const searchText = ref("");
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchText, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    proTable.value?.getTableList();
  }, 300);
});
const filterStatus = ref<string[]>([]);
const filterSeverity = ref<string[]>([]);
const filterPriority = ref<BugPriority[]>([]);
const filterAssignee = ref("");
const filterProject = ref(props.projectKey || "");

const statusOptions = [
  { label: "Open", value: "open" }, { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" }, { label: "Reopened", value: "reopened" }
];
const severityOptions = [
  { label: "Critical", value: "critical" }, { label: "Major", value: "major" },
  { label: "Minor", value: "minor" }, { label: "Trivial", value: "trivial" }
];

// ──────────────────────────────────────────────────────────────────
//  Risk scoring (severity-weight × priority-weight · 1..16)
// ──────────────────────────────────────────────────────────────────
function riskScore(p: BugPriority | string, s: BugSeverity | string): number {
  const pw = PRIORITY_WEIGHT[p as BugPriority] ?? 1;
  const sw = SEVERITY_WEIGHT[s as BugSeverity] ?? 1;
  return pw * sw;
}
function riskOf(b: BugDocument): number {
  return riskScore(b.priority || "p3", b.severity || "trivial");
}
function riskTier(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 12) return "critical";
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

// ──────────────────────────────────────────────────────────────────
//  SLA Breach — now-reactive via useTimestamp. Every 60s tick reruns
//  so open bugs age on-screen without manual refresh (AC-R5).
// ──────────────────────────────────────────────────────────────────
function ageHoursOf(b: BugDocument): number {
  const created = b.createdAt || now.value;
  return Math.max(0, Math.floor((now.value - created) / 3600000));
}
function isSlaBreached(b: BugDocument): boolean {
  if (DONE_STATUSES.has(b.status)) return false;
  const sev = (b.severity || "trivial") as BugSeverity;
  return ageHoursOf(b) > SLA_HOURS[sev];
}
function ageLabelOf(b: BugDocument): string {
  const h = ageHoursOf(b);
  if (h < 1) return "<1h";
  if (h < 24) return `${h}h old`;
  const d = Math.floor(h / 24);
  return `${d}d old`;
}
// Per-bug reopen count — guaranteed number, surfaced as "Reopen ×N" pill
// in title cell + CSV column (AC-R7).
function reopenCountOf(b: BugDocument): number {
  return calcBugReopenCount(b);
}

// ──────────────────────────────────────────────────────────────────
//  Filter chips + Risk filter integration
// ──────────────────────────────────────────────────────────────────
type ChipTagType = 'success' | 'warning' | 'info' | 'primary' | 'danger';
const activeFilterChips = computed(() => {
  const chips: Array<{ key: string; label: string; type?: ChipTagType }> = [];
  for (const s of filterStatus.value) {
    const opt = statusOptions.find(o => o.value === s);
    chips.push({ key: `status:${s}`, label: `Status: ${opt?.label || s}` });
  }
  for (const s of filterSeverity.value) {
    const opt = severityOptions.find(o => o.value === s);
    chips.push({ key: `severity:${s}`, label: `Severity: ${opt?.label || s}`, type: "warning" });
  }
  if (filterAssignee.value) chips.push({ key: `assignee:${filterAssignee.value}`, label: `Assignee: ${filterAssignee.value}` });
  if (filterProject.value && !props.projectKey) chips.push({ key: `project:${filterProject.value}`, label: `Project: ${projectName(filterProject.value) || filterProject.value}` });
  if (filterRisk.value) {
    const map: Record<string, string> = {
      critical: "Risk: Critical (≥12)",
      high: "Risk: High (8–11)",
      medium: "Risk: Medium (4–7)",
      low: "Risk: Low (≤3)",
      sla: "SLA: Breached"
    };
    chips.push({ key: `risk:${filterRisk.value}`, label: map[filterRisk.value] || filterRisk.value, type: "danger" });
  }
  return chips;
});

function removeFilterChip(chip: { key: string; label: string }) {
  const [dim, val] = chip.key.split(":");
  if (dim === "status") filterStatus.value = filterStatus.value.filter(v => v !== val);
  else if (dim === "severity") filterSeverity.value = filterSeverity.value.filter(v => v !== val);
  else if (dim === "assignee") filterAssignee.value = "";
  else if (dim === "project") filterProject.value = "";
  else if (dim === "risk") filterRisk.value = "";
  proTable.value?.getTableList();
}

function clearAllFilters() {
  searchText.value = "";
  filterStatus.value = [];
  filterSeverity.value = [];
  filterAssignee.value = "";
  filterRisk.value = "";
  if (!props.projectKey) filterProject.value = "";
  proTable.value?.getTableList();
}

// ── Status helpers ──
const DONE_STATUSES = new Set(["resolved", "closed"]);
const OPEN_STATUSES = new Set(["open", "in_progress", "reopened"]);

// ──────────────────────────────────────────────────────────────────
//  Quick Stats + Resolve % + Stale
// ──────────────────────────────────────────────────────────────────
const resolvePct = computed(() => {
  const bugs = allBugs.value;
  if (!bugs.length) return 0;
  const resolved = bugs.filter(b => DONE_STATUSES.has(b.status)).length;
  return Math.round((resolved / bugs.length) * 100);
});
const quickStats = computed(() => {
  const bugs = allBugs.value;
  const open = bugs.filter(b => OPEN_STATUSES.has(b.status));
  const resolved = bugs.filter(b => DONE_STATUSES.has(b.status));
  const staleCount = open.filter(b => ageHoursOf(b) > 72).length;
  return [
    { key: "critical",     label: "Critical Open", value: open.filter(b => b.severity === "critical").length, level: "danger",  filter: { severity: "critical", open: true } },
    { key: "open",         label: "Open",          value: open.length,                                                          level: "warning", filter: { open: true } },
    { key: "in_progress",  label: "In Progress",   value: bugs.filter(b => b.status === "in_progress").length,                  level: "primary", filter: { status: "in_progress" } },
    { key: "stale",        label: "Stale (>3d)",   value: staleCount,                                                            level: "warning", filter: { stale: true } },
    { key: "resolved",     label: "Resolved",      value: resolved.length,                                                       level: "success", filter: { status: "resolved" } },
    { key: "rate",         label: "Resolve Rate",  value: resolvePct.value + "%",                                                  level: resolvePct.value >= 80 ? "success" : "warning", filter: {} }
  ];
});

function isStatActive(stat: { key: string; filter: Record<string, any> }): boolean {
  const f = stat.filter;
  if (f.open) return filterStatus.value.some(s => OPEN_STATUSES.has(s)) || (filterStatus.value.length === 0 && Object.keys(f).length === 1 && f.open);
  if (f.status) return filterStatus.value.includes(f.status);
  if (f.severity && !f.open) return filterSeverity.value.includes(f.severity);
  if (f.severity && f.open) return filterSeverity.value.includes(f.severity);
  if (f.stale) return filterRisk.value === "sla" || (filterRisk.value === "sla");
  return false;
}

function applyStatFilter(stat: { key: string; filter: Record<string, any> }) {
  const f = stat.filter;
  if (f.status === "resolved") {
    filterStatus.value = ["resolved", "closed"];
  } else if (f.status) {
    filterStatus.value = [f.status];
  } else if (f.open) {
    filterStatus.value = ["open", "reopened", "in_progress"];
  } else {
    filterStatus.value = [];
  }
  if (f.severity) filterSeverity.value = [f.severity];
  if (f.stale) filterRisk.value = "sla";
  proTable.value?.getTableList();
}

const assigneeOptions = computed(() => {
  const names = new Set<string>();
  for (const b of allBugs.value) { if (b.assignee) names.add(b.assignee); if (b.reporter) names.add(b.reporter); }
  return [...names].sort();
});

// ──────────────────────────────────────────────────────────────────
//  SRE SLO 指标（基于 sloMetrics.ts 统一引擎，可单测，跨列表/详情一致）
// ──────────────────────────────────────────────────────────────────
const sloResult = computed(() =>
  calcSloMetrics(allBugs.value, {
    now: now.value,
    windowMs: winMs.value,
    mttrTargetHours: MTTR_TARGET_HOURS,
    criticalSlaTargetPct: CRITICAL_SLA_TARGET_PCT,
    reopenTargetPct: REOPEN_RATE_TARGET_PCT,
    resolveOkPct: 80,
    resolveWarnPct: 50,
  })
);
const sloMttr = computed(() => sloResult.value.mttrP95);
const sloCriticalSla = computed(() => sloResult.value.criticalSlaPct);
const sloReopenRate = computed(() => sloResult.value.reopenRatePct);
const sloResolveRate = computed(() => sloResult.value.resolveRatePct);

// ──────────────────────────────────────────────────────────────────
//  Chart data
// ──────────────────────────────────────────────────────────────────
const CHART_DAYS = 30;

const severityDistribution = computed((): SeverityDistribution => {
  const dist: SeverityDistribution = { critical: 0, major: 0, minor: 0, trivial: 0 };
  for (const b of allBugs.value) { const s = (b.severity || "trivial") as keyof SeverityDistribution; if (s in dist) dist[s]++; }
  return dist;
});

const statusBreakdown = computed((): BugStatusBreakdown => {
  const dist: BugStatusBreakdown = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  for (const b of allBugs.value) {
    const s = (b.status || "open") as keyof BugStatusBreakdown;
    if (s in dist) dist[s]++; else (dist as Record<string, number>)[s] = 1;
  }
  return dist;
});

const bugAgeDistribution = computed((): BugAgeDistribution => {
  const now = Date.now();
  const buckets: BugAgeDistribution = { lt_1d: 0, "1_3d": 0, "3_7d": 0, "7_30d": 0, gt_30d: 0 };
  for (const b of allBugs.value) {
    if (DONE_STATUSES.has(b.status)) continue;
    const h = (now - (b.createdAt || now)) / 3600000;
    if (h < 24) buckets.lt_1d++; else if (h < 72) buckets["1_3d"]++; else if (h < 168) buckets["3_7d"]++; else if (h < 720) buckets["7_30d"]++; else buckets.gt_30d++;
  }
  return buckets;
});

function chartDates(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dates.push(d.toISOString().slice(0, 10)); }
  return dates;
}

const inflowOutflow = computed((): InflowOutflowData => {
  const dates = chartDates(CHART_DAYS);
  const inflow: Record<string, number> = {}; const outflow: Record<string, number> = {};
  for (const d of dates) { inflow[d] = 0; outflow[d] = 0; }
  for (const b of allBugs.value) {
    if (b.createdAt == null) continue;
    const cd = new Date(b.createdAt).toISOString().slice(0, 10);
    if (cd in inflow) inflow[cd]++;
    if (b.resolvedAt) { const rd = new Date(b.resolvedAt).toISOString().slice(0, 10); if (rd in outflow) outflow[rd]++; }
  }
  return { inflow: dates.map(d => ({ date: d, value: inflow[d] })), outflow: dates.map(d => ({ date: d, value: outflow[d] })) };
});

const mttrTrend = computed((): TrendDataPoint[] => {
  const dates = chartDates(CHART_DAYS);
  const buckets: Record<string, number[]> = {};
  for (const d of dates) buckets[d] = [];
  for (const b of allBugs.value) {
    if (!b.resolvedAt || !b.createdAt) continue;
    const rd = new Date(b.resolvedAt).toISOString().slice(0, 10);
    if (rd in buckets) buckets[rd].push((b.resolvedAt - b.createdAt) / 3600000);
  }
  return dates.map(d => { const vals = buckets[d]; return { date: d, value: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0 }; });
});

// ──────────────────────────────────────────────────────────────────
//  SPC I-MR Control Chart (T6) + Actionable Alerts Strip
//  NOTE: variable intentionally namespaced `spcCcAgg` instead of `cc`
//  — short 2-letter names like `cc` can clash with bundled analytics
//  helpers and produce an unreadable .value on render (undefined crash).
// ──────────────────────────────────────────────────────────────────
import type { ControlChartPoint as SpcCcPoint } from "@/types/analytics";
type SpcOutlier = { idx: number; value: number; date?: string };
interface SpcCcAgg {
  enough: boolean;
  ucl: number;
  lcl: number;
  mean: number;
  points: SpcCcPoint[];
  outliers: SpcOutlier[];
}
const SPC_CC_MIN_SAMPLES = 8;
const spcCcAgg = computed<SpcCcAgg>(() => {
  // Use daily MTTR mean points where there was at least one resolution. Filter
  // out zero-days (no bug resolved that day) so MR̄ isn't pulled toward zero.
  const series = mttrTrend.value
    .map(d => ({ date: d.date, value: d.value > 0 ? d.value : null as number | null, key: d.date }))
    .filter(s => s.value != null);
  if (series.length < SPC_CC_MIN_SAMPLES) {
    return { enough: false, ucl: 0, lcl: 0, mean: 0, points: [], outliers: [] };
  }
  const limits = calcControlLimits(series as Array<{ value: number | null; date: string; key?: string }>);
  const points: SpcCcPoint[] = series.map((s, i) => {
    const v = s.value!;
    // 5-point moving average (industry-standard MA for I-MR)
    const slice = series.slice(Math.max(0, i - 4), i + 1);
    const nums = slice.map(x => x.value!).filter(n => typeof n === "number" && !Number.isNaN(n));
    const ma = nums.length ? nums.reduce((a, c) => a + c, 0) / nums.length : null;
    return {
      issue_key: `mttr:${s.date}`,
      date: s.date,
      cycle_time: Math.round(v * 100) / 100,
      lead_time: Math.round(v * 100) / 100,
      moving_avg_5: ma == null ? null : Math.round(ma * 100) / 100,
    };
  });
  const outliers: SpcOutlier[] = limits.outliers.map(o => ({
    idx: o.idx,
    value: o.value,
    date: o.date,
  }));
  return {
    enough: true,
    ucl: Math.round(limits.ucl * 100) / 100,
    lcl: Math.round(limits.lcl * 100) / 100,
    mean: Math.round(limits.mean * 100) / 100,
    points,
    outliers,
  };
});
function applyDateFilter(date: string | undefined): void {
  if (!date) return;
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return;
  filterDate.value = d;
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info(`SPC outlier drill · filtering date ${date}`);
}

// ──────────────────────────────────────────────────────────────────
//  Risk Matrix + Age Matrix + OKR Impact
// ──────────────────────────────────────────────────────────────────
type RiskMatrix = Record<BugPriority, Record<BugSeverity, number>>;
function emptyRiskMatrix(): RiskMatrix {
  const m = {} as RiskMatrix;
  for (const p of PRIORITY_ORDER) { m[p] = {} as any; for (const s of SEVERITY_ORDER) m[p][s] = 0; }
  return m;
}
const riskMatrix = computed<RiskMatrix>(() => {
  const m = emptyRiskMatrix();
  for (const b of allBugs.value) {
    if (DONE_STATUSES.has(b.status)) continue;
    const p = (b.priority || "p3") as BugPriority;
    const s = (b.severity || "trivial") as BugSeverity;
    if (m[p] && m[p][s] != null) m[p][s]++;
  }
  return m;
});
function riskCellStyle(p: BugPriority, s: BugSeverity): Record<string, string> {
  const count = riskMatrix.value[p][s] || 0;
  const score = riskScore(p, s);
  const tier = riskTier(score);
  const base: Record<string, string> = {
    critical: "rgba(245,108,108,__a__)",
    high:     "rgba(230,162,60,__a__)",
    medium:   "rgba(64,158,255,__a__)",
    low:      "rgba(144,147,153,__a__)"
  };
  const alpha = Math.min(0.9, 0.22 + count * 0.08);
  const bg = base[tier].replace("__a__", alpha.toFixed(2));
  return { background: bg };
}
function applyMatrixFilter(p: BugPriority, s: BugSeverity) {
  filterSeverity.value = [s];
  filterPriority.value = [p];
  activeView.value = "table";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info(`Filtered: ${s.toUpperCase()} + ${p.toUpperCase()} · ${riskMatrix.value[p][s]} open bugs`);
}
// Hover tooltip: show the top 5 (key · title) so the team can triage
// without having to click in first (FR-E1).
function matrixCellKeys(p: BugPriority, s: BugSeverity, limit = 5): { key: string; title: string }[] {
  return allBugs.value
    .filter(b => !DONE_STATUSES.has(b.status) &&
      (b.priority || "p3") === p &&
      (b.severity || "trivial") === s,
    )
    .slice(0, limit)
    .map(b => ({ key: String(b.key ?? ""), title: String(b.title ?? "") }));
}
function matrixCellTooltip(p: BugPriority, s: BugSeverity): string {
  const keys = matrixCellKeys(p, s, 5);
  if (!keys.length) return "";
  const total = riskMatrix.value[p][s];
  const body = keys
    .map(({ key, title }) => `• ${key || "—"}  ${truncate(title, 56)}`)
    .join("\n");
  return `${total} bug${total === 1 ? "" : "s"} — top ${keys.length}:\n${body}`;
}
function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
// SLO Light strip drill-down actions (AC-U1 / FR-E1):
function goDrillSloMttr() {
  filterSeverity.value = [];
  filterPriority.value = [];
  filterStatus.value = [];
  filterRisk.value = "mttr";
  // Target bugs whose TTR/TTD exceeds the MTTR target hours. Use
  // calcBugPerf to find those consistently with sloMetrics engine.
  const _p = MTTR_TARGET_HOURS;
  const ids = new Set<string>();
  for (const b of allBugs.value) {
    const { mttrHours, ttdHours } = calcBugPerf(b, now.value);
    const h = mttrHours ?? ttdHours;
    if (h != null && h > _p) ids.add(b.key);
  }
  // Fallback: if the filter string "mttr" isn't handled in the global
  // filterFn below then we still provide an extra narrow via
  // additionalFilterFn (set up further down).
  _mttrDrillIds.value = ids;
  activeView.value = "table";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info(`SLO Drill · Bugs with TTR/TTD > ${_p}h (${ids.size})`);
}
function goDrillSloCriticalSla() {
  filterSeverity.value = ["critical"];
  filterPriority.value = [];
  filterStatus.value = [];
  filterRisk.value = "sla";
  _mttrDrillIds.value = new Set();
  activeView.value = "table";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info("SLO Drill · Critical + SLA breached (breachedCriticalIds below)");
}
function goDrillSloUnresolved() {
  filterSeverity.value = [];
  filterPriority.value = [];
  filterStatus.value = [...OPEN_STATUSES];
  filterRisk.value = "";
  _mttrDrillIds.value = new Set();
  activeView.value = "table";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info("SLO Drill · Unresolved open/in_progress/reopened");
}
const _mttrDrillIds = ref<Set<string>>(new Set());

type AgeMatrix = Record<BugSeverity, Record<AgeBucketKey, number>>;
function emptyAgeMatrix(): AgeMatrix {
  const m = {} as AgeMatrix;
  for (const s of SEVERITY_ORDER) { m[s] = {} as any; for (const b of AGE_BUCKETS) m[s][b.key] = 0; }
  return m;
}
const ageMatrix = computed<AgeMatrix>(() => {
  const m = emptyAgeMatrix();
  const now = Date.now();
  for (const b of allBugs.value) {
    if (DONE_STATUSES.has(b.status)) continue;
    const s = (b.severity || "trivial") as BugSeverity;
    const h = (now - (b.createdAt || now)) / 3600000;
    let bucket: AgeBucketKey = "gt_30d";
    for (const bk of AGE_BUCKETS) { if (h < bk.maxH) { bucket = bk.key; break; } }
    if (m[s]) m[s][bucket]++;
  }
  return m;
});
function isAgeBucketSlaBreached(s: BugSeverity, bucket: { key: string; maxH: number }): boolean {
  // A bucket is "breached" if its minimum possible age already exceeds SLA_HOURS[s]
  // For the last bucket (>30d), min = 30d which always breaches for any severity.
  // For others: the minimum hours = prev bucket's maxH.
  const idx = AGE_BUCKETS.findIndex(x => x.key === bucket.key);
  const minH = idx <= 0 ? 0 : AGE_BUCKETS[idx - 1].maxH;
  return minH > SLA_HOURS[s];
}
function ageCellStyle(count: number, s: BugSeverity, bucket: { key: string }): Record<string, string> {
  const alpha = Math.min(0.88, 0.18 + count * 0.07);
  // Color by severity-weight
  const tier = riskTier(riskScore("p1", s));
  const base: Record<string, string> = {
    critical: "rgba(245,108,108,__a__)",
    high:     "rgba(230,162,60,__a__)",
    medium:   "rgba(64,158,255,__a__)",
    low:      "rgba(144,147,153,__a__)"
  };
  return { background: base[tier].replace("__a__", alpha.toFixed(2)) };
}
function applyAgeFilter(s: BugSeverity, bucket: typeof AGE_BUCKETS[number]) {
  filterSeverity.value = [s];
  activeView.value = "table";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info(`Filtered: ${s.toUpperCase()} · age ${bucket.label} · ${ageMatrix.value[s][bucket.key]} bugs`);
}

// OKR Impact — window-aware + reopen uses reopenCount. Click handlers for
// each card are defined below (goOkrOpenCriticalP0, etc.) to drill down into
// the corresponding filter state (spec FR-E1 / AC-U4).
const okrImpact = computed(() => {
  const bugs = allBugs.value;
  const wkAgo = now.value - 7 * 86400000;
  const wStart = winMs.value == null ? -Infinity : now.value - winMs.value;
  return {
    openCriticalP0: bugs.filter(b =>
      OPEN_STATUSES.has(b.status) &&
      (b.severity === "critical" || b.priority === "p0") &&
      calcBugWindowAnchor(b) >= wStart,
    ).length,
    resolvedThisWeek: bugs.filter(b =>
      DONE_STATUSES.has(b.status) &&
      Math.max(b.resolvedAt || 0, b.closedAt || 0) >= Math.max(wkAgo, wStart),
    ).length,
    reopened: bugs.filter(b => calcBugReopenCount(b) >= 1 && calcBugWindowAnchor(b) >= wStart).length,
    unassignedOpen: bugs.filter(b =>
      OPEN_STATUSES.has(b.status) && !b.assignee && calcBugWindowAnchor(b) >= wStart,
    ).length,
  };
});

// ── OKR Impact · 下钻联动（FR-E1） ────────────────────────────────
function goOkrOpenCriticalP0() {
  filterSeverity.value = ["critical"];
  filterPriority.value = ["p0"];
  filterStatus.value = [...OPEN_STATUSES];
  filterAssignee.value = "";
  filterRisk.value = "";
  if (!props.projectKey) filterProject.value = "";
  nextTick(() => proTable.value?.getTableList());
  void loadAllBugs(true);
  ElMessage.info("OKR · Applied: Critical + P0 · Open statuses");
}
function goOkrResolvedThisWeek() {
  filterSeverity.value = [];
  filterPriority.value = [];
  filterStatus.value = [...DONE_STATUSES];
  filterRisk.value = "";
  // Shortcut to 7d window so the OKR card's 7-day intent is preserved.
  if (windowKey.value !== "7d") windowKey.value = "7d";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info("OKR · Applied: Resolved/Closed · Last 7d");
}
function goOkrReopened() {
  filterSeverity.value = [];
  filterPriority.value = [];
  filterStatus.value = [];
  filterRisk.value = "reopened";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info("OKR · Applied: Reopened bugs (reopenCount ≥ 1)");
}
function goOkrUnassignedOpen() {
  filterSeverity.value = [];
  filterPriority.value = [];
  filterStatus.value = [...OPEN_STATUSES];
  filterAssignee.value = "";
  filterRisk.value = "";
  nextTick(() => proTable.value?.getTableList());
  ElMessage.info("OKR · Applied: Unassigned · Open statuses");
}

// ──────────────────────────────────────────────────────────────────
//  Table columns
// ──────────────────────────────────────────────────────────────────
const columns = computed<ColumnProps<BugDocument>[]>(() => {
  const cols: ColumnProps<BugDocument>[] = [
    { type: "selection", width: 44 },
    { prop: "title", label: "Title", minWidth: 440 },
    { prop: "status", label: "Status", width: 110 },
    { prop: "severity", label: "Severity", width: 85 },
    { prop: "priority", label: "Priority", width: 75 },
    { prop: "type", label: "Type", width: 110 },
    { prop: "module", label: "Module", width: 120 },
    { prop: "assignee", label: "Assignee", width: 100 },
    { prop: "reporter", label: "Reporter", width: 90 },
    { prop: "createdAt", label: "Created · Age", width: 150 },
    { prop: "updatedAt", label: "Updated", width: 115 },
    { prop: "operation", label: "Actions", width: 170, fixed: "right" }
  ];
  if (!props.projectKey) cols.splice(9, 0, { prop: "project", label: "Project", width: 120 });
  return cols;
});

// Board view bugs (apply same filters as table best-effort)
const boardBugs = computed<BugDocument[]>(() => {
  let list = allBugs.value.slice();
  if (filterStatus.value.length) list = list.filter(b => filterStatus.value.includes(b.status));
  if (filterSeverity.value.length) list = list.filter(b => filterSeverity.value.includes(b.severity));
  if (filterPriority.value.length) list = list.filter(b => filterPriority.value.includes(b.priority as BugPriority));
  if (filterAssignee.value) list = list.filter(b => (b.assignee || "").toLowerCase().includes(filterAssignee.value.toLowerCase()));
  if (filterProject.value && !props.projectKey) list = list.filter(b => b.project_key === filterProject.value);
  if (props.projectKey) list = list.filter(b => b.project_key === props.projectKey);
  if (searchText.value) {
    const q = searchText.value.toLowerCase();
    list = list.filter(b => (`${b.title} ${b.module || ""}`.toLowerCase().includes(q)));
  }
  if (filterRisk.value === "sla") list = list.filter(b => isSlaBreached(b));
  else if (filterRisk.value === "reopened") list = list.filter(b => calcBugReopenCount(b) >= 1);
  else if (filterRisk.value === "mttr") list = list.filter(b => _mttrDrillIds.value.has(b.key));
  else if (filterRisk.value === "critical") list = list.filter(b => riskTier(riskOf(b)) === "critical");
  else if (filterRisk.value === "high") list = list.filter(b => riskTier(riskOf(b)) === "high");
  else if (filterRisk.value === "medium") list = list.filter(b => riskTier(riskOf(b)) === "medium");
  else if (filterRisk.value === "low") list = list.filter(b => riskTier(riskOf(b)) === "low");
  return list;
});

// ──────────────────────────────────────────────────────────────────
//  Fetch
// ──────────────────────────────────────────────────────────────────
function buildDateFilter(fd: string): Record<string, any> {
  if (!fd) return {};
  return { createdAtStart: new Date(fd + "T00:00:00").getTime(), createdAtEnd: new Date(fd + "T23:59:59").getTime() };
}

async function fetchBugs(params: any) {
  const { pageNum, pageSize } = params;
  const merged: any = { pageNum, pageSize };
  if (searchText.value) merged.title = searchText.value;
  if (filterStatus.value.length) merged.status = filterStatus.value.join(",");
  if (filterSeverity.value.length) merged.severity = filterSeverity.value.join(",");
  if (filterPriority.value.length) merged.priority = filterPriority.value.join(",");
  if (filterAssignee.value) merged.assignee = filterAssignee.value;
  if (filterProject.value && !props.projectKey) merged.project_key = filterProject.value;
  if (props.projectKey) merged.project_key = props.projectKey;
  const df = buildDateFilter(filterDateStr.value);
  if (df.createdAtStart) merged.createdAtStart = df.createdAtStart;
  if (df.createdAtEnd) merged.createdAtEnd = df.createdAtEnd;
  if (filterRisk.value === "sla") {
    // client-side filter: open + age hours > SLA → approximate via stale param
    merged.stale = 1;
  } else if (filterRisk.value === "reopened") {
    // client-side: getBugList 里 postFilterList 会过滤 calcBugReopenCount >=1，
    // 这里用 status=reopened 作为宽松的服务端前置条件，后续 client 二次过滤。
    if (!merged.status) merged.status = "reopened";
  } else if (filterRisk.value === "mttr") {
    // mttr 纯粹基于客户端 duration 计算，无法推送到后端。
    // 放宽搜索：包含所有状态，使用 postFilterList 中的 _mttrDrillIds 精确过滤。
  }
  loadAllBugs();
  const res = await getBugList(merged);
  // Apply risk tier client-side filter since backend doesn't support it yet
  if (filterRisk.value && filterRisk.value !== "sla") {
    const tier = filterRisk.value as "critical" | "high" | "medium" | "low";
    const rawList = ((res.data?.list as BugDocument[]) || []).filter(b => riskTier(riskOf(b)) === tier);
    res.data = { ...(res.data || {}), list: rawList, total: rawList.length } as any;
  }
  return res;
}

async function loadAllBugs(force = false) {
  try {
    // Prefer bugStore — only fetch when the cache is empty or when force=true
    // (polling / user-initiated refresh). The store also runs enrichBugList
    // so reopenCount + timeline are never undefined by the time computed run.
    if (force || !store.bugs.length) {
      await store.fetchBugs(force);
      markFresh();
    }
  } catch { /* best-effort */ }
}

async function refresh() {
  try {
    await loadAllBugs(true);
    proTable.value?.getTableList();
  } catch { /* swallow */ }
}

// Accessible label for the refresh button / Live badge tooltip.
const freshnessAriaLabel = computed(() => {
  const state = sseConnected ? "streaming" : (sseError ? "streaming failed, polling fallback" : "polling fallback");
  return `Bug list data: last refreshed ${ageLabel.value}. Connection state: ${state}. Click to refresh immediately.`;
});

// Sliding window tooltips — explain the anchor.
function windowTooltip(k: SloWindowKey): string {
  if (k === "all") return "Include every bug (no time window). Reopen rate is measured over the full dataset.";
  const win = SLO_WINDOWS.find(w => w.key === k)!;
  return `Last ${win.label}: anchor = max(created, lastReopen, updated, resolved). Reopened bugs always re-anchor.`;
}

// ──────────────────────────────────────────────────────────────────
//  Projects
// ──────────────────────────────────────────────────────────────────
const projects = computed(() => projectStore.projects);
function projectName(key: string): string { return projects.value.find(p => p.key === key)?.name ?? ""; }
function goProject(key: string) {
  const { link } = linkProject(key);
  router.push(link);
}

// ──────────────────────────────────────────────────────────────────
//  Selection + Batch
// ──────────────────────────────────────────────────────────────────
function onSelectionChange(rows: any[]) { selection.value = rows; }

async function handleBatchCommand(cmd: string) {
  const ids = selection.value.map((s: any) => s.key);
  if (!ids.length) return;
  if (cmd === "delete") {
    try {
      await ElMessageBox.confirm(`Delete ${ids.length} selected bug(s)? This action cannot be undone.`, "Batch Delete", {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonType: "danger",
        type: "warning"
      });
    } catch { return; }
    let failed = 0;
    for (const id of ids) {
      const bug = allBugs.value.find(b => b.key === id);
      if (!bug) continue;
      try { await store.handleDelete(bug, true); } catch { failed++; }
    }
    ElMessage.success(failed ? `Deleted ${ids.length - failed} bug(s), ${failed} failed` : `Deleted ${ids.length} bug(s)`);
  } else if (cmd === "assign") {
    try {
      const { value } = await ElMessageBox.prompt("Enter assignee name", "Batch Assign", { confirmButtonText: "Assign", inputPlaceholder: "Assignee name" });
      if (!value?.trim()) return;
      for (const id of ids) { try { await updateBug(id, { assignee: value.trim(), updatedAt: Date.now() } as any); } catch { /* continue */ } }
      ElMessage.success(`Assigned ${ids.length} bug(s) to ${value.trim()}`);
    } catch { /* cancelled */ return; }
  } else if (cmd === "status") {
    try {
      const { value } = await ElMessageBox.prompt("Enter target status (open, in_progress, resolved, closed, rejected, reopened)", "Batch Status Change", { confirmButtonText: "Change", inputPlaceholder: "e.g. resolved" });
      const s = value?.trim().toLowerCase(); if (!s) return;
      for (const id of ids) { try { await updateBug(id, { status: s, updatedAt: Date.now() } as any); } catch { /* continue */ } }
      ElMessage.success(`Changed ${ids.length} bug(s) to ${s}`);
    } catch { /* cancelled */ return; }
  } else if (cmd === "priority") {
    try {
      const { value } = await ElMessageBox.prompt("Set priority: p0 / p1 / p2 / p3", "Batch Priority", { confirmButtonText: "Apply", inputPlaceholder: "e.g. p1" });
      const s = value?.trim().toLowerCase(); if (!["p0","p1","p2","p3"].includes(s || "")) return;
      for (const id of ids) { try { await updateBug(id, { priority: s as BugPriority, updatedAt: Date.now() } as any); } catch { /* continue */ } }
      ElMessage.success(`Set ${ids.length} bug(s) priority to ${s}`);
    } catch { /* cancelled */ return; }
  }
  proTable.value?.getTableList(); loadAllBugs();
}

// ──────────────────────────────────────────────────────────────────
//  Status transitions
// ──────────────────────────────────────────────────────────────────
const STATUS_TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
  open: [{ value: "in_progress", label: "Start Progress" }, { value: "resolved", label: "Resolve" }, { value: "closed", label: "Close" }, { value: "rejected", label: "Reject" }],
  in_progress: [{ value: "resolved", label: "Resolve" }, { value: "closed", label: "Close" }, { value: "rejected", label: "Reject" }, { value: "reopened", label: "Reopen" }],
  resolved: [{ value: "closed", label: "Close" }, { value: "reopened", label: "Reopen" }],
  closed: [{ value: "reopened", label: "Reopen" }],
  rejected: [{ value: "open", label: "Reopen" }, { value: "in_progress", label: "Start Progress" }],
  reopened: [{ value: "in_progress", label: "Start Progress" }, { value: "resolved", label: "Resolve" }, { value: "closed", label: "Close" }]
};
function quickStatuses(current: string) { return STATUS_TRANSITIONS[current] || []; }

async function quickChangeStatus(bug: BugDocument, newStatus: string) {
  try {
    await updateBug(bug.key, { status: newStatus, updatedAt: Date.now() } as any);
    ElMessage.success(`Bug ${bug.key} → ${newStatus}`);
    proTable.value?.getTableList(); loadAllBugs();
  } catch (e: any) { ElMessage.error(e?.message || "Status change failed"); }
}
async function quickChangeStatusByKey(key: string, newStatus: string) {
  const bug = allBugs.value.find(b => b.key === key);
  if (bug) await quickChangeStatus(bug, newStatus);
}

async function handleDeleteRow(bug: BugDocument) {
  deletingKeys.value.add(bug.key);
  try {
    await store.handleDelete(bug, true);
    proTable.value?.getTableList(); loadAllBugs();
  } finally {
    deletingKeys.value.delete(bug.key);
  }
}

// ──────────────────────────────────────────────────────────────────
//  Navigation / Preview / Edit
// ──────────────────────────────────────────────────────────────────
function goDetail(key: string) {
  const r = linkBug(key);
  router.push(r.link);
}
function openEdit(bug: BugDocument) { dialogRef.value?.openEdit(bug); }

const titlePreviewRef = ref<{
  openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void;
} | null>(null);
async function openTitlePreview(bug: BugDocument) {
  let content = "";
  if (bug.contentPath) {
    try { const res = await readKnowledgeFile(bug.contentPath); content = res.content || ""; }
    catch { try { const c = await readBugContent(bug); content = c.description || ""; } catch { /* use empty */ } }
  }
  titlePreviewRef.value?.openFile({ path: bug.contentPath || "", title: bug.title, content, onSave: async () => {} });
}

// ──────────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────────
// Reopen pill severity mapping — higher counts warrant more attention.
function reopenTagType(n: number): "danger" | "warning" | "primary" | "info" {
  if (n >= 3) return "danger";
  if (n === 2) return "warning";
  return "primary";
}
function typeTagColor(t: string): "danger" | "warning" | "primary" | "info" {
  const map: Record<string, "danger" | "warning" | "primary" | "info"> = {
    functional: "danger", logic: "danger", performance: "warning", ui: "primary",
    style: "primary", security: "danger", compatibility: "warning", regression: "info", data: "info", other: "info"
  };
  return map[t] || "info";
}

function exportCSV() {
  const bugs = allBugs.value;
  if (!bugs.length) { ElMessage.info("No bugs to export"); return; }
  // AC-R7 · 追加3列 SRE Perf 字段： mttrHours / reopenCount / slaWindowStartAt
  const headers = [
    "Key", "Risk", "Title", "Type", "Severity", "Priority", "Status",
    "SLA Breached", "Age(h)", "Assignee", "Reporter", "Module", "Project", "Updated",
    "MTTR(h)", "ReopenCount", "SLAWindowStartAt"
  ];
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const winStartAt = winMs.value == null ? "" : formatAbsolute(now.value - winMs.value);
  const rows = bugs.map(b => {
    const perf = calcBugPerf(b, now.value);
    return [
      b.key, String(riskOf(b)), b.title, b.type, b.severity, b.priority, b.status,
      isSlaBreached(b) ? "YES" : "no", String(ageHoursOf(b)),
      b.assignee || "", b.reporter || "", b.module || "", b.project || "", formatAbsolute(b.updatedAt),
      perf.mttrHours == null ? "" : String(perf.mttrHours),
      String(reopenCountOf(b)),
      winStartAt,
    ].map(escape).join(",");
  });
  const csv = ["\uFEFF" + headers.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `bugs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(`Exported ${rows.length} bugs · Risk + SLA + MTTR+Reopen+SLA window included`);
}

function onSaved() {
  proTable.value?.getTableList();
  loadAllBugs();
}

// ──────────────────────────────────────────────────────────────────
//  快捷键契约  ⌘N / ⌘K / ⌘D / ⌥1 ⌥2 ⌥3
// ──────────────────────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey;
  const alt = e.altKey;
  if (meta && e.key.toLowerCase() === "n") {
    e.preventDefault();
    store.openCreateDialog(props.projectKey ? projectName(props.projectKey) : "", props.projectKey || "");
    return;
  }
  if (meta && e.key.toLowerCase() === "k") {
    // Don't hijack browser's default if inside input
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    e.preventDefault();
    searchInputRef.value?.focus?.();
    return;
  }
  if (meta && e.key.toLowerCase() === "d") {
    e.preventDefault();
    analyticsOpen.value = !analyticsOpen.value;
    return;
  }
  if (alt && !meta && (e.key === "1" || e.key === "2" || e.key === "3")) {
    e.preventDefault();
    if (e.key === "1") activeView.value = "table";
    if (e.key === "2") activeView.value = "board";
    if (e.key === "3") activeView.value = "matrix";
  }
}

// ──────────────────────────────────────────────────────────────────
//  Lifecycle
// ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  const q = route.query;
  if (typeof q.status === "string" && q.status) filterStatus.value = q.status.split(",");
  if (typeof q.severity === "string" && q.severity) filterSeverity.value = [q.severity];
  if (typeof q.view === "string" && ["table", "board", "matrix"].includes(q.view)) activeView.value = q.view as any;
  projectStore.fetchProjects({ pageSize: 100 });
  await loadAllBugs();
  window.addEventListener("keydown", onKeydown);
  bag.addFn(() => window.removeEventListener("keydown", onKeydown));
});

onBeforeUnmount(() => bag.dispose());

watch(filterDateStr, () => { loadAllBugs(); proTable.value?.getTableList(); });
watch(() => props.projectKey, () => { filterProject.value = props.projectKey || ""; loadAllBugs(); proTable.value?.getTableList(); });
</script>

<style scoped lang="scss">
@use "./styles/bug.scss";
</style>
