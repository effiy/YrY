import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { DEFAULT_PRIMARY } from "@/config";
import piniaPersistConfig from "@/stores/helper/persist";
import { useWatermarkStore } from "@/stores/modules/watermark";

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
    /**
     * @deprecated 2026-10 Phase 2 重构：水印主开关收敛到 stores/modules/watermark（enabled = globalForced || userEnabled）。
     * 本字段保持为「视图层的用户侧开关」并通过双向桥接与 useWatermarkStore().userEnabled 同步，
     * 目的是：
     *   1) 旧的 setGlobalState("watermark", bool) 写入 / ThemeDrawer 读取仍然 100% 可用；
     *   2) 不再重复持有「同一份用户开关状态」，彻底消除 global.ts 与 watermark.ts 的双份状态漂移；
     *   3) globalForced（强制水印）不受本字段影响，优先级高于 user。
     */
    const watermark = computed({
      get: () => useWatermarkStore().userEnabled,
      set: (v: boolean) => useWatermarkStore().toggleUser(v)
    });
    const breadcrumb = ref(true);
    const breadcrumbIcon = ref(true);
    const tabs = ref(true);
    const tabsIcon = ref(true);
    const footer = ref(true);

    const _stateMap: Record<string, any> = {
      layout,
      assemblySize,
      language,
      maximize,
      primary,
      isDark,
      themeMode,
      isGrey,
      isWeak,
      asideInverted,
      headerInverted,
      isCollapse,
      accordion,
      // watermark 是 computed（非 Ref），跳过直接赋值（通过 setter 正常生效）
      breadcrumb,
      breadcrumbIcon,
      tabs,
      tabsIcon,
      footer
    };

    // 兼容旧端（直接通过 Pinia 实例写 store.$state.watermark 绕过 setter 的反序列化路径）：
    // 每次 watermark 本地持久化恢复后，再把值写回 watermark store，确保两份状态单向收敛。
    watch(
      watermark,
      v => {
        const ws = useWatermarkStore();
        if (ws.userEnabled !== v) ws.toggleUser(v);
      },
      { flush: "sync" }
    );

    function setGlobalState(...args: [string, any]) {
      const [key, value] = args;
      if (key === "watermark") {
        useWatermarkStore().toggleUser(Boolean(value));
        return;
      }
      const target = _stateMap[key];
      if (target) target.value = value;
    }

    return {
      layout,
      assemblySize,
      language,
      maximize,
      primary,
      isDark,
      themeMode,
      isGrey,
      isWeak,
      asideInverted,
      headerInverted,
      isCollapse,
      accordion,
      watermark,
      breadcrumb,
      breadcrumbIcon,
      tabs,
      tabsIcon,
      footer,
      setGlobalState
    };
  },
  { persist: piniaPersistConfig("yivad-global") }
);
