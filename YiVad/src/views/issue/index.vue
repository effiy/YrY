<template>
  <div class="issue-list page">
    <PageHeaderCard
      v-if="!props.projectKey"
      :icon="Tickets"
      icon-bg="linear-gradient(135deg, #5470c6, #4460b0)"
      :title="$t('issue.list.title')"
      :description="$t('issue.list.description')"
      :pills="headerPills"
      :show-date-nav="!props.filterDate"
      :filter-date="list.filterDate.value"
      :filter-date-label="list.filterDateLabel.value"
      :is-filter-today="list.isFilterToday.value"
      @prev="list.goToPrevDay"
      @next="list.goToNextDay"
      @today="list.goToFilterToday"
      @clear="list.clearFilterDate"
    >
    </PageHeaderCard>

    <div v-if="!props.projectKey" class="issue-list__quick-filters">
      <button
        v-for="qf in list.quickFilters"
        :key="qf.key"
        type="button"
        class="issue-list__quick-chip"
        :class="{ 'issue-list__quick-chip--active': list.quickFilter.value === qf.key }"
        @click="list.applyQuickFilter(qf.key)"
      >
        {{ qf.label }}
      </button>
    </div>

    <el-alert
      v-if="statsError"
      :title="statsError"
      type="error"
      :closable="false"
      show-icon
      class="issue-list__error"
    >
      <template #default>
        <el-button link type="primary" size="small" @click="refreshStats()">{{ $t("common.retry") }}</el-button>
      </template>
    </el-alert>

    <RecentlyViewed
      v-if="!props.projectKey"
      :items="recentViewedItems"
      @click="actions.goDetail"
      @clear="recentlyViewed = []"
    />

    <FilterPills
      v-if="list.activePills.value.length && props.filterIssueType !== 'requirement'"
      :pills="list.activePills.value"
      @clear-all="list.clearAllFilters"
    />

    <div class="issue-list__body">
      <IssueSidebar
        v-if="!props.projectKey"
        v-model:view-mode="list.viewMode.value"
        :overview-stats="overviewStats"
        :completion-pct="completionPct"
        :attention-stats="attentionStats"
        :completeness="completeness"
        :all-issues-count="allIssues.length"
        :active-filter="list.filters"
        :active-attention="list.activeAttention.value"
      />

      <IssueTable
        ref="issueTableRef"
        :filter-issue-type="props.filterIssueType"
        :modules-for-issue="modulesForIssue"
        :project-name="projectName"
        @bulk-change-status="bulkChangeStatus"
        @open-batch-assign="openBatchAssign"
        @batch-delete="(ids: (string | number)[]) => batchDelete(ids)"
        @batch-change-priority="(ids: (string | number)[]) => batchChangePriority(ids)"
        @batch-change-type="(ids: (string | number)[]) => batchChangeType(ids)"
        @export-csv="exportIssueCSV"
        @open-edit="(row: any) => props.filterIssueType === 'requirement' ? actions.openPrdEdit(row) : openEdit(row)"
      />
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? $t('issue.dialog.editTitle') : $t('issue.dialog.createTitle')"
      width="640px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px" @keyup.enter="submit">
        <el-form-item label="Title" prop="title">
          <el-input v-model="dialog.form.title" placeholder="Issue title" maxlength="200" show-word-limit autofocus />
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
          <el-input v-model="dialog.form.description" type="textarea" :rows="4" placeholder="Issue description (Markdown supported)" />
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
                v-model="dialog.form.start_date" type="date" placeholder="Start date" style="width: 100%" value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Due Date">
              <el-date-picker v-model="dialog.form.due_date" type="date" placeholder="Due date" style="width: 100%" value-format="YYYY-MM-DD" />
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

    <el-dialog v-model="actions.prdDialog.visible" title="编辑 PRD 需求" width="560px" destroy-on-close>
      <div v-loading="actions.prdDialog.loading" class="prd-dialog">
        <el-form :model="actions.prdDialog.form" label-width="100px">
          <el-form-item label="标题">
            <el-input :model-value="actions.prdDialog.form.title" disabled />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-select v-model="actions.prdDialog.form.status" style="width: 100%">
                  <el-option v-for="s in actions.PRD_STATUS_OPTIONS" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级">
                <el-select v-model="actions.prdDialog.form.priority" style="width: 100%">
                  <el-option v-for="p in actions.PRD_PRIORITY_OPTIONS" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="负责人">
                <el-input v-model="actions.prdDialog.form.owner" placeholder="Owner" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="前端人天">
                <el-input-number v-model="actions.prdDialog.form.estimateFrontend" :min="0" :precision="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-divider style="margin: 16px 0" />

        <div class="prd-dialog__section">
          <div class="prd-dialog__section-head">
            <span class="prd-dialog__section-title">开发任务</span>
            <span class="prd-dialog__section-count">{{ actions.prdDialog.devLinks.length }}</span>
          </div>
          <div v-if="actions.prdDialog.devLinks.length" class="prd-dialog__links">
            <div v-for="link in actions.prdDialog.devLinks" :key="link.path" class="prd-dialog__link-row">
              <el-button link type="primary" class="prd-dialog__link-name" @click="list.openDocLink(link.path)">{{ link.title }}</el-button>
              <el-button link type="danger" size="small" @click="actions.removePrdLink(link, 'dev')">
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
            <span class="prd-dialog__section-count">{{ actions.prdDialog.testLinks.length }}</span>
          </div>
          <div v-if="actions.prdDialog.testLinks.length" class="prd-dialog__links">
            <div v-for="link in actions.prdDialog.testLinks" :key="link.path" class="prd-dialog__link-row">
              <el-button link type="primary" class="prd-dialog__link-name" @click="list.openDocLink(link.path)">{{ link.title }}</el-button>
              <el-button link type="danger" size="small" @click="actions.removePrdLink(link, 'test')">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
          <span v-else class="issue-list__muted">暂无关联测试用例</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="actions.prdDialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="actions.prdDialog.submitting" @click="actions.submitPrdEdit">保存</el-button>
      </template>
    </el-dialog>

    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="ts" name="issueList">
