<template>
  <div>
    <div v-if="filterDate" class="do-date-banner">
      <el-icon><Calendar /></el-icon>
      <span>{{ $t("project.detail.dateBanner.showing", { date: filterDateLabel }) }}</span>
      <el-button size="small" text type="primary" @click="clearFilterDate">{{ $t("project.detail.dateBanner.clear") }}</el-button>
    </div>

    <!-- Project Summary -->
    <div class="do-card">
      <div class="do-summary">
        <div class="do-summary__main">
          <h2 class="do-summary__name">{{ project?.name }}</h2>
          <p class="do-summary__desc">{{ project?.description || $t("project.overview.summary.noDesc") }}</p>
          <div class="do-summary__meta">
            <span v-if="project?.status" class="do-summary__status" :class="`is-${project?.status}`">
              {{ project?.status === "archived" ? $t("project.dialog.statusArchived") : $t("project.dialog.statusActive") }}
            </span>
            <span class="do-summary__item">
              <el-icon :size="12"><Document /></el-icon>
              {{ prdCount }} {{ $t("project.overview.stats.prds") }}
            </span>
            <span class="do-summary__item">
              <el-icon :size="12"><Grid /></el-icon>
              {{ ykModules.length }} {{ $t("project.overview.stats.devs") }}
            </span>
            <span class="do-summary__item">
              <el-icon :size="12"><Checked /></el-icon>
              {{ testSpecs.length }} {{ $t("project.overview.stats.tests") }}
            </span>
            <span v-if="okrSummary.totalGoals" class="do-summary__item">
              <el-icon :size="12"><Aim /></el-icon>
              {{ okrSummary.completedCount }}/{{ okrSummary.totalGoals }} Goals
            </span>
          </div>
        </div>
        <div v-if="okrSummary.totalGoals" class="do-summary__okr">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--el-border-color-light)" stroke-width="5" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              :stroke="okrSummary.avgProgress >= 100 ? 'var(--el-color-success)' : 'var(--el-color-primary)'"
              stroke-width="5"
              stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 28"
              :stroke-dashoffset="2 * Math.PI * 28 * (1 - okrSummary.avgProgress / 100)"
              transform="rotate(-90 32 32)"
            />
            <text x="32" y="34" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">
              {{ okrSummary.avgProgress }}%
            </text>
          </svg>
          <span class="do-summary__okr-label">{{ $t("project.overview.okr.title") }}</span>
        </div>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="do-stats-strip">
      <button
        v-for="tile in statTiles"
        :key="tile.key"
        class="do-stat-tile"
        :class="`do-stat-tile--${tile.variant}`"
        :disabled="!tile.clickable"
        @click="tile.onClick?.()"
      >
        <span class="do-stat-tile__value">{{ tile.value }}<small v-if="tile.suffix">{{ tile.suffix }}</small></span>
        <span class="do-stat-tile__label">{{ tile.label }}</span>
        <span v-if="tile.sub" class="do-stat-tile__sub">{{ tile.sub }}</span>
      </button>
    </div>

    <!-- Bug severity breakdown -->
    <div class="do-card">
      <el-alert
        v-if="knowledgeDegraded"
        type="info"
        :closable="true"
        class="do-degrade-alert"
        :title="$t('project.overview.degraded.knowledge')"
        description=""
        show-icon
      />
      <div v-if="bugSevBars.length" class="do-card__head-row">
        <h3 class="do-card__title">{{ $t("project.overview.bugSeverity.title") }}</h3>
        <span class="do-card__head-sub">{{ $t("project.overview.bugSeverity.openCount", { n: openBugCount }) }}</span>
      </div>
      <div v-if="bugSevBars.length" class="do-bug-sev-bars">
        <div v-for="bar in bugSevBars" :key="bar.label" class="do-bug-sev-row">
          <span class="do-bug-sev__label">{{ bar.label }}</span>
          <div class="do-bug-sev__track">
            <div class="do-bug-sev__fill" :class="bar.cls" :style="{ width: bar.pct + '%' }" />
          </div>
          <span class="do-bug-sev__val">{{ bar.count }}</span>
        </div>
      </div>
      <div v-else-if="knowledgeDegraded" class="do-degrade-placeholder">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ $t("project.overview.degraded.bugSeverityEmpty") }}</span>
      </div>
    </div>

    <!-- Data quality -->
    <div v-if="dataQualityIssues.length" class="do-card">
      <div class="do-card__head-row">
        <h3 class="do-card__title">{{ $t("project.overview.dataQuality.title") }}</h3>
        <span class="do-card__head-sub">{{ $t("project.overview.dataQuality.summary", { n: dataQualityTotal }) }}</span>
      </div>
      <div class="do-dq-grid">
        <div v-for="dq in dataQualityIssues" :key="dq.key" class="do-dq-item" :class="'do-dq-item--' + dq.severity" @click="router.push('/issue')">
          <el-icon :size="16"><component :is="dq.icon" /></el-icon>
          <span class="do-dq-item__count">{{ dq.count }}</span>
          <span class="do-dq-item__label">{{ dq.label }}</span>
        </div>
      </div>
    </div>

    <!-- WIP Breakdown -->
    <div v-if="wipTotal > 0" class="do-card">
      <div class="do-card__head-row">
        <h3 class="do-card__title">{{ $t("project.overview.wip.title") }}</h3>
        <span class="do-card__head-sub">{{ $t("project.overview.wip.totalItems", { n: wipTotal }) }}</span>
      </div>
      <div class="do-wip-bars">
        <div v-for="w in wipBars" :key="w.status" class="do-wip-row">
          <span class="do-wip-row__label">{{ w.label }}</span>
          <div class="do-wip-row__track">
            <div class="do-wip-row__fill" :style="{ width: w.pct + '%', background: w.color }" />
          </div>
          <span class="do-wip-row__count">{{ w.count }}</span>
        </div>
      </div>
    </div>

    <!-- Due health -->
    <div v-if="dueItems.length" class="do-card">
      <div class="do-card__head-row">
        <h3 class="do-card__title">{{ $t("project.overview.dueHealth.title") }}</h3>
        <span class="do-card__head-sub">{{ $t("project.overview.dueHealth.summary", { upcoming: dueUpcoming, overdue: dueOverdue }) }}</span>
      </div>
      <div class="do-due-list">
        <div v-for="item in dueItems" :key="item.key" class="do-due-item" :class="{ 'is-overdue': item.isOverdue }" @click="openFile(item.path!)">
          <span class="do-due-item__dot" :class="item.isOverdue ? 'is-overdue' : 'is-upcoming'" />
          <span class="do-due-item__title">{{ item.title }}</span>
          <span class="do-due-item__date" :class="{ 'is-overdue': item.isOverdue }">{{ item.dueLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Recently Completed -->
    <div v-if="recentlyCompleted.length" class="do-card">
      <div class="do-card__head-row">
        <h3 class="do-card__title">{{ $t("project.overview.recentlyCompleted.title") }}</h3>
      </div>
      <div class="do-recent-list">
        <div v-for="item in recentlyCompleted" :key="item.key" class="do-recent-item" @click="openIssueDetail(item.key)">
          <span class="do-recent-item__check"><el-icon :size="14"><Check /></el-icon></span>
          <span class="do-recent-item__title">{{ item.title }}</span>
          <span class="do-recent-item__time">{{ item.timeAgo }}</span>
        </div>
      </div>
    </div>

    <!-- README.md -->
    <div class="do-card do-card--flush">
      <div class="do-card__head">
        <el-icon class="do-card__icon"><Document /></el-icon>
        <span>README.md</span>
        <div class="do-card__head-right">
          <el-button v-if="descContent" link size="small" type="primary" :icon="Edit" @click="openDescDialog">{{
            $t("project.overview.readme.edit")
          }}</el-button>
          <el-button v-else link size="small" type="primary" @click="openDescDialog">{{
            $t("project.overview.readme.add")
          }}</el-button>
        </div>
      </div>
      <div class="do-card__body">
        <!-- 细粒度骨架：readmeLoading 时展示，不再占用全局 loading -->
        <template v-if="readmeLoading && !descContent">
          <div class="do-readme-skeleton">
            <span class="do-readme-skel do-readme-skel--line is-long" />
            <span class="do-readme-skel do-readme-skel--line" />
            <span class="do-readme-skel do-readme-skel--line is-short" />
            <span class="do-readme-skel do-readme-skel--line" />
            <span class="do-readme-skel do-readme-skel--line is-short" />
          </div>
        </template>
        <template v-else>
          <div
            v-if="descContent"
            ref="descPreviewRef"
            class="do-desc-preview"
            :class="{ 'is-clamped': !descExpanded }"
            v-html="descHtml"
          />
          <div v-if="descContent && descOverflows" class="do-desc-mask" :class="{ 'is-hidden': descExpanded }" />
          <el-button
            v-if="descContent && descOverflows"
            link
            size="small"
            type="primary"
            class="do-desc-toggle"
            @click="descExpanded = !descExpanded"
          >
            {{ descExpanded ? $t("project.overview.readme.collapse") : $t("project.overview.readme.expand") }}
            <el-icon><component :is="descExpanded ? ArrowUp : ArrowDown" /></el-icon>
          </el-button>
          <div v-if="!descContent" class="do-empty">
            <el-icon class="do-empty__icon"><Document /></el-icon>
            <p class="do-empty__text">{{ $t("project.overview.readme.noFile") }}</p>
            <p class="do-empty__hint">{{ $t("project.overview.readme.noFileHint") }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- OKR Progress -->
    <div class="do-card">
      <el-alert
        v-if="knowledgeDegraded"
        type="info"
        :closable="true"
        class="do-degrade-alert"
        :title="$t('project.overview.degraded.knowledge')"
        description=""
        show-icon
      />
      <template v-if="okrGoals.length">
        <div class="do-card__head-row">
          <h3 class="do-card__title">{{ $t("project.overview.okr.title") }}</h3>
          <span class="do-card__head-sub">
            {{ $t("project.overview.okr.summary", { done: okrSummary.completedCount, total: okrSummary.totalGoals, pct: okrSummary.avgProgress }) }}
          </span>
        </div>
        <div class="do-okr-grid">
          <div
            v-for="goal in okrGoals"
            :key="goal.id"
            class="do-okr-card"
            :class="{ 'is-done': goal.progress >= 100 }"
            @click="openFile(goal.path)"
          >
            <div class="do-okr-card__head">
              <span class="do-okr-card__id">{{ goal.id }}</span>
              <span class="do-okr-card__pct" :class="{ 'is-done': goal.progress >= 100 }">{{ goal.progress }}%</span>
            </div>
            <div class="do-okr-card__title">{{ goal.title }}</div>
            <div class="do-okr-card__bar">
              <div class="do-okr-card__fill" :style="{ width: goal.progress + '%' }" />
            </div>
            <div class="do-okr-card__meta">
              <span>{{ goal.krCount }} KRs</span>
              <span v-if="goal.metricCount"> · {{ goal.metricCount }} Metrics</span>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="knowledgeDegraded" class="do-degrade-placeholder">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ $t("project.overview.degraded.okrEmpty") }}</span>
      </div>
    </div>

    <!-- Document Directory -->
    <div class="do-card">
      <el-alert
        v-if="knowledgeDegraded"
        type="info"
        :closable="true"
        class="do-degrade-alert"
        :title="$t('project.overview.degraded.knowledge')"
        description=""
        show-icon
      />
      <div class="do-card__head-row">
        <h3 class="do-card__title">{{ $t("project.overview.docs.title") }}</h3>
        <div class="do-docs-tabs">
          <button
            v-for="dt in docTabs"
            :key="dt.key"
            class="do-docs-tab"
            :class="{ 'is-active': docTab === dt.key }"
            @click="docTab = dt.key"
          >
            {{ dt.label }}
            <span class="do-docs-tab__count">{{ dt.count }}</span>
          </button>
        </div>
      </div>
      <div v-if="docTabItems.length" class="do-docs-list">
        <div
          v-for="item in docTabItems.slice(0, docLimit)"
          :key="item.path"
          class="do-docs-item"
        >
          <div class="do-docs-item__row" @click="openFile(item.path)">
            <span class="do-docs-item__seq">{{ item.seq }}</span>
            <span class="do-docs-item__status" :style="{ background: statusColor(item.status), color: '#fff' }">{{ statusLabel(item.status) }}</span>
            <span class="do-docs-item__title">{{ item.title }}</span>
            <span v-if="item.owner" class="do-docs-item__owner">{{ item.owner }}</span>
            <span v-if="item.estimate" class="do-docs-item__est">{{ item.estimate }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="knowledgeDegraded" class="do-docs-empty">{{ $t("project.overview.degraded.docsEmpty") }}</div>
      <div v-else class="do-docs-empty">{{ $t("project.overview.docs.empty") }}</div>
      <button
        v-if="docTabItems.length > docLimit"
        class="do-docs-toggle"
        @click="docLimit = docTabItems.length"
      >
        {{ $t("project.overview.docs.showAll", { n: docTabItems.length }) }}
        <el-icon><ArrowDown /></el-icon>
      </button>
    </div>

    <!-- Activity + Todo two-column row -->
    <div class="do-row">
      <ActivityTimeline
        :all-issues="allIssues"
        :all-bugs="allBugs"
        :all-modules="allModules"
        :knowledge-files="knowledgeFiles"
        :project-key="project?.key || ''"
        :filter-date-str="filterDateStr"
        :now="now"
        :loading="loading"
        :last-updated="lastUpdated"
        :updated-ago="updatedAgo"
        @refresh="retry"
        @item-click="handleActivityClick"
      />

      <!-- Todo List (right) -->
      <div class="do-card do-row__right">
        <div class="do-card__head-row">
          <h3 class="do-card__title">{{ $t("project.overview.todo.title") }}</h3>
          <span v-if="todoItems.length" class="do-todo-count">{{ filteredTodoCount }}</span>
          <span v-if="todoOverdueCount" class="do-todo-overdue-badge">
            <el-icon><Warning /></el-icon>
            {{ todoOverdueCount }} {{ $t("project.overview.todo.overdue") }}
          </span>
          <div class="do-todo-toggle">
            <button class="do-todo-toggle__btn" :class="{ 'is-active': todoPriority === 'high' }" @click="todoPriority = 'high'">
              P0-P1
              <span class="do-todo-toggle__count">{{ highPriorityCount }}</span>
            </button>
            <button class="do-todo-toggle__btn" :class="{ 'is-active': todoType === 'issues' && todoPriority === 'all' }" @click="todoType = 'issues'; todoPriority = 'all'">
              {{ $t("project.overview.todo.requirement") }}
              <span class="do-todo-toggle__count">{{ issueTodoCount }}</span>
            </button>
            <button class="do-todo-toggle__btn" :class="{ 'is-active': todoType === 'dev' && todoPriority === 'all' }" @click="todoType = 'dev'; todoPriority = 'all'">
              {{ $t("project.overview.todo.toggleDev") }}
              <span class="do-todo-toggle__count">{{ devTodoCount }}</span>
            </button>
            <button class="do-todo-toggle__btn" :class="{ 'is-active': todoType === 'test' && todoPriority === 'all' }" @click="todoType = 'test'; todoPriority = 'all'">
              {{ $t("project.overview.todo.toggleTest") }}
              <span class="do-todo-toggle__count">{{ testTodoCount }}</span>
            </button>
            <button class="do-todo-toggle__btn" :class="{ 'is-active': todoType === 'all' && todoPriority === 'all' }" @click="todoType = 'all'; todoPriority = 'all'">
              {{ $t("project.overview.todo.toggleAll") }}
              <span class="do-todo-toggle__count">{{ todoItems.length }}</span>
            </button>
          </div>
        </div>
        <div v-if="todoStats.devTotal" class="do-todo-progress">
          <div class="do-todo-progress__bar">
            <div
              class="do-todo-progress__seg is-done"
              :style="{ width: (todoStats.done / todoStats.devTotal * 100) + '%' }"
            />
            <div
              v-if="todoStats.inProgress"
              class="do-todo-progress__seg is-active"
              :style="{ width: (todoStats.inProgress / todoStats.devTotal * 100) + '%' }"
            />
            <div
              v-if="todoStats.pending"
              class="do-todo-progress__seg is-pending"
              :style="{ width: (todoStats.pending / todoStats.devTotal * 100) + '%' }"
            />
          </div>
          <span class="do-todo-progress__text">
            {{ todoStats.done }}/{{ todoStats.devTotal }} {{ $t("project.overview.todo.completed") }}
            <template v-if="todoStats.inProgress"> · {{ todoStats.inProgress }} {{ $t("project.overview.todo.inProgress") }}</template>
            <template v-if="todoStats.p0 || todoStats.p1">
              · <span class="do-todo-progress__prio">P0: {{ todoStats.p0 }}</span>
              <template v-if="todoStats.p1"> <span class="do-todo-progress__prio-p1">P1: {{ todoStats.p1 }}</span></template>
            </template>
            · {{ $t("project.overview.todo.toggleTest") }}: {{ todoStats.testsDone }}/{{ todoStats.testTotal }}
          </span>
        </div>

        <!-- loading -->
        <div v-if="todoLoading && !todoItems.length" class="do-todo-skeleton">
          <div v-for="n in 4" :key="n" class="do-todo-skel-item">
            <span class="do-todo-skel-bar" />
            <span class="do-todo-skel-line" />
          </div>
        </div>

        <!-- empty -->
        <div v-else-if="!todoLoading && !todoItems.length" class="do-todo-empty">
          <div class="do-todo-empty__icon">
            <el-icon><Check /></el-icon>
          </div>
          <p class="do-todo-empty__text">{{ $t("project.overview.todo.empty") }}</p>
        </div>

        <!-- items -->
        <div v-else class="do-todo-list">
          <template v-for="(group, gIdx) in todoGroups" :key="gIdx">
            <div class="do-todo-group" :class="{ 'do-todo-group--last': gIdx === todoGroups.length - 1 }">
              <div class="do-todo-group-label">
                <span class="do-todo-group-dot" :style="{ background: groupColor(group.label) }" />
                {{ group.label }}
                <span class="do-todo-group-count">{{ group.items.length }}</span>
              </div>
              <div
                v-for="item in group.items"
                :key="item.id"
                class="do-todo-item"
                :class="{ 'is-overdue': item.isOverdue, 'is-updating': updatingKeys.has(item.id) }"
                @click="handleTodoClick(item)"
              >
                <div class="do-todo-item__accent" :style="{ background: todoAccentColor(item) }" />
                <div class="do-todo-item__body">
                  <div class="do-todo-item__title">
                    <span class="do-todo-item__type-badge" :style="{ background: todoAccentColor(item), color: '#fff' }">
                      {{ item.issueTypeLabel }}
                    </span>
                    {{ item.target }}
                    <span v-if="item.prdRef" class="do-todo-item__prd-ref">← {{ shortPrdRef(item.prdRef) }}</span>
                  </div>
                  <div class="do-todo-item__meta">
                    <span v-if="item.estimate" class="do-todo-item__estimate">{{ item.estimate }}</span>
                    <span v-if="item.priorityLabel" class="do-todo-item__prio">
                      <span class="do-todo-item__prio-dot" :style="{ background: item.priorityColor }" />
                      {{ item.priorityLabel }}
                    </span>
                    <span v-if="item.assignee" class="do-todo-item__assignee">{{ item.assignee }}</span>
                    <span v-if="item.dueDate" class="do-todo-item__due" :class="{ 'is-overdue': item.isOverdue }">{{
                      item.dueDate
                    }}</span>
                    <span v-if="!item.assignee && !item.dueDate && !item.priorityLabel && !item.estimate" class="do-todo-item__due">&mdash;</span>
                  </div>
                  <div v-if="item.filePath" class="do-todo-item__links">
                    <span
                      v-if="getLinkedDev(item.filePath)"
                      class="do-todo-item__link do-todo-item__link--dev"
                      @click.stop="openLinkFile(getLinkedDev(item.filePath)!)"
                    >🔧 开发方案</span>
                    <span
                      v-if="getLinkedTest(item.filePath)"
                      class="do-todo-item__link do-todo-item__link--test"
                      @click.stop="openLinkFile(getLinkedTest(item.filePath)!)"
                    >🧪 测试规格</span>
                  </div>
                </div>
                <div class="do-todo-item__actions" @click.stop>
                  <el-tooltip :content="$t('project.overview.todo.start')" :show-after="600" placement="top">
                    <button
                      class="do-todo-act do-todo-act--start"
                      :disabled="updatingKeys.has(item.id)"
                      @click="transitionTodo(item, 'start')"
                    >
                      <el-icon><VideoPlay /></el-icon>
                    </button>
                  </el-tooltip>
                  <el-tooltip
                    :content="item.type === 'bug' ? $t('project.overview.todo.resolve') : $t('project.overview.todo.complete')"
                    :show-after="600"
                    placement="top"
                  >
                    <button
                      class="do-todo-act do-todo-act--done"
                      :disabled="updatingKeys.has(item.id)"
                      @click="transitionTodo(item, 'complete')"
                    >
                      <el-icon><Check /></el-icon>
                    </button>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Calendar, Document, Edit, ArrowUp, ArrowDown, VideoPlay, Check, Grid, Checked, Aim, Warning, Flag, User, Timer, Collection, PriceTag, InfoFilled } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useNow } from "@/hooks/useNow";
