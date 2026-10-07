<template>
  <div class="module-list page">
    <PageHeaderCard
      v-if="!props.projectKey"
      :icon="Cpu"
      icon-bg="linear-gradient(135deg, #5470c6, #4460b0)"
      :title="$t('module.list.title')"
      :description="$t('module.list.description')"
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
    <div v-if="!props.projectKey" class="module-list__charts">
      <div class="module-chart" :class="{ 'module-chart--active': statusFilter }">
        <div class="module-chart__title">
          Status
          <span v-if="statusFilter" class="module-chart__badge">filtered</span>
        </div>
        <div class="module-chart__body">
          <ECharts :option="statusDonutOption" height="200" @chart-click="onStatusChartClick" />
        </div>
      </div>
      <div class="module-chart">
        <div class="module-chart__title">Progress Distribution</div>
        <div class="module-chart__body">
          <ECharts :option="progressBarOption" height="200" />
        </div>
      </div>
      <div class="module-chart">
        <div class="module-chart__title">Burndown · 14d</div>
        <div class="module-chart__body">
          <ECharts :option="burndownOption" height="200" />
        </div>
      </div>
      <div class="module-chart">
        <div class="module-chart__title">Velocity · 8w</div>
        <div class="module-chart__body">
          <ECharts :option="velocityOption" height="200" />
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <RecentlyViewed
      v-if="!props.projectKey"
      :items="recentViewedItems"
      label="Recently viewed"
      @click="goDetail"
      @clear="recentlyViewed = []"
    />

    <!-- Active Filter Pills (standalone route only) -->
    <FilterPills
      v-if="!props.projectKey"
      :pills="activePills"
      @clear-all="clearAllFilters"
    />

    <!-- ====== Knowledge Domain Cards (project detail context) ====== -->
    <template v-if="props.projectKey">
      <div v-if="domains.length" class="md-domain-grid">
        <div v-for="d in domains" :key="d.key" class="md-domain-card" @click="openDomain(d)">
          <div class="md-domain-card__icon" :style="{ background: d.color }">
            <el-icon :size="20"><component :is="d.icon" /></el-icon>
          </div>
          <div class="md-domain-card__body">
            <span class="md-domain-card__name">{{ d.label }}</span>
            <span class="md-domain-card__desc">{{ d.description }}</span>
          </div>
          <div class="md-domain-card__count">
            <span class="md-domain-card__count-val">{{ d.fileCount }}</span>
            <span class="md-domain-card__count-lbl">files</span>
          </div>
        </div>
      </div>
      <el-empty v-else description="No knowledge modules" :image-size="60" />
    </template>

    <!-- ====== Standalone Module List (non-project context) ====== -->
    <template v-else>
      <div class="module-list__body">
        <div class="module-list__sidebar">
          <div class="module-list__sidebar-view">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="table"
                ><el-icon><Grid /></el-icon
              ></el-radio-button>
              <el-radio-button value="card"
                ><el-icon><Postcard /></el-icon
              ></el-radio-button>
              <el-radio-button value="list"
                ><el-icon><List /></el-icon
              ></el-radio-button>
            </el-radio-group>
          </div>
          <div class="module-list__sidebar-section">
            <div class="module-list__sidebar-section-header">
              <span class="module-list__sidebar-section-label">Overview</span>
            </div>
            <div class="module-list__sidebar-section-body">
              <div class="module-list__sidebar-card" @click="router.push('/module')">
                <div class="module-list__sidebar-card-icon" style="background: linear-gradient(135deg, #5470c6, #4460b0)">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="module-list__sidebar-card-info">
                  <span class="module-list__sidebar-card-value">{{ stats.total }}</span>
                  <span class="module-list__sidebar-card-label">Total</span>
                </div>
              </div>
              <div class="module-list__sidebar-card" @click="applyAttentionFilter('in_progress')">
                <div class="module-list__sidebar-card-icon" style="background: linear-gradient(135deg, #5ab1ef, #3a90d0)">
                  <el-icon><Loading /></el-icon>
                </div>
                <div class="module-list__sidebar-card-info">
                  <span class="module-list__sidebar-card-value">{{ stats.inProgress }}</span>
                  <span class="module-list__sidebar-card-label">Active</span>
                </div>
              </div>
              <div class="module-list__sidebar-card" @click="applyAttentionFilter('completed')">
                <div class="module-list__sidebar-card-icon" style="background: linear-gradient(135deg, #91cc75, #7ab85e)">
                  <el-icon><CircleCheckFilled /></el-icon>
                </div>
                <div class="module-list__sidebar-card-info">
                  <span class="module-list__sidebar-card-value">{{ stats.completed }}</span>
                  <span class="module-list__sidebar-card-label">Done</span>
                </div>
              </div>
            </div>
            <div class="module-list__sidebar-progress">
              <span class="module-list__sidebar-progress-label">Completion</span>
              <el-progress :percentage="stats.overallCompletion" :stroke-width="6" :show-text="true" />
            </div>
          </div>
          <div class="module-list__sidebar-section" style="margin-top: 12px">
            <div class="module-list__sidebar-section-header" style="border-left-color: var(--el-color-danger)">
              <span class="module-list__sidebar-section-label">Needs Attention</span>
            </div>
            <div class="module-list__sidebar-section-body">
              <div class="module-list__sidebar-card module-list__sidebar-card--overdue" @click="applyAttentionFilter('overdue')">
                <el-icon class="module-list__sidebar-card-accent-icon"><Clock /></el-icon>
                <span class="module-list__sidebar-card-accent-value">{{ attention.overdue }}</span>
                <span class="module-list__sidebar-card-accent-label">Overdue</span>
              </div>
              <div class="module-list__sidebar-card module-list__sidebar-card--empty" @click="applyAttentionFilter('empty')">
                <el-icon class="module-list__sidebar-card-accent-icon"><Folder /></el-icon>
                <span class="module-list__sidebar-card-accent-value">{{ attention.empty }}</span>
                <span class="module-list__sidebar-card-accent-label">No Issues</span>
              </div>
              <div class="module-list__sidebar-card module-list__sidebar-card--stalled" @click="applyAttentionFilter('stalled')">
                <el-icon class="module-list__sidebar-card-accent-icon"><WarningFilled /></el-icon>
                <span class="module-list__sidebar-card-accent-value">{{ attention.stalled }}</span>
                <span class="module-list__sidebar-card-accent-label">Stalled</span>
              </div>
              <div class="module-list__sidebar-card module-list__sidebar-card--blocked" @click="applyAttentionFilter('blocked')">
                <el-icon class="module-list__sidebar-card-accent-icon"><RemoveFilled /></el-icon>
                <span class="module-list__sidebar-card-accent-value">{{ attention.blocked }}</span>
                <span class="module-list__sidebar-card-accent-label">Blocked</span>
              </div>
              <div class="module-list__sidebar-card module-list__sidebar-card--empty" @click="applyAttentionFilter('unassigned')">
                <el-icon class="module-list__sidebar-card-accent-icon"><UserFilled /></el-icon>
                <span class="module-list__sidebar-card-accent-value">{{ attention.unassigned }}</span>
                <span class="module-list__sidebar-card-accent-label">Unassigned</span>
              </div>
            </div>
          </div>
          <div v-if="fileAlertsHasAlerts" class="module-list__sidebar-section" style="margin-top: 12px">
            <div class="module-list__sidebar-section-header" style="border-left-color: var(--el-color-warning)">
              <span class="module-list__sidebar-section-label">File Health Alerts</span>
              <span class="module-list__sidebar-section-hint">{{ fileAlertsSummary.total }} alerts</span>
            </div>
            <div class="module-list__sidebar-section-body">
              <div class="module-list__sidebar-alert-bar">
                <span v-if="fileAlertsCriticalCount" class="module-list__sidebar-alert-badge module-list__sidebar-alert-badge--critical">
                  {{ fileAlertsCriticalCount }} critical
                </span>
                <span v-if="fileAlertsWarningCount" class="module-list__sidebar-alert-badge module-list__sidebar-alert-badge--warning">
                  {{ fileAlertsWarningCount }} warning
                </span>
                <span v-if="fileAlertsInfoCount" class="module-list__sidebar-alert-badge module-list__sidebar-alert-badge--info">
                  {{ fileAlertsInfoCount }} info
                </span>
              </div>
              <div v-for="domain in ['data', 'knowledge', 'code']" :key="domain">
                <template v-if="fileAlertsAlertsByDomain[domain]?.length">
                  <div class="module-list__sidebar-alert-domain">
                    <span class="module-list__sidebar-alert-domain-label">{{
                      { data: 'Modules', knowledge: 'Knowledge', code: 'Code' }[domain]
                    }}</span>
                  </div>
                  <div
                    v-for="alert in fileAlertsAlertsByDomain[domain].slice(0, 5)"
                    :key="alert.title"
                    class="module-list__sidebar-alert-row"
                    :class="`module-list__sidebar-alert-row--${alert.severity}`"
                  >
                    <span class="module-list__sidebar-alert-row__severity" :class="`module-list__sidebar-alert-row__severity--${alert.severity}`" />
                    <span class="module-list__sidebar-alert-row__title">{{ alert.title }}</span>
                    <span class="module-list__sidebar-alert-row__count">{{ alert.count }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="module-list__sidebar-section" style="margin-top: 12px">
            <div class="module-list__sidebar-section-header" style="border-left-color: var(--el-color-success)">
              <span class="module-list__sidebar-section-label">Data Quality</span>
              <span class="module-list__sidebar-section-hint">{{ store.modules.length }} modules</span>
            </div>
            <div class="module-list__sidebar-section-body">
              <div v-for="c in completeness" :key="c.key" class="module-list__sidebar-quality">
                <div class="module-list__sidebar-quality-head">
                  <span class="module-list__sidebar-quality-label">{{ c.label }}</span>
                  <span class="module-list__sidebar-quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
                </div>
                <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
              </div>
            </div>
          </div>
        </div>

        <div class="module-list__main">
          <div class="module-list__head">
            <div class="module-list__head-left">
              <span class="module-list__head-count">{{ countLabel }}</span>
              <span class="module-list__head-age" :class="{ 'module-list__head-age--stale': dataAge > 60 }">
                · Updated {{ dataAge }}s ago
              </span>
            </div>
            <div class="module-list__head-actions">
              <el-tooltip :content="polling ? 'Pause auto-refresh' : 'Resume auto-refresh'" placement="bottom">
                <el-button size="small" :icon="polling ? VideoPause : VideoPlay" :title="polling ? 'Pause auto-refresh' : 'Start auto-refresh'" @click="polling = !polling" />
              </el-tooltip>
              <el-input
                v-model="searchText"
                class="module-list__search"
                size="small"
                clearable
                placeholder="Search modules…"
                :prefix-icon="Search"
                @change="onFilterChange"
              />
              <el-select
                v-model="statusFilter"
                class="module-list__status"
                size="small"
                placeholder="Status"
                @change="onFilterChange"
              >
                <el-option label="All" value="" />
                <el-option label="Planned" value="planned" />
                <el-option label="In Progress" value="in_progress" />
                <el-option label="Completed" value="completed" />
                <el-option label="Cancelled" value="cancelled" />
              </el-select>
              <el-select v-model="sortBy" class="module-list__sort" size="small" @change="onFilterChange">
                <el-option label="Most issues" value="issues" />
                <el-option label="Name" value="name" />
                <el-option label="Progress" value="progress" />
              </el-select>
              <el-select
                v-model="projectFilter"
                placeholder="Project"
                clearable
                class="module-list__project"
                size="small"
                @change="onProjectFilterChange"
              >
                <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
              </el-select>
              <el-button type="primary" :icon="Plus" @click="openCreate">{{ $t("module.list.newModule") }}</el-button>
            </div>
          </div>

          <div
            v-loading="store.loading"
            class="module-list__grid"
            :class="{ 'module-list__grid--non-card': effectiveViewMode !== 'card' }"
          >
            <template v-if="effectiveViewMode === 'table'">
              <ProTable ref="proTable" title="Modules" :columns="moduleColumns" :request-api="fetchModules" :pagination="true">
                <template #name="scope">
                  <span class="module-table__name" @click="goDetail(scope.row.key)">{{ scope.row.name }}</span>
                </template>
                <template #status="scope">
                  <el-tag :type="statusTagType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
                </template>
                <template #issues="scope">
                  <div class="module-table__issues">
                    <span>{{ doneCount(scope.row) }}/{{ issueCount(scope.row) }}</span>
                    <el-progress
                      :percentage="progressPct(scope.row)"
                      :stroke-width="4"
                      :show-text="false"
                      :color="progressColor(scope.row)"
                      style="width: 60px"
                    />
                  </div>
                </template>
                <template #project_key="scope">
                  <button
                    v-if="scope.row.project_key"
                    type="button"
                    class="module-card__project"
                    @click.stop="goProject(scope.row.project_key)"
                  >
                    {{ projectName(scope.row.project_key) }}
                  </button>
                  <span v-else>—</span>
                </template>
                <template #dates="scope">
                  <span class="module-table__dates" :class="timeHintClass(scope.row)">{{ timeHint(scope.row) }}</span>
                </template>
                <template #operation="scope">
                  <el-button link size="small" type="primary" @click.stop="goDetail(scope.row.key)">Open</el-button>
                  <el-button link size="small" @click.stop="openEdit(scope.row)">Edit</el-button>
                  <el-button link size="small" type="danger" @click.stop="handleDelete(scope.row)">Delete</el-button>
                </template>
              </ProTable>
            </template>

            <template v-else-if="effectiveViewMode === 'card'">
              <el-card
                v-for="mod in displayedModules"
                :key="mod.key"
                class="module-card"
                shadow="hover"
                :class="{ 'module-card--muted': mod.status === 'completed' || mod.status === 'cancelled' }"
                @click="goDetail(mod.key)"
              >
                <div class="module-card__status-bar" :style="{ background: STATUS_COLOR[mod.status] || '#909399' }" />
                <div class="module-card__body">
                  <div class="module-card__top">
                    <span class="module-card__name">{{ mod.name }}</span>
                    <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
                  </div>
                  <button
                    v-if="mod.project_key"
                    type="button"
                    class="module-card__project"
                    title="Open project"
                    @click.stop="goProject(mod.project_key)"
                  >
                    <el-icon><Folder /></el-icon>
                    <span>{{ projectName(mod.project_key) }}</span>
                  </button>
                  <div v-if="mod.description" class="module-card__desc" v-html="descHtml(mod)" />
                  <div class="module-card__meta">
                    <span class="module-card__time" :class="timeHintClass(mod)">{{ timeHint(mod) }}</span>
                    <span v-if="mod.lead" class="module-card__lead">{{ mod.lead }}</span>
                  </div>
                  <div v-if="issueCount(mod)" class="module-card__progress">
                    <div class="module-card__progress-row">
                      <span>{{ doneCount(mod) }} / {{ issueCount(mod) }} done</span>
                      <span>{{ progressPct(mod) }}%</span>
                    </div>
                    <el-progress
                      :percentage="progressPct(mod)"
                      :stroke-width="6"
                      :show-text="false"
                      :color="progressColor(mod)"
                    />
                  </div>
                  <div v-if="mod.issue_keys?.length" class="module-card__issues-list">
                    <div
                      v-for="key in mod.issue_keys"
                      :key="key"
                      class="module-card__issue-row"
                      @click.stop="openIssuePreview(key)"
                    >
                      <span
                        class="module-card__issue-priority"
                        :style="{ background: priorityColor(issueMap.get(key)?.priority || '') }"
                      />
                      <span class="module-card__issue-key">{{ key }}</span>
                      <span class="module-card__issue-title">{{ issueMap.get(key)?.title || key }}</span>
                      <span v-if="issueMap.get(key)?.assignee" class="module-card__issue-assignee">{{
                        issueMap.get(key)?.assignee
                      }}</span>
                      <el-tag
                        v-if="issueMap.get(key)?.status"
                        :type="
                          issueMap.get(key)?.status === 'done'
                            ? 'success'
                            : issueMap.get(key)?.status === 'in_progress'
                              ? 'primary'
                              : 'info'
                        "
                        size="small"
                        >{{ issueMap.get(key)?.status }}</el-tag
                      >
                    </div>
                  </div>
                  <div class="module-card__footer">
                    <div class="module-card__footer-left">
                      <span class="module-card__issues">{{ issueCount(mod) }} issues</span>
                      <span class="module-card__updated">Updated {{ formatRelativeTime(mod.updated_at) }}</span>
                    </div>
                    <div class="module-card__actions">
                      <el-button link size="small" type="primary" @click.stop="goDetail(mod.key)">Open</el-button>
                      <el-button link size="small" @click.stop="openEdit(mod)">Edit</el-button>
                      <el-button link size="small" type="danger" @click.stop="handleDelete(mod)">Delete</el-button>
                    </div>
                  </div>
                </div>
              </el-card>
            </template>

            <template v-else>
              <div class="module-list-view">
                <div
                  v-for="mod in displayedModules"
                  :key="mod.key"
                  class="module-list-view__row"
                  :class="{ 'module-list-view__row--muted': mod.status === 'completed' || mod.status === 'cancelled' }"
                  @click="goDetail(mod.key)"
                >
                  <span class="module-list-view__dot" :style="{ background: STATUS_COLOR[mod.status] || '#909399' }" />
                  <span class="module-list-view__name">{{ mod.name }}</span>
                  <el-tag :type="statusTagType(mod.status)" size="small">{{ statusLabel(mod.status) }}</el-tag>
                  <span v-if="issueCount(mod)" class="module-list-view__progress">
                    <span>{{ doneCount(mod) }}/{{ issueCount(mod) }}</span>
                    <el-progress
                      :percentage="progressPct(mod)"
                      :stroke-width="3"
                      :show-text="false"
                      :color="progressColor(mod)"
                      style="width: 40px"
                    />
                  </span>
                  <span v-if="mod.lead" class="module-list-view__lead">{{ mod.lead }}</span>
                  <span class="module-list-view__time" :class="timeHintClass(mod)">{{ timeHint(mod) }}</span>
                </div>
              </div>
            </template>

            <div v-if="!store.loading && !store.modules.length" class="module-list__empty">
              <el-empty description="No modules yet">
                <el-button type="primary" @click="openCreate">Create your first module</el-button>
              </el-empty>
            </div>
            <div
              v-else-if="!store.loading && store.modules.length && !displayedModules.length && effectiveViewMode !== 'table'"
              class="module-list__empty"
            >
              <el-empty description="No matching modules" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create/Edit Dialog -->
    <ModuleFormDialog ref="dialogRef" :project-key="props.projectKey" @saved="refresh" />
    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="ts" name="moduleList">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  Plus,
  Search,
  Folder,
  Cpu,
  Loading,
  CircleCheckFilled,
  Clock,
  WarningFilled,
  RemoveFilled,
  UserFilled,
  Grid,
  Postcard,
  List,
  Document,
  Collection,
  Guide,
  Setting,
  Tickets,
  Opportunity,
  VideoPause,
  VideoPlay
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useModuleStore } from "@/stores/modules/module";
import { confirm } from "@/hooks/useConfirmAction";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { Module, ModuleStatus } from "@/api/modules/moduleService";
import { getModuleList } from "@/api/modules/moduleService";
import type { Issue, IssuePriority } from "@/api/modules/issueService";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { useMarkdown } from "@/hooks/useMarkdown";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { PageHeaderCard, ProTable } from "@/components";
import type { ColumnProps, ProTableInstance } from "@/components";
import { useDateFilter } from "@/hooks/useDateFilter";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import RecentlyViewed from "@/components/RecentlyViewed/RecentlyViewed.vue";
import FilterPills from "@/components/FilterPills/FilterPills.vue";
import { useProjectDetail } from "@/views/project/types";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import { useModuleData, qualityBarColor } from "./composables/useModuleData";
import { useModuleCharts, STATUS_COLOR } from "./composables/useModuleCharts";
import { useFileAlerts } from "./composables/useFileAlerts";
import ModuleFormDialog from "./components/ModuleFormDialog.vue";

