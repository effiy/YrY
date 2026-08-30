<template>
  <div class="bug-list">
    <PageHeaderCard
      v-if="!props.projectKey"
      :icon="WarningFilled"
      title="Bugs"
      description="Track defects across projects and releases"
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

    <!-- Charts -->
    <div v-if="!props.projectKey" class="bug-list__charts">
      <div class="bug-chart" :class="{ 'bug-chart--active': activeFilter === 'critical' || activeFilter === 'open' || activeFilter === 'in_progress' || activeFilter === 'resolved' || activeFilter === 'closed' }">
        <div class="bug-chart__title">
          Status
          <span v-if="activeFilter && ['open','in_progress','resolved','closed'].includes(activeFilter)" class="bug-chart__badge">filtered</span>
        </div>
        <div class="bug-chart__body">
          <ECharts :option="statusDonutOption" height="200" @chart-click="onStatusChartClick" />
        </div>
      </div>
      <div class="bug-chart" :class="{ 'bug-chart--active': activeFilter === 'critical' }">
        <div class="bug-chart__title">
          Severity
          <span v-if="activeFilter === 'critical'" class="bug-chart__badge">filtered</span>
        </div>
        <div class="bug-chart__body">
          <ECharts :option="severityDonutOption" height="200" @chart-click="onSeverityChartClick" />
        </div>
      </div>
      <div class="bug-chart">
        <div class="bug-chart__title">Created · 14d</div>
        <div class="bug-chart__body">
          <ECharts :option="trendOption" height="200" />
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <div v-if="!props.projectKey && recentlyViewed.length" class="bug-list__recent">
      <span class="bug-list__recent-label">Recently viewed</span>
      <button v-for="b in recentlyViewed" :key="b.key" type="button" class="bug-list__recent-chip" :title="b.title" @click="goDetail(b.key)">
        <span class="bug-list__recent-dot" :style="{ background: severityColor(b.severity) }" />
        <span class="bug-list__recent-key">{{ b.key }}</span>
        <span class="bug-list__recent-title">{{ b.title }}</span>
      </button>
      <button type="button" class="bug-list__recent-clear" @click="recentlyViewed = []">✕</button>
    </div>

    <!-- Active Filter Pills -->
    <div v-if="activePills.length" class="bug-list__pills">
      <span class="bug-list__pills-label">Filters</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="p.clear()">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearFilter">Clear all</el-button>
    </div>

    <!-- Body -->
    <div class="bug-list__body">
      <div class="bug-list__sidebar">
        <div class="bug-list__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
            <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
        <div class="bug-list__sidebar-section">
          <div class="bug-list__sidebar-section-header">
            <span class="bug-list__sidebar-section-label">Overview</span>
          </div>
          <div class="bug-list__sidebar-section-body">
            <div class="bug-list__sidebar-card" @click="router.push('/bug')">
              <div class="bug-list__sidebar-card-icon" style="background:linear-gradient(135deg,#f56c6c,#dc2626)"><el-icon><WarningFilled /></el-icon></div>
              <div class="bug-list__sidebar-card-info">
                <span class="bug-list__sidebar-card-value">{{ bugStats.total }}</span>
                <span class="bug-list__sidebar-card-label">Total</span>
              </div>
            </div>
            <div class="bug-list__sidebar-card" @click="applyAttentionFilter('open')">
              <div class="bug-list__sidebar-card-icon" style="background:linear-gradient(135deg,#e6a23c,#d09020)"><el-icon><CircleClose /></el-icon></div>
              <div class="bug-list__sidebar-card-info">
                <span class="bug-list__sidebar-card-value">{{ bugStats.open }}</span>
                <span class="bug-list__sidebar-card-label">Open</span>
              </div>
            </div>
            <div class="bug-list__sidebar-card" @click="applyAttentionFilter('resolved')">
              <div class="bug-list__sidebar-card-icon" style="background:linear-gradient(135deg,#91cc75,#7ab85e)"><el-icon><CircleCheckFilled /></el-icon></div>
              <div class="bug-list__sidebar-card-info">
                <span class="bug-list__sidebar-card-value">{{ bugStats.resolved }}</span>
                <span class="bug-list__sidebar-card-label">Resolved</span>
              </div>
            </div>
          </div>
          <div class="bug-list__sidebar-progress">
            <span class="bug-list__sidebar-progress-label">Resolution</span>
            <el-progress :percentage="resolutionPct" :stroke-width="6" :show-text="true" :color="resolutionPct >= 80 ? '#67c23a' : '#e6a23c'" />
          </div>
        </div>
        <div class="bug-list__sidebar-section" style="margin-top:12px">
          <div class="bug-list__sidebar-section-header" style="border-left-color: var(--el-color-danger);">
            <span class="bug-list__sidebar-section-label">Needs Attention</span>
          </div>
          <div class="bug-list__sidebar-section-body">
            <div class="bug-list__sidebar-card bug-list__sidebar-card--critical" @click="applyAttentionFilter('critical')">
              <el-icon class="bug-list__sidebar-card-accent-icon"><Warning /></el-icon>
              <span class="bug-list__sidebar-card-accent-value">{{ bugStats.critical }}</span>
              <span class="bug-list__sidebar-card-accent-label">Critical</span>
            </div>
            <div class="bug-list__sidebar-card bug-list__sidebar-card--unassigned" @click="applyAttentionFilter('unassigned')">
              <el-icon class="bug-list__sidebar-card-accent-icon"><User /></el-icon>
              <span class="bug-list__sidebar-card-accent-value">{{ attention.unassigned }}</span>
              <span class="bug-list__sidebar-card-accent-label">Unassigned</span>
            </div>
            <div class="bug-list__sidebar-card bug-list__sidebar-card--stale" @click="applyAttentionFilter('stale')">
              <el-icon class="bug-list__sidebar-card-accent-icon"><Clock /></el-icon>
              <span class="bug-list__sidebar-card-accent-value">{{ attention.stale }}</span>
              <span class="bug-list__sidebar-card-accent-label">Stale (&gt;30d)</span>
            </div>
          </div>
        </div>
        <div class="bug-list__sidebar-section" style="margin-top:12px">
          <div class="bug-list__sidebar-section-header" style="border-left-color: var(--el-color-success);">
            <span class="bug-list__sidebar-section-label">Data Quality</span>
            <span class="bug-list__sidebar-section-hint">{{ allBugs.length }} bugs</span>
          </div>
          <div class="bug-list__sidebar-section-body">
            <div v-for="c in completeness" :key="c.key" class="bug-list__sidebar-quality">
              <div class="bug-list__sidebar-quality-head">
                <span class="bug-list__sidebar-quality-label">{{ c.label }}</span>
                <span class="bug-list__sidebar-quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
              </div>
              <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
            </div>
          </div>
        </div>
      </div>

      <div class="bug-list__main">
        <!-- Table View -->
        <template v-if="viewMode === 'table'">
        <ProTable
          ref="proTable"
          title="Bugs"
          :columns="columns"
          :request-api="fetchBugs"
          :pagination="true"
        >
          <template #tableHeader="scope">
            <el-button type="primary" :icon="Plus" @click="store.openCreateDialog(props.projectKey ? projectName(props.projectKey) : '', props.projectKey)">New Bug</el-button>
            <el-button :disabled="!scope.isSelected" type="danger" plain :icon="Delete" @click="batchDelete(scope.selectedListIds)">Delete Selected</el-button>
          </template>

          <template #title="scope">
            <el-button link type="primary" @click="openTitlePreview(scope.row)">{{ scope.row.title }}</el-button>
          </template>

          <template #severity="scope">
            <el-tag :type="severityTagType(scope.row.severity)" size="small">{{ scope.row.severity }}</el-tag>
          </template>

          <template #priority="scope">
            <el-tag :type="priorityTagType(scope.row.priority)" size="small">{{ scope.row.priority }}</el-tag>
          </template>

          <template #status="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">{{ scope.row.status }}</el-tag>
          </template>

          <template #type="scope">
            <el-tag type="info" size="small" effect="plain">{{ scope.row.type }}</el-tag>
          </template>

          <template #project="scope">
            <el-button v-if="scope.row.project_key" link type="primary" @click="goProject(scope.row.project_key)">
              {{ projectName(scope.row.project_key) || scope.row.project || scope.row.project_key }}
            </el-button>
            <span v-else class="bug-list__project-text">{{ scope.row.project || "—" }}</span>
          </template>

          <template #issue_key="scope">
            <el-button v-if="scope.row.issue_key" link type="warning" @click="goIssue(scope.row.issue_key)">
              {{ issueTitle(scope.row.issue_key) }}
            </el-button>
            <span v-else>—</span>
          </template>

          <template #module="scope">
            <span v-if="scope.row.module" class="bug-list__cell-text">{{ scope.row.module }}</span>
            <span v-else class="bug-list__cell-empty">—</span>
          </template>

          <template #reporter="scope">
            <span v-if="scope.row.reporter" class="bug-list__cell-text">{{ scope.row.reporter }}</span>
            <span v-else class="bug-list__cell-empty">—</span>
          </template>

          <template #frequency="scope">
            <el-tag size="small" effect="plain" :type="frequencyTagType(scope.row.frequency)">{{ scope.row.frequency }}</el-tag>
          </template>

          <template #environment="scope">
            <el-tag v-if="scope.row.environment" size="small" effect="plain" type="info">{{ scope.row.environment }}</el-tag>
            <span v-else class="bug-list__cell-empty">—</span>
          </template>

          <template #affectedVersion="scope">
            <span v-if="scope.row.affectedVersion" class="bug-list__cell-text">{{ scope.row.affectedVersion }}</span>
            <span v-else class="bug-list__cell-empty">—</span>
          </template>

          <template #fixedVersion="scope">
            <span v-if="scope.row.fixedVersion" class="bug-list__cell-text">{{ scope.row.fixedVersion }}</span>
            <span v-else class="bug-list__cell-empty">—</span>
          </template>

          <template #updatedAt="scope">
            {{ formatDate(scope.row.updatedAt) }}
          </template>

          <template #operation="scope">
            <el-button type="primary" link :icon="View" @click="goDetail(scope.row.key)"></el-button>
            <el-button type="primary" link :icon="Edit" @click="openEdit(scope.row)"></el-button>
            <el-button type="danger" link :icon="Delete" @click="store.handleDelete(scope.row).then(() => proTable?.getTableList())"></el-button>
          </template>
        </ProTable>
        </template>

        <!-- Card View -->
        <template v-else-if="viewMode === 'card'">
          <div class="bug-grid">
            <div
              v-for="bug in cardBugs"
              :key="bug.key"
              class="bug-card"
              @click="goDetail(bug.key)"
            >
              <div class="bug-card__head">
                <span class="bug-card__dot" :style="{ background: severityColor(bug.severity) }" />
                <code class="bug-card__key">{{ bug.key }}</code>
                <div class="bug-card__head-right">
                  <el-tag :type="severityTagType(bug.severity)" size="small" effect="plain">{{ bug.severity }}</el-tag>
                  <el-tag :type="priorityTagType(bug.priority)" size="small" effect="plain">{{ bug.priority }}</el-tag>
                </div>
              </div>
              <h3 class="bug-card__title">{{ bug.title }}</h3>
              <p v-if="bug.description" class="bug-card__desc">{{ truncateDesc(bug.description) }}</p>
              <div class="bug-card__meta">
                <el-tag :type="statusTagType(bug.status)" size="small">{{ bug.status }}</el-tag>
                <el-tag size="small" effect="plain" :type="frequencyTagType(bug.frequency)">{{ bug.frequency }}</el-tag>
                <span v-if="bug.assignee" class="bug-card__assignee">
                  <el-icon><User /></el-icon> {{ bug.assignee }}
                </span>
                <span v-if="bug.reporter" class="bug-card__reporter">{{ bug.reporter }}</span>
                <span class="bug-card__module" v-if="bug.module">{{ bug.module }}</span>
              </div>
              <div class="bug-card__footer-row">
                <span v-if="bug.updatedAt" class="bug-card__updated">{{ formatDate(bug.updatedAt) }}</span>
                <div class="bug-card__footer-tags">
                  <span v-if="bug.environment" class="bug-card__env">{{ bug.environment }}</span>
                  <span v-if="bug.affectedVersion" class="bug-card__ver">v{{ bug.affectedVersion }}</span>
                </div>
              </div>
            </div>
          </div>
          <el-pagination
            v-if="cardTotal > cardPageSize"
            class="bug-grid__pager"
            layout="prev, pager, next"
            :page-size="cardPageSize"
            :total="cardTotal"
            :current-page="cardPage"
            @current-change="onCardPage"
          />
        </template>

        <!-- List View -->
        <template v-else>
          <div class="bug-list-view">
            <div
              v-for="bug in cardBugs"
              :key="bug.key"
              class="bug-list-view__row"
              @click="goDetail(bug.key)"
            >
              <span class="bug-list-view__dot" :style="{ background: severityColor(bug.severity) }" />
              <code class="bug-list-view__key">{{ bug.key }}</code>
              <span class="bug-list-view__title">{{ bug.title }}</span>
              <el-tag :type="severityTagType(bug.severity)" size="small" effect="plain">{{ bug.severity }}</el-tag>
              <el-tag :type="priorityTagType(bug.priority)" size="small" effect="plain">{{ bug.priority }}</el-tag>
              <el-tag :type="statusTagType(bug.status)" size="small">{{ bug.status }}</el-tag>
              <el-tag size="small" effect="plain" :type="frequencyTagType(bug.frequency)">{{ bug.frequency }}</el-tag>
              <span v-if="bug.assignee" class="bug-list-view__assignee">{{ bug.assignee }}</span>
              <span v-if="bug.reporter" class="bug-list-view__reporter">{{ bug.reporter }}</span>
              <span v-if="bug.updatedAt" class="bug-list-view__updated">{{ formatDate(bug.updatedAt) }}</span>
            </div>
          </div>
          <el-pagination
            v-if="cardTotal > cardPageSize"
            class="bug-grid__pager"
            layout="prev, pager, next"
            :page-size="cardPageSize"
            :total="cardTotal"
            :current-page="cardPage"
            @current-change="onCardPage"
          />
        </template>
      </div>
    </div>

    <!-- Title Preview Dialog -->
    <KnowledgePreviewDialog ref="titlePreviewRef" />

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="store.dialogVisible"
      :title="store.isEdit ? 'Edit Bug' : 'New Bug'"
      width="700px"
      destroy-on-close
      @closed="store.resetForm()"
    >
      <el-form ref="formRef" :model="store.form" :rules="rules" label-width="110px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="store.form.title" placeholder="Bug title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Severity" prop="severity">
              <el-select v-model="store.form.severity" style="width: 100%">
                <el-option v-for="v in severities" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Priority" prop="priority">
              <el-select v-model="store.form.priority" style="width: 100%">
                <el-option v-for="v in priorities" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Status" prop="status">
              <el-select v-model="store.form.status" style="width: 100%">
                <el-option v-for="v in statuses" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Type" prop="type">
              <el-select v-model="store.form.type" style="width: 100%">
                <el-option v-for="v in types" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Frequency" prop="frequency">
              <el-select v-model="store.form.frequency" style="width: 100%">
                <el-option v-for="v in frequencies" :key="v" :label="v" :value="v" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Environment">
              <el-input v-model="store.form.environment" placeholder="e.g. production" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Project">
              <el-select v-model="store.form.project_key" filterable clearable placeholder="Select project" style="width: 100%" @change="onProjectChange">
                <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Module">
              <el-input v-model="store.form.module" placeholder="Module name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Issue">
              <el-select v-model="store.form.issue_key" filterable clearable placeholder="Link to issue" style="width: 100%">
                <el-option v-for="i in selectableIssues" :key="i.key" :label="`${i.key} · ${i.title}`" :value="i.key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Assignee">
              <el-input v-model="store.form.assignee" placeholder="Assignee" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Reporter">
              <el-input v-model="store.form.reporter" placeholder="Reporter" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Affected Version">
              <el-input v-model="store.form.affectedVersion" placeholder="e.g. 1.0.0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fixed Version">
              <el-input v-model="store.form.fixedVersion" placeholder="e.g. 1.0.1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description">
          <el-input v-model="store.form.description" type="textarea" :rows="3" placeholder="Bug description" />
        </el-form-item>
        <el-form-item label="Steps to Reproduce">
          <el-input v-model="store.form.stepsToReproduce" type="textarea" :rows="3" placeholder="One step per line" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Expected Result">
              <el-input v-model="store.form.expectedResult" type="textarea" :rows="2" placeholder="What should happen" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Actual Result">
              <el-input v-model="store.form.actualResult" type="textarea" :rows="2" placeholder="What actually happened" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Root Cause">
              <el-input v-model="store.form.causeProblem" type="textarea" :rows="2" placeholder="Technical root cause" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Solution">
              <el-input v-model="store.form.solution" type="textarea" :rows="2" placeholder="How it was fixed" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="store.dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="store.saving" @click="handleSave">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="bugList">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Delete, View, Edit, WarningFilled, CircleClose, Loading, CircleCheckFilled, Warning, Clock, User, Grid, Postcard, List } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useBugStore } from "@/stores/modules/bug";
