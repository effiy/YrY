<template>
  <el-dropdown trigger="click" @command="changeLanguage">
    <i :class="'iconfont icon-zhongyingwen'" class="toolBar-icon" :title="t('header.language')"></i>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in languageList"
          :key="item.value"
          :command="item.value"
          :disabled="isCurrentLocale(item.value)"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "@/stores/modules/global";
import { AVAILABLE_LOCALES, normalizeLocale, type LocaleCode } from "@/languages";
import type { LanguageType } from "@/stores/interface";

const { t, locale } = useI18n();
// NOTE: vue-i18n `useI18n().locale` 会在 legacy:false 下暴露为 `ComposerLocale<string>`，
//       它本身是 WritableComputedRef<string>，但 TS 推导常误报；这里用显式 ref 视图。
const localeRef = locale as unknown as import("vue").WritableComputedRef<LocaleCode>;
const globalStore = useGlobalStore();

/** 语言下拉选项（自举：每个选项的 label 都走 t()，保证切换即更新） */
const languageList = computed(() =>
  AVAILABLE_LOCALES.map((code) => ({
    value: code,
    label: t(`header.languageOptions.${code}`),
  }))
);

/** 对比当前 locale，避免 Template 中 TS 断言污染 */
function isCurrentLocale(code: LocaleCode): boolean {
  return String(localeRef.value) === String(code);
}

/** 把 locale 同步到 <html>，对 SEO / 屏幕阅读器友好 */
function applyDocumentLocale(lang: LocaleCode) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr";
}

// 1) 启动时：若持久化了 language → 同时同步到 i18n.locale（防止 store 与 i18n 不一致）
const initialLocale: LocaleCode = normalizeLocale(
  String(globalStore.language || localeRef.value || "en")
);
localeRef.value = initialLocale;
if (String(globalStore.language) !== initialLocale) {
  globalStore.setGlobalState("language", initialLocale as LanguageType);
}
applyDocumentLocale(initialLocale);

// 2) 持续双向同步：i18n.locale 变更 -> 同步到 store + document（外部调用者也能改 locale）
watch(localeRef, (nextRaw) => {
  const next = normalizeLocale(String(nextRaw));
  if (String(localeRef.value) !== next) localeRef.value = next;
  if (String(globalStore.language) !== next) {
    globalStore.setGlobalState("language", next as LanguageType);
  }
  applyDocumentLocale(next);
});

// 3) 监听 store.language 变化（如外部直接改 globalStore）→ 反推 i18n.locale
watch(
  () => globalStore.language,
  (raw) => {
    if (!raw) return;
    const next = normalizeLocale(String(raw));
    if (String(localeRef.value) !== next) localeRef.value = next;
  }
);

/** 用户点击下拉切换 */
function changeLanguage(lang: string) {
  const next = normalizeLocale(lang);
  localeRef.value = next;
}
</script>