const props = defineProps<{ projectKey?: string; filterDate?: Date | null }>();
const router = useRouter();
const store = useModuleStore();
const { t } = useI18n();
const dialogRef = ref<InstanceType<typeof ModuleFormDialog> | null>(null);
const { render: renderMarkdown } = useMarkdown();

const projectFilter = ref(props.projectKey || "");
const searchText = ref("");
const statusFilter = ref("");
const sortBy = ref<"issues" | "name" | "progress">("issues");
const recentlyViewed = ref<Module[]>([]);
const recentViewedItems = computed(() =>
  recentlyViewed.value.map(m => ({ key: m.key, title: m.name, color: STATUS_COLOR[m.status] || "#909399" }))
);
const viewMode = ref<"table" | "card" | "list">("card");
const effectiveViewMode = computed(() => (props.projectKey ? ("card" as const) : viewMode.value));
const proTable = ref<ProTableInstance>();
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

// ── Date filter ──
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

// ── Knowledge domain data (project detail context) ──
const ctx = (() => {
  try {
    return useProjectDetail();
  } catch {
    return null;
  }
})();
const knowledgeFiles = computed<KnowledgeFileEntry[]>(() => ctx?.knowledgeFiles.value ?? []);

interface DomainDef {
  key: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  fileCount: number;
  files: KnowledgeFileEntry[];
}