import { useProjectStore } from "@/stores/modules/project";
import { useIssueStore } from "@/stores/modules/issue";
import { getBugList, readBugContent } from "@/api/modules/bug";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import type { BugDocument, BugSeverity, BugPriority, BugStatus } from "@/api/modules/bug";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { HeaderPill } from "@/components/PageHeaderCard/PageHeaderCard.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useDateFilter } from "@/hooks/useDateFilter";

const router = useRouter();
const props = defineProps<{ projectKey?: string; filterDate?: Date | null }>();
const store = useBugStore();
const projectStore = useProjectStore();
const issueStore = useIssueStore();
const proTable = ref<ProTableInstance>();
const formRef = ref<FormInstance>();
const activeFilter = ref("");
const viewMode = ref<"table" | "card" | "list">("table");
const cardPage = ref(1);
const cardPageSize = 20;
const bugStats = ref({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, critical: 0 });
const allBugs = ref<BugDocument[]>([]);
const recentlyViewed = ref<BugDocument[]>([]);

// ── Date filter ──
const _filterDate = ref<Date | null>(null);
const filterDate = computed({
  get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
  set: (v) => { _filterDate.value = v; }
});
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

const resolutionPct = computed(() => {
  if (!bugStats.value.total) return 0;
  return Math.round(((bugStats.value.resolved + bugStats.value.closed) / bugStats.value.total) * 100);
});

