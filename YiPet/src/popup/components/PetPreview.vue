<script setup lang="ts">
/**
 * YiPet Popup — PetPreview
 * Live visual preview of the pet with theme-gradient ring.
 * Click to toggle visibility.
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
const ringPx = computed(() => imgPx.value + 20);
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
  gap: 8px;
  width: 100%;
  padding: 14px 12px 12px;
  background: var(--bg-gradient, linear-gradient(135deg, #13122a, #312d55));
  border-radius: 14px;
  border: 1px solid var(--border-secondary, rgba(167, 139, 250, 0.3));
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition: border-color 0.25s ease, opacity 0.25s ease, transform 0.2s ease;
}

.pet-preview:hover:not(:disabled) {
  border-color: var(--border-focus, #a78bfa);
  transform: translateY(-1px);
}

.pet-preview:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
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
  background: var(--primary-gradient, linear-gradient(135deg, #667eea, #f093fb));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 10px 30px var(--primary-alpha, rgba(102, 126, 234, 0.35));
  animation: petPreviewFloat 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transition: background 0.4s ease, box-shadow 0.4s ease;
  position: relative;
  z-index: 1;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.pet-preview-shadow {
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  filter: blur(8px);
  margin-top: -6px;
  animation: petPreviewShadow 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transition: width 0.3s ease;
}

.pet-preview-img {
  border-radius: 50%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.pet-preview-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
  line-height: 1.4;
}

.pet-preview-role {
  font-weight: 600;
  color: var(--text-primary, #f5f3ff);
}

.pet-preview-theme {
  color: var(--text-accent, #c4b5fd);
}

.pet-preview-sep {
  opacity: 0.5;
}

@keyframes petPreviewFloat {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50% { transform: translateY(-7px) translateZ(0); }
}

@keyframes petPreviewShadow {
  0%, 100% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(0.7); opacity: 0.3; }
}

@media (prefers-reduced-motion: reduce) {
  .pet-preview-ring,
  .pet-preview-shadow { animation: none; }
}
</style>