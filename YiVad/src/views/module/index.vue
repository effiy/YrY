<template>
  <div class="module-list">
    <PageHeaderCard
      v-if="!props.projectKey"
      :icon="Cpu"
      icon-bg="linear-gradient(135deg, #5470c6, #4460b0)"
      title="Modules"
      description="Organize work into functional system components"
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
        <div class="module-chart__title">Created · 14d</div>
        <div class="module-chart__body">
          <ECharts :option="trendOption" height="200" />
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <div v-if="!props.projectKey && recentlyViewed.length" class="module-list__recent">
      <span class="module-list__recent-label">Recently viewed</span>
      <button v-for="m in recentlyViewed" :key="m.key" type="button" class="module-list__recent-chip" :title="m.name" @click="goDetail(m.key)">
        <span class="module-list__recent-dot" :style="{ background: STATUS_COLOR[m.status] || '#909399' }" />
        <span class="module-list__recent-key">{{ m.key }}</span>
        <span class="module-list__recent-name">{{ m.name }}</span>
      </button>
      <button type="button" class="module-list__recent-clear" @click="recentlyViewed = []">✕</button>
    </div>

    <!-- Active Filter Pills (standalone route only) -->
    <div v-if="!props.projectKey && activePills.length" class="module-list__pills">
      <span class="module-list__pills-label">Filters</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="p.clear()">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
    </div>

    <!-- ====== Knowledge Domain Cards (project detail context) ====== -->
    <template v-if="props.projectKey">
      <div v-if="domains.length" class="md-domain-grid">
        <div
          v-for="d in domains"
          :key="d.key"
          class="md-domain-card"
          @click="openDomain(d)"
        >
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
              <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
              <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
              <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
            </el-radio-group>
          </div>
          <div class="module-list__sidebar-section">
            <div class="module-list__sidebar-section-header">
              <span class="module-list__sidebar-section-label">Overview</span>
            </div>
            <div class="module-list__sidebar-section-body">
              <div class="module-list__sidebar-card" @click="router.push('/module')">
                <div class="module-list__sidebar-card-icon" style="background:linear-gradient(135deg,#5470c6,#4460b0)"><el-icon><Cpu /></el-icon></div>
                <div class="module-list__sidebar-card-info">
                  <span class="module-list__sidebar-card-value">{{ stats.total }}</span>
                  <span class="module-list__sidebar-card-label">Total</span>
                </div>
              </div>
              <div class="module-list__sidebar-card" @click="applyAttentionFilter('in_progress')">
                <div class="module-list__sidebar-card-icon" style="background:linear-gradient(135deg,#5ab1ef,#3a90d0)"><el-icon><Loading /></el-icon></div>
                <div class="module-list__sidebar-card-info">
                  <span class="module-list__sidebar-card-value">{{ stats.inProgress }}</span>
                  <span class="module-list__sidebar-card-label">Active</span>
                </div>
              </div>
              <div class="module-list__sidebar-card" @click="applyAttentionFilter('completed')">
                <div class="module-list__sidebar-card-icon" style="background:linear-gradient(135deg,#91cc75,#7ab85e)"><el-icon><CircleCheckFilled /></el-icon></div>
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
          <div class="module-list__sidebar-section" style="margin-top:12px">
            <div class="module-list__sidebar-section-header" style="border-left-color: var(--el-color-danger);">
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
            </div>
          </div>
          <div class="module-list__sidebar-section" style="margin-top:12px">
            <div class="module-list__sidebar-section-header" style="border-left-color: var(--el-color-success);">
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
            </div>
            <div class="module-list__head-actions">
              <el-input v-model="searchText" class="module-list__search" size="small" clearable placeholder="Search modules…" :prefix-icon="Search" @change="onFilterChange" />
              <el-select v-model="statusFilter" class="module-list__status" size="small" placeholder="Status" @change="onFilterChange">
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
              <el-select v-model="projectFilter" placeholder="Project" clearable class="module-list__project" size="small" @change="onProjectFilterChange">
                <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
              </el-select>
              <el-button type="primary" :icon="Plus" @click="openCreate">New Module</el-button>
            </div>
          </div>

          <div v-loading="store.loading" class="module-list__grid" :class="{ 'module-list__grid--non-card': effectiveViewMode !== 'card' }">
            <template v-if="effectiveViewMode === 'table'">
              <ProTable
                ref="proTable"
                title="Modules"
                :columns="moduleColumns"
                :request-api="fetchModules"
                :pagination="true"
              >
                <template #name="scope">
                  <span class="module-table__name" @click="goDetail(scope.row.key)">{{ scope.row.name }}</span>
                </template>
                <template #status="scope">
                  <el-tag :type="statusTagType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
                </template>
                <template #issues="scope">
                  <div class="module-table__issues">
                    <span>{{ doneCount(scope.row) }}/{{ issueCount(scope.row) }}</span>
                    <el-progress :percentage="progressPct(scope.row)" :stroke-width="4" :show-text="false" :color="progressColor(scope.row)" style="width:60px" />
                  </div>
                </template>
                <template #project_key="scope">
                  <button v-if="scope.row.project_key" type="button" class="module-card__project" @click.stop="goProject(scope.row.project_key)">
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
                  <button v-if="mod.project_key" type="button" class="module-card__project" title="Open project" @click.stop="goProject(mod.project_key)">
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
                    <el-progress :percentage="progressPct(mod)" :stroke-width="6" :show-text="false" :color="progressColor(mod)" />
                  </div>
                  <div v-if="mod.issue_keys?.length" class="module-card__issues-list">
                    <div v-for="key in mod.issue_keys" :key="key" class="module-card__issue-row" @click.stop="openIssuePreview(key)">
                      <span class="module-card__issue-priority" :style="{ background: priorityColor(issueMap.get(key)?.priority || '') }" />
                      <span class="module-card__issue-key">{{ key }}</span>
                      <span class="module-card__issue-title">{{ issueMap.get(key)?.title || key }}</span>
                      <span v-if="issueMap.get(key)?.assignee" class="module-card__issue-assignee">{{ issueMap.get(key)?.assignee }}</span>
                      <el-tag v-if="issueMap.get(key)?.status" :type="issueMap.get(key)?.status === 'done' ? 'success' : issueMap.get(key)?.status === 'in_progress' ? 'primary' : 'info'" size="small">{{ issueMap.get(key)?.status }}</el-tag>
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
                    <el-progress :percentage="progressPct(mod)" :stroke-width="3" :show-text="false" :color="progressColor(mod)" style="width:40px" />
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
            <div v-else-if="!store.loading && store.modules.length && !displayedModules.length && effectiveViewMode !== 'table'" class="module-list__empty">
              <el-empty description="No matching modules" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Module' : 'New Module'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Module name" maxlength="100" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" placeholder="Module description (Markdown)" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in MODULE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Lead">
              <el-input v-model="dialog.form.lead" placeholder="Module lead" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Start Date">
              <el-date-picker v-model="dialog.form.start_date" type="date" placeholder="Start date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Due Date">
              <el-date-picker v-model="dialog.form.due_date" type="date" placeholder="Due date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="ts" name="moduleList">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Folder, Cpu, Loading, CircleCheckFilled, Clock, WarningFilled, Grid, Postcard, List, Document, Collection, Guide, Setting, Tickets, Opportunity } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useModuleStore } from "@/stores/modules/module";
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
import { useProjectDetail } from "@/views/project/types";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import { useModuleData, qualityBarColor } from "./composables/useModuleData";
import { useModuleCharts, STATUS_COLOR } from "./composables/useModuleCharts";

