<template>
  <div class="issue-list">
    <PageHeaderCard
      v-if="!props.projectKey"
      :icon="Tickets"
      icon-bg="linear-gradient(135deg, #5470c6, #4460b0)"
      :title="$t('issue.list.title')"
      :description="$t('issue.list.description')"
      :pills="headerPills"
      :show-date-nav="!props.filterDate"
      :filter-date="filterDate"
      :filter-date-label="filterDateLabel"
      :is-filter-today="isFilterToday"
      @prev="goToPrevDay"
      @next="goToNextDay"
      @today="goToFilterToday"
      @clear="clearFilterDate"
    />

    <IssueAnalyticsCharts
      v-if="!props.projectKey"
      :active-filter="filters"
      :status-donut-option="statusDonutOption"
      :priority-bar-option="priorityBarOption"
      :type-bar-option="typeBarOption"
      :assignee-bar-option="assigneeBarOption"
      :trend-option="trendOption"
      @chart-click="onChartClick"
    />

    <IssueRecentlyViewed
      v-if="!props.projectKey"
      :items="recentlyViewed"
      :status-color="statusColor"
      @click="goDetail"
      @clear="recentlyViewed = []"
    />

    <div v-if="activePills.length && filterIssueType !== 'requirement'" class="issue-list__pills">
      <span class="issue-list__pills-label">{{ $t("issue.list.filters") }}</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="removePill(p)">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">{{ $t("issue.list.clearAll") }}</el-button>
    </div>

    <div class="issue-list__body">
      <IssueSidebar
        v-if="!props.projectKey"
        v-model:view-mode="viewMode"
        :overview-stats="overviewStats"
        :completion-pct="completionPct"
        :attention-stats="attentionStats"
        :completeness="completeness"
        :all-issues-count="allIssues.length"
      />

      <div class="issue-list__main">
        <template v-if="viewMode === 'table'">
          <ProTable
            ref="proTable"
            :title="$t('issue.list.title')"
            :columns="columns"
            :request-api="fetchIssues"
            :pagination="true"
            :default-page-size="50"
            :row-key="props.filterIssueType === 'requirement' ? 'kb_file_path' : 'key'"
          >
            <template #tableHeader="scope">
              <el-dropdown v-if="props.filterIssueType !== 'requirement'" :disabled="!scope.isSelected" trigger="click">
                <el-button type="warning" plain :disabled="!scope.isSelected">
                  {{ $t("issue.list.bulkActions") }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="bulkChangeStatus(scope, 'todo')">{{
                      $t("issue.list.setStatusTodo")
                    }}</el-dropdown-item>
                    <el-dropdown-item @click="bulkChangeStatus(scope, 'in_progress')">{{
                      $t("issue.list.setStatusInProgress")
                    }}</el-dropdown-item>
                    <el-dropdown-item @click="bulkChangeStatus(scope, 'done')">{{
                      $t("issue.list.setStatusDone")
                    }}</el-dropdown-item>
                    <el-dropdown-item divided @click="openBatchAssign(scope)">{{ $t("issue.list.assignTo") }}</el-dropdown-item>
                    <el-dropdown-item divided @click="batchDelete(scope.selectedListIds)">{{
                      $t("issue.list.deleteSelected")
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template #titleHeader>
              <div class="issue-list__col-head">
                <span>{{ $t("issue.table.title") }}</span>
                <el-input
                  v-model="searchText"
                  size="small"
                  :placeholder="$t('issue.list.search')"
                  clearable
                  @change="refreshTable"
                />
              </div>
            </template>
            <template #keyHeader>
              <div class="issue-list__col-head">
                <span>{{ $t("issue.table.key") }}</span>
                <el-input
                  v-model="keySearchText"
                  size="small"
                  :placeholder="$t('issue.table.key') + '…'"
                  clearable
                  @change="refreshTable"
                />
              </div>
            </template>
            <template #key="scope">
              <template v-if="props.filterIssueType === 'requirement'">
                <span class="issue-list__month">{{ scope.row.key }}</span>
              </template>
              <template v-else>
                <code class="issue-list__key" title="Copy key" @click="copyKey(scope.row.key)">{{ scope.row.key }}</code>
              </template>
            </template>
            <template #title="scope">
              <el-button link type="primary" class="issue-list__title" @click="openPreview(scope.row)">
                {{ scope.row.title?.split("-")?.[2] || scope.row.title }}
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
                <span>{{ $t("issue.table.labels") }}</span>
                <el-input
                  v-model="labelSearchText"
                  size="small"
                  :placeholder="$t('issue.table.labels') + '…'"
                  clearable
                  @change="refreshTable"
                />
              </div>
            </template>
            <template #labels="scope">
              <div
                v-if="scope.row.labels?.length"
                :class="props.filterIssueType === 'requirement' ? 'issue-list__okr-labels' : 'issue-list__labels'"
              >
                <template v-if="props.filterIssueType === 'requirement'">
                  <button
                    v-for="l in scope.row.labels"
                    :key="l"
                    type="button"
                    class="issue-list__okr-chip"
                    :title="goalDisplayMeta(l).tooltip"
                    @click="openOkrFile(l)"
                  >
                    <span class="issue-list__okr-row">
                      <span class="issue-list__okr-icon">{{ goalDisplayMeta(l).icon }}</span>
                      <span class="issue-list__okr-title">{{ goalDisplayMeta(l).title }}</span>
                    </span>
                    <span class="issue-list__okr-row issue-list__okr-meta">
                      <el-tag
                        v-if="goalDisplayMeta(l).statusTag"
                        size="small"
                        effect="light"
                        :type="goalDisplayMeta(l).statusTagType"
                        >{{ goalDisplayMeta(l).statusTag }}</el-tag
                      >
                      <code class="issue-list__okr-id">{{ l }}</code>
                    </span>
                  </button>
                </template>
                <template v-else>
                  <el-tag v-for="l in scope.row.labels" :key="l" size="small" round effect="plain">{{ l }}</el-tag>
                </template>
              </div>
              <span v-else class="issue-list__muted">—</span>
            </template>
            <template #dev_tasks="scope">
              <div v-if="prdLinks(scope.row).dev.length" class="issue-list__doc-links">
                <button
                  v-for="d in prdLinks(scope.row).dev"
                  :key="d.path"
                  type="button"
                  class="issue-list__doc-chip"
                  :title="d.path"
                  @click="openDocLink(d.path)"
                >
                  开发任务
                </button>
              </div>
              <span v-else class="issue-list__muted">—</span>
            </template>
            <template #tests="scope">
              <div v-if="prdLinks(scope.row).tests.length" class="issue-list__doc-links">
                <button
                  v-for="d in prdLinks(scope.row).tests"
                  :key="d.path"
                  type="button"
                  class="issue-list__doc-chip"
                  :title="d.path"
                  @click="openDocLink(d.path)"
                >
                  测试用例
                </button>
              </div>
              <span v-else class="issue-list__muted">—</span>
            </template>
            <template #assigneeHeader>
              <div class="issue-list__col-head">
                <span>{{ $t("issue.table.assignee") }}</span>
                <el-input
                  v-model="assigneeSearchText"
                  size="small"
                  :placeholder="$t('issue.dialog.assigneePlaceholder')"
                  clearable
                  @change="refreshTable"
                />
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
              <el-tooltip :content="$t('common.view')" placement="top">
                <el-button type="primary" link :icon="ViewIcon" @click="openPreview(scope.row)"></el-button>
              </el-tooltip>
              <el-tooltip :content="$t('common.edit')" placement="top">
                <el-button
                  type="primary"
                  link
                  :icon="EditIcon"
                  @click="props.filterIssueType === 'requirement' ? openPrdEdit(scope.row) : openEdit(scope.row)"
                ></el-button>
              </el-tooltip>
              <el-tooltip :content="$t('common.delete')" placement="top">
                <el-button
                  type="danger"
                  link
                  :icon="DeleteIcon"
                  :loading="deletingId === rowId(scope.row)"
                  @click="handleDelete(scope.row)"
                ></el-button>
              </el-tooltip>
            </template>
          </ProTable>
        </template>

        <template v-else-if="viewMode === 'card'">
          <div class="issue-grid">
            <div v-for="issue in cardIssues" :key="issue.key" class="issue-card" @click="openPreview(issue)">
              <div class="issue-card__head">
                <span class="issue-card__dot" :style="{ background: statusColor(issue.status) }" />
                <code class="issue-card__key">{{ issue.key }}</code>
                <div class="issue-card__head-right">
                  <el-tag :type="priorityTagType(issue.priority)" size="small" effect="plain">{{
                    priorityLabel(issue.priority)
                  }}</el-tag>
                  <el-tag :type="typeTagType(issue.issue_type)" size="small" effect="plain">{{
                    typeLabel(issue.issue_type)
                  }}</el-tag>
                </div>
              </div>
              <h3 class="issue-card__title">{{ issue.title }}</h3>
              <p v-if="issue.description" class="issue-card__desc">{{ truncateDesc(issue.description) }}</p>
              <div class="issue-card__meta">
                <el-tag :type="statusTagType(issue.status)" size="small">{{ statusLabel(issue.status) }}</el-tag>
                <span v-if="issue.assignee" class="issue-card__assignee">
                  <el-icon><UserIcon /></el-icon> {{ issue.assignee }}
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
        </template>

        <template v-else>
          <div class="issue-list-view">
            <div v-for="issue in cardIssues" :key="issue.key" class="issue-list-view__row" @click="openPreview(issue)">
              <span class="issue-list-view__dot" :style="{ background: statusColor(issue.status) }" />
              <code class="issue-list-view__key">{{ issue.key }}</code>
              <span class="issue-list-view__title">{{ issue.title }}</span>
              <el-tag :type="typeTagType(issue.issue_type)" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
              <el-tag :type="priorityTagType(issue.priority)" size="small" effect="plain">{{
                priorityLabel(issue.priority)
              }}</el-tag>
              <el-tag :type="statusTagType(issue.status)" size="small">{{ statusLabel(issue.status) }}</el-tag>
              <span v-if="issue.assignee" class="issue-list-view__assignee">{{ issue.assignee }}</span>
              <span v-if="issue.due_date" class="issue-list-view__due" :class="dueClass(issue)">{{
                formatDate(issue.due_date)
              }}</span>
            </div>
          </div>
        </template>

        <el-pagination
          v-if="viewMode !== 'table' && cardTotal > cardPageSize"
          class="issue-grid__pager"
          layout="prev, pager, next"
          :page-size="cardPageSize"
          :total="cardTotal"
          :current-page="cardPage"
          @current-change="onCardPage"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? $t('issue.dialog.editTitle') : $t('issue.dialog.createTitle')"
      width="640px"
      destroy-on-close
    >
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

    <!-- ═══ PRD Edit Dialog (requirement items only) ═══ -->
    <el-dialog v-model="prdDialog.visible" title="编辑 PRD 需求" width="560px" destroy-on-close>
      <div v-loading="prdDialog.loading" class="prd-dialog">
        <el-form :model="prdDialog.form" label-width="100px">
          <el-form-item label="标题">
            <el-input :model-value="prdDialog.form.title" disabled />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-select v-model="prdDialog.form.status" style="width: 100%">
                  <el-option v-for="s in PRD_STATUS_OPTIONS" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级">
                <el-select v-model="prdDialog.form.priority" style="width: 100%">
                  <el-option v-for="p in PRD_PRIORITY_OPTIONS" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="负责人">
                <el-input v-model="prdDialog.form.owner" placeholder="Owner" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="前端人天">
                <el-input-number v-model="prdDialog.form.estimateFrontend" :min="0" :precision="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-divider style="margin: 16px 0" />

        <div class="prd-dialog__section">
          <div class="prd-dialog__section-head">
            <span class="prd-dialog__section-title">开发任务</span>
            <span class="prd-dialog__section-count">{{ prdDialog.devLinks.length }}</span>
          </div>
          <div v-if="prdDialog.devLinks.length" class="prd-dialog__links">
            <div v-for="link in prdDialog.devLinks" :key="link.path" class="prd-dialog__link-row">
              <el-button link type="primary" class="prd-dialog__link-name" @click="openDocLink(link.path)">{{
                link.title
              }}</el-button>
              <el-button link type="danger" size="small" @click="removePrdLink(link, 'dev')">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
          <span v-else class="issue-list__muted">暂无关联开发任务</span>
        </div>

        <el-divider style="margin: 12px 0" />

        <div class="prd-dialog__section">
          <div class="prd-dialog__section-head">
            <span class="prd-dialog__section-title">测试用例</span>
            <span class="prd-dialog__section-count">{{ prdDialog.testLinks.length }}</span>
          </div>
          <div v-if="prdDialog.testLinks.length" class="prd-dialog__links">
            <div v-for="link in prdDialog.testLinks" :key="link.path" class="prd-dialog__link-row">
              <el-button link type="primary" class="prd-dialog__link-name" @click="openDocLink(link.path)">{{
                link.title
              }}</el-button>
              <el-button link type="danger" size="small" @click="removePrdLink(link, 'test')">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
          <span v-else class="issue-list__muted">暂无关联测试用例</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="prdDialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="prdDialog.submitting" @click="submitPrdEdit">保存</el-button>
      </template>
    </el-dialog>

    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="tsx" name="issueList">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Delete as DeleteIcon, View as ViewIcon, Edit as EditIcon, ArrowDown, Tickets, Close } from "@element-plus/icons-vue";
import { User as UserIcon } from "@element-plus/icons-vue";
import type { Component } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { CircleCheckFilled, Clock, User, Link, Loading } from "@element-plus/icons-vue";
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
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { PageHeaderCard, ProTable } from "@/components";
import type { ColumnProps, ProTableInstance } from "@/components";
import { useDateFilter } from "@/hooks/useDateFilter";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { deleteKnowledgeFile, readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { goalRoleMap, allGoalsMap } from "@/views/knowledge/executive/okrData";
import { useRequirements, type LinkedDocInfo } from "@/views/project/composables/useRequirements";
import IssueSidebar from "./components/IssueSidebar.vue";
import IssueAnalyticsCharts from "./components/IssueAnalyticsCharts.vue";
import IssueRecentlyViewed from "./components/IssueRecentlyViewed.vue";
import { useIssueStats, STATUS_COLOR, buildReqIssues } from "./composables/useIssueStats";
import { useIssueCharts } from "./composables/useIssueCharts";
import { useIssueDialog, type IssueForm } from "./composables/useIssueDialog";
import { useIssueExport } from "./composables/useIssueExport";
import { useIssueBulkOps } from "./composables/useIssueBulkOps";

const props = defineProps<{
  projectKey?: string;
  filterIssueType?: string;
  excludeIssueType?: string;
  filterDate?: Date | null;
}>();

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const store = useIssueStore();
const proTable = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const quickFilter = ref("");
const labelFilter = ref("");
const goalFilter = ref("");

const {
  items: reqItems,
  loading: reqLoading,
  fetch: fetchRequirements,
  updateItem: updateReqItem,
  okrFileMap,
  linksForPrd
} = useRequirements();
const filters = reactive<{ status: string; priority: string; issue_type: string; assignee: string }>({
  status: "",
  priority: "",
  issue_type: props.filterIssueType || "",
  assignee: ""
});
const searchText = ref("");
const keySearchText = ref("");
const assigneeSearchText = ref("");
const labelSearchText = ref("");
const viewMode = ref<"table" | "card" | "list">("table");
const cardPage = ref(1);
const cardPageSize = 20;

const cardIssues = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize;
  return cardIssuesAll.value.slice(start, start + cardPageSize);
});
const cardTotal = computed(() => cardIssuesAll.value.length);
function onCardPage(p: number) {
  cardPage.value = p;
}

function formatMonth(iso: string): string {
  if (!iso) return "-";
  return iso.slice(0, 7);
}

function truncateDesc(text: string): string {
  const plain = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/>\s/g, "")
    .replace(/[-*+]\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
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

const _filterDate = ref<Date | null>(null);
const filterDate = computed({
  get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
  set: v => {
    _filterDate.value = v;
  }
});
const {
  label: filterDateLabel,
  isToday: isFilterToday,
  filterDateStr,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate
} = useDateFilter(filterDate);

const {
  allIssues,
  cardIssuesAll,
  stats,
  openCount,
  completionPct,
  headerPills,
  recentlyViewed,
  trackRecent,
  statusDist,
  priorityDist,
  typeDist,
  assigneeDist,
  createdByDay,
  loadStats,
  completeness,
  attention,
  syncRequirementStats,
  modulesForIssue,
  projectName
} = useIssueStats(props, { filterDateStr, reqItems, reqLoading, fetchRequirements });

const { statusDonutOption, priorityBarOption, typeBarOption, assigneeBarOption, trendOption } = useIssueCharts({
  statusDist,
  priorityDist,
  typeDist,
  assigneeDist,
  createdByDay
});

function statusColor(s: IssueStatus) {
  return STATUS_COLOR[s] || "#909399";
}

const overviewStats = computed<Array<{ icon: Component; iconBg: string; value: number; label: string; onClick?: () => void }>>(
  () => [
    {
      icon: Tickets,
      iconBg: "linear-gradient(135deg,#5470c6,#4460b0)",
      value: stats.total,
      label: "Total",
      onClick: () => router.push("/issue")
    },
    {
      icon: Loading,
      iconBg: "linear-gradient(135deg,#5ab1ef,#3a90d0)",
      value: openCount.value,
      label: "Open",
      onClick: () => applyAttentionFilter("unassigned")
    },
    { icon: Link, iconBg: "linear-gradient(135deg,#e6a23c,#d49520)", value: stats.in_review, label: "In Review" },
    { icon: CircleCheckFilled, iconBg: "linear-gradient(135deg,#91cc75,#7ab85e)", value: stats.done, label: "Done" }
  ]
);

const attentionStats = computed<
  Array<{ icon: Component; value: number; label: string; accentClass: string; onClick?: () => void }>
>(() => [
  {
    icon: Clock,
    value: attention.value.overdue,
    label: "Overdue",
    accentClass: "issue-list__sidebar-card--overdue",
    onClick: () => applyAttentionFilter("overdue")
  },
  {
    icon: User,
    value: attention.value.unassigned,
    label: "Unassigned",
    accentClass: "issue-list__sidebar-card--unassigned",
    onClick: () => applyAttentionFilter("unassigned")
  },
  {
    icon: Link,
    value: attention.value.blocked,
    label: "Blocked",
    accentClass: "issue-list__sidebar-card--blocked",
    onClick: () => applyAttentionFilter("blocked")
  }
]);

function goGoal(goalId: string) {
  const role = goalRoleMap[goalId];
  if (role) router.push(`/knowledge/executive/okr?role=${role}&goal=${goalId}`);
}
const goalLabel = (goalId: string) => allGoalsMap[goalId]?.title || goalId;

function okrFileName(goalId: string): string {
  return okrFileMap.value.get(goalId)?.title || goalId;
}

/** Merge role-level allGoalsMap with project-level okrFileMap for unified OKR chip display. */
interface GoalDisplayMeta {
  icon: string;
  title: string;
  statusTag: string;
  statusTagType: "success" | "warning" | "info" | "primary" | "danger" | undefined;
  tooltip: string;
}
const projectGoalMetaCache = computed<Map<string, GoalDisplayMeta>>(() => {
  const map = new Map<string, GoalDisplayMeta>();
  // Role-level goals from okrData.ts
  for (const [id, g] of Object.entries(allGoalsMap)) {
    const statusTagType = (
      g.status === "active" || g.status === "completed"
        ? "success"
        : g.status === "planned" || g.status === "in_progress"
          ? "warning"
          : g.status === "blocked"
            ? "danger"
            : "info"
    ) as GoalDisplayMeta["statusTagType"];
    map.set(id, {
      icon: g.icon,
      title: g.title,
      statusTag: g.status,
      statusTagType,
      tooltip: `${g.description}\nOwner: ${g.owner} · ${g.period}`
    });
  }
  // Project-level goals from OKR file frontmatter
  for (const [id, info] of okrFileMap.value.entries()) {
    if (map.has(id)) continue; // role-level takes priority
    const pctLabel = info.progress ? ` · ${info.progress}%` : "";
    const statusTagType = (
      info.status === "completed"
        ? "success"
        : info.status === "in_progress"
          ? "warning"
          : info.status === "blocked"
            ? "danger"
            : "info"
    ) as GoalDisplayMeta["statusTagType"];
    map.set(id, {
      icon: "🎯",
      title: info.title || id,
      statusTag: info.status || "",
      statusTagType,
      tooltip: `${info.title || id}${pctLabel}\n${info.period || ""}${info.owner ? ` · ${info.owner}` : ""}`
    });
  }
  return map;
});

function goalDisplayMeta(goalId: string): GoalDisplayMeta {
  return (
    projectGoalMetaCache.value.get(goalId) || {
      icon: "🎯",
      title: okrFileName(goalId),
      statusTag: "",
      statusTagType: "info",
      tooltip: goalId
    }
  );
}

function openOkrFile(goalId: string) {
  const info = okrFileMap.value.get(goalId);
  if (info) previewDlgRef.value?.open(info.path);
}

/** Dev tasks / test specs linked to a PRD row, resolved from its knowledge path. */
const prdLinks = (row: Issue) => linksForPrd(row.kb_file_path);

function openDocLink(path: string) {
  if (path) previewDlgRef.value?.open(path);
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

const goProject = (key: string) => {
  if (key) router.push(`/project/${key}`);
};
const goModule = (key: string) => {
  if (key) router.push(`/module/${key}`);
};

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
  if (type === "overdue") filters.status = "todo,in_progress,in_review";
  refreshTable();
}

function onChartClick(dim: "status" | "priority" | "issue_type" | "assignee", e: { name?: string }) {
  const name = e?.name;
  if (!name) return;
  filters[dim] = filters[dim] === name ? "" : name;
  refreshTable();
}

interface Pill {
  id: string;
  label: string;
  clear: () => void;
}
const activePills = computed<Pill[]>(() => {
  const builders: Array<() => Pill | null> = [
    () =>
      quickFilter.value
        ? {
            id: "qf",
            label: quickFilters.find(q => q.key === quickFilter.value)?.label || quickFilter.value,
            clear: () => {
              quickFilter.value = "";
            }
          }
        : null,
    () =>
      filters.status
        ? {
            id: "status",
            label: `Status: ${ISSUE_STATUS_MAP[filters.status as IssueStatus] || filters.status}`,
            clear: () => {
              filters.status = "";
            }
          }
        : null,
    () =>
      filters.priority
        ? {
            id: "priority",
            label: `Priority: ${ISSUE_PRIORITY_MAP[filters.priority as IssuePriority] || filters.priority}`,
            clear: () => {
              filters.priority = "";
            }
          }
        : null,
    () =>
      filters.issue_type
        ? {
            id: "type",
            label: `Type: ${ISSUE_TYPE_MAP[filters.issue_type as IssueType] || filters.issue_type}`,
            clear: () => {
              filters.issue_type = "";
            }
          }
        : null,
    () =>
      filters.assignee
        ? {
            id: "assignee",
            label: `Assignee: ${filters.assignee}`,
            clear: () => {
              filters.assignee = "";
            }
          }
        : null,
    () =>
      labelFilter.value
        ? {
            id: "label",
            label: `Label: ${labelFilter.value}`,
            clear: () => {
              labelFilter.value = "";
            }
          }
        : null,
    () =>
      goalFilter.value
        ? {
            id: "goal",
            label: `Goal: ${goalLabel(goalFilter.value)}`,
            clear: () => {
              goalFilter.value = "";
            }
          }
        : null
  ];
  return builders.map(b => b()).filter(Boolean) as Pill[];
});

function removePill(p: Pill) {
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
  try {
    if (!props.projectKey) await loadStats();
    refreshTable();
  } catch {
    // best effort
  }
}

const columns = computed<ColumnProps<Issue>[]>(() => {
  if (props.filterIssueType === "requirement") {
    return [
      { prop: "key", label: t("issue.table.month"), width: 100 },
      { prop: "title", label: t("issue.table.title"), minWidth: 240 },
      { prop: "labels", label: t("issue.table.linkedOkr"), width: 280 },
      { prop: "dev_tasks", label: t("issue.table.devTask"), width: 120 },
      { prop: "tests", label: t("issue.table.test"), width: 120 },
      { prop: "status", label: t("issue.table.status"), width: 100 },
      { prop: "operation", label: t("issue.table.actions"), width: 190, fixed: "right" }
    ];
  }
  const coreCols: ColumnProps<Issue>[] = [
    { type: "selection", width: 50 },
    { prop: "key", label: t("issue.table.key"), width: 120 },
    { prop: "title", label: t("issue.table.title"), minWidth: 220 },
    { prop: "issue_type", label: t("issue.table.type"), width: 105 },
    { prop: "priority", label: t("issue.table.priority"), width: 92 },
    { prop: "estimate_points", label: t("issue.table.points"), width: 80 },
    { prop: "status", label: t("issue.table.status"), width: 110 },
    { prop: "labels", label: t("issue.table.labels"), width: 150 },
    { prop: "source", label: t("issue.table.source"), width: 105 },
    { prop: "review_status", label: t("issue.table.review"), width: 105 }
  ];
  const projectCol: ColumnProps<Issue> = { prop: "project_key", label: t("issue.table.project"), width: 130 };
  const tailCols: ColumnProps<Issue>[] = [
    { prop: "module", label: t("issue.table.module"), width: 120 },
    { prop: "goal_id", label: t("issue.table.goal"), width: 120 },
    { prop: "assignee", label: t("issue.table.assignee"), width: 100 },
    { prop: "start_date", label: t("issue.table.start"), width: 110 },
    { prop: "due_date", label: t("issue.table.due"), width: 135 },
    { prop: "created_at", label: t("issue.table.created"), width: 120 },
    { prop: "updated_at", label: t("issue.table.updated"), width: 120 },
    { prop: "operation", label: t("issue.table.actions"), width: 190, fixed: "right" }
  ];
  return [...coreCols, ...(props.projectKey ? [] : [projectCol]), ...tailCols];
});

// ── PRD edit state (requirement items use a dedicated dialog) ──
const PRD_STATUS_OPTIONS = ["已完成", "进行中", "未开始", "部分完成", "已取消", "待评审", "待排期"];
const PRD_PRIORITY_OPTIONS = ["P0", "P1", "P2", "P3"];

const prdDialog = reactive({
  visible: false,
  loading: false,
  submitting: false,
  filePath: "",
  form: { title: "", status: "进行中", priority: "P1", owner: "", estimateFrontend: 0 },
  devLinks: [] as LinkedDocInfo[],
  testLinks: [] as LinkedDocInfo[]
});

async function openPrdEdit(row: Issue) {
  const filePath = (row as any).kb_file_path;
  if (!filePath) return;
  prdDialog.filePath = filePath;
  prdDialog.loading = true;
  prdDialog.form = { title: "", status: "进行中", priority: "P1", owner: "", estimateFrontend: 0 };
  prdDialog.devLinks = [];
  prdDialog.testLinks = [];
  try {
    const res = await readKnowledgeFile(filePath);
    const meta = res.meta || {};
    prdDialog.form.title = (meta.title as string) || row.title || "";
    prdDialog.form.status = (meta.status as string) || "进行中";
    prdDialog.form.priority = (meta.priority as string) || "P1";
    prdDialog.form.owner = (meta.owner as string) || "";
    prdDialog.form.estimateFrontend = (meta.estimate_frontend as number) || 0;
    const links = linksForPrd(filePath);
    prdDialog.devLinks = [...links.dev];
    prdDialog.testLinks = [...links.tests];
  } catch {
    prdDialog.form.title = row.title || "";
    ElMessage.warning("无法读取 PRD 文件，部分信息可能不完整");
  } finally {
    prdDialog.loading = false;
  }
  prdDialog.visible = true;
}

async function removePrdLink(link: LinkedDocInfo, type: "dev" | "test") {
  const label = type === "dev" ? "开发任务" : "测试用例";
  try {
    await ElMessageBox.confirm(`确定要取消关联${label}「${link.title}」吗？此操作会修改对应文档的 frontmatter。`, "取消关联", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return;
  }
  try {
    const res = await readKnowledgeFile(link.path);
    const meta = { ...res.meta };
    if (type === "dev") {
      delete meta.source_prd;
    } else {
      const prds = (Array.isArray(meta.source_prds) ? meta.source_prds : []) as string[];
      const prdBasename = prdDialog.filePath.split("/").pop() || "";
      meta.source_prds = prds.filter((p: string) => p !== prdBasename && p !== prdDialog.filePath);
    }
    await writeKnowledgeFile(link.path, res.content, meta);
    if (type === "dev") {
      prdDialog.devLinks = prdDialog.devLinks.filter(l => l.path !== link.path);
    } else {
      prdDialog.testLinks = prdDialog.testLinks.filter(l => l.path !== link.path);
    }
    if (props.projectKey) await fetchRequirements(props.projectKey);
    refreshTable();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "移除关联失败");
  }
}

async function submitPrdEdit() {
  prdDialog.submitting = true;
  try {
    const res = await readKnowledgeFile(prdDialog.filePath);
    const updatedMeta = {
      ...res.meta,
      status: prdDialog.form.status,
      priority: prdDialog.form.priority,
      owner: prdDialog.form.owner,
      estimate_frontend: prdDialog.form.estimateFrontend
    };
    await writeKnowledgeFile(prdDialog.filePath, res.content, updatedMeta);
    prdDialog.visible = false;
    if (props.projectKey) await fetchRequirements(props.projectKey);
    ElMessage.success("PRD 更新成功");
    refreshTable();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "保存失败");
  } finally {
    prdDialog.submitting = false;
  }
}

const { dialog, rules, openEdit, submit } = useIssueDialog(props, {
  store,
  formRef,
  allIssues,
  refreshTable
});

const { batchDelete, bulkChangeStatus, openBatchAssign } = useIssueBulkOps({
  store,
  refreshTable
});

const { exportCSV, exportJSON } = useIssueExport(() => store.issues);

const deletingId = ref("");
/** Unique per rendered row — requirement rows share a month as `key`. */
const rowId = (row: Issue) => row.kb_file_path || row.key;

async function handleDelete(row: Issue) {
  // Requirement rows are projections of a markdown PRD — there the file IS the record.
  const isPrd = props.filterIssueType === "requirement";
  // For a normal issue only touch a file we know exists: `openPreview` writes the
  // markdown lazily and records the path, so an absent path means nothing was written.
  const filePath = isPrd ? row.kb_file_path || getIssueFilePath(row) : row.kb_file_path || "";

  const confirmMessage = isPrd
    ? t("issue.dialog.deletePrdConfirm", { title: row.title, path: filePath })
    : filePath
      ? t("issue.dialog.deleteWithFileConfirm", { title: row.title, path: filePath })
      : t("issue.dialog.deleteConfirm", { title: row.title });

  try {
    await ElMessageBox.confirm(confirmMessage, isPrd ? t("issue.dialog.deletePrdTitle") : t("issue.dialog.deleteTitle"), {
      confirmButtonText: t("issue.dialog.delete"),
      cancelButtonText: t("issue.dialog.cancel"),
      type: "error"
    });
  } catch {
    return; // dismissed
  }

  deletingId.value = rowId(row);
  try {
    if (isPrd) {
      const res = await deleteKnowledgeFile(filePath);
      if (!res.deleted) throw new Error(t("issue.error.deleteFailed"));
      // The file list drives this table, not the issues collection
      if (props.projectKey) await fetchRequirements(props.projectKey);
      ElMessage.success(t("issue.dialog.deleteSuccess"));
    } else {
      await store.removeIssue(row.key, props.projectKey);
      ElMessage.success(t("issue.dialog.deleteSuccess"));
      // Clean up the markdown that `openPreview` generated, so it doesn't linger
      // as an orphan. Best-effort: the record is already gone, so a leftover file
      // is clutter to report, not a failed delete to retry.
      if (filePath) {
        try {
          await deleteKnowledgeFile(filePath);
        } catch {
          ElMessage.warning(t("issue.error.fileCleanupFailed", { path: filePath }));
        }
      }
    }
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : t("issue.error.deleteFailed"));
  } finally {
    deletingId.value = "";
  }
  refreshTable();
}