import { readProjectFile, type ProjectFileError } from "@/api/modules/fileService";
import { getIssueFilePath, updateIssue } from "@/api/modules/issueService";
import { useDateFilter } from "@/hooks/useDateFilter";
import { formatRelativeTime } from "@/utils/datetime";
import { timeAgo } from "@/utils/time";
import { DisposerBag } from "@/utils/disposer";
import { typedGet, typedSet } from "@/utils/reliability/pdCache";
import {
  pushReliabilityEvent,
  classifyReliabilityError
} from "@/utils/reliability/reliabilityMetrics";
import { PREVIEW_DLG_KEY, useProjectDetail, type ActivityItem } from "@/views/project/types";
import { activityColor } from "@/views/project/composables/useProjectStats";
import { PRIORITY_COLORS } from "@/views/project/constants";
import { ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP } from "@/api/modules/issueService";
import { BUG_PRIORITY_MAP, updateBug } from "@/api/modules/bug";
import { useYiKnowledgeModules } from "@/views/project/composables/useYiKnowledgeModules";
import { useTestSpecs } from "@/views/project/composables/useTestSpecs";
import ActivityTimeline from "@/views/project/components/ActivityTimeline.vue";

const { t } = useI18n();
const router = useRouter();

const { renderWithHtml } = useMarkdown();

