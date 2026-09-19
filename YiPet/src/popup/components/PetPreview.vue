<script setup lang="ts">
/**
 * YiPet Popup — PetPreview
 * 宠物实时预览组件，带有主题色渐变光环和精致的浮动动画。
 */
import { computed } from 'vue';
import { roleImageUrl } from '@/popup/data';
import { t } from '@/shared/i18n';

const props = defineProps<{
  role: string;
  size: number;
  colorLabel: string;
  disabled?: boolean;
}>();

defineEmits<{
  toggle: [];
}>();

function previewScale(size: number): number {
  return Math.round(Math.min(130, Math.max(40, size * 0.4)));
}

const imgPx = computed(() => previewScale(props.size));
const ringPx = computed(() => imgPx.value + 24);
const imgSrc = computed(() => roleImageUrl(props.role));
</script>

<template>
  <button
    type="button"
    class="pet-preview"
    :class="{ 'is-disabled': disabled }"
    :disabled="disabled"
    :title="t('popupSwitchLabel')"
    @click="$emit('toggle')"
  >
    <div class="pet-preview-stage">
      <div
        class="pet-preview-ring"
        :style="{ width: ringPx + 'px', height: ringPx + 'px' }"
        role="img"
        :aria-label="role"
      >
        <div class="ring-inner" />
        <div class="ring-glow" />
        <img
          class="pet-preview-img"
          :src="imgSrc"
          :alt="role"
          :width="imgPx"
          :height="imgPx"
        />
      </div>
      <div class="pet-preview-shadow" :style="{ width: ringPx + 'px' }" aria-hidden="true" />
    </div>
    <div class="pet-preview-meta">
      <span class="pet-preview-role">{{ role }}</span>
      <span class="pet-preview-sep" aria-hidden="true">·</span>
      <span>{{ size }}{{ t('popupSizeUnit') }}</span>
      <span class="pet-preview-sep" aria-hidden="true">·</span>
      <span class="pet-preview-theme">{{ colorLabel }}</span>
    </div>
  </button>
</template>

<style scoped>
.pet-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 16px 14px 14px;
  background: var(--bg-gradient, linear-gradient(135deg, #13111a 0%, #1c1926 30%, #262333 60%, #302e40 100%));
  border-radius: 16px;
  border: 1px solid var(--border-secondary, rgba(196, 181, 253, 0.2));
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition: border-color 0.3s ease, opacity 0.25s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pet-preview:hover:not(:disabled) {
  border-color: var(--border-focus, #a78bfa);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pet-preview:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.pet-preview.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.pet-preview-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}

.pet-preview-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-gradient, linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%));
  position: relative;
  animation: petPreviewFloat 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  transition: background 0.5s ease, box-shadow 0.5s ease;
  will-change: transform;
}

.ring-inner {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
  pointer-events: none;
}

.ring-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: var(--primary-gradient, linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%));
  opacity: 0.3;
  filter: blur(12px);
  z-index: -1;
  animation: ringPulse 3.5s ease-in-out infinite;
  transition: opacity 0.5s ease;
}

.pet-preview:hover .ring-glow {
  opacity: 0.5;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.08); opacity: 0.45; }
}

.pet-preview-shadow {
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.25) 0%, transparent 70%);
  filter: blur(6px);
  margin-top: -8px;
  animation: petPreviewShadow 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  transition: width 0.3s ease;
}

@keyframes petPreviewShadow {
  0%, 100% { transform: scale(1) translateY(0); opacity: 0.6; }
  50% { transform: scale(0.85) translateY(2px); opacity: 0.4; }
}

.pet-preview-img {
  border-radius: 50%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.pet-preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary, #e9e5f5);
  line-height: 1.4;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pet-preview-role {
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.pet-preview-theme {
  color: var(--text-accent, #ddd6fe);
  font-weight: 500;
}

.pet-preview-sep {
  opacity: 0.4;
  font-size: 10px;
}

@keyframes petPreviewFloat {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50% { transform: translateY(-8px) translateZ(0); }
}

@media (prefers-reduced-motion: reduce) {
  .pet-preview-ring,
  .pet-preview-shadow,
  .ring-glow { animation: none; }
}
</style>