function goDetail(key: string) {
  const issue = allIssues.value.find(i => i.key === key) ?? store.issues.find(i => i.key === key);
  if (issue) openPreview(issue);
}

async function openPreview(issue: Issue) {
  trackRecent(issue);
  const filePath = getIssueFilePath(issue);
  const rows: Array<[string, string]> = [
    ["Key", issue.key],
    ["Type", typeLabel(issue.issue_type)],
    ["Status", statusLabel(issue.status)],
    ["Priority", priorityLabel(issue.priority)],
    ["Assignee", issue.assignee || "—"],
    ["Start Date", issue.start_date || "—"],
    ["Due Date", issue.due_date || "—"],
    ["Source", issue.source ? sourceLabel(issue.source as IssueSource) : "—"],
    ["Review", issue.review_status ? reviewLabel(issue.review_status as ReviewStatus) : "—"],
    ["Estimate", issue.estimate_points != null ? issue.estimate_points + " pts" : "—"]
  ];
  if (issue.labels?.length) rows.push(["Labels", issue.labels.join(", ")]);
  const header =
    `# ${issue.title}\n\n| Field | Value |\n|-------|-------|\n` + rows.map(([k, v]) => `| ${k} | ${v} |`).join("\n");
  const defaultContent = header + (issue.description ? `\n\n${issue.description}` : "");
  let content = defaultContent;
  try {
    const res = await readKnowledgeFile(filePath);
    if (res.content) content = res.content;
  } catch {
    try {
      await writeKnowledgeFile(filePath, defaultContent);
    } catch {
      /* best effort */
    }
    if (!(issue as any).kb_file_path) {
      try {
        await store.editIssue(issue.key, { kb_file_path: filePath } as any);
        (issue as any).kb_file_path = filePath;
      } catch {
        /* best effort */
      }
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
    ElMessage.success(t("issue.message.copied", { key }));
  } catch {
    ElMessage.warning(t("issue.message.clipboardUnavailable"));
  }
}

const statusLabel = (status: IssueStatus) => ISSUE_STATUS_MAP[status] || status;
const priorityLabel = (p: IssuePriority) => ISSUE_PRIORITY_MAP[p] || p;
const statusTagType = (status: IssueStatus): TagType => ISSUE_STATUS_TAG_MAP[status] || "info";
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
const typeTagType = (t: IssueType): TagType => ISSUE_TYPE_TAG_MAP[t] || "info";
const sourceLabel = (s: IssueSource) => ISSUE_SOURCE_MAP[s] || s;
const reviewLabel = (s: ReviewStatus) => REVIEW_STATUS_MAP[s] || s;
function reviewTagType(s: ReviewStatus): TagType {
  const m: Record<ReviewStatus, TagType> = { pending: "info", approved: "success", rejected: "danger", in_review: "warning" };
  return m[s] || "info";
}

function applyReqFilters(list: Issue[], searchParams: any): Issue[] {
  let filtered = list;
  const search = (searchText.value || searchParams.title || "").trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(i => i.title.toLowerCase().includes(search) || (i.key || "").toLowerCase().includes(search));
  }
  const multiMatch = (value: string, filter: string) => !filter || filter.split(",").includes(value);
  if (filters.status) filtered = filtered.filter(i => multiMatch(i.status, filters.status));
  return filtered;
}

