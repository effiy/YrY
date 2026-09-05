<template>
  <div class="issue-list">
    <!-- Header Card -->
    <div v-if="!props.projectKey" class="issue-list__header">
      <div class="issue-list__header-icon">
        <el-icon><Tickets /></el-icon>
      </div>
      <div class="issue-list__header-text">
        <h2 class="issue-list__header-title">Issues</h2>
        <p class="issue-list__header-desc">Track bugs, tasks and features across projects</p>
      </div>
      <div class="issue-list__header-pills">
        <div class="issue-list__header-pill">
          <span class="issue-list__header-pill-val">{{ stats.total }}</span>
          <span class="issue-list__header-pill-lbl">Total</span>
        </div>
        <div class="issue-list__header-pill">
          <span class="issue-list__header-pill-val">{{ openCount }}</span>
          <span class="issue-list__header-pill-lbl">Open</span>
        </div>
        <div class="issue-list__header-pill">
          <span class="issue-list__header-pill-val">{{ stats.done }}</span>
          <span class="issue-list__header-pill-lbl">Done</span>
        </div>
        <div class="issue-list__header-pill issue-list__header-pill--accent">
          <span class="issue-list__header-pill-val">{{ completionPct }}%</span>
          <span class="issue-list__header-pill-lbl">Completed</span>
        </div>
      </div>
      <div v-if="!props.filterDate" class="issue-list__header-right">
        <HeroDateNav
          :filter-date="filterDate"
          :label="filterDateLabel"
          :is-today="isFilterToday"
          @prev="goToPrevDay"
          @next="goToNextDay"
          @today="goToFilterToday"
          @clear="clearFilterDate"
        />
      </div>
    </div>

    <!-- Analytics Charts -->
    <div v-if="!props.projectKey" class="issue-list__charts">
      <div class="issue-chart" :class="{ 'issue-chart--active': filters.status }">
        <div class="issue-chart__title">
          Status
          <span v-if="filters.status" class="issue-chart__badge">filtered</span>
        </div>
        <div class="issue-chart__body">
          <ECharts :option="statusDonutOption" height="200" @chart-click="onChartClick('status', $event)" />
        </div>
      </div>
      <div class="issue-chart" :class="{ 'issue-chart--active': filters.priority }">
        <div class="issue-chart__title">
          Priority
          <span v-if="filters.priority" class="issue-chart__badge">filtered</span>
        </div>
        <div class="issue-chart__body">
          <ECharts :option="priorityBarOption" height="200" @chart-click="onChartClick('priority', $event)" />
        </div>
      </div>
      <div class="issue-chart" :class="{ 'issue-chart--active': filters.issue_type }">
        <div class="issue-chart__title">
          Type
          <span v-if="filters.issue_type" class="issue-chart__badge">filtered</span>
        </div>
        <div class="issue-chart__body">
          <ECharts :option="typeBarOption" height="200" @chart-click="onChartClick('issue_type', $event)" />
        </div>
      </div>
      <div class="issue-chart" :class="{ 'issue-chart--active': filters.assignee }">
        <div class="issue-chart__title">
          Assignee
          <span v-if="filters.assignee" class="issue-chart__badge">filtered</span>
        </div>
        <div class="issue-chart__body">
          <ECharts :option="assigneeBarOption" height="200" @chart-click="onChartClick('assignee', $event)" />
        </div>
      </div>
      <div class="issue-chart">
        <div class="issue-chart__title">Created · 14d</div>
        <div class="issue-chart__body"><ECharts :option="trendOption" height="200" /></div>
      </div>
    </div>

    
    <!-- Recently Viewed -->
    <div v-if="!props.projectKey && recentlyViewed.length" class="issue-list__recent">
      <span class="issue-list__recent-label">Recently viewed</span>
      <button
        v-for="r in recentlyViewed"
        :key="r.key"
        type="button"
        class="issue-list__recent-chip"
        :title="r.title"
        @click="goDetail(r.key)"
      >
        <span class="issue-list__recent-dot" :style="{ background: statusColor(r.status) }" />
        <span class="issue-list__recent-key">{{ r.key }}</span>
        <span class="issue-list__recent-title">{{ r.title }}</span>
      </button>
      <button type="button" class="issue-list__recent-clear" @click="recentlyViewed = []">✕</button>
    </div>

    <!-- Active Filter Pills -->
    <div v-if="activePills.length && filterIssueType !== 'requirement'" class="issue-list__pills">
      <span class="issue-list__pills-label">Filters</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="removePill(p)">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
    </div>

    
    <div class="issue-list__body">
      <div class="issue-list__sidebar">
        <div class="issue-list__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
            <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
        <div class="issue-list__sidebar-section">
          <div class="issue-list__sidebar-section-header">
            <span class="issue-list__sidebar-section-label">Overview</span>
          </div>
          <div class="issue-list__sidebar-section-body">
            <div class="issue-list__sidebar-card" @click="router.push('/issue')">
              <div class="issue-list__sidebar-card-icon" style="background:linear-gradient(135deg,#5470c6,#4460b0)"><el-icon><Tickets /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ stats.total }}</span>
                <span class="issue-list__sidebar-card-label">Total</span>
              </div>
            </div>
            <div class="issue-list__sidebar-card" @click="applyAttentionFilter('unassigned')">
              <div class="issue-list__sidebar-card-icon" style="background:linear-gradient(135deg,#5ab1ef,#3a90d0)"><el-icon><Loading /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ openCount }}</span>
                <span class="issue-list__sidebar-card-label">Open</span>
              </div>
            </div>
            <div class="issue-list__sidebar-card">
              <div class="issue-list__sidebar-card-icon" style="background:linear-gradient(135deg,#e6a23c,#d49520)"><el-icon><View /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ stats.in_review }}</span>
                <span class="issue-list__sidebar-card-label">In Review</span>
              </div>
            </div>
            <div class="issue-list__sidebar-card">
              <div class="issue-list__sidebar-card-icon" style="background:linear-gradient(135deg,#91cc75,#7ab85e)"><el-icon><CircleCheckFilled /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ stats.done }}</span>
                <span class="issue-list__sidebar-card-label">Done</span>
              </div>
            </div>
          </div>
          <div class="issue-list__sidebar-progress">
            <span class="issue-list__sidebar-progress-label">Completion</span>
            <el-progress :percentage="completionPct" :stroke-width="6" :show-text="true" />
          </div>
        </div>
        <div class="issue-list__sidebar-section" style="margin-top:12px">
          <div class="issue-list__sidebar-section-header" style="border-left-color: var(--el-color-danger);">
            <span class="issue-list__sidebar-section-label">Needs Attention</span>
          </div>
          <div class="issue-list__sidebar-section-body">
            <div class="issue-list__sidebar-card issue-list__sidebar-card--overdue" @click="applyAttentionFilter('overdue')">
              <el-icon class="issue-list__sidebar-card-accent-icon"><Clock /></el-icon>
              <span class="issue-list__sidebar-card-accent-value">{{ attention.overdue }}</span>
              <span class="issue-list__sidebar-card-accent-label">Overdue</span>
            </div>
            <div class="issue-list__sidebar-card issue-list__sidebar-card--unassigned" @click="applyAttentionFilter('unassigned')">
              <el-icon class="issue-list__sidebar-card-accent-icon"><User /></el-icon>
              <span class="issue-list__sidebar-card-accent-value">{{ attention.unassigned }}</span>
              <span class="issue-list__sidebar-card-accent-label">Unassigned</span>
            </div>
            <div class="issue-list__sidebar-card issue-list__sidebar-card--blocked" @click="applyAttentionFilter('blocked')">
              <el-icon class="issue-list__sidebar-card-accent-icon"><Link /></el-icon>
              <span class="issue-list__sidebar-card-accent-value">{{ attention.blocked }}</span>
              <span class="issue-list__sidebar-card-accent-label">Blocked</span>
            </div>
          </div>
        </div>
        <div class="issue-list__sidebar-section" style="margin-top:12px">
          <div class="issue-list__sidebar-section-header" style="border-left-color: var(--el-color-success);">
            <span class="issue-list__sidebar-section-label">Data Quality</span>
            <span class="issue-list__sidebar-section-hint">{{ allIssues.length }} issues</span>
          </div>
          <div class="issue-list__sidebar-section-body">
            <div v-for="c in completeness" :key="c.key" class="issue-list__sidebar-quality">
              <div class="issue-list__sidebar-quality-head">
                <span class="issue-list__sidebar-quality-label">{{ c.label }}</span>
                <span class="issue-list__sidebar-quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
              </div>
              <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
            </div>
          </div>
        </div>
      </div>
      <div class="issue-list__main">

        <!-- Table View (existing ProTable) -->
        <template v-if="viewMode === 'table'">
        <ProTable
          ref="proTable"
          title="Issues"
          :columns="columns"
          :request-api="fetchIssues"
          :pagination="true"
        >
      <template #tableHeader="scope">
        <el-dropdown :disabled="!scope.isSelected" trigger="click">
          <el-button type="warning" plain :disabled="!scope.isSelected">
            Bulk Actions<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="bulkChangeStatus(scope, 'todo')">Set Status: Todo</el-dropdown-item>
              <el-dropdown-item @click="bulkChangeStatus(scope, 'in_progress')">Set Status: In Progress</el-dropdown-item>
              <el-dropdown-item @click="bulkChangeStatus(scope, 'done')">Set Status: Done</el-dropdown-item>
              <el-dropdown-item divided @click="openBatchAssign(scope)">Assign to...</el-dropdown-item>
              <el-dropdown-item divided @click="batchDelete(scope.selectedListIds)">Delete Selected</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template #titleHeader>
        <div class="issue-list__col-head">
          <span>Title</span>
          <el-input v-model="searchText" size="small" placeholder="Search…" clearable @change="refreshTable" />
        </div>
      </template>
      <template #keyHeader>
        <div class="issue-list__col-head">
          <span>Key</span>
          <el-input v-model="keySearchText" size="small" placeholder="Key…" clearable @change="refreshTable" />
        </div>
      </template>
      <template #key="scope">
        <code class="issue-list__key" title="Copy key" @click="copyKey(scope.row.key)">{{ scope.row.key }}</code>
      </template>
      <template #title="scope">
        <el-button link type="primary" class="issue-list__title" @click="openPreview(scope.row)">
          {{ scope.row.title }}
        </el-button>
      </template>
      <template #status="scope">
        <el-tag :type="statusTagType(scope.row.status)" size="small">
          {{ statusLabel(scope.row.status) }}
        </el-tag>
      </template>
      <template #priority="scope">
        <span :style="{ color: priorityColor(scope.row.priority) }">
          {{ priorityLabel(scope.row.priority) }}
        </span>
      </template>
      <template #estimate_points="scope">
        <span v-if="scope.row.estimate_points != null" class="issue-list__points">{{ scope.row.estimate_points }} pts</span>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #issue_type="scope">
        <el-tag :type="typeTagType(scope.row.issue_type)" size="small" effect="plain">
          {{ typeLabel(scope.row.issue_type) }}
        </el-tag>
      </template>
      <template #labelsHeader>
        <div class="issue-list__col-head">
          <span>Labels</span>
          <el-input v-model="labelSearchText" size="small" placeholder="Label…" clearable @change="refreshTable" />
        </div>
      </template>
      <template #labels="scope">
        <div v-if="scope.row.labels?.length" class="issue-list__labels">
          <el-tag v-for="l in scope.row.labels" :key="l" size="small" round effect="plain">{{ l }}</el-tag>
        </div>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #assigneeHeader>
        <div class="issue-list__col-head">
          <span>Assignee</span>
          <el-input v-model="assigneeSearchText" size="small" placeholder="Name…" clearable @change="refreshTable" />
        </div>
      </template>
      <template #source="scope">
        <span :class="scope.row.source ? 'issue-list__source' : 'issue-list__muted'">{{
          scope.row.source ? sourceLabel(scope.row.source) : "—"
        }}</span>
      </template>
      <template #review_status="scope">
        <el-tag v-if="scope.row.review_status" :type="reviewTagType(scope.row.review_status)" size="small" effect="plain">{{
          reviewLabel(scope.row.review_status)
        }}</el-tag>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #project_key="scope">
        <button
          v-if="scope.row.project_key"
          type="button"
          class="issue-list__link-chip"
          @click="goProject(scope.row.project_key)"
        >
          {{ projectName(scope.row.project_key) }}
        </button>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #module="scope">
        <div v-if="modulesForIssue(scope.row.key).length" class="issue-list__modules">
          <button
            v-for="m in modulesForIssue(scope.row.key)"
            :key="m.key"
            type="button"
            class="issue-list__link-chip issue-list__link-chip--module"
            @click="goModule(m.key)"
          >
            {{ m.name }}
          </button>
        </div>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #goal_id="scope">
        <button
          v-if="scope.row.goal_id && goalRoleMap[scope.row.goal_id]"
          type="button"
          class="issue-list__link-chip issue-list__link-chip--goal"
          @click="goGoal(scope.row.goal_id)"
        >
          🎯 {{ goalLabel(scope.row.goal_id) }}
        </button>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #start_date="scope">
        <span v-if="scope.row.start_date" class="issue-list__start">{{ formatDate(scope.row.start_date) }}</span>
        <span v-else class="issue-list__muted">—</span>
      </template>
      <template #due_date="scope">
        <span :class="dueCell(scope.row).cls">{{ dueCell(scope.row).text }}</span>
      </template>
      <template #created_at="scope">
        <span class="issue-list__updated">{{ formatRelativeTime(scope.row.created_at) }}</span>
      </template>
      <template #updated_at="scope">
        <span class="issue-list__updated">{{ formatRelativeTime(scope.row.updated_at) }}</span>
      </template>
      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="goDetail(scope.row.key)"></el-button>
        <el-button type="primary" link :icon="Edit" @click="openEdit(scope.row)"></el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"></el-button>
      </template>
    </ProTable>
        </template>

        <!-- Card View -->
        <template v-else-if="viewMode === 'card'">
          <div class="issue-grid">
            <div
              v-for="issue in cardIssues"
              :key="issue.key"
              class="issue-card"
              @click="openPreview(issue)"
            >
              <div class="issue-card__head">
                <span class="issue-card__dot" :style="{ background: statusColor(issue.status) }" />
                <code class="issue-card__key">{{ issue.key }}</code>
                <div class="issue-card__head-right">
                  <el-tag :type="priorityTagType(issue.priority)" size="small" effect="plain">{{ priorityLabel(issue.priority) }}</el-tag>
                  <el-tag :type="typeTagType(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
                </div>
              </div>
              <h3 class="issue-card__title">{{ issue.title }}</h3>
              <p v-if="issue.description" class="issue-card__desc">{{ truncateDesc(issue.description) }}</p>
              <div class="issue-card__meta">
                <el-tag :type="statusTagType(issue.status)" size="small">{{ statusLabel(issue.status) }}</el-tag>
                <span v-if="issue.assignee" class="issue-card__assignee">
                  <el-icon><User /></el-icon> {{ issue.assignee }}
                </span>
                <span v-if="issue.due_date" class="issue-card__due" :class="dueClass(issue)">
                  {{ formatDate(issue.due_date) }}
                </span>
                <span v-if="issue.estimate_points != null" class="issue-card__pts">{{ issue.estimate_points }} pts</span>
              </div>
              <div v-if="issue.labels?.length" class="issue-card__labels">
                <el-tag v-for="l in issue.labels" :key="l" size="small" round effect="plain">{{ l }}</el-tag>
              </div>
            </div>
          </div>
          <el-pagination
            v-if="cardTotal > cardPageSize"
            class="issue-grid__pager"
            layout="prev, pager, next"
            :page-size="cardPageSize"
            :total="cardTotal"
            :current-page="cardPage"
            @current-change="onCardPage"
          />
        </template>

        <!-- List View -->
        <template v-else>
          <div class="issue-list-view">
            <div
              v-for="issue in cardIssues"
              :key="issue.key"
              class="issue-list-view__row"
              @click="openPreview(issue)"
            >
              <span class="issue-list-view__dot" :style="{ background: statusColor(issue.status) }" />
              <code class="issue-list-view__key">{{ issue.key }}</code>
              <span class="issue-list-view__title">{{ issue.title }}</span>
              <el-tag :type="typeTagType(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
              <el-tag :type="priorityTagType(issue.priority)" size="small" effect="plain">{{ priorityLabel(issue.priority) }}</el-tag>
              <el-tag :type="statusTagType(issue.status)" size="small">{{ statusLabel(issue.status) }}</el-tag>
              <span v-if="issue.assignee" class="issue-list-view__assignee">{{ issue.assignee }}</span>
              <span v-if="issue.due_date" class="issue-list-view__due" :class="dueClass(issue)">{{ formatDate(issue.due_date) }}</span>
            </div>
          </div>
          <el-pagination
            v-if="cardTotal > cardPageSize"
            class="issue-grid__pager"
            layout="prev, pager, next"
            :page-size="cardPageSize"
            :total="cardTotal"
            :current-page="cardPage"
            @current-change="onCardPage"
          />
        </template>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Issue' : 'New Issue'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="dialog.form.title" placeholder="Issue title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Type" prop="issue_type">
              <el-select v-model="dialog.form.issue_type" style="width: 100%">
                <el-option v-for="(label, val) in ISSUE_TYPE_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Priority" prop="priority">
              <el-select v-model="dialog.form.priority" style="width: 100%">
                <el-option v-for="(label, val) in ISSUE_PRIORITY_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status" prop="status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in ISSUE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Assignee">
              <el-input v-model="dialog.form.assignee" placeholder="Assignee name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description">
          <el-input
            v-model="dialog.form.description"
            type="textarea"
            :rows="4"
            placeholder="Issue description (Markdown supported)"
          />
        </el-form-item>
        <el-form-item label="Acceptance">
          <el-input v-model="dialog.form.acceptance_criteria" type="textarea" :rows="2" placeholder="Acceptance criteria" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Source">
              <el-select v-model="dialog.form.source" style="width: 100%" clearable placeholder="Source">
                <el-option v-for="(label, val) in ISSUE_SOURCE_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Review">
              <el-select v-model="dialog.form.review_status" style="width: 100%" clearable placeholder="Review status">
                <el-option v-for="(label, val) in REVIEW_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Start Date">
              <el-date-picker
                v-model="dialog.form.start_date"
                type="date"
                placeholder="Start date"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Due Date">
              <el-date-picker
                v-model="dialog.form.due_date"
                type="date"
                placeholder="Due date"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="!props.projectKey" label="Project" prop="project_key">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>

    <!-- Issue Preview Dialog -->
    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="tsx" name="issueList">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Delete,
  View,
  Edit,
  ArrowDown,
  Tickets,
  Loading,
  CircleCheckFilled,
  Clock,
  User,
  Link,
  Grid,
  Postcard,
  List
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import {
  getIssueList,
  ISSUE_STATUS_MAP,
  ISSUE_PRIORITY_MAP,
  ISSUE_TYPE_MAP,
  ISSUE_SOURCE_MAP,
  REVIEW_STATUS_MAP,
  ISSUE_STATUS_TAG_MAP,
  ISSUE_TYPE_TAG_MAP,
  typeLabel,
  getIssueFilePath
} from "@/api/modules/issueService";
import type {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueType,
  TagType,
  IssueSource,
  ReviewStatus
} from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { getModuleList } from "@/api/modules/moduleService";
import type { Module } from "@/api/modules/moduleService";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { useHandleData } from "@/hooks/useHandleData";
import { useDateFilter } from "@/hooks/useDateFilter";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { goalRoleMap, allGoalsMap } from "@/views/knowledge/executiver/okrData";
import { useRequirements } from "@/views/project/composables/useRequirements";

