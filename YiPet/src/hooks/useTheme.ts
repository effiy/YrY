import { ref, readonly } from "vue";

/**
 * Shared theme composable — dark/light mode toggle.
 * Mirrors YiVad's useTheme hook.
 */
export function useTheme() {
  const isDark = ref(false);

  function toggleTheme() {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle("dark", isDark.value);
  }

  function setTheme(dark: boolean) {
    isDark.value = dark;
    document.documentElement.classList.toggle("dark", dark);
  }

  return {
    isDark: readonly(isDark),
    toggleTheme,
    setTheme
  };
}