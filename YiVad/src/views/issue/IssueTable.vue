<template>
  <div class="issue-list__main">
    <template v-if="viewMode === 'table'">
      <ProTable
        ref="proTableRef"
        :title="$t('issue.list.title')"
        :columns="columns"
        :request-api="fetchIssues"
        :pagination="true"
        :default-page-size="50"
        :row-key="filterIssueType === 'requirement' ? 'kb_file_path' : 'key'"
      >
        <template #tableHeader="scope">
          <el-dropdown v-if="filterIssueType !== 'requirement'" :disabled="!scope.isSelected" trigger="click">
            <el-button type="warning" plain :disabled="!scope.isSelected">
              {{ $t("issue.list.bulkActions") }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="emit('bulkChangeStatus', scope, 'todo')">{{ $t("issue.list.setStatusTodo") }}</el-dropdown-item>
                <el-dropdown-item @click="emit('bulkChangeStatus', scope, 'in_progress')">{{ $t("issue.list.setStatusInProgress") }}</el-dropdown-item>
                <el-dropdown-item @click="emit('bulkChangeStatus', scope, 'done')">{{ $t("issue.list.setStatusDone") }}</el-dropdown-item>
                <el-dropdown-item divided @click="emit('openBatchAssign', scope)">{{ $t("issue.list.assignTo") }}</el-dropdown-item>
                <el-dropdown-item divided @click="emit('batchChangePriority', scope.selectedListIds)">Change Priority</el-dropdown-item>
                <el-dropdown-item @click="emit('batchChangeType', scope.selectedListIds)">Change Type</el-dropdown-item>
                <el-dropdown-item divided @click="emit('batchDelete', scope.selectedListIds)">{{ $t("issue.list.deleteSelected") }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-popover
            v-if="list.hasActiveFilter.value"
            placement="bottom-start"
            :width="260"
            trigger="click"
          >
            <template #reference>
              <el-button type="primary" plain>
                <el-icon><FilterIcon /></el-icon>
                Filters ({{ activeFilterCount }})
              </el-button>
            </template>
            <div class="issue-list__filter-popover">
              <div class="issue-list__filter-popover-head">
                <span>Active Filters</span>
                <el-button link size="small" type="danger" @click="list.clearAllFilters()">Clear all</el-button>
              </div>
              <div class="issue-list__filter-popover-list">
                <div v-for="p in list.activePills.value" :key="p.id" class="issue-list__filter-popover-item">
                  <span>{{ p.label }}</span>
                  <el-button link size="small" @click="list.removePill(p)">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-popover>
          <el-button :icon="Download" plain @click="emit('exportCsv')">Export CSV</el-button>
        </template>
        <template #titleHeader>
          <div class="issue-list__col-head">
            <span>{{ $t("issue.table.title") }}</span>
            <el-input
              v-model="searchText"
              size="small"
              :placeholder="$t('issue.list.search')"
              clearable
              @change="refresh"
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
              @change="refresh"
            />
          </div>
        </template>
        <template #key="scope">
          <template v-if="filterIssueType === 'requirement'">
            <span class="issue-list__month">{{ scope.row.key }}</span>
          </template>
          <template v-else>
            <code class="issue-list__key" title="Copy key" @click="actions.copyKey(scope.row.key)">{{ scope.row.key }}</code>
          </template>
        </template>
        <template #title="scope">
          <el-button link type="primary" class="issue-list__title" @click="actions.openPreview(scope.row)">
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
              @change="refresh"
            />
          </div>
        </template>
        <template #labels="scope">
          <div
            v-if="scope.row.labels?.length"
            :class="filterIssueType === 'requirement' ? 'issue-list__okr-labels' : 'issue-list__labels'"
          >
            <template v-if="filterIssueType === 'requirement'">
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
              @change="refresh"
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
            v-if="scope.row.goal_id && projectGoalMetaCache.get(scope.row.goal_id)"
            type="button"
            class="issue-list__link-chip issue-list__link-chip--goal"
            @click="goGoal(scope.row.goal_id)"
          >
            🎯 {{ goalLabel(scope.row.goal_id) }}
          </button>
          <span v-else class="issue-list__muted">—</span>
        </template>
        <template #start_date="scope">
          <span v-if="scope.row.start_date" class="issue-list__start">{{ fmtDate(scope.row.start_date) }}</span>
          <span v-else class="issue-list__muted">—</span>
        </template>
        <template #due_date="scope">
          <span :class="dueCell(scope.row).cls">{{ dueCell(scope.row).text }}</span>
        </template>
        <template #created_at="scope">
          <span class="issue-list__updated">{{ fmtRelativeTime(scope.row.created_at) }}</span>
        </template>
        <template #updated_at="scope">
          <span class="issue-list__updated">{{ fmtRelativeTime(scope.row.updated_at) }}</span>
        </template>
        <template #operation="scope">
          <el-tooltip :content="$t('common.view')" placement="top">
            <el-button type="primary" link :icon="ViewIcon" @click="actions.openPreview(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('common.edit')" placement="top">
            <el-button
              type="primary"
              link
              :icon="EditIcon"
              @click="filterIssueType === 'requirement' ? actions.openPrdEdit(scope.row) : emit('openEdit', scope.row)"
            ></el-button>
          </el-tooltip>
          <el-tooltip :content="$t('common.delete')" placement="top">
            <el-button
              type="danger"
              link
              :icon="DeleteIcon"
              :loading="actions.deletingId.value === rowId(scope.row)"
              @click="actions.handleDelete(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </ProTable>
    </template>

    <template v-else-if="viewMode === 'card'">
      <div v-if="cardIssues.length" class="issue-grid">
        <div v-for="issue in cardIssues" :key="issue.key" class="issue-card" @click="actions.openPreview(issue)">
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
              {{ fmtDate(issue.due_date) }}
            </span>
            <span v-if="issue.estimate_points != null" class="issue-card__pts">{{ issue.estimate_points }} pts</span>
          </div>
          <div v-if="issue.labels?.length" class="issue-card__labels">
            <el-tag v-for="l in issue.labels" :key="l" size="small" round effect="plain">{{ l }}</el-tag>
          </div>
        </div>
      </div>
      <div v-else class="issue-list__empty">
        <div class="issue-list__empty-icon">
          <slot name="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </slot>
        </div>
        <p class="issue-list__empty-text">No issues found</p>
        <p class="issue-list__empty-hint">Try adjusting your filters or create a new issue</p>
      </div>
    </template>

    <template v-else>
      <div v-if="cardIssues.length" class="issue-list-view">
        <div v-for="issue in cardIssues" :key="issue.key" class="issue-list-view__row" @click="actions.openPreview(issue)">
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
            fmtDate(issue.due_date)
          }}</span>
        </div>
      </div>
      <div v-else class="issue-list__empty">
        <p class="issue-list__empty-text">No issues found</p>
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
</template>