const props = defineProps<{ projectKey?: string; filterIssueType?: string; excludeIssueType?: string; filterDate?: Date | null }>();

const router = useRouter();
const route = useRoute();
const store = useIssueStore();
const proTable = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const quickFilter = ref("");
const labelFilter = ref("");
const goalFilter = ref("");

// ── Requirement data from knowledge files (canonical source) ──
const { items: reqItems, loading: reqLoading, fetch: fetchRequirements, updateItem: updateReqItem } = useRequirements();
const filters = reactive<{ status: string; priority: string; issue_type: string; assignee: string }>({
  status: "",
  priority: "",
  issue_type: props.filterIssueType || "",
  assignee: ""
});
const refreshing = ref(false);
const searchText = ref("");
const keySearchText = ref("");
const assigneeSearchText = ref("");
const labelSearchText = ref("");
const viewMode = ref<"table" | "card" | "list">("table");
const cardPage = ref(1);
const cardPageSize = 20;
const cardIssuesAll = ref<Issue[]>([]);

const cardIssues = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize;
  return cardIssuesAll.value.slice(start, start + cardPageSize);
});
const cardTotal = computed(() => cardIssuesAll.value.length);

function onCardPage(p: number) {
  cardPage.value = p;
}

function truncateDesc(text: string): string {
  const plain = text.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/>\s/g, "").replace(/[-*+]\s/g, "").replace(/\n+/g, " ").trim();
  return plain.length > 160 ? plain.slice(0, 160) + "..." : plain;
}

