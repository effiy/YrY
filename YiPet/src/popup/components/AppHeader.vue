<script setup lang="ts">
/**
 * YiPet Popup — AppHeader
 * Branded gradient header with the extension icon, name, tagline, and a live status pill.
 */
import { t } from '@/shared/i18n';

defineProps<{
  visible: boolean;
  statusText: string;
}>();

defineEmits<{
  toggle: [];
}>();

const iconUrl = chrome.runtime.getURL('assets/icons/icon.png');
</script>

<template>
  <header class="popup-header">
    <div class="popup-header-shimmer" aria-hidden="true" />
    <div class="popup-header-logo">
      <img class="popup-header-icon" :src="iconUrl" alt="YiPet" />
      <div class="popup-header-brand">
        <h4 class="popup-header-title">{{ t('extName') }}</h4>
        <span class="popup-header-sub">{{ t('popupSubtitle') }}</span>
      </div>
    </div>
    <button
      type="button"
      class="popup-status-pill"
      :class="visible ? 'is-active' : 'is-hidden'"
      :title="visible ? t('popupStatusActive') : t('popupStatusHidden')"
      @click="$emit('toggle')"
    >
      <span class="popup-status-dot" aria-hidden="true" />
      {{ statusText }}
    </button>
  </header>
</template>

<style scoped>
.popup-header {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 16px;
  color: #fff;
  background: var(--primary-gradient, linear-gradient(135deg, #667eea, #f093fb));
}

.popup-header-shimmer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 55%),
    radial-gradient(circle at 82% 60%, rgba(255, 255, 255, 0.12) 0%, transparent 45%);
  animation: headerShimmer 6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  will-change: opacity;
}

@keyframes headerShimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.popup-header-logo {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.popup-header-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: contain;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  flex-shrink: 0;
}

.popup-header-brand {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.popup-header-title {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.popup-header-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popup-status-pill {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.15s ease;
}

.popup-status-pill:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.popup-status-pill:active {
  transform: translateY(0);
}

.popup-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.popup-status-pill.is-active .popup-status-dot {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
  animation: popupStatusPulse 2s ease-in-out infinite;
}

.popup-status-pill.is-hidden .popup-status-dot {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
}

@keyframes popupStatusPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(34, 197, 94, 0);
  }
}
</style>