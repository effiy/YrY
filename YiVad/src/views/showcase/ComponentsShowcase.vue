<template>
  <div class="showcase-page">
    <el-page-header @back="$router.back()" title="Showcase" content="Components" />

    <el-alert
      type="info" :closable="false" show-icon class="sc-alert"
      title="55+ reusable components in src/components/. Below are the most commonly used ones."
    />

    <!-- ProTable -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="primary">ProTable</el-tag> Data table with search, sort, pagination, and export</h3></template>
      <p class="sc-desc">The standard table component. All data views use ProTable. Supports search forms, column config, tree mode, and batch operations.</p>
      <ProTable
        :columns="tableColumns"
        :data="tableData"
        :pagination="true"
        row-key="id"
        border
      />
    </el-card>

    <!-- SelectIcon -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="success">SelectIcon</el-tag> Icon picker</h3></template>
      <p class="sc-desc">Browse and select from all Element Plus icons. Used in menu management and form builders.</p>
      <div class="sc-demo">
        <span>Selected: </span>
        <el-icon :size="20"><component :is="selectedIcon" /></el-icon>
        <code>{{ selectedIcon }}</code>
      </div>
    </el-card>

    <!-- SwitchDark -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="warning">SwitchDark</el-tag> Dark mode toggle</h3></template>
      <p class="sc-desc">One-click dark/light theme switch with persistent preference.</p>
      <div class="sc-demo">
        <SwitchDark />
      </div>
    </el-card>

    <!-- SvgIcon -->
    <el-card class="sc-section">
      <template #header><h3><el-tag>SvgIcon</el-tag> SVG sprite icon renderer</h3></template>
      <p class="sc-desc">Render icons from the SVG sprite generated at build time. Supports color and size props.</p>
      <div class="sc-demo" style="gap:16px">
        <SvgIcon name="vue" :size="28" />
        <SvgIcon name="elementPlus" :size="28" />
        <SvgIcon name="vite" :size="28" />
      </div>
    </el-card>

    <!-- EmptyState -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="info">EmptyState</el-tag> Empty placeholder</h3></template>
      <p class="sc-desc">Consistent empty state display used across all data views when no results are found.</p>
      <div class="sc-demo" style="width:100%">
        <EmptyState description="No data to display" />
      </div>
    </el-card>

    <!-- Loading / Skeleton -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="info">Skeleton</el-tag> Page and component skeletons</h3></template>
      <p class="sc-desc">Loading placeholders that match the shape of the content being loaded.</p>
      <div class="sc-demo" style="width:100%;flex-direction:column">
        <Skeleton :rows="3" animated />
      </div>
    </el-card>

    <!-- SearchForm -->
    <el-card class="sc-section">
      <template #header><h3><el-tag>SearchForm</el-tag> Configurable search form</h3></template>
      <p class="sc-desc">Generates a search form from ProTable column definitions. Supports input, select, date-picker, and tree-select.</p>
      <div class="sc-demo" style="width:100%">
        <SearchForm :columns="searchColumns" :search="onSearch" :reset="onSearchReset" :search-col="3" :search-param="{}" />
      </div>
      <div v-if="searchResult" class="sc-desc" style="margin-top:8px">
        <el-tag size="small" type="success">Search: {{ JSON.stringify(searchResult) }}</el-tag>
      </div>
    </el-card>

    <!-- ScoreBar -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="warning">ScoreBar</el-tag> Score visualization bar</h3></template>
      <p class="sc-desc">Visual score indicator used in RAG results and quality metrics. Color-coded thresholds.</p>
      <div class="sc-demo" style="flex-direction:column;align-items:flex-start;gap:8px;width:100%">
        <div v-for="s in scoreSamples" :key="s.label" style="display:flex;align-items:center;gap:12px;width:100%">
          <span style="width:60px;font-size:13px">{{ s.label }}</span>
          <ScoreBar :score="s.score" style="flex:1" />
        </div>
      </div>
    </el-card>

    <!-- MarkdownPreview -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="primary">MarkdownPreview</el-tag> Markdown renderer</h3></template>
      <p class="sc-desc">Renders markdown with syntax highlighting, Mermaid diagrams, and table support.</p>
      <div class="sc-demo" style="width:100%">
        <MarkdownPreview v-model="sampleMarkdown" editor-id="showcase-md" style="max-height:240px;overflow:auto" />
      </div>
    </el-card>

    <!-- ImportExcel -->
    <el-card class="sc-section">
      <template #header><h3><el-tag type="success">ImportExcel</el-tag> Excel file importer</h3></template>
      <p class="sc-desc">Upload and parse Excel files. Supports .xlsx and .xls formats with column mapping.</p>
      <div class="sc-demo">
        <ImportExcel :disabled="false" />
      </div>
    </el-card>

    <!-- PageHeaderCard -->
    <el-card class="sc-section">
      <template #header><h3><el-tag>PageHeaderCard</el-tag> Page header with metadata</h3></template>
      <p class="sc-desc">Consistent page header with icon, title, description, and optional action pills.</p>
      <div class="sc-demo" style="width:100%">
        <PageHeaderCard :icon="DataBoard" icon-bg="#409EFF" title="Dashboard Overview" description="Key metrics and trends at a glance" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="componentsShowcase">
import { ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";
import SwitchDark from "@/components/SwitchDark/index.vue";
import EmptyState from "@/components/EmptyState/EmptyState.vue";
import Skeleton from "@/components/Skeleton/SkeletonTable.vue";
import SearchForm from "@/components/SearchForm/index.vue";
import ScoreBar from "@/components/ScoreBar/index.vue";
import MarkdownPreview from "@/components/MarkdownPreview/index.vue";
import ImportExcel from "@/components/ImportExcel/index.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import { DataBoard } from "@element-plus/icons-vue";
import type { ColumnProps } from "@/components/ProTable/interface";

const selectedIcon = ref("Setting");
const searchResult = ref<Record<string, any> | null>(null);

const tableColumns: ColumnProps[] = [
  { prop: "id", label: "ID", width: 80 },
  { prop: "name", label: "Name", search: { el: "input" } },
  { prop: "role", label: "Role", width: 150 },
  { prop: "status", label: "Status", width: 120 },
];

const tableData = [
  { id: 1, name: "Alice Wang", role: "Frontend Lead", status: "Active" },
  { id: 2, name: "Bob Li", role: "Backend Developer", status: "Active" },
  { id: 3, name: "Carol Zhang", role: "Product Manager", status: "On Leave" },
  { id: 4, name: "Dave Chen", role: "DevOps Engineer", status: "Active" },
  { id: 5, name: "Eve Liu", role: "UI Designer", status: "Inactive" },
  { id: 6, name: "Frank Xu", role: "QA Engineer", status: "Active" },
];

const searchColumns: ColumnProps[] = [
  { prop: "keyword", label: "Keyword", search: { el: "input" } },
  { prop: "category", label: "Category", search: { el: "select" }, enum: [{ value: "tech", label: "Tech" }, { value: "design", label: "Design" }] },
  { prop: "date", label: "Date", search: { el: "date-picker" } },
];

function onSearch(values: Record<string, any>) {
  searchResult.value = values;
}
function onSearchReset() {
  searchResult.value = null;
}

const scoreSamples = [
  { label: "Excellent", score: 0.92 },
  { label: "Good", score: 0.73 },
  { label: "Average", score: 0.51 },
  { label: "Poor", score: 0.28 },
];

const sampleMarkdown = `### Quick Start

\`\`\`ts
import { useAuthStore } from "@/stores/modules/auth";
const auth = useAuthStore();
await auth.getAuthMenuList();
\`\`\`

**Features:**
- Syntax highlighting
- Mermaid diagrams
- Responsive tables
`;
</script>

<style scoped lang="scss">
@use "./showcase.scss";
</style>