<script setup lang="ts" name="IssueTable">
import { ref, inject, computed, type Ref, type ComputedRef } from "vue";
import { ArrowDown, Download } from "@element-plus/icons-vue";
import { User as UserIcon } from "@element-plus/icons-vue";
import { Filter as FilterIcon, Close } from "@element-plus/icons-vue";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import { STATUS_COLOR } from "./composables/useIssueStats";
import type { Issue, IssueStatus } from "@/api/modules/issueService";
import type { IssueListContext } from "./useIssueList";
import type { IssueActionsContext } from "./useIssueActions";

// ── Inject composable contexts from parent ──
const list = inject<IssueListContext>("issueList")!;
const actions = inject<IssueActionsContext>("issueActions")!;

defineProps<{
  filterIssueType?: string;
  modulesForIssue: (key: string) => any[];
  projectName: (key: string) => string;
}>();

const emit = defineEmits<{
  (e: "bulkChangeStatus", scope: any, status: string): void;
  (e: "openBatchAssign", scope: any): void;
  (e: "batchDelete", ids: (string | number)[]): void;
  (e: "batchChangePriority", ids: (string | number)[]): void;
  (e: "batchChangeType", ids: (string | number)[]): void;
  (e: "exportCsv"): void;
  (e: "openEdit", row: any): void;
}>();

const proTableRef = ref();

// ── Active filter count for toolbar badge ──
const activeFilterCount = computed(() => list.activePills.value.length);

// Destructure from injected contexts for template convenience
const searchText = list.searchText;
const keySearchText = list.keySearchText;
const assigneeSearchText = list.assigneeSearchText;
const labelSearchText = list.labelSearchText;
const viewMode = list.viewMode;
const cardPage = list.cardPage;
const cardPageSize = list.cardPageSize;
const cardIssues = list.cardIssues;
const cardTotal = list.cardTotal;
const onCardPage = list.onCardPage;
const columns = list.columns;
const fetchIssues = list.fetchIssues;

// Display helpers
const statusLabel = list.statusLabel;
const priorityLabel = list.priorityLabel;
const statusTagType = list.statusTagType;
const priorityColor = list.priorityColor;
const typeLabel = list.typeLabel;
const typeTagType = list.typeTagType;
const sourceLabel = list.sourceLabel;
const reviewLabel = list.reviewLabel;
const reviewTagType = list.reviewTagType;
const truncateDesc = list.truncateDesc;
const priorityTagType = list.priorityTagType;
const dueClass = list.dueClass;
const dueCell = list.dueCell;
const rowId = list.rowId;

// OKR
const goalLabel = list.goalLabel;
const goalDisplayMeta = list.goalDisplayMeta;
const projectGoalMetaCache = list.projectGoalMetaCache;
const openOkrFile = list.openOkrFile;
const prdLinks = list.prdLinks;
const openDocLink = list.openDocLink;

