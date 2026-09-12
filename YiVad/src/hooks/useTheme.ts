import { storeToRefs } from "pinia";
import { Theme } from "./interface";
import { ElMessage } from "element-plus";
import { DEFAULT_PRIMARY } from "@/config";
import { useGlobalStore } from "@/stores/modules/global";
import { getLightColor, getDarkColor } from "@/utils/color";
import { menuTheme } from "@/styles/theme/menu";
import { asideTheme } from "@/styles/theme/aside";
import { headerTheme } from "@/styles/theme/header";

export type ThemeMode = Theme.ThemeModeType;

/**
 * @description Global theme hooks
 * */
export const useTheme = () => {
  const globalStore = useGlobalStore();
  const { primary, isDark, isGrey, isWeak, layout, asideInverted, headerInverted } = storeToRefs(globalStore);

  function getSystemPreference(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function resolveIsDark(): boolean {
    switch (globalStore.themeMode) {
      case "dark":
        return true;
      case "light":
        return false;
      case "auto":
      default:
        return getSystemPreference() === "dark";
    }
  }

  // Switch dark mode ==> also update theme color, sidebar, and header color
  const switchDark = () => {
    const html = document.documentElement as HTMLElement;
    const effectiveDark = resolveIsDark();

    // Apply theme immediately (synchronous — correctness first)
    if (effectiveDark) {
      html.setAttribute("data-theme", "dark");
      html.classList.add("dark"); // Element Plus built-in dark CSS compat
    } else {
      html.setAttribute("data-theme", "light");
      html.classList.remove("dark");
    }

    globalStore.setGlobalState("isDark", effectiveDark);
    changePrimary(primary.value);
    setAsideTheme();
    setHeaderTheme();

    // Transition animation (deferred — cosmetic only)
    html.classList.add("theme-transitioning");
    requestAnimationFrame(() => {
      setTimeout(() => {
        html.classList.remove("theme-transitioning");
      }, 300);
    });
  };

  // Change theme color
  const changePrimary = (val: string | null) => {
    if (!val) {
      val = DEFAULT_PRIMARY;
      ElMessage({ type: "success", message: `Theme color reset to ${DEFAULT_PRIMARY}` });
    }
    const effectiveDark = resolveIsDark();
    // Calculate theme color variations
    document.documentElement.style.setProperty("--el-color-primary", val);
    document.documentElement.style.setProperty(
      "--el-color-primary-dark-2",
      effectiveDark ? `${getLightColor(val, 0.2)}` : `${getDarkColor(val, 0.3)}`
    );
    for (let i = 1; i <= 9; i++) {
      const primaryColor = effectiveDark ? `${getDarkColor(val, i / 10)}` : `${getLightColor(val, i / 10)}`;
      document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, primaryColor);
    }
    globalStore.setGlobalState("primary", val);
  };

  // Set theme mode (light | dark | auto)
  const setThemeMode = (mode: ThemeMode) => {
    globalStore.setGlobalState("themeMode", mode);
    // When switching to a specific mode, also update isDark for compat
    if (mode === "dark") {
      globalStore.setGlobalState("isDark", true);
    } else if (mode === "light") {
      globalStore.setGlobalState("isDark", false);
    }
    // auto mode: let resolveIsDark determine based on system
    switchDark();
    setupAutoListener();
  };

  // Toggle between light and dark (convenience)
  const toggleTheme = () => {
    const currentMode = globalStore.themeMode;
    if (currentMode === "auto") {
      setThemeMode(resolveIsDark() ? "light" : "dark");
    } else {
      setThemeMode(currentMode === "light" ? "dark" : "light");
    }
  };

  // Toggle grayscale and weak mode
  const changeGreyOrWeak = (type: Theme.GreyOrWeakType, value: boolean) => {
    const body = document.body as HTMLElement;
    if (!value) return body.removeAttribute("style");
    const styles: Record<Theme.GreyOrWeakType, string> = {
      grey: "filter: grayscale(1)",
      weak: "filter: invert(80%)"
    };
    body.setAttribute("style", styles[type]);
    const propName = type === "grey" ? "isWeak" : "isGrey";
    globalStore.setGlobalState(propName, false);
  };

  // Set menu styles
  const setMenuTheme = () => {
    let type: Theme.ThemeType = "light";
    if (layout.value === "transverse" && headerInverted.value) type = "inverted";
    if (layout.value !== "transverse" && asideInverted.value) type = "inverted";
    if (resolveIsDark()) type = "dark";
    const theme = menuTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
  };

  // Set sidebar styles
  const setAsideTheme = () => {
    let type: Theme.ThemeType = "light";
    if (asideInverted.value) type = "inverted";
    if (resolveIsDark()) type = "dark";
    const theme = asideTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
    setMenuTheme();
  };

  // Set header styles
  const setHeaderTheme = () => {
    let type: Theme.ThemeType = "light";
    if (headerInverted.value) type = "inverted";
    if (resolveIsDark()) type = "dark";
    const theme = headerTheme[type!];
    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }
    setMenuTheme();
  };

  // Auto mode: listen for system preference changes
  let mediaQuery: MediaQueryList | null = null;

  const setupAutoListener = () => {
    if (typeof window === "undefined") return;
    if (!mediaQuery) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    }
    // Use a stable handler reference so we don't accumulate listeners
    const handler = (e: MediaQueryListEvent) => {
      if (globalStore.themeMode === "auto") {
        globalStore.setGlobalState("isDark", e.matches);
        switchDark();
      }
    };
    mediaQuery.removeEventListener("change", handler);
    mediaQuery.addEventListener("change", handler);
  };

  // init theme
  const initTheme = () => {
    // Backward compat: upgrade legacy isDark-only state to themeMode
    if (globalStore.isDark && globalStore.themeMode === "light") {
      globalStore.setGlobalState("themeMode", "dark");
    }

    // Resolve effective dark state from themeMode (may be auto)
    const effectiveDark = resolveIsDark();
    globalStore.setGlobalState("isDark", effectiveDark);

    const html = document.documentElement as HTMLElement;
    html.setAttribute("data-theme", effectiveDark ? "dark" : "light");
    if (effectiveDark) html.classList.add("dark");
    else html.classList.remove("dark");

    changePrimary(primary.value);
    setAsideTheme();
    setHeaderTheme();

    if (isGrey.value) changeGreyOrWeak("grey", true);
    if (isWeak.value) changeGreyOrWeak("weak", true);

    setupAutoListener();
  };

  return {
    initTheme,
    switchDark,
    changePrimary,
    changeGreyOrWeak,
    setAsideTheme,
    setHeaderTheme,
    setThemeMode,
    toggleTheme,
    resolveIsDark
  };
};