const ctx = useProjectDetail();
const previewDlg = inject(PREVIEW_DLG_KEY, null);

const {
  allIssues,
  allBugs,
  allModules,
  knowledgeFiles,
  filterDate,
  filterDateStr,
  project,
  clearFilterDate,
  lastUpdated,
  loading,
  retry,
  navigateTab,
  stageStatus
} = ctx;

// ── 区块级降级 ──
const knowledgeDegraded = computed(
  () => stageStatus?.value.knowledge === "failed" || stageStatus?.value.knowledge === "circuit-open" || stageStatus?.value.knowledge === "degraded"
);
const issuesDegraded = computed(
  () => stageStatus?.value.issues === "failed" || stageStatus?.value.issues === "circuit-open" || stageStatus?.value.issues === "degraded"
);
const modulesDegraded = computed(
  () => stageStatus?.value.modules === "failed" || stageStatus?.value.modules === "circuit-open" || stageStatus?.value.modules === "degraded"
);

// ── Todo data (derived from injected allIssues/allBugs — no separate API calls) ──
const todoRequirements = computed(() => allIssues.value.filter(i => i.issue_type !== "bug" && (i.status === "backlog" || i.status === "todo")));
const todoBugs = computed(() => allBugs.value.filter(b => b.status === "open" || b.status === "reopened"));
const todoLoading = computed(() => loading.value);