const headerPills = computed<HeaderPill[]>(() => [
  { value: bugStats.value.total, label: "Total" },
  { value: bugStats.value.open, label: "Open" },
  { value: bugStats.value.resolved, label: "Resolved" },
  { value: resolutionPct.value, suffix: "%", label: "Resolution", accent: true }
]);

const cardBugs = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize;
  return allBugs.value.slice(start, start + cardPageSize);
});
const cardTotal = computed(() => allBugs.value.length);

function onCardPage(p: number) { cardPage.value = p; }

function truncateDesc(text: string): string {
  const plain = text.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/>\s/g, "").replace(/[-*+]\s/g, "").replace(/\n+/g, " ").trim();
  return plain.length > 160 ? plain.slice(0, 160) + "..." : plain;
}

async function loadBugStats() {
  try {
    const params: any = { pageSize: 1000 };
    if (props.projectKey) params.project_key = props.projectKey;
    if (filterDateStr.value) {
      const start = new Date(filterDateStr.value + "T00:00:00").getTime();
      const end = new Date(filterDateStr.value + "T23:59:59").getTime();
      params.createdAtStart = start;
      params.createdAtEnd = end;
    }
    const res = await getBugList(params);
    const list = (res.data?.list as BugDocument[]) ?? [];
    allBugs.value = list;
    const stats = { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, critical: 0 };
    for (const b of list) {
      stats.total++;
      if (b.status === "open") stats.open++;
      else if (b.status === "in_progress") stats.in_progress++;
      else if (b.status === "resolved") stats.resolved++;
      else if (b.status === "closed") stats.closed++;
      if (b.severity === "critical") stats.critical++;
    }
    bugStats.value = stats;
  } catch { /* best-effort */ }
}