import { computed, onMounted, provide, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Tickets, Close, Loading, Link, CircleCheckFilled, Clock, User, ArrowRight, Timer, Refresh } from "@element-plus/icons-vue";
import type { Component } from "vue";
import type { FormInstance } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import { ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP, ISSUE_SOURCE_MAP, REVIEW_STATUS_MAP } from "@/api/modules/issueService";
import type { IssueStatus } from "@/api/modules/issueService";
import { PageHeaderCard } from "@/components";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import IssueSidebar from "./components/IssueSidebar.vue";
import IssueAnalyticsCharts from "./components/IssueAnalyticsCharts.vue";
import RecentlyViewed from "@/components/RecentlyViewed/RecentlyViewed.vue";
import FilterPills from "@/components/FilterPills/FilterPills.vue";
import IssueTable from "./IssueTable.vue";
import { useIssueStats, STATUS_COLOR } from "./composables/useIssueStats";
import { useIssueCharts } from "./composables/useIssueCharts";
import { useIssueDialog } from "./composables/useIssueDialog";
import { useIssueBulkOps } from "./composables/useIssueBulkOps";
import { useIssueList } from "./useIssueList";
import { useIssueActions } from "./useIssueActions";

const props = defineProps<{
  projectKey?: string;
  filterIssueType?: string;
  excludeIssueType?: string;
  filterDate?: Date | null;
}>();

const router = useRouter();
const route = useRoute();
const store = useIssueStore();
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const formRef = ref<FormInstance>();
const issueTableRef = ref<InstanceType<typeof IssueTable>>();
const chartsExpanded = ref(true);

// ── Shared ref for card data between stats and list ──
const sharedCardIssuesAll = ref<any[]>([]);

function refreshTable() {
  issueTableRef.value?.getTableList();
}

// ═══════════════════════════════════════════════════════════
// 1. List context (creates internal requirements state)
// ═══════════════════════════════════════════════════════════
const list = useIssueList(props, {
  previewDlgRef,
  cardIssuesAll: sharedCardIssuesAll,
  refreshTable,
});

// ── Search ref for template binding (vue-tsc needs local ref for v-model) ──
const searchText = list.searchText;

