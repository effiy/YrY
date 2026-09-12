import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { CHART_THEMES, type ChartThemeConfig } from "@/utils/chart/themes";

export const useChartThemeStore = defineStore("chartTheme", () => {
  const currentThemeKey = ref<string>("default");
  const customThemes = ref<Record<string, ChartThemeConfig>>({});

  const currentTheme = computed<ChartThemeConfig>(() => {
    return customThemes.value[currentThemeKey.value] ?? CHART_THEMES[currentThemeKey.value] ?? CHART_THEMES.default;
  });

  const presetThemes = computed(() => Object.entries(CHART_THEMES).map(([key, t]) => ({
    key,
    name: t.name,
    isActive: key === currentThemeKey.value && !customThemes.value[key],
  })));

  function setTheme(key: string) {
    currentThemeKey.value = key;
  }

  function addCustomTheme(key: string, config: ChartThemeConfig) {
    customThemes.value = { ...customThemes.value, [key]: config };
    currentThemeKey.value = key;
  }

  function removeCustomTheme(key: string) {
    const next = { ...customThemes.value };
    delete next[key];
    customThemes.value = next;
    if (currentThemeKey.value === key) {
      currentThemeKey.value = "default";
    }
  }

  return {
    currentThemeKey,
    currentTheme,
    presetThemes,
    customThemes,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
  };
});