const DOMAIN_META: Record<string, { label: string; description: string; icon: any; color: string }> = {
  architecture: {
    label: "Architecture",
    description: "System design, routing, and module architecture",
    icon: Setting,
    color: "#5470c6"
  },
  patterns: {
    label: "Patterns",
    description: "Component patterns, state management, and code conventions",
    icon: Collection,
    color: "#91cc75"
  },
  workflows: {
    label: "Workflows",
    description: "Development workflows and step-by-step procedures",
    icon: Guide,
    color: "#e6a23c"
  },
  guides: { label: "Guides", description: "How-to guides and best practices", icon: Document, color: "#5ab1ef" },
  requirements: { label: "Requirements", description: "Feature requirements and PRD documents", icon: Tickets, color: "#ee6666" },
  specs: { label: "Specs", description: "Technical specifications and detailed designs", icon: Opportunity, color: "#9b59b6" }
};

const domains = computed<DomainDef[]>(() => {
  if (!props.projectKey || !knowledgeFiles.value.length) return [];
  const prefix = `projects/${props.projectKey}/`;
  const grouped = new Map<string, KnowledgeFileEntry[]>();
  for (const f of knowledgeFiles.value) {
    if (!f.path.startsWith(prefix)) continue;
    const rel = f.path.slice(prefix.length);
    const dir = rel.split("/")[0] || "unknown";
    if (dir === "bugs" || dir === "requirements") continue;
    if (!f.path.endsWith(".md")) continue;
    const arr = grouped.get(dir) ?? [];
    arr.push(f);
    grouped.set(dir, arr);
  }
  return Array.from(grouped.entries())
    .map(([key, files]) => {
      const meta = DOMAIN_META[key] ?? {
        label: key,
        description: `${files.length} knowledge file(s)`,
        icon: Folder,
        color: "#909399"
      };
      return { key, ...meta, fileCount: files.length, files };
    })
    .sort((a, b) => b.fileCount - a.fileCount);
});

