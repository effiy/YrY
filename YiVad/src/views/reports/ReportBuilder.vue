<template>
  <div class="report-builder">
    <header class="page-header">
      <div><h1>Report Builder</h1><p class="text-muted">Drag components to build custom reports. Choose a template or start from scratch.</p></div>
      <div class="page-header__actions">
        <el-button :icon="Refresh" size="small" @click="loadReports">Load Saved</el-button>
        <el-button type="primary" :icon="Plus" size="small" @click="addComponent">Add Component</el-button>
        <el-button :icon="Download" size="small" @click="generateReport">Generate</el-button>
      </div>
    </header>

    <div class="report-builder__body">
      <!-- Component Palette -->
      <aside class="report-builder__sidebar">
        <el-card shadow="never">
          <template #header><span>Components</span></template>
          <div class="palette">
            <div
              v-for="comp in paletteItems"
              :key="comp.type"
              class="palette__item"
              draggable="true"
              @dragstart="onDragStart($event, comp.type)"
            >
              <el-icon><component :is="comp.icon" /></el-icon>
              <span>{{ comp.label }}</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="mt16">
          <template #header><span>Templates</span></template>
          <div class="template-list">
            <div v-for="tpl in templates" :key="tpl.type" class="template-list__item" @click="applyTemplate(tpl)">
              <span>{{ tpl.label }}</span>
              <el-tag size="small">{{ tpl.components.length }} parts</el-tag>
            </div>
          </div>
        </el-card>
      </aside>

      <!-- Report Canvas -->
      <main
        class="report-builder__canvas"
        @drop.prevent="onDrop"
        @dragover.prevent
      >
        <div v-if="!components.length" class="canvas-empty">
          <p>Drag components from the palette or apply a template to start building.</p>
        </div>

        <div
          v-for="(comp, i) in components"
          :key="comp.id"
          class="canvas-block"
          :class="{ 'canvas-block--selected': selectedId === comp.id }"
          @click="selectedId = comp.id"
        >
          <div class="canvas-block__toolbar">
            <span class="canvas-block__title">{{ comp.title || comp.type }}</span>
            <div>
              <el-button link size="small" :icon="Setting" @click.stop="configureComponent(i)" />
              <el-button link size="small" :icon="Delete" @click.stop="removeComponent(i)" />
            </div>
          </div>
          <div class="canvas-block__preview">
            <!-- Rudimentary preview based on type -->
            <div v-if="comp.type === 'kpi_card'" class="preview-kpi">
              <span class="preview-kpi__val">--</span>
              <span class="preview-kpi__lbl">KPI: {{ comp.title }}</span>
            </div>
            <div v-else-if="comp.type === 'text'" class="preview-text">
              {{ comp.config?.content || "Text block" }}
            </div>
            <div v-else class="preview-chart">
              <el-icon :size="32"><DataAnalysis /></el-icon>
              <span>{{ comp.type.replace("_", " ") }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Report Preview Dialog -->
    <el-dialog v-model="previewVisible" title="Report Preview" width="900px">
      <ReportPreviewContent :components="components" :date-range="dateRange" />
    </el-dialog>

    <!-- Save Dialog -->
    <el-dialog v-model="saveVisible" title="Save Report" width="500px">
      <el-form :model="saveForm">
        <el-form-item label="Name"><el-input v-model="saveForm.name" placeholder="My Report" /></el-form-item>
        <el-form-item label="Type">
          <el-select v-model="saveForm.type">
            <el-option v-for="o in templateTypes" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Description"><el-input v-model="saveForm.description" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveReport">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Plus, Download, Refresh, Setting, Delete, DataAnalysis, DataBoard, Document, PieChart, TrendCharts, Tickets } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ReportPreviewContent from "@/views/reports/ReportPreview.vue";
import { saveReport as saveReportApi, listReports } from "@/api/modules/reportService";
import type { ReportComponent, ReportComponentType, DateRange } from "@/types/analytics";

const components = ref<ReportComponent[]>([]);
const selectedId = ref("");
const previewVisible = ref(false);
const saveVisible = ref(false);
const dateRange = ref<DateRange>({ start: "", end: "" });

const saveForm = ref({ name: "", type: "custom", description: "" });

const paletteItems: { type: ReportComponentType; label: string; icon: any }[] = [
  { type: "kpi_card", label: "KPI Card", icon: DataBoard },
  { type: "line_chart", label: "Line Chart", icon: TrendCharts },
  { type: "bar_chart", label: "Bar Chart", icon: DataAnalysis },
  { type: "pie_chart", label: "Pie Chart", icon: PieChart },
  { type: "table", label: "Table", icon: Tickets },
  { type: "text", label: "Text", icon: Document },
];

const templateTypes = [
  { label: "Weekly Report", value: "weekly" },
  { label: "Monthly Report", value: "monthly" },
  { label: "Sprint Review", value: "sprint_review" },
  { label: "Quality Report", value: "quality" },
  { label: "Risk Report", value: "risk" },
  { label: "Custom", value: "custom" },
];

