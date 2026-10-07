<template>
  <div class="rb">
    <!-- Header -->
    <header class="rb-head">
      <div class="rb-head__left">
        <h1 class="rb-head__title">
            {{ $t("reports.title") }}
            <span v-if="components.length" class="rb-head__count">{{ components.length }} component{{ components.length !== 1 ? 's' : '' }}</span>
          </h1>
        <span class="rb-head__desc">Interactive analytics dashboard — compose reports with live project, quality &amp; flow metrics</span>
      </div>
      <div class="rb-head__filters">
        <el-select
          v-model="selectedProject"
          placeholder="All Projects"
          clearable
          size="small"
          style="width: 180px"
          @change="onFilterChange"
        >
          <el-option
            v-for="p in projects"
            :key="p"
            :label="p"
            :value="p"
          />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="→"
          start-placeholder="Start"
          end-placeholder="End"
          size="small"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          style="width: 260px"
          @change="onFilterChange"
        />
        <el-tooltip :content="polling ? `Auto-refresh: ${pollInterval}s` : 'Auto-refresh off'" placement="bottom">
          <el-dropdown trigger="click" @command="handlePollCommand">
            <el-button
              size="small"
              :type="polling ? 'primary' : 'default'"
              :icon="Refresh"
            />
            <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="off">
                <el-icon><Close /></el-icon> Off
              </el-dropdown-item>
              <el-dropdown-item command="30">Every 30s</el-dropdown-item>
              <el-dropdown-item command="60">Every 60s</el-dropdown-item>
              <el-dropdown-item command="120">Every 2m</el-dropdown-item>
              <el-dropdown-item command="300">Every 5m</el-dropdown-item>
            </el-dropdown-menu>
          </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip content="Refresh now" placement="bottom">
          <el-button size="small" :icon="RefreshRight" :loading="dataLoading" @click="manualRefresh" />
        </el-tooltip>
        <span v-if="lastUpdated" class="rb-head__updated">
          Updated {{ fmtTime(lastUpdated) }}
        </span>
      </div>
      <div class="rb-head__actions">
        <el-button size="small" :icon="FolderOpened" @click="openLoadDialog">Load</el-button>
        <el-button size="small" :icon="DocumentAdd" @click="openSaveDialog">Save</el-button>
        <el-button size="small" :icon="Printer" @click="exportReport">Export</el-button>
        <el-button size="small" :icon="Delete" @click="clearCanvas" :disabled="!components.length">Clear</el-button>
      </div>
    </header>

    <!-- Body -->
    <div class="rb-body">
      <!-- Sidebar -->
      <aside class="rb-sidebar">
        <!-- Palette -->
        <div class="rb-side-section">
          <div class="rb-side-title">Components</div>
          <div class="rb-palette">
            <div
              v-for="item in paletteItems"
              :key="item.type"
              class="rb-palette-item"
              draggable="true"
              @dragstart="onDragStart($event, item)"
            >
              <el-icon :size="16"><component :is="item.icon" /></el-icon>
              <div class="rb-palette-item__info">
                <span class="rb-palette-item__name">{{ item.label }}</span>
                <span class="rb-palette-item__desc">{{ item.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Templates -->
        <div class="rb-side-section">
          <div class="rb-side-title">Templates</div>
          <template v-for="group in templateGroups" :key="group.key">
            <div class="rb-tpl-group">{{ group.label }}</div>
            <div
              v-for="tpl in group.items"
              :key="tpl.type"
              class="rb-tpl-item"
              @click="applyTemplate(tpl)"
            >
              <el-tooltip :content="tpl.description" placement="right" :show-after="400">
                <div class="rb-tpl-item__inner">
                  <el-icon :size="14"><component :is="tpl.icon" /></el-icon>
                  <div class="rb-tpl-item__info">
                    <span class="rb-tpl-item__name">{{ tpl.label }}</span>
                    <span class="rb-tpl-item__desc">{{ tpl.description }}</span>
                  </div>
                  <el-tag size="small" effect="plain">{{ tpl.components.length }}</el-tag>
                </div>
              </el-tooltip>
            </div>
          </template>
        </div>

        <!-- Saved Reports -->
        <div v-if="savedReports.length" class="rb-side-section">
          <div class="rb-side-title">Saved Reports</div>
          <div class="rb-templates">
            <div
              v-for="r in savedReports"
              :key="r.report_id"
              class="rb-tpl-item"
              @click="loadReport(r)"
            >
              <div class="rb-tpl-item__info">
                <span class="rb-tpl-item__name">{{ r.name }}</span>
                <span v-if="r.description" class="rb-tpl-item__desc">{{ r.description }}</span>
                <span class="rb-tpl-item__meta">
                  <el-tag size="small" effect="plain">{{ formatReportType(r.type) }}</el-tag>
                  <span v-if="r.updated_at" class="rb-tpl-item__date">{{ r.updated_at.slice(0, 10) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Canvas -->
      <main
        class="rb-canvas"
        :class="{ 'rb-canvas--empty': !components.length }"
        @drop.prevent="onDrop"
        @dragover.prevent
      >
        <!-- Empty state -->
        <div v-if="!components.length" class="rb-canvas-empty">
          <el-icon :size="48" color="var(--el-text-color-disabled)"><DataBoard /></el-icon>
          <h3>Create a Report</h3>
          <p>Drag components from the palette, or choose a template below to build a professional dashboard in seconds.</p>
          <div class="rb-canvas-empty__actions">
            <template v-for="group in templateGroups.slice(0, 2)" :key="group.key">
              <div class="rb-canvas-empty__group-label">{{ group.label }}</div>
              <div
                v-for="tpl in group.items.slice(0, 2)"
                :key="tpl.type"
                class="rb-canvas-empty__tpl"
                @click="applyTemplate(tpl)"
              >
                <el-icon :size="18"><component :is="tpl.icon" /></el-icon>
                <div class="rb-canvas-empty__tpl-info">
                  <span class="rb-canvas-empty__tpl-name">{{ tpl.label }}</span>
                  <span class="rb-canvas-empty__tpl-desc">{{ tpl.description }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Grid canvas -->
        <div v-else class="rb-grid">
          <div
            v-for="(comp, i) in components"
            :key="comp.id"
            class="rb-block"
            :class="{
              'rb-block--selected': selectedId === comp.id,
              [`rb-block--w${comp.width || 12}`]: true
            }"
            :style="{ order: i }"
            @click.stop="selectComponent(comp.id)"
          >
            <div class="rb-block__bar">
              <el-icon class="rb-block__drag" @mousedown.stop><Rank /></el-icon>
              <span class="rb-block__title">{{ comp.title }}</span>
              <el-tag size="small" effect="plain" type="info">{{ compTypeLabels[comp.type] || comp.type }}</el-tag>
              <div class="rb-block__spacer" />
              <el-button link size="small" :icon="Setting" @click.stop="openConfig(comp)" />
              <el-button link size="small" :icon="CopyDocument" @click.stop="duplicateComponent(i)" />
              <el-button link size="small" :icon="Delete" @click.stop="removeComponent(i)" />
            </div>
            <div class="rb-block__body">
              <ReportPreviewContent
                :component="comp"
                :dashboard="dashboard"
                :loading="dataLoading"
                :error="dataError"
                @retry="fetchData"
              />
            </div>
          </div>
        </div>

        <!-- Add component button (in-canvas) -->
        <div v-if="components.length" class="rb-canvas-add">
          <span class="rb-canvas-add__hint">Drop components here or use the button below</span>
          <el-dropdown @command="addTypedComponent">
            <el-button size="small" :icon="Plus" type="primary" plain>Add Component</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="item in paletteItems"
                  :key="item.type"
                  :command="item.type"
                >
                  <div class="rb-dropdown-item">
                    <el-icon><component :is="item.icon" /></el-icon>
                    <div class="rb-dropdown-item__info">
                      <span class="rb-dropdown-item__name">{{ item.label }}</span>
                      <span class="rb-dropdown-item__desc">{{ item.desc }}</span>
                    </div>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </main>
    </div>

    <!-- Config Drawer -->
    <el-drawer
      v-model="configVisible"
      title="Component Settings"
      direction="rtl"
      size="380px"
    >
      <template v-if="configComponent">
        <el-form label-position="top" size="small">
          <el-form-item label="Title">
            <el-input v-model="configComponent.title" />
          </el-form-item>
          <el-form-item label="Type">
            <el-select v-model="configComponent.type" style="width:100%">
              <el-option
                v-for="item in paletteItems"
                :key="item.type"
                :label="item.label"
                :value="item.type"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Data Source">
            <el-select v-model="configComponent.data_source.cname" style="width:100%" clearable>
              <el-option v-for="c in dataCollections" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Width">
            <el-slider v-model="configComponent.width" :min="3" :max="12" :step="3" show-stops :marks="widthMarks" />
          </el-form-item>
          <el-form-item v-if="configComponent.type === 'kpi_card'" label="KPI Metric">
            <el-select
              :model-value="configComponent!.data_source?.metrics?.[0]"
              @update:model-value="(v:any) => { const cc = configComponent!; if (cc.data_source?.metrics) cc.data_source.metrics[0] = v }"
              style="width:100%"
              value-key="field"
              filterable
              allow-create
            >
              <el-option-group v-for="group in kpiMetrics" :key="group.label" :label="group.label">
                <el-option
                  v-for="m in group.options"
                  :key="m.field"
                  :label="`${m.label} (${m.field})`"
                  :value="{ field: m.field, agg: 'count', alias: m.field }"
                />
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item v-if="isChartLike(configComponent)" label="Chart Data Field">
            <el-select v-model="chartDataField" style="width:100%" clearable>
              <el-option
                v-for="f in chartFields"
                :key="f.value"
                :label="f.label"
                :value="f.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="configComponent.type === 'text' && configComponent.config" label="Content">
            <el-input v-model="configComponent.config!.content" type="textarea" :rows="4" />
          </el-form-item>
        </el-form>
        <div class="rb-config-actions">
          <el-button type="danger" plain size="small" :icon="Delete" @click="deleteConfigComponent">
            Delete Component
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- Save Dialog -->
    <el-dialog v-model="saveVisible" title="Save Report" width="480px">
      <el-form :model="saveForm" label-position="top" size="small">
        <el-form-item label="Name">
          <el-input v-model="saveForm.name" placeholder="My Report" autofocus />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="saveForm.type" style="width:100%">
            <el-option v-for="rt in reportTypeOptions" :key="rt.value" :label="rt.label" :value="rt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="saveForm.description" type="textarea" :rows="2" placeholder="Optional description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveReport" :loading="saving">Save</el-button>
      </template>
    </el-dialog>

    <!-- Load Dialog -->
    <el-dialog v-model="loadVisible" title="Load Report" width="560px">
      <el-table :data="savedReports" size="small" highlight-current-row @row-click="loadReport" max-height="360">
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="type" label="Type" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ formatReportType(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" show-overflow-tooltip />
        <el-table-column label="Actions" width="80" align="center">
          <template #default="{ row }">
            <el-button link type="danger" size="small" :icon="Delete" @click.stop="deleteSavedReport(row)" />
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!savedReports.length" class="rb-empty-hint">No saved reports yet</div>
      <template #footer>
        <el-button @click="loadVisible = false">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="reportBuilder">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  Plus, Refresh, RefreshRight, Setting, Delete, DataAnalysis, DataBoard,
  Document, PieChart, TrendCharts, Tickets, FolderOpened,
  DocumentAdd, Printer, Rank, CopyDocument, Monitor,
  Clock, Warning, Timer, CircleCheck, Close
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ReportPreviewContent from "@/views/reports/ReportPreview.vue";
import { saveReport as saveReportApi, listReports, deleteReport as deleteReportApi } from "@/api/modules/reportService";
import { queryDocuments } from "@/api/modules/dataService";
import { useReportData } from "./composables/useReportData";
import type { ReportComponent, ReportComponentType, DashboardResponse } from "@/types/analytics";
import { confirm } from "@/hooks/useConfirmAction";

// ── Data fetching ────────────────────────────────────────────────────────────

const selectedProject = ref("");
const dateRange = ref<[string, string] | null>(null);
const { t } = useI18n();

const dateRangeRef = computed(() => {
  const d = dateRange.value;
  return d ? { start: d[0], end: d[1] } : { start: "", end: "" };
});

const {
  dashboard,
  loading: dataLoading,
  error: dataError,
  lastUpdated,
  fetch: fetchData,
  startPolling,
  stopPolling,
  setPollInterval
} = useReportData(dateRangeRef, selectedProject);

const polling = ref(false);
const pollInterval = ref(60);

function handlePollCommand(cmd: string) {
  if (cmd === "off") {
    polling.value = false;
    stopPolling();
    ElMessage.info("Auto-refresh off");
    return;
  }
  const sec = parseInt(cmd);
  pollInterval.value = sec;
  polling.value = true;
  startPolling(sec);
  ElMessage.success(`Auto-refresh every ${sec}s`);
}

function manualRefresh() {
  fetchData(true);
  ElMessage.success("Refreshing data...");
}

function onFilterChange() {
  fetchData();
}

const projects = ref<string[]>([]);
async function loadProjects() {
  try {
    const res = await queryDocuments({ cname: "projects", pageSize: 200 });
    if (res.code === 0 && res.data) {
      projects.value = ((res.data as any).list || []).map((p: any) => p.key || p.name || "").filter(Boolean);
    }
  } catch { /* ignore */ }
}
onMounted(loadProjects);

// ── Date shortcuts ───────────────────────────────────────────────────────────

const dateShortcuts = [
  { text: "Last 7 days", value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 7); return [s, e]; } },
  { text: "Last 30 days", value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 30); return [s, e]; } },
  { text: "Last 90 days", value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 90); return [s, e]; } },
  { text: "This Month", value: () => { const e = new Date(); const s = new Date(); s.setDate(1); return [s, e]; } },
];