function openDomain(d: DomainDef) {
  if (d.files.length === 1) {
    previewDlgRef.value?.open(d.files[0].path);
    return;
  }
  previewDlgRef.value?.open(d.files[0].path);
}

// ── Composable data (standalone route) ──
const { issueMap, projects, stats, headerPills, attention, completeness, issueCount, doneCount, progressPct, dashboard, dataAge, polling, refresh, init } =
  useModuleData({
    projectKey: props.projectKey,
    filterDateStr,
    isPropDate: props.filterDate !== undefined,
    onRefresh: () => proTable.value?.getTableList()
  });

const { statusDonutOption, progressBarOption, burndownOption, velocityOption } = useModuleCharts({ progressPct, dashboard });

const { hasAlerts: fileAlertsHasAlerts, summary: fileAlertsSummary, criticalCount: fileAlertsCriticalCount, warningCount: fileAlertsWarningCount, infoCount: fileAlertsInfoCount, alertsByDomain: fileAlertsAlertsByDomain, init: fileAlertsInit } = useFileAlerts({ projectKey: props.projectKey });

function projectName(key: string) {
  return projects.value.find(p => p.key === key)?.name || key;
}

function priorityColor(p: IssuePriority | string) {
  const m: Record<string, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return m[p] || "#909399";
}