function priorityTagType(p: IssuePriority): TagType {
  const map: Record<IssuePriority, TagType> = { urgent: "danger", high: "warning", medium: "primary", low: "info", none: "info" };
  return map[p] || "info";
}

function dueClass(issue: Issue): string {
  if (!issue.due_date || issue.status === "done") return "";
  return new Date(issue.due_date).getTime() < Date.now() ? "issue-card__due--overdue" : "";
}

// ── Date filter ──
const _filterDate = ref<Date | null>(null);
const filterDate = computed({
  get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
  set: (v) => { _filterDate.value = v; }
});
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

// ── Summary stats + analytics source (standalone overview) ──────────────────
const stats = reactive({ total: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, backlog: 0, cancelled: 0 });
const allIssues = ref<Issue[]>([]);
const recentlyViewed = ref<Issue[]>([]);
const openCount = computed(() => stats.todo + stats.in_progress + stats.in_review);
const completionPct = computed(() => (stats.total ? Math.round((stats.done / stats.total) * 100) : 0));
async function loadStats() {
  // Requirement data comes from knowledge files — handled by the reqItems watcher
  if (props.filterIssueType === "requirement") return;
  try {
    const params: any = { project_key: props.projectKey || undefined, pageSize: 1000 };
    if (props.filterIssueType) params.issue_type = props.filterIssueType;
    if (props.excludeIssueType) params.exclude_issue_type = props.excludeIssueType;
    if (filterDateStr.value) {
      if (props.filterDate !== undefined) {
        params.due_date = filterDateStr.value;
      } else {
        params.updated_at_start = filterDateStr.value;
        params.updated_at_end = filterDateStr.value;
      }
    }
    const res = await getIssueList(params);
    const list = (res.data?.list as Issue[]) ?? [];
    allIssues.value = list;
    cardIssuesAll.value = list;
    const s = { total: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, backlog: 0, cancelled: 0 };
    for (const i of list) {
      s.total++;
      if (i.status === "todo") s.todo++;
      else if (i.status === "in_progress") s.in_progress++;
      else if (i.status === "in_review") s.in_review++;
      else if (i.status === "done") s.done++;
      else if (i.status === "backlog") s.backlog++;
      else if (i.status === "cancelled") s.cancelled++;
    }
    Object.assign(stats, s);
  } catch {
    // stats are best-effort — the table still renders without them
  }
}

