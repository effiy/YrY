<template>
  <div class="card content-box">
    <span class="text">MermaidViewer Demo</span>
    <el-alert
      title="MermaidViewer is a global fullscreen mermaid diagram viewer with zoom and drag-to-pan controls. Opened via useMermaidViewer().openFullscreen(svgEl)."
      type="warning"
      :closable="false"
    />
    <div class="mermaid-demo mt30">
      <div class="mermaid" ref="mermaidRef" @click="openFullscreen">
        <svg viewBox="0 0 400 200" width="100%" height="200">
          <rect x="50" y="20" width="100" height="40" rx="4" fill="var(--el-color-primary-light-5)" stroke="var(--el-color-primary)" />
          <text x="100" y="46" text-anchor="middle" fill="var(--el-color-primary)" font-size="12">A</text>
          <rect x="250" y="20" width="100" height="40" rx="4" fill="var(--el-color-success-light-5)" stroke="var(--el-color-success)" />
          <text x="300" y="46" text-anchor="middle" fill="var(--el-color-success)" font-size="12">B</text>
          <line x1="150" y1="40" x2="250" y2="40" stroke="var(--el-text-color-secondary)" stroke-width="2" marker-end="url(#arrow)" />
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="4" orient="auto">
              <path d="M0,0 L0,8 L9,4 z" fill="var(--el-text-color-secondary)" />
            </marker>
          </defs>
        </svg>
      </div>
      <p class="hint">Click the diagram above to open the fullscreen viewer</p>
    </div>
    <el-descriptions title="Usage" :column="1" border class="mt30">
      <el-descriptions-item label="Composable">import { useMermaidViewer } from "@/hooks/useMermaidViewer"</el-descriptions-item>
      <el-descriptions-item label="Open">useMermaidViewer().openFullscreen(svgElement)</el-descriptions-item>
      <el-descriptions-item label="Controls">Zoom in/out, drag to pan, fit to screen, download SVG</el-descriptions-item>
      <el-descriptions-item label="Mounted in">App.vue (global singleton)</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoMermaidViewer">
import { ref } from "vue";
import { useMermaidViewer } from "@/hooks/useMermaidViewer";

const mermaidRef = ref<HTMLElement | null>(null);
const { openFullscreen: openFs } = useMermaidViewer();

const openFullscreen = () => {
  const svg = mermaidRef.value?.querySelector("svg");
  if (svg) openFs(svg as unknown as SVGSVGElement);
};
</script>

<style scoped lang="scss">
.mermaid-demo {
  text-align: center;
}
.mermaid {
  cursor: pointer;
  display: inline-block;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  &:hover { border-color: var(--el-color-primary); }
}
.hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.mt30 { margin-top: 30px; }
</style>