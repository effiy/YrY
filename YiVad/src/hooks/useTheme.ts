/**
 * Global theme hook — YiVad 应用主题控制器。
 *
 * ## 职责
 * - 维护用户主题偏好（light / dark / auto）
 * - 将设计 tokens 应用到 `document.documentElement`
 * - 同步 Element Plus 主色与衍生色阶
 * - 监听系统主题偏好（auto 模式）
 *
 * ## 设计原则
 * - **响应式优先**：所有副作用通过 Pinia store + watcher 触发，组件订阅即可
 * - **纯函数核心**：`buildBrandTokens`、`resolveThemeType`、`resolveIsDark` 等
 *   是纯函数，无副作用，便于测试
 * - **修复历史 bug**：
 *   - `changeGreyOrWeak` 中的 propName 互换错误已修复
 *   - `setupAutoListener` 使用稳定的 handler 引用，避免监听器累积
 *   - `setMenuTheme` 不再被 `setAsideTheme` / `setHeaderTheme` 隐式重复调用
 */

import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import type { Theme } from "./interface";
import { useGlobalStore } from "@/stores/modules/global";
import { DEFAULT_PRIMARY } from "@/config";
import { isValidHex, lighten, darken, type HexColor } from "@/utils/color";
import { themeTokens, type ThemeTokens } from "@/styles/theme/tokens";

export type ThemeMode = Theme.ThemeModeType;

// ── 纯函数工具 ───────────────────────────────────────────────────────────

/**
 * 根据布局 + 反色偏好 + 实际明暗状态，解析最终主题家族。
 */
export function resolveThemeType(
  isDark: boolean,
  inverted: boolean,
  layoutIsTransverse: boolean,
): Theme.ThemeType {
  if (isDark) return "dark";
  if ((layoutIsTransverse && inverted) || (!layoutIsTransverse && inverted)) return "inverted";
  return "light";
}

/**
 * 根据 brand主色 + 明暗状态生成 Element Plus 颜色变量集。
 * 直接消费颜色工具函数，无副作用。
 */
export function buildBrandTokens(primary: HexColor, isDark: boolean): Record<string, string> {
  const variant = isDark ? "lighten" : "darken";
  const transform = isDark ? lighten : darken;
  const step = (amount: number): string => transform(primary, amount) ?? primary;

  return {
    "--el-color-primary": primary,
    "--el-color-primary-dark-2": isDark ? step(0.05) : step(0.3),
    "--el-color-primary-light-1": step(0.1),
    "--el-color-primary-light-3": step(isDark ? 0.4 : 0.3),
    "--el-color-primary-light-5": step(isDark ? 0.55 : 0.5),
    "--el-color-primary-light-7": step(isDark ? 0.7 : 0.7),
    "--el-color-primary-light-8": step(isDark ? 0.8 : 0.8),
    "--el-color-primary-light-9": step(isDark ? 0.9 : 0.9),
  };
}

// ── 系统主题监听 ──────────────────────────────────────────────────────────

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * 每次调用都重新解析 MediaQueryList，避免在 SSR、单测或动态改写
 * `window.matchMedia` 的环境（mock）中读到陈旧对象。
 */
function getSystemMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  return window.matchMedia(MEDIA_QUERY);
}

/** 稳定的 system change handler 引用（避免 addEventListener 累积）。 */
let onSystemThemeChange: ((e: MediaQueryListEvent) => void) | null = null;
let attachedMediaQuery: MediaQueryList | null = null;

/**
 * 注册系统主题变化监听器。返回卸载函数。
 *
 * 旧实现的问题：每次调用都新建一个 handler 闭包，调用
 * `removeEventListener(handler)` 时旧 handler 引用已丢失，导致
 * 监听器累积。本实现使用模块级稳定的 handler 引用。
 */