// ═══════════════════════════════════════════════════════════
// 2. Stats / Charts (uses requirements from list)
// ═══════════════════════════════════════════════════════════
const {
  allIssues,
  cardIssuesAll: statsCardIssuesAll,
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
  modulesForIssue,
  projectName,
  loading: statsLoading,
  error: statsError,
  startPolling,
  refresh: refreshStats,
} = useIssueStats(props, {
  filterDateStr: list.filterDateStr,
  filters: list.filters,
});

// Sync card data from stats to the shared ref used by list
watch(statsCardIssuesAll, (val) => {
  sharedCardIssuesAll.value = val;
}, { immediate: true });

watch(
  () => list.hasActiveFilter.value,
  (active) => {
    if (active && !chartsExpanded.value) chartsExpanded.value = true;
  }
);

const recentViewedItems = computed(() =>
  recentlyViewed.value.map(i => ({ key: i.key, title: i.title, color: statusColor(i.status) }))
);

function statusColor(s: IssueStatus) {
  return STATUS_COLOR[s] || "#909399";
}

// ═══════════════════════════════════════════════════════════
// 3. Actions context (uses allIssues from stats)
// ═══════════════════════════════════════════════════════════
const actions = useIssueActions(props, list, {
  store,
  formRef,
  previewDlgRef,
  refreshTable,
  trackRecent,
  allIssues,
});

// ═══════════════════════════════════════════════════════════
// 4. Misc composables
// ═══════════════════════════════════════════════════════════
const { dialog, rules, openCreate, openEdit, submit } = useIssueDialog(props, {
  store,
  formRef,
  allIssues,
  refreshTable,
});

const { batchDelete, bulkChangeStatus, openBatchAssign } = useIssueBulkOps({
  store,
  refreshTable,
});

async function batchChangePriority(ids: (string | number)[]) {
  const { value } = await ElMessageBox.prompt("Enter new priority (urgent/high/medium/low/none):", "Batch Change Priority", {
    confirmButtonText: "Change",
    inputPlaceholder: "urgent"
  }).catch(() => ({ value: "" }));
  if (!value) return;
  for (const id of ids) {
    try { await store.editIssue(String(id), { priority: value as any }); } catch { /* continue */ }
  }
  ElMessage.success(`Changed priority of ${ids.length} issue(s)`);
  refreshTable();
}

async function batchChangeType(ids: (string | number)[]) {
  const { value } = await ElMessageBox.prompt("Enter new type (bug/task/feature/improvement/requirement):", "Batch Change Type", {
    confirmButtonText: "Change",
    inputPlaceholder: "task"
  }).catch(() => ({ value: "" }));
  if (!value) return;
  for (const id of ids) {
    try { await store.editIssue(String(id), { issue_type: value as any }); } catch { /* continue */ }
  }
  ElMessage.success(`Changed type of ${ids.length} issue(s)`);
  refreshTable();
}