const props = defineProps<{ projectKey?: string; filterDate?: Date | null }>();
const router = useRouter();
const store = useModuleStore();
const formRef = ref<FormInstance>();
const { render: renderMarkdown } = useMarkdown();

const projectFilter = ref(props.projectKey || "");
const searchText = ref("");
const statusFilter = ref("");
const sortBy = ref<"issues" | "name" | "progress">("issues");
const recentlyViewed = ref<Module[]>([]);
const viewMode = ref<"table" | "card" | "list">("card");
const effectiveViewMode = computed(() => props.projectKey ? "card" as const : viewMode.value);
const proTable = ref<ProTableInstance>();
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

// ── Date filter ──
const _filterDate = ref<Date | null>(null);
const filterDate = computed({
  get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
  set: (v) => { _filterDate.value = v; }
});
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

// ── Knowledge domain data (project detail context) ──
const ctx = (() => { try { return useProjectDetail(); } catch { return null; } })();
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
  architecture: { label: "Architecture", description: "System design, routing, and module architecture", icon: Setting, color: "#5470c6" },
  patterns: { label: "Patterns", description: "Component patterns, state management, and code conventions", icon: Collection, color: "#91cc75" },
  workflows: { label: "Workflows", description: "Development workflows and step-by-step procedures", icon: Guide, color: "#e6a23c" },
  guides: { label: "Guides", description: "How-to guides and best practices", icon: Document, color: "#5ab1ef" },
  requirements: { label: "Requirements", description: "Feature requirements and PRD documents", icon: Tickets, color: "#ee6666" },
  specs: { label: "Specs", description: "Technical specifications and detailed designs", icon: Opportunity, color: "#9b59b6" },
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
      const meta = DOMAIN_META[key] ?? { label: key, description: `${files.length} knowledge file(s)`, icon: Folder, color: "#909399" };
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
const {
  issueMap,
  projects,
  stats,
  headerPills,
  attention,
  completeness,
  issueCount,
  doneCount,
  progressPct,
  refresh,
  init
} = useModuleData({
  projectKey: props.projectKey,
  filterDateStr,
  isPropDate: props.filterDate !== undefined
});