function openIssuePreview(key: string) {
  const issue = issueMap.value.get(key);
  if (!issue) return;
  const date = (issue.created_at || "").slice(0, 10);
  const slug = issue.title
    .toLowerCase()
    .replace(/[→+(),]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filePath = `projects/${issue.project_key}/issues/${date}/${issue.issue_type}/${slug}.md`;
  previewDlgRef.value?.open(filePath);
}

function progressColor(mod: Module): string {
  const pct = progressPct(mod);
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
}

function timeHint(mod: Module): string {
  if (mod.status === "completed") return "Completed";
  if (mod.status === "cancelled") return "Cancelled";
  if (mod.status === "in_progress") {
    if (!mod.due_date) return "In progress";
    const ms = new Date(mod.due_date).getTime() - Date.now();
    if (ms < 0) return "Overdue";
    return `${Math.ceil(ms / 86400000)}d to due`;
  }
  return mod.due_date ? `Due ${formatDate(mod.due_date)}` : "Planned";
}

function timeHintClass(mod: Module): string {
  if (mod.status === "completed") return "module-card__time--done";
  if (mod.status === "cancelled") return "module-card__time--cancelled";
  if (mod.status === "in_progress") {
    if (!mod.due_date) return "module-card__time--active";
    const ms = new Date(mod.due_date).getTime() - Date.now();
    if (ms < 0) return "module-card__time--overdue";
    return "module-card__time--ok";
  }
  return "module-card__time--upcoming";
}

const descHtmlMap = computed(() => {
  const map = new Map<string, string>();
  for (const mod of store.modules) {
    if (mod.description) map.set(mod.key, renderMarkdown(mod.description));
  }
  return map;
});
function descHtml(mod: Module): string {
  return descHtmlMap.value.get(mod.key) || "";
}

// ── Displayed modules (card/list views) ──
const displayedModules = computed(() => {
  let list = store.modules;
  const q = searchText.value.trim().toLowerCase();
  if (q)
    list = list.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        projectName(m.project_key).toLowerCase().includes(q)
    );
  if (statusFilter.value) list = list.filter(m => m.status === statusFilter.value);
  const sorted = [...list];
  if (sortBy.value === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy.value === "progress") sorted.sort((a, b) => progressPct(b) - progressPct(a));
  else sorted.sort((a, b) => issueCount(b) - issueCount(a));
  return sorted;
});