async function waitForRequirementsIfNeeded(projectKey: string) {
  if (reqItems.value.length > 0) return;
  if (!reqLoading.value) {
    await fetchRequirements(projectKey);
    return;
  }
  await new Promise<void>(resolve => {
    const stop = watch(reqLoading, v => {
      if (!v) {
        stop();
        resolve();
      }
    });
  });
}

function buildApiParams(pageNum: number, pageSize: number, searchParams: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { pageNum, pageSize, project_key: props.projectKey, ...searchParams };
  if (merged.title) {
    merged.search = merged.title;
    delete merged.title;
  }
  if (searchText.value) merged.search = searchText.value;
  if (keySearchText.value) merged.key = keySearchText.value;
  if (assigneeSearchText.value) merged.assignee = assigneeSearchText.value;
  if (labelSearchText.value) merged.labels = labelSearchText.value;
  if (filters.status) merged.status = filters.status;
  if (filters.priority) merged.priority = filters.priority;
  if (filters.issue_type) merged.issue_type = filters.issue_type;
  if (props.excludeIssueType) merged.exclude_issue_type = props.excludeIssueType;
  if (filters.assignee) merged.assignee = filters.assignee;
  if (labelFilter.value) merged.labels = labelFilter.value;
  if (goalFilter.value) merged.goal_id = goalFilter.value;
  if (filterDateStr.value) {
    if (props.filterDate !== undefined) {
      merged.due_date = filterDateStr.value;
    } else {
      merged.updated_at_start = filterDateStr.value;
      merged.updated_at_end = filterDateStr.value;
    }
  }
  return merged;
}

