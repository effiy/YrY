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
import { applyThemeColors } from '@/shared/theme';
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
watch(() => state.value.color, (c) => {
  applyThemeColors(document.documentElement, c);
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
                :disabled="disabled"
                @change="store.updateColor"
              />
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
  letter-spacing: 0.05em;
  color: var(--text-muted, rgba(212, 208, 232, 0.5));
  margin-bottom: 4px;
}

.popup-form-item {
  margin-bottom: 14px;
}

.popup-form-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.popup-form-hint {
  font-size: 11px;
  color: var(--text-muted, rgba(212, 208, 232, 0.5));
  line-height: 1.4;
}

.popup-select {
  width: 100%;
}

.size-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
}
</style>