const severities: BugSeverity[] = ["critical", "major", "minor", "trivial"];
const priorities: BugPriority[] = ["p0", "p1", "p2", "p3"];
const statuses: BugStatus[] = ["open", "in_progress", "resolved", "closed", "rejected", "reopened"];
const types = ["functional", "performance", "ui", "security", "compatibility", "regression", "data", "other"];
const frequencies = ["always", "sometimes", "rarely", "once", "unable"];

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }],
  severity: [{ required: true, message: "Severity is required", trigger: "change" }],
  priority: [{ required: true, message: "Priority is required", trigger: "change" }],
  status: [{ required: true, message: "Status is required", trigger: "change" }],
  type: [{ required: true, message: "Type is required", trigger: "change" }],
  frequency: [{ required: true, message: "Frequency is required", trigger: "change" }]
};

const columns: ColumnProps<BugDocument>[] = [
  { type: "selection", width: 50 },
  { type: "index", label: "#", width: 60 },
  { prop: "title", label: "Title", minWidth: 460 },
  { prop: "severity", label: "Severity", width: 100 },
  { prop: "priority", label: "Priority", width: 90 },
  { prop: "status", label: "Status", width: 110 },
  { prop: "type", label: "Type", width: 110 },
  { prop: "project", label: "Project", width: 120 },
  { prop: "module", label: "Module", width: 110 },
  { prop: "assignee", label: "Assignee", width: 100 },
  { prop: "reporter", label: "Reporter", width: 100 },
  { prop: "frequency", label: "Frequency", width: 110 },
  { prop: "environment", label: "Env", width: 110 },
  { prop: "affectedVersion", label: "Affected", width: 110 },
  { prop: "fixedVersion", label: "Fixed", width: 110 },
  { prop: "updatedAt", label: "Updated", width: 160 },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

// ── Filter pills ──
const activePills = computed(() => {
  const pills: Array<{ id: string; label: string; clear: () => void }> = [];
  if (activeFilter.value) {
    const labels: Record<string, string> = {
      open: "Open", critical: "Critical", p0p1: "P0/P1", mine: "My Bugs", recent: "Recent",
      in_progress: "In Progress", resolved: "Resolved", closed: "Closed",
      unassigned: "Unassigned", stale: "Stale >30d"
    };
    const label = labels[activeFilter.value] || activeFilter.value;
    pills.push({ id: "qf", label, clear: () => { activeFilter.value = ""; proTable.value?.getTableList(); } });
  }
  return pills;
});

function applyQuickFilter(key: string) {
  activeFilter.value = key === activeFilter.value ? "" : key;
  proTable.value?.getTableList();
}

function clearFilter() {
  activeFilter.value = "";
  viewMode.value = "table";
  proTable.value?.getTableList();
}

function applyAttentionFilter(type: "critical" | "unassigned" | "stale" | "open" | "resolved") {
  if (type === "critical") activeFilter.value = activeFilter.value === "critical" ? "" : "critical";
  else if (type === "unassigned") activeFilter.value = activeFilter.value === "unassigned" ? "" : "unassigned";
  else if (type === "stale") activeFilter.value = activeFilter.value === "stale" ? "" : "stale";
  else if (type === "open") activeFilter.value = activeFilter.value === "open" ? "" : "open";
  else if (type === "resolved") activeFilter.value = activeFilter.value === "resolved" ? "" : "resolved";
  proTable.value?.getTableList();
}

async function fetchBugs(params: any) {
  const { pageNum, pageSize, ...filters } = params;
  const merged: any = { pageNum, pageSize };
  if (filters.title) merged.title = filters.title;
  if (filters.project) merged.project = filters.project;
  if (filters.module) merged.module = filters.module;
  if (props.projectKey) merged.project_key = props.projectKey;
  if (filterDateStr.value) {
    const start = new Date(filterDateStr.value + "T00:00:00").getTime();
    const end = new Date(filterDateStr.value + "T23:59:59").getTime();
    merged.createdAtStart = start;
    merged.createdAtEnd = end;
  }
  if (activeFilter.value === "open") merged.status = "open";
  else if (activeFilter.value === "critical") merged.severity = "critical";
  else if (activeFilter.value === "in_progress") merged.status = "in_progress";
  else if (activeFilter.value === "resolved") merged.status = "resolved";
  else if (activeFilter.value === "closed") merged.status = "closed";
  else if (activeFilter.value === "unassigned") merged.assignee = "";
  else if (activeFilter.value === "stale") merged.stale = 30;
  else if (activeFilter.value === "mine") merged.assignee = "admin";
  return await getBugList(merged);
}

async function openEdit(bug: BugDocument) {
  let content = null;
  try { if (bug.contentPath) content = await readBugContent(bug); } catch { /* use empty */ }
  store.openEditDialog(bug, content);
}

const titlePreviewRef = ref<{ openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void } | null>(null);
async function openTitlePreview(bug: BugDocument) {
  const filePath = bug.contentPath;
  let content = "";
  if (filePath) {
    try {
      const res = await readKnowledgeFile(filePath);
      content = res.content || "";
    } catch {
      try {
        const c = await readBugContent(bug);
        content = c.description || "";
      } catch { /* use empty */ }
    }
  }
  titlePreviewRef.value?.openFile({
    path: filePath || "",
    title: bug.title,
    content,
    onSave: async (_newContent: string) => { /* read-only preview */ }
  });
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  await store.handleSave();
  proTable.value?.getTableList();
}

function batchDelete(ids: string[]) {
  if (!ids.length) return;
  ElMessageBox.confirm(`Delete ${ids.length} selected bugs?`, "Batch Delete", { type: "warning" })
    .then(async () => {
      for (const id of ids) await store.handleDelete({ key: id } as BugDocument);
      ElMessage.success(`Deleted ${ids.length} bugs`);
      proTable.value?.getTableList();
    })
    .catch(() => {});
}

function goDetail(key: string) {
  const bug = allBugs.value.find(b => b.key === key);
  if (bug) trackRecent(bug);
  router.push(`/bug/${key}`);
}

function trackRecent(bug: BugDocument) {
  recentlyViewed.value = [bug, ...recentlyViewed.value.filter(b => b.key !== bug.key)].slice(0, 8);
}

const projects = computed(() => projectStore.projects);
function projectName(key: string): string { return projects.value.find(p => p.key === key)?.name ?? ""; }
function goProject(key: string) { router.push(`/project/${key}`); }

const issues = computed(() => issueStore.issues);
const selectableIssues = computed(() => {
  const pk = store.form.project_key;
  return pk ? issues.value.filter(i => i.project_key === pk) : issues.value;
});
function issueTitle(key: string): string { const i = issues.value.find(x => x.key === key); return i ? i.title : key; }
function goIssue(key: string) { router.push(`/issue/${key}`); }
function onProjectChange(key: string) { store.form.project = key ? projectName(key) : ""; }

// ── Charts ──
const SEVERITY_COLOR: Record<string, string> = { critical: "#f56c6c", major: "#e6a23c", minor: "#409eff", trivial: "#909399" };
const STATUS_COLOR: Record<string, string> = { open: "#e6a23c", in_progress: "#409eff", resolved: "#67c23a", closed: "#909399", rejected: "#f56c6c", reopened: "#e6a23c" };

const statusDonutOption = computed<ECOption>(() => {
  const order = ["open", "in_progress", "resolved", "closed", "rejected", "reopened"];
  const data = order.map(s => ({ name: s, value: allBugs.value.filter(b => b.status === s).length, itemStyle: { color: STATUS_COLOR[s] } })).filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 } },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const severityDonutOption = computed<ECOption>(() => {
  const order = ["critical", "major", "minor", "trivial"];
  const data = order.map(s => ({ name: s, value: allBugs.value.filter(b => b.severity === s).length, itemStyle: { color: SEVERITY_COLOR[s] } })).filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 } },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const trendOption = computed<ECOption>(() => {
  const labels: string[] = [];
  const values: number[] = [];
  const today = new Date();
  const createdByDay: Record<string, number> = {};
  for (const b of allBugs.value) {
    const day = b.updatedAt ? new Date(b.updatedAt).toISOString().slice(0, 10) : "";
    if (day) createdByDay[day] = (createdByDay[day] ?? 0) + 1;
  }
  for (let d = 13; d >= 0; d--) {
    const dt = new Date(today.getTime() - d * 86400000);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    labels.push(`${dt.getMonth() + 1}/${dt.getDate()}`);
    values.push(createdByDay[key] ?? 0);
  }
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, interval: 3 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color: "#f56c6c", borderRadius: [3, 3, 0, 0] } }]
  };
});