const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || !!statusFilter.value;
  return isFiltered ? `${displayedModules.value.length} of ${store.total} modules` : `${store.total} modules`;
});

// ── Filter pills ──
const activePills = computed(() => {
  const pills: Array<{ key: string; label: string; clear: () => void }> = [];
  if (searchText.value.trim())
    pills.push({
      key: "search",
      label: `Search: ${searchText.value.trim()}`,
      clear: () => { searchText.value = ""; onFilterChange(); }
    });
  if (statusFilter.value)
    pills.push({
      key: "status",
      label: `Status: ${MODULE_STATUS_MAP[statusFilter.value as ModuleStatus] || statusFilter.value}`,
      clear: () => { statusFilter.value = ""; onFilterChange(); }
    });
  if (sortBy.value !== "issues") {
    const labels: Record<string, string> = { name: "Name", progress: "Progress" };
    pills.push({
      key: "sort",
      label: `Sort: ${labels[sortBy.value] || sortBy.value}`,
      clear: () => { sortBy.value = "issues"; onFilterChange(); }
    });
  }
  if (projectFilter.value && !props.projectKey)
    pills.push({
      key: "project",
      label: `Project: ${projectName(projectFilter.value)}`,
      clear: () => {
        projectFilter.value = "";
        onProjectFilterChange();
      }
    });
  return pills;
});

