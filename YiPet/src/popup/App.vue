<script setup lang="ts">
/**
 * YiPet Popup — Root Component (Composition API + Pinia).
 * Wraps content in Element Plus config so color theme changes apply live.
 */
import { watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { View, Hide, Refresh } from '@element-plus/icons-vue';
import { t } from '@/shared/i18n/index';
import type { SupportedLocale } from '@/shared/i18n/locale';
import { applyThemeColors, applyThemeHex } from '@/shared/theme';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import PetPreview from './components/PetPreview.vue';
import ColorPicker from './components/ColorPicker.vue';
import RolePicker from './components/RolePicker.vue';
import AboutCard from './components/AboutCard.vue';
import { usePopupStore } from './stores/popup';
import { MODELS, POPUP_CONFIG } from './data';

const store = usePopupStore();
const { state, disabled, colorLabel } = storeToRefs(store);

const SIZE = POPUP_CONFIG.SIZE;
const DEFAULTS = POPUP_CONFIG.DEFAULTS;

// Inject CSS variables onto :root so popup's CSS follows the active color theme.
watch(() => [state.value.color, state.value.customColor] as const, ([color, customColor]) => {
  if (customColor && applyThemeHex(document.documentElement, customColor)) return;
  applyThemeColors(document.documentElement, color);
}, { immediate: true });

onMounted(() => {
  store.init();
});

function resetDefaults() {
  store.setVisibility(DEFAULTS.VISIBLE);
  store.updateSize(DEFAULTS.SIZE);
  store.updateRole(DEFAULTS.ROLE);
  store.updateColor(DEFAULTS.COLOR);
  store.updateModel(DEFAULTS.MODEL);
}
</script>

<template>
  <el-config-provider>
    <el-container class="popup-layout">
      <AppHeader
        :visible="state.visible"
        :status-text="state.visible ? t('popupStatusActive') : t('popupStatusHidden')"
        @toggle="store.setVisibility(!state.visible)"
      />
      <el-main class="popup-content">
        <PetPreview
          :role="state.role"
          :size="state.displaySize"
          :color-label="colorLabel"
          :disabled="disabled"
          @toggle="store.setVisibility(!state.visible)"
        />

        <el-card class="popup-card" shadow="never">
          <template #header>
            <div class="popup-card-header">
              <span>{{ t('popupSettingsTitle') }}</span>
              <el-button
                :icon="Refresh"
                size="small"
                text
                @click="resetDefaults"
              >
                {{ t('popupReset') }}
              </el-button>
            </div>
          </template>
          <el-form label-position="top" :disabled="disabled">

            <!-- ── Appearance ── -->
            <div class="popup-section-label">{{ t('popupSectionAppearance') }}</div>

            <el-form-item :label="t('popupSwitchLabel')" class="popup-form-item">
              <div class="popup-form-row">
                <el-switch
                  :model-value="state.visible"
                  :active-icon="View"
                  :inactive-icon="Hide"
                  @change="(v: any) => store.setVisibility(!!v)"
                />
                <span class="popup-form-hint">{{ t('popupSwitchHint') }}</span>
              </div>
            </el-form-item>

            <el-form-item :label="t('popupSizeLabel')" class="popup-form-item">
              <el-slider
                :min="SIZE.MIN"
                :max="SIZE.MAX"
                :step="SIZE.STEP"
                :marks="SIZE.MARKS"
                :model-value="state.displaySize"
                @input="(v: any) => store.previewSize(Array.isArray(v) ? v[0] : v)"
                @change="(v: any) => store.updateSize(Array.isArray(v) ? v[0] : v)"
              />
              <span class="size-label">{{ state.displaySize }}{{ t('popupSizeUnit') }}</span>
            </el-form-item>

            <el-form-item :label="t('popupRoleLabel')" class="popup-form-item">
              <RolePicker
                :value="state.role"
                :disabled="disabled"
                @change="store.updateRole"
              />
            </el-form-item>

            <el-form-item :label="t('popupColorLabel')" class="popup-form-item">
              <ColorPicker
                :value="state.color"
                :custom-color="state.customColor"
                :disabled="disabled"
                @change="store.updateColor"
                @update:custom-color="store.setCustomColor"
              />
            </el-form-item>

            <!-- ── Page Theme Intensity ── -->
            <el-form-item :label="t('popupPageThemeLabel')" class="popup-form-item">
              <div class="page-theme-row">
                <el-slider
                  :min="0"
                  :max="100"
                  :step="5"
                  :model-value="state.pageTheme"
                  :disabled="disabled || state.color < 0"
                  :marks="{ 0: 'Off', 25: '', 50: 'Half', 75: '', 100: 'Full' }"
                  @change="(v: any) => store.setPageTheme(Array.isArray(v) ? v[0] : v)"
                  class="page-theme-slider"
                />
              </div>
              <span class="popup-form-hint">{{ t('popupPageThemeHint') }}</span>
            </el-form-item>

            <el-divider />

            <!-- ── Preferences ── -->
            <div class="popup-section-label">{{ t('popupSectionPreferences') }}</div>

            <el-form-item :label="t('popupModelLabel')" class="popup-form-item">
              <el-select
                :model-value="state.model"
                @change="store.updateModel"
                class="popup-select"
              >
                <el-option
                  v-for="m in MODELS"
                  :key="m"
                  :label="m"
                  :value="m"
                />
              </el-select>
              <span class="popup-form-hint">{{ t('popupModelHint') }}</span>
            </el-form-item>

            <el-form-item :label="t('popupLanguageLabel')" class="popup-form-item">
              <el-segmented
                :model-value="state.locale"
                :options="[
                  { value: 'en', label: 'English' },
                  { value: 'zh_CN', label: 'Simplified Chinese' },
                ]"
                @change="(v: string | number) => store.changeLanguage(v as SupportedLocale)"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <AboutCard />
      </el-main>
      <el-footer class="popup-footer" height="auto">
        <AppFooter
          :hint-text="state.hintText"
          :version="t('popupVersion', POPUP_CONFIG.DEFAULTS.VERSION)"
        />
      </el-footer>
    </el-container>
  </el-config-provider>
