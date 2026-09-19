<script setup lang="ts">
/**
 * YiPet Popup — ColorPicker
 * 专业主题色选择器，采用卡片式 swatch 设计，带有精致的渐变预览和选中动效。
 */
import { ref, computed, watch } from 'vue';
import { Check, Plus, MagicStick } from '@element-plus/icons-vue';
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

watch(
  () => props.customColor,
  (hex) => {
    customInput.value = hex || '';
  },
  { immediate: true },
);

function applyCustomColor() {
  const hex = customInput.value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  emit('update:customColor', hex);
  showCustomPicker.value = false;
}

function updateCustomInput(hex: string | null) {
  if (hex) customInput.value = hex;
}

const isCustomSelected = computed(() => !!props.customColor);
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
        <span class="swatch-shine" />
        <el-icon v-if="opt.value === value && !customColor" class="swatch-check"><Check /></el-icon>
      </span>
      <span class="swatch-label">{{ opt.label }}</span>
    </button>

    <!-- Custom color swatch -->
    <button
      type="button"
      class="color-swatch color-swatch--custom"
      :class="{ 'is-selected': isCustomSelected }"
      :disabled="disabled"
      :title="customColor || 'Custom'"
      :aria-label="customColor || 'Custom color'"
      @click="showCustomPicker = !showCustomPicker"
    >
      <span
        class="swatch-gradient"
        :style="{ background: customColor || 'conic-gradient(from 0deg, #a78bfa 0%, #f472b6 25%, #fb923c 50%, #a78bfa 100%)' }"
      >
        <span class="swatch-shine swatch-shine--custom" />
        <el-icon v-if="!customColor" class="swatch-plus"><Plus /></el-icon>
        <el-icon v-else class="swatch-check"><Check /></el-icon>
      </span>
      <span class="swatch-label">{{ customColor ? 'Custom' : 'Custom…' }}</span>
    </button>
  </div>

  <!-- Inline custom color input -->
  <Transition name="slide-fade">
    <div v-if="showCustomPicker" class="custom-input-row">
      <div class="custom-picker-label">
        <el-icon class="label-icon"><MagicStick /></el-icon>
        <span>Custom Color</span>
      </div>
      <div class="custom-picker-controls">
        <el-color-picker
          :model-value="customColor || '#6366f1'"
          @change="updateCustomInput"
          size="small"
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
      <div class="custom-picker-tip">自定义色会同步应用到聊天弹框和桌宠主题。</div>
    </div>
  </Transition>
</template>

<style scoped>
.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 2px;
}

.color-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: 10px;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.color-swatch:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
}

.color-swatch:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.color-swatch.is-selected {
  transform: translateY(-2px);
}

.swatch-gradient {
  width: 100%;
  aspect-ratio: 1.3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.swatch-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 8px 8px 0 0;
  pointer-events: none;
}

.swatch-shine--custom {
  background: conic-gradient(from 180deg at 50% 0%, rgba(255,255,255,0.3) 0deg, rgba(255,255,255,0) 60deg);
}

.color-swatch:hover .swatch-gradient {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-swatch.is-selected .swatch-gradient {
  box-shadow: 0 0 0 2px var(--bg-primary, #1a1d24), 0 0 0 4px var(--border-focus, #a78bfa), 0 8px 20px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

.swatch-check {
  color: #fff;
  font-size: 14px;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
  position: relative;
  z-index: 1;
  animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.swatch-plus {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  position: relative;
  z-index: 1;
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
  font-weight: 500;
  letter-spacing: 0.02em;
}

.color-swatch.is-selected .swatch-label {
  color: var(--text-accent, #c4b5fd);
  font-weight: 600;
}

/* Custom picker */
.custom-input-row {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-tertiary, #252830);
  border-radius: 10px;
  border: 1px solid var(--border-secondary, rgba(167, 139, 250, 0.15));
}

.custom-picker-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #d4d0e8);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.label-icon {
  color: var(--text-accent, #c4b5fd);
}

.custom-picker-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-picker-tip {
  margin-top: 10px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--text-secondary, #d4d0e8);
  opacity: 0.72;
}

.custom-hex-input {
  flex: 1;
}

.custom-hex-input :deep(.el-input__wrapper) {
  background: var(--bg-secondary, #1a1d24);
  box-shadow: none;
  border: 1px solid var(--border-secondary, rgba(167, 139, 250, 0.15));
}

.custom-hex-input :deep(.el-input__wrapper:hover) {
  border-color: var(--border-focus, #a78bfa);
}

.custom-hex-input :deep(.el-input__inner) {
  color: var(--text-primary, #f5f3ff);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
}

/* Transition */
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