function fmtTime(d: Date | null): string {
  if (!d) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return d.toLocaleTimeString();
}

// ── Components state ─────────────────────────────────────────────────────────

const components = ref<ReportComponent[]>([]);
const selectedId = ref("");

function selectComponent(id: string) {
  selectedId.value = selectedId.value === id ? "" : id;
}

// ── Palette ──────────────────────────────────────────────────────────────────

const compTypeLabels: Record<string, string> = {
    kpi_card: "KPI Card",
    line_chart: "Line Chart",
    bar_chart: "Bar Chart",
    pie_chart: "Pie Chart",
    gauge: "Gauge",
    table: "Data Table",
    text: "Text Block"
  };

  const paletteItems = [
  { type: "kpi_card" as ReportComponentType, label: "KPI Card", desc: "Key metric with trend indicator", icon: DataBoard },
  { type: "line_chart" as ReportComponentType, label: "Line Chart", desc: "Time-series trend analysis", icon: TrendCharts },
  { type: "bar_chart" as ReportComponentType, label: "Bar Chart", desc: "Category comparison & ranking", icon: DataAnalysis },
  { type: "pie_chart" as ReportComponentType, label: "Pie Chart", desc: "Proportional distribution", icon: PieChart },
  { type: "gauge" as ReportComponentType, label: "Gauge / Progress", desc: "Target completion indicator", icon: CircleCheck },
  { type: "table" as ReportComponentType, label: "Data Table", desc: "Detailed record listing", icon: Tickets },
  { type: "text" as ReportComponentType, label: "Text Block", desc: "Rich text annotation", icon: Document }
];

