import { defineStore } from "pinia";
import { ref } from "vue";
import { DEFAULT_PRIMARY } from "@/config";
import piniaPersistConfig from "@/stores/helper/persist";

export const useGlobalStore = defineStore(
  "yivad-global",
  () => {
    const layout = ref<"vertical" | "classic" | "transverse" | "columns">("vertical");
    const assemblySize = ref<"large" | "default" | "small">("default");
    const language = ref<"zh" | "en" | null>(null);
    const maximize = ref(false);
    const primary = ref(DEFAULT_PRIMARY);
    const isDark = ref(false);
    const themeMode = ref<"light" | "dark" | "auto">("light");
    const isGrey = ref(false);
    const isWeak = ref(false);
    const asideInverted = ref(false);
    const headerInverted = ref(false);
    const isCollapse = ref(false);
    const accordion = ref(true);
    const watermark = ref(false);
    const breadcrumb = ref(true);
    const breadcrumbIcon = ref(true);
    const tabs = ref(true);
    const tabsIcon = ref(true);
    const footer = ref(true);

    const _stateMap: Record<string, any> = {
      layout, assemblySize, language, maximize, primary, isDark, themeMode,
      isGrey, isWeak, asideInverted, headerInverted, isCollapse, accordion,
      watermark, breadcrumb, breadcrumbIcon, tabs, tabsIcon, footer,
    };

    function setGlobalState(...args: [string, any]) {
      const [key, value] = args;
      const target = _stateMap[key];
      if (target) target.value = value;
    }

    return {
      layout, assemblySize, language, maximize, primary, isDark, themeMode,
      isGrey, isWeak, asideInverted, headerInverted, isCollapse, accordion,
      watermark, breadcrumb, breadcrumbIcon, tabs, tabsIcon, footer,
      setGlobalState,
    };
  },
  { persist: piniaPersistConfig("yivad-global") }
);
