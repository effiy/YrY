<script setup lang="ts">
/**
 * YiPet Popup — AboutCard
 * Compact expandable panel with key info.
 */
import { t } from '@/shared/i18n';
</script>

<template>
  <div class="popup-about">
    <el-collapse>
      <el-collapse-item>
        <template #title>
          <span class="popup-about-label">{{ t('aboutTitle') }}</span>
        </template>
        <div class="popup-about-body">
          <p class="popup-about-tagline">{{ t('aboutTagline') }}</p>
          <ul class="popup-about-features">
            <li><span class="popup-about-dot" aria-hidden="true" />{{ t('aboutFeaturePet') }}</li>
            <li><span class="popup-about-dot" aria-hidden="true" />{{ t('aboutFeatureChat') }}</li>
            <li><span class="popup-about-dot" aria-hidden="true" />{{ t('aboutFeatureApi') }}</li>
          </ul>
          <p class="popup-about-tech">{{ t('aboutTechStack') }}</p>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.popup-about {
  background: var(--bg-secondary, #1e1a3b);
  border: 1px solid var(--border-secondary, rgba(167, 139, 250, 0.3));
  border-radius: 10px;
}

.popup-about-label {
  font-size: 13px;
  font-weight: 600;
}

.popup-about-body {
  padding: 4px 2px 2px;
}

.popup-about-tagline {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary, #f5f3ff);
  margin: 0 0 8px;
  line-height: 1.5;
}

.popup-about-features {
  list-style: none;
  padding: 0;
  margin: 0 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
}

.popup-about-features li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
}

.popup-about-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary-gradient, #a78bfa);
  flex-shrink: 0;
}

.popup-about-tech {
  font-size: 11px;
  color: var(--text-muted, rgba(212, 208, 232, 0.5));
  margin: 0;
}
</style>