function onStatusChartClick(e: { name?: string }) {
  if (!e?.name) return;
  applyQuickFilter(e.name);
}
function onSeverityChartClick(e: { name?: string }) {
  if (!e?.name) return;
  applyQuickFilter(e.name);
}

// ── Sidebar: attention ──
const attention = computed(() => {
  const unassigned = allBugs.value.filter(b => !b.assignee && b.status !== "closed" && b.status !== "resolved").length;
  const stale = allBugs.value.filter(b => {
    if (b.status === "closed" || b.status === "resolved" || !b.updatedAt) return false;
    const ms = Date.now() - new Date(b.updatedAt).getTime();
    return ms > 30 * 86400000;
  }).length;
  return { unassigned, stale };
});

// ── Sidebar: data quality ──
const completeness = computed(() => {
  const total = allBugs.value.length;
  const fields = [
    { key: "desc", label: "Description", filled: allBugs.value.filter(b => b.description).length },
    { key: "assignee", label: "Assignee", filled: allBugs.value.filter(b => b.assignee).length },
    { key: "env", label: "Environment", filled: allBugs.value.filter(b => b.environment).length },
    { key: "fixed", label: "Fixed Version", filled: allBugs.value.filter(b => b.fixedVersion).length }
  ];
  return fields.map(f => ({ ...f, pct: total ? Math.round((f.filled / total) * 100) : 0 }));
});

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

