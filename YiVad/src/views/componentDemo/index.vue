<template>
  <div class="card content-box">
    <span class="text">Component Demo</span>
    <el-alert
      title="Component Demo showcases all reusable components in YiVad. Each sub-menu demonstrates a specific component with usage examples and API documentation."
      type="info"
      :closable="false"
    />
    <el-row :gutter="20" class="mt30">
      <el-col v-for="comp in components" :key="comp.name" :xs="24" :sm="12" :md="8" :lg="6" class="mb20">
        <el-card shadow="hover" class="comp-card" @click="$router.push(comp.path)">
          <div class="comp-icon">
            <el-icon :size="32">
              <component :is="comp.icon" />
            </el-icon>
          </div>
          <div class="comp-name">{{ comp.title }}</div>
          <div class="comp-desc">{{ comp.desc }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="componentDemoIndex">
import { Grid, List, Search, DataBoard, Picture, EditPen, Upload, Document, Loading, Sunny, Histogram, Filter, MagicStick, Warning, Share, InfoFilled } from "@element-plus/icons-vue";

const components = [
  { name: "proTable", title: "ProTable", desc: "Canonical table with search, pagination, selection", path: "/componentDemo/proTable", icon: "List" },
  { name: "echarts", title: "ECharts", desc: "Column, Line, Pie, Radar, Water charts", path: "/componentDemo/echarts", icon: "Histogram" },
  { name: "searchForm", title: "SearchForm", desc: "Responsive search form with Grid layout", path: "/componentDemo/searchForm", icon: "Search" },
  { name: "selectFilter", title: "SelectFilter", desc: "Dropdown filter with search and multi-select", path: "/componentDemo/selectFilter", icon: "Filter" },
  { name: "selectIcon", title: "SelectIcon", desc: "Icon picker with search and preview", path: "/componentDemo/selectIcon", icon: "MagicStick" },
  { name: "svgIcon", title: "SvgIcon", desc: "SVG sprite icon component", path: "/componentDemo/svgIcon", icon: "Picture" },
  { name: "treeFilter", title: "TreeFilter", desc: "Tree-based filter with checkboxes", path: "/componentDemo/treeFilter", icon: "Share" },
  { name: "upload", title: "Upload", desc: "Image upload (single + multiple)", path: "/componentDemo/upload", icon: "Upload" },
  { name: "wangEditor", title: "WangEditor", desc: "Rich text editor component", path: "/componentDemo/wangEditor", icon: "EditPen" },
  { name: "importExcel", title: "ImportExcel", desc: "Excel batch import with template download", path: "/componentDemo/importExcel", icon: "Document" },
  { name: "errorMessage", title: "ErrorMessage", desc: "403 / 404 / 500 error pages", path: "/componentDemo/errorMessage", icon: "Warning" },
  { name: "loading", title: "Loading", desc: "Loading spinner component", path: "/componentDemo/loading", icon: "Loading" },
  { name: "switchDark", title: "SwitchDark", desc: "Dark mode toggle switch", path: "/componentDemo/switchDark", icon: "Sunny" },
  { name: "grid", title: "Grid", desc: "Responsive grid layout system", path: "/componentDemo/grid", icon: "Grid" },
  { name: "mermaidViewer", title: "MermaidViewer", desc: "Mermaid diagram fullscreen viewer", path: "/componentDemo/mermaidViewer", icon: "DataBoard" },
  { name: "knowledgeMetaStrip", title: "KnowledgeMetaStrip", desc: "Knowledge frontmatter metadata strip", path: "/componentDemo/knowledgeMetaStrip", icon: "InfoFilled" },
  { name: "ragSources", title: "RagSources", desc: "RAG source citations component", path: "/componentDemo/ragSources", icon: "Share" },
];
</script>

<style scoped lang="scss">
.comp-card {
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
  }
}
.comp-icon {
  text-align: center;
  margin-bottom: 12px;
  color: var(--el-color-primary);
}
.comp-name {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.comp-desc {
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.mt30 { margin-top: 30px; }
.mb20 { margin-bottom: 20px; }
</style>