// ── Analytics distributions + chart options ─────────────────────────────────
const STATUS_COLOR: Record<IssueStatus, string> = {
  backlog: "#9a60b4",
  todo: "#909399",
  in_progress: "#5ab1ef",
  in_review: "#e6a23c",
  done: "#91cc75",
  cancelled: "#ee6666"
};
function statusColor(s: IssueStatus) {
  return STATUS_COLOR[s] || "#909399";
}

const statusDist = computed(() => {
  const m: Record<string, number> = {};
  for (const i of allIssues.value) m[i.status] = (m[i.status] ?? 0) + 1;
  return m;
});
const priorityDist = computed(() => {
  const m: Record<string, number> = {};
  for (const i of allIssues.value) m[i.priority] = (m[i.priority] ?? 0) + 1;
  return m;
});
const typeDist = computed(() => {
  const m: Record<string, number> = {};
  for (const i of allIssues.value) m[i.issue_type] = (m[i.issue_type] ?? 0) + 1;
  return m;
});
const assigneeDist = computed(() => {
  const m: Record<string, number> = {};
  for (const i of allIssues.value) {
    if (!i.assignee) continue;
    m[i.assignee] = (m[i.assignee] ?? 0) + 1;
  }
  return m;
});
const createdByDay = computed(() => {
  const m: Record<string, number> = {};
  for (const i of allIssues.value) {
    const day = (i.created_at || "").slice(0, 10);
    if (day) m[day] = (m[day] ?? 0) + 1;
  }
  return m;
});

function barOption(categories: string[], values: number[], color: string, label?: (name: string) => string): ECOption {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return "";
        const name = label ? label(p.name) : p.name;
        return `${name}: ${p.value}`;
      }
    },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { fontSize: 9, interval: 0, rotate: categories.length > 6 ? 30 : 0, formatter: label }
    },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
  };
}

const statusDonutOption = computed<ECOption>(() => {
  const order: IssueStatus[] = ["todo", "in_progress", "in_review", "done", "backlog", "cancelled"];
  const data = order
    .map(s => ({ name: s, value: statusDist.value[s] ?? 0, itemStyle: { color: STATUS_COLOR[s] } }))
    .filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 }, formatter: (n: string) => ISSUE_STATUS_MAP[n as IssueStatus] ?? n },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const priorityBarOption = computed<ECOption>(() => {
  const order: IssuePriority[] = ["urgent", "high", "medium", "low", "none"];
  return barOption(
    order as string[],
    order.map(p => priorityDist.value[p] ?? 0),
    "#e6a23c",
    (n: string) => ISSUE_PRIORITY_MAP[n as IssuePriority] ?? n
  );
});

const typeBarOption = computed<ECOption>(() => {
  const order: IssueType[] = ["bug", "task", "feature", "improvement", "requirement"];
  return barOption(
    order as string[],
    order.map(t => typeDist.value[t] ?? 0),
    "#67c23a",
    (n: string) => ISSUE_TYPE_MAP[n as IssueType] ?? n
  );
});

const assigneeBarOption = computed<ECOption>(() => {
  const entries = Object.entries(assigneeDist.value)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  return barOption(
    entries.map(e => e[0]),
    entries.map(e => e[1]),
    "#9a60b4"
  );
});

const trendOption = computed<ECOption>(() => {
  const labels: string[] = [];
  const values: number[] = [];
  const today = new Date();
  for (let d = 13; d >= 0; d--) {
    const dt = new Date(today.getTime() - d * 86400000);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    labels.push(`${dt.getMonth() + 1}/${dt.getDate()}`);
    values.push(createdByDay.value[key] ?? 0);
  }
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, interval: 3 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color: "#73c0de", borderRadius: [3, 3, 0, 0] } }]
  };
});

// ── Data quality + attention (display-only) ─────────────────────────────────
const completeness = computed(() => {
  const total = allIssues.value.length;
  const fields = [
    { key: "assignee", label: "Assignee", filled: allIssues.value.filter(i => i.assignee).length },
    { key: "due_date", label: "Due Date", filled: allIssues.value.filter(i => i.due_date).length },
    { key: "labels", label: "Labels", filled: allIssues.value.filter(i => i.labels?.length).length },
    { key: "description", label: "Description", filled: allIssues.value.filter(i => i.description).length },
    { key: "acceptance", label: "Acceptance", filled: allIssues.value.filter(i => i.acceptance_criteria).length },
    { key: "estimate", label: "Estimate", filled: allIssues.value.filter(i => i.estimate_points != null).length }
  ];
  return fields.map(f => ({
    ...f,
    pct: total ? Math.round((f.filled / total) * 100) : 0,
    missing: total - f.filled
  }));
});

const attention = computed(() => {
  const now = Date.now();
  const overdue = allIssues.value.filter(i => i.due_date && i.status !== "done" && new Date(i.due_date).getTime() < now).length;
  const unassigned = allIssues.value.filter(i => !i.assignee && i.status !== "done" && i.status !== "cancelled").length;
  const blocked = allIssues.value.filter(i => i.blocked_by?.length).length;
  return { overdue, unassigned, blocked };
});

function qualityClass(pct: number) {
  if (pct >= 80) return "qmc-healthy";
  if (pct >= 50) return "qmc-warn";
  return "qmc-poor";
}
function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

// ── Recently viewed ──────────────────────────────────────────────────────────
function trackRecent(issue: Issue) {
  recentlyViewed.value = [issue, ...recentlyViewed.value.filter(r => r.key !== issue.key)].slice(0, 8);
}

// ── Cross-entity name maps (project chips) ────────────────
const projectNameByKey = ref<Map<string, string>>(new Map());
const modulesByIssueKey = ref<Map<string, Module[]>>(new Map());

