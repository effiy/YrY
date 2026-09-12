<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = withDefaults(defineProps<{
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
}>(), {
  width: 500,
  height: 200,
  penColor: "#000000",
  penWidth: 2,
  backgroundColor: "#ffffff",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "clear"): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const hasSignature = ref(false);
let ctx: CanvasRenderingContext2D | null = null;
let lastX = 0;
let lastY = 0;

function getPos(e: MouseEvent): { x: number; y: number } {
  const canvas = canvasRef.value!;
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function startDraw(e: MouseEvent) {
  e.preventDefault();
  isDrawing.value = true;
  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;
  ctx?.beginPath();
  ctx?.moveTo(lastX, lastY);
}

function draw(e: MouseEvent) {
  if (!isDrawing.value) return;
  e.preventDefault();
  const pos = getPos(e);

  if (ctx) {
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  lastX = pos.x;
  lastY = pos.y;
  hasSignature.value = true;
}

function stopDraw() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  ctx?.closePath();

  // Emit base64 PNG
  const dataUrl = canvasRef.value?.toDataURL("image/png") || "";
  emit("update:modelValue", dataUrl);
}

function clearCanvas() {
  if (ctx && canvasRef.value) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.fillStyle = props.backgroundColor;
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
  hasSignature.value = false;
  emit("clear");
  emit("update:modelValue", "");
}

function exportSVG(): string {
  const dataUrl = canvasRef.value?.toDataURL("image/png") || "";
  return `<svg xmlns="http://www.w3.org/2000/svg"><image href="${dataUrl}"/></svg>`;
}

function undoLastStroke() {
  // Simple undo: clear all (full undo stack would require stroke storage)
  clearCanvas();
}

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = props.width;
    canvasRef.value.height = props.height;
    ctx = canvasRef.value.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = props.penColor;
      ctx.lineWidth = props.penWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = props.backgroundColor;
      ctx.fillRect(0, 0, props.width, props.height);
    }
  }
});
</script>

<template>
  <div class="signature-pad">
    <canvas
      ref="canvasRef"
      class="signature-pad__canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
      @mousedown="startDraw"
      @mousemove="draw"
      @mouseup="stopDraw"
      @mouseleave="stopDraw"
    />
    <div class="signature-pad__actions">
      <el-button size="small" @click="clearCanvas">清除</el-button>
      <el-button size="small" :disabled="!hasSignature" @click="undoLastStroke">撤销</el-button>
      <span v-if="hasSignature" class="signature-pad__status signed">已签名</span>
      <span v-else class="signature-pad__status">未签名</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.signature-pad {
  &__canvas {
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    cursor: crosshair;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  &__status {
    margin-left: auto;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    &.signed {
      color: var(--el-color-success);
    }
  }
}
</style>