function severityColor(s: string): string { return SEVERITY_COLOR[s] || "#909399"; }

onMounted(async () => {
  projectStore.fetchProjects({ pageSize: 100 });
  issueStore.fetchIssues({ pageSize: 500 });
  await loadBugStats();
});

watch(filterDateStr, () => {
  loadBugStats();
  proTable.value?.getTableList();
});

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("zh-CN");
}

function severityTagType(s: BugSeverity): "danger" | "warning" | "info" {
  const map: Record<BugSeverity, "danger" | "warning" | "info"> = { critical: "danger", major: "warning", minor: "info", trivial: "info" };
  return map[s];
}
function priorityTagType(p: BugPriority): "danger" | "warning" | "info" {
  const map: Record<BugPriority, "danger" | "warning" | "info"> = { p0: "danger", p1: "warning", p2: "info", p3: "info" };
  return map[p];
}
function statusTagType(s: BugStatus): "primary" | "warning" | "success" | "info" | "danger" {
  const map: Record<BugStatus, "primary" | "warning" | "success" | "info" | "danger"> = {
    open: "primary", in_progress: "warning", resolved: "success", closed: "info", rejected: "danger", reopened: "warning"
  };
  return map[s] || "info";
}
function frequencyTagType(f: string): "danger" | "warning" | "info" | "primary" {
  const map: Record<string, "danger" | "warning" | "info" | "primary"> = {
    always: "danger", sometimes: "warning", rarely: "info", once: "primary", unable: "info"
  };
  return map[f] || "info";
}
</script>