async function loadNames() {
  try {
    const [projRes, modRes] = await Promise.all([
      getProjectList({ pageSize: 500 }),
      getModuleList({ pageSize: 500 })
    ]);
    projectNameByKey.value = new Map((projRes.data?.list as Project[]).map(p => [p.key, p.name]));
    // Reverse-map module.issue_keys → issue, so the list can show which
    // module(s) each issue belongs to (module membership lives on the module,
    // not the issue).
    const byIssue = new Map<string, Module[]>();
    for (const m of modRes.data?.list as Module[]) {
      for (const ik of m.issue_keys ?? []) {
        const arr = byIssue.get(ik) ?? [];
        arr.push(m);
        byIssue.set(ik, arr);
      }
    }
    modulesByIssueKey.value = byIssue;
  } catch {
    // names are best-effort — fall back to raw keys
  }
}

function modulesForIssue(issueKey: string): Module[] {
  return modulesByIssueKey.value.get(issueKey) ?? [];
}

function projectName(key: string) {
  return projectNameByKey.value.get(key) || key;
}

function goProject(key: string) {
  if (key) router.push(`/project/${key}`);
}
function goModule(key: string) {
  if (key) router.push(`/module/${key}`);
}
function goGoal(goalId: string) {
  const role = goalRoleMap[goalId];
  if (role) router.push(`/executiver/okr/${role}?goal=${goalId}`);
}
function goalLabel(goalId: string) {
  return allGoalsMap[goalId]?.title || goalId;
}

function dueCell(row: Issue): { text: string; cls: string } {
  if (!row.due_date) return { text: "—", cls: "issue-list__muted" };
  if (row.status !== "done") {
    const ms = new Date(row.due_date).getTime() - Date.now();
    if (ms < 0) return { text: `${formatDate(row.due_date)} · Overdue`, cls: "issue-list__due--overdue" };
    const days = Math.ceil(ms / 86400000);
    if (days <= 3) return { text: `${formatDate(row.due_date)} · ${days}d`, cls: "issue-list__due--soon" };
  }
  return { text: formatDate(row.due_date), cls: "" };
}

const quickFilters = [
  { key: "my", label: "My Issues" },
  { key: "open", label: "Open" },
  { key: "high", label: "High Priority" },
  { key: "week", label: "Due This Week" },
  { key: "done", label: "Recently Done" }
];

function refreshTable() {
  proTable.value?.getTableList();
}

function applyQuickFilter(key: string) {
  quickFilter.value = key === quickFilter.value ? "" : key;
  refreshTable();
}

function applyAttentionFilter(type: "overdue" | "unassigned" | "blocked") {
  quickFilter.value = "";
  if (type === "overdue") {
    filters.status = "todo,in_progress,in_review";
  } else if (type === "unassigned") {
    filters.status = "";
  } else if (type === "blocked") {
    filters.status = "";
  }
  refreshTable();
}

function onChartClick(dim: "status" | "priority" | "issue_type" | "assignee", e: { name?: string }) {
  const name = e?.name;
  if (!name) return;
  filters[dim] = filters[dim] === name ? "" : name;
  refreshTable();
}

const activePills = computed<Array<{ id: string; label: string; clear: () => void }>>(() => {
  const pills: Array<{ id: string; label: string; clear: () => void }> = [];
  if (quickFilter.value) {
    const f = quickFilters.find(q => q.key === quickFilter.value);
    pills.push({
      id: "qf",
      label: f ? f.label : quickFilter.value,
      clear: () => {
        quickFilter.value = "";
      }
    });
  }
  if (filters.status)
    pills.push({
      id: "status",
      label: `Status: ${ISSUE_STATUS_MAP[filters.status as IssueStatus] || filters.status}`,
      clear: () => {
        filters.status = "";
      }
    });
  if (filters.priority)
    pills.push({
      id: "priority",
      label: `Priority: ${ISSUE_PRIORITY_MAP[filters.priority as IssuePriority] || filters.priority}`,
      clear: () => {
        filters.priority = "";
      }
    });
  if (filters.issue_type)
    pills.push({
      id: "type",
      label: `Type: ${ISSUE_TYPE_MAP[filters.issue_type as IssueType] || filters.issue_type}`,
      clear: () => {
        filters.issue_type = "";
      }
    });
  if (filters.assignee)
    pills.push({
      id: "assignee",
      label: `Assignee: ${filters.assignee}`,
      clear: () => {
        filters.assignee = "";
      }
    });
  if (labelFilter.value)
    pills.push({
      id: "label",
      label: `Label: ${labelFilter.value}`,
      clear: () => {
        labelFilter.value = "";
      }
    });
  if (goalFilter.value)
    pills.push({
      id: "goal",
      label: `Goal: ${goalLabel(goalFilter.value)}`,
      clear: () => {
        goalFilter.value = "";
      }
    });
  return pills;
});

function removePill(p: { id: string; label: string; clear: () => void }) {
  p.clear();
  refreshTable();
}

function clearAllFilters() {
  quickFilter.value = "";
  labelFilter.value = "";
  goalFilter.value = "";
  searchText.value = "";
  keySearchText.value = "";
  assigneeSearchText.value = "";
  labelSearchText.value = "";
  filters.status = "";
  filters.priority = "";
  filters.issue_type = "";
  filters.assignee = "";
  refreshTable();
}

async function refresh() {
  refreshing.value = true;
  try {
    if (!props.projectKey) await Promise.all([loadStats(), loadNames()]);
    refreshTable();
  } finally {
    refreshing.value = false;
  }
}

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  issue_type: [{ required: true, message: "Type is required", trigger: "change" }],
  priority: [{ required: true, message: "Priority is required", trigger: "change" }],
  status: [{ required: true, message: "Status is required", trigger: "change" }]
};

const columns = computed<ColumnProps<Issue>[]>(() => {
  if (props.filterIssueType === "requirement") {
    const cols: ColumnProps<Issue>[] = [
      { prop: "key", label: "Month", width: 100 },
      { prop: "title", label: "Title", minWidth: 240 },
      { prop: "status", label: "Status", width: 100 },
      { prop: "priority", label: "Priority", width: 90 },
      { prop: "assignee", label: "Owner", width: 100 },
      { prop: "estimate_points", label: "Est.", width: 70, render: (scope: any) => {
        const pts = scope.row.estimate_points;
        return pts ? `${pts}d` : "—";
      } },
      { prop: "operation", label: "Actions", width: 190, fixed: "right" }
    ];
    return cols;
  }
  const cols: ColumnProps<Issue>[] = [
    { type: "selection", width: 50 },
    { prop: "key", label: "Key", width: 120 },
    { prop: "title", label: "Title", minWidth: 220 },
    { prop: "issue_type", label: "Type", width: 105 },
    { prop: "priority", label: "Priority", width: 92 },
    { prop: "estimate_points", label: "Points", width: 80 },
    { prop: "status", label: "Status", width: 110 },
    { prop: "labels", label: "Labels", width: 150 },
    { prop: "source", label: "Source", width: 105 },
    { prop: "review_status", label: "Review", width: 105 },
    { prop: "module", label: "Module", width: 120 },
    { prop: "goal_id", label: "Goal", width: 120 },
    { prop: "assignee", label: "Assignee", width: 100 },
    { prop: "start_date", label: "Start", width: 110 },
    { prop: "due_date", label: "Due", width: 135 },
    { prop: "created_at", label: "Created", width: 120 },
    { prop: "updated_at", label: "Updated", width: 120 },
    { prop: "operation", label: "Actions", width: 190, fixed: "right" }
  ];
  if (!props.projectKey) {
    cols.splice(10, 0, { prop: "project_key", label: "Project", width: 130 });
  }
  return cols;
});