// Navigation
const goProject = list.goProject;
const goModule = list.goModule;
const goGoal = list.goGoal;

// Icons
const ViewIcon = actions.ViewIcon;
const EditIcon = actions.EditIcon;
const DeleteIcon = actions.DeleteIcon;

// Format helpers
const fmtDate = actions.formatDate;
const fmtRelativeTime = actions.formatRelativeTime;

function statusColor(s: IssueStatus) {
  return STATUS_COLOR[s] || "#909399";
}

function refresh() {
  proTableRef.value?.getTableList();
}

defineExpose({ proTableRef, getTableList: () => proTableRef.value?.getTableList() });
</script>

<style scoped lang="scss">
/* ── Main container ── */
.issue-list__main {
  flex: 1;
  min-width: 0;
}

/* ── Table enhancements ── */
.issue-list__col-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  :deep(.el-input) {
    .el-input__wrapper {
      box-shadow: none;
      background: var(--el-fill-color-lighter);
    }
  }
}
.issue-list__key {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-family: monospace;
  color: var(--el-color-primary);
  cursor: pointer;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-6);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-7);
    border-color: var(--el-color-primary);
  }
}
.issue-list__title {
  justify-content: flex-start;
  min-width: 0;
  text-align: left;
}
.issue-list__points {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
}
.issue-list__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.issue-list__muted {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.issue-list__source {
  font-size: 12px;
}
.issue-list__start {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.issue-list__updated {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}
.issue-list__due--overdue {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-danger);
}
.issue-list__due--soon {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-warning);
}

/* ── Chip links (project, module, goal) ── */
.issue-list__link-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-primary);
  cursor: pointer;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-6);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-7);
    border-color: var(--el-color-primary);
  }
  &--module {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
    border-color: var(--el-color-success-light-6);
    &:hover {
      background: var(--el-color-success-light-7);
      border-color: var(--el-color-success);
    }
  }
  &--goal {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
    border-color: var(--el-color-warning-light-6);
    &:hover {
      background: var(--el-color-warning-light-7);
      border-color: var(--el-color-warning);
    }
  }
}
.issue-list__modules {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

/* ── Doc chips (dev tasks, test specs) ── */
.issue-list__doc-links {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.issue-list__doc-chip {
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-primary);
  cursor: pointer;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-6);
  border-radius: 4px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-7);
    border-color: var(--el-color-primary);
  }
}

/* ── OKR chips (requirement view) ── */
.issue-list__okr-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.issue-list__okr-chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: 6px 8px;
  text-align: left;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.issue-list__okr-row {
  display: flex;
  gap: 5px;
  align-items: center;
}
.issue-list__okr-icon {
  font-size: 13px;
}
.issue-list__okr-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.issue-list__okr-meta {
  gap: 6px;
}
.issue-list__okr-id {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

/* ═══════════════════════════════════════════════
   Card View
   ═══════════════════════════════════════════════ */
.issue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  &__pager {
    margin-top: 16px;
    justify-content: center;
  }
}
.issue-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: all 0.2s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 12px rgb(0 0 0 / 8%);
    transform: translateY(-1px);
  }
  &__head {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  &__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  &__key {
    font-size: 11px;
    font-family: monospace;
    color: var(--el-text-color-secondary);
  }
  &__head-right {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }
  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--el-text-color-primary);
  }
  &__desc {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
  &__assignee {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }
  &__due {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    &--overdue {
      color: var(--el-color-danger);
      font-weight: 600;
    }
  }
  &__pts {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    color: var(--el-color-primary);
  }
  &__labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

/* ═══════════════════════════════════════════════
   List View (compact)
   ═══════════════════════════════════════════════ */
.issue-list-view {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  &__row {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 14px;
    cursor: pointer;
    background: var(--el-bg-color);
    transition: background 0.12s;
    & + & {
      border-top: 1px solid var(--el-border-color-lighter);
    }
    &:hover {
      background: var(--el-color-primary-light-9);
    }
  }
  &__dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  &__key {
    flex-shrink: 0;
    width: 100px;
    font-size: 11px;
    font-family: monospace;
    color: var(--el-text-color-secondary);
  }
  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  &__assignee {
    flex-shrink: 0;
    width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  &__due {
    flex-shrink: 0;
    width: 90px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    &--overdue {
      color: var(--el-color-danger);
      font-weight: 600;
    }
  }
}
/* ═══════════════════════════════════════════════
   Empty state
   ═══════════════════════════════════════════════ */
.issue-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  &-icon {
    color: var(--el-text-color-placeholder);
    margin-bottom: 12px;
    opacity: 0.6;
  }
  &-text {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }
  &-hint {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

/* ── Filter popover ── */
.issue-list__filter-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.issue-list__filter-popover-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.issue-list__filter-popover-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.issue-list__filter-popover-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}
</style>