const dataCollections = [
    { value: "issues", label: "Issues / Tasks" },
    { value: "bugs", label: "Bugs / Defects" },
    { value: "sessions", label: "Chat Sessions" },
    { value: "projects", label: "Projects" },
    { value: "modules", label: "Modules" },
    { value: "knowledge_files", label: "Knowledge Base" },
    { value: "chat_records", label: "Chat History" },
    { value: "state_records", label: "State History" },
    { value: "audit_logs", label: "Audit Logs" }
  ];

// ── KPI metric options ───────────────────────────────────────────────────────

const kpiMetrics = [
  {
    label: "Project Overview",
    options: [
      { field: "total_issues", label: "Total Work Items" },
      { field: "total_done", label: "Completed" },
      { field: "total_open", label: "Open" },
      { field: "total_bugs", label: "Total Bugs" },
      { field: "completion_pct", label: "Completion Rate" },
      { field: "project_count", label: "Active Projects" }
    ]
  },
  {
    label: "Cycle Time (Lean)",
    options: [
      { field: "avg_cycle_time", label: "Avg Cycle Time (days)" },
      { field: "cycle_time_p50", label: "Cycle Time P50" },
      { field: "cycle_time_p80", label: "Cycle Time P80" },
      { field: "cycle_time_p95", label: "Cycle Time P95" },
      { field: "cycle_time_std", label: "Cycle Time Std Dev" },
      { field: "cycle_time_cv", label: "Cycle Time CV" }
    ]
  },
  {
    label: "Lead Time",
    options: [
      { field: "avg_lead_time", label: "Avg Lead Time (days)" },
      { field: "lead_time_p50", label: "Lead Time P50" },
      { field: "lead_time_p80", label: "Lead Time P80" },
      { field: "lead_time_p95", label: "Lead Time P95" },
        { field: "lead_time_std", label: "Lead Time Std Dev" },
        { field: "lead_time_cv", label: "Lead Time CV" }
    ]
  },
  {
    label: "Throughput, WIP & Flow",
    options: [
      { field: "throughput", label: "Total Throughput" },
      { field: "throughput_per_week", label: "Throughput / Week" },
      { field: "throughput_per_day", label: "Throughput / Day" },
      { field: "velocity_per_week", label: "Velocity / Week" },
      { field: "arrival_rate_per_week", label: "Arrival Rate / Week" },
        { field: "throughput_std", label: "Throughput Std Dev" },
        { field: "throughput_cv", label: "Throughput CV" },
      { field: "current_wip", label: "Current WIP" },
      { field: "flow_efficiency", label: "Flow Efficiency" },
      { field: "predictability", label: "Predictability Score" },
      { field: "wip_age_p50", label: "WIP Age P50" },
      { field: "wip_age_p85", label: "WIP Age P85" },
      { field: "wip_age_p95", label: "WIP Age P95" }
    ]
  },
  {
    label: "Quality & Reliability",
    options: [
      { field: "bug_rate", label: "Defect Rate" },
      { field: "quality_score", label: "Quality Score" },
      { field: "mttr_hours", label: "MTTR (hours)" },
      { field: "rework_rate", label: "Rework Rate" },
      { field: "sla_compliance", label: "SLA Compliance" },
      { field: "resolved_count", label: "Resolved Bugs" },
      { field: "critical_open", label: "Critical Open" },
      { field: "unassigned_open", label: "Unassigned Open" },
      { field: "stale_open", label: "Stale (>30d)" },
      { field: "resolution_velocity", label: "Resolution Velocity" },
        { field: "avg_resolution_hours", label: "Avg Resolution (hours)" }
    ]
  }
];