interface IssueForm {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  issue_type: IssueType;
  assignee: string;
  start_date: string;
  due_date: string;
  project_key: string;
  source: string;
  review_status: string;
  acceptance_criteria: string;
}

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    title: "",
    description: "",
    status: "todo" as IssueStatus,
    priority: "medium" as IssuePriority,
    issue_type: "task" as IssueType,
    assignee: "",
    start_date: "",
    due_date: "",
    project_key: props.projectKey || "",
    source: "",
    review_status: "",
    acceptance_criteria: ""
  } as IssueForm
});

async function fetchIssues(params: any) {
  const { pageNum, pageSize, ...searchParams } = params;

  // ── Requirement type: use knowledge files as canonical source ──
  if (props.filterIssueType === "requirement") {
    // Ensure requirements are loaded (may not be ready on initial ProTable mount)
    if (reqItems.value.length === 0 && props.projectKey) {
      if (!reqLoading.value) {
        await fetchRequirements(props.projectKey);
      } else {
        // Wait for the in-flight fetch to complete
        await new Promise<void>(resolve => {
          const stop = watch(reqLoading, (v) => { if (!v) { stop(); resolve(); } });
        });
      }
    }
    const list = buildReqIssues();
    const filtered = applyReqFilters(list, searchParams);
    const total = filtered.length;
    const start = (pageNum - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);
    return { data: { list: paged, total, pageNum, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  const merged: any = { pageNum, pageSize, project_key: props.projectKey, ...searchParams };
  // Title column search is a "search" filter on the backend (regex over title+description).
  if (merged.title) {
    merged.search = merged.title;
    delete merged.title;
  }
  if (searchText.value) {
    merged.search = searchText.value;
  }
  if (keySearchText.value) {
    merged.key = keySearchText.value;
  }
  if (assigneeSearchText.value) {
    merged.assignee = assigneeSearchText.value;
  }
  if (labelSearchText.value) {
    merged.labels = labelSearchText.value;
  }
  // Dimension filters (status tiles / chart drill-downs).
  if (filters.status) merged.status = filters.status;
  if (filters.priority) merged.priority = filters.priority;
  if (filters.issue_type) merged.issue_type = filters.issue_type;
  if (props.excludeIssueType) merged.exclude_issue_type = props.excludeIssueType;
  if (filters.assignee) merged.assignee = filters.assignee;
  if (labelFilter.value) merged.labels = labelFilter.value;
  if (goalFilter.value) merged.goal_id = goalFilter.value;
  // Date filter — use due_date when embedded (matching the Overview tab),
  // updated_at range when standalone.
  if (filterDateStr.value) {
    if (props.filterDate !== undefined) {
      merged.due_date = filterDateStr.value;
    } else {
      merged.updated_at_start = filterDateStr.value;
      merged.updated_at_end = filterDateStr.value;
    }
  }
  // Quick filters.
  const now = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  if (quickFilter.value === "my") merged.assignee = "admin";
  else if (quickFilter.value === "open") merged.status = "todo,in_progress";
  else if (quickFilter.value === "high") merged.priority = "urgent,high";
  else if (quickFilter.value === "week") {
    merged.due_date_start = now;
    merged.due_date_end = weekEnd;
  } else if (quickFilter.value === "done") {
    merged.status = "done";
    merged.orderBy = "updated_at";
  }

  const res = await getIssueList(merged);
  let list = (res.data?.list ?? []) as Issue[];
  let total = res.data?.total ?? 0;

  // Merge requirement data from knowledge files (canonical source)
  if (props.projectKey && reqItems.value.length > 0) {
    const reqIssues = buildReqIssues();
    const reqKeySet = new Set(reqIssues.map(r => r.key));
    // Replace API requirement issues with knowledge file data
    list = list.filter(i => i.issue_type !== "requirement" || !reqKeySet.has(i.key));
    // Add requirement items not already in the API list
    for (const ri of reqIssues) {
      if (!list.find(i => i.key === ri.key)) {
        list.unshift(ri);
      }
    }
    total = res.data?.total ?? 0;
  }

  // Keep the store in sync so CSV/JSON export have data to export.
  store.issues = list;
  store.total = total;
  return { data: { list, total, pageNum: merged.pageNum, pageSize: merged.pageSize } };
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    issue_type: "task",
    assignee: "",
    start_date: "",
    due_date: "",
    project_key: props.projectKey || "",
    source: "",
    review_status: "",
    acceptance_criteria: ""
  };
  dialog.visible = true;
}

function openEdit(issue: Issue) {
  dialog.isEdit = true;
  dialog.editKey = issue.key;
  dialog.form = {
    title: issue.title,
    description: issue.description || "",
    status: issue.status,
    priority: issue.priority,
    issue_type: issue.issue_type,
    assignee: issue.assignee || "",
    start_date: issue.start_date || "",
    due_date: issue.due_date || "",
    project_key: issue.project_key,
    source: issue.source || "",
    review_status: issue.review_status || "",
    acceptance_criteria: issue.acceptance_criteria || ""
  };
  dialog.visible = true;
}

async function syncKnowledgeFileIfNeeded() {
  const editedIssue = allIssues.value.find(i => i.key === dialog.editKey);
  if (!editedIssue?.kb_file_path) return;
  // Update in-memory data immediately so the table reflects changes
  const statusCn = mapReqStatusReverse(dialog.form.status);
  const priorityCn = mapReqPriorityReverse(dialog.form.priority);
  updateReqItem(editedIssue.kb_file_path, {
    status: statusCn,
    priority: priorityCn,
    assignee: dialog.form.assignee || ""
  });
  // Persist to knowledge file (best-effort, non-blocking for UI)
  readKnowledgeFile(editedIssue.kb_file_path).then(res => {
    const updatedMeta = { ...res.meta };
    updatedMeta.status = statusCn;
    updatedMeta.priority = priorityCn;
    if (dialog.form.assignee !== undefined) updatedMeta.owner = dialog.form.assignee;
    return writeKnowledgeFile(editedIssue.kb_file_path!, res.content, updatedMeta);
  }).catch(e => {
    console.error("Failed to sync knowledge file:", e);
  });
}

async function submit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editIssue(dialog.editKey, {
        title: dialog.form.title,
        description: dialog.form.description,
        status: dialog.form.status,
        priority: dialog.form.priority,
        issue_type: dialog.form.issue_type,
        assignee: dialog.form.assignee,
        start_date: dialog.form.start_date,
        due_date: dialog.form.due_date,
        source: (dialog.form.source || undefined) as any,
        review_status: (dialog.form.review_status || undefined) as any,
        acceptance_criteria: dialog.form.acceptance_criteria || undefined
      });
      ElMessage.success("Issue updated");
      // Sync knowledge file frontmatter for requirement-type issues
      await syncKnowledgeFileIfNeeded();
    } else {
      const key = `ISS-${Date.now().toString(36).toUpperCase()}`;
      await store.addIssue({
        key,
        project_key: dialog.form.project_key || props.projectKey || "",
        sequence_id: Date.now(),
        title: dialog.form.title,
        description: dialog.form.description,
        status: dialog.form.status,
        priority: dialog.form.priority,
        issue_type: dialog.form.issue_type,
        assignee: dialog.form.assignee,
        labels: [],
        start_date: dialog.form.start_date,
        due_date: dialog.form.due_date,
        source: (dialog.form.source || undefined) as any,
        review_status: (dialog.form.review_status || undefined) as any,
        acceptance_criteria: dialog.form.acceptance_criteria || undefined
      });
      ElMessage.success("Issue created");
    }
    dialog.visible = false;
    refreshTable();
  } catch (e) {
    ElMessage.error((e as Error).message || "Failed to save issue");
  } finally {
    dialog.submitting = false;
  }
}

