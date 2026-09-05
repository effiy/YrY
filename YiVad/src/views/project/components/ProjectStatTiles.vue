<template>
  <div class="pst-grid">
    <div
      v-for="(tile, i) in tiles"
      :key="tile.key"
      class="pst-tile"
      :class="[
        `pst-tile--${tile.variant}`,
        { 'pst-tile--clickable': tile.clickable, 'pst-tile--on': tile.active, 'pst-pulse': pulsingKey === tile.key }
      ]"
      :title="tile.hint"
      @click="onTileClick(tile)"
    >
      <div class="pst-icon">
        <el-icon><component :is="tile.icon" /></el-icon>
      </div>
      <div class="pst-info">
        <span class="pst-value">{{ animated[i] ?? tile.value }}{{ tile.suffix || "" }}</span>
        <span class="pst-label">{{ tile.label }}</span>
        <span class="pst-sub">{{ tile.sub }}</span>
      </div>
    </div>
    <div v-if="dateLabel" class="pst-date-tag">
      <el-icon><Calendar /></el-icon>
      <span>Due {{ dateLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="ProjectStatTiles">
import { onBeforeUnmount, ref, watch } from "vue";
import { Calendar } from "@element-plus/icons-vue";
import type { StatTile } from "../types";

const props = defineProps<{
  tiles: StatTile[];
  dateLabel?: string;
}>();
const emit = defineEmits<{ (e: "select", key: string): void }>();

// ── Count-up: numbers ease to their new target instead of snapping, so a
// filter change reads as a transition rather than a repaint.
const animated = ref<number[]>([]);
const DURATION = 600;
let raf = 0;

watch(
  () => props.tiles.map(t => t.value).join(","),
  () => {
    const targets = props.tiles.map(t => t.value);
    const from = targets.map((_, i) => animated.value[i] ?? 0);
    const start = performance.now();
    cancelAnimationFrame(raf);
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      animated.value = targets.map((t, i) => Math.round(from[i] + (t - from[i]) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  },
  { immediate: true }
);

onBeforeUnmount(() => cancelAnimationFrame(raf));

const pulsingKey = ref("");
let pulseTimer: ReturnType<typeof setTimeout> | undefined;

function onTileClick(tile: StatTile) {
  if (!tile.clickable) return;
  pulsingKey.value = tile.key;
  clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => (pulsingKey.value = ""), 400);
  emit("select", tile.key);
}

onBeforeUnmount(() => clearTimeout(pulseTimer));
</script>

<style scoped lang="scss">
.pst-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
.pst-tile {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  border-left: 3px solid transparent;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.pst-tile--clickable {
  cursor: pointer;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
    transform: translateY(-1px);
  }
  &:active {
    transform: scale(0.97);
  }
}
.pst-tile--on {
  border-color: var(--el-color-primary);
  box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
}
.pst-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 16px;
  color: #ffffff;
  border-radius: 8px;
}
.pst-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.pst-value {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.pst-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  letter-spacing: 0.2px;
}
.pst-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

/* Gradient icon chips — same hue family as the knowledge-base dashboard. */
.pst-tile--all .pst-icon {
  background: linear-gradient(135deg, #5470c6, #4460b0);
}
.pst-tile--active .pst-icon {
  background: linear-gradient(135deg, #91cc75, #7ab85e);
}
.pst-tile--archived .pst-icon {
  background: linear-gradient(135deg, #909399, #7a7f87);
}
.pst-tile--issues {
  border-left-color: #5ab1ef;
  .pst-icon { background: linear-gradient(135deg, #5ab1ef, #3a90d0); }
}
.pst-tile--open {
  border-left-color: #fac858;
  .pst-icon { background: linear-gradient(135deg, #fac858, #e0b040); }
}
.pst-tile--progress {
  border-left-color: #3ba272;
  .pst-icon { background: linear-gradient(135deg, #3ba272, #2c8159); }
}
.pst-tile--risk {
  border-left-color: #ee6666;
  .pst-icon { background: linear-gradient(135deg, #ee6666, #da5a5a); }
}
.pst-tile--bugs {
  border-left-color: #f56c6c;
  .pst-icon { background: linear-gradient(135deg, #f56c6c, #e04545); }
}
.pst-tile--risk .pst-value {
  color: #ee6666;
}

@keyframes pst-pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(84 112 198 / 40%);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 6px rgb(84 112 198 / 0%);
    transform: scale(1.03);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(84 112 198 / 0%);
    transform: scale(1);
  }
}
.pst-pulse {
  animation: pst-pulse 0.4s ease-out;
}

.pst-date-tag {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border: 1px dashed var(--el-color-warning-light-5);
  border-radius: 10px;
  .el-icon {
    font-size: 13px;
  }
}
</style>