function clearAllFilters() {
  searchText.value = "";
  statusFilter.value = "";
  sortBy.value = "issues";
  if (!props.projectKey) projectFilter.value = "";
  onProjectFilterChange();
}

// ── ProTable requestApi ──
async function fetchModules(params: any) {
  const { pageNum, pageSize } = params;
  const apiParams: any = { pageNum, pageSize };
  if (projectFilter.value && !props.projectKey) apiParams.project_key = projectFilter.value;
  if (props.projectKey) apiParams.project_key = props.projectKey;
  if (statusFilter.value) apiParams.status = statusFilter.value;
  const dateFilter = filterDateStr.value
    ? props.filterDate !== undefined
      ? { due_date: filterDateStr.value }
      : { updated_at_start: filterDateStr.value, updated_at_end: filterDateStr.value }
    : {};
  Object.assign(apiParams, dateFilter);
  const res = await getModuleList(apiParams);
  return { list: res.data?.list ?? [], total: res.data?.total ?? 0 };
}

// ── ProTable columns ──
const moduleColumns = computed<ColumnProps<Module>[]>(() => [
  { prop: "name", label: "Name", minWidth: 180, sortable: true },
  { prop: "status", label: "Status", width: 110 },
  { prop: "lead", label: "Lead", width: 100 },
  { prop: "issues", label: "Issues", width: 120 },
  ...(props.projectKey ? [] : [{ prop: "project_key", label: "Project", width: 120 } as ColumnProps<Module>]),
  { prop: "dates", label: "Dates", width: 160 },
  { prop: "operation", label: "Actions", width: 190, fixed: "right" as const }
]);