const { statusDonutOption, progressBarOption, trendOption } = useModuleCharts({ progressPct });

function projectName(key: string) { return projects.value.find(p => p.key === key)?.name || key; }

function priorityColor(p: IssuePriority | string) {
  const m: Record<string, string> = { urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc" };
  return m[p] || "#909399";
}

function openIssuePreview(key: string) {
  const issue = issueMap.value.get(key);
  if (!issue) return;
  const date = (issue.created_at || "").slice(0, 10);
  const slug = issue.title.toLowerCase().replace(/[→+(),]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
  for (const mod of store.modules) { if (mod.description) map.set(mod.key, renderMarkdown(mod.description)); }
  return map;
});
function descHtml(mod: Module): string { return descHtmlMap.value.get(mod.key) || ""; }

// ── Displayed modules (card/list views) ──
const displayedModules = computed(() => {
  let list = store.modules;
  const q = searchText.value.trim().toLowerCase();
  if (q) list = list.filter(m => m.name.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q) || projectName(m.project_key).toLowerCase().includes(q));
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
  const pills: Array<{ id: string; label: string; clear: () => void }> = [];
  if (searchText.value.trim()) pills.push({ id: "search", label: `Search: ${searchText.value.trim()}`, clear: () => { searchText.value = ""; onFilterChange(); } });
  if (statusFilter.value) pills.push({ id: "status", label: `Status: ${MODULE_STATUS_MAP[statusFilter.value as ModuleStatus] || statusFilter.value}`, clear: () => { statusFilter.value = ""; onFilterChange(); } });
  if (sortBy.value !== "issues") {
    const labels: Record<string, string> = { name: "Name", progress: "Progress" };
    pills.push({ id: "sort", label: `Sort: ${labels[sortBy.value] || sortBy.value}`, clear: () => { sortBy.value = "issues"; onFilterChange(); } });
  }
  if (projectFilter.value && !props.projectKey) pills.push({ id: "project", label: `Project: ${projectName(projectFilter.value)}`, clear: () => { projectFilter.value = ""; onProjectFilterChange(); } });
  return pills;
});