const templates = [
  { label: "Weekly Report", type: "weekly", components: [
    { id: "w1", type: "kpi_card" as const, title: "Completed This Week", x: 0, y: 0, width: 4, height: 1, data_source: { cname: "issues" } },
    { id: "w2", type: "bar_chart" as const, title: "Throughput", x: 4, y: 0, width: 8, height: 1, data_source: { cname: "issues" } },
    { id: "w3", type: "pie_chart" as const, title: "Issue Status", x: 0, y: 1, width: 4, height: 1, data_source: { cname: "issues" } },
    { id: "w4", type: "table" as const, title: "Recent Issues", x: 4, y: 1, width: 8, height: 1, data_source: { cname: "issues" } },
  ]},
  { label: "Quality Report", type: "quality", components: [
    { id: "q1", type: "kpi_card" as const, title: "Bug Rate", x: 0, y: 0, width: 4, height: 1, data_source: { cname: "bugs" } },
    { id: "q2", type: "line_chart" as const, title: "Bug Trend", x: 4, y: 0, width: 8, height: 1, data_source: { cname: "bugs" } },
    { id: "q3", type: "bar_chart" as const, title: "Defect Density", x: 0, y: 1, width: 12, height: 1, data_source: { cname: "bugs" } },
  ]},
];

const templateTypes2 = templateTypes; // alias for template

function onDragStart(e: DragEvent, type: ReportComponentType) {
  e.dataTransfer?.setData("componentType", type);
}

function onDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData("componentType") as ReportComponentType;
  if (type) {
    components.value.push({
      id: `c${Date.now()}`,
      type,
      title: type.replace("_", " "),
      x: 0, y: components.value.length,
      width: 6, height: 1,
      data_source: { cname: "issues" },
    });
  }
}

function addComponent() {
  components.value.push({
    id: `c${Date.now()}`,
    type: "kpi_card",
    title: "New KPI",
    x: 0, y: components.value.length,
    width: 4, height: 1,
    data_source: { cname: "issues" },
  });
}

function removeComponent(i: number) { components.value.splice(i, 1); }
function configureComponent(i: number) { /* opens chart configurator */ }

function applyTemplate(tpl: typeof templates[0]) {
  components.value = tpl.components.map(c => ({ ...c, id: `${c.id}_${Date.now()}` }));
}

function generateReport() { previewVisible.value = true; }

async function saveReport() {
  const res = await saveReportApi({
    name: saveForm.value.name || "Untitled",
    type: saveForm.value.type as any,
    description: saveForm.value.description,
    layout: components.value,
  });
  if (res.code === 0) {
    ElMessage.success(`Report saved: ${res.data.report_id}`);
    saveVisible.value = false;
  }
}

function loadReports() { /* navigate or open dialog */ }
</script>

<style scoped lang="scss">
.report-builder {
  padding: 20px; height: calc(100vh - 100px); display: flex; flex-direction: column;
  &__body { display: flex; gap: 16px; flex: 1; overflow: hidden; }
  &__sidebar { width: 240px; flex-shrink: 0; overflow-y: auto; }
  &__canvas { flex: 1; border: 2px dashed var(--el-border-color); border-radius: 8px; padding: 16px; overflow-y: auto; background: var(--el-fill-color-lighter); }
}
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
  h1 { margin: 0 0 4px; font-size: 22px; }
  &__actions { display: flex; gap: 8px; flex-shrink: 0; }
}
.text-muted { color: var(--el-text-color-secondary); font-size: 13px; }
.mt16 { margin-top: 16px; }

.palette { display: flex; flex-direction: column; gap: 4px;
  &__item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: grab; border-radius: 4px; font-size: 13px;
    &:hover { background: var(--el-fill-color-light); }
  }
}

.template-list { display: flex; flex-direction: column; gap: 4px;
  &__item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; cursor: pointer; border-radius: 4px;
    &:hover { background: var(--el-fill-color-light); }
  }
}

.canvas-block {
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; margin-bottom: 12px; overflow: hidden;
  &--selected { border-color: var(--el-color-primary); box-shadow: 0 0 0 1px var(--el-color-primary); }
  &__toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--el-fill-color-lighter); border-bottom: 1px solid var(--el-border-color-lighter); }
  &__title { font-size: 13px; font-weight: 500; }
  &__preview { padding: 16px; min-height: 80px; display: flex; align-items: center; justify-content: center; }
}

.canvas-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--el-text-color-secondary); font-size: 14px; }

.preview-kpi { text-align: center; &__val { font-size: 24px; font-weight: 600; } &__lbl { display: block; font-size: 12px; color: var(--el-text-color-secondary); } }
.preview-text { color: var(--el-text-color-secondary); }
.preview-chart { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--el-text-color-secondary); font-size: 12px; }
</style>