// YiKnowledge dev tasks & test specs
const { items: ykModules, deriveFrom: deriveModules } = useYiKnowledgeModules();
const { items: testSpecs, deriveFrom: deriveTests } = useTestSpecs();
watch(() => knowledgeFiles.value, files => {
  const key = project.value?.key;
  if (key && files.length) { deriveModules(files, key); deriveTests(files, key); }
}, { immediate: true });

const PENDING_DEV_STATUS = new Set(["待开始", "需求已编写", "进行中", "planned", "in_progress"]);
const PENDING_TEST_STATUS = new Set(["待开始", "planned"]);
const todoDevs = computed(() => ykModules.value.filter(m => PENDING_DEV_STATUS.has(m.status)));
const todoTests = computed(() => testSpecs.value.filter(t => PENDING_TEST_STATUS.has(t.status)));

const { label: filterDateLabel } = useDateFilter(filterDate);
const now = useNow(30_000);

const updatedAgo = computed(() => formatRelativeTime(lastUpdated.value, now.value));

// ── Bug severity breakdown ──
const openBugCount = computed(() => allBugs.value.filter(b => b.status === "open" || b.status === "reopened").length);

const bugSeverityData = computed(() => {
  const sev: Record<string, number> = {};
  for (const b of allBugs.value) {
    if (b.status !== "open" && b.status !== "reopened" && b.status !== "in_progress") continue;
    const s = (b.severity || "unknown").toLowerCase();
    sev[s] = (sev[s] || 0) + 1;
  }
  return sev;
});

const SEV_ORDER = ["critical", "urgent", "major", "high", "medium", "minor", "low", "trivial"];
const SEV_CLASS: Record<string, string> = {
  critical: "is-critical", urgent: "is-critical",
  major: "is-major", high: "is-major",
  medium: "is-medium", minor: "is-minor", low: "is-minor", trivial: "is-trivial"
};

const bugSevBars = computed(() => {
  const data = bugSeverityData.value;
  const maxCount = Math.max(1, ...Object.values(data));
  return SEV_ORDER
    .filter(k => data[k])
    .map(k => ({
      label: k.charAt(0).toUpperCase() + k.slice(1),
      count: data[k],
      pct: Math.round((data[k] / maxCount) * 100),
      cls: SEV_CLASS[k] || "is-minor"
    }));
});

