<script setup lang="ts">
/**
 * YiPet Popup — ColorPicker
 * Professional theme swatch grid with labels + custom color input.
 * Each swatch shows the theme's primary gradient and name.
 */
import { ref } from 'vue';
import { Check, Plus } from '@element-plus/icons-vue';
import { COLOR_OPTIONS } from '@/popup/data';

const props = defineProps<{
  value: number;
  customColor?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [value: number];
  'update:customColor': [hex: string];
}>();

const customInput = ref('');
const showCustomPicker = ref(false);

function applyCustomColor() {
  const hex = customInput.value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  emit('update:customColor', hex);
  showCustomPicker.value = false;
}
</script>

<template>
  <div class="color-picker" role="radiogroup" aria-label="Color theme">
    <button
      v-for="opt in COLOR_OPTIONS"
      :key="opt.value"
      type="button"
      class="color-swatch"
      :class="{ 'is-selected': opt.value === value && !customColor }"
      :disabled="disabled"
      :title="opt.label"
      :aria-pressed="opt.value === value"
      :aria-label="opt.label"
      @click="emit('change', opt.value)"
    >
      <span class="swatch-gradient" :style="{ background: opt.gradient }">
        <el-icon v-if="opt.value === value && !customColor" class="swatch-check"><Check /></el-icon>
      </span>
      <span class="swatch-label">{{ opt.label }}</span>
    </button>

    <!-- Custom color swatch -->
    <button
      type="button"
      class="color-swatch"
      :class="{ 'is-selected': !!customColor }"
      :disabled="disabled"
      :title="customColor || 'Custom'"
      :aria-label="customColor || 'Custom color'"
      @click="showCustomPicker = !showCustomPicker"
    >
      <span
        class="swatch-gradient"
        :style="{ background: customColor || 'linear-gradient(135deg, #ccc 0%, #999 50%, #666 100%)' }"
      >
        <el-icon v-if="!customColor" class="swatch-plus"><Plus /></el-icon>
        <el-icon v-else class="swatch-check"><Check /></el-icon>
      </span>
      <span class="swatch-label">{{ customColor ? 'Custom' : 'Custom…' }}</span>
    </button>
  </div>

  <!-- Inline custom color input -->
  <div v-if="showCustomPicker" class="custom-input-row">
    <el-color-picker
      :model-value="customColor || '#6366f1'"
      @change="(v: string | null) => { if (v) customInput = v; }"
      show-alpha
    />
    <el-input
      v-model="customInput"
      placeholder="#6366f1"
      size="small"
      class="custom-hex-input"
      @keyup.enter="applyCustomColor"
    />
    <el-button size="small" type="primary" @click="applyCustomColor">Apply</el-button>
  </div>
</template>

<style scoped>
.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.color-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: 6px;
  transition: transform 0.2s ease;
}

.color-swatch:hover:not(:disabled) {
  transform: translateY(-2px);
}

.color-swatch:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.swatch-gradient {
  width: 100%;
  aspect-ratio: 1.4;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.2s ease, outline 0.2s ease;
  position: relative;
}

.color-swatch.is-selected .swatch-gradient {
  outline: 2px solid var(--text-primary, #fff);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--border-focus, #a78bfa), 0 4px 14px rgba(0, 0, 0, 0.4);
}

.swatch-check {
  color: #fff;
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.swatch-plus {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.swatch-label {
  font-size: 10px;
  color: var(--text-secondary, #d4d0e8);
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.color-swatch.is-selected .swatch-label {
  color: var(--text-primary, #f5f3ff);
  font-weight: 600;
}

.custom-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.custom-hex-input {
  flex: 1;
}
</style>