function onFilterChange() {
  proTable.value?.getTableList();
}
function onProjectFilterChange() {
  refresh();
  proTable.value?.getTableList();
}

// ── Charts ──
function onStatusChartClick(e: { name?: string }) {
  if (!e?.name) return;
  statusFilter.value = statusFilter.value === e.name ? "" : e.name;
  onFilterChange();
}

function applyAttentionFilter(type: "overdue" | "empty" | "stalled" | "blocked" | "unassigned" | "in_progress" | "completed") {
  if (type === "overdue") statusFilter.value = "in_progress";
  else if (type === "empty") statusFilter.value = statusFilter.value === "planned" ? "" : "planned";
  else if (type === "stalled" || type === "blocked" || type === "unassigned") statusFilter.value = statusFilter.value === "in_progress" ? "" : "in_progress";
  else if (type === "in_progress") statusFilter.value = statusFilter.value === "in_progress" ? "" : "in_progress";
  else if (type === "completed") statusFilter.value = statusFilter.value === "completed" ? "" : "completed";
  onFilterChange();
}

// ── Recently viewed ──
function trackRecent(mod: Module) {
  recentlyViewed.value = [mod, ...recentlyViewed.value.filter(r => r.key !== mod.key)].slice(0, 8);
}

  // ── Dialog ──
  function openCreate() {
    dialogRef.value?.openCreate(projectFilter.value);
  }

  function openEdit(mod: Module) {
    dialogRef.value?.openEdit(mod);
  }

async function handleDelete(mod: Module) {
  const ok = await confirm(
    t("module.dialog.deleteConfirm", { name: mod.name }),
    t("common.deleteTitle"),
    "error"
  );
  if (!ok) return;
  await store.removeModule(mod.key, projectFilter.value || undefined);
  ElMessage.success(t("module.dialog.deleteSuccess"));
  refresh();
  proTable.value?.getTableList();
}

function goDetail(key: string) {
  const mod = store.modules.find(m => m.key === key);
  if (mod) trackRecent(mod);
  router.push(`/module/${key}`);
}
function goProject(key: string) {
  if (key) router.push(`/project/${key}`);
}
function statusLabel(s: ModuleStatus) {
  return MODULE_STATUS_MAP[s] || s;
}
function statusTagType(s: ModuleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = {
    planned: "info",
    in_progress: "primary",
    completed: "success",
    cancelled: "danger"
  };
  return m[s] || "info";
}

onMounted(async () => {
  if (!props.projectKey) {
    await init();
    fileAlertsInit();
    if (effectiveViewMode.value === "table") proTable.value?.getTableList();
  }
});

watch(filterDateStr, () => {
  refresh();
  proTable.value?.getTableList();
});
</script>


<style scoped lang="scss">
@use "./styles/module.scss";
</style>