function applyQuickFilters(merged: Record<string, any>) {
  if (!quickFilter.value) return;
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  switch (quickFilter.value) {
    case "my":
      merged.assignee = "admin";
      break;
    case "open":
      merged.status = "todo,in_progress";
      break;
    case "high":
      merged.priority = "urgent,high";
      break;
    case "week":
      merged.due_date_start = today;
      merged.due_date_end = weekEnd;
      break;
    case "done":
      merged.status = "done";
      merged.orderBy = "updated_at";
      break;
  }
}

function buildPagedResult<T>(list: T[], total: number, pageNum: number, pageSize: number) {
  const start = (pageNum - 1) * pageSize;
  return {
    data: {
      list: list.slice(start, start + pageSize),
      total,
      pageNum,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

async function fetchIssues(params: any) {
  const { pageNum, pageSize, ...searchParams } = params;

  if (props.filterIssueType === "requirement") {
    if (props.projectKey) await waitForRequirementsIfNeeded(props.projectKey);
    const list = buildReqIssues(reqItems.value, props.projectKey);
    const filtered = applyReqFilters(list, searchParams);
    return buildPagedResult(filtered, filtered.length, pageNum, pageSize);
  }

  const merged = buildApiParams(pageNum, pageSize, searchParams);
  applyQuickFilters(merged);

  const res = await getIssueList(merged);
  let list = (res.data?.list ?? []) as Issue[];
  const total = res.data?.total ?? 0;

  if (props.projectKey && reqItems.value.length > 0) {
    const reqIssuesList = buildReqIssues(reqItems.value, props.projectKey);
    const reqKeySet = new Set(reqIssuesList.map(r => r.key));
    list = list.filter(i => i.issue_type !== "requirement" || !reqKeySet.has(i.key));
    for (const ri of reqIssuesList) {
      if (!list.find(i => i.key === ri.key)) list.unshift(ri);
    }
  }

  store.issues = list;
  store.total = total;
  return { data: { list, total, pageNum: merged.pageNum, pageSize: merged.pageSize } };
}

onMounted(async () => {
  const initialLabel = route.query.label;
  if (typeof initialLabel === "string" && initialLabel) labelFilter.value = initialLabel;
  const initialGoal = route.query.goal;
  if (typeof initialGoal === "string" && initialGoal) goalFilter.value = initialGoal;
  await loadStats();
  if (props.projectKey) await fetchRequirements(props.projectKey);
});

watch(filterDateStr, () => {
  loadStats();
  refreshTable();
});
watch(reqItems, syncRequirementStats, { immediate: true });

void exportCSV;
void exportJSON;
void refresh;
void applyQuickFilter;
</script>

<style scoped lang="scss">
.issue-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}

// ── Quick Filter chips row ──
.issue-list__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 16px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.issue-list__pills-label {
  margin-right: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

// ── Body layout ──
.issue-list__body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.issue-list__main {
  flex: 1;
  min-width: 0;
  padding: 14px 16px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

// ── Column header helpers ──
.issue-list__col-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

// ── Table cell helpers ──
.issue-list__key {
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  user-select: all;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
.issue-list__month {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}
.issue-list__title {
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
}
.issue-list__muted {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.issue-list__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  max-width: 140px;
}

// ── Linked docs (PRD table: dev task / test spec) ──
.issue-list__doc-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
}
.issue-list__doc-chip {
  max-width: 100%;
  padding: 2px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-color-primary);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}

// ── OKR labels (PRD table) ──
.issue-list__okr-labels {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 260px;
}
.issue-list__okr-chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: 4px 8px;
  text-align: left;
  cursor: pointer;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}
.issue-list__okr-row {
  display: flex;
  gap: 5px;
  align-items: center;
}
.issue-list__okr-meta {
  padding-left: 19px;
}
.issue-list__okr-icon {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
}
.issue-list__okr-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.issue-list__okr-id {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}
.issue-list__points {
  padding: 1px 7px;
  font-family: DIN, sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 10px;
}
.issue-list__source {
  padding: 1px 7px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
.issue-list__updated {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list__start {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list__due--overdue {
  font-weight: 600;
  color: var(--el-color-danger);
}
.issue-list__due--soon {
  font-weight: 600;
  color: var(--el-color-warning);
}
.issue-list__link-chip {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  max-width: 110px;
  padding: 2px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  cursor: pointer;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color);
  border-radius: 999px;
  transition: all 0.15s;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}
.issue-list__link-chip--goal {
  max-width: 140px;
}
.issue-list__modules {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

// ── Card View ──
.issue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.issue-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.15s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
    transform: translateY(-1px);
  }
}
.issue-card__head {
  display: flex;
  gap: 8px;
  align-items: center;
}
.issue-card__dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.issue-card__key {
  padding: 1px 5px;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}
.issue-card__head-right {
  display: flex;
  gap: 4px;
  margin-left: auto;
}
.issue-card__title {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  -webkit-box-orient: vertical;
}
.issue-card__desc {
  max-height: 54px;
  margin: 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
.issue-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-lighter);
}
.issue-card__assignee {
  display: inline-flex;
  gap: 3px;
  align-items: center;
}
.issue-card__pts {
  padding: 1px 6px;
  font-family: DIN, sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 10px;
}
.issue-card__due--overdue {
  font-weight: 600;
  color: var(--el-color-danger);
}
.issue-card__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.issue-grid__pager {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

// ── List View ──
.issue-list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.issue-list-view__row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.1s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.issue-list-view__dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.issue-list-view__key {
  min-width: 80px;
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.issue-list-view__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.issue-list-view__assignee {
  min-width: 80px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list-view__due {
  min-width: 90px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list-view__due--overdue {
  font-weight: 600;
  color: var(--el-color-danger);
}

// ── PRD edit dialog ──
.prd-dialog {
  min-height: 120px;
}
.prd-dialog__section {
  margin-bottom: 4px;
}
.prd-dialog__section-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.prd-dialog__section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.prd-dialog__section-count {
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 10px;
}
.prd-dialog__links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.prd-dialog__link-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 8px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.prd-dialog__link-name {
  flex: 1;
  justify-content: flex-start;
  min-width: 0;
  font-size: 13px;
}
</style>
