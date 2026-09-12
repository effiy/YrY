import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useGlobalStore } from "@/stores/modules/global";

describe("useTheme", () => {
  beforeEach(() => {
    // Reset Pinia for each test
    const pinia = createPinia();
    setActivePinia(pinia);

    // Reset DOM
    const html = document.documentElement;
    html.removeAttribute("data-theme");
    html.removeAttribute("class");
    html.style.cssText = "";
    localStorage.clear();

    // Reset matchMedia mock to light mode default
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-color-scheme: dark)" ? false : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  describe("initTheme", () => {
    it("sets data-theme to light by default", () => {
      const { initTheme } = useTheme();
      initTheme();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("sets data-theme to dark when isDark is true (legacy compat)", () => {
      const store = useGlobalStore();
      // Simulate legacy state: isDark=true but themeMode still default "light"
      store.setGlobalState("isDark", true);
      expect(store.themeMode).toBe("light"); // default
      const { initTheme } = useTheme();
      initTheme();
      // initTheme should upgrade themeMode from the legacy isDark flag
      expect(store.themeMode).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("resolves auto mode from system preference", () => {
      // Mock system dark preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
          matches: query === "(prefers-color-scheme: dark)" ? true : false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      });

      const store = useGlobalStore();
      store.setGlobalState("themeMode", "auto");
      const { initTheme } = useTheme();
      initTheme();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  describe("setThemeMode", () => {
    it("switches to dark mode", () => {
      const store = useGlobalStore();
      const { setThemeMode } = useTheme();
      setThemeMode("dark");
      expect(store.themeMode).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("switches to light mode", () => {
      const store = useGlobalStore();
      store.setGlobalState("isDark", true);
      const { setThemeMode } = useTheme();
      setThemeMode("light");
      expect(store.themeMode).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("switches to auto mode", () => {
      const { setThemeMode } = useTheme();
      setThemeMode("auto");
      expect(useGlobalStore().themeMode).toBe("auto");
    });
  });

  describe("toggleTheme", () => {
    it("toggles from light to dark", () => {
      const store = useGlobalStore();
      store.setGlobalState("themeMode", "light");
      const { toggleTheme } = useTheme();
      toggleTheme();
      expect(store.themeMode).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("toggles from dark to light", () => {
      const store = useGlobalStore();
      store.setGlobalState("themeMode", "dark");
      const { toggleTheme } = useTheme();
      toggleTheme();
      expect(store.themeMode).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("auto mode: toggles to opposite of current system preference", () => {
      // System prefers light → toggle should set dark
      const store = useGlobalStore();
      store.setGlobalState("themeMode", "auto");
      const { toggleTheme } = useTheme();
      toggleTheme();
      expect(store.themeMode).toBe("dark");
    });
  });

  describe("resolveIsDark", () => {
    it("returns false for light mode", () => {
      useGlobalStore().setGlobalState("themeMode", "light");
      const { resolveIsDark } = useTheme();
      expect(resolveIsDark()).toBe(false);
    });

    it("returns true for dark mode", () => {
      useGlobalStore().setGlobalState("themeMode", "dark");
      const { resolveIsDark } = useTheme();
      expect(resolveIsDark()).toBe(true);
    });

    it("returns system preference for auto mode", () => {
      // Default mock: prefers-color-scheme is not dark
      useGlobalStore().setGlobalState("themeMode", "auto");
      const { resolveIsDark } = useTheme();
      expect(resolveIsDark()).toBe(false);
    });
  });

  describe("switchDark", () => {
    it("sets data-theme and Element Plus compat class synchronously", () => {
      const store = useGlobalStore();
      store.setGlobalState("themeMode", "dark");
      const { switchDark } = useTheme();
      switchDark();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(store.isDark).toBe(true);
    });
  });
});