const chartFields = [
  { label: "Defect Arrival Trend", value: "bug_trend" },
  { label: "Rework Rate Trend", value: "rework_trend" },
  { label: "MTTR Trend (hours)", value: "mttr_trend" },
  { label: "Cycle Time Trend (P50/P80/P95)", value: "cycle_time_trend" },
  { label: "Lead Time Trend (P50/P80/P95)", value: "lead_time_trend" },
  { label: "Defect Inflow vs Outflow", value: "inflow_outflow" },
  { label: "Delivery Throughput", value: "throughput" },
  { label: "Defect Density by Module", value: "defect_density" },
  { label: "Module Quality Assessment", value: "module_quality" },
  { label: "Defect Severity Breakdown", value: "severity" },
  { label: "Issue Status Distribution", value: "status" },
  { label: "Defect Aging Analysis", value: "age" },
  { label: "WIP Distribution by Status", value: "wip" },
  { label: "Cumulative Flow Diagram (CFD)", value: "cfd" },
  { label: "Process Bottleneck Analysis", value: "bottlenecks" },
  { label: "Cycle Time Control Chart", value: "control_chart" }
];

const widthMarks = { 3: "¼", 6: "½", 9: "¾", 12: "Full" };

// ── Drag & Drop ──────────────────────────────────────────────────────────────

function onDragStart(e: DragEvent, item: (typeof paletteItems)[0]) {
  e.dataTransfer?.setData("componentType", item.type);
  e.dataTransfer!.effectAllowed = "copy";
}

function onDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData("componentType") as ReportComponentType;
  if (!type) return;
  const item = paletteItems.find(p => p.type === type);
  if (!item) return;

  const cname = ["kpi_card", "gauge"].includes(type) ? "issues" : type.includes("chart") ? "issues" : "bugs";
  const metrics = type === "kpi_card"
    ? [{ field: "total_issues", agg: "count" as const, alias: "total_issues" }]
    : undefined;

  components.value.push({
    id: `c${Date.now()}`,
    type,
    title: item.label,
    x: 0,
    y: components.value.length,
    width: type === "kpi_card" || type === "gauge" ? 3 : type === "text" ? 12 : 6,
    height: 1,
    data_source: { cname, ...(metrics ? { metrics } : {}) },
    config: type === "line_chart" ? { chartType: "line_chart" } : type === "bar_chart" ? { chartType: "bar_chart" } : type === "pie_chart" ? { chartType: "pie_chart" } : {}
  });
}

function addTypedComponent(type: ReportComponentType) {
  const item = paletteItems.find(p => p.type === type);
  if (!item) return;
  const cname = ["kpi_card", "gauge"].includes(type) ? "issues" : type.includes("chart") ? "issues" : "bugs";
  const metrics = type === "kpi_card"
    ? [{ field: "total_issues", agg: "count" as const, alias: "total_issues" }]
    : undefined;

  components.value.push({
    id: `c${Date.now()}`,
    type,
    title: item.label,
    x: 0,
    y: components.value.length,
    width: type === "kpi_card" || type === "gauge" ? 3 : type === "text" ? 12 : 6,
    height: 1,
    data_source: { cname, ...(metrics ? { metrics } : {}) },
    config: type === "line_chart" ? { chartType: "line_chart" } : type === "bar_chart" ? { chartType: "bar_chart" } : type === "pie_chart" ? { chartType: "pie_chart" } : {}
  });
}

function duplicateComponent(i: number) {
  const original = components.value[i];
  components.value.splice(i + 1, 0, {
    ...JSON.parse(JSON.stringify(original)),
    id: `c${Date.now()}`,
    title: `${original.title} (copy)`
  });
}

function removeComponent(i: number) {
  components.value.splice(i, 1);
  if (selectedId.value === components.value[i]?.id) selectedId.value = "";
}

// ── Config Drawer ────────────────────────────────────────────────────────────

const configVisible = ref(false);
const configComponent = ref<ReportComponent | null>(null);

const chartDataField = computed({
  get: () => {
    const c = configComponent.value;
    if (!c) return "";
    return c.data_source?.metrics?.[0]?.alias || c.config?.chartType || "";
  },
  set: (val: string) => {
    const c = configComponent.value;
    if (!c) return;
    if (c.data_source?.metrics?.length) {
      c.data_source.metrics[0].alias = val;
    }
    if (c.config) c.config.chartType = c.type;
  }
});

function isChartLike(comp: ReportComponent | null): boolean {
  if (!comp) return false;
  return ["line_chart", "bar_chart", "pie_chart"].includes(comp.type);
}

function openConfig(comp: ReportComponent) {
  const clone = JSON.parse(JSON.stringify(comp));
  clone.config = clone.config || {};
  configComponent.value = reactive(clone);
  configVisible.value = true;
}

watch(configVisible, (v) => {
  if (!v) {
    // Apply config changes back to components
    if (configComponent.value) {
      const idx = components.value.findIndex(c => c.id === configComponent.value!.id);
      if (idx >= 0) {
        components.value[idx] = { ...configComponent.value };
      }
    }
    configComponent.value = null;
  }
});

function deleteConfigComponent() {
  if (!configComponent.value) return;
  const idx = components.value.findIndex(c => c.id === configComponent.value!.id);
  if (idx >= 0) components.value.splice(idx, 1);
  configVisible.value = false;
}

// ── Templates ────────────────────────────────────────────────────────────────