function exportIssueCSV() {
  const issues = allIssues.value;
  if (!issues.length) { ElMessage.info("No issues to export"); return; }
  const headers = ["Key", "Title", "Type", "Priority", "Status", "Assignee", "Project", "Updated"];
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = issues.map((i: any) => [
    i.key, i.title, i.issue_type, i.priority, i.status, i.assignee || "", i.project_key || "", i.updated_at
  ].map(escape).join(","));
  const csv = ["\uFEFF" + headers.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `issues-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(`Exported ${rows.length} issues`);
}

// ── Sidebar stats ──
const overviewStats = computed<Array<{ icon: Component; iconBg: string; value: number; label: string; onClick?: () => void }>>(() => [
  { icon: Tickets, iconBg: "linear-gradient(135deg,#5470c6,#4460b0)", value: stats.total, label: "Total", onClick: () => router.push("/issue") },
  { icon: Loading, iconBg: "linear-gradient(135deg,#5ab1ef,#3a90d0)", value: openCount.value, label: "Open", onClick: () => list.applyAttentionFilter("unassigned") },
  { icon: Link, iconBg: "linear-gradient(135deg,#e6a23c,#d49520)", value: stats.in_review, label: "In Review" },
  { icon: CircleCheckFilled, iconBg: "linear-gradient(135deg,#91cc75,#7ab85e)", value: stats.done, label: "Done" },
]);

const attentionStats = computed<Array<{ icon: Component; value: number; label: string; accentClass: string; onClick?: () => void }>>(() => [
  { icon: Clock, value: attention.value.overdue, label: "Overdue", accentClass: "issue-list__sidebar-card--overdue", onClick: () => list.applyAttentionFilter("overdue") },
  { icon: User, value: attention.value.unassigned, label: "Unassigned", accentClass: "issue-list__sidebar-card--unassigned", onClick: () => list.applyAttentionFilter("unassigned") },
  { icon: Link, value: attention.value.blocked, label: "Blocked", accentClass: "issue-list__sidebar-card--blocked", onClick: () => list.applyAttentionFilter("blocked") },
]);

// ── Provide contexts for child components ──
provide("issueList", list);
provide("issueActions", actions);

// ── Lifecycle ──
onMounted(async () => {
  const q = route.query;
  if (typeof q.label === "string" && q.label) list.labelFilter.value = q.label;
  if (typeof q.goal === "string" && q.goal) list.goalFilter.value = q.goal;
  if (typeof q.quickFilter === "string" && q.quickFilter) list.quickFilter.value = q.quickFilter;
  if (typeof q.status === "string" && q.status) list.filters.status = q.status;
  if (typeof q.priority === "string" && q.priority) list.filters.priority = q.priority;
  if (typeof q.issue_type === "string" && q.issue_type) list.filters.issue_type = q.issue_type;
  if (typeof q.assignee === "string" && q.assignee) list.filters.assignee = q.assignee;
  if (q.overdue === "true" || q.overdue === "1") list.overdueFilter.value = true;
  if (typeof q.days === "string") { const n = parseInt(q.days, 10); if (n > 0) list.daysFilter.value = n; }
  if (q.blocked === "true" || q.blocked === "1") list.blockedFilter.value = true;
  if (q.no_due_date === "true" || q.no_due_date === "1") list.noDueDateFilter.value = true;
  if (q.no_type === "true" || q.no_type === "1") list.noTypeFilter.value = true;
  if (typeof q.stale === "string") { const n = parseInt(q.stale, 10); if (n > 0) list.staleDays.value = n; }
  if (q.no_priority === "true" || q.no_priority === "1") list.noPriorityFilter.value = true;
  await loadStats();
  startPolling();
});

watch(list.filterDateStr, () => {
  loadStats();
  refreshTable();
});
watch(list.searchText, () => refreshTable());
</script>

<style scoped lang="scss">
.issue-list {
  // padding + background come from global .page class
}

.issue-list__body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.issue-list__muted {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

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

/* ── Global search ── */
.issue-list__global-search {
  width: 220px;
}

/* ── Quick filter chips ── */
.issue-list__quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.issue-list__quick-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 999px;
  transition: all 0.15s;
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
  &--active {
    color: #fff;
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    &:hover {
      color: #fff;
      background: var(--el-color-primary-light-3);
      border-color: var(--el-color-primary-light-3);
    }
  }
}

/* ── Charts section ── */
.issue-list__charts-wrap {
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.issue-list__charts-toggle {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background 0.15s;
  &:hover {
    background: var(--el-fill-color-lighter);
  }
}
.issue-list__charts-arrow {
  font-size: 14px;
  transition: transform 0.2s;
  &--open {
    transform: rotate(90deg);
  }
}
.issue-list__charts-summary {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
}
.issue-list__charts-filtered {
  margin-left: 8px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
  text-transform: none;
  letter-spacing: 0;
  background: var(--el-color-primary-light-9);
  border-radius: 10px;
}
.issue-list__charts-body {
  padding: 4px;
}

/* ── Data age & refresh ── */
.issue-list__charts-age {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  margin-left: auto;
  margin-right: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-success);
  text-transform: none;
  letter-spacing: 0;
  transition: color 0.3s;
  &--stale {
    color: var(--el-text-color-placeholder);
  }
}
.issue-list__charts-refresh {
  flex-shrink: 0;
  padding: 4px;
}

/* ── Error banner ── */
.issue-list__error {
  margin-bottom: 14px;
}

/* ── Loading skeletons ── */
.issue-list__loading {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  &-card {
    height: 148px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    animation: issue-list__pulse 1.5s ease-in-out infinite;
  }
}
@keyframes issue-list__pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>