function handleDelete(row: Issue) {
  useHandleData((params: { key: string; project_key?: string }) => store.removeIssue(params.key, params.project_key), { key: row.key, project_key: props.projectKey }, `Delete issue "${row.title}"`).then(() => {
    refreshTable();
  });
}

function batchDelete(ids: (string | number)[]) {
  ElMessageBox.confirm(`Delete ${ids.length} selected issues?`, "Bulk Delete", {
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    type: "error"
  })
    .then(async () => {
      for (const id of ids) {
        try {
          await store.removeIssue(String(id));
        } catch {
          /* continue */
        }
      }
      ElMessage.success(`${ids.length} issues deleted`);
      refreshTable();
    })
    .catch(() => {});
}

async function bulkChangeStatus(scope: any, status: string) {
  const ids = scope.selectedListIds || [];
  if (!ids.length) return;
  for (const id of ids) {
    try {
      await store.editIssue(String(id), { status: status as IssueStatus });
    } catch {
      /* continue */
    }
  }
  ElMessage.success(`${ids.length} issues → ${ISSUE_STATUS_MAP[status as IssueStatus]}`);
  refreshTable();
}

function openBatchAssign(scope: any) {
  ElMessageBox.prompt("Enter assignee name", "Batch Assign", {
    confirmButtonText: "Assign",
    inputPlaceholder: "Assignee name"
  })
    .then(async ({ value }) => {
      if (!value) return;
      const ids = scope.selectedListIds || [];
      for (const id of ids) {
        try {
          await store.editIssue(String(id), { assignee: value });
        } catch {
          /* continue */
        }
      }
      ElMessage.success(`${ids.length} issues assigned to "${value}"`);
      refreshTable();
    })
    .catch(() => {});
}