function setupAutoListener(onChange: (isDark: boolean) => void): () => void {
  const mediaQuery = getSystemMediaQuery();
  if (!mediaQuery) return () => undefined;

  // 卸载旧 handler（使用稳定引用）
  if (attachedMediaQuery && onSystemThemeChange) {
    attachedMediaQuery.removeEventListener("change", onSystemThemeChange);
  }

  // 注册新 handler 并保存引用
  onSystemThemeChange = (e: MediaQueryListEvent) => onChange(e.matches);
  mediaQuery.addEventListener("change", onSystemThemeChange);
  attachedMediaQuery = mediaQuery;

  return () => {
    if (attachedMediaQuery && onSystemThemeChange) {
      attachedMediaQuery.removeEventListener("change", onSystemThemeChange);
      onSystemThemeChange = null;
      attachedMediaQuery = null;
    }
  };
}

// ── 主 hook ──────────────────────────────────────────────────────────────

export const useTheme = () => {
  const globalStore = useGlobalStore();
  const { primary, isDark, isGrey, isWeak, layout, asideInverted, headerInverted } =
    storeToRefs(globalStore);

  /** 当前系统是否偏好深色（仅在浏览器环境可用）。 */
  function getSystemIsDark(): boolean {
    return Boolean(getSystemMediaQuery()?.matches);
  }

  /**
   * 根据当前 themeMode 解析"实际生效"的明暗状态。
   * - 'light' / 'dark' 直接返回
   * - 'auto' 走系统偏好
   */
  function resolveIsDark(): boolean {
    switch (globalStore.themeMode) {
      case "dark":
        return true;
      case "light":
        return false;
      case "auto":
      default:
        return getSystemIsDark();
    }
  }

  /** 将 tokens 写入 documentElement；返回注入的变量个数。 */
  function applyTokensToRoot(tokens: Record<string, string>): number {
    const root = document.documentElement;
    let count = 0;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
      count++;
    }
    return count;
  }

  /** 应用主题家族 tokens（menu/aside/header）。 */
  function applyThemeTokens(type: Theme.ThemeType): void {
    applyTokensToRoot(themeTokens[type] as Record<string, string>);
  }

  /** 应用 Element Plus 主色阶（基于当前 primary + 明暗状态）。 */
  function applyBrand(primaryColor: string, isDarkMode: boolean): void {
    if (!isValidHex(primaryColor)) {
      // eslint-disable-next-line no-console
      console.warn(`[useTheme] Invalid primary color: ${primaryColor}`);
      return;
    }
    const tokens = buildBrandTokens(primaryColor as HexColor, isDarkMode);
    applyTokensToRoot(tokens);
  }

  /** 设置灰度 / 弱色（无障碍模式）。修复了 propName 互换 bug。 */
  function applyGreyOrWeak(type: Theme.GreyOrWeakType, enabled: boolean): void {
    const body = document.body as HTMLElement;
    if (!enabled) {
      body.style.filter = "";
      return;
    }
    const filter = type === "grey" ? "grayscale(1)" : "invert(80%)";
    body.style.filter = filter;
  }

  /** 切换 data-theme 与 Element Plus 暗色 class。 */
  function syncRootClass(dark: boolean): void {
    const html = document.documentElement as HTMLElement;
    html.setAttribute("data-theme", dark ? "dark" : "light");
    html.classList.toggle("dark", dark);
  }

  /**
   * 主切换：明暗模式变更。
   * 同步更新 data-theme、Element Plus 主色与各区主题。
   */
  function switchDark(): void {
    const effectiveDark = resolveIsDark();

    // 1. data-theme + class（同步，先于其他副作用）
    syncRootClass(effectiveDark);

    // 2. 持久化到 store
    globalStore.setGlobalState("isDark", effectiveDark);

    // 3. Element Plus 主色阶
    applyBrand(primary.value, effectiveDark);

    // 4. menu / aside / header 主题 tokens
    applyRegionThemes(effectiveDark);

    // 5. 切换过渡动画（装饰性，延迟处理）
    document.documentElement.classList.add("theme-transitioning");
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 300);
    });
  }

  /**
   * 一次性应用 menu / aside / header 的主题 tokens。
   * 集中在一个函数内，避免之前 `setMenuTheme` 被多次重复调用。
   */
  function applyRegionThemes(effectiveDark: boolean): void {
    const menuType: Theme.ThemeType = effectiveDark
      ? "dark"
      : (layout.value === "transverse" && headerInverted.value)
        ? "inverted"
        : (layout.value !== "transverse" && asideInverted.value)
          ? "inverted"
          : "light";

    const asideType: Theme.ThemeType = effectiveDark
      ? "dark"
      : asideInverted.value
        ? "inverted"
        : "light";

    const headerType: Theme.ThemeType = effectiveDark
      ? "dark"
      : headerInverted.value
        ? "inverted"
        : "light";

    applyThemeTokens(menuType);
    // 由于 tokens 表中 menu 变量由 menu 主题负责写入，不再多次调用
    applyThemeTokens(asideType);
    applyThemeTokens(headerType);
  }

  /** 切换主题模式（light / dark / auto）。 */
  function setThemeMode(mode: ThemeMode): void {
    globalStore.setGlobalState("themeMode", mode);
    if (mode === "dark") globalStore.setGlobalState("isDark", true);
    else if (mode === "light") globalStore.setGlobalState("isDark", false);
    // auto: switchDark 会通过 resolveIsDark 读取最新系统偏好

    switchDark();
    setupAutoListener((matches) => {
      if (globalStore.themeMode === "auto") {
        globalStore.setGlobalState("isDark", matches);
        switchDark();
      }
    });
  }

  /** 在 light 与 dark 之间切换（auto 模式时基于系统偏好）。 */
  function toggleTheme(): void {
    const currentMode = globalStore.themeMode;
    if (currentMode === "auto") {
      setThemeMode(resolveIsDark() ? "light" : "dark");
    } else {
      setThemeMode(currentMode === "light" ? "dark" : "light");
    }
  }

  /** 改变主色。非法值重置为默认。 */
  function changePrimary(value: string | null): void {
    let next = value;
    if (!next || !isValidHex(next)) {
      next = DEFAULT_PRIMARY;
      ElMessage({
        type: "success",
        message: `Theme color reset to ${DEFAULT_PRIMARY}`,
      });
    }
    globalStore.setGlobalState("primary", next);
    applyBrand(next, resolveIsDark());
  }

  /** 切换灰度 / 弱色模式。已修复 propName 互换 bug。 */
  function changeGreyOrWeak(type: Theme.GreyOrWeakType, value: boolean): void {
    applyGreyOrWeak(type, value);
    // 同步对应的 store flag（type 与 store key 现在正确对应）
    const storeKey = type === "grey" ? "isGrey" : "isWeak";
    globalStore.setGlobalState(storeKey, value);
  }

  /** 初始化：在应用启动时调用一次。 */
  function initTheme(): void {
    // 旧数据升级：legacy isDark=true 但 themeMode=light 时升级为 dark
    if (globalStore.isDark && globalStore.themeMode === "light") {
      globalStore.setGlobalState("themeMode", "dark");
    }

    const effectiveDark = resolveIsDark();
    globalStore.setGlobalState("isDark", effectiveDark);
    syncRootClass(effectiveDark);

    applyBrand(primary.value, effectiveDark);
    applyRegionThemes(effectiveDark);

    // 恢复灰度 / 弱色
    if (isGrey.value) applyGreyOrWeak("grey", true);
    if (isWeak.value) applyGreyOrWeak("weak", true);

    // 注册系统主题监听
    setupAutoListener((matches) => {
      if (globalStore.themeMode === "auto") {
        globalStore.setGlobalState("isDark", matches);
        switchDark();
      }
    });
  }

  return {
    initTheme,
    switchDark,
    changePrimary,
    changeGreyOrWeak,
    setThemeMode,
    toggleTheme,
    resolveIsDark,
    /** 应用 menu/aside/header 主题 tokens。接受显式的明暗状态，便于在外部直接调用。 */
    applyRegionThemes,
  };
};

export type { ThemeTokens };