const templates = [
    {
      label: "Weekly Report",
      type: "weekly",
      category: "Delivery & Flow",
      description: "Project status overview with completion KPIs, delivery throughput, and recent activity",
      icon: Clock,
      components: [
        { id: "w1", type: "kpi_card" as const, title: "Completion Rate", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "completion_pct", agg: "count" as const, alias: "completion_pct" }] }, config: {} },
        { id: "w2", type: "kpi_card" as const, title: "Total Work Items", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "total_issues", agg: "count" as const, alias: "total_issues" }] }, config: {} },
        { id: "w3", type: "kpi_card" as const, title: "Open Work Items", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "total_open", agg: "count" as const, alias: "total_open" }] }, config: {} },
        { id: "w4", type: "kpi_card" as const, title: "Overdue Items", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "overdue", agg: "count" as const, alias: "overdue" }] }, config: {} },
        { id: "w5", type: "bar_chart" as const, title: "Delivery Throughput", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "throughput", agg: "count" as const, alias: "throughput" }] }, config: { chartType: "bar_chart" } },
        { id: "w6", type: "pie_chart" as const, title: "Issue Status", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "status", agg: "count" as const, alias: "status" }] }, config: { chartType: "pie_chart" } },
        { id: "w7", type: "table" as const, title: "Recent Activity", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "issues" }, config: { limit: 10, orderBy: "created_at", orderType: "desc" } }
      ]
    },
    {
      label: "Quality Report",
      type: "quality",
      category: "Quality & Risk",
      description: "Defect analytics with bug rate, MTTR, severity distribution, and quality score breakdown",
      icon: Warning,
      components: [
        { id: "q1", type: "kpi_card" as const, title: "Defect Rate", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "bug_rate", agg: "count" as const, alias: "bug_rate" }] }, config: {} },
        { id: "q2", type: "kpi_card" as const, title: "Quality Score", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "quality_score", agg: "count" as const, alias: "quality_score" }] }, config: {} },
        { id: "q3", type: "kpi_card" as const, title: "MTTR (hours)", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "mttr_hours", agg: "count" as const, alias: "mttr_hours" }] }, config: {} },
        { id: "q4", type: "kpi_card" as const, title: "SLA Compliance", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "sla_compliance", agg: "count" as const, alias: "sla_compliance" }] }, config: {} },
        { id: "q5", type: "line_chart" as const, title: "Defect Arrival Trend", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "bug_trend", agg: "count" as const, alias: "bug_trend" }] }, config: { chartType: "line_chart" } },
        { id: "q6", type: "pie_chart" as const, title: "Severity Distribution", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "severity", agg: "count" as const, alias: "severity" }] }, config: { chartType: "pie_chart" } },
        { id: "q7", type: "bar_chart" as const, title: "Defect Density by Module", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "bugs", metrics: [{ field: "defect_density", agg: "count" as const, alias: "defect_density" }] }, config: { chartType: "bar_chart" } }
      ]
    },
    {
      label: "Sprint Review",
      type: "sprint_review",
      category: "Delivery & Flow",
      description: "Sprint performance with velocity, cycle time trends, throughput, and WIP analysis",
      icon: Timer,
      components: [
        { id: "s1", type: "kpi_card" as const, title: "Completed", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "total_done", agg: "count" as const, alias: "total_done" }] }, config: {} },
        { id: "s2", type: "kpi_card" as const, title: "Cycle Time (avg)", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "avg_cycle_time", agg: "count" as const, alias: "avg_cycle_time" }] }, config: {} },
        { id: "s3", type: "kpi_card" as const, title: "Throughput", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "throughput", agg: "count" as const, alias: "throughput" }] }, config: {} },
        { id: "s4", type: "kpi_card" as const, title: "Current WIP", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "current_wip", agg: "count" as const, alias: "current_wip" }] }, config: {} },
        { id: "s5", type: "line_chart" as const, title: "Cycle Time Trend (p50/p80/p95)", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "cycle_time_trend", agg: "count" as const, alias: "cycle_time_trend" }] }, config: { chartType: "line_chart" } },
        { id: "s6", type: "bar_chart" as const, title: "Throughput by Week", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "throughput", agg: "count" as const, alias: "throughput" }] }, config: { chartType: "bar_chart" } },
        { id: "s7", type: "pie_chart" as const, title: "WIP Breakdown", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "issues", metrics: [{ field: "wip", agg: "count" as const, alias: "wip" }] }, config: { chartType: "pie_chart" } }
      ]
    },
    {
      label: "File Health Audit",
      type: "risk",
      category: "Quality & Risk",
      description: "Knowledge base health: stale files, missing metadata, orphan entries, and unmaintained content",
      icon: Warning,
      components: [
        { id: "fh1", type: "text" as const, title: "Alert Summary", x: 0, y: 0, width: 12, height: 1, data_source: { cname: "knowledge_files" }, config: { content: "File Health Audit Report\n\nThis report identifies knowledge base files with health issues across all projects:\n\n\u2022 Stale files \u2014 content beyond review cycle expiration\n\u2022 Missing metadata \u2014 required frontmatter fields absent\n\u2022 Orphan files \u2014 DB entries without corresponding disk files\n\u2022 Unmaintained files \u2014 no review cycle set, untouched > 90 days\n\nReview the tables below for actionable items." } },
        { id: "fh2", type: "table" as const, title: "Recently Updated Files", x: 0, y: 1, width: 12, height: 1, data_source: { cname: "knowledge_files" }, config: { limit: 15, orderBy: "updatedAt", orderType: "desc", columns: ["path", "title", "category", "status", "lifecycle", "review_cycle", "updatedAt"] } },
        { id: "fh3", type: "kpi_card" as const, title: "Quality Score", x: 0, y: 2, width: 4, height: 1, data_source: { cname: "bugs", metrics: [{ field: "quality_score", agg: "count" as const, alias: "quality_score" }] }, config: {} },
        { id: "fh4", type: "kpi_card" as const, title: "SLA Compliance", x: 4, y: 2, width: 4, height: 1, data_source: { cname: "bugs", metrics: [{ field: "sla_compliance", agg: "count" as const, alias: "sla_compliance" }] }, config: {} },
        { id: "fh5", type: "kpi_card" as const, title: "Open Bugs", x: 8, y: 2, width: 4, height: 1, data_source: { cname: "bugs", metrics: [{ field: "bug_rate", agg: "count" as const, alias: "bug_rate" }] }, config: {} }
      ]
    },
    {
      label: "Module Health",
      type: "module_health",
      category: "Leadership & Governance",
      description: "Per-module status tracking with progress, quality signals, blocked items, and team load",
      icon: Monitor,
      components: [
        { id: "mh1", type: "kpi_card" as const, title: "Active Modules", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "modules", metrics: [{ field: "active", agg: "count" as const, alias: "active" }] }, config: {} },
        { id: "mh2", type: "kpi_card" as const, title: "Overdue Items", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "overdue", agg: "count" as const, alias: "overdue" }] }, config: {} },
        { id: "mh3", type: "kpi_card" as const, title: "Blocked", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "blocked_count", agg: "count" as const, alias: "blocked_count" }] }, config: {} },
        { id: "mh4", type: "kpi_card" as const, title: "Completion %", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "completion_pct", agg: "count" as const, alias: "completion_pct" }] }, config: {} },
        { id: "mh5", type: "bar_chart" as const, title: "Module Quality Assessment", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "module_quality", agg: "count" as const, alias: "module_quality" }] }, config: { chartType: "bar_chart" } },
        { id: "mh6", type: "bar_chart" as const, title: "Defect Density by Module", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "defect_density", agg: "count" as const, alias: "defect_density" }] }, config: { chartType: "bar_chart" } },
        { id: "mh7", type: "table" as const, title: "Module List", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "modules" }, config: { limit: 20, orderBy: "updated_at", orderType: "desc" } }
      ]
    },
    {
      label: "Executive Summary",
      type: "executive_summary",
      category: "Leadership & Governance",
      description: "High-level leadership dashboard: project completion, quality health, WIP status, and active risks",
      icon: DataBoard,
      components: [
        { id: "es1", type: "kpi_card" as const, title: "Completion Rate", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "completion_pct", agg: "count" as const, alias: "completion_pct" }] }, config: {} },
        { id: "es2", type: "kpi_card" as const, title: "Quality Score", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "quality_score", agg: "count" as const, alias: "quality_score" }] }, config: {} },
        { id: "es3", type: "kpi_card" as const, title: "Active WIP", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "current_wip", agg: "count" as const, alias: "current_wip" }] }, config: {} },
        { id: "es4", type: "kpi_card" as const, title: "Open Defects", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "bug_count", agg: "count" as const, alias: "bug_count" }] }, config: {} },
        { id: "es5", type: "pie_chart" as const, title: "Issue Status Distribution", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "status", agg: "count" as const, alias: "status" }] }, config: { chartType: "pie_chart" } },
        { id: "es6", type: "bar_chart" as const, title: "Delivery Throughput", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "throughput", agg: "count" as const, alias: "throughput" }] }, config: { chartType: "bar_chart" } },
        { id: "es7", type: "text" as const, title: "Executive Summary Notes", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "issues" }, config: { content: "## Key Takeaways\n\n- Review completion rate trends and address any downward movement\n- WIP levels above target indicate potential flow bottlenecks\n- Quality score below 80% requires root cause analysis\n- Cross-reference open defects with SLA compliance for risk assessment" } }
      ]
    },
    {
      label: "DORA / DevOps Metrics",
      type: "dora_devops",
      category: "Quality & Risk",
      description: "DevOps performance: lead time, MTTR, delivery throughput, and change failure indicators",
      icon: TrendCharts,
      components: [
        { id: "d1", type: "kpi_card" as const, title: "Lead Time P50", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "lead_time_p50", agg: "count" as const, alias: "lead_time_p50" }] }, config: {} },
        { id: "d2", type: "kpi_card" as const, title: "MTTR (hours)", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "mttr_hours", agg: "count" as const, alias: "mttr_hours" }] }, config: {} },
        { id: "d3", type: "kpi_card" as const, title: "Throughput / Week", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "throughput_per_week", agg: "count" as const, alias: "throughput_per_week" }] }, config: {} },
        { id: "d4", type: "kpi_card" as const, title: "Change Failure Rate Proxy", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "bug_rate", agg: "count" as const, alias: "bug_rate" }] }, config: {} },
        { id: "d5", type: "line_chart" as const, title: "Lead Time Trend (P50/P80/P95)", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "lead_time_trend", agg: "count" as const, alias: "lead_time_trend" }] }, config: { chartType: "line_chart" } },
        { id: "d6", type: "line_chart" as const, title: "MTTR Trend", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "mttr_trend", agg: "count" as const, alias: "mttr_trend" }] }, config: { chartType: "line_chart" } },
        { id: "d7", type: "line_chart" as const, title: "Cycle Time Control Chart", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "issues", metrics: [{ field: "control_chart", agg: "count" as const, alias: "control_chart" }] }, config: { chartType: "line_chart" } }
      ]
    },
    {
      label: "Flow Metrics",
      type: "flow_metrics",
      category: "Delivery & Flow",
      description: "Lean flow analysis: CFD, cycle time trends, bottlenecks, and flow efficiency indicators",
      icon: DataAnalysis,
      components: [
        { id: "fl1", type: "kpi_card" as const, title: "Flow Efficiency", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "flow_efficiency", agg: "count" as const, alias: "flow_efficiency" }] }, config: {} },
        { id: "fl2", type: "kpi_card" as const, title: "Cycle Time P50", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "cycle_time_p50", agg: "count" as const, alias: "cycle_time_p50" }] }, config: {} },
        { id: "fl3", type: "kpi_card" as const, title: "WIP Age P85", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "wip_age_p85", agg: "count" as const, alias: "wip_age_p85" }] }, config: {} },
        { id: "fl4", type: "kpi_card" as const, title: "Predictability", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "predictability", agg: "count" as const, alias: "predictability" }] }, config: {} },
        { id: "fl5", type: "line_chart" as const, title: "Cumulative Flow Diagram (CFD)", x: 0, y: 1, width: 12, height: 1, data_source: { cname: "issues", metrics: [{ field: "cfd", agg: "count" as const, alias: "cfd" }] }, config: { chartType: "line_chart" } },
        { id: "fl6", type: "line_chart" as const, title: "Cycle Time Trend (P50/P80/P95)", x: 0, y: 2, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "cycle_time_trend", agg: "count" as const, alias: "cycle_time_trend" }] }, config: { chartType: "line_chart" } },
        { id: "fl7", type: "bar_chart" as const, title: "Process Bottleneck Analysis", x: 6, y: 2, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "bottlenecks", agg: "count" as const, alias: "bottlenecks" }] }, config: { chartType: "bar_chart" } }
      ]
    },
    {
      label: "Risk & Compliance",
      type: "risk_compliance",
      category: "Quality & Risk",
      description: "Risk register with SLA tracking, aging defects, critical open items, and unassigned work",
      icon: Warning,
      components: [
        { id: "rc1", type: "kpi_card" as const, title: "SLA Compliance", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "sla_compliance", agg: "count" as const, alias: "sla_compliance" }] }, config: {} },
        { id: "rc2", type: "kpi_card" as const, title: "Critical Open", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "critical_open", agg: "count" as const, alias: "critical_open" }] }, config: {} },
        { id: "rc3", type: "kpi_card" as const, title: "Stale (>30d)", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "stale_open", agg: "count" as const, alias: "stale_open" }] }, config: {} },
        { id: "rc4", type: "kpi_card" as const, title: "Unassigned", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "unassigned_open", agg: "count" as const, alias: "unassigned_open" }] }, config: {} },
        { id: "rc5", type: "pie_chart" as const, title: "Defect Aging Analysis", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "age", agg: "count" as const, alias: "age" }] }, config: { chartType: "pie_chart" } },
        { id: "rc6", type: "pie_chart" as const, title: "Defect Severity Breakdown", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "severity", agg: "count" as const, alias: "severity" }] }, config: { chartType: "pie_chart" } },
        { id: "rc7", type: "bar_chart" as const, title: "Defect Density by Module", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "bugs", metrics: [{ field: "defect_density", agg: "count" as const, alias: "defect_density" }] }, config: { chartType: "bar_chart" } }
      ]
    },
    {
      label: "Team Performance",
      type: "team_performance",
      category: "Delivery & Flow",
      description: "Delivery velocity, throughput trends, completion rate, and quality signals per team/module",
      icon: Tickets,
      components: [
        { id: "tp1", type: "kpi_card" as const, title: "Total Throughput", x: 0, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "throughput", agg: "count" as const, alias: "throughput" }] }, config: {} },
        { id: "tp2", type: "kpi_card" as const, title: "Completed", x: 3, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "total_done", agg: "count" as const, alias: "total_done" }] }, config: {} },
        { id: "tp3", type: "kpi_card" as const, title: "Completion Rate", x: 6, y: 0, width: 3, height: 1, data_source: { cname: "issues", metrics: [{ field: "completion_pct", agg: "count" as const, alias: "completion_pct" }] }, config: {} },
        { id: "tp4", type: "kpi_card" as const, title: "Quality Score", x: 9, y: 0, width: 3, height: 1, data_source: { cname: "bugs", metrics: [{ field: "quality_score", agg: "count" as const, alias: "quality_score" }] }, config: {} },
        { id: "tp5", type: "bar_chart" as const, title: "Delivery Throughput", x: 0, y: 1, width: 6, height: 1, data_source: { cname: "issues", metrics: [{ field: "throughput", agg: "count" as const, alias: "throughput" }] }, config: { chartType: "bar_chart" } },
        { id: "tp6", type: "bar_chart" as const, title: "Module Quality Assessment", x: 6, y: 1, width: 6, height: 1, data_source: { cname: "bugs", metrics: [{ field: "module_quality", agg: "count" as const, alias: "module_quality" }] }, config: { chartType: "bar_chart" } },
        { id: "tp7", type: "line_chart" as const, title: "Cycle Time Control Chart", x: 0, y: 2, width: 12, height: 1, data_source: { cname: "issues", metrics: [{ field: "control_chart", agg: "count" as const, alias: "control_chart" }] }, config: { chartType: "line_chart" } }
      ]
    }
  ];

  // Group templates by category for sidebar display
  const templateGroups = computed(() => {
    const order = ["Delivery & Flow", "Quality & Risk", "Leadership & Governance"];
    const grouped: Record<string, typeof templates> = {};
    for (const t of templates) {
      const cat = (t as any).category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    }
    return order.filter(k => grouped[k]).map(k => ({ key: k, label: k, items: grouped[k] }));
  });

  const reportTypeOptions = [
    { value: "weekly", label: "Weekly Report" },
    { value: "quality", label: "Quality Report" },
    { value: "sprint_review", label: "Sprint Review" },
    { value: "risk", label: "Risk / File Health" },
    { value: "module_health", label: "Module Health" },
    { value: "executive_summary", label: "Executive Summary" },
    { value: "dora_devops", label: "DORA / DevOps Metrics" },
    { value: "flow_metrics", label: "Flow Metrics" },
    { value: "risk_compliance", label: "Risk & Compliance" },
    { value: "team_performance", label: "Team Performance" },
    { value: "custom", label: "Custom" }
  ];