function clearAllFilters() {
  searchText.value = ""; statusFilter.value = ""; sortBy.value = "issues";
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
    ? (props.filterDate !== undefined
        ? { due_date: filterDateStr.value }
        : { updated_at_start: filterDateStr.value, updated_at_end: filterDateStr.value })
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

function onFilterChange() { proTable.value?.getTableList(); }
function onProjectFilterChange() { refresh(); proTable.value?.getTableList(); }

// ── Charts ──
function onStatusChartClick(e: { name?: string }) {
  if (!e?.name) return;
  statusFilter.value = statusFilter.value === e.name ? "" : e.name;
  onFilterChange();
}

function applyAttentionFilter(type: "overdue" | "empty" | "stalled" | "in_progress" | "completed") {
  if (type === "overdue") statusFilter.value = "in_progress";
  else if (type === "empty") statusFilter.value = statusFilter.value === "planned" ? "" : "planned";
  else if (type === "stalled") statusFilter.value = statusFilter.value === "in_progress" ? "" : "in_progress";
  else if (type === "in_progress") statusFilter.value = statusFilter.value === "in_progress" ? "" : "in_progress";
  else if (type === "completed") statusFilter.value = statusFilter.value === "completed" ? "" : "completed";
  onFilterChange();
}

// ── Recently viewed ──
function trackRecent(mod: Module) {
  recentlyViewed.value = [mod, ...recentlyViewed.value.filter(r => r.key !== mod.key)].slice(0, 8);
}

// ── Dialog ──
const rules: FormRules = {
  name: [{ required: true, message: "Module name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: {
    name: "", description: "", status: "planned" as ModuleStatus, lead: "",
    project_key: props.projectKey || "", issue_keys: [] as string[],
    start_date: "", due_date: ""
  }
});

function openCreate() {
  dialog.isEdit = false; dialog.editKey = "";
  dialog.form = { name: "", description: "", status: "planned" as ModuleStatus, lead: "", project_key: projectFilter.value || "", issue_keys: [], start_date: "", due_date: "" };
  dialog.visible = true;
}

function openEdit(mod: Module) {
  dialog.isEdit = true; dialog.editKey = mod.key;
  dialog.form = { name: mod.name, description: mod.description || "", status: mod.status, lead: mod.lead || "", project_key: mod.project_key, issue_keys: mod.issue_keys || [], start_date: mod.start_date || "", due_date: mod.due_date || "" };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editModule(dialog.editKey, { name: dialog.form.name, description: dialog.form.description, status: dialog.form.status, lead: dialog.form.lead, start_date: dialog.form.start_date, due_date: dialog.form.due_date });
      ElMessage.success("Module updated");
    } else {
      await store.addModule({ key: `MOD-${Date.now().toString(36).toUpperCase()}`, project_key: dialog.form.project_key || projectFilter.value || "default", name: dialog.form.name, description: dialog.form.description, status: dialog.form.status, lead: dialog.form.lead, issue_keys: [], start_date: dialog.form.start_date, due_date: dialog.form.due_date });
      ElMessage.success("Module created");
    }
    dialog.visible = false;
    refresh();
    proTable.value?.getTableList();
  } finally { dialog.submitting = false; }
}

async function handleDelete(mod: Module) {
  try {
    await ElMessageBox.confirm(`Delete module "${mod.name}"?`, "Delete", { type: "error" });
    await store.removeModule(mod.key, projectFilter.value || undefined);
    ElMessage.success("Module deleted");
    refresh();
    proTable.value?.getTableList();
  } catch { /* cancelled */ }
}

function goDetail(key: string) {
  const mod = store.modules.find(m => m.key === key);
  if (mod) trackRecent(mod);
  router.push(`/module/${key}`);
}
function goProject(key: string) { if (key) router.push(`/project/${key}`); }
function statusLabel(s: ModuleStatus) { return MODULE_STATUS_MAP[s] || s; }
function statusTagType(s: ModuleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", completed: "success", cancelled: "danger" };
  return m[s] || "info";
}

onMounted(async () => {
  if (!props.projectKey) {
    await init();
    if (effectiveViewMode.value === "table") proTable.value?.getTableList();
  }
});

watch(filterDateStr, () => { refresh(); proTable.value?.getTableList(); });
</script>

<style scoped lang="scss">
.module-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}