// ── Data quality ──
const dataQualityIssues = computed(() => {
  const openIssues = allIssues.value.filter(i => i.status !== "done" && i.status !== "cancelled");
  const noPrio = openIssues.filter(i => !i.priority || i.priority === "none").length;
  const noDue = openIssues.filter(i => !i.due_date).length;
  const unassigned = openIssues.filter(i => !i.assignee).length;
  const noType = openIssues.filter(i => !i.issue_type).length;
  const items: { key: string; count: number; label: string; icon: any; severity: string }[] = [];
  if (noPrio > 0) items.push({ key: "noPriority", count: noPrio, label: t("project.overview.dataQuality.noPriority"), icon: Flag, severity: noPrio > 20 ? "warn" : "info" });
  if (noDue > 0) items.push({ key: "noDueDate", count: noDue, label: t("project.overview.dataQuality.noDueDate"), icon: Timer, severity: noDue > 20 ? "warn" : "info" });
  if (noType > 0) items.push({ key: "noType", count: noType, label: t("project.overview.dataQuality.noType"), icon: Collection, severity: noType > 20 ? "warn" : "info" });
  const noLabels = openIssues.filter(i => !i.labels || i.labels.length === 0).length;
  if (noLabels > 0) items.push({ key: "noLabels", count: noLabels, label: t("project.overview.dataQuality.noLabels"), icon: PriceTag, severity: noLabels > 20 ? "warn" : "info" });
  if (unassigned > 0) items.push({ key: "unassigned", count: unassigned, label: t("project.overview.dataQuality.unassigned"), icon: User, severity: unassigned > 5 ? "warn" : "info" });
  return items.sort((a, b) => b.count - a.count);
});
const dataQualityTotal = computed(() => dataQualityIssues.value.reduce((s, d) => s + d.count, 0));

// ── WIP Breakdown ──
const wipTotal = computed(() => {
  return allIssues.value.filter(i => i.status !== "done" && i.status !== "cancelled" && i.status !== "backlog").length;
});
const wipBars = computed(() => {
  const active = ["in_progress", "in_review", "todo"];
  const colors: Record<string, string> = { in_progress: "#5470c6", in_review: "#fac858", todo: "#909399" };
  const labels: Record<string, string> = { in_progress: t("project.overview.wip.inProgress"), in_review: t("project.overview.wip.inReview"), todo: t("project.overview.wip.todo") };
  const maxCount = Math.max(1, ...active.map(s => allIssues.value.filter(i => i.status === s).length));
  return active.map(s => {
    const count = allIssues.value.filter(i => i.status === s).length;
    return { status: s, label: labels[s], count, color: colors[s], pct: Math.round((count / maxCount) * 100) };
  });
});

// ── Due Health ──
const dueItems = computed(() => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
  return allIssues.value
    .filter(i => i.status !== "done" && i.status !== "cancelled" && i.due_date)
    .map(i => {
      const d = new Date(i.due_date!);
      return {
        key: i.key, title: i.title,
        dueDate: d,
        isOverdue: d < today,
        dueLabel: d < today ? t("project.overview.dueHealth.overdue", { n: Math.floor((today.getTime() - d.getTime()) / 86400000) }) :
          d.toDateString() === today.toDateString() ? t("project.overview.dueHealth.today") :
          t("project.overview.dueHealth.daysLeft", { n: Math.ceil((d.getTime() - today.getTime()) / 86400000) }),
        path: i.kb_file_path || ""
      };
    })
    .filter(i => i.isOverdue || i.dueDate <= nextWeek)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 8);
});
const dueOverdue = computed(() => dueItems.value.filter(i => i.isOverdue).length);
const dueUpcoming = computed(() => dueItems.value.filter(i => !i.isOverdue).length);

// ── Recently Completed ──
const recentlyCompleted = computed(() => {
  return allIssues.value
    .filter(i => i.status === "done" && i.updated_at)
    .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    .slice(0, 5)
    .map(i => {
      return { key: i.key, title: i.title, timeAgo: timeAgo(i.updated_at!) };
    });
});

function openIssueDetail(key: string) {
  router.push("/issue");
}

// ── README ──
const descContent = ref("");
const descExpanded = ref(false);
const descOverflows = ref(false);
const descHtml = computed(() => renderWithHtml(descContent.value || ""));
const descPreviewRef = ref<HTMLElement | null>(null);
const todoPriority = ref<"high" | "all">("high");
const todoType = ref<"issues" | "all" | "dev" | "test">("issues");
const readmeLoading = ref(false);

const README_CACHE_TTL = 120_000;
const README_POLL_MIN_INTERVAL = 60_000;
const README_TIMEOUT = 8_000;

const readmeBag = new DisposerBag();
let readmeSeq = 0;
let _lastReadmeLoadByUpdate = 0;

function readmeCacheKey(key: string): string {
  return `readme:${key}`;
}

function stripFrontmatter(md: string): string {
  const trimmed = md.trimStart();
  if (trimmed.startsWith("---")) {
    const end = trimmed.indexOf("\n---", 3);
    if (end !== -1) return trimmed.slice(end + 4).trimStart();
  }
  return md;
}

function checkDescOverflow() {
  const el = descPreviewRef.value;
  if (!el) return;
  descOverflows.value = el.scrollHeight > el.clientHeight + 2;
}

watch(descHtml, () => nextTick(checkDescOverflow));

function isActiveSeq(seq: number): boolean {
  return seq === readmeSeq && !readmeBag.isDisposed;
}

async function loadDescFile(force = false) {
  if (!project.value) return;
  const key = project.value.key;
  const seq = ++readmeSeq;

  // stale-while-revalidate: fresh 缓存直接返回，不触发网络
  const cacheKey = readmeCacheKey(key);
  const cached = typedGet<string>(cacheKey);
  if (!force && cached.hit && !cached.stale) {
    descContent.value = cached.value ?? "";
    descExpanded.value = false;
    return;
  }
  if (cached.hit) {
    // 先把 stale 内容推给 UI，避免空卡片 + 长时间骨架
    descContent.value = cached.value ?? "";
  }

  const ctrl = new AbortController();
  readmeBag.addAbort(ctrl);

  readmeLoading.value = true;
  const t0 = performance.now();
  let retries = 0;

  try {
    const content = await readProjectFile(key, `YiKnowledge/projects/${key}/README.md`, {
      timeoutMs: README_TIMEOUT,
      signal: ctrl.signal
    });
    if (!isActiveSeq(seq)) return;
    const stripped = stripFrontmatter(content || "");
    descContent.value = stripped;
    typedSet(cacheKey, stripped, README_CACHE_TTL);
    pushReliabilityEvent({
      projectKey: key,
      phase: "P4-readme",
      status: "success",
      durationMs: Math.round(performance.now() - t0),
      retryCount: retries
    });
  } catch (err) {
    if (!isActiveSeq(seq)) return;
    const errType = classifyReliabilityError(err);
    pushReliabilityEvent({
      projectKey: key,
      phase: "P4-readme",
      status: cached.hit ? "degraded" : "failed",
      durationMs: Math.round(performance.now() - t0),
      retryCount: retries,
      errorType: errType,
      errorMessage: String((err as ProjectFileError)?.message ?? "")
    });
    if (!cached.hit) {
      // 无 cache → 降级 project.description
      const fallback = project.value?.description || "";
      descContent.value = fallback;
      if (fallback) typedSet(cacheKey, fallback, README_CACHE_TTL);
    }
    // 有 cache → 已在之前赋值，保持 stale
  } finally {
    if (isActiveSeq(seq)) {
      readmeLoading.value = false;
      descExpanded.value = false;
    }
  }
}