function exportCSV() {
  const rows = store.issues;
  if (!rows.length) return ElMessage.warning("No data to export");
  const headers = ["Title", "Type", "Status", "Priority", "Assignee", "Due Date", "Project"];
  const csvRows = [headers.join(",")];
  rows.forEach(r => {
    csvRows.push(
      [r.title, r.issue_type, r.status, r.priority, r.assignee || "", r.due_date || "", r.project_key]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
  });
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "issues-export.csv";
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("CSV exported");
}

function exportJSON() {
  const rows = store.issues;
  if (!rows.length) return ElMessage.warning("No data to export");
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "issues-export.json";
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("JSON exported");
}

function goDetail(key: string) {
  const issue = allIssues.value.find(i => i.key === key) ?? store.issues.find(i => i.key === key);
  if (issue) trackRecent(issue);
  router.push(`/issue/${key}`);
}

async function openPreview(issue: Issue) {
  trackRecent(issue);
  const filePath = getIssueFilePath(issue);

  const defaultContent = [
    `# ${issue.title}`,
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| Key | ${issue.key} |`,
    `| Type | ${typeLabel(issue.issue_type)} |`,
    `| Status | ${statusLabel(issue.status)} |`,
    `| Priority | ${priorityLabel(issue.priority)} |`,
    `| Assignee | ${issue.assignee || "—"} |`,
    `| Start Date | ${issue.start_date || "—"} |`,
    `| Due Date | ${issue.due_date || "—"} |`,
    `| Source | ${issue.source ? sourceLabel(issue.source as IssueSource) : "—"} |`,
    `| Review | ${issue.review_status ? reviewLabel(issue.review_status as ReviewStatus) : "—"} |`,
    `| Estimate | ${issue.estimate_points != null ? issue.estimate_points + " pts" : "—"} |`,
    issue.labels?.length ? `| Labels | ${issue.labels.join(", ")} |` : "",
    issue.description ? `\n${issue.description}` : ""
  ].filter(Boolean).join("\n");

  let content = defaultContent;
  try {
    const res = await readKnowledgeFile(filePath);
    if (res.content) content = res.content;
  } catch {
    try { await writeKnowledgeFile(filePath, defaultContent); } catch { /* best effort */ }
    // Persist the file path so the detail page can find it
    if (!issue.kb_file_path) {
      try { await store.editIssue(issue.key, { kb_file_path: filePath } as any); issue.kb_file_path = filePath; } catch { /* best effort */ }
    }
  }

  previewDlgRef.value?.openFile({
    path: filePath,
    title: issue.title,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent);
    }
  });
}

async function copyKey(key: string) {
  try {
    await navigator.clipboard.writeText(key);
    ElMessage.success(`Copied ${key}`);
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

function statusLabel(status: IssueStatus) {
  return ISSUE_STATUS_MAP[status] || status;
}
function priorityLabel(p: IssuePriority) {
  return ISSUE_PRIORITY_MAP[p] || p;
}

function statusTagType(status: IssueStatus): TagType {
  return ISSUE_STATUS_TAG_MAP[status] || "info";
}
function priorityColor(p: IssuePriority) {
  const map: Record<IssuePriority, string> = {
    urgent: "#f56c6c",
    high: "#e6a23c",
    medium: "#409eff",
    low: "#909399",
    none: "#c0c4cc"
  };
  return map[p] || "#909399";
}
function typeTagType(t: IssueType): TagType {
  return ISSUE_TYPE_TAG_MAP[t] || "info";
}
function sourceLabel(s: IssueSource) {
  return ISSUE_SOURCE_MAP[s] || s;
}
function reviewLabel(s: ReviewStatus) {
  return REVIEW_STATUS_MAP[s] || s;
}
function reviewTagType(s: ReviewStatus): TagType {
  const m: Record<ReviewStatus, TagType> = { pending: "info", approved: "success", rejected: "danger", in_review: "warning" };
  return m[s] || "info";
}

// ── Requirement status/priority mappers (Chinese markdown → Issue enum) ──
function mapReqStatus(s: string): IssueStatus {
  const m: Record<string, IssueStatus> = {
    "待开始": "todo",
    "进行中": "in_progress",
    "已完成": "done",
    "待排期": "backlog",
    "已取消": "cancelled",
    "待评审": "in_review"
  };
  return m[s] || "todo";
}
function mapReqPriority(p: string): IssuePriority {
  const m: Record<string, IssuePriority> = {
    "紧急": "urgent",
    "高": "high",
    "中": "medium",
    "低": "low"
  };
  return m[p] || "medium";
}
function mapReqStatusReverse(s: string): string {
  const m: Record<string, string> = {
    "done": "已完成",
    "in_progress": "进行中",
    "cancelled": "已取消",
    "in_review": "待评审",
    "backlog": "待排期",
    "todo": "待开始"
  };
  return m[s] || "待开始";
}
function mapReqPriorityReverse(p: string): string {
  const m: Record<string, string> = {
    "urgent": "紧急",
    "high": "高",
    "medium": "中",
    "low": "低"
  };
  return m[p] || "中";
}

function formatReqMonth(m: string): string {
  if (m.length === 6) return `${m.slice(0, 4)}-${m.slice(4)}`;
  return m;
}

function buildReqIssues(): Issue[] {
  return reqItems.value.map(r => ({
    key: formatReqMonth(r.prd_month),
    project_key: props.projectKey || "",
    sequence_id: 0,
    title: r.title,
    description: "",
    status: mapReqStatus(r.status),
    priority: mapReqPriority(r.priority),
    issue_type: "requirement" as IssueType,
    assignee: r.assignee || undefined,
    labels: [] as string[],
    estimate_points: r.estimate_frontend || undefined,
    start_date: "",
    due_date: "",
    source: "internal" as IssueSource,
    review_status: "approved" as ReviewStatus,
    goal_id: "",
    kb_file_path: r.path,
    created_at: "",
    updated_at: ""
  }));
}

function applyReqFilters(list: Issue[], searchParams: any): Issue[] {
  let filtered = list;
  const search = (searchText.value || searchParams.title || "").trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(search) ||
      (i.assignee || "").toLowerCase().includes(search) ||
      (i.key || "").toLowerCase().includes(search)
    );
  }
  if (filters.status) {
    const statuses = filters.status.split(",");
    filtered = filtered.filter(i => statuses.includes(i.status));
  }
  if (filters.priority) {
    const priorities = filters.priority.split(",");
    filtered = filtered.filter(i => priorities.includes(i.priority));
  }
  if (filters.assignee) {
    filtered = filtered.filter(i => i.assignee === filters.assignee);
  }
  return filtered;
}

onMounted(async () => {
  const initialLabel = route.query.label;
  if (typeof initialLabel === "string" && initialLabel) labelFilter.value = initialLabel;
  const initialGoal = route.query.goal;
  if (typeof initialGoal === "string" && initialGoal) goalFilter.value = initialGoal;
  await Promise.all([loadStats(), loadNames()]);
  if (props.projectKey) {
    await fetchRequirements(props.projectKey);
  }
});

watch(filterDateStr, () => {
  loadStats();
  refreshTable();
});

// Sync requirement data from knowledge files for requirement-only view
watch(reqItems, (_items) => {
  if (props.filterIssueType !== "requirement") return;
  const mapped = buildReqIssues();
  allIssues.value = mapped;
  cardIssuesAll.value = mapped;
  const s = { total: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, backlog: 0, cancelled: 0 };
  for (const i of mapped) {
    s.total++;
    if (i.status === "todo") s.todo++;
    else if (i.status === "in_progress") s.in_progress++;
    else if (i.status === "in_review") s.in_review++;
    else if (i.status === "done") s.done++;
    else if (i.status === "backlog") s.backlog++;
    else if (i.status === "cancelled") s.cancelled++;
  }
  Object.assign(stats, s);
}, { immediate: true });
</script>

<style scoped lang="scss">
.issue-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}

// ── Header Card ──
.issue-list__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.issue-list__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, #5470c6, #4460b0);
  flex-shrink: 0;
}
.issue-list__header-text {
  min-width: 0;
  flex: 1;
}
.issue-list__header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}
.issue-list__header-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list__header-pills {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.issue-list__header-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  min-width: 64px;
  &--accent {
    background: var(--el-color-primary-light-9);
  }
}
.issue-list__header-pill-val {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.issue-list__header-pill--accent .issue-list__header-pill-val {
  color: var(--el-color-primary);
}
.issue-list__header-pill-lbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
}
.issue-list__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  :deep(.ho__hero-date-nav) {
    margin: 0;
  }
}

// ── Analytics Charts ──
.issue-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.issue-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.issue-chart--active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}
.issue-chart__title {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.issue-chart__badge {
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
  text-transform: none;
}
.issue-chart__body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

// ── Recently Viewed ──
.issue-list__recent {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
}
.issue-list__recent-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 2px;
}
.issue-list__recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  }
}
.issue-list__recent-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.issue-list__recent-key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.issue-list__recent-title {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.issue-list__recent-clear {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 4px;
  &:hover {
    color: var(--el-color-danger);
  }
}

// ── Filter Pills ──
.issue-list__pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.issue-list__pills-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}


// ── Body / Main / Sidebar ──
.issue-list__body {
  display: flex;
  gap: 24px;
}
.issue-list__main {
  flex: 1;
  min-width: 0;
}
.issue-list__sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

// ── Sidebar Section ──
.issue-list__sidebar-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.issue-list__sidebar-section-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
  padding-left: 10px;
}
.issue-list__sidebar-section-label {
  flex: 1;
}
.issue-list__sidebar-section-hint {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
}
.issue-list__sidebar-section-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

// ── Sidebar Card (stat item) ──
.issue-list__sidebar-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--el-bg-color);
  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}
.issue-list__sidebar-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
}
.issue-list__sidebar-card-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}
.issue-list__sidebar-card-value {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.issue-list__sidebar-card-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

// ── Sidebar Card (attention variant) ──
.issue-list__sidebar-card-accent-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.issue-list__sidebar-card-accent-value {
  font-size: 16px;
  font-weight: 700;
  font-family: DIN, sans-serif;
  min-width: 20px;
}
.issue-list__sidebar-card-accent-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  flex: 1;
}
.issue-list__sidebar-card--overdue {
  .issue-list__sidebar-card-accent-icon,
  .issue-list__sidebar-card-accent-value { color: var(--el-color-danger); }
}
.issue-list__sidebar-card--unassigned {
  .issue-list__sidebar-card-accent-icon,
  .issue-list__sidebar-card-accent-value { color: var(--el-color-warning); }
}
.issue-list__sidebar-card--blocked {
  .issue-list__sidebar-card-accent-icon,
  .issue-list__sidebar-card-accent-value { color: var(--el-color-primary); }
}

// ── Sidebar Progress ──
.issue-list__sidebar-progress {
  padding: 0 12px 12px;
}
.issue-list__sidebar-progress-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

// ── Sidebar Quality ──
.issue-list__sidebar-quality {
  padding: 4px 0;
  & + & { padding-top: 8px; }
}
.issue-list__sidebar-quality-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}
.issue-list__sidebar-quality-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-quality-pct {
  font-size: 11px;
  font-weight: 600;
  font-family: DIN, sans-serif;
}

// ── Table cells ──
.issue-list__col-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  span {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-regular);
  }
}
.issue-list__title {
  font-weight: 500;
  justify-content: flex-start;
  padding: 0;
  white-space: normal;
}
.issue-list__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.issue-list__muted {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
.issue-list__source {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list__key {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.issue-list__updated {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.issue-list__points {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 999px;
}
.issue-list__start {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.issue-list__link-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    color 0.15s,
    background 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &--module:hover {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }
  &--goal:hover {
    color: var(--el-color-success);
    background: var(--el-color-success-light-8);
  }
  &--module:hover {
    color: #9b59b6;
    background: #f3e8fb;
  }
}
.issue-list__modules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.issue-list__due--overdue {
  color: var(--el-color-danger);
  font-weight: 600;
  font-size: 12px;
}
.issue-list__due--soon {
  color: var(--el-color-warning);
  font-weight: 500;
  font-size: 12px;
}

// ── Sidebar View Toggle ──
.issue-list__sidebar-view {
  padding: 4px 4px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

// ── Card Grid ──
.issue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 10px;
}
.issue-grid__pager {
  margin-top: 16px;
  justify-content: center;
}
.issue-card {
  padding: 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
}
.issue-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.issue-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.issue-card__key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.issue-card__head-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.issue-card__title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.issue-card__desc {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.issue-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.issue-card__assignee {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  .el-icon { font-size: 13px; }
}
.issue-card__due {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  &--overdue {
    color: var(--el-color-danger);
    font-weight: 600;
  }
}
.issue-card__pts {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 999px;
}
.issue-card__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// ── List View ──
.issue-list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.issue-list-view__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.issue-list-view__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.issue-list-view__key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.issue-list-view__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.issue-list-view__assignee {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.issue-list-view__due {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  &--overdue {
    color: var(--el-color-danger);
    font-weight: 600;
  }
}
</style>
