<script setup lang="ts" name="MermaidViewer">
/**
 * Global fullscreen mermaid viewer — mounted once in App.vue.
 * Presents any mermaid SVG at large scale with zoom + drag-to-pan controls.
 * Opened via useMermaidViewer().openFullscreen(svgEl).
 */
import { watch, onUnmounted, ref, nextTick } from "vue";
import { useMermaidViewer } from "@/hooks/useMermaidViewer";
import { ZoomIn, ZoomOut, Download, Close } from "@element-plus/icons-vue";

const { fsVisible, fsSvg, fsScale, closeFullscreen, zoomIn, zoomOut, zoomFit, setScale } =
  useMermaidViewer();

const overlayRef = ref<HTMLElement | null>(null);

// ── Drag-to-pan state ────────────────────────────────────────────────────

const panX = ref(0);
const panY = ref(0);
const isDragging = ref(false);
const dragBase = ref({ x: 0, y: 0, panX: 0, panY: 0 });

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
    resetView();
  }
}

// ── Reset pan + scale ────────────────────────────────────────────────────

function resetView() {
  panX.value = 0;
  panY.value = 0;
  zoomFit();
}

// ── Centre the SVG in the viewport ───────────────────────────────────────

function recentreSvg() {
  nextTick(() => {
    const canvas = overlayRef.value?.querySelector(".mv-fs-canvas") as HTMLElement | null;
    const wrapper = canvas?.querySelector(".mv-fs-svg") as HTMLElement | null;
    const svgEl = wrapper?.querySelector("svg") as SVGSVGElement | null;
    if (!canvas || !svgEl) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const sw = svgEl.getBoundingClientRect().width;
    const sh = svgEl.getBoundingClientRect().height;
    panX.value = Math.max(0, (cw - sw) / 2);
    panY.value = Math.max(0, (ch - sh) / 2);
  });
}

// ── Mouse drag ────────────────────────────────────────────────────────────

function onCanvasMouseDown(e: MouseEvent) {
  if (e.button !== 0) return;
  // Don't start drag on toolbar clicks
  if ((e.target as HTMLElement).closest(".mv-fs-toolbar")) return;
  isDragging.value = true;
  dragBase.value = {
    x: e.clientX,
    y: e.clientY,
    panX: panX.value,
    panY: panY.value,
  };
  e.preventDefault();
}

function onCanvasMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  panX.value = dragBase.value.panX + (e.clientX - dragBase.value.x);
  panY.value = dragBase.value.panY + (e.clientY - dragBase.value.y);
}

function onCanvasMouseUp(_e: MouseEvent) {
  isDragging.value = false;
}

// ── Cursor-centred scroll zoom ────────────────────────────────────────────

function onCanvasWheel(e: WheelEvent) {
  e.preventDefault();
  const canvas = overlayRef.value?.querySelector(".mv-fs-canvas") as HTMLElement | null;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left; // cursor X relative to canvas
  const cy = e.clientY - rect.top;  // cursor Y relative to canvas

  const factor = e.deltaY < 0 ? 1.2 : 0.833;
  const oldScale = fsScale.value;
  const newScale = Math.min(5, Math.max(0.1, +(oldScale * factor).toFixed(3)));
  if (Math.abs(newScale - oldScale) < 0.001) return;

  // Keep the point under the cursor stationary through the scale change.
  // transform-origin is 0 0, so scale expands from the top-left corner.
  panX.value = cx - (cx - panX.value) * (newScale / oldScale);
  panY.value = cy - (cy - panY.value) * (newScale / oldScale);
  setScale(newScale);
}

// ── Touch / pinch ─────────────────────────────────────────────────────────

let pinchBase: {
  cx: number;
  cy: number;
  dist: number;
  scale: number;
  panX: number;
  panY: number;
} | null = null;

function onCanvasTouchStart(e: TouchEvent) {
  if ((e.target as HTMLElement).closest(".mv-fs-toolbar")) return;
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchBase = {
      cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      dist: Math.hypot(dx, dy),
      scale: fsScale.value,
      panX: panX.value,
      panY: panY.value,
    };
  } else if (e.touches.length === 1) {
    dragBase.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      panX: panX.value,
      panY: panY.value,
    };
  }
  e.preventDefault();
}

function onCanvasTouchMove(e: TouchEvent) {
  if (e.touches.length === 2 && pinchBase) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const newScale = Math.min(5, Math.max(0.1, pinchBase.scale * (dist / pinchBase.dist)));
    const canvas = overlayRef.value?.querySelector(".mv-fs-canvas") as HTMLElement | null;
    const rect = canvas?.getBoundingClientRect();
    if (rect) {
      const rx = pinchBase.cx - rect.left;
      const ry = pinchBase.cy - rect.top;
      panX.value = rx - (rx - pinchBase.panX) * (newScale / pinchBase.scale);
      panY.value = ry - (ry - pinchBase.panY) * (newScale / pinchBase.scale);
    }
    setScale(newScale);
  } else if (e.touches.length === 1) {
    panX.value = dragBase.value.panX + (e.touches[0].clientX - dragBase.value.x);
    panY.value = dragBase.value.panY + (e.touches[0].clientY - dragBase.value.y);
  }
  e.preventDefault();
}

function onCanvasTouchEnd() {
  pinchBase = null;
}

// ── Lock body scroll when fullscreen is open ──────────────────────────────

watch(fsVisible, (v) => {
  if (v) {
    document.body.style.overflow = "hidden";
    // Reset pan and centre the SVG
    panX.value = 0;
    panY.value = 0;
    recentreSvg();
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
        @click.self="closeFullscreen"
      >
        <!-- Toolbar -->
        <div class="mv-fs-toolbar">
          <el-button size="small" text :icon="ZoomIn" title="Zoom in (+)" @click="zoomIn" />
          <el-button size="small" text :icon="ZoomOut" title="Zoom out (-)" @click="zoomOut" />
          <el-button size="small" text title="Fit + reset position (0)" @click="resetView">
            <span style="font-size:14px;line-height:1">⊡</span>
          </el-button>
          <span class="mv-fs-scale">{{ Math.round(fsScale * 100) }}%</span>
          <el-button size="small" text :icon="Download" title="Download SVG" @click="downloadFullscreen" />
          <el-button size="small" text :icon="Close" title="Close (Esc)" @click="closeFullscreen" />
        </div>

        <!-- SVG canvas — pannable, zoomable -->
        <div
          class="mv-fs-canvas"
          @mousedown="onCanvasMouseDown"
          @mousemove="onCanvasMouseMove"
          @mouseup="onCanvasMouseUp"
          @mouseleave="onCanvasMouseUp"
          @wheel="onCanvasWheel"
          @touchstart="onCanvasTouchStart"
          @touchmove="onCanvasTouchMove"
          @touchend="onCanvasTouchEnd"
        >
          <div
            class="mv-fs-svg"
            :style="{
              transform: `translate(${panX}px, ${panY}px) scale(${fsScale})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }"
            v-html="fsSvg"
          />
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
  user-select: none;
}

.mv-fs-scale {
  min-width: 48px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 70%);
  text-align: center;
}

// SVG canvas — no scrollbars, pan + zoom via transform
.mv-fs-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none; // let JS handle touch gestures
}

.mv-fs-svg {
  // transform is applied inline (translate + scale)
  transform-origin: 0 0;
  transition: transform 0.14s ease-out;
  will-change: transform;

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