// ── Knowledge Domain Cards ──
.md-domain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.md-domain-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
    .md-domain-card__icon { transform: scale(1.08); }
  }
}
.md-domain-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.18s;
}
.md-domain-card__body {
  flex: 1;
  min-width: 0;
}
.md-domain-card__name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.md-domain-card__desc {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
  line-height: 1.4;
}
.md-domain-card__count {
  text-align: center;
  flex-shrink: 0;
}
.md-domain-card__count-val {
  display: block;
  font-size: 22px;
  font-weight: 700;
  font-family: DIN, sans-serif;
  color: var(--el-text-color-primary);
  line-height: 1.1;
}
.md-domain-card__count-lbl {
  display: block;
  font-size: 10px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// ── Charts ──
.module-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.module-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.module-chart--active { border-color: var(--el-color-primary); box-shadow: 0 0 0 1px var(--el-color-primary-light-5); }
.module-chart__title {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 12px; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.module-chart__badge {
  padding: 0 5px; font-size: 9px; font-weight: 600; line-height: 15px;
  color: var(--el-color-primary); background: var(--el-color-primary-light-9);
  border-radius: 3px; text-transform: none;
}
.module-chart__body { flex: 1; min-height: 0; padding: 8px; }

// ── Recently Viewed ──
.module-list__recent {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 8px 12px; margin-bottom: 16px; border-radius: 8px;
  background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter);
}
.module-list__recent-label { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); margin-right: 2px; }
.module-list__recent-chip {
  display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px;
  font-size: 12px; color: var(--el-text-color-primary);
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px; cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover { border-color: var(--el-color-primary); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
}
.module-list__recent-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.module-list__recent-key { font-family: monospace; font-size: 11px; color: var(--el-text-color-secondary); }
.module-list__recent-name { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.module-list__recent-clear {
  margin-left: auto; border: none; background: transparent;
  color: var(--el-text-color-placeholder); cursor: pointer; font-size: 13px; line-height: 1; padding: 4px;
  &:hover { color: var(--el-color-danger); }
}

// ── Filter Pills ──
.module-list__pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.module-list__pills-label { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); }

// ── Body / Main / Sidebar ──
.module-list__body { display: flex; gap: 24px; }
.module-list__main { flex: 1; min-width: 0; }
.module-list__sidebar {
  width: 240px; flex-shrink: 0; position: sticky; top: 24px; align-self: flex-start;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border-radius: 12px; padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
}
.module-list__sidebar-view {
  padding: 4px 4px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

// ── Sidebar Section ──
.module-list__sidebar-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.module-list__sidebar-section-header {
  display: flex; align-items: center;
  padding: 8px 12px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
  padding-left: 10px;
}
.module-list__sidebar-section-label { flex: 1; }
.module-list__sidebar-section-hint {
  font-size: 10px; font-weight: 500; color: var(--el-text-color-placeholder);
  text-transform: none; letter-spacing: 0;
}
.module-list__sidebar-section-body {
  padding: 8px; display: flex; flex-direction: column; gap: 4px;
}

// ── Sidebar Card (stat item) ──
.module-list__sidebar-card {
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
.module-list__sidebar-card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 7px;
  color: #fff; font-size: 13px; flex-shrink: 0;
}
.module-list__sidebar-card-info {
  display: flex; flex-direction: column; gap: 0; min-width: 0;
}
.module-list__sidebar-card-value {
  font-size: 16px; font-weight: 700; line-height: 1.1;
  color: var(--el-text-color-primary); font-family: DIN, sans-serif;
}
.module-list__sidebar-card-label {
  font-size: 10px; color: var(--el-text-color-secondary);
}

// ── Sidebar Card (attention variant) ──
.module-list__sidebar-card-accent-icon {
  font-size: 14px; flex-shrink: 0;
}
.module-list__sidebar-card-accent-value {
  font-size: 16px; font-weight: 700; font-family: DIN, sans-serif; min-width: 20px;
}
.module-list__sidebar-card-accent-label {
  font-size: 11px; color: var(--el-text-color-secondary); flex: 1;
}
.module-list__sidebar-card--overdue {
  .module-list__sidebar-card-accent-icon,
  .module-list__sidebar-card-accent-value { color: var(--el-color-danger); }
}
.module-list__sidebar-card--empty {
  .module-list__sidebar-card-accent-icon,
  .module-list__sidebar-card-accent-value { color: var(--el-color-warning); }
}
.module-list__sidebar-card--stalled {
  .module-list__sidebar-card-accent-icon,
  .module-list__sidebar-card-accent-value { color: var(--el-color-primary); }
}

// ── Sidebar Progress ──
.module-list__sidebar-progress {
  padding: 0 12px 12px;
}
.module-list__sidebar-progress-label {
  display: block; font-size: 10px; font-weight: 600;
  color: var(--el-text-color-secondary); margin-bottom: 4px;
}

// ── Sidebar Quality ──
.module-list__sidebar-quality {
  padding: 4px 0;
  & + & { padding-top: 8px; }
}
.module-list__sidebar-quality-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;
}
.module-list__sidebar-quality-label {
  font-size: 11px; color: var(--el-text-color-secondary);
}
.module-list__sidebar-quality-pct {
  font-size: 11px; font-weight: 600; font-family: DIN, sans-serif;
}

// ── Head ──
.module-list__head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.module-list__head-left { display: flex; align-items: center; gap: 12px; }
.module-list__head-count { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); }
.module-list__head-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.module-list__search { width: 190px; }
.module-list__status { width: 130px; }
.module-list__sort { width: 130px; }
.module-list__project { width: 190px; }