<style scoped lang="scss">
.bug-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}

// ── Charts ──
.bug-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.bug-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.bug-chart--active { border-color: var(--el-color-primary); box-shadow: 0 0 0 1px var(--el-color-primary-light-5); }
.bug-chart__title {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 12px; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.bug-chart__badge {
  padding: 0 5px; font-size: 9px; font-weight: 600; line-height: 15px;
  color: var(--el-color-primary); background: var(--el-color-primary-light-9);
  border-radius: 3px; text-transform: none;
}
.bug-chart__body { flex: 1; min-height: 0; padding: 8px; }

// ── Recently Viewed ──
.bug-list__recent {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 8px 12px; margin-bottom: 16px; border-radius: 8px;
  background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter);
}
.bug-list__recent-label { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); margin-right: 2px; }
.bug-list__recent-chip {
  display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px;
  font-size: 12px; color: var(--el-text-color-primary);
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px; cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover { border-color: var(--el-color-primary); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
}
.bug-list__recent-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.bug-list__recent-key { font-family: monospace; font-size: 11px; color: var(--el-text-color-secondary); }
.bug-list__recent-title { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bug-list__recent-clear {
  margin-left: auto; border: none; background: transparent;
  color: var(--el-text-color-placeholder); cursor: pointer; font-size: 13px; line-height: 1; padding: 4px;
  &:hover { color: var(--el-color-danger); }
}

// ── Filter Pills ──
.bug-list__pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.bug-list__pills-label { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); }

// ── Body / Main / Sidebar ──
.bug-list__body { display: flex; gap: 24px; }
.bug-list__main { flex: 1; min-width: 0; }
.bug-list__sidebar {
  width: 240px; flex-shrink: 0; position: sticky; top: 24px; align-self: flex-start;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border-radius: 12px; padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
}
.bug-list__sidebar-view {
  padding: 4px 4px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

// ── Sidebar Section ──
.bug-list__sidebar-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.bug-list__sidebar-section-header {
  display: flex; align-items: center;
  padding: 8px 12px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
  padding-left: 10px;
}
.bug-list__sidebar-section-label { flex: 1; }
.bug-list__sidebar-section-hint {
  font-size: 10px; font-weight: 500; color: var(--el-text-color-placeholder);
  text-transform: none; letter-spacing: 0;
}
.bug-list__sidebar-section-body {
  padding: 8px; display: flex; flex-direction: column; gap: 4px;
}

// ── Sidebar Card (stat item) ──
.bug-list__sidebar-card {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px; cursor: pointer;
  transition: all 0.15s;
  background: var(--el-bg-color);
  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}
.bug-list__sidebar-card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 7px;
  color: #fff; font-size: 13px; flex-shrink: 0;
}
.bug-list__sidebar-card-info {
  display: flex; flex-direction: column; gap: 0; min-width: 0;
}
.bug-list__sidebar-card-value {
  font-size: 16px; font-weight: 700; line-height: 1.1;
  color: var(--el-text-color-primary); font-family: DIN, sans-serif;
}
.bug-list__sidebar-card-label {
  font-size: 10px; color: var(--el-text-color-secondary);
}

// ── Sidebar Card (attention variant) ──
.bug-list__sidebar-card-accent-icon {
  font-size: 14px; flex-shrink: 0;
}
.bug-list__sidebar-card-accent-value {
  font-size: 16px; font-weight: 700; font-family: DIN, sans-serif; min-width: 20px;
}
.bug-list__sidebar-card-accent-label {
  font-size: 11px; color: var(--el-text-color-secondary); flex: 1;
}
.bug-list__sidebar-card--critical {
  .bug-list__sidebar-card-accent-icon,
  .bug-list__sidebar-card-accent-value { color: var(--el-color-danger); }
}
.bug-list__sidebar-card--unassigned {
  .bug-list__sidebar-card-accent-icon,
  .bug-list__sidebar-card-accent-value { color: var(--el-color-warning); }
}
.bug-list__sidebar-card--stale {
  .bug-list__sidebar-card-accent-icon,
  .bug-list__sidebar-card-accent-value { color: var(--el-color-info); }
}

// ── Sidebar Progress ──
.bug-list__sidebar-progress {
  padding: 0 12px 12px;
}
.bug-list__sidebar-progress-label {
  display: block; font-size: 10px; font-weight: 600;
  color: var(--el-text-color-secondary); margin-bottom: 4px;
}

// ── Sidebar Quality ──
.bug-list__sidebar-quality {
  padding: 4px 0;
  & + & { padding-top: 8px; }
}
.bug-list__sidebar-quality-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;
}
.bug-list__sidebar-quality-label {
  font-size: 11px; color: var(--el-text-color-secondary);
}
.bug-list__sidebar-quality-pct {
  font-size: 11px; font-weight: 600; font-family: DIN, sans-serif;
}

