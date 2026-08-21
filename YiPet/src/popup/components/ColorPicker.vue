<script setup lang="ts">
/**
 * YiPet Popup — ColorPicker
 * Gradient swatch grid. Each swatch shows the theme's primary gradient.
 */
import { Check } from '@element-plus/icons-vue';
import { COLOR_OPTIONS } from '@/popup/data';

defineProps<{
  value: number;
  disabled?: boolean;
}>();

defineEmits<{
  change: [value: number];
}>();
</script>

<template>
  <div class="color-picker" role="radiogroup" aria-label="Color theme">
    <button
      v-for="opt in COLOR_OPTIONS"
      :key="opt.value"
      type="button"
      class="color-swatch"
      :class="{ 'is-selected': opt.value === value }"
      :style="{ background: opt.gradient }"
      :disabled="disabled"
      :title="opt.label"
      :aria-pressed="opt.value === value"
      :aria-label="opt.label"
      @click="$emit('change', opt.value)"
    >
      <el-icon v-if="opt.value === value"><Check /></el-icon>
    </button>
  </div>
</template>

<style scoped>
.color-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.color-swatch {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  padding: 0;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
  will-change: transform;
}

.color-swatch:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
}

.color-swatch.is-selected {
  border-color: var(--text-primary, #fff);
  box-shadow: 0 0 0 2px var(--border-focus, #a78bfa), 0 4px 14px rgba(0, 0, 0, 0.4);
  transform: scale(1.08);
}

.color-swatch:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>