function openDescDialog() {
  previewDlg?.value?.openRaw({
    title: "README.md",
    content: descContent.value,
    path: `projects/${project.value?.key}/README.md`
  });
}

onMounted(() => {
  loadDescFile();
});

onBeforeUnmount(() => {
  readmeBag.dispose();
});

watch(
  () => project.value?.key,
  (newKey, oldKey) => {
    if (newKey && newKey !== oldKey) loadDescFile(true);
  }
);

watch(lastUpdated, () => {
  const now = Date.now();
  if (now - _lastReadmeLoadByUpdate < README_POLL_MIN_INTERVAL) return;
  _lastReadmeLoadByUpdate = now;
  loadDescFile(true);
});

// ── Stats strip ──

const prdFiles = computed(() => {
  const prefix = `projects/${project.value?.key}/prds/`;
  return knowledgeFiles.value
    .filter(f => f.path.startsWith(prefix) && f.path.endsWith(".md") && f.name !== "README.md" && !f.name.startsWith("00-"));
});

const prdCount = computed(() => prdFiles.value.length);
const prdDone = computed(() => prdFiles.value.filter(f => {
  const s = ((f.meta || {}) as Record<string, unknown>).status as string;
  return s === "已完成" || s === "done" || s === "completed";
}).length);

const devDone = computed(() => ykModules.value.filter(m => m.status === "已完成" || m.status === "done" || m.status === "已合并").length);
const testDone = computed(() => testSpecs.value.filter(t => t.status === "已完成" || t.status === "done").length);

const workflowCount = computed(() => {
  const prefix = `projects/${project.value?.key}/workflows/`;
  return knowledgeFiles.value.filter(f => f.path.startsWith(prefix) && f.path.endsWith(".md")).length;
});

interface OkrGoalCard {
  id: string;
  title: string;
  progress: number;
  krCount: number;
  metricCount: number;
  path: string;
}

const okrGoals = computed<OkrGoalCard[]>(() => {
  const prefix = `projects/${project.value?.key}/okrs/`;
  return knowledgeFiles.value
    .filter(f => f.path.startsWith(prefix) && f.name.startsWith("goal-") && f.path.endsWith(".md"))
    .map(f => {
      const meta = (f.meta || {}) as Record<string, unknown>;
      const krCount = Object.keys(meta).filter(k => /^kr\d+$/.test(k)).length;
      const metricCount = Object.keys(meta).filter(k => /^metric\d+_id$/.test(k)).length;
      return {
        id: (meta.id as string) || "",
        title: (meta.title as string) || f.name.replace(/\.md$/, ""),
        progress: (meta.progress as number) || 0,
        krCount,
        metricCount,
        path: f.path
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
});

const okrSummary = computed(() => {
  const goals = okrGoals.value;
  if (!goals.length) return { totalGoals: 0, avgProgress: 0, completedCount: 0 };
  return {
    totalGoals: goals.length,
    avgProgress: Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length),
    completedCount: goals.filter(g => g.progress >= 100).length
  };
});

// ── Document Directory ──

interface DocItem {
  seq: string;
  title: string;
  path: string;
  status: string;
  owner: string;
  estimate: string;
}

const docTab = ref<"prds" | "devs" | "tests">("prds");
const docLimit = ref(12);

const docTabs = computed(() => [
  { key: "prds" as const, label: t("project.overview.stats.prds"), count: prdCount.value },
  { key: "devs" as const, label: t("project.overview.stats.devs"), count: ykModules.value.length },
  { key: "tests" as const, label: t("project.overview.stats.tests"), count: testSpecs.value.length }
]);

const docTabItems = computed<DocItem[]>(() => {
  const prefix = `projects/${project.value?.key}/`;
  if (docTab.value === "prds") {
    return prdFiles.value.map(f => {
      const meta = (f.meta || {}) as Record<string, unknown>;
      return {
        seq: f.name.match(/^(\d+)/)?.[1] || "",
        title: (meta.title as string) || f.name.replace(/\.md$/, ""),
        path: f.path,
        status: (meta.status as string) || "",
        owner: (meta.owner as string) || "",
        estimate: ""
      };
    });
  }
  if (docTab.value === "devs") {
    return ykModules.value.map(m => ({
      seq: m.seq,
      title: m.title,
      path: m.path,
      status: m.status,
      owner: m.owner,
      estimate: m.estimate_frontend ? `${m.estimate_frontend}d` : ""
    }));
  }
  return testSpecs.value.map(t => ({
    seq: (t as any).seq || "",
    title: t.title,
    path: t.path,
    status: t.status,
    owner: t.owner || "",
    estimate: ""
  }));
});

function statusLabel(s: string): string {
  return DOC_STATUS_LABELS[s] || s || "—";
}
function statusColor(s: string): string {
  return DOC_STATUS_COLORS[s] || "#909399";
}

const statTiles = computed(() => {
  const p = project.value;
  if (!p) return [];
  const bugOpen = allBugs.value.filter(b => b.status === "open" || b.status === "reopened").length;
  const bugResolved = allBugs.value.filter(b => b.status === "resolved" || b.status === "closed").length;
  const bugResolvePct = allBugs.value.length ? Math.round(bugResolved / allBugs.value.length * 100) : 0;
  const prdPct = prdCount.value ? Math.round(prdDone.value / prdCount.value * 100) : 0;
  const devPct = ykModules.value.length ? Math.round(devDone.value / ykModules.value.length * 100) : 0;
  const testPct = testSpecs.value.length ? Math.round(testDone.value / testSpecs.value.length * 100) : 0;
  const knowledgeCountVal = knowledgeFiles.value.filter(f => f.path.startsWith(`projects/${project.value?.key}/`)).length;
  const nowTs = Date.now();
  const knowledgeFresh = knowledgeFiles.value.filter(f => {
    if (!f.path.startsWith(`projects/${project.value?.key}/`)) return false;
    if (!f.updatedAt) return false;
    return (nowTs - new Date(f.updatedAt).getTime()) < 30 * 86400000;
  }).length;
  const knowledgeFreshPct = knowledgeCountVal ? Math.round(knowledgeFresh / knowledgeCountVal * 100) : 0;
  return [
    { key: "prds", value: prdCount.value, suffix: "", label: t("project.overview.stats.prds"), sub: `${prdPct}% ${t("project.overview.stats.completed")}`, variant: "purple", clickable: true, onClick: () => navigateTab("prds") },
    { key: "devs", value: ykModules.value.length, suffix: "", label: t("project.overview.stats.devs"), sub: `${devPct}% ${t("project.overview.stats.completed")} · ${todoDevs.value.length} ${t("project.overview.stats.pending")}`, variant: "blue", clickable: true, onClick: () => navigateTab("devs") },
    { key: "tests", value: testSpecs.value.length, suffix: "", label: t("project.overview.stats.tests"), sub: `${testPct}% ${t("project.overview.stats.completed")} · ${todoTests.value.length} ${t("project.overview.stats.pending")}`, variant: "green", clickable: true, onClick: () => navigateTab("tests") },
    { key: "bugs", value: bugOpen, suffix: "", label: t("project.overview.stats.bugs"), sub: `${bugResolvePct}% resolved · ${bugResolved}/${allBugs.value.length}`, variant: bugResolvePct >= 80 ? "green" : bugOpen > 0 ? "red" : "green", clickable: true, onClick: () => navigateTab("bugs") },
    { key: "docs", value: knowledgeCountVal, suffix: "", label: t("project.overview.stats.docs"), sub: `${knowledgeFreshPct}% ${t("project.overview.stats.fresh")}`, variant: "teal", clickable: knowledgeCountVal > 0, onClick: () => navigateTab("prds") },
    { key: "okrs", value: okrSummary.value.totalGoals, suffix: "", label: t("project.overview.stats.okrs"), sub: okrSummary.value.totalGoals ? `${okrSummary.value.avgProgress}%` : "", variant: "orange", clickable: okrGoals.value.length > 0, onClick: () => navigateTab("okr") }
  ];
});

function openFile(path: string) {
  previewDlg?.value?.open(path);
}

// ── Shared doc status maps (used by Document Directory + Activity composable) ──

const DOC_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  review: "In Review",
  active: "Active",
  done: "Done",
  completed: "Completed",
  deprecated: "Deprecated",
  archived: "Archived",
  "已合并": "Merged",
  "待开始": "Pending",
  "需求已编写": "Spec Ready",
  "进行中": "In Progress",
  "已完成": "Done",
  "已取消": "Cancelled",
  "待评审": "Review"
};

const DOC_STATUS_COLORS: Record<string, string> = {
  draft: "#909399",
  review: "#e6a23c",
  active: "#67c23a",
  done: "#409eff",
  completed: "#409eff",
  deprecated: "#f56c6c",
  archived: "#c0c4cc",
  "已合并": "#67c23a",
  "待开始": "#909399",
  "需求已编写": "#409eff",
  "进行中": "#e6a23c",
  "已完成": "#67c23a",
  "已取消": "#f56c6c",
  "待评审": "#e6a23c"
};

function handleActivityClick(a: ActivityItem) {
  if (a.filePath) previewDlg?.value?.open(a.filePath);
}

// ── Todo list ──
interface TodoItem {
  id: string;
  type: string;
  target: string;
  filePath: string;
  priorityLabel: string;
  priorityColor: string;
  priorityRank: number;
  assignee: string;
  dueDate: string;
  isOverdue: boolean;
  issueType: string;
  issueTypeLabel: string;
  estimate: string;
  prdRef: string;
}

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  p0: 0, P0: 0,
  high: 1,
  p1: 1, P1: 1,
  medium: 2,
  p2: 2, P2: 2,
  low: 3,
  p3: 3, P3: 3,
  none: 4
};

function formatDueDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

function bugPriorityColor(p: string): string {
  const map: Record<string, string> = { p0: "urgent", p1: "high", p2: "medium", p3: "low", urgent: "urgent", high: "high", medium: "medium", low: "low" };
  return PRIORITY_COLORS[map[p] as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.none;
}

function isOverdue(iso: string | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d < new Date();
}

function ykPriorityColor(p: string): string {
  const m: Record<string, string> = { P0: "#f56c6c", P1: "#e6a23c", P2: "#409eff", P3: "#909399" };
  return m[p] || "#909399";
}

const todoItems = computed<TodoItem[]>(() => {
  const items: TodoItem[] = [];

  todoRequirements.value.forEach(i => {
    const est = i.story_points || i.estimate_points;
    items.push({
      id: i.key,
      type: i.issue_type,
      target: i.title,
      filePath: getIssueFilePath(i),
      priorityLabel: ISSUE_PRIORITY_MAP[i.priority] || i.priority,
      priorityColor: PRIORITY_COLORS[i.priority as keyof typeof PRIORITY_COLORS] || "#909399",
      priorityRank: PRIORITY_RANK[i.priority] ?? 4,
      assignee: i.assignee || "",
      dueDate: formatDueDate(i.due_date),
      isOverdue: isOverdue(i.due_date),
      issueType: i.issue_type,
      issueTypeLabel: ISSUE_TYPE_MAP[i.issue_type] || i.issue_type,
      estimate: est ? `${est} pts` : "",
        prdRef: ""
      });
  });

  todoBugs.value.forEach(b => {
    items.push({
      id: b.key,
      type: "bug",
      target: b.title,
      filePath: b.contentPath || "",
      priorityLabel: BUG_PRIORITY_MAP[b.priority] || b.priority,
      priorityColor: bugPriorityColor(b.priority),
      priorityRank: PRIORITY_RANK[b.priority] ?? 4,
      assignee: b.assignee || "",
      dueDate: b.dueDate ? formatDueDate(new Date(b.dueDate).toISOString()) : "",
      isOverdue: b.dueDate ? isOverdue(new Date(b.dueDate).toISOString()) : false,
      issueType: "bug",
      issueTypeLabel: t("project.overview.todo.bug"),
      estimate: "",
      prdRef: ""
    });
  });

  // Dev tasks from YiKnowledge devs/ directory
  todoDevs.value.forEach(d => {
    items.push({
      id: d.path,
      type: "dev",
      target: d.title,
      filePath: d.path,
      priorityLabel: d.priority,
      priorityColor: ykPriorityColor(d.priority),
      priorityRank: PRIORITY_RANK[d.priority] ?? 4,
      assignee: d.owner,
      dueDate: "",
      isOverdue: false,
      issueType: "dev",
      issueTypeLabel: t("project.overview.todo.dev"),
      estimate: d.estimate_frontend ? `${d.estimate_frontend}d` : "",
      prdRef: d.source_prd
    });
  });

  // Test tasks from YiKnowledge tests/ directory
  todoTests.value.forEach(spec => {
    items.push({
      id: spec.path,
      type: "testing",
      target: spec.title,
      filePath: spec.path,
      priorityLabel: spec.priority,
      priorityColor: ykPriorityColor(spec.priority),
      priorityRank: PRIORITY_RANK[spec.priority] ?? 4,
      assignee: spec.owner,
      dueDate: "",
      isOverdue: false,
      issueType: "testing",
      issueTypeLabel: t("project.overview.todo.testing"),
      estimate: "",
      prdRef: spec.source_prds[0] || ""
    });
  });

  items.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
    return a.dueDate.localeCompare(b.dueDate);
  });
  return items;
});

