<script setup lang="ts" name="MermaidViewer">
/**
 * Global fullscreen mermaid viewer — mounted once in App.vue.
 * Presents any mermaid SVG at large scale with zoom controls.
 * Opened via useMermaidViewer().openFullscreen(svgEl).
 */
import { watch, onUnmounted, ref } from "vue";
import { useMermaidViewer } from "@/hooks/useMermaidViewer";
import { ZoomIn, ZoomOut, Download, Close } from "@element-plus/icons-vue";

const { fsVisible, fsSvg, fsScale, closeFullscreen, zoomIn, zoomOut, zoomFit, downloadSvg } =
  useMermaidViewer();

const overlayRef = ref<HTMLElement | null>(null);

// ── Keyboard ──────────────────────────────────────────────────────────────

function onKeydown(e: KeyboardEvent) {
  if (!fsVisible.value) return;
  if (e.key === "Escape") {
    closeFullscreen();
  } else if (e.key === "=" || e.key === "+") {
    e.preventDefault();
    zoomIn();
  } else if (e.key === "-") {
    e.preventDefault();
    zoomOut();
  } else if (e.key === "0") {
    e.preventDefault();
    zoomFit();
  }
}

// ── Scroll zoom ───────────────────────────────────────────────────────────

function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (e.deltaY < 0) zoomIn();
  else zoomOut();
}

// ── Lock body scroll when fullscreen is open ──────────────────────────────

watch(fsVisible, (v) => {
  if (v) {
    document.body.style.overflow = "hidden";
    // Focus the overlay so keyboard events are captured
    requestAnimationFrame(() => overlayRef.value?.focus());
  } else {
    document.body.style.overflow = "";
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
});

// ── Download from fullscreen (use the cloned SVG in fsSvg) ────────────────

function downloadFullscreen() {
  const data = '<?xml version="1.0" encoding="UTF-8"?>\n' + fsSvg.value;
  const blob = new Blob([data], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mermaid-diagram-${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="mv-fade">
      <div
        v-if="fsVisible"
        ref="overlayRef"
        class="mv-overlay"
        tabindex="0"
        @keydown="onKeydown"
        @wheel="onWheel"
        @click.self="closeFullscreen"
      >
        <!-- Toolbar -->
        <div class="mv-fs-toolbar">
          <el-button size="small" text :icon="ZoomIn" title="Zoom in (+)" @click="zoomIn" />
          <el-button size="small" text :icon="ZoomOut" title="Zoom out (-)" @click="zoomOut" />
          <el-button size="small" text title="Fit to screen (0)" @click="zoomFit">
            <span style="font-size:14px;line-height:1">⊡</span>
          </el-button>
          <span class="mv-fs-scale">{{ Math.round(fsScale * 100) }}%</span>
          <el-button size="small" text :icon="Download" title="Download SVG" @click="downloadFullscreen" />
          <el-button size="small" text :icon="Close" title="Close (Esc)" @click="closeFullscreen" />
        </div>

        <!-- SVG (scaled) -->
        <div class="mv-fs-canvas">
          <div class="mv-fs-svg" :style="{ transform: `scale(${fsScale})` }" v-html="fsSvg" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
// ── Fullscreen overlay ──

.mv-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  background: rgb(0 0 0 / 88%);
  outline: none;
}

// Toolbar at the top
.mv-fs-toolbar {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: rgb(30 30 30 / 90%);
  border-bottom: 1px solid rgb(255 255 255 / 8%);
  flex-shrink: 0;
}

.mv-fs-scale {
  min-width: 48px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 70%);
  text-align: center;
}

// SVG canvas — scrollable, centered
.mv-fs-canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 24px;
}

.mv-fs-svg {
  // transform: scale() is applied inline
  transform-origin: center center;
  transition: transform 0.12s ease-out;

  :deep(svg) {
    max-width: none; // allow scaling beyond viewport
    height: auto;
    display: block;
  }
}

// ── Transition ──

.mv-fade-enter-active,
.mv-fade-leave-active {
  transition: opacity 0.2s;
}
.mv-fade-enter-from,
.mv-fade-leave-to {
  opacity: 0;
}
</style>