// ── Card Grid ──
.module-list__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.module-list__grid--non-card { display: block; }
.module-card {
  cursor: pointer; overflow: hidden; border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  :deep(.el-card__body) { padding: 0; }
  &:hover { transform: translateY(-4px); box-shadow: var(--el-box-shadow-light); }
}
.module-card--muted { opacity: 0.82; }
.module-card__status-bar { height: 3px; }
.module-card__body { padding: 16px; }
.module-card__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
.module-card__name { font-size: 16px; font-weight: 600; }
.module-card__project {
  display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px;
  border: none; border-radius: 6px; background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary); font-size: 12px; cursor: pointer; margin-bottom: 8px;
  transition: color 0.15s, background 0.15s;
  .el-icon { font-size: 13px; }
  &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}
.module-card__desc {
  font-size: 13px; color: var(--el-text-color-secondary); margin: 0 0 10px;
  line-height: 1.55; word-break: break-word;
  :deep(p) { margin: 0 0 6px; }
  :deep(p:last-child) { margin-bottom: 0; }
  :deep(strong) { color: var(--el-text-color-primary); font-weight: 600; }
  :deep(code) { font-family: monospace; font-size: 12px; color: var(--el-color-danger); background: var(--el-fill-color-light); padding: 1px 5px; border-radius: 3px; }
  :deep(ul), :deep(ol) { margin: 0 0 6px; padding-left: 18px; }
  :deep(li) { margin: 2px 0; }
}
.module-card__meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.module-card__time {
  font-size: 12px; font-weight: 500; border-radius: 999px; padding: 1px 8px;
  &--ok { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &--overdue { color: #fff; background: var(--el-color-danger); }
  &--done { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &--cancelled { color: var(--el-color-info); background: var(--el-color-info-light-9); }
  &--active { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &--upcoming { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}
.module-card__lead { font-size: 12px; color: var(--el-text-color-placeholder); }
.module-card__progress { margin-bottom: 12px; }
.module-card__progress-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 4px; }
.module-card__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--el-border-color-lighter); }
.module-card__issues { font-size: 12px; color: var(--el-text-color-placeholder); }
.module-card__footer-left { display: flex; flex-direction: column; gap: 2px; }
.module-card__updated { font-size: 11px; color: var(--el-text-color-placeholder); }
.module-card__actions { display: flex; align-items: center; gap: 2px; }
.module-card__issues-list {
  margin-bottom: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 200px;
}
.module-card__issue-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.12s;
  margin-left: -4px;
  margin-right: -4px;
  &:hover { background: var(--el-fill-color-light); }
}
.module-card__issue-priority {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.module-card__issue-key {
  font-size: 10px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 0 4px;
  border-radius: 2px;
  flex-shrink: 0;
}
.module-card__issue-title {
  font-size: 11px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.module-card__issue-assignee {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.module-list__empty { grid-column: 1 / -1; padding: 60px 0; }

// ── Table View ──
.module-table__name {
  font-weight: 500;
  color: var(--el-color-primary);
  cursor: pointer;
}
.module-table__issues {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.module-table__dates {
  font-size: 12px;
  &--overdue { color: var(--el-color-danger); font-weight: 600; }
  &--done { color: var(--el-color-success); }
  &--cancelled { color: var(--el-color-info); }
  &--active { color: var(--el-color-primary); }
  &--ok { color: var(--el-color-warning); }
  &--upcoming { color: var(--el-color-info); }
}

// ── List View ──
.module-list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.module-list-view__row {
  display: flex;
  align-items: center;
  gap: 12px;
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
  &--muted { opacity: 0.7; }
}
.module-list-view__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.module-list-view__name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.module-list-view__progress {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.module-list-view__lead {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
.module-list-view__time {
  font-size: 12px;
  flex-shrink: 0;
  &--overdue { color: var(--el-color-danger); font-weight: 600; }
  &--done { color: var(--el-color-success); }
  &--cancelled { color: var(--el-color-info); }
  &--active { color: var(--el-color-primary); }
  &--ok { color: var(--el-color-warning); }
  &--upcoming { color: var(--el-color-info); }
}
</style>