// PRD basename → { dev: path, test: path } linkage map for Todo items
const prdToLinks = computed(() => {
  const map = new Map<string, { dev: string; test: string }>();
  for (const m of ykModules.value) {
    const prdName = (m.source_prd || "").replace(/\.md$/, "");
    if (!prdName) continue;
    const entry = map.get(prdName) || { dev: "", test: "" };
    entry.dev = m.path;
    map.set(prdName, entry);
  }
  for (const t of testSpecs.value) {
    for (const prd of t.source_prds || []) {
      const prdName = prd.replace(/\.md$/, "");
      if (!prdName) continue;
      const entry = map.get(prdName) || { dev: "", test: "" };
      entry.test = t.path;
      map.set(prdName, entry);
    }
  }
  return map;
});

const todoGroups = computed(() => {
  const groups: { label: string; items: TodoItem[] }[] = [];
  const groupOrder = [
    t("project.overview.todo.bug"),
    t("project.overview.todo.dev"),
    t("project.overview.todo.testing"),
    t("project.overview.todo.requirement"),
    t("project.overview.todo.feature"),
    t("project.overview.todo.task"),
    t("project.overview.todo.improvement")
  ];

  const filtered =
    todoPriority.value === "high"
      ? todoItems.value.filter(i => i.priorityRank <= 1)
      : todoItems.value;
  const filteredByType =
    todoType.value === "all"
      ? filtered
      : todoType.value === "issues"
        ? filtered.filter(i => i.type !== "dev" && i.type !== "testing")
        : todoType.value === "dev"
          ? filtered.filter(i => i.type === "dev")
          : filtered.filter(i => i.type === "testing");
  for (const item of filteredByType) {
    const label = item.issueTypeLabel;
    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }

  groups.sort((a, b) => {
    const ai = groupOrder.indexOf(a.label);
    const bi = groupOrder.indexOf(b.label);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return groups;
});

const filteredTodoCount = computed(() => {
  const byPriority =
    todoPriority.value === "high"
      ? todoItems.value.filter(i => i.priorityRank <= 1)
      : todoItems.value;
  if (todoType.value === "all") return byPriority.length;
  if (todoType.value === "issues") return byPriority.filter(i => i.type !== "dev" && i.type !== "testing").length;
  if (todoType.value === "dev") return byPriority.filter(i => i.type === "dev").length;
  return byPriority.filter(i => i.type === "testing").length;
});

const todoOverdueCount = computed(() => todoItems.value.filter(i => i.isOverdue).length);

  const highPriorityCount = computed(() => todoItems.value.filter(i => i.priorityRank <= 1).length);
  const issueTodoCount = computed(() => todoItems.value.filter(i => i.type !== 'dev' && i.type !== 'testing').length);
  const devTodoCount = computed(() => todoItems.value.filter(i => i.type === 'dev').length);
  const testTodoCount = computed(() => todoItems.value.filter(i => i.type === 'testing').length);

const todoStats = computed(() => {
  const devs = ykModules.value;
  const tests = testSpecs.value;
  const done = devs.filter(d => d.status === "已完成" || d.status === "done" || d.status === "已合并").length;
  const inProgress = devs.filter(d => d.status === "进行中" || d.status === "in_progress" || d.status === "迭代中").length;
  const pending = devs.length - done - inProgress;
  const testsDone = tests.filter(t => t.status === "已完成" || t.status === "done").length;
  const p0 = devs.filter(d => d.priority === "P0").length;
  const p1 = devs.filter(d => d.priority === "P1").length;
  return { devTotal: devs.length, done, inProgress, pending, testTotal: tests.length, testsDone, p0, p1 };
});

function handleTodoClick(a: TodoItem) {
  if (a.filePath) {
    previewDlg?.value?.open(a.filePath);
  }
}

function groupColor(label: string): string {
  const m: Record<string, string> = {
    [t("project.overview.todo.bug")]: activityColor("bug"),
    [t("project.overview.todo.dev")]: "#36cfc9",
    [t("project.overview.todo.testing")]: "#9a60b4",
    [t("project.overview.todo.requirement")]: activityColor("requirement"),
    [t("project.overview.todo.feature")]: "#67c23a",
    [t("project.overview.todo.task")]: "#e6a23c",
    [t("project.overview.todo.improvement")]: "#9a60b4"
  };
  return m[label] || "#909399";
}

function todoAccentColor(item: TodoItem): string {
  const m: Record<string, string> = {
    requirement: "#409eff",
    feature: "#67c23a",
    task: "#e6a23c",
    improvement: "#9a60b4",
    bug: "#f56c6c",
    dev: "#36cfc9",
    testing: "#9a60b4"
  };
  return m[item.issueType] || "#909399";
}

function shortPrdRef(ref: string): string {
  return ref.replace(/\.md$/, "").split("/").pop() || ref;
}

function prdBaseName(filePath: string): string {
  return (filePath.split("/").pop() || "").replace(/\.md$/, "");
}

function getLinkedDev(filePath: string): string | null {
  const name = prdBaseName(filePath);
  const links = prdToLinks.value.get(name);
  return links?.dev || null;
}

function getLinkedTest(filePath: string): string | null {
  const name = prdBaseName(filePath);
  const links = prdToLinks.value.get(name);
  return links?.test || null;
}

function openLinkFile(path: string) {
  previewDlg?.value?.open(path);
}

const updatingKeys = ref(new Set<string>());

async function transitionTodo(item: TodoItem, action: "start" | "complete") {
  if (updatingKeys.value.has(item.id)) return;
  updatingKeys.value = new Set([...updatingKeys.value, item.id]);

  try {
    if (item.type === "dev" || item.type === "testing") {
      if (item.filePath) {
        previewDlg?.value?.open(item.filePath);
      }
      const next = new Set(updatingKeys.value);
      next.delete(item.id);
      updatingKeys.value = next;
      return;
    }
    if (item.type === "bug") {
      const newStatus = action === "start" ? "in_progress" : "resolved";
      await updateBug(item.id, { status: newStatus } as any);
    } else {
      const newStatus = action === "start" ? "in_progress" : "done";
      await updateIssue(item.id, { status: newStatus });
    }
    await retry();
  } catch {
    // item stays in list on failure
  } finally {
    const next = new Set(updatingKeys.value);
    next.delete(item.id);
    updatingKeys.value = next;
  }
}
</script>


<style scoped lang="scss">
@use "../../../styles/DetailOverview.scss";
</style>