function applyTemplate(tpl: (typeof templates)[0]) {
  components.value = tpl.components.map(c => ({ ...c, id: `${c.id}_${Date.now()}` }));
  ElMessage.success(`Applied template: ${tpl.label}`);
}

// ── Save / Load ──────────────────────────────────────────────────────────────

const saveVisible = ref(false);
const loadVisible = ref(false);
const saving = ref(false);
const savedReports = ref<any[]>([]);

const saveForm = ref({ name: "", type: "custom" as string, description: "" });

function openSaveDialog() {
  saveForm.value = { name: "", type: "custom", description: "" };
  saveVisible.value = true;
}

async function saveReport() {
  saving.value = true;
  try {
    const res = await saveReportApi({
      name: saveForm.value.name || `Report ${new Date().toLocaleDateString()}`,
      type: saveForm.value.type as any,
      description: saveForm.value.description,
      layout: components.value
    });
    if (res.code === 0) {
      ElMessage.success(`Saved: ${res.data.report_id}`);
      saveVisible.value = false;
      loadSavedReports();
    } else {
      ElMessage.error(res.message || "Save failed");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Save failed");
  } finally {
    saving.value = false;
  }
}

async function loadSavedReports() {
  try {
    const res = await listReports({ limit: 50 });
    if (res.code === 0) savedReports.value = res.data?.reports || [];
  } catch { /* ignore */ }
}

function openLoadDialog() {
  loadSavedReports();
  loadVisible.value = true;
}

function loadReport(report: any) {
  const layout = report.components || report.layout || [];
  if (layout.length) {
    components.value = layout.map((c: any) => ({ ...c, id: `${c.id || "c"}_${Date.now()}` }));
    ElMessage.success(`Loaded: ${report.name}`);
    loadVisible.value = false;
  } else {
    ElMessage.warning("Report has no components");
  }
}

async function deleteSavedReport(report: any) {
  const ok = await confirm(
    t("reports.actions.deleteConfirm", { name: report.name }),
    t("reports.actions.delete")
  );
  if (!ok) return;
  const res = await deleteReportApi(report.report_id);
  if (res.code === 0) {
    ElMessage.success(t("reports.messages.deleted"));
    loadSavedReports();
  }
}

  const typeLabelMap: Record<string, string> = {
    weekly: "Weekly Report",
    quality: "Quality Report",
    sprint_review: "Sprint Review",
    risk: "File Health",
    module_health: "Module Health",
    executive_summary: "Executive Summary",
    dora_devops: "DORA / DevOps",
    flow_metrics: "Flow Metrics",
    risk_compliance: "Risk & Compliance",
    team_performance: "Team Performance",
    custom: "Custom"
  };
  function formatReportType(type: string): string {
    return typeLabelMap[type] || type;
  }


async function clearCanvas() {
  if (!components.value.length) return;
  const ok = await confirm("Clear all components from the canvas?", "Clear Canvas");
  if (ok) { components.value = []; selectedId.value = ""; }
}

// ── Export ───────────────────────────────────────────────────────────────────

function exportReport() {
  if (!components.value.length) {
    ElMessage.warning("Add components first");
    return;
  }
  // Open print-friendly view
  const json = JSON.stringify({ components: components.value, generated: new Date().toISOString() }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("Report exported as JSON");
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  loadSavedReports();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped lang="scss">
.rb {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  padding: 16px 20px 20px;
}

// ── Header ───────────────────────────────────────────────────────────────────

.rb-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  &__left {
    flex-shrink: 0;
  }
  &__title {
    margin: 0 0 2px;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  &__desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  &__filters {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__count {
    display: inline-flex;
    align-items: center;
    margin-left: 10px;
    padding: 1px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 999px;
    vertical-align: middle;
  }
  &__updated {
    font-size: 11px;
    color: var(--el-text-color-disabled);
    white-space: nowrap;
  }
  &__actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
}

// ── Body layout ──────────────────────────────────────────────────────────────

.rb-body {
  display: flex;
  flex: 1;
  gap: 16px;
  overflow: hidden;
  min-height: 0;
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

.rb-sidebar {
  flex-shrink: 0;
  width: 240px;
  overflow-y: auto;
  padding-right: 4px;
}

.rb-side-section {
  margin-bottom: 20px;
}

.rb-side-title {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
}

.rb-palette {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rb-palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: grab;
  border-radius: 6px;
  transition: background 0.15s;
  &:hover {
    background: var(--el-fill-color-light);
  }
  &:active {
    cursor: grabbing;
    background: var(--el-fill-color);
  }
  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  &__name {
    font-size: 13px;
    font-weight: 500;
  }
  &__desc {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.rb-templates {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rb-tpl-group {
  padding: 8px 10px 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--el-text-color-disabled);
  &:first-child { padding-top: 0; }
}
.rb-tpl-item {
  padding: 7px 10px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  transition: background 0.15s;
  &:hover { background: var(--el-fill-color-light); }
  &__inner {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__desc {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }
  &__date {
    font-size: 11px;
    color: var(--el-text-color-disabled);
  }
}

// ── Canvas ───────────────────────────────────────────────────────────────────

.rb-canvas {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border: 2px dashed var(--el-border-color);
  border-radius: 10px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  &--empty {
    align-items: center;
    justify-content: center;
  }
}

.rb-canvas-empty {
  text-align: center;
  color: var(--el-text-color-secondary);
  h3 {
    margin: 16px 0 8px;
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
  p {
    margin: 0 0 20px;
    font-size: 13px;
  }
  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 340px;
    width: 100%;
  }
  &__tpl {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    text-align: left;
    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
  }
  &__tpl-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  &__group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--el-text-color-disabled);
    margin-top: 4px;
    &:first-child { margin-top: 0; }
  }
  &__tpl-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  &__tpl-desc {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.rb-canvas-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--el-border-color-lighter);
  &__hint {
    font-size: 11px;
    color: var(--el-text-color-disabled);
  }
}

// ── Grid ─────────────────────────────────────────────────────────────────────

.rb-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
  align-items: start;
}

.rb-block {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:hover {
    border-color: var(--el-border-color);
  }
  &--selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
  }
  &--w3 { grid-column: span 3; }
  &--w4 { grid-column: span 4; }
  &--w6 { grid-column: span 6; }
  &--w8 { grid-column: span 8; }
  &--w9 { grid-column: span 9; }
  &--w12 { grid-column: span 12; }

  &__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  &__drag {
    cursor: grab;
    color: var(--el-text-color-disabled);
    &:active { cursor: grabbing; }
  }
  &__title {
    font-size: 12px;
    font-weight: 500;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__spacer { flex: 1; }
  &__body {
    padding: 12px;
  }
}

// ── Config drawer ────────────────────────────────────────────────────────────

.rb-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
  &__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  &__name { font-size: 13px; font-weight: 500; }
  &__desc { font-size: 11px; color: var(--el-text-color-secondary); }
}
.rb-config-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.rb-empty-hint {
  text-align: center; padding: 24px;
  font-size: 13px; color: var(--el-text-color-secondary);
}
</style>