</template>

<style scoped>
.popup-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--yp-text-secondary, #e9e5f5);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.popup-section-label::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 10px;
  background: var(--yp-color-primary, #a78bfa);
  border-radius: 2px;
}

.popup-form-item {
  margin-bottom: 16px;
}

.popup-form-item :deep(.el-form-item__label) {
  color: var(--yp-text-primary, #f5f3ff);
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 4px;
}

.popup-form-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.popup-form-hint {
  font-size: 11px;
  color: var(--yp-text-secondary, #e9e5f5);
  line-height: 1.4;
  opacity: 0.7;
}

.popup-select {
  width: 100%;
}

.popup-select :deep(.el-input__wrapper) {
  background: var(--yp-surface-sunken, #1c1926);
  box-shadow: none;
  border: 1px solid var(--yp-border-subtle, rgba(196, 181, 253, 0.15));
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.popup-select :deep(.el-input__wrapper:hover) {
  border-color: var(--yp-border-focus, #a78bfa);
}

.popup-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--yp-border-focus, #a78bfa);
  box-shadow: 0 0 0 2px var(--yp-color-primary-alpha, rgba(167, 139, 250, 0.2));
}

.popup-select :deep(.el-input__inner) {
  color: var(--yp-text-primary, #f5f3ff);
}

.popup-select :deep(.el-select__caret) {
  color: var(--yp-text-secondary, #e9e5f5);
}

.size-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--yp-text-accent, #ddd6fe);
  font-weight: 500;
}

.page-theme-row {
  padding: 0 2px;
}

.page-theme-slider {
  width: 100%;
}

/* Slider styling */
.page-theme-slider :deep(.el-slider__runway) {
  background: var(--yp-surface-raised, #262333);
  height: 4px;
  border-radius: 2px;
}

.page-theme-slider :deep(.el-slider__bar) {
  background: var(--yp-gradient-primary, linear-gradient(90deg, #a78bfa, #8b5cf6));
  height: 4px;
  border-radius: 2px;
}

.page-theme-slider :deep(.el-slider__button-wrapper) {
  top: -8px;
}

.page-theme-slider :deep(.el-slider__button) {
  width: 14px;
  height: 14px;
  background: var(--yp-color-primary, #a78bfa);
  border: 2px solid var(--yp-surface-base, #13111a);
  box-shadow: 0 2px 6px rgba(167, 139, 250, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.page-theme-slider :deep(.el-slider__button:hover) {
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(167, 139, 250, 0.5);
}

.page-theme-slider :deep(.el-slider__marks-text) {
  color: var(--yp-text-secondary, #e9e5f5);
  font-size: 10px;
  margin-top: 6px;
}

/* Divider styling */
:deep(.el-divider) {
  border-color: var(--yp-border-subtle, rgba(196, 181, 253, 0.12));
  margin: 18px 0;
}

/* Switch styling */
:deep(.el-switch.is-checked .el-switch__core) {
  background: var(--yp-gradient-primary, linear-gradient(90deg, #a78bfa, #8b5cf6));
  border-color: transparent;
}

/* Segmented control styling */
:deep(.el-segmented) {
  background: var(--yp-surface-raised, #262333);
  padding: 3px;
  border-radius: 8px;
}

:deep(.el-segmented__item) {
  color: var(--yp-text-secondary, #e9e5f5);
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.el-segmented__item.is-selected) {
  background: var(--yp-gradient-primary, linear-gradient(135deg, #a78bfa, #8b5cf6));
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.3);
}
</style>