// ── Card Grid ──
.bug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 10px;
}
.bug-grid__pager {
  margin-top: 16px;
  justify-content: center;
}
.bug-card {
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
.bug-card__head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.bug-card__dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.bug-card__key {
  font-family: monospace; font-size: 11px; color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light); padding: 1px 6px; border-radius: 4px;
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.bug-card__head-right {
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
}
.bug-card__title {
  margin: 0 0 4px; font-size: 14px; font-weight: 600; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.bug-card__desc {
  margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.bug-card__meta {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;
}
.bug-card__assignee {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 12px; color: var(--el-text-color-secondary);
  .el-icon { font-size: 13px; }
}
.bug-card__reporter {
  font-size: 12px; color: var(--el-text-color-placeholder);
  &::before { content: "by "; }
}
.bug-card__module {
  font-size: 12px; color: var(--el-text-color-placeholder);
}
.bug-card__footer-row {
  display: flex; justify-content: space-between; align-items: center;
}
.bug-card__footer-tags {
  display: flex; gap: 4px; align-items: center;
}
.bug-card__updated {
  font-size: 12px; color: var(--el-text-color-placeholder);
}
.bug-card__env {
  font-size: 11px; color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light); padding: 1px 6px; border-radius: 4px;
}
.bug-card__ver {
  font-size: 11px; color: var(--el-color-primary);
  background: var(--el-color-primary-light-9); padding: 1px 6px; border-radius: 4px;
}

// ── List View ──
.bug-list-view {
  display: flex; flex-direction: column; gap: 4px;
}
.bug-list-view__row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter); border-radius: 8px;
  cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.bug-list-view__dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.bug-list-view__key {
  font-family: monospace; font-size: 11px; color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light); padding: 1px 6px; border-radius: 4px; flex-shrink: 0;
}
.bug-list-view__title {
  flex: 1; min-width: 0; font-size: 13px; font-weight: 500;
  color: var(--el-text-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.bug-list-view__assignee {
  font-size: 12px; color: var(--el-text-color-secondary); flex-shrink: 0;
}
.bug-list-view__reporter {
  font-size: 12px; color: var(--el-text-color-placeholder); flex-shrink: 0;
}
.bug-list-view__updated {
  font-size: 12px; color: var(--el-text-color-placeholder); flex-shrink: 0;
}
.bug-list-view__reporter {
  font-size: 12px; color: var(--el-text-color-placeholder); flex-shrink: 0;
}

// ── Cell helpers ──
.bug-list__cell-text { font-size: 13px; }
.bug-list__cell-empty { color: var(